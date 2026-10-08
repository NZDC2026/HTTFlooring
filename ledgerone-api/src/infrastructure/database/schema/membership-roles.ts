import { pgTable, primaryKey, uuid, } from 'drizzle-orm/pg-core';
import { memberships } from './memberships.js';
import { roles } from './roles.js';

export const membershipRoles = pgTable(
    'membership_roles',
    {
        membershipId: uuid('membership_id').notNull().references(() => memberships.id, { onDelete: 'cascade', }),
        roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade', }),
    },
    (table) => [
        primaryKey({
            columns: [table.membershipId, table.roleId,],
        }),
    ],
);