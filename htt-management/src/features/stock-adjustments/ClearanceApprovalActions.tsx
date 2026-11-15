import {clearanceAwaitingEvidence} from './clearanceEvidence';
import {useAttachments} from '../attachments/attachmentClient';
import {useState} from 'react';
import {stockAdjustmentRepository,type StockAdjustment} from './stockAdjustmentRepository';
export function ClearanceApprovalActions({row,canRequest,canReview,onSaved}:{row:StockAdjustment;canRequest:boolean;canReview:boolean;onSaved:(row:StockAdjustment)=>void}){
 const attachments=useAttachments();
 const [reason,setReason]=useState(''),[error,setError]=useState('');
 if(!row.clearanceId||row.status==='POSTED')return null;
 const preparing=clearanceAwaitingEvidence(row),hasEvidence=attachments.documents.some(d=>d.target.kind==='Clearance write-off'&&d.target.id===row.id&&!d.deletedAt),pending=row.status==='DRAFT'&&!preparing,returned=row.status==='WITHDRAWN'||row.status==='REJECTED';
 if(!canRequest&&!canReview)return null;
 function process(method:'submitClearance'|'withdrawClearance'|'rejectClearance'|'resubmitClearance'){
  try{const next=stockAdjustmentRepository[method]({id:row.id,expectedRevision:row.revision,reason});setError('');onSaved(next);setReason('');}catch(e){setError((e as Error).message);}
 }
 return <section data-ui="card" className="mb-4 rounded-lg border p-4 text-sm" aria-label="Clearance approval actions"><h3 className="font-semibold">Clearance write-off approval</h3><p className="my-2">At least one active photo or attachment is required to submit. Submission freezes the selected file versions for review. Later uploads do not replace them. Withdrawal and rejection leave stock unchanged. Resubmission refreshes this batch’s remaining stock and returns the same request for review.</p><label className="grid gap-1">Processing reason *<textarea data-ui="field" aria-label="Clearance processing reason" className="rounded-lg border p-2" minLength={3} maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)}/></label><div className="mt-3 flex flex-wrap gap-3">{preparing&&canRequest&&<button data-ui="button" type="button" disabled={!hasEvidence||reason.trim().length<3} onClick={()=>process('submitClearance')}>Submit for review</button>}{(pending||preparing)&&canRequest&&<button data-ui="button" type="button" disabled={reason.trim().length<3} onClick={()=>process('withdrawClearance')}>Withdraw request</button>}{pending&&canReview&&<button data-ui="button" type="button" disabled={reason.trim().length<3} onClick={()=>process('rejectClearance')}>Reject request</button>}{returned&&canRequest&&<button data-ui="button" type="button" disabled={!hasEvidence||reason.trim().length<3} onClick={()=>process('resubmitClearance')}>Resubmit for review</button>}</div>{(preparing||returned)&&!hasEvidence&&<p className="mt-2">Upload at least one photo or attachment to enable submission.</p>}{error&&<p role="alert" className="mt-2 text-red-700">{error}</p>}</section>;
}
