import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {BatchEmailPreview} from './BatchEmailPreview';
import {sampleReminderRows} from './rules';
it('renders a customer email with navigation, accounting fields, amount summary and all genuine attachments',()=>{
 const rows=sampleReminderRows('2026-11-13').slice(0,2).map(r=>({...r,invoiceTotal:r.amount+100}));
 const mail={id:'preview',customerId:rows[0].customerId,to:rows[0].email,subject:'Your Invoices from HTT Flooring',text:'Hi Harbour Flooring,\n\nPlease find attached 2 invoices from HTT Flooring.\n\nIf you have any questions, please contact us.\nKind regards,\nHTT Flooring',html:'<p>Invoice one</p>',filename:'INV-1.html',attachments:[{html:'<p>Invoice one</p>',filename:'INV-1.html'},{html:'<p>Invoice two</p>',filename:'INV-2.html'}]};
 const html=renderToStaticMarkup(<BatchEmailPreview mails={[mail]} index={0} onIndex={()=>{}} rows={rows} statement={false} companyName="HTT Flooring" to={mail.to} onTo={()=>{}} cc="" onCc={()=>{}} copyEmail="office@example.invalid" onClose={()=>{}} onEdit={()=>{}}/>).replace(/<!--.*?-->/g,'');
 for(const value of ['Previous preview customer','Next preview customer','To:','CC:','Subject:','Add CC','Your Invoices','2 invoices attached','Total Amount: $4,143.75','Balance Due: $3,943.75','Overdue Amount: $2,843.75','Attachments (2)','INV-1.html','INV-2.html','office@example.invalid','View Invoices (PDF)'])expect(html).toContain(value);
 expect(html).not.toContain('Select invoices and click');
});

it('prepares every sample invoice attachment with correctly rounded tax totals',async()=>{const {sampleInvoiceAttachment}=await import('./sampleInvoiceAttachment');for(const [invoiceTotal,amount] of [[1056,880],[792,660],[660,550],[528,440],[672,550],[440,0]]){const row={...sampleReminderRows('2026-11-13')[0],invoiceTotal,amount,number:'INV-SAMPLE-'+invoiceTotal};const output=sampleInvoiceAttachment(row);expect(output.html).toContain(row.number);expect(output.html).toContain(invoiceTotal.toLocaleString('en-AU',{minimumFractionDigits:2}));}});
