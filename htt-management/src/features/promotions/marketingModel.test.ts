import {expect,it} from 'vitest';
import {filterMarketingRecipients,marketingSampleRecipients,recipientSummary} from './marketingModel';
it('matches the populated reference totals without counting missing addresses or unsubscribed customers twice',()=>{
 const rows=marketingSampleRecipients(),summary=recipientSummary(rows,'Email',new Set());
 expect(summary.matched).toBe(119);expect(summary.missing).toBe(7);expect(summary.unsubscribed).toBe(3);expect(summary.selected).toHaveLength(110);
 expect(summary.selected.some(r=>!r.email||r.unsubscribed)).toBe(false);
});
it('filters and deselects recipients across pages and recalculates channel eligibility',()=>{
 const rows=marketingSampleRecipients(),excluded=new Set([rows[0].id,rows[25].id]);
 expect(recipientSummary(rows,'Email',excluded).selected).toHaveLength(108);
 const filtered=filterMarketingRecipients(rows,{query:'Oak Living',type:'Installer',level:'Normal',rep:'House',product:'Hybrid SPC',since:'2026-11-01'});
 expect(filtered.map(r=>r.name)).toEqual(['Oak Living Pty Ltd']);
 expect(recipientSummary(rows,'SMS',new Set()).selected.every(r=>!!r.mobile&&!r.unsubscribed)).toBe(true);
});
