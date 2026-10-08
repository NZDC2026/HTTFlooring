import { index, pgTable, timestamp, uniqueIndex, uuid, varchar, } from 'drizzle-orm/pg-core';

import { memberships } from './memberships.js';
import { users } from './users.js';

export const refreshSessions = pgTable(
    'refresh_sessions',
    {
        id: uuid('id').defaultRandom().primaryKey(),

        familyId: uuid('family_id').notNull(),

        userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade', }),

        membershipId: uuid('membership_id').notNull().references(() => memberships.id, { onDelete: 'cascade', }),

        tokenHash: varchar('token_hash', { length: 64, }).notNull(),

        expiresAt: timestamp('expires_at', { withTimezone: true, }).notNull(),

        revokedAt: timestamp('revoked_at', { withTimezone: true, }),

        revokedReason: varchar('revoked_reason', { length: 100, }),

        replacedById: uuid('replaced_by_id'),

        createdAt: timestamp('created_at', { withTimezone: true, }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex('refresh_sessions_token_hash_unique').on(table.tokenHash),

        index('refresh_sessions_family_id_idx').on(table.familyId),

        index('refresh_sessions_user_id_idx').on(table.userId),

        index('refresh_sessions_membership_id_idx').on(table.membershipId),

        index('refresh_sessions_expires_at_idx').on(table.expiresAt),
    ],
);