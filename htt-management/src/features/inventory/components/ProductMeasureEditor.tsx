import { useId, useState } from 'react';
import type { Product } from '../types/product';
import { measureCoverage, measureNames, measureUnit, setMeasureLabel } from '../data/productMeasureUnits';
import '../pages/product-measure.css';
export function ProductMeasureEditor({product,onChange}:{product:Product;onChange:(p:Product)=>void}){
 const [sample,setSample]=useState(false);const id=useId();
 const unit=measureUnit(product),base=product.units.find(u=>u.id===product.baseUnitId);
 const initialType=unit?.name||measureNames[unit?.code||'BOX']||'Box';
 const [typeText,setTypeText]=useState(initialType),[error,setError]=useState(''),[coverageText,setCoverageText]=useState<string|undefined>();
 const packaging=sample?'Box':typeText;
 const symbol=sample?'m²':base?.symbol||'m²';
 const coverage=sample?2.166:coverageText===undefined?(unit?.conversionToBase??1):Number(coverageText);
 function commitType(){try{const next=setMeasureLabel(product,typeText,crypto.randomUUID());onChange(next);if(next.measureUnitId!==unit?.id)setCoverageText(undefined);setError('');}catch(e){setError((e as Error).message);}}
 function updateCoverage(text:string){setCoverageText(text);if(text==='')return;try{const next=setMeasureLabel(product,typeText,crypto.randomUUID());onChange(measureCoverage(next,measureUnit(next)!.id,Number(text)));setError('');}catch(e){setError((e as Error).message);}}
 return <section className="product-measure"><div className="pm-heading"><div><h2>Product Units &amp; Coverage</h2><p>HTT Flooring · Product Setup</p></div>{sample&&<span>Sample</span>}</div>
 <label className="pm-field" htmlFor={`${id}-type`}>Measure Type<input id={`${id}-type`} className="pm-type-input" list={`${id}-types`} required maxLength={80} placeholder="e.g. Box, Roll, Pack" value={sample?'Box':typeText} disabled={sample||!base} onChange={e=>setTypeText(e.target.value)} onBlur={commitType} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur();}}}/><datalist id={`${id}-types`}>{['Box','Roll','Pack','Piece','Bucket'].map(name=><option key={name} value={name}/>)}</datalist></label>
 <div className="pm-grid"><div className="pm-field">Coverage Unit<strong>{symbol}</strong></div><div className="pm-field">Selling Unit<strong>{packaging||'—'}</strong></div><label className="pm-field" htmlFor={`${id}-coverage`}>Coverage per {packaging||'Pack'}<input id={`${id}-coverage`} type="number" required min="0.0001" step="any" disabled={sample||!unit||unit.isBaseUnit} value={sample?2.166:coverageText??unit?.conversionToBase??1} onChange={e=>updateCoverage(e.target.value)}/><small>{symbol} / {packaging||'Pack'}</small></label></div>
 <div className="pm-calculation"><small>UNIT CONVERSION</small><div>1 {packaging||'Pack'}<strong>= {Number.isFinite(coverage)?coverage:'—'} {symbol}</strong></div><p>{Number.isFinite(coverage)&&coverage>0?`10 ${packaging||'Packs'} = ${Number((coverage*10).toFixed(6))} ${symbol}`:'Enter coverage per pack to see the conversion.'}</p></div>
 {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
 <label className="pm-sample"><input type="checkbox" checked={sample} onChange={e=>setSample(e.target.checked)}/> Sample · Read-only unit conversion preview · No business data is saved</label>
 {!sample&&<p className="pm-footnote">Enter your packaging name and coverage per pack. Existing prices are preserved. Referenced unit conversions remain protected.</p>}
 </section>;
}
