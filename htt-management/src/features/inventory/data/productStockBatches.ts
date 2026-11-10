import {fifoLayers} from './fifo';
import type {InventoryCostMovement} from '../types/inventoryCost';
export function productStockBatches(productId:string,siteId:string,onHand:number,movements:InventoryCostMovement[]){
 const history=movements.filter(m=>m.productId===productId&&m.siteId===siteId);
 if(!history.length||history[0].costingMethod!=='FIFO')return [{id:siteId+':untracked',batchNumber:'Not recorded',incomeDate:'—',quantity:onHand,value:undefined as number|undefined}];
 const layers=fifoLayers(history);
 return layers.map(l=>{const source=history.find(m=>m.id===l.id)!;return {id:l.id,batchNumber:source.referenceNumber||source.costMovementNumber,incomeDate:source.occurredAt.slice(0,10),quantity:l.quantity,value:l.value};});
}
