export interface CreditHoldCustomer {id:string;businessName:string;code:string;status:string;creditHold?:boolean}
export const isCustomerCreditHeld=(customer:Pick<CreditHoldCustomer,'status'|'creditHold'>|undefined)=>!!customer&&(customer.status==='ON_HOLD'||customer.creditHold===true);
export const creditHoldMessage=(customer:CreditHoldCustomer,action:string)=>`${customer.businessName} (${customer.code})\n\nThis customer is Credit On Hold.\nOperation: ${action}\n\nCheck with accounts before proceeding. New orders remain blocked while the hold is active.`;
const documentRepositories=new Set(['sales','managedSalesDocuments','preparedSalesOutputs','customerSettlements','customerDeposits','physicalCustomerReturns','salesDispatch']);
type ObjectRow=Record<string,unknown>;
const object=(v:unknown):v is ObjectRow=>!!v&&typeof v==='object'&&!Array.isArray(v);
function findRecord(value:unknown,id:string,depth=0):ObjectRow|undefined {
 if(depth>5||!value||typeof value!=='object')return;
 if(object(value)&&value.id===id)return value;
 for(const child of Object.values(value)){const found=findRecord(child,id,depth+1);if(found)return found;}
}
function directCustomer(value:unknown,depth=0):string|undefined {
 if(depth>4||!value||typeof value!=='object')return;
 if(object(value)&&typeof value.customerId==='string'&&value.customerId)return value.customerId;
 for(const child of Object.values(value)){const found=directCustomer(child,depth+1);if(found)return found;}
}
export function commandCustomerId(repository:string,method:string,args:unknown[],snapshots:Record<string,unknown>):string|undefined {
 if(!documentRepositories.has(repository)||['setupDefaults','balance','getAll','getById'].includes(method))return;
 const direct=directCustomer(args);if(direct)return direct;
 const input=object(args[0])?args[0]:undefined;
 const id=typeof args[0]==='string'?args[0]:input&&['id','sourceId','invoiceId','orderId','quoteId','creditNoteId','receiptId','depositId','salesOrderId','sourceInvoiceId','customerCreditId','returnId'].map(k=>input[k]).find(v=>typeof v==='string');
 if(typeof id!=='string')return;
 // Resolve in the originating repository first; source-based commands then use sales/credits.
 for(const name of [repository,'sales','customerCredits','customerSettlements','customerDeposits','physicalCustomerReturns']){
  const row=findRecord(snapshots[name],id);if(!row)continue;
  const customer=directCustomer(row);if(customer)return customer;
 }
}
export function noticeCustomer(id:string|undefined,snapshots:Record<string,unknown>):CreditHoldCustomer|undefined {
 const state=snapshots.customers as {customers?:CreditHoldCustomer[]}|undefined;
 const customer=state?.customers?.find(c=>c.id===id);return isCustomerCreditHeld(customer)?customer:undefined;
}
export function showCreditHoldNotice(customer:CreditHoldCustomer|undefined,action:string){
 if(customer&&isCustomerCreditHeld(customer)&&typeof window!=='undefined')window.alert(creditHoldMessage(customer,action));
}

export function documentActionLabel(repository:string,method:string){
 if(repository==='preparedSalesOutputs')return 'Prepare printable document';
 if(method==='save'||method.startsWith('create'))return 'Create / edit customer document';
 if(method==='post'||method==='convertQuoteToOrder'||method==='createInvoiceFromOrder')return 'Convert / issue customer document';
 return 'Process customer document';
}
