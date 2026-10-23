import {requireDateKey} from "../../../lib/businessDate";
import {inventorySiteRepository} from "./inventorySiteRepository";
import {getProductById} from "./mockProducts";
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

    const ids=new Set<string>();
    for(const movement of costMovements){
        requireDateKey(movement.occurredAt.slice(0,10));
        if(movement.occurredAt.slice(0,10)>asOfDate)continue;
        if(!movement.id||ids.has(movement.id))throw new Error("Inventory cost movement IDs must be present and unique.");
        ids.add(movement.id);
        if(![movement.quantityBase,movement.valueChange,movement.unitCostBase].every(Number.isFinite))throw new Error("Inventory cost movement contains a non-finite amount or quantity.");
        if(!inventorySiteRepository.getById(movement.siteId))throw new Error("Inventory cost movement references a missing site.");
        const product=getProductById(movement.productId);
        if(!product||!product.units.some(unit=>unit.id===movement.baseUnitId&&unit.isBaseUnit))throw new Error("Inventory cost movement references a missing product or base unit.");
    }
    if(accounts.filter(account=>account.systemRole==="INVENTORY").length>1)throw new Error("Inventory GL control account is ambiguous.");

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

    if(![subledgerInventoryValue,glInventoryBalance,difference].every(Number.isFinite))throw new Error("Inventory reconciliation contains a non-finite balance.");

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