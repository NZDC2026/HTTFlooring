import type { Product, ProductUnit, UnitCode } from '../types/product';
export const measureNames:Partial<Record<UnitCode,string>>={BOX:'Box',ROLL:'Roll',PIECE:'Piece',BUCKET:'Bucket',M2:'m²',LM:'Linear metre',HOUR:'Hour',JOB:'Job'};
export function measureUnit(p:Product){return p.units.find(u=>u.id===p.measureUnitId)??p.units.find(u=>u.active&&!u.isBaseUnit)??p.units.find(u=>u.id===p.baseUnitId);}
export function selectMeasureUnit(p:Product,code:UnitCode,id:string):Product{
 const found=p.units.find(u=>u.active&&u.code===code);
 if(found)return {...p,measureUnitId:found.id};
 if(p.itemType==='SERVICE'||p.itemType==='NON_STOCK')throw Error('Use an existing unit for service and non-stock items.');
 const base=p.units.find(u=>u.id===p.baseUnitId);if(!base)throw Error('Set up a pricing base unit first.');
 const unit:ProductUnit={id,code,name:measureNames[code]||code,symbol:code.toLowerCase(),conversionToBase:1,basePrice:base.basePrice,isBaseUnit:false,active:true};
 return {...p,measureUnitId:id,units:[...p.units,unit]};
}
export function setMeasureLabel(p:Product,label:string,id:string):Product {
 const name=label.trim();if(!name||name.length>80)throw Error('Enter a Measure Type of 1–80 characters.');
 const code=Object.entries(measureNames).find(([,value])=>value?.toLowerCase()===name.toLowerCase())?.[0] as UnitCode|undefined;
 const existing=p.units.find(u=>u.active&&(u.name.toLowerCase()===name.toLowerCase()||u.symbol.toLowerCase()===name.toLowerCase()||(code&&u.code===code)));
 if(existing)return {...p,measureUnitId:existing.id};
 if(p.itemType==='SERVICE'||p.itemType==='NON_STOCK')throw Error('Use an existing unit for service and non-stock items.');
 if(!p.units.some(u=>u.id===p.baseUnitId))throw Error('Set up a base unit first.');
 const unit:ProductUnit={id,code:code??'PIECE',name,symbol:name,conversionToBase:1,basePrice:0,isBaseUnit:false,active:true};
 return {...p,measureUnitId:id,units:[...p.units,unit]};
}
export function measureCoverage(p:Product,unitId:string,coverage:number):Product {
 if(!Number.isFinite(coverage)||coverage<=0)throw Error('Coverage must be positive.');
 const unit=p.units.find(u=>u.id===unitId);if(!unit)throw Error('Select a valid selling unit.');
 if(unit.isBaseUnit&&coverage!==1)throw Error('The base unit conversion must remain 1.');
 return {...p,units:p.units.map(u=>u.id===unitId?{...u,conversionToBase:coverage}:u)};
}
