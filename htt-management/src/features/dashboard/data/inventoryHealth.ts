import type { Product } from '../../inventory/types/product';
import type { StockBalance } from '../../inventory/types/stockBalance';
export function calculateInventoryHealth(products: Product[], balances: StockBalance[]) {
    const counts = { healthy: 0, low: 0, out: 0, total: 0 };
    for (const product of products.filter(p => p.status === 'ACTIVE' && (!p.itemType || p.itemType === 'STOCK'))) {
        const onHand = balances.filter(b => b.productId === product.id).reduce((sum, b) => sum + b.quantityOnHand, 0);
        counts.total++;
        if (onHand <= 0)
            counts.out++;
        else if (onHand <= (product.reorderPoint ?? 0))
            counts.low++;
        else
            counts.healthy++;
    }
    return counts;
}
