import {
    useMemo,
    useState,
} from "react";

import {
    Boxes,
    History,
    PackageCheck,
    Warehouse,
} from "lucide-react";

import {
    inventorySiteRepository,
} from "../data/inventorySiteRepository";

import {
    useInventoryMovementRows,
    useInventoryStockRows,
} from "../data/useInventory";

import {
    SiteStockTable,
} from "../components/SiteStockTable";

import {
    InventoryMovementTable,
} from "../components/InventoryMovementTable";

type InventoryTab =
    | "STOCK"
    | "MOVEMENTS";

export function InventoryPage() {
    const stockRows =
        useInventoryStockRows();

    const movementRows =
        useInventoryMovementRows();

    const sites =
        inventorySiteRepository.getActive();

    const [
        tab,
        setTab,
    ] = useState<InventoryTab>(
        "STOCK",
    );

    const [
        selectedSiteId,
        setSelectedSiteId,
    ] = useState("ALL");

    const filteredStock =
        useMemo(
            () =>
                selectedSiteId ===
                    "ALL"
                    ? stockRows
                    : stockRows.filter(
                        (row) =>
                            row.siteId ===
                            selectedSiteId,
                    ),
            [
                stockRows,
                selectedSiteId,
            ],
        );

    const filteredMovements =
        useMemo(
            () =>
                selectedSiteId ===
                    "ALL"
                    ? movementRows
                    : movementRows.filter(
                        (row) =>
                            row.siteId ===
                            selectedSiteId,
                    ),
            [
                movementRows,
                selectedSiteId,
            ],
        );

    const totalStockRecords =
        filteredStock.length;

    const totalMovements =
        filteredMovements.length;

    const goodsReceipts =
        filteredMovements.filter(
            (movement) =>
                movement.movementType ===
                "GOODS_RECEIPT",
        ).length;

    return (
        <div className="pb-8">
            <div className="mb-7 flex items-start justify-between gap-5">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        Operations
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        Inventory
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Review
                        on-hand stock
                        by site and
                        trace every
                        inventory
                        movement.
                    </p>
                </div>

                <div className="w-[260px]">
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
                            All Sites
                        </option>

                        {sites.map(
                            (site) => (
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
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
                <SummaryCard
                    icon={
                        Warehouse
                    }
                    label="Active Sites"
                    value={
                        selectedSiteId ===
                            "ALL"
                            ? sites.length
                            : 1
                    }
                />

                <SummaryCard
                    icon={Boxes}
                    label="Stock Records"
                    value={
                        totalStockRecords
                    }
                />

                <SummaryCard
                    icon={
                        History
                    }
                    label="Movements"
                    value={
                        totalMovements
                    }
                />

                <SummaryCard
                    icon={
                        PackageCheck
                    }
                    label="Receipt Movements"
                    value={
                        goodsReceipts
                    }
                />
            </div>

            <div className="mb-5 flex gap-1 rounded-xl border border-[var(--color-border)] bg-white p-1 shadow-[var(--shadow-xs)]">
                <TabButton
                    active={
                        tab ===
                        "STOCK"
                    }
                    onClick={() =>
                        setTab(
                            "STOCK",
                        )
                    }
                >
                    Site Stock
                </TabButton>

                <TabButton
                    active={
                        tab ===
                        "MOVEMENTS"
                    }
                    onClick={() =>
                        setTab(
                            "MOVEMENTS",
                        )
                    }
                >
                    Movement
                    Ledger
                </TabButton>
            </div>

            {tab ===
                "STOCK" ? (
                <div>
                    <div className="mb-4">
                        <h2 className="font-display text-2xl">
                            Site Stock
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Quantity on
                            hand is held
                            in each
                            product's
                            base
                            inventory
                            unit.
                        </p>
                    </div>

                    {filteredStock.length >
                        0 ? (
                        <SiteStockTable
                            rows={
                                filteredStock
                            }
                        />
                    ) : (
                        <EmptyState
                            title="No stock on hand"
                            description="This site has no posted inventory movements yet."
                        />
                    )}
                </div>
            ) : (
                <div>
                    <div className="mb-4">
                        <h2 className="font-display text-2xl">
                            Movement
                            Ledger
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Audit trail
                            of inventory
                            increases and
                            decreases.
                            Select a
                            Goods Receipt
                            movement to
                            open its
                            source
                            document.
                        </p>
                    </div>

                    {filteredMovements.length >
                        0 ? (
                        <InventoryMovementTable
                            rows={
                                filteredMovements
                            }
                        />
                    ) : (
                        <EmptyState
                            title="No inventory movements"
                            description="Post a Goods Receipt to create the first inventory movement."
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
}: {
    icon:
    React.ComponentType<{
        size?: number;
    }>;

    label: string;

    value:
    | string
    | number;
}) {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 shadow-[var(--shadow-xs)]">
            <div className="flex items-center justify-between">
                <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    {label}
                </div>

                <Icon
                    size={16}
                />
            </div>

            <div className="mt-3 font-display text-2xl">
                {value}
            </div>
        </div>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;

    onClick: () => void;

    children:
    React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={
                onClick
            }
            className={[
                "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition",

                active
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-white px-6 py-14 text-center">
            <div className="font-display text-xl">
                {title}
            </div>

            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
                {description}
            </p>
        </div>
    );
}