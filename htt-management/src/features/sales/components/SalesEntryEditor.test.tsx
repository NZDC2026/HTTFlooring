import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {SalesEntryEditor} from './SalesEntryEditor';
describe('unified sales entry layout',()=>{
 for(const kind of ['QUOTE','ORDER','INVOICE'] as const)it(`renders ${kind} with the shared customer, address, product and pricing sections`,()=>{const html=renderToStaticMarkup(<MemoryRouter><SalesEntryEditor kind={kind} onSave={()=>{throw Error('must not save during preview');}} onCancel={()=>{}}/></MemoryRouter>);for(const value of ['Create Sales Document','Customer','Billing To','Shipping To','Document Details','Products','Coverage / Unit','Total Area (m²)','Fulfilment','Pricing Summary','Sample','Save','Preview'])expect(html).toContain(value);expect(html).not.toContain('Document Options');expect(html).not.toContain('Create Another After Save');expect(html).toContain('role="combobox"');});
});
