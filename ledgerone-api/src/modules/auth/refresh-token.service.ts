import { createHash, randomBytes, } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../../config/environment.schema.js';
import type { IssuedRefreshToken } from './auth.types.js';

@Injectable()
export class RefreshTokenService {
    private readonly ttlDays: number;

    constructor(
        configService: ConfigService<EnvironmentVariables, true>,
    ) {
        this.ttlDays = configService.get(
            'REFRESH_TOKEN_TTL_DAYS',
            {
                infer: true,
            },
        );
    }

    issue(): IssuedRefreshToken {
        const token = randomBytes(48).toString('base64url');

        const tokenHash = this.hash(token);

        const expiresAt = new Date(
            Date.now() +
            this.ttlDays * 24 * 60 * 60 * 1000,
        );

        return {
            token,
            tokenHash,
            expiresAt,
        };
    }

    hash(token: string): string {
        return createHash('sha256')
            .update(token)
            .digest('hex');
    }
}