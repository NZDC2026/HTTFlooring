import { Inject, Injectable, } from '@nestjs/common';

import { DATABASE } from './database.constants.js';
import type { Database, DatabaseTransaction, } from './database.types.js';

@Injectable()
export class DatabaseTransactionService {
    constructor(
        @Inject(DATABASE)
        private readonly database: Database,
    ) { }

    execute<T>(
        callback: (
            transaction: DatabaseTransaction,
        ) => Promise<T>,
    ): Promise<T> {
        return this.database.transaction(callback);
    }
}
/* 如果确保在事务中执行的操作是原子性的，可以使用 execute 方法来执行事务操作。例如：
await this.transaction.execute(async (tx) => {
  await tx.insert(...);
  await tx.insert(...);
  await tx.update(...);
}); */