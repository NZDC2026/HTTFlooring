import type { PayRun, Slip, TimeRow } from './payrollModel';
import type { JournalEntry } from '../../accounting/types/journalEntry';
import type { Allocation } from '../../job-costing/jobCostingService';
export function projectCosts(basis: 'Hourly'|'Salary', times: TimeRow[], leaveHours: number, lines: Slip['lines']) {
 const costs: NonNullable<Slip['projectAllocation']>['costs'] = [];
 function distribute(lineIndex:number, weights:{project:NonNullable<TimeRow['project']>;weight:number}[], denominator:number){
  if(!denominator)return;
  const grouped=new Map<string,{project:NonNullable<TimeRow['project']>;weight:number}>();
  for(const w of weights){const old=grouped.get(w.project.id);grouped.set(w.project.id,{project:w.project,weight:(old?.weight??0)+w.weight});}
  // Include unallocated weight in the rounding decision so assigned projects never absorb missing hours/cost.
  const entries=[...grouped.values()],missing=Math.max(0,denominator-entries.reduce((n,e)=>n+e.weight,0)),all=[...entries.map(e=>e.weight),missing],total=Math.round(lines[lineIndex].amount*100),raw=all.map(w=>total*w/denominator),rounded=raw.map(Math.floor);
  let remainder=total-rounded.reduce((n,c)=>n+c,0);const order=raw.map((v,i)=>({i,f:v-rounded[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);
  for(const item of order){if(remainder--<=0)break;rounded[item.i]++;}
  entries.forEach((e,i)=>{if(rounded[i]>0)costs.push({lineIndex,project:structuredClone(e.project),amount:rounded[i]/100});});
 }
 lines.forEach((line,lineIndex)=>{
  if(basis==='Hourly'&&line.source.startsWith('Time:')){const t=times.find(t=>'Time:'+t.id===line.source);if(t?.project&&line.amount>0)costs.push({lineIndex,project:structuredClone(t.project),amount:line.amount});}
  if(basis==='Salary'&&line.source==='Salary')distribute(lineIndex,times.filter(t=>t.project).map(t=>({project:t.project!,weight:t.hours})),times.reduce((n,t)=>n+t.hours,leaveHours));
 });
 const wages=costs.filter(c=>['Earnings','Allowance'].includes(lines[c.lineIndex].item.category)),gross=lines.filter(l=>['Earnings','Allowance'].includes(l.item.category)).reduce((n,l)=>n+Math.round(l.amount*100),0);
 lines.forEach((l,i)=>{if(l.item.category==='Employer contribution')distribute(i,wages.map(c=>({project:c.project,weight:Math.round(c.amount*100)})),gross);});
 return costs;
}
export function payrollProjectAllocations(runs: PayRun[], journals: JournalEntry[]): Allocation[]{
 const result:Allocation[]=[];
 for(const run of runs.filter(r=>(r.status==='Posted'||r.status==='Reversed')&&r.slips.some(s=>s.projectAllocation))){
  const journal=journals.find(j=>j.id===run.journalId);if(!journal||journal.sourceType!=='PAYROLL'||journal.sourceId!==run.id||journal.journalDate!==run.payDate)throw new Error('Payroll project journal source mismatch.');let index=0;function verify(accountId:string,debit:number,credit:number){const line=journal!.lines[index++];if(!line||line.accountId!==accountId||Math.round(line.debit*100)!==Math.round(debit*100)||Math.round(line.credit*100)!==Math.round(credit*100))throw new Error('Payroll project journal line mismatch.');return line;}
  for(const slip of run.slips){for(const [lineIndex,line] of slip.lines.entries()){
   if(line.amount<=0)continue;const debit=['Earnings','Allowance','Employer contribution'].includes(line.item.category),source=verify(line.item.accountId,debit?line.amount:0,debit?0:line.amount),costs=slip.projectAllocation?.costs.filter(c=>c.lineIndex===lineIndex)??[];
   if(costs.length){if(!source||source.accountId!==line.item.accountId)throw new Error('Payroll project journal line mismatch.');result.push({id:'payroll:'+run.id+':'+source.id,journalId:journal.id,lineId:source.id,revision:run.revision,splits:costs.map(c=>({jobId:c.project.id,jobName:c.project.name,amount:c.amount}))});}
   if(line.item.category==='Employer contribution')verify(line.item.liabilityAccountId,0,line.amount);
  }if(slip.totals.net)verify(run.settings.netAccountId,0,slip.totals.net);}if(index!==journal.lines.length)throw new Error('Payroll project journal has extra lines.');
 }
 return result;
}
