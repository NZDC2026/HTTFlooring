import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

type AccountRepository =
    typeof import("./accountRepository")[
    "accountRepository"
    ];

type JournalRepository =
    typeof import("./journalEntryRepository")[
    "journalEntryRepository"
    ];

type ProfitAndLossService =
    typeof import("./profitAndLossService")[
    "calculateProfitAndLoss"
    ];

type Account =
    import("../types/account").Account;

type JournalEntry =
    import("../types/journalEntry").JournalEntry;

let accountRepository: AccountRepository;

let journalEntryRepository: JournalRepository;

let calculateProfitAndLoss: ProfitAndLossService;

let salesRevenueAccount: Account;
let cogsAccount: Account;
let operatingExpenseAccount: Account;
let bankAccount: Account;

let referenceCounter = 0;

const dates = {
    september: "2026-09-30",
    october01: "2026-10-01",
    october02: "2026-10-02",
    october03: "2026-10-03",
    october04: "2026-10-04",
    november: "2026-11-01",
};

beforeEach(async () => {
    vi.resetModules();

    const [
        accountModule,
        journalModule,
        profitModule,
    ] = await Promise.all([
        import("./accountRepository"),
        import("./journalEntryRepository"),
        import("./profitAndLossService"),
    ]);

    accountRepository =
        accountModule.accountRepository;

    journalEntryRepository =
        journalModule.journalEntryRepository;

    calculateProfitAndLoss =
        profitModule.calculateProfitAndLoss;

    salesRevenueAccount =
        accountRepository.requireBySystemRole(
            "SALES_REVENUE",
        );

    cogsAccount =
        accountRepository.requireBySystemRole(
            "COST_OF_GOODS_SOLD",
        );

    operatingExpenseAccount =
        accountRepository.requireBySystemRole(
            "OPERATING_EXPENSE",
        );

    bankAccount =
        accountRepository.requireBySystemRole(
            "BANK",
        );

    referenceCounter = 0;
});

function nextReference() {
    referenceCounter += 1;

    return `6JH-${referenceCounter}`;
}

/**
 * Post a real balanced journal.
 *
 * The sourceType is CUSTOMER_INVOICE or
 * SALES_FULFILMENT so the system-controlled
 * accounts can be used by the repository.
 *
 * These are accounting integration fixtures,
 * not generated customer invoices.
 */
function postJournal(
    journalDate: string,
    description: string,
    debitAccountId: string,
    creditAccountId: string,
    amount: number,
    sourceType:
        | "CUSTOMER_INVOICE"
        | "SALES_FULFILMENT" = "CUSTOMER_INVOICE",
): JournalEntry {
    const reference = nextReference();

    return journalEntryRepository.post({
        journalDate,
        description,
        reference,
        sourceType,
        sourceId: reference,

        lines: [
            {
                accountId: debitAccountId,
                debit: amount,
                credit: 0,
            },
            {
                accountId: creditAccountId,
                debit: 0,
                credit: amount,
            },
        ],
    });
}

/**
 * Sales revenue:
 *
 * Dr Bank
 * Cr Sales Revenue
 *
 * Bank is used as the balancing account
 * for this test fixture.
 */
function postRevenue(
    amount: number,
    journalDate = dates.october01,
) {
    return postJournal(
        journalDate,
        "6J-H sales revenue",
        bankAccount.id,
        salesRevenueAccount.id,
        amount,
        "CUSTOMER_INVOICE",
    );
}

/**
 * COGS:
 *
 * Dr Cost of Goods Sold
 * Cr Bank
 *
 * This is a controlled accounting fixture.
 * Production fulfilment normally credits
 * the Inventory control account instead.
 */
function postCogs(
    amount: number,
    journalDate = dates.october02,
) {
    return postJournal(
        journalDate,
        "6J-H cost of goods sold",
        cogsAccount.id,
        bankAccount.id,
        amount,
        "SALES_FULFILMENT",
    );
}

/**
 * Operating expense:
 *
 * Dr Operating Expense
 * Cr Bank
 */
function postOperatingExpense(
    amount: number,
    journalDate = dates.october03,
) {
    return postJournal(
        journalDate,
        "6J-H operating expense",
        operatingExpenseAccount.id,
        bankAccount.id,
        amount,
        "CUSTOMER_INVOICE",
    );
}

/**
 * Revenue reversal:
 *
 * Dr Sales Revenue
 * Cr Bank
 */
function reverseRevenue(
    amount: number,
    journalDate = dates.october04,
) {
    return postJournal(
        journalDate,
        "6J-H revenue reversal",
        salesRevenueAccount.id,
        bankAccount.id,
        amount,
        "CUSTOMER_INVOICE",
    );
}

/**
 * COGS reversal:
 *
 * Dr Bank
 * Cr Cost of Goods Sold
 */
function reverseCogs(
    amount: number,
    journalDate = dates.october04,
) {
    return postJournal(
        journalDate,
        "6J-H COGS reversal",
        bankAccount.id,
        cogsAccount.id,
        amount,
        "SALES_FULFILMENT",
    );
}

function report(
    fromDate = dates.october01,
    toDate = dates.october04,
) {
    return calculateProfitAndLoss(
        accountRepository.getAll(),
        journalEntryRepository.getAll(),
        fromDate,
        toDate,
    );
}

describe(
    "6J-H Gross Profit Integration",
    () => {
        it("H01 returns zero values without journals", () => {
            const result = report();

            expect(result.totalRevenue).toBe(0);
            expect(result.salesRevenue).toBe(0);
            expect(result.costOfGoodsSold).toBe(0);
            expect(result.grossProfit).toBe(0);
            expect(result.grossMarginPercent).toBeNull();

            expect(result.operatingExpenses).toBe(0);
            expect(result.totalExpenses).toBe(0);
            expect(result.netProfit).toBe(0);

            expect(result.revenue).toHaveLength(0);
            expect(result.expenses).toHaveLength(0);
        });

        it("H02 calculates profit with revenue only", () => {
            postRevenue(10000);

            const result = report();

            expect(result.salesRevenue).toBe(10000);
            expect(result.totalRevenue).toBe(10000);

            expect(result.costOfGoodsSold).toBe(0);

            expect(result.grossProfit).toBe(10000);
            expect(result.grossMarginPercent).toBe(100);

            expect(result.netProfit).toBe(10000);
        });

        it("H03 calculates gross profit from revenue and COGS", () => {
            postRevenue(10000);
            postCogs(6000);

            const result = report();

            expect(result.salesRevenue).toBe(10000);
            expect(result.costOfGoodsSold).toBe(6000);

            expect(result.grossProfit).toBe(4000);

            expect(result.totalExpenses).toBe(6000);
            expect(result.netProfit).toBe(4000);
        });

        it("H04 calculates gross margin percentage", () => {
            postRevenue(10000);
            postCogs(6500);

            const result = report();

            expect(result.grossProfit).toBe(3500);

            expect(result.grossMarginPercent).toBe(35);
        });

        it("H05 excludes operating expenses from gross profit", () => {
            postRevenue(10000);
            postCogs(6000);
            postOperatingExpense(1000);

            const result = report();

            expect(result.salesRevenue).toBe(10000);
            expect(result.costOfGoodsSold).toBe(6000);

            expect(result.grossProfit).toBe(4000);
            expect(result.grossMarginPercent).toBe(40);

            expect(result.operatingExpenses).toBe(1000);
            expect(result.totalExpenses).toBe(7000);

            expect(result.netProfit).toBe(3000);
        });

        it("H06 aggregates multiple sales and COGS journals", () => {
            postRevenue(4000);
            postRevenue(6000, dates.october02);
            postRevenue(2000, dates.october03);

            postCogs(2000);
            postCogs(3000, dates.october03);
            postCogs(1000, dates.october04);

            const result = report();

            expect(result.salesRevenue).toBe(12000);
            expect(result.costOfGoodsSold).toBe(6000);

            expect(result.grossProfit).toBe(6000);
            expect(result.grossMarginPercent).toBe(50);

            expect(result.netProfit).toBe(6000);
        });

        it("H07 excludes journals outside the accounting period", () => {
            postRevenue(3000, dates.september);

            postRevenue(10000, dates.october01);
            postCogs(6000, dates.october02);

            postRevenue(5000, dates.november);
            postCogs(2000, dates.november);

            const october = report(
                dates.october01,
                dates.october04,
            );

            expect(october.salesRevenue).toBe(10000);
            expect(october.costOfGoodsSold).toBe(6000);

            expect(october.grossProfit).toBe(4000);
            expect(october.grossMarginPercent).toBe(40);

            const september = report(
                "2026-09-01",
                "2026-09-30",
            );

            expect(september.salesRevenue).toBe(3000);
            expect(september.costOfGoodsSold).toBe(0);
            expect(september.grossProfit).toBe(3000);

            const november = report(
                "2026-11-01",
                "2026-11-30",
            );

            expect(november.salesRevenue).toBe(5000);
            expect(november.costOfGoodsSold).toBe(2000);
            expect(november.grossProfit).toBe(3000);
        });

        it("H08 reduces revenue after a reversal journal", () => {
            postRevenue(10000);
            postCogs(6000);

            reverseRevenue(2000);

            const result = report();

            expect(result.salesRevenue).toBe(8000);
            expect(result.costOfGoodsSold).toBe(6000);

            expect(result.grossProfit).toBe(2000);
            expect(result.grossMarginPercent).toBe(25);

            expect(result.netProfit).toBe(2000);
        });

        it("H09 restores gross profit after COGS reversal", () => {
            postRevenue(10000);
            postCogs(6000);

            const before = report(
                dates.october01,
                dates.october03,
            );

            expect(before.grossProfit).toBe(4000);

            reverseCogs(2000);

            const after = report();

            expect(after.salesRevenue).toBe(10000);
            expect(after.costOfGoodsSold).toBe(4000);

            expect(after.grossProfit).toBe(6000);
            expect(after.grossMarginPercent).toBe(60);

            expect(after.netProfit).toBe(6000);
        });

        it("H10 returns null margin when sales revenue is zero", () => {
            postCogs(1000);

            const result = report();

            expect(result.salesRevenue).toBe(0);
            expect(result.costOfGoodsSold).toBe(1000);

            expect(result.grossProfit).toBe(-1000);
            expect(result.grossMarginPercent).toBeNull();

            expect(result.netProfit).toBe(-1000);
        });

        it("H11 validates required revenue and COGS accounts", () => {
            const accounts = accountRepository.getAll();

            const withoutRevenue = accounts.filter(
                (account) =>
                    account.systemRole !== "SALES_REVENUE",
            );

            expect(() =>
                calculateProfitAndLoss(
                    withoutRevenue,
                    [],
                    dates.october01,
                    dates.october04,
                ),
            ).toThrow(
                "Sales Revenue system account was not found.",
            );

            const withoutCogs = accounts.filter(
                (account) =>
                    account.systemRole !== "COST_OF_GOODS_SOLD",
            );

            expect(() =>
                calculateProfitAndLoss(
                    withoutCogs,
                    [],
                    dates.october01,
                    dates.october04,
                ),
            ).toThrow(
                "Cost of Goods Sold system account was not found.",
            );

            const wrongRevenueType = accounts.map(
                (account) =>
                    account.systemRole === "SALES_REVENUE"
                        ? {
                            ...account,
                            type: "ASSET" as const,
                        }
                        : account,
            );

            expect(() =>
                calculateProfitAndLoss(
                    wrongRevenueType,
                    [],
                    dates.october01,
                    dates.october04,
                ),
            ).toThrow(
                "Sales Revenue system account must be a revenue account.",
            );

            const wrongCogsType = accounts.map(
                (account) =>
                    account.systemRole === "COST_OF_GOODS_SOLD"
                        ? {
                            ...account,
                            type: "ASSET" as const,
                        }
                        : account,
            );

            expect(() =>
                calculateProfitAndLoss(
                    wrongCogsType,
                    [],
                    dates.october01,
                    dates.october04,
                ),
            ).toThrow(
                "Cost of Goods Sold system account must be an expense account.",
            );
        });

        it("H12 does not mutate journal or account repositories", () => {
            postRevenue(10000);
            postCogs(6000);
            postOperatingExpense(1000);

            const journalsBefore = structuredClone(
                journalEntryRepository.getAll(),
            );

            const accountsBefore = structuredClone(
                accountRepository.getAll(),
            );

            const first = report();
            const second = report();

            expect(first).toEqual(second);

            expect(first.salesRevenue).toBe(10000);
            expect(first.costOfGoodsSold).toBe(6000);
            expect(first.grossProfit).toBe(4000);
            expect(first.operatingExpenses).toBe(1000);
            expect(first.netProfit).toBe(3000);

            expect(
                journalEntryRepository.getAll(),
            ).toEqual(journalsBefore);

            expect(
                accountRepository.getAll(),
            ).toEqual(accountsBefore);
        });
    },
);