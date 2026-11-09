import {businessSettings} from '../business-workspace/configurationState';
import {readManualInvoice} from './manualInvoice';
import {validateFx} from '../currency/currency';
import type {SupplierBill} from '../purchases/types/supplierBill';
import {readDocuments} from './procurementDocuments';
import {z} from 'zod';
import type {PurchaseOrder} from '../purchases/types/purchaseOrder';
export const procurementRoles=['Materials','Freight','Customs Clearance'] as const;
export const linksSchema=z.array(z.object({role:z.enum(procurementRoles),orderId:z.string().min(1).max(200)}).strict()).max(100);
export function parseProcurementLinks(text:string){const links=linksSchema.parse(JSON.parse(text));if(new Set(links.map(l=>l.orderId)).size!==links.length)throw Error('Each purchase order can appear only once in a batch.');return links;}
export function validateProcurement(input:Record<string,string>,rows:Record<string,string>[],orders?:PurchaseOrder[],bills?:SupplierBill[]){
 if(!/^PB-\d{6,9}$/.test(input.code))throw Error('Invalid procurement batch number.');
 if(rows.some(r=>r.id!==input.id&&r.code===input.code))throw Error('Procurement batch number already exists.');
 const documents=readDocuments(input.documents);
 for(const key of ['materials','freight','customs'] as const){const meta=documents[key];if(meta.mode==='manual'){const m=readManualInvoice(meta.manual);if(!m.supplierId||!m.lines.length||m.lines.some(l=>!l.description.trim()||!l.unitSymbol.trim()||l.quantity<=0))throw Error('Complete the manual invoice supplier and lines before saving.');if(m.fx)validateFx(m.fx,businessSettings().currency);}}

 const links=parseProcurementLinks(input.links);
 for(const [i,role] of procurementRoles.entries()){const roleLinks=links.filter(l=>l.role===role),meta=documents[(['materials','freight','customs'] as const)[i]];if(roleLinks.filter(l=>l.orderId.startsWith('bill:')).length>1)throw Error('Each section can link only one Supplier Invoice.');if(meta.mode==='existing'&&!roleLinks.some(l=>l.orderId.startsWith('bill:')))throw Error('Select one existing Supplier Invoice for this section.');if(meta.mode==='manual'&&roleLinks.some(l=>l.orderId.startsWith('bill:')))throw Error('Choose either an existing invoice or manual entry for each section.');if(roleLinks.some(l=>l.orderId.startsWith('bill:'))&&roleLinks.length>1)throw Error('Each section corresponds to one invoice; do not mix an existing invoice and purchase orders.');}

 if(input.status==='Completed'&&procurementRoles.some((role,i)=>documents[(['materials','freight','customs'] as const)[i]].mode!=='manual'&&!links.some(l=>l.role===role)))throw Error('Link materials, freight and customs clearance orders before completing the batch.');
 if(bills)for(const l of links.filter(l=>l.orderId.startsWith('bill:'))){const bill=bills.find(b=>b.id===l.orderId.slice(5));if(!bill||/sample/i.test(bill.billNumber))throw Error('Choose an existing non-Sample supplier invoice.');if(links.some(other=>other.orderId===bill.purchaseOrderId))throw Error('This invoice and its purchase order cannot both be linked: amounts would be counted twice.');}
 if(orders)for(const l of links.filter(l=>!l.orderId.startsWith('bill:'))){const order=orders.find(o=>o.id===l.orderId);if(!order||/sample/i.test(order.purchaseOrderNumber))throw Error('Choose an existing non-Sample purchase order.');}
}
