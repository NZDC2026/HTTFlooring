import {renderToStaticMarkup} from 'react-dom/server';
import {describe,it,expect} from 'vitest';
import {ReservedStock,eligibleBatch,reservationSamples} from './ReservedStock';
describe('Reserved Stock',()=>{
 it('shows populated reservation states and actions in the isolated preview',()=>{const html=renderToStaticMarkup(<ReservedStock sample/>);for(const label of ['SO-10391','Expired 18 Oct','Deposit paid','Paid in full','Release stock','Extend','Follow up','Pick list','Edit rules'])expect(html).toContain(label);});
 it('keeps sample orders out of the live view',()=>{const html=renderToStaticMarkup(<ReservedStock sample={false}/>);expect(html).not.toContain('SO-10391');expect(html).toContain('Enable Sample');});
 it('only permits positive quantities that fit a single batch',()=>{expect(eligibleBatch(516,450)).toBe(true);expect(eligibleBatch(420,450)).toBe(false);expect(eligibleBatch(516,0)).toBe(false);expect(eligibleBatch(516,-1)).toBe(false);});
 it('has unique order IDs and populated product batch allocations',()=>{expect(new Set(reservationSamples.map(o=>o.id)).size).toBe(reservationSamples.length);expect(reservationSamples.every(o=>o.items.every(([,n,b])=>n>0&&!!b))).toBe(true);});
});
