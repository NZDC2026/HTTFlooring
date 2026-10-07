import type {
    InventorySite,
} from "../types/inventorySite";

export const mockInventorySites: InventorySite[] =
    [
        {
            id: "site_001",

            code: "MEL-WH",

            name: "Melbourne Warehouse",

            status: "ACTIVE",

            addressLine1:
                "18 Industrial Drive",

            suburb:
                "Dandenong South",

            state: "VIC",

            postcode:
                "3175",

            country:
                "Australia",

            createdAt:
                "2026-09-01T00:00:00.000Z",

            updatedAt:
                "2026-09-01T00:00:00.000Z",
        },

        {
            id: "site_002",

            code: "RICH-SH",

            name: "Richmond Showroom",

            status: "ACTIVE",

            addressLine1:
                "82 Bridge Road",

            suburb:
                "Richmond",

            state: "VIC",

            postcode:
                "3121",

            country:
                "Australia",

            createdAt:
                "2026-09-01T00:00:00.000Z",

            updatedAt:
                "2026-09-01T00:00:00.000Z",
        },
    ];