import type { SalesDocument } from '../sales/types/salesDocument';
import type { CreditNote } from '../sales/types/creditNote';
import type { SupplierBill } from '../purchases/types/supplierBill';
import type { SupplierCredit } from '../purchases/types/supplierCredit';
import type { AnalysisDocument } from './netAnalysisService';
export function salesAnalysisSources(documents: SalesDocument[], credits: CreditNote[], customers: {
    id: string;
    businessName: string;
}[]): AnalysisDocument[] {
    const name = (id: string) => customers.find(c => c.id === id)?.businessName ?? id;
    return [...documents.filter(d => d.type === 'INVOICE').map(d => ({ id: d.id, number: d.documentNumber, partyId: d.customerId, partyName: name(d.customerId), kind: 'INVOICE' as const, date: d.documentDate, status: d.status, voidedAt: d.voidedAt, openingBalanceImportId: d.openingBalanceImportId, subtotal: d.totals.subtotal, tax: d.totals.taxAmount, total: d.totals.total, path: `/sales/invoices/${d.id}` })), ...credits.map(d => ({ id: d.id, number: d.creditNoteNumber, partyId: d.customerId, partyName: name(d.customerId), kind: 'CUSTOMER_CREDIT' as const, date: d.creditDate, status: d.status, voidedAt: d.voidedAt, openingBalanceImportId: d.openingBalanceImportId, subtotal: d.totals.subtotal, tax: d.totals.taxAmount, total: d.totals.total, path: `/sales/credits/${d.id}` }))];
}
export function purchaseAnalysisSources(bills: SupplierBill[], credits: SupplierCredit[]): AnalysisDocument[] {
    return [...bills.map(d => ({ id: d.id, number: d.billNumber, partyId: d.supplierId, partyName: d.supplierName, kind: 'BILL' as const, date: d.billDate, status: d.status, voidedAt: d.voidedAt, openingBalanceImportId: d.openingBalanceImportId, subtotal: d.totals.subtotal, tax: d.totals.taxAmount, total: d.totals.total, path: `/purchases/bills/${d.id}` })), ...credits.map(d => ({ id: d.id, number: d.creditNumber, partyId: d.supplierId, partyName: d.supplierName, kind: 'SUPPLIER_CREDIT' as const, date: d.creditDate, status: d.status, voidedAt: d.voidedAt, openingBalanceImportId: d.openingBalanceImportId, subtotal: d.totals.subtotal, tax: d.totals.taxAmount, total: d.totals.total, path: `/purchases/credits/${d.id}` }))];
}
