import {z} from 'zod';
import {checkoutPayload,mailPayload,type ExternalJob,type IntegrationSettings} from '../../src/features/external-services/contract';
export class ProviderFault extends Error{readonly code:string;readonly retryable:boolean;constructor(code:string,retryable=false){super(code);this.code=code;this.retryable=retryable;}}
export type ProviderTransport=(url:string,init:RequestInit)=>Promise<unknown>;
export const providerTransport:ProviderTransport=async(url,init)=>{
 let response:Response;
 try{response=await fetch(url,{...init,redirect:'error',signal:AbortSignal.timeout(20000)});}catch{throw new ProviderFault('NETWORK_OUTCOME_UNKNOWN',true);}
 if(!response.ok){await response.body?.cancel();throw new ProviderFault('PROVIDER_HTTP_'+response.status,response.status===429||response.status>=500||response.status===409);}
 try{const reader=response.body?.getReader();if(!reader)throw Error();let size=0;const parts:Uint8Array[]=[];while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>1000000){await reader.cancel();throw Error();}parts.push(part.value);}return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw new ProviderFault('PROVIDER_RESPONSE_INVALID',true);}
};
const providerId=z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/);
const ack=z.object({id:providerId});
const sessionSchema=z.object({id:providerId,client_reference_id:z.string(),metadata:z.object({htt_job:z.string()}),mode:z.literal('payment'),livemode:z.boolean(),currency:z.literal('aud'),amount_total:z.number().int().positive(),status:z.enum(['open','complete','expired']),payment_status:z.enum(['paid','unpaid','no_payment_required']),url:z.string().nullable().optional(),payment_intent:z.unknown().optional()});
export function safeCheckoutUrl(raw:string){const u=new URL(raw);if(u.protocol!=='https:'||u.hostname!=='checkout.stripe.com'||u.username||u.password||u.port)throw new ProviderFault('UNTRUSTED_CHECKOUT_URL');return u.href;}
export class Providers{
 private transport:ProviderTransport;constructor(transport:ProviderTransport=providerTransport){this.transport=transport;}
 async create(job:ExternalJob,settings:IntegrationSettings,key:string){
  if(job.kind==='EMAIL'){
   const payload=mailPayload.parse(job.payload),raw=await this.transport('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+settings.resendKey,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(payload)});
   const parsed=ack.safeParse(raw);if(!parsed.success)throw new ProviderFault('PROVIDER_RESPONSE_INVALID',true);return {id:parsed.data.id};
  }
  const p=checkoutPayload.parse(job.payload),form=new URLSearchParams({mode:'payment',client_reference_id:p.invoiceId,'metadata[htt_job]':job.id,'payment_method_types[0]':'card','line_items[0][price_data][currency]':'aud','line_items[0][price_data][unit_amount]':String(p.amountMinor),'line_items[0][price_data][product_data][name]':p.documentNumber,'line_items[0][quantity]':'1',success_url:p.successUrl,cancel_url:p.cancelUrl});
  if(p.customerEmail)form.set('customer_email',p.customerEmail);
  const raw=await this.transport('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:'Bearer '+settings.stripeKey,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':key},body:form.toString()});
  const session=this.session(raw,job);if(!session.url)throw new ProviderFault('CHECKOUT_URL_MISSING',true);return {id:session.id,url:safeCheckoutUrl(session.url)};
 }
 private session(raw:unknown,job:ExternalJob){const parsed=sessionSchema.safeParse(raw);if(!parsed.success)throw new ProviderFault('PAYMENT_EVIDENCE_INVALID');const s=parsed.data,p=checkoutPayload.parse(job.payload);if(s.client_reference_id!==job.sourceId||s.metadata.htt_job!==job.id||s.amount_total!==job.amountMinor||s.livemode!==p.live||job.providerId&&s.id!==job.providerId)throw new ProviderFault('PAYMENT_EVIDENCE_MISMATCH');return s;}
 async poll(job:ExternalJob,settings:IntegrationSettings){
  if(!job.providerId||!providerId.safeParse(job.providerId).success)throw new ProviderFault('PROVIDER_REFERENCE_MISSING');
  if(job.kind==='EMAIL'){
   const raw=await this.transport('https://api.resend.com/emails/'+encodeURIComponent(job.providerId),{headers:{Authorization:'Bearer '+settings.resendKey}});
   const parsed=z.object({id:providerId,last_event:z.enum(['sent','delivered','delivery_delayed','bounced','complained','opened','clicked','scheduled','canceled','failed','suppressed'])}).safeParse(raw);
   if(!parsed.success||parsed.data.id!==job.providerId)throw new ProviderFault('DELIVERY_EVIDENCE_INVALID');
   const map={sent:'ACCEPTED',delivered:'DELIVERED',delivery_delayed:'DELAYED',bounced:'BOUNCED',complained:'COMPLAINED',opened:'DELIVERED',clicked:'DELIVERED',scheduled:'ACCEPTED',canceled:'CANCELLED',failed:'FAILED',suppressed:'SUPPRESSED'} as const;
   return {status:map[parsed.data.last_event]};
  }
  const raw=await this.transport('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(job.providerId)+'?expand[]=payment_intent.latest_charge',{headers:{Authorization:'Bearer '+settings.stripeKey}}),s=this.session(raw,job);
  if(s.status==='expired')return {status:'EXPIRED' as const};
  if(s.payment_status!=='paid'||s.status!=='complete')return {status:'OPEN' as const};
  const intent=z.object({status:z.literal('succeeded'),currency:z.literal('aud'),amount_received:z.number().int(),latest_charge:z.object({paid:z.literal(true),captured:z.literal(true),amount_captured:z.number().int(),amount_refunded:z.literal(0),refunded:z.literal(false),created:z.number().int().positive()})}).safeParse(s.payment_intent);
  if(!intent.success||intent.data.amount_received!==job.amountMinor||intent.data.latest_charge.amount_captured!==job.amountMinor)throw new ProviderFault('PAID_CHARGE_REQUIRES_REVIEW');
  return {status:'PAID_REVIEW' as const,paidAt:intent.data.latest_charge.created*1000};
 }
}
