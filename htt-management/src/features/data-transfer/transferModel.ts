import { z } from 'zod';
import { parseCsv } from '../../lib/csv';
import { reviewDefaults } from '../contact-review/reviewModel';
import type { Permission } from '../security/rbac';
export const datasets = ['Customers', 'Suppliers', 'Customer branches', 'Customer contacts', 'Products'] as const;
export type Dataset = typeof datasets[number];
export const modes = ['Create', 'Update by ID'] as const;
export const formatTag = 'HTT-CSV-1';
export const productDefaults = { sku: '', name: '', category: 'Other', brand: '', collection: '', description: '', status: 'ACTIVE', itemType: 'STOCK', buyEnabled: true, sellEnabled: true, reorderPoint: 0, targetStock: 0, wholePacks: true, taxCode: 'GST', baseUnitCode: 'PIECE', unitsJson: JSON.stringify([{ code: 'PIECE', name: 'Each', symbol: 'each', conversionToBase: 1, basePrice: 0, isBaseUnit: true, active: true }]) };
export const defaults: Record<Dataset, Record<string, string | number | boolean>> = { Customers: reviewDefaults.Customer, Suppliers: { businessName: '', tradingName: '', abn: '', status: 'ACTIVE', email: '', phone: '', website: '', contactName: '', addressLine1: '', addressLine2: '', suburb: '', state: '', postcode: '', country: '', paymentTermsDays: 30, taxRegistered: false, notes: '' }, 'Customer branches': { customerId: '', ...reviewDefaults.Branch }, 'Customer contacts': { customerId: '', ...reviewDefaults.Contact }, Products: productDefaults };
export const fields = (dataset: Dataset) => ['_format', 'id', 'recordToken', 'externalId', ...Object.keys(defaults[dataset])];
export const permissions: Record<Dataset, {
    read: Permission;
    write: Permission;
}> = { Customers: { read: 'sales.read', write: 'contacts.write' }, Suppliers: { read: 'purchases.read', write: 'contacts.write' }, 'Customer branches': { read: 'sales.read', write: 'contacts.write' }, 'Customer contacts': { read: 'sales.read', write: 'contacts.write' }, Products: { read: 'inventory.read', write: 'inventory.adjust' } };
export const sourceSchema = z.object({ dataset: z.enum(datasets), mode: z.enum(modes), fileName: z.string().trim().min(1).max(200), text: z.string().max(1000000), mapping: z.record(z.string(), z.number().int().nonnegative()).optional() }).strict();
export type TransferSource = z.infer<typeof sourceSchema>;
export function parseSource(input: TransferSource) {
    if (input.text.includes('\0'))
        throw new Error('CSV source must be text without NUL characters.');
    const rows = parseCsv(input.text.replace(/^\uFEFF/, ''));
    if (rows.length < 2 || rows.length > 501)
        throw new Error('Choose a CSV header and 1–500 data records.');
    const headers = rows[0].map(h => h.trim());
    if (headers.length > 64 || headers.some(h => !h || h.length > 120) || new Set(headers.map(h => h.toLowerCase())).size !== headers.length)
        throw new Error('CSV requires 1–64 distinct, nonempty column names of at most 120 characters.');
    if (rows.slice(1).some(r => r.length !== headers.length || r.some(c => c.length > 100000)))
        throw new Error('Each CSV record must match the header width; cells may not exceed 100,000 characters.');
    const allowed = fields(input.dataset), mapping = input.mapping ?? Object.fromEntries(allowed.flatMap(key => { const index = headers.findIndex(h => h.toLowerCase() === key.toLowerCase()); return index < 0 ? [] : [[key, index]]; }));
    if (Object.entries(mapping).some(([key, index]) => !allowed.includes(key) || index >= headers.length))
        throw new Error('Column mapping contains an unsupported field or column index.');
    return { headers, mapping, rows: rows.slice(1).map((row, index) => {
            const values = Object.fromEntries(Object.entries(mapping).map(([key, column]) => [key, row[column]]));
            if (values._format && values._format !== formatTag)
                throw new Error('Unsupported HTT CSV export format.');
            if (values._format === formatTag)
                for (const key of Object.keys(values)) {
                    const value = values[key];
                    if (value.startsWith("'") && /^[=+@\-'\t\r]/.test(value.slice(1)))
                        values[key] = value.slice(1);
                }
            for (const key of ['id', 'recordToken', 'externalId'])
                if (values[key])
                    values[key] = values[key].trim();
            return { row: index + 2, values };
        }), unmappedColumns: headers.filter((_, index) => !Object.values(mapping).includes(index)) };
}
export function encodeCsv(rows: string[][]) { return rows.map(row => row.map(value => { const safe = /^[=+@\-'\t\r]/.test(value) ? "'" + value : value; return '"' + safe.replaceAll('"', '""') + '"'; }).join(',')).join('\r\n'); }
export type TransferResult = {
    row: number;
    externalId: string;
    recordId: string;
    action: 'Created' | 'Updated' | 'Skipped';
    identityFingerprint: string;
    before: Record<string, string> | null;
    after: Record<string, string>;
};
export type TransferRun = {
    id: string;
    operationId: string;
    fingerprint: string;
    dataset: Dataset;
    mode: typeof modes[number];
    fileName: string;
    sourceHash: string;
    actorId: string;
    at: string;
    reason: string;
    results: TransferResult[];
    parentChanges: {
        customerId: string;
        before: string;
        after: string;
    }[];
};
export type TransferPreview = {
    fingerprint: string;
    headers: string[];
    mapping: Record<string, number>;
    unmappedColumns: string[];
    rows: {
        row: number;
        externalId: string;
        recordId: string;
        name: string;
        action: string;
        values: Record<string, string>;
        errors: string[];
    }[];
    valid: boolean;
};
