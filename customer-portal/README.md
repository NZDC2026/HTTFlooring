# HTT Flooring customer portal

Local React + TypeScript customer portal. No backend integration is included.

```sh
npm install
npm run dev
npm run build
npm run lint
npm test
```

## Local demo

Login: `john@abcflooring.com.au` / `Flooring123!`.
Recovery code: `HTT-DEMO-RECOVERY`. The login page shows the initial demo credentials; after a password change use the new password. Local authentication is for demonstrations, not a production security boundary.

- Passwords use salted PBKDF2 hashes. Remember me stores a 30-day local session; otherwise the session lasts up to one day in the current browser tab. Logout clears both. Contact edits and passwords persist in this browser.
- Registration validates ABN, required fields, email, postcode and mobile; saves a unique local application and locks its region. Multiple applications are retained and duplicate emails are rejected. Applications remain pending; no email, approval or real customer account is created.
- Inventory lists product series, then a series colour table, then individual colour details. Bonita has nine colours with specifications and accessory references transcribed from the supplied range sheet. Colour swatches use CSS crops of the supplied reference image; new colours have no supplied price/stock and display price on request and missing stock instead of invented values. Existing product IDs remain stable for invoice references. Series and colour search supports names, SKUs and colour codes.
- Inventory supports search, category filters, price sorting, URL persistence, and empty states. Returning from a product preserves filters. Product metadata includes optional accessories and pack sizes.
- Invoice line amounts use product pack area × boxes × price when area is available; otherwise quantity × price. Line amounts round to cents. Freight defaults to zero; GST is 10% of subtotal plus freight. Total, payment balance, status, overdue days, dashboard, account totals and aging share one calculation. Existing sample invoices share sample lines and retain separate paid amounts; status and aging use the current local calendar date.
- Invoice search and status filters work locally. Print / Save PDF opens the browser print dialog with an A4 invoice layout; choose Save as PDF.
- Product sales uses local invoice lines by default, with 30/90-day comparisons and a separately labeled generated sample option. Missing pack area is not inferred from stock totals. Invoice fixtures and stock are read-only local data in `src/data`.
- Public navigation, local application links, protected portal routes, missing pages, responsive layouts and keyboard focus are implemented.

## Data and integration boundaries

Browser data keys start with `htt.local.`. Clearing site data restores the initial demo state. Keep real secrets and customer data out of this preview. Pending applications do not grant access to the demo account or its invoices. Profile email and account region are read-only.

No requests are made to business APIs. Email delivery, real approvals, authoritative authentication/authorization, payments, realtime stock, invoice editing and server PDF generation need backend services. Existing product photography is hosted externally; local image assets can replace these URLs for fully offline use.

Business tests use Node's test runner and TypeScript transpilation. They cover actual shared calculation functions, freight, rounding, dates, aging, sales, local account lifecycle, password recovery, registration and session expiry.
