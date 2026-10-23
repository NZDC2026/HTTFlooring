import {useSyncExternalStore} from 'react';
import {registerRepository} from '../security/repositoryHost';
import {emptyYearEnds,yearEndState,type YearEndState} from './model';
let state=emptyYearEnds(),version=0;const listeners=new Set<()=>void>();
const required=(_input?:any):any=>{throw Error('Use the secure Electron desktop application.');};
export const yearEndClient={preflight:required,close:required,reopen:required};
registerRepository('yearEnds',{repository:yearEndClient,read:'accounting.read',commands:{preflight:'accounting.read',close:'accounting.periods',reopen:'accounting.reopen'},snapshot:()=>state,restore:v=>{state=yearEndState.parse(v);},publish:()=>{version++;listeners.forEach(f=>f());}});
export function useYearEnds():YearEndState{useSyncExternalStore(f=>{listeners.add(f);return()=>{listeners.delete(f);};},()=>version,()=>version);return state;}
