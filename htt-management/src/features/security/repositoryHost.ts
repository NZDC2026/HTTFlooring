import { hasPermission, type Permission, type VerifiedPrincipal } from './rbac';
import type { BusinessView, SecurityBridge } from './securityContract';
type Entry = { validate?: (value: unknown, snapshots: Record<string, unknown>) => void; read: Permission; snapshot: () => unknown; restore: (value: any) => void; publish: () => void; repository: Record<string, any>; commands: Record<string, Permission | null> };
const entries = new Map<string, Entry>();
let currentView: BusinessView | undefined;
const mainHost = () => (globalThis as Record<string, unknown>).__HTT_MAIN_HOST__ === true;
function bridge(): SecurityBridge | undefined { return typeof window === 'undefined' ? undefined : window.securityBridge; }
export function nativeRequest<T>(action: string, input?: unknown): T {
    const host = bridge();
    if (!host) throw new Error('This operation requires the secure Electron desktop application.');
    const reply = host.request(action, input);
    if (!reply.ok) throw new Error('error' in reply ? reply.error : 'Desktop request failed.');
    return reply.value as T;
}
export function hydrateBusiness(view: BusinessView): void {
    // Renderer copies support existing read-only report calculators; they are never authoritative.
    if (typeof window !== 'undefined') {
        try {
            for (const key of Object.keys(window.localStorage)) if (key.startsWith('htt')) window.localStorage.removeItem(key);
            for (const [key, value] of Object.entries(view.storage)) window.localStorage.setItem(key, value);
        } catch { /* A renderer cache quota cannot undo an acknowledged main-process commit. */ }
    }
    currentView = view;
    restoreRepositories(view.repositories, false);
    entries.forEach(entry => entry.publish());
}
export function registerRepository(name: string, entry: Entry): void {
    if (entries.has(name)) throw new Error(`Duplicate repository registration: ${name}`);
    entries.set(name, entry);
    // Vitest exercises the original pure repositories. Production mutations always go through main.
    if (mainHost() || import.meta.env?.MODE === 'test') return;
    if (currentView && Object.hasOwn(currentView.repositories, name)) entry.restore(structuredClone(currentView.repositories[name]));
    for (const [method, permission] of Object.entries(entry.commands)) {
        if (!Object.hasOwn(entry.repository, method)) continue;
        entry.repository[method] = (...args: unknown[]) => {
            if (!permission) throw new Error(`Internal repository method is not a desktop command: ${name}.${method}`);
            const reply = nativeRequest<{ result: unknown; view: BusinessView }>('business.command', { repository: name, method, args });
            hydrateBusiness(reply.view);
            return reply.result;
        };
    }
}
export function snapshotRepositories(): Record<string, unknown> {
    return Object.fromEntries([...entries].map(([name, entry]) => [name, structuredClone(entry.snapshot())]));
}
export function validateRegisteredSnapshots(snapshots: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(snapshots)) entries.get(name)?.validate?.(structuredClone(value), snapshots);
}
export function restoreRepositories(snapshots: Record<string, unknown>, strict = true): void {
    for (const [name, value] of Object.entries(snapshots)) {
        const entry = entries.get(name);
        if (!entry) { if (strict) throw new Error(`Unknown repository in desktop snapshot: ${name}`); continue; }
        entry.restore(structuredClone(value));
    }
}
export function resolveCommand(repository: string, method: string) {
    const entry = entries.get(repository);
    const permission = entry && Object.hasOwn(entry.commands, method) ? entry.commands[method] : null;
    if (!permission || typeof entry?.repository[method] !== 'function') throw new Error('Unknown or internal desktop business command.');
    return { permission, execute: (args: unknown[]) => entry.repository[method].apply(entry.repository, args) };
}

export function snapshotForPrincipal(principal: VerifiedPrincipal): Record<string, unknown> {
    return Object.fromEntries([...entries].map(([name, entry]) => {
        const state = structuredClone(entry.snapshot());
        const allowed = hasPermission(principal, entry.read);
        const empty = Array.isArray(state) ? [] : Object.fromEntries(Object.keys(state as object).map(key => [key, []]));
        return [name, allowed ? state : empty];
    }));
}
