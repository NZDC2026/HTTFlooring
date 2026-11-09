import env from '../config/environment.cjs';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {z} from 'zod';
import type {BusinessStorage} from '../electron/security/businessHost';
import {requireDateKey} from '../src/lib/businessDate';
import {addCalendarDays,dispatchDate,eligible,nextFollowupAction,followupMail,type FollowupDocument} from '../src/features/dispatch-followups/rules';
const email=z.string().email().max(254);
const configSchema=z.object({enabled:z.boolean(),from:z.union([email,z.literal('')]),notificationEmail:z.union([email,z.literal('')]),portalOrigin:z.string().max(500),timezone:z.string().max(80)}).strict();
type Config=z.infer<typeof configSchema>;
type Event={id:string;documentId:string;number:string;actor:string;at:string;action:string;before:string;after:string;reason:string;notifiedAt?:string;error?:string;notificationAttemptAt?:string};
type Cycle={id:string;date:string;documentId:string;acceptedAt?:string;expiresOn?:string;expiredAt?:string;attemptedAt?:string;attempts:number;nextAttempt?:number;error?:string;token:string;recipient:string;inactive?:boolean};
type State={version:1;config:Config;cycles:Cycle[];events:Event[]};
export type FollowupBackend={documents:()=>FollowupDocument[];schedule:(id:string,date:string,actor:string,reason:string)=>void;expire:(id:string,date:string)=>void};
const defaults:Config={enabled:false,from:'',notificationEmail:'',portalOrigin:'https://htt-flooring-website.nzdc.co.uk',timezone:'Australia/Melbourne'};
function dateInZone(value:number|string,timezone:string){const parts=new Intl.DateTimeFormat('en',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));const p=(k:string)=>parts.find(x=>x.type===k)!.value;return `${p('year')}-${p('month')}-${p('day')}`;}
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
export class DispatchFollowups{
 private state:State;private busy=false;
 private storage:BusinessStorage;private backend:FollowupBackend;private key:()=>string;private now:()=>number;private transport:typeof fetch;
 constructor(storage:BusinessStorage,backend:FollowupBackend,key=()=>env.RESEND_API_KEY??'',now=()=>Date.now(),transport:typeof fetch=fetch){
  this.storage=storage;this.backend=backend;this.key=key;this.now=now;this.transport=transport;
  const saved=storage.read('dispatch-followups-v1.json');this.state=saved?JSON.parse(saved):{version:1,config:defaults,cycles:[],events:[]};
  if(this.state.version!==1||!Array.isArray(this.state.cycles)||!Array.isArray(this.state.events))throw Error('Invalid dispatch follow-up state.');configSchema.parse(this.state.config);
 }
 private save(){this.storage.write('dispatch-followups-v1.json',this.state);}
 private today(){return dateInZone(this.now(),this.state.config.timezone);}
 configure(raw:unknown){const c=configSchema.parse(raw);if(c.portalOrigin){const u=new URL(c.portalOrigin);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error('Portal origin must be an HTTPS origin.');}new Intl.DateTimeFormat('en',{timeZone:c.timezone});if(c.enabled&&(!c.from||!c.notificationEmail||!c.portalOrigin||!this.key()))throw Error('Configure sender, notification email, portal origin and server RESEND_API_KEY before enabling.');this.state.config=c;this.save();return this.view();}
 private recoverHistory(){for(const d of this.backend.documents())for(const h of d.dispatchHistory??[]){if(!this.state.events.some(e=>e.id===h.id)){this.state.events.push({documentId:d.id,number:d.documentNumber,...h});}}}
 view(id?:string){this.recoverHistory();return {configuration:{...this.state.config,emailConfigured:!!this.key()},cycles:this.state.cycles.filter(c=>!id||c.documentId===id).map(({token,recipient,...c})=>({...c,recipient})),events:this.state.events.filter(e=>!id||e.documentId===id).slice(-100).reverse()};}
 private event(d:FollowupDocument,action:string,actor:string,before='',after='',reason=''){const e:Event={id:randomUUID(),documentId:d.id,number:d.documentNumber,actor,at:new Date(this.now()).toISOString(),action,before,after,reason};this.state.events.push(e);this.save();return e;}
 private invalidate(id:string){for(const c of this.state.cycles)if(c.documentId===id&&!c.inactive)c.inactive=true;}
 recordChanges(before:FollowupDocument[],actor:string){
  this.recoverHistory();for(const d of this.backend.documents()){const old=before.find(x=>x.id===d.id);if(!old)continue;
   if(dispatchDate(old)!==dispatchDate(d)){this.invalidate(d.id);if(!d.dispatchHistory?.some(h=>h.before===(dispatchDate(old)??'')&&h.after===(dispatchDate(d)??'')))this.event(d,'Expected dispatch date changed',actor,dispatchDate(old)??'',dispatchDate(d)??'','Updated in management');}
   else if(old.status!==d.status){if(!eligible(d,this.backend.documents()))this.invalidate(d.id);if(!d.dispatchHistory?.some(h=>h.before===old.status&&h.after===d.status))this.event(d,'Document status changed',actor,old.status,d.status);}
  }this.save();
 }

 portalView(token:string){if(!/^[a-f0-9]{64}$/.test(token))throw Error('Invalid or expired secure link.');const c=this.state.cycles.find(c=>digest(c.token)===digest(token)&&!c.inactive&&c.acceptedAt&&!c.expiredAt);if(!c||this.now()-Date.parse(c.acceptedAt!)>30*86400000)throw Error('Invalid or expired secure link.');const docs=this.backend.documents(),d=docs.find(d=>d.id===c.documentId);if(!d||!eligible(d,docs)||dispatchDate(d)!==c.date||d.type==='QUOTE'&&c.expiresOn&&this.today()>=c.expiresOn)throw Error('This document is no longer available for an expected-date update.');return {documentNumber:d.documentNumber,type:d.type,expectedDate:c.date,expiresOn:c.expiresOn,history:this.state.events.filter(e=>e.documentId===d.id).map(({actor,...e})=>({...e,actor:actor===c.recipient?'Customer':'HTT team'}))};}
 portalUpdate(raw:unknown){const i=z.object({token:z.string(),expectedDate:z.string(),reason:z.string().trim().min(3).max(1000)}).strict().parse(raw);this.portalView(i.token);requireDateKey(i.expectedDate);if(i.expectedDate<=this.today())throw Error('Choose a future expected dispatch date.');const c=this.state.cycles.find(c=>c.token===i.token&&!c.inactive)!;if(i.expectedDate===c.date)throw Error('Choose a new expected dispatch date.');const d=this.backend.documents().find(d=>d.id===c.documentId)!;this.backend.schedule(d.id,i.expectedDate,c.recipient,i.reason);this.invalidate(d.id);this.recoverHistory();if(!this.state.events.some(e=>e.documentId===d.id&&e.action==='Customer updated expected dispatch date'&&e.before===c.date&&e.after===i.expectedDate))this.event(d,'Customer updated expected dispatch date',c.recipient,c.date,i.expectedDate,i.reason);this.save();return {saved:true,expectedDate:i.expectedDate,history:this.state.events.filter(e=>e.documentId===d.id).map(e=>({...e,actor:e.actor===c.recipient?'Customer':'HTT team'}))};}
 private async send(to:string,subject:string,text:string,id:string){const response=await this.transport('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+this.key(),'Content-Type':'application/json','Idempotency-Key':'htt-dispatch-'+id},body:JSON.stringify({from:this.state.config.from,to,subject,text}),signal:AbortSignal.timeout(20000),redirect:'error'});if(!response.ok)throw Error('Email provider HTTP '+response.status);const ack=await response.json() as {id?:unknown};if(typeof ack.id!=='string'||!ack.id)throw Error('Email provider did not acknowledge acceptance.');}
 async tick(){if(this.busy||!this.state.config.enabled||!this.key())return;this.busy=true;try{
  this.recoverHistory();const docs=this.backend.documents(),today=this.today();
  for(const c of this.state.cycles){const d=docs.find(x=>x.id===c.documentId);if(!d||!eligible(d,docs)||dispatchDate(d)!==c.date)c.inactive=true;}
  let sent=0;
  for(const d of docs){if(!this.state.config.enabled)break;const currentDocs=this.backend.documents(),current=currentDocs.find(x=>x.id===d.id);if(!current||!eligible(current,currentDocs)||dispatchDate(current)!==dispatchDate(d))continue;const date=dispatchDate(d)!;let c=this.state.cycles.find(c=>c.documentId===d.id&&!c.inactive&&c.date===date);
   const action=nextFollowupAction(d,docs,today,c);
   if(action==='EXPIRE'&&c&&!c.expiredAt){this.backend.expire(d.id,date);c.expiredAt=new Date(this.now()).toISOString();c.inactive=true;this.recoverHistory();if(!this.state.events.some(e=>e.documentId===d.id&&e.action==='Quote expired — reservation released'))this.event(d,'Quote expired — reservation released','Dispatch automation',d.status,'EXPIRED','No update or conversion within seven calendar days of follow-up email acceptance.');this.save();continue;}
   if(action!=='SEND'||sent>=10)continue;
   if(!c){c={id:randomUUID(),documentId:d.id,date,attempts:0,token:randomBytes(32).toString('hex'),recipient:d.recipient?.accountingEmail??''};this.state.cycles.push(c);this.save();}
   if(c.nextAttempt&&c.nextAttempt>this.now())continue;
   // Do not retry an uncertain provider request outside its 24-hour idempotency window.
   if(c.attemptedAt&&this.now()-Date.parse(c.attemptedAt)>23*3600000){c.error='Email outcome requires manual review; no automatic expiration started.';this.save();continue;}
   try{email.parse(c.recipient);c.attemptedAt??=new Date(this.now()).toISOString();c.attempts++;this.save();const expiresOn=addCalendarDays(dateInZone(c.attemptedAt,this.state.config.timezone),7),link=this.state.config.portalOrigin.replace(/\/$/,'')+'/follow-up#'+c.token,mail=followupMail(d,expiresOn,link);await this.send(c.recipient,mail.subject,mail.text,c.id);c.acceptedAt=new Date(this.now()).toISOString();c.expiresOn=d.type==='QUOTE'?addCalendarDays(this.today(),7):undefined;c.error=undefined;this.event(d,'Follow-up email accepted by provider','Dispatch automation',date,c.expiresOn??'','Order reminders do not automatically cancel orders.');sent++;}
   catch(error){c.error=error instanceof Error?error.message:'Email failed';c.nextAttempt=this.now()+Math.min(3600000,60000*2**Math.min(c.attempts,6));this.save();}
  }
  for(const e of this.state.events.filter(e=>!e.notifiedAt).slice(0,10)){if(!this.state.config.enabled)break;try{if(e.notificationAttemptAt&&this.now()-Date.parse(e.notificationAttemptAt)>23*3600000){e.error='Notification outcome requires manual review.';continue;}e.notificationAttemptAt??=new Date(this.now()).toISOString();this.save();await this.send(this.state.config.notificationEmail,`${e.number} — ${e.action}`,`${e.action}\nDocument: ${e.number}\nActor: ${e.actor}\nTime: ${e.at}\nBefore: ${e.before||'—'}\nAfter: ${e.after||'—'}\nReason: ${e.reason||'—'}`,e.id);e.notifiedAt=new Date(this.now()).toISOString();e.error=undefined;}catch(error){e.error=error instanceof Error?error.message:'Notification email failed';}this.save();}
  this.save();
 }finally{this.busy=false;}}
}
