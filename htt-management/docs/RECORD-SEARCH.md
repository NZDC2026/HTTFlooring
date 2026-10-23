> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# Local business record search — 2026-10-18

The Business record search screen at `/search/records` now reads current local repositories rather than illustrative search rows. Access it through Workspace search or the page directory. No independent backend, new snapshot register, or search-data persistence is added.

## Supported records

Customers, suppliers, products, quotations, sales orders, invoices, customer credits, purchase orders, supplier bills, supplier credits and journal entries. Unposted managed entry drafts remain in their own draft registers. Other domains are outside this search scope.

Only displayed fields are indexed: type, number/code, name, reference, status and business document date. Customer/supplier reference includes trading name, email and phone; product reference includes brand, category and item type. Purchase costs, financial totals, document lines and arbitrary object fields are not indexed. Sales contact names follow the current customer master; purchase documents retain their saved supplier name.

Text matches literal, case-insensitive whitespace-separated terms across displayed fields; all terms must match. Exact number/code matches rank first, followed by descending document date, number and stable type/ID key. No regular expression, SQL or expression execution is supported. Text is limited to 500 characters.

Type, status and inclusive date filters narrow the results. A date filter excludes undated master records. Historical void, cancelled, reversed and inactive records remain discoverable. Results paginate at 50 rows with full matching counts; out-of-range page numbers are clamped.

## Authorization and navigation

Existing main-process snapshots enforce sales.read, purchases.read, inventory.read and accounting.read. The search projection independently applies the same permissions before calculating results, status options and counts. Type options are permission-filtered. All existing business roles can reach the screen via inventory.read; this does not grant additional data access. Anonymous or invalid identities receive no records.

Existing contact detail screens require contacts.write. Readers without that permission can find permitted contact summary fields but see an unlinked code, avoiding a destination they cannot access. Other supported records link to their existing source screens.

Search never writes business data. It reads subscribed renderer copies of permission-filtered local repositories; no separate cache retains prior identities. Text submits with Search or Enter to prevent dropped characters from per-keystroke routing. Filters and page remain in the route; opening a source carries a validated internal return link. Back to record search restores the submitted text, filters and page. Clearing the search clears its route parameters.

## Validation

15 new automated tests cover all 11 categories, seven roles, denied counts/statuses, anonymous identities, literal multi-term matching, unindexed sensitive fields, historical statuses, inclusive dates, invalid filters, 121-row pagination, source immutability, current changes, route encoding, safe return links, main-owned posting results, restart and role switching.

Native Electron acceptance used a disposable synthetic business profile with 53 posted invoices. Verified full fast text entry, 106 matching invoice/order records, Invoice filtering to 53 results, second-page remaining three invoices, opening INV-2026-0052, and returning to the search with the submitted text and page 2 preserved. The actual business profile was not used.
