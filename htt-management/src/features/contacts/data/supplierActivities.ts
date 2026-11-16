import { z } from "zod";
import { requireDateKey } from "../../../lib/businessDate";
const date = z.string().refine(value=>{try {requireDateKey(value);return true;}catch{return false;}},"Enter a valid due date.");
export const supplierActivityInput = z.object({supplierId:z.string().min(1),operationId:z.uuid(),kind:z.enum(["Note","Task"]),text:z.string().trim().min(1).max(2000),due:date.optional(),documentType:z.enum(["Order","Invoice"]).optional(),documentId:z.string().min(1).optional()}).strict().refine(v=>v.kind!=="Task"||!!v.due,"Tasks require a due date.");
export const supplierActivityAction = z.object({supplierId:z.string().min(1),activityId:z.string().min(1),operationId:z.uuid(),action:z.enum(["reply","complete"]),text:z.string().trim().min(1).max(2000)}).strict();
const event = z.object({id:z.string().min(1),operationId:z.uuid(),actorId:z.string().min(1),actorName:z.string().min(1),at:z.iso.datetime(),text:z.string().min(1).max(2000)});
export const supplierActivitySchema = event.extend({assignedTo:z.string().optional(),assignedName:z.string().optional(),priority:z.enum(['Normal','High','Low']).optional(),taskType:z.enum(['Order follow-up','Payment follow-up','Shipment follow-up','Documents','Other']).optional(),kind:z.enum(["Note","Task"]),due:date.optional(),documentType:z.enum(["Order","Invoice"]).optional(),documentId:z.string().min(1).optional(),replies:z.array(event),completion:event.optional()});
export type SupplierActivity = z.infer<typeof supplierActivitySchema>;
