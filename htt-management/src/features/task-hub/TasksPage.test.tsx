import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
vi.mock('./useTaskHub',()=>({useTaskHub:()=>({rows:[],customers:[],suppliers:[],history:[]}),completeHubTask:vi.fn(),replyHubTask:vi.fn()}));
vi.mock('../security/securityClient',()=>({useSecurity:()=>({session:{user:{id:'admin',roles:['ADMIN']}}})}));
vi.mock('../security/usePermission',()=>({usePermission:()=>true}));
import {TasksPage} from './TasksPage';
it('renders unified tasks layout, filtering, quick actions and isolated sample entry',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><TasksPage/></MemoryRouter>);
 for(const text of ['Tasks &amp; Action Centre','My Tasks','Completed (This Week)','Team Tasks','Site Visits','Open Actions','Customer / Supplier','Create Task','Payment Follow-up','Recent Activity','Interactive isolated preview'])expect(html).toContain(text);
 expect(html).not.toContain('Business register');
});
