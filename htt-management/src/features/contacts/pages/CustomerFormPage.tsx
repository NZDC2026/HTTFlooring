import {
    ArrowLeft,
} from "lucide-react";

import {
    Link,
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

            <header className="mb-5 flex max-w-[1200px] flex-wrap items-start justify-between gap-5 rounded-2xl px-1 py-3" style={{background:'linear-gradient(115deg, transparent 45%, #efe5d850 100%)'}}><div className="min-w-0 flex-1"><h1 className="font-display text-[36px] font-semibold leading-tight">{isCreate?"Create Customer":"Edit Customer"}</h1><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{isCreate?"Create a new customer account and configure their trading details.":`Update the account and trading details for ${customer?.businessName}.`}</p></div><div id="customer-form-status" className="ml-auto shrink-0"/></header>

            {mode === "edit" && customer && <Link
                to={`/contacts/customers/${customer.id}?editAccountant=1`}
                className="mb-4 inline-flex rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm"
            >Edit accountant contact</Link>}
            <div className="max-w-[1200px]">
                <CustomerForm
                    statusTarget="customer-form-status"
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