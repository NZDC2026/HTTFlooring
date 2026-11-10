import {expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
vi.mock('../security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'test-admin',roles:['ADMIN']}}})}));
vi.mock('./transferClient',()=>({useTransferRuns:()=>[],transferClient:{}}));
import {DataTransferPage} from './DataTransferPage';
it('renders separate import/export tabs, dataset cards, four safe stages and isolated sample switch',()=>{
 const html=renderToStaticMarkup(<DataTransferPage/>);
 for(const label of ['Import Data','Export Data','Select Data','Upload File','Map &amp; Validate','Products &amp; Services','Customer contacts','Import History','Templates &amp; Guides','Download CSV Template','no business records are created'])expect(html).toContain(label);
 expect(html).not.toContain('Commit entire validated batch');
});
