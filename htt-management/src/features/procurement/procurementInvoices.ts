import type {SupplierBill} from '../purchases/types/supplierBill';
import type {PurchaseOrder} from '../purchases/types/purchaseOrder';
import type {ProcurementOrder} from './ProcurementSections';
export function procurementInvoice(bill:SupplierBill,orders:PurchaseOrder[]):ProcurementOrder{
 const po=orders.find(o=>o.id===bill.purchaseOrderId);
 return {id:'bill:'+bill.id,purchaseOrderNumber:bill.supplierInvoiceNumber||bill.billNumber,billNumber:bill.billNumber,source:'invoice',sourcePoId:bill.purchaseOrderId,status:bill.status,supplierName:bill.supplierName,totals:bill.totals,fx:bill.fx,
 lines:bill.lines.map(line=>({...line,orderedQuantity:line.quantity,coveragePerUnit:po?.lines.find(l=>l.id===line.purchaseOrderLineId&&l.unitId===line.unitId)?.coveragePerUnit}))};
}
