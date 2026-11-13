import { describe,it,expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { PurchaseOrderForm } from './PurchaseOrderForm';
describe('purchase order editor',()=>{
 it('shows the new layout, separate charges, attachments and populated sample preview control',()=>{const html=renderToStaticMarkup(<MemoryRouter><PurchaseOrderForm onSave={()=>{}} onCancel={()=>{}}/></MemoryRouter>);for(const text of ['Supplier Address','Document Details','Delivery','Order Information','Bulk Add','Scan Barcode','Freight','Insurance','Attachments','Qty','Coverage (m²)','Unit','Auto Calculation','Select all order lines','Issue PO','Print / PDF','Sample'])expect(html).toContain(text);expect(html).not.toContain('Warehouse (Receiving)');expect(html).toContain('<th>Qty</th><th>Coverage (m²)</th>');expect(html).not.toContain('<th>Description</th>');expect(html).toContain('<details class="po-auto-explanation">');});
 it('disables the sample editor so preview cannot submit business records',()=>{const html=renderToStaticMarkup(<MemoryRouter><PurchaseOrderForm readOnlySample onSave={()=>{throw Error('must not save');}} onCancel={()=>{}}/></MemoryRouter>);expect(html).toContain('<fieldset disabled=""');expect(html).not.toContain('Sample · Populated purchase order');});
});
