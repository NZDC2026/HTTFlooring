import {inventorySiteRepository} from '../data/inventorySiteRepository';
import {useSyncExternalStore} from 'react';
import {z} from 'zod';
import {registerRepository} from '../../security/repositoryHost';
import {trustedAuthorization} from '../../security/trustedAuthorization';
import {configurationRows} from '../../business-workspace/configurationState';
import {inventoryCostMovementRepository} from '../data/inventoryCostMovementRepository';
import {physicalStockBatches} from '../data/productStockBatches';
import {getProductById} from '../data/mockProducts';
import {pricingDate,type PricingInstant} from '../../sales/data/pricingInstant';
const text=z.string().min(1).max(200);
export const salesBatchSchema=z.object({id:text,siteId:text,number:text,shade:z.string().max(80).optional(),conversionToBase:z.number().finite().positive()}).strict();
export type SalesBatch=z.infer<typeof salesBatchSchema>;
export const clearanceEvidenceSchema=z.object({id:text,revision:text,pricePerBase:z.number().finite().positive(),starts:text,ends:text,belowCostApproved:z.boolean(),approvedBy:text.optional()}).strict();
export type ClearanceEvidence=z.infer<typeof clearanceEvidenceSchema>;
export type BatchClearanceOffer={id:string;revision:string;pricePerBase:number;starts:string;ends:string;status:string;allowed:boolean;requiresApproval:boolean;shade?:string};
export type SalesBatchOption={id:string;siteId:string;productId:string;number:string;siteName?:string;shade?:string;availableBase:number;offers:BatchClearanceOffer[]};
let cached:SalesBatchOption[]=[];let revision=0;const listeners=new Set<()=>void>();
export function useSalesBatchOptions(productId?:string){useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>revision,()=>revision);return salesBatchOptions(productId);}
function liveOptions():SalesBatchOption[]{
 const history=inventoryCostMovementRepository.getSnapshot(),groups=new Map<string,typeof history>(),result:SalesBatchOption[]=[];
 for(const c of history){const key=c.productId+'::'+c.siteId;groups.set(key,[...(groups.get(key)??[]),c]);}
 for(const group of groups.values()){let batches:ReturnType<typeof physicalStockBatches>;try{batches=physicalStockBatches(group);}catch{continue;}
  for(const b of batches){const source=group.find(c=>c.id===b.id&&c.quantityBase>0);if(!source)continue;
   const rows=(configurationRows.clearances??[]).filter(r=>r.batchId===source.id&&r.siteId===source.siteId&&r.productId===source.productId);
   result.push({id:source.id,siteId:source.siteId,productId:source.productId,number:b.batchNumber,siteName:inventorySiteRepository.getById(source.siteId)?.name??source.siteId,shade:rows.find(r=>r.shade)?.shade||undefined,availableBase:b.quantity,offers:rows.map(r=>({id:r.id,revision:r.revision,pricePerBase:Number(r.price),starts:r.starts,ends:r.ends,status:r.status,allowed:r.allowBelowCost==='true',shade:r.shade||undefined,requiresApproval:Number(r.price)<source.unitCostBase&&r.allowBelowCost!=='true'}))});
  }
 }
 return result;
}
export function salesBatchOptions(productId?:string){const list=typeof window==='undefined'||(globalThis as Record<string,unknown>).__HTT_MAIN_HOST__===true||import.meta.env.MODE==='test'?liveOptions():cached;return productId?list.filter(b=>b.productId===productId):list;}
/** Only the trusted pricing command can turn a selected physical batch into a price. */
export function eligibleBatchOffer(offers:BatchClearanceOffer[],day:string){return offers.filter(r=>r.status==='Active'&&r.starts<=day&&r.ends>=day).sort((a,b)=>a.pricePerBase-b.pricePerBase||a.id.localeCompare(b.id))[0];}
export function resolveSalesBatch(productId:string,unitId:string,batchId:string|undefined,siteId:string|undefined,context:PricingInstant){
 if(!batchId){if(siteId)throw Error('Select a batch for the batch site.');return undefined;}
 if(!siteId)throw Error('Select the warehouse for this batch.');
 const option=salesBatchOptions(productId).find(b=>b.id===batchId&&b.siteId===siteId);if(!option)throw Error('Selected batch is unavailable or belongs to another product or warehouse.');
 const p=getProductById(productId),unit=p?.units.find(u=>u.id===unitId&&u.active);if(!unit)throw Error('Select an active unit for the batch.');
 const day=pricingDate(context.pricingAt,context.pricingTimezone),offer=eligibleBatchOffer(option.offers,day);
 return {option,batch:{id:option.id,siteId,number:option.number,shade:offer?.shade??option.shade,conversionToBase:unit.conversionToBase} satisfies SalesBatch,offer};
}
export function assertBatchPriceFloor(batch:SalesBatch,price:number,offer:BatchClearanceOffer|undefined,preview=false){
 if(preview)return undefined;
 const source=inventoryCostMovementRepository.getSnapshot().find(c=>c.id===batch.id);if(!source)throw Error('Selected batch cost source is unavailable.');
 if(price+1e-8>=source.unitCostBase*batch.conversionToBase)return undefined;
 if(offer?.allowed&&price+1e-8>=offer.pricePerBase*batch.conversionToBase)return undefined;
 const principal=trustedAuthorization.require('promotions.margin');return principal.userId;
}
export function assertSalesBatchQuantities(lines:{quantity:number;batch?:SalesBatch}[]){const totals=new Map<string,number>();for(const l of lines)if(l.batch){const key=l.batch.id+'::'+l.batch.siteId;totals.set(key,(totals.get(key)??0)+l.quantity*l.batch.conversionToBase);}for(const [key,qty]of totals){const b=salesBatchOptions().find(b=>b.id+'::'+b.siteId===key);if(!b||qty>b.availableBase+1e-6)throw Error('Combined line quantities exceed stock in the selected batch.');}}
export function validateSalesBatchSnapshot(line:{productId:string;unitPrice:number;batch?:SalesBatch;clearance?:ClearanceEvidence;pricingAt?:string;pricingTimezone?:string;unitId?:string;priceSource?:string},snapshots?:Record<string,any>){
 if(line.priceSource==='CLEARANCE_PRICE'&&!line.clearance)throw Error('Clearance price source requires rule evidence.');
 if(!line.batch){if(line.clearance)throw Error('Clearance pricing requires a batch snapshot.');return;}
 const batch=salesBatchSchema.parse(line.batch);
 if(snapshots){const source=snapshots.costMovements?.movements.find((c:any)=>c.id===batch.id);if(!source||source.productId!==line.productId||source.siteId!==batch.siteId||source.quantityBase<=0||(source.referenceNumber||source.costMovementNumber)!==batch.number)throw Error('Saved sales batch reference is invalid.');const p=snapshots.products?.products.find((p:any)=>p.id===line.productId),unit=p?.units.find((u:any)=>u.id===line.unitId);if(!unit||Math.abs(unit.conversionToBase-batch.conversionToBase)>1e-8)throw Error('Saved sales batch conversion is invalid.');}
 if(line.clearance){const c=clearanceEvidenceSchema.parse(line.clearance);if(!line.pricingAt||!line.pricingTimezone)throw Error('Clearance pricing requires a frozen pricing time.');const day=pricingDate(line.pricingAt,line.pricingTimezone);if(c.starts>day||c.ends<day||c.ends<c.starts)throw Error('Clearance pricing is outside its saved validity period.');
  if(snapshots){const state=snapshots.workspace_clearances;let row=state?.records.find((r:any)=>r.id===c.id&&r.revision===c.revision);if(!row)for(const h of state?.history??[]){try{const r=JSON.parse(h.after);if(r.id===c.id&&r.revision===c.revision){row=r;break;}}catch{/* Other audit records do not contain a price snapshot. */}}
   if(!row||row.status!=='Active'||row.batchId!==batch.id||row.siteId!==batch.siteId||row.productId!==line.productId||(row.shade||undefined)!==batch.shade||Number(row.price)!==c.pricePerBase||row.starts!==c.starts||row.ends!==c.ends||(row.allowBelowCost==='true')!==c.belowCostApproved)throw Error('Saved clearance price evidence differs from its rule revision.');
  }
 }
}
/** A sales-readable, cost-free batch selector. Authoritative stock stays in the cost ledger. */
registerRepository('salesBatches',{repository:{},read:'inventory.read',commands:{},snapshot:()=>({batches:[]}),view:()=>({batches:liveOptions()}),restore:v=>{cached=v.batches;},publish:()=>{revision++;listeners.forEach(fn=>fn());},validate:v=>{if(!Array.isArray((v as any).batches)||(v as any).batches.length)throw Error('Saved batch selector must be rebuilt from inventory.');}});
