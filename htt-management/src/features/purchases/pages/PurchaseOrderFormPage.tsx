import {
    ArrowLeft,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    PurchaseOrderForm,
} from "../components/PurchaseOrderForm";

import {
    purchaseOrderRepository,
} from "../data/purchaseOrderRepository";

import {
    usePurchaseOrder,
} from "../data/usePurchaseOrders";

import type {
    PurchaseOrderDraft,
} from "../types/purchaseOrder";

interface Props {
    mode:
    | "create"
    | "edit";
}

export function PurchaseOrderFormPage({
    mode,
}: Props) {
    const navigate =
        useNavigate();

    const {
        purchaseOrderId,
    } = useParams();

    const purchaseOrder =
        usePurchaseOrder(
            purchaseOrderId,
        );

    const isCreate =
        mode ===
        "create";

    if (
        !isCreate &&
        !purchaseOrder
    ) {
        return (
            <Navigate
                to="/purchases"
                replace
            />
        );
    }

    if (
        !isCreate &&
        purchaseOrder &&
        purchaseOrder.status !==
        "DRAFT"
    ) {
        return (
            <Navigate
                to={`/purchases/${purchaseOrder.id}`}
                replace
            />
        );
    }

    function handleSave(
        draft:
            PurchaseOrderDraft,
    ) {
        try {
            if (
                isCreate
            ) {
                const created =
                    purchaseOrderRepository.create(
                        draft,
                    );

                navigate(
                    `/purchases/${created.id}`,
                    {
                        replace:
                            true,
                    },
                );

                return;
            }

            if (
                !purchaseOrder
            ) {
                return;
            }

            const updated =
                purchaseOrderRepository.updateDraft(
                    purchaseOrder.id,
                    draft,
                );

            navigate(
                `/purchases/${updated.id}`,
                {
                    replace:
                        true,
                },
            );
        } catch (
        error
        ) {
            window.alert(
                error instanceof
                    Error
                    ? error.message
                    : "Unable to save purchase order.",
            );
        }
    }

    function handleCancel() {
        if (
            purchaseOrder
        ) {
            navigate(
                `/purchases/${purchaseOrder.id}`,
            );

            return;
        }

        navigate(
            "/purchases",
        );
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={
                    handleCancel
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={
                        14
                    }
                />

                {purchaseOrder
                    ? "Back to purchase order"
                    : "Back to purchases"}
            </button>

            <div className="mb-7">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                    Purchases
                </p>

                <h1 className="font-display text-[34px] leading-tight">
                    {isCreate
                        ? "New Purchase Order"
                        : `Edit ${purchaseOrder?.purchaseOrderNumber}`}
                </h1>

                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {isCreate
                        ? "Create a draft supplier purchase order."
                        : "Update this draft purchase order before approval."}
                </p>
            </div>

            <PurchaseOrderForm
                purchaseOrder={
                    purchaseOrder
                }
                onSave={
                    handleSave
                }
                onCancel={
                    handleCancel
                }
            />
        </div>
    );
}