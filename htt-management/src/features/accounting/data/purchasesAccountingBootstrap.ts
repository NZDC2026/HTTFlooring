import { runFinancialConsistencyAudit } from "../../../lib/persistence/runFinancialConsistencyAudit";

/** AP repositories now hydrate alongside their GL in the durable local snapshot.
 * Startup is diagnostic only. Missing journals must be reviewed, never reposted
 * using today's configuration or an inferred receipt cost.
 */
export function initializePurchasesAccounting() {
    const issues = runFinancialConsistencyAudit().filter(issue =>
        issue.message.includes("SUPPLIER_") || issue.message.includes("Supplier payment"));
    if (issues.length) console.error("Restored AP posting issues require review", issues);
}
