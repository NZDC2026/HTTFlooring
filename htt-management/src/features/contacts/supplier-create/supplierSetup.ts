import {z} from 'zod';
import type {Supplier} from '../types/supplier';
import type {VerifiedPrincipal} from '../../security/rbac';
export const supplierSetupSchema=z.object({registrationId:z.string().trim().max(100),leadTimeDays:z.number().int().min(0).max(3650),paymentMode:z.enum(['COD','Prepaid','Net days','Days EOM'])}).strict();
export const supplierBankSchema=z.object({beneficiary:z.string().trim().min(1).max(200),bankName:z.string().trim().min(1).max(200),swift:z.string().trim().toUpperCase().refine(v=>!v||/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v),'SWIFT / BIC must contain 8 or 11 valid characters'),account:z.string().trim().min(1).max(80),address:z.string().trim().max(400)}).strict();
export const supplierCreationReceipt=z.object({operationId:z.uuid(),hash:z.string().regex(/^[a-f0-9]{64}$/),actorId:z.string().min(1)}).strict();
export const supplierBankHistory=z.object({actorId:z.string(),actorName:z.string(),at:z.iso.datetime(),action:z.literal('Bank details recorded')}).strict();
export type SupplierSetup=z.infer<typeof supplierSetupSchema>;
export type SupplierBank=z.infer<typeof supplierBankSchema>;
export function canSeeSupplierBank(p:VerifiedPrincipal|null){return !!p?.roles.some(r=>['ADMIN','FINANCE_ADMIN','ACCOUNTANT'].includes(r));}
export function supplierPublicView(s:Supplier,p:VerifiedPrincipal|null):Supplier{if(canSeeSupplierBank(p))return s;const {bankDetails:_bank,bankHistory:_history,...safe}=s;return safe;}
