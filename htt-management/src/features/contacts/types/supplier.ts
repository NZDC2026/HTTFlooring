export type SupplierStatus =
    | "ACTIVE"
    | "INACTIVE";

export interface Supplier {
    id: string;

    code: string;

    businessName: string;
    tradingName?: string;

    abn?: string;

    status: SupplierStatus;

    email?: string;
    phone?: string;
    website?: string;

    contactName?: string;

    addressLine1?: string;
    addressLine2?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    country: string;

    paymentTermsDays: number;

    currency: "AUD";

    taxRegistered: boolean;

    notes?: string;

    createdAt: string;
    updatedAt: string;
}