import {describe,it,expect} from 'vitest';
import {salesOutputSample} from './salesOutputSamples';
import {renderOutputHtml} from './outputHtml';
describe('customer-facing sales output',()=>{
 for(const kind of ['QUOTE','SALES_ORDER','INVOICE'] as const)it(kind+' uses the correct dates and numeric bank reference',()=>{const a=salesOutputSample(kind),html=renderOutputHtml(a);expect(html).toContain('Sample · Read-only synthetic document');expect(html).toContain('Reference: 0004725');expect(html).toContain('$3,524.49');expect(html).toContain('Discount<br>%');expect(html).toContain('10%');expect(html).toContain('20%');expect(html).toContain('Bill To');expect(html).toContain('Ship To');expect(html).toContain('43.320');expect(html).toContain(kind==='QUOTE'?'Valid Until':kind==='SALES_ORDER'?'Promised Date':'Due Date');expect(html).not.toContain(kind==='QUOTE'?'Invoice Date':kind==='SALES_ORDER'?'Valid Until':'Quote Date');});
 it('escapes customer and product data',()=>{const a=salesOutputSample('INVOICE');a.customerName='<script>attack</script>';a.lines[0].productDetails='<img src=x onerror=attack>';const html=renderOutputHtml(a);expect(html).not.toContain('<script>');expect(html).toContain('&lt;img');});
});
