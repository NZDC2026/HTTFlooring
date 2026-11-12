import {useState} from 'react';
import {Link} from 'react-router-dom';
import {SalesActionMenu} from './SalesActionMenu';
import {usePermission} from '../../security/usePermission';
export function CreditRowActions({id,number,invoiceId,status,sample=false}:{id:string;number:string;invoiceId?:string;status:string;sample?:boolean}){
 const edit=usePermission('sales.payment'),prepare=usePermission('documents.prepare'),[mode,setMode]=useState('');
 const detail='/sales/credit-notes/'+encodeURIComponent(id);
 const action=(label:string,to:string)=>sample?<button onClick={()=>setMode(label)}>{label}</button>:<Link to={to}>{label}</Link>;
 return <><SalesActionMenu label={'Actions for '+number}>{action('View',detail)}{(sample||edit&&status==='DRAFT')&&action('Edit',detail)}{(sample||prepare)&&action('Download PDF','/documents/delivery?kind=CREDIT_NOTE&sourceId='+encodeURIComponent(id))}{invoiceId&&action('View Linked Invoice','/sales/invoices/'+encodeURIComponent(invoiceId))}{action('View Refund / Credit Records',detail)}</SalesActionMenu>{sample&&mode&&<div className="sales-action-overlay"><section className="sales-action-dialog" role="dialog" aria-modal="true" aria-label={'Sample credit '+mode}><header><h2>{mode} · {number}</h2><button onClick={()=>setMode('')}>Close</button></header><p>Sample · Read-only · Credit $220.00 · Pending return → Received → Applied to invoice. No credit, refund, stock or notification records are changed.</p></section></div>}</>;
}
