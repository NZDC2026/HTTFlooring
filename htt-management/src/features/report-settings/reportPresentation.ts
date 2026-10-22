import { z } from 'zod';
import { businessSettings, configurationRows } from '../business-workspace/configurationState';
export const reportPresentationSchema=z.object({header:z.string().max(160),precision:z.number().int().min(2).max(4),basis:z.enum(['Accrual','Cash']),currency:z.enum(['BASE','AUD','NZD']),revision:z.string().regex(/^\d+$/).optional()}).strict();
export type ReportPresentation=z.infer<typeof reportPresentationSchema>;
export const legacyReportPresentation:ReportPresentation={header:'',precision:2,basis:'Accrual',currency:'BASE'};
export function reportSettings():ReportPresentation {
 const row=configurationRows.settings?.find(r=>r.section==='reports'&&r.status==='Active');
 // Legacy generic settings are not silently interpreted as an executable report policy.
 return row?.reportDefaults==='Yes'?reportPresentationSchema.parse({header:row.header,precision:Number(row.precision),basis:row.basis,currency:row.currency,revision:row.revision}):{...legacyReportPresentation};
}
export function reportNumber(value:number,settings:ReportPresentation=reportSettings()){if(!Number.isFinite(value))throw new Error('Invalid report amount.');return value.toFixed(settings.precision);}
export function reportMoney(value:number,currency=businessSettings().currency,settings:ReportPresentation=reportSettings()){return new Intl.NumberFormat('en-AU',{style:'currency',currency,minimumFractionDigits:settings.precision,maximumFractionDigits:settings.precision}).format(value);}
export function preferredReportCurrency(base:string,currencies:string[],settings:ReportPresentation=reportSettings()) {const desired=settings.currency==='BASE'?base:settings.currency;return currencies.includes(desired)?desired:base;}
