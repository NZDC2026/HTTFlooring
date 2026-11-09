import type {ManagedDraft} from '../direct-documents/managedDocumentRepository';
let listener:((draft:ManagedDraft)=>void)|undefined;
export function onProcurementExpenseDraftChange(callback:(draft:ManagedDraft)=>void){listener=callback;}
export function notifyProcurementExpenseDraftChange(draft:ManagedDraft){listener?.(draft);}
