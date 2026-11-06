import { z } from "zod";
import type { CustomerContact } from "../types/customer";
export const accountContactSchema=z.object({
 id:z.string().min(1),firstName:z.string().trim().max(160),lastName:z.string().trim().max(80),
 email:z.string().trim().refine(v=>!v||z.email().safeParse(v).success,"Enter a valid email address"),
 phone:z.string().trim().max(40).optional(),mobile:z.string().trim().max(40).optional(),
 jobTitle:z.string().trim().max(100).optional(),locationId:z.string().optional(),isPrimary:z.boolean(),isAccounting:z.boolean().optional(),
}).refine(c=>!!`${c.firstName} ${c.lastName}`.trim(),"Contact name is required");
export const accountContactsSchema=z.array(accountContactSchema).superRefine((contacts,ctx)=>{
 const ids=new Set<string>();for(const c of contacts){if(ids.has(c.id))ctx.addIssue({code:'custom',message:'Duplicate contact ID'});ids.add(c.id);}
 if(contacts.filter(c=>c.isPrimary).length>1)ctx.addIssue({code:'custom',message:'Choose one primary contact'});
 if(contacts.filter(c=>c.isAccounting).length>1)ctx.addIssue({code:'custom',message:'Choose one accountant contact'});
});
export function normalizeAccountContacts(value:unknown):CustomerContact[]{
 const contacts=accountContactsSchema.parse(value);
 return contacts.map((c,i)=>({...c,isPrimary:contacts.some(x=>x.isPrimary)?c.isPrimary:i===0}));
}
export function supplierContacts(s:{contacts?:CustomerContact[];contactName?:string;email?:string;phone?:string}):CustomerContact[]{
 if(s.contacts!==undefined)return s.contacts;
 return s.contactName||s.email?[{id:'legacy-primary',firstName:s.contactName||'Accounts',lastName:'',email:s.email||'',phone:s.phone||'',isPrimary:true}]:[];
}
