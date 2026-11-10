import { Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import { rebateHistory, rebateAmount } from "../data/rebates";
import { products } from "../data/products";
const money=(value:number)=>value.toLocaleString("en-AU",{style:"currency",currency:"AUD"});
const formatDate=(value:string)=>new Date(`${value}T12:00:00`).toLocaleDateString("en-AU",{day:"2-digit",month:"short",year:"numeric"});
const area=(value:number)=>`${value.toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2})} m²`;
export default function RebatePage(){
 const [params,setParams]=useSearchParams();
 const query=params.get("q")??"",cycle=params.get("cycle")??"All";
 const update=(key:string,value:string)=>setParams(previous=>{const next=new URLSearchParams(previous);next.set(key,value);return next;},{replace:true});
 const records=rebateHistory.map(record=>({...record,product:products.find(product=>product.id===record.productId),amount:rebateAmount(record)})).sort((a,b)=>b.settledDate.localeCompare(a.settledDate));
 const visible=records.filter(record=>`${record.id} ${record.product?.name??""} ${record.product?.sku??""}`.toLowerCase().includes(query.trim().toLowerCase())&&(cycle==="All"||record.cycle===cycle));
 const total=records.reduce((sum,record)=>sum+Math.round(record.amount*100),0)/100;
 return <><PortalHeader/><main className="invoices-page"><section className="invoices-heading"><h1>Rebate</h1><p>View your historical product rebates and settlement periods.</p></section><section className="invoice-content">
 <div className="invoice-summary"><div><small>Rebate Records</small><strong>{records.length}</strong><span>historical settlements</span></div><div><small>Total Rebates</small><strong>{money(total)}</strong><span>excluding GST</span></div><div><small>Latest Settlement</small><strong>{records.length?formatDate(records[0].settledDate):"-"}</strong><span>settlement date</span></div></div>
 <div className="invoice-search"><Search size={18}/><input aria-label="Search rebates" placeholder="Search product, SKU or rebate number..." value={query} onChange={event=>update("q",event.target.value)}/><select aria-label="Rebate cycle" value={cycle} onChange={event=>update("cycle",event.target.value)}>{["All","Monthly","Quarterly"].map(value=><option key={value} value={value}>{value==="All"?"All Cycles":value}</option>)}</select></div>
 <div className="rebate-table-scroll"><table className="rebate-table"><thead><tr><th>Rebate / Product</th><th>Minimum Quantity</th><th>Rebate / m²</th><th>Cycle / Period</th><th>Settled Quantity</th><th>Rebate Amount</th><th>Settled On</th></tr></thead><tbody>{visible.map(record=><tr key={record.id}><td><strong>{record.id}</strong><Link to={`/products/${record.productId}`}>{record.product?.name??record.productId}</Link><small>{record.product?.sku}</small></td><td>{area(record.minimumQuantity)}</td><td><strong className="rebate-rate">{money(record.rate)}</strong><small>per m²</small></td><td>{record.cycle}<small>{formatDate(record.startDate)} – {formatDate(record.endDate)}</small></td><td>{area(record.settledQuantity)}</td><td><strong className="rebate-rate">{money(record.amount)}</strong></td><td>{formatDate(record.settledDate)}</td></tr>)}</tbody></table>{!visible.length&&<div className="empty-state"><p>No rebate records match your search.</p><button className="outline-copper-button" onClick={()=>setParams({})}>Clear filters</button></div>}</div>
 <p className="rebate-note">Historical rebate examples · Amounts in AUD, excluding GST.</p>
 </section></main></>;
}
