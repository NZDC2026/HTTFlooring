import { describe, expect, it } from 'vitest';
import { productSchema } from '../../business-workspace/productRepository';
const schema=productSchema.shape.dimensions;
describe('product dimensions',()=>{
 it('retains optional dimensions including decimal thickness',()=>{
  expect(schema.parse({lengthMm:1900,widthMm:190,thicknessMm:14.5})).toEqual({lengthMm:1900,widthMm:190,thicknessMm:14.5});
  expect(schema.parse(undefined)).toBeUndefined();expect(schema.parse({widthMm:190})).toEqual({widthMm:190});
 });
 it('rejects zero, negative or non-finite dimensions',()=>{
  for(const value of [0,-1,Infinity,NaN])expect(()=>schema.parse({lengthMm:value})).toThrow();
 });
});
