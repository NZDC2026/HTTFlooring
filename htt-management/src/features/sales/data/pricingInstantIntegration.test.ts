import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let root: string, security: InstanceType<typeof import('../../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'documents.admin', displayName: 'Document acceptance', password: 'Documents-test-password-4821' };
async function restart() { vi.resetModules(); const { LocalSecurity } = await import('../../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.login(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); }
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-pricing-instant-')); const { LocalSecurity } = await import('../../../../electron/security/localSecurity'); const { BusinessHost } = await import('../../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const state = (key: string) => host.view().repositories[key] as any;
function payload(at?: string, kind: 'ORDER' | 'INVOICE' = 'INVOICE') {
    const product = state('products').products[0], customer = state('customers').customers[0];
    return { kind, customerId:customer.id, documentDate:'2026-10-21', dueDate:'2026-11-21', ...(at ? {pricingAt:at} : {}), lines:[{productId:product.id,unitId:product.baseUnitId,quantity:2}] };
}
function offer(overrides: Record<string,string> = {}) {
    const p = payload();
    return cmd('workspace_promotions','save',{name:'Intraday acceptance',status:'Active',productId:p.lines[0].productId,unitId:p.lines[0].unitId,customerId:p.customerId,starts:'2026-10-21T09:00:00+13:00',ends:'2026-10-21T18:00:00+13:00',price:'12',priority:'10',policy:'Promotion first',...overrides});
}
const save = (p = payload(), operationId: string = crypto.randomUUID()) => cmd('managedSalesDocuments','save',{operationId,payload:p});
const quote = (at: string) => cmd('sales','createQuote',payload(at));
it('evaluates actual quote commands at inclusive start and exclusive end rather than UTC midnight', () => {
    const promotion = offer();
    const before = quote('2026-10-21T08:59:59+13:00'), start = quote('2026-10-21T09:00:00+13:00'), during = quote('2026-10-21T10:00:00+13:00'), end = quote('2026-10-21T18:00:00+13:00');
    expect(before.lines[0].promotionId).toBeUndefined();
    for (const q of [start,during]) expect(q.lines[0]).toMatchObject({unitPrice:12,priceSource:'PROMOTIONAL_PRICE',promotionId:promotion.id,pricingTimezone:'Pacific/Auckland'});
    expect(start.lines[0].pricingAt).toBe('2026-10-20T20:00:00.000Z');
    expect(end.lines[0].promotionId).toBeUndefined();
});
it('prices every line at the same captured current time and freezes a successful retry across clock changes and restart', async () => {
    vi.useFakeTimers({toFake:['Date']}); vi.setSystemTime(new Date('2026-10-20T21:00:00Z'));
    offer(); const p = payload(); p.lines.push({...p.lines[0],quantity:3});
    const d = save(p,'same-command');
    expect(d.lines.map((l:any)=>l.pricingAt)).toEqual(['2026-10-20T21:00:00.000Z','2026-10-20T21:00:00.000Z']);
    expect(d.lines.every((l:any)=>l.unitPrice===12)).toBe(true);
    vi.setSystemTime(new Date('2026-10-21T10:00:00Z')); security.login(admin);
    expect(save(p,'same-command')).toEqual(d);
    vi.useRealTimers(); await restart();
    expect(save(p,'same-command')).toEqual(d);
    expect(state('managedSalesDocuments').drafts).toHaveLength(1);
    expect(()=>save({...p,pricingAt:'2026-10-21T18:00:00+13:00'},'same-command')).toThrow(/different/);
});
it.each(['ORDER','INVOICE'] as const)('retains approved %s prices and evidence on post after promotion changes, then reloads', async kind => {
    const promo = offer(), d = save(payload('2026-10-21T10:00:00+13:00',kind));
    const approved = cmd('managedSalesDocuments','approve',d.id,d.revision);
    cmd('workspace_promotions','save',{...promo,price:'99',status:'Inactive'},promo.revision);
    const posted = cmd('managedSalesDocuments','post',d.id,approved.revision);
    expect(cmd('managedSalesDocuments','post',d.id,approved.revision)).toEqual(posted);
    await restart();
    const document = (kind==='ORDER'?state('sales').salesOrders:state('sales').invoices).find((v:any)=>v.id===posted.documentId);
    expect(document.lines).toEqual(d.lines);
    expect(document.lines[0]).toMatchObject({unitPrice:12,promotionId:promo.id});
});
it('copies quote pricing evidence through order and invoice without repricing against changed rules', async () => {
    const promo = offer(), q = quote('2026-10-21T10:00:00+13:00');
    cmd('sales','sendQuote',q.id); cmd('sales','acceptQuote',q.id);
    cmd('workspace_promotions','save',{...promo,price:'99'},promo.revision);
    const order = cmd('sales','convertQuoteToOrder',q.id), invoice = cmd('sales','createInvoiceFromOrder',order.id);
    expect(order.lines).toEqual(q.lines); expect(invoice.lines).toEqual(q.lines);
    expect(()=>cmd('sales','updateDraftQuote',q.id,{documentDate:q.documentDate,lines:q.lines})).toThrow(/draft/);
    await restart(); expect(state('sales').invoices.find((i:any)=>i.id===invoice.id).lines).toEqual(q.lines);
});
it('recalculates automatic quote edits in the main process and preserves promotion attribution, while manual overrides win', () => {
    const promo = offer(), q = quote('2026-10-21T08:00:00+13:00');
    const edit = {documentDate:q.documentDate,pricingAt:'2026-10-21T10:00:00+13:00',lines:[{...q.lines[0],lineId:q.lines[0].id,unitPrice:0,standardUnitPrice:0,priceSource:'STANDARD_PRICE'}]};
    const changed = cmd('sales','updateDraftQuote',q.id,edit);
    expect(changed.lines[0]).toMatchObject({id:q.lines[0].id,unitPrice:12,promotionId:promo.id,priceSource:'PROMOTIONAL_PRICE'});
    const manual = cmd('sales','updateDraftQuote',q.id,{...edit,lines:[{...edit.lines[0],unitPrice:33,priceSource:'MANUAL'}]});
    expect(manual.lines[0]).toMatchObject({unitPrice:33,priceSource:'MANUAL'}); expect(manual.lines[0].promotionId).toBeUndefined();
    const ended = cmd('sales','updateDraftQuote',q.id,{...edit,pricingAt:'2026-10-21T18:00:00+13:00'});
    expect(ended.lines[0].promotionId).toBeUndefined();
});
it('keeps customer date pricing on the local document date even when the pricing UTC date is yesterday', async () => {
    const {customerPricingRepository} = await import('../../contacts/data/customerPricingRepository');
    const resolve = vi.spyOn(customerPricingRepository,'resolveBasePrice');
    offer(); const q = quote('2026-10-21T09:00:00+13:00');
    expect(q.lines[0].promotionId).toBeDefined();
    expect(resolve).toHaveBeenCalledWith(q.customerId,q.lines[0].productId,q.lines[0].unitId,'2026-10-21');
});
it('rejects malformed, offsetless and wrong-business-date times without durable mutation, then permits corrected retry', () => {
    offer(); const before = readFileSync(join(root,'business.json'),'utf8');
    for (const at of ['invalid','2026-10-21T10:00:00','2026-10-21T23:00:00Z','2026-02-30T10:00:00Z']) {
        expect(()=>save(payload(at),'correctable')).toThrow();
        expect(()=>quote(at)).toThrow();
        expect(readFileSync(join(root,'business.json'),'utf8')).toBe(before);
    }
    expect(save(payload('2026-10-21T10:00:00+13:00'),'correctable').lines[0].unitPrice).toBe(12);
});
it('does not trust a renderer timezone and preserves saved timezone after company settings change', async () => {
    offer(); const p = payload('2026-10-21T10:00:00+13:00');
    const d = cmd('managedSalesDocuments','save',{operationId:'timezone',payload:{...p,pricingTimezone:'UTC'}});
    expect(d.payload.pricingTimezone).toBe('Pacific/Auckland');
    const {businessSettings} = await import('../../business-workspace/configurationState');
    cmd('workspace_settings','save',{...businessSettings(),name:'Company',section:'business',timezone:'America/Los_Angeles',status:'Active'});
    const edited = cmd('managedSalesDocuments','save',{operationId:'edit',id:d.id,expectedRevision:d.revision,payload:d.payload});
    expect(edited.lines).toEqual(d.lines.map((l:any)=>({...l,id:edited.lines[0].id})));
    expect(edited.payload.pricingTimezone).toBe('Pacific/Auckland');
    await restart(); expect(state('managedSalesDocuments').drafts[0].payload.pricingTimezone).toBe('Pacific/Auckland');
});
it('rejects corrupted snapshot evidence on restore while old documents without pricing metadata remain untouched', async () => {
    const d = save(payload('2026-10-21T10:00:00+13:00'));
    const {validateRegisteredSnapshots} = await import('../../security/repositoryHost');
    for (const change of [(v:any)=>delete v.managedSalesDocuments.drafts[0].lines[0].pricingTimezone,(v:any)=>v.managedSalesDocuments.drafts[0].lines[0].pricingAt='2026-10-22T00:00:00Z']) {
        const snapshots = structuredClone(host.view().repositories); change(snapshots); expect(()=>validateRegisteredSnapshots(snapshots)).toThrow(/pricing|Pricing/);
    }
    const snapshots = structuredClone(host.view().repositories) as any;
    for(const line of snapshots.managedSalesDocuments.drafts[0].lines) { delete line.pricingAt; delete line.pricingTimezone; }
    delete snapshots.managedSalesDocuments.drafts[0].payload.pricingAt; delete snapshots.managedSalesDocuments.drafts[0].payload.pricingTimezone;
    expect(()=>validateRegisteredSnapshots(snapshots)).not.toThrow();
    expect(state('managedSalesDocuments').drafts[0]).toEqual(d);
    const old = state('sales').invoices.find((i:any)=>!i.managedDraftId);
    if(old) expect(old.lines[0].pricingAt).toBeUndefined();
});
it('generates recurrence on its own occurrence date using frozen net prices and retains operation recovery', () => {
    offer(); const d = save(payload('2026-10-21T10:00:00+13:00'));
    const s = cmd('recurringInvoices','create',{operationId:'repeat',name:'Frozen source',sourceDraftId:d.id,frequency:'Monthly',firstDate:'2026-09-21',endDate:'2026-10-21'});
    const args = {id:s.id,expectedRevision:s.revision,date:s.nextDate};
    const result = cmd('recurringInvoices','generate',args);
    expect(result.draft.payload.documentDate).toBe('2026-09-21');
    expect(result.draft.lines[0]).toMatchObject({unitPrice:12,priceSource:'MANUAL',pricingAt:'2026-09-20T12:00:00.000Z'});
    expect(cmd('recurringInvoices','generate',args).draft).toEqual(result.draft);
});
