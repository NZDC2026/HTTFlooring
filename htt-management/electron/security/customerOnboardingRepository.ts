import {createHash} from 'node:crypto';
import {onboardingInput} from '../../src/features/contacts/create/customerOnboardingModel';
import {trustedAuthorization} from '../../src/features/security/trustedAuthorization';
import {customerRepository} from '../../src/features/contacts/data/customerRepository';
import {customerPricingRepository} from '../../src/features/contacts/data/customerPricingRepository';
import {workspaceRepositories} from '../../src/features/business-workspace/workspaceRepository';
import {businessSettings} from '../../src/features/business-workspace/configurationState';
import {attachmentRepository} from './attachmentRepository';
export const customerOnboardingRepository={create(raw:unknown){
 const input=onboardingInput.parse(raw),actor=trustedAuthorization.require('contacts.write'),hash=createHash('sha256').update(JSON.stringify({...input,tasks:input.tasks.map(task=>({...task,ownerName:undefined}))})).digest('hex');
 const existing=customerRepository.getAll().find(c=>c.creationRequest?.operationId===input.operationId),prior=existing?.creationRequest;
 if(prior){if(prior.hash!==hash||prior.actorId!==actor.userId)throw Error('This creation request has different content.');const c=existing;if(!c)throw Error('Created customer no longer exists.');return{id:c.id,code:c.code};}
 if(input.tasks.length)trustedAuthorization.require('sales.write');
 if(input.documents.some(d=>! /\.(pdf|png|jpe?g)$/i.test(d.name)||Buffer.from(d.content,'base64').length>10*1024*1024))throw Error('Use PDF, JPG or PNG files up to 10 MB each.');
 const account=input.customer,accountsEmail=account.setup?.accountsEmail;
 if(accountsEmail){const matches=account.contacts!.find(c=>c.email.toLowerCase()===accountsEmail.toLowerCase());if(matches)account.contacts=account.contacts!.map(c=>({...c,isAccounting:c.id===matches.id}));else account.contacts=[...account.contacts!.map(c=>({...c,isAccounting:false})),{id:crypto.randomUUID(),firstName:'Accounts',lastName:'',email:accountsEmail,isPrimary:false,isAccounting:true}];}
 const customer=customerRepository.create(account);
 for(const price of input.prices)customerPricingRepository.create(customer.id,price);
 for(const [index,file] of input.documents.entries())attachmentRepository.upload({operationId:input.operationId+':document:'+index,expectedRevision:0,target:{kind:'Customer',id:customer.id},title:file.name,reason:'Customer account setup',file});
 for(const task of input.tasks){const owner=task.owner;if(owner==='Everyone')throw Error('Choose an active task assignee.');workspaceRepositories.tasks.save({customerId:customer.id,name:task.name,notes:task.name,owner,ownerName:task.ownerName||owner,due:task.due,priority:task.priority,taskType:'Follow-up',...(task.remind?{reminderAt:task.due+'T09:00',reminderTimeZone:businessSettings().timezone}:{})});}
 customerRepository.completeSetup(customer.id,{operationId:input.operationId,hash,actorId:actor.userId});return{id:customer.id,code:customer.code};
}};
customerRepository.createAccount=customerOnboardingRepository.create;
