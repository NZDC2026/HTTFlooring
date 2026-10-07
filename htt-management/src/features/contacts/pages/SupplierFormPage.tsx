import {
    ArrowLeft,
    Truck,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    SupplierForm,
} from "../components/SupplierForm";

import {
    supplierRepository,
} from "../data/supplierRepository";

import {
    useSupplier,
} from "../data/useSuppliers";

import type {
    SupplierFormValues,
} from "../schemas/supplierSchemas";

type SupplierFormMode =
    | "create"
    | "edit";

interface Props {
    mode: SupplierFormMode;
}

export function SupplierFormPage({
    mode,
}: Props) {
    const navigate =
        useNavigate();

    const {
        supplierId,
    } = useParams();

    const supplier =
        useSupplier(
            supplierId,
        );

    const isCreate =
        mode === "create";

    if (
        !isCreate &&
        !supplier
    ) {
        return (
            <Navigate
                to="/contacts/suppliers"
                replace
            />
        );
    }

    function handleSubmit(
        values: SupplierFormValues,
    ) {
        if (
            isCreate
        ) {
            const created =
                supplierRepository.create(
                    values,
                );

            navigate(
                `/contacts/suppliers/${created.id}`,
                {
                    replace:
                        true,
                },
            );

            return;
        }

        if (!supplier) {
            return;
        }

        const updated =
            supplierRepository.update(
                supplier.id,
                values,
            );

        navigate(
            `/contacts/suppliers/${updated.id}`,
            {
                replace:
                    true,
            },
        );
    }

    function handleCancel() {
        if (
            isCreate
        ) {
            navigate(
                "/contacts/suppliers",
            );

            return;
        }

        if (supplier) {
            navigate(
                `/contacts/suppliers/${supplier.id}`,
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={
                    handleCancel
                }
                className="mb-5 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
                <ArrowLeft
                    size={14}
                />

                {isCreate
                    ? "Back to suppliers"
                    : "Back to supplier"}
            </button>

            <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <Truck
                        size={
                            20
                        }
                    />
                </div>

                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        {isCreate
                            ? "New Supplier"
                            : supplier?.code}
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        {isCreate
                            ? "Create Supplier"
                            : "Edit Supplier"}
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {isCreate
                            ? "Create a supplier account and configure purchasing and payment defaults."
                            : `Update supplier details for ${supplier?.businessName}.`}
                    </p>
                </div>
            </div>

            <div className="max-w-[980px]">
                <SupplierForm
                    supplier={
                        supplier
                    }
                    submitLabel={
                        isCreate
                            ? "Create supplier"
                            : "Save changes"
                    }
                    onSubmit={
                        handleSubmit
                    }
                    onCancel={
                        handleCancel
                    }
                />
            </div>
        </div>
    );
}