import {describe,it,expect} from 'vitest';
import {taskHubRows,taskCounts,taskSamples} from './taskHubModel';
import type {ConfigRow} from '../business-workspace/configurationState';
import type {Supplier} from '../contacts/types/supplier';
describe('shared task hub',()=>{
 it('keeps original customer and supplier task identities and document links',()=>{
 const row={id:'task1',name:'Dispatch',customerId:'c1',owner:'u1',due:'2026-11-10',priority:'Normal',status:'Open',notes:'Pack oak',orderId:'order1',revision:'1',updatedAt:'2026-11-10',createdAt:'2026-11-10'} as ConfigRow;
 const supplier={id:'s1',businessName:'Timber Supplier',activities:[{id:'activity1',kind:'Task',text:'Confirm ETA',actorId:'u2',actorName:'Jamie',at:'2026-11-09',due:'2026-11-11',replies:[],documentType:'Invoice',documentId:'bill1'},{id:'note1',kind:'Note',text:'Not a task'}]} as unknown as Supplier;
 const result=taskHubRows([row],[{id:'c1',businessName:'Oak Customer'}],[supplier]);
 expect(result).toHaveLength(2);expect(result[0].row).toBe(row);expect(result[0].documentPath).toBe('/sales/orders/order1');expect(result[0].priority).toBe('Medium');expect(result[1].activityId).toBe('activity1');expect(result[1].documentPath).toBe('/purchases/bills/bill1');
 });
 it('counts due, overdue, mine and completed in the current week independently',()=>{
 const samples=taskSamples('2026-11-10','u1');expect(taskCounts(samples,'2026-11-10','u1')).toEqual({mine:3,open:7,today:1,overdue:2,completed:1});
 expect(taskCounts(samples.map(r=>({...r,status:'Completed',completedAt:'2026-11-01T10:00:00Z'})),'2026-11-10','u1').completed).toBe(0);
 });
 it('sample records remain isolated and include pending and completed examples',()=>{const samples=taskSamples('2026-11-10','u1');expect(samples.every(r=>r.source==='sample'&&!r.row)).toBe(true);expect(new Set(samples.map(r=>r.status)).size).toBe(3);});
});
