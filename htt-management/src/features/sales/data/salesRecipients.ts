import { customerRepository } from '../../contacts/data/customerRepository';
import type { SalesRecipientSnapshot } from '../types/salesDocument';
export function salesRecipient(customerId: string, selection: {
    locationId?: string;
    accountingContactId?: string;
}): SalesRecipientSnapshot {
    const customer = customerRepository.getById(customerId);
    if (!customer)
        throw new Error('Customer was not found.');
    const locationId = selection.locationId === '' ? undefined : selection.locationId ?? customer.primaryLocationId;
    const location = customer.locations.find(l => l.id === locationId);
    if (locationId && !location)
        throw new Error('Selected store does not belong to this customer.');
    const candidates = customer.contacts.filter(c => c.isAccounting && (!c.locationId || c.locationId === locationId));
    const contactId = selection.accountingContactId === '' ? undefined : selection.accountingContactId ?? candidates.find(c => c.isPrimary)?.id ?? candidates[0]?.id;
    const contact = customer.contacts.find(c => c.id === contactId);
    if (contactId && (!contact || !contact.isAccounting || contact.locationId && contact.locationId !== locationId))
        throw new Error('Select an accounting contact for this customer and store.');
    return { locationId, locationName: location?.name, deliveryAddress: location ? [location.addressLine1, location.addressLine2, location.suburb, location.state, location.postcode, location.country].filter(Boolean).join(', ') : undefined, accountingContactId: contact?.id, accountingContactName: contact ? `${contact.firstName} ${contact.lastName}` : undefined, accountingEmail: contact?.email };
}
export function validateRecipientSnapshot(value: unknown): void {
    if (value === undefined)
        return;
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error('Invalid recipient snapshot.');
    const allowed = ['locationId', 'locationName', 'deliveryAddress', 'accountingContactId', 'accountingContactName', 'accountingEmail'];
    if (Object.entries(value).some(([k, v]) => !allowed.includes(k) || v !== undefined && (typeof v !== 'string' || v.length > 2000)))
        throw new Error('Invalid recipient snapshot.');
}
