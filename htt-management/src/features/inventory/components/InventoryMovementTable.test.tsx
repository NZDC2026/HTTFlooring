import {describe,it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
vi.mock('../../../lib/businessDate',()=>({businessDateKey:()=> '2026-11-14'}));
import {InventoryMovementTable} from './InventoryMovementTable';
import type {InventoryMovementRow} from '../types/inventoryOverview';
const row={id:'m',movementNumber:'MOV-1',movementType:'GOODS_RECEIPT',occurredAt:'2026-11-13',siteId:'s',siteName:'Warehouse',productId:'p',productName:'Live Oak',sku:'OAK',baseUnitSymbol:'m²',quantityBase:24,referenceType:'GOODS_RECEIPT',referenceId:'receipt',referenceNumber:'GR-1'} as InventoryMovementRow;
describe('live movement workspace',()=>{it('renders persisted quantities, receipt links and batch controls without sample records',()=>{const html=renderToStaticMarkup(<MemoryRouter><InventoryMovementTable rows={[row]}/></MemoryRouter>);for(const t of ['Live Oak','GR-1','Trace batches','24','/purchases/goods-receipts/receipt'])expect(html).toContain(t);expect(html).not.toContain('PO-0409');});it('shows the empty state without fabricated records',()=>{expect(renderToStaticMarkup(<MemoryRouter><InventoryMovementTable rows={[]}/></MemoryRouter>)).toContain('No posted stock movements');});});
