import { areaQuantity } from './areaPacks';
import { assertProductQuantity } from '../../business-workspace/productRules';
import { activeTaxRate, businessSettings, taxSnapshot, exclusivePrice } from '../../business-workspace/configurationState';
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

    const inputPrice =
        hasManualPrice
            ? draft.unitPrice!
            : resolvedPrice.effectivePrice;

    if (!Number.isFinite(inputPrice) || inputPrice < 0) {
        throw new Error(
            "Unit price cannot be negative",
        );
    }

    const area = areaQuantity(draft.productId,draft.unitId,draft.quantity,draft.requestedArea);
    assertProductQuantity(draft.productId,draft.unitId,area.quantity,'sell');
    if (product.sellEnabled === false) throw new Error("Product is not available for selling.");
    const taxCode = product.taxCode ?? businessSettings().gstCode, taxRate = activeTaxRate(taxCode);
    const unitPrice = hasManualPrice ? exclusivePrice(inputPrice, taxRate, draft.priceBasis) : inputPrice;
    const calculations =
        calculateSalesLine({
            taxRate,
            inclusiveLineTotal:hasManualPrice&&(draft.priceBasis??businessSettings().basis)==='Inclusive'?Math.round(area.quantity*inputPrice*100)/100:undefined,
            quantity:
                area.quantity,

            standardUnitPrice:
                resolvedPrice.basePrice,

            unitPrice,
        });

    return {
        id: createId("line"),
        itemType: product.itemType??"STOCK",
        ...area,
        ...taxSnapshot(taxCode), priceBasis:hasManualPrice?(draft.priceBasis??businessSettings().basis) as 'Inclusive'|'Exclusive':'Exclusive',grossUnitPrice:hasManualPrice&&(draft.priceBasis??businessSettings().basis)==='Inclusive'?inputPrice:undefined, promotionId: hasManualPrice ? undefined : resolvedPrice.promotionId,

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
            area.quantity,

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