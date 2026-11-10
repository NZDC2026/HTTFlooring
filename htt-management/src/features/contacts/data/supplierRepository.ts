import { nextSupplierCode } from "./supplierCode";
import { shipmentWarehouse } from '../../incoming-shipments/shipmentWarehouse';
import { shipmentInput, shipmentReceiptInput, shipmentSchema, buildShipmentLines, type Shipment } from "../../incoming-shipments/shipmentModel";
import { resolveCommand } from "../../security/repositoryHost";
import { inventorySiteRepository } from "../../inventory/data/inventorySiteRepository";
import { normalizeAccountContacts, accountContactsSchema } from "./accountContacts";
import { validateTaskDocument } from "./taskDocumentReference";
import { snapshotRepositories } from "../../security/repositoryHost";
import type { PurchaseOrder } from "../../purchases/types/purchaseOrder";
import type { SupplierBill } from "../../purchases/types/supplierBill";
import { trustedAuthorization } from "../../security/trustedAuthorization";
import { supplierActivityInput, supplierActivityAction, supplierActivitySchema } from "./supplierActivities";
import { storedCurrencySchema, currencyCode } from "../../currency/currency";
import { validatePaymentTerms } from "../../payment-terms/paymentTerms";
import { businessSettings } from '../../business-workspace/configurationState';
import { registerRepository } from "../../security/repositoryHost";
import { readMockRepository, writeMockRepository, canWriteMockRepository } from "../../../lib/persistence/mockRepositoryStorage";
import {
    mockSuppliers,
} from "./mockSuppliers";

import type {
    Supplier,
} from "../types/supplier";

import type {
    SupplierFormValues,
} from "../schemas/supplierSchemas";

const STORAGE_KEY = "htt.mock.contacts.suppliers.v1";
function isSavedSupplierList(value: unknown): value is Supplier[] {
    return Array.isArray(value) && value.every(item =>
        item !== null && typeof item === "object" &&
        typeof item.id === "string" && typeof item.code === "string" &&
        typeof item.businessName === "string" &&
        typeof item.status === "string"
    );
}
const savedSuppliers = readMockRepository(STORAGE_KEY, isSavedSupplierList);
// Unsupported/corrupt data is preserved rather than silently reset.
const canPersistSuppliers = savedSuppliers.status !== "invalid" && canWriteMockRepository(STORAGE_KEY);

type Listener = () => void;

const listeners =
    new Set<Listener>();

let suppliers: Supplier[] =
    savedSuppliers.status === "ok" ? savedSuppliers.data : structuredClone(mockSuppliers);

function emitChange() {
    if (canPersistSuppliers) writeMockRepository(STORAGE_KEY, suppliers);
    listeners.forEach(
        (listener) => {
            listener();
        },
    );
}

function createId(
    prefix: string,
) {
    return `${prefix}_${crypto.randomUUID()}`;
}

function createSupplierCode() {
    return nextSupplierCode(suppliers);
}

function normalizeOptional(
    value: string,
): string | undefined {
    const normalized =
        value.trim();

    return normalized.length > 0
        ? normalized
        : undefined;
}

function normalizeAbn(
    value: string,
): string | undefined {
    const normalized =
        value
            .replace(
                /\s/g,
                "",
            )
            .trim();

    if (!normalized) {
        return undefined;
    }

    return normalized.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{3})$/,
        "$1 $2 $3 $4",
    );
}

function mapValues(
    values: SupplierFormValues,
) {
    validatePaymentTerms(values);
    const contacts=values.contacts===undefined?undefined:normalizeAccountContacts(values.contacts);
    return {
        ...(contacts===undefined?{}:{contacts,contactName:contacts.find(c=>c.isPrimary)?`${contacts.find(c=>c.isPrimary)!.firstName} ${contacts.find(c=>c.isPrimary)!.lastName}`.trim():undefined}),
        businessName:
            values.businessName.trim(),

        tradingName:
            normalizeOptional(
                values.tradingName,
            ),

        abn:
            normalizeAbn(
                values.abn,
            ),

        status:
            values.status,

        email:
            normalizeOptional(
                values.email,
            ),

        phone:
            normalizeOptional(
                values.phone,
            ),

        website:
            normalizeOptional(
                values.website,
            ),

        contactName: contacts===undefined?normalizeOptional(values.contactName):contacts.find(c=>c.isPrimary)?`${contacts.find(c=>c.isPrimary)!.firstName} ${contacts.find(c=>c.isPrimary)!.lastName}`.trim():undefined,

        addressLine1:
            normalizeOptional(
                values.addressLine1,
            ),

        addressLine2:
            normalizeOptional(
                values.addressLine2,
            ),

        suburb:
            normalizeOptional(
                values.suburb,
            ),

        state:
            normalizeOptional(
                values.state,
            ),

        postcode:
            normalizeOptional(
                values.postcode,
            ),

        country:
            values.country.trim(),

        ...(values.currency ? {currency:storedCurrencySchema.parse(currencyCode(values.currency))} : {}),
        paymentTermsDays:
            values.paymentTermsDays,
        paymentTermsType: values.paymentTermsType,

        taxRegistered:
            values.taxRegistered,

        notes:
            normalizeOptional(
                values.notes,
            ),
    };
}

export const supplierRepository = {
    saveShipment(raw:unknown) {
        const actor=trustedAuthorization.require("purchases.write"),input=shipmentInput.parse(raw);
        const supplier=suppliers.find(s=>s.id===input.supplierId);if(!supplier)throw Error("Supplier was not found");
        const prior=(supplier.shipments??[]).find(s=>s.history.some(h=>h.operationId===input.operationId));if(prior){if(prior.history.find(h=>h.operationId===input.operationId)?.request!==JSON.stringify(input))throw Error("Operation already has different shipment content");return prior;}
        const old=supplier.shipments?.find(s=>s.id===input.id);
        if(input.id&&!old)throw Error("Shipment was not found");
        if((old?.revision??0)!==input.revision)throw Error("Shipment changed. Reload and review before saving.");
        const locked=!!old?.lines.some(l=>l.received>0);
        if(locked&&(input.siteId!==old!.siteId||input.status!==old!.status&&input.status!=='Arrived'||JSON.stringify(input.lines)!==JSON.stringify(old!.lines.map(({purchaseOrderId,lineId,quantity})=>({purchaseOrderId,lineId,quantity})))))throw Error("Received shipment items, status and warehouse are locked.");
        if(old?.status==='Cancelled')throw Error("Cancelled shipments cannot be changed");
        if(!inventorySiteRepository.getActive().some(s=>s.id===input.siteId))throw Error("Choose an active destination warehouse");
        const regionWarehouse=shipmentWarehouse(businessSettings().companyName,inventorySiteRepository.getActive());if(!locked&&(!regionWarehouse.site||input.siteId!==regionWarehouse.site.id))throw Error("Shipment destination must match the current business region warehouse.");
        if(input.etd&&input.etd>input.eta)throw Error("ETA cannot be before dispatch date");
        const orders=(snapshotRepositories().purchaseOrders as {purchaseOrders:PurchaseOrder[]}).purchaseOrders;
        const all=suppliers.flatMap(s=>s.shipments??[]);
        const lines=locked||input.status==='Cancelled'&&old?old!.lines:buildShipmentLines(input,orders,all,old),at=new Date().toISOString();
        const next:Shipment={...input,id:old?.id??createId('shipment'),number:old?.number??`SHP-${new Date().getUTCFullYear()}-${String(all.length+1).padStart(4,'0')}`,revision:input.revision+1,lines,history:[...(old?.history??[]),{operationId:input.operationId,actorId:actor.userId,actorName:actor.displayName||actor.userId,at,reason:input.reason,request:JSON.stringify(input),action:old?'Updated':'Created',eta:input.eta,previousEta:old?.eta,status:input.status}],updatedAt:at};
        suppliers=suppliers.map(s=>s.id===supplier.id?{...s,shipments:[...(s.shipments??[]).filter(x=>x.id!==next.id),next]}:s);emitChange();return next;
    },
    receiveShipment(raw:unknown) {
        const actor=trustedAuthorization.require("purchases.receive"),input=shipmentReceiptInput.parse(raw);
        const supplier=suppliers.find(s=>s.id===input.supplierId),old=supplier?.shipments?.find(s=>s.id===input.id);
        if(!supplier||!old)throw Error("Shipment was not found");
        if(old.history.some(h=>h.operationId===input.operationId)){if(old.history.find(h=>h.operationId===input.operationId)?.request!==JSON.stringify(input))throw Error("Operation already has different receiving content");return old;}
        if(old.revision!==input.revision)throw Error("Shipment changed. Reload before receiving.");
        if(!['Preparing','In Transit','Arrived'].includes(old.status))throw Error("Only active shipments can receive goods");
        const keys=new Set<string>();
        for(const l of input.lines){const key=l.purchaseOrderId+':'+l.lineId;if(keys.has(key))throw Error('Duplicate receiving line');keys.add(key);const line=old.lines.find(x=>x.purchaseOrderId===l.purchaseOrderId&&x.lineId===l.lineId);if(!line||l.quantity>line.quantity-line.received+0.000001)throw Error("Receiving exceeds shipment quantity");}
        const receiptIds:string[]=[];
        for(const poId of new Set(input.lines.map(l=>l.purchaseOrderId))){const receipt=resolveCommand('goodsReceipts','create').execute([{purchaseOrderId:poId,siteId:old.siteId,receiptDate:input.date,supplierDeliveryReference:old.number,notes:input.reason,lines:input.lines.filter(l=>l.purchaseOrderId===poId).map(l=>({purchaseOrderLineId:l.lineId,receivedQuantity:l.quantity}))}]) as {id:string};receiptIds.push(receipt.id);}
        const at=new Date().toISOString(),next:Shipment={...old,revision:old.revision+1,lines:old.lines.map(l=>({...l,received:Math.round((l.received+(input.lines.find(x=>x.purchaseOrderId===l.purchaseOrderId&&x.lineId===l.lineId)?.quantity??0))*10000)/10000})),history:[...old.history,{operationId:input.operationId,actorId:actor.userId,actorName:actor.displayName||actor.userId,at,reason:input.reason,request:JSON.stringify(input),action:'Received',eta:old.eta,status:'Receiving',receiptIds}],updatedAt:at};
        suppliers=suppliers.map(s=>s.id===supplier.id?{...s,shipments:s.shipments!.map(x=>x.id===old.id?next:x)}:s);emitChange();return next;
    },

    addActivity(raw: unknown) {
        const actor=trustedAuthorization.require("contacts.write");
        trustedAuthorization.require("purchases.read");
        const input=supplierActivityInput.parse(raw), supplier=suppliers.find(s=>s.id===input.supplierId);
        if(!supplier) throw Error("Supplier was not found.");
        if(input.kind!=="Task"&&(input.documentType||input.documentId))throw Error("Only tasks can link documents.");
        const snapshots=snapshotRepositories();
        validateTaskDocument(input.documentType,input.documentId,supplier.id,(snapshots.purchaseOrders as {purchaseOrders:PurchaseOrder[]}).purchaseOrders,(snapshots.supplierBills as {supplierBills:SupplierBill[]}).supplierBills,"supplierId");
        const prior=(supplier.activities??[]).find(a=>a.operationId===input.operationId);
        if(prior){if(prior.text!==input.text||prior.kind!==input.kind||prior.due!==input.due||prior.documentType!==input.documentType||prior.documentId!==input.documentId||prior.actorId!==actor.userId)throw Error("Operation already has different content.");return prior;}
        const activity={id:createId("supplier_activity"),operationId:input.operationId,kind:input.kind,text:input.text,due:input.due,documentType:input.documentType,documentId:input.documentId,
            actorId:actor.userId,actorName:actor.displayName||actor.userId,at:new Date().toISOString(),replies:[]};
        suppliers=suppliers.map(s=>s.id===supplier.id?{...s,activities:[...(s.activities??[]),activity],updatedAt:activity.at}:s);
        emitChange();return activity;
    },
    activityAction(raw: unknown) {
        const actor=trustedAuthorization.require("contacts.write");
        trustedAuthorization.require("purchases.read");
        const input=supplierActivityAction.parse(raw), supplier=suppliers.find(s=>s.id===input.supplierId);
        const activity=supplier?.activities?.find(a=>a.id===input.activityId);
        if(!supplier||!activity)throw Error("Supplier activity was not found.");
        const prior=[...activity.replies,...(activity.completion?[activity.completion]:[])].find(e=>e.operationId===input.operationId);
        if(prior){if(prior.text!==input.text||prior.actorId!==actor.userId||(input.action==="complete")!==(activity.completion===prior))throw Error("Operation already has different content.");return prior;}
        if(activity.completion)throw Error("This activity is already completed.");
        const event={id:createId("supplier_event"),operationId:input.operationId,text:input.text,actorId:actor.userId,actorName:actor.displayName||actor.userId,at:new Date().toISOString()};
        suppliers=suppliers.map(s=>s.id===supplier.id?{...s,updatedAt:event.at,activities:s.activities!.map(a=>a.id===activity.id?{...a,...(input.action==="complete"?{completion:event}:{replies:[...a.replies,event]})}:a)}:s);
        emitChange();return event;
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

    getSnapshot(): Supplier[] {
        return suppliers;
    },

    getAll(): Supplier[] {
        return suppliers;
    },

    getById(
        supplierId: string,
    ): Supplier | undefined {
        return suppliers.find(
            (supplier) =>
                supplier.id ===
                supplierId,
        );
    },

    create(
        values: SupplierFormValues,
    ): Supplier {
        if(values.currency === "NZD") throw new Error("Choose USD, AUD or RMB for new suppliers.");
        const now =
            new Date().toISOString();

        const supplier: Supplier = {
            id:
                createId(
                    "sup",
                ),

            code:
                createSupplierCode(),

            ...mapValues(
                values,
            ),

            currency: storedCurrencySchema.parse(currencyCode(values.currency ?? businessSettings().currency)),

            createdAt: now,
            updatedAt: now,
        };

        suppliers = [
            supplier,
            ...suppliers,
        ];

        emitChange();

        return supplier;
    },

    update(
        supplierId: string,
        values: SupplierFormValues,
    ): Supplier {
        const existing =
            supplierRepository.getById(
                supplierId,
            );

        if (!existing) {
            throw new Error(
                `Supplier ${supplierId} was not found`,
            );
        }

        if(values.currency === "NZD" && existing.currency !== "NZD") throw new Error("Choose USD, AUD or RMB.");
        const updated: Supplier = {
            ...existing,

            ...mapValues(
                values,
            ),

            updatedAt:
                new Date().toISOString(),
        };

        suppliers =
            suppliers.map(
                (supplier) =>
                    supplier.id ===
                        supplierId
                        ? updated
                        : supplier,
            );

        emitChange();

        return updated;
    },
};
registerRepository("suppliers", {
    repository: supplierRepository, read: "purchases.read",
    commands: {"saveShipment":"purchases.write","receiveShipment":"purchases.receive","addActivity":"contacts.write","activityAction":"contacts.write","if": null, "create": "contacts.write", "update": "contacts.write"},
    validate: (value,snapshots) => { for (const supplier of (value as {suppliers:Supplier[]}).suppliers) {
        const shipmentIds=new Set<string>();
        for(const raw of supplier.shipments??[]){const shipment=shipmentSchema.parse(raw);if(shipment.supplierId!==supplier.id||shipmentIds.has(shipment.id)||shipment.revision!==shipment.history.length)throw Error('Invalid shipment identity or revision');shipmentIds.add(shipment.id);
            for(const line of shipment.lines){const po=(snapshots.purchaseOrders as {purchaseOrders:PurchaseOrder[]}).purchaseOrders.find(p=>p.id===line.purchaseOrderId&&p.supplierId===supplier.id);if(!po?.lines.some(l=>l.id===line.lineId)||line.received>line.quantity)throw Error('Invalid shipment purchase order reference');}
        }
        if(supplier.contacts!==undefined)accountContactsSchema.parse(supplier.contacts);
        if (supplier.paymentTermsType !== undefined) validatePaymentTerms(supplier);
        const operations=new Set<string>();
        for(const raw of supplier.activities??[]) {
            const activity=supplierActivitySchema.parse(raw);
            if(activity.kind!=="Task"&&(activity.documentType||activity.documentId))throw Error("Only tasks can link documents.");
            validateTaskDocument(activity.documentType,activity.documentId,supplier.id,(snapshots.purchaseOrders as {purchaseOrders:PurchaseOrder[]}).purchaseOrders,(snapshots.supplierBills as {supplierBills:SupplierBill[]}).supplierBills,"supplierId");
            if(activity.kind==="Task"&&!activity.due)throw Error("Task due date is required.");
            for(const event of [activity,...activity.replies,...(activity.completion?[activity.completion]:[])]) {
                if(operations.has(event.operationId))throw Error("Duplicate supplier activity operation.");
                operations.add(event.operationId);
            }
        }
    } },
    snapshot: () => ({ suppliers }),
    restore: value => { suppliers = value.suppliers;  },
    publish: () => listeners.forEach(listener => listener()),
});
