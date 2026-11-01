import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function loader(stubs={}) {
 const cache=new Map();
 return function load(file) {
  const target=path.resolve(root,file);
  if(cache.has(target))return cache.get(target);
  const exports={};cache.set(target,exports);
  const code=ts.transpile(fs.readFileSync(target,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023});
  new Function('exports','require',code)(exports,name=>name in stubs ? stubs[name] : load(path.resolve(path.dirname(target),name+'.ts')));
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
test('local account, session, contact, password recovery and saved applications',async()=>{
 globalThis.localStorage=storage();globalThis.sessionStorage=storage();globalThis.crypto??=webcrypto;
 const account=loader({react:{useSyncExternalStore:()=>{}}})('src/data/localAccount.ts');
 assert.equal(account.useLocalAccount().authenticated,false);
 await assert.rejects(account.login(account.defaultProfile.email,'wrong',false));
 await account.login(account.defaultProfile.email,account.DEMO_PASSWORD,false);assert.equal(account.useLocalAccount().authenticated,true);
 assert.equal(localStorage.getItem('htt.local.session.v1'),null);assert.ok(sessionStorage.getItem('htt.local.session.v1'));
 account.updateProfile({...account.defaultProfile,firstName:'Test',region:'Sydney'});assert.equal(account.useLocalAccount().profile.firstName,'Test');assert.equal(account.useLocalAccount().profile.region,'Melbourne');
 await assert.rejects(account.changePassword('wrong','NewPassword123!'));
 await account.changePassword(account.DEMO_PASSWORD,'NewPassword123!');assert.equal(account.useLocalAccount().authenticated,false);
 await assert.rejects(account.login(account.defaultProfile.email,account.DEMO_PASSWORD,false));
 await account.login(account.defaultProfile.email,'NewPassword123!',true);assert.ok(localStorage.getItem('htt.local.session.v1'));
 const saved=localStorage.getItem('htt.local.account.v1');assert.ok(!saved.includes('NewPassword123!'));
 await assert.rejects(account.resetPassword(account.defaultProfile.email,'bad','ResetPassword123!'));
 await account.resetPassword(account.defaultProfile.email,account.DEMO_RECOVERY,'ResetPassword123!');await account.login(account.defaultProfile.email,'ResetPassword123!',false);account.logout();assert.equal(account.useLocalAccount().authenticated,false);
 assert.equal(account.validABN('51 824 753 556'),true);assert.equal(account.validABN('12 345 678 901'),false);
 const profile={...account.defaultProfile,email:'applicant@example.test',address:'1 Test Street'};
 const application=account.submitApplication(profile);assert.ok(application.id.startsWith('APP-'));assert.equal(account.getApplication().status,'Pending review');assert.throws(()=>account.submitApplication(profile));
 account.submitApplication({...profile,email:'second@example.test'});assert.equal(JSON.parse(localStorage.getItem('htt.local.application.v1')).length,2);
 await account.login(account.defaultProfile.email,'ResetPassword123!',true);const session=JSON.parse(localStorage.getItem('htt.local.session.v1'));localStorage.setItem('htt.local.session.v1',JSON.stringify({...session,expires:0}));assert.equal(account.useLocalAccount().authenticated,false);
});
