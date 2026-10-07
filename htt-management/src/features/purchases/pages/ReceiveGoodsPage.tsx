import {
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    PackageCheck,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Button,
} from "../../../components/ui/Button";

import {
    Input,
} from "../../../components/ui/Input";

import {
    inventorySiteRepository,
} from "../../inventory/data/inventorySiteRepository";

import {
    goodsReceiptRepository,
} from "../data/goodsReceiptRepository";

import {
    usePurchaseOrder,
} from "../data/usePurchaseOrders";

import {
    PurchaseOrderStatusBadge,
} from "../components/PurchaseOrderStatusBadge";

export function ReceiveGoodsPage() {
    const navigate =
        useNavigate();

    const {
        purchaseOrderId,
    } = useParams();

    const purchaseOrder =
        usePurchaseOrder(
            purchaseOrderId,
        );

    const activeSites =
        inventorySiteRepository.getActive();

    const [
        siteId,
        setSiteId,
    ] = useState(
        activeSites[0]?.id ??
        "",
    );

    const [
        receiptDate,
        setReceiptDate,
    ] = useState(
        getToday(),
    );

    const [
        supplierDeliveryReference,
        setSupplierDeliveryReference,
    ] = useState("");

    const [
        notes,
        setNotes,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    const [
        quantities,
        setQuantities,
    ] = useState<
        Record<
            string,
            string
        >
    >({});

    const receivableLines =
        useMemo(
            () => {
                if (
                    !purchaseOrder
                ) {
                    return [];
                }

                return purchaseOrder.lines.filter(
                    (line) =>
                        line.receivedQuantity <
                        line.orderedQuantity,
                );
            },
            [purchaseOrder],
        );

    if (!purchaseOrder) {
        return (
            <Navigate
                to="/purchases"
                replace
            />
        );
    }

    if (
        ![
            "SENT",
            "PARTIALLY_RECEIVED",
        ].includes(
            purchaseOrder.status,
        )
    ) {
        return (
            <Navigate
                to={`/purchases/${purchaseOrder.id}`}
                replace
            />
        );
    }

    const resolvedPurchaseOrderId =
        purchaseOrder.id;

    function setQuantity(
        lineId: string,
        value: string,
    ) {
        setQuantities(
            (current) => ({
                ...current,
                [lineId]:
                    value,
            }),
        );

        setError(null);
    }

    function receiveRemaining(
        lineId: string,
        remaining: number,
    ) {
        setQuantity(
            lineId,
            String(
                remaining,
            ),
        );
    }

    function receiveAllRemaining() {
        const next:
            Record<
                string,
                string
            > = {};

        for (
            const line of
            receivableLines
        ) {
            next[line.id] =
                String(
                    roundQuantity(
                        line.orderedQuantity -
                        line.receivedQuantity,
                    ),
                );
        }

        setQuantities(next);
        setError(null);
    }

    function clearQuantities() {
        setQuantities({});
        setError(null);
    }

    function handlePostReceipt() {
        setError(null);

        if (!siteId) {
            setError(
                "Select a receiving site.",
            );

            return;
        }

        if (!receiptDate) {
            setError(
                "Receipt date is required.",
            );

            return;
        }

        const lines =
            receivableLines
                .map(
                    (line) => ({
                        purchaseOrderLineId:
                            line.id,

                        receivedQuantity:
                            Number(
                                quantities[
                                line.id
                                ] ??
                                0,
                            ),
                    }),
                )
                .filter(
                    (line) =>
                        Number.isFinite(
                            line.receivedQuantity,
                        ) &&
                        line.receivedQuantity >
                        0,
                );

        if (
            lines.length ===
            0
        ) {
            setError(
                "Enter a received quantity for at least one line.",
            );

            return;
        }

        for (
            const line of
            receivableLines
        ) {
            const raw =
                quantities[
                line.id
                ];

            if (
                raw ===
                undefined ||
                raw.trim() ===
                ""
            ) {
                continue;
            }

            const receivedNow =
                Number(raw);

            if (
                !Number.isFinite(
                    receivedNow,
                ) ||
                receivedNow <
                0
            ) {
                setError(
                    `${line.description}: received quantity is invalid.`,
                );

                return;
            }

            const remaining =
                roundQuantity(
                    line.orderedQuantity -
                    line.receivedQuantity,
                );

            if (
                receivedNow >
                remaining
            ) {
                setError(
                    `${line.description}: maximum receivable quantity is ${remaining} ${line.unitSymbol}.`,
                );

                return;
            }
        }

        try {
            const receipt =
                goodsReceiptRepository.create(
                    {
                        purchaseOrderId:
                            resolvedPurchaseOrderId,

                        siteId,

                        receiptDate,

                        supplierDeliveryReference:
                            supplierDeliveryReference.trim() ||
                            undefined,

                        notes:
                            notes.trim() ||
                            undefined,

                        lines,
                    },
                );

            navigate(
                `/purchases/goods-receipts/${receipt.id}`,
                {
                    replace:
                        true,
                },
            );
        } catch (caught) {
            setError(
                caught instanceof
                    Error
                    ? caught.message
                    : "Unable to post goods receipt.",
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={() =>
                    navigate(
                        `/purchases/${purchaseOrder.id}`,
                    )
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />

                Back to purchase
                order
            </button>

            <div className="mb-7 flex items-start justify-between gap-5">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                            {
                                purchaseOrder.purchaseOrderNumber
                            }
                        </span>

                        <PurchaseOrderStatusBadge
                            status={
                                purchaseOrder.status
                            }
                        />
                    </div>

                    <h1 className="font-display text-[34px] leading-tight">
                        Receive Goods
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {
                            purchaseOrder.supplierName
                        }
                    </p>
                </div>

                <Button
                    variant="secondary"
                    onClick={
                        receiveAllRemaining
                    }
                >
                    <PackageCheck
                        size={15}
                    />

                    Receive all
                    remaining
                </Button>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                <h2 className="font-display text-xl">
                    Receipt Details
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-5">
                    <Field
                        label="Receiving Site"
                        required
                    >
                        <select
                            value={
                                siteId
                            }
                            onChange={(
                                event,
                            ) =>
                                setSiteId(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            className={
                                selectClassName
                            }
                        >
                            <option value="">
                                Select site
                            </option>

                            {activeSites.map(
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
                    </Field>

                    <Field
                        label="Receipt Date"
                        required
                    >
                        <Input
                            type="date"
                            value={
                                receiptDate
                            }
                            onChange={(
                                event,
                            ) =>
                                setReceiptDate(
                                    event
                                        .target
                                        .value,
                                )
                            }
                        />
                    </Field>

                    <Field label="Supplier Delivery Reference">
                        <Input
                            value={
                                supplierDeliveryReference
                            }
                            onChange={(
                                event,
                            ) =>
                                setSupplierDeliveryReference(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Delivery docket number"
                        />
                    </Field>

                    <div>
                        <div className="mb-1.5 text-xs font-medium">
                            Supplier
                        </div>

                        <div className="flex h-10 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 text-sm">
                            {
                                purchaseOrder.supplierName
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                    <div>
                        <h2 className="font-display text-xl">
                            Items to
                            Receive
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Enter only
                            the quantity
                            physically
                            received in
                            this
                            delivery.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            clearQuantities
                        }
                        className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                    >
                        Clear
                        quantities
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-background-subtle)]">
                                <Header>
                                    Product
                                </Header>

                                <Header>
                                    Unit
                                </Header>

                                <Header align="right">
                                    Ordered
                                </Header>

                                <Header align="right">
                                    Previously
                                    Received
                                </Header>

                                <Header align="right">
                                    Remaining
                                </Header>

                                <Header>
                                    Received
                                    Now
                                </Header>
                            </tr>
                        </thead>

                        <tbody>
                            {receivableLines.map(
                                (line) => {
                                    const remaining =
                                        roundQuantity(
                                            line.orderedQuantity -
                                            line.receivedQuantity,
                                        );

                                    return (
                                        <tr
                                            key={
                                                line.id
                                            }
                                            className="border-b border-[var(--color-border)] last:border-b-0"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="font-medium">
                                                    {
                                                        line.description
                                                    }
                                                </div>

                                                <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                                                    {
                                                        line.sku
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm">
                                                {
                                                    line.unitSymbol
                                                }
                                            </td>

                                            <NumberCell
                                                value={
                                                    line.orderedQuantity
                                                }
                                            />

                                            <NumberCell
                                                value={
                                                    line.receivedQuantity
                                                }
                                            />

                                            <td className="px-4 py-4 text-right text-sm font-semibold">
                                                {
                                                    remaining
                                                }
                                            </td>

                                            <td className="w-[190px] px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min={
                                                            0
                                                        }
                                                        max={
                                                            remaining
                                                        }
                                                        step="0.01"
                                                        value={
                                                            quantities[
                                                            line.id
                                                            ] ??
                                                            ""
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            setQuantity(
                                                                line.id,
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="0"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            receiveRemaining(
                                                                line.id,
                                                                remaining,
                                                            )
                                                        }
                                                        className="whitespace-nowrap text-[10px] font-semibold text-[var(--color-primary)] hover:underline"
                                                    >
                                                        All
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                },
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]">
                <Field label="Notes">
                    <textarea
                        value={
                            notes
                        }
                        onChange={(
                            event,
                        ) =>
                            setNotes(
                                event
                                    .target
                                    .value,
                            )
                        }
                        className="min-h-[100px] w-full resize-y rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                        placeholder="Receiving notes, damaged packaging, delivery information..."
                    />
                </Field>
            </div>

            <div className="mt-5 flex justify-end gap-3">
                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            `/purchases/${purchaseOrder.id}`,
                        )
                    }
                >
                    Cancel
                </Button>

                <Button
                    variant="accent"
                    onClick={
                        handlePostReceipt
                    }
                >
                    <PackageCheck
                        size={15}
                    />

                    Post Receipt
                </Button>
            </div>
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
            <div className="mb-1.5 text-xs font-medium">
                {label}

                {required && (
                    <span className="ml-1 text-red-600">
                        *
                    </span>
                )}
            </div>

            {children}
        </label>
    );
}

function Header({
    children,
    align = "left",
}: {
    children:
    React.ReactNode;
    align?:
    | "left"
    | "right";
}) {
    return (
        <th
            className={[
                "h-10 px-4 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]",

                align ===
                    "right"
                    ? "text-right"
                    : "text-left",
            ].join(" ")}
        >
            {children}
        </th>
    );
}

function NumberCell({
    value,
}: {
    value: number;
}) {
    return (
        <td className="px-4 py-4 text-right text-sm">
            {value.toLocaleString(
                "en-AU",
            )}
        </td>
    );
}

function roundQuantity(
    value: number,
) {
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            10000,
        ) / 10000
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

const selectClassName =
    "h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--color-primary)]";