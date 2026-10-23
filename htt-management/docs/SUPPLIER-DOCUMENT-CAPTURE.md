> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [G13-LOCAL-DOCUMENT-RECOGNITION.md](G13-LOCAL-DOCUMENT-RECOGNITION.md).

# Current implementation

G13 now adds local macOS PDF/PNG/JPEG recognition, preserved originals, confidence/provenance review and immutable draft source links. See [G13 implementation and acceptance](G13-LOCAL-DOCUMENT-RECOGNITION.md). The text below records the earlier manual/CSV delivery; statements excluding OCR/source bytes are historical, superseded by G13.

# Supplier document capture & review — 2026-10-18

The document capture screen now prepares real managed expense/service bill drafts from manual fields or a single-bill CSV. It uses the existing local expense repository and persistence; no new register or schema migration is required. Automatic PDF/image OCR and storage of source file bytes remain outside this change.

## Workflow

Select an active supplier, enter its invoice reference and dates, select available manual expense accounts and active tax codes, and enter quantities/prices with explicit inclusive/exclusive basis. Enter the net, tax and total printed on the supplier document in whole cents. Calculate & review uses the main-process calculation. Source net + tax must equal total, and all three amounts must match the calculated document totals. Review results show discrepancies and links to duplicate entry drafts or posted bills.

The Create action requires an explicit review confirmation. Editing inputs clears confirmation; changes in local source books/configuration mark the preview stale and require another calculation. Main independently rechecks source totals, accounts, supplier/tax eligibility and duplicate supplier references when saving, so the UI preview cannot authorize stale or injected totals.

Successful creation opens a real DRAFT expense bill. Notes retain the source name and declared net/tax/total as metadata. Approval and posting remain separate existing commands. Creating the draft changes no journal, AP or inventory balance. Posted documents continue through the normal supplier bill, payment, credit and refund workflows. Captured drafts may later be edited through normal entry; the retained source metadata is an intake record, not proof that later edits match the original document.

## CSV format

One bill per CSV, at most 1 MB and 500 expense lines. Download headings from the screen:

`supplierCode,reference,date,dueDate,description,accountCode,quantity,unitCost,taxCode,basis,net,tax,total`

Repeat supplier code, reference, dates and source document totals identically on every row. Account codes identify currently available expense accounts; IDs are resolved from local options, then independently validated by main. Quantity must be positive; monetary input uses unsigned decimal syntax. Basis is Exclusive or Inclusive. Dates are YYYY-MM-DD. Quoted descriptions, BOM, CRLF, reordered/case-insensitive headings and multiple lines are supported; malformed/duplicate/unknown headings, mixed bill headers, unknown references and numeric expressions are rejected. Imported fields remain editable before review. File bytes are read only for the import; only draft fields and source-name metadata persist after creation.

## Permissions, retries and duplicates

purchases.read grants page/source visibility. Both preview and capture require purchases.bill, matching existing expense entry authority. Audit records use the trusted actor. Callers cannot supply precomputed posting results or actor identity. The existing operation ID and immutable creation fingerprint return the same draft across retries/restart/posting; changed source data with that operation ID is rejected. Active/approved/posted entry drafts and non-void supplier bills block a duplicate supplier/reference combination; cancelled drafts and void bills (including their linked posted entry drafts) are excluded. A retry returns its existing draft rather than creating a replacement after cancellation.

Main-owned rollback prevents partial drafts when a capture command fails. Invalid imports clear the previous review confirmation. Approval, accounting-period, reconciliation and posting controls remain the original workflows' responsibility.

## Verification

20 new automated tests cover CSV syntax/mapping/bounds, invalid dates and numeric expressions, lookup validation, exact mixed-tax totals, readonly preview, explicit confirmation, duplicates, safe metadata and amounts, permission enforcement, save-time tax/account rechecks, restart/retry, failure after draft creation, and separate approval/posting into normal AP/GL.

Native Electron acceptance used a disposable synthetic profile and CSV: source net 100.00, tax 10.00, total 110.00 matched the main calculation. Create was disabled until review confirmation, then opened DRAFT revision 1 with the source CSV name and declared totals retained. It was not posted; no actual business profile was used.
