import { z } from "zod";

export const businessTypes = [
    "Flooring Retailer",
    "Builder",
    "Developer",
    "Designer",
    "Architect",
    "Installer",
    "Other",
] as const;

export const customerStatuses = [
    "ACTIVE",
    "ON_HOLD",
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

            const normalized = value.replace(/\s/g, "");

            return /^\d{11}$/.test(normalized);
        },
        {
            message: "ABN must contain 11 digits",
        },
    );

export const customerFormSchema = z.object({
    businessName: z
        .string()
        .trim()
        .min(1, "Business name is required")
        .max(120, "Business name is too long"),

    tradingName: z
        .string()
        .trim()
        .max(120, "Trading name is too long"),

    abn: optionalAbn,

    businessType: z.enum(businessTypes),

    status: z.enum(customerStatuses),

    email: optionalEmail,

    phone: z
        .string()
        .trim()
        .max(40, "Phone number is too long"),

    website: z
        .string()
        .trim()
        .max(200, "Website is too long"),

    creditLimit: z
        .number({
            message: "Credit limit is required",
        })
        .min(0, "Credit limit cannot be negative"),

    paymentTermsDays: z
        .number({
            message: "Payment terms are required",
        })
        .int("Payment terms must be a whole number")
        .min(0, "Payment terms cannot be negative")
        .max(
            365,
            "Payment terms cannot exceed 365 days",
        ),
});

export const locationFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Location name is required")
        .max(100, "Location name is too long"),

    addressLine1: z
        .string()
        .trim()
        .min(1, "Address is required")
        .max(160, "Address is too long"),

    addressLine2: z
        .string()
        .trim()
        .max(160, "Address is too long"),

    suburb: z
        .string()
        .trim()
        .min(1, "Suburb is required")
        .max(100, "Suburb is too long"),

    state: z
        .string()
        .trim()
        .min(1, "State is required")
        .max(50, "State is too long"),

    postcode: z
        .string()
        .trim()
        .min(1, "Postcode is required")
        .max(20, "Postcode is too long"),

    country: z
        .string()
        .trim()
        .min(1, "Country is required")
        .max(100, "Country is too long"),

    phone: z
        .string()
        .trim()
        .max(40, "Phone number is too long"),

    isPrimary: z.boolean(),
});

export const contactFormSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1, "First name is required")
        .max(80, "First name is too long"),

    lastName: z
        .string()
        .trim()
        .min(1, "Last name is required")
        .max(80, "Last name is too long"),

    jobTitle: z
        .string()
        .trim()
        .max(100, "Job title is too long"),

    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Enter a valid email address"),

    phone: z
        .string()
        .trim()
        .max(40, "Phone number is too long"),

    mobile: z
        .string()
        .trim()
        .max(40, "Mobile number is too long"),

    locationId: z.string(),

    isPrimary: z.boolean(),
});

export type CustomerFormValues = z.infer<
    typeof customerFormSchema
>;

export type LocationFormValues = z.infer<
    typeof locationFormSchema
>;

export type ContactFormValues = z.infer<
    typeof contactFormSchema
>;