# Local business attachments and version management

Entry: Page directory → Business attachments (`/documents/attachments`). The former metadata-only sample page now stores actual file content in the desktop business profile, with immutable file versions and object-scoped access.

## Workflow

1. Refresh available business links, search by type/name/number/code and choose an object the current user may maintain.
2. Enter a document title and reason, then choose a real file in the native file dialog. The application records its original filename, byte size, SHA-256, content, trusted user/time and business link.
3. Search/filter the attachment register by title, any version filename, business link, object type or Active/Recycle bin/All. Register pages contain 50 rows. Business target selection shows up to 100 matches and supports narrowing the search.
4. Select an attachment to preview image/UTF-8 text, export any version, upload a new version, rename its title, or restore an older version. A restored version is appended as a new current version; previous files and history remain intact.
5. Move an attachment to the recoverable recycle bin with a reason, or recover it. Versions remain readable/exportable under the linked object's read authority. There is no permanent purge in this workflow.
6. Restart or use the normal business backup/restore: files, versions, hashes, links and lifecycle history travel together with the business data.

The attachment's business link is immutable; attaching to another object is a separate explicit upload. Files do not alter document posting, GL, AR/AP, stock, tax or bank balances. Posted/void business records remain usable attachment sources while they exist.

## File handling and limits

Supported: PDF, PNG, JPEG, UTF-8 CSV/TXT, DOCX and XLSX. Actual decoded bytes are persisted as base64 in the existing atomic business snapshot; file paths on the source computer are not needed after upload. This design keeps file changes and version metadata within the same commit and backup boundary.

- Nonempty files, maximum 10,000,000 bytes per version; at most 100 versions per attachment; maximum 50,000,000 bytes across the library, including every old/restored version and recycled document. Restoring a version also consumes its copied byte size. At the library limit, an archived/new business profile is required to add more content; export alone does not reclaim capacity.
- Source reads use the native-selected path, a bounded regular-file read and no-follow semantics. Symlinks, folders, executables, unsupported extensions, malformed base64, bad UTF-8 and mismatched basic file signatures are rejected. PDF/image signatures and Office ZIP headers are format checks, not complete document validation.
- PNG/JPEG and CSV/TXT can be previewed. Text is rendered literally and capped at 200,000 characters in the preview; exported files retain all bytes. PDF and Office files are exported for viewing in the user's chosen application. The application does not execute uploaded content or invoke an external viewer automatically.
- Export checks read authority again after the save dialog, validates size/hash/MIME, and atomically writes to the chosen destination outside active application data storage. Export audit identifies both document and version. Cancelling file dialogs creates no attachment or export file.
- Business backups now contain actual attachment contents, including versions and trash. Authentication secrets remain excluded by the existing business-backup mechanism.

## Object permission inheritance

Supported links: Customer, Supplier, Quote, Order, Invoice, Customer credit, Purchase order, Bill, Supplier credit, Task, Visit, Job, Journal and Product.

Read uses the corresponding sales, purchase, accounting or inventory read permission. Maintenance additionally requires the linked object's existing write authority: contacts.write, sales.write, sales.manage, purchases.write, purchases.bill, accounting.post or inventory.adjust as appropriate. Having a broad attachment-page entry permission does not grant access to another module's files.

Main-process renderer views filter documents and history per linked object and strip all file bytes. Bytes are returned only for an explicitly authorized version read. File selection/upload, version/title changes, recycle/recover and export each recheck authority in main. Unauthorized roles cannot obtain filenames, hashes, history or bytes for unreadable business objects. Customer/supplier navigation links are omitted for roles lacking contact-page authority.

## Persistence and integrity

Schema 13 migrates to 14 with an empty attachment library, preserving existing business records. Uploads and maintenance have operation IDs, revision checks and trusted actor/time. Exact retries reuse existing records; conflicting ID reuse fails. Duplicate file bytes on the same active business object or within an attachment are rejected; use explicit version restore to return to old bytes.

Backup validation checks file hash/size/MIME, canonical base64, business references, version order, restored-version references/content, current version, audit sequence/outcome, recycle metadata and aggregate capacity. Failed commands roll back bytes, metadata and history together. No independent backend, cloud storage, email integration or external synchronization is added.

## Verification

26 new tests cover real bytes, Unicode, supported file signatures, size/library limits, all operational/financial role boundaries, renderer redaction, immutable versions/old-version restore, title/trash/recovery, duplicate/idempotent retry, stale revisions, forged metadata, malformed backups, migration, normal restore, rollback, native dialog cancellation, source-path boundaries, exact export, active-data protection and session expiry during export. Full suite: 91 files / 1055 tests passed. Build passed; the existing large-chunk advisory remains.

Disposable Electron acceptance: uploaded a real UTF-8 customer attachment, previewed the saved text, uploaded a second file version, restored the first into a retained third version, exported it, moved the document to the recycle bin, recovered it, restarted and read the restored version again. Export bytes matched the original exactly; all three versions and five lifecycle events persisted. No production profile was used.
