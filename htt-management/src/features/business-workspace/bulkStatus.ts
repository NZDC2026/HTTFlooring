import { z } from 'zod';
export const bulkStatusDomains=new Set(['tasks','promotions','templates','jobs','bank-rules','custom-reports','report-packs']);
export const bulkStatusSchema=z.object({operationId:z.string().uuid(),rows:z.array(z.object({id:z.string().min(1).max(100),expectedRevision:z.string().regex(/^\d{1,10}$/)}).strict()).min(1).max(100),status:z.enum(['Active','Inactive','Open','In progress','Completed'])}).strict();
export type BulkStatusInput=z.infer<typeof bulkStatusSchema>;
export function parseBulkStatus(domain:string,raw:unknown){if(!bulkStatusDomains.has(domain))throw new Error('Bulk status is not available for this register.');const input=bulkStatusSchema.parse(raw);if(new Set(input.rows.map(r=>r.id)).size!==input.rows.length)throw new Error('Select each record only once.');if(!(domain==='tasks'?['Open','In progress','Completed']:['Active','Inactive']).includes(input.status))throw new Error('Unsupported bulk status for this register.');return input;}
