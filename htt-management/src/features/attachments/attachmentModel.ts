import { z } from 'zod';
import { hasPermission, type Permission, type VerifiedPrincipal } from '../security/rbac';
export const targetKinds = ['Customer', 'Supplier', 'Quote', 'Order', 'Invoice', 'Customer credit', 'Purchase order', 'Bill', 'Supplier credit', 'Task', 'Visit', 'Job', 'Journal', 'Product'] as const;
export const targetSchema = z.object({ kind: z.enum(targetKinds), id: z.string().min(1).max(200) }).strict();
export type AttachmentTarget = z.infer<typeof targetSchema>;
type TargetSpec = {
    repository: string;
    collection: string;
    read: Permission;
    write: Permission;
    path: string;
    label: string[];
};
export const targetSpecs: Record<AttachmentTarget['kind'], TargetSpec> = {
    Customer: { repository: 'customers', collection: 'customers', read: 'sales.read', write: 'contacts.write', path: '/contacts/customers/', label: ['code', 'businessName'] },
    Supplier: { repository: 'suppliers', collection: 'suppliers', read: 'purchases.read', write: 'contacts.write', path: '/contacts/suppliers/', label: ['code', 'businessName'] },
    Quote: { repository: 'sales', collection: 'quotes', read: 'sales.read', write: 'sales.write', path: '/sales/quotes/', label: ['documentNumber'] },
    Order: { repository: 'sales', collection: 'salesOrders', read: 'sales.read', write: 'sales.manage', path: '/sales/orders/', label: ['documentNumber'] },
    Invoice: { repository: 'sales', collection: 'invoices', read: 'sales.read', write: 'sales.manage', path: '/sales/invoices/', label: ['documentNumber'] },
    'Customer credit': { repository: 'customerCredits', collection: 'creditNotes', read: 'sales.read', write: 'sales.manage', path: '/sales/credits/', label: ['creditNoteNumber'] },
    'Purchase order': { repository: 'purchaseOrders', collection: 'purchaseOrders', read: 'purchases.read', write: 'purchases.write', path: '/purchases/', label: ['purchaseOrderNumber'] },
    Bill: { repository: 'supplierBills', collection: 'supplierBills', read: 'purchases.read', write: 'purchases.bill', path: '/purchases/bills/', label: ['billNumber'] },
    'Supplier credit': { repository: 'supplierCredits', collection: 'supplierCredits', read: 'purchases.read', write: 'purchases.bill', path: '/purchases/credits/', label: ['creditNumber'] },
    Task: { repository: 'workspace_tasks', collection: 'records', read: 'sales.read', write: 'sales.write', path: '/tasks/', label: ['name'] },
    Visit: { repository: 'salesVisits', collection: 'visits', read: 'sales.read', write: 'sales.write', path: '/sales/activity/', label: ['subject', 'name'] },
    Job: { repository: 'workspace_jobs', collection: 'records', read: 'accounting.read', write: 'accounting.post', path: '/accounting/jobs/', label: ['code', 'name'] },
    Journal: { repository: 'journals', collection: 'journalEntries', read: 'accounting.read', write: 'accounting.post', path: '/accounting/journals/', label: ['journalNumber'] },
    Product: { repository: 'products', collection: 'products', read: 'inventory.read', write: 'inventory.adjust', path: '/inventory/products/', label: ['sku', 'name'] }
};
export function targetRows(snapshots: Record<string, any>, principal: VerifiedPrincipal | null) {
    return targetKinds.flatMap(kind => {
        const spec = targetSpecs[kind];
        if (!hasPermission(principal, spec.read))
            return [];
        return (snapshots[spec.repository]?.[spec.collection] ?? []).map((row: Record<string, unknown>) => ({ kind, id: String(row.id), label: spec.label.map(k => row[k]).filter(Boolean).join(' · ') || String(row.id), canWrite: hasPermission(principal, spec.write), path: (kind === 'Customer' || kind === 'Supplier') && !hasPermission(principal, 'contacts.write') ? '' : spec.path + encodeURIComponent(String(row.id)) }));
    }) as {
        kind: AttachmentTarget['kind'];
        id: string;
        label: string;
        canWrite: boolean;
        path: string;
    }[];
}
export const MAX_FILE_BYTES = 10000000, MAX_LIBRARY_BYTES = 50000000;
export type AttachmentVersion = {
    id: string;
    number: number;
    name: string;
    mime: string;
    size: number;
    sha256: string;
    createdAt: string;
    createdBy: string;
    restoredFrom?: string;
};
export type AttachmentDocument = {
    id: string;
    title: string;
    target: AttachmentTarget;
    revision: number;
    currentVersionId: string;
    versions: AttachmentVersion[];
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    deletedAt?: string;
    deletedBy?: string;
    targetLabel: string;
    targetPath: string;
    canWrite: boolean;
};
export type AttachmentHistory = {
    id: string;
    documentId: string;
    operationId: string;
    action: string;
    actorId: string;
    at: string;
    revision: number;
    reason: string;
    versionId?: string;
    after: {
        title: string;
        deleted: boolean;
        currentVersionId: string;
        versionsCount: number;
    };
};
export type AttachmentView = {
    documents: AttachmentDocument[];
    history: AttachmentHistory[];
};
