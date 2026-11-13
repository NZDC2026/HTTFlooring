import {type ReactNode,useEffect,useRef,useState,useSyncExternalStore,useId} from 'react';
import {Link} from 'react-router-dom';
import {Layers,TriangleAlert,Wallet,ChartNoAxesColumnIncreasing,ArrowUpCircle} from 'lucide-react';
import {useProducts} from '../../business-workspace/productRepository';
import {businessSettings} from '../../business-workspace/configurationState';
import {useInventoryValuation} from '../../inventory/data/useInventoryValuation';
import {useInventoryMovements} from '../../inventory/data/useInventory';
import {useSalesDocuments} from '../../sales/data/useSalesDocuments';
import {useAccounts,useJournalEntries} from '../../accounting/data/useAccounting';
import {salesFulfilmentRepository} from '../../sales/data/salesFulfilmentRepository';
import {orderStockShortages} from '../data/orderStockShortages';
import {inventoryInsightSummary,performanceSeries,performanceValue,type PerformanceMetric} from '../data/adminInsights';
import {dashboardLink} from '../pages/dashboardLink';
import './admin-insights.css';
const compact=(value:number)=>Math.abs(value)>=1000000?'$'+(value/1000000).toFixed(2)+'M':Math.abs(value)>=1000?'$'+(value/1000).toFixed(1).replace(/\.0$/,'')+'K':currency(value);
const currency=(value:number)=>new Intl.NumberFormat('en-AU',{style:'currency',currency:businessSettings().currency,maximumFractionDigits:0}).format(value);
export function AdminInsights({sample,from,to,site,priorities}:{sample:boolean;from:string;to:string;site:string;priorities?:ReactNode}){
 const products=useProducts(),valuation=useInventoryValuation(to),movements=useInventoryMovements(),documents=useSalesDocuments(),accounts=useAccounts(),journals=useJournalEntries();
 const metricId=useId(),plotRef=useRef<HTMLDivElement>(null);
 const [chartWidth,setChartWidth]=useState(700);
 useEffect(()=>{const plot=plotRef.current;if(!plot)return;const resize=new ResizeObserver(entries=>setChartWidth(Math.max(300,entries[0].contentRect.width)));resize.observe(plot);return()=>resize.disconnect();},[]);
 const [metric,setMetric]=useState<PerformanceMetric>('Sales'),[hovered,setHovered]=useState<string|null>(null),[showInventory,setShowInventory]=useState(false);
 const stocks=valuation.rows.filter(r=>site==='ALL'||r.siteId===site),summary=inventoryInsightSummary(products,stocks,movements.filter(m=>site==='ALL'||m.siteId===site),to);
 const inventory=sample?{value:2180000,slowValue:186400,active:1268,low:26,out:8,slow:34}:summary;
 const fulfilments=useSyncExternalStore(salesFulfilmentRepository.subscribe,salesFulfilmentRepository.getSnapshot,salesFulfilmentRepository.getSnapshot);
 const affected=sample?4:new Set(orderStockShortages(documents.filter(d=>d.documentDate<=to),products,stocks,fulfilments,site).map(r=>r.orderId)).size;
 const series=performanceSeries(accounts,journals,from,to,sample),current=performanceValue(metric,series.current),prior=performanceValue(metric,series.prior);
 const format=(n:number|null)=>n===null?'—':metric==='Margin'?n.toFixed(1)+'%':currency(n);
 const change=current===null||prior===null||prior===0?null:metric==='Margin'?current-prior:(current-prior)/Math.abs(prior)*100;
 const chartFrom=new Date(to+'T12:00:00Z');if(from===to)chartFrom.setUTCDate(chartFrom.getUTCDate()-6);const chartSeries=from===to?performanceSeries(accounts,journals,chartFrom.toISOString().slice(0,10),to,sample):series;
 const points=chartSeries.rows.map(r=>({...r,value:performanceValue(metric,r.current),last:performanceValue(metric,r.prior)}));
 const max=Math.max(1,...points.flatMap(p=>[p.value??0,p.last??0])),min=Math.min(0,...points.flatMap(p=>[p.value??0,p.last??0]));
 const top=metric==='Margin'?Math.ceil(max/10)*10:Math.ceil(max/Math.pow(10,Math.floor(Math.log10(max))))*Math.pow(10,Math.floor(Math.log10(max)));
 const y=(n:number)=>150-(n-min)/(top-min)*135,zero=y(0);
 const linePoints=points.filter(p=>p.value!==null).map(p=>[chartWidth/points.length*(points.indexOf(p)+.5),y(p.value!)]);
 const link=(path:string,filters:Record<string,string>={})=>dashboardLink(path,from,to,sample,site,filters);
 return <div className="admin-insights">
 <section className="admin-sales-performance" aria-label="Sales Performance"><header><h2><ChartNoAxesColumnIncreasing/>Sales Performance</h2><div role="tablist" aria-label="Performance metric">{(['Sales','GP','Margin','Expense'] as const).map(m=><button type="button" key={m} role="tab" id={`${metricId}-${m}`} aria-controls={`${metricId}-chart`} tabIndex={metric===m?0:-1} aria-selected={metric===m} onKeyDown={e=>{const tabs:PerformanceMetric[]=['Sales','GP','Margin','Expense'];if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=tabs[e.key==='Home'?0:e.key==='End'?3:(tabs.indexOf(m)+(e.key==='ArrowRight'?1:3))%4];setMetric(next);setHovered(null);document.getElementById(`${metricId}-${next}`)?.focus();}}} onClick={()=>{setMetric(m);setHovered(null);}}>{m}</button>)}</div></header>
 <div role="tabpanel" id={`${metricId}-chart`} aria-labelledby={`${metricId}-${metric}`}><div className="admin-performance-total"><strong>{format(current)}</strong><span>{from.slice(5)==='01-01'?'YTD':'Selected period'}</span>{change!==null&&<small className={change<0?'negative':''}><ArrowUpCircle/>{change>=0?'+':''}{change.toFixed(1)}{metric==='Margin'?' pp':'%'} vs LY</small>}</div>
 <div className="admin-performance-legend"><span><i/>This Year</span><span><i/>Last Year</span></div>
 <div className="admin-performance-chart" style={{gridTemplateColumns:'35px minmax(0,1fr)'}}><div className="admin-performance-axis">{[1,.8,.6,.4,.2,0].map(r=><span key={r}>{metric==='Margin'?Math.round(min+(top-min)*r)+'%':Math.abs(min+(top-min)*r)>=1000?Math.round((min+(top-min)*r)/1000)+'K':Math.round(min+(top-min)*r)}</span>)}</div><div className="admin-performance-plot" ref={plotRef}><svg viewBox={`0 0 ${chartWidth} 175`} preserveAspectRatio="none" role="img" aria-label={`${metric}, current and last year, ${from===to?chartFrom.toISOString().slice(0,10):from} to ${to}`}><defs><linearGradient id="admin-sales-green" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#1da221"/><stop offset="1" stopColor="#087d10"/></linearGradient></defs>{[0,.2,.4,.6,.8,1].map(r=><line key={r} x1="0" x2={chartWidth} y1={15+r*135} y2={15+r*135} stroke="#f1f4f3"/>)}{linePoints.length>0&&<path d={`M ${linePoints[0][0]} ${zero} L ${linePoints.map(p=>p.join(' ')).join(' L ')} L ${linePoints[linePoints.length-1][0]} ${zero} Z`} fill="url(#admin-sales-green)" opacity=".18"/>}<polyline points={linePoints.map(p=>p.join(',')).join(' ')} fill="none" stroke="#087f5b" strokeWidth="2.5" pointerEvents="none"/>{points.map((p,i)=>{const width=chartWidth/points.length,x=width*(i+.5);return <g key={p.key} tabIndex={0} role="button" aria-label={`${p.label}: ${metric} ${format(p.value)}; last year ${format(p.last)}`} onMouseEnter={()=>setHovered(p.key)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(p.key)} onBlur={()=>setHovered(null)}><rect x={i*width} y="0" width={width} height="175" fill="transparent"/>{p.value!==null&&<circle cx={x} cy={y(p.value)} r="3.2" fill="white" stroke="#087f5b" strokeWidth="2"/>}<text x={x} y="169" textAnchor="middle" fontSize="11" fill="#344f67">{p.label}</text></g>;})}</svg>{hovered&&points.filter(p=>p.key===hovered).map(p=><div role="tooltip" key={p.key} className="admin-performance-tooltip"><b>{p.label} · {metric}</b><span>This Year: {format(p.value)}</span><span>Last Year: {format(p.last)}</span></div>)}</div></div>
 <p className="admin-insight-note">{sample?'Sample · Read-only · ':''}Trend: {from===to?chartFrom.toISOString().slice(0,10):from} – {to} · {metric==='Expense'?'Operating expenses, excluding COGS':metric==='Margin'?'Gross margin':'Excluding GST'}</p></div>
 </section>
 {priorities}
 <section className="admin-inventory-overview" aria-label="Inventory overview"><header><h2><Layers/>Inventory overview</h2><Link to={link('/inventory')}>View details ↗</Link></header>
 <div className="admin-inventory-values"><div><span>Inventory value</span><strong>{compact(inventory.value)}</strong><small>At cost · {businessSettings().currency}</small></div><div><strong>{compact(inventory.slowValue)}</strong><span>Slow-moving value</span><small>60+ days without sales</small></div><div><strong>{inventory.active.toLocaleString('en-AU')}</strong><span>Active SKUs</span></div></div>
 <div className="admin-inventory-reserved"><span>Reserved Stock</span><strong>{sample?'328 m²':'—'}</strong></div><div className="admin-inventory-status">{[{label:'Low stock',value:inventory.low,Icon:TriangleAlert,tone:'low',filter:'low'},{label:'Out of stock',value:inventory.out,Icon:Wallet,tone:'out',filter:'out'},{label:'Slow moving',value:inventory.slow,Icon:Layers,tone:'slow',filter:'slow'}].map(c=>c.filter==='slow'?<button type="button" key={c.label} className={c.tone} onClick={()=>setShowInventory(!showInventory)} aria-expanded={showInventory}><c.Icon/><span>{c.label}<b>{c.value} SKUs</b></span></button>:<Link to={link('/inventory',{stock:c.filter})} key={c.label} className={c.tone}><c.Icon/><span>{c.label}<b>{c.value} SKUs</b></span></Link>)}</div>
 <button type="button" className="admin-inventory-warning" onClick={()=>document.getElementById('dashboard-stock-shortages')?.scrollIntoView({behavior:'smooth',block:'start'})}><TriangleAlert/><b>{affected} open orders affected by shortages</b><span>Review ↗</span></button>
 <p className="admin-insight-note">{sample?'Sample · Read-only · ':''}As at {to} · 1-year sales history</p>
 {showInventory&&<div className="admin-slow-details"><b>{sample?'Sample · ':''}Slow-moving inventory</b><p>Positive stock with no sales in the last 60 days. Sales reviewed from {summary.since} to {to}.</p><Link to={link('/inventory')}>View inventory valuation →</Link></div>}
 </section>
</div>;
}
