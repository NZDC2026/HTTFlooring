# PDA warehouse operations

Entry: Inventory → PDA / Scan (`#/inventory/scan`). On the public demo host, use `/warehouse/#/inventory/scan` for the authenticated live workspace and `/#/inventory/scan?sample=1` for the isolated Sample.

Use a scanner that types into a browser field (keyboard / HID mode), with an Enter suffix. Scan existing product setup barcodes or SKUs. Leading zeros are retained; unknown, inactive and ambiguous products are rejected. Device-specific broadcast/SDK integration and offline posting are not included. The workflow requires connectivity; accepted live scans are server-saved. After a connection error, use Refresh from server and reopen the saved session before continuing.

- Receiving: select a sent / partly received PO, or a linked active container in its assigned warehouse. Scan good quantities in the document unit; confirm to create the existing goods receipt, inventory cost movements and accounting entries. Container receiving also updates its receipt progress. Damaged goods should remain outside these good quantities and be handled through the existing receiving inspection workflow.
- Picking: select an outstanding sales order and warehouse. Scan its products; batch-assigned lines also require their batch number. For repeated products, select the appropriate document line. Complete picking saves the checked quantities without reducing stock.
- Dispatch: select a completed pick. Rescan every picked quantity before confirming stock leaving. The existing dispatch service handles stock/cost posting. A pick can only be dispatched once; partial picks leave the remainder on the order. If the order changes after picking, cancel the open dispatch and re-pick the current order.
- Count: pause movements for the counted products. Only touched product rows are submitted. Use Confirm zero for products physically absent; unscanned products are excluded. Differences become a pending stock adjustment. Authorised accounting staff select an expense account, supply actual cost per base unit for increases and approve/post; warehouse users cannot post. A moved baseline is rejected and requires a new count.

Each accepted product barcode adds the quantity displayed in the line's unit. Repeated product barcodes cannot identify whether the same physical box was scanned twice; review totals and use Undo last scan for mistakes. Transport retries are idempotent and stale device revisions are rejected.

The Sample includes OPEN, PICKED, REVIEW and COMPLETED records, synthetic barcode `09300000012345`, SKU `SAMPLE-OAK-BOX`, preview stock and complete receiving/picking/dispatch/count interactions. It never calls business mutation APIs. Refreshing the whole Sample page resets its local data.

Repository schema 44 adds the audited PDA session register. The existing host migration preserves data and creates a pre-migration backup. No live test records are inserted by deployment.

## Verification record

- PDA domain tests cover real PO and container receipts, cost/stock reconciliation, restart recovery, idempotent retries, stale-device rejection, wrong codes, excess/fractional packs, batch checks, explicit zero counts, pending review, warehouse/finance permission separation, gain costs, held customers, source changes, transactional rollback and schema-43 migration.
- Relevant regression run: 499 tests passed. Authenticated HTTP/lookup tests: 15 passed. Production web build and lint completed (existing repository lint warnings remain).
- Browser Sample runs cover 1920×1080, 2560×1440, 390×844 and 360×640, keyboard/Enter scans, undo, receiving, picking, complete dispatch verification, count review/posting and zero counts; no live business mutation requests are made.
- The full repository suite is not clean. Its initial run reported 4,926 passing, 25 failing and 15 skipped tests, plus a sandbox port-listening error. The networking tests pass when allowed to open their local test ports. Unrelated failures in data-transfer integration (15), finance-foundation (2), finance-closure (1), desktop release gates (2) and sales create menu (2) were reproduced in an untouched HEAD checkout. Documentation/table capability inventories are also stale before this change. The old product-status test was corrected to open its intended advanced editor. These broader failures are not represented as a clean release-wide test result.
- Browser simulation verifies keyboard/HID behaviour; a physical PDA model has not been connected in this environment. Use a real scanner acceptance check before bulk warehouse work.
