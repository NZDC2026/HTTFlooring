import { useParams, type RouteObject } from 'react-router-dom';
import { useSecurity } from '../security/securityClient';
import { hasPermission, type Permission } from '../security/rbac';
import { previewModules, settingsForms, flowPages } from './catalog';
import { DirectoryPage, ModuleList, ModuleForm, ModuleDetail, SettingsPreview } from './PreviewWorkspace';
import { DocumentEditor, ReceiptRefund, RecycleBin, ImportWizard, BankWorkbench, OpeningBalances, OperationalReport, Attachments, Delivery, CaptureReview, EntitySearch } from './PreviewFlows';
import type { ReactNode } from 'react';
export function PreviewAccess({ permission, children }: { permission: Permission; children: ReactNode }) {
 const { session } = useSecurity(), principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const };
 return hasPermission(principal, permission) ? children : <div role="alert" className="rounded-xl border bg-white p-6">Your role does not have access to this preview workspace.</div>;
}
function ModuleRoute({ moduleId, mode }: { moduleId: string; mode: 'list' | 'new' | 'edit' | 'detail' }) {
 const { previewId } = useParams(), m = previewModules.find(m => m.id === moduleId)!;
 return <PreviewAccess permission={m.permission}>{mode === 'list' ? <ModuleList key={m.id} module={m} /> : mode === 'detail' ? <ModuleDetail key={`${m.id}/${previewId}`} module={m} id={previewId!} /> : <ModuleForm key={`${m.id}/${mode}/${previewId}`} module={m} id={mode === 'edit' ? previewId : undefined} />}</PreviewAccess>;
}
function FlowRoute({ id }: { id: string }) {
 const { previewId } = useParams();
 const flow = flowPages.find(f => f[0] === id)!;
 let node: ReactNode;
 if (['sales-order', 'sales-order-edit', 'invoice', 'invoice-edit', 'bill', 'bill-edit'].includes(id)) node = <DocumentEditor key={id + previewId} kind={id.startsWith('sales-order') ? 'order' : id.startsWith('invoice') ? 'invoice' : 'bill'} id={id.endsWith('edit') ? previewId : undefined} />;
 else if (id.startsWith('receipt') || id.startsWith('customer-refund') || id.startsWith('supplier-refund')) node = <ReceiptRefund key={id + previewId} kind={id.startsWith('receipt') ? 'receipt' : id.startsWith('customer') ? 'customer-refund' : 'supplier-refund'} mode={id.endsWith('-new') ? 'new' : id.endsWith('-detail') ? 'detail' : 'list'} id={previewId} />;
 else if (id === 'recycle-bin') node = <RecycleBin />;
 else if (id === 'bank-import' || id === 'import-export') node = <ImportWizard key={id} bank={id === 'bank-import'} />;
 else if (id === 'bank-workbench') node = <BankWorkbench />;
 else if (id === 'opening-balances') node = <OpeningBalances />;
 else if (id === 'attachments') node = <Attachments />;
 else if (id === 'delivery') node = <Delivery />;
 else if (id === 'ocr') node = <CaptureReview />;
 else if (id === 'entity-search') node = <EntitySearch />;
 else node = <OperationalReport key={id} kind={id} title={flow[2]} />;
 return <PreviewAccess permission={flow[4]}>{node}</PreviewAccess>;
}
export const additionalRoutes: RouteObject[] = [
 { path: 'workspace', element: <DirectoryPage /> },
 ...previewModules.flatMap(m => [
  { path: m.path.slice(1), element: <ModuleRoute moduleId={m.id} mode="list" /> },
  { path: `${m.path.slice(1)}/new`, element: <ModuleRoute moduleId={m.id} mode="new" /> },
  { path: `${m.path.slice(1)}/:previewId`, element: <ModuleRoute moduleId={m.id} mode="detail" /> },
  { path: `${m.path.slice(1)}/:previewId/edit`, element: <ModuleRoute moduleId={m.id} mode="edit" /> },
 ]),
 ...flowPages.map(f => ({ path: f[1].slice(1), element: <FlowRoute id={f[0]} /> })),
 ...Object.keys(settingsForms).map(section => ({ path: `settings/${section === 'business' ? 'financial' : section}`, element: <PreviewAccess permission="accounting.read"><SettingsPreview key={section} section={section} /></PreviewAccess> })),
];
