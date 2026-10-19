# Australian local payroll — 2026-10-19

This phase replaces payroll session samples with a main-owned local payroll repository: employees, pay items, timesheets, leave, pay runs, payslips, settings, summary reports and filing review. The user confirmed Australia (AU). Currency is AUD. No independent backend is added.

## End-to-end workflow

1. Open Payroll and create dedicated payroll accounts and six starter pay items. Configure employer name/ABN, net-wage clearing account, withholding item, super item and pay frequency. Starter liabilities are separate from bank, GST, AR/AP and inventory controls.
2. Save employee employment dates, hourly rate or salary **per run**, normal earning item, TFN, bank details, super fund/member information, opening annual/personal leave hours and PAYG declaration. Opening hours lock once payroll has been posted.
3. Record daily timesheets, submit and approve them. Salary timesheets track ordinary hours without paying the salary twice. Other hourly time items use their configured rates. Record and approve/decline/cancel leave; approved unconsumed requests reserve recorded leave balances. Dates and hours are reviewed, not inferred from an award or holiday calendar.
4. Create a period and select employees. Approved hours and leave wholly within the period are included automatically. Salary paid leave stays within the salary already paid. Unpaid salary leave and partial-period salary require explicit reviewed salary overrides. Approve no overlapping employee pay runs or duplicated time/leave sources.
5. Review manual or calculated PAYG, additional agreed withholding, deductions, allowances, super, salary overrides and leave accrual. Save a calculation draft with review reference and reason, then approve and post. Approval freezes employee/item/settings snapshots; changed sources require reopening and recalculation. Source reservations prevent editing included hours or leave until the run is cancelled or reversed.
6. Posting debits earnings/contribution expenses and credits withholding, deduction, super and net-wage liabilities. No GST, AR/AP or inventory balances are changed. Record already completed net-wage or other payroll-liability payments, including partial amounts, against an active AUD bank. Each payment debits its liability and credits bank; the existing bank register/reconciliation sees those journal entries. No funds are sent.
7. Reverse unreconciled recorded payments before reversing the payroll journal. Reversals use an open date on/after the source date and retain opposite linked journals, original snapshots and audit. Leave balances cannot go negative because of reversing earlier accrual. Approved unposted payroll blocks accounting-period close preflight.

## PAYG 2026–27

Automatic calculation implements Schedule 1 of the [Taxation Administration (Withholding Schedules) Instrument 2026](https://www.legislation.gov.au/F2026L00716/asmade/2026-06-12/text/original/epub/OEBPS/document_1/document_1.html), effective 1 July 2026, with the year confirmed against the [ATO 2026 tax-table release](https://softwaredevelopers.ato.gov.au/PAYGWTaxtables).

Supported standard periodic scales: resident without/with tax-free threshold (1/2), foreign resident (3), no TFN resident/foreign (4), and full/half Medicare exemption (5/6). Weekly, fortnightly, monthly and quarterly frequency are supported. Calculation follows whole-dollar weekly equivalents plus 99 cents, monthly 33-cent handling, weekly withholding rounding before period conversion, and the separate no-TFN truncation rules. Automatic pay dates are limited to 1 July 2026–30 June 2027; another year requires reviewed manual amounts until its tables are implemented.

Automatic mode requires a confirmed standard case and a provided eight- or nine-digit TFN for scales other than 4. TFN format capture is not government verification. Study/training loans, tax offsets, additional Medicare variations, salary sacrifice, bonuses/back pay, working holiday makers, termination payments and SAPTO require externally calculated, reviewed manual withholding. The employee remains in Manual mode unless the appropriate standard declaration is explicitly selected. Additional agreed withholding is an explicit per-run amount; a 53rd weekly or 27th fortnightly pay does not silently change withholding.

Taxable gross is the sum of marked taxable earnings and allowances. This phase supports post-tax deductions; it does not automate salary sacrifice or other pre-tax statutory adjustments. Percentage deductions and extra employer contributions use gross as their explicit base.

## Super and payslips

The SG helper calculates 12% of the employee's **reviewed qualifying earnings** for supported 2026–27 pay dates. It does not equate gross with qualifying earnings or infer eligibility/caps. A reviewed fixed SG amount handles eligibility exceptions, contribution caps or other externally calculated cases; a reviewed zero is supported. SG is an employer cost, never deducted from net wages. Other employer-contribution items remain separately configurable.

The [ATO Payday Super guidance](https://softwaredevelopers.ato.gov.au/PaydaySuper) describes 12% qualifying earnings and payday/receipt requirements from 1 July 2026. Local payment records do not establish receipt by a fund and do not perform SuperStream. Review actual obligations through the external payroll/super service.

Payslips retain employer name/ABN, employee identity, pay period/date/currency, rates/quantities, separately identified items, gross, deductions, net and employer contributions, plus recorded fund/member details. They are displayed from saved snapshots and export individually to UTF-8 text. Missing employer/fund metadata is visibly labelled “Not recorded”; completing and checking these fields remains part of issuing the payslip. The [Fair Work payslip guidance](https://www.fairwork.gov.au/pay-and-wages/paying-wages/pay-slips) is the reference for issuance/content obligations. Export does not deliver a payslip to an employee.

## Filing and reports

The filing page exports a review worksheet including employer/ABN/frequency, employee TFN/fund/member data, period, gross/taxable gross, withholding, net and contributions. This is **not an STP submission file**. Prepared/external-reference records document the user's review or externally obtained receipt; they are not ATO acceptance responses. Reversing a run marks its review “Correction needed”. Submit/correct/finalise STP through an external compliant service.

The payroll summary filters currently posted runs by pay date and exports every matching employee row. Reversed runs are excluded from this operational summary. GL reports remain authoritative for accrual and reversal movements by their accounting dates. Annual leave accrual, award rates, penalties and calendar-based entitlements are entered from reviewed calculations; they are not statutory award engines.

## Security, persistence and recovery

New payroll.read/manage/approve/post permissions are granted to ADMIN, FINANCE_ADMIN and ACCOUNTANT. Other roles, including AUDITOR, do not receive employee, TFN, bank, run or payslip data. Normal accounting permissions still allow aggregate GL review. ACCOUNTANT can manage/approve/post accruals but needs banking.write to record/reverse payments (provided to ADMIN/FINANCE_ADMIN). Main rechecks all authority, source revisions, dates and balances independently of UI controls.

Reasons and trusted actor/time/revision histories accompany writes. Operation IDs plus actor/request fingerprints provide safe retries without duplicating payroll, journals or payments. Failed commands roll back the payroll repository, financial repositories and receipts together under the existing business host. Direct system-journal posting/reversal remains blocked outside the owner service.

Schema 17 adds payroll and migrates schema 16 with an empty register; illustrative prototype employees/runs are not converted into real payroll. Local backups retain masters, source data, frozen slips, filing records, lifecycle history, operation receipts and linked journals. Restore validates references, calculations, liabilities/payments, reversals, leave balances, revision sequences and request fingerprints.

## Verification

28 PAYG unit tests include 25 official weekly sample rows across five scales (125 reference values), frequency conversion, no-TFN truncation and unsupported-year/input guards. 26 integration tests cover AU setup, salary/hourly pay, paid/unpaid leave, partial employment, source reservations, overlaps, review/approval/staleness, PAYG and SG, balanced posting, bank settlements, reconciliation locks, reversal/correction, closed periods, rollback, role privacy, snapshot exports, schema migration and backup corruption. Route tests include payroll privacy boundaries. Full-project and desktop results are recorded after final acceptance.

Final verification in the actual project directory passed TypeScript, Vite production build and all 96 test files / 1,162 tests. The existing large-chunk advisory remains. Disposable Electron acceptance reviewed a real saved AU salary run (gross 2,666.90; standard fortnightly PAYG 490.00; net 2,176.90; reviewed-QE SG 320.03), approved and posted it, recorded a completed synthetic partial payment of 1,000.00 and checked outstanding net wages of 1,176.90. The payment form cleared amount/confirmation after acknowledgement. It then reversed that payment, saved a synthetic external filing reference, exported and checked the actual CSV values, reversed payroll, restarted and verified retained Reversed / Correction needed statuses. Four retained accrual/payment/reversal journals balanced. No production business profile, bank transfer, SuperStream or ATO submission was used.
