export type PurgeBackupReceipt = { id: string; fileName: string; sha256: string; createdAt: string };
let writer: (() => PurgeBackupReceipt) | undefined;
export function configureDocumentPurgeBackup(value: () => PurgeBackupReceipt) { writer = value; }
export function createDocumentPurgeBackup() {
    if (!writer) throw new Error('A verified desktop backup is required before permanent purge.');
    return writer();
}
