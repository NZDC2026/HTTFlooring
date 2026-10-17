import type { Product } from '../types/product';
import type { SalesDocumentLine } from '../../sales/types/salesDocument';
export function isStockProduct(product: Pick<Product, 'itemType'>): boolean { return (product.itemType ?? 'STOCK') === 'STOCK'; }
export function isStockLine(line: Pick<SalesDocumentLine, 'itemType'>): boolean { return (line.itemType ?? 'STOCK') === 'STOCK'; }
export function validateLineItemType(line: {
    itemType?: unknown;
}, product?: Pick<Product, 'itemType'>): void {
    if (line.itemType !== undefined && !['STOCK', 'NON_STOCK', 'SERVICE'].includes(String(line.itemType)))
        throw new Error('Invalid saved sales item type.');
    if (product && (line.itemType ?? 'STOCK') !== (product.itemType ?? 'STOCK'))
        throw new Error('Saved sales item type does not match its referenced product.');
}
