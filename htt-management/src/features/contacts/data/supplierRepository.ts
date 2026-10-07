import {
    mockSuppliers,
} from "./mockSuppliers";

import type {
    Supplier,
} from "../types/supplier";

import type {
    SupplierFormValues,
} from "../schemas/supplierSchemas";

type Listener = () => void;

const listeners =
    new Set<Listener>();

let suppliers: Supplier[] =
    structuredClone(
        mockSuppliers,
    );

function emitChange() {
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
    const numbers =
        suppliers
            .map(
                (supplier) => {
                    const match =
                        supplier.code.match(
                            /(\d+)$/,
                        );

                    return match
                        ? Number.parseInt(
                            match[1],
                            10,
                        )
                        : 0;
                },
            )
            .filter(
                Number.isFinite,
            );

    const nextNumber =
        Math.max(
            0,
            ...numbers,
        ) + 1;

    return `SUP-${nextNumber
        .toString()
        .padStart(
            4,
            "0",
        )}`;
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
    return {
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

        contactName:
            normalizeOptional(
                values.contactName,
            ),

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

        paymentTermsDays:
            values.paymentTermsDays,

        taxRegistered:
            values.taxRegistered,

        notes:
            normalizeOptional(
                values.notes,
            ),
    };
}

export const supplierRepository = {
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

            currency: "AUD",

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