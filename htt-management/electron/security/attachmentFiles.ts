import { createHash } from 'node:crypto';
import { extname, basename } from 'node:path';
import { MAX_FILE_BYTES } from '../../src/features/attachments/attachmentModel';
const types: Record<string, string> = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.csv': 'text/csv', '.txt': 'text/plain', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
export function verifyAttachmentFile(name: string, content: string) {
    if (typeof name !== 'string' || name.length > 200 || name !== basename(name) || /[\\/\x00-\x1f\x7f]/.test(name) || name === '.' || name === '..')
        throw new Error('Choose a plain file name of at most 200 characters.');
    const extension = extname(name).toLowerCase(), mime = types[extension];
    if (!mime)
        throw new Error('Supported files: PDF, PNG, JPEG, CSV, TXT, DOCX and XLSX.');
    if (typeof content !== 'string' || content.length > Math.ceil(MAX_FILE_BYTES / 3) * 4 || /[^A-Za-z0-9+/=]/.test(content))
        throw new Error('Invalid or oversized file content.');
    const bytes = Buffer.from(content, 'base64');
    if (!bytes.length || bytes.length > MAX_FILE_BYTES || bytes.toString('base64') !== content)
        throw new Error('Choose a nonempty file no larger than 10 MB.');
    const starts = (hex: string) => bytes.subarray(0, hex.length / 2).toString('hex') === hex;
    if (extension === '.pdf' && bytes.subarray(0, 5).toString() !== '%PDF-' || extension === '.png' && !starts('89504e470d0a1a0a') || ['.jpg', '.jpeg'].includes(extension) && !starts('ffd8ff') || ['.docx', '.xlsx'].includes(extension) && !starts('504b0304'))
        throw new Error('File content does not match its extension.');
    if (['.csv', '.txt'].includes(extension)) {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        if (text.includes('\0'))
            throw new Error('Text files must contain UTF-8 text without NUL characters.');
    }
    return { name, mime, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), content };
}
export function attachmentBytes(file: {
    name: string;
    content: string;
    size: number;
    sha256: string;
    mime: string;
}) {
    const checked = verifyAttachmentFile(file.name, file.content);
    if (checked.size !== file.size || checked.sha256 !== file.sha256 || checked.mime !== file.mime)
        throw new Error('Attachment content integrity check failed.');
    return Buffer.from(file.content, 'base64');
}
// Export replaces only a dialog-selected path atomically; never interpret content as code.
import { openSync, writeFileSync, fsyncSync, closeSync, renameSync, unlinkSync, constants, fstatSync, readSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
export function atomicAttachmentExport(path: string, bytes: Buffer) {
    const temporary = join(dirname(path), '.htt-attachment-' + randomUUID() + '.tmp');
    let fd: number | undefined;
    try {
        fd = openSync(temporary, 'wx', 0o600);
        writeFileSync(fd, bytes);
        fsyncSync(fd);
        closeSync(fd);
        fd = undefined;
        renameSync(temporary, path);
    }
    catch (e) {
        if (fd !== undefined)
            closeSync(fd);
        try {
            unlinkSync(temporary);
        }
        catch { /* no temporary created */ }
        throw e;
    }
}
export function readSelectedAttachment(path: string) {
    const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
        const info = fstatSync(fd);
        if (!info.isFile() || info.size > MAX_FILE_BYTES)
            throw new Error('Choose a regular file no larger than 10 MB.');
        const buffer = Buffer.alloc(MAX_FILE_BYTES + 1);
        let length = 0;
        while (length < buffer.length) {
            const count = readSync(fd, buffer, length, buffer.length - length, null);
            if (!count)
                break;
            length += count;
        }
        if (length > MAX_FILE_BYTES)
            throw new Error('File grew beyond 10 MB.');
        return buffer.subarray(0, length);
    }
    finally {
        closeSync(fd);
    }
}
