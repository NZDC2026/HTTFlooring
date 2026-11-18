import {dateLabel,round} from './reportsReferenceModel';
export type ReportStock={id:string;name:string;variant:string;sku:string;unit:string;quantity:number;area?:number;cost?:number;value?:number;low:boolean;sold12:number};
export type ReportIncoming={id:string;productId:string;name:string;variant:string;sku:string;unit:string;quantity:number;area?:number;container:string;shipmentId:string;shipmentNumber:string;eta:string;status:string;date:string;path?:string};
export const stockDescriptions:Record<string,string>={'Stock on hand':'Quantity and value at cost','Fast & slow movers':'Months of stock left','Incoming stock':'On the water and arriving'};
export const stockNumber=(n:number,digits=1)=>n.toLocaleString('en-AU',{minimumFractionDigits:0,maximumFractionDigits:digits});
export function stockSalesStart(to:string){const d=new Date(to+'T00:00:00Z'),month=d.getUTCMonth();d.setUTCFullYear(d.getUTCFullYear()-1);if(d.getUTCMonth()!==month)d.setUTCDate(0);d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);}
export function stockMovers(stock:ReportStock[],incoming:ReportIncoming[]){return stock.filter(r=>r.quantity!==0||r.sold12>0).map(r=>{const lines=incoming.filter(i=>i.productId===r.id),onWay=round(lines.reduce((n,i)=>n+i.quantity,0)),monthly=Math.max(0,r.sold12)/12,now=monthly>0?r.quantity/monthly:undefined,months=monthly>0?(r.quantity+onWay)/monthly:undefined,eta=lines.map(l=>l.eta).filter(Boolean).sort()[0],signal=months===undefined?'No sales history':months<1.5?'Reorder now':now!<1.5&&onWay>0?'Covered':months>9&&onWay>0?'Plenty on the way':'OK';return {...r,onWay,monthly,now,months,eta,signal,signalLabel:signal==='Covered'?'Covered · '+(eta?'arrives '+dateLabel(eta):'ETA not recorded'):signal};}).sort((a,b)=>(a.months??Infinity)-(b.months??Infinity)||a.name.localeCompare(b.name)||a.sku.localeCompare(b.sku));}
const stockDefs:[string,string,string,string,number,number,number|undefined,number][]=[
 ['Bonita Herringbone','Natural Oak','ENG-BH-NAT','boxes',210,68,1.52,760],
 ['Bonita Plank','Coastal White','ENG-BP-CWT','boxes',150,76,2.13,280],
 ['Bonita Herringbone','Grey Oak','ENG-BH-GRY','boxes',160,68,1.52,690],
 ['Hybrid SPC','Grey Oak','HYB-65-GRY','boxes',310,31,2.2,870],
 ['Bonita Plank','Natural Oak','ENG-BP-NAT','boxes',120,74,2.13,980],
 ['Hybrid SPC','Natural Oak','HYB-65-NAT','boxes',260,31,2.2,1120],
 ['Bonita Plank','Grey Oak','ENG-BP-GRY','boxes',90,74,2.13,610],
 ['Hybrid SPC','Chalk White','HYB-65-CHK','boxes',180,31,2.2,310],
 ['Laminate 12mm','Harbour Grey','LAM-12-HGR','boxes',200,19,1.48,540],
 ['Saigon Engineered','Rustic Oak','ENG-VN-OAK','boxes',60,58,1.866,120],
 ['Bonita Herringbone','Smoked Oak','ENG-BH-SMK','boxes',40,71.5,1.52,340],
 ['Setto Timber Adhesive','15 L','ACC-SET-15','pails',60,46,undefined,260],
 ['Laminate 12mm','Alpine Oak','LAM-12-ALP','boxes',140,19,1.48,720],
 ['Hybrid SPC','Blackbutt','HYB-65-BBT','boxes',70,31,2.2,520],
 ['Hybrid 7mm','Natural Oak','HYB-70-NAT','boxes',25,28,2.2,450],
 ['Laminate 8mm','Alpine Oak','LAM-08-ALP','boxes',35,19.5,2.4,410],
 ['Setto Self Levelling','20 kg','ACC-SSL-20','bags',32,18,undefined,520],
];
export const stockSampleRows:ReportStock[]=stockDefs.map(([name,variant,sku,unit,quantity,cost,coverage,sold12])=>({id:sku,name,variant,sku,unit,quantity,cost,area:coverage===undefined?undefined:quantity*coverage,value:round(quantity*cost),low:quantity<50,sold12}));
const firstIncoming:[string,string,string,number,number|undefined,string,string,string,string][]=[
 ['Hybrid SPC','Grey Oak','HYB-65-GRY',400,2.2,'MSKU4421907','0033','11-18','Part received'],
 ['Hybrid SPC','Blackbutt','HYB-65-BBT',400,2.2,'MSKU4421912','0033','11-18','In transit'],
 ['Hybrid SPC','Chalk White','HYB-65-CHK',400,2.2,'MSKU4421912','0033','11-18','In transit'],
 ['Bonita Herringbone','Natural Oak','ENG-BH-NAT',420,1.52,'MSKU5530128','0034','11-28','In transit'],
 ['Bonita Herringbone','Grey Oak','ENG-BH-GRY',380,1.52,'MSKU5530128','0034','11-28','In transit'],
 ['Underlay 3mm','10 m² roll','ACC-UND-3',40,undefined,'MSKU5530128','0034','11-28','In transit'],
 ['Bonita Herringbone','Smoked Oak','ENG-BH-SMK',300,1.52,'MSKU5530131','0034','11-28','In transit'],
 ['Bonita Plank','Natural Oak','ENG-BP-NAT',300,2.13,'MSKU5530131','0034','11-28','In transit'],
 ['Bonita Plank','Natural Oak','ENG-BP-NAT',150,2.13,'TGHU8812045','0034','11-28','In transit'],
 ['Bonita Plank','Grey Oak','ENG-BP-GRY',260,2.13,'TGHU8812045','0034','11-28','In transit'],
 ['Bonita Plank','Coastal White','ENG-BP-CWT',170,2.13,'TGHU8812045','0034','11-28','In transit'],
 ...['Natural Oak','Grey Oak','Blackbutt'].map((variant,i)=>['Hybrid 7mm',variant,'HYB-70-'+['NAT','GRY','BBT'][i],320,2.2,'TBA','0035','12-08','Booked'] as [string,string,string,number,number,string,string,string,string]),
];
const colors=['Alpine Oak','Harbour Grey','Sandstone','Blackbutt','Spotted Gum','Ash White','Smoked Oak','Coastal Oak'],codes=['ALP','HGR','SND','BBT','SPG','ASH','SMK','CST'];
export const stockSampleIncoming:ReportIncoming[]=[...firstIncoming,...(['Laminate 12mm','Laminate 8mm','Laminate 12mm Herringbone','Hybrid 6.5mm'] as const).flatMap((name,family)=>colors.map((variant,i)=>[name,variant,['LAM-12-','LAM-08-','LAM-HB-','HYB-65Y-'][family]+codes[i],[90,60,50,50][family]+i%3*10,[1.48,2.4,1.2,2.2][family],'TBA','0036','12-22','Booked'] as [string,string,string,number,number,string,string,string,string]))].map(([name,variant,sku,quantity,area,container,shipment,eta,status],i)=>({id:'sample-incoming-'+i,productId:sku,name,variant,sku,unit:sku==='ACC-UND-3'?'rolls':'boxes',quantity,area:area===undefined?undefined:quantity*area,container,shipmentId:'sample-shipment-'+shipment,shipmentNumber:'SHP-2026-'+shipment,eta:'2026-'+eta,status,date:shipment==='0033'?'2026-10-20':shipment==='0034'?'2026-11-02':shipment==='0035'?'2026-11-10':'2026-11-12'}));
export function sampleStockReport(to:string){const stock=to>='2026-11-01'?stockSampleRows.map(r=>({...r,sold12:stockSalesStart(to)<='2026-06-15'&&to>='2026-06-15'?r.sold12:0})):[],incoming=stockSampleIncoming.filter(r=>r.date<=to);return {stock,incoming,movers:stockMovers(stock,incoming),stockError:'',incomingError:'',notes:[] as string[]};}
