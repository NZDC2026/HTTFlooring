import {z} from 'zod';
import {useSyncExternalStore} from 'react';
export const logoSchema=z.object({id:z.uuid(),name:z.string().min(1).max(100),mime:z.literal('image/png'),width:z.number().int().min(1).max(1024),height:z.number().int().min(1).max(1024),size:z.number().int().min(1).max(262144),sha256:z.string().regex(/^[a-f0-9]{64}$/),content:z.string().min(4).max(349528).regex(/^[A-Za-z0-9+/]+={0,2}$/)}).strict();
export type BrandLogo=z.infer<typeof logoSchema>;
export type BrandingState={assets:BrandLogo[];history:{id:string;operationId:string;actorId:string;at:string;reason:string;revision:number;logoId:string|null;fingerprint:string;request:Record<string,unknown>}[]};
let state:BrandingState={assets:[],history:[]},version=0;const listeners=new Set<()=>void>();
export const brandingSnapshot=()=>state;
export const brandingState=()=>({...state,revision:state.history.length,currentId:state.history.at(-1)?.logoId??null});
export const restoreBranding=(value:BrandingState)=>{state=value;};
export const publishBranding=()=>{version++;listeners.forEach(f=>f());};
export const currentLogo=()=>{const logo=state.assets.find(a=>a.id===brandingState().currentId);return logo?structuredClone(logo):undefined;};
export function useBranding(){useSyncExternalStore(f=>{listeners.add(f);return()=>{listeners.delete(f);};},()=>version,()=>version);return brandingState();}
export function logoHtml(raw:BrandLogo|undefined,position:'Left'|'Centre'|'Right'='Left'){if(!raw)return '';const logo=logoSchema.parse(raw);return `<img alt="Company logo" width="${Math.min(180,logo.width)}" style="display:block;max-width:180px;max-height:80px;width:auto;height:auto;object-fit:contain;margin-bottom:12px;margin-left:${position==='Left'?'0':'auto'};margin-right:${position==='Right'?'0':'auto'}" src="data:image/png;base64,${logo.content}">`;}
