import {
    Building2,
    MapPin,
    Pencil,
    Plus,
    Phone,
} from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

import type {
    Customer,
    CustomerLocation,
} from "../types/customer";

interface CustomerLocationsTabProps {
    customer: Customer;

    onAdd: () => void;

    onEdit: (
        location: CustomerLocation,
    ) => void;
}

export function CustomerLocationsTab({
    customer,
    onAdd,
    onEdit,
}: CustomerLocationsTabProps) {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="font-display text-xl">
                        Locations
                    </h2>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Manage offices, stores, warehouses
                        and delivery locations for this
                        customer.
                    </p>
                </div>

                <Button
                    variant="accent"
                    onClick={onAdd}
                >
                    <Plus size={15} />
                    Add location
                </Button>
            </div>

            {customer.locations.length === 0 ? (
                <EmptyLocations onAdd={onAdd} />
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {customer.locations.map(
                        (location) => (
                            <div
                                key={location.id}
                                className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-xs)]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                                            <MapPin size={17} />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-medium">
                                                    {location.name}
                                                </h3>

                                                {location.isPrimary && (
                                                    <Badge variant="success">
                                                        Primary
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                                                {location.addressLine1}

                                                {location.addressLine2 && (
                                                    <>
                                                        <br />
                                                        {
                                                            location.addressLine2
                                                        }
                                                    </>
                                                )}

                                                <br />

                                                {location.suburb},{" "}
                                                {location.state}{" "}
                                                {location.postcode}

                                                <br />

                                                {location.country}
                                            </div>

                                            {location.phone && (
                                                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                                    <Phone size={13} />

                                                    {location.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            onEdit(location)
                                        }
                                        aria-label={`Edit ${location.name}`}
                                    >
                                        <Pencil size={15} />
                                    </Button>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}

function EmptyLocations({
    onAdd,
}: {
    onAdd: () => void;
}) {
    return (
        <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <Building2 size={20} />
            </div>

            <h3 className="mt-4 text-sm font-medium">
                No locations yet
            </h3>

            <p className="mx-auto mt-2 max-w-[360px] text-xs leading-5 text-[var(--color-text-muted)]">
                Add the customer's first business,
                store, warehouse or delivery location.
            </p>

            <Button
                variant="secondary"
                className="mt-5"
                onClick={onAdd}
            >
                <Plus size={14} />
                Add location
            </Button>
        </div>
    );
}