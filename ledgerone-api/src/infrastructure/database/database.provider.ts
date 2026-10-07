import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { EnvironmentVariables } from '../../config/environment.schema.js';
import { DATABASE, DATABASE_POOL, } from './database.constants.js';
import * as schema from './schema/index.js';

export const databasePoolProvider = {
    provide: DATABASE_POOL,
    inject: [ConfigService],

    useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,) => {
        const connectionString = configService.get('DATABASE_URL', { infer: true, },);

        return new Pool({
            connectionString,
            max: 10,
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 5_000,
        });
    },
};

export const databaseProvider = {
    provide: DATABASE,
    inject: [DATABASE_POOL],
    useFactory: (pool: Pool) => drizzle(pool, { schema, }),
};