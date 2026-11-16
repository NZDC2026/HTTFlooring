import { z } from 'zod';
import type { Product, ProductCategory, ProductUnit } from '../types/product';

export const photoKinds = ['main', 'board', 'styled', 'installed'] as const;
const amount = z.number().finite().nonnegative();
const optionalPrice = amount.optional();
const priceRow = z.object({ store: optionalPrice, installer: optionalPrice, customer: optionalPrice }).strict();
export const productPhotoSchema = z.object({
 id: z.string().min(1).max(100), name: z.string().min(1).max(180),
 kind: z.enum(photoKinds), mime: z.enum(['image/jpeg','image/png','image/webp']),
 data: z.string().max(2_800_000),
}).strict().superRefine((photo, ctx) => {
 try {
  if (!photo.data || photo.data.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(photo.data)) throw Error();
  const raw = atob(photo.data);
  const valid = photo.mime === 'image/png' ? raw.startsWith('\x89PNG\r\n\x1a\n') : photo.mime === 'image/jpeg' ? raw.startsWith('\xff\xd8\xff') : raw.startsWith('RIFF') && raw.slice(8,12) === 'WEBP';
  if (!valid || raw.length > 2 * 1024 * 1024) throw Error();
 } catch { ctx.addIssue({code:'custom',message:'Use a valid PNG, JPEG or WebP photo of at most 2 MB.'}); }
});
export const productSetupSchema = z.object({
 lifecycle: z.enum(['DRAFT','ACTIVE','INACTIVE']), colour: z.string().max(100),
 surfaceFinish: z.string().max(80), materialCore: z.string().max(180),
 wearLayerMm: amount.optional(), warrantyYears: amount.optional(), wearWarrantyYears: amount.optional(),
 wastagePercent: amount.max(100).optional(), boxWeightKg: amount.optional(), boxesPerPallet: z.number().int().nonnegative().optional(), barcode: z.string().max(80),
 floorPrice: optionalPrice,
 marginCostSource: z.enum(['AVERAGE','LAST_PURCHASE','MANUAL']).optional(),
 pricingMode:z.enum(['PRICE','DISCOUNT']).optional(),
 levelDiscounts:z.object({vip:amount.max(100).optional(),vvip:amount.max(100).optional(),container:amount.max(100).optional()}).strict().optional(),
 prices: z.object({ normal:priceRow, vip:priceRow, vvip:priceRow, container:priceRow }).strict(),
 photos: z.array(productPhotoSchema).max(30),
}).strict().superRefine((s,ctx)=>{
 if (s.photos.reduce((n,p)=>n+p.data.length,0)>11_000_000) ctx.addIssue({code:'custom',message:'Product photos must total at most 8 MB.'});
 if (new Set(s.photos.map(p=>p.id)).size!==s.photos.length || ['main','board'].some(k=>s.photos.filter(p=>p.kind===k).length>1)) ctx.addIssue({code:'custom',message:'Photo references must be unique; main and board accept one photo each.'});
});
export type ProductSetup = z.infer<typeof productSetupSchema>;
export type ProductPhoto = z.infer<typeof productPhotoSchema>;
export const priceLevels = ['normal','vip','vvip','container'] as const;
export const priceGroups = ['store','installer','customer'] as const;
export type ProductForm = {
 category: ProductCategory; pattern: NonNullable<Product['pattern']>; sku:string; name:string; status:ProductSetup['lifecycle']; colour:string;
 length:string; width:string; thickness:string; coverage:string; description:string;
 finish:string; core:string; wear:string; warranty:string; wearWarranty:string; wastage:string; weight:string; pallet:string; barcode:string;
 marginCostSource:'AVERAGE'|'LAST_PURCHASE'|'MANUAL'; pricingMode:'PRICE'|'DISCOUNT'; levelDiscounts:Record<'vip'|'vvip'|'container',string>;
 tax:string; cost:string; floor:string; low:string; restock:string;
 prices: Record<typeof priceLevels[number],Record<typeof priceGroups[number],string>>;
 photos: ProductPhoto[];
};
export function newProductForm(sample=false, tax='GST'):ProductForm {
 return {category:'Hybrid',pattern:'Plank',sku:sample?'HYB-BON-NOK-7':'',name:sample?'Bonita Natural Oak Hybrid':'',status:'DRAFT',colour:sample?'Natural Oak':'',length:sample?'1220':'',width:sample?'180':'',thickness:sample?'7':'',coverage:sample?'1.757':'',description:sample?'7 mm hybrid plank, 0.5 mm wear layer, attached 1.5 mm IXPE underlay. Waterproof SPC core.':'',finish:'Matt',core:sample?'SPC core, oak décor':'',wear:sample?'0.5':'',warranty:sample?'25':'',wearWarranty:sample?'15':'',wastage:sample?'5':'',weight:sample?'18.5':'',pallet:sample?'60':'',barcode:sample?'9300000012345':'',marginCostSource:sample?'AVERAGE':'MANUAL',pricingMode:'PRICE',levelDiscounts:{vip:sample?'6':'',vvip:sample?'11':'',container:sample?'22':''},tax,cost:'',floor:sample?'36.00':'',low:sample?'40':'0',restock:sample?'120':'0',prices:{normal:{store:sample?'49.90':'',installer:sample?'54.90':'',customer:sample?'67.90':''},vip:{store:sample?'46.90':'',installer:sample?'51.90':'',customer:''},vvip:{store:sample?'44.50':'',installer:sample?'49.50':'',customer:''},container:{store:sample?'39.00':'',installer:'',customer:''}},photos:[]};
}
const optionalNumber=(s:string)=>s.trim()===''?undefined:Number(s);
export function buildNewProduct(f:ProductForm, includeCost=true, id:string=crypto.randomUUID()):Product {
 if (![f.length,f.width,f.thickness,f.coverage].every(s=>s.trim()!==''&&Number.isFinite(Number(s))&&Number(s)>0)) throw Error('Enter positive dimensions and SQM per box.');
 if (!f.sku.trim() || !f.name.trim() || f.prices.normal.store.trim()==='') throw Error('Category, SKU, product name and the Normal Store price are required.');
 if (!Number.isFinite(Number(f.low)) || Number(f.low)<0 || !Number.isFinite(Number(f.restock)) || Number(f.restock)<Number(f.low)) throw Error('Restock up to must be at least the low stock alert.');
 const computedPrices=productFormPrices(f);
 const prices = Object.fromEntries(priceLevels.map(level=>[level,Object.fromEntries(priceGroups.map(group=>[group,optionalNumber(computedPrices[level][group])]))])) as ProductSetup['prices'];
 const setup=productSetupSchema.parse({lifecycle:f.status,colour:f.colour,surfaceFinish:f.finish,materialCore:f.core,wearLayerMm:optionalNumber(f.wear),warrantyYears:optionalNumber(f.warranty),wearWarrantyYears:optionalNumber(f.wearWarranty),wastagePercent:optionalNumber(f.wastage),boxWeightKg:optionalNumber(f.weight),boxesPerPallet:optionalNumber(f.pallet),barcode:f.barcode,floorPrice:optionalNumber(f.floor),marginCostSource:f.marginCostSource,pricingMode:f.pricingMode,levelDiscounts:Object.fromEntries(Object.entries(f.levelDiscounts).map(([k,v])=>[k,optionalNumber(v)])),prices,photos:f.photos});
 const baseId=`${id}-m2`, boxId=`${id}-box`, coverage=Number(f.coverage);
 const makeUnit=(box:boolean):ProductUnit=>{const factor=box?coverage:1, price=(v:number|undefined)=>v===undefined?undefined:Math.round(v*factor*1e6)/1e6;return {id:box?boxId:baseId,code:box?'BOX':'M2',name:box?'Box':'Square metre',symbol:box?'box':'m²',conversionToBase:factor,basePrice:price(prices.normal.store)!,tradePrice:price(prices.normal.installer),publicPrice:price(prices.normal.customer),vipPrice:price(prices.vip.store),vvipPrice:price(prices.vvip.store),containerPrice:price(prices.container.store),isBaseUnit:!box,active:true};};
 return {id,sku:f.sku.trim(),name:f.name.trim(),category:f.category,pattern:f.pattern,status:f.status==='ACTIVE'?'ACTIVE':'INACTIVE',description:f.description,dimensions:{lengthMm:Number(f.length),widthMm:Number(f.width),thicknessMm:Number(f.thickness)},referenceCostPrice:includeCost?optionalNumber(f.cost):undefined,itemType:'STOCK',buyEnabled:true,sellEnabled:true,baseUnitId:baseId,measureUnitId:boxId,units:[makeUnit(false),makeUnit(true)],wholePacks:true,taxCode:f.tax,reorderPoint:Math.round(Number(f.low)*coverage*1e6)/1e6,targetStock:Math.round(Number(f.restock)*coverage*1e6)/1e6,setup,createdAt:'',updatedAt:''};
}
export function generateProductSku(f:ProductForm, existing:string[]) {
 const category={Hybrid:'HYB',Timber:'TIM',Laminate:'LAM',Vinyl:'VIN',Carpet:'CAR',Accessories:'ACC',Other:'OTH'}[f.category];
 const words=(f.name||'New Product').trim().split(/\s+/), colour=f.colour.trim().split(/\s+/).map(w=>w.slice(0,1)).join('');
 const base=[category,words[0].slice(0,3).toUpperCase(),colour.toUpperCase()||'NEW',f.thickness||'0'].join('-');
 let sku=base,n=2;while(existing.some(v=>v.toUpperCase()===sku))sku=`${base}-${n++}`;return sku;
}

/** A level's one discount applies to each customer's own Normal price. */
export function productFormPrices(f:ProductForm):ProductForm['prices'] {
 if(f.pricingMode==='PRICE')return f.prices;
 const next=structuredClone(f.prices);
 for(const level of ['vip','vvip','container'] as const){
  const raw=f.levelDiscounts[level],discount=Number(raw);
  if(raw!==''&&(!Number.isFinite(discount)||discount<0||discount>100))throw Error('Level discounts must be between 0 and 100%.');
  for(const group of priceGroups){const normal=f.prices.normal[group]||f.prices.normal.store;next[level][group]=raw===''||normal===''?'':(Math.round(Number(normal)*(1-discount/100)*100)/100).toFixed(2);}
 }
 return next;
}
