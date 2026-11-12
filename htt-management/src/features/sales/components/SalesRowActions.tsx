import {salesFulfilmentRepository} from '../data/salesFulfilmentRepository';
import {SalesDispatchSchedule} from './SalesDispatchSchedule';
import type {SecurityAuditRow} from '../../security/securityContract';
import {useRef,useState} from 'react';
import {salesOutputSample} from '../../document-output/salesOutputSamples';
import {SalesActionMenu} from './SalesActionMenu';
import {Link} from 'react-router-dom';
import type {SalesDocument} from '../types/salesDocument';
import {usePermission} from '../../security/usePermission';
import {salesRepository} from '../data/salesRepository';
import {customerRepository} from '../../contacts/data/customerRepository';
import {QuoteEditForm} from './QuoteEditForm';
import {outputRepository,type PreparedOutput} from '../../document-output/outputRepository';
import {renderOutputHtml} from '../../document-output/outputHtml';
import {nativeRequest} from '../../security/repositoryHost';
import {warnCreditHold} from '../../credit-hold/warnCreditHold';

export function SalesRowActions({document:d,sample,onView}:{document:SalesDocument;sample:boolean;onView?:(document:SalesDocument)=>void}){
 const remove=usePermission('users.manage');
 const audit=usePermission('audit.read'),[events,setEvents]=useState<SecurityAuditRow[]>([]);
 const prepare=usePermission('documents.prepare'),manage=usePermission('sales.manage'),write=usePermission('sales.write');
 const [mode,setMode]=useState(''),[message,setMessage]=useState(''),[reason,setReason]=useState(''),[artifact,setArtifact]=useState<PreparedOutput>(),[html,setHtml]=useState('');
 const frame=useRef<HTMLIFrameElement>(null),[frameReady,setFrameReady]=useState(false);
 const customer=customerRepository.getById(d.customerId);
 function open(action:string){setFrameReady(false);setMessage('');setReason('');setMode(action);if(action==='history'&&!sample&&audit){try{setEvents(nativeRequest<{rows:SecurityAuditRow[]}>('audit.list',{offset:0,limit:100,query:d.id}).rows);}catch(e){setMessage((e as Error).message);}}if(action==='print'||action==='send'){try{if(sample){const a=salesOutputSample(d.type);a.documentNumber=d.documentNumber;a.status=d.status;a.documentDate=d.documentDate;setArtifact(a);setHtml(renderOutputHtml(a));return;}warnCreditHold(d.customerId,action==='print'?'Print sales document':'Send sales document');const a=outputRepository.prepare({operationId:crypto.randomUUID(),kind:d.type,sourceId:d.id,expectedUpdatedAt:d.updatedAt});setArtifact(a);setHtml(renderOutputHtml(a));}catch(e){setMessage((e as Error).message);setArtifact(undefined);setHtml('');}}}
 const editable=d.type==='QUOTE'&&d.status==='DRAFT';

 function cancel(){try{if(sample){setMessage('Sample · Document cancelled. Preview only; no business record changed.');return;}if(d.type==='QUOTE')salesRepository.declineQuote(d.id);else if(d.type==='SALES_ORDER')salesRepository.cancelManagedOrder(d.id,reason);else salesRepository.voidInvoice(d.id,reason);setMessage('Document cancelled.');}catch(e){setMessage((e as Error).message);}}

 const actionable=!['VOID','CANCELLED','DECLINED','EXPIRED','CONVERTED'].includes(d.status);
 return <><SalesActionMenu label={`Actions for ${d.documentNumber}`}><button onClick={()=>onView?onView(d):open('history')}>View</button>
 {(d.type==='QUOTE'||d.type==='SALES_ORDER')&&(sample||write)&&<button disabled={!sample&&!(editable||d.type==='SALES_ORDER'&&d.status==='DRAFT'&&!!d.managedDraftId)} title={!sample&&!editable?'Only an eligible unposted draft can be edited.':undefined} onClick={()=>open('edit')}>Edit</button>}
 {d.type==='INVOICE'&&sample&&<button onClick={()=>open('edit')}>Edit</button>}
 {d.type==='INVOICE'&&!sample&&write&&d.status==='DRAFT'&&d.managedDraftId&&<Link to={'/sales/drafts/invoices/'+encodeURIComponent(d.managedDraftId)}>Edit</Link>}
 {(sample||prepare)&&<button disabled={!sample&&!actionable} title={!actionable?'This document is closed or already converted.':undefined} onClick={()=>open('send')}>{d.type==='QUOTE'?'Send Quote':d.type==='SALES_ORDER'?'Send Order':'Send Invoice'}</button>}
 {d.type==='QUOTE'&&(sample||manage)&&<button disabled={!sample&&d.status!=='ACCEPTED'} title={d.status!=='ACCEPTED'?'Only an accepted, unconverted quote can be converted.':undefined} onClick={()=>open('convert')}>Convert to Order</button>}
 {d.type==='SALES_ORDER'&&(sample||manage)&&<button disabled={!sample&&(!['CONFIRMED','PARTIALLY_FULFILLED','FULFILLED'].includes(d.status)||(d.invoiceIds??[]).length>0)} title={(d.invoiceIds??[]).length?'This order already has linked invoices.':undefined} onClick={()=>open('convert')}>Convert Invoice</button>}
 {d.type==='SALES_ORDER'&&((sample||manage)&&actionable)&&<button onClick={()=>open('schedule')}>Schedule Pickup / Delivery</button>}
 {d.type==='SALES_ORDER'&&<button onClick={()=>open('history')}>View Dispatch History</button>}
 {d.type==='INVOICE'&&(sample||prepare)&&<button onClick={()=>open('print')}>Download PDF</button>}
 {d.type==='INVOICE'&&(sample||prepare&&d.status!=='VOID'&&d.amountDue>0)&&<Link to={'/sales/invoice-reminders?query='+encodeURIComponent(d.documentNumber)+(sample?'&sample=1':'')}>Send Reminder</Link>}
 {(d.type==='QUOTE'||d.type==='SALES_ORDER')&&(sample||remove)&&(sample?<button onClick={()=>open('delete')}>Delete</button>:d.status==='DRAFT'&&(d.type==='QUOTE'||!!d.managedDraftId)?<Link to={'/settings/trash?state=active&recordId='+encodeURIComponent(d.id)}>Delete</Link>:<button disabled title="Only an unposted draft without linked workflows can be deleted. Posted documents use cancellation or reversal.">Delete</button>)}
 </SalesActionMenu>
 {mode==='edit'&&editable&&!sample?<QuoteEditForm quote={d} customerName={customer?.businessName??''} onCancel={()=>setMode('')} onSaved={()=>setMode('')}/>:mode&&<div className="sales-action-overlay"><section className="sales-action-dialog" role="dialog" aria-modal="true" aria-label={`${mode} ${d.documentNumber}`}><header><h2>{({print:'Print / PDF',send:'Send to customer',edit:'Edit document',history:'Activity History',cancel:'Cancel document',convert:'Convert document',schedule:'Schedule Pickup / Delivery',markSent:'Send quote',delete:'Delete draft'} as Record<string,string>)[mode]} · {d.documentNumber}</h2><button onClick={()=>setMode('')}>Close</button></header>{sample&&<p className="sales-sample-toggle">Sample · Read-only preview. No email or business changes.</p>}
 {mode==='schedule'&&(sample?<p>Sample · Pickup / delivery pending → Booked. No schedule or notification is saved.</p>:<SalesDispatchSchedule document={d}/>)}
 {mode==='delete'&&sample&&<p>Sample · Draft deletion preview. Live deletion is available only for eligible drafts through the recoverable Trash workflow.</p>}
 {(mode==='convert'||mode==='markSent')&&<><p>{mode==='markSent'?'Mark this draft quote as sent?':d.type==='QUOTE'?'Create a sales order from this accepted quote?':'Create an invoice from this sales order?'}</p><button disabled={!!message} onClick={()=>{try{if(sample){setMessage('Sample · Completed preview. No business records changed.');return;}if(mode==='markSent')salesRepository.sendQuote(d.id);else if(d.type==='QUOTE')salesRepository.convertQuoteToOrder(d.id);else if(d.type==='SALES_ORDER')salesRepository.createInvoiceFromOrder(d.id);setMessage('Completed.');}catch(e){setMessage((e as Error).message);}}}>Confirm</button></>}
 {message&&<p role="status">{message}</p>}
 {(mode==='print'||mode==='send')&&html&&artifact&&<><iframe ref={frame} title={`Print ${d.documentNumber}`} sandbox="allow-same-origin allow-modals" srcDoc={html} onLoad={()=>setFrameReady(true)}/>{mode==='print'?<button disabled={!frameReady} onClick={()=>frame.current?.contentWindow?.print()}>Print / Save as PDF</button>:<><p>To: {artifact.recipient?.accountingEmail||customer?.email||'No email saved — update customer contact first.'}</p><p>Subject: {artifact.subject}</p><pre>{artifact.body}</pre>{sample?<><p>Sample · Full document preview only. No email will be sent.</p><button onClick={()=>setMessage('Sample · Email sent preview. No email sent.')}>Preview sent result</button></>:<><p>The prepared document is attached. Confirm to queue delivery through the configured email service.</p><button disabled={!artifact.recipient?.accountingEmail} onClick={()=>{try{nativeRequest('integrations.mail',{operationId:artifact.operationId,artifactId:artifact.id,family:'sales',confirmed:true});setMessage('Email queued. Check Communications for delivery status.');}catch(e){setMessage((e as Error).message);}}}>Confirm send</button><Link to="/documents/communications">View delivery status / configuration</Link></>}</>}</>}
 {mode==='edit'&&!sample&&d.type==='SALES_ORDER'&&d.managedDraftId&&<Link to={'/sales/drafts/orders/'+encodeURIComponent(d.managedDraftId)}>Open draft editor</Link>}{mode==='edit'&&<p>{sample?'Sample · Draft documents can be edited; issued and posted documents retain their protected values.':'This issued document cannot be edited directly. Use the document details to manage fulfilment or correct it through the existing credit / void workflow.'}</p>}
 {mode==='history'&&<div>{d.type==='SALES_ORDER'&&<section><h3>Dispatch History</h3>{sample?<p>Sample · Partial dispatch completed → Remaining quantity pending pickup.</p>:salesFulfilmentRepository.getSnapshot().filter(f=>f.salesOrderId===d.id).map(f=><p key={f.id}>{f.fulfilmentNumber} · {f.fulfilmentDate} · {f.status}</p>)}</section>}{events.map(e=><p key={e.id}>{e.timestamp} · {e.actorId} · {e.action} · {e.outcome}</p>)}<p>Created · {d.createdAt}</p><p>Last updated · {d.updatedAt}</p>{d.type==='INVOICE'&&d.voidedAt&&<p>Voided · {d.voidedAt} · {d.voidReason}</p>}<p>{d.notes||'No document notes.'}</p><p>These are saved document milestones; email delivery history is available in Communications.</p>{sample&&<p>Sample Alex · Created → Sample Jamie · Prepared → Sample Alex · Reviewed</p>}<Link to="/documents/communications">Email activity</Link></div>}
 {mode==='cancel'&&<><p>{d.type==='QUOTE'?'The quote will be marked Declined.':'Cancellation checks existing invoices, payments, credits and fulfilments before making changes.'}</p><label>Reason<textarea value={reason} onChange={e=>setReason(e.target.value)}/></label><button disabled={reason.trim().length<3||message==='Document cancelled.'} onClick={cancel}>Confirm cancellation</button></>}
 </section></div>}</>;
}
