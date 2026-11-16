import {businessSettings} from '../../business-workspace/configurationState';
import type {WorkspaceCustomer} from './customerWorkspaceModel';
export const cwMoney=(v:number)=>v.toLocaleString('en-AU',{style:'currency',currency:businessSettings().currency,minimumFractionDigits:2});
export function downloadCustomerCsv(customers:WorkspaceCustomer[],sample:boolean){
 const quote=(value:unknown)=>{const text=typeof value==='string'&&/^[=+\-@\t\r]/.test(value)?"'"+value:String(value??'');return '"'+text.replaceAll('"','""')+'"';};
 const rows=[['Customer','Code','Type','Contact','Mobile','Current balance','Overdue','Credit limit'],...customers.map(c=>[c.name,c.code,c.kind,c.contact,c.mobile,c.balance,c.overdue,c.creditLimit])];
 const url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=sample?'Sample-Customers.csv':'Customers.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
