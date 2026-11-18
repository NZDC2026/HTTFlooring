import {z} from 'zod';
export const documentTypes=['Quote','Sales order','Tax invoice','Delivery docket','Credit note','Statement','Purchase order','Price list'] as const;
export type DocumentType=typeof documentTypes[number];
export const showOptions=['Logo','ABN & legal name','Address & contact','QR code','Payment terms','Bank details','Signature lines'] as const;
export const columnOptions=['SKU','Colour','Batch','m²','Photo','Discount','Unit price','Amount'] as const;
const flags=z.record(z.string(),z.boolean());
export const templateDesignSchema=z.object({layout:z.enum(['HTT','Classic','Modern','Compact']),colour:z.string().regex(/^#[0-9a-fA-F]{6}$/),title:z.string().trim().min(1).max(100),show:flags.refine(v=>Object.keys(v).every(k=>(showOptions as readonly string[]).includes(k))),columns:flags.refine(v=>Object.keys(v).every(k=>(columnOptions as readonly string[]).includes(k))),note:z.string().max(3000),footer:z.string().max(2000)}).strict();
export type TemplateDesign=z.infer<typeof templateDesignSchema>;
export const defaultNote='Prices are valid for 30 days and exclude GST unless shown. Timber is a natural product — shade can vary between batches.';
export const defaultFooter='Thank you for your business. Goods remain our property until paid in full.';
export function defaultDesign(type:string):TemplateDesign{
 const design:TemplateDesign={layout:'HTT',colour:'#205b35',title:type==='Credit note'?'Adjustment note':type,show:Object.fromEntries(showOptions.map(v=>[v,v!=='Bank details'])),columns:Object.fromEntries(columnOptions.map(v=>[v,v!=='Batch'])),note:defaultNote,footer:defaultFooter};
 if(['Sales order','Tax invoice','Credit note','Statement'].includes(type)){design.show['Signature lines']=false;design.columns.Photo=false;}
 if(type==='Sales order')design.note='Please check this order and tell us of any changes before it is picked.';
 if(type==='Tax invoice'){design.show['Bank details']=true;design.columns.Batch=true;design.note='Please check the boxes and batch numbers before installing. Report damage or short supply within 48 hours.';}
 if(type==='Delivery docket'){design.show['Payment terms']=false;design.columns={...design.columns,Batch:true,Photo:false,Discount:false,'Unit price':false,Amount:false};design.note='Check the boxes and batch numbers before installing — different batches can show a shade difference.';design.footer='';}
 if(type==='Credit note')design.note='This credit can be used against future invoices or refunded on request.';
 if(type==='Purchase order'){design.show['QR code']=false;design.show['Signature lines']=false;design.columns.Photo=false;design.columns.Discount=false;design.note='Please confirm this order and the ship date within 3 days. Every box must show the batch number and production date. Send packing list and invoice before the vessel leaves.';design.footer='Deliver to: HTT Flooring, 12 Industrial Drive, Dandenong South VIC 3175, Australia';}
 if(type==='Price list'){design.show['QR code']=false;design.show['Signature lines']=false;design.columns.Discount=false;design.columns.Amount=false;design.note='Prices per box, ex GST, valid from the date above until further notice.';design.footer='Call us on 03 9706 0000 or email sales@httflooring.com.au to order.';}
 if(type==='Statement'){design.show['Bank details']=true;design.note='Please pay overdue amounts now. Accounts more than 30 days overdue may be put on hold.';}
 return design;
}
export const templateKind:Record<DocumentType,string>={'Quote':'Quotation','Sales order':'Sales order','Tax invoice':'Invoice','Delivery docket':'Delivery docket','Credit note':'Credit note','Statement':'Customer statement','Purchase order':'Purchase order','Price list':'Price list'};
export function readDesign(raw:string|undefined,type:string){return raw?templateDesignSchema.parse(JSON.parse(raw)):defaultDesign(type);}
export const escapeTemplate=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function sampleMerge(text:string){return text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g,(_m,k)=>({documentNumber:'QT-2004',customerName:'Coastal Timber Floors',companyName:'HTT Flooring',currency:'AUD',total:'6,774.22'}[k as string]??'{{'+k+'}}'));}
