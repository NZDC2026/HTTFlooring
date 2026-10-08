import {
    accountRepository,
} from "./accountRepository";

import {
    journalEntryRepository,
} from "./journalEntryRepository";

import {
    bankAccountRepository,
} from "../../banking/data/bankAccountRepository";

import type {
    CreditNote,
} from "../../sales/types/creditNote";

import type {
    Payment,
} from "../../sales/types/payment";

import type {
    Invoice,
} from "../../sales/types/salesDocument";

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
        // Fall through to the UTC date key.
    }

    return timestamp.slice(
        0,
        10,
    );
}

function findOriginalJournal(
    sourceType:
        "CUSTOMER_INVOICE"
        | "CUSTOMER_PAYMENT"
        | "CREDIT_NOTE",

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
        "CUSTOMER_INVOICE"
        | "CUSTOMER_PAYMENT"
        | "CREDIT_NOTE",

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

export const salesAccountingPostingService =
{
    postInvoice(
        invoice:
            Invoice,
    ) {
        const existing =
            findOriginalJournal(
                "CUSTOMER_INVOICE",
                invoice.id,
            );

        if (existing) {
            return existing;
        }

        return journalEntryRepository.post(
            {
                journalDate:
                    invoice.documentDate,

                description:
                    `Customer invoice ${invoice.documentNumber}`,

                reference:
                    invoice.documentNumber,

                sourceType:
                    "CUSTOMER_INVOICE",

                sourceId:
                    invoice.id,

                lines: [
                    {
                        accountId:
                            getAccountId(
                                "ACCOUNTS_RECEIVABLE",
                            ),

                        description:
                            invoice.documentNumber,

                        debit:
                            invoice.totals.total,

                        credit:
                            0,
                    },

                    {
                        accountId:
                            getAccountId(
                                "SALES_REVENUE",
                            ),

                        description:
                            invoice.documentNumber,

                        debit:
                            0,

                        credit:
                            invoice.totals.subtotal,
                    },

                    {
                        accountId:
                            getAccountId(
                                "GST_PAYABLE",
                            ),

                        description:
                            invoice.documentNumber,

                        debit:
                            0,

                        credit:
                            invoice.totals.taxAmount,
                    },
                ],
            },
        );
    },

    reverseInvoice(
        invoice:
            Invoice,
    ) {
        const original =
            requireOriginalJournal(
                "CUSTOMER_INVOICE",
                invoice.id,
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
                        invoice.voidedAt,
                    ),

                reason:
                    invoice.voidReason ??
                    "Invoice void",
            },
        );
    },

    postPayment(
        payment:
            Payment,
    ) {
        const existing =
            findOriginalJournal(
                "CUSTOMER_PAYMENT",
                payment.id,
            );

        if (existing) {
            return existing;
        }

        const bankAccount =
            bankAccountRepository
                .requireById(
                    payment.bankAccountId,
                );

        if (
            !bankAccount.active
        ) {
            throw new Error(
                "The bank account for this customer payment is inactive.",
            );
        }

        return journalEntryRepository.post(
            {
                journalDate:
                    payment.paymentDate,

                description:
                    `Customer payment ${payment.paymentNumber}`,

                reference:
                    payment.reference ??
                    payment.paymentNumber,

                sourceType:
                    "CUSTOMER_PAYMENT",

                sourceId:
                    payment.id,

                lines: [
                    {
                        accountId:
                            bankAccount.glAccountId,

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
                                "ACCOUNTS_RECEIVABLE",
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

    reversePayment(
        payment:
            Payment,
    ) {
        const original =
            requireOriginalJournal(
                "CUSTOMER_PAYMENT",
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
                    "Customer payment reversal",
            },
        );
    },

    postCreditNote(
        creditNote:
            CreditNote,
    ) {
        const existing =
            findOriginalJournal(
                "CREDIT_NOTE",
                creditNote.id,
            );

        if (existing) {
            return existing;
        }

        return journalEntryRepository.post(
            {
                journalDate:
                    creditNote.creditDate,

                description:
                    `Credit note ${creditNote.creditNoteNumber}`,

                reference:
                    creditNote.creditNoteNumber,

                sourceType:
                    "CREDIT_NOTE",

                sourceId:
                    creditNote.id,

                lines: [
                    {
                        accountId:
                            getAccountId(
                                "SALES_REVENUE",
                            ),

                        description:
                            creditNote.creditNoteNumber,

                        debit:
                            creditNote.totals.subtotal,

                        credit:
                            0,
                    },

                    {
                        accountId:
                            getAccountId(
                                "GST_PAYABLE",
                            ),

                        description:
                            creditNote.creditNoteNumber,

                        debit:
                            creditNote.totals.taxAmount,

                        credit:
                            0,
                    },

                    {
                        accountId:
                            getAccountId(
                                "ACCOUNTS_RECEIVABLE",
                            ),

                        description:
                            creditNote.creditNoteNumber,

                        debit:
                            0,

                        credit:
                            creditNote.totals.total,
                    },
                ],
            },
        );
    },

    reverseCreditNote(
        creditNote:
            CreditNote,
    ) {
        const original =
            requireOriginalJournal(
                "CREDIT_NOTE",
                creditNote.id,
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
                        creditNote.voidedAt,
                    ),

                reason:
                    creditNote.voidReason ??
                    "Credit note void",
            },
        );
    },
};