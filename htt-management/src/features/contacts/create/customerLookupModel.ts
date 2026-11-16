import {z} from 'zod';
export const australianStates=['ACT','NSW','NT','QLD','SA','TAS','VIC','WA'] as const;
export function normaliseAbn(raw:string){const n=raw.replace(/\s/g,'');if(!/^\d{11}$/.test(n)||[...n].reduce((sum,c,i)=>sum+(Number(c)-(i===0?1:0))*[10,1,3,5,7,9,11,13,15,17,19][i],0)%89!==0)throw Error('Enter a valid 11-digit ABN, including its checksum.');return n;}
export const abrResultSchema=z.object({abn:z.string().regex(/^\d{11}$/),name:z.string().min(1).max(200),status:z.enum(['Active','Cancelled']),gstRegistered:z.enum(['Yes','No']),state:z.enum(australianStates).optional(),postcode:z.string().regex(/^\d{4}$/).optional(),source:z.literal('ABR')}).strict();
export type AbrResult=z.infer<typeof abrResultSchema>;
export const lookupAddressSchema=z.object({addressLine1:z.string().min(1).max(160),addressLine2:z.string().max(160),suburb:z.string().min(1).max(100),state:z.enum(australianStates),postcode:z.string().regex(/^\d{4}$/),country:z.literal('Australia')}).strict();
export type LookupAddress=z.infer<typeof lookupAddressSchema>;
export const suggestionSchema=z.object({id:z.string().min(1).max(300),label:z.string().min(1).max(500)}).strict();
export type AddressSuggestion=z.infer<typeof suggestionSchema>;
export const lookupStatusSchema=z.object({abrConfigured:z.boolean(),addressesConfigured:z.boolean()}).strict();
export const suggestionInput=z.object({query:z.string().trim().min(3).max(200),sessionToken:z.uuid()}).strict();
export const detailInput=z.object({id:z.string().min(1).max(300).regex(/^[a-zA-Z0-9_-]+$/),sessionToken:z.uuid()}).strict();
export const abrInput=z.object({abn:z.string().max(30)}).strict();
export const lookupScenarios=['Success','Not GST registered','Cancelled ABN','Not found','Service unavailable','Slow response'] as const;
export type LookupScenario=typeof lookupScenarios[number];
/** Fill only the draft values that have not been edited since this lookup started. ABR never supplies a street. */
export function applyAbrResult<T extends {abn:string;businessName:string;setup?:{gstRegistered:''|'Yes'|'No'};billingAddress?:{addressLine1:string;state:string;postcode:string}}>(current:T,before:T,result:AbrResult):T{
 if(current.abn.replace(/\s/g,'')!==result.abn||result.status!=='Active')return current;
 const next={...current,businessName:current.businessName===before.businessName?result.name:current.businessName,setup:current.setup?{...current.setup,gstRegistered:current.setup.gstRegistered===before.setup?.gstRegistered?result.gstRegistered:current.setup.gstRegistered}:current.setup};
 if(current.billingAddress&&before.billingAddress&&!current.billingAddress.addressLine1&&JSON.stringify(current.billingAddress)===JSON.stringify(before.billingAddress))next.billingAddress={...current.billingAddress,...(result.state?{state:result.state}:{}),...(result.postcode?{postcode:result.postcode}:{})};
 return next as T;
}
