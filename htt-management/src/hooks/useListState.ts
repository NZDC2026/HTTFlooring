import {useState,type Dispatch,type SetStateAction} from 'react';
import {useSecurity} from '../features/security/securityClient';
const memory=new Map<string,unknown>();
export function listStateKey(userId:string,route:string,field:string){return `htt:list-state:v1:${JSON.stringify([userId,route,field])}`;}
export function readListState<T>(key:string,initial:T|(()=>T)):T{
 if(key&&memory.has(key))return memory.get(key) as T;
 if(key&&typeof window!=='undefined')try{const raw=window.sessionStorage.getItem(key);if(raw!==null){const value=JSON.parse(raw) as T;memory.set(key,value);return value;}}catch{/* Storage can be disabled. In-memory navigation still works. */}
 return typeof initial==='function'?(initial as ()=>T)():initial;
}
export function writeListState<T>(key:string,value:T){if(!key)return;memory.set(key,value);if(typeof window!=='undefined')try{window.sessionStorage.setItem(key,JSON.stringify(value));}catch{/* No business records are written. */}}
/** Only list presentation state belongs here. Never use for document drafts or financial inputs. */
export function useListState<T>(field:string,initial:T|(()=>T)):[T,Dispatch<SetStateAction<T>>]{
 const {session}=useSecurity();
 const route=typeof window==='undefined'?'':window.location.hash.split('?')[0]||window.location.pathname;
 const key=session?listStateKey(session.user.id,route,field):'';
 const [stored,setStored]=useState(()=>({key,value:readListState(key,initial)}));
 const value=stored.key===key?stored.value:readListState(key,initial);
 const setValue:Dispatch<SetStateAction<T>>=update=>setStored(previous=>{const current=previous.key===key?previous.value:readListState(key,initial);const next=typeof update==='function'?(update as (p:T)=>T)(current):update;writeListState(key,next);return {key,value:next};});
 return [value,setValue];
}
