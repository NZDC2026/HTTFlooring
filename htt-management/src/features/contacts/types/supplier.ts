import type { PaymentTermsType } from "../../payment-terms/paymentTerms";
export type SupplierStatus =
    | "ACTIVE"
    | "INACTIVE";

export interface Supplier {
    shipments?: import("../../incoming-shipments/shipmentModel").Shipment[];
    contacts?: import("./customer").CustomerContact[];
    activities?: import("../data/supplierActivities").SupplierActivity[];
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
    paymentTermsType?: PaymentTermsType;

    currency: string;

    taxRegistered: boolean;

    notes?: string;

    createdAt: string;
    updatedAt: string;
}