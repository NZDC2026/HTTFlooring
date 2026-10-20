import { bankReconciliationRepository } from '../../banking/data/bankReconciliationRepository';
import { verifyReconciliationClosureEvidence } from '../../banking/data/reconciliationRecoveryEvidence';
import { isBankRecoveryKind, verifyBankClosureEvidence } from '../../banking/data/bankRecoveryEvidence';
import { bankTransactionRepository } from '../../banking/data/bankTransactionRepository';
import { nativeRequest, hydrateBusiness } from '../../security/repositoryHost';
import type { BusinessView } from '../../security/securityContract';
import { trustedAuthorization } from '../../security/trustedAuthorization';
import { hasPermission } from '../../security/rbac';
import { financialOperationJournal, type FinancialOperation } from '../../../lib/persistence/financialOperationJournal';
import { salesRepository } from './salesRepository';
import { paymentRepository } from './paymentRepository';
import { creditNoteRepository } from './creditNoteRepository';
import { journalEntryRepository } from '../../accounting/data/journalEntryRepository';
import { verifySalesClosureEvidence, salesReviewRevision, verifyCurrentRecoveryAccounting } from './salesVerifiedRecoveryClosure';
import { runFinancialConsistencyAudit } from '../../../lib/persistence/runFinancialConsistencyAudit';
export const supportedSalesRecoveryKinds = ['CUSTOMER_PAYMENT','SALES_INVOICE_VOID','SALES_CREDIT_APPLY','SALES_CREDIT_REVERSAL','SALES_PAYMENT_REVERSAL'] as const;
export type RecoveryWorkbenchRow = FinancialOperation & { supported: boolean; revision: string; closureReasons: string[]; canApprove: boolean; links: {label:string;path:string}[] };
export type RecoveryWorkbench = { queue:RecoveryWorkbenchRow[]; history:RecoveryWorkbenchRow[]; unresolvedCount:number; inspectedAt:string };
/** All proof and eligibility are calculated by the main process, including actor separation. */
export function inspectRecovery():RecoveryWorkbench {
 if((globalThis as Record<string,unknown>).__HTT_MAIN_HOST__!==true&&import.meta.env?.MODE!=='test'){
  const reply=nativeRequest<{result:RecoveryWorkbench;view:BusinessView}>('business.command',{repository:'salesRecovery',method:'inspectRecovery',args:[]});hydrateBusiness(reply.view);return reply.result;
 }
 const actor=trustedAuthorization.require('audit.read'),operations=financialOperationJournal.list(),docs=salesRepository.getAll(),data={quotes:docs.filter(d=>d.type==='QUOTE'),salesOrders:docs.filter(d=>d.type==='SALES_ORDER'),invoices:docs.filter(d=>d.type==='INVOICE'),payments:paymentRepository.getAll(),creditNotes:creditNoteRepository.getAll(),allocations:creditNoteRepository.getAllAllocations(),journals:journalEntryRepository.getAll()};
 const integrity=runFinancialConsistencyAudit();
 const rows=operations.filter(o=>o.state!=='COMPLETED'||o.reviewHistory?.length).map(o=>{
  const supported=(supportedSalesRecoveryKinds as readonly string[]).includes(o.kind)||isBankRecoveryKind(o.kind)||o.kind==='BANK_RECONCILIATION',links:{label:string;path:string}[]=[],add=(label:string,path:string)=>{if(!links.some(l=>l.path===path))links.push({label,path});};
  if(o.kind==='BANK_RECONCILIATION'){const rec=bankReconciliationRepository.getAll().find(r=>r.id===o.resultId);add('Bank reconciliation records',rec?'/banking/accounts/'+encodeURIComponent(rec.bankAccountId):'/banking');}
  if(isBankRecoveryKind(o.kind)){const records=o.kind==='BANK_TRANSACTION'?bankTransactionRepository.getTransactions():bankTransactionRepository.getTransfers();const record=records.find(r=>r.id===o.resultId);if(record){add('Bank business records','/banking');add('Bank journal','/accounting/journals/'+encodeURIComponent(record.journalEntryId));}}
  const payment=data.payments.find(p=>p.id===o.resultId),allocation=data.allocations.find(a=>a.id===o.resultId);
  if(o.kind==='SALES_INVOICE_VOID'&&o.resultId&&data.invoices.some(i=>i.id===o.resultId))add('Invoice','/sales/invoices/'+encodeURIComponent(o.resultId));
  if(payment&&['CUSTOMER_PAYMENT','SALES_PAYMENT_REVERSAL'].includes(o.kind)){add('Invoice and payment','/sales/invoices/'+encodeURIComponent(payment.invoiceId));if(payment.depositId)add('Deposit owner','/sales/customer-deposits/'+encodeURIComponent(payment.depositId));}
  if(allocation&&['SALES_CREDIT_APPLY','SALES_CREDIT_REVERSAL'].includes(o.kind)){add('Invoice','/sales/invoices/'+encodeURIComponent(allocation.invoiceId));add('Credit note','/sales/credit-notes/'+encodeURIComponent(allocation.creditNoteId));}
  const sources=o.kind==='SALES_INVOICE_VOID'?[{type:'CUSTOMER_INVOICE',id:o.resultId}]:payment&&['CUSTOMER_PAYMENT','SALES_PAYMENT_REVERSAL'].includes(o.kind)?[{type:'CUSTOMER_PAYMENT',id:payment.id},{type:'CUSTOMER_INVOICE',id:payment.invoiceId}]:allocation&&['SALES_CREDIT_APPLY','SALES_CREDIT_REVERSAL'].includes(o.kind)?[{type:'CUSTOMER_INVOICE',id:allocation.invoiceId},{type:'CREDIT_NOTE',id:allocation.creditNoteId}]:[];
  for(const j of data.journals.filter(j=>sources.some(s=>s.type===j.sourceType&&s.id===j.sourceId)&&!j.reversedJournalEntryId)){add('Original journal '+j.journalNumber,'/accounting/journals/'+encodeURIComponent(j.id));if(j.reversalJournalEntryId&&data.journals.some(r=>r.id===j.reversalJournalEntryId))add('Reversal journal','/accounting/journals/'+encodeURIComponent(j.reversalJournalEntryId));}
  const closureReasons=o.state==='COMPLETED'?[]:!supported?['This operation kind has no verified closure procedure. It remains blocked; do not replay it.']:o.kind==='BANK_RECONCILIATION'?verifyReconciliationClosureEvidence(o.operationId):isBankRecoveryKind(o.kind)?verifyBankClosureEvidence(o.operationId):verifySalesClosureEvidence(data,operations,o.operationId);
  if(o.state!=='COMPLETED'&&supported){if(o.kind!=='BANK_RECONCILIATION'&&!isBankRecoveryKind(o.kind))closureReasons.push(...verifyCurrentRecoveryAccounting(o.operationId));if(integrity.length)closureReasons.push('Financial consistency checks failed: '+integrity.map(i=>i.code).join(', '));if(o.reviewHistory?.some(r=>r.operator.trim().toLowerCase()===actor.userId.toLowerCase()))closureReasons.push('A different authorized operator must approve; this account recorded review evidence.');if(!hasPermission(actor,'accounting.recover'))closureReasons.push('Your role can inspect but cannot approve recovery.');}
  return {...structuredClone(o),supported,revision:salesReviewRevision(o),closureReasons,canApprove:supported&&o.state==='MANUAL_REVIEW'&&closureReasons.length===0,links};
 });
 return {queue:rows.filter(o=>o.state!=='COMPLETED').sort((a,b)=>a.createdAt.localeCompare(b.createdAt)),history:rows.filter(o=>o.state==='COMPLETED').sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),unresolvedCount:operations.filter(o=>o.state!=='COMPLETED').length,inspectedAt:new Date().toISOString()};
}
