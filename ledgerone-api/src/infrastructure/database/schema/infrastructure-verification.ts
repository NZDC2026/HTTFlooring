import { pgTable, timestamp, uuid, varchar, } from 'drizzle-orm/pg-core';

export const infrastructureVerification = pgTable(
    'infrastructure_verification',
    {
        id: uuid('id').defaultRandom().primaryKey(),

        name: varchar('name', {
            length: 100,
        }).notNull(),

        createdAt: timestamp('created_at', {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
);