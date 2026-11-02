import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccounts, useJournalEntries } from "../../accounting/data/useAccounting";
import { usePayroll } from "../../payroll/data/payrollClient";
import { usePermission } from "../../security/usePermission";
import { businessSettings } from "../../business-workspace/configurationState";
import { Card, CardContent } from "../../../components/ui/Card";
import { dashboardGst, dashboardPayroll } from "../data/dashboardObligations";
const money = (amount: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: businessSettings().currency }).format(amount);
const formatDate = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
export function TaxPayrollCards({ date }: { date: string }) {
    const canReadPayroll = usePermission("payroll.read");
    const canReadAccounting = usePermission("accounting.read");
    const [sample, setSample] = useState(true);
    return <section aria-label="Tax and payroll overview">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span>{sample ? "Sample preview · Amounts and dates below are illustrative." : "Showing recorded tax and payroll data."}</span>
            <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={sample} onChange={event => setSample(event.target.checked)}/>Show sample data</label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
            {canReadAccounting && <GstCard date={date} sample={sample}/>}
            {canReadPayroll && <PayrollCards date={date} sample={sample}/>}
        </div>
    </section>;
}
function GstCard({ date, sample }: { date: string; sample: boolean }) {
    const accounts = useAccounts(), journals = useJournalEntries();
    const gst = sample ? { collected: 8420, paid: 3150, net: 5270 } : dashboardGst(accounts, journals, date);
    const nextMonth = new Date(Date.UTC(Number(date.slice(0,4)), Number(date.slice(5,7)), 21)).toISOString().slice(0,10);
    const total = Math.abs(gst.collected) + Math.abs(gst.paid);
    return <Card><CardContent>
        <h2 className="font-display text-xl">GST {sample && <SampleBadge/>}</h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{date.slice(0, 7)} · {sample ? "Sample GST" : "Posted ledger GST"}</p>
        <p className="mt-4 text-2xl font-semibold tabular-nums">{money(Math.abs(gst.net))}</p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{gst.net < 0 ? "Net GST credit" : "Net GST"}</p>
        <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]" aria-hidden="true"><div style={{ width: total ? `${Math.abs(gst.collected) / total * 100}%` : "0%", background: "#d0008f" }}/><div style={{ flex: total ? 1 : 0, background: "#a45bff" }}/></div>
        <dl className="mt-4 space-y-3 text-sm">{[{label:"GST collected",amount:gst.collected,color:"#d0008f"},{label:"GST paid",amount:gst.paid,color:"#a45bff"}].map(item => <div key={item.label} className="flex flex-wrap justify-between gap-2"><dt className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{background:item.color}}/>{item.label}</dt><dd className="font-medium tabular-nums">{money(item.amount)}</dd></div>)}</dl>
        {sample && <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs">Sample payment date: <span className="font-medium">{formatDate(nextMonth)}</span></p>}
    </CardContent></Card>;
}
function PayrollCards({ date, sample }: { date: string; sample: boolean }) {
    const state = usePayroll();
    const month = date.slice(0,7);
    const shift = (offset: number, day: number) => new Date(Date.UTC(Number(date.slice(0,4)), Number(date.slice(5,7)) - 1 + offset, day)).toISOString().slice(0,10);
    const recorded = dashboardPayroll(state, date);
    const data = sample ? {
        payRuns: [
            { id: "sample-pay-2", start: `${month}-15`, end: shift(1,0), payDate: shift(1,1), paidDate: undefined, status: "Approved" },
            { id: "sample-pay-1", start: `${month}-01`, end: `${month}-14`, payDate: `${month}-15`, paidDate: undefined, status: "Approved" },
        ],
        superannuation: { amount: 2160, nextPaymentDate: shift(1,15), lastPaymentDate: shift(0,1) },
        payg: { amount: 3480, nextPaymentDate: shift(1,21), lastPaymentDate: shift(0,21) <= date ? shift(0,21) : shift(-1,21) },
    } : recorded;
    const runAmount = (id: string) => sample ? id === "sample-pay-1" ? 7240 : 7680 : state.runs.find(run => run.id === id)?.totals.net ?? 0;
    return <>
        <Card><CardContent>
            <div className="flex items-center justify-between gap-2"><h2 className="font-display text-xl">Pay runs {sample && <SampleBadge/>}</h2><Link className="text-xs underline" to="/payroll/pay-runs">View all →</Link></div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Payment period and payment date · {date.slice(0,7)}</p>
            <div className="mt-4 space-y-3">{data.payRuns.map(run => <div key={run.id} className="border-t border-[var(--color-border)] pt-3 text-xs">{sample ? <span className="font-medium text-[var(--color-primary)]">{formatDate(run.start)} – {formatDate(run.end)}</span> : <Link className="font-medium text-[var(--color-primary)] underline" to={`/payroll/pay-runs/${run.id}`}>{formatDate(run.start)} – {formatDate(run.end)}</Link>}<p className="mt-2 text-sm font-semibold tabular-nums">{money(runAmount(run.id))} <span className="text-xs font-normal text-[var(--color-text-secondary)]">net wages</span></p><p className="mt-2">Scheduled payment: {formatDate(run.payDate)}</p><p className="mt-1 text-[var(--color-text-secondary)]">{run.paidDate ? `Last paid: ${formatDate(run.paidDate)}` : `Status: ${run.status} · No payment recorded`}</p></div>)}{!data.payRuns.length && <p className="text-sm text-[var(--color-text-secondary)]">No pay runs for this month.</p>}</div>
        </CardContent></Card>
        {[{title:"Superannuation payable",data:data.superannuation},{title:"PAYG withholding",data:data.payg}].map(item => <Card key={item.title}><CardContent>
            <h2 className="font-display text-xl">{item.title} {sample && <SampleBadge/>}</h2>
            <p className="mt-4 text-2xl font-semibold tabular-nums">{money(item.data.amount)}</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{sample ? "Sample amount" : "Outstanding"} as at {formatDate(date)}</p>
            <dl className="mt-4 space-y-2 text-xs"><div className="flex flex-wrap justify-between gap-2"><dt>Payment date</dt><dd>{item.data.nextPaymentDate ? formatDate(item.data.nextPaymentDate) : "Not scheduled"}</dd></div><div className="flex flex-wrap justify-between gap-2"><dt>Last payment</dt><dd>{item.data.lastPaymentDate ? formatDate(item.data.lastPaymentDate) : "Not recorded"}</dd></div></dl>
            <Link to="/payroll/pay-runs" className="mt-4 inline-block text-xs underline">View payroll details →</Link>
        </CardContent></Card>)}
    </>;
}

function SampleBadge() {
    return <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 align-middle font-sans text-[10px] font-semibold text-amber-900">Sample</span>;
}
