import {z} from 'zod';
export const customerSetupSchema=z.object({
 gstRegistered:z.enum(['Yes','No','']).default(''),salesRep:z.string().max(200).default(''),accountsEmail:z.string().trim().refine(v=>!v||z.email().safeParse(v).success,'Enter a valid accounts email').default(''),
 defaultDiscount:z.number().finite().min(0).max(100).default(0),creditApplication:z.enum(['Not required','Pending','Received','Approved']).default('Not required'),autoCreditHold:z.boolean().default(true),directorGuarantee:z.boolean().default(false),
 contactPreferences:z.array(z.object({contactId:z.string(),role:z.enum(['Primary contact','Accounts','Other']),invoices:z.boolean(),statements:z.boolean(),orders:z.boolean(),delivery:z.boolean()}).strict()).max(50).default([]),
 deliveryPreferences:z.array(z.object({siteId:z.string(),contact:z.string().max(200),hours:z.string().max(200),dispatch:z.string().max(200),freight:z.string().max(200),unloading:z.array(z.string().max(80)).max(4),instructions:z.string().max(2000)}).strict()).max(50).default([]),
}).strict();
export type CustomerSetup=z.infer<typeof customerSetupSchema>;
