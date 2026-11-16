import type { PaymentTermsType } from "../../payment-terms/paymentTerms";
export type SupplierStatus =
    | "ACTIVE"
    | "INACTIVE";

export interface Supplier {
    setup?: import('../supplier-create/supplierSetup').SupplierSetup;
    bankDetails?: import('../supplier-create/supplierSetup').SupplierBank;
    bankHistory?: import('zod').z.infer<typeof import('../supplier-create/supplierSetup').supplierBankHistory>[];
    creationRequest?: import('zod').z.infer<typeof import('../supplier-create/supplierSetup').supplierCreationReceipt>;
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