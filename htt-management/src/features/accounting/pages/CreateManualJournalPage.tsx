import {
    useMemo,
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import {
    ArrowLeft,
    Plus,
    Trash2,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    Button,
} from "../../../components/ui/Button";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import {
    Input,
} from "../../../components/ui/Input";

import {
    useAccounts,
} from "../data/useAccounting";

import {
    journalEntryRepository,
} from "../data/journalEntryRepository";

interface ManualJournalLine {
    id: string;

    accountId: string;

    description: string;

    debit: string;
    credit: string;
}

function createLine(
    index:
        number,
): ManualJournalLine {
    return {
        id:
            `manual_line_${index}`,

        accountId:
            "",

        description:
            "",

        debit:
            "",

        credit:
            "",
    };
}

function roundCurrency(
    value:
        number,
) {
    return Math.round(
        (
            value +
            Number.EPSILON
        ) * 100,
    ) / 100;
}

export function CreateManualJournalPage() {
    const navigate =
        useNavigate();

    const accounts =
        useAccounts();

    const manualAccounts =
        useMemo(
            () =>
                accounts
                    .filter(
                        (account) =>
                            account.active &&
                            account
                                .allowManualPosting,
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
                                    numeric:
                                        true,
                                },
                            ),
                    ),
            [
                accounts,
            ],
        );

    const [
        journalDate,
        setJournalDate,
    ] = useState(
        getToday(),
    );

    const [
        description,
        setDescription,
    ] = useState(
        "",
    );

    const [
        reference,
        setReference,
    ] = useState(
        "",
    );

    const [
        lines,
        setLines,
    ] =
        useState<
            ManualJournalLine[]
        >([
            createLine(
                1,
            ),
            createLine(
                2,
            ),
        ]);

    const [
        nextLineNumber,
        setNextLineNumber,
    ] = useState(
        3,
    );

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(
            null,
        );

    const totalDebit =
        roundCurrency(
            lines.reduce(
                (
                    total,
                    line,
                ) =>
                    total +
                    parseAmount(
                        line.debit,
                    ),
                0,
            ),
        );

    const totalCredit =
        roundCurrency(
            lines.reduce(
                (
                    total,
                    line,
                ) =>
                    total +
                    parseAmount(
                        line.credit,
                    ),
                0,
            ),
        );

    const difference =
        roundCurrency(
            totalDebit -
            totalCredit,
        );

    const balanced =
        totalDebit >
        0 &&
        totalCredit >
        0 &&
        difference ===
        0;

    function updateLine(
        lineId:
            string,

        changes:
            Partial<
                ManualJournalLine
            >,
    ) {
        setLines(
            (
                current,
            ) =>
                current.map(
                    (
                        line,
                    ) =>
                        line.id ===
                            lineId
                            ? {
                                ...line,
                                ...changes,
                            }
                            : line,
                ),
        );

        setError(
            null,
        );
    }

    function updateDebit(
        lineId:
            string,

        value:
            string,
    ) {
        updateLine(
            lineId,
            {
                debit:
                    value,

                credit:
                    parseAmount(
                        value,
                    ) >
                        0
                        ? ""
                        : lines.find(
                            (
                                line,
                            ) =>
                                line.id ===
                                lineId,
                        )
                            ?.credit ??
                        "",
            },
        );
    }

    function updateCredit(
        lineId:
            string,

        value:
            string,
    ) {
        updateLine(
            lineId,
            {
                credit:
                    value,

                debit:
                    parseAmount(
                        value,
                    ) >
                        0
                        ? ""
                        : lines.find(
                            (
                                line,
                            ) =>
                                line.id ===
                                lineId,
                        )
                            ?.debit ??
                        "",
            },
        );
    }

    function addLine() {
        setLines(
            (
                current,
            ) => [
                    ...current,
                    createLine(
                        nextLineNumber,
                    ),
                ],
        );

        setNextLineNumber(
            (
                current,
            ) =>
                current +
                1,
        );
    }

    function removeLine(
        lineId:
            string,
    ) {
        if (
            lines.length <=
            2
        ) {
            setError(
                "A journal entry requires at least two lines.",
            );

            return;
        }

        setLines(
            (
                current,
            ) =>
                current.filter(
                    (
                        line,
                    ) =>
                        line.id !==
                        lineId,
                ),
        );

        setError(
            null,
        );
    }

    function handleSubmit(
        event:
            React.FormEvent,
    ) {
        event.preventDefault();

        setError(
            null,
        );

        try {
            if (
                !description.trim()
            ) {
                throw new Error(
                    "Journal description is required.",
                );
            }

            if (
                lines.length <
                2
            ) {
                throw new Error(
                    "A journal entry requires at least two lines.",
                );
            }

            for (
                const line
                of lines
            ) {
                if (
                    !line.accountId
                ) {
                    throw new Error(
                        "Select an account for every journal line.",
                    );
                }

                const debit =
                    parseAmount(
                        line.debit,
                    );

                const credit =
                    parseAmount(
                        line.credit,
                    );

                if (
                    debit ===
                    0 &&
                    credit ===
                    0
                ) {
                    throw new Error(
                        "Every journal line requires either a debit or a credit.",
                    );
                }

                if (
                    debit >
                    0 &&
                    credit >
                    0
                ) {
                    throw new Error(
                        "A journal line cannot contain both a debit and a credit.",
                    );
                }
            }

            if (
                !balanced
            ) {
                throw new Error(
                    `Journal is out of balance by ${formatMoney(
                        Math.abs(
                            difference,
                        ),
                    )}.`,
                );
            }

            const journal =
                journalEntryRepository
                    .post(
                        {
                            journalDate,

                            description:
                                description.trim(),

                            reference:
                                reference.trim() ||
                                undefined,

                            sourceType:
                                "MANUAL_JOURNAL",

                            lines:
                                lines.map(
                                    (
                                        line,
                                    ) => ({
                                        accountId:
                                            line.accountId,

                                        description:
                                            line.description.trim() ||
                                            undefined,

                                        debit:
                                            parseAmount(
                                                line.debit,
                                            ),

                                        credit:
                                            parseAmount(
                                                line.credit,
                                            ),
                                    }),
                                ),
                        },
                    );

            navigate(
                `/accounting/journals/${journal.id}`,
            );
        } catch (
        caughtError
        ) {
            setError(
                caughtError instanceof
                    Error
                    ? caughtError.message
                    : "Unable to post manual journal.",
            );
        }
    }

    return (
        <div className="pb-8">
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    navigate(
                        "/accounting/journals",
                    )
                }
                className="mb-5"
            >
                <ArrowLeft
                    size={
                        15
                    }
                />

                Journal Register
            </Button>

            <div className="mb-7">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                    Accounting
                </p>

                <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                    New Manual Journal
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Post a balanced
                    journal directly to
                    accounts that allow
                    manual posting.
                    System-controlled
                    subledger accounts
                    are protected.
                </p>
            </div>

            <form
                onSubmit={
                    handleSubmit
                }
            >
                <Card>
                    <CardContent>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field
                                label="Journal Date"
                            >
                                <Input
                                    type="date"
                                    value={
                                        journalDate
                                    }
                                    onChange={(
                                        event,
                                    ) => {
                                        setJournalDate(
                                            event
                                                .target
                                                .value,
                                        );

                                        setError(
                                            null,
                                        );
                                    }}
                                />
                            </Field>

                            <Field
                                label="Reference"
                            >
                                <Input
                                    value={
                                        reference
                                    }
                                    onChange={(
                                        event,
                                    ) => {
                                        setReference(
                                            event
                                                .target
                                                .value,
                                        );

                                        setError(
                                            null,
                                        );
                                    }}
                                    placeholder="Optional"
                                />
                            </Field>

                            <div className="md:col-span-2">
                                <Field
                                    label="Description"
                                >
                                    <Input
                                        value={
                                            description
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            setDescription(
                                                event
                                                    .target
                                                    .value,
                                            );

                                            setError(
                                                null,
                                            );
                                        }}
                                        placeholder="Describe the journal entry"
                                    />
                                </Field>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardContent>
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                                    Journal Lines
                                </h2>

                                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                    Total debits
                                    must equal
                                    total credits
                                    before posting.
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={
                                    addLine
                                }
                            >
                                <Plus
                                    size={
                                        16
                                    }
                                />

                                Add Line
                            </Button>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                            <table className="w-full min-w-[900px] border-collapse">
                                <thead>
                                    <tr className="bg-[var(--color-surface-muted)]">
                                        <Header>
                                            Account
                                        </Header>

                                        <Header>
                                            Line Description
                                        </Header>

                                        <Header align="right">
                                            Debit
                                        </Header>

                                        <Header align="right">
                                            Credit
                                        </Header>

                                        <Header align="right">
                                            Action
                                        </Header>
                                    </tr>
                                </thead>

                                <tbody>
                                    {lines.map(
                                        (
                                            line,
                                        ) => (
                                            <tr
                                                key={
                                                    line.id
                                                }
                                                className="border-b border-[var(--color-border)] last:border-b-0"
                                            >
                                                <td className="min-w-64 px-3 py-3">
                                                    <select
                                                        value={
                                                            line.accountId
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateLine(
                                                                line.id,
                                                                {
                                                                    accountId:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                },
                                                            )
                                                        }
                                                        className={inputClass}
                                                    >
                                                        <option value="">
                                                            Select account
                                                        </option>

                                                        {manualAccounts.map(
                                                            (
                                                                account,
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        account.id
                                                                    }
                                                                    value={
                                                                        account.id
                                                                    }
                                                                >
                                                                    {
                                                                        account.code
                                                                    }
                                                                    {" · "}
                                                                    {
                                                                        account.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </td>

                                                <td className="min-w-64 px-3 py-3">
                                                    <Input
                                                        value={
                                                            line.description
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateLine(
                                                                line.id,
                                                                {
                                                                    description:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                },
                                                            )
                                                        }
                                                        placeholder="Optional"
                                                    />
                                                </td>

                                                <td className="w-40 px-3 py-3">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            line.debit
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateDebit(
                                                                line.id,
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                        className="text-right"
                                                    />
                                                </td>

                                                <td className="w-40 px-3 py-3">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            line.credit
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateCredit(
                                                                line.id,
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                        className="text-right"
                                                    />
                                                </td>

                                                <td className="w-24 px-3 py-3 text-right">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeLine(
                                                                line.id,
                                                            )
                                                        }
                                                        disabled={
                                                            lines.length <=
                                                            2
                                                        }
                                                    >
                                                        <Trash2
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>

                                <tfoot>
                                    <tr className="bg-[var(--color-surface-muted)]">
                                        <td
                                            colSpan={
                                                2
                                            }
                                            className="px-4 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]"
                                        >
                                            Totals
                                        </td>

                                        <td className="px-4 py-4 text-right font-semibold tabular-nums text-[var(--color-text-primary)]">
                                            {formatMoney(
                                                totalDebit,
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-right font-semibold tabular-nums text-[var(--color-text-primary)]">
                                            {formatMoney(
                                                totalCredit,
                                            )}
                                        </td>

                                        <td />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <SummaryCard
                                label="Total Debit"
                                value={
                                    formatMoney(
                                        totalDebit,
                                    )
                                }
                            />

                            <SummaryCard
                                label="Total Credit"
                                value={
                                    formatMoney(
                                        totalCredit,
                                    )
                                }
                            />

                            <Card>
                                <CardContent>
                                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                                        Difference
                                    </p>

                                    <p className="mt-2 font-display text-xl font-semibold text-[var(--color-primary)]">
                                        {formatMoney(
                                            Math.abs(
                                                difference,
                                            ),
                                        )}
                                    </p>

                                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                                        {balanced
                                            ? "Balanced"
                                            : "Journal must balance before posting"}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {error && (
                            <div className="mt-5 rounded-lg border border-[var(--color-danger)] px-4 py-3 text-sm text-[var(--color-danger)]">
                                {
                                    error
                                }
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--color-border)] pt-5">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                    navigate(
                                        "/accounting/journals",
                                    )
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    !balanced
                                }
                            >
                                Post Journal
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label:
    string;

    children:
    ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </span>

            {children}
        </label>
    );
}

function Header({
    children,
    align =
    "left",
}: {
    children:
    ReactNode;

    align?:
    "left"
    | "right";
}) {
    return (
        <th
            className={
                align ===
                    "right"
                    ? "border-b border-[var(--color-border)] px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]"
                    : "border-b border-[var(--color-border)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]"
            }
        >
            {children}
        </th>
    );
}

function SummaryCard({
    label,
    value,
}: {
    label:
    string;

    value:
    string;
}) {
    return (
        <Card>
            <CardContent>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    {label}
                </p>

                <p className="mt-2 font-display text-xl font-semibold text-[var(--color-primary)]">
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function parseAmount(
    value:
        string,
) {
    if (
        value.trim() ===
        ""
    ) {
        return 0;
    }

    const parsed =
        Number(
            value,
        );

    return Number.isFinite(
        parsed,
    )
        ? parsed
        : 0;
}

function formatMoney(
    value:
        number,
) {
    return new Intl.NumberFormat(
        "en-AU",
        {
            style:
                "currency",

            currency:
                "AUD",
        },
    ).format(
        value,
    );
}

function getToday() {
    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        );

    const day =
        String(
            now.getDate(),
        ).padStart(
            2,
            "0",
        );

    return `${year}-${month}-${day}`;
}

const inputClass =
    "h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]";