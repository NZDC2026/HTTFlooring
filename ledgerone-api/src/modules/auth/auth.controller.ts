import { Body, Controller, HttpCode, HttpStatus, Post, } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, } from '@nestjs/swagger';

import { loginSchema, registerSchema, type RegisterInput, type LoginInput } from './auth.schemas.js';
import { AuthService, type RegistrationResult, } from './auth.service.js';

@ApiTags('Authentication')
@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    constructor(private readonly authService: AuthService,) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Register a new LedgerOne account',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Account registered successfully',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Request validation failed',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Account already exists',
    })
    register(
        @Body({
            schema: registerSchema,
        })
        input: RegisterInput,
    ): Promise<RegistrationResult> {
        return this.authService.register(input);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Login to LedgerOne',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Login successful',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid email or password',
    })
    login(
        @Body({
            schema: loginSchema,
        })
        input: LoginInput,
    ) {
        return this.authService.login(input);
    }
}