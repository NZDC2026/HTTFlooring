import {useSyncExternalStore} from 'react';
import {useProducts} from '../../business-workspace/productRepository';
import {useInventoryMovements} from '../../inventory/data/useInventory';
import {inventoryCostMovementRepository} from '../../inventory/data/inventoryCostMovementRepository';
import {useSuppliers} from '../../contacts/data/useSuppliers';
import {usePurchaseOrders} from '../../purchases/data/usePurchaseOrders';
import {useGoodsReceipts} from '../../purchases/data/useGoodsReceipts';
import {recordedStock,recordedIncoming} from './reportsStockSources';
import {stockMovers,type ReportStock,type ReportIncoming} from './reportsStockModel';
export function useReportsStock(to:string){const products=useProducts(),movements=useInventoryMovements(),costs=useSyncExternalStore(inventoryCostMovementRepository.subscribe,inventoryCostMovementRepository.getSnapshot,inventoryCostMovementRepository.getSnapshot),suppliers=useSuppliers(),orders=usePurchaseOrders(),receipts=useGoodsReceipts();let stock:ReportStock[]=[],incoming:ReportIncoming[]=[],stockError='',incomingError='',notes:string[]=[];try{({stock,notes}=recordedStock(products,movements,costs,to));}catch(e){stockError=(e as Error).message;}try{incoming=recordedIncoming(products,suppliers,orders,receipts,to);}catch(e){incomingError=(e as Error).message;}return {stock,incoming,movers:stockMovers(stock,incoming),stockError,incomingError,notes};}
