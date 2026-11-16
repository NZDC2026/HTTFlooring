import {z} from 'zod';
import type {Product} from '../types/product';
export const levels=['normal','vip','vvip','container'] as const;
export const groups=['store','installer','customer'] as const;
export const cells=levels.flatMap(l=>groups.map(g=>`${l}.${g}` as const));
export type PriceCell=typeof cells[number]|'floor';
const amount=z.number().finite().min(0).max(1_000_000_000);
const priceRow=z.object({store:amount.optional(),installer:amount.optional(),customer:amount.optional()}).strict();
export const levelPricesSchema=z.object({normal:priceRow,vip:priceRow,vvip:priceRow,container:priceRow}).strict();
export const priceChangeSchema=z.object({cell:z.enum([...cells,'floor']),before:amount.optional(),after:amount}).strict();
export const priceHistorySchema=z.object({operationId:z.string().min(1).max(100),actorId:z.string().min(1).max(200),at:z.string().min(1),signature:z.string(),changes:z.array(priceChangeSchema).min(1).max(13)}).strict();
export const priceUpdateSchema=z.object({operationId:z.string().min(1).max(100),products:z.array(z.object({id:z.string().min(1),expectedRevision:z.number().int().nonnegative(),prices:z.array(z.object({cell:z.enum([...cells,'floor']),value:amount}).strict()).min(1).max(13)}).strict()).min(1).max(200)}).strict();
export type PriceUpdate=z.infer<typeof priceUpdateSchema>;
export function productPrices(p:Product):z.infer<typeof levelPricesSchema>{
 const base=p.units.find(u=>u.id===p.baseUnitId)!;
 const extra=p.levelPrices??p.setup?.prices;
 return {normal:{store:base.basePrice,installer:base.tradePrice,customer:base.publicPrice},vip:{store:base.vipPrice,installer:extra?.vip.installer,customer:extra?.vip.customer},vvip:{store:base.vvipPrice,installer:extra?.vvip.installer,customer:extra?.vvip.customer},container:{store:base.containerPrice,installer:extra?.container.installer,customer:extra?.container.customer}};
}
export function priceValue(p:Product,cell:PriceCell):number|undefined {if(cell==='floor')return p.setup?.floorPrice??p.priceFloor;const [l,g]=cell.split('.') as [typeof levels[number],typeof groups[number]];return productPrices(p)[l][g];}
export function applyProductPrices(p:Product,updates:{cell:PriceCell;value:number}[],actorId:string,operationId:string,signature:string,at:string):Product {
 const prices=productPrices(p),changes:z.infer<typeof priceChangeSchema>[]=[];let floor=p.setup?.floorPrice??p.priceFloor;
 for(const {cell,value}of updates){const before=priceValue(p,cell);if(before===value)continue;changes.push({cell,before,after:value});if(cell==='floor')floor=value;else{const [l,g]=cell.split('.') as [typeof levels[number],typeof groups[number]];prices[l][g]=value;}}
 if(!changes.length)return p;
 const rounded=(v:number|undefined,factor:number)=>v===undefined?undefined:Math.round(v*factor*1e6)/1e6;
 const fields={'normal.store':'basePrice','normal.installer':'tradePrice','normal.customer':'publicPrice','vip.store':'vipPrice','vvip.store':'vvipPrice','container.store':'containerPrice'} as const;
 const units=p.units.map(u=>{const next={...u};for(const change of changes){const field=fields[change.cell as keyof typeof fields];if(field)next[field]=rounded(change.after,u.conversionToBase)!;}return next;});
 return {...p,units,levelPrices:prices,priceFloor:floor,...(p.setup?{setup:{...p.setup,prices,floorPrice:floor,...(changes.some(c=>c.cell!=='floor')?{pricingMode:'PRICE' as const,levelDiscounts:undefined}:{})}}:{}),revision:(p.revision??0)+1,updatedAt:at,priceHistory:[...(p.priceHistory??[]),{operationId,actorId,at,signature,changes}]};
}
export function priceProductName(p:Product){return p.collection||p.name;}
export function priceColour(p:Product){return p.setup?.colour||p.name.replace(p.collection??'','').replace(/^[\s–-]+/,'')||p.name;}
export function samplePriceProducts():Product[]{
 const colours=['Natural Oak','Smoked Oak','Grey Wash','Classic Oak','Blonde Oak','Coffee Oak','Ash Grey','Sandy Oak','Black Oak','White Wash'];
 const codes=['NOK','SOK','GRW','CLO','BLO','COF','ASH','SND','BLK','WHW'];
 return colours.map((colour,i)=>({id:`sample-price-${i}`,sku:`ENG-BON-${codes[i]}`,name:`Bonita ${colour}`,collection:'Bonita',category:'Timber',pattern:'Plank',status:'ACTIVE',baseUnitId:`sample-price-${i}-m2`,measureUnitId:`sample-price-${i}-box`,units:[{id:`sample-price-${i}-m2`,code:'M2',name:'Square metre',symbol:'m²',conversionToBase:1,basePrice:i===8?55.9:i===9?52.9:49.9,tradePrice:i===8?60.9:i===9?57.9:54.9,publicPrice:i===8?73.9:i===9?70.9:67.9,vipPrice:46.9,vvipPrice:44.5,containerPrice:39,isBaseUnit:true,active:true},{id:`sample-price-${i}-box`,code:'BOX',name:'Box',symbol:'box',conversionToBase:2.4,basePrice:(i===8?55.9:i===9?52.9:49.9)*2.4,isBaseUnit:false,active:true}],revision:0,itemType:'STOCK',buyEnabled:true,sellEnabled:true,createdAt:'2026-11-01T00:00:00Z',updatedAt:'2026-11-01T00:00:00Z'}));
}
