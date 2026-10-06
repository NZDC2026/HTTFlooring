import type { HTMLAttributes } from "react";

import { cn } from "../../lib/cn";

type BadgeVariant =
    | "neutral"
    | "success"
    | "warning"
    | "danger"
    | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
    neutral:
        "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]",

    success:
        "bg-[var(--color-success-soft)] text-[var(--color-success)]",

    warning:
        "bg-[var(--color-warning-soft)] text-[#8a641c]",

    danger:
        "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",

    info:
        "bg-[var(--color-info-soft)] text-[var(--color-info)]",
};

export function Badge({
    className,
    variant = "neutral",
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex h-6 items-center rounded-full px-2.5",
                "text-xs font-medium",
                variants[variant],
                className,
            )}
            {...props}
        />
    );
}