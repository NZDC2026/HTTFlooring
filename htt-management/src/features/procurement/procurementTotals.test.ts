import {describe,it,expect} from 'vitest';
import {procurementTotals} from './procurementTotals';
describe('Procurement landed cost',()=>{
 it('aggregates category amounts and only material area, including boxes and sqm',()=>{
 const batch={links:JSON.stringify([{role:'Materials',orderId:'a'},{role:'Materials',orderId:'b'},{role:'Freight',orderId:'c'},{role:'Customs Clearance',orderId:'d'}])};
 const order=(id:string,total:number,lines:any[]=[])=>({id,totals:{subtotal:total,taxAmount:0,total},lines});
 const result=procurementTotals(batch,[order('a',100,[{orderedQuantity:10,coveragePerUnit:2.166,unitSymbol:'Box'}]),order('b',50,[{orderedQuantity:5,unitSymbol:'m²'},{orderedQuantity:20,unitSymbol:'Piece'}]),order('c',30,[{orderedQuantity:999,unitSymbol:'m²'}]),order('d',20)]);
 expect(result.amounts).toEqual({Materials:150,Freight:30,'Customs Clearance':20});expect(result.qty).toBe(26.66);expect(result.total).toBe(200);expect(result.landedCost).toBeCloseTo(200/26.66);
 });
 it('avoids division by zero when no area is recorded',()=>{expect(procurementTotals({links:'[]'},[]).landedCost).toBeUndefined();});
});
