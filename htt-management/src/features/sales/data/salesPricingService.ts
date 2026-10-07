import {
    getProductById,
    getProductUnit,
} from "../../inventory/data/mockProducts";

import { customerPricingRepository } from "../../contacts/data/customerPricingRepository";

import type {
    SalesDocumentLine,
    SalesLineDraft,
} from "../types/salesDocument";

import { calculateSalesLine } from "./salesCalculations";

export function buildSalesLine({
    customerId,
    documentDate,
    draft,
}: {
    customerId: string;
    documentDate: string;
    draft: SalesLineDraft;
}): SalesDocumentLine {
    if (draft.quantity <= 0) {
        throw new Error(
            "Sales line quantity must be greater than zero",
        );
    }

    const product =
        getProductById(
            draft.productId,
        );

    if (!product) {
        throw new Error(
            `Product ${draft.productId} was not found`,
        );
    }

    if (
        product.status !== "ACTIVE"
    ) {
        throw new Error(
            `${product.name} is inactive`,
        );
    }

    const unit =
        getProductUnit(
            draft.productId,
            draft.unitId,
        );

    if (!unit) {
        throw new Error(
            `Unit ${draft.unitId} was not found for ${product.name}`,
        );
    }

    const resolvedPrice =
        customerPricingRepository.resolvePrice(
            customerId,
            draft.productId,
            draft.unitId,
            documentDate,
        );

    const hasManualPrice =
        draft.unitPrice !== undefined;

    const unitPrice =
        hasManualPrice
            ? draft.unitPrice!
            : resolvedPrice.effectivePrice;

    if (unitPrice < 0) {
        throw new Error(
            "Unit price cannot be negative",
        );
    }

    const calculations =
        calculateSalesLine({
            quantity:
                draft.quantity,

            standardUnitPrice:
                resolvedPrice.basePrice,

            unitPrice,
        });

    return {
        id: createId("line"),

        productId:
            product.id,

        unitId:
            unit.id,

        sku:
            product.sku,

        description:
            product.name,

        unitSymbol:
            unit.symbol,

        quantity:
            draft.quantity,

        standardUnitPrice:
            resolvedPrice.basePrice,

        unitPrice,

        priceSource:
            hasManualPrice
                ? "MANUAL"
                : resolvedPrice.source,

        customerPriceId:
            !hasManualPrice
                ? resolvedPrice.customerPrice
                    ?.id
                : undefined,

        ...calculations,
    };
}

export function rebuildSalesLine({
    customerId,
    documentDate,
    existingLine,
    quantity,
    unitPrice,
}: {
    customerId: string;
    documentDate: string;
    existingLine: SalesDocumentLine;
    quantity: number;
    unitPrice?: number;
}) {
    return buildSalesLine({
        customerId,
        documentDate,

        draft: {
            productId:
                existingLine.productId,

            unitId:
                existingLine.unitId,

            quantity,

            unitPrice,
        },
    });
}

function createId(
    prefix: string,
) {
    return `${prefix}_${crypto.randomUUID()}`;
}