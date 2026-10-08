import {
    supplierBillRepository,
} from "./supplierBillRepository";

import {
    supplierPaymentRepository,
} from "./supplierPaymentRepository";

import {
    supplierCreditRepository,
} from "./supplierCreditRepository";

import {
    purchasesAccountingPostingService,
} from "../../accounting/data/purchasesAccountingPostingService";

import type {
    SupplierBill,
} from "../types/supplierBill";

export function voidSupplierBill(
    supplierBillId: string,
    reason: string,
): SupplierBill {
    const bill =
        supplierBillRepository.getById(
            supplierBillId,
        );

    if (!bill) {
        throw new Error(
            "Supplier bill was not found.",
        );
    }

    if (
        bill.status ===
        "VOID"
    ) {
        throw new Error(
            "This supplier bill has already been voided.",
        );
    }

    const normalizedReason =
        reason.trim();

    if (
        normalizedReason.length <
        3
    ) {
        throw new Error(
            "A void reason is required.",
        );
    }

    /*
     * ACTIVE PAYMENTS
     *
     * A bill cannot disappear from Accounts
     * Payable while supplier money remains
     * allocated to it.
     *
     * Reversed payments are historical only
     * and do not block the void.
     */
    const activePayments =
        supplierPaymentRepository
            .getByBill(
                bill.id,
            )
            .filter(
                (payment) =>
                    payment.status ===
                    "POSTED",
            );

    if (
        activePayments.length >
        0
    ) {
        throw new Error(
            "This supplier bill has active payments. Reverse all active payments before voiding the bill.",
        );
    }

    /*
     * ACTIVE CREDIT ALLOCATIONS
     *
     * Allocation must be reversed before the
     * bill can be voided.
     */
    const activeCreditAllocations =
        supplierCreditRepository
            .getAllocationsByBill(
                bill.id,
            )
            .filter(
                (allocation) =>
                    allocation.status ===
                    "APPLIED",
            );

    if (
        activeCreditAllocations.length >
        0
    ) {
        throw new Error(
            "This supplier bill has applied supplier credits. Reverse all active credit allocations before voiding the bill.",
        );
    }

    /*
     * SOURCE SUPPLIER CREDITS
     *
     * A Supplier Credit created FROM this bill
     * must also be voided first.
     *
     * Otherwise the bill could be removed from
     * AP while a credit created from that bill
     * continues reducing AP.
     */
    const activeSourceCredits =
        supplierCreditRepository
            .getBySourceBill(
                bill.id,
            )
            .filter(
                (credit) =>
                    credit.status !==
                    "VOID",
            );

    if (
        activeSourceCredits.length >
        0
    ) {
        throw new Error(
            "This supplier bill has active supplier credits created from it. Void those supplier credits before voiding the bill.",
        );
    }

    /*
     * All cross-document validation has now
     * passed.
     *
     * Repository performs the actual lifecycle
     * mutation and restores PO billed quantity.
     */
    const voided =
        supplierBillRepository.markVoid(
            bill.id,
            normalizedReason,
        );

    purchasesAccountingPostingService
        .reverseSupplierBill(
            voided,
        );

    return voided;
}