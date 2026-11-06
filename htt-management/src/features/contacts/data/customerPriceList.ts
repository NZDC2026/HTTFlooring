import type { Product,ProductUnit } from "../../inventory/types/product";
import type { CustomerPrice } from "../types/customerPricing";
export type CustomerPriceListRow={id:string;product:Product;unit:ProductUnit;rule?:CustomerPrice;standard:number;final?:number;source:"Fixed Price"|"Discount Rule"|"Price Group"|"Promotion";status:"Active"|"Scheduled"|"Expired"|"Inactive";from?:string;to?:string;error?:string};
export function priceRuleStatus(rule:CustomerPrice,today:string):CustomerPriceListRow["status"]{return !rule.active?"Inactive":rule.effectiveFrom>today?"Scheduled":rule.effectiveTo&&rule.effectiveTo<today?"Expired":"Active";}
export function createCustomerPriceList(products:Product[],rules:CustomerPrice[],today:string,standard:(p:Product,u:ProductUnit)=>number,resolve:(p:Product,u:ProductUnit,rule?:CustomerPrice)=>{price:number;promotion?:boolean}):CustomerPriceListRow[]{
 const rows:CustomerPriceListRow[]=[];
 for(const p of products)for(const u of p.units){const matching=rules.filter(r=>r.productId===p.id&&r.unitId===u.id),hasActive=matching.some(r=>priceRuleStatus(r,today)==="Active");
  for(const rule of [...matching,...(!hasActive?[undefined]:[])]){let result:{price:number;promotion?:boolean}|undefined,error:string|undefined;try{result=resolve(p,u,rule);}catch(e){error=e instanceof Error?e.message:"Price not configured";}
   rows.push({id:rule?.id||`${p.id}-${u.id}-group`,product:p,unit:u,rule,standard:standard(p,u),final:result?.price,source:result?.promotion?"Promotion":rule?(rule.pricingMethod==="FIXED_PRICE"?"Fixed Price":"Discount Rule"):"Price Group",status:p.status!=="ACTIVE"||!u.active?"Inactive":rule?priceRuleStatus(rule,today):"Active",from:rule?.effectiveFrom,to:rule?.effectiveTo,error});
  }
 }
 return rows;
}
