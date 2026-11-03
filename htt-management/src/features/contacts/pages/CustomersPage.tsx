import { useSecurity } from "../../security/securityClient";
import { usePermission } from "../../security/usePermission";
import { customerRepository } from "../data/customerRepository";
import { customerStatuses } from "../schemas/customerSchemas";
import { feedback } from "../../../components/ui/feedback";
import { useMemo } from "react";
import { calculateCustomerAccountsReceivable } from "../../sales/data/accountsReceivableService";
import { useSalesDocuments } from "../../sales/data/useSalesDocuments";
import { usePayments } from "../../sales/data/usePayments";
import { useCreditAllocations, useCreditNotes } from "../../sales/data/useCreditNotes";
import { ChevronDown, Plus } from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../../../components/data-table/DataTable";
import { Button } from "../../../components/ui/Button";

import { CustomerStatusBadge, customerStatusLabels } from "../components/CustomerStatusBadge";

import { useCustomers } from "../data/useCustomers";

import type { Customer, CustomerContact } from "../types/customer";

type CustomerRow = Customer & {
    availableCredit: number;
    lastSaleDate: string;
    lastPaymentDate: string;
};

function displayActivityDate(value: string) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en-AU", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function contactColumn(
    id: string,
    header: string,
    getContact: (customer: Customer) => CustomerContact | undefined,
): ColumnDef<CustomerRow, unknown> {
    return {
        id,
        header,
        accessorFn: customer => {
            const contact = getContact(customer);
            return contact ? `${contact.firstName} ${contact.lastName}` : "";
        },
        meta: { exportValue: customer => {
            const contact = getContact(customer);
            return contact ? [`${contact.firstName} ${contact.lastName}`, contact.mobile].filter(Boolean).join(" · ") : "";
        } },
        cell: ({ row }) => {
            const contact = getContact(row.original);
            if (!contact) return <span className="text-[var(--color-text-muted)]">—</span>;

            return <div>
                <div>{contact.firstName} {contact.lastName}</div>
                <div className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{contact.mobile || "—"}</div>
            </div>;
        },
    };
}

const columns: ColumnDef<
    CustomerRow,
    unknown
>[] = [
        {
            accessorKey: "businessName",
            meta:{exportValue:r=>r.businessName+' · '+r.code},
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

        contactColumn("primaryContact", "Primary Contact", customer =>
            customer.contacts.find(contact => contact.id === customer.primaryContactId)),
        contactColumn("accountantContact", "Accountant Contact", customer =>
            customer.contacts.find(contact => contact.isAccounting)),

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
            header: "Current Balance",
            meta: { align: "center" },

            cell: ({ row }) => (
                <div className="money text-center font-medium">
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
            meta: { align: "center" },

            cell: ({ row }) => (
                <div
                    className={
                        row.original.overdueBalance > 0
                            ? "money text-center font-medium text-[var(--color-danger)]"
                            : "money text-center text-[var(--color-text-secondary)]"
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
            accessorKey: "availableCredit",
            header: "Available Credit",
            meta: { align: "center" },
            cell: ({ getValue }) => (
                <div className="money text-center font-medium">
                    ${getValue<number>().toLocaleString("en-AU", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </div>
            ),
        },

        {
            accessorKey: "lastSaleDate",
            header: "Last Sale/Purchase",
            meta: { align: "center" },
            cell: ({ row }) => displayActivityDate(row.original.lastSaleDate),
        },
        {
            accessorKey: "lastPaymentDate",
            header: "Last Payment",
            meta: { align: "center" },
            cell: ({ row }) => displayActivityDate(row.original.lastPaymentDate),
        },

        {
            accessorKey: "status",
            header: "Status",

            cell: ({ row }) => <CustomerStatusCell customer={row.original}/>,
        },
    ];

function CustomerStatusCell({ customer }: { customer: Customer }) {
    const canEdit = usePermission("contacts.write");
    if (!canEdit) return <CustomerStatusBadge status={customer.status}/>;

    const statusColor = {
        ACTIVE: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
        ON_HOLD: "bg-[var(--color-warning-soft)] text-[#8a641c]",
        INACTIVE: "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]",
    }[customer.status];

    return <span className="relative inline-flex">
    <select
        aria-label={`Status for ${customer.businessName}`}
        value={customer.status}
        onClick={event => event.stopPropagation()}
        className={`h-6 w-24 cursor-pointer appearance-none rounded-full border-0 pl-3 pr-7 text-xs font-medium ${statusColor}`}
        onChange={event => {
            try {
                customerRepository.setStatus(customer.id, event.target.value);
                feedback.success("Customer status updated.");
            } catch (error) {
                feedback.error(error instanceof Error ? error.message : "Could not update customer status.");
            }
        }}
    >
        {customerStatuses.map(status => <option key={status} value={status}>{customerStatusLabels[status]}</option>)}
    </select>
    <ChevronDown size={13} aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"/>
    </span>;
}

export function CustomersPage() {
    const navigate = useNavigate();
    const { session } = useSecurity();
    const roles = session?.user.roles ?? [];
    const showAccountant = roles.includes("ACCOUNTANT") && !roles.includes("ADMIN") && !roles.includes("FINANCE_ADMIN");

    const profiles = useCustomers();
    const documents = useSalesDocuments();
    const payments = usePayments();
    const allocations = useCreditAllocations();
    const creditNotes = useCreditNotes();
    const customers = useMemo<CustomerRow[]>(() => profiles.map(customer => {
        const receivable = calculateCustomerAccountsReceivable(customer, documents, payments, allocations, creditNotes);
        return {
            ...customer,
            currentBalance: receivable.netAccountBalance,
            overdueBalance: receivable.overdueAmount,
            availableCredit: customer.paymentTermsDays === 0 ? 0 : receivable.availableCredit,
            lastSaleDate: documents
                .filter(document => document.customerId === customer.id && document.type === "INVOICE" && document.status !== "DRAFT" && document.status !== "VOID")
                .reduce((latest, document) => document.documentDate > latest ? document.documentDate : latest, ""),
            lastPaymentDate: payments
                .filter(payment => payment.customerId === customer.id && payment.status === "RECEIVED" && !payment.depositApplicationId)
                .reduce((latest, payment) => payment.paymentDate > latest ? payment.paymentDate : latest, ""),
        };
    }), [profiles, documents, payments, allocations, creditNotes]);

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
                    <Button variant="secondary" onClick={() => navigate("/contacts/review")}>
                        Incoming reviews
                    </Button>
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
                    label="Current Balance"
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
                capabilities={{id:"customers",scope:"complete",permission:"sales.read",rowId:r=>r.id}}
                data={customers}
                columns={columns}
                key={`${session?.user.id ?? ""}:${showAccountant}`}
                defaultColumnVisibility={{ primaryContact: !showAccountant, accountantContact: showAccountant }}
                search={{
                    placeholder:
                        "Search customer, code, contact, mobile or email...",

                    filterFn: (
                        customer,
                        query,
                    ) => {
                        const contactText =
                            customer.contacts
                                .map(
                                    (contact) =>
                                        `${contact.firstName} ${contact.lastName} ${contact.mobile || "—"}`,
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