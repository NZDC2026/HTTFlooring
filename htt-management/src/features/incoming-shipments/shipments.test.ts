import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let directory:string;
let security:InstanceType<typeof import("../../../electron/security/localSecurity").LocalSecurity>;
let host:InstanceType<typeof import("../../../electron/security/businessHost").BusinessHost>;
const admin={username:"shipment.admin",displayName:"Shipment reviewer",password:"Shipment-password-test-4821"};
const command=(repository:string,method:string,...args:unknown[])=>host.command({repository,method,args}).result as any;
const records=(name:string)=>host.view().repositories[name] as any;

async function restart() {
    vi.resetModules();
    const {LocalSecurity}=await import("../../../electron/security/localSecurity");
    const {BusinessHost}=await import("../../../electron/security/businessHost");
    security=new LocalSecurity(join(directory,"security.json"));
    security.login(admin);
    host=new BusinessHost(join(directory,"business.json"),security);
    await host.initialize();
}
beforeEach(async()=>{
    vi.resetModules();
    vi.stubGlobal("__HTT_MAIN_HOST__",true);
    vi.stubGlobal("window",undefined);
    vi.stubGlobal("localStorage",undefined);
    directory=mkdtempSync(join(tmpdir(),"htt-shipment-"));
    const {LocalSecurity}=await import("../../../electron/security/localSecurity");
    const {BusinessHost}=await import("../../../electron/security/businessHost");
    security=new LocalSecurity(join(directory,"security.json"));
    security.setup(admin);
    host=new BusinessHost(join(directory,"business.json"),security);
    await host.initialize();
});
afterEach(()=>{
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    rmSync(directory,{recursive:true,force:true});
});
function order(sent=true) {
    const product=records("products").products[0];
    const row=command("purchaseOrders","create",{
        supplierId:records("suppliers").suppliers[0].id,orderDate:"2026-11-01",expectedDeliveryDate:"2026-11-18",
        lines:[{productId:product.id,unitId:product.baseUnitId,orderedQuantity:2,unitCost:100}],
    });
    const approved=command("purchaseOrders","approve",row.id);
    return sent ? command("purchaseOrders","send",row.id) : approved;
}

const shipment=(orders:any[],patch:any={})=>({supplierId:orders[0].supplierId,operationId:crypto.randomUUID(),revision:0,type:'Overseas',container:'MSCU1234567',origin:'Shanghai',destination:'Melbourne',siteId:'site_001',etd:'2026-11-02',eta:'2026-11-18',status:'In Transit',reason:'Agency confirmed departure',lines:orders.map(o=>({purchaseOrderId:o.id,lineId:o.lines[0].id,quantity:2})),...patch});
const saved=()=>records('suppliers').suppliers.flatMap((s:any)=>s.shipments??[]);
it('links multiple POs, snapshots item units and quantities, saves trusted history and restores',async()=>{
 const a=order(),b=order(),input=shipment([a,b]);const row=command('suppliers','saveShipment',input);
 expect(row.lines).toHaveLength(2);expect(row.lines[0]).toMatchObject({sku:a.lines[0].sku,quantity:2,received:0,unit:a.lines[0].unitSymbol});
 expect(row.history[0].actorId).toBe(security.principal()!.userId);
 expect(command('suppliers','saveShipment',input).id).toBe(row.id);
 expect(()=>command('suppliers','saveShipment',{...input,eta:'2026-11-20'})).toThrow(/different/);
 const updated=command('suppliers','saveShipment',{...input,id:row.id,operationId:crypto.randomUUID(),revision:1,eta:'2026-11-21',reason:'Agency advised revised vessel schedule'});
 expect(updated.history[1].previousEta).toBe('2026-11-18');
 expect(()=>command('suppliers','saveShipment',{...input,id:row.id,operationId:crypto.randomUUID(),revision:1})).toThrow(/changed/);
 await restart();expect(saved()[0].lines).toHaveLength(2);expect(saved()[0].eta).toBe('2026-11-21');
});
it('prevents cross-supplier links and allocating the same PO quantity twice',()=>{
 const a=order(),input=shipment([a]);
 expect(()=>command('suppliers','saveShipment',{...input,supplierId:records('suppliers').suppliers[1].id})).toThrow(/belong/);
 command('suppliers','saveShipment',input);
 expect(()=>command('suppliers','saveShipment',{...input,operationId:crypto.randomUUID()})).toThrow(/unallocated/);
 expect(saved()).toHaveLength(1);
});
it('receives multiple POs partially then fully through actual inventory receipts without duplicate retries',async()=>{
 const a=order(),b=order(),input=shipment([a,b]),row=command('suppliers','saveShipment',input);
 const receipt={supplierId:a.supplierId,id:row.id,operationId:crypto.randomUUID(),revision:1,date:'2026-11-06',reason:'Counted goods received at warehouse',lines:row.lines.map((l:any)=>({purchaseOrderId:l.purchaseOrderId,lineId:l.lineId,quantity:1}))};
 const received=command('suppliers','receiveShipment',receipt);
 expect(received.lines.map((l:any)=>l.received)).toEqual([1,1]);
 const count=records('goodsReceipts').goodsReceipts.length;
 command('suppliers','receiveShipment',receipt);expect(records('goodsReceipts').goodsReceipts).toHaveLength(count);
 expect(records('purchaseOrders').purchaseOrders.find((o:any)=>o.id===a.id).lines[0].receivedQuantity).toBe(1);
 const {shipmentStatus}=await import('./shipmentModel');expect(shipmentStatus(received,'2026-11-06')).toBe('Partially Received');
 const done=command('suppliers','receiveShipment',{...receipt,operationId:crypto.randomUUID(),revision:2});expect(shipmentStatus(done,'2026-11-06')).toBe('Received');
 expect(()=>command('suppliers','receiveShipment',{...receipt,operationId:crypto.randomUUID(),revision:3})).toThrow(/exceeds/);
 await restart();expect(saved()[0].lines.every((l:any)=>l.received===2)).toBe(true);
});
it('rolls back all receipt and inventory changes when a later PO receipt fails',()=>{
 const a=order(),b=order(false),row=command('suppliers','saveShipment',shipment([a,b]));const before=host.exportBackup().repositories;
 expect(()=>command('suppliers','receiveShipment',{supplierId:a.supplierId,id:row.id,operationId:crypto.randomUUID(),revision:1,date:'2026-11-06',reason:'Attempt receiving all linked purchase orders',lines:row.lines.map((l:any)=>({purchaseOrderId:l.purchaseOrderId,lineId:l.lineId,quantity:1}))})).toThrow(/Only sent/);
 expect(host.exportBackup().repositories).toEqual(before);
});
it('denies unauthorized shipment changes and validates dates and quantities',()=>{
 const a=order();expect(()=>command('suppliers','saveShipment',shipment([a],{eta:'2026-10-01'}))).toThrow(/ETA/);
 expect(()=>command('suppliers','saveShipment',shipment([a],{lines:[{purchaseOrderId:a.id,lineId:a.lines[0].id,quantity:-1}]}))).toThrow();
 const user=security.createUser({username:'ship.audit',displayName:'Auditor',password:admin.password,roles:['AUDITOR']});const input=shipment([a]);security.login({username:user.username,password:admin.password});expect(()=>command('suppliers','saveShipment',input)).toThrow(/Permission denied/);
});
it('allows a local purchase to receive and bill directly without creating a shipment',async()=>{
 const po=order();
 command('goodsReceipts','create',{purchaseOrderId:po.id,siteId:'site_001',receiptDate:'2026-11-06',supplierDeliveryReference:'Local delivery',notes:'Local purchase delivered directly',lines:[{purchaseOrderLineId:po.lines[0].id,receivedQuantity:2}]});
 const bill=command('supplierBills','create',{purchaseOrderId:po.id,supplierInvoiceNumber:'LOCAL-SAMPLE-TEST-001',billDate:'2026-11-06',dueDate:'2026-12-06',lines:[{purchaseOrderLineId:po.lines[0].id,quantity:2,unitCost:100}]});
 expect(bill.purchaseOrderId).toBe(po.id);expect(saved()).toHaveLength(0);
 expect(records('purchaseOrders').purchaseOrders.find((p:any)=>p.id===po.id).lines[0].receivedQuantity).toBe(2);
 await restart();expect(saved()).toHaveLength(0);expect(records('supplierBills').supplierBills.some((b:any)=>b.id===bill.id)).toBe(true);
});

it('records Arrived without receiving stock and allows subsequent goods receiving',()=>{
 const po=order(),before=JSON.stringify(records('stock'));const row=command('suppliers','saveShipment',shipment([po],{status:'Arrived'}));expect(row.status).toBe('Arrived');expect(JSON.stringify(records('stock'))).toBe(before);
 const received=command('suppliers','receiveShipment',{supplierId:row.supplierId,id:row.id,revision:row.revision,operationId:crypto.randomUUID(),date:'2026-11-07',reason:'Warehouse checked arrived goods',lines:[{purchaseOrderId:po.id,lineId:po.lines[0].id,quantity:1}]});expect(received.lines[0].received).toBe(1);
});

it('saves multiple manual containers atomically, issues their POs and retains independent invoice references',async()=>{
 const product=records('products').products[0],supplier=records('suppliers').suppliers[0],operationId=crypto.randomUUID();
 const input={operationId,supplierId:supplier.id,houseBill:'HBL-MULTI-001',remark:'Three container shipment',draft:false,containers:[0,1].map(i=>({operationId:crypto.randomUUID(),number:'MULTI-'+i,size:'20GP',etd:'',eta:'2030-12-31',status:'In Transit',invoiceNumber:'INV-MULTI-'+i,invoiceAmount:200+i*100,lines:[{productId:product.id,unitId:product.baseUnitId,quantity:2,unitPrice:100+i*50}]}))};
 const before=records('purchaseOrders').purchaseOrders.length;const result=command('suppliers','saveContainerPurchase',input);expect(result).toHaveLength(2);expect(new Set(result.map((r:any)=>r.purchaseNumber)).size).toBe(1);expect(result.map((r:any)=>r.invoiceNumber)).toEqual(['INV-MULTI-0','INV-MULTI-1']);expect(result.every((r:any)=>r.houseBill==='HBL-MULTI-001'&&r.lines[0].received===0)).toBe(true);expect(records('purchaseOrders').purchaseOrders).toHaveLength(before+2);expect(command('suppliers','saveContainerPurchase',input).map((r:any)=>r.id)).toEqual(result.map((r:any)=>r.id));expect(records('purchaseOrders').purchaseOrders).toHaveLength(before+2);await restart();expect(saved().filter((s:any)=>s.purchaseOperationId===operationId)).toHaveLength(2);expect(host.prepareRestore(JSON.stringify(host.exportBackup())).token).toBeTruthy();
});
it('rolls back newly generated POs when a later container cannot be linked',()=>{
 const product=records('products').products[0],supplier=records('suppliers').suppliers[0];const before=structuredClone(records('purchaseOrders'));
 expect(()=>command('suppliers','saveContainerPurchase',{operationId:crypto.randomUUID(),supplierId:supplier.id,houseBill:'HBL-ROLLBACK',remark:'Check atomic purchase',draft:false,containers:[{operationId:crypto.randomUUID(),number:'ROLLBACK-A',size:'20GP',etd:'',eta:'2030-12-31',status:'In Transit',invoiceNumber:'A',invoiceAmount:200,lines:[{productId:product.id,unitId:product.baseUnitId,quantity:2,unitPrice:100}]},{operationId:crypto.randomUUID(),number:'ROLLBACK-B',size:'20GP',etd:'',eta:'2030-12-31',status:'In Transit',invoiceNumber:'B',invoiceAmount:200,lines:[{productId:product.id,unitId:product.baseUnitId,quantity:2,unitPrice:100,purchaseOrderId:'missing-po',lineId:'missing-line'}]}]})).toThrow();expect(records('purchaseOrders')).toEqual(before);expect(saved()).toHaveLength(0);
});
it('keeps manual draft containers unreceived and finalizes their draft PO before activation',()=>{
 const product=records('products').products[0],supplier=records('suppliers').suppliers[0];const [draft]=command('suppliers','saveContainerPurchase',{operationId:crypto.randomUUID(),supplierId:supplier.id,houseBill:'HBL-DRAFT',remark:'Draft container purchase',draft:true,containers:[{operationId:crypto.randomUUID(),number:'DRAFT-C',size:'40HQ',etd:'',eta:'2030-12-31',status:'In Transit',invoiceNumber:'INV-DRAFT',invoiceAmount:200,lines:[{productId:product.id,unitId:product.baseUnitId,quantity:2,unitPrice:100}]}]});expect(draft.status).toBe('Draft');expect(records('purchaseOrders').purchaseOrders.find((p:any)=>p.id===draft.lines[0].purchaseOrderId).status).toBe('DRAFT');const {id,revision,supplierId,type,container,origin,destination,siteId,etd,eta}=draft;const active=command('suppliers','saveShipment',{id,revision,supplierId,type,container,origin,destination,siteId,etd,eta,operationId:crypto.randomUUID(),status:'In Transit',reason:'Activate saved draft',lines:draft.lines.map(({purchaseOrderId,lineId,quantity}:any)=>({purchaseOrderId,lineId,quantity}))});expect(active.status).toBe('In Transit');expect(active.houseBill).toBe('HBL-DRAFT');expect(active.invoiceNumber).toBe('INV-DRAFT');expect(records('purchaseOrders').purchaseOrders.find((p:any)=>p.id===draft.lines[0].purchaseOrderId).status).toBe('SENT');
});

it('saves equal-container costs and finalises received containers only without reposting inventory',()=>{
 const a=order(),b=order(),first=command('suppliers','saveShipment',shipment([a],{purchaseNumber:'PB-COST-01',container:'COST-A'})),second=command('suppliers','saveShipment',shipment([b],{purchaseNumber:'PB-COST-01',container:'COST-B',lines:[{purchaseOrderId:b.id,lineId:b.lines[0].id,quantity:1}]}));
 const draft={freight:2800,customs:650,scope:'selected',excluded:[]},input={groupId:'PB-COST-01',draft,revisions:{[first.id]:1,[second.id]:1},finalise:[],operationId:crypto.randomUUID()};const costs=command('suppliers','saveShipmentCosts',input);expect(costs.containers.map((c:any)=>c.share)).toEqual([1725,1725]);expect(()=>command('suppliers','saveShipmentCosts',{...input,operationId:crypto.randomUUID(),revisions:{[first.id]:2,[second.id]:2},finalise:[first.id]})).toThrow(/received/);
 const received=command('suppliers','receiveShipment',{supplierId:first.supplierId,id:first.id,revision:2,operationId:crypto.randomUUID(),date:'2026-11-07',reason:'Goods inspected and received',lines:[{purchaseOrderId:a.id,lineId:a.lines[0].id,quantity:2}]}),before=structuredClone(records('goodsReceipts'));
 command('suppliers','saveShipmentCosts',{...input,operationId:crypto.randomUUID(),revisions:{[first.id]:received.revision,[second.id]:2},finalise:[first.id]});expect(records('goodsReceipts')).toEqual(before);expect(saved().find((s:any)=>s.id===first.id).landedCostFinal).toBeTruthy();expect(saved().find((s:any)=>s.id===second.id).landedCostFinal).toBeUndefined();expect(host.prepareRestore(JSON.stringify(host.exportBackup())).token).toBeTruthy();
 const revisions=Object.fromEntries(saved().map((s:any)=>[s.id,s.revision]));expect(()=>command('suppliers','saveShipmentCosts',{...input,revisions,operationId:crypto.randomUUID(),draft:{...draft,freight:3000}})).toThrow(/locked/);expect(()=>command('suppliers','saveShipment',{...shipment([a]),id:first.id,revision:revisions[first.id],landedCostFinal:''})).toThrow(/controlled/);
});
it('records physical damage without putting damaged goods into stock and preserves total area for cost allocation',async()=>{
 const po=order(),row=command('suppliers','saveShipment',shipment([po]));
 const input={supplierId:row.supplierId,id:row.id,revision:row.revision,operationId:crypto.randomUUID(),date:'2026-11-07',reason:'Warehouse inspection found damaged packaging',lines:[{purchaseOrderId:po.id,lineId:po.lines[0].id,quantity:2,damaged:0.5}]};
 const received=command('suppliers','receiveShipment',input);
 expect(received.lines[0]).toMatchObject({quantity:2,received:2,damaged:0.5});
 expect(records('goodsReceipts').goodsReceipts.at(-1).lines[0].receivedQuantity).toBe(1.5);
 expect(records('purchaseOrders').purchaseOrders.find((p:any)=>p.id===po.id).lines[0].receivedQuantity).toBe(1.5);
 const count=records('goodsReceipts').goodsReceipts.length;command('suppliers','receiveShipment',input);expect(records('goodsReceipts').goodsReceipts).toHaveLength(count);
 const {shipmentCostProducts,allocateContainerCosts}=await import('../procurement/containerCostAllocation');
 const products=shipmentCostProducts([received],[po]);expect(products[0].quantity).toBe(2);
 const result=allocateContainerCosts([{id:received.id,number:received.container,status:'Received'}],products.map(p=>({...p,coverage:2})),{freight:20,customs:0,excluded:[],scope:'selected'});
 expect(result.area).toBe(4);expect(result.lines[0].allocationPerM2).toBe(5);
 await restart();expect(saved()[0].lines[0].damaged).toBe(0.5);
});
it('records an entirely damaged delivery without creating an inventory receipt',()=>{
 const po=order(),row=command('suppliers','saveShipment',shipment([po])),before=structuredClone(records('goodsReceipts'));
 const input={supplierId:row.supplierId,id:row.id,revision:1,operationId:crypto.randomUUID(),date:'2026-11-07',reason:'All goods damaged during transport',lines:[{purchaseOrderId:po.id,lineId:po.lines[0].id,quantity:2,damaged:2}]};
 expect(()=>command('suppliers','receiveShipment',{...input,lines:[{...input.lines[0],damaged:3}]})).toThrow();
 const received=command('suppliers','receiveShipment',input);expect(received.lines[0]).toMatchObject({received:2,damaged:2});expect(records('goodsReceipts')).toEqual(before);
 expect(records('purchaseOrders').purchaseOrders.find((p:any)=>p.id===po.id).lines[0].receivedQuantity).toBe(0);
});
it('restores receiving drafts without posting inventory and clears draft after confirmation',async()=>{
 const po=order(),row=command('suppliers','saveShipment',shipment([po])),before=structuredClone(records('goodsReceipts'));
 const input={supplierId:row.supplierId,id:row.id,revision:1,operationId:crypto.randomUUID(),date:'2026-11-07',reason:'Receiving inspection draft',lines:[{purchaseOrderId:po.id,lineId:po.lines[0].id,quantity:1,damaged:0.25}]};
 const draft=command('suppliers','saveReceivingDraft',input);expect(draft.revision).toBe(2);expect(records('goodsReceipts')).toEqual(before);expect(draft.lines[0].received).toBe(0);
 command('suppliers','saveReceivingDraft',input);expect(saved()[0].revision).toBe(2);
 await restart();expect(JSON.parse(saved()[0].receivingDraft).lines[0].damaged).toBe(.25);
 expect(()=>command('suppliers','saveReceivingDraft',{...input,operationId:crypto.randomUUID()})).toThrow(/changed/);
 const received=command('suppliers','receiveShipment',{...input,revision:2,operationId:crypto.randomUUID()});expect(received.receivingDraft).toBeUndefined();expect(received.lines[0]).toMatchObject({received:1,damaged:.25});
});
it('lets warehouse save receiving drafts and shipment photographs, preserves them in backups and denies auditors',async()=>{
 const po=order(),row=command('suppliers','saveShipment',shipment([po]));
 const warehouse=security.createUser({username:'receiving.warehouse',displayName:'Warehouse receiver',password:admin.password,roles:['WAREHOUSE']});security.login({username:warehouse.username,password:admin.password});
 const input={supplierId:row.supplierId,id:row.id,revision:1,operationId:crypto.randomUUID(),date:'2026-11-07',reason:'Warehouse draft inspection',lines:[{purchaseOrderId:po.id,lineId:po.lines[0].id,quantity:1,damaged:0}]};
 command('suppliers','saveReceivingDraft',input);
 const doc=command('attachments','upload',{operationId:crypto.randomUUID(),expectedRevision:0,target:{kind:'Shipment',id:row.id},title:'Receiving evidence',reason:'Warehouse receiving photograph',file:{name:'receiving.txt',content:Buffer.from('Isolated receiving attachment test').toString('base64')}});
 expect(doc.target.id).toBe(row.id);security.login(admin);const backup=host.exportBackup(),restore=host.prepareRestore(JSON.stringify(backup));await host.restoreBackup(restore.token);await restart();
 expect(records('attachments').documents.find((d:any)=>d.id===doc.id).target.kind).toBe('Shipment');
 const auditor=security.createUser({username:'receiving.auditor',displayName:'Auditor',password:admin.password,roles:['AUDITOR']});security.login({username:auditor.username,password:admin.password});
 expect(()=>command('suppliers','saveReceivingDraft',{...input,revision:2,operationId:crypto.randomUUID()})).toThrow(/Permission denied/);
});
it('saves date-only edits with revision checks and rejects changes to other fields',()=>{
 const po=order(),row=command('suppliers','saveShipment',shipment([po])),before=structuredClone(row.lines);
 const input={supplierId:row.supplierId,id:row.id,operationId:crypto.randomUUID(),revision:1,etd:'2026-11-03',eta:'2026-11-19'};
 const updated=command('suppliers','saveShipmentDates',input);expect(updated.lines).toEqual(before);expect(updated.container).toBe(row.container);expect(updated.eta).toBe('2026-11-19');expect(updated.revision).toBe(2);
 expect(command('suppliers','saveShipmentDates',input).revision).toBe(2);
 expect(()=>command('suppliers','saveShipmentDates',{...input,operationId:crypto.randomUUID()})).toThrow(/changed/);
 expect(()=>command('suppliers','saveShipmentDates',{...input,revision:2,operationId:crypto.randomUUID(),container:'Forged'})).toThrow();
 expect(()=>command('suppliers','saveShipmentDates',{...input,revision:2,operationId:crypto.randomUUID(),etd:'2026-11-21'})).toThrow(/ETA/);
});
it('saves the shipment product page atomically and preserves received quantities',async()=>{
 const a=order(),b=order(),first=shipment([a],{purchaseNumber:'PB-PRODUCT-EDIT'}),second=shipment([b],{purchaseNumber:'PB-PRODUCT-EDIT',container:'TCLU7654321'}),one=command('suppliers','saveShipment',first),two=command('suppliers','saveShipment',second);
 const oneInput={...first,id:one.id,revision:1,operationId:crypto.randomUUID(),houseBill:'HBL-EDIT',invoiceNumber:'INV-EDIT-1',invoiceAmount:200,remark:'Updated shipment detail'},twoInput={...second,id:two.id,revision:1,operationId:crypto.randomUUID(),houseBill:'HBL-EDIT',lines:[{...second.lines[0],quantity:20}]};
 const before=host.exportBackup().repositories;
 expect(()=>command('suppliers','saveShipmentGroup',{groupId:first.purchaseNumber,shipments:[oneInput,twoInput]})).toThrow(/quantity/);expect(host.exportBackup().repositories).toEqual(before);
 const updated=command('suppliers','saveShipmentGroup',{groupId:first.purchaseNumber,shipments:[oneInput,{...twoInput,lines:second.lines}]});expect(updated.map((s:any)=>s.revision)).toEqual([2,2]);expect(updated[0].invoiceNumber).toBe('INV-EDIT-1');
 const received=command('suppliers','receiveShipment',{supplierId:one.supplierId,id:one.id,revision:2,operationId:crypto.randomUUID(),date:'2026-11-07',reason:'Warehouse receiving inspection',lines:[{...first.lines[0],quantity:1,damaged:0}]});
 expect(()=>command('suppliers','saveShipmentGroup',{groupId:first.purchaseNumber,shipments:[{...oneInput,revision:received.revision,operationId:crypto.randomUUID(),lines:[{...first.lines[0],quantity:1}]},{...twoInput,operationId:crypto.randomUUID(),revision:2,lines:second.lines}]})).toThrow(/locked/);
 await restart();expect(saved().find((s:any)=>s.id===one.id).lines[0].received).toBe(1);expect(saved().find((s:any)=>s.id===one.id).remark).toBe('Updated shipment detail');
});
it('links the correct materials invoice when saving costs without posting another financial record',async()=>{
 const po=order(),row=command('suppliers','saveShipment',shipment([po]));
 const received=command('suppliers','receiveShipment',{supplierId:row.supplierId,id:row.id,revision:1,operationId:crypto.randomUUID(),date:'2026-11-07',reason:'Goods checked at destination warehouse',lines:[{...shipment([po]).lines[0],quantity:2,damaged:0}]});
 const invoice=command('supplierBills','create',{purchaseOrderId:po.id,supplierInvoiceNumber:'MAT-LINK-108',billDate:'2026-11-07',dueDate:'2026-12-07',lines:[{purchaseOrderLineId:po.lines[0].id,quantity:2,unitCost:100}]}),before=structuredClone(records('supplierBills'));
 const draft={freight:20,customs:5,excluded:[],scope:'selected',materialInvoiceIds:{[row.id]:invoice.id}};
 const input={groupId:row.id,revisions:{[row.id]:received.revision},operationId:crypto.randomUUID(),finalise:[],draft};
 expect(()=>command('suppliers','saveShipmentCosts',{...input,draft:{...draft,materialInvoiceIds:{[row.id]:'missing'}}})).toThrow(/invoice/);
 command('suppliers','saveShipmentCosts',input);expect(saved()[0].invoiceBillId).toBe(invoice.id);expect(saved()[0].invoiceNumber).toBe('MAT-LINK-108');expect(records('supplierBills')).toEqual(before);
 await restart();expect(saved()[0].invoiceBillId).toBe(invoice.id);
 const current=saved()[0];command('suppliers','saveShipmentGroup',{groupId:row.id,shipments:[shipment([po],{id:row.id,revision:current.revision,invoiceNumber:'CORRECTED-INVOICE-REFERENCE'})]});
 expect(saved()[0].invoiceBillId).toBeUndefined();expect(JSON.parse(saved()[0].landedCostDraft).materialInvoiceIds[row.id]).toBeUndefined();
});
