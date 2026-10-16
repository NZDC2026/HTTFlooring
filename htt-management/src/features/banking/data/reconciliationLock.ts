import { snapshotRepositories } from '../../security/repositoryHost';
export function assertSourceNotReconciled(sourceType: string, sourceId: string) { const snapshots = snapshotRepositories(); const journals = (snapshots.journals as {
    journalEntries: {
        id: string;
        sourceType: string;
        sourceId?: string;
    }[];
})?.journalEntries ?? [], records = (snapshots.bankReconciliations as {
    reconciliations: {
        clearedTransactionIds: string[];
    }[];
})?.reconciliations ?? []; const ids = journals.filter(j => j.sourceType === sourceType && j.sourceId === sourceId).map(j => j.id); if (records.some(r => r.clearedTransactionIds.some(key => ids.some(id => key.startsWith(id + ':')))))
    throw new Error('A reconciled bank entry cannot be reversed here.'); }
export function assertBankPostingDate(date:string,accountIds:string[]){const snapshots=snapshotRepositories(),banks=(snapshots.bankAccounts as {bankAccounts:{id:string;glAccountId:string}[]}|undefined)?.bankAccounts??[],records=(snapshots.bankReconciliations as {reconciliations:{bankAccountId:string;statementDate:string}[]}|undefined)?.reconciliations??[];for(const bank of banks.filter(b=>accountIds.includes(b.glAccountId))){const latest=records.filter(r=>r.bankAccountId===bank.id).map(r=>r.statementDate).sort().at(-1);if(latest&&date<=latest)throw new Error(`Bank account is reconciled through ${latest}. Use a posting date after that statement.`);}}
