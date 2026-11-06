import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

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
const update=(id:string,patch={})=>command("purchaseOrders","updateEta",{
    id,operationId:crypto.randomUUID(),expectedRevision:0,eta:"2026-11-21",reason:"Agency confirmed a vessel delay.",...patch,
});

it("copies the existing PO date, saves a trusted manual history and persists after restart without financial changes",async()=>{
    const row=order();
    expect(row.expectedDeliveryDate).toBe("2026-11-18");
    const before=structuredClone(host.view().repositories);
    delete before.purchaseOrders;
    delete (before.financialCache as Record<string,unknown>).purchaseOrders;
    const changed=update(row.id);
    expect(changed.etaHistory).toHaveLength(1);
    expect(changed.etaHistory[0]).toMatchObject({
        previousEta:"2026-11-18",eta:"2026-11-21",reason:"Agency confirmed a vessel delay.",
        actorId:security.principal()!.userId,actorName:admin.displayName,
    });
    const after=structuredClone(host.view().repositories);
    delete after.purchaseOrders;
    delete (after.financialCache as Record<string,unknown>).purchaseOrders;
    expect(after).toEqual(before);
    await restart();
    expect(records("purchaseOrders").purchaseOrders.find((p:any)=>p.id===row.id).etaHistory).toEqual(changed.etaHistory);
});
it("prevents stale updates, preserves every revision and retries an acknowledged update once",()=>{
    const row=order(),operationId=crypto.randomUUID();
    const first=update(row.id,{operationId});
    expect(update(row.id,{operationId}).etaHistory).toHaveLength(1);
    expect(()=>update(row.id)).toThrow(/changed/);
    expect(()=>update(row.id,{operationId,eta:"2026-11-22"})).toThrow(/different/);
    const second=update(row.id,{expectedRevision:1,eta:"2026-11-23",reason:"Agency confirmed the final arrival slot."});
    expect(second.etaHistory).toHaveLength(2);
    expect(second.etaHistory[1].previousEta).toBe(first.expectedDeliveryDate);
});
it("requires a reason and valid date, rejects forged actors and blocks cancelled orders",()=>{
    const row=order();
    for(const patch of [{reason:""},{eta:"2026-02-30"},{eta:"2026-10-31"},{eta:"2026-11-18"},{actorId:"forged"}])
        expect(()=>update(row.id,patch)).toThrow();
    const cancelled=order(false);
    command("purchaseOrders","cancel",cancelled.id,"Cancelled test order");
    expect(()=>update(cancelled.id)).toThrow(/ETA can be updated/);
});
it("denies read-only users at the server boundary",()=>{
    const row=order();
    const user=security.createUser({username:"shipment.auditor",displayName:"Auditor",password:admin.password,roles:["AUDITOR"]});
    security.login({username:user.username,password:admin.password});
    expect(()=>update(row.id)).toThrow(/Permission denied/);
});
it("rolls back a failed save and rejects a corrupted history in a backup",async()=>{
    const row=order(),before=readFileSync(join(directory,"business.json"),"utf8");
    const spy=vi.spyOn(host as any,"persist").mockImplementation(()=>{throw new Error("Injected failure");});
    expect(()=>update(row.id)).toThrow(/Injected failure/);
    spy.mockRestore();
    expect(readFileSync(join(directory,"business.json"),"utf8")).toBe(before);
    await restart();
    update(row.id);
    const backup=host.exportBackup() as any;
    backup.repositories.purchaseOrders.purchaseOrders.find((p:any)=>p.id===row.id).etaHistory[0].eta="2026-11-25";
    delete backup.checksum;
    backup.checksum=createHash("sha256").update(JSON.stringify(backup)).digest("hex");
    expect(()=>host.prepareRestore(JSON.stringify(backup))).toThrow(/ETA/);
});
