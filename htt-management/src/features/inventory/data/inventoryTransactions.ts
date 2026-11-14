import type { Product } from '../types/product';
import type { SalesDocument } from '../../sales/types/salesDocument';
import type { SalesFulfilment } from '../../sales/types/salesFulfilment';
import type { GoodsReceipt } from '../../purchases/types/goodsReceipt';
export type InventoryTransaction={id:string;date:string;documentId:string;documentNumber:string;orderId:string;orderNumber:string;invoiceNumber?:string;partyId:string;partyName:string;productId:string;sku:string;name:string;category:string;unit:string;quantity:number;baseQuantity?:number;coverage?:number;area?:number;amount:number;siteId:string;sample?:boolean};
export function soldTransactions(products:Product[],documents:SalesDocument[],fulfilments:SalesFulfilment[],customers:{id:string;businessName:string}[]):InventoryTransaction[]{
 const invoices=documents.filter(d=>d.type==='INVOICE'&&!['VOID','DRAFT'].includes(d.status));
 const used=new Map<string,number>(),rows:InventoryTransaction[]=[];
 for(const f of [...fulfilments].filter(f=>f.status==='ACTIVE').sort((a,b)=>a.fulfilmentDate.localeCompare(b.fulfilmentDate)||a.id.localeCompare(b.id))){
  for(const l of f.lines){
   const p=products.find(p=>p.id===l.productId);if(!p)continue;
   let remaining=l.fulfilledQuantity;
   for(const inv of invoices.filter(i=>i.type==='INVOICE'&&i.sourceSalesOrderId===f.salesOrderId).sort((a,b)=>a.documentDate.localeCompare(b.documentDate)||a.id.localeCompare(b.id))){
    const candidates=inv.lines.filter(i=>i.productId===l.productId&&i.unitId===l.unitId);
    const line=candidates.find(i=>i.id===l.salesOrderLineId)??(candidates.length===1?candidates[0]:undefined);
    if(!line||line.quantity<=0)continue;
    const key=inv.id+':'+line.id,available=line.quantity-(used.get(key)||0),quantity=Math.min(remaining,available);if(quantity<=0)continue;
    used.set(key,(used.get(key)||0)+quantity);remaining-=quantity;
    const base=p.units.find(u=>u.id===p.baseUnitId),coverage=line.areaPerPack??(base?.code==='M2'?l.conversionToBase:undefined);
    rows.push({id:f.id+':'+l.id+':'+inv.id,date:f.fulfilmentDate,documentId:inv.id,documentNumber:inv.documentNumber,invoiceNumber:inv.documentNumber,orderId:f.salesOrderId,orderNumber:f.salesOrderNumber,partyId:f.customerId,partyName:customers.find(c=>c.id===f.customerId)?.businessName||f.customerId,productId:p.id,sku:l.sku,name:l.description,category:p.category,unit:l.unitSymbol,quantity,baseQuantity:quantity*l.conversionToBase,coverage,area:coverage===undefined?undefined:quantity*coverage,amount:line.lineSubtotal*quantity/line.quantity,siteId:f.siteId});
    if(remaining<=0)break;
   }
  }
 }
 return rows;
}
export function boughtTransactions(products:Product[],receipts:GoodsReceipt[]):InventoryTransaction[]{
 return receipts.filter(r=>r.status==='POSTED').flatMap(r=>r.lines.flatMap(l=>{const p=products.find(p=>p.id===l.productId);if(!p||l.receivedQuantity<=0)return [];const base=p.units.find(u=>u.id===p.baseUnitId),area=base?.code==='M2'?l.receivedBaseQuantity:undefined;return [{id:r.id+':'+l.id,date:r.receiptDate,documentId:r.id,documentNumber:r.receiptNumber,orderId:r.purchaseOrderId,orderNumber:r.purchaseOrderNumber,partyId:r.supplierId,partyName:r.supplierName,productId:p.id,sku:l.sku,name:l.description,category:p.category,unit:l.unitSymbol,quantity:l.receivedQuantity,baseQuantity:l.receivedBaseQuantity,coverage:area===undefined?undefined:area/l.receivedQuantity,area,amount:l.receivedQuantity*l.unitCost,siteId:r.siteId}];}));
}
export function transactionSummary(rows:InventoryTransaction[]){
 const accessories:Record<string,number>={};for(const r of rows.filter(r=>r.category==='Accessories'))accessories[r.unit]=(accessories[r.unit]||0)+r.quantity;
 return {accessoryUnits:Object.values(accessories).reduce((n,quantity)=>n+quantity,0),floorArea:rows.filter(r=>r.category!=='Accessories').reduce((n,r)=>n+(r.area||0),0),accessories,orders:new Set(rows.map(r=>r.orderId)).size,documents:new Set(rows.map(r=>r.documentId)).size,amount:rows.reduce((n,r)=>n+r.amount,0)};
}
export function filterTransactions(rows:InventoryTransaction[],filter:{from:string;to:string;site:string;category:string;party:string;search:string;productId?:string}){
 return rows.filter(r=>(!filter.productId||r.productId===filter.productId)&&r.date>=filter.from&&r.date<=filter.to&&(filter.site==='ALL'||r.siteId===filter.site)&&(filter.category==='All'||r.category===filter.category)&&(filter.party==='All'||r.partyId===filter.party)&&`${r.name} ${r.sku}`.toLowerCase().includes(filter.search.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
}
export function sampleTransactions(mode:'Sold'|'Bought',today:string):InventoryTransaction[]{
 const products=[['European Oak 190mm Natural','TIM-OAK-190-NAT','Timber','Box',2.166,40,68.5],['Underlay 20 m² Roll','UDL-20','Accessories','Roll',20,10,2.8],['SPC Hybrid 180mm Smoked Oak','HYB-SPC-180-SMK','Hybrid','Box',2.166,30,42.9],['Underlay 50 m² Roll','UDL-50','Accessories','Roll',50,6,2.5],['Luxury Vinyl Plank Stone Grey','VIN-PLANK-STONE','Vinyl','Box',2.166,25,36.8],['Oak Scotia Trim','ACC-SCOTIA-OAK','Accessories','Piece',undefined,120,14.9]];
 return products.map((p,i)=>{const d=new Date(today+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-i);const quantity=Number(p[5])*(mode==='Bought'?5:1),coverage=p[4] as number|undefined,unitPrice=Number(p[6])*(mode==='Bought'?.6:1);return {id:`sample-${mode}-${i}`,date:d.toISOString().slice(0,10),documentId:`sample-document-${i}`,documentNumber:`${mode==='Sold'?'INV':'GR'}-SAMPLE-${10456-i}`,orderId:`sample-order-${i}`,orderNumber:`${mode==='Sold'?'SO':'PO'}-SAMPLE-${10456-i}`,invoiceNumber:mode==='Sold'?`INV-SAMPLE-${10456-i}`:undefined,partyId:`sample-party-${i%3}`,partyName:(mode==='Sold'?['Sample Melbourne Flooring','Sample Coastline Interiors','Sample Harbour Homes']:['Sample Global Timber Supplies','Sample Flooring Materials Co.','Sample Underlay Direct'])[i%3],productId:`sample-${i}`,sku:String(p[1]),name:String(p[0]),category:String(p[2]),unit:String(p[3]),quantity,coverage,area:coverage===undefined?undefined:quantity*coverage,amount:quantity*(coverage||1)*unitPrice,siteId:'sample-site',sample:true};});
}

/** Synthetic history for one product only; never passed to a posting repository. */
export function sampleProductTransactions(mode:'Sold'|'Bought',today:string,product:Product):InventoryTransaction[]{
 const base=product.units.find(u=>u.id===product.baseUnitId);
 const selling=product.units.find(u=>u.id===product.measureUnitId)??product.units.find(u=>u.active&&!u.isBaseUnit)??base;
 const coverage=base?.code==='M2'?(selling?.conversionToBase??1):product.category!=='Accessories'&&selling?.code==='BOX'?2.166:undefined;
 const unit=selling?.symbol||'Piece';
 return sampleTransactions(mode,today).map((row,i)=>{
  const quantity=(mode==='Sold'?[40,25,18,32,12,20]:[200,150,100,180,80,120])[i];
  const baseQuantityPerUnit=selling?.conversionToBase??1;
  const amount=quantity*(mode==='Sold'?(selling?.basePrice||(base?.basePrice||45)*baseQuantityPerUnit):28.5*baseQuantityPerUnit);
  return {...row,productId:product.id,sku:product.sku,name:product.name,category:product.category,unit,quantity,coverage,area:coverage===undefined?undefined:quantity*coverage,amount};
 });
}
