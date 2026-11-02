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
- Inventory lists product series, then a series colour table, then individual colour details. Bonita has nine colours with specifications and accessory references transcribed from the supplied range sheet. Colour swatches use CSS crops of the supplied reference image; Bonita colours share the existing series example price; stock without supplied data stays missing. Existing product IDs remain stable for invoice references. Series and colour search supports names, SKUs and colour codes.
- Inventory supports search, category filters, price sorting, URL persistence, and empty states. Returning from a product preserves filters. Product metadata includes optional accessories and pack sizes.
- Invoice line amounts use product pack area × boxes × price when area is available; otherwise quantity × price. Line amounts round to cents. Freight defaults to zero; GST is 10% of subtotal plus freight. Total, payment balance, status, overdue days, dashboard, account totals and aging share one calculation. Existing sample invoices share sample lines and retain separate paid amounts; status and aging use the current local calendar date.
- Invoice search and status filters work locally. Print / Save PDF opens the browser print dialog with an A4 invoice layout; choose Save as PDF.
- Product sales uses local invoice lines net of confirmed returns by default, with 30/90-day comparisons and a separately labeled generated sample option. Missing pack area is not inferred from stock totals. Invoice fixtures and stock are read-only local data in `src/data`.
- Public navigation, local application links, protected portal routes, missing pages, responsive layouts and keyboard focus are implemented.

## Data and integration boundaries

Browser data keys start with `htt.local.`. Clearing site data restores the initial demo state. Keep real secrets and customer data out of this preview. Pending applications do not grant access to the demo account or its invoices. Profile email and account region are read-only.

No requests are made to business APIs. Email delivery, real approvals, authoritative authentication/authorization, payments, realtime stock, invoice editing and server PDF generation need backend services. Existing product photography is hosted externally; local image assets can replace these URLs for fully offline use.

Business tests use Node's test runner and TypeScript transpilation. They cover actual shared calculation functions, freight, rounding, dates, aging, sales, local account lifecycle, password recovery, registration and session expiry.

Return Notes: use View Return Notes from the Credit Notes page to view sample returns, filter by status, create local requests and print their details. Cumulative active return quantities cannot exceed purchased quantities. Prices and pack areas come from the linked invoice; requested values include 10% GST and exclude freight. Requested returns can be cancelled. Requests and approved notes do not change balances. Confirm Return & Issue Credit atomically saves a confirmed return and one immutable Credit Note snapshot. Repeat confirmation returns the same credit. Only explicitly applied credits reduce the selected invoice balance throughout invoice details, lists, Dashboard and My Account. Balances are capped at zero, with remaining amounts retained as unapplied credit for later application; no cash refund is made. Credit note details, search and print are available under Credit Notes. Final split returns reconcile line cents and GST to the original goods total; freight is excluded.

Credit application update: issuance and application are separate. A new credit (or a legacy credit without application records) is unapplied and has no effect on debt. Credit Notes shows Apply to Invoice as `-` until applied. In credit details, select an outstanding invoice and amount, then Apply Credit; partial allocations across invoices are supported. Amounts cannot exceed available credit or invoice balance. All invoice/account views subscribe to the same local return-and-credit store, including updates from other tabs. Return Notes is accessed from the credit page rather than a top-level document tab.

Bundled credit preview fixtures are versioned with the app: INV-10521 has two applied credits ($328.80 and $52.25), and CN-1001 is unapplied ($52.25). Fresh browser origins get these defaults; legacy return arrays are migrated once while preserving user-created notes and existing credit/application records. Subsequent local changes are not reseeded. Browser-local test interactions alone are not used to deliver example data.

Product Sales deducts confirmed return quantities and area from the original invoice period. Requested, approved and cancelled returns are excluded. Credit application does not affect sales volume; only the return confirmation does. The page subscribes to return updates, including other browser tabs. Generated demo sales remain separately labeled preview data.

Catalogue prices are now complete local preview fixtures: all Bonita colours share $69.00 / m² with $82.00 standard price; accessory examples are Scotia $6.50, Stair Nose $45.00, Trims $12.00 per unit. These are sample values, not externally verified prices. Promotion and Clearance listings require a valid discounted price, higher standard price and positive discount; all current promotional fixtures include November 2026 start/end dates. Stock values are not invented.

Three price levels: Standard Price is the list rate; customerPrice is the normal customer rate; promotionPrice is an additional promotional rate. The effective legacy price is maintained for current-price displays. For Bonita the preview rates are $82 standard, $75 customer, $69 promotional (8% off the customer rate). Promotional strikethroughs use customerPrice, not Standard Price. Accessories also have lower customer rates than standard rates, without requiring a promotion.
