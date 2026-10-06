import {
    ArrowLeft,
    Building2,
    Mail,
    MapPin,
    Pencil,
    Phone,
    UserRound,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import { Button } from "../../../components/ui/Button";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import { CustomerStatusBadge } from "../components/CustomerStatusBadge";

import { useCustomer } from "../data/useCustomers";

export function CustomerDetailPage() {
    const { customerId } = useParams();

    const navigate = useNavigate();

    const customer =
        useCustomer(customerId);

    if (!customer) {
        return (
            <Navigate
                to="/contacts"
                replace
            />
        );
    }

    const primaryLocation =
        customer.locations.find(
            (location) =>
                location.id ===
                customer.primaryLocationId,
        );

    const primaryContact =
        customer.contacts.find(
            (contact) =>
                contact.id ===
                customer.primaryContactId,
        );

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() => navigate("/contacts")}
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
                <ArrowLeft size={14} />
                Back to customers
            </button>

            <div className="mb-7 flex items-start justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {customer.code}
                        </span>

                        <CustomerStatusBadge
                            status={customer.status}
                        />
                    </div>

                    <h1 className="font-display text-[34px] leading-tight">
                        {customer.businessName}
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {customer.businessType}
                    </p>
                </div>

                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            `/contacts/customers/${customer.id}/edit`,
                        )
                    }
                >
                    <Pencil size={15} />
                    Edit customer
                </Button>
            </div>

            <div className="mb-5 flex gap-1 border-b border-[var(--color-border)]">
                <Tab active>
                    Overview
                </Tab>

                <Tab>
                    Locations
                    <Count>
                        {customer.locations.length}
                    </Count>
                </Tab>

                <Tab>
                    Contacts
                    <Count>
                        {customer.contacts.length}
                    </Count>
                </Tab>

                <Tab>Pricing</Tab>
                <Tab>Sales</Tab>
                <Tab>Notes &amp; Activity</Tab>
            </div>

            <div className="grid grid-cols-[2fr_1fr] gap-4">
                <div className="space-y-4">
                    <Card>
                        <CardContent>
                            <h2 className="font-display text-xl">
                                Business Details
                            </h2>

                            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
                                <Detail
                                    label="Business name"
                                    value={customer.businessName}
                                />

                                <Detail
                                    label="Trading name"
                                    value={
                                        customer.tradingName ?? "—"
                                    }
                                />

                                <Detail
                                    label="ABN"
                                    value={customer.abn ?? "—"}
                                />

                                <Detail
                                    label="Business type"
                                    value={customer.businessType}
                                />

                                <Detail
                                    label="Payment terms"
                                    value={`${customer.paymentTermsDays} days`}
                                />

                                <Detail
                                    label="Credit limit"
                                    value={`$${customer.creditLimit.toLocaleString(
                                        "en-AU",
                                    )}`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-xl">
                                    Primary Contact
                                </h2>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                >
                                    View contacts
                                </Button>
                            </div>

                            {primaryContact ? (
                                <div className="mt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                                            <UserRound size={17} />
                                        </div>

                                        <div>
                                            <div className="font-medium">
                                                {primaryContact.firstName}{" "}
                                                {primaryContact.lastName}
                                            </div>

                                            <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                                {primaryContact.jobTitle ??
                                                    "Contact"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-4">
                                        <ContactDetail
                                            icon={Mail}
                                            label="Email"
                                            value={primaryContact.email}
                                        />

                                        <ContactDetail
                                            icon={Phone}
                                            label="Mobile"
                                            value={
                                                primaryContact.mobile ??
                                                primaryContact.phone ??
                                                "—"
                                            }
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-5 text-sm text-[var(--color-text-muted)]">
                                    No primary contact assigned.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardContent>
                            <h2 className="font-display text-xl">
                                Account
                            </h2>

                            <div className="mt-6">
                                <div className="text-xs text-[var(--color-text-muted)]">
                                    Current balance
                                </div>

                                <div className="money mt-1 text-3xl font-semibold">
                                    $
                                    {customer.currentBalance.toLocaleString(
                                        "en-AU",
                                        {
                                            minimumFractionDigits: 2,
                                        },
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <AccountValue
                                    label="Overdue"
                                    value={`$${customer.overdueBalance.toLocaleString(
                                        "en-AU",
                                    )}`}
                                    danger={
                                        customer.overdueBalance > 0
                                    }
                                />

                                <AccountValue
                                    label="Credit available"
                                    value={`$${Math.max(
                                        customer.creditLimit -
                                        customer.currentBalance,
                                        0,
                                    ).toLocaleString("en-AU")}`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <MapPin
                                    size={17}
                                    className="text-[var(--color-accent)]"
                                />

                                <h2 className="font-display text-xl">
                                    Primary Location
                                </h2>
                            </div>

                            {primaryLocation ? (
                                <div className="mt-5">
                                    <div className="font-medium">
                                        {primaryLocation.name}
                                    </div>

                                    <div className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                        {primaryLocation.addressLine1}

                                        <br />

                                        {primaryLocation.suburb},{" "}
                                        {primaryLocation.state}{" "}
                                        {primaryLocation.postcode}

                                        <br />

                                        {primaryLocation.country}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-5 text-sm text-[var(--color-text-muted)]">
                                    No primary location assigned.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Building2
                                    size={17}
                                    className="text-[var(--color-primary)]"
                                />

                                <h2 className="font-display text-xl">
                                    Contact Details
                                </h2>
                            </div>

                            <div className="mt-5 space-y-4">
                                <ContactDetail
                                    icon={Mail}
                                    label="Business email"
                                    value={customer.email ?? "—"}
                                />

                                <ContactDetail
                                    icon={Phone}
                                    label="Business phone"
                                    value={customer.phone ?? "—"}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Tab({
    children,
    active = false,
}: {
    children: React.ReactNode;
    active?: boolean;
}) {
    return (
        <button
            type="button"
            className={
                active
                    ? "flex h-10 items-center gap-2 border-b-2 border-[var(--color-accent)] px-3 text-xs font-medium text-[var(--color-primary)]"
                    : "flex h-10 items-center gap-2 border-b-2 border-transparent px-3 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }
        >
            {children}
        </button>
    );
}

function Count({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <span className="rounded-full bg-[var(--color-surface-muted)] px-1.5 py-0.5 text-[10px]">
            {children}
        </span>
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
            <div className="text-[11px] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div className="mt-1 text-sm font-medium">
                {value}
            </div>
        </div>
    );
}

function AccountValue({
    label,
    value,
    danger = false,
}: {
    label: string;
    value: string;
    danger?: boolean;
}) {
    return (
        <div className="rounded-lg bg-[var(--color-background-subtle)] p-3">
            <div className="text-[10px] text-[var(--color-text-muted)]">
                {label}
            </div>

            <div
                className={
                    danger
                        ? "money mt-1 text-sm font-semibold text-[var(--color-danger)]"
                        : "money mt-1 text-sm font-semibold"
                }
            >
                {value}
            </div>
        </div>
    );
}

function ContactDetail({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-2">
            <Icon
                size={14}
                className="mt-0.5 text-[var(--color-text-muted)]"
            />

            <div>
                <div className="text-[10px] text-[var(--color-text-muted)]">
                    {label}
                </div>

                <div className="mt-0.5 text-xs">
                    {value}
                </div>
            </div>
        </div>
    );
}