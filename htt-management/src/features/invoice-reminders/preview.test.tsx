import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
vi.mock('../security/usePermission',()=>({usePermission:()=>true}));
import {InvoiceRemindersPage} from './InvoiceRemindersPage';
it('shows populated isolated Sample due dates, amounts and delivery states directly on the page',()=>{const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/sales/invoice-reminders?sample=1']}><InvoiceRemindersPage/></MemoryRouter>);for(const value of ['Sample Harbour Flooring','Sample Parkside Interiors','2,843.75','1,100.00','660.00','Overdue','Due today','Due soon','Accepted','Queued','Failed','Statement','Invoice'])expect(html).toContain(value);expect(html).not.toContain('Send 3 emails');});
