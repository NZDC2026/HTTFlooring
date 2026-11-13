import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
vi.mock('../../security/usePermission',()=>({usePermission:()=>true}));
import {PurchaseOrdersPage} from './PurchaseOrdersPage';
it('opens the supplier bills overview by default with preserved order and quotation entry points',()=>{const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/purchases?sample=1']}><PurchaseOrdersPage/></MemoryRouter>);for(const label of ['Supplier Bills &amp; Accounts Payable','Total Purchase','In Transit','Open Bills','Aging Summary','PO / Ref','Balance Due','New Purchase','Sample payment scenario','$57,700.00','Purchase Order Register','Quotations'])expect(html).toContain(label);expect(html).toContain('href="/purchases?view=orders"');expect(html).toContain('INV-00123');expect(html).toContain('Unpaid (4)');expect(html).toContain('Paid (8)');});
