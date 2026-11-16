import type {Product} from '../types/product';
import {samplePriceProducts} from './priceUpdateModel';
/** Synthetic catalogue only; never saved to the product repository. */
export function samplePriceCatalogue():Product[]{
 const rows:[string,string,string,Product['category'],Product['pattern'],string,number][]=[
 ['Oak 2200','Natural','TM-OAK-2200-NA','Timber','Plank','M2',58.9],
 ['SPC 1800','Grey Oak','MR-1806-GROT','Hybrid','Plank','M2',42.9],
 ['21mm Laminate','Nthen Grey','LJK-1215-JAMEIN','Laminate','Plank','M2',31.5],
 ['TEMAC Timber Adhesive','15kg','A5TI-TEMAC-15','Accessories',undefined,'PIECE',61.82],
 ['Acoustic Underlay','2mm','AC-UNDER-KOLLA','Accessories',undefined,'ROLL',75],
 ['Stair Nose','Oak','TR-STARR-ODK','Accessories',undefined,'PIECE',22.9],
 ['Moisture Barrier','200µm','ME-TEMAC-40K','Accessories',undefined,'ROLL',49.9],
 ['Setto Self Levelling','20kg','SL-SETTIC-00','Accessories',undefined,'PIECE',52],
 ['Crosswood','Oak','CW-HB-1890-OK','Timber','Herringbone','M2',89.9],
 ['Heritage','Oak','HT-CV-1800-OK','Timber','Chevron','M2',99.9],
 ];
 const make=(collection:string,colour:string,sku:string,category:Product['category'],pattern:Product['pattern'],code:string,price:number,i:number):Product=>{const id=`sample-catalogue-${i}`,unit=id+'-unit';return {id,sku,name:`${collection} ${colour}`,collection,category,pattern,status:'ACTIVE',baseUnitId:unit,units:[{id:unit,code:code as Product['units'][number]['code'],name:code==='M2'?'Square metre':code==='ROLL'?'Roll':'Piece',symbol:code==='M2'?'m²':code==='ROLL'?'roll':'pc',conversionToBase:1,basePrice:price,tradePrice:Math.round(price*1.1*100)/100,publicPrice:Math.round(price*1.3*100)/100,isBaseUnit:true,active:true}],revision:0,createdAt:'2026-11-01T00:00:00Z',updatedAt:'2026-11-01T00:00:00Z'};};
 const stock=rows.map((r,i)=>make(...r,i));
 const alpine=['Natural Oak','Smoked Oak','Silver Oak','Ash Grey','Warm Oak'].map((c,i)=>make('Alpine',c,`HYB-ALP-${i+1}`,'Hybrid','Plank','M2',44.9,20+i));
 const coastal=['Natural Oak','Sand Oak','Coastal Grey','White Oak'].map((c,i)=>make('Coastal',c,`LAM-CST-${i+1}`,'Laminate','Plank','M2',29.9,25+i));
 return [...stock,...samplePriceProducts(),...alpine,...coastal];
}
export const hasPatternFilter=(category:string)=>!!category&&category!=='Accessories'&&category!=='Other';
export function filterPriceCatalogue(products:Product[],category:string,pattern:string,collection:string,query:string){const q=query.trim().toLowerCase();return products.filter(p=>(!category||p.category===category)&&(!hasPatternFilter(category)||!pattern||p.pattern===pattern)&&(!collection||(p.collection||p.name)===collection)&&`${p.name} ${p.sku} ${p.setup?.colour??''}`.toLowerCase().includes(q));}
