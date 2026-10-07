import { z } from 'zod';

export const emailSchema = z
    .string()
    .trim()
    .min(1, {
        message: 'Email is required',
    })
    .max(320, {
        message: 'Email must not exceed 320 characters',
    })
    .email({
        message: 'Invalid email address',
    })
    .transform((value) => value.toLowerCase());

export const passwordSchema = z
    .string()
    .min(12, {
        message: 'Password must be at least 12 characters long',
    })
    .max(128, {
        message: 'Password must not exceed 128 characters',
    });

export const registerSchema = z.strictObject({
    email: emailSchema,

    password: passwordSchema,

    displayName: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .optional(),

    organizationName: z
        .string()
        .trim()
        .min(1, {
            message: 'Organization name is required',
        })
        .max(200, {
            message: 'Organization name must not exceed 200 characters',
        })
});

export const loginSchema = z.strictObject({
    email: emailSchema,

    password: z
        .string()
        .min(1, {
            message: 'Password is required',
        })
        .max(128, {
            message: 'Password must not exceed 128 characters',
        }),
});

export const refreshTokenSchema = z.strictObject({
    refreshToken: z
        .string()
        .min(1, {
            message: 'Refresh token is required',
        }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;