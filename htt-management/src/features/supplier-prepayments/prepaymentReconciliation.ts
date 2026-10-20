import type { PrepaymentState } from './supplierPrepaymentRepository';
import type { Account } from '../accounting/types/account';
import type { JournalEntry } from '../accounting/types/journalEntry';
import type { BankAccount } from '../banking/types/bankAccount';
import { requireDateKey } from '../../lib/businessDate';
export type PrepaymentReconciliationInput = { prepayments: PrepaymentState; accounts: Account[]; journals: JournalEntry[]; banks: BankAccount[]; suppliers: { id: string; businessName: string }[]; asOfDate: string };
export function calculatePrepaymentReconciliation(input: PrepaymentReconciliationInput) {
 const {prepayments:s,accounts,journals,banks,suppliers,asOfDate}=input; requireDateKey(asOfDate);
 const cents=(n:number)=>{if(!Number.isFinite(n))throw new Error('Prepayment reconciliation contains a non-finite amount.');return Math.round(n*100);};
 const issues:{code:string;message:string;path:string}[]=[],add=(code:string,message:string,id?:string)=>issues.push({code,message,path:id?'/purchases/prepayments/'+encodeURIComponent(id):'/purchases/prepayments'});
 const accountIds=new Set([...s.settings.map(c=>c.assetAccountId),...s.prepayments.filter(d=>d.date<=asOfDate).map(d=>d.assetAccountId)]),expected=new Map<string,number>(),owned=new Set<string>();
 const journalMap=new Map(journals.map(j=>[j.id,j]));if(journalMap.size!==journals.length)throw new Error('Duplicate journal IDs require review.');
 for(const id of accountIds){const a=accounts.find(a=>a.id===id);if(!a||a.type!=='ASSET'||a.systemRole||a.allowManualPosting)add('PREPAYMENT_ACCOUNT','Prepayment asset mapping is missing or invalid: '+id);}
 const net=(j:JournalEntry)=>{const result=new Map<string,number>();for(const l of j.lines)result.set(l.accountId,(result.get(l.accountId)??0)+cents(l.debit)-cents(l.credit));return result;};
 const checkJournal=(r:{id:string;journalId:string;date:string;amount:number;reversalDate?:string;status:string},prepaymentId:string,source:string,sourceId:string,debit:string|undefined,credit:string|undefined)=>{
  if(r.date>asOfDate)return;
  const value=cents(r.amount),j=journalMap.get(r.journalId);
  const matches=(j:JournalEntry,dr:string|undefined,cr:string|undefined)=>{if(!dr||!cr||dr===cr||j.lines.length!==2)return false;const n=net(j);return n.size===2&&n.get(dr)===value&&n.get(cr)===-value;};
  if(owned.has(r.journalId))add('PREPAYMENT_JOURNAL_SHARED','More than one prepayment event owns the same journal.',prepaymentId);owned.add(r.journalId);
  if(!j||j.sourceType!==source||j.sourceId!==sourceId||j.journalDate!==r.date||j.reversedJournalEntryId||!matches(j,debit,credit))add('PREPAYMENT_SOURCE_JOURNAL','Prepayment event does not match its original journal: '+r.id,prepaymentId);
  if(j&&((r.status==='POSTED'&&j.status!=='POSTED')||(r.status==='REVERSED'&&j.status!=='REVERSED')))add('PREPAYMENT_SOURCE_STATUS','Prepayment event and journal statuses disagree: '+r.id,prepaymentId);
  if(r.status==='REVERSED'&&!r.reversalDate)add('PREPAYMENT_REVERSAL_DATE','Reversed prepayment event has no reversal date: '+r.id,prepaymentId);
  if(r.reversalDate&&r.reversalDate<=asOfDate){const rev=j?.reversalJournalEntryId?journalMap.get(j.reversalJournalEntryId):undefined;if(rev)owned.add(rev.id);if(!rev||rev.reversedJournalEntryId!==j?.id||rev.journalDate!==r.reversalDate||rev.status!=='POSTED'||rev.sourceType!==source||(rev.sourceId!==undefined&&rev.sourceId!==sourceId)||!matches(rev,credit,debit))add('PREPAYMENT_REVERSAL_JOURNAL','Prepayment reversal journal is missing or incorrect: '+r.id,prepaymentId);}
 };
 for(const d of s.prepayments.filter(d=>d.date<=asOfDate))if(!s.settings.some(c=>c.assetAccountId===d.assetAccountId))add('PREPAYMENT_ACCOUNT_CONFIGURATION','Prepayment receipt has no matching asset configuration.',d.id);
 const rows=s.prepayments.filter(d=>d.date<=asOfDate).map(d=>{
  const events=new Map<string,number>(),addEvent=(date:string,value:number)=>{requireDateKey(date);if(date<=asOfDate)events.set(date,(events.get(date)??0)+value);};
  addEvent(d.date,cents(d.amount));if(d.reversalDate)addEvent(d.reversalDate,-cents(d.amount));
  checkJournal(d,d.id,'SUPPLIER_PREPAYMENT',d.id,d.assetAccountId,banks.find(b=>b.id===d.bankAccountId)?.glAccountId);
  let applied=0,refunded=0;
  for(const kind of ['applications','refunds'] as const)for(const r of s[kind].filter(r=>r.prepaymentId===d.id&&r.date<=asOfDate)){
   const value=cents(r.amount);addEvent(r.date,-value);if(r.reversalDate)addEvent(r.reversalDate,value);
   if(r.date<d.date||r.reversalDate&&r.reversalDate<r.date)add('PREPAYMENT_EVENT_DATE','Prepayment consumption or reversal precedes its source: '+r.id,d.id);
   const active=!r.reversalDate||r.reversalDate>asOfDate;if(kind==='applications'){if(active)applied+=value;}else if(active)refunded+=value;
   checkJournal(r,d.id,kind==='applications'?'SUPPLIER_PAYMENT':'SUPPLIER_PREPAYMENT_REFUND','paymentId' in r?r.paymentId:r.id,'supplierBillId' in r?accounts.find(a=>a.systemRole==='ACCOUNTS_PAYABLE')?.id:banks.find(b=>b.id===r.bankAccountId)?.glAccountId,d.assetAccountId);
  }
  let held=0;for(const [,delta]of [...events].sort(([a],[b])=>a.localeCompare(b))){held+=delta;if(held<0)add('PREPAYMENT_NEGATIVE_HISTORY','Prepayment funds are overdrawn on a historical date.',d.id);}
  if(!suppliers.some(c=>c.id===d.supplierId))add('PREPAYMENT_SUPPLIER','Prepayment supplier is missing.',d.id);
  expected.set(d.assetAccountId,(expected.get(d.assetAccountId)??0)+held);
  return {id:d.id,supplierId:d.supplierId,supplierName:suppliers.find(c=>c.id===d.supplierId)?.businessName??d.supplierId,reference:d.reference,date:d.date,paid:d.reversalDate&&d.reversalDate<=asOfDate?0:d.amount,applied:applied/100,refunded:refunded/100,held:held/100,assetAccountId:d.assetAccountId};
 });
 for(const kind of ['applications','refunds']as const)for(const r of s[kind])if(r.date<=asOfDate&&!s.prepayments.some(d=>d.id===r.prepaymentId&&d.date<=asOfDate))add('PREPAYMENT_ORPHAN_EVENT','Prepayment consumption has no dated receipt: '+r.id,r.prepaymentId);
 const controls=[...accountIds].map(id=>{let gl=0;for(const j of journals.filter(j=>j.journalDate<=asOfDate))for(const l of j.lines.filter(l=>l.accountId===id)){gl+=cents(l.debit)-cents(l.credit);if(!owned.has(j.id))add('PREPAYMENT_UNOWNED_JOURNAL','Unexplained prepayment asset journal: '+j.journalNumber);}
  const source=expected.get(id)??0;return {accountId:id,accountName:accounts.find(a=>a.id===id)?.name??id,subledger:source/100,gl:gl/100,difference:(source-gl)/100};});
 for(const j of journals)if(j.journalDate<=asOfDate&&['SUPPLIER_PREPAYMENT','SUPPLIER_PREPAYMENT_REFUND'].includes(j.sourceType)&&!owned.has(j.id))add('PREPAYMENT_ORPHAN_JOURNAL','Prepayment journal has no source event: '+j.journalNumber);
 const subledger=controls.reduce((n,c)=>n+cents(c.subledger),0)/100,gl=controls.reduce((n,c)=>n+cents(c.gl),0)/100,difference=(cents(subledger)-cents(gl))/100;
 return {asOfDate,subledger,gl,difference,controls,rows,issues,reconciled:issues.length===0&&controls.every(c=>c.difference===0)};
}
/** The summary must count integrity failures even when the numeric difference is zero. */
export function includePrepaymentControl(summary: import('../accounting/types/financeControls').FinanceControlsSummary, report: ReturnType<typeof calculatePrepaymentReconciliation>) {
 if(summary.asOfDate!==report.asOfDate)throw new Error('Finance control and prepayment report dates must agree.');
 const controls=[...summary.controls,{id:'supplier-prepayments-gl',name:'Supplier prepayments to GL',description:`Supplier advances outstanding versus asset accounts; ${report.issues.length} source integrity issue(s).`,leftLabel:'Prepayments held',leftValue:report.subledger,rightLabel:'GL asset',rightValue:report.gl,difference:report.difference,status:report.reconciled?'PASS' as const:'FAIL' as const,route:'/accounting/reconciliation/prepayments?asOf='+encodeURIComponent(report.asOfDate)}];
 const passedControlCount=controls.filter(c=>c.status==='PASS').length+summary.bankControls.filter(c=>c.status==='PASS').length,totalControlCount=controls.length+summary.bankControls.length;
 return {...summary,controls,totalControlCount,passedControlCount,failedControlCount:totalControlCount-passedControlCount,allPassed:passedControlCount===totalControlCount};
}
