import { isWeb, chooseWebFile } from '../security/webBridge';
import { useSyncExternalStore } from 'react';
import { registerRepository, nativeRequest, hydrateBusiness } from '../security/repositoryHost';
import type { BusinessView } from '../security/securityContract';
import type { AttachmentView } from './attachmentModel';
let state: AttachmentView = { documents: [], history: [] };
const listeners = new Set<() => void>();
export const attachmentClient = { subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }, getSnapshot: () => state,
    targets(): {
        kind: import('./attachmentModel').AttachmentTarget['kind'];
        id: string;
        label: string;
        canWrite: boolean;
        path: string;
    }[] { throw new Error('Secure desktop required.'); },
    change(_input: unknown): unknown { throw new Error('Secure desktop required.'); },
    read(_input: unknown): {
        name: string;
        mime: string;
        content: string;
        size: number;
        sha256: string;
    } { throw new Error('Secure desktop required.'); }
};
registerRepository('attachments', { repository: attachmentClient, read: 'inventory.read', commands: { targets: 'inventory.read', change: 'inventory.read', read: 'inventory.read' }, snapshot: () => state, restore: v => { state = v; }, publish: () => listeners.forEach(fn => fn()) });
export const useAttachments = () => useSyncExternalStore(attachmentClient.subscribe, attachmentClient.getSnapshot, attachmentClient.getSnapshot);
export async function selectAttachment(input: Record<string, unknown>) {
    if (isWeb) {
        const file = await chooseWebFile(".pdf,.png,.jpg,.jpeg,.csv,.txt,.docx,.xlsx");
        if (!file) return false;
        input = { ...input, file: { name: file.name, content: file.content } };
    }
    const reply = nativeRequest<{
        saved: boolean;
        view?: BusinessView;
    }>('attachments.select', input);
    if (reply.view)
        hydrateBusiness(reply.view);
    return reply.saved;
}
export function exportAttachment(id: string, versionId: string) {
    return nativeRequest<{
        saved: boolean;
    }>('attachments.export', { id, versionId }).saved;
}
