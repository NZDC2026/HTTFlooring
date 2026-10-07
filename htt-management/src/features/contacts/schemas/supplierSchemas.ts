import { z } from "zod";

export const supplierStatuses = [
    "ACTIVE",
    "INACTIVE",
] as const;

const optionalEmail = z
    .string()
    .trim()
    .refine(
        (value) =>
            value === "" ||
            z.string().email().safeParse(value).success,
        {
            message: "Enter a valid email address",
        },
    );

const optionalAbn = z
    .string()
    .trim()
    .refine(
        (value) => {
            if (value === "") {
                return true;
            }

            const normalized =
                value.replace(/\s/g, "");

            return /^\d{11}$/.test(normalized);
        },
        {
            message: "ABN must contain 11 digits",
        },
    );

export const supplierFormSchema =
    z.object({
        businessName: z
            .string()
            .trim()
            .min(
                1,
                "Business name is required",
            )
            .max(
                120,
                "Business name is too long",
            ),

        tradingName: z
            .string()
            .trim()
            .max(
                120,
                "Trading name is too long",
            ),

        abn: optionalAbn,

        status: z.enum(
            supplierStatuses,
        ),

        email: optionalEmail,

        phone: z
            .string()
            .trim()
            .max(
                40,
                "Phone number is too long",
            ),

        website: z
            .string()
            .trim()
            .max(
                200,
                "Website is too long",
            ),

        contactName: z
            .string()
            .trim()
            .max(
                120,
                "Contact name is too long",
            ),

        addressLine1: z
            .string()
            .trim()
            .max(
                160,
                "Address is too long",
            ),

        addressLine2: z
            .string()
            .trim()
            .max(
                160,
                "Address is too long",
            ),

        suburb: z
            .string()
            .trim()
            .max(
                100,
                "Suburb is too long",
            ),

        state: z
            .string()
            .trim()
            .max(
                50,
                "State is too long",
            ),

        postcode: z
            .string()
            .trim()
            .max(
                20,
                "Postcode is too long",
            ),

        country: z
            .string()
            .trim()
            .min(
                1,
                "Country is required",
            )
            .max(
                100,
                "Country is too long",
            ),

        paymentTermsDays: z
            .number({
                message:
                    "Payment terms are required",
            })
            .int(
                "Payment terms must be a whole number",
            )
            .min(
                0,
                "Payment terms cannot be negative",
            )
            .max(
                365,
                "Payment terms cannot exceed 365 days",
            ),

        taxRegistered:
            z.boolean(),

        notes: z
            .string()
            .trim()
            .max(
                2000,
                "Notes are too long",
            ),
    });

export type SupplierFormValues =
    z.infer<
        typeof supplierFormSchema
    >;