package au.com.htt.backend;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class MailHeartbeatIsolationTest {
 @Test void busyDeliveryThreadsDoNotDelayEitherHeartbeat() throws Exception {
  var stop=new AtomicBoolean();var release=new CountDownLatch(1);var entered=new CountDownLatch(8);var beats=new CountDownLatch(2);
  var deliveries=Executors.newFixedThreadPool(8);ScheduledExecutorService heartbeats=null;
  try {
   for(int i=0;i<8;i++)deliveries.submit(()->{entered.countDown();try{release.await();}catch(InterruptedException e){Thread.currentThread().interrupt();}});
   assertTrue(entered.await(2,TimeUnit.SECONDS));
   heartbeats=WorkerMain.mailHeartbeatPool(stop,()->{assertEquals("htt-mail-heartbeat",Thread.currentThread().getName());beats.countDown();},beats::countDown);
   assertTrue(beats.await(2,TimeUnit.SECONDS),"Both readiness signals must run while delivery workers are occupied");
   assertEquals(1,release.getCount(),"The batch is still blocked when heartbeats complete");
  } finally {stop.set(true);release.countDown();deliveries.shutdownNow();if(heartbeats!=null)heartbeats.shutdownNow();}
 }
}
