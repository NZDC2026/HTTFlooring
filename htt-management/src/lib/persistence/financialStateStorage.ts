import { registerRepository } from "../../features/security/repositoryHost";
import { mockPurchaseOrders } from '../../features/purchases/data/mockPurchaseOrders';
import type { PurchaseOrder } from '../../features/purchases/types/purchaseOrder';
import type { GoodsReceipt } from '../../features/purchases/types/goodsReceipt';
import type { SupplierBillReceiptMatch } from '../../features/purchases/types/supplierBillReceiptMatch';
import { mockPayments } from '../../features/sales/data/mockPayments';
/** One versioned snapshot for local financial Mock data. Each update is one storage write.
 * Cross-step workflows still require the durable operation journal and manual review.
 * This is not a database transaction and must never auto-replay postings.
 */
import type { BankReconciliation } from '../../features/banking/types/bankReconciliation';
import type { SupplierBill } from '../../features/purchases/types/supplierBill';
import type { SupplierPayment } from '../../features/purchases/types/supplierPayment';
import type { SupplierCredit, SupplierCreditAllocation } from '../../features/purchases/types/supplierCredit';
import type { Payment } from '../../features/sales/types/payment';
import type { BankTransaction, BankTransfer } from '../../features/banking/types/bankTransaction';
import type { JournalEntry } from '../../features/accounting/types/journalEntry';
import { readMockRepository, writeMockRepository } from './mockRepositoryStorage';

export type FinancialSnapshot = {
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  receiptMatches: SupplierBillReceiptMatch[];
  reconciliations: BankReconciliation[];
  supplierBills: SupplierBill[];
  supplierPayments: SupplierPayment[];
  supplierCredits: SupplierCredit[];
  supplierCreditAllocations: SupplierCreditAllocation[];
  payments: Payment[];
  transactions: BankTransaction[];
  transfers: BankTransfer[];
  journals: JournalEntry[];
};
const KEY = 'htt:financial-snapshot:v1';
const isObject = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const unique = (items: { id: string }[]) => new Set(items.map(x => x.id)).size === items.length;
const valid = (x: unknown): x is FinancialSnapshot => {
  if (!isObject(x) || !Array.isArray(x.payments) || !Array.isArray(x.transactions) || !Array.isArray(x.transfers) || !Array.isArray(x.journals)) return false;
  const p = x.payments, t = x.transactions, f = x.transfers, j = x.journals;
  return p.every(v => isObject(v) && typeof v.id === 'string' && typeof v.invoiceId === 'string' && typeof v.amount === 'number' && Number.isFinite(v.amount) && (v.status === 'RECEIVED' || v.status === 'REVERSED')) &&
    t.every(v => isObject(v) && typeof v.id === 'string' && typeof v.journalEntryId === 'string' && typeof v.amount === 'number' && Number.isFinite(v.amount)) &&
    f.every(v => isObject(v) && typeof v.id === 'string' && typeof v.journalEntryId === 'string' && typeof v.amount === 'number' && Number.isFinite(v.amount)) &&
    j.every(v => isObject(v) && typeof v.id === 'string' && typeof v.sourceType === 'string' && Array.isArray(v.lines) && (v.status === 'POSTED' || v.status === 'REVERSED')) &&
    ['purchaseOrders', 'goodsReceipts', 'receiptMatches', 'reconciliations', 'supplierBills', 'supplierPayments', 'supplierCredits', 'supplierCreditAllocations'].every(key => {
      const rows = x[key];
      // Older v1 snapshots predate these slices. They migrate in memory, without erasing history.
      if (rows === undefined) return true;
      if (!Array.isArray(rows) || !rows.every(v => isObject(v) && typeof v.id === 'string')) return false;
      if (new Set(rows.map(v => v.id)).size !== rows.length) return false;
      return rows.every(v => key === 'purchaseOrders' ? typeof v.supplierId === 'string' && Array.isArray(v.lines) && isObject(v.totals)
        : key === 'goodsReceipts' ? typeof v.purchaseOrderId === 'string' && typeof v.receiptDate === 'string' && Array.isArray(v.lines)
        : key === 'receiptMatches' ? typeof v.supplierBillId === 'string' && typeof v.goodsReceiptId === 'string' && Number.isFinite(v.matchedQuantity) && ['ACTIVE', 'REVERSED'].includes(String(v.status))
        : key === 'reconciliations'
        ? typeof v.bankAccountId === 'string' && typeof v.statementDate === 'string' && Number.isFinite(v.statementBalance) && v.status === 'COMPLETED' && Array.isArray(v.clearedTransactionIds) && v.clearedTransactionIds.every((id: unknown) => typeof id === 'string')
        : key === 'supplierBills' ? typeof v.supplierId === 'string' && typeof v.billDate === 'string' && isObject(v.totals) && Number.isFinite(v.totals.total) && Number.isFinite(v.totals.amountDue) && Array.isArray(v.lines)
        : key === 'supplierPayments' ? typeof v.supplierId === 'string' && Number.isFinite(v.amount) && Array.isArray(v.allocations) && ['POSTED', 'REVERSED'].includes(String(v.status))
        : key === 'supplierCredits' ? typeof v.supplierId === 'string' && isObject(v.totals) && Number.isFinite(v.totals.total) && Array.isArray(v.lines)
        : typeof v.supplierBillId === 'string' && typeof v.supplierCreditId === 'string' && Number.isFinite(v.amount));
    }) &&
    unique(p as Payment[]) && unique(t as BankTransaction[]) && unique(f as BankTransfer[]) && unique(j as JournalEntry[]);
};
const initial = (): FinancialSnapshot => ({ purchaseOrders: structuredClone(mockPurchaseOrders), goodsReceipts: [], receiptMatches: [], reconciliations: [], supplierBills: [], supplierPayments: [], supplierCredits: [], supplierCreditAllocations: [], payments: structuredClone(mockPayments), transactions: [], transfers: [], journals: [] });
let cache: FinancialSnapshot | undefined;
let restoredOnLoad = false;
function storageAvailable(): boolean { return typeof window !== 'undefined' && !!window.localStorage; }
function load(): FinancialSnapshot {
  if (cache) return cache;
  if (!storageAvailable()) return initial(); // Node unit tests remain in-memory.
  const result = readMockRepository(KEY, valid);
  if (result.status === 'invalid' || result.status === 'unavailable') throw new Error(`Financial snapshot ${result.status}; financial writes blocked.`);
  restoredOnLoad = result.status === 'ok';
  cache = result.status === 'ok' ? { ...initial(), ...result.data } : initial();
  return cache;
}
const participants = new Set<() => void>();
let transactionDepth = 0;
const notifications = new Set<() => void>();
function persist(next: FinancialSnapshot) {
  if (storageAvailable() && !writeMockRepository(KEY, next)) throw new Error('Financial snapshot write failed; write blocked.');
}
export const financialStateStorage = {
  wasRestoredOnLoad(): boolean { load(); return restoredOnLoad; },
  /** Restore repository memory after a failed unit of work. Registration does not write data. */
  onRollback(restore: () => void): void { participants.add(restore); },
  notify(listener: () => void): void {
    if (transactionDepth) notifications.add(listener);
    else listener();
  },
  /** Synchronous local unit of work: one durable snapshot, then subscriber publication.
   * Operations touching stock/orders still use the existing explicit recovery journal.
   */
  transaction<T>(action: () => T): T {
    if (transactionDepth) return action();
    const before = structuredClone(load());
    cache = structuredClone(before);
    transactionDepth++;
    let result: T;
    try {
      result = action();
      if (result instanceof Promise) throw new Error('Financial transactions must be synchronous.');
      persist(load());
    } catch (error) {
      cache = before;
      participants.forEach(restore => restore());
      notifications.clear();
      throw error;
    } finally { transactionDepth--; }
    const pending = [...notifications];
    notifications.clear();
    // A subscriber error must never turn a committed posting into a failed posting.
    pending.forEach(notify => { try { notify(); } catch (error) { console.error('Financial subscriber failed', error); } });
    return result;
  },
  read(): FinancialSnapshot { return structuredClone(load()); },
  update<K extends keyof FinancialSnapshot>(key: K, items: FinancialSnapshot[K]): void {
    const next = { ...load(), [key]: structuredClone(items) } as FinancialSnapshot;
    if (!valid(next)) throw new Error('Invalid financial snapshot; write blocked.');
    if (!transactionDepth) persist(next);
    cache = next;
  },
  /** Only for test isolation; never clears persisted financial data. */
  resetCacheForTests(): void { cache = undefined; restoredOnLoad = false; },
};

// Main-owned snapshots replace renderer caches without executing business mutations.
registerRepository('financialCache', { repository: {}, read: 'accounting.read', commands: {}, snapshot: () => financialStateStorage.read(), restore: value => { cache = value; }, publish: () => {} });
