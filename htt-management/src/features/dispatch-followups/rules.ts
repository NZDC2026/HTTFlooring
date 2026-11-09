import {requireDateKey} from '../../lib/businessDate';
export function addCalendarDays(date:string,days:number){requireDateKey(date);return new Date(Date.parse(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);}
export type FollowupDocument={id:string;type:string;status:string;documentNumber:string;customerId:string;expectedDispatchDate?:string;requestedDeliveryDate?:string;sourceQuoteId?:string;sourceSalesOrderId?:string;recipient?:{accountingEmail?:string};invoiceIds?:string[];dispatchHistory?:import('../sales/types/salesDocument').DispatchDateHistory[]};
export function dispatchDate(d:FollowupDocument){return d.expectedDispatchDate||(d.type==='SALES_ORDER'?d.requestedDeliveryDate:undefined);}
export function eligible(d:FollowupDocument,all:FollowupDocument[]){
 if(/sample/i.test(d.documentNumber))return false;
 if(!dispatchDate(d)||!['QUOTE','SALES_ORDER'].includes(d.type)||['DRAFT','CONVERTED','DECLINED','EXPIRED','CANCELLED','INVOICED','FULFILLED'].includes(d.status))return false;
 if(d.type==='QUOTE'&&all.some(x=>x.type==='SALES_ORDER'&&x.sourceQuoteId===d.id))return false;
 if(d.type==='SALES_ORDER'&&(d.invoiceIds?.length||all.some(x=>x.type==='INVOICE'&&x.sourceSalesOrderId===d.id)))return false;
 return true;
}
export function nextFollowupAction(d:FollowupDocument,all:FollowupDocument[],today:string,cycle?:{date:string;acceptedAt?:string;expiresOn?:string}){
 requireDateKey(today);if(!eligible(d,all))return 'NONE';const date=dispatchDate(d)!;requireDateKey(date);
 if(cycle?.date===date&&cycle.acceptedAt)return d.type==='QUOTE'&&cycle.expiresOn&&today>=cycle.expiresOn?'EXPIRE':'WAIT';
 return today>date?'SEND':'WAIT';
}
export function followupMail(d:FollowupDocument,_expiresOn:string,link:string){return {subject:`${d.documentNumber} — please update your collection / delivery date`,text:d.type==='QUOTE'?`Your expected dispatch date for ${d.documentNumber} has passed. To continue holding this quotation and its stock reservation, please contact us or update the expected date using the secure link below. If no update is received and the quote is not converted to an order, it will expire seven calendar days after this follow-up email is accepted for sending. The expiry date is shown in the secure portal. Its stock reservation will then be released.\n\n${link}`:`The expected collection / delivery date for ${d.documentNumber} has passed. Please confirm or update your collection / delivery date using the secure link below, or contact us. Your order will not be automatically cancelled.\n\n${link}`};}
