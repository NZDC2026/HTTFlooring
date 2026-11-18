import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {SalesEntryEditor} from './SalesEntryEditor';
describe('unified sales entry layout',()=>{
 for(const kind of ['QUOTE','ORDER','INVOICE'] as const)it(`renders ${kind} with the shared customer, address, product and pricing sections`,()=>{const html=renderToStaticMarkup(<MemoryRouter><SalesEntryEditor kind={kind} onSave={()=>{throw Error('must not save during preview');}} onCancel={()=>{}}/></MemoryRouter>);for(const value of ['Create '+(kind==='QUOTE'?'Quote':kind==='ORDER'?'Sales order':'Invoice'),'Customer','Billing To','Shipping To','Details','Products','Summary','Opened by','Missing:','Sample','Save as draft','More'])expect(html).toContain(value);expect(html).toContain('role="combobox"');expect(html.includes('Courier booking')).toBe(kind!=='QUOTE');expect(html).not.toContain('Create Document');});
});

describe('populated service sample',()=>{
 for(const kind of ['QUOTE','ORDER','INVOICE'] as const)it(`shows the default delivery service only in the ${kind} sample`,()=>{
  const render=(sample:boolean)=>renderToStaticMarkup(<MemoryRouter><SalesEntryEditor kind={kind} initialSample={sample} onSave={()=>{throw Error('sample must not save');}} onCancel={()=>{}}/></MemoryRouter>);
  const html=render(true);for(const text of ['Delivery Service','SRV-DEL','Site delivery (Melbourne)','Delivery Expense','$180.00','Total Items: 4','service-row'])expect(html).toContain(text);
  expect(render(false)).not.toContain('SRV-DEL');
 });
});
