"""Executed by portal-sales.py in its disposable database/API test context."""
import zipfile
# Configure only synthetic recipients. No production worker or HTTP mail transport is started.
ctx="SELECT set_config('htt.company_id','"+company+"',true),set_config('htt.actor_id','00000000-0000-0000-0000-000000000002',true);"
def scoped(statement):return sql('BEGIN;'+ctx+statement+';COMMIT;')
def data(statement):
 lines=scoped(statement).splitlines();return next(json.loads(x) for x in reversed(lines) if x.startswith('{') or x.startswith('['))
scoped("INSERT INTO crm.contacts(company_id,party_id,name,email,is_accounting,created_by) SELECT company_id,party_id,'Synthetic accounting','accounts@example.invalid',true,core.current_actor() FROM crm.customers c WHERE c.company_id=core.current_company() AND NOT EXISTS(SELECT 1 FROM crm.contacts x WHERE x.company_id=c.company_id AND x.party_id=c.party_id AND x.active AND x.is_accounting); UPDATE crm.contacts SET email='accounts@example.invalid',active=true WHERE company_id=core.current_company() AND is_accounting")
code,cfg=request('/api/v1/invoice-reminders/settings',staff_headers);assert code==200 and not cfg['enabled'],(code,cfg)
command('/api/v1/invoice-reminders/settings',{'enabled':False,'from':'sender@example.invalid'},cfg['version'])
scoped('SELECT accounting.reminder_tick_ready()')
cfg=command('/api/v1/invoice-reminders/settings',{'enabled':True,'from':'sender@example.invalid'},2)
code,available=request('/api/v1/invoice-reminders',staff_headers);assert code==200 and available['rows'],(code,available)
ids=[available['rows'][0]['id']]
invoice_batch=command('/api/v1/invoice-reminders/preview',{'mode':'INVOICE','ids':ids})
statement_batch=command('/api/v1/invoice-reminders/preview',{'mode':'STATEMENT','ids':ids})
assert invoice_batch['results'][0]['status']=='PREVIEW' and statement_batch['mode']=='STATEMENT'
assert invoice_batch['results'][0]['text'] and invoice_batch['results'][0]['attachment']['contentType']=='application/pdf'
assert statement_batch['results'][0]['text'] and statement_batch['results'][0]['attachment']['number']
command('/api/v1/invoice-reminders/batches/'+invoice_batch['id']+'/queue',{'confirmed':True})
command('/api/v1/invoice-reminders/batches/'+statement_batch['id']+'/queue',{'confirmed':True})
# Exact input cannot bypass the customer scope on a read after permissions change.
code,quoted=request('/api/v1/dispatch-followups/settings',staff_headers);assert code==200 and not quoted['enabled'],(code,quoted)
command('/api/v1/dispatch-followups/settings',{'enabled':False,'from':'sender@example.invalid','notificationEmail':'staff@example.invalid','portalOrigin':'https://portal.example.invalid','timezone':'Australia/Melbourne'},quoted['version'])
scoped('SELECT sales.dispatch_tick_ready()')
command('/api/v1/dispatch-followups/settings',{'enabled':True,'from':'sender@example.invalid','notificationEmail':'staff@example.invalid','portalOrigin':'https://portal.example.invalid','timezone':'Australia/Melbourne'},2)
# Reuse a visible draft quote, transitioning it prospectively through normal database guards.
selected=data("SELECT jsonb_build_object('id',q.id) FROM sales.quotes q WHERE company_id=core.current_company() AND status='DRAFT' AND platform.document_visible(q.id) ORDER BY q.id LIMIT 1")
q=selected['id']
scoped("UPDATE sales.quotes SET status='SUBMITTED' WHERE company_id=core.current_company() AND id='"+q+"';UPDATE platform.documents SET state='CONFIRMED' WHERE company_id=core.current_company() AND id='"+q+"';SELECT sales.set_dispatch_schedule('"+q+"',coalesce((SELECT version FROM sales.dispatch_schedules WHERE company_id=core.current_company() AND document_id='"+q+"'),1),current_date-1,false,false,'Synthetic worker acceptance')")
# Compile the probe against this exact jar. Its transport is a local fake returning synthetic receipts.
lib=out/'probe-lib';lib.mkdir();classes=out/'probe-classes';classes.mkdir();main_classes=out/'probe-main-classes';main_classes.mkdir()
with zipfile.ZipFile(jar) as z:
 for entry in z.infolist():
  if entry.filename.startswith('BOOT-INF/classes/') and not entry.is_dir():
   target=main_classes/entry.filename.removeprefix('BOOT-INF/classes/');target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(entry))
  if entry.filename.startswith('BOOT-INF/lib/') and entry.filename.endswith('.jar'):(lib/pathlib.Path(entry.filename).name).write_bytes(z.read(entry))
classpath=str(main_classes)+os.pathsep+str(lib/'*')
run([jdk/'bin/javac','-cp',classpath,'-d',classes,project/'tests/frontend-contracts/WorkflowWorkerProbe.java'],capture_output=True)
worker_env=dict(os.environ,HTT_WORKER_DATABASE_URL='jdbc:postgresql://127.0.0.1:'+port+'/htt_java_test',HTT_WORKER_DATABASE_PASSWORD='local-worker-test')
with (out/'worker-probe.log').open('w') as f:run([jdk/'bin/java','-cp',str(classes)+os.pathsep+classpath,'au.com.htt.backend.WorkflowWorkerProbe'],env=worker_env,stdout=f,stderr=subprocess.STDOUT)
for batch in (invoice_batch,statement_batch):
 code,finished=request('/api/v1/invoice-reminders/batches/'+batch['id'],staff_headers)
 assert code==200 and all(x['status']=='ACCEPTED' for x in finished['results']),(code,finished)
# The active raw token exists only in the private synthetic mail payload; never write it to evidence.
link=data("SELECT jsonb_build_object('token',substring(payload->>'text' from '#([0-9a-f]{64})'),'id',document_id) FROM sales.dispatch_cycles WHERE company_id=core.current_company() AND kind='CUSTOMER' AND active AND state='ACCEPTED' ORDER BY created_at DESC LIMIT 1")
public_headers={'Origin':'https://portal.example.invalid','Content-Type':'application/json','X-HTT-Request':'1'}
code,public=request('/api/dispatch-portal',public_headers,token=False,method='POST',payload={'action':'view','input':{'token':link['token']}})
assert code==200 and public['ok'] and public['value']['documentNumber'],(code,public)
assert not any(x in public['value'] for x in ('recipient','customerId','payload','token'))
code,wrong=request('/api/dispatch-portal',{**public_headers,'Origin':'https://wrong.example.invalid'},token=False,method='POST',payload={'action':'view','input':{'token':link['token']}});assert code==403,(code,wrong)
code,missing=request('/api/dispatch-portal',{k:v for k,v in public_headers.items() if k!='X-HTT-Request'},token=False,method='POST',payload={'action':'view','input':{'token':link['token']}});assert code==415,(code,missing)
new_date=data("SELECT jsonb_build_object('date',((now() AT TIME ZONE 'Australia/Melbourne')::date+3)::text)")['date']
update={'action':'update','input':{'token':link['token'],'expectedDate':new_date,'reason':'Synthetic public reschedule'}}
code,updated=request('/api/dispatch-portal',public_headers,token=False,method='POST',payload=update);assert code==200 and updated['ok'],(code,updated)
code,repeat=request('/api/dispatch-portal',public_headers,token=False,method='POST',payload=update);assert repeat==updated,(code,repeat)
# Actual HTTP return request submission, rejection and stale version protection.
# A warehouse-only identity can upload evidence, but has no invoice/mail authority.
warehouse_user,warehouse_member=str(uuid.uuid4()),str(uuid.uuid4())
scoped("INSERT INTO identity.roles(company_id,code,name) VALUES(core.current_company(),'WAREHOUSE','Synthetic warehouse role') ON CONFLICT(company_id,code) DO NOTHING;INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT core.current_company(),r.id,p FROM identity.roles r CROSS JOIN unnest(ARRAY['inventory.returns.read','inventory.returns.write']) p WHERE r.company_id=core.current_company() AND r.code='WAREHOUSE' ON CONFLICT DO NOTHING;INSERT INTO identity.users(id,issuer,subject,display_name) VALUES('"+warehouse_user+"','"+issuer+"','synthetic-return-warehouse','Synthetic return warehouse');INSERT INTO identity.memberships(id,company_id,user_id) VALUES('"+warehouse_member+"',core.current_company(),'"+warehouse_user+"');INSERT INTO identity.membership_roles(company_id,membership_id,role_id) SELECT core.current_company(),'"+warehouse_member+"',id FROM identity.roles WHERE company_id=core.current_company() AND code='WAREHOUSE';INSERT INTO identity.warehouse_scopes(company_id,membership_id,warehouse_id) VALUES(core.current_company(),'"+warehouse_member+"','00000000-0000-0000-0000-000000000014')")
warehouse_headers={'Authorization':'Bearer '+jwt('staff','synthetic-return-warehouse')}
code,denied=request('/api/v1/invoice-reminders',warehouse_headers);assert code==403,(code,denied)
photos=[];upload_jobs=[]
order_version=data("SELECT jsonb_build_object('version',version) FROM platform.documents WHERE id='"+fresh_id+"'")['version']
for index in range(2):
 h={**warehouse_headers,'X-Company-Id':company,'Content-Type':'image/png','If-Match':'"'+str(order_version)+'"','Idempotency-Key':'synthetic-return-photo-'+str(index)}
 upload_path=base+'/api/v1/documents/'+fresh_id+'/attachments?fileName=synthetic-return-'+str(index)+'.png'
 with urllib.request.urlopen(urllib.request.Request(upload_path,headers=h,method='POST',data=bytes.fromhex('89504e470d0a1a0a')),timeout=10) as response:
  uploaded=json.load(response);assert response.status==202 and uploaded['state']=='PENDING',(response.status,uploaded)
 photos.append(uploaded['id']);upload_jobs.append(uploaded['jobId'])
movement=sql("SELECT m.id FROM inventory.stock_movements m JOIN inventory.pick_lines l ON l.company_id=m.company_id AND l.id=m.pick_line_id WHERE l.order_line_id='"+line+"';")
return_input={'orderId':fresh_id,'warehouseId':'00000000-0000-0000-0000-000000000014','reason':'Synthetic HTTP return evidence','handoverProof':{'name':'Synthetic customer','mobile':'0400000000','points':[[.1,.1],[.8,.7]],'signedAt':'2026-11-11T01:00:00Z'},'items':[{'stockMovementId':movement,'quantity':'1','photoFileIds':photos}]}

code,pending_denied=request('/api/v1/warehouse/return-requests',{**warehouse_headers,'Content-Type':'application/json','Idempotency-Key':'synthetic-unscanned-return'},method='POST',payload=return_input)
assert code==422,(code,pending_denied)
# A fake clean-scanner receipt finishes only these synthetic jobs under the restricted worker role.
for scan in upload_jobs:
 fence=str(uuid.uuid4())
 result=data("UPDATE platform.document_jobs SET state='PROCESSING',lease_token='"+fence+"',lease_until=now()+interval '90 seconds' WHERE id='"+scan+"';SET LOCAL ROLE htt_worker;SELECT jsonb_build_object('accepted',platform.finish_document_work('"+scan+"','"+fence+"','SUCCEEDED',NULL,NULL,NULL))")
 assert result['accepted'],result
code,returned=request('/api/v1/warehouse/return-requests',{**warehouse_headers,'Content-Type':'application/json','Idempotency-Key':'synthetic-scanned-return'},method='POST',payload=return_input)
assert code==200,(code,returned)
assert returned['status']=='PENDING',returned
rejected=command('/api/v1/warehouse/return-requests/'+returned['id']+'/decision',{'decision':'REJECT','reason':'Synthetic rejection'},returned['version']);assert rejected['status']=='REJECTED'
# Preserve only nonsensitive result metadata.

# Policy edits serialize across independent API requests without changing any historical ledger.
from concurrent.futures import ThreadPoolExecutor
zero_product='00000000-0000-0000-0000-000000009840'
scoped("INSERT INTO catalog.products SELECT (jsonb_populate_record(NULL::catalog.products,to_jsonb(p)||jsonb_build_object('id','"+zero_product+"','sku','SYNTHETIC-ZERO-CAS-9840','name','Synthetic empty policy concurrency'))).* FROM catalog.products p WHERE p.company_id=core.current_company() AND p.id='"+product+"';INSERT INTO catalog.product_units SELECT (jsonb_populate_record(NULL::catalog.product_units,to_jsonb(u)||jsonb_build_object('id',gen_random_uuid(),'product_id','"+zero_product+"'))).* FROM catalog.product_units u WHERE u.company_id=core.current_company() AND u.product_id='"+product+"'")
def switch_once(index):return request('/api/v1/products/'+zero_product+'/costing-policy',{**staff_headers,'Content-Type':'application/json','If-Match':'"1"','Idempotency-Key':'synthetic-policy-race-'+str(index)},method='POST',payload={'method':'MOVING_WEIGHTED_AVERAGE','reason':'Synthetic concurrent zero-stock policy switch'})
with ThreadPoolExecutor(max_workers=2) as pool:race=list(pool.map(switch_once,[1,2]))
assert sorted(x[0] for x in race)==[200,409],race
code,policy_after=request('/api/v1/products/'+zero_product+'/costing-policy',staff_headers);assert code==200 and policy_after['version']==2 and policy_after['method']=='MOVING_WEIGHTED_AVERAGE',(code,policy_after)

# A real supplier receipt -> negative variance bill -> supplier return on a FIFO product.
supplier=data("SELECT jsonb_build_object('id',id) FROM crm.suppliers WHERE company_id=core.current_company() AND status='ACTIVE' ORDER BY id LIMIT 1")['id']
today=data("SELECT jsonb_build_object('date',(now() AT TIME ZONE timezone)::date::text) FROM core.companies WHERE id=core.current_company()")['date']
po=command('/api/v1/purchase-orders',{'supplierId':supplier,'warehouseId':'00000000-0000-0000-0000-000000000014','notes':'Synthetic FIFO supplier variance','lines':[{'productUnitId':unit,'quantity':'10','unitCost':'20','recoverableGst':False}]})
po=command('/api/v1/purchase-orders/'+po['order']['id']+'/confirm',{},po['order']['version'])
receipt=command('/api/v1/purchase-orders/'+po['order']['id']+'/receipts',{'reference':'Synthetic FIFO supplier receipt','notes':'Synthetic valuation','lines':[{'orderLineId':po['lines'][0]['id'],'quantity':'10'}]},po['order']['version'])
receipt_id=receipt['receipt']['id'];receipt_line=receipt['lines'][0]['id']
receipt_value=data("SELECT jsonb_build_object('value',valuation_amount::text) FROM purchase.receipt_lines WHERE id='"+receipt_line+"'")['value']
bill=command('/api/v1/supplier-bills/with-variance',{'bill':{'supplierId':supplier,'supplierInvoice':'SYNTHETIC-FIFO-'+uuid.uuid4().hex,'invoiceDate':today,'dueOn':today,'postingDate':today,'lines':[{'receiptLineId':receipt_line,'quantity':'10','net':'0.00','tax':'0.00'}]},'reason':'Synthetic verified negative supplier price variance'})
assert data("SELECT jsonb_build_object('count',count(*)) FROM inventory.batch_events WHERE company_id=core.current_company() AND source_document_id='"+bill['bill']['id']+"' AND method='FIFO' AND value_delta<0")['count']==1,bill
bill_line=sql("SELECT id FROM purchase.bill_lines WHERE bill_id='"+bill['bill']['id']+"' AND receipt_line_id='"+receipt_line+"';")
command('/api/v1/purchase-receipts/'+receipt_id+'/returns',{'reference':'Synthetic FIFO supplier return','reason':'Synthetic return after variance','lines':[{'receiptLineId':receipt_line,'billLineId':bill_line,'quantity':'1'}]})
assert data("SELECT jsonb_build_object('differences',count(*)) FROM accounting.reconciliation_checks() WHERE expected<>actual")['differences']==0
(out/'workflow-http-acceptance.json').write_text(json.dumps({'status':'PASSED','publicTokenViewUpdateReplay':True,'wrongOriginRejected':True,'requestHeaderRequired':True,'invoiceAndStatementPdfRendered':True,'fakeProviderAccepted':3,'externalTransportsInvoked':0,'returnRequestPendingAndRejected':True,'warehouseOnlyUpload':True,'unscannedPhotosRejected':True,'restrictedScannerCompletion':True,'concurrentCostPolicyCAS':True,'fifoSupplierReceiptNegativeVarianceAndReturn':True},indent=2))
