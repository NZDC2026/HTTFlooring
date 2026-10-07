import { Inject, Injectable, } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DATABASE } from '../../infrastructure/database/database.constants.js';
import { mapDatabaseError } from '../../infrastructure/database/database-error.mapper.js';
import type { Database } from '../../infrastructure/database/database.types.js';
import { refreshSessions } from '../../infrastructure/database/schema/refresh-sessions.js';

export interface CreateRefreshSessionInput {
    familyId: string;
    userId: string;
    membershipId: string;
    tokenHash: string;
    expiresAt: Date;
}

export interface RefreshSession {
    id: string;
    familyId: string;
    userId: string;
    membershipId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    revokedReason: string | null;
    replacedById: string | null;
    createdAt: Date;
}

@Injectable()
export class RefreshSessionRepository {
    constructor(@Inject(DATABASE) private readonly database: Database,) { }

    async create(input: CreateRefreshSessionInput,): Promise<RefreshSession> {
        try {
            const [session] = await this.database.insert(refreshSessions).values(input).returning();

            if (!session) {
                throw new Error('Refresh session insert did not return a record',);
            }

            return session;
        } catch (error) {
            mapDatabaseError(error);
        }
    }

    async findByTokenHash(tokenHash: string,): Promise<RefreshSession | null> {
        const [session] = await this.database.select().from(refreshSessions).where(eq(refreshSessions.tokenHash, tokenHash,),).limit(1);

        return session ?? null;
    }

    async revoke(id: string, reason: string,): Promise<void> {
        await this.database.update(refreshSessions).set({ revokedAt: new Date(), revokedReason: reason, }).where(eq(refreshSessions.id, id),);
    }

    async setReplacement(id: string, replacementId: string,): Promise<void> {
        await this.database.update(refreshSessions).set({ replacedById: replacementId, }).where(eq(refreshSessions.id, id),);
    }

    async revokeFamily(familyId: string, reason: string,): Promise<void> {
        await this.database.update(refreshSessions).set({ revokedAt: new Date(), revokedReason: reason, }).where(eq(refreshSessions.familyId, familyId,),);
    }
}