import {useEffect} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {Bell, Search, Download, CircleHelp, LogOut} from 'lucide-react';
import {useActionCentre} from '../features/action-centre/ActionCentrePage';
import {useSecurity, logout} from '../features/security/securityClient';
import {isWeb, publicPreview} from '../features/security/webBridge';
import {useWorkspacePreviewRole, workspacePreviewRoles, type WorkspacePreviewRole} from './workspacePreview';
import './workspace-topbar.css';

export function Topbar() {
 const {items} = useActionCentre(), {session} = useSecurity();
 const location = useLocation(), navigate = useNavigate();
 const sample = publicPreview || new URLSearchParams(location.search).get('sample') === '1';
 const actual: WorkspacePreviewRole = session?.user.roles.includes('ADMIN') ? 'Admin' : session?.user.roles.some(r => r === 'ACCOUNTANT' || r === 'FINANCE_ADMIN') ? 'Account' : session?.user.roles.includes('WAREHOUSE') ? 'Warehouse' : session?.user.roles.includes('SALES') ? 'Sales' : 'Front desk';
 const [role, selectRole] = useWorkspacePreviewRole(sample, actual);
 const search = () => navigate('/search' + (sample ? '?sample=1' : ''));
 useEffect(() => {
  const shortcut = (event: KeyboardEvent) => {
   const typing = event.target instanceof HTMLElement && (event.target.matches('input,textarea,select') || event.target.isContentEditable);
   if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !typing)) {event.preventDefault(); navigate('/search' + (sample ? '?sample=1' : ''));}
  };
  window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut);
 }, [navigate, sample]);
 const name = sample ? 'Ray' : session?.user.displayName ?? 'Signed out';
 return <header className="workspace-topbar fixed" aria-label="Workspace toolbar">
  <button data-ui="button" className="workspace-global-search" aria-label="Search workspace" onClick={search}><Search size={16}/><span>Search customers, orders, products, suppliers</span><kbd>/</kbd></button>
  <div className="workspace-role-preview"><span>{sample ? 'Preview as' : 'Workspace'}{sample && <small className="workspace-sample-label">Sample · Read-only</small>}</span><div role="group" aria-label={sample ? 'Sample role preview' : 'Current workspace role'}>{workspacePreviewRoles.map(r => <button data-ui="button" key={r} aria-pressed={(sample ? role : actual) === r} disabled={!sample} onClick={() => selectRole(r)}>{r}</button>)}</div></div>
  <div className="workspace-user-tools"><details className="workspace-user-menu"><summary aria-label="User menu"><span className="workspace-avatar">{name.charAt(0).toUpperCase()}</span><span><b>{name}</b><small>{sample ? role : actual}</small></span></summary><nav><Link to="/settings/security">Account settings</Link><Link to="/help"><CircleHelp size={15}/>Help</Link>{isWeb && <a href="/downloads/index.html"><Download size={15}/>Download desktop app</a>}<button onClick={logout}><LogOut size={15}/>Sign out</button></nav></details><Link className="workspace-notifications" to={"/notifications" + (sample ? "?sample=1" : "")} aria-label="Notifications" title={sample ? 'Sample · Read-only preview' : `${items.length} current actions`}><Bell size={19}/>{(sample || items.length > 0) && <span>{sample ? 2 : items.length > 99 ? '99+' : items.length}</span>}</Link></div>
 </header>;
}
