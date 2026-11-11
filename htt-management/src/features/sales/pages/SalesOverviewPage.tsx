import {useDashboardEntry} from '../../../hooks/useDashboardEntry';
import {DateRangePicker} from '../../../components/date-range/DateRangePicker';
import {useListState} from '../../../hooks/useListState';
import {CustomerSearchSelect,CustomerSearchSample} from '../components/CustomerSearchSelect';
import {SalesRowActions} from '../components/SalesRowActions';
import {SalesQuickView} from '../components/SalesQuickView';
import {salesFulfilmentLabel,salesDisplayDate,salesRegisterBalance,salesReferenceMatches} from '../data/salesRegisterView';
import {usePayments} from '../data/usePayments';
import './sales-documents.css';
import {QuoteForm} from '../components/QuoteForm';
import {useCustomers} from '../../contacts/data/useCustomers';
import {useCreditNotes} from '../data/useCreditNotes';
import {businessDateKey} from '../../../lib/businessDate';
import {salesOverviewMetrics,salesRegisterSamples} from '../data/salesOverviewMetrics';
import { DataTable } from '../../../components/data-table/DataTable';
import {usePermission} from '../../security/usePermission';
import { businessSettings } from '../../business-workspace/configurationState';
import { useEffect, useMemo, useState } from "react";
import { Eye, Search, ShoppingCart, FileText, MoreHorizontal, ChartNoAxesColumn, CircleAlert, ReceiptText, Truck, SlidersHorizontal } from "lucide-react";
import { Link,useSearchParams } from "react-router-dom";

import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";
import { customerRepository } from "../../contacts/data/customerRepository";
import { useSalesDocuments } from "../data/useSalesDocuments";
import type { SalesDocument, SalesDocumentType } from "../types/salesDocument";

type Tab = "ALL" | SalesDocumentType;
const tabs: { value: Tab; label: string }[] = [
    { value: "ALL", label: "All documents" },
    { value: "QUOTE", label: "Quotes" },
    { value: "SALES_ORDER", label: "Sales orders" },
    { value: "INVOICE", label: "Invoices" },
];

export function getSalesDocumentPath(document: SalesDocument): string {
    if (document.type === "QUOTE") return `/sales/quotes/${document.id}`;
    if (document.type === "SALES_ORDER") return `/sales/orders/${document.id}`;
    return `/sales/invoices/${document.id}`;
}

export function SalesOverviewPage() {
    const payments=usePayments();
    const [entrySearch,setEntrySearch]=useSearchParams();
    const customers=useCustomers(),credits=useCreditNotes(),[customerFilter,setCustomerFilter]=useListState("src/features/sales/pages/SalesOverviewPage.tsx:customerFilter", 'ALL'),[newQuote,setNewQuote]=useState(false),[quoteCustomer,setQuoteCustomer]=useState(''),[moreFilters,setMoreFilters]=useListState("src/features/sales/pages/SalesOverviewPage.tsx:moreFilters", false),[fulfilmentFilter,setFulfilmentFilter]=useListState("src/features/sales/pages/SalesOverviewPage.tsx:fulfilmentFilter", 'ALL'),[documentTypeFilter,setDocumentTypeFilter]=useListState<Tab>("src/features/sales/pages/SalesOverviewPage.tsx:documentTypeFilter", 'ALL');
    const canManage=usePermission('sales.manage');
    useEffect(()=>{if(entrySearch.get('newQuote')==='1'&&canManage){setQuoteCustomer(entrySearch.get('customerId')??'');setNewQuote(true);setEntrySearch({}, {replace:true});}},[entrySearch,canManage,setEntrySearch]);
    const canReadCost=usePermission('inventory.cost.read');
    const liveDocuments = useSalesDocuments();
    const today=businessDateKey(new Date().toISOString());
    const [sample,setSample]=useListState("src/features/sales/pages/SalesOverviewPage.tsx:sample", false),[special,setSpecial]=useListState("src/features/sales/pages/SalesOverviewPage.tsx:special", '');
    const documents=useMemo(()=>sample?salesRegisterSamples(today):liveDocuments,[sample,today,liveDocuments]);
    const [tab, setTab] = useListState<Tab>("src/features/sales/pages/SalesOverviewPage.tsx:tab", "ALL");
    const [query, setQuery] = useListState("src/features/sales/pages/SalesOverviewPage.tsx:query", "");
    const [status, setStatus] = useListState("src/features/sales/pages/SalesOverviewPage.tsx:status", "ALL");
    const [dateFrom, setDateFrom] = useListState("src/features/sales/pages/SalesOverviewPage.tsx:dateFrom", "");
    const [dateTo, setDateTo] = useListState("src/features/sales/pages/SalesOverviewPage.tsx:dateTo", "");
    useDashboardEntry(p=>{setSample(p.get('sample')==='1');setSpecial(p.get('special')||'');setTab((p.get('tab')||'ALL') as Tab);setStatus('ALL');setQuery(p.get('query')||'');setCustomerFilter('ALL');setFulfilmentFilter('ALL');setDocumentTypeFilter('ALL');setDateFrom(p.get('from')||'');setDateTo(p.get('to')||'');});
    const [preview, setPreview] = useState<SalesDocument | null>(null);
    useEffect(() => {
        if(entrySearch.get('awaitingDispatch')!=='1') return;
        setSample(false);setSpecial('awaiting');setTab('ALL');setStatus('ALL');setQuery('');
        setCustomerFilter('ALL');setFulfilmentFilter('ALL');setDocumentTypeFilter('ALL');
        const next=new URLSearchParams(entrySearch);next.delete('awaitingDispatch');setEntrySearch(next,{replace:true});
    },[entrySearch,setEntrySearch,setSample,setSpecial,setTab,setStatus,setQuery,setCustomerFilter,setFulfilmentFilter,setDocumentTypeFilter]);

    useEffect(() => {
        if (!preview) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setPreview(null);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [preview]);
    const currency = useMemo(() => new Intl.NumberFormat("en-AU", { style: "currency", currency: businessSettings().currency }), []);
    const metrics=useMemo(()=>salesOverviewMetrics(documents,today,dateFrom,dateTo),[documents,today,dateFrom,dateTo]);
    const filtered = useMemo(() => {
        const specialBypassesDates=['overdue','awaiting','pickup','delivery'].includes(special);
        return documents.filter((document) => {
            if(['pickup','delivery'].includes(special)){
                if(!metrics.awaiting.some(d=>d.id===document.id))return false;
                if(special==='pickup'&&!document.awaitingCollection)return false;
                if(special==='delivery'&&!document.deliveryBooked)return false;
                if(!document.expectedDispatchDate||dateFrom&&document.expectedDispatchDate<dateFrom||dateTo&&document.expectedDispatchDate>dateTo)return false;
            }
            if(special==='processing'&&(document.type!=='SALES_ORDER'||!['DRAFT','CONFIRMED'].includes(document.status)))return false;
            if(special==='pendingQuotes'&&(document.type!=='QUOTE'||!['DRAFT','SENT'].includes(document.status)))return false;
            if(special==='closed' &&(document.type!=='INVOICE'||document.status!=='PAID'))return false;
            if(documentTypeFilter!=='ALL'&&document.type!==documentTypeFilter)return false;
            if(fulfilmentFilter!=='ALL'&&salesFulfilmentLabel(document,documents)!==fulfilmentFilter)return false;
            if(customerFilter!=='ALL'&&document.customerId!==customerFilter)return false;
            if(special==='overdue'&&!metrics.overdue.some(d=>d.id===document.id))return false;
            if(special==='awaiting'&&!metrics.awaiting.some(d=>d.id===document.id))return false;
            if(special==='unpaid'&&!metrics.invoices.some(d=>d.id===document.id))return false;
            if (tab !== "ALL" && document.type !== tab) return false;
            if (status !== "ALL" && document.status !== status) return false;
            if (!specialBypassesDates && ((dateFrom && document.documentDate < dateFrom) || (dateTo && document.documentDate > dateTo))) return false;
            const customer = customerRepository.getById(document.customerId);
            return salesReferenceMatches(document,customer?.businessName??(sample?'Sample Harbour Flooring':''),query);
        }).sort((a, b) => b.documentDate.localeCompare(a.documentDate));
    }, [documents, query, status, tab, dateFrom, dateTo, special, metrics,customerFilter,fulfilmentFilter,documentTypeFilter]);
    const filteredTotal = filtered.filter(d=>tab!=='ALL'||d.type==='INVOICE').reduce((sum, document) => sum + Math.round(document.totals.subtotal * 100), 0) / 100;
    const statuses = [...new Set(documents.filter((d) => tab === "ALL" || d.type === tab).map((d) => d.status))].sort();


    return (
        <div className="sales-documents-page">
            <div className="sales-breadcrumb">Sales <span>›</span> Sales Documents</div>
            <header className="sales-documents-heading"><div><h1>Sales Documents</h1><p>Manage quotes, sales orders, invoices, returns and credits. Track order, delivery and payment status in one place.</p></div><nav aria-label="Sales actions"><Link to="/sales/invoice-reminders"><CircleAlert size={16}/>Invoice Reminders</Link>
            {canManage&&!sample&&<><Link className="sales-primary" to="/sales/drafts/orders/new"><ShoppingCart size={16}/>New Sales Order</Link><button onClick={()=>{setNewQuote(true);setQuoteCustomer('');}}><FileText size={16}/>New Quote</button><Link to="/sales/drafts/invoices/new"><ReceiptText size={16}/>New Invoice</Link></>}
            <details className="sales-more"><summary aria-label="More sales actions"><MoreHorizontal size={19}/></summary><div><Link to="/sales/drafts/orders">Order drafts</Link><Link to="/sales/drafts/invoices">Invoice drafts</Link><Link to="/sales/customer-deposits">Customer deposits</Link>{canReadCost&&<Link to="/sales/customer-returns">Physical customer returns</Link>}<Link to="/documents/delivery">Document preparation</Link><Link to="/sales/credit-returns">Returns &amp; Credits</Link></div></details></nav></header>
            <label className="sales-sample-toggle"><input type="checkbox" checked={sample} onChange={e=>{setSample(e.target.checked);setCustomerFilter('ALL');setFulfilmentFilter('ALL');setDocumentTypeFilter('ALL');setPreview(null);setSpecial('');setDateFrom('');setDateTo('');}}/>Sample · Quotation → Order → Invoice · Overdue invoice and awaiting dispatch · Read-only</label>
            <div className="sales-summary-cards">{[
                {label:'Invoiced Sales (ex. GST)',value:currency.format(metrics.sales),detail:'',type:'INVOICE' as Tab,filter:'',Icon:ChartNoAxesColumn},
                {label:'Orders',value:metrics.orders.length,detail:'QU → SO → INV',type:'SALES_ORDER' as Tab,filter:'',Icon:ShoppingCart},
                {label:'Outstanding AR',value:currency.format(metrics.openNet),detail:metrics.invoices.length+' invoices',type:'INVOICE' as Tab,filter:'unpaid',Icon:ReceiptText},
                {label:'Overdue Invoice',value:currency.format(metrics.overdueNet),detail:metrics.overdue.length+' invoices',type:'INVOICE' as Tab,filter:'overdue',Icon:CircleAlert},
                {label:'Awaiting Dispatch',value:metrics.awaitingCount,detail:'Booked deliveries / collections',type:'ALL' as Tab,filter:'awaiting',Icon:Truck},
            ].map(c=><div className={'sales-summary-card '+(c.filter==='overdue'?'sales-overdue':'')} key={c.label}><button className="sales-card-main" onClick={()=>{setTab(c.type);setStatus('ALL');setSpecial(c.filter);}}><span className="sales-card-icon"><c.Icon size={22}/></span><span><small>{c.label}{sample?' · Sample':''}</small><strong>{c.value}{(c.filter==='unpaid'||c.filter==='overdue')&&<small className="sales-main-tax">ex. GST</small>}</strong>{c.type==='SALES_ORDER'&&<span className="sales-order-amount">{currency.format(metrics.orders.reduce((sum,order)=>sum+order.totals.subtotal,0))} <small>ex. GST</small></span>}</span></button>{c.type==='SALES_ORDER'?<button className="sales-dispatch-pill" onClick={()=>{setSpecial('awaiting');setTab('ALL');setStatus('ALL');}}><Truck size={13}/>{metrics.awaitingCount} awaiting dispatch</button>:c.detail?<span className="sales-card-detail">{c.detail}</span>:null}</div>)}</div>

            <section className="sales-register-panel">
                <div className="sales-register-tabs">
                    {tabs.map((item) => <button key={item.value} type="button" onClick={() => { setTab(item.value); setStatus("ALL"); setSpecial(item.value==='INVOICE'?'unpaid':''); }} className={tab===item.value&&special!=='closed'?'active':''}>{item.value==='ALL'?'All Sales':item.value==='INVOICE'?'Open Invoices':item.label} ({documents.filter(d=>item.value==='ALL'||(d.type===item.value&&(item.value!=='INVOICE'||d.type==='INVOICE'&&!['DRAFT','VOID'].includes(d.status)&&d.amountDue>0))).length})</button>)}<Link to="/sales/credit-returns">Returns &amp; Credits ({sample?0:credits.length})</Link><button className={special==='closed'?'active':''} onClick={()=>{setSpecial('closed');setTab('INVOICE');setStatus('ALL');}}>Paid Invoices ({documents.filter(d=>d.type==='INVOICE'&&d.status==='PAID').length})</button>
                </div>
                <div className="sales-register-filters"><DateRangePicker from={dateFrom} to={dateTo} onChange={r=>{setDateFrom(r.from);setDateTo(r.to);}}/><label className="sales-search"><Search size={16}/><input aria-label="Search sales documents" placeholder="Search invoice no., customer, customer PO, reference…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Customer filter" value={customerFilter} onChange={e=>setCustomerFilter(e.target.value)}><option value="ALL">All Customers</option>{sample?<option value="sample-customer">Sample Harbour Flooring</option>:customers.map(c=><option key={c.id} value={c.id}>{c.businessName}</option>)}</select><select aria-label="Filter status" value={status} onChange={e=>setStatus(e.target.value)}><option value="ALL">All Statuses</option>{statuses.map(v=><option key={v} value={v}>{v.replaceAll('_',' ')}</option>)}</select><select aria-label="Document type filter" value={documentTypeFilter} onChange={e=>setDocumentTypeFilter(e.target.value as Tab)}>{tabs.map(t=><option key={t.value} value={t.value}>{t.value==='ALL'?'All Document Types':t.label}</option>)}</select><select aria-label="Fulfilment filter" value={fulfilmentFilter} onChange={e=>setFulfilmentFilter(e.target.value)}><option value="ALL">All Fulfilment</option>{['Dispatched','Partially Dispatched','Not Dispatched'].map(v=><option key={v}>{v}</option>)}</select><button onClick={()=>setMoreFilters(!moreFilters)}><SlidersHorizontal size={15}/>More Filters</button></div>
                {moreFilters&&<div className="sales-filter-options"><button onClick={()=>{setQuery('');setStatus('ALL');setTab('ALL');setDateFrom('');setDateTo('');setSpecial('');setCustomerFilter('ALL');setFulfilmentFilter('ALL');setDocumentTypeFilter('ALL');}}>Clear filters</button><span>Overdue is based on due dates across all dates. Awaiting Dispatch includes booked deliveries and waiting collections.</span></div>}
                <div className="sales-register-summary" aria-live="polite"><strong>{filtered.length} records</strong><span>Total Invoiced (ex. GST): <b>{currency.format(filtered.filter(d=>d.type==='INVOICE').reduce((n,d)=>n+d.totals.subtotal,0))}</b></span><span>Outstanding (ex. GST): <b>{currency.format(metrics.openNet)}</b></span><span className="sales-overdue-text">Overdue (ex. GST): <b>{currency.format(metrics.overdueNet)}</b></span>{special&&<button onClick={()=>setSpecial('')}>Clear {special} filter ×</button>}</div>
                <DataTable key={sample?'sample-sales':'live-sales'} data={filtered} columns={[{accessorKey:'documentDate',header:'Date',cell:({row})=>salesDisplayDate(row.original.documentDate)},{accessorKey:'documentNumber',header:'Document No.',cell:({row})=>sample?<button className="sales-document-number" onClick={()=>setPreview(row.original)}>{row.original.documentNumber}</button>:<Link className="sales-document-number" to={getSalesDocumentPath(row.original)}>{row.original.documentNumber}</Link>},{accessorKey:'customerReference',header:'Customer PO / Reference',cell:({row})=>row.original.customerReference || '—'},{accessorKey:'type',header:'Type',cell:({row})=><span className={'sales-type '+row.original.type.toLowerCase()}>{row.original.type==='SALES_ORDER'?'Sales Order':row.original.type==='INVOICE'?'Invoice':'Quote'}</span>},{id:'customer',accessorFn:d=>sample?'Sample Harbour Flooring':customerRepository.getById(d.customerId)?.businessName??'Unknown customer',header:'Customer'},{id:'promisedDate',accessorFn:document=>{const order=document.type==='SALES_ORDER'?document:document.type==='INVOICE'?documents.find(candidate=>candidate.type==='SALES_ORDER'&&candidate.id===document.sourceSalesOrderId):undefined;return document.expectedDispatchDate??(order?.type==='SALES_ORDER'?order.expectedDispatchDate??order.requestedDeliveryDate??'':'');},header:'Promised date',cell:({getValue})=>salesDisplayDate(getValue<string>())},{id:'balance',header:'Balance Due (incl. GST)',accessorFn:salesRegisterBalance,cell:({row})=>salesRegisterBalance(row.original)===undefined?'—':currency.format(salesRegisterBalance(row.original)!)},{id:'fulfilment',header:'Fulfilment',accessorFn:d=>salesFulfilmentLabel(d,documents),cell:({getValue})=><span className="sales-fulfilment">{getValue<string>()}</span>},{accessorKey:'status',header:'Status',cell:({row})=><StatusBadge status={row.original.status}/>},{id:'total',accessorFn:d=>d.totals.subtotal,header:`Total (${businessSettings().currency}) ex. GST`,cell:({row})=>currency.format(row.original.totals.subtotal)},{id:'actions',header:'Quick view',enableHiding:false,meta:{exportable:false},cell:({row})=><div className="sales-row-actions"><Button variant="ghost" size="sm" aria-label={`Preview ${row.original.documentNumber}`} onClick={()=>setPreview(row.original)}><Eye size={16}/> View</Button><SalesRowActions document={row.original} sample={sample}/></div>}]} pagination={{pageSize:10}} capabilities={{id:sample?'sample-sales-documents':'sales-documents',scope:'complete',permission:'sales.read',rowId:d=>d.type+'-'+d.id}}/>
                <div aria-live="polite" className="sales-register-footer">
                    <span className="text-[var(--color-text-secondary)]">
                        {`${dateFrom || "Beginning"} – ${dateTo || "Present"}`}
                        {" · "}{tabs.find(item => item.value === tab)?.label}{" · "}{filtered.length} records
                    </span>
                    <span className="font-semibold">{tab==='ALL'?'Invoiced Total':'Total'} ({businessSettings().currency}) ex. GST</span>
                    <span className="text-xl font-semibold tabular-nums text-[var(--color-primary)]">{currency.format(filteredTotal)}</span>
                </div>
            </section>
            {newQuote&&!sample&&(quoteCustomer?<div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="New Quote"><div className="mx-auto my-4 w-full max-w-7xl"><QuoteForm customerId={quoteCustomer} customerName={customers.find(c=>c.id===quoteCustomer)?.businessName??''} onCancel={()=>setNewQuote(false)} onSaved={()=>setNewQuote(false)}/></div></div>:<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section className="w-full max-w-md rounded-xl bg-white p-6" role="dialog" aria-modal="true" aria-label="Select quote customer"><h2 className="mb-4 font-semibold">New Quote · Select Customer</h2><CustomerSearchSelect customers={customers.filter(c=>c.status==='ACTIVE')} value={quoteCustomer} onChange={setQuoteCustomer}/><CustomerSearchSample/><button className="mt-4 rounded border px-4 py-2" onClick={()=>setNewQuote(false)}>Cancel</button></section></div>)}
            {preview&&<SalesQuickView document={preview} documents={documents} payments={payments} sample={sample} onClose={()=>setPreview(null)} onSelect={setPreview}/>}
        </div>
    );
}
