import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let root: string;
let security: InstanceType<typeof import('../../../electron/security/localSecurity').LocalSecurity>;
let host: InstanceType<typeof import('../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'admin.test', displayName: 'Administrator', password: 'Local-test-password-4821' };
beforeEach(async () => {
    vi.resetModules(); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); vi.stubGlobal('__HTT_MAIN_HOST__', true);
    root = mkdtempSync(join(tmpdir(), 'htt-8c-business-'));
    const { LocalSecurity } = await import('../../../electron/security/localSecurity');
    const { BusinessHost } = await import('../../../electron/security/businessHost');
    security = new LocalSecurity(join(root, 'security.json')); security.setup(admin);
    host = new BusinessHost(join(root, 'business.json'), security); await host.initialize();
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); rmSync(root, { recursive: true, force: true }); });
function command(repository: string, method: string, ...args: unknown[]) { return host.command({ repository, method, args }); }

function createPeriod(startDate = '2026-09-01', endDate = '2026-09-30') { return command('accountingPeriods', 'create', { name: startDate.slice(0, 7), startDate, endDate, reason: 'Configure accounting period for acceptance' }).result as any; }
async function restart() {
    vi.resetModules(); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined);
    const { LocalSecurity } = await import('../../../electron/security/localSecurity');
    const { BusinessHost } = await import('../../../electron/security/businessHost');
    security = new LocalSecurity(join(root, 'security.json')); security.login(admin);
    host = new BusinessHost(join(root, 'business.json'), security); await host.initialize();
}

async function injectCost(issue:'difference'|'duplicate'){
 const {snapshotRepositories,restoreRepositories}=await import('./repositoryHost');
 const state=snapshotRepositories() as Record<string,any>;const {mockProducts}=await import('../inventory/data/mockProducts'),{inventorySiteRepository}=await import('../inventory/data/inventorySiteRepository');
 const product=mockProducts[0],site=inventorySiteRepository.getActive()[0];
 const cost={id:'g17-cost',costMovementNumber:'G17-COST',movementType:'RECEIPT',siteId:site.id,productId:product.id,baseUnitId:product.baseUnitId,quantityBase:1,unitCostBase:100,valueChange:100,quantityAfter:1,averageCostAfter:100,inventoryValueAfter:100,referenceType:'MANUAL',occurredAt:'2026-09-15T00:00:00Z',createdAt:'2026-09-15T00:00:00Z'};
 state.costMovements.movements=[cost,...(issue==='duplicate'?[{...cost,quantityBase:-1,valueChange:-100}]:[])];restoreRepositories(state);return state;
}
it.each(['difference','duplicate'] as const)('retains trusted close rejection and dated review path for inventory %s',async kind=>{
 const period=createPeriod();await injectCost(kind);
 const check=command('accountingPeriods','preflight',period.id).result as any;
 const before=readFileSync(join(root,'business.json'),'utf8');
 const code=kind==='difference'?'INVENTORY_DIFFERENCE':'INVENTORY_CHECK_FAILED';expect(check.blockers).toContainEqual(expect.objectContaining({code,path:'/inventory/reconciliation?asOf=2026-09-30'}));
 expect(()=>command('accountingPeriods','close',{id:period.id,reason:'G17 inventory close must be blocked'})).toThrow(/Period cannot close/);
 // Preflight uses the existing command persistence contract; failed close preserves its result.
 const saved=JSON.parse(readFileSync(join(root,'business.json'),'utf8'));
 expect(saved.repositories.accountingPeriods.periods[0].status).toBe('OPEN');expect(readFileSync(join(root,'business.json'),'utf8')).toBe(before);
 expect(security.listAudit({query:'accountingPeriods.close'}).rows.some(row=>row.outcome==='FAILED')).toBe(true);
});
it('keeps valid pre-cutoff inventory controls stable over a real restart',async()=>{
 const period=createPeriod();const check=command('accountingPeriods','preflight',period.id).result as any;expect(check.blockers).toEqual([]);await restart();expect(command('accountingPeriods','preflight',period.id).result).toEqual(check);command('accountingPeriods','close',{id:period.id,reason:'G17 clean inventory close acceptance'});expect((host.view().repositories.accountingPeriods as any).periods[0].status).toBe('CLOSED');
});
