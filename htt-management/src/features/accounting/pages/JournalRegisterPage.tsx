import {
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import type {
    ColumnDef,
} from "@tanstack/react-table";

import {
    DataTable,
} from "../../../components/data-table/DataTable";

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
    Input,
} from "../../../components/ui/Input";

import {
    useGeneralLedgerSummary,
    useJournalEntries,
} from "../data/useAccounting";

import type {
    JournalEntry,
} from "../types/journalEntry";

const columns:
    ColumnDef<
        JournalEntry,
        unknown
    >[] = [
        {
            accessorKey:
                "journalNumber",

            header:
                "Journal",

            cell: ({
                row,
            }) => (
                <span className="font-medium text-[var(--color-primary)]">
                    {
                        row.original
                            .journalNumber
                    }
                </span>
            ),
        },
        {
            accessorKey:
                "journalDate",

            header:
                "Date",
        },
        {
            accessorKey:
                "description",

            header:
                "Description",
        },
        {
            id:
                "source",

            header:
                "Source",

            cell: ({
                row,
            }) =>
                formatSourceType(
                    row.original
                        .sourceType,
                ),
        },
        {
            id:
                "debit",

            header:
                "Debit",

            cell: ({
                row,
            }) =>
                formatMoney(
                    row.original
                        .totalDebit,
                ),
        },
        {
            id:
                "credit",

            header:
                "Credit",

            cell: ({
                row,
            }) =>
                formatMoney(
                    row.original
                        .totalCredit,
                ),
        },
        {
            id:
                "status",

            header:
                "Status",

            cell: ({
                row,
            }) => (
                <Badge
                    variant={
                        row.original
                            .status ===
                            "POSTED"
                            ? "success"
                            : "warning"
                    }
                >
                    {
                        row.original
                            .status
                    }
                </Badge>
            ),
        },
    ];

export function JournalRegisterPage() {
    const navigate =
        useNavigate();

    const journalEntries =
        useJournalEntries();

    const [
        asOfDate,
        setAsOfDate,
    ] = useState(
        getToday(),
    );

    const summary =
        useGeneralLedgerSummary(
            asOfDate,
        );

    const visibleEntries =
        useMemo(
            () =>
                journalEntries
                    .filter(
                        (entry) =>
                            entry.journalDate <=
                            asOfDate,
                    )
                    .sort(
                        (
                            first,
                            second,
                        ) => {
                            const dateCompare =
                                second
                                    .journalDate
                                    .localeCompare(
                                        first
                                            .journalDate,
                                    );

                            if (
                                dateCompare !==
                                0
                            ) {
                                return dateCompare;
                            }

                            return second
                                .createdAt
                                .localeCompare(
                                    first
                                        .createdAt,
                                );
                        },
                    ),
            [
                journalEntries,
                asOfDate,
            ],
        );

    return (
        <div className="pb-8">
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    navigate(
                        "/accounting",
                    )
                }
                className="mb-5"
            >
                <ArrowLeft
                    size={
                        15
                    }
                />

                Chart of Accounts
            </Button>

            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Accounting
                    </p>

                    <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                        Journal Register
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                        Review posted
                        and reversed
                        journal entries
                        that form the
                        general ledger.
                    </p>
                </div>

                <label className="block w-full lg:w-48">
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        As at
                    </span>

                    <Input
                        type="date"
                        value={
                            asOfDate
                        }
                        onChange={(
                            event,
                        ) =>
                            setAsOfDate(
                                event
                                    .target
                                    .value,
                            )
                        }
                    />
                </label>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <SummaryCard
                    label="Journal Entries"
                    value={
                        String(
                            visibleEntries.length,
                        )
                    }
                />

                <SummaryCard
                    label="Total Debits"
                    value={
                        formatMoney(
                            summary.totalDebit,
                        )
                    }
                />

                <SummaryCard
                    label={
                        summary.balanced
                            ? "Total Credits · Balanced"
                            : "Total Credits · Out of Balance"
                    }
                    value={
                        formatMoney(
                            summary.totalCredit,
                        )
                    }
                />
            </div>

            <DataTable
                columns={
                    columns
                }
                data={
                    visibleEntries
                }
                search={{
                    placeholder:
                        "Search journals...",
                }}
                emptyTitle="No journal entries"
                emptyDescription="Journal entries will appear here when accounting transactions are posted."
                onRowClick={(
                    entry,
                ) =>
                    navigate(
                        `/accounting/journals/${entry.id}`,
                    )
                }
            />
        </div>
    );
}

function SummaryCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <Card>
            <CardContent>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    {label}
                </p>

                <p className="mt-2 font-display text-2xl font-semibold text-[var(--color-primary)]">
                    {value}
                </p>
            </CardContent>
        </Card>
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