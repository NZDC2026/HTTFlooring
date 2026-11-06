import { useVisits } from "../../sales-visits/visitRepository";
import { useWorkspaceRecords } from "../../business-workspace/workspaceRepository";
import type { ConfigRow } from "../../business-workspace/configurationState";
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

import { Link, useNavigate } from "react-router-dom";

import type { CellContext, ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../../../components/data-table/DataTable";
import { Button } from "../../../components/ui/Button";

import { CustomerStatusBadge, customerStatusLabels } from "../components/CustomerStatusBadge";

import { useCustomers } from "../data/useCustomers";

import type { Customer, CustomerContact, CustomerNote } from "../types/customer";

type CustomerRow = Customer & {
    availableCredit: number;
    tasks: ConfigRow[];
    lastContactDate: string;
    sampleContactDays: number | null | undefined;
    lastSaleDate: string;
    lastPaymentDate: string;
};

const dayMilliseconds = 86_400_000;

function ContactAge({ days }: { days: number | null }) {
    const color = days === null ? "bg-gray-400" : days < 14 ? "bg-green-500"
        : days < 30 ? "bg-yellow-500" : days <= 60 ? "bg-orange-500" : "bg-red-600";
    return <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span aria-hidden="true" className={`size-2.5 rounded-full ${color}`}/>
        {days === null ? "No contact recorded" : `${days} days ago`}
    </span>;
}

function contactAge(date: string) {
    if (!date) return null;
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.floor((today - Date.parse(date)) / dayMilliseconds));
}

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
            accessorKey: "lastContactDate",
            header: "Last Contact Date",
            meta: { align: "center" },
            cell: ({ row }) => {
                const { lastContactDate, sampleContactDays } = row.original;
                if (lastContactDate || sampleContactDays === undefined) return <div>
                    {lastContactDate && <div>{displayActivityDate(lastContactDate)}</div>}
                    <ContactAge days={contactAge(lastContactDate)}/>
                </div>;
                const date = new Date();
                if (sampleContactDays !== null) date.setDate(date.getDate() - sampleContactDays);
                return <div>
                    <span className="rounded bg-amber-100 px-1 text-xs text-amber-900">Sample</span>
                    {sampleContactDays !== null && <div>{date.toLocaleDateString("en-AU")}</div>}
                    <ContactAge days={sampleContactDays}/>
                </div>;
            },
        },
        {
            accessorKey: "lastPaymentDate",
            header: "Last Payment",
            meta: { align: "center" },
            cell: ({ row }) => displayActivityDate(row.original.lastPaymentDate),
        },

        {
            id: "notes",
            header: "Activities",
            enableSorting: false,
            meta: { exportable: false },
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

function activityCounts(notes: CustomerNote[], tasks: ConfigRow[]) {
    const resolved = new Set(notes.filter(note => note.action === "resolve").map(note => note.threadId));
    const openNotes = notes.filter(note => !note.threadId && !resolved.has(note.id)).length;
    const openTasks = tasks.filter(task => task.status !== "Completed" && task.status !== "Cancelled");
    const soon = Date.now() + 24 * 60 * 60 * 1000;
    const urgent = openTasks.filter(task => {
        const due = task.deliveryAt || (task.due ? `${task.due}T23:59:59` : "");
        return /^(urgent|high)$/i.test(task.priority ?? "") || Date.parse(due) <= soon;
    }).length;
    return { urgent, total: openNotes + openTasks.length };
}

function ActivityIndicator({ urgent, total }: ReturnType<typeof activityCounts>) {
    if (!total) return <span aria-label="No open notes or tasks">—</span>;
    return <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className={`size-2.5 rounded-full ${urgent ? "bg-red-600" : "bg-orange-500"}`}/>
        {urgent || total}
    </span>;
}

export function CustomersPage() {
    const navigate = useNavigate();
    const customerColumns = useMemo(() => columns.map(column => column.id !== "notes" ? column : {
        ...column,
        cell: ({ row }: CellContext<CustomerRow, unknown>) => {
            const customer = row.original;
            const counts = activityCounts(customer.notes ?? [], customer.tasks);
            const sample = !customer.notes?.length && !customer.tasks.length
                ? customer.sampleContactDays === 7 ? { urgent: 0, total: 1 }
                    : customer.sampleContactDays === 21 ? { urgent: 2, total: 2 } : undefined
                : undefined;
            return <span className="inline-block px-2 py-1" onClick={event => event.stopPropagation()}>
                <ActivityIndicator {...(sample ?? counts)}/>
                {sample && <span className="ml-1 rounded bg-amber-100 px-1 text-xs text-amber-900">Sample</span>}
            </span>;
        },
    }), []);
    const { session } = useSecurity();
    const roles = session?.user.roles ?? [];
    const showAccountant = roles.includes("ACCOUNTANT") && !roles.includes("ADMIN") && !roles.includes("FINANCE_ADMIN");

    const profiles = useCustomers();
    const documents = useSalesDocuments();
    const payments = usePayments();
    const allocations = useCreditAllocations();
    const creditNotes = useCreditNotes();
    const tasks = useWorkspaceRecords("tasks");
    const visits = useVisits();
    const customers = useMemo<CustomerRow[]>(() => profiles.map((customer, index) => {
        const receivable = calculateCustomerAccountsReceivable(customer, documents, payments, allocations, creditNotes);
        const lastContactDate = visits
            .filter(visit => visit.customerId === customer.id && visit.status === "Completed")
            .reduce((latest, visit) => {
                if (!visit.checkOutAt) return latest;
                const completed = new Date(visit.checkOutAt);
                const date = `${completed.getFullYear()}-${String(completed.getMonth() + 1).padStart(2, "0")}-${String(completed.getDate()).padStart(2, "0")}`;
                return date > latest ? date : latest;
            }, "");
        return {
            ...customer,
            lastContactDate,
            sampleContactDays: [7, 21, 39, 72, null][index],
            tasks: tasks.filter(task => task.customerId === customer.id && task.status !== "Inactive")
                .sort((a, b) => (a.deliveryAt || a.due).localeCompare(b.deliveryAt || b.due)),
            currentBalance: receivable.netAccountBalance,
            overdueBalance: receivable.overdueAmount,
            availableCredit: receivable.availableCredit,
            lastSaleDate: documents
                .filter(document => document.customerId === customer.id && document.type === "INVOICE" && document.status !== "DRAFT" && document.status !== "VOID")
                .reduce((latest, document) => document.documentDate > latest ? document.documentDate : latest, ""),
            lastPaymentDate: payments
                .filter(payment => payment.customerId === customer.id && payment.status === "RECEIVED" && !payment.depositApplicationId)
                .reduce((latest, payment) => payment.paymentDate > latest ? payment.paymentDate : latest, ""),
        };
    }), [profiles, documents, payments, allocations, creditNotes, tasks, visits]);
    const needingAttention = customers
        .filter(customer => customer.status === "ACTIVE" && (contactAge(customer.lastContactDate) ?? -1) >= 30)
        .sort((a, b) => a.lastContactDate.localeCompare(b.lastContactDate));

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
        <div className="pb-8"><Link to="/contacts" className="mb-4 inline-flex text-xs text-[var(--color-primary)] underline">← Back to Customers dashboard</Link>
            <div className="mb-7 flex items-start justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Contacts
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

            <section className="rounded-xl border border-[var(--color-border)] bg-white p-4">
                <h2 className="text-sm font-semibold">Customers Needing Attention — {needingAttention.length}</h2>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Active customers with a recorded visit at least 30 days ago.</p>
                {needingAttention.length > 0 && <ul className="mt-2 divide-y">
                    {needingAttention.map(customer => <li key={customer.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                        <Link className="underline" to={`/contacts/customers/${customer.id}/activity`}>{customer.businessName}</Link>
                        <ContactAge days={contactAge(customer.lastContactDate)}/>
                    </li>)}
                </ul>}
            </section>

            <DataTable
                capabilities={{id:"customers",scope:"complete",permission:"sales.read",rowId:r=>r.id}}
                data={customers}
                columns={customerColumns}
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