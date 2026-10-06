import {
    ArrowLeft,
    Building2,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import { CustomerForm } from "../components/CustomerForm";

import { customerRepository } from "../data/customerRepository";
import { useCustomer } from "../data/useCustomers";

import type { CustomerFormValues } from "../schemas/customerSchemas";

type CustomerFormMode =
    | "create"
    | "edit";

interface CustomerFormPageProps {
    mode: CustomerFormMode;
}

export function CustomerFormPage({
    mode,
}: CustomerFormPageProps) {
    const navigate = useNavigate();

    const { customerId } = useParams();

    const customer = useCustomer(customerId);

    const isCreate = mode === "create";

    if (!isCreate && !customer) {
        return (
            <Navigate
                to="/contacts"
                replace
            />
        );
    }

    async function handleSubmit(
        values: CustomerFormValues,
    ) {
        if (isCreate) {
            const createdCustomer =
                customerRepository.create(values);

            navigate(
                `/contacts/customers/${createdCustomer.id}`,
                {
                    replace: true,
                },
            );

            return;
        }

        if (!customer) {
            return;
        }

        const updatedCustomer =
            customerRepository.update(
                customer.id,
                values,
            );

        navigate(
            `/contacts/customers/${updatedCustomer.id}`,
            {
                replace: true,
            },
        );
    }

    function handleCancel() {
        if (isCreate) {
            navigate("/contacts");

            return;
        }

        if (customer) {
            navigate(
                `/contacts/customers/${customer.id}`,
            );
        }
    }

    return (
        <div className="pb-8">
            <button
                type="button"
                onClick={handleCancel}
                className="
          mb-5 flex items-center gap-2
          text-xs
          text-[var(--color-text-secondary)]
          transition
          hover:text-[var(--color-primary)]
        "
            >
                <ArrowLeft size={14} />

                {isCreate
                    ? "Back to customers"
                    : "Back to customer"}
            </button>

            <div className="mb-7 flex items-start gap-4">
                <div
                    className="
            flex h-11 w-11 items-center
            justify-center rounded-xl
            bg-[var(--color-primary-soft)]
            text-[var(--color-primary)]
          "
                >
                    <Building2 size={20} />
                </div>

                <div>
                    <p
                        className="
              mb-1 text-xs font-medium
              uppercase tracking-[0.14em]
              text-[var(--color-accent)]
            "
                    >
                        {isCreate
                            ? "New Customer"
                            : customer?.code}
                    </p>

                    <h1 className="font-display text-[34px] leading-tight">
                        {isCreate
                            ? "Create Customer"
                            : "Edit Customer"}
                    </h1>

                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {isCreate
                            ? "Create a new customer account and configure their trading details."
                            : `Update the account and trading details for ${customer?.businessName}.`}
                    </p>
                </div>
            </div>

            <div className="max-w-[980px]">
                <CustomerForm
                    customer={customer}
                    submitLabel={
                        isCreate
                            ? "Create customer"
                            : "Save changes"
                    }
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}