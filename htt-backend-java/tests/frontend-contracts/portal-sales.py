"""Focused portal sales reads on a disposable, recorded synthetic database; no workers."""
import argparse,base64,hashlib,http.server,json,os,pathlib,socket,ssl,subprocess,threading,time,urllib.error,urllib.request,uuid
project=pathlib.Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--snapshot',type=pathlib.Path,required=True);p.add_argument('--jar',type=pathlib.Path,default=project/'target/htt-backend-java-0.1.0-SNAPSHOT.jar');a=p.parse_args()
assert a.snapshot.open('rb').read(5)==b'PGDMP'
docker=os.environ.get('DOCKER','docker');jdk=pathlib.Path(os.environ['JAVA_HOME']);name='htt-portal-alignment-'+uuid.uuid4().hex[:12]
out=project/'target/frontend-contracts'/uuid.uuid4().hex;out.mkdir(parents=True);proc=None;server=None
company='00000000-0000-0000-0000-000000000001';grant='00000000-0000-0000-0000-000000000013';branch='00000000-0000-0000-0000-000000000012'
def run(args,**kw):return subprocess.run(list(map(str,args)),check=True,timeout=180,**kw)
def sql(text):
 result=run([docker,'exec','-i',name,'psql','-U','htt_owner','-d','htt_java_test','-At','-v','ON_ERROR_STOP=1'],input=text,text=True,capture_output=True)
 return result.stdout.strip()
def b64(x):return base64.urlsafe_b64encode(x).rstrip(b'=').decode()
def jwt(audience='portal',subject='test-portal'):
 value=b64(json.dumps({'alg':'RS256','kid':'fixture'}).encode())+'.'+b64(json.dumps({'iss':issuer,'sub':subject,'aud':audience,'exp':int(time.time())+3600}).encode())
 signed=run(['openssl','dgst','-sha256','-sign',out/'sign.key'],input=value.encode(),capture_output=True).stdout
 return value+'.'+b64(signed)
def request(path,headers=None,token=True,method="GET",payload=None):
 h={'X-Company-Id':company,'X-Portal-Grant-Id':grant}
 if token:h['Authorization']='Bearer '+jwt()
 h.update(headers or {})
 try:
  with urllib.request.urlopen(urllib.request.Request(base+path,headers=h,method=method,data=None if payload is None else json.dumps(payload).encode()),timeout=10) as response:return response.status,json.load(response)
 except urllib.error.HTTPError as e:
  body=e.read();return e.code,json.loads(body) if body else None
try:
 run([docker,'run','-d','--name',name,'-p','127.0.0.1::5432','-e','POSTGRES_USER=htt_owner','-e','POSTGRES_DB=htt_java_test','-e','POSTGRES_PASSWORD=local-owner-test','-e','HTT_APP_PASSWORD=local-app-test','-e','HTT_WORKER_PASSWORD=local-worker-test','-e','HTT_PORTAL_PASSWORD=local-portal-test','-v',str(project/'infra/init-db.sh')+':/docker-entrypoint-initdb.d/10-htt.sh:ro','postgres:17-alpine'],capture_output=True)
 for _ in range(60):
  if subprocess.run([docker,'exec',name,'pg_isready','-h','127.0.0.1','-U','htt_owner','-d','htt_java_test'],capture_output=True).returncode==0:break
  time.sleep(1)
 else:raise RuntimeError('Synthetic DB unavailable')
 with a.snapshot.open('rb') as f:run([docker,'exec','-i',name,'pg_restore','-U','htt_owner','-d','htt_java_test','--clean','--if-exists','--exit-on-error','--single-transaction'],stdin=f,capture_output=True)
 fingerprint_sql="SELECT jsonb_build_object('stock', (SELECT md5(string_agg(row_to_json(x)::text,',' ORDER BY id)) FROM inventory.stock_balances x),'values',(SELECT md5(string_agg(row_to_json(x)::text,',' ORDER BY id)) FROM inventory.stock_values x),'journals',(SELECT md5(string_agg(row_to_json(x)::text,',' ORDER BY id)) FROM accounting.journal_lines x))::text"
 historical_fingerprint=sql(fingerprint_sql)
 history={}
 if sql("SELECT to_regclass('public.htt_test_extension_history') IS NOT NULL")=='t':
  history=json.loads(sql("SELECT coalesce(json_object_agg(name,sha256),'{}')::text FROM public.htt_test_extension_history"))
 for migration in sorted((project/'src/main/resources/db/migration').glob('*.sql')):
  if migration.name>='057_':
   if migration.name in history:assert history[migration.name]==hashlib.sha256(migration.read_bytes()).hexdigest(),('Snapshot extension checksum changed',migration.name)
   else:sql(migration.read_text())
 assert sql(fingerprint_sql)==historical_fingerprint,'Migration changed historical stock or journals'
 sql((project/'tests/frontend-contracts/inventory-costing.sql').read_text())
 sql((project/'tests/frontend-contracts/commercial-reservations.sql').read_text())
 sql((project/'tests/frontend-contracts/dispatch-schedules.sql').read_text())
 sql((project/'tests/frontend-contracts/improvements.sql').read_text())
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),http.server.BaseHTTPRequestHandler);issuer='https://localhost:'+str(server.server_port)
 run(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-days','1','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost','-keyout',out/'tls.key','-out',out/'tls.crt'],capture_output=True)
 run(['openssl','genrsa','-out',out/'sign.key','2048'],capture_output=True)
 modulus=run(['openssl','rsa','-in',out/'sign.key','-modulus','-noout'],text=True,capture_output=True).stdout.strip().split('=')[1]
 class Discovery(http.server.BaseHTTPRequestHandler):
  def do_GET(self):
   body={'keys':[{'kty':'RSA','use':'sig','alg':'RS256','kid':'fixture','n':b64(bytes.fromhex(modulus)),'e':'AQAB'}]} if self.path=='/jwks' else {'issuer':issuer,'jwks_uri':issuer+'/jwks','authorization_endpoint':issuer+'/authorize','response_types_supported':['code'],'subject_types_supported':['public'],'id_token_signing_alg_values_supported':['RS256']}
   payload=json.dumps(body).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
  def log_message(self,*args):pass
 server.RequestHandlerClass=Discovery;context=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);context.load_cert_chain(out/'tls.crt',out/'tls.key');server.socket=context.wrap_socket(server.socket,server_side=True);threading.Thread(target=server.serve_forever,daemon=True).start()
 sql("UPDATE identity.users SET issuer='"+issuer+"' WHERE id IN('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000002');")
 assert sql("select has_table_privilege('htt_portal','sales.invoices','SELECT')")=='f'
 run([jdk/'bin/keytool','-importcert','-noprompt','-alias','fixture','-file',out/'tls.crt','-keystore',out/'test.p12','-storepass','fixture-only'],capture_output=True)
 port=run([docker,'port',name,'5432'],text=True,capture_output=True).stdout.strip().split(':')[-1]
 with socket.socket() as s:s.bind(('127.0.0.1',0));api_port=s.getsockname()[1]
 base='http://127.0.0.1:'+str(api_port)
 env=dict(os.environ,HTT_PROCESS_MODE='api',SERVER_PORT=str(api_port),HTT_STAFF_AUDIENCE='staff',HTT_STAFF_AUTHORITY=issuer,HTT_STAFF_DATABASE_URL='jdbc:postgresql://127.0.0.1:'+port+'/htt_java_test',HTT_STAFF_DATABASE_PASSWORD='local-app-test',HTT_PORTAL_AUTHORITY=issuer,HTT_PORTAL_AUDIENCE='portal',HTT_PORTAL_DATABASE_URL='jdbc:postgresql://127.0.0.1:'+port+'/htt_java_test',HTT_PORTAL_DATABASE_PASSWORD='local-portal-test')
 log=(out/'java.log').open('w');jar=a.jar.resolve()
 proc=subprocess.Popen([str(jdk/'bin/java'),'-Djavax.net.ssl.trustStore='+str(out/'test.p12'),'-Djavax.net.ssl.trustStorePassword=fixture-only','-jar',str(jar)],env=env,stdout=log,stderr=subprocess.STDOUT)
 for _ in range(60):
  try:
   if urllib.request.urlopen(base+'/health/ready',timeout=1).status==200:break
  except OSError:pass
  if proc.poll() is not None:raise RuntimeError('Java API exited')
  time.sleep(1)
 else:raise RuntimeError('Java API not ready')
 counts={};sample=None
 for resource in ['quotes','orders','invoices','credit-notes','returns']:
  path='/api/portal/v1/'+resource+'?branchId='+branch+'&pageSize=100';code,data=request(path);assert code==200,(resource,code,data)
  assert data['currency']=='AUD' and data['dataAsOf'].endswith('+00:00'),data
  counts[resource]=data['totalCount'];assert data['totalCount']>0,(resource,data)
  ids=[]
  for item in data['items'][:3]:
   ids.append(item['id']);assert item['branchId']==branch
   if resource!='returns':assert isinstance(item['total'],str) and isinstance(item['gst'],str)
   detailCode,detail=request('/api/portal/v1/'+resource+'/'+item['id']+'?branchId='+branch);assert detailCode==200,(detailCode,detail)
   lines=detail['items'][0]['items'];assert lines,(resource,detail)
   assert not any(k in str(lines) for k in ['unitCost','valueAfter','createdBy','pricingSignature']),lines
  assert len(ids)==len(set(ids))
  if resource=='invoices':sample=data['items'][0]['id']
 # Staff inventory reads/writes use the staff audience, never the portal grant.
 staff_headers={'Authorization':'Bearer '+jwt('staff','test-employee')}
 product='00000000-0000-0000-0000-000000009801'
 code,policy=request('/api/v1/products/'+product+'/costing-policy',staff_headers)
 assert code==200 and policy['method']=='FIFO' and policy['version']==3,(code,policy)
 code,batches=request('/api/v1/warehouses/00000000-0000-0000-0000-000000000014/products/'+product+'/batches',staff_headers)
 assert code==200 and len(batches['items'])==2,(code,batches)
 assert [(x['quantity'],x['value']) for x in batches['items']]==[('5.000000','50.00'),('10.000000','200.00')],batches
 code,holds=request('/api/v1/inventory/commercial-reservations',staff_headers)
 assert code==200 and holds['scope']=='COMPANY' and not holds['changesOnHand'],(code,holds)
 assert all(set(item)=={'productId','quantity'} for item in holds['items']),holds
 headers={**staff_headers,'Content-Type':'application/json','If-Match':'"3"','Idempotency-Key':'synthetic-fifo-blocked-switch'}
 code,reply=request('/api/v1/products/'+product+'/costing-policy',headers,method='POST',payload={'method':'MOVING_WEIGHTED_AVERAGE','reason':'Synthetic forbidden nonzero switch'})
 assert code==409,(code,reply)
 # Operational metadata writes are versioned and retry-safe over real HTTP.
 schedule_doc=sql("SELECT q.id FROM sales.quotes q WHERE q.company_id='"+company+"' AND q.status='DRAFT' ORDER BY q.id LIMIT 1;").strip()
 assert schedule_doc,'Synthetic draft quote missing'
 schedule_path='/api/v1/documents/'+schedule_doc+'/dispatch-schedule'
 code,initial=request(schedule_path,staff_headers);assert code==200 and initial['version']==1,(code,initial)
 schedule_headers={**staff_headers,'Content-Type':'application/json','If-Match':'"1"','Idempotency-Key':'synthetic-dispatch-date'}
 schedule_input={'expectedDispatchDate':'2030-01-02','deliveryBooked':True,'awaitingCollection':True,'reason':'Synthetic scheduling request'}
 code,updated=request(schedule_path,schedule_headers,method='POST',payload=schedule_input)
 assert code==200 and updated['version']==2 and len(updated['dispatchHistory'])==1,(code,updated)
 code,replayed=request(schedule_path,schedule_headers,method='POST',payload=schedule_input)
 assert code==200 and replayed==updated,(code,replayed)
 code,conflict=request(schedule_path,{**schedule_headers,'Idempotency-Key':'synthetic-dispatch-stale'},method='POST',payload=schedule_input)
 assert code==409,(code,conflict)
 # Create a fresh FIFO dispatch through the real order/pick interfaces for return evidence tests.
 unit=sql("SELECT id FROM catalog.product_units WHERE company_id='"+company+"' AND product_id='"+product+"' AND conversion_to_base=1 ORDER BY id LIMIT 1;")
 assert unit,'Synthetic unit with base conversion 1 missing'
 sql("INSERT INTO pricing.price_list_items(id,company_id,price_list_id,product_unit_id,amount,effective_from) SELECT gen_random_uuid(),'"+company+"',id,'"+unit+"',100,current_date-1 FROM pricing.price_lists WHERE company_id='"+company+"';")
 def command(path,payload,version=None):
  h={**staff_headers,'Content-Type':'application/json','Idempotency-Key':'improvements-'+uuid.uuid4().hex}
  if version is not None:h['If-Match']='"'+str(version)+'"'
  code,body=request(path,h,method='POST',payload=payload);assert 200<=code<300,(path,code,body);return body
 fresh=command('/api/v1/sales-orders',{'customerId':'00000000-0000-0000-0000-000000000011','customerBranchId':branch,'warehouseId':'00000000-0000-0000-0000-000000000014','reason':'Synthetic workflow returns fixture','lines':[{'productUnitId':unit,'quantity':'1'}]})
 fresh_id=fresh['orderId'];line=sql("SELECT id FROM sales.order_lines WHERE order_id='"+fresh_id+"';")
 pick=command('/api/v1/warehouse/orders/'+fresh_id+'/picks',{'lines':[{'orderLineId':line,'quantity':'1'}]},fresh['version'])
 command('/api/v1/warehouse/picks/'+pick['id']+'/confirm',{'mode':'PICKUP','recipient':'Synthetic handover','reference':'Synthetic dispatch for return request'},pick['version'])
 sql((project/'tests/frontend-contracts/return-reminder-workflows.sql').read_text())
 exec(compile((project/'tests/frontend-contracts/workflows-http.py').read_text(),'workflows-http.py','exec'))
 # Permission revocation is checked afresh on every request.
 sql("DELETE FROM identity.role_permissions WHERE company_id='"+company+"' AND role_id='00000000-0000-0000-0000-000000000004' AND permission_code='inventory.cost.read';")
 code,redacted=request('/api/v1/warehouses/00000000-0000-0000-0000-000000000014/products/'+product+'/batches',staff_headers)
 assert code==200 and all('value' not in row for row in redacted['items']),(code,redacted)
 sql("DELETE FROM identity.role_permissions WHERE company_id='"+company+"' AND role_id='00000000-0000-0000-0000-000000000004' AND permission_code='inventory.costing.configure';")
 assert request('/api/v1/products/'+product+'/costing-policy',headers,method='POST',payload={'method':'MOVING_WEIGHTED_AVERAGE','reason':'Synthetic unauthorized policy'})[0]==403
 assert request('/api/portal/v1/invoices?branchId='+branch,token=False)[0]==401
 assert request('/api/portal/v1/invoices?branchId='+branch,{'Authorization':'Bearer '+jwt('staff')})[0]==401
 assert request('/api/portal/v1/invoices?branchId='+str(uuid.uuid4()))[0]==404
 assert request('/api/portal/v1/invoices?branchId='+branch+'&page=0')[0]==422
 assert request('/api/portal/v1/invoices/'+str(uuid.uuid4())+'?branchId='+branch)[0]==404
 assert request('/api/portal/v1/invoices?branchId='+branch,{'X-Company-Id':str(uuid.uuid4())})[0]==403
 sql("INSERT INTO platform.document_visibility(company_id,document_id,version,trashed_at,trashed_by,reason,changed_by) VALUES('"+company+"','"+sample+"',2,now(),'00000000-0000-0000-0000-000000000002','Synthetic portal visibility test','00000000-0000-0000-0000-000000000002') ON CONFLICT(company_id,document_id) DO UPDATE SET version=platform.document_visibility.version+1,trashed_at=now(),trashed_by=excluded.trashed_by,reason=excluded.reason,changed_by=excluded.changed_by;")
 assert request('/api/portal/v1/invoices/'+sample+'?branchId='+branch)[0]==404
 sql("UPDATE identity.customer_user_grants SET portal_enabled=false WHERE id='"+grant+"';")
 assert request('/api/portal/v1/invoices?branchId='+branch)[0]==403
 result={'status':'PASSED','scope':'Portal reads and staff prospective costing on disposable synthetic data; no frontend switching or real writes','alignmentWorkflows':{'fifoNegativeVarianceAndZeroResidual':True,'dispatchRetryFencingExpiry':True,'returnProofPendingProcessingAndRejection':True,'invoiceAndStatementBatchFingerprint':True,'fakeProviderAndPublicHttpEvidence':'workflow-http-acceptance.json'},'historicalStockAndJournalsUnchangedByMigration':True,'historicalFingerprint':json.loads(historical_fingerprint),'dispatchSchedule':{'dateAndFlags':True,'audit':True,'staleVersionRejected':True,'idempotentHttpReplay':True,'clearDate':True},'fifoPosting':{'crossWarehouseTransfer':True,'fifoIssueCost':'50.00','movingAverageCounterexample':'75.00','remainingQuantity':'15.000000','remainingValue':'250.00','allLedgerReconciliations':'ZERO_DIFFERENCES'},'populatedDocumentCounts':counts,'guards':['JWT','distinct audience','company','branch','missing document','pagination','hidden document','immediate grant revocation','no table SELECT privilege'],'snapshotSha256':hashlib.sha256(a.snapshot.read_bytes()).hexdigest(),'jarSha256':hashlib.sha256(jar.read_bytes()).hexdigest()}
 (out/'acceptance.json').write_text(json.dumps(result,indent=2));print('PORTAL_DOCUMENTS_PASSED',out,flush=True)
except Exception as e:
 (out/'FAILED').write_text(str(e)+'\n'+str(getattr(e,'stderr','')));print('FAILED_EVIDENCE',out,flush=True);raise
finally:
 if proc is not None:
  proc.terminate()
  try:proc.wait(timeout=20)
  except subprocess.TimeoutExpired:proc.kill();proc.wait()
 if server is not None:server.shutdown();server.server_close()
 subprocess.run([docker,'rm','-f','-v',name],capture_output=True,timeout=60)
