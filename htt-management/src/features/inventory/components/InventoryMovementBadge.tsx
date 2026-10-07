import {
    Badge,
} from "../../../components/ui/Badge";

import type {
    InventoryMovementType,
} from "../types/inventoryMovement";

interface Props {
    type:
    InventoryMovementType;
}

export function InventoryMovementBadge({
    type,
}: Props) {
    switch (type) {
        case "GOODS_RECEIPT":
            return (
                <Badge variant="success">
                    Goods Receipt
                </Badge>
            );

        case "ADJUSTMENT_IN":
            return (
                <Badge variant="success">
                    Adjustment In
                </Badge>
            );

        case "ADJUSTMENT_OUT":
            return (
                <Badge variant="warning">
                    Adjustment Out
                </Badge>
            );

        case "SALE":
            return (
                <Badge variant="info">
                    Sale
                </Badge>
            );

        case "RETURN_IN":
            return (
                <Badge variant="success">
                    Return In
                </Badge>
            );

        case "RETURN_OUT":
            return (
                <Badge variant="warning">
                    Return Out
                </Badge>
            );

        case "TRANSFER_IN":
            return (
                <Badge variant="info">
                    Transfer In
                </Badge>
            );

        case "TRANSFER_OUT":
            return (
                <Badge variant="neutral">
                    Transfer Out
                </Badge>
            );
    }
}