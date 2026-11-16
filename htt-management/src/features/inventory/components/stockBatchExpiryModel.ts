import type {Product} from '../types/product';
export type StockBatchRow={id:string;siteId:string;number:string;received:string;onHand:number;reserved?:number;shade?:string;expiresOn?:string};
export const expiryDay=(sample:boolean)=>sample?'2026-11-16':new Date().toLocaleDateString('en-CA',{timeZone:'Australia/Melbourne'});
export function daysUntilExpiry(date:string,today:string){return Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);}
export function expiryText(days:number){return days<0?`${Math.abs(days)} days overdue`:days===0?'Expires today':days<60?`${days} days left`:`${Math.round(days/30)} months left`;}

export function validateProductBatchMetadata(product:Product,movements:{id:string;siteId:string;productId:string;quantityBase:number}[]) {
 const rows=product.batchMetadata??[];
 if(new Set(rows.map(b=>b.siteId+'::'+b.batchId)).size!==rows.length||rows.some(b=>!movements.some(m=>m.id===b.batchId&&m.siteId===b.siteId&&m.productId===product.id&&m.quantityBase>0)))throw Error('Batch metadata must reference a receipt for this product and warehouse.');
}
