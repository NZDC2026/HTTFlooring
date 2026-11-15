import {adjustmentIsPending,clearanceAwaitingEvidence} from '../../stock-adjustments/clearanceEvidence';
import type {ConfigRow} from '../../business-workspace/configurationState';
import type {SalesBatchOption} from './batchSalesPricing';
import type {StockAdjustment} from '../../stock-adjustments/stockAdjustmentRepository';
import {requireDateKey} from '../../../lib/businessDate';
export function clearanceReminders(records:ConfigRow[],batches:Pick<SalesBatchOption,'id'|'siteId'|'productId'|'availableBase'>[],adjustments:StockAdjustment[],today:string){
 requireDateKey(today);
 return records.flatMap(rule=>{
  const batch=batches.find(b=>b.id===rule.batchId&&b.siteId===rule.siteId&&b.productId===rule.productId);
  if(!batch||batch.availableBase<=0)return [];
  const pending=adjustments.find(a=>a.clearanceId===rule.id&&adjustmentIsPending(a));
  const request=pending??adjustments.find(a=>a.clearanceId===rule.id&&(['WITHDRAWN','REJECTED'].includes(a.status)||clearanceAwaitingEvidence(a)));
  try{requireDateKey(rule.ends);requireDateKey(rule.starts);}catch{return [];}
  const daysLeft=Math.round((Date.parse(rule.ends+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);
  const requiresCorrection=request?.status==='REJECTED'&&rule.status==='Active';
  if(!pending&&!requiresCorrection&&(rule.status!=='Active'||rule.starts>today||daysLeft>7))return [];
  return [{rule,remaining:batch.availableBase,daysLeft,pending,request}];
 }).sort((a,b)=>a.daysLeft-b.daysLeft||a.rule.id.localeCompare(b.rule.id));
}

export function clearanceRequestLabel(row:Pick<StockAdjustment,'status'|'clearanceId'|'evidence'>){return clearanceAwaitingEvidence(row)?'Write-off preparing · Upload evidence and submit':row.status==='REJECTED'?'Write-off rejected · Resubmit required':row.status==='WITHDRAWN'?'Write-off withdrawn':row.status==='POSTED'?'Write-off posted':'Write-off pending review';}
