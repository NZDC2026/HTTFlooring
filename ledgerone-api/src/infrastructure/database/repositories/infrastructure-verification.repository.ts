import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DATABASE } from '../database.constants.js';
import type { Database } from '../database.types.js';
import { infrastructureVerification } from '../schema/index.js';
import { mapDatabaseError } from '../database-error.mapper.js';


// mapDatabaseError(error)如果需要前端显示数据库错误信息，可以在这里进行处理，例如将数据库错误映射为自定义的异常类型，或者记录日志等。
@Injectable()
export class InfrastructureVerificationRepository {
    constructor(
        @Inject(DATABASE)
        private readonly database: Database,
    ) { }

    async create(name: string) {
        try {
            const [record] = await this.database
                .insert(infrastructureVerification)
                .values({
                    name,
                })
                .returning();

            return record;
        } catch (error) {
            mapDatabaseError(error);
        }
    }

    async findByName(name: string) {
        const [record] = await this.database
            .select()
            .from(infrastructureVerification)
            .where(
                eq(
                    infrastructureVerification.name,
                    name,
                ),
            )
            .limit(1);

        return record ?? null;
    }

    async deleteByName(name: string): Promise<void> {
        await this.database
            .delete(infrastructureVerification)
            .where(
                eq(
                    infrastructureVerification.name,
                    name,
                ),
            );
    }
}