import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {sampleReceivables,agingKeys} from './reportSamples';
vi.mock('../security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'test-admin',roles:['ADMIN']}}})}));
import {AgedReceivablesPage} from './pages/AgedReceivablesPage';
it('sample ageing reconciles customer rows and shares identities with email previews',()=>{
 const r=sampleReceivables('2026-11-10');expect(r.totalOutstanding).toBe(4603.75);expect(r.totalOverdue).toBe(2843.75);expect(r.customerCount).toBe(2);expect(r.aging.current).toBe(1760);expect(agingKeys.reduce((n,k)=>n+r.aging[k],0)).toBe(r.totalOutstanding);expect(r.rows[0].customerId).toBe('sample-a');expect(r.rows[0].outstandingInvoiceCount).toBe(2);
});
it('renders report categories, navigation, charts and confirmation-based email entries',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><AgedReceivablesPage/></MemoryRouter>);
 for(const label of ['Accounts (AR / AP)','Custom Reports','Quick Reports','Email Statement','Email Invoices','Receivables Trend','Select all filtered customers','Create Follow-up Task','No financial entries or emails are created'])expect(html).toContain(label);
 expect(html).not.toContain('Report library');
});
it('financial category links to existing reports rather than displaying fabricated totals',()=>{
 const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/reports?category=Financial']}><AgedReceivablesPage/></MemoryRouter>);
 expect(html).toContain('Profit &amp; Loss');expect(html).toContain('/accounting/balance-sheet');expect(html).not.toContain('reports-metrics');
});
it('populates Sample customer balances directly in the report without live writes',()=>{const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/reports?sample=1']}><AgedReceivablesPage/></MemoryRouter>);for(const text of ['Sample Harbour Flooring','Sample Parkside Interiors','4,603.75','2,843.75','Receivables Trend','Sample'])expect(html).toContain(text);});
