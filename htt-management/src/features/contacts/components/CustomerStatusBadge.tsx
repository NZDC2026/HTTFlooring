import { Badge } from "../../../components/ui/Badge";

import type { CustomerStatus } from "../types/customer";

interface CustomerStatusBadgeProps {
    status: CustomerStatus;
}

const labels: Record<CustomerStatus, string> = {
    ACTIVE: "Active",
    ON_HOLD: "On hold",
    INACTIVE: "Inactive",
};

export function CustomerStatusBadge({
    status,
}: CustomerStatusBadgeProps) {
    if (status === "ACTIVE") {
        return (
            <Badge variant="success">
                {labels[status]}
            </Badge>
        );
    }

    if (status === "ON_HOLD") {
        return (
            <Badge variant="warning">
                {labels[status]}
            </Badge>
        );
    }

    return (
        <Badge variant="neutral">
            {labels[status]}
        </Badge>
    );
}