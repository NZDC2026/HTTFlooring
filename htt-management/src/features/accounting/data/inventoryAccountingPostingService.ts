import {
    accountRepository,
} from "./accountRepository";

import {
    journalEntryRepository,
} from "./journalEntryRepository";

import {
    inventoryCostMovementRepository,
} from "../../inventory/data/inventoryCostMovementRepository";

import type {
    SalesFulfilment,
} from "../../sales/types/salesFulfilment";

function getAccountId(
    systemRole:
        Parameters<
            typeof accountRepository.requireBySystemRole
        >[0],
) {
    return accountRepository
        .requireBySystemRole(
            systemRole,
        )
        .id;
}

function roundMoney(
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

function findOriginalJournal(
    sourceId:
        string,
) {
    return journalEntryRepository
        .getBySource(
            "SALES_FULFILMENT",
            sourceId,
        )
        .find(
            (
                entry,
            ) =>
                !entry
                    .reversedJournalEntryId,
        );
}

function getFulfilmentCostMovements(
    fulfilment:
        SalesFulfilment,
) {
    const movements =
        inventoryCostMovementRepository
            .getByReference(
                "SALE",
                fulfilment.id,
            )
            .filter(
                (
                    movement,
                ) =>
                    movement.movementType ===
                    "ISSUE",
            );

    if (
        movements.length ===
        0
    ) {
        throw new Error(
            `No inventory cost movements were found for sales fulfilment ${fulfilment.fulfilmentNumber}.`,
        );
    }

    if (
        movements.length !==
        fulfilment.lines.length
    ) {
        throw new Error(
            `Inventory costing for sales fulfilment ${fulfilment.fulfilmentNumber} is incomplete.`,
        );
    }

    return movements;
}

export const inventoryAccountingPostingService =
{
    postSalesFulfilment(
        fulfilment:
            SalesFulfilment,
    ) {
        const existing =
            findOriginalJournal(
                fulfilment.id,
            );

        if (existing) {
            return existing;
        }

        const costMovements =
            getFulfilmentCostMovements(
                fulfilment,
            );

        const cogsAmount =
            roundMoney(
                costMovements.reduce(
                    (
                        total,
                        movement,
                    ) => {
                        if (
                            movement.valueChange >
                            0
                        ) {
                            throw new Error(
                                `Sales fulfilment cost movement ${movement.costMovementNumber} has an invalid positive inventory value change.`,
                            );
                        }

                        return (
                            total -
                            movement.valueChange
                        );
                    },
                    0,
                ),
            );

        if (
            !Number.isFinite(
                cogsAmount,
            ) ||
            cogsAmount <
            0
        ) {
            throw new Error(
                "Sales fulfilment COGS amount is invalid.",
            );
        }

        /*
         * Zero-cost inventory is valid.
         *
         * JournalEntryRepository correctly
         * rejects a zero-value journal, so
         * there is intentionally no GL
         * posting when the fulfilment has
         * no inventory value.
         */
        if (
            cogsAmount ===
            0
        ) {
            return undefined;
        }

        return journalEntryRepository.post(
            {
                journalDate:
                    fulfilment.fulfilmentDate,

                description:
                    `COGS for sales fulfilment ${fulfilment.fulfilmentNumber}`,

                reference:
                    fulfilment.fulfilmentNumber,

                sourceType:
                    "SALES_FULFILMENT",

                sourceId:
                    fulfilment.id,

                lines: [
                    {
                        accountId:
                            getAccountId(
                                "COST_OF_GOODS_SOLD",
                            ),

                        description:
                            fulfilment.fulfilmentNumber,

                        debit:
                            cogsAmount,

                        credit:
                            0,
                    },

                    {
                        accountId:
                            getAccountId(
                                "INVENTORY",
                            ),

                        description:
                            fulfilment.fulfilmentNumber,

                        debit:
                            0,

                        credit:
                            cogsAmount,
                    },
                ],
            },
        );
    },

    reverseSalesFulfilment({
        fulfilment,
        reversalDate,
        reason,
    }: {
        fulfilment:
        SalesFulfilment;

        reversalDate:
        string;

        reason:
        string;
    }) {
        const original =
            findOriginalJournal(
                fulfilment.id,
            );

        if (!original) {
            /*
             * A zero-cost fulfilment has no
             * journal to reverse.
             */
            return undefined;
        }

        if (
            original.status ===
            "REVERSED"
        ) {
            return original
                .reversalJournalEntryId
                ? journalEntryRepository
                    .getById(
                        original
                            .reversalJournalEntryId,
                    )
                : undefined;
        }

        return journalEntryRepository
            .reverse({
                journalEntryId:
                    original.id,

                reversalDate,

                reason,
            });
    },
};