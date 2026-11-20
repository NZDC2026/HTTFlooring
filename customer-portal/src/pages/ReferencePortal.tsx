import {useEffect,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {authMode} from '../config/auth';
import {logout} from '../services/account';
const toReference=(route:string)=>route.replace(/^\/display-boards(?=[/?]|$)/, '/boards');
const toLocal=(route:string)=>route.replace(/^\/boards(?=[/?]|$)/, '/display-boards');
/** The supplied standalone prototype is isolated from the API-backed portal and its styles. */
export default function ReferencePortal(){
 const location=useLocation(),navigate=useNavigate(),frame=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{const previous=document.title;document.title="HTT Customer Portal";return()=>{document.title=previous;};},[]);
 const route=toReference(location.pathname+location.search),currentRoute=useRef(route);
 const [source]=useState(()=>`/reference-portal/index.html?businessPreview=${authMode}#${route==='/'?'/dashboard':route}`);
 useEffect(()=>{currentRoute.current=route;frame.current?.contentWindow?.postMessage({type:'htt-reference:navigate',route},window.location.origin);},[route]);
 useEffect(()=>{
  const receive=(event:MessageEvent)=>{
   if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow)return;
   if(event.data?.type==='htt-reference:logout'){logout();navigate('/login',{replace:true});return;}
   if(event.data?.type!=='htt-reference:route'||typeof event.data.route!=='string'||!/^\/[a-z0-9][a-z0-9\-/?=&%+_.]*$/i.test(event.data.route))return;
   if(event.data.route!==currentRoute.current){currentRoute.current=event.data.route;navigate(toLocal(event.data.route),{replace:true});}
  };
  window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);
 },[navigate]);
 return <iframe ref={frame} src={source} title="HTT Customer Portal" className="reference-portal-frame" onLoad={()=>frame.current?.contentWindow?.postMessage({type:'htt-reference:navigate',route:currentRoute.current},window.location.origin)}/>;
}
