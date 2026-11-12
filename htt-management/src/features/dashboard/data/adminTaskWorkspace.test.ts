import {expect,it} from 'vitest';
import {adminWorkspaceRows,followupMatches} from './adminTaskWorkspace';
import {adminTaskSamples} from './adminOperations';
import {taskSamples} from '../../task-hub/taskHubModel';
const today='2026-11-12',userId='jessica';
const input={teamTasks:adminTaskSamples(today,userId),followupTasks:taskSamples(today,userId),today,userId,sample:true,scope:'All Staff',followScope:'All',type:'All',search:'',expanded:false,sort:'preview' as const};
it('combines the five reference team tasks and seven open follow-ups in one list',()=>{
 const rows=adminWorkspaceRows(input);expect(rows).toHaveLength(12);expect(new Set(rows.map(t=>t.id)).size).toBe(12);
 expect(rows[0].name).toBe('Confirm 3 customer pickups');expect(rows[5].name).toBe('Follow up quotation QU-0004725');expect(rows[6].name).toBe('Customer complaint – damaged box');
});
it('deduplicates the same live task sources and exposes completed follow-ups',()=>{
 const rows=taskSamples(today,userId);expect(adminWorkspaceRows({...input,teamTasks:rows,followupTasks:rows,sample:false})).toHaveLength(7);
 expect(adminWorkspaceRows({...input,scope:'Completed'})).toHaveLength(15);
 expect(adminWorkspaceRows({...input,scope:'Completed'}).every(t=>t.status==='Completed')).toBe(true);
});
it('filters both sources by search, owner, type, overdue and due date ordering',()=>{
 expect(adminWorkspaceRows({...input,search:'SO-10482'}).map(t=>t.name)).toEqual(['Confirm 3 customer pickups']);
 expect(adminWorkspaceRows({...input,search:'Harbour Flooring'})).toHaveLength(1);
 expect(adminWorkspaceRows({...input,scope:'My Tasks'}).every(t=>t.owner===userId)).toBe(true);
 expect(adminWorkspaceRows({...input,type:'Complaint'})).toHaveLength(1);
 expect(adminWorkspaceRows({...input,followScope:'Overdue'}).every(t=>followupMatches(t,'Overdue',today))).toBe(true);
 const sorted=adminWorkspaceRows({...input,sort:'asc'}).map(t=>t.due);expect(sorted).toEqual([...sorted].sort());
 expect(adminWorkspaceRows({...input,search:'no such task'})).toHaveLength(0);
});
