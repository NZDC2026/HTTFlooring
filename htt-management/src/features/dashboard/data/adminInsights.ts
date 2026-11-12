import type {Product} from '../../inventory/types/product';
import type {InventoryMovement} from '../../inventory/types/inventoryMovement';
import type {Account} from '../../accounting/types/account';
import type {JournalEntry} from '../../accounting/types/journalEntry';
import {calculateProfitAndLoss} from '../../accounting/data/profitAndLossService';
export type PerformanceMetric='Sales'|'GP'|'Margin'|'Expense';
export function priorYearDate(date:string){
 const [year,month,day]=date.split('-').map(Number);
 return `${year-1}-${String(month).padStart(2,'0')}-${String(Math.min(day,new Date(Date.UTC(year-1,month,0)).getUTCDate())).padStart(2,'0')}`;
}
export function inventoryInsightSummary(products:Product[],positions:{productId:string;quantityOnHand:number;inventoryValue:number}[],movements:InventoryMovement[],to:string){
 const cutoff=new Date(to+'T12:00:00Z');cutoff.setUTCDate(cutoff.getUTCDate()-60);const cutoffDate=cutoff.toISOString().slice(0,10);
 const since=priorYearDate(to),active=products.filter(p=>p.status==='ACTIVE'&&(!p.itemType||p.itemType==='STOCK')&&p.createdAt.slice(0,10)<=to);
 const rows=active.map(p=>{const balances=positions.filter(b=>b.productId===p.id),sales=movements.filter(m=>m.productId===p.id&&m.movementType==='SALE'&&m.occurredAt.slice(0,10)>since&&m.occurredAt.slice(0,10)<=to);
 const soldRecently=sales.some(m=>m.occurredAt.slice(0,10)>cutoffDate&&!movements.some(v=>v.referenceType==='SALES_FULFILMENT_VOID'&&!!v.referenceId&&v.referenceId===m.referenceId&&v.occurredAt.slice(0,10)<=to));return {quantity:balances.reduce((n,b)=>n+b.quantityOnHand,0),value:balances.reduce((n,b)=>n+b.inventoryValue,0),slow:!soldRecently&&p.createdAt.slice(0,10)<=cutoffDate,reorder:p.reorderPoint??0};});
 const slow=rows.filter(r=>r.slow&&r.quantity>0);
 return {value:rows.reduce((n,r)=>n+r.value,0),slowValue:slow.reduce((n,r)=>n+r.value,0),active:rows.length,low:rows.filter(r=>r.quantity>0&&r.quantity<=r.reorder).length,out:rows.filter(r=>r.quantity<=0).length,slow:slow.length,since,cutoff:cutoffDate};
}
const weights=[210,245,260,240,285,290,295,370,330,405,390,440];
const weightTotal=weights.reduce((n,v)=>n+v,0);
export function performanceValue(metric:PerformanceMetric,pnl:{salesRevenue:number;grossProfit:number;grossMarginPercent:number|null;operatingExpenses:number}){return metric==='Sales'?pnl.salesRevenue:metric==='GP'?pnl.grossProfit:metric==='Margin'?pnl.grossMarginPercent:pnl.operatingExpenses;}
function samplePnl(from:string,to:string){
 let sales=0;const start=new Date(from+'T12:00:00Z'),end=new Date(to+'T12:00:00Z');
 for(let d=start;d<=end;d.setUTCDate(d.getUTCDate()+1)){const year=d.getUTCFullYear(),month=d.getUTCMonth(),days=new Date(Date.UTC(year,month+1,0)).getUTCDate();sales+=3520000*Math.pow(1.128,year-2026)*weights[month]/weightTotal/days;}
 return {salesRevenue:sales,grossProfit:sales*.315,grossMarginPercent:sales>0?31.5:null,operatingExpenses:sales*.128};
}
export function performanceSeries(accounts:Account[],journals:JournalEntry[],from:string,to:string,sample:boolean){
 const calculate=(a:string,b:string)=>sample?samplePnl(a,b):calculateProfitAndLoss(accounts,journals,a,b);
 const rows=[];let month=from.slice(0,7)+'-01';
 while(month<=to){const date=new Date(month+'T12:00:00Z'),end=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).toISOString().slice(0,10),a=month<from?from:month,b=end>to?to:end;
 rows.push({key:month,label:date.toLocaleDateString('en-GB',{month:'short',...(from.slice(0,4)!==to.slice(0,4)?{year:'2-digit' as const}:{}) ,timeZone:'UTC'}),current:calculate(a,b),prior:calculate(priorYearDate(a),priorYearDate(b))});date.setUTCMonth(date.getUTCMonth()+1);month=date.toISOString().slice(0,10);}
 return {rows,current:calculate(from,to),prior:calculate(priorYearDate(from),priorYearDate(to))};
}
