import { resolvePricingInstant, type PricingInstant } from './pricingInstant';
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
    pricingAt,
    pricingContext,
}: {
    customerId: string;
    documentDate: string;
    draft: SalesLineDraft;
    pricingAt?: string;
    pricingContext?: PricingInstant;
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

    const context = pricingContext ?? resolvePricingInstant(documentDate, pricingAt);
    const resolvedPrice =
        customerPricingRepository.resolvePrice(
            customerId,
            draft.productId,
            draft.unitId,
            documentDate,
            context.pricingAt,
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
    const discount = draft.discountPercent ?? 0;
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) throw new Error('Discount must be between 0 and 100%.');
    const discountBaseUnitPrice = hasManualPrice ? exclusivePrice(inputPrice, taxRate, draft.priceBasis) : inputPrice;
    const unitPrice = discountBaseUnitPrice * (1 - discount / 100);
    const calculations =
        calculateSalesLine({
            taxRate,
            inclusiveLineTotal:hasManualPrice&&(draft.priceBasis??businessSettings().basis)==='Inclusive'?Math.round(area.quantity*inputPrice*(1-discount/100)*100)/100:undefined,
            quantity:
                area.quantity,

            standardUnitPrice:
                resolvedPrice.basePrice,

            unitPrice,
        });

    return {
        id: createId("line"),
        ...context,
        itemType: product.itemType??"STOCK",
        ...area,
        ...taxSnapshot(taxCode), priceBasis:hasManualPrice?(draft.priceBasis??businessSettings().basis) as 'Inclusive'|'Exclusive':'Exclusive',grossUnitPrice:hasManualPrice&&(draft.priceBasis??businessSettings().basis)==='Inclusive'?inputPrice*(1-discount/100):undefined, promotionId: hasManualPrice ? undefined : resolvedPrice.promotionId,

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
        ...(draft.discountPercent===undefined?{}:{explicitDiscountPercent:discount,discountBaseUnitPrice}),
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
/** Validate the saved, pre-discount price independently of the current price catalogue. */
export function validateSalesDiscountSnapshot(line: {explicitDiscountPercent?:number;discountBaseUnitPrice?:number;unitPrice:number}) {
 if(line.explicitDiscountPercent===undefined&&line.discountBaseUnitPrice===undefined)return;
 const d=line.explicitDiscountPercent,b=line.discountBaseUnitPrice;
 if(d===undefined||b===undefined||!Number.isFinite(d)||d<0||d>100||!Number.isFinite(b)||b<0||Math.abs(line.unitPrice-b*(1-d/100))>1e-8)throw new Error('Invalid saved sales discount.');
}
