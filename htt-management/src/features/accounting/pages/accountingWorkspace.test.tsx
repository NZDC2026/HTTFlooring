import {expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
vi.mock('../data/useAccounting',()=>({useAccounts:()=>[],useJournalEntries:()=>[]}));
vi.mock('../data/useBalanceSheet',()=>({useBalanceSheet:()=>({totalAssets:12,totalLiabilities:4,totalEquity:8})}));
vi.mock('../data/useProfitAndLoss',()=>({useProfitAndLoss:()=>({netProfit:3})}));
import {ChartOfAccountsPage} from './ChartOfAccountsPage';
it('shows populated isolated sample accounts, metrics and linked closing tools',()=>{
 const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/accounting?sample=1']}><ChartOfAccountsPage/></MemoryRouter>);
 expect(html).toContain('3,245,680.00');expect(html).toContain('Operating Bank');expect(html).toContain('Sample · By Morgan');expect(html).toContain('Read-only, excluded from live records');expect(html).toContain('href="/accounting/periods"');expect(html).toContain('href="/accounting/year-end"');expect(html).toContain('href="/reports/tax-summary"');expect(html).toContain('Showing 1–10 of 10 accounts');
});
it('keeps live empty state separate from synthetic activity and balances',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><ChartOfAccountsPage/></MemoryRouter>);
 expect(html).toContain('$12.00');expect(html).toContain('No matching accounts.');expect(html).toContain('No journal activity recorded.');expect(html).toContain('Not configured');expect(html).not.toContain('JE-SAMPLE-02684');expect(html).not.toContain('3,245,680.00');
});
