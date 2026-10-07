import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DATABASE } from '../../infrastructure/database/database.constants.js';
import type { Database } from '../../infrastructure/database/database.types.js';
import {
    memberships,
    organizations,
} from '../../infrastructure/database/schema/index.js';

export interface AuthMembership {
    id: string;
    tenantId: string;
    organizationId: string;
    organizationName: string;
}

@Injectable()
export class AuthMembershipRepository {
    constructor(
        @Inject(DATABASE)
        private readonly database: Database,
    ) { }

    async findPrimaryByUserId(
        userId: string,
    ): Promise<AuthMembership | null> {
        const [membership] = await this.database
            .select({
                id: memberships.id,
                tenantId: memberships.tenantId,
                organizationId: memberships.organizationId,
                organizationName: organizations.name,
            })
            .from(memberships)
            .innerJoin(
                organizations,
                eq(
                    memberships.organizationId,
                    organizations.id,
                ),
            )
            .where(eq(memberships.userId, userId))
            .limit(1);

        return membership ?? null;
    }
}