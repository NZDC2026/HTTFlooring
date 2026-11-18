import {Settings} from 'lucide-react';
import {Link, useLocation} from 'react-router-dom';
import {useSecurity} from '../features/security/securityClient';
import {publicPreview} from '../features/security/webBridge';
import {sidebarActivePath, sidebarNavigation, sidebarWorkspaceRole} from './sidebarNavigation';
import {useWorkspacePreviewRole} from './workspacePreview';
import './workspace-sidebar.css';

export function Sidebar() {
  const {session} = useSecurity(), {pathname,search} = useLocation();
  const sample = publicPreview || new URLSearchParams(search).get('sample') === '1';
  const [role] = useWorkspacePreviewRole(sample, sidebarWorkspaceRole(session?.user.roles ?? []));
  const principal = session ? {userId:session.user.id,roles:session.user.roles,authenticated:true as const} : null;
  const groups = sidebarNavigation(role,sample,principal), active = sidebarActivePath(pathname);
  const target = (path:string) => path + (sample ? '?sample=1' : '');
  return <aside className="htt-sidebar workspace-sidebar fixed bottom-0 left-0 top-0 z-30 flex w-[var(--sidebar-width)] flex-col" data-workspace-role={role}>
    <Link className="workspace-brand" to={target('/dashboard')}><i aria-hidden="true"/><div><strong>HTT Flooring</strong><small>MANAGEMENT SYSTEM</small></div></Link>
    <nav aria-label="Main navigation">{groups.map(group=><section key={group.label}>
      {group.label && <h2>{group.label}</h2>}
      {group.items.map(({label,path,icon:Icon})=><Link key={path} to={target(path)} aria-current={active===path?'page':undefined}><Icon size={19} strokeWidth={1.8}/><span>{label}</span></Link>)}
    </section>)}</nav>
    <Link className="workspace-settings" to={target('/settings')} aria-current={pathname==='/settings'||pathname.startsWith('/settings/')?'page':undefined}><Settings size={20}/>Settings</Link>
  </aside>;
}
