import {z} from 'zod';
import {registerRepository} from '../../src/features/security/repositoryHost';
import {trustedAuthorization} from '../../src/features/security/trustedAuthorization';
import {configureCaptureSourceCheck} from '../../src/features/bill-capture/captureEvidence';
import {recognitionSchema,extractRecognition} from '../../src/features/bill-capture/recognitionModel';
import {verifyAttachmentFile,attachmentBytes} from './attachmentFiles';
import {recognizeCaptureFile} from './captureRecognizer';
const id=z.string().min(1).max(200),hash=z.string().regex(/^[a-f0-9]{64}$/);
const sourceSchema=z.object({id,operationId:id,name:id,mime:id,size:z.number().int().positive().max(10000000),sha256:hash,content:z.string().max(14000000),recognition:recognitionSchema,createdAt:z.iso.datetime(),createdBy:id}).strict();
export type CaptureSource=z.infer<typeof sourceSchema>;
let sources:CaptureSource[]=[];
function get(id:string){trustedAuthorization.require('purchases.bill');const s=sources.find(s=>s.id===id);if(!s)throw new Error('Recognized source not found or access denied.');attachmentBytes(s);return s;}
const view=(s:CaptureSource)=>{const {content:_content,...rest}=s;return {...rest,suggestions:extractRecognition(s.recognition)};};
export const captureSourceRepository={
 recognize(raw:unknown){
  const user=trustedAuthorization.require('purchases.bill');
  const input=z.object({operationId:id,file:z.object({name:id,content:z.string().max(14000000)}).strict()}).strict().parse(raw),file=verifyAttachmentFile(input.file.name,input.file.content);
  if(!['application/pdf','image/png','image/jpeg'].includes(file.mime))throw new Error('Choose a PDF, PNG or JPEG source.');
  const previous=sources.find(s=>s.operationId===input.operationId);
  if(previous){if(previous.sha256!==file.sha256||previous.name!==file.name)throw new Error('Operation ID already has different source data.');return view(get(previous.id));}
  const duplicate=sources.find(s=>s.sha256===file.sha256);if(duplicate)return view(get(duplicate.id));
  if(sources.reduce((n,s)=>n+s.size,0)+file.size>50000000)throw new Error('Recognized originals exceed the 50 MB local source limit. Archive the business profile before adding more.');
  const recognition=recognizeCaptureFile(file.name,Buffer.from(file.content,'base64'));
  if(!recognition.lines.length)throw new Error('No text recognized. Improve the scan and retry, or use manual/CSV capture.');
  const source:CaptureSource={...file,id:crypto.randomUUID(),operationId:input.operationId,recognition,createdAt:new Date().toISOString(),createdBy:user.userId};sources=[...sources,source];return view(source);
 },
 read(id:string){return {...get(id)};},
 inspect(id:string){return view(get(id));}
};
configureCaptureSourceCheck(id=>{const s=get(id);return {name:s.name,sha256:s.sha256};});
registerRepository('captureSources',{repository:captureSourceRepository,read:'purchases.bill',commands:{recognize:'purchases.bill',read:'purchases.bill',inspect:'purchases.bill'},snapshot:()=>({sources}),restore:v=>{sources=v.sources;},publish:()=>{},view:()=>({sources:sources.map(view)}),validate:raw=>{
 const parsed=z.object({sources:z.array(sourceSchema)}).strict().parse(raw),ids=new Set<string>(),operations=new Set<string>();let size=0;
 for(const s of parsed.sources){attachmentBytes(s);if(!['application/pdf','image/png','image/jpeg'].includes(s.mime)||ids.has(s.sha256)||operations.has(s.operationId))throw new Error('Invalid recognized source evidence.');ids.add(s.sha256);operations.add(s.operationId);size+=s.size;}
 if(size>50000000)throw new Error('Recognized source library exceeds 50 MB.');
}});
