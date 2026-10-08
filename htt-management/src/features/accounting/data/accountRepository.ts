import type {
    Account,
    AccountSystemRole,
    AccountType,
} from "../types/account";

type Listener = () => void;

export interface CreateAccountInput {
    code: string;
    name: string;
    type: AccountType;

    systemRole?:
    AccountSystemRole;

    description?: string;

    active: boolean;

    allowManualPosting: boolean;
}

export interface UpdateAccountInput {
    code: string;
    name: string;
    type: AccountType;

    description?: string;

    active: boolean;

    allowManualPosting: boolean;
}

const listeners =
    new Set<Listener>();

const now =
    "2026-10-08T00:00:00.000Z";

let accounts:
    Account[] = [
        {
            id: "acc_1000",
            code: "1000",
            name: "Bank",
            type: "ASSET",
            systemRole: "BANK",
            active: true,
            allowManualPosting: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_1100",
            code: "1100",
            name: "Accounts Receivable",
            type: "ASSET",
            systemRole:
                "ACCOUNTS_RECEIVABLE",
            active: true,
            allowManualPosting: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_1200",
            code: "1200",
            name: "Inventory",
            type: "ASSET",
            systemRole:
                "INVENTORY",
            active: true,
            allowManualPosting: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_1300",
            code: "1300",
            name: "GST Receivable",
            type: "ASSET",
            systemRole:
                "GST_RECEIVABLE",
            active: true,
            allowManualPosting: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_2000",
            code: "2000",
            name: "Accounts Payable",
            type: "LIABILITY",
            systemRole:
                "ACCOUNTS_PAYABLE",
            active: true,
            allowManualPosting: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_2100",
            code: "2100",
            name: "GST Payable",
            type: "LIABILITY",
            systemRole:
                "GST_PAYABLE",
            active: true,
            allowManualPosting: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_3000",
            code: "3000",
            name: "Owner's Equity",
            type: "EQUITY",
            systemRole:
                "OWNERS_EQUITY",
            active: true,
            allowManualPosting: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_3100",
            code: "3100",
            name: "Retained Earnings",
            type: "EQUITY",
            systemRole:
                "RETAINED_EARNINGS",
            active: true,
            allowManualPosting: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_4000",
            code: "4000",
            name: "Sales Revenue",
            type: "REVENUE",
            systemRole:
                "SALES_REVENUE",
            active: true,
            allowManualPosting: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_5000",
            code: "5000",
            name: "Cost of Goods Sold",
            type: "EXPENSE",
            systemRole:
                "COST_OF_GOODS_SOLD",
            active: true,
            allowManualPosting: false,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_5100",
            code: "5100",
            name: "Purchases / Materials",
            type: "EXPENSE",
            systemRole:
                "PURCHASES",
            active: true,
            allowManualPosting: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_5200",
            code: "5200",
            name: "Freight",
            type: "EXPENSE",
            systemRole:
                "FREIGHT",
            active: true,
            allowManualPosting: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "acc_5300",
            code: "5300",
            name: "Operating Expenses",
            type: "EXPENSE",
            systemRole:
                "OPERATING_EXPENSE",
            active: true,
            allowManualPosting: true,
            createdAt: now,
            updatedAt: now,
        },
    ];

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
}

function normalizeRequired(
    value: string,
    label: string,
) {
    const normalized =
        value.trim();

    if (!normalized) {
        throw new Error(
            `${label} is required.`,
        );
    }

    return normalized;
}

function normalizeOptional(
    value:
        | string
        | undefined,
) {
    const normalized =
        value?.trim();

    return normalized
        ? normalized
        : undefined;
}

function validateCode(
    code: string,
) {
    if (
        !/^[A-Za-z0-9.-]+$/.test(
            code,
        )
    ) {
        throw new Error(
            "Account code may only contain letters, numbers, dots and hyphens.",
        );
    }
}

function validateUniqueCode(
    code: string,
    excludeAccountId?:
        string,
) {
    const duplicate =
        accounts.find(
            (account) =>
                account.id !==
                excludeAccountId &&
                account.code
                    .toLowerCase() ===
                code.toLowerCase(),
        );

    if (duplicate) {
        throw new Error(
            `Account code ${code} already exists.`,
        );
    }
}

function validateUniqueSystemRole(
    systemRole:
        | AccountSystemRole
        | undefined,

    excludeAccountId?:
        string,
) {
    if (!systemRole) {
        return;
    }

    const duplicate =
        accounts.find(
            (account) =>
                account.id !==
                excludeAccountId &&
                account.systemRole ===
                systemRole,
        );

    if (duplicate) {
        throw new Error(
            `System role ${systemRole} is already assigned to account ${duplicate.code}.`,
        );
    }
}

function createAccountId() {
    return `acc_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

export const accountRepository =
{
    subscribe(
        listener: Listener,
    ) {
        listeners.add(
            listener,
        );

        return () => {
            listeners.delete(
                listener,
            );
        };
    },

    getSnapshot():
        Account[] {
        return accounts;
    },

    getAll():
        Account[] {
        return accounts;
    },

    getById(
        accountId: string,
    ) {
        return accounts.find(
            (account) =>
                account.id ===
                accountId,
        );
    },

    getByCode(
        code: string,
    ) {
        return accounts.find(
            (account) =>
                account.code
                    .toLowerCase() ===
                code
                    .trim()
                    .toLowerCase(),
        );
    },

    getBySystemRole(
        systemRole:
            AccountSystemRole,
    ) {
        return accounts.find(
            (account) =>
                account.systemRole ===
                systemRole,
        );
    },

    requireById(
        accountId: string,
    ): Account {
        const account =
            accounts.find(
                (item) =>
                    item.id ===
                    accountId,
            );

        if (!account) {
            throw new Error(
                "Accounting account was not found.",
            );
        }

        return account;
    },

    requireBySystemRole(
        systemRole:
            AccountSystemRole,
    ): Account {
        const account =
            accounts.find(
                (item) =>
                    item.systemRole ===
                    systemRole,
            );

        if (!account) {
            throw new Error(
                `Accounting account for system role ${systemRole} was not found.`,
            );
        }

        return account;
    },

    create(
        input:
            CreateAccountInput,
    ): Account {
        const code =
            normalizeRequired(
                input.code,
                "Account code",
            );

        const name =
            normalizeRequired(
                input.name,
                "Account name",
            );

        validateCode(
            code,
        );

        validateUniqueCode(
            code,
        );

        validateUniqueSystemRole(
            input.systemRole,
        );

        const timestamp =
            new Date()
                .toISOString();

        const account:
            Account = {
            id:
                createAccountId(),

            code,
            name,

            type:
                input.type,

            systemRole:
                input.systemRole,

            description:
                normalizeOptional(
                    input.description,
                ),

            active:
                input.active,

            allowManualPosting:
                input.allowManualPosting,

            createdAt:
                timestamp,

            updatedAt:
                timestamp,
        };

        accounts = [
            ...accounts,
            account,
        ].sort(
            (
                first,
                second,
            ) =>
                first.code.localeCompare(
                    second.code,
                    undefined,
                    {
                        numeric: true,
                    },
                ),
        );

        emitChange();

        return account;
    },

    update(
        accountId: string,
        input:
            UpdateAccountInput,
    ): Account {
        const existing =
            accounts.find(
                (account) =>
                    account.id ===
                    accountId,
            );

        if (!existing) {
            throw new Error(
                "Accounting account was not found.",
            );
        }

        const code =
            normalizeRequired(
                input.code,
                "Account code",
            );

        const name =
            normalizeRequired(
                input.name,
                "Account name",
            );

        validateCode(
            code,
        );

        validateUniqueCode(
            code,
            accountId,
        );

        if (
            existing.systemRole &&
            input.type !==
            existing.type
        ) {
            throw new Error(
                "The account type of a system control account cannot be changed.",
            );
        }

        const updated:
            Account = {
            ...existing,

            code,
            name,

            type:
                input.type,

            description:
                normalizeOptional(
                    input.description,
                ),

            active:
                existing.systemRole
                    ? true
                    : input.active,

            allowManualPosting:
                existing.systemRole
                    ? existing
                        .allowManualPosting
                    : input
                        .allowManualPosting,

            updatedAt:
                new Date()
                    .toISOString(),
        };

        accounts =
            accounts
                .map(
                    (account) =>
                        account.id ===
                            accountId
                            ? updated
                            : account,
                )
                .sort(
                    (
                        first,
                        second,
                    ) =>
                        first.code.localeCompare(
                            second.code,
                            undefined,
                            {
                                numeric: true,
                            },
                        ),
                );

        emitChange();

        return updated;
    },

    setActive(
        accountId: string,
        active: boolean,
    ): Account {
        const account =
            accounts.find(
                (item) =>
                    item.id ===
                    accountId,
            );

        if (!account) {
            throw new Error(
                "Accounting account was not found.",
            );
        }

        if (
            account.systemRole &&
            !active
        ) {
            throw new Error(
                "System control accounts cannot be deactivated.",
            );
        }

        if (
            account.active ===
            active
        ) {
            return account;
        }

        const updated:
            Account = {
            ...account,

            active,

            updatedAt:
                new Date()
                    .toISOString(),
        };

        accounts =
            accounts.map(
                (item) =>
                    item.id ===
                        accountId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },
};