import type {
    Account,
} from "../types/account";

import type {
    JournalEntry,
} from "../types/journalEntry";

import type {
    AccountsReceivableGlReconciliation,
} from "../types/accountsReceivableGlReconciliation";

import type {
    AccountsPayableGlReconciliation,
} from "../types/accountsPayableGlReconciliation";

import type {
    BankAccount,
} from "../../banking/types/bankAccount";

import type {
    FinanceControl,
    FinanceControlsSummary,
    BankFinanceControl,
} from "../types/financeControls";

import {
    calculateGeneralLedgerSummary,
} from "./generalLedgerService";

import {
    calculateTrialBalance,
} from "./trialBalanceService";

import {
    calculateProfitAndLoss,
} from "./profitAndLossService";

import {
    calculateBalanceSheet,
} from "./balanceSheetService";

import {
    calculateBankRegister,
} from "../../banking/data/bankRegisterService";

function roundCurrency(
    value:
        number,
) {
    return Math.round(
        (
            value +
            Number.EPSILON
        ) * 100,
    ) / 100;
}

function validateDate(
    value:
        string,
) {
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            value,
        )
    ) {
        throw new Error(
            "As of date must use YYYY-MM-DD format.",
        );
    }
}

function buildControl({
    id,
    name,
    description,
    leftLabel,
    leftValue,
    rightLabel,
    rightValue,
    route,
}: {
    id:
    string;

    name:
    string;

    description:
    string;

    leftLabel:
    string;

    leftValue:
    number;

    rightLabel:
    string;

    rightValue:
    number;

    route?:
    string;
}): FinanceControl {
    const roundedLeft =
        roundCurrency(
            leftValue,
        );

    const roundedRight =
        roundCurrency(
            rightValue,
        );

    const difference =
        roundCurrency(
            roundedLeft -
            roundedRight,
        );

    return {
        id,

        name,

        description,

        leftLabel,

        leftValue:
            roundedLeft,

        rightLabel,

        rightValue:
            roundedRight,

        difference,

        status:
            difference ===
                0
                ? "PASS"
                : "FAIL",

        route,
    };
}

interface CalculateFinanceControlsInput {
    accounts:
    Account[];

    journalEntries:
    JournalEntry[];

    bankAccounts:
    BankAccount[];

    arReconciliation:
    AccountsReceivableGlReconciliation;

    apReconciliation:
    AccountsPayableGlReconciliation;

    asOfDate:
    string;
}

export function calculateFinanceControls({
    accounts,
    journalEntries,
    bankAccounts,
    arReconciliation,
    apReconciliation,
    asOfDate,
}: CalculateFinanceControlsInput):
    FinanceControlsSummary {
    validateDate(
        asOfDate,
    );

    /*
     * Trial Balance is cumulative here.
     *
     * We intentionally use a very early valid
     * date so all journals through asOfDate are
     * included in the closing balance.
     */
    const trialBalance =
        calculateTrialBalance(
            accounts,
            journalEntries,
            "0001-01-01",
            asOfDate,
        );

    const balanceSheet =
        calculateBalanceSheet(
            accounts,
            journalEntries,
            asOfDate,
        );

    /*
     * Until year-end closing journals exist,
     * Balance Sheet Current Earnings represents
     * cumulative unclosed P&L.
     */
    const cumulativeProfitAndLoss =
        calculateProfitAndLoss(
            accounts,
            journalEntries,
            "0001-01-01",
            asOfDate,
        );

    const controls:
        FinanceControl[] = [
            buildControl({
                id:
                    "trial-balance",

                name:
                    "Trial Balance",

                description:
                    "Closing debit balances must equal closing credit balances.",

                leftLabel:
                    "Closing Debits",

                leftValue:
                    trialBalance
                        .totalClosingDebit,

                rightLabel:
                    "Closing Credits",

                rightValue:
                    trialBalance
                        .totalClosingCredit,

                route:
                    "/accounting/trial-balance",
            }),

            buildControl({
                id:
                    "accounts-receivable",

                name:
                    "Accounts Receivable",

                description:
                    "Customer AR subledger must equal the Accounts Receivable GL control account.",

                leftLabel:
                    "AR Subledger",

                leftValue:
                    arReconciliation
                        .arSubledgerBalance,

                rightLabel:
                    "GL Accounts Receivable",

                rightValue:
                    arReconciliation
                        .glAccountsReceivableBalance,

                route:
                    "/accounting/reconciliation/ar",
            }),

            buildControl({
                id:
                    "accounts-payable",

                name:
                    "Accounts Payable",

                description:
                    "Supplier AP subledger must equal the Accounts Payable GL control account.",

                leftLabel:
                    "AP Subledger",

                leftValue:
                    apReconciliation
                        .apSubledgerBalance,

                rightLabel:
                    "GL Accounts Payable",

                rightValue:
                    apReconciliation
                        .glAccountsPayableBalance,

                route:
                    "/accounting/reconciliation/ap",
            }),

            buildControl({
                id:
                    "balance-sheet",

                name:
                    "Balance Sheet",

                description:
                    "Total Assets must equal Total Liabilities plus Total Equity.",

                leftLabel:
                    "Total Assets",

                leftValue:
                    balanceSheet
                        .totalAssets,

                rightLabel:
                    "Liabilities + Equity",

                rightValue:
                    balanceSheet
                        .totalLiabilitiesAndEquity,

                route:
                    "/accounting/balance-sheet",
            }),

            buildControl({
                id:
                    "profit-and-loss",

                name:
                    "P&L / Current Earnings",

                description:
                    "Cumulative unclosed profit or loss must equal Balance Sheet Current Earnings.",

                leftLabel:
                    "Cumulative Net Profit",

                leftValue:
                    cumulativeProfitAndLoss
                        .netProfit,

                rightLabel:
                    "Current Earnings",

                rightValue:
                    balanceSheet
                        .currentEarnings,

                route:
                    "/accounting/profit-and-loss",
            }),
        ];

    const glSummary =
        calculateGeneralLedgerSummary(
            accounts,
            journalEntries,
            asOfDate,
        );

    const bankControls =
        bankAccounts
            .map<BankFinanceControl>(
                (
                    bankAccount,
                ) => {
                    const register =
                        calculateBankRegister(
                            bankAccount,
                            journalEntries,
                            asOfDate,
                        );

                    const glBalance =
                        roundCurrency(
                            glSummary
                                .accountBalances
                                .find(
                                    (
                                        balance,
                                    ) =>
                                        balance
                                            .account
                                            .id ===
                                        bankAccount
                                            .glAccountId,
                                )
                                ?.balance ??
                            0,
                        );

                    const registerBalance =
                        roundCurrency(
                            register
                                .closingBalance,
                        );

                    const difference =
                        roundCurrency(
                            registerBalance -
                            glBalance,
                        );

                    return {
                        bankAccountId:
                            bankAccount.id,

                        bankAccountName:
                            bankAccount.name,

                        glAccountId:
                            bankAccount.glAccountId,

                        registerBalance,

                        glBalance,

                        difference,

                        status:
                            difference ===
                                0
                                ? "PASS"
                                : "FAIL",
                    };
                },
            )
            .sort(
                (
                    first,
                    second,
                ) =>
                    first.bankAccountName.localeCompare(
                        second.bankAccountName,
                    ),
            );

    const totalControlCount =
        controls.length +
        bankControls.length;

    const passedControlCount =
        controls.filter(
            (control) =>
                control.status ===
                "PASS",
        ).length +
        bankControls.filter(
            (control) =>
                control.status ===
                "PASS",
        ).length;

    const failedControlCount =
        totalControlCount -
        passedControlCount;

    return {
        asOfDate,

        controls,

        bankControls,

        totalControlCount,

        passedControlCount,

        failedControlCount,

        allPassed:
            failedControlCount ===
            0,
    };
}