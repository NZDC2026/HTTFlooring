import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import type { EnvironmentVariables } from '../../config/environment.schema.js';

@Module({
    imports: [
        LoggerModule.forRootAsync({
            inject: [ConfigService],

            useFactory: (
                configService: ConfigService<
                    EnvironmentVariables,
                    true
                >,
            ) => {
                const nodeEnv = configService.get('NODE_ENV', {
                    infer: true,
                });

                const level = configService.get('LOG_LEVEL', {
                    infer: true,
                });

                return {
                    pinoHttp: {
                        level,

                        autoLogging: false,

                        redact: {
                            paths: [
                                'req.headers.authorization',
                                'req.headers.cookie',
                                'req.headers["set-cookie"]',

                                'headers.authorization',
                                'headers.cookie',
                                'headers["set-cookie"]',

                                'authorization',
                                'password',
                                'currentPassword',
                                'newPassword',
                                'accessToken',
                                'refreshToken',
                                'token',
                                'secret',
                            ],
                            censor: '[REDACTED]',
                        },

                        transport:
                            nodeEnv === 'development'
                                ? {
                                    target: 'pino-pretty',
                                    options: {
                                        singleLine: true,
                                        translateTime: 'SYS:standard',
                                    },
                                }
                                : undefined,
                    },
                };
            },
        }),
    ],

    exports: [LoggerModule],
})
export class LoggingModule { }