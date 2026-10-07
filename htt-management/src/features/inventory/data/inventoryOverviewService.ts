import {
    getProductById,
} from "./mockProducts";

import {
    inventorySiteRepository,
} from "./inventorySiteRepository";

import {
    inventoryMovementRepository,
} from "./inventoryMovementRepository";

import {
    stockRepository,
} from "./stockRepository";

import type {
    InventoryMovementRow,
    InventoryStockRow,
} from "../types/inventoryOverview";

export function getInventoryStockRows():
    InventoryStockRow[] {
    const rows:
        InventoryStockRow[] =
        [];

    for (
        const balance of
        stockRepository.getAll()
    ) {
        const site =
            inventorySiteRepository.getById(
                balance.siteId,
            );

        const product =
            getProductById(
                balance.productId,
            );

        if (
            !site ||
            !product
        ) {
            continue;
        }

        const baseUnit =
            product.units.find(
                (unit) =>
                    unit.id ===
                    balance.baseUnitId,
            );

        rows.push({
            key:
                `${balance.siteId}:${balance.productId}`,

            siteId:
                site.id,

            siteCode:
                site.code,

            siteName:
                site.name,

            productId:
                product.id,

            sku:
                product.sku,

            productName:
                product.name,

            category:
                product.category,

            baseUnitId:
                balance.baseUnitId,

            baseUnitSymbol:
                baseUnit?.symbol ??
                "",

            quantityOnHand:
                balance.quantityOnHand,
        });
    }

    return rows;
}

export function getInventoryMovementRows():
    InventoryMovementRow[] {
    const rows:
        InventoryMovementRow[] =
        [];

    for (
        const movement of
        inventoryMovementRepository.getAll()
    ) {
        const site =
            inventorySiteRepository.getById(
                movement.siteId,
            );

        const product =
            getProductById(
                movement.productId,
            );

        if (
            !site ||
            !product
        ) {
            continue;
        }

        const baseUnit =
            product.units.find(
                (unit) =>
                    unit.id ===
                    movement.baseUnitId,
            );

        rows.push({
            id:
                movement.id,

            movementNumber:
                movement.movementNumber,

            movementType:
                movement.movementType,

            occurredAt:
                movement.occurredAt,

            siteId:
                site.id,

            siteCode:
                site.code,

            siteName:
                site.name,

            productId:
                product.id,

            sku:
                product.sku,

            productName:
                product.name,

            baseUnitSymbol:
                baseUnit?.symbol ??
                "",

            quantityBase:
                movement.quantityBase,

            transactionUnitSymbol:
                movement.transactionUnitSymbol,

            transactionQuantity:
                movement.transactionQuantity,

            referenceType:
                movement.referenceType,

            referenceId:
                movement.referenceId,

            referenceNumber:
                movement.referenceNumber,

            purchaseOrderId:
                movement.purchaseOrderId,

            purchaseOrderNumber:
                movement.purchaseOrderNumber,
        });
    }

    return rows;
}