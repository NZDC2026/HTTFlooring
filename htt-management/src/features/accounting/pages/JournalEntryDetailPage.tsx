import {
    ArrowLeft,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Badge,
} from "../../../components/ui/Badge";

import {
    Button,
} from "../../../components/ui/Button";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import {
    useJournalEntry,
} from "../data/useAccounting";

export function JournalEntryDetailPage() {
    const navigate =
        useNavigate();

    const {
        journalEntryId,
    } = useParams<{
        journalEntryId:
        string;
    }>();

    const entry =
        useJournalEntry(
            journalEntryId,
        );

    if (
        !journalEntryId ||
        !entry
    ) {
        return (
            <Navigate
                to="/accounting/journals"
                replace
            />
        );
    }

    const resolvedEntry =
        entry;

    return (
        <div className="pb-8">
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    navigate(
                        "/accounting/journals",
                    )
                }
                className="mb-5"
            >
                <ArrowLeft
                    size={
                        15
                    }
                />

                Journal Register
            </Button>

            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        General Ledger
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                            {
                                resolvedEntry
                                    .journalNumber
                            }
                        </h1>

                        <Badge
                            variant={
                                resolvedEntry
                                    .status ===
                                    "POSTED"
                                    ? "success"
                                    : "warning"
                            }
                        >
                            {
                                resolvedEntry
                                    .status
                            }
                        </Badge>
                    </div>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {
                            resolvedEntry
                                .description
                        }
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        Journal Date
                    </p>

                    <p className="mt-1 font-medium text-[var(--color-text-primary)]">
                        {
                            resolvedEntry
                                .journalDate
                        }
                    </p>
                </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <InfoCard
                    label="Source"
                    value={
                        formatSourceType(
                            resolvedEntry
                                .sourceType,
                        )
                    }
                />

                <InfoCard
                    label="Reference"
                    value={
                        resolvedEntry
                            .reference ??
                        "—"
                    }
                />

                <InfoCard
                    label="Source ID"
                    value={
                        resolvedEntry
                            .sourceId ??
                        "—"
                    }
                />
            </div>

            {resolvedEntry
                .status ===
                "REVERSED" ? (
                <Card className="mb-6">
                    <CardContent>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            Reversal
                            Information
                        </p>

                        <div className="mt-3 grid gap-4 md:grid-cols-3">
                            <Detail
                                label="Reversed At"
                                value={
                                    resolvedEntry
                                        .reversedAt ??
                                    "—"
                                }
                            />

                            <Detail
                                label="Reason"
                                value={
                                    resolvedEntry
                                        .reversalReason ??
                                    "—"
                                }
                            />

                            <Detail
                                label="Reversal Journal ID"
                                value={
                                    resolvedEntry
                                        .reversalJournalEntryId ??
                                    "—"
                                }
                            />
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {resolvedEntry
                .reversedJournalEntryId ? (
                <Card className="mb-6">
                    <CardContent>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            Reversal Journal
                        </p>

                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            This journal
                            reverses journal
                            entry{" "}
                            {
                                resolvedEntry
                                    .reversedJournalEntryId
                            }.
                        </p>
                    </CardContent>
                </Card>
            ) : null}

            <Card>
                <CardContent>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                            Journal Lines
                        </h2>

                        <span className="text-sm text-[var(--color-text-secondary)]">
                            {
                                resolvedEntry
                                    .lines
                                    .length
                            }{" "}
                            lines
                        </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[var(--color-background-subtle)]">
                                    <th className="border-b border-[var(--color-border)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                                        Account
                                    </th>

                                    <th className="border-b border-[var(--color-border)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                                        Description
                                    </th>

                                    <th className="border-b border-[var(--color-border)] px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                                        Debit
                                    </th>

                                    <th className="border-b border-[var(--color-border)] px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                                        Credit
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {resolvedEntry
                                    .lines
                                    .map(
                                        (
                                            line,
                                        ) => (
                                            <tr
                                                key={
                                                    line.id
                                                }
                                                className="border-b border-[var(--color-border)] last:border-b-0"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-[var(--color-text-primary)]">
                                                        {
                                                            line.accountCode
                                                        }{" "}
                                                        {
                                                            line.accountName
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                                    {
                                                        line.description ??
                                                        "—"
                                                    }
                                                </td>

                                                <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text-primary)]">
                                                    {line.debit >
                                                        0
                                                        ? formatMoney(
                                                            line.debit,
                                                        )
                                                        : "—"}
                                                </td>

                                                <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text-primary)]">
                                                    {line.credit >
                                                        0
                                                        ? formatMoney(
                                                            line.credit,
                                                        )
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                            </tbody>

                            <tfoot>
                                <tr className="bg-[var(--color-background-subtle)] font-semibold">
                                    <td
                                        colSpan={
                                            2
                                        }
                                        className="px-4 py-3 text-right text-[var(--color-text-primary)]"
                                    >
                                        Total
                                    </td>

                                    <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text-primary)]">
                                        {formatMoney(
                                            resolvedEntry
                                                .totalDebit,
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text-primary)]">
                                        {formatMoney(
                                            resolvedEntry
                                                .totalCredit,
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function InfoCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <Card>
            <CardContent>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    {label}
                </p>

                <p className="mt-2 break-all text-sm font-medium text-[var(--color-text-primary)]">
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </p>

            <p className="mt-1 break-all text-sm text-[var(--color-text-primary)]">
                {value}
            </p>
        </div>
    );
}

function formatSourceType(
    value: string,
) {
    return value
        .split("_")
        .map(
            (word) =>
                word
                    .charAt(0)
                    .toUpperCase() +
                word
                    .slice(1)
                    .toLowerCase(),
        )
        .join(" ");
}

function formatMoney(
    value: number,
) {
    return new Intl.NumberFormat(
        "en-AU",
        {
            style:
                "currency",
            currency:
                "AUD",
        },
    ).format(
        value,
    );
}