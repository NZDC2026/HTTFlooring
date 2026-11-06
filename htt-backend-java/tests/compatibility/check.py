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

def token(subject, audience='staff', lifetime=900):
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

def request(path, jwt=None, company=None, grant=None, base=url, payload=None, key=None, version=None, content_type=None, method=None):
    if base.endswith((':15081',':15082')):
        pace_backend(base)
    headers = {} if jwt is None else {'Authorization':'Bearer '+jwt}
    if company is not None:
        headers['X-Company-Id'] = company
    if grant is not None:
        headers['X-Portal-Grant-Id'] = grant
    if version is not None:
        headers['If-Match'] = f'"{version}"'
    if payload is not None:
        headers.update({'Content-Type':content_type or 'application/json','Idempotency-Key':key})
    try:
        with urllib.request.urlopen(urllib.request.Request(base+path,headers=headers,method=method,data=None if payload is None else payload if isinstance(payload, bytes) else json.dumps(payload).encode()),timeout=5) as res:
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
    legacy_dll = here.parent/'dotnet-baseline/src/Htt.Host.Api/bin/Debug/net10.0/Htt.Host.Api.dll'
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
            if os.environ.get('HTT_COMPAT_UPLOAD_ONLY')=='1':
                employee=token('test-employee')
                company='00000000-0000-0000-0000-000000000001'
                for first,second in ((url,legacy_url),(legacy_url,url)):
                    item_id=str(uuid.uuid4())
                    created=request('/api/v1/crm/collaboration',employee,company,base=legacy_url,payload={
                        'id':item_id,'kind':'NOTE','customerId':'00000000-0000-0000-0000-000000000011',
                        'branchId':'00000000-0000-0000-0000-000000000012','data':{'text':'Synthetic async attachment'}},key='async-note-'+item_id)
                    assert created[0]==201, created
                    attachment='/api/v1/documents/'+item_id+'/attachments?fileName=async.png'
                    args=dict(payload=b'\x89PNG\r\n\x1a\n'+b'\0'*24,content_type='image/png',key='async-upload-'+item_id,version=1)
                    assert request(attachment,None,company,base=url,**args)[0]==401
                    assert request(attachment,token('test-purchase-reader'),company,base=url,**args)[0]==403
                    uploaded=request(attachment,employee,company,base=first,**args)
                    assert uploaded[0]==202, uploaded
                    assert request(attachment,employee,company,base=second,**args)==uploaded
                    if os.environ.get('HTT_STALL_TEST'):
                        verify_stalled_upload(attachment,employee,company,first)
                        verify_upload_deadline(attachment,employee,company,first)
                print('PASS: focused authorized async upload, bidirectional replay and unauthenticated/unauthorized rejection')
                raise SystemExit(0)
            assert request('/health/ready') == (200,{'status':'ready'})
            expected = {'companies':[{'actorId':'00000000-0000-0000-0000-000000000002',
                        'companyId':'00000000-0000-0000-0000-000000000001','companyName':'Synthetic HTT',
                        'membershipId':'00000000-0000-0000-0000-000000000003','permissions':['crm.maps.read','customers.all','customers.read']}]}
            actual = request('/api/v1/me',token('test-employee'))
            assert actual[0] == 200, actual
            other = '00000000-0000-0000-0000-000000000021'
            assert {entry['companyId'] for entry in actual[1]['companies']} == {other, expected['companies'][0]['companyId']}
            actual[1]['companies'][:] = [entry for entry in actual[1]['companies'] if entry['companyId'] != other]
            expected['companies'][0]['permissions'] += ['crm.collaboration.read','crm.visits.write','documents.attachments.write','documents.files.read','crm.notes.write','crm.boards.write','catalog.read','foundation.read','accounting.read','audit.read','customers.write','catalog.write','pricing.read','sales.quotes.read','sales.quotes.write','sales.quotes.approve','sales.orders.read','sales.credit.read','warehouses.all','sales.orders.create','inventory.read','sales.orders.cancel','sales.invoices.read','sales.invoices.write','accounting.receipts.read','accounting.receipts.write','accounting.banks.use','accounting.receivables.read','inventory.picks.read','inventory.picks.write','inventory.dispatch','inventory.opening.write','purchase.orders.read','purchase.orders.write','purchase.cost.read','purchase.orders.confirm','purchase.orders.close','purchase.receipts.read','purchase.receipts.write','purchase.grni.read','purchase.bills.read','purchase.bills.post','purchase.payments.read','purchase.payments.post','purchase.ap.read','purchase.advances.apply','purchase.advances.unapply','purchase.payments.reverse','purchase.bills.variance.post','purchase.payments.reapply','purchase.input_gst.read','accounting.advances.apply','accounting.advances.unapply','accounting.receipts.reverse','accounting.receipts.reapply','accounting.refunds.read','accounting.refunds.write','accounting.refunds.reverse','accounting.refunds.correct','sales.credits.read','sales.credits.write','sales.credits.adjust','inventory.returns.read','inventory.returns.write','accounting.gst.read','sales.credits.apply','sales.credits.unapply']
            expected['companies'][0]['permissions'] += ['purchase.returns.post','purchase.returns.read','purchase.credits.post','purchase.credits.read','purchase.credits.apply','purchase.credits.unapply']
            expected['companies'][0]['permissions'] += ['purchase.refunds.post','purchase.refunds.read']
            expected['companies'][0]['permissions'] += ['purchase.refunds.reverse','purchase.refunds.correct']
            expected['companies'][0]['permissions'] += ['purchase.expense_bills.post','purchase.expense_credits.post','purchase.credits.adjust']
            expected['companies'][0]['permissions'].sort()
            actual[1]['companies'][0]['permissions'].sort()
            assert actual == (200,expected), actual
            assert request('/api/v1/me',token('unknown')) == (200,{'companies':[]})
            assert request('/api/v1/me',token('test-employee','portal'))[0] == 401
            assert request('/api/v1/me')[0] == 401
            branches = '/api/v1/crm/map/branches'
            employee = token('test-employee')
            company = expected['companies'][0]['companyId']
            branch = '00000000-0000-0000-0000-000000000012'
            code, body = request(branches+'?geocodeState=LOCATED&status=ACTIVE&page=1&pageSize=50',employee,company)
            assert code == 200 and body['total'] == 1 and body['items'][0]['id'] == branch, (code,body)
            for _ in range(4):
                assert request(branches,employee,other) == (200,{'total':0,'items':[]})
                assert any(item['id']==branch for item in request(branches,employee,company)[1]['items'])
            def isolated_lookup(index):
                scope = company if index % 2 == 0 else other
                status, result = request(branches, employee, scope)
                expected_ids={'00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000073','00000000-0000-0000-0000-000000000260','00000000-0000-0000-0000-000000000261'} if scope==company else set()
                assert status==200 and result['total']==len(expected_ids) and {item['id'] for item in result['items']}==expected_ids,(status,result)
            with ThreadPoolExecutor(max_workers=8) as executor:
                list(executor.map(isolated_lookup, range(32)))
            assert request(branches,employee)[0] == 400
            assert request(branches,employee,'00000000-0000-0000-0000-000000000099')[0] == 403
            code, body = request(branches+'?pageSize=101',employee,company)
            assert code == 422 and 'page' in json.loads(body)['fieldErrors']
            portal = '/api/portal/v1'
            portal_token = token('test-portal','portal')
            code, body = request(portal+'/me',portal_token)
            grant = '00000000-0000-0000-0000-000000000013'
            assert code == 200 and body['contexts'][0]['grantId'] == grant, (code,body)
            code, body = request(portal+'/branches',portal_token,company,grant)
            assert code == 200 and body['items'][0]['id'] == branch, (code,body)
            for resource in ('warehouses','products'):
                code, body = request(portal+'/'+resource+'?branchId='+branch,portal_token,company,grant)
                assert code == 200, (resource,code,body)
                if resource == 'warehouses':
                    assert body['items'][0]['id'] == '00000000-0000-0000-0000-000000000014', body
                else:
                    product = '00000000-0000-0000-0000-000000000017'
                    assert body['items'][0]['id'] == product, body
            code, body = request(portal+'/products/'+product+'?branchId='+branch,portal_token,company,grant)
            assert code == 200 and body['id'] == product, (code,body)
            code, body = request(portal+'/products/'+product+'/availability?branchId='+branch,portal_token,company,grant)
            assert code == 200 and body['productId'] == product and float(body['available']) > 0, (code,body)
            missing_product = portal+'/products/00000000-0000-0000-0000-000000000099'
            for suffix in ('','/availability'):
                assert request(missing_product+suffix+'?branchId='+branch,portal_token,company,grant)[0] == 404
            assert request(portal+'/branches',portal_token,company,branch)[0] == 403
            assert request(portal+'/me',employee)[0] == 401
            assert request('/api/v1/me',portal_token)[0] == 401
            assert request(portal+'/branches',portal_token)[0] == 400
            assert request(portal+'/me',token('test-employee','portal'))[0] == 403
            unit_id = request('/api/v1/products/'+product+'/units',employee,company)[1][0]['id']
            price_path = '/api/v1/pricing/resolve?customerId=00000000-0000-0000-0000-000000000011&productUnitId='
            price = request(price_path+unit_id,employee,company)
            assert price[0] == 200 and price[1]['unitPrice'] == '45.00000000' and price[1]['source'] == 'CUSTOMER', price
            quote = request('/api/v1/quotes',employee,company,base=url,payload={
                'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                'warehouseId':'00000000-0000-0000-0000-000000000014',
                'lines':[{'productUnitId':unit_id,'quantity':2}]},key='legacy-quote-'+str(uuid.uuid4()))
            assert quote[0] == 201, quote
            assert quote[1]['id'] in [item['id'] for item in request('/api/v1/quotes',employee,company)[1]['items']]
            for first, second in ((legacy_url,url),(url,legacy_url)):
                quote_args=dict(payload={'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                    'warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':unit_id,'quantity':2}],'notes':' Synthetic café & quote '},key='review-quote-'+str(uuid.uuid4()))
                for target in (first,second):
                    assert request('/api/v1/quotes',None,company,base=target,**quote_args)[0]==401
                    rejected=request('/api/v1/quotes',token('test-purchase-reader'),company,base=target,**quote_args)
                    assert rejected[0]==403,rejected
                draft=request('/api/v1/quotes',employee,company,base=first,**quote_args)
                assert draft[0]==201,draft
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request('/api/v1/quotes',employee,company,base=first if n%2 else second,**quote_args),range(6)))
                assert all(result==draft for result in attempts),attempts
                changed={**quote_args['payload'],'notes':'Changed quote'}
                assert request('/api/v1/quotes',employee,company,base=second,payload=changed,key=quote_args['key'])[0]==409
                path = '/api/v1/quotes/'+draft[1]['id']
                update_args=dict(payload={**quote_args['payload'],'lines':[{'productUnitId':unit_id,'quantity':3}],'notes':' Updated café quote '},key='quote-update-'+draft[1]['id'],version=1,method='PUT')
                for target in (first,second):
                    assert request(path,None,company,base=target,**update_args)[0]==401
                    assert request(path,employee,company,base=target,**{k:v for k,v in update_args.items() if k!='version'})[0]==428
                updated=request(path,employee,company,base=first,**update_args)
                assert updated[0]==200 and updated[1]['status']=='DRAFT' and updated[1]['version']==2,updated
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,employee,company,base=first if n%2 else second,**update_args),range(6)))
                assert all(result==updated for result in attempts),attempts
                refreshed=request(path,employee,company)
                assert refreshed==request(path,employee,company,base=legacy_url) and float(refreshed[1]['gross'])==135,refreshed
                assert request(path,employee,company,base=second,**{**update_args,'key':'stale-update-'+uuid.uuid4().hex})[0]==409
                submit_args=dict(payload={},key='submit-'+draft[1]['id'],version=updated[1]['version'])
                submitted=request(path+'/submit',employee,company,base=second,**submit_args)
                assert submitted[0]==200 and submitted[1]['status']=='SUBMITTED',submitted
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path+'/submit',employee,company,base=first if n%2 else second,**submit_args),range(6)))
                assert all(result==submitted for result in attempts),attempts
                for target in (first,second):
                    frozen=request(path,employee,company,base=target,**{**update_args,'version':submitted[1]['version'],'key':'frozen-update-'+uuid.uuid4().hex})
                    assert frozen[0]==409 and json.loads(frozen[1])['code']=='quote_frozen',frozen
                    duplicate=request(path+'/submit',employee,company,base=target,**{**submit_args,'version':submitted[1]['version'],'key':'resubmit-'+uuid.uuid4().hex})
                    assert duplicate[0]==409 and json.loads(duplicate[1])['code']=='quote_not_draft',duplicate
                args = dict(payload={'reason':'  Synthetic café & office review  '},
                    key='return-'+draft[1]['id'],version=submitted[1]['version'])
                assert request(path+'/return-to-draft',token('test-purchase-reader'),company,base=first,**args)[0] == 403
                assert request(path+'/return-to-draft',employee,company,base=first,
                    payload=args['payload'],key=args['key'])[0] == 428
                returned = request(path+'/return-to-draft',employee,company,base=first,**args)
                assert returned[0] == 200 and returned[1]['status'] == 'DRAFT', returned
                assert returned[1]['number'] == submitted[1]['number']
                assert returned[1]['version'] == submitted[1]['version']+1
                replayed = request(path+'/return-to-draft',employee,company,base=second,**args)
                assert replayed == returned, (first, returned, replayed)
                changed = dict(args,payload={'reason':'Different review'})
                assert request(path+'/return-to-draft',employee,company,base=second,**changed)[0] == 409
                assert request(path+'/return-to-draft',employee,company,base=second,
                    payload=args['payload'],key='stale-'+args['key'],version=submitted[1]['version'])[0] == 409
                invalid = request(path+'/return-to-draft',employee,company,base=second,
                    payload=args['payload'],key='draft-'+args['key'],version=returned[1]['version'])
                assert invalid[0] == 409, invalid
                view = request(path,employee,company)
                assert view == request(path,employee,company,base=legacy_url)
                assert view[1]['status'] == 'DRAFT' and view[1]['version'] == returned[1]['version']
            print('PASS: bidirectional quote return-to-draft replay, number retention, stale/permission/state gates')

            order = request('/api/v1/sales-orders',employee,company,base=url,payload={
                'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                'warehouseId':'00000000-0000-0000-0000-000000000014',
                'lines':[{'productUnitId':unit_id,'quantity':2}], 'reason':'Synthetic customer instruction'},
                key='legacy-order-'+str(uuid.uuid4()))
            assert order[0] == 201, order
            order_path = '/api/v1/sales-orders/'+order[1]['orderId']
            order_view = request(order_path,employee,company)
            assert order_view[0] == 200 and len(order_view[1]['lines']) == 1, order_view
            warehouse_path = '/api/v1/inventory/availability?warehouseId=00000000-0000-0000-0000-000000000014'
            inventory = request(warehouse_path,employee,company)
            assert inventory[0] == 200 and float(inventory[1]['items'][0]['reserved']) >= 2, inventory
            quote_path = '/api/v1/quotes/'+quote[1]['id']
            quote_view = request(quote_path,employee,company)
            assert quote_view[0] == 200 and len(quote_view[1]['lines']) == 1, quote_view
            invoiceable_path = order_path+'/invoiceable'
            invoiceable = request(invoiceable_path,employee,company)
            assert invoiceable[0] == 200 and float(invoiceable[1]['lines'][0]['availableQuantity']) == 0, invoiceable
            invoice_write_path = order_path+'/invoices'
            invoice_payload = {'lines':[{'orderLineId':order_view[1]['lines'][0]['id'],'quantity':1}]}
            for payload, version in ((invoice_payload,1),(invoice_payload,None),({'lines':[]},1)):
                opts = dict(payload=payload,key='invoice-denied-'+str(uuid.uuid4()),version=version)
                new_invoice = request(invoice_write_path,employee,company,base=url,**opts)
                old_invoice = request(invoice_write_path,employee,company,base=legacy_url,**opts)
                assert new_invoice[0] == old_invoice[0] and new_invoice[0] >= 400,(new_invoice,old_invoice)
                assert json.loads(new_invoice[1])['code'] == json.loads(old_invoice[1])['code'],(new_invoice,old_invoice)
            warehouse_orders = '/api/v1/warehouse/orders?warehouseId=00000000-0000-0000-0000-000000000014'
            warehouse_order = '/api/v1/warehouse/orders/'+order[1]['orderId']
            detail = request(warehouse_order,employee,company)
            assert detail[0] == 200 and len(detail[1]['lines']) == 1, detail
            supplier = '00000000-0000-0000-0000-000000000043'
            purchase = request('/api/v1/purchase-orders',employee,company,base=legacy_url,payload={
                'supplierId':supplier,'warehouseId':'00000000-0000-0000-0000-000000000014',
                'lines':[{'productUnitId':unit_id,'quantity':2,'unitCost':15,
                          'taxCodeId':'00000000-0000-0000-0000-000000000016'}]},
                key='legacy-po-'+str(uuid.uuid4()))
            assert purchase[0] == 201, purchase
            purchase_path = '/api/v1/purchase-orders/'+purchase[1]['order']['id']
            buyer = token('test-purchase-reader')
            po = request(purchase_path,employee,company)
            hidden = request(purchase_path,buyer,company)
            assert po[0] == 200 and float(po[1]['lines'][0]['unitCost']) == 15, po
            assert hidden[0] == 200 and 'unitCost' not in hidden[1]['lines'][0] and 'gross' not in hidden[1]['order'], hidden
            cases = [
                ('/api/v1/accounting/ap',employee,company,None),
                ('/api/v1/accounting/ap?supplierId='+supplier,employee,company,None),
                ('/api/v1/accounting/ap?pageSize=101',employee,company,None),
                ('/api/v1/supplier-bills?supplierId='+supplier,employee,company,None),
                ('/api/v1/suppliers/'+supplier+'/payments',employee,company,None),
                ('/api/v1/suppliers/00000000-0000-0000-0000-000000000099/payments',employee,company,None),

                (purchase_path,employee,company,None),(purchase_path,buyer,company,None),
                ('/api/v1/purchase-orders?supplierId='+supplier+'&status=DRAFT',employee,company,None),
                ('/api/v1/purchase-orders',buyer,company,None),
                ('/api/v1/purchase-orders?status=INVALID',buyer,company,None),

                (warehouse_order,employee,company,None),
                (warehouse_orders,employee,company,None),
                (warehouse_orders+'&pageSize=101',employee,company,None),
                (warehouse_orders.replace('000000000014','000000000099'),employee,company,None),

                ('/api/v1/customer-receipts/00000000-0000-0000-0000-000000000099',employee,company,None),
                ('/api/v1/customers/00000000-0000-0000-0000-000000000011/receipts?pageSize=101',employee,company,None),

                ('/api/v1/sales-invoices/00000000-0000-0000-0000-000000000099',employee,company,None),

                (invoiceable_path,employee,company,None),
                ('/api/v1/sales-invoices',employee,company,None),
                ('/api/v1/sales-invoices?orderId='+order[1]['orderId'],employee,company,None),
                ('/api/v1/sales-invoices?customerId=00000000-0000-0000-0000-000000000099',employee,company,None),
                ('/api/v1/sales-invoices?pageSize=101',employee,company,None),

                (order_path,employee,company,None),
                (warehouse_path,employee,company,None),
                (warehouse_path+'&productId='+product,employee,company,None),
                (warehouse_path+'&pageSize=101',employee,company,None),
                (warehouse_path.replace('000000000014','000000000099'),employee,company,None),

                (quote_path,employee,company,None),
                ('/api/v1/quotes/00000000-0000-0000-0000-000000000099',employee,company,None),
                ('/api/v1/sales-orders/00000000-0000-0000-0000-000000000099',employee,company,None),

                ('/api/v1/quotes',employee,company,None),
                ('/api/v1/quotes?pageSize=101',employee,company,None),
                ('/api/v1/sales-orders',employee,company,None),
                ('/api/v1/customers/00000000-0000-0000-0000-000000000011/credit',employee,company,None),
                ('/api/v1/customers/00000000-0000-0000-0000-000000000099/credit',employee,company,None),

                (price_path+unit_id,employee,company,None),
                (price_path+'00000000-0000-0000-0000-000000000099',employee,company,None),
                (price_path.replace('000000000011','000000000099')+unit_id,employee,company,None),

                ('/health/live',None,None,None), ('/health/ready',None,None,None),
                ('/api/v1/me',employee,None,None), ('/api/v1/me',token('unknown'),None,None),
                ('/api/v1/me',portal_token,None,None), ('/api/v1/me',None,None,None),
                (branches+'?geocodeState=LOCATED&status=ACTIVE&page=1&pageSize=50',employee,company,None),
                (branches,employee,None,None), (branches,employee,other,None),
                (branches,employee,'00000000-0000-0000-0000-000000000099',None),
                (branches+'?pageSize=101',employee,company,None),
                ('/api/v1/accounting/accounts',employee,company,None),
                ('/api/v1/accounting/tax-rates',employee,company,None),
                ('/api/v1/audit?page=1&pageSize=5',employee,company,None),
                ('/api/v1/audit?pageSize=101',employee,company,None),
                ('/api/v1/accounting/accounts',employee,other,None),
                ('/api/v1/foundation',employee,company,None),
                ('/api/v1/customers?search=Synthetic',employee,company,None),
                ('/api/v1/customers?search=%25',employee,company,None),
                ('/api/v1/customers',employee,other,None),
                ('/api/v1/customers?search='+'x'*101,employee,company,None),
                ('/api/v1/products',employee,company,None),
                ('/api/v1/products?pageSize=101',employee,company,None),
                ('/api/v1/products/'+product+'/units',employee,company,None),
                (portal+'/me',portal_token,None,None), (portal+'/me',employee,None,None),
                (portal+'/branches',portal_token,company,grant), (portal+'/branches',portal_token,company,branch),
                (portal+'/warehouses?branchId='+branch,portal_token,company,grant),
                (portal+'/products?branchId='+branch,portal_token,company,grant),
                (portal+'/products/'+product+'?branchId='+branch,portal_token,company,grant),
                (portal+'/products/'+product+'/availability?branchId='+branch,portal_token,company,grant),
                (missing_product+'?branchId='+branch,portal_token,company,grant)]
            def normalize(body):
                if isinstance(body, str) and body.startswith('{'):
                    body = json.loads(body)
                if isinstance(body, dict):
                    return {k:normalize(v) for k,v in body.items() if k not in ('dataAsOf','requestId','serverTime','pricingAt')}
                if isinstance(body,list):
                    return sorted((normalize(v) for v in body),key=lambda v:json.dumps(v,sort_keys=True))
                return body
            for path, jwt, scope, grant_id in cases:
                java_status, java_body = request(path,jwt,scope,grant_id)
                old_status, old_body = request(path,jwt,scope,grant_id,legacy_url)
                assert java_status == old_status, (path,java_status,old_status,old_body)
                assert normalize(java_body) == normalize(old_body), (path,java_body,old_body)
            for first, second in ((legacy_url,url),(url,legacy_url)):
                service = request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
                    'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                    'warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':'00000000-0000-0000-0000-000000000032','quantity':2}],
                    'reason':'Synthetic completed service'},key='service-order-'+str(uuid.uuid4()))
                assert service[0] == 201, service
                service_path = '/api/v1/sales-orders/'+service[1]['orderId']
                eligible = request(service_path+'/invoiceable',employee,company)
                assert eligible[0] == 200 and float(eligible[1]['lines'][0]['availableQuantity']) == 2, eligible
                assert eligible == request(service_path+'/invoiceable',employee,company,base=legacy_url)
                args = dict(payload={'lines':[{'orderLineId':eligible[1]['lines'][0]['id'],'quantity':1}],
                                     'fulfilmentReference':' Completed café + fixture '},
                            key='invoice-service-'+str(uuid.uuid4()),version=service[1]['version'])
                posted = request(service_path+'/invoices',employee,company,base=first,**args)
                assert posted[0] == 201 and float(posted[1]['gross']) == 50 and posted[1]['journalEntryId'], posted
                assert request(service_path+'/invoices',employee,company,base=second,**args) == posted
                invoice_path = '/api/v1/sales-invoices/'+posted[1]['id']
                assert request(invoice_path,employee,company) == request(invoice_path,employee,company,base=legacy_url) == (200,posted[1])
                receipt_list = '/api/v1/customers/00000000-0000-0000-0000-000000000011/receipts'
                receipt_args = dict(payload={
                    'amount':20.00,'method':'BANK_TRANSFER','reference':'  Synthetic café + payment '+uuid.uuid4().hex+'  ',
                    'allocations':[{'invoiceLineId':posted[1]['lines'][0]['id'],'amount':20.00}]},
                    key='parity-receipt-'+str(uuid.uuid4()))
                if first == url:
                    receipt_args['payload']['bankAccountId'] = '00000000-0000-0000-0000-000000000038'
                receipt = request(receipt_list,employee,company,base=first,**receipt_args)
                assert receipt[0] == 201, receipt
                assert request(receipt_list,employee,company,base=second,**receipt_args) == receipt
                assert request('/api/v1/customer-receipts/'+receipt[1]['id'],employee,company) == (200,receipt[1])
                assert request(receipt_list,employee,company) == request(receipt_list,employee,company,base=legacy_url)
                gst_path = invoice_path+'/gst'
                gst = request(gst_path,employee,company)
                assert gst == request(gst_path,employee,company,base=legacy_url) and len(gst[1]['entries']) == 1, gst
                ar_path = '/api/v1/customers/00000000-0000-0000-0000-000000000011/receivables?pageSize=100'
                ar = request(ar_path,employee,company)
                assert ar == request(ar_path,employee,company,base=legacy_url)
                entry = next(item for item in ar[1]['items'] if item['invoiceId'] == posted[1]['id'])
                assert float(entry['paid']) == 20 and float(entry['outstanding']) == 30, entry
                after = request(service_path+'/invoiceable',employee,company)
                assert float(after[1]['lines'][0]['availableQuantity']) == 1, after
                reverse_args = dict(payload={'reference':'Direct receipt reversal '+uuid.uuid4().hex,
                    'reason':'Synthetic reversal of partially settled invoice'},key='direct-reverse-'+uuid.uuid4().hex)
                reverse_path = '/api/v1/customer-receipts/'+receipt[1]['id']+'/reverse'
                reversed_direct = request(reverse_path,employee,company,base=first,**reverse_args)
                assert reversed_direct[0]==201, reversed_direct
                assert request(reverse_path,employee,company,base=second,**reverse_args)==reversed_direct
                ar = request(ar_path,employee,company)
                assert ar==request(ar_path,employee,company,base=legacy_url)
                entry=next(item for item in ar[1]['items'] if item['invoiceId']==posted[1]['id'])
                assert float(entry['paid'])==0 and float(entry['outstanding'])==50, entry
                reversal_view='/api/v1/receipt-reversals/'+reversed_direct[1]['reversal']['id']
                assert request(reversal_view,employee,company)==request(reversal_view,employee,company,base=legacy_url)==(200,reversed_direct[1])
                reapply_path='/api/v1/receipt-reversals/'+reversed_direct[1]['reversal']['id']+'/reapply'
                reapply_args=dict(payload={'reference':' Customer café reapplication '+uuid.uuid4().hex,
                    'reason':' Synthetic corrected receipt allocation ',
                    'allocations':[{'invoiceLineId':posted[1]['lines'][0]['id'],'amount':20}]},key='customer-reapply-'+uuid.uuid4().hex)
                assert request(reapply_path,token('test-purchase-reader'),company,base=first,**reapply_args)[0]==403
                invalid=dict(payload={**reapply_args['payload'],'allocations':[{'invoiceLineId':posted[1]['lines'][0]['id'],'amount':21}]},
                    key='customer-over-reapply-'+uuid.uuid4().hex)
                rejected=[request(reapply_path,employee,company,base=target,**invalid) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(reapply_path,employee,company,
                        base=first if n%2 else second,**reapply_args),range(6)))
                reapplied=attempts[0]
                assert reapplied[0]==201 and all(result==reapplied for result in attempts), attempts
                assert reapplied[1]['reversalId']==reversed_direct[1]['reversal']['id'], reapplied
                assert request('/api/v1/customer-receipts/'+reapplied[1]['receipt']['id'],employee,company)==(200,reapplied[1]['receipt'])
                ar=request(ar_path,employee,company)
                entry=next(item for item in ar[1]['items'] if item['invoiceId']==posted[1]['id'])
                assert float(entry['paid'])==20 and float(entry['outstanding'])==30, entry
                reallocate_path='/api/v1/customer-receipts/'+reapplied[1]['receipt']['id']+'/reallocate'
                reallocate_args=dict(payload={'reversalReference':'Customer allocation reversal '+uuid.uuid4().hex,
                    'reference':'Customer reallocation '+uuid.uuid4().hex,'reason':'Synthetic move to remaining service advance',
                    'advances':[{'orderLineId':eligible[1]['lines'][0]['id'],'amount':20}]},key='customer-reallocate-'+uuid.uuid4().hex)
                failing=dict(payload={**reallocate_args['payload'],'advances':[{'orderLineId':eligible[1]['lines'][0]['id'],'amount':21}]},
                    key='customer-over-reallocate-'+uuid.uuid4().hex)
                rejected=[request(reallocate_path,employee,company,base=target,**failing) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                active=request('/api/v1/customer-receipts/'+reapplied[1]['receipt']['id'],employee,company)
                assert active[1]['settlementStatus']=='ACTIVE', active
                ar=request(ar_path,employee,company)
                entry=next(item for item in ar[1]['items'] if item['invoiceId']==posted[1]['id'])
                assert float(entry['paid'])==20 and float(entry['outstanding'])==30, entry
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(reallocate_path,employee,company,
                        base=first if n%2 else second,**reallocate_args),range(6)))
                reallocated=attempts[0]
                assert reallocated[0]==201 and all(result==reallocated for result in attempts), attempts
                assert float(reallocated[1]['receipt']['advanceAmount'])==20, reallocated
                assert request('/api/v1/customer-receipts/'+reallocated[1]['receipt']['id'],employee,company,base=legacy_url)==(200,reallocated[1]['receipt'])
                original_reversal=request(reversal_view,employee,company)
                assert original_reversal==request(reversal_view,employee,company,base=legacy_url)
                assert original_reversal[1]['reversal']['replacementReceiptId']==reapplied[1]['receipt']['id'], original_reversal
                ar=request(ar_path,employee,company)
                entry=next(item for item in ar[1]['items'] if item['invoiceId']==posted[1]['id'])
                assert float(entry['paid'])==0 and float(entry['outstanding'])==50, entry
                cleanup=dict(payload={'reference':'Synthetic final reversal '+uuid.uuid4().hex,'reason':'Finish reallocation fixture'},
                    key='finish-reallocation-'+uuid.uuid4().hex)
                cleanup_path='/api/v1/customer-receipts/'+reallocated[1]['receipt']['id']+'/reverse'
                finished=request(cleanup_path,employee,company,base=first,**cleanup)
                assert finished[0]==201, finished
                assert request(cleanup_path,employee,company,base=second,**cleanup)==finished
                customer='00000000-0000-0000-0000-000000000011'
                deposit_args=dict(payload={'amount':20,'method':'BANK_TRANSFER','reference':'Refundable deposit '+uuid.uuid4().hex,
                    'advances':[{'orderLineId':eligible[1]['lines'][0]['id'],'amount':20}]},key='refund-deposit-'+uuid.uuid4().hex)
                refundable=request('/api/v1/customers/'+customer+'/receipts',employee,company,base=first,**deposit_args)
                assert refundable[0]==201, refundable
                advance=refundable[1]['advances'][0]['id']
                refund_path='/api/v1/customers/'+customer+'/refunds'
                refund_args=dict(payload={'amount':20,'reference':' Refund café & deposit '+uuid.uuid4().hex,
                    'reason':' Synthetic customer refund request ','advanceId':advance},key='customer-refund-'+uuid.uuid4().hex)
                if first==url:
                    refund_args['payload']['bankAccountId']='00000000-0000-0000-0000-000000000038'
                assert request(refund_path,token('test-purchase-reader'),company,base=first,**refund_args)[0]==403
                invalid_null=dict(payload={**refund_args['payload'],'cancelOrder':None},key='null-cancel-refund-'+uuid.uuid4().hex)
                null_results=[request(refund_path,employee,company,base=target,**invalid_null) for target in (first,second)]
                assert null_results[0][0]==null_results[1][0]==400, null_results
                over=dict(payload={**refund_args['payload'],'amount':21},key='over-refund-'+uuid.uuid4().hex)
                rejected=[request(refund_path,employee,company,base=target,**over) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                # Force each backend to execute one original mutation, then stress replay.
                first_refund=request(refund_path,employee,company,base=first,**refund_args)
                assert first_refund[0]==201, first_refund
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(refund_path,employee,company,
                        base=first if n%2 else second,**refund_args),range(6)))
                refunded=attempts[0]
                assert refunded==first_refund and all(result==refunded for result in attempts), attempts
                assert float(refunded[1]['amount'])==20 and refunded[1]['refundStatus']=='ACTIVE', refunded
                detail_path='/api/v1/customer-refunds/'+refunded[1]['id']
                assert request(detail_path,employee,company)==request(detail_path,employee,company,base=legacy_url)==(200,refunded[1])
                listed=request(refund_path,employee,company)
                assert listed==request(refund_path,employee,company,base=legacy_url)
                assert any(item['id']==refunded[1]['id'] for item in listed[1]['items']), listed
                for query in ('?pageSize=1','?page=0','?pageSize=101'):
                    actual=request(refund_path+query,employee,company)
                    other=request(refund_path+query,employee,company,base=legacy_url)
                    assert actual[0]==other[0] and normalize(actual[1])==normalize(other[1]), (actual,other)
                changed=dict(payload={**refund_args['payload'],'reason':'Different refund reason'},key=refund_args['key'])
                assert request(refund_path,employee,company,base=second,**changed)[0]==409
                reverse_path='/api/v1/customer-refunds/'+refunded[1]['id']+'/reverse'
                reversal_args=dict(payload={'reference':' Refund café reversal '+uuid.uuid4().hex,
                    'reason':' Synthetic refund correction '},key='reverse-customer-refund-'+uuid.uuid4().hex)
                assert request(reverse_path,token('test-purchase-reader'),company,base=first,**reversal_args)[0]==403
                reversed_refund=request(reverse_path,employee,company,base=first,**reversal_args)
                assert reversed_refund[0]==201, reversed_refund
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(reverse_path,employee,company,
                        base=first if n%2 else second,**reversal_args),range(6)))
                assert all(result==reversed_refund for result in attempts), attempts
                reversed_view='/api/v1/customer-refund-reversals/'+reversed_refund[1]['reversal']['id']
                assert request(reversed_view,employee,company)==request(reversed_view,employee,company,base=legacy_url)==(200,reversed_refund[1])
                original_refund=request(detail_path,employee,company)
                assert original_refund==request(detail_path,employee,company,base=legacy_url)
                assert original_refund[1]['refundStatus']=='REVERSED', original_refund
                duplicate=dict(payload=reversal_args['payload'],key='duplicate-refund-reversal-'+uuid.uuid4().hex)
                rejected=[request(reverse_path,employee,company,base=target,**duplicate) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0]==409, rejected
                changed=dict(payload={**reversal_args['payload'],'reason':'Different reversal reason'},key=reversal_args['key'])
                assert request(reverse_path,employee,company,base=second,**changed)[0]==409
                restored_credit=request('/api/v1/customers/'+customer+'/credit',employee,company)
                assert restored_credit==request('/api/v1/customers/'+customer+'/credit',employee,company,base=legacy_url)
                assert float(restored_credit[1]['availableAdvances'])==20, restored_credit
                correction_path=reversed_view+'/correct'
                correction_args=dict(payload={'reference':' Correct café refund '+uuid.uuid4().hex,
                    'reason':' Synthetic replacement refund ','amount':20,'advanceId':advance,
                    'bankAccountId':{'ignored':'unknown field'},'reversalReference':{'ignored':True}},key='replace-refund-'+uuid.uuid4().hex)
                assert request(correction_path,token('test-purchase-reader'),company,base=first,**correction_args)[0]==403
                over=dict(payload={**correction_args['payload'],'amount':21},key='over-replace-refund-'+uuid.uuid4().hex)
                rejected=[request(correction_path,employee,company,base=target,**over) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                replacement=request(correction_path,employee,company,base=second,**correction_args)
                assert replacement[0]==201, replacement
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(correction_path,employee,company,
                        base=first if n%2 else second,**correction_args),range(6)))
                assert all(result==replacement for result in attempts), attempts
                assert replacement[1]['refund']['originalRefundId']==refunded[1]['id'], replacement
                assert replacement[1]['refund']['bankAccountId']==refunded[1]['bankAccountId'], replacement
                relation=request(reversed_view,employee,company)
                assert relation==request(reversed_view,employee,company,base=legacy_url)
                assert relation[1]['reversal']['replacementRefundId']==replacement[1]['refund']['id'], relation
                atomic_path='/api/v1/customer-refunds/'+replacement[1]['refund']['id']+'/correct'
                atomic_args=dict(payload={'reversalReference':' Atomic café reversal '+uuid.uuid4().hex,
                    'reference':' Atomic café corrected refund '+uuid.uuid4().hex,
                    'reason':' Synthetic atomic refund correction ','amount':20,'advanceId':advance,
                    'bankAccountId':{'ignored':'unknown field'}},
                    key='atomic-refund-'+uuid.uuid4().hex)
                over=dict(payload={**atomic_args['payload'],'amount':21},key='over-atomic-refund-'+uuid.uuid4().hex)
                rejected=[request(atomic_path,employee,company,base=target,**over) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                active_path='/api/v1/customer-refunds/'+replacement[1]['refund']['id']
                active=request(active_path,employee,company)
                assert active==request(active_path,employee,company,base=legacy_url)
                assert active[1]['refundStatus']=='ACTIVE', active
                credit=request('/api/v1/customers/'+customer+'/credit',employee,company)
                assert float(credit[1]['availableAdvances'])==0, credit
                corrected=request(atomic_path,employee,company,base=first,**atomic_args)
                assert corrected[0]==201, corrected
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(atomic_path,employee,company,
                        base=first if n%2 else second,**atomic_args),range(6)))
                assert all(result==corrected for result in attempts), attempts
                assert corrected[1]['refund']['originalRefundId']==replacement[1]['refund']['id'], corrected
                assert corrected[1]['refund']['bankAccountId']==refunded[1]['bankAccountId'], corrected
                final_path='/api/v1/customer-refunds/'+corrected[1]['refund']['id']
                assert request(final_path,employee,company)==request(final_path,employee,company,base=legacy_url)==(200,corrected[1]['refund'])
                credit=request('/api/v1/customers/'+customer+'/credit',employee,company)
                assert float(credit[1]['availableAdvances'])==0, credit
                changed=dict(payload={**atomic_args['payload'],'reason':'Different correction reason'},key=atomic_args['key'])
                assert request(atomic_path,employee,company,base=second,**changed)[0]==409




            for first, second, taxable in ((legacy_url,url,False),(url,legacy_url,False),(legacy_url,url,True),(url,legacy_url,True)):
                advance_amount=22 if taxable else 20
                invoice_gross=55 if taxable else 50
                service = request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
                    'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                    'warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':('00000000-0000-0000-0000-000000000077' if taxable else '00000000-0000-0000-0000-000000000032'),'quantity':2}],
                    'reason':'Synthetic customer advance application'},key='advance-order-'+uuid.uuid4().hex)
                assert service[0] == 201, service
                order_path = '/api/v1/sales-orders/'+service[1]['orderId']
                detail = request(order_path,employee,company)
                receipt_args = dict(payload={'amount':advance_amount,'method':'BANK_TRANSFER','reference':'Customer deposit '+uuid.uuid4().hex,
                    'advances':[{'orderLineId':detail[1]['lines'][0]['id'],'amount':advance_amount}]},key='customer-deposit-'+uuid.uuid4().hex)
                receipt_path = '/api/v1/customers/00000000-0000-0000-0000-000000000011/receipts'
                deposited = request(receipt_path,employee,company,base=first,**receipt_args)
                assert deposited[0] == 201, deposited
                assert request(receipt_path,employee,company,base=second,**receipt_args) == deposited
                invoice_args = dict(payload={'lines':[{'orderLineId':detail[1]['lines'][0]['id'],'quantity':1}],'fulfilmentReference':'Synthetic service delivery'},
                    key='advance-invoice-'+uuid.uuid4().hex,version=detail[1]['version'])
                invoiced = request(order_path+'/invoices',employee,company,base=legacy_url,**invoice_args)
                assert invoiced[0] == 201, invoiced
                advance_sources={deposited[1]['id']}
                def advance_gst(expected_invoice,expected_receipt):
                    if not taxable: return
                    today=datetime.datetime.now(ZoneInfo('Australia/Sydney')).date()
                    path='/api/v1/accounting/gst-attributions?from='+today.isoformat()+'&to='+(today+datetime.timedelta(days=1)).isoformat()+'&customerId=00000000-0000-0000-0000-000000000011&pageSize=100'
                    result=request(path,employee,company)
                    assert result==request(path,employee,company,base=legacy_url) and result[0]==200, result
                    entries=result[1]['items']
                    invoice_tax=round(sum(float(row['gstAmount']) for row in entries if row['invoiceLineId']==invoiced[1]['lines'][0]['id']),2)
                    receipt_tax=round(sum(float(row['gstAmount']) for row in entries if row['sourceDocumentId'] in advance_sources),2)
                    assert (invoice_tax,receipt_tax)==(expected_invoice,expected_receipt), (expected_invoice,expected_receipt,entries)
                cash=os.environ.get('HTT_COMPAT_GST_BASIS')=='CASH'
                advance_gst(0,2 if cash else 10)
                application_path = '/api/v1/customer-advances/'+deposited[1]['advances'][0]['id']+'/apply'
                apply_args = dict(payload={'reference':' Customer café & advance '+uuid.uuid4().hex,
                    'allocations':[{'invoiceLineId':invoiced[1]['lines'][0]['id'],'amount':advance_amount}]},
                    key='customer-apply-'+uuid.uuid4().hex)
                assert request(application_path,token('test-purchase-reader'),company,base=first,**apply_args)[0] == 403
                bad = dict(payload={**apply_args['payload'],'allocations':[{'invoiceLineId':invoiced[1]['lines'][0]['id'],'amount':advance_amount+1}]},
                    key='customer-over-apply-'+uuid.uuid4().hex)
                rejected = [request(application_path,employee,company,base=target,**bad) for target in (first,second)]
                assert rejected[0][0] == rejected[1][0] and 400 <= rejected[0][0] < 500, rejected
                advance_gst(0,2 if cash else 10)
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts = list(pool.map(lambda n: request(application_path,employee,company,
                        base=first if n%2 else second,**apply_args),range(6)))
                applied = attempts[0]
                assert applied[0] == 201 and all(result==applied for result in attempts), attempts
                assert applied[1]['applicationStatus']=='APPLIED' and float(applied[1]['amount'])==advance_amount, applied
                advance_sources.add(applied[1]['id'])
                advance_gst(2 if cash else 0,2 if cash else 10)
                read_path = '/api/v1/advance-applications/'+applied[1]['id']
                assert request(read_path,employee,company)==(200,applied[1])
                assert request(read_path,employee,company,base=legacy_url)==(200,applied[1])
                ar = request('/api/v1/customers/00000000-0000-0000-0000-000000000011/receivables?pageSize=100',employee,company)
                entry = next(item for item in ar[1]['items'] if item['invoiceId']==invoiced[1]['id'])
                assert float(entry['paid'])==advance_amount and float(entry['outstanding'])==invoice_gross-advance_amount, entry
                reverse_path = '/api/v1/customer-receipts/'+deposited[1]['id']+'/reverse'
                reverse_args = dict(payload={'reference':' Customer café reversal '+uuid.uuid4().hex,
                    'reason':' Synthetic correction after unapplication '},key='customer-reverse-'+uuid.uuid4().hex)
                rejected = [request(reverse_path,employee,company,base=target,**reverse_args) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0]==409, rejected
                advance_gst(2 if cash else 0,2 if cash else 10)
                undo_path = '/api/v1/advance-applications/'+applied[1]['id']+'/unapply'
                undo_args = dict(payload={'reference':' Undo café application '+uuid.uuid4().hex,
                    'reason':' Synthetic office correction '},key='customer-unapply-'+uuid.uuid4().hex)
                assert request(undo_path,token('test-purchase-reader'),company,base=first,**undo_args)[0]==403
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts = list(pool.map(lambda n: request(undo_path,employee,company,
                        base=first if n%2 else second,**undo_args),range(6)))
                undone = attempts[0]
                assert undone[0]==201 and all(result==undone for result in attempts), attempts
                assert request('/api/v1/advance-unapplications/'+undone[1]['unapplication']['id'],employee,company)==(200,undone[1])
                assert request('/api/v1/advance-unapplications/'+undone[1]['unapplication']['id'],employee,company,base=legacy_url)==(200,undone[1])
                advance_sources.add(undone[1]['unapplication']['id'])
                advance_gst(0,2 if cash else 10)
                applied_view = request(read_path,employee,company)
                assert applied_view==request(read_path,employee,company,base=legacy_url)
                assert applied_view[1]['applicationStatus']=='UNAPPLIED', applied_view
                ar = request('/api/v1/customers/00000000-0000-0000-0000-000000000011/receivables?pageSize=100',employee,company)
                entry = next(item for item in ar[1]['items'] if item['invoiceId']==invoiced[1]['id'])
                assert float(entry['paid'])==0 and float(entry['outstanding'])==invoice_gross, entry
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts = list(pool.map(lambda n: request(reverse_path,employee,company,
                        base=first if n%2 else second,**reverse_args),range(6)))
                reversed_receipt = attempts[0]
                assert reversed_receipt[0]==201 and all(result==reversed_receipt for result in attempts), attempts
                reversal_view = '/api/v1/receipt-reversals/'+reversed_receipt[1]['reversal']['id']
                assert request(reversal_view,employee,company)==request(reversal_view,employee,company,base=legacy_url)==(200,reversed_receipt[1])
                original = request('/api/v1/customer-receipts/'+deposited[1]['id'],employee,company)
                assert original==request('/api/v1/customer-receipts/'+deposited[1]['id'],employee,company,base=legacy_url)
                assert original[1]['settlementStatus']=='REVERSED', original
                changed = dict(payload={**reverse_args['payload'],'reason':'Different reason'},key=reverse_args['key'])
                assert request(reverse_path,employee,company,base=second,**changed)[0]==409

                advance_sources.add(reversed_receipt[1]['reversal']['id'])
                advance_gst(0,0 if cash else 5)
                if taxable:
                    credit_args=dict(payload={'reason':'Close synthetic taxable advance invoice',
                        'lines':[{'invoiceLineId':invoiced[1]['lines'][0]['id'],'quantity':1}]},key='advance-tax-credit-'+uuid.uuid4().hex)
                    credit_path='/api/v1/sales-invoices/'+invoiced[1]['id']+'/credit-notes'
                    credit=request(credit_path,employee,company,base=first,**credit_args)
                    assert credit[0]==201 and float(credit[1]['tax'])==5, credit
                    assert request(credit_path,employee,company,base=second,**credit_args)==credit
                    advance_gst(0 if cash else -5,0 if cash else 5)
            print('PASS: taxable customer advance/apply/unapply/receipt reversal GST matrix')
            print('PASS: customer application/unapplication and receipt reversal, cross-backend concurrent replay and guards')
            for first, second in ((legacy_url,url),(url,legacy_url)):
                customer='00000000-0000-0000-0000-000000000072'
                created=request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
                    'customerId':customer,'customerBranchId':'00000000-0000-0000-0000-000000000073','warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':'00000000-0000-0000-0000-000000000032','quantity':1}],
                    'reason':'Synthetic service credit'},key='credit-order-'+uuid.uuid4().hex)
                assert created[0]==201, created
                order_path='/api/v1/sales-orders/'+created[1]['orderId']
                invoiceable=request(order_path+'/invoiceable',employee,company)
                posted_credit_invoice=request(order_path+'/invoices',employee,company,base=first,
                    payload={'lines':[{'orderLineId':invoiceable[1]['lines'][0]['id'],'quantity':1}],
                        'fulfilmentReference':'Synthetic completed service'},key='credit-invoice-'+uuid.uuid4().hex,version=created[1]['version'])
                assert posted_credit_invoice[0]==201, posted_credit_invoice
                invoice_id=posted_credit_invoice[1]['id']
                line_id=posted_credit_invoice[1]['lines'][0]['id']
                receipt=request('/api/v1/customers/'+customer+'/receipts',employee,company,base=first,
                    payload={'amount':50,'method':'BANK_TRANSFER','reference':'Credit paid invoice '+uuid.uuid4().hex,
                        'allocations':[{'invoiceLineId':line_id,'amount':50}]},key='credit-receipt-'+uuid.uuid4().hex)
                assert receipt[0]==201, receipt
                creditable_path='/api/v1/sales-invoices/'+invoice_id+'/creditable'
                before=request(creditable_path,employee,company)
                assert before==request(creditable_path,employee,company,base=legacy_url), before
                assert float(before[1]['lines'][0]['creditableQuantity'])==1, before
                credit_path='/api/v1/sales-invoices/'+invoice_id+'/credit-notes'
                credit_args=dict(payload={'reason':' Synthetic café service credit ',
                    'lines':[{'invoiceLineId':line_id,'quantity':1}]},key='service-credit-'+uuid.uuid4().hex)
                assert request(credit_path,token('test-purchase-reader'),company,base=first,**credit_args)[0]==403
                for broken in ({'invoiceLineId':line_id,'quantity':None},{'invoiceLineId':None,'quantity':1}):
                    malformed=dict(payload={**credit_args['payload'],'lines':[broken]},key='null-credit-'+uuid.uuid4().hex)
                    rejected=[request(credit_path,employee,company,base=target,**malformed) for target in (first,second)]
                    assert rejected[0][0]==rejected[1][0]==400, rejected
                missing=dict(payload={**credit_args['payload'],'lines':[{'invoiceLineId':line_id}]},key='missing-credit-quantity-'+uuid.uuid4().hex)
                rejected=[request(credit_path,employee,company,base=target,**missing) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0]==422, rejected
                excessive=dict(payload={**credit_args['payload'],'lines':[{'invoiceLineId':line_id,'quantity':2}]},
                    key='excess-credit-'+uuid.uuid4().hex)
                rejected=[request(credit_path,employee,company,base=target,**excessive) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0]==409, rejected
                credited=request(credit_path,employee,company,base=first,**credit_args)
                assert credited[0]==201 and float(credited[1]['gross'])==50, credited
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(credit_path,employee,company,
                        base=first if n%2 else second,**credit_args),range(6)))
                assert all(result==credited for result in attempts), attempts
                detail_path='/api/v1/sales-credit-notes/'+credited[1]['id']
                assert request(detail_path,employee,company)==request(detail_path,employee,company,base=legacy_url)==(200,credited[1])
                assert request(credit_path,employee,company)==request(credit_path,employee,company,base=legacy_url)
                after=request(creditable_path,employee,company)
                assert after==request(creditable_path,employee,company,base=legacy_url)
                assert float(after[1]['lines'][0]['creditableQuantity'])==0, after
                refund_args=dict(payload={'amount':50,'reference':'Credit note refund '+uuid.uuid4().hex,
                    'reason':'Synthetic refund of paid service credit','creditLineId':credited[1]['lines'][0]['id']},
                    key='credit-note-refund-'+uuid.uuid4().hex)
                refunded_credit=request('/api/v1/customers/'+customer+'/refunds',employee,company,base=second,**refund_args)
                assert refunded_credit[0]==201, refunded_credit
                assert request('/api/v1/customers/'+customer+'/refunds',employee,company,base=first,**refund_args)==refunded_credit
                credit_view=request(detail_path,employee,company)
                assert credit_view==request(detail_path,employee,company,base=legacy_url)
                assert float(credit_view[1]['lines'][0]['refundedAmount'])==50 and float(credit_view[1]['lines'][0]['unrefundedCredit'])==0, credit_view
            print('PASS: service quantity credit, creditable/detail/list, concurrent replay and credit-note refund')
            for first, second in ((legacy_url,url),(url,legacy_url)):
                customer='00000000-0000-0000-0000-000000000072'
                created=request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
                    'customerId':customer,'customerBranchId':'00000000-0000-0000-0000-000000000073',
                    'warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':'00000000-0000-0000-0000-000000000032','quantity':1}],
                    'reason':'Synthetic amount credit'},key='amount-credit-order-'+uuid.uuid4().hex)
                assert created[0]==201, created
                order_path='/api/v1/sales-orders/'+created[1]['orderId']
                invoiceable=request(order_path+'/invoiceable',employee,company)
                posted=request(order_path+'/invoices',employee,company,base=first,
                    payload={'lines':[{'orderLineId':invoiceable[1]['lines'][0]['id'],'quantity':1}],
                        'fulfilmentReference':'Synthetic amount credit service'},key='amount-credit-invoice-'+uuid.uuid4().hex,version=created[1]['version'])
                assert posted[0]==201, posted
                invoice_id=posted[1]['id'];line_id=posted[1]['lines'][0]['id']
                received=request('/api/v1/customers/'+customer+'/receipts',employee,company,base=second,
                    payload={'amount':50,'method':'BANK_TRANSFER','reference':'Amount credit paid '+uuid.uuid4().hex,
                        'allocations':[{'invoiceLineId':line_id,'amount':50}]},key='amount-credit-receipt-'+uuid.uuid4().hex)
                assert received[0]==201, received
                path='/api/v1/sales-invoices/'+invoice_id+'/amount-credit-notes'
                line={'invoiceLineId':line_id,'net':10,'description':'  Synthetic café & price adjustment  '}
                args=dict(payload={'reason':' Synthetic amount reduction ','lines':[line]},key='amount-credit-'+uuid.uuid4().hex)
                assert request(path,token('test-purchase-reader'),company,base=first,**args)[0]==403
                for field in ('net','tax','invoiceLineId'):
                    invalid=dict(payload={**args['payload'],'lines':[{**line,field:None}]},key='null-amount-credit-'+uuid.uuid4().hex)
                    rejected=[request(path,employee,company,base=target,**invalid) for target in (first,second)]
                    assert rejected[0][0]==rejected[1][0]==400, rejected
                invalid=dict(payload={**args['payload'],'lines':[{**line,'net':51}]},key='over-amount-credit-'+uuid.uuid4().hex)
                rejected=[request(path,employee,company,base=target,**invalid) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                credited=request(path,employee,company,base=first,**args)
                assert credited[0]==201 and float(credited[1]['gross'])==10 and credited[1]['creditType']=='AMOUNT', credited
                assert credited[1]['lines'][0]['quantity'] is None, credited
                assert credited[1]['lines'][0]['description']=='Synthetic café & price adjustment', credited
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,employee,company,
                        base=first if n%2 else second,**args),range(6)))
                assert all(result==credited for result in attempts), attempts
                detail='/api/v1/sales-credit-notes/'+credited[1]['id']
                assert request(detail,employee,company)==request(detail,employee,company,base=legacy_url)==(200,credited[1])
                creditable='/api/v1/sales-invoices/'+invoice_id+'/creditable'
                after=request(creditable,employee,company)
                assert after==request(creditable,employee,company,base=legacy_url)
                assert float(after[1]['lines'][0]['creditableNet'])==40 and float(after[1]['lines'][0]['creditableQuantity'])==1, after
                refund_args=dict(payload={'amount':10,'reference':'Amount credit refund '+uuid.uuid4().hex,
                    'reason':'Synthetic amount credit refund','creditLineId':credited[1]['lines'][0]['id']},key='refund-amount-credit-'+uuid.uuid4().hex)
                refunded=request('/api/v1/customers/'+customer+'/refunds',employee,company,base=second,**refund_args)
                assert refunded[0]==201, refunded
                assert request('/api/v1/customers/'+customer+'/refunds',employee,company,base=first,**refund_args)==refunded
                after=request(detail,employee,company)
                assert after==request(detail,employee,company,base=legacy_url)
                assert float(after[1]['lines'][0]['refundedAmount'])==10 and float(after[1]['lines'][0]['unrefundedCredit'])==0, after
                changed=dict(payload={**args['payload'],'reason':'Different adjustment reason'},key=args['key'])
                assert request(path,employee,company,base=second,**changed)[0]==409
            print('PASS: amount credit with omitted tax, null validation, frozen quantity, concurrent replay and refund')
            customer='00000000-0000-0000-0000-000000000072'
            today=datetime.datetime.now(ZoneInfo('Australia/Sydney')).date()
            report='/api/v1/accounting/gst-attributions?from='+today.isoformat()+'&to='+(today+datetime.timedelta(days=1)).isoformat()+'&customerId='+customer+'&pageSize=100'
            cash=os.environ.get('HTT_COMPAT_GST_BASIS')=='CASH'
            def invoice_tax(invoice_line,expected):
                result=request(report,employee,company)
                old=request(report,employee,company,base=legacy_url)
                assert result==old and result[0]==200, (result,old)
                entries=[item for item in result[1]['items'] if item['invoiceLineId']==invoice_line]
                assert round(sum(float(item['gstAmount']) for item in entries),2)==expected, (expected,entries)
                return entries
            created=request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
                'customerId':customer,'customerBranchId':'00000000-0000-0000-0000-000000000073',
                'warehouseId':'00000000-0000-0000-0000-000000000014',
                'lines':[{'productUnitId':'00000000-0000-0000-0000-000000000077','quantity':1}],
                'reason':'Synthetic taxable service'},key='gst-order-'+uuid.uuid4().hex)
            assert created[0]==201, created
            order_path='/api/v1/sales-orders/'+created[1]['orderId']
            eligible=request(order_path+'/invoiceable',employee,company)
            posted=request(order_path+'/invoices',employee,company,payload={
                'lines':[{'orderLineId':eligible[1]['lines'][0]['id'],'quantity':1}],
                'fulfilmentReference':'Synthetic taxable completed service'},key='gst-invoice-'+uuid.uuid4().hex,version=created[1]['version'])
            assert posted[0]==201 and float(posted[1]['tax'])==5 and float(posted[1]['gross'])==55, posted
            line_id=posted[1]['lines'][0]['id']
            invoice_tax(line_id,0 if cash else 5)
            payment_args=dict(payload={'amount':22,'method':'BANK_TRANSFER','reference':'Taxable partial receipt '+uuid.uuid4().hex,
                'allocations':[{'invoiceLineId':line_id,'amount':22}]},key='gst-receipt-'+uuid.uuid4().hex)
            received=request('/api/v1/customers/'+customer+'/receipts',employee,company,**payment_args)
            assert received[0]==201, received
            assert request('/api/v1/customers/'+customer+'/receipts',employee,company,base=legacy_url,**payment_args)==received
            invoice_tax(line_id,2 if cash else 5)
            reverse_args=dict(payload={'reference':'Taxable receipt reversal '+uuid.uuid4().hex,'reason':'Synthetic GST reversal'},key='gst-reverse-'+uuid.uuid4().hex)
            reverse_path='/api/v1/customer-receipts/'+received[1]['id']+'/reverse'
            reversed_receipt=request(reverse_path,employee,company,base=legacy_url,**reverse_args)
            assert reversed_receipt[0]==201, reversed_receipt
            assert request(reverse_path,employee,company,**reverse_args)==reversed_receipt
            invoice_tax(line_id,0 if cash else 5)
            credited=request('/api/v1/sales-invoices/'+posted[1]['id']+'/credit-notes',employee,company,
                payload={'reason':'Synthetic taxable invoice cancellation','lines':[{'invoiceLineId':line_id,'quantity':1}]},key='gst-credit-'+uuid.uuid4().hex)
            assert credited[0]==201 and float(credited[1]['tax'])==5, credited
            invoice_tax(line_id,0)
            assert request(report,token('test-purchase-reader'),company)[0]==403
            base='/api/v1/accounting/gst-attributions'
            for query,expected_status in (('',400),('?from='+today.isoformat()+'&to='+today.isoformat(),422),
                    ('?from=2026-01-01&to=2027-01-03',422),('?from=bad&to='+today.isoformat(),400)):
                replies=[request(base+query,employee,company,base=target) for target in (url,legacy_url)]
                assert replies[0][0]==replies[1][0]==expected_status, replies
            next_day=today+datetime.timedelta(days=1)
            excluded=base+'?from='+next_day.isoformat()+'&to='+(next_day+datetime.timedelta(days=1)).isoformat()+'&customerId='+customer
            result=request(excluded,employee,company)
            assert result==request(excluded,employee,company,base=legacy_url) and result[1]['items']==[], result
            print('PASS: taxable customer GST invoice/partial receipt/reversal/credit and half-open report under '+('CASH' if cash else 'NON_CASH'))
            for first, second, taxable in ((legacy_url,url,False),(url,legacy_url,False),(legacy_url,url,True),(url,legacy_url,True)):
                gross=55 if taxable else 50
                transfer=33 if taxable else 30
                remaining=gross-transfer
                customer='00000000-0000-0000-0000-000000000072'
                def service_invoice(label):
                    created=request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
                        'customerId':customer,'customerBranchId':'00000000-0000-0000-0000-000000000073',
                        'warehouseId':'00000000-0000-0000-0000-000000000014',
                        'lines':[{'productUnitId':('00000000-0000-0000-0000-000000000077' if taxable else '00000000-0000-0000-0000-000000000032'),'quantity':1}],
                        'reason':'Synthetic credit '+label},key='credit-app-order-'+uuid.uuid4().hex)
                    assert created[0]==201, created
                    path='/api/v1/sales-orders/'+created[1]['orderId']
                    eligible=request(path+'/invoiceable',employee,company)
                    result=request(path+'/invoices',employee,company,base=first,payload={
                        'lines':[{'orderLineId':eligible[1]['lines'][0]['id'],'quantity':1}],
                        'fulfilmentReference':'Synthetic credit application service'},key='credit-app-invoice-'+uuid.uuid4().hex,version=created[1]['version'])
                    assert result[0]==201, result
                    return result[1]
                source=service_invoice('source')
                target_invoice=service_invoice('target')
                if taxable:
                    invoice_tax(source['lines'][0]['id'],0 if cash else 5)
                    invoice_tax(target_invoice['lines'][0]['id'],0 if cash else 5)
                paid=request('/api/v1/customers/'+customer+'/receipts',employee,company,base=first,payload={
                    'amount':gross,'method':'BANK_TRANSFER','reference':'Credit application source paid '+uuid.uuid4().hex,
                    'allocations':[{'invoiceLineId':source['lines'][0]['id'],'amount':gross}]},key='credit-app-paid-'+uuid.uuid4().hex)
                assert paid[0]==201, paid
                credit=request('/api/v1/sales-invoices/'+source['id']+'/credit-notes',employee,company,base=first,payload={
                    'reason':'Synthetic transferable credit','lines':[{'invoiceLineId':source['lines'][0]['id'],'quantity':1}]},key='transfer-credit-'+uuid.uuid4().hex)
                assert credit[0]==201, credit
                if taxable:
                    invoice_tax(source['lines'][0]['id'],5 if cash else 0)
                path='/api/v1/sales-credit-notes/'+credit[1]['id']+'/apply'
                args=dict(payload={'reference':' Apply café & credit '+uuid.uuid4().hex,'reason':' Synthetic cross invoice settlement ',
                    'lines':[{'creditLineId':credit[1]['lines'][0]['id'],'invoiceLineId':target_invoice['lines'][0]['id'],'amount':transfer}]},
                    key='credit-application-'+uuid.uuid4().hex)
                assert request(path,token('test-purchase-reader'),company,base=first,**args)[0]==403
                null_amount=dict(payload={**args['payload'],'lines':[{**args['payload']['lines'][0],'amount':None}]},key='null-credit-app-'+uuid.uuid4().hex)
                rejected=[request(path,employee,company,base=base,**null_amount) for base in (first,second)]
                assert rejected[0][0]==rejected[1][0]==422, rejected
                over=dict(payload={**args['payload'],'lines':[{**args['payload']['lines'][0],'amount':gross+1}]},key='over-credit-app-'+uuid.uuid4().hex)
                rejected=[request(path,employee,company,base=base,**over) for base in (first,second)]
                assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                if taxable:
                    invoice_tax(source['lines'][0]['id'],5 if cash else 0)
                    invoice_tax(target_invoice['lines'][0]['id'],0 if cash else 5)
                applied=request(path,employee,company,base=first,**args)
                assert applied[0]==201 and applied[1]['application']['applicationStatus']=='APPLIED', applied
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,employee,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==applied for result in attempts), attempts
                if taxable:
                    invoice_tax(source['lines'][0]['id'],2 if cash else 0)
                    invoice_tax(target_invoice['lines'][0]['id'],3 if cash else 5)
                read_path='/api/v1/customer-credit-applications/'+applied[1]['application']['id']
                assert request(read_path,employee,company)==request(read_path,employee,company,base=legacy_url)==(200,applied[1])
                listed='/api/v1/sales-credit-notes/'+credit[1]['id']+'/applications'
                assert request(listed,employee,company)==request(listed,employee,company,base=legacy_url)
                source_view=request('/api/v1/sales-credit-notes/'+credit[1]['id'],employee,company)
                assert float(source_view[1]['lines'][0]['appliedAmount'])==transfer and float(source_view[1]['lines'][0]['availableApplyAmount'])==remaining, source_view
                ar='/api/v1/customers/'+customer+'/receivables?pageSize=100'
                target_view=next(item for item in request(ar,employee,company)[1]['items'] if item['invoiceId']==target_invoice['id'])
                assert float(target_view['paid'])==0 and float(target_view['creditReceived'])==transfer and float(target_view['outstanding'])==remaining, target_view
                undo_path=read_path+'/unapply'
                undo_args=dict(payload={'reference':' Unapply café credit '+uuid.uuid4().hex,'reason':' Synthetic correction of settlement '},key='unapply-credit-'+uuid.uuid4().hex)
                undone=request(undo_path,employee,company,base=second,**undo_args)
                assert undone[0]==201, undone
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(undo_path,employee,company,base=first if n%2 else second,**undo_args),range(6)))
                assert all(result==undone for result in attempts), attempts
                unapplication='/api/v1/customer-credit-unapplications/'+undone[1]['unapplication']['id']
                assert request(unapplication,employee,company)==request(unapplication,employee,company,base=legacy_url)==(200,undone[1])
                status=request(read_path,employee,company)
                assert status==request(read_path,employee,company,base=legacy_url) and status[1]['application']['applicationStatus']=='UNAPPLIED', status
                source_view=request('/api/v1/sales-credit-notes/'+credit[1]['id'],employee,company)
                assert source_view==request('/api/v1/sales-credit-notes/'+credit[1]['id'],employee,company,base=legacy_url)
                assert float(source_view[1]['lines'][0]['appliedAmount'])==0 and float(source_view[1]['lines'][0]['availableApplyAmount'])==gross, source_view
                target_view=next(item for item in request(ar,employee,company)[1]['items'] if item['invoiceId']==target_invoice['id'])
                assert float(target_view['paid'])==0 and float(target_view['creditReceived'])==0 and float(target_view['outstanding'])==gross, target_view
                if taxable:
                    invoice_tax(source['lines'][0]['id'],5 if cash else 0)
                    invoice_tax(target_invoice['lines'][0]['id'],0 if cash else 5)
                    cancel_path='/api/v1/sales-invoices/'+target_invoice['id']+'/credit-notes'
                    cancel_args=dict(payload={'reason':'Close synthetic taxable credit transfer target',
                        'lines':[{'invoiceLineId':target_invoice['lines'][0]['id'],'quantity':1}]},key='tax-transfer-target-credit-'+uuid.uuid4().hex)
                    canceled=request(cancel_path,employee,company,base=second,**cancel_args)
                    assert canceled[0]==201 and float(canceled[1]['tax'])==5, canceled
                    assert request(cancel_path,employee,company,base=first,**cancel_args)==canceled
                    invoice_tax(target_invoice['lines'][0]['id'],0)
                    refund_path='/api/v1/customers/'+customer+'/refunds'
                    refund_args=dict(payload={'creditLineId':credit[1]['lines'][0]['id'],'amount':gross,
                        'reference':'Taxable credit refund '+uuid.uuid4().hex,'reason':'Synthetic refund after unapplication'},key='tax-transfer-refund-'+uuid.uuid4().hex)
                    assert request(refund_path,token('test-purchase-reader'),company,base=first,**refund_args)[0]==403
                    too_much=dict(payload={**refund_args['payload'],'amount':gross+1},key=refund_args['key']+'-over')
                    rejected=[request(refund_path,employee,company,base=target,**too_much) for target in (first,second)]
                    assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                    invoice_tax(source['lines'][0]['id'],5 if cash else 0)
                    refunded=request(refund_path,employee,company,base=first,**refund_args)
                    assert refunded[0]==201, refunded
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(refund_path,employee,company,base=first if n%2 else second,**refund_args),range(6)))
                    assert all(result==refunded for result in attempts), attempts
                    invoice_tax(source['lines'][0]['id'],0)
                    after=request('/api/v1/sales-credit-notes/'+credit[1]['id'],employee,company)
                    assert after==request('/api/v1/sales-credit-notes/'+credit[1]['id'],employee,company,base=legacy_url)
                    assert float(after[1]['lines'][0]['refundedAmount'])==gross and float(after[1]['lines'][0]['availableApplyAmount'])==0, after
                    changed=dict(payload={**refund_args['payload'],'reason':'Changed taxable refund reason'},key=refund_args['key'])
                    assert request(refund_path,employee,company,base=second,**changed)[0]==409
            print('PASS: taxable credit transfer/unapplication/refund GST and atomic rejection matrix')
            print('PASS: customer credit application/unapplication, source and target balances, list/detail and mixed concurrent replay')





            print('PASS: matching GST and receivable balances after partial settlement')
            print('PASS: bidirectional default/explicit-bank receipt replay')
            print('PASS: bidirectional posted service invoice, receivable/journal links, and remaining billable quantity')
            for first, second in ((legacy_url,url),(url,legacy_url)):
                pick = request('/api/v1/warehouse/orders/'+order[1]['orderId']+'/picks',employee,company,base=legacy_url,
                    payload={'lines':[{'orderLineId':order_view[1]['lines'][0]['id'],'quantity':1}]},
                    key='pick-fixture-'+str(uuid.uuid4()),version=1)
                assert pick[0] == 201, pick
                pick_path = '/api/v1/warehouse/picks/'+pick[1]['id']
                assert request(pick_path,employee,company) == (200,pick[1])
                args = dict(payload={},key='cancel-pick-'+pick[1]['id'],version=pick[1]['version'])
                canceled = request(pick_path+'/cancel',employee,company,base=first,**args)
                assert canceled[0] == 200 and canceled[1]['state'] == 'CANCELLED', canceled
                assert request(pick_path+'/cancel',employee,company,base=second,**args) == canceled
            print('PASS: populated pick detail and bidirectional pick cancellation replay')
            for first, second in ((legacy_url,url),(url,legacy_url)):
                stock_order = request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
                    'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                    'warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':unit_id,'quantity':2}], 'reason':'Synthetic dispatch parity'},
                    key='dispatch-order-'+str(uuid.uuid4()))
                assert stock_order[0] == 201, stock_order
                stock_path = '/api/v1/sales-orders/'+stock_order[1]['orderId']
                detail = request(stock_path,employee,company)
                line = detail[1]['lines'][0]['id']
                pick_create_path = '/api/v1/warehouse/orders/'+stock_order[1]['orderId']+'/picks'
                pick_args = dict(payload={'lines':[{'orderLineId':line,'quantity':1.0,
                                  'shortPickReason':'  Synthetic café + partial  '}]},
                                 key='dispatch-pick-'+str(uuid.uuid4()),version=detail[1]['version'])
                picked = request(pick_create_path,employee,company,base=first,**pick_args)
                assert picked[0] == 201 and len(picked[1]['shortages']) == 1, picked
                assert request(pick_create_path,employee,company,base=second,**pick_args) == picked
                confirm_path = '/api/v1/warehouse/picks/'+picked[1]['id']+'/confirm'
                stock_before = float(request(warehouse_path,employee,company)[1]['items'][0]['onHand'])
                dispatch = dict(payload={'recipient':' Synthetic café ', 'reference':' Parity dispatch docket '},
                                key='dispatch-'+picked[1]['id'],version=picked[1]['version'])
                shipped = request(confirm_path,employee,company,base=first,**dispatch)
                assert shipped[0] == 200 and shipped[1]['state'] == 'DISPATCHED', shipped
                assert request(confirm_path,employee,company,base=second,**dispatch) == shipped
                assert float(request(warehouse_path,employee,company)[1]['items'][0]['onHand']) == stock_before-1
                eligible = request(stock_path+'/invoiceable',employee,company)
                assert eligible == request(stock_path+'/invoiceable',employee,company,base=legacy_url)
                assert float(eligible[1]['lines'][0]['availableQuantity']) == 1, eligible
                invoicing = dict(payload={'lines':[{'orderLineId':line,'quantity':1}]},
                                 key='dispatch-invoice-'+str(uuid.uuid4()),version=eligible[1]['version'])
                invoice = request(stock_path+'/invoices',employee,company,base=first,**invoicing)
                assert invoice[0] == 201 and float(invoice[1]['gross']) == 45, invoice
                assert request(stock_path+'/invoices',employee,company,base=second,**invoicing) == invoice
                returnable_path='/api/v1/warehouse/orders/'+stock_order[1]['orderId']+'/returnable'
                returnable=request(returnable_path,employee,company)
                assert returnable==request(returnable_path,employee,company,base=legacy_url), returnable
                movement=returnable[1]['movements'][0]['stockMovementId']
                disposition='RESTOCK' if first==legacy_url else 'QUARANTINE'
                warehouse='00000000-0000-0000-0000-000000000014' if disposition=='RESTOCK' else '00000000-0000-0000-0000-000000000074'
                return_path=stock_path+'/returns'
                return_line={'stockMovementId':movement,'quantity':1,'invoiceLineId':invoice[1]['lines'][0]['id']}
                return_args=dict(payload={'warehouseId':warehouse,'disposition':disposition,
                    'reason':' Synthetic café & returned stock ','lines':[return_line]},key='sales-return-'+uuid.uuid4().hex)
                assert request(return_path,token('test-purchase-reader'),company,base=first,**return_args)[0]==403
                broken=dict(payload={**return_args['payload'],'lines':[{**return_line,'quantity':None}]},key='null-return-'+uuid.uuid4().hex)
                rejected=[request(return_path,employee,company,base=target,**broken) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0]==400, rejected
                excessive=dict(payload={**return_args['payload'],'lines':[{**return_line,'quantity':2}]},key='over-return-'+uuid.uuid4().hex)
                rejected=[request(return_path,employee,company,base=target,**excessive) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                before_hand=float(request(warehouse_path,employee,company)[1]['items'][0]['onHand'])
                returned=request(return_path,employee,company,base=first,**return_args)
                assert returned[0]==201 and returned[1]['disposition']==disposition, returned
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(return_path,employee,company,
                        base=first if n%2 else second,**return_args),range(6)))
                assert all(result==returned for result in attempts), attempts
                view_path='/api/v1/warehouse/returns/'+returned[1]['id']
                assert request(view_path,employee,company)==request(view_path,employee,company,base=legacy_url)==(200,returned[1])
                root_hand=float(request(warehouse_path,employee,company)[1]['items'][0]['onHand'])
                assert root_hand==before_hand+(1 if disposition=='RESTOCK' else 0)
                target='/api/v1/inventory/availability?warehouseId='+warehouse
                stock=request(target,employee,company)
                old_stock=request(target,employee,company,base=legacy_url)
                assert stock[0]==old_stock[0] and normalize(stock[1])==normalize(old_stock[1]), (stock,old_stock)
                if disposition=='QUARANTINE':
                    assert float(stock[1]['items'][0]['onHand'])==1 and float(stock[1]['items'][0]['available'])==0, stock
                after=request(returnable_path,employee,company)
                assert after==request(returnable_path,employee,company,base=legacy_url)
                assert float(after[1]['movements'][0]['returnedQuantity'])==1 and float(after[1]['invoiceLines'][0]['returnedQuantity'])==1, after
                credit_path='/api/v1/sales-invoices/'+invoice[1]['id']+'/credit-notes'
                credit_args=dict(payload={'reason':'Synthetic stock return credit',
                    'lines':[{'invoiceLineId':invoice[1]['lines'][0]['id'],'quantity':1,'returnLineId':returned[1]['lines'][0]['id']}]},
                    key='stock-return-credit-'+uuid.uuid4().hex)
                credited=request(credit_path,employee,company,base=second,**credit_args)
                assert credited[0]==201 and float(credited[1]['gross'])==45, credited
                assert request(credit_path,employee,company,base=first,**credit_args)==credited
                changed=dict(payload={**return_args['payload'],'reason':'Different return reason'},key=return_args['key'])
                assert request(return_path,employee,company,base=second,**changed)[0]==409

            print('PASS: bidirectional pick creation with shortage and legacy snapshot')
            print('PASS: bidirectional warehouse dispatch and stock invoicing replay')
            for first, second in ((legacy_url,url),(url,legacy_url)):
                customer='00000000-0000-0000-0000-000000000011'
                created=request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
                    'customerId':customer,'customerBranchId':branch,'warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':unit_id,'quantity':1}],'reason':'Synthetic unbilled return'},key='unbilled-order-'+uuid.uuid4().hex)
                assert created[0]==201, created
                order_path='/api/v1/sales-orders/'+created[1]['orderId']
                detail=request(order_path,employee,company)
                picked=request('/api/v1/warehouse/orders/'+created[1]['orderId']+'/picks',employee,company,base=first,
                    payload={'lines':[{'orderLineId':detail[1]['lines'][0]['id'],'quantity':1}]},
                    key='unbilled-pick-'+uuid.uuid4().hex,version=created[1]['version'])
                assert picked[0]==201, picked
                shipped=request('/api/v1/warehouse/picks/'+picked[1]['id']+'/confirm',employee,company,base=first,
                    payload={'recipient':'Synthetic customer','reference':'Unbilled dispatch'},
                    key='unbilled-dispatch-'+uuid.uuid4().hex,version=picked[1]['version'])
                assert shipped[0]==200, shipped
                returnable_path='/api/v1/warehouse/orders/'+created[1]['orderId']+'/returnable'
                available=request(returnable_path,employee,company)
                assert available[0]==200 and available[1]['invoiceLines']==[], available
                before_credit=request('/api/v1/customers/'+customer+'/credit',employee,company)
                before_hand=float(request(warehouse_path,employee,company)[1]['items'][0]['onHand'])
                args=dict(payload={'warehouseId':'00000000-0000-0000-0000-000000000014','disposition':'RESTOCK',
                    'reason':'Synthetic unbilled return cancels delivered remainder',
                    'lines':[{'stockMovementId':available[1]['movements'][0]['stockMovementId'],'quantity':1}]},
                    key='unbilled-return-'+uuid.uuid4().hex)
                returned=request(order_path+'/returns',employee,company,base=first,**args)
                assert returned[0]==201 and returned[1]['lines'][0]['invoiceLineId'] is None, returned
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(order_path+'/returns',employee,company,
                        base=first if n%2 else second,**args),range(6)))
                assert all(result==returned for result in attempts), attempts
                assert float(request(warehouse_path,employee,company)[1]['items'][0]['onHand'])==before_hand+1
                after_credit=request('/api/v1/customers/'+customer+'/credit',employee,company)
                assert after_credit==request('/api/v1/customers/'+customer+'/credit',employee,company,base=legacy_url)
                assert float(after_credit[1]['unbilledOrders'])==float(before_credit[1]['unbilledOrders'])-45, (before_credit,after_credit)
                invoiceable=request(order_path+'/invoiceable',employee,company)
                assert invoiceable==request(order_path+'/invoiceable',employee,company,base=legacy_url)
                assert float(invoiceable[1]['lines'][0]['availableQuantity'])==0, invoiceable
            print('PASS: unbilled return nullable invoice, single inventory restoration and credit commitment release')

            for first, second, taxable in ((legacy_url,url,False),(url,legacy_url,False),(legacy_url,url,True),(url,legacy_url,True)):
                amount=22 if taxable else 20
                order_gross=55 if taxable else 45
                cash=os.environ.get('HTT_COMPAT_GST_BASIS')=='CASH'
                customer='00000000-0000-0000-0000-000000000011'
                created=request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
                    'customerId':customer,'customerBranchId':branch,'warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':('00000000-0000-0000-0000-000000000077' if taxable else unit_id),'quantity':1}],'reason':'Synthetic refundable order cancellation'},
                    key='cancel-refund-order-'+uuid.uuid4().hex)
                assert created[0]==201, created
                path='/api/v1/sales-orders/'+created[1]['orderId']
                detail=request(path,employee,company)
                deposit=request('/api/v1/customers/'+customer+'/receipts',employee,company,base=first,
                    payload={'amount':amount,'method':'BANK_TRANSFER','reference':'Cancelable deposit '+uuid.uuid4().hex,
                        'advances':[{'orderLineId':detail[1]['lines'][0]['id'],'amount':amount}]},key='cancelable-deposit-'+uuid.uuid4().hex)
                assert deposit[0]==201, deposit
                advance_id=deposit[1]['advances'][0]['id']
                def advance_tax(expected):
                    if not taxable: return
                    today=datetime.datetime.now(ZoneInfo('Australia/Sydney')).date()
                    report='/api/v1/accounting/gst-attributions?from='+today.isoformat()+'&to='+(today+datetime.timedelta(days=1)).isoformat()+'&customerId='+customer+'&pageSize=100'
                    result=request(report,employee,company)
                    assert result==request(report,employee,company,base=legacy_url) and result[0]==200, result
                    entries=[row for row in result[1]['items'] if row['advanceId']==advance_id]
                    assert round(sum(float(row['gstAmount']) for row in entries),2)==expected, (expected,entries)
                advance_tax(2 if cash else 5)
                refund_path='/api/v1/customers/'+customer+'/refunds'
                args=dict(payload={'amount':amount,'reference':'Cancel and refund '+uuid.uuid4().hex,
                    'reason':'Synthetic customer cancels unfulfilled order','advanceId':deposit[1]['advances'][0]['id'],
                    'cancelOrder':True},key='cancel-with-refund-'+uuid.uuid4().hex)
                over=dict(payload={**args['payload'],'amount':amount+1},key='over-cancel-refund-'+uuid.uuid4().hex)
                rejected=[request(refund_path,employee,company,base=target,**over) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                partial=dict(payload={**args['payload'],'amount':amount-1},key='partial-cancel-refund-'+uuid.uuid4().hex)
                rejected=[request(refund_path,employee,company,base=target,**partial) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0]==409, rejected
                advance_tax(2 if cash else 5)
                unchanged=request(path,employee,company)
                assert unchanged[1]['state']=='CONFIRMED', unchanged
                before_stock=float(request(warehouse_path,employee,company)[1]['items'][0]['reserved'])
                before_credit=request('/api/v1/customers/'+customer+'/credit',employee,company)
                refunded=request(refund_path,employee,company,base=first,**args)
                assert refunded[0]==201, refunded
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(refund_path,employee,company,
                        base=first if n%2 else second,**args),range(6)))
                assert all(result==refunded for result in attempts), attempts
                canceled=request(path,employee,company)
                assert canceled==request(path,employee,company,base=legacy_url)
                assert canceled[1]['state']=='CANCELLED', canceled
                assert float(request(warehouse_path,employee,company)[1]['items'][0]['reserved'])==before_stock-(0 if taxable else 1)
                after_credit=request('/api/v1/customers/'+customer+'/credit',employee,company)
                assert after_credit==request('/api/v1/customers/'+customer+'/credit',employee,company,base=legacy_url)
                assert float(after_credit[1]['unbilledOrders'])==float(before_credit[1]['unbilledOrders'])-order_gross
                assert float(after_credit[1]['availableAdvances'])==float(before_credit[1]['availableAdvances'])-amount
                if taxable:
                    advance_tax(0)
                    assert float(refunded[1]['gstAmount'])==(2 if cash else 5), refunded
                    reverse_path='/api/v1/customer-refunds/'+refunded[1]['id']+'/reverse'
                    reverse_args=dict(payload={'reference':'Taxable cancel refund reversal '+uuid.uuid4().hex,
                        'reason':'Synthetic canceled-order refund correction'},key='tax-cancel-refund-reverse-'+uuid.uuid4().hex)
                    reversed_refund=request(reverse_path,employee,company,base=second,**reverse_args)
                    assert reversed_refund[0]==201, reversed_refund
                    assert request(reverse_path,employee,company,base=first,**reverse_args)==reversed_refund
                    advance_tax(2 if cash else 0)
                    assert request(path,employee,company)[1]['state']=='CANCELLED'
                    reversal_path='/api/v1/customer-refund-reversals/'+reversed_refund[1]['reversal']['id']
                    correction_args=dict(payload={'reference':'Taxable canceled replacement '+uuid.uuid4().hex,
                        'reason':'Partial replacement retains business cancellation','amount':11,'advanceId':advance_id,
                        'cancelOrder':True},key='tax-cancel-replacement-'+uuid.uuid4().hex)
                    replacement=request(reversal_path+'/correct',employee,company,base=first,**correction_args)
                    assert replacement[0]==201, replacement
                    assert request(reversal_path+'/correct',employee,company,base=second,**correction_args)==replacement
                    assert replacement[1]['refund']['bankAccountId']==refunded[1]['bankAccountId']
                    assert replacement[1]['refund']['originalRefundId']==refunded[1]['id']
                    advance_tax(1 if cash else 0)
                    remaining_credit=request('/api/v1/customers/'+customer+'/credit',employee,company)
                    assert float(remaining_credit[1]['availableAdvances'])==float(before_credit[1]['availableAdvances'])-11, remaining_credit
                    atomic_path='/api/v1/customer-refunds/'+replacement[1]['refund']['id']+'/correct'
                    atomic_args=dict(payload={'reference':'Taxable canceled atomic refund '+uuid.uuid4().hex,
                        'reversalReference':'Taxable canceled atomic reversal '+uuid.uuid4().hex,
                        'reason':'Restore full refund with retained cancellation','amount':22,'advanceId':advance_id,
                        'cancelOrder':True},key='tax-cancel-atomic-'+uuid.uuid4().hex)
                    invalid=dict(payload={**atomic_args['payload'],'amount':23},key=atomic_args['key']+'-over')
                    rejected=[request(atomic_path,employee,company,base=target,**invalid) for target in (first,second)]
                    assert rejected[0][0]==rejected[1][0] and 400<=rejected[0][0]<500, rejected
                    advance_tax(1 if cash else 0)
                    still_active=request('/api/v1/customer-refunds/'+replacement[1]['refund']['id'],employee,company)
                    assert still_active==request('/api/v1/customer-refunds/'+replacement[1]['refund']['id'],employee,company,base=legacy_url)
                    assert still_active[1]['refundStatus']=='ACTIVE', still_active
                    corrected=request(atomic_path,employee,company,base=second,**atomic_args)
                    assert corrected[0]==201, corrected
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(atomic_path,employee,company,base=first if n%2 else second,**atomic_args),range(6)))
                    assert all(result==corrected for result in attempts), attempts
                    assert corrected[1]['refund']['bankAccountId']==refunded[1]['bankAccountId']
                    assert corrected[1]['refund']['originalRefundId']==replacement[1]['refund']['id']
                    advance_tax(0)
                    canceled_again=request(path,employee,company)
                    assert canceled_again==request(path,employee,company,base=legacy_url) and canceled_again[1]['state']=='CANCELLED', canceled_again
                    final_credit=request('/api/v1/customers/'+customer+'/credit',employee,company)
                    assert final_credit==request('/api/v1/customers/'+customer+'/credit',employee,company,base=legacy_url)
                    assert float(final_credit[1]['availableAdvances'])==float(before_credit[1]['availableAdvances'])-amount, final_credit
                    assert float(final_credit[1]['unbilledOrders'])==float(after_credit[1]['unbilledOrders']), final_credit
                    assert float(request(warehouse_path,employee,company)[1]['items'][0]['reserved'])==before_stock
            print('PASS: taxable advance cancel refund/reversal/replacement/atomic correction and failed-transaction GST matrix')
            print('PASS: cancelOrder advance refund, failed over-refund rollback and single reservation/credit release')

            for first, second in ((legacy_url,url),(url,legacy_url)):
                draft = {'supplierId':supplier,'warehouseId':'00000000-0000-0000-0000-000000000014',
                         'notes':'  Synthetic café + order  ',
                         'lines':[{'productUnitId':unit_id,'quantity':2.0,'unitCost':15.0,
                                   'taxCodeId':'00000000-0000-0000-0000-000000000016'}]}
                key = 'parity-po-'+str(uuid.uuid4())
                created = request('/api/v1/purchase-orders',employee,company,base=first,payload=draft,key=key)
                assert created[0] == 201, created
                assert request('/api/v1/purchase-orders',employee,company,base=second,payload=draft,key=key) == created
                po_path = '/api/v1/purchase-orders/'+created[1]['order']['id']
                draft['notes'] = '  Updated purchase fixture  '
                update = dict(payload=draft,key=key+'-update',version=created[1]['order']['version'],method='PUT')
                edited = request(po_path,employee,company,base=second,**update)
                assert edited[0] == 200, edited
                assert request(po_path,employee,company,base=first,**update) == edited
                args = dict(payload={},key=key+'-confirm',version=edited[1]['order']['version'])
                confirmed = request(po_path+'/confirm',employee,company,base=first,**args)
                assert confirmed[0] == 200 and confirmed[1]['order']['status'] == 'CONFIRMED', confirmed
                assert request(po_path+'/confirm',employee,company,base=second,**args) == confirmed
                before_receive = float(request(warehouse_path,employee,company)[1]['items'][0]['onHand'])
                receipt_args = dict(payload={'reference':' Synthetic café + receiving '+uuid.uuid4().hex,
                    'notes':' Received fixture ','lines':[{'orderLineId':confirmed[1]['lines'][0]['id'],'quantity':1.0}]},
                    key=key+'-receipt',version=confirmed[1]['order']['version'])
                received = request(po_path+'/receipts',employee,company,base=second,**receipt_args)
                assert received[0] == 201 and float(received[1]['receipt']['valuationAmount']) == 15, received
                assert request(po_path+'/receipts',employee,company,base=first,**receipt_args) == received
                assert float(request(warehouse_path,employee,company)[1]['items'][0]['onHand']) == before_receive+1
                receive_id = received[1]['receipt']['id']
                assert request('/api/v1/purchase-receipts/'+receive_id,employee,company) == (200,received[1])
                assert request('/api/v1/accounting/grni/receipts/'+receive_id,employee,company) == request(
                    '/api/v1/accounting/grni/receipts/'+receive_id,employee,company,base=legacy_url)
                today = datetime.datetime.now(ZoneInfo('Australia/Sydney')).date().isoformat()
                bill_args = dict(payload={'supplierId':supplier,'supplierInvoice':' Synthetic bill '+uuid.uuid4().hex+' ',
                    'invoiceDate':today,'dueOn':today,'postingDate':today,
                    'lines':[{'receiptLineId':received[1]['lines'][0]['id'],'quantity':1.0,'net':15.0,'tax':0.0}],
                    'notes':'  Synthetic café + matched bill  '}, key=key+'-bill')
                bill = request('/api/v1/supplier-bills',employee,company,base=first,**bill_args)
                assert bill[0] == 201 and float(bill[1]['bill']['gross']) == 15, bill
                assert request('/api/v1/supplier-bills',employee,company,base=second,**bill_args) == bill
                bill_id = bill[1]['bill']['id']
                assert request('/api/v1/supplier-bills/'+bill_id,employee,company) == request(
                    '/api/v1/supplier-bills/'+bill_id,employee,company,base=legacy_url)
                payment_args = dict(payload={'amount':5.0,'method':'BANK_TRANSFER','reference':' Synthetic café + payment '+uuid.uuid4().hex,
                    'allocations':[{'billLineId':bill[1]['lines'][0]['id'],'amount':5.0}]},key=key+'-payment')
                if first == url:
                    payment_args['payload']['bankAccountId'] = '00000000-0000-0000-0000-000000000038'
                payment_path = '/api/v1/suppliers/'+supplier+'/payments'
                paid = request(payment_path,employee,company,base=second,**payment_args)
                assert paid[0] == 201 and float(paid[1]['payment']['amount']) == 5, paid
                assert request(payment_path,employee,company,base=first,**payment_args) == paid
                payment_read = request('/api/v1/supplier-payments/'+paid[1]['payment']['id'],employee,company)
                assert payment_read == (200,paid[1]), (payment_read,paid)
                settled_bill = request('/api/v1/supplier-bills/'+bill_id,employee,company)
                assert settled_bill == request('/api/v1/supplier-bills/'+bill_id,employee,company,base=legacy_url)
                assert float(settled_bill[1]['lines'][0]['paidAmount']) == 5 and float(settled_bill[1]['lines'][0]['outstandingAmount']) == 10, settled_bill
                ap_path = '/api/v1/accounting/ap?supplierId='+supplier+'&pageSize=100'
                ap = request(ap_path,employee,company)
                assert ap == request(ap_path,employee,company,base=legacy_url)
                ap_bill = next(item for item in ap[1]['items'] if item['billId'] == bill_id)
                assert float(ap_bill['paidAmount']) == 5 and float(ap_bill['outstandingAmount']) == 10, ap_bill
                assert request(payment_path,employee,company) == request(payment_path,employee,company,base=legacy_url)
                correction = dict(payload={'reference':'REV-'+uuid.uuid4().hex,'reason':' Synthetic café + reversal '},
                                  key=key+'-reverse-payment')
                reverse_path = '/api/v1/supplier-payments/'+paid[1]['payment']['id']+'/reverse'
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts = list(pool.map(lambda n: request(reverse_path,employee,company,
                        base=first if n % 2 == 0 else second,**correction), range(6)))
                reversed_payment = attempts[0]
                assert all(reply == reversed_payment for reply in attempts), attempts
                assert reversed_payment[0] == 201, reversed_payment
                assert request(reverse_path,employee,company,base=second,**correction) == reversed_payment
                restored = request('/api/v1/supplier-bills/'+bill_id,employee,company)
                assert float(restored[1]['lines'][0]['outstandingAmount']) == 15, restored
                advance_args = dict(payload={'amount':5,'advanceAmount':5,'method':'BANK_TRANSFER',
                    'reference':'PRE-'+uuid.uuid4().hex,'notes':' Synthetic supplier deposit '},key=key+'-advance')
                prepaid = request(payment_path,employee,company,base=first,**advance_args)
                assert prepaid[0] == 201 and float(prepaid[1]['advances'][0]['available']) == 5, prepaid
                assert request(payment_path,employee,company,base=second,**advance_args) == prepaid
                advance_id = prepaid[1]['advances'][0]['id']
                apply_path = '/api/v1/supplier-advances/'+advance_id+'/apply'
                apply_args = dict(payload={'reference':'APP-'+uuid.uuid4().hex,
                    'allocations':[{'billLineId':bill[1]['lines'][0]['id'],'amount':5}]},key=key+'-apply')
                applied = request(apply_path,employee,company,base=second,**apply_args)
                assert applied[0] == 201 and applied[1]['application']['applicationStatus'] == 'APPLIED', applied
                assert request(apply_path,employee,company,base=first,**apply_args) == applied
                unapply_path = '/api/v1/supplier-advance-applications/'+applied[1]['application']['id']+'/unapply'
                undo_args = dict(payload={'reference':'UNDO-'+uuid.uuid4().hex,'reason':' Synthetic reversal of advance application '},
                                 key=key+'-unapply')
                undone = request(unapply_path,employee,company,base=first,**undo_args)
                assert undone[0] == 201, undone
                assert request(unapply_path,employee,company,base=second,**undo_args) == undone
                restored = request('/api/v1/supplier-bills/'+bill_id,employee,company)
                assert float(restored[1]['lines'][0]['outstandingAmount']) == 15, restored
                advance_view = request('/api/v1/supplier-payments/'+prepaid[1]['payment']['id'],employee,company)
                assert float(advance_view[1]['advances'][0]['available']) == 5, advance_view
                undo_id = undone[1]['unapplication']['id']
                assert request('/api/v1/supplier-advance-unapplications/'+undo_id,employee,company) == request(
                    '/api/v1/supplier-advance-unapplications/'+undo_id,employee,company,base=legacy_url)
                reverse_id = reversed_payment[1]['reversal']['id']
                assert request('/api/v1/supplier-payment-reversals/'+reverse_id,employee,company) == request(
                    '/api/v1/supplier-payment-reversals/'+reverse_id,employee,company,base=legacy_url)

                reapply_path = '/api/v1/supplier-payment-reversals/'+reverse_id+'/reapply'
                reapply_args = dict(payload={'reference':'REAPP-'+uuid.uuid4().hex,'reason':' Synthetic corrected allocation ',
                    'allocations':[{'billLineId':bill[1]['lines'][0]['id'],'amount':5}]},key=key+'-reapply')
                invalid_apply = {**reapply_args,'payload':{**reapply_args['payload'],
                    'allocations':[{'billLineId':bill[1]['lines'][0]['id'],'amount':6}]},'key':key+'-over-reapply'}
                rejected = [request(reapply_path,employee,company,base=target,**invalid_apply) for target in (first,second)]
                assert rejected[0][0] == rejected[1][0] and rejected[0][0] >= 400, rejected
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts = list(pool.map(lambda n: request(reapply_path,employee,company,
                        base=first if n % 2 == 0 else second,**reapply_args), range(6)))
                reapplied = attempts[0]
                assert all(reply == reapplied for reply in attempts), attempts
                assert reapplied[0] == 201 and reapplied[1]['reversalId'] == reverse_id, reapplied
                assert request(reapply_path,employee,company,base=first,**reapply_args) == reapplied
                current_bill = request('/api/v1/supplier-bills/'+bill_id,employee,company)
                assert float(current_bill[1]['lines'][0]['outstandingAmount']) == 10, current_bill
                reallocate_path = '/api/v1/supplier-payments/'+reapplied[1]['payment']['id']+'/reallocate'
                reallocate_args = dict(payload={'reversalReference':'REALLOC-REV-'+uuid.uuid4().hex,
                    'reference':'REALLOC-'+uuid.uuid4().hex,'reason':' Synthetic move to prepayment ',
                    'advanceAmount':5,'allocations':[]},key=key+'-reallocate')
                failing_args = {**reallocate_args,'payload':{**reallocate_args['payload'],'advanceAmount':6},
                                'key':key+'-over-reallocate'}
                rejected = [request(reallocate_path,employee,company,base=target,**failing_args) for target in (first,second)]
                assert rejected[0][0] == rejected[1][0] and rejected[0][0] >= 400, rejected
                still_active = request('/api/v1/supplier-payments/'+reapplied[1]['payment']['id'],employee,company)
                assert still_active[1]['payment']['settlementStatus'] == 'ACTIVE', still_active
                current_bill = request('/api/v1/supplier-bills/'+bill_id,employee,company)
                assert float(current_bill[1]['lines'][0]['outstandingAmount']) == 10, current_bill
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts = list(pool.map(lambda n: request(reallocate_path,employee,company,
                        base=first if n % 2 == 0 else second,**reallocate_args), range(6)))
                reallocated = attempts[0]
                assert all(reply == reallocated for reply in attempts), attempts
                assert reallocated[0] == 201 and float(reallocated[1]['advances'][0]['available']) == 5, reallocated
                assert request(reallocate_path,employee,company,base=second,**reallocate_args) == reallocated
                current_bill = request('/api/v1/supplier-bills/'+bill_id,employee,company)
                assert float(current_bill[1]['lines'][0]['outstandingAmount']) == 15, current_bill
                current_po = request(po_path,employee,company)
                extra = dict(payload={'reference':'VAR-RECEIVE-'+uuid.uuid4().hex,
                     'lines':[{'orderLineId':confirmed[1]['lines'][0]['id'],'quantity':1}]},
                     key=key+'-variance-receipt',version=current_po[1]['order']['version'])
                more = request(po_path+'/receipts',employee,company,base=first,**extra)
                assert more[0] == 201, more
                variance_bill = {**bill_args['payload'],'supplierInvoice':'VAR-BILL-'+uuid.uuid4().hex,
                    'lines':[{'receiptLineId':more[1]['lines'][0]['id'],'quantity':1,'net':16,'tax':0}]}
                for target in (first,second):
                    mismatch = request('/api/v1/supplier-bills',employee,company,base=target,
                                       payload=variance_bill,key=key+'-bad-variance')
                    assert mismatch[0] == 422, mismatch
                variance_args = dict(payload={'bill':variance_bill,'reason':' Verified supplier price difference '},
                                     key=key+'-variance-bill')
                varied = request('/api/v1/supplier-bills/with-variance',employee,company,base=second,**variance_args)
                assert varied[0] == 201 and float(varied[1]['lines'][0]['costVariance']) == 1, varied
                assert request('/api/v1/supplier-bills/with-variance',employee,company,base=first,**variance_args) == varied
                assert request('/api/v1/supplier-bills/with-variance',buyer,company,base=first,**variance_args)[0] == 403
                assert request('/api/v1/supplier-bills/with-variance',buyer,company,base=second,**variance_args)[0] == 403
                current_po = request(po_path,employee,company)
                close = dict(payload={'reason':'  Synthetic closure + café  '},key=key+'-close',
                             version=current_po[1]['order']['version'])
                closed = request(po_path+'/close',employee,company,base=second,**close)
                assert closed[0] == 200 and closed[1]['order']['status'] == 'CLOSED', closed
                assert request(po_path+'/close',employee,company,base=first,**close) == closed
            print('PASS: supplier correction concurrent replay and failed atomic reallocation rollback')
            print('PASS: bidirectional payment reapplication and atomic reallocation to supplier advance')
            print('PASS: bidirectional variance bill, supplier advance/apply/unapply and payment reversal')
            print('PASS: bidirectional supplier bill/payment replay with partially settled AP')
            print('PASS: bidirectional purchase receipt and exactly-once stock addition')
            print('PASS: bidirectional purchase order draft, update, confirmation and closure replay')
            today = datetime.datetime.now(ZoneInfo('Australia/Sydney')).date().isoformat()
            taxable = request('/api/v1/purchase-orders',employee,company,payload={
                'supplierId':supplier,'warehouseId':'00000000-0000-0000-0000-000000000014',
                'lines':[{'productUnitId':unit_id,'quantity':1,'unitCost':15,
                    'taxCodeId':'00000000-0000-0000-0000-000000000053'}]},key='tax-po-'+uuid.uuid4().hex)
            assert taxable[0] == 201, taxable
            tax_po = '/api/v1/purchase-orders/'+taxable[1]['order']['id']
            confirmed = request(tax_po+'/confirm',employee,company,payload={},
                key='tax-confirm-'+uuid.uuid4().hex,version=taxable[1]['order']['version'])
            assert confirmed[0] == 200, confirmed
            received = request(tax_po+'/receipts',employee,company,payload={
                'reference':'Tax receipt '+uuid.uuid4().hex,
                'lines':[{'orderLineId':confirmed[1]['lines'][0]['id'],'quantity':1}]},
                key='tax-receive-'+uuid.uuid4().hex,version=confirmed[1]['order']['version'])
            assert received[0] == 201, received
            unmatched_path = '/api/v1/accounting/grni/unmatched?supplierId='+supplier
            unmatched = request(unmatched_path,employee,company)
            assert unmatched == request(unmatched_path,employee,company,base=legacy_url)
            assert any(item['receiptLineId'] == received[1]['lines'][0]['id'] for item in unmatched[1]['items']), unmatched
            bill = request('/api/v1/supplier-bills',employee,company,payload={
                'supplierId':supplier,'supplierInvoice':'Tax bill '+uuid.uuid4().hex,
                'invoiceDate':today,'dueOn':today,'postingDate':today,
                'taxInvoiceReference':'Synthetic tax invoice','taxInvoiceHeldOn':today,
                'lines':[{'receiptLineId':received[1]['lines'][0]['id'],'quantity':1,'net':15,'tax':1.5}]},
                key='tax-bill-'+uuid.uuid4().hex)
            assert bill[0] == 201 and float(bill[1]['bill']['gross']) == 16.5, bill
            for report in ('purchase-gst','purchase-gst-attributions'):
                report_path = '/api/v1/accounting/'+report
                for query in ('','?supplierId='+supplier,'?from='+today+'&to='+today,
                        '?supplierId='+supplier+'&from='+today+'&to='+today+'&pageSize=1',
                        '?supplierId='+str(uuid.uuid4())):
                    actual = request(report_path+query,employee,company)
                    assert actual == request(report_path+query,employee,company,base=legacy_url), (report_path,actual)
                assert request(report_path,token('test-purchase-reader'),company)[0] == 403
                for query in ('?from=2026-12-01&to=2026-11-01','?page=0','?pageSize=101'):
                    assert request(report_path+query,employee,company)[0] == request(report_path+query,employee,company,base=legacy_url)[0] == 422
            gst = request('/api/v1/accounting/purchase-gst?supplierId='+supplier,employee,company)
            cash = os.environ.get('HTT_COMPAT_GST_BASIS') == 'CASH'
            assert float(gst[1]['attributedTax']) == (0 if cash else 1.5), gst
            assert float(gst[1]['pendingPaymentTax']) == (1.5 if cash else 0), gst
            tax_entries = request('/api/v1/accounting/purchase-gst-attributions?supplierId='+supplier,employee,company)
            assert any(item['billId']==bill[1]['bill']['id'] and float(item['gstAmount'])==1.5
                and item['kind']=='BILL_CREDIT' for item in tax_entries[1]['items']) == (not cash), tax_entries
            payment = dict(payload={'amount':5.5,'method':'BANK_TRANSFER','reference':'Tax partial payment '+uuid.uuid4().hex,
                'allocations':[{'billLineId':bill[1]['lines'][0]['id'],'amount':5.5}]},key='tax-payment-'+uuid.uuid4().hex)
            paid = request('/api/v1/suppliers/'+supplier+'/payments',employee,company,**payment)
            assert paid[0] == 201, paid
            assert request('/api/v1/suppliers/'+supplier+'/payments',employee,company,base=legacy_url,**payment) == paid
            gst = request('/api/v1/accounting/purchase-gst?supplierId='+supplier,employee,company)
            assert gst == request('/api/v1/accounting/purchase-gst?supplierId='+supplier,employee,company,base=legacy_url)
            assert float(gst[1]['attributedTax']) == (0.5 if cash else 1.5), gst
            assert float(gst[1]['pendingPaymentTax']) == (1 if cash else 0), gst
            tax_entries = request('/api/v1/accounting/purchase-gst-attributions?supplierId='+supplier,employee,company)
            assert tax_entries == request('/api/v1/accounting/purchase-gst-attributions?supplierId='+supplier,employee,company,base=legacy_url)
            if cash:
                assert any(item['billId']==bill[1]['bill']['id'] and float(item['gstAmount'])==0.5
                    and item['kind']=='CASH_PAYMENT' for item in tax_entries[1]['items']), tax_entries
            reversal = dict(payload={'reference':'Tax reversal '+uuid.uuid4().hex,'reason':'Synthetic partial payment reversal'},
                key='tax-reversal-'+uuid.uuid4().hex)
            reverse_path = '/api/v1/supplier-payments/'+paid[1]['payment']['id']+'/reverse'
            reversed_payment = request(reverse_path,employee,company,base=legacy_url,**reversal)
            assert reversed_payment[0] == 201, reversed_payment
            assert request(reverse_path,employee,company,**reversal) == reversed_payment
            gst = request('/api/v1/accounting/purchase-gst?supplierId='+supplier,employee,company)
            assert gst == request('/api/v1/accounting/purchase-gst?supplierId='+supplier,employee,company,base=legacy_url)
            assert float(gst[1]['attributedTax']) == (0 if cash else 1.5), gst
            assert float(gst[1]['pendingPaymentTax']) == (1.5 if cash else 0), gst
            tax_entries = request('/api/v1/accounting/purchase-gst-attributions?supplierId='+supplier,employee,company)
            assert tax_entries == request('/api/v1/accounting/purchase-gst-attributions?supplierId='+supplier,employee,company,base=legacy_url)
            if cash:
                assert any(item['billId']==bill[1]['bill']['id'] and float(item['gstAmount'])==-0.5
                    for item in tax_entries[1]['items']), tax_entries
            print('PASS: purchase GST partial payment and reversal under '+('CASH' if cash else 'NON_CASH'))
            def tax_state(attributed, pending):
                path = '/api/v1/accounting/purchase-gst?supplierId='+supplier
                result = request(path,employee,company)
                assert result == request(path,employee,company,base=legacy_url), result
                assert float(result[1]['attributedTax']) == (attributed if cash else 1.5), result
                assert float(result[1]['pendingPaymentTax']) == (pending if cash else 0), result
                return result

            advance_args = dict(payload={'amount':5.5,'advanceAmount':5.5,'method':'BANK_TRANSFER',
                'reference':'Tax prepayment '+uuid.uuid4().hex,'notes':'Synthetic taxable supplier deposit'},key='tax-advance-'+uuid.uuid4().hex)
            prepaid = request('/api/v1/suppliers/'+supplier+'/payments',employee,company,base=legacy_url,**advance_args)
            assert prepaid[0] == 201 and float(prepaid[1]['advances'][0]['available']) == 5.5, prepaid
            assert request('/api/v1/suppliers/'+supplier+'/payments',employee,company,**advance_args) == prepaid
            tax_state(0,1.5)
            apply_path = '/api/v1/supplier-advances/'+prepaid[1]['advances'][0]['id']+'/apply'
            allocations = [{'billLineId':bill[1]['lines'][0]['id'],'amount':5.5}]
            apply_args = dict(payload={'reference':'Tax application '+uuid.uuid4().hex,'allocations':allocations},
                key='tax-apply-'+uuid.uuid4().hex)
            bad_args = dict(payload={**apply_args['payload'],'allocations':[{'billLineId':bill[1]['lines'][0]['id'],'amount':6}]},
                key='tax-over-apply-'+uuid.uuid4().hex)
            for target in (url,legacy_url):
                assert request(apply_path,employee,company,base=target,**bad_args)[0] >= 400
            tax_state(0,1.5)
            with ThreadPoolExecutor(max_workers=6) as pool:
                attempts = list(pool.map(lambda n: request(apply_path,employee,company,
                    base=url if n%2 else legacy_url,**apply_args),range(6)))
            applied = attempts[0]
            assert applied[0] == 201 and all(result==applied for result in attempts), attempts
            tax_state(.5,1)
            entries_path = '/api/v1/accounting/purchase-gst-attributions?supplierId='+supplier
            entries = request(entries_path,employee,company)
            assert entries == request(entries_path,employee,company,base=legacy_url)
            if cash:
                assert any(item['sourceDocumentId']==applied[1]['application']['id']
                    and item['kind']=='PREPAYMENT_APPLICATION' and float(item['gstAmount'])==.5
                    for item in entries[1]['items']), entries
            undo_path = '/api/v1/supplier-advance-applications/'+applied[1]['application']['id']+'/unapply'
            undo_args = dict(payload={'reference':'Tax unapplication '+uuid.uuid4().hex,'reason':'Synthetic undo taxable advance'},
                key='tax-unapply-'+uuid.uuid4().hex)
            undone = request(undo_path,employee,company,**undo_args)
            assert undone[0] == 201, undone
            assert request(undo_path,employee,company,base=legacy_url,**undo_args) == undone
            tax_state(0,1.5)
            advance_view = request('/api/v1/supplier-payments/'+prepaid[1]['payment']['id'],employee,company)
            assert float(advance_view[1]['advances'][0]['available']) == 5.5, advance_view

            reapply_path = '/api/v1/supplier-payment-reversals/'+reversed_payment[1]['reversal']['id']+'/reapply'
            reapply_args = dict(payload={'reference':'Tax reapplication '+uuid.uuid4().hex,
                'reason':'Synthetic taxable correction','allocations':allocations},key='tax-reapply-'+uuid.uuid4().hex)
            reapplied = request(reapply_path,employee,company,**reapply_args)
            assert reapplied[0] == 201, reapplied
            assert request(reapply_path,employee,company,base=legacy_url,**reapply_args) == reapplied
            tax_state(.5,1)
            reallocate_path = '/api/v1/supplier-payments/'+reapplied[1]['payment']['id']+'/reallocate'
            reallocate_args = dict(payload={'reversalReference':'Tax reallocation reversal '+uuid.uuid4().hex,
                'reference':'Tax reallocation '+uuid.uuid4().hex,'reason':'Synthetic taxable reallocation to advance',
                'advanceAmount':5.5,'allocations':[]},key='tax-reallocate-'+uuid.uuid4().hex)
            failing = dict(payload={**reallocate_args['payload'],'advanceAmount':6},key='tax-over-reallocate-'+uuid.uuid4().hex)
            before = tax_state(.5,1)
            for target in (legacy_url,url):
                assert request(reallocate_path,employee,company,base=target,**failing)[0] >= 400
                assert tax_state(.5,1) == before
                active = request('/api/v1/supplier-payments/'+reapplied[1]['payment']['id'],employee,company)
                assert active[1]['payment']['settlementStatus']=='ACTIVE', active
            reallocated = request(reallocate_path,employee,company,base=legacy_url,**reallocate_args)
            assert reallocated[0] == 201, reallocated
            assert request(reallocate_path,employee,company,**reallocate_args) == reallocated
            assert float(reallocated[1]['advances'][0]['available']) == 5.5, reallocated
            tax_state(0,1.5)
            entries = request(entries_path,employee,company)
            assert entries == request(entries_path,employee,company,base=legacy_url)
            print('PASS: taxable supplier advance/application/unapplication/reapply/reallocate and atomic failure GST matrix')

            unmatched = request(unmatched_path,employee,company)
            assert not any(item['receiptLineId'] == received[1]['lines'][0]['id'] for item in unmatched[1]['items']), unmatched
            print('PASS: populated purchase GST, attribution filters and unmatched GRNI removal')

            credit_path = '/api/v1/customers/00000000-0000-0000-0000-000000000011/credit'
            for first, second in ((legacy_url,url),(url,legacy_url)):
                candidate = request('/api/v1/sales-orders',employee,company,base=first,payload={
                    'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                    'warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':unit_id,'quantity':2}], 'reason':'Synthetic cancel fixture'},
                    key='legacy-order-'+str(uuid.uuid4()))
                assert candidate[0] == 201, candidate
                cancel_path = '/api/v1/sales-orders/'+candidate[1]['orderId']+'/cancel'
                key = 'cancel-order-'+candidate[1]['orderId']
                before_stock = float(request(warehouse_path,employee,company)[1]['items'][0]['reserved'])
                before_credit = float(request(credit_path,employee,company)[1]['unbilledOrders'])
                args = dict(payload={'reason':' Synthetic café + cancellation '},key=key,version=1)
                canceled = request(cancel_path,employee,company,base=first,**args)
                assert canceled[0] == 200 and canceled[1]['state'] == 'CANCELLED', canceled
                assert request(cancel_path,employee,company,base=second,**args) == canceled
                assert float(request(warehouse_path,employee,company)[1]['items'][0]['reserved']) == before_stock-2
                assert float(request(credit_path,employee,company)[1]['unbilledOrders']) == before_credit-90
                assert request(cancel_path,employee,company,base=url,payload=args['payload'],key=key+'-stale',version=1)[0] == 409
            for first,second,taxable in ((legacy_url,url,False),(url,legacy_url,False),(legacy_url,url,True),(url,legacy_url,True)):
                gross=16.5 if taxable else 15
                transfer=9.9 if taxable else 9
                remainder=round(gross-transfer,2)
                cash=os.environ.get('HTT_COMPAT_GST_BASIS')=='CASH'
                def supplier_bill_fixture(label,billed=True,taxable_fixture=None):
                    taxed=taxable if taxable_fixture is None else taxable_fixture
                    draft={'supplierId':supplier,'warehouseId':'00000000-0000-0000-0000-000000000014',
                        'notes':'Synthetic supplier credit '+label,'lines':[{'productUnitId':unit_id,'quantity':1,
                        'unitCost':15,'taxCodeId':('00000000-0000-0000-0000-000000000053' if taxed else '00000000-0000-0000-0000-000000000016')}]}
                    created=request('/api/v1/purchase-orders',employee,company,base=legacy_url,payload=draft,key='supplier-credit-po-'+uuid.uuid4().hex)
                    assert created[0]==201, created
                    po_path='/api/v1/purchase-orders/'+created[1]['order']['id']
                    confirmed=request(po_path+'/confirm',employee,company,base=legacy_url,payload={},key='supplier-credit-confirm-'+uuid.uuid4().hex,version=created[1]['order']['version'])
                    assert confirmed[0]==200, confirmed
                    receipt=request(po_path+'/receipts',employee,company,base=legacy_url,payload={
                        'reference':'Supplier credit receiving '+uuid.uuid4().hex,
                        'lines':[{'orderLineId':confirmed[1]['lines'][0]['id'],'quantity':1}]},key='supplier-credit-receive-'+uuid.uuid4().hex,version=confirmed[1]['order']['version'])
                    assert receipt[0]==201, receipt
                    if not billed: return None,receipt[1]
                    today=datetime.datetime.now(ZoneInfo('Australia/Sydney')).date().isoformat()
                    bill=request('/api/v1/supplier-bills',employee,company,base=legacy_url,payload={
                        'supplierId':supplier,'supplierInvoice':'Supplier credit fixture '+uuid.uuid4().hex,
                        'invoiceDate':today,'dueOn':today,'postingDate':today,
                        **({'taxInvoiceReference':'Synthetic verified supplier credit invoice','taxInvoiceHeldOn':today} if taxed else {}),
                        'lines':[{'receiptLineId':receipt[1]['lines'][0]['id'],'quantity':1,'net':15,'tax':(1.5 if taxed else 0)}]},key='supplier-credit-bill-'+uuid.uuid4().hex)
                    assert bill[0]==201, bill
                    return bill[1],receipt[1]
                def supplier_bill_tax(line_id,expected):
                    if not taxable: return
                    entries=[]
                    for page in range(1,11):
                        path='/api/v1/accounting/purchase-gst-attributions?supplierId='+supplier+'&pageSize=100&page='+str(page)
                        result=request(path,employee,company)
                        assert result==request(path,employee,company,base=legacy_url) and result[0]==200, result
                        entries.extend(result[1]['items'])
                        if len(result[1]['items'])<100: break
                    else: raise AssertionError('Synthetic GST report pagination exceeded fixture bound')
                    selected=[row for row in entries if row['billLineId']==line_id]
                    assert round(sum(float(row['gstAmount']) for row in selected),2)==expected, (expected,selected)
                source,source_receipt=supplier_bill_fixture('source')
                target_bill,target_receipt=supplier_bill_fixture('target')
                supplier_bill_tax(source['lines'][0]['id'],0 if cash else 1.5)
                supplier_bill_tax(target_bill['lines'][0]['id'],0 if cash else 1.5)
                paid=request('/api/v1/suppliers/'+supplier+'/payments',employee,company,base=legacy_url,payload={
                    'amount':gross,'method':'BANK_TRANSFER','reference':'Supplier credit source payment '+uuid.uuid4().hex,
                    'allocations':[{'billLineId':source['lines'][0]['id'],'amount':gross}]},key='supplier-credit-paid-'+uuid.uuid4().hex)
                assert paid[0]==201, paid
                supplier_bill_tax(source['lines'][0]['id'],1.5)
                return_path='/api/v1/purchase-receipts/'+source_receipt['receipt']['id']+'/returns'
                sources_path='/api/v1/warehouse/purchase-receipts/'+source_receipt['receipt']['id']+'/return-sources'
                before_sources=request(sources_path,employee,company)
                assert before_sources==request(sources_path,employee,company,base=legacy_url) and before_sources[0]==200, before_sources
                before_hand=float(request(warehouse_path,employee,company)[1]['items'][0]['onHand'])
                return_args=dict(payload={'reference':' Supplier café returned goods '+uuid.uuid4().hex,'reason':' Synthetic supplier credit source ',
                    'lines':[{'receiptLineId':source_receipt['lines'][0]['id'],'billLineId':source['lines'][0]['id'],'quantity':1}]},key='supplier-credit-return-'+uuid.uuid4().hex)
                for target in (first,second):
                    assert request(return_path,None,company,base=target,**return_args)[0]==401
                    assert request(return_path,token('test-purchase-reader'),company,base=target,**return_args)[0]==403
                    for changed_line,status in (({**return_args['payload']['lines'][0],'quantity':None},400),
                            ({**return_args['payload']['lines'][0],'receiptLineId':None},400),
                            ({**return_args['payload']['lines'][0],'billLineId':'00000000-0000-0000-0000-000000000000'},422)):
                        failed=request(return_path,employee,company,base=target,payload={**return_args['payload'],'lines':[changed_line]},key='invalid-purchase-return-'+uuid.uuid4().hex)
                        assert failed[0]==status, failed
                returned=request(return_path,employee,company,base=first,**return_args)
                assert returned[0]==201, returned
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(return_path,employee,company,base=first if n%2 else second,**return_args),range(6)))
                assert all(result==returned for result in attempts), attempts
                assert float(request(warehouse_path,employee,company)[1]['items'][0]['onHand'])==before_hand-1
                return_detail='/api/v1/purchase-returns/'+returned[1]['return']['id']
                financial_detail='/api/v1/accounting/purchase-returns/'+returned[1]['return']['id']
                assert request(return_detail,employee,company)==request(return_detail,employee,company,base=legacy_url)==(200,returned[1])
                assert request(financial_detail,employee,company)==request(financial_detail,employee,company,base=legacy_url)==(200,returned[1])
                redacted=request(return_detail,token('test-return-no-cost'),company)
                assert redacted==request(return_detail,token('test-return-no-cost'),company,base=legacy_url) and redacted[0]==200, redacted
                assert 'journalEntryId' not in redacted[1]['return']
                for line in redacted[1]['lines']:
                    assert not set(line).intersection({'net','tax','recoverableTax','valuationAmount','cost','valueAfter','contraAccountId'}), line
                assert request(financial_detail,token('test-credit-no-bills'),company)==(200,returned[1])
                for target in (first,second):
                    assert request(return_detail,token('test-return-unassigned'),company,base=target)[0]==403
                    assert request(sources_path,token('test-return-unassigned'),company,base=target)[0]==403
                after_sources=request(sources_path,employee,company)
                assert after_sources==request(sources_path,employee,company,base=legacy_url), after_sources
                assert all(float(row['availableQuantity'])==0 for row in after_sources[1]['items']), after_sources
                conflict=dict(payload={**return_args['payload'],'reason':'Changed return reason'},key=return_args['key'])
                assert request(return_path,employee,company,base=second,**conflict)[0]==409
                credit_path='/api/v1/supplier-bills/'+source['bill']['id']+'/credits'
                credit_args=dict(payload={'reference':' Supplier café credit note '+uuid.uuid4().hex,'reason':' Synthetic transfer source ',
                    'lines':[{'returnLineId':returned[1]['lines'][0]['id'],'quantity':1}]},key='supplier-credit-note-'+uuid.uuid4().hex)
                for target in (first,second):
                    assert request(credit_path,None,company,base=target,**credit_args)[0]==401
                    assert request(credit_path,token('test-purchase-reader'),company,base=target,**credit_args)[0]==403
                    failed=request(credit_path,employee,company,base=target,payload={**credit_args['payload'],
                        'lines':[{'returnLineId':returned[1]['lines'][0]['id'],'quantity':2}]},key='over-supplier-credit-'+uuid.uuid4().hex)
                    assert 400<=failed[0]<500, failed
                credit=request(credit_path,employee,company,base=first,**credit_args)
                assert credit[0]==201, credit
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(credit_path,employee,company,base=first if n%2 else second,**credit_args),range(6)))
                assert all(result==credit for result in attempts), attempts
                assert request('/api/v1/supplier-credits/'+credit[1]['credit']['id'],employee,company)==request('/api/v1/supplier-credits/'+credit[1]['credit']['id'],employee,company,base=legacy_url)==(200,credit[1])
                for query in ('','?supplierId='+supplier,'?supplierId=00000000-0000-0000-0000-000000000099','?page=0','?pageSize=101','?supplierId=bad'):
                    java=request('/api/v1/supplier-credits'+query,employee,company)
                    old=request('/api/v1/supplier-credits'+query,employee,company,base=legacy_url)
                    assert java[0]==old[0] and normalize(java[1])==normalize(old[1]), (java,old)
                supplier_bill_tax(source['lines'][0]['id'],1.5 if cash else 0)
                path='/api/v1/supplier-credits/'+credit[1]['credit']['id']+'/apply'
                args=dict(payload={'reference':' Apply café supplier credit '+uuid.uuid4().hex,'reason':' Synthetic bill settlement ',
                    'lines':[{'creditLineId':credit[1]['lines'][0]['id'],'billLineId':target_bill['lines'][0]['id'],'amount':transfer}]},key='supplier-credit-apply-'+uuid.uuid4().hex)
                for target in (first,second):
                    assert request(path,None,company,base=target,**args)[0]==401
                for subject in ('test-purchase-reader','test-credit-no-bills'):
                    rejected=[request(path,token(subject),company,base=target,**args) for target in (first,second)]
                    assert rejected[0][0]==rejected[1][0]==403 and normalize(rejected[0][1])==normalize(rejected[1][1]), rejected
                for target in (first,second):
                    for invalid_line,status in (({**args['payload']['lines'][0],'amount':None},422),
                            ({**args['payload']['lines'][0],'creditLineId':None},400),
                            ({**args['payload']['lines'][0],'amount':gross+1},409)):
                        rejected=request(path,employee,company,base=target,payload={**args['payload'],'lines':[invalid_line]},key='invalid-supplier-credit-'+uuid.uuid4().hex)
                        assert rejected[0]==status, rejected
                applied=request(path,employee,company,base=first,**args)
                assert applied[0]==201 and applied[1]['application']['applicationStatus']=='APPLIED', applied
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,employee,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==applied for result in attempts), attempts
                supplier_bill_tax(source['lines'][0]['id'],.6 if cash else 0)
                supplier_bill_tax(target_bill['lines'][0]['id'],.9 if cash else 1.5)
                read_path='/api/v1/supplier-credit-applications/'+applied[1]['application']['id']
                assert request(read_path,employee,company)==request(read_path,employee,company,base=legacy_url)==(200,applied[1])
                assert request(read_path,token('test-credit-no-bills'),company)==(200,applied[1])
                assert request(read_path,None,company)[0]==401
                listed='/api/v1/supplier-credits/'+credit[1]['credit']['id']+'/applications'
                assert request(listed,employee,company)==request(listed,employee,company,base=legacy_url)
                for query in ('?page=0','?pageSize=101'):
                    assert request(listed+query,employee,company)[0]==request(listed+query,employee,company,base=legacy_url)[0]==422
                source_credit=request('/api/v1/supplier-credits/'+credit[1]['credit']['id'],employee,company,base=legacy_url)
                assert float(source_credit[1]['lines'][0]['appliedAmount'])==transfer and float(source_credit[1]['lines'][0]['availableApplyAmount'])==remainder, source_credit
                target_view=request('/api/v1/supplier-bills/'+target_bill['bill']['id'],employee,company)
                assert target_view==request('/api/v1/supplier-bills/'+target_bill['bill']['id'],employee,company,base=legacy_url)
                assert float(target_view[1]['lines'][0]['creditReceivedAmount'])==transfer and float(target_view[1]['lines'][0]['outstandingAmount'])==remainder, target_view
                undo_path=read_path+'/unapply'
                undo_args=dict(payload={'reference':' Unapply café supplier credit '+uuid.uuid4().hex,'reason':' Synthetic correction '},key='supplier-credit-unapply-'+uuid.uuid4().hex)
                for target in (first,second):
                    assert request(undo_path,token('test-credit-no-bills'),company,base=target,**undo_args)[0]==403
                undone=request(undo_path,employee,company,base=second,**undo_args)
                assert undone[0]==201, undone
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(undo_path,employee,company,base=first if n%2 else second,**undo_args),range(6)))
                assert all(result==undone for result in attempts), attempts
                unapplication='/api/v1/supplier-credit-unapplications/'+undone[1]['unapplication']['id']
                assert request(unapplication,employee,company)==request(unapplication,employee,company,base=legacy_url)==(200,undone[1])
                status=request(read_path,employee,company)
                assert status==request(read_path,employee,company,base=legacy_url) and status[1]['application']['applicationStatus']=='UNAPPLIED', status
                source_credit=request('/api/v1/supplier-credits/'+credit[1]['credit']['id'],employee,company,base=legacy_url)
                assert float(source_credit[1]['lines'][0]['appliedAmount'])==0 and float(source_credit[1]['lines'][0]['availableApplyAmount'])==gross, source_credit
                target_view=request('/api/v1/supplier-bills/'+target_bill['bill']['id'],employee,company)
                assert target_view==request('/api/v1/supplier-bills/'+target_bill['bill']['id'],employee,company,base=legacy_url)
                assert float(target_view[1]['lines'][0]['creditReceivedAmount'])==0 and float(target_view[1]['lines'][0]['outstandingAmount'])==gross, target_view
                changed=dict(payload={**args['payload'],'reason':'Changed supplier application reason'},key=args['key'])
                assert request(path,employee,company,base=second,**changed)[0]==409
                supplier_bill_tax(source['lines'][0]['id'],1.5 if cash else 0)
                supplier_bill_tax(target_bill['lines'][0]['id'],0 if cash else 1.5)
                def supplier_refund_case(source_input,amount):
                    path='/api/v1/supplier-refunds'
                    args=dict(payload={**source_input,'amount':amount,'reference':' Supplier café & refund '+uuid.uuid4().hex,
                        'reason':' Synthetic supplier refund ','ignoredField':{'legacy':'ignored'}},key='supplier-refund-'+uuid.uuid4().hex)
                    today=datetime.datetime.now(ZoneInfo('Australia/Sydney')).date()
                    if first==url:
                        args['payload']['receivedOn']=today.isoformat()
                        args['payload']['bankAccountId']='00000000-0000-0000-0000-000000000160'
                    for target in (first,second):
                        assert request(path,None,company,base=target,**args)[0]==401
                        assert request(path,token('test-purchase-reader'),company,base=target,**args)[0]==403
                    bank_choice=dict(payload={**args['payload'],'bankAccountId':'00000000-0000-0000-0000-000000000038'},key=args['key']+'-bank-guard')
                    denied=[request(path,token('test-refund-no-bank'),company,base=target,**bank_choice) for target in (first,second)]
                    assert denied[0][0]==denied[1][0]==403 and normalize(denied[0][1])==normalize(denied[1][1]), denied
                    for change,status in (({'amount':None},400),({'amount':amount+1},409),
                            ({'creditLineId':None,'advanceId':None},422),({'receivedOn':(today+datetime.timedelta(days=1)).isoformat()},422),
                            ({'bankAccountId':'00000000-0000-0000-0000-000000000000'},422)):
                        bad=dict(payload={**args['payload'],**change},key=args['key']+'-invalid-'+uuid.uuid4().hex)
                        rejected=[request(path,employee,company,base=target,**bad) for target in (first,second)]
                        assert rejected[0][0]==rejected[1][0]==status and normalize(rejected[0][1])==normalize(rejected[1][1]), rejected
                    posted=request(path,employee,company,base=first,**args)
                    assert posted[0]==201 and posted[1]['refund']['refundStatus']=='ACTIVE' and float(posted[1]['refund']['amount'])==amount, posted
                    assert posted[1]['refund']['bankAccountId']==args['payload'].get('bankAccountId','00000000-0000-0000-0000-000000000038'), posted
                    supplier_bill_tax(source['lines'][0]['id'],0)
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(path,employee,company,base=first if n%2 else second,**args),range(6)))
                    assert all(result==posted for result in attempts), attempts
                    detail=path+'/'+posted[1]['refund']['id']
                    assert request(detail,employee,company)==request(detail,employee,company,base=legacy_url)==(200,posted[1])
                    assert request(detail,token('test-refund-no-bank'),company)==(200,posted[1])
                    assert request(detail,None,company)[0]==401
                    for query in ('','?supplierId='+supplier,'?supplierId=00000000-0000-0000-0000-000000000099','?pageSize=1','?page=0','?pageSize=101','?supplierId=bad'):
                        java=request(path+query,employee,company)
                        old=request(path+query,employee,company,base=legacy_url)
                        assert java[0]==old[0] and normalize(java[1])==normalize(old[1]), (java,old)
                    changed=dict(payload={**args['payload'],'reason':'Changed supplier refund reason'},key=args['key'])
                    assert request(path,employee,company,base=second,**changed)[0]==409
                    def source_available():
                        if 'creditLineId' in source_input:
                            current=request('/api/v1/supplier-credits/'+credit[1]['credit']['id'],employee,company)
                            return float(current[1]['lines'][0]['availableApplyAmount'])
                        current=request('/api/v1/supplier-payments/'+prepaid[1]['payment']['id'],employee,company)
                        return float(current[1]['advances'][0]['available'])
                    reverse_path=detail+'/reverse'
                    reverse_args=dict(payload={'reference':' Supplier café refund reversal '+uuid.uuid4().hex,
                        'reason':' Synthetic supplier refund correction '},key='supplier-refund-reverse-'+uuid.uuid4().hex)
                    for subject in ('test-purchase-reader','test-refund-no-bank'):
                        denied=[request(reverse_path,token(subject),company,base=target,**reverse_args) for target in (first,second)]
                        assert denied[0][0]==denied[1][0]==403 and normalize(denied[0][1])==normalize(denied[1][1]), denied
                    assert request(reverse_path,None,company,**reverse_args)[0]==401
                    reversed_refund=request(reverse_path,employee,company,base=second,**reverse_args)
                    assert reversed_refund[0]==201, reversed_refund
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(reverse_path,employee,company,base=first if n%2 else second,**reverse_args),range(6)))
                    assert all(result==reversed_refund for result in attempts), attempts
                    assert source_available()==amount
                    supplier_bill_tax(source['lines'][0]['id'],1.5 if cash else 0)
                    reversal_path='/api/v1/supplier-refund-reversals/'+reversed_refund[1]['reversal']['id']
                    assert request(reversal_path,employee,company)==request(reversal_path,employee,company,base=legacy_url)==(200,reversed_refund[1])
                    assert request(reversal_path,token('test-refund-no-bank'),company)==(200,reversed_refund[1])
                    original=request(detail,employee,company)
                    assert original==request(detail,employee,company,base=legacy_url) and original[1]['refund']['refundStatus']=='REVERSED', original
                    duplicate=dict(payload=reverse_args['payload'],key=reverse_args['key']+'-different')
                    rejected=[request(reverse_path,employee,company,base=target,**duplicate) for target in (first,second)]
                    assert rejected[0][0]==rejected[1][0]==409, rejected
                    replace_path=reversal_path+'/correct'
                    replace_args=dict(payload={**source_input,'reference':' Supplier café replacement '+uuid.uuid4().hex,
                        'reason':' Synthetic partial replacement ','amount':amount-1,'bankAccountId':{'ignored':True},
                        'receivedOn':{'ignored':True},'reversalReference':{'ignored':True}},key='supplier-refund-replace-'+uuid.uuid4().hex)
                    for subject in ('test-purchase-reader','test-refund-no-bank','test-refund-no-post'):
                        denied=[request(replace_path,token(subject),company,base=target,**replace_args) for target in (first,second)]
                        assert denied[0][0]==denied[1][0]==403 and normalize(denied[0][1])==normalize(denied[1][1]), denied
                    bad=dict(payload={**replace_args['payload'],'amount':amount+1},key=replace_args['key']+'-over')
                    rejected=[request(replace_path,employee,company,base=target,**bad) for target in (first,second)]
                    assert rejected[0][0]==rejected[1][0]==409, rejected
                    assert source_available()==amount
                    supplier_bill_tax(source['lines'][0]['id'],1.5 if cash else 0)
                    replacement=request(replace_path,employee,company,base=first,**replace_args)
                    assert replacement[0]==201, replacement
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(replace_path,employee,company,base=first if n%2 else second,**replace_args),range(6)))
                    assert all(result==replacement for result in attempts), attempts
                    assert replacement[1]['refund']['originalRefundId']==posted[1]['refund']['id']
                    assert replacement[1]['refund']['bankAccountId']==posted[1]['refund']['bankAccountId']
                    assert float(replacement[1]['refund']['amount'])==amount-1 and source_available()==1, replacement
                    supplier_bill_tax(source['lines'][0]['id'],.09 if cash else 0)
                    relation=request(reversal_path,employee,company)
                    assert relation==request(reversal_path,employee,company,base=legacy_url)
                    assert relation[1]['reversal']['replacementRefundId']==replacement[1]['refund']['id'], relation
                    atomic_path='/api/v1/supplier-refunds/'+replacement[1]['refund']['id']+'/correct'
                    atomic_args=dict(payload={**source_input,'reference':' Supplier café atomic correction '+uuid.uuid4().hex,
                        'reversalReference':' Supplier café atomic reversal '+uuid.uuid4().hex,'reason':' Synthetic full correction ',
                        'amount':amount,'bankAccountId':{'ignored':True},'receivedOn':{'ignored':True}},key='supplier-refund-atomic-'+uuid.uuid4().hex)
                    for subject in ('test-purchase-reader','test-refund-no-bank','test-refund-no-post','test-refund-no-reverse'):
                        denied=[request(atomic_path,token(subject),company,base=target,**atomic_args) for target in (first,second)]
                        assert denied[0][0]==denied[1][0]==403 and normalize(denied[0][1])==normalize(denied[1][1]), denied
                    for change,status in (({'amount':None},400),({'amount':amount+1},409),({'reversalReference':None},404)):
                        invalid=dict(payload={**atomic_args['payload'],**change},key=atomic_args['key']+'-invalid-'+uuid.uuid4().hex)
                        rejected=[request(atomic_path,employee,company,base=target,**invalid) for target in (first,second)]
                        assert rejected[0][0]==rejected[1][0]==status and normalize(rejected[0][1])==normalize(rejected[1][1]), rejected
                    still_active=request('/api/v1/supplier-refunds/'+replacement[1]['refund']['id'],employee,company)
                    assert still_active==request('/api/v1/supplier-refunds/'+replacement[1]['refund']['id'],employee,company,base=legacy_url)
                    assert still_active[1]['refund']['refundStatus']=='ACTIVE' and source_available()==1, still_active
                    supplier_bill_tax(source['lines'][0]['id'],.09 if cash else 0)
                    corrected=request(atomic_path,employee,company,base=second,**atomic_args)
                    assert corrected[0]==201, corrected
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(atomic_path,employee,company,base=first if n%2 else second,**atomic_args),range(6)))
                    assert all(result==corrected for result in attempts), attempts
                    assert corrected[1]['refund']['originalRefundId']==replacement[1]['refund']['id']
                    assert corrected[1]['refund']['bankAccountId']==posted[1]['refund']['bankAccountId'] and source_available()==0
                    supplier_bill_tax(source['lines'][0]['id'],0)
                    final_detail='/api/v1/supplier-refunds/'+corrected[1]['refund']['id']
                    assert request(final_detail,employee,company)==request(final_detail,employee,company,base=legacy_url)==(200,{'refund':corrected[1]['refund']})
                    changed=dict(payload={**atomic_args['payload'],'reason':'Changed atomic supplier correction'},key=atomic_args['key'])
                    assert request(atomic_path,employee,company,base=first,**changed)[0]==409
                    return corrected[1]['refund']

                supplier_refund_case({'creditLineId':credit[1]['lines'][0]['id']},gross)
                after=request('/api/v1/supplier-credits/'+credit[1]['credit']['id'],employee,company)
                assert after==request('/api/v1/supplier-credits/'+credit[1]['credit']['id'],employee,company,base=legacy_url)
                assert float(after[1]['lines'][0]['refundedAmount'])==gross and float(after[1]['lines'][0]['availableApplyAmount'])==0, after
                if taxable:
                    returned=request('/api/v1/purchase-receipts/'+target_receipt['receipt']['id']+'/returns',employee,company,base=second,payload={
                        'reference':'Close taxable target return '+uuid.uuid4().hex,'reason':'Synthetic target bill cancellation',
                        'lines':[{'receiptLineId':target_receipt['lines'][0]['id'],'billLineId':target_bill['lines'][0]['id'],'quantity':1}]},key='tax-target-return-'+uuid.uuid4().hex)
                    assert returned[0]==201, returned
                    credited=request('/api/v1/supplier-bills/'+target_bill['bill']['id']+'/credits',employee,company,base=first,payload={
                        'reference':'Close taxable target credit '+uuid.uuid4().hex,'reason':'Synthetic target bill cancellation',
                        'lines':[{'returnLineId':returned[1]['lines'][0]['id'],'quantity':1}]},key='tax-target-credit-'+uuid.uuid4().hex)
                    assert credited[0]==201 and float(credited[1]['credit']['tax'])==1.5, credited
                    supplier_bill_tax(target_bill['lines'][0]['id'],0)
                else:
                    prepaid=request('/api/v1/suppliers/'+supplier+'/payments',employee,company,base=first,payload={
                        'amount':12,'advanceAmount':12,'method':'BANK_TRANSFER','reference':'Supplier refundable prepayment '+uuid.uuid4().hex,
                        'allocations':[],'notes':'Synthetic refundable prepayment'},key='supplier-refundable-prepay-'+uuid.uuid4().hex)
                    assert prepaid[0]==201 and float(prepaid[1]['advances'][0]['available'])==12, prepaid
                    supplier_refund_case({'advanceId':prepaid[1]['advances'][0]['id']},12)
                    after=request('/api/v1/supplier-payments/'+prepaid[1]['payment']['id'],employee,company)
                    assert after==request('/api/v1/supplier-payments/'+prepaid[1]['payment']['id'],employee,company,base=legacy_url)
                    assert float(after[1]['advances'][0]['available'])==0, after

            for first,second in ((legacy_url,url),(url,legacy_url)):
                _,receipt=supplier_bill_fixture('unbilled',False,False)
                path='/api/v1/purchase-receipts/'+receipt['receipt']['id']+'/returns'
                args=dict(payload={'reference':'Unbilled café purchase return '+uuid.uuid4().hex,'reason':'Synthetic return before supplier billing',
                    'lines':[{'receiptLineId':receipt['lines'][0]['id'],'quantity':1}]},key='unbilled-purchase-return-'+uuid.uuid4().hex)
                before_hand=float(request(warehouse_path,employee,company)[1]['items'][0]['onHand'])
                returned=request(path,employee,company,base=first,**args)
                assert returned[0]==201 and returned[1]['lines'][0]['billLineId'] is None, returned
                replay=dict(payload={**args['payload'],'lines':[{**args['payload']['lines'][0],'billLineId':None}]},key=args['key'])
                assert request(path,employee,company,base=second,**replay)==returned
                assert float(request(warehouse_path,employee,company)[1]['items'][0]['onHand'])==before_hand-1
                sources='/api/v1/warehouse/purchase-receipts/'+receipt['receipt']['id']+'/return-sources'
                available=request(sources,employee,company)
                assert available==request(sources,employee,company,base=legacy_url), available
                assert all(float(line['availableQuantity'])==0 for line in available[1]['items']), available
            print('PASS: taxable supplier return/credit/application/refund/correction GST matrix')
            print('PASS: purchase return/credit writers, cost redaction, warehouse guards, unbilled nullable source and mixed replay')
            print('PASS: supplier refund reversal/replacement/atomic correction, compound authorities, immutable bank and rollback')
            print('PASS: supplier credit/advance refunds, bank choice permissions, date/source validation, read/list and mixed replay')
            print('PASS: supplier credit application/unapplication, permission conjunctions, balances, list/detail and mixed replay')
            for first,second,recoverable in ((legacy_url,url,None),(url,legacy_url,None),(legacy_url,url,True),(url,legacy_url,True),(legacy_url,url,False),(url,legacy_url,False)):
                taxed=recoverable is not None
                expense_gross=22 if taxed else 20
                adjustment_gross=5.5 if taxed else 5
                remaining_gross=expense_gross-adjustment_gross
                expected_gst=2 if recoverable else 0
                cash=os.environ.get("HTT_COMPAT_GST_BASIS")=="CASH"
                today=datetime.datetime.now(ZoneInfo('Australia/Sydney')).date().isoformat()
                draft={'supplierId':supplier,'supplierInvoice':' Expense café bill '+uuid.uuid4().hex+' ',
                    'invoiceDate':today,'dueOn':today,'postingDate':today,'notes':' Synthetic expense ',
                    'lines':[{'expenseAccountId':'00000000-0000-0000-0000-000000000170','description':' Synthetic café & expense ',
                        'net':20,'tax':(2 if taxed else 0),'taxCodeId':('00000000-0000-0000-0000-000000000053' if taxed else '00000000-0000-0000-0000-000000000016'),
                        **({'recoverableGst':recoverable} if taxed else {})}]}
                if recoverable:
                    draft.update(taxInvoiceReference='Synthetic verified expense invoice',taxInvoiceHeldOn=today)
                path='/api/v1/supplier-expense-bills'
                args=dict(payload=draft,key='expense-bill-'+uuid.uuid4().hex)
                for subject in ('test-purchase-reader','test-refund-no-bank'):
                    denied=[request(path,token(subject),company,base=target,**args) for target in (first,second)]
                    assert denied[0][0]==denied[1][0]==403 and normalize(denied[0][1])==normalize(denied[1][1]), denied
                for target in (first,second):
                    assert request(path,None,company,base=target,**args)[0]==401
                    for change,status in (({'invoiceDate':None},400),({'invoiceDate':'0001-01-01'},422),
                            ({'lines':[{**draft['lines'][0],'net':None}]},422),({'lines':[{**draft['lines'][0],'expenseAccountId':None}]},400)):
                        rejected=request(path,employee,company,base=target,payload={**draft,**change},key='invalid-expense-'+uuid.uuid4().hex)
                        assert rejected[0]==status, rejected
                before_stock=request(warehouse_path,employee,company)
                posted=request(path,employee,company,base=first,**args)
                assert posted[0]==201 and posted[1]['bill']['billType']=='EXPENSE' and float(posted[1]['bill']['gross'])==expense_gross, posted
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,employee,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==posted for result in attempts), attempts
                current_stock=request(warehouse_path,employee,company)
                assert current_stock[0]==before_stock[0]==200 and normalize(current_stock[1])==normalize(before_stock[1]), (before_stock,current_stock)
                detail='/api/v1/supplier-bills/'+posted[1]['bill']['id']
                assert request(detail,employee,company)==request(detail,employee,company,base=legacy_url)==(200,posted[1])
                assert posted[1]['lines'][0]['description']=='Synthetic café & expense'
                assert posted[1]['lines'][0]['expenseAccountId']=='00000000-0000-0000-0000-000000000170'
                supplier_bill_tax(posted[1]['lines'][0]['id'],0 if cash else expected_gst)
                assert float(posted[1]['lines'][0]['recoverableTax'])==expected_gst,posted
                changed=dict(payload={**draft,'notes':'Changed expense notes'},key=args['key'])
                assert request(path,employee,company,base=second,**changed)[0]==409
                if taxed:
                    payment_path='/api/v1/suppliers/'+supplier+'/payments'
                    payment_args=dict(payload={'amount':11,'method':'BANK_TRANSFER','reference':'Paid expense GST '+uuid.uuid4().hex,
                        'allocations':[{'billLineId':posted[1]['lines'][0]['id'],'amount':11}]},key='paid-expense-'+uuid.uuid4().hex)
                    paid_expense=request(payment_path,employee,company,base=second,**payment_args)
                    assert paid_expense[0]==201,paid_expense
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(payment_path,employee,company,base=first if n%2 else second,**payment_args),range(6)))
                    assert all(result==paid_expense for result in attempts),attempts
                    supplier_bill_tax(posted[1]['lines'][0]['id'],(1 if recoverable else 0) if cash else expected_gst)
                adjustment_path=detail+'/amount-credits'
                adjustment=dict(payload={'reference':' Amount café '+uuid.uuid4().hex,'reason':' Synthetic price reduction ',
                    'lines':[{'billLineId':posted[1]['lines'][0]['id'],'net':5,**({'tax':.5} if taxed else {}),'description':' Price only '} ]},key='supplier-amount-'+uuid.uuid4().hex)
                for subject in ('test-purchase-reader','test-refund-no-bank'):
                    denied=[request(adjustment_path,token(subject),company,base=target,**adjustment) for target in (first,second)]
                    assert denied[0][0]==denied[1][0]==403 and normalize(denied[0][1])==normalize(denied[1][1]), denied
                for target in (first,second):
                    assert request(adjustment_path,None,company,base=target,**adjustment)[0]==401
                    for change,status in (({'net':None},400),({'tax':None},400),({'net':0,'tax':0},422)):
                        rejected=request(adjustment_path,employee,company,base=target,payload={**adjustment['payload'],
                            'lines':[{**adjustment['payload']['lines'][0],**change}]},key='bad-amount-'+uuid.uuid4().hex)
                        assert rejected[0]==status,rejected
                adjusted=request(adjustment_path,employee,company,base=first,**adjustment)
                assert adjusted[0]==201 and float(adjusted[1]['credit']['gross'])==adjustment_gross,adjusted
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(adjustment_path,employee,company,base=first if n%2 else second,**adjustment),range(6)))
                assert all(result==adjusted for result in attempts),attempts
                adjustment_detail='/api/v1/supplier-credits/'+adjusted[1]['credit']['id']
                assert request(adjustment_detail,employee,company)==request(adjustment_detail,employee,company,base=legacy_url)==(200,adjusted[1])
                remaining=request(detail,employee,company)
                assert remaining==request(detail,employee,company,base=legacy_url) and float(remaining[1]['lines'][0]['outstandingAmount'])==remaining_gross-(11 if taxed else 0),remaining
                assert request(adjustment_path,employee,company,base=second,payload={**adjustment['payload'],'reason':'Changed'},key=adjustment['key'])[0]==409
                supplier_bill_tax(posted[1]['lines'][0]['id'],(1 if recoverable else 0) if cash and taxed else (0 if cash else (1.5 if recoverable else 0)))
                if taxed:
                    reversal_path='/api/v1/supplier-payments/'+paid_expense[1]['payment']['id']+'/reverse'
                    reversal_args=dict(payload={'reference':'Paid expense reversal '+uuid.uuid4().hex,'reason':'Synthetic expense payment correction'},key='paid-expense-reverse-'+uuid.uuid4().hex)
                    reversed_expense=request(reversal_path,employee,company,base=first,**reversal_args)
                    assert reversed_expense[0]==201,reversed_expense
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(reversal_path,employee,company,base=first if n%2 else second,**reversal_args),range(6)))
                    assert all(result==reversed_expense for result in attempts),attempts
                    restored=request(detail,employee,company)
                    assert restored==request(detail,employee,company,base=legacy_url) and float(restored[1]['lines'][0]['outstandingAmount'])==remaining_gross,restored
                    supplier_bill_tax(posted[1]['lines'][0]['id'],0 if cash else (1.5 if recoverable else 0))

                credit_path=path+'/'+posted[1]['bill']['id']+'/credits'
                credit_args=dict(payload={'reference':' Expense café credit '+uuid.uuid4().hex,'reason':' Synthetic expense cancellation ',
                    'lines':[{'billLineId':posted[1]['lines'][0]['id'],'amount':remaining_gross}]},key='expense-credit-'+uuid.uuid4().hex)
                for subject in ('test-purchase-reader','test-refund-no-bank'):
                    denied=[request(credit_path,token(subject),company,base=target,**credit_args) for target in (first,second)]
                    assert denied[0][0]==denied[1][0]==403 and normalize(denied[0][1])==normalize(denied[1][1]), denied
                for target in (first,second):
                    assert request(credit_path,None,company,base=target,**credit_args)[0]==401
                    invalid=dict(payload={**credit_args['payload'],'lines':[{'billLineId':posted[1]['lines'][0]['id'],'amount':None}]},key='null-expense-credit-'+uuid.uuid4().hex)
                    assert request(credit_path,employee,company,base=target,**invalid)[0]==422
                    invalid=dict(payload={**credit_args['payload'],'lines':[{'billLineId':posted[1]['lines'][0]['id'],'amount':21}]},key='over-expense-credit-'+uuid.uuid4().hex)
                    result=request(credit_path,employee,company,base=target,**invalid)
                    assert 400<=result[0]<500, result
                credited=request(credit_path,employee,company,base=second,**credit_args)
                assert credited[0]==201 and credited[1]['credit']['creditType']=='EXPENSE' and float(credited[1]['credit']['gross'])==remaining_gross, credited
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(credit_path,employee,company,base=first if n%2 else second,**credit_args),range(6)))
                assert all(result==credited for result in attempts), attempts
                credit_detail='/api/v1/supplier-credits/'+credited[1]['credit']['id']
                assert request(credit_detail,employee,company)==request(credit_detail,employee,company,base=legacy_url)==(200,credited[1])
                after=request(detail,employee,company)
                assert after==request(detail,employee,company,base=legacy_url)
                assert float(after[1]['lines'][0]['outstandingAmount'])==0, after
                supplier_bill_tax(posted[1]['lines'][0]['id'],0)
                current_stock=request(warehouse_path,employee,company)
                assert current_stock[0]==before_stock[0]==200 and normalize(current_stock[1])==normalize(before_stock[1]), (before_stock,current_stock)
            for first,second,stock_taxable in ((legacy_url,url,False),(url,legacy_url,False),(legacy_url,url,True),(url,legacy_url,True)):
                cash=os.environ.get('HTT_COMPAT_GST_BASIS')=='CASH'
                stock_bill,stock_receipt=supplier_bill_fixture('stock-price-adjust',True,stock_taxable)
                detail='/api/v1/supplier-bills/'+stock_bill['bill']['id']
                adjustment_path=detail+'/amount-credits'
                before_stock=request(warehouse_path,employee,company)
                supplier_bill_tax(stock_bill['lines'][0]['id'],0 if cash or not stock_taxable else 1.5)
                if stock_taxable:
                    payment_path='/api/v1/suppliers/'+supplier+'/payments'
                    pay_args=dict(payload={'amount':5.5,'method':'BANK_TRANSFER','reference':'Stock amount GST '+uuid.uuid4().hex,
                        'allocations':[{'billLineId':stock_bill['lines'][0]['id'],'amount':5.5}]},key='stock-amount-pay-'+uuid.uuid4().hex)
                    paid_stock=request(payment_path,employee,company,base=second,**pay_args)
                    assert paid_stock[0]==201,paid_stock
                    assert request(payment_path,employee,company,base=first,**pay_args)==paid_stock
                    supplier_bill_tax(stock_bill['lines'][0]['id'],.5 if cash else 1.5)
                args=dict(payload={'reference':' Stock amount café '+uuid.uuid4().hex,'reason':' Synthetic price reduction ',
                    'lines':[{'billLineId':stock_bill['lines'][0]['id'],'net':5,'tax':(.5 if stock_taxable else 0),'description':' Price only, no physical return '} ]},key='stock-amount-'+uuid.uuid4().hex)
                adjusted=request(adjustment_path,employee,company,base=first,**args)
                assert adjusted[0]==201 and adjusted[1]['credit']['creditType']=='RECEIPT' and adjusted[1]['credit']['creditMode']=='AMOUNT',adjusted
                assert float(adjusted[1]['credit']['gross'])==(5.5 if stock_taxable else 5) and adjusted[1]['lines'][0]['quantity'] is None,adjusted
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(adjustment_path,employee,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==adjusted for result in attempts),attempts
                credit_detail='/api/v1/supplier-credits/'+adjusted[1]['credit']['id']
                assert request(credit_detail,employee,company)==request(credit_detail,employee,company,base=legacy_url)==(200,adjusted[1])
                after=request(detail,employee,company)
                assert after==request(detail,employee,company,base=legacy_url),after
                line=after[1]['lines'][0]
                assert float(line['quantity'])==1 and float(line['creditedQuantity'])==0 and float(line['creditedAmount'])==(5.5 if stock_taxable else 5) and float(line['outstandingAmount'])==(5.5 if stock_taxable else 10),line
                current_stock=request(warehouse_path,employee,company)
                assert current_stock[0]==before_stock[0]==200 and normalize(current_stock[1])==normalize(before_stock[1]),(before_stock,current_stock)
                invalid={**args['payload'],'lines':[{**args['payload']['lines'][0],'net':11}]}
                rejected=[request(adjustment_path,employee,company,base=target,payload=invalid,key='over-stock-amount-'+uuid.uuid4().hex) for target in (first,second)]
                assert rejected[0][0]==rejected[1][0]==409 and normalize(rejected[0][1])==normalize(rejected[1][1]),rejected
                assert request(detail,employee,company)==after
                if stock_taxable:
                    supplier_bill_tax(stock_bill['lines'][0]['id'],.5 if cash else 1)
                    reversal_path='/api/v1/supplier-payments/'+paid_stock[1]['payment']['id']+'/reverse'
                    reverse_args=dict(payload={'reference':'Stock amount reversal '+uuid.uuid4().hex,'reason':'Synthetic stock amount settlement correction'},key='stock-amount-reverse-'+uuid.uuid4().hex)
                    reversed_stock=request(reversal_path,employee,company,base=first,**reverse_args)
                    assert reversed_stock[0]==201,reversed_stock
                    assert request(reversal_path,employee,company,base=second,**reverse_args)==reversed_stock
                    supplier_bill_tax(stock_bill['lines'][0]['id'],0 if cash else 1)
                    cleanup=dict(payload={'reference':'Stock amount close '+uuid.uuid4().hex,'reason':'Synthetic remaining price credit',
                        'lines':[{'billLineId':stock_bill['lines'][0]['id'],'net':10,'tax':1,'description':'Remaining amount only'}]},key='stock-amount-close-'+uuid.uuid4().hex)
                    closed=request(adjustment_path,employee,company,base=second,**cleanup)
                    assert closed[0]==201 and float(closed[1]['credit']['gross'])==11,closed
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(adjustment_path,employee,company,base=first if n%2 else second,**cleanup),range(6)))
                    assert all(result==closed for result in attempts),attempts
                    supplier_bill_tax(stock_bill['lines'][0]['id'],0)
                    final_bill=request(detail,employee,company)
                    assert final_bill==request(detail,employee,company,base=legacy_url),final_bill
                    final_line=final_bill[1]['lines'][0]
                    assert float(final_line['outstandingAmount'])==0 and float(final_line['creditedQuantity'])==0 and float(final_line['quantity'])==1,final_line
                    final_stock=request(warehouse_path,employee,company)
                    assert normalize(final_stock[1])==normalize(before_stock[1]),(before_stock,final_stock)
            office=token('test-quote-office')
            other_writer=token('test-quote-other')
            box_unit='00000000-0000-0000-0000-000000000184'
            metre_unit='00000000-0000-0000-0000-000000000183'
            box_price=50
            box_price_version=1
            for first,second in ((legacy_url,url),(url,legacy_url)):
                for kind in ('area','override','service'):
                    line=({'productUnitId':'00000000-0000-0000-0000-000000000077','quantity':1,'unitPrice':61.72835} if kind=='service' else
                        {'productUnitId':box_unit,'requestedArea':5,**({'unitPrice':50,'discountPercent':10} if kind=='override' else {})})
                    payload={'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                        'warehouseId':'00000000-0000-0000-0000-000000000014','lines':[line],'notes':' Boundary '+kind+' café '}
                    actor=office if kind in ('override','service') else employee
                    if kind=='area':
                        for invalid_line,status in (({'productUnitId':box_unit,'quantity':1.5},422),
                                ({'productUnitId':metre_unit,'requestedArea':5},422),({'productUnitId':metre_unit,'quantity':1.5},422),
                                ({'productUnitId':box_unit,'quantity':1,'requestedArea':5},422),({'productUnitId':box_unit,'quantity':None},422),
                                ({'productUnitId':None,'quantity':1},400),({'productUnitId':box_unit,'quantity':1,'discountPercent':None},400)):
                            rejected=[request('/api/v1/quotes',employee,company,base=target,payload={**payload,'lines':[invalid_line]},key='invalid-quote-boundary-'+uuid.uuid4().hex) for target in (first,second)]
                            assert rejected[0][0]==rejected[1][0]==status,rejected
                            if status==422: assert normalize(rejected[0][1])==normalize(rejected[1][1]),rejected
                    if kind=='override':
                        for target in (first,second):
                            assert request('/api/v1/quotes',employee,company,base=target,payload=payload,key='no-override-'+uuid.uuid4().hex)[0]==403
                            below=request('/api/v1/quotes',office,company,base=target,payload={**payload,'lines':[{**line,'unitPrice':40,'discountPercent':0}]},key='below-floor-'+uuid.uuid4().hex)
                            assert below[0]==422 and json.loads(below[1])['code']=='price_below_floor',below
                    args=dict(payload=payload,key='boundary-quote-'+uuid.uuid4().hex)
                    draft=request('/api/v1/quotes',actor,company,base=first,**args)
                    assert draft[0]==201,draft
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request('/api/v1/quotes',actor,company,base=first if n%2 else second,**args),range(6)))
                    assert all(result==draft for result in attempts),attempts
                    path='/api/v1/quotes/'+draft[1]['id']
                    view=request(path,employee,company)
                    assert view==request(path,employee,company,base=legacy_url),view
                    snap=view[1]['lines'][0]['snapshot']
                    if kind=='service':
                        assert float(view[1]['net'])==61.73 and float(view[1]['tax'])==6.17 and float(view[1]['gross'])==67.9,view
                    else:
                        assert float(snap['quantity'])==3 and float(snap['baseQuantity'])==6.75 and float(snap['requestedArea'])==5,snap
                        assert float(view[1]['gross'])==(148.5 if kind=='override' else round(box_price*3*1.1,2)),view
                        assert snap['priceSource']==('MANUAL' if kind=='override' else 'STANDARD'),snap
                    for target in (first,second):
                        for endpoint,body,method in ((path,payload,'PUT'),(path+'/submit',{},'POST')):
                            denied=request(endpoint,other_writer,company,base=target,payload=body,method=method,version=1,key='other-owner-'+uuid.uuid4().hex)
                            assert denied[0]==403 and json.loads(denied[1])['message']=='Only the draft owner or office operations may modify this quote.',denied
                    version=1
                    if kind=='area':
                        box_price+=1
                        repriced=request('/api/v1/pricing/standard-prices/00000000-0000-0000-0000-000000000186',office,company,base=first,
                            payload={'productUnitId':box_unit,'amount':box_price,'effectiveFrom':'2026-01-01T00:00:00Z','active':True},method='PUT',version=box_price_version,key='reprice-box-'+uuid.uuid4().hex)
                        assert repriced[0]==200,repriced
                        box_price_version+=1
                        for target in (first,second):
                            rejected=request(path+'/submit',office,company,base=target,payload={},version=1,key='price-changed-'+uuid.uuid4().hex)
                            assert rejected[0]==409 and json.loads(rejected[1])['code']=='price_changed',rejected
                        assert request(path,employee,company)==view
                        refresh=dict(payload=payload,key='refresh-box-'+uuid.uuid4().hex,method='PUT',version=1)
                        updated=request(path,office,company,base=first,**refresh)
                        assert updated[0]==200 and updated[1]['version']==2,updated
                        assert request(path,office,company,base=second,**refresh)==updated
                        version=2
                    submit=dict(payload={},key='boundary-submit-'+uuid.uuid4().hex,version=version)
                    submitted=request(path+'/submit',office,company,base=second,**submit)
                    assert submitted[0]==200 and submitted[1]['version']==version+1,submitted
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(path+'/submit',office,company,base=first if n%2 else second,**submit),range(6)))
                    assert all(result==submitted for result in attempts),attempts
                    final=request(path,employee,company)
                    assert final==request(path,employee,company,base=legacy_url) and final[1]['status']=='SUBMITTED',final
            direct_credit='/api/v1/customers/00000000-0000-0000-0000-000000000011/credit'
            for first,second in ((legacy_url,url),(url,legacy_url)):
                body={'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                    'warehouseId':'00000000-0000-0000-0000-000000000014','reason':' Synthetic aggregate direct café '+uuid.uuid4().hex+' ',
                    'notes':' Synthetic order notes ','lines':[{'productUnitId':unit_id,'quantity':1},{'productUnitId':unit_id,'quantity':2}]}
                args=dict(payload=body,key='aggregate-direct-'+uuid.uuid4().hex)
                denied=[request('/api/v1/sales-orders',other_writer,company,base=target,**args) for target in (first,second)]
                assert denied[0][0]==denied[1][0]==403 and normalize(denied[0][1])==normalize(denied[1][1]),denied
                before_stock=request(warehouse_path,employee,company)
                before_credit=request(direct_credit,employee,company)
                for target in (first,second):
                    assert request('/api/v1/sales-orders',None,company,base=target,**args)[0]==401
                    for qty,code in ((1500,'insufficient_stock'),(3000,'credit_limit_exceeded')):
                        invalid={**body,'lines':[{'productUnitId':unit_id,'quantity':qty}]}
                        rejected=request('/api/v1/sales-orders',employee,company,base=target,payload=invalid,key='rejected-direct-'+uuid.uuid4().hex)
                        assert rejected[0]==409 and json.loads(rejected[1])['code']==code,rejected
                    invalid={**body,'lines':[{'productUnitId':unit_id,'quantity':0}]}
                    assert request('/api/v1/sales-orders',employee,company,base=target,payload=invalid,key='zero-direct-'+uuid.uuid4().hex)[0]==422
                assert normalize(request(warehouse_path,employee,company)[1])==normalize(before_stock[1])
                assert request(direct_credit,employee,company)==before_credit
                created=request('/api/v1/sales-orders',employee,company,base=first,**args)
                assert created[0]==201 and created[1]['orderOrigin']=='DIRECT' and created[1]['sourceQuoteId'] is None,created
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request('/api/v1/sales-orders',employee,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==created for result in attempts),attempts
                detail='/api/v1/sales-orders/'+created[1]['orderId']
                view=request(detail,employee,company)
                assert view==request(detail,employee,company,base=legacy_url),view
                assert len(view[1]['lines'])==2 and float(view[1]['gross'])==135,view
                assert float(request(warehouse_path,employee,company)[1]['items'][0]['reserved'])==float(before_stock[1]['items'][0]['reserved'])+3
                assert float(request(direct_credit,employee,company)[1]['unbilledOrders'])==float(before_credit[1]['unbilledOrders'])+135
                assert request('/api/v1/sales-orders',employee,company,base=second,payload={**body,'reason':'Changed'},key=args['key'])[0]==409
                cancel=dict(payload={'reason':'Synthetic aggregate cleanup'},key='aggregate-direct-cancel-'+uuid.uuid4().hex,version=created[1]['version'])
                canceled=request(detail+'/cancel',employee,company,base=second,**cancel)
                assert canceled[0]==200,canceled
                assert request(detail+'/cancel',employee,company,base=first,**cancel)==canceled
                assert normalize(request(warehouse_path,employee,company)[1])==normalize(before_stock[1])
                assert request(direct_credit,employee,company)==before_credit
            standard_version=1
            standard_amount=50
            for first,second in ((legacy_url,url),(url,legacy_url)):
                before_stock=request(warehouse_path,employee,company)
                before_credit=request(direct_credit,employee,company)
                draft_args=dict(payload={'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                    'warehouseId':'00000000-0000-0000-0000-000000000014','lines':[{'productUnitId':unit_id,'quantity':1},{'productUnitId':unit_id,'quantity':2}],
                    'notes':'Conversion fixture café '+uuid.uuid4().hex},key='conversion-quote-'+uuid.uuid4().hex)
                draft=request('/api/v1/quotes',employee,company,base=first,**draft_args)
                assert draft[0]==201,draft
                quote_path='/api/v1/quotes/'+draft[1]['id']
                isolated_quote_fixture('gaps',draft[1]['id'])
                submitted=request(quote_path+'/submit',employee,company,base=second,payload={},key='conversion-submit-'+uuid.uuid4().hex,version=1)
                assert submitted[0]==200 and submitted[1]['version']==2,submitted
                frozen=request(quote_path,employee,company)
                assert frozen==request(quote_path,employee,company,base=legacy_url),frozen
                standard_amount+=1
                price_changed=request('/api/v1/pricing/standard-prices/00000000-0000-0000-0000-000000000025',office,company,base=first,
                    payload={'productUnitId':unit_id,'amount':standard_amount,'effectiveFrom':'2026-01-01T00:00:00Z','active':True},method='PUT',version=standard_version,key='conversion-price-'+uuid.uuid4().hex)
                assert price_changed[0]==200,price_changed
                standard_version+=1
                path=quote_path+'/approve-and-convert'
                args=dict(payload={'reason':' Synthetic frozen approval café '},key='convert-'+uuid.uuid4().hex,version=2)
                for target in (first,second):
                    assert request(path,None,company,base=target,**args)[0]==401
                    assert request(path,token('test-purchase-reader'),company,base=target,**args)[0]==403
                    assert request(path,employee,company,base=target,**{k:v for k,v in args.items() if k!='version'})[0]==428
                converted=request(path,employee,company,base=first,**args)
                assert converted[0]==201 and converted[1]['sourceQuoteId']==draft[1]['id'] and converted[1]['alreadyConverted'] is False,converted
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,employee,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==converted for result in attempts),attempts
                detail='/api/v1/sales-orders/'+converted[1]['orderId']
                order_view=request(detail,employee,company)
                assert order_view==request(detail,employee,company,base=legacy_url),order_view
                assert order_view[1]['orderOrigin']=='QUOTE' and order_view[1]['sourceQuoteId']==draft[1]['id'],order_view
                assert order_view[1]['gross']==frozen[1]['gross'] and order_view[1]['customer']==frozen[1]['customer'],(frozen,order_view)
                assert [line['snapshot'] for line in order_view[1]['lines']]==[line['snapshot'] for line in frozen[1]['lines']],(frozen,order_view)
                assert [line['lineNo'] for line in order_view[1]['lines']]==[10,20],order_view
                assert float(request(warehouse_path,employee,company)[1]['items'][0]['reserved'])==float(before_stock[1]['items'][0]['reserved'])+3
                assert round(float(request(direct_credit,employee,company)[1]['unbilledOrders'])-float(before_credit[1]['unbilledOrders']),2)==float(frozen[1]['gross'])
                already=request(path,employee,company,base=second,**{**args,'key':'already-convert-'+uuid.uuid4().hex})
                assert already[0]==200 and already[1]['alreadyConverted'] is True and already[1]['orderId']==converted[1]['orderId'],already
                for target in (first,second):
                    rejected=request(path,employee,company,base=target,**{**args,'key':'wrong-convert-version-'+uuid.uuid4().hex,'version':1})
                    assert rejected[0]==409 and json.loads(rejected[1])['code']=='version_conflict',rejected
                canceled=request(detail+'/cancel',employee,company,base=second,payload={'reason':'Conversion cleanup'},key='convert-cancel-'+uuid.uuid4().hex,version=converted[1]['version'])
                assert canceled[0]==200,canceled
                assert normalize(request(warehouse_path,employee,company)[1])==normalize(before_stock[1])
                assert request(direct_credit,employee,company)==before_credit
            floor_version=1
            for first,second in ((legacy_url,url),(url,legacy_url)):
                for failure in ('expired','product','floor','stock','credit'):
                    line={'productUnitId':box_unit if failure in ('product','floor') else unit_id,'quantity':1500 if failure=='stock' else 3000 if failure=='credit' else 1}
                    body={'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                        'warehouseId':'00000000-0000-0000-0000-000000000014','lines':[line],
                        'notes':'Failure conversion fixture '+failure+' '+uuid.uuid4().hex}
                    if failure=='expired':
                        isolated_quote_fixture('west')
                        body['expiresOn']=datetime.datetime.now(ZoneInfo('Etc/GMT+12')).date().isoformat()
                    try:
                        draft=request('/api/v1/quotes',employee,company,base=first,payload=body,key='failure-convert-quote-'+uuid.uuid4().hex)
                        assert draft[0]==201,draft
                        quote_path='/api/v1/quotes/'+draft[1]['id']
                        submitted=request(quote_path+'/submit',employee,company,base=second,payload={},version=1,key='failure-convert-submit-'+uuid.uuid4().hex)
                        assert submitted[0]==200 and submitted[1]['version']==2,submitted
                    finally:
                        if failure=='expired':isolated_quote_fixture('restore-timezone')
                    if failure=='product':isolated_quote_fixture('unit-change')
                    if failure=='floor':
                        changed=request('/api/v1/pricing/floors/00000000-0000-0000-0000-000000000187',office,company,base=first,
                            payload={'productUnitId':box_unit,'amount':60,'active':True},method='PUT',version=floor_version,key='raise-floor-'+uuid.uuid4().hex)
                        assert changed[0]==200,changed
                        floor_version+=1
                    before_quote=request(quote_path,employee,company)
                    before_stock=request(warehouse_path,employee,company)
                    before_credit=request(direct_credit,employee,company)
                    code={'expired':'quote_expired','product':'product_changed','floor':'price_below_floor','stock':'insufficient_stock','credit':'credit_limit_exceeded'}[failure]
                    try:
                        failures=[request(quote_path+'/approve-and-convert',employee,company,base=target,payload={'reason':'Synthetic failing approval'},version=2,key='failure-convert-'+uuid.uuid4().hex) for target in (first,second)]
                        assert failures[0][0]==failures[1][0]==409 and all(json.loads(result[1])['code']==code for result in failures),failures
                        assert normalize(failures[0][1])==normalize(failures[1][1]),failures
                        assert request(quote_path,employee,company)==before_quote
                        assert normalize(request(warehouse_path,employee,company)[1])==normalize(before_stock[1])
                        assert request(direct_credit,employee,company)==before_credit
                    finally:
                        if failure=='product':isolated_quote_fixture('unit-restore')
                        if failure=='floor':
                            restored=request('/api/v1/pricing/floors/00000000-0000-0000-0000-000000000187',office,company,base=second,
                                payload={'productUnitId':box_unit,'amount':45,'active':True},method='PUT',version=floor_version,key='restore-floor-'+uuid.uuid4().hex)
                            assert restored[0]==200,restored
                            floor_version+=1
                    returned=request(quote_path+'/return-to-draft',employee,company,base=second,payload={'reason':'Synthetic failure cleanup'},version=2,key='failure-return-'+uuid.uuid4().hex)
                    assert returned[0]==200 and returned[1]['status']=='DRAFT',returned
            print('PASS: quote conversion expiry/product/floor/stock/credit rejection preserves quote, approval and resources')
            print('PASS: quote approval conversion, frozen prices after repricing, single approval/order/reservation and mixed replay')
            for first,second,rule_unit,other_unit in ((legacy_url,url,unit_id,'00000000-0000-0000-0000-000000000077'),(url,legacy_url,'00000000-0000-0000-0000-000000000077',unit_id)):
                for family in ('standard-prices','floors'):
                    path='/api/v1/pricing/'+family
                    body={'productUnitId':rule_unit,'amount':'50.00' if family=='standard-prices' else '10.00'}
                    if family=='standard-prices':body.update(effectiveFrom='2026-01-01T10:00:00.1234567+10:00',active=False)
                    args=dict(payload=body,key='pricing-create-'+uuid.uuid4().hex)
                    for target in (first,second):
                        assert request(path,None,company,base=target,**args)[0]==401
                        assert request(path,employee,company,base=target,**args)[0]==403
                        for change,status in (({'amount':None},400),({'active':None},400),({'productUnitId':None},400),({'amount':-1},422)):
                            rejected=request(path,office,company,base=target,payload={**body,**change},key='invalid-pricing-'+uuid.uuid4().hex)
                            assert rejected[0]==status,rejected
                        rejected=request(path,office,company,base=target,payload={k:v for k,v in body.items() if k!='amount'},key='missing-pricing-amount-'+uuid.uuid4().hex)
                        assert rejected[0]==400,rejected
                    posted=request(path,office,company,base=first,**args)
                    assert posted[0]==201 and posted[1]['version']==1,posted
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(path,office,company,base=first if n%2 else second,**args),range(6)))
                    assert all(result==posted for result in attempts),attempts
                    if family=='standard-prices':
                        equivalent={**body,'effectiveFrom':'2026-01-01T00:00:00.1234567Z'}
                        assert request(path,office,company,base=second,payload=equivalent,key=args['key'])==posted
                    detail=path+'/'+posted[1]['id']
                    view=request(detail,office,company)
                    assert view==request(detail,office,company,base=legacy_url),view
                    if family=='standard-prices':assert view[1]['effectiveFrom']=='2026-01-01T00:00:00.123456Z',view
                    else:assert view[1]['active'] is True,view
                    updated_body={**body,'amount':'51.00' if family=='standard-prices' else '11.00','active':False}
                    update=dict(payload=updated_body,key='pricing-update-'+uuid.uuid4().hex,version=1,method='PUT')
                    for target in (first,second):
                        missing=request(detail,office,company,base=target,**{k:v for k,v in update.items() if k!='version'})
                        assert missing[0]==428 and json.loads(missing[1])['message']=='Supply If-Match with a positive current version.',missing
                    changed=request(detail,office,company,base=second,**update)
                    assert changed[0]==200 and changed[1]['version']==2,changed
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(detail,office,company,base=first if n%2 else second,**update),range(6)))
                    assert all(result==changed for result in attempts),attempts
                    for target in (first,second):
                        stale=request(detail,office,company,base=target,**{**update,'key':'stale-price-'+uuid.uuid4().hex})
                        assert stale[0]==409,stale
                        immutable=request(detail,office,company,base=target,**{**update,'version':2,'key':'immutable-price-'+uuid.uuid4().hex,'payload':{**updated_body,'productUnitId':other_unit}})
                        assert immutable[0]==422 and 'product_unit_id' in json.loads(immutable[1])['fieldErrors'],immutable
                    final=request(detail,office,company)
                    assert final==request(detail,office,company,base=legacy_url) and final[1]['active'] is False and final[1]['version']==2,final
                    listed=request(path+'?pageSize=100',office,company)
                    assert listed==request(path+'?pageSize=100',office,company,base=legacy_url) and posted[1]['id'] in [item['id'] for item in listed[1]['items']],listed
            price_lists=request('/api/v1/pricing/price-lists',office,company)
            assert price_lists==request('/api/v1/pricing/price-lists',office,company,base=legacy_url) and price_lists[0]==200,price_lists
            pricing_scoped=token('test-pricing-scoped')
            for first,second,rule_unit,other_unit in ((legacy_url,url,unit_id,'00000000-0000-0000-0000-000000000077'),(url,legacy_url,'00000000-0000-0000-0000-000000000077',unit_id)):
                path='/api/v1/pricing/customer-prices'
                body={'customerId':'00000000-0000-0000-0000-000000000072','productUnitId':rule_unit,'method':'FIXED_PRICE','fixedPrice':'12.34',
                    'effectiveFrom':'2026-01-01T10:00:00.1234567+10:00','active':False}
                args=dict(payload=body,key='customer-price-create-'+uuid.uuid4().hex)
                for target in (first,second):
                    assert request(path,None,company,base=target,**args)[0]==401
                    assert request(path,employee,company,base=target,**args)[0]==403
                    assert request(path,pricing_scoped,company,base=target,**args)[0]==404
                    for change,status in (({'method':'fixed_price'},422),({'fixedPrice':None},422),({'fixedPrice':-1},422),
                            ({'discountPercent':1},422),({'method':'DISCOUNT_PERCENT','fixedPrice':None,'discountPercent':'100.000001'},422),
                            ({'customerId':None},400),({'active':None},400),({'effectiveFrom':None},400)):
                        rejected=request(path,office,company,base=target,payload={**body,**change},key='bad-customer-price-'+uuid.uuid4().hex)
                        assert rejected[0]==status,rejected
                created=request(path,office,company,base=first,**args)
                assert created[0]==201 and created[1]['version']==1,created
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,office,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==created for result in attempts),attempts
                detail=path+'/'+created[1]['id']
                view=request(detail,office,company)
                assert view==request(detail,office,company,base=legacy_url),view
                assert view[1]['fixedPrice']=='12.34000000' and view[1]['discountPercent'] is None and view[1]['effectiveFrom']=='2026-01-01T00:00:00.123456Z',view
                for target in (first,second):assert request(detail,pricing_scoped,company,base=target)[0]==404
                changed_body={**body,'method':'DISCOUNT_PERCENT','fixedPrice':None,'discountPercent':'12.345678'}
                update=dict(payload=changed_body,key='customer-price-update-'+uuid.uuid4().hex,version=1,method='PUT')
                changed=request(detail,office,company,base=second,**update)
                assert changed[0]==200 and changed[1]['version']==2,changed
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(detail,office,company,base=first if n%2 else second,**update),range(6)))
                assert all(result==changed for result in attempts),attempts
                for target in (first,second):
                    assert request(detail,pricing_scoped,company,base=target,**update)[0]==404
                    assert request(detail,office,company,base=target,**{**update,'key':'stale-customer-price-'+uuid.uuid4().hex})[0]==409
                    immutable=request(detail,office,company,base=target,**{**update,'version':2,'key':'unit-customer-price-'+uuid.uuid4().hex,'payload':{**changed_body,'productUnitId':other_unit}})
                    assert immutable[0]==422 and 'product_unit_id' in json.loads(immutable[1])['fieldErrors'],immutable
                    wrong_customer=request(detail,office,company,base=target,**{**update,'version':2,'key':'owner-customer-price-'+uuid.uuid4().hex,'payload':{**changed_body,'customerId':'00000000-0000-0000-0000-000000000011'}})
                    assert wrong_customer[0]==404,wrong_customer
                final=request(detail,office,company)
                assert final==request(detail,office,company,base=legacy_url) and final[1]['method']=='DISCOUNT_PERCENT' and final[1]['fixedPrice'] is None and final[1]['discountPercent']=='12.345678',final
                listed=request(path+'?pageSize=100',pricing_scoped,company)
                assert listed==request(path+'?pageSize=100',pricing_scoped,company,base=legacy_url),listed
                assert all(row['customerId']=='00000000-0000-0000-0000-000000000011' for row in listed[1]['items']) and listed[1]['items'],listed
                assert request(path+'/00000000-0000-0000-0000-000000000026',pricing_scoped,company)==request(path+'/00000000-0000-0000-0000-000000000026',pricing_scoped,company,base=legacy_url)
            promo_items=[{'productUnitId':unit_id,'amount':'20.00'},{'productUnitId':'00000000-0000-0000-0000-000000000077','amount':'30.00'}]
            for first,second in ((legacy_url,url),(url,legacy_url)):
                path='/api/v1/pricing/promotions'
                body={'name':' Promotion fixture café & + "two" '+uuid.uuid4().hex+' ',
                    'startsAt':'2026-01-01T10:00:00.1234567+10:00','endsAt':'2030-01-01T00:00:00Z','items':promo_items}
                args=dict(payload=body,key='promotion-create-'+uuid.uuid4().hex)
                before_resolve={}
                for item in promo_items:
                    resolve='/api/v1/pricing/resolve?customerId=00000000-0000-0000-0000-000000000011&productUnitId='+item['productUnitId']
                    before_resolve[item['productUnitId']]=normalize(request(resolve,employee,company)[1])
                for target in (first,second):
                    assert request(path,None,company,base=target,**args)[0]==401
                    assert request(path,employee,company,base=target,**args)[0]==403
                    for change,status in (({'items':[]},422),({'items':None},422),({'items':[promo_items[0],promo_items[0]]},422),
                            ({'items':[{'productUnitId':unit_id}]},400),({'items':[{'productUnitId':unit_id,'amount':None}]},400),
                            ({'items':[{'productUnitId':None,'amount':20}]},400),({'items':[{'productUnitId':unit_id,'amount':-1}]},422),
                            ({'active':None},400),({'endsAt':'2025-01-01T00:00:00Z'},422),({'name':' '},422)):
                        rejected=request(path,office,company,base=target,payload={**body,**change},key='bad-promotion-'+uuid.uuid4().hex)
                        assert rejected[0]==status,rejected
                created=request(path,office,company,base=first,**args)
                assert created[0]==201 and created[1]['version']==1,created
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,office,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==created for result in attempts),attempts
                assert request(path,office,company,base=second,payload={**body,'items':list(reversed(promo_items))},key=args['key'])==created
                detail=path+'/'+created[1]['id']
                view=request(detail,office,company)
                assert view==request(detail,office,company,base=legacy_url),view
                assert view[1]['promotion']['name']==body['name'].strip() and view[1]['promotion']['active'] is True and len(view[1]['items'])==2,view
                assert all(item['active'] is True and item['version']==1 for item in view[1]['items']),view
                for item in promo_items:
                    resolve='/api/v1/pricing/resolve?customerId=00000000-0000-0000-0000-000000000011&productUnitId='+item['productUnitId']
                    price=request(resolve,employee,company)
                    assert price[0]==200 and normalize(price[1])==normalize(request(resolve,employee,company,base=legacy_url)[1]),price
                    assert price[1]['source']=='PROMOTION' and price[1]['ruleId']==created[1]['id'] and float(price[1]['unitPrice'])==float(item['amount']),price
                update=dict(payload={**body,'name':'Closed promotion fixture café '+uuid.uuid4().hex,'active':False,'items':[]},key='promotion-update-'+uuid.uuid4().hex,version=1,method='PUT')
                changed=request(detail,office,company,base=second,**update)
                assert changed[0]==200 and changed[1]['version']==2,changed
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(detail,office,company,base=first if n%2 else second,**update),range(6)))
                assert all(result==changed for result in attempts),attempts
                final=request(detail,office,company)
                assert final==request(detail,office,company,base=legacy_url) and final[1]['promotion']['active'] is False,final
                assert [item['id'] for item in final[1]['items']]==[item['id'] for item in view[1]['items']],final
                assert all(item['active'] is False and item['version']==2 for item in final[1]['items']),final
                for target in (first,second):
                    stale=request(detail,office,company,base=target,**{**update,'key':'stale-promotion-'+uuid.uuid4().hex})
                    assert stale[0]==409,stale
                for item in promo_items:
                    resolve='/api/v1/pricing/resolve?customerId=00000000-0000-0000-0000-000000000011&productUnitId='+item['productUnitId']
                    assert normalize(request(resolve,employee,company)[1])==before_resolve[item['productUnitId']]
                listed=request(path+'?pageSize=100',office,company)
                assert listed==request(path+'?pageSize=100',office,company,base=legacy_url) and created[1]['id'] in [item['id'] for item in listed[1]['items']],listed
            for lookup in ('uoms','product-categories','regions'):
                path='/api/v1/'+lookup
                for first,second in ((legacy_url,url),(url,legacy_url)):
                    body={'code':'\u00a0 lk_'+uuid.uuid4().hex[:16]+'\u0085','name':'\u0085 Lookup café + "fixture" \u00a0'}
                    args=dict(payload=body,key='lookup-create-'+uuid.uuid4().hex)
                    for target in (first,second):
                        assert request(path,pricing_scoped,company,base=target,**args)[0]==403
                        for change,status in (({'code':'!'},422),({'code':'ß'},422),({'code':'ı'},422),({'code':'ﬀ'},422),({'code':'\u001cabc'},422),({'code':''},422),({'name':' '},422),({'name':'x'*201},422),({'active':None},400)):
                            bad=request(path,office,company,base=target,payload={**body,**change},key='lookup-bad-'+uuid.uuid4().hex)
                            assert bad[0]==status,bad
                    created=request(path,office,company,base=first,**args)
                    assert created[0]==201 and created[1]['version']==1,created
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(path,office,company,base=first if n%2 else second,**args),range(6)))
                    assert all(result==created for result in attempts),attempts
                    detail=path+'/'+created[1]['id']
                    view=request(detail,office,company)
                    assert view==request(detail,office,company,base=legacy_url) and view[1]['active'] is True,view
                    assert view[1]['code']==body['code'].strip().upper() and view[1]['name']==body['name'].strip(),view
                    canonical={**body,'code':body['code'].strip().upper(),'name':body['name'].strip(),'active':True}
                    assert request(path,office,company,base=second,**{**args,'payload':canonical})==created
                    changed_body={**canonical,'name':'Closed lookup fixture '+lookup+' '+uuid.uuid4().hex,'active':False}
                    update=dict(payload=changed_body,key='lookup-update-'+uuid.uuid4().hex,version=1,method='PUT')
                    changed=request(detail,office,company,base=second,**update)
                    assert changed[0]==200 and changed[1]['version']==2,changed
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(detail,office,company,base=first if n%2 else second,**update),range(6)))
                    assert all(result==changed for result in attempts),attempts
                    final=request(detail,office,company)
                    assert final==request(detail,office,company,base=legacy_url) and final[1]['active'] is False and final[1]['version']==2,final
                    for target in (first,second):
                        for version,status in ((None,428),(1,409)):
                            bad=request(detail,office,company,base=target,**{**update,'version':version,'key':'lookup-version-'+uuid.uuid4().hex})
                            assert bad[0]==status,bad
                        missing=request(path+'/'+str(uuid.uuid4()),office,company,base=target)
                        assert missing[0]==404,missing
                    listing=request(path+'?pageSize=100',office,company)
                    assert listing==request(path+'?pageSize=100',office,company,base=legacy_url),listing
                    assert created[1]['id'] in [item['id'] for item in listing[1]['items']],listing
            for target in (url,legacy_url):
                used=request('/api/v1/uoms/00000000-0000-0000-0000-000000000015',office,company,base=target,
                    payload={'code':'EA','name':'Each','active':False},key='used-uom-'+uuid.uuid4().hex,version=1,method='PUT')
                assert used[0]==409 and json.loads(used[1])['code']=='unit_in_use',used
            warehouse_scoped=token('test-warehouse-scoped')
            for first,second in ((legacy_url,url),(url,legacy_url)):
                path='/api/v1/warehouses'
                body={'code':' wh_'+uuid.uuid4().hex[:16]+' ','name':' Warehouse café & test ','regionId':'00000000-0000-0000-0000-000000000215'}
                args=dict(payload=body,key='warehouse-create-'+uuid.uuid4().hex)
                for target in (first,second):
                    assert request(path,warehouse_scoped,company,base=target,**args)[0]==403
                    for change,status in (({'regionId':'00000000-0000-0000-0000-000000000216'},404),({'kind':'sellable'},422),({'active':None},400),({'name':' '},422)):
                        bad=request(path,office,company,base=target,payload={**body,**change},key='warehouse-bad-'+uuid.uuid4().hex)
                        assert bad[0]==status,bad
                created=request(path,office,company,base=first,**args)
                assert created[0]==201 and created[1]['version']==1,created
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,office,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==created for result in attempts),attempts
                detail=path+'/'+created[1]['id'];view=request(detail,office,company)
                assert view==request(detail,office,company,base=legacy_url) and view[1]['kind']=='SELLABLE' and view[1]['active'] is True,view
                for target in (first,second):
                    assert request(detail,warehouse_scoped,company,base=target)[0]==404
                    assert request(detail,warehouse_scoped,company,base=target,payload=body,key='warehouse-hidden-'+uuid.uuid4().hex,method='PUT')[0]==404
                    invalid=request(detail,office,company,base=target,payload={**body,'kind':'TRANSIT'},key='warehouse-kind-'+uuid.uuid4().hex,version=1,method='PUT')
                    assert invalid[0]==422,invalid
                changed_body={**body,'name':'Closed warehouse fixture '+uuid.uuid4().hex,'active':False,'regionId':None}
                update=dict(payload=changed_body,key='warehouse-update-'+uuid.uuid4().hex,version=1,method='PUT')
                changed=request(detail,office,company,base=second,**update)
                assert changed[0]==200 and changed[1]['version']==2,changed
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(detail,office,company,base=first if n%2 else second,**update),range(6)))
                assert all(result==changed for result in attempts),attempts
                final=request(detail,office,company)
                assert final==request(detail,office,company,base=legacy_url) and final[1]['regionId'] is None and final[1]['active'] is False,final
                for target in (first,second):
                    assert request(detail,office,company,base=target,**{**update,'key':'warehouse-stale-'+uuid.uuid4().hex})[0]==409
                assert request(path+'?pageSize=100',office,company)==request(path+'?pageSize=100',office,company,base=legacy_url)
            assigned='/api/v1/warehouses/00000000-0000-0000-0000-000000000220'
            assigned_update=dict(payload={'code':'CATALOG_SCOPE_TEST','name':'Assigned warehouse updated'},key='warehouse-assigned-'+uuid.uuid4().hex,version=1,method='PUT')
            changed=request(assigned,warehouse_scoped,company,**assigned_update)
            assert changed[0]==200 and request(assigned,warehouse_scoped,company,base=legacy_url,**assigned_update)==changed,changed
            listed=request('/api/v1/warehouses?pageSize=100',warehouse_scoped,company)
            assert listed==request('/api/v1/warehouses?pageSize=100',warehouse_scoped,company,base=legacy_url) and [item['id'] for item in listed[1]['items']]==['00000000-0000-0000-0000-000000000220'],listed
            for first,second in ((legacy_url,url),(url,legacy_url)):
                product_body={'sku':'MAINT_'+uuid.uuid4().hex[:12],'name':'Synthetic maintenance product','baseUomId':'00000000-0000-0000-0000-000000000015','taxCodeId':'00000000-0000-0000-0000-000000000016','wholePacks':True,'units':[{'uomId':'00000000-0000-0000-0000-000000000015','conversionToBase':1}]}
                created=request('/api/v1/products',employee,company,base=first,payload=product_body,key='maint-product-'+uuid.uuid4().hex)
                assert created[0]==201,created
                detail='/api/v1/products/'+created[1]['id']
                assert request(detail,office,company)==request(detail,office,company,base=legacy_url)
                body={'sku':' '+product_body['sku'].lower()+' ','name':' Closed product fixture '+uuid.uuid4().hex+' ','taxCodeId':product_body['taxCodeId'],'categoryId':'00000000-0000-0000-0000-000000000217','itemType':'SERVICE','status':'INACTIVE','reorderPoint':'12.345678'}
                update=dict(payload=body,key='maint-product-update-'+uuid.uuid4().hex,version=1,method='PUT')
                for target in (first,second):
                    assert request(detail,warehouse_scoped,company,base=target,**update)[0]==403
                    for change,status in (({'categoryId':'00000000-0000-0000-0000-000000000218'},404),({'itemType':'service'},422),({'taxCodeId':None},400),({'reorderPoint':'0.0000001'},422),({'reorderPoint':-1},422)):
                        bad=request(detail,office,company,base=target,**{**update,'payload':{**body,**change},'key':'maint-product-bad-'+uuid.uuid4().hex})
                        assert bad[0]==status,bad
                changed=request(detail,office,company,base=second,**update)
                assert changed[0]==200 and changed[1]['version']==2,changed
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(detail,office,company,base=first if n%2 else second,**update),range(6)))
                assert all(result==changed for result in attempts),attempts
                final=request(detail,office,company)
                assert final==request(detail,office,company,base=legacy_url) and final[1]['reorderPoint']=='12.345678' and final[1]['itemType']=='SERVICE' and final[1]['wholePacks'] is True and final[1]['buyEnabled'] is True and final[1]['sellEnabled'] is True,final
                unitpath=detail+'/units';unitbody={'uomId':'00000000-0000-0000-0000-000000000219','conversionToBase':'2.500000','quantityStep':'0.250000'}
                args=dict(payload=unitbody,key='maint-unit-'+uuid.uuid4().hex)
                for target in (first,second):
                    for change,status in (({'uomId':'00000000-0000-0000-0000-000000000225','active':False},404),({'conversionToBase':0},422),({'quantityStep':0},422),({'quantityStep':'0.0000001'},422),({'uomId':None},400)):
                        bad=request(unitpath,office,company,base=target,payload={**unitbody,**change},key='maint-unit-bad-'+uuid.uuid4().hex)
                        assert bad[0]==status,bad
                unit=request(unitpath,office,company,base=first,**args)
                assert unit[0]==201,unit
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(unitpath,office,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==unit for result in attempts),attempts
                unitdetail=unitpath+'/'+unit[1]['id'];changedbody={**unitbody,'conversionToBase':'3.000000','quantityStep':'0.500000','active':False}
                update=dict(payload=changedbody,key='maint-unit-update-'+uuid.uuid4().hex,version=1,method='PUT')
                for target in (first,second):
                    bad=request(unitdetail,office,company,base=target,**{**update,'payload':{**changedbody,'uomId':product_body['baseUomId']},'key':'maint-unit-identity-'+uuid.uuid4().hex})
                    assert bad[0]==422,bad
                    priced_units=request('/api/v1/products/00000000-0000-0000-0000-000000000182/units',office,company,base=target)
                    assert priced_units[0]==200,priced_units
                    priced_version=next(item['version'] for item in priced_units[1] if item['id']=='00000000-0000-0000-0000-000000000184')
                    frozen=request('/api/v1/products/00000000-0000-0000-0000-000000000182/units/00000000-0000-0000-0000-000000000184',office,company,base=target,payload={'uomId':'00000000-0000-0000-0000-000000000181','conversionToBase':'2.5','quantityStep':1},key='maint-priced-unit-'+uuid.uuid4().hex,version=priced_version,method='PUT')
                    assert frozen[0]==409 and json.loads(frozen[1])['code']=='unit_in_use',frozen
                    hidden=request(unitpath+'/00000000-0000-0000-0000-000000000184',office,company,base=target,**{**update,'key':'maint-other-product-'+uuid.uuid4().hex})
                    assert hidden[0]==404,hidden
                changed=request(unitdetail,office,company,base=second,**update)
                assert changed[0]==200 and changed[1]['version']==2,changed
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(unitdetail,office,company,base=first if n%2 else second,**update),range(6)))
                assert all(result==changed for result in attempts),attempts
            crm_office=token('test-crm-office');crm_limited=token('test-crm-limited');supplier_only=token('test-supplier-only');crm_scoped=token('test-crm-scoped')
            for first,second in ((legacy_url,url),(url,legacy_url)):
                body={'code':' su_'+uuid.uuid4().hex[:12]+' ','legalName':' Supplier café + fixture ','abn':'51 824 753 556'}
                path='/api/v1/suppliers';args=dict(payload=body,key='supplier-create-'+uuid.uuid4().hex)
                for target in (first,second):
                    assert request(path,crm_limited,company,base=target,**args)[0]==403
                    for change in ({'paymentTermsDays':-1},{'paymentTermsDays':366},{'status':'active'},{'abn':'123'},{'legalName':' '}):
                        bad=request(path,crm_office,company,base=target,payload={**body,**change},key='supplier-bad-'+uuid.uuid4().hex)
                        assert bad[0]==422,bad
                created=request(path,crm_office,company,base=first,**args)
                assert created[0]==201 and created[1]['version']==1,created
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,crm_office,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==created for result in attempts),attempts
                assert request(path,crm_office,company,base=second,**{**args,'payload':{**body,'paymentTermsDays':None,'status':'ACTIVE'}})==created
                detail=path+'/'+created[1]['id'];view=request(detail,crm_office,company)
                assert view==request(detail,crm_office,company,base=legacy_url) and view[1]['paymentTermsDays']==30 and view[1]['abn']=='51824753556',view
                for target in (first,second):
                    conflict=request(path,crm_office,company,base=target,**{**args,'payload':{**body,'paymentTermsDays':30}})
                    assert conflict[0]==409,conflict
                changed_body={**body,'legalName':'Closed supplier fixture '+uuid.uuid4().hex,'abn':None,'status':'INACTIVE'}
                update=dict(payload=changed_body,key='supplier-update-'+uuid.uuid4().hex,version=1,method='PUT')
                changed=request(detail,crm_office,company,base=second,**update)
                assert changed[0]==200 and changed[1]['version']==2,changed
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(detail,crm_office,company,base=first if n%2 else second,**update),range(6)))
                assert all(result==changed for result in attempts),attempts
                final=request(detail,crm_office,company)
                assert final==request(detail,crm_office,company,base=legacy_url) and final[1]['status']=='INACTIVE' and final[1]['abn'] is None and final[1]['paymentTermsDays']==30,final
                assert request(path+'?pageSize=100',crm_office,company)==request(path+'?pageSize=100',crm_office,company,base=legacy_url)
                for target in (first,second):
                    assert request(detail,crm_office,company,base=target,**{**update,'key':'supplier-stale-'+uuid.uuid4().hex})[0]==409
                draft={'code':'CM_'+uuid.uuid4().hex[:12],'legalName':'Synthetic CRM customer','abn':None,'creditLimit':10,'paymentTermsDays':30}
                cust=request('/api/v1/customers',crm_office,company,base=first,payload=draft,key='crm-customer-'+uuid.uuid4().hex)
                assert cust[0]==201,cust
                detail='/api/v1/customers/'+cust[1]['id'];body={**draft,'legalName':' Hold customer fixture '+uuid.uuid4().hex+' ','status':'ON_HOLD','creditLimit':'10.00'}
                update=dict(payload=body,key='crm-hold-'+uuid.uuid4().hex,version=1,method='PUT')
                for target in (first,second):
                    assert request(detail,crm_scoped,company,base=target)[0]==404
                    assert request(detail,crm_scoped,company,base=target,**update)[0]==404
                    for missing in ('creditLimit','paymentTermsDays'):
                        incomplete={k:v for k,v in body.items() if k!=missing}
                        bad=request(detail,crm_limited,company,base=target,**{**update,'payload':incomplete,'key':'crm-required-'+uuid.uuid4().hex})
                        assert bad[0]==400,bad
                held=request(detail,crm_limited,company,base=first,**update)
                assert held[0]==200 and held[1]['version']==2,held
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(detail,crm_limited,company,base=first if n%2 else second,**update),range(6)))
                assert all(result==held for result in attempts),attempts
                for target in (first,second):
                    for change in ({'creditLimit':11},{'paymentTermsDays':31},{'status':'ACTIVE'}):
                        bad=request(detail,crm_limited,company,base=target,payload={**body,**change},key='crm-credit-denied-'+uuid.uuid4().hex,version=2,method='PUT')
                        assert bad[0]==403,bad
                finalbody={**body,'legalName':'Customer maintenance done '+uuid.uuid4().hex,'status':'ACTIVE','creditLimit':'11.00','paymentTermsDays':31,'abn':'51 824 753 556'}
                update=dict(payload=finalbody,key='crm-release-'+uuid.uuid4().hex,version=2,method='PUT')
                released=request(detail,crm_office,company,base=second,**update)
                assert released[0]==200 and released[1]['version']==3,released
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(detail,crm_office,company,base=first if n%2 else second,**update),range(6)))
                assert all(result==released for result in attempts),attempts
                view=request(detail,crm_office,company)
                assert view==request(detail,crm_office,company,base=legacy_url) and view[1]['creditLimit']=='11.00' and view[1]['paymentTermsDays']==31 and view[1]['status']=='ACTIVE' and view[1]['abn']=='51824753556',view
            shared_customer='/api/v1/customers/00000000-0000-0000-0000-000000000251';shared_supplier='/api/v1/suppliers/00000000-0000-0000-0000-000000000252'
            customerbody={'code':'SHARED_CRM_TEST','legalName':'Shared customer maintenance','status':'ON_HOLD','creditLimit':'100.00','paymentTermsDays':30}
            supplierbody={'code':'SHARED_SUPPLIER_TEST','legalName':'Shared supplier maintenance'}
            for target in (url,legacy_url):
                for route,actor,body,status in ((shared_customer,crm_limited,customerbody,403),(shared_supplier,supplier_only,supplierbody,403),(shared_supplier,crm_scoped,supplierbody,404)):
                    denied=request(route,actor,company,base=target,payload=body,key='crm-shared-denied-'+uuid.uuid4().hex,version=1,method='PUT')
                    assert denied[0]==status,denied
            supplier_update=dict(payload=supplierbody,key='crm-shared-supplier-'+uuid.uuid4().hex,version=1,method='PUT')
            shared=request(shared_supplier,crm_office,company,**supplier_update)
            assert shared[0]==200 and request(shared_supplier,crm_office,company,base=legacy_url,**supplier_update)==shared,shared
            assert request(shared_customer,crm_office,company)[1]['legalName']==supplierbody['legalName']
            customer_update=dict(payload={**customerbody,'legalName':'Shared customer maintenance done','status':'ACTIVE','creditLimit':'101.00','paymentTermsDays':31},key='crm-shared-customer-'+uuid.uuid4().hex,version=1,method='PUT')
            shared=request(shared_customer,crm_office,company,base=legacy_url,**customer_update)
            assert shared[0]==200 and request(shared_customer,crm_office,company,**customer_update)==shared,shared
            assert request(shared_supplier,crm_office,company)[1]['legalName']=='Shared customer maintenance done'
            for first,second in ((legacy_url,url),(url,legacy_url)):
                path='/api/v1/customers/00000000-0000-0000-0000-000000000011/branches'
                body={'code':' br_'+uuid.uuid4().hex[:12]+' ','name':' Branch café + fixture ','addressLine1':' 1 Synthetic & Test Street ','suburb':'  ','state':' nsw ','postcode':' 2000 '}
                args=dict(payload=body,key='branch-create-'+uuid.uuid4().hex)
                for target in (first,second):
                    assert request(path,warehouse_scoped,company,base=target,**args)[0]==403
                    hidden=request('/api/v1/customers/00000000-0000-0000-0000-000000000072/branches',crm_scoped,company,base=target,**args)
                    assert hidden[0]==404,hidden
                    for change,status in (({'country':None},422),({'country':'USA'},422),({'state':None},422),({'postcode':'200'},422),({'postcode':'２０００'},422),({'suburb':'x'*201},422),({'addressLine1':'x'*301},422),({'active':None},400),({'name':' '},422),({'code':'ß'},422)):
                        bad=request(path,crm_scoped,company,base=target,payload={**body,**change},key='branch-bad-'+uuid.uuid4().hex)
                        assert bad[0]==status,bad
                created=request(path,crm_scoped,company,base=first,**args)
                assert created[0]==201 and created[1]['version']==1,created
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(path,crm_scoped,company,base=first if n%2 else second,**args),range(6)))
                assert all(result==created for result in attempts),attempts
                canonical={**body,'code':body['code'].strip().upper(),'name':body['name'].strip(),'addressLine1':body['addressLine1'].strip(),'suburb':None,'state':'NSW','postcode':'2000','country':'AU','active':True}
                assert request(path,crm_scoped,company,base=second,**{**args,'payload':canonical})==created
                detail=path+'/'+created[1]['id'];view=request(detail,crm_scoped,company)
                assert view==request(detail,crm_scoped,company,base=legacy_url) and view[1]['country']=='AU' and view[1]['state']=='NSW' and view[1]['postcode']=='2000' and view[1]['suburb'] is None and view[1]['active'] is True,view
                changedbody={**canonical,'name':'Closed branch fixture '+uuid.uuid4().hex,'addressLine1':' 2 Synthetic NZ Street ','country':' nz ','state':' ','postcode':'1010','active':False}
                update=dict(payload=changedbody,key='branch-update-'+uuid.uuid4().hex,version=1,method='PUT')
                for target in (first,second):
                    wrong='/api/v1/customers/00000000-0000-0000-0000-000000000072/branches/'+created[1]['id']
                    assert request(wrong,crm_office,company,base=target)[0]==404
                    assert request(wrong,crm_office,company,base=target,**{**update,'version':None})[0]==404
                    assert request(detail,crm_scoped,company,base=target,**{**update,'version':None})[0]==428
                changed=request(detail,crm_scoped,company,base=second,**update)
                assert changed[0]==200 and changed[1]['version']==2,changed
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts=list(pool.map(lambda n:request(detail,crm_scoped,company,base=first if n%2 else second,**update),range(6)))
                assert all(result==changed for result in attempts),attempts
                final=request(detail,crm_scoped,company)
                assert final==request(detail,crm_scoped,company,base=legacy_url) and final[1]['country']=='NZ' and final[1]['state'] is None and final[1]['active'] is False and final[1]['version']==2,final
                for target in (first,second):
                    stale=request(detail,crm_scoped,company,base=target,**{**update,'key':'branch-stale-'+uuid.uuid4().hex})
                    assert stale[0]==409,stale
                listing=request(path+'?pageSize=100',crm_scoped,company)
                assert listing==request(path+'?pageSize=100',crm_scoped,company,base=legacy_url),listing
                assert created[1]['id'] in [item['id'] for item in listing[1]['items']],listing
            contact_branch_ids=['00000000-0000-0000-0000-000000000260','00000000-0000-0000-0000-000000000012']
            for kind,parent,actor in (('customers','00000000-0000-0000-0000-000000000011',crm_scoped),('suppliers','00000000-0000-0000-0000-000000000043',supplier_only)):
                path='/api/v1/'+kind+'/'+parent+'/contacts'
                for first,second in ((legacy_url,url),(url,legacy_url)):
                    body={'name':' Contact café + '+uuid.uuid4().hex+' ','email':' "a b"@example.com ','phone':' +61 (2) 1234 xEXT#5 ','mobile':' 0400 000 000 ','jobTitle':' Accounts ','branchIds':contact_branch_ids if kind=='customers' else None}
                    args=dict(payload=body,key='contact-create-'+uuid.uuid4().hex)
                    for target in (first,second):
                        assert request(path,warehouse_scoped,company,base=target,**args)[0]==403
                        for change,status in (({'email':'Name <a@example.com>'},422),({'email':'a..b@example.com'},422),({'phone':'１２３'},422),({'phone':'abc'},422),({'mobile':'1\t2'},422),({'name':' '},422),({'jobTitle':'x'*101},422),({'branchIds':['00000000-0000-0000-0000-000000000000']},422),({'branchIds':contact_branch_ids*2},422),({'branchIds':[None]},400),({'active':None},400),({'isAccounting':None},400)):
                            bad=request(path,actor,company,base=target,payload={**body,**change},key='contact-bad-'+uuid.uuid4().hex)
                            assert bad[0]==status,bad
                        invalid_branch={'branchIds':['00000000-0000-0000-0000-000000000073']}
                        bad=request(path,actor,company,base=target,payload={**body,**invalid_branch},key='contact-parent-'+uuid.uuid4().hex)
                        assert bad[0]==(404 if kind=='customers' else 422),bad
                    created=request(path,actor,company,base=first,**args)
                    assert created[0]==201 and created[1]['version']==1,created
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(path,actor,company,base=first if n%2 else second,**args),range(6)))
                    assert all(result==created for result in attempts),attempts
                    reversedbody={**body,'branchIds':list(reversed(contact_branch_ids)) if kind=='customers' else []}
                    assert request(path,actor,company,base=second,**{**args,'payload':reversedbody})==created
                    detail=path+'/'+created[1]['id'];view=request(detail,actor,company)
                    assert view==request(detail,actor,company,base=legacy_url) and view[1]['email']=='"a b"@example.com' and view[1]['active'] is True and view[1]['isAccounting'] is False,view
                    assert view[1]['branchIds']==sorted(contact_branch_ids if kind=='customers' else []),view
                    changedbody={**body,'name':'Closed contact fixture '+kind+' '+uuid.uuid4().hex,'email':' 用户@例子.测试 ','phone':' ','mobile':None,'jobTitle':None,'isAccounting':True,'active':False,'branchIds':['00000000-0000-0000-0000-000000000012'] if kind=='customers' else []}
                    update=dict(payload=changedbody,key='contact-update-'+uuid.uuid4().hex,version=1,method='PUT')
                    for target in (first,second):
                        wrong='/api/v1/'+kind+('/00000000-0000-0000-0000-000000000072' if kind=='customers' else '/00000000-0000-0000-0000-000000000252')+'/contacts/'+created[1]['id']
                        assert request(wrong,crm_office,company,base=target)[0]==404
                        assert request(wrong,crm_office,company,base=target,**{**update,'version':None})[0]==404
                        assert request(detail,actor,company,base=target,**{**update,'version':None})[0]==428
                    changed=request(detail,actor,company,base=second,**update)
                    assert changed[0]==200 and changed[1]['version']==2,changed
                    with ThreadPoolExecutor(max_workers=6) as pool:
                        attempts=list(pool.map(lambda n:request(detail,actor,company,base=first if n%2 else second,**update),range(6)))
                    assert all(result==changed for result in attempts),attempts
                    final=request(detail,actor,company)
                    assert final==request(detail,actor,company,base=legacy_url) and final[1]['email']=='用户@例子.测试' and final[1]['phone'] is None and final[1]['mobile'] is None and final[1]['active'] is False and final[1]['isAccounting'] is True,final
                    for target in (first,second):
                        assert request(detail,actor,company,base=target,**{**update,'key':'contact-stale-'+uuid.uuid4().hex})[0]==409
                    listing=request(path+'?pageSize=100',actor,company)
                    assert listing==request(path+'?pageSize=100',actor,company,base=legacy_url) and created[1]['id'] in [item['id'] for item in listing[1]['items']],listing
            shared_customer_contacts='/api/v1/customers/00000000-0000-0000-0000-000000000251/contacts';shared_supplier_contacts='/api/v1/suppliers/00000000-0000-0000-0000-000000000252/contacts'
            shared_body={'name':'Shared contact fixture '+uuid.uuid4().hex,'email':'a@localhost','branchIds':['00000000-0000-0000-0000-000000000261']}
            for target in (url,legacy_url):
                for path,actor,body,status in ((shared_customer_contacts,crm_limited,shared_body,403),(shared_supplier_contacts,supplier_only,{'name':'Denied shared contact'},403),(shared_supplier_contacts,crm_scoped,{'name':'Denied hidden shared contact'},404)):
                    bad=request(path,actor,company,base=target,payload=body,key='contact-shared-denied-'+uuid.uuid4().hex)
                    assert bad[0]==status,bad
            args=dict(payload=shared_body,key='contact-shared-'+uuid.uuid4().hex)
            shared=request(shared_customer_contacts,crm_office,company,**args)
            assert shared[0]==201 and request(shared_customer_contacts,crm_office,company,base=legacy_url,**args)==shared,shared
            shared_id=shared[1]['id']
            assert request(shared_supplier_contacts+'/'+shared_id,supplier_only,company)==request(shared_customer_contacts+'/'+shared_id,crm_office,company)
            for target in (url,legacy_url):
                blocked=request(shared_supplier_contacts+'/'+shared_id,crm_office,company,base=target,payload={'name':'Blocked linked shared contact'},key='contact-route-'+uuid.uuid4().hex,version=1,method='PUT')
                assert blocked[0]==409 and json.loads(blocked[1])['code']=='customer_contact_route_required',blocked
            clear=dict(payload={'name':'Shared contact links cleared','email':'a@b','branchIds':[]},key='contact-clear-'+uuid.uuid4().hex,version=1,method='PUT')
            cleared=request(shared_customer_contacts+'/'+shared_id,crm_office,company,base=legacy_url,**clear)
            assert cleared[0]==200 and request(shared_customer_contacts+'/'+shared_id,crm_office,company,**clear)==cleared,cleared
            vendor_update=dict(payload={'name':'Shared supplier contact final','email':'a@b','branchIds':None,'active':False},key='contact-vendor-'+uuid.uuid4().hex,version=2,method='PUT')
            updated=request(shared_supplier_contacts+'/'+shared_id,crm_office,company,**vendor_update)
            assert updated[0]==200 and updated[1]['version']==3 and request(shared_supplier_contacts+'/'+shared_id,crm_office,company,base=legacy_url,**vendor_update)==updated,updated
            print('PASS: customer/supplier contacts, shared party permissions, branch array/link replacement, route guard and mixed replay')
            print('PASS: branch CRUD, assigned customer scope, normalized AU/NZ addresses, parent ownership and mixed replay')
            print('PASS: customer/supplier maintenance, nullable requested terms, shared party scope, credit/hold permissions and mixed replay')
            print('PASS: warehouse scope, immutable purpose, active references; product maintenance and unit ownership/pricing locks; shared retries')
            print('PASS: catalog lookup CRUD, normalized shared replay, read ordering, permissions, versions and used-UOM protection')
            print('PASS: promotions sorted replay, active price selection, empty inactive update, retained child versions and nested audit')
            print('PASS: customer pricing fixed/discount switch, assignment scope, immutable ownership and shared replay')
            print('PASS: standard/floor pricing maintenance, UTC tick canonical replay, required/default binding, immutable units and version audit')
            print('PASS: direct order aggregate demand, atomic stock/credit failures, composite permissions and mixed replay')
            print('PASS: quote area/whole-pack/service GST/override/floor/ownership/manage-all and price-change refresh rollback')
            print('PASS: stock-source amount credits, frozen physical quantity, AP reduction, valuation audit and mixed replay')
            print('PASS: expense bills/credits, line/date binding, compound permissions, shared replay and zero stock movement')
            print('PASS: bidirectional sales order cancellation, single stock and credit release')
            for first, second in ((legacy_url,url),(url,legacy_url)):
                key = 'customer-'+str(uuid.uuid4())
                draft = {'code':'  C'+uuid.uuid4().hex[:10]+'  ','legalName':'  Sample café + "retail"  ',
                         'abn':'51 824 753 556','creditLimit':0.0}
                created = request('/api/v1/customers',employee,company,base=first,payload=draft,key=key)
                assert created[0] == 201, created
                assert request('/api/v1/customers',employee,company,base=second,payload=draft,key=key) == created
                status_path = '/api/v1/customers/'+created[1]['id']+'/status'
                hold = {'status':'ON_HOLD'}
                updated = request(status_path,employee,company,base=second,payload=hold,key=key+'-hold',version=1,method='PATCH')
                assert updated[0] == 200 and updated[1]['version'] == 2, updated
                assert request(status_path,employee,company,base=first,payload=hold,key=key+'-hold',version=1,method='PATCH') == updated
                for target in (first,second):
                    assert request(status_path,employee,company,base=target,payload={'status':'ACTIVE'},
                                   key=key+'-release',version=2,method='PATCH')[0] == 403
                    assert request('/api/v1/customers',employee,company,base=target,payload={**draft,'creditLimit':1},
                                   key=key+'-credit')[0] == 403
            print('PASS: bidirectional customer create/status replay and credit permission')
            for first, second in ((legacy_url,url),(url,legacy_url)):
                key = 'product-'+str(uuid.uuid4())
                base_unit = '00000000-0000-0000-0000-000000000015'
                alt_unit = '00000000-0000-0000-0000-000000000018'
                draft = {'sku':'  P'+uuid.uuid4().hex[:10]+'  ','name':'  Synthetic café + planks ',
                         'baseUomId':base_unit,'taxCodeId':'00000000-0000-0000-0000-000000000016',
                         'wholePacks':True,'units':[{'uomId':alt_unit,'conversionToBase':2.25,'quantityStep':0.5},
                                                  {'uomId':base_unit,'conversionToBase':1.0}]}
                created = request('/api/v1/products',employee,company,base=first,payload=draft,key=key)
                assert created[0] == 201, created
                draft['units'].reverse()
                assert request('/api/v1/products',employee,company,base=second,payload=draft,key=key) == created
                units = request('/api/v1/products/'+created[1]['id']+'/units',employee,company,base=second)
                assert units[0] == 200 and len(units[1]) == 2, units
                bad = {**draft,'sku':'ROLLBACK_'+uuid.uuid4().hex[:10],'taxCodeId':'00000000-0000-0000-0000-000000000099'}
                assert request('/api/v1/products',employee,company,base=first,payload=bad,key=key+'-bad')[0] == 422
            print('PASS: bidirectional product create replay, ordered units, invalid tax rollback')
            old_visits = request('/api/v1/crm/collaboration?kind=VISIT&state=OPEN',employee,company,base=legacy_url)
            for old_visit in old_visits[1]['items']:
                response = request('/api/v1/crm/collaboration/'+old_visit['id']+'/cancel',employee,company,
                    base=legacy_url,payload={'reason':'Reset synthetic parity fixture'},key='cancel-'+old_visit['id'],version=old_visit['version'])
                assert response[0] == 200, response
            for first, second in ((legacy_url,url),(url,legacy_url)):
                visit_id = str(uuid.uuid4())
                visit = {'id':visit_id,'kind':'VISIT','customerId':'00000000-0000-0000-0000-000000000011',
                         'branchId':branch,'data':{'checkIn':{'latitude':-33.86,'longitude':151.21,'accuracyMetres':5.25,
                                    'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')},
                                    'purpose':'Test café + "quotes"'}}
                key = 'visit-'+visit_id
                initial = request('/api/v1/crm/collaboration',employee,company,base=first,payload=visit,key=key)
                assert initial[0] == 201, initial
                replay = request('/api/v1/crm/collaboration',employee,company,base=second,payload=visit,key=key)
                assert replay == initial, (initial,replay)
                visit['data']['purpose'] = 'changed'
                assert request('/api/v1/crm/collaboration',employee,company,base=second,payload=visit,key=key)[0] == 409
                photo = bytes.fromhex('89504e470d0a1a0a') + b'fixture'
                attachment = '/api/v1/documents/'+visit_id+'/attachments?fileName=visit-'+visit_id+'.png'
                args = dict(payload=photo,key='visit-photo-'+visit_id,content_type='image/png',version=1)
                java_created = request(attachment,employee,company,base=url,**args) if first == url else None
                def upload_attempt(index):
                    # Both APIs explicitly expose transient PostgreSQL contention as retryable409.
                    # Retain identical body/key; any other conflict still fails the assertions below.
                    for attempt in range(4):
                        response=request(attachment,employee,company,
                            base=first if index % 2 == 0 else second,**args)
                        error=json.loads(response[1]) if response[0]==409 and isinstance(response[1],str) else {}
                        if error.get('code')!='concurrent_operation' or error.get('retryable') is not True:
                            return response
                        print('Retrying transient attachment contention:',index,attempt+1,flush=True)
                        time.sleep(.1*(attempt+1))
                    return response
                with ThreadPoolExecutor(max_workers=8) as pool:
                    responses = list(pool.map(upload_attempt, range(8)))
                uploaded = responses[0]
                assert all(response == uploaded for response in responses), responses
                assert java_created is None or java_created == uploaded
                assert uploaded[0] == 202 and uploaded[1]['state'] == 'PENDING', uploaded
                duplicate = request(attachment,employee,company,base=second,**args)
                assert duplicate == uploaded, (uploaded,duplicate)
                args['payload'] += b'changed'
                assert request(attachment,employee,company,base=second,**args)[0] == 409
                args['key'] += '-stale'
                args['version'] = 99
                assert request(attachment,employee,company,base=url,**args)[0] == 409
                if os.environ.get('HTT_STALL_TEST'):
                    verify_stalled_upload(attachment,employee,company,first)
                    verify_upload_deadline(attachment,employee,company,first)
                scan_with_legacy(uploaded[1]['jobId'],employee,company,legacy_url,db_port)
                canceled = request('/api/v1/crm/collaboration/'+visit_id+'/cancel',employee,company,base=legacy_url,
                    payload={'reason':'Finish synthetic parity fixture'},key='cancel-'+visit_id,version=1)
                assert canceled[0] == 200, canceled
            for first, second in ((legacy_url,url),(url,legacy_url)):
                for kind, data in (
                    ('NOTE',{'text':'  Synthetic café + note  '}),
                    ('BOARD',{'title':' Synthetic display ','description':'  Display & test ',
                              'placedAt':datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=11))).isoformat(),
                              'productId':product}),
                ):
                    item_id = str(uuid.uuid4())
                    item = {'id':item_id,'kind':kind,'customerId':'00000000-0000-0000-0000-000000000011',
                            'branchId':branch,'data':data}
                    initial = request('/api/v1/crm/collaboration',employee,company,base=first,payload=item,key='test-'+item_id)
                    assert initial[0] == 201, (kind,initial)
                    replay = request('/api/v1/crm/collaboration',employee,company,base=second,payload=item,key='test-'+item_id)
                    assert replay == initial, (kind,initial,replay)
                    if kind == 'BOARD':
                        removed = request('/api/v1/crm/collaboration/'+item_id+'/remove',employee,company,base=legacy_url,
                            payload={'reason':'Finish synthetic display fixture'},key='remove-'+item_id,version=1)
                        assert removed[0] == 200, removed
            print('PASS: bidirectional NOTE and BOARD creation parity on shared collaboration route')
            flutter_visit = verify_flutter(employee, legacy_url, ctx)
            canceled = request('/api/v1/crm/collaboration/'+flutter_visit+'/cancel',employee,company,base=legacy_url,
                payload={'reason':'Finish Flutter synthetic fixture'},key='cancel-'+flutter_visit,version=1)
            assert canceled[0] == 200, canceled
            print('PASS: Flutter VisitBackend stable HTTPS with cross-backend failure recovery')
            print('PASS: bidirectional Java/.NET visit create replay and changed payload conflict')
            print(f'PASS: {len(cases)} Java/.NET HTTP contract comparisons')
            print('PASS: signed identity, wrong audience, scoped branch query, missing/cross-company rejection and validation')
            verify_rate_limits(legacy_url)
        finally:
            legacy.terminate()
            legacy.wait(timeout=15)
            proc.terminate()
            proc.wait(timeout=15)
            server.shutdown()
