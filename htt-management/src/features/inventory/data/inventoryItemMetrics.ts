import type { Product } from '../types/product';
import type { SupplierBill } from '../../purchases/types/supplierBill';
import type { InventoryCostBalance } from '../types/inventoryCost';

/** Values are in business currency and prices are per inventory base unit. */
export function inventoryItemMetrics(product: Product, balances: InventoryCostBalance[], bills: SupplierBill[], site: string) {
 const selected = balances.filter(b => b.productId === product.id && (site === 'ALL' || b.siteId === site));
 const currentValue = selected.reduce((sum,b) => sum + b.inventoryValue, 0);
 const quantity = selected.reduce((sum,b) => sum + b.quantityOnHand, 0);
 const latest = bills.filter(b => b.status !== 'VOID' && b.lines.some(l => l.productId === product.id && l.quantity > 0))
  .sort((a,b) => b.billDate.localeCompare(a.billDate) || b.createdAt.localeCompare(a.createdAt))[0];
 const lines = latest?.lines.filter(l => l.productId === product.id && l.quantity > 0) ?? [];
 const conversions = lines.map(l => product.units.find(u => u.id === l.unitId)?.conversionToBase);
 const baseQuantity = lines.reduce((sum,l,i) => sum + l.quantity * (conversions[i] ?? 0), 0);
 return {currentValue, averageCost: quantity > 0 ? currentValue / quantity : undefined,
  lastPurchasePrice: lines.length && conversions.every(c => c !== undefined && c > 0) && baseQuantity > 0
   ? lines.reduce((sum,l) => sum + l.quantity * l.unitCost, 0) / baseQuantity : undefined};
}
