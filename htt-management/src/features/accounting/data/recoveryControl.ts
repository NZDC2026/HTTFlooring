import type { FinanceControlsSummary } from '../types/financeControls';
/** Recovery is a current global posting gate, independent of the selected accounting date. */
export function includeRecoveryControl(summary:FinanceControlsSummary,unresolvedCount:number,error?:string):FinanceControlsSummary {
 if(!Number.isSafeInteger(unresolvedCount)||unresolvedCount<0)throw new Error('Invalid unresolved operation count.');
 const controls=[...summary.controls,{id:'financial-recovery',name:'Current financial recovery',description:error?'Operation journal cannot be inspected: '+error:'All current interrupted financial operations must be reconciled, independently of the reporting date.',leftLabel:'Unresolved operations',leftValue:unresolvedCount,rightLabel:'Required unresolved',rightValue:0,difference:unresolvedCount,status:error||unresolvedCount?'FAIL' as const:'PASS' as const,route:'/accounting/financial-recovery'}];
 const totalControlCount=controls.length+summary.bankControls.length,passedControlCount=controls.filter(c=>c.status==='PASS').length+summary.bankControls.filter(c=>c.status==='PASS').length;
 return {...summary,controls,totalControlCount,passedControlCount,failedControlCount:totalControlCount-passedControlCount,allPassed:totalControlCount===passedControlCount};
}
/** Current audit failures remain failures even when the selected dated balances agree. */
export function includePostingIntegrityControl(summary:FinanceControlsSummary,issueCount:number,error?:string):FinanceControlsSummary {
 if(!Number.isSafeInteger(issueCount)||issueCount<0)throw new Error('Invalid posting integrity issue count.');
 const controls=[...summary.controls.filter(c=>c.id!=='posting-integrity'),{id:'posting-integrity',name:'Current posting integrity',description:error!==undefined?'Current posting integrity could not be checked: '+error:'Current business records and GL source links must pass integrity checks, independently of the selected reporting date.',leftLabel:'Posting issues',leftValue:issueCount,rightLabel:'Required issues',rightValue:0,difference:issueCount,status:error!==undefined||issueCount?'FAIL' as const:'PASS' as const}];
 const totalControlCount=controls.length+summary.bankControls.length,passedControlCount=controls.filter(c=>c.status==='PASS').length+summary.bankControls.filter(c=>c.status==='PASS').length;
 return {...summary,controls,totalControlCount,passedControlCount,failedControlCount:totalControlCount-passedControlCount,allPassed:totalControlCount===passedControlCount};
}
