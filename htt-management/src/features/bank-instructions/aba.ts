import { z } from 'zod';
import { requireDateKey,businessDateKey } from '../../lib/businessDate';
const chars=/^[A-Za-z0-9 !#$%&'()*+,\-./:;=?@_]+$/;
export const abaText=(max:number)=>z.string().trim().min(1).max(max).regex(chars,'Use supported ASCII bank-file characters; do not truncate or transliterate account names silently.');
export const bsbSchema=z.string().regex(/^\d{3}-\d{3}$/).refine(v=>!['000-000','999-999'].includes(v),'Enter a genuine BSB in nnn-nnn form.');
export const accountSchema=z.string().regex(/^\d{1,9}$/).refine(v=>Number(v)>0,'Preserve leading zeros and use a nonzero account number.');
export const payerSchema=z.object({bankAccountId:z.string().min(1).max(200),institution:z.enum(['NAB','CBA']),bsb:bsbSchema,account:accountSchema,userId:z.string().regex(/^\d{6}$/).refine(v=>v!=='000000'),userName:abaText(26),remitter:abaText(16),description:abaText(12)}).strict();
export const payeeSchema=z.object({bsb:bsbSchema,account:accountSchema,title:abaText(32)}).strict();
export const creditSchema=payeeSchema.extend({beneficiaryId:z.string().min(1).max(200),amount:z.number().finite().positive().refine(n=>Number.isSafeInteger(Math.round(n*100))&&n===Math.round(n*100)/100),reference:abaText(18),code:z.enum(['50','53'])}).strict();
export type AbaPayer=z.infer<typeof payerSchema>;
export type AbaCredit=z.infer<typeof creditSchema>;
function numeric(n:number,width:number){if(!Number.isSafeInteger(n)||n<0||String(n).length>width)throw new Error('ABA numeric field or total overflow.');return String(n).padStart(width,'0');}
const left=(v:string,width:number)=>{if(v.length>width)throw new Error('ABA text overflow.');return v.padEnd(width,' ');};
const right=(v:string,width:number)=>v.padStart(width,' ');
export function checkProcessingDate(date:string,payer:AbaPayer,today=businessDateKey(new Date().toISOString())){requireDateKey(date);requireDateKey(today);if(date<'2000-01-01'||date>'2099-12-31')throw new Error('ABA processing year must be 2000–2099.');const days=(Date.parse(date+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000;if(days<(payer.institution==='NAB'?-7:-4)||days>(payer.institution==='NAB'?90:419))throw new Error('Processing date is outside this bank profile’s supported submission window.');}
export function buildAba(rawPayer:AbaPayer,date:string,rawCredits:AbaCredit[]){const payer=payerSchema.parse(rawPayer),credits=z.array(creditSchema).min(1).max(500).parse(rawCredits);requireDateKey(date);if(date<'2000-01-01'||date>'2099-12-31')throw new Error('Invalid ABA year.');const total=credits.reduce((n,c)=>n+Math.round(c.amount*100),0);numeric(total,10);if(new Set(credits.map(c=>c.beneficiaryId)).size!==credits.length)throw new Error('Only one consolidated credit per beneficiary is allowed.');if(credits.some(c=>c.bsb===payer.bsb&&c.account===payer.account))throw new Error('Beneficiary must differ from the paying account.');
 const header='0'+' '.repeat(17)+'01'+payer.institution+' '.repeat(7)+left(payer.userName,26)+payer.userId+left(payer.description,12)+date.slice(8,10)+date.slice(5,7)+date.slice(2,4)+' '.repeat(40);
 const detail=(bsb:string,account:string,title:string,reference:string,amount:number,code:string)=>'1'+bsb+right(account,9)+' '+code+numeric(amount,10)+left(title,32)+left(reference,18)+payer.bsb+right(payer.account,9)+left(payer.remitter,16)+'00000000';
 const rows=[header,...credits.map(c=>detail(c.bsb,c.account,c.title,c.reference,Math.round(c.amount*100),c.code)),detail(payer.bsb,payer.account,payer.userName,'BATCH DEBIT',total,'13'),'7'+'999-999'+' '.repeat(12)+'0000000000'+numeric(total,10)+numeric(total,10)+' '.repeat(24)+numeric(credits.length+1,6)+' '.repeat(40)];
 if(rows.some(r=>r.length!==120||!/^[\x20-\x7e]+$/.test(r)))throw new Error('ABA records must contain exactly 120 ASCII bytes.');return {text:rows.join('\r\n')+'\r\n',totalCents:total,creditCount:credits.length,detailCount:credits.length+1};
}
