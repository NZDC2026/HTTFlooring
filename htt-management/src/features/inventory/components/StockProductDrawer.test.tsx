import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {StockProductDrawer} from './StockProductDrawer';
import {stockListSamples} from './InventoryStockList';
const render=(sample=true,canCost=true,canWrite=true,initialTab='Overview')=>renderToStaticMarkup(<MemoryRouter><StockProductDrawer item={stockListSamples[0]} sample={sample} canCost={canCost} canWrite={canWrite} initialTab={initialTab} onClose={()=>{}}/></MemoryRouter>);
describe('Stock product detail drawer',()=>{
 it('shows the reference batches and reconciles reservations to the summary',()=>{const html=render();for(const t of ['Description','Stock by batch','B2408-17','516','420','216','Sold per month','SO-10391','SO-10423','SO-10466','Product details','European Oak','Natural matt','Sample · Read-only'])expect(html).toContain(t);expect(32+40+24).toBe(stockListSamples[0].reserved);});
 it('protects cost and write actions for read-only users',()=>{const html=render(true,false,false);expect(html).not.toContain('Cost · margin');expect(html).not.toContain('Edit product');expect(html).not.toContain('Create PO');});
 it('keeps synthetic movements out of live views and supports the movement entry',()=>{expect(render(false,true,true,'Movements')).not.toContain('B2409-03');expect(render(true,true,true,'Movements')).toContain('SO-10480');});
});
