import {
    AlertTriangle,
    CheckCircle2,
    Scale,
} from "lucide-react";

import type {
    AccountsReceivableReconciliation as ReconciliationResult,
} from "../types/accountsReceivableReconciliation";

interface Props {
    reconciliation:
    ReconciliationResult;
}

export function AccountsReceivableReconciliation({
    reconciliation,
}: Props) {
    const result =
        reconciliation;

    return (
        <div
            className={[
                "mb-5 overflow-hidden rounded-[var(--radius-card)] border bg-white shadow-[var(--shadow-xs)]",

                result.balanced
                    ? "border-[var(--color-border)]"
                    : "border-[var(--color-danger)]/30",
            ].join(" ")}
        >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                <div className="flex items-center gap-3">
                    <div
                        className={[
                            "flex h-9 w-9 items-center justify-center rounded-lg",

                            result.balanced
                                ? "bg-[var(--color-success-soft)]"
                                : "bg-[var(--color-danger-soft)]",
                        ].join(" ")}
                    >
                        {result.balanced ? (
                            <CheckCircle2
                                size={17}
                                className="text-[var(--color-success)]"
                            />
                        ) : (
                            <AlertTriangle
                                size={17}
                                className="text-[var(--color-danger)]"
                            />
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold">
                            Account Reconciliation
                        </h3>

                        <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                            Validates invoice AR,
                            customer credits and
                            statement balance.
                        </p>
                    </div>
                </div>

                <div
                    className={[
                        "text-xs font-semibold",

                        result.balanced
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-danger)]",
                    ].join(" ")}
                >
                    {result.balanced
                        ? "Account balanced"
                        : "Reconciliation issue"}
                </div>
            </div>

            <div className="grid grid-cols-4 divide-x divide-[var(--color-border)]">
                <Metric
                    label="Invoice AR"
                    value={formatMoney(
                        result.invoiceAr,
                    )}
                />

                <Metric
                    label="Unallocated Credits"
                    value={`-${formatMoney(
                        result.unallocatedCredit,
                    )}`}
                />

                <Metric
                    label="Net Account Balance"
                    value={formatMoney(
                        result.calculatedNetAccountBalance,
                    )}
                />

                <Metric
                    label="Statement Closing"
                    value={formatMoney(
                        result.statementClosingBalance,
                    )}
                    danger={
                        !result.accountBalanced
                    }
                />
            </div>

            <div className="border-t border-[var(--color-border)] px-5 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                        <Scale
                            size={14}
                        />

                        Statement Closing
                        Balance − Net Account
                        Balance
                    </div>

                    <div
                        className={[
                            "money text-sm font-semibold",

                            result.accountBalanced
                                ? "text-[var(--color-success)]"
                                : "text-[var(--color-danger)]",
                        ].join(" ")}
                    >
                        {formatMoney(
                            result.accountDifference,
                        )}
                    </div>
                </div>
            </div>

            {!result.balanced && (
                <div className="border-t border-[var(--color-border)]">
                    {result.invoiceIssues.map(
                        (issue) => (
                            <IssueRow
                                key={`invoice-${issue.invoiceId}`}
                                title={`${issue.reference} — Invoice balance mismatch`}
                                detail={`Expected due ${formatMoney(
                                    issue.expectedAmountDue,
                                )}, stored ${formatMoney(
                                    issue.actualAmountDue,
                                )}`}
                                difference={
                                    issue.difference
                                }
                            />
                        ),
                    )}

                    {result.creditNoteIssues.map(
                        (issue) => (
                            <IssueRow
                                key={`credit-${issue.creditNoteId}`}
                                title={`${issue.reference} — Credit balance mismatch`}
                                detail={`Expected available ${formatMoney(
                                    issue.expectedAmountAvailable,
                                )}, stored ${formatMoney(
                                    issue.actualAmountAvailable,
                                )}`}
                                difference={
                                    issue.difference
                                }
                            />
                        ),
                    )}

                    {!result.accountBalanced && (
                        <IssueRow
                            title="Customer account balance mismatch"
                            detail={`Statement ${formatMoney(
                                result.statementClosingBalance,
                            )} vs net AR ${formatMoney(
                                result.calculatedNetAccountBalance,
                            )}`}
                            difference={
                                result.accountDifference
                            }
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function Metric({
    label,
    value,
    danger = false,
}: {
    label: string;
    value: string;
    danger?: boolean;
}) {
    return (
        <div className="px-5 py-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div
                className={[
                    "money mt-2 text-base font-semibold",

                    danger
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-primary)]",
                ].join(" ")}
            >
                {value}
            </div>
        </div>
    );
}

function IssueRow({
    title,
    detail,
    difference,
}: {
    title: string;
    detail: string;
    difference: number;
}) {
    return (
        <div className="flex items-center justify-between gap-5 border-t border-[var(--color-border)] px-5 py-3 first:border-t-0">
            <div>
                <div className="text-xs font-medium text-[var(--color-danger)]">
                    {title}
                </div>

                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                    {detail}
                </div>
            </div>

            <div className="money shrink-0 text-xs font-semibold text-[var(--color-danger)]">
                {formatSignedMoney(
                    difference,
                )}
            </div>
        </div>
    );
}

function formatMoney(
    value: number,
) {
    return Math.abs(
        value,
    ).toLocaleString(
        "en-AU",
        {
            style: "currency",
            currency: "AUD",
            minimumFractionDigits: 2,
        },
    );
}

function formatSignedMoney(
    value: number,
) {
    if (
        Math.abs(
            value,
        ) < 0.005
    ) {
        return "$0.00";
    }

    const formatted =
        formatMoney(
            value,
        );

    return value > 0
        ? `+${formatted}`
        : `-${formatted}`;
}