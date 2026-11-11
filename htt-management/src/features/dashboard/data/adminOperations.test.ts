import {expect,it} from 'vitest';
import {adminTaskSamples,teamTaskOverview,teamTaskBucket,adminApprovalSamples,adminApprovalRows,approvalKinds} from './adminOperations';
import type {HubTask} from '../../task-hub/taskHubModel';
it('counts 26 isolated sample tasks and partitions chart segments without double-counting overdue work',()=>{
 const tasks=adminTaskSamples('2026-11-12','me'),summary=teamTaskOverview(tasks,'2026-11-12','me');
 expect(summary).toMatchObject({total:26,mine:8,overdue:5,completed:14});
 expect(summary.buckets.reduce((n,b)=>n+b.count,0)).toBe(26);
 expect(tasks.every(t=>t.source==='sample')).toBe(true);
 const completed=tasks.map((t,i)=>i===0?{...t,status:'Completed'}:t),after=teamTaskOverview(completed,'2026-11-12','me');
 expect(after.completed).toBe(15);expect(after.overdue).toBe(4);expect(after.total).toBe(26);
});
it('uses due dates for mutually exclusive workload categories and excludes inactive tasks',()=>{
 const base={status:'In progress',due:'2026-11-11'} as HubTask;
 expect(teamTaskBucket(base,'2026-11-12')).toBe('Overdue');
 expect(teamTaskBucket({...base,due:'2026-11-12'},'2026-11-12')).toBe('Due Today');
 expect(teamTaskBucket({...base,due:'2026-11-19'},'2026-11-12')).toBe('Due Soon');
 expect(teamTaskBucket({...base,due:'2026-11-20'},'2026-11-12')).toBe('In Progress');
 expect(teamTaskBucket({...base,status:'Completed'},'2026-11-12')).toBe('Completed');
 expect(teamTaskOverview([{...base,status:'Cancelled'},{...base,status:'Inactive'}],'2026-11-12','me').total).toBe(0);
});
it('includes all seven pending example approvals plus every reference category',()=>{
 const rows=adminApprovalSamples('2026-11-12');expect(rows).toHaveLength(7);
 expect(approvalKinds.map(kind=>rows.filter(r=>r.kind===kind).length)).toEqual([1,2,1,1,2]);
 expect(rows.every(r=>r.status==='Pending'&&r.path==='')).toBe(true);
 expect(rows[0]).toMatchObject({amount:12480,date:'2026-11-10'});expect(rows[1].amount).toBe(-2600);
});
it('collects only genuine pending source records and retains their IDs and revisions for review',()=>{
 const input={customers:[{id:'c',status:'ACTIVE',creditHold:true,businessName:'Oak Trade',updatedAt:'2026-11-12T00:00:00Z'},{id:'inactive',status:'INACTIVE',creditHold:true}],credits:[{id:'cn',status:'DRAFT',creditNoteNumber:'CN-1',customerId:'c',creditDate:'2026-11-10',totals:{total:2600}},{id:'issued',status:'ISSUED'}],adjustments:[{id:'adj',status:'DRAFT',number:'ADJ-1',createdBy:'u',date:'2026-11-10',revision:3},{id:'posted',status:'POSTED'}],drafts:[{id:'d',status:'DRAFT',kind:'ORDER',payload:{kind:'ORDER',documentDate:'2026-11-10'},lines:[{discountPercent:5}],history:[{actorId:'u'}],revision:4},{id:'approved',status:'APPROVED'}],payments:[{id:'p',status:'DRAFT',createdBy:'u',reference:'INV-1',paymentDate:'2026-11-12',history:[],allocations:[{supplierBillId:'b',amount:100},{supplierBillId:'b2',amount:50}]},{id:'paid',status:'POSTED'}],bills:[]} as unknown as Parameters<typeof adminApprovalRows>[0];
 const before=JSON.stringify(input),rows=adminApprovalRows(input);expect(rows).toHaveLength(5);
 expect(rows.find(r=>r.source==='payment')).toMatchObject({sourceId:'p',amount:150});
 expect(rows.find(r=>r.source==='discount')).toMatchObject({sourceId:'d',revision:4,path:'/sales/drafts/orders/d'});
 expect(rows.find(r=>r.source==='credit')?.path).toBe('/sales/credit-notes/cn');
 expect(JSON.stringify(input)).toBe(before);
});
