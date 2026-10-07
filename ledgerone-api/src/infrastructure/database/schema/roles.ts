import { index, pgTable, timestamp, uniqueIndex, uuid, varchar, } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';

export const roles = pgTable(
    'roles',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade', }),
        name: varchar('name', { length: 100, }).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex('roles_tenant_name_unique').on(table.tenantId, table.name),
        index('roles_tenant_id_idx').on(table.tenantId),
    ],
);