import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository, snapshotRepositories } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { accountRepository } from '../accounting/data/accountRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { getProductById, getProductUnit } from '../inventory/data/mockProducts';
import { configurationRows, type ConfigRow } from './configurationState';
import type { Permission } from '../security/rbac';
import type { AccountSystemRole } from '../accounting/types/account';
const strings = z.record(z.string(), z.string().max(20000));
const systemRoles: AccountSystemRole[] = ['BANK', 'ACCOUNTS_RECEIVABLE', 'INVENTORY', 'GRNI', 'PURCHASE_PRICE_VARIANCE', 'GST_RECEIVABLE', 'ACCOUNTS_PAYABLE', 'GST_PAYABLE', 'SALES_REVENUE', 'COST_OF_GOODS_SOLD', 'PURCHASES', 'FREIGHT', 'OPERATING_EXPENSE', 'RETAINED_EARNINGS', 'OWNERS_EQUITY'];
const now = () => new Date().toISOString();
export const workspaceDomains: Record<string, {
    read: Permission;
    write: Permission;
    required: string[];
    fields: string[];
}> = {
    'tax-codes': { read: 'inventory.read', write: 'accounting.post', required: ['code', 'rate', 'collected', 'paid'], fields: ['code', 'rate', 'collected', 'paid', 'basis', 'report'] },
    'linked-accounts': { read: 'accounting.read', write: 'accounting.post', required: ['role', 'accountId'], fields: ['role', 'accountId'] },
    promotions: { read: 'sales.read', write: 'sales.write', required: ['productId', 'unitId', 'starts', 'ends', 'price', 'priority', 'policy'], fields: ['productId', 'unitId', 'customerId', 'starts', 'ends', 'price', 'priority', 'policy'] },
    jobs: { read: 'accounting.read', write: 'accounting.post', required: ['code', 'customerId', 'starts', 'ends', 'budget', 'costBudget'], fields: ['code', 'customerId', 'owner', 'starts', 'ends', 'budget', 'costBudget'] },
    tasks: { read: 'sales.read', write: 'sales.write', required: ['customerId', 'owner', 'due', 'priority', 'notes'], fields: ['customerId', 'owner', 'due', 'priority', 'notes', 'completedAt', 'completedBy'] },
    'bank-rules': { read: 'banking.read', write: 'banking.write', required: ['field', 'operator', 'value', 'accountId', 'taxCode'], fields: ['field', 'operator', 'value', 'accountId', 'taxCode', 'enabled'] },
    templates: { read: 'accounting.read', write: 'accounting.post', required: ['kind', 'subject', 'body'], fields: ['kind', 'subject', 'body', 'footer', 'logo', 'paper'] },
    'custom-reports': { read: 'accounting.read', write: 'accounting.post', required: ['dataset', 'columns', 'basis'], fields: ['dataset', 'columns', 'filter', 'basis', 'favourite'] },
    'report-packs': { read: 'accounting.read', write: 'accounting.post', required: ['periodStart', 'periodEnd', 'reports'], fields: ['periodStart', 'periodEnd', 'reports', 'cover', 'introduction'] },
    settings: { read: 'accounting.read', write: 'accounting.post', required: ['section'], fields: ['section', 'companyName', 'currency', 'timezone', 'yearEnd', 'gstCode', 'quotePrefix', 'orderPrefix', 'invoicePrefix', 'creditPrefix', 'purchasePrefix', 'terms', 'sender', 'payCycle', 'payDay', 'filingRegion', 'basis', 'precision', 'header', 'logo', 'nextQuote', 'nextOrder', 'nextInvoice', 'nextCredit', 'nextPurchase'] },
};
const listeners = new Set<() => void>();
let revision = 0;
const emit = () => { revision++; listeners.forEach(fn => fn()); };
export const configurationHistory: Record<string, ConfigRow[]> = Object.fromEntries(Object.keys(workspaceDomains).map(k => [k, []]));
for (const key of Object.keys(workspaceDomains))
    configurationRows[key] = [];
const taxSeedAccounts = () => ({ collected: accountRepository.getAll().find(a => a.systemRole === 'GST_PAYABLE')?.id ?? '', paid: accountRepository.getAll().find(a => a.systemRole === 'GST_RECEIVABLE')?.id ?? '' });
// Match the existing engine's tax rate when migrating. No statutory rate is inferred from the user's locale.
configurationRows['tax-codes'] = [{ id: 'tax-gst', name: 'GST', status: 'Active', revision: '1', createdAt: now(), updatedAt: now(), code: 'GST', rate: '10', basis: 'Exclusive', report: 'GST', ...taxSeedAccounts() }, { id: 'tax-zero', name: 'Zero rated', status: 'Active', revision: '1', createdAt: now(), updatedAt: now(), code: 'ZERO', rate: '0', basis: 'Exclusive', report: 'Zero rated', ...taxSeedAccounts() }];
function requiredText(value: string | undefined, label: string) { if (!value?.trim())
    throw new Error(`${label} is required.`); }
function money(value: string | undefined, label: string) { if (!value?.trim() || !Number.isFinite(Number(value)) || Number(value) < 0)
    throw new Error(`${label} must be a non-negative number.`); }
function account(id: string | undefined, type?: string) { const a = accountRepository.getAll().find(a => a.id === id); if (!a?.active || type && a.type !== type)
    throw new Error('Select an active account of the correct type.'); return a; }
function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value; }
function validate(domain: string, input: Record<string, string>, rows: ConfigRow[], checkReferences = true) {
    const spec = workspaceDomains[domain];
    if (!spec)
        throw new Error('Unknown workspace domain.');
    const keys = new Set(['id', 'name', 'status', 'revision', 'createdAt', 'updatedAt', ...spec.fields]);
    if (Object.keys(input).some(k => !keys.has(k)))
        throw new Error('Unsupported business field.');
    requiredText(input.name, 'Name');
    for (const key of spec.required)
        requiredText(input[key], key);
    if (!['Active', 'Inactive', 'Open', 'In progress', 'Completed'].includes(input.status ?? 'Active'))
        throw new Error('Invalid business status.');
    if (domain === 'tax-codes') {
        money(input.rate, 'Tax rate');
        if (input.basis && input.basis !== 'Exclusive')
            throw new Error('Only tax-exclusive document entry is supported.');
        if (Number(input.rate) > 100)
            throw new Error('Tax rate cannot exceed 100%.');
        if (checkReferences) {
            account(input.collected, 'LIABILITY');
            account(input.paid, 'ASSET');
            if (input.collected !== accountRepository.requireBySystemRole('GST_PAYABLE').id || input.paid !== accountRepository.requireBySystemRole('GST_RECEIVABLE').id)
                throw new Error('Tax codes use the global GST posting accounts. Change the unused linked accounts first.');
        }
        if (rows.some(r => r.id !== input.id && r.code.toLowerCase() === input.code.toLowerCase()))
            throw new Error('Tax code must be unique.');
        if (!/^[A-Z0-9_-]{1,24}$/.test(input.code))
            throw new Error('Use uppercase letters/numbers for a tax code.');
    }
    if (domain === 'linked-accounts' && checkReferences) {
        const old = accountRepository.requireBySystemRole(input.role as AccountSystemRole);
        const effective = input.status === 'Inactive' ? accountRepository.getAll().find(a => a.systemRole === input.role)?.id : input.accountId;
        const entries = (snapshotRepositories().journals as {
            journalEntries: {
                lines: {
                    accountId: string;
                }[];
            }[];
        } | undefined)?.journalEntries ?? [];
        if (effective !== old.id && entries.some(j => j.lines.some(l => l.accountId === old.id || l.accountId === effective)))
            throw new Error('A used posting account cannot be remapped without a ledger migration.');
    }
    if (domain === 'linked-accounts') {
        if (!systemRoles.includes(input.role as AccountSystemRole))
            throw new Error('Unknown account role.');
        const type = ['BANK', 'ACCOUNTS_RECEIVABLE', 'INVENTORY', 'GST_RECEIVABLE'].includes(input.role) ? 'ASSET' : ['GRNI', 'ACCOUNTS_PAYABLE', 'GST_PAYABLE'].includes(input.role) ? 'LIABILITY' : input.role === 'SALES_REVENUE' ? 'REVENUE' : ['RETAINED_EARNINGS', 'OWNERS_EQUITY'].includes(input.role) ? 'EQUITY' : 'EXPENSE';
        if (checkReferences)
            account(input.accountId, type);
        if (rows.some(r => r.id !== input.id && r.role === input.role))
            throw new Error('A linked account role may only have one mapping.');
    }
    if (domain === 'promotions') {
        const p = getProductById(input.productId);
        if (checkReferences && (!p || !getProductUnit(p.id, input.unitId)))
            throw new Error('Product/unit not found.');
        money(input.price, 'Price');
        if (!Number.isInteger(Number(input.priority)))
            throw new Error('Priority must be an integer.');
        if (!['Customer price first', 'Promotion first', 'Lowest eligible price'].includes(input.policy))
            throw new Error('Invalid price conflict policy.');
        if (!/([+-]\d\d:\d\d|Z)$/.test(input.starts) || !Number.isFinite(Date.parse(input.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(input.ends) || !Number.isFinite(Date.parse(input.ends)) || Date.parse(input.ends) <= Date.parse(input.starts))
            throw new Error('Promotion requires explicit time offsets and an end after start.');
    }
    if (checkReferences && input.customerId && !customerRepository.getById(input.customerId))
        throw new Error('Customer was not found.');
    if (domain === 'jobs') {
        money(input.budget, 'Revenue budget');
        money(input.costBudget, 'Cost budget');
        if (!validDate(input.starts) || !validDate(input.ends) || input.ends < input.starts)
            throw new Error('Invalid project dates.');
        if (rows.some(r => r.id !== input.id && r.code.toLowerCase() === input.code.toLowerCase()))
            throw new Error('Job code must be unique.');
    }
    if (domain === 'tasks') {
        if (!validDate(input.due) || !['Low', 'Normal', 'High'].includes(input.priority))
            throw new Error('Invalid due date or priority.');
    }
    if (domain === 'bank-rules') {
        if (checkReferences)
            account(input.accountId);
        if (!['Description', 'Payee', 'Reference'].includes(input.field) || !['Contains', 'Equals', 'Starts with'].includes(input.operator))
            throw new Error('Invalid bank condition.');
        if (checkReferences && !configurationRows['tax-codes'].some(r => r.status === 'Active' && r.code === input.taxCode))
            throw new Error('Active tax code not found.');
    }
    if (domain === 'report-packs' && (!validDate(input.periodStart) || !validDate(input.periodEnd) || input.periodEnd < input.periodStart))
        throw new Error('Invalid report period.');
    if (domain === 'settings') {
        if (!['business', 'sales', 'purchases', 'payroll', 'reports'].includes(input.section))
            throw new Error('Unknown settings section.');
        if (input.currency && !['NZD', 'AUD'].includes(input.currency))
            throw new Error('Unsupported currency.');
        if (input.timezone) {
            try {
                new Intl.DateTimeFormat('en', { timeZone: input.timezone });
            }
            catch {
                throw new Error('Invalid time zone.');
            }
        }
        for (const key of ['nextQuote', 'nextOrder', 'nextInvoice', 'nextCredit', 'nextPurchase'])
            if (input[key] && (!/^\d+$/.test(input[key]) || Number(input[key]) < 1))
                throw new Error('Next document numbers must be positive integers.');
    }
}
function log(domain: string, row: ConfigRow, action: string) { configurationHistory[domain].push({ id: crypto.randomUUID(), name: action, status: 'Active', revision: '1', createdAt: now(), updatedAt: now(), recordId: row.id, actorId: trustedAuthorization.current()?.userId ?? 'local-test', after: JSON.stringify(row) }); }
export const workspaceRepositories = Object.fromEntries(Object.keys(workspaceDomains).map(domain => {
    const repository = {
        getAll: () => configurationRows[domain], getById: (id: string) => configurationRows[domain].find(r => r.id === id),
        save(raw: Record<string, string>, expectedRevision?: string) { const input = strings.parse(raw), existing = configurationRows[domain].find(r => r.id === input.id); if (existing && existing.revision !== expectedRevision)
            throw new Error('Record changed. Reload before saving.'); if (!existing && expectedRevision !== undefined)
            throw new Error('Record no longer exists.'); const timestamp = now(), row: ConfigRow = { ...input, id: existing?.id ?? crypto.randomUUID(), name: input.name.trim(), status: input.status ?? 'Active', revision: String(Number(existing?.revision ?? '0') + 1), createdAt: existing?.createdAt ?? timestamp, updatedAt: timestamp }; if (domain === 'tasks' && row.status === 'Completed') {
            row.completedAt = existing?.completedAt ?? timestamp;
            row.completedBy = existing?.completedBy ?? trustedAuthorization.current()?.userId ?? 'local-test';
        } validate(domain, row, configurationRows[domain]); configurationRows[domain] = [...configurationRows[domain].filter(r => r.id !== row.id), row]; log(domain, row, existing ? 'Updated' : 'Created'); emit(); return row; },
        setStatus(id: string, status: string, expectedRevision: string) { const row = repository.getById(id); if (!row)
            throw new Error('Record was not found.'); return repository.save({ ...row, status }, expectedRevision); },
        addNote(id: string, note: string) { const row = repository.getById(id); if (!row || domain !== 'tasks' || !note.trim() || note.length > 4000)
            throw new Error('A valid task note is required.'); log(domain, { ...row, note: note.trim() }, 'Note added'); emit(); },
    };
    registerRepository('workspace_' + domain.replaceAll('-', '_'), { validate: (value, snapshots) => { validateConfigurationSnapshot(domain, value); validateConfigurationReferences(domain, value, snapshots); }, repository, read: workspaceDomains[domain].read, commands: { save: workspaceDomains[domain].write, setStatus: workspaceDomains[domain].write, addNote: domain === 'tasks' ? 'sales.write' : null }, snapshot: () => ({ records: configurationRows[domain], history: configurationHistory[domain] }), restore: value => { validateConfigurationSnapshot(domain, value); configurationRows[domain] = value.records; configurationHistory[domain] = value.history; }, publish: emit });
    return [domain, repository];
}));
export function validateConfigurationSnapshot(domain: string, value: unknown) { const snapshot = z.object({ records: z.array(strings), history: z.array(strings) }).strict().parse(value); const ids = new Set<string>(); for (const row of snapshot.records) {
    if (!row.id || ids.has(row.id) || !/^\d+$/.test(row.revision))
        throw new Error('Invalid workspace record identity.');
    ids.add(row.id);
    validate(domain, row, snapshot.records as ConfigRow[], false);
} return snapshot; }
export function useWorkspaceRecords(domain: string) { useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => revision, () => revision); return configurationRows[domain] ?? []; }
export { systemRoles };
function validateConfigurationReferences(domain: string, value: unknown, snapshots: Record<string, unknown>) {
    const records = (value as {
        records: ConfigRow[];
    }).records;
    const accounts = (snapshots.accounts as {
        accounts: {
            id: string;
            type: string;
        }[];
    }).accounts;
    const products = (snapshots.products as {
        products: {
            id: string;
            units: {
                id: string;
            }[];
        }[];
    }).products;
    const customers = (snapshots.customers as {
        customers: {
            id: string;
        }[];
    }).customers;
    const taxes = (snapshots.workspace_tax_codes as {
        records: ConfigRow[];
    }).records;
    for (const row of records) {
        if (row.customerId && !customers.some(c => c.id === row.customerId))
            throw new Error('Backup workspace customer reference is invalid.');
        if (domain === 'promotions' && !products.some(p => p.id === row.productId && p.units.some(u => u.id === row.unitId)))
            throw new Error('Backup promotion product/unit reference is invalid.');
        if (domain === 'tax-codes' && (!accounts.some(a => a.id === row.collected && a.type === 'LIABILITY') || !accounts.some(a => a.id === row.paid && a.type === 'ASSET')))
            throw new Error('Backup tax account reference is invalid.');
        if (['bank-rules', 'linked-accounts'].includes(domain) && !accounts.some(a => a.id === row.accountId))
            throw new Error('Backup linked account reference is invalid.');
        if (domain === 'bank-rules' && !taxes.some(t => t.code === row.taxCode))
            throw new Error('Backup bank-rule tax reference is invalid.');
    }
}
