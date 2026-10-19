import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BusinessFrame } from '../../business-workspace/MasterDataPages';
import { Panel, Field, fieldClass, buttonClass } from '../../prototype/PrototypeUI';
import { useSecurity } from '../../security/securityClient';
import { hasPermission } from '../../security/rbac';
import { defaultPreferences, landingPages, personalPreferenceStore, type PersonalPreferences } from '../data/personalPreferences';
import { usePersonalPreferences } from '../data/usePersonalPreferences';
export function PersonalPreferencesPage() {
    const { session } = useSecurity(), userId = session?.user.id ?? '';
    const saved = usePersonalPreferences(userId);
    return <PreferencesForm key={userId} userId={userId} initial={saved} />;
}
function PreferencesForm({ userId, initial }: { userId: string; initial: PersonalPreferences }) {
    const { session } = useSecurity(), principal = session && { userId: session.user.id, roles: session.user.roles, authenticated: true as const };
    const [draft, setDraft] = useState(initial), [notice, setNotice] = useState(''), [error, setError] = useState('');
    const save = (values: PersonalPreferences) => {
        try { const result = personalPreferenceStore().save(userId, values); setDraft(result); setError(''); setNotice('Personal preferences saved on this device.'); }
        catch (e) { setNotice(''); setError((e as Error).message); }
    };
    return <BusinessFrame title="Personal preferences" description="Personal display choices saved for this account on this device."><nav className="flex flex-wrap gap-3"><Link className={buttonClass} to="/settings">Company settings</Link><Link className={buttonClass} to="/settings/integrations">Local capabilities & integrations</Link><Link className={buttonClass} to="/settings/roles">Role policy</Link></nav><p>These preferences apply to your signed-in account on this device. They survive app restarts and are separate from business backups. Business dates, document values and other users’ preferences are unchanged.</p>{notice && <p role="status">{notice}</p>}{error && <p role="alert" className="text-red-700">{error}</p>}<Panel title="Workspace display"><form className="grid gap-4 md:grid-cols-2" onSubmit={e => { e.preventDefault(); save(draft); }}><Field label="Home after sign-in"><select className={fieldClass} value={draft.landingPage} onChange={e => setDraft({ ...draft, landingPage: e.target.value as PersonalPreferences['landingPage'] })}>{landingPages.filter(p => !p.permission || hasPermission(principal, p.permission) || p.path === draft.landingPage).map(p => <option key={p.path} value={p.path} disabled={!!p.permission && !hasPermission(principal, p.permission)}>{p.label}{p.permission && !hasPermission(principal, p.permission) ? ' (currently unavailable)' : ''}</option>)}</select></Field><Field label="Table density"><select className={fieldClass} value={draft.density} onChange={e => setDraft({ ...draft, density: e.target.value as PersonalPreferences['density'] })}><option>Comfortable</option><option>Compact</option></select></Field><label className="flex items-center gap-2"><input type="checkbox" checked={draft.reduceMotion} onChange={e => setDraft({ ...draft, reduceMotion: e.target.checked })}/>Reduce interface motion</label><p className="text-sm">An unavailable home page falls back to a workspace permitted by your current role. Direct document links remain open after sign-in. The operating system’s reduced-motion setting is also respected.</p><button className={buttonClass} disabled={!userId}>Save personal preferences</button></form></Panel><Panel title="Restore display defaults"><p>Use the automatic home page, comfortable tables and your system motion preference.</p><button className={buttonClass} disabled={!userId} onClick={() => save(defaultPreferences)}>Restore my display defaults</button></Panel></BusinessFrame>;
}
