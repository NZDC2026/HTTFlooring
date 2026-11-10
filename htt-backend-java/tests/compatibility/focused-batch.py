from concurrent.futures import ThreadPoolExecutor
from collections import deque
from zoneinfo import ZoneInfo
import datetime, uuid, socketserver, struct, socket, select
import re
import base64, http.server, json, os, pathlib, ssl, subprocess, threading, time, urllib.error, urllib.request

here = pathlib.Path(__file__).resolve().parent
jdk = pathlib.Path(os.environ['JAVA_HOME'])
jar = pathlib.Path(os.environ['HTT_COMPAT_JAR'])
issuer = 'https://localhost:15443'
url = 'http://127.0.0.1:15081'
os.chdir(here)
subprocess.run(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-days','1','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost','-keyout','tls.key','-out','tls.crt'], check=True, capture_output=True)
subprocess.run(['openssl','genrsa','-out','sign.key','2048'], check=True, capture_output=True)
modulus = subprocess.check_output(['openssl','rsa','-in','sign.key','-modulus','-noout']).decode().strip().split('=')[1]
trust = here / 'test.p12'
trust.unlink(missing_ok=True)
subprocess.run([jdk/'bin/keytool','-importcert','-noprompt','-alias','fixture','-file','tls.crt','-keystore',trust,'-storepass','fixture-only'], check=True, capture_output=True)

def b64(raw):
    return base64.urlsafe_b64encode(raw).rstrip(b'=').decode()

class Discovery(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/jwks':
            body = {'keys':[{'kty':'RSA','use':'sig','alg':'RS256','kid':'fixture','n':b64(bytes.fromhex(modulus)),'e':'AQAB'}]}
        else:
            body = {'issuer':issuer,'jwks_uri':issuer+'/jwks','authorization_endpoint':issuer+'/authorize','response_types_supported':['code'],'subject_types_supported':['public'],'id_token_signing_alg_values_supported':['RS256']}
        data = json.dumps(body).encode()
        self.send_response(200)
        self.send_header('Content-Type','application/json')
        self.send_header('Content-Length',str(len(data)))
        self.end_headers()
        self.wfile.write(data)

class CleanScanner(socketserver.StreamRequestHandler):
    def handle(self):
        assert self.rfile.read(10) == b'zINSTREAM\x00'
        while length := struct.unpack('!I',self.rfile.read(4))[0]:
            assert len(self.rfile.read(length)) == length
        self.wfile.write(b'stream: OK\x00')

def scan_with_legacy(job, employee, company, legacy_url, db_port):
    dll = here.parent/'dotnet-baseline/src/Htt.Host.Worker/bin/Debug/net10.0/Htt.Host.Worker.dll'
    with socketserver.ThreadingTCPServer(('127.0.0.1',0),CleanScanner) as scanner, open('worker.log','a') as log:
        threading.Thread(target=scanner.serve_forever,daemon=True).start()
        env = dict(os.environ,
            ConnectionStrings__Database=f'Host=127.0.0.1;Port={db_port};Database=htt_java_test;Username=htt_worker;Password=local-worker-test',
            Documents__ClamAvHost='127.0.0.1',Documents__ClamAvPort=str(scanner.server_address[1]),BankFeeds__Enabled='false',
            Documents__MailApiKey='',Documents__MailFrom='',Geocoding__ApiKey='',
            CardOcr__ApiKey='',CardOcr__Endpoint='',Push__ProjectId='',Push__ClientEmail='',Push__PrivateKeyPem='')
        worker = subprocess.Popen([os.environ['HTT_COMPAT_DOTNET'],dll],env=env,stdout=log,stderr=subprocess.STDOUT)
        try:
            for _ in range(40):
                code, result = request('/api/v1/document-jobs/'+job,employee,company,base=legacy_url)
                if code == 200 and result['state'] == 'SUCCEEDED':
                    return
                time.sleep(.25)
            raise AssertionError((code,result))
        finally:
            worker.terminate()
            worker.wait(timeout=15)
            scanner.shutdown()

def token(subject, audience='staff', lifetime=14400):
    head = b64(json.dumps({'alg':'RS256','kid':'fixture'}).encode())
    claims = b64(json.dumps({'iss':issuer,'sub':subject,'aud':[audience],'exp':int(time.time())+lifetime}).encode())
    content = f'{head}.{claims}'
    signature = subprocess.check_output(['openssl','dgst','-sha256','-sign','sign.key'], input=content.encode())
    return f'{content}.{b64(signature)}'

backend_requests = {'15081':deque(),'15082':deque()}
legacy_rate_lock = threading.Lock()

def pace_backend(base):
    legacy_requests=backend_requests[base.rsplit(':',1)[1]]
    # Keep each backend below its 300/minute policy during business regression.
    # Reserve capacity for Flutter/proxy/worker requests outside this helper.
    while True:
        with legacy_rate_lock:
            now = time.monotonic()
            while legacy_requests and now - legacy_requests[0] >= 61:
                legacy_requests.popleft()
            if len(legacy_requests) < 240:
                legacy_requests.append(now)
                return
            delay = max(.01,61-(now-legacy_requests[0]))
        time.sleep(min(delay,30))

def raw_rate_status(path,jwt,base):
    try:
        with urllib.request.urlopen(urllib.request.Request(base+path,headers={'Authorization':'Bearer '+jwt}),timeout=5) as result:
            result.read()
            return result.status
    except urllib.error.HTTPError as failure:
        failure.read()
        return failure.code

def verify_rate_limits(legacy_url):
    subject='rate-probe-'+uuid.uuid4().hex
    for audience,path,expected in (('staff','/api/v1/me',200),('portal','/api/portal/v1/me',403)):
        jwt=token(subject,audience)
        for base in (url,legacy_url):
            started=time.monotonic()
            statuses=[raw_rate_status(path,jwt,base) for _ in range(301)]
            assert statuses[:300]==[expected]*300 and statuses[300]==429, (audience,base,statuses)
            assert time.monotonic()-started<55, 'Rate probe exceeded a single window'
            assert raw_rate_status(path,token(subject+'-independent',audience),base)==expected
            assert raw_rate_status(path,jwt,base)==429
    expired=token('expired-rate-probe',lifetime=-120)
    for base in (url,legacy_url):
        assert raw_rate_status('/api/v1/me',expired,base)==401
    print('PASS: staff and portal 300/minute policy, independent subjects, 301st rejection and expired token')

def isolated_quote_fixture(action, quote_id=None):
    # Deliberately limited to this runner's disposable PostgreSQL and fixed synthetic company.
    container=os.environ.get('HTT_COMPAT_PG_CONTAINER','')
    assert re.fullmatch(r'htt-java-compat-[0-9a-f]{12}',container), 'Disposable fixture database required'
    if action=='gaps':
        q=str(uuid.UUID(quote_id))
        mutation="UPDATE platform.document_lines l SET line_no=l.line_no*10 FROM sales.quotes q WHERE q.company_id=l.company_id AND q.id=l.document_id AND q.status='DRAFT' AND q.notes LIKE 'Conversion fixture café %' AND q.id='"+q+"'::uuid"
    elif action=='west':
        mutation="UPDATE core.companies SET timezone='Etc/GMT+12' WHERE id='00000000-0000-0000-0000-000000000001'"
    elif action=='east':
        mutation="UPDATE core.companies SET timezone='Pacific/Kiritimati' WHERE id='00000000-0000-0000-0000-000000000001'"
    elif action=='restore-timezone':
        mutation="UPDATE core.companies SET timezone='Australia/Sydney' WHERE id='00000000-0000-0000-0000-000000000001'"
    elif action in ('unit-change','unit-restore'):
        conversion='2.5' if action=='unit-change' else '2.25'
        mutation="UPDATE catalog.product_units SET conversion_to_base="+conversion+" WHERE company_id='00000000-0000-0000-0000-000000000001' AND id='00000000-0000-0000-0000-000000000184'"
    else: raise AssertionError('Unknown synthetic quote fixture mutation')
    sql="SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000002',true); "+mutation+';'
    result=subprocess.run(['docker','exec','-i',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-1'],input=sql,text=True,capture_output=True,timeout=20)
    with (here/'quote-fixture-control.log').open('a') as evidence: evidence.write(action+'\n'+result.stdout+result.stderr+'\n')
    assert result.returncode==0,(action,result.stdout,result.stderr)

def expired_rule_fixture(preview_id):
    container=os.environ.get('HTT_COMPAT_PG_CONTAINER','')
    assert re.fullmatch(r'htt-java-compat-[0-9a-f]{12}',container), 'Disposable synthetic database required'
    source=str(uuid.UUID(preview_id));expired=str(uuid.uuid4())
    sql="SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000002',true); INSERT INTO accounting.bank_rule_previews(id,company_id,statement_line_id,snapshot,tax_invoice_reference,tax_invoice_held_on,created_at,expires_at,created_by) SELECT '"+expired+"'::uuid,company_id,statement_line_id,snapshot,tax_invoice_reference,tax_invoice_held_on,now()-interval '30 minutes',now()-interval '1 minute',created_by FROM accounting.bank_rule_previews WHERE company_id='00000000-0000-0000-0000-000000000001' AND id='"+source+"'::uuid AND snapshot->>'status'='READY' RETURNING id;"
    result=subprocess.run(['docker','exec','-i',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-1','-At'],input=sql,text=True,capture_output=True,timeout=20)
    with (here/'rule-expiry-fixture.log').open('a') as evidence:evidence.write(result.stdout+result.stderr+'\\n')
    assert result.returncode==0 and expired in result.stdout.splitlines(),result
    return expired

def synthetic_feed_state(connection_id,action):
    container=os.environ.get('HTT_COMPAT_PG_CONTAINER','')
    assert re.fullmatch(r'htt-java-compat-[0-9a-f]{12}',container), 'Disposable synthetic database required'
    feed=str(uuid.UUID(connection_id))
    conditions="company_id='00000000-0000-0000-0000-000000000001' AND connection_id='"+feed+"'::uuid"
    if action=='failed-verify':
        mutation="UPDATE bankfeeds.jobs SET state='FAILED',error_code='synthetic_fixture',finished_at=now() WHERE "+conditions+" AND kind='VERIFY' AND state='PENDING';"
    elif action=='active-consent':
        mutation="UPDATE bankfeeds.jobs SET state='SUCCEEDED',finished_at=now() WHERE "+conditions+" AND kind='VERIFY' AND state='PENDING'; UPDATE bankfeeds.connections SET state='ACTIVE',consent_expires_at=now()+interval '1 day',remote_account_id='synthetic-local-only' WHERE company_id='00000000-0000-0000-0000-000000000001' AND id='"+feed+"'::uuid;"
    elif action=='unknown-sync':
        mutation="UPDATE bankfeeds.jobs SET state='UNKNOWN',error_code='synthetic_unknown',finished_at=now() WHERE "+conditions+" AND kind='SYNC' AND state='PENDING';"
    else:raise AssertionError('Unknown synthetic feed state')
    # Only the two synthetic test accounts are permitted; no gateway is invoked.
    sql="SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000480',true); DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM bankfeeds.connections WHERE id='"+feed+"'::uuid AND bank_account_id IN('00000000-0000-0000-0000-000000000470','00000000-0000-0000-0000-000000000471')) THEN RAISE EXCEPTION 'Synthetic account required'; END IF; END $$; "+mutation
    result=subprocess.run(['docker','exec','-i',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-1'],input=sql,text=True,capture_output=True,timeout=20)
    with (here/'feed-state-fixture.log').open('a') as evidence:evidence.write(action+'\\n'+result.stdout+result.stderr+'\\n')
    assert result.returncode==0,result

def request(path, jwt=None, company=None, grant=None, base=url, payload=None, key=None, version=None, content_type=None, method=None, timeout_seconds=5):
    if base.endswith((':15081',':15082')):
        pace_backend(base)
    headers = {} if jwt is None else {'Authorization':'Bearer '+jwt}
    if key is not None:
        headers['Idempotency-Key'] = key
    if company is not None:
        headers['X-Company-Id'] = company
    if grant is not None:
        headers['X-Portal-Grant-Id'] = grant
    if version is not None:
        headers['If-Match'] = f'"{version}"'
    if payload is not None:
        headers.update({'Content-Type':content_type or 'application/json','Idempotency-Key':key})
    try:
        with urllib.request.urlopen(urllib.request.Request(base+path,headers=headers,method=method,data=None if payload is None else payload if isinstance(payload, bytes) else json.dumps(payload).encode()),timeout=timeout_seconds) as res:
            return res.status, json.load(res)
    except urllib.error.HTTPError as ex:
        return ex.code, ex.read().decode()

def verify_stalled_upload(attachment, employee, company, base):
    def attempt(base):
        port = int(base.rsplit(':',1)[1])
        with socket.create_connection(('127.0.0.1',port),timeout=40) as conn:
            conn.sendall((f'POST {attachment} HTTP/1.1\r\nHost: localhost\r\n'
                f'Authorization: Bearer {employee}\r\nX-Company-Id: {company}\r\n'
                'If-Match: "1"\r\nIdempotency-Key: stalled-body-fixture\r\nContent-Type: image/png\r\n'
                'Content-Length: 20\r\nConnection: close\r\n\r\n').encode()+b'partial')
            started = time.monotonic()
            data = conn.recv(8192)
            elapsed = time.monotonic() - started
            return (data.split(b'\r\n',1)[0].decode(),round(elapsed,1))
    result = attempt(base)
    assert 4 <= result[1] < 9 and result[0].startswith('HTTP/1.1 400'), result
    print('Stalled upload:',base,result,flush=True)

def verify_upload_deadline(attachment, employee, company, base):
    with socket.create_connection(('127.0.0.1',int(base.rsplit(':',1)[1])),timeout=40) as conn:
        conn.sendall((f'POST {attachment} HTTP/1.1\r\nHost: localhost\r\n'
            f'Authorization: Bearer {employee}\r\nX-Company-Id: {company}\r\n'
            'If-Match: "1"\r\nIdempotency-Key: deadline-body-fixture\r\nContent-Type: image/png\r\n'
            'Content-Length: 64000\r\nConnection: close\r\n\r\n').encode())
        started=time.monotonic()
        while time.monotonic()-started<38:
            conn.sendall(b'x'*1024)
            if select.select([conn],[],[],.5)[0]:
                data=conn.recv(8192)
                result=(data.split(b'\r\n',1)[0].decode(),round(time.monotonic()-started,1))
                assert 28<=result[1]<34 and result[0].startswith('HTTP/1.1 500'), result
                print('Upload absolute deadline:',base,result,flush=True)
                return
        raise AssertionError('Upload deadline did not respond')

def verify_flutter(employee, legacy_url, ssl_context):
    trace = []
    class StableProxy(http.server.BaseHTTPRequestHandler):
        def do_POST(self):
            payload = self.rfile.read(int(self.headers['Content-Length']))
            photo = '/attachments?' in self.path
            previous = [entry for entry in trace if entry[0] == photo]
            # Old API commits creation; Java commits photo; opposite side handles each retry.
            upstream = (url if photo else legacy_url) if not previous else (legacy_url if photo else url)
            forwarded = urllib.request.Request(upstream+self.path, data=payload,
                headers={k:v for k,v in self.headers.items() if k.lower() not in ('host','connection')})
            try:
                with urllib.request.urlopen(forwarded,timeout=8) as result:
                    body, code = result.read(), result.status
            except urllib.error.HTTPError as error:
                body, code = error.read(), error.code
            trace.append((photo,upstream,code,json.loads(body)))
            self.send_response(503 if not previous and code in (201,202) else code)
            self.send_header('Content-Type','application/json')
            self.send_header('Content-Length',str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    with http.server.ThreadingHTTPServer(('127.0.0.1',0),StableProxy) as proxy:
        proxy.socket = ssl_context.wrap_socket(proxy.socket,server_side=True)
        threading.Thread(target=proxy.serve_forever,daemon=True).start()
        try:
            env = dict(os.environ, HTT_FIXTURE_CA=str(here/'tls.crt'),HTT_FIXTURE_TOKEN=employee,
                       HTT_FIXTURE_ORIGIN=f'https://localhost:{proxy.server_port}')
            subprocess.run([os.environ['HTT_COMPAT_FLUTTER'],'test','--no-pub',
                            'test/visit_real_backend_test.dart'],cwd=here.parent/'flutter-visit-baseline',
                           env=env,check=True,timeout=60)
        finally:
            proxy.shutdown()
    assert [row[:3] for row in trace] == [(False,legacy_url,201),(False,url,201),
                                           (True,url,202),(True,legacy_url,202)], trace
    assert trace[0][3] == trace[1][3] and trace[2][3] == trace[3][3], trace
    return trace[0][3]['id']

db_port = (here.parent/'htt-java-me-db-port.txt').read_text().strip().rsplit(':',1)[1]
env = dict(os.environ, SERVER_PORT='15081', SERVER_ADDRESS='127.0.0.1',
           HTT_STAFF_AUTHORITY=issuer, HTT_STAFF_AUDIENCE='staff',
           HTT_STAFF_DATABASE_URL=f'jdbc:postgresql://127.0.0.1:{db_port}/htt_java_test',
           HTT_STAFF_DATABASE_PASSWORD='local-app-test',
           HTT_PORTAL_AUTHORITY=issuer, HTT_PORTAL_AUDIENCE='portal',
           HTT_PORTAL_DATABASE_URL=f'jdbc:postgresql://127.0.0.1:{db_port}/htt_java_test',
           HTT_PORTAL_DATABASE_PASSWORD='local-portal-test')
with http.server.ThreadingHTTPServer(('127.0.0.1',15443),Discovery) as server:
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain('tls.crt','tls.key')
    server.socket = ctx.wrap_socket(server.socket,server_side=True)
    threading.Thread(target=server.serve_forever,daemon=True).start()
    legacy_url = 'http://127.0.0.1:15082'
    legacy_dll = pathlib.Path(os.environ['HTT_FOCUSED_NATIVE_DLL'])
    pin = subprocess.check_output(['openssl','x509','-in','tls.crt','-fingerprint','-sha1','-noout']).decode().strip().split('=')[1].replace(':','')
    legacy_env = dict(os.environ, ASPNETCORE_URLS=legacy_url, ASPNETCORE_ENVIRONMENT='Development',
        HTT_FIXTURE_TLS_PIN=pin, Authentication__Authority=issuer, Authentication__Audience='staff',
        PortalAuthentication__Authority=issuer, PortalAuthentication__Audience='portal',
        ConnectionStrings__Database=f'Host=127.0.0.1;Port={db_port};Database=htt_java_test;Username=htt_app;Password=local-app-test',
        ConnectionStrings__PortalDatabase=f'Host=127.0.0.1;Port={db_port};Database=htt_java_test;Username=htt_portal;Password=local-portal-test')
    with open('server.log','w') as log, open('legacy.log','w') as legacy_log:
        legacy = subprocess.Popen([os.environ['HTT_COMPAT_DOTNET'],legacy_dll],env=legacy_env,
                                  stdout=legacy_log,stderr=subprocess.STDOUT)
        proc = subprocess.Popen([jdk/'bin/java',f'-Djavax.net.ssl.trustStore={trust}',
                                 '-Djavax.net.ssl.trustStorePassword=fixture-only','-jar',jar],
                                env=env,stdout=log,stderr=subprocess.STDOUT)
        try:
            for _ in range(40):
                try:
                    if request('/health/live')[0] == 200 and request('/health/live',base=legacy_url)[0] == 200:
                        break
                except OSError:
                    pass
                time.sleep(.25)

            actor=token('test-operating-report');denied=token('test-general-reader')
            company='00000000-0000-0000-0000-000000000001'
            paths=['/api/v1/workbench/'+x for x in ('finance','sales','office','banks','warehouse','customers/00000000-0000-0000-0000-000000000011')]
            paths+=['/api/v1/accounting/reconciliation','/api/v1/recurring/templates','/api/v1/recurring/runs','/api/v1/payroll/report?from=2026-01-01&to=2027-01-01']
            paths+=['/api/v1/payroll/records?kind='+x for x in ('EMPLOYEE','SETTINGS','TIMESHEET','RUN')]
            def stable(x):
                if isinstance(x,dict):return {k:stable(v) for k,v in x.items() if k not in ('snapshotAt','mvccSnapshot','dataAsOf')}
                if isinstance(x,list):return [stable(v) for v in x]
                return x
            for path in paths:
                a=request(path,actor,company,base=url,timeout_seconds=30);b=request(path,actor,company,base=legacy_url,timeout_seconds=30)
                assert a[0]==b[0]==200 and stable(a[1])==stable(b[1]),(path,a,b)
                assert request(path,denied,company,base=url)[0]==request(path,denied,company,base=legacy_url)[0]==403,path
            print('PASS: focused read batch populated snapshot parity and missing-capability guards',flush=True)
            for first,second in ((url,legacy_url),(legacy_url,url)):
                path='/api/v1/payroll/records'
                data={'kind':'EMPLOYEE','body':{'code':'FOCUSED_'+uuid.uuid4().hex[:12],'name':'Synthetic batch café','employmentType':'CASUAL','startDate':'2026-01-01'}}
                key='focused-payroll-'+uuid.uuid4().hex
                created=request(path,actor,company,base=first,payload=data,key=key)
                assert created[0]==201,created
                with ThreadPoolExecutor(max_workers=6) as pool:
                    retries=list(pool.map(lambda n:request(path,actor,company,base=first if n%2 else second,payload=data,key=key),range(6)))
                assert all(x==created for x in retries),(created,retries)
                rid=created[1]['id']
                detail=request(path+'/'+rid,actor,company,base=second)
                assert detail== (200,created[1]),detail
                version=created[1]['version']
                edited={**data,'body':{**data['body'],'name':'Synthetic batch updated'}}
                key='focused-payroll-edit-'+uuid.uuid4().hex
                updated=request(path+'/'+rid,actor,company,base=first,payload=edited,key=key,version=version,method='PUT')
                assert updated[0]==200,updated
                assert request(path+'/'+rid,actor,company,base=second,payload=edited,key=key,version=version,method='PUT')==updated
                assert request(path+'/'+rid,actor,company,base=first,payload=edited,key='focused-stale-'+uuid.uuid4().hex,version=version,method='PUT')[0]==409
            print('PASS: focused payroll sandbox employee create/update, raw-payload shared idempotency and stale-version guards; no wages or external filing',flush=True)
            query="SELECT json_build_object('bank',(SELECT id FROM accounting.bank_accounts ORDER BY id LIMIT 1),'account',(SELECT id FROM accounting.accounts WHERE active AND kind='EXPENSE' ORDER BY id LIMIT 1),'tax',(SELECT id FROM accounting.tax_codes ORDER BY id LIMIT 1));"
            selected=subprocess.check_output(['/Users/chandler/.docker/bin/docker','exec',os.environ['HTT_FOCUSED_PG_CONTAINER'],'psql','-U','htt_owner','-d','htt_java_test','-At','-v','ON_ERROR_STOP=1','-c',query]).decode()
            refs=json.loads(selected);assert all(refs.values()),refs
            for first,second in ((url,legacy_url),(legacy_url,url)):
                source={'bankAccountId':refs['bank'],'kind':'PAY','lines':[{'accountId':refs['account'],'taxCodeId':refs['tax'],'net':'1.00','tax':'0.00','description':'Synthetic future recurring line'}]}
                data={'name':'Synthetic future batch '+uuid.uuid4().hex,'kind':'BANK_TRANSACTION','frequency':'MONTH','every':1,'startsOn':'2090-01-01','endsOn':'2091-01-01','maxOccurrences':2,'payload':source}
                path='/api/v1/recurring/templates';key='focused-recurring-'+uuid.uuid4().hex
                result=request(path,actor,company,base=first,payload=data,key=key);assert result[0]==201,result
                with ThreadPoolExecutor(max_workers=6) as pool:
                    retries=list(pool.map(lambda n:request(path,actor,company,base=first if n%2 else second,payload=data,key=key),range(6)))
                assert all(x==result for x in retries),(result,retries)
                rid=result[1]['id'];current=result[1]
                assert request(path+'/'+rid,actor,company,base=second)==(200,current)
                for action in ('PAUSE','RESUME','CANCEL'):
                    body={'action':action,'reason':'Synthetic bounded schedule test'}
                    key='focused-recurring-change-'+uuid.uuid4().hex
                    changed=request(path+'/'+rid+'/change',actor,company,base=first,payload=body,key=key,version=current['version'])
                    assert changed[0]==200,changed
                    assert request(path+'/'+rid+'/change',actor,company,base=second,payload=body,key=key,version=current['version'])==changed
                    current=changed[1]
                assert current['state']=='CANCELLED',current
            print('PASS: focused recurring future template create/pause/resume/cancel and cross-host raw-JSON idempotency; no tick or posting worker',flush=True)
            sql="SELECT coalesce(json_agg(id),'[]'::json) FROM (SELECT d.id FROM platform.documents d JOIN sales.quotes q ON q.company_id=d.company_id AND q.id=d.id WHERE d.company_id='00000000-0000-0000-0000-000000000001' AND d.state='DRAFT' AND q.status='DRAFT' AND d.deleted_at IS NULL AND platform.document_visible(d.id) ORDER BY d.id LIMIT 2) x;"
            # Owner discovery only; explicit current company is necessary for document_visible.
            sql="BEGIN;SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true);"+sql+"COMMIT;"
            out=subprocess.check_output(['/Users/chandler/.docker/bin/docker','exec',os.environ['HTT_FOCUSED_PG_CONTAINER'],'psql','-U','htt_owner','-d','htt_java_test','-At','-v','ON_ERROR_STOP=1','-c',sql]).decode().splitlines()
            ids=next(json.loads(x) for x in out if x.startswith('['));assert len(ids)==2,ids
            def life_write(path,backend,body,key,life,business,method='POST'):
                headers={'Authorization':'Bearer '+actor,'X-Company-Id':company,'Idempotency-Key':key,'If-Match':'"'+str(life)+'"','X-Document-Version':str(business),'Content-Type':'application/json'}
                try:
                    with urllib.request.urlopen(urllib.request.Request(backend+path,headers=headers,method=method,data=json.dumps(body).encode()),timeout=10) as res:return res.status,json.load(res)
                except urllib.error.HTTPError as error:return error.code,error.read().decode()
            for n,rid in enumerate(ids):
                first,second=(url,legacy_url) if n==0 else (legacy_url,url)
                lifecycle='/api/v1/documents/'+rid+'/lifecycle'
                before=request(lifecycle,actor,company,base=first);assert before[0]==200,before
                assert request(lifecycle,actor,company,base=second)==before
                path='/api/v1/documents/'+rid+('/trash' if n==0 else '')
                method='POST' if n==0 else 'DELETE';key='focused-trash-'+uuid.uuid4().hex;body={'reason':' Synthetic lifecycle batch '}
                life=before[1]['lifecycleVersion'];business=before[1]['documentVersion']
                hidden=life_write(path,first,body,key,life,business,method);assert hidden[0]==200 and hidden[1]['isTrashed'],hidden
                assert life_write(path,second,body,key,life,business,method)==hidden
                for backend in (first,second):
                    assert request('/api/v1/quotes/'+rid,actor,company,base=backend)[0]==404
                restored=life_write('/api/v1/documents/'+rid+'/restore',second,body,'focused-restore-'+uuid.uuid4().hex,hidden[1]['lifecycleVersion'],business)
                assert restored[0]==200 and not restored[1]['isTrashed'],restored
                for backend in (first,second):
                    assert request('/api/v1/quotes/'+rid,actor,company,base=backend)[0]==200
            print('PASS: focused lifecycle dual-version trash/delete shared replay, hidden quote denial and restore on both hosts',flush=True)
            for suffix in ('programs','ledger','me'):
                path='/api/v1/incentives/'+suffix
                a=request(path,actor,company,base=url);b=request(path,actor,company,base=legacy_url)
                assert a[0]==b[0]==200 and stable(a[1])==stable(b[1]),(path,a,b)
                assert request(path,denied,company,base=url)[0]==request(path,denied,company,base=legacy_url)[0]==403
            for first,second in ((url,legacy_url),(legacy_url,url)):
                path='/api/v1/incentives/programs'
                draft={'kind':'REBATE','name':'Synthetic batch rebate '+uuid.uuid4().hex,'customerId':'00000000-0000-0000-0000-000000000011'}
                key='focused-incentive-'+uuid.uuid4().hex
                created=request(path,actor,company,base=first,payload=draft,key=key)
                assert created[0]==201,created
                with ThreadPoolExecutor(max_workers=6) as pool:
                    retried=list(pool.map(lambda n:request(path,actor,company,base=first if n%2 else second,payload=draft,key=key),range(6)))
                assert all(x==created for x in retried),(created,retried)
                rid=created[1]['id']
                detail=request(path+'/'+rid,actor,company,base=second);assert detail==(200,created[1]),detail
                body={'enabled':False};key='focused-incentive-disable-'+uuid.uuid4().hex
                disabled=request(path+'/'+rid+'/enabled',actor,company,base=first,payload=body,key=key,version=created[1]['version'],method='PUT')
                assert disabled[0]==200 and disabled[1]['enabled'] is False,disabled
                assert request(path+'/'+rid+'/enabled',actor,company,base=second,payload=body,key=key,version=created[1]['version'],method='PUT')==disabled
            print('PASS: focused incentive lists, scoped program create/detail/disable and six mixed raw-payload replays; no accrual or settlement posted',flush=True)
            for first,second in ((url,legacy_url),(legacy_url,url)):
                path='/api/v1/customers/00000000-0000-0000-0000-000000000011/portal-access'
                draft={'issuer':'https://localhost:15443','subject':'focused-disabled-'+uuid.uuid4().hex,'displayName':'Synthetic disabled customer access','enabled':False,'branches':[]}
                key='focused-grant-'+uuid.uuid4().hex
                created=request(path,actor,company,base=first,payload=draft,key=key);assert created[0]==201,created
                with ThreadPoolExecutor(max_workers=6) as pool:
                    retries=list(pool.map(lambda n:request(path,actor,company,base=first if n%2 else second,payload=draft,key=key),range(6)))
                assert all(x==created for x in retries),(created,retries)
                path='/api/v1/portal-access/'+created[1]['id']
                a=request(path,actor,company,base=first);b=request(path,actor,company,base=second);assert a==b and a[0]==200,(a,b)
                body={'enabled':False,'branches':[]};key='focused-grant-update-'+uuid.uuid4().hex
                changed=request(path,actor,company,base=first,payload=body,key=key,version=created[1]['version'],method='PUT')
                assert changed[0]==200,changed
                assert request(path,actor,company,base=second,payload=body,key=key,version=created[1]['version'],method='PUT')==changed
                scoped={'enabled':True,'branches':[{'branchId':'00000000-0000-0000-0000-000000000012','warehouseIds':['00000000-0000-0000-0000-000000000014']}]}
                key='focused-enable-grant-'+uuid.uuid4().hex
                enabled=request(path,actor,company,base=first,payload=scoped,key=key,version=changed[1]['version'],method='PUT')
                assert enabled[0]==200,enabled
                assert request(path,actor,company,base=second,payload=scoped,key=key,version=changed[1]['version'],method='PUT')==enabled
                customer_token=token(draft['subject'],'portal')
                for endpoint in ('/api/portal/v1/me','/api/portal/v1/branches','/api/portal/v1/warehouses?branchId=00000000-0000-0000-0000-000000000012'):
                    a=request(endpoint,customer_token,company,created[1]['id'],base=first);b=request(endpoint,customer_token,company,created[1]['id'],base=second)
                    assert a[0]==b[0]==200 and stable(a[1])==stable(b[1]),(endpoint,a,b)
                    for result in (a,b):
                        if 'dataAsOf' in result[1]:assert result[1]['dataAsOf'].endswith(('+00:00','Z')),result
                key='focused-disable-grant-'+uuid.uuid4().hex
                disabled=request(path,actor,company,base=second,payload=body,key=key,version=enabled[1]['version'],method='PUT')
                assert disabled[0]==200,disabled
                for backend in (first,second):
                    stale=request(path,actor,company,base=backend,payload=body,key='focused-grant-stale-'+uuid.uuid4().hex,version=enabled[1]['version'],method='PUT')
                    assert stale[0]==409 and json.loads(stale[1])['code']=='portal_conflict',stale
                for backend in (first,second):
                    assert request('/api/portal/v1/branches',customer_token,company,created[1]['id'],base=backend)[0]==403
            sql="SELECT coalesce(json_agg(id),'[]'::json) FROM (SELECT p.id FROM catalog.products p WHERE p.company_id='00000000-0000-0000-0000-000000000001' AND p.item_type='STOCK' AND p.status='ACTIVE' AND NOT EXISTS(SELECT 1 FROM portal.product_publications v WHERE v.company_id=p.company_id AND v.product_id=p.id) ORDER BY p.id LIMIT 2)x;"
            ids=json.loads(subprocess.check_output(['/Users/chandler/.docker/bin/docker','exec',os.environ['HTT_FOCUSED_PG_CONTAINER'],'psql','-U','htt_owner','-d','htt_java_test','-At','-c',sql]).decode());assert len(ids)==2,ids
            for n,rid in enumerate(ids):
                first,second=(url,legacy_url) if n==0 else (legacy_url,url)
                path='/api/v1/portal/catalog/products/'+rid
                draft={'published':False,'allCustomers':False,'description':' Synthetic publication café ','lowStockQuantity':'1.25','customerIds':[],'barcodes':[]}
                key='focused-publication-'+uuid.uuid4().hex
                created=request(path,actor,company,base=first,payload=draft,key=key);assert created[0]==201,created
                assert request(path,actor,company,base=second,payload=draft,key=key)==created
                a=request(path,actor,company,base=first);b=request(path,actor,company,base=second);assert a==b and a[0]==200,(a,b)
                key='focused-publication-update-'+uuid.uuid4().hex
                changed=request(path,actor,company,base=first,payload={**draft,'description':'Updated synthetic publication'},key=key,version=created[1]['version'],method='PUT')
                assert changed[0]==200,changed
                assert request(path,actor,company,base=second,payload={**draft,'description':'Updated synthetic publication'},key=key,version=created[1]['version'],method='PUT')==changed
            print('PASS: focused disabled portal access and unpublished catalog create/read/update mixed replay; synthetic grants only',flush=True)
            sql="SELECT id FROM crm.suppliers WHERE company_id='00000000-0000-0000-0000-000000000001' ORDER BY id LIMIT 1;"
            supplier=subprocess.check_output(['/Users/chandler/.docker/bin/docker','exec',os.environ['HTT_FOCUSED_PG_CONTAINER'],'psql','-U','htt_owner','-d','htt_java_test','-At','-c',sql]).decode().strip();assert supplier
            paths=['/api/v1/search?q=Synthetic','/api/v1/inventory/valuation?warehouseId=00000000-0000-0000-0000-000000000014','/api/v1/customers/00000000-0000-0000-0000-000000000011/advances','/api/v1/suppliers/'+supplier+'/advances','/api/v1/warehouse/purchase-orders?warehouseId=00000000-0000-0000-0000-000000000014','/api/v1/accounting/grni','/api/v1/accounting/grni?supplierId='+supplier+'&warehouseId=00000000-0000-0000-0000-000000000014']
            for path in paths:
                a=request(path,actor,company,base=url,timeout_seconds=30);b=request(path,actor,company,base=legacy_url,timeout_seconds=30)
                assert a[0]==b[0]==200 and stable(a[1])==stable(b[1]),(path,a,b)
            sql="SELECT id FROM purchase.orders WHERE company_id='00000000-0000-0000-0000-000000000001' ORDER BY id LIMIT 1;"
            po=subprocess.check_output(['/Users/chandler/.docker/bin/docker','exec',os.environ['HTT_FOCUSED_PG_CONTAINER'],'psql','-U','htt_owner','-d','htt_java_test','-At','-c',sql]).decode().strip();assert po
            path='/api/v1/warehouse/purchase-orders/'+po
            a=request(path,actor,company,base=url);b=request(path,actor,company,base=legacy_url)
            assert a[0]==b[0]==200 and stable(a[1])==stable(b[1]),(path,a,b)
            for line in a[1]['lines']:assert not any(k in line for k in ('unitCost','net','tax','gross','valuationAmount','taxRate','recoverableGst')),line
            print('PASS: focused operational search/valuation/advances/receiving/GRNI populated parity and warehouse line cost redaction',flush=True)
            reviewer=token('test-report-other')
            def payroll_create(kind,body,first=url,second=legacy_url):
                data={'kind':kind,'body':body};key='focused-payroll-flow-'+uuid.uuid4().hex
                created=request('/api/v1/payroll/records',actor,company,base=first,payload=data,key=key)
                assert created[0]==201,created
                assert request('/api/v1/payroll/records',actor,company,base=second,payload=data,key=key)==created
                return created[1]
            settings=payroll_create('SETTINGS',{'provider':'SANDBOX','rulesVersion':'synthetic-v1','fixtureHourlyCents':3000,'fixturePaygCents':1000,'fixtureSuperCents':600})
            employee=payroll_create('EMPLOYEE',{'code':'FLOW_'+uuid.uuid4().hex[:12],'name':'Synthetic payroll flow','employmentType':'CASUAL','startDate':'2026-01-01'},legacy_url,url)
            sheet=payroll_create('TIMESHEET',{'employeeId':employee['id'],'date':'2026-01-15','minutes':120,'category':'ORDINARY'})
            def payroll_transition(record,operation,identity,first=url,second=legacy_url):
                path='/api/v1/payroll/records/'+record['id']+'/'+operation;key='focused-payroll-transition-'+uuid.uuid4().hex
                result=request(path,identity,company,base=first,key=key,version=record['version'],method='POST')
                assert result[0]==200,(operation,result)
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,identity,company,base=first if n%2 else second,key=key,version=record['version'],method='POST'),range(6)))
                assert all(x==result for x in attempts),(result,attempts)
                return result[1]
            sheet=payroll_transition(sheet,'submit',actor)
            assert request('/api/v1/payroll/records/'+sheet['id']+'/approve',actor,company,key='focused-self-approve-'+uuid.uuid4().hex,version=sheet['version'],method='POST')[0]==403
            sheet=payroll_transition(sheet,'approve',reviewer,legacy_url,url)
            run=payroll_create('RUN',{'from':'2026-01-01','to':'2026-01-31','payDate':'2026-01-31','timesheetIds':[sheet['id']]},legacy_url,url)
            run=payroll_transition(run,'calculate',actor)
            run=payroll_transition(run,'approve',reviewer)
            run=payroll_transition(run,'lock',actor,legacy_url,url)
            run=payroll_transition(run,'stp_preview',actor)
            assert run['state']=='SANDBOX_ACKNOWLEDGED',run
            report=request('/api/v1/payroll/report?from=2026-01-01&to=2026-02-01',actor,company)
            mirror=request('/api/v1/payroll/report?from=2026-01-01&to=2026-02-01',actor,company,base=legacy_url)
            assert report==mirror and report[0]==200,report
            assert report[1]['grossCents']==6000 and report[1]['paygCents']==1000 and report[1]['netCents']==5000 and report[1]['superCents']==600 and report[1]['balanceDifferenceCents']==0,report
            assert report[1]['atoLodged'] is False and report[1]['ledgerPosted'] is False,report
            print('PASS: payroll SANDBOX full timesheet/independent approval/calculate/lock/STP-preview flow, exact fixture cents and no ledger/ATO filing',flush=True)
            container=os.environ['HTT_FOCUSED_PG_CONTAINER']
            liability=str(uuid.uuid4())
            setup="INSERT INTO accounting.accounts(id,company_id,code,name,kind,created_by) VALUES('"+liability+"','00000000-0000-0000-0000-000000000001','FOCUSED_INC_"+uuid.uuid4().hex[:10]+"','Synthetic incentive liability','LIABILITY','00000000-0000-0000-0000-000000000500');"
            setup="BEGIN; SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000500',true);"+setup+"COMMIT;"
            setup_result=subprocess.run(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-c',setup],text=True,capture_output=True)
            assert setup_result.returncode==0,(setup_result.stdout,setup_result.stderr)
            def inc_write(path,data,identity=actor,version=None,method='POST',first=url,second=legacy_url,status=201):
                key='focused-incentive-flow-'+uuid.uuid4().hex
                result=request(path,identity,company,base=first,payload=data,key=key,version=version,method=method,timeout_seconds=30)
                assert result[0]==status,(path,result)
                assert request(path,identity,company,base=second,payload=data,key=key,version=version,method=method,timeout_seconds=30)==result,(path,result)
                return result[1]
            program=inc_write('/api/v1/incentives/programs',{'kind':'REBATE','name':'Synthetic approved rebate '+uuid.uuid4().hex,'customerId':'00000000-0000-0000-0000-000000000011'})
            query="SELECT id FROM accounting.accounts WHERE company_id='00000000-0000-0000-0000-000000000001' AND active AND kind='EXPENSE' AND control_kind IS NULL ORDER BY id LIMIT 1;"
            charge=subprocess.check_output(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-At','-c',query]).decode().strip();assert charge
            config={'basis':'NET_SALES','formula':'PERCENT_NET','value':'10.00','expenseAccountId':charge,'liabilityAccountId':liability,'settlementMode':'CUSTOMER_CREDIT','taxTreatment':'PRICE_REDUCTION','taxReviewReference':'Synthetic reviewed policy','deductRebates':False,'retroactiveAcknowledged':True,'recoverableGst':False}
            policy=inc_write('/api/v1/incentives/programs/'+program['id']+'/policies',{'revision':0,'from':'2026-01-01','to':'2027-01-01','config':config})
            assert request('/api/v1/incentives/policies/'+policy['id']+'/approve',actor,company,payload={'reference':'Self approval prohibited'},key='focused-self-policy-'+uuid.uuid4().hex)[0]==403
            approved=inc_write('/api/v1/incentives/policies/'+policy['id']+'/approve',{'reference':'Synthetic independent tax review'},reviewer,status=200,first=legacy_url,second=url)
            assert approved['approved'] is True
            period=inc_write('/api/v1/incentives/periods',{'from':'2026-01-01','to':'2027-01-01'})
            today=datetime.datetime.now(ZoneInfo('Australia/Sydney')).date().isoformat()
            draft={'programId':program['id'],'periodId':period['id'],'valuationDate':today,'postingDate':today,'reason':'Synthetic source-to-GL incentive plan'}
            planned=inc_write('/api/v1/incentives/runs',draft)
            assert request('/api/v1/incentives/runs/'+planned['id'],actor,company,base=legacy_url)==(200,planned)
            rejected=inc_write('/api/v1/incentives/runs/'+planned['id']+'/reject',None,version=planned['version'],status=200)
            assert rejected['state']=='REJECTED',rejected
            print('PASS: incentive policy independent approval, period and source-derived run create/read/reject cross-host replay; no settlement executed',flush=True)
            plan=inc_write('/api/v1/incentives/runs',draft,first=legacy_url,second=url)
            assert any(float(line['delta'])>0 for line in plan['plan']['lines']),plan['plan']
            assert request('/api/v1/incentives/runs/'+plan['id']+'/approve',actor,company,key='focused-self-accrual-'+uuid.uuid4().hex,version=plan['version'],method='POST')[0]==403
            accrued=inc_write('/api/v1/incentives/runs/'+plan['id']+'/approve',None,reviewer,version=plan['version'],status=200)
            assert accrued['state']=='APPROVED',accrued
            grant=inc_write('/api/v1/incentives/programs/'+program['id']+'/display-grants',{'userId':'00000000-0000-0000-0000-000000000503','active':True},version=0,method='PUT',status=200)
            assert grant['active'] is True and grant['version']==1,grant
            removed=inc_write('/api/v1/incentives/programs/'+program['id']+'/display-grants',{'userId':'00000000-0000-0000-0000-000000000503','active':False},version=1,method='PUT',status=200)
            assert removed['active'] is False and removed['version']==2,removed
            query="BEGIN;SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000500',true); SELECT json_build_object('claimId',c.id,'lineId',l.id,'tax',round(l.tax_rate,2)::text) FROM incentives.claims c JOIN sales.invoice_lines l ON l.company_id=c.company_id AND l.invoice_id=c.invoice_id WHERE c.program_id='"+program['id']+"'::uuid AND incentives.claim_balance(c.id)>=1 AND l.gross-accounting.line_credited(l.id)>2 ORDER BY c.id,l.id LIMIT 1; COMMIT;"
            out=subprocess.check_output(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-At','-v','ON_ERROR_STOP=1','-c',query]).decode().splitlines()
            selected=next(json.loads(line) for line in out if line.startswith('{'));assert selected
            settlement={'claimId':selected['claimId'],'net':'1.00','tax':selected['tax'],'postingDate':today,'reference':'Synthetic settlement '+uuid.uuid4().hex,'reason':'Synthetic reviewed price reduction','evidence':'Synthetic independent source evidence','items':[{'invoiceLineId':selected['lineId'],'description':'Synthetic approved incentive price reduction','net':'1.00','tax':selected['tax']}]}
            transferred=inc_write('/api/v1/incentives/settlements',settlement)
            assert transferred['status']=='TRANSFERRED' and transferred['mode']=='CUSTOMER_CREDIT',transferred
            verify="BEGIN;SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000500',true); DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM incentives.accruals WHERE delta>0) OR EXISTS(SELECT 1 FROM incentives.control_balances() WHERE expected<>actual) OR EXISTS(SELECT 1 FROM accounting.reconciliation_checks() WHERE expected<>actual) THEN RAISE EXCEPTION 'Synthetic incentive posting/control reconciliation failed';END IF; END $$;COMMIT;"
            checked=subprocess.run(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-c',verify],capture_output=True,text=True)
            assert checked.returncode==0,(checked.stdout,checked.stderr)
            print('PASS: nonzero incentive accrual independent approval, display-grant versions, linked customer-credit settlement and source-to-GL control reconciliation; isolated synthetic database only',flush=True)
            query="SELECT json_build_object('invoiceId',l.invoice_id,'lines',json_agg(json_build_object('invoiceLineId',l.id,'description','Synthetic full external price reduction','net',(l.net-coalesce((SELECT sum(c.net) FROM sales.credit_note_lines c WHERE c.company_id=l.company_id AND c.invoice_line_id=l.id),0))::text,'tax',(l.tax-coalesce((SELECT sum(c.tax) FROM sales.credit_note_lines c WHERE c.company_id=l.company_id AND c.invoice_line_id=l.id),0))::text) ORDER BY l.id)) FROM sales.invoice_lines l WHERE l.company_id='00000000-0000-0000-0000-000000000001' AND l.invoice_id=(SELECT invoice_id FROM sales.invoice_lines WHERE id='"+selected['lineId']+"') AND l.gross-accounting.line_credited(l.id)>0 GROUP BY l.invoice_id;"
            out=subprocess.check_output(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-At','-c',query]).decode().strip();external=json.loads(out);assert external['lines']
            inc_write('/api/v1/sales-invoices/'+external['invoiceId']+'/amount-credit-notes',{'reason':'Synthetic source reduction after incentive settlement','lines':external['lines']})
            adjustment=inc_write('/api/v1/incentives/runs',{**draft,'invoiceIds':[external['invoiceId']],'reason':'Synthetic negative incentive source adjustment'})
            assert any(float(line['delta'])<0 for line in adjustment['plan']['lines']),adjustment['plan']
            inc_write('/api/v1/incentives/runs/'+adjustment['id']+'/approve',None,reviewer,version=adjustment['version'],status=200,first=legacy_url,second=url)
            query="BEGIN;SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true);SELECT json_build_object('positive',(SELECT id FROM incentives.claims WHERE program_id='"+program['id']+"' AND incentives.claim_balance(id)>=0.01 ORDER BY id LIMIT 1),'negative',(SELECT id FROM incentives.claims WHERE program_id='"+program['id']+"' AND incentives.claim_balance(id)<=-0.01 ORDER BY id LIMIT 1));COMMIT;"
            rows=subprocess.check_output(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-At','-c',query]).decode().splitlines()
            offset_ids=next(json.loads(x) for x in rows if x.startswith('{'));assert all(offset_ids.values()),offset_ids
            offset=inc_write('/api/v1/incentives/offsets',{'positiveClaimId':offset_ids['positive'],'negativeClaimId':offset_ids['negative'],'amount':'0.01','postingDate':today,'reference':'Synthetic offset '+uuid.uuid4().hex,'reason':'Synthetic reviewed positive/negative offset'})
            assert offset['status']=='OFFSET' and offset['mode']=='OFFSET',offset
            historical=inc_write('/api/v1/incentives/periods',{'from':'2025-01-01','to':'2026-01-01'})
            locked=inc_write('/api/v1/incentives/periods/'+historical['id']+'/review',{'lock':True,'reference':'Synthetic reconciled historical review'},reviewer,version=historical['version'],status=200)
            assert locked['state']=='LOCKED'
            reopened=inc_write('/api/v1/incentives/periods/'+historical['id']+'/review',{'lock':False,'reference':'Synthetic reopen historical review'},reviewer,version=locked['version'],status=200,first=legacy_url,second=url)
            assert reopened['state']=='OPEN'
            checked=subprocess.run(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-c',verify],capture_output=True,text=True)
            assert checked.returncode==0,(checked.stdout,checked.stderr)
            print('PASS: negative source adjustment after settlement, approved offset and historical period lock/reopen with control/GL reconciliation',flush=True)
            proposal_templates=[]
            for n in range(2):
                body={'name':'Synthetic due proposal '+uuid.uuid4().hex,'kind':'BANK_TRANSACTION','frequency':'DAY','every':1,'startsOn':today,'endsOn':today,'maxOccurrences':1,'payload':{'bankAccountId':'00000000-0000-0000-0000-000000000430','kind':'RECEIVE','lines':[{'accountId':'00000000-0000-0000-0000-000000000433','taxCodeId':'00000000-0000-0000-0000-000000000016','basClass':'OTHER_GST_FREE','net':'1.00','tax':'0.00','description':'Synthetic explicitly reviewed recurring receipt','cashFlowCategory':'OPERATING'}]}}
                template=inc_write('/api/v1/recurring/templates',body,first=url if n==0 else legacy_url,second=legacy_url if n==0 else url)
                resumed=inc_write('/api/v1/recurring/templates/'+template['id']+'/change',{'action':'RESUME','reason':'Synthetic explicitly enable due schedule'},version=template['version'],status=200)
                assert resumed['state']=='ACTIVE',resumed
                proposal_templates.append(template['id'])
            tick=subprocess.run(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-c','BEGIN;SET LOCAL ROLE htt_worker;SELECT recurring.tick();SELECT recurring.tick();COMMIT;'],capture_output=True,text=True)
            assert tick.returncode==0,(tick.stdout,tick.stderr)
            proposals=[]
            for tid in proposal_templates:
                a=request('/api/v1/recurring/runs?templateId='+tid,actor,company);b=request('/api/v1/recurring/runs?templateId='+tid,actor,company,base=legacy_url)
                assert a==b and a[0]==200,(a,b)
                assert len(a[1]['items'])==1,(tid,a,request('/api/v1/recurring/templates/'+tid,actor,company),tick.stdout,tick.stderr)
                proposals.append(a[1]['items'][0])
            evidence={'occurredOn':today,'reference':'Synthetic recurring actual settlement '+uuid.uuid4().hex,'settledConfirmed':True,'noPriorPostingConfirmed':True}
            path='/api/v1/recurring/runs/'+proposals[0]['id']+'/review'
            assert request(path,actor,company,payload={'action':'APPROVE','reason':'Self-review prohibited','evidence':evidence},key='focused-self-recurring-'+uuid.uuid4().hex,version=proposals[0]['version'])[0]==403
            posted=inc_write(path,{'action':'APPROVE','reason':'Synthetic independent actual evidence','evidence':evidence},reviewer,version=proposals[0]['version'],status=200)
            if posted['state']!='APPROVED':
                payload=json.dumps(proposals[0]['payload']['lines']).replace("'","''")
                diagnostic="BEGIN;SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000503',true);SELECT accounting.post_general_banking('RECEIVE','00000000-0000-0000-0000-000000000430',NULL,'"+today+"'::date,'Synthetic diagnostic reference','Synthetic diagnostic reason','"+payload+"'::jsonb,NULL,NULL,true,NULL,NULL);ROLLBACK;"
                result=subprocess.run(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-c',diagnostic],capture_output=True,text=True)
                raise AssertionError((posted,result.stdout,result.stderr))
            assert posted['state']=='APPROVED' and posted['documentId'] is not None,posted
            path='/api/v1/recurring/runs/'+proposals[1]['id']+'/review'
            failed=inc_write(path,{'action':'APPROVE','reason':'Synthetic missing evidence test','evidence':{}},reviewer,version=proposals[1]['version'],status=200,first=legacy_url,second=url)
            assert failed['state']=='FAILED' and failed['documentId'] is None,failed
            retry=inc_write(path,{'action':'RETRY','reason':'Synthetic investigate failure'},reviewer,version=failed['version'],status=200)
            assert retry['state']=='DRAFT',retry
            rejected=inc_write(path,{'action':'REJECT','reason':'Synthetic independent rejection'},reviewer,version=retry['version'],status=200,first=legacy_url,second=url)
            assert rejected['state']=='REJECTED' and rejected['documentId'] is None,rejected
            checked=subprocess.run(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-c',verify],capture_output=True,text=True)
            assert checked.returncode==0,(checked.stdout,checked.stderr)
            print('PASS: recurring due proposal original worker-SQL fixture, independent reviewed synthetic posting, durable FAILED/retry/reject and GL reconciliation; no scheduler or sender process',flush=True)











        finally:
            legacy.terminate();legacy.wait(timeout=15)
            proc.terminate();proc.wait(timeout=15)
            server.shutdown()
