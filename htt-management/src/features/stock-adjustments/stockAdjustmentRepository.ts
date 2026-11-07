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
const inputLine=z.object({productId:text,unitId:text,quantityDelta:quantity.refine(n=>n!==0,'Quantity cannot be zero.'),unitCost:z.number().finite().nonnegative().optional()}).strict();
export const adjustmentInputSchema=z.object({operationId:text,id:text.optional(),expectedRevision:z.number().int().nonnegative().optional(),siteId:text,date:text,kind:z.enum(['ADJUSTMENT','DAMAGE']).optional(),reason:z.string().trim().min(3).max(2000),lines:z.array(inputLine).min(1).max(100)}).strict();
const savedLine=inputLine.extend({id:text,sku:text,productName:text,unitSymbol:text,conversionToBase:z.number().positive(),quantityBase:quantity,expectedOnHand:quantity,beforeQuantity:quantity.optional(),afterQuantity:quantity.optional(),valueChange:quantity.optional(),inventoryMovementId:text.optional(),costMovementId:text.optional()}).strict();
const rowSchema=z.object({id:text,number:text,status:z.enum(['DRAFT','POSTED']),siteId:text,siteName:text,date:text,kind:z.enum(['ADJUSTMENT','DAMAGE']).optional(),reason:z.string().min(3).max(2000),lines:z.array(savedLine).min(1).max(100),revision:z.number().int().positive(),createdAt:text,createdBy:text,updatedAt:text,updatedBy:text,postedAt:text.optional(),postedBy:text.optional(),offsetAccountId:text.optional(),journalId:text.optional(),history:z.array(z.object({action:z.enum(['Created','Updated','Posted']),actor:text,at:text,reason:z.string()}).strict())}).strict();
export type StockAdjustment=z.infer<typeof rowSchema>;export type AdjustmentInput=z.infer<typeof adjustmentInputSchema>;
let rows:StockAdjustment[]=[],requests:{id:string;fingerprint:string;rowId:string}[]=[];
const listeners=new Set<()=>void>();const emit=()=>listeners.forEach(f=>f());
export function useStockAdjustments(){return useSyncExternalStore(stockAdjustmentRepository.subscribe,stockAdjustmentRepository.getSnapshot,stockAdjustmentRepository.getSnapshot);}
const q=(n:number)=>Math.round(n*10000)/10000,m=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export const stockAdjustmentRepository={
 subscribe(f:()=>void){listeners.add(f);return()=>{listeners.delete(f);};},getSnapshot:()=>rows,getAll:()=>rows,
 save(raw:AdjustmentInput){
  const actor=trustedAuthorization.require('inventory.adjust'),input=adjustmentInputSchema.parse(raw),fingerprint=JSON.stringify(input),retry=requests.find(r=>r.id===input.operationId);
  if(retry){if(retry.fingerprint!==fingerprint)throw Error('Operation ID has already been used with different data.');return rows.find(r=>r.id===retry.rowId)!;}
  requireDateKey(input.date);const site=inventorySiteRepository.getById(input.siteId);if(!site||site.status!=='ACTIVE')throw Error('Select an active warehouse.');
  const old=rows.find(r=>r.id===input.id);if(input.id&&(!old||old.revision!==input.expectedRevision))throw Error('Adjustment changed. Reopen it before saving.');if(old?.status==='POSTED')throw Error('Posted adjustments cannot be edited.');
  if(input.kind==='DAMAGE'&&input.lines.some(l=>l.quantityDelta>=0))throw Error('Damage quantities must reduce stock.');
  const seen=new Set<string>();const lines=input.lines.map(l=>{if(seen.has(l.productId))throw Error('Select each product only once per adjustment.');seen.add(l.productId);const product=productRepository.getById(l.productId),unit=product?.units.find(u=>u.id===l.unitId&&u.active);
   if(!product||product.status!=='ACTIVE'||(product.itemType??'STOCK')!=='STOCK'||!unit)throw Error('Select an active stocked product and unit.');
   if(q(l.quantityDelta)!==l.quantityDelta)throw Error('Use at most four decimal places.');const quantityBase=q(l.quantityDelta*unit.conversionToBase);if(!quantityBase)throw Error('Quantity rounds to zero.');
   if(product.wholePacks&&['BOX','ROLL','BUCKET'].includes(unit.code)&&!Number.isInteger(l.quantityDelta))throw Error('Pack adjustments must use whole packs.');
   if(l.unitCost!==undefined&&!hasPermission(actor,'inventory.cost.read'))throw Error('Cost access is required to enter unit costs.');
   return {...l,id:crypto.randomUUID(),sku:product.sku,productName:product.name,unitSymbol:unit.symbol,conversionToBase:unit.conversionToBase,quantityBase,expectedOnHand:stockRepository.getBalance(site.id,product.id)?.quantityOnHand??0};
  });const now=new Date().toISOString(),id=old?.id??crypto.randomUUID();
  const row:StockAdjustment={id,number:old?.number??`ADJ-${input.date.slice(0,4)}-${String(rows.length+1).padStart(5,'0')}`,status:'DRAFT',siteId:site.id,siteName:site.name,date:input.date,kind:input.kind??'ADJUSTMENT',reason:input.reason,lines,revision:(old?.revision??0)+1,createdAt:old?.createdAt??now,createdBy:old?.createdBy??actor.userId,updatedAt:now,updatedBy:actor.userId,history:[...(old?.history??[]),{action:old?'Updated':'Created',actor:actor.userId,at:now,reason:input.reason}]};
  rows=[row,...rows.filter(r=>r.id!==id)];requests=[...requests,{id:input.operationId,fingerprint,rowId:id}];emit();return row;
 },
 post(raw:unknown){
  const actor=trustedAuthorization.require('accounting.post');trustedAuthorization.require('inventory.cost.read');
  const input=z.object({id:text,expectedRevision:z.number().int().positive(),offsetAccountId:text,unitCosts:z.record(z.string(),z.number().finite().nonnegative()).optional()}).strict().parse(raw);
  const row=rows.find(r=>r.id===input.id);if(!row)throw Error('Adjustment not found.');if(row.status==='POSTED')return row;if(row.revision!==input.expectedRevision)throw Error('Adjustment changed. Reopen before posting.');
  assertCurrentCrossModuleWriteSafe();requireDateKey(row.date);assertPostingPeriod(row.date);if(row.date>businessDateKey(new Date().toISOString()))throw Error('A future adjustment cannot be posted.');
  const site=inventorySiteRepository.getById(row.siteId);if(!site||site.status!=='ACTIVE')throw Error('Warehouse is not active.');
  const offset=accountRepository.getAll().find(a=>a.id===input.offsetAccountId&&a.active&&a.type==='EXPENSE');if(!offset)throw Error('Select an active expense account for inventory adjustment differences.');
  const inventory=accountRepository.requireBySystemRole('INVENTORY');if(!inventory.active)throw Error('Inventory control account is inactive.');
  const prepared=row.lines.map(l=>{const product=productRepository.getById(l.productId),unit=product?.units.find(u=>u.id===l.unitId&&u.active),before=stockRepository.getBalance(row.siteId,l.productId)?.quantityOnHand??0;
   if(!product||product.status!=='ACTIVE'||(product.itemType??'STOCK')!=='STOCK'||!unit||unit.conversionToBase!==l.conversionToBase)throw Error('Product or unit changed. Refresh the draft.');
   if(Math.abs(before-l.expectedOnHand)>0.00001)throw Error(`Stock changed for ${l.sku}. Update the draft before posting.`);
   const costBalance=inventoryCostBalanceRepository.getBalance(row.siteId,l.productId);if(Math.abs((costBalance?.quantityOnHand??0)-before)>0.00001)throw Error('Stock and cost quantities differ. Reconcile before adjusting.');
   if(inventoryCostMovementRepository.getAll().some(c=>c.siteId===row.siteId&&c.productId===l.productId&&businessDateKey(c.occurredAt)>row.date))throw Error('Adjustment date cannot precede later stock activity.');
   if(q(before+l.quantityBase)<0)throw Error(`Insufficient stock for ${l.sku}.`);
   const unitCost=input.unitCosts?.[l.productId]??l.unitCost;if(l.quantityBase>0&&unitCost===undefined)throw Error(`Enter the actual unit cost for ${l.sku}.`);
   return {l,product,unit,before,unitCost};
  });
  const lines=prepared.map(({l,product,unit,before,unitCost})=>{const positive=l.quantityBase>0,amount=Math.abs(l.quantityBase),quantity=Math.abs(l.quantityDelta);
   if(positive)stockRepository.receive({siteId:row.siteId,productId:product.id,baseUnitId:product.baseUnitId,quantityBase:amount});else stockRepository.issue({siteId:row.siteId,productId:product.id,baseUnitId:product.baseUnitId,quantityBase:amount});
   const movement=inventoryMovementRepository.create({movementType:positive?'ADJUSTMENT_IN':'ADJUSTMENT_OUT',siteId:row.siteId,productId:product.id,baseUnitId:product.baseUnitId,quantityBase:l.quantityBase,transactionUnitId:unit.id,transactionUnitSymbol:unit.symbol,transactionQuantity:l.quantityDelta,conversionToBase:unit.conversionToBase,referenceType:'MANUAL',referenceId:row.id,referenceNumber:row.number,occurredAt:row.date,notes:row.reason});
   const ref={siteId:row.siteId,productId:product.id,unitId:unit.id,quantity,referenceType:'MANUAL' as const,referenceId:row.id,referenceNumber:row.number,inventoryMovementId:movement.id,occurredAt:row.date,notes:row.reason};
   const cost=positive?receiveInventoryCost({...ref,movementType:'ADJUSTMENT_IN',transactionUnitCost:unitCost!}).movement:issueInventoryCost({...ref,movementType:'ADJUSTMENT_OUT'}).movement;
   return {...l,...(positive?{unitCost}:{}),beforeQuantity:before,afterQuantity:q(before+l.quantityBase),valueChange:cost.valueChange,inventoryMovementId:movement.id,costMovementId:cost.id};
  });
  const journalLines=lines.filter(l=>Math.abs(l.valueChange||0)>=.005).flatMap(l=>{const v=m(l.valueChange||0);return [{accountId:inventory.id,description:l.sku,debit:v>0?v:0,credit:v<0?-v:0},{accountId:offset.id,description:row.reason,debit:v<0?-v:0,credit:v>0?v:0}];});
  const journal=journalLines.length?journalEntryRepository.post({journalDate:row.date,description:`Inventory adjustment ${row.number}`,reference:row.number,sourceType:'INVENTORY_ADJUSTMENT',sourceId:row.id,lines:journalLines}):undefined;
  const now=new Date().toISOString(),next:StockAdjustment={...row,status:'POSTED',lines,offsetAccountId:offset.id,journalId:journal?.id,postedAt:now,postedBy:actor.userId,updatedAt:now,updatedBy:actor.userId,revision:row.revision+1,history:[...row.history,{action:'Posted',actor:actor.userId,at:now,reason:row.reason}]};rows=rows.map(r=>r.id===row.id?next:r);emit();return next;
 }
};
registerRepository('inventoryAdjustments',{repository:stockAdjustmentRepository,read:'inventory.read',commands:{save:'inventory.adjust',post:'accounting.post'},snapshot:()=>({rows,requests}),restore:v=>{rows=v.rows;requests=v.requests;},publish:emit,
 view:principal=>({rows:rows.map(row=>{if(hasPermission(principal,'inventory.cost.read'))return row;const {offsetAccountId:_account,journalId:_journal,...safe}=row;return {...safe,lines:row.lines.map(({unitCost:_cost,valueChange:_value,...line})=>line)};}),requests:[]}),
 validate:(v,snapshots)=>{const state=z.object({rows:z.array(rowSchema),requests:z.array(z.object({id:text,fingerprint:z.string(),rowId:text}).strict())}).strict().parse(v);if(state.requests.some(r=>!state.rows.some(a=>a.id===r.rowId)))throw Error('Adjustment request points to a missing record.');for(const row of state.rows){requireDateKey(row.date);if(new Set(row.lines.map(l=>l.productId)).size!==row.lines.length||row.lines.some(l=>Math.abs(q(l.quantityDelta*l.conversionToBase)-l.quantityBase)>0.00001))throw Error('Invalid adjustment quantity evidence.');if(row.status==='POSTED'){const journals=(snapshots.journals as {journalEntries:{id:string;sourceId?:string;sourceType:string}[]}).journalEntries;if(row.journalId&&!journals.some(j=>j.id===row.journalId&&j.sourceId===row.id&&j.sourceType==='INVENTORY_ADJUSTMENT'))throw Error('Adjustment journal evidence is missing.');const im=(snapshots.inventoryMovements as {movements:{id:string;referenceId?:string}[]}).movements,cm=(snapshots.costMovements as {movements:{id:string;referenceId?:string}[]}).movements;for(const l of row.lines){const movement=im.find(m=>m.id===l.inventoryMovementId&&m.referenceId===row.id) as {productId:string;siteId:string;quantityBase:number}|undefined,cost=cm.find(m=>m.id===l.costMovementId&&m.referenceId===row.id) as {productId:string;siteId:string;quantityBase:number;quantityAfter:number;valueChange:number}|undefined;
 if(!movement||!cost||movement.productId!==l.productId||cost.productId!==l.productId||movement.siteId!==row.siteId||cost.siteId!==row.siteId||Math.abs(movement.quantityBase-l.quantityBase)>0.00001||Math.abs(cost.quantityBase-l.quantityBase)>0.00001||l.beforeQuantity===undefined||l.afterQuantity===undefined||l.valueChange===undefined||Math.abs(q(l.beforeQuantity+l.quantityBase)-l.afterQuantity)>0.00001||Math.abs(cost.quantityAfter-l.afterQuantity)>0.00001||Math.abs(cost.valueChange-l.valueChange)>.001)throw Error('Adjustment stock/cost evidence is missing or inconsistent.');
 }if(row.lines.some(l=>Math.abs(l.valueChange??0)>=.005)&&!row.journalId)throw Error('Adjustment journal is missing.');}}}
});
