import {z} from 'zod';
export const recognitionSchema=z.object({engine:z.string().min(1).max(100),pages:z.number().int().min(1).max(10),lines:z.array(z.object({page:z.number().int().min(1).max(10),text:z.string().min(1).max(4000),confidence:z.number().finite().min(0).max(1)}).strict()).max(3000)}).strict().refine(v=>v.lines.every(l=>l.page<=v.pages)&&v.lines.reduce((n,l)=>n+l.text.length,0)<=200000,'Invalid recognized page or text limits.');
export type Recognition=z.infer<typeof recognitionSchema>;
export type Candidate={value:string;confidence:number;page:number;evidence:string};
export type RecognitionField='reference'|'date'|'dueDate'|'subtotal'|'taxAmount'|'total';
export function extractRecognition(raw:unknown) {
 const result=recognitionSchema.parse(raw),fields:Record<RecognitionField,Candidate[]>={reference:[],date:[],dueDate:[],subtotal:[],taxAmount:[],total:[]};
 const add=(key:RecognitionField,value:string,line:Recognition['lines'][number])=>{if(!fields[key].some(c=>c.value===value)) fields[key].push({value,confidence:line.confidence,page:line.page,evidence:line.text});};
 for(const line of result.lines) {
  const t=line.text.trim();
  const ref=t.match(/^(?:tax\s+)?invoice\s*(?:number|no\.?|#|reference)\s*[:#-]?\s*([A-Za-z0-9][A-Za-z0-9/_-]{0,99})\s*$/i);if(ref)add('reference',ref[1],line);
  const date=t.match(/^(invoice\s+date|date|due\s+date)\s*[:\s]+(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\s*$/i);
  if(date){const parts=date[2].split('/');const value=parts.length===3?`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`:date[2];if(!isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value)add(/due/i.test(date[1])?'dueDate':'date',value,line);}
  const amount=t.match(/^(sub\s*total|net(?:\s+amount)?|gst(?:\s+amount)?|tax(?:\s+amount)?|(?:grand\s+)?total(?:\s+(?:due|amount|incl\.?\s+gst))?|amount\s+due)\s*[:\s]+(?:AUD\s*|A?\$\s*)?((?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2})\s*$/i);
  if(amount){const key:RecognitionField=/sub|net/i.test(amount[1])?'subtotal':/^(gst|tax)/i.test(amount[1])?'taxAmount':'total';const value=amount[2].replaceAll(',','');if(Number(value)<=1e10)add(key,value,line);}
 }
 const warnings:string[]=['Recognized text is a suggestion. Verify the original document, supplier, currency, dates and every expense line. Accounts, tax codes and line items require manual assignment.'];
 for(const [key,candidates] of Object.entries(fields)){if(candidates.length!==1)warnings.push(`${key}: ${candidates.length?'conflicting values; choose manually':'not recognized; enter manually'}.`);else if(candidates[0].confidence<0.85)warnings.push(`${key}: low recognition confidence; verify manually.`);}
 if(result.lines.some(l=>l.confidence<0.85))warnings.push('Some text has low recognition confidence.');
 if(result.lines.some(l=>/\b(?:USD|NZD|EUR|GBP)\b|[€£]/.test(l.text)))warnings.push('Possible non-AUD currency. Confirm source and business currency; no currency conversion is performed.');
 return {fields,warnings};
}
