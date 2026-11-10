# D05 AU payroll sandbox — 2026-11-01

Scope: `htt-backend` only. User explicitly chose no payroll/STP provider or confirmed employment rules yet, and authorized a standard gateway and sandbox first. This delivery is a versioned local gateway contract and deterministic sandbox workflow, not a provider network adapter or statutory payroll engine.

## Delivered

Migration `054_payroll_sandbox.sql`; API `PayrollEndpoints`; private `payroll` schema. Employees, singleton sandbox settings, timesheets and pay runs have optimistic versions, immutable history, company isolation and transactional tenant locks. Only ADMIN is initially granted `payroll.read/write/review`; FINANCE is deliberately not granted confidential payroll access. Existing company role administration can grant the explicit permissions. API writes require `Idempotency-Key`; updates and transitions require `If-Match`. Current permissions are checked before cached responses. Audit/outbox payloads contain record identity, not employee/pay values.

No raw TFN, bank account, tax secrets, medical information or unrestricted extra fields are accepted. Employee records include code, name, employment type, employment dates and an optional opaque provider employee reference. Full protected statutory records require a provider/vault integration and separate retention/access design. These are not complete compliant employee records or payslips.

Timesheet: DRAFT → SUBMITTED → independently APPROVED. Approved timesheets cannot be edited. Categories ORDINARY/OVERTIME/LEAVE may be recorded, but the fixture deliberately refuses calculation of overtime or leave without employment rules. Total entered minutes per employee/day cannot exceed 1440. Time Billing/jobs are not enabled.

Run: DRAFT → CALCULATED → independently APPROVED → LOCKED → SANDBOX_ACKNOWLEDGED. Calculation requires approved, unconsumed timesheets within the period and freezes employee profiles, timesheet revisions, settings revision, rules and results. A timesheet can be consumed only once. Failure rolls back the complete calculation and its reservations; draft inputs may be corrected and recalculated. Locked runs cannot be edited. A reviewed historical run is not reopened or recalculated from changed profiles/settings. Cancellation/reversal of an already calculated run is not implemented; retain it and resolve through a later controlled correction feature.

## API / gateway contract

All routes are under `/api/v1` and require authenticated company access:

| Route | Purpose |
|---|---|
| GET `/payroll/records?kind=EMPLOYEE&page=1&pageSize=50` | Private paged records; other kinds SETTINGS/TIMESHEET/RUN |
| GET `/payroll/records/{id}` | Current record, version and explicit sandbox flags |
| POST `/payroll/records` | Create `{ "kind": "...", "body": {...} }` |
| PUT `/payroll/records/{id}` | Replace an editable draft body with If-Match |
| POST `/payroll/records/{id}/submit` | Submit timesheet |
| POST `/payroll/records/{id}/approve` | Independent timesheet/run reviewer |
| POST `/payroll/records/{id}/calculate` | Atomically capture deterministic fixture result |
| POST `/payroll/records/{id}/lock` | Freeze approved run |
| POST `/payroll/records/{id}/stp_preview` | Local simulated acknowledgment, no network request |
| GET `/payroll/report?from=2026-10-01&to=2026-10-31` | Inclusive pay-date summary of locked/acknowledged runs; gross/PAYG/net/super integer AUD cents and gross−PAYG−net difference |

Employee body example: `{"code":"E001","name":"Sandbox employee","employmentType":"FULL_TIME","startDate":"2026-01-01","providerEmployeeRef":"opaque-demo-ref"}`. Employment types FULL_TIME/PART_TIME/CASUAL; optional endDate must be valid and not before startDate.

Settings body example: `{"provider":"SANDBOX","rulesVersion":"fixture-demo-v1","fixtureHourlyCents":3000,"fixturePaygCents":1000,"fixtureSuperCents":2000}`. These are arbitrary test inputs, not Australian rates. Fixture gross is rounded once per timesheet from minutes × hourly cents / 60. Fixture PAYG and super are flat test amounts **per timesheet**, not per employee or statutory calculation. Net = gross − fixture PAYG; PAYG exceeding gross is rejected. Only nonnegative integer cents are accepted; LIVE/ATO provider configuration is rejected.

Timesheet body: `{"employeeId":"uuid","date":"2026-10-01","minutes":480,"category":"ORDINARY"}`. Run body: `{"from":"2026-10-01","to":"2026-10-07","payDate":"2026-10-08","timesheetIds":["uuid"]}`. Period up to 32 inclusive days, pay date no earlier than end, 1–100 unique timesheet IDs. The stable local calculation response identifies `htt.payroll.sandbox.v1`, frozen settings/rules/results. STP preview identifies `htt.stp.sandbox.v1`, correlationId = runId and explicit `atoLodged:false`. These are HTT internal contracts, **not an ATO payload specification**.

Synchronous sandbox operations have no external failure/retry queue. Transport ambiguity, retries, polling, provider signatures, actual acknowledgments and real STP corrections remain for the adapter. Client retry with the same idempotency key reproduces the original local result; changed payload conflicts. Different-key stale transitions conflict. Never infer an ATO submission from the local simulated acknowledgment.

## Accounting and statutory boundary

No wage payment, bank transfer/file, GL journal, BAS adjustment, incentive settlement, super payment or ATO lodgment is produced. Sandbox reports never join real journals or existing operating report packs. Existing commission clearing remains external-payroll clearing; no duplicate expense import is introduced. No real TFN, wages or employment data should be loaded into this sandbox.

AU production payroll must use confirmed employment/Award rules and a selected payroll/STP product. ATO describes STP as reporting through STP-enabled products: [ATO STP](https://softwaredevelopers.ato.gov.au/STP), [ATO employer learning material](https://smallbusiness.taxsuperandyou.gov.au/hiring-workers/single-touch-payroll). Fair Work identifies confidential employee records and employer record/payslip duties: [Fair Work record keeping and payslips](https://www.fairwork.gov.au/tools-and-resources/fact-sheets/rights-and-obligations/record-keeping-pay-slips). These references support the boundary, not certification of this implementation. No NZ Payday filing is implemented.

## Remaining order

1. Select provider, sandbox credentials, supported contracts, employment/Award classifications, payroll calendar, leave/PAYG/super rules and opening/YTD migration policy.
2. Protected bank/tax/super records, configurable earnings/allowances/deductions/leave, actual provider adapter, result reconciliation and corrections/voids.
3. Independently approved GL mappings, controlled payroll accrual/reversal and commission-clearing import without duplicate expense; reconcile periods, liabilities and reports.
4. Actual provider STP transport, leases/UNKNOWN reconciliation, retry and amendments/YTD/finalisation; legal payslips and secure delivery; bank payment matching.
5. Real provider acceptance, client integration, retention/backup, access audit and production acceptance. D05 remains PARTIAL overall.

Verification: see `stage-d-05-results.json`. Only the listed suites/platforms are evidence; this is not a complete-suite or production acceptance claim. Historical migrations 001–053 and dependency locks remain unchanged.
