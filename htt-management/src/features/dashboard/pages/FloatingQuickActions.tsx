import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Link} from 'react-router-dom';
import {Zap,X,ChevronUp,ChevronRight,FilePlus2,ShoppingCart,FileText,Users,Search,Layers,Package,Truck,ClipboardCheck,Settings,RotateCcw,Mail} from 'lucide-react';
import {useListState} from '../../../hooks/useListState';
import {dashboardLink} from './dashboardLink';
import './floating-quick-actions.css';
export const quickActions: {id:string;group:string;name:string;detail:string;icon:typeof Zap;path:string;filter?:Record<string,string>}[]=[
 {id:'invoice',group:'Sales & Orders',name:'New Invoice',detail:'Create a customer invoice',icon:FilePlus2,path:'/sales/drafts/invoices/new'},
 {id:'order',group:'Sales & Orders',name:'New Sales Order',detail:'Create a new sales order',icon:ShoppingCart,path:'/sales/drafts/orders/new'},
 {id:'quote',group:'Sales & Orders',name:'Create Quote',detail:'Generate a customer quote',icon:FileText,path:'/sales',filter:{newQuote:'1'}},
 {id:'return-credit',group:'Sales & Orders',name:'Create Return/Credit',detail:'Return goods or issue customer credit',icon:RotateCcw,path:'/sales/credit-returns'},
 {id:'order-search',group:'Sales & Orders',name:'All Order Search',detail:'Search sales orders and references',icon:Search,path:'/sales',filter:{tab:'SALES_ORDER'}},
 {id:'send-documents',group:'Sales & Orders',name:'Send Invoice/Statement',detail:'Review invoices and customer statements',icon:Mail,path:'/sales/invoice-reminders',filter:{filter:'All'}},
 {id:'customer',group:'Customer',name:'Customer Search',detail:'Find customer details, credit, orders',icon:Search,path:'/contacts/list'},
 {id:'stock',group:'Inventory',name:'Check Stock',detail:'Check product availability and stock level',icon:Package,path:'/inventory'},
 {id:'delivery',group:'Delivery & Warehouse',name:'Book Delivery',detail:'Schedule a delivery or pickup',icon:Truck,path:'/sales',filter:{special:'awaiting'}},
 {id:'task',group:'Tasks & Follow-ups',name:'Create Task',detail:'Create a task or follow-up for your team',icon:ClipboardCheck,path:'/tasks',filter:{create:'Follow-up'}},
];
const groupIcons=[ShoppingCart,Users,Layers,Truck,ClipboardCheck];
export function FloatingQuickActions({from,to,sample,site}:{from:string;to:string;sample:boolean;site:string}){
 const [open,setOpen]=useState(false),[customising,setCustomising]=useState(false);
 const [hidden,setHidden]=useListState<string[]>('dashboard:quick-actions:hidden',[]);
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const close=()=>{setOpen(false);setCustomising(false);trigger.current?.focus();};
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')close();};const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node)){setOpen(false);setCustomising(false);}};document.addEventListener('keydown',onKey);document.addEventListener('pointerdown',outside);return()=>{document.removeEventListener('keydown',onKey);document.removeEventListener('pointerdown',outside);};},[open]);
 const content=<div ref={root} className="floating-quick-actions">
 {open&&<section id="dashboard-quick-actions" className="fqa-panel" aria-label="Quick Actions panel">
 <header className="fqa-header"><span className="fqa-bolt"><Zap size={20} fill="currentColor"/></span><div><h2>Quick Actions</h2><p>Common tasks, one click away</p></div><button type="button" onClick={close} aria-label="Close Quick Actions"><X size={17}/></button></header>
 <div className="fqa-body">{sample&&<span className="fqa-sample">Sample · Preview links</span>}<div className="fqa-groups">{[...new Set(quickActions.map(a=>a.group))].map((group,index)=>{const Icon=groupIcons[index],items=quickActions.filter(a=>a.group===group&&(customising||!hidden.includes(a.id)));return items.length>0&&<section key={group} className={index===0?'fqa-group fqa-sales':'fqa-group'}><h3><Icon size={16}/>{group}</h3><div className="fqa-items">{items.map(a=>customising?<label className="fqa-custom" key={a.id}><input type="checkbox" checked={!hidden.includes(a.id)} onChange={e=>setHidden(previous=>e.target.checked?previous.filter(id=>id!==a.id):[...previous,a.id])}/>{a.name}</label>:<Link key={a.id} to={dashboardLink(a.path,from,to,sample,site,a.filter)} onClick={()=>setOpen(false)}><a.icon size={24}/><span><b>{a.name}</b><small>{a.detail}</small></span></Link>)}</div></section>;})}</div>
 <section className="fqa-sample-previews"><h3>Sample · Try complete workflows</h3>{quickActions.filter(a=>['return-credit','order-search','send-documents'].includes(a.id)).map(a=><Link key={a.id} to={dashboardLink(a.path,from,to,true,site,a.filter)} onClick={()=>setOpen(false)}>{a.name} · Sample <ChevronRight size={12}/></Link>)}</section>
 <button type="button" className="fqa-customise" onClick={()=>setCustomising(!customising)}><Settings size={15}/>{customising?'Done':'Customise Quick Actions'}<ChevronRight size={14}/></button></div><span className="fqa-pointer"/></section>}
 <button ref={trigger} type="button" className="fqa-trigger" aria-expanded={open} aria-controls="dashboard-quick-actions" onClick={()=>{setOpen(!open);setCustomising(false);}}><Zap size={20} fill="currentColor"/><span>Quick Actions<small>Common tasks, one click away</small></span><ChevronUp size={14} className={open?'':'fqa-closed'}/></button>
 </div>;
 return typeof document==='undefined'?content:createPortal(content,document.body);
}
