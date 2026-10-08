import type { Payment } from "../types/payment";

export const mockPayments: Payment[] =
    [
        {
            id: "payment_001",

            paymentNumber:
                "PAY-2026-0001",

            customerId:
                "cus_001",

            invoiceId:
                "invoice_001",

            paymentDate:
                "2026-10-05",

            amount:
                3000,

            method:
                "BANK_TRANSFER",

            bankAccountId:
                "bank_001",

            reference:
                "BANK-051026-ABC",

            notes:
                "Part payment received.",

            status:
                "RECEIVED",

            createdAt:
                "2026-10-05T03:00:00.000Z",

            updatedAt:
                "2026-10-05T03:00:00.000Z",
        },
    ];