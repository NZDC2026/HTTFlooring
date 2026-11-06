import type { PaymentTermsType } from "../../payment-terms/paymentTerms";
export type CustomerStatus =
    | "ACTIVE"
    | "ON_HOLD"
    | "INACTIVE";

export type BusinessType =
    | "Flooring Retailer"
    | "Builder"
    | "Developer"
    | "Designer"
    | "Architect"
    | "Installer"
    | "Other";

export interface CustomerLocation {
    id: string;

    name: string;

    addressLine1: string;
    addressLine2?: string;

    suburb: string;
    state: string;
    postcode: string;
    country: string;

    phone?: string;

    isPrimary: boolean;
}

export interface CustomerContact {
    isAccounting?: boolean;
    id: string;

    firstName: string;
    lastName: string;

    jobTitle?: string;

    email: string;
    phone?: string;
    mobile?: string;

    locationId?: string;

    isPrimary: boolean;
}

export interface CustomerNote {
    customerId: string;
    id: string;
    operationId: string;
    text: string;
    source: 'Desktop' | 'Sales import';
    externalId?: string;
    actorId: string;
    actorName?: string;
    threadId?: string;
    action?: "reply" | "resolve";
    createdAt: string;
}
export interface Customer {
    creditHold?: boolean;
    internalNotes?: string;
    billingAddress?: import("../data/customerAddresses").CustomerAddress;
    notes?: CustomerNote[];
    id: string;

    code: string;

    businessName: string;
    tradingName?: string;

    abn?: string;

    businessType: BusinessType;

    status: CustomerStatus;

    email?: string;
    phone?: string;
    website?: string;

    primaryLocationId?: string;
    primaryContactId?: string;

    creditLimit: number;
    currentBalance: number;
    overdueBalance: number;

    paymentTermsDays: number;
    paymentTermsType?: PaymentTermsType;

    locations: CustomerLocation[];
    contacts: CustomerContact[];

    createdAt: string;
    updatedAt: string;
}