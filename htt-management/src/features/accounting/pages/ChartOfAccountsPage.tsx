import {
    useMemo,
    useState,
} from "react";

import {
    BookOpen,
    Plus,
    Scale,
    Search,
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
    useAccounts,
} from "../data/useAccounting";

import type {
    Account,
    AccountType,
} from "../types/account";

const accountTypeLabels:
    Record<
        AccountType,
        string
    > = {
    ASSET:
        "Asset",

    LIABILITY:
        "Liability",

    EQUITY:
        "Equity",

    REVENUE:
        "Revenue",

    EXPENSE:
        "Expense",
};

const accountTypeOrder:
    AccountType[] = [
        "ASSET",
        "LIABILITY",
        "EQUITY",
        "REVENUE",
        "EXPENSE",
    ];

const columns:
    ColumnDef<
        Account,
        unknown
    >[] = [
        {
            accessorKey:
                "code",

            header:
                "Code",

            cell: ({
                row,
            }) => (
                <span className="font-medium text-[var(--color-primary)]">
                    {
                        row.original
                            .code
                    }
                </span>
            ),
        },

        {
            accessorKey:
                "name",

            header:
                "Account",

            cell: ({
                row,
            }) => (
                <div>
                    <div className="font-medium text-[var(--color-text-primary)]">
                        {
                            row.original
                                .name
                        }
                    </div>

                    {row.original
                        .description ? (
                        <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                            {
                                row.original
                                    .description
                            }
                        </div>
                    ) : null}
                </div>
            ),
        },

        {
            accessorKey:
                "type",

            header:
                "Type",

            cell: ({
                row,
            }) => (
                <span className="text-[var(--color-text-secondary)]">
                    {
                        accountTypeLabels[
                        row.original
                            .type
                        ]
                    }
                </span>
            ),
        },

        {
            id:
                "systemRole",

            header:
                "System Role",

            cell: ({
                row,
            }) =>
                row.original
                    .systemRole ? (
                    <Badge variant="info">
                        {formatSystemRole(
                            row.original
                                .systemRole,
                        )}
                    </Badge>
                ) : (
                    <span className="text-[var(--color-text-muted)]">
                        —
                    </span>
                ),
        },

        {
            id:
                "manualPosting",

            header:
                "Manual Posting",

            cell: ({
                row,
            }) => (
                <Badge
                    variant={
                        row.original
                            .allowManualPosting
                            ? "success"
                            : "neutral"
                    }
                >
                    {row.original
                        .allowManualPosting
                        ? "Allowed"
                        : "Blocked"}
                </Badge>
            ),
        },

        {
            accessorKey:
                "active",

            header:
                "Status",

            cell: ({
                row,
            }) => (
                <Badge
                    variant={
                        row.original
                            .active
                            ? "success"
                            : "neutral"
                    }
                >
                    {row.original
                        .active
                        ? "Active"
                        : "Inactive"}
                </Badge>
            ),
        },
    ];

export function ChartOfAccountsPage() {
    const navigate =
        useNavigate();

    const accounts =
        useAccounts();

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        typeFilter,
        setTypeFilter,
    ] =
        useState<
            AccountType | "ALL"
        >("ALL");

    const filteredAccounts =
        useMemo(
            () => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                return accounts
                    .filter(
                        (account) => {
                            if (
                                typeFilter !==
                                "ALL" &&
                                account.type !==
                                typeFilter
                            ) {
                                return false;
                            }

                            if (!query) {
                                return true;
                            }

                            return [
                                account.code,
                                account.name,
                                account.description ??
                                "",
                                account.systemRole ??
                                "",
                            ].some(
                                (
                                    value,
                                ) =>
                                    value
                                        .toLowerCase()
                                        .includes(
                                            query,
                                        ),
                            );
                        },
                    )
                    .sort(
                        (
                            first,
                            second,
                        ) =>
                            first.code.localeCompare(
                                second.code,
                                undefined,
                                {
                                    numeric:
                                        true,
                                },
                            ),
                    );
            },
            [
                accounts,
                search,
                typeFilter,
            ],
        );

    const activeCount =
        accounts.filter(
            (account) =>
                account.active,
        ).length;

    const controlCount =
        accounts.filter(
            (account) =>
                Boolean(
                    account.systemRole,
                ),
        ).length;

    const manualPostingCount =
        accounts.filter(
            (account) =>
                account.active &&
                account
                    .allowManualPosting,
        ).length;

    return (
        <div className="pb-8">
            <div className="mb-7 flex items-start justify-between gap-6">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Finance
                    </p>

                    <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                        Chart of
                        Accounts
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                        Manage the
                        accounts used
                        by the general
                        ledger and
                        financial
                        reporting.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/accounting/reconciliation/ar",
                            )
                        }
                    >
                        <Scale
                            size={
                                16
                            }
                        />

                        Reconcile AR
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/accounting/reconciliation/ap",
                            )
                        }
                    >
                        <Scale
                            size={
                                16
                            }
                        />

                        Reconcile AP
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/accounting/journals",
                            )
                        }
                    >
                        <BookOpen
                            size={
                                16
                            }
                        />

                        Journal Register
                    </Button>

                    <Button
                        onClick={() =>
                            navigate(
                                "/accounting/accounts/new",
                            )
                        }
                    >
                        <Plus
                            size={
                                16
                            }
                        />

                        New Account
                    </Button>
                </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <SummaryCard
                    label="Active Accounts"
                    value={
                        activeCount
                    }
                />

                <SummaryCard
                    label="System Control Accounts"
                    value={
                        controlCount
                    }
                />

                <SummaryCard
                    label="Manual Posting Accounts"
                    value={
                        manualPostingCount
                    }
                />
            </div>

            <Card>
                <CardContent>
                    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-sm">
                            <Search
                                size={
                                    16
                                }
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                            />

                            <Input
                                value={
                                    search
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Search code, name or system role"
                                className="pl-9"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <FilterButton
                                active={
                                    typeFilter ===
                                    "ALL"
                                }
                                onClick={() =>
                                    setTypeFilter(
                                        "ALL",
                                    )
                                }
                            >
                                All
                            </FilterButton>

                            {accountTypeOrder.map(
                                (
                                    type,
                                ) => (
                                    <FilterButton
                                        key={
                                            type
                                        }
                                        active={
                                            typeFilter ===
                                            type
                                        }
                                        onClick={() =>
                                            setTypeFilter(
                                                type,
                                            )
                                        }
                                    >
                                        {
                                            accountTypeLabels[
                                            type
                                            ]
                                        }
                                    </FilterButton>
                                ),
                            )}
                        </div>
                    </div>

                    <DataTable
                        columns={
                            columns
                        }
                        data={
                            filteredAccounts
                        }
                        onRowClick={(
                            account,
                        ) =>
                            navigate(
                                `/accounting/accounts/${account.id}/edit`,
                            )
                        }
                    />
                </CardContent>
            </Card>
        </div>
    );
}

function SummaryCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <Card>
            <CardContent>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    {label}
                </p>

                <p className="mt-2 font-display text-3xl font-semibold text-[var(--color-primary)]">
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function FilterButton({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children:
    React.ReactNode;
    onClick: () => void;
}) {
    return (
        <Button
            variant={
                active
                    ? "primary"
                    : "secondary"
            }
            size="sm"
            onClick={
                onClick
            }
        >
            {children}
        </Button>
    );
}

function formatSystemRole(
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