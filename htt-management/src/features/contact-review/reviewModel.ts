import { z } from 'zod';
import type { Customer } from '../contacts/types/customer';
export const reviewKinds = ['Customer', 'Branch', 'Contact'] as const;
export type ReviewKind = typeof reviewKinds[number];
export const reviewSources = ['Manual', 'Sales draft', 'Selected contact', 'Card transcription'] as const;
export type Values = Record<string, string | number | boolean>;
export const reviewDefaults: Record<ReviewKind, Values> = { Customer: { businessName: '', tradingName: '', abn: '', businessType: 'Other', status: 'ACTIVE', email: '', phone: '', website: '', creditLimit: 0, paymentTermsDays: 30 }, Branch: { name: '', addressLine1: '', addressLine2: '', suburb: '', state: '', postcode: '', country: '', phone: '', isPrimary: false }, Contact: { firstName: '', lastName: '', jobTitle: '', email: '', phone: '', mobile: '', locationId: '', isPrimary: false, isAccounting: false } };
export const valuesSchema = z.record(z.string(), z.union([z.string().max(2000), z.number().finite(), z.boolean()]));
export function draftValues(kind: ReviewKind, raw: unknown): Values {
    const input = valuesSchema.parse(raw), defaults = reviewDefaults[kind];
    if (Object.keys(input).some(k => !Object.hasOwn(defaults, k)))
        throw new Error('Unsupported draft field. Use the documented fields for this draft type.');
    for (const [key, value] of Object.entries(input))
        if (typeof value !== typeof defaults[key])
            throw new Error(`Invalid value type for ${key}.`);
    return { ...defaults, ...input };
}
export type ReviewSubject = {
    kind: ReviewKind;
    customerId: string;
    values: Values;
};
export const subjectName = (r: ReviewSubject) => String(r.kind === 'Customer' ? r.values.businessName : r.kind === 'Branch' ? r.values.name : [r.values.firstName, r.values.lastName].filter(Boolean).join(' ')) || `Unnamed ${r.kind.toLowerCase()}`;
const normalized = (v: unknown) => String(v ?? '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const email = (v: unknown) => String(v ?? '').trim().toLowerCase();
const phone = (v: unknown) => String(v ?? '').replace(/\D/g, '');
const same = (a: unknown, b: unknown, normalize = normalized) => !!normalize(a) && normalize(a) === normalize(b);
export type Duplicate = {
    id: string;
    customerId: string;
    name: string;
    summary: string;
    reasons: string[];
};
export function duplicateCandidates(r: ReviewSubject, customers: Customer[]): Duplicate[] {
    const result: Duplicate[] = [], v = r.values;
    const add = (id: string, customerId: string, name: string, summary: string, reasons: string[]) => {
        if (reasons.length)
            result.push({ id, customerId, name, summary, reasons });
    };
    if (r.kind === 'Customer')
        for (const c of customers) {
            const reasons: string[] = [];
            if (same(v.businessName, c.businessName) || same(v.businessName, c.tradingName) || same(v.tradingName, c.businessName) || same(v.tradingName, c.tradingName))
                reasons.push('Business/trading name');
            if (same(v.email, c.email, email))
                reasons.push('Email');
            if (same(v.phone, c.phone, phone))
                reasons.push('Phone');
            if (same(v.abn, c.abn))
                reasons.push('Identifier');
            add(c.id, c.id, c.businessName, [c.code, c.status, c.email, c.phone].filter(Boolean).join(' · '), reasons);
        }
    else {
        const c = customers.find(c => c.id === r.customerId);
        if (!c)
            return [];
        if (r.kind === 'Branch')
            for (const l of c.locations) {
                const reasons: string[] = [];
                if (same(v.name, l.name))
                    reasons.push('Branch name');
                if (String(v.addressLine1).trim() && same([v.addressLine1, v.addressLine2, v.suburb, v.state, v.postcode, v.country].join(' '), [l.addressLine1, l.addressLine2, l.suburb, l.state, l.postcode, l.country].join(' ')))
                    reasons.push('Address');
                if (same(v.phone, l.phone, phone))
                    reasons.push('Phone');
                add(l.id, c.id, l.name, [l.addressLine1, l.suburb, l.postcode].filter(Boolean).join(' · '), reasons);
            }
        else
            for (const contact of c.contacts) {
                const reasons: string[] = [];
                if (same([v.firstName, v.lastName].join(' '), [contact.firstName, contact.lastName].join(' ')))
                    reasons.push('Contact name');
                if (same(v.email, contact.email, email))
                    reasons.push('Email');
                if (same(v.phone, contact.phone, phone) || same(v.phone, contact.mobile, phone) || same(v.mobile, contact.phone, phone) || same(v.mobile, contact.mobile, phone))
                    reasons.push('Phone/mobile');
                add(contact.id, c.id, `${contact.firstName} ${contact.lastName}`, [contact.email, contact.phone, contact.mobile].filter(Boolean).join(' · '), reasons);
            }
    }
    return result.sort((a, b) => b.reasons.length - a.reasons.length || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
export function reviewMasterSignature(customers: Customer[]) { return JSON.stringify(customers); }
export const fieldLabels: Record<string, string> = { businessName: 'Business name', tradingName: 'Trading name', abn: 'Identifier (existing ABN format)', businessType: 'Business type', status: 'Customer status', email: 'Email', phone: 'Phone', website: 'Website', creditLimit: 'Credit limit', paymentTermsDays: 'Payment terms (days)', name: 'Branch name', addressLine1: 'Address line 1', addressLine2: 'Address line 2', suburb: 'Suburb / city', state: 'State / region', postcode: 'Postcode', country: 'Country', isPrimary: 'Primary record', firstName: 'First name', lastName: 'Last name', jobTitle: 'Job title', mobile: 'Mobile', locationId: 'Contact location', isAccounting: 'Accounting contact' };
