import type {
    Supplier,
} from "../../contacts/types/supplier";

import type {
    SupplierBill,
} from "../../purchases/types/supplierBill";

import type {
    PayableAgingBuckets,
} from "../../purchases/types/accountsPayable";

import {
    calculateSupplierAccountsPayable,
} from "../../purchases/data/accountsPayableService";

import type {
    AgedPayablesReport,
    AgedPayablesRow,
} from "../types/agedPayables";

interface BuildAgedPayablesReportInput {
    suppliers: Supplier[];
    bills: SupplierBill[];
    asOfDate: string;
}

export function buildAgedPayablesReport({
    suppliers,
    bills,
    asOfDate,
}: BuildAgedPayablesReportInput): AgedPayablesReport {
    const rows:
        AgedPayablesRow[] =
        suppliers
            .map(
                (supplier) => {
                    const ap =
                        calculateSupplierAccountsPayable(
                            supplier,
                            bills,
                            asOfDate,
                        );

                    return {
                        supplierId:
                            supplier.id,

                        supplierCode:
                            supplier.code,

                        supplierName:
                            supplier.businessName,

                        aging:
                            ap.aging,

                        totalOutstanding:
                            ap.totalOutstanding,

                        overdueAmount:
                            ap.overdueAmount,

                        outstandingBillCount:
                            ap.outstandingBillCount,

                        overdueBillCount:
                            ap.overdueBillCount,
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
        rows.reduce<PayableAgingBuckets>(
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
        PayableAgingBuckets = {
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

        supplierCount:
            rows.length,

        overdueSupplierCount:
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
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            100,
        ) / 100
    );
}