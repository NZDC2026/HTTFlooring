import { isStockProduct } from '../inventory/data/itemTypes';
import { getProductById, getProductUnit } from '../inventory/data/mockProducts';
export function assertProductQuantity(productId: string, unitId: string, quantity: number, operation: 'buy' | 'sell') {
    const product = getProductById(productId), unit = getProductUnit(productId, unitId);
    if (!product || product.status !== 'ACTIVE' || !unit?.active)
        throw new Error('Select an active product and unit.');
    if(operation === 'buy' && !isStockProduct(product))throw new Error('Non-stock/service items use expense bills, not inventory purchase orders.');
    if (operation === 'buy' && product.buyEnabled === false || operation === 'sell' && product.sellEnabled === false)
        throw new Error(`Product is not available to ${operation}.`);
    if (!Number.isFinite(quantity) || quantity <= 0)
        throw new Error('Quantity must be finite and greater than zero.');
    if (product.wholePacks && ['BOX', 'ROLL', 'BUCKET'].includes(unit.code) && !Number.isInteger(quantity))
        throw new Error('This product must be ordered in whole packs.');
}
