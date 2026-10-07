import { useState } from "react";

import {
    ArrowLeft,
    Building2,
    Mail,
    MapPin,
    Pencil,
    Phone,
    UserRound,
    X,
} from "lucide-react";

import {
    Navigate,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import { Button } from "../../../components/ui/Button";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import { CustomerStatusBadge } from "../components/CustomerStatusBadge";
import { CustomerLocationsTab } from "../components/CustomerLocationsTab";
import { CustomerContactsTab } from "../components/CustomerContactsTab";
import { CustomerPricingTab } from "../components/CustomerPricingTab";
import { CustomerSalesTab } from "../components/CustomerSalesTab";
import { LocationForm } from "../components/LocationForm";
import { ContactForm } from "../components/ContactForm";
import { CustomerPriceForm } from "../components/CustomerPriceForm";

import { customerRepository } from "../data/customerRepository";
import { useCustomer } from "../data/useCustomers";

import type {
    CustomerContact,
    CustomerLocation,
} from "../types/customer";

import type {
    ContactFormValues,
    LocationFormValues,
} from "../schemas/customerSchemas";

import type { CustomerPriceFormValues } from "../schemas/customerPricingSchemas";

import type { CustomerPrice } from "../types/customerPricing";

import { customerPricingRepository } from "../data/customerPricingRepository";

type CustomerTab =
    | "overview"
    | "locations"
    | "contacts"
    | "pricing"
    | "sales"
    | "activity";

type EditorState =
    | {
        type: "location";
        item?: CustomerLocation;
    }
    | {
        type: "contact";
        item?: CustomerContact;
    }
    | {
        type: "customerPrice";
        item?: CustomerPrice;
    }
    | null;

export function CustomerDetailPage() {
    const { customerId } = useParams();

    const navigate = useNavigate();
    const location = useLocation();

    const customer =
        useCustomer(customerId);

    const [editor, setEditor] =
        useState<EditorState>(null);

    if (!customer) {
        return (
            <Navigate
                to="/contacts"
                replace
            />
        );
    }

    const resolvedCustomerId = customer.id;

    const activeTab = getActiveTab(
        location.pathname,
    );

    const basePath =
        `/contacts/customers/${resolvedCustomerId}`;

    const primaryLocation =
        customer.locations.find(
            (item) =>
                item.id ===
                customer.primaryLocationId,
        );

    const primaryContact =
        customer.contacts.find(
            (item) =>
                item.id ===
                customer.primaryContactId,
        );

    function goToTab(tab: CustomerTab) {
        if (tab === "overview") {
            navigate(basePath);
            return;
        }

        navigate(
            `${basePath}/${getTabPath(tab)}`,
        );
    }

    function handleLocationSubmit(
        values: LocationFormValues,
    ) {
        if (
            editor?.type === "location" &&
            editor.item
        ) {
            customerRepository.updateLocation(
                resolvedCustomerId,
                editor.item.id,
                values,
            );
        } else {
            customerRepository.addLocation(
                resolvedCustomerId,
                values,
            );
        }

        setEditor(null);
    }

    function handleContactSubmit(
        values: ContactFormValues,
    ) {
        if (
            editor?.type === "contact" &&
            editor.item
        ) {
            customerRepository.updateContact(
                resolvedCustomerId,
                editor.item.id,
                values,
            );
        } else {
            customerRepository.addContact(
                resolvedCustomerId,
                values,
            );
        }

        setEditor(null);
    }

    async function handleCustomerPriceSubmit(
        values: CustomerPriceFormValues,
    ) {
        if (
            editor?.type ===
            "customerPrice" &&
            editor.item
        ) {
            customerPricingRepository.update(
                editor.item.id,
                values,
            );
        } else {
            customerPricingRepository.create(
                resolvedCustomerId,
                values,
            );
        }

        setEditor(null);
    }

    return (
        <>
            <div className="pb-8">
                <button
                    type="button"
                    onClick={() =>
                        navigate("/contacts")
                    }
                    className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
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
                                `${basePath}/edit`,
                            )
                        }
                    >
                        <Pencil size={15} />
                        Edit customer
                    </Button>
                </div>

                <div className="mb-6 flex gap-1 border-b border-[var(--color-border)]">
                    <Tab
                        active={
                            activeTab === "overview"
                        }
                        onClick={() =>
                            goToTab("overview")
                        }
                    >
                        Overview
                    </Tab>

                    <Tab
                        active={
                            activeTab === "locations"
                        }
                        onClick={() =>
                            goToTab("locations")
                        }
                    >
                        Locations
                        <Count>
                            {customer.locations.length}
                        </Count>
                    </Tab>

                    <Tab
                        active={
                            activeTab === "contacts"
                        }
                        onClick={() =>
                            goToTab("contacts")
                        }
                    >
                        Contacts
                        <Count>
                            {customer.contacts.length}
                        </Count>
                    </Tab>

                    <Tab
                        active={
                            activeTab === "pricing"
                        }
                        onClick={() =>
                            goToTab("pricing")
                        }
                    >
                        Pricing
                    </Tab>

                    <Tab
                        active={
                            activeTab === "sales"
                        }
                        onClick={() =>
                            goToTab("sales")
                        }
                    >
                        Sales
                    </Tab>

                    <Tab
                        active={
                            activeTab === "activity"
                        }
                        onClick={() =>
                            goToTab("activity")
                        }
                    >
                        Notes &amp; Activity
                    </Tab>
                </div>

                {activeTab === "overview" && (
                    <OverviewTab
                        customer={customer}
                        primaryContact={
                            primaryContact
                        }
                        primaryLocation={
                            primaryLocation
                        }
                        onViewContacts={() =>
                            goToTab("contacts")
                        }
                    />
                )}

                {activeTab === "locations" && (
                    <CustomerLocationsTab
                        customer={customer}
                        onAdd={() =>
                            setEditor({
                                type: "location",
                            })
                        }
                        onEdit={(item) =>
                            setEditor({
                                type: "location",
                                item,
                            })
                        }
                    />
                )}

                {activeTab === "contacts" && (
                    <CustomerContactsTab
                        customer={customer}
                        onAdd={() =>
                            setEditor({
                                type: "contact",
                            })
                        }
                        onEdit={(item) =>
                            setEditor({
                                type: "contact",
                                item,
                            })
                        }
                    />
                )}

                {activeTab === "pricing" && (
                    <CustomerPricingTab
                        customer={customer}
                        onAdd={() =>
                            setEditor({
                                type: "customerPrice",
                            })
                        }
                        onEdit={(item) =>
                            setEditor({
                                type: "customerPrice",
                                item,
                            })
                        }
                    />
                )}

                {activeTab === "sales" && (
                    <CustomerSalesTab
                        customer={customer}
                    />
                )}

                {activeTab === "activity" && (
                    <ComingSoon
                        title="Notes & Activity"
                        description="Customer notes and account activity will be added in Step 5C."
                    />
                )}
            </div>

            {editor?.type === "location" && (
                <EditorModal
                    title={
                        editor.item
                            ? "Edit Location"
                            : "Add Location"
                    }
                    description={
                        editor.item
                            ? `Update ${editor.item.name}.`
                            : `Add a new location for ${customer.businessName}.`
                    }
                    onClose={() =>
                        setEditor(null)
                    }
                >
                    <LocationForm
                        location={editor.item}
                        onSubmit={
                            handleLocationSubmit
                        }
                        onCancel={() =>
                            setEditor(null)
                        }
                    />
                </EditorModal>
            )}

            {editor?.type === "contact" && (
                <EditorModal
                    title={
                        editor.item
                            ? "Edit Contact"
                            : "Add Contact"
                    }
                    description={
                        editor.item
                            ? `Update ${editor.item.firstName} ${editor.item.lastName}.`
                            : `Add a new contact for ${customer.businessName}.`
                    }
                    onClose={() =>
                        setEditor(null)
                    }
                >
                    <ContactForm
                        contact={editor.item}
                        locations={
                            customer.locations
                        }
                        onSubmit={
                            handleContactSubmit
                        }
                        onCancel={() =>
                            setEditor(null)
                        }
                    />
                </EditorModal>
            )}

            {editor?.type ===
                "customerPrice" && (
                    <EditorModal
                        title={
                            editor.item
                                ? "Edit Customer Price"
                                : "Add Customer Price"
                        }
                        description={
                            editor.item
                                ? `Update the customer-specific pricing rule for ${customer.businessName}.`
                                : `Create a product and unit-specific price for ${customer.businessName}.`
                        }
                        onClose={() =>
                            setEditor(null)
                        }
                    >
                        <CustomerPriceForm
                            customerPrice={
                                editor.item
                            }
                            onSubmit={
                                handleCustomerPriceSubmit
                            }
                            onCancel={() =>
                                setEditor(null)
                            }
                        />
                    </EditorModal>
                )}
        </>
    );
}

function OverviewTab({
    customer,
    primaryContact,
    primaryLocation,
    onViewContacts,
}: {
    customer: NonNullable<
        ReturnType<typeof useCustomer>
    >;
    primaryContact:
    | CustomerContact
    | undefined;
    primaryLocation:
    | CustomerLocation
    | undefined;
    onViewContacts: () => void;
}) {
    return (
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
                                value={
                                    customer.businessName
                                }
                            />

                            <Detail
                                label="Trading name"
                                value={
                                    customer.tradingName ??
                                    "—"
                                }
                            />

                            <Detail
                                label="ABN"
                                value={
                                    customer.abn ?? "—"
                                }
                            />

                            <Detail
                                label="Business type"
                                value={
                                    customer.businessType
                                }
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
                                onClick={onViewContacts}
                            >
                                View contacts
                            </Button>
                        </div>

                        {primaryContact ? (
                            <div className="mt-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                                        <UserRound
                                            size={17}
                                        />
                                    </div>

                                    <div>
                                        <div className="font-medium">
                                            {
                                                primaryContact.firstName
                                            }{" "}
                                            {
                                                primaryContact.lastName
                                            }
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
                                        value={
                                            primaryContact.email
                                        }
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
                                    customer.overdueBalance >
                                    0
                                }
                            />

                            <AccountValue
                                label="Credit available"
                                value={`$${Math.max(
                                    customer.creditLimit -
                                    customer.currentBalance,
                                    0,
                                ).toLocaleString(
                                    "en-AU",
                                )}`}
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
                                    {
                                        primaryLocation.addressLine1
                                    }

                                    {primaryLocation.addressLine2 && (
                                        <>
                                            <br />
                                            {
                                                primaryLocation.addressLine2
                                            }
                                        </>
                                    )}

                                    <br />

                                    {primaryLocation.suburb},{" "}
                                    {primaryLocation.state}{" "}
                                    {
                                        primaryLocation.postcode
                                    }

                                    <br />

                                    {
                                        primaryLocation.country
                                    }
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
                                value={
                                    customer.email ?? "—"
                                }
                            />

                            <ContactDetail
                                icon={Phone}
                                label="Business phone"
                                value={
                                    customer.phone ?? "—"
                                }
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function EditorModal({
    title,
    description,
    children,
    onClose,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-8"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="max-h-[calc(100vh-64px)] w-full max-w-[720px] overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[var(--color-border)] bg-white px-6 py-5">
                    <div>
                        <h2 className="font-display text-2xl">
                            {title}
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {description}
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={17} />
                    </Button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Tab({
    children,
    active = false,
    onClick,
}: {
    children: React.ReactNode;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                active
                    ? "flex h-10 items-center gap-2 border-b-2 border-[var(--color-accent)] px-3 text-xs font-medium text-[var(--color-primary)]"
                    : "flex h-10 items-center gap-2 border-b-2 border-transparent px-3 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
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

            <div className="min-w-0">
                <div className="text-[10px] text-[var(--color-text-muted)]">
                    {label}
                </div>

                <div className="mt-0.5 break-words text-xs">
                    {value}
                </div>
            </div>
        </div>
    );
}

function ComingSoon({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-white px-6 py-14 text-center">
            <h2 className="font-display text-xl">
                {title}
            </h2>

            <p className="mx-auto mt-2 max-w-[440px] text-xs leading-5 text-[var(--color-text-muted)]">
                {description}
            </p>
        </div>
    );
}

function getActiveTab(
    pathname: string,
): CustomerTab {
    if (pathname.endsWith("/locations")) {
        return "locations";
    }

    if (pathname.endsWith("/contacts")) {
        return "contacts";
    }

    if (pathname.endsWith("/pricing")) {
        return "pricing";
    }

    if (pathname.endsWith("/sales")) {
        return "sales";
    }

    if (pathname.endsWith("/activity")) {
        return "activity";
    }

    return "overview";
}

function getTabPath(
    tab: Exclude<CustomerTab, "overview">,
) {
    return tab;
}