import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
vi.mock('../security/usePermission',()=>({usePermission:()=>true}));
import {CreateContainerShipment,sampleContainers} from './CreateContainerShipment';
import {containerTotals} from './containerPurchaseModel';
it('renders three read-only sample containers with independent invoices and unit and total prices',()=>{const html=renderToStaticMarkup(<CreateContainerShipment sample onClose={()=>{}} onSaved={()=>{}}/>);for(const text of ['Create Shipment','Basic Information','House Bill','Containers &amp; Products (3)','MSCU1234567','TCLU7654321','MEDU9876543','INV-00123','INV-00124','INV-00125','Unit Price (ex. GST)','Total (ex. GST)','57,700.00','1,299.60','Save as Draft','Copy From PO'])expect(html).toContain(text);expect(html).not.toContain('Local Purchase');});
it('keeps all container totals consistent',()=>{const result=containerTotals(sampleContainers('2026-11-13'),l=>l.unitId==='box'?2.166:undefined);expect(result).toMatchObject({containers:3,quantity:830,invoices:3,invoiceAmount:57700,productAmount:57700});expect(result.area).toBeCloseTo(1299.6);});
