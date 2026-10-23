import { requireDateKey } from '../../lib/businessDate';
import { parseCsv } from '../../lib/csv';
import type { CaptureInput } from '../direct-documents/managedDocumentRepository';
export const captureHeaders = ['supplierCode', 'reference', 'date', 'dueDate', 'description', 'accountCode', 'quantity', 'unitCost', 'taxCode', 'basis', 'net', 'tax', 'total'] as const;
type Lookup = {
    suppliers: {
        id: string;
        code: string;
        status: string;
    }[];
    accounts: {
        id: string;
        code: string;
    }[];
    taxCodes: string[];
};
export function parseCaptureCsv(text: string, lookup: Lookup): Pick<CaptureInput, 'payload' | 'declared'> {
    if (text.length > 1000000)
        throw new Error('CSV exceeds 1 MB.');
    const rows = parseCsv(text.replace(/^\uFEFF/, ''));
    if (rows.length < 2 || rows.length > 501)
        throw new Error('Import one bill with 1–500 lines.');
    const header = rows[0].map(s => s.trim().toLowerCase());
    if (header.length !== captureHeaders.length || new Set(header).size !== header.length || captureHeaders.some(h => !header.includes(h.toLowerCase())))
        throw new Error('Use the supplied supplier bill CSV column headings.');
    const value = (row: string[], name: typeof captureHeaders[number]) => row[header.indexOf(name.toLowerCase())]?.trim() ?? '';
    const first = rows[1], shared = ['supplierCode', 'reference', 'date', 'dueDate', 'net', 'tax', 'total'] as const;
    const number = (v: string, label: string, positive = false) => {
        if (!/^\d+(?:\.\d+)?$/.test(v))
            throw new Error(`${label} must be an unsigned decimal number.`);
        const n = Number(v);
        if (!Number.isFinite(n) || (positive ? n <= 0 : n < 0) || !Number.isSafeInteger(Math.round(n * 100)))
            throw new Error(`Invalid ${label}.`);
        return n;
    };
    const suppliers = lookup.suppliers.filter(s => s.status === 'ACTIVE' && s.code.toLowerCase() === value(first, 'supplierCode').toLowerCase());
    if (suppliers.length !== 1)
        throw new Error('Supplier code must identify one active supplier.');
    requireDateKey(value(first, 'date'), 'Document date');
    requireDateKey(value(first, 'dueDate'), 'Due date');
    if (value(first, 'dueDate') < value(first, 'date'))
        throw new Error('Due date must not precede document date.');
    if (!value(first, 'reference') || value(first, 'reference').length > 200)
        throw new Error('Supplier invoice reference is required and must not exceed 200 characters.');
    const lines = rows.slice(1).map((row, i) => {
        if (row.length !== header.length || shared.some(k => value(row, k) !== value(first, k)))
            throw new Error(`Row ${i + 2} contains a different bill header or has the wrong column count.`);
        const accounts = lookup.accounts.filter(a => a.code === value(row, 'accountCode'));
        if (accounts.length !== 1)
            throw new Error(`Row ${i + 2}: choose an available expense account code.`);
        const tax = lookup.taxCodes.find(c => c.toLowerCase() === value(row, 'taxCode').toLowerCase());
        if (!tax)
            throw new Error(`Row ${i + 2}: unknown active tax code.`);
        const basis = value(row, 'basis');
        if (!['Exclusive', 'Inclusive'].includes(basis))
            throw new Error(`Row ${i + 2}: basis must be Exclusive or Inclusive.`);
        const description = value(row, 'description');
        if (!description || description.length > 500)
            throw new Error(`Row ${i + 2}: description is required and must not exceed 500 characters.`);
        return { description, accountId: accounts[0].id, quantity: number(value(row, 'quantity'), 'quantity', true), unitCost: number(value(row, 'unitCost'), 'unit cost'), taxCode: tax, priceBasis: basis as 'Exclusive' | 'Inclusive' };
    });
    return { payload: { kind: 'EXPENSE', supplierId: suppliers[0].id, supplierInvoiceNumber: value(first, 'reference'), documentDate: value(first, 'date'), dueDate: value(first, 'dueDate'), lines }, declared: { subtotal: number(value(first, 'net'), 'source net'), taxAmount: number(value(first, 'tax'), 'source tax'), total: number(value(first, 'total'), 'source total') } };
}
