import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger, type ExceptionFilter, } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApiException } from '../exceptions/api.exception.js';
import { ErrorCode, type ErrorCode as ErrorCodeType, } from '../exceptions/error-code.js';
import type { ErrorResponse } from '../exceptions/error-response.js';
import { RequestContextService } from '../context/request-context.service.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost, private readonly requestContext: RequestContextService,) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;

        const context = host.switchToHttp();
        const response = context.getResponse();

        const status = this.getStatus(exception);
        const body = this.createResponse(exception, status);

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                exception instanceof Error
                    ? exception.stack
                    : 'Unknown internal server error',
            );
        }

        httpAdapter.reply(response, body, status);
    }

    private getStatus(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }

        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private createResponse(
        exception: unknown,
        status: number,
    ): ErrorResponse {
        const requestId = this.requestContext.getRequestId() ?? 'unknown';
        if (exception instanceof ApiException) {
            return {
                error: {
                    code: exception.code,
                    message: exception.message,
                    ...(exception.details !== undefined
                        ? { details: exception.details }
                        : {}),
                    requestId,
                },
            };
        }

        if (exception instanceof HttpException) {
            return {
                error: {
                    code: this.mapHttpStatusToCode(status),
                    message: this.getHttpExceptionMessage(exception),
                    requestId,
                },
            };
        }

        return {
            error: {
                code: ErrorCode.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
                requestId,
            },
        };
    }

    private getHttpExceptionMessage(exception: HttpException): string {
        const response = exception.getResponse();

        if (typeof response === 'string') {
            return response;
        }

        if (
            typeof response === 'object' &&
            response !== null &&
            'message' in response
        ) {
            const message = response.message;

            if (typeof message === 'string') {
                return message;
            }
        }

        return exception.message;
    }

    private mapHttpStatusToCode(status: number): ErrorCodeType {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return ErrorCode.BAD_REQUEST;

            case HttpStatus.UNAUTHORIZED:
                return ErrorCode.UNAUTHORIZED;

            case HttpStatus.FORBIDDEN:
                return ErrorCode.FORBIDDEN;

            case HttpStatus.NOT_FOUND:
                return ErrorCode.NOT_FOUND;

            case HttpStatus.CONFLICT:
                return ErrorCode.CONFLICT;

            default:
                return status >= HttpStatus.INTERNAL_SERVER_ERROR
                    ? ErrorCode.INTERNAL_SERVER_ERROR
                    : ErrorCode.BAD_REQUEST;
        }
    }
}