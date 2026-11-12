import {useState,useRef} from 'react';
import {CreditPrintButton} from '../../customer-returns/CreditPrintButton';
import {Link} from 'react-router-dom';
import {SalesActionMenu} from './SalesActionMenu';
import {usePermission} from '../../security/usePermission';
export function CreditRowActions({id,number,invoiceId,status,sample=false,updatedAt,onView,onEdit,viewPath}:{viewPath?:string;updatedAt?:string;onView?:()=>void;onEdit?:()=>void;id:string;number:string;invoiceId?:string;status:string;sample?:boolean}){
 const edit=usePermission('sales.payment'),prepare=usePermission('documents.prepare'),[mode,setMode]=useState('');
 const printer=useRef<HTMLSpanElement>(null);
 const detail='/sales/credit-notes/'+encodeURIComponent(id);
 const action=(label:string,to:string)=>sample?<button onClick={()=>setMode(label)}>{label}</button>:<Link to={to}>{label}</Link>;
 return <><SalesActionMenu label={'Actions for '+number}>{onView?<button onClick={onView}>View</button>:action('View',viewPath??detail)}{(sample||edit&&status==='DRAFT')&&onEdit&&<button onClick={onEdit}>Edit</button>}{(sample||prepare&&!!updatedAt)&&<button onClick={()=>printer.current?.querySelector('button')?.click()}>Download PDF</button>}{invoiceId&&action('View Linked Invoice','/sales/invoices/'+encodeURIComponent(invoiceId))}{action('查看退款或抵扣记录',detail)}</SalesActionMenu><span ref={printer} hidden><CreditPrintButton credit={updatedAt?{id,updatedAt}:undefined} sample={sample}/></span>{sample&&mode&&<div className="sales-action-overlay"><section className="sales-action-dialog" role="dialog" aria-modal="true" aria-label={'Sample credit '+mode}><header><h2>{mode} · {number}</h2><button onClick={()=>setMode('')}>Close</button></header><p>Sample · Read-only · Credit $220.00 · Pending return → Received → Applied to invoice. No credit, refund, stock or notification records are changed.</p></section></div>}</>;
}
