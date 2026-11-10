import {useListState} from '../../../hooks/useListState';
import {Link} from 'react-router-dom';
import {Landmark} from 'lucide-react';
import {BankingFrame} from './BankingFrame';
import {useBankAccounts} from '../data/useBanking';
import {useJournalEntries} from '../../accounting/data/useAccounting';
import {calculateBankRegister} from '../data/bankRegisterService';
import {usePermission} from '../../security/usePermission';
import {businessDateKey} from '../../../lib/businessDate';
import {BankAccountRegisterContent} from './BankAccountDetailPage';
import {BankReconciliationContent} from './BankReconciliationPage';
export function BankAccountsListPage(){
 const banks=useBankAccounts(),journals=useJournalEntries(),canWrite=usePermission('banking.write'),[query,setQuery]=useListState("src/features/banking/pages/BankingSubpages.tsx:query", ''),[status,setStatus]=useListState("src/features/banking/pages/BankingSubpages.tsx:status", 'All');
 const rows=banks.filter(b=>(status==='All'||b.active===(status==='Active'))&&`${b.name} ${b.bankName} ${b.accountNumber}`.toLowerCase().includes(query.toLowerCase()));
 return <BankingFrame title="Bank Accounts" tab="Bank Accounts" actions={canWrite&&<Link className="bk-button primary" to="/banking/setup/accounts/new">+ Add Bank Account</Link>}><section className="bk-card"><div className="bk-section-heading"><h2>Bank Accounts ({rows.length})</h2><div className="bk-actions"><input aria-label="Search bank accounts" placeholder="Search name, bank or account number…" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Account status" value={status} onChange={e=>setStatus(e.target.value)}>{['All','Active','Inactive'].map(s=><option key={s}>{s}</option>)}</select></div></div>{rows.map(b=><div className="bk-bank" key={b.id}><Landmark/><div className="bk-bank-name"><Link to={`/banking/setup/accounts/${b.id}`}><strong>{b.name}</strong></Link><p>{b.bankName} · •••• {b.accountNumber.slice(-4)} · {b.currency}</p></div><div className="bk-balance"><small>Balance</small><strong>{calculateBankRegister(b,journals,businessDateKey(new Date().toISOString())).closingBalance.toLocaleString('en-AU',{style:'currency',currency:b.currency})}</strong></div><span className={`bk-badge ${b.active?'green':'gray'}`}>{b.active?'Active':'Inactive'}</span><Link className="bk-button" to={`/banking/accounts/${b.id}`}>View Register →</Link>{canWrite&&<Link className="bk-button" to={`/banking/setup/accounts/${b.id}/edit`}>Edit</Link>}</div>)}{!rows.length&&<p className="bk-empty">No matching bank accounts.</p>}</section></BankingFrame>;
}
export function BankingTransactionsPage({reconciliation=false}:{reconciliation?:boolean}){
 const banks=useBankAccounts(),[selected,setSelected]=useListState('src/features/banking/pages/BankingSubpages.tsx:selected', ''),canReconcile=usePermission('banking.reconcile'),id=selected||banks[0]?.id;
 return <BankingFrame title={reconciliation?'Bank Reconciliation':'Transactions'} tab={reconciliation?'Reconciliation':'Transactions'} actions={<Link className="bk-button" to="/banking/import">Import Transactions</Link>}><section className="bk-card"><label>Bank Account <select aria-label="Bank account" value={id??''} onChange={e=>setSelected(e.target.value)}>{!banks.length&&<option value="">No bank accounts</option>}{banks.map(b=><option key={b.id} value={b.id}>{b.name} · {b.currency}</option>)}</select></label>{reconciliation&&<Link className="bk-button" to="/banking/workbench">Statement matching workbench →</Link>}</section>{id?(reconciliation?(canReconcile?<BankReconciliationContent key={id} accountId={id}/>:<p className="bk-card">Your role cannot reconcile bank accounts.</p>):<BankAccountRegisterContent key={id} accountId={id}/>):<p className="bk-card">Add a bank account to begin, or enable Sample to preview the workflow.</p>}</BankingFrame>;
}
