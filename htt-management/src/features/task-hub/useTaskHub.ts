import {useWorkspaceRecords,workspaceRepositories,configurationHistory} from '../business-workspace/workspaceRepository';
import {useCustomers} from '../contacts/data/useCustomers';
import {useSuppliers} from '../contacts/data/useSuppliers';
import {usePermission} from '../security/usePermission';
import {supplierRepository} from '../contacts/data/supplierRepository';
import {taskHubRows,type HubTask} from './taskHubModel';
export function useTaskHub(){
 const records=useWorkspaceRecords('tasks'),customers=useCustomers(),suppliers=useSuppliers(),readPurchases=usePermission('purchases.read');
 const rows=taskHubRows(records,customers,readPurchases?suppliers:[]);
 return {rows,customers,suppliers:readPurchases?suppliers:[],history:configurationHistory.tasks??[]};
}
export function completeHubTask(task:HubTask){
 if(task.source==='sample')throw Error('Sample records cannot be written.');
 if(task.source==='supplier')return supplierRepository.activityAction({supplierId:task.accountId,activityId:task.activityId,operationId:crypto.randomUUID(),action:'complete',text:'Marked completed in Tasks & Action Centre.'});
 return workspaceRepositories.tasks.setStatus(task.id,'Completed',task.row!.revision);
}
export function replyHubTask(task:HubTask,text:string){
 if(task.source==='sample')throw Error('Sample records cannot be written.');
 if(task.source==='supplier')return supplierRepository.activityAction({supplierId:task.accountId,activityId:task.activityId,operationId:crypto.randomUUID(),action:'reply',text});
 return workspaceRepositories.tasks.addNote(task.id,text);
}
