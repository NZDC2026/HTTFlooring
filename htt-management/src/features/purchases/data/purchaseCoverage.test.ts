import { describe,it,expect } from 'vitest';
import { boxesForCoverage,coveragePerUnit,actualCoverage,purchasePricingFactor } from './purchaseCoverage';
import type { Product,ProductUnit } from '../../inventory/types/product';
describe('PO box and coverage conversion',()=>{
 it('converts integer boxes to decimal square metres',()=>{expect(actualCoverage(40,2.166)).toBe(86.64);});
 it('always rounds requested coverage up to a full box',()=>{expect(boxesForCoverage(100,2.166)).toBe(47);expect(actualCoverage(47,2.166)).toBe(101.802);expect(boxesForCoverage(86.6401,2.166)).toBe(41);});
 it('avoids an extra box at exact decimal multiples without rounding shortages down',()=>{expect(boxesForCoverage(86.64,2.166)).toBe(40);expect(boxesForCoverage(.3,.1)).toBe(3);expect(boxesForCoverage(.3000000001,.1)).toBe(4);expect(boxesForCoverage(.000001,.1)).toBe(1);});
 it('uses unit ratios and does not infer coverage for pieces',()=>{const area={id:'m2',code:'M2',conversionToBase:.5} as ProductUnit,box={id:'box',code:'BOX',conversionToBase:1} as ProductUnit;expect(coveragePerUnit({units:[area,box]} as Product,box)).toBe(2);expect(coveragePerUnit({units:[box]} as Product,box)).toBeUndefined();});
 it('uses area pricing for boxes but unit pricing for pieces',()=>{const area={id:'m2',code:'M2',conversionToBase:1} as ProductUnit,box={id:'box',code:'BOX',conversionToBase:2.166} as ProductUnit,piece={id:'piece',code:'PIECE',conversionToBase:.2} as ProductUnit,p={units:[area,box,piece]} as Product;expect(purchasePricingFactor(p,box)).toBe(2.166);expect(purchasePricingFactor(p,piece)).toBeUndefined();});
 it('rejects invalid conversions',()=>{for(const value of [0,-1,Infinity,NaN])expect(()=>boxesForCoverage(value,2.166)).toThrow();expect(()=>boxesForCoverage(10,0)).toThrow();});
});
