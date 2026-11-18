import {z} from 'zod';
export const emailTypes=['Quote','Order confirmation','Invoice','Statement','Payment reminder','Ready to collect','Purchase order to supplier','Price list'] as const;
export type EmailType=typeof emailTypes[number];
export const insertTokens=['first_name','customer','doc_no','total','balance','due_date','company','rep','bank','link'] as const;
export const emailPolicySchema=z.object({type:z.enum(emailTypes),attachPdf:z.boolean()}).strict();
export const defaultEmails:Record<EmailType,{subject:string;body:string}>={
 Quote:{subject:'Your quote {doc_no} from {company}',body:'Hi {first_name},\n\nThanks for the enquiry — your quote {doc_no} for {total} is attached.\nPrices are valid for 30 days. Reply to this email to go ahead.\n\nKind regards,\n{rep}\n{company}'},
 'Order confirmation':{subject:'Order {doc_no} confirmed',body:'Hi {first_name},\n\nThanks for your order {doc_no} ({total}). It is attached — please check it.\nWe will let you know when it is ready to collect or has left with the carrier.\n\nKind regards,\n{company}'},
 Invoice:{subject:'Invoice {doc_no} from {company}',body:'Hi {first_name},\n\nYour invoice {doc_no} for {total} is attached, due {due_date}.\nPay by bank transfer to {bank} with reference {doc_no}.\n\nKind regards,\n{company}'},
 Statement:{subject:'Your statement from {company}',body:'Hi {first_name},\n\nPlease find attached your account statement. Balance due {balance} {overdue_line}.\n\nIf you have any questions, please contact us.\n\nKind regards,\n{company}'},
 'Payment reminder':{subject:'Reminder: {doc_no} is overdue',body:'Hi {first_name},\n\nA friendly reminder that invoice {doc_no} for {balance} was due on {due_date}.\nIf you have already paid, thank you — please ignore this email.\n\nKind regards,\n{company}'},
 'Ready to collect':{subject:'Order {doc_no} is ready to collect',body:'Hi {first_name},\n\nYour order {doc_no} is packed and ready to collect from 12 Industrial Drive, Dandenong South.\nOpening hours: Mon–Fri 7:30 am – 4:00 pm.\n\nKind regards,\n{company}'},
 'Purchase order to supplier':{subject:'Purchase order {doc_no} — {company}',body:'Dear {supplier},\n\nPlease find attached purchase order {doc_no}. Kindly confirm the order and the expected ship date.\n\nBest regards,\nRay\n{company}'},
 'Price list':{subject:'Your price list from {company}',body:'Hi {first_name},\n\nAttached is your current price list. New prices apply from {date}.\n\nKind regards,\n{rep}\n{company}'}
};
export const emailSampleFields:Record<string,string>={supplier:'Lily',date:'1 Dec 2026',first_name:'Ben',customer:'Coastal Timber Floors',doc_no:'INV-3455',total:'$6,774.22',balance:'$21,301.45',due_date:'31 Dec 2026',company:'HTT Flooring',rep:'Jason Wu',bank:'BSB 063-000 · Acc 1234 5678',link:'https://portal.example.invalid/orders/INV-3455',overdue_line:', of which $2,097.32 is overdue'};
export function mergeEmailPreview(text:string,fields=emailSampleFields){return text.replace(/(?<!\{)\{([a-z_]+)\}(?!\})/g,(token,key)=>fields[key]??token).replace(/\s+,/g, ',');}
export function insertEmailToken(text:string,token:string,start:number,end:number){return {text:text.slice(0,start)+'{'+token+'}'+text.slice(end),caret:start+token.length+2};}
