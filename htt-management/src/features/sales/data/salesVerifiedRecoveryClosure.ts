import { verifyReconciliationClosureEvidence } from '../../banking/data/reconciliationRecoveryEvidence';
import { isBankRecoveryKind, verifyBankClosureEvidence } from '../../banking/data/bankRecoveryEvidence';
import {accountRepository} from '../../accounting/data/accountRepository';
import {bankAccountRepository} from '../../banking/data/bankAccountRepository';
import {customerRepository} from '../../contacts/data/customerRepository';
import {calculateAccountsReceivableGlReconciliation} from '../../accounting/data/accountsReceivableGlReconciliationService';
import {snapshotRepositories} from '../../security/repositoryHost';
import { runFinancialConsistencyAudit } from '../../../lib/persistence/runFinancialConsistencyAudit';
import { nativeRequest, hydrateBusiness } from "../../security/repositoryHost";
import type { BusinessView } from "../../security/securityContract";
/** Audited closure of an interrupted operation whose financial effects ALREADY exist.
 * No business write, GL posting, GL reversal, or retry is performed here.
 * If any evidence is ambiguous the operation remains blocked for manual repair.
 */
import { financialOperationJournal } from '../../../lib/persistence/financialOperationJournal';
import type { SalesAuditInput } from './salesConsistencyAudit';
import { inspectSalesRestart } from './salesRestartRecoveryService';
import { inspectCurrentSalesRestart } from './salesRestartRecoveryService';
import { salesRepository } from './salesRepository';
import { paymentRepository } from './paymentRepository';
import { creditNoteRepository } from './creditNoteRepository';
import { journalEntryRepository } from '../../accounting/data/journalEntryRepository';
import type { Invoice, Quote, SalesOrder } from '../types/salesDocument';

export type VerifiedClosureRequest = {
    operationId: string;
    approver: string;
    approvalReference: string;
    expectedRevision: string;
};

export function salesReviewRevision(operation: ReturnType<typeof financialOperationJournal.list>[number]): string {
    return JSON.stringify([operation.operationId,operation.kind,operation.state,operation.resultId,operation.updatedAt,operation.reviewHistory??[]]);
}
const salesKinds = new Set(['CUSTOMER_PAYMENT', 'SALES_INVOICE_VOID', 'SALES_CREDIT_APPLY',
    'SALES_CREDIT_REVERSAL', 'SALES_PAYMENT_REVERSAL']);

/** Pure verification for crash/restart test injection. Requires existing final business
 * and GL state; an intent or a signed checklist alone is never sufficient. */
export function verifySalesClosureEvidence(
    data: SalesAuditInput,
    operations: ReturnType<typeof financialOperationJournal.list>,
    operationId: string,
): string[] {
    const reasons: string[] = [];
    const matches = operations.filter(v => v.operationId === operationId);
    if (matches.length !== 1) return ['Operation identity is missing or duplicated.'];
    const op = matches[0];
    if (!salesKinds.has(op.kind) || op.state !== 'MANUAL_REVIEW') reasons.push('Operation is not an unresolved Sales review.');
    if (!op.resultId) reasons.push('Operation has no durable bound result; cannot infer effects.');
    if (!op.reviewHistory?.length) reasons.push('Operator reconciliation evidence is missing.');
    if (reasons.length) return reasons;
    const id = op.resultId!;
    // A closure must never be approved against an ambiguous journal identity.
    // A duplicated reversal ID could otherwise satisfy the linked-reversal lookup.
    const journalIds = new Set<string>();
    for (const entry of data.journals) {
        if (journalIds.has(entry.id)) reasons.push('Duplicate GL journal identity; reconciliation is not trustworthy.');
        journalIds.add(entry.id);
    }
    if (reasons.length) return reasons;
    const originals = (sourceType: string) => data.journals.filter(j =>
        j.sourceType === sourceType && j.sourceId === id && !j.reversedJournalEntryId);
    if (op.kind === 'SALES_INVOICE_VOID') {
        const invoice = data.invoices.find(v => v.id === id);
        if (!invoice || invoice.status !== 'VOID') reasons.push('Invoice has not reached VOID state.');
        const gl = originals('CUSTOMER_INVOICE');
        if (gl.length !== 1 || gl[0].status !== 'REVERSED' || !gl[0].reversalJournalEntryId ||
            data.journals.filter(j => j.id === gl[0]?.reversalJournalEntryId && j.reversedJournalEntryId === gl[0]?.id && j.status === 'POSTED').length !== 1)
            reasons.push('Unique original and linked posted reversal GL are not verified.');
    } else if (op.kind === 'CUSTOMER_PAYMENT' || op.kind === 'SALES_PAYMENT_REVERSAL') {
        const payment = data.payments.find(v => v.id === id);
        const expected = op.kind === 'CUSTOMER_PAYMENT' ? 'RECEIVED' : 'REVERSED';
        if (!payment || payment.status !== expected) reasons.push(`Payment has not reached ${expected} state.`);
        const gl = originals('CUSTOMER_PAYMENT');
        if (gl.length !== 1 || gl[0].status !== (expected === 'RECEIVED' ? 'POSTED' : 'REVERSED'))
            reasons.push('Payment original GL status is not uniquely verified.');
        if (expected === 'REVERSED' && (gl.length !== 1 || !gl[0].reversalJournalEntryId ||
            data.journals.filter(j => j.id === gl[0]?.reversalJournalEntryId && j.reversedJournalEntryId === gl[0]?.id && j.status === 'POSTED').length !== 1))
            reasons.push('Payment linked posted reversal GL is not verified.');
    } else {
        const allocation = data.allocations.find(v => v.id === id);
        const expected = op.kind === 'SALES_CREDIT_APPLY' ? 'APPLIED' : 'REVERSED';
        if (!allocation || allocation.status !== expected) reasons.push(`Credit allocation has not reached ${expected} state.`);
        if (allocation && (!data.invoices.some(v => v.id === allocation.invoiceId) ||
            !data.creditNotes.some(v => v.id === allocation.creditNoteId)))
            reasons.push('Credit allocation is missing its invoice or credit note.');
        if (allocation && (!Number.isFinite(allocation.amount) || allocation.amount <= 0))
            reasons.push('Credit allocation amount is invalid.');
    }
    // Ignore ONLY this operation's own unresolved-intent finding. Other audit
    // failures and other pending intents must block closure.
    const report = inspectSalesRestart(data, operations);
    const blockers = report.findings.filter(f => f.severity === 'BLOCK' &&
        !(f.operationId === operationId && (f.code === 'SALES_OPERATION_UNRESOLVED' || f.code === 'SALES_OPERATION_RESULT_UNVERIFIED')));
    if (blockers.length) reasons.push(`Other financial inconsistencies remain: ${blockers.map(v => v.code).join(', ')}.`);
    return reasons;
}

function liveInput(): SalesAuditInput {
    const docs = salesRepository.getAll();
    return {
        quotes: docs.filter((v): v is Quote => v.type === 'QUOTE'),
        salesOrders: docs.filter((v): v is SalesOrder => v.type === 'SALES_ORDER'),
        invoices: docs.filter((v): v is Invoice => v.type === 'INVOICE'),
        payments: paymentRepository.getAll(),
        creditNotes: creditNoteRepository.getAll(),
        allocations: creditNoteRepository.getAllAllocations(),
        journals: journalEntryRepository.getAll(),
    };
}

/** Live account checks complement lifecycle proof; equal journal totals are insufficient. */
export function verifyCurrentRecoveryAccounting(operationId:string):string[] {
 const reasons:string[]=[],data=liveInput(),op=financialOperationJournal.list().find(o=>o.operationId===operationId),payment=data.payments.find(p=>p.id===op?.resultId);
 const amount=(n:number)=>Math.round(n*100),net=(lines:typeof data.journals[number]['lines'])=>{const map=new Map<string,number>();for(const l of lines)map.set(l.accountId,(map.get(l.accountId)??0)+amount(l.debit)-amount(l.credit));return JSON.stringify([...map].filter(([,v])=>v).sort(([a],[b])=>a.localeCompare(b)));};
 if(payment&&['CUSTOMER_PAYMENT','SALES_PAYMENT_REVERSAL'].includes(op!.kind)){
  const original=data.journals.find(j=>j.sourceType==='CUSTOMER_PAYMENT'&&j.sourceId===payment.id&&!j.reversedJournalEntryId),ar=accountRepository.getAll().find(a=>a.systemRole==='ACCOUNTS_RECEIVABLE');
  let debitAccount=bankAccountRepository.getById(payment.bankAccountId)?.glAccountId;
  if(payment.depositApplicationId){const s=snapshotRepositories().customerDeposits as {deposits:{id:string;liabilityAccountId:string}[];applications:{id:string;paymentId:string;depositId:string}[]};const a=s.applications.find(a=>a.id===payment.depositApplicationId&&a.paymentId===payment.id);debitAccount=a?s.deposits.find(d=>d.id===a.depositId)?.liabilityAccountId:undefined;}
  if(!original||!ar||!debitAccount||original.lines.length!==2||!original.lines.some(l=>l.accountId===debitAccount&&amount(l.debit)===amount(payment.amount)&&amount(l.credit)===0)||!original.lines.some(l=>l.accountId===ar.id&&amount(l.credit)===amount(payment.amount)&&amount(l.debit)===0))reasons.push('Payment journal bank/deposit and receivables accounts do not match the bound payment.');
 }
 const originals=data.journals.filter(j=>!j.reversedJournalEntryId&&j.sourceId===op?.resultId&&((op?.kind==='SALES_INVOICE_VOID'&&j.sourceType==='CUSTOMER_INVOICE')||(op?.kind==='SALES_PAYMENT_REVERSAL'&&j.sourceType==='CUSTOMER_PAYMENT')));
 for(const j of originals){const rev=data.journals.find(r=>r.id===j.reversalJournalEntryId);if(!rev||net(rev.lines)!==net(j.lines.map(l=>({...l,debit:l.credit,credit:l.debit}))))reasons.push('Reversal journal accounts do not exactly reverse the original.');}
 try{const asOfDate=[...data.journals.map(j=>j.journalDate),...data.invoices.map(i=>i.documentDate),...data.creditNotes.map(c=>c.creditDate),...data.payments.map(p=>p.paymentDate)].sort().at(-1)??'1970-01-01';const r=calculateAccountsReceivableGlReconciliation({accounts:accountRepository.getAll(),journalEntries:[...data.journals],asOfDate,customers:customerRepository.getAll(),documents:[...data.quotes,...data.salesOrders,...data.invoices],payments:[...data.payments],creditNotes:[...data.creditNotes],creditAllocations:[...data.allocations]});if(!r.reconciled||!Number.isFinite(r.difference))reasons.push('Current receivables subledger and GL do not reconcile.');}catch(e){reasons.push('Receivables reconciliation failed: '+(e as Error).message);}
 return reasons;
}

/** Explicit operator action, not a startup hook. Requires a second approver. */
export function closeVerifiedSalesReview(request: VerifiedClosureRequest) {
    if ((globalThis as Record<string, unknown>).__HTT_MAIN_HOST__ !== true && import.meta.env?.MODE !== 'test') {
        const reply = nativeRequest<{ result: any; view: BusinessView }>('business.command', { repository: 'salesRecovery', method: 'closeVerifiedSalesReview', args: [request] });
        hydrateBusiness(reply.view); return reply.result;
    }

    if(typeof request.approvalReference!=='string'||request.approvalReference.length>500)throw new Error('Provide an approval reference of 3–500 characters.');
    const operations = financialOperationJournal.list();
    const current=operations.find(o=>o.operationId===request.operationId);
    if(!current || !request.expectedRevision || salesReviewRevision(current)!==request.expectedRevision)throw new Error('Recovery evidence changed. Refresh and review before approval.');
    const reasons = current.kind==='BANK_RECONCILIATION' ? verifyReconciliationClosureEvidence(request.operationId) : isBankRecoveryKind(current.kind) ? verifyBankClosureEvidence(request.operationId) : verifySalesClosureEvidence(liveInput(), operations, request.operationId);
    if(current.kind!=='BANK_RECONCILIATION'&&!isBankRecoveryKind(current.kind)) reasons.push(...verifyCurrentRecoveryAccounting(request.operationId));
    const integrity=runFinancialConsistencyAudit();if(integrity.length)reasons.push('Financial consistency checks failed: '+integrity.map(i=>i.code).join(', '));
    if (reasons.length) throw new Error(`Financial recovery remains blocked: ${reasons.join(' ')}`);
    const operation = operations.find(v => v.operationId === request.operationId)!;
    // A second durable read is performed by closeReviewed; if persistence fails,
    // no closure is acknowledged. No financial records are changed here.
    const closed = financialOperationJournal.closeReviewed(
        request.operationId, operation.resultId!, request.approvalReference, request.approver);
    return { closed, remaining: inspectCurrentSalesRestart() };
}
