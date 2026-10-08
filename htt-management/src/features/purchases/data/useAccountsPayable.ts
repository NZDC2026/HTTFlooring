import {
    useMemo,
} from "react";

import {
    useSuppliers,
} from "../../contacts/data/useSuppliers";

import {
    useSupplierBills,
} from "./useSupplierBills";

import {
    useSupplierPayments,
} from "./useSupplierPayments";

import {
    useSupplierCredits,
    useSupplierCreditAllocations,
} from "./useSupplierCredits";

import {
    calculateAccountsPayableSummary,
    calculateSupplierAccountsPayable,
} from "./accountsPayableService";

export function useAccountsPayable(
    asOfDate: string,
) {
    const suppliers =
        useSuppliers();

    const bills =
        useSupplierBills();

    const payments =
        useSupplierPayments();

    const credits =
        useSupplierCredits();

    const creditAllocations =
        useSupplierCreditAllocations();

    return useMemo(
        () =>
            calculateAccountsPayableSummary(
                suppliers,
                bills,
                payments,
                credits,
                creditAllocations,
                asOfDate,
            ),
        [
            suppliers,
            bills,
            payments,
            credits,
            creditAllocations,
            asOfDate,
        ],
    );
}

export function useSupplierAccountsPayable(
    supplierId:
        | string
        | undefined,
    asOfDate: string,
) {
    const suppliers =
        useSuppliers();

    const bills =
        useSupplierBills();

    const payments =
        useSupplierPayments();

    const credits =
        useSupplierCredits();

    const creditAllocations =
        useSupplierCreditAllocations();

    return useMemo(
        () => {
            if (
                !supplierId
            ) {
                return undefined;
            }

            const supplier =
                suppliers.find(
                    (item) =>
                        item.id ===
                        supplierId,
                );

            if (!supplier) {
                return undefined;
            }

            return calculateSupplierAccountsPayable(
                supplier,
                bills,
                payments,
                credits,
                creditAllocations,
                asOfDate,
            );
        },
        [
            suppliers,
            bills,
            payments,
            credits,
            creditAllocations,
            supplierId,
            asOfDate,
        ],
    );
}