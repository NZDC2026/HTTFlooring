import { useParams } from 'react-router-dom';
import { AttachmentsPage } from '../../attachments/AttachmentsPage';
export function DocumentUploadPage() { return <AttachmentsPage mode="upload" />; }
export function DocumentDetailPage() {
    const { documentId } = useParams();
    return <AttachmentsPage key={documentId} mode="detail" documentId={documentId} />;
}
