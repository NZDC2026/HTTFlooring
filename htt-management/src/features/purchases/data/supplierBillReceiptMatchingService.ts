import {
    calculateBaseUnitCost,
    calculateIncomingInventoryValue,
    roundInventoryQuantity,
    roundInventoryValue,
} from "../../inventory/data/inventoryCostCalculations";

import type {
    GoodsReceipt,
} from "../types/goodsReceipt";

import type {
    SupplierBillReceiptMatch,
    SupplierBillReceiptMatchRequest,
    SupplierBillReceiptMatchingResult,
    AvailableGoodsReceiptLine,
} from "../types/supplierBillReceiptMatch";

/**
 * 6K-D2
 *
 * FIFO Supplier Bill / Goods Receipt
 * Matching Engine.
 *
 * This service is calculation-only.
 *
 * It does not modify:
 * - Goods Receipt Repository
 * - Supplier Bill Repository
 * - Purchase Order Repository
 * - Inventory
 * - Accounting Journals
 */

const QUANTITY_TOLERANCE = 0.0001;

function roundMoney(
    value: number,
): number {
    return roundInventoryValue(value);
}

function assertPositiveQuantity(
    quantity: number,
): void {
    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {
        throw new Error(
            "Matching quantity must be greater than zero.",
        );
    }

    if (
        Math.abs(
            quantity -
            roundInventoryQuantity(quantity),
        ) > 0.00000001
    ) {
        throw new Error(
            "Matching quantity exceeds supported precision.",
        );
    }
}

function assertValidUnitCost(
    unitCost: number,
): void {
    if (
        !Number.isFinite(unitCost) ||
        unitCost < 0
    ) {
        throw new Error(
            "Supplier Bill unit cost must be a non-negative finite number.",
        );
    }
}

/**
 * Calculate inventory receipt value using
 * the same conversion and rounding rules
 * as the Inventory Cost Engine.
 */
function calculateReceiptValue(
    quantity: number,
    unitCost: number,
    conversionToBase: number,
): number {
    const unitCostBase =
        calculateBaseUnitCost({
            transactionUnitCost:
                unitCost,

            conversionToBase,
        });

    const baseQuantity =
        roundInventoryQuantity(
            quantity *
            conversionToBase,
        );

    return calculateIncomingInventoryValue({
        quantityBase:
            baseQuantity,

        unitCostBase,
    });
}

/**
 * Return available receipt lines after
 * subtracting all ACTIVE historical matches.
 *
 * The result is sorted by FIFO order.
 */
function buildAvailableReceiptLines(
    purchaseOrderId: string,
    receipts: GoodsReceipt[],
    existingMatches: SupplierBillReceiptMatch[],
): AvailableGoodsReceiptLine[] {
    const available:
        AvailableGoodsReceiptLine[] = [];

    const activeMatches =
        existingMatches.filter(
            (match) =>
                match.status === "ACTIVE",
        );

    for (const receipt of receipts) {
        if (
            receipt.purchaseOrderId !==
            purchaseOrderId
        ) {
            continue;
        }

        if (
            receipt.status !== "POSTED"
        ) {
            continue;
        }

        for (const line of receipt.lines) {
            const matchedQuantity =
                roundInventoryQuantity(
                    activeMatches
                        .filter(
                            (match) =>
                                match.goodsReceiptId ===
                                receipt.id &&
                                match.goodsReceiptLineId ===
                                line.id,
                        )
                        .reduce(
                            (total, match) =>
                                total +
                                match.matchedQuantity,
                            0,
                        ),
                );

            const availableQuantity =
                roundInventoryQuantity(
                    line.receivedQuantity -
                    matchedQuantity,
                );

            if (
                availableQuantity <
                -QUANTITY_TOLERANCE
            ) {
                throw new Error(
                    `Goods Receipt ${receipt.receiptNumber} has been overmatched.`,
                );
            }

            available.push({
                goodsReceiptId:
                    receipt.id,

                goodsReceiptLineId:
                    line.id,

                purchaseOrderId:
                    receipt.purchaseOrderId,

                purchaseOrderLineId:
                    line.purchaseOrderLineId,

                productId:
                    line.productId,

                receiptDate:
                    receipt.receiptDate,

                receivedQuantity:
                    line.receivedQuantity,

                conversionToBase:
                    line.conversionToBase,

                receiptUnitCost:
                    line.unitCost,

                matchedQuantity,

                availableQuantity:
                    Math.max(
                        0,
                        availableQuantity,
                    ),
            });
        }
    }

    const receiptNumbers =
        new Map(
            receipts.map(
                (receipt) => [
                    receipt.id,
                    receipt.receiptNumber,
                ],
            ),
        );

    return available.sort(
        (a, b) => {
            const dateCompare =
                a.receiptDate.localeCompare(
                    b.receiptDate,
                );

            if (dateCompare !== 0) {
                return dateCompare;
            }

            const numberCompare =
                (
                    receiptNumbers.get(
                        a.goodsReceiptId,
                    ) ?? ""
                ).localeCompare(
                    receiptNumbers.get(
                        b.goodsReceiptId,
                    ) ?? "",
                );

            if (numberCompare !== 0) {
                return numberCompare;
            }

            const receiptCompare =
                a.goodsReceiptId.localeCompare(
                    b.goodsReceiptId,
                );

            if (receiptCompare !== 0) {
                return receiptCompare;
            }

            return a.goodsReceiptLineId.localeCompare(
                b.goodsReceiptLineId,
            );
        },
    );
}

export interface CalculateSupplierBillReceiptMatchingInput {
    supplierBillId: string;

    purchaseOrderId: string;

    requests:
    SupplierBillReceiptMatchRequest[];

    receipts:
    GoodsReceipt[];

    existingMatches:
    SupplierBillReceiptMatch[];

    /**
     * Used for audit timestamps.
     */
    createdAt?: string;
}

/**
 * Calculate FIFO matching without mutating
 * any repository.
 *
 * Purchase price variance is intentionally
 * rejected during 6K-D.
 */
function calculateMatching(
    input:
        CalculateSupplierBillReceiptMatchingInput,
): SupplierBillReceiptMatchingResult {
    const {
        supplierBillId,
        purchaseOrderId,
        requests,
        receipts,
        existingMatches,
    } = input;

    if (
        !supplierBillId ||
        !purchaseOrderId
    ) {
        throw new Error(
            "Supplier Bill and Purchase Order IDs are required.",
        );
    }

    if (requests.length === 0) {
        throw new Error(
            "Supplier Bill matching requires at least one line.",
        );
    }

    if (
        existingMatches.some(
            (match) =>
                match.status === "ACTIVE" &&
                match.supplierBillId ===
                supplierBillId,
        )
    ) {
        throw new Error(
            "Supplier Bill already has active receipt matches.",
        );
    }

    const seenBillLines =
        new Set<string>();

    const availableLines =
        buildAvailableReceiptLines(
            purchaseOrderId,
            receipts,
            existingMatches,
        );

    const matches:
        SupplierBillReceiptMatch[] = [];

    const createdAt =
        input.createdAt ??
        new Date().toISOString();

    for (const request of requests) {
        if (
            request.supplierBillId !==
            supplierBillId ||
            request.purchaseOrderId !==
            purchaseOrderId
        ) {
            throw new Error(
                "Supplier Bill matching request references an incorrect bill or purchase order.",
            );
        }

        if (
            !request.supplierBillLineId ||
            !request.purchaseOrderLineId ||
            !request.productId
        ) {
            throw new Error(
                "Supplier Bill matching request has missing identifiers.",
            );
        }

        if (
            seenBillLines.has(
                request.supplierBillLineId,
            )
        ) {
            throw new Error(
                "Duplicate Supplier Bill Line in matching request.",
            );
        }

        seenBillLines.add(
            request.supplierBillLineId,
        );

        assertPositiveQuantity(
            request.quantity,
        );

        assertValidUnitCost(
            request.billUnitCost,
        );

        let remainingQuantity =
            roundInventoryQuantity(
                request.quantity,
            );

        const requestMatches:
            SupplierBillReceiptMatch[] = [];

        const candidates =
            availableLines.filter(
                (line) =>
                    line.purchaseOrderLineId ===
                    request.purchaseOrderLineId &&
                    line.productId ===
                    request.productId &&
                    line.availableQuantity >
                    QUANTITY_TOLERANCE,
            );

        const totalAvailable =
            roundInventoryQuantity(
                candidates.reduce(
                    (total, line) =>
                        total +
                        line.availableQuantity,
                    0,
                ),
            );

        if (
            totalAvailable +
            QUANTITY_TOLERANCE <
            remainingQuantity
        ) {
            throw new Error(
                `Insufficient received quantity for Purchase Order Line ${request.purchaseOrderLineId}.`,
            );
        }

        for (const candidate of candidates) {
            if (
                remainingQuantity <=
                QUANTITY_TOLERANCE
            ) {
                break;
            }

            const matchedQuantity =
                roundInventoryQuantity(
                    Math.min(
                        remainingQuantity,
                        candidate.availableQuantity,
                    ),
                );

            if (
                matchedQuantity <= 0
            ) {
                continue;
            }

            const matchedBaseQuantity =
                roundInventoryQuantity(
                    matchedQuantity *
                    candidate.conversionToBase,
                );

            const receipt = receipts.find(
                (item) => item.id === candidate.goodsReceiptId,
            );
            const receiptLine = receipt?.lines.find(
                (item) => item.id === candidate.goodsReceiptLineId,
            );
            if (!receiptLine) {
                throw new Error("Matched receipt line was not found.");
            }
            const fullReceiptValue = calculateIncomingInventoryValue({
                quantityBase: receiptLine.receivedBaseQuantity,
                unitCostBase: calculateBaseUnitCost({
                    transactionUnitCost: receiptLine.unitCost,
                    conversionToBase: receiptLine.conversionToBase,
                }),
            });
            const priorMatchedValue = roundMoney(existingMatches
                .filter((match) => match.status === "ACTIVE" &&
                    match.goodsReceiptId === candidate.goodsReceiptId &&
                    match.goodsReceiptLineId === candidate.goodsReceiptLineId)
                .reduce((sum, match) => sum + match.matchedReceiptValue, 0) +
                matches.filter((match) => match.goodsReceiptId === candidate.goodsReceiptId &&
                    match.goodsReceiptLineId === candidate.goodsReceiptLineId)
                    .reduce((sum, match) => sum + match.matchedReceiptValue, 0));
            const isFinalAllocation =
                Math.abs(candidate.availableQuantity - matchedQuantity) <= QUANTITY_TOLERANCE;
            const matchedReceiptValue = isFinalAllocation
                ? roundMoney(fullReceiptValue - priorMatchedValue)
                : calculateReceiptValue(
                    matchedQuantity,
                    candidate.receiptUnitCost,
                    candidate.conversionToBase,
                );
            if (matchedReceiptValue < 0) {
                throw new Error("Receipt cost has been overallocated.");
            }

            const matchedBillValue =
                roundMoney(
                    matchedQuantity *
                    request.billUnitCost,
                );

            const priceVariance =
                roundMoney(
                    matchedBillValue -
                    matchedReceiptValue,
                );

            requestMatches.push({
                id:
                    crypto.randomUUID(),

                supplierBillId,

                supplierBillLineId:
                    request.supplierBillLineId,

                goodsReceiptId:
                    candidate.goodsReceiptId,

                goodsReceiptLineId:
                    candidate.goodsReceiptLineId,

                purchaseOrderId,

                purchaseOrderLineId:
                    request.purchaseOrderLineId,

                productId:
                    request.productId,

                matchedQuantity,

                matchedBaseQuantity,

                receiptUnitCost:
                    candidate.receiptUnitCost,

                matchedReceiptValue,

                billUnitCost:
                    request.billUnitCost,

                matchedBillValue,

                priceVariance,

                status:
                    "ACTIVE",

                createdAt,
            });

            candidate.availableQuantity =
                roundInventoryQuantity(
                    candidate.availableQuantity -
                    matchedQuantity,
                );

            remainingQuantity =
                roundInventoryQuantity(
                    remainingQuantity -
                    matchedQuantity,
                );
        }

        if (
            remainingQuantity >
            QUANTITY_TOLERANCE
        ) {
            throw new Error(
                "Supplier Bill quantity could not be fully matched.",
            );
        }

        const requestBillValue =
            roundMoney(
                request.quantity *
                request.billUnitCost,
            );

        /**
         * Reconcile line-level monetary rounding.
         *
         * The final allocation receives any
         * rounding difference so that the sum
         * equals the Supplier Bill Line amount.
         */
        const allocatedBillValue =
            roundMoney(
                requestMatches.reduce(
                    (total, match) =>
                        total +
                        match.matchedBillValue,
                    0,
                ),
            );

        const roundingDifference =
            roundMoney(
                requestBillValue -
                allocatedBillValue,
            );

        const finalMatch =
            requestMatches[
            requestMatches.length - 1
            ];

        if (
            finalMatch &&
            roundingDifference !== 0
        ) {
            finalMatch.matchedBillValue =
                roundMoney(
                    finalMatch.matchedBillValue +
                    roundingDifference,
                );

            finalMatch.priceVariance =
                roundMoney(
                    finalMatch.matchedBillValue -
                    finalMatch.matchedReceiptValue,
                );
        }

        matches.push(
            ...requestMatches,
        );
    }

    const totalMatchedQuantity =
        roundInventoryQuantity(
            matches.reduce(
                (total, match) =>
                    total +
                    match.matchedQuantity,
                0,
            ),
        );

    const totalMatchedBaseQuantity =
        roundInventoryQuantity(
            matches.reduce(
                (total, match) =>
                    total +
                    match.matchedBaseQuantity,
                0,
            ),
        );

    const totalMatchedReceiptValue =
        roundMoney(
            matches.reduce(
                (total, match) =>
                    total +
                    match.matchedReceiptValue,
                0,
            ),
        );

    const totalMatchedBillValue =
        roundMoney(
            matches.reduce(
                (total, match) =>
                    total +
                    match.matchedBillValue,
                0,
            ),
        );

    const totalPriceVariance =
        roundMoney(
            totalMatchedBillValue -
            totalMatchedReceiptValue,
        );

    return {
        supplierBillId,

        purchaseOrderId,

        matches,

        totalMatchedQuantity,

        totalMatchedBaseQuantity,

        totalMatchedReceiptValue,

        totalMatchedBillValue,

        totalPriceVariance,
    };
}

export const supplierBillReceiptMatchingService = {
    calculate:
        calculateMatching,

    getAvailableReceiptLines(
        purchaseOrderId: string,
        receipts: GoodsReceipt[],
        existingMatches: SupplierBillReceiptMatch[],
    ) {
        return buildAvailableReceiptLines(
            purchaseOrderId,
            receipts,
            existingMatches,
        );
    },
};