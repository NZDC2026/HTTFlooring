import {
    useMemo,
} from "react";

import {
    useSupplierSupplierBills,
} from "./useSupplierBills";

import {
    useSupplierPaymentsBySupplier,
} from "./useSupplierPayments";

import {
    buildSupplierStatement,
} from "./supplierStatementService";

export function useSupplierStatement(
    supplierId:
        | string
        | undefined,

    fromDate: string,

    toDate: string,
) {
    const bills =
        useSupplierSupplierBills(
            supplierId,
        );

    const payments =
        useSupplierPaymentsBySupplier(
            supplierId,
        );

    return useMemo(
        () => {
            if (
                !supplierId ||
                !fromDate ||
                !toDate
            ) {
                return undefined;
            }

            return buildSupplierStatement(
                {
                    supplierId,

                    bills,

                    payments,

                    fromDate,

                    toDate,
                },
            );
        },
        [
            supplierId,
            bills,
            payments,
            fromDate,
            toDate,
        ],
    );
}