import type { Customer } from "../types/customer";

export const mockCustomers: Customer[] = [
    {
        id: "cus_001",

        code: "CUST-0001",

        businessName: "ABC Flooring Pty Ltd",
        tradingName: "ABC Flooring",

        abn: "12 345 678 901",

        businessType: "Flooring Retailer",

        status: "ACTIVE",

        email: "accounts@abcflooring.com.au",
        phone: "03 9123 4567",
        website: "www.abcflooring.com.au",

        primaryLocationId: "loc_001",
        primaryContactId: "con_001",

        creditLimit: 50000,
        currentBalance: 18420,
        overdueBalance: 0,

        paymentTermsDays: 30,

        locations: [
            {
                id: "loc_001",
                name: "Melbourne",
                addressLine1: "128 Trade Street",
                suburb: "Melbourne",
                state: "VIC",
                postcode: "3000",
                country: "Australia",
                phone: "03 9123 4567",
                isPrimary: true,
            },

            {
                id: "loc_002",
                name: "Richmond",
                addressLine1: "42 Bridge Road",
                suburb: "Richmond",
                state: "VIC",
                postcode: "3121",
                country: "Australia",
                isPrimary: false,
            },
        ],

        contacts: [
            {
                id: "con_001",
                firstName: "John",
                lastName: "Smith",
                jobTitle: "Director",
                email: "john@abcflooring.com.au",
                mobile: "0412 345 678",
                locationId: "loc_001",
                isPrimary: true,
            },

            {
                id: "con_002",
                firstName: "Sarah",
                lastName: "Lee",
                jobTitle: "Accounts Manager",
                email: "sarah@abcflooring.com.au",
                mobile: "0418 234 567",
                locationId: "loc_001",
                isPrimary: false,
            },

            {
                id: "con_003",
                firstName: "Michael",
                lastName: "Chen",
                jobTitle: "Store Manager",
                email: "michael@abcflooring.com.au",
                mobile: "0402 111 222",
                locationId: "loc_002",
                isPrimary: false,
            },
        ],

        createdAt: "2026-02-10T10:00:00",
        updatedAt: "2026-10-04T14:30:00",
    },

    {
        id: "cus_002",
        code: "CUST-0002",

        businessName: "Oak Living Pty Ltd",

        abn: "23 456 789 012",

        businessType: "Builder",

        status: "ACTIVE",

        email: "accounts@oakliving.com.au",
        phone: "03 9345 2211",

        primaryLocationId: "loc_003",
        primaryContactId: "con_004",

        creditLimit: 75000,
        currentBalance: 28400,
        overdueBalance: 4200,

        paymentTermsDays: 30,

        locations: [
            {
                id: "loc_003",
                name: "Head Office",
                addressLine1: "84 Construction Avenue",
                suburb: "South Melbourne",
                state: "VIC",
                postcode: "3205",
                country: "Australia",
                isPrimary: true,
            },
        ],

        contacts: [
            {
                id: "con_004",
                firstName: "Emma",
                lastName: "Brown",
                jobTitle: "Accounts Manager",
                email: "emma@oakliving.com.au",
                mobile: "0411 882 920",
                locationId: "loc_003",
                isPrimary: true,
            },
        ],

        createdAt: "2026-03-02T09:00:00",
        updatedAt: "2026-10-03T12:00:00",
    },

    {
        id: "cus_003",
        code: "CUST-0003",

        businessName: "Floor Plus",

        businessType: "Flooring Retailer",

        status: "ACTIVE",

        email: "sales@floorplus.com.au",
        phone: "03 9002 8812",

        primaryLocationId: "loc_004",
        primaryContactId: "con_005",

        creditLimit: 30000,
        currentBalance: 6120,
        overdueBalance: 0,

        paymentTermsDays: 14,

        locations: [
            {
                id: "loc_004",
                name: "Geelong",
                addressLine1: "18 Moorabool Street",
                suburb: "Geelong",
                state: "VIC",
                postcode: "3220",
                country: "Australia",
                isPrimary: true,
            },
        ],

        contacts: [
            {
                id: "con_005",
                firstName: "Daniel",
                lastName: "Wilson",
                email: "daniel@floorplus.com.au",
                mobile: "0433 120 450",
                locationId: "loc_004",
                isPrimary: true,
            },
        ],

        createdAt: "2026-04-11T09:30:00",
        updatedAt: "2026-10-01T16:00:00",
    },

    {
        id: "cus_004",
        code: "CUST-0004",

        businessName: "Urban Floors",

        businessType: "Designer",

        status: "ON_HOLD",

        email: "hello@urbanfloors.com.au",

        primaryLocationId: "loc_005",
        primaryContactId: "con_006",

        creditLimit: 15000,
        currentBalance: 6520,
        overdueBalance: 6520,

        paymentTermsDays: 14,

        locations: [
            {
                id: "loc_005",
                name: "Studio",
                addressLine1: "52 Smith Street",
                suburb: "Collingwood",
                state: "VIC",
                postcode: "3066",
                country: "Australia",
                isPrimary: true,
            },
        ],

        contacts: [
            {
                id: "con_006",
                firstName: "Olivia",
                lastName: "Martin",
                jobTitle: "Principal Designer",
                email: "olivia@urbanfloors.com.au",
                mobile: "0414 909 828",
                locationId: "loc_005",
                isPrimary: true,
            },
        ],

        createdAt: "2026-05-18T11:00:00",
        updatedAt: "2026-09-29T13:00:00",
    },

    {
        id: "cus_005",
        code: "CUST-0005",

        businessName: "Melbourne Interiors",

        businessType: "Designer",

        status: "ACTIVE",

        email: "accounts@melbourneinteriors.com.au",

        primaryLocationId: "loc_006",
        primaryContactId: "con_007",

        creditLimit: 40000,
        currentBalance: 9340,
        overdueBalance: 0,

        paymentTermsDays: 30,

        locations: [
            {
                id: "loc_006",
                name: "Melbourne",
                addressLine1: "21 Design Lane",
                suburb: "Prahran",
                state: "VIC",
                postcode: "3181",
                country: "Australia",
                isPrimary: true,
            },
        ],

        contacts: [
            {
                id: "con_007",
                firstName: "James",
                lastName: "Taylor",
                email: "james@melbourneinteriors.com.au",
                locationId: "loc_006",
                isPrimary: true,
            },
        ],

        createdAt: "2026-06-12T08:30:00",
        updatedAt: "2026-10-05T10:00:00",
    },
];

export function getCustomerById(
    customerId: string,
): Customer | undefined {
    return mockCustomers.find(
        (customer) => customer.id === customerId,
    );
}