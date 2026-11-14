import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {describe,it,expect} from 'vitest';
import {InventoryMovements} from './InventoryMovements';
const render=(sample:boolean)=>renderToStaticMarkup(<MemoryRouter><InventoryMovements sample={sample} canCost canWrite><p>Live ledger</p></InventoryMovements></MemoryRouter>);
describe('Stock Movement preview',()=>{
 it('includes pending, completed and batch tracing examples',()=>{const html=render(true);for(const label of ['PO-0409','B2410-02','Pending review','Short received','RTN-0031','Showing 10 of 10 sample movements'])expect(html).toContain(label);});
 it('does not include synthetic records in the live ledger',()=>{const html=render(false);expect(html).toContain('Live ledger');expect(html).not.toContain('PO-0409');expect(html).not.toContain('2,860');});
});
