import { it, expect } from 'vitest';
import { verifyAttachmentFile, attachmentBytes } from '../../../electron/security/attachmentFiles';
import { MAX_FILE_BYTES } from './attachmentModel';
const base = (text: string) => Buffer.from(text).toString('base64');
it('stores UTF-8 CSV/text and verifies hashes byte for byte including Unicode', () => {
    for (const name of ['contact.txt', 'transactions.csv']) {
        const file = verifyAttachmentFile(name, base('客户,金额\n张三,100'));
        expect(file.mime).toBe(name.endsWith('csv') ? 'text/csv' : 'text/plain');
        expect(attachmentBytes(file).toString()).toBe('客户,金额\n张三,100');
        expect(() => attachmentBytes({ ...file, size: file.size + 1 })).toThrow(/integrity/);
    }
});
it('accepts supported signatures and rejects files disguised by another extension', () => {
    for (const [name, hex] of [['note.pdf', '255044462d312e34'], ['image.png', '89504e470d0a1a0a'], ['image.jpeg', 'ffd8ffe0'], ['book.xlsx', '504b0304'], ['letter.docx', '504b0304']])
        expect(verifyAttachmentFile(name, Buffer.from(hex, 'hex').toString('base64')).size).toBeGreaterThan(0);
    for (const name of ['note.pdf', 'image.png', 'image.jpg', 'book.xlsx'])
        expect(() => verifyAttachmentFile(name, base('disguised text'))).toThrow(/extension/);
});
it('rejects executable paths, unsupported formats and malformed/noncanonical base64', () => {
    for (const name of ['../secret.txt', 'folder/file.txt', 'folder\\file.txt', 'script.html', 'program.exe', 'bad\0.txt', 'a'.repeat(201) + '.txt'])
        expect(() => verifyAttachmentFile(name, base('body'))).toThrow();
    for (const content of ['YWJj!', 'YQ', 'YR==', 'YQ===', ''])
        expect(() => verifyAttachmentFile('a.txt', content)).toThrow();
});
it('enforces file size at the actual decoded-byte boundary without regex stack overflow', () => { expect(verifyAttachmentFile('limit.txt', Buffer.alloc(MAX_FILE_BYTES, 65).toString('base64')).size).toBe(MAX_FILE_BYTES); expect(() => verifyAttachmentFile('oversized.txt', Buffer.alloc(MAX_FILE_BYTES + 1, 65).toString('base64'))).toThrow(/10 MB|oversized/); });
it('rejects invalid UTF-8 and binary text while rendering markup only as text data', () => {
    for (const bytes of [Buffer.from([0xff, 0xfe]), Buffer.from([65, 0, 66])])
        expect(() => verifyAttachmentFile('a.txt', bytes.toString('base64'))).toThrow();
    expect(attachmentBytes(verifyAttachmentFile('literal.txt', base('<script>literal content</script>'))).toString()).toContain('<script>');
});
