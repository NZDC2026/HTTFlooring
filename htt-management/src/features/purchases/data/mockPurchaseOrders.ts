import type {
    PurchaseOrder,
} from "../types/purchaseOrder";

export const mockPurchaseOrders: PurchaseOrder[] =
    [
        {
            id: "po_001",

            purchaseOrderNumber:
                "PO-2026-0001",

            supplierId:
                "sup_001",

            supplierCode:
                "SUP-0001",

            supplierName:
                "Melbourne Flooring Wholesale Pty Ltd",

            orderDate:
                "2026-10-01",

            expectedDeliveryDate:
                "2026-10-10",

            status: "SENT",

            supplierReference:
                "OCT-STOCK-01",

            notes:
                "October timber stock replenishment.",

            lines: [
                {
                    id: "pol_001",

                    productId:
                        "prod_001",

                    unitId:
                        "unit_001_box",

                    sku:
                        "TIM-OAK-190-NAT",

                    description:
                        "European Oak 190mm Natural",

                    unitSymbol:
                        "box",

                    orderedQuantity:
                        20,

                    receivedQuantity:
                        0,

                    billedQuantity: 0,

                    unitCost:
                        105,

                    lineSubtotal:
                        2100,

                    taxAmount:
                        210,

                    lineTotal:
                        2310,
                },
                {
                    id: "pol_002",

                    productId:
                        "prod_003",

                    unitId:
                        "unit_003_box",

                    sku:
                        "LAM-12MM-NOR-OAK",

                    description:
                        "12mm Nordic Oak Laminate",

                    unitSymbol:
                        "box",

                    orderedQuantity:
                        30,

                    receivedQuantity:
                        0,

                    billedQuantity: 0,

                    unitCost:
                        42,

                    lineSubtotal:
                        1260,

                    taxAmount:
                        126,

                    lineTotal:
                        1386,
                },
            ],

            totals: {
                subtotal: 3360,
                taxAmount: 336,
                total: 3696,
            },

            approvedAt:
                "2026-10-01T02:30:00.000Z",

            sentAt:
                "2026-10-01T03:00:00.000Z",

            createdAt:
                "2026-10-01T02:00:00.000Z",

            updatedAt:
                "2026-10-01T03:00:00.000Z",
        },

        {
            id: "po_002",

            purchaseOrderNumber:
                "PO-2026-0002",

            supplierId:
                "sup_002",

            supplierCode:
                "SUP-0002",

            supplierName:
                "Australian Timber Supply Pty Ltd",

            orderDate:
                "2026-10-06",

            expectedDeliveryDate:
                "2026-10-16",

            status: "DRAFT",

            notes:
                "Draft order awaiting final quantity confirmation.",

            lines: [
                {
                    id: "pol_003",

                    productId:
                        "prod_002",

                    unitId:
                        "unit_002_box",

                    sku:
                        "HYB-SPC-180-SMK",

                    description:
                        "SPC Hybrid 180mm Smoked Oak",

                    unitSymbol:
                        "box",

                    orderedQuantity:
                        15,

                    receivedQuantity:
                        0,

                    billedQuantity: 0,

                    unitCost:
                        66,

                    lineSubtotal:
                        990,

                    taxAmount:
                        99,

                    lineTotal:
                        1089,
                },
            ],

            totals: {
                subtotal: 990,
                taxAmount: 99,
                total: 1089,
            },

            createdAt:
                "2026-10-06T01:00:00.000Z",

            updatedAt:
                "2026-10-06T01:00:00.000Z",
        },
    ];