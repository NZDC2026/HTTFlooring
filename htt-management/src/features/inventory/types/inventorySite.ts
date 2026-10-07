export type InventorySiteStatus =
    | "ACTIVE"
    | "INACTIVE";

export interface InventorySite {
    id: string;
    code: string;
    name: string;

    status: InventorySiteStatus;

    addressLine1?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    country: string;

    createdAt: string;
    updatedAt: string;
}