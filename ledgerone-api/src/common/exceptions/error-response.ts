import type { ErrorCode } from './error-code.js';

export interface ErrorDetail {
    path?: string;
    message: string;
}

export interface ErrorResponse {
    error: {
        code: ErrorCode;
        message: string;
        details?: unknown;
        requestId: string;
    };
}