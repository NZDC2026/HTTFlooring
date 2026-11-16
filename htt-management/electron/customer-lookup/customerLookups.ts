import {z} from 'zod';
import env from '../../config/environment.cjs';
import {abrInput,abrResultSchema,australianStates,detailInput,lookupAddressSchema,normaliseAbn,suggestionInput,type LookupAddress} from '../../src/features/contacts/create/customerLookupModel';
import type {VerifiedPrincipal} from '../../src/features/security/rbac';
const responseLimit=1024*1024;
export function parseAbrResponse(raw:string,abn:string){
 const text=raw.trim(),match=/^httAbr\s*\(([\s\S]*)\)\s*;?$/.exec(text);
 if(!match)throw Error('ABR returned an unexpected response. Try again or enter the details manually.');
 const body=z.object({Abn:z.string(),EntityName:z.string().optional(),AbnStatus:z.string().optional(),Gst:z.string().nullable().optional(),AddressState:z.string().optional(),AddressPostcode:z.string().optional(),Message:z.string().optional()}).parse(JSON.parse(match[1]));
 if(body.Message)throw Error(/no.*record|not.*found/i.test(body.Message)?'No ABR record was found for this ABN.':'ABR could not verify this ABN. Check the service configuration or enter the details manually.');
 if(body.Abn!==abn||!body.EntityName)throw Error('No ABR record was found for this ABN.');
 if(!['Active','Cancelled'].includes(body.AbnStatus??''))throw Error('ABR returned an unrecognised registration status. Verify the business manually.');
 return abrResultSchema.parse({abn,name:body.EntityName,status:body.AbnStatus,gstRegistered:body.Gst?'Yes':'No',...(australianStates.includes(body.AddressState as typeof australianStates[number])?{state:body.AddressState}:{}),...(/^\d{4}$/.test(body.AddressPostcode??'')?{postcode:body.AddressPostcode}:{}),source:'ABR'});
}
export function parseGoogleAddress(raw:unknown):LookupAddress{
 const body=z.object({addressComponents:z.array(z.object({longText:z.string().optional(),shortText:z.string().optional(),types:z.array(z.string())}))}).parse(raw);
 const part=(type:string,short=false)=>{const c=body.addressComponents.find(c=>c.types.includes(type));return(short?c?.shortText:c?.longText)||'';};
 if(part('country',true)!=='AU')throw Error('Choose an Australian street address.');
 const number=part('street_number'),route=part('route');
 if(!number||!route)throw Error('This result is not a complete street address. Choose a street number or enter it manually.');
 const unit=part('subpremise');return lookupAddressSchema.parse({addressLine1:[unit?`${unit}/`:'',number,route].filter(Boolean).join(' ').replace('/ ','/'),addressLine2:part('premise'),suburb:part('locality')||part('postal_town')||part('sublocality_level_1'),state:part('administrative_area_level_1',true),postcode:part('postal_code'),country:'Australia'});
}
export class CustomerLookups{
 private rates=new Map<string,{count:number;until:number}>();
 private active=new Map<string,number>();
 private sessions=new Map<string,{until:number;ids:Set<string>}>();
 private readonly config:()=>{abrGuid?:string;placesKey?:string};
 private readonly fetcher:typeof fetch;
 private readonly clock:()=>number;
 constructor(config:()=>{abrGuid?:string;placesKey?:string}=()=>({abrGuid:env.HTT_ABR_GUID,placesKey:env.HTT_GOOGLE_PLACES_API_KEY}),fetcher:typeof fetch=fetch,clock=()=>Date.now()){this.config=config;this.fetcher=fetcher;this.clock=clock;}
 /** Authorization must be checked synchronously by the caller. The returned work never touches the shared principal or business database. */
 prepare(action:string,raw:unknown,actor:VerifiedPrincipal):()=>Promise<unknown>{
  const rawConfig=this.config(),config={abrGuid:rawConfig.abrGuid?.trim(),placesKey:rawConfig.placesKey?.trim()};
  if(action==='customerLookup.status'){z.object({}).strict().parse(raw);return async()=>({abrConfigured:!!config.abrGuid,addressesConfigured:!!config.placesKey});}
  let work:()=>Promise<unknown>;
  if(action==='customerLookup.abn'){
   const abn=normaliseAbn(abrInput.parse(raw).abn);if(!config.abrGuid)throw Error('ABR lookup is not configured. Ask an administrator to configure the ABR GUID; manual entry remains available.');
   work=async()=>{const url=new URL('https://abr.business.gov.au/json/AbnDetails.aspx');url.search=new URLSearchParams({abn,guid:config.abrGuid!,callback:'httAbr'}).toString();return parseAbrResponse(await this.text(url),abn);};
  }else if(action==='customerLookup.suggest'){
   const input=suggestionInput.parse(raw);if(!config.placesKey)throw Error('Australian address lookup is not configured. Ask an administrator to configure the address service; manual entry remains available.');
   const sessionKey=actor.userId+':'+input.sessionToken;
   work=async()=>{const body=JSON.parse(await this.text(new URL('https://places.googleapis.com/v1/places:autocomplete'),{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':config.placesKey!,'X-Goog-FieldMask':'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text'},body:JSON.stringify({input:input.query,includedRegionCodes:['au'],languageCode:'en-AU',sessionToken:input.sessionToken})}));
    const parsed=z.object({suggestions:z.array(z.object({placePrediction:z.object({placeId:z.string().regex(/^[A-Za-z0-9_-]{1,300}$/),text:z.object({text:z.string().min(1).max(500)})}).optional()})).default([])}).parse(body);
    const suggestions=parsed.suggestions.flatMap(p=>p.placePrediction?[{id:p.placePrediction.placeId,label:p.placePrediction.text.text}]:[]).slice(0,5);
    this.clean();const prior=this.sessions.get(sessionKey);this.sessions.set(sessionKey,{until:this.clock()+300000,ids:new Set([...(prior?.ids??[]),...suggestions.map(s=>s.id)].slice(-50))});return{suggestions};};
  }else if(action==='customerLookup.address'){
   const input=detailInput.parse(raw);if(!config.placesKey)throw Error('Australian address lookup is not configured. Manual entry remains available.');
   const sessionKey=actor.userId+':'+input.sessionToken;
   if(!this.sessions.get(sessionKey)?.ids.has(input.id)||this.sessions.get(sessionKey)!.until<this.clock())throw Error('Address suggestions expired. Search again and select a current result.');
   work=async()=>{const url=new URL('https://places.googleapis.com/v1/places/'+encodeURIComponent(input.id));url.search=new URLSearchParams({sessionToken:input.sessionToken,languageCode:'en-AU'}).toString();const body=JSON.parse(await this.text(url,{headers:{'X-Goog-Api-Key':config.placesKey!,'X-Goog-FieldMask':'addressComponents'}}));return{address:parseGoogleAddress(body)};};
  }else throw Error('Unknown customer lookup operation.');
  this.clean();const rate=this.rates.get(actor.userId)??{count:0,until:this.clock()+60000};if(rate.count>=60)throw Error('Too many lookups. Wait a minute before trying again.');rate.count++;this.rates.set(actor.userId,rate);
  return async()=>{const count=this.active.get(actor.userId)??0;if(count>=3)throw Error('A lookup is still running. Wait for it to finish.');this.active.set(actor.userId,count+1);try{return await work();}catch(error){if(error instanceof Error&&/timeout|abort/i.test(error.name))throw Error('The lookup timed out. Retry or enter the details manually.');if(error instanceof TypeError||error instanceof SyntaxError||error instanceof z.ZodError)throw Error('The lookup service returned an unavailable or incomplete result. Retry or enter the details manually.');throw error;}finally{const left=(this.active.get(actor.userId)??1)-1;if(left)this.active.set(actor.userId,left);else this.active.delete(actor.userId);}};
 }
 private clean(){const now=this.clock();for(const [id,r]of this.rates)if(r.until<=now)this.rates.delete(id);for(const [id,r]of this.sessions)if(r.until<=now)this.sessions.delete(id);}
 private async text(url:URL,init:RequestInit={}){const res=await this.fetcher(url,{...init,redirect:'error',signal:AbortSignal.timeout(8000)});if(!res.ok)throw Error(res.status===429?'The lookup provider is busy. Retry shortly or enter the details manually.':'The lookup service could not complete the request. Check the service configuration or retry later.');const reader=res.body?.getReader();if(!reader)throw Error('The lookup service returned no result.');let size=0,text='';const decoder=new TextDecoder();try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>responseLimit)throw Error('The lookup service returned an oversized result.');text+=decoder.decode(part.value,{stream:true});}return text+decoder.decode();}finally{await reader.cancel().catch(()=>{});}}
}
