import { persistCreditNoteState } from '../sales/data/creditNoteStorage';
import { assertJournalUncleared } from '../finance-closure/settlementRepository';
import { calculateAccountsReceivableGlReconciliation } from '../accounting/data/accountsReceivableGlReconciliationService';
import { calculateAccountsPayableGlReconciliation } from '../accounting/data/accountsPayableGlReconciliationService';
import { calculateInventoryGlReconciliation } from '../inventory/data/inventoryGlReconciliationService';
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository, snapshotRepositories, restoreRepositories } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { requireDateKey } from '../../lib/businessDate';
import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
import { assertPostingPeriod } from '../accounting/data/accountingPeriodRepository';
import { accountRepository } from '../accounting/data/accountRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { stockRepository } from '../inventory/data/stockRepository';
import { inventoryMovementRepository } from '../inventory/data/inventoryMovementRepository';
import { receiveInventoryCost } from '../inventory/data/inventoryCostEngine';
import { getProductById } from '../inventory/data/mockProducts';
import { inventorySiteRepository } from '../inventory/data/inventorySiteRepository';
import { financialStateStorage } from '../../lib/persistence/financialStateStorage';
import { persistSalesDocuments } from '../sales/data/invoiceStorage';
const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const text = z.string().trim().min(1).max(200), amount = z.number().finite().refine(n => cents(n) === n, 'Amounts must use cents precision');
const ledgerRow = z.object({ accountId: text, debit: amount.nonnegative(), credit: amount.nonnegative() }).strict();
const partyRow = z.object({ contactId: text, reference: text, date: text, dueDate: text, amount }).strict();
const inputSchema = z.object({ operationId: text, date: text, reason: z.string().trim().min(3).max(1000), gl: z.array(ledgerRow).min(2).max(5000), ar: z.array(partyRow).max(10000), ap: z.array(partyRow).max(10000), banks: z.array(z.object({ bankAccountId: text, amount }).strict()).max(500), stock: z.array(z.object({ siteId: text, productId: text, quantity: z.number().positive().finite(), unitCost: z.number().nonnegative().finite() }).strict()).max(10000) }).strict();
export type OpeningInput = z.infer<typeof inputSchema>;
type Batch = {
    id: string;
    operationId: string;
    fingerprint: string;
    date: string;
    reason: string;
    status: 'POSTED' | 'REVERSED';
    actor: string;
    createdAt: string;
    reversalDate?: string;
    reversalReason?: string;
    journalIds: string[];
    invoiceIds: string[];
    billIds: string[];
    customerCreditIds: string[];
    supplierCreditIds: string[];
    movementIds: string[];
    costMovementIds: string[];
    priorStock: unknown[];
    priorCost: unknown[];
    priorJournalIds: string[];
    priorMovementIds: string[];
};
let batches: Batch[] = [], version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach(f => f()); };
export function useOpeningBalances() { useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => version, () => version); return batches; }
function state() { return snapshotRepositories() as Record<string, any>; }
function sync(s: Record<string, any>) { restoreRepositories(s); persistSalesDocuments(s.sales); persistCreditNoteState(s.customerCredits); financialStateStorage.update('supplierBills', s.supplierBills.supplierBills); financialStateStorage.update('supplierCredits', s.supplierCredits.supplierCredits); }
function unique(values: string[], label: string) {
    if (new Set(values).size !== values.length)
        throw new Error('Duplicate ' + label + '.');
}
function prepare(raw: OpeningInput) {
    const input = inputSchema.parse(raw);
    requireDateKey(input.date, 'Cutover date');
    assertPostingPeriod(input.date);
    assertCurrentCrossModuleWriteSafe();
    if (batches.some(b => b.status === 'POSTED'))
        throw new Error('An opening batch is already active. Reverse the unused batch before replacing it.');
    const s = state();
    if (s.journals.journalEntries.some((j: any) => j.journalDate >= input.date))
        throw new Error('Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.');
    if (s.inventoryMovements.movements.some((m: any) => m.occurredAt.slice(0, 10) >= input.date))
        throw new Error('Cutover must be after existing inventory activity.');
    unique(input.gl.map(r => r.accountId), 'GL account');
    unique(input.banks.map(r => r.bankAccountId), 'bank');
    unique(input.stock.map(r => r.siteId + ':' + r.productId), 'site/product');
    const arBefore = calculateAccountsReceivableGlReconciliation({ customers: s.customers.customers, documents: [...s.sales.quotes, ...s.sales.salesOrders, ...s.sales.invoices], payments: s.customerPayments.payments, creditNotes: s.customerCredits.creditNotes, creditAllocations: s.customerCredits.allocations, accounts: s.accounts.accounts, journalEntries: s.journals.journalEntries, asOfDate: input.date });
    const apBefore = calculateAccountsPayableGlReconciliation({ suppliers: s.suppliers.suppliers, bills: s.supplierBills.supplierBills, payments: s.supplierPayments.supplierPayments, credits: s.supplierCredits.supplierCredits, creditAllocations: s.supplierCredits.allocations, accounts: s.accounts.accounts, journalEntries: s.journals.journalEntries, asOfDate: input.date });
    const stockBefore = calculateInventoryGlReconciliation({ accounts: s.accounts.accounts, journalEntries: s.journals.journalEntries, costMovements: s.costMovements.movements, asOfDate: input.date });
    if (!arBefore.reconciled || !apBefore.reconciled || !stockBefore.reconciled)
        throw new Error(`Existing balances do not reconcile with GL: AR ${arBefore.difference.toFixed(2)}, AP ${apBefore.difference.toFixed(2)}, inventory ${stockBefore.difference.toFixed(2)}. Resolve existing differences before importing opening balances.`);
    for (const b of s.stock.balances) {
        const cost = s.costBalances.balances.find((c: any) => c.siteId === b.siteId && c.productId === b.productId);
        if (b.quantityOnHand !== (cost?.quantityOnHand ?? 0))
            throw new Error('Existing stock quantity and valuation quantity differ.');
    }
    const accounts = accountRepository.getAll(), role = (r: any) => accountRepository.requireBySystemRole(r).id;
    const signed = (id: string) => cents(input.gl.filter(r => r.accountId === id).reduce((n, r) => n + r.debit - r.credit, 0));
    for (const r of input.gl) {
        const a = accountRepository.requireById(r.accountId);
        if (!a.active || !['ASSET', 'LIABILITY', 'EQUITY'].includes(a.type) || (r.debit > 0 && r.credit > 0) || r.debit + r.credit <= 0)
            throw new Error('Opening GL requires active balance-sheet accounts and one positive debit or credit per row.');
    }
    const debit = cents(input.gl.reduce((n, r) => n + r.debit, 0)), credit = cents(input.gl.reduce((n, r) => n + r.credit, 0));
    if (debit !== credit || !debit)
        throw new Error('Opening trial balance does not balance.');
    const ar = cents(input.ar.reduce((n, r) => n + r.amount, 0)), ap = cents(input.ap.reduce((n, r) => n + r.amount, 0));
    if (signed(role('ACCOUNTS_RECEIVABLE')) !== ar || signed(role('ACCOUNTS_PAYABLE')) !== -ap)
        throw new Error('AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.');
    for (const [kind, rows] of [['ar', input.ar], ['ap', input.ap]] as const) {
        unique(rows.map(r => r.contactId + ':' + r.reference.toLowerCase()), kind + ' reference');
        for (const r of rows) {
            requireDateKey(r.date);
            requireDateKey(r.dueDate);
            if (!r.amount || r.date > input.date || r.dueDate < r.date)
                throw new Error('Invalid outstanding document amount/date.');
            const contacts = kind === 'ar' ? s.customers.customers : s.suppliers.suppliers;
            if (!contacts.some((c: any) => c.id === r.contactId))
                throw new Error('Opening contact not found.');
            const existing = kind === 'ar' ? [...s.sales.invoices.map((d: any) => [d.customerId, d.documentNumber]), ...s.customerCredits.creditNotes.map((d: any) => [d.customerId, d.creditNoteNumber])] : [...s.supplierBills.supplierBills.map((d: any) => [d.supplierId, d.supplierInvoiceNumber]), ...s.supplierCredits.supplierCredits.map((d: any) => [d.supplierId, d.supplierCreditNumber])];
            if (existing.some(([id, ref]: string[]) => id === r.contactId && ref.toLowerCase() === r.reference.toLowerCase()))
                throw new Error('Historical document reference already exists.');
        }
    }
    let inventory = 0;
    for (const r of input.stock) {
        const p = getProductById(r.productId), site = inventorySiteRepository.getById(r.siteId);
        if (!p || p.status !== 'ACTIVE' || p.itemType === 'SERVICE' || site?.status !== 'ACTIVE')
            throw new Error('Opening stock requires active stocked products/sites.');
        if (Math.round(r.quantity * 10000) / 10000 !== r.quantity)
            throw new Error('Stock quantities use at most four decimal places.');
        inventory = cents(inventory + cents(r.quantity * r.unitCost));
    }
    if (signed(role('INVENTORY')) !== inventory)
        throw new Error('Stock valuation must equal imported inventory GL.');
    for (const b of s.bankAccounts.bankAccounts) {
        const detail = input.banks.find(r => r.bankAccountId === b.id);
        if (signed(b.glAccountId) !== (detail?.amount ?? 0))
            throw new Error('Bank detail must equal imported bank GL.');
        if (detail && (!b.active || input.date < b.openingBalanceDate || b.openingBalance !== 0))
            throw new Error('Opening bank must be active with zero metadata balance and an opening date on/before cutover.');
    }
    for (const b of input.banks)
        if (!s.bankAccounts.bankAccounts.some((a: any) => a.id === b.bankAccountId))
            throw new Error('Unknown opening bank account.');
    const bankIds = new Set(s.bankAccounts.bankAccounts.map((b: any) => b.glAccountId));
    if (accounts.some(a => a.systemRole === 'BANK' && !bankIds.has(a.id) && signed(a.id) !== 0))
        throw new Error('Bank GL requires a linked bank account.');
    return { input, s, debit, credit, ar, ap, inventory };
}
export const openingBalanceRepository = {
    preview(raw: OpeningInput) { const { input, debit, credit, ar, ap, inventory } = prepare(raw); return { date: input.date, debit, credit, ar, ap, inventory, bank: cents(input.banks.reduce((n, r) => n + r.amount, 0)), documents: input.ar.length + input.ap.length }; },
    post(raw: OpeningInput) {
        const parsed = inputSchema.parse(raw), fingerprint = JSON.stringify(parsed), old = batches.find(b => b.operationId === parsed.operationId);
        if (fingerprint.length > 50000000)
            throw new Error('Opening import exceeds 50 MB.');
        if (old) {
            if (old.fingerprint !== fingerprint)
                throw new Error('Operation ID already used for different opening data.');
            return old;
        }
        const { input, s } = prepare(parsed), id = crypto.randomUUID(), now = new Date().toISOString(), batch: Batch = { id, operationId: input.operationId, fingerprint, date: input.date, reason: input.reason, status: 'POSTED', actor: trustedAuthorization.current()?.userId ?? '', createdAt: now, journalIds: [], invoiceIds: [], billIds: [], customerCreditIds: [], supplierCreditIds: [], movementIds: [], costMovementIds: [], priorStock: structuredClone(s.stock.balances), priorCost: structuredClone(s.costBalances.balances), priorJournalIds: s.journals.journalEntries.map((j: any) => j.id), priorMovementIds: s.inventoryMovements.movements.map((m: any) => m.id) };
        const role = (r: any) => accountRepository.requireBySystemRole(r).id, clearing = role('OWNERS_EQUITY');
        let clearingDebit = 0, clearingCredit = 0;
        for (const kind of ['ar', 'ap'] as const)
            for (const row of input[kind]) {
                const docId = crypto.randomUUID(), value = Math.abs(row.amount), totals = { subtotal: value, taxAmount: 0, total: value }, common = { id: docId, openingBalanceImportId: id, originalDocumentDate: row.date, createdAt: now, updatedAt: now, lines: [], totals };
                let source: 'CUSTOMER_INVOICE' | 'CREDIT_NOTE' | 'SUPPLIER_BILL' | 'SUPPLIER_CREDIT';
                if (kind === 'ar' && row.amount > 0) {
                    s.sales.invoices.push({ ...common, type: 'INVOICE', documentNumber: row.reference, customerId: row.contactId, documentDate: input.date, dueDate: row.dueDate, status: 'ISSUED', amountPaid: 0, amountDue: value, notes: `Opening outstanding only; original date ${row.date}. ${input.reason}` });
                    batch.invoiceIds.push(docId);
                    source = 'CUSTOMER_INVOICE';
                }
                else if (kind === 'ar') {
                    s.customerCredits.creditNotes.push({ ...common, creditNoteNumber: row.reference, customerId: row.contactId, sourceInvoiceId: 'opening:' + id, creditDate: input.date, status: 'ISSUED', reason: input.reason, issuedAt: now, amountApplied: 0, amountAvailable: value });
                    batch.customerCreditIds.push(docId);
                    source = 'CREDIT_NOTE';
                }
                else {
                    const supplier = s.suppliers.suppliers.find((c: any) => c.id === row.contactId), party = { supplierId: supplier.id, supplierCode: supplier.code, supplierName: supplier.businessName };
                    if (row.amount > 0) {
                        s.supplierBills.supplierBills.push({ ...common, ...party, billNumber: row.reference, supplierInvoiceNumber: row.reference, purchaseOrderId: '', purchaseOrderNumber: 'Opening balance', billDate: input.date, dueDate: row.dueDate, status: 'OPEN', totals: { ...totals, amountPaid: 0, amountCredited: 0, amountDue: value }, notes: `Opening outstanding only; original date ${row.date}. ${input.reason}` });
                        batch.billIds.push(docId);
                        source = 'SUPPLIER_BILL';
                    }
                    else {
                        s.supplierCredits.supplierCredits.push({ ...common, ...party, creditNumber: row.reference, supplierCreditNumber: row.reference, sourceSupplierBillId: 'opening:' + id, sourceSupplierBillNumber: row.reference, creditDate: input.date, status: 'ISSUED', reason: input.reason, issuedAt: now, amountApplied: 0, amountAvailable: value });
                        batch.supplierCreditIds.push(docId);
                        source = 'SUPPLIER_CREDIT';
                    }
                }
                const debitControl = (kind === 'ar') === (row.amount > 0);
                const j = journalEntryRepository.post({ journalDate: input.date, description: 'Opening outstanding ' + row.reference, reference: row.reference, sourceType: source, sourceId: docId, lines: [{ accountId: role(kind === 'ar' ? 'ACCOUNTS_RECEIVABLE' : 'ACCOUNTS_PAYABLE'), debit: debitControl ? value : 0, credit: debitControl ? 0 : value }, { accountId: clearing, debit: debitControl ? 0 : value, credit: debitControl ? value : 0 }] });
                batch.journalIds.push(j.id);
                if (debitControl)
                    clearingDebit += value;
                else
                    clearingCredit += value;
            }
        // Preserve source journals just posted while restoring appended document collections.
        s.journals = state().journals;
        sync(s);
        const general = input.gl.filter(r => ![role('ACCOUNTS_RECEIVABLE'), role('ACCOUNTS_PAYABLE')].includes(r.accountId));
        if (clearingDebit || clearingCredit)
            general.push({ accountId: clearing, debit: cents(clearingDebit), credit: cents(clearingCredit) });
        // Consolidate same-account clearing lines into a single signed balance.
        const grouped = new Map<string, number>();
        for (const r of general)
            grouped.set(r.accountId, cents((grouped.get(r.accountId) ?? 0) + r.debit - r.credit));
        const lines = [...grouped].filter(([, n]) => n !== 0).map(([accountId, n]) => ({ accountId, debit: Math.max(0, n), credit: Math.max(0, -n) }));
        if (lines.length) {
            const j = journalEntryRepository.post({ journalDate: input.date, description: 'Opening trial balance ' + input.reason, sourceType: 'OPENING_BALANCE', sourceId: id, lines });
            batch.journalIds.push(j.id);
        }
        for (const r of input.stock) {
            const p = getProductById(r.productId)!, u = p.units.find(u => u.id === p.baseUnitId)!;
            const m = inventoryMovementRepository.create({ movementType: 'ADJUSTMENT_IN', siteId: r.siteId, productId: p.id, baseUnitId: p.baseUnitId, quantityBase: r.quantity, transactionUnitId: u.id, transactionUnitSymbol: u.symbol, transactionQuantity: r.quantity, conversionToBase: 1, referenceType: 'MANUAL', referenceId: id, occurredAt: input.date, notes: 'Opening stock' });
            stockRepository.receive({ siteId: r.siteId, productId: p.id, baseUnitId: p.baseUnitId, quantityBase: r.quantity });
            const cost = receiveInventoryCost({ siteId: r.siteId, productId: p.id, unitId: u.id, quantity: r.quantity, transactionUnitCost: r.unitCost, movementType: 'ADJUSTMENT_IN', referenceType: 'MANUAL', referenceId: id, inventoryMovementId: m.id, occurredAt: input.date });
            batch.movementIds.push(m.id);
            batch.costMovementIds.push(cost.movement.id);
        }
        batches = [...batches, batch];
        emit();
        return batch;
    },
    reverse(input: {
        id: string;
        date: string;
        reason: string;
    }) {
        requireDateKey(input.date);
        assertPostingPeriod(input.date);
        assertCurrentCrossModuleWriteSafe();
        if (!input.reason?.trim() || input.reason.trim().length < 3)
            throw new Error('Reversal reason is required.');
        const batch = batches.find(b => b.id === input.id);
        if (!batch)
            throw new Error('Opening batch not found.');
        if (batch.status === 'REVERSED')
            return batch;
        if (input.date < batch.date)
            throw new Error('Reversal date precedes cutover.');
        const s = state();
        if (s.journals.journalEntries.some((j: any) => !batch.priorJournalIds.includes(j.id) && !batch.journalIds.includes(j.id)) || s.inventoryMovements.movements.some((m: any) => !batch.priorMovementIds.includes(m.id) && !batch.movementIds.includes(m.id)))
            throw new Error('Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.');
        const openingInvoices = s.sales.invoices.filter((d: any) => batch.invoiceIds.includes(d.id)), openingBills = s.supplierBills.supplierBills.filter((d: any) => batch.billIds.includes(d.id)), openingCredits = [...s.customerCredits.creditNotes.filter((d: any) => batch.customerCreditIds.includes(d.id)), ...s.supplierCredits.supplierCredits.filter((d: any) => batch.supplierCreditIds.includes(d.id))];
        if (openingInvoices.some((d: any) => d.amountPaid !== 0 || d.amountDue !== d.totals.total) || openingBills.some((d: any) => d.totals.amountPaid !== 0 || d.totals.amountCredited !== 0) || openingCredits.some((d: any) => d.amountApplied !== 0 || (d.amountRefunded ?? 0) !== 0))
            throw new Error('Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.');
        for (const key of ['customerSettlements', 'supplierRefunds'])
            if (JSON.stringify(s[key]).includes(batch.id))
                throw new Error('Opening balances have downstream settlements.');
        for (const journalId of batch.journalIds)
            assertJournalUncleared(journalId);
        for (const journalId of batch.journalIds)
            journalEntryRepository.reverse({ journalEntryId: journalId, reversalDate: input.date, reason: input.reason });
        const now = new Date().toISOString();
        for (const [key, field, ids] of [['sales', 'invoices', batch.invoiceIds], ['supplierBills', 'supplierBills', batch.billIds], ['customerCredits', 'creditNotes', batch.customerCreditIds], ['supplierCredits', 'supplierCredits', batch.supplierCreditIds]] as const)
            s[key][field] = s[key][field].map((d: any) => ids.includes(d.id) ? { ...d, status: 'VOID', voidedAt: input.date, voidReason: input.reason, updatedAt: now, ...('amountAvailable' in d ? { amountAvailable: 0 } : {}) } : d);
        // Offset movements preserve dated valuation history; quantities/cost balances return exactly to their pre-import state.
        for (const movement of s.inventoryMovements.movements.filter((m: any) => batch.movementIds.includes(m.id)))
            s.inventoryMovements.movements.push({ ...movement, id: crypto.randomUUID(), movementNumber: movement.movementNumber + '-REV', movementType: 'ADJUSTMENT_OUT', quantityBase: -movement.quantityBase, transactionQuantity: -movement.transactionQuantity, occurredAt: input.date, createdAt: now, notes: input.reason });
        for (const movement of s.costMovements.movements.filter((m: any) => batch.costMovementIds.includes(m.id))) {
            const prior = (batch.priorCost as any[]).find(p => p.siteId === movement.siteId && p.productId === movement.productId);
            s.costMovements.movements.push({ ...movement, id: crypto.randomUUID(), costMovementNumber: movement.costMovementNumber + '-REV', movementType: 'ADJUSTMENT_OUT', quantityBase: -movement.quantityBase, valueChange: -movement.valueChange, quantityAfter: prior?.quantityOnHand ?? 0, averageCostAfter: prior?.averageCostPerBaseUnit ?? 0, inventoryValueAfter: prior?.inventoryValue ?? 0, occurredAt: input.date, createdAt: now, inventoryMovementId: undefined, notes: input.reason });
        }
        s.stock.balances = batch.priorStock;
        s.costBalances.balances = batch.priorCost;
        s.journals = state().journals;
        sync(s);
        batches = batches.map(b => b.id === batch.id ? { ...b, status: 'REVERSED', reversalDate: input.date, reversalReason: input.reason } : b);
        emit();
        return batches.find(b => b.id === batch.id)!;
    },
};
registerRepository('openingBalances', { repository: openingBalanceRepository, read: 'accounting.read', commands: { preview: 'accounting.post', post: 'accounting.post', reverse: 'accounting.post' }, snapshot: () => ({ batches }), restore: v => { batches = v.batches; }, publish: emit, validate: (v, snapshots) => {
        const rows = z.object({ batches: z.array(z.object({ id: text, operationId: text, date: text, status: z.enum(['POSTED', 'REVERSED']), journalIds: z.array(text), invoiceIds: z.array(text), billIds: z.array(text), customerCreditIds: z.array(text), supplierCreditIds: z.array(text), fingerprint: z.string().min(1).max(50000000), reason: z.string().min(3), actor: text, createdAt: text, movementIds: z.array(text), costMovementIds: z.array(text), priorJournalIds: z.array(text), priorMovementIds: z.array(text), priorStock: z.array(z.object({ siteId: text, productId: text, baseUnitId: text, quantityOnHand: z.number().finite().nonnegative(), updatedAt: text }).strict()), priorCost: z.array(z.object({ siteId: text, productId: text, baseUnitId: text, quantityOnHand: z.number().finite().nonnegative(), averageCostPerBaseUnit: z.number().finite().nonnegative(), inventoryValue: z.number().finite().nonnegative(), costingMethod: z.literal('MOVING_WEIGHTED_AVERAGE'), updatedAt: text }).strict()), reversalDate: text.optional(), reversalReason: z.string().optional() }).strict()) }).strict().parse(v);
        for (const row of rows.batches) {
            const original = inputSchema.parse(JSON.parse(row.fingerprint));
            if (original.operationId !== row.operationId || original.date !== row.date)
                throw new Error('Opening import identity is invalid.');
            if (row.status === 'REVERSED' && !row.reversalDate)
                throw new Error('Opening reversal date is missing.');
            if (row.reversalDate)
                requireDateKey(row.reversalDate);
            requireDateKey(row.date);
            const s = snapshots as Record<string, any>;
            if (row.journalIds.some(id => !s.journals.journalEntries.some((j: any) => j.id === id)))
                throw new Error('Opening journal reference is invalid.');
            for (const [key, ids] of [['inventoryMovements', row.movementIds], ['costMovements', row.costMovementIds]] as const)
                if (ids.some(id => !s[key].movements.some((m: any) => m.id === id && m.referenceId === row.id)))
                    throw new Error('Opening movement reference is invalid.');
            for (const [key, field, ids] of [['sales', 'invoices', row.invoiceIds], ['supplierBills', 'supplierBills', row.billIds], ['customerCredits', 'creditNotes', row.customerCreditIds], ['supplierCredits', 'supplierCredits', row.supplierCreditIds]] as const)
                if (ids.some(id => !s[key][field].some((d: any) => d.id === id && d.openingBalanceImportId === row.id)))
                    throw new Error('Opening document reference is invalid.');
        }
    } });
