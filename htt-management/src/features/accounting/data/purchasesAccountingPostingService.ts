import {
    accountRepository,
} from "./accountRepository";

import {
    journalEntryRepository,
} from "./journalEntryRepository";

import type {
    SupplierBill,
} from "../../purchases/types/supplierBill";

import type {
    SupplierPayment,
} from "../../purchases/types/supplierPayment";

import type {
    SupplierCredit,
} from "../../purchases/types/supplierCredit";

type PurchaseAccountingSourceType =
    | "SUPPLIER_BILL"
    | "SUPPLIER_PAYMENT"
    | "SUPPLIER_CREDIT";

function getAccountId(
    systemRole:
        Parameters<
            typeof accountRepository.requireBySystemRole
        >[0],
) {
    return accountRepository
        .requireBySystemRole(
            systemRole,
        )
        .id;
}

function getDateKeyFromTimestamp(
    timestamp:
        string
        | undefined,
) {
    if (!timestamp) {
        throw new Error(
            "Accounting lifecycle timestamp is required.",
        );
    }

    const date =
        new Date(
            timestamp,
        );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        throw new Error(
            "Accounting lifecycle timestamp is invalid.",
        );
    }

    try {
        const parts =
            new Intl.DateTimeFormat(
                "en-CA",
                {
                    timeZone:
                        "Pacific/Auckland",

                    year:
                        "numeric",

                    month:
                        "2-digit",

                    day:
                        "2-digit",
                },
            ).formatToParts(
                date,
            );

        const year =
            parts.find(
                (part) =>
                    part.type ===
                    "year",
            )?.value;

        const month =
            parts.find(
                (part) =>
                    part.type ===
                    "month",
            )?.value;

        const day =
            parts.find(
                (part) =>
                    part.type ===
                    "day",
            )?.value;

        if (
            year &&
            month &&
            day
        ) {
            return `${year}-${month}-${day}`;
        }
    } catch {
        // Fall through to UTC date key.
    }

    return timestamp.slice(
        0,
        10,
    );
}

function findOriginalJournal(
    sourceType:
        PurchaseAccountingSourceType,

    sourceId:
        string,
) {
    return journalEntryRepository
        .getBySource(
            sourceType,
            sourceId,
        )
        .find(
            (entry) =>
                !entry
                    .reversedJournalEntryId,
        );
}

function requireOriginalJournal(
    sourceType:
        PurchaseAccountingSourceType,

    sourceId:
        string,
) {
    const journal =
        findOriginalJournal(
            sourceType,
            sourceId,
        );

    if (!journal) {
        throw new Error(
            `Accounting journal for ${sourceType} ${sourceId} was not found.`,
        );
    }

    return journal;
}

export const purchasesAccountingPostingService =
{
    postSupplierBill(
        bill:
            SupplierBill,
    ) {
        const existing =
            findOriginalJournal(
                "SUPPLIER_BILL",
                bill.id,
            );

        if (existing) {
            return existing;
        }

        return journalEntryRepository.post(
            {
                journalDate:
                    bill.billDate,

                description:
                    `Supplier bill ${bill.billNumber}`,

                reference:
                    bill.supplierInvoiceNumber,

                sourceType:
                    "SUPPLIER_BILL",

                sourceId:
                    bill.id,

                lines: [
                    {
                        accountId:
                            getAccountId(
                                "INVENTORY",
                            ),

                        description:
                            bill.billNumber,

                        debit:
                            bill.totals.subtotal,

                        credit:
                            0,
                    },

                    {
                        accountId:
                            getAccountId(
                                "GST_RECEIVABLE",
                            ),

                        description:
                            bill.billNumber,

                        debit:
                            bill.totals.taxAmount,

                        credit:
                            0,
                    },

                    {
                        accountId:
                            getAccountId(
                                "ACCOUNTS_PAYABLE",
                            ),

                        description:
                            bill.billNumber,

                        debit:
                            0,

                        credit:
                            bill.totals.total,
                    },
                ],
            },
        );
    },

    reverseSupplierBill(
        bill:
            SupplierBill,
    ) {
        const original =
            requireOriginalJournal(
                "SUPPLIER_BILL",
                bill.id,
            );

        if (
            original.status ===
            "REVERSED"
        ) {
            return original
                .reversalJournalEntryId
                ? journalEntryRepository
                    .getById(
                        original
                            .reversalJournalEntryId,
                    )
                : undefined;
        }

        return journalEntryRepository.reverse(
            {
                journalEntryId:
                    original.id,

                reversalDate:
                    getDateKeyFromTimestamp(
                        bill.voidedAt,
                    ),

                reason:
                    bill.voidReason ??
                    "Supplier bill void",
            },
        );
    },

    postSupplierPayment(
        payment:
            SupplierPayment,
    ) {
        const existing =
            findOriginalJournal(
                "SUPPLIER_PAYMENT",
                payment.id,
            );

        if (existing) {
            return existing;
        }

        return journalEntryRepository.post(
            {
                journalDate:
                    payment.paymentDate,

                description:
                    `Supplier payment ${payment.paymentNumber}`,

                reference:
                    payment.reference ??
                    payment.paymentNumber,

                sourceType:
                    "SUPPLIER_PAYMENT",

                sourceId:
                    payment.id,

                lines: [
                    {
                        accountId:
                            getAccountId(
                                "ACCOUNTS_PAYABLE",
                            ),

                        description:
                            payment.paymentNumber,

                        debit:
                            payment.amount,

                        credit:
                            0,
                    },

                    {
                        accountId:
                            getAccountId(
                                "BANK",
                            ),

                        description:
                            payment.paymentNumber,

                        debit:
                            0,

                        credit:
                            payment.amount,
                    },
                ],
            },
        );
    },

    reverseSupplierPayment(
        payment:
            SupplierPayment,
    ) {
        const original =
            requireOriginalJournal(
                "SUPPLIER_PAYMENT",
                payment.id,
            );

        if (
            original.status ===
            "REVERSED"
        ) {
            return original
                .reversalJournalEntryId
                ? journalEntryRepository
                    .getById(
                        original
                            .reversalJournalEntryId,
                    )
                : undefined;
        }

        return journalEntryRepository.reverse(
            {
                journalEntryId:
                    original.id,

                reversalDate:
                    getDateKeyFromTimestamp(
                        payment.reversedAt,
                    ),

                reason:
                    payment.reversalReason ??
                    "Supplier payment reversal",
            },
        );
    },

    postSupplierCredit(
        credit:
            SupplierCredit,
    ) {
        const existing =
            findOriginalJournal(
                "SUPPLIER_CREDIT",
                credit.id,
            );

        if (existing) {
            return existing;
        }

        return journalEntryRepository.post(
            {
                journalDate:
                    credit.creditDate,

                description:
                    `Supplier credit ${credit.creditNumber}`,

                reference:
                    credit.supplierCreditNumber,

                sourceType:
                    "SUPPLIER_CREDIT",

                sourceId:
                    credit.id,

                lines: [
                    {
                        accountId:
                            getAccountId(
                                "ACCOUNTS_PAYABLE",
                            ),

                        description:
                            credit.creditNumber,

                        debit:
                            credit.totals.total,

                        credit:
                            0,
                    },

                    {
                        accountId:
                            getAccountId(
                                "INVENTORY",
                            ),

                        description:
                            credit.creditNumber,

                        debit:
                            0,

                        credit:
                            credit.totals.subtotal,
                    },

                    {
                        accountId:
                            getAccountId(
                                "GST_RECEIVABLE",
                            ),

                        description:
                            credit.creditNumber,

                        debit:
                            0,

                        credit:
                            credit.totals.taxAmount,
                    },
                ],
            },
        );
    },

    reverseSupplierCredit(
        credit:
            SupplierCredit,
    ) {
        const original =
            requireOriginalJournal(
                "SUPPLIER_CREDIT",
                credit.id,
            );

        if (
            original.status ===
            "REVERSED"
        ) {
            return original
                .reversalJournalEntryId
                ? journalEntryRepository
                    .getById(
                        original
                            .reversalJournalEntryId,
                    )
                : undefined;
        }

        return journalEntryRepository.reverse(
            {
                journalEntryId:
                    original.id,

                reversalDate:
                    getDateKeyFromTimestamp(
                        credit.voidedAt,
                    ),

                reason:
                    credit.voidReason ??
                    "Supplier credit void",
            },
        );
    },
};