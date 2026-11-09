import type {Product} from '../../inventory/types/product';
export function salesUnitLabel(unit:Product['units'][number]){return unit.code==='M2'?'sqm':unit.code==='BOX'?'Box':unit.code==='ROLL'?'Roll':unit.code==='PIECE'?'Piece':unit.code==='BUCKET'?'Bucket':unit.symbol;}
export function changeSalesEntryUnit(product:Product,previousId:string,nextId:string,quantity:number,unitPrice?:number){
 const old=product.units.find(u=>u.id===previousId),next=product.units.find(u=>u.id===nextId&&u.active),base=product.units.find(u=>u.id===product.baseUnitId);
 if(!next)throw Error('Select an active selling unit.');
 if(base?.code!=='M2'||!old||old.conversionToBase<=0||next.conversionToBase<=0)return {unitId:nextId,quantity,unitPrice:undefined,requestedArea:undefined};
 const area=quantity*old.conversionToBase,ratio=area/next.conversionToBase,nearest=Math.round(ratio);
 const converted=next.code==='BOX'?(Math.abs(ratio-nearest)<Number.EPSILON*Math.max(1,ratio)*4?nearest:Math.ceil(ratio)):Number(ratio.toFixed(8));
 return {unitId:nextId,quantity:converted,unitPrice:unitPrice===undefined?undefined:unitPrice/old.conversionToBase*next.conversionToBase,requestedArea:undefined};
}
