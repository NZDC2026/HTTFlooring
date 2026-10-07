import { randomUUID } from 'node:crypto';

import {
    Injectable,
    type NestMiddleware,
} from '@nestjs/common';
import type {
    NextFunction,
    Request,
    Response,
} from 'express';

import { RequestContextService } from './request-context.service.js';

const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestContextMiddleware
    implements NestMiddleware {
    constructor(
        private readonly requestContext: RequestContextService,
    ) { }

    use(
        request: Request,
        response: Response,
        next: NextFunction,
    ): void {
        const incomingRequestId =
            request.headers[REQUEST_ID_HEADER];

        const requestId = this.resolveRequestId(
            incomingRequestId,
        );

        response.setHeader(REQUEST_ID_HEADER, requestId);

        this.requestContext.run(
            {
                requestId,
            },
            next,
        );
    }

    private resolveRequestId(
        value: string | string[] | undefined,
    ): string {
        if (
            typeof value === 'string' &&
            this.isValidRequestId(value)
        ) {
            return value;
        }

        return randomUUID();
    }

    private isValidRequestId(value: string): boolean {
        return (
            value.length >= 1 &&
            value.length <= 128 &&
            /^[A-Za-z0-9._:-]+$/.test(value)
        );
    }
}