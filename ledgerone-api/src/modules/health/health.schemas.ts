import { z } from 'zod';

// 参数严格校验模式，如果出现未定义的参数，则会抛出异常
export const healthEchoSchema = z.strictObject({
    name: z.string().trim().min(1).max(100),
    count: z.number().int().positive(),
});

export type HealthEchoDto = z.infer<typeof healthEchoSchema>;