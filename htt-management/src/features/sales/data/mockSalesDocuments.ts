import type {
    Invoice,
    Quote,
    SalesOrder,
} from "../types/salesDocument";

export const mockQuotes: Quote[] = [
    {
        id: "quote_001",

        type: "QUOTE",

        documentNumber:
            "QU-2026-0001",

        customerId:
            "cus_001",

        documentDate:
            "2026-09-18",

        expiryDate:
            "2026-10-18",

        status: "CONVERTED",

        convertedSalesOrderId:
            "order_001",

        customerReference:
            "Richmond showroom",

        notes:
            "Supply European Oak flooring.",

        lines: [
            {
                id: "line_quote_001_01",

                productId:
                    "prod_001",

                unitId:
                    "unit_001_m2",

                sku:
                    "TIM-OAK-190-NAT",

                description:
                    "European Oak 190mm Natural",

                unitSymbol: "m²",

                quantity: 85,

                standardUnitPrice:
                    68.5,

                unitPrice:
                    62.5,

                priceSource:
                    "CUSTOMER_PRICE",

                customerPriceId:
                    "cprice_001",

                discountAmount: 6,
                discountPercent: 8.76,

                lineSubtotal:
                    5312.5,

                taxAmount:
                    531.25,

                lineTotal:
                    5843.75,
            },
        ],

        totals: {
            subtotal: 5312.5,
            taxAmount: 531.25,
            total: 5843.75,
        },

        createdAt:
            "2026-09-18T01:00:00.000Z",

        updatedAt:
            "2026-09-18T01:00:00.000Z",
    },
];

export const mockSalesOrders: SalesOrder[] =
    [
        {
            id: "order_001",

            type: "SALES_ORDER",

            documentNumber:
                "SO-2026-0001",

            customerId:
                "cus_001",

            documentDate:
                "2026-09-20",

            requestedDeliveryDate:
                "2026-10-02",

            status: "INVOICED",

            sourceQuoteId:
                "quote_001",

            invoiceIds: [
                "invoice_001",
            ],

            customerReference:
                "Richmond showroom",

            notes:
                "Deliver to Richmond location.",

            lines: [
                {
                    id: "line_order_001_01",

                    productId:
                        "prod_001",

                    unitId:
                        "unit_001_m2",

                    sku:
                        "TIM-OAK-190-NAT",

                    description:
                        "European Oak 190mm Natural",

                    unitSymbol:
                        "m²",

                    quantity: 85,

                    standardUnitPrice:
                        68.5,

                    unitPrice:
                        62.5,

                    priceSource:
                        "CUSTOMER_PRICE",

                    customerPriceId:
                        "cprice_001",

                    discountAmount:
                        6,

                    discountPercent:
                        8.76,

                    lineSubtotal:
                        5312.5,

                    taxAmount:
                        531.25,

                    lineTotal:
                        5843.75,
                },
            ],

            totals: {
                subtotal:
                    5312.5,

                taxAmount:
                    531.25,

                total:
                    5843.75,
            },

            createdAt:
                "2026-09-20T01:00:00.000Z",

            updatedAt:
                "2026-09-20T01:00:00.000Z",
        },
    ];

export const mockInvoices: Invoice[] =
    [
        {
            id: "invoice_001",

            type: "INVOICE",

            documentNumber:
                "INV-2026-0001",

            customerId:
                "cus_001",

            documentDate:
                "2026-10-02",

            dueDate:
                "2026-11-01",

            status:
                "PARTIALLY_PAID",

            sourceSalesOrderId:
                "order_001",

            customerReference:
                "Richmond showroom",

            notes:
                "Flooring supplied and delivered.",

            lines: [
                {
                    id: "line_invoice_001_01",

                    productId:
                        "prod_001",

                    unitId:
                        "unit_001_m2",

                    sku:
                        "TIM-OAK-190-NAT",

                    description:
                        "European Oak 190mm Natural",

                    unitSymbol:
                        "m²",

                    quantity: 85,

                    standardUnitPrice:
                        68.5,

                    unitPrice:
                        62.5,

                    priceSource:
                        "CUSTOMER_PRICE",

                    customerPriceId:
                        "cprice_001",

                    discountAmount:
                        6,

                    discountPercent:
                        8.76,

                    lineSubtotal:
                        5312.5,

                    taxAmount:
                        531.25,

                    lineTotal:
                        5843.75,
                },
            ],

            totals: {
                subtotal:
                    5312.5,

                taxAmount:
                    531.25,

                total:
                    5843.75,
            },

            amountPaid:
                3000,

            amountDue:
                2843.75,

            createdAt:
                "2026-10-02T01:00:00.000Z",

            updatedAt:
                "2026-10-05T01:00:00.000Z",
        },
    ];