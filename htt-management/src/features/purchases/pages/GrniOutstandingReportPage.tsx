import { csvText } from '../../../lib/csv';
import { reportNumber, reportSettings } from '../../report-settings/reportPresentation';
import { reportMoney } from '../../report-settings/reportPresentation';
import { ReportContext } from '../../report-settings/ReportContext';
import { businessSettings } from '../../business-workspace/configurationState';
import { useMemo, useState } from "react";
import { grniOutstandingReportService } from "../data/grniOutstandingReportService";

const today = () => new Date().toLocaleDateString("en-CA");
const aud = (value:number) => reportMoney(value);
export function GrniOutstandingReportPage() {
  const [asOfDate, setAsOfDate] = useState(today);
  const [supplierId, setSupplierId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [outstandingOnly, setOutstandingOnly] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const report = useMemo(() => { try { return { value: grniOutstandingReportService.generate({ asOfDate, supplierId: supplierId || undefined, siteId: siteId || undefined, outstandingOnly }), error: "" }; } catch (e) { return { value: null, error: e instanceof Error ? e.message : String(e) }; } }, [asOfDate, supplierId, siteId, outstandingOnly, refresh]);
  const rows = report.value?.rows ?? [];
  const exportCsv = () => {
    const header = ["Supplier", "PO", "Receipt", "Receipt Date", "Site", "SKU", "Description", "Received Qty", "Matched Qty", "Outstanding Qty", "Received Value", "Matched Value", "Outstanding Value", "Aging Days", "Aging Bucket"];
    const body = rows.map(r => [r.supplierName, r.purchaseOrderNumber, r.receiptNumber, r.receiptDate, r.siteName, r.sku, r.description, r.receivedQuantity, r.matchedQuantity, r.outstandingQuantity, reportNumber(r.receivedValue), reportNumber(r.matchedValue), reportNumber(r.outstandingValue), r.agingDays, r.agingBucket]);
    const csv = csvText([["Report header",reportSettings().header],["Basis","Accrual"],["Currency",businessSettings().currency],header, ...body].map(row=>row.map(String)));
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `grni-outstanding-${asOfDate}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div className="space-y-6 p-6"><ReportContext basis="Accrual"/>
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">GRNI Outstanding Report</h1><p className="text-sm text-gray-500">Goods received not invoiced · {businessSettings().currency}</p></div><div className="flex gap-2"><button className="rounded border px-3 py-2" onClick={() => setRefresh(v => v+1)}>Refresh</button><button className="rounded border px-3 py-2" onClick={exportCsv}>Export CSV</button></div></div>
    <div className="flex flex-wrap gap-3"><label>As of <input className="ml-2 rounded border p-2" type="date" value={asOfDate} onChange={e=>setAsOfDate(e.target.value)} /></label><label>Supplier ID <input className="ml-2 rounded border p-2" value={supplierId} onChange={e=>setSupplierId(e.target.value)} /></label><label>Site ID <input className="ml-2 rounded border p-2" value={siteId} onChange={e=>setSiteId(e.target.value)} /></label><label className="flex items-center gap-2"><input type="checkbox" checked={outstandingOnly} onChange={e=>setOutstandingOnly(e.target.checked)} />Outstanding only</label></div>
    {report.error && <div className="rounded bg-red-50 p-3 text-red-700">{report.error}</div>}
    {report.value && <><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{([ ["Received",report.value.totals.receivedValue], ["Matched",report.value.totals.matchedValue], ["Outstanding",report.value.totals.outstandingValue], ["GL Credit Balance",report.value.glCreditBalance] ] as const).map(([label,value])=><div className="rounded border bg-white p-4" key={label}><div className="text-sm text-gray-500">{label}</div><div className="text-xl font-semibold">{aud(value)}</div></div>)}</div>
    <div className="rounded border bg-white p-4"><strong>GL difference:</strong> {Number.isNaN(report.value.difference) ? "N/A (filtered report)" : aud(report.value.difference)} <span className="ml-4 text-sm text-gray-500">Aging: 0–30 {aud(report.value.aging.CURRENT)} · 31–60 {aud(report.value.aging["31_60"])} · 61–90 {aud(report.value.aging["61_90"])} · 90+ {aud(report.value.aging.OVER_90)}</span></div>
    <div className="overflow-x-auto rounded border bg-white"><table className="w-full text-left text-sm"><thead className="bg-gray-50"><tr>{["Supplier","PO","Receipt","Date","Site","SKU","Received","Matched","Outstanding","GRNI Outstanding","Days","Bucket"].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{rows.length === 0 && <tr><td colSpan={12} className="p-8 text-center text-gray-500">No goods receipts match these filters.</td></tr>}{rows.map(r=><tr className="border-t" key={`${r.goodsReceiptId}:${r.goodsReceiptLineId}`}><td className="p-3">{r.supplierName}</td><td className="p-3">{r.purchaseOrderNumber}</td><td className="p-3">{r.receiptNumber}</td><td className="p-3">{r.receiptDate}</td><td className="p-3">{r.siteName}</td><td className="p-3">{r.sku}</td><td className="p-3">{r.receivedQuantity}</td><td className="p-3">{r.matchedQuantity}</td><td className="p-3">{r.outstandingQuantity}</td><td className="p-3">{aud(r.outstandingValue)}</td><td className="p-3">{r.agingDays}</td><td className="p-3">{r.agingBucket}</td></tr>)}</tbody></table></div></>}
  </div>;
}
