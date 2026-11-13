import type {SupplierBill} from '../purchases/types/supplierBill';
/** Never choose an invoice by its label when more than one supplier document matches. */
export function resolveShipmentInvoice(reference:{number?:string;billId?:string;supplierId?:string;purchaseOrderIds?:string[]},bills:SupplierBill[]){
 if(reference.billId)return bills.find(b=>b.id===reference.billId&&(!reference.supplierId||b.supplierId===reference.supplierId));
 const number=reference.number?.trim();if(!number)return undefined;
 const matches=bills.filter(b=>(b.supplierInvoiceNumber===number||b.billNumber===number)&&(!reference.supplierId||b.supplierId===reference.supplierId)&&(!reference.purchaseOrderIds?.length||reference.purchaseOrderIds.includes(b.purchaseOrderId)));
 return matches.length===1?matches[0]:undefined;
}
