import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { businessSettings } from "../../business-workspace/configurationState";
import { usePermission } from "../../security/usePermission";
import { customerRepository } from "../data/customerRepository";
import type { CustomerNote } from "../types/customer";

function noteTime(value: string) {
    return new Intl.DateTimeFormat("en-AU", {
        dateStyle: "medium", timeStyle: "short", timeZone: businessSettings().timezone,
    }).format(new Date(value));
}

export function CustomerNoteThreads({ customerId, notes, showComposer = true, readOnly = false }: {
    customerId: string;
    notes: CustomerNote[];
    showComposer?: boolean;
    readOnly?: boolean;
}) {
    const canWrite = usePermission("contacts.write") && !readOnly;
    const [draft, setDraft] = useState("");
    const [replyTo, setReplyTo] = useState<string>();
    const [reply, setReply] = useState("");
    const [error, setError] = useState("");
    const threads = notes.filter(note => !note.action).slice().reverse();

    function save(text: string, action?: CustomerNote["action"], threadId?: string) {
        try {
            customerRepository.addNote({ customerId, operationId: crypto.randomUUID(), text, source: "Desktop", action, threadId });
            setError("");
            if (action === "reply") {
                setReplyTo(undefined);
                setReply("");
            } else if (!action) setDraft("");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to save note.");
        }
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        if (draft.trim()) save(draft.trim());
    }

    return <section aria-label="Customer note threads" className="space-y-3">
        {showComposer && canWrite && <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
            <label className="grid min-w-48 flex-1 gap-1 text-sm font-medium">New note
                <textarea required maxLength={2000} rows={2} value={draft} onChange={event => setDraft(event.target.value)} className="rounded border bg-white p-2 text-sm font-normal"/>
            </label>
            <Button type="submit" size="sm">Add note</Button>
        </form>}
        {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
        {!threads.length && <p className="text-sm text-[var(--color-text-secondary)]">No saved customer notes.</p>}
        {threads.map(note => {
            const entries = notes.filter(entry => entry.threadId === note.id);
            const resolved = entries.some(entry => entry.action === "resolve");
            return <article key={note.id} className="rounded-lg border border-[var(--color-border)] bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-[var(--color-text-secondary)]">{note.actorName || note.actorId} · {noteTime(note.createdAt)}</p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm">{note.text}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${resolved ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-surface-muted)]"}`}>{resolved ? "Resolved" : "Open"}</span>
                </div>
                {entries.map(entry => <div key={entry.id} className="border-t border-[var(--color-border)] px-3 py-2 pl-6">
                    <p className="text-xs text-[var(--color-text-secondary)]">{entry.action === "resolve" ? "Resolved by" : "Reply by"} {entry.actorName || entry.actorId} · {noteTime(entry.createdAt)}</p>
                    {entry.action === "reply" && <p className="mt-1 whitespace-pre-wrap break-words text-sm">{entry.text}</p>}
                </div>)}
                {canWrite && !resolved && <div className="flex flex-wrap gap-2 px-3 pb-2">
                    <Button size="sm" variant="ghost" onClick={() => { setReplyTo(note.id); setReply(""); }}>Reply</Button>
                    <Button size="sm" variant="secondary" onClick={() => save("Marked resolved", "resolve", note.id)}>Mark resolved</Button>
                </div>}
                {canWrite && !resolved && replyTo === note.id && <form className="flex flex-wrap items-end gap-2 px-3 pb-3" onSubmit={event => { event.preventDefault(); if (reply.trim()) save(reply.trim(), "reply", note.id); }}>
                    <label className="grid min-w-48 flex-1 gap-1 text-sm">Reply
                        <textarea required maxLength={2000} rows={2} value={reply} onChange={event => setReply(event.target.value)} className="rounded border p-2"/>
                    </label>
                    <Button size="sm" type="submit">Save reply</Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplyTo(undefined)}>Cancel</Button>
                </form>}
            </article>;
        })}
    </section>;
}
