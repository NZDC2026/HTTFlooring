import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/cn";

const buttonVariants = cva(
    [
        "inline-flex items-center justify-center gap-2",
        "whitespace-nowrap",
        "font-medium",
        "transition-all duration-150",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-[var(--color-primary)]",
        "focus-visible:ring-offset-2",
        "disabled:pointer-events-none",
        "disabled:opacity-50",
    ],
    {
        variants: {
            variant: {
                primary:
                    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",

                accent:
                    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",

                secondary:
                    "border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]",

                ghost:
                    "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]",

                danger:
                    "bg-[var(--color-danger)] text-white hover:opacity-90",
            },

            size: {
                sm: "h-8 rounded-md px-3 text-xs",
                md: "h-10 rounded-lg px-4 text-sm",
                lg: "h-11 rounded-lg px-5 text-sm",
                icon: "h-10 w-10 rounded-lg",
            },
        },

        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    },
);

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

export function Button({
    className,
    variant,
    size,
    type = "button",
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                buttonVariants({
                    variant,
                    size,
                }),
                className,
            )}
            {...props}
        />
    );
}