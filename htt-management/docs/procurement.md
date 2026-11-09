# Procurement

Open **Operations → Procurement**. Each batch has three sections: Materials, Freight and Customs Clearance. Each section corresponds to **one Supplier Invoice**, chosen independently:

- **Select one existing invoice**: search supplier invoice / bill number or supplier and select an invoice. Reuse its lines and totals; saving generates no new draft for that section.
- **Manually create one invoice**: enter supplier, invoice reference/date, currency/exchange rate and product/charge lines. Saving creates exactly one persistent Supplier Invoice draft per manually entered section. Repeated saves update the same draft, not duplicates. Existing legacy PO links are consolidated into one draft per section rather than one draft per PO.

Drafts are visible in the batch's **Supplier Invoice Drafts** section. They do not affect payable balances, journals or inventory. Accounting permission is required for approval; bill permission is required for posting. Manual freight/customs drafts use the existing expense-bill validation and posting process. Manual material drafts must be matched with received PO lines through the purchasing billing workflow before stock invoice posting; they are never posted as operating expenses. Approved/posted sources cannot be silently changed.

The three document sections show product quantities, coverage and base amounts, freight transport references, and customs charge/GST details. Batch edits retain actor/time audit history. Detail ends with **Landed Cost Allocation**: Materials + Freight + Customs Clearance totals (including GST), divided by Materials Qty (m²). Non-area units and freight/customs quantities do not contribute to the denominator. Manual amounts use the recorded exchange rate; linked sources use saved base values. Missing area shows a dash instead of a fabricated zero rate. This display allocation does not post inventory costs.

Enable **Sample** and click the in-progress November batch to see three manual invoice sections and pending drafts. The completed October batch demonstrates reuse of three existing Supplier Invoices. Synthetic previews never create live bills, stock, payroll or notifications.

Schema 36 stores procurement metadata and drafts inside the existing audited workspace repository. Existing business data and deployment settings are preserved.

## Mixed saved-result Sample
Enable Sample (or open `/procurement?sample=1`) to automatically open **PB-SAMPLE-000003 · Mixed workflow**. The three association cards show one reused material invoice `MAT-INV-SAMPLE-2026-108` ($42,000), a new freight draft `FRT-SAMPLE-108` ($3,080), and a new clearance draft `CLR-SAMPLE-108` ($715). Only two drafts are generated; no duplicate material invoice exists. Each section displays its complete lines, references and status, followed by total $45,795, material area 1,732.8 m² and $26.43/m² allocation. All values are isolated read-only synthetic previews.
