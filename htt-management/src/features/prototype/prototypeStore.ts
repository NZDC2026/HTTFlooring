import { useSyncExternalStore } from 'react';
export type Employee = { id: string; name: string; role: string; type: string; gross: number; status: string; email: string; startDate: string; bankAccount?: string; taxIdentifier?: string; retirementRate?: string; leaveHours?: string; payCycle?: string };
export type DemoDocument = { id: string; name: string; category: string; owner: string; date: string; status: string; description: string; fileName?: string; size?: number };
export type PayRun = { id: string; start: string; end: string; payDate: string; status: string; employeeIds: string[] };
export type Leave = { id: string; employeeId: string; type: string; start: string; end: string; status: string; note: string };
export type Timesheet = { id: string; employeeId: string; week: string; hours: number; status: string; job?: string; payItem?: string };
const seed = {
 employees: [
  { id: 'EMP-001', name: 'Olivia Chen', role: 'Operations Manager', type: 'Salary', gross: 3461.54, status: 'Active', email: 'olivia@example.test', startDate: '2024-03-04' },
  { id: 'EMP-002', name: 'James Wilson', role: 'Sales Consultant', type: 'Salary', gross: 2884.62, status: 'Active', email: 'james@example.test', startDate: '2024-06-10' },
  { id: 'EMP-003', name: 'Mia Thompson', role: 'Warehouse Coordinator', type: 'Hourly', gross: 1960, status: 'Active', email: 'mia@example.test', startDate: '2025-01-13' },
  { id: 'EMP-004', name: 'Noah Patel', role: 'Flooring Installer', type: 'Hourly', gross: 2240, status: 'Active', email: 'noah@example.test', startDate: '2025-04-07' },
  { id: 'EMP-005', name: 'Sophie Martin', role: 'Accounts Officer', type: 'Salary', gross: 2500, status: 'Active', email: 'sophie@example.test', startDate: '2025-08-18' },
 ] as Employee[],
 documents: [
  { id: 'DOC-1001', name: 'Supplier onboarding checklist.pdf', category: 'Supplier', owner: 'Procurement', date: '2026-10-10', status: 'Approved', description: 'Sample checklist: supplier identity, trading terms, payment review and approval.' },
  { id: 'DOC-1002', name: 'Flooring installation guide.pdf', category: 'Operations', owner: 'Operations', date: '2026-10-08', status: 'Published', description: 'Sample contents: site preparation, materials inspection, installation and quality review.' },
  { id: 'DOC-1003', name: 'October stock count.xlsx', category: 'Inventory', owner: 'Warehouse', date: '2026-10-07', status: 'Draft', description: 'Sample worksheet: site, product, expected quantity, counted quantity and variance.' },
  { id: 'DOC-1004', name: 'Customer contract template.docx', category: 'Sales', owner: 'Sales', date: '2026-10-03', status: 'Approved', description: 'Sample contract sections: customer, project, quotation, delivery and acceptance.' },
  { id: 'DOC-1005', name: 'Workplace safety policy.pdf', category: 'HR', owner: 'People team', date: '2026-09-29', status: 'Published', description: 'Sample policy contents: responsibilities, induction, incident reporting and review.' },
 ] as DemoDocument[],
 runs: [{ id: 'PAY-2026-020', start: '2026-09-28', end: '2026-10-11', payDate: '2026-10-15', status: 'Draft', employeeIds: ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005'] }] as PayRun[],
 leave: [{ id: 'LV-001', employeeId: 'EMP-003', type: 'Annual leave', start: '2026-10-20', end: '2026-10-21', status: 'Pending', note: 'Sample leave request' }] as Leave[],
 timesheets: [{ id: 'TS-001', employeeId: 'EMP-003', week: '2026-10-05', hours: 38, status: 'Submitted' }, { id: 'TS-002', employeeId: 'EMP-004', week: '2026-10-05', hours: 36, status: 'Draft' }] as Timesheet[],
 company: { name: 'HTT Flooring (Sample)', tradingName: 'HTT Flooring', identifier: '', email: 'accounts@example.test', phone: '', address: 'Sample business address', country: 'Australia', currency: 'AUD', timezone: 'Australia/Sydney' },
 preferences: { dateFormat: 'DD/MM/YYYY', language: 'English', notifications: true, theme: 'System' },
};
export type PrototypeState = typeof seed;
let state: PrototypeState = structuredClone(seed);
const listeners = new Set<() => void>();
export function updatePrototype(change: (next: PrototypeState) => void) { const next = structuredClone(state); change(next); state = next; listeners.forEach(fn => fn()); }
export function usePrototype() { return useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => state, () => state); }
export function resetPrototype() { state = structuredClone(seed); listeners.forEach(fn => fn()); return state; }
export const demoId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
export const money = (n: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n);
