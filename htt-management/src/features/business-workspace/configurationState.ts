import {promotionMatchesCustomer} from '../promotions/promotionAudience';
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
    businessType?: string;
    productId: string;
    unitId: string;
    at: string;
    customerPrice: number;
    basePrice: number;
    hasCustomerPrice?: boolean;
    unitConversions?: Record<string,number>;
}) {
    const at = Date.parse(input.at.length === 10 ? input.at + 'T00:00:00Z' : input.at);
    const candidates=(configurationRows.promotions??[]).filter(r=>r.status==='Active'&&r.deleted!=='true'&&promotionMatchesCustomer(r.customerTypes,r.customerIds,input.customerId,input.businessType)&&r.productId===input.productId&&(!r.customerId||r.customerId===input.customerId)&&Date.parse(r.starts)<=at&&at<Date.parse(r.ends)).flatMap(row=>{const percentage=row.promotionType==='% Discount'?Number((input.basePrice*(1-Number(row.discountPercent||0)/100)).toFixed(2)):undefined;if(row.unitId===input.unitId)return [{row,price:percentage??Number(row.price)}];const source=input.unitConversions?.[row.unitId],target=input.unitConversions?.[input.unitId];return source&&target&&source>0&&target>0?[{row,price:percentage??Number(row.price)/source*target}]:[];});
    if(!candidates.length)return {price:input.customerPrice,promotionId:undefined};
    const selected=candidates.sort((a,b)=>a.price-b.price||Number(b.row.priority)-Number(a.row.priority)||a.row.id.localeCompare(b.row.id))[0];
    const price=Math.min(input.basePrice,input.customerPrice,selected.price);
    return {price,promotionId:price===selected.price?selected.row.id:undefined};
}
export function isLinkedAccount(id: string) { return (configurationRows['linked-accounts'] ?? []).some(r => r.status === 'Active' && r.accountId === id)||(configurationRows['tax-codes']??[]).some(r=>r.status==='Active'&&(r.collected===id||r.paid===id)); }

export function businessSettings() {
 const row = configurationRows.settings?.find(r => r.section === 'business' && r.status === 'Active');
 return {termsType:row?.termsType??(row?.terms==='0'?'COD':'DAYS'),companyName:'ABC Flooring Melbourne',currency:'AUD',timezone:'Pacific/Auckland',yearEnd:'06-30',gstCode:'GST',basis:'Exclusive',terms:'30',quotePrefix:'QU',orderPrefix:'SO',invoicePrefix:'INV',creditPrefix:'CN',purchasePrefix:'PO',billPrefix:'BILL',supplierCreditPrefix:'SC',nextQuote:'1',nextOrder:'1',nextInvoice:'1',nextCredit:'1',nextPurchase:'1',nextBill:'1',nextSupplierCredit:'1',...row};
}
export function configuredNumber(kind: string, existing: string[], year: string) {
 existing = [...existing, ...purgedNumbers()];
 if(['QU','SO','INV'].includes(kind)){const key=kind==='QU'?'nextQuote':kind==='SO'?'nextOrder':'nextInvoice',settings=businessSettings() as Record<string,string>,n=Math.max(Number(settings[key])||1,1,...existing.filter(v=>v.startsWith(kind+'-')).map(v=>Number(v.match(/-(\d+)$/)?.[1]??0)+1));if(!Number.isSafeInteger(n)||n>9999999)throw Error('Sales document number sequence exhausted.');return `${kind}-${String(n).padStart(7,'0')}`;}

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
