import type {
    Customer,
} from "../../contacts/types/customer";

import type {
    SalesDocument,
} from "../../sales/types/salesDocument";

import type {
    AgingBuckets,
} from "../../sales/types/accountsReceivable";

import type {
    Payment,
} from "../../sales/types/payment";

import {
    calculateCustomerAccountsReceivable,
} from "../../sales/data/accountsReceivableService";

import type {
    AgedReceivablesReport,
    AgedReceivablesRow,
} from "../types/agedReceivables";

interface BuildAgedReceivablesReportInput {
    customers: Customer[];
    documents: SalesDocument[];
    payments: Payment[];
    asOfDate: string;
}

export function buildAgedReceivablesReport({
    customers,
    documents,
    payments,
    asOfDate,
}: BuildAgedReceivablesReportInput): AgedReceivablesReport {
    const rows: AgedReceivablesRow[] =
        customers
            .filter(
                (customer) =>
                    customer.status !==
                    "INACTIVE",
            )
            .map(
                (customer) => {
                    const ar =
                        calculateCustomerAccountsReceivable(
                            customer,
                            documents,
                            payments,
                            asOfDate,
                        );

                    return {
                        customerId:
                            customer.id,

                        customerCode:
                            customer.code,

                        customerName:
                            customer.businessName,

                        aging:
                            ar.aging,

                        totalOutstanding:
                            ar.totalOutstanding,

                        overdueAmount:
                            ar.overdueAmount,

                        outstandingInvoiceCount:
                            ar.outstandingInvoiceCount,

                        overdueInvoiceCount:
                            ar.overdueInvoiceCount,
                    };
                },
            )
            .filter(
                (row) =>
                    row.totalOutstanding >
                    0,
            )
            .sort(
                (a, b) =>
                    b.totalOutstanding -
                    a.totalOutstanding,
            );

    const aging =
        rows.reduce<AgingBuckets>(
            (
                total,
                row,
            ) => ({
                current:
                    total.current +
                    row.aging.current,

                days1To30:
                    total.days1To30 +
                    row.aging.days1To30,

                days31To60:
                    total.days31To60 +
                    row.aging.days31To60,

                days61To90:
                    total.days61To90 +
                    row.aging.days61To90,

                days90Plus:
                    total.days90Plus +
                    row.aging.days90Plus,
            }),
            {
                current: 0,
                days1To30: 0,
                days31To60: 0,
                days61To90: 0,
                days90Plus: 0,
            },
        );

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

    const totalOutstanding =
        roundCurrency(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.totalOutstanding,
                0,
            ),
        );

    const totalOverdue =
        roundCurrency(
            rows.reduce(
                (
                    total,
                    row,
                ) =>
                    total +
                    row.overdueAmount,
                0,
            ),
        );

    return {
        asOfDate,

        aging:
            normalizedAging,

        totalOutstanding,

        totalOverdue,

        customerCount:
            rows.length,

        overdueCustomerCount:
            rows.filter(
                (row) =>
                    row.overdueAmount >
                    0,
            ).length,

        rows,
    };
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