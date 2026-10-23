import {previewModules,flowPages,settingsForms} from './catalog';
import type {Permission} from '../security/rbac';
export type DirectoryEntry={path:string;name:string;group:string;permission:Permission;description:string};
const extras:DirectoryEntry[]=[
 {path:'/payroll/transmissions',name:'Payroll transmissions',group:'Payroll',permission:'payroll.read',description:'Internal AU STP and super preparation, immutable review reports and connector recovery. Production adapter pending.'},
 {path:'/banking/feeds',name:'Bank feeds',group:'Banking',permission:'banking.read',description:'Configurable Basiq AU consent, account mapping, runtime sync and reviewed statement imports.'},
 {path:'/documents/communications',name:'Communications & online collection',group:'Documents & imports',permission:'sales.read',description:'Configurable Resend / Stripe adapters, runtime reminders and verified receipt confirmation.'},
 {path:'/purchases/prepayments',name:'Supplier prepayments',group:'Sales & purchases',permission:'purchases.read',description:'Local supplier advances, application, refund and reconciliation.'},
 {path:'/sales/customer-returns',name:'Physical customer returns',group:'Sales & purchases',permission:'inventory.cost.read',description:'Reviewed physical returns with source, inventory and credit controls.'},
 {path:'/sales/customer-deposits',name:'Customer deposits & prepayments',group:'Sales & purchases',permission:'sales.read',description:'Local customer deposits, application and refund controls.'},
 {path:'/purchases/supplier-returns',name:'Physical supplier returns',group:'Sales & purchases',permission:'purchases.return.read',description:'Local supplier return dispatch and credit/reversal controls.'},
 {path:'/inventory/sales-dispatch',name:'Sales dispatch & fulfilments',group:'Inventory & pricing',permission:'inventory.read',description:'Local authorised fulfilment against sales sources.'},
];
const descriptions:Record<string,string>={
 ocr:'macOS English PDF/image recognition; preserve originals, manually review and create expense drafts. Windows uses manual/CSV.',
 delivery:'Prepare immutable sales document versions and local HTML/PDF; no email transmission.',
 attachments:'Store actual local files with version history and linked-record permissions.',
 'bank-instructions':'CommBank/CommBiz ABA preparation and independent approval; does not execute bank payment.',
 'bank-import':'Local statement CSV import, duplicate review and matching; no connected bank feed.',
 'payroll-report':'Australian local payroll summary; no electronic ATO submission.',
};
export const directoryEntries:DirectoryEntry[]=[...extras,...previewModules.map(m=>({path:m.path,name:m.title,group:m.group,permission:m.permission,description:m.description})),...flowPages.filter(f=>!f[1].includes(':')).map(f=>({path:f[1],name:f[2],group:f[3],permission:f[4],description:descriptions[f[0]]??'Local business workflow; use this page’s source, review and permission controls.'})),...Object.values(settingsForms).map(s=>({path:s.path,name:s.title,group:'Settings',permission:s.permission,description:s.description}))];
