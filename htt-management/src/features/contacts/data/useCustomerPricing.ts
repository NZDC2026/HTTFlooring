import {
    useMemo,
    useSyncExternalStore,
} from "react";

import { customerPricingRepository } from "./customerPricingRepository";

export function useCustomerPrices(
    customerId: string | undefined,
) {
    const prices =
        useSyncExternalStore(
            customerPricingRepository.subscribe,
            customerPricingRepository.getSnapshot,
            customerPricingRepository.getSnapshot,
        );

    return useMemo(() => {
        if (!customerId) {
            return [];
        }

        return prices.filter(
            (price) =>
                price.customerId === customerId,
        );
    }, [prices, customerId]);
}