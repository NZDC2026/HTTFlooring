import {hasPermission,type VerifiedPrincipal} from '../../security/rbac';
import type {Customer} from '../../contacts/types/customer';
import type {Supplier} from '../../contacts/types/supplier';
import type {SalesDocument} from '../../sales/types/salesDocument';
import type {SalesFulfilment} from '../../sales/types/salesFulfilment';
import type {PurchaseOrder} from '../../purchases/types/purchaseOrder';
import type {Product} from '../../inventory/types/product';
import type {StockBalance} from '../../inventory/types/stockBalance';
import {assignedStoreCustomers} from './roleWorkspaceModel';
import {stockSignals} from './stockSignalsModel';
export function stockSignalsProjection(principal:VerifiedPrincipal|null,snapshots:Record<string,unknown>,workspace:string,today:string){
 if(!hasPermission(principal,'inventory.read'))throw Error('Inventory access required.');
 if(!['Admin','Account','Front desk','Sales','Warehouse'].includes(workspace))throw Error('Invalid dashboard workspace.');
 const rows=<T,>(key:string,field:string):T[]=>((snapshots[key] as Record<string,T[]>|undefined)?.[field]??[]);
 const ids=workspace==='Sales'?new Set(assignedStoreCustomers(rows<Customer>('customers','customers'),principal!.userId).map(c=>c.id)):null;
 const documents=rows<SalesDocument>('sales','salesOrders').filter(d=>!ids||ids.has(d.customerId));
 const result=stockSignals({today,documents,orders:rows<PurchaseOrder>('purchaseOrders','purchaseOrders'),shipments:rows<Supplier>('suppliers','suppliers').flatMap(s=>s.shipments||[]),products:rows<Product>('products','products'),stock:rows<StockBalance>('stock','balances'),fulfilments:rows<SalesFulfilment>('fulfilments','fulfilments')});
 return {...result,late:hasPermission(principal,'sales.read')?result.late:[],reorder:hasPermission(principal,'accounting.read')&&hasPermission(principal,'purchases.read')?result.reorder:[]};
}
