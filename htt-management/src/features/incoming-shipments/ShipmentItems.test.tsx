import { describe,it,expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ShipmentItems,shipmentItemArea } from './ShipmentItems';
import type { Shipment } from './shipmentModel';
import type { Product } from '../inventory/types/product';
import type { PurchaseOrder } from '../purchases/types/purchaseOrder';
const lines=[{purchaseOrderId:'po1',lineId:'l1',sku:'OAK',description:'Natural Oak',unit:'Box',quantity:500,received:100},{purchaseOrderId:'po2',lineId:'l2',sku:'SMOKED',description:'Smoked Oak',unit:'Box',quantity:300,received:0}] as Shipment['lines'];
const orders=lines.map(l=>({id:l.purchaseOrderId,purchaseOrderNumber:l.purchaseOrderId==='po1'?'PO-0283':'PO-0284',lines:[{id:l.lineId,productId:'p',unitId:'box'}]})) as PurchaseOrder[];
const products=[{id:'p',units:[{id:'m2',code:'M2',conversionToBase:1},{id:'box',code:'BOX',conversionToBase:2.166}]}] as Product[];
describe('shipment items grouped by PO',()=>{
 it('puts each PO above its products and separates groups',()=>{const html=renderToStaticMarkup(<MemoryRouter><ShipmentItems lines={lines} orders={orders} products={products}/></MemoryRouter>);expect(html.indexOf('PO-0283')).toBeLessThan(html.indexOf('Natural Oak'));expect(html.indexOf('PO-0284')).toBeLessThan(html.indexOf('Smoked Oak'));expect(html).toContain('divide-y-2');expect(html).toContain('1,083 m²');expect(html).toContain('866.4 m²');expect(html).toContain('649.8 m²');});
 it('calculates coverage and received/remaining area from the linked PO unit',()=>{expect(shipmentItemArea(lines[0],orders,products)).toEqual({coverage:2.166,total:1083,received:216.6,remaining:866.4});expect(shipmentItemArea(lines[0],orders,[]).coverage).toBeUndefined();});
 it('shows populated read-only samples with distinct PO labels',()=>{const html=renderToStaticMarkup(<MemoryRouter><ShipmentItems lines={lines} orders={[]} products={[]} sample/></MemoryRouter>);expect(html).toContain('PO-SAMPLE-0283');expect(html).toContain('PO-SAMPLE-0284');expect(html).toContain('1,083 m²');expect(html).not.toContain('<input');});
});
