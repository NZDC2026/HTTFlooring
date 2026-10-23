import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {atomicJson} from '../security/localSecurity';
import {settingsSchema,jobSchema,policySchema,statementSchema,type IntegrationSettings} from '../../src/features/external-services/contract';
const dataSchema=z.object({version:z.literal(1),id:z.string().uuid(),jobs:z.array(jobSchema).max(2000),policies:z.array(policySchema).max(1000),statements:z.array(statementSchema).max(1000).default([])}).strict();
export type IntegrationData=z.infer<typeof dataSchema>;
const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
/** Separate from business restore: provider side effects must never be rewound by a ledger backup. */
export class IntegrationStore{
 readonly path:string;private data:IntegrationData;
 constructor(root:string){this.path=join(root,'integration-journal-v1.json');
  if(existsSync(this.path)){
   try{const raw=readFileSync(this.path,'utf8');if(Buffer.byteLength(raw)>60000000)throw Error();const {checksum,...body}=JSON.parse(raw);if(checksum!==digest(body))throw Error();this.data=dataSchema.parse(body);if(new Set(this.data.jobs.map(j=>j.id)).size!==this.data.jobs.length||new Set(this.data.jobs.map(j=>j.operationId)).size!==this.data.jobs.length)throw Error();}
   catch{throw new Error('Integration journal is invalid. Preserve the full profile and inspect it; do not reset it to resend.');}
  }else{this.data={version:1,id:randomUUID(),jobs:[],policies:[],statements:[]};this.save(this.data);}
 }
 read(){return structuredClone(this.data);}
 save(next:IntegrationData){const data=dataSchema.parse(next);if(Buffer.byteLength(JSON.stringify(data))>50000000)throw new Error('Integration journal quota reached. Preserve it before archiving payloads.');atomicJson(this.path,{...data,checksum:digest(data)});this.data=structuredClone(data);}
 change(fn:(data:IntegrationData)=>void){const next=this.read();fn(next);this.save(next);}
}
export type SecretCodec={available:()=>boolean;encrypt:(value:string)=>Buffer;decrypt:(value:Buffer)=>string};
export class IntegrationVault{
 readonly path:string;
 readonly codec:SecretCodec;constructor(root:string,codec:SecretCodec){this.codec=codec;this.path=join(root,'integration-secrets-v1.json');}
 get():IntegrationSettings{
  if(!existsSync(this.path))return {emailEnabled:false,checkoutEnabled:false,resendKey:'',stripeKey:'',from:'',successUrl:'',cancelUrl:'',live:false};
  if(!this.codec.available())throw new Error('OS protected credential storage is unavailable.');
  try{const value=JSON.parse(readFileSync(this.path,'utf8'));if(value.version!==1||typeof value.cipher!=='string')throw Error();return settingsSchema.parse(JSON.parse(this.codec.decrypt(Buffer.from(value.cipher,'base64'))));}catch{throw new Error('Saved integration credentials cannot be decrypted on this device. Reconfigure locally; do not reset the integration journal.');}
 }
 set(raw:unknown){
  if(!this.codec.available())throw new Error('OS protected credential storage is unavailable.');
  const parsed=settingsSchema.safeParse(raw);if(!parsed.success)throw new Error('Invalid integration settings.');
  const next=parsed.data;let old:IntegrationSettings;try{old=this.get();}catch{if(next.emailEnabled&&!next.resendKey||next.checkoutEnabled&&!next.stripeKey)throw new Error('Enter fresh keys for every enabled service to replace unreadable credentials.');old={...next,resendKey:'',stripeKey:''};}next.resendKey=next.resendKey||old.resendKey;next.stripeKey=next.stripeKey||old.stripeKey;
  if(next.resendKey&&!/^re_[A-Za-z0-9_-]+$/.test(next.resendKey))throw new Error('Invalid Resend key format.');
  if(next.stripeKey&&!new RegExp('^(sk|rk)_'+(next.live?'live':'test')+'_[A-Za-z0-9]+$').test(next.stripeKey))throw new Error('Stripe key does not match the selected test/live mode.');
  if(next.emailEnabled&&(!next.resendKey||!next.from))throw new Error('Configure a Resend key and verified sender before enabling email.');
  if(next.checkoutEnabled){if(!next.stripeKey)throw new Error('Configure Stripe credentials first.');for(const value of [next.successUrl,next.cancelUrl]){let u:URL;try{u=new URL(value);}catch{throw new Error('Configure valid HTTPS checkout return pages.');}if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443')throw new Error('Checkout return pages must use HTTPS.');}}
  atomicJson(this.path,{version:1,cipher:this.codec.encrypt(JSON.stringify(next)).toString('base64')});
 }
 revision(kind:'EMAIL'|'CHECKOUT'){const c=this.get();return digest(kind==='EMAIL'?[c.resendKey,c.from]:[c.stripeKey,c.live]);}
}
