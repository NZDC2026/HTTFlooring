import {businessSettings} from '../../business-workspace/configurationState';
import {useState} from 'react';
import {Link} from 'react-router-dom';
export interface PurchasePricePoint {price?:number;date?:string;billId?:string;reference?:string}
export function purchasePriceChange(previous?:number,current?:number){
 if(previous===undefined||current===undefined)return undefined;
 const amount=current-previous;
 return {amount,percent:previous===0?undefined:amount/previous*100};
}
export function PurchasePriceComparison({previous,current,unit,canPurchase,sample=false}:{previous:PurchasePricePoint;current:PurchasePricePoint;unit:string;canPurchase:boolean;sample?:boolean}){
 const [opened,setOpened]=useState<PurchasePricePoint>();
 const [falling,setFalling]=useState(false);
 const prior=sample&&falling?{...previous,price:current.price===undefined?undefined:current.price*1.05}:previous;
 const change=purchasePriceChange(prior.price,current.price);
 const currency=businessSettings().currency;
 const money=(n:number)=>n.toLocaleString('en-AU',{style:'currency',currency});
 const price=(point:PurchasePricePoint)=>point.price===undefined?'—':`${money(point.price)} / ${unit}`;
 const card=(label:string,point:PurchasePricePoint)=><div className="inv-stat"><div>{label}</div><strong>{sample?<button type="button" className="underline underline-offset-4" onClick={()=>setOpened(point)}>{price(point)}</button>:canPurchase&&point.billId?<Link className="underline underline-offset-4" to={`/purchases/bills/${point.billId}`}>{price(point)}</Link>:price(point)}</strong><small>{point.date||'No purchase recorded'} · {currency}, ex. GST</small>{sample&&<small>Sample</small>}</div>;
 return <>{card('Previous Purchase Price',prior)}<div className="inv-stat"><div>Purchase Price Change</div><strong style={{color:change?(change.amount>0?'#b91c1c':change.amount<0?'#15803d':undefined):undefined}}>{change?`${change.amount>0?'+':change.amount<0?'−':''}${money(Math.abs(change.amount))} / ${unit}`:'—'}</strong><small style={{color:change?(change.amount>0?'#b91c1c':change.amount<0?'#15803d':undefined):undefined}}>{change?.percent===undefined?'Percentage unavailable':`${change.percent>0?'+':''}${change.percent.toFixed(2)}%`}</small>{sample&&<><small>Sample</small><button type="button" className="text-sm underline" onClick={()=>setFalling(!falling)}>Preview {falling?'increase':'decrease'}</button></>}</div>{card('Current Purchase Price',current)}{opened&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={()=>setOpened(undefined)}><section role="dialog" aria-modal="true" aria-label="Sample Supplier Invoice" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={e=>e.stopPropagation()}><h2>Supplier Invoice · Sample</h2><p className="my-3">{opened.reference} · {opened.date}</p><p>Sample Materials Supplier</p><p className="my-3">Purchase unit price ({currency}, ex. GST): <strong>{price(opened)}</strong></p><p className="text-sm text-stone-500">Read-only preview. No supplier invoice or inventory records are created.</p><button autoFocus type="button" className="mt-4 rounded-lg border px-4 py-2" onClick={()=>setOpened(undefined)}>Close</button></section></div>}</>;
}
