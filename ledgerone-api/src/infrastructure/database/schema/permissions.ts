import { pgTable, timestamp, uniqueIndex, uuid, varchar, } from 'drizzle-orm/pg-core';

export const permissions = pgTable(
    'permissions',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        key: varchar('key', { length: 150, }).notNull(),
        description: varchar('description', { length: 300, }),
        createdAt: timestamp('created_at', { withTimezone: true, }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex('permissions_key_unique').on(table.key),
    ],
);