import { registerRepository } from '../security/repositoryHost';
import { ruleReceipts,restoreRuleReceipts,publishRuleReceipts,type RuleDecision } from './ruleState';
export type RulePreview={digest:string;expiresAt:string;rows:RuleDecision[]};
const desktop=():never=>{throw new Error('Use the secure desktop application.');};
export const bankRuleClient={post(_input:{receiptId:string}):unknown{return desktop();},preview(_input:{lineIds:string[]}):RulePreview{return desktop();},apply(_input:{operationId:string;expectedDigest:string;reason:string}):unknown{return desktop();},withdraw(_input:{operationId:string;receiptId:string;reason:string}):unknown{return desktop();},current(_input:{lineId:string}):RuleDecision|null{return desktop();}};
registerRepository('bankRuleApplications',{repository:bankRuleClient,read:'banking.read',commands:{preview:'banking.read',apply:'banking.write',withdraw:'banking.write',current:'banking.read',post:'banking.write'},snapshot:()=>({receipts:ruleReceipts()}),restore:v=>restoreRuleReceipts(v.receipts),publish:publishRuleReceipts});
