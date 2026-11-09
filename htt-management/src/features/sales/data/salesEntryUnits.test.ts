import {it,expect} from 'vitest';
import {mockProducts} from '../../inventory/data/mockProducts';
import {changeSalesEntryUnit,salesUnitLabel} from './salesEntryUnits';
it('preserves coverage and manual square metre price when switching Box and sqm, rounding boxes upwards',()=>{
 const p=mockProducts.find(p=>p.units.some(u=>u.code==='BOX')&&p.units.some(u=>u.code==='M2'))!,box=p.units.find(u=>u.code==='BOX')!,sqm=p.units.find(u=>u.code==='M2')!;
 const area=changeSalesEntryUnit(p,box.id,sqm.id,3,box.conversionToBase*50);
 expect(area.quantity).toBeCloseTo(3*box.conversionToBase,7);expect(area.unitPrice).toBeCloseTo(50,7);
 const packs=changeSalesEntryUnit(p,sqm.id,box.id,area.quantity+.01,50);
 expect(packs.quantity).toBe(4);expect(packs.unitPrice).toBeCloseTo(box.conversionToBase*50,7);expect(salesUnitLabel(box)).toBe('Box');expect(salesUnitLabel(sqm)).toBe('sqm');
 expect(changeSalesEntryUnit(p,sqm.id,box.id,area.quantity,50).quantity).toBe(3);
});
