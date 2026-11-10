import pathlib,subprocess,time,uuid,os,json,hashlib
r=pathlib.Path(__file__).resolve().parents[3];project=r/'htt-backend-java'
out=project/'target/stage4/documents'/uuid.uuid4().hex;out.mkdir(parents=True)
docker=os.environ.get('DOCKER','docker');name='htt-java-worker-'+uuid.uuid4().hex[:12]
env=dict(os.environ);env['JAVA_HOME']=os.environ['JAVA_HOME']
def call(args,**kw):return subprocess.run(list(map(str,args)),check=True,timeout=240,**kw)
def sql(text):return call([docker,'exec','-i',name,'psql','-U','htt_owner','-d','htt_java_test','-At','-v','ON_ERROR_STOP=1'],input=text,text=True,capture_output=True).stdout.strip()
try:
 call([docker,'run','-d','--name',name,'-p','127.0.0.1::5432','-e','POSTGRES_USER=htt_owner','-e','POSTGRES_DB=htt_java_test','-e','POSTGRES_PASSWORD=local-owner-test','-e','HTT_APP_PASSWORD=local-app-test','-e','HTT_WORKER_PASSWORD=local-worker-test','-e','HTT_PORTAL_PASSWORD=local-portal-test','-v',str(r/'htt-backend-java/infra/init-db.sh')+':/docker-entrypoint-initdb.d/10-htt.sh:ro','postgres:17-alpine'],capture_output=True)
 for _ in range(90):
  if subprocess.run([docker,'exec',name,'pg_isready','-h','127.0.0.1','-U','htt_owner','-d','htt_java_test'],capture_output=True).returncode==0:break
  time.sleep(1)
 snapshot=pathlib.Path(os.environ['HTT_SYNTHETIC_SNAPSHOT'])
 with snapshot.open('rb') as f:call([docker,'exec','-i',name,'pg_restore','-U','htt_owner','-d','htt_java_test','--clean','--if-exists','--exit-on-error','--single-transaction'],stdin=f,capture_output=True)
 port=call([docker,'port',name,'5432'],text=True,capture_output=True).stdout.strip().split(':')[-1]
 env.update(HTT_PROCESS_MODE='worker',HTT_WORKER_DATABASE_URL='jdbc:postgresql://127.0.0.1:'+port+'/htt_java_test',HTT_WORKER_DATABASE_PASSWORD='local-worker-test',HTT_PYTHON=os.environ.get('HTT_PYTHON','python3'))
 for k in list(env):
  if k.startswith(('HTT_MAIL_','HTT_CLAMAV_','HTT_PUSH_','HTT_GEOCODE_','HTT_CARD_OCR_','HTT_BANKFEEDS_')):env.pop(k,None)
 (out/'before.json').write_text(sql("select json_agg(x) from (select kind,state,count(*) from platform.document_jobs group by kind,state order by kind,state)x"))
 jar=project/'target/htt-backend-java-0.1.0-SNAPSHOT.jar'
 with (out/'worker.log').open('w') as log:
  proc=subprocess.Popen([env['JAVA_HOME']+'/bin/java','-jar',str(jar)],env=env,stdout=log,stderr=subprocess.STDOUT)
  try:
   for _ in range(90):
    if proc.poll() is not None:raise RuntimeError('Worker exited: '+str(proc.returncode))
    if sql("select count(*) from platform.document_jobs where kind in ('PDF','EXPORT') and state in ('QUEUED','PROCESSING','RETRY')")=='0':break
    time.sleep(1)
   else:raise RuntimeError('Document queues did not drain')
   time.sleep(2)
  finally:
   proc.terminate()
   try:proc.wait(timeout=45)
   except subprocess.TimeoutExpired:proc.kill();proc.wait();raise
 (out/'after.json').write_text(sql("select json_agg(x) from (select kind,state,last_error,count(*) from platform.document_jobs group by kind,state,last_error order by kind,state)x"))
 result=json.loads((out/'after.json').read_text())
 assert sum(x['count'] for x in result if x['kind']=='PDF' and x['state']=='SUCCEEDED')>=10,result
 assert sum(x['count'] for x in result if x['kind']=='EXPORT' and x['state']=='SUCCEEDED')>=10,result
 (out/'PASSED').write_text('Document PDF and CSV queue execution passed; no external sends\n')
 print('DOCUMENT_WORKER_PASSED',out,flush=True)
except Exception:
 print('FAILED EVIDENCE',out,flush=True);raise
finally:subprocess.run([docker,'rm','-f','-v',name],capture_output=True,timeout=60)
