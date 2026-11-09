import {z} from 'zod';
export const promotionCustomerTypes=['Flooring Retailer','Builder','Developer','Designer','Architect','Installer','End Customer','Other'] as const;
export const promotionAudienceSchema=z.array(z.enum(promotionCustomerTypes)).min(1).max(promotionCustomerTypes.length).refine(types=>new Set(types).size===types.length,'Customer classifications must be unique.');
export function readPromotionAudience(text?:string):string[]{return text?promotionAudienceSchema.parse(JSON.parse(text)):[...promotionCustomerTypes];}
export function promotionMatchesAudience(text:string|undefined,businessType?:string){return !text||readPromotionAudience(text).includes(businessType??'');}
export const promotionCustomerIdsSchema=z.array(z.string().min(1)).max(1000).refine(ids=>new Set(ids).size===ids.length,'Selected customers must be unique.');
export function readPromotionCustomerIds(text?:string):string[]{return text?promotionCustomerIdsSchema.parse(JSON.parse(text)):[];}
export function promotionMatchesCustomer(types:string|undefined,ids:string|undefined,customerId:string,businessType?:string){const selected=readPromotionCustomerIds(ids);return selected.length?selected.includes(customerId):promotionMatchesAudience(types,businessType);}
