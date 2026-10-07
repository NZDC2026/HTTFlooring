import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseLifecycleService } from './database-lifecycle.service.js';
import { databasePoolProvider, databaseProvider, } from './database.provider.js';
import { DatabaseHealthIndicator } from './database-health.indicator.js';
import { DatabaseTransactionService } from './database-transaction.service.js';
import { InfrastructureVerificationRepository } from './repositories/infrastructure-verification.repository.js';

@Global()
@Module({
    imports: [TerminusModule],

    providers: [
        databasePoolProvider,
        databaseProvider,
        DatabaseLifecycleService,
        DatabaseHealthIndicator,
        // 事务组件
        DatabaseTransactionService,
        InfrastructureVerificationRepository,
    ],

    exports: [
        databaseProvider,
        DatabaseHealthIndicator,
        // 事务组件
        DatabaseTransactionService,
        InfrastructureVerificationRepository,
    ],
})
export class DatabaseModule { }