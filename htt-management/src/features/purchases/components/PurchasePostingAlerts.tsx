import {useSyncExternalStore} from 'react';
import {Link} from 'react-router-dom';
import {usePermission} from '../../security/usePermission';
import {purchasePostingOperationRepository} from '../data/purchasePostingOperationRepository';
import {purchasePostingSourcePath} from '../data/purchasePostingAuditService';
export function PurchasePostingAlertSample(){return <details className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs"><summary className="cursor-pointer font-semibold text-amber-900">Sample · Purchase posting exception alerts · Read-only</summary><p className="mt-2 text-red-700">Sample · BILL-SAMPLE-0102 · Recovery required · Posting was interrupted. Finance review required.</p><p className="mt-2 text-emerald-800">Sample · GR-SAMPLE-0101 · Posted · Exception resolved; no active alert.</p><p className="mt-2 text-stone-500">Synthetic preview only. No audit records, recovery actions or financial entries are created.</p></details>;}
export function PurchasePostingAlerts(){
 const permitted=usePermission('purchases.read');
 const read=()=>JSON.stringify(purchasePostingOperationRepository.getAll());
 const snapshot=useSyncExternalStore(purchasePostingOperationRepository.subscribe,read,read);
 if(!permitted)return null;
 const rows=(JSON.parse(snapshot) as ReturnType<typeof purchasePostingOperationRepository.getAll>).filter(r=>r.status==='FAILED'||r.status==='RECOVERY_REQUIRED'||r.error?.startsWith('Restored after restart:'));
 return <aside className="my-3 rounded-xl border border-stone-200 bg-white p-4" aria-label="Purchase posting exception alerts">{rows.length>0&&<div role="alert"><h3 className="font-semibold text-red-700">Purchase posting requires attention ({rows.length})</h3><p className="mt-1 text-xs text-stone-600">Background audit records are retained. Review the source document with finance before further posting; no automatic retry.</p>{rows.map(r=><Link key={r.key} className="mt-2 block border-t pt-2 text-xs text-red-700 underline" to={purchasePostingSourcePath(r.kind,r.sourceId)}>{r.kind.replaceAll('_',' ')} · {r.sourceId} · {r.status.replaceAll('_',' ')}{r.error&&<span className="block">{r.error}</span>}</Link>)}</div>}<PurchasePostingAlertSample/></aside>;
}
