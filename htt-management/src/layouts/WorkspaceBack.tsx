import {useSecurity} from '../features/security/securityClient';
import {listReturnLocation} from './listReturnLocation';
import {useEffect,useState,type RefObject} from 'react';
import {ArrowLeft} from 'lucide-react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import './workspace-back.css';
export const primaryWorkspacePaths=['/','/dashboard','/workspace','/sales','/sales/credit-returns','/promotions','/procurement','/purchases','/purchases/incoming-shipments','/inventory','/banking','/accounting','/payroll','/reports','/contacts','/contacts/supplier-dashboard','/tasks','/tools/import-export','/settings','/settings/employees','/settings/trash','/settings/preferences'];
export const isPrimaryWorkspace=(path:string)=>primaryWorkspacePaths.includes(path.replace(/\/$/,'')||'/');
/** A safe destination when a page is opened directly or in a new desktop window. */
export function workspaceBackTarget(path:string):string{
 const p=path.replace(/\/$/,'')||'/';
 if(/^\/contacts\/customers\/[^/]+\/.+/.test(p))return p.split('/').slice(0,4).join('/');
 if(/^\/contacts\/customers\/[^/]+$/.test(p))return '/contacts/list';
 if(p.startsWith('/contacts/suppliers/')&&p!=='/contacts/suppliers/new')return '/contacts/suppliers';
 if(p==='/contacts/list'||p==='/contacts/customers/new'||p==='/contacts/price-settings')return '/contacts';
 if(p==='/contacts/suppliers')return '/contacts/supplier-dashboard';
 const root=p.split('/')[1];
 if(['sales','purchases','inventory','banking','accounting','payroll','reports','settings','procurement','promotions','tasks'].includes(root))return p===`/${root}`?'/dashboard':`/${root}`;
 if(root==='documents')return '/sales';
 return '/dashboard';
}
export function WorkspaceBack({contentRef}:{contentRef:RefObject<HTMLDivElement|null>}){
 const {session}=useSecurity();
 const location=useLocation(),navigate=useNavigate(),[hasExisting,setHasExisting]=useState(false);
 useEffect(()=>{
  const root=contentRef.current;if(!root)return;
  const update=()=>{
   let found=false;
   root.querySelectorAll<HTMLAnchorElement|HTMLButtonElement>('a,button').forEach(el=>{
    const text=(el.textContent??'').trim().replace(/^[←\s]+/,'');
    // Keep workflow-step Back controls functional; only page-return links suppress the fallback.
    if(/^Back(?:\s+to\b|$)/i.test(text)&&text.length<100){
     el.classList.add('workspace-back');
     if(/^Back\s+to\b/i.test(text)||el.tagName==='A'||el.querySelector('.lucide-arrow-left'))found=true;
    }
   });
   setHasExisting(found);
  };
  update();const observer=new MutationObserver(update);observer.observe(root,{childList:true,subtree:true,characterData:true});return()=>observer.disconnect();
 },[location.pathname,location.search,contentRef]);
 if(isPrimaryWorkspace(location.pathname)||hasExisting)return null;
 const target=listReturnLocation(session?.user.id??'',workspaceBackTarget(location.pathname)),sample=new URLSearchParams(location.search).get('sample')==='1';
 return <Link className="workspace-back workspace-back-fallback" to={target+(sample&&!target.includes('?')?'?sample=1':'')} onClick={e=>{
  if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  if(typeof window.history.state?.idx==='number'&&window.history.state.idx>0){e.preventDefault();navigate(-1);}
 }}><ArrowLeft size={16} aria-hidden="true"/>Back</Link>;
}
