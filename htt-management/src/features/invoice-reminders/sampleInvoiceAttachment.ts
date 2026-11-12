import type {ReminderRow} from './rules';
import {salesOutputSample} from '../document-output/salesOutputSamples';
import {renderOutputHtml} from '../document-output/outputHtml';
export function sampleInvoiceAttachment(row:ReminderRow){
 const base=salesOutputSample('INVOICE'),total=row.invoiceTotal??row.amount,subtotal=Math.round(total/1.1*100)/100,taxAmount=Math.round((total-subtotal)*100)/100;
 return {filename:row.number+'.html',html:renderOutputHtml({...base,documentNumber:row.number,customerName:row.customer,dueDate:row.dueDate,documentDate:row.documentDate??base.documentDate,amountDue:row.amount,amountPaid:Math.round((total-row.amount)*100)/100,totals:{subtotal,taxAmount,total},lines:[{...base.lines[0],quantity:1,unitSymbol:'Box',areaPerPack:1,coveredArea:1,unitPrice:subtotal,standardUnitPrice:subtotal,discountPercent:0,lineSubtotal:subtotal,taxAmount,lineTotal:total}]})};
}
