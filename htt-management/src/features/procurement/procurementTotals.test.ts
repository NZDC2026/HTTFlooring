import {describe,it,expect} from 'vitest';
import {procurementTotals} from './procurementTotals';
describe('Procurement landed cost',()=>{
 it('aggregates category amounts and only material area, including boxes and sqm',()=>{
 const batch={links:JSON.stringify([{role:'Materials',orderId:'a'},{role:'Materials',orderId:'b'},{role:'Freight',orderId:'c'},{role:'Customs Clearance',orderId:'d'}])};
 const order=(id:string,total:number,lines:any[]=[])=>({id,totals:{subtotal:total,taxAmount:0,total},lines});
 const result=procurementTotals(batch,[order('a',100,[{orderedQuantity:10,coveragePerUnit:2.166,unitSymbol:'Box'}]),order('b',50,[{orderedQuantity:5,unitSymbol:'m²'},{orderedQuantity:20,unitSymbol:'Piece'}]),order('c',30,[{orderedQuantity:999,unitSymbol:'m²'}]),order('d',20)]);
 expect(result.amounts).toEqual({Materials:150,Freight:30,'Customs Clearance':20});expect(result.qty).toBe(26.66);expect(result.total).toBe(200);expect(result.landedCost).toBeCloseTo(200/26.66);
 });
 it('keeps all charges while dividing only by selected manual material area',()=>{
 const documents={materials:{mode:'manual',manual:JSON.stringify({supplierId:'s',lines:[{description:'Floor',quantity:10,coveragePerUnit:2,unitSymbol:'Box',unitCost:100,taxRate:0},{description:'Underlay',quantity:5,coveragePerUnit:10,unitSymbol:'Roll',unitCost:20,taxRate:0,includeInQty:false}]})},freight:{},customs:{}};
 const t=procurementTotals({links:'[]',documents:JSON.stringify(documents)},[]);
 expect(t.qty).toBe(70);expect(t.selectedQty).toBe(20);expect(t.total).toBe(1100);expect(t.landedCost).toBe(55);
 const m=JSON.parse(documents.materials.manual);m.lines[0].includeInQty=false;documents.materials.manual=JSON.stringify(m);
 expect(procurementTotals({links:'[]',documents:JSON.stringify(documents)},[]).landedCost).toBeUndefined();
 });
 it('persists per-line selection for an existing invoice without altering its value',()=>{
 const t=procurementTotals({links:JSON.stringify([{role:'Materials',orderId:'bill:a'}]),documents:JSON.stringify({materials:{'excludeQty:bill:a:1':'true'},freight:{},customs:{}})},[{id:'bill:a',totals:{subtotal:300,taxAmount:0,total:300},lines:[{orderedQuantity:10,coveragePerUnit:2,unitSymbol:'Box'},{orderedQuantity:5,coveragePerUnit:10,unitSymbol:'Roll'}]}]);
 expect(t.qty).toBe(70);expect(t.selectedQty).toBe(20);expect(t.landedCost).toBe(15);
 });
 it('avoids division by zero when no area is recorded',()=>{expect(procurementTotals({links:'[]'},[]).landedCost).toBeUndefined();});
});
