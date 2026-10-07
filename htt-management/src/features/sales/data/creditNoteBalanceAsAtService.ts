import type {
    CreditAllocation,
    CreditNote,
} from "../types/creditNote";

import {
    isCreditAllocationEffectiveAsAt,
} from "./invoiceBalanceAsAtService";

export interface CreditNoteBalanceAsAt {
    creditNoteId: string;

    asOfDate: string;

    creditTotal: number;

    amountApplied: number;
    amountAvailable: number;

    activeAllocationCount: number;

    isEffective: boolean;
}

export function calculateCreditNoteBalanceAsAt(
    creditNote: CreditNote,
    allocations: CreditAllocation[],
    asOfDate: string,
): CreditNoteBalanceAsAt {
    const creditTotal =
        roundCurrency(
            creditNote.totals.total,
        );

    /*
     * Draft credit notes have no accounting effect.
     */
    if (
        creditNote.status ===
        "DRAFT"
    ) {
        return emptyBalance(
            creditNote.id,
            asOfDate,
            creditTotal,
        );
    }

    /*
     * Credit note did not exist yet.
     */
    if (
        creditNote.creditDate >
        asOfDate
    ) {
        return emptyBalance(
            creditNote.id,
            asOfDate,
            creditTotal,
        );
    }

    /*
     * A currently VOID credit note still existed
     * historically before its void date.
     */
    if (
        creditNote.voidedAt &&
        asOfDate >=
        toDateKey(
            creditNote.voidedAt,
        )
    ) {
        return emptyBalance(
            creditNote.id,
            asOfDate,
            creditTotal,
        );
    }

    const effectiveAllocations =
        allocations.filter(
            (allocation) =>
                allocation.creditNoteId ===
                creditNote.id &&
                allocation.customerId ===
                creditNote.customerId &&
                allocation.allocationDate <=
                asOfDate &&
                isCreditAllocationEffectiveAsAt(
                    allocation,
                    asOfDate,
                ),
        );

    const amountApplied =
        roundCurrency(
            effectiveAllocations.reduce(
                (
                    total,
                    allocation,
                ) =>
                    total +
                    allocation.amount,
                0,
            ),
        );

    const amountAvailable =
        roundCurrency(
            Math.max(
                0,
                creditTotal -
                amountApplied,
            ),
        );

    return {
        creditNoteId:
            creditNote.id,

        asOfDate,

        creditTotal,

        amountApplied,

        amountAvailable,

        activeAllocationCount:
            effectiveAllocations.length,

        isEffective: true,
    };
}

function emptyBalance(
    creditNoteId: string,
    asOfDate: string,
    creditTotal: number,
): CreditNoteBalanceAsAt {
    return {
        creditNoteId,

        asOfDate,

        creditTotal,

        amountApplied: 0,
        amountAvailable: 0,

        activeAllocationCount: 0,

        isEffective: false,
    };
}

function toDateKey(
    value: string,
) {
    return value.slice(
        0,
        10,
    );
}

function roundCurrency(
    value: number,
) {
    return Math.round(
        (value +
            Number.EPSILON) *
        100,
    ) / 100;
}