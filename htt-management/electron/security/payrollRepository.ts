import { australianWithholding } from '../../src/features/payroll/data/australianTax';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { registerRepository } from '../../src/features/security/repositoryHost';
import { trustedAuthorization } from '../../src/features/security/trustedAuthorization';
import { accountRepository } from '../../src/features/accounting/data/accountRepository';
import { journalEntryRepository } from '../../src/features/accounting/data/journalEntryRepository';
import { bankAccountRepository } from '../../src/features/banking/data/bankAccountRepository';
import { assertSourceNotReconciled } from '../../src/features/banking/data/reconciliationLock';
import { assertCurrentCrossModuleWriteSafe } from '../../src/features/integration/crossModuleWriteGate';
import { businessSettings } from '../../src/features/business-workspace/configurationState';
import { encodeCsv } from '../../src/features/data-transfer/transferModel';
import { id, date, reason, moneyValue, employeeFields, itemFields, settingsFields, timeFields, leaveFields, runFields, stateSchema, emptyPayroll, calculateTotals, sumSlips, round, type PayrollState, type Employee, type PayItem, type PayRun, type Slip, type TimeRow, type LeaveRow, type entities } from '../../src/features/payroll/data/payrollModel';
let state: PayrollState = emptyPayroll();
type Entity = typeof entities[number];
const stable = (v: any): any => Array.isArray(v) ? v.map(stable) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => [k, stable(v[k])])) : v;
const hash = (v: unknown) => createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
const common = { operationId: id, reason }, expected = { id: id.optional(), expectedRevision: z.number().int().nonnegative() };
function principal(permission: 'payroll.read' | 'payroll.manage' | 'payroll.approve' | 'payroll.post' = 'payroll.manage') { return trustedAuthorization.require(permission); }
function row<K extends Entity>(entity: K, recordId: string) {
    const found = state[entity].find((r: any) => r.id === recordId);
    if (!found)
        throw new Error('Payroll record was not found.');
    return found as PayrollState[K][number];
}
const live = (r: PayRun) => !['Cancelled', 'Reversed'].includes(r.status);
function reserved(entity: 'timesheets' | 'leave', recordId: string, except?: string) { return state.runs.some(r => r.id !== except && live(r) && r.slips.some(s => (entity === 'timesheets' ? s.timeIds : s.leaveIds).includes(recordId))); }
function put<K extends Entity>(entity: K, value: PayrollState[K][number]) { (state[entity] as any[]) = [...(state[entity] as any[]).filter(r => r.id !== value.id), value]; return structuredClone(value); }
function meta(old: any, action: string, why: string) { const revision = (old?.revision ?? 0) + 1; return { id: old?.id ?? crypto.randomUUID(), revision, history: [...(old?.history ?? []), { actorId: principal('payroll.read').userId, at: new Date().toISOString(), action, reason: why, revision }] }; }
function version(old: any, expected: number) {
    if ((old?.revision ?? 0) !== expected)
        throw new Error('Payroll record changed. Reload before editing.');
}
function execute(input: {
    operationId: string;
    reason: string;
}, entity: Entity, fn: () => any) {
    const fingerprint = hash({ input, actorId: principal('payroll.read').userId }), old = state.receipts.find(r => r.operationId === input.operationId);
    if (old) {
        if (old.fingerprint !== fingerprint || old.entity !== entity)
            throw new Error('Operation ID already has different payroll data.');
        return structuredClone(row(entity, old.recordId));
    }
    const result = fn();
    state.receipts.push({ operationId: input.operationId, fingerprint, input: structuredClone(input) as any, actorId: principal('payroll.read').userId, entity, recordId: result.id, revision: result.revision });
    stateSchema.parse(state);
    return result;
}
function account(accountId: string, type: 'EXPENSE' | 'LIABILITY', active = true) {
    const a = accountRepository.requireById(accountId);
    if (a.type !== type || (active && !a.active) || (a.systemRole && !(type === 'EXPENSE' && a.systemRole === 'OPERATING_EXPENSE')))
        throw new Error(`Use a dedicated ${type.toLowerCase()} payroll account, not a bank, tax, AR/AP or stock control account.`);
    return a;
}
function validateItem(i: PayItem, active = true) {
    account(i.accountId, ['Earnings', 'Allowance', 'Employer contribution'].includes(i.category) ? 'EXPENSE' : 'LIABILITY', active);
    if (i.category === 'Employer contribution')
        account(i.liabilityAccountId, 'LIABILITY', active);
    else if (i.liabilityAccountId)
        throw new Error('Only employer contributions use a second liability account.');
    if ((['Earnings', 'Allowance'].includes(i.category) && i.method === 'Percentage') || (i.category === 'Tax' && i.method !== 'Fixed'))
        throw new Error('Earnings use hourly/fixed values; withholding tax is an explicitly reviewed fixed amount.');
    if (i.method === 'Percentage' && i.rate > 100)
        throw new Error('Percentage rates cannot exceed 100.');
}
function employeeFor(recordId: string) {
    const e = row('employees', recordId) as Employee;
    if (e.status !== 'Active')
        throw new Error('Select an active employee.');
    return e;
}
function employment(e: Employee, from: string, to = from) {
    if (from < e.startDate || (e.endDate && to > e.endDate))
        throw new Error('Dates must be within the employment period.');
}
function validateTimeSource(t: z.infer<typeof timeFields>) {
    const e = employeeFor(t.employeeId);
    employment(e, t.date);
    const i = row('items', t.itemId) as PayItem;
    if (!i.active || i.category !== 'Earnings' || (e.basis === 'Hourly' && i.method !== 'Hourly') || (e.basis === 'Salary' && i.id !== e.earningItemId))
        throw new Error('Select an appropriate employee earnings item.');
    validateItem(i);
}
function validateLeaveSource(l: z.infer<typeof leaveFields>, except?: string) {
    employment(employeeFor(l.employeeId), l.start, l.end);
    if (l.start > l.end || l.hours > ((Date.parse(l.end) - Date.parse(l.start)) / 86400000 + 1) * 24)
        throw new Error('Leave dates or hours are invalid.');
    if (state.leave.some(other => other.id !== except && other.employeeId === l.employeeId && ['Pending', 'Approved'].includes(other.status) && other.start <= l.end && other.end >= l.start))
        throw new Error('Leave request dates overlap.');
}
function settings() {
    const s = state.settings[0];
    if (!s)
        throw new Error('Configure payroll settings first.');
    account(s.netAccountId, 'LIABILITY');
    const tax = row('items', s.taxItemId) as PayItem;
    if (tax.category !== 'Tax' || !tax.active)
        throw new Error('Select an active fixed withholding item.');
    validateItem(tax);
    if (s.netAccountId === tax.accountId)
        throw new Error('Net wages and withholding require separate liability accounts.');
    const superItem = row('items', s.superItemId) as PayItem;
    if (superItem.category !== 'Employer contribution' || superItem.method !== 'Fixed' || !superItem.active)
        throw new Error('Use an active fixed super contribution item.');
    validateItem(superItem);
    if (s.currency !== 'AUD' || s.currency !== businessSettings().currency)
        throw new Error('Payroll currency must match the business currency.');
    return s;
}
function balances(employeeId: string, omitRun?: string) {
    const e = row('employees', employeeId) as Employee;
    let annual = e.annualOpening, personal = e.personalOpening;
    const used = new Set<string>();
    for (const r of state.runs.filter(r => r.status === 'Posted' && r.id !== omitRun))
        for (const s of r.slips.filter(s => s.employee.id === employeeId)) {
            annual += s.annualAccrual;
            personal += s.personalAccrual;
            for (const lid of s.leaveIds) {
                const l = row('leave', lid) as LeaveRow;
                used.add(lid);
                if (l.type === 'Annual')
                    annual -= l.hours;
                if (l.type === 'Personal')
                    personal -= l.hours;
            }
        }
    const pending = state.leave.filter(l => l.employeeId === employeeId && l.status === 'Approved' && !used.has(l.id));
    return { annual: Math.round(annual * 10000) / 10000, personal: Math.round(personal * 10000) / 10000, reservedAnnual: pending.filter(l => l.type === 'Annual').reduce((n, l) => n + l.hours, 0), reservedPersonal: pending.filter(l => l.type === 'Personal').reduce((n, l) => n + l.hours, 0) };
}
function enough(employeeId: string, omitRun?: string) {
    const b = balances(employeeId, omitRun);
    if (b.annual - b.reservedAnnual < -0.00001 || b.personal - b.reservedPersonal < -0.00001)
        throw new Error('Approved leave exceeds the available recorded hours.');
}
const sourceToken = () => hash({ employees: state.employees, items: state.items, timesheets: state.timesheets, leave: state.leave, settings: state.settings });
function build(input: z.infer<typeof runFields>, except?: string) {
    if (input.start > input.end || input.payDate < input.end)
        throw new Error('Pay date must follow a valid pay period.');
    const config = settings(), seen = new Set<string>(), slips: Slip[] = [];
    for (const entry of input.employeeInputs) {
        if (seen.has(entry.employeeId))
            throw new Error('Include each employee only once.');
        seen.add(entry.employeeId);
        const e = employeeFor(entry.employeeId);
        if (e.startDate > input.end || (e.endDate && e.endDate < input.start))
            throw new Error('Employment does not overlap this pay period.');
        if (e.basis === 'Salary' && (e.startDate > input.start || (e.endDate && e.endDate < input.end)) && entry.salaryOverride === undefined)
            throw new Error('Partial-period salary requires a reviewed salary override.');
        if (state.runs.some(r => r.id !== except && live(r) && r.start <= input.end && r.end >= input.start && r.slips.some(s => s.employee.id === e.id)))
            throw new Error('Employee already has an overlapping pay run. Cancel or reverse it before replacing it.');
        const base = row('items', e.earningItemId) as PayItem;
        if (!base.active || base.category !== 'Earnings' || base.method !== (e.basis === 'Hourly' ? 'Hourly' : 'Fixed'))
            throw new Error('Employee earning item does not match the pay basis.');
        validateItem(base);
        const times = state.timesheets.filter(t => t.employeeId === e.id && t.status === 'Approved' && t.date >= input.start && t.date <= input.end), leaves = state.leave.filter(l => l.employeeId === e.id && l.status === 'Approved' && l.start <= input.end && l.end >= input.start);
        if (leaves.some(l => l.start < input.start || l.end > input.end))
            throw new Error('Split leave spanning pay periods before including it in payroll.');
        for (const t of times)
            validateTimeSource(t);
        for (const l of leaves)
            validateLeaveSource(l, l.id);
        if (times.some(t => reserved('timesheets', t.id, except)) || leaves.some(l => reserved('leave', l.id, except)))
            throw new Error('Hours or leave are already reserved by another pay run.');
        if (times.some(t => leaves.some(l => t.date >= l.start && t.date <= l.end)))
            throw new Error('Approved timesheet and leave dates overlap; correct them before payroll.');
        if (e.basis === 'Salary' && leaves.some(l => l.type === 'Unpaid') && entry.salaryOverride === undefined)
            throw new Error('Salary with unpaid leave requires an explicitly reviewed salary override.');
        if (e.basis === 'Hourly' && entry.salaryOverride !== undefined)
            throw new Error('Hourly employees cannot use a salary override.');
        const lines: Slip['lines'] = [];
        const add = (item: PayItem, quantity: number, rate: number, source: string) => {
            validateItem(item);
            if (!item.active)
                throw new Error('Inactive pay item.');
            const amount = round(quantity * rate);
            moneyValue.parse(amount);
            lines.push({ item: structuredClone(item), quantity, rate, amount, source });
        };
        if (e.basis === 'Salary')
            add(base, 1, entry.salaryOverride ?? e.rate, 'Salary');
        for (const t of times) {
            if (e.basis === 'Salary') {
                if (t.itemId !== base.id)
                    throw new Error('Salary timesheets record ordinary hours only; use an explicit adjustment for extra pay.');
                continue;
            }
            const i = row('items', t.itemId) as PayItem;
            if (i.category !== 'Earnings' || i.method !== 'Hourly')
                throw new Error('Timesheet must use hourly earnings.');
            add(i, t.hours, i.id === base.id ? e.rate : i.rate, 'Time:' + t.id);
        }
        if (e.basis === 'Hourly')
            for (const l of leaves.filter(l => l.type !== 'Unpaid'))
                add(base, l.hours, e.rate, 'Leave:' + l.id);
        const extras = input.adjustments.filter(a => a.employeeId === e.id), fixed = extras.filter(a => (row('items', a.itemId) as PayItem).method !== 'Percentage');
        for (const a of fixed) {
            const i = row('items', a.itemId) as PayItem;
            if (i.id === config.superItemId)
                throw new Error('Use the employee super guarantee fields for the standard contribution.');
            if (i.category === 'Tax')
                throw new Error('Use the explicit employee withholding field for tax.');
            if (i.method === 'Fixed' && a.quantity !== 1)
                throw new Error('Fixed pay items require quantity 1.');
            add(i, a.quantity, a.rate, 'Adjustment');
        }
        const gross = round(lines.filter(l => ['Earnings', 'Allowance'].includes(l.item.category)).reduce((n, l) => n + l.amount, 0));
        if (gross <= 0)
            throw new Error('Each employee needs positive gross earnings.');
        for (const a of extras.filter(a => (row('items', a.itemId) as PayItem).method === 'Percentage')) {
            if (a.quantity !== 1 || a.rate > 100)
                throw new Error('Percentage items require quantity 1 and rate 0–100.');
            add(row('items', a.itemId) as PayItem, 1, round(gross * a.rate / 100), 'Adjustment');
            lines[lines.length - 1].quantity = 1;
            lines[lines.length - 1].rate = a.rate;
        }
        const taxable = round(lines.filter(l => ['Earnings', 'Allowance'].includes(l.item.category) && l.item.taxable).reduce((n, l) => n + l.amount, 0));
        let withholding = entry.withholding;
        if (e.taxScale !== 'Manual') {
            if (!e.standardTaxConfirmed)
                throw new Error('Confirm the standard PAYG case or use reviewed manual withholding.');
            if (!e.taxScale.startsWith('4-') && !/^\d{8,9}$/.test(e.taxIdentifier.replace(/\s/g, '')))
                throw new Error('Record a provided eight- or nine-digit TFN for the selected scale.');
            if (entry.withholding !== 0)
                throw new Error('Clear manual withholding for an automatic PAYG employee.');
            withholding = australianWithholding(taxable, e.taxScale, config.frequency, input.payDate);
        }
        withholding = round(withholding + entry.additionalWithholding);
        add(row('items', config.taxItemId) as PayItem, 1, withholding, e.taxScale === 'Manual' ? 'Reviewed PAYG' : 'ATO 2026–27 scale ' + e.taxScale);
        if (entry.superMethod === '12% reviewed QE' && (input.payDate < '2026-07-01' || input.payDate > '2027-06-30' || entry.superBase > gross))
            throw new Error('Reviewed qualifying earnings must not exceed gross and the 12% helper is limited to 2026–27. Use a reviewed super amount for exceptions.');
        const superAmount = entry.superMethod === '12% reviewed QE' ? round(entry.superBase * .12) : entry.superAmount;
        add(row('items', config.superItemId) as PayItem, 1, superAmount, entry.superMethod === '12% reviewed QE' ? 'SG 12% reviewed QE' : 'Reviewed SG amount');
        const totals = calculateTotals(lines);
        slips.push({ employee: structuredClone(e), lines, timeIds: times.map(t => t.id), leaveIds: leaves.map(l => l.id), annualAccrual: entry.annualAccrual, personalAccrual: entry.personalAccrual, totals });
    }
    if (input.adjustments.some(a => !seen.has(a.employeeId)))
        throw new Error('Adjustment employee is not included in this run.');
    return { slips, totals: sumSlips(slips), settings: structuredClone(config), sourceToken: sourceToken() };
}
function postingLines(r: PayRun) {
    const result: {
        accountId: string;
        debit: number;
        credit: number;
    }[] = [];
    for (const s of r.slips) {
        for (const l of s.lines.filter(l => l.amount > 0)) {
            const debit = ['Earnings', 'Allowance', 'Employer contribution'].includes(l.item.category);
            result.push({ accountId: l.item.accountId, debit: debit ? l.amount : 0, credit: debit ? 0 : l.amount });
            if (l.item.category === 'Employer contribution')
                result.push({ accountId: l.item.liabilityAccountId, debit: 0, credit: l.amount });
        }
        if (s.totals.net)
            result.push({ accountId: r.settings.netAccountId, debit: 0, credit: s.totals.net });
    }
    return result;
}
function obligations(r: PayRun) {
    const sums = new Map<string, number>();
    for (const l of postingLines(r).filter(l => l.credit))
        sums.set(l.accountId, round((sums.get(l.accountId) ?? 0) + l.credit));
    return [...sums].map(([accountId, amount]) => ({ accountId, amount, paid: round(state.payments.filter(p => p.runId === r.id && p.accountId === accountId && p.status === 'Posted').reduce((n, p) => n + p.amount, 0)) }));
}
export const payrollRepository = {
    balances(employeeId: string) { principal('payroll.read'); return balances(id.parse(employeeId)); },
    obligations(runId: string) { principal('payroll.read'); return obligations(row('runs', id.parse(runId)) as PayRun); },
    setupDefaults(raw: unknown) {
        principal();
        trustedAuthorization.require('accounting.post');
        const input = z.object(common).strict().parse(raw);
        return execute(input, 'settings', () => {
            if (state.settings.length)
                throw new Error('Payroll is already configured.');
            const make = (code: number, name: string, type: 'EXPENSE' | 'LIABILITY') => {
                while (accountRepository.getAll().some(a => a.code === String(code)))
                    code++;
                return accountRepository.create({ code: String(code), name, type, active: true, allowManualPosting: type === 'EXPENSE' }).id;
            };
            const wages = make(6000, 'Payroll wages', 'EXPENSE'), contribution = make(6010, 'Payroll employer contributions', 'EXPENSE'), net = make(2200, 'Net wages payable', 'LIABILITY'), tax = make(2210, 'Payroll withholding payable', 'LIABILITY'), deduction = make(2220, 'Payroll deductions payable', 'LIABILITY'), employer = make(2230, 'Employer contributions payable', 'LIABILITY');
            const add = (code: string, name: string, category: PayItem['category'], method: PayItem['method'], accountId: string, liabilityAccountId = '') => { const i = { ...meta(undefined, 'Created', input.reason), code, name, category, method, rate: 0, taxable: ['Earnings', 'Allowance'].includes(category), accountId, liabilityAccountId, active: true }; state.items.push(i); return i; };
            add('ORD', 'Ordinary hours', 'Earnings', 'Hourly', wages);
            add('SAL', 'Salary per run', 'Earnings', 'Fixed', wages);
            const withholding = add('TAX', 'Reviewed withholding', 'Tax', 'Fixed', tax);
            add('ALLOW', 'Allowance', 'Allowance', 'Fixed', wages);
            add('DEDUCT', 'Employee deduction', 'Deduction', 'Fixed', deduction);
            const superItem = add('SG', 'Super guarantee', 'Employer contribution', 'Fixed', contribution, employer);
            return put('settings', { ...meta(undefined, 'Configured', input.reason), netAccountId: net, taxItemId: withholding.id, currency: businessSettings().currency, region: 'Australia', frequency: 'Fortnightly', superItemId: superItem.id, employerName: businessSettings().companyName, employerIdentifier: '' });
        });
    },
    saveEmployee(raw: unknown) {
        principal();
        const input = z.object({ ...common, ...expected, values: employeeFields }).strict().parse(raw);
        return execute(input, 'employees', () => {
            const old = input.id ? row('employees', input.id) as Employee : undefined;
            version(old, input.expectedRevision);
            if (state.employees.some(e => e.id !== old?.id && e.code.toLowerCase() === input.values.code.toLowerCase()))
                throw new Error('Employee code already exists.');
            if (input.values.endDate && input.values.endDate < input.values.startDate)
                throw new Error('Employment end date is before the start date.');
            const item = row('items', input.values.earningItemId) as PayItem;
            if (!item.active || item.category !== 'Earnings' || item.method !== (input.values.basis === 'Hourly' ? 'Hourly' : 'Fixed'))
                throw new Error('Select an active earning item matching the pay basis.');
            if (old && state.runs.some(r => ['Posted', 'Reversed'].includes(r.status) && r.slips.some(s => s.employee.id === old.id)) && (old.annualOpening !== input.values.annualOpening || old.personalOpening !== input.values.personalOpening))
                throw new Error('Opening leave hours are locked after payroll posting.');
            return put('employees', { ...input.values, ...meta(old, old ? 'Edited' : 'Created', input.reason) });
        });
    },
    saveItem(raw: unknown) {
        principal();
        const input = z.object({ ...common, ...expected, values: itemFields }).strict().parse(raw);
        return execute(input, 'items', () => {
            const old = input.id ? row('items', input.id) as PayItem : undefined;
            version(old, input.expectedRevision);
            if (state.items.some(i => i.id !== old?.id && i.code.toLowerCase() === input.values.code.toLowerCase()))
                throw new Error('Pay item code already exists.');
            const next = { ...input.values, ...meta(old, old ? 'Edited' : 'Created', input.reason) };
            validateItem(next);
            return put('items', next);
        });
    },
    saveSettings(raw: unknown) {
        principal();
        const input = z.object({ ...common, expectedRevision: z.number().int().nonnegative(), values: settingsFields }).strict().parse(raw);
        return execute(input, 'settings', () => {
            const old = state.settings[0];
            version(old, input.expectedRevision);
            account(input.values.netAccountId, 'LIABILITY');
            const sg = row('items', input.values.superItemId) as PayItem;
            if (sg.category !== 'Employer contribution' || sg.method !== 'Fixed' || !sg.active)
                throw new Error('Select an active fixed super guarantee item.');
            const t = row('items', input.values.taxItemId) as PayItem;
            if (t.category !== 'Tax' || !t.active || t.accountId === input.values.netAccountId)
                throw new Error('Use a valid withholding item and a separate net wages account.');
            if (input.values.currency !== 'AUD' || input.values.currency !== businessSettings().currency)
                throw new Error('Payroll currency must match the business.');
            return put('settings', { ...input.values, ...meta(old, 'Settings changed', input.reason) });
        });
    },
    saveTime(raw: unknown) {
        principal();
        const input = z.object({ ...common, ...expected, values: timeFields }).strict().parse(raw);
        return execute(input, 'timesheets', () => {
            const old = input.id ? row('timesheets', input.id) as TimeRow : undefined;
            version(old, input.expectedRevision);
            if (old && (old.status !== 'Draft' || reserved('timesheets', old.id)))
                throw new Error('Only an unreserved draft timesheet can be edited.');
            validateTimeSource(input.values);
            const e = employeeFor(input.values.employeeId), i = row('items', input.values.itemId) as PayItem;
            if (state.timesheets.filter(t => t.id !== old?.id && t.employeeId === e.id && t.date === input.values.date).reduce((n, t) => n + t.hours, 0) + input.values.hours > 24)
                throw new Error('Total timesheet hours cannot exceed 24 for one employee/day.');
            if (state.timesheets.some(t => t.id !== old?.id && t.employeeId === e.id && t.itemId === i.id && t.date === input.values.date))
                throw new Error('A timesheet already exists for this employee, day and item.');
            return put('timesheets', { ...input.values, ...meta(old, old ? 'Edited' : 'Created', input.reason), status: 'Draft' });
        });
    },
    changeTime(raw: unknown) {
        const input = z.object({ ...common, id, expectedRevision: z.number().int().positive(), action: z.enum(['Submit', 'Approve', 'Reopen']) }).strict().parse(raw);
        principal(input.action === 'Approve' ? 'payroll.approve' : 'payroll.manage');
        return execute(input, 'timesheets', () => {
            const old = row('timesheets', input.id) as TimeRow;
            version(old, input.expectedRevision);
            if (reserved('timesheets', old.id))
                throw new Error('Timesheet is reserved by a pay run.');
            if (input.action === 'Submit' && old.status !== 'Draft' || input.action === 'Approve' && old.status !== 'Submitted' || input.action === 'Reopen' && old.status === 'Draft')
                throw new Error('Invalid timesheet transition.');
            if (input.action !== 'Reopen')
                validateTimeSource(old);
            return put('timesheets', { ...old, ...meta(old, input.action, input.reason), status: input.action === 'Submit' ? 'Submitted' : input.action === 'Approve' ? 'Approved' : 'Draft' });
        });
    },
    saveLeave(raw: unknown) {
        principal();
        const input = z.object({ ...common, ...expected, values: leaveFields }).strict().parse(raw);
        return execute(input, 'leave', () => {
            const old = input.id ? row('leave', input.id) as LeaveRow : undefined;
            version(old, input.expectedRevision);
            if (old && (old.status !== 'Pending' || reserved('leave', old.id)))
                throw new Error('Only an unreserved pending leave request can be edited.');
            validateLeaveSource(input.values, old?.id);
            return put('leave', { ...input.values, ...meta(old, old ? 'Edited' : 'Created', input.reason), status: 'Pending' });
        });
    },
    changeLeave(raw: unknown) {
        const input = z.object({ ...common, id, expectedRevision: z.number().int().positive(), action: z.enum(['Approve', 'Decline', 'Cancel', 'Reopen']) }).strict().parse(raw);
        principal(input.action === 'Approve' || input.action === 'Decline' ? 'payroll.approve' : 'payroll.manage');
        return execute(input, 'leave', () => {
            const old = row('leave', input.id) as LeaveRow;
            version(old, input.expectedRevision);
            if (reserved('leave', old.id))
                throw new Error('Leave is reserved by a pay run.');
            if ((['Approve', 'Decline'].includes(input.action) && old.status !== 'Pending') || (input.action === 'Cancel' && ['Cancelled', 'Declined'].includes(old.status)) || (input.action === 'Reopen' && !['Cancelled', 'Declined'].includes(old.status)))
                throw new Error('Invalid leave transition.');
            if (input.action === 'Approve' || input.action === 'Reopen')
                validateLeaveSource(old, old.id);
            const next = put('leave', { ...old, ...meta(old, input.action, input.reason), status: input.action === 'Approve' ? 'Approved' : input.action === 'Decline' ? 'Declined' : input.action === 'Cancel' ? 'Cancelled' : 'Pending' });
            if (next.status === 'Approved')
                enough(old.employeeId);
            return next;
        });
    },
    saveRun(raw: unknown) {
        principal();
        const input = z.object({ ...common, ...expected, values: runFields }).strict().parse(raw);
        return execute(input, 'runs', () => {
            const old = input.id ? row('runs', input.id) as PayRun : undefined;
            version(old, input.expectedRevision);
            if (old && old.status !== 'Draft')
                throw new Error('Only a draft pay run can be recalculated.');
            const built = build(input.values, old?.id);
            return put('runs', { ...input.values, ...meta(old, old ? 'Recalculated' : 'Created', input.reason), ...built, status: 'Draft' });
        });
    },
    changeRun(raw: unknown) {
        const input = z.object({ ...common, id, expectedRevision: z.number().int().positive(), action: z.enum(['Approve', 'Reopen', 'Cancel', 'Post', 'Reverse']), date: date.optional() }).strict().parse(raw);
        principal(input.action === 'Approve' ? 'payroll.approve' : ['Post', 'Reverse'].includes(input.action) ? 'payroll.post' : 'payroll.manage');
        return execute(input, 'runs', () => {
            const old = row('runs', input.id) as PayRun;
            version(old, input.expectedRevision);
            if (input.action === 'Approve' || input.action === 'Post') {
                if (old.status !== (input.action === 'Approve' ? 'Draft' : 'Approved'))
                    throw new Error('Invalid pay-run transition.');
                if (!old.taxReviewed || old.reviewReference.trim().length < 3)
                    throw new Error('Confirm reviewed withholding and provide its reference.');
                if (old.sourceToken !== sourceToken())
                    throw new Error('Payroll sources changed. Reopen and recalculate the run.');
                const built = build(runFields.parse(Object.fromEntries(Object.keys(runFields.shape).map(k => [k, (old as any)[k]]))), old.id);
                if (hash(built.slips) !== hash(old.slips))
                    throw new Error('Payroll calculation changed. Recalculate the run.');
            }
            if (input.action === 'Approve')
                return put('runs', { ...old, ...meta(old, 'Approved', input.reason), status: 'Approved' });
            if (input.action === 'Reopen') {
                if (old.status !== 'Approved')
                    throw new Error('Only an approved run can be reopened.');
                return put('runs', { ...old, ...meta(old, 'Reopened', input.reason), status: 'Draft', taxReviewed: false });
            }
            if (input.action === 'Cancel') {
                if (!['Draft', 'Approved'].includes(old.status))
                    throw new Error('Only an unposted run can be cancelled.');
                return put('runs', { ...old, ...meta(old, 'Cancelled', input.reason), status: 'Cancelled' });
            }
            assertCurrentCrossModuleWriteSafe();
            if (input.action === 'Post') {
                const journal = journalEntryRepository.post({ journalDate: old.payDate, description: 'Payroll ' + old.name, reference: old.id, sourceType: 'PAYROLL', sourceId: old.id, lines: postingLines(old) });
                const next = put('runs', { ...old, ...meta(old, 'Posted', input.reason), status: 'Posted', journalId: journal.id });
                old.slips.forEach(s => enough(s.employee.id));
                return next;
            }
            if (old.status !== 'Posted' || !input.date || input.date < old.payDate)
                throw new Error('Reverse a posted run on or after its pay date.');
            if (state.payments.some(p => p.runId === old.id && p.status === 'Posted'))
                throw new Error('Reverse recorded payroll payments before reversing the run.');
            const journal = journalEntryRepository.reverse({ journalEntryId: old.journalId!, reversalDate: input.date, reason: input.reason });
            const next = put('runs', { ...old, ...meta(old, 'Reversed', input.reason), status: 'Reversed', reversalJournalId: journal.id, reversalDate: input.date });
            old.slips.forEach(s => enough(s.employee.id));
            for (const f of state.filings.filter(f => f.runId === old.id))
                put('filings', { ...f, ...meta(f, 'Correction needed', input.reason), status: 'Correction needed' });
            return next;
        });
    },
    recordPayment(raw: unknown) {
        principal('payroll.post');
        trustedAuthorization.require('banking.write');
        const input = z.object({ ...common, runId: id, accountId: id, bankAccountId: id, date, amount: moneyValue.refine(n => n > 0), reference: z.string().trim().max(200) }).strict().parse(raw);
        return execute(input, 'payments', () => {
            assertCurrentCrossModuleWriteSafe();
            const r = row('runs', input.runId) as PayRun;
            if (r.status !== 'Posted' || input.date < r.payDate)
                throw new Error('Record payment against a posted run on or after pay date.');
            const due = obligations(r).find(o => o.accountId === input.accountId);
            if (!due || input.amount > round(due.amount - due.paid))
                throw new Error('Payment exceeds the outstanding payroll liability.');
            account(input.accountId, 'LIABILITY');
            const bank = bankAccountRepository.requireById(input.bankAccountId), gl = accountRepository.requireById(bank.glAccountId);
            if (!bank.active || !gl.active || gl.type !== 'ASSET' || bank.currency !== r.settings.currency || input.date < bank.openingBalanceDate)
                throw new Error('Use an active bank in the payroll currency with a valid posting date.');
            const base = meta(undefined, 'Payment recorded', input.reason), journal = journalEntryRepository.post({ journalDate: input.date, description: 'Payroll payment ' + r.name, reference: input.reference, sourceType: 'PAYROLL_PAYMENT', sourceId: base.id, lines: [{ accountId: input.accountId, debit: input.amount, credit: 0 }, { accountId: bank.glAccountId, debit: 0, credit: input.amount }] });
            const { reason: _reason, ...payment } = input;
            return put('payments', { ...payment, ...base, status: 'Posted', journalId: journal.id });
        });
    },
    reversePayment(raw: unknown) {
        principal('payroll.post');
        trustedAuthorization.require('banking.write');
        const input = z.object({ ...common, id, expectedRevision: z.number().int().positive(), date }).strict().parse(raw);
        return execute(input, 'payments', () => {
            assertCurrentCrossModuleWriteSafe();
            const old = row('payments', input.id);
            version(old, input.expectedRevision);
            if (old.status !== 'Posted' || input.date < old.date)
                throw new Error('Reverse a posted payment on or after its date.');
            assertSourceNotReconciled('PAYROLL_PAYMENT', old.id);
            const j = journalEntryRepository.reverse({ journalEntryId: old.journalId, reversalDate: input.date, reason: input.reason });
            return put('payments', { ...old, ...meta(old, 'Payment reversed', input.reason), status: 'Reversed', reversalJournalId: j.id, reversalDate: input.date });
        });
    },
    recordFiling(raw: unknown) {
        principal();
        const input = z.object({ ...common, runId: id, expectedRevision: z.number().int().nonnegative(), reference: z.string().trim().max(200), notes: z.string().trim().max(1000) }).strict().parse(raw);
        return execute(input, 'filings', () => {
            const r = row('runs', input.runId) as PayRun;
            if (r.status !== 'Posted')
                throw new Error('Prepare filing review only for a posted run.');
            const old = state.filings.find(f => f.runId === r.id);
            version(old, input.expectedRevision);
            return put('filings', { ...meta(old, 'Filing review recorded', input.reason), runId: r.id, runRevision: r.revision, reference: input.reference, notes: input.notes, status: input.reference ? 'External reference recorded' : 'Prepared' });
        });
    },
    exportSlip(raw: unknown) {
        principal('payroll.read');
        const input = z.object({ runId: id, employeeId: id }).strict().parse(raw), r = row('runs', input.runId) as PayRun, s = r.slips.find(s => s.employee.id === input.employeeId);
        if (!s)
            throw new Error('Payslip was not found.');
        return { name: 'Payslip-' + r.id + '-' + s.employee.code.replace(/[^A-Za-z0-9_-]/g, '_') + '.txt', text: [r.settings.employerName, 'Employer ABN: ' + (r.settings.employerIdentifier || 'Not recorded'), 'PAYSLIP · ' + r.status, r.name, `${r.start} to ${r.end} · Pay date ${r.payDate} · ${r.settings.currency}`, s.employee.code + ' · ' + s.employee.name, 'Super fund: ' + (s.employee.superFund || 'Not recorded') + ' · Member: ' + (s.employee.superMemberId || 'Not recorded'), ...s.lines.map(l => `${l.item.name}: ${l.quantity} × ${l.rate} = ${l.amount.toFixed(2)}`), `Gross ${s.totals.gross.toFixed(2)} · Withholding ${s.totals.withholding.toFixed(2)} · Deductions ${s.totals.deductions.toFixed(2)} · Net ${s.totals.net.toFixed(2)} · Employer contributions ${s.totals.employerCost.toFixed(2)}`, 'Withholding review: ' + r.reviewReference, 'Accrued payroll; payment completion is recorded separately.'].join('\n') };
    },
    exportRun(runId: string) { principal('payroll.read'); const r = row('runs', id.parse(runId)) as PayRun; const rows = [['Employer', 'ABN', 'Frequency', 'TFN', 'Super fund', 'Super member', 'Run', 'Status', 'Period start', 'Period end', 'Pay date', 'Currency', 'Employee code', 'Name', 'Gross', 'Taxable gross', 'Withholding', 'Other deductions', 'Net', 'Employer contributions', 'Review reference'], ...r.slips.map(s => [r.settings.employerName, r.settings.employerIdentifier, r.settings.frequency, s.employee.taxIdentifier, s.employee.superFund, s.employee.superMemberId, r.name, r.status, r.start, r.end, r.payDate, r.settings.currency, s.employee.code, s.employee.name, String(s.totals.gross), String(s.totals.taxable), String(s.totals.withholding), String(round(s.totals.deductions - s.totals.withholding)), String(s.totals.net), String(s.totals.employerCost), r.reviewReference])]; return { name: 'Payroll-review-' + r.id + '.csv', csv: encodeCsv(rows) }; }
};
registerRepository('payroll', { repository: payrollRepository, read: 'payroll.read', commands: { balances: 'payroll.read', obligations: 'payroll.read', setupDefaults: 'payroll.manage', saveEmployee: 'payroll.manage', saveItem: 'payroll.manage', saveSettings: 'payroll.manage', saveTime: 'payroll.manage', changeTime: 'payroll.manage', saveLeave: 'payroll.manage', changeLeave: 'payroll.manage', saveRun: 'payroll.manage', changeRun: 'payroll.manage', recordPayment: 'payroll.post', reversePayment: 'payroll.post', recordFiling: 'payroll.manage', exportRun: 'payroll.read', exportSlip: 'payroll.read' }, snapshot: () => state, restore: v => { state = v; }, publish: () => { }, validate: (value, snapshots) => {
        const s = stateSchema.parse(value), all = snapshots as Record<string, any>, accounts = all.accounts.accounts, journals = all.journals.journalEntries, banks = all.bankAccounts.bankAccounts;
        const exists = (entity: Entity, recordId: string) => {
            const r = (s[entity] as any[]).find(r => r.id === recordId);
            if (!r)
                throw new Error('Invalid payroll reference.');
            return r;
        };
        const acct = (accountId: string, type: string) => {
            const a = accounts.find((a: any) => a.id === accountId);
            if (!a || a.type !== type || (a.systemRole && !(type === 'EXPENSE' && a.systemRole === 'OPERATING_EXPENSE')))
                throw new Error('Invalid payroll account mapping.');
        };
        for (const rows of [s.employees, s.items])
            if (new Set(rows.map(r => r.code.toLowerCase())).size !== rows.length)
                throw new Error('Duplicate payroll code.');
        const seenIds = new Set<string>();
        for (const entity of ['employees', 'items', 'timesheets', 'leave', 'runs', 'payments', 'filings', 'settings'] as Entity[])
            for (const r of s[entity] as any[]) {
                if (seenIds.has(r.id))
                    throw new Error('Duplicate payroll record ID.');
                seenIds.add(r.id);
                if (r.history.length !== r.revision || r.history.some((h: any, i: number) => h.revision !== i + 1))
                    throw new Error('Invalid payroll revision history.');
            }
        for (const i of s.items) {
            acct(i.accountId, ['Earnings', 'Allowance', 'Employer contribution'].includes(i.category) ? 'EXPENSE' : 'LIABILITY');
            if (i.category === 'Employer contribution')
                acct(i.liabilityAccountId, 'LIABILITY');
            if (i.method === 'Percentage' && (['Earnings', 'Allowance', 'Tax'].includes(i.category) || i.rate > 100) || i.category === 'Tax' && i.method !== 'Fixed')
                throw new Error('Invalid payroll item method.');
        }
        for (const config of s.settings) {
            if (config.currency !== 'AUD' || exists('items', config.superItemId).category !== 'Employer contribution')
                throw new Error('Invalid AU payroll settings.');
            acct(config.netAccountId, 'LIABILITY');
            if (exists('items', config.taxItemId).category !== 'Tax' || config.netAccountId === exists('items', config.taxItemId).accountId)
                throw new Error('Invalid payroll settings.');
        }
        for (const e of s.employees) {
            exists('items', e.earningItemId);
            if (e.endDate && e.endDate < e.startDate)
                throw new Error('Invalid employment dates.');
        }
        for (const t of s.timesheets) {
            exists('employees', t.employeeId);
            exists('items', t.itemId);
        }
        for (const l of s.leave) {
            exists('employees', l.employeeId);
            if (l.start > l.end)
                throw new Error('Invalid leave dates.');
        }
        const agg = (lines: any[]) => {
            const map = new Map<string, [
                number,
                number
            ]>();
            for (const l of lines) {
                const p = map.get(l.accountId) ?? [0, 0];
                map.set(l.accountId, [round(p[0] + l.debit), round(p[1] + l.credit)]);
            }
            return [...map].filter(([, v]) => v[0] || v[1]).sort(([a], [b]) => a.localeCompare(b));
        };
        function journalCheck(journalId: string | undefined, sourceType: string, sourceId: string, date: string, lines: any[], reversed: boolean, reversalId?: string, reversalDate?: string) {
            const j = journals.find((j: any) => j.id === journalId);
            if (!j || j.sourceType !== sourceType || j.sourceId !== sourceId || j.journalDate !== date || hash(agg(j.lines)) !== hash(agg(lines)) || j.status !== (reversed ? 'REVERSED' : 'POSTED'))
                throw new Error('Payroll source journal mismatch.');
            if (reversed) {
                const rev = journals.find((r: any) => r.id === reversalId);
                if (!rev || rev.reversedJournalEntryId !== j.id || j.reversalJournalEntryId !== rev.id || rev.journalDate !== reversalDate || hash(agg(rev.lines)) !== hash(agg(lines.map(l => ({ ...l, debit: l.credit, credit: l.debit })))))
                    throw new Error('Payroll reversal journal mismatch.');
            }
            else if (reversalId || reversalDate)
                throw new Error('Unexpected payroll reversal metadata.');
        }
        const consumed = new Set<string>();
        for (const r of s.runs) {
            if (r.start > r.end || r.payDate < r.end || new Set(r.employeeInputs.map(e => e.employeeId)).size !== r.employeeInputs.length || r.slips.length !== r.employeeInputs.length || new Set(r.slips.map(p => p.employee.id)).size !== r.slips.length)
                throw new Error('Invalid payroll period or employees.');
            acct(r.settings.netAccountId, 'LIABILITY');
            for (const slip of r.slips) {
                const current = exists('employees', slip.employee.id), input = r.employeeInputs.find(e => e.employeeId === slip.employee.id);
                if (!input || slip.employee.revision > current.revision || input.annualAccrual !== slip.annualAccrual || input.personalAccrual !== slip.personalAccrual)
                    throw new Error('Invalid payroll employee snapshot.');
                const gross = round(slip.lines.filter(l => ['Earnings', 'Allowance'].includes(l.item.category)).reduce((n, l) => n + l.amount, 0));
                for (const l of slip.lines) {
                    exists('items', l.item.id);
                    acct(l.item.accountId, ['Earnings', 'Allowance', 'Employer contribution'].includes(l.item.category) ? 'EXPENSE' : 'LIABILITY');
                    if (l.item.category === 'Employer contribution')
                        acct(l.item.liabilityAccountId, 'LIABILITY');
                    const amount = l.item.method === 'Percentage' ? round(gross * l.rate / 100) : round(l.quantity * l.rate);
                    if (l.amount !== amount)
                        throw new Error('Payroll line calculation mismatch.');
                }
                if (slip.employee.taxScale !== 'Manual' && (!slip.employee.standardTaxConfirmed || input.withholding !== 0))
                    throw new Error('Automatic PAYG declaration mismatch.');
                const sg = slip.lines.filter(l => l.item.id === r.settings.superItemId), taxLines = slip.lines.filter(l => l.item.category === 'Tax');
                if (sg.length !== 1 || sg[0].amount !== (input.superMethod === '12% reviewed QE' ? round(input.superBase * .12) : input.superAmount) || taxLines.length !== 1 || taxLines[0].item.id !== r.settings.taxItemId || new Set(slip.timeIds).size !== slip.timeIds.length || new Set(slip.leaveIds).size !== slip.leaveIds.length)
                    throw new Error('Payroll tax, super or source snapshot mismatch.');
                const expectedWithholding = round((slip.employee.taxScale === 'Manual' ? input.withholding : australianWithholding(slip.totals.taxable, slip.employee.taxScale, r.settings.frequency, r.payDate)) + input.additionalWithholding);
                if (hash(calculateTotals(slip.lines)) !== hash(slip.totals) || slip.totals.withholding !== expectedWithholding)
                    throw new Error('Payroll payslip totals mismatch.');
                for (const [entity, ids] of [['timesheets', slip.timeIds], ['leave', slip.leaveIds]] as const)
                    for (const sourceId of ids) {
                        const source = exists(entity, sourceId);
                        if (source.employeeId !== slip.employee.id)
                            throw new Error('Payroll hours belong to another employee.');
                        if (live(r)) {
                            if (consumed.has(sourceId) || source.status !== 'Approved')
                                throw new Error('Payroll source is reused or unapproved.');
                            const from = entity === 'timesheets' ? source.date : source.start, to = entity === 'timesheets' ? source.date : source.end;
                            employment(slip.employee, from, to);
                            if (from < r.start || to > r.end)
                                throw new Error('Payroll source dates are outside the pay period.');
                            const prefix = entity === 'timesheets' ? 'Time:' : 'Leave:';
                            const payable = slip.employee.basis === 'Hourly' && (entity === 'timesheets' || source.type !== 'Unpaid');
                            const lines = slip.lines.filter(l => l.source === prefix + sourceId);
                            if (payable ? lines.length !== 1 || lines[0].quantity !== source.hours || lines[0].item.id !== (entity === 'timesheets' ? source.itemId : slip.employee.earningItemId) : lines.length !== 0)
                                throw new Error('Payroll source hours do not match the frozen payslip.');
                            consumed.add(sourceId);
                        }
                    }
            }
            if (hash(sumSlips(r.slips)) !== hash(r.totals))
                throw new Error('Payroll run totals mismatch.');
            if (['Posted', 'Reversed'].includes(r.status)) {
                if (!r.taxReviewed || r.reviewReference.trim().length < 3)
                    throw new Error('Posted payroll has no withholding review.');
                journalCheck(r.journalId, 'PAYROLL', r.id, r.payDate, postingLines(r), r.status === 'Reversed', r.reversalJournalId, r.reversalDate);
            }
            else if (r.journalId || r.reversalJournalId)
                throw new Error('Unposted payroll has journal metadata.');
        }
        for (const p of s.payments) {
            const r = exists('runs', p.runId), b = banks.find((b: any) => b.id === p.bankAccountId);
            if (!b || b.currency !== r.settings.currency || p.date < r.payDate || !['Posted', 'Reversed'].includes(r.status) || (p.status === 'Posted' && r.status !== 'Posted'))
                throw new Error('Invalid payroll payment source.');
            acct(p.accountId, 'LIABILITY');
            journalCheck(p.journalId, 'PAYROLL_PAYMENT', p.id, p.date, [{ accountId: p.accountId, debit: p.amount, credit: 0 }, { accountId: b.glAccountId, debit: 0, credit: p.amount }], p.status === 'Reversed', p.reversalJournalId, p.reversalDate);
        }
        for (const r of s.runs) {
            const due = new Map<string, number>();
            for (const l of postingLines(r).filter(l => l.credit))
                due.set(l.accountId, round((due.get(l.accountId) ?? 0) + l.credit));
            for (const [accountId, amount] of due) {
                const paid = round(s.payments.filter(p => p.runId === r.id && p.accountId === accountId && p.status === 'Posted').reduce((n, p) => n + p.amount, 0));
                if (paid > amount)
                    throw new Error('Payroll liabilities are overpaid.');
            }
            if (s.payments.some(p => p.runId === r.id && !due.has(p.accountId)))
                throw new Error('Payment uses an unrelated payroll liability.');
        }
        for (const f of s.filings) {
            const r = exists('runs', f.runId);
            if (!['Posted', 'Reversed'].includes(r.status) || f.runRevision > r.revision || r.status === 'Reversed' && f.status !== 'Correction needed' || f.status === 'External reference recorded' && !f.reference)
                throw new Error('Invalid payroll filing review.');
        }
        for (const j of journals.filter((j: any) => ['PAYROLL', 'PAYROLL_PAYMENT'].includes(j.sourceType) && !j.reversedJournalEntryId)) {
            if (!(j.sourceType === 'PAYROLL' ? s.runs : s.payments).some(r => r.id === j.sourceId && r.journalId === j.id))
                throw new Error('Orphan payroll journal.');
        }
        for (const e of s.employees) {
            let annual = e.annualOpening, personal = e.personalOpening;
            const used = new Set<string>();
            for (const r of s.runs.filter(r => r.status === 'Posted'))
                for (const slip of r.slips.filter(p => p.employee.id === e.id)) {
                    annual += slip.annualAccrual;
                    personal += slip.personalAccrual;
                    for (const sourceId of slip.leaveIds) {
                        const l = exists('leave', sourceId);
                        used.add(sourceId);
                        if (l.type === 'Annual')
                            annual -= l.hours;
                        if (l.type === 'Personal')
                            personal -= l.hours;
                    }
                }
            for (const l of s.leave.filter(l => l.employeeId === e.id && l.status === 'Approved' && !used.has(l.id))) {
                if (l.type === 'Annual')
                    annual -= l.hours;
                if (l.type === 'Personal')
                    personal -= l.hours;
            }
            if (annual < -.00001 || personal < -.00001)
                throw new Error('Payroll leave balances are negative.');
        }
        const operations = new Set<string>();
        for (const receipt of s.receipts) {
            if (operations.has(receipt.operationId))
                throw new Error('Duplicate payroll operation.');
            operations.add(receipt.operationId);
            if (receipt.input.operationId !== receipt.operationId || hash({ input: receipt.input, actorId: receipt.actorId }) !== receipt.fingerprint)
                throw new Error('Invalid payroll operation fingerprint.');
            if (exists(receipt.entity, receipt.recordId).revision < receipt.revision)
                throw new Error('Invalid payroll operation revision.');
        }
    } });
