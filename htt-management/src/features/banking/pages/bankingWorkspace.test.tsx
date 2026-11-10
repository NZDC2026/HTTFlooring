import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
vi.mock('../data/useBanking',()=>({useBankAccounts:()=>[]}));
vi.mock('../../accounting/data/useAccounting',()=>({useJournalEntries:()=>[]}));
vi.mock('../../finance-closure/bankStatementRepository',()=>({useStatementLines:()=>[]}));
vi.mock('../../security/usePermission',()=>({usePermission:()=>true}));
import {BankingPage} from './BankingPage';
it('renders read-only populated preview with receipt/payment totals and reconciliation states',()=>{
 const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/banking?sample=1']}><BankingPage/></MemoryRouter>);
 expect(html).toContain('$25,680.00');expect(html).toContain('$22,680.00');expect(html).toContain('$3,000.00');expect(html).toContain('Sample Parkside Interiors');expect(html).toContain('Reconciled');expect(html).toContain('Unreconciled');expect(html).toContain('excluded from live balances');expect(html).toContain('Showing 1–5 of 7 transactions');expect(html).not.toContain('href="/banking/accounts/sample-bank');
});
it('preserves live empty state and functional workflow navigation',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><BankingPage/></MemoryRouter>);
 expect(html).toContain('No bank accounts configured.');expect(html).toContain('No transactions in this period.');expect(html).toContain('href="/banking/import"');expect(html).toContain('href="/banking/setup/accounts/new"');expect(html).toContain('href="/banking/rules"');expect(html).not.toContain('INV-SAMPLE-4725');
});
