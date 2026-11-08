import {useEffect,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {MoreHorizontal} from 'lucide-react';
export function SalesActionMenu({label,children}:{label:string;children:ReactNode}){
 const [position,setPosition]=useState<{top:number;left:number}>();
 const trigger=useRef<HTMLButtonElement>(null),menu=useRef<HTMLElement>(null);
 useEffect(()=>{if(!position)return;const close=()=>setPosition(undefined),outside=(e:PointerEvent)=>{if(!trigger.current?.contains(e.target as Node)&&!menu.current?.contains(e.target as Node))close();},key=(e:KeyboardEvent)=>{if(e.key==='Escape'){close();trigger.current?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);window.addEventListener('resize',close);window.addEventListener('scroll',close,true);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);window.removeEventListener('resize',close);window.removeEventListener('scroll',close,true);};},[position]);
 return <><button ref={trigger} type="button" className="sales-action-trigger" aria-label={label} aria-expanded={!!position} aria-haspopup="true" onClick={e=>{e.preventDefault();e.stopPropagation();if(position){setPosition(undefined);return;}const r=e.currentTarget.getBoundingClientRect();setPosition({top:Math.max(8,Math.min(r.bottom+5,window.innerHeight-250)),left:Math.max(8,Math.min(r.right-200,window.innerWidth-208))});}}><MoreHorizontal size={17}/></button>{position&&createPortal(<nav ref={menu} aria-label={label} className="sales-action-menu-popup" style={{top:position.top,left:position.left}} onClick={e=>{e.stopPropagation();setPosition(undefined);}}>{children}</nav>,document.body)}</>;
}
