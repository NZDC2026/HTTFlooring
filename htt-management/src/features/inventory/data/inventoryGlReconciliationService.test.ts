import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type {
    Account,
} from "../../accounting/types/account";

import type {
    JournalEntry,
} from "../../accounting/types/journalEntry";

type CostEngineModule =
    typeof import("./inventoryCostEngine");

type CostMovementRepository =
    typeof import("./inventoryCostMovementRepository")[
    "inventoryCostMovementRepository"
    ];

type AccountRepository =
    typeof import("../../accounting/data/accountRepository")[
    "accountRepository"
    ];

type JournalRepository =
    typeof import("../../accounting/data/journalEntryRepository")[
    "journalEntryRepository"
    ];

type ReconciliationService =
    typeof import("./inventoryGlReconciliationService")[
    "calculateInventoryGlReconciliation"
    ];

let receiveInventoryCost:
    CostEngineModule["receiveInventoryCost"];

let issueInventoryCost:
    CostEngineModule["issueInventoryCost"];

let inventoryCostMovementRepository:
    CostMovementRepository;

let accountRepository:
    AccountRepository;

let journalEntryRepository:
    JournalRepository;

let calculateInventoryGlReconciliation:
    ReconciliationService;

let productId: string;
let unitId: string;
let siteId: string;
let secondSiteId: string;

let inventoryAccount: Account;
let bankAccount: Account;

let referenceCounter = 0;

const dates = {
    firstReceipt: "2026-10-01",
    secondReceipt: "2026-10-02",
    firstIssue: "2026-10-03",
    future: "2026-10-10",
};

beforeEach(async () => {
    vi.resetModules();

    const [
        engineModule,
        movementModule,
        accountModule,
        journalModule,
        reconciliationModule,
        productsModule,
        sitesModule,
    ] = await Promise.all([
        import("./inventoryCostEngine"),

        import("./inventoryCostMovementRepository"),

        import("../../accounting/data/accountRepository"),

        import("../../accounting/data/journalEntryRepository"),

        import("./inventoryGlReconciliationService"),

        import("./mockProducts"),

        import("./inventorySiteRepository"),
    ]);

    receiveInventoryCost =
        engineModule.receiveInventoryCost;

    issueInventoryCost =
        engineModule.issueInventoryCost;

    inventoryCostMovementRepository =
        movementModule.inventoryCostMovementRepository;

    accountRepository =
        accountModule.accountRepository;

    journalEntryRepository =
        journalModule.journalEntryRepository;

    calculateInventoryGlReconciliation =
        reconciliationModule.calculateInventoryGlReconciliation;

    const product =
        productsModule.mockProducts.find(
            (item) => item.id === "prod_001",
        );

    if (!product) {
        throw new Error(
            "6J-G test product prod_001 was not found.",
        );
    }

    productId = product.id;
    unitId = product.baseUnitId;

    const sites =
        sitesModule.inventorySiteRepository.getActive();

    if (sites.length < 2) {
        throw new Error(
            "6J-G requires at least two active inventory sites.",
        );
    }

    siteId = sites[0].id;
    secondSiteId = sites[1].id;

    const accounts =
        accountRepository.getAll();

    const inventory =
        accounts.find(
            (account) =>
                account.systemRole === "INVENTORY",
        );

    const bank =
        accounts.find(
            (account) =>
                account.systemRole === "BANK",
        );

    if (!inventory || !bank) {
        throw new Error(
            "Inventory or Bank GL account was not found.",
        );
    }

    inventoryAccount = inventory;
    bankAccount = bank;

    referenceCounter = 0;
});

function nextReference() {
    referenceCounter += 1;

    return `6JG-${referenceCounter}`;
}

/**
 * Creates real inventory cost movements.
 *
 * These operations update the Inventory
 * Subledger but do not create GL journals.
 */
function receive(
    quantity: number,
    unitCost: number,
    occurredAt: string,
    targetSiteId = siteId,
) {
    const referenceId = nextReference();

    return receiveInventoryCost({
        siteId: targetSiteId,
        productId,
        unitId,

        quantity,
        transactionUnitCost: unitCost,

        referenceType: "GOODS_RECEIPT",
        referenceId,
        referenceNumber: referenceId,

        inventoryMovementId:
            `physical-${referenceId}`,

        occurredAt,
    });
}

function issue(
    quantity: number,
    occurredAt: string,
) {
    const referenceId = nextReference();

    return issueInventoryCost({
        siteId,
        productId,
        unitId,

        quantity,

        referenceType: "SALE",
        referenceId,
        referenceNumber: referenceId,

        inventoryMovementId:
            `physical-${referenceId}`,

        occurredAt,
    });
}

/**
 * Build a balanced JournalEntry fixture.
 *
 * This is intentionally a test fixture,
 * not a call to journalEntryRepository.post().
 *
 * The Inventory control account disallows
 * manual posting in the production repository.
 */
function inventoryJournal(
    amount: number,
    journalDate: string,
    direction: "IN" | "OUT",
): JournalEntry {
    const referenceId = nextReference();

    const inventoryDebit =
        direction === "IN" ? amount : 0;

    const inventoryCredit =
        direction === "OUT" ? amount : 0;

    const bankDebit =
        direction === "OUT" ? amount : 0;

    const bankCredit =
        direction === "IN" ? amount : 0;

    const now =
        `${journalDate}T12:00:00.000Z`;

    return {
        id: `je-${referenceId}`,

        journalNumber: referenceId,

        journalDate,

        description:
            "6J-G inventory reconciliation fixture",

        reference: referenceId,

        sourceType: "MANUAL_JOURNAL",

        sourceId: referenceId,

        status: "POSTED",

        lines: [
            {
                id: `jl-${referenceId}-inventory`,
                accountId: inventoryAccount.id,
                accountCode: inventoryAccount.code,
                accountName: inventoryAccount.name,
                debit: inventoryDebit,
                credit: inventoryCredit,
            },
            {
                id: `jl-${referenceId}-bank`,
                accountId: bankAccount.id,
                accountCode: bankAccount.code,
                accountName: bankAccount.name,
                debit: bankDebit,
                credit: bankCredit,
            },
        ],

        totalDebit: amount,
        totalCredit: amount,

        createdAt: now,
        updatedAt: now,
        postedAt: now,
    };
}

/**
 * The reconciliation service is pure:
 * it receives snapshots and returns a report.
 *
 * Passing synthetic GL fixtures lets us test
 * the calculation without bypassing the
 * production journal posting restrictions.
 */
function reconcile(
    asOfDate: string,
    journalEntries: JournalEntry[] = [],
    accounts: Account[] = accountRepository.getAll(),
) {
    return calculateInventoryGlReconciliation({
        accounts,

        journalEntries,

        costMovements:
            inventoryCostMovementRepository.getAll(),

        asOfDate,
    });
}

describe(
    "6J-G Inventory Subledger / GL Reconciliation",
    () => {
        it("G01 reconciles empty subledger and empty GL", () => {
            const report =
                reconcile(dates.firstReceipt);

            expect(report.subledgerInventoryValue).toBe(0);
            expect(report.glInventoryBalance).toBe(0);
            expect(report.difference).toBe(0);
            expect(report.reconciled).toBe(true);

            expect(report.valuationLineCount).toBe(0);
            expect(report.siteCount).toBe(0);
            expect(report.productCount).toBe(0);

            expect(report.inventoryAccountId).toBe(
                inventoryAccount.id,
            );
        });

        it("G02 reports receipt without GL posting as a difference", () => {
            receive(
                100,
                20,
                dates.firstReceipt,
            );

            const report =
                reconcile(dates.firstReceipt);

            expect(report.subledgerInventoryValue).toBe(2000);
            expect(report.glInventoryBalance).toBe(0);

            expect(report.difference).toBe(2000);
            expect(report.reconciled).toBe(false);

            expect(report.valuationLineCount).toBe(1);
        });

        it("G03 reconciles when inventory GL matches subledger", () => {
            receive(
                100,
                20,
                dates.firstReceipt,
            );

            const journals = [
                inventoryJournal(
                    2000,
                    dates.firstReceipt,
                    "IN",
                ),
            ];

            const report = reconcile(
                dates.firstReceipt,
                journals,
            );

            expect(report.subledgerInventoryValue).toBe(2000);
            expect(report.glInventoryBalance).toBe(2000);
            expect(report.difference).toBe(0);
            expect(report.reconciled).toBe(true);
        });

        it("G04 reports positive difference when GL is understated", () => {
            receive(
                100,
                20,
                dates.firstReceipt,
            );

            const journals = [
                inventoryJournal(
                    1500,
                    dates.firstReceipt,
                    "IN",
                ),
            ];

            const report = reconcile(
                dates.firstReceipt,
                journals,
            );

            expect(report.subledgerInventoryValue).toBe(2000);
            expect(report.glInventoryBalance).toBe(1500);
            expect(report.difference).toBe(500);
            expect(report.reconciled).toBe(false);
        });

        it("G05 reports negative difference when GL is overstated", () => {
            receive(
                100,
                20,
                dates.firstReceipt,
            );

            const journals = [
                inventoryJournal(
                    2500,
                    dates.firstReceipt,
                    "IN",
                ),
            ];

            const report = reconcile(
                dates.firstReceipt,
                journals,
            );

            expect(report.subledgerInventoryValue).toBe(2000);
            expect(report.glInventoryBalance).toBe(2500);
            expect(report.difference).toBe(-500);
            expect(report.reconciled).toBe(false);
        });

        it("G06 excludes future inventory and GL transactions", () => {
            receive(
                100,
                20,
                dates.firstReceipt,
            );

            receive(
                100,
                30,
                dates.future,
            );

            const journals = [
                inventoryJournal(
                    2000,
                    dates.firstReceipt,
                    "IN",
                ),
                inventoryJournal(
                    3000,
                    dates.future,
                    "IN",
                ),
            ];

            const historical = reconcile(
                dates.firstReceipt,
                journals,
            );

            expect(
                historical.subledgerInventoryValue,
            ).toBe(2000);

            expect(
                historical.glInventoryBalance,
            ).toBe(2000);

            expect(historical.reconciled).toBe(true);

            const latest = reconcile(
                dates.future,
                journals,
            );

            expect(
                latest.subledgerInventoryValue,
            ).toBe(5000);

            expect(
                latest.glInventoryBalance,
            ).toBe(5000);

            expect(latest.reconciled).toBe(true);
        });

        it("G07 aggregates multiple inventory sites", () => {
            receive(
                100,
                20,
                dates.firstReceipt,
                siteId,
            );

            receive(
                50,
                30,
                dates.firstReceipt,
                secondSiteId,
            );

            const journals = [
                inventoryJournal(
                    3500,
                    dates.firstReceipt,
                    "IN",
                ),
            ];

            const report = reconcile(
                dates.firstReceipt,
                journals,
            );

            expect(report.subledgerInventoryValue).toBe(3500);
            expect(report.glInventoryBalance).toBe(3500);
            expect(report.difference).toBe(0);
            expect(report.reconciled).toBe(true);

            expect(report.siteCount).toBe(2);
            expect(report.productCount).toBe(1);
            expect(report.valuationLineCount).toBe(2);
        });

        it("G08 reconciles after inventory issue and GL credit", () => {
            receive(
                100,
                20,
                dates.firstReceipt,
            );

            receive(
                100,
                30,
                dates.secondReceipt,
            );

            const issued = issue(
                40,
                dates.firstIssue,
            );

            expect(issued.movement.valueChange).toBe(-1000);

            const journals = [
                inventoryJournal(
                    2000,
                    dates.firstReceipt,
                    "IN",
                ),
                inventoryJournal(
                    3000,
                    dates.secondReceipt,
                    "IN",
                ),
                inventoryJournal(
                    1000,
                    dates.firstIssue,
                    "OUT",
                ),
            ];

            const report = reconcile(
                dates.firstIssue,
                journals,
            );

            expect(report.subledgerInventoryValue).toBe(4000);
            expect(report.glInventoryBalance).toBe(4000);
            expect(report.difference).toBe(0);
            expect(report.reconciled).toBe(true);
        });

        it("G09 rejects missing Inventory control account", () => {
            const accounts = accountRepository
                .getAll()
                .filter(
                    (account) =>
                        account.systemRole !== "INVENTORY",
                );

            expect(() =>
                reconcile(
                    dates.firstReceipt,
                    [],
                    accounts,
                ),
            ).toThrow(
                "Inventory GL control account was not found.",
            );
        });

        it("G10 rejects Inventory control account with wrong type", () => {
            const accounts = accountRepository
                .getAll()
                .map(
                    (account) =>
                        account.systemRole === "INVENTORY"
                            ? {
                                ...account,
                                type: "EXPENSE" as const,
                            }
                            : account,
                );

            expect(() =>
                reconcile(
                    dates.firstReceipt,
                    [],
                    accounts,
                ),
            ).toThrow(
                "Inventory GL control account must be an asset account.",
            );
        });

        it("G11 rejects invalid reconciliation dates", () => {
            expect(() =>
                reconcile("2026/10/01"),
            ).toThrow();

            expect(() =>
                reconcile("invalid-date"),
            ).toThrow();

            expect(() =>
                reconcile("2026-02-30"),
            ).toThrow();
        });

        it("G12 does not mutate source repositories", () => {
            receive(
                100,
                20,
                dates.firstReceipt,
            );

            const costBefore = structuredClone(
                inventoryCostMovementRepository.getAll(),
            );

            const journalsBefore = structuredClone(
                journalEntryRepository.getAll(),
            );

            const report = reconcile(
                dates.firstReceipt,
                [
                    inventoryJournal(
                        2000,
                        dates.firstReceipt,
                        "IN",
                    ),
                ],
            );

            expect(report.reconciled).toBe(true);

            expect(
                inventoryCostMovementRepository.getAll(),
            ).toEqual(costBefore);

            expect(
                journalEntryRepository.getAll(),
            ).toEqual(journalsBefore);
        });
    },
);