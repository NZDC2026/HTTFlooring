import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductMeasureEditor } from '../components/ProductMeasureEditor';
import { describe, expect, it } from 'vitest';
import { measureCoverage, measureUnit, selectMeasureUnit, setMeasureLabel } from './productMeasureUnits';
import { validateProducts } from '../../business-workspace/productRepository';
import type { Product } from '../types/product';
const fixture=():Product=>({id:'measure-test',name:'Sample Oak',sku:'SAMPLE-OAK',category:'Timber',status:'ACTIVE',baseUnitId:'m2',createdAt:'',updatedAt:'',units:[{id:'m2',code:'M2',name:'Square Metre',symbol:'m²',conversionToBase:1,basePrice:45,isBaseUnit:true,active:true},{id:'box',code:'BOX',name:'Box',symbol:'box',conversionToBase:2.166,basePrice:97.47,vipPrice:90,isBaseUnit:false,active:true}]});
describe('product measure units',()=>{
 it('shows a free-text type and coverage conversion with no selling price field',()=>{
  const html=renderToStaticMarkup(createElement(ProductMeasureEditor,{product:fixture(),onChange:()=>{}}));
  expect(html).toContain('Measure Type');expect(html).toContain('Selling Unit');expect(html).toContain('UNIT CONVERSION');expect(html).not.toContain('Selling Price');expect(html).not.toContain('Price per');
 });
 it('updates coverage without changing any selling prices',()=>{
  const original=fixture(),p=measureCoverage(original,'box',2.5);
  expect(p.units[1].conversionToBase).toBe(2.5);
  expect(p.units.map(u=>[u.basePrice,u.vipPrice])).toEqual(original.units.map(u=>[u.basePrice,u.vipPrice]));
 });
 it('accepts custom packaging names and preserves existing units',()=>{
  const p=fixture(),next=setMeasureLabel(p,'Pack','pack');expect(measureUnit(next)?.name).toBe('Pack');expect(next.units.slice(0,2)).toEqual(p.units);
  expect(setMeasureLabel(p,'Roll','roll').units.at(-1)?.code).toBe('ROLL');
 });
 it('switches to Roll by adding a separate unit without rewriting existing units',()=>{
  const p=fixture(),next=selectMeasureUnit(p,'ROLL','roll');expect(next.units.slice(0,2)).toEqual(p.units);expect(measureUnit(next)?.code).toBe('ROLL');
  expect(validateProducts([next])[0].measureUnitId).toBe('roll');
  expect(selectMeasureUnit(next,'BOX','unused').units).toHaveLength(3);
 });
 it('rejects invalid values and stale preferred units',()=>{
  expect(()=>measureCoverage(fixture(),'box',0)).toThrow();expect(()=>measureCoverage(fixture(),'box',NaN)).toThrow();
  expect(()=>validateProducts([{...fixture(),measureUnitId:'missing'}])).toThrow(/Measure Type/);
 });
});
