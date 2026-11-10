import type {Product} from '../inventory/types/product';
/** Friendly CSV columns; prices are per base unit, never inventory postings. */
export function productTransferFields(values:Record<string,string>,existing?:Product):Record<string,string>{
 const output={...values};
 if(values.costPrice?.trim()){
  const price=Number(values.costPrice);if(!Number.isFinite(price)||price<0)throw new Error('Cost Price must be a nonnegative number.');
  output.referenceCostPrice=String(price);
 }
 if(![values.unit,values.coveragePerUnit,values.sellingPrice].some(v=>v?.trim()))return output;
 if(values.unitsJson?.trim())throw new Error('Use either Unit / Coverage / Selling Price or unitsJson, not both.');
 const unit=(values.unit||existing?.units.find(u=>u.id===existing.measureUnitId)?.code||existing?.units.find(u=>u.id===existing.baseUnitId)?.code||'PIECE').trim().toUpperCase();
 const code=({SQM:'M2','M²':'M2',BOX:'BOX',ROLL:'ROLL',PIECE:'PIECE',PC:'PIECE',BUCKET:'BUCKET',M2:'M2',HOUR:'HOUR',JOB:'JOB',LM:'LM'} as Record<string,string>)[unit];
 if(!code)throw new Error('Unit must be m², Box, Roll, Piece, Bucket, LM, Hour or Job.');
 const coverage=values.coveragePerUnit?.trim()?Number(values.coveragePerUnit):undefined;
 if(coverage!==undefined&&(!Number.isFinite(coverage)||coverage<=0))throw new Error('Coverage per Unit must be positive.');
 const hasArea=code==='M2'||coverage!==undefined;
 if(code==='M2'&&coverage!==undefined&&coverage!==1)throw new Error('m² coverage must be 1.');
 const baseCode=hasArea?'M2':code;
 const oldBase=existing?.units.find(u=>u.id===existing.baseUnitId);
 if(oldBase&&oldBase.code!==baseCode)throw new Error('Base unit changes require product setup; use the existing base unit.');
 const price=values.sellingPrice?.trim()?Number(values.sellingPrice):oldBase?.basePrice??0;
 if(!Number.isFinite(price)||price<0)throw new Error('Selling Price must be a nonnegative number.');
 const names:Record<string,string>={M2:'Square Metre',BOX:'Box',ROLL:'Roll',PIECE:'Piece',BUCKET:'Bucket',LM:'Linear Metre',HOUR:'Hour',JOB:'Job'};
 const symbols:Record<string,string>={M2:'m²',BOX:'box',ROLL:'roll',PIECE:'pc',BUCKET:'bucket',LM:'LM',HOUR:'hour',JOB:'job'};
 const units=existing?existing.units.map(u=>({...u})):[];
 const upsert=(c:string,conversion:number,isBase:boolean)=>{
  const found=units.find(u=>u.code===c&&(isBase?u.isBaseUnit:!u.isBaseUnit));
  if(found){found.conversionToBase=conversion;found.basePrice=price*conversion;}
  else units.push({id:'',code:c as Product['units'][number]['code'],name:names[c],symbol:symbols[c],conversionToBase:conversion,basePrice:price*conversion,isBaseUnit:isBase,active:true});
 };
 upsert(baseCode,1,true);if(code!==baseCode)upsert(code,coverage!,false);
 output.baseUnitCode=baseCode;output.unitsJson=JSON.stringify(units.map(u=>{const {id,...rest}=u;return id?{...rest,id}:rest;}));
 return output;
}
