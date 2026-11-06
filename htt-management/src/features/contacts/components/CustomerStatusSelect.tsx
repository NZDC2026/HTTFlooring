import { ChevronDown } from "lucide-react";
import { usePermission } from "../../security/usePermission";
import { customerRepository } from "../data/customerRepository";
import { customerStatuses } from "../schemas/customerSchemas";
import { feedback } from "../../../components/ui/feedback";
import { CustomerStatusBadge, customerStatusLabels } from "./CustomerStatusBadge";
import type { Customer } from "../types/customer";
export function CustomerStatusSelect({ customer }: { customer: Customer }) {
    const canEdit = usePermission("contacts.write");
    if (!canEdit) return <CustomerStatusBadge status={customer.status}/>;

    const statusColor = {
        ACTIVE: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
        ON_HOLD: "bg-[var(--color-warning-soft)] text-[#8a641c]",
        INACTIVE: "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]",
    }[customer.status];

    return <span className="relative inline-flex">
    <select
        aria-label={`Status for ${customer.businessName}`}
        value={customer.status}
        onClick={event => event.stopPropagation()}
        className={`h-6 w-40 cursor-pointer appearance-none rounded-full border-0 pl-3 pr-7 text-xs font-medium ${statusColor}`}
        onChange={event => {
            try {
                customerRepository.setStatus(customer.id, event.target.value);
                feedback.success("Customer status updated.");
            } catch (error) {
                feedback.error(error instanceof Error ? error.message : "Could not update customer status.");
            }
        }}
    >
        {customerStatuses.map(status => <option key={status} value={status}>{customerStatusLabels[status]}</option>)}
    </select>
    <ChevronDown size={13} aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"/>
    </span>;
}

