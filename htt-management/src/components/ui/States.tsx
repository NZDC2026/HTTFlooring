import { Inbox, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title = "No records found", description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center">
    <Inbox size={28} className="text-[var(--color-text-secondary)]" />
    <h3 className="mt-3 text-base font-semibold">{title}</h3>
    {description && <p className="mt-1 max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>;
}
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return <div role="status" className="flex items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-sm text-[var(--color-text-secondary)]">
    <LoaderCircle size={20} className="animate-spin" />{label}
  </div>;
}
