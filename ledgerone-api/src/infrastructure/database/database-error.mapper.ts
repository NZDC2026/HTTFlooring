import { HttpStatus } from '@nestjs/common';
import type { DatabaseError } from 'pg';
import { ApiException } from '../../common/exceptions/api.exception.js';
import { ErrorCode } from '../../common/exceptions/error-code.js';

function isPostgresError(error: unknown,): error is DatabaseError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof error.code === 'string'
    );
}

function findPostgresError(error: unknown,): DatabaseError | null {
    if (isPostgresError(error)) {
        return error;
    }

    if (typeof error === 'object' && error !== null && 'cause' in error) {
        return findPostgresError(error.cause);
    }

    return null;
}

export function mapDatabaseError(error: unknown,): never {
    const postgresError = findPostgresError(error);

    if (!postgresError) {
        throw error;
    }

    switch (postgresError.code) {
        case '23505':
            throw new ApiException(
                HttpStatus.CONFLICT,
                {
                    code: ErrorCode.CONFLICT,
                    message: 'Resource already exists',
                },
            );

        case '23503':
            throw new ApiException(
                HttpStatus.CONFLICT,
                {
                    code: ErrorCode.CONFLICT,
                    message:
                        'Referenced resource is invalid',
                },
            );

        case '23502':
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                {
                    code: ErrorCode.BAD_REQUEST,
                    message:
                        'Required data is missing',
                },
            );

        default:
            throw error;
    }
}