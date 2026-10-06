import { zodResolver } from "@hookform/resolvers/zod";

import {
    Controller,
    useForm,
} from "react-hook-form";

import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import { FormField } from "./FormField";

import {
    businessTypes,
    customerFormSchema,
    customerStatuses,
    type CustomerFormValues,
} from "../schemas/customerSchemas";

import type { Customer } from "../types/customer";

interface CustomerFormProps {
    customer?: Customer;

    submitLabel?: string;

    onSubmit: (
        values: CustomerFormValues,
    ) => void | Promise<void>;

    onCancel: () => void;
}

export function CustomerForm({
    customer,
    submitLabel,
    onSubmit,
    onCancel,
}: CustomerFormProps) {
    const {
        register,
        control,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
            isDirty,
        },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(
            customerFormSchema,
        ),

        defaultValues: {
            businessName:
                customer?.businessName ?? "",

            tradingName:
                customer?.tradingName ?? "",

            abn: customer?.abn ?? "",

            businessType:
                customer?.businessType ??
                "Flooring Retailer",

            status:
                customer?.status ?? "ACTIVE",

            email: customer?.email ?? "",

            phone: customer?.phone ?? "",

            website:
                customer?.website ?? "",

            creditLimit:
                customer?.creditLimit ?? 0,

            paymentTermsDays:
                customer?.paymentTermsDays ?? 30,
        },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
        >
            <Card>
                <CardContent>
                    <div className="mb-6">
                        <h2 className="font-display text-xl">
                            Business Details
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Basic customer and trading
                            information.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                        <FormField
                            label="Business Name"
                            required
                            error={
                                errors.businessName?.message
                            }
                        >
                            <Input
                                {...register(
                                    "businessName",
                                )}
                                placeholder="ABC Flooring Pty Ltd"
                                autoFocus
                            />
                        </FormField>

                        <FormField
                            label="Trading Name"
                            error={
                                errors.tradingName?.message
                            }
                        >
                            <Input
                                {...register(
                                    "tradingName",
                                )}
                                placeholder="ABC Flooring"
                            />
                        </FormField>

                        <FormField
                            label="ABN"
                            error={errors.abn?.message}
                            description="Australian Business Number — 11 digits."
                        >
                            <Input
                                {...register("abn")}
                                placeholder="12 345 678 901"
                            />
                        </FormField>

                        <FormField
                            label="Business Type"
                            required
                            error={
                                errors.businessType?.message
                            }
                        >
                            <Controller
                                control={control}
                                name="businessType"
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className={selectClassName}
                                    >
                                        {businessTypes.map(
                                            (businessType) => (
                                                <option
                                                    key={businessType}
                                                    value={businessType}
                                                >
                                                    {businessType}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                )}
                            />
                        </FormField>

                        <FormField
                            label="Status"
                            required
                            error={
                                errors.status?.message
                            }
                        >
                            <Controller
                                control={control}
                                name="status"
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className={selectClassName}
                                    >
                                        {customerStatuses.map(
                                            (status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {getStatusLabel(
                                                        status,
                                                    )}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                )}
                            />
                        </FormField>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <div className="mb-6">
                        <h2 className="font-display text-xl">
                            Contact Details
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            General contact information for
                            the business.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                        <FormField
                            label="Business Email"
                            error={errors.email?.message}
                        >
                            <Input
                                {...register("email")}
                                type="email"
                                placeholder="accounts@example.com.au"
                            />
                        </FormField>

                        <FormField
                            label="Business Phone"
                            error={errors.phone?.message}
                        >
                            <Input
                                {...register("phone")}
                                type="tel"
                                placeholder="03 9123 4567"
                            />
                        </FormField>

                        <div className="col-span-2">
                            <FormField
                                label="Website"
                                error={
                                    errors.website?.message
                                }
                            >
                                <Input
                                    {...register("website")}
                                    placeholder="www.example.com.au"
                                />
                            </FormField>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <div className="mb-6">
                        <h2 className="font-display text-xl">
                            Account &amp; Trading
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Credit and payment settings for
                            this customer.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                        <FormField
                            label="Credit Limit"
                            required
                            error={
                                errors.creditLimit?.message
                            }
                            description="Maximum approved customer credit."
                        >
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
                                    $
                                </span>

                                <Input
                                    {...register(
                                        "creditLimit",
                                        {
                                            valueAsNumber: true,
                                        },
                                    )}
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className="pl-7"
                                />
                            </div>
                        </FormField>

                        <FormField
                            label="Payment Terms"
                            required
                            error={
                                errors.paymentTermsDays
                                    ?.message
                            }
                            description="Number of days allowed before payment is due."
                        >
                            <div className="relative">
                                <Input
                                    {...register(
                                        "paymentTermsDays",
                                        {
                                            valueAsNumber: true,
                                        },
                                    )}
                                    type="number"
                                    min={0}
                                    max={365}
                                    step={1}
                                    className="pr-14"
                                />

                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
                                    days
                                </span>
                            </div>
                        </FormField>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-5">
                <div className="text-[11px] text-[var(--color-text-muted)]">
                    {isDirty
                        ? "You have unsaved changes."
                        : customer
                            ? `Editing ${customer.code}`
                            : "Complete the required fields to create the customer."}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="accent"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Saving..."
                            : submitLabel ??
                            (customer
                                ? "Save changes"
                                : "Create customer")}
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

function getStatusLabel(
    status:
        | "ACTIVE"
        | "ON_HOLD"
        | "INACTIVE",
) {
    switch (status) {
        case "ACTIVE":
            return "Active";

        case "ON_HOLD":
            return "On hold";

        case "INACTIVE":
            return "Inactive";
    }
}