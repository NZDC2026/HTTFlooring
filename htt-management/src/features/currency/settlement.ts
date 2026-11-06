import type { SupplierBill } from "../purchases/types/supplierBill";
import type { SupplierPayment } from "../purchases/types/supplierPayment";
import { fxAmount, moneyRound } from "./currency";

export function foreignAllocationAmount(bill: SupplierBill, amount: number, payments: readonly SupplierPayment[]) {
    if (!bill.fx) return amount;
    const paid = payments.filter(payment=>payment.status === "POSTED").flatMap(payment=>payment.allocations)
        .filter(allocation=>allocation.supplierBillId===bill.id)
        .reduce((sum,allocation)=>sum+(allocation.originalAmount??fxAmount(allocation.amount,bill.fx)),0);
    const remaining = Math.max(0,moneyRound(fxAmount(bill.totals.total,bill.fx)-paid-fxAmount(bill.totals.amountCredited,bill.fx)));
    if (moneyRound(amount) === moneyRound(bill.totals.amountDue)) return remaining;
    const original = fxAmount(amount,bill.fx);
    if (amount > 0 && (original <= 0 || original >= remaining))
        throw new Error("This partial amount cannot be split into currency cents. Allocate the full remaining bill balance.");
    return original;
}
