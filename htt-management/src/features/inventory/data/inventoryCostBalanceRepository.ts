import { registerRepository } from "../../security/repositoryHost";
import type {
    InventoryCostBalance,
} from "../types/inventoryCost";

type Listener =
    () => void;

const listeners =
    new Set<Listener>();

let balances:
    InventoryCostBalance[] =
    [];

function emitChange() {
    listeners.forEach(
        (
            listener,
        ) =>
            listener(),
    );
}

export const inventoryCostBalanceRepository =
{
    subscribe(
        listener:
            Listener,
    ) {
        listeners.add(
            listener,
        );

        return () => {
            listeners.delete(
                listener,
            );
        };
    },

    getSnapshot():
        InventoryCostBalance[] {
        return balances;
    },

    getAll():
        InventoryCostBalance[] {
        return balances;
    },

    getBalance(
        siteId:
            string,

        productId:
            string,
    ) {
        return balances.find(
            (
                balance,
            ) =>
                balance.siteId ===
                siteId &&
                balance.productId ===
                productId,
        );
    },

    requireBalance(
        siteId:
            string,

        productId:
            string,
    ) {
        const balance =
            inventoryCostBalanceRepository
                .getBalance(
                    siteId,
                    productId,
                );

        if (!balance) {
            throw new Error(
                "Inventory cost balance was not found.",
            );
        }

        return balance;
    },

    save(
        balance:
            InventoryCostBalance,
    ) {
        const exists =
            balances.some(
                (
                    existing,
                ) =>
                    existing.siteId ===
                    balance.siteId &&
                    existing.productId ===
                    balance.productId,
            );

        balances =
            exists
                ? balances.map(
                    (
                        existing,
                    ) =>
                        existing.siteId ===
                            balance.siteId &&
                            existing.productId ===
                            balance.productId
                            ? balance
                            : existing,
                )
                : [
                    balance,
                    ...balances,
                ];

        emitChange();

        return balance;
    },

    replaceAll(
        nextBalances:
            InventoryCostBalance[],
    ) {
        balances =
            nextBalances;

        emitChange();
    },

    clear() {
        balances =
            [];

        emitChange();
    },
};
registerRepository("costBalances", {
    repository: inventoryCostBalanceRepository, read: "inventory.cost.read",
    commands: {"save": null, "replaceAll": null, "clear": null},
    snapshot: () => ({ balances }),
    restore: value => { balances = value.balances;  },
    publish: () => listeners.forEach(listener => listener()),
});
