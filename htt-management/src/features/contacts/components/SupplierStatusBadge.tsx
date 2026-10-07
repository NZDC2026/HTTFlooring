import {
    Badge,
} from "../../../components/ui/Badge";

import type {
    SupplierStatus,
} from "../types/supplier";

interface Props {
    status: SupplierStatus;
}

export function SupplierStatusBadge({
    status,
}: Props) {
    if (
        status === "ACTIVE"
    ) {
        return (
            <Badge variant="success">
                Active
            </Badge>
        );
    }

    return (
        <Badge variant="neutral">
            Inactive
        </Badge>
    );
}