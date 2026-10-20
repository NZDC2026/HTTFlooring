import type { DepositState } from './customerDepositRepository';
import type { Account } from '../accounting/types/account';
import type { JournalEntry } from '../accounting/types/journalEntry';
import type { BankAccount } from '../banking/types/bankAccount';
import { requireDateKey } from '../../lib/businessDate';
export type DepositReconciliationInput = { deposits: DepositState; accounts: Account[]; journals: JournalEntry[]; banks: BankAccount[]; customers: { id: string; businessName: string }[]; asOfDate: string };
export function calculateDepositReconciliation(input: DepositReconciliationInput) {
 const {deposits:s,accounts,journals,banks,customers,asOfDate}=input; requireDateKey(asOfDate);
 const cents=(n:number)=>{if(!Number.isFinite(n))throw new Error('Deposit reconciliation contains a non-finite amount.');return Math.round(n*100);};
 const issues:{code:string;message:string;path:string}[]=[],add=(code:string,message:string,id?:string)=>issues.push({code,message,path:id?'/sales/customer-deposits/'+encodeURIComponent(id):'/sales/customer-deposits'});
 const accountIds=new Set([...s.settings.map(c=>c.liabilityAccountId),...s.deposits.filter(d=>d.date<=asOfDate).map(d=>d.liabilityAccountId)]),expected=new Map<string,number>(),owned=new Set<string>();
 const journalMap=new Map(journals.map(j=>[j.id,j]));if(journalMap.size!==journals.length)throw new Error('Duplicate journal IDs require review.');
 for(const id of accountIds){const a=accounts.find(a=>a.id===id);if(!a||a.type!=='LIABILITY'||a.systemRole||a.allowManualPosting)add('DEPOSIT_ACCOUNT','Deposit liability mapping is missing or invalid: '+id);}
 const net=(j:JournalEntry)=>{const result=new Map<string,number>();for(const l of j.lines)result.set(l.accountId,(result.get(l.accountId)??0)+cents(l.debit)-cents(l.credit));return result;};
 const checkJournal=(r:{id:string;journalId:string;date:string;amount:number;reversalDate?:string;status:string},depositId:string,source:string,sourceId:string,debit:string|undefined,credit:string|undefined)=>{
  if(r.date>asOfDate)return;
  const value=cents(r.amount),j=journalMap.get(r.journalId);
  const matches=(j:JournalEntry,dr:string|undefined,cr:string|undefined)=>{if(!dr||!cr||dr===cr||j.lines.length!==2)return false;const n=net(j);return n.size===2&&n.get(dr)===value&&n.get(cr)===-value;};
  if(owned.has(r.journalId))add('DEPOSIT_JOURNAL_SHARED','More than one deposit event owns the same journal.',depositId);owned.add(r.journalId);
  if(!j||j.sourceType!==source||j.sourceId!==sourceId||j.journalDate!==r.date||j.reversedJournalEntryId||!matches(j,debit,credit))add('DEPOSIT_SOURCE_JOURNAL','Deposit event does not match its original journal: '+r.id,depositId);
  if(j&&((r.status==='POSTED'&&j.status!=='POSTED')||(r.status==='REVERSED'&&j.status!=='REVERSED')))add('DEPOSIT_SOURCE_STATUS','Deposit event and journal statuses disagree: '+r.id,depositId);
  if(r.status==='REVERSED'&&!r.reversalDate)add('DEPOSIT_REVERSAL_DATE','Reversed deposit event has no reversal date: '+r.id,depositId);
  if(r.reversalDate&&r.reversalDate<=asOfDate){const rev=j?.reversalJournalEntryId?journalMap.get(j.reversalJournalEntryId):undefined;if(rev)owned.add(rev.id);if(!rev||rev.reversedJournalEntryId!==j?.id||rev.journalDate!==r.reversalDate||rev.status!=='POSTED'||rev.sourceType!==source||(rev.sourceId!==undefined&&rev.sourceId!==sourceId)||!matches(rev,credit,debit))add('DEPOSIT_REVERSAL_JOURNAL','Deposit reversal journal is missing or incorrect: '+r.id,depositId);}
 };
 for(const d of s.deposits.filter(d=>d.date<=asOfDate))if(!s.settings.some(c=>c.liabilityAccountId===d.liabilityAccountId))add('DEPOSIT_ACCOUNT_CONFIGURATION','Deposit receipt has no matching liability configuration.',d.id);
 const rows=s.deposits.filter(d=>d.date<=asOfDate).map(d=>{
  const events=new Map<string,number>(),addEvent=(date:string,value:number)=>{requireDateKey(date);if(date<=asOfDate)events.set(date,(events.get(date)??0)+value);};
  addEvent(d.date,cents(d.amount));if(d.reversalDate)addEvent(d.reversalDate,-cents(d.amount));
  checkJournal(d,d.id,'CUSTOMER_DEPOSIT',d.id,banks.find(b=>b.id===d.bankAccountId)?.glAccountId,d.liabilityAccountId);
  let applied=0,refunded=0;
  for(const kind of ['applications','refunds'] as const)for(const r of s[kind].filter(r=>r.depositId===d.id&&r.date<=asOfDate)){
   const value=cents(r.amount);addEvent(r.date,-value);if(r.reversalDate)addEvent(r.reversalDate,value);
   if(r.date<d.date||r.reversalDate&&r.reversalDate<r.date)add('DEPOSIT_EVENT_DATE','Deposit consumption or reversal precedes its source: '+r.id,d.id);
   const active=!r.reversalDate||r.reversalDate>asOfDate;if(kind==='applications'){if(active)applied+=value;}else if(active)refunded+=value;
   checkJournal(r,d.id,kind==='applications'?'CUSTOMER_PAYMENT':'CUSTOMER_DEPOSIT_REFUND','paymentId' in r?r.paymentId:r.id,d.liabilityAccountId,'invoiceId' in r?accounts.find(a=>a.systemRole==='ACCOUNTS_RECEIVABLE')?.id:banks.find(b=>b.id===r.bankAccountId)?.glAccountId);
  }
  let held=0;for(const [,delta]of [...events].sort(([a],[b])=>a.localeCompare(b))){held+=delta;if(held<0)add('DEPOSIT_NEGATIVE_HISTORY','Deposit funds are overdrawn on a historical date.',d.id);}
  if(!customers.some(c=>c.id===d.customerId))add('DEPOSIT_CUSTOMER','Deposit customer is missing.',d.id);
  expected.set(d.liabilityAccountId,(expected.get(d.liabilityAccountId)??0)+held);
  return {id:d.id,customerId:d.customerId,customerName:customers.find(c=>c.id===d.customerId)?.businessName??d.customerId,reference:d.reference,date:d.date,received:d.reversalDate&&d.reversalDate<=asOfDate?0:d.amount,applied:applied/100,refunded:refunded/100,held:held/100,liabilityAccountId:d.liabilityAccountId};
 });
 for(const kind of ['applications','refunds']as const)for(const r of s[kind])if(r.date<=asOfDate&&!s.deposits.some(d=>d.id===r.depositId&&d.date<=asOfDate))add('DEPOSIT_ORPHAN_EVENT','Deposit consumption has no dated receipt: '+r.id,r.depositId);
 const controls=[...accountIds].map(id=>{let gl=0;for(const j of journals.filter(j=>j.journalDate<=asOfDate))for(const l of j.lines.filter(l=>l.accountId===id)){gl+=cents(l.credit)-cents(l.debit);if(!owned.has(j.id))add('DEPOSIT_UNOWNED_JOURNAL','Unexplained deposit liability journal: '+j.journalNumber);}
  const source=expected.get(id)??0;return {accountId:id,accountName:accounts.find(a=>a.id===id)?.name??id,subledger:source/100,gl:gl/100,difference:(source-gl)/100};});
 for(const j of journals)if(j.journalDate<=asOfDate&&['CUSTOMER_DEPOSIT','CUSTOMER_DEPOSIT_REFUND'].includes(j.sourceType)&&!owned.has(j.id))add('DEPOSIT_ORPHAN_JOURNAL','Deposit journal has no source event: '+j.journalNumber);
 const subledger=controls.reduce((n,c)=>n+cents(c.subledger),0)/100,gl=controls.reduce((n,c)=>n+cents(c.gl),0)/100,difference=(cents(subledger)-cents(gl))/100;
 return {asOfDate,subledger,gl,difference,controls,rows,issues,reconciled:issues.length===0&&controls.every(c=>c.difference===0)};
}
/** The summary must count integrity failures even when the numeric difference is zero. */
export function includeDepositControl(summary: import('../accounting/types/financeControls').FinanceControlsSummary, report: ReturnType<typeof calculateDepositReconciliation>) {
 if(summary.asOfDate!==report.asOfDate)throw new Error('Finance control and deposit report dates must agree.');
 const controls=[...summary.controls,{id:'customer-deposits-gl',name:'Customer deposits to GL',description:`Customer funds held versus liability accounts; ${report.issues.length} source integrity issue(s).`,leftLabel:'Deposits held',leftValue:report.subledger,rightLabel:'GL liability',rightValue:report.gl,difference:report.difference,status:report.reconciled?'PASS' as const:'FAIL' as const,route:'/accounting/reconciliation/deposits?asOf='+encodeURIComponent(report.asOfDate)}];
 const passedControlCount=controls.filter(c=>c.status==='PASS').length+summary.bankControls.filter(c=>c.status==='PASS').length,totalControlCount=controls.length+summary.bankControls.length;
 return {...summary,controls,totalControlCount,passedControlCount,failedControlCount:totalControlCount-passedControlCount,allPassed:passedControlCount===totalControlCount};
}
