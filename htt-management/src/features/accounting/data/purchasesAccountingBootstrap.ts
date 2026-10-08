import {
    supplierBillRepository,
} from "../../purchases/data/supplierBillRepository";

import {
    supplierPaymentRepository,
} from "../../purchases/data/supplierPaymentRepository";

import {
    supplierCreditRepository,
} from "../../purchases/data/supplierCreditRepository";

import {
    purchasesAccountingPostingService,
} from "./purchasesAccountingPostingService";

let initialized =
    false;

export function initializePurchasesAccounting() {
    if (initialized) {
        return;
    }

    initialized =
        true;

    const bills =
        supplierBillRepository
            .getAll();

    for (
        const bill
        of bills
    ) {
        purchasesAccountingPostingService
            .postSupplierBill(
                bill,
            );

        if (
            bill.status ===
            "VOID"
        ) {
            purchasesAccountingPostingService
                .reverseSupplierBill(
                    bill,
                );
        }
    }

    const payments =
        supplierPaymentRepository
            .getAll();

    for (
        const payment
        of payments
    ) {
        purchasesAccountingPostingService
            .postSupplierPayment(
                payment,
            );

        if (
            payment.status ===
            "REVERSED"
        ) {
            purchasesAccountingPostingService
                .reverseSupplierPayment(
                    payment,
                );
        }
    }

    const credits =
        supplierCreditRepository
            .getAll();

    for (
        const credit
        of credits
    ) {
        purchasesAccountingPostingService
            .postSupplierCredit(
                credit,
            );

        if (
            credit.status ===
            "VOID"
        ) {
            purchasesAccountingPostingService
                .reverseSupplierCredit(
                    credit,
                );
        }
    }
}