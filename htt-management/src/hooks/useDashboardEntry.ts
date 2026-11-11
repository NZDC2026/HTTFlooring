import {useEffect,useRef} from 'react';
import {useSearchParams} from 'react-router-dom';
/** Seed a new drill-down, then consume its marker so Back restores the user's list edits. */
export function useDashboardEntry(apply:(params:URLSearchParams)=>void){
 const [params,setParams]=useSearchParams();
 const previous=useRef('');
 const key=params.toString();
 useEffect(()=>{
  if(params.get('dashboard')!=='1'||previous.current===key)return;
  previous.current=key;
  apply(params);
  const next=new URLSearchParams(params);
  next.delete('dashboard');
  setParams(next,{replace:true});
 },[key]);
}
