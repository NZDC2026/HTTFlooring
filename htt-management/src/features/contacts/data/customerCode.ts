import { businessSettings } from "../../business-workspace/configurationState";

/** Region comes from the current account's business workspace, never a form override. */
export function customerCodeRegion(settings: Record<string, string> = businessSettings()): 'VIC' | 'NSW' {
    const location = [settings.state, settings.region, settings.city, settings.companyName, settings.address].filter(Boolean).join(' ');
    return /\b(NSW|Sydney|New South Wales)\b/i.test(location) ? 'NSW' : 'VIC';
}

export function nextCustomerCode(customers: readonly { code: string }[], count = customers.length, region = customerCodeRegion()): string {
    let sequence = (Number.isSafeInteger(count) && count >= 0 ? count : customers.length) + 1;
    const existing = new Set(customers.map(customer => customer.code));
    while (existing.has(`${region}-CUST-${String(sequence).padStart(4, '0')}`)) sequence++;
    return `${region}-CUST-${String(sequence).padStart(4, '0')}`;
}
