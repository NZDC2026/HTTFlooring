/** Local business-document snapshot only; NOT atomic with Invoice, GL or refunds. */
import { canWriteMockRepository, readMockRepository, writeMockRepository } from "../../../lib/persistence/mockRepositoryStorage";
import type { CreditAllocation, CreditNote } from "../types/creditNote";

export const CREDIT_NOTE_STORAGE_KEY = "htt.mock.sales.credit-notes.v1";
export type CreditNoteState = { creditNotes: CreditNote[]; allocations: CreditAllocation[] };
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;
const text = (v: unknown): v is string => typeof v === "string" && v.length > 0;

export function isCreditNoteState(value: unknown): value is CreditNoteState {
    if (!value || typeof value !== "object") return false;
    const state = value as Record<string, unknown>;
    if (!Array.isArray(state.creditNotes) || !Array.isArray(state.allocations)) return false;
    const notes: CreditNote[] = [];
    const noteIds = new Set<string>();
    for (const raw of state.creditNotes) {
        if (!raw || typeof raw !== "object") return false;
        const n = raw as Record<string, unknown>;
        if (!["id", "creditNoteNumber", "customerId", "sourceInvoiceId", "creditDate", "reason", "createdAt", "updatedAt"].every(k => text(n[k]))) return false;
        if (!["DRAFT", "ISSUED", "FULLY_APPLIED", "VOID"].includes(String(n.status))) return false;
        if (!Array.isArray(n.lines) || !n.totals || typeof n.totals !== "object") return false;
        const totals = n.totals as Record<string, unknown>;
        if (!["subtotal", "taxAmount", "total"].every(k => finite(totals[k])) || !finite(n.amountApplied) || !finite(n.amountAvailable)) return false;
        if (noteIds.has(n.id as string)) return false;
        noteIds.add(n.id as string);
        notes.push(n as unknown as CreditNote);
    }
    const allocationIds = new Set<string>();
    const allocations: CreditAllocation[] = [];
    for (const raw of state.allocations) {
        if (!raw || typeof raw !== "object") return false;
        const a = raw as Record<string, unknown>;
        if (!["id", "allocationNumber", "customerId", "creditNoteId", "invoiceId", "allocationDate", "createdAt", "updatedAt"].every(k => text(a[k]))) return false;
        if (!["APPLIED", "REVERSED"].includes(String(a.status)) || !finite(a.amount) || a.amount === 0) return false;
        if (allocationIds.has(a.id as string)) return false;
        allocationIds.add(a.id as string);
        const note = notes.find(n => n.id === a.creditNoteId);
        if (!note || note.customerId !== a.customerId) return false;
        allocations.push(a as unknown as CreditAllocation);
    }
    return notes.every(n => {
        const applied = allocations.filter(a => a.creditNoteId === n.id && a.status === "APPLIED").reduce((sum, a) => sum + a.amount, 0);
        if (Math.abs(applied - n.amountApplied) > 0.011) return false;
        const refunds=n.refundEvents??[];
        if(!Array.isArray(refunds)||refunds.some(r=>!r||!text(r.id)||!text(r.date)||!finite(r.amount)||r.amount<=0||r.reversalDate!==undefined&&!text(r.reversalDate))||new Set(refunds.map(r=>r.id)).size!==refunds.length)return false;
        const refunded=refunds.filter(r=>!r.reversalDate).reduce((sum,r)=>sum+r.amount,0);
        if(!finite(n.amountRefunded??0)||Math.abs(refunded-(n.amountRefunded??0))>0.011||applied+refunded>n.totals.total+0.011)return false;
        if (n.status === "VOID") return applied === 0 && refunded === 0 && n.amountAvailable === 0;
        if (Math.abs(n.amountAvailable - (n.totals.total - applied - refunded)) > 0.011) return false;
        return n.status !== "FULLY_APPLIED" || n.amountAvailable < 0.011;
    });
}

export function loadCreditNoteState() { return readMockRepository(CREDIT_NOTE_STORAGE_KEY, isCreditNoteState); }
export function persistCreditNoteState(state: CreditNoteState): void {
    if (!isCreditNoteState(state)) throw new Error("Credit note/allocation relationships are invalid; changes were not applied.");
    const current = loadCreditNoteState();
    if (current.status === "invalid" || current.status === "unavailable" || !canWriteMockRepository(CREDIT_NOTE_STORAGE_KEY))
        throw new Error("Credit note storage is unavailable or invalid; changes were not applied.");
    if (!writeMockRepository(CREDIT_NOTE_STORAGE_KEY, state))
        throw new Error("Failed to persist credit notes; changes were not applied.");
}
