# Invoice due reminders and batch email

Open **Sales → Invoice Reminders**, or use **Review & batch email** on Dashboard.
The Dashboard and register show unpaid invoices due within seven calendar days,
due today, and overdue. These use the current business date/time zone and are
independent of the Dashboard reporting-period selection. Balances include GST
and deduct effective received payments and applied credits. Draft, void, settled,
recycled and Sample invoices are excluded.

Select invoices and choose **Statement** (one email per customer) or **Invoice**
(one email per invoice). Preview every recipient and document, then confirm the
batch. Different customers receive separate private emails. Recipient addresses
come from each saved invoice's accounting recipient; missing addresses block the
preview, and conflicting addresses for a customer block grouped statements.
Statements include the customer's full account ledger through today, not only
the selected unpaid invoices. Invoice attachments use the existing complete sales
template, including Discount %. This first version attaches printable **HTML**,
not PDF; open the attachment and print/save PDF if needed.

An administrator opens **Email settings** on this page, configures a verified
sender, and enables confirmed batches. The server reads `RESEND_API_KEY` from
`.env`. This feature does not automatically send unsolicited reminders and does
not change invoice status, balances or stock. No live emails are sent during
implementation or tests.

The server checks queued batches once per minute even after the initiating user
signs out. Queueing requires `documents.prepare` and `sales.read`; settings require
`users.manage`. Preview is valid for ten minutes. Business data or calendar-date
changes invalidate the snapshot, and changed queued messages are skipped.
Confirmed batches are idempotent. Delivery history preserves initiating user,
recipient, time, provider acknowledgement and failure. Accepted means provider
accepted, not recipient read. Uncertain/failed requests are never automatically
resent; check provider delivery history before creating a new batch. The delivery
journal is a separate server record, not a financial business repository.

## Sample preview

Enable **Sample** at the top of Invoice Reminders. Three isolated examples show
an overdue invoice (14 days, $2,843.75), one due today ($660), and one due in three
days ($1,100). Select them to preview grouped statements or full invoice emails.
Delivery history demonstrates Accepted, Queued and Failed states. Sending is
disabled in Sample mode. Sample rows do not enter live Dashboard figures,
financial records, inventory or outgoing notification jobs.
