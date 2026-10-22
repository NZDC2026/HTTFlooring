import {nativeRequest,hydrateBusiness} from '../security/repositoryHost';
import type {BusinessView} from '../security/securityContract';
import type {FinancialOperation} from '../../lib/persistence/financialOperationJournal';
export type SourceRepairChange = { kind:'INVOICE'|'BILL'|'CUSTOMER_CREDIT'|'SUPPLIER_CREDIT'|'OPERATION'|'PURCHASE_OPERATION'; id:string; path:string; before:Record<string,unknown>; after:Record<string,unknown>; evidence:string[] };
export type SourceRepairPlan = { evidenceDigest:string; eligible:boolean; blockers:string[]; changes:SourceRepairChange[] };
function request<T>(method:string,input:unknown){const r=nativeRequest<{result:T;view:BusinessView}>('business.command',{repository:'salesRecovery',method,args:[input]});hydrateBusiness(r.view);return r.result;}
export const previewSourceRepair=()=>request<SourceRepairPlan>('previewSourceRepair',{});
export const proposeSourceRepair=(input:{operationId:string;expectedDigest:string;reference:string;summary:string;businessChecked:boolean;glChecked:boolean;externalEvidenceChecked:boolean})=>request<FinancialOperation>('proposeSourceRepair',input);
export const executeSourceRepair=(input:{operationId:string;proposalId:string;expectedDigest:string;approvalReference:string;confirm:boolean})=>request<FinancialOperation>('executeSourceRepair',input);

export const withdrawSourceRepair=(input:{operationId:string;proposalId:string;reason:string})=>request<FinancialOperation>('withdrawSourceRepair',input);
