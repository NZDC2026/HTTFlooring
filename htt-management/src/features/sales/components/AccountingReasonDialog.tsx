import {
    useState,
} from "react";

import {
    AlertTriangle,
    X,
} from "lucide-react";

import {
    Button,
} from "../../../components/ui/Button";

interface Props {
    title: string;
    description: string;

    confirmLabel: string;

    danger?: boolean;

    onCancel: () => void;

    onConfirm: (
        reason: string,
    ) => void;
}

export function AccountingReasonDialog({
    title,
    description,
    confirmLabel,
    danger = false,
    onCancel,
    onConfirm,
}: Props) {
    const [
        reason,
        setReason,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    function handleSubmit() {
        const normalized =
            reason.trim();

        if (
            normalized.length < 3
        ) {
            setError(
                "Please enter a reason.",
            );

            return;
        }

        onConfirm(
            normalized,
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-6">
            <div className="w-full max-w-[520px] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-[var(--color-border)] px-5 py-4">
                    <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-danger-soft)]">
                            <AlertTriangle
                                size={17}
                                className="text-[var(--color-danger)]"
                            />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold">
                                {title}
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                                {description}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={
                            onCancel
                        }
                        className="text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
                    >
                        <X
                            size={18}
                        />
                    </button>
                </div>

                <div className="p-5">
                    <label className="text-xs font-semibold">
                        Reason
                    </label>

                    <textarea
                        value={
                            reason
                        }
                        onChange={(
                            event,
                        ) => {
                            setReason(
                                event.target.value,
                            );

                            setError(
                                null,
                            );
                        }}
                        rows={4}
                        autoFocus
                        placeholder="Enter the reason for this action..."
                        className="mt-2 w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                    />

                    {error && (
                        <p className="mt-2 text-xs text-[var(--color-danger)]">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4">
                    <Button
                        variant="secondary"
                        onClick={
                            onCancel
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant={
                            danger
                                ? "danger"
                                : "primary"
                        }
                        onClick={
                            handleSubmit
                        }
                    >
                        {
                            confirmLabel
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
}