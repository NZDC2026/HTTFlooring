import {AttachmentsPage} from '../attachments/AttachmentsPage';
import {JobCostingPage} from '../job-costing/JobCostingPage';
import { ContactReviewPage } from '../contact-review/ContactReviewPage';
import { BillCapturePage } from '../bill-capture/BillCapturePage';
import { VisitsPage } from '../sales-visits/VisitsPage';
import { RecurringPage } from '../recurring/RecurringPage';
import { RecordSearchPage } from '../record-search/RecordSearchPage';
import { SavedReportsPage } from '../saved-reports/SavedReportsPage';
import { ReportPacksPage } from '../report-packs/ReportPacksPage';
import { NetAnalysisPage } from '../net-analysis/NetAnalysisPage';
import { CashReportsPage } from '../cash-reports/CashReportsPage';
import { SupplierReturnsPage } from '../supplier-returns/SupplierReturnsPage';
import { OutputPage } from '../document-output/OutputPage';
import {ManagedDocumentPage} from '../direct-documents/ManagedDocumentPages';
import {DispatchPage} from '../direct-documents/DispatchPage';
import {FinancialSettingsPage,OpeningBalancesPage} from '../finance-foundation/FoundationPages';
import {TaxSummaryPage} from '../finance-foundation/TaxSummaryPage';
import { PaymentBatchPage } from '../finance-closure/PaymentBatchPage';
import { SettlementPage } from '../finance-closure/SettlementPages';
import { BankAccountSetupPage, BankClosurePage } from '../finance-closure/BankClosurePages';
import { ConnectedBankWorkbench } from '../business-workspace/OperationalDataPages';
import { ProductBusinessPage, ConfigurationBusinessPage, connectedModules } from '../business-workspace/MasterDataPages';
import { useParams, type RouteObject } from 'react-router-dom';
import { useSecurity } from '../security/securityClient';
import { hasPermission, type Permission } from '../security/rbac';
import { previewModules, settingsForms, flowPages } from './catalog';
import { DirectoryPage, ModuleList, ModuleForm, ModuleDetail, SettingsPreview } from './PreviewWorkspace';
import { ReceiptRefund, RecycleBin, ImportWizard, BankWorkbench, OperationalReport } from './PreviewFlows';
import type { ReactNode } from 'react';
export function PreviewAccess({ permission, children }: { permission: Permission; children: ReactNode }) {
 const { session } = useSecurity(), principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const };
 return hasPermission(principal, permission) ? children : <div role="alert" className="rounded-xl border bg-white p-6">Your role does not have access to this preview workspace.</div>;
}
function ModuleRoute({ moduleId, mode }: { moduleId: string; mode: 'list' | 'new' | 'edit' | 'detail' }) {
 const { previewId } = useParams(), m = previewModules.find(m => m.id === moduleId)!;
 if(m.id==='jobs')return <PreviewAccess permission={m.permission}><JobCostingPage key={`${mode}/${previewId}`} mode={mode} id={previewId}/></PreviewAccess>;
 if(m.id==='draft-review')return <PreviewAccess permission={m.permission}><ContactReviewPage key={`${mode}/${previewId}`} mode={mode} id={previewId}/></PreviewAccess>;
 if(m.id==='visits')return <PreviewAccess permission={m.permission}><VisitsPage key={`${mode}/${previewId}`} mode={mode} id={previewId}/></PreviewAccess>;
 if(m.id==='recurring')return <PreviewAccess permission={m.permission}><RecurringPage key={`${mode}/${previewId}`} mode={mode} id={previewId}/></PreviewAccess>;
 if(m.id==='custom-reports')return <PreviewAccess permission={m.permission}><SavedReportsPage key={`${mode}/${previewId}`} mode={mode} id={previewId}/></PreviewAccess>;
 if(m.id==='report-packs')return <PreviewAccess permission={m.permission}><ReportPacksPage key={`${mode}/${previewId}`} mode={mode} id={previewId}/></PreviewAccess>;
 if(m.id==='payment-batches')return <PreviewAccess permission={m.permission}><PaymentBatchPage key={`${mode}/${previewId}`} mode={mode} id={previewId}/></PreviewAccess>;
 if(m.id==='bank-accounts')return <PreviewAccess permission={m.permission}><BankAccountSetupPage key={`${mode}/${previewId}`} mode={mode} id={previewId}/></PreviewAccess>;
 if(connectedModules.has(m.id))return <PreviewAccess permission={m.permission}>{m.id==='products'?<ProductBusinessPage key={`${m.id}/${mode}/${previewId}`} mode={mode} id={previewId}/>:<ConfigurationBusinessPage key={`${m.id}/${mode}/${previewId}`} domain={m.id} path={m.path} title={m.title} mode={mode} id={previewId}/>}</PreviewAccess>;
 return <PreviewAccess permission={m.permission}>{mode === 'list' ? <ModuleList key={m.id} module={m} /> : mode === 'detail' ? <ModuleDetail key={`${m.id}/${previewId}`} module={m} id={previewId!} /> : <ModuleForm key={`${m.id}/${mode}/${previewId}`} module={m} id={mode === 'edit' ? previewId : undefined} />}</PreviewAccess>;
}
function FlowRoute({ id }: { id: string }) {
 const { previewId } = useParams();
 const flow = flowPages.find(f => f[0] === id)!;
 let node: ReactNode;
 if(id==='bank-import'||id==='bank-workbench') node=<BankClosurePage key={id} importOnly={id==='bank-import'}/>;
 else if(id.startsWith('receipt')||id.startsWith('customer-refund')||id.startsWith('supplier-refund'))node=<SettlementPage key={id+previewId} kind={id.startsWith('receipt')?'receipt':id.startsWith('customer')?'customer-refund':'supplier-refund'} mode={id.endsWith('-new')?'new':id.endsWith('-detail')?'detail':'list'} id={previewId}/>;
 else if (id==='cash-flow'||id==='banking-report') node=<CashReportsPage key={id} banking={id==='banking-report'}/>;
 else if (['sales-report','purchases-report'].includes(id)) node = <NetAnalysisPage key={id} purchases={id==='purchases-report'}/>;
 else if(id==='bank-workbench') node=<ConnectedBankWorkbench/>;
 else if (['sales-order', 'sales-order-edit', 'invoice', 'invoice-edit', 'bill', 'bill-edit'].includes(id)) node = <ManagedDocumentPage key={id+previewId} kind={id.startsWith('sales-order')?'ORDER':id.startsWith('invoice')?'INVOICE':'EXPENSE'} mode={id.endsWith('edit')?'edit':'new'} id={previewId}/>;
 else if (id.startsWith('receipt') || id.startsWith('customer-refund') || id.startsWith('supplier-refund')) node = <ReceiptRefund key={id + previewId} kind={id.startsWith('receipt') ? 'receipt' : id.startsWith('customer') ? 'customer-refund' : 'supplier-refund'} mode={id.endsWith('-new') ? 'new' : id.endsWith('-detail') ? 'detail' : 'list'} id={previewId} />;
 else if (id === 'recycle-bin') node = <RecycleBin />;
 else if (id === 'bank-import' || id === 'import-export') node = <ImportWizard key={id} bank={id === 'bank-import'} />;
 else if (id === 'bank-workbench') node = <BankWorkbench />;
 else if (id === 'opening-balances') node = <OpeningBalancesPage />;
 else if (id === 'attachments') node = <AttachmentsPage />;
 else if (id === 'delivery') node = <OutputPage />;
 else if (id === 'ocr') node = <BillCapturePage />;
 else if (id === 'entity-search') node = <RecordSearchPage />;
 else node = <OperationalReport key={id} kind={id} title={flow[2]} />;
 return <PreviewAccess permission={flow[4]}>{node}</PreviewAccess>;
}
function ManagedDetail({kind,permission}:{kind:'ORDER'|'INVOICE'|'EXPENSE';permission:Permission}){const {previewId}=useParams();return <PreviewAccess permission={permission}><ManagedDocumentPage key={previewId} kind={kind} mode="detail" id={previewId}/></PreviewAccess>;}
export const additionalRoutes: RouteObject[] = [
 {path:"purchases/supplier-returns",element:<PreviewAccess permission="purchases.return.read"><SupplierReturnsPage/></PreviewAccess>},
 {path:'inventory/sales-dispatch',element:<PreviewAccess permission="inventory.read"><DispatchPage/></PreviewAccess>},
 ...([{path:'sales/drafts/orders',kind:'ORDER',permission:'sales.read'},{path:'sales/drafts/invoices',kind:'INVOICE',permission:'sales.read'},{path:'purchases/expense-bills',kind:'EXPENSE',permission:'purchases.read'}] as const).flatMap(m=>[{path:m.path,element:<PreviewAccess permission={m.permission}><ManagedDocumentPage key={m.kind+'list'} kind={m.kind} mode="list"/></PreviewAccess>},{path:m.path+'/:previewId',element:<ManagedDetail kind={m.kind} permission={m.permission}/>}]),
 {path:'reports/tax-summary',element:<PreviewAccess permission="accounting.read"><TaxSummaryPage/></PreviewAccess>},
 { path: 'workspace', element: <DirectoryPage /> },
 ...previewModules.flatMap(m => [
  { path: m.path.slice(1), element: <ModuleRoute moduleId={m.id} mode="list" /> },
  { path: `${m.path.slice(1)}/new`, element: <ModuleRoute moduleId={m.id} mode="new" /> },
  { path: `${m.path.slice(1)}/:previewId`, element: <ModuleRoute moduleId={m.id} mode="detail" /> },
  { path: `${m.path.slice(1)}/:previewId/edit`, element: <ModuleRoute moduleId={m.id} mode="edit" /> },
 ]),
 ...flowPages.map(f => ({ path: f[1].slice(1), element: <FlowRoute id={f[0]} /> })),
 ...Object.keys(settingsForms).map(section => ({ path: `settings/${section === 'business' ? 'financial' : section}`, element: <PreviewAccess permission="accounting.read">{['business','sales','purchases','reports'].includes(section)?<FinancialSettingsPage key={section}/>:<SettingsPreview key={section} section={section} />}</PreviewAccess> })),
];
