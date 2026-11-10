import { customerCodeRegion } from './customerCode';

export function nextSupplierCode(suppliers: readonly { code: string }[], count = suppliers.length, region = customerCodeRegion()): string {
    let sequence = (Number.isSafeInteger(count) && count >= 0 ? count : suppliers.length) + 1;
    const existing = new Set(suppliers.map(supplier => supplier.code));
    while (existing.has(`${region}-SUP-${String(sequence).padStart(4, '0')}`)) sequence++;
    return `${region}-SUP-${String(sequence).padStart(4, '0')}`;
}
