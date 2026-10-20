import {nativeRequest,hydrateBusiness} from '../security/repositoryHost';
import type {BusinessView} from '../security/securityContract';
import type {FinancialOperation,FinancialRepairAction} from '../../lib/persistence/financialOperationJournal';
export type RepairPlan={operationId:string;resultId?:string;action?:FinancialRepairAction;evidenceDigest:string;eligible:boolean;blockers:string[];changes:string[];journalDate?:string;amount?:number;debitAccountId?:string;creditAccountId?:string;duplicateJournalId?:string;previousJournalId?:string;existingJournalId?:string;businessNumber?:string};
function command<T>(method:string,input:unknown){const r=nativeRequest<{result:T;view:BusinessView}>('business.command',{repository:'salesRecovery',method,args:[input]});hydrateBusiness(r.view);return r.result;}
export const previewTargetedRepair=(operationId:string)=>command<RepairPlan>('previewTargetedRepair',{operationId});
export const proposeTargetedRepair=(input:{operationId:string;expectedDigest:string;reference:string;summary:string;businessChecked:boolean;glChecked:boolean;externalEvidenceChecked:boolean})=>command<FinancialOperation>('proposeTargetedRepair',input);
export const executeTargetedRepair=(input:{operationId:string;proposalId:string;expectedDigest:string;approvalReference:string;confirm:boolean})=>command<FinancialOperation>('executeTargetedRepair',input);
