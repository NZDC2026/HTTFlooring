import {useProducts} from '../../business-workspace/productRepository';
import {useSalesDocuments} from '../../sales/data/useSalesDocuments';
import {useCreditNotes} from '../../sales/data/useCreditNotes';
import {useCustomers} from '../../contacts/data/useCustomers';
import {useSupplierBills} from '../../purchases/data/useSupplierBills';
import {useSupplierCredits} from '../../purchases/data/useSupplierCredits';
import {usePayments} from '../../sales/data/usePayments';
import {useAgedReceivables} from '../data/useAgedReceivables';
import {useAgedPayables} from '../data/useAgedPayables';
import {useInventoryValuation} from '../../inventory/data/useInventoryValuation';
import {useAccounts,useJournalEntries} from '../../accounting/data/useAccounting';
import {calculateProfitAndLoss} from '../../accounting/data/profitAndLossService';
import {salesAnalysisSources,purchaseAnalysisSources} from '../../net-analysis/analysisSources';
import {analysisEvents} from '../../net-analysis/netAnalysisService';
import {usePermission} from '../../security/usePermission';
import {businessDateKey} from '../../../lib/businessDate';
import {inRange,round,type ReportFact,type ReportProduct,type ReportQuote} from './reportsReferenceModel';
export function useReportsReference(from:string,to:string){
 const productCatalog=useProducts(),documents=useSalesDocuments(),credits=useCreditNotes(),customers=useCustomers(),bills=useSupplierBills(),supplierCredits=useSupplierCredits(),payments=usePayments(),ar=useAgedReceivables(to),ap=useAgedPayables(to),stock=useInventoryValuation(to),accounts=useAccounts(),journals=useJournalEntries();
 const salesAllowed=usePermission('sales.read'),purchaseAllowed=usePermission('purchases.read'),stockAllowed=usePermission('inventory.read'),costAllowed=usePermission('inventory.cost.read'),accountingAllowed=usePermission('accounting.read');
 let sales:ReportFact[]=[],purchases:ReportFact[]=[],products:ReportProduct[]=[],error='';
 const customer=(name:string)=>customers.find(c=>c.businessName===name),rep=(name:string)=>customer(name)?.setup?.salesRep?.trim()||'House';
 try{
  const events=salesAllowed?analysisEvents(salesAnalysisSources(documents,credits,customers)):[];
  sales=events.map(e=>({id:e.eventId,date:e.date,name:e.partyName,type:customer(e.partyName)?.businessType==='Flooring Retailer'?'Store':customer(e.partyName)?.businessType??'—',rep:rep(e.partyName),sales:e.subtotal,activity:e.event==='DOCUMENT'?'Document' as const:e.event==='CREDIT'?'Credit' as const:'Void' as const,number:e.number,path:e.path}));
  purchases=purchaseAllowed?analysisEvents(purchaseAnalysisSources(bills,supplierCredits)).map(e=>({id:e.eventId,date:e.date,name:e.partyName,type:'',rep:'',sales:e.subtotal,activity:e.event==='DOCUMENT'?'Document' as const:e.event==='CREDIT'?'Credit' as const:'Void' as const,number:e.number,path:e.path})):[];
  const map=new Map<string,ReportProduct>();
  for(const e of events.filter(e=>inRange(e.date,from,to))){const source=e.kind==='CUSTOMER_CREDIT'?credits.find(c=>c.id===e.id):documents.find(d=>d.id===e.id),sign=(e.kind==='CUSTOMER_CREDIT'?-1:1)*(e.event==='VOID'?-1:1);for(const l of source?.lines??[]){const key=l.productId||l.sku||l.description,old=map.get(key)??{name:l.description||l.sku,category:l.service?'Service':productCatalog.find(p=>p.id===l.productId)?.category??'—',units:0,sales:0},area=l.coveredArea??(l.areaPerPack===undefined?undefined:l.areaPerPack*l.quantity);old.units=round(old.units+sign*l.quantity);old.sales=round(old.sales+sign*l.lineSubtotal);if(area!==undefined)old.area=round((old.area??0)+sign*area);map.set(key,old);}}
  products=[...map.values()].sort((a,b)=>b.sales-a.sales);
 }catch(e){error=(e as Error).message;}
 const quotes:ReportQuote[]=salesAllowed?documents.filter(d=>d.type==='QUOTE'&&d.status!=='DRAFT').map(d=>({number:d.documentNumber,customer:customers.find(c=>c.id===d.customerId)?.businessName??d.customerId,date:d.documentDate,expiry:d.type==='QUOTE'?d.expiryDate??'':'',total:d.totals.total,status:d.status[0]+d.status.slice(1).toLowerCase(),path:'/sales/quotes/'+d.id})):[];
 const collected=(name:string)=>round(payments.filter(p=>customers.find(c=>c.id===p.customerId)?.businessName===name).reduce((n,p)=>{const original=inRange(p.paymentDate,from,to)?p.amount:0,reversal=p.status==='REVERSED'&&p.reversedAt&&inRange(businessDateKey(p.reversedAt),from,to)?p.amount:0;return n+original-reversal;},0));
 const productBuyers=(name:string)=>sales.filter(f=>inRange(f.date,from,to)).flatMap(f=>{const source=documents.find(d=>d.type==='INVOICE'&&'/sales/invoices/'+d.id===f.path)??credits.find(c=>'/sales/credits/'+c.id===f.path),lines=source?.lines.filter(l=>(l.description||l.sku)===name)??[],sign=f.sales<0?-1:1;return lines.length?[{name:f.name,sales:round(lines.reduce((n,l)=>n+l.lineSubtotal,0)*sign),number:f.number,path:f.path}]:[];});
 return {productBuyers,sales,purchases,products,quotes,error,ar:ar.totalOutstanding,overdue:ar.totalOverdue,ap:ap.totalOutstanding,stock:stock.totalInventoryValue,productCount:stock.productCount,collected,owedByRep:(name:string)=>round(ar.rows.filter(r=>rep(r.customerName)===name).reduce((n,r)=>n+r.totalOutstanding,0)),owed:(name:string)=>ar.rows.find(r=>r.customerName===name)?.totalOutstanding??0,profit:(start:string,end:string)=>accountingAllowed&&costAllowed?calculateProfitAndLoss(accounts,journals,start,end).grossProfit:undefined,allowed:{sales:salesAllowed,purchases:purchaseAllowed,stock:stockAllowed,cost:costAllowed,accounting:accountingAllowed}};
}
