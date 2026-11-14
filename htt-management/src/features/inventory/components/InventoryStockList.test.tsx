import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {InventoryStockList,stockListSamples} from './InventoryStockList';
const render=(filter='',sample=true)=>renderToStaticMarkup(<MemoryRouter><InventoryStockList items={[]} sample={sample} canCost canWrite initialFilter={filter}/></MemoryRouter>);
describe('Stock List reference workspace',()=>{
 it('renders ten products, expanded oldest batches and all reference filter groups',()=>{const html=render();for(const text of ['Engineered Oak 2200','B2408-17','B2409-03','B2410-11','Oldest · ship first','Different shade','Out of stock 1','Low stock 3','Has incoming 8','Slow moving 2','Old lots 2','Price (Ex GST)','Rows per page'])expect(html).toContain(text);expect(stockListSamples).toHaveLength(10);});
 it('honors incoming out-of-stock and low-stock entry filters',()=>{const out=render('out');expect(out).toContain('Herringbone – Crosswood Oak');expect(out).not.toContain('TM-OAK-2200-NA');const low=render('low');expect(low).toContain('Stair Nose – Oak');expect(low).not.toContain('TM-OAK-2200-NA');});
 it('does not inject sample products into a live empty list',()=>{const html=render('',false);expect(html).toContain('No products match');expect(html).not.toContain('TM-OAK-2200-NA');});
});
