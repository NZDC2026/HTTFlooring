import { resolvePricingInstant, validatePricingSnapshot } from '../sales/data/pricingInstant';
import { visibleDocuments, isRecycled, purgedCreationOperation } from '../document-recycle/recycleState';
import { validateLineItemType } from '../inventory/data/itemTypes';
import { salesRecipient, validateRecipientSnapshot } from '../sales/data/salesRecipients';
import { validateAreaSnapshot } from '../sales/data/areaPacks';
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { requireDateKey } from '../../lib/businessDate';
import { assertPostingPeriod } from '../accounting/data/accountingPeriodRepository';
import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
import { customerRepository } from '../contacts/data/customerRepository';
import { supplierRepository } from '../contacts/data/supplierRepository';
import { accountRepository } from '../accounting/data/accountRepository';
import { salesRepository } from '../sales/data/salesRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { buildSalesLine } from '../sales/data/salesPricingService';
import { calculateDocumentTotals } from '../sales/data/salesCalculations';
import { taxSnapshot, businessSettings, exclusivePrice, configuredNumber } from '../business-workspace/configurationState';
import { taxPostingLines } from '../business-workspace/taxPosting';
import { assertProductQuantity } from '../business-workspace/productRules';
import type { SalesDocumentLine } from '../sales/types/salesDocument';
import type { SupplierBill, SupplierBillLine } from '../purchases/types/supplierBill';
const text = z.string().trim().min(1).max(200), optional = z.string().trim().max(2000).optional();
const salesLine = z.object({ requestedArea: z.number().finite().positive().max(1e9).optional(), productId: text, unitId: text, quantity: z.number().positive().finite(), unitPrice: z.number().nonnegative().finite().optional(), priceBasis: z.enum(['Inclusive', 'Exclusive']).optional() }).strict();
const expenseLine = z.object({ description: z.string().trim().min(1).max(500), accountId: text, quantity: z.number().positive().finite(), unitCost: z.number().nonnegative().finite(), taxCode: text, priceBasis: z.enum(['Inclusive', 'Exclusive']).optional() }).strict();
const salesPayload = z.object({ kind: z.enum(['ORDER', 'INVOICE']), customerId: text, pricingAt: text.optional(), pricingTimezone: text.optional(), locationId: text.or(z.literal('')).optional(), accountingContactId: text.or(z.literal('')).optional(), documentDate: text, dueDate: text.optional(), customerReference: optional, notes: optional, lines: z.array(salesLine).min(1).max(500) }).strict();
const billPayload = z.object({ kind: z.literal('EXPENSE'), supplierId: text, supplierInvoiceNumber: text, documentDate: text, dueDate: text, notes: optional, lines: z.array(expenseLine).min(1).max(500) }).strict();
export const parseManagedPayload = (raw: unknown) => z.union([salesPayload, billPayload]).parse(raw);
const captureAmount = z.number().finite().nonnegative().refine(n => Number.isSafeInteger(Math.round(n*100)) && n===Math.round(n*100)/100, 'Use an amount in whole cents within the supported range.');
const captureSchema = z.object({operationId:text,sourceName:z.string().trim().max(200),reviewed:z.boolean(),declared:z.object({subtotal:captureAmount,taxAmount:captureAmount,total:captureAmount}).strict(),payload:billPayload.extend({notes:z.string().trim().max(1000).optional()})}).strict();
export type CaptureInput = z.infer<typeof captureSchema>;
function capturePayload(input:CaptureInput):ExpensePayload{return {...input.payload,notes:[input.payload.notes,`Reviewed source: ${input.sourceName||'Manual entry'}`,`Declared net / tax / total: ${input.declared.subtotal.toFixed(2)} / ${input.declared.taxAmount.toFixed(2)} / ${input.declared.total.toFixed(2)}`].filter(Boolean).join('\n')};}
function reviewCaptureInput(input: CaptureInput) {
    const supplier = supplierRepository.getById(input.payload.supplierId);
    if (!supplier || supplier.status !== 'ACTIVE') throw new Error('Select an active supplier.');
    const built = build(input.payload), reference = input.payload.supplierInvoiceNumber.trim().toLowerCase();
    const bills = supplierBillRepository.getAll(), voidIds = new Set(bills.filter(b => b.status === 'VOID').map(b => b.id));
    const duplicates = [
        ...billDrafts.filter(d => d.operationId !== input.operationId && d.status !== 'CANCELLED'
            && !(d.status === 'POSTED' && d.documentId && voidIds.has(d.documentId))
            && d.payload.kind === 'EXPENSE' && d.payload.supplierId === input.payload.supplierId
            && d.payload.supplierInvoiceNumber.trim().toLowerCase() === reference).map(d => ({kind:'Entry draft',id:d.id})),
        ...bills.filter(b => b.status !== 'VOID' && b.supplierId === input.payload.supplierId
            && b.supplierInvoiceNumber.trim().toLowerCase() === reference).map(b => ({kind:'Supplier bill',id:b.id})),
    ];
    const labels = {subtotal:'net',taxAmount:'tax',total:'total'}, issues: string[] = [];
    if (Math.round((input.declared.subtotal + input.declared.taxAmount)*100) !== Math.round(input.declared.total*100))
        issues.push('Declared net plus tax does not equal the declared total.');
    for (const key of ['subtotal','taxAmount','total'] as const)
        if (Math.round(built.totals[key]*100) !== Math.round(input.declared[key]*100))
            issues.push(`Calculated ${labels[key]} does not match the source document.`);
    if (duplicates.length) issues.push('This supplier invoice reference already exists in an entry draft or supplier bill.');
    return {totals:built.totals,declared:input.declared,lines:built.lines,duplicates,issues,matches:issues.length===0};
}
export type SalesPayload = z.infer<typeof salesPayload>;
export type ExpensePayload = z.infer<typeof billPayload>;
export type ManagedDraft = {
    id: string;
    operationId: string;
    creationFingerprint: string;
    revision: number;
    kind: 'ORDER' | 'INVOICE' | 'EXPENSE';
    status: 'DRAFT' | 'APPROVED' | 'POSTED' | 'CANCELLED';
    payload: SalesPayload | ExpensePayload;
    lines: (SalesDocumentLine | SupplierBillLine)[];
    totals: {
        subtotal: number;
        taxAmount: number;
        total: number;
    };
    recipient?: import("../sales/types/salesDocument").SalesRecipientSnapshot;
    documentId?: string;
    createdAt: string;
    updatedAt: string;
    history: {
        action: string;
        actorId: string;
        at: string;
        reason?: string;
    }[];
};
export type ExpenseAccountOption = {
    id: string;
    code: string;
    name: string;
};
const actualExpenseOptions = () => accountRepository.getAll().filter(a => a.active && a.type === 'EXPENSE' && a.allowManualPosting && (!a.systemRole || a.systemRole === 'OPERATING_EXPENSE' || a.systemRole === 'FREIGHT')).map(a => ({ id: a.id, code: a.code, name: a.name }));
let expenseOptions: ExpenseAccountOption[] = actualExpenseOptions();
export const getExpenseAccountOptions = () => expenseOptions;
let salesDrafts: ManagedDraft[] = [], billDrafts: ManagedDraft[] = [], version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach(f => f()); };
export function useManagedDrafts(kind: 'sales' | 'expense') { useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => version, () => version); return visibleDocuments(kind === 'sales' ? salesDrafts : billDrafts); }
const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
function history(action: string, reason?: string) { return { action, actorId: trustedAuthorization.current()?.userId ?? 'local-test', at: new Date().toISOString(), ...(reason ? { reason } : {}) }; }
function taxAccounts(lines: ManagedDraft['lines']) {
    for (const l of lines) {
        if (!l.taxAmount)
            continue;
        for (const [id, type] of [[l.taxCollectedAccountId, 'LIABILITY'], [l.taxPaidAccountId, 'ASSET']] as const) {
            if (!id)
                continue;
            const a = accountRepository.requireById(id);
            if (!a.active || a.type !== type)
                throw new Error('A snapshotted tax posting account is no longer active or has the wrong type.');
        }
    }
}
function expenseAccount(id: string) {
    const a = accountRepository.requireById(id);
    if (!a.active || a.type !== 'EXPENSE' || !a.allowManualPosting || a.systemRole && a.systemRole !== 'OPERATING_EXPENSE' && a.systemRole !== 'FREIGHT')
        throw new Error('Use an active manual expense account, not an inventory, GRNI or control account.');
    return a;
}
function validateParties(row: ManagedDraft) {
    const p = row.payload;
    if (p.kind === 'EXPENSE') {
        const party = supplierRepository.getById(p.supplierId);
        if (!party || party.status !== 'ACTIVE')
            throw new Error('Select an active supplier.');
        for (const line of row.lines as SupplierBillLine[])
            expenseAccount(line.expenseAccountId!);
    }
    else {
        const party = customerRepository.getById(p.customerId);
        if (!party || party.status !== 'ACTIVE')
            throw new Error('Select an active customer.');
        for (const l of row.lines as SalesDocumentLine[])
            assertProductQuantity(l.productId, l.unitId, l.quantity, 'sell');
    }
    taxAccounts(row.lines);
}
function build(payload: SalesPayload | ExpensePayload) {
    requireDateKey(payload.documentDate, 'Document date');
    if (payload.dueDate) {
        requireDateKey(payload.dueDate, 'Due date');
        if (payload.dueDate < payload.documentDate)
            throw new Error('Due date cannot precede document date.');
    }
    if (payload.kind !== 'ORDER' && !payload.dueDate)
        throw new Error('Due date is required.');
    const pricingContext = payload.kind === 'EXPENSE' ? undefined : resolvePricingInstant(payload.documentDate, payload.pricingAt, payload.pricingTimezone);
    const lines: (SalesDocumentLine | SupplierBillLine)[] = payload.kind === 'EXPENSE' ? payload.lines.map(l => { expenseAccount(l.accountId); const tax = taxSnapshot(l.taxCode), netCost = exclusivePrice(l.unitCost, tax.taxRate, l.priceBasis), lineSubtotal = money(l.quantity * netCost), taxAmount = (l.priceBasis ?? businessSettings().basis) === 'Inclusive' ? money(l.quantity * l.unitCost - lineSubtotal) : money(lineSubtotal * tax.taxRate); return { id: crypto.randomUUID(), expenseAccountId: l.accountId, purchaseOrderLineId: '', productId: '', unitId: '', sku: 'SERVICE', description: l.description, unitSymbol: 'service', quantity: l.quantity, unitCost: netCost, ...tax, lineSubtotal, taxAmount, lineTotal: money(lineSubtotal + taxAmount) }; }) : payload.lines.map(l => buildSalesLine({ customerId: payload.customerId, documentDate: payload.documentDate, pricingContext, draft: l }));
    const totals = calculateDocumentTotals(lines as SalesDocumentLine[]);
    if (totals.total <= 0 || !Number.isFinite(totals.total))
        throw new Error('Document total must be finite and greater than zero.');
    return { lines, totals };
}
function repo(kind: 'sales' | 'expense') {
    const rows = () => kind === 'sales' ? salesDrafts : billDrafts;
    function saveRow(row: ManagedDraft) {
        if (kind === 'sales')
            salesDrafts = [...salesDrafts.filter(d => d.id !== row.id), row];
        else
            billDrafts = [...billDrafts.filter(d => d.id !== row.id), row];
        emit();
        return row;
    }
    const get = (id: string) => {
        const row = rows().find(d => d.id === id);
        if (!row || isRecycled(row.id))
            throw new Error('Draft not found or is in the recycle bin.');
        return row;
    };
    function expected(row: ManagedDraft, revision: number) {
        if (row.revision !== revision)
            throw new Error('Draft changed. Reload before editing or approving.');
    }
    function change(row: ManagedDraft, action: string, extra: Partial<ManagedDraft> = {}, reason?: string) { return saveRow({ ...row, ...extra, revision: row.revision + 1, updatedAt: new Date().toISOString(), history: [...row.history, history(action, reason)] }); }
    const repositorySave=(operationId:string,payload:ExpensePayload)=> expenseDraftRepository.save({operationId,payload});
    return {
        getAll: () => visibleDocuments(rows()),
        reviewCapture(raw:unknown){trustedAuthorization.require('purchases.bill');if(kind!=='expense')throw new Error('Capture is only available for expense bills.');return reviewCaptureInput(captureSchema.parse(raw));},
        capture(raw:unknown){trustedAuthorization.require('purchases.bill');if(kind!=='expense')throw new Error('Capture is only available for expense bills.');const input=captureSchema.parse(raw);if(!input.reviewed)throw new Error('Confirm that the supplier document has been reviewed.');const payload=capturePayload(input),prior=rows().find(d=>d.operationId===input.operationId);if(prior)return repositorySave(input.operationId,payload);const review=reviewCaptureInput(input);if(!review.matches)throw new Error(review.issues.join(' '));return repositorySave(input.operationId,payload);},
        save(raw: {
            operationId: string;
            id?: string;
            expectedRevision?: number;
            payload: SalesPayload | ExpensePayload;
        }) {
            const input = z.object({ operationId: text, id: text.optional(), expectedRevision: z.number().int().positive().optional(), payload: kind === 'sales' ? salesPayload : billPayload }).strict().parse(raw), fingerprint = JSON.stringify(input.payload);
            if (purgedCreationOperation(input.operationId)) throw new Error('This creation request belongs to a permanently purged draft. Use a new operation ID.');
            if (!input.id) {
                const prior = rows().find(d => d.operationId === input.operationId);
                if (prior) {
                    if (isRecycled(prior.id)) throw new Error('Recover the existing draft from the recycle bin.');
                    if (prior.creationFingerprint !== fingerprint)
                        throw new Error('Operation ID was used for different draft data.');
                    return prior;
                }
            }
            const old = input.id ? get(input.id) : undefined;
            if (old) {
                expected(old, input.expectedRevision ?? -1);
                if (old.status !== 'DRAFT')
                    throw new Error('Only unapproved drafts can be edited. Reopen an approved draft before editing.');
            }
            if (input.payload.kind !== 'EXPENSE') {
                const previous = old?.payload.kind !== 'EXPENSE' ? old?.payload : undefined;
                const preserved = previous && previous.documentDate === input.payload.documentDate && (!input.payload.pricingAt || input.payload.pricingAt === previous.pricingAt);
                const context = resolvePricingInstant(input.payload.documentDate, input.payload.pricingAt ?? (preserved ? previous.pricingAt : undefined), preserved ? previous.pricingTimezone : businessSettings().timezone);
                input.payload = { ...input.payload, ...context };
            }
            const built = build(input.payload), now = new Date().toISOString(), row: ManagedDraft = { id: old?.id ?? crypto.randomUUID(), operationId: old?.operationId ?? input.operationId, creationFingerprint: old?.creationFingerprint ?? fingerprint, revision: (old?.revision ?? 0) + 1, kind: input.payload.kind, status: 'DRAFT', payload: input.payload.kind === 'EXPENSE' ? input.payload : {...input.payload,lines:input.payload.lines.map((l,i)=>({...l,quantity:built.lines[i].quantity}))}, recipient: input.payload.kind === 'EXPENSE' ? undefined : salesRecipient(input.payload.customerId,input.payload), ...built, createdAt: old?.createdAt ?? now, updatedAt: now, history: [...(old?.history ?? []), history(old ? 'Edited' : 'Created')] };
            if (old && old.kind !== row.kind)
                throw new Error('Document kind cannot change.');
            validateParties(row);
            return saveRow(row);
        },
        approve(id: string, revision: number) {
            const row = get(id);
            if (row.status === 'APPROVED' && row.revision === revision + 1)
                return row;
            expected(row, revision);
            if (row.status !== 'DRAFT')
                throw new Error('Only a draft can be approved.');
            validateParties(row);
            return change(row, 'Approved', { status: 'APPROVED' });
        },
        reopen(id: string, revision: number, reason: string) {
            const row = get(id);
            expected(row, revision);
            if (row.status !== 'APPROVED' || reason.trim().length < 3)
                throw new Error('Only approved drafts can be reopened with a reason.');
            return change(row, 'Reopened', { status: 'DRAFT' }, reason);
        },
        cancel(id: string, revision: number, reason: string) {
            const row = get(id);
            expected(row, revision);
            if (row.status === 'POSTED' || row.status === 'CANCELLED' || reason.trim().length < 3)
                throw new Error('Only unposted drafts can be cancelled with a reason.');
            return change(row, 'Cancelled', { status: 'CANCELLED' }, reason);
        },
        post(id: string, revision: number) {
            const row = get(id);
            if (row.status === 'POSTED')
                return row;
            expected(row, revision);
            if (row.status !== 'APPROVED')
                throw new Error('Approve the draft before posting.');
            assertCurrentCrossModuleWriteSafe();
            assertPostingPeriod(row.payload.documentDate);
            validateParties(row);
            let documentId: string;
            const p = row.payload;
            if (p.kind === 'EXPENSE') {
                const party = supplierRepository.getById(p.supplierId)!;
                const now = new Date().toISOString(), bill: SupplierBill = { id: crypto.randomUUID(), managedDraftId: row.id, kind: 'EXPENSE', billNumber: configuredNumber('BILL', supplierBillRepository.getAll().map(b => b.billNumber), p.documentDate.slice(0, 4)), supplierInvoiceNumber: p.supplierInvoiceNumber, supplierId: party.id, supplierCode: party.code, supplierName: party.businessName, purchaseOrderId: '', purchaseOrderNumber: 'Expense / service bill', billDate: p.documentDate, dueDate: p.dueDate, status: 'OPEN', lines: structuredClone(row.lines) as SupplierBillLine[], totals: { ...row.totals, amountPaid: 0, amountCredited: 0, amountDue: row.totals.total }, notes: p.notes, createdAt: now, updatedAt: now };
                supplierBillRepository.insertExpenseBill(bill);
                const offsets = bill.lines.filter(l => l.lineSubtotal !== 0).map(l => ({ accountId: l.expenseAccountId!, description: l.description, debit: l.lineSubtotal, credit: 0 }));
                journalEntryRepository.post({ journalDate: bill.billDate, description: 'Expense bill ' + bill.billNumber, reference: bill.supplierInvoiceNumber, sourceType: 'SUPPLIER_BILL', sourceId: bill.id, lines: [...offsets, ...taxPostingLines(bill.lines, 'paid', true, bill.totals.taxAmount), { accountId: accountRepository.requireBySystemRole('ACCOUNTS_PAYABLE').id, debit: 0, credit: bill.totals.total }] });
                documentId = bill.id;
            }
            else {
                const data = { recipient: structuredClone(row.recipient), draftId: row.id, customerId: p.customerId, documentDate: p.documentDate, customerReference: p.customerReference, notes: p.notes, lines: row.lines as SalesDocumentLine[], totals: row.totals };
                documentId = p.kind === 'ORDER' ? salesRepository.createManagedOrder(data).id : salesRepository.createManagedInvoice({ ...data, dueDate: p.dueDate! }).id;
            }
            return change(row, 'Posted', { status: 'POSTED', documentId });
        },
        cancelOrder(id: string, reason: string) {
            const row = get(id);
            if (row.kind !== 'ORDER' || row.status !== 'POSTED')
                throw new Error('A confirmed managed order is required.');
            salesRepository.cancelManagedOrder(row.documentId!, reason);
            return change(row, 'Order cancelled', {}, reason);
        },
    };
}
export const managedSalesRepository = repo('sales'), expenseDraftRepository = repo('expense');
const draftSchema = z.object({ recipient: z.object({locationId: z.string().optional(),locationName: z.string().optional(),deliveryAddress: z.string().optional(),accountingContactId: z.string().optional(),accountingContactName: z.string().optional(),accountingEmail: z.string().email().optional()}).strict().optional(), id: text, operationId: text, creationFingerprint: z.string().max(1000000), revision: z.number().int().positive(), kind: z.enum(['ORDER', 'INVOICE', 'EXPENSE']), status: z.enum(['DRAFT', 'APPROVED', 'POSTED', 'CANCELLED']), payload: z.union([salesPayload, billPayload]), lines: z.array(z.object({ id: text, description: z.string().min(1), quantity: z.number().finite().positive(), unitSymbol: z.string().min(1), unitPrice: z.number().finite().nonnegative().optional(), unitCost: z.number().finite().nonnegative().optional(), taxRate: z.number().finite().min(0).max(1), taxCode: text, taxPaidAccountId: text.optional(), taxCollectedAccountId: text.optional(), lineSubtotal: z.number().finite().nonnegative(), taxAmount: z.number().finite().nonnegative(), lineTotal: z.number().finite().nonnegative() }).passthrough()).min(1), totals: z.object({ subtotal: z.number().finite(), taxAmount: z.number().finite(), total: z.number().finite() }), documentId: text.optional(), createdAt: text, updatedAt: text, history: z.array(z.object({ action: text, actorId: text, at: text, reason: z.string().optional() }).strict()).min(1) }).strict();
for (const kind of ['sales', 'expense'] as const)
    registerRepository(kind === 'sales' ? 'managedSalesDocuments' : 'expenseBillDrafts', { repository: kind === 'sales' ? managedSalesRepository : expenseDraftRepository, read: kind === 'sales' ? 'sales.read' : 'purchases.read', commands: {reviewCapture:kind==='expense'?'purchases.bill':null,capture:kind==='expense'?'purchases.bill':null, save: kind === 'sales' ? 'sales.manage' : 'purchases.bill', approve: kind === 'sales' ? 'sales.manage' : 'accounting.post', reopen: kind === 'sales' ? 'sales.manage' : 'accounting.post', cancel: kind === 'sales' ? 'sales.manage' : 'purchases.bill', post: kind === 'sales' ? 'sales.manage' : 'purchases.bill', cancelOrder: kind === 'sales' ? 'sales.manage' : null }, snapshot: () => kind === 'sales' ? { drafts: salesDrafts } : { drafts: billDrafts, options: actualExpenseOptions() }, restore: v => {
            if (kind === 'sales')
                salesDrafts = v.drafts;
            else {
                billDrafts = v.drafts;
                expenseOptions = v.options;
            }
        }, publish: emit, validate: (v, snapshots) => {
            const { drafts } = z.object({ drafts: z.array(draftSchema), ...(kind === 'expense' ? { options: z.array(z.object({ id: text, code: text, name: text }).strict()) } : {}) }).strict().parse(v);
            for (const d of drafts) {
                validateRecipientSnapshot(d.recipient);
                if (d.kind !== d.payload.kind || (kind === 'expense') !== (d.kind === 'EXPENSE'))
                    throw new Error('Draft kind mismatch.');
                requireDateKey(d.payload.documentDate);
                if (d.payload.dueDate) {
                    requireDateKey(d.payload.dueDate);
                    if (d.payload.dueDate < d.payload.documentDate)
                        throw new Error('Draft due date is invalid.');
                }
                const snapshotsAny = snapshots as Record<string, any>, partyId = d.payload.kind === 'EXPENSE' ? d.payload.supplierId : d.payload.customerId, parties = d.payload.kind === 'EXPENSE' ? snapshotsAny.suppliers.suppliers : snapshotsAny.customers.customers;
                if (!parties.some((p: any) => p.id === partyId) || d.lines.length !== d.payload.lines.length)
                    throw new Error('Draft party or line references are invalid.');
                for (const [i, line] of d.lines.entries()) {
                    const raw = d.payload.lines[i] as any, l = line as Record<string, any>;
                    if (d.kind !== 'EXPENSE') {
                        validateAreaSnapshot(l as any);
                        validatePricingSnapshot(l, d.payload.documentDate);
                        if (d.payload.kind !== 'EXPENSE' && (d.payload.pricingAt !== l.pricingAt || d.payload.pricingTimezone !== l.pricingTimezone)) throw new Error('Draft pricing context mismatch.');
                        validateLineItemType(l as any,snapshotsAny.products.products.find((p:any)=>p.id===l.productId));
                        if (l.requestedArea !== raw.requestedArea) throw new Error('Draft area requirement mismatch.');
                    }
                    if (typeof l.quantity !== 'number' || !Number.isFinite(l.quantity) || l.quantity <= 0 || (raw.requestedArea === undefined && l.quantity !== raw.quantity) || money(l.lineSubtotal + l.taxAmount) !== l.lineTotal)
                        throw new Error('Draft line amounts are invalid.');
                    if (d.kind === 'EXPENSE') {
                        if (typeof l.unitCost !== 'number')
                            throw new Error('Expense line unit cost is invalid.');
                        if (l.expenseAccountId !== raw.accountId || !snapshotsAny.accounts.accounts.some((a: any) => a.id === l.expenseAccountId && a.type === 'EXPENSE'))
                            throw new Error('Draft expense account reference is invalid.');
                    }
                    else if (typeof l.unitPrice !== 'number' || l.productId !== raw.productId || l.unitId !== raw.unitId || !snapshotsAny.products.products.some((p: any) => p.id === l.productId && p.units.some((u: any) => u.id === l.unitId)))
                        throw new Error('Draft product/unit reference is invalid.');
                    for (const [field, type] of [['taxPaidAccountId', 'ASSET'], ['taxCollectedAccountId', 'LIABILITY']])
                        if (l[field] && !snapshotsAny.accounts.accounts.some((a: any) => a.id === l[field] && a.type === type))
                            throw new Error('Draft tax account reference is invalid.');
                }
                for (const key of ['subtotal', 'taxAmount', 'total'] as const) {
                    const field = key === 'subtotal' ? 'lineSubtotal' : key === 'total' ? 'lineTotal' : 'taxAmount';
                    if (money(d.lines.reduce((n, l) => n + l[field], 0)) !== d.totals[key])
                        throw new Error('Draft totals do not match lines.');
                }
                if (d.status === 'POSTED') {
                    const s = snapshots as Record<string, any>, rows = d.kind === 'EXPENSE' ? s.supplierBills.supplierBills : d.kind === 'ORDER' ? s.sales.salesOrders : s.sales.invoices;
                    if (!rows.some((r: any) => r.id === d.documentId && r.managedDraftId === d.id && r.totals.total === d.totals.total))
                        throw new Error('Posted draft source reference is invalid.');
                }
            }
        } });

// Internal main-process operation; never exposed as a desktop command.
export function purgeManagedDraftRecords(ids: Set<string>) {
 if ([...salesDrafts,...billDrafts].some(r=>ids.has(r.id)&&(r.status!=='DRAFT'||r.documentId))) throw new Error('Only unposted drafts may be purged.');
 salesDrafts=salesDrafts.filter(r=>!ids.has(r.id)); billDrafts=billDrafts.filter(r=>!ids.has(r.id)); emit();
}
