import {useEffect, useState} from 'react';
export const workspacePreviewRoles = ['Admin', 'Account', 'Front desk', 'Sales', 'Warehouse'] as const;
export type WorkspacePreviewRole = typeof workspacePreviewRoles[number];
let currentRole: WorkspacePreviewRole | undefined;
export function useWorkspacePreviewRole(enabled: boolean, fallback: WorkspacePreviewRole) {
  const [role, setRole] = useState<WorkspacePreviewRole>(() => enabled ? currentRole ?? fallback : fallback);
  useEffect(() => {
    if (!enabled) return;
    const sync = () => setRole(currentRole ?? fallback);
    sync(); window.addEventListener('htt:preview-role', sync);
    return () => window.removeEventListener('htt:preview-role', sync);
  }, [enabled, fallback]);
  const select = (next: WorkspacePreviewRole) => {
    setRole(next);
    if (enabled) { currentRole = next; window.dispatchEvent(new Event('htt:preview-role')); }
  };
  return [enabled ? role : fallback, select] as const;
}
