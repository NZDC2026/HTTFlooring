import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { salesRepository } from '../sales/data/salesRepository';
import { salesFulfilmentRepository } from '../sales/data/salesFulfilmentRepository';
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { stockRepository } from '../inventory/data/stockRepository';
import { inventoryMovementRepository } from '../inventory/data/inventoryMovementRepository';
import { inventoryCostMovementRepository } from '../inventory/data/inventoryCostMovementRepository';
import {fifoLayers,consumeFifo} from '../inventory/data/fifo';
import { restoreInventoryCost } from '../inventory/data/inventoryCostEngine';
import { roundInventoryCost } from '../inventory/data/inventoryCostCalculations';
import { inventoryCostBalanceRepository } from '../inventory/data/inventoryCostBalanceRepository';
import { inventorySiteRepository } from '../inventory/data/inventorySiteRepository';
import { getProductById } from '../inventory/data/mockProducts';
import { accountRepository } from '../accounting/data/accountRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { businessDateKey, requireDateKey } from '../../lib/businessDate';
import { assertPostingPeriod } from '../accounting/data/accountingPeriodRepository';
import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
const text = z.string().trim().min(1).max(200), qty = z.number().finite().positive().refine(n => Math.round(n * 10000) / 10000 === n), amount = z.number().finite().nonnegative();
export const customerReturnInput = z.object({ operationId: text, invoiceId: text, creditNoteId: text.optional(), returnDate: text, reason: z.string().trim().min(3).max(2000), lines: z.array(z.object({ costMovementId: text, invoiceLineId: text, quantity: qty }).strict()).min(1).max(500) }).strict();
const lineSchema = z.object({ costMovementId: text, invoiceLineId: text, fulfilmentId: text, productId: text, unitId: text, baseUnitId: text, siteId: text, description: z.string(), quantity: qty, conversionToBase: qty, quantityBase: qty, inventoryValue: amount, unitCostBase: amount, movementId: text, restoredCostId: text, reversalMovementId: text.optional(), reversalCostId: text.optional() }).strict();
const rowSchema = z.object({ id: text, number: text, operationId: text, fingerprint: z.string(), invoiceId: text, invoiceNumber: text, customerId: text, creditNoteId: text, ownsCredit: z.boolean(), returnDate: text, reason: text.max(2000), status: z.enum(['POSTED', 'REVERSED']), lines: z.array(lineSchema).min(1), inventoryValue: amount, journalId: text.optional(), createdBy: text, createdAt: text, reversalDate: text.optional(), reversalReason: text.optional(), reversedBy: text.optional() }).strict();
export type CustomerReturn = z.infer<typeof rowSchema>;
let rows: CustomerReturn[] = [], version = 0;
const listeners = new Set<() => void>(), emit = () => { version++; listeners.forEach(fn => fn()); };
const q = (n: number) => Math.round(n * 10000) / 10000, m = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export function useCustomerReturns() { useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => version, () => version); return rows; }
function chronology(siteId: string, productId: string, date: string) { if (inventoryCostMovementRepository.getAll().some(c => c.siteId === siteId && c.productId === productId && businessDateKey(c.occurredAt) > date)) throw new Error('Return date precedes later inventory activity at this site.'); }
export function availableCustomerReturnSources(invoiceId: string) {
    const invoice = salesRepository.getAll().find(d => d.id === invoiceId && d.type === 'INVOICE');
    if (!invoice || invoice.type !== 'INVOICE' || ['VOID', 'DRAFT'].includes(invoice.status) || invoice.openingBalanceImportId) return [];
    const result: { costMovementId: string; invoiceLineId: string; fulfilmentId: string; productId: string; unitId: string; baseUnitId: string; siteId: string; description: string; conversionToBase: number; availableQuantity: number; originalQuantityBase: number; originalValue: number; unitCostBase: number; dispatchDate: string }[] = [];
    for (const f of salesFulfilmentRepository.getAll().filter(f => f.salesOrderId === invoice.sourceSalesOrderId && f.status === 'ACTIVE')) {
        const used = new Set<string>();
        for (const line of f.lines) {
            const source = invoice.lines.find(l => l.id === line.salesOrderLineId && l.productId === line.productId && l.unitId === line.unitId);
            const cost = inventoryCostMovementRepository.getAll().find(c => c.referenceType === 'SALE' && c.referenceId === f.id && c.movementType === 'ISSUE' && c.productId === line.productId && inventoryMovementRepository.getAll().some(m => m.id === c.inventoryMovementId && m.transactionUnitId === line.unitId) && c.siteId === f.siteId && q(-c.quantityBase) === q(line.fulfilledBaseQuantity) && !used.has(c.id));
            if (!source || !cost) continue; used.add(cost.id);
            const returned = rows.filter(r => r.status === 'POSTED').flatMap(r => r.lines).filter(l => l.costMovementId === cost.id).reduce((n, l) => n + l.quantityBase, 0);
            result.push({ costMovementId: cost.id, invoiceLineId: source.id, fulfilmentId: f.id, productId: line.productId, unitId: line.unitId, baseUnitId: cost.baseUnitId, siteId: f.siteId, description: source.description, conversionToBase: line.conversionToBase, availableQuantity: Math.floor(Math.max(0, -cost.quantityBase - returned) / line.conversionToBase * 10000 + 1e-8) / 10000, originalQuantityBase: -cost.quantityBase, originalValue: -cost.valueChange, unitCostBase: cost.unitCostBase, dispatchDate: f.fulfilmentDate });
        }
    }
    return result;
}
export const customerReturnRepository = {
    create(raw: unknown): CustomerReturn {
        const actor = trustedAuthorization.require('sales.payment'), input = customerReturnInput.parse(raw), fingerprint = JSON.stringify(input), prior = rows.find(r => r.operationId === input.operationId);
        if (prior) { if (prior.fingerprint !== fingerprint) throw new Error('Operation ID already used with different customer return data.'); return prior; }
        requireDateKey(input.returnDate); assertPostingPeriod(input.returnDate); assertCurrentCrossModuleWriteSafe();
        const invoice = salesRepository.getAll().find(d => d.id === input.invoiceId && d.type === 'INVOICE');
        if (!invoice || invoice.type !== 'INVOICE' || input.returnDate < invoice.documentDate) throw new Error('Select an issued invoice and a return date on or after it.');
        const available = availableCustomerReturnSources(invoice.id), seen = new Set<string>();
        const prepared = input.lines.map(l => {
            if (seen.has(l.costMovementId)) throw new Error('Select each original dispatch cost only once.'); seen.add(l.costMovementId);
            const source = available.find(s => s.costMovementId === l.costMovementId && s.invoiceLineId === l.invoiceLineId);
            if (!source || l.quantity > source.availableQuantity + 1e-8 || input.returnDate < source.dispatchDate) throw new Error('Return exceeds dispatched quantities or precedes dispatch.');
            const product = getProductById(source.productId), site = inventorySiteRepository.getById(source.siteId), original = invoice.lines.find(i => i.id === l.invoiceLineId)!;
            if (!product || !site || site.status !== 'ACTIVE') throw new Error('An active original receiving site and product are required.');
            if ((original.areaPerPack || product.wholePacks && ['BOX', 'ROLL', 'BUCKET'].includes(product.units.find(u => u.id === source.unitId)?.code ?? '')) && !Number.isInteger(l.quantity)) throw new Error('Return whole packs in whole quantities.');
            chronology(source.siteId, source.productId, input.returnDate);
            const quantityBase = q(l.quantity * source.conversionToBase); if (quantityBase <= 0) throw new Error('Return quantity rounds to zero.');
            const priorLines = rows.filter(r => r.status === 'POSTED').flatMap(r => r.lines).filter(p => p.costMovementId === source.costMovementId);
            const final = quantityBase + priorLines.reduce((n, l) => n + l.quantityBase, 0) >= source.originalQuantityBase - 1e-8;
            const inventoryValue = m(final ? source.originalValue - priorLines.reduce((n, l) => n + l.inventoryValue, 0) : source.originalValue * quantityBase / source.originalQuantityBase);
            return { ...source, quantity: l.quantity, quantityBase, inventoryValue };
        });
        const quantities = new Map<string, number>(); for (const l of prepared) quantities.set(l.invoiceLineId, q((quantities.get(l.invoiceLineId) ?? 0) + l.quantity));
        let credit = input.creditNoteId ? creditNoteRepository.getById(input.creditNoteId) : undefined;
        if (input.creditNoteId) {
            if (!credit || credit.sourceInvoiceId !== invoice.id || ['VOID', 'DRAFT'].includes(credit.status) || credit.creditDate > input.returnDate) throw new Error('Select an issued credit for this invoice dated before receipt.');
            for (const [lineId, quantity] of quantities) {
                const credited = credit.lines.find(l => l.id === lineId)?.quantity ?? 0, used = rows.filter(r => r.status === 'POSTED' && r.creditNoteId === credit!.id).flatMap(r => r.lines).filter(l => l.invoiceLineId === lineId).reduce((n, l) => n + l.quantity, 0);
                if (quantity + used > credited + 1e-8) throw new Error('Physical return exceeds the linked credit quantities.');
            }
        } else credit = salesRepository.createCreditNoteFromInvoice({ invoiceId: invoice.id, creditDate: input.returnDate, reason: input.reason, lines: [...quantities].map(([id, quantity]) => ({ ...invoice.lines.find(l => l.id === id)!, quantity })) });
        const id = crypto.randomUUID(), number = 'CRTN-' + String(rows.length + 1).padStart(6, '0');
        const lines: CustomerReturn['lines'] = prepared.map(l => {
            stockRepository.receive({ siteId: l.siteId, productId: l.productId, baseUnitId: l.baseUnitId, quantityBase: l.quantityBase });
            const movement = inventoryMovementRepository.create({ movementType: 'RETURN_IN', siteId: l.siteId, productId: l.productId, baseUnitId: l.baseUnitId, quantityBase: l.quantityBase, transactionUnitId: l.unitId, transactionUnitSymbol: invoice.lines.find(i => i.id === l.invoiceLineId)!.unitSymbol, transactionQuantity: l.quantity, conversionToBase: l.conversionToBase, referenceType: 'CUSTOMER_RETURN', referenceId: id, referenceNumber: number, salesOrderId: invoice.sourceSalesOrderId, occurredAt: input.returnDate, notes: input.reason });
            const cost = restoreInventoryCost({ siteId: l.siteId, productId: l.productId, quantityBase: l.quantityBase, unitCostBase: l.unitCostBase, inventoryValue: l.inventoryValue, referenceType: 'CUSTOMER_RETURN', referenceId: id, referenceNumber: number, inventoryMovementId: movement.id, occurredAt: input.returnDate, notes: input.reason }).movement;
            return { costMovementId: l.costMovementId, invoiceLineId: l.invoiceLineId, fulfilmentId: l.fulfilmentId, productId: l.productId, unitId: l.unitId, baseUnitId: l.baseUnitId, siteId: l.siteId, description: l.description, quantity: l.quantity, conversionToBase: l.conversionToBase, quantityBase: l.quantityBase, inventoryValue: l.inventoryValue, unitCostBase: l.unitCostBase, movementId: movement.id, restoredCostId: cost.id };
        });
        const inventoryValue = m(lines.reduce((n, l) => n + l.inventoryValue, 0));
        const journal = inventoryValue ? journalEntryRepository.post({ journalDate: input.returnDate, description: 'Customer goods returned ' + number, sourceType: 'CUSTOMER_RETURN', sourceId: id, lines: [{ accountId: accountRepository.requireBySystemRole('INVENTORY').id, debit: inventoryValue, credit: 0 }, { accountId: accountRepository.requireBySystemRole('COST_OF_GOODS_SOLD').id, debit: 0, credit: inventoryValue }] }) : undefined;
        const row: CustomerReturn = { id, number, operationId: input.operationId, fingerprint, invoiceId: invoice.id, invoiceNumber: invoice.documentNumber, customerId: invoice.customerId, creditNoteId: credit!.id, ownsCredit: !input.creditNoteId, returnDate: input.returnDate, reason: input.reason, status: 'POSTED', lines, inventoryValue, journalId: journal?.id, createdBy: actor.userId, createdAt: new Date().toISOString() }; rows = [row, ...rows]; emit(); return row;
    },
    reverse(raw: unknown): CustomerReturn {
        const actor = trustedAuthorization.require('sales.payment'), input = z.object({ id: text, reversalDate: text, reason: z.string().trim().min(3).max(2000) }).strict().parse(raw), row = rows.find(r => r.id === input.id);
        if (!row) throw new Error('Customer return not found.'); if (row.status === 'REVERSED') return row;
        requireDateKey(input.reversalDate); assertPostingPeriod(input.reversalDate); assertCurrentCrossModuleWriteSafe(); if (input.reversalDate < row.returnDate) throw new Error('Reversal precedes the return.');
        const grouped = new Map<string, { quantity: number; value: number }>();
        for (const l of row.lines) { chronology(l.siteId, l.productId, input.reversalDate); const key = l.siteId + '|' + l.productId, prior = grouped.get(key) ?? { quantity: 0, value: 0 }; grouped.set(key, { quantity: q(prior.quantity + l.quantityBase), value: m(prior.value + l.inventoryValue) }); }
        for (const [key, need] of grouped) { const [siteId, productId] = key.split('|'), balance = inventoryCostBalanceRepository.getBalance(siteId, productId); if ((stockRepository.getBalance(siteId, productId)?.quantityOnHand ?? 0) + 1e-8 < need.quantity || (balance?.inventoryValue ?? 0) + .001 < need.value || Math.abs((balance?.quantityOnHand ?? 0) - need.quantity) < 1e-8 && Math.abs((balance?.inventoryValue ?? 0) - need.value) > .001) throw new Error('Returned stock/value has been used; restore stock availability before reversal.'); }
        const linked = creditNoteRepository.getById(row.creditNoteId)!;
        if (row.ownsCredit && ((linked.refundEvents ?? []).some(e => (e.reversalDate ?? e.date) > input.reversalDate) || creditNoteRepository.getAllocationsByCreditNote(linked.id).some(a => (a.reversedAt ? businessDateKey(a.reversedAt) : a.allocationDate) > input.reversalDate))) throw new Error('Return reversal precedes later credit settlement activity.');
        // Tentative owner state releases only this credit; the trusted host rolls all changes back on any failure.
        rows = rows.map(r => r.id === row.id ? { ...r, status: 'REVERSED' } : r);
        if (row.ownsCredit) salesRepository.voidCreditNote({ creditNoteId: row.creditNoteId, reason: input.reason, voidDate: input.reversalDate });
        const lines = row.lines.map(l => {
            const fifo=inventoryCostBalanceRepository.requireBalance(l.siteId,l.productId).costingMethod==='FIFO';
            if(fifo && m(consumeFifo(fifoLayers(inventoryCostMovementRepository.getBySiteAndProduct(l.siteId,l.productId)),l.quantityBase,l.restoredCostId))!==l.inventoryValue)throw Error('Returned FIFO layer has been used; reverse subsequent issues before voiding the return.');
            stockRepository.issue({ siteId: l.siteId, productId: l.productId, baseUnitId: l.baseUnitId, quantityBase: l.quantityBase });
            const movement = inventoryMovementRepository.create({ movementType: 'RETURN_OUT', siteId: l.siteId, productId: l.productId, baseUnitId: l.baseUnitId, quantityBase: -l.quantityBase, transactionUnitId: l.unitId, transactionUnitSymbol: inventoryMovementRepository.getAll().find(m=>m.id===l.movementId)?.transactionUnitSymbol ?? '', transactionQuantity: -l.quantity, conversionToBase: l.conversionToBase, referenceType: 'CUSTOMER_RETURN_VOID', referenceId: row.id, referenceNumber: row.number, occurredAt: input.reversalDate, notes: input.reason });
            const old = inventoryCostBalanceRepository.requireBalance(l.siteId, l.productId), quantityAfter = q(old.quantityOnHand - l.quantityBase), inventoryValueAfter = m(old.inventoryValue - l.inventoryValue), averageCostAfter = quantityAfter ? roundInventoryCost(inventoryValueAfter / quantityAfter) : 0;
            inventoryCostBalanceRepository.save({ ...old, quantityOnHand: quantityAfter, inventoryValue: inventoryValueAfter, averageCostPerBaseUnit: averageCostAfter, updatedAt: new Date().toISOString() });
            const cost = inventoryCostMovementRepository.create({ ...(fifo?{costingMethod:'FIFO' as const,fifoReturnLayerId:l.restoredCostId}:{}), movementType: 'RETURN_OUT', siteId: l.siteId, productId: l.productId, baseUnitId: l.baseUnitId, quantityBase: -l.quantityBase, unitCostBase: l.unitCostBase, valueChange: -l.inventoryValue, quantityAfter, averageCostAfter, inventoryValueAfter, referenceType: 'CUSTOMER_RETURN_VOID', referenceId: row.id, referenceNumber: row.number, inventoryMovementId: movement.id, occurredAt: input.reversalDate, notes: input.reason });
            return { ...l, reversalMovementId: movement.id, reversalCostId: cost.id };
        });
        if (row.journalId) journalEntryRepository.reverse({ journalEntryId: row.journalId, reversalDate: input.reversalDate, reason: input.reason });
        const result: CustomerReturn = { ...row, lines, status: 'REVERSED', reversalDate: input.reversalDate, reversalReason: input.reason, reversedBy: actor.userId }; rows = rows.map(r => r.id === row.id ? result : r); emit(); return result;
    },
};
registerRepository('physicalCustomerReturns', { repository: customerReturnRepository, read: 'inventory.cost.read', commands: { create: 'sales.payment', reverse: 'sales.payment' }, snapshot: () => ({ returns: rows }), restore: v => { rows = v.returns; }, publish: emit, validate: (raw, snapshots) => {
    const saved = z.object({ returns: z.array(rowSchema) }).strict().parse(raw), s = snapshots as Record<string, any>, ops = new Set<string>(), used = new Map<string, { quantity: number; value: number }>();
    const linkedQuantities=new Map<string,number>();
    for (const r of saved.returns) {
        const request = customerReturnInput.parse(JSON.parse(r.fingerprint)); requireDateKey(r.returnDate);
        if (ops.has(r.operationId) || request.operationId !== r.operationId || request.invoiceId !== r.invoiceId || request.returnDate !== r.returnDate || request.reason !== r.reason || request.lines.length !== r.lines.length || r.ownsCredit !== !request.creditNoteId || request.creditNoteId && request.creditNoteId !== r.creditNoteId) throw new Error('Customer return request mismatch.'); ops.add(r.operationId);
        const invoice = s.sales.invoices.find((i: any) => i.id === r.invoiceId && i.customerId === r.customerId), credit = s.customerCredits.creditNotes.find((c: any) => c.id === r.creditNoteId && c.sourceInvoiceId === r.invoiceId);
        if (!invoice || !credit || r.status === 'POSTED' && credit.status === 'VOID' || r.status === 'REVERSED' && r.ownsCredit && credit.status !== 'VOID' || m(r.lines.reduce((n, l) => n + l.inventoryValue, 0)) !== r.inventoryValue || new Set(r.lines.map(l => l.costMovementId)).size !== r.lines.length) throw new Error('Customer return source or totals mismatch.');
        for (const l of r.lines) {
            const asked = request.lines.find(a => a.costMovementId === l.costMovementId && a.invoiceLineId === l.invoiceLineId), source = s.costMovements.movements.find((c: any) => c.id === l.costMovementId), cost = s.costMovements.movements.find((c: any) => c.id === l.restoredCostId), movement = s.inventoryMovements.movements.find((m: any) => m.id === l.movementId), f = s.fulfilments.fulfilments.find((f: any) => f.id === l.fulfilmentId);
            if (!asked || asked.quantity !== l.quantity || !f || f.salesOrderId !== invoice.sourceSalesOrderId || !source || source.referenceType !== 'SALE' || source.referenceId !== f.id || source.productId !== l.productId || source.siteId !== l.siteId || q(l.quantity * l.conversionToBase) !== l.quantityBase || !cost || cost.referenceType !== 'CUSTOMER_RETURN' || cost.referenceId !== r.id || cost.inventoryMovementId !== l.movementId || cost.quantityBase !== l.quantityBase || cost.valueChange !== l.inventoryValue || !movement || movement.referenceId !== r.id || movement.quantityBase !== l.quantityBase || businessDateKey(cost.occurredAt) !== r.returnDate) throw new Error('Customer return inventory/cost references mismatch.');
            if (r.status === 'POSTED') { if (f.status !== 'ACTIVE') throw new Error('Active customer return has a void dispatch.'); const prior = used.get(source.id) ?? { quantity: 0, value: 0 }; const total = { quantity: q(prior.quantity + l.quantityBase), value: m(prior.value + l.inventoryValue) }; used.set(source.id, total); if (total.quantity > -source.quantityBase + 1e-8 || total.value > -source.valueChange + .001) throw new Error('Customer returns exceed original dispatched stock/cost.'); }
            if (r.status === 'REVERSED') { const reversed = s.costMovements.movements.find((c: any) => c.id === l.reversalCostId); if (!reversed || reversed.referenceType !== 'CUSTOMER_RETURN_VOID' || reversed.referenceId !== r.id || reversed.inventoryMovementId !== l.reversalMovementId || reversed.quantityBase !== -l.quantityBase || reversed.valueChange !== -l.inventoryValue || businessDateKey(reversed.occurredAt) !== r.reversalDate) throw new Error('Customer return reversal references mismatch.'); }
        }
        if(r.status==='POSTED') for(const l of r.lines){const key=r.creditNoteId+'|'+l.invoiceLineId,total=q((linkedQuantities.get(key)??0)+l.quantity);linkedQuantities.set(key,total);if(!credit.lines.some((c:any)=>c.id===l.invoiceLineId&&c.quantity+1e-8>=total))throw new Error('Customer returns exceed linked credit quantity.');}
        for (const id of new Set(r.lines.map(l => l.invoiceLineId))) { const quantity = q(r.lines.filter(l => l.invoiceLineId === id).reduce((n, l) => n + l.quantity, 0)); if (!credit.lines.some((c: any) => c.id === id && c.quantity + 1e-8 >= quantity)) throw new Error('Customer return credit quantity mismatch.'); }
        if(r.returnDate<invoice.documentDate || r.status==='POSTED'&&r.reversalDate)throw new Error('Customer return date/status mismatch.');
        if (r.reversalDate) requireDateKey(r.reversalDate);
        if (r.status === 'REVERSED' && (!r.reversalDate || r.reversalDate < r.returnDate || !r.reversalReason || !r.reversedBy)) throw new Error('Customer return reversal metadata mismatch.');
        if(r.inventoryValue){const j=s.journals.journalEntries.find((j:any)=>j.id===r.journalId),inv=s.accounts.accounts.find((a:any)=>a.systemRole==='INVENTORY'),cogs=s.accounts.accounts.find((a:any)=>a.systemRole==='COST_OF_GOODS_SOLD');
          if(!j||j.journalDate!==r.returnDate||j.lines.length!==2||!j.lines.some((l:any)=>l.accountId===inv.id&&l.debit===r.inventoryValue&&l.credit===0)||!j.lines.some((l:any)=>l.accountId===cogs.id&&l.credit===r.inventoryValue&&l.debit===0))throw new Error('Customer return inventory journal accounts mismatch.');
          if(r.status==='REVERSED'){const rev=s.journals.journalEntries.find((v:any)=>v.id===j.reversalJournalEntryId);if(!rev||rev.reversedJournalEntryId!==j.id||rev.journalDate!==r.reversalDate||rev.lines.length!==2||!rev.lines.some((l:any)=>l.accountId===inv.id&&l.credit===r.inventoryValue&&l.debit===0)||!rev.lines.some((l:any)=>l.accountId===cogs.id&&l.debit===r.inventoryValue&&l.credit===0))throw new Error('Customer return reversal journal mismatch.');}
        }
        if (r.inventoryValue && !s.journals.journalEntries.some((j: any) => j.id === r.journalId && j.sourceType === 'CUSTOMER_RETURN' && j.sourceId === r.id && j.totalDebit === r.inventoryValue && j.status === (r.status === 'POSTED' ? 'POSTED' : 'REVERSED'))) throw new Error('Customer return inventory journal mismatch.');
    }
    if(new Set(saved.returns.map(r=>r.id)).size!==saved.returns.length) throw new Error('Duplicate customer return ID.');
    for(const j of s.journals.journalEntries) if(j.sourceType==='CUSTOMER_RETURN'&&!j.reversedJournalEntryId&&!saved.returns.some(r=>r.id===j.sourceId&&r.journalId===j.id)) throw new Error('Orphan customer return journal.');
} });
