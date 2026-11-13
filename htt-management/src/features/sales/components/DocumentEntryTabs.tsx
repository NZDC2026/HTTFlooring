import {Link} from 'react-router-dom';
import {FileText,ShoppingCart,Package} from 'lucide-react';
export type EntryDocumentKind='QUOTE'|'ORDER'|'INVOICE'|'PURCHASE';
export const documentEntryTabs=[{kind:'QUOTE',label:'Quote',path:'/sales/quotes/new',Icon:FileText},{kind:'ORDER',label:'Sales Order',path:'/sales/drafts/orders/new',Icon:ShoppingCart},{kind:'INVOICE',label:'Invoice',path:'/sales/drafts/invoices/new',Icon:FileText},{kind:'PURCHASE',label:'Purchase',path:'/purchases/new',Icon:Package}] as const;
export function documentEntryPath(kind:EntryDocumentKind,{sample=false,customerId}:{sample?:boolean;customerId?:string}={}){const tab=documentEntryTabs.find(t=>t.kind===kind)!;const query=new URLSearchParams();if(sample)query.set('sample','1');if(customerId&&kind!=='PURCHASE')query.set('customerId',customerId);return tab.path+(query.size?'?'+query:'');}
export function DocumentEntryTabs({current,dirty=false,sample=false,customerId}:{current:EntryDocumentKind;dirty?:boolean;sample?:boolean;customerId?:string}){
 return <nav className="entry-type-tabs unified-document-tabs" aria-label="Document type">{documentEntryTabs.map(({kind,label,Icon})=>{return <Link role="tab" aria-selected={kind===current} aria-current={kind===current?'page':undefined} className={kind===current?'active':''} key={kind} to={documentEntryPath(kind,{sample,customerId})} onClick={e=>{if(kind===current){e.preventDefault();return;}if(dirty&&!sample&&!window.confirm('Switch document type? Unsaved entries will be cleared.'))e.preventDefault();}}><Icon size={20}/>{label}</Link>;})}</nav>;
}
