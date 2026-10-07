import { type MiddlewareConsumer, Module, type NestModule, } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { environmentSchema } from './config/environment.schema.js';
import { HealthModule } from './modules/health/health.module.js';
import { RequestContextMiddleware } from './common/context/request-context.middleware.js';
import { RequestContextService } from './common/context/request-context.service.js';
import { LoggingModule } from './infrastructure/logging/logging.module.js';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: environmentSchema,
    }),

    LoggingModule,

    HealthModule,

    DatabaseModule,
  ],

  providers: [
    RequestContextService,
    RequestContextMiddleware,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes('*');
  }
}