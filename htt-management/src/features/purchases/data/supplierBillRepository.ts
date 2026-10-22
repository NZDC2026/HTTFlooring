import { configuredNumber } from '../../business-workspace/configurationState';
import { registerRepository, snapshotRepositories } from "../../security/repositoryHost";
import { businessDateKey } from "../../../lib/businessDate";
import { financialStateStorage } from "../../../lib/persistence/financialStateStorage";
import { assertCurrentCrossModuleWriteSafe } from '../../integration/crossModuleWriteGate';
import { purchasePostingOperationRepository as postingOps } from "./purchasePostingOperationRepository";
import {
    purchaseOrderRepository,
} from "./purchaseOrderRepository";

import {
    purchasesAccountingPostingService,
} from "../../accounting/data/purchasesAccountingPostingService";

import { goodsReceiptRepository } from "./goodsReceiptRepository";
import { supplierBillReceiptMatchingService } from "./supplierBillReceiptMatchingService";
import { supplierBillReceiptMatchRepository } from "./supplierBillReceiptMatchRepository";

import {
    calculateSupplierBillLine,
    calculateSupplierBillTotals,
} from "../utils/supplierBillCalculations";

import type {
    SupplierBill,
    SupplierBillDraft,
    SupplierBillLine,
} from "../types/supplierBill";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let supplierBills:
    SupplierBill[] = financialStateStorage.read().supplierBills;

financialStateStorage.onRollback(() => { supplierBills = financialStateStorage.read().supplierBills; });

function emitChange() {
    try { financialStateStorage.update("supplierBills", supplierBills); }
    catch (error) { supplierBills = financialStateStorage.read().supplierBills; throw error; }
    listeners.forEach(listener => financialStateStorage.notify(listener));
}

function normalizeOptional(
    value:
        | string
        | undefined,
) {
    const normalized =
        value?.trim();

    return normalized
        ? normalized
        : undefined;
}

function createBillNumber(
    billDate: string,
) {
 return configuredNumber('BILL',supplierBills.map(r=>r.billNumber),billDate.slice(0,4));
}

export const supplierBillRepository =
{
    insertExpenseBill(bill:SupplierBill):SupplierBill {
        const prior=supplierBills.find(b=>b.managedDraftId===bill.managedDraftId);if(prior)return prior;
        if(supplierBills.some(b=>b.supplierId===bill.supplierId&&b.supplierInvoiceNumber.toLowerCase()===bill.supplierInvoiceNumber.toLowerCase()&&b.status!=='VOID'))throw new Error('Supplier invoice reference already exists.');
        supplierBills=[bill,...supplierBills];emitChange();return bill;
    },
    subscribe(
        listener: Listener,
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
        SupplierBill[] {
        return supplierBills;
    },

    getAll():
        SupplierBill[] {
        return supplierBills;
    },

    getById(
        supplierBillId:
            string,
    ) {
        return supplierBills.find(
            (bill) =>
                bill.id ===
                supplierBillId,
        );
    },

    getBySupplier(
        supplierId:
            string,
    ) {
        return supplierBills.filter(
            (bill) =>
                bill.supplierId ===
                supplierId,
        );
    },

    applyPayment(
        supplierBillId: string,
        amount: number,
    ): SupplierBill {
        const bill =
            supplierBills.find(
                (item) =>
                    item.id ===
                    supplierBillId,
            );

        if (!bill) {
            throw new Error(
                "Supplier bill was not found.",
            );
        }

        if (
            bill.status ===
            "VOID"
        ) {
            throw new Error(
                "A void supplier bill cannot receive a payment.",
            );
        }

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <= 0
        ) {
            throw new Error(
                "Payment allocation must be greater than zero.",
            );
        }

        const allocation =
            roundCurrency(
                amount,
            );

        if (
            allocation >
            bill.totals.amountDue
        ) {
            throw new Error(
                `${bill.billNumber} cannot be paid more than its outstanding balance.`,
            );
        }

        const amountPaid =
            roundCurrency(
                bill.totals
                    .amountPaid +
                allocation,
            );

        const amountDue =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .total -
                    amountPaid -
                    bill.totals
                        .amountCredited,
                ),
            );

        const updated:
            SupplierBill = {
            ...bill,

            status:
                amountDue <= 0
                    ? "PAID"
                    : amountPaid > 0 || bill.totals.amountCredited > 0
                        ? "PARTIALLY_PAID"
                        : "OPEN",

            totals: {
                ...bill.totals,

                amountPaid,

                amountDue,
            },

            updatedAt:
                new Date().toISOString(),
        };

        supplierBills =
            supplierBills.map(
                (item) =>
                    item.id ===
                        supplierBillId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    reversePayment(
        supplierBillId: string,
        amount: number,
    ): SupplierBill {
        const bill =
            supplierBills.find(
                (item) =>
                    item.id ===
                    supplierBillId,
            );

        if (!bill) {
            throw new Error(
                "Supplier bill was not found.",
            );
        }

        if (
            bill.status ===
            "VOID"
        ) {
            throw new Error(
                "A payment cannot be reversed against a void supplier bill.",
            );
        }

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <= 0
        ) {
            throw new Error(
                "Payment reversal amount must be greater than zero.",
            );
        }

        const reversal =
            roundCurrency(
                amount,
            );

        if (
            reversal >
            bill.totals.amountPaid
        ) {
            throw new Error(
                `${bill.billNumber} does not contain enough paid value to reverse this allocation.`,
            );
        }

        const amountPaid =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .amountPaid -
                    reversal,
                ),
            );

        const amountDue =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .total -
                    amountPaid -
                    bill.totals
                        .amountCredited,
                ),
            );

        const updated:
            SupplierBill = {
            ...bill,

            status:
                amountDue <= 0
                    ? "PAID"
                    : amountPaid > 0 || bill.totals.amountCredited > 0
                        ? "PARTIALLY_PAID"
                        : "OPEN",

            totals: {
                ...bill.totals,

                amountPaid,

                amountDue,
            },

            updatedAt:
                new Date().toISOString(),
        };

        supplierBills =
            supplierBills.map(
                (item) =>
                    item.id ===
                        supplierBillId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    applyCredit(
        supplierBillId: string,
        amount: number,
    ): SupplierBill {
        const bill =
            supplierBills.find(
                (item) =>
                    item.id ===
                    supplierBillId,
            );

        if (!bill) {
            throw new Error(
                "Supplier bill was not found.",
            );
        }

        if (
            bill.status ===
            "VOID"
        ) {
            throw new Error(
                "A void supplier bill cannot receive a credit allocation.",
            );
        }

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <= 0
        ) {
            throw new Error(
                "Credit allocation must be greater than zero.",
            );
        }

        const allocation =
            roundCurrency(
                amount,
            );

        if (
            allocation >
            bill.totals.amountDue
        ) {
            throw new Error(
                `${bill.billNumber} cannot receive credit greater than its outstanding balance.`,
            );
        }

        const amountCredited =
            roundCurrency(
                bill.totals
                    .amountCredited +
                allocation,
            );

        const amountDue =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .total -
                    bill.totals
                        .amountPaid -
                    amountCredited,
                ),
            );

        const updated:
            SupplierBill = {
            ...bill,

            status:
                amountDue <= 0
                    ? "PAID"
                    : bill.totals
                        .amountPaid >
                        0 ||
                        amountCredited >
                        0
                        ? "PARTIALLY_PAID"
                        : "OPEN",

            totals: {
                ...bill.totals,

                amountCredited,

                amountDue,
            },

            updatedAt:
                new Date().toISOString(),
        };

        supplierBills =
            supplierBills.map(
                (item) =>
                    item.id ===
                        supplierBillId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    reverseCredit(
        supplierBillId: string,
        amount: number,
    ): SupplierBill {
        const bill =
            supplierBills.find(
                (item) =>
                    item.id ===
                    supplierBillId,
            );

        if (!bill) {
            throw new Error(
                "Supplier bill was not found.",
            );
        }

        if (
            bill.status ===
            "VOID"
        ) {
            throw new Error(
                "A credit allocation cannot be reversed against a void supplier bill.",
            );
        }

        if (
            !Number.isFinite(
                amount,
            ) ||
            amount <= 0
        ) {
            throw new Error(
                "Credit reversal amount must be greater than zero.",
            );
        }

        const reversal =
            roundCurrency(
                amount,
            );

        if (
            reversal >
            bill.totals
                .amountCredited
        ) {
            throw new Error(
                `${bill.billNumber} does not contain enough credited value to reverse this allocation.`,
            );
        }

        const amountCredited =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .amountCredited -
                    reversal,
                ),
            );

        const amountDue =
            roundCurrency(
                Math.max(
                    0,
                    bill.totals
                        .total -
                    bill.totals
                        .amountPaid -
                    amountCredited,
                ),
            );

        const updated:
            SupplierBill = {
            ...bill,

            status:
                amountDue <= 0
                    ? "PAID"
                    : bill.totals
                        .amountPaid >
                        0 ||
                        amountCredited >
                        0
                        ? "PARTIALLY_PAID"
                        : "OPEN",

            totals: {
                ...bill.totals,

                amountCredited,

                amountDue,
            },

            updatedAt:
                new Date().toISOString(),
        };

        supplierBills =
            supplierBills.map(
                (item) =>
                    item.id ===
                        supplierBillId
                        ? updated
                        : item,
            );

        emitChange();

        return updated;
    },

    markVoid(
        supplierBillId: string,
        reason: string,
    ): SupplierBill {
        const bill = supplierBills.find((item) => item.id === supplierBillId);
        if (!bill) throw new Error("Supplier bill was not found.");
        if (bill.status === "VOID") throw new Error("This supplier bill has already been voided.");

        const normalizedReason = reason.trim();
        if (normalizedReason.length < 3) throw new Error("A void reason is required.");
        if (bill.status !== "OPEN" || bill.totals.amountPaid > 0 || bill.totals.amountCredited > 0) {
            throw new Error("A paid or credited supplier bill cannot be voided directly.");
        }

        const sourceCredits=(snapshotRepositories().supplierCredits as {supplierCredits:{sourceSupplierBillId:string;status:string}[]}|undefined)?.supplierCredits ?? financialStateStorage.read().supplierCredits;
        if(sourceCredits.some(c=>c.sourceSupplierBillId===bill.id&&c.status!=='VOID'))throw new Error('Reverse source supplier credits and linked physical returns before voiding the bill.');
        if(bill.kind==='EXPENSE') {
            assertCurrentCrossModuleWriteSafe();const now=new Date().toISOString(),voided={...bill,status:'VOID' as const,voidedAt:now,voidReason:normalizedReason,updatedAt:now};
            purchasesAccountingPostingService.reverseSupplierBill(voided);supplierBills=supplierBills.map(b=>b.id===bill.id?voided:b);emitChange();return voided;
        }
        const activeMatches = supplierBillReceiptMatchRepository.getByBill(bill.id)
            .filter((match) => match.status === "ACTIVE");
        if (activeMatches.length === 0) {
            throw new Error("Supplier bill has no active receipt matches to reverse.");
        }

        const now = new Date().toISOString();
        const voided: SupplierBill = {
            ...bill,
            status: "VOID",
            voidedAt: now,
            voidReason: normalizedReason,
            updatedAt: now,
        };

        // Preserve the exact void date and reason across retries.
        assertCurrentCrossModuleWriteSafe();
        const operation = postingOps.begin("SUPPLIER_BILL_VOID", bill.id);
        const key = operation.key;
        postingOps.registerRecovery(key, () => {
            postingOps.runStep(key, "REVERSAL_JOURNAL", () => {
                purchasesAccountingPostingService.reverseSupplierBill(voided);
            });
            postingOps.runStep(key, "PURCHASE_ORDER", () => {
                purchaseOrderRepository.reverseSupplierBill(
                    bill.purchaseOrderId,
                    bill.lines.map((line) => ({
                        purchaseOrderLineId: line.purchaseOrderLineId,
                        billedQuantity: line.quantity,
                    })),
                );
            });
            postingOps.runStep(key, "MATCHES", () => {
                supplierBillReceiptMatchRepository.reverseForBill(bill.id, normalizedReason, businessDateKey(now));
            });
            postingOps.runStep(key, "BILL", () => {
                supplierBills = supplierBills.map((item) => item.id === bill.id ? voided : item);
                emitChange();
            });
        });
        postingOps.recover(key);
        return voided;
    },

    getByPurchaseOrder(
        purchaseOrderId:
            string,
    ) {
        return supplierBills.filter(
            (bill) =>
                bill.purchaseOrderId ===
                purchaseOrderId,
        );
    },

    create(
        draft:
            SupplierBillDraft,
    ) {
        const purchaseOrder =
            purchaseOrderRepository.getById(
                draft.purchaseOrderId,
            );

        if (!purchaseOrder) {
            throw new Error(
                "Purchase order was not found.",
            );
        }

        if (
            ![
                "PARTIALLY_RECEIVED",
                "RECEIVED",
                "BILLED",
            ].includes(
                purchaseOrder.status,
            )
        ) {
            throw new Error(
                "Supplier bills can only be created for purchase orders with received goods.",
            );
        }

        const supplierInvoiceNumber =
            draft.supplierInvoiceNumber.trim();

        if (
            !supplierInvoiceNumber
        ) {
            throw new Error(
                "Supplier invoice number is required.",
            );
        }

        const duplicateInvoice =
            supplierBills.some(
                (bill) =>
                    bill.supplierId ===
                    purchaseOrder.supplierId &&
                    bill.supplierInvoiceNumber.toLowerCase() ===
                    supplierInvoiceNumber.toLowerCase() &&
                    bill.status !==
                    "VOID",
            );

        if (
            duplicateInvoice
        ) {
            throw new Error(
                "This supplier invoice number has already been entered.",
            );
        }

        if (
            !draft.billDate
        ) {
            throw new Error(
                "Bill date is required.",
            );
        }

        if (
            !draft.dueDate
        ) {
            throw new Error(
                "Due date is required.",
            );
        }

        if (
            draft.dueDate <
            draft.billDate
        ) {
            throw new Error(
                "Due date cannot be before bill date.",
            );
        }

        const positiveLines =
            draft.lines.filter(
                (line) =>
                    Number.isFinite(
                        line.quantity,
                    ) &&
                    line.quantity >
                    0,
            );

        if (
            positiveLines.length ===
            0
        ) {
            throw new Error(
                "Enter a bill quantity for at least one line.",
            );
        }

        const seenLineIds =
            new Set<string>();

        const lines:
            SupplierBillLine[] =
            positiveLines.map(
                (draftLine) => {
                    if (
                        seenLineIds.has(
                            draftLine.purchaseOrderLineId,
                        )
                    ) {
                        throw new Error(
                            "A purchase order line cannot appear more than once on the same bill.",
                        );
                    }

                    seenLineIds.add(
                        draftLine.purchaseOrderLineId,
                    );

                    const purchaseOrderLine =
                        purchaseOrder.lines.find(
                            (line) =>
                                line.id ===
                                draftLine.purchaseOrderLineId,
                        );

                    if (
                        !purchaseOrderLine
                    ) {
                        throw new Error(
                            "Purchase order line was not found.",
                        );
                    }

                    if (
                        !Number.isFinite(
                            draftLine.unitCost,
                        ) ||
                        draftLine.unitCost <
                        0
                    ) {
                        throw new Error(
                            `${purchaseOrderLine.description}: unit cost is invalid.`,
                        );
                    }

                    const billableQuantity =
                        roundQuantity(
                            purchaseOrderLine.receivedQuantity -
                            purchaseOrderLine.billedQuantity,
                        );

                    if (
                        billableQuantity <=
                        0
                    ) {
                        throw new Error(
                            `${purchaseOrderLine.description} has no received quantity available to bill.`,
                        );
                    }

                    if (
                        draftLine.quantity >
                        billableQuantity
                    ) {
                        throw new Error(
                            `${purchaseOrderLine.description} cannot bill more than ${billableQuantity} ${purchaseOrderLine.unitSymbol}.`,
                        );
                    }

                    const taxRate = purchaseOrderLine.taxRate ?? (purchaseOrderLine.lineSubtotal ? purchaseOrderLine.taxAmount / purchaseOrderLine.lineSubtotal : 0.1);
                    const calculations =
                        calculateSupplierBillLine(
                            {
                                taxRate,
                                quantity:
                                    draftLine.quantity,

                                unitCost:
                                    draftLine.unitCost,
                            },
                        );

                    if(purchaseOrderLine.grossUnitCost!==undefined&&draftLine.unitCost===purchaseOrderLine.unitCost){calculations.taxAmount=roundCurrency(draftLine.quantity*purchaseOrderLine.grossUnitCost-calculations.lineSubtotal);calculations.lineTotal=roundCurrency(calculations.lineSubtotal+calculations.taxAmount);}
                    return {
                        id:
                            `bill_line_${crypto.randomUUID()}`,
                        grossUnitCost:draftLine.unitCost===purchaseOrderLine.unitCost?purchaseOrderLine.grossUnitCost:undefined,taxRate, taxCode: purchaseOrderLine.taxCode, taxCollectedAccountId:purchaseOrderLine.taxCollectedAccountId,taxPaidAccountId:purchaseOrderLine.taxPaidAccountId,taxReport:purchaseOrderLine.taxReport,

                        purchaseOrderLineId:
                            purchaseOrderLine.id,

                        productId:
                            purchaseOrderLine.productId,

                        unitId:
                            purchaseOrderLine.unitId,

                        sku:
                            purchaseOrderLine.sku,

                        description:
                            purchaseOrderLine.description,

                        unitSymbol:
                            purchaseOrderLine.unitSymbol,

                        quantity:
                            draftLine.quantity,

                        unitCost:
                            draftLine.unitCost,

                        ...calculations,
                    };
                },
            );

        const totals =
            calculateSupplierBillTotals(
                lines,
            );

        const now =
            new Date().toISOString();

        const bill:
            SupplierBill =
        {
            id:
                `bill_${crypto.randomUUID()}`,

            billNumber:
                createBillNumber(
                    draft.billDate,
                ),

            supplierInvoiceNumber,

            supplierId:
                purchaseOrder.supplierId,

            supplierCode:
                purchaseOrder.supplierCode,

            supplierName:
                purchaseOrder.supplierName,

            purchaseOrderId:
                purchaseOrder.id,

            purchaseOrderNumber:
                purchaseOrder.purchaseOrderNumber,

            billDate:
                draft.billDate,

            dueDate:
                draft.dueDate,

            status:
                "OPEN",

            lines,

            totals,

            notes:
                normalizeOptional(
                    draft.notes,
                ),

            createdAt:
                now,

            updatedAt:
                now,
        };

        const matching = supplierBillReceiptMatchingService.calculate({
            supplierBillId: bill.id,
            purchaseOrderId: bill.purchaseOrderId,
            requests: bill.lines.map((line) => ({
                supplierBillId: bill.id,
                supplierBillLineId: line.id,
                purchaseOrderId: bill.purchaseOrderId,
                purchaseOrderLineId: line.purchaseOrderLineId,
                productId: line.productId,
                quantity: line.quantity,
                billUnitCost: line.unitCost,
            })),
            receipts: goodsReceiptRepository.getByPurchaseOrder(bill.purchaseOrderId),
            existingMatches: supplierBillReceiptMatchRepository.getAll(),
        });
        if (Math.abs(matching.totalMatchedBillValue - bill.totals.subtotal) > 0.01) {
            throw new Error("Supplier bill matching amount does not equal the bill subtotal.");
        }
        purchasesAccountingPostingService.validateSupplierBillPosting(bill, matching.totalMatchedReceiptValue);

        /**
         * All business and accounting validation
         * is complete before repository mutation.
         */
        assertCurrentCrossModuleWriteSafe();
        const operation = postingOps.begin("SUPPLIER_BILL", bill.id);
        const key = operation.key;
        postingOps.registerRecovery(key, () => {
            postingOps.runStep(key, "JOURNAL", () => {
                purchasesAccountingPostingService.postSupplierBill(bill, matching.totalMatchedReceiptValue);
            });
            postingOps.runStep(key, "PURCHASE_ORDER", () => {
                purchaseOrderRepository.recordSupplierBill(
                    purchaseOrder.id,
                    lines.map((line) => ({
                        purchaseOrderLineId: line.purchaseOrderLineId,
                        billedQuantity: line.quantity,
                    })),
                );
            });
            postingOps.runStep(key, "MATCHES", () => {
                supplierBillReceiptMatchRepository.saveForBill(bill.id, matching.matches.map(match => ({
                    ...match,
                    accountingDate: bill.billDate,
                })));
            });
            postingOps.runStep(key, "BILL", () => {
                supplierBills = [bill, ...supplierBills];
                emitChange();
            });
        });
        postingOps.recover(key);
        return bill;
    },
};

function roundQuantity(
    value: number,
) {
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            10000,
        ) / 10000
    );
}

function roundCurrency(
    value: number,
) {
    return (
        Math.round(
            (value +
                Number.EPSILON) *
            100,
        ) / 100
    );
}
registerRepository("supplierBills", {
    repository: supplierBillRepository, read: "purchases.read",
    commands: {"insertExpenseBill":null,"catch": null, "applyPayment": null, "reversePayment": null, "applyCredit": null, "reverseCredit": null, "markVoid": "purchases.void", "create": "purchases.bill", "return": null},
    snapshot: () => ({ supplierBills }),
    restore: value => { supplierBills = value.supplierBills;  },
    publish: () => listeners.forEach(listener => listener()),
});

/** Internal recovery writer; never invokes payment/posting steps. */
export function applyReviewedBillSummary(id:string, summary:Pick<SupplierBillTotalsForRepair,'amountPaid'|'amountCredited'|'amountDue'> & {status:SupplierBill['status']}):void {
    const {status,...totals}=summary;
    supplierBills=supplierBills.map(b=>b.id===id?{...b,status,totals:{...b.totals,...totals}}:b);emitChange();
}
type SupplierBillTotalsForRepair=SupplierBill['totals'];
