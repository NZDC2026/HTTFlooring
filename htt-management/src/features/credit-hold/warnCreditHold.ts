import { nativeRequest, hydrateBusiness, snapshotRepositories } from "../security/repositoryHost";
import type { BusinessView } from "../security/securityContract";
import { noticeCustomer, showCreditHoldNotice } from "./creditHoldNotice";
/** Recheck the live account before printing/exporting an already-prepared copy. */
export function warnCreditHold(customerId:string,action:string){
 if(typeof window==='undefined')return;
 if(window.securityBridge)hydrateBusiness(nativeRequest<BusinessView>('business.view'));
 showCreditHoldNotice(noticeCustomer(customerId,snapshotRepositories(['customers'])),action);
}
