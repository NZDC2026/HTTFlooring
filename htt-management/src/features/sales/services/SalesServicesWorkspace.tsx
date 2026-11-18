import {useEffect,useState,type ReactNode} from 'react';
import {useSearchParams} from 'react-router-dom';
import {X} from 'lucide-react';
import {PriceListsWorkspace} from './PriceListsWorkspace';
import {ClaimsWorkspace} from './ClaimsWorkspace';
import {StatementsWorkspace} from './StatementsWorkspace';
import {serviceTabs,type ServiceTab} from './salesServicesModel';
import './sales-services.css';
export function useHeadingActions(){const [element,setElement]=useState<HTMLElement|null>(null);useEffect(()=>{setElement(document.getElementById('ss-heading-actions'));},[]);return element;}
export function ServiceDialog({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:ReactNode;wide?:boolean}){
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};const focused=document.activeElement as HTMLElement|null;document.addEventListener('keydown',handler);const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',handler);document.body.style.overflow=before;focused?.focus();};},[onClose]);
 return <div className="ss-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section data-ui="card" role="dialog" aria-modal="true" aria-label={title} className={'ss-dialog '+(wide?'ss-wide':'')} ref={el=>{if(el&&!el.contains(document.activeElement))el.querySelector<HTMLElement>('button,input,select')?.focus();}} onKeyDown={e=>{if(e.key!=='Tab')return;const els=[...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')];if(!els.length)return;if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0].focus();}}}><header><h2>{title}</h2><button data-ui="button" aria-label="Close dialog" onClick={onClose}><X size={18}/></button></header>{children}</section></div>;
}
export function SalesServicesWorkspace({tab,sample}:{tab:ServiceTab;sample:boolean}){
 const [,setParams]=useSearchParams();
 const description=tab==='Price lists'?'Price lists by customer type and level — send them, and tell customers before prices change.':tab==='Claims'?'Quotes, orders, invoices, returns — and claims when something is wrong with the goods.':'Quotes, orders, invoices — and invoices & statements to many customers at once.';
 const changeTab=(next:string)=>setParams(p=>{const n=new URLSearchParams(p);n.set('workspaceTab',next);n.delete('serviceView');return n;});
 return <div id="sales-services" data-module-theme="light"><div className="ss-content"><header className="ss-heading"><h1>Sales</h1><p>{description}</p><div id="ss-heading-actions"/></header><nav className="ss-tabs" aria-label="Sales sections">{['Overview','All sales','Returns & credits','Promotions',...serviceTabs].map(t=><button data-ui="button" aria-label={t} key={t} className={t===tab?'active':''} onClick={()=>changeTab(t)}>{t}{t==='Claims'&&tab==='Claims'&&sample&&<span data-ui="badge">2</span>}</button>)}</nav>{tab==='Price lists'?<PriceListsWorkspace sample={sample}/>:tab==='Claims'?<ClaimsWorkspace sample={sample}/>:<StatementsWorkspace sample={sample}/>}<footer className="ss-sample-label">{sample?'Sample · Populated synthetic preview · No live records, prices or notifications are changed.':'Live workspace · Actions follow your verified permissions.'}</footer></div></div>;
}
