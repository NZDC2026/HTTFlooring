# Dispatch follow-ups

Online host: Company settings → Quote & Order follow-ups (`/#/settings/dispatch-followups`).

Default: disabled. Samples are read-only and never send email or reserve stock.

## Enable

1. Supply `RESEND_API_KEY` to the existing web server process environment; use a sending key for the verified sender domain. Do not put the key in browser code or Git.
2. In company settings configure verified sender email, management notification email, HTTPS customer portal origin, and business time zone.
3. Check customer accounting recipients saved on Quote / Order snapshots. Missing or invalid recipients produce a visible delivery error and never start expiration.
4. Enable automatic follow-ups after reviewing the samples.

The server checks every minute, including while no staff browser is open. It uses calendar dates in the configured time zone, not the server's time zone. Quote and Order follow-ups are sent the day after the expected dispatch date, with missed runs caught up after restart. Quote expiration is seven calendar days after provider acceptance; an Order is never automatically cancelled. Provider acceptance is not a guarantee of inbox delivery. Retry uses the same provider idempotency key; an uncertain outcome beyond 23 hours stops for review rather than risking duplicate mail. Company settings shows delivery errors and pending management notifications.

Portal: `/follow-up#<secure-token>`. The emailed link is a bearer capability for **one document's expected date only**, valid for at most 30 days and revoked after a date change, conversion or expiry. It does not trust the portal's local demo account. It cannot change customer, financial values, products or document status. The public API accepts only the configured portal origin, POST JSON and rate-limited requests. Portal sample: `/follow-up?sample=1` (isolated).

Updating the expected date stops the old cycle; a new cycle starts after the new expected date. Every date change stores actor, source, timestamp, before/after and reason on the document atomically with the change. The notification journal can be reconstructed from that history after an interrupted write. Customer portal changes create a management notification and a queued notification email. Management Dashboard and document dispatch panels show recent notifications; the settings page retains the full event view.

Commercial inventory holds are company-wide base-unit quantities from active sent/accepted Quotes and outstanding Orders, less active dispatches, with no double-counting of converted Quotes. Expired Quotes hold zero. On Hand, incoming shipments and inventory valuation are unchanged. These are commercial commitments, not physical warehouse allocations: warehouse-specific Reserved / Available remains unallocated. Damage is not included. Warehouse users receive aggregate quantities only, not sales prices or customer documents. New holds must not be interpreted as an enforced stock-allocation or overselling prevention engine.

Persistence: optional `dispatchHistory` on sales documents is included in business backups. Mail cycles, secure links, settings and notification delivery state are in the existing SQLite `documents` table as `dispatch-followups-v1.json`; preserve the full SQLite data directory during deployment and backup. No new business repository or schema migration is required.

Implementation checks use isolated temporary business databases and a mocked mail provider; no acceptance test emails real customers.
