import {requireDateKey} from './businessDate';
/** URL dates are navigation state, not trusted ledger input. */
export function reportAsOf(value:string|null,fallback:string){
 requireDateKey(fallback);if(value===null)return {date:fallback,invalid:false};
 try{requireDateKey(value);return {date:value,invalid:false};}
 catch{return {date:fallback,invalid:true};}
}
