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
    useSupplierCreditsBySupplier,
} from "./useSupplierCredits";

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

    const credits =
        useSupplierCreditsBySupplier(
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

                    credits,

                    fromDate,

                    toDate,
                },
            );
        },
        [
            supplierId,
            bills,
            payments,
            credits,
            fromDate,
            toDate,
        ],
    );
}