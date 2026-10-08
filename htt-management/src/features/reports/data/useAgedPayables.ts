import {
    useMemo,
} from "react";

import {
    useSuppliers,
} from "../../contacts/data/useSuppliers";

import {
    useSupplierBills,
} from "../../purchases/data/useSupplierBills";

import {
    useSupplierPayments,
} from "../../purchases/data/useSupplierPayments";

import {
    useSupplierCredits,
    useSupplierCreditAllocations,
} from "../../purchases/data/useSupplierCredits";

import {
    buildAgedPayablesReport,
} from "./agedPayablesService";

export function useAgedPayables(
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
            buildAgedPayablesReport({
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