import { describe,it,expect } from 'vitest';
import { productIncomingShipments } from './productIncomingShipments';
import type { Product } from '../types/product';
import type { Shipment } from '../../incoming-shipments/shipmentModel';
import type { PurchaseOrder } from '../../purchases/types/purchaseOrder';
const p={id:'p',baseUnitId:'m2',units:[{id:'m2',code:'M2',symbol:'m²',conversionToBase:1},{id:'box',code:'BOX',symbol:'Box',conversionToBase:2.166}]} as Product;
const order={id:'po',status:'SENT',lines:[{id:'line',productId:'p',unitId:'box'}]} as PurchaseOrder;
const shipment={id:'s',number:'SHP-001',supplierId:'supplier',siteId:'mel',status:'In Transit',eta:'2026-11-20',lines:[{purchaseOrderId:'po',lineId:'line',unit:'Box',quantity:200,received:50}]} as Shipment;
describe('informational incoming shipment quantities',()=>{
 it('converts unreceived boxes to area and exposes stable integration references without mutating inputs',()=>{const before=JSON.stringify([p,shipment,order]);const r=productIncomingShipments(p,[shipment],[order]);expect(r.quantity).toBe(324.9);expect(r.unit).toBe('m²');expect(r.entries[0]).toMatchObject({shipmentId:'s',purchaseOrderId:'po',purchaseOrderLineId:'line',productId:'p',remainingQuantity:150});expect(JSON.stringify([p,shipment,order])).toBe(before);});
 it('excludes draft, cancelled, received and other warehouse/product quantities',()=>{expect(productIncomingShipments(p,[{...shipment,status:'Draft'},{...shipment,status:'Cancelled'},{...shipment,lines:[{...shipment.lines[0],received:200}]}],[order]).quantity).toBe(0);expect(productIncomingShipments(p,[shipment],[order],'syd').quantity).toBe(0);expect(productIncomingShipments({...p,id:'other'},[shipment],[order]).quantity).toBe(0);});
 it('flags missing conversions instead of assuming a box equals a square metre',()=>{const r=productIncomingShipments({...p,units:p.units.slice(0,1)},[shipment],[order]);expect(r.incomplete).toBe(true);expect(r.entries[0].quantity).toBeUndefined();});
});
