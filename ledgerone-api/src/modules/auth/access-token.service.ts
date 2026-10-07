import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify } from 'jose';

import type { EnvironmentVariables } from '../../config/environment.schema.js';
import type {
    AccessTokenClaims,
    AccessTokenPayload,
    IssuedAccessToken,
} from './auth.types.js';

@Injectable()
export class AccessTokenService {
    private readonly secret: Uint8Array;
    private readonly ttlSeconds: number;

    constructor(
        configService: ConfigService<EnvironmentVariables, true>,
    ) {
        const secret = configService.get(
            'ACCESS_TOKEN_SECRET',
            {
                infer: true,
            },
        );

        this.ttlSeconds = configService.get(
            'ACCESS_TOKEN_TTL_SECONDS',
            {
                infer: true,
            },
        );

        this.secret = new TextEncoder().encode(secret);
    }

    async issue(
        claims: AccessTokenClaims,
    ): Promise<IssuedAccessToken> {
        const token = await new SignJWT({
            tenantId: claims.tenantId,
            organizationId: claims.organizationId,
            membershipId: claims.membershipId,
        })
            .setProtectedHeader({
                alg: 'HS256',
                typ: 'JWT',
            })
            .setSubject(claims.userId)
            .setIssuedAt()
            .setExpirationTime(`${this.ttlSeconds}s`)
            .sign(this.secret);

        return {
            token,
            expiresIn: this.ttlSeconds,
        };
    }

    async verify(
        token: string,
    ): Promise<AccessTokenPayload> {
        try {
            const { payload } = await jwtVerify(
                token,
                this.secret,
                {
                    algorithms: ['HS256'],
                },
            );

            if (
                typeof payload.sub !== 'string' ||
                typeof payload.tenantId !== 'string' ||
                typeof payload.organizationId !== 'string' ||
                typeof payload.membershipId !== 'string'
            ) {
                throw new UnauthorizedException(
                    'Invalid access token',
                );
            }

            return {
                sub: payload.sub,
                tenantId: payload.tenantId,
                organizationId: payload.organizationId,
                membershipId: payload.membershipId,
            };
        } catch {
            throw new UnauthorizedException(
                'Invalid or expired access token',
            );
        }
    }
}