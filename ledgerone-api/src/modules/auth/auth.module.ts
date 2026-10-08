import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module.js';
import { AccessTokenService } from './access-token.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from './password.service.js';
import { RefreshSessionRepository } from './refresh-session.repository.js';
import { RefreshTokenService } from './refresh-token.service.js';
import { RegistrationRepository } from './registration.repository.js';
import { AuthMembershipRepository } from './auth-membership.repository.js';

@Module({
    imports: [
        UsersModule,
    ],

    controllers: [
        AuthController,
    ],

    providers: [
        AuthService,
        PasswordService,
        AccessTokenService,
        RefreshTokenService,
        RefreshSessionRepository,
        RegistrationRepository,
        AuthMembershipRepository
    ],

    exports: [
        AuthService,
    ],
})
export class AuthModule { }