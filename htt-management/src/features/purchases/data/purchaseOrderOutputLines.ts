import { actualCoverage } from './purchaseCoverage';
import type { PurchaseOrder,PurchaseOrderLine } from '../types/purchaseOrder';
/** Display-only output lines for PO-level charges; never creates inventory lines. */
export function purchaseOrderOutputLines(order:PurchaseOrder):PurchaseOrderLine[]{
 const lines=(order.originalLines??order.lines).map(l=>l.priceUnit==='M2'&&l.coveragePerUnit?{...l,description:`${l.description} (${l.orderedQuantity} ${l.unitSymbol} × ${l.coveragePerUnit} m²)`,orderedQuantity:actualCoverage(l.orderedQuantity,l.coveragePerUnit),unitCost:l.unitCost/l.coveragePerUnit,unitSymbol:'m²'}:l),c=order.originalLines?order.originalCharges:order.charges;if(!c)return lines;
 const freightTax=Math.round(c.freight*c.taxRate*100)/100;
 return [...lines,...([['freight','Freight',c.freight,freightTax],['insurance','Insurance',c.insurance,Math.round((c.taxAmount-freightTax)*100)/100]] as const).filter(([, ,amount])=>amount>0).map(([id,description,amount,tax])=>({id:'po-charge-'+id,productId:'',unitId:'',sku:'',description,unitSymbol:'charge',orderedQuantity:1,receivedQuantity:0,billedQuantity:0,unitCost:amount,lineSubtotal:amount,taxAmount:tax,lineTotal:Math.round((amount+tax)*100)/100,taxCode:c.taxCode,taxRate:c.taxRate}))];
}
