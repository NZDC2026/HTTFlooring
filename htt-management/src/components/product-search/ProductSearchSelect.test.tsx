import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {ProductSearchSelect,productSearchMatches} from './ProductSearchSelect';
const products=[{id:'black',sku:'MTF-BLK',name:'MTF Oak',colour:'Black',description:'Matt finish'},{id:'white',sku:'MTF-WHT',name:'MTF White Oak',description:'White finish'}];
describe('product search',()=>{
 it('matches name, SKU, explicit colour and colour in saved descriptions',()=>{expect(products.filter(p=>productSearchMatches(p,'mtf black')).map(p=>p.id)).toEqual(['black']);expect(products.filter(p=>productSearchMatches(p,'WHT')).map(p=>p.id)).toEqual(['white']);expect(productSearchMatches(products[0],'unavailable')).toBe(false);});
 it('finds products in a large catalogue',()=>{const rows=Array.from({length:900},(_,i)=>({id:String(i),sku:`SKU-${i}`,name:`Product ${i}`}));expect(rows.filter(p=>productSearchMatches(p,'SKU-899'))).toHaveLength(1);});
 it('shows saved product selection without opening or modifying a document',()=>{const html=renderToStaticMarkup(<ProductSearchSelect products={products} value="black" onChange={()=>{throw Error('unexpected change');}}/>);expect(html).toContain('MTF-BLK · MTF Oak');expect(html).toContain('role="combobox"');expect(html).toContain('Search name, SKU or colour');});
});
