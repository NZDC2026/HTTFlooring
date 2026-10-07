import {
    Badge,
} from "../../../components/ui/Badge";

import type {
    SupplierBillStatus,
} from "../types/supplierBill";

interface Props {
    status:
    SupplierBillStatus;
}

export function SupplierBillStatusBadge({
    status,
}: Props) {
    switch (status) {
        case "OPEN":
            return (
                <Badge variant="warning">
                    Open
                </Badge>
            );

        case "PARTIALLY_PAID":
            return (
                <Badge variant="info">
                    Partially Paid
                </Badge>
            );

        case "PAID":
            return (
                <Badge variant="success">
                    Paid
                </Badge>
            );

        case "VOID":
            return (
                <Badge variant="neutral">
                    Void
                </Badge>
            );
    }
}