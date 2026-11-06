import type { Customer } from "../types/customer";
import type { ProductUnit } from "../../inventory/types/product";
export const pricingTiers=["STANDARD","VIP","VVIP","CONTAINER"] as const;
export type PricingTier=typeof pricingTiers[number];
export function customerPriceGroup(type:string):"A"|"B"|"C" {
 if(type==="Flooring Retailer")return "A";
 if(["Builder","Developer","Designer","Architect","Installer"].includes(type))return "B";
 return "C";
}
export const priceFields={tradePrice:"B · Standard / Installer",publicPrice:"C · Standard / Public",vipPrice:"A · VIP",vvipPrice:"A · VVIP",containerPrice:"A · Container"} as const;
export function groupUnitPrice(customer:Pick<Customer,"businessType"|"pricingTier">|undefined,unit:ProductUnit) {
 const group=customerPriceGroup(customer?.businessType??"Flooring Retailer");
 if(group==="B")return unit.tradePrice??unit.basePrice;
 if(group==="C")return unit.publicPrice??unit.basePrice;
 const tier=customer?.pricingTier??"STANDARD";
 const value=tier==="VIP"?unit.vipPrice:tier==="VVIP"?unit.vvipPrice:tier==="CONTAINER"?unit.containerPrice:unit.basePrice;
 if(value===undefined)throw new Error(`${tier} price has not been configured for this product unit. Set the price or select Standard.`);
 return value;
}
