import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script=fs.readFileSync(new URL('../public/reference-portal/portal.js',import.meta.url),'utf8');
function runtime(){
 const context=vm.createContext({URLSearchParams,structuredClone,window:{addEventListener(){}},document:{addEventListener(){}},localStorage:{getItem(){return null}},sessionStorage:{getItem(){return null}},location:{hash:'#/dashboard'},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){}});
 // Compile as the classic script used by the reference, excluding its DOM bootstrap.
 new vm.Script(script.slice(0,script.lastIndexOf("document.getElementById('who-name')"))).runInContext(context,{timeout:1000});
 return expression=>JSON.parse(vm.runInContext(`JSON.stringify(${expression})`,context,{timeout:1000}));
}
test('reference stock bands expose availability without leaking precise quantities',()=>{
 const read=runtime();assert.deepEqual(read('[stockBand({stock:500,unit:"m²"}),stockBand({stock:200,unit:"m²"}),stockBand({stock:1,unit:"m²"}),stockBand({stock:null,unit:"m²"}),stockBand({madeToOrder:true})].map(b=>b.k)'),['high','med','low','out','mto']);
});
test('reference line prices, box conversion, GST and credits reconcile',()=>{
 const read=runtime();assert.equal(read('unitPrice({clr:40,promo:50,yours:60})'),40);
 assert.equal(read('boxOf(PRODUCTS.find(p=>p.id==="bonita-natural-oak"))'),2.166);
 assert.equal(read('cartLine({id:"bonita-natural-oak",qty:2}).total'),298.77);
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
