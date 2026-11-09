import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {DocumentEntrySample} from './DocumentEntrySample';
import {CreateCreditNoteForm} from './CreateCreditNoteForm';
import {salesOverviewSamples} from '../data/salesOverviewMetrics';
import type {Invoice} from '../types/salesDocument';
describe('unified document entry',()=>{
 for(const kind of ['Supplier Bill','Supplier Credit','Expense Bill'] as const)it(kind+' sample has Sales layout and cannot save records',()=>{const html=renderToStaticMarkup(<DocumentEntrySample kind={kind}/>);for(const key of ['entry-layout','entry-main','entry-sidebar','entry-actions','Pricing Summary','Sample Timber Supply','$1,100.00'])expect(html).toContain(key);expect(html).toContain('<fieldset disabled=""');});
 it('customer credit uses inherited discount, original totals and disabled Sample form',()=>{const source=salesOverviewSamples('2026-11-09').find(d=>d.type==='INVOICE') as Invoice;source.lines=source.lines.map(l=>({...l,explicitDiscountPercent:20,discountBaseUnitPrice:62.5}));const html=renderToStaticMarkup(<MemoryRouter><CreateCreditNoteForm invoice={source} readOnlySample onCancel={()=>{}} onSubmit={()=>{throw Error('Sample must not save');}}/></MemoryRouter>);for(const key of ['entry-layout','entry-sidebar','Pricing Summary','Discount %','20%','No second discount','Return Qty'])expect(html).toContain(key);expect(html).toContain('<fieldset disabled=""');expect(html).toContain('$1,100.00');});
});
