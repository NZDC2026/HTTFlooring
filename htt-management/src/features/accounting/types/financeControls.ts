export type FinanceControlStatus =
    | "PASS"
    | "FAIL";

export interface FinanceControl {
    /** A failed check has no verified amounts; do not display synthetic zeroes. */
    unavailable?: boolean;
    id: string;

    name: string;

    description: string;

    leftLabel: string;
    leftValue: number;

    rightLabel: string;
    rightValue: number;

    difference: number;

    status:
    FinanceControlStatus;

    route?: string;
}

export interface BankFinanceControl {
    reviewRowCount?: number;
    bankAccountId: string;

    bankAccountName: string;

    glAccountId: string;

    registerBalance: number;

    glBalance: number;

    difference: number;

    status:
    FinanceControlStatus;
}

export interface FinanceControlsSummary {
    asOfDate: string;

    controls:
    FinanceControl[];

    bankControls:
    BankFinanceControl[];

    totalControlCount: number;

    passedControlCount: number;

    failedControlCount: number;

    allPassed: boolean;
}