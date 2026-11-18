import {businessDateKey} from '../../../lib/businessDate';
import type {CustomerReturn} from '../../customer-returns/customerReturnRepository';
import type {SalesDocument} from '../../sales/types/salesDocument';
import type {ReturnInspectionDraft} from '../../customer-returns/returnInspectionModel';
import type {Product} from '../../inventory/types/product';
import type {RebateEvent} from './rebateWorkspaceModel';
export function rebateEvents(documents:SalesDocument[],returns:ReturnInspectionDraft[],products:Product[],physical:CustomerReturn[]=[]):RebateEvent[]{
 const area=(line:SalesDocument['lines'][number],quantity=line.quantity)=>{if(line.coveredArea!==undefined&&line.quantity>0)return line.coveredArea/line.quantity*quantity;const product=products.find(p=>p.id===line.productId),unit=product?.units.find(u=>u.id===line.unitId),base=product?.units.find(u=>u.id===product.baseUnitId);if(['m²','m2','sqm'].includes(line.unitSymbol.toLowerCase()))return quantity;if(base&&['m²','m2','sqm'].includes(base.symbol.toLowerCase())&&unit)return quantity*unit.conversionToBase;return 0;};
 const events:RebateEvent[]=documents.filter(d=>d.type==='INVOICE'&&!['DRAFT','VOID'].includes(d.status)&&!d.openingBalanceImportId).flatMap(d=>d.lines.filter(l=>l.productId).map(l=>({customerId:d.customerId,productId:l.productId,date:d.documentDate,number:d.documentNumber,area:area(l),kind:'Invoice' as const})));
 for(const draft of returns.filter(r=>r.kind==='return'&&r.inspectedBy&&['Ready for Confirmation','Completed'].includes(r.status))){const source=documents.find(d=>d.id===draft.invoiceId&&d.type==='INVOICE'&&d.status!=='VOID');if(!source)continue;for(const item of draft.items){const line=source.lines.find(l=>l.id===item.lineId);if(!line)continue;events.push({customerId:draft.customerId,productId:line.productId,date:businessDateKey(draft.inspectedAt??draft.updatedAt),number:draft.number,area:area(line,item.quantity),kind:'Return',...(!draft.inspectedAt?{warning:'Legacy return '+draft.number+' has no separate inspection timestamp; review its recorded update date before approval.'}:{})});}}
 const linked=new Set(returns.map(r=>r.postedReturnId).filter(Boolean));
 for(const row of physical){const invoice=documents.find(d=>d.id===row.invoiceId&&d.type==='INVOICE'&&d.status!=='VOID');if(!invoice)continue;
  for(const r of row.lines){const line=invoice.lines.find(l=>l.id===r.invoiceLineId);if(!line)continue;
   if(!linked.has(row.id))events.push({customerId:row.customerId,productId:line.productId,date:row.returnDate,number:row.number,area:area(line,r.quantity),kind:'Return',warning:'Legacy physical return '+row.number+' uses its recorded return date; review inspection evidence before approval.'});
   if(row.status==='REVERSED'&&row.reversalDate)events.push({customerId:row.customerId,productId:line.productId,date:row.reversalDate,number:row.number+' reversal',area:-area(line,r.quantity),kind:'Return'});
  }
 }
 return events;
}
