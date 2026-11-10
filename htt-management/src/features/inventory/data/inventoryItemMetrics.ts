import type { Product } from '../types/product';
import type { SupplierBill } from '../../purchases/types/supplierBill';
import type { InventoryCostBalance } from '../types/inventoryCost';

const savedLineAmount = (line: SupplierBill['lines'][number]) => Number.isFinite(line.lineSubtotal) ? line.lineSubtotal : line.quantity * line.unitCost;

/** Values are in business currency and prices are per inventory base unit. */
export function inventoryItemMetrics(product: Product, balances: InventoryCostBalance[], bills: SupplierBill[], site: string) {
 const selected = balances.filter(b => b.productId === product.id && (site === 'ALL' || b.siteId === site));
 const currentValue = selected.reduce((sum,b) => sum + b.inventoryValue, 0);
 const quantity = selected.reduce((sum,b) => sum + b.quantityOnHand, 0);
 const purchases = bills.filter(b => b.status !== 'VOID' && b.lines.some(l => l.productId === product.id && l.quantity > 0))
  .sort((a,b) => b.billDate.localeCompare(a.billDate) || b.createdAt.localeCompare(a.createdAt) || (b.id??'').localeCompare(a.id??''));
 const latest = purchases[0];
 const lines = latest?.lines.filter(l => l.productId === product.id && l.quantity > 0) ?? [];
 const conversions = lines.map(l => product.units.find(u => u.id === l.unitId)?.conversionToBase);
 const baseQuantity = lines.reduce((sum,l,i) => sum + l.quantity * (conversions[i] ?? 0), 0);
 const purchasePrice = (bill: SupplierBill | undefined) => {
  if (!bill) return undefined;
  const rows = bill.lines.filter(l => l.productId === product.id && l.quantity > 0);
  const units = rows.map(l => product.units.find(u => u.id === l.unitId)?.conversionToBase);
  const qty = rows.reduce((n,l,i) => n + l.quantity * (units[i] ?? 0),0);
  return qty > 0 && units.every(u => u !== undefined && u > 0) ? rows.reduce((n,l) => n + savedLineAmount(l),0) / qty : undefined;
 };
 return {currentPurchaseBillId: latest?.id, currentPurchaseReference: latest?.billNumber, previousPurchaseBillId: purchases[1]?.id, previousPurchaseReference: purchases[1]?.billNumber, currentPurchasePrice: purchasePrice(latest), currentPurchaseDate: latest?.billDate,
  previousPurchasePrice: purchasePrice(purchases[1]), previousPurchaseDate: purchases[1]?.billDate,
  currentValue, averageCost: quantity > 0 ? currentValue / quantity : undefined,
  lastPurchasePrice: lines.length && conversions.every(c => c !== undefined && c > 0) && baseQuantity > 0
   ? lines.reduce((sum,l) => sum + savedLineAmount(l), 0) / baseQuantity : undefined};
}
