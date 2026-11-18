import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {DashboardStockSignals,WhosAway} from './DashboardSignals';
import {dashboardAvailability} from './dashboardAvailability';
import {stockSignals,sampleStockSignals} from './stockSignalsModel';
import {stockSignalsProjection} from './stockSignalsProjection';
import {frontDeskSampleTodos,frontDeskScopeMatches} from './frontDeskModel';
import type {SalesDocument} from '../../sales/types/salesDocument';
import type {PurchaseOrder} from '../../purchases/types/purchaseOrder';
import type {Product} from '../../inventory/types/product';
import type {Shipment} from '../../incoming-shipments/shipmentModel';

const today='2026-11-16';
const product={id:'p',name:'Hybrid SPC',status:'ACTIVE',reorderPoint:10,targetStock:50,baseUnitId:'m2',units:[{id:'box',conversionToBase:2,symbol:'boxes'},{id:'m2',conversionToBase:1,symbol:'m²'}]} as Product;
const po={id:'po',status:'SENT',lines:[{id:'pl',productId:'p',orderedQuantity:20,receivedQuantity:0,unitId:'box',unitCost:9999}],totals:{total:99999}} as PurchaseOrder;
const order=(id:string,customerId:string)=>({id,type:'SALES_ORDER',status:'CONFIRMED',documentDate:today,documentNumber:'SO-'+id,expectedDispatchDate:'2026-11-18',customerId,lines:[{id:'line',productId:'p',quantity:10,unitId:'box',description:'Hybrid SPC',unitSymbol:'boxes'}]}) as SalesDocument;
const shipment={id:'sh',number:'SHP-1',type:'Overseas',status:'In Transit',container:'MSKU-TEST',eta:'2026-11-20',lines:[{purchaseOrderId:'po',lineId:'pl',unit:'boxes',quantity:20,received:0}]} as Shipment;
it('shows exactly the reference signal cards for each role and keeps Warehouse free of prices and customer late-order information',()=>{
 for(const [role,verified,count] of [['Admin','ADMIN',4],['Account','ACCOUNTANT',4],['Sales','SALES',3],['Front desk','SALES',3],['Warehouse','WAREHOUSE',2]] as const){
  const html=renderToStaticMarkup(<MemoryRouter><DashboardStockSignals sample today={today} role={role} principal={{authenticated:true,userId:'sample',roles:[verified]}}/></MemoryRouter>);
  expect(html.match(/class="ds-signal ds-/g)).toHaveLength(count);expect(html).toContain('3 containers this week');
  if(role==='Warehouse'){expect(html).not.toContain('Coastal Timber');expect(html).not.toContain('products to order');expect(html).not.toMatch(/\$\d/);}
 }
 expect(sampleStockSignals().ready).toEqual([]);
 const away=renderToStaticMarkup(<MemoryRouter><WhosAway sample today={today} role="Admin"/></MemoryRouter>);expect(away).toContain('Lisa · today, back 19 Nov');expect(away).toContain('Tom · 20 Nov');
});
it('projects approved absences into names and dates without payroll or leave details',()=>{
 const employees=[{id:'e',name:'Lisa Sample',status:'Active',salary:999999},{id:'inactive',name:'Old employee',status:'Inactive'}];
 const base={employeeId:'e',status:'Approved',start:today,end:'2026-11-18',notes:'Sensitive note',type:'Personal',hours:24};
 const result=dashboardAvailability(employees,[{...base,id:'approved'},{...base,id:'pending',status:'Pending'},{...base,id:'cancelled',status:'Cancelled'},{...base,id:'past',start:'2026-11-01',end:'2026-11-10'},{...base,id:'inactive',employeeId:'inactive'}],today);
 expect(result).toEqual([{id:'approved',name:'Lisa Sample',start:today,end:'2026-11-18'}]);expect(JSON.stringify(result)).not.toMatch(/salary|notes|hours|Personal/);
});
it('links delayed stock to affected orders and allows for purchase-unit conversion when suggesting replenishment',()=>{
 const input={today,documents:[order('mine','c1')],orders:[po],shipments:[shipment],products:[product],stock:[],fulfilments:[]};
 const result=stockSignals(input);expect(result.late).toEqual([{id:'mine',number:'SO-mine',customerId:'c1',eta:'2026-11-20'}]);expect(result.containers[0]).toMatchObject({number:'MSKU-TEST',quantity:'20 boxes'});expect(result.reorder).toHaveLength(1);
 expect(stockSignals({...input,products:[{...product,targetStock:35}]}).reorder).toEqual([]);
 const ready=stockSignals({...input,stock:[{productId:'p',siteId:'site',quantityOnHand:30}],shipments:[{...shipment,lines:shipment.lines.map(l=>({...l,received:5}))}]});expect(ready.late).toEqual([]);expect(ready.ready.map(r=>r.id)).toEqual(['mine']);
});
it('scopes Sales signals to assigned Store customers and never exposes costing or payroll fields',()=>{
 const snapshots={sales:{salesOrders:[order('mine','c1'),order('other','c2')]},customers:{customers:[{id:'c1',businessType:'Flooring Retailer',status:'ACTIVE',setup:{salesRep:'rep'}},{id:'c2',businessType:'Flooring Retailer',status:'ACTIVE',setup:{salesRep:'other'}}]},purchaseOrders:{purchaseOrders:[po]},suppliers:{suppliers:[{shipments:[shipment]}]},products:{products:[product]},stock:{balances:[]},fulfilments:{fulfilments:[]}};
 const sales=stockSignalsProjection({authenticated:true,userId:'rep',roles:['SALES']},snapshots,'Sales',today);expect(sales.late.map(r=>r.id)).toEqual(['mine']);expect(sales.reorder).toEqual([]);
 const warehouse=stockSignalsProjection({authenticated:true,userId:'wh',roles:['WAREHOUSE']},snapshots,'Warehouse',today);expect(warehouse.late).toEqual([]);expect(warehouse.reorder).toEqual([]);expect(JSON.stringify(warehouse)).not.toMatch(/unitCost|totals|salary|tax|unitPrice/);
 expect(()=>stockSignalsProjection(null,snapshots,'Warehouse',today)).toThrow('Inventory access required');
});
it('provides the thirteen reference front-desk tasks with meaningful pending and completed filtering',()=>{
 const rows=frontDeskSampleTodos();expect(rows).toHaveLength(13);expect(['All','Overdue','Today','Coming up'].map(s=>rows.filter(r=>frontDeskScopeMatches(r,s)).length)).toEqual([13,4,6,3]);
 const completed=new Set([rows[0].id]);expect(rows.filter(r=>!completed.has(r.id)&&frontDeskScopeMatches(r,'Today'))).toHaveLength(5);
});
