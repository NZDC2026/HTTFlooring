import {z} from 'zod';
import {nativeRequest} from '../../security/repositoryHost';
import {isWeb,publicPreview} from '../../security/webBridge';
import {abrResultSchema,lookupAddressSchema,lookupStatusSchema,normaliseAbn,suggestionSchema,type LookupScenario} from './customerLookupModel';
export type LookupContext={sample:boolean;scenario:LookupScenario;signal?:AbortSignal};
const sampleAddresses=[{id:'sample-richmond',label:'24 Sample Trade Road, Richmond VIC 3121, Australia',address:{addressLine1:'24 Sample Trade Road',addressLine2:'',suburb:'Richmond',state:'VIC',postcode:'3121',country:'Australia'}},{id:'sample-sydney',label:'8 Example Warehouse Street, Alexandria NSW 2015, Australia',address:{addressLine1:'8 Example Warehouse Street',addressLine2:'',suburb:'Alexandria',state:'NSW',postcode:'2015',country:'Australia'}},{id:'sample-unit',label:'Unit 3/24 Sample Trade Road, Richmond VIC 3121, Australia',address:{addressLine1:'3/24 Sample Trade Road',addressLine2:'',suburb:'Richmond',state:'VIC',postcode:'3121',country:'Australia'}}];
async function demo(action:string,input:Record<string,unknown>,{scenario,signal}:LookupContext){
 await new Promise<void>((resolve,reject)=>{if(signal?.aborted){reject(new DOMException('Cancelled','AbortError'));return;}const cancel=()=>{clearTimeout(timer);reject(new DOMException('Cancelled','AbortError'));};const timer=setTimeout(()=>{signal?.removeEventListener('abort',cancel);resolve();},scenario==='Slow response'?1500:220);signal?.addEventListener('abort',cancel,{once:true});});
 if(scenario==='Service unavailable')throw Error('Sample · Lookup service unavailable. Retry or enter the details manually.');
 if(action==='customerLookup.status')return{abrConfigured:true,addressesConfigured:true};
 if(action==='customerLookup.abn'){if(scenario==='Not found')throw Error('Sample · No ABR record was found for this ABN.');return{abn:normaliseAbn(String(input.abn)),name:'Sample Oak Living Pty Ltd',status:scenario==='Cancelled ABN'?'Cancelled':'Active',gstRegistered:scenario==='Not GST registered'?'No':'Yes',state:'VIC',postcode:'3121',source:'ABR'};}
 if(action==='customerLookup.suggest'){const query=String(input.query).trim().toLowerCase();return{suggestions:scenario==='Not found'?[]:sampleAddresses.filter(s=>s.label.toLowerCase().includes(query)).map(({id,label})=>({id,label}))};}
 const found=sampleAddresses.find(s=>s.id===input.id);if(!found)throw Error('Sample · Choose a current address suggestion.');return{address:found.address};
}
async function request(action:string,input:Record<string,unknown>,context:LookupContext):Promise<unknown>{
 if(context.sample)return demo(action,input,context);
 if(publicPreview)throw Error('The public Sample preview cannot access live lookup providers.');
 if(!isWeb)return nativeRequest(action,input);
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000),cancel=()=>controller.abort();if(context.signal?.aborted)controller.abort();context.signal?.addEventListener('abort',cancel,{once:true});
 try{const response=await fetch('/api/security',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-HTT-Request':'1'},body:JSON.stringify({action,input}),signal:controller.signal});if(!response.ok)throw Error('The customer lookup service is unavailable. Retry or enter the details manually.');const reply=await response.json();if(!reply.ok)throw Error(reply.error||'Customer lookup failed.');return reply.value;}
 catch(error){if(controller.signal.aborted&&!context.signal?.aborted)throw Error('The lookup timed out. Retry or enter the details manually.');throw error;}finally{clearTimeout(timer);context.signal?.removeEventListener('abort',cancel);}
}
export const customerLookup={
 async status(context:LookupContext){return lookupStatusSchema.parse(await request('customerLookup.status',{},context));},
 async abn(abn:string,context:LookupContext){normaliseAbn(abn);return abrResultSchema.parse(await request('customerLookup.abn',{abn},context));},
 async suggest(query:string,sessionToken:string,context:LookupContext){return z.object({suggestions:z.array(suggestionSchema).max(5)}).parse(await request('customerLookup.suggest',{query,sessionToken},context)).suggestions;},
 async address(id:string,sessionToken:string,context:LookupContext){return z.object({address:lookupAddressSchema}).parse(await request('customerLookup.address',{id,sessionToken},context)).address;},
};
