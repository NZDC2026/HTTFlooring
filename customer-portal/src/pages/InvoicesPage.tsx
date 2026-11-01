import { Search } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { invoices, invoiceSummary } from "../data/invoices";

const money = (value: number) => value.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

export default function InvoicesPage() {
  const [params,setParams]=useSearchParams();
  const query=params.get("q")??"", status=params.get("status")??"All";
  const setFilter=(key:string,value:string)=>setParams(previous=>{const next=new URLSearchParams(previous);next.set(key,value);return next;},{replace:true});
  const visibleInvoices=invoices.filter(invoice=>invoice.invoiceNumber.toLowerCase().includes(query.trim().toLowerCase()) && (status==="All" || invoice.status===status));
  const { outstanding, outstandingCount, overdue, overdueCount, paidCount, aging } = invoiceSummary;

  return <><PortalHeader /><main className="invoices-page">
    <section className="invoices-heading"><h1>Invoices</h1><p>View invoices, outstanding balances and overdue accounts.</p></section>
    <section className="invoice-content">
      <div className="invoice-summary">
        <div><small>Outstanding</small><strong>{money(outstanding)}</strong><span>{outstandingCount} invoices</span></div>
        <div className="danger-card"><small>Overdue</small><strong>{money(overdue)}</strong><span>{overdueCount} {overdueCount===1?"invoice":"invoices"}</span></div>
        <div><small>Paid</small><strong>{paidCount}</strong><span>invoices paid</span></div>
      </div>
      <div className="invoice-search"><Search size={18}/><input aria-label="Search invoice number" value={query} onChange={event=>setFilter("q",event.target.value)} placeholder="Search invoice number..." /><select aria-label="Invoice status" value={status} onChange={event=>setFilter("status",event.target.value)}>{["All","Outstanding","Overdue","Paid"].map(value=><option key={value}>{value}</option>)}</select></div>
      <div className="invoice-table">
        <div className="invoice-table-head"><span>Invoice</span><span>Issue Date</span><span>Due Date</span><span>Amount</span><span>Balance</span><span>Status</span></div>
        {visibleInvoices.map(i => <Link className="invoice-line" to={`/invoices/${i.id}`} key={i.id}>
          <strong>{i.invoiceNumber}</strong><span>{i.issueDate}</span><span>{i.dueDate}</span><span>{money(i.total)}</span><span>{money(i.balance)}</span>
          <span className={`invoice-status ${i.status.toLowerCase()}`}>{i.status === "Overdue" ? `${i.overdueDays} days overdue` : i.status}</span>
        </Link>)}
        {visibleInvoices.length===0 && <div className="empty-state"><p>No invoices match your search.</p><button className="outline-copper-button" onClick={()=>setParams({})}>Clear filters</button></div>}
      </div>
      <div className="aging"><h2>Account Aging</h2><div>{aging.map(bucket => <span key={bucket.label}>{bucket.label} <strong>{money(bucket.balance)}</strong></span>)}</div></div>
    </section>
  </main></>;
}
