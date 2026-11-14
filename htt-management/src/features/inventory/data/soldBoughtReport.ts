import type {Item} from './inventorySamples';
import type {InventoryTransaction} from './inventoryTransactions';
import type {InventoryMovement} from '../types/inventoryMovement';
import type {InventoryCostMovement} from '../types/inventoryCost';
import type {Product} from '../types/product';
export type PerformanceRow=Item&{bestSeller?:boolean;opening:number;boughtQty:number;boughtValue:number;soldQty:number;sales:number;adjustment:number;profit?:number;change?:number;label:string;incoming:number;soldRows:InventoryTransaction[];boughtRows:InventoryTransaction[]};
export function reportRange(period:string,today:string){
 const end=new Date(today+'T00:00:00Z'),start=new Date(end);const key=(d:Date)=>d.toISOString().slice(0,10);
 if(period==='This month')start.setUTCDate(1);
 else if(period==='Last month'){start.setUTCDate(1);start.setUTCMonth(start.getUTCMonth()-1);end.setUTCDate(0);}
 else if(period==='This financial year'){start.setUTCMonth(start.getUTCMonth()<6?6-12:6,1);}
 else start.setUTCDate(start.getUTCDate()-(period==='Last 90 days'?89:29));
 return {from:key(start),to:key(end)};
}
export function performanceLabel(sold:number,closing:number,low:number){return closing<=low?'Reorder soon':sold===0?'Not sold':closing>sold*4?'Overstocked':'';}
/** Quantities stay in each product's base unit. Profit uses posted issue costs only. */
export function buildPerformanceRows(items:Item[],products:Product[],sold:InventoryTransaction[],bought:InventoryTransaction[],movements:InventoryMovement[],costs:InventoryCostMovement[],from:string,to:string):PerformanceRow[]{
 return items.map(item=>{
  const p=products.find(p=>p.id===item.id);const baseQty=(r:InventoryTransaction)=>r.baseQuantity??r.quantity*(r.coverage??p?.units.find(u=>u.symbol===r.unit)?.conversionToBase??1);
  const soldRows=sold.filter(r=>r.productId===item.id&&r.date>=from&&r.date<=to),boughtRows=bought.filter(r=>r.productId===item.id&&r.date>=from&&r.date<=to);
  const history=movements.filter(m=>m.productId===item.id),inPeriod=history.filter(m=>m.occurredAt.slice(0,10)>=from&&m.occurredAt.slice(0,10)<=to);
  const closing=item.onHand-history.filter(m=>m.occurredAt.slice(0,10)>to).reduce((n,m)=>n+m.quantityBase,0);
  const opening=closing-inPeriod.reduce((n,m)=>n+m.quantityBase,0),soldQty=soldRows.reduce((n,r)=>n+baseQty(r),0),boughtQty=boughtRows.reduce((n,r)=>n+baseQty(r),0),sales=soldRows.reduce((n,r)=>n+r.amount,0);
  let cost=0,complete=true;
  for(const r of soldRows){const matches=costs.filter(c=>c.productId===item.id&&c.referenceId&&r.id.startsWith(c.referenceId+':')&&c.quantityBase<0);const issued=matches.reduce((n,c)=>n-c.quantityBase,0);if(!issued){complete=false;continue;}cost+=matches.reduce((n,c)=>n-c.valueChange,0)*baseQty(r)/issued;}
  return {...item,onHand:closing,opening,boughtQty,boughtValue:boughtRows.reduce((n,r)=>n+r.amount,0),soldQty,sales,adjustment:inPeriod.filter(m=>['ADJUSTMENT_IN','ADJUSTMENT_OUT'].includes(m.movementType)).reduce((n,m)=>n+m.quantityBase,0),profit:complete?sales-cost:undefined,label:performanceLabel(soldQty,closing,item.low),incoming:0,soldRows,boughtRows};
 });
}
const reference=[
 ['Engineered Oak 2200 – Natural','TM-OAK-2200-NA','Engineered','boxes',230,120,9216,95,12540,-5,250,40,5267,18,'Best seller'],
 ['Stair Nose – Oak','TR-SN-OAK','Trims','pcs',380,0,0,66,1914,6,320,20,1091,5,'Overstocked'],
 ['SPC Hybrid 1800 – Grey Oak','MR-1806-GROT','Hybrid','boxes',180,80,4234,38,3447,10,232,12,1275,-22,'Overstocked'],
 ['21mm Laminate – Nthen Grey','LM-21-NGRY','Laminate','boxes',140,0,0,38,2918,-2,100,0,1196,3,''],
 ['Acoustic Underlay – 2mm','UL-AC-2MM','Accessories','rolls',40,60,3120,30,2850,2,72,6,1282,11,''],
 ['Setto Self Levelling – 20kg','SL-SET-20','Accessories','bags',20,40,1180,22,1078,-2,36,0,431,-8,''],
 ['Moisture Barrier – 200µm','MB-200','Accessories','rolls',46,0,0,18,990,0,28,4,465,2,'Reorder soon'],
] as const;
export function samplePerformance(today:string):PerformanceRow[]{return reference.map((r,i)=>{
 const tx=(mode:'Sold'|'Bought'):InventoryTransaction[]=>{const amounts=mode==='Sold'?(i===0?[24,18,30,23]:[r[7]]):(r[5]?[r[5]/2,r[5]/2]:[]);return amounts.map((q,j)=>({id:`preview-${mode}-${i}-${j}`,date:today.slice(0,8)+['13','11','07','01'][j],documentId:'sample',documentNumber:(mode==='Sold'?'INV-':'PO-')+(mode==='Sold'?[2240,2236,2228,2207][j]:[409,388][j]),orderId:'sample-'+i+'-'+j,orderNumber:'Sample',partyId:'sample-'+j,partyName:(mode==='Sold'?['Hartley Homes','J. Nguyen','Bayside Builders','Coastal Interiors']:['Tasman Timber Co.','Hybrid Direct Pty Ltd'])[j],productId:`performance-sample-${i}`,sku:r[1],name:r[0],category:r[2],unit:r[3],quantity:q,amount:q*(mode==='Sold'?r[8]/r[7]:r[6]/r[5]),siteId:'sample',sample:true}));};
 return {id:`performance-sample-${i}`,name:r[0],sku:r[1],category:r[2],unit:r[3],opening:r[4],boughtQty:r[5],boughtValue:r[6],soldQty:r[7],sales:r[8],adjustment:r[9],onHand:r[10],reserved:r[11],profit:r[12],change:r[13],label:r[14],incoming:i===5?40:0,active:true,sold:true,bought:true,stock:true,low:0,sell:0,soldRows:tx('Sold'),boughtRows:tx('Bought')};
 });}
export function exportPerformance(rows:PerformanceRow[],canSales:boolean,canPurchases:boolean,canCost:boolean,sample:boolean){
 const data=[['Product','SKU','Unit','Opening',...(canPurchases?['Bought']:[]),...(canCost&&canPurchases?['Cost']:[]),...(canSales?['Sold','Sales']:[]),'Adjustment','Closing',...(canCost&&canSales?['Gross profit']:[])],...rows.map(r=>[r.name,r.sku,r.unit,r.opening,...(canPurchases?[r.boughtQty]:[]),...(canCost&&canPurchases?[r.boughtValue]:[]),...(canSales?[r.soldQty,r.sales]:[]),r.adjustment,r.onHand,...(canCost&&canSales?[r.profit??'']:[])])];
 downloadCsv(data,`${sample?'Sample-':''}Sold-Bought.csv`);
}
export function downloadCsv(data:(string|number)[][],name:string){const csv=data.map(r=>r.map(v=>'"'+String(v).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
