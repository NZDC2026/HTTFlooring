import type { AutomationKind } from '../../src/features/recurring/recurringAutomationRepository';
import { configureDocumentPurgeBackup } from './documentPurgeBackup';
import { dirname, join } from "node:path";
import { existsSync, readFileSync, mkdirSync, openSync, closeSync, fsyncSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { hasPermission } from '../../src/features/security/rbac';
import { resolveCommand, validateRegisteredSnapshots, restoreRepositories, snapshotForPrincipal, snapshotRepositories } from '../../src/features/security/repositoryHost';
import type { BusinessView } from '../../src/features/security/securityContract';
import { LocalSecurity, atomicJson } from './localSecurity';
import { parseDatabase, sealDatabase, migratePeriodSnapshot, migrateWorkspaceSnapshot, validateRepositories, type Database, type LegacyDatabase } from './businessSnapshot';
export class BusinessHost {
    private values: Record<string, string> = {};
    private initialized = false;
    private automationEngine?: Pick<typeof import('./businessEngine'),'dueRecurringCandidates'|'prepareRecurringFailure'|'classifyImportedBankLines'|'assertBankInstructionCommand'>;
    private scanningRecurring = false;
    private workspaceDefaults: Record<string, unknown> = {};
    private blocked = false;
    private lastCommandId?: string;
    private assertPeriod: (date: string) => void = () => { throw new Error('Period controls not initialized.'); };
    private prepared?: { token: string; actor: string; database: Database | LegacyDatabase; revision: string | undefined; expires: number };
    private path: string;
    private security: LocalSecurity;
    constructor(path: string, security: LocalSecurity) { this.path = path; this.security = security; }
    async initialize(legacy: Record<string, string> = {}): Promise<void> {
        if (this.blocked) throw new Error('Restart the desktop application before reopening business data.');
        if (this.initialized) return;
        if (!this.security.principal()) throw new Error('Login required.');
        let migrationSource: unknown;
        let saved: Database | LegacyDatabase | undefined;
        if (existsSync(this.path)) {
            saved = parseDatabase(readFileSync(this.path, 'utf8'));
            if (saved.schemaVersion !== 31) { migrationSource = structuredClone(saved); migratePeriodSnapshot(saved); }
            this.values = saved.storage;
        } else {
            this.security.require('users.manage');
            if (!legacy || typeof legacy !== 'object' || Object.keys(legacy).length > 1000) throw new Error('Invalid legacy local data.');
            for (const [key, value] of Object.entries(legacy)) {
                if (!key.startsWith('htt') || typeof value !== 'string' || value.length > 50_000_000) throw new Error('Invalid legacy local data.');
            }
            const backup = join(dirname(this.path), 'legacy-profile-backup-v1.json');
            if (!existsSync(backup)) atomicJson(backup, { schemaVersion: 1, capturedAt: new Date().toISOString(), storage: legacy });
            this.values = { ...legacy };
            this.security.audit('business.import', 'local-desktop-profile', 'INTENT', 'users.manage');
        }
        const store: Storage = {
            get length() { return Object.keys(thisHost.values).length; },
            key: index => Object.keys(this.values)[index] ?? null,
            getItem: key => this.values[key] ?? null,
            setItem: (key, value) => { this.values[key] = String(value); },
            removeItem: key => { delete this.values[key]; },
            clear: () => { this.values = {}; },
        };
        const thisHost = this;
        Object.defineProperty(globalThis, '__HTT_MAIN_HOST__', { configurable: true, value: true });
        Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
        Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: store } });
        const engine = await import('./businessEngine');
        this.workspaceDefaults = engine.workspaceDefaults;
        if (saved) {
            migrateWorkspaceSnapshot(saved, this.workspaceDefaults);
            validateRepositories(saved.repositories, snapshotRepositories());
            validateRegisteredSnapshots(saved.repositories);
            restoreRepositories(saved.repositories);
            this.lastCommandId = saved.lastCommandId;
        }
        engine.initialize(() => this.security.principal());
        this.automationEngine = engine;
        this.assertPeriod = engine.assertPostingPeriod;
        configureDocumentPurgeBackup(()=>{
            const principal=this.security.require('users.manage');
            if(!principal.roles.includes('ADMIN')||!this.initialized||this.blocked) throw new Error('Permanent purge requires a healthy ADMIN desktop session.');
            const repositories=snapshotRepositories();
            validateRegisteredSnapshots(repositories);
            const database=sealDatabase({storage:structuredClone(this.values),repositories,lastCommandId:this.lastCommandId});
            const directory=join(dirname(this.path),'recycle-backups'),id=randomUUID(),fileName=`pre-purge-${id}.json`;
            mkdirSync(directory,{recursive:true,mode:0o700});
            const path=join(directory,fileName); atomicJson(path,database);
            const text=readFileSync(path,'utf8');
            const verified=parseDatabase(text);validateRepositories(verified.repositories,repositories);validateRegisteredSnapshots(verified.repositories);
            if(JSON.stringify(verified)!==JSON.stringify(database)) throw new Error('Pre-purge backup verification failed.');
            return {id,fileName,sha256:createHash('sha256').update(text).digest('hex'),createdAt:new Date().toISOString()};
        });
        if (migrationSource) {
            atomicJson(join(dirname(this.path), `pre-migration-v${saved!.schemaVersion}-${randomUUID()}.json`), migrationSource);
            this.persist();
            this.security.audit('business.migrate.v9', 'local-desktop-profile', 'SUCCESS', 'users.manage');
        }
        if (!saved) {
            this.persist();
            this.security.audit('business.import', 'local-desktop-profile', 'SUCCESS', 'users.manage');
        }
        for (const pending of this.security.pendingBusinessCommands()) {
            this.security.audit(`recovery.${pending.action}`, pending.resourceId, pending.commandId === this.lastCommandId ? 'SUCCESS' : 'FAILED', pending.permission, pending.commandId);
        }
        this.initialized = true;
    }
    // Runs only in the authenticated desktop process. Each occurrence has its own
    // durable atomic command, so one invalid template cannot roll back other schedules.
    scanRecurringDue() {
        const report={processed:0,generated:0,failed:0,remaining:0};
        const principal=this.security.principal(),engine=this.automationEngine;
        if(this.blocked) throw new Error('Business writes blocked; restart and inspect local audit.');
        if(!this.initialized||!principal||!engine||this.scanningRecurring) return report;
        this.scanningRecurring=true;
        try {
            for(let i=0;i<20;i++) {
                const candidate=engine.dueRecurringCandidates(principal)[0];
                if(!candidate) break;
                const kind=candidate.kind as AutomationKind;
                report.processed++;
                try {
                    this.command({repository:'recurringAutomation',method:'execute',args:[{kind,id:candidate.id,expectedRevision:candidate.revision,date:candidate.nextDate}]});
                    report.generated++;
                } catch(error) {
                    if(this.blocked) throw error;
                    const ticket=engine.prepareRecurringFailure(kind,candidate.id,candidate.nextDate,error instanceof Error?error.message:'Generation failed.');
                    this.command({repository:'recurringAutomation',method:'recordFailure',args:[{ticket}]});
                    report.failed++;
                }
            }
            report.remaining=engine.dueRecurringCandidates(principal).length;
            return report;
        } finally {this.scanningRecurring=false;}
    }
    private persist(commandId = this.lastCommandId): void {
        atomicJson(this.path, sealDatabase({ storage: this.values, repositories: snapshotRepositories(), lastCommandId: commandId }));
        this.lastCommandId = commandId;
    }
    exportBackup(): Database {
        this.security.require('users.manage');
        if (!this.initialized || this.blocked) throw new Error('Backup requires healthy initialized business data.');
        const database = parseDatabase(readFileSync(this.path, 'utf8'));
        validateRepositories(database.repositories, snapshotRepositories()); validateRegisteredSnapshots(database.repositories);
        return sealDatabase({ storage: database.storage, repositories: database.repositories, lastCommandId: database.lastCommandId });
    }
    prepareRestore(text: string) {
        const actor = this.security.require('users.manage');
        this.prepared = undefined;
        const database = parseDatabase(text);
        migratePeriodSnapshot(database);
        // A failed bootstrap may not have loaded repository modules yet. Validation
        // against their complete contract happens again before the atomic restore.
        if (this.initialized) { migrateWorkspaceSnapshot(database, this.workspaceDefaults); validateRepositories(database.repositories, snapshotRepositories()); validateRegisteredSnapshots(database.repositories); }
        const token = randomUUID();
        this.prepared = { token, actor: actor.userId, database, revision: this.lastCommandId, expires: Date.now() + 300_000 };
        const counts = Object.fromEntries(Object.entries(database.repositories).map(([name, value]) => [name, Array.isArray(value) ? value.length : Object.values(value as object).reduce<number>((n, rows) => n + (Array.isArray(rows) ? rows.length : 0), 0)]));
        return { token, schemaVersion: database.schemaVersion, savedAt: database.schemaVersion !== 1 ? database.savedAt : 'Legacy v1', counts };
    }
    async restoreBackup(token: string): Promise<void> {
        const actor = this.security.require('users.manage'), prepared = this.prepared;
        this.prepared = undefined;
        if (!prepared || prepared.token !== token || prepared.actor !== actor.userId || prepared.revision !== this.lastCommandId || prepared.expires < Date.now()) throw new Error('Restore preview expired; select the backup again.');
        // Load contracts for recovery even when the existing file is corrupt. No
        // accounting initialization or writes are performed during this inspection.
        Object.defineProperty(globalThis, '__HTT_MAIN_HOST__', { configurable: true, value: true });
        if (!this.initialized) {
            const scratch = new Map<string, string>();
            const store = { getItem: (key: string) => scratch.get(key) ?? null, setItem: (key: string, value: string) => scratch.set(key, String(value)), removeItem: (key: string) => scratch.delete(key), clear: () => scratch.clear() };
            Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store });
            Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: store } });
        }
        const engine = await import('./businessEngine');
        migrateWorkspaceSnapshot(prepared.database, engine.workspaceDefaults);
        validateRepositories(prepared.database.repositories, snapshotRepositories());
        validateRegisteredSnapshots(prepared.database.repositories);
        if (this.security.require('users.manage').userId !== actor.userId) throw new Error('Restore session changed.');
        const pending = this.security.pendingBusinessCommands();
        if (pending.length) {
            // Resolve interrupted writes against the current file before a restore
            // replaces its last-command evidence. A corrupt file cannot prove this.
            const current = parseDatabase(readFileSync(this.path, 'utf8'));
            for (const row of pending) this.security.audit(`recovery.${row.action}`, row.resourceId, row.commandId === current.lastCommandId ? 'SUCCESS' : 'FAILED', row.permission, row.commandId);
        }
        const commandId = randomUUID();
        this.security.audit('business.restore', 'business-data-only', 'INTENT', 'users.manage', commandId);
        // Preserve the exact previous bytes, including a corrupt file, for diagnosis.
        if (existsSync(this.path)) {
            const folder = join(dirname(this.path), 'recovery-backups'); mkdirSync(folder, { recursive: true, mode: 0o700 });
            const fd = openSync(join(folder, `before-restore-${commandId}.json`), 'wx', 0o600);
            try { writeFileSync(fd, readFileSync(this.path)); fsyncSync(fd); } finally { closeSync(fd); }
            const dir = openSync(folder, 'r'); try { fsyncSync(dir); } finally { closeSync(dir); }
        }
        const database = sealDatabase({ storage: prepared.database.storage, repositories: prepared.database.repositories, lastCommandId: commandId });
        this.blocked = true;
        try { atomicJson(this.path, database); }
        catch { throw new Error('Restore commit could not be confirmed. Restart and inspect before retry.'); }
        this.security.audit('business.restore', 'business-data-only', 'SUCCESS', 'users.manage', commandId);
        // Restart is mandatory: repository closures, subscriptions and cached
        // initialization flags must all be reconstructed from the restored file.
    }
    view(): BusinessView {
        const principal = this.security.principal(); if (!principal || !this.initialized) throw new Error('Login and desktop data initialization required.');
        const storage = hasPermission(principal, 'audit.read') ? Object.fromEntries(Object.entries(this.values).filter(([key]) => key === 'htt:financial-operations:v1' || key.startsWith('htt.purchasePosting.'))) : {};
        return { repositories: snapshotForPrincipal(principal), storage };
    }
    command(input: { repository: string; method: string; args: unknown[] }): { result: unknown; view: BusinessView } {
        if (this.blocked || !this.initialized) throw new Error('Business writes blocked; restart and inspect local audit.');
        if (!input || typeof input.repository !== 'string' || typeof input.method !== 'string' || !Array.isArray(input.args) || input.args.length > 20) throw new Error('Invalid business command.');
        let command: ReturnType<typeof resolveCommand>;
        try { command = resolveCommand(input.repository, input.method); }
        catch (error) { this.security.audit('command.denied', `${input.repository}.${input.method}`.slice(0, 200), 'DENIED'); throw error; }
        const actor = this.security.require(command.permission);
        const args = structuredClone(input.args);
        this.automationEngine?.assertBankInstructionCommand(input.repository,input.method,args);
        if (['sales', 'fulfilments', 'goodsReceipts', 'supplierBills', 'supplierPayments', 'supplierCredits', 'bankTransactions', 'bankReconciliations'].includes(input.repository) && args[0] && typeof args[0] === 'object') {
            // These are actual ledger/settlement dates, not quotation/order dates or due dates.
            const dates = ['paymentDate', 'creditDate', 'allocationDate', 'voidDate', 'reversalDate', 'receiptDate', 'billDate', 'fulfilmentDate', 'transactionDate', 'transferDate', 'statementDate'];
            const request = args[0] as Record<string, unknown>;
            try { for (const key of dates) if (request[key] !== undefined) { if (typeof request[key] !== 'string') throw new Error('Invalid posting date.'); this.assertPeriod(request[key] as string); } }
            catch (error) { this.security.audit('period.denied', `${input.repository}.${input.method}`, 'DENIED', command.permission); throw error; }
        }
        // System GL sources can only be posted/reversed by their owning business services.
        if (input.repository === 'journals') {
            const first = args[0] as Record<string, unknown>;
            if (input.method === 'post' && (first?.sourceType !== 'MANUAL_JOURNAL' || first.sourceId)) throw new Error('System journals must be posted through their business source.');
            if (input.method === 'reverse') {
                const state = snapshotRepositories().journals as { journalEntries: { id: string; sourceType: string }[] };
                const original = state.journalEntries.find(entry => entry.id === first?.journalEntryId);
                if (original?.sourceType !== 'MANUAL_JOURNAL') throw new Error('System journals must be reversed through their business source.');
            }
        }
        if(input.repository==='supplierPayments'&&input.method==='reverse'){
            const groups=(snapshotRepositories().paymentBatches as {batches:{status:string;paymentIds:string[]}[]}).batches;
            if(groups.some(r=>r.status==='POSTED'&&r.paymentIds.includes(args[0] as string)))throw new Error('Reverse this supplier payment through its payment batch.');
        }
        if(input.repository==='sales'&&input.method==='reverseInvoicePayment'){
            const groups=(snapshotRepositories().customerSettlements as {receipts:{status:string;paymentIds:string[]}[]}).receipts;
            if(groups.some(r=>r.status==='POSTED'&&r.paymentIds.includes(args[0] as string)))throw new Error('Reverse this payment through its grouped customer receipt.');
        }
        if (input.repository === 'salesRecovery' && args[0] && typeof args[0] === 'object') {
            const request = args[0] as Record<string, unknown>;
            if (input.method === 'recordSalesManualReview') request.operator = actor.userId;
            if (input.method === 'closeVerifiedSalesReview') request.approver = actor.userId;
        }
        if (['voidInvoice','voidCreditNote','void','markVoid','voidCredit'].includes(input.method) && ['sales','supplierBills','supplierCredits'].includes(input.repository)) {
            const s=snapshotRepositories() as Record<string,any>,id=typeof args[0]==='string'?args[0]:(args[0] as any)?.invoiceId??(args[0] as any)?.creditNoteId??(args[0] as any)?.supplierCreditId??(args[0] as any)?.supplierBillId;
            const rows=[...s.sales.invoices,...s.customerCredits.creditNotes,...s.supplierBills.supplierBills,...s.supplierCredits.supplierCredits];
            if(rows.some(d=>d.id===id&&d.openingBalanceImportId))throw new Error('Historical opening documents must be corrected through the opening batch reversal.');
        }
        const commandId = randomUUID(), action = `${input.repository}.${input.method}`;
        const resource = typeof args[0] === 'string' ? args[0].slice(0, 200) : String((args[0] as Record<string, unknown>)?.id ?? (args[0] as Record<string, unknown>)?.invoiceId ?? input.repository).slice(0, 200);
        this.security.audit(action, resource, 'INTENT', command.permission, commandId);
        const before = snapshotRepositories(), storedBefore = structuredClone(this.values);
        let result: unknown;
        try {
            result = command.execute(args);
            if(input.repository==='bankStatements'&&['importRows','importCsv'].includes(input.method)){
                const previous=new Set((before.bankStatements as {lines:{id:string}[]}).lines.map(l=>l.id));
                const added=(snapshotRepositories().bankStatements as {lines:{id:string}[]}).lines.filter(l=>!previous.has(l.id)).map(l=>l.id);
                this.automationEngine?.classifyImportedBankLines(added,commandId);
            }
            if (input.repository === 'sales' && input.method === 'createInvoiceFromOrder') this.assertPeriod((result as { documentDate: string }).documentDate);
            if (result instanceof Promise) throw new Error('Business commands must be synchronous.');
        } catch (error) {
            this.values = storedBefore; restoreRepositories(before);
            this.security.audit(action, resource, 'FAILED', command.permission, commandId);
            throw error;
        }
        try { this.persist(commandId); }
        catch (error) {
            // A rename may have succeeded before the directory sync failed. Preserve the
            // durable intent and stop all further writes until restart inspects commandId.
            this.values = storedBefore; restoreRepositories(before); this.blocked = true;
            throw new Error(`Business commit ${commandId} could not be confirmed: ${error instanceof Error ? error.message : String(error)}. Restart and review before retry.`);
        }
        try { this.security.audit(action, resource, 'SUCCESS', command.permission, commandId); }
        catch { this.blocked = true; throw new Error(`Business command ${commandId} committed, but final audit confirmation failed. Do not repeat it; restart and review.`); }
        return { result, view: this.view() };
    }
}
