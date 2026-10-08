import {
    accountRepository,
} from "./accountRepository";

import type {
    JournalEntry,
    JournalEntryDraft,
    JournalLine,
    ReverseJournalEntryInput,
} from "../types/journalEntry";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let journalEntries:
    JournalEntry[] = [];

function emitChange() {
    listeners.forEach(
        (listener) =>
            listener(),
    );
}

function roundCurrency(
    value: number,
) {
    return Math.round(
        (
            value +
            Number.EPSILON
        ) * 100,
    ) / 100;
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

function validateDate(
    value: string,
    label: string,
) {
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            value,
        )
    ) {
        throw new Error(
            `${label} must use YYYY-MM-DD format.`,
        );
    }

    const parsed =
        new Date(
            `${value}T00:00:00Z`,
        );

    if (
        Number.isNaN(
            parsed.getTime(),
        ) ||
        parsed
            .toISOString()
            .slice(
                0,
                10,
            ) !== value
    ) {
        throw new Error(
            `${label} is invalid.`,
        );
    }
}

function createJournalNumber(
    journalDate: string,
) {
    const year =
        journalDate.slice(
            0,
            4,
        );

    const prefix =
        `JE-${year}-`;

    const numbers =
        journalEntries
            .map(
                (entry) =>
                    entry.journalNumber,
            )
            .filter(
                (journalNumber) =>
                    journalNumber.startsWith(
                        prefix,
                    ),
            )
            .map(
                (journalNumber) =>
                    Number.parseInt(
                        journalNumber.slice(
                            prefix.length,
                        ),
                        10,
                    ),
            )
            .filter(
                Number.isFinite,
            );

    const next =
        Math.max(
            0,
            ...numbers,
        ) + 1;

    return `${prefix}${String(
        next,
    ).padStart(
        4,
        "0",
    )}`;
}

function createId(
    prefix: string,
) {
    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

function validateDraft(
    draft:
        JournalEntryDraft,
) {
    validateDate(
        draft.journalDate,
        "Journal date",
    );

    if (
        !draft.description.trim()
    ) {
        throw new Error(
            "Journal description is required.",
        );
    }

    if (
        draft.lines.length <
        2
    ) {
        throw new Error(
            "A journal entry requires at least two lines.",
        );
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (
        const line
        of draft.lines
    ) {
        const account =
            accountRepository
                .requireById(
                    line.accountId,
                );

        if (!account.active) {
            throw new Error(
                `Account ${account.code} ${account.name} is inactive.`,
            );
        }

        if (
            draft.sourceType ===
            "MANUAL_JOURNAL" &&
            !account.allowManualPosting
        ) {
            throw new Error(
                `Manual posting is not allowed for account ${account.code} ${account.name}.`,
            );
        }

        if (
            !Number.isFinite(
                line.debit,
            ) ||
            !Number.isFinite(
                line.credit,
            )
        ) {
            throw new Error(
                "Journal debit and credit values must be valid numbers.",
            );
        }

        const debit =
            roundCurrency(
                line.debit,
            );

        const credit =
            roundCurrency(
                line.credit,
            );

        if (
            debit < 0 ||
            credit < 0
        ) {
            throw new Error(
                "Journal debit and credit values cannot be negative.",
            );
        }

        if (
            debit > 0 &&
            credit > 0
        ) {
            throw new Error(
                "A journal line cannot contain both a debit and a credit.",
            );
        }

        if (
            debit === 0 &&
            credit === 0
        ) {
            throw new Error(
                "A journal line must contain either a debit or a credit.",
            );
        }

        totalDebit =
            roundCurrency(
                totalDebit +
                debit,
            );

        totalCredit =
            roundCurrency(
                totalCredit +
                credit,
            );
    }

    if (
        totalDebit <= 0 ||
        totalCredit <= 0
    ) {
        throw new Error(
            "A journal entry must contain both debit and credit values.",
        );
    }

    if (
        totalDebit !==
        totalCredit
    ) {
        throw new Error(
            "Journal entry is not balanced.",
        );
    }

    return {
        totalDebit,
        totalCredit,
    };
}

function buildLines(
    draft:
        JournalEntryDraft,
): JournalLine[] {
    return draft.lines.map(
        (
            line,
            index,
        ) => {
            const account =
                accountRepository
                    .requireById(
                        line.accountId,
                    );

            return {
                id:
                    createId(
                        `jl_${index + 1}`,
                    ),

                accountId:
                    account.id,

                accountCode:
                    account.code,

                accountName:
                    account.name,

                description:
                    normalizeOptional(
                        line.description,
                    ),

                debit:
                    roundCurrency(
                        line.debit,
                    ),

                credit:
                    roundCurrency(
                        line.credit,
                    ),
            };
        },
    );
}

function findSourceJournal(
    sourceType:
        JournalEntry["sourceType"],

    sourceId:
        string,
) {
    return journalEntries.find(
        (entry) =>
            entry.sourceType ===
            sourceType &&
            entry.sourceId ===
            sourceId &&
            !entry
                .reversedJournalEntryId,
    );
}

export const journalEntryRepository =
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
        JournalEntry[] {
        return journalEntries;
    },

    getAll():
        JournalEntry[] {
        return journalEntries;
    },

    getById(
        journalEntryId:
            string,
    ) {
        return journalEntries.find(
            (entry) =>
                entry.id ===
                journalEntryId,
        );
    },

    getBySource(
        sourceType:
            JournalEntry["sourceType"],

        sourceId:
            string,
    ) {
        return journalEntries.filter(
            (entry) =>
                entry.sourceType ===
                sourceType &&
                entry.sourceId ===
                sourceId,
        );
    },

    findSourceJournal,

    post(
        draft:
            JournalEntryDraft,
    ): JournalEntry {
        const validation =
            validateDraft(
                draft,
            );

        const normalizedSourceId =
            normalizeOptional(
                draft.sourceId,
            );

        if (
            normalizedSourceId
        ) {
            const duplicate =
                findSourceJournal(
                    draft.sourceType,
                    normalizedSourceId,
                );

            if (duplicate) {
                throw new Error(
                    `Journal ${duplicate.journalNumber} already exists for this source transaction.`,
                );
            }
        }

        const now =
            new Date()
                .toISOString();

        const entry:
            JournalEntry = {
            id:
                createId(
                    "je",
                ),

            journalNumber:
                createJournalNumber(
                    draft.journalDate,
                ),

            journalDate:
                draft.journalDate,

            description:
                draft.description.trim(),

            reference:
                normalizeOptional(
                    draft.reference,
                ),

            sourceType:
                draft.sourceType,

            sourceId:
                normalizedSourceId,

            status:
                "POSTED",

            lines:
                buildLines(
                    draft,
                ),

            totalDebit:
                validation.totalDebit,

            totalCredit:
                validation.totalCredit,

            createdAt:
                now,

            updatedAt:
                now,

            postedAt:
                now,
        };

        journalEntries = [
            entry,
            ...journalEntries,
        ];

        emitChange();

        return entry;
    },

    reverse(
        input:
            ReverseJournalEntryInput,
    ): JournalEntry {
        const original =
            journalEntries.find(
                (entry) =>
                    entry.id ===
                    input.journalEntryId,
            );

        if (!original) {
            throw new Error(
                "Journal entry was not found.",
            );
        }

        if (
            original
                .reversedJournalEntryId
        ) {
            throw new Error(
                "A reversal journal cannot be reversed.",
            );
        }

        if (
            original.status ===
            "REVERSED" ||
            original
                .reversalJournalEntryId
        ) {
            throw new Error(
                "Journal entry has already been reversed.",
            );
        }

        validateDate(
            input.reversalDate,
            "Reversal date",
        );

        if (
            input.reversalDate <
            original.journalDate
        ) {
            throw new Error(
                "Reversal date cannot be earlier than the original journal date.",
            );
        }

        const reason =
            input.reason.trim();

        if (
            reason.length < 3
        ) {
            throw new Error(
                "Reversal reason must contain at least 3 characters.",
            );
        }

        const reversalDraft:
            JournalEntryDraft = {
            journalDate:
                input.reversalDate,

            description:
                `Reversal of ${original.journalNumber}: ${original.description}`,

            reference:
                original.reference,

            sourceType:
                original.sourceType,

            lines:
                original.lines.map(
                    (line) => ({
                        accountId:
                            line.accountId,

                        description:
                            line.description,

                        debit:
                            line.credit,

                        credit:
                            line.debit,
                    }),
                ),
        };

        const validation =
            validateDraft(
                reversalDraft,
            );

        const now =
            new Date()
                .toISOString();

        const reversal:
            JournalEntry = {
            id:
                createId(
                    "je",
                ),

            journalNumber:
                createJournalNumber(
                    input.reversalDate,
                ),

            journalDate:
                input.reversalDate,

            description:
                reversalDraft
                    .description,

            reference:
                reversalDraft
                    .reference,

            sourceType:
                original.sourceType,

            status:
                "POSTED",

            lines:
                buildLines(
                    reversalDraft,
                ),

            totalDebit:
                validation.totalDebit,

            totalCredit:
                validation.totalCredit,

            createdAt:
                now,

            updatedAt:
                now,

            postedAt:
                now,

            reversedJournalEntryId:
                original.id,
        };

        const reversedOriginal:
            JournalEntry = {
            ...original,

            status:
                "REVERSED",

            reversedAt:
                now,

            reversalReason:
                reason,

            reversalJournalEntryId:
                reversal.id,

            updatedAt:
                now,
        };

        journalEntries = [
            reversal,

            ...journalEntries.map(
                (entry) =>
                    entry.id ===
                        original.id
                        ? reversedOriginal
                        : entry,
            ),
        ];

        emitChange();

        return reversal;
    },
};