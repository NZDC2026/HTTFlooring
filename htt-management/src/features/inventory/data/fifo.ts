import type { InventoryCostMovement } from '../types/inventoryCost';
import {roundInventoryQuantity as q,roundInventoryValue as m} from './inventoryCostCalculations';
export type FifoLayer={id:string;quantity:number;value:number};
/** Posting sequence is the persisted append order, never the editable business date. */
export function consumeFifo(layers:FifoLayer[],quantity:number,onlyLayerId?:string):number {
 let need=q(quantity),value=0;
 for(const layer of layers){if(onlyLayerId&&layer.id!==onlyLayerId)continue;const take=q(Math.min(need,layer.quantity));if(!take)continue;
 const cost=take===layer.quantity?layer.value:m(layer.value*take/layer.quantity);
 layer.quantity=q(layer.quantity-take);layer.value=m(layer.value-cost);need=q(need-take);value=m(value+cost);if(!need)break;}
 if(need>0)throw Error('FIFO stock layer is unavailable or has already been consumed.');return value;
}
export function fifoLayers(movements:InventoryCostMovement[]):FifoLayer[]{
 const layers:FifoLayer[]=[];
 let priorQuantity=0,inFifo=false;
 for(const movement of movements.slice().reverse()){
  if(movement.costingMethod!=='FIFO'){
   if(inFifo&&priorQuantity!==0)throw Error('FIFO history changed method with stock remaining.');
   layers.length=0;priorQuantity=movement.quantityAfter;inFifo=false;continue;
  }
  if(!inFifo&&priorQuantity!==0)throw Error('FIFO history is incomplete; existing stock cannot be recosted.');
  inFifo=true;
  if(!Number.isFinite(movement.quantityBase)||movement.quantityBase===0||!Number.isFinite(movement.valueChange)||(movement.quantityBase>0?movement.valueChange<0:movement.valueChange>0))throw Error('Invalid FIFO quantity or signed value.');
  if(movement.fifoReturnLayerId){const source=movements.find(m=>m.id===movement.fifoReturnLayerId);
    if(movement.referenceType!=='CUSTOMER_RETURN_VOID'||movement.quantityBase>=0||!source||source.referenceType!=='CUSTOMER_RETURN'||source.quantityBase<=0||source.referenceId!==movement.referenceId)throw Error('FIFO targeted layer removal lacks matching customer return evidence.');
  }else if(movement.referenceType==='CUSTOMER_RETURN_VOID')throw Error('FIFO customer return reversal is missing its exact layer.');
  if(movement.quantityBase>0)layers.push({id:movement.id,quantity:movement.quantityBase,value:movement.valueChange});
  else if(m(consumeFifo(layers,-movement.quantityBase,movement.fifoReturnLayerId)+movement.valueChange)!==0)throw Error('FIFO layer value differs from posted cost.');
  priorQuantity=movement.quantityAfter;
  if(q(layers.reduce((n,l)=>n+l.quantity,0))!==movement.quantityAfter||m(layers.reduce((n,l)=>n+l.value,0))!==movement.inventoryValueAfter)throw Error('FIFO layer balance differs from inventory ledger.');
 }
 return layers.filter(l=>l.quantity>0);
}
