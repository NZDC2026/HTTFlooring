import { expect,it } from "vitest";
import { createCustomerPriceList } from "./customerPriceList";
import type { Product,ProductUnit } from "../../inventory/types/product";
import type { CustomerPrice } from "../types/customerPricing";
const unit={id:"m2",code:"M2" as const,name:"Square metre",symbol:"m²",conversionToBase:1,basePrice:50,isBaseUnit:true,active:true};
const p:Product={id:"p",sku:"P",name:"Oak",category:"Timber",status:"ACTIVE",baseUnitId:"m2",units:[unit],createdAt:"",updatedAt:""};
const rule=(id:string,patch:Partial<CustomerPrice>={}):CustomerPrice=>({id,customerId:"c",productId:"p",unitId:"m2",pricingMethod:"FIXED_PRICE",fixedPrice:40,effectiveFrom:"2026-01-01",active:true,createdAt:"2026-01-01",updatedAt:"2026-01-01",...patch});
const resolve=(_p:Product,_u:ProductUnit,r?:CustomerPrice)=>({price:r?.fixedPrice??50});
it("shows price group defaults for products without a current special and preserves future rule visibility",()=>{
 const rows=createCustomerPriceList([p],[rule("future",{effectiveFrom:"2027-01-01"})],"2026-11-06",()=>50,resolve);
 expect(rows).toHaveLength(2);expect(rows.find(r=>r.rule)?.status).toBe("Scheduled");expect(rows.find(r=>!r.rule)).toMatchObject({source:"Price Group",status:"Active",final:50});
});
it("uses the current special without a duplicate default and attributes promotional prices accurately",()=>{
 expect(createCustomerPriceList([p],[rule("current")],"2026-11-06",()=>50,resolve)).toMatchObject([{source:"Fixed Price",final:40,status:"Active"}]);
 expect(createCustomerPriceList([p],[rule("current")],"2026-11-06",()=>50,()=>({price:35,promotion:true}))[0].source).toBe("Promotion");
});
it("handles inactive and expired rules and reports unconfigured tiers without inventing a final price",()=>{
 const rows=createCustomerPriceList([p],[rule("old",{effectiveTo:"2026-03-31"}),rule("disabled",{active:false})],"2026-11-06",()=>50,resolve);
 expect(rows.map(r=>r.status)).toEqual(["Expired","Inactive","Active"]);
 const missing=createCustomerPriceList([p],[],"2026-11-06",()=>50,()=>{throw Error("Not configured");})[0];expect(missing.final).toBeUndefined();expect(missing.error).toBe("Not configured");
});
