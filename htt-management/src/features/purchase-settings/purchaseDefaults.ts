import { paymentDueDate, paymentTermsTypeSchema, validatePaymentTerms, type PaymentTerms } from "../payment-terms/paymentTerms";
import { z } from 'zod';
import { configurationRows } from '../business-workspace/configurationState';
export const purchaseMethods = ['BANK_TRANSFER', 'CARD', 'CASH', 'CHEQUE', 'OTHER'] as const;
export const purchaseDefaultsSchema = z.object({ termsType:paymentTermsTypeSchema, termsDays:z.number().int().min(0).max(365), paymentMethod:z.enum(purchaseMethods), termsSource:z.enum(['SUPPLIER','PURCHASE_SETTINGS','LEGACY_30_DAY']), settingsRevision:z.string().regex(/^\d+$/).optional() }).strict().superRefine((value, context) => { try { validatePaymentTerms({paymentTermsDays:value.termsDays,paymentTermsType:value.termsType}); } catch(error) { context.addIssue({code:'custom',message:(error as Error).message,path:['termsDays']}); } });
export type PurchaseDefaults = z.infer<typeof purchaseDefaultsSchema>;
export function purchaseSettings() {
 const row=configurationRows.settings?.find(r=>r.section==='purchases'&&r.status==='Active');
 return {...row,termsType:row?.termsType,terms:row?.termsPolicy ? row.terms : '30',termsPolicy:row?.termsPolicy??'SUPPLIER',paymentMethod:row?.paymentMethod??'BANK_TRANSFER'};
}
export function purchaseDefaults(supplier?:PaymentTerms):PurchaseDefaults {
 const settings=purchaseSettings(), useSupplier=settings.termsPolicy==='SUPPLIER'&&supplier!==undefined;
 return purchaseDefaultsSchema.parse({termsType:useSupplier?supplier.paymentTermsType:settings.termsType,termsDays:useSupplier?supplier.paymentTermsDays:Number(settings.terms),paymentMethod:settings.paymentMethod,termsSource:useSupplier?'SUPPLIER':'PURCHASE_SETTINGS',settingsRevision:settings.revision});
}
// Legacy source orders keep their historical 30-day bill default, never acquire later settings.
export function orderDefaults(order:{purchaseDefaults?:PurchaseDefaults}):PurchaseDefaults {
 return order.purchaseDefaults??{termsDays:30,paymentMethod:'BANK_TRANSFER',termsSource:'LEGACY_30_DAY'};
}
export function purchaseDueDate(date:string, defaults:Pick<PurchaseDefaults,'termsDays'|'termsType'>) {
 return paymentDueDate(date,{paymentTermsDays:defaults.termsDays,paymentTermsType:defaults.termsType});
}
