import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RequestContextService } from '../context/request-context.service.js';

@Injectable()
export class HttpLoggingInterceptor
    implements NestInterceptor {
    private readonly logger = new Logger(
        HttpLoggingInterceptor.name,
    );

    constructor(
        private readonly requestContext: RequestContextService,
    ) { }

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const startedAt = performance.now();

        const http = context.switchToHttp();

        const request = http.getRequest<Request>();
        const response = http.getResponse<Response>();

        return next.handle().pipe(
            tap({
                next: () => {
                    this.logRequest(
                        request,
                        response,
                        startedAt,
                    );
                },

                error: () => {
                    this.logRequest(
                        request,
                        response,
                        startedAt,
                    );
                },
            }),
        );
    }

    private logRequest(
        request: Request,
        response: Response,
        startedAt: number,
    ): void {
        const durationMs = Math.round(
            (performance.now() - startedAt) * 100,
        ) / 100;

        this.logger.log({
            event: 'http_request_completed',
            requestId:
                this.requestContext.getRequestId(),
            method: request.method,
            path: request.originalUrl,
            statusCode: response.statusCode,
            durationMs,
        });
    }
}