/** Read-only recovery plan. Financial corrections must be performed by an operator. */
import { auditSalesConsistency, type SalesAuditInput, type SalesAuditIssue } from "./salesConsistencyAudit";

export type SalesRecoveryFinding = SalesAuditIssue & {
    action: string;
    automaticRepairAllowed: false;
};

const actions: Record<string, string> = {
    VOID_INVOICE_GL_ACTIVE: "Stop processing this invoice. Verify the original journal and any reversal, then reconcile the invoice void with GL manually.",
    ACTIVE_INVOICE_GL_REVERSED: "Stop processing this invoice. Inspect the reversal journal and invoice lifecycle before making any adjustment.",
    REVERSED_PAYMENT_GL_ACTIVE: "Block further payment changes. Verify the receipt, bank transaction and original GL journal before manual reversal.",
    RECEIVED_PAYMENT_GL_REVERSED: "Block further payment changes. Investigate the reversal and payment status before manual reconciliation.",
    VOID_CREDIT_GL_ACTIVE: "Inspect credit note void and original GL posting before manually correcting the ledger.",
    ACTIVE_CREDIT_GL_REVERSED: "Inspect the credit note and reversal journal before further allocations.",
    INVOICE_DUE_MISMATCH: "Compare received payments and active credit allocations with the invoice balance; do not silently recalculate historical records.",
    INVOICE_PAID_MISMATCH: "Compare received payments with the invoice paid amount and investigate incomplete operations.",
    DUPLICATE_GL_SOURCE: "Do not post again. Inspect every original and reversal journal for this source.",
};

/** Does not call repositories, persist data, post or reverse journals. */
export function inspectSalesRecovery(input: SalesAuditInput): SalesRecoveryFinding[] {
    return auditSalesConsistency(input).map(issue => ({
        ...issue,
        action: actions[issue.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
        automaticRepairAllowed: false as const,
    }));
}
