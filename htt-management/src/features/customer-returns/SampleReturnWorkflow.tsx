import {useState} from 'react';
import {CreditPrintButton} from './CreditPrintButton';
export function SampleReturnWorkflow(){
 const [step,setStep]=useState(0),[qty,setQty]=useState(2);
 const area=qty*2.166,credit=Math.round(area*50*.8*1.1*100)/100;
 const money=(v:number)=>v.toLocaleString('en-AU',{style:'currency',currency:'AUD'});
 return <section className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Sample return workflow">
 <header><h2 className="font-semibold">Sample · Receive Return → Create Credit → Apply to Invoice</h2><p className="text-xs">Interactive preview only. No stock, financial entries or notifications are created.</p></header>
 <div className="flex flex-wrap gap-3 text-sm">{['Awaiting return','Goods received','Credit issued','Applied to invoice'].map((s,i)=><span key={s} className={'rounded-full px-3 py-1 '+(step>=i?'bg-emerald-100 text-emerald-900':'bg-white text-stone-500')}>{i+1}. {s}</span>)}</div>
 <p className="text-sm">Sample Harbour Flooring · Original invoice INV-SAMPLE-0004725 · Melbourne warehouse</p>
 <div className="overflow-auto rounded-lg border bg-white"><table className="w-full text-left text-sm"><thead><tr>{['Product / SKU','Return Qty (Box)','Coverage','Original Price / m²','Discount %','Credit incl. GST'].map(h=><th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody><tr><td className="p-3">Natural Oak · BON-SAMPLE-001</td><td className="p-3"><input aria-label="Sample return quantity" type="number" min="1" max="10" step="1" disabled={step>0} value={qty} onChange={e=>setQty(Math.max(1,Math.min(10,Math.ceil(Number(e.target.value)||1))))} className="w-20 rounded border p-2"/></td><td className="p-3">{area.toFixed(3)} m²</td><td className="p-3">$50.00</td><td className="p-3">20% inherited</td><td className="p-3 font-semibold">{money(credit)}</td></tr></tbody></table></div>
 <p className="text-sm">{step===0?'Awaiting physical return. Confirm the boxes received before creating credit.':step===1?'Received by Sample Jamie · Warehouse. Original dispatch cost retained.':step===2?'CN-SAMPLE-0004725 issued. Available credit: '+money(credit):'Credit applied to INV-SAMPLE-0004725. Balance: $1,100.00 → '+money(1100-credit)}</p>
 <div className="flex flex-wrap gap-3">{step<3&&<button className="rounded-lg bg-emerald-900 px-4 py-2 text-sm text-white" onClick={()=>setStep(step+1)}>{['Confirm Receipt · Sample','Issue Credit · Sample','Apply Credit to Invoice · Sample'][step]}</button>}{step>=2&&<CreditPrintButton sample sampleTotal={credit}/>}<button className="rounded-lg border bg-white px-4 py-2 text-sm" onClick={()=>{setStep(0);setQty(2);}}>Reset Sample</button></div>
 </section>;
}
