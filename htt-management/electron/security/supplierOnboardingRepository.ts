import {createHash} from 'node:crypto';
import {supplierOnboardingInput} from '../../src/features/contacts/supplier-create/supplierOnboardingModel';
import {canSeeSupplierBank} from '../../src/features/contacts/supplier-create/supplierSetup';
import {supplierRepository} from '../../src/features/contacts/data/supplierRepository';
import {trustedAuthorization} from '../../src/features/security/trustedAuthorization';
import {attachmentRepository} from './attachmentRepository';
import {verifyAttachmentFile} from './attachmentFiles';
export const supplierOnboardingRepository={create(raw:unknown){
 const input=supplierOnboardingInput.parse(raw),actor=trustedAuthorization.require('contacts.write'),hash=createHash('sha256').update(JSON.stringify({...input,tasks:input.tasks.map(t=>({...t,ownerName:undefined}))})).digest('hex');
 const prior=supplierRepository.getAll().find(s=>s.creationRequest?.operationId===input.operationId);
 if(prior){if(prior.creationRequest?.hash!==hash||prior.creationRequest.actorId!==actor.userId)throw Error('This creation request has different content.');return{id:prior.id,code:prior.code};}
 if(input.bank&&!canSeeSupplierBank(actor))throw Error('Permission denied: bank details require Admin or Account access.');
 for(const d of input.documents){if(!/\.(pdf|jpe?g|png|xlsx)$/i.test(d.name))throw Error('Use PDF, JPG, PNG or XLSX documents.');verifyAttachmentFile(d.name,d.content,20000000);}
 const values=input.supplier;if(values.country!=='Australia'&&values.taxRegistered)throw Error('Overseas suppliers must not charge Australian GST.');
 const created=supplierRepository.create(values);
 for(const text of input.notes)supplierRepository.addActivity({supplierId:created.id,operationId:crypto.randomUUID(),kind:'Note',text});
 for(const task of input.tasks)supplierRepository.addSetupTask(created.id,task,crypto.randomUUID());
 for(const [i,file] of input.documents.entries())attachmentRepository.upload({operationId:input.operationId+':document:'+i,expectedRevision:0,target:{kind:'Supplier',id:created.id},title:file.name,reason:'Supplier account setup',file});
 supplierRepository.completeSetup(created.id,{operationId:input.operationId,hash,actorId:actor.userId},input.bank);
 return{id:created.id,code:created.code};
}};
supplierRepository.createAccount=supplierOnboardingRepository.create;
