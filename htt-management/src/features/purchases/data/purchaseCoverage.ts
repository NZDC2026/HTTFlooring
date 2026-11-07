import type { Product,ProductUnit } from '../../inventory/types/product';
export function coveragePerUnit(product:Product|undefined,unit:ProductUnit|undefined){
 const area=product?.units.find(u=>u.code==='M2');if(!area||!unit||!Number.isFinite(area.conversionToBase)||area.conversionToBase<=0||!Number.isFinite(unit.conversionToBase)||unit.conversionToBase<=0)return undefined;
 return Number((unit.conversionToBase/area.conversionToBase).toPrecision(12));
}
function fraction(n:number):[bigint,bigint]{const [coefficient,exponent='0']=n.toString().toLowerCase().split('e'),[integer,decimals='']=coefficient.split('.'),power=decimals.length-Number(exponent),digits=BigInt(integer+decimals);return power>=0?[digits,10n**BigInt(power)]:[digits*10n**BigInt(-power),1n];}
/** Decimal rational ceil avoids both floating-point extra boxes and rounding down shortages. */
export function boxesForCoverage(coverage:number,perBox:number){
 if(!Number.isFinite(coverage)||coverage<=0||!Number.isFinite(perBox)||perBox<=0)throw Error('Coverage and coverage per box must be greater than zero.');
 const [a,b]=fraction(coverage),[c,d]=fraction(perBox),numerator=a*d,denominator=b*c,result=Number((numerator+denominator-1n)/denominator);
 if(!Number.isSafeInteger(result))throw Error('Quantity is too large.');return result;
}
export const actualCoverage=(quantity:number,perUnit:number)=>Math.round((quantity*perUnit+Number.EPSILON)*1e8)/1e8;
/** Area-priced flooring and underlay; pieces, buckets and other accessories retain unit pricing. */
export function purchasePricingFactor(product:Product|undefined,unit:ProductUnit|undefined){return unit&&['M2','BOX','ROLL'].includes(unit.code)?coveragePerUnit(product,unit):undefined;}
