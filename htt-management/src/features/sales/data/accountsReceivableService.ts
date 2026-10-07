import type {
    Customer,
} from "../../contacts/types/customer";

import type {
    Invoice,
    SalesDocument,
} from "../types/salesDocument";

import type {
    AgingBuckets,
    CustomerAccountsReceivable,
} from "../types/accountsReceivable";

import type {
    Payment,
} from "../types/payment";

import type {
    CreditAllocation,
} from "../types/creditNote";

import {
    calculateInvoiceBalanceAsAt,
} from "./invoiceBalanceAsAtService";

export function calculateCustomerAccountsReceivable(
    customer: Customer,
    documents: SalesDocument[],
    payments: Payment[] = [],
    creditAllocations:
        CreditAllocation[] = [],
    asOfDate = getToday(),
): CustomerAccountsReceivable {
    const invoices =
        documents.filter(
            (
                document,
            ): document is Invoice =>
                document.type ===
                "INVOICE" &&
                document.customerId ===
                customer.id &&
                document.documentDate <=
                asOfDate,
        );

    const aging: AgingBuckets = {
        current: 0,
        days1To30: 0,
        days31To60: 0,
        days61To90: 0,
        days90Plus: 0,
    };

    let totalOutstanding = 0;
    let overdueAmount = 0;
    let outstandingInvoiceCount = 0;
    let overdueInvoiceCount = 0;

    for (
        const invoice of invoices
    ) {
        const balance =
            calculateInvoiceBalanceAsAt(
                invoice,
                payments,
                creditAllocations,
                asOfDate,
            );;

        const amount =
            balance.amountDue;

        /*
         * Fully paid as at the selected date.
         */
        if (
            amount <= 0
        ) {
            continue;
        }

        outstandingInvoiceCount +=
            1;

        totalOutstanding +=
            amount;

        const daysOverdue =
            getDaysOverdue(
                invoice.dueDate,
                asOfDate,
            );

        /*
         * Not yet due or due today.
         */
        if (
            daysOverdue <= 0
        ) {
            aging.current +=
                amount;

            continue;
        }

        /*
         * Anything past due contributes
         * to overdue totals.
         */
        overdueAmount +=
            amount;

        overdueInvoiceCount +=
            1;

        if (
            daysOverdue <= 30
        ) {
            aging.days1To30 +=
                amount;

            continue;
        }

        if (
            daysOverdue <= 60
        ) {
            aging.days31To60 +=
                amount;

            continue;
        }

        if (
            daysOverdue <= 90
        ) {
            aging.days61To90 +=
                amount;

            continue;
        }

        aging.days90Plus +=
            amount;
    }

    const normalizedAging:
        AgingBuckets = {
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

    const normalizedOutstanding =
        roundCurrency(
            totalOutstanding,
        );

    const normalizedOverdue =
        roundCurrency(
            overdueAmount,
        );

    return {
        customerId:
            customer.id,

        totalOutstanding:
            normalizedOutstanding,

        overdueAmount:
            normalizedOverdue,

        creditLimit:
            customer.creditLimit,

        availableCredit:
            roundCurrency(
                Math.max(
                    0,
                    customer.creditLimit -
                    normalizedOutstanding,
                ),
            ),

        aging:
            normalizedAging,

        outstandingInvoiceCount,

        overdueInvoiceCount,
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

    const millisecondsPerDay =
        24 *
        60 *
        60 *
        1000;

    return Math.floor(
        (asOf.getTime() -
            due.getTime()) /
        millisecondsPerDay,
    );
}

function parseDateKey(
    value: string,
) {
    const [
        year,
        month,
        day,
    ] = value
        .split("-")
        .map(Number);

    return new Date(
        Date.UTC(
            year,
            month - 1,
            day,
        ),
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

function roundCurrency(
    value: number,
) {
    return Math.round(
        (value +
            Number.EPSILON) *
        100,
    ) / 100;
}