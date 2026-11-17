import {describe,it,expect} from 'vitest';
import {referenceTaskSamples,dashboardTaskType} from './referenceTasksModel';
import type {HubTask} from '../../task-hub/taskHubModel';
describe('dashboard combined tasks',()=>{
 it('keeps the populated Sample staff, category and late totals consistent',()=>{
 const {tasks}=referenceTaskSamples('2026-11-16'),open=tasks.filter(t=>t.status!=='Completed');
 expect(open).toHaveLength(17);expect(tasks.filter(t=>t.status==='Completed')).toHaveLength(2);expect(open.filter(t=>t.due<'2026-11-16')).toHaveLength(4);
 expect(Object.fromEntries(['Admin','Account','Front desk','Jason Wu','Mia Chen','Warehouse'].map(name=>[name,open.filter(t=>t.ownerName===name).length]))).toEqual({Admin:2,Account:3,'Front desk':5,'Jason Wu':3,'Mia Chen':3,Warehouse:1});
 expect(open.filter(t=>t.type==='Sample Delivery')).toHaveLength(3);expect(open.filter(t=>t.type==='Customer Follow-up')).toHaveLength(4);expect(open.filter(t=>t.source==='supplier')).toHaveLength(3);
 });
 it('returns new isolated Sample records and retains meaningful completed states',()=>{const first=referenceTaskSamples('2026-11-16');first.tasks[0].status='Completed';expect(referenceTaskSamples('2026-11-16').tasks[0].status).toBe('Open');expect(referenceTaskSamples('2026-11-20').tasks.find(t=>t.type==='Order Follow-up')?.due).toBe('2026-11-18');});
 it('categorises supplier tasks separately without losing customer task type',()=>{const task={source:'supplier',name:'Request packing list'} as HubTask;expect(dashboardTaskType(task)).toBe('Chase Documents');expect(dashboardTaskType({...task,name:'Schedule payment'})).toBe('Supplier Payment');expect(dashboardTaskType({...task,source:'customer',type:'Sample',name:'Prepare oak samples'})).toBe('Sample');});
});
