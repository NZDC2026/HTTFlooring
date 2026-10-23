import {fifoLayers} from './fifo';
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
    validate: (value,snapshots) => {
        for(const b of (value as {balances:InventoryCostBalance[]}).balances){if(!['FIFO','MOVING_WEIGHTED_AVERAGE'].includes(b.costingMethod))throw Error('Unsupported saved inventory method.');
        if(b.costingMethod==='FIFO'){
          const layers=fifoLayers((snapshots.costMovements as any).movements.filter((m:any)=>m.siteId===b.siteId&&m.productId===b.productId));
          if(Math.abs(layers.reduce((n,l)=>n+l.quantity,0)-b.quantityOnHand)>0.00001||Math.abs(layers.reduce((n,l)=>n+l.value,0)-b.inventoryValue)>0.001)throw Error('FIFO saved balance differs from its layers.');
        }}
    },
    snapshot: () => ({ balances }),
    restore: value => { balances = value.balances;  },
    publish: () => listeners.forEach(listener => listener()),
});
