import type {SalesDocument} from '../sales/types/salesDocument';
import type {CreditNote} from '../sales/types/creditNote';
import type {Product} from '../inventory/types/product';
export type RebateRule = {customerId:string;productId:string;starts:string;ends:string;cycle:string;rate:string;minArea:string;minSales:string};
export function rebatePeriod(date:string,cycle:string){
 const [year,month]=date.split('-').map(Number),startMonth=cycle==='Quarterly'?Math.floor((month-1)/3)*3+1:month;
 return {from:`${year}-${String(startMonth).padStart(2,'0')}-01`,to:new Date(Date.UTC(year,startMonth+(cycle==='Quarterly'?2:0),0)).toISOString().slice(0,10)};
}
export function calculateRebate(rule:RebateRule,date:string,documents:SalesDocument[],credits:CreditNote[],products:Product[]){
 const period=rebatePeriod(date,rule.cycle),from=period.from>rule.starts?period.from:rule.starts,to=period.to<rule.ends?period.to:rule.ends;
 const product=products.find(p=>p.id===rule.productId);
 const area=(line:SalesDocument['lines'][number])=>{
  if(Number.isFinite(line.coveredArea)&&line.coveredArea!>=0)return line.coveredArea!;
  const unit=product?.units.find(u=>u.id===line.unitId),base=product?.units.find(u=>u.id===product.baseUnitId);
  if(['m²','m2','sqm'].includes(line.unitSymbol.toLowerCase()))return line.quantity;
  if(base&&['m²','m2','sqm'].includes(base.symbol.toLowerCase())&&unit)return line.quantity*unit.conversionToBase;
  return 0;
 };
 const rows:{id:string;number:string;date:string;area:number;sales:number}[]=[];
 const orders=documents.filter(d=>d.customerId===rule.customerId&&d.type==='SALES_ORDER'&&!['DRAFT','CANCELLED'].includes(d.status));
 const orderIds=new Set(orders.map(d=>d.id));
 const eligible=documents.filter(d=>d.customerId===rule.customerId&&(orders.includes(d)||(d.type==='INVOICE'&&!['DRAFT','VOID'].includes(d.status)&&(!d.sourceSalesOrderId||!orderIds.has(d.sourceSalesOrderId)))));
 let historicalArea=0;
 for(const doc of eligible)if(doc.documentDate<=to)for(const l of doc.lines.filter(l=>l.productId===rule.productId))historicalArea+=area(l);
 for(const credit of credits)if(credit.customerId===rule.customerId&&!['DRAFT','VOID'].includes(credit.status)&&credit.creditDate<=to)for(const l of credit.lines.filter(l=>l.productId===rule.productId))historicalArea-=area(l);
 historicalArea=Math.max(0,historicalArea);
 if(from<=to){
 for(const doc of eligible)if(doc.documentDate>=from&&doc.documentDate<=to){for(const l of doc.lines.filter(l=>l.productId===rule.productId))rows.push({id:doc.id+':'+l.id,number:doc.documentNumber,date:doc.documentDate,area:area(l),sales:l.lineSubtotal});}
 for(const credit of credits)if(credit.customerId===rule.customerId&&!['DRAFT','VOID'].includes(credit.status)&&credit.creditDate>=from&&credit.creditDate<=to){for(const l of credit.lines.filter(l=>l.productId===rule.productId))rows.push({id:credit.id+':'+l.id,number:credit.creditNoteNumber,date:credit.creditDate,area:-area(l),sales:-l.lineSubtotal});}
 }
 const totalArea=Math.max(0,rows.reduce((n,l)=>n+l.area,0)),sales=Math.max(0,rows.reduce((n,l)=>n+l.sales,0));
 const qualified=totalArea>0&&historicalArea>=Number(rule.minArea)&&sales>=Number(rule.minSales),rebate=qualified?Math.round(totalArea*Number(rule.rate)*100)/100:0;
 return {from,to,historicalArea,totalArea,sales,qualified,rebate,rows};
}
