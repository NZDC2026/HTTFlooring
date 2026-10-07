import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

import { FormField } from "./FormField";

import {
    contactFormSchema,
    type ContactFormValues,
} from "../schemas/customerSchemas";

import type {
    CustomerContact,
    CustomerLocation,
} from "../types/customer";

interface ContactFormProps {
    contact?: CustomerContact;
    locations: CustomerLocation[];

    onSubmit: (
        values: ContactFormValues,
    ) => void | Promise<void>;

    onCancel: () => void;
}

export function ContactForm({
    contact,
    locations,
    onSubmit,
    onCancel,
}: ContactFormProps) {
    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
            isDirty,
        },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),

        defaultValues: {
            firstName:
                contact?.firstName ?? "",
            lastName:
                contact?.lastName ?? "",
            jobTitle:
                contact?.jobTitle ?? "",
            email:
                contact?.email ?? "",
            phone:
                contact?.phone ?? "",
            mobile:
                contact?.mobile ?? "",
            locationId:
                contact?.locationId ?? "",
            isPrimary:
                contact?.isPrimary ?? false,
        },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                <FormField
                    label="First Name"
                    required
                    error={errors.firstName?.message}
                >
                    <Input
                        {...register("firstName")}
                        placeholder="John"
                        autoFocus
                    />
                </FormField>

                <FormField
                    label="Last Name"
                    required
                    error={errors.lastName?.message}
                >
                    <Input
                        {...register("lastName")}
                        placeholder="Smith"
                    />
                </FormField>

                <div className="col-span-2">
                    <FormField
                        label="Job Title"
                        error={errors.jobTitle?.message}
                    >
                        <Input
                            {...register("jobTitle")}
                            placeholder="Accounts Manager"
                        />
                    </FormField>
                </div>

                <div className="col-span-2">
                    <FormField
                        label="Email"
                        required
                        error={errors.email?.message}
                    >
                        <Input
                            {...register("email")}
                            type="email"
                            placeholder="john@example.com.au"
                        />
                    </FormField>
                </div>

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

                <FormField
                    label="Mobile"
                    error={errors.mobile?.message}
                >
                    <Input
                        {...register("mobile")}
                        type="tel"
                        placeholder="0412 345 678"
                    />
                </FormField>

                <div className="col-span-2">
                    <FormField
                        label="Location"
                        error={
                            errors.locationId?.message
                        }
                        description={
                            locations.length === 0
                                ? "Create a customer location before assigning one to this contact."
                                : "Optional — assign this contact to one of the customer's locations."
                        }
                    >
                        <select
                            {...register("locationId")}
                            className={selectClassName}
                        >
                            <option value="">
                                No location
                            </option>

                            {locations.map(
                                (location) => (
                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name}
                                    </option>
                                ),
                            )}
                        </select>
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
                                Primary contact
                            </div>

                            <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                                Use this person as the
                                customer's default contact.
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            <div className="mt-7 flex items-center justify-between border-t border-[var(--color-border)] pt-5">
                <span className="text-[11px] text-[var(--color-text-muted)]">
                    {isDirty
                        ? "You have unsaved changes."
                        : contact
                            ? "Update this contact."
                            : "Add a contact to this customer."}
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
                            : contact
                                ? "Save changes"
                                : "Add contact"}
                    </Button>
                </div>
            </div>
        </form>
    );
}

const selectClassName = [
    "h-10 w-full rounded-lg",
    "border border-[var(--color-border)]",
    "bg-white px-3",
    "text-sm text-[var(--color-text-primary)]",
    "outline-none transition",
    "hover:border-[var(--color-border-strong)]",
    "focus:border-[var(--color-primary)]",
    "focus:ring-2",
    "focus:ring-[var(--color-primary-soft)]",
].join(" ");