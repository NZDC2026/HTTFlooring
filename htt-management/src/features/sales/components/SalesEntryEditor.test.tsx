import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {SalesEntryEditor} from './SalesEntryEditor';
describe('unified sales entry layout',()=>{
 for(const kind of ['QUOTE','ORDER','INVOICE'] as const)it(`renders ${kind} with the shared customer, address, product and pricing sections`,()=>{const html=renderToStaticMarkup(<MemoryRouter><SalesEntryEditor kind={kind} onSave={()=>{throw Error('must not save during preview');}} onCancel={()=>{}}/></MemoryRouter>);for(const value of ['Create Document','Customer','Billing To','Shipping To','Document Details','Products','Coverage / Unit','Total Area (m²)','Fulfilment','Pricing Summary','Customer message · Printed on the document','Save &amp; Add Internal Task','Sample','Save','Preview'])expect(html).toContain(value);expect(html).toContain(kind==='QUOTE'?'Quote Date':kind==='ORDER'?'Order Date':'Invoice Date');expect(html).not.toContain('Document Date');expect(html).not.toContain('Document Options');expect(html).not.toContain('Create Another After Save');expect(html).toContain('role="combobox"');if(kind==='QUOTE'){expect(html.indexOf('Amount (Ex GST)</th>')).toBeLessThan(html.indexOf('Tax</th>'));expect(html).not.toContain('Other Cost (Ex GST)');expect(html).toContain('Salesperson');}});
});

describe('populated service sample',()=>{
 for(const kind of ['QUOTE','ORDER','INVOICE'] as const)it(`shows the default delivery service only in the ${kind} sample`,()=>{
  const render=(sample:boolean)=>renderToStaticMarkup(<MemoryRouter><SalesEntryEditor kind={kind} initialSample={sample} onSave={()=>{throw Error('sample must not save');}} onCancel={()=>{}}/></MemoryRouter>);
  const html=render(true);for(const text of ['Delivery Service','SRV-DEL','Site delivery (Melbourne)','Delivery Expense','$180.00','Total Items: 4','service-row'])expect(html).toContain(text);
  expect(render(false)).not.toContain('SRV-DEL');
 });
});
