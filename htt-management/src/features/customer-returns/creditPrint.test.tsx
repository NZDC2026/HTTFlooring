import {it,expect} from 'vitest';
import {sampleCreditOutput} from './CreditPrintButton';
import {renderOutputHtml} from '../document-output/outputHtml';
it('shows inherited discount in a complete credit template without discounting the credit a second time',()=>{for(const amount of [220,110]){const a=sampleCreditOutput(amount),html=renderOutputHtml(a);expect(a.totals.total).toBe(amount);expect(a.lines[0].lineSubtotal).toBeCloseTo(amount/1.1,2);expect(html).toContain('20%');expect(html).toContain('Discount<br>%');expect(html).toContain('Source Invoice');expect(html).toContain('Sample · Read-only synthetic');expect(html).toContain('CREDIT NOTE');}});
