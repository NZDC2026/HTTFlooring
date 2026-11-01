import type { SecurityReply } from './securityContract';
export const isWeb = import.meta.env.VITE_WEB_ONLY === '1';
export function downloadWebFile(value: unknown, name: string, type = 'application/json'): void {
    const blob = value instanceof Blob ? value : new Blob([JSON.stringify(value, null, 2)], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
if (isWeb && !window.securityBridge) {
    window.securityBridge = {
        request(action, input): SecurityReply {
            // Compatibility transport for the existing synchronous repository contract.
            // All authentication, permission checks and commits happen on the server.
            try {
                const request = new XMLHttpRequest();
                request.open('POST', '/api/security', false);
                request.setRequestHeader('Content-Type', 'application/json');
                request.setRequestHeader('X-HTT-Request', '1');
                request.send(JSON.stringify({ action, input }));
                const reply = JSON.parse(request.responseText) as SecurityReply;
                if (reply.ok && action === 'business.backup.save') {
                    const value = reply.value as { download: unknown; name: string };
                    downloadWebFile(value.download, value.name);
                }
                if (reply.ok && (action === 'attachments.export' || action === 'capture.export')) {
                    const value = reply.value as { download: { name: string; content: string } };
                    const bytes = Uint8Array.from(atob(value.download.content), c => c.charCodeAt(0));
                    downloadWebFile(new Blob([bytes]), value.download.name);
                }
                return reply;
            } catch { return { ok: false, error: 'Cannot reach the web service. Start it with pnpm dev:web or pnpm start:web.' }; }
        },
    };
}

export async function chooseWebFile(accept: string): Promise<{ name: string; content: string; text: string } | undefined> {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = accept;
    const file = await new Promise<File | undefined>(resolve => {
        input.addEventListener('change', () => resolve(input.files?.[0]), { once: true });
        input.addEventListener('cancel', () => resolve(undefined), { once: true });
        input.click();
    });
    if (!file) return undefined;
    if (file.size > 10 * 1024 * 1024) throw new Error('Choose a file no larger than 10 MB.');
    const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Cannot read the selected file.'));
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return { name: file.name, content, text: await file.text() };
}
