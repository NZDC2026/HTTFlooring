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
    reconcileAccountsPayable,
} from "./accountsPayableReconciliationService";

export function useAccountsPayableReconciliation(
    asOfDate?: string,
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
            reconcileAccountsPayable({
                suppliers,
                bills,
                payments,
                credits,
                creditAllocations,
                asOfDate,
            }),
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