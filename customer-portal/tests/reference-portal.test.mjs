import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script=fs.readFileSync(new URL('../public/reference-portal/portal.js',import.meta.url),'utf8');
function runtime(options={}){
 const stored=new Map(),downloads=[],blobs=[],timers=[],toast={style:{},textContent:''};let prints=0;
 const context=vm.createContext({URLSearchParams,structuredClone,Blob,
  URL:{createObjectURL(blob){blobs.push(blob);return 'blob:preview-'+blobs.length;},revokeObjectURL(){}},
  FormData:class{constructor(form){this.fields=form.fields||{};}get(key){return this.fields[key]??null;}},
  window:{addEventListener(){},HTTPrint:{open(){return options.blockPopup?null:{setDocument(){if(options.snapshotFails)throw Error('snapshot');},async print(){prints++;if(options.printFails)throw Error('print');},fail(){}};}}},
  document:{addEventListener(){},getElementById(){return toast;},querySelectorAll(){return [];},querySelector(selector){return selector==='#app .doc'&&!options.noDocument?{querySelector(){return {textContent:'QA document'};}}:null;},createElement(){return {click(){downloads.push({filename:this.download,href:this.href});}};}},
  localStorage:{getItem(key){return stored.get(key)??null;},setItem(key,value){stored.set(key,value);}},sessionStorage:{getItem(){return null;}},
  location:{hash:options.hash||'#/dashboard',search:options.search||''},
  setTimeout(fn){timers.push(fn);},clearTimeout(){},setInterval(){},clearInterval(){}
 });
 new vm.Script(script.slice(0,script.lastIndexOf("document.getElementById('who-name')"))).runInContext(context,{timeout:1000});
 const read=expression=>JSON.parse(vm.runInContext(`JSON.stringify(${expression})`,context,{timeout:1000}));
 read.run=expression=>vm.runInContext(expression,context,{timeout:1000});
 read.downloads=downloads;read.blobs=blobs;read.stored=stored;read.prints=()=>prints;read.toast=()=>toast.textContent;
 return read;
}
test('reference stock bands expose availability without leaking precise quantities',()=>{
 const read=runtime();assert.deepEqual(read('[stockBand({stock:500,unit:"m²"}),stockBand({stock:200,unit:"m²"}),stockBand({stock:1,unit:"m²"}),stockBand({stock:null,unit:"m²"}),stockBand({madeToOrder:true})].map(b=>b.k)'),['high','med','low','out','mto']);
});
test('reference line prices, box conversion, GST and credits reconcile',()=>{
 const read=runtime();assert.equal(read('unitPrice({clr:40,promo:50,yours:60})'),40);
 assert.equal(read('boxOf(PRODUCTS.find(p=>p.id==="bonita-natural-oak"))'),2.166);
 assert.equal(read('cartLine({id:"bonita-natural-oak",qty:2}).total'),298.91);
 assert.equal(read('calc(QUOTES.find(q=>q.no==="QUO-10605")).total'),682);
 assert.equal(read('outstanding'),24705.67);assert.equal(read('unappliedAmt'),381.05);
});
test('reference store switching isolates documents and restores all-store balances',()=>{
 const read=runtime();const all=read('INVOICES.length');
 assert.ok(read('(STORE="ADR-02",applyStore(),INVOICES.every(i=>i.store==="ADR-02"))'));
 assert.ok(read('INVOICES.length')<all);assert.equal(read('(STORE="all",applyStore(),INVOICES.length)'),all);
 assert.equal(read('outstanding'),24705.67);
});
test('reference fulfillment validates business days and delivery lead time',()=>{
 const read=runtime();assert.equal(read('dateOk("2026-11-18","Pick up")'),true);assert.equal(read('dateOk("2026-11-18","Delivery")'),false);
 assert.equal(read('dateOk("2026-11-19","Delivery")'),true);assert.equal(read('dateOk("2026-11-21","Delivery")'),false);
});

test('cart, draft, saved quote and invoice line totals use full box precision',()=>{
 const read=runtime();
 assert.equal(read('(()=>{for(const p of PRODUCTS){for(let quantity=1;quantity<=50;quantity++){const c=cartLine({id:p.id,qty:quantity}),line={box:boxOf(p),qty:quantity,price:unitPrice(p)};if(c.total!==lineAmt(line))return false;}}return true;})()'),true);
 assert.equal(read('draftAmt({cart:[{id:"bonita-natural-oak",qty:2}]})'),298.91);
 assert.equal(read('lineToCart(L.gua12).qty'),5);assert.equal(read('lineToCart(L.gua12).want'),12);
 assert.equal(read('lineToCart(L.bon40).qty'),40);
});
test('area inputs never under-order and staged quantities survive draft reload',()=>{
 const read=runtime({search:'?qa=unit-area'});
 read.run('CART=[{id:"bonita-natural-oak",qty:1}];stageCartQty("bonita-natural-oak","4.34",true)');
 assert.equal(read('CART[0].qty'),3);assert.equal(read('CART[0].want'),4.34);
 read.run('CART=[];draftLoad()');assert.equal(read('CART[0].qty'),3);
 assert.ok([...read.stored.keys()].every(key=>key.startsWith('htt.reference.qa.unit-area.')));
 assert.equal(read('(()=>{for(let n=1;n<500;n++){stageCartQty("bonita-natural-oak",n/10,true);if(CART[0].qty*2.166+1e-9<n/10)return false;}return true;})()'),true);
});
test('accepting a quote creates exactly one order, and expired actions are rejected',async()=>{
 const read=runtime();read.run('render=async()=>{};PRICE_ON=true');
 await read.run('submitQuoteAction({reportValidity:()=>true,fields:{method:"Pick up",wanted:"2026-11-19"}},"QUO-10605","accept")');
 assert.equal(read('ORDERS.filter(o=>o.no==="ORD-10605").length'),1);
 await read.run('submitQuoteAction({reportValidity:()=>true,fields:{method:"Pick up",wanted:"2026-11-19"}},"QUO-10605","accept")');
 assert.equal(read('ORDERS.filter(o=>o.no==="ORD-10605").length'),1);
 await read.run('submitQuoteAction({reportValidity:()=>true},"QUO-10570","accept")');
 assert.equal(read('ORDERS.some(o=>o.no==="ORD-10570")'),false);
});
test('invalid pickup days do not create orders; denied permissions cannot accept quotes',async()=>{
 const read=runtime();read.run('render=async()=>{};PRICE_ON=true');
 await read.run('submitQuoteAction({reportValidity:()=>true,fields:{method:"Pick up",wanted:"2026-11-21"}},"QUO-10605","accept")');
 assert.equal(read('QUOTES[0].status'),'Open');assert.equal(read('ORDERS.length'),3);
 read.run('curUser().permissions={quotes:true,orders:true,place:false,users:false}');
 await read.run('submitQuoteAction({reportValidity:()=>true,fields:{}},"QUO-10605","accept")');
 assert.equal(read('ORDERS.length'),3);assert.match(read.toast(),/cannot perform/);
});
test('CSV quoting, UTF-8 marker and filtered product export retain monetary values',async()=>{
 const read=runtime({hash:'#/sales?cat=Hybrid'});read.run('salesCsv()');
 assert.equal(read.downloads.length,1);assert.match(read.downloads[0].filename,/product-sales_2026-11-01_2026-11-18/);
 const csv=await read.blobs[0].text();assert.ok(csv.includes('Guardian'));assert.ok(csv.includes('Terra'));assert.ok(!csv.includes('Bonita'));
 assert.equal(csv.trim().split('\r\n').length,7);
 assert.equal(read('csvText([["Oak, white",\'a"b\']])'),'\uFEFF"Oak, white","a""b"');
});
test('rebate CSV respects period and names its rate tax basis',async()=>{
 const read=runtime({hash:'#/rebates?p=m1'});read.run('rebateCsv()');
 const csv=await read.blobs[0].text();assert.ok(csv.includes('Rate per m2 (incl. GST)'));
 assert.ok(csv.includes('2026-10-31'));assert.ok(!csv.includes('2026-09-30'));
});
test('printing restores hidden prices and print/export cannot bypass price access',async()=>{
 const read=runtime();read.run('render=async()=>{}');await read.run('printDoc()');
 assert.equal(read.prints(),1);assert.equal(read('PRICE_ON'),false);
 read.run('curUser().permissions={users:false,prices:false}');
 await read.run('printDoc()');read.run('salesCsv();rebateCsv()');
 assert.equal(read.prints(),1);assert.equal(read.downloads.length,0);
});
test('contact review notes are retained without changing the original contact',async()=>{
 const read=runtime();const before=read('MOCK_CONTACTS.contacts[0].name');
 await read.run('portalApi.submitChangeRequest({type:"update",contactId:"C-001",changes:{name:"Example"},note:"Please review"})');
 assert.equal(read('MOCK_CONTACTS.pendingRequests.at(-1).note'),'Please review');assert.equal(read('MOCK_CONTACTS.contacts[0].name'),before);
});

test('print snapshots reveal amounts only during capture and restore privacy before the native dialog',async()=>{
 const read=runtime();read.run(`let capturedPrice=null,printedPrice=null;render=async()=>{};window.HTTPrint.open=()=>({setDocument(){capturedPrice=PRICE_ON;},async print(){printedPrice=PRICE_ON;},fail(){}})`);
 await read.run('printDoc()');assert.equal(read('capturedPrice'),true);assert.equal(read('printedPrice'),false);assert.equal(read('DOC_PRINTING'),false);
 read.run('PRICE_ON=true');await read.run('printDoc()');assert.equal(read('PRICE_ON'),true);
});
test('popup blocking, missing documents and failures leave price state unchanged and allow retry',async()=>{
 for(const options of [{blockPopup:true},{noDocument:true},{snapshotFails:true},{printFails:true}]){
  const read=runtime(options);read.run('render=async()=>{}');await read.run('printDoc()');
  assert.equal(read('PRICE_ON'),false);assert.equal(read('DOC_PRINTING'),false);assert.ok(read.toast());
 }
});
test('repeated print clicks share preparation and do not open duplicate windows',async()=>{
 const read=runtime();read.run(`let releases,opens=0;render=()=>new Promise(resolve=>{releases=resolve});window.HTTPrint.open=()=>{opens++;return {setDocument(){},async print(){},fail(){}}};var firstPrint=printDoc()`);
 await read.run('printDoc()');assert.equal(read('opens'),1);
 read.run('render=async()=>{};releases()');await read.run('firstPrint');assert.equal(read('DOC_PRINTING'),false);
});
test('every quote, order, invoice and credit note exposes the shared print action',()=>{
 const read=runtime();read.run('PRICE_ON=true');
 for(const expression of ['QUOTES.map(q=>quoteDetail(q.no.toLowerCase()))','ORDERS.map(o=>orderDetail(o.no.toLowerCase()))','INVOICES.map(i=>invoiceDetail(i.no.toLowerCase()))','CREDITS.map(c=>creditDetail(c.slug))']){
  for(const html of read(expression)){assert.ok(html.includes('onclick="printDoc()"'));assert.ok(html.includes('class="print-actions"'));}
 }
});
test('statement print date cannot relabel current balances as an unavailable historical month',async()=>{
 const read=runtime();read.run('PRICE_ON=true');const html=await read.run('statement(new URLSearchParams())');
 assert.ok(html.includes('this.selectedIndex=0'));assert.ok(html.includes('$24,324.62'));assert.ok(html.includes('onclick="printDoc()"'));
});
