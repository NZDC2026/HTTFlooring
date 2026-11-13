import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {DocumentEntryTabs,documentEntryTabs} from './DocumentEntryTabs';
it.each(documentEntryTabs)('uses the same four destinations with one selected tab for $kind',({kind})=>{
 const html=renderToStaticMarkup(<MemoryRouter><DocumentEntryTabs current={kind} sample customerId="customer-1"/></MemoryRouter>);
 expect(html.match(/role="tab"/g)).toHaveLength(4);expect(html.match(/aria-selected="true"/g)).toHaveLength(1);expect(html.match(/aria-current="page"/g)).toHaveLength(1);
 for(const tab of documentEntryTabs)expect(html).toContain(tab.path+'?sample=1'+(tab.kind==='PURCHASE'?'':'&amp;customerId=customer-1'));
});
