import {bankDuplicateCorrections} from '../../src/features/accounting/data/bankDuplicateCorrection';
import type {JournalEntry} from '../../src/features/accounting/types/journalEntry';
import type {FinancialOperation} from '../../src/lib/persistence/financialOperationJournal';
import {validateFinancialOperationStorage} from '../../src/lib/persistence/financialOperationValidation';
import { validatePeriods } from '../../src/features/accounting/data/accountingPeriodValidation';
import { createHash } from 'node:crypto';
export type LegacyDatabase = { schemaVersion: 1; storage: Record<string, string>; repositories: Record<string, unknown>; lastCommandId?: string };
export type Database = Omit<LegacyDatabase, 'schemaVersion'> & { schemaVersion: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28; savedAt: string; checksum: string };
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
export function sealDatabase(data: Omit<Database, 'checksum' | 'schemaVersion' | 'savedAt'>): Database {
    const body = { schemaVersion: 28 as const, savedAt: new Date().toISOString(), storage: data.storage, repositories: data.repositories, ...(data.lastCommandId === undefined ? {} : { lastCommandId: data.lastCommandId }) };
    return { ...body, checksum: createHash('sha256').update(JSON.stringify(body)).digest('hex') };
}
export function parseDatabase(text: string): Database | LegacyDatabase {
    if (Buffer.byteLength(text) > 250_000_000) throw new Error('Business snapshot exceeds 250 MB.');
    const value = JSON.parse(text);
    if (!record(value) || ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].includes(value.schemaVersion as number)) throw new Error('Unsupported business snapshot version.');
    if (!record(value.storage) || !Object.entries(value.storage).every(([key, v]) => key.startsWith('htt') && typeof v === 'string') || !record(value.repositories) || (value.lastCommandId !== undefined && typeof value.lastCommandId !== 'string')) throw new Error('Invalid business snapshot structure.');
    if (value.schemaVersion === 2 || value.schemaVersion === 3 || value.schemaVersion === 4 || value.schemaVersion === 5 || value.schemaVersion === 6 || value.schemaVersion === 7 || value.schemaVersion === 8 || value.schemaVersion === 9 || value.schemaVersion === 10 || value.schemaVersion === 11 || value.schemaVersion === 12 || value.schemaVersion === 13 || value.schemaVersion === 14 || value.schemaVersion === 15 || value.schemaVersion === 16 || value.schemaVersion === 17 || value.schemaVersion === 18 || value.schemaVersion === 19 || value.schemaVersion === 20 || value.schemaVersion === 21 || value.schemaVersion === 22 || value.schemaVersion === 23 || value.schemaVersion === 24 || value.schemaVersion === 25 || value.schemaVersion === 26 || value.schemaVersion === 27 || value.schemaVersion === 28) {
        const { checksum, ...body } = value;
        if (typeof value.savedAt !== 'string' || !Number.isFinite(Date.parse(value.savedAt)) || checksum !== createHash('sha256').update(JSON.stringify(body)).digest('hex')) throw new Error('Business snapshot checksum failed.');
    }
    validateFinancialOperationStorage(value.storage as Record<string,string>);
    if(Number(value.schemaVersion)<24){
        const raw=(value.storage as Record<string,string>)['htt:financial-operations:v1'];
        if(raw&&JSON.parse(raw).data.some((o:FinancialOperation)=>o.kind==='SOURCE_METADATA_REPAIR'||o.repairProposalHistory?.length))throw new Error('Source repair evidence requires snapshot schema 24.');
    }
    if(Number(value.schemaVersion)<26 && ['recurringBank','recurringAutomation'].some(name=>{
        const state=(value.repositories as Record<string,unknown>)[name];
        return record(state)&&Object.values(state).some(rows=>Array.isArray(rows)&&rows.length>0);
    })) throw new Error('Recurring automation evidence requires snapshot schema 26.');
    if(Number(value.schemaVersion)<27 && (
        ((value.repositories.bankRuleApplications as {receipts?:unknown[]}|undefined)?.receipts?.length??0)>0 ||
        ((value.repositories.workspace_bank_rules as {records?:Record<string,string>[]}|undefined)?.records??[]).some(r=>r.conditions||r.automatic==='Yes')
    )) throw new Error('Compound bank-rule evidence requires snapshot schema 27.');
    if(Number(value.schemaVersion)<28&&Object.values((value.repositories.bankInstructions??{}) as Record<string,unknown[]>).some(rows=>rows.length))throw new Error('Bank instruction evidence requires snapshot schema 28.');
    const purgeHistory=(value.repositories.documentRecycle as {history?:{action:string;recordId:string}[]}|undefined)?.history;
    if(Array.isArray(purgeHistory)&&purgeHistory.some(e=>e.action==='Purged')) {
        if(Number(value.schemaVersion)<25) throw new Error('Permanent purge evidence requires snapshot schema 25.');
        const raw=(value.storage as Record<string,string>)['htt:financial-operations:v1'];
        const contains=(v:unknown,id:string):boolean=>typeof v==='string'?(v===id||v.startsWith(id+':')||((v.startsWith('{')||v.startsWith('['))&&(()=>{try{return contains(JSON.parse(v),id);}catch{return false;}})())):Array.isArray(v)?v.some(x=>contains(x,id)):!!v&&typeof v==='object'&&Object.values(v).some(x=>contains(x,id));
        if(raw&&purgeHistory.some(e=>e.action==='Purged'&&contains(JSON.parse(raw),e.recordId))) throw new Error('Purged document is referenced by saved financial operation evidence.');
    }
    const journals=(value.repositories.journals as {journalEntries?:JournalEntry[]}|undefined)?.journalEntries;
    if(Array.isArray(journals)&&journals.some(j=>j.bankDuplicateCorrection!==undefined)){
        const cache=(value.repositories.financialCache as {journals?:JournalEntry[]}|undefined)?.journals;
        if(JSON.stringify(cache)!==JSON.stringify(journals))throw new Error('Bank duplicate correction cache differs from source journals.');
        const proof=bankDuplicateCorrections(journals);
        if(proof.invalid.length)throw new Error('Invalid saved bank duplicate correction pair.');
        const raw=(value.storage as Record<string,string>)['htt:financial-operations:v1'],operations:FinancialOperation[]=raw?JSON.parse(raw).data:[];
        for(const j of journals.filter(j=>j.bankDuplicateCorrection)){
            const m=j.bankDuplicateCorrection!,op=operations.find(o=>o.operationId===m.operationId),proposal=op?.repairProposal,plan=proposal&&JSON.parse(proposal.planJson);
            if(op?.resolution!=='BANK_DUPLICATE_REVERSED'||proposal?.status!=='EXECUTED'||proposal.action!=='REVERSE_BANK_DUPLICATE'||proposal.resultJournalId!==j.reversalJournalEntryId||plan.duplicateJournalId!==j.id||plan.existingJournalId!==m.canonicalJournalId||op.resultId!==j.sourceId)throw new Error('Bank duplicate correction approval evidence is invalid.');
        }
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
    if (database.schemaVersion === 3 || database.schemaVersion === 4 || database.schemaVersion === 5 || database.schemaVersion === 6 || database.schemaVersion === 7 || database.schemaVersion === 8 || database.schemaVersion === 9 || database.schemaVersion === 10 || database.schemaVersion === 11 || database.schemaVersion === 12 || database.schemaVersion === 13 || database.schemaVersion === 14 || database.schemaVersion === 15 || database.schemaVersion === 16 || database.schemaVersion === 17 || database.schemaVersion === 18 || database.schemaVersion === 19 || database.schemaVersion === 20 || database.schemaVersion === 21 || database.schemaVersion === 22 || database.schemaVersion === 23 || database.schemaVersion === 24 || database.schemaVersion === 25 || database.schemaVersion === 26 || database.schemaVersion === 27 || database.schemaVersion === 28) return false;
    if (!Object.hasOwn(database.repositories, 'accountingPeriods')) database.repositories.accountingPeriods = { periods: [] };
    return true;
}

const workspaceNames = ['products', 'workspace_tax_codes', 'workspace_linked_accounts', 'workspace_promotions', 'workspace_jobs', 'workspace_tasks', 'workspace_bank_rules', 'workspace_templates', 'workspace_custom_reports', 'workspace_report_packs', 'workspace_settings', 'customerSettlements', 'supplierRefunds', 'bankStatements', 'paymentBatches', 'openingBalances', 'managedSalesDocuments', 'expenseBillDrafts', 'salesDispatch', 'preparedSalesOutputs', 'physicalSupplierReturns', 'recurringInvoices', 'recurringExpenses', 'salesVisits', 'contactReviews', 'jobCosting', 'attachments', 'dataTransfers', 'documentRecycle', 'payroll', 'physicalCustomerReturns', 'customerDeposits', 'supplierPrepayments', 'preparedPurchaseOutputs', 'recurringBank', 'recurringAutomation', 'bankRuleApplications', 'bankInstructions'];
export function migrateWorkspaceSnapshot(database: Database | LegacyDatabase, shape: Record<string, unknown>) {
    if (database.schemaVersion === 28) return false;
    for (const name of workspaceNames) if (!Object.hasOwn(database.repositories, name)) {
        if (!Object.hasOwn(shape, name)) throw new Error('Workspace contracts are not initialized.');
        database.repositories[name] = structuredClone(shape[name]);
    }
    return true;
}
