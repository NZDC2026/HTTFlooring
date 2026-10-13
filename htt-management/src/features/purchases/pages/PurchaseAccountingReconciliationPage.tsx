import { useState } from "react";
import { usePurchaseAccountingReconciliation } from "../data/usePurchaseAccountingReconciliation";
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const aud = (n: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n);
export function PurchaseAccountingReconciliationPage() {
  const [asOfDate, setAsOfDate] = useState(today);
  const result = usePurchaseAccountingReconciliation(asOfDate);
  return <div className="space-y-6 pb-8">
    <div><h1 className="text-2xl font-semibold">Purchase Accounting Reconciliation</h1><p className="text-sm text-slate-500">Inventory, GRNI and Purchase Price Variance — AUD</p></div>
    <label className="flex items-center gap-3 text-sm">As of date <input aria-label="As of date" className="rounded border px-3 py-2" type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} /></label>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr><th className="p-4">Account</th><th className="p-4">Subledger</th><th className="p-4">General Ledger</th><th className="p-4">Difference</th><th className="p-4">Status</th></tr></thead><tbody>
    {[result.inventory, result.grni, result.ppv].map(row => <tr key={row.accountId} className="border-b"><td className="p-4">{row.accountCode} — {row.accountName}</td><td className="p-4">{aud(row.subledger)}</td><td className="p-4">{aud(row.generalLedger)}</td><td className="p-4">{aud(row.difference)}</td><td className="p-4 font-medium">{row.status}</td></tr>)}
    </tbody></table></div><p className={result.reconciled ? "text-green-700" : "text-red-700"}>{result.reconciled ? "All three accounts reconciled" : "Reconciliation differences detected"}</p>
    <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{result.historicalMatchingWarning}</p>
  </div>;
}
