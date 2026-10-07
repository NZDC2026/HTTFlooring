import { z } from "zod";

export const customerPricingMethods = [
    "FIXED_PRICE",
    "DISCOUNT_PERCENT",
] as const;

export const customerPriceFormSchema = z
    .object({
        productId: z
            .string()
            .trim()
            .min(1, "Product is required"),

        unitId: z
            .string()
            .trim()
            .min(1, "Unit is required"),

        pricingMethod: z.enum(
            customerPricingMethods,
        ),

        fixedPrice: z.number().optional(),

        discountPercent:
            z.number().optional(),

        effectiveFrom: z
            .string()
            .trim()
            .min(
                1,
                "Effective from date is required",
            ),

        effectiveTo: z.string().trim(),

        active: z.boolean(),
    })
    .superRefine((values, context) => {
        if (
            values.pricingMethod ===
            "FIXED_PRICE"
        ) {
            if (
                values.fixedPrice === undefined ||
                Number.isNaN(values.fixedPrice)
            ) {
                context.addIssue({
                    code: "custom",
                    path: ["fixedPrice"],
                    message:
                        "Customer price is required",
                });
            } else if (
                values.fixedPrice < 0
            ) {
                context.addIssue({
                    code: "custom",
                    path: ["fixedPrice"],
                    message:
                        "Customer price cannot be negative",
                });
            }
        }

        if (
            values.pricingMethod ===
            "DISCOUNT_PERCENT"
        ) {
            if (
                values.discountPercent ===
                undefined ||
                Number.isNaN(
                    values.discountPercent,
                )
            ) {
                context.addIssue({
                    code: "custom",
                    path: ["discountPercent"],
                    message:
                        "Discount percentage is required",
                });
            } else if (
                values.discountPercent < 0 ||
                values.discountPercent > 100
            ) {
                context.addIssue({
                    code: "custom",
                    path: ["discountPercent"],
                    message:
                        "Discount must be between 0 and 100%",
                });
            }
        }

        if (
            values.effectiveTo &&
            values.effectiveFrom &&
            values.effectiveTo <
            values.effectiveFrom
        ) {
            context.addIssue({
                code: "custom",
                path: ["effectiveTo"],
                message:
                    "End date cannot be before the start date",
            });
        }
    });

export type CustomerPriceFormValues =
    z.infer<
        typeof customerPriceFormSchema
    >;