import DateRangePicker from "../components/DateRangePicker";
import {periodEnd} from "../data/tradeDates";
import { useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { useInvoiceLedger } from "../data/ledger";
import { useLocalAccount } from "../services/account";
import { accountStatement } from "../data/accountStatement";
const money=(value:number)=>value.toLocaleString("en-AU",{style:"currency",currency:"AUD"});
const date=(value:Date)=>value.toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"numeric"});
export default function StatementPage(){
 const ledger=useInvoiceLedger(),{profile}=useLocalAccount();const [now]=useState(()=>new Date());const [period,setPeriod]=useState("Today");
 const asOf=periodEnd(period,now);const report=accountStatement(ledger,asOf);
 return <><PortalHeader/><main className="statement-page"><div className="reference-width"><Link className="statement-back" to="/invoices"><ArrowLeft size={14}/>Back to invoices</Link><section className="account-statement-paper"><div className="account-statement-head"><div><small>STATEMENT</small><h1>Account Statement</h1></div><DateRangePicker value={period} onChange={setPeriod} now={now} label="Statement as at date"/></div><div className="statement-customer"><div><small>Customer ID</small><strong>C-10235</strong></div><div><small>Payment terms</small><strong>Net 14</strong></div><div><small>Customer</small><strong>{profile.businessName}</strong><span>{[profile.address||"12 Example Street",profile.suburb||"Richmond",profile.state||"VIC",profile.postcode||"3121"].join(", ")}</span></div></div>
 <div className="statement-table-scroll"><table className="account-statement-table"><thead><tr>{["DATE","TYPE","REFERENCE","DUE","AMOUNT","BALANCE",""] .map((label,index)=><th key={index}>{label}</th>)}</tr></thead><tbody>{report.invoices.map(invoice=><tr key={invoice.id}><td><b>{invoice.issueDate}</b></td><td>Invoice</td><td><Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link></td><td>{invoice.dueDate}</td><td>{money(invoice.total)}</td><td>{money(invoice.balance)}</td><td><span className={`trade-badge ${invoice.overdueDays>0?"red":"neutral"}`}>{invoice.overdueDays>0?`${invoice.overdueDays} days overdue`:"Current"}</span></td></tr>)}{report.credits.map(credit=><tr key={credit.id}><td><b>{date(new Date(`${credit.date}T12:00:00`))}</b></td><td>Credit note</td><td><Link to={`/invoices/credits/${credit.id}`}>{credit.number}</Link></td><td>–</td><td>−{money(credit.total)}</td><td>−{money(credit.remainingAmount)}</td><td/></tr>)}</tbody></table></div>
 <div className="statement-aging">{report.summary.aging.map(bucket=><div key={bucket.label}><span>{bucket.label}</span><b>{money(bucket.balance)}</b></div>)}</div><div className="statement-totals"><span>Invoices outstanding<b>{money(report.summary.outstanding)}</b></span><span>Unapplied credits<b>−{money(report.unapplied)}</b></span><span>Net balance<b>{money(report.net)}</b></span></div><p className="statement-footnote">Amounts in AUD including GST. Unapplied credits will reduce your balance once applied to an invoice.</p><button className="trade-button statement-print" onClick={()=>window.print()}><Download size={16}/>Print / Save PDF</button></section></div></main></>;
}
