import {
    Plus,
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
    Button,
} from "../../../components/ui/Button";

import {
    SupplierStatusBadge,
} from "../components/SupplierStatusBadge";

import {
    useSuppliers,
} from "../data/useSuppliers";

import type {
    Supplier,
} from "../types/supplier";

const columns: ColumnDef<
    Supplier,
    unknown
>[] = [
        {
            accessorKey:
                "businessName",

            header: "Supplier",

            cell: ({
                row,
            }) => (
                <div>
                    <div className="font-medium text-[var(--color-primary)]">
                        {
                            row.original
                                .businessName
                        }
                    </div>

                    <div className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                        {
                            row.original
                                .code
                        }
                    </div>
                </div>
            ),
        },

        {
            accessorKey:
                "contactName",

            header:
                "Primary Contact",

            cell: ({
                row,
            }) => (
                <span className="text-[var(--color-text-secondary)]">
                    {row.original
                        .contactName ??
                        "—"}
                </span>
            ),
        },

        {
            accessorKey:
                "email",

            header: "Email",

            cell: ({
                row,
            }) => (
                <span className="text-[var(--color-text-secondary)]">
                    {row.original
                        .email ??
                        "—"}
                </span>
            ),
        },

        {
            id: "location",

            header: "Location",

            accessorFn: (
                supplier,
            ) =>
                [
                    supplier.suburb,
                    supplier.state,
                ]
                    .filter(
                        Boolean,
                    )
                    .join(", "),

            cell: ({
                row,
            }) => {
                const value = [
                    row.original
                        .suburb,
                    row.original
                        .state,
                ]
                    .filter(
                        Boolean,
                    )
                    .join(", ");

                return (
                    <span className="text-[var(--color-text-secondary)]">
                        {value ||
                            "—"}
                    </span>
                );
            },
        },

        {
            accessorKey:
                "paymentTermsDays",

            header:
                "Payment Terms",

            cell: ({
                row,
            }) => (
                <span className="text-[var(--color-text-secondary)]">
                    {
                        row.original
                            .paymentTermsDays
                    }{" "}
                    days
                </span>
            ),
        },

        {
            accessorKey:
                "status",

            header: "Status",

            cell: ({
                row,
            }) => (
                <SupplierStatusBadge
                    status={
                        row.original
                            .status
                    }
                />
            ),
        },
    ];

export function SuppliersPage() {
    const navigate =
        useNavigate();

    const suppliers =
        useSuppliers();

    const active =
        suppliers.filter(
            (supplier) =>
                supplier.status ===
                "ACTIVE",
        ).length;

    const gstRegistered =
        suppliers.filter(
            (supplier) =>
                supplier.taxRegistered,
        ).length;

    const averageTerms =
        suppliers.length > 0
            ? Math.round(
                suppliers.reduce(
                    (
                        total,
                        supplier,
                    ) =>
                        total +
                        supplier.paymentTermsDays,
                    0,
                ) /
                suppliers.length,
            )
            : 0;

    return (
        <div className="pb-8">
            <div className="mb-7 flex items-start justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Management
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        Suppliers
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Manage
                        suppliers,
                        purchasing
                        details and
                        accounts
                        payable
                        settings.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/contacts",
                            )
                        }
                    >
                        Customers
                    </Button>

                    <Button
                        variant="accent"
                        onClick={() =>
                            navigate(
                                "/contacts/suppliers/new",
                            )
                        }
                    >
                        <Plus size={16} />
                        New supplier
                    </Button>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-4">
                <Summary
                    label="Total suppliers"
                    value={
                        suppliers.length
                    }
                />

                <Summary
                    label="Active"
                    value={
                        active
                    }
                />

                <Summary
                    label="GST registered"
                    value={
                        gstRegistered
                    }
                />

                <Summary
                    label="Average terms"
                    value={`${averageTerms} days`}
                />
            </div>

            <DataTable
                data={
                    suppliers
                }
                columns={
                    columns
                }
                search={{
                    placeholder:
                        "Search supplier, code, contact or email...",

                    filterFn: (
                        supplier,
                        query,
                    ) =>
                        [
                            supplier.businessName,
                            supplier.tradingName ??
                            "",
                            supplier.code,
                            supplier.contactName ??
                            "",
                            supplier.email ??
                            "",
                            supplier.abn ??
                            "",
                            supplier.suburb ??
                            "",
                            supplier.state ??
                            "",
                        ]
                            .join(
                                " ",
                            )
                            .toLowerCase()
                            .includes(
                                query,
                            ),
                }}
                pagination={{
                    pageSize:
                        10,
                }}
                onRowClick={(
                    supplier,
                ) =>
                    navigate(
                        `/contacts/suppliers/${supplier.id}`,
                    )
                }
            />
        </div>
    );
}

function Summary({
    label,
    value,
}: {
    label: string;
    value:
    | string
    | number;
}) {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="mt-2 font-display text-2xl">
                {value}
            </div>
        </div>
    );
}