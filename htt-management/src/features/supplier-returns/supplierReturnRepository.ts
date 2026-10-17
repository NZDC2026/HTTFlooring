import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { businessDateKey, requireDateKey } from '../../lib/businessDate';
import { assertPostingPeriod } from '../accounting/data/accountingPeriodRepository';
import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { supplierCreditRepository } from '../purchases/data/supplierCreditRepository';
import { supplierBillReceiptMatchRepository } from '../purchases/data/supplierBillReceiptMatchRepository';
import { goodsReceiptRepository } from '../purchases/data/goodsReceiptRepository';
import { inventorySiteRepository } from '../inventory/data/inventorySiteRepository';
import { getProductById, getProductUnit } from '../inventory/data/mockProducts';
import { stockRepository } from '../inventory/data/stockRepository';
import { inventoryMovementRepository } from '../inventory/data/inventoryMovementRepository';
import { inventoryCostMovementRepository } from '../inventory/data/inventoryCostMovementRepository';
import { issueInventoryCost, restoreInventoryCost } from '../inventory/data/inventoryCostEngine';
import { accountRepository } from '../accounting/data/accountRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
const text = z.string().trim().min(1).max(200), quantity = z.number().finite().positive(), money = z.number().finite().nonnegative();
const requestSchema = z.object({ operationId: text, supplierBillId: text, supplierCreditNumber: text, returnDate: text, reason: z.string().trim().min(3).max(2000), lines: z.array(z.object({ matchId: text, quantity }).strict()).min(1).max(500) }).strict();
const returnLineSchema = z.object({ id: text, matchId: text, supplierBillLineId: text, goodsReceiptId: text, goodsReceiptLineId: text, productId: text, unitId: text, baseUnitId: text, sku: text, description: z.string(), unitSymbol: text, quantity, conversionToBase: quantity, quantityBase: quantity, siteId: text, siteName: text, inventoryMovementId: text, costMovementId: text, unitCostBase: money, inventoryValue: money, voidInventoryMovementId: text.optional(), voidCostMovementId: text.optional() }).strict();
const rowSchema = z.object({ id: text, returnNumber: text, operationId: text, requestFingerprint: z.string().max(1000000), supplierBillId: text, supplierBillNumber: text, supplierId: text, supplierName: text, supplierCreditId: text, returnDate: text, reason: z.string().min(3).max(2000), status: z.enum(['POSTED', 'VOID']), lines: z.array(returnLineSchema).min(1), inventoryValue: money, journalId: text.optional(), createdAt: text, createdBy: text, voidDate: text.optional(), voidReason: z.string().optional(), voidedBy: text.optional(), voidedAt: text.optional() }).strict();
export type SupplierReturn = z.infer<typeof rowSchema>;
export type SupplierReturnRequest = z.infer<typeof requestSchema>;
let returns: SupplierReturn[] = [], version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach(f => f()); };
const q = (n: number) => Math.round(n * 10000) / 10000, m = (n: number) => Math.round(n * 100) / 100;
export function useSupplierReturns() { useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => version, () => version); return returns; }
function assertChronology(date: string, siteId: string, productId: string) {
    if (inventoryCostMovementRepository.getAll().some(c => c.siteId === siteId && c.productId === productId && businessDateKey(c.occurredAt) > date))
        throw new Error('Return/reversal date precedes later inventory activity at this site.');
}
export function availableReturnMatches(billId: string) {
    const bill = supplierBillRepository.getById(billId);
    if (!bill || bill.status === 'VOID' || bill.kind === 'EXPENSE' || bill.openingBalanceImportId)
        return [];
    return supplierBillReceiptMatchRepository.getByBill(billId).filter(a => a.status === 'ACTIVE').flatMap(match => {
        const line = bill.lines.find(l => l.id === match.supplierBillLineId), receipt = goodsReceiptRepository.getById(match.goodsReceiptId), receiptLine = receipt?.lines.find(l => l.id === match.goodsReceiptLineId), unit = line ? getProductUnit(line.productId, line.unitId) : undefined;
        if (!line || !receipt || !receiptLine || !unit)
            return [];
        const used = returns.filter(r => r.status === 'POSTED').flatMap(r => r.lines).filter(l => l.matchId === match.id).reduce((n, l) => n + l.quantityBase, 0);
        return [{ matchId: match.id, supplierBillLineId: line.id, goodsReceiptId: receipt.id, goodsReceiptLineId: receiptLine.id, receiptNumber: receipt.receiptNumber, siteId: receipt.siteId, siteName: receipt.siteName, receiptDate: receipt.receiptDate, description: line.description, sku: line.sku, unitId: line.unitId, unitSymbol: line.unitSymbol, productId: line.productId, conversionToBase: unit.conversionToBase, availableQuantity: Math.floor(Math.max(0, match.matchedBaseQuantity - used) / unit.conversionToBase * 10000 + 1e-8) / 10000 }];
    });
}
export const supplierReturnRepository = {
    create(raw: SupplierReturnRequest): SupplierReturn {
        const input = requestSchema.parse(raw), fingerprint = JSON.stringify(input), prior = returns.find(r => r.operationId === input.operationId);
        if (prior) {
            if (prior.requestFingerprint !== fingerprint)
                throw new Error('Operation ID already used with different return data.');
            return prior;
        }
        assertCurrentCrossModuleWriteSafe();
        requireDateKey(input.returnDate, 'Return date');
        assertPostingPeriod(input.returnDate);
        const bill = supplierBillRepository.getById(input.supplierBillId);
        if (!bill || bill.status === 'VOID' || bill.kind === 'EXPENSE' || bill.openingBalanceImportId)
            throw new Error('Select an active stock bill matched to received goods.');
        if (input.returnDate < bill.billDate)
            throw new Error('Return date cannot precede bill date.');
        const matches = availableReturnMatches(bill.id), seen = new Set<string>();
        const prepared = input.lines.map(l => {
            if (seen.has(l.matchId))
                throw new Error('Select each receipt match once.');
            seen.add(l.matchId);
            const match = matches.find(a => a.matchId === l.matchId);
            if (!match)
                throw new Error('Return line must belong to an active receipt match for this bill.');
            if (q(l.quantity) !== l.quantity || l.quantity > match.availableQuantity + 1e-8)
                throw new Error('Return quantity exceeds the matched receipt remainder or four decimal places.');
            if (input.returnDate < match.receiptDate)
                throw new Error('Return date cannot precede receipt date.');
            const product = getProductById(match.productId), unit = getProductUnit(match.productId, match.unitId), site = inventorySiteRepository.getById(match.siteId);
            if (!product || !unit || !site || site.status !== 'ACTIVE')
                throw new Error('Return product, unit or active receiving site was not found.');
            if (product.wholePacks && ['BOX', 'ROLL', 'BUCKET'].includes(unit.code) && !Number.isInteger(l.quantity))
                throw new Error('Whole packs must be returned in whole quantities.');
            assertChronology(input.returnDate, site.id, product.id);
            const quantityBase = q(l.quantity * match.conversionToBase);
            if (quantityBase <= 0)
                throw new Error('Return base quantity rounds to zero.');
            return { ...match, quantity: l.quantity, quantityBase, baseUnitId: product.baseUnitId };
        });
        const stockNeeded = new Map<string, number>();
        for (const p of prepared) {
            const key = p.siteId + '|' + p.productId;
            stockNeeded.set(key, q((stockNeeded.get(key) ?? 0) + p.quantityBase));
        }
        for (const [key, needed] of stockNeeded) {
            const [site, product] = key.split('|');
            if ((stockRepository.getBalance(site, product)?.quantityOnHand ?? 0) + 1e-8 < needed)
                throw new Error('Insufficient stock at the original receiving site.');
        }
        const creditLines = new Map<string, {
            supplierBillLineId: string;
            quantity: number;
            unitCost: number;
        }>();
        for (const p of prepared) {
            const source = bill.lines.find(l => l.id === p.supplierBillLineId)!;
            const old = creditLines.get(source.id);
            creditLines.set(source.id, { supplierBillLineId: source.id, quantity: q((old?.quantity ?? 0) + p.quantity), unitCost: source.unitCost });
        }
        const id = crypto.randomUUID(), returnNumber = 'SR-' + input.returnDate.slice(0, 4) + '-' + String(returns.length + 1).padStart(5, '0');
        const credit = supplierCreditRepository.createReturnCredit({ sourceSupplierBillId: bill.id, supplierCreditNumber: input.supplierCreditNumber, creditDate: input.returnDate, reason: input.reason, lines: [...creditLines.values()] }, id);
        const lines: SupplierReturn['lines'] = prepared.map(p => {
            stockRepository.issue({ siteId: p.siteId, productId: p.productId, baseUnitId: p.baseUnitId, quantityBase: p.quantityBase });
            const movement = inventoryMovementRepository.create({ movementType: 'RETURN_OUT', siteId: p.siteId, productId: p.productId, baseUnitId: p.baseUnitId, quantityBase: -p.quantityBase, transactionUnitId: p.unitId, transactionUnitSymbol: p.unitSymbol, transactionQuantity: -p.quantity, conversionToBase: p.conversionToBase, referenceType: 'SUPPLIER_RETURN', referenceId: id, referenceNumber: returnNumber, purchaseOrderId: bill.purchaseOrderId, purchaseOrderNumber: bill.purchaseOrderNumber, occurredAt: input.returnDate, notes: input.reason });
            const cost = issueInventoryCost({ siteId: p.siteId, productId: p.productId, unitId: p.unitId, quantity: p.quantity, movementType: 'RETURN_OUT', referenceType: 'SUPPLIER_RETURN', referenceId: id, referenceNumber: returnNumber, inventoryMovementId: movement.id, occurredAt: input.returnDate, notes: input.reason }).movement;
            return { id: crypto.randomUUID(), matchId: p.matchId, supplierBillLineId: p.supplierBillLineId, goodsReceiptId: p.goodsReceiptId, goodsReceiptLineId: p.goodsReceiptLineId, productId: p.productId, unitId: p.unitId, baseUnitId: p.baseUnitId, sku: p.sku, description: p.description, unitSymbol: p.unitSymbol, quantity: p.quantity, conversionToBase: p.conversionToBase, quantityBase: p.quantityBase, siteId: p.siteId, siteName: p.siteName, inventoryMovementId: movement.id, costMovementId: cost.id, unitCostBase: cost.unitCostBase, inventoryValue: -cost.valueChange };
        });
        const inventoryValue = m(lines.reduce((n, l) => n + l.inventoryValue, 0));
        const journal = inventoryValue ? journalEntryRepository.post({ journalDate: input.returnDate, description: `Physical supplier return ${returnNumber}`, reference: credit.creditNumber, sourceType: 'SUPPLIER_RETURN', sourceId: id, lines: [{ accountId: accountRepository.requireBySystemRole('PURCHASE_PRICE_VARIANCE').id, debit: inventoryValue, credit: 0 }, { accountId: accountRepository.requireBySystemRole('INVENTORY').id, debit: 0, credit: inventoryValue }] }) : undefined;
        const row: SupplierReturn = { id, returnNumber, operationId: input.operationId, requestFingerprint: fingerprint, supplierBillId: bill.id, supplierBillNumber: bill.billNumber, supplierId: bill.supplierId, supplierName: bill.supplierName, supplierCreditId: credit.id, returnDate: input.returnDate, reason: input.reason, status: 'POSTED', lines, inventoryValue, journalId: journal?.id, createdAt: new Date().toISOString(), createdBy: trustedAuthorization.current()?.userId ?? 'local-test' };
        returns = [row, ...returns];
        emit();
        return row;
    },
    reverse(raw: {
        returnId: string;
        voidDate: string;
        reason: string;
    }): SupplierReturn {
        const input = z.object({ returnId: text, voidDate: text, reason: z.string().trim().min(3).max(2000) }).strict().parse(raw), row = returns.find(r => r.id === input.returnId);
        if (!row)
            throw new Error('Supplier return not found.');
        if (row.status === 'VOID')
            return row;
        assertCurrentCrossModuleWriteSafe();
        requireDateKey(input.voidDate, 'Reversal date');
        assertPostingPeriod(input.voidDate);
        if (input.voidDate < row.returnDate)
            throw new Error('Reversal date cannot precede return date.');
        for (const l of row.lines)
            assertChronology(input.voidDate, l.siteId, l.productId);
        const linkedCredit = supplierCreditRepository.getById(row.supplierCreditId)!;
        if ((linkedCredit.refundEvents ?? []).some(e => (e.reversalDate ?? e.date) > input.voidDate) || supplierCreditRepository.getAllocationsByCredit(linkedCredit.id).some(a => a.reversedAt && businessDateKey(a.reversedAt) > input.voidDate))
            throw new Error('Reversal date precedes later credit settlement activity.');
        supplierCreditRepository.voidReturnCredit({ supplierCreditId: row.supplierCreditId, reason: input.reason, voidDate: input.voidDate });
        const lines = row.lines.map(l => {
            stockRepository.receive({ siteId: l.siteId, productId: l.productId, baseUnitId: l.baseUnitId, quantityBase: l.quantityBase });
            const movement = inventoryMovementRepository.create({ movementType: 'RETURN_IN', siteId: l.siteId, productId: l.productId, baseUnitId: l.baseUnitId, quantityBase: l.quantityBase, transactionUnitId: l.unitId, transactionUnitSymbol: l.unitSymbol, transactionQuantity: l.quantity, conversionToBase: l.conversionToBase, referenceType: 'SUPPLIER_RETURN_VOID', referenceId: row.id, referenceNumber: row.returnNumber, occurredAt: input.voidDate, notes: input.reason });
            const cost = restoreInventoryCost({ siteId: l.siteId, productId: l.productId, quantityBase: l.quantityBase, unitCostBase: l.unitCostBase, inventoryValue: l.inventoryValue, referenceType: 'SUPPLIER_RETURN_VOID', referenceId: row.id, referenceNumber: row.returnNumber, inventoryMovementId: movement.id, occurredAt: input.voidDate, notes: input.reason }).movement;
            return { ...l, voidInventoryMovementId: movement.id, voidCostMovementId: cost.id };
        });
        if (row.journalId)
            journalEntryRepository.reverse({ journalEntryId: row.journalId, reversalDate: input.voidDate, reason: input.reason });
        const updated: SupplierReturn = { ...row, status: 'VOID', lines, voidDate: input.voidDate, voidReason: input.reason, voidedAt: new Date().toISOString(), voidedBy: trustedAuthorization.current()?.userId ?? 'local-test' };
        returns = returns.map(r => r.id === row.id ? updated : r);
        emit();
        return updated;
    }
};
registerRepository('physicalSupplierReturns', { repository: supplierReturnRepository, read: 'purchases.return.read', commands: { create: 'purchases.return', reverse: 'purchases.return' }, snapshot: () => ({ returns }), restore: v => { returns = v.returns; }, publish: emit, validate: (v, snapshots) => {
        const saved = z.object({ returns: z.array(rowSchema) }).strict().parse(v), s = snapshots as Record<string, any>, ops = new Set<string>();
        for (const r of saved.returns) {
            requireDateKey(r.returnDate);
            if (r.voidDate)
                requireDateKey(r.voidDate);
            const request = requestSchema.parse(JSON.parse(r.requestFingerprint));
            if (ops.has(r.operationId) || request.operationId !== r.operationId || request.supplierBillId !== r.supplierBillId || request.returnDate !== r.returnDate)
                throw new Error('Supplier return operation mismatch.');
            ops.add(r.operationId);
            const bill = s.supplierBills.supplierBills.find((b: any) => b.id === r.supplierBillId && b.supplierId === r.supplierId), credit = s.supplierCredits.supplierCredits.find((c: any) => c.id === r.supplierCreditId && c.physicalReturnId === r.id && c.sourceSupplierBillId === r.supplierBillId);
            if (!bill || !credit || (r.status === 'VOID') !== (credit.status === 'VOID'))
                throw new Error('Supplier return bill/credit reference is invalid.');
            if (m(r.lines.reduce((n, l) => n + l.inventoryValue, 0)) !== r.inventoryValue)
                throw new Error('Supplier return cost total is invalid.');
            for (const l of r.lines) {
                const match = s.receiptMatches.matches.find((a: any) => a.id === l.matchId && a.supplierBillId === r.supplierBillId && a.supplierBillLineId === l.supplierBillLineId && a.goodsReceiptId === l.goodsReceiptId && a.goodsReceiptLineId === l.goodsReceiptLineId), cost = s.costMovements.movements.find((c: any) => c.id === l.costMovementId), movement = s.inventoryMovements.movements.find((a: any) => a.id === l.inventoryMovementId);
                const receipt = s.goodsReceipts.goodsReceipts.find((g: any) => g.id === l.goodsReceiptId), sourceLine = bill.lines.find((b: any) => b.id === l.supplierBillLineId);
                if (!match || !sourceLine || sourceLine.productId !== l.productId || sourceLine.unitId !== l.unitId || receipt?.siteId !== l.siteId || match.productId !== l.productId || !cost || !movement || cost.referenceType !== 'SUPPLIER_RETURN' || cost.referenceId !== r.id || cost.inventoryMovementId !== movement.id || cost.siteId !== l.siteId || cost.productId !== l.productId || cost.unitCostBase !== l.unitCostBase || cost.quantityBase !== -l.quantityBase || m(-cost.valueChange) !== m(l.inventoryValue) || q(l.quantity * l.conversionToBase) !== l.quantityBase || movement.referenceType !== 'SUPPLIER_RETURN' || movement.referenceId !== r.id || movement.siteId !== l.siteId || movement.productId !== l.productId || movement.quantityBase !== -l.quantityBase || movement.transactionQuantity !== -l.quantity || businessDateKey(movement.occurredAt) !== r.returnDate)
                    throw new Error('Supplier return stock/cost reference is invalid.');
                if (r.status === 'VOID') {
                    const restored = s.costMovements.movements.find((c: any) => c.id === l.voidCostMovementId), received = s.inventoryMovements.movements.find((a: any) => a.id === l.voidInventoryMovementId);
                    if (!restored || !received || restored.inventoryMovementId !== received.id || restored.referenceType !== 'SUPPLIER_RETURN_VOID' || restored.referenceId !== r.id || restored.siteId !== l.siteId || restored.productId !== l.productId || restored.quantityBase !== l.quantityBase || m(restored.valueChange) !== m(l.inventoryValue) || received.referenceType !== 'SUPPLIER_RETURN_VOID' || received.quantityBase !== l.quantityBase || received.referenceId !== r.id || businessDateKey(restored.occurredAt) !== r.voidDate)
                        throw new Error('Supplier return reversal reference is invalid.');
                }
            }
            const lineIds = new Set<string>();
            for (const l of r.lines) {
                if (lineIds.has(l.matchId))
                    throw new Error('Duplicate return receipt match.');
                lineIds.add(l.matchId);
                const asked = request.lines.find(a => a.matchId === l.matchId);
                if (!asked || asked.quantity !== l.quantity)
                    throw new Error('Supplier return request quantities mismatch.');
            }
            if (request.lines.length !== r.lines.length)
                throw new Error('Supplier return request line count mismatch.');
            for (const sourceLineId of new Set(r.lines.map(l => l.supplierBillLineId))) {
                const returned = q(r.lines.filter(l => l.supplierBillLineId === sourceLineId).reduce((n, l) => n + l.quantity, 0));
                if (!credit.lines.some((c: any) => c.supplierBillLineId === sourceLineId && c.quantity === returned))
                    throw new Error('Supplier return linked credit quantity mismatch.');
            }
            if (r.status === 'VOID' && (!r.voidDate || r.voidDate < r.returnDate || !r.voidReason || !r.voidedBy))
                throw new Error('Supplier return reversal metadata is invalid.');
            if (r.inventoryValue && !s.journals.journalEntries.some((j: any) => j.id === r.journalId && j.sourceId === r.id && j.sourceType === 'SUPPLIER_RETURN' && j.totalDebit === r.inventoryValue && (r.status === 'VOID' ? j.status === 'REVERSED' : j.status === 'POSTED')))
                throw new Error('Supplier return journal reference is invalid.');
        }
        for (const credit of s.supplierCredits.supplierCredits)
            if (credit.physicalReturnId && !saved.returns.some(r => r.id === credit.physicalReturnId && r.supplierCreditId === credit.id))
                throw new Error('Supplier credit physical return reference is invalid.');
        for (const match of s.receiptMatches.matches) {
            const activeBase = q(saved.returns.filter(r => r.status === 'POSTED').flatMap(r => r.lines).filter(l => l.matchId === match.id).reduce((n, l) => n + l.quantityBase, 0));
            if (activeBase > match.matchedBaseQuantity + 1e-8)
                throw new Error('Supplier return quantities exceed the receipt match.');
        }
    } });
