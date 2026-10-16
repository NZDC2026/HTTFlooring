import { validatePeriods } from '../../src/features/accounting/data/accountingPeriodValidation';
import { createHash } from 'node:crypto';
export type LegacyDatabase = { schemaVersion: 1; storage: Record<string, string>; repositories: Record<string, unknown>; lastCommandId?: string };
export type Database = Omit<LegacyDatabase, 'schemaVersion'> & { schemaVersion: 2 | 3; savedAt: string; checksum: string };
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
export function sealDatabase(data: Omit<Database, 'checksum' | 'schemaVersion' | 'savedAt'>): Database {
    const body = { schemaVersion: 3 as const, savedAt: new Date().toISOString(), storage: data.storage, repositories: data.repositories, ...(data.lastCommandId === undefined ? {} : { lastCommandId: data.lastCommandId }) };
    return { ...body, checksum: createHash('sha256').update(JSON.stringify(body)).digest('hex') };
}
export function parseDatabase(text: string): Database | LegacyDatabase {
    if (Buffer.byteLength(text) > 250_000_000) throw new Error('Business snapshot exceeds 250 MB.');
    const value = JSON.parse(text);
    if (!record(value) || ![1, 2, 3].includes(value.schemaVersion as number)) throw new Error('Unsupported business snapshot version.');
    if (!record(value.storage) || !Object.entries(value.storage).every(([key, v]) => key.startsWith('htt') && typeof v === 'string') || !record(value.repositories) || (value.lastCommandId !== undefined && typeof value.lastCommandId !== 'string')) throw new Error('Invalid business snapshot structure.');
    if (value.schemaVersion === 2 || value.schemaVersion === 3) {
        const { checksum, ...body } = value;
        if (typeof value.savedAt !== 'string' || !Number.isFinite(Date.parse(value.savedAt)) || checksum !== createHash('sha256').update(JSON.stringify(body)).digest('hex')) throw new Error('Business snapshot checksum failed.');
    }
    return value as Database | LegacyDatabase;
}
export function validateRepositories(actual: Record<string, unknown>, shape: Record<string, unknown>): void {
    if (JSON.stringify(Object.keys(actual).sort()) !== JSON.stringify(Object.keys(shape).sort())) throw new Error('Business repository schema mismatch; migration required.');
    for (const [key, expected] of Object.entries(shape)) {
        const value = actual[key];
        if (Array.isArray(expected)) { if (!Array.isArray(value)) throw new Error(`Invalid ${key} snapshot.`); }
        else if (!record(value) || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(Object.keys(expected as object).sort()) || !Object.values(value).every(Array.isArray)) throw new Error(`Invalid ${key} snapshot.`);
    }
    if (actual.accountingPeriods) validatePeriods((actual.accountingPeriods as { periods: unknown }).periods);
    // Some nested business arrays contain primitive values (e.g. linked IDs); only
    // repository-level row collections have an object-row contract.
    for (const value of Object.values(actual)) {
        const arrays = Array.isArray(value) ? [value] : Object.values(value as object);
        for (const rows of arrays) {
            const ids = new Set<string>();
            for (const row of rows as unknown[]) {
                if (!record(row)) throw new Error('Invalid business record.');
                if ('id' in row) { if (typeof row.id !== 'string' || !row.id || ids.has(row.id)) throw new Error('Invalid or duplicate business record ID.'); ids.add(row.id); }
            }
        }
    }
}

export function migratePeriodSnapshot(database: Database | LegacyDatabase): boolean {
    if (database.schemaVersion === 3) return false;
    if (!Object.hasOwn(database.repositories, 'accountingPeriods')) database.repositories.accountingPeriods = { periods: [] };
    return true;
}
