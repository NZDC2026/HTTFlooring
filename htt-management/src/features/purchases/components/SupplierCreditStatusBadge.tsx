import type {
    SupplierCreditStatus,
} from "../types/supplierCredit";

export function SupplierCreditStatusBadge({
    status,
}: {
    status: SupplierCreditStatus;
}) {
    const styles: Record<
        SupplierCreditStatus,
        string
    > = {
        ISSUED:
            "bg-amber-50 text-amber-700",
        FULLY_APPLIED:
            "bg-emerald-50 text-emerald-700",
        VOID:
            "bg-red-50 text-red-700",
    };

    const labels: Record<
        SupplierCreditStatus,
        string
    > = {
        ISSUED:
            "Issued",
        FULLY_APPLIED:
            "Fully Applied",
        VOID:
            "Void",
    };

    return (
        <span
            className={[
                "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.05em]",
                styles[
                status
                ],
            ].join(" ")}
        >
            {
                labels[
                status
                ]
            }
        </span>
    );
}