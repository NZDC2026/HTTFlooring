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
    reconcileAccountsPayable,
} from "./accountsPayableReconciliationService";

export function useAccountsPayableReconciliation() {
    const suppliers =
        useSuppliers();

    const bills =
        useSupplierBills();

    const payments =
        useSupplierPayments();

    return useMemo(
        () =>
            reconcileAccountsPayable({
                suppliers,
                bills,
                payments,
            }),
        [
            suppliers,
            bills,
            payments,
        ],
    );
}