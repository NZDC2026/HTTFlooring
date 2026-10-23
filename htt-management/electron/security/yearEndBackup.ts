import type {z} from 'zod';import type {backupSchema} from '../../src/features/year-end/model';
type Backup=z.infer<typeof backupSchema>;let provider:((action:'CLOSE'|'REOPEN')=>Backup)|undefined;
export function configureYearEndBackup(value:(action:'CLOSE'|'REOPEN')=>Backup){provider=value;}
export function yearEndBackup(action:'CLOSE'|'REOPEN'){if(!provider)throw Error('Verified pre-year-end backup is unavailable.');return provider(action);}
