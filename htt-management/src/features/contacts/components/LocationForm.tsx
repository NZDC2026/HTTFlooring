import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

import { FormField } from "./FormField";

import {
    locationFormSchema,
    type LocationFormValues,
} from "../schemas/customerSchemas";

import type { CustomerLocation } from "../types/customer";

interface LocationFormProps {
    location?: CustomerLocation;
    onSubmit: (
        values: LocationFormValues,
    ) => void | Promise<void>;
    onCancel: () => void;
}

export function LocationForm({
    location,
    onSubmit,
    onCancel,
}: LocationFormProps) {
    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
            isDirty,
        },
    } = useForm<LocationFormValues>({
        resolver: zodResolver(locationFormSchema),

        defaultValues: {
            name: location?.name ?? "",
            addressLine1:
                location?.addressLine1 ?? "",
            addressLine2:
                location?.addressLine2 ?? "",
            suburb: location?.suburb ?? "",
            state: location?.state ?? "",
            postcode: location?.postcode ?? "",
            country:
                location?.country ?? "Australia",
            phone: location?.phone ?? "",
            isPrimary:
                location?.isPrimary ?? false,
        },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                <div className="col-span-2">
                    <FormField
                        label="Location Name"
                        required
                        error={errors.name?.message}
                    >
                        <Input
                            {...register("name")}
                            placeholder="Melbourne"
                            autoFocus
                        />
                    </FormField>
                </div>

                <div className="col-span-2">
                    <FormField
                        label="Address"
                        required
                        error={
                            errors.addressLine1?.message
                        }
                    >
                        <Input
                            {...register("addressLine1")}
                            placeholder="128 Trade Street"
                        />
                    </FormField>
                </div>

                <div className="col-span-2">
                    <FormField
                        label="Address Line 2"
                        error={
                            errors.addressLine2?.message
                        }
                    >
                        <Input
                            {...register("addressLine2")}
                            placeholder="Unit, suite or level"
                        />
                    </FormField>
                </div>

                <FormField
                    label="Suburb"
                    required
                    error={errors.suburb?.message}
                >
                    <Input
                        {...register("suburb")}
                        placeholder="Melbourne"
                    />
                </FormField>

                <FormField
                    label="State"
                    required
                    error={errors.state?.message}
                >
                    <Input
                        {...register("state")}
                        placeholder="VIC"
                    />
                </FormField>

                <FormField
                    label="Postcode"
                    required
                    error={errors.postcode?.message}
                >
                    <Input
                        {...register("postcode")}
                        placeholder="3000"
                    />
                </FormField>

                <FormField
                    label="Country"
                    required
                    error={errors.country?.message}
                >
                    <Input
                        {...register("country")}
                        placeholder="Australia"
                    />
                </FormField>

                <div className="col-span-2">
                    <FormField
                        label="Phone"
                        error={errors.phone?.message}
                    >
                        <Input
                            {...register("phone")}
                            type="tel"
                            placeholder="03 9123 4567"
                        />
                    </FormField>
                </div>

                <div className="col-span-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-4">
                        <input
                            {...register("isPrimary")}
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                        />

                        <div>
                            <div className="text-sm font-medium">
                                Primary location
                            </div>

                            <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                                Use this as the customer's
                                default business location.
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            <div className="mt-7 flex items-center justify-between border-t border-[var(--color-border)] pt-5">
                <span className="text-[11px] text-[var(--color-text-muted)]">
                    {isDirty
                        ? "You have unsaved changes."
                        : location
                            ? "Update this location."
                            : "Add a location to this customer."}
                </span>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="accent"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Saving..."
                            : location
                                ? "Save changes"
                                : "Add location"}
                    </Button>
                </div>
            </div>
        </form>
    );
}