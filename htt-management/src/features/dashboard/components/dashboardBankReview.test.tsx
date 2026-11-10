import {it,expect,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
const fixture=vi.hoisted(()=>({review:true,awaiting:false}));
vi.mock('../../security/usePermission',()=>({usePermission:(permission:string)=>permission==='sales.read'}));
vi.mock('../data/useFinanceOverview',()=>({useFinanceOverview:()=>({bankStatus:[{id:'bank/id',name:'Audit bank',balance:10,outstanding:0,lastReconciled:fixture.review?undefined:'2026-10-20',requiresReview:fixture.review,reviewReasons:fixture.review?['Saved reconciliation totals do not match.']:[]}],bankReviewCount:fixture.review?1:0,unreconciledCount:0,overdueInvoiceCount:0,overdueReceivables:0,overduePayables:0})}));
vi.mock('../../sales/data/useSalesDocuments',()=>({useSalesDocuments:()=>fixture.awaiting?[{id:'order',type:'SALES_ORDER',status:'CONFIRMED',deliveryBooked:true,documentDate:'2026-11-10',totals:{subtotal:100},invoiceIds:['invoice']},{id:'invoice',type:'INVOICE',status:'ISSUED',sourceSalesOrderId:'order',documentDate:'2026-11-10',dueDate:'2099-01-01',amountDue:100,totals:{subtotal:100,total:110}}]:[]}));
vi.mock('../../business-workspace/workspaceRepository',()=>({useWorkspaceRecords:()=>[],configurationHistory:{tasks:[]}}));
import {BankReconciliationCard} from './BankReconciliationCard';
import {TasksCard} from './TasksCard';
const render=()=>renderToStaticMarkup(<MemoryRouter><BankReconciliationCard/><TasksCard/></MemoryRouter>);
it('shows evidence review and an account link even with zero outstanding rows',()=>{fixture.review=true;const html=render();expect(html).toContain('Reconciliation evidence requires review');expect(html).toContain('Saved reconciliation totals do not match');expect(html).toContain('/banking/accounts/bank%2Fid');expect(html).toContain('1 bank accounts require evidence review');expect(html).not.toContain('No tasks or alerts in this view.');expect(html).not.toContain('2026-10-20');});
it('keeps a proved statement date and the ordinary empty-alert state after refresh',()=>{fixture.review=false;const html=render();expect(html).toContain('Last verified reconciliation: 2026-10-20');expect(html).toContain('No tasks or alerts in this view.');expect(html).not.toContain('Reconciliation evidence requires review');});

it('links pending dispatch to the live Sales filter without double-counting order and invoice',()=>{fixture.review=false;fixture.awaiting=true;try{const html=render();expect(html).toContain('1 awaiting dispatch');expect(html).toContain('/sales?awaitingDispatch=1');}finally{fixture.awaiting=false;}});
