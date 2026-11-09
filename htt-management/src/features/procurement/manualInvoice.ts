import {z} from 'zod';
import {fxSchema} from '../currency/currency';
export const manualInvoiceSchema=z.object({supplierId:z.string(),fx:fxSchema.extend({rate:z.number().finite().nonnegative()}).optional(),lines:z.array(z.object({sku:z.string().max(100).optional(),description:z.string().max(500),quantity:z.number().finite().nonnegative(),unitSymbol:z.string().max(40),coveragePerUnit:z.number().finite().nonnegative().optional(),unitCost:z.number().finite().nonnegative(),taxRate:z.number().finite().min(0).max(1)}).strict()).max(80)}).strict();
export type ManualInvoice=z.infer<typeof manualInvoiceSchema>;
export const emptyManualInvoice=():ManualInvoice=>({supplierId:'',lines:[]});
export function readManualInvoice(text?:string):ManualInvoice{return text?manualInvoiceSchema.parse(JSON.parse(text)):emptyManualInvoice();}
export function manualInvoiceTotals(manual:ManualInvoice){const rate=manual.fx?.rate??1;let subtotal=0,taxAmount=0,qty=0;const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;for(const l of manual.lines){const area=l.coveragePerUnit??(/^(m²|m2|sqm)$/i.test(l.unitSymbol)?1:0);qty+=l.quantity*area;const net=round(l.quantity*l.unitCost*rate);subtotal+=net;taxAmount+=round(net*l.taxRate);}return {subtotal:round(subtotal),taxAmount:round(taxAmount),total:round(subtotal+taxAmount),qty:Math.round(qty*1e6)/1e6};}
