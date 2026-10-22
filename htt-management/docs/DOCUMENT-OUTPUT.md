> G09 follow-up: [Company branding images](G09-BRANDING.md) now embeds immutable, validated local PNG snapshots in sales/purchase HTML/PDF and report outputs. Earlier branding-image exclusions below describe the previous baseline; arbitrary HTML and remote resources remain blocked.

> Purchase-order and remittance output is now connected through a separate register; see [PURCHASE-OUTPUT-AND-RECOVERY-GUIDANCE.md](PURCHASE-OUTPUT-AND-RECOVERY-GUIDANCE.md). Earlier supplier-output exclusions below describe the previous baseline.

> Follow-up: [Physical supplier returns](SUPPLIER-RETURNS.md) now connects confirmed credits to inventory dispatch and atomic reversal.

# Sales document output — local preparation

Entry: Sales → Document preparation, Documents → Sales document preparation, or the preparation link on quote/order/invoice details (`/documents/delivery`).

Quotes, sales orders, invoices and customer credit notes can be prepared as immutable local versions. The main process reads the source document, checks its update timestamp, resolves an active matching template and records the verified actor. Renderer-supplied totals or document contents are rejected. A retried operation returns its original version; a changed request using the same ID is rejected. Separate preparations retain separate history rows. Preparation has no ledger, stock or source-status effect.

Each version records issuer details, customer identity, original source store/address/accounting recipient, quantities, area/pack coverage, prices, tax amounts/rates, totals and source status. Invoice paid/due amounts are explicitly amounts at preparation. The source recipient is never replaced using today's customer contact master. Legacy sources without a recipient remain marked as not recorded. Later source reversals, payments, company/contact edits and template changes do not alter existing versions; the UI flags changed sources.

Active sales templates support Quotation, Sales order, Invoice and Credit note types. A standard template is always available. Supported plain-text placeholders are `{{documentNumber}}`, `{{customerName}}`, `{{companyName}}`, `{{currency}}`, `{{total}}`, `{{documentDate}}`, `{{dueDate}}`, `{{store}}` and `{{accountingContact}}`. Subject, body and footer merge in the main process; unknown placeholders are rejected. Paper size supports A4/Letter. Branding images and arbitrary HTML are not executed or loaded.

A saved version displays in an isolated printable iframe, can open the native Print / Save as PDF dialog, and downloads as a standalone HTML file. Export escapes document/template content and sets a restrictive content security policy with no scripts, remote images, forms or external resources. Draft and void status remains visible. Print styles repeat line headers and preserve complete line rows across pages.

Email subject, body and the snapshotted accounting recipient are available for manual review. The application does not send email, upload files, track delivery, or mark a quote as sent when a version is prepared/downloaded/printed. Generic document attachments/upload/versioning pages remain separate sample workflows. This completes local sales-document preparation, not supplier purchase-order/remittance output or external delivery integrations.

Sales, accountants and finance administrators can prepare versions. Auditors can read history. Warehouse and purchasing roles receive neither prepared sales content nor sales template options. Template maintenance remains under accounting permissions. Preparation uses existing trusted main-process authorization, command audit and atomic persistence/recovery.

Schema 8 adds the prepared-version register. Schema 1–7 profiles/backups migrate with empty prepared history and preserved source documents; pre-migration snapshots are retained. Restore validates generated totals, area snapshots, duplicate IDs/operations and source/customer references. Automated acceptance covers all four document types, saved snapshots after source/template changes and restart, retry/stale protection, unsupported templates, safe HTML/filenames, permissions, failed-commit rollback, backup validation and schema-7 migration.

Remaining separate workflows include physical supplier returns, non-stock/service sales catalogue types, generic real file attachments and external integrations.

Native Electron acceptance used only a disposable synthetic profile. A draft quote with 5 m² requested, 3 boxes / 6.498 m² coverage, 300.00 net + 30.00 tax = 330.00 total and a stored accounting recipient was prepared, downloaded as HTML and saved through the macOS PDF dialog. The resulting one-page PDF was text-checked and rendered for visual review; the output contains the document without application navigation or working panels.
