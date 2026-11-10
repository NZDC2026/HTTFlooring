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


            actor=token('test-operating-report');company='00000000-0000-0000-0000-000000000001'
            container=os.environ['HTT_FOCUSED_PG_CONTAINER']
            setup="""BEGIN;
              SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000500',true);
              DO $fixture$ DECLARE j record; fence uuid; BEGIN
               FOR j IN SELECT q.id FROM platform.document_jobs q JOIN platform.documents d ON d.company_id=q.company_id AND d.id=q.document_id WHERE q.kind='PDF' AND q.state='QUEUED' AND q.created_by='00000000-0000-0000-0000-000000000500' AND d.document_type IN('QUOTE','INVOICE') ORDER BY q.id LIMIT 2 LOOP
                fence:=gen_random_uuid();
                UPDATE platform.document_jobs SET state='PROCESSING',attempts=1,total_attempts=1,first_started_at=now(),lease_token=fence,lease_until=now()+interval '2 minutes' WHERE id=j.id;
                INSERT INTO platform.document_job_attempts(company_id,job_id,attempt,lease_token) VALUES('00000000-0000-0000-0000-000000000001',j.id,1,fence);
                IF NOT platform.finish_document_work(j.id,fence,'SUCCEEDED',NULL,convert_to('%PDF-1.4 synthetic queue-contract fixture only','UTF8'),NULL) THEN RAISE EXCEPTION 'Synthetic PDF finish failed';END IF;
               END LOOP;
              END $fixture$;
              SELECT json_agg(json_build_object('id',id,'documentId',document_id,'version',source_version,'fileId',output_file_id)ORDER BY id) FROM platform.document_jobs WHERE kind='PDF' AND state='SUCCEEDED' AND created_by='00000000-0000-0000-0000-000000000500';
              COMMIT;"""
            seeded=subprocess.run(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-At','-v','ON_ERROR_STOP=1','-c',setup],capture_output=True,text=True)
            assert seeded.returncode==0,seeded.stderr
            targets=next(json.loads(line) for line in seeded.stdout.splitlines() if line.startswith('['))
            assert len(targets)==2,targets
            for n,item in enumerate(targets):
                first,second=(url,legacy_url) if n==0 else (legacy_url,url)
                path='/api/v1/documents/'+item['documentId']+'/emails'
                body={'pdfJobId':item['id'],'to':[' Z@Example.Invalid ','a@example.invalid','z@example.invalid'],'subject':' Synthetic café + queue ','message':' Synthetic body'+chr(13)+chr(10)+'second line ','attachmentIds':[]}
                key='focused-mail-positive-'+uuid.uuid4().hex
                result=request(path,actor,company,base=first,payload=body,key=key,version=item['version'])
                assert result[0]==202,(path,result)
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda i:request(path,actor,company,base=first if i%2 else second,payload=body,key=key,version=item['version']),range(6)))
                assert all(x==result for x in attempts),(result,attempts)
                assert request(path,actor,company,base=second,payload={**body,'subject':'Different valid subject'},key=key,version=item['version'])[0]==409
                for backend in (first,second):
                    assert request(path,actor,company,base=backend,payload=body,key='mail-stale-'+uuid.uuid4().hex,version=item['version']+99)[0]==409
                    assert request(path,actor,company,base=backend,payload={**body,'attachmentIds':[item['fileId']]},key='mail-duplicate-pdf-'+uuid.uuid4().hex,version=item['version'])[0]==422
                    assert request('/api/v1/document-jobs/'+result[1]['id'],actor,company,base=backend)[1]['state']=='QUEUED'
            check="""DO $$ BEGIN
              IF (SELECT count(*) FROM platform.document_jobs WHERE kind='EMAIL')<>2
              OR EXISTS(SELECT 1 FROM platform.document_jobs WHERE kind='EMAIL' AND (state<>'QUEUED' OR attempts<>0 OR total_attempts<>0 OR provider_id IS NOT NULL OR payload->>'from'<>'synthetic-sender@example.invalid' OR payload->'to'<>'["a@example.invalid","z@example.invalid"]'::jsonb OR payload->>'subject'<>'Synthetic café + queue' OR jsonb_array_length(payload->'fileIds')<>1))
              OR EXISTS(SELECT 1 FROM platform.document_job_attempts a JOIN platform.document_jobs j ON j.company_id=a.company_id AND j.id=a.job_id WHERE j.kind='EMAIL')
              OR (SELECT count(*) FROM platform.audit_events WHERE action='documents.email_requested')<>2
              THEN RAISE EXCEPTION 'Synthetic queue contract diverged or sender attempted delivery'; END IF;
            END $$;"""
            validated=subprocess.run(['/Users/chandler/.docker/bin/docker','exec',container,'psql','-U','htt_owner','-d','htt_java_test','-v','ON_ERROR_STOP=1','-c',check],capture_output=True,text=True)
            assert validated.returncode==0,validated.stderr
            print('PASS: synthetic successful-PDF email queue contract, two host directions/six mixed replays, stale and auto-PDF guards; zero delivery attempts and no sender process',flush=True)
        finally:
            legacy.terminate();legacy.wait(timeout=15)
            proc.terminate();proc.wait(timeout=15)
            server.shutdown()
