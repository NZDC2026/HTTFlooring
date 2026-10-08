import { Inject, Injectable, } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Database, DatabaseExecutor, } from '../../infrastructure/database/database.types.js';
import { DATABASE } from '../../infrastructure/database/database.constants.js';
import { mapDatabaseError } from '../../infrastructure/database/database-error.mapper.js';
import { users } from '../../infrastructure/database/schema/users.js';

export interface UserSummary {
    id: string;
    email: string;
    displayName: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthenticationUser {
    id: string;
    email: string;
    passwordHash: string | null;
}

export interface CreateUserInput {
    email: string;
    passwordHash: string;
    displayName?: string;
}

@Injectable()
export class UsersRepository {
    constructor(
        @Inject(DATABASE)
        private readonly database: Database,
    ) { }

    async create(input: CreateUserInput, executor: DatabaseExecutor = this.database,): Promise<UserSummary> {
        try {
            const [user] = await executor
                .insert(users)
                .values({
                    email: input.email,
                    passwordHash: input.passwordHash,
                    displayName: input.displayName,
                })
                .returning({
                    id: users.id,
                    email: users.email,
                    displayName: users.displayName,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                });

            if (!user) {
                throw new Error(
                    'User insert did not return a record',
                );
            }

            return user;
        } catch (error) {
            mapDatabaseError(error);
        }
    }

    async findById(
        id: string,
    ): Promise<UserSummary | null> {
        const [user] = await this.database
            .select({
                id: users.id,
                email: users.email,
                displayName: users.displayName,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return user ?? null;
    }

    async findByEmailForAuthentication(
        email: string,
    ): Promise<AuthenticationUser | null> {
        const [user] = await this.database
            .select({
                id: users.id,
                email: users.email,
                passwordHash: users.passwordHash,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return user ?? null;
    }
}