import {readDocuments} from './procurementDocuments';
import {readManualInvoice,manualInvoiceTotals} from './manualInvoice';
import type {PurchaseOrder} from '../purchases/types/purchaseOrder';
import {parseProcurementLinks} from './procurementRules';
type Order=Pick<PurchaseOrder,'id'|'totals'> & {lines:Pick<PurchaseOrder['lines'][number],'orderedQuantity'|'coveragePerUnit'|'unitSymbol'>[]};
export function procurementTotals(batch:{links:string;documents?:string},orders:Order[]){
 const documents=readDocuments(batch.documents);
 const amounts:Record<string,number>={Materials:0,Freight:0,'Customs Clearance':0};let qty=0,selectedQty=0;
 for(const link of parseProcurementLinks(batch.links)){
  const key=link.role==='Materials'?'materials':link.role==='Freight'?'freight':'customs';if(documents[key].mode==='manual')continue;
  const order=orders.find(o=>o.id===link.orderId);if(!order)continue;
  amounts[link.role]+=order.totals.total;
  if(link.role==='Materials')for(const [index,line] of order.lines.entries()){
   const factor=line.coveragePerUnit??(/^(m²|m2|sqm)$/i.test(line.unitSymbol.trim())?1:0);
   if(Number.isFinite(factor)&&factor>0){qty+=line.orderedQuantity*factor;if(documents.materials['excludeQty:'+order.id+':'+index]!=='true')selectedQty+=line.orderedQuantity*factor;}
  }
 }
 for(const [key,role] of [['materials','Materials'],['freight','Freight'],['customs','Customs Clearance']] as const){if(documents[key].mode==='manual'){const t=manualInvoiceTotals(readManualInvoice(documents[key].manual));amounts[role]=t.total;if(role==='Materials'){qty=t.qty;selectedQty=t.selectedQty;}}}
 qty=Math.round(qty*1e6)/1e6;const total=Object.values(amounts).reduce((n,v)=>n+v,0);
 return {amounts,qty,selectedQty:Math.round(selectedQty*1e6)/1e6,total,landedCost:selectedQty>0?total/selectedQty:undefined};
}
