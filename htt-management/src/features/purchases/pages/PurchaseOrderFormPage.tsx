import { feedback } from "../../../components/ui/feedback";
import {
    ArrowLeft,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
    useSearchParams,
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
    const [query]=useSearchParams();
    const navigate =
        useNavigate();

    const {
        purchaseOrderId,
    } = useParams();

    const purchaseOrder =
        usePurchaseOrder(
            purchaseOrderId,
        );

    const quotation=query.get("quotation")==="1"||purchaseOrder?.status==="QUOTATION";
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
        !["DRAFT","QUOTATION"].includes(purchaseOrder.status)
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
        issue = false,
    ) {
        try {
            if (
                isCreate
            ) {
                const created = quotation?purchaseOrderRepository.createQuotation(draft):issue?purchaseOrderRepository.saveAndIssue(draft):purchaseOrderRepository.create(draft);

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

            const updated = issue?purchaseOrderRepository.saveAndIssue(draft,purchaseOrder.id):purchaseOrderRepository.updateDraft(purchaseOrder.id,draft);

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
            feedback.error(
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

                <h1 className="text-[26px] font-bold leading-tight text-emerald-900">
                    {isCreate
                        ? quotation?"New Purchase Quotation":"New Purchase Order"
                        : `Edit ${purchaseOrder?.purchaseOrderNumber}`}
                </h1>

                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {isCreate
                        ? quotation?"Record supplier pricing. Save the quotation, then convert it to an order when confirmed.":"Create a purchase order to a supplier. Save as draft or issue to the supplier."
                        : "Update this draft purchase order before approval."}
                </p>
            </div>

            <PurchaseOrderForm quotation={quotation}
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