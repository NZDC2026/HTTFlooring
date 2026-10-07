export type PaymentMethod =
    | "BANK_TRANSFER"
    | "CASH"
    | "CARD"
    | "CHEQUE"
    | "OTHER";

export type PaymentStatus =
    | "RECEIVED"
    | "REVERSED";

export interface Payment {
    id: string;

    paymentNumber: string;

    customerId: string;
    invoiceId: string;

    paymentDate: string;

    amount: number;

    method: PaymentMethod;

    reference?: string;
    notes?: string;

    status: PaymentStatus;

    reversedAt?: string;
    reversalReason?: string;

    createdAt: string;
    updatedAt: string;
}