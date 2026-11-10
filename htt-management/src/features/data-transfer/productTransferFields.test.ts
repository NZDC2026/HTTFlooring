import {expect,it} from 'vitest';
import {productTransferFields} from './productTransferFields';
it('converts friendly box and roll columns into base-area and packaging units without posting stock',()=>{
 const box=productTransferFields({unit:'Box',coveragePerUnit:'2.166',sellingPrice:'50',costPrice:'25'});
 expect(box.referenceCostPrice).toBe('25');expect(box.baseUnitCode).toBe('M2');
 expect(JSON.parse(box.unitsJson)).toMatchObject([{code:'M2',basePrice:50,conversionToBase:1},{code:'BOX',basePrice:108.3,conversionToBase:2.166}]);
 expect(JSON.parse(productTransferFields({unit:'Roll',coveragePerUnit:'20',sellingPrice:'2'}).unitsJson)[1]).toMatchObject({code:'ROLL',basePrice:40});
 const piece=productTransferFields({unit:'Piece',sellingPrice:'6.2'});expect(piece.baseUnitCode).toBe('PIECE');expect(JSON.parse(piece.unitsJson)).toHaveLength(1);
});
it('rejects invalid quantities, prices and ambiguous unit sources',()=>{
 expect(()=>productTransferFields({unit:'Box',coveragePerUnit:'0'})).toThrow('positive');
 expect(()=>productTransferFields({unit:'Box',unitsJson:'[]'})).toThrow('not both');
 expect(()=>productTransferFields({costPrice:'-1'})).toThrow();
 expect(()=>productTransferFields({unit:'m²',coveragePerUnit:'2'})).toThrow();
});
