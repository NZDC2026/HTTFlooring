import {clearanceEvidenceSchema,collectClearanceEvidence,validateClearanceEvidence,type ClearanceEvidence} from './clearanceEvidence';
import {configurationRows} from '../business-workspace/configurationState';
import {physicalStockBatches} from '../inventory/data/productStockBatches';
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository } from '../security/repositoryHost';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { hasPermission } from '../security/rbac';
import { businessDateKey, requireDateKey } from '../../lib/businessDate';
import { assertPostingPeriod } from '../accounting/data/accountingPeriodRepository';
import { assertCurrentCrossModuleWriteSafe } from '../integration/crossModuleWriteGate';
import { productRepository } from '../business-workspace/productRepository';
import { inventorySiteRepository } from '../inventory/data/inventorySiteRepository';
import { stockRepository } from '../inventory/data/stockRepository';
import { inventoryMovementRepository } from '../inventory/data/inventoryMovementRepository';
import { inventoryCostBalanceRepository } from '../inventory/data/inventoryCostBalanceRepository';
import { inventoryCostMovementRepository } from '../inventory/data/inventoryCostMovementRepository';
import { receiveInventoryCost, issueInventoryCost } from '../inventory/data/inventoryCostEngine';
import { accountRepository } from '../accounting/data/accountRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
const text=z.string().trim().min(1).max(200),quantity=z.number().finite();
const inputLine=z.object({productId:text,unitId:text,batchId:text.optional(),quantityDelta:quantity.refine(n=>n!==0,'Quantity cannot be zero.'),unitCost:z.number().finite().nonnegative().optional()}).strict();
export const adjustmentInputSchema=z.object({operationId:text,id:text.optional(),expectedRevision:z.number().int().nonnegative().optional(),siteId:text,date:text,kind:z.enum(['ADJUSTMENT','DAMAGE']).optional(),reason:z.string().trim().min(3).max(2000),lines:z.array(inputLine).min(1).max(100)}).strict();
const savedLine=inputLine.extend({batchNumber:text.optional(),id:text,sku:text,productName:text,unitSymbol:text,conversionToBase:z.number().positive(),quantityBase:quantity,expectedOnHand:quantity,beforeQuantity:quantity.optional(),afterQuantity:quantity.optional(),valueChange:quantity.optional(),inventoryMovementId:text.optional(),costMovementId:text.optional()}).strict();
const rowSchema=z.object({evidence:z.array(clearanceEvidenceSchema).min(1).optional(),clearanceId:text.optional(),id:text,number:text,status:z.enum(['PREPARING','DRAFT','POSTED','WITHDRAWN','REJECTED']),siteId:text,siteName:text,date:text,kind:z.enum(['ADJUSTMENT','DAMAGE']).optional(),reason:z.string().min(3).max(2000),lines:z.array(savedLine).min(1).max(100),revision:z.number().int().positive(),createdAt:text,createdBy:text,updatedAt:text,updatedBy:text,postedAt:text.optional(),postedBy:text.optional(),offsetAccountId:text.optional(),journalId:text.optional(),history:z.array(z.object({action:z.enum(['Prepared','Created','Submitted','Updated','Posted','Withdrawn','Rejected','Resubmitted']),actor:text,actorName:text.optional(),at:text,reason:z.string(),evidence:z.array(clearanceEvidenceSchema).min(1).optional()}).strict())}).strict();
export type StockAdjustment=z.infer<typeof rowSchema>;export type AdjustmentInput=z.infer<typeof adjustmentInputSchema>;
let rows:StockAdjustment[]=[],requests:{id:string;fingerprint:string;rowId:string}[]=[];
const listeners=new Set<()=>void>();const emit=()=>listeners.forEach(f=>f());
export function useStockAdjustments(){return useSyncExternalStore(stockAdjustmentRepository.subscribe,stockAdjustmentRepository.getSnapshot,stockAdjustmentRepository.getSnapshot);}
function batchAvailable(productId:string,siteId:string,batchId:string){return physicalStockBatches(inventoryCostMovementRepository.getBySiteAndProduct(siteId,productId)).find(b=>b.id===batchId);}
function prepareLines(input:AdjustmentInput,siteId:string,actor:NonNullable<ReturnType<typeof trustedAuthorization.current>>){
 const seen=new Set<string>();return input.lines.map(l=>{if(seen.has(l.productId))throw Error('Select each product only once per adjustment.');seen.add(l.productId);const product=productRepository.getById(l.productId),unit=product?.units.find(u=>u.id===l.unitId&&u.active);
   if(!product||product.status!=='ACTIVE'||(product.itemType??'STOCK')!=='STOCK'||!unit)throw Error('Select an active stocked product and unit.');
   if(q(l.quantityDelta)!==l.quantityDelta)throw Error('Use at most four decimal places.');const quantityBase=q(l.quantityDelta*unit.conversionToBase);if(!quantityBase)throw Error('Quantity rounds to zero.');
   if(product.wholePacks&&['BOX','ROLL','BUCKET'].includes(unit.code)&&!Number.isInteger(l.quantityDelta))throw Error('Pack adjustments must use whole packs.');
   if(l.unitCost!==undefined&&!hasPermission(actor,'inventory.cost.read'))throw Error('Cost access is required to enter unit costs.');
   const batch=l.batchId?batchAvailable(product.id,siteId,l.batchId):undefined;if(l.batchId&&(!batch||quantityBase>=0||-quantityBase>batch.quantity+0.00001))throw Error('Selected batch cannot cover this stock reduction.');
   return {...l,...(batch?{batchNumber:batch.batchNumber}:{}),id:crypto.randomUUID(),sku:product.sku,productName:product.name,unitSymbol:unit.symbol,conversionToBase:unit.conversionToBase,quantityBase,expectedOnHand:stockRepository.getBalance(siteId,product.id)?.quantityOnHand??0};
  });
}
const q=(n:number)=>Math.round(n*10000)/10000,m=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export const stockAdjustmentRepository={
 subscribe(f:()=>void){listeners.add(f);return()=>{listeners.delete(f);};},getSnapshot:()=>rows,getAll:()=>rows,
 requestClearanceWriteOff(raw:unknown){
  trustedAuthorization.require('inventory.adjust');
  const input=z.object({operationId:text,clearanceId:text,expectedRevision:text}).strict().parse(raw);
  const retry=requests.find(r=>r.id===input.operationId);if(retry){const previous=rows.find(r=>r.id===retry.rowId);if(previous?.clearanceId!==input.clearanceId)throw Error('Operation ID has already been used.');return previous;}
  const rule=(configurationRows.clearances??[]).find(r=>r.id===input.clearanceId);
  if(!rule||rule.revision!==input.expectedRevision)throw Error('Clearance changed. Refresh before requesting a write-off.');
  if(rule.status!=='Active')throw Error('Only active clearances can request a write-off.');
  const pending=rows.find(r=>r.clearanceId===rule.id&&r.status!=='POSTED');if(pending){if(!['PREPARING','DRAFT'].includes(pending.status))throw Error('Open the existing write-off and resubmit it with a reason.');return pending;}
  const batch=batchAvailable(rule.productId,rule.siteId,rule.batchId),product=productRepository.getById(rule.productId);
  if(!batch||!product||batch.quantity<=0)throw Error('No remaining stock in this clearance batch.');
  const draft=this.save({operationId:input.operationId,siteId:rule.siteId,date:businessDateKey(new Date().toISOString()),kind:'DAMAGE',reason:`Clearance write-off · ${rule.name} · batch ${rule.batchNumber}${rule.shade?' · '+rule.shade:''}`,lines:[{productId:rule.productId,unitId:product.baseUnitId,quantityDelta:-batch.quantity,batchId:rule.batchId}]});
  const next:StockAdjustment={...draft,clearanceId:rule.id,status:'PREPARING',history:draft.history.map((h,i)=>i===draft.history.length-1?{...h,action:'Prepared'}:h)};rows=rows.map(r=>r.id===next.id?next:r);emit();return next;
 },
 submitClearance(raw:unknown){return transitionClearance(raw,'SUBMIT');},
 withdrawClearance(raw:unknown){return transitionClearance(raw,'WITHDRAWN');},
 rejectClearance(raw:unknown){return transitionClearance(raw,'REJECTED');},
 resubmitClearance(raw:unknown){return transitionClearance(raw,'DRAFT');},
 save(raw:AdjustmentInput){
  const actor=trustedAuthorization.require('inventory.adjust'),input=adjustmentInputSchema.parse(raw),fingerprint=JSON.stringify(input),retry=requests.find(r=>r.id===input.operationId);
  if(retry){if(retry.fingerprint!==fingerprint)throw Error('Operation ID has already been used with different data.');return rows.find(r=>r.id===retry.rowId)!;}
  requireDateKey(input.date);const site=inventorySiteRepository.getById(input.siteId);if(!site||site.status!=='ACTIVE')throw Error('Select an active warehouse.');
  const old=rows.find(r=>r.id===input.id);if(input.id&&(!old||old.revision!==input.expectedRevision))throw Error('Adjustment changed. Reopen it before saving.');if(old?.clearanceId&&(input.siteId!==old.siteId||input.kind!=='DAMAGE'||input.lines.length!==1||input.lines[0].batchId!==old.lines[0].batchId||input.lines[0].productId!==old.lines[0].productId))throw Error('Keep the clearance batch and damage type on this request.');if(old?.clearanceId&&old.status==='DRAFT'&&old.evidence?.length)throw Error('Withdraw the submitted request before editing it, then resubmit to refresh stock and evidence.');if(old&&!['PREPARING','DRAFT'].includes(old.status))throw Error('Only pending drafts can be edited. Withdrawn or rejected requests must be resubmitted.');
  if(input.kind==='DAMAGE'&&input.lines.some(l=>l.quantityDelta>=0))throw Error('Damage quantities must reduce stock.');
  const lines=prepareLines(input,site.id,actor);const now=new Date().toISOString(),id=old?.id??crypto.randomUUID();
  const row:StockAdjustment={...(old?.clearanceId?{clearanceId:old.clearanceId}:{}),...(old?.evidence?{evidence:old.evidence}:{}),id,number:old?.number??`ADJ-${input.date.slice(0,4)}-${String(rows.length+1).padStart(5,'0')}`,status:old?.status??'DRAFT',siteId:site.id,siteName:site.name,date:input.date,kind:input.kind??'ADJUSTMENT',reason:input.reason,lines,revision:(old?.revision??0)+1,createdAt:old?.createdAt??now,createdBy:old?.createdBy??actor.userId,updatedAt:now,updatedBy:actor.userId,history:[...(old?.history??[]),{action:old?'Updated':'Created',actor:actor.userId,actorName:actor.displayName??actor.userId,at:now,reason:input.reason}]};
  rows=[row,...rows.filter(r=>r.id!==id)];requests=[...requests,{id:input.operationId,fingerprint,rowId:id}];emit();return row;
 },
 post(raw:unknown){
  const actor=trustedAuthorization.require('accounting.post');trustedAuthorization.require('inventory.cost.read');
  const input=z.object({id:text,expectedRevision:z.number().int().positive(),offsetAccountId:text,unitCosts:z.record(z.string(),z.number().finite().nonnegative()).optional()}).strict().parse(raw);
  const row=rows.find(r=>r.id===input.id);if(!row)throw Error('Adjustment not found.');if(row.status==='POSTED')return row;if(row.status!=='DRAFT')throw Error('Only pending drafts can be posted.');if(row.revision!==input.expectedRevision)throw Error('Adjustment changed. Reopen before posting.');
  if(row.clearanceId&&!row.evidence?.length)throw Error('Submit at least one photo or attachment for approval before posting.');
  assertCurrentCrossModuleWriteSafe();requireDateKey(row.date);assertPostingPeriod(row.date);if(row.date>businessDateKey(new Date().toISOString()))throw Error('A future adjustment cannot be posted.');
  const site=inventorySiteRepository.getById(row.siteId);if(!site||site.status!=='ACTIVE')throw Error('Warehouse is not active.');
  const offset=accountRepository.getAll().find(a=>a.id===input.offsetAccountId&&a.active&&a.type==='EXPENSE');if(!offset)throw Error('Select an active expense account for inventory adjustment differences.');
  const inventory=accountRepository.requireBySystemRole('INVENTORY');if(!inventory.active)throw Error('Inventory control account is inactive.');
  const prepared=row.lines.map(l=>{const product=productRepository.getById(l.productId),unit=product?.units.find(u=>u.id===l.unitId&&u.active),before=stockRepository.getBalance(row.siteId,l.productId)?.quantityOnHand??0;
   if(!product||product.status!=='ACTIVE'||(product.itemType??'STOCK')!=='STOCK'||!unit||unit.conversionToBase!==l.conversionToBase)throw Error('Product or unit changed. Refresh the draft.');
   if(Math.abs(before-l.expectedOnHand)>0.00001)throw Error(`Stock changed for ${l.sku}. ${row.clearanceId?'Withdraw and resubmit with current stock and evidence.':'Update the draft before posting.'}`);
   const costBalance=inventoryCostBalanceRepository.getBalance(row.siteId,l.productId);if(Math.abs((costBalance?.quantityOnHand??0)-before)>0.00001)throw Error('Stock and cost quantities differ. Reconcile before adjusting.');
   if(inventoryCostMovementRepository.getAll().some(c=>c.siteId===row.siteId&&c.productId===l.productId&&businessDateKey(c.occurredAt)>row.date))throw Error('Adjustment date cannot precede later stock activity.');
   if(l.batchId){const batch=batchAvailable(l.productId,row.siteId,l.batchId);if(!batch||l.quantityBase>=0||-l.quantityBase>batch.quantity+0.00001)throw Error('Batch stock changed. Refresh the draft before posting.');}
   if(q(before+l.quantityBase)<0)throw Error(`Insufficient stock for ${l.sku}.`);
   const unitCost=input.unitCosts?.[l.productId]??l.unitCost;if(l.quantityBase>0&&unitCost===undefined)throw Error(`Enter the actual unit cost for ${l.sku}.`);
   return {l,product,unit,before,unitCost};
  });
  const lines=prepared.map(({l,product,unit,before,unitCost})=>{const positive=l.quantityBase>0,amount=Math.abs(l.quantityBase),quantity=Math.abs(l.quantityDelta);
   if(positive)stockRepository.receive({siteId:row.siteId,productId:product.id,baseUnitId:product.baseUnitId,quantityBase:amount});else stockRepository.issue({siteId:row.siteId,productId:product.id,baseUnitId:product.baseUnitId,quantityBase:amount});
   const movement=inventoryMovementRepository.create({movementType:positive?'ADJUSTMENT_IN':'ADJUSTMENT_OUT',siteId:row.siteId,productId:product.id,baseUnitId:product.baseUnitId,quantityBase:l.quantityBase,transactionUnitId:unit.id,transactionUnitSymbol:unit.symbol,transactionQuantity:l.quantityDelta,conversionToBase:unit.conversionToBase,referenceType:'MANUAL',referenceId:row.id,referenceNumber:row.number,occurredAt:row.date,notes:row.reason});
   const ref={siteId:row.siteId,productId:product.id,unitId:unit.id,quantity,referenceType:'MANUAL' as const,referenceId:row.id,referenceNumber:row.number,inventoryMovementId:movement.id,occurredAt:row.date,notes:row.reason};
   const cost=positive?receiveInventoryCost({...ref,movementType:'ADJUSTMENT_IN',transactionUnitCost:unitCost!}).movement:issueInventoryCost({...ref,movementType:'ADJUSTMENT_OUT',batchId:l.batchId}).movement;
   return {...l,...(positive?{unitCost}:{}),beforeQuantity:before,afterQuantity:q(before+l.quantityBase),valueChange:cost.valueChange,inventoryMovementId:movement.id,costMovementId:cost.id};
  });
  const journalLines=lines.filter(l=>Math.abs(l.valueChange||0)>=.005).flatMap(l=>{const v=m(l.valueChange||0);return [{accountId:inventory.id,description:l.sku,debit:v>0?v:0,credit:v<0?-v:0},{accountId:offset.id,description:row.reason,debit:v<0?-v:0,credit:v>0?v:0}];});
  const journal=journalLines.length?journalEntryRepository.post({journalDate:row.date,description:`Inventory adjustment ${row.number}`,reference:row.number,sourceType:'INVENTORY_ADJUSTMENT',sourceId:row.id,lines:journalLines}):undefined;
  const now=new Date().toISOString(),next:StockAdjustment={...row,status:'POSTED',lines,offsetAccountId:offset.id,journalId:journal?.id,postedAt:now,postedBy:actor.userId,updatedAt:now,updatedBy:actor.userId,revision:row.revision+1,history:[...row.history,{action:'Posted',actor:actor.userId,actorName:actor.displayName??actor.userId,at:now,reason:row.reason,...(row.evidence?{evidence:row.evidence}:{})}]};rows=rows.map(r=>r.id===row.id?next:r);emit();return next;
 }
};
function validateClearanceHistory(row:StockAdjustment,snapshots:Record<string,any>){
 const transitions=row.history.filter(h=>['Prepared','Submitted','Withdrawn','Rejected','Resubmitted'].includes(h.action));
 if(!row.clearanceId&&(transitions.length||row.evidence||['PREPARING','WITHDRAWN','REJECTED'].includes(row.status)))throw Error('Approval transitions require a clearance request.');
 if(!row.clearanceId)return;
 let status=row.history[0]?.action==='Prepared'?'PREPARING':'DRAFT',packet:ClearanceEvidence[]|undefined;
 for(const [i,h]of row.history.entries()){
  if(!Number.isFinite(Date.parse(h.at))||!h.actor.trim())throw Error('Invalid clearance processing evidence.');
  if(['Submitted','Withdrawn','Rejected','Resubmitted'].includes(h.action)&&h.reason.trim().length<3)throw Error('Clearance processing reason is required.');
  if(h.evidence)validateClearanceEvidence(h.evidence,row.id,snapshots,h.at);
  if(h.action==='Created'||h.action==='Prepared'){if(i!==0)throw Error('Invalid clearance audit sequence.');}
  else if(h.action==='Submitted'||h.action==='Resubmitted'){
   if(h.action==='Submitted'?!['PREPARING','DRAFT'].includes(status)||!!packet:!['WITHDRAWN','REJECTED'].includes(status))throw Error('Invalid clearance audit sequence.');
   if(!h.evidence?.length&&(h.action==='Submitted'||row.history[0]?.action==='Prepared'||packet))throw Error('Submission requires frozen clearance evidence.');packet=h.evidence;status='DRAFT';
  }else if(h.action==='Withdrawn'||h.action==='Rejected'){
   if(h.action==='Rejected'?status!=='DRAFT':!['PREPARING','DRAFT'].includes(status))throw Error('Invalid clearance audit sequence.');
   if(packet&&JSON.stringify(h.evidence)!==JSON.stringify(packet))throw Error('Approval decision changed its submitted evidence.');status=h.action==='Withdrawn'?'WITHDRAWN':'REJECTED';
  }else if(h.action==='Posted'){
   if(status!=='DRAFT')throw Error('Invalid clearance audit sequence.');if(packet&&JSON.stringify(h.evidence)!==JSON.stringify(packet))throw Error('Posted evidence differs from submission.');status='POSTED';
  }else if(h.action==='Updated'&&(!['PREPARING','DRAFT'].includes(status)||!!packet))throw Error('Invalid clearance audit sequence.');
 }
 const last=row.history.at(-1);if(status!==row.status||last?.actor!==row.updatedBy||last?.at!==row.updatedAt||JSON.stringify(row.evidence)!==JSON.stringify(packet))throw Error('Clearance approval state differs from its audit history.');
}
function transitionClearance(raw:unknown,target:'WITHDRAWN'|'REJECTED'|'DRAFT'|'SUBMIT'){
 const actor=trustedAuthorization.require(target==='REJECTED'?'accounting.post':'inventory.adjust');if(target==='REJECTED')trustedAuthorization.require('inventory.cost.read');
 const input=z.object({id:text,expectedRevision:z.number().int().positive(),reason:z.string().trim().min(3).max(2000)}).strict().parse(raw),row=rows.find(r=>r.id===input.id);
 if(!row?.clearanceId)throw Error('Select a clearance write-off request.');
 if(row.revision!==input.expectedRevision)throw Error('Adjustment changed. Reopen before processing.');
 if(target==='SUBMIT'?!['PREPARING','DRAFT'].includes(row.status)||!!row.evidence:target==='DRAFT'?!['WITHDRAWN','REJECTED'].includes(row.status):target==='WITHDRAWN'?!['PREPARING','DRAFT'].includes(row.status):row.status!=='DRAFT')throw Error('This action is not available in the current request state.');
 if(target==='REJECTED'&&!row.evidence?.length)throw Error('Evidence must be submitted before this request can be reviewed.');
 let lines=row.lines,date=row.date,evidence=row.evidence;
 if(target==='DRAFT'||target==='SUBMIT'){
  evidence=collectClearanceEvidence(row.id);
  if(rows.some(r=>r.id!==row.id&&r.clearanceId===row.clearanceId&&r.status==='DRAFT'))throw Error('Another request is already pending for this clearance.');
  const rule=(configurationRows.clearances??[]).find(r=>r.id===row.clearanceId),product=productRepository.getById(row.lines[0].productId),site=inventorySiteRepository.getById(row.siteId),batch=batchAvailable(row.lines[0].productId,row.siteId,row.lines[0].batchId!);
  if(!rule||rule.status!=='Active'||!product||!site||site.status!=='ACTIVE'||!batch||batch.quantity<=0)throw Error('No active clearance batch stock remains to resubmit.');
  date=businessDateKey(new Date().toISOString());
  lines=prepareLines({operationId:'resubmit',siteId:row.siteId,date,reason:row.reason,kind:'DAMAGE',lines:[{productId:product.id,unitId:product.baseUnitId,batchId:batch.id,quantityDelta:-batch.quantity}]},row.siteId,actor);
 }
 const at=new Date().toISOString(),action=target==='SUBMIT'?'Submitted':target==='DRAFT'?'Resubmitted':target==='REJECTED'?'Rejected':'Withdrawn';
 const next:StockAdjustment={...row,status:target==='SUBMIT'?'DRAFT':target,...(evidence?{evidence}:{}),lines,date,revision:row.revision+1,updatedAt:at,updatedBy:actor.userId,history:[...row.history,{action,actor:actor.userId,actorName:actor.displayName??actor.userId,at,reason:input.reason,...(evidence?{evidence}:{})}]};
 rows=rows.map(r=>r.id===row.id?next:r);emit();return next;
}
registerRepository('inventoryAdjustments',{repository:stockAdjustmentRepository,read:'inventory.read',commands:{submitClearance:'inventory.adjust',withdrawClearance:'inventory.adjust',rejectClearance:'accounting.post',resubmitClearance:'inventory.adjust',requestClearanceWriteOff:'inventory.adjust',save:'inventory.adjust',post:'accounting.post'},snapshot:()=>({rows,requests}),restore:v=>{rows=v.rows;requests=v.requests;},publish:emit,
 view:principal=>({rows:rows.map(row=>{if(hasPermission(principal,'inventory.cost.read'))return row;const {offsetAccountId:_account,journalId:_journal,...safe}=row;return {...safe,lines:row.lines.map(({unitCost:_cost,valueChange:_value,...line})=>line)};}),requests:[]}),
 validate:(v,snapshots)=>{const state=z.object({rows:z.array(rowSchema),requests:z.array(z.object({id:text,fingerprint:z.string(),rowId:text}).strict())}).strict().parse(v);if(state.requests.some(r=>!state.rows.some(a=>a.id===r.rowId)))throw Error('Adjustment request points to a missing record.');for(const row of state.rows){requireDateKey(row.date);validateClearanceHistory(row,snapshots);if(row.clearanceId){const rule=(snapshots.workspace_clearances as any)?.records.find((r:any)=>r.id===row.clearanceId);if(!rule||row.kind!=='DAMAGE'||row.siteId!==rule.siteId||row.lines.length!==1||row.lines[0].batchId!==rule.batchId||row.lines[0].productId!==rule.productId)throw Error('Clearance write-off source is invalid.');}for(const l of row.lines)if(l.batchId){const source=(snapshots.costMovements as any).movements.find((c:any)=>c.id===l.batchId);if(!source||source.productId!==l.productId||source.siteId!==row.siteId||source.quantityBase<=0||l.quantityBase>=0||l.batchNumber!==(source.referenceNumber||source.costMovementNumber))throw Error('Adjustment batch evidence is invalid.');} if(new Set(row.lines.map(l=>l.productId)).size!==row.lines.length||row.lines.some(l=>Math.abs(q(l.quantityDelta*l.conversionToBase)-l.quantityBase)>0.00001))throw Error('Invalid adjustment quantity evidence.');if(row.status==='POSTED'){const journals=(snapshots.journals as {journalEntries:{id:string;sourceId?:string;sourceType:string}[]}).journalEntries;if(row.journalId&&!journals.some(j=>j.id===row.journalId&&j.sourceId===row.id&&j.sourceType==='INVENTORY_ADJUSTMENT'))throw Error('Adjustment journal evidence is missing.');const im=(snapshots.inventoryMovements as {movements:{id:string;referenceId?:string}[]}).movements,cm=(snapshots.costMovements as {movements:{id:string;referenceId?:string}[]}).movements;for(const l of row.lines){const movement=im.find(m=>m.id===l.inventoryMovementId&&m.referenceId===row.id) as {productId:string;siteId:string;quantityBase:number}|undefined,cost=cm.find(m=>m.id===l.costMovementId&&m.referenceId===row.id) as {productId:string;siteId:string;quantityBase:number;quantityAfter:number;valueChange:number}|undefined;
 if(!movement||!cost||movement.productId!==l.productId||cost.productId!==l.productId||movement.siteId!==row.siteId||cost.siteId!==row.siteId||Math.abs(movement.quantityBase-l.quantityBase)>0.00001||Math.abs(cost.quantityBase-l.quantityBase)>0.00001||l.beforeQuantity===undefined||l.afterQuantity===undefined||l.valueChange===undefined||Math.abs(q(l.beforeQuantity+l.quantityBase)-l.afterQuantity)>0.00001||Math.abs(cost.quantityAfter-l.afterQuantity)>0.00001||Math.abs(cost.valueChange-l.valueChange)>.001)throw Error('Adjustment stock/cost evidence is missing or inconsistent.');if(l.batchId){const allocations=(cost as any).batchAllocations;if(allocations?.length!==1||allocations[0].batchId!==l.batchId||Math.abs(allocations[0].quantity+l.quantityBase)>0.00001)throw Error('Adjustment removed another batch.');}
 }if(row.lines.some(l=>Math.abs(l.valueChange??0)>=.005)&&!row.journalId)throw Error('Adjustment journal is missing.');}}}
});
