import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { EnvironmentVariables } from '../../config/environment.schema.js';
import { DATABASE } from './database.constants.js';
import * as schema from './schema/index.js';

export const databaseProvider = {
    provide: DATABASE,

    inject: [ConfigService],

    useFactory: (configService: ConfigService<EnvironmentVariables, true>,) => {
        const connectionString = configService.get('DATABASE_URL', { infer: true, },);

        const pool = new Pool({
            connectionString,
            max: 10,
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 5_000,
        });

        return drizzle(pool, { schema, });
    },
};