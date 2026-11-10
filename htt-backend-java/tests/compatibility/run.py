"""Run synthetic Java/.NET compatibility checks against a disposable PostgreSQL."""
import argparse, os, pathlib, shutil, subprocess, time, uuid

source = pathlib.Path(__file__).resolve().parent
project = source.parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--legacy', type=pathlib.Path, default=project.parent/'htt-backend')
parser.add_argument('--flutter', type=pathlib.Path, default=project.parent/'htt_flooring_app')
parser.add_argument('--stalled-uploads', action='store_true', help='Also verify slow/incomplete uploads against legacy deadlines')
parser.add_argument('--gst-basis', choices=['NON_CASH','CASH'], default='NON_CASH', help='GST policy for the synthetic company')
parser.add_argument('--uploads-only', action='store_true', help='Run only attachment smoke/probes; never marks full-suite PASSED')
args = parser.parse_args()
if not args.legacy.exists():
    args.legacy = project.parent/'htt-backend-c#'
for directory in (args.legacy, args.flutter):
    if not directory.is_dir():
        raise SystemExit(f'Missing source directory: {directory}')
env = dict(os.environ)
env['HTT_COMPAT_GST_BASIS'] = args.gst_basis
env['HTT_COMPAT_UPLOAD_ONLY'] = '1' if args.uploads_only else '0'
if args.stalled_uploads:
    env['HTT_STALL_TEST'] = '1'
for key, executable in [('HTT_COMPAT_DOTNET','dotnet'),('HTT_COMPAT_FLUTTER','flutter')]:
    env[key] = env.get(key) or shutil.which(executable) or ''
    if not env[key]:
        raise SystemExit(f'Set {key} to the installed executable')
if not env.get('JAVA_HOME'):
    raise SystemExit('Set JAVA_HOME to JDK 21')
run = project/'target'/'compatibility'/uuid.uuid4().hex
run.mkdir(parents=True)
env.update(DOTNET_CLI_HOME=str(run/'dotnet-home'), NUGET_PACKAGES=str(run/'nuget'))
container = 'htt-java-compat-'+uuid.uuid4().hex[:12]
env['HTT_COMPAT_PG_CONTAINER'] = container

def command(argv, **kwargs):
    print('Running', ' '.join(map(str,argv)), flush=True)
    return subprocess.run(list(map(str,argv)),check=True,env=env,**kwargs)

def sql(path):
    with path.open('rb') as stream:
        command(['docker','exec','-i',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-1'],stdin=stream)

with (run/'run.log').open('w') as log:
    try:
        command(['docker','run','-d','--name',container,'-p','127.0.0.1::5432',
            '-e','POSTGRES_USER=htt_owner','-e','POSTGRES_DB=htt_java_test','-e','POSTGRES_PASSWORD=local-owner-test',
            '-e','HTT_APP_PASSWORD=local-app-test','-e','HTT_WORKER_PASSWORD=local-worker-test','-e','HTT_PORTAL_PASSWORD=local-portal-test',
            '-v',f'{args.legacy.resolve()}/infra/init-db.sh:/docker-entrypoint-initdb.d/10-htt.sh:ro','postgres:17-alpine'],stdout=log,stderr=log)
        for _ in range(90):
            ready = subprocess.run(['docker','exec',container,'pg_isready','-h','127.0.0.1','-U','htt_owner','-d','htt_java_test'],capture_output=True)
            if ready.returncode == 0:
                break
            time.sleep(1)
        else:
            raise RuntimeError('PostgreSQL did not become ready')
        port = subprocess.check_output(['docker','port',container,'5432'],text=True).strip()
        (run/'htt-java-me-db-port.txt').write_text(port)
        for migration in sorted((args.legacy/'src/Htt.Infrastructure/Database/Migrations').glob('*.sql')):
            sql(migration)
        fixtures = ['base','branches','product-and-second-company','pricing','order-stock','invoice-fixture',
            'receipt-fixture','dispatch-fixture','purchase-fixture','supplier-settlement-fixture','supplier-corrections-fixture','extra-fixture','ledger-other-company-fixture']
        for fixture in fixtures:
            sql(source/(fixture+'.sql'))
        sql(source/'legacy-short-pick-lock.sql')
        for migration in sorted((project/'src/main/resources/db/compatibility').glob('*.sql')):
            sql(migration)
        for migration in sorted((project/'src/main/resources/db/migration').glob('*.sql')):
            if migration.name >= '057_': sql(migration)
        command(['docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-c',
            f"BEGIN; SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true); UPDATE core.companies SET gst_basis='{args.gst_basis}' WHERE id='00000000-0000-0000-0000-000000000001'; COMMIT"],stdout=log,stderr=log)
        legacy = run/'dotnet-baseline'
        shutil.copytree(args.legacy,legacy,ignore=shutil.ignore_patterns('.git','bin','obj','node_modules'))
        for file in (legacy/'src/Htt.Host.Api').rglob('*.cs'):
            text = file.read_text()
            marker = 'options.MapInboundClaims'
            if marker in text:
                pin = '''if (Environment.GetEnvironmentVariable("HTT_FIXTURE_TLS_PIN") is string pin)
        options.BackchannelHttpHandler = new HttpClientHandler {
            ServerCertificateCustomValidationCallback = (request, certificate, _, _) =>
                request.RequestUri?.Host == "localhost" && certificate?.GetCertHashString() == pin };
    '''
                file.write_text(text.replace(marker,pin+marker))
        for host in ['Api','Worker','Migrations']:
            command([env['HTT_COMPAT_DOTNET'],'build',legacy/f'src/Htt.Host.{host}',
                '--disable-build-servers','-m:1','-p:UseSharedCompilation=false'],stdout=log,stderr=log)
        env['HTT_MIGRATION_CONNECTION'] = f'Host=127.0.0.1;Port={port.rsplit(":",1)[1]};Database=htt_java_test;Username=htt_owner;Password=local-owner-test'
        command([env['HTT_COMPAT_DOTNET'],legacy/'src/Htt.Host.Migrations/bin/Debug/net10.0/Htt.Host.Migrations.dll',
            'stock-valuation','--company','00000000-0000-0000-0000-000000000001','--warehouse','00000000-0000-0000-0000-000000000014',
            '--product','00000000-0000-0000-0000-000000000017','--value','10000','--reference','Synthetic valuation',
            '--issuer','https://localhost:15443','--subject','test-employee'],stdout=log,stderr=log)
        for product,value in [('00000000-0000-0000-0000-000000000270','1000'),('00000000-0000-0000-0000-000000000274','500'),('00000000-0000-0000-0000-000000000380','20.02'),('00000000-0000-0000-0000-000000000384','20.02'),('00000000-0000-0000-0000-000000000388','0')]:
            command([env['HTT_COMPAT_DOTNET'],legacy/'src/Htt.Host.Migrations/bin/Debug/net10.0/Htt.Host.Migrations.dll',
                'stock-valuation','--company','00000000-0000-0000-0000-000000000001','--warehouse','00000000-0000-0000-0000-000000000271',
                '--product',product,'--value',value,'--reference','Synthetic control valuation '+product,
                '--issuer','https://localhost:15443','--subject','test-employee'],stdout=log,stderr=log)
        flutter = run/'flutter-visit-baseline'
        shutil.copytree(args.flutter,flutter,ignore=shutil.ignore_patterns('.git','.dart_tool','build','.flutter-plugins-dependencies','Pods','.symlinks','.gradle','ephemeral'))
        shutil.copy2(source/'visit_real_backend_test.dart',flutter/'test/visit_real_backend_test.dart')
        command([env['HTT_COMPAT_FLUTTER'],'pub','get'],cwd=flutter,stdout=log,stderr=log)
        command(['mvn','-B','package'],cwd=project,stdout=log,stderr=log)
        env['HTT_COMPAT_JAR'] = str(project/'target/htt-backend-java-0.1.0-SNAPSHOT.jar')
        check = run/'htt-me-http'
        check.mkdir()
        shutil.copy2(source/'check.py',check/'check.py')
        shutil.copy2(project/'src/test/resources/ledger-fields-oracle.json',check/'ledger-fields-oracle.json')
        shutil.copy2(project/'src/test/resources/offset-query-oracle.json',check/'offset-query-oracle.json')
        with (check/'parity.log').open('w') as parity:
            try:
                command(['python3',check/'check.py'],stdout=parity,stderr=parity)
            except subprocess.CalledProcessError:
                # Synthetic state and exact executable remain inspectable even if an HTTP assertion fails.
                try:
                    with (run/'failure-http.synthetic.pgdump').open('wb') as snapshot:
                        command(['docker','exec',container,'pg_dump','-U','htt_owner','-d','htt_java_test','--format=custom'],stdout=snapshot,stderr=log)
                    shutil.copyfile(env['HTT_COMPAT_JAR'],run/'failed-http-app.jar')
                except Exception as snapshot_error:
                    (run/'failure-snapshot-error.txt').write_text(str(snapshot_error)+'\n')
                raise
        command(['docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-c',
            "DO $$ BEGIN IF EXISTS (SELECT 1 FROM platform.idempotency_requests WHERE key IN ('stalled-body-fixture','deadline-body-fixture')) THEN RAISE EXCEPTION 'Rejected upload persisted idempotency'; END IF; END $$"])
        if args.uploads_only:
            (run/'UPLOAD_PASSED').write_text('Attachment checks only; full acceptance not run.\n')
        else:
            with (run/'post-http.synthetic.pgdump').open('wb') as snapshot:
                command(['docker','exec',container,'pg_dump','-U','htt_owner','-d','htt_java_test','--format=custom'],stdout=snapshot,stderr=log)
            sql(source/'verify-ledgers.sql')
            (run/'PASSED').write_text('Synthetic compatibility suite passed. This does not constitute phases 0–4 acceptance.\n')
    finally:
        subprocess.run(['docker','rm','-f','-v',container],stdout=log,stderr=log)
print(f'Evidence: {run}')
