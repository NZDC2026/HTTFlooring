import { Badge } from "../../../components/ui/Badge";

import type { CustomerStatus } from "../types/customer";

interface CustomerStatusBadgeProps {
    status: CustomerStatus;
}

export const customerStatusLabels: Record<CustomerStatus, string> = {
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
                {customerStatusLabels[status]}
            </Badge>
        );
    }

    if (status === "ON_HOLD") {
        return (
            <Badge variant="warning">
                {customerStatusLabels[status]}
            </Badge>
        );
    }

    return (
        <Badge variant="neutral">
            {customerStatusLabels[status]}
        </Badge>
    );
}