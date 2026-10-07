import {
    Mail,
    Pencil,
    Phone,
    Plus,
    UserRound,
    Users,
} from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

import type {
    Customer,
    CustomerContact,
} from "../types/customer";

interface CustomerContactsTabProps {
    customer: Customer;

    onAdd: () => void;

    onEdit: (
        contact: CustomerContact,
    ) => void;
}

export function CustomerContactsTab({
    customer,
    onAdd,
    onEdit,
}: CustomerContactsTabProps) {
    function getLocationName(
        locationId: string | undefined,
    ) {
        if (!locationId) {
            return undefined;
        }

        return customer.locations.find(
            (location) =>
                location.id === locationId,
        )?.name;
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="font-display text-xl">
                        Contacts
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Manage the people associated with
                        this customer account.
                    </p>
                </div>

                <Button
                    variant="accent"
                    onClick={onAdd}
                >
                    <Plus size={15} />
                    Add contact
                </Button>
            </div>

            {customer.contacts.length === 0 ? (
                <EmptyContacts onAdd={onAdd} />
            ) : (
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]">
                    <div className="grid grid-cols-[1.4fr_1.5fr_1fr_120px_44px] gap-4 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                        <div>Contact</div>
                        <div>Details</div>
                        <div>Location</div>
                        <div>Status</div>
                        <div />
                    </div>

                    {customer.contacts.map(
                        (contact) => {
                            const locationName =
                                getLocationName(
                                    contact.locationId,
                                );

                            return (
                                <div
                                    key={contact.id}
                                    className="grid grid-cols-[1.4fr_1.5fr_1fr_120px_44px] items-center gap-4 border-b border-[var(--color-border)] px-5 py-4 last:border-b-0 hover:bg-[var(--color-surface-hover)]"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                                            <UserRound size={15} />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">
                                                {contact.firstName}{" "}
                                                {contact.lastName}
                                            </div>

                                            <div className="mt-0.5 truncate text-[11px] text-[var(--color-text-muted)]">
                                                {contact.jobTitle ??
                                                    "Contact"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="min-w-0 space-y-1.5">
                                        <div className="flex min-w-0 items-center gap-2 text-xs">
                                            <Mail
                                                size={12}
                                                className="shrink-0 text-[var(--color-text-muted)]"
                                            />

                                            <span className="truncate">
                                                {contact.email}
                                            </span>
                                        </div>

                                        {(contact.mobile ||
                                            contact.phone) && (
                                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                                    <Phone
                                                        size={12}
                                                        className="text-[var(--color-text-muted)]"
                                                    />

                                                    {contact.mobile ??
                                                        contact.phone}
                                                </div>
                                            )}
                                    </div>

                                    <div className="text-xs text-[var(--color-text-secondary)]">
                                        {locationName ?? "—"}
                                    </div>

                                    <div>
                                        {contact.isPrimary ? (
                                            <Badge variant="success">
                                                Primary
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                —
                                            </span>
                                        )}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            onEdit(contact)
                                        }
                                        aria-label={`Edit ${contact.firstName} ${contact.lastName}`}
                                    >
                                        <Pencil size={15} />
                                    </Button>
                                </div>
                            );
                        },
                    )}
                </div>
            )}
        </div>
    );
}

function EmptyContacts({
    onAdd,
}: {
    onAdd: () => void;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <Users size={20} />
            </div>

            <h3 className="mt-4 text-sm font-medium">
                No contacts yet
            </h3>

            <p className="mx-auto mt-2 max-w-[360px] text-xs leading-5 text-[var(--color-text-muted)]">
                Add the first person associated with
                this customer account.
            </p>

            <Button
                variant="secondary"
                className="mt-5"
                onClick={onAdd}
            >
                <Plus size={14} />
                Add contact
            </Button>
        </div>
    );
}