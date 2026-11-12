import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
vi.mock('../security/usePermission',()=>({usePermission:()=>true}));
import {InvoiceRemindersPage} from './InvoiceRemindersPage';
const render=(query='')=>renderToStaticMarkup(<MemoryRouter initialEntries={['/sales/invoice-reminders?sample=1&filter=All'+query]}><InvoiceRemindersPage/></MemoryRouter>);
it('shows six isolated sample invoices grouped across three customers with batch controls',()=>{const html=render();for(const value of ['Batch Email &amp; Print','Sample Harbour Flooring','Sample Parkside Interiors','Sample Coastline Floors','INV-10418','INV-10432','1,056.00','Recipients &amp; Invoices','Email Preview','Preview Emails','Delivery History'])expect(html).toContain(value);expect(html.match(/aria-label="Select INV-/g)).toHaveLength(6);expect(html).not.toContain('Send immediately');expect(html).not.toContain('Email grouping');expect(html).toContain('Send 0 Emails');expect(html).toContain('disabled');});
it('retains customer handoff filtering',()=>{const html=render('&customers=sample-a');expect(html).toContain('INV-10418');expect(html).not.toContain('INV-10425');});
it('retains old print links within the combined workspace without email send controls',()=>{const html=render('&action=print');expect(html).toContain('Print Preview');expect(html).toContain('Download PDF');expect(html).not.toContain('Send 0 Emails');expect(html).not.toContain('Send immediately');});
