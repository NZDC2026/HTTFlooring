import {
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import {
    ArrowLeft,
    CheckCircle2,
    CircleAlert,
    Landmark,
    Scale,
} from "lucide-react";

import {
    useNavigate,
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
    useFinanceControls,
} from "../data/useFinanceControls";

import type {
    FinanceControl,
} from "../types/financeControls";

export function FinanceControlsPage() {
    const navigate =
        useNavigate();

    const [
        asOfDate,
        setAsOfDate,
    ] = useState(
        getToday(),
    );

    const report =
        useFinanceControls(
            asOfDate,
        );

    return (
        <div className="pb-8">
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    navigate(
                        "/accounting",
                    )
                }
                className="mb-5"
            >
                <ArrowLeft
                    size={
                        15
                    }
                />

                Accounting
            </Button>

            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Finance Controls
                    </p>

                    <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                        Finance Reconciliation
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                        Validate the
                        general ledger,
                        subledgers, bank
                        registers and
                        financial
                        statements against
                        each other as at a
                        single reporting
                        date.
                    </p>
                </div>

                <label className="block min-w-44">
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        As at
                    </span>

                    <Input
                        type="date"
                        value={
                            asOfDate
                        }
                        onChange={(
                            event,
                        ) =>
                            setAsOfDate(
                                event
                                    .target
                                    .value,
                            )
                        }
                    />
                </label>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <SummaryCard
                    label="Controls"
                    value={
                        String(
                            report.totalControlCount,
                        )
                    }
                />

                <SummaryCard
                    label="Passed"
                    value={
                        String(
                            report.passedControlCount,
                        )
                    }
                />

                <SummaryCard
                    label="Failed"
                    value={
                        String(
                            report.failedControlCount,
                        )
                    }
                />

                <Card>
                    <CardContent>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                                    Overall Status
                                </p>

                                <p className="mt-2 font-display text-xl font-semibold text-[var(--color-primary)]">
                                    {report.allPassed
                                        ? "All Controls Passed"
                                        : "Review Required"}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                                {report.allPassed ? (
                                    <CheckCircle2
                                        size={
                                            19
                                        }
                                    />
                                ) : (
                                    <CircleAlert
                                        size={
                                            19
                                        }
                                    />
                                )}
                            </div>
                        </div>

                        <div className="mt-2">
                            <Badge
                                variant={
                                    report.allPassed
                                        ? "success"
                                        : "neutral"
                                }
                            >
                                {report.allPassed
                                    ? "Reconciled"
                                    : "Exceptions Found"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent>
                    <div className="mb-5">
                        <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                            Core Accounting Controls
                        </h2>

                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                            Cross-checks
                            between the
                            general ledger,
                            subledgers and
                            financial
                            reports.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {report.controls.map(
                            (
                                control,
                            ) => (
                                <ControlCard
                                    key={
                                        control.id
                                    }
                                    control={
                                        control
                                    }
                                    onOpen={
                                        control.route
                                            ? () =>
                                                navigate(
                                                    control.route!,
                                                )
                                            : undefined
                                    }
                                />
                            ),
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardContent>
                    <div className="mb-5">
                        <h2 className="font-display text-xl font-semibold text-[var(--color-primary)]">
                            Bank Register Controls
                        </h2>

                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                            Each bank
                            register must
                            equal the
                            balance of its
                            linked general
                            ledger account.
                        </p>
                    </div>

                    {report.bankControls.length ===
                        0 ? (
                        <div className="rounded-lg border border-[var(--color-border)] px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
                            No bank
                            accounts are
                            configured.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                            <table className="w-full min-w-[850px] border-collapse">
                                <thead>
                                    <tr className="bg-[var(--color-surface-muted)]">
                                        <Header>
                                            Bank Account
                                        </Header>

                                        <Header align="right">
                                            Bank Register
                                        </Header>

                                        <Header align="right">
                                            GL Balance
                                        </Header>

                                        <Header align="right">
                                            Difference
                                        </Header>

                                        <Header>
                                            Status
                                        </Header>

                                        <Header align="right">
                                            Action
                                        </Header>
                                    </tr>
                                </thead>

                                <tbody>
                                    {report.bankControls.map(
                                        (
                                            control,
                                        ) => (
                                            <tr
                                                key={
                                                    control.bankAccountId
                                                }
                                                className="border-b border-[var(--color-border)] last:border-b-0"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                                                            <Landmark
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </div>

                                                        <span className="font-medium text-[var(--color-text-primary)]">
                                                            {
                                                                control.bankAccountName
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                <MoneyCell
                                                    value={
                                                        control.registerBalance
                                                    }
                                                />

                                                <MoneyCell
                                                    value={
                                                        control.glBalance
                                                    }
                                                />

                                                <MoneyCell
                                                    value={
                                                        control.difference
                                                    }
                                                    absolute
                                                />

                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        passed={
                                                            control.status ===
                                                            "PASS"
                                                        }
                                                    />
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            navigate(
                                                                `/banking/accounts/${control.bankAccountId}`,
                                                            )
                                                        }
                                                    >
                                                        Open
                                                    </Button>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                Finance reconciliation
                is read-only. A failed
                control must be corrected
                through the underlying
                business transaction,
                journal or configuration;
                this dashboard does not
                create balancing entries.
            </div>
        </div>
    );
}

function ControlCard({
    control,
    onOpen,
}: {
    control:
    FinanceControl;

    onOpen?:
    () => void;
}) {
    const passed =
        control.status ===
        "PASS";

    return (
        <div className="rounded-lg border border-[var(--color-border)] px-5 py-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                        {passed ? (
                            <CheckCircle2
                                size={
                                    19
                                }
                            />
                        ) : (
                            <Scale
                                size={
                                    19
                                }
                            />
                        )}
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[var(--color-text-primary)]">
                                {
                                    control.name
                                }
                            </h3>

                            <StatusBadge
                                passed={
                                    passed
                                }
                            />
                        </div>

                        <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                            {
                                control.description
                            }
                        </p>
                    </div>
                </div>

                <div className="grid shrink-0 gap-4 sm:grid-cols-3 lg:min-w-[520px]">
                    <ValueBlock
                        label={
                            control.leftLabel
                        }
                        value={
                            control.leftValue
                        }
                    />

                    <ValueBlock
                        label={
                            control.rightLabel
                        }
                        value={
                            control.rightValue
                        }
                    />

                    <ValueBlock
                        label="Difference"
                        value={
                            Math.abs(
                                control.difference,
                            )
                        }
                    />
                </div>

                {onOpen ? (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={
                            onOpen
                        }
                    >
                        Review
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

function ValueBlock({
    label,
    value,
}: {
    label:
    string;

    value:
    number;
}) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {label}
            </p>

            <p className="mt-1 whitespace-nowrap font-semibold tabular-nums text-[var(--color-text-primary)]">
                {formatMoney(
                    value,
                )}
            </p>
        </div>
    );
}

function StatusBadge({
    passed,
}: {
    passed:
    boolean;
}) {
    return (
        <Badge
            variant={
                passed
                    ? "success"
                    : "neutral"
            }
        >
            {passed
                ? "Pass"
                : "Fail"}
        </Badge>
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

function MoneyCell({
    value,
    absolute =
    false,
}: {
    value:
    number;

    absolute?:
    boolean;
}) {
    return (
        <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-[var(--color-text-primary)]">
            {formatMoney(
                absolute
                    ? Math.abs(
                        value,
                    )
                    : value,
            )}
        </td>
    );
}

function formatMoney(
    value:
        number,
) {
    if (
        value <
        0
    ) {
        return `(${new Intl.NumberFormat(
            "en-AU",
            {
                style:
                    "currency",

                currency:
                    "AUD",
            },
        ).format(
            Math.abs(
                value,
            ),
        )})`;
    }

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