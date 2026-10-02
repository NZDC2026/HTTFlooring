import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { invoices } from "../data/invoices";

const money = (value: number) => value.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

export default function InvoicesPage() {
  const outstanding = invoices.reduce((sum, i) => sum + i.balance, 0);
  const overdue = invoices.filter(i => i.status === "Overdue").reduce((sum, i) => sum + i.balance, 0);
  const overdueCount = invoices.filter(i => i.status === "Overdue").length;

  return <><PortalHeader /><main className="invoices-page">
    <section className="invoices-heading"><h1>Invoices</h1><p>View invoices, outstanding balances and overdue accounts.</p></section>
    <section className="invoice-content">
      <div className="invoice-summary">
        <div><small>Outstanding</small><strong>{money(outstanding)}</strong><span>{invoices.filter(i=>i.balance>0).length} invoices</span></div>
        <div className="danger-card"><small>Overdue</small><strong>{money(overdue)}</strong><span>{overdueCount} invoice</span></div>
        <div><small>Paid</small><strong>{invoices.filter(i=>i.status==="Paid").length}</strong><span>invoices paid</span></div>
      </div>
      <div className="invoice-search"><Search size={18}/><input placeholder="Search invoice number..." /></div>
      <div className="invoice-table">
        <div className="invoice-table-head"><span>Invoice</span><span>Issue Date</span><span>Due Date</span><span>Amount</span><span>Balance</span><span>Status</span></div>
        {invoices.map(i => <Link className="invoice-line" to={`/invoices/${i.id}`} key={i.id}>
          <strong>{i.invoiceNumber}</strong><span>{i.issueDate}</span><span>{i.dueDate}</span><span>{money(i.total)}</span><span>{money(i.balance)}</span>
          <span className={`invoice-status ${i.status.toLowerCase()}`}>{i.status === "Overdue" ? `${i.overdueDays} days overdue` : i.status}</span>
        </Link>)}
      </div>
      <div className="aging"><h2>Account Aging</h2><div><span>Current <strong>{money(10332)}</strong></span><span>1–30 days <strong>{money(2420)}</strong></span><span>31–60 days <strong>{money(0)}</strong></span><span>61–90 days <strong>{money(0)}</strong></span><span>90+ days <strong>{money(0)}</strong></span></div></div>
    </section>
  </main></>;
}
