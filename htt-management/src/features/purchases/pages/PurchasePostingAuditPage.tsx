import { feedback } from "../../../components/ui/feedback";
import { useMemo, useSyncExternalStore, useState } from "react";
import { Link } from "react-router-dom";
import { purchasePostingOperationRepository } from "../data/purchasePostingOperationRepository";
import { purchasePostingAuditService } from "../data/purchasePostingAuditService";
import { purchasePostingManualRecoveryService } from "../data/purchasePostingManualRecoveryService";
import { purchasePostingRecoveryAuthorization } from "../data/purchasePostingRecoveryAuthorization";

const statuses = ["ALL", "PENDING", "POSTING", "POSTED", "FAILED", "RECOVERY_REQUIRED"] as const;
const kindLabels = { GOODS_RECEIPT: "Goods Receipt", SUPPLIER_BILL: "Supplier Bill", SUPPLIER_BILL_VOID: "Supplier Bill Void" } as const;
const subscribe = (listener: () => void) => purchasePostingOperationRepository.subscribe(listener);
let version = 0;
const subscribeVersion = (listener: () => void) => subscribe(() => { version += 1; listener(); });
const getVersion = () => version;

export function PurchasePostingAuditPage() {
  useSyncExternalStore(subscribeVersion, getVersion);
  const [status, setStatus] = useState<(typeof statuses)[number]>("ALL");
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const rows = purchasePostingAuditService.list();
  const filtered = useMemo(() => rows.filter(row =>
    (status === "ALL" || row.status === status) &&
    `${row.key} ${row.sourceId} ${row.error ?? ""}`.toLowerCase().includes(query.toLowerCase())
  ), [rows, status, query]);
  const selected = rows.find(row => row.key === selectedKey);
  const attention = rows.filter(row => row.needsAttention).length;

  return <div className="space-y-6 p-6">
    <div><h1 className="text-2xl font-semibold">Purchase Accounting Audit & Recovery</h1>
      <p className="mt-1 text-sm text-gray-500">Posting metadata is saved in the local desktop profile. Recovery handlers are available only in the current app session.</p></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[["Operations", rows.length], ["Posted", rows.filter(r => r.status === "POSTED").length], ["Needs attention", attention], ["In progress", rows.filter(r => r.status === "PENDING" || r.status === "POSTING").length]].map(([label, count]) =>
        <div key={label} className="rounded-lg border bg-white p-4"><div className="text-sm text-gray-500">{label}</div><div className="text-2xl font-semibold">{count}</div></div>)}
    </div>
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Manual recovery requires a trusted authenticated finance/admin session. FAILED operations cannot be replayed; reconcile them manually. Recovery handlers are lost on restart.</div>
    <div className="flex flex-wrap gap-3"><select aria-label="Filter status" className="rounded border bg-white px-3 py-2" value={status} onChange={event => setStatus(event.target.value as (typeof statuses)[number])}>{statuses.map(value => <option key={value} value={value}>{value}</option>)}</select>
      <input aria-label="Search operations" className="min-w-64 rounded border px-3 py-2" placeholder="Search key, source or error" value={query} onChange={event => setQuery(event.target.value)} />
      <button className="rounded border bg-white px-3 py-2" onClick={() => { setStatus("ALL"); setQuery(""); }}>Reset filters</button></div>
    <div className="overflow-x-auto rounded-lg border bg-white"><table className="w-full text-left text-sm"><thead className="bg-gray-50"><tr>{["Operation", "Source", "Status", "Steps", "Updated", "Journal", "Details"].map(header => <th key={header} className="p-3">{header}</th>)}</tr></thead>
      <tbody>{filtered.map(row => <tr key={row.key} className="border-t"><td className="p-3">{kindLabels[row.kind]}</td><td className="p-3"><Link className="text-blue-700 underline" to={row.sourcePath}>{row.sourceId}</Link></td><td className="p-3"><span className={row.needsAttention ? "font-semibold text-red-700" : "text-gray-700"}>{row.status}</span></td><td className="p-3">{row.completedSteps.length}</td><td className="whitespace-nowrap p-3">{new Date(row.updatedAt).toLocaleString()}</td><td className="p-3">{row.journals.map(journal => <Link key={journal.id} className="mr-2 text-blue-700 underline" to={`/accounting/journals/${encodeURIComponent(journal.id)}`}>{journal.number}</Link>)}</td><td className="p-3"><button className="rounded border px-2 py-1" onClick={() => setSelectedKey(row.key)}>Inspect</button></td></tr>)}
        {filtered.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-gray-500">No matching posting operations.</td></tr>}</tbody></table></div>
    {selected && <section className="rounded-lg border bg-white p-5" aria-label="Posting operation details"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Operation details</h2><button className="rounded border px-3 py-1" onClick={() => setSelectedKey(null)}>Close</button></div>
      <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2"><div><dt className="text-gray-500">Key</dt><dd className="break-all">{selected.key}</dd></div><div><dt className="text-gray-500">Status</dt><dd>{selected.status}</dd></div><div><dt className="text-gray-500">Last updated</dt><dd>{selected.updatedAt}</dd></div><div><dt className="text-gray-500">Source</dt><dd><Link className="text-blue-700 underline" to={selected.sourcePath}>Open document</Link></dd></div></dl>
      <h3 className="mt-4 font-semibold">Completed steps</h3><ol className="mt-2 list-inside list-decimal text-sm">{selected.completedSteps.map(step => <li key={step}>{step}</li>)}</ol>{selected.completedSteps.length === 0 && <p className="text-sm text-gray-500">No completed steps.</p>}
      {selected.error && <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800" role="alert">{selected.error}</div>}
      <h3 className="mt-4 font-semibold">Related journals</h3>{selected.journals.length === 0 ? <p className="text-sm text-gray-500">No matching journal found.</p> : selected.journals.map(journal => <p key={journal.id} className="text-sm"><Link className="text-blue-700 underline" to={`/accounting/journals/${encodeURIComponent(journal.id)}`}>{journal.number}</Link> · {journal.date} · {journal.status}</p>)}
      <button type="button" disabled={!purchasePostingManualRecoveryService.canRecover(selected.key)} title={!purchasePostingRecoveryAuthorization.canRecover() ? "Requires a trusted authenticated finance/admin session" : "Only recoverable operations with an active handler can be resumed"} className="mt-4 rounded bg-blue-700 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500" onClick={async () => {
        const accepted = await feedback.confirm({ title: "Confirm posting recovery", message: `Resume operation ${selected.key}? Only verified incomplete steps will be attempted.`, confirmLabel: "Resume operation" });
        if (!accepted) return;
        try { purchasePostingManualRecoveryService.recover(selected.key); feedback.success("Recovery completed."); }
        catch (error) { feedback.error(error instanceof Error ? error.message : String(error)); }
      }}>Recover operation</button>
    </section>}
  </div>;
}
