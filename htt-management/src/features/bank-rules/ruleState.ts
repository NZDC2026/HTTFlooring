import { useSyncExternalStore } from 'react';
export type RuleDecision={lineId:string;description:string;date:string;amount:number;status:'Ready'|'Conflict'|'Blocked'|'No match';ruleId?:string;ruleName?:string;accountId?:string;taxCode?:string;reason:string;lineToken:string;ruleToken?:string};
export type RuleReceipt={id:string;operationId:string;fingerprint:string;action:'Applied'|'Withdrawn';actorId:string;at:string;reason:string;previewDigest:string;automatic:boolean;decision:RuleDecision};
let receipts:RuleReceipt[]=[],version=0;const listeners=new Set<()=>void>();
export const ruleReceipts=()=>receipts;
export const restoreRuleReceipts=(rows:RuleReceipt[])=>{receipts=rows;};
export const publishRuleReceipts=()=>{version++;listeners.forEach(f=>f());};
export function useRuleReceipts(){useSyncExternalStore(f=>{listeners.add(f);return()=>{listeners.delete(f);};},()=>version,()=>version);return receipts;}
