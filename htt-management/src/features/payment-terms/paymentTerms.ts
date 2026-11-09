import { z } from "zod";
import { requireDateKey } from "../../lib/businessDate";

export const paymentTermsTypes = ["COD", "DAYS", "DAY_OF_MONTH"] as const;
export type PaymentTermsType = typeof paymentTermsTypes[number];
export interface PaymentTerms {
    paymentTermsDays: number;
    paymentTermsType?: PaymentTermsType;
}
export const paymentTermsTypeSchema = z.enum(paymentTermsTypes).optional();
export function validatePaymentTerms(terms: PaymentTerms) {
    const type = terms.paymentTermsType ?? (terms.paymentTermsDays === 0 ? "COD" : "DAYS");
    if (!paymentTermsTypes.includes(type)) throw new Error("Invalid payment terms type.");
    if (!Number.isInteger(terms.paymentTermsDays) || terms.paymentTermsDays < 0 || terms.paymentTermsDays > 365)
        throw new Error("Payment terms must be a whole number from 0 to 365.");
    if (type === "COD" && terms.paymentTermsDays !== 0)
        throw new Error("COD must use zero days.");
    if (type === "DAY_OF_MONTH" && (terms.paymentTermsDays < 1 || terms.paymentTermsDays > 31))
        throw new Error("Day of month must be from 1 to 31.");
    return type;
}
export function paymentTermsLabel(terms: PaymentTerms) {
    const type = validatePaymentTerms(terms);
    if (type === "COD") return "COD";
    return type === "DAY_OF_MONTH" ? `No. ${terms.paymentTermsDays} End Of Month (next month)` : `No. ${terms.paymentTermsDays} Of Day`;
}
export function paymentDueDate(date: string, terms: PaymentTerms) {
    requireDateKey(date, "Document date");
    const type = validatePaymentTerms(terms);
    const result = new Date(date + "T00:00:00Z");
    if (type === "DAY_OF_MONTH") {
        const year = result.getUTCFullYear(), month = result.getUTCMonth() + 1;
        const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        result.setUTCDate(1);
        result.setUTCMonth(month);
        result.setUTCDate(Math.min(terms.paymentTermsDays, lastDay));
    } else result.setUTCDate(result.getUTCDate() + terms.paymentTermsDays);
    const key = result.toISOString().slice(0, 10);
    requireDateKey(key, "Due date");
    return key;
}


export function invoicePaymentTerms(customer: PaymentTerms | undefined, settings: {terms: string; termsType?: string}): PaymentTerms {
    return customer && (customer.paymentTermsType || customer.paymentTermsDays === 0) ? {paymentTermsDays:customer.paymentTermsDays,paymentTermsType:customer.paymentTermsType} : {
        paymentTermsDays: Number(settings.terms),
        paymentTermsType: paymentTermsTypeSchema.parse(settings.termsType),
    };
}

/** Per-document snapshot: an override never changes the customer's credit terms. */
export function salesDocumentPaymentTerms(override:PaymentTerms|undefined,customer:PaymentTerms|undefined,settings:{terms:string;termsType?:string}):PaymentTerms {
 const value=override??customer??invoicePaymentTerms(undefined,settings);
 const paymentTermsType=validatePaymentTerms(value);
 return {paymentTermsDays:value.paymentTermsDays,paymentTermsType};
}
export const documentPaymentTermsSchema=z.object({paymentTermsDays:z.number().int().min(0).max(365),paymentTermsType:z.enum(paymentTermsTypes).optional()}).strict().superRefine((v,ctx)=>{try{validatePaymentTerms(v);}catch(e){ctx.addIssue({code:'custom',message:(e as Error).message});}});
