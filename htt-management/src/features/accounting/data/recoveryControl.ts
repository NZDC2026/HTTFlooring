import type { FinanceControlsSummary } from '../types/financeControls';
/** Recovery is a current global posting gate, independent of the selected accounting date. */
export function includeRecoveryControl(summary:FinanceControlsSummary,unresolvedCount:number,error?:string):FinanceControlsSummary {
 if(!Number.isSafeInteger(unresolvedCount)||unresolvedCount<0)throw new Error('Invalid unresolved operation count.');
 const controls=[...summary.controls,{id:'financial-recovery',name:'Current financial recovery',description:error?'Operation journal cannot be inspected: '+error:'All current interrupted financial operations must be reconciled, independently of the reporting date.',leftLabel:'Unresolved operations',leftValue:unresolvedCount,rightLabel:'Required unresolved',rightValue:0,difference:unresolvedCount,status:error||unresolvedCount?'FAIL' as const:'PASS' as const,route:'/accounting/financial-recovery'}];
 const totalControlCount=controls.length+summary.bankControls.length,passedControlCount=controls.filter(c=>c.status==='PASS').length+summary.bankControls.filter(c=>c.status==='PASS').length;
 return {...summary,controls,totalControlCount,passedControlCount,failedControlCount:totalControlCount-passedControlCount,allPassed:totalControlCount===passedControlCount};
}
