import {logoSchema,currentLogo} from '../branding/brandingState';
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { salesRepository } from '../sales/data/salesRepository';
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { businessSettings, configurationRows } from '../business-workspace/configurationState';
import { validateAreaSnapshot } from '../sales/data/areaPacks';
import { validateRecipientSnapshot } from '../sales/data/salesRecipients';
import type { SalesDocumentLine, SalesRecipientSnapshot } from '../sales/types/salesDocument';
const text = z.string().min(1).max(200), value = z.string().max(20000), optional = value.optional();
export const outputKinds = ['QUOTE', 'SALES_ORDER', 'INVOICE', 'CREDIT_NOTE'] as const;
export type OutputKind = typeof outputKinds[number];
const requestSchema = z.object({ operationId: text, sourceId: text, kind: z.enum(outputKinds), expectedUpdatedAt: text, templateId: text.optional() }).strict();
const amount = z.number().finite().nonnegative();
const lineSchema = z.object({ itemType:z.enum(['STOCK','NON_STOCK','SERVICE']).optional(), id: text, sku: value, description: value, unitSymbol: value, quantity: z.number().positive().finite(), unitPrice: amount, lineSubtotal: amount, taxAmount: amount, lineTotal: amount, taxCode: optional, taxRate: z.number().finite().min(0).max(1).optional(), requestedArea: z.number().positive().finite().optional(), areaPerPack: z.number().positive().finite().optional(), coveredArea: z.number().positive().finite().optional() }).strict();
const recipientSchema = z.object({ locationId: optional, locationName: optional, deliveryAddress: optional, accountingContactId: optional, accountingContactName: optional, accountingEmail: optional }).strict();
const templateSchema = z.object({ id: text, revision: text, name: value, subject: value, body: value, footer: value, logoPosition:z.enum(['Left','Centre','Right']).optional(), paper: z.enum(['A4', 'Letter']) }).strict();
const artifactSchema = z.object({ id: text, operationId: text, requestFingerprint: value, preparedAt: text, preparedBy: text, sourceId: text, kind: z.enum(outputKinds), sourceUpdatedAt: text, documentNumber: text, status: text, documentDate: text, dueDate: optional, expiryDate: optional, reference: optional, notes: optional, customerId: text, customerName: value, customerCode: value, customerIdentifier: optional, recipient: recipientSchema.optional(), issuer: z.object({ name: value, tradingName: optional, identifier: optional, address: optional, email: optional, phone: optional, currency: text, logo:logoSchema.optional() }).strict(), lines: z.array(lineSchema).min(1), totals: z.object({ subtotal: amount, taxAmount: amount, total: amount }).strict(), amountPaid: amount.optional(), amountDue: amount.optional(), template: templateSchema, subject: value, body: value }).strict();
export type PreparedOutput = z.infer<typeof artifactSchema>;
export type OutputSource = ReturnType<typeof sourceDocument>;
export function sourceDocument(kind: OutputKind, id: string) {
    if (kind === 'CREDIT_NOTE') {
        const c = creditNoteRepository.getById(id);
        if (!c)
            throw new Error('Credit note was not found.');
        return { ...c, type: 'CREDIT_NOTE' as const, documentNumber: c.creditNoteNumber, documentDate: c.creditDate };
    }
    const doc = salesRepository.getById(id);
    if (!doc || doc.type !== kind)
        throw new Error('Sales document was not found.');
    return doc;
}
const templateKind = (kind: OutputKind) => kind === 'QUOTE' ? 'Quotation' : kind === 'INVOICE' ? 'Invoice' : kind === 'SALES_ORDER' ? 'Sales order' : 'Credit note';
function templateOptions() { return (configurationRows.templates ?? []).filter(t => t.status === 'Active' && ['Quotation', 'Invoice', 'Sales order', 'Credit note'].includes(t.kind)).map(t => ({ id: t.id, name: t.name, kind: t.kind })); }
let artifacts: PreparedOutput[] = [], templates = templateOptions(), version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach(f => f()); };
export function usePreparedOutputs() { useSyncExternalStore(f => { listeners.add(f); return () => { listeners.delete(f); }; }, () => version, () => version); return artifacts; }
export const getOutputTemplates = () => templates;
function templateFor(kind: OutputKind, id?: string): PreparedOutput['template'] {
    const row = id ? configurationRows.templates?.find(t => t.id === id && t.status === 'Active' && t.kind === templateKind(kind)) : undefined;
    if (id && !row)
        throw new Error('Select an active template for this document type.');
    return { id: row?.id ?? 'built-in', revision: row?.revision ?? '1', name: row?.name ?? 'Standard sales document', subject: row?.subject ?? '{{documentNumber}} · {{companyName}}', body: row?.body ?? 'Dear {{customerName}},\nPlease find {{documentNumber}} for {{currency}} {{total}}.\n{{companyName}}', footer: row?.footer ?? '', ...(currentLogo()?{logoPosition:row?.logo==='Centre'?'Centre' as const:row?.logo==='Right'?'Right' as const:'Left' as const}:{}), paper: row?.paper === 'Letter' ? 'Letter' : 'A4' };
}
const supportedTokens = ['documentNumber', 'customerName', 'companyName', 'currency', 'total', 'documentDate', 'dueDate', 'store', 'accountingContact'];
export function mergeOutputText(template: string, fields: Record<string, string>): string {
    return template.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_all, token: string) => {
        if (!supportedTokens.includes(token))
            throw new Error(`Unsupported template token: ${token}.`);
        return fields[token] ?? '';
    });
}
function outputLine(l: SalesDocumentLine): PreparedOutput['lines'][number] { return { itemType:l.itemType, id: l.id, sku: l.sku, description: l.description, unitSymbol: l.unitSymbol, quantity: l.quantity, unitPrice: l.unitPrice, lineSubtotal: l.lineSubtotal, taxAmount: l.taxAmount, lineTotal: l.lineTotal, taxCode: l.taxCode, taxRate: l.taxRate, requestedArea: l.requestedArea, areaPerPack: l.areaPerPack, coveredArea: l.coveredArea }; }
export const outputRepository = {
    prepare(raw: z.input<typeof requestSchema>): PreparedOutput {
        const input = requestSchema.parse(raw), fingerprint = JSON.stringify(input), prior = artifacts.find(a => a.operationId === input.operationId);
        if (prior) {
            if (prior.requestFingerprint !== fingerprint)
                throw new Error('Operation ID was used for different output data.');
            return prior;
        }
        const doc = sourceDocument(input.kind, input.sourceId);
        if (doc.updatedAt !== input.expectedUpdatedAt)
            throw new Error('Source document changed. Reload before preparing output.');
        const c = customerRepository.getById(doc.customerId);
        if (!c)
            throw new Error('Source customer was not found.');
        const settings = businessSettings() as Record<string, string>, template = templateFor(input.kind, input.templateId), recipient: SalesRecipientSnapshot | undefined = structuredClone(doc.recipient);
        const fields = { documentNumber: doc.documentNumber, customerName: c.businessName, companyName: settings.companyName, currency: settings.currency, total: doc.totals.total.toFixed(2), documentDate: doc.documentDate, dueDate: 'dueDate' in doc ? doc.dueDate : '', store: recipient?.locationName ?? '', accountingContact: recipient?.accountingContactName ?? '' };
        const result: PreparedOutput = { id: crypto.randomUUID(), operationId: input.operationId, requestFingerprint: fingerprint, preparedAt: new Date().toISOString(), preparedBy: trustedAuthorization.current()?.userId ?? 'local-test', sourceId: doc.id, kind: input.kind, sourceUpdatedAt: doc.updatedAt, documentNumber: doc.documentNumber, status: doc.status, documentDate: doc.documentDate, dueDate: 'dueDate' in doc ? doc.dueDate : undefined, expiryDate: 'expiryDate' in doc ? doc.expiryDate : undefined, reference: 'customerReference' in doc ? doc.customerReference : undefined, notes: 'reason' in doc ? doc.reason : doc.notes, customerId: c.id, customerName: c.businessName, customerCode: c.code, customerIdentifier: c.abn, recipient, issuer: { name: settings.companyName, tradingName: settings.tradingName, identifier: settings.identifier, address: settings.address, email: settings.email, phone: settings.phone, currency: settings.currency, ...(currentLogo()?{logo:currentLogo()}:{}) }, lines: doc.lines.map(outputLine), totals: structuredClone(doc.totals), amountPaid: 'amountPaid' in doc ? doc.amountPaid : undefined, amountDue: 'amountDue' in doc ? doc.amountDue : undefined, template: { ...template, footer: mergeOutputText(template.footer, fields) }, subject: mergeOutputText(template.subject, fields), body: mergeOutputText(template.body, fields) };
        validatePreparedOutput(result);
        artifacts = [result, ...artifacts];
        emit();
        return result;
    }
};
export function validatePreparedOutput(raw: unknown): PreparedOutput {
    const a = artifactSchema.parse(raw);
    validateRecipientSnapshot(a.recipient);
    if (!Number.isFinite(Date.parse(a.preparedAt)))
        throw new Error('Invalid preparation timestamp.');
    const request = requestSchema.parse(JSON.parse(a.requestFingerprint));
    if (request.operationId !== a.operationId || request.sourceId !== a.sourceId || request.kind !== a.kind || request.expectedUpdatedAt !== a.sourceUpdatedAt)
        throw new Error('Output source metadata mismatch.');
    const round = (n: number) => Math.round(n * 100) / 100;
    for (const l of a.lines) {
        validateAreaSnapshot(l);
        if (round(l.lineSubtotal + l.taxAmount) !== l.lineTotal)
            throw new Error('Invalid output line total.');
    }
    for (const [key, field] of [['subtotal', 'lineSubtotal'], ['taxAmount', 'taxAmount'], ['total', 'lineTotal']] as const)
        if (round(a.lines.reduce((n, l) => n + l[field], 0)) !== a.totals[key])
            throw new Error('Invalid output totals.');
    return a;
}
registerRepository('preparedSalesOutputs', { repository: outputRepository, read: 'sales.read', commands: { prepare: 'documents.prepare' }, snapshot: () => ({ artifacts, templates: templateOptions() }), restore: v => { artifacts = v.artifacts; templates = v.templates; }, publish: emit, validate: (v, snapshots) => {
        const state = z.object({ artifacts: z.array(artifactSchema), templates: z.array(z.object({ id: text, name: value, kind: text }).strict()) }).strict().parse(v);
        const ids = new Set<string>(), ops = new Set<string>();
        for (const a of state.artifacts) {
            validatePreparedOutput(a);
            if (ids.has(a.id) || ops.has(a.operationId))
                throw new Error('Duplicate prepared output.');
            ids.add(a.id);
            ops.add(a.operationId);
            const s = snapshots as Record<string, any>, source = a.kind === 'CREDIT_NOTE' ? s.customerCredits.creditNotes.find((c: any) => c.id === a.sourceId) : [...s.sales.quotes, ...s.sales.salesOrders, ...s.sales.invoices].find((d: any) => d.id === a.sourceId && d.type === a.kind);
            if (!source || source.customerId !== a.customerId)
                throw new Error('Prepared output source reference is invalid.');
        }
    } });
