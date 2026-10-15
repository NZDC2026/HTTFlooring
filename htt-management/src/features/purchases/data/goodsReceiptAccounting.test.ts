import { installPurchaseTestStorage } from './purchaseTestStorage';
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

type PurchaseOrderRepository =
    typeof import("./purchaseOrderRepository")[
    "purchaseOrderRepository"
    ];

type GoodsReceiptRepository =
    typeof import("./goodsReceiptRepository")[
    "goodsReceiptRepository"
    ];

type JournalRepository =
    typeof import("../../accounting/data/journalEntryRepository")[
    "journalEntryRepository"
    ];

type AccountRepository =
    typeof import("../../accounting/data/accountRepository")[
    "accountRepository"
    ];

type CostBalanceRepository =
    typeof import("../../inventory/data/inventoryCostBalanceRepository")[
    "inventoryCostBalanceRepository"
    ];

type StockRepository =
    typeof import("../../inventory/data/stockRepository")[
    "stockRepository"
    ];

type PostingService =
    typeof import("../../accounting/data/purchasesAccountingPostingService")[
    "purchasesAccountingPostingService"
    ];

let purchaseOrderRepository:
    PurchaseOrderRepository;

let goodsReceiptRepository:
    GoodsReceiptRepository;

let journalEntryRepository:
    JournalRepository;

let accountRepository:
    AccountRepository;

let inventoryCostBalanceRepository:
    CostBalanceRepository;

let stockRepository:
    StockRepository;

let purchasesAccountingPostingService:
    PostingService;

let productId: string;
let unitId: string;
let siteId: string;
let supplierId: string;

beforeEach(async () => {
    installPurchaseTestStorage();
    vi.resetModules();

    const [
        purchaseModule,
        receiptModule,
        journalModule,
        accountModule,
        costModule,
        stockModule,
        postingModule,
        productsModule,
        sitesModule,
        suppliersModule,
    ] = await Promise.all([
        import("./purchaseOrderRepository"),
        import("./goodsReceiptRepository"),

        import("../../accounting/data/journalEntryRepository"),
        import("../../accounting/data/accountRepository"),

        import("../../inventory/data/inventoryCostBalanceRepository"),
        import("../../inventory/data/stockRepository"),

        import("../../accounting/data/purchasesAccountingPostingService"),

        import("../../inventory/data/mockProducts"),
        import("../../inventory/data/inventorySiteRepository"),
        import("../../contacts/data/supplierRepository"),
    ]);

    purchaseOrderRepository =
        purchaseModule.purchaseOrderRepository;

    goodsReceiptRepository =
        receiptModule.goodsReceiptRepository;

    journalEntryRepository =
        journalModule.journalEntryRepository;

    accountRepository =
        accountModule.accountRepository;

    inventoryCostBalanceRepository =
        costModule.inventoryCostBalanceRepository;

    stockRepository =
        stockModule.stockRepository;

    purchasesAccountingPostingService =
        postingModule.purchasesAccountingPostingService;

    const product =
        productsModule.mockProducts.find(
            (item) => item.id === "prod_001",
        );

    if (!product) {
        throw new Error(
            "Test product prod_001 was not found.",
        );
    }

    productId = product.id;
    unitId = product.baseUnitId;

    const site =
        sitesModule.inventorySiteRepository.getActive()[0];

    if (!site) {
        throw new Error(
            "Active inventory site was not found.",
        );
    }

    siteId = site.id;

    const supplier =
        suppliersModule.supplierRepository
            .getAll()
            .find(
                (item) =>
                    item.status === "ACTIVE",
            );

    if (!supplier) {
        throw new Error(
            "Active supplier was not found.",
        );
    }

    supplierId = supplier.id;
});

function receiveGoods(
    quantity: number,
    unitCost: number,
    receiptDate = "2026-10-02",
) {
    const po =
        purchaseOrderRepository.create({
            supplierId,
            orderDate: "2026-10-01",

            lines: [
                {
                    productId,
                    unitId,
                    orderedQuantity: quantity,
                    unitCost,
                },
            ],
        });

    purchaseOrderRepository.approve(
        po.id,
    );

    purchaseOrderRepository.send(
        po.id,
    );

    const sent =
        purchaseOrderRepository.getById(
            po.id,
        );

    if (!sent) {
        throw new Error(
            "Purchase order was not found.",
        );
    }

    return goodsReceiptRepository.create({
        purchaseOrderId: sent.id,
        siteId,
        receiptDate,

        lines: [
            {
                purchaseOrderLineId:
                    sent.lines[0].id,

                receivedQuantity:
                    quantity,
            },
        ],
    });
}

function receiptJournals(
    receiptId: string,
) {
    return journalEntryRepository.getBySource(
        "GOODS_RECEIPT",
        receiptId,
    );
}

describe(
    "6K-B Goods Receipt Accounting",
    () => {
        it("B01 posts Inventory / GRNI journal", () => {
            const receipt =
                receiveGoods(
                    100,
                    20,
                );

            const journals =
                receiptJournals(
                    receipt.id,
                );

            expect(journals).toHaveLength(1);

            const journal = journals[0];

            expect(journal.status).toBe("POSTED");

            expect(journal.journalDate).toBe(
                receipt.receiptDate,
            );

            expect(journal.sourceType).toBe(
                "GOODS_RECEIPT",
            );

            expect(journal.sourceId).toBe(
                receipt.id,
            );

            const inventory =
                accountRepository.requireBySystemRole(
                    "INVENTORY",
                );

            const grni =
                accountRepository.requireBySystemRole(
                    "GRNI",
                );

            const inventoryLine =
                journal.lines.find(
                    (line) =>
                        line.accountId === inventory.id,
                );

            const grniLine =
                journal.lines.find(
                    (line) =>
                        line.accountId === grni.id,
                );

            expect(inventoryLine?.debit).toBe(2000);
            expect(inventoryLine?.credit).toBe(0);

            expect(grniLine?.debit).toBe(0);
            expect(grniLine?.credit).toBe(2000);
        });

        it("B02 posts a balanced journal", () => {
            const receipt =
                receiveGoods(
                    100,
                    20,
                );

            const journal =
                receiptJournals(
                    receipt.id,
                )[0];

            expect(journal.totalDebit).toBe(2000);
            expect(journal.totalCredit).toBe(2000);

            expect(journal.totalDebit).toBe(
                journal.totalCredit,
            );
        });

        it("B03 matches Inventory GL with cost subledger", () => {
            const receipt =
                receiveGoods(
                    100,
                    20,
                );

            const balance =
                inventoryCostBalanceRepository.getBalance(
                    siteId,
                    productId,
                );

            const journal =
                receiptJournals(
                    receipt.id,
                )[0];

            const inventory =
                accountRepository.requireBySystemRole(
                    "INVENTORY",
                );

            const inventoryValue =
                journal.lines
                    .filter(
                        (line) =>
                            line.accountId === inventory.id,
                    )
                    .reduce(
                        (total, line) =>
                            total +
                            line.debit -
                            line.credit,
                        0,
                    );

            expect(balance?.inventoryValue).toBe(2000);

            expect(inventoryValue).toBe(
                balance?.inventoryValue,
            );
        });

        it("B04 prevents duplicate accounting posting", () => {
            const receipt =
                receiveGoods(
                    100,
                    20,
                );

            const original =
                receiptJournals(
                    receipt.id,
                )[0];

            const second =
                purchasesAccountingPostingService
                    .postGoodsReceipt(
                        receipt,
                    );

            expect(second.id).toBe(original.id);

            expect(
                receiptJournals(receipt.id),
            ).toHaveLength(1);
        });

        it("B05 posts separate journals for separate receipts", () => {
            const first =
                receiveGoods(
                    100,
                    20,
                    "2026-10-02",
                );

            const second =
                receiveGoods(
                    100,
                    30,
                    "2026-10-03",
                );

            const firstJournal =
                receiptJournals(
                    first.id,
                )[0];

            const secondJournal =
                receiptJournals(
                    second.id,
                )[0];

            expect(firstJournal.id).not.toBe(
                secondJournal.id,
            );

            expect(firstJournal.totalDebit).toBe(2000);
            expect(secondJournal.totalDebit).toBe(3000);

            expect(
                inventoryCostBalanceRepository.getBalance(
                    siteId,
                    productId,
                )?.inventoryValue,
            ).toBe(5000);
        });

        it("B06 preserves physical and cost quantities", () => {
            receiveGoods(
                100,
                20,
            );

            expect(
                stockRepository.getBalance(
                    siteId,
                    productId,
                )?.quantityOnHand,
            ).toBe(100);

            expect(
                inventoryCostBalanceRepository.getBalance(
                    siteId,
                    productId,
                )?.quantityOnHand,
            ).toBe(100);
        });
    },
);