export type AccountType =
    | "ASSET"
    | "LIABILITY"
    | "EQUITY"
    | "REVENUE"
    | "EXPENSE";

export type AccountSystemRole =
    | "BANK"
    | "ACCOUNTS_RECEIVABLE"
    | "INVENTORY"
    | "GST_RECEIVABLE"
    | "ACCOUNTS_PAYABLE"
    | "GST_PAYABLE"
    | "SALES_REVENUE"
    | "COST_OF_GOODS_SOLD"
    | "PURCHASES"
    | "FREIGHT"
    | "OPERATING_EXPENSE"
    | "RETAINED_EARNINGS"
    | "OWNERS_EQUITY";

export interface Account {
    id: string;

    code: string;
    name: string;

    type: AccountType;

    systemRole?:
    AccountSystemRole;

    description?: string;

    active: boolean;

    allowManualPosting: boolean;

    createdAt: string;
    updatedAt: string;
}