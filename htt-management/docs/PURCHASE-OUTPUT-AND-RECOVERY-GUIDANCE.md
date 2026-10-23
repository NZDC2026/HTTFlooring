> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

> Follow-up: [TARGETED-FINANCIAL-REPAIR.md](TARGETED-FINANCIAL-REPAIR.md) adds executable isolated bank repairs. Earlier guidance-only limits below describe the prior baseline.

# Purchase output and guided recovery

## Purchase orders and remittance advice

The purchase register, purchase-order detail, supplier-payment detail and document centre link to `/documents/purchase-output`. The trusted main process prepares independent immutable versions from existing purchase orders or recorded supplier payments. Requests contain only source identity, a source/supplier revision, template selection and operation ID. Renderer-provided document totals, recipients and content are rejected. Stable retries return the original version; changed requests cannot reuse its operation ID.

Purchase orders retain ordered quantities, source SKU/descriptions/unit costs, tax snapshots, totals, expected delivery date, references and status. They are not supplier tax invoices. Remittance advice retains each bill number, supplier invoice reference and partial allocation amount. Reversed payments are labelled as reversed; prepayment applications are labelled NONCASH and never represented as a new bank payment. Advice neither confirms bank receipt nor initiates a transfer. It does not print bank credentials or invent GST on settlement allocations.

Supplier names/codes use the source snapshots; supplier contact/address/email use the current supplier master at preparation, with its revision recorded and the capture policy visible. Issuer and matching active template content are frozen. Source/supplier changes trigger a stale-version message while old versions remain unchanged. Custom Purchase order and Remittance templates support documentNumber, supplierName, companyName, currency, total, documentDate, expectedDeliveryDate and reference tokens. Unknown tokens and mismatched template types are rejected.

Outputs render as escaped, CSP-restricted HTML in an isolated frame. Download saves the complete standalone HTML; native Print offers printing or Save as PDF. A4/Letter, repeating headers and intact line rows are supported. Email subject/body/recipient are prepared for review only. Output does not send email, change order status, mark a document sent or post any accounting/stock movement.

Purchasing can prepare/read PO versions. Accountants and finance administrators can prepare both kinds. Auditors can read both kinds but cannot prepare. Sales/warehouse have no prepared purchase content; purchasing receives no remittance versions. Main process permission checks apply independently of the renderer. Template maintenance keeps its existing accounting permissions.

Schema 20 adds a separate preparedPurchaseOutputs register. Schema 1–19 profiles/backups migrate with an empty register and preserve existing Sales output. Native migration creates a pre-migration copy. Backups validate request/source linkage, captured source allocations/amounts, arithmetic, duplicate identities and current source ownership. Source financial state is not modified by preparation or export.

## Complex exception guidance

The existing recovery workbench now provides categorized guidance for unbound results, incomplete/inconsistent records, ambiguous/duplicate evidence and independently approvable results. The user can walk the steps, open existing source links, download a diagnostic JSON case and navigate to the existing administrator-only backup workflow. The case contains operation identity, live blockers, source links, review history and revision, not business backup bytes or credentials.

The guide explains supported source-owned correction, preservation of the current backup, validated restore preview, business-data replacement and required restart. If an unresolved intent blocks the source correction, the guide explicitly forbids bypassing it and directs the administrator to a known-good backup. Nonadministrators are told that full backup/restore needs an administrator. Corrupt operation storage retains a direct data-protection link even when no queue rows can be loaded.

This is a guided inspection and existing-restore workflow, not a new financial repair engine. Step navigation/download never closes an operation, fabricates a missing result, deletes duplicate journals, posts balancing entries or bypasses verification/independent approval. Missing posted records without a suitable backup still require a separately reviewed repair procedure. Existing bank/Sales closure proof remains authoritative.

## Validation

Integration acceptance covers PO amounts/quantities, partial remittances, reversals, noncash applications, historical snapshots and restart, stable retry, forged/stale requests, template type/tokens/escaping, six-role disclosure and command boundaries, source/totals corruption, schema-19 migration preserving Sales output, failed durable commits, mandatory restart and trusted audit actors. Guidance tests cover unbound/ambiguous/missing evidence, independent review, no false restore recommendation for an absent checklist, and immutable blockers.

Final actual-project verification passed TypeScript and Vite/Electron production build, plus 113 test files / 1,360 tests. Disposable Electron acceptance displayed PO-2026-0003 (net 100.00, tax 10.00, total AUD 110.00, two ordered units) and partial supplier remittance SPAY-2026-0001 (allocated AUD 20.00). The PO opened the native one-page A4 portrait print/PDF dialog, which was cancelled without printing. The missing-result guide advanced steps while keeping its unresolved blocker; a diagnostic JSON was saved and parsed, and the administrator backup/recovery page opened through the guide. No production profile, email, payment transfer or business restore was used.
