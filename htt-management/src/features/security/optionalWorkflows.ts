/** Product scope, compiled with the application. Original implementations and historical data remain available for a future reviewed release. */
export const optionalWorkflows: Readonly<Record<'onlineCollection'|'electronicPayments'|'remittance'|'directBankSpend'|'bankTransfers'|'manualJournals',boolean>> = Object.freeze({
 onlineCollection:false,electronicPayments:false,remittance:false,directBankSpend:false,bankTransfers:false,manualJournals:false,
});
export function retiredWorkflowPath(path:string):boolean{
 const p=path.replace(/\/+$/,'');
 return !presentationPathEnabled(p)||!optionalWorkflows.bankTransfers&&p==='/banking/transfers/new'||!optionalWorkflows.manualJournals&&p==='/accounting/journals/new'||!optionalWorkflows.electronicPayments&&['/banking/payment-batches','/banking/instruction-files'].some(prefix=>p===prefix||p.startsWith(prefix+'/'));
}
export function assertApprovedDesktopCommand(input:{repository:string;method:string;args:unknown[]}){
 const {repository:r,method:m,args}=input,v=args[0] as Record<string,unknown>|undefined;
 if(!optionalWorkflows.directBankSpend&&(r==='recurringBank'||r==='recurringAutomation'&&v?.kind==='BANK')||!optionalWorkflows.electronicPayments&&['bankInstructions','paymentBatches'].includes(r)||!optionalWorkflows.bankTransfers&&r==='bankTransactions'&&m==='createTransfer'||!optionalWorkflows.directBankSpend&&r==='bankTransactions'&&m==='createTransaction'&&v?.direction!=='MONEY_IN'||!optionalWorkflows.manualJournals&&r==='journals'&&m==='post'||!optionalWorkflows.remittance&&r==='preparedPurchaseOutputs'&&m==='prepare'&&v?.kind==='REMITTANCE')throw Error('This workflow has been removed from the approved application scope. Historical records are preserved.');
}

/** Presentation helpers are retained in source, excluded from the formal interface. */
export const presentationWorkflows=Object.freeze({pageDirectory:false,customerDemo:false});
export function presentationPathEnabled(path:string){let p:string;try{p=decodeURIComponent(path.split(/[?#]/)[0]).replace(/\/+$/,'').toLowerCase();}catch{return false;}return (presentationWorkflows.pageDirectory||p!=='/workspace'&&!p.startsWith('/workspace/'))&&(presentationWorkflows.customerDemo||p!=='/demo'&&!p.startsWith('/demo/'));}
