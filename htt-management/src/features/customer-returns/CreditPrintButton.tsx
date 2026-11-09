import {createPortal} from 'react-dom';
import {useRef,useState} from 'react';
import {outputRepository,type PreparedOutput} from '../document-output/outputRepository';
import {renderOutputHtml} from '../document-output/outputHtml';
import {salesOutputSample} from '../document-output/salesOutputSamples';
import {usePermission} from '../security/usePermission';
export function sampleCreditOutput(total=220):PreparedOutput{
 const a=salesOutputSample('CREDIT_NOTE'),quantity=total===110?1:2,net=Math.round(total/1.1*100)/100,tax=Math.round((total-net)*100)/100;
 const line={...a.lines[0],quantity,unitPrice:net/quantity,standardUnitPrice:net/quantity/.8,discountPercent:20,coveredArea:quantity*2.166,lineSubtotal:net,taxAmount:tax,lineTotal:total};
 return {...a,documentNumber:'CN-SAMPLE-0004725',status:'ISSUED',reference:'INV-SAMPLE-0004725',lines:[line],totals:{subtotal:net,taxAmount:tax,total},notes:'Sample · Returned goods credited at the original invoice price. Inherited 20% discount is already included; no further discount is applied.'};
}
export function CreditPrintButton({credit,sample=false,sampleTotal=220,samplePending=false}:{credit?:{id:string;updatedAt:string};sample?:boolean;sampleTotal?:number;samplePending?:boolean}){
 const allowed=usePermission('documents.prepare'),[html,setHtml]=useState(''),[error,setError]=useState(''),[ready,setReady]=useState(false),frame=useRef<HTMLIFrameElement>(null);
 return <><button type="button" className="rounded-lg border bg-white px-4 py-2 text-sm" disabled={!sample&&!allowed} onClick={()=>{try{setError('');setReady(false);const a=sample?sampleCreditOutput(sampleTotal):outputRepository.prepare({operationId:crypto.randomUUID(),kind:'CREDIT_NOTE',sourceId:credit!.id,expectedUpdatedAt:credit!.updatedAt});if(sample&&samplePending)a.status='DRAFT';setHtml(renderOutputHtml(a));}catch(e){setError((e as Error).message);}}}>Print / PDF{sample?' · Sample':''}</button>{error&&<p role="alert">{error}</p>}{html&&createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><section role="dialog" aria-modal="true" aria-label="Credit Note print preview" className="w-full max-w-6xl rounded-xl bg-white p-5"><header className="mb-3 flex items-center justify-between"><h2>Credit Note{sample?' · Sample':''} · Discount inherited from invoice</h2><button type="button" onClick={()=>setHtml('')}>Close</button></header><iframe ref={frame} title="Credit Note · Full document with Discount %" className="h-[70vh] w-full border" sandbox="allow-same-origin allow-modals" srcDoc={html} onLoad={()=>setReady(true)}/><button type="button" disabled={!ready} className="mt-3 rounded border px-4 py-2" onClick={()=>frame.current?.contentWindow?.print()}>Print / Save as PDF</button></section></div>,document.body)}</>;
}
