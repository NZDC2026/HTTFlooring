import {useEffect,useState} from 'react';
import {nativeRequest} from '../security/repositoryHost';
/** Warehouse users receive quantities only; sales documents and prices stay private. */
export function useCommercialReservations(){const [rows,setRows]=useState<Record<string,number|undefined>>({});useEffect(()=>{const refresh=()=>{try{const result=nativeRequest<{productId:string;quantity?:number}[]>('dispatchFollowups.reservations');setRows(Object.fromEntries(result.map(r=>[r.productId,r.quantity])));}catch{/* Not available in the offline desktop; do not fabricate zero holds. */}};refresh();const timer=setInterval(refresh,30000);window.addEventListener('focus',refresh);return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);};},[]);return rows;}
