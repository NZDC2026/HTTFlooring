import { pgTable, timestamp, uniqueIndex, uuid, varchar, } from 'drizzle-orm/pg-core';

export const users = pgTable(
    'users',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        email: varchar('email', { length: 320, }).notNull(),
        displayName: varchar('display_name', { length: 200, }),
        passwordHash: varchar('password_hash', { length: 512, }),
        createdAt: timestamp('created_at', { withTimezone: true, }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex('users_email_unique').on(table.email),
    ],
);