import pathlib,subprocess,os,time,uuid,json,hashlib
r=pathlib.Path(__file__).resolve().parents[3];d=os.environ.get('DOCKER','docker');name='htt-java-migrations-'+uuid.uuid4().hex[:12]
out=r/'htt-backend-java/target/stage4/migration'/uuid.uuid4().hex;out.mkdir(parents=True)
def run(args,**kw):return subprocess.run(list(map(str,args)),check=True,timeout=240,**kw)
def sql(text):return run([d,'exec','-i',name,'psql','-U','htt_owner','-d','htt_java_test','-At','-v','ON_ERROR_STOP=1'],input=text,text=True,capture_output=True).stdout.strip()
try:
 run([d,'run','-d','--name',name,'-p','127.0.0.1::5432','-e','POSTGRES_USER=htt_owner','-e','POSTGRES_DB=htt_java_test','-e','POSTGRES_PASSWORD=local-owner-test','-e','HTT_APP_PASSWORD=local-app-test','-e','HTT_WORKER_PASSWORD=local-worker-test','-e','HTT_PORTAL_PASSWORD=local-portal-test','-v',str(r/'htt-backend-java/infra/init-db.sh')+':/docker-entrypoint-initdb.d/10-htt.sh:ro','postgres:17-alpine'],capture_output=True)
 for _ in range(90):
  if subprocess.run([d,'exec',name,'pg_isready','-h','127.0.0.1','-U','htt_owner','-d','htt_java_test'],capture_output=True).returncode==0:break
  time.sleep(1)
 port=run([d,'port',name,'5432'],text=True,capture_output=True).stdout.strip().split(':')[-1]
 env=dict(os.environ);env.update(HTT_PROCESS_MODE='migrate',HTT_MIGRATION_DATABASE_URL='jdbc:postgresql://127.0.0.1:'+port+'/htt_java_test',HTT_MIGRATION_DATABASE_PASSWORD='local-owner-test')
 command=[str(pathlib.Path(os.environ['JAVA_HOME'])/'bin/java'),'-jar',str(r/'htt-backend-java/target/htt-backend-java-0.1.0-SNAPSHOT.jar')]
 for i in range(2):
  with (out/('migration-'+str(i)+'.log')).open('w') as f:run(command,env=env,stdout=f,stderr=subprocess.STDOUT)
 assert sql('select count(*) from public.htt_schema_history')=='56'
 assert sql("select has_column_privilege('htt_app','sales.order_lines','id','UPDATE')")=='t'
 assert sql("select has_column_privilege('htt_app','sales.order_lines','quantity','UPDATE')")=='f'
 result={'status':'PASSED','migrations':56,'idempotentRerun':True,'legacySqlUnchanged':True}
 for f in ((r/'htt-backend' if (r/'htt-backend').exists() else r/'htt-backend-c#')/'src/Htt.Infrastructure/Database/Migrations').glob('*.sql'):assert f.read_bytes()==(r/'htt-backend-java/src/main/resources/db/migration'/f.name).read_bytes()
 (out/'acceptance.json').write_text(json.dumps(result,indent=2));print('MIGRATION_PASSED',out)
finally:subprocess.run([d,'rm','-f','-v',name],capture_output=True,timeout=60)
