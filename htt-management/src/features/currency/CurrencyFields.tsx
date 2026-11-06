import { businessDateKey } from "../../lib/businessDate";
import { useEffect, useRef, useState } from "react";
import { currencies, currencyLabel, currencyCode, referenceRate, type Currency, type FxSnapshot, fxAmount } from "./currency";

export function CurrencySelect({value,onChange,disabled=false}: {value:string;onChange:(value:Currency)=>void;disabled?:boolean}) {
    return <select aria-label="Currency" disabled={disabled} className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
        value={currencyCode(value)} onChange={event=>onChange(event.target.value as Currency)}>
        {!currencies.includes(currencyCode(value) as Currency) && <option value={value} disabled>{value} (existing)</option>}
        {currencies.map(currency=><option key={currency} value={currency}>{currencyLabel(currency)}</option>)}
    </select>;
}
export function CurrencyFields({value,baseCurrency,onChange}: {
    value?:FxSnapshot;baseCurrency:string;onChange:(value:FxSnapshot)=>void;
}) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const currency = value?.currency ?? currencyCode(baseCurrency);
    const [error,setError] = useState("");
    const [loading,setLoading] = useState(false);
    const [request,setRequest] = useState(0);
    // Only a currency change or explicit refresh replaces a manually edited rate.
    useEffect(()=>{
        if (!currencies.includes(currency as Currency)) {setLoading(false);return;}
        if (value?.rate && request === 0) {setLoading(false);setError("");return;}
        const controller = new AbortController();
        let active = true;
        setLoading(true);
        referenceRate(currency,baseCurrency,controller.signal).then(result=>{
            if(active) { onChangeRef.current({currency:currency as Currency,baseCurrency:currencyCode(baseCurrency) as FxSnapshot["baseCurrency"],...result,source:"Reference"}); setError(""); }
        }).catch(error=>{if(active)setError(error instanceof Error ? error.message : "Unable to retrieve reference rate.");})
            .finally(()=>{if(active)setLoading(false);});
        return ()=>{active=false;controller.abort();};
    // onChange updates the parent; the requested pair determines the lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[currency,baseCurrency,request]);
    return <section className="rounded-lg border p-3 text-sm">
        <div className="grid gap-3 md:grid-cols-2">
            <label>Currency<CurrencySelect value={currency} onChange={next=>{
                setError("");
                onChange({currency:next,baseCurrency:currencyCode(baseCurrency) as FxSnapshot["baseCurrency"],rate:next===baseCurrency?1:0,rateDate:businessDateKey(new Date().toISOString()),source:"Manual"});
            }}/></label>
            <label>1 {currencyLabel(currency)} = {currencyLabel(baseCurrency)}
                <input aria-label="Exchange rate" type="number" min="0.00000001" step="any" required
                    disabled={loading || currency===baseCurrency} className="h-10 w-full rounded-lg border px-3"
                    value={value?.rate || ""} onChange={event=>onChange({currency:currency as Currency,baseCurrency:currencyCode(baseCurrency) as FxSnapshot["baseCurrency"],rate:event.target.valueAsNumber,rateDate:businessDateKey(new Date().toISOString()),source:"Manual"})}/>
            </label>
        </div>
        <p className="mt-2 text-xs">{loading ? "Loading reference rate…" : `${value?.source ?? "Manual"} rate · ${value?.rateDate ?? ""}`} · Daily reference rates from Frankfurter. Confirm the bank rate before saving.</p>
        <button type="button" className="mt-1 underline" disabled={loading} onClick={()=>setRequest(value=>value+1)}>Refresh reference rate</button>
        {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
        <details className="mt-2 text-xs text-amber-900"><summary>Sample · USD purchase</summary><p>USD 1,000 × 1.50 = AUD 1,500. Rates and amounts are synthetic.</p></details>
    </section>;
}
export function CurrencySummary({fx,amount}: {fx?:FxSnapshot;amount:number}) {
    if(!fx)return null;
    return <p className="rounded-lg border bg-slate-50 p-3 text-sm">
        {currencyLabel(fx.currency)} {fxAmount(amount,fx).toFixed(2)} · 1 {currencyLabel(fx.currency)} = {fx.rate} {currencyLabel(fx.baseCurrency)}
        <span className="ml-2 text-xs">{fx.source} · {fx.rateDate} · Ledger {currencyLabel(fx.baseCurrency)} {amount.toFixed(2)}</span>
    </p>;
}

export function CurrencyPaymentSample() {
    return <details className="my-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <summary className="cursor-pointer font-medium">Sample · Foreign payment workflow</summary>
        <table className="mt-2 w-full text-left">
            <thead><tr><th>Status</th><th>Supplier amount</th><th>Bank / ledger</th></tr></thead>
            <tbody>
                <tr><td>Pending</td><td>USD 1,000</td><td>AUD 1,500 payable · Reference 1.50</td></tr>
                <tr><td>Posted</td><td>USD 1,000 paid</td><td>AUD 1,480 bank payment · AUD 20 exchange gain</td></tr>
                <tr><td>Reversed</td><td>Payment reversed</td><td>AUD 1,500 payable restored · AUD 1,480 bank reversal</td></tr>
            </tbody>
        </table>
        <p className="mt-2">Synthetic read-only examples.</p>
    </details>;
}
