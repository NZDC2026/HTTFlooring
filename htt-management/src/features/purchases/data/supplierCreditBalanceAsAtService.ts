import type {
    SupplierCredit,
    SupplierCreditAllocation,
} from "../types/supplierCredit";

export interface SupplierCreditBalanceAsAt {
    total: number;

    amountApplied: number;

    amountAvailable: number;
}

export function calculateSupplierCreditBalanceAsAt(
    credit: SupplierCredit,
    allocations:
        SupplierCreditAllocation[],
    asOfDate: string,
): SupplierCreditBalanceAsAt {
    if (
        credit.creditDate >
        asOfDate
    ) {
        return {
            total: 0,
            amountApplied: 0,
            amountAvailable: 0,
        };
    }

    /*
     * A void credit existed historically
     * until its actual void date.
     */
    if (
        credit.status ===
        "VOID" &&
        credit.voidedAt &&
        toDateKey(
            credit.voidedAt,
        ) <= asOfDate
    ) {
        return {
            total: 0,
            amountApplied: 0,
            amountAvailable: 0,
        };
    }

    const total =
        roundCurrency(
            credit.totals.total,
        );

    const amountApplied =
        roundCurrency(
            allocations.reduce(
                (
                    applied,
                    allocation,
                ) => {
                    if (
                        allocation.supplierCreditId !==
                        credit.id ||
                        allocation.allocationDate >
                        asOfDate
                    ) {
                        return applied;
                    }

                    if (
                        allocation.status ===
                        "REVERSED" &&
                        allocation.reversedAt &&
                        toDateKey(
                            allocation.reversedAt,
                        ) <= asOfDate
                    ) {
                        return applied;
                    }

                    return (
                        applied +
                        allocation.amount
                    );
                },
                0,
            ),
        );

    return {
        total,

        amountApplied,

        amountAvailable:
            roundCurrency(
                Math.max(
                    0,
                    total -
                    amountApplied,
                ),
            ),
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
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            100,
        ) / 100
    );
}