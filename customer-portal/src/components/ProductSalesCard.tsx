import { useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { demoProductSales, productSalesReport, type SalesInvoice } from "../data/productSales";

const emptyInvoices: SalesInvoice[] = [];
const dateFormat = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" });
function period(start: Date, end: Date) {
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
  return `${dateFormat.format(start)} – ${dateFormat.format(last)}`;
}

export default function ProductSalesCard({ invoices = emptyInvoices, customerId = "abc-flooring", productId, now: providedNow }: { invoices?: SalesInvoice[]; customerId?: string; productId: string; now?: Date }) {
  const [mountedAt] = useState(() => new Date());
  const now = providedNow ?? mountedAt;
  const [days, setDays] = useState(30);
  const [demoOverride, setDemoOverride] = useState<boolean | null>(null);
  const demo = demoOverride ?? !invoices.some(invoice => invoice.customerId === customerId && invoice.status === "invoice");
  const report = productSalesReport(demo ? demoProductSales(customerId, now) : invoices, customerId, now, days);
  const productTrends = report.products.filter(product => product.productId === productId);
  return <section className="product-sales" aria-labelledby="product-sales-title">
    <div className="sales-heading"><div><h2 id="product-sales-title">Product Sales</h2><p>Invoiced volume · trend by m² · returns not deducted</p></div>
      <label className="sales-demo"><input type="checkbox" checked={demo} onChange={event => setDemoOverride(event.target.checked)} /> Demo data</label>
    </div>
    <div className="sales-toolbar"><div className="sales-periods" role="group" aria-label="Sales period">{[30, 90].map(value => <button type="button" key={value} aria-pressed={days === value} onClick={() => setDays(value)}>Last {value} days</button>)}</div>
      <span>{demo ? "Sample sales for preview only" : invoices.length ? "Showing actual invoices" : "Invoice product data is not connected yet"}</span>
    </div>
    <div className="sales-dates"><strong>{period(report.start, report.end)}</strong><span>vs {period(report.previousStart, report.start)}</span></div>
    <div aria-live="polite">{productTrends.length === 0 ? <p className="sales-empty">No product sales in these periods.</p> : <div className="sales-table-wrap"><table className="sales-table"><thead><tr><th scope="col">Product</th><th scope="col">Current period</th><th scope="col">Previous period</th><th scope="col">Trend</th></tr></thead><tbody>{productTrends.map(product => {
      const difference = product.currentSqm - product.previousSqm;
      const direction = Math.abs(difference) < 0.000001 ? 0 : Math.sign(difference);
      const label = product.previousSqm === 0 && product.currentSqm > 0 ? "New" : direction === 0 ? "No change" : `${direction > 0 ? "Up" : "Down"} ${Math.abs(difference / product.previousSqm * 100).toFixed(1)}%`;
      const Icon = direction > 0 ? TrendingUp : direction < 0 ? TrendingDown : Minus;
      return <tr key={product.productId}><th scope="row"><Link to={`/products/${product.productId}`}>{product.name}</Link><small>{product.sku}</small></th><td><strong>{product.currentSqm.toFixed(2)} m²</strong><small>{product.currentBoxes} boxes</small></td><td>{product.previousSqm.toFixed(2)} m²<small>{product.previousBoxes} boxes</small></td><td><span className={`sales-trend ${direction > 0 ? "positive" : direction < 0 ? "negative" : "neutral"}`}><Icon size={17} />{label}</span></td></tr>;
    })}</tbody></table></div>}</div>
  </section>;
}
