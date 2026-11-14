import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nativeRequire=createRequire(import.meta.url);
function loader(stubs={}) {
 const cache=new Map();
 return function load(file) {
  const target=path.resolve(root,file);
  if(cache.has(target))return cache.get(target);
  const exports={};cache.set(target,exports);
  const code=ts.transpile(fs.readFileSync(target,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023});
  new Function('exports','require',code)(exports,name=>name in stubs ? stubs[name] : name==='../config/auth' ? {authMode:'api'} : name==='zustand/vanilla' ? nativeRequire(name) : load(path.resolve(path.dirname(target),name+'.ts')));
  return exports;
 };
}
const load=loader();
const products=load('src/data/products.ts');
const data=load('src/data/invoices.ts');
const record={id:'test',invoiceNumber:'INV-test',issueDate:'02 Oct 2026',dueDate:'16 Oct 2026',paid:0,items:[{productId:'bonita-natural-oak',quantity:40,unitPrice:69},{productId:'guardian-d3016',quantity:20,unitPrice:47.5}]};
const now=new Date(2026,10,2);
test('product area, optional area and rounded line amounts',()=>{
 const items=data.calculateItems(record.items);
 assert.equal(items[0].sizePerBox,2.166);assert.equal(items[0].totalSize.toFixed(3),'86.640');assert.equal(items[0].amountCents,597816);
 assert.equal(items[1].sizePerBox,undefined);assert.equal(items[1].totalSize,undefined);assert.equal(items[1].amountCents,95000);
 const bonita=products.products.find(p=>p.id==='bonita-natural-oak');assert.equal(bonita.boardsPerPack,6);assert.equal(bonita.sqm,bonita.boxes*2.166);
 assert.equal(data.getSizePerBox('invalid'),undefined);assert.equal(data.getSizePerBox('0 m²'),undefined);
});
test('freight, tax, payment and invoice status',()=>{
 const original=data.calculateInvoice(record,now);assert.equal(original.total,7620.98);assert.equal(original.freight,0);assert.equal(original.overdueDays,17);assert.equal(original.status,'Overdue');
 const freight=data.calculateInvoice({...record,freight:50,paid:100},now);assert.equal(freight.subtotal,6928.16);assert.equal(freight.gst,697.82);assert.equal(freight.total,7675.98);assert.equal(freight.balance,7575.98);
 const paid=data.calculateInvoice({...record,paid:7620.98},now);assert.equal(paid.status,'Paid');assert.equal(paid.overdueDays,0);
 assert.equal(data.calculateInvoice(record,new Date(2026,9,16)).status,'Outstanding');
 assert.equal(data.calculateTotals([{amountCents:105}],0).gst,0.11);
 assert.throws(()=>data.calculateItems([{...record.items[0],quantity:-1}]));assert.throws(()=>data.calculateTotals([],0,-1));
});
test('all summaries, aging buckets and empty data use computed balances',()=>{
 const invoices=[data.calculateInvoice({...record,dueDate:'02 Nov 2026'},now), data.calculateInvoice({...record,dueDate:'01 Nov 2026',paid:100},now), data.calculateInvoice({...record,dueDate:'01 Oct 2026'},now),data.calculateInvoice({...record,dueDate:'01 Sep 2026'},now),data.calculateInvoice({...record,dueDate:'01 Jul 2026'},now)];
 const summary=data.summarizeInvoices(invoices);
 assert.equal(summary.outstandingCount,5);assert.equal(summary.overdueCount,4);assert.equal(summary.aging.length,5);
 assert.deepEqual(summary.aging.map(b=>b.balance),[7620.98,7520.98,7620.98,7620.98,7620.98]);
 assert.equal(summary.aging.reduce((sum,b)=>sum+Math.round(b.balance*100),0),Math.round(summary.outstanding*100));
 assert.equal(data.summarizeInvoices([]).outstanding,0);
});
test('sales report uses invoice area, dates, customer and invoice status',()=>{
 const sales=load('src/data/productSales.ts');
 const report=sales.productSalesReport(sales.salesInvoices,'abc-flooring',now,90);
 assert.ok(report.products.some(p=>p.productId==='bonita-natural-oak'&&p.currentSqm>0));
 assert.equal(sales.productSalesReport(sales.salesInvoices,'other',now,30).products.length,0);
 assert.throws(()=>sales.productSalesReport([], 'abc-flooring',now,0));
 const rows=[{customerId:'abc-flooring',status:'quotation',date:now,items:[{productId:'x',name:'x',sku:'x',sqm:10,boxes:1}]}];assert.equal(sales.productSalesReport(rows,'abc-flooring',now,30).products.length,0);
});
function storage(){const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key),clear:()=>values.clear()};}
test('offline application validation remains isolated from server authentication',()=>{
 globalThis.localStorage=storage();globalThis.sessionStorage=storage();globalThis.crypto??=webcrypto;
 const account=loader({react:{useSyncExternalStore:()=>({status:'unauthenticated',context:null,email:''})}})('src/data/localAccount.ts');
 assert.equal(typeof account.login,'function');assert.equal(account.DEMO_PASSWORD,'Flooring123!');
 assert.equal(account.useLocalAccount().authenticated,false);
 assert.equal(account.validABN('51 824 753 556'),true);assert.equal(account.validABN('12 345 678 901'),false);
 const profile={...account.defaultProfile,email:'applicant@example.test',address:'1 Test Street'};
 const application=account.submitApplication(profile);assert.ok(application.id.startsWith('APP-'));assert.equal(account.getApplication().status,'Pending review');assert.throws(()=>account.submitApplication(profile));
 account.submitApplication({...profile,email:'second@example.test'});assert.equal(JSON.parse(localStorage.getItem('htt.local.application.v1')).length,2);
 assert.equal(localStorage.getItem('htt.local.account.v1'),null);assert.equal(localStorage.getItem('htt.local.session.v1'),null);
});
test('series grouping, colour references, search and promotional filters',()=>{
 assert.deepEqual(products.productSeries.map(series=>series.name), ['Bonita','Guardian','AquaGlow','Heritage','Scotia','Stair Nose','Trims']);
 const bonita=products.productSeries.find(series=>series.id==='bonita');
 assert.equal(bonita.products.length,9);
 assert.deepEqual(bonita.products.map(product=>product.colourCode),['M-2','M-3','M-5','M-6','M-8','M-9','M-11','M-13','M-14']);
 assert.ok(bonita.products.every(product=>product.packSize==='2.166 m²' && product.boardsPerPack===6 && product.dimensions==='1900 × 190 × 14/2 mm'));
 assert.equal(bonita.products.find(product=>product.colour==='Latte Oak').scotia,'D3005');
 assert.equal(bonita.products.find(product=>product.colour==='Smoked Brown').trims,'HBY-004');
 assert.deepEqual(products.filterProductSeries('M-13','All','','Relevance').map(series=>series.id),['bonita','accessories-stair-nose']);
 assert.equal(products.filterProductSeries('Latte Oak','Hybrid','','Relevance').length,0);
 assert.deepEqual(products.filterProductSeries('','All','clearance','Relevance').map(series=>series.id),['heritage']);
 assert.deepEqual(products.filterProductSeries('','All','new','Relevance').map(series=>series.id),['bonita']);
 assert.equal(products.filterProductSeries('','All','','Price: Low to High')[0].id,'accessories-scotia');
 const latte=products.products.find(product=>product.id==='bonita-latte-oak');assert.equal(latte.stockKnown,false);assert.equal(latte.priceKnown,true);
 assert.equal(data.calculateItems([{productId:latte.id,quantity:1,unitPrice:69}])[0].amountCents,14945);
 const demo=load('src/data/productSales.ts').demoProductSales('abc-flooring',now);
 assert.ok(demo.length>0);assert.ok(demo.some(invoice=>invoice.items.some(item=>item.productId==='bonita-latte-oak')));
 assert.equal(new Set(products.products.map(product=>product.id)).size,products.products.length);
});

function returnTestStorage(){
 const store=storage();
 store.setItem('htt.local.returns.v1',JSON.stringify({version:2,notes:[
 {id:'ret-1002',number:'RET-1002',invoiceId:'inv-10521',date:'2026-10-28',reason:'Damaged packaging',status:'Requested',items:[{productId:'bonita-natural-oak',quantity:2}]},
 {id:'ret-1001',number:'RET-1001',invoiceId:'inv-10482',date:'2026-10-24',reason:'Incorrect item supplied',status:'Approved',items:[{productId:'guardian-d3016',quantity:1}]},
 ]}));return store;
}
test('return quantities, original invoice pricing, persistence and cancellation',()=>{
 globalThis.localStorage=returnTestStorage();
 const returns=loader({react:{useSyncExternalStore:()=>{}}})('src/data/returnNotes.ts');
 const seed=returns.getReturnNotes();assert.equal(seed.length,2);
 assert.equal(returns.remainingReturnQuantity('inv-10521','bonita-natural-oak'),38);
 const detail=returns.returnDetails(seed[0]);assert.equal(detail.subtotal,298.91);assert.equal(detail.gst,29.89);assert.equal(detail.total,328.8);
 assert.throws(()=>returns.createReturnNote('inv-10521',[{productId:'bonita-natural-oak',quantity:39}],'Damaged'));
 assert.throws(()=>returns.createReturnNote('inv-10521',[], 'Damaged'));
 assert.throws(()=>returns.createReturnNote('inv-10521',[{productId:'bonita-natural-oak',quantity:1.5}],'Damaged'));
 assert.throws(()=>returns.createReturnNote('inv-10521',[{productId:'not-purchased',quantity:1}],'Damaged'));
 const note=returns.createReturnNote('inv-10521',[{productId:'bonita-natural-oak',quantity:38}],'Damaged');assert.equal(note.status,'Requested');assert.equal(returns.remainingReturnQuantity('inv-10521','bonita-natural-oak'),0);
 returns.cancelReturnNote(note.id);assert.equal(returns.remainingReturnQuantity('inv-10521','bonita-natural-oak'),38);
 assert.throws(()=>returns.cancelReturnNote('ret-1001'));
 assert.equal(data.invoices.find(invoice=>invoice.id==='inv-10521').balance,7675.98);
});

test('credit issuance is atomic and idempotent, and synchronizes every invoice summary',()=>{
 globalThis.localStorage=returnTestStorage();
 const modules=loader({react:{useSyncExternalStore:()=>{}}});
 const returns=modules('src/data/returnNotes.ts'),ledger=modules('src/data/ledger.ts');
 const before=ledger.calculateLedger(returns.getReturnNotes());
 const credit=returns.confirmReturnNote('ret-1002');assert.equal(credit.total,328.8);
 assert.equal(returns.confirmReturnNote('ret-1002').id,credit.id);
 const notes=returns.getReturnNotes();assert.equal(notes.find(note=>note.id==='ret-1002').status,'Confirmed');
 const issued=ledger.calculateLedger(notes);assert.equal(issued.invoices.find(invoice=>invoice.id==='inv-10521').balance,7675.98);assert.equal(issued.unappliedCredit,328.8);
 returns.applyCreditNote(credit.id,'inv-10521');
 const after=ledger.calculateLedger(returns.getReturnNotes());assert.equal(after.credits.length,1);
 const invoice=after.invoices.find(invoice=>invoice.id==='inv-10521');assert.equal(invoice.balance,7347.18);assert.equal(invoice.creditApplied,328.8);assert.equal(invoice.total,7675.98);assert.equal(invoice.paid,0);
 assert.equal(Math.round((before.invoiceSummary.outstanding-after.invoiceSummary.outstanding)*100),32880);
 assert.equal(Math.round(after.invoiceSummary.aging.reduce((sum,bucket)=>sum+bucket.balance,0)*100),Math.round(after.invoiceSummary.outstanding*100));
 assert.throws(()=>returns.cancelReturnNote('ret-1002'));
 const cancelled=returns.createReturnNote('inv-10521',[{productId:'guardian-d3016',quantity:1}],'Test');returns.cancelReturnNote(cancelled.id);assert.throws(()=>returns.confirmReturnNote(cancelled.id));
 const originalSet=localStorage.setItem;localStorage.setItem=()=>{throw new Error('Storage unavailable');};assert.throws(()=>returns.confirmReturnNote('ret-1001'));localStorage.setItem=originalSet;
 assert.equal(returns.getReturnNotes().find(note=>note.id==='ret-1001').status,'Approved');
});
test('split credit returns preserve original cents, settle paid balances and retain excess credit',()=>{
 globalThis.localStorage=returnTestStorage();
 const modules=loader({react:{useSyncExternalStore:()=>{}}});
 const returns=modules('src/data/returnNotes.ts'),ledger=modules('src/data/ledger.ts');
 // This invoice has an existing partial payment and no reserved return quantities.
 for(let index=0;index<40;index++){
  const note=returns.createReturnNote('inv-10381',[{productId:'bonita-natural-oak',quantity:1}],'Split return');returns.confirmReturnNote(note.id);
 }
 const guardian=returns.createReturnNote('inv-10381',[{productId:'guardian-d3016',quantity:20}],'Remaining goods');returns.confirmReturnNote(guardian.id);
 for(const credit of ledger.calculateLedger(returns.getReturnNotes()).credits){if(ledger.calculateLedger(returns.getReturnNotes()).invoices.find(invoice=>invoice.id==='inv-10381').balance>0)returns.applyCreditNote(credit.id,'inv-10381');}
 const snapshot=ledger.calculateLedger(returns.getReturnNotes());
 const invoice=snapshot.invoices.find(invoice=>invoice.id==='inv-10381');
 assert.equal(invoice.creditTotal,7620.98);assert.equal(invoice.creditApplied,3500.98);assert.equal(invoice.balance,0);assert.equal(invoice.status,'Paid');assert.equal(invoice.overdueDays,0);assert.equal(invoice.unappliedCredit,4120);
 assert.equal(snapshot.unappliedCredit,4120);
 assert.equal(returns.remainingReturnQuantity('inv-10381','bonita-natural-oak'),0);
 assert.throws(()=>returns.createReturnNote('inv-10381',[{productId:'bonita-natural-oak',quantity:1}],'Too many'));
});

test('credits stay unapplied until Apply and can be partially allocated across invoices',()=>{
 globalThis.localStorage=returnTestStorage();
 const modules=loader({react:{useSyncExternalStore:()=>{}}});
 const returns=modules('src/data/returnNotes.ts'),ledger=modules('src/data/ledger.ts');
 const credit=returns.confirmReturnNote('ret-1002');
 const issued=ledger.calculateLedger(returns.getReturnNotes());assert.equal(issued.credits[0].applications.length,0);assert.equal(issued.invoiceSummary.outstanding,24757.92);
 returns.applyCreditNote(credit.id,'inv-10482',100);
 let result=ledger.calculateLedger(returns.getReturnNotes());assert.equal(result.invoices.find(i=>i.id==='inv-10521').balance,7675.98);assert.equal(result.invoices.find(i=>i.id==='inv-10482').balance,7520.98);assert.equal(result.credits[0].remainingAmount,228.8);
 assert.throws(()=>returns.applyCreditNote(credit.id,'inv-10521',229));assert.throws(()=>returns.applyCreditNote(credit.id,'inv-10521',0));assert.throws(()=>returns.applyCreditNote(credit.id,'inv-10521',NaN));assert.throws(()=>returns.applyCreditNote(credit.id,'missing',1));
 returns.applyCreditNote(credit.id,'inv-10521');result=ledger.calculateLedger(returns.getReturnNotes());assert.equal(result.credits[0].remainingAmount,0);assert.equal(result.credits[0].applications.length,2);assert.equal(result.invoices.find(i=>i.id==='inv-10521').balance,7447.18);
 assert.throws(()=>returns.applyCreditNote(credit.id,'inv-10521'));assert.equal(result.invoiceSummary.outstanding,24429.12);
 // Pre-existing issued notes without an Apply record must not reduce debt.
 const legacy=returns.getReturnNotes();delete legacy.find(note=>note.creditNote).creditNote.applications;assert.equal(ledger.calculateLedger(legacy).invoiceSummary.outstanding,24757.92);
});

test('bundled credit examples appear in fresh storage and migrate old arrays without losing user data',()=>{
 globalThis.localStorage=storage();
 const modules=loader({react:{useSyncExternalStore:()=>{}}}),returns=modules('src/data/returnNotes.ts'),ledger=modules('src/data/ledger.ts');
 const initial=returns.getReturnNotes();const snapshot=ledger.calculateLedger(initial);
 assert.equal(snapshot.credits.length,3);assert.equal(snapshot.unappliedCredit,52.25);
 assert.equal(snapshot.invoices.find(invoice=>invoice.id==='inv-10521').balance,7294.93);
 assert.equal(snapshot.credits.find(credit=>credit.number==='CN-1001').applications.length,0);
 assert.equal(snapshot.credits.filter(credit=>credit.applications.some(application=>application.invoiceId==='inv-10521')).length,2);
 const custom={id:'user-return',number:'RET-USER',invoiceId:'inv-10398',date:'2026-11-02',reason:'User data',status:'Requested',items:[{productId:'guardian-d3016',quantity:1}]};
 localStorage.setItem('htt.local.returns.v1',JSON.stringify([custom]));
 const migrated=returns.getReturnNotes();assert.ok(migrated.some(note=>note.id===custom.id));assert.equal(migrated.length,4);assert.equal(JSON.parse(localStorage.getItem('htt.local.returns.v1')).version,2);
 returns.applyCreditNote('cn-ret-1001','inv-10482');assert.equal(ledger.calculateLedger(returns.getReturnNotes()).unappliedCredit,0);assert.equal(returns.getReturnNotes().length,4);
});

test('net product sales deduct confirmed returns once in the original invoice period, independent of Apply',()=>{
 globalThis.localStorage=storage();
 const modules=loader({react:{useSyncExternalStore:()=>{}}}),returns=modules('src/data/returnNotes.ts'),sales=modules('src/data/productSales.ts');
 const notes=returns.getReturnNotes();
 const net=sales.netSalesInvoices(notes);
 const invoice=net.find(invoice=>invoice.id==='inv-10521');
 assert.equal(invoice.items.find(item=>item.productId==='bonita-natural-oak').boxes,38);
 assert.equal(invoice.items.find(item=>item.productId==='bonita-natural-oak').sqm,82.308);
 assert.equal(invoice.items.find(item=>item.productId==='guardian-d3016').boxes,19);
 assert.equal(net.find(invoice=>invoice.id==='inv-10482').items.find(item=>item.productId==='guardian-d3016').boxes,19);
 const report=sales.productSalesReport(net,'abc-flooring',new Date(2026,10,2),30);
 const bonita=report.products.find(item=>item.productId==='bonita-natural-oak');assert.equal(bonita.currentBoxes,0);assert.equal(bonita.previousBoxes,78);assert.equal(bonita.previousSqm.toFixed(2),'168.95');
 const pending=notes.map(note=>({...note,status:note.id==='ret-1002'?'Requested':note.status}));assert.equal(sales.netSalesInvoices(pending).find(invoice=>invoice.id==='inv-10521').items[0].boxes,40);
 const cancelled=notes.map(note=>({...note,status:note.id==='ret-1002'?'Cancelled':note.status}));assert.equal(sales.netSalesInvoices(cancelled).find(invoice=>invoice.id==='inv-10521').items[0].boxes,40);
 returns.applyCreditNote('cn-ret-1001','inv-10482');assert.deepEqual(sales.netSalesInvoices(returns.getReturnNotes()),net);
 assert.equal(sales.salesInvoices.find(invoice=>invoice.id==='inv-10521').items[0].boxes,40);
});

test('every accessory reference links to a valid matching catalogue item',()=>{
 const floors=products.products.filter(product=>!product.accessoryKind);
 for(const floor of floors)for(const [kind,field] of [['scotia','scotia'],['stair-nose','hdfStairNose'],['trims','trims']]){
  if(!floor[field])continue;
  const accessory=products.products.find(product=>product.id===floor.accessoryProductIds[kind]);
  assert.ok(accessory);assert.equal(accessory.accessoryKind,kind);assert.equal(accessory.colourCode,floor[field]);assert.equal(accessory.category,'Accessories');assert.equal(accessory.priceKnown,true);assert.equal(accessory.stockKnown,false);
 }
 const white=floors.find(product=>product.id==='bonita-white-oak'),lime=floors.find(product=>product.id==='bonita-lime-wash');assert.equal(white.accessoryProductIds.scotia,lime.accessoryProductIds.scotia);
 assert.notEqual(white.accessoryProductIds['stair-nose'],lime.accessoryProductIds['stair-nose']);
 assert.equal(products.filterProductSeries('','Accessories','','Relevance').length,3);
});

test('collection colour listings bypass series with shared pricing data',()=>{
 const fresh=products.getColourCollection('new'),promotion=products.getColourCollection('promotion'),clearance=products.getColourCollection('clearance');
 assert.equal(fresh.name,'New Product');assert.equal(fresh.products.length,9);
 assert.equal(promotion.name,'Promotion');assert.equal(promotion.products.length,9);
 assert.equal(clearance.name,'Clearance');assert.equal(clearance.products[0].id,'heritage-rustic-oak');
 assert.ok(promotion.products.every(product=>!product.accessoryKind&&(product.discount??0)>0));
 assert.equal(products.getColourCollection('missing'),undefined);
});

test('every catalogue item has a price and promotion collections contain only complete offers',()=>{
 assert.ok(products.products.every(product=>product.priceKnown!==false&&Number.isFinite(product.price)&&product.price>0&&product.standardPrice>=product.price));
 for(const id of ['promotion','clearance']){
  const collection=products.getColourCollection(id);assert.ok(collection.products.length>0);
  assert.ok(collection.products.every(product=>products.hasPromotion(product)&&product.standardPrice>product.price&&product.promotionStartDate&&product.promotionEndDate));
 }
 const plain=products.products.find(product=>product.accessoryKind==='scotia');assert.equal(products.hasPromotion(plain),false);assert.equal(products.matchesCollection({...plain,isClearance:true},'clearance'),false);
});

test('standard, customer and promotional prices are distinct and discounts use the customer rate',()=>{
 const bonita=products.products.find(product=>product.id==='bonita-natural-oak');
 assert.deepEqual(products.getProductPricing(bonita),{standard:82,customer:75,current:69,promotion:true,discount:8});
 const scotia=products.products.find(product=>product.accessoryKind==='scotia');const ordinary=products.getProductPricing(scotia);
 assert.equal(ordinary.standard,8);assert.equal(ordinary.customer,6.5);assert.equal(ordinary.current,6.5);assert.equal(ordinary.promotion,false);assert.equal(ordinary.discount,0);
 assert.ok(products.products.every(product=>products.getProductPricing(product).standard>products.getProductPricing(product).customer));
 assert.equal(products.getProductPricing({...bonita,promotionPrice:80}).promotion,false);
});

test('non-promotional Bonita examples retain customer pricing and no campaign dates',()=>{
 for(const id of ['bonita-latte-oak','bonita-lime-wash','bonita-grey-wash']){
  const product=products.products.find(product=>product.id===id),pricing=products.getProductPricing(product);
  assert.equal(pricing.standard,82);assert.equal(pricing.customer,75);assert.equal(pricing.current,75);assert.equal(pricing.promotion,false);
  assert.equal(product.promotionStartDate,undefined);assert.equal(product.promotionEndDate,undefined);
  assert.ok(!products.getColourCollection('promotion').products.some(item=>item.id===id));
 }
});

test('inventory secondary categories filter patterns within their parent category',()=>{
 assert.deepEqual(products.categorySubcategories['Engineered Timber'],['Plank','Herringbone','Chevron']);
 assert.deepEqual(products.categorySubcategories.Hybrid,['Plank','Herringbone']);assert.deepEqual(products.categorySubcategories.Laminate,['Plank','Herringbone']);
 assert.deepEqual(products.filterProductSeries('','Engineered Timber','','Relevance','Plank').map(series=>series.id),['bonita','heritage']);
 assert.equal(products.filterProductSeries('','Engineered Timber','','Relevance','Chevron').length,0);
 assert.deepEqual(products.filterProductSeries('','Hybrid','','Relevance','Herringbone').map(series=>series.id),['guardian']);
 assert.deepEqual(products.filterProductSeries('','Laminate','','Relevance','Herringbone').map(series=>series.id),['aquaglow']);
 assert.equal(products.filterProductSeries('','Accessories','','Relevance').length,3);
});

test('accessories secondary menu maps existing items to their matching categories',()=>{
 assert.deepEqual(products.categorySubcategories.Accessories,['Plywood','Underlay','Floor Protection','Plastic Moisture Barrier','Scotia','Stair Noses','Aluminium Trim',"Tool's Accessories",'Glue','Primer','Self Leveling']);
 for(const [subcategory,id] of [['Scotia','accessories-scotia'],['Stair Noses','accessories-stair-nose'],['Aluminium Trim','accessories-trims']])assert.deepEqual(products.filterProductSeries('','Accessories','','Relevance',subcategory).map(series=>series.id),[id]);
 assert.equal(products.filterProductSeries('','Accessories','','Relevance','Glue').length,0);
 assert.equal(products.filterProductSeries('','Accessories','','Relevance','All').length,3);
});
