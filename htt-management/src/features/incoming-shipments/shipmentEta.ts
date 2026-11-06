import { z } from "zod";
import { requireDateKey } from "../../lib/businessDate";

const date = z.string().refine(value => {
    try { requireDateKey(value); return true; }
    catch { return false; }
}, "Enter a valid ETA date.");
export const etaChangeInput = z.object({
    id:z.string().min(1), operationId:z.uuid(),
    expectedRevision:z.number().int().nonnegative(),
    eta:date, reason:z.string().trim().min(3,"Enter a reason of at least 3 characters.").max(2000),
}).strict();
export const etaHistorySchema = z.object({
    operationId:z.uuid(), previousEta:date.optional(), eta:date,
    reason:z.string().trim().min(3).max(2000), actorId:z.string().min(1),
    actorName:z.string().min(1), at:z.iso.datetime(),
}).strict();
export type EtaChange = z.infer<typeof etaHistorySchema>;
export const incomingStatuses = ["APPROVED","SENT","PARTIALLY_RECEIVED"] as const;
