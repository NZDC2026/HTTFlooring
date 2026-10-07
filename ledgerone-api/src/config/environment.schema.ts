import { z } from 'zod';

export const environmentSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),

    PORT: z.coerce
        .number()
        .int()
        .min(1)
        .max(65535)
        .default(3000),

    LOG_LEVEL: z
        .enum([
            'fatal',
            'error',
            'warn',
            'info',
            'debug',
            'trace',
            'silent',
        ])
        .default('info'),

    CORS_ORIGINS: z
        .string()
        .default('http://localhost:5173')
        .transform((value) =>
            value
                .split(',')
                .map((origin) => origin.trim())
                .filter(Boolean),
        ),

    DATABASE_URL: z
        .string()
        .url()
        .startsWith('postgresql://'),

    ACCESS_TOKEN_SECRET: z
        .string()
        .min(
            32,
            'ACCESS_TOKEN_SECRET must be at least 32 characters',
        ),

    ACCESS_TOKEN_TTL_SECONDS: z.coerce
        .number()
        .int()
        .positive()
        .default(900),

    REFRESH_TOKEN_TTL_DAYS: z.coerce
        .number()
        .int()
        .positive()
        .default(30),
});

export type EnvironmentVariables = z.infer<typeof environmentSchema>;