import { index, pgTable, timestamp, uniqueIndex, uuid, } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.js';
import { tenants } from './tenants.js';
import { users } from './users.js';

export const memberships = pgTable(
    'memberships',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'restrict', }),
        organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade', }),
        userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade', }),
        createdAt: timestamp('created_at', { withTimezone: true, }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex('memberships_organization_user_unique',).on(table.organizationId, table.userId,),
        index('memberships_tenant_id_idx').on(table.tenantId),
        index('memberships_user_id_idx').on(table.userId),
        index('memberships_organization_id_idx').on(table.organizationId),
    ],
);