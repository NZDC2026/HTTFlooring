import {expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
const access=vi.hoisted(()=>({write:true,cost:true}));
vi.mock('../security/usePermission',()=>({usePermission:(p:string)=>p==='sales.payment'?access.write:p==='inventory.cost.read'?access.cost:true}));
vi.mock('../sales/data/useSalesDocuments',()=>({useSalesDocuments:()=>[]}));
vi.mock('../sales/data/useCreditNotes',()=>({useCreditNotes:()=>[],useCreditAllocations:()=>[]}));
vi.mock('../contacts/data/useCustomers',()=>({useCustomers:()=>[]}));
vi.mock('./customerReturnRepository',()=>({useCustomerReturns:()=>[],useReturnInspectionDrafts:()=>[]}));
import {CustomerCreditReturnsPage} from './CustomerCreditReturnsPage';
const render=(path='/sales/credit-returns')=>renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><CustomerCreditReturnsPage/></MemoryRouter>).replace(/<!--.*?-->/g,'');
it('renders the unified register, metrics, simple process and creation button without auto-opening the drawer',()=>{access.write=true;access.cost=true;const html=render();for(const value of ['Returns &amp; Credits','New Return / Credit','Pending Inspection','Available Credit','Applied Credit (YTD)','Process Overview','Date Range'])expect(html).toContain(value);expect(html).not.toContain('returns-drawer');});
it('keeps creation and physical records permission scoped',()=>{access.write=false;access.cost=false;const html=render();expect(html).not.toContain('returns-drawer');expect(html).not.toContain('Physical Returns (');expect(html).not.toContain('>New Return / Credit</button>');});
it('preserves populated pending, available and completed sample workflow without writes',()=>{access.write=true;access.cost=true;const html=render('/sales/credit-returns?dashboard=1&sample=1');for(const value of ['CN-10024','CN-10025','CN-10026','Awaiting Inspection','Available','Fully Applied','$220.00','$110.00','Sample return workflow','Confirm Receipt','20% inherited'])expect(html).toContain(value);expect(html).toContain('All (5)');expect(html).toContain('Credit Notes (2)');expect(html).toContain('Physical Returns (3)');for(const value of ['Return Date','Applied To','INV-10432','Date Range'])expect(html).toContain(value);expect(html).not.toContain('Post Return &amp; Credit');});

it('filters records using the shared date range',()=>{access.write=true;access.cost=true;const html=render('/sales/credit-returns?sample=1&from=2026-11-12&to=2026-11-12');expect(html).toContain('CN-10023');expect(html).not.toContain('CN-10024');expect(html).not.toContain('CN-10026');});
