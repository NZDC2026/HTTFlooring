import type {HubTask} from '../../task-hub/taskHubModel';
import {teamTaskBucket} from './adminOperations';
export function followupMatches(t:HubTask,scope:string,today:string){
 return scope==='All'||(scope==='Overdue'?!!t.due&&t.due.slice(0,10)<today:scope==='Due Today'?t.due.slice(0,10)===today:!t.due||t.due.slice(0,10)>today);
}
export function adminWorkspaceRows({teamTasks,followupTasks,today,userId,sample,scope,followScope,type,search,expanded,sort}:{teamTasks:HubTask[];followupTasks:HubTask[];today:string;userId:string;sample:boolean;scope:string;followScope:string;type:string;search:string;expanded:boolean;sort:'preview'|'asc'|'desc'}){
 const scopeMatch=(t:HubTask)=>!['Cancelled','Inactive'].includes(t.status)&&(scope==='Completed'?t.status==='Completed':scope==='My Tasks'?t.owner===userId:scope==='All Staff'?t.status!=='Completed':teamTaskBucket(t,today)===scope);
 const followups=followupTasks.filter(t=>scopeMatch(t)&&(scope==='Completed'||t.status!=='Completed')).sort((a,b)=>a.due.localeCompare(b.due));
 const team=teamTasks.filter(scopeMatch);
 const defaultPreview=sample&&!expanded&&scope==='All Staff'&&type==='All'&&!search.trim()&&followScope==='All';
 const unique=[...new Map([...(defaultPreview?team.slice(0,5):team),...followups].map(t=>[t.id,t])).values()];
 const query=search.trim().toLowerCase();
 const filtered=unique.filter(t=>(type==='All'||t.type===type)&&followupMatches(t,followScope,today)&&`${t.name} ${t.account} ${t.documentNumber??''} ${t.ownerName} ${t.notes}`.toLowerCase().includes(query));
 return sort==='preview'?filtered:filtered.slice().sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')*(sort==='asc'?1:-1));
}
