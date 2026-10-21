import {verifyReconciliationChain} from '../../banking/data/reconciliationChainEvidence';
import type {StatementLine} from '../../finance-closure/bankStatementRepository';
import { calculateInvoiceBalanceAsAt } from "../../sales/data/invoiceBalanceAsAtService";
import { calculateSupplierBillBalanceAsAt } from "../../purchases/data/supplierBillBalanceAsAtService";
import type { Payment } from "../../sales/types/payment";
import type { CreditAllocation } from "../../sales/types/creditNote";
import type { SupplierPayment } from "../../purchases/types/supplierPayment";
import type { SupplierCreditAllocation } from "../../purchases/types/supplierCredit";
import { businessDateKey, requireDateKey } from "../../../lib/businessDate";
import type { Invoice } from "../../sales/types/salesDocument";
import type { SupplierBill } from "../../purchases/types/supplierBill";
import type { BankAccount } from "../../banking/types/bankAccount";
import type { JournalEntry } from "../../accounting/types/journalEntry";
import type { BankReconciliation } from "../../banking/types/bankReconciliation";
import { calculateBankRegister } from "../../banking/data/bankRegisterService";

const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const addDays = (date: string, days: number) => {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
};
export interface FinanceOverviewActivity {
    payments: Payment[];
    creditAllocations: CreditAllocation[];
    supplierPayments: SupplierPayment[];
    supplierCreditAllocations: SupplierCreditAllocation[];
}
export function calculateFinanceOverview(invoices: Invoice[], bills: SupplierBill[], banks: BankAccount[], journals: JournalEntry[], reconciliations: BankReconciliation[], today: string, activity?: FinanceOverviewActivity, statements: StatementLine[] = []) {
    requireDateKey(today, "Dashboard date");
    if (activity) {
        invoices = invoices.map(invoice => ({ ...invoice, amountDue: calculateInvoiceBalanceAsAt(invoice, activity.payments, activity.creditAllocations, today).amountDue }));
        bills = bills.map(bill => ({ ...bill, totals: { ...bill.totals, ...calculateSupplierBillBalanceAsAt(bill, activity.supplierPayments, activity.supplierCreditAllocations, today) } }));
    }
    const activeInvoices = invoices.filter(i => i.status !== "DRAFT" && (i.status !== "VOID" || !!i.voidedAt && businessDateKey(i.voidedAt) > today) && i.documentDate <= today && !(i.voidedAt && businessDateKey(i.voidedAt) <= today));
    const openInvoices = activeInvoices.filter(i => i.amountDue > 0);
    const receivables = money(openInvoices.reduce((s, i) => s + i.amountDue, 0));
    const overdueInvoices = openInvoices.filter(i => i.dueDate < today);
    const ageing = [
        { label: "Current", amount: openInvoices.filter(i => i.dueDate >= today).reduce((s, i) => s + i.amountDue, 0) },
        { label: "1–30 days", amount: openInvoices.filter(i => i.dueDate < today && i.dueDate >= addDays(today, -30)).reduce((s, i) => s + i.amountDue, 0) },
        { label: "31–60 days", amount: openInvoices.filter(i => i.dueDate < addDays(today, -30) && i.dueDate >= addDays(today, -60)).reduce((s, i) => s + i.amountDue, 0) },
        { label: "60+ days", amount: openInvoices.filter(i => i.dueDate < addDays(today, -60)).reduce((s, i) => s + i.amountDue, 0) },
    ].map(x => ({ ...x, amount: money(x.amount), percentage: receivables ? Math.round(x.amount / receivables * 100) : 0 }));
    const openBills = bills.filter(
        b =>
            (b.status !== "VOID" || !!b.voidedAt && businessDateKey(b.voidedAt) > today) &&
            b.billDate <= today &&
            !(b.voidedAt && businessDateKey(b.voidedAt) <= today) &&
            b.totals.amountDue > 0
    );
    const payables = money(openBills.reduce((s, b) => s + b.totals.amountDue, 0));
    const dueThisWeek = money(openBills.filter(b => b.dueDate >= today && b.dueDate <= addDays(today, 7)).reduce((s, b) => s + b.totals.amountDue, 0));
    const overduePayables = money(openBills.filter(b => b.dueDate < today).reduce((s, b) => s + b.totals.amountDue, 0));
    const bankStatus = banks.filter(b => b.active && b.openingBalanceDate <= today).map(bank => {
        const register = calculateBankRegister(bank, journals, today);
        let reviewReasons: string[];
        try {
            reviewReasons = verifyReconciliationChain({bank,journals,reconciliations,throughDate:today,statements});
        } catch {
            reviewReasons = ['Saved bank reconciliation evidence could not be verified.'];
        }
        const requiresReview = reviewReasons.length > 0;
        // A broken chain cannot prove any of its cumulative clearing. Keep real ledger
        // amounts, but label its rows as unverified rather than claiming they are cleared.
        const verified = requiresReview ? [] : reconciliations.filter(r => r.bankAccountId === bank.id && r.statementDate <= today);
        const last = [...verified].sort((a,b)=>b.statementDate.localeCompare(a.statementDate))[0];
        const cleared = new Set(verified.flatMap(r=>r.clearedTransactionIds));
        const outstanding = register.transactions.filter(t => !t.correctionOnly && !cleared.has(t.id)).length;
        return { id: bank.id, name: bank.name, balance: register.closingBalance, lastReconciled: last?.statementDate, outstanding, requiresReview, reviewReasons };
    });
    return { bankReviewCount: bankStatus.filter(b=>b.requiresReview).length, receivables, overdueInvoiceCount: overdueInvoices.length, overdueReceivables: money(overdueInvoices.reduce((s, i) => s + i.amountDue, 0)), ageing, payables, dueThisWeek, overduePayables, bankStatus, unreconciledCount: bankStatus.reduce((s, b) => s + b.outstanding, 0) };
}
