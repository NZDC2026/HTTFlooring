import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {SalesCreateMenu} from './SalesCreateMenu';
import {documentEntryPath} from './DocumentEntryTabs';
it.each([false,true])('opens each create action at its matching tab, sample=%s',sample=>{
 const html=renderToStaticMarkup(<MemoryRouter><SalesCreateMenu sample={sample}/></MemoryRouter>);
 for(const kind of ['ORDER','QUOTE','INVOICE'] as const)expect(html).toContain('href="'+documentEntryPath(kind,{sample})+'"');
 for(const label of ['New Sales Order','New Quote','New Invoice'])expect(html).toContain(label);
 expect(html).not.toContain('disabled');
});
