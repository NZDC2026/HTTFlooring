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

    return useMemo(
        () =>
            calculateAccountsPayableSummary(
                suppliers,
                bills,
                asOfDate,
            ),
        [
            suppliers,
            bills,
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
                asOfDate,
            );
        },
        [
            suppliers,
            bills,
            supplierId,
            asOfDate,
        ],
    );
}