import type {
    Supplier,
} from "../types/supplier";

export const mockSuppliers: Supplier[] = [
    {
        id: "sup_001",

        code: "SUP-0001",

        businessName:
            "Melbourne Flooring Wholesale Pty Ltd",

        tradingName:
            "Melbourne Flooring Wholesale",

        abn: "51 234 567 890",

        status: "ACTIVE",

        email:
            "accounts@melbourneflooring.com.au",

        phone: "03 9000 2100",

        website:
            "https://melbourneflooring.com.au",

        contactName:
            "Michael Chen",

        addressLine1:
            "18 Trade Park Drive",

        suburb: "Dandenong South",

        state: "VIC",

        postcode: "3175",

        country: "Australia",

        paymentTermsDays: 30,

        currency: "AUD",

        taxRegistered: true,

        notes:
            "Primary flooring materials supplier.",

        createdAt:
            "2026-01-15T01:00:00.000Z",

        updatedAt:
            "2026-01-15T01:00:00.000Z",
    },

    {
        id: "sup_002",

        code: "SUP-0002",

        businessName:
            "Australian Timber Supply Pty Ltd",

        tradingName:
            "Australian Timber Supply",

        abn: "72 345 678 901",

        status: "ACTIVE",

        email:
            "sales@australiantimber.com.au",

        phone: "03 9000 3200",

        contactName:
            "Sarah Wilson",

        addressLine1:
            "42 Industrial Avenue",

        suburb: "Campbellfield",

        state: "VIC",

        postcode: "3061",

        country: "Australia",

        paymentTermsDays: 30,

        currency: "AUD",

        taxRegistered: true,

        createdAt:
            "2026-02-10T01:00:00.000Z",

        updatedAt:
            "2026-02-10T01:00:00.000Z",
    },

    {
        id: "sup_003",

        code: "SUP-0003",

        businessName:
            "Flooring Accessories Direct",

        status: "INACTIVE",

        email:
            "orders@flooringaccessories.com.au",

        country: "Australia",

        paymentTermsDays: 14,

        currency: "AUD",

        taxRegistered: true,

        createdAt:
            "2026-03-05T01:00:00.000Z",

        updatedAt:
            "2026-03-05T01:00:00.000Z",
    },
];