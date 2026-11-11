import {Link} from 'react-router-dom';
import {Database,ShoppingCart,BarChart3,FileText,Landmark,ArrowUpCircle,TriangleAlert} from 'lucide-react';
import {businessSettings} from '../../business-workspace/configurationState';
import {fiscalYearStart} from '../../../lib/businessDate';
import {useAccounts,useJournalEntries} from '../../accounting/data/useAccounting';
import {calculateProfitAndLoss} from '../../accounting/data/profitAndLossService';
import {useSupplierBills} from '../../purchases/data/useSupplierBills';
import {useSupplierCredits} from '../../purchases/data/useSupplierCredits';
import {purchaseAnalysisSources} from '../../net-analysis/analysisSources';
import {calculateNetAnalysis} from '../../net-analysis/netAnalysisService';
import {useFinanceOverview} from '../data/useFinanceOverview';
import {dashboardLink} from '../pages/dashboardLink';
import './admin-financial-summary.css';
export function adminSummaryPeriods(to:string){
 const [year,month,day]=to.split('-').map(Number),priorYear=year-1,lastDay=new Date(Date.UTC(priorYear,month,0)).getUTCDate();
 const priorTo=`${priorYear}-${String(month).padStart(2,'0')}-${String(Math.min(day,lastDay)).padStart(2,'0')}`;
 return {from:fiscalYearStart(to),to,priorFrom:fiscalYearStart(priorTo),priorTo};
}
export function AdminFinancialSummary({sample,date}:{sample:boolean;date:string}){
 const accounts=useAccounts(),journals=useJournalEntries(),bills=useSupplierBills(),credits=useSupplierCredits(),finance=useFinanceOverview(date),period=adminSummaryPeriods(date);
 const pnl=calculateProfitAndLoss(accounts,journals,period.from,date),prior=calculateProfitAndLoss(accounts,journals,period.priorFrom,period.priorTo);
 const money=(n:number)=>new Intl.NumberFormat('en-AU',{style:'currency',currency:businessSettings().currency,maximumFractionDigits:n%1?2:0}).format(n);
 let purchases=0,priorPurchases=0,purchaseError='';
 if(!sample)try{const sources=purchaseAnalysisSources(bills,credits);purchases=calculateNetAnalysis(sources,{from:period.from,to:date}).totals.subtotal;priorPurchases=calculateNetAnalysis(sources,{from:period.priorFrom,to:period.priorTo}).totals.subtotal;}catch(e){purchaseError=(e as Error).message;}
 const comparison=(value:number,previous:number)=>previous===0?'No LY comparison':`${value>=previous?'+':''}${((value-previous)/Math.abs(previous)*100).toFixed(1)}% vs LY`;
 const tiles=[
 {label:'Total Sales (YTD)',value:money(sample?3520000:pnl.salesRevenue),detail:sample?'+12.8% vs LY':comparison(pnl.salesRevenue,prior.salesRevenue),Icon:Database,tone:'sales',path:'/sales',growth:true},
 {label:'Total Purchases (YTD)',value:purchaseError?'—':money(sample?2410000:purchases),detail:purchaseError?'Source records require review':sample?'+9.6% vs LY':comparison(purchases,priorPurchases),Icon:ShoppingCart,tone:'purchases',path:'/purchases',growth:!purchaseError},
 {label:'Gross Profit (YTD)',value:money(sample?1110000:pnl.grossProfit),detail:'Gross Margin '+(sample?'31.5%':pnl.grossMarginPercent===null?'—':pnl.grossMarginPercent.toFixed(1)+'%'),Icon:BarChart3,tone:'profit',path:'/accounting/profit-and-loss'},
 {label:'Accounts Receivable',value:money(sample?468200:finance.receivables),detail:`${sample?12:finance.overdueInvoiceCount} overdue · ${money(sample?168450:finance.overdueReceivables)}`,Icon:FileText,tone:'receivable',path:'/sales/invoice-reminders',alert:true},
 {label:'Accounts Payable',value:money(sample?392600:finance.payables),detail:`${sample?6:finance.dueThisWeekBillCount} due in 7 days · ${money(sample?132000:finance.dueThisWeek)}`,Icon:FileText,tone:'payable',path:'/purchases/payables',alert:true},
 {label:'Cash at Bank',value:money(sample?785300:finance.bankStatus.reduce((n,b)=>n+b.balance,0)),detail:`${sample?3:finance.bankStatus.length} Bank Accounts`,Icon:Landmark,tone:'cash',path:'/banking'},
 ];
 return <section className="admin-financial-summary" aria-label={sample?'Sample · Read-only · Admin financial summary':'Admin financial summary'}>{tiles.map(t=><Link key={t.label} className={'admin-summary-tile '+t.tone} to={dashboardLink(t.path,period.from,date,sample,'ALL',t.path==='/sales'?{tab:'INVOICE'}:t.path==='/sales/invoice-reminders'?{filter:'Overdue'}:{})} title={`${sample?'Sample · ':''}${period.from} – ${date} · YTD follows the configured financial year. Sales, purchases and profit exclude GST; balances are as at the end date.${t.tone==='purchases'&&purchaseError?' '+purchaseError:''}`}><span className="admin-summary-icon"><t.Icon/></span><div><h3>{t.label}</h3><strong>{t.value}</strong><small className={t.alert?'alert':t.growth?(t.detail.startsWith('-')?'decline':'growth'):''}>{t.alert?<TriangleAlert/>:t.growth?<ArrowUpCircle/>:null}{t.detail}</small></div></Link>)}</section>;
}
