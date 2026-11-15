import {z} from 'zod';
import {snapshotRepositories} from '../security/repositoryHost';
const text=z.string().min(1).max(200);
export const clearanceEvidenceSchema=z.object({documentId:text,documentRevision:z.number().int().positive(),versionId:text,versionNumber:z.number().int().positive(),title:text,name:text,mime:text,size:z.number().int().positive(),sha256:z.string().regex(/^[a-f0-9]{64}$/),uploadedAt:text,uploadedBy:text}).strict();
export type ClearanceEvidence=z.infer<typeof clearanceEvidenceSchema>;
export function collectClearanceEvidence(requestId:string):ClearanceEvidence[]{
 const state=snapshotRepositories(['attachments']).attachments as any;
 const refs=(state?.documents??[]).filter((d:any)=>d.target.kind==='Clearance write-off'&&d.target.id===requestId&&!d.deletedAt).map((d:any)=>{const v=d.versions.find((v:any)=>v.id===d.currentVersionId);if(!v)throw Error('Attachment version is unavailable.');return {documentId:d.id,documentRevision:d.revision,versionId:v.id,versionNumber:v.number,title:d.title,name:v.name,mime:v.mime,size:v.size,sha256:v.sha256,uploadedAt:v.createdAt,uploadedBy:v.createdBy};}).sort((a:ClearanceEvidence,b:ClearanceEvidence)=>a.documentId.localeCompare(b.documentId));
 if(!refs.length)throw Error('Upload at least one photo or attachment before submitting for approval.');
 return refs;
}
export function validateClearanceEvidence(refs:ClearanceEvidence[],requestId:string,snapshots:Record<string,any>,capturedAt?:string){
 if(!refs.length||new Set(refs.map(r=>r.documentId)).size!==refs.length)throw Error('Invalid clearance evidence packet.');
 for(const r of refs){clearanceEvidenceSchema.parse(r);const state=snapshots.attachments,d=state?.documents.find((d:any)=>d.id===r.documentId&&d.target.kind==='Clearance write-off'&&d.target.id===requestId),v=d?.versions.find((v:any)=>v.id===r.versionId),h=state?.history.find((h:any)=>h.documentId===r.documentId&&h.revision===r.documentRevision);
 if(!v||!h||(capturedAt&&(v.createdAt>capturedAt||h.at>capturedAt))||h.after.deleted||h.after.currentVersionId!==r.versionId||h.after.title!==r.title||v.number!==r.versionNumber||v.name!==r.name||v.mime!==r.mime||v.size!==r.size||v.sha256!==r.sha256||v.createdAt!==r.uploadedAt||v.createdBy!==r.uploadedBy)throw Error('Frozen clearance evidence differs from its retained attachment version.');
 }
}
export function clearanceAwaitingEvidence(row:{clearanceId?:string;status:string;evidence?:unknown[]}){return !!row.clearanceId&&(row.status==='PREPARING'||row.status==='DRAFT'&&!row.evidence?.length);}
export function adjustmentIsPending(row:{clearanceId?:string;status:string;evidence?:unknown[]}){return row.status==='DRAFT'&&!clearanceAwaitingEvidence(row);}
