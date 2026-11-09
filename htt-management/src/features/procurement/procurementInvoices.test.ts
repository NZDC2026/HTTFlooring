import {describe,it,expect} from 'vitest';
import {procurementInvoice} from './procurementInvoices';
import {validateProcurement} from './procurementRules';
import {procurementTotals} from './procurementTotals';
import type {SupplierBill} from '../purchases/types/supplierBill';
import type {PurchaseOrder} from '../purchases/types/purchaseOrder';
const po={id:'po-1',purchaseOrderNumber:'PO-1',lines:[{id:'line-1',unitId:'box',coveragePerUnit:2.166}]} as PurchaseOrder;
const bill={id:'bill-1',billNumber:'BILL-1',supplierInvoiceNumber:'INV-SUP-123',supplierName:'Timber Export',purchaseOrderId:'po-1',status:'OPEN',lines:[{id:'bl-1',purchaseOrderLineId:'line-1',unitId:'box',quantity:20,unitSymbol:'Box',lineTotal:1100}],totals:{subtotal:1000,taxAmount:100,total:1100}} as SupplierBill;
describe('Procurement supplier invoice links',()=>{
 it('uses invoice quantities, saved coverage and full invoice value, not unpaid balance',()=>{const source=procurementInvoice(bill,[po]);expect(source.purchaseOrderNumber).toBe('INV-SUP-123');expect(source.lines[0].orderedQuantity).toBe(20);const result=procurementTotals({links:JSON.stringify([{role:'Materials',orderId:source.id}])},[source]);expect(result.qty).toBe(43.32);expect(result.total).toBe(1100);});
 it('validates real invoice links and rejects missing invoices or double-counted parent POs',()=>{const input={code:'PB-000001',status:'Open',links:JSON.stringify([{role:'Materials',orderId:'bill:bill-1'}])};expect(()=>validateProcurement(input,[],[po],[bill])).not.toThrow();expect(()=>validateProcurement(input,[],[po],[])).toThrow(/existing/);expect(()=>validateProcurement({...input,links:JSON.stringify([{role:'Materials',orderId:'bill:bill-1'},{role:'Freight',orderId:'po-1'}])},[],[po],[bill])).toThrow(/twice/);});
});
