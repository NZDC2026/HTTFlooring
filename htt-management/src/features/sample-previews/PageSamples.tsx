import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { DeliveryReminderDialog } from "../delivery-tasks/DeliveryTasks";
import { workflowSamples } from "./workflowSamples";

function ReminderSample() {
    const [show, setShow] = useState(false);
    const [result, setResult] = useState("");
    return <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="secondary" onClick={() => { setResult(""); setShow(true); }}>Preview delivery reminder</Button>
        <span role="status" className="text-sm text-[var(--color-text-secondary)]">{result}</span>
        {show && <DeliveryReminderDialog
            name="Delivery · SO-SAMPLE-014"
            deliveryAt="2026-11-05T10:00"
            timeZone="Pacific/Auckland"
            address="12 Example Lane, Richmond"
            sample
            onSnooze={() => { setShow(false); setResult("Sample · Snoozed for 15 minutes"); }}
            onComplete={() => { setShow(false); setResult("Sample · Completed by Jamie (Front desk)"); }}
            onClose={() => setShow(false)}
        />}
    </div>;
}

export function PageSamples() {
    const { pathname } = useLocation();
    const samples = workflowSamples.filter(sample => sample.paths.test(pathname));
    if (!samples.length) return null;

    return <details key={pathname} open className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-amber-900">Sample · {samples.length === 1 ? samples[0].title : "Workflow previews"}</summary>
        <div className="mt-3 space-y-3">
            <p className="text-xs text-amber-900">Illustrative examples only. The live records for this page appear below.</p>
            {pathname === "/dashboard" && <ReminderSample/>}
            {samples.map(sample => <section key={sample.title} className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
                <h2 className="px-3 pt-3 text-sm font-semibold">{sample.title}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead><tr><th className="px-3 py-2">Example record</th><th className="px-3 py-2">Details</th><th className="px-3 py-2">Status</th></tr></thead>
                        <tbody>
                            {[sample.pending, sample.completed].map((row, index) => <tr key={row.record} className="border-t border-[var(--color-border)]">
                                <td className="px-3 py-2 font-medium">{row.record}</td>
                                <td className="px-3 py-2">{row.detail}</td>
                                <td className="whitespace-nowrap px-3 py-2"><span className={`rounded-full px-2 py-0.5 ${index === 0 ? "bg-[var(--color-warning-soft)] text-[#8a641c]" : "bg-[var(--color-success-soft)] text-[var(--color-success)]"}`}>{row.status}</span></td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </section>)}
        </div>
    </details>;
}
