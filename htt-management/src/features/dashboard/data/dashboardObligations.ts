import type { Account } from "../../accounting/types/account";
import type { JournalEntry } from "../../accounting/types/journalEntry";
import type { PayrollState } from "../../payroll/data/payrollModel";
const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export function dashboardGst(accounts: Account[], journals: JournalEntry[], date: string) {
    const from = `${date.slice(0, 7)}-01`;
    const collectedIds = new Set(accounts.filter(account => account.systemRole === "GST_PAYABLE").map(account => account.id));
    const paidIds = new Set(accounts.filter(account => account.systemRole === "GST_RECEIVABLE").map(account => account.id));
    let collected = 0, paid = 0;
    for (const journal of journals.filter(journal => journal.journalDate >= from && journal.journalDate <= date && journal.sourceType !== "OPENING_BALANCE")) {
        for (const line of journal.lines) {
            if (collectedIds.has(line.accountId)) collected += line.credit - line.debit;
            if (paidIds.has(line.accountId)) paid += line.debit - line.credit;
        }
    }
    return { collected: round(collected), paid: round(paid), net: round(collected - paid) };
}
export function dashboardPayroll(state: PayrollState, date: string) {
    const activeAt = (payment: PayrollState["payments"][number]) => payment.date <= date && (payment.status === "Posted" || !!payment.reversalDate && payment.reversalDate > date);
    const runs = state.runs.filter(run => run.payDate <= date && (run.status === "Posted" || run.status === "Reversed" && !!run.reversalDate && run.reversalDate > date));
    function liability(kind: "super" | "payg") {
        let amount = 0;
        const paymentDates: string[] = [], scheduledDates: string[] = [];
        for (const run of runs) {
            const obligations = new Map<string, number>();
            for (const slip of run.slips) for (const line of slip.lines) {
                const matches = kind === "super" ? line.item.id === run.settings.superItemId && line.item.category === "Employer contribution" : line.item.category === "Tax";
                if (!matches) continue;
                const accountId = kind === "super" ? line.item.liabilityAccountId : line.item.accountId;
                obligations.set(accountId, (obligations.get(accountId) ?? 0) + line.amount);
            }
            for (const [accountId, total] of obligations) {
                const payments = state.payments.filter(payment => payment.runId === run.id && payment.accountId === accountId);
                const paid = payments.filter(activeAt).reduce((sum, payment) => sum + payment.amount, 0);
                const due = Math.max(0, round(total - paid));
                amount += due;
                paymentDates.push(...payments.filter(activeAt).map(payment => payment.date));
                if (due > 0) scheduledDates.push(...payments.filter(payment => payment.status === "Posted" && payment.date > date).map(payment => payment.date));
            }
        }
        return { amount: round(amount), nextPaymentDate: scheduledDates.sort()[0], lastPaymentDate: paymentDates.sort().at(-1) };
    }
    const month = date.slice(0, 7);
    const payRuns = state.runs.filter(run => run.payDate.startsWith(month) && run.status !== "Cancelled").sort((a, b) => b.payDate.localeCompare(a.payDate)).slice(0, 3).map(run => {
        const paidDates = state.payments.filter(payment => payment.runId === run.id && payment.accountId === run.settings.netAccountId && activeAt(payment)).map(payment => payment.date).sort();
        return { id: run.id, start: run.start, end: run.end, payDate: run.payDate, paidDate: paidDates.at(-1), status: run.status };
    });
    return { payRuns, superannuation: liability("super"), payg: liability("payg") };
}
