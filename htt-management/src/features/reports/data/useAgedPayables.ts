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
    buildAgedPayablesReport,
} from "./agedPayablesService";

export function useAgedPayables(
    asOfDate: string,
) {
    const suppliers =
        useSuppliers();

    const bills =
        useSupplierBills();

    return useMemo(
        () =>
            buildAgedPayablesReport(
                {
                    suppliers,
                    bills,
                    asOfDate,
                },
            ),
        [
            suppliers,
            bills,
            asOfDate,
        ],
    );
}