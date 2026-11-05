from concurrent.futures import ThreadPoolExecutor
import datetime, uuid, socketserver, struct, socket
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
            Documents__ClamAvHost='127.0.0.1',Documents__ClamAvPort=str(scanner.server_address[1]),BankFeeds__Enabled='false')
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

def token(subject, audience='staff'):
    head = b64(json.dumps({'alg':'RS256','kid':'fixture'}).encode())
    claims = b64(json.dumps({'iss':issuer,'sub':subject,'aud':[audience],'exp':int(time.time())+300}).encode())
    content = f'{head}.{claims}'
    signature = subprocess.check_output(['openssl','dgst','-sha256','-sign','sign.key'], input=content.encode())
    return f'{content}.{b64(signature)}'

def request(path, jwt=None, company=None, grant=None, base=url, payload=None, key=None, version=None, content_type=None, method=None):
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
    assert 1 <= result[1] < 37 and not result[0].startswith(('HTTP/1.1 201','HTTP/1.1 202')), result
    print('Stalled upload:',base,result,flush=True)

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
            assert request('/health/ready') == (200,{'status':'ready'})
            expected = {'companies':[{'actorId':'00000000-0000-0000-0000-000000000002',
                        'companyId':'00000000-0000-0000-0000-000000000001','companyName':'Synthetic HTT',
                        'membershipId':'00000000-0000-0000-0000-000000000003','permissions':['crm.maps.read','customers.all','customers.read']}]}
            actual = request('/api/v1/me',token('test-employee'))
            assert actual[0] == 200, actual
            other = '00000000-0000-0000-0000-000000000021'
            assert {entry['companyId'] for entry in actual[1]['companies']} == {other, expected['companies'][0]['companyId']}
            actual[1]['companies'][:] = [entry for entry in actual[1]['companies'] if entry['companyId'] != other]
            expected['companies'][0]['permissions'] += ['crm.collaboration.read','crm.visits.write','documents.attachments.write','documents.files.read','crm.notes.write','crm.boards.write','catalog.read','foundation.read','accounting.read','audit.read','customers.write','catalog.write','pricing.read','sales.quotes.read','sales.quotes.write','sales.quotes.approve','sales.orders.read','sales.credit.read','warehouses.all','sales.orders.create','inventory.read','sales.orders.cancel','sales.invoices.read','sales.invoices.write','accounting.receipts.read','accounting.receipts.write','accounting.banks.use','accounting.receivables.read','inventory.picks.read','inventory.picks.write','inventory.dispatch','inventory.opening.write','purchase.orders.read','purchase.orders.write','purchase.cost.read','purchase.orders.confirm','purchase.orders.close','purchase.receipts.read','purchase.receipts.write','purchase.grni.read','purchase.bills.read','purchase.bills.post','purchase.payments.read','purchase.payments.post','purchase.ap.read','purchase.advances.apply','purchase.advances.unapply','purchase.payments.reverse','purchase.bills.variance.post','purchase.payments.reapply','purchase.input_gst.read','accounting.advances.apply']
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
                assert request(branches,employee,company)[1]['items'][0]['id'] == branch
            def isolated_lookup(index):
                scope = company if index % 2 == 0 else other
                status, result = request(branches, employee, scope)
                assert status == 200 and result['total'] == (1 if scope == company else 0)
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
            quote = request('/api/v1/quotes',employee,company,base=legacy_url,payload={
                'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                'warehouseId':'00000000-0000-0000-0000-000000000014',
                'lines':[{'productUnitId':unit_id,'quantity':2}]},key='legacy-quote-'+str(uuid.uuid4()))
            assert quote[0] == 201, quote
            assert quote[1]['id'] in [item['id'] for item in request('/api/v1/quotes',employee,company)[1]['items']]
            for first, second in ((legacy_url,url),(url,legacy_url)):
                draft = request('/api/v1/quotes',employee,company,base=legacy_url,payload={
                    'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                    'warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':unit_id,'quantity':2}]},key='review-quote-'+str(uuid.uuid4()))
                assert draft[0] == 201, draft
                path = '/api/v1/quotes/'+draft[1]['id']
                submitted = request(path+'/submit',employee,company,base=legacy_url,
                    payload={},key='submit-'+draft[1]['id'],version=1)
                assert submitted[0] == 200 and submitted[1]['status'] == 'SUBMITTED', submitted
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

            order = request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
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
            for first, second in ((legacy_url,url),(url,legacy_url)):
                service = request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
                    'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,
                    'warehouseId':'00000000-0000-0000-0000-000000000014',
                    'lines':[{'productUnitId':'00000000-0000-0000-0000-000000000032','quantity':2}],
                    'reason':'Synthetic customer advance application'},key='advance-order-'+uuid.uuid4().hex)
                assert service[0] == 201, service
                order_path = '/api/v1/sales-orders/'+service[1]['orderId']
                detail = request(order_path,employee,company)
                receipt_args = dict(payload={'amount':20,'method':'BANK_TRANSFER','reference':'Customer deposit '+uuid.uuid4().hex,
                    'advances':[{'orderLineId':detail[1]['lines'][0]['id'],'amount':20}]},key='customer-deposit-'+uuid.uuid4().hex)
                receipt_path = '/api/v1/customers/00000000-0000-0000-0000-000000000011/receipts'
                deposited = request(receipt_path,employee,company,base=first,**receipt_args)
                assert deposited[0] == 201, deposited
                assert request(receipt_path,employee,company,base=second,**receipt_args) == deposited
                invoice_args = dict(payload={'lines':[{'orderLineId':detail[1]['lines'][0]['id'],'quantity':1}],'fulfilmentReference':'Synthetic service delivery'},
                    key='advance-invoice-'+uuid.uuid4().hex,version=detail[1]['version'])
                invoiced = request(order_path+'/invoices',employee,company,base=legacy_url,**invoice_args)
                assert invoiced[0] == 201, invoiced
                application_path = '/api/v1/customer-advances/'+deposited[1]['advances'][0]['id']+'/apply'
                apply_args = dict(payload={'reference':' Customer café & advance '+uuid.uuid4().hex,
                    'allocations':[{'invoiceLineId':invoiced[1]['lines'][0]['id'],'amount':20}]},
                    key='customer-apply-'+uuid.uuid4().hex)
                assert request(application_path,token('test-purchase-reader'),company,base=first,**apply_args)[0] == 403
                bad = dict(payload={**apply_args['payload'],'allocations':[{'invoiceLineId':invoiced[1]['lines'][0]['id'],'amount':21}]},
                    key='customer-over-apply-'+uuid.uuid4().hex)
                rejected = [request(application_path,employee,company,base=target,**bad) for target in (first,second)]
                assert rejected[0][0] == rejected[1][0] and 400 <= rejected[0][0] < 500, rejected
                with ThreadPoolExecutor(max_workers=6) as pool:
                    attempts = list(pool.map(lambda n: request(application_path,employee,company,
                        base=first if n%2 else second,**apply_args),range(6)))
                applied = attempts[0]
                assert applied[0] == 201 and all(result==applied for result in attempts), attempts
                assert applied[1]['applicationStatus']=='APPLIED' and float(applied[1]['amount'])==20, applied
                read_path = '/api/v1/advance-applications/'+applied[1]['id']
                assert request(read_path,employee,company)==(200,applied[1])
                assert request(read_path,employee,company,base=legacy_url)==(200,applied[1])
                ar = request('/api/v1/customers/00000000-0000-0000-0000-000000000011/receivables?pageSize=100',employee,company)
                entry = next(item for item in ar[1]['items'] if item['invoiceId']==invoiced[1]['id'])
                assert float(entry['paid'])==20 and float(entry['outstanding'])==30, entry
            print('PASS: customer advance application, cross-backend concurrent replay and over-allocation rollback')

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
            print('PASS: bidirectional pick creation with shortage and legacy snapshot')
            print('PASS: bidirectional warehouse dispatch and stock invoicing replay')
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
                today = datetime.date.today().isoformat()
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
            today = datetime.date.today().isoformat()
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
                candidate = request('/api/v1/sales-orders',employee,company,base=legacy_url,payload={
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
                with ThreadPoolExecutor(max_workers=8) as pool:
                    responses = list(pool.map(lambda index: request(attachment,employee,company,
                        base=first if index % 2 == 0 else second,**args), range(8)))
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
        finally:
            legacy.terminate()
            legacy.wait(timeout=15)
            proc.terminate()
            proc.wait(timeout=15)
            server.shutdown()
