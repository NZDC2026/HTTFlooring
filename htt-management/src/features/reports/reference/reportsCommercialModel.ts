import {referenceReceivables,paymentBalance} from '../../banking/reference/bankingReferenceModel';
import {round,inRange} from './reportsReferenceModel';
export type OpenInvoice={id:string;number:string;partyId:string;name:string;date:string;due:string;total:number;balance:number;path?:string};
export type OpenBill=OpenInvoice&{currency:string;nativeBalance:number;reference:string};
export type AgeRow={id:string;name:string;count:number;currency?:string;buckets:number[];total:number;credit?:number};
export type ReportPO={id:string;number:string;partyId:string;name:string;country:string;currency:string;date:string;ordered:number;remaining:number;path?:string};
export type SupplierPurchases={id:string;name:string;country:string;currency:string;count:number;ordered:number;remaining:number;orders:ReportPO[]};
export type LandedShipment={id:string;number:string;name:string;containers:string;date:string;goods?:number;fees?:number;area?:number;status:string;locked:boolean;recordedUnitCost?:number;path?:string};
export const commercialDescriptions:Record<string,string>={'Aged receivables':'What customers owe, by age','Aged payables':'What we owe suppliers, by age','Outstanding invoices':'Every unpaid invoice','Outstanding bills':'Every unpaid supplier bill','Purchases by supplier':'Order value and open POs','Landed cost by shipment':'Goods, freight & customs per m²'};
export const lateDays=(due:string,to:string)=>Math.max(0,Math.round((Date.parse(to+'T00:00:00Z')-Date.parse(due+'T00:00:00Z'))/86400000));
export function ageInvoices(rows:OpenInvoice[],to:string):AgeRow[]{const ids=[...new Set(rows.map(r=>r.partyId))];return ids.map(id=>{const docs=rows.filter(r=>r.partyId===id),buckets=[0,0,0,0,0];for(const d of docs){const days=lateDays(d.due,to),index=days===0?0:days<=30?1:days<=60?2:days<=90?3:4;buckets[index]=round(buckets[index]+d.balance);}return {id,name:docs[0].name,count:docs.length,buckets,total:round(docs.reduce((n,r)=>n+r.balance,0))};}).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name));}
export function groupPurchaseOrders(orders:ReportPO[],from:string,to:string):SupplierPurchases[]{const rows=orders.filter(r=>inRange(r.date,from,to));return [...new Set(rows.map(r=>r.partyId))].map(id=>{const group=rows.filter(r=>r.partyId===id),currencies=[...new Set(group.map(r=>r.currency))];return {id,name:group[0].name,country:group[0].country,currency:currencies.join(' / '),count:group.length,ordered:round(group.reduce((n,r)=>n+r.ordered,0)),remaining:round(group.reduce((n,r)=>n+r.remaining,0)),orders:group};}).sort((a,b)=>b.ordered-a.ordered);}
export const supplierNames=['Jiangsu Lingge Wood Co., Ltd','Anhui Yangzi Flooring Co., Ltd','Guangdong Huayu Flooring Co., Ltd','Oceanic Freight Logistics','Bayside Customs Brokers','Binh Duong Timber Co., Ltd','BondPro Adhesives Australia'];
const billDefs:[string,number,string,number,number,string,string,string][]=[
 ['3377',2,'CNY',31369.93,6713.17,'10-31','PI HY-0921 · balance 70%','09-22'],
 ['3416',1,'USD',14630,22237.6,'11-11','PI YZ-2610-21 · balance 70%','11-01'],
 ['3385',5,'USD',2860,4347.2,'11-13','PI BD-2610 · deposit 20%','10-14'],
 ['3406',4,'AUD',5212.8,5212.8,'11-14','Customs & duty · MSKU 4421907','11-14'],
 ['3405',3,'AUD',3384,3384,'11-17','Freight · MSKU 4421907','11-10'],
 ['3414',4,'AUD',5198.4,5198.4,'11-17','Customs & duty · MSKU 4421912','11-15'],
 ['3402',1,'USD',9180,13953.6,'11-19','PI YZ-2611-07 · deposit 30%','11-12'],
 ['3407',3,'AUD',3410,3410,'11-19','Freight · MSKU 5530128','11-12'],
 ['3408',3,'AUD',3410,3410,'11-19','Freight · MSKU 5530131','11-12'],
 ['3409',3,'AUD',3410,3410,'11-19','Freight · TGHU 8812045','11-12'],
 ['3391',0,'USD',25970,39474.4,'11-20','INV LG-118-1 · balance 70%','10-28'],
 ['3418',0,'USD',26152,39751.04,'11-20','INV LG-118-2 · balance 70%','11-07'],
 ['3419',0,'USD',15358,23344.16,'11-20','INV LG-118-3 · balance 70%','11-08'],
 ['3410',0,'USD',11250,17100,'11-22','PI LG-2026-131 · deposit 30%','11-15'],
 ['3417',3,'AUD',1265,1265,'11-22','Port & delivery · MSKU 4421907','11-15'],
 ['3411',2,'CNY',20706,4431.08,'11-27','PI HY-1112 · deposit 30%','11-13'],
 ['3398',2,'CNY',27871.76,5964.56,'11-30','PI HY-1029 · deposit 30%','10-28'],
 ['3415',5,'USD',3140,4772.8,'12-05','PI BD-2611 · deposit 20%','11-11'],
 ['3404',6,'AUD',4127.45,4127.45,'12-31','INV BP-77231','11-02'],
 ['3412',6,'AUD',1863.3,1863.3,'12-31','INV BP-77260','11-10'],
 ['3413',6,'AUD',942.15,942.15,'12-31','INV BP-77288','11-14'],
];
export const commercialSampleBills:OpenBill[]=billDefs.map(([id,s,currency,nativeBalance,balance,due,reference,date])=>({id:'report-sample-bill-'+id,number:'BILL-'+id,partyId:'report-supplier-'+s,name:supplierNames[s],date:'2026-'+date,due:'2026-'+due,total:balance,balance,currency,nativeBalance,reference}));
export function sampleOpenInvoices(to:string):OpenInvoice[]{return referenceReceivables.filter(r=>r.date<=to&&paymentBalance(r)>0).map(r=>({id:r.id,number:r.number,partyId:'report-customer-'+r.contact,name:r.contact,date:r.date,due:r.due,total:r.total,balance:paymentBalance(r)})).sort((a,b)=>a.due.localeCompare(b.due));}
export const commercialSamplePOs:ReportPO[]=[
 {id:'rpo45',number:'PO-2026-0045',partyId:'report-supplier-1',name:supplierNames[1],country:'China',currency:'USD',date:'2026-11-10',ordered:46512,remaining:46512},
 {id:'rpo38',number:'PO-2026-0038',partyId:'report-supplier-2',name:supplierNames[2],country:'China',currency:'CNY',date:'2026-11-01',ordered:14768.57,remaining:14768.57},
 {id:'rpo39',number:'PO-2026-0039',partyId:'report-supplier-2',name:supplierNames[2],country:'China',currency:'CNY',date:'2026-11-02',ordered:19881.85,remaining:0},
 {id:'rpo42',number:'PO-2026-0042',partyId:'report-supplier-6',name:supplierNames[6],country:'Australia',currency:'AUD',date:'2026-11-03',ordered:4127.45,remaining:4127.45},
];
export const commercialSampleShipments:LandedShipment[]=[
 {id:'rship36',number:'SHP-2026-0036',name:supplierNames[1],containers:'1 × 40HQ',date:'2026-11-10',goods:46511.99,area:4087,status:'Booked',locked:false},
 {id:'rship35',number:'SHP-2026-0035',name:supplierNames[2],containers:'1 × 20GP',date:'2026-11-12',goods:14768.58,area:2112,status:'Booked',locked:false},
 {id:'rship34',number:'SHP-2026-0034',name:supplierNames[0],containers:'3 × 40HQ',date:'2026-11-02',goods:146528,fees:9300,area:3546,recordedUnitCost:43.71,status:'In transit',locked:false},
 {id:'rship33',number:'SHP-2026-0033',name:supplierNames[0],containers:'2 × 40HQ',date:'2026-10-20',goods:40857.6,fees:13691.09,area:3520,status:'Part received',locked:false},
 {id:'rship31',number:'SHP-2026-0031',name:supplierNames[2],containers:'1 × 20GP',date:'2026-09-30',goods:19881.84,fees:3400.46,area:2880,status:'Received',locked:true},
];
export function calculatedLandedUnitCost(row:LandedShipment){return row.area&&row.area>0&&row.goods!==undefined?round((row.goods+(row.fees??0))/row.area):undefined;}
export const landedUnitCost=(row:LandedShipment)=>row.recordedUnitCost??calculatedLandedUnitCost(row);
export function commercialSample(to:string){const invoices=sampleOpenInvoices(to),bills=commercialSampleBills.filter(b=>b.date<=to&&b.balance>0),ar=ageInvoices(invoices,to),ap=ageInvoices(bills,to).map(r=>({...r,currency:bills.find(b=>b.partyId===r.id)?.currency}));return {invoices,bills,ar,ap,orders:commercialSamplePOs,shipments:commercialSampleShipments.filter(s=>s.date<=to),error:''};}
