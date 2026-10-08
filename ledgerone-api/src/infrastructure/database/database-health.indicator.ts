import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult, } from '@nestjs/terminus';
import type { Pool } from 'pg';
import { DATABASE_POOL } from './database.constants.js';

@Injectable()
export class DatabaseHealthIndicator {
    constructor(
        @Inject(DATABASE_POOL)
        private readonly pool: Pool,
        private readonly healthIndicatorService: HealthIndicatorService,
    ) { }

    async isHealthy(key: string,): Promise<HealthIndicatorResult> {
        const indicator = this.healthIndicatorService.check(key);

        try {
            await this.pool.query('SELECT 1');
            return indicator.up();
        } catch {
            return indicator.down();
        }
    }
}