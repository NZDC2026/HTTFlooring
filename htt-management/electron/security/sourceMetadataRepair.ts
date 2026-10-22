import {createHash} from 'node:crypto';
import {z} from 'zod';
import {validateRepositories} from './businessSnapshot';
import {snapshotRepositories,validateRegisteredSnapshots} from '../../src/features/security/repositoryHost';
import {trustedAuthorization} from '../../src/features/security/trustedAuthorization';
import {financialOperationJournal,type FinancialOperation} from '../../src/lib/persistence/financialOperationJournal';
import {purchasePostingOperationRepository} from '../../src/features/purchases/data/purchasePostingOperationRepository';
import {financialStateStorage} from '../../src/lib/persistence/financialStateStorage';
import {auditFinancialConsistency} from '../../src/lib/persistence/financialConsistencyAudit';
import {auditSalesConsistency,type SalesAuditInput} from '../../src/features/sales/data/salesConsistencyAudit';
import {verifySalesClosureEvidence} from '../../src/features/sales/data/salesVerifiedRecoveryClosure';
import {calculateAccountsReceivableGlReconciliation} from '../../src/features/accounting/data/accountsReceivableGlReconciliationService';
import {calculateAccountsPayableGlReconciliation} from '../../src/features/accounting/data/accountsPayableGlReconciliationService';
import {calculatePurchaseAccountingReconciliation} from '../../src/features/purchases/data/purchaseAccountingReconciliationService';
import {calculateDepositReconciliation} from '../../src/features/customer-deposits/depositReconciliation';
import {calculatePrepaymentReconciliation} from '../../src/features/supplier-prepayments/prepaymentReconciliation';
import {applyReviewedInvoiceSummary} from '../../src/features/sales/data/salesRepository';
import {applyReviewedCustomerCreditSummary} from '../../src/features/sales/data/creditNoteRepository';
import {applyReviewedBillSummary} from '../../src/features/purchases/data/supplierBillRepository';
import {applyReviewedSupplierCreditSummary} from '../../src/features/purchases/data/supplierCreditRepository';
import type {SourceRepairChange,SourceRepairPlan} from '../../src/features/financial-repair/sourceRepairContract';
const id=z.string().trim().min(1).max(200),digest=z.string().regex(/^[a-f0-9]{64}$/),reference=z.string().trim().min(3).max(200);
const propose=z.object({operationId:id,expectedDigest:digest,reference,summary:z.string().trim().min(10).max(4000),businessChecked:z.literal(true),glChecked:z.literal(true),externalEvidenceChecked:z.literal(true)}).strict();
const execute=z.object({operationId:id,proposalId:id,expectedDigest:digest,approvalReference:reference,confirm:z.literal(true)}).strict();
const cents=(n:number)=>Math.round(n*100), money=(n:number)=>n/100;
function canonical(v:unknown):unknown {if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));return v;}
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const salesKinds=['CUSTOMER_PAYMENT','SALES_INVOICE_VOID','SALES_PAYMENT_REVERSAL','SALES_CREDIT_APPLY','SALES_CREDIT_REVERSAL'];
function salesData(s:Record<string,any>):SalesAuditInput{return {...s.sales,payments:s.customerPayments.payments,creditNotes:s.customerCredits.creditNotes,allocations:s.customerCredits.allocations,journals:s.journals.journalEntries};}
function same(a:unknown,b:unknown){return hash(a)===hash(b);}
function intentResult(op:FinancialOperation,s:Record<string,any>):string|undefined {
    const data=salesData(s);
    let candidates:{id:string}[]=[];
    if(op.kind==='CUSTOMER_PAYMENT') {
        const input=z.object({customerId:id,invoiceId:id,paymentDate:id,amount:z.number().finite().positive(),method:id,bankAccountId:id,reference:z.string().optional(),notes:z.string().optional()}).strict().parse(JSON.parse(op.fingerprint));
        candidates=data.payments.filter(p=>p.status==='RECEIVED'&&!p.depositApplicationId&&same(input,{customerId:p.customerId,invoiceId:p.invoiceId,paymentDate:p.paymentDate,amount:p.amount,method:p.method,bankAccountId:p.bankAccountId,reference:p.reference,notes:p.notes}));
    } else if(op.kind==='SALES_CREDIT_APPLY') {
        const input=z.object({creditNoteId:id,invoiceId:id,allocationDate:id,amount:z.number().finite().positive()}).strict().parse(JSON.parse(op.fingerprint));
        candidates=data.allocations.filter(a=>a.status==='APPLIED'&&same(input,{creditNoteId:a.creditNoteId,invoiceId:a.invoiceId,allocationDate:a.allocationDate,amount:a.amount}));
    } else if(op.kind==='SALES_INVOICE_VOID') candidates=data.invoices.filter(i=>i.id===op.fingerprint&&i.status==='VOID');
    else if(op.kind==='SALES_PAYMENT_REVERSAL') candidates=data.payments.filter(p=>p.id===op.fingerprint&&p.status==='REVERSED');
    else if(op.kind==='SALES_CREDIT_REVERSAL') candidates=data.allocations.filter(a=>a.id===op.fingerprint&&a.status==='REVERSED');
    if(candidates.length!==1||op.resultId&&op.resultId!==candidates[0].id)return;
    return candidates[0].id;
}
/** Pure projection: no repository restore/mutation, even during preview. */
function buildPlan():SourceRepairPlan {
    const before=snapshotRepositories() as Record<string,any>,s=structuredClone(before),ops=financialOperationJournal.list(),blockers:string[]=[],changes:SourceRepairChange[]=[];
    // Exclude repair cases only. Reviews/source changes and new financial effects invalidate approval.
    const evidenceDigest=hash({business:before,operations:ops.filter(o=>o.kind!=='SOURCE_METADATA_REPAIR')});
    const add=(kind:SourceRepairChange['kind'],row:any,path:string,old:Record<string,unknown>,next:Record<string,unknown>,evidence:string[])=>{
        if(!same(old,next))changes.push({kind,id:row.id,path,before:old,after:next,evidence});
    };
    const validAmount=(n:number)=>Number.isFinite(n)&&n>=0&&Number.isSafeInteger(cents(n))&&n===money(cents(n));
    for(const [cached,source] of [['transactions',s.bankTransactions.bankTransactions],['transfers',s.bankTransactions.bankTransfers],['payments',s.customerPayments.payments],['supplierBills',s.supplierBills.supplierBills],['supplierPayments',s.supplierPayments.supplierPayments],['supplierCredits',s.supplierCredits.supplierCredits],['supplierCreditAllocations',s.supplierCredits.allocations],['journals',s.journals.journalEntries]] as const)
        if(!same(s.financialCache[cached],source))blockers.push('Financial cache/source copies disagree: '+cached+'. Restore a consistent snapshot first.');
    for(const invoice of s.sales.invoices) {
        if(['VOID','DRAFT'].includes(invoice.status))continue;
        const payments=s.customerPayments.payments.filter((p:any)=>p.invoiceId===invoice.id&&p.status==='RECEIVED'),allocations=s.customerCredits.allocations.filter((a:any)=>a.invoiceId===invoice.id&&a.status==='APPLIED');
        const paid=payments.reduce((n:number,p:any)=>n+cents(p.amount),0),credited=allocations.reduce((n:number,a:any)=>n+cents(a.amount),0),total=cents(invoice.totals.total);
        if(!validAmount(invoice.totals.total)||[...payments,...allocations].some((p:any)=>!validAmount(p.amount)||p.amount<=0)||paid+credited>total){blockers.push('Invalid or excessive invoice settlement: '+invoice.id);continue;}
        const after={amountPaid:money(paid),amountDue:money(total-paid-credited),status:total===paid+credited?'PAID':paid+credited>0?'PARTIALLY_PAID':invoice.status==='OVERDUE'?'OVERDUE':'ISSUED'};
        add('INVOICE',invoice,'/sales/invoices/'+encodeURIComponent(invoice.id),{amountPaid:invoice.amountPaid,amountDue:invoice.amountDue,status:invoice.status},after,[...payments.map((p:any)=>'payment:'+p.id),...allocations.map((a:any)=>'allocation:'+a.id),'CUSTOMER_INVOICE:'+invoice.id]);
        Object.assign(invoice,after);
    }
    for(const bill of s.supplierBills.supplierBills) {
        if(bill.status==='VOID')continue;
        const payments=s.supplierPayments.supplierPayments.filter((p:any)=>p.status==='POSTED').flatMap((p:any)=>p.allocations.filter((a:any)=>a.supplierBillId===bill.id).map((a:any)=>({...a,supplierId:p.supplierId,paymentId:p.id}))),allocations=s.supplierCredits.allocations.filter((a:any)=>a.supplierBillId===bill.id&&a.status==='APPLIED');
        const paid=payments.reduce((n:number,p:any)=>n+cents(p.amount),0),credited=allocations.reduce((n:number,a:any)=>n+cents(a.amount),0),total=cents(bill.totals.total);
        if(!validAmount(bill.totals.total)||[...payments,...allocations].some((p:any)=>!validAmount(p.amount)||p.amount<=0||p.supplierId!==bill.supplierId)||paid+credited>total){blockers.push('Invalid or excessive bill settlement: '+bill.id);continue;}
        const after={amountPaid:money(paid),amountCredited:money(credited),amountDue:money(total-paid-credited),status:total===paid+credited?'PAID':paid+credited>0?'PARTIALLY_PAID':'OPEN'};
        add('BILL',bill,'/purchases/bills/'+encodeURIComponent(bill.id),{amountPaid:bill.totals.amountPaid,amountCredited:bill.totals.amountCredited,amountDue:bill.totals.amountDue,status:bill.status},after,[...payments.map((p:any)=>'supplier-payment:'+p.paymentId),...allocations.map((a:any)=>'supplier-allocation:'+a.id),'SUPPLIER_BILL:'+bill.id]);
        const {status,...totals}=after;bill.status=status;Object.assign(bill.totals,totals);
    }
    for(const customer of [true,false]) {
        const credits=customer?s.customerCredits.creditNotes:s.supplierCredits.supplierCredits,allocations=customer?s.customerCredits.allocations:s.supplierCredits.allocations;
        for(const credit of credits){if(['VOID','DRAFT'].includes(credit.status))continue;
            const active=allocations.filter((a:any)=>a[customer?'creditNoteId':'supplierCreditId']===credit.id&&a.status==='APPLIED'),applied=active.reduce((n:number,a:any)=>n+cents(a.amount),0),refunded=cents(credit.amountRefunded??0),total=cents(credit.totals.total);
            // Refund history is validated separately; never infer/refill missing refunds.
            if(!validAmount(credit.totals.total)||!validAmount(credit.amountRefunded??0)||active.some((a:any)=>!validAmount(a.amount)||a.amount<=0)||applied+refunded>total){blockers.push('Invalid or excessive credit settlement: '+credit.id);continue;}
            const after={amountApplied:money(applied),amountAvailable:money(total-applied-refunded),status:total===applied+refunded?'FULLY_APPLIED':'ISSUED'};
            add(customer?'CUSTOMER_CREDIT':'SUPPLIER_CREDIT',credit,customer?'/sales/credit-notes/'+encodeURIComponent(credit.id):'/purchases/credits/'+encodeURIComponent(credit.id),{amountApplied:credit.amountApplied,amountAvailable:credit.amountAvailable,status:credit.status},after,[...active.map((a:any)=>'allocation:'+a.id),'Refund history and original GL retained']);Object.assign(credit,after);
        }
    }
    // All unresolved sales results must match saved requests uniquely. Never pick among duplicates.
    const pending=ops.filter(o=>o.state!=='COMPLETED'&&o.kind!=='SOURCE_METADATA_REPAIR'),inferred=new Map<string,string>();
    for(const op of pending){
        if(!salesKinds.includes(op.kind)){blockers.push('Separate recovery required for '+op.kind+': '+op.operationId);continue;}
        let result:string|undefined;try{result=intentResult(op,s);}catch{/* Invalid durable requests remain blocked. */}
        if(!result){blockers.push('Saved request has no unique exact existing result: '+op.operationId);continue;}
        if(ops.some(o=>o.operationId!==op.operationId&&o.kind===op.kind&&o.resultId===result)||[...inferred.entries()].some(([key,value])=>value===result&&ops.find(o=>o.operationId===key)?.kind===op.kind)) {blockers.push('Another same-kind operation claims result '+result);continue;}
        inferred.set(op.operationId,result);
        add('OPERATION',{id:op.operationId},'/accounting/recovery',{state:op.state,resultId:op.resultId??null},{state:'COMPLETED',resultId:result},['Exact saved request matches one existing result','All original/reversal GL, settlement and subledger checks required']);
    }
    for(const purchase of s.purchaseOperations.filter((o:any)=>o.status!=='POSTED'||o.error?.startsWith('Restored after restart:'))){
        const bill=s.supplierBills.supplierBills.find((b:any)=>b.id===purchase.sourceId),gl=s.journals.journalEntries.filter((j:any)=>j.sourceType==='SUPPLIER_BILL'&&j.sourceId===purchase.sourceId&&!j.reversedJournalEntryId);
        if(purchase.kind!=='SUPPLIER_BILL'||purchase.key!=='SUPPLIER_BILL:'+purchase.sourceId||!bill||bill.status==='VOID'||!['JOURNAL','PURCHASE_ORDER','MATCHES','BILL'].every(step=>purchase.completedSteps.includes(step))||gl.length!==1||gl[0].status!=='POSTED'||gl[0].journalDate!==bill.billDate){blockers.push('Purchase posting requires separate source recovery: '+purchase.key);continue;}
        const po=s.purchaseOrders.purchaseOrders.find((p:any)=>p.id===bill.purchaseOrderId);
        if(!po||po.supplierId!==bill.supplierId||bill.lines.some((l:any)=>{
            const line=po.lines.find((v:any)=>v.id===l.purchaseOrderLineId),matches=s.receiptMatches.matches.filter((m:any)=>m.supplierBillId===bill.id&&m.supplierBillLineId===l.id&&m.status==='ACTIVE');
            const billed=s.supplierBills.supplierBills.filter((b:any)=>b.purchaseOrderId===po.id&&b.status!=='VOID').flatMap((b:any)=>b.lines).filter((v:any)=>v.purchaseOrderLineId===l.purchaseOrderLineId).reduce((n:number,v:any)=>n+v.quantity,0);
            return !line||Math.abs(line.billedQuantity-billed)>1e-8||Math.abs(matches.reduce((n:number,m:any)=>n+m.matchedQuantity,0)-l.quantity)>1e-8||matches.some((m:any)=>!s.goodsReceipts.goodsReceipts.some((r:any)=>r.id===m.goodsReceiptId&&r.lines.some((v:any)=>v.id===m.goodsReceiptLineId&&v.productId===l.productId)));
        })){blockers.push('Purchase order/receipt matching evidence is incomplete: '+purchase.key);continue;}
        add('PURCHASE_OPERATION',{id:purchase.key},'/purchases/bills/'+encodeURIComponent(bill.id),{status:purchase.status,error:purchase.error??null},{status:'POSTED',error:null},['All four source-owned steps recorded',gl[0].id,'PO quantities, FIFO receipt matches and purchase controls verified']);
    }
    // A summary correction cannot excuse a wrongly dated or wrongly mapped source journal.
    const ar=s.accounts.accounts.find((a:any)=>a.systemRole==='ACCOUNTS_RECEIVABLE')?.id,ap=s.accounts.accounts.find((a:any)=>a.systemRole==='ACCOUNTS_PAYABLE')?.id;
    for(const supplier of [false,true])for(const payment of supplier?s.supplierPayments.supplierPayments:s.customerPayments.payments){
        const journal=s.journals.journalEntries.filter((j:any)=>j.sourceType===(supplier?'SUPPLIER_PAYMENT':'CUSTOMER_PAYMENT')&&j.sourceId===payment.id&&!j.reversedJournalEntryId);
        let bank=s.bankAccounts.bankAccounts.find((b:any)=>b.id===payment.bankAccountId)?.glAccountId;
        if(payment.depositApplicationId){const a=s.customerDeposits.applications.find((a:any)=>a.id===payment.depositApplicationId&&a.paymentId===payment.id);bank=s.customerDeposits.deposits.find((d:any)=>d.id===a?.depositId)?.liabilityAccountId;}
        if(payment.prepaymentApplicationId){const a=s.supplierPrepayments.applications.find((a:any)=>a.id===payment.prepaymentApplicationId&&a.paymentId===payment.id);bank=s.supplierPrepayments.prepayments.find((d:any)=>d.id===a?.prepaymentId)?.assetAccountId;}
        const debit=supplier?ap:bank,credit=supplier?bank:ar;
        if(!validAmount(payment.amount)||payment.amount<=0||journal.length!==1||journal[0].status!==(payment.status==='REVERSED'?'REVERSED':'POSTED')||journal[0].journalDate!==payment.paymentDate||!debit||!credit||journal[0].lines.length!==2||!journal[0].lines.some((l:any)=>l.accountId===debit&&cents(l.debit)===cents(payment.amount)&&l.credit===0)||!journal[0].lines.some((l:any)=>l.accountId===credit&&cents(l.credit)===cents(payment.amount)&&l.debit===0))blockers.push('Payment original date, bank/control accounts or amount do not match: '+payment.id);
        if(supplier&&payment.allocations.some((a:any)=>{const b=s.supplierBills.supplierBills.find((b:any)=>b.id===a.supplierBillId);return !b||b.supplierId!==payment.supplierId||!validAmount(a.amount)||a.amount<=0||(payment.status==='POSTED'&&b.status==='VOID');}))blockers.push('Supplier payment allocation references are invalid: '+payment.id);
    }
    for(const allocation of s.supplierCredits.allocations){const credit=s.supplierCredits.supplierCredits.find((c:any)=>c.id===allocation.supplierCreditId),bill=s.supplierBills.supplierBills.find((b:any)=>b.id===allocation.supplierBillId);
        if(!credit||!bill||credit.supplierId!==allocation.supplierId||bill.supplierId!==allocation.supplierId||!validAmount(allocation.amount)||allocation.amount<=0||allocation.status==='APPLIED'&&(credit.status==='VOID'||bill.status==='VOID'))blockers.push('Supplier credit allocation references are invalid: '+allocation.id);
    }
    for(const j of s.journals.journalEntries){if(!['POSTED','REVERSED'].includes(j.status)||new Set(j.lines.map((l:any)=>l.id)).size!==j.lines.length||j.lines.some((l:any)=>!validAmount(l.debit)||!validAmount(l.credit)||l.debit>0&&l.credit>0||!s.accounts.accounts.some((a:any)=>a.id===l.accountId)))blockers.push('Invalid GL identity, lifecycle, account or line amounts: '+j.id);}
    for(const original of s.journals.journalEntries.filter((j:any)=>j.status==='REVERSED')){
        const reversals=s.journals.journalEntries.filter((j:any)=>j.id===original.reversalJournalEntryId&&j.reversedJournalEntryId===original.id&&j.status==='POSTED');
        const net=(lines:any[])=>{const values=new Map<string,number>();for(const l of lines)values.set(l.accountId,(values.get(l.accountId)??0)+cents(l.debit)-cents(l.credit));return [...values].filter(([,v])=>v).sort(([a],[b])=>a.localeCompare(b));};
        if(reversals.length!==1||reversals[0].journalDate<original.journalDate||!same(net(reversals[0].lines),net(original.lines.map((l:any)=>({...l,debit:l.credit,credit:l.debit})))))blockers.push('Original/reversal account proof failed: '+original.id);
    }
    const data=salesData(s),projectedOps=ops.map(o=>inferred.has(o.operationId)?{...o,resultId:inferred.get(o.operationId),state:'COMPLETED' as const}:o);
    for(const [operationId,resultId] of inferred){const op=ops.find(o=>o.operationId===operationId)!;
        const reviewed={...op,resultId,state:'MANUAL_REVIEW' as const,reviewHistory:op.reviewHistory?.length?op.reviewHistory:[{reference:'prospective-proof',operator:'prospective-reviewer',recordedAt:op.updatedAt,summary:'Prospective proof only; no review is persisted.'}]};
        blockers.push(...verifySalesClosureEvidence(data,projectedOps.map(o=>o.operationId===operationId?reviewed:o),operationId).map(r=>operationId+': '+r));
    }
    blockers.push(...auditFinancialConsistency({transactions:s.bankTransactions.bankTransactions,transfers:s.bankTransactions.bankTransfers,payments:data.payments,journals:data.journals,invoices:data.invoices,creditNotes:data.creditNotes,supplierBills:s.supplierBills.supplierBills,supplierPayments:s.supplierPayments.supplierPayments,supplierCredits:s.supplierCredits.supplierCredits}).map(i=>i.code+': '+i.entityId));
    blockers.push(...auditSalesConsistency(data).map(i=>i.code+': '+i.entityId));
    s.financialCache.supplierBills=structuredClone(s.supplierBills.supplierBills);s.financialCache.supplierCredits=structuredClone(s.supplierCredits.supplierCredits);
    try {validateRepositories(s,before);validateRegisteredSnapshots(s);}catch(e){blockers.push('Source snapshot validation: '+(e as Error).message);}
    const asOfDate=[...data.journals.map(j=>j.journalDate),...data.invoices.map(i=>i.documentDate),...s.supplierBills.supplierBills.map((b:any)=>b.billDate)].sort().at(-1)??'1970-01-01',common={accounts:s.accounts.accounts,journalEntries:data.journals as any,asOfDate};
    for(const [label,check] of [
        ['AR',()=>calculateAccountsReceivableGlReconciliation({...common,customers:s.customers.customers,documents:[...data.quotes,...data.salesOrders,...data.invoices],payments:data.payments as any,creditNotes:data.creditNotes as any,creditAllocations:data.allocations as any})],
        ['AP',()=>calculateAccountsPayableGlReconciliation({...common,suppliers:s.suppliers.suppliers,bills:s.supplierBills.supplierBills,payments:s.supplierPayments.supplierPayments,credits:s.supplierCredits.supplierCredits,creditAllocations:s.supplierCredits.allocations})],
        ['Inventory/GRNI/PPV',()=>calculatePurchaseAccountingReconciliation({...common,costMovements:s.costMovements.movements,receipts:s.goodsReceipts.goodsReceipts,matches:s.receiptMatches.matches})],
        ['Deposits',()=>calculateDepositReconciliation({deposits:s.customerDeposits,accounts:s.accounts.accounts,journals:[...data.journals],banks:s.bankAccounts.bankAccounts,customers:s.customers.customers,asOfDate})],
        ['Prepayments',()=>calculatePrepaymentReconciliation({prepayments:s.supplierPrepayments,accounts:s.accounts.accounts,journals:[...data.journals],banks:s.bankAccounts.bankAccounts,suppliers:s.suppliers.suppliers,asOfDate})],
    ] as const)try{const r=check();if(!r.reconciled)blockers.push(label+' does not reconcile after projection.');}catch(e){blockers.push(label+' check failed: '+(e as Error).message);}
    if(!changes.length)blockers.push('No supported source metadata defects found.');
    return{evidenceDigest,eligible:!blockers.length,blockers:[...new Set(blockers)],changes};
}
export function previewSourceRepair(raw:unknown):SourceRepairPlan {trustedAuthorization.require('audit.read');z.object({}).strict().parse(raw);return buildPlan();}
export function proposeSourceRepair(raw:unknown){
    const actor=trustedAuthorization.require('accounting.recover'),input=propose.parse(raw),prior=financialOperationJournal.list().find(o=>o.operationId===input.operationId);
    const fingerprint=JSON.stringify(input);
    if(prior){if(prior.kind!=='SOURCE_METADATA_REPAIR'||prior.state==='COMPLETED'&&prior.fingerprint!==fingerprint)throw new Error('Operation ID was used for different recovery data.');if(prior.fingerprint===fingerprint||prior.repairProposal?.reference===input.reference&&prior.repairProposal.evidenceDigest===input.expectedDigest&&prior.repairProposal.summary===input.summary)return prior;}
    if(financialOperationJournal.getUnresolved().some(o=>o.kind==='SOURCE_METADATA_REPAIR'&&o.operationId!==input.operationId))throw new Error('An existing source repair proposal must be reviewed or replaced first.');
    const plan=buildPlan();if(!plan.eligible||plan.evidenceDigest!==input.expectedDigest)throw new Error('Source repair blocked or evidence changed: '+plan.blockers.join(' '));
    if(!prior){financialOperationJournal.begin(input.operationId,'SOURCE_METADATA_REPAIR',fingerprint);financialOperationJournal.bindResult(input.operationId,input.operationId);}
    financialOperationJournal.recordManualReview(input.operationId,input.reference,actor.userId,input.summary);
    return financialOperationJournal.attachRepairProposal(input.operationId,{id:crypto.randomUUID(),action:'REPAIR_SOURCE_METADATA',evidenceDigest:plan.evidenceDigest,planJson:JSON.stringify({...plan,operationId:input.operationId,resultId:input.operationId,action:'REPAIR_SOURCE_METADATA'}),reviewer:actor.userId,reference:input.reference,summary:input.summary,proposedAt:new Date().toISOString(),status:'PROPOSED'});
}
export function executeSourceRepair(raw:unknown){
    const actor=trustedAuthorization.require('accounting.recover'),input=execute.parse(raw),op=financialOperationJournal.list().find(o=>o.operationId===input.operationId),p=op?.repairProposal;
    if(op?.kind!=='SOURCE_METADATA_REPAIR'||!p||p.id!==input.proposalId||p.evidenceDigest!==input.expectedDigest)throw new Error('Source repair proposal changed.');
    if(p.status==='EXECUTED'){if(p.approver!==actor.userId||p.approvalReference!==input.approvalReference)throw new Error('Already executed under another approval.');return op;}
    if(p.reviewer===actor.userId||op.reviewHistory?.some(h=>h.operator===actor.userId))throw new Error('A different authorized operator must approve.');
    const plan=buildPlan(),saved=JSON.parse(p.planJson);
    if(!plan.eligible||plan.evidenceDigest!==p.evidenceDigest||!same(plan.changes,saved.changes))throw new Error('Source repair evidence changed. Refresh and replace the proposal.');
    const originals=financialOperationJournal.list();
    for(const c of plan.changes.filter(c=>c.kind==='OPERATION'))if(originals.find(o=>o.operationId===c.id)?.reviewHistory?.some(h=>h.operator===actor.userId))throw new Error('Approver recorded review evidence on a source operation. Use another authorized operator.');
    return financialStateStorage.transaction(()=>{
        for(const c of plan.changes){
            if(c.kind==='INVOICE')applyReviewedInvoiceSummary(c.id,c.after as any);
            else if(c.kind==='BILL')applyReviewedBillSummary(c.id,c.after as any);
            else if(c.kind==='CUSTOMER_CREDIT')applyReviewedCustomerCreditSummary(c.id,c.after as any);
            else if(c.kind==='SUPPLIER_CREDIT')applyReviewedSupplierCreditSummary(c.id,c.after as any);
        }
        // Rebuild the proof from the actual changed repositories before acknowledging any closure.
        const after=buildPlan();if(after.blockers.some(b=>b!=='No supported source metadata defects found.')||after.changes.some(c=>c.kind!=='OPERATION'&&c.kind!=='PURCHASE_OPERATION'))throw new Error('Post-repair source verification failed: '+after.blockers.join(' '));
        for(const [index,c] of plan.changes.filter(c=>c.kind==='OPERATION').entries()){
            financialOperationJournal.adoptReviewedResult(c.id,String(c.after.resultId));
            financialOperationJournal.recordManualReview(c.id,p.reference+' / '+index,p.reviewer,'Source repair '+p.id+': exact request, original GL and settlement verified.');
            financialOperationJournal.closeReviewed(c.id,String(c.after.resultId),input.approvalReference+' / '+index,actor.userId);
        }
        for(const c of plan.changes.filter(c=>c.kind==='PURCHASE_OPERATION'))purchasePostingOperationRepository.setStatus(c.id,'POSTED');
        const final=buildPlan();if(final.changes.length||final.blockers.some(b=>b!=='No supported source metadata defects found.'))throw new Error('Final source verification failed.');
        return financialOperationJournal.finishRepair(input.operationId,p.id,actor.userId,input.approvalReference,final.evidenceDigest);
    });
}

export function withdrawSourceRepair(raw:unknown){
    const actor=trustedAuthorization.require('accounting.recover'),input=z.object({operationId:id,proposalId:id,reason:z.string().trim().min(10).max(500)}).strict().parse(raw);
    const plan=buildPlan();if(plan.changes.length||plan.blockers.some(b=>b!=='No supported source metadata defects found.'))throw new Error('Source defects remain. Replace the reviewed proposal or use validated backup recovery; withdrawal cannot release unresolved source blockers.');
    return financialOperationJournal.withdrawSourceRepair(input.operationId,input.proposalId,actor.userId,input.reason);
}
