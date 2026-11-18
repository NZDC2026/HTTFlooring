import {readReorderHandoff} from '../supply/reorderHandoff';
import {useLocation} from 'react-router-dom';
import {publicPreview} from '../../security/webBridge';
import {PurchaseOrderEntryWorkspace} from '../entry/PurchaseOrderEntryWorkspace';
import { feedback } from "../../../components/ui/feedback";

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
    const entryLocation=useLocation(),handoff=readReorderHandoff(entryLocation.state?.reorderPlan,publicPreview||query.get("sample")==="1");
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

    if(isCreate&&!quotation)return <PurchaseOrderEntryWorkspace sample={publicPreview||query.get("sample")==="1"} initialSupplierId={handoff?.supplierId??query.get("supplierId")??""} initialPlan={handoff} onSave={handleSave} onCancel={()=>navigate("/purchases?tab=orders"+(query.get("sample")==="1"?"&sample=1":""))}/>;
    return (
        <div className="pb-8">
            <PurchaseOrderForm initialSupplierId={isCreate?query.get("supplierId")||"":""} initialSample={query.get("sample")==="1"} quotation={quotation}
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