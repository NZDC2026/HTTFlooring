import type {PurchaseOrder} from '../types/purchaseOrder';
import type {Supplier} from '../../contacts/types/supplier';
import type {PurchaseBillRow} from '../data/purchaseOverview';
import {fxAmount,moneyRound} from '../../currency/currency';
import {paymentTermsLabel} from '../../payment-terms/paymentTerms';
import {shipmentStatus} from '../../incoming-shipments/shipmentModel';
import {allocateContainerCosts,readLandedCostDraft,shipmentCostProducts} from '../../procurement/containerCostAllocation';

export type PurchaseWorkspaceOrder={id:string;number:string;date:string;supplierId:string;supplier:string;country:string;currency:string;terms:string;products:string;lines:number;quantity:number;received:number;status:string;eta:string;shipping:string;amount:number;native:number;billed:number;paid:number;extraBills:number};
export type PurchaseWorkspaceShipment={id:string;number:string;supplierId:string;supplier:string;po:string;poIds:string[];billOfLading:string;vessel:string;containers:{number:string;size:string}[];eta:string;etd:string;status:string;received:number;quantity:number;area:number;amount:number;native:number;currency:string;landed?:number;costed:boolean;costsComplete:boolean};
export type PurchaseWorkspaceBill={id:string;number:string;date:string;supplierId:string;supplier:string;type:string;currency:string;reference:string;po:string;dueDate:string;amount:number;native:number;balance:number;nativeBalance:number;paid:number};
export type PurchaseWorkspaceData={orders:PurchaseWorkspaceOrder[];shipments:PurchaseWorkspaceShipment[];bills:PurchaseWorkspaceBill[]};
export const dayDifference=(from:string,to:string)=>Math.round((Date.parse(to)-Date.parse(from))/86400000);
export const purchaseShortDate=(date:string)=>date?new Date(date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'}):'—';
export function nativeMoney(amount:number,currency='AUD'){return (currency==='USD'?'US$':currency==='CNY'?'CN¥':currency==='AUD'?'$':currency+' ')+amount.toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});}
export function orderMatches(row:PurchaseWorkspaceOrder,scope:string){return scope==='All'||scope==='Open'&&!['Received','Cancelled'].includes(row.status)||scope==='Ordered'&&['Draft','Ordered'].includes(row.status)||scope==='On the way'&&['Booked','In transit'].includes(row.status)||scope==='To receive'&&['Part received','Arrived'].includes(row.status)||scope==='Received'&&row.status==='Received'||scope==='Cancelled'&&row.status==='Cancelled';}
export function shipmentMatches(row:PurchaseWorkspaceShipment,scope:string){return scope==='Active'&&!row.costed&&row.status!=='Cancelled'||scope==='In transit'&&['Booked','In transit'].includes(row.status)||scope==='To receive'&&['Part received','Arrived'].includes(row.status)||scope==='To cost'&&row.status==='Received'&&!row.costed||scope==='Costed'&&row.costed||scope==='All';}
export function billMatches(row:PurchaseWorkspaceBill,scope:string,today:string){return scope==='All'||scope==='Open'&&row.balance>.005||scope==='Overdue'&&row.balance>.005&&row.dueDate<today||scope==='Due in 7 days'&&row.balance>.005&&row.dueDate>=today&&dayDifference(today,row.dueDate)<=7||scope==='Part paid'&&row.balance>.005&&row.paid>.005&&row.dueDate>=today||scope==='Paid'&&row.balance<=.005;}
export function purchaseOverview(data:PurchaseWorkspaceData,today:string){
 const ordered=data.orders.filter(r=>orderMatches(r,'Ordered')),transit=data.orders.filter(r=>orderMatches(r,'On the way')),open=data.bills.filter(r=>billMatches(r,'Open',today)),overdue=open.filter(r=>billMatches(r,'Overdue',today));
 const ageing=[0,0,0,0,0].map((_,i)=>{const rows=open.filter(r=>{const days=dayDifference(r.dueDate,today);return (days<=0?0:days<=30?1:days<=60?2:days<=90?3:4)===i;});return {amount:moneyRound(rows.reduce((n,r)=>n+r.balance,0)),count:rows.length};});
 return {ordered:moneyRound(ordered.reduce((n,r)=>n+r.amount,0)),orderedCount:ordered.length,transit:moneyRound(transit.reduce((n,r)=>n+r.amount,0)),transitCount:transit.length,open:moneyRound(open.reduce((n,r)=>n+r.balance,0)),openCount:open.length,overdue:moneyRound(overdue.reduce((n,r)=>n+r.balance,0)),overdueCount:overdue.length,ageing};
}
export function buildPurchaseWorkspace(orders:PurchaseOrder[],suppliers:Supplier[],bills:PurchaseBillRow[],today:string,baseCurrency:string):PurchaseWorkspaceData{
 const physical=suppliers.flatMap(s=>s.shipments??[]),groups=new Map<string,typeof physical>();
 for(const s of physical.filter(s=>!['Draft','Cancelled'].includes(s.status))){const key=s.supplierId+':'+(s.purchaseNumber||s.id);groups.set(key,[...(groups.get(key)??[]),s]);}
 const shipments:PurchaseWorkspaceShipment[]=[...groups.values()].map(group=>{
  const first=group[0],supplier=suppliers.find(s=>s.id===first.supplierId),poIds=[...new Set(group.flatMap(s=>s.lines.map(l=>l.purchaseOrderId)))],pos=orders.filter(o=>poIds.includes(o.id)),products=shipmentCostProducts(group,orders),quantity=group.flatMap(s=>s.lines).reduce((n,l)=>n+l.quantity,0),received=group.flatMap(s=>s.lines).reduce((n,l)=>n+l.received,0),costs=readLandedCostDraft(first.landedCostDraft),allocation=costs?allocateContainerCosts(group.map(s=>({id:s.id,number:s.container,status:shipmentStatus(s,today)})),products,costs):undefined,area=products.reduce((n,p)=>n+(p.coverage??0)*p.quantity,0),amount=moneyRound(products.reduce((n,p)=>n+p.goods,0)),currencies=new Set(pos.map(o=>o.fx?.currency||baseCurrency)),currency=currencies.size===1?[...currencies][0]:baseCurrency;
  const native=moneyRound(products.reduce((n,p)=>{const po=orders.find(o=>o.id===group.flatMap(s=>s.lines).find(l=>p.id.endsWith(':'+l.purchaseOrderId+':'+l.lineId))?.purchaseOrderId);return n+(currency===baseCurrency?p.goods:fxAmount(p.goods,po?.fx));},0));
  return {id:first.id,number:first.purchaseNumber||first.number,supplierId:first.supplierId,supplier:supplier?.businessName||'Unknown supplier',po:pos.map(o=>o.purchaseOrderNumber).join(' · '),poIds,billOfLading:first.houseBill||'',vessel:'',containers:group.filter(s=>s.type==='Overseas').map(s=>({number:s.container||'TBA',size:s.containerSize||''})),eta:group.map(s=>s.eta).sort()[0],etd:first.etd,status:received>=quantity&&quantity>0?'Received':received>0?'Part received':group.some(s=>s.status==='Arrived')?'Arrived':group.every(s=>s.status==='Preparing')?'Booked':'In transit',received,quantity,area,amount,native,currency,landed:area&&allocation?allocation.total/area:undefined,costed:group.every(s=>!!s.landedCostFinal),costsComplete:!!costs};
 });
 return {shipments,orders:orders.filter(o=>o.status!=='QUOTATION').map(o=>{
  const supplier=suppliers.find(s=>s.id===o.supplierId),linked=shipments.filter(s=>s.poIds.includes(o.id)),linkedBills=bills.filter(b=>b.bill?.purchaseOrderId===o.id),quantity=o.lines.reduce((n,l)=>n+l.orderedQuantity,0),received=o.lines.reduce((n,l)=>n+l.receivedQuantity,0),status=o.status==='CANCELLED'?'Cancelled':o.status==='DRAFT'?'Draft':received>=quantity&&quantity>0?'Received':received>0?'Part received':linked.some(s=>s.status==='Arrived')?'Arrived':linked.some(s=>s.status==='In transit')?'In transit':linked.length?'Booked':'Ordered',total=o.totals.total;
  return {id:o.id,number:o.purchaseOrderNumber,date:o.orderDate,supplierId:o.supplierId,supplier:o.supplierName,country:supplier?.country||'',currency:o.fx?.currency||baseCurrency,terms:supplier?paymentTermsLabel(supplier):'',products:[...new Set(o.lines.map(l=>l.description))].join(', '),lines:o.lines.length,quantity,received,status,eta:linked.map(s=>s.eta).sort()[0]||o.expectedDeliveryDate||'',shipping:linked.length?linked.flatMap(s=>s.containers).length?`${linked.flatMap(s=>s.containers).length} containers`:'Local delivery':'No shipment yet',amount:total,native:fxAmount(total,o.fx),billed:total?Math.min(100,Math.round(linkedBills.reduce((n,b)=>n+b.total,0)/total*100)):0,paid:total?Math.min(100,Math.round(linkedBills.reduce((n,b)=>n+b.paid,0)/total*100)):0,extraBills:linkedBills.filter(b=>b.bill?.kind==='EXPENSE').length};
 }),bills:bills.filter(b=>b.bill?.status!=='VOID').map(b=>{const currency=b.bill?.fx?.currency||baseCurrency;return {id:b.id,number:b.number,date:b.date,supplierId:b.supplierId,supplier:b.supplier,type:b.bill?.kind==='EXPENSE'?'Expense / service supplier':'Product supplier',currency,reference:b.reference||b.bill?.supplierInvoiceNumber||'',po:b.po,dueDate:b.dueDate,amount:b.total,native:fxAmount(b.total,b.bill?.fx),balance:b.due,nativeBalance:fxAmount(b.due,b.bill?.fx),paid:b.paid};})};
}

const sampleSuppliers=['Jiangsu Lingge Wood Co., Ltd','Anhui Yangzi Flooring Co., Ltd','Guangdong Huayu Flooring Co., Ltd','Binh Duong Timber Co., Ltd','BondPro Adhesives Australia','Oceanic Freight Logistics','Bayside Customs Brokers'];
const rate=(currency:string)=>currency==='USD'?1.52:currency==='CNY'?.214:1;
export function samplePurchaseWorkspace():PurchaseWorkspaceData{
 const orderDefs:[number,number,string,number,string,string,string,string,number,number,number][]=[
  [50,4,'AUD',2860,'Draft','2026-11-16','Setto Timber Adhesive, Setto Primer','2026-11-21',2,100,0],
  [49,0,'USD',37500,'Ordered','2026-11-14','Bonita Plank','',2,800,30],
  [48,2,'CNY',96760,'Ordered','2026-11-12','Hybrid 7mm, Laminate 8mm','',2,1140,21],
  [47,3,'USD',15700,'Ordered','2026-11-10','Saigon Engineered','',1,270,20],
  [46,0,'USD',21940,'In transit','2026-10-10','Bonita Plank','2026-11-28',2,430,70],
  [45,1,'USD',30600,'Booked','2026-11-10','Laminate 12mm, Laminate 8mm','2026-12-02',32,2280,30],
  [44,0,'USD',37360,'In transit','2026-10-10','Bonita Herringbone, Bonita Plank','2026-11-28',2,750,70],
  [43,0,'USD',13440,'In transit','2026-09-29','Hybrid SPC','2026-11-18',2,800,0],
  [42,4,'AUD',4127.45,'In transit','2026-10-27','Setto Timber Adhesive, Primer, Setto Self Levelling','2026-11-19',3,320,100],
  [41,0,'USD',37100,'In transit','2026-10-10','Bonita Herringbone, Underlay 3mm','2026-11-28',3,840,70],
  [40,0,'USD',13440,'Part received','2026-09-29','Hybrid SPC','2026-11-18',2,800,0],
  [39,2,'CNY',92905.84,'Received','2026-10-01','Hybrid 7mm','2026-10-29',2,1200,100],
  [38,2,'CNY',69012,'Booked','2026-10-20','Hybrid 7mm','2026-12-08',3,960,0],
 ];
 const orders:PurchaseWorkspaceOrder[]=orderDefs.map(([n,s,currency,native,status,date,products,eta,lines,quantity,billed])=>({id:`pw-sample-po-${n}`,number:`PO-2026-${String(n).padStart(4,'0')}`,date,supplierId:`pw-sample-supplier-${s}`,supplier:sampleSuppliers[s],country:s===4?'Australia':s===3?'Vietnam':'China',currency,terms:s===4?'30 days EOM':s===3?'30 days':'Prepaid',products,lines,quantity,received:status==='Received'?quantity:status==='Part received'?400:0,status,eta,shipping:s===4?'Local delivery':n===44?'2 × 40HQ':n===38?'1 × 20GP':eta?'1 × 40HQ':'No shipment yet',amount:moneyRound(native*rate(currency)),native,billed,paid:status==='Received'?100:0,extraBills:[46,44,43,41].includes(n)?1:n===40?3:0}));
 const shipDefs:[number,number,number[],string,string,string[],string,string,number,number,number,number,number,boolean][]=[
  [36,1,[45],'NGB2611208','Booked',['TBA'],'2026-12-02','2026-11-10',0,2280,4087,46511.99,11.38,false],
  [35,2,[38],'SZX2611012','Booked',['TBA'],'2026-12-08','2026-11-16',0,960,2112,14768.58,6.99,false],
  [34,0,[41,44,46],'SHA2611045','In transit',['MSKU5530128','MSKU5530131','TGHU8812045'],'2026-11-28','2026-11-02',0,2020,3546,146528,43.71,false],
  [33,0,[40,43],'SHA2610233','Part received',['MSKU4421907','MSKU4421912'],'2026-11-18','2026-10-20',400,1600,2816,40857.6,15.50,true],
  [31,2,[39],'SZX2610077','Received',['CAIU7712044'],'2026-10-29','2026-09-30',1200,1200,2640,19881.84,8.08,true],
 ];
 const shipments:PurchaseWorkspaceShipment[]=shipDefs.map(([n,s,poNumbers,billOfLading,status,containers,eta,etd,received,quantity,area,amount,landed,costsComplete])=>({id:`pw-sample-shipment-${n}`,number:`SHP-2026-${String(n).padStart(4,'0')}`,supplierId:`pw-sample-supplier-${s}`,supplier:sampleSuppliers[s],po:poNumbers.map(n=>`PO-2026-${String(n).padStart(4,'0')}`).join(' · '),poIds:poNumbers.map(n=>`pw-sample-po-${n}`),billOfLading,vessel:n===34?'Cosco Pride 052S':n===33?'MSC Aurora 044S':'',containers:containers.map(number=>({number,size:[31,35].includes(n)?'20GP':'40HQ'})),eta,etd,status,received,quantity,area,amount,native:n===36?30600:n===35?69012:n===34?96400:n===33?26880:92905.84,currency:s===2?'CNY':'USD',landed,costed:false,costsComplete}));
 const billDefs:[number,number,string,number,string,string,string,number,number?][]=[
  [3417,5,'AUD',1265,'2026-11-15','2026-11-22','Port & delivery · MSKU 4421907',40],
  [3414,6,'AUD',5198.4,'2026-11-15','2026-11-17','Customs & duty · MSKU 4421912',43],
  [3410,0,'USD',11250,'2026-11-15','2026-11-22','PI LG-2026-131 · deposit 30%',49],
  [3413,4,'AUD',942.15,'2026-11-14','2026-12-31','INV BP-77288',0],
  [3406,6,'AUD',5212.8,'2026-11-14','2026-11-14','Customs & duty · MSKU 4421907',40],
  [3411,2,'CNY',20706,'2026-11-13','2026-11-27','PI HY-1112 · deposit 30%',48],
  [3409,5,'AUD',3410,'2026-11-12','2026-11-19','Freight · TGHU 8812045',46],
  [3408,5,'AUD',3410,'2026-11-12','2026-11-19','Freight · MSKU 5530131',44],
  [3407,5,'AUD',3410,'2026-11-12','2026-11-19','Freight · MSKU 5530128',41],
  [3402,1,'USD',9180,'2026-11-12','2026-11-19','PI YZ-2611-07 · deposit 30%',45],
  [3415,3,'USD',3140,'2026-11-11','2026-12-05','PI BD-2611 · deposit 20%',47],
  [3412,4,'AUD',1863.30,'2026-11-10','2026-12-31','INV BP-77260',0],
  [3405,5,'AUD',3384,'2026-11-10','2026-11-17','Freight · MSKU 4421907',40],
  [3419,0,'USD',15358,'2026-11-08','2026-11-20','INV LG-118-3 · balance 70%',46],
  [3416,1,'USD',14630,'2026-11-01','2026-11-11','PI YZ-2610-21 · balance 70%',35],
  [3385,3,'USD',2860,'2026-10-14','2026-11-13','PI BD-2610 · deposit 20%',37],
  [3377,2,'CNY',31369.93,'2026-09-22','2026-10-31','PI HY-0921 · balance 70%',34,14120],
  [3398,0,'AUD',30000,'2026-09-20','2026-11-23','Balance · Bonita Herringbone',41],
  [3397,0,'AUD',27000,'2026-09-18','2026-11-23','Balance · Bonita Plank',44],
  [3396,2,'AUD',25000,'2026-09-17','2026-12-05','Balance · Hybrid flooring',38],
  [3395,4,'AUD',7317.45,'2026-09-16','2026-12-10','Local goods · Adhesives',42],
 ];
 const bills:PurchaseWorkspaceBill[]=billDefs.map(([n,s,currency,nativeBalance,date,dueDate,reference,po,paid=0])=>({id:`pw-sample-bill-${n}`,number:`BILL-${n}`,date,supplierId:`pw-sample-supplier-${s}`,supplier:sampleSuppliers[s],type:s===5?'Freight forwarder':s===6?'Customs broker':'Product supplier',currency,reference,po:po?`PO-2026-${String(po).padStart(4,'0')}`:'',dueDate,amount:moneyRound((nativeBalance+paid)*rate(currency)),native:nativeBalance+paid,balance:moneyRound(nativeBalance*rate(currency)),nativeBalance,paid:moneyRound(paid*rate(currency))}));
 for(let i=0;i<6;i++)bills.push({id:`pw-sample-paid-${i}`,number:`BILL-${3370-i}`,date:'2026-09-10',supplierId:'pw-sample-supplier-4',supplier:sampleSuppliers[4],type:'Product supplier',currency:'AUD',reference:`INV BP-77${200-i}`,po:'',dueDate:'2026-10-10',amount:1200+i*100,native:1200+i*100,balance:0,nativeBalance:0,paid:1200+i*100});
 return {orders,shipments,bills};
}
