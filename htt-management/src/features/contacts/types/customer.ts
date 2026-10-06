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

export interface Customer {
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

    locations: CustomerLocation[];
    contacts: CustomerContact[];

    createdAt: string;
    updatedAt: string;
}