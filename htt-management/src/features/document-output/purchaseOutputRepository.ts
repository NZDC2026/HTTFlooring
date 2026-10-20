import {useSyncExternalStore} from 'react';
import {z} from 'zod';
import {registerRepository} from '../security/repositoryHost';
import {trustedAuthorization} from '../security/trustedAuthorization';
import {hasPermission, type VerifiedPrincipal} from '../security/rbac';
import {purchaseOrderRepository} from '../purchases/data/purchaseOrderRepository';
import {supplierPaymentRepository} from '../purchases/data/supplierPaymentRepository';
import {supplierRepository} from '../contacts/data/supplierRepository';
import {businessSettings, configurationRows} from '../business-workspace/configurationState';
import {requireDateKey} from '../../lib/businessDate';
const text=z.string().min(1).max(200),value=z.string().max(20000),amount=z.number().finite().nonnegative();
export const purchaseOutputKinds=['PURCHASE_ORDER','REMITTANCE'] as const;
export type PurchaseOutputKind=typeof purchaseOutputKinds[number];
const requestSchema=z.object({operationId:text,kind:z.enum(purchaseOutputKinds),sourceId:text,expectedRevision:z.string().min(1).max(500000),templateId:text.optional()}).strict();
const lineSchema=z.object({id:text,description:value,reference:value,quantity:z.number().finite().positive(),unit:value,unitPrice:amount,net:amount,tax:amount,total:amount,taxCode:value.optional(),taxRate:z.number().finite().min(0).max(1).optional()}).strict();
const templateSchema=z.object({id:text,revision:text,name:value,subject:value,body:value,footer:value,paper:z.enum(['A4','Letter'])}).strict();
const artifactSchema=z.object({id:text,operationId:text,requestFingerprint:z.string().max(1000000),kind:z.enum(purchaseOutputKinds),sourceId:text,sourceRevision:z.string().min(1).max(500000),preparedAt:text,preparedBy:text,documentNumber:text,status:text,date:text,expectedDeliveryDate:value.optional(),reference:value.optional(),notes:value.optional(),supplierId:text,supplierName:value,supplierCode:value,supplierEmail:value.optional(),supplierContact:value.optional(),supplierAddress:value,supplierMetadataAt:text,issuer:z.object({name:value,identifier:value,address:value,email:value,currency:text}).strict(),method:value.optional(),noncash:z.boolean(),lines:z.array(lineSchema).min(1),subtotal:amount,tax:amount,total:amount,template:templateSchema,subject:value,body:value}).strict();
export type PreparedPurchaseOutput=z.infer<typeof artifactSchema>;
export const purchaseTemplateKind=(kind:PurchaseOutputKind)=>kind==='PURCHASE_ORDER'?'Purchase order':'Remittance';
export function purchaseSource(kind:PurchaseOutputKind,id:string){const source=kind==='PURCHASE_ORDER'?purchaseOrderRepository.getById(id):supplierPaymentRepository.getById(id);if(!source)throw new Error('Purchase output source was not found.');return source;}
export function purchaseSourceRevision(kind:PurchaseOutputKind,id:string){const source=purchaseSource(kind,id),supplier=supplierRepository.getById(source.supplierId);if(!supplier)throw new Error('Source supplier was not found.');return JSON.stringify([source,supplier]);}
const canRead=(actor:VerifiedPrincipal|null,kind:PurchaseOutputKind)=>hasPermission(actor,'accounting.read')||(kind==='PURCHASE_ORDER'&&hasPermission(actor,'purchases.write'));
let artifacts:PreparedPurchaseOutput[]=[],templateChoices:{id:string;name:string;kind:string}[]=[],version=0;const listeners=new Set<()=>void>(),emit=()=>{version++;listeners.forEach(f=>f());};
export function usePurchaseOutputs(){useSyncExternalStore(f=>{listeners.add(f);return()=>{listeners.delete(f);};},()=>version,()=>version);return artifacts;}
export const getPurchaseTemplateOptions=()=>templateChoices;
export function purchaseTemplates(){return(configurationRows.templates??[]).filter(t=>t.status==='Active'&&['Purchase order','Remittance'].includes(t.kind));}
function merge(template:string,fields:Record<string,string>){return template.replace(/\{\{\s*([^{}]+?)\s*\}\}/g,(_,token:string)=>{if(!Object.hasOwn(fields,token))throw new Error('Unsupported purchase template token: '+token);return fields[token];});}
export function validatePurchaseOutput(raw:unknown){
 const a=artifactSchema.parse(raw),request=requestSchema.parse(JSON.parse(a.requestFingerprint));
 if(request.operationId!==a.operationId||request.kind!==a.kind||request.sourceId!==a.sourceId||request.expectedRevision!==a.sourceRevision||(request.templateId??'built-in')!==a.template.id||!Number.isFinite(Date.parse(a.preparedAt)))throw new Error('Purchase output source metadata mismatch.');
 const [source,supplier]=JSON.parse(a.sourceRevision);
 if(!source||!supplier||source.id!==a.sourceId||source.supplierId!==a.supplierId||supplier.id!==a.supplierId||source.status!==a.status||source.supplierName!==a.supplierName||supplier.email!==a.supplierEmail||supplier.updatedAt!==a.supplierMetadataAt)throw new Error('Purchase output captured source mismatch.');
 if(a.kind==='PURCHASE_ORDER'?(source.purchaseOrderNumber!==a.documentNumber||source.orderDate!==a.date||source.totals.total!==a.total||JSON.stringify(source.lines.map((l:any)=>[l.id,l.orderedQuantity,l.unitCost,l.lineSubtotal,l.taxAmount,l.lineTotal]))!==JSON.stringify(a.lines.map(l=>[l.id,l.quantity,l.unitPrice,l.net,l.tax,l.total]))):(source.paymentNumber!==a.documentNumber||source.paymentDate!==a.date||source.amount!==a.total||!!source.prepaymentApplicationId!==a.noncash||JSON.stringify(source.allocations.map((l:any)=>[l.id,l.billNumber,l.supplierInvoiceNumber,l.amount]))!==JSON.stringify(a.lines.map(l=>[l.id,l.description,l.reference,l.total]))))throw new Error('Purchase output differs from its captured source.');
 requireDateKey(a.date);if(a.expectedDeliveryDate)requireDateKey(a.expectedDeliveryDate);
 const cents=(n:number)=>Math.round((n+Number.EPSILON)*100);
 for(const l of a.lines){if(cents(l.net+l.tax)!==cents(l.total)||Math.abs(l.net+l.tax-l.total)>.000001)throw new Error('Invalid purchase output line total.');if(a.kind==='REMITTANCE'&&(l.quantity!==1||l.tax!==0||l.unitPrice!==l.total))throw new Error('Invalid remittance allocation.');}
 if(cents(a.lines.reduce((n,l)=>n+l.net,0))!==cents(a.subtotal)||cents(a.lines.reduce((n,l)=>n+l.tax,0))!==cents(a.tax)||cents(a.lines.reduce((n,l)=>n+l.total,0))!==cents(a.total))throw new Error('Invalid purchase output totals.');
 if(a.kind==='PURCHASE_ORDER'&&a.noncash)throw new Error('Purchase order cannot be a noncash payment.');
 return a;
}
export const purchaseOutputRepository={prepare(raw:z.input<typeof requestSchema>):PreparedPurchaseOutput{
 const input=requestSchema.parse(raw),actor=trustedAuthorization.require('purchases.read');
 if(!canRead(actor,input.kind)||(input.kind==='REMITTANCE'&&!hasPermission(actor,'accounting.post'))||(input.kind==='PURCHASE_ORDER'&&!hasPermission(actor,'accounting.post')&&!hasPermission(actor,'purchases.write')))throw new Error('Permission denied: purchase document preparation.');
 const fingerprint=JSON.stringify(input),prior=artifacts.find(a=>a.operationId===input.operationId);if(prior){if(prior.requestFingerprint!==fingerprint)throw new Error('Operation ID was used for different output data.');return prior;}
 const source=purchaseSource(input.kind,input.sourceId),supplier=supplierRepository.getById(source.supplierId)!;
 if(purchaseSourceRevision(input.kind,input.sourceId)!==input.expectedRevision)throw new Error('Source or supplier changed. Refresh before preparing output.');
 const settings=businessSettings() as Record<string,string>,row=input.templateId?purchaseTemplates().find(t=>t.id===input.templateId&&t.kind===purchaseTemplateKind(input.kind)):undefined;
 if(input.templateId&&!row)throw new Error('Select an active matching purchase template.');
 const po=input.kind==='PURCHASE_ORDER'?purchaseOrderRepository.getById(input.sourceId)!:undefined,payment=input.kind==='REMITTANCE'?supplierPaymentRepository.getById(input.sourceId)!:undefined;
 const lines:PreparedPurchaseOutput['lines']=po?po.lines.map(l=>({id:l.id,description:l.description,reference:l.sku,quantity:l.orderedQuantity,unit:l.unitSymbol,unitPrice:l.unitCost,net:l.lineSubtotal,tax:l.taxAmount,total:l.lineTotal,taxCode:l.taxCode,taxRate:l.taxRate})):payment!.allocations.map(l=>({id:l.id,description:l.billNumber,reference:l.supplierInvoiceNumber,quantity:1,unit:'allocation',unitPrice:l.amount,net:l.amount,tax:0,total:l.amount}));
 const total=po?.totals.total??payment!.amount,fields={documentNumber:po?.purchaseOrderNumber??payment!.paymentNumber,supplierName:source.supplierName,companyName:settings.companyName,currency:settings.currency,total:total.toFixed(2),documentDate:po?.orderDate??payment!.paymentDate,expectedDeliveryDate:po?.expectedDeliveryDate??'',reference:po?.supplierReference??payment?.reference??''};
 const template={id:row?.id??'built-in',revision:row?.revision??'1',name:row?.name??'Standard '+purchaseTemplateKind(input.kind),subject:row?.subject??'{{documentNumber}} · {{companyName}}',body:row?.body??'Dear {{supplierName}},\nPlease review {{documentNumber}} for {{currency}} {{total}}.',footer:row?.footer??'',paper:row?.paper==='Letter'?'Letter' as const:'A4' as const};
 const result:PreparedPurchaseOutput={id:crypto.randomUUID(),operationId:input.operationId,requestFingerprint:fingerprint,kind:input.kind,sourceId:input.sourceId,sourceRevision:input.expectedRevision,preparedAt:new Date().toISOString(),preparedBy:actor.userId,documentNumber:fields.documentNumber,status:source.status,date:fields.documentDate,expectedDeliveryDate:po?.expectedDeliveryDate,reference:fields.reference,notes:source.notes,supplierId:supplier.id,supplierName:source.supplierName,supplierCode:source.supplierCode,supplierEmail:supplier.email,supplierContact:supplier.contactName,supplierAddress:[supplier.addressLine1,supplier.addressLine2,supplier.suburb,supplier.state,supplier.postcode,supplier.country].filter(Boolean).join(', '),supplierMetadataAt:supplier.updatedAt,issuer:{name:settings.companyName,identifier:settings.identifier??'',address:settings.address??'',email:settings.email??'',currency:settings.currency},method:payment?.method,noncash:!!payment?.prepaymentApplicationId,lines,subtotal:po?.totals.subtotal??total,tax:po?.totals.taxAmount??0,total,template:{...template,footer:merge(template.footer,fields)},subject:merge(template.subject,fields),body:merge(template.body,fields)};
 validatePurchaseOutput(result);artifacts=[result,...artifacts];emit();return result;
}};
registerRepository('preparedPurchaseOutputs',{repository:purchaseOutputRepository,read:'purchases.read',commands:{prepare:'purchases.read'},snapshot:()=>({artifacts,templates:purchaseTemplates().map(t=>({id:t.id,name:t.name,kind:t.kind}))}),restore:v=>{artifacts=v.artifacts;templateChoices=v.templates;},publish:emit,view:actor=>({artifacts:artifacts.filter(a=>canRead(actor,a.kind)),templates:purchaseTemplates().filter(t=>canRead(actor,t.kind==='Purchase order'?'PURCHASE_ORDER':'REMITTANCE')).map(t=>({id:t.id,name:t.name,kind:t.kind}))}),validate:(v,snapshots)=>{
 const rows=z.object({artifacts:z.array(artifactSchema),templates:z.array(z.object({id:text,name:value,kind:text}).strict())}).strict().parse(v).artifacts,ops=new Set<string>(),ids=new Set<string>(),s=snapshots as Record<string,any>;
 for(const a of rows){validatePurchaseOutput(a);if(ids.has(a.id)||ops.has(a.operationId))throw new Error('Duplicate purchase output.');ids.add(a.id);ops.add(a.operationId);const source=(a.kind==='PURCHASE_ORDER'?s.purchaseOrders.purchaseOrders:s.supplierPayments.supplierPayments).find((r:any)=>r.id===a.sourceId);if(!source||source.supplierId!==a.supplierId)throw new Error('Invalid purchase output source reference.');}
}});
