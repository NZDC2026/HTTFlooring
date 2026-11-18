import type {SalesDocument} from '../../sales/types/salesDocument';
import type {SalesFulfilment} from '../../sales/types/salesFulfilment';
import type {PurchaseOrder} from '../../purchases/types/purchaseOrder';
import type {Shipment} from '../../incoming-shipments/shipmentModel';
import type {Product} from '../../inventory/types/product';
import {activeOperationalOrders} from './roleWorkspaceModel';
import {orderStockShortages} from '../data/orderStockShortages';
export type StockSignals={late:{id:string;number:string;customerId:string;eta:string}[];reorder:{id:string;name:string}[];ready:{id:string;number:string}[];containers:{id:string;number:string;eta:string;quantity:string}[]};
export function stockSignals(input:{today:string;documents:SalesDocument[];orders:PurchaseOrder[];shipments:Shipment[];products:Product[];stock:{productId:string;siteId:string;quantityOnHand:number}[];fulfilments:SalesFulfilment[]}):StockSignals{
 const {today,documents,orders,shipments,products,stock,fulfilments}=input,end=new Date(Date.parse(today)+7*86400000).toISOString().slice(0,10),active=activeOperationalOrders(documents),incoming=shipments.filter(s=>!['Draft','Cancelled'].includes(s.status)&&s.lines.some(l=>l.quantity>l.received));
 const productId=(l:Shipment['lines'][number])=>orders.find(o=>o.id===l.purchaseOrderId)?.lines.find(p=>p.id===l.lineId)?.productId;
 const shortages=orderStockShortages(active,products,stock,fulfilments,'ALL'),late:StockSignals['late']=[];
 for(const row of shortages){const d=active.find(d=>d.id===row.orderId)!,ids=new Set(d.lines.filter(l=>d.id+l.id===row.id).map(l=>l.productId)),eta=incoming.filter(s=>s.lines.some(l=>l.quantity>l.received&&ids.has(productId(l)||''))).map(s=>s.eta).sort()[0];if(d.expectedDispatchDate&&eta&&eta>d.expectedDispatchDate&&!late.some(r=>r.id===d.id))late.push({id:d.id,number:d.documentNumber,customerId:d.customerId,eta});}
 const reorder=products.filter(p=>p.status==='ACTIVE'&&p.buyEnabled!==false&&(!p.itemType||p.itemType==='STOCK')&&(p.reorderPoint??0)>0).filter(p=>{
  const onHand=stock.filter(s=>s.productId===p.id).reduce((n,s)=>n+s.quantityOnHand,0),onOrder=orders.filter(o=>!['QUOTATION','DRAFT','CANCELLED','RECEIVED','BILLED'].includes(o.status)).flatMap(o=>o.lines).filter(l=>l.productId===p.id).reduce((n,l)=>n+Math.max(0,l.orderedQuantity-l.receivedQuantity)*(p.units.find(u=>u.id===l.unitId)?.conversionToBase||1),0);
  return onHand<=p.reorderPoint!&&(p.targetStock??p.reorderPoint!)>onHand+onOrder;
 }).map(p=>({id:p.id,name:p.name}));
 const shortageIds=new Set(shortages.map(r=>r.orderId)),landedProducts=new Set(shipments.filter(s=>s.status!=='Cancelled'&&s.status!=='Draft').flatMap(s=>s.lines.filter(l=>l.received>0).map(productId)));
 const ready=active.filter(d=>!shortageIds.has(d.id)&&d.lines.some(l=>landedProducts.has(l.productId))).map(d=>({id:d.id,number:d.documentNumber}));
 const containers=incoming.filter(s=>s.type==='Overseas'&&s.eta>=today&&s.eta<=end).sort((a,b)=>a.eta.localeCompare(b.eta)).map(s=>{
  const groups=new Map<string,number>();for(const l of s.lines){const remaining=Math.max(0,l.quantity-l.received);if(remaining)groups.set(l.unit,(groups.get(l.unit)||0)+remaining);}
  return {id:s.id,number:s.container||s.number,eta:s.eta,quantity:[...groups].map(([unit,n])=>`${n.toLocaleString('en-AU')} ${unit}`).join(' · ')};
 });return {late,reorder,ready,containers};
}
export function sampleStockSignals():StockSignals{return {late:[{id:'signal-so-10521',number:'SO-10521',customerId:'sample-coastal',eta:'2026-12-09'}],reorder:['Bonita Herringbone Smoked Oak','Bonita Plank Natural Oak','Hybrid SPC Grey Oak','Bonita Plank European Oak','Underlay 3mm','Laminate Coastal Oak','Scotia Natural Oak'].map((name,i)=>({id:'signal-product-'+i,name})),ready:[],containers:[{id:'signal-container-1',number:'MSKU4421907',eta:'2026-11-18',quantity:'800 boxes'},{id:'signal-container-2',number:'MSKU4421912',eta:'2026-11-18',quantity:'800 boxes'},{id:'signal-container-3',number:'TGHU5528116',eta:'2026-11-19',quantity:'320 boxes'}]};}
