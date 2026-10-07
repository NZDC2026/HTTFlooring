import { HttpStatus, Injectable, } from '@nestjs/common';
import { DatabaseTransactionService } from '../../infrastructure/database/database-transaction.service.js';
import { UsersRepository } from '../users/users.repository.js';
import type { RegisterInput, } from './auth.schemas.js';
import { PasswordService } from './password.service.js';
import { RegistrationRepository } from './registration.repository.js';
import { randomUUID } from 'node:crypto';
import { ApiException, } from '../../common/exceptions/api.exception.js';
import { ErrorCode, } from '../../common/exceptions/error-code.js';
import type { LoginInput, } from './auth.schemas.js';
import { AccessTokenService } from './access-token.service.js';
import { AuthMembershipRepository } from './auth-membership.repository.js';
import { RefreshTokenService } from './refresh-token.service.js';
import { RefreshSessionRepository } from './refresh-session.repository.js';

export interface RegistrationResult {
    user: {
        id: string;
        email: string;
        displayName: string | null;
    };

    organization: {
        id: string;
        name: string;
    };

    membership: {
        id: string;
    };
}

@Injectable()
export class AuthService {
    constructor(
        private readonly passwordService: PasswordService,
        private readonly usersRepository: UsersRepository,
        private readonly registrationRepository: RegistrationRepository,
        private readonly transaction: DatabaseTransactionService,
        private readonly accessTokenService: AccessTokenService,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly refreshSessionRepository: RefreshSessionRepository,
        private readonly authMembershipRepository: AuthMembershipRepository,
    ) { }

    async register(input: RegisterInput,): Promise<RegistrationResult> {
        const passwordHash =
            await this.passwordService.hash(
                input.password,
            );

        return this.transaction.execute(
            async (tx) => {
                const user = await this.usersRepository.create(
                    {
                        email: input.email,
                        passwordHash,
                        displayName:
                            input.displayName,
                    },
                    tx,
                );

                const tenant = await this.registrationRepository
                    .createTenant(
                        tx,
                        input.organizationName,
                    );

                const organization = await this.registrationRepository
                    .createOrganization(
                        tx,
                        {
                            tenantId: tenant.id,
                            name: input.organizationName,
                        },
                    );

                const membership = await this.registrationRepository
                    .createMembership(
                        tx,
                        {
                            tenantId: tenant.id,
                            organizationId:
                                organization.id,
                            userId: user.id,
                        },
                    );

                const ownerRole = await this.registrationRepository
                    .createRole(
                        tx,
                        {
                            tenantId: tenant.id,
                            name: 'Owner',
                        },
                    );

                await this.registrationRepository
                    .assignRole(
                        tx,
                        {
                            membershipId:
                                membership.id,
                            roleId: ownerRole.id,
                        },
                    );

                return {
                    user: {
                        id: user.id,
                        email: user.email,
                        displayName: user.displayName,
                    },
                    organization: {
                        id: organization.id,
                        name: organization.name,
                    },
                    membership: {
                        id: membership.id,
                    },
                };
            },
        );
    }

    async login(input: LoginInput) {
        const user =
            await this.usersRepository
                .findByEmailForAuthentication(
                    input.email,
                );

        if (!user || !user.passwordHash) {
            throw new ApiException(
                HttpStatus.UNAUTHORIZED,
                {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Invalid email or password',
                },
            );
        }

        const valid =
            await this.passwordService.verify(
                user.passwordHash,
                input.password,
            );

        if (!valid) {
            throw new ApiException(
                HttpStatus.UNAUTHORIZED,
                {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Invalid email or password',
                },
            );
        }

        const membership =
            await this.authMembershipRepository
                .findPrimaryByUserId(user.id);

        if (!membership) {
            throw new ApiException(
                HttpStatus.FORBIDDEN,
                {
                    code: ErrorCode.FORBIDDEN,
                    message: 'No active organization membership',
                },
            );
        }

        const accessToken =
            await this.accessTokenService.issue({
                userId: user.id,
                tenantId: membership.tenantId,
                organizationId:
                    membership.organizationId,
                membershipId: membership.id,
            });

        const refresh =
            await this.refreshTokenService.issue();

        const familyId = randomUUID();

        await this.refreshSessionRepository.create({
            familyId,
            userId: user.id,
            membershipId: membership.id,
            tokenHash: refresh.tokenHash,
            expiresAt: refresh.expiresAt,
        });

        return {
            accessToken,
            refreshToken: refresh.token,
            tokenType: 'Bearer',
            expiresIn: 900,

            user: {
                id: user.id,
                email: user.email,
            },

            organization: {
                id: membership.organizationId,
                name: membership.organizationName,
            },
        };
    }
}