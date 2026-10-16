import { describe, expect, it } from 'vitest';
import { calculateInventoryHealth } from './inventoryHealth';
import type { Product } from '../../inventory/types/product';
import type { StockBalance } from '../../inventory/types/stockBalance';
describe('live inventory health', () => {
    it('aggregates sites, applies reorder thresholds and excludes inactive or non-stock items', () => {
        const products = [{ id: 'a', status: 'ACTIVE', reorderPoint: 5 }, { id: 'b', status: 'ACTIVE', reorderPoint: 10 }, { id: 'c', status: 'ACTIVE' }, { id: 'd', status: 'INACTIVE' }, { id: 'e', status: 'ACTIVE', itemType: 'SERVICE' }] as Product[];
        const balances = [{ productId: 'a', quantityOnHand: 4 }, { productId: 'a', quantityOnHand: 3 }, { productId: 'b', quantityOnHand: 10 }, { productId: 'd', quantityOnHand: 100 }] as StockBalance[];
        expect(calculateInventoryHealth(products, balances)).toEqual({ healthy: 1, low: 1, out: 1, total: 3 });
    });
    it('returns an empty summary for an empty catalogue', () => expect(calculateInventoryHealth([], [])).toEqual({ healthy: 0, low: 0, out: 0, total: 0 }));
});
