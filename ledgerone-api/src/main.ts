import { HttpStatus, StandardSchemaValidationPipe, VersioningType, } from '@nestjs/common';
import { ApiException } from './common/exceptions/api.exception.js';
import { ErrorCode } from './common/exceptions/error-code.js';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { EnvironmentVariables } from './config/environment.schema.js';
import { Logger } from 'nestjs-pino';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { setupOpenApi } from './infrastructure/openapi/openapi.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true, });

  app.enableShutdownHooks();

  app.useSecurityHeaders();

  app.useLogger(app.get(Logger));

  const configService = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  const port = configService.get('PORT', { infer: true, });

  const corsOrigins = configService.get('CORS_ORIGINS', { infer: true, },);

  app.set('trust proxy', 'loopback');

  app.useBodyParser('json', { limit: '1mb', });

  app.useBodyParser('urlencoded', { limit: '1mb', extended: true, });

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS',],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key',],
    exposedHeaders: ['X-Request-Id',],
    maxAge: 600,
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1', });

  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      transform: true,
      exceptionFactory: (issues) =>
        new ApiException(HttpStatus.BAD_REQUEST, {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Request validation failed',
          details: issues.map((issue) => ({
            path: issue.path?.map((segment) => typeof segment === 'object' ? String(segment.key) : String(segment),).join('.'),
            message: issue.message,
          })),
        }),
    })
  );

  setupOpenApi(app);

  await app.listen(port);
}

void bootstrap();