import { describe,it,expect } from 'vitest';
import { shipmentWarehouse } from './shipmentWarehouse';
import { mockInventorySites } from '../inventory/data/mockInventorySites';
import { PurchaseOrderPicker } from './PurchaseOrderPicker';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import type { PurchaseOrder } from '../purchases/types/purchaseOrder';
describe('regional warehouse and quick PO linking',()=>{
 it('fixes Melbourne to its warehouse and never chooses another city or showroom',()=>{expect(shipmentWarehouse('HTT Flooring Melb',mockInventorySites).site?.id).toBe('site_001');expect(shipmentWarehouse('HTT Flooring Syd',mockInventorySites).site).toBeUndefined();expect(shipmentWarehouse('Unknown',mockInventorySites).site).toBeUndefined();const syd={...mockInventorySites[0],id:'syd',name:'Sydney Warehouse',code:'SYD-WH'};expect(shipmentWarehouse('HTT Sydney',[...mockInventorySites,syd]).site?.id).toBe('syd');});
 it('shows a searchable PO input and direct links for selected purchases',()=>{const po={id:'po-1',purchaseOrderNumber:'PO-SAMPLE-0283',supplierName:'Sample Timber',lines:[]} as unknown as PurchaseOrder;const html=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(PurchaseOrderPicker,{orders:[po],selected:new Set(['po-1']),onToggle:()=>{}})));expect(html).toContain('role="combobox"');expect(html).toContain('/purchases/po-1');expect(html).toContain('PO-SAMPLE-0283');expect(html).toContain('target="_blank"');});
});
