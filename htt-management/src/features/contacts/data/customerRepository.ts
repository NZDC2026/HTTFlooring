import { mockCustomers } from "./mockCustomers";

import type {
    Customer,
    CustomerContact,
    CustomerLocation,
} from "../types/customer";

import type {
    ContactFormValues,
    CustomerFormValues,
    LocationFormValues,
} from "../schemas/customerSchemas";

type Listener = () => void;

const listeners = new Set<Listener>();

let customers: Customer[] =
    structuredClone(mockCustomers);

function emitChange() {
    listeners.forEach((listener) => {
        listener();
    });
}

function createId(prefix: string) {
    return `${prefix}_${crypto.randomUUID()}`;
}

function createCustomerCode() {
    const numbers = customers
        .map((customer) => {
            const match =
                customer.code.match(/(\d+)$/);

            return match
                ? Number.parseInt(match[1], 10)
                : 0;
        })
        .filter(Number.isFinite);

    const nextNumber =
        Math.max(0, ...numbers) + 1;

    return `CUST-${nextNumber
        .toString()
        .padStart(4, "0")}`;
}

function normalizeOptional(
    value: string,
): string | undefined {
    const normalized = value.trim();

    return normalized.length > 0
        ? normalized
        : undefined;
}

function normalizeAbn(
    value: string,
): string | undefined {
    const normalized = value
        .replace(/\s/g, "")
        .trim();

    if (!normalized) {
        return undefined;
    }

    return normalized.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{3})$/,
        "$1 $2 $3 $4",
    );
}

function updateCustomerRecord(
    customerId: string,
    updater: (customer: Customer) => Customer,
) {
    let found = false;

    customers = customers.map((customer) => {
        if (customer.id !== customerId) {
            return customer;
        }

        found = true;

        return updater(customer);
    });

    if (!found) {
        throw new Error(
            `Customer ${customerId} was not found`,
        );
    }

    emitChange();
}

export const customerRepository = {
    subscribe(listener: Listener) {
        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    },

    getSnapshot(): Customer[] {
        return customers;
    },

    getAll(): Customer[] {
        return customers;
    },

    getById(
        customerId: string,
    ): Customer | undefined {
        return customers.find(
            (customer) =>
                customer.id === customerId,
        );
    },

    create(
        values: CustomerFormValues,
    ): Customer {
        const now = new Date().toISOString();

        const customer: Customer = {
            id: createId("cus"),

            code: createCustomerCode(),

            businessName:
                values.businessName.trim(),

            tradingName: normalizeOptional(
                values.tradingName,
            ),

            abn: normalizeAbn(values.abn),

            businessType: values.businessType,

            status: values.status,

            email: normalizeOptional(values.email),

            phone: normalizeOptional(values.phone),

            website: normalizeOptional(
                values.website,
            ),

            creditLimit: values.creditLimit,

            currentBalance: 0,

            overdueBalance: 0,

            paymentTermsDays:
                values.paymentTermsDays,

            locations: [],

            contacts: [],

            createdAt: now,
            updatedAt: now,
        };

        customers = [
            customer,
            ...customers,
        ];

        emitChange();

        return customer;
    },

    update(
        customerId: string,
        values: CustomerFormValues,
    ): Customer {
        let updatedCustomer:
            | Customer
            | undefined;

        updateCustomerRecord(
            customerId,
            (customer) => {
                updatedCustomer = {
                    ...customer,

                    businessName:
                        values.businessName.trim(),

                    tradingName: normalizeOptional(
                        values.tradingName,
                    ),

                    abn: normalizeAbn(values.abn),

                    businessType:
                        values.businessType,

                    status: values.status,

                    email: normalizeOptional(
                        values.email,
                    ),

                    phone: normalizeOptional(
                        values.phone,
                    ),

                    website: normalizeOptional(
                        values.website,
                    ),

                    creditLimit:
                        values.creditLimit,

                    paymentTermsDays:
                        values.paymentTermsDays,

                    updatedAt:
                        new Date().toISOString(),
                };

                return updatedCustomer;
            },
        );

        if (!updatedCustomer) {
            throw new Error(
                `Customer ${customerId} was not found`,
            );
        }

        return updatedCustomer;
    },

    addLocation(
        customerId: string,
        values: LocationFormValues,
    ): CustomerLocation {
        const customer =
            customerRepository.getById(
                customerId,
            );

        if (!customer) {
            throw new Error(
                `Customer ${customerId} was not found`,
            );
        }

        const shouldBePrimary =
            values.isPrimary ||
            customer.locations.length === 0;

        const location: CustomerLocation = {
            id: createId("loc"),

            name: values.name.trim(),

            addressLine1:
                values.addressLine1.trim(),

            addressLine2: normalizeOptional(
                values.addressLine2,
            ),

            suburb: values.suburb.trim(),

            state: values.state.trim(),

            postcode: values.postcode.trim(),

            country: values.country.trim(),

            phone: normalizeOptional(
                values.phone,
            ),

            isPrimary: shouldBePrimary,
        };

        updateCustomerRecord(
            customerId,
            (currentCustomer) => ({
                ...currentCustomer,

                primaryLocationId:
                    shouldBePrimary
                        ? location.id
                        : currentCustomer.primaryLocationId,

                locations: [
                    ...currentCustomer.locations.map(
                        (item) => ({
                            ...item,

                            isPrimary:
                                shouldBePrimary
                                    ? false
                                    : item.isPrimary,
                        }),
                    ),

                    location,
                ],

                updatedAt:
                    new Date().toISOString(),
            }),
        );

        return location;
    },

    updateLocation(
        customerId: string,
        locationId: string,
        values: LocationFormValues,
    ): CustomerLocation {
        const customer =
            customerRepository.getById(
                customerId,
            );

        if (!customer) {
            throw new Error(
                `Customer ${customerId} was not found`,
            );
        }

        const existing =
            customer.locations.find(
                (location) =>
                    location.id === locationId,
            );

        if (!existing) {
            throw new Error(
                `Location ${locationId} was not found`,
            );
        }

        const shouldBePrimary =
            values.isPrimary ||
            customer.locations.length === 1;

        const updatedLocation: CustomerLocation =
        {
            ...existing,

            name: values.name.trim(),

            addressLine1:
                values.addressLine1.trim(),

            addressLine2:
                normalizeOptional(
                    values.addressLine2,
                ),

            suburb: values.suburb.trim(),

            state: values.state.trim(),

            postcode: values.postcode.trim(),

            country: values.country.trim(),

            phone: normalizeOptional(
                values.phone,
            ),

            isPrimary: shouldBePrimary,
        };

        updateCustomerRecord(
            customerId,
            (currentCustomer) => ({
                ...currentCustomer,

                primaryLocationId:
                    shouldBePrimary
                        ? locationId
                        : currentCustomer.primaryLocationId,

                locations:
                    currentCustomer.locations.map(
                        (location) => {
                            if (
                                location.id ===
                                locationId
                            ) {
                                return updatedLocation;
                            }

                            if (shouldBePrimary) {
                                return {
                                    ...location,
                                    isPrimary: false,
                                };
                            }

                            return location;
                        },
                    ),

                updatedAt:
                    new Date().toISOString(),
            }),
        );

        return updatedLocation;
    },

    addContact(
        customerId: string,
        values: ContactFormValues,
    ): CustomerContact {
        const customer =
            customerRepository.getById(
                customerId,
            );

        if (!customer) {
            throw new Error(
                `Customer ${customerId} was not found`,
            );
        }

        if (
            values.locationId &&
            !customer.locations.some(
                (location) =>
                    location.id ===
                    values.locationId,
            )
        ) {
            throw new Error(
                "The selected location does not belong to this customer",
            );
        }

        const shouldBePrimary =
            values.isPrimary ||
            customer.contacts.length === 0;

        const contact: CustomerContact = {
            id: createId("con"),

            firstName:
                values.firstName.trim(),

            lastName:
                values.lastName.trim(),

            jobTitle: normalizeOptional(
                values.jobTitle,
            ),

            email: values.email.trim(),

            phone: normalizeOptional(
                values.phone,
            ),

            mobile: normalizeOptional(
                values.mobile,
            ),

            locationId:
                normalizeOptional(
                    values.locationId,
                ),

            isPrimary: shouldBePrimary,
        };

        updateCustomerRecord(
            customerId,
            (currentCustomer) => ({
                ...currentCustomer,

                primaryContactId:
                    shouldBePrimary
                        ? contact.id
                        : currentCustomer.primaryContactId,

                contacts: [
                    ...currentCustomer.contacts.map(
                        (item) => ({
                            ...item,

                            isPrimary:
                                shouldBePrimary
                                    ? false
                                    : item.isPrimary,
                        }),
                    ),

                    contact,
                ],

                updatedAt:
                    new Date().toISOString(),
            }),
        );

        return contact;
    },

    updateContact(
        customerId: string,
        contactId: string,
        values: ContactFormValues,
    ): CustomerContact {
        const customer =
            customerRepository.getById(
                customerId,
            );

        if (!customer) {
            throw new Error(
                `Customer ${customerId} was not found`,
            );
        }

        if (
            values.locationId &&
            !customer.locations.some(
                (location) =>
                    location.id ===
                    values.locationId,
            )
        ) {
            throw new Error(
                "The selected location does not belong to this customer",
            );
        }

        const existing =
            customer.contacts.find(
                (contact) =>
                    contact.id === contactId,
            );

        if (!existing) {
            throw new Error(
                `Contact ${contactId} was not found`,
            );
        }

        const shouldBePrimary =
            values.isPrimary ||
            customer.contacts.length === 1;

        const updatedContact: CustomerContact =
        {
            ...existing,

            firstName:
                values.firstName.trim(),

            lastName:
                values.lastName.trim(),

            jobTitle: normalizeOptional(
                values.jobTitle,
            ),

            email: values.email.trim(),

            phone: normalizeOptional(
                values.phone,
            ),

            mobile: normalizeOptional(
                values.mobile,
            ),

            locationId:
                normalizeOptional(
                    values.locationId,
                ),

            isPrimary: shouldBePrimary,
        };

        updateCustomerRecord(
            customerId,
            (currentCustomer) => ({
                ...currentCustomer,

                primaryContactId:
                    shouldBePrimary
                        ? contactId
                        : currentCustomer.primaryContactId,

                contacts:
                    currentCustomer.contacts.map(
                        (contact) => {
                            if (
                                contact.id === contactId
                            ) {
                                return updatedContact;
                            }

                            if (shouldBePrimary) {
                                return {
                                    ...contact,
                                    isPrimary: false,
                                };
                            }

                            return contact;
                        },
                    ),

                updatedAt:
                    new Date().toISOString(),
            }),
        );

        return updatedContact;
    },
};