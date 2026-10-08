import type {
    Supplier,
} from "../../contacts/types/supplier";

import type {
    SupplierBill,
} from "../types/supplierBill";

import type {
    SupplierPayment,
} from "../types/supplierPayment";

import type {
    SupplierCredit,
    SupplierCreditAllocation,
} from "../types/supplierCredit";

import type {
    AccountsPayableSummary,
    PayableAgingBuckets,
    SupplierAccountsPayable,
} from "../types/accountsPayable";

import {
    calculateSupplierBillBalanceAsAt,
} from "./supplierBillBalanceAsAtService";

import {
    calculateSupplierCreditBalanceAsAt,
} from "./supplierCreditBalanceAsAtService";

export function calculateSupplierAccountsPayable(
    supplier: Supplier,
    bills: SupplierBill[],
    payments: SupplierPayment[] = [],
    credits: SupplierCredit[] = [],
    creditAllocations:
        SupplierCreditAllocation[] = [],
    asOfDate = getToday(),
): SupplierAccountsPayable {
    const aging =
        createEmptyAging();

    let grossOutstanding = 0;
    let overdueAmount = 0;
    let outstandingBillCount = 0;
    let overdueBillCount = 0;

    const supplierBills =
        bills.filter(
            (bill) =>
                bill.supplierId ===
                supplier.id &&
                bill.billDate <=
                asOfDate,
        );

    for (
        const bill of
        supplierBills
    ) {
        const balance =
            calculateSupplierBillBalanceAsAt(
                bill,
                payments,
                creditAllocations,
                asOfDate,
            );

        const amount =
            balance.amountDue;

        if (
            amount <= 0
        ) {
            continue;
        }

        grossOutstanding +=
            amount;

        outstandingBillCount +=
            1;

        const daysOverdue =
            getDaysOverdue(
                bill.dueDate,
                asOfDate,
            );

        if (
            daysOverdue <= 0
        ) {
            aging.current +=
                amount;

            continue;
        }

        overdueAmount +=
            amount;

        overdueBillCount +=
            1;

        if (
            daysOverdue <= 30
        ) {
            aging.days1To30 +=
                amount;
        } else if (
            daysOverdue <= 60
        ) {
            aging.days31To60 +=
                amount;
        } else if (
            daysOverdue <= 90
        ) {
            aging.days61To90 +=
                amount;
        } else {
            aging.days90Plus +=
                amount;
        }
    }

    const unallocatedCredit =
        roundCurrency(
            credits.reduce(
                (
                    total,
                    credit,
                ) => {
                    if (
                        credit.supplierId !==
                        supplier.id
                    ) {
                        return total;
                    }

                    const balance =
                        calculateSupplierCreditBalanceAsAt(
                            credit,
                            creditAllocations,
                            asOfDate,
                        );

                    return (
                        total +
                        balance.amountAvailable
                    );
                },
                0,
            ),
        );

    const normalizedGross =
        roundCurrency(
            grossOutstanding,
        );

    const netOutstanding =
        roundCurrency(
            normalizedGross -
            unallocatedCredit,
        );

    return {
        supplierId:
            supplier.id,

        grossOutstanding:
            normalizedGross,

        unallocatedCredit,

        totalOutstanding:
            netOutstanding,

        overdueAmount:
            roundCurrency(
                overdueAmount,
            ),

        aging:
            normalizeAging(
                aging,
            ),

        outstandingBillCount,

        overdueBillCount,
    };
}

export function calculateAccountsPayableSummary(
    suppliers: Supplier[],
    bills: SupplierBill[],
    payments: SupplierPayment[] = [],
    credits: SupplierCredit[] = [],
    creditAllocations:
        SupplierCreditAllocation[] = [],
    asOfDate = getToday(),
): AccountsPayableSummary {
    const aging =
        createEmptyAging();

    let grossOutstanding = 0;
    let unallocatedCredit = 0;
    let totalOutstanding = 0;
    let overdueAmount = 0;
    let supplierCount = 0;
    let overdueSupplierCount = 0;
    let outstandingBillCount = 0;
    let overdueBillCount = 0;

    for (
        const supplier of
        suppliers
    ) {
        const payable =
            calculateSupplierAccountsPayable(
                supplier,
                bills,
                payments,
                credits,
                creditAllocations,
                asOfDate,
            );

        if (
            payable.grossOutstanding ===
            0 &&
            payable.unallocatedCredit ===
            0
        ) {
            continue;
        }

        supplierCount += 1;

        grossOutstanding +=
            payable.grossOutstanding;

        unallocatedCredit +=
            payable.unallocatedCredit;

        totalOutstanding +=
            payable.totalOutstanding;

        overdueAmount +=
            payable.overdueAmount;

        outstandingBillCount +=
            payable.outstandingBillCount;

        overdueBillCount +=
            payable.overdueBillCount;

        if (
            payable.overdueAmount >
            0
        ) {
            overdueSupplierCount +=
                1;
        }

        aging.current +=
            payable.aging.current;

        aging.days1To30 +=
            payable.aging.days1To30;

        aging.days31To60 +=
            payable.aging.days31To60;

        aging.days61To90 +=
            payable.aging.days61To90;

        aging.days90Plus +=
            payable.aging.days90Plus;
    }

    return {
        grossOutstanding:
            roundCurrency(
                grossOutstanding,
            ),

        unallocatedCredit:
            roundCurrency(
                unallocatedCredit,
            ),

        totalOutstanding:
            roundCurrency(
                totalOutstanding,
            ),

        overdueAmount:
            roundCurrency(
                overdueAmount,
            ),

        supplierCount,

        overdueSupplierCount,

        outstandingBillCount,

        overdueBillCount,

        aging:
            normalizeAging(
                aging,
            ),
    };
}

export function getDaysOverdue(
    dueDate: string,
    asOfDate = getToday(),
) {
    const due =
        parseDateKey(
            dueDate,
        );

    const asOf =
        parseDateKey(
            asOfDate,
        );

    return Math.floor(
        (
            asOf.getTime() -
            due.getTime()
        ) /
        86_400_000,
    );
}

function createEmptyAging():
    PayableAgingBuckets {
    return {
        current: 0,
        days1To30: 0,
        days31To60: 0,
        days61To90: 0,
        days90Plus: 0,
    };
}

function normalizeAging(
    aging: PayableAgingBuckets,
): PayableAgingBuckets {
    return {
        current:
            roundCurrency(
                aging.current,
            ),

        days1To30:
            roundCurrency(
                aging.days1To30,
            ),

        days31To60:
            roundCurrency(
                aging.days31To60,
            ),

        days61To90:
            roundCurrency(
                aging.days61To90,
            ),

        days90Plus:
            roundCurrency(
                aging.days90Plus,
            ),
    };
}

function parseDateKey(
    value: string,
) {
    return new Date(
        `${value}T00:00:00Z`,
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

function getToday() {
    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        );

    const day =
        String(
            now.getDate(),
        ).padStart(
            2,
            "0",
        );

    return `${year}-${month}-${day}`;
}