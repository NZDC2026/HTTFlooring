import {businessDateKey} from '../../../lib/businessDate';
import { businessSettings } from '../../business-workspace/configurationState';
import {
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    Boxes,
    DollarSign,
    PackageSearch,
    Warehouse,
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
    inventorySiteRepository,
} from "../data/inventorySiteRepository";

import {
    useInventoryValuation,
} from "../data/useInventoryValuation";

function getToday() {
    return businessDateKey(new Date().toISOString());
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
                businessSettings().currency,

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2,
        },
    ).format(
        value,
    );
}

function formatQuantity(
    value:
        number,
) {
    return new Intl.NumberFormat(
        "en-AU",
        {
            minimumFractionDigits:
                0,

            maximumFractionDigits:
                4,
        },
    ).format(
        value,
    );
}

function formatUnitCost(
    value:
        number,
) {
    return new Intl.NumberFormat(
        "en-AU",
        {
            style:
                "currency",

            currency:
                businessSettings().currency,

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                6,
        },
    ).format(
        value,
    );
}

export function InventoryValuationPage() {
    const navigate =
        useNavigate();

    const [
        asOfDate,
        setAsOfDate,
    ] = useState(
        getToday(),
    );

    const [
        selectedSiteId,
        setSelectedSiteId,
    ] = useState(
        "ALL",
    );

    const report =
        useInventoryValuation(
            asOfDate,
        );

    const sites =
        inventorySiteRepository
            .getAll();

    const rows =
        useMemo(
            () =>
                selectedSiteId ===
                    "ALL"
                    ? report.rows
                    : report.rows.filter(
                        (
                            row,
                        ) =>
                            row.siteId ===
                            selectedSiteId,
                    ),
            [
                report.rows,
                selectedSiteId,
            ],
        );

    const filteredInventoryValue =
        useMemo(
            () =>
                rows.reduce(
                    (
                        total,
                        row,
                    ) =>
                        total +
                        row.inventoryValue,
                    0,
                ),
            [
                rows,
            ],
        );

    const filteredProductCount =
        useMemo(
            () =>
                new Set(
                    rows.map(
                        (
                            row,
                        ) =>
                            row.productId,
                    ),
                ).size,
            [
                rows,
            ],
        );

    return (
        <div className="pb-8">
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

            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Inventory
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        Inventory
                        Valuation
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                        Review
                        point-in-time
                        inventory
                        quantities,
                        moving average
                        costs and stock
                        values by site
                        and product.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="min-w-[240px]">
                        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                            Site
                        </div>

                        <select
                            value={
                                selectedSiteId
                            }
                            onChange={(
                                event,
                            ) =>
                                setSelectedSiteId(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="ALL">
                                All
                                Sites
                            </option>

                            {sites.map(
                                (
                                    site,
                                ) => (
                                    <option
                                        key={
                                            site.id
                                        }
                                        value={
                                            site.id
                                        }
                                    >
                                        {
                                            site.code
                                        }{" "}
                                        —{" "}
                                        {
                                            site.name
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    <div className="min-w-[180px]">
                        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                            As of
                        </div>

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
                    </div>
                </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-4">
                <SummaryCard
                    icon={
                        DollarSign
                    }
                    label="Inventory Value"
                    value={
                        formatMoney(
                            filteredInventoryValue,
                        )
                    }
                />

                <SummaryCard
                    icon={
                        PackageSearch
                    }
                    label="Products"
                    value={
                        filteredProductCount
                    }
                />

                <SummaryCard
                    icon={
                        Warehouse
                    }
                    label="Sites"
                    value={
                        selectedSiteId ===
                            "ALL"
                            ? new Set(
                                rows.map(
                                    (
                                        row,
                                    ) =>
                                        row.siteId,
                                ),
                            ).size
                            : rows.length >
                                0
                                ? 1
                                : 0
                    }
                />

                <SummaryCard
                    icon={
                        Boxes
                    }
                    label="Valuation Lines"
                    value={
                        rows.length
                    }
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="border-b border-[var(--color-border)] px-5 py-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-display text-xl">
                                    Stock
                                    Valuation
                                </h2>

                                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                    Values
                                    reconstructed
                                    from the
                                    inventory
                                    cost
                                    movement
                                    ledger
                                    through{" "}
                                    {
                                        asOfDate
                                    }
                                    .
                                </p>
                            </div>

                            <div className="text-sm font-semibold text-[var(--color-primary)]">
                                {formatMoney(
                                    filteredInventoryValue,
                                )}
                            </div>
                        </div>
                    </div>

                    {rows.length ===
                        0 ? (
                        <div className="px-5 py-12 text-center">
                            <PackageSearch
                                size={
                                    28
                                }
                                className="mx-auto text-[var(--color-text-muted)]"
                            />

                            <p className="mt-3 text-sm font-medium">
                                No
                                inventory
                                value
                            </p>

                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                No costed
                                inventory
                                exists for
                                the selected
                                site and
                                date.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-left">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                                        <TableHeader>
                                            Site
                                        </TableHeader>

                                        <TableHeader>
                                            SKU
                                        </TableHeader>

                                        <TableHeader>
                                            Product
                                        </TableHeader>

                                        <TableHeader
                                            align="right"
                                        >
                                            Quantity
                                        </TableHeader>

                                        <TableHeader>
                                            Unit
                                        </TableHeader>

                                        <TableHeader
                                            align="right"
                                        >
                                            Average
                                            Cost
                                        </TableHeader>

                                        <TableHeader
                                            align="right"
                                        >
                                            Inventory
                                            Value
                                        </TableHeader>
                                    </tr>
                                </thead>

                                <tbody>
                                    {rows.map(
                                        (
                                            row,
                                        ) => (
                                            <tr
                                                key={`${row.siteId}:${row.productId}`}
                                                className="border-b border-[var(--color-border)] last:border-b-0"
                                            >
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {
                                                            row.siteCode
                                                        }
                                                    </div>

                                                    <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                                        {
                                                            row.siteName
                                                        }
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="font-medium text-[var(--color-primary)]">
                                                        {
                                                            row.sku
                                                        }
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        row.productName
                                                    }
                                                </TableCell>

                                                <TableCell
                                                    align="right"
                                                >
                                                    {formatQuantity(
                                                        row.quantityOnHand,
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        row.baseUnitSymbol
                                                    }
                                                </TableCell>

                                                <TableCell
                                                    align="right"
                                                >
                                                    {formatUnitCost(
                                                        row.averageCostPerBaseUnit,
                                                    )}
                                                </TableCell>

                                                <TableCell
                                                    align="right"
                                                >
                                                    <span className="font-semibold">
                                                        {formatMoney(
                                                            row.inventoryValue,
                                                        )}
                                                    </span>
                                                </TableCell>
                                            </tr>
                                        ),
                                    )}
                                </tbody>

                                <tfoot>
                                    <tr className="bg-[var(--color-surface-muted)]">
                                        <td
                                            colSpan={
                                                6
                                            }
                                            className="px-4 py-4 text-right text-sm font-semibold"
                                        >
                                            Total
                                            Inventory
                                            Value
                                        </td>

                                        <td className="px-4 py-4 text-right text-sm font-bold text-[var(--color-primary)]">
                                            {formatMoney(
                                                filteredInventoryValue,
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function SummaryCard({
    icon:
    Icon,

    label,

    value,
}: {
    icon:
    typeof Boxes;

    label:
    string;

    value:
    string |
    number;
}) {
    return (
        <Card>
            <CardContent>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                            {label}
                        </p>

                        <p className="mt-2 font-display text-2xl font-semibold text-[var(--color-primary)]">
                            {value}
                        </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                        <Icon
                            size={
                                19
                            }
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TableHeader({
    children,

    align =
    "left",
}: {
    children:
    React.ReactNode;

    align?:
    "left" |
    "right";
}) {
    return (
        <th
            className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)] ${align ===
                    "right"
                    ? "text-right"
                    : "text-left"
                }`}
        >
            {children}
        </th>
    );
}

function TableCell({
    children,

    align =
    "left",
}: {
    children:
    React.ReactNode;

    align?:
    "left" |
    "right";
}) {
    return (
        <td
            className={`px-4 py-3 text-sm ${align ===
                    "right"
                    ? "text-right"
                    : "text-left"
                }`}
        >
            {children}
        </td>
    );
}