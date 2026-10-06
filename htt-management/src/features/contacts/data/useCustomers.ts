import { useSyncExternalStore } from "react";

import { customerRepository } from "./customerRepository";

export function useCustomers() {
    return useSyncExternalStore(
        customerRepository.subscribe,
        customerRepository.getSnapshot,
        customerRepository.getSnapshot,
    );
}

export function useCustomer(
    customerId: string | undefined,
) {
    const customers = useCustomers();

    if (!customerId) {
        return undefined;
    }

    return customers.find(
        (customer) => customer.id === customerId,
    );
}