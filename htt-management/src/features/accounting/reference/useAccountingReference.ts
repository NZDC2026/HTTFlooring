import {useSyncExternalStore} from 'react';
import {useAccounts,useJournalEntries,useGeneralLedgerSummary} from '../data/useAccounting';
import {useProfitAndLoss} from '../data/useProfitAndLoss';
import {accountingPeriodRepository} from '../data/accountingPeriodRepository';
import {useStatementLines} from '../../finance-closure/bankStatementRepository';
import type {ReferenceAccount,ReferenceJournal} from './accountingReferenceModel';
export function useAccountingReference(today:string){const accounts=useAccounts(),entries=useJournalEntries(),ledger=useGeneralLedgerSummary(today),profit=useProfitAndLoss(today.slice(0,7)+'-01',today),periods=useSyncExternalStore(accountingPeriodRepository.subscribe,accountingPeriodRepository.getAll,accountingPeriodRepository.getAll),statements=useStatementLines();
const rows:ReferenceAccount[]=accounts.map(a=>({id:a.id,code:a.code,name:a.name,type:a.type==='ASSET'?'Asset':a.type==='LIABILITY'?'Liability':a.type==='EQUITY'?'Equity':a.type==='REVENUE'?'Income':a.systemRole==='COST_OF_GOODS_SOLD'||a.systemRole==='PURCHASES'||a.systemRole==='FREIGHT'?'Cost of sales':'Expense',tax:'—',active:a.active,balance:ledger.accountBalances.find(b=>b.account.id===a.id)?.balance??0}));
const journals:ReferenceJournal[]=entries.filter(e=>e.sourceType==='MANUAL_JOURNAL').map((e):ReferenceJournal=>({id:e.id,number:e.journalNumber,date:e.journalDate,narration:e.description,status:e.status==='REVERSED'?'Reversed':'Posted',path:'/accounting/journals/'+e.id,lines:e.lines.map(l=>({account:l.accountCode,debit:l.debit,credit:l.credit}))})).sort((a,b)=>b.date.localeCompare(a.date));
return {accounts:rows,journals,periods,profit,pendingBank:statements.filter(l=>l.status==='UNMATCHED').length,lockedThrough:periods.filter(p=>p.status==='CLOSED').map(p=>p.endDate).sort().at(-1)??'',current:periods.find(p=>p.startDate<=today&&p.endDate>=today)};}
