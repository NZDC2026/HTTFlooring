import {
    Badge,
} from "../../../components/ui/Badge";

import type {
    PurchaseOrderStatus,
} from "../types/purchaseOrder";

interface Props {
    status:
    PurchaseOrderStatus;
}

export function PurchaseOrderStatusBadge({
    status,
}: Props) {
    const config =
        getConfig(
            status,
        );

    return (
        <Badge
            variant={
                config.variant
            }
        >
            {config.label}
        </Badge>
    );
}

function getConfig(
    status:
        PurchaseOrderStatus,
): {
    label: string;

    variant:
    | "neutral"
    | "success"
    | "warning"
    | "danger"
    | "info";
} {
    switch (status) {
        case "DRAFT":
            return {
                label: "Draft",
                variant:
                    "neutral",
            };

        case "APPROVED":
            return {
                label:
                    "Approved",
                variant:
                    "info",
            };

        case "SENT":
            return {
                label: "Sent",
                variant:
                    "warning",
            };

        case "PARTIALLY_RECEIVED":
            return {
                label:
                    "Partially received",
                variant:
                    "warning",
            };

        case "RECEIVED":
            return {
                label:
                    "Received",
                variant:
                    "success",
            };

        case "BILLED":
            return {
                label:
                    "Billed",
                variant:
                    "success",
            };

        case "CANCELLED":
            return {
                label:
                    "Cancelled",
                variant:
                    "danger",
            };
    }
}