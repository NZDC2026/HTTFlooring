import { beforeEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { AttachmentDocument, AttachmentView } from '../../attachments/attachmentModel';
const fixture = vi.hoisted(() => ({ view: { documents: [], history: [] } as AttachmentView, read: vi.fn() }));
vi.mock('../../attachments/attachmentClient', () => ({
    useAttachments: () => fixture.view,
    attachmentClient: { getSnapshot: () => fixture.view, targets: vi.fn(), read: fixture.read, change: vi.fn() },
    selectAttachment: vi.fn(), exportAttachment: vi.fn(),
}));
import { DocumentsOverviewPage } from './DocumentsOverviewPage';
import { DocumentDetailPage, DocumentUploadPage } from './DocumentWorkspacePages';
import { AttachmentsPage } from '../../attachments/AttachmentsPage';
const document = (): AttachmentDocument => ({ id: 'actual-document', title: 'Installed flooring evidence', target: { kind: 'Customer', id: 'customer-1' }, targetLabel: 'Actual customer', targetPath: '/contacts/customers/customer-1', canWrite: true, revision: 2, currentVersionId: 'version-2', createdAt: '2026-10-20T01:00:00Z', createdBy: 'actor-1', updatedAt: '2026-10-20T02:00:00Z', updatedBy: 'actor-2', versions: [1, 2].map(n => ({ id: 'version-' + n, number: n, name: `evidence-${n}.txt`, mime: 'text/plain', size: 19, sha256: 'a'.repeat(64), createdAt: '2026-10-20T01:00:00Z', createdBy: 'actor-' + n })) });
function render(path: string) {
    const router = createMemoryRouter([
        { path: '/documents', element: <DocumentsOverviewPage /> },
        { path: '/documents/upload', element: <DocumentUploadPage /> },
        { path: '/documents/attachments', element: <AttachmentsPage /> },
        { path: '/documents/:documentId', element: <DocumentDetailPage /> },
    ], { initialEntries: [path] });
    try { return renderToStaticMarkup(<RouterProvider router={router} />); }
    finally { router.dispose(); }
}
beforeEach(() => { fixture.view = { documents: [document()], history: [] }; fixture.read.mockClear(); });
it('shows the same persisted register at both library URLs with real detail links', () => {
    for (const path of ['/documents', '/documents/attachments']) {
        const html = render(path); expect(html).toContain('Installed flooring evidence'); expect(html).toContain('href="/documents/actual-document"'); expect(html).toContain('evidence-2.txt'); expect(html).not.toContain('Interactive sample'); expect(html).not.toContain('Create sample draft');
    }
});
it('opens a real deep link with all versions and its linked record, without eagerly reading file bytes', () => {
    const html = render('/documents/actual-document');
    expect(html).toContain('Attachment: Installed flooring evidence'); expect(html).toContain('evidence-1.txt'); expect(html).toContain('evidence-2.txt'); expect(html).toContain('Restore v1 as new version'); expect(html).toContain('href="/contacts/customers/customer-1"'); expect(fixture.read).not.toHaveBeenCalled();
});
it('does not expose write actions for a read-only attachment', () => {
    fixture.view.documents[0].canWrite = false; const html = render('/documents/actual-document');
    expect(html).toContain('Export v1'); expect(html).not.toContain('Upload next version'); expect(html).not.toContain('Save document title'); expect(html).not.toContain('Restore v1 as new version'); expect(html).not.toContain('Move attachment to recycle bin');
});
it('shows recovery and version exports for a recycled document while blocking edits', () => {
    fixture.view.documents[0].deletedAt = '2026-10-20T03:00:00Z';
    expect(render('/documents')).not.toContain('Installed flooring evidence');
    const html = render('/documents/actual-document'); expect(html).toContain('Recover attachment'); expect(html).toContain('Export v1'); expect(html).not.toContain('Upload next version'); expect(html).not.toContain('Save document title');
});
it('uses a neutral missing state for inaccessible and obsolete prototype IDs', () => {
    for (const path of ['/documents/DOC-1001', '/documents/missing']) { const html = render(path); expect(html).toContain('Document not found'); expect(html).not.toContain('Installed flooring evidence'); expect(html).not.toContain('Approve sample'); }
});
it('opens the native upload workflow requiring a real business link, title and reason', () => {
    const html = render('/documents/upload'); expect(html).toContain('Upload business document'); expect(html).toContain('Choose file &amp; save attachment'); expect(html).toContain('File or version change reason'); expect(html).not.toContain('type="file"'); expect(html).not.toContain('Create sample draft');
});
it('shows only audit entries belonging to the selected document and escapes user content', () => {
    fixture.view.documents[0].title = '<script>alert(1)</script>';
    fixture.view.history = ['actual-document', 'unrelated-document'].map((id, i) => ({ id: 'event-' + i, documentId: id, operationId: 'op-' + i, action: 'Uploaded', actorId: 'actor-' + i, at: '2026-10-20T01:00:00Z', revision: 1, reason: i ? 'Private unrelated reason' : 'Verified original upload', after: { title: 'Evidence', deleted: false, currentVersionId: 'version-1', versionsCount: 1 } }));
    const html = render('/documents/actual-document'); expect(html).toContain('Verified original upload'); expect(html).not.toContain('Private unrelated reason'); expect(html).toContain('&lt;script&gt;'); expect(html).not.toContain('<script>alert');
});
