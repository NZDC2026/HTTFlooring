import { customerRepository } from '../../contacts/data/customerRepository';
import { salesRecipient } from '../data/salesRecipients';
import type { SalesRecipientSnapshot } from '../types/salesDocument';
export function SalesDeliveryFields({ customerId, locationId, accountingContactId, onChange }: {
    customerId: string;
    locationId?: string;
    accountingContactId?: string;
    onChange: (value: {
        locationId: string;
        accountingContactId: string;
    }) => void;
}) {
    const c = customerRepository.getById(customerId);
    let defaults: SalesRecipientSnapshot = {};
    try {
        defaults = salesRecipient(customerId, { locationId, accountingContactId });
    }
    catch { /* The form shows an invalid selection until corrected. */ }
    const location = locationId ?? defaults.locationId ?? '', contact = accountingContactId ?? defaults.accountingContactId ?? '';
    return <div className="my-4 grid gap-4 md:grid-cols-2"><label className="text-sm">Customer store<select aria-label="Customer store" className="mt-1 w-full rounded border bg-white p-2" value={location} onChange={e => { const next = salesRecipient(customerId, { locationId: e.target.value }); onChange({ locationId: e.target.value, accountingContactId: next.accountingContactId ?? '' }); }}><option value="">No store</option>{c?.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label><label className="text-sm">Accounting recipient<select aria-label="Accounting recipient" className="mt-1 w-full rounded border bg-white p-2" value={contact} onChange={e => onChange({ locationId: location, accountingContactId: e.target.value })}><option value="">No accounting recipient</option>{c?.contacts.filter(v => v.isAccounting && (!v.locationId || v.locationId === location)).map(v => <option key={v.id} value={v.id}>{v.firstName} {v.lastName} · {v.email}</option>)}</select></label><p className="text-xs text-slate-500 md:col-span-2">{defaults.deliveryAddress ?? 'No delivery address selected.'} · Recipient is saved for document preparation; no email is sent.</p></div>;
}
export function SalesDeliverySummary({ recipient }: {
    recipient?: SalesRecipientSnapshot;
}) { return <div className="my-4 rounded border p-3 text-sm"><p>Store: {recipient?.locationName ?? 'Not recorded'}</p><p>Delivery: {recipient?.deliveryAddress ?? 'Not recorded'}</p><p>Accounting recipient: {[recipient?.accountingContactName, recipient?.accountingEmail].filter(Boolean).join(' · ') || 'Not recorded'}</p></div>; }
