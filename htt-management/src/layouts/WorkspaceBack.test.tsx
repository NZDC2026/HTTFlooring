import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {WorkspaceBack,workspaceBackTarget} from './WorkspaceBack';
it.each([['/banking/transactions','/banking'],['/banking/accounts/bank_001/reconcile','/banking'],['/contacts/customers/cus_001/pricing','/contacts/customers/cus_001'],['/contacts/customers/cus_001','/contacts/list'],['/contacts/suppliers','/contacts/supplier-dashboard'],['/contacts/list','/contacts'],['/sales','/dashboard'],['/reports','/dashboard'],['/tools/import-export','/dashboard']])('provides safe direct-entry return for %s',(path,target)=>expect(workspaceBackTarget(path)).toBe(target));
it('renders consistent accessible return link and keeps Sample isolated on fallback',()=>{const html=renderToStaticMarkup(<MemoryRouter initialEntries={['/banking/transactions?sample=1']}><WorkspaceBack contentRef={{current:null}}/></MemoryRouter>);expect(html).toContain('href="/banking?sample=1"');expect(html).toContain('workspace-back');expect(html).toContain('Back');});
it('does not add a redundant return on dashboard',()=>expect(renderToStaticMarkup(<MemoryRouter initialEntries={['/dashboard']}><WorkspaceBack contentRef={{current:null}}/></MemoryRouter>)).toBe(''));
