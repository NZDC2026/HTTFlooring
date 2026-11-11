-- Review the frozen mail body and attachment identity before explicit queue confirmation.
DO $migration$ DECLARE body text;BEGIN
 body:=pg_get_functiondef('accounting.reminder_batch_view(uuid)'::regprocedure);
 body:=replace(body,$old$'subject',subject,'status',state$old$,$new$'subject',subject,'text',message,'attachment',jsonb_build_object('filename',id::text||'.pdf','contentType','application/pdf','title',pdf_snapshot->>'title','number',pdf_snapshot->>'number'),'status',state$new$);
 EXECUTE body;
END $migration$;
