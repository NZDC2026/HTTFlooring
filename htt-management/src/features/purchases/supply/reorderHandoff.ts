import {z} from 'zod';
import type {Product} from '../../inventory/types/product';
const schema=z.object({supplierId:z.string().min(1),supplierName:z.string().min(1),lines:z.array(z.object({productId:z.string().min(1),unitId:z.string().min(1),quantity:z.number().finite().positive().max(1000000),cost:z.number().finite().nonnegative()}).strict()).min(1).max(1000)});
export type ReorderHandoff=z.infer<typeof schema>&{products?:Product[]};
export function readReorderHandoff(raw:unknown,sample:boolean):ReorderHandoff|undefined{const parsed=schema.safeParse(raw);if(!parsed.success)return undefined;const products=sample&&(raw as {products?:Product[]}).products;return {...parsed.data,...(products&&Array.isArray(products)?{products}:{})};}
