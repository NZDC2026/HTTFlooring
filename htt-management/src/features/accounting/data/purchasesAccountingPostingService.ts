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
    GoodsReceipt,
} from "../../purchases/types/goodsReceipt";


import {
    calculateBaseUnitCost,
    calculateIncomingInventoryValue,
    roundInventoryValue,
} from "../../inventory/data/inventoryCostCalculations";

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

/**
 * Calculate the same incoming inventory value
 * used by Inventory Cost Engine.
 *
 * Each receipt line is rounded independently,
 * matching the cost movement calculation.
 */
function calculateGoodsReceiptValue(
    receipt: GoodsReceipt,
): number {
    return roundInventoryValue(
        receipt.lines.reduce(
            (total, line) => {
                const unitCostBase =
                    calculateBaseUnitCost({
                        transactionUnitCost:
                            line.unitCost,

                        conversionToBase:
                            line.conversionToBase,
                    });

                const lineValue =
                    calculateIncomingInventoryValue({
                        quantityBase:
                            line.receivedBaseQuantity,

                        unitCostBase,
                    });

                return total + lineValue;
            },
            0,
        ),
    );
}

function roundAccountingAmount(
    value: number,
): number {
    return Math.round(
        (value + Number.EPSILON) * 100,
    ) / 100;
}

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
    /**
     * Validate accounting configuration before
     * Goods Receipt changes inventory state.
     */
    validateGoodsReceiptPosting(
        receipt: GoodsReceipt,
    ) {
        const inventoryAccount =
            accountRepository.requireBySystemRole(
                "INVENTORY",
            );

        const grniAccount =
            accountRepository.requireBySystemRole(
                "GRNI",
            );

        if (
            !inventoryAccount.active ||
            inventoryAccount.type !== "ASSET"
        ) {
            throw new Error(
                "Inventory GL account must be an active asset account.",
            );
        }

        if (
            !grniAccount.active ||
            grniAccount.type !== "LIABILITY"
        ) {
            throw new Error(
                "GRNI GL account must be an active liability account.",
            );
        }

        const receiptValue =
            calculateGoodsReceiptValue(
                receipt,
            );

        if (
            !Number.isFinite(receiptValue) ||
            receiptValue <= 0
        ) {
            throw new Error(
                "Goods receipt accounting value must be greater than zero.",
            );
        }

        const parsedDate =
            new Date(
                `${receipt.receiptDate}T00:00:00Z`,
            );

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                receipt.receiptDate,
            ) ||
            Number.isNaN(
                parsedDate.getTime(),
            ) ||
            parsedDate.toISOString().slice(0, 10) !==
            receipt.receiptDate
        ) {
            throw new Error(
                "Goods receipt accounting date is invalid.",
            );
        }

        return {
            inventoryAccountId:
                inventoryAccount.id,

            grniAccountId:
                grniAccount.id,

            receiptValue,
        };
    },

    /**
     * Post:
     *
     * Dr Inventory
     * Cr GRNI
     *
     * One journal per Goods Receipt.
     */
    postGoodsReceipt(
        receipt: GoodsReceipt,
    ) {
        const existing =
            journalEntryRepository
                .getBySource(
                    "GOODS_RECEIPT",
                    receipt.id,
                )
                .find(
                    (entry) =>
                        !entry.reversedJournalEntryId,
                );

        if (existing) {
            return existing;
        }

        const {
            inventoryAccountId,
            grniAccountId,
            receiptValue,
        } =
            this.validateGoodsReceiptPosting(
                receipt,
            );

        return journalEntryRepository.post({
            journalDate:
                receipt.receiptDate,

            description:
                `Goods receipt ${receipt.receiptNumber}`,

            reference:
                receipt.receiptNumber,

            sourceType:
                "GOODS_RECEIPT",

            sourceId:
                receipt.id,

            lines: [
                {
                    accountId:
                        inventoryAccountId,

                    description:
                        `Inventory received - ${receipt.receiptNumber}`,

                    debit:
                        receiptValue,

                    credit:
                        0,
                },

                {
                    accountId:
                        grniAccountId,

                    description:
                        `Goods received not invoiced - ${receipt.receiptNumber}`,

                    debit:
                        0,

                    credit:
                        receiptValue,
                },
            ],
        });
    },

    /**
     * Validate Supplier Bill accounting before
     * purchase order quantities are mutated.
     */
    validateSupplierBillPosting(
        bill: SupplierBill,
        matchedReceiptValue: number = bill.totals.subtotal,
    ) {
        const grniAccount =
            accountRepository
                .requireBySystemRole(
                    "GRNI",
                );

        const gstAccount =
            accountRepository
                .requireBySystemRole(
                    "GST_RECEIVABLE",
                );

        const payableAccount =
            accountRepository
                .requireBySystemRole(
                    "ACCOUNTS_PAYABLE",
                );

        if (
            !grniAccount.active ||
            grniAccount.type !== "LIABILITY"
        ) {
            throw new Error(
                "GRNI account must be an active liability account.",
            );
        }

        if (
            !gstAccount.active ||
            gstAccount.type !== "ASSET"
        ) {
            throw new Error(
                "GST Receivable must be an active asset account.",
            );
        }

        if (
            !payableAccount.active ||
            payableAccount.type !== "LIABILITY"
        ) {
            throw new Error(
                "Accounts Payable must be an active liability account.",
            );
        }

        if (!Number.isFinite(matchedReceiptValue) || matchedReceiptValue < 0) {
            throw new Error("Matched receipt value must be a non-negative finite number.");
        }

        const variance = roundAccountingAmount(bill.totals.subtotal - matchedReceiptValue);
        if (variance !== 0) {
            const ppvAccount = accountRepository.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
            if (!ppvAccount.active || ppvAccount.type !== "EXPENSE") {
                throw new Error("Purchase Price Variance must be an active expense account.");
            }
        }

        const expectedTotal =
            roundAccountingAmount(bill.totals.subtotal + bill.totals.taxAmount);

        if (
            !Number.isFinite(
                expectedTotal,
            ) ||
            !Number.isFinite(
                bill.totals.total,
            ) ||
            Math.abs(
                expectedTotal -
                bill.totals.total,
            ) > 0.01
        ) {
            throw new Error(
                "Supplier Bill accounting totals are not balanced.",
            );
        }

        return { matchedReceiptValue, variance };
    },

    /**
     * 6K-C:
     *
     * Supplier Bill accounting:
     *
     * Dr GRNI
     * Dr GST Receivable
     * Cr Accounts Payable
     *
     * Inventory must not be debited again.
     */
    postSupplierBill(
        bill: SupplierBill,
        matchedReceiptValue?: number,
    ) {
        const existing =
            findOriginalJournal(
                "SUPPLIER_BILL",
                bill.id,
            );

        if (existing) {
            return existing;
        }

        const receiptValue = matchedReceiptValue ?? bill.totals.subtotal;
        const { variance } = this.validateSupplierBillPosting(bill, receiptValue);

        return journalEntryRepository.post({
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
                            "GRNI",
                        ),

                    description:
                        `GRNI cleared - ${bill.billNumber}`,

                    debit:
                        receiptValue,

                    credit:
                        0,
                },

                {
                    accountId:
                        getAccountId(
                            "GST_RECEIVABLE",
                        ),

                    description:
                        `GST - ${bill.billNumber}`,

                    debit:
                        bill.totals.taxAmount,

                    credit:
                        0,
                },

                ...(variance !== 0 ? [{
                    accountId: getAccountId("PURCHASE_PRICE_VARIANCE"),
                    description: `Purchase price variance - ${bill.billNumber}`,
                    debit: variance > 0 ? variance : 0,
                    credit: variance < 0 ? -variance : 0,
                }] : []),
                {
                    accountId:
                        getAccountId(
                            "ACCOUNTS_PAYABLE",
                        ),

                    description:
                        `Supplier payable - ${bill.billNumber}`,

                    debit:
                        0,

                    credit:
                        bill.totals.total,
                },
            ],
        });
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

        const bankAccount =
            bankAccountRepository
                .requireById(
                    payment.bankAccountId,
                );

        if (
            !bankAccount.active
        ) {
            throw new Error(
                "The bank account for this supplier payment is inactive.",
            );
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
                            bankAccount.glAccountId,

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