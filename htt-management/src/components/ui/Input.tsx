import type { InputHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> { }

export function Input({
    className,
    ...props
}: InputProps) {
    return (
        <input
            className={cn(
                "h-10 w-full rounded-lg",
                "border border-[var(--color-border)]",
                "bg-white px-3",
                "text-sm text-[var(--color-text-primary)]",
                "placeholder:text-[var(--color-text-muted)]",
                "transition",
                "outline-none",
                "hover:border-[var(--color-border-strong)]",
                "focus:border-[var(--color-primary)]",
                "focus:ring-2",
                "focus:ring-[var(--color-primary-soft)]",
                "disabled:cursor-not-allowed",
                "disabled:bg-[var(--color-surface-muted)]",
                "disabled:opacity-70",
                className,
            )}
            {...props}
        />
    );
}