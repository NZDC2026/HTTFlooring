import {
    useState,
} from "react";

import {
    ArrowLeft,
    LockKeyhole,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Badge,
} from "../../../components/ui/Badge";

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
    accountRepository,
} from "../data/accountRepository";

import {
    useAccount,
} from "../data/useAccounting";

import type {
    AccountType,
} from "../types/account";

interface AccountFormPageProps {
    mode:
    | "create"
    | "edit";
}

const accountTypes:
    {
        value:
        AccountType;

        label:
        string;
    }[] = [
        {
            value:
                "ASSET",
            label:
                "Asset",
        },
        {
            value:
                "LIABILITY",
            label:
                "Liability",
        },
        {
            value:
                "EQUITY",
            label:
                "Equity",
        },
        {
            value:
                "REVENUE",
            label:
                "Revenue",
        },
        {
            value:
                "EXPENSE",
            label:
                "Expense",
        },
    ];

export function AccountFormPage({
    mode,
}: AccountFormPageProps) {
    const navigate =
        useNavigate();

    const {
        accountId,
    } = useParams<{
        accountId:
        string;
    }>();

    const account =
        useAccount(
            mode === "edit"
                ? accountId
                : undefined,
        );

    if (
        mode === "edit" &&
        !accountId
    ) {
        return (
            <Navigate
                to="/accounting"
                replace
            />
        );
    }

    if (
        mode === "edit" &&
        !account
    ) {
        return (
            <Navigate
                to="/accounting"
                replace
            />
        );
    }

    return (
        <AccountForm
            mode={
                mode
            }
            account={
                account
            }
            onCancel={() =>
                navigate(
                    "/accounting",
                )
            }
            onSaved={() =>
                navigate(
                    "/accounting",
                )
            }
        />
    );
}

function AccountForm({
    mode,
    account,
    onCancel,
    onSaved,
}: {
    mode:
    | "create"
    | "edit";

    account:
    | ReturnType<
        typeof useAccount
    >
    | undefined;

    onCancel:
    () => void;

    onSaved:
    () => void;
}) {
    const [
        code,
        setCode,
    ] = useState(
        account?.code ??
        "",
    );

    const [
        name,
        setName,
    ] = useState(
        account?.name ??
        "",
    );

    const [
        type,
        setType,
    ] =
        useState<AccountType>(
            account?.type ??
            "ASSET",
        );

    const [
        description,
        setDescription,
    ] = useState(
        account
            ?.description ??
        "",
    );

    const [
        active,
        setActive,
    ] = useState(
        account?.active ??
        true,
    );

    const [
        allowManualPosting,
        setAllowManualPosting,
    ] = useState(
        account
            ?.allowManualPosting ??
        true,
    );

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(null);

    const [
        saving,
        setSaving,
    ] =
        useState(
            false,
        );

    const isSystemAccount =
        Boolean(
            account
                ?.systemRole,
        );

    function handleSubmit(
        event:
            React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(
            null,
        );

        setSaving(
            true,
        );

        try {
            if (
                mode ===
                "create"
            ) {
                accountRepository.create(
                    {
                        code,
                        name,
                        type,
                        description,
                        active,
                        allowManualPosting,
                    },
                );
            } else {
                if (!account) {
                    throw new Error(
                        "Accounting account was not found.",
                    );
                }

                accountRepository.update(
                    account.id,
                    {
                        code,
                        name,
                        type,
                        description,
                        active,
                        allowManualPosting,
                    },
                );
            }

            onSaved();
        } catch (
        caughtError
        ) {
            setError(
                caughtError instanceof
                    Error
                    ? caughtError.message
                    : "Unable to save account.",
            );

            setSaving(
                false,
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={
                    onCancel
                }
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={
                        16
                    }
                />

                Chart of
                Accounts
            </button>

            <div className="mb-7">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                    Finance
                </p>

                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                        {mode ===
                            "create"
                            ? "New Account"
                            : "Edit Account"}
                    </h1>

                    {account
                        ?.systemRole ? (
                        <Badge variant="info">
                            System
                            Control
                        </Badge>
                    ) : null}
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    {mode ===
                        "create"
                        ? "Create a general ledger account for manual journals and financial reporting."
                        : "Update the account details and posting controls."}
                </p>
            </div>

            <form
                onSubmit={
                    handleSubmit
                }
            >
                <Card className="max-w-4xl">
                    <CardContent>
                        {isSystemAccount ? (
                            <div className="mb-6 flex gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                                <LockKeyhole
                                    size={
                                        18
                                    }
                                    className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                                />

                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                        System
                                        control
                                        account
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                                        The
                                        account
                                        type,
                                        status
                                        and
                                        manual
                                        posting
                                        policy
                                        are
                                        protected
                                        because
                                        this
                                        account
                                        is used
                                        by
                                        automated
                                        accounting
                                        workflows.
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        {error ? (
                            <div className="mb-6 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
                                {
                                    error
                                }
                            </div>
                        ) : null}

                        <div className="grid gap-5 md:grid-cols-2">
                            <Field
                                label="Account Code"
                                required
                            >
                                <Input
                                    value={
                                        code
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setCode(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="e.g. 5400"
                                />
                            </Field>

                            <Field
                                label="Account Name"
                                required
                            >
                                <Input
                                    value={
                                        name
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setName(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="e.g. Office Expenses"
                                />
                            </Field>

                            <Field
                                label="Account Type"
                                required
                            >
                                <select
                                    value={
                                        type
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setType(
                                            event
                                                .target
                                                .value as AccountType,
                                        )
                                    }
                                    disabled={
                                        isSystemAccount
                                    }
                                    className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none transition hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:opacity-70"
                                >
                                    {accountTypes.map(
                                        (
                                            option,
                                        ) => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>
                            </Field>

                            <Field
                                label="System Role"
                            >
                                <Input
                                    value={
                                        account
                                            ?.systemRole
                                            ? formatSystemRole(
                                                account
                                                    .systemRole,
                                            )
                                            : "None"
                                    }
                                    disabled
                                />
                            </Field>
                        </div>

                        <div className="mt-5">
                            <Field
                                label="Description"
                            >
                                <textarea
                                    value={
                                        description
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setDescription(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    rows={
                                        4
                                    }
                                    placeholder="Optional account description"
                                    className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                                />
                            </Field>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <ToggleCard
                                title="Active"
                                description="Inactive accounts remain in historical records but cannot be used for new postings."
                                checked={
                                    active
                                }
                                disabled={
                                    isSystemAccount
                                }
                                onChange={
                                    setActive
                                }
                            />

                            <ToggleCard
                                title="Allow Manual Posting"
                                description="Allow this account to be selected when manual journals are introduced."
                                checked={
                                    allowManualPosting
                                }
                                disabled={
                                    isSystemAccount
                                }
                                onChange={
                                    setAllowManualPosting
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 flex max-w-4xl justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={
                            onCancel
                        }
                        disabled={
                            saving
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={
                            saving
                        }
                    >
                        {saving
                            ? "Saving..."
                            : mode ===
                                "create"
                                ? "Create Account"
                                : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

function Field({
    label,
    required = false,
    children,
}: {
    label: string;
    required?: boolean;
    children:
    React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
                {label}

                {required ? (
                    <span className="ml-1 text-[var(--color-danger)]">
                        *
                    </span>
                ) : null}
            </span>

            {children}
        </label>
    );
}

function ToggleCard({
    title,
    description,
    checked,
    disabled,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    disabled: boolean;
    onChange:
    (
        checked:
            boolean,
    ) => void;
}) {
    return (
        <label
            className={[
                "flex gap-3 rounded-lg border border-[var(--color-border)] p-4",
                disabled
                    ? "cursor-not-allowed bg-[var(--color-surface-muted)] opacity-70"
                    : "cursor-pointer bg-white",
            ].join(
                " ",
            )}
        >
            <input
                type="checkbox"
                checked={
                    checked
                }
                disabled={
                    disabled
                }
                onChange={(
                    event,
                ) =>
                    onChange(
                        event
                            .target
                            .checked,
                    )
                }
                className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
            />

            <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {title}
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                    {
                        description
                    }
                </p>
            </div>
        </label>
    );
}

function formatSystemRole(
    value: string,
) {
    return value
        .split("_")
        .map(
            (word) =>
                word
                    .charAt(0)
                    .toUpperCase() +
                word
                    .slice(1)
                    .toLowerCase(),
        )
        .join(" ");
}