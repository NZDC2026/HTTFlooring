import type { ReactNode } from "react";

interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    description?: string;
    children: ReactNode;
}

export function FormField({
    label,
    required = false,
    error,
    description,
    children,
}: FormFieldProps) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-primary)]">
                {label}

                {required && (
                    <span className="ml-1 text-[var(--color-danger)]">
                        *
                    </span>
                )}
            </label>

            {children}

            {error ? (
                <p className="mt-1.5 text-[11px] text-[var(--color-danger)]">
                    {error}
                </p>
            ) : description ? (
                <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
                    {description}
                </p>
            ) : null}
        </div>
    );
}