import { supplierContacts } from "../data/accountContacts";
import { AccountContactsEditor } from "./AccountContactsEditor";
import { CurrencySelect } from "../../currency/CurrencyFields";
import type { Currency } from "../../currency/currency";
import { PaymentTermsFields } from "../../payment-terms/PaymentTermsFields";
import {
    zodResolver,
} from "@hookform/resolvers/zod";

import {
    Controller,
    useForm,
} from "react-hook-form";

import {
    Button,
} from "../../../components/ui/Button";

import {
    Card,
    CardContent,
} from "../../../components/ui/Card";

import {
    Input,
} from "../../../components/ui/Input";

import {
    FormField,
} from "./FormField";

import {
    supplierFormSchema,
    supplierStatuses,
    type SupplierFormValues,
} from "../schemas/supplierSchemas";

import type {
    Supplier,
} from "../types/supplier";

interface Props {
    supplier?: Supplier;

    submitLabel: string;

    onSubmit: (
        values: SupplierFormValues,
    ) => void | Promise<void>;

    onCancel: () => void;
}

const selectClassName = `
    h-10 w-full rounded-lg
    border border-[var(--color-border)]
    bg-white px-3
    text-sm
    text-[var(--color-text)]
    outline-none
    transition
    focus:border-[var(--color-primary)]
`;

const textareaClassName = `
    min-h-[120px] w-full resize-y
    rounded-lg
    border border-[var(--color-border)]
    bg-white px-3 py-2.5
    text-sm
    text-[var(--color-text)]
    outline-none
    transition
    focus:border-[var(--color-primary)]
`;

export function SupplierForm({
    supplier,
    submitLabel,
    onSubmit,
    onCancel,
}: Props) {
    const {
        register,
        watch,
        setValue,
        control,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } =
        useForm<SupplierFormValues>({
            resolver:
                zodResolver(
                    supplierFormSchema,
                ),

            defaultValues: {
                contacts: supplier ? supplierContacts(supplier) : [],
                businessName:
                    supplier?.businessName ??
                    "",

                tradingName:
                    supplier?.tradingName ??
                    "",

                abn:
                    supplier?.abn ??
                    "",

                status:
                    supplier?.status ??
                    "ACTIVE",

                email:
                    supplier?.email ??
                    "",

                phone:
                    supplier?.phone ??
                    "",

                website:
                    supplier?.website ??
                    "",

                contactName:
                    supplier?.contactName ??
                    "",

                addressLine1:
                    supplier?.addressLine1 ??
                    "",

                addressLine2:
                    supplier?.addressLine2 ??
                    "",

                suburb:
                    supplier?.suburb ??
                    "",

                state:
                    supplier?.state ??
                    "",

                postcode:
                    supplier?.postcode ??
                    "",

                country:
                    supplier?.country ??
                    "",

                currency: (supplier?.currency ?? "AUD") as Currency,
                paymentTermsType: supplier?.paymentTermsType ?? (supplier ? undefined : "DAYS"),
                paymentTermsDays:
                    supplier?.paymentTermsDays ??
                    30,

                taxRegistered:
                    supplier?.taxRegistered ??
                    true,

                notes:
                    supplier?.notes ??
                    "",
            },
        });

    return (
        <form
            onSubmit={
                handleSubmit(
                    onSubmit,
                )
            }
            className="space-y-4"
            noValidate
        >
            <Card>
                <CardContent>
                    <SectionHeader
                        title="Business Details"
                        description="Basic supplier and trading information."
                    />

                    <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                        <FormField
                            label="Business Name"
                            required
                            error={
                                errors.businessName
                                    ?.message
                            }
                        >
                            <Input
                                {...register(
                                    "businessName",
                                )}
                                placeholder="Melbourne Flooring Wholesale Pty Ltd"
                                autoFocus
                            />
                        </FormField>

                        <FormField
                            label="Trading Name"
                            error={
                                errors.tradingName
                                    ?.message
                            }
                        >
                            <Input
                                {...register(
                                    "tradingName",
                                )}
                                placeholder="Melbourne Flooring Wholesale"
                            />
                        </FormField>

                        <FormField
                            label="ABN"
                            error={
                                errors.abn
                                    ?.message
                            }
                            description="Australian Business Number — 11 digits."
                        >
                            <Input
                                {...register(
                                    "abn",
                                )}
                                placeholder="12 345 678 901"
                            />
                        </FormField>

                        <FormField
                            label="Status"
                            required
                            error={
                                errors.status
                                    ?.message
                            }
                        >
                            <Controller
                                control={
                                    control
                                }
                                name="status"
                                render={({
                                    field,
                                }) => (
                                    <select
                                        {...field}
                                        className={
                                            selectClassName
                                        }
                                    >
                                        {supplierStatuses.map(
                                            (
                                                status,
                                            ) => (
                                                <option
                                                    key={
                                                        status
                                                    }
                                                    value={
                                                        status
                                                    }
                                                >
                                                    {status ===
                                                        "ACTIVE"
                                                        ? "Active"
                                                        : "Inactive"}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                )}
                            />
                        </FormField>
                        <FormField label="Website" error={errors.website?.message}><Input {...register("website")} placeholder="https://example.com"/></FormField>
                        <FormField label="Business landline" error={errors.phone?.message}><Input {...register("phone")} type="tel" placeholder="03 9000 2100"/></FormField>
                        <FormField label="Business email" error={errors.email?.message}><Input {...register("email")} type="email" placeholder="accounts@example.com"/></FormField>
                    </div>
                </CardContent>
            </Card>

            <Controller name="contacts" control={control} render={({field})=><AccountContactsEditor value={field.value??[]} onChange={field.onChange} error={errors.contacts ? "Check contact names and email addresses; choose only one primary and one accountant contact." : undefined}/>}/>


            <Card>
                <CardContent>
                    <SectionHeader
                        title="Address"
                        description="Supplier business or remittance address."
                    />

                    <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                        <div className="col-span-2">
                            <FormField
                                label="Address Line 1"
                                error={
                                    errors.addressLine1
                                        ?.message
                                }
                            >
                                <Input
                                    {...register(
                                        "addressLine1",
                                    )}
                                    />
                            </FormField>
                        </div>

                        <div className="col-span-2">
                            <FormField
                                label="Address Line 2"
                                error={
                                    errors.addressLine2
                                        ?.message
                                }
                            >
                                <Input
                                    {...register(
                                        "addressLine2",
                                    )}
                                />
                            </FormField>
                        </div>

                        <FormField
                            label="Suburb"
                            error={
                                errors.suburb
                                    ?.message
                            }
                        >
                            <Input
                                {...register(
                                    "suburb",
                                )}
                            />
                        </FormField>

                        <FormField
                            label="State"
                            error={
                                errors.state
                                    ?.message
                            }
                        >
                            <Input
                                {...register(
                                    "state",
                                )}
                            />
                        </FormField>

                        <FormField
                            label="Postcode"
                            error={
                                errors.postcode
                                    ?.message
                            }
                        >
                            <Input
                                {...register(
                                    "postcode",
                                )}
                            />
                        </FormField>

                        <FormField
                            label="Country"
                            required
                            error={
                                errors.country
                                    ?.message
                            }
                        >
                            <Input
                                {...register(
                                    "country",
                                )}
                            />
                        </FormField>
                    </div>
                    <details className="mt-3 text-xs text-[var(--color-text-secondary)]">
                        <summary className="cursor-pointer">Sample · Supplier address</summary>
                        <p className="mt-2">18 Sample Trade Drive · Dandenong South · VIC 3175 · Australia</p>
                    </details>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <SectionHeader
                        title="Purchasing & Payment"
                        description="Default purchasing and accounts payable settings."
                    />

                    <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                        <FormField
                            label="Payment Terms"
                            required
                            error={
                                errors.paymentTermsDays
                                    ?.message
                            }
                        >
                            <PaymentTermsFields value={{paymentTermsDays: watch("paymentTermsDays"), paymentTermsType: watch("paymentTermsType")}}
                                onChange={value => {
                                    setValue("paymentTermsType", value.paymentTermsType, {shouldDirty: true});
                                    setValue("paymentTermsDays", value.paymentTermsDays, {shouldDirty: true, shouldValidate: true});
                                }}/>
                        </FormField>

                        <FormField label="Currency" description="Default currency for new purchases and supplier payments.">
                            <CurrencySelect value={watch("currency") ?? "AUD"} onChange={value=>setValue("currency",value,{shouldDirty:true})}/><details className="mt-2 text-xs text-amber-900"><summary>Sample · Purchase currencies</summary><p>USD 1,000 · AUD 1,500 · RMB 7,000 · Synthetic display examples.</p></details>
                        </FormField>

                        <div className="col-span-2">
                            <Controller
                                control={
                                    control
                                }
                                name="taxRegistered"
                                render={({
                                    field,
                                }) => (
                                    <label className="flex cursor-pointer items-center gap-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={
                                                field.value
                                            }
                                            onChange={
                                                field.onChange
                                            }
                                            className="h-4 w-4 accent-[var(--color-primary)]"
                                        />

                                        <span>
                                            Supplier
                                            is GST
                                            registered
                                        </span>
                                    </label>
                                )}
                            />
                        </div>

                        <div className="col-span-2">
                            <FormField
                                label="Notes"
                                error={
                                    errors.notes
                                        ?.message
                                }
                            >
                                <textarea
                                    {...register(
                                        "notes",
                                    )}
                                    className={
                                        textareaClassName
                                    }
                                    placeholder="Internal supplier notes..."
                                />
                            </FormField>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={
                        onCancel
                    }
                    disabled={
                        isSubmitting
                    }
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    variant="accent"
                    disabled={
                        isSubmitting
                    }
                >
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}

function SectionHeader({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="mb-6">
            <h2 className="font-display text-xl">
                {title}
            </h2>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {description}
            </p>
        </div>
    );
}