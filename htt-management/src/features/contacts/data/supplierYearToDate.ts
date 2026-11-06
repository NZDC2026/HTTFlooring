import { fiscalYearStart, requireDateKey } from "../../../lib/businessDate";
import type { SupplierBill } from "../../purchases/types/supplierBill";
import type { SupplierPayment } from "../../purchases/types/supplierPayment";

export function supplierYearToDate(supplierId: string, bills: readonly SupplierBill[], payments: readonly SupplierPayment[], asOfDate: string) {
    requireDateKey(asOfDate);
    const from = fiscalYearStart(asOfDate);
    const withinYear = (date: string) => date >= from && date <= asOfDate;
    const purchases = bills.filter(bill => bill.supplierId === supplierId && bill.status !== "VOID" &&
        !bill.openingBalanceImportId && withinYear(bill.billDate));
    const paid = payments.filter(payment => payment.supplierId === supplierId && payment.status === "POSTED" &&
        !payment.prepaymentApplicationId && withinYear(payment.paymentDate));
    return {
        from, to: asOfDate,
        purchaseAmount: Math.round(purchases.reduce((sum, bill) => sum + bill.totals.total, 0) * 100) / 100,
        purchaseCount: purchases.length,
        paidAmount: Math.round(paid.reduce((sum, payment) => sum + payment.amount, 0) * 100) / 100,
        paidBillCount: new Set(paid.flatMap(payment => payment.allocations.filter(allocation => allocation.amount > 0)
            .map(allocation => allocation.supplierBillId))).size,
    };
}
