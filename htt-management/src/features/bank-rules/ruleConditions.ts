import { z } from 'zod';
import { requireDateKey } from '../../lib/businessDate';
export const fields=['Description','Reference','Payee','Amount','Direction','Date'] as const;
export const operators=['Contains','Equals','Starts with','Ends with','Not contains','At least','At most','Between'] as const;
export const conditionSchema=z.object({field:z.enum(fields),operator:z.enum(operators),value:z.string().trim().min(1).max(500),to:z.string().trim().max(500).optional()}).strict().superRefine((c,ctx)=>{
 const fail=(message:string)=>ctx.addIssue({code:'custom',message});
 if(['Description','Reference','Payee'].includes(c.field)){if(!['Contains','Equals','Starts with','Ends with','Not contains'].includes(c.operator))fail('Use a text operator.');}
 else if(c.field==='Direction'){if(c.operator!=='Equals'||!['MONEY_IN','MONEY_OUT'].includes(c.value))fail('Direction must equal MONEY_IN or MONEY_OUT.');}
 else if(c.field==='Amount'){const n=Number(c.value),end=Number(c.to);if(!['Equals','At least','At most','Between'].includes(c.operator)||!Number.isFinite(n)||n<0||!Number.isSafeInteger(Math.round(n*100))||n!==Math.round(n*100)/100||c.operator==='Between'&&(!c.to||!Number.isFinite(end)||end<n||end!==Math.round(end*100)/100))fail('Use nonnegative whole-cent amounts and an ordered range.');}
 else {try{requireDateKey(c.value);if(c.operator==='Between'){requireDateKey(c.to??'');if(c.to!<c.value)fail('End date precedes start.');}if(!['Equals','At least','At most','Between'].includes(c.operator))fail('Use a date comparison.');}catch{fail('Use YYYY-MM-DD dates.');}}
});
export type RuleCondition=z.infer<typeof conditionSchema>;
export function parseRuleConditions(row:Record<string,string>) {
 const conditions=z.array(conditionSchema).min(1).max(20).parse(row.conditions?JSON.parse(row.conditions):[{field:row.field,operator:row.operator,value:row.value}]);
 if(!['All conditions','Any condition'].includes(row.match??'All conditions'))throw new Error('Choose all or any conditions.');
 if(row.priority!==undefined&&(!/^\d+$/.test(row.priority)||Number(row.priority)>999))throw new Error('Rule priority must be an integer from 0 to 999.');
 if(row.enabled!==undefined&&!['Yes','No'].includes(row.enabled))throw new Error('Choose Yes or No for enabled.');
 if(row.automatic!==undefined&&!['Yes','No'].includes(row.automatic))throw new Error('Choose Yes or No for automatic classification.');
 return conditions;
}
export function matchesRule(row:Record<string,string>,line:{description:string;reference:string;payee?:string;date:string;amount:number;bankAccountId:string}) {
 const conditions=parseRuleConditions(row);
 if(row.bankAccountId&&row.bankAccountId!=='ALL'&&row.bankAccountId!==line.bankAccountId)return false;
 const results=conditions.map(c=>{
  if(c.field==='Payee'&&!line.payee)return false; // Missing data cannot satisfy a negative text condition.
  const value=c.field==='Amount'?Math.abs(line.amount):c.field==='Date'?line.date:c.field==='Direction'?(line.amount<0?'MONEY_OUT':'MONEY_IN'):(c.field==='Description'?line.description:c.field==='Reference'?line.reference:line.payee??'').trim().toLowerCase(),test=c.field==='Amount'?Number(c.value):c.field==='Date'||c.field==='Direction'?c.value:c.value.trim().toLowerCase(),end=c.field==='Amount'?Number(c.to):c.to??'';
  switch(c.operator){case'Equals':return value===test;case'Contains':return String(value).includes(String(test));case'Not contains':return !String(value).includes(String(test));case'Starts with':return String(value).startsWith(String(test));case'Ends with':return String(value).endsWith(String(test));case'At least':return value>=test;case'At most':return value<=test;case'Between':return value>=test&&value<=end;}
 });
 return row.match==='Any condition'?results.some(Boolean):results.every(Boolean);
}
