import { Link } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { displayBoards } from "../data/portalPreview";
import { useInvoiceLedger } from "../data/ledger";
export default function PortalOverviewPage({kind}:{kind:"boards"|"sales"}){
 const {invoices}=useInvoiceLedger();
 return <><PortalHeader/><main className="reference-width reference-range-detail"><h1>{kind==="boards"?"Display Boards":"Sales"}</h1><p>{kind==="boards"?"Your showroom display collection and updates.":"Your purchase history, including GST."}</p>{kind==="boards"?<><div className="reference-activity">{displayBoards.map(board=><div className="reference-card" key={board.name}><small>{board.name}</small><strong>{board.count}</strong></div>)}</div><section className="reference-card"><h2>Display updates</h2><p>Bonita colour panel · Update recommended</p><p>Guardian swatch set · Update recommended</p><p>Additional showroom stand · Request in progress</p></section></>:<div className="invoice-table"><div className="invoice-table-head"><span>Invoice</span><span>Issued</span><span>Area</span><span>Total</span><span>Balance</span><span>Status</span></div>{invoices.map(invoice=><Link className="invoice-line" key={invoice.id} to={`/invoices/${invoice.id}`}><b>{invoice.invoiceNumber}</b><span>{invoice.issueDate}</span><span>{invoice.items.reduce((sum,item)=>sum+(item.totalSize??0),0).toFixed(2)} m²</span><span>${invoice.total.toFixed(2)}</span><span>${invoice.balance.toFixed(2)}</span><span>{invoice.status}</span></Link>)}</div>}</main></>;
}
