import type { HTMLAttributes, TableHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function DemoTable({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full min-w-[720px] border-collapse text-left text-sm [&_thead]:bg-[var(--color-background-subtle)] [&_th]:h-11 [&_th]:px-5 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-[var(--color-text-secondary)] [&_td]:h-[52px] [&_td]:px-5 [&_tr]:border-b [&_tr]:border-[var(--color-border)] [&_tbody_tr:last-child]:border-b-0 [&_tbody_tr:hover]:bg-[var(--color-surface-hover)]", className)} {...props} />;
}

export function TableEmptyRow({ colSpan, title, description }: { colSpan: number; title: string; description?: string }) {
  return <tr><td colSpan={colSpan} className="!h-40 text-center"><p className="font-medium text-[var(--color-text-primary)]">{title}</p>{description && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{description}</p>}</td></tr>;
}

export function TableAction({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center justify-start gap-2", className)} {...props} />;
}
