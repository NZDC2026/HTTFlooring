import pathlib,subprocess,time,uuid,os,json,hashlib,urllib.request,urllib.error
root=pathlib.Path(__file__).resolve().parents[3];d=os.environ.get('DOCKER','docker');runid=uuid.uuid4().hex
out=root/'htt-backend-java/target/stage4/deployment'/runid;out.mkdir(parents=True)
network='htt-java-deploy-'+runid[:12];db=network+'-db';worker=network+'-worker';api=network+'-api';native=network+'-legacy';created=[]
def run(args,**kw):
 try:return subprocess.run(list(map(str,args)),check=True,timeout=240,**kw)
 except subprocess.CalledProcessError as e:
  (out/'last-command-error.txt').write_text(str(e)+'\n'+str(e.stderr or ''));raise
def start(name,image,args=None,env=None,ports=False):
 argv=[d,'run','-d','--name',name,'--network',network]
 if ports:argv+=['-p','127.0.0.1::8080']
 for key,val in (env or {}).items():argv+=['-e',key+'='+str(val)]
 argv+=[image]+(args or []);run(argv,capture_output=True);created.append(name)
def sql(text):return run([d,'exec','-i',db,'psql','-U','htt_owner','-d','htt_java_test','-At','-v','ON_ERROR_STOP=1'],input=text,text=True,capture_output=True).stdout.strip()
def health(name):
 code="""import urllib.request,urllib.error,json,time,sys
base='http://'+sys.argv[1]+':8080'
for _ in range(90):
 try:
  with urllib.request.urlopen(base+'/health/ready',timeout=3) as response:
   if response.status==200:break
 except OSError:pass
 time.sleep(1)
else:raise RuntimeError('API not ready')
assert json.load(urllib.request.urlopen(base+'/health/live'))=={'status':'live'}
try:urllib.request.urlopen(base+'/api/v1/me');raise AssertionError('Anonymous staff access allowed')
except urllib.error.HTTPError as e:assert e.code==401,e.code
print(json.dumps({'live':200,'ready':200,'anonymousStaff':401}))
"""
 return json.loads(run([d,'run','--rm','--network',network,'htt-java-baseline-tests:latest','python3','-c',code,name],text=True,capture_output=True).stdout)

try:
 run([d,'network','create','--internal',network],capture_output=True)
 run([d,'run','-d','--name',db,'--network',network,'-e','POSTGRES_USER=htt_owner','-e','POSTGRES_DB=htt_java_test','-e','POSTGRES_PASSWORD=local-owner-test','-e','HTT_APP_PASSWORD=local-app-test','-e','HTT_WORKER_PASSWORD=local-worker-test','-e','HTT_PORTAL_PASSWORD=local-portal-test','-v',str(root/'htt-backend-java/infra/init-db.sh')+':/docker-entrypoint-initdb.d/10-htt.sh:ro','postgres:17-alpine','postgres','-c','max_locks_per_transaction=256'],capture_output=True);created.append(db)
 for _ in range(90):
  if subprocess.run([d,'exec',db,'pg_isready','-h','127.0.0.1','-U','htt_owner','-d','htt_java_test'],capture_output=True).returncode==0:break
  time.sleep(1)
 migrationenv={'HTT_MIGRATION_DATABASE_URL':'jdbc:postgresql://'+db+':5432/htt_java_test','HTT_MIGRATION_DATABASE_PASSWORD':'local-owner-test'}
 # Forward migration must recognize the exact legacy history names and checksums.
 legacy_migration=run([d,'run','--rm','--network',network,'-e','HTT_MIGRATION_CONNECTION=Host='+db+';Database=htt_java_test;Username=htt_owner;Password=local-owner-test','htt-java-baseline-tests:latest','dotnet','/output/migrations/Htt.Host.Migrations.dll','migrate'],text=True,capture_output=True)
 (out/'legacy-migration.log').write_text(legacy_migration.stdout+legacy_migration.stderr)
 assert sql('select count(*) from public.htt_schema_history')=='55'
 for iteration in range(2):
  result=run([d,'run','--rm','--network',network,'-e','HTT_MIGRATION_DATABASE_URL='+migrationenv['HTT_MIGRATION_DATABASE_URL'],'-e','HTT_MIGRATION_DATABASE_PASSWORD=local-owner-test','htt-java-stage4-migrations:local'],text=True,capture_output=True)
  (out/('migration-'+str(iteration)+'.log')).write_text(result.stdout+result.stderr)
 assert sql('select count(*) from public.htt_schema_history')==str(len((root/'htt-backend-java/src/main/resources/db/migration/index.txt').read_text().splitlines()))
 sql('DROP TABLE public.htt_schema_history;')
 snapshot=pathlib.Path(os.environ['HTT_SYNTHETIC_SNAPSHOT'])
 with snapshot.open('rb') as f:run([d,'exec','-i',db,'pg_restore','-U','htt_owner','-d','htt_java_test','--clean','--if-exists','--exit-on-error','--single-transaction'],stdin=f,capture_output=True)
 apiEnv={'HTT_STAFF_DATABASE_URL':'jdbc:postgresql://'+db+':5432/htt_java_test','HTT_STAFF_DATABASE_PASSWORD':'local-app-test','HTT_PORTAL_DATABASE_URL':'jdbc:postgresql://'+db+':5432/htt_java_test','HTT_PORTAL_DATABASE_PASSWORD':'local-portal-test','HTT_STAFF_AUTHORITY':'https://synthetic.example.invalid','HTT_STAFF_AUDIENCE':'staff','SERVER_PORT':'8080'}
 start(api,'htt-java-stage4-api:local',env=apiEnv,ports=True);javahealth=health(api)
 start(worker,'htt-java-stage4-worker:local',env={'HTT_WORKER_DATABASE_URL':'jdbc:postgresql://'+db+':5432/htt_java_test','HTT_WORKER_DATABASE_PASSWORD':'local-worker-test'})
 for _ in range(90):
  if sql("select count(*) from platform.document_jobs where kind in ('PDF','EXPORT') and state in ('QUEUED','PROCESSING','RETRY')")=='0':break
  time.sleep(1)
 else:raise RuntimeError('Container document queue did not drain')
 (out/'document-results.json').write_text(sql("select json_agg(x) from (select kind,state,last_error,count(*) from platform.document_jobs group by kind,state,last_error order by kind,state)x"))
 assert sql("select count(*) from platform.document_jobs where kind='PDF' and state='SUCCEEDED'")=='10'
 assert sql("select count(*) from platform.document_jobs where kind='EXPORT' and state='SUCCEEDED'")=='10'
 run([d,'stop','--time','50',worker],capture_output=True)
 (out/'worker.log').write_text(run([d,'logs',worker],text=True,capture_output=True).stdout)
 assert run([d,'inspect',worker,'--format','{{.State.ExitCode}}'],text=True,capture_output=True).stdout.strip()=='143'

 # Inspect actual PDFs, including both report-pack families, not just the job state.
 payloads=json.loads(sql("select json_agg(json_build_object('id',j.id,'body',encode(f.body,'base64'),'number',j.payload->>'number')) from platform.document_jobs j join platform.file_contents f on f.file_id=j.output_file_id and f.company_id=j.company_id where j.kind='PDF' and j.state='SUCCEEDED'"))
 import base64
 for item in payloads:(out/(item['id']+'.pdf')).write_bytes(base64.b64decode(item['body']))
 parse="""import pathlib,sys,json
from pypdf import PdfReader
p=pathlib.Path(sys.argv[1]);result=[]
for f in p.glob('*.pdf'):
 reader=PdfReader(f);text=''.join(page.extract_text() or '' for page in reader.pages)
 assert len(reader.pages)>0 and len(text)>30
 result.append({'file':f.name,'pages':len(reader.pages),'textLength':len(text)})
assert len(result)==10
print(json.dumps(result))
"""
 parsed=run([os.environ.get('HTT_PDF_TEST_PYTHON','python3'),'-c',parse,out],text=True,capture_output=True)
 (out/'pdf-validation.json').write_text(parsed.stdout)
 # Verify fencing under the actual restricted role; roll back every synthetic mutation.
 target=sql("select id from platform.document_jobs where kind='PDF' and state='SUCCEEDED' order by id limit 1")
 fence=str(uuid.uuid4())
 sql("BEGIN; UPDATE platform.document_jobs SET state='PROCESSING',lease_token='"+fence+"',lease_until=now()+interval '1 minute' WHERE id='"+target+"'; SET LOCAL ROLE htt_worker; DO $$ BEGIN IF platform.finish_document_work('"+target+"',gen_random_uuid(),'FAILED','synthetic_stale_fence') THEN RAISE EXCEPTION 'Stale fence accepted'; END IF; END $$; RESET ROLE; UPDATE platform.document_jobs SET lease_until=now()-interval '1 second' WHERE id='"+target+"'; SET LOCAL ROLE htt_worker; DO $$ BEGIN IF platform.finish_document_work('"+target+"','"+fence+"','FAILED','synthetic_expired_fence') THEN RAISE EXCEPTION 'Expired lease accepted'; END IF; END $$; ROLLBACK;")
 # Real Java scanner protocol, clean and malware results, with internal fixtures only.
 scan=sql("select id from platform.document_jobs where kind='SCAN' and last_error='scanner_unconfigured' limit 1")
 assert scan
 scanner_code="""import socketserver,struct,sys
class Handler(socketserver.StreamRequestHandler):
 def handle(self):
  assert self.rfile.read(10)==b'zINSTREAM\\0'
  while True:
   raw=self.rfile.read(4)
   if len(raw)!=4:return
   length=struct.unpack('!I',raw)[0]
   if not length:break
   assert len(self.rfile.read(length))==length
  self.wfile.write(sys.argv[1].encode()+b'\\0')
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
Server(('0.0.0.0',3310),Handler).serve_forever()
"""
 for label,reply,expected in [('clean','stream: OK','SUCCEEDED'),('malware','stream: Eicar-Test-Signature FOUND','FAILED')]:
  clam=network+'-clam-'+label;w=network+'-scan-'+label
  start(clam,'htt-java-baseline-tests:latest',['python3','-u','-c',scanner_code,reply])
  sql("UPDATE platform.files SET state='PENDING' WHERE id=(SELECT (payload->>'fileId')::uuid FROM platform.document_jobs WHERE id='"+scan+"'); UPDATE platform.document_jobs SET state='QUEUED',attempts=0,available_at=now(),last_error=NULL WHERE id='"+scan+"';")
  start(w,'htt-java-stage4-worker:local',env={'HTT_WORKER_DATABASE_URL':'jdbc:postgresql://'+db+':5432/htt_java_test','HTT_WORKER_DATABASE_PASSWORD':'local-worker-test','HTT_CLAMAV_HOST':clam})
  for _ in range(40):
   state=sql("select state from platform.document_jobs where id='"+scan+"'")
   if state==expected:break
   time.sleep(1)
  else:raise RuntimeError('Scanner '+label+' did not complete: '+state)
  if label=='malware':
   assert sql("select last_error from platform.document_jobs where id='"+scan+"'")=='malware_detected'
   assert sql("select state from platform.files where id=(select (payload->>'fileId')::uuid from platform.document_jobs where id='"+scan+"')")=='REJECTED'
   assert sql("select result from platform.document_job_attempts where job_id='"+scan+"' order by started_at desc limit 1")=='REJECTED'
  run([d,'stop','--time','50',w],capture_output=True)
  (out/('scanner-'+label+'.json')).write_text(sql("select row_to_json(x) from (select state,last_error from platform.document_jobs where id='"+scan+"')x"))
 # Both runtimes are stopped before snapshot/rollback: no financial/document writers overlap.
 run([d,'stop','--time','20',api],capture_output=True)
 def fingerprint():return sql("select md5(string_agg(row_to_json(x)::text,',' order by id)) from (select * from platform.document_jobs order by id)x")
 before=fingerprint()
 # Original local .NET baseline image, no external configuration or production credentials.
 start(native,'htt-java-baseline-tests:latest',['dotnet','/output/api/Htt.Host.Api.dll'],env={'ASPNETCORE_ENVIRONMENT':'Development','ASPNETCORE_URLS':'http://+:8080','ConnectionStrings__Database':'Host='+db+';Database=htt_java_test;Username=htt_app;Password=local-app-test','ConnectionStrings__Portal':'Host='+db+';Database=htt_java_test;Username=htt_portal;Password=local-portal-test','Authentication__Authority':'https://synthetic.example.invalid','Authentication__Audience':'staff'},ports=True)
 nativehealth=health(native);assert before==fingerprint()
 run([d,'stop','--time','20',native],capture_output=True)
 # Local rollback removes only Java's extra row-lock privilege; original data and append-only rules remain.
 sql('REVOKE UPDATE(id) ON sales.order_lines FROM htt_app;')
 assert sql("select has_column_privilege('htt_app','sales.order_lines','id','UPDATE')")=='f'
 sql('GRANT UPDATE(id) ON sales.order_lines TO htt_app;')
 assert sql("select has_column_privilege('htt_app','sales.order_lines','quantity','UPDATE')")=='f'
 run([d,'start',api],capture_output=True);assert health(api)==javahealth;assert before==fingerprint()
 result={'status':'PASSED','network':'internal, isolated, disposable','javaApi':javahealth,'legacyRollbackApi':nativehealth,'migrationRepeatable':True,'legacyHistoryCompatible':True,'pdfRendered':10,'csvExported':10,'queuePreservedAcrossRollback':True,'grantRollbackVerified':True,'staleAndExpiredLeaseRejected':True,'scannerCleanAndMalwareVerified':True,'pdfTextVerified':10,'realSystemChanged':False}
 (out/'acceptance.json').write_text(json.dumps(result,indent=2));print('DEPLOYMENT_ROLLBACK_PASSED',out,flush=True)
except Exception:
 for name in created:
  try:(out/(name+'.log')).write_text(subprocess.run([d,'logs',name],text=True,capture_output=True).stdout+subprocess.run([d,'logs',name],text=True,capture_output=True).stderr)
  except Exception:pass
 print('FAILED_EVIDENCE',out,flush=True);raise
finally:
 for name in reversed(created):subprocess.run([d,'rm','-f','-v',name],capture_output=True,timeout=60)
 subprocess.run([d,'network','rm',network],capture_output=True,timeout=60)
