import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { registerRepository, snapshotRepositories } from '../security/repositoryHost';
import { mockProducts } from '../inventory/data/mockProducts';
import { productCostingRepository } from '../inventory/data/productCostingRepository';
import { activeTaxRate } from './configurationState';
import type { Product } from '../inventory/types/product';
const unitSchema = z.object({ id: z.string().min(1), code: z.enum(['M2', 'LM', 'BOX', 'PIECE', 'ROLL', 'BUCKET']), name: z.string().trim().min(1), symbol: z.string().min(1), conversionToBase: z.number().finite().positive(), basePrice: z.number().finite().nonnegative(), isBaseUnit: z.boolean(), active: z.boolean() }).strict();
export const productSchema = z.object({ id: z.string().min(1), sku: z.string().trim().min(1).max(80), name: z.string().trim().min(1).max(180), category: z.enum(['Timber', 'Hybrid', 'Laminate', 'Vinyl', 'Carpet', 'Accessories', 'Other']), brand: z.string().optional(), collection: z.string().optional(), description: z.string().optional(), status: z.enum(['ACTIVE', 'INACTIVE']), baseUnitId: z.string().min(1), units: z.array(unitSchema).min(1), createdAt: z.string(), updatedAt: z.string(), revision: z.number().int().nonnegative().optional(), itemType: z.enum(['STOCK', 'NON_STOCK', 'SERVICE']).optional(), buyEnabled: z.boolean().optional(), sellEnabled: z.boolean().optional(), reorderPoint: z.number().finite().nonnegative().optional(), targetStock: z.number().finite().nonnegative().optional(), wholePacks: z.boolean().optional(), taxCode: z.string().min(1).optional() }).strict();
const listeners = new Set<() => void>();
let view: Product[] = [...mockProducts];
function publish() { view = [...mockProducts]; listeners.forEach(fn => fn()); }
function references(value: unknown, id: string, unitId?: string): boolean { if (Array.isArray(value))
    return value.some(r => references(r, id, unitId)); if (!value || typeof value !== 'object')
    return false; const r = value as Record<string, unknown>; return (r.productId === id && (!unitId || r.unitId === unitId)) || Object.values(r).some(v => references(v, id, unitId)); }
export function validateProducts(rows: unknown): Product[] {
    const parsed = z.array(productSchema).parse(rows);
    const ids = new Set<string>(), skus = new Set<string>();
    for (const p of parsed) {
        if (ids.has(p.id) || skus.has(p.sku.toLowerCase()))
            throw new Error('Duplicate product ID or SKU.');
        ids.add(p.id);
        skus.add(p.sku.toLowerCase());
        const units = new Set(p.units.map(u => u.id));
        if (units.size !== p.units.length || p.units.filter(u => u.isBaseUnit).length !== 1 || !p.units.some(u => u.id === p.baseUnitId && u.isBaseUnit && u.conversionToBase === 1))
            throw new Error('A product needs exactly one valid base unit.');
        if ((p.targetStock ?? 0) < (p.reorderPoint ?? 0))
            throw new Error('Target stock must be at least the reorder point.');
    }
    return parsed;
}
export const productRepository = {
    subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }, getSnapshot: () => view, getAll: () => mockProducts, getById: (id: string) => mockProducts.find(p => p.id === id),
    save(input: Product, expectedRevision?: number) {
        const data = productSchema.parse(input) as Product, current = mockProducts.find(p => p.id === data.id);
        if (current && expectedRevision !== (current.revision ?? 0))
            throw new Error('Product changed since it was opened. Reload before saving.');
        if (!current && expectedRevision !== undefined)
            throw new Error('Product no longer exists.');
        activeTaxRate(data.taxCode ?? 'GST');
        if (data.itemType && data.itemType !== 'STOCK')
            throw new Error('Only stocked products are supported by the current fulfilment workflow.');
        const snapshots = snapshotRepositories();
        delete snapshots.products;
        if (current) {
            if (current.baseUnitId !== data.baseUnitId && references(snapshots, data.id))
                throw new Error('A referenced product cannot change base unit.');
            for (const old of current.units) {
                const next = data.units.find(u => u.id === old.id);
                if ((!next || next.conversionToBase !== old.conversionToBase || next.code !== old.code) && references(snapshots, data.id, old.id))
                    throw new Error('A referenced unit conversion cannot be changed or removed. Add a new unit instead.');
            }
        }
        const now = new Date().toISOString(), product = { ...data, createdAt: current?.createdAt ?? now, updatedAt: now, revision: (current?.revision ?? 0) + 1 };
        validateProducts([...mockProducts.filter(p => p.id !== data.id), product]);
        if (current)
            mockProducts.splice(mockProducts.indexOf(current), 1, product);
        else
            mockProducts.push(product);
        productCostingRepository.ensureProductPolicy(product.id, product.baseUnitId, product.itemType !== 'SERVICE' && product.itemType !== 'NON_STOCK');
        publish();
        return product;
    }
};
registerRepository('products', { validate: (value,snapshots) => { const products=validateProducts((value as {products:unknown}).products);const taxes=(snapshots.workspace_tax_codes as {records:{code:string}[]}).records;if(products.some(p=>!taxes.some(t=>t.code===(p.taxCode??'GST'))))throw new Error('Backup product tax-code reference is invalid.'); }, repository: productRepository, read: 'inventory.read', commands: { save: 'inventory.adjust' }, snapshot: () => ({ products: structuredClone(mockProducts) }), restore: value => { const rows = validateProducts(value.products); mockProducts.splice(0, mockProducts.length, ...rows); view = [...mockProducts]; }, publish });
export function useProducts() { return useSyncExternalStore(productRepository.subscribe, productRepository.getSnapshot, productRepository.getSnapshot); }
