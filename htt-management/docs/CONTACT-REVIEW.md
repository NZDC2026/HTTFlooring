# Customer, branch and contact review

Entry: Customers → Incoming reviews, or Page directory → Customer & contact review (`/contacts/review`). All records belong to the current local desktop business profile.

## Completed workflow

- Receive Customer, Branch or Contact drafts manually or from a local JSON file. Incomplete fields may remain pending; provenance is immutable after intake.
- Filter/search the register by state, type, name or source reference; paginate 50 records per page.
- Edit pending fields, map the parent customer and select a contact's branch. Existing master validation applies when creating approved records.
- Refresh normalized exact duplicate comparisons: business/trading names, identifier, email, phone, branch name/address, and contact name/email/phone/mobile. Branch/contact suggestions stay within the chosen parent. Suggestions include inactive customers and do not replace human review.
- Approve into the real customer repository, or link to an existing record without merging or overwriting it. Creating a separate record despite suggestions requires explicit confirmation and a reason. Linking requires a reason and a target of the correct type and parent.
- Reject with a reason; reopen rejected drafts with a reason, correct them and review again. Approved/linked decisions remain final; subsequent master changes use the existing master editor.
- Main-controlled actor/time, revision checks, append-only field history, resolved-record snapshot and security audit. Retries reuse the existing intake/decision. Changed master data invalidates duplicate previews. A failed command rolls back review and master changes together.
- Persist, restart and restore via normal business backups. Schema 11 migrates to 12 with an empty review register while retaining existing business data. Snapshot validation checks provenance, references, history and decision consistency.

Read requires `sales.read`; intake/edit/decide/reopen additionally require `contacts.write`. With current roles, ADMIN, SALES and FINANCE_ADMIN can process reviews; ACCOUNTANT and AUDITOR can view; WAREHOUSE and PURCHASING cannot read customer reviews. The same authorized maintainer may submit and decide; this is not a separate four-eyes approval policy.

## JSON intake contract

UTF-8 `.json`, maximum 1 MB in the desktop importer, 1–100 drafts per atomic batch. Each imported draft needs a stable `externalId`, unique within its `source`; repeated identical source data returns its existing draft even after editing or deciding. Conflicting reuse fails the whole batch. Source labels are `Manual`, `Sales draft`, `Selected contact`, `Card transcription`.

```json
{"drafts":[
  {"kind":"Customer","source":"Sales draft","externalId":"company-001","sourceReference":"Local source reference","values":{"businessName":"Example Flooring","businessType":"Other"}},
  {"kind":"Branch","source":"Sales draft","externalId":"branch-001","customerId":"REPLACE_WITH_EXISTING_CUSTOMER_ID","values":{"name":"Main branch","addressLine1":"19 Example Street","suburb":"Auckland","state":"Auckland","postcode":"1010","country":"NZ"}},
  {"kind":"Contact","source":"Selected contact","externalId":"person-001","customerId":"REPLACE_WITH_EXISTING_CUSTOMER_ID","values":{"firstName":"Alex","lastName":"Example","email":"alex@example.test"}}
]}
```

Customer fields: businessName, tradingName, abn, businessType, status, email, phone, website, creditLimit (number), paymentTermsDays (integer).
Branch fields: name, addressLine1, addressLine2, suburb, state, postcode, country, phone, isPrimary (boolean).
Contact fields: firstName, lastName, jobTitle, email, phone, mobile, locationId, isPrimary/isAccounting (boolean).
Other fields are strings. Unknown keys or incorrect value types are rejected; missing fields receive defaults. Parent mapping may be completed after intake. Contact location must belong to its selected customer. New branches/contacts require a non-inactive parent. Customer identifiers retain the application's existing optional 11-digit ABN rule.

Phone address-book access, image/PDF OCR and remote sales/mobile synchronization are not connected. These source names are local provenance labels; no external connector or independent backend is introduced. Review approval does not post GL, AR, bank or inventory entries.

## Verification

30 new tests cover duplicate matching, all three creation/link flows, correction/rejection/reopening, idempotency, atomic batch intake, permissions, stale masters/editors, rollback, migration, backup restore and malformed snapshots. Full suite: 86 files, 1005 tests passed. Build passed (existing large-chunk advisory remains).

Disposable Electron profile acceptance: approved customer, branch and contact; navigated to the actual customer master; linked a duplicate customer; rejected/reopened/edited a draft with revision/history updates; imported JSON and verified the received draft in the register. No production profile or business data was used for acceptance.
