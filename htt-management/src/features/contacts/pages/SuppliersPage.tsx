import { useSearchParams, Link } from "react-router-dom";
import { filterSupplierRows, parseSupplierListFilter, supplierListFilters, supplierFilterLabels } from "../data/supplierListFilter";
import { storedCurrencySchema } from "../../currency/currency";
import { paymentTermsLabel } from "../../payment-terms/paymentTerms";
import { ChevronDown } from "lucide-react";
import { usePermission } from "../../security/usePermission";
import { supplierRepository } from "../data/supplierRepository";
import { feedback } from "../../../components/ui/feedback";
import { useMemo } from "react";
import { businessSettings } from "../../business-workspace/configurationState";
import { businessDateKey } from "../../../lib/businessDate";
import { calculateSupplierAccountsPayable } from "../../purchases/data/accountsPayableService";
import { useSupplierBills } from "../../purchases/data/useSupplierBills";
import { useSupplierPayments } from "../../purchases/data/useSupplierPayments";
import { useSupplierCredits, useSupplierCreditAllocations } from "../../purchases/data/useSupplierCredits";
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

type SupplierRow = Supplier & {
    currentBalance: number;
    overdueBalance: number;
    lastPurchaseDate: string;
    lastPaymentDate: string;
};

function money(amount: number) {
    return new Intl.NumberFormat("en-AU", { style: "currency", currency: businessSettings().currency }).format(amount);
}

function activityDate(value: string) {
    return value ? new Intl.DateTimeFormat("en-AU", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "—";
}

const columns: ColumnDef<
    SupplierRow,
    unknown
>[] = [
        {
            accessorKey:
                "businessName",
            meta:{exportValue:r=>r.businessName+' · '+r.code},

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
                    {paymentTermsLabel(row.original)}
                </span>
            ),
        },

        {
            accessorKey: "currentBalance",
            header: "Current Balance",
            meta: { align: "center" },
            cell: ({ row }) => <span className="money font-medium">{money(row.original.currentBalance)}</span>,
        },
        {
            accessorKey: "overdueBalance",
            header: "Overdue",
            meta: { align: "center" },
            cell: ({ row }) => <span className={row.original.overdueBalance > 0 ? "money text-[var(--color-danger)]" : "money text-[var(--color-text-secondary)]"}>{money(row.original.overdueBalance)}</span>,
        },
        {
            accessorKey: "lastPurchaseDate",
            header: "Last Purchase",
            meta: { align: "center" },
            cell: ({ row }) => activityDate(row.original.lastPurchaseDate),
        },
        {
            accessorKey: "lastPaymentDate",
            header: "Last Payment",
            meta: { align: "center" },
            cell: ({ row }) => activityDate(row.original.lastPaymentDate),
        },

        {
            accessorKey:
                "status",

            header: "Status",

            cell: ({ row }) => <SupplierStatusCell supplier={row.original}/>,
        },
    ];

function SupplierStatusCell({ supplier }: { supplier: Supplier }) {
    const canEdit = usePermission("contacts.write");
    if (!canEdit) return <SupplierStatusBadge status={supplier.status}/>;

    const color = supplier.status === "ACTIVE"
        ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
        : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]";

    return <span className="relative inline-flex">
        <select
            aria-label={`Status for ${supplier.businessName}`}
            value={supplier.status}
            className={`h-6 w-24 cursor-pointer appearance-none rounded-full border-0 pl-3 pr-7 text-xs font-medium ${color}`}
            onClick={event => event.stopPropagation()}
            onChange={event => {
                const status = event.target.value;
                if (status !== "ACTIVE" && status !== "INACTIVE") return;
                try {
                    const current = supplierRepository.getById(supplier.id);
                    if (!current) throw new Error("Supplier not found.");
                    supplierRepository.update(current.id, {
                        ...current,
                        currency:storedCurrencySchema.parse(current.currency),
                        status,
                        tradingName: current.tradingName ?? "",
                        abn: current.abn ?? "",
                        email: current.email ?? "",
                        phone: current.phone ?? "",
                        website: current.website ?? "",
                        contactName: current.contactName ?? "",
                        addressLine1: current.addressLine1 ?? "",
                        addressLine2: current.addressLine2 ?? "",
                        suburb: current.suburb ?? "",
                        state: current.state ?? "",
                        postcode: current.postcode ?? "",
                        notes: current.notes ?? "",
                    });
                    feedback.success("Supplier status updated.");
                } catch (error) {
                    feedback.error(error instanceof Error ? error.message : "Could not update supplier status.");
                }
            }}
        >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
        </select>
        <ChevronDown size={13} aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"/>
    </span>;
}

export function SuppliersPage() {
    const navigate =
        useNavigate();

    const [params,setParams]=useSearchParams();
    const selectedFilter=parseSupplierListFilter(params.get("filter"));
    const sample=params.get("sample")==="1";
    const changeFilter=(value:string)=>{const next=new URLSearchParams(params);if(value==="all")next.delete("filter");else next.set("filter",value);setParams(next);};
    const profiles = useSuppliers();
    const bills = useSupplierBills();
    const payments = useSupplierPayments();
    const credits = useSupplierCredits();
    const allocations = useSupplierCreditAllocations();
    const today = businessDateKey(new Date().toISOString());
    const suppliers = useMemo<SupplierRow[]>(() => profiles.map(supplier => {
        const payable = calculateSupplierAccountsPayable(supplier, bills, payments, credits, allocations, today);
        return {
            ...supplier, currency:storedCurrencySchema.parse(supplier.currency),
            currentBalance: payable.totalOutstanding,
            overdueBalance: payable.overdueAmount,
            lastPurchaseDate: bills
                .filter(bill => bill.supplierId === supplier.id && bill.status !== "VOID" && bill.billDate <= today)
                .reduce((latest, bill) => bill.billDate > latest ? bill.billDate : latest, ""),
            lastPaymentDate: payments
                .filter(payment => payment.supplierId === supplier.id && payment.status === "POSTED" && !payment.prepaymentApplicationId && payment.paymentDate <= today)
                .reduce((latest, payment) => payment.paymentDate > latest ? payment.paymentDate : latest, ""),
        };
    }), [profiles, bills, payments, credits, allocations, today]);

    const filteredSuppliers=filterSupplierRows(suppliers,selectedFilter);
    const sampleSuppliers=filterSupplierRows([
        {name:"Sample Melbourne Flooring",status:"ACTIVE",currentBalance:48375,overdueBalance:12000},
        {name:"Sample Oak Timber Supply",status:"ACTIVE",currentBalance:36200,overdueBalance:0},
        {name:"Sample Timber Export",status:"ACTIVE",currentBalance:24800,overdueBalance:8400},
    ],selectedFilter);
    const active =
        suppliers.filter(
            (supplier) =>
                supplier.status ===
                "ACTIVE",
        ).length;

    const currentBalance = suppliers.reduce((total, supplier) => total + supplier.currentBalance, 0);
    const overdueBalance = suppliers.reduce((total, supplier) => total + supplier.overdueBalance, 0);

    return (
        <div className="pb-8">
            <div className="mb-7 flex items-start justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Contacts
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
                        variant="accent"
                        onClick={() =>
                            navigate(
                                "/contacts/suppliers/new",
                                { state: { supplierCount: profiles.length } },
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

                <Summary label="Current Balance" value={money(currentBalance)}/>
                <Summary label="Overdue" value={money(overdueBalance)}/>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3">
                <label className="flex items-center gap-2 text-sm">Show
                    <select aria-label="Supplier list filter" value={selectedFilter} onChange={e=>changeFilter(e.target.value)} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2">
                        {supplierListFilters.map(filter=><option key={filter} value={filter}>{supplierFilterLabels[filter]}</option>)}
                    </select>
                </label>
                <span className="text-xs text-[var(--color-text-muted)]">{filteredSuppliers.length} recorded suppliers</span>
                {selectedFilter!=="all"&&<button className="text-xs underline" onClick={()=>changeFilter("all")}>Clear filter</button>}
                <Link className="ml-auto text-xs underline" to="/contacts/supplier-dashboard">Back to Suppliers overview →</Link>
            </div>
            <details open={sample} className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs">
                <summary className="cursor-pointer font-semibold text-amber-900">Sample · {supplierFilterLabels[selectedFilter]} · {sampleSuppliers.length} suppliers</summary>
                <p className="my-2 text-amber-900">Read-only preview using the same filter as the list below. Sample amounts are excluded from real balances and exports.</p>
                <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{["Supplier","Status","Current Balance","Overdue"].map(h=><th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{sampleSuppliers.map(row=><tr key={row.name} className="border-t border-amber-200"><td className="p-2">{row.name}</td><td className="p-2">Active</td><td className="p-2">{money(row.currentBalance)}</td><td className="p-2 text-red-700">{money(row.overdueBalance)}</td></tr>)}</tbody></table></div>
            </details>
            <DataTable
                capabilities={{id:"suppliers",scope:"complete",permission:"purchases.read",rowId:r=>r.id}}
                data={
                    filteredSuppliers
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