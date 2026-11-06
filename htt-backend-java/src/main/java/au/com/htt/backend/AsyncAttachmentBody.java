package au.com.htt.backend;

import jakarta.annotation.PreDestroy;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.async.DeferredResult;
import org.springframework.web.context.request.async.DeferredResultProcessingInterceptor;
import org.springframework.web.context.request.async.WebAsyncUtils;

@Component
class AsyncAttachmentBody {
    static final long SECOND=TimeUnit.SECONDS.toNanos(1);
    private final ScheduledThreadPoolExecutor timer=new ScheduledThreadPoolExecutor(1,task->{
        var thread=new Thread(task,"htt-upload-deadline");thread.setDaemon(true);return thread;
    });
    AsyncAttachmentBody() {timer.setRemoveOnCancelPolicy(true);}
    @PreDestroy void close() {timer.shutdownNow();}

    <T> DeferredResult<T> read(HttpServletRequest request,HttpServletResponse response,Function<byte[],T> complete) {
        var result=new DeferredResult<T>(45_000L);
        var done=new AtomicBoolean();
        var bytes=new AtomicLong();
        var body=new ByteArrayOutputStream();
        var tick=new java.util.concurrent.atomic.AtomicReference<ScheduledFuture<?>>();
        Runnable cancel=()->{var scheduled=tick.get();if (scheduled!=null) scheduled.cancel(false);};
        java.util.function.Consumer<Throwable> fail=error->{
            if (done.compareAndSet(false,true)) {
                cancel.run();response.setHeader("Connection","close");result.setErrorResult(error);
            }
        };
        result.onCompletion(cancel);
        result.onTimeout(()->fail.accept(deadline()));
        result.onError(fail);
        WebAsyncUtils.getAsyncManager(request).registerDeferredResultInterceptor("attachment-body",new DeferredResultProcessingInterceptor() {
            @Override public <V> void preProcess(NativeWebRequest webRequest,DeferredResult<V> ignored) throws Exception {
                long start=System.nanoTime();
                if (request.getContentLengthLong()>DocumentUpload.MAX_BYTES) {
                    fail.accept(new StaffScope.Failure(413,"file_too_large","Attachments are limited to 10 MiB."));return;
                }
                tick.set(timer.scheduleAtFixedRate(()->{
                    ReadFailure failure=check(System.nanoTime()-start,bytes.get());
                    if (failure!=null) fail.accept(failure);
                },1,1,TimeUnit.SECONDS));
                ServletInputStream input=request.getInputStream();
                input.setReadListener(new ReadListener() {
                    @Override public void onDataAvailable() throws java.io.IOException {
                        byte[] chunk=new byte[16*1024];
                        while (!done.get() && input.isReady() && !input.isFinished()) {
                            int count=input.read(chunk);
                            if (count<0) break;
                            if (count==0) return;
                            if (bytes.addAndGet(count)>DocumentUpload.MAX_BYTES) {
                                fail.accept(new StaffScope.Failure(413,"file_too_large","Attachments are limited to 10 MiB."));return;
                            }
                            body.write(chunk,0,count);
                            if (System.nanoTime()-start>=30*SECOND) {fail.accept(deadline());return;}
                        }
                    }
                    @Override public void onAllDataRead() {
                        if (System.nanoTime()-start>=30*SECOND) {fail.accept(deadline());return;}
                        if (done.compareAndSet(false,true)) {
                            cancel.run();
                            try {result.setResult(complete.apply(body.toByteArray()));}
                            catch (RuntimeException error) {result.setErrorResult(error);}
                        }
                    }
                    @Override public void onError(Throwable error) {fail.accept(invalid());}
                });
            }
        });
        return result;
    }

    static ReadFailure check(long elapsed,long bytes) {
        if (elapsed>=30*SECOND) return deadline();
        if (elapsed>5*SECOND && bytes<((elapsed-5*SECOND)*240)/SECOND) return invalid();
        return null;
    }
    private static ReadFailure invalid() {return new ReadFailure(400,"invalid_request","Invalid request body or parameters.");}
    private static ReadFailure deadline() {return new ReadFailure(500,"internal_error","The operation could not be completed.");}
    static final class ReadFailure extends RuntimeException {
        final int status;final String code;
        ReadFailure(int status,String code,String message) {super(message);this.status=status;this.code=code;}
    }
}
