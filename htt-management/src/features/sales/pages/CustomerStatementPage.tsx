import {
    useState,
} from "react";

import {
    ArrowLeft,
    CalendarDays,
    Download,
    FileText,
    Printer,
    ReceiptText,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import { Button } from "../../../components/ui/Button";

import {
    customerRepository,
} from "../../contacts/data/customerRepository";

import {
    useCustomerStatement,
} from "../data/useCustomerStatement";

import type {
    StatementEntry,
} from "../types/customerStatement";

export function CustomerStatementPage() {
    const {
        customerId,
    } = useParams<{
        customerId: string;
    }>();

    const navigate =
        useNavigate();

    const today =
        getToday();

    const [
        fromDate,
        setFromDate,
    ] = useState(
        getDefaultFromDate(),
    );

    const [
        toDate,
        setToDate,
    ] = useState(
        today,
    );

    const [
        exportingPdf,
        setExportingPdf,
    ] = useState(
        false,
    );

    const [
        exportMessage,
        setExportMessage,
    ] = useState<
        string | null
    >(
        null,
    );

    const customer =
        customerId
            ? customerRepository.getById(
                customerId,
            )
            : undefined;

    const statement =
        useCustomerStatement(
            customerId,
            fromDate,
            toDate,
        );

    const handleExportPdf =
        async () => {
            if (
                !customer ||
                !statement
            ) {
                return;
            }

            setExportingPdf(
                true,
            );

            setExportMessage(
                null,
            );

            try {
                const customerName =
                    sanitizeFileNamePart(
                        customer.businessName,
                    );

                const result =
                    await window.desktop.exportStatementPdf(
                        {
                            defaultFileName:
                                `${customerName}-Statement-${statement.fromDate}-to-${statement.toDate}.pdf`,
                        },
                    );

                if (
                    result.success
                ) {
                    setExportMessage(
                        "PDF exported successfully.",
                    );

                    return;
                }

                if (
                    !result.canceled
                ) {
                    setExportMessage(
                        result.error ??
                        "Unable to export PDF.",
                    );
                }
            } catch (
            error
            ) {
                setExportMessage(
                    error instanceof
                        Error
                        ? error.message
                        : "Unable to export PDF.",
                );
            } finally {
                setExportingPdf(
                    false,
                );
            }
        };

    if (
        !customer ||
        !statement
    ) {
        return (
            <Navigate
                to="/contacts"
                replace
            />
        );
    }

    const primaryLocation =
        customer.locations.find(
            (location) =>
                location.isPrimary,
        ) ??
        customer.locations[0];

    return (
        <div className="mx-auto w-full max-w-[1400px]">
            <div className="print:hidden">
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/contacts/customers/${customer.id}/sales`,
                        )
                    }
                    className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                >
                    <ArrowLeft
                        size={15}
                    />

                    Back to customer sales
                </button>
            </div>

            <div className="mb-5 flex flex-wrap items-end justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-xs)] print:hidden">
                <div className="flex flex-wrap items-end gap-4">
                    <label className="block">
                        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                            From Date
                        </span>

                        <input
                            type="date"
                            value={
                                fromDate
                            }
                            max={
                                toDate
                            }
                            onChange={(
                                event,
                            ) =>
                                setFromDate(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                            To Date
                        </span>

                        <input
                            type="date"
                            value={
                                toDate
                            }
                            min={
                                fromDate
                            }
                            max={
                                today
                            }
                            onChange={(
                                event,
                            ) =>
                                setToDate(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="h-10 rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                        />
                    </label>

                    <div className="pb-2 text-xs text-[var(--color-text-muted)]">
                        Statement period{" "}
                        {formatDate(
                            fromDate,
                        )}{" "}
                        –{" "}
                        {formatDate(
                            toDate,
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {exportMessage && (
                        <span className="text-xs text-[var(--color-text-secondary)]">
                            {
                                exportMessage
                            }
                        </span>
                    )}

                    <Button
                        variant="secondary"
                        onClick={() =>
                            window.print()
                        }
                    >
                        <Printer
                            size={15}
                        />

                        Print
                    </Button>

                    <Button
                        onClick={
                            handleExportPdf
                        }
                        disabled={
                            exportingPdf
                        }
                    >
                        <Download
                            size={15}
                        />

                        {exportingPdf
                            ? "Exporting..."
                            : "Export PDF"}
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)] print:border-0 print:shadow-none">
                <div className="border-b border-[var(--color-border)] px-8 py-7">
                    <div className="flex items-start justify-between gap-8">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <FileText
                                    size={18}
                                    className="text-[var(--color-accent)]"
                                />

                                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
                                    Customer Statement
                                </span>
                            </div>

                            <h1 className="font-display text-3xl text-[var(--color-primary)]">
                                HTT Flooring
                            </h1>

                            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                                Statement of
                                Account
                            </p>
                        </div>

                        <div className="text-right">
                            <div className="text-xs text-[var(--color-text-muted)]">
                                Statement Period
                            </div>

                            <div className="mt-1 text-sm font-semibold">
                                {formatDate(
                                    statement.fromDate,
                                )}
                            </div>

                            <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                to
                            </div>

                            <div className="mt-0.5 text-sm font-semibold">
                                {formatDate(
                                    statement.toDate,
                                )}
                            </div>

                            <div className="mt-5 print:hidden">
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        window.print()
                                    }
                                >
                                    <Printer
                                        size={15}
                                    />

                                    Print
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-b border-[var(--color-border)] px-8 py-6">
                    <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                            Statement For
                        </div>

                        <div className="mt-3 text-base font-semibold">
                            {
                                customer.businessName
                            }
                        </div>

                        <div className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
                            {
                                customer.code
                            }
                        </div>

                        {customer.abn && (
                            <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
                                ABN{" "}
                                {
                                    customer.abn
                                }
                            </div>
                        )}

                        {primaryLocation && (
                            <div className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                                <div>
                                    {
                                        primaryLocation.addressLine1
                                    }
                                </div>

                                {primaryLocation.addressLine2 && (
                                    <div>
                                        {
                                            primaryLocation.addressLine2
                                        }
                                    </div>
                                )}

                                <div>
                                    {
                                        primaryLocation.suburb
                                    }
                                    ,{" "}
                                    {
                                        primaryLocation.state
                                    }{" "}
                                    {
                                        primaryLocation.postcode
                                    }
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full max-w-[360px] rounded-lg bg-[var(--color-background-subtle)] p-5">
                            <StatementSummaryRow
                                label="Opening Balance"
                                value={formatMoney(
                                    statement.openingBalance,
                                )}
                            />

                            <div className="mt-3">
                                <StatementSummaryRow
                                    label="Invoices / Reversals"
                                    value={formatMoney(
                                        statement.totalDebits,
                                    )}
                                />
                            </div>

                            <div className="mt-3">
                                <StatementSummaryRow
                                    label="Payments"
                                    value={formatMoney(
                                        statement.totalCredits,
                                    )}
                                />
                            </div>

                            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                                <StatementSummaryRow
                                    label="Balance Due"
                                    value={formatMoney(
                                        statement.closingBalance,
                                    )}
                                    strong
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ReceiptText
                                size={15}
                                className="text-[var(--color-primary)]"
                            />

                            <h2 className="text-sm font-semibold">
                                Account Activity
                            </h2>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                            <CalendarDays
                                size={12}
                            />

                            {formatDate(
                                statement.fromDate,
                            )}
                            {" – "}
                            {formatDate(
                                statement.toDate,
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                        <div className="grid grid-cols-[90px_135px_minmax(0,1fr)_100px_100px_110px] gap-3 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                            <div>
                                Date
                            </div>

                            <div>
                                Reference
                            </div>

                            <div>
                                Description
                            </div>

                            <div className="text-right">
                                Debit
                            </div>

                            <div className="text-right">
                                Credit
                            </div>

                            <div className="text-right">
                                Balance
                            </div>
                        </div>

                        <div className="grid grid-cols-[90px_135px_minmax(0,1fr)_100px_100px_110px] items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-4 py-4 text-xs">
                            <div>
                                {formatDate(
                                    statement.fromDate,
                                )}
                            </div>

                            <div className="font-mono font-semibold">
                                OPENING
                            </div>

                            <div className="font-medium text-[var(--color-text-secondary)]">
                                Opening Balance
                            </div>

                            <div className="text-right">
                                —
                            </div>

                            <div className="text-right">
                                —
                            </div>

                            <div className="money whitespace-nowrap text-right font-semibold">
                                {formatMoney(
                                    statement.openingBalance,
                                )}
                            </div>
                        </div>

                        {statement.entries.length ===
                            0 ? (
                            <div className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">
                                No account
                                activity.
                            </div>
                        ) : (
                            statement.entries.map(
                                (
                                    entry,
                                ) => (
                                    <StatementRow
                                        key={
                                            entry.id
                                        }
                                        entry={
                                            entry
                                        }
                                        onOpenInvoice={
                                            entry.invoiceId
                                                ? () =>
                                                    navigate(
                                                        `/sales/invoices/${entry.invoiceId}`,
                                                    )
                                                : undefined
                                        }
                                    />
                                ),
                            )
                        )}
                    </div>
                </div>

                <div className="border-t border-[var(--color-border)] px-8 py-6">
                    <div className="flex justify-end">
                        <div className="w-[360px]">
                            <div className="flex items-center justify-between text-base font-semibold">
                                <span>
                                    Balance Due
                                </span>

                                <span className="money text-xl text-[var(--color-primary)]">
                                    {formatMoney(
                                        statement.closingBalance,
                                    )}
                                </span>
                            </div>

                            <div className="mt-2 text-right text-[10px] text-[var(--color-text-muted)]">
                                All amounts
                                shown in AUD.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatementRow({
    entry,
    onOpenInvoice,
}: {
    entry:
    StatementEntry;

    onOpenInvoice?:
    () => void;
}) {
    const reversed =
        entry.type ===
        "PAYMENT_REVERSAL";

    return (
        <div className="statement-row grid grid-cols-[90px_135px_minmax(0,1fr)_100px_100px_110px] items-center gap-3 border-b border-[var(--color-border)] px-4 py-4 text-xs last:border-b-0">
            <div>
                {formatDate(
                    entry.date,
                )}
            </div>

            <div>
                {entry.invoiceId &&
                    entry.type ===
                    "INVOICE" &&
                    onOpenInvoice ? (
                    <button
                        type="button"
                        onClick={
                            onOpenInvoice
                        }
                        className="font-mono font-semibold text-[var(--color-primary)] hover:underline print:text-black print:no-underline"
                    >
                        {
                            entry.reference
                        }
                    </button>
                ) : (
                    <span
                        className={[
                            "font-mono font-semibold",
                            reversed
                                ? "text-[var(--color-danger)]"
                                : "",
                        ].join(
                            " ",
                        )}
                    >
                        {
                            entry.reference
                        }
                    </span>
                )}
            </div>

            <div
                className={[
                    "min-w-0 break-words",
                    reversed
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-text-secondary)]",
                ].join(" ")}
            >
                {
                    entry.description
                }
            </div>

            <div className="money whitespace-nowrap text-right">
                {entry.debit > 0
                    ? formatMoney(
                        entry.debit,
                    )
                    : "—"}
            </div>

            <div className="money whitespace-nowrap text-right">
                {entry.credit > 0
                    ? formatMoney(
                        entry.credit,
                    )
                    : "—"}
            </div>

            <div className="money whitespace-nowrap text-right font-semibold">
                {formatMoney(
                    entry.balance,
                )}
            </div>
        </div>
    );
}

function StatementSummaryRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-5">
            <span
                className={
                    strong
                        ? "font-semibold"
                        : "text-xs text-[var(--color-text-secondary)]"
                }
            >
                {label}
            </span>

            <span
                className={
                    strong
                        ? "money text-lg font-semibold text-[var(--color-primary)]"
                        : "money text-sm font-medium"
                }
            >
                {value}
            </span>
        </div>
    );
}

function formatMoney(
    value: number,
) {
    return value.toLocaleString(
        "en-AU",
        {
            style: "currency",
            currency: "AUD",
            minimumFractionDigits: 2,
        },
    );
}

function formatDate(
    value: string,
) {
    const [
        year,
        month,
        day,
    ] = value
        .split("-")
        .map(Number);

    return new Intl.DateTimeFormat(
        "en-AU",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    ).format(
        new Date(
            year,
            month - 1,
            day,
        ),
    );
}

function getToday() {
    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        );

    const day =
        String(
            now.getDate(),
        ).padStart(
            2,
            "0",
        );

    return `${year}-${month}-${day}`;
}

function getDefaultFromDate() {
    const now =
        new Date();

    return [
        now.getFullYear(),
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        ),
        "01",
    ].join("-");
}

function sanitizeFileNamePart(
    value: string,
) {
    return value
        .replace(
            /[^a-zA-Z0-9-_]+/g,
            "-",
        )
        .replace(
            /-+/g,
            "-",
        )
        .replace(
            /^-|-$|_/g,
            "",
        );
}