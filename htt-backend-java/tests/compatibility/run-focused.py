"""Run a focused API acceptance batch against an explicitly recorded synthetic baseline."""
import argparse,hashlib,json,os,pathlib,shutil,subprocess,tarfile,time,uuid
here=pathlib.Path(__file__).resolve().parent
project=here.parent.parent
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--baseline-run',type=pathlib.Path,required=True)
p.add_argument('--case',choices=['batch','mail'],default='batch')
p.add_argument('--gst-basis',choices=['CASH','NON_CASH'],required=True)
p.add_argument('--jar',type=pathlib.Path,default=project/'target/htt-backend-java-0.1.0-SNAPSHOT.jar')
args=p.parse_args()
baseline=args.baseline_run.resolve();snapshot=baseline/'post-http.synthetic.pgdump'
assert (baseline/'PASSED').is_file(),'Requires an accepted full synthetic baseline'
assert snapshot.open('rb').read(5)==b'PGDMP'
native=baseline/'dotnet-baseline/src/Htt.Host.Api/bin/Debug/net10.0/Htt.Host.Api.dll'
assert native.is_file() and args.jar.is_file()
run=project/'target/focused-acceptance'/uuid.uuid4().hex
check=run/'htt-me-http';check.mkdir(parents=True)
shutil.copy2(here/('focused-'+args.case+'.py'),check/'check.py')
jar=run/'tested-app.jar';shutil.copy2(args.jar,jar)
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
paths=sorted(x for x in [project/'pom.xml']+list((project/'src').rglob('*'))+list(here.rglob('*')) if x.is_file() and '__pycache__' not in x.parts)
(run/'source-manifest.json').write_text(json.dumps({str(x.relative_to(project)):sha(x) for x in paths},indent=2)+'\n')
with tarfile.open(run/'source-and-fixtures.tar.gz','w:gz') as archive:
 for x in paths:archive.add(x,arcname=str(x.relative_to(project)))
(run/'metadata.json').write_text(json.dumps({'scope':'Focused API batch only; phase completion requires all gates','case':args.case,'gstBasis':args.gst_basis,'baseline':str(baseline),'baselineSnapshotSha256':sha(snapshot),'testedJarSha256':sha(jar),'nativeDllSha256':sha(native)},indent=2)+'\n')
docker=os.environ.get('HTT_COMPAT_DOCKER','/Users/chandler/.docker/bin/docker')
name='htt-java-focused-'+uuid.uuid4().hex[:12]
legacy=project.parent/'htt-backend'
if not legacy.exists():legacy=legacy.with_name('htt-backend-c#')
env=dict(os.environ,
 JAVA_HOME=os.environ.get('JAVA_HOME','/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home'),
 HTT_COMPAT_DOTNET=os.environ.get('HTT_COMPAT_DOTNET','/opt/homebrew/bin/dotnet'),
 HTT_COMPAT_JAR=str(jar),HTT_FOCUSED_NATIVE_DLL=str(native),HTT_FOCUSED_PG_CONTAINER=name,
 HTT_DOCUMENTS_MAIL_FROM='synthetic-sender@example.invalid' if args.case=='mail' else '',
 Documents__MailFrom='synthetic-sender@example.invalid' if args.case=='mail' else '',
 Documents__MailApiKey='',BankFeeds__Enabled='false',Geocoding__ApiKey='',CardOcr__ApiKey='',CardOcr__Endpoint='',
 Push__ProjectId='',Push__ClientEmail='',Push__PrivateKeyPem='')
def call(argv,**kw):return subprocess.run([str(x) for x in argv],check=True,timeout=300,**kw)
print('Focused evidence:',run,flush=True)
try:
 call([docker,'run','-d','--name',name,'-p','127.0.0.1::5432','-e','POSTGRES_USER=htt_owner','-e','POSTGRES_DB=htt_java_test','-e','POSTGRES_PASSWORD=local-owner-test','-e','HTT_APP_PASSWORD=local-app-test','-e','HTT_WORKER_PASSWORD=local-worker-test','-e','HTT_PORTAL_PASSWORD=local-portal-test','-v',str(legacy/'infra/init-db.sh')+':/docker-entrypoint-initdb.d/10-htt.sh:ro','postgres:17-alpine'])
 for _ in range(60):
  if subprocess.run([docker,'exec',name,'pg_isready','-U','htt_owner','-d','htt_java_test'],capture_output=True).returncode==0:break
  time.sleep(1)
 else:raise RuntimeError('Synthetic PostgreSQL not ready')
 with snapshot.open('rb') as stream:call([docker,'exec','-i',name,'pg_restore','-U','htt_owner','-d','htt_java_test','--clean','--if-exists','--exit-on-error','--single-transaction'],stdin=stream)
 basis=subprocess.check_output([docker,'exec',name,'psql','-U','htt_owner','-d','htt_java_test','-At','-c',"SELECT gst_basis FROM core.companies WHERE id='00000000-0000-0000-0000-000000000001'"]).decode().strip()
 assert basis==args.gst_basis,('Snapshot GST basis differs',basis,args.gst_basis)
 (run/'htt-java-me-db-port.txt').write_text(subprocess.check_output([docker,'port',name,'5432/tcp']).decode().strip())
 with (check/'parity.log').open('w') as log:call(['python3',check/'check.py'],env=env,stdout=log,stderr=log)
 with (run/'post-focused.synthetic.pgdump').open('wb') as stream:call([docker,'exec',name,'pg_dump','-U','htt_owner','-d','htt_java_test','--format=custom'],stdout=stream)
 (run/'post-focused.synthetic.pgdump.sha256').write_text(sha(run/'post-focused.synthetic.pgdump')+'\n')
 (run/'FOCUSED_PASSED').write_text('Focused '+args.case+' API batch passed on '+basis+'. Does not constitute all phase acceptance.\n')
 print('PASS: focused '+args.case+' '+basis,flush=True)
finally:
 subprocess.run([docker,'rm','-f','-v',name],timeout=60)
