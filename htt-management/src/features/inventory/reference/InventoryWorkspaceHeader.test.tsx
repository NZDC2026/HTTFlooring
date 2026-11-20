import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {InventoryWorkspaceHeader,type InventoryWorkspaceTab} from './InventoryWorkspaceHeader';
it.each(['overview','stock','movements','adjustments','damage','reserved'] as InventoryWorkspaceTab[])('keeps one active tab and seven consistent sample-preserving destinations for %s',active=>{
 const html=renderToStaticMarkup(<MemoryRouter><InventoryWorkspaceHeader active={active} sample/></MemoryRouter>);
 expect(html.match(/data-ui="tab"/g)).toHaveLength(7);expect(html.match(/aria-current="page"/g)).toHaveLength(1);expect(html.match(/sample=1/g)).toHaveLength(7);
 expect(html).not.toContain('Sold &amp; Bought');expect(html).not.toContain('Clearance Stock');expect(html).toContain('Inventory tabs');expect(html).toContain('/inventory/scan?sample=1');
});
it('keeps live navigation outside the sample workspace',()=>{const html=renderToStaticMarkup(<MemoryRouter><InventoryWorkspaceHeader active="damage" sample={false}/></MemoryRouter>);expect(html.match(/sample=0/g)).toHaveLength(6);expect(html).not.toContain('sample=1');});
