import {z} from 'zod';import {existsSync,readFileSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {atomicJson} from '../security/localSecurity';import type {SecretCodec} from '../integrations/localIntegrationStore';
import {profileSchema,connectorSettings,reportSchema,jobSchema,emptyFilingProfile,emptyConnectorSettings} from '../../src/features/payroll-filing/contract';
export const filingDigest=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const schema=z.object({version:z.literal(1),profile:profileSchema,profileRevision:z.number().int().nonnegative(),configuration:connectorSettings,profileHistory:z.array(z.object({at:z.number().finite(),actorId:z.string(),reason:z.string().min(10).max(2000),digest:z.string().length(64)}).strict()).max(2000),reports:z.array(reportSchema).max(1000),jobs:z.array(jobSchema).max(1000),manualReviews:z.array(z.object({id:z.string(),reportId:z.string(),actorId:z.string(),reference:z.string().min(1).max(200),notes:z.string().min(10).max(2000),at:z.number().finite()}).strict()).max(2000)}).strict();
export type FilingState=z.infer<typeof schema>;
export class FilingStore{
 readonly path:string;readonly codec:SecretCodec;private state:FilingState;
 constructor(root:string,codec:SecretCodec){this.path=join(root,'payroll-filing-v1.json');this.codec=codec;
  if(existsSync(this.path)){try{if(!codec.available())throw Error();const raw=readFileSync(this.path,'utf8');if(Buffer.byteLength(raw)>75000000)throw Error();const e=JSON.parse(raw);if(e.version!==1||e.checksum!==filingDigest(e.cipher))throw Error();this.state=this.validate(JSON.parse(codec.decrypt(Buffer.from(e.cipher,'base64'))));}catch{throw new Error('Payroll filing journal cannot be decrypted or verified. Preserve the full profile and OS credentials; do not reset it to submit again.');}}
  else this.state={version:1,profile:emptyFilingProfile(),profileRevision:0,configuration:emptyConnectorSettings(),profileHistory:[],reports:[],jobs:[],manualReviews:[]};
 }
 private validate(value:unknown){const s=schema.parse(value);if(new Set(s.reports.map(r=>r.id)).size!==s.reports.length||new Set(s.jobs.map(j=>j.id)).size!==s.jobs.length||new Set(s.jobs.map(j=>j.requestId)).size!==s.jobs.length||s.jobs.some(j=>!s.reports.some(r=>r.id===j.reportId))||s.reports.some(r=>r.predecessorId&&!s.reports.some(p=>p.id===r.predecessorId))||s.manualReviews.some(m=>!s.reports.some(r=>r.id===m.reportId)))throw Error('Filing journal references are invalid.');return s;}
 read(){return structuredClone(this.state);}
 change(fn:(state:FilingState)=>void){if(!this.codec.available())throw new Error('OS protected storage is required for filing identities and reports.');const next=this.read();fn(next);const state=this.validate(next),plain=JSON.stringify(state);if(Buffer.byteLength(plain)>50000000)throw new Error('Payroll filing quota reached. Preserve the complete profile before archiving.');const cipher=this.codec.encrypt(plain).toString('base64');atomicJson(this.path,{version:1,cipher,checksum:filingDigest(cipher)});this.state=state;}
}
