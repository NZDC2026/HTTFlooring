import {z} from 'zod';
import type {SalesDocument} from '../types/salesDocument';
export const claimPhotosSchema=z.array(z.object({name:z.string().min(1).max(200),data:z.string().max(1_500_000).regex(/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/).optional()}).strict()).max(5);
export function validateClaim(input:Record<string,string>,invoices?:SalesDocument[]){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!Number.isFinite(Date.parse(input.date)))throw Error('Choose a valid claim date.');
 if(!['New','Checking','Waiting for supplier','Approved','Closed'].includes(input.state))throw Error('Invalid claim state.');
 if(!Number.isSafeInteger(Number(input.boxes))||Number(input.boxes)<1)throw Error('Boxes affected must be a positive whole number.');
 if(!['Phone','Email','Portal','In person'].includes(input.channel))throw Error('Choose how the claim came in.');
 if(!input.notes.trim()||input.notes.length>10000)throw Error('Describe what happened (up to 10,000 characters).');
 claimPhotosSchema.parse(JSON.parse(input.photos||'[]'));
 if(invoices){const invoice=invoices.find(i=>i.id===input.invoiceId&&i.type==='INVOICE'&&i.customerId===input.customerId&&!['DRAFT','VOID'].includes(i.status));if(!invoice||!invoice.lines.some(l=>l.productId===input.productId))throw Error('Choose an issued invoice and product belonging to this customer.');const quantity=invoice.lines.filter(l=>l.productId===input.productId).reduce((n,l)=>n+l.quantity,0);if(Number(input.boxes)>quantity)throw Error('Affected quantity exceeds the invoiced quantity.');}
}
