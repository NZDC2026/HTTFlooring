import {
    ArrowLeft,
    Building2,
    Mail,
    MapPin,
    Pencil,
    Phone,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Button,
} from "../../../components/ui/Button";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import {
    SupplierStatusBadge,
} from "../components/SupplierStatusBadge";

import {
    useSupplier,
} from "../data/useSuppliers";

export function SupplierDetailPage() {
    const navigate =
        useNavigate();

    const {
        supplierId,
    } = useParams();

    const supplier =
        useSupplier(
            supplierId,
        );

    if (!supplier) {
        return (
            <Navigate
                to="/contacts/suppliers"
                replace
            />
        );
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/contacts/suppliers",
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />
                Back to suppliers
            </button>

            <div className="mb-7 flex items-start justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {
                                supplier.code
                            }
                        </span>

                        <SupplierStatusBadge
                            status={
                                supplier.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-[34px] leading-tight">
                        {
                            supplier.businessName
                        }
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {supplier.tradingName ??
                            "Supplier account"}
                    </p>
                </div>

                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            `/contacts/suppliers/${supplier.id}/edit`,
                        )
                    }
                >
                    <Pencil
                        size={
                            15
                        }
                    />
                    Edit supplier
                </Button>
            </div>

            <div className="mb-6 flex gap-1 border-b border-[var(--color-border)]">
                <Tab active>
                    Overview
                </Tab>

                <Tab>
                    Purchases
                </Tab>

                <Tab>
                    Bills
                </Tab>

                <Tab>
                    Payments
                </Tab>

                <Tab>
                    Account
                </Tab>
            </div>

            <div className="grid grid-cols-[1.4fr_1fr] gap-5">
                <Card>
                    <CardContent>
                        <SectionTitle>
                            Supplier Details
                        </SectionTitle>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                            <Detail
                                label="Business Name"
                                value={
                                    supplier.businessName
                                }
                            />

                            <Detail
                                label="Trading Name"
                                value={
                                    supplier.tradingName
                                }
                            />

                            <Detail
                                label="ABN"
                                value={
                                    supplier.abn
                                }
                            />

                            <Detail
                                label="Currency"
                                value={
                                    supplier.currency
                                }
                            />

                            <Detail
                                label="Payment Terms"
                                value={`${supplier.paymentTermsDays} days`}
                            />

                            <Detail
                                label="GST Registered"
                                value={
                                    supplier.taxRegistered
                                        ? "Yes"
                                        : "No"
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <SectionTitle>
                            Contact
                        </SectionTitle>

                        <div className="space-y-4">
                            <ContactRow
                                icon={
                                    Building2
                                }
                                value={
                                    supplier.contactName
                                }
                            />

                            <ContactRow
                                icon={
                                    Mail
                                }
                                value={
                                    supplier.email
                                }
                            />

                            <ContactRow
                                icon={
                                    Phone
                                }
                                value={
                                    supplier.phone
                                }
                            />

                            <ContactRow
                                icon={
                                    MapPin
                                }
                                value={
                                    formatAddress(
                                        supplier,
                                    )
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <SectionTitle>
                            Notes
                        </SectionTitle>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                            {supplier.notes ??
                                "No notes have been added."}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <SectionTitle>
                            Accounts Payable
                        </SectionTitle>

                        <div className="rounded-lg bg-[var(--color-bg)] p-4">
                            <div className="text-xs font-medium text-[var(--color-text-secondary)]">
                                AP account
                            </div>

                            <div className="mt-1 text-sm font-semibold text-[var(--color-primary)]">
                                No supplier
                                bills yet
                            </div>

                            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                                Supplier
                                bills,
                                payments
                                and account
                                balances
                                will appear
                                here once
                                Accounts
                                Payable is
                                enabled.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Tab({
    children,
    active = false,
}: {
    children:
    React.ReactNode;
    active?: boolean;
}) {
    return (
        <button
            type="button"
            disabled={
                !active
            }
            className={[
                "relative px-4 py-3 text-xs font-medium",

                active
                    ? "text-[var(--color-primary)]"
                    : "cursor-default text-[var(--color-text-muted)]",
            ].join(" ")}
        >
            {children}

            {active && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--color-accent)]" />
            )}
        </button>
    );
}

function SectionTitle({
    children,
}: {
    children:
    React.ReactNode;
}) {
    return (
        <h2 className="mb-5 font-display text-xl">
            {children}
        </h2>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value?:
    | string
    | number;
}) {
    return (
        <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="mt-1.5 text-sm">
                {value ??
                    "—"}
            </div>
        </div>
    );
}

function ContactRow({
    icon: Icon,
    value,
}: {
    icon: React.ComponentType<{
        size?: number;
    }>;
    value?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon
                size={15}
            />

            <span className="text-sm text-[var(--color-text-secondary)]">
                {value ??
                    "—"}
            </span>
        </div>
    );
}

function formatAddress(
    supplier: {
        addressLine1?: string;
        addressLine2?: string;
        suburb?: string;
        state?: string;
        postcode?: string;
        country: string;
    },
) {
    const parts = [
        supplier.addressLine1,
        supplier.addressLine2,
        supplier.suburb,
        supplier.state,
        supplier.postcode,
        supplier.country,
    ].filter(Boolean);

    return parts.length > 0
        ? parts.join(", ")
        : undefined;
}