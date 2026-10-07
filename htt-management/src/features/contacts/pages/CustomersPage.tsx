import { Plus } from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../../../components/data-table/DataTable";
import { Button } from "../../../components/ui/Button";

import { CustomerStatusBadge } from "../components/CustomerStatusBadge";

import { useCustomers } from "../data/useCustomers";

import type { Customer } from "../types/customer";

const columns: ColumnDef<
    Customer,
    unknown
>[] = [
        {
            accessorKey: "businessName",
            header: "Customer",

            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-[var(--color-primary)]">
                        {row.original.businessName}
                    </div>

                    <div className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                        {row.original.code}
                    </div>
                </div>
            ),
        },

        {
            accessorKey: "businessType",
            header: "Business Type",

            cell: ({ row }) => (
                <span className="text-[var(--color-text-secondary)]">
                    {row.original.businessType}
                </span>
            ),
        },

        {
            id: "primaryContact",
            header: "Primary Contact",

            accessorFn: (customer) => {
                const contact =
                    customer.contacts.find(
                        (item) =>
                            item.id ===
                            customer.primaryContactId,
                    );

                return contact
                    ? `${contact.firstName} ${contact.lastName}`
                    : "";
            },

            cell: ({ row }) => {
                const contact =
                    row.original.contacts.find(
                        (item) =>
                            item.id ===
                            row.original.primaryContactId,
                    );

                if (!contact) {
                    return (
                        <span className="text-[var(--color-text-muted)]">
                            —
                        </span>
                    );
                }

                return (
                    <div>
                        <div>
                            {contact.firstName}{" "}
                            {contact.lastName}
                        </div>

                        <div className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                            {contact.email}
                        </div>
                    </div>
                );
            },
        },

        {
            id: "location",
            header: "Location",

            accessorFn: (customer) =>
                customer.locations.find(
                    (location) =>
                        location.id ===
                        customer.primaryLocationId,
                )?.name ?? "",

            cell: ({ row }) => {
                const location =
                    row.original.locations.find(
                        (item) =>
                            item.id ===
                            row.original.primaryLocationId,
                    );

                return (
                    <span className="text-[var(--color-text-secondary)]">
                        {location?.name ?? "—"}
                    </span>
                );
            },
        },

        {
            accessorKey: "currentBalance",
            header: "Balance",

            cell: ({ row }) => (
                <div className="money text-right font-medium">
                    $
                    {row.original.currentBalance.toLocaleString(
                        "en-AU",
                        {
                            minimumFractionDigits: 2,
                        },
                    )}
                </div>
            ),
        },

        {
            accessorKey: "overdueBalance",
            header: "Overdue",

            cell: ({ row }) => (
                <div
                    className={
                        row.original.overdueBalance > 0
                            ? "money text-right font-medium text-[var(--color-danger)]"
                            : "money text-right text-[var(--color-text-secondary)]"
                    }
                >
                    $
                    {row.original.overdueBalance.toLocaleString(
                        "en-AU",
                        {
                            minimumFractionDigits: 2,
                        },
                    )}
                </div>
            ),
        },

        {
            accessorKey: "status",
            header: "Status",

            cell: ({ row }) => (
                <CustomerStatusBadge
                    status={row.original.status}
                />
            ),
        },
    ];

export function CustomersPage() {
    const navigate = useNavigate();

    const customers = useCustomers();

    const activeCustomers =
        customers.filter(
            (customer) =>
                customer.status === "ACTIVE",
        ).length;

    const outstanding =
        customers.reduce(
            (total, customer) =>
                total +
                customer.currentBalance,
            0,
        );

    const overdue =
        customers.reduce(
            (total, customer) =>
                total +
                customer.overdueBalance,
            0,
        );

    return (
        <div className="pb-8">
            <div className="mb-7 flex items-start justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Management
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        Customers
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Manage customer accounts,
                        locations, contacts and trading
                        information.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/contacts/suppliers",
                            )
                        }
                    >
                        Suppliers
                    </Button>

                    <Button
                        variant="accent"
                        onClick={() =>
                            navigate(
                                "/contacts/customers/new",
                            )
                        }
                    >
                        <Plus size={16} />
                        New customer
                    </Button>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-4">
                <Summary
                    label="Total customers"
                    value={customers.length.toString()}
                />

                <Summary
                    label="Active"
                    value={activeCustomers.toString()}
                />

                <Summary
                    label="Outstanding"
                    value={`$${outstanding.toLocaleString(
                        "en-AU",
                    )}`}
                />

                <Summary
                    label="Overdue"
                    value={`$${overdue.toLocaleString(
                        "en-AU",
                    )}`}
                    danger
                />
            </div>

            <DataTable
                data={customers}
                columns={columns}
                search={{
                    placeholder:
                        "Search customer, code, contact or email...",

                    filterFn: (
                        customer,
                        query,
                    ) => {
                        const contactText =
                            customer.contacts
                                .map(
                                    (contact) =>
                                        `${contact.firstName} ${contact.lastName} ${contact.email}`,
                                )
                                .join(" ");

                        return [
                            customer.businessName,
                            customer.tradingName ?? "",
                            customer.code,
                            customer.email ?? "",
                            customer.businessType,
                            contactText,
                        ]
                            .join(" ")
                            .toLowerCase()
                            .includes(query);
                    },
                }}
                pagination={{
                    pageSize: 10,
                }}
                onRowClick={(customer) => {
                    navigate(
                        `/contacts/customers/${customer.id}`,
                    );
                }}
            />
        </div>
    );
}

function Summary({
    label,
    value,
    danger = false,
}: {
    label: string;
    value: string;
    danger?: boolean;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-5 py-4 shadow-[var(--shadow-xs)]">
            <div className="text-xs text-[var(--color-text-secondary)]">
                {label}
            </div>

            <div
                className={
                    danger
                        ? "money mt-2 text-xl font-semibold text-[var(--color-danger)]"
                        : "money mt-2 text-xl font-semibold"
                }
            >
                {value}
            </div>
        </div>
    );
}