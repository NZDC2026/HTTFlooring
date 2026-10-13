import type {
    Account,
} from "../../accounting/types/account";

import type {
    JournalEntry,
} from "../../accounting/types/journalEntry";

import type {
    InventoryCostMovement,
} from "../types/inventoryCost";

import type {
    InventoryGlReconciliation,
} from "../types/inventoryGlReconciliation";

import {
    calculateGeneralLedgerSummary,
} from "../../accounting/data/generalLedgerService";

import {
    calculateInventoryValuation,
} from "./inventoryValuationService";

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

function validateAsOfDate(
    value:
        string,
) {
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            value,
        )
    ) {
        throw new Error(
            "Inventory reconciliation date must use YYYY-MM-DD format.",
        );
    }

    const parsed =
        new Date(
            `${value}T00:00:00Z`,
        );

    if (
        Number.isNaN(
            parsed.getTime(),
        ) ||
        parsed
            .toISOString()
            .slice(
                0,
                10,
            ) !==
        value
    ) {
        throw new Error(
            "Inventory reconciliation date is invalid.",
        );
    }
}

export function calculateInventoryGlReconciliation({
    accounts,
    journalEntries,
    costMovements,
    asOfDate,
}: {
    accounts:
    Account[];

    journalEntries:
    JournalEntry[];

    costMovements:
    InventoryCostMovement[];

    asOfDate:
    string;
}): InventoryGlReconciliation {
    validateAsOfDate(
        asOfDate,
    );

    const inventoryAccount =
        accounts.find(
            (
                account,
            ) =>
                account.systemRole ===
                "INVENTORY",
        );

    if (!inventoryAccount) {
        throw new Error(
            "Inventory GL control account was not found.",
        );
    }

    if (
        inventoryAccount.type !==
        "ASSET"
    ) {
        throw new Error(
            "Inventory GL control account must be an asset account.",
        );
    }

    const valuation =
        calculateInventoryValuation(
            costMovements,
            asOfDate,
        );

    const glSummary =
        calculateGeneralLedgerSummary(
            accounts,
            journalEntries,
            asOfDate,
        );

    const glInventoryBalance =
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
                        inventoryAccount.id,
                )
                ?.balance ??
            0,
        );

    const subledgerInventoryValue =
        roundCurrency(
            valuation
                .totalInventoryValue,
        );

    const difference =
        roundCurrency(
            subledgerInventoryValue -
            glInventoryBalance,
        );

    return {
        asOfDate,

        inventoryAccountId:
            inventoryAccount.id,

        inventoryAccountCode:
            inventoryAccount.code,

        inventoryAccountName:
            inventoryAccount.name,

        subledgerInventoryValue,

        glInventoryBalance,

        difference,

        reconciled:
            difference ===
            0,

        valuationLineCount:
            valuation.rows.length,

        siteCount:
            valuation.siteCount,

        productCount:
            valuation.productCount,
    };
}