import { z } from "zod";
import { requireDateKey } from "../../../lib/businessDate";
import type { Product } from "../../inventory/types/product";
import type { CustomerPrice } from "../types/customerPricing";
export const brandPriceInput=z.object({brand:z.string().trim().min(1),unitCode:z.string().min(1),price:z.number().finite().nonnegative(),effectiveFrom:z.string(),effectiveTo:z.string(),replaceExisting:z.boolean(),expectedSignature:z.string()}).strict();
export type BrandPriceInput=z.infer<typeof brandPriceInput>;
export function brandPricePreview(products:Product[],rules:CustomerPrice[],customerId:string,input:Pick<BrandPriceInput,"brand"|"unitCode"|"effectiveFrom"|"effectiveTo">) {
 requireDateKey(input.effectiveFrom);if(input.effectiveTo)requireDateKey(input.effectiveTo);
 if(input.effectiveTo&&input.effectiveTo<input.effectiveFrom)throw new Error("End date cannot be before start date.");
 const targets=products.filter(p=>p.status==="ACTIVE"&&p.sellEnabled!==false&&p.brand?.trim()===input.brand.trim()).flatMap(p=>p.units.filter(u=>u.active&&u.code===input.unitCode).map(u=>({productId:p.id,unitId:u.id,product:p.name,sku:p.sku,unit:u.name,symbol:u.symbol,conversion:u.conversionToBase})));
 const rows=targets.map(t=>({...t,existing:rules.filter(r=>r.customerId===customerId&&r.productId===t.productId&&r.unitId===t.unitId&&r.active&&r.effectiveFrom<=(input.effectiveTo||"9999-12-31")&&(r.effectiveTo||"9999-12-31")>=input.effectiveFrom)}));
 return {rows,signature:JSON.stringify(rows)};
}
export function shiftPricingDay(date:string,days:number) { const d=new Date(`${date}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10); }
