import {periodStart,periodEnd} from "./tradeDates";
import { previewRanges } from "./portalPreview";
import { products } from "./products";
import { invoices } from "./invoices";
import type { ReturnNote } from "./returnNotes";
// Local purchase aggregates for the supplied reference design, including the portal invoice examples.
const fixtures=[
 [210.48,16670.01,97,-10],[450.81,44134.32,244,7.9],[49.92,5216.64,25,-12.1],
 [147.54,7708.96,59,-11.4],[223.94,13794.70,149,-4.5],[104.50,5057.80,54,-15.9],
 [0,0,0,0],[147,1536.15,147,-5.8],[175,7315,175,-1.7],[93,1432.20,93,-5.1],
];
type Purchase={date:Date;seriesId:string;amountCents:number;quantity:number;boxes:number};
const months=[215000,202000,187000,232000,225000,195000,154000,160000,178000,206000,186000,102865.78];
const purchaseRows:Purchase[]=months.flatMap((total,index)=>{
 const date=new Date(2025,11+index,18),latest=index===11;
 const early=fixtures.map(fixture=>latest?fixture[1]:fixture[1]/(1+fixture[3]/100));
 const earlyTotal=early.reduce((sum,value)=>sum+value,0),scale=latest?1:Math.min(1,total/earlyTotal);
 let remaining=Math.round(total*100);
 return previewRanges.flatMap((range,i)=>{
  const base=fixtures[i];const amount=Math.round(early[i]*scale*100);remaining-=amount;
  const ratio=base[1]?amount/(base[1]*100):0;
  const first={date,seriesId:range.id,amountCents:amount,quantity:Math.round(base[0]*ratio*100)/100,boxes:Math.round(base[2]*ratio)};
  return [first];
 }).concat(latest?[]:previewRanges.map((range,i)=>{
  const share=i===previewRanges.length-1?remaining:Math.round(Math.round(total*100-earlyTotal*scale*100)*(fixtures[i][1]/102865.78));
  if(i!==previewRanges.length-1)remaining-=share;
  const base=fixtures[i],ratio=base[1]?share/(base[1]*100):0;
  return {date:new Date(date.getFullYear(),date.getMonth(),28),seriesId:range.id,amountCents:share,quantity:Math.round(base[0]*ratio*100)/100,boxes:Math.round(base[2]*ratio)};
 }));
});
export function netPurchaseRows(notes:ReturnNote[]){
 const adjustments=notes.filter(note=>note.status==="Confirmed"&&note.creditNote).flatMap(note=>{
  const original=invoices.find(invoice=>invoice.id===note.invoiceId);if(!original)return [];
  return note.creditNote!.items.map((item,index)=>{
   const product=products.find(product=>product.id===item.productId);if(!product)return null;
   const total=note.creditNote!.total,sub=note.creditNote!.subtotal;
   const previous=note.creditNote!.items.slice(0,index).reduce((sum,line)=>sum+Math.round((sub?line.amountCents/100/sub:0)*total*100),0);
   const cents=index===note.creditNote!.items.length-1?Math.round(total*100)-previous:Math.round((sub?item.amountCents/100/sub:0)*total*100);
   return {date:new Date(original.issueDate),seriesId:product.seriesId,amountCents:-cents,quantity:-(product.category==="Accessories"?item.quantity:item.totalSize??0),boxes:-item.quantity};
  }).filter((row):row is Purchase=>row!==null);
 });
 return [...purchaseRows,...adjustments];
}
export function salesPeriod(month:string,now:Date){
 const [year,index]=month.split("-").map(Number);const start=new Date(year,index-1,1);const isCurrent=year===now.getFullYear()&&index-1===now.getMonth();
 const end=isCurrent?new Date(year,index-1,now.getDate(),23,59,59,999):new Date(year,index,0,23,59,59,999);
 return {start,end,isCurrent};
}
export function purchaseReport(notes:ReturnNote[],month:string,now:Date,compare:"previous"|"year"="previous",period?:string){
 const current=period?{start:periodStart(period,now),end:periodEnd(period,now),isCurrent:period==="This month"}:salesPeriod(month,now);let previousStart=new Date(current.start.getFullYear()-(compare==="year"?1:0),current.start.getMonth()-(compare==="previous"?1:0),1);
 const lastDay=new Date(previousStart.getFullYear(),previousStart.getMonth()+1,0).getDate();
 let previousEnd=new Date(previousStart.getFullYear(),previousStart.getMonth(),current.isCurrent?Math.min(lastDay,current.end.getDate()):lastDay,23,59,59,999);
 if(period&&period!=="This month"&&period!=="Last month"){const duration=current.end.getTime()-new Date(current.start.getFullYear(),current.start.getMonth(),current.start.getDate()).getTime()+1;previousEnd=compare==="year"?new Date(current.end.getFullYear()-1,current.end.getMonth(),current.end.getDate(),23,59,59,999):new Date(current.start.getFullYear(),current.start.getMonth(),current.start.getDate(),0,0,0,-1);previousStart=compare==="year"?new Date(current.start.getFullYear()-1,current.start.getMonth(),current.start.getDate()):new Date(previousEnd.getTime()-duration+1);}
 const all=netPurchaseRows(notes);const aggregate=(id:string,start:Date,end:Date)=>all.filter(row=>row.seriesId===id&&row.date>=start&&row.date<=end).reduce((sum,row)=>({amountCents:sum.amountCents+row.amountCents,quantity:sum.quantity+row.quantity,boxes:sum.boxes+row.boxes}),{amountCents:0,quantity:0,boxes:0});
 const rows=previewRanges.map(range=>{
  const value=aggregate(range.id,current.start,current.end),previous=aggregate(range.id,previousStart,previousEnd);
  return {...range,amountCents:Math.max(0,value.amountCents),quantity:Math.max(0,Math.round(value.quantity*100)/100),boxes:Math.max(0,value.boxes),previousCents:Math.max(0,previous.amountCents),previousQuantity:Math.max(0,previous.quantity)};
 });
 const monthly=Array.from({length:12},(_,index)=>{
  const date=new Date(now.getFullYear(),now.getMonth()-11+index,1);const end=new Date(date.getFullYear(),date.getMonth()+1,0,23,59,59,999);
  return {date,key:`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`,series:previewRanges.map(range=>({id:range.id,...aggregate(range.id,date,end)}))};
 });
 return {rows,monthly,...current,previousStart,previousEnd,totalCents:rows.reduce((sum,row)=>sum+row.amountCents,0),previousCents:rows.reduce((sum,row)=>sum+row.previousCents,0),flooring:rows.filter(row=>row.category!=="Accessories").reduce((sum,row)=>sum+row.quantity,0),previousFlooring:rows.filter(row=>row.category!=="Accessories").reduce((sum,row)=>sum+row.previousQuantity,0)};
}
export function allocateColours(row:ReturnType<typeof purchaseReport>["rows"][number]){
 const existing=products.filter(product=>product.seriesId===row.id);const colours=Array.from({length:row.count},(_,index)=>({name:existing[index]?.colour??["Natural Oak","Smoked Oak","Warm Oak","Classic Oak","Honey Oak","Grey Oak","White Oak","Dark Oak","Latte Oak","Lime Wash"][index],code:existing[index]?.colourCode??existing[index]?.sku??`${row.name.slice(0,3).toUpperCase()}-${String(index+1).padStart(2,"0")}`,productId:existing[index]?.id,colour:row.swatches[index%row.swatches.length]}));
 const weights=colours.map((_,index)=>colours.length-index),sum=weights.reduce((a,b)=>a+b,0);let cents=row.amountCents,quantity=Math.round(row.quantity*100),boxes=row.boxes;
 return colours.map((colour,index)=>{const last=index===colours.length-1,amount=last?cents:Math.round(row.amountCents*weights[index]/sum),qty=last?quantity:Math.round(row.quantity*100*weights[index]/sum),box=last?boxes:Math.round(row.boxes*weights[index]/sum);cents-=amount;quantity-=qty;boxes-=box;return {...colour,amountCents:amount,quantity:qty/100,boxes:box};});
}
export function salesCsv(rows:ReturnType<typeof purchaseReport>["rows"]){
 const escape=(value:unknown)=>`"${String(value).replace(/"/g,'""')}"`;
 return '\uFEFF'+[["Category","Pattern","Series","Colour","Code","Quantity","Unit","Amount (incl. GST)"],...rows.flatMap(row=>allocateColours(row).map(colour=>[row.category,row.pattern,row.name,colour.name,colour.code,colour.quantity,row.category==="Accessories"?"pcs":"m²",(colour.amountCents/100).toFixed(2)]))].map(line=>line.map(escape).join(",")).join("\r\n");
}
