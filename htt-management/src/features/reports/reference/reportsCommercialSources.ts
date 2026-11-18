import type {SalesDocument,Invoice} from '../../sales/types/salesDocument';
import type {Payment} from '../../sales/types/payment';
import type {CreditAllocation} from '../../sales/types/creditNote';
import type {SupplierBill} from '../../purchases/types/supplierBill';
import type {SupplierPayment} from '../../purchases/types/supplierPayment';
import type {SupplierCreditAllocation} from '../../purchases/types/supplierCredit';
import type {PurchaseOrder} from '../../purchases/types/purchaseOrder';
import type {GoodsReceipt} from '../../purchases/types/goodsReceipt';
import type {Supplier} from '../../contacts/types/supplier';
import {calculateInvoiceBalanceAsAt} from '../../sales/data/invoiceBalanceAsAtService';
import {calculateSupplierBillBalanceAsAt} from '../../purchases/data/supplierBillBalanceAsAtService';
import {fxAmount} from '../../currency/currency';
import {buildPurchaseWorkspace} from '../../purchases/workspace/purchaseWorkspaceModel';
import {readLandedCostDraft,shipmentCostProducts,allocateContainerCosts} from '../../procurement/containerCostAllocation';
import {businessDateKey} from '../../../lib/businessDate';
import {round} from './reportsReferenceModel';
import type {OpenInvoice,OpenBill,ReportPO,LandedShipment} from './reportsCommercialModel';
export function recordedOpenInvoices(documents:SalesDocument[],payments:Payment[],allocations:CreditAllocation[],names:{id:string;businessName:string}[],to:string):OpenInvoice[]{return documents.filter((d):d is Invoice=>d.type==='INVOICE').map(d=>({id:d.id,number:d.documentNumber,partyId:d.customerId,name:names.find(c=>c.id===d.customerId)?.businessName??d.customerId,date:d.documentDate,due:d.dueDate,total:d.totals.total,balance:calculateInvoiceBalanceAsAt(d,payments,allocations,to).amountDue,path:'/sales/invoices/'+d.id})).filter(d=>d.balance>0).sort((a,b)=>a.due.localeCompare(b.due)||a.number.localeCompare(b.number));}
export function recordedOpenBills(bills:SupplierBill[],payments:SupplierPayment[],allocations:SupplierCreditAllocation[],to:string,baseCurrency:string):OpenBill[]{return bills.map(b=>{if(b.status==='VOID'&&!b.voidedAt)throw Error(b.billNumber+': the void date is missing. Review the source bill.');const balance=calculateSupplierBillBalanceAsAt(b,payments,allocations,to).amountDue;return {id:b.id,number:b.billNumber,partyId:b.supplierId,name:b.supplierName,date:b.billDate,due:b.dueDate,total:b.totals.total,balance,currency:b.fx?.currency??baseCurrency,nativeBalance:fxAmount(balance,b.fx),reference:b.supplierInvoiceNumber,path:'/purchases/bills/'+b.id};}).filter(b=>b.balance>0).sort((a,b)=>a.due.localeCompare(b.due)||a.number.localeCompare(b.number));}
/** Unreceived value uses dated posted receipt lines, never today's receivedQuantity snapshot. */
export function recordedReportPOs(pos:PurchaseOrder[],receipts:GoodsReceipt[],suppliers:Supplier[],to:string,baseCurrency:string):ReportPO[]{return pos.filter(p=>p.orderDate<=to&&!['DRAFT','QUOTATION'].includes(p.status)&&(!p.approvedAt||businessDateKey(p.approvedAt)<=to)&&(p.status!=='CANCELLED'||!!p.cancelledAt&&businessDateKey(p.cancelledAt)>to)).map(p=>{const supplier=suppliers.find(s=>s.id===p.supplierId);const remaining=round(p.lines.reduce((n,l)=>{const received=receipts.filter(r=>r.status==='POSTED'&&r.purchaseOrderId===p.id&&r.receiptDate<=to).flatMap(r=>r.lines).filter(r=>r.purchaseOrderLineId===l.id).reduce((a,r)=>a+r.receivedQuantity,0);return n+(l.orderedQuantity>0?l.lineTotal*Math.max(0,l.orderedQuantity-received)/l.orderedQuantity:0);},0));return {id:p.id,number:p.purchaseOrderNumber,partyId:p.supplierId,name:p.supplierName,country:supplier?.country??'—',currency:p.fx?.currency??baseCurrency,date:p.orderDate,ordered:p.totals.total,remaining,path:'/purchases/'+p.id};});}
export function recordedLandedShipments(suppliers:Supplier[],pos:PurchaseOrder[],to:string,baseCurrency:string):LandedShipment[]{
 const physical=suppliers.flatMap(s=>s.shipments??[]),groups=buildPurchaseWorkspace(pos,suppliers,[],to,baseCurrency).shipments;
 return groups.map(row=>{const members=physical.filter(s=>s.supplierId===row.supplierId&&(s.purchaseNumber? s.purchaseNumber===row.number:s.id===row.id)),date=members.flatMap(s=>s.history.map(h=>businessDateKey(h.at))).sort()[0]??'',products=shipmentCostProducts(members,pos),draft=readLandedCostDraft(members[0]?.landedCostDraft),allocation=draft?allocateContainerCosts(members.map(s=>({id:s.id,number:s.number,status:s.status})),products,draft):undefined;if(members[0]?.landedCostDraft&&!draft)throw Error(row.number+': invalid saved landed cost draft.');let goods=row.amount,fees=draft?round(draft.freight+draft.customs):undefined,area=row.area;
 if(members.length&&members.every(s=>!!s.landedCostFinal)){const snapshots=members.map(s=>{const snapshot=JSON.parse(s.landedCostFinal!);const c=snapshot.container;if(!c||![c.goods,c.total,c.area].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0))throw Error(s.number+': invalid locked landed cost snapshot.');return c as {goods:number;total:number;area:number};});goods=round(snapshots.reduce((n,c)=>n+c.goods,0));fees=round(snapshots.reduce((n,c)=>n+c.total-c.goods,0));area=snapshots.reduce((n,c)=>n+c.area,0);}else if(allocation){goods=round(allocation.goods);area=allocation.area;}
 const sizes=[...new Set(row.containers.map(c=>c.size||'container'))],containers=sizes.map(size=>row.containers.filter(c=>(c.size||'container')===size).length+' × '+size).join(' · ')||'Local delivery';
 return {id:row.id,number:row.number,name:row.supplier,containers,date,goods,fees,area:area||undefined,status:row.status,locked:row.costed,path:'/purchases/incoming-shipments?detail='+encodeURIComponent('shipment:'+row.id)};
 }).filter(r=>!r.date||r.date<=to);
}
