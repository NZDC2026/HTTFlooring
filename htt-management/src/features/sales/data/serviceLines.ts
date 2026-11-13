import {accountRepository} from '../../accounting/data/accountRepository';
import {isLinkedAccount,businessSettings,taxSnapshot,exclusivePrice} from '../../business-workspace/configurationState';
import {calculateSalesLine} from './salesCalculations';
import {resolvePricingInstant} from './pricingInstant';
import type {SalesLineDraft,SalesDocumentLine} from '../types/salesDocument';
export type ServiceDetails={title:string;subtitle:string;description:string;accountId:string};
export function serviceAccountOptions(){return accountRepository.getAll().filter(a=>a.active&&a.allowManualPosting&&['EXPENSE','ASSET','REVENUE'].includes(a.type)&&!isLinkedAccount(a.id)).map(a=>({id:a.id,code:a.code,name:a.name,type:a.type}));}
export function requireServiceAccount(id:string){if(!serviceAccountOptions().some(a=>a.id===id))throw Error('Select an active posting account for the service.');}
export function buildServiceLine(draft:SalesLineDraft,date:string,pricingAt?:string,checkAccount=true):SalesDocumentLine{
 const service=draft.service;if(!service||!service.title.trim()||service.title.length>200||service.subtitle.length>200||service.description.length>2000||!service.accountId)throw Error('Complete the service title and account.');
 if(checkAccount)requireServiceAccount(service.accountId);
 if(!draft.unitId.trim()||draft.unitId.length>30||!Number.isFinite(draft.quantity)||draft.quantity<=0||draft.quantity>1e9||draft.unitPrice===undefined||!Number.isFinite(draft.unitPrice)||draft.unitPrice<0)throw Error('Enter a valid service quantity, unit and price.');
 const discount=draft.discountPercent??0;if(!Number.isFinite(discount)||discount<0||discount>100)throw Error('Discount must be between 0 and 100%.');
 const tax=taxSnapshot(draft.taxCode??businessSettings().gstCode),base=exclusivePrice(draft.unitPrice,tax.taxRate,draft.priceBasis),unitPrice=base*(1-discount/100);
 return {id:crypto.randomUUID(),...resolvePricingInstant(date,pricingAt),...tax,service:{...service,title:service.title.trim()},itemType:'SERVICE',productId:'service:manual',unitId:draft.unitId,sku:service.subtitle.trim()||'SERVICE',description:service.title.trim(),unitSymbol:draft.unitId,quantity:draft.quantity,standardUnitPrice:base,unitPrice,priceSource:'MANUAL',priceBasis:draft.priceBasis??'Exclusive',explicitDiscountPercent:draft.discountPercent===undefined?undefined:discount,discountBaseUnitPrice:draft.discountPercent===undefined?undefined:base,...calculateSalesLine({quantity:draft.quantity,standardUnitPrice:base,unitPrice,taxRate:tax.taxRate})};
}
export function validateServiceSnapshot(line:SalesDocumentLine){if(!line.service)return;if(line.itemType!=='SERVICE'||line.productId!=='service:manual'||line.requestedArea!==undefined||line.areaPerPack!==undefined||line.coveredArea!==undefined)throw Error('Invalid saved service line.');requireServiceAccount(line.service.accountId);}
