import {fifoLayers} from './fifo';
import {roundInventoryQuantity as round} from './inventoryCostCalculations';
import type {InventoryCostMovement} from '../types/inventoryCost';
type QuantityBatch={id:string;batchNumber:string;incomeDate:string;quantity:number;value:number|undefined};
/** Physical batch quantities are independent of the accounting costing method.
 * Replay persisted posting order; consume the earliest available income date.
 * Never recalculate or rewrite posted cost movements.
 */
export function physicalStockBatches(history:InventoryCostMovement[]):QuantityBatch[]{
 const batches:QuantityBatch[]=[];
 for(const movement of history.slice().reverse()){
  const tracked=round(batches.reduce((n,b)=>n+b.quantity,0));
  const before=round(movement.quantityAfter-movement.quantityBase);
  if(before>tracked)batches.unshift({id:'legacy:opening',batchNumber:'Not recorded',incomeDate:'—',quantity:round(before-tracked),value:undefined});
  if(movement.quantityBase>0){batches.push({id:movement.id,batchNumber:movement.referenceNumber||movement.costMovementNumber,incomeDate:movement.occurredAt.slice(0,10),quantity:movement.quantityBase,value:undefined});continue;}
  let remaining=round(-movement.quantityBase);
  if(movement.batchAllocations?.length){
   for(const allocation of movement.batchAllocations){
    const batch=batches.find(b=>b.id===allocation.batchId);
    if(!batch||allocation.quantity<=0||allocation.quantity>batch.quantity)throw Error('Invalid physical batch allocation.');
    batch.quantity=round(batch.quantity-allocation.quantity);remaining=round(remaining-allocation.quantity);
   }
   if(remaining!==0)throw Error('Physical batch allocation does not match issue quantity.');
   continue;
  }
  // A return reversal must remove its own batch, never an unrelated receipt.
  const available=batches.filter(b=>!movement.fifoReturnLayerId||b.id===movement.fifoReturnLayerId).sort((a,b)=>(a.incomeDate==='—'?'':a.incomeDate).localeCompare(b.incomeDate==='—'?'':b.incomeDate));
  for(const batch of available){const taken=Math.min(remaining,batch.quantity);batch.quantity=round(batch.quantity-taken);remaining=round(remaining-taken);if(!remaining)break;}
  if(remaining>0)throw Error('Physical batch quantities do not cover the inventory issue.');
 }
 return batches.filter(b=>b.quantity>0).sort((a,b)=>a.incomeDate.localeCompare(b.incomeDate));
}
export function productStockBatches(productId:string,siteId:string,onHand:number,movements:InventoryCostMovement[]){
 const history=movements.filter(m=>m.productId===productId&&m.siteId===siteId);
 if(!history.length)return [{id:siteId+':untracked',batchNumber:'Not recorded',incomeDate:'—',quantity:onHand,value:undefined as number|undefined}];
 if(history[0].costingMethod==='FIFO')return fifoLayers(history).map(l=>{const source=history.find(m=>m.id===l.id)!;return {id:l.id,batchNumber:source.referenceNumber||source.costMovementNumber,incomeDate:source.occurredAt.slice(0,10),quantity:l.quantity,value:l.value};});
 return physicalStockBatches(history);
}

/** Freeze physical allocations on new issues, including legacy weighted-average stock. */
export function allocatePhysicalStock(history:InventoryCostMovement[],quantity:number,onHand:number):NonNullable<InventoryCostMovement['batchAllocations']>{
 const batches=history.length?physicalStockBatches(history):[{id:'legacy:opening',batchNumber:'Not recorded',incomeDate:'—',quantity:onHand}];
 let remaining=round(quantity);
 const allocations:NonNullable<InventoryCostMovement['batchAllocations']>=[];
 for(const batch of batches.slice().sort((a,b)=>(a.incomeDate==='—'?'':a.incomeDate).localeCompare(b.incomeDate==='—'?'':b.incomeDate))){
  const taken=round(Math.min(remaining,batch.quantity));
  if(taken>0)allocations.push({batchId:batch.id,batchNumber:batch.batchNumber,incomeDate:batch.incomeDate,quantity:taken});
  remaining=round(remaining-taken);if(!remaining)break;
 }
 if(remaining>0)throw Error('Physical batch quantities do not cover the inventory issue.');
 return allocations;
}
