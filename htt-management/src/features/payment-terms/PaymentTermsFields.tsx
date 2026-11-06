import { paymentDueDate, type PaymentTerms, type PaymentTermsType } from "./paymentTerms";

export function PaymentTermsFields({ value, onChange, disabled = false }: {
    value: PaymentTerms; onChange: (value: PaymentTerms) => void; disabled?: boolean;
}) {
    const type = value.paymentTermsType ?? (value.paymentTermsDays === 0 ? "COD" : "DAYS");
    const fieldClass = "h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm";
    return <div className="space-y-2">
        <select aria-label="Payment terms type" className={fieldClass} value={type} disabled={disabled}
            onChange={event => {
                const next = event.target.value as PaymentTermsType;
                onChange({ paymentTermsType: next, paymentTermsDays: next === "COD" ? 0 : next === "DAY_OF_MONTH" ? Math.min(31, Math.max(1, value.paymentTermsDays)) : Math.max(1, value.paymentTermsDays) });
            }}>
            <option value="COD">COD</option>
            <option value="DAYS">No. xxx Of Day</option>
            <option value="DAY_OF_MONTH">No. xxx End Of Month</option>
        </select>
        {type !== "COD" && <input aria-label={type === "DAYS" ? "Number of days" : "Day of next month"}
            className={fieldClass} type="number" required min={type === "DAYS" ? 0 : 1} max={type === "DAYS" ? 365 : 31}
            step={1} disabled={disabled} value={value.paymentTermsDays}
            onChange={event => onChange({ paymentTermsType: type, paymentTermsDays: event.target.valueAsNumber })}/>}
        <p className="text-xs text-[var(--color-text-secondary)]">{type === "DAY_OF_MONTH" ? "Due on the selected day next month. Short months use their last day." : type === "COD" ? "Payment due on delivery." : "Days from the invoice or bill date."}</p>
        <details open className="text-xs text-amber-900">
            <summary className="cursor-pointer">Sample · Due dates for 10 Nov 2026</summary>
            <p>COD · {paymentDueDate("2026-11-10", {paymentTermsDays: 0})}</p>
            <p>No. 30 Of Day · {paymentDueDate("2026-11-10", {paymentTermsDays: 30})}</p>
            <p>No. 30 End Of Month · {paymentDueDate("2026-11-10", {paymentTermsDays: 30, paymentTermsType: "DAY_OF_MONTH"})}</p>
        </details>
    </div>;
}
