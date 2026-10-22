import { purgedNumbers } from '../document-recycle/recycleState';
import type { AccountSystemRole } from '../accounting/types/account';
export type ConfigRow = {
    id: string;
    name: string;
    status: string;
    revision: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: string;
};
export const configurationRows: Record<string, ConfigRow[]> = {};
export const linkedAccountId = (role: AccountSystemRole) => configurationRows['linked-accounts']?.find(r => r.status === 'Active' && r.role === role)?.accountId;
export function activeTaxRate(code?: string) {
    code ??= businessSettings().gstCode;
    const row = configurationRows['tax-codes']?.find(r => r.status === 'Active' && r.code === code);
    if (!row) {
        if (!configurationRows['tax-codes'] && code === 'GST')
            return 0.1;
        throw new Error(`Active tax code ${code} was not found.`);
    }
    return Number(row.rate) / 100;
}
export function promotionalPrice(input: {
    customerId: string;
    productId: string;
    unitId: string;
    at: string;
    customerPrice: number;
    basePrice: number;
    hasCustomerPrice?: boolean;
}) {
    const at = Date.parse(input.at.length === 10 ? input.at + 'T00:00:00Z' : input.at);
    const candidates = (configurationRows.promotions ?? []).filter(r => r.status === 'Active' && r.productId === input.productId && r.unitId === input.unitId && (!r.customerId || r.customerId === input.customerId) && Date.parse(r.starts) <= at && at < Date.parse(r.ends));
    if (!candidates.length)
        return { price: input.customerPrice, promotionId: undefined };
    const row = candidates.sort((a, b) => Number(b.priority) - Number(a.priority) || a.id.localeCompare(b.id))[0];
    const price = row.policy === 'Customer price first' && input.hasCustomerPrice ? input.customerPrice : row.policy === 'Lowest eligible price' ? Math.min(input.customerPrice, Number(row.price)) : Number(row.price);
    return { price, promotionId: price === Number(row.price) ? row.id : undefined };
}
export function isLinkedAccount(id: string) { return (configurationRows['linked-accounts'] ?? []).some(r => r.status === 'Active' && r.accountId === id)||(configurationRows['tax-codes']??[]).some(r=>r.status==='Active'&&(r.collected===id||r.paid===id)); }

export function businessSettings() {
 const row = configurationRows.settings?.find(r => r.section === 'business' && r.status === 'Active');
 return {companyName:'ABC Flooring Melbourne',currency:'AUD',timezone:'Pacific/Auckland',yearEnd:'06-30',gstCode:'GST',basis:'Exclusive',terms:'30',quotePrefix:'QU',orderPrefix:'SO',invoicePrefix:'INV',creditPrefix:'CN',purchasePrefix:'PO',billPrefix:'BILL',supplierCreditPrefix:'SC',nextQuote:'1',nextOrder:'1',nextInvoice:'1',nextCredit:'1',nextPurchase:'1',nextBill:'1',nextSupplierCredit:'1',...row};
}
export function configuredNumber(kind: string, existing: string[], year: string) {
 existing = [...existing, ...purgedNumbers()];
 const fields: Record<string,[string,string]> = {QU:['quotePrefix','nextQuote'],SO:['orderPrefix','nextOrder'],INV:['invoicePrefix','nextInvoice'],CN:['creditPrefix','nextCredit'],PO:['purchasePrefix','nextPurchase'],BILL:['billPrefix','nextBill'],SC:['supplierCreditPrefix','nextSupplierCredit']};
 const pair=fields[kind]; if(!pair) { const n=Math.max(0,...existing.map(s=>Number(s.match(/-(\d+)$/)?.[1]??0)))+1;return `${kind}-${year}-${String(n).padStart(4,'0')}`; }
 const settings=businessSettings() as Record<string,string>,prefix=`${settings[pair[0]]}-${year}-`;
 const n=Math.max(Number(settings[pair[1]]),1,...existing.filter(v=>v.startsWith(prefix)).map(v=>Number(v.slice(prefix.length))+1).filter(Number.isFinite));
 if(!Number.isSafeInteger(n)||n>999999999)throw new Error('Document number sequence exhausted.');
 return `${prefix}${String(n).padStart(4,'0')}`;
}
export function taxSnapshot(code: string) {
 const row=configurationRows['tax-codes']?.find(r=>r.code===code&&r.status==='Active');
 return {taxCode:code,taxRate:activeTaxRate(code),taxCollectedAccountId:row?.collected,taxPaidAccountId:row?.paid,taxReport:row?.report??code};
}
export function exclusivePrice(value:number, rate:number, basis:string=businessSettings().basis) { return basis==='Inclusive'?Math.round(value/(1+rate)*100000000)/100000000:value; }
