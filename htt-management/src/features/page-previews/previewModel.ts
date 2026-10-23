// Historical prototype state and arithmetic, retained for fixture regression only. Production imports shared CSV from src/lib/csv.ts.
import { useSyncExternalStore } from 'react';
import { previewModules, type PreviewField, type PreviewRow } from './legacyCatalog';
export type Draft = Record<string, string>;
export function defaultDraft(fields: PreviewField[], row?: Draft): Draft {
 return Object.fromEntries(fields.map(f => [f.key, row?.[f.key] ?? f.value ?? f.options?.[0] ?? '']));
}
export function validateFields(fields: PreviewField[], draft: Draft): string[] {
 const errors: string[] = [];
 for (const f of fields) {
  const v = (draft[f.key] ?? '').trim();
  if (f.required && !v) errors.push(`${f.label} is required.`);
  if (v && f.type === 'number' && (!Number.isFinite(Number(v)) || (f.min !== undefined && Number(v) < f.min) || (f.max !== undefined && Number(v) > f.max))) errors.push(`${f.label} is outside its permitted range.`);
  if (v && f.type === 'select' && !f.options?.includes(v)) errors.push(`${f.label} is not a valid option.`);
  if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors.push(`${f.label} must be a valid email.`);
 }
 if (draft.starts && draft.ends && draft.ends < draft.starts) errors.push('End must be on or after start.');
 if (draft.checkin && draft.checkout && draft.checkout < draft.checkin) errors.push('Check-out must follow check-in.');
 if (draft.coverage !== undefined && draft.unit === 'Pack' && Number(draft.coverage) <= 0) errors.push('A pack must cover more than zero m².');
 if (draft.reorder && draft.target && Number(draft.target) < Number(draft.reorder)) errors.push('Target stock must be at least the reorder point.');
 if (draft.rate && fields.some(f => f.key === 'basis') && Number(draft.rate) > 100) errors.push('Tax rate must be at most 100%.');
 return errors;
}
export type PreviewState = { records: Record<string, PreviewRow[]>; settings: Record<string, Draft>; history: Record<string, string[]> };
const initial = (): PreviewState => ({ records: Object.fromEntries(previewModules.map(m => [m.id, [{ ...defaultDraft(m.fields), ...m.example, id: 'sample-1', name: m.example.name, status: 'Draft' }]])), settings: {}, history: {} });
let state = initial();
const listeners = new Set<() => void>();
export function usePagePreview() { return useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => state, () => state); }
export function changePreview(update: (next: PreviewState) => void) { const next = structuredClone(state); update(next); state = next; listeners.forEach(fn => fn()); }
export function resetPagePreview() { state = initial(); listeners.forEach(fn => fn()); }
export function getPagePreview() { return state; }
export function savePreviewRecord(moduleId: string, draft: Draft, id?: string) {
 const module = previewModules.find(m => m.id === moduleId);
 if (!module) throw new Error('Unknown preview module.');
 const errors = validateFields(module.fields, draft);
 if (!draft.name?.trim()) errors.unshift('Name is required.');
 if (errors.length) return { errors };
 const recordId = id ?? `preview-${crypto.randomUUID()}`;
 changePreview(s => {
  const existing = s.records[moduleId].find(r => r.id === recordId);
  const row = { ...draft, id: recordId, name: draft.name.trim(), status: existing?.status ?? 'Draft' };
  s.records[moduleId] = existing ? s.records[moduleId].map(r => r.id === recordId ? row : r) : [...s.records[moduleId], row];
  s.history[`${moduleId}/${recordId}`] = [...(s.history[`${moduleId}/${recordId}`] ?? []), `${new Date().toISOString()} · Preview ${existing ? 'updated' : 'created'}`];
 });
 return { id: recordId, errors: [] as string[] };
}
export const cents = (value: string | number) => Math.round(Number(value) * 100);
export const currency = (value: number) => new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value);
export type DocumentLine = { description: string; quantity: string; price: string; tax: string; unit: string; coverage: string };
export function documentTotals(lines: DocumentLine[], inclusive = false) {
 let net = 0, tax = 0;
 for (const l of lines) { const gross = Math.round(Number(l.quantity) * cents(l.price)); const rate = Number(l.tax) / 100; const n = inclusive ? Math.round(gross / (1 + rate)) : gross; net += n; tax += inclusive ? gross - n : Math.round(n * rate); }
 return { net: net / 100, tax: tax / 100, total: (net + tax) / 100 };
}
export function allocationErrors(amount: string, allocated: string[], balances: number[]): string[] {
 const paid = cents(amount), values = allocated.map(cents);
 if (!Number.isFinite(paid) || paid <= 0 || values.some((v, i) => !Number.isFinite(v) || v < 0 || v > cents(balances[i]))) return ['Enter a positive receipt and allocations within each outstanding balance.'];
 if (values.reduce((a, b) => a + b, 0) > paid) return ['Allocations exceed the available receipt.'];
 return [];
}
export {csvText,parseCsv,downloadFile as downloadSample} from '../../lib/csv';
export function validateImport(rows: string[][], mapping: { name: number; email: number }) {
 const seen = new Set<string>();
 return rows.slice(1).map((row, i) => {
  const name = row[mapping.name]?.trim() ?? '', email = row[mapping.email]?.trim() ?? '', key = email.toLowerCase();
  const error = !name ? 'Name required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Invalid email' : seen.has(key) ? 'Duplicate email in file' : '';
  if (key) seen.add(key);
  return { line: i + 2, name, email, error };
 });
}
