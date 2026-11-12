import type {ReminderRow} from './rules';
export const defaultEmailTemplates={
 invoiceSubject:'Your Invoices from {companyName}',
 statementSubject:'Your Statement from {companyName}',
 invoiceBody:'Hi {greeting},\n\nPlease find attached {invoiceCount} invoice(s) from {companyName}.\n{invoiceDetails}\n\nTotal Amount: {totalAmount} (inc. GST)\nBalance Due: {balanceDue} (inc. GST)\nOverdue Amount: {overdueAmount} (inc. GST)\nOverdue: {overdueDays} days\n\nIf you have any questions, please contact us.\nKind regards,\n{companyName}',
 statementBody:'Hi {greeting},\n\nPlease find attached your account statement.\nStatement period: {period}\n{invoiceDetails}\n\nTotal Amount: {totalAmount} (inc. GST)\nOutstanding Balance: {balanceDue} (inc. GST)\nOverdue Amount: {overdueAmount} (inc. GST)\nOverdue: {overdueDays} days\n\nIf you have any questions, please contact us.\nKind regards,\n{companyName}'
};
export type EmailTemplates=typeof defaultEmailTemplates;
export function fillEmailTemplate(template:string,rows:ReminderRow[],companyName:string,period:string){
 const currency=(n:number)=>'$'+n.toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});
 const first=rows[0],overdue=rows.filter(r=>r.amount>0&&r.days<0);
 const values:Record<string,string>={companyName,invoiceCount:String(rows.length),customerName:first.customer,contactName:first.contactName??'',greeting:[first.customer,first.contactName].filter(Boolean).join(' / '),period,invoiceNumbers:rows.map(r=>r.number).join(', '),invoiceDetails:rows.map(r=>`${r.number} · Due ${r.dueDate||'—'} · Overdue ${r.amount>0?Math.max(0,-r.days):0} days · Amount ${currency(r.invoiceTotal??r.amount)} · Balance Due ${currency(r.amount)}`).join('\n'),totalAmount:currency(rows.reduce((n,r)=>n+(r.invoiceTotal??r.amount),0)),balanceDue:currency(rows.reduce((n,r)=>n+r.amount,0)),overdueAmount:currency(overdue.reduce((n,r)=>n+r.amount,0)),overdueDays:String(Math.max(0,...overdue.map(r=>-r.days)))};
 return template.replace(/\{(\w+)\}/g,(match,key)=>values[key]??match);
}
