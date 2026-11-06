import { z } from "zod";
import { businessDateKey, requireDateKey } from "../../lib/businessDate";

export const currencies = ["USD", "AUD", "CNY"] as const;
export const currencySchema = z.enum(currencies);
export const storedCurrencySchema = currencySchema.or(z.literal("NZD"));
export type Currency = typeof currencies[number];
export const currencyLabel = (code: string) => code === "CNY" || code === "RMB" ? "RMB" : code;
export const currencyCode = (code: string) => code === "RMB" ? "CNY" : code;
export const moneyRound = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;
export const fxSchema = z.object({
    originalAmount:z.number().finite().nonnegative().optional(),
    baseAmount:z.number().finite().nonnegative().optional(),
    currency: currencySchema,
    baseCurrency: z.enum(["USD", "AUD", "CNY", "NZD"]),
    rate: z.number().finite().positive().max(1000000),
    rateDate: z.string(),
    source: z.enum(["Reference", "Manual"]),
}).strict();
export type FxSnapshot = z.infer<typeof fxSchema>;
export function validateFx(raw: unknown, baseCurrency?: string): FxSnapshot {
    const fx = fxSchema.parse(raw);
    requireDateKey(fx.rateDate, "Exchange rate date");
    if (baseCurrency && fx.baseCurrency !== currencyCode(baseCurrency)) throw new Error("Exchange rate must use the business base currency.");
    if ((fx.originalAmount === undefined) !== (fx.baseAmount === undefined)) throw new Error("Original and base amounts must be saved together.");
    if (fx.currency === fx.baseCurrency && fx.rate !== 1) throw new Error("Same-currency exchange rate must be 1.");
    return fx;
}
export function fxAmount(baseAmount: number, fx?: FxSnapshot) {
    if (!fx) return baseAmount;
    if (fx.originalAmount !== undefined && baseAmount === fx.baseAmount) return fx.originalAmount;
    return moneyRound(fx.originalAmount !== undefined && fx.baseAmount ? baseAmount * fx.originalAmount / fx.baseAmount : baseAmount / fx.rate);
}
export async function referenceRate(currency: string, baseCurrency: string, signal?: AbortSignal) {
    const from = currencyCode(currency), to = currencyCode(baseCurrency);
    const today = businessDateKey(new Date().toISOString());
    if (from === to) return {rate:1,rateDate:today};
    currencySchema.parse(from);
    if (![...currencies, "NZD"].includes(to)) throw new Error("Unsupported base currency.");
    const response = await fetch(`https://api.frankfurter.dev/v2/rate/${from.toLowerCase()}/${to.toLowerCase()}`, {signal:signal ? AbortSignal.any([signal,AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error("Reference rate unavailable. Enter the bank rate manually.");
    const result = await response.json();
    if (typeof result.base !== "string" || typeof result.quote !== "string" || !Number.isFinite(result.rate) || result.rate <= 0 || result.base?.toUpperCase() !== from || result.quote?.toUpperCase() !== to)
        throw new Error("The reference rate response is invalid.");
    requireDateKey(result.date, "Reference rate date");
    return {rate:result.rate as number,rateDate:result.date as string};
}
