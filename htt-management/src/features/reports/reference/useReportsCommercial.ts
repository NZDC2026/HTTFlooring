import {useSalesDocuments} from '../../sales/data/useSalesDocuments';
import {usePayments} from '../../sales/data/usePayments';
import {useCreditAllocations} from '../../sales/data/useCreditNotes';
import {useCustomers} from '../../contacts/data/useCustomers';
import {useSuppliers} from '../../contacts/data/useSuppliers';
import {useSupplierBills} from '../../purchases/data/useSupplierBills';
import {useSupplierPayments} from '../../purchases/data/useSupplierPayments';
import {useSupplierCreditAllocations} from '../../purchases/data/useSupplierCredits';
import {usePurchaseOrders} from '../../purchases/data/usePurchaseOrders';
import {useGoodsReceipts} from '../../purchases/data/useGoodsReceipts';
import {useAgedReceivables} from '../data/useAgedReceivables';
import {useAgedPayables} from '../data/useAgedPayables';
import {businessSettings} from '../../business-workspace/configurationState';
import {recordedOpenInvoices,recordedOpenBills,recordedReportPOs,recordedLandedShipments} from './reportsCommercialSources';
import type {OpenInvoice,OpenBill,AgeRow,ReportPO,LandedShipment} from './reportsCommercialModel';
export function useReportsCommercial(to:string){const docs=useSalesDocuments(),payments=usePayments(),allocations=useCreditAllocations(),customers=useCustomers(),suppliers=useSuppliers(),bills=useSupplierBills(),supplierPayments=useSupplierPayments(),supplierAllocations=useSupplierCreditAllocations(),pos=usePurchaseOrders(),receipts=useGoodsReceipts(),receivable=useAgedReceivables(to),payable=useAgedPayables(to),base=businessSettings().currency;let invoices:OpenInvoice[]=[],openBills:OpenBill[]=[],orders:ReportPO[]=[],shipments:LandedShipment[]=[],error='';try{invoices=recordedOpenInvoices(docs,payments,allocations,customers,to);openBills=recordedOpenBills(bills,supplierPayments,supplierAllocations,to,base);orders=recordedReportPOs(pos,receipts,suppliers,to,base);shipments=recordedLandedShipments(suppliers,pos,to,base);}catch(e){error=(e as Error).message;}
 const ar:AgeRow[]=receivable.rows.map(r=>({id:r.customerId,name:r.customerName,count:r.outstandingInvoiceCount,buckets:[r.aging.current,r.aging.days1To30,r.aging.days31To60,r.aging.days61To90,r.aging.days90Plus],total:r.totalOutstanding,credit:Math.round((Object.values(r.aging).reduce((n,v)=>n+v,0)-r.totalOutstanding)*100)/100}));
 const ap:AgeRow[]=payable.rows.map(r=>({id:r.supplierId,name:r.supplierName,count:r.outstandingBillCount,currency:[...new Set(openBills.filter(b=>b.partyId===r.supplierId).map(b=>b.currency))].join(' / ')||base,buckets:[r.aging.current,r.aging.days1To30,r.aging.days31To60,r.aging.days61To90,r.aging.days90Plus],total:r.totalOutstanding,credit:r.unallocatedCredit}));
 return {invoices,bills:openBills,orders,shipments,ar,ap,error};
}
