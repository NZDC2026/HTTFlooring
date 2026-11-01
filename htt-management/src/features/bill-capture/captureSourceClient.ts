import { isWeb, chooseWebFile } from '../security/webBridge';
import {useSyncExternalStore} from 'react';
import {registerRepository,nativeRequest,hydrateBusiness} from '../security/repositoryHost';
import type {BusinessView} from '../security/securityContract';
import type {Recognition,extractRecognition} from './recognitionModel';
export type CaptureSourceView={id:string;name:string;mime:string;size:number;sha256:string;recognition:Recognition;createdAt:string;createdBy:string;suggestions:ReturnType<typeof extractRecognition>};
let state:{sources:CaptureSourceView[]}={sources:[]};const listeners=new Set<()=>void>();
export const captureSourceClient={getSnapshot:()=>state,subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},inspect(_id:string):CaptureSourceView{throw new Error('Secure desktop required.');}};
registerRepository('captureSources',{repository:captureSourceClient,read:'purchases.bill',commands:{inspect:'purchases.bill'},snapshot:()=>state,restore:v=>{state=v;},publish:()=>listeners.forEach(fn=>fn())});
export const useCaptureSources=()=>useSyncExternalStore(captureSourceClient.subscribe,captureSourceClient.getSnapshot,captureSourceClient.getSnapshot).sources;
export async function selectCaptureSource(operationId:string){let input:unknown={operationId};if(isWeb){const file=await chooseWebFile('.pdf,.png,.jpg,.jpeg');if(!file)return;input={operationId,file:{name:file.name,content:file.content}};}const reply=nativeRequest<{source?:CaptureSourceView;view?:BusinessView}>('capture.select',input);if(reply.view)hydrateBusiness(reply.view);return reply.source;}
export function exportCaptureSource(id:string){return nativeRequest<{saved:boolean}>('capture.export',{id}).saved;}
