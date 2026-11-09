import {manualInvoiceSchema,readManualInvoice} from './manualInvoice';
import {z} from 'zod';
import {procurementRoles,parseProcurementLinks} from './procurementRules';
import {readDocuments} from './procurementDocuments';
import type {PurchaseOrder} from '../purchases/types/purchaseOrder';
const line=z.object({purchaseOrderLineId:z.string(),quantity:z.number().finite().nonnegative(),unitCost:z.number().finite().nonnegative()}).strict();
export const procurementDraftSchema=z.array(z.object({id:z.string(),role:z.enum(procurementRoles),purchaseOrderId:z.string(),purchaseOrderIds:z.array(z.string()).optional(),manual:manualInvoiceSchema.optional(),expenseDraftId:z.string().optional(),supplierInvoiceNumber:z.string(),billDate:z.string(),dueDate:z.string(),status:z.enum(['DRAFT','APPROVED','POSTED']),lines:z.array(line),approvedBy:z.string().optional(),approvedAt:z.string().optional(),billId:z.string().optional()}).strict());
export type ProcurementInvoiceDraft=z.infer<typeof procurementDraftSchema>[number];
export function readInvoiceDrafts(text?:string){return text?procurementDraftSchema.parse(JSON.parse(text)):[];}
export function refreshInvoiceDrafts(row:{id:string;code:string;links:string;documents?:string},previous:ProcurementInvoiceDraft[],orders:PurchaseOrder[],today:string){
 const links=parseProcurementLinks(row.links),documents=readDocuments(row.documents);const result:ProcurementInvoiceDraft[]=[];
 for(const [i,role] of procurementRoles.entries()){
  const linked=links.filter(l=>l.role===role),meta=documents[(['materials','freight','customs'] as const)[i]];
  if(linked.some(l=>l.orderId.startsWith('bill:')))continue;
  const oldDrafts=previous.filter(d=>d.role===role),locked=oldDrafts.filter(d=>d.status!=='DRAFT');
  if(locked.length>1)throw Error('This section contains previously approved separate invoices; keep the existing batch for audit review.');
  const poLinks=linked.filter(l=>!l.orderId.startsWith('bill:'));
  if(locked.length){const old=locked[0];if(old.manual&&JSON.stringify(old.manual)!==JSON.stringify(readManualInvoice(meta.manual)))throw Error('Approved manual invoices cannot be edited.');if(meta.invoice!==undefined&&meta.invoice!==old.supplierInvoiceNumber)throw Error('Approved invoice references cannot change.');if(JSON.stringify(old.purchaseOrderIds??[old.purchaseOrderId])!==JSON.stringify(poLinks.map(l=>l.orderId)))throw Error('Approved invoice sources cannot change.');result.push(old);continue;}
  const old=oldDrafts[0],manual=meta.mode==='manual'?readManualInvoice(meta.manual):undefined;
  const lines=poLinks.flatMap(link=>{const po=orders.find(o=>o.id===link.orderId);if(!po)throw Error('Choose an existing purchase order.');return po.lines.map(l=>({purchaseOrderLineId:l.id,quantity:Math.max(0,l.orderedQuantity-l.billedQuantity),unitCost:l.unitCost}));});
  result.push({id:old?.id??row.id+':'+i,role,purchaseOrderId:poLinks.length===1?poLinks[0].orderId:'',purchaseOrderIds:poLinks.map(l=>l.orderId),...(manual?{manual}:{}),supplierInvoiceNumber:meta.invoice??'',billDate:meta.invoiceDate||today,dueDate:meta.dueDate||'',status:'DRAFT',lines});

 }
 for(const d of previous.filter(d=>d.status!=='DRAFT'))if(!result.some(r=>r.id===d.id))throw Error('Approved or posted invoice drafts cannot be unlinked.');
 return result;
}
