import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {InventoryOverview} from './InventoryOverview';
import {samples} from '../data/inventorySamples';
describe('Inventory overview',()=>{
 it('renders the populated read-only operational overview with working destinations',()=>{const html=renderToStaticMarkup(<MemoryRouter><InventoryOverview items={samples} sample canCost value={0} openStock={()=>{}}/></MemoryRouter>);for(const text of ['Needs attention','Arriving soon','Orders awaiting stock','Recent stock activity','Product performance','Avg Days on Hand','Herringbone','PO-2026-0412','Ready to dispatch','Reservation age','Damage &amp; supplier claims','Stocktake status','Largest variances','Start cycle count'])expect(html).toContain(text);expect(html).toContain('/inventory?tab=stock');expect(html).toContain('/purchases/new?sample=1');});
 it('does not expose synthetic performance or valuation to live or restricted views',()=>{const html=renderToStaticMarkup(<MemoryRouter><InventoryOverview items={[]} sample={false} canCost={false} value={123} openStock={()=>{}}/></MemoryRouter>);expect(html).toContain('Restricted');expect(html).toContain('No stock alerts');expect(html).not.toContain('PO-2026-0412');expect(html).not.toContain('2,438,760');});
});
