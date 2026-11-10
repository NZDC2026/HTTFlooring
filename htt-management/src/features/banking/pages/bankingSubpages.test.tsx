import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {BankingFrame} from './BankingFrame';
it.each(['Bank Accounts','Transactions','Reconciliation'])('isolates %s Sample from live workflow',tab=>{
 const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/banking/transactions?sample=1']}><BankingFrame title={tab} tab={tab}><form>LIVE POSTING FORM</form></BankingFrame></MemoryRouter>);
 expect(html).toContain('Read-only');expect(html).toContain('Sample');expect(html).not.toContain('LIVE POSTING FORM');expect(html).toContain('href="/banking/reconciliation"');
 if(tab==='Reconciliation'){expect(html).toContain('Completed · Sample');expect(html).toContain('Pending review · Sample');expect(html).toContain('$0.00');}
 if(tab==='Transactions'){expect(html).toContain('INV-SAMPLE-4725');expect(html).toContain('Unreconciled');}
});
it('keeps real content when Sample is off',()=>{const html=renderToStaticMarkup(<MemoryRouter><BankingFrame title="Transactions" tab="Transactions"><p>Live register</p></BankingFrame></MemoryRouter>);expect(html).toContain('Live register');expect(html).not.toContain('INV-SAMPLE-4725');});
