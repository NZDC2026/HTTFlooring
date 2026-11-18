import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
vi.mock('../security/usePermission',()=>({usePermission:()=>true}));
vi.mock('../security/securityClient',()=>({useSecurity:()=>({session:null})}));
vi.mock('../sales/data/useSalesDocuments',()=>({useSalesDocuments:()=>[]}));
vi.mock('../contacts/data/useCustomers',()=>({useCustomers:()=>[]}));
import {ReturnEntryEditor,returnEntryTotals} from './ReturnEntryEditor';
import {sampleInspectionOptions} from './ReturnInspectionItems';
it('shows populated isolated return with the review workflow and prevents Sample saves',()=>{
const html=renderToStaticMarkup(<MemoryRouter><ReturnEntryEditor sample/></MemoryRouter>).replace(/<!--.*?-->/g,'');
for(const label of ['Create Return','Physical return','Credit only','Original invoice','Warehouse check','Sample Harbour Flooring','RT-SAMPLE-0405','Internal notes &amp; tasks','No live records, stock, credit or notifications change'])expect(html).toContain(label);
expect(html).toMatch(/disabled=""[^>]*>Save as draft/);expect(html).toContain('aria-selected="true"');
});
it('starts an empty live return without inventing a saved number or customer',()=>{
const html=renderToStaticMarkup(<MemoryRouter><ReturnEntryEditor/></MemoryRouter>).replace(/<!--.*?-->/g,'');
expect(html).toContain('Customer · Reason · At least one product');expect(html).toContain('Assigned on save');expect(html).toContain('Choose a customer first');expect(html).not.toContain('RT-SAMPLE');
});
it('uses original invoice net prices with per-line tax rounding',()=>{
const items=[{lineId:'sample-oak',quantity:5,good:5,damaged:0},{lineId:'sample-adhesive',quantity:1,good:1,damaged:0}];
expect(returnEntryTotals(items,sampleInspectionOptions)).toMatchObject({subtotal:661.5,tax:66.15,total:727.65});
});
