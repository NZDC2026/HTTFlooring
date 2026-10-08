import { index, pgTable, timestamp, uuid, varchar, } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';

export const organizations = pgTable(
    'organizations',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'restrict', }),
        name: varchar('name', { length: 200, }).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, }).defaultNow().notNull(),
    },
    (table) => [
        index('organizations_tenant_id_idx').on(table.tenantId),
    ],
);