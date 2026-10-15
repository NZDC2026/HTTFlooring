/** Read-only cross-repository reference checks for the Mock application.
 * Never repairs, deletes or replays accounting / inventory / posting records.
 */
export type ReferenceRecord = { id: string };
export type LinkedRecord = { id: string; customerId?: string; supplierId?: string };
export type ConsistencyIssue = {
    code: "DUPLICATE_ID" | "MISSING_CUSTOMER" | "MISSING_SUPPLIER";
    repository: "customers" | "suppliers" | "sales" | "purchaseOrders";
    recordId: string;
    referenceId?: string;
};
export type ConsistencySnapshot = {
    customers: readonly ReferenceRecord[];
    suppliers: readonly ReferenceRecord[];
    sales: readonly LinkedRecord[];
    purchaseOrders: readonly LinkedRecord[];
};

/** Referential integrity report only; seed data may legitimately contain historical links. */
export function auditMockReferences(data: ConsistencySnapshot): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    const repositories = ["customers", "suppliers", "sales", "purchaseOrders"] as const;
    for (const name of repositories) {
        const seen = new Set<string>();
        for (const record of data[name]) {
            if (seen.has(record.id)) issues.push({ code: "DUPLICATE_ID", repository: name, recordId: record.id });
            seen.add(record.id);
        }
    }
    const customerIds = new Set(data.customers.map(record => record.id));
    const supplierIds = new Set(data.suppliers.map(record => record.id));
    for (const record of data.sales) {
        if (record.customerId && !customerIds.has(record.customerId)) {
            issues.push({ code: "MISSING_CUSTOMER", repository: "sales", recordId: record.id, referenceId: record.customerId });
        }
    }
    for (const record of data.purchaseOrders) {
        if (record.supplierId && !supplierIds.has(record.supplierId)) {
            issues.push({ code: "MISSING_SUPPLIER", repository: "purchaseOrders", recordId: record.id, referenceId: record.supplierId });
        }
    }
    return issues;
}
