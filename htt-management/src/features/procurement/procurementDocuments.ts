import {z} from 'zod';
export const procurementDocumentSchema=z.object({materials:z.record(z.string(),z.string().max(15000)),freight:z.record(z.string(),z.string().max(15000)),customs:z.record(z.string(),z.string().max(15000))}).strict();
export type ProcurementDocuments=z.infer<typeof procurementDocumentSchema>;
export const emptyDocuments=():ProcurementDocuments=>({materials:{},freight:{},customs:{}});
export function readDocuments(value?:string):ProcurementDocuments{return value?procurementDocumentSchema.parse(JSON.parse(value)):emptyDocuments();}
