import { reportMoney } from '../../report-settings/reportPresentation';
import { ReportContext } from '../../report-settings/ReportContext';
import {businessDateKey} from '../../../lib/businessDate';
import {
    useState,
} from "react";

import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Scale,
    XCircle,
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
    useInventoryGlReconciliation,
} from "../data/useInventoryGlReconciliation";

function getToday() {
    return businessDateKey(new Date().toISOString());
}

function formatMoney(
    value:
        number,
) { return reportMoney(value); }

export function InventoryGlReconciliationPage() {
    const navigate =
        useNavigate();

    const [
        asOfDate,
        setAsOfDate,
    ] = useState(
        getToday(),
    );

    const reconciliation =
        useInventoryGlReconciliation(
            asOfDate,
        );

    return (
        <div className="pb-8"><ReportContext basis="Accrual"/>
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    navigate(
                        "/inventory",
                    )
                }
                className="mb-5"
            >
                <ArrowLeft
                    size={
                        15
                    }
                />

                Inventory
            </Button>

            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Inventory Control
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-display text-3xl font-semibold text-[var(--color-primary)]">
                            Inventory
                            Reconciliation
                        </h1>

                        <Badge
                            variant={
                                reconciliation.reconciled
                                    ? "success"
                                    : "warning"
                            }
                        >
                            {reconciliation.reconciled
                                ? "Reconciled"
                                : "Out of Balance"}
                        </Badge>
                    </div>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                        Compare the
                        point-in-time
                        inventory cost
                        subledger with
                        the Inventory
                        general ledger
                        control account.
                    </p>
                </div>

                <label className="block w-full lg:w-48">
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
                        ) => {
                            const value =
                                event
                                    .target
                                    .value;

                            if (
                                value
                            ) {
                                setAsOfDate(
                                    value,
                                );
                            }
                        }}
                    />
                </label>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <SummaryCard
                    label="Inventory Subledger"
                    value={
                        formatMoney(
                            reconciliation
                                .subledgerInventoryValue,
                        )
                    }
                />

                <SummaryCard
                    label="Inventory GL"
                    value={
                        formatMoney(
                            reconciliation
                                .glInventoryBalance,
                        )
                    }
                />

                <SummaryCard
                    label="Difference"
                    value={
                        formatMoney(
                            reconciliation
                                .difference,
                        )
                    }
                    emphasis={
                        !reconciliation
                            .reconciled
                    }
                />
            </div>

            <Card className="mb-6">
                <CardContent>
                    <div className="flex items-start gap-3">
                        {reconciliation.reconciled ? (
                            <CheckCircle2
                                size={
                                    21
                                }
                                className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                            />
                        ) : (
                            <XCircle
                                size={
                                    21
                                }
                                className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                            />
                        )}

                        <div>
                            <h2 className="font-display text-xl">
                                {reconciliation.reconciled
                                    ? "Inventory is reconciled"
                                    : "Inventory is out of balance"}
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                                {reconciliation.reconciled
                                    ? "The inventory cost subledger agrees with the Inventory general ledger control account for the selected date."
                                    : "The inventory cost subledger does not agree with the Inventory general ledger control account. This report does not create balancing journals or modify inventory records."}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardContent>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                                    Inventory
                                    Cost
                                    Subledger
                                </p>

                                <p className="mt-3 font-display text-3xl font-semibold text-[var(--color-primary)]">
                                    {formatMoney(
                                        reconciliation
                                            .subledgerInventoryValue,
                                    )}
                                </p>
                            </div>

                            <Scale
                                size={
                                    22
                                }
                                className="text-[var(--color-primary)]"
                            />
                        </div>

                        <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-4 text-sm">
                            <DetailRow
                                label="Valuation lines"
                                value={
                                    reconciliation
                                        .valuationLineCount
                                }
                            />

                            <DetailRow
                                label="Products"
                                value={
                                    reconciliation
                                        .productCount
                                }
                            />

                            <DetailRow
                                label="Sites"
                                value={
                                    reconciliation
                                        .siteCount
                                }
                            />
                        </div>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="mt-5"
                            onClick={() =>
                                navigate(
                                    "/inventory/valuation",
                                )
                            }
                        >
                            View
                            Valuation

                            <ExternalLink
                                size={
                                    14
                                }
                            />
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                                General
                                Ledger
                            </p>

                            <p className="mt-3 font-display text-3xl font-semibold text-[var(--color-primary)]">
                                {formatMoney(
                                    reconciliation
                                        .glInventoryBalance,
                                )}
                            </p>
                        </div>

                        <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-4 text-sm">
                            <DetailRow
                                label="Account"
                                value={`${reconciliation.inventoryAccountCode} ${reconciliation.inventoryAccountName}`}
                            />

                            <DetailRow
                                label="System role"
                                value="INVENTORY"
                            />

                            <DetailRow
                                label="As at"
                                value={
                                    reconciliation
                                        .asOfDate
                                }
                            />
                        </div>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="mt-5"
                            onClick={() =>
                                navigate(
                                    "/accounting/general-ledger",
                                )
                            }
                        >
                            General
                            Ledger

                            <ExternalLink
                                size={
                                    14
                                }
                            />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {!reconciliation.reconciled && (
                <Card>
                    <CardContent>
                        <h2 className="font-display text-xl">
                            Difference
                            Analysis
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                            A positive
                            difference means
                            the inventory cost
                            subledger is higher
                            than the Inventory
                            GL account. A
                            negative difference
                            means the Inventory
                            GL account is
                            higher than the
                            inventory cost
                            subledger.
                        </p>

                        <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm font-medium">
                                    Subledger
                                    − GL
                                </span>

                                <span className="font-display text-xl font-semibold text-[var(--color-accent)]">
                                    {formatMoney(
                                        reconciliation
                                            .difference,
                                    )}
                                </span>
                            </div>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-[var(--color-text-muted)]">
                            At the current
                            implementation
                            stage, goods
                            receipts update
                            the inventory cost
                            subledger while
                            supplier bills
                            update the
                            Inventory GL
                            account. Received
                            but not yet billed
                            purchases can
                            therefore create a
                            legitimate timing
                            difference.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function SummaryCard({
    label,
    value,
    emphasis =
    false,
}: {
    label:
    string;

    value:
    string;

    emphasis?:
    boolean;
}) {
    return (
        <Card>
            <CardContent>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                    {label}
                </p>

                <p
                    className={`mt-2 font-display text-2xl font-semibold ${emphasis
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-primary)]"
                        }`}
                >
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function DetailRow({
    label,
    value,
}: {
    label:
    string;

    value:
    string |
    number;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-[var(--color-text-muted)]">
                {label}
            </span>

            <span className="text-right font-medium">
                {value}
            </span>
        </div>
    );
}