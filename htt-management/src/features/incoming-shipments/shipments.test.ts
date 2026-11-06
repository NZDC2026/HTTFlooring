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
