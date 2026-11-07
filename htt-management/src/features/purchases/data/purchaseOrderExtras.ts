import { z } from 'zod';
import { activeTaxRate,configurationRows } from '../../business-workspace/configurationState';
const amount=z.number().finite().nonnegative().max(1e10);
const input=z.object({freight:amount,insurance:amount,taxCode:z.string().min(1)}).strict();
export type PurchaseChargeDraft=z.infer<typeof input>;
export const purchaseChargesSchema=input.extend({taxRate:z.number().finite().min(0).max(1),taxAmount:amount}).strict();
export type PurchaseCharges=z.infer<typeof purchaseChargesSchema>;
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function purchaseCharges(raw:PurchaseChargeDraft|undefined,rate=1):PurchaseCharges|undefined{
 if(!raw)return undefined;const value=input.parse(raw),tax=configurationRows['tax-codes']?.find(r=>r.code===value.taxCode&&r.status==='Active');
 if(!tax)throw Error('Select an active tax code for freight and insurance.');
 if(!Number.isFinite(rate)||rate<=0)throw Error('Enter a valid exchange rate.');
 const freight=round(value.freight*rate),insurance=round(value.insurance*rate),taxRate=activeTaxRate(value.taxCode);
 return {...value,freight,insurance,taxRate,taxAmount:round((freight+insurance)*taxRate)};
}
export const purchaseAttachmentSchema=z.object({id:z.string().min(1),name:z.string().min(1).max(180),mime:z.enum(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png']),size:z.number().int().positive().max(10*1024*1024),data:z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/).max(14*1024*1024)}).strict().refine(a=>{const padding=a.data.endsWith('==')?2:a.data.endsWith('=')?1:0;return a.data.length%4===0&&a.data.length/4*3-padding===a.size;},'Attachment data does not match its size');
export type PurchaseAttachment=z.infer<typeof purchaseAttachmentSchema>;
export function purchaseAttachments(raw:PurchaseAttachment[]|undefined){if(raw===undefined)return undefined;const files=z.array(purchaseAttachmentSchema).max(10).parse(raw);if(files.reduce((n,f)=>n+f.size,0)>10*1024*1024)throw Error('Attachments must total 10 MB or less.');if(new Set(files.map(f=>f.id)).size!==files.length)throw Error('Duplicate attachment.');return files;}
