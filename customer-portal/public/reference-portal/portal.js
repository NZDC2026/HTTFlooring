/* eslint-disable no-unused-vars, no-unused-expressions -- Classic script: handlers are referenced by the supplied HTML templates. */

/* =====================================================================
   数据区 —— 内容全部来自 2026-11-18 在线门户截取的页面。
   接系统时，把这里换成 API 返回的数据即可。
   ===================================================================== */
/* 系统日期（给 IT）：页面上显示的日期、逾期天数、账龄都按「我们系统」的日期算，不用客户电脑的时钟。
   IT: GET /api/portal/system-info → {systemDate, timezone, syncedAt}，每次打开页面取一次 */
const SYSTEM_INFO = {systemDate:'2026-11-18', timezone:'Australia/Melbourne', syncedAt:'2026-11-18T11:40:00+11:00'};
const TODAY = new Date(SYSTEM_INFO.systemDate);
const CUSTOMER = {
  name:'ABC Flooring Pty Ltd', location:'Melbourne', abn:'51 824 753 556', type:'Flooring Retailer',
  manager:'Daniel', contact:{name:'John Smith', email:'john@abcflooring.com.au', mobile:'0412 345 678', phone:'-', address:'Melbourne, Victoria, 3000'},
  address:'Melbourne, Victoria, 3000, Australia'
};

const SERIES = [
  // size / box：规格和每箱面积（主系统产品资料）。colours 由 PRODUCTS 自动算
  {id:'bonita', name:'Bonita', cat:'Engineered Timber', type:'Plank', img:'ph1', size:'1900 × 190 × 14/2 mm', box:'2.166 m² / box · 6 pcs',
   desc:'Engineered European Oak Flooring', spec:'14mm / 2mm wear layer · Matte finish · 2.166 m² per box · 6 boards per pack'},
  {id:'quercus', name:'Quercus', cat:'Engineered Timber', type:'Herringbone', img:'ph4', size:'600 × 120 × 15/4 mm', box:'1.86 m² / box · 26 pcs',
   desc:'Engineered Oak Herringbone', spec:'15mm / 4mm wear layer · Brushed, UV oiled · 1.86 m² per box'},
  {id:'heritage', name:'Heritage', cat:'Engineered Timber', type:'Chevron', img:'ph3', size:'720 × 120 × 15/4 mm', box:'2.0 m² / box · 24 pcs',
   desc:'Engineered Oak Chevron', spec:'15mm / 4mm wear layer · Hand-scraped · 2.0 m² per box'},
  {id:'guardian', name:'Guardian', cat:'Hybrid', type:'Plank', img:'ph2', size:'1830 × 228 × 9 mm', box:'2.503 m² / box · 6 pcs',
   desc:'Waterproof Hybrid Flooring', spec:'9mm with 1.5mm IXPE underlay · 0.55mm wear layer · 2.503 m² per box'},
  {id:'terra', name:'Terra', cat:'Hybrid', type:'Herringbone', img:'ph5', size:'615 × 123 × 8 mm', box:'1.51 m² / box · 20 pcs',
   desc:'Hybrid Herringbone', spec:'8mm with underlay · 0.5mm wear layer · 1.51 m² per box'},
  {id:'aquaglow', name:'AquaGlow', cat:'Laminate', type:'Plank', img:'ph6', size:'1218 × 198 × 12 mm', box:'1.93 m² / box · 8 pcs',
   desc:'Water-resistant Laminate', spec:'12mm · AC4 · 1.93 m² per box'},
  {id:'nordic', name:'Nordic', cat:'Laminate', type:'Chevron', img:'ph3', size:'600 × 100 × 12 mm', box:'1.44 m² / box · 24 pcs',
   desc:'Laminate Chevron', spec:'12mm · AC4 · 1.44 m² per box'},
  {id:'scotia', name:'Scotia', cat:'Accessories', type:'Scotia', img:'ph1', size:'2400 × 18 × 18 mm', box:'per length',
   desc:'Colour-matched Scotia', spec:'2.4m length · MDF wrapped'},
  {id:'stair-nose', name:'Stair Nose', cat:'Accessories', type:'Stair Nose', img:'ph4', size:'2400 mm · made to order', box:'per length',
   desc:'Stair Nose to match your floor', spec:'Customised to each colour · 2.4m length'},
  {id:'trims', name:'Trims', cat:'Accessories', type:'Trims', img:'ph5', size:'2700 mm', box:'per length',
   desc:'Transition & End Trims', spec:'Aluminium core · 2.7m length'},
];

const PROMO = {from:'01 Nov 2026', to:'30 Nov 2026'};
const BONITA_SIZE = {size:'1900 × 190 × 14/2 mm', box:'2.166 m² / box · 6 pcs'};   // 旧字段，规格已移到 SERIES.size / box
// 产品（颜色）列表。stock 为 null 表示原站显示 "-"
const PRODUCTS = [
  {id:'bonita-natural-oak', series:'bonita', colour:'Natural Oak', code:'M-2', sku:'BON-001', std:82, yours:75, promo:69, off:'8% OFF', stock:478.69, boxes:221, scotia:'WF807', nose:'Customized', trims:'Blackbutt', sw:'#a9805c', unit:'m²'},
  {id:'bonita-latte-oak', series:'bonita', colour:'Latte Oak', code:'M-3', std:82, yours:75, stock:null, scotia:'D3005', nose:'Customized', trims:'HBY-W019', sw:'#c3ad94', unit:'m²'},
  {id:'bonita-lime-wash', series:'bonita', colour:'Lime Wash', code:'M-5', std:82, yours:75, stock:null, scotia:'WF806', nose:'Customized', trims:'Cream', sw:'#b9a283', unit:'m²'},
  {id:'bonita-grey-wash', series:'bonita', colour:'Grey Wash', code:'M-6', std:82, yours:75, stock:null, scotia:'A108', nose:'Customized', trims:'HBY-W024', sw:'#8a7f72', unit:'m²'},
  {id:'bonita-brescia', series:'bonita', colour:'Brescia', code:'M-8', std:82, yours:75, promo:69, off:'8% OFF', stock:null, scotia:'A113', nose:'Customized', trims:'Black', sw:'#7d6248', unit:'m²'},
  {id:'bonita-white-oak', series:'bonita', colour:'White Oak', code:'M-9', std:82, yours:75, promo:69, off:'8% OFF', stock:null, scotia:'WF806', nose:'Customized', trims:'HBY-W019', sw:'#d6c3a5', unit:'m²'},
  {id:'bonita-cuban', series:'bonita', colour:'Cuban', code:'M-11', std:82, yours:75, promo:69, off:'8% OFF', stock:null, scotia:'WF08', nose:'Customized', trims:'D3015', sw:'#6a4a33', unit:'m²'},
  {id:'bonita-cotton-oak', series:'bonita', colour:'Cotton Oak', code:'M-13', std:82, yours:75, promo:69, off:'8% OFF', stock:null, scotia:'WF801', nose:'Customized', trims:'HBY-W019', sw:'#cdb699', unit:'m²'},
  {id:'bonita-smoked-brown', series:'bonita', colour:'Smoked Brown', code:'M-14', std:82, yours:75, promo:69, off:'8% OFF', stock:null, scotia:'A115', nose:'Customized', trims:'HBY-004', sw:'#5b4332', unit:'m²'},
  // 以下两项在原站促销页看到；所属系列为推测
  {id:'guardian-natural-grey', series:'guardian', colour:'Natural Grey', code:'QUA-016', std:55, yours:50, promo:47.5, off:'5% OFF', stock:191.40, boxes:76, unit:'m²', sw:'#9a9890'},
  {id:'aquaglow-silver', series:'aquaglow', colour:'Silver', code:'AQU-002', std:48, yours:46, promo:44, off:'4.3% OFF', stock:57.20, boxes:30, unit:'m²', sw:'#b9bcbf'},
];
/* 示例产品（演示用，正式版全部来自主系统）：补齐其他系列的颜色 */
(function(){
  const add=(series,list,o)=>list.forEach(([colour,code,sw,stock],i)=>PRODUCTS.push({id:series+'-'+colour.toLowerCase().replace(/[^a-z0-9]+/g,'-'), series, colour, code, sw, stock:stock??null, boxes:stock&&o.boxM?Math.round(stock/o.boxM):null, ...o, ...(o.promoIdx&&o.promoIdx.includes(i)?{promo:o.promoP, off:o.off}:{})}));
  add('quercus',[['Natural','Q-1','#b8915f',142.6],['Coastal','Q-2','#c9b79c'],['Sandstone','Q-3','#bfa07a',88.4],['Driftwood','Q-4','#9b8c7b'],['Honey','Q-5','#c08a4a',61.4],['Smoke','Q-6','#6e5e52'],['Chalk','Q-7','#ddd2c0',35.3],['Walnut','Q-8','#5c3f2c'],['Grey Mist','Q-9','#a29d96'],['Espresso','Q-10','#3f2d22',22.3]],
    {std:108, yours:98, unit:'m²', boxM:1.86});
  add('heritage',[['Rustic Oak','HER-008','#8b6a48',120.0]],{std:118, yours:105, unit:'m²', boxM:2.0});
  add('guardian',[['Coastal Ash','QUA-021','#c7bba8',96.1],['Smoked Oak','QUA-024','#6b5644']],{std:55, yours:50, unit:'m²', boxM:2.503});
  add('terra',[['Sand','TER-01','#d0bc9c',45.3],['Clay','TER-02','#a07a58',30.2],['Charcoal','TER-03','#4d4640']],{std:62, yours:56, unit:'m²', boxM:1.51, promoIdx:[0,1], promoP:52, off:'7% OFF'});
  add('aquaglow',[['Natural Oak','AQU-005','#c4a27a',80.1]],{std:48, yours:46, unit:'m²', boxM:1.93});
  add('nordic',[['Birch','NOR-01','#e0d2bb',43.2],['Ash Grey','NOR-02','#a8a29a']],{std:52, yours:48, unit:'m²', boxM:1.44});
  add('scotia',[['WF807','WF807','#a9805c',140],['D3005','D3005','#c3ad94',96],['WF806','WF806','#d6c3a5',120],['A108','A108','#8a7f72',44],['A113','A113','#7d6248',62],['WF08','WF08','#6a4a33',30],['WF801','WF801','#cdb699',88],['A115','A115','#5b4332']],
    {std:14, yours:12.5, unit:'length'});
  add('stair-nose',['Natural Oak','Latte Oak','Lime Wash','Grey Wash','Brescia','White Oak','Cuban','Cotton Oak','Smoked Brown'].map(c=>{const b=PRODUCTS.find(p=>p.series==='bonita'&&p.colour===c); return [c,'SN-'+c.split(' ').map(w=>w[0]).join(''),b?b.sw:'#a9805c',null];}),
    {std:52, yours:46, unit:'length', madeToOrder:true});
  add('trims',[['Blackbutt','Blackbutt','#b08a62',60],['HBY-W019','HBY-W019','#d8c7ac',75],['Cream','Cream','#e8dcc6',40],['HBY-W024','HBY-W024','#9a8f82',26],['Black','Black','#2b2b2b',90],['D3015','D3015','#6c4c35',18],['HBY-004','HBY-004','#5c4535']],
    {std:22, yours:19.5, unit:'length'});
  /* 演示：没填 scotia / trims 的地板，按色板最接近的辅料自动配上（正式版由主系统的产品字段提供） */
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)), dist=(a,b)=>{const x=rgb(a),y=rgb(b);return x.reduce((t,v,i)=>t+(v-y[i])**2,0);};
  const near=ser=>p=>PRODUCTS.filter(x=>x.series===ser).sort((u,v)=>dist(u.sw,p.sw)-dist(v.sw,p.sw))[0];
  PRODUCTS.filter(p=>p.unit==='m²'&&!p.scotia).forEach(p=>{ const sc=near('scotia')(p), tr=near('trims')(p); if(sc) p.scotia=sc.code; if(tr) p.trims=tr.code; });
  SERIES.forEach(s=>{ s.colours = PRODUCTS.filter(p=>p.series===s.id).length || s.colours || 0; });
})();
/* 主系统字段 description：产品资料上的说明（印在 Quote / Order / Invoice 上的那段）。以下为示例数据 */
(function(){ const D={bonita:'European Oak ABCD Grade · Brushed · UV Lacquer', quercus:'European Oak AB Grade Herringbone · Matt Oiled', heritage:'European Oak CD Grade Rustic · Smoked · Hand-scraped',
  guardian:'Hybrid SPC 6.5mm · 1mm IXPE underlay · 0.5mm wear layer', terra:'Hybrid SPC 7mm · Stone texture · 1.5mm IXPE', aquaglow:'Laminate 12mm AC4 · Water resistant 72h', nordic:'Laminate 8mm AC4 · V-groove',
  scotia:'Scotia moulding · MDF foil wrapped', 'stair-nose':'Stair nose · matching veneer · made to order', trims:'Transition trim · anodised aluminium'};
  PRODUCTS.forEach(p=>{ if(!p.desc && D[p.series]) p.desc=D[p.series]; }); })();
/* 主系统字段：isNew = 主系统打的「New」标记，addedOn = 上架日期；eta = 缺货时预计到货日期 */
[['terra-sand','2026-11-05'],['terra-clay','2026-11-05'],['terra-charcoal','2026-11-05'],['nordic-birch','2026-10-22'],['nordic-ash-grey','2026-10-22'],['bonita-latte-oak','2026-10-01']]
  .forEach(([id,d])=>{ const p=PRODUCTS.find(x=>x.id===id); if(p){ p.isNew=true; p.addedOn=d; } });
/* 在途货柜（主系统字段 incoming：[{qty, eta, ref}]）。缺货产品的 eta = 最早一批的到货日期 */
[['terra-charcoal',[[90.6,'2026-12-02']]],['bonita-latte-oak',[[433.2,'2026-11-28'],[216.6,'2027-01-15']]],['nordic-ash-grey',[[86.4,'2026-12-09']]],['quercus-coastal',[[148.8,'2026-12-15']]],
 ['bonita-natural-oak',[[649.8,'2026-12-05']]],['bonita-smoked-brown',[[324.9,'2026-12-05']]],['bonita-white-oak',[[324.9,'2026-12-05']]],['guardian-natural-grey',[[250.3,'2026-12-12']]],['quercus-natural',[[111.6,'2026-12-15']]]]
  .forEach(([id,list])=>{ const p=PRODUCTS.find(x=>x.id===id); if(!p) return; p.incoming=list.map(([qty,eta],i)=>({qty,eta,ref:'SHP-'+(2611+i)+'-'+id.slice(0,3).toUpperCase()})); if(p.stock==null) p.eta=list[0][1]; });
/* 库存给客户只显示档位：High / Medium / Low / Out of stock，不显示确切数量。
   门槛（HTT 定）：地板 m² ≥500 High、200–500 Medium、<200 Low；辅料（按根）≥150 High、100–150 Medium、<100 Low。正式版由主系统设定，可按产品调整 */
const BAND_AT = {'m²':[500,200], length:[150,100], other:[150,100]};
function stockBand(p){ if(p.madeToOrder) return {k:'mto', t:'Made to order'}; if(p.stock==null || p.stock<=0) return {k:'out', t:'Out of stock'};
  const [h,m] = BAND_AT[p.unit] || BAND_AT.other; return p.stock>=h ? {k:'high', t:'High stock'} : p.stock>=m ? {k:'med', t:'Medium stock'} : {k:'low', t:'Low stock'}; }
const bandTag = p => { const b=stockBand(p); return `<span class="sband ${b.k}">${b.k==='mto'?'':'● '}${b.t}</span>`; };
const incTxt = p => p.incoming&&p.incoming.length ? `<div class="inc">⛴ Incoming ${fmtDay(p.incoming[0].eta).slice(0,6)}${p.incoming.length>1?` · +${p.incoming.length-1} more`:''}</div>` : '';
/* 每个产品自己的促销结束日期（主系统字段 promoTo）；没有就用 PROMO.to */
[['terra-sand','15 Dec 2026'],['terra-clay','15 Dec 2026'],['guardian-natural-grey','25 Nov 2026']].forEach(([id,d])=>{ const p=PRODUCTS.find(x=>x.id===id); if(p) p.promoTo=d; });
const promoEnd = p => p.promoTo || PROMO.to;
/* =====================================================================
   网上下单（给 IT）：客户可以开 Quote 或下 Order。
   · 购物车 + 快速下单两种入口；地板按箱下单，自动算 m²（也可输入 m² 自动进位到整箱）；辅料按根
   · 价格：清仓价 > 促销价 > Trade price，均不含 GST；运费由 HTT 计算
   · 库存不够（或缺货）的产品不能下 Order，只能开 Quote
   · Order 提交后状态 Pending（Waiting for HTT），HTT 在主系统确认后才变 Preparing；Quote 直接生成，有效 30 天
   IT: POST /api/portal/me/quotes  {lines:[{productId, boxes|qty}], storeId, method, wantedDate, po, ref, note}
       POST /api/portal/me/orders  同上；提交前服务端要再检查库存和价格
   ===================================================================== */
let CART = [];   // [{id, qty}]  qty = 箱数（地板）或根数（辅料）
const boxOf = p => { const s=SERIES.find(x=>x.id===p.series); const m=s&&s.box&&parseFloat(s.box); return isFinite(m)&&m>0?m:null; };
const unitPrice = p => p.clr||p.promo||p.yours;
const qtyUnit = (p,n) => boxOf(p) ? `box${n!==1?'es':''}` : (p.unit==='length'?`length${n!==1?'s':''}`:p.unit);
/* 新订单的预计备货日期（估算）：有货 → 下一个工作日；缺货 → 该产品最近一批到货日期；都没有 → 待确认。正式版以主系统回传的 readyBy 为准 */
function estReady(){ if(!CART.length) return null; let d=earliestDate('Delivery');
  for(const x of CART.map(cartLine)){ if(!x.short) continue; const eta=(x.p.incoming||[]).map(i=>i.eta).sort()[0]; if(!eta) return 'tbc'; const e=nextBiz(isoAdd(eta,1)); if(e>d) d=e; }
  return d; }
function cartLine(c){ const p=byId(c.id), b=boxOf(p), amt=b?r2(b*c.qty):c.qty, price=unitPrice(p);
  const short = !p.madeToOrder && (p.stock==null || amt>p.stock);
  return {c, p, b, amt, price, total:r2(amt*price), short, S:SERIES.find(x=>x.id===p.series)}; }
function draftTitle(){ const n=CART.length; return DRAFT.editing ? `Editing ${DRAFT.editing} · ${n} line${n!==1?'s':''}` : `Unsaved draft · ${DRAFT.type==='quote'?'Quote':'Order'} · ${n} line${n!==1?'s':''}`; }
function updateCartBadge(){ const n=draftList().length, el=document.getElementById('cartn'); if(el){ el.textContent=''; el.className=n?'cdot':''; el.style.display=n?'':'none'; const a=el.closest('a'); if(a) a.title = draftTitle(); } }
/* 多张草稿：目前打开的一张 = CART + DRAFT；其它的放在 DRAFTS。开新单时，目前这张自动收进 Drafts，不会丢。
   草稿跟着门店走（在哪家店开的就属于哪家店），30 天没动自动删除。IT：草稿存后端 GET/PUT/DELETE /api/portal/me/drafts/{id} */
let DRAFTS = []; const DRAFT_DAYS = 30;
const blankDraft = type => ({id:null, type:type||'quote', step:1, ref:'', method:'Delivery', wanted:null, note:'', ship:null, editShip:false, editing:null, store:null});
const hasContent = () => CART.length>0 || !!DRAFT.editing;
function parkActive(){ if(!hasContent()) return; if(!DRAFT.id) DRAFT.id='D'+Date.now()+Math.floor(Math.random()*99); if(!DRAFT.store) DRAFT.store=newDocStore();
  const snap={id:DRAFT.id, cart:JSON.parse(JSON.stringify(CART)), draft:JSON.parse(JSON.stringify(DRAFT)), at:(DRAFT_SAVED?+DRAFT_SAVED:Date.now())};
  DRAFTS=[snap,...DRAFTS.filter(d=>d.id!==snap.id)]; }
function startFresh(type){ const had=hasContent(); parkActive(); CART=[]; DRAFT=blankDraft(type); DRAFT_SAVED=null; return had; }
function openDraft(id){ closeDrafts(); if(DRAFT.id===id){ go('#/cart'); return; } const d=DRAFTS.find(x=>x.id===id); if(!d) return;
  parkActive(); DRAFTS=DRAFTS.filter(x=>x.id!==id); CART=d.cart.filter(c=>byId(c.id)); DRAFT={...blankDraft(d.draft.type),...d.draft}; DRAFT_SAVED=new Date(d.at);
  if(DRAFT.store && STORE!=='all' && STORE!==DRAFT.store && allowedStores().includes(DRAFT.store)){ STORE=DRAFT.store; applyStore(); }
  go('#/cart'); if(location.hash==='#/cart') render(); }
function discardDraft(id){ closeDrafts(); const d = id===DRAFT.id ? {draft:DRAFT,cart:CART} : DRAFTS.find(x=>x.id===id); if(!d) return;
  if(!confirm(`Discard this ${d.draft.editing?'edit of '+d.draft.editing:d.draft.type+' draft'}?`)) return;
  if(id===DRAFT.id){ CART=[]; DRAFT=blankDraft(DRAFT.type); DRAFT_SAVED=null; } else DRAFTS=DRAFTS.filter(x=>x.id!==id);
  toast('Draft discarded'); render(); }
function draftList(){ if(hasContent() && !DRAFT.id) DRAFT.id='D'+Date.now(); if(hasContent() && !DRAFT.store) DRAFT.store=newDocStore();
  const L=[...(hasContent()?[{id:DRAFT.id, cart:CART, draft:DRAFT, at:DRAFT_SAVED?+DRAFT_SAVED:Date.now(), active:true}]:[]), ...DRAFTS];
  return L.filter(d=> STORE==='all' ? allowedStores().includes(d.draft.store||newDocStore()) : (d.draft.store||newDocStore())===STORE); }
const draftAmt = d => r2(d.cart.reduce((t,c)=>{ const p=byId(c.id); if(!p) return t; const b=boxOf(p); return t + (b? r2(b*c.qty)*unitPrice(p) : c.qty*unitPrice(p)); },0));
const draftName = d => d.draft.editing ? `Editing ${d.draft.editing}` : (d.draft.type==='quote'?'Quote':'Order')+' draft';
function agoTxt(t){ const m=Math.round((Date.now()-t)/60000); return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' days ago'; }
function draftRow(d, full){ const n=d.cart.length, st=STORE==='all'&&STORES().length>1?`<span class="drst">📍 ${esc(stShort(d.draft.store||newDocStore()))}</span>`:'';
  return `<div class="drrow ${d.active?'dact':''}"><span class="dric ${d.draft.editing?'ed':d.draft.type}">${d.draft.editing?'✎':d.draft.type==='quote'?ICON.doc:ICON.truck}</span>
    <div class="drtx"><b>${esc(draftName(d))}${d.active?' <i>Open now</i>':''}</b><small>${d.draft.ref?esc(d.draft.ref)+' · ':''}${n} product${n!==1?'s':''} · ${money(draftAmt(d))} ex GST ${st}</small></div>
    <span class="drago">${agoTxt(d.at)}</span>
    <button class="btn sm" onclick="openDraft('${d.id}')">${d.active?'Open':'Continue'}</button><button class="drx" title="Discard" onclick="discardDraft('${d.id}')">×</button></div>`; }
function draftsMenu(){ const L=draftList(); if(!L.length) return `<div class="drnone">No drafts. Quotes and orders you start are saved here automatically.</div>`;
  return L.slice(0,5).map(d=>draftRow(d)).join('') + (L.length>5?`<a class="drall" href="#/drafts" onclick="closeDrafts()">View all drafts (${L.length}) →</a>`:`<div class="drfoot">Drafts are kept for ${DRAFT_DAYS} days</div>`); }
function toggleDrafts(e){ e.stopPropagation(); const w=document.querySelector('.drw'); if(!w) return; const o=!w.classList.contains('open'); if(o) w.querySelector('.drdd').innerHTML=draftsMenu(); w.classList.toggle('open',o); }
function closeDrafts(){ const w=document.querySelector('.drw'); if(w) w.classList.remove('open'); }
document.addEventListener('mousedown', e=>{ if(!e.target.closest('.drw')) closeDrafts(); }, true);
function draftsPage(){ const L=draftList();
  return `<div class="wrap" style="padding:28px 0 60px"><h1 class="serif" style="font-weight:500;margin:0 0 6px">Drafts</h1><p class="muted" style="margin:0 0 20px">Quotes and orders you started but haven't sent yet${STORE!=='all'?' at '+esc(stLabel(STORE)):''}. Drafts not touched for ${DRAFT_DAYS} days are removed.</p>
    <div class="nfc drpage">${L.length?L.map(d=>draftRow(d,true)).join(''):'<div class="drnone">No drafts.</div>'}</div></div>`; }
function draftTitle(){ const n=draftList().length; return n?`${n} draft${n!==1?'s':''}`:'New quote / order'; }
function newDoc(type){ if(!can('place')){ toast('Your login can\'t create quotes or orders — ask your admin'); return; }
  if(hasContent()){ startFresh(type); toast('Your previous draft is saved in Drafts'); } else DRAFT.type=type;
  go('#/cart'); if(location.hash==='#/cart') render(); }
/* 从产品页加入：还没有草稿时，先问加到 Quote 还是 Order；已有草稿就直接加进去 */
function addFromCatalog(id, qty){ if(!can('place')){ toast('Your login can\'t create quotes or orders — ask your admin'); return; } const p=byId(id), S=SERIES.find(x=>x.id===p.series)||{};
  const oos = p.stock==null && !p.madeToOrder, m=document.getElementById('modal');
  if(CART.length || DRAFT.editing){ const n=CART.length, cur = DRAFT.editing ? `quote ${DRAFT.editing}` : `${DRAFT.type} draft`;
    m.innerHTML = `<div class="mbox" style="max-width:480px"><h3 class="serif" style="font-weight:500;font-size:24px;margin:0 0 4px">Add ${esc(S.name)} ${esc(p.colour)} to…</h3>
      <p class="muted" style="margin:0 0 16px;font-size:13px">${qty} ${qtyUnit(p,+qty)}</p>
      <div class="qochoose one">
        <button onclick="closeModal();cartAdd('${id}',${+qty});toast('Added to your ${cur}')"><b>${DRAFT.editing?ICON.doc:DRAFT.type==='quote'?ICON.doc:ICON.truck} Your ${esc(cur)}</b><small>Add it to what you're working on · ${n} product${n!==1?'s':''} so far</small></button>
      </div>
      <div class="qosep">or start a new one <span>— your current ${esc(cur)} is kept in Drafts</span></div>
      <div class="qochoose">
        <button onclick="closeModal();startFresh('quote');cartAdd('${id}',${+qty});go('#/cart')"><b>${ICON.doc} New quote</b><small>Valid ${QUOTE_LBL}</small></button>
        <button ${oos?'disabled':''} onclick="closeModal();startFresh('order');cartAdd('${id}',${+qty});go('#/cart')"><b>${ICON.truck} New order</b><small>${oos?'Out of stock — quote only':'Delivery or pick up'}</small></button>
      </div>
      <div style="text-align:right;margin-top:14px"><button class="btn-o" onclick="closeModal()">Cancel</button></div></div>`;
    m.style.display='flex'; return; }
  m.innerHTML = `<div class="mbox" style="max-width:460px"><h3 class="serif" style="font-weight:500;font-size:24px;margin:0 0 4px">Add ${esc(S.name)} ${esc(p.colour)} to…</h3>
    <p class="muted" style="margin:0 0 16px;font-size:13px">${qty} ${qtyUnit(p,+qty)} · you can add more products and change quantities next.</p>
    <div class="qochoose">
      <button onclick="closeModal();DRAFT.type='quote';cartAdd('${id}',${+qty});go('#/cart')"><b>${ICON.doc} New quote</b><small>Get prices confirmed and reserve the deal. Valid ${QUOTE_LBL}.</small></button>
      <button ${oos?'disabled':''} onclick="closeModal();DRAFT.type='order';cartAdd('${id}',${+qty});go('#/cart')"><b>${ICON.truck} New order</b><small>${oos?'Out of stock — quote only':'Order now for delivery or pick up.'}</small></button>
    </div>
    <div style="text-align:right;margin-top:14px"><button class="btn-o" onclick="closeModal()">Cancel</button></div></div>`;
  m.style.display='flex'; }
function cartAdd(id, qty){ qty=Math.max(1,Math.round(+qty||1)); const ex=CART.find(c=>c.id===id); if(ex) ex.qty+=qty; else CART.push({id,qty}); updateCartBadge();
  const p=byId(id); toast(`Added ${qty} ${qtyUnit(p,qty)} · ${(SERIES.find(x=>x.id===p.series)||{}).name} ${p.colour}`); render(); }
function cartSet(id, qty){ const c=CART.find(x=>x.id===id); if(!c) return; c.qty=Math.max(1,Math.round(+qty||1)); if(c.mode!=='m2') c.want=null; render(); }
/* 按 m² 输入：自动进位到整箱，记住客户输入的 m² 方便对照 */
function cartMode(id,m){ const c=CART.find(x=>x.id===id); if(!c) return; c.mode=m; if(m==='box') c.want=null; render(); setTimeout(()=>{ const r=[...document.querySelectorAll('.nft tbody tr')][CART.indexOf(c)]; const i=r&&r.querySelector(m==='m2'?'.m2in input':'.pqs input'); if(i){ i.focus(); i.select(); } },0); }
function cartSetM2(id, v){ const c=CART.find(x=>x.id===id), p=byId(id), b=boxOf(p); if(!c||!b) return; v=+v;
  if(!(v>0)){ render(); return; } c.qty=Math.max(1,Math.ceil(r2(v/b)-1e-9)); c.want=r2(v); render(); }
function cartDel(id){ CART=CART.filter(c=>c.id!==id); render(); }
/* 产品页：数量（箱）+ 加入购物车 */
function addCartBox(p){
  const b=boxOf(p);
  return `<div class="addcart" data-box="${b||''}" data-unit="${p.unit}">
    <div class="acrow"><span class="pqs"><button type="button" onclick="acStep(this,-1)">−</button><input class="acq" type="number" min="1" value="1" oninput="acUpd(this)" onfocus="this.select()"><button type="button" onclick="acStep(this,1)">+</button></span>
      <span class="acu">${b?'boxes':'lengths'}</span>${b?`<span class="acm">= <b>${b.toFixed(3)}</b> m²</span>`:''}
      <button class="btn" onclick="addFromCatalog('${p.id}', this.closest('.addcart').querySelector('.acq').value)">Add to quote / order</button></div>
    ${b?`<div class="acm2">or enter m² <input type="number" min="0" step="0.1" placeholder="e.g. 45" oninput="acFromM2(this)"> <span class="muted">— rounded up to full boxes</span></div>`:''}
    ${!p.madeToOrder&&(p.stock==null)?`<div class="acwarn">Out of stock — you can request a quote, but not place an order.</div>`:''}
  </div>`;
}
function acStep(btn,d){ const i=btn.parentNode.querySelector('input'); i.value=Math.max(1,(+i.value||1)+d); acUpd(i); }
function acUpd(i){ const w=i.closest('.addcart'), b=+w.dataset.box; const m=w.querySelector('.acm b'); if(b&&m) m.textContent=(b*(+i.value||0)).toFixed(3); }
function acFromM2(inp){ const w=inp.closest('.addcart'), b=+w.dataset.box, q=w.querySelector('.acq'); if(b&&+inp.value>0){ q.value=Math.ceil(+inp.value/b); acUpd(q); } }
/* 选产品：可搜索的下拉，一行一个产品（色块、名称、代码、规格、库存、价格） */
const PP = {q:'', cat:'All', sub:'All', i:0, open:new Set(), shut:new Set()};
function ppList(){ const q=PP.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return PRODUCTS.filter(p=>{ const S=SERIES.find(x=>x.id===p.series)||{}; if(PP.cat!=='All'&&S.cat!==PP.cat) return false; if(PP.sub!=='All'&&S.type!==PP.sub) return false;
    const hay=`${S.name} ${p.colour} ${p.code} ${S.cat}`.toLowerCase(); return q.every(w=>hay.includes(w)); }); }
function ppOpen(inp){ inp.parentNode.classList.add('open'); ppDraw(); }
function ppClose(){ const w=document.querySelector('.pp'); if(w) w.classList.remove('open'); }
function ppKeyOf(p){ const S=SERIES.find(x=>x.id===p.series)||{}, cs=Object.keys(CAT_TREE), ci=cs.indexOf(S.cat), ti=(CAT_TREE[S.cat]||[]).indexOf(S.type); return [ci<0?99:ci, ti<0?99:ti, SERIES.indexOf(S)]; }
function ppOrd(a,b){ const A=ppKeyOf(a), B=ppKeyOf(b); return A[0]-B[0]||A[1]-B[1]||A[2]-B[2]; }
function ppIsOpen(key){ return PP.q.trim() ? !PP.shut.has(key) : PP.open.has(key); }
function ppItems(){ const L=ppList().sort(ppOrd), out=[], Sof=p=>SERIES.find(x=>x.id===p.series)||{};
  [...new Set(L.map(p=>Sof(p).cat))].forEach(cat=>{ const Lc=L.filter(p=>Sof(p).cat===cat), ck='c:'+cat, co=ppIsOpen(ck);
    out.push({k:'c', key:ck, cat, n:new Set(Lc.map(p=>p.series)).size, nc:Lc.length, open:co}); if(!co) return;
    [...new Set(Lc.map(p=>Sof(p).type))].forEach(type=>{ const Lt=Lc.filter(p=>Sof(p).type===type), tk='t:'+cat+'|'+type, to=ppIsOpen(tk);
      out.push({k:'t', key:tk, type, n:new Set(Lt.map(p=>p.series)).size, open:to}); if(!to) return;
      [...new Set(Lt.map(p=>p.series))].forEach(sid=>{ const ps=Lt.filter(p=>p.series===sid), sk='s:'+sid, so=ppIsOpen(sk);
        out.push({k:'s', key:sk, sid, ps, open:so}); if(so) ps.forEach(p=>out.push({k:'p', p})); }); }); });
  return {L, out}; }
function ppToggle(key){ const set = PP.q.trim()?PP.shut:PP.open; set.has(key)?set.delete(key):set.add(key); ppDraw(); }
function ppDraw(){ const dd=document.querySelector('.ppdd'); if(!dd) return; const {L,out}=ppItems(); PP.i=Math.min(PP.i,Math.max(0,out.length-1));
  const cats=['All',...Object.keys(CAT_TREE)];
  const rows = out.map((it,k)=>ppRow(it,k)).join('');
  function ppRow(it,k){ const hi = k===PP.i?'hi':'', hov=`onmouseenter="PP.i=${k};document.querySelectorAll('.ppit').forEach((r,j)=>r.classList.toggle('hi',j===${k}))"`;
    const nIn = ps=>ps.filter(p=>CART.some(c=>c.id===p.id)).length;
    if(it.k==='c'){ const ps=L.filter(p=>(SERIES.find(x=>x.id===p.series)||{}).cat===it.cat), a=nIn(ps);
      return `<div class="ppit ppcat ${it.open?'open':''} ${hi}" onmousedown="event.preventDefault();ppToggle('${it.key}')" ${hov}><span class="car">›</span><b>${esc(it.cat)}</b>${a?`<u>${a} added</u>`:''}<em>${it.n} series · ${it.nc} colours</em></div>`; }
    if(it.k==='t'){ return `<div class="ppit pptyp ${it.open?'open':''} ${hi}" onmousedown="event.preventDefault();ppToggle('${it.key}')" ${hov}><span class="car">›</span><b>${esc(it.type)}</b><em>${it.n} series</em></div>`; }
    if(it.k==='s'){ const S=SERIES.find(x=>x.id===it.sid)||{}, tot=PRODUCTS.filter(x=>x.series===it.sid).length, nIn=it.ps.filter(p=>CART.some(c=>c.id===p.id)).length;
      return `<div class="ppit ppser ${it.open?'open':''} ${hi}" onmousedown="event.preventDefault();ppToggle('${it.key}')" ${hov}><span class="car">›</span><b>${esc(S.name)}</b><span>${S.size||''}</span>${nIn?`<u>${nIn} added</u>`:''}<em>${it.ps.length===tot?tot+' colour'+(tot!==1?'s':''):it.ps.length+' of '+tot+' colours'}</em></div>`; }
    const p=it.p, inC=CART.some(c=>c.id===p.id), pr=unitPrice(p);
    const st = p.stock==null&&!p.madeToOrder ? '<em class="no">Out of stock · quote only</em>' : bandTag(p);
    const tag = p.clr?'<u class="clr">CLEARANCE</u>':p.promo?'<u class="pro">PROMO</u>':'';
    return `<div class="ppit pprow ${hi}" onmousedown="event.preventDefault();ppPick('${p.id}')" ${hov}>
      <i style="background:${p.sw&&p.sw.startsWith('#')?p.sw:'#bbb'}"></i>
      <div class="ppn"><b>${esc(p.colour)}</b><small><span class="code">${esc(p.code)}</span></small></div>
      <div class="pps">${st}</div>
      <div class="ppp"><b>${money(pr)}</b><small> / ${unitLbl(p.unit)}</small>${tag}</div>
      <div class="ppa">${inC?'<span class="added">✓ Added</span>':'<span class="add">Add</span>'}</div></div>`; }
  dd.innerHTML = `<div class="pprows">${out.length?rows:`<div class="ppnone">No products match “${esc(PP.q)}”</div>`}</div>
    <div class="ppft">${new Set(L.map(p=>p.series)).size} series · ${L.length} colour${L.length!==1?'s':''} · click to open · ↑↓ to move, Enter to open / add · prices ex GST</div>`;
  const h=dd.querySelector('.ppit.hi'); if(h){ const box=dd.querySelector('.pprows'); if(h.offsetTop<box.scrollTop+30||h.offsetTop>box.scrollTop+box.clientHeight-50) box.scrollTop=h.offsetTop-120; } }
function ppKey(e){ const {out}=ppItems(), n=out.length;
  if(e.key==='ArrowDown'){ e.preventDefault(); PP.i=Math.min(n-1,PP.i+1); ppDraw(); }
  else if(e.key==='ArrowUp'){ e.preventDefault(); PP.i=Math.max(0,PP.i-1); ppDraw(); }
  else if(e.key==='Enter'){ e.preventDefault(); const it=out[PP.i]; if(!it) return; it.k==='p'?ppPick(it.p.id):ppToggle(it.key); }
  else if(e.key==='Escape'){ ppClose(); e.target.blur(); } }
function ppPick(id){ cartAdd(id,1); const keep=PP.i;  PP.q=''; PP.i=0; PP.shut.clear(); setTimeout(()=>{ const i=document.querySelector('.ppin'); if(i){ i.focus(); } },0); }
document.addEventListener('mousedown', e=>{ if(!e.target.closest('.pp')) ppClose(); }, true);
/* 购物车 */
/* 新建 Quote / Order：版面跟主系统的下单页一样（去掉客户、付款条件、运费、内部备注、毛利） */
let DRAFT = {type:'quote', step:1, ref:'', method:'Delivery', wanted:null, note:'', ship:null, editShip:false};
const QUOTE_DAYS = 2;   // 网上报价有效期 48 小时（按日期算：开单日 + 2 天）
const QUOTE_LBL = '48 hours';
function dSet(k,v){ DRAFT[k]=v; clearTimeout(dSet._t); dSet._t=setTimeout(draftSave,400); }
let RV_STYLE='c';
function reviewBox(t){ const L=CART.map(cartLine), boxes=L.filter(x=>x.b).reduce((n,x)=>n+x.c.qty,0), m2=r2(L.filter(x=>x.b).reduce((n,x)=>n+x.amt,0)), sub=r2(L.reduce((n,x)=>n+x.total,0));
  const qty = x => `${x.c.qty} ${esc(qtyUnit(x.p,x.c.qty))}`;
  const edit = `<button class="rvedit" onclick="dSet('step',1);render();window.scrollTo(0,0)">Edit products</button>`;
  const meta = DRAFT.ref||DRAFT.note?`<div class="rvmeta2">${DRAFT.ref?`<div><em>PO / ref.</em>${esc(DRAFT.ref)}</div>`:''}${DRAFT.note?`<div><em>Note to HTT</em>${esc(DRAFT.note)}</div>`:''}</div>`:'';
  const pm = x => x.b?`${x.amt.toFixed(2)}`:'—';
  const metaC = DRAFT.ref||DRAFT.note?`<div class="rvcmeta">${DRAFT.ref?`<div><em>PO / ref.</em><span>${esc(DRAFT.ref)}</span></div>`:''}${DRAFT.note?`<div><em>Note to HTT</em><span>${esc(DRAFT.note)}</span></div>`:''}</div>`:'';
  if(RV_STYLE==='c') return `<section class="nfc rva rvc">
    <div class="rvchd"><div><h3>Your ${t}</h3><span>${L.length} line${L.length!==1?'s':''}${boxes?` · ${boxes} boxes · ${m2.toFixed(2)} m²`:''}</span></div>${edit}</div>
    ${metaC}
    <table class="rvct"><thead><tr><th>Product</th><th class="r">Qty</th><th class="r">m²</th><th class="r">Unit price</th><th class="r">Amount ex GST</th></tr></thead><tbody>
    ${L.map(x=>`<tr${x.short?' class="short"':''}><td><div class="rvcp"><i style="background:${x.p.sw}"></i><div><b>${esc(x.S.name)} · ${esc(x.p.colour)}</b><small>${x.p.code}${x.short?` · <u>${x.p.stock==null?'Out of stock':'Not enough stock'}</u>`:''}</small></div></div></td>
      <td class="r">${qty(x)}</td><td class="r m">${pm(x)}</td><td class="r m">${money(x.price)}<small>/ ${unitLbl(x.p.unit)}</small></td><td class="r a">${money(x.total)}</td></tr>`).join('')}
    </tbody><tfoot><tr><td colspan="4"><b>Subtotal ex GST</b>${DRAFT.method==='Delivery'?'<small>Delivery fee added by HTT</small>':''}</td><td class="r a">${money(sub)}</td></tr></tfoot></table></section>`;
  if(RV_STYLE==='a') return `<section class="rva">
    <div class="rvahd"><div><small>Review</small><h3>Your ${t}</h3></div><div class="rvast"><span><b>${L.length}</b>lines</span>${boxes?`<span><b>${boxes}</b>boxes</span><span><b>${m2.toFixed(2)}</b>m²</span>`:''}</div>${edit}</div>
    <div class="rvalist">${L.map(x=>`<div class="rvai${x.short?' short':''}"><i style="background:${x.p.sw}"></i>
      <div class="rvan"><b>${esc(x.S.name)} · ${esc(x.p.colour)}</b><small>${x.p.code}${x.b?` · ${x.amt.toFixed(2)} m²`:''} · ${money(x.price)} / ${unitLbl(x.p.unit)}${x.short?` · <u>${x.p.stock==null?'Out of stock':'Not enough stock'}</u>`:''}</small></div>
      <div class="rvaq">${qty(x)}</div><div class="rvaa">${money(x.total)}</div></div>`).join('')}</div>
    <div class="rvaft"><span>Subtotal ex GST${DRAFT.method==='Delivery'?'<small>Freight to be added by HTT</small>':''}</span><b>${money(sub)}</b></div>${meta}</section>`;
  return `<section class="rvb"><div class="rvbhd"><h3>Your ${t}</h3><span class="muted">${L.length} line${L.length!==1?'s':''}${boxes?` · ${boxes} boxes · ${m2.toFixed(2)} m²`:''}</span>${edit}</div>
    <div class="rvbgrid">${L.map(x=>`<div class="rvbc${x.short?' short':''}"><div class="rvbsw" style="background:${x.p.sw}"></div><div class="rvbtx"><b>${esc(x.S.name)}</b><span>${esc(x.p.colour)} · ${x.p.code}</span>${x.short?`<u>${x.p.stock==null?'Out of stock':'Not enough stock'}</u>`:''}</div>
      <div class="rvbnum"><span>${qty(x)}${x.b?` · ${x.amt.toFixed(2)} m²`:''}</span><b>${money(x.total)}</b></div></div>`).join('')}</div>
    <div class="rvbft"><span>Subtotal ex GST${DRAFT.method==='Delivery'?' · freight to be added by HTT':''}</span><b>${money(sub)}</b></div>${meta}</section>`; }
/* 账户状态（主系统 account-summary.status）：On hold / 超额时仍可下 Order，但订单会被 HTT 暂缓处理 */
function acctHold(){ if(DEMO_STATUS==='active') return null;
  const used = r2((typeof outstanding==='number'?outstanding:0) + openOrdersTotal()), limit = DEMO_STATUS==='over_limit'?25000:(MOCK_SUMMARY.credit||{}).limit||0;
  return DEMO_STATUS==='on_hold'
    ? {k:'on_hold', t:'Your account is on hold', d:'You can still place this order, but HTT will hold it — no picking or delivery — until your overdue invoices are paid.'}
    : {k:'over_limit', t:`Over your credit limit${used>limit?' by '+money(r2(used-limit)):''}`, d:'You can still place this order, but HTT will hold it until a payment brings you back under your limit or your account manager approves it.'}; }
function holdBox(t, small){ const h=acctHold(); if(!h) return '';
  return `<div class="holdbox ${t==='quote'?'q':''}"><b>${t==='quote'?'Account '+(h.k==='on_hold'?'on hold':'over limit')+' · quotes are fine':h.t}</b>${t==='quote'?`<span>If you turn this quote into an order, the order will be on hold until your account is cleared.</span>`:`<span>${h.d}</span><a href="#/invoices">View overdue invoices →</a>`}</div>`; }
/* 配套辅料推荐：地板产品上的 scotia / trims 代码和同色 stair nose，对应到辅料产品（主系统字段） */
function accFor(p){ return [['Scotia',PRODUCTS.find(x=>x.series==='scotia'&&x.code===p.scotia)],['Stair nose',PRODUCTS.find(x=>x.series==='stair-nose'&&x.colour===p.colour)],['Trims',PRODUCTS.find(x=>x.series==='trims'&&x.code===p.trims)]].filter(([,a])=>a); }
function accSuggest(){ const floors=CART.map(c=>byId(c.id)).filter(p=>p&&boxOf(p)&&accFor(p).length); if(!floors.length) return '';
  const groups=floors.map(p=>({p, S:SERIES.find(x=>x.id===p.series)||{}, acc:accFor(p)})).filter(g=>g.acc.some(([,a])=>!CART.some(c=>c.id===a.id)));
  if(!groups.length) return `<div class="accs done"><b>✓ Matching accessories added</b></div>`;
  return `<div class="accs"><div class="acchd"><b>Matching accessories</b><span>Picked to match the floors in this ${DRAFT.type}</span></div>
    ${groups.map(g=>`<div class="accg"><div class="accfor"><i style="background:${g.p.sw}"></i><span>For <b>${esc(g.S.name)} · ${esc(g.p.colour)}</b></span></div><div class="acccards">
      ${g.acc.map(([k,a])=>{ const inC=CART.some(c=>c.id===a.id), S=SERIES.find(x=>x.id===a.series)||{};
        return `<div class="accc ${inC?'in':''}"><i style="background:${a.sw}"></i><div class="accn"><small>${k}</small><b>${esc(a.colour)}</b><span>${money(unitPrice(a))} / ${unitLbl(a.unit)}${a.madeToOrder?' · made to order':a.stock==null?' · out of stock':''}</span></div>
          ${inC?'<em>✓ Added</em>':`<button onclick="cartAdd('${a.id}',1)">+ Add</button>`}</div>`; }).join('')}</div></div>`).join('')}</div>`; }
function shipStep(t, bill){
  const sh = DRAFT.ship, br = (MOCK_ACCOUNT_MANAGER||{}).branch||{name:'HTT Flooring Melbourne', hours:''}, del = DRAFT.method==='Delivery';
  const icStore = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M3 9h18"/><path d="M9 20v-6h6v6"/></svg>';
  const icTruck = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2z"/><path d="M13 9h4l3 3v4h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/></svg>';
  const opt = (m,ic,ttl,d) => `<label class="dopt ${DRAFT.method===m?'on':''}"><input type="radio" name="mth" ${DRAFT.method===m?'checked':''} onchange="dSet('method','${m}');dSet('editShip',false);render()"><span class="doic">${ic}</span><span class="dotx"><b>${ttl}</b><small>${d}</small></span><span class="dodot"></span></label>`;
  const shipForm = `<div class="shipform">
        <label class="w2">Street<input id="sh_line1" value="${esc(sh.line1)}"></label>
        <label>Suburb<input id="sh_suburb" value="${esc(sh.suburb)}"></label><label>State<select id="sh_state">${['VIC','NSW','QLD','SA','WA','TAS','ACT','NT'].map(x=>`<option ${sh.state===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Postcode<input id="sh_postcode" value="${esc(sh.postcode)}" maxlength="4"></label>
        <label>Contact on site<input id="sh_contact" value="${esc(sh.contact)}"></label><label>Phone<input id="sh_phone" value="${esc(sh.phone)}"></label>
        <label class="w2">Delivery notes<input id="sh_notes" value="${esc(sh.notes)}" placeholder="e.g. rear lane access, forklift on site"></label>
        <div class="w2" style="display:flex;gap:8px;justify-content:flex-end"><button class="btn-o sm" onclick="dSet('editShip',false);render()">Cancel</button><button class="btn sm" onclick="saveShip()">Save address</button></div></div>`;
  return `<section class="nfc dlv"><h3>Delivery</h3>
    <div class="dopts">${opt('Delivery',icTruck,'Deliver to me','HTT checks freight with the carrier and adds it to your '+t)}${opt('Pick up',icStore,'I\'ll pick up',`From ${br.name}`)}</div>
    <div class="adrs ${t==='order'?'three':''}">
      <div class="adr"><div class="adrh"><span>Bill to</span><em>🔒 From HTT's system</em></div>
        <b>${esc(CUSTOMER.name)}</b><p>${esc(bill.line1)}<br>${esc(bill.suburb)} ${esc(bill.state)} ${esc(bill.postcode)}</p><small>To change, contact your account manager</small></div>
      <div class="adr">${del
        ? `<div class="adrh"><span>Ship to</span>${DRAFT.editShip?'':`<button class="lnkbtn" onclick="dSet('editShip',true);render()">Edit</button>`}</div>
           ${DRAFT.editShip?'<p class="muted" style="margin:0">Editing below…</p>':`<b>${esc(sh.label||'Shipping address')}</b><p>${esc(sh.line1)}<br>${esc(sh.suburb)} ${esc(sh.state)} ${esc(sh.postcode)}</p>${sh.contact||sh.phone?`<small>${esc(sh.contact)}${sh.contact&&sh.phone?' · ':''}${esc(sh.phone)}</small>`:''}${sh.notes?`<small>${esc(sh.notes)}</small>`:''}`}`
        : `<div class="adrh"><span>Pick up from</span></div><b>${esc(br.name)}</b>${br.phone?`<p>${esc(br.phone)}</p>`:''}${br.hours?`<small>${esc(br.hours)}</small>`:''}<small>HTT lets you know when it's ready</small>`}</div>
      ${t==='order'?`<div class="adr adrdt"><div class="adrh"><span>${del?'Delivery date wanted':'Pick up date'}</span></div><input type="date" min="${earliestDate(DRAFT.method)}" value="${DRAFT.wanted}" onchange="dSet('wanted',dateIn(this,DRAFT.method))"><small>${dateHint(DRAFT.method)}${del?' HTT books the carrier and confirms the date.':' You can change it later.'}</small></div>`:''}
    </div>
    ${del&&DRAFT.editShip?shipForm:''}
  </section>
    ${reviewBox(t)}`;
}
function saveShip(){ const g=id=>document.getElementById(id).value.trim();
  if(!g('sh_line1')||!g('sh_suburb')||!/^\d{4}$/.test(g('sh_postcode'))){ toast('Please enter street, suburb and a 4-digit postcode'); return; }
  DRAFT.ship={label:'Shipping address', line1:g('sh_line1'), suburb:g('sh_suburb'), state:g('sh_state'), postcode:g('sh_postcode'), contact:g('sh_contact'), phone:g('sh_phone'), notes:g('sh_notes')};
  DRAFT.editShip=false; render(); }
function cartPage(){
  const t = DRAFT.type, L = CART.map(cartLine), today = SYSTEM_INFO.systemDate;
  const sub = r2(L.reduce((x,y)=>x+y.total,0)), full = r2(L.reduce((x,y)=>x+r2(y.amt*Math.max(y.p.std||0,y.price)),0)), disc = r2(full-sub), gstv = r2(sub*0.1);
  const shortN = L.filter(x=>x.short).length, m2 = r2(L.filter(x=>x.b).reduce((x,y)=>x+y.amt,0));
  const me = MOCK_USERS.users.find(u=>u.userId===MOCK_USERS.currentUserId)||{name:CUSTOMER.contact.name};
  const rep0 = (MOCK_ACCOUNT_MANAGER||{}).accountManager;   // 主系统里这个客户默认的业务员；没有就显示 -
  const stores = MOCK_SUMMARY.addresses.delivery, bill = MOCK_SUMMARY.addresses.billing;
  if(!DRAFT.ship){ const d=stores.find(a=>a.isDefault)||stores[0]; DRAFT.ship={label:d.label, line1:d.line1, suburb:d.suburb, state:d.state, postcode:d.postcode, contact:d.contact||'', phone:d.phone||'', notes:d.notes||''}; }
  if(!dateOk(DRAFT.wanted, DRAFT.method)) DRAFT.wanted = defDate(DRAFT.method);
  const step = L.length ? DRAFT.step : 1;
  const n = nextDocNum(), ed = DRAFT.editing||null, noTxt = ed || (t==='quote'?'QUO-':'ORD-')+n;
  const missing = [!L.length?'At least one product':'', t==='order'&&shortN?`${shortN} item${shortN>1?'s':''} short of stock (quote only)`:''].filter(Boolean);
  const opts = Object.keys(CAT_TREE).map(c=>`<optgroup label="${c}">${PRODUCTS.filter(p=>(SERIES.find(x=>x.id===p.series)||{}).cat===c).map(p=>{const S=SERIES.find(x=>x.id===p.series);return `<option value="${p.id}">${S.name} ${esc(p.colour)} · ${p.code}</option>`;}).join('')}</optgroup>`).join('');
  return `<div class="nf"><div class="wrap">
    ${ed?`<div class="edbar"><b>Editing quote ${ed}</b><span>Saving updates the same quote, restarts the ${QUOTE_LBL} validity and notifies HTT${(QUOTES.find(q=>q.no===ed)||{}).freight?' · the delivery fee will be re-quoted':''}.</span><button class="lnkbtn" onclick="if(confirm('Stop editing? Your changes will be lost.')){stopEdit()}">Stop editing</button></div>`
      :`<div class="nftabs">${[['quote','Quote',ICON.doc],['order','Order',ICON.truck]].map(([k,l,ic])=>`<button class="${t===k?'on':''}" onclick="dSet('type','${k}');render()">${ic}${l}</button>`).join('')}</div>`}
    <div class="nfsteps"><span class="${step===1?'on':'done'}"><i>${step===1?1:'✓'}</i>Details &amp; products</span><b></b><span class="${step===2?'on':''}"><i>2</i>Shipping &amp; review</span></div>
    ${step===2&&t==='order'?holdBox('order')+codBox():''}
    <div class="nfgrid ${step===1?'s1':'s2'}"><div class="nfmain">
    ${step===2 ? shipStep(t, bill) : `
      <section class="nfc a-d dhdr">
        <div><span>${t==='quote'?'Quote':'Order'} no.</span><b>${noTxt}${ed?'':' <i class="auto">Auto</i>'}</b><small>${ed?'Same number, updated on save':'Given on save'}</small></div>
        <div><span>Date</span><b>${fmtDay(today)}</b></div>
        ${t==='quote'?`<div><span>Valid until</span><b>${fmtDay(ISO(addDays(SYS,QUOTE_DAYS)))}</b><small>${QUOTE_LBL}</small></div>`:`<label class="dexp"><span>Expected date</span><input type="date" min="${earliestDate(DRAFT.method)}" value="${DRAFT.wanted}" onchange="dSet('wanted',dateIn(this,DRAFT.method));render()"><small>${(()=>{const e=estReady(); return (DRAFT.method==='Pick up'?'Pick up':'Delivery')+' · '+(e===null?'HTT confirms':e==='tbc'?'some items not in stock':'stock ready '+fmtDay(e).slice(0,6));})()}</small></label>`}
        <div><span>Salesperson</span><b>${rep0?esc(rep0.name):'-'} <i class="lock">🔒</i></b><small>From HTT's system</small></div>
        <div><span>Opened by</span><b>${esc(me.name)} <i class="lock">🔒</i></b><small>${STORE!=='all'?'📍 '+esc(stShort(STORE)):'Logged-in user'}</small></div>
        <label class="dpo"><span>PO / ref.</span><input value="${esc(DRAFT.ref)}" maxlength="60" placeholder="Your PO or job name (optional)" oninput="dSet('ref',this.value)"></label>
      </section>
      <section class="nfc a-p"><div class="nfh"><h3>Products ${PRICE_ON?'<span class="muted">Your trade prices, promotions and clearance prices apply automatically</span>':''}</h3>
          <div class="pp"><span class="ppic">+</span><input class="ppin" placeholder="Add product — search name, colour or code" autocomplete="off" onfocus="ppOpen(this)" oninput="PP.q=this.value;PP.i=0;PP.shut.clear();ppDraw()" onkeydown="ppKey(event)"><div class="ppdd"></div></div></div>
        <table class="nft nft2"><colgroup><col style="width:118px"><col style="width:150px"><col><col style="width:140px"><col style="width:64px"><col style="width:88px"><col style="width:132px"><col style="width:66px"><col style="width:112px"><col style="width:34px"></colgroup>
        <thead><tr><th>Product</th><th>Colour</th><th>Description</th><th>Qty</th><th class="r">Boxes</th><th class="r">Area</th><th class="r">Unit price ex GST</th><th class="r">Disc.</th><th class="r">Amount ex GST</th><th></th></tr></thead><tbody>
        ${L.length?L.map(x=>{ const sd = x.p.std||0, dp = sd>x.price ? Math.round((1-x.price/sd)*100) : 0;
          const tag = x.p.clr?'<span class="ptag clr">Clearance · final sale</span>':x.p.promo?`<span class="ptag pro">Promo · ends ${esc(promoEnd(x.p)).replace(/ \d{4}$/,'')}</span>`:'<span class="ptag trd">Trade price</span>';
          const warn = x.p.promo&&!x.p.clr&&t==='quote'&&daysTo(promoEnd(x.p))<QUOTE_DAYS ? '<div class="promowarn">Promo ends before this quote expires</div>' : '';
          const isM = x.b&&x.c.mode==='m2';
          const qIn = `<div class="qgrp"><input type="number" min="${isM?0:1}" step="${isM?'0.01':'1'}" value="${isM?(x.c.want||x.amt.toFixed(2)):x.c.qty}" onfocus="this.select()" onkeydown="if(event.key==='Enter')this.blur()" onchange="${isM?`cartSetM2('${x.p.id}',this.value)`:`cartSet('${x.p.id}',this.value)`}">${x.b?`<select onchange="cartMode('${x.p.id}',this.value)"><option value="box" ${isM?'':'selected'}>box</option><option value="m2" ${isM?'selected':''}>m²</option></select>`:`<span class="qsuf">${esc(unitLbl(x.p.unit))}</span>`}</div>`;
          return `<tr class="${x.short?'short':''}">
          <td><b class="pnm">${esc(x.S.name)}</b><span class="code">${x.p.code}</span>${x.short?`<span class="oosp">${x.p.stock==null?'Out of stock':'Not enough stock for this quantity'}${t==='order'?' · quote only':''}</span>`:''}</td>
          <td><span class="ccol"><i style="background:${x.p.sw}"></i>${esc(x.p.colour)}</span></td>
          <td class="cdesc" title="${esc(x.p.desc||'')}">${x.p.desc?`<span class="dtx">${esc(x.p.desc)}</span>`:`${esc(x.S.cat||'')}${x.S.type?' · '+esc(x.S.type):''}`}${x.S.size?`<small>${x.S.size}</small>`:''}</td>
          <td>${qIn}<div class="qconv">${x.b?`1 box = ${x.b} m²`:'&nbsp;'}</div></td>
          <td class="r num">${x.b?x.c.qty:'—'}</td>
          <td class="r num">${x.b?x.amt.toFixed(2)+' m²':'—'}</td>
          <td class="r"><div class="num">${money(x.price)}<small> / ${unitLbl(x.p.unit)}</small></div>${sd>x.price?`<div class="stdp">Std <s>${money(sd)}</s></div>`:''}${tag}${warn}</td>
          <td class="r">${dp?`<span class="dpc">${pct('−'+dp+'%')}</span>`:'<span class="muted">—</span>'}</td>
          <td class="r num"><b>${money(x.total)}</b></td>
          <td class="r"><button class="rmv" onclick="cartDel('${x.p.id}')" title="Remove">×</button></td></tr>`; }).join('')
          :`<tr><td colspan="10" class="muted" style="text-align:center;padding:26px">No products yet — pick one from “Add product”, or add from the Product pages.</td></tr>`}
        </tbody>${L.length?`<tfoot><tr><td colspan="4">${L.length} line${L.length!==1?'s':''}</td><td class="r num">${L.filter(x=>x.b).reduce((t,x)=>t+x.c.qty,0)}</td><td class="r num">${m2.toFixed(2)} m²</td><td></td><td></td><td class="r num"><b>${money(sub)}</b></td><td></td></tr></tfoot>`:''}</table>
        ${accSuggest()}
      </section>
      <!-- IT：Note to HTT 要接主系统（写进主系统单据备注，并通知对接业务员） -->
      <section class="nfc a-n"><h3>Note to HTT</h3>
        <textarea rows="4" maxlength="500" placeholder="e.g. Please confirm colour before delivery." oninput="dSet('note',this.value)">${esc(DRAFT.note)}</textarea>
        <small class="muted">Sent to HTT's system with your ${t}.</small>
      </section>`}
    </div>
    <aside class="nfside"><section class="nfc"><h3>Summary</h3>
${PRICE_ON?`      <div class="sm muted"><span>Standard price ex GST</span><span>${money(full)}</span></div>
      <div class="sm"><span>Your discount</span><span class="dpc">${disc?(PRICE_ON?'−':'')+money(disc):money(0)}</span></div>`:''}
      <div class="sm"><span>Subtotal ex GST</span><b>${money(sub)}</b></div>
      <div class="sm"><span>Delivery fee ex GST</span>${DRAFT.method==='Pick up'?'<b>'+money(0)+'</b>':'<span class="dfee">To be quoted</span>'}</div>
      <div class="sm"><span>GST</span><b>${money(gstv)}</b></div>
      <div class="smt"><span>Total inc GST</span><b>${money(r2(sub+gstv))}</b></div>
      <small class="muted" style="display:block;margin-top:8px">${DRAFT.method==='Pick up'?'Pick up · no delivery fee.':'Delivery fee not included yet — HTT checks the price with the carrier and adds it to your '+t+'.<span class="xfee">Extra carrier charges (e.g. waiting time on site, a failed or re-delivery) may be added after delivery — HTT will update your order and let you know.</span>'}</small>
    </section></aside></div>
  </div>
  <div class="nfbar"><div class="wrap">
    ${step===1&&ed?`<button class="btn-o" onclick="if(confirm('Stop editing? Your changes will be lost.')){stopEdit()}">Stop editing</button>`:step===1?`<button class="btn-o" onclick="if(confirm('Clear this ${t}?')){CART=[];DRAFT={...DRAFT,note:'',ref:'',step:1};go('#/${t==='quote'?'quotes':'orders'}')}">Cancel</button>`
      :`<button class="btn-o" onclick="dSet('step',1);render()">← Back</button>`}
    ${missing.length?`<span class="miss"><b>Missing:</b> ${missing.join(' · ')}</span>`
      :step===1?`<span class="muted" style="font-size:13px">Next: choose delivery or pick up</span>`
      :`<span class="ok">${DRAFT.method==='Delivery'?`HTT will check freight with the carrier and add it to your ${t}`:t==='order'?'HTT confirms the order before preparing it':`Valid for ${QUOTE_LBL}`}</span>`}
    ${DRAFT_SAVED&&L.length?`<span class="dsaved">Draft saved ${DRAFT_SAVED.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})} · <button class="lnkbtn" style="font-size:12px;color:#8a918d" onclick="draftDiscard()">Discard</button></span>`:''}
    ${step===1?`<button class="btn" style="margin-left:auto" ${missing.length?'disabled':''} onclick="dSet('step',2);render();window.scrollTo(0,0)">Next →</button>`
      :`<button class="btn" style="margin-left:auto" ${missing.length||(DRAFT.method==='Delivery'&&DRAFT.editShip)?'disabled':''} onclick="submitCart('${t}')">${ed?'Update quote':t==='quote'?'Save quote':'Place order'}</button>`}
  </div></div></div>`;
}
const nextDocNum = () => 1 + Math.max(...[...QUOTES,...ORDERS,...INVOICES].map(x=>+x.no.split('-')[1]));
/* 提交后的确认页。IT：提交成功后 ① 写入主系统 ② 邮件给客户（下单人 + Primary contact）③ 邮件给 HTT（对接业务员 + 门店邮箱） */
function submittedPage(no){ no=(no||'').toUpperCase(); const isQ=no.startsWith('QUO'), d=(isQ?QUOTES:ORDERS).find(x=>x.no===no);
  if(!d) return `<div class="wrap" style="padding:60px 0"><p>Not found. <a class="lnk" href="#/purchases">Back to Purchases</a></p></div>`;
  const am=(MOCK_ACCOUNT_MANAGER||{}).accountManager||{}, br=(MOCK_ACCOUNT_MANAGER||{}).branch||{}, me=CUSTOMER.contact||{}, c=calc(d), del=d.method==='Delivery';
  const steps = isQ ? [['HTT reviews your quote', am.name?`${esc(am.name)} checks prices and stock`:'Your account manager checks prices and stock'],
                       del?['Delivery fee added','HTT checks freight with the carrier and adds it to the quote — you\'ll get an email. Any extra carrier charges (e.g. waiting time) are added later and you\'ll be told.']:['Pick up','No delivery fee — collect from '+esc(br.name||'HTT')],
                       ['Accept online',`Open the quote and press Accept before ${esc(d.valid)} to turn it into an order`]]
                    : [[d.hold?'On hold until your account is cleared':'HTT confirms your order', d.hold?'HTT starts as soon as your account is back in good standing':'Usually the same business day — stock and prices are checked'],
                       del?['Delivery fee added','HTT checks freight with the carrier, adds it to the order and books the delivery. Extra carrier charges (e.g. waiting time on site, a failed or re-delivery) may be added after delivery — HTT will update your order and let you know.']:['We get it ready','You\'ll be told when it\'s ready to pick up'],
                       [del?'Delivered':'Picked up','The invoice is issued when the order is completed']];
  return `<div class="subm"><div class="wrap" style="max-width:760px">
    <div class="subhd"><div class="subok ${d.hold?'hold':''}">${d.hold?'!':'✓'}</div><small>${isQ?(d.edits?'Quote updated':'Quote saved'):'Order sent'}</small><h1>${no}</h1>
      <span class="badge ${isQ?'b-open':orderBadge(d)}">${isQ?'Open · valid until '+esc(d.valid):orderLabel(d)}</span>
      <p>${isQ?'Your quote is in HTT\'s system.':d.hold?'Your order is in HTT\'s system and on hold because of your account status.':'Your order is in HTT\'s system and waiting for HTT to confirm.'}</p></div>
    <div class="subgrid">
      <section class="nfc"><h3>What happens next</h3><ol class="subst">${steps.map(([a,b],i)=>`<li><i>${i+1}</i><div><b>${a}</b><span>${b}</span></div></li>`).join('')}</ol></section>
      <section class="nfc"><h3>Summary</h3>
        <div class="sm"><span>Lines</span><b>${d.lines.length}</b></div>
        <div class="sm"><span>Subtotal ex GST</span><b>${money(c.subtotal)}</b></div>
        <div class="sm"><span>Delivery fee</span>${del?'<span class="dfee">To be quoted</span>':'<b>'+money(0)+'</b>'}</div>
        <div class="sm"><span>Total inc GST</span><b>${money(c.total)}</b></div>
        <div class="sm"><span>${del?'Ship to':'Pick up'}</span><span style="text-align:right">${del&&d.shipTo?esc(d.shipTo.suburb+' '+d.shipTo.state):esc(br.name||'HTT')}</span></div>
        ${d.ref&&!/^Online /.test(d.ref)?`<div class="sm"><span>PO / ref.</span><b>${esc(d.ref)}</b></div>`:''}</section>
    </div>
    <section class="nfc subsent"><h3>Sent to</h3>
      <div><i>✉</i><span><b>You</b>Confirmation emailed to ${esc(me.email||'you')}</span></div>
      <div><i>✉</i><span><b>HTT</b>${esc(am.name||'Your account manager')}${am.email?' · '+esc(am.email):''}${br.email?' and '+esc(br.email):''}</span></div>
      <div><i>⇄</i><span><b>HTT's system</b>Recorded as ${no}</span></div></section>
    <div class="subbtn"><a class="btn" href="#/${isQ?'quotes':'orders'}/${no.toLowerCase()}">View ${isQ?'quote':'order'}</a><a class="btn-o" href="#/purchases">Back to Purchases</a><a class="lnk" href="#/cart" onclick="DRAFT.type='${isQ?'quote':'order'}'">Start another ${isQ?'quote':'order'}</a></div>
  </div></div>`; }
/* 草稿自动保存。原型存在浏览器；正式版 IT 存后端（PUT /api/portal/me/draft），换电脑也能接着做 */
let DRAFT_SAVED=null;
function draftSave(){ try{ const act = hasContent() ? (()=>{ if(!DRAFT.id) DRAFT.id='D'+Date.now(); if(!DRAFT.store) DRAFT.store=newDocStore(); DRAFT_SAVED=new Date(); return {cart:CART, draft:DRAFT, at:Date.now()}; })() : (DRAFT_SAVED=null, null);
  localStorage.setItem('htt.reference.drafts.v1', JSON.stringify({active:act, parked:DRAFTS})); }catch(e){} }
function draftLoad(){ try{ const o=JSON.parse(localStorage.getItem('htt.reference.drafts.v1')||'null'), cut=Date.now()-DRAFT_DAYS*864e5; if(!o) return;
  DRAFTS=(o.parked||[]).filter(d=>d.at>cut);
  if(o.active && o.active.at>cut){ CART=o.active.cart.filter(c=>byId(c.id)); DRAFT={...blankDraft(o.active.draft.type), ...o.active.draft}; DRAFT_SAVED=new Date(o.active.at); } }catch(e){} }
function draftClear(){ DRAFT={...DRAFT, id:null, editing:null, store:null}; DRAFT_SAVED=null; }
function draftDiscard(){ if(DRAFT.id && hasContent()) discardDraft(DRAFT.id); }
function submitCart(kind){
  if(!PRICE_ON){ toast('Show prices first (top right) to check the amounts'); return; }
  const L=CART.map(cartLine);
  if(!L.length){ toast('Add at least one product'); return; }
  if(kind==='order' && !dateOk(DRAFT.wanted, DRAFT.method)){ toast('Please choose a business day from '+fmtDay(earliestDate(DRAFT.method))); return; }
  if(kind==='order' && L.some(x=>x.short)){ toast('Some items are short of stock — save as a quote instead'); return; }
  const lines = L.map(x=>({d:`${x.S.name} ${x.p.colour}`, box:x.b, qty:x.c.qty, price:x.price, unit:x.b?null:'lengths', productId:x.p.id}));
  const n = nextDocNum(), today = fmtDay(SYSTEM_INFO.systemDate), D = DRAFT;
  const base = {store:newDocStore(), issued:today, ref:D.ref||'Online '+kind, lines, freight:0, online:true, method:D.method, shipTo:D.method==='Delivery'?{...D.ship}:null, note:D.note||null, rep:((MOCK_ACCOUNT_MANAGER||{}).accountManager||{}).employeeId||null, openedBy:MOCK_USERS.currentUserId, freightPending:D.method==='Delivery'};
  if(kind==='quote' && D.editing){ const q=QUOTES.find(x=>x.no===D.editing);
    Object.assign(q, {...base, no:q.no, issued:q.issued, updated:today, valid:fmtDay(ISO(addDays(SYS,QUOTE_DAYS))), status:'Open', freight:0, edits:(q.edits||0)+1});
    CART=[]; DRAFT=blankDraft('quote'); draftClear(); go('#/submitted/'+q.no.toLowerCase()); return; }
  if(kind==='quote'){ const no='QUO-'+n; QUOTES.unshift({...base, no, valid:fmtDay(ISO(addDays(SYS,QUOTE_DAYS))), status:'Open'});
    CART=[]; DRAFT=blankDraft(kind); draftClear(); go('#/submitted/'+no.toLowerCase()); }
  else { const no='ORD-'+n; ORDERS.unshift({...base, no, readyBy:null, wanted:D.wanted, expected:D.method==='Pick up'?fmtDay(D.wanted):null, status:'Pending', hold:(acctHold()||{}).k||null});
    CART=[]; DRAFT=blankDraft(kind); draftClear(); go('#/submitted/'+no.toLowerCase()); }
}
/* 快速下单：直接输入代码 / 名称 + 数量 */
function quickOrder(){
  const opts = PRODUCTS.map(p=>{ const S=SERIES.find(x=>x.id===p.series); return `<option value="${esc(p.code)} — ${S.name} ${esc(p.colour)}">`; }).join('');
  const row = () => `<tr class="qorow"><td><input class="qoin" list="qolist" placeholder="Type a code or name, e.g. M-2 or Bonita Natural" oninput="qoMatch(this)"></td><td class="qoinfo muted sm2">—</td><td><span class="pqs"><button type="button" onclick="qoStep(this,-1)">−</button><input class="qoq" type="number" min="1" value="1" oninput="qoMatch(this.closest('tr').querySelector('.qoin'))" onfocus="this.select()"><button type="button" onclick="qoStep(this,1)">+</button></span></td><td class="qou muted sm2"></td><td><button class="txtbtn" style="color:#b23a2c" onclick="this.closest('tr').remove()">×</button></td></tr>`;
  window._qoRow = row;
  return `<div class="page-head"><div class="wrap"><h1>Quick order</h1><p>Know your codes? Type them in with quantities, then add them to a new quote or order in one go.</p></div></div>
  <div class="wrap" style="padding-top:22px;padding-bottom:50px">
    <datalist id="qolist">${opts}</datalist>
    <table class="stable qotbl"><thead><tr><th style="width:38%">Product (code or name)</th><th>Matched</th><th style="width:150px">Quantity</th><th style="width:130px"></th><th style="width:40px"></th></tr></thead>
      <tbody id="qobody">${[1,2,3,4,5].map(row).join('')}</tbody></table>
    <div style="display:flex;gap:10px;margin-top:12px;align-items:center"><button class="btn-o sm" onclick="document.getElementById('qobody').insertAdjacentHTML('beforeend',_qoRow())">+ Add row</button>
      <span class="muted sm2">Flooring is ordered in full boxes; accessories by the length.</span>
      <button class="btn" style="margin-left:auto" onclick="qoToCart()">Add to quote / order</button></div>
  </div>`;
}
function qoFind(v){ v=(v||'').trim().toLowerCase(); if(!v) return null; const code=v.split(' — ')[0];
  return PRODUCTS.find(p=>p.code.toLowerCase()===code) || PRODUCTS.find(p=>{ const S=SERIES.find(x=>x.id===p.series); return (S.name+' '+p.colour).toLowerCase()===v || (p.code+' — '+S.name+' '+p.colour).toLowerCase()===v; })
    || (v.length>=3 ? PRODUCTS.find(p=>{ const S=SERIES.find(x=>x.id===p.series); return (S.name+' '+p.colour).toLowerCase().includes(v); }) : null); }
function qoMatch(inp){ const tr=inp.closest('tr'), p=qoFind(inp.value), info=tr.querySelector('.qoinfo'), u=tr.querySelector('.qou'), q=+tr.querySelector('.qoq').value||1;
  tr.dataset.id = p?p.id:''; if(!p){ info.innerHTML = inp.value?'<span class="oos">No match</span>':'—'; u.textContent=''; return; }
  const S=SERIES.find(x=>x.id===p.series), b=boxOf(p), amt=b?b*q:q, short=!p.madeToOrder&&(p.stock==null||amt>p.stock);
  info.innerHTML = `<span class="cpr"><i style="background:${p.sw}"></i><b style="color:#1f2a24">${S.name} ${esc(p.colour)}</b></span> · ${money(unitPrice(p))} / ${unitLbl(p.unit)} · ${short?'<span class="oos">quote only — short of stock</span>':'<span class="stk">in stock</span>'}`;
  u.textContent = `${qtyUnit(p,q)}${b?` = ${amt.toFixed(2)} m²`:''}`; }
function qoStep(btn,d){ const i=btn.parentNode.querySelector('input'); i.value=Math.max(1,(+i.value||1)+d); qoMatch(btn.closest('tr').querySelector('.qoin')); }
function qoToCart(){ let n=0; document.querySelectorAll('#qobody tr').forEach(tr=>{ if(tr.dataset.id){ const q=+tr.querySelector('.qoq').value||1, ex=CART.find(c=>c.id===tr.dataset.id); if(ex) ex.qty+=q; else CART.push({id:tr.dataset.id, qty:q}); n++; } });
  if(!n){ toast('Type at least one product code'); return; } toast(`${n} item${n>1?'s':''} added to cart`); go('#/cart'); }
/* 清仓价（主系统字段 clr）：卖完为止，不能退货。有清仓价时以清仓价为准 */
[['aquaglow-silver',39],['aquaglow-natural-oak',40],['quercus-espresso',79],['guardian-smoked-oak',42]].forEach(([id,v])=>{ const p=PRODUCTS.find(x=>x.id===id); if(p) p.clr=v; });
const clrOff = p => offTxt(p);
/* 配套辅料的代码 → 对应产品（Scotia / Trims 按代码；Stair Nose 按颜色定制） */
function accLink(series, code, colour){
  const p = series==='stair-nose' ? PRODUCTS.find(x=>x.series==='stair-nose'&&x.colour===colour) : PRODUCTS.find(x=>x.series===series&&x.code===code);
  return p ? '#/products/'+p.id : '#/series/'+series;
}
// 首页三个专题入口包含的产品（原站只看过 Promotion；New / Clearance 内容为占位）
const COLLECTIONS = {
  new:{title:'New Product', sub:'Discover the latest additions', img:'ph1', items:[]},   // 由主系统「New」标记决定，见下方
  promotion:{title:'Promotion', sub:'Explore current special offers', img:'ph2', items:[]},   // 有促销价、且没有清仓价的产品（见下方）
  clearance:{title:'Clearance', sub:'Shop the remaining stock', img:'ph5', items:['aquaglow-silver','aquaglow-natural-oak','quercus-espresso','guardian-smoked-oak']},
};

COLLECTIONS.promotion.items = PRODUCTS.filter(p=>p.promo && !p.clr).map(p=>p.id);
COLLECTIONS.clearance.items = COLLECTIONS.clearance.items.filter(id=>{ const p=PRODUCTS.find(x=>x.id===id); return p && p.clr && p.stock>0; });   // 卖完的自动拿掉
COLLECTIONS.new.items = PRODUCTS.filter(p=>p.isNew).sort((a,b)=>b.addedOn.localeCompare(a.addedOn)).map(p=>p.id);
// 单据明细行
const L = {
  bon40:{d:'Bonita Natural Oak', box:2.166, qty:40, price:69},
  bon20:{d:'Bonita Natural Oak', box:2.166, qty:20, price:69},
  gua20:{d:'Guardian Natural Grey', box:null, unit:'m²', qty:20, price:47.5},
  gua10:{d:'Guardian Natural Grey', box:null, unit:'m²', qty:10, price:47.5},
  gua12:{d:'Guardian Natural Grey', box:null, unit:'m²', qty:12, price:47.5},
};
const QUOTES = [
  {no:'QUO-10605', issued:'17 Nov 2026', valid:'19 Nov 2026', ref:'Townhouse upstairs', status:'Open', lines:[L.gua12], freight:50},
  {no:'QUO-10601', issued:'18 Nov 2026', valid:'20 Nov 2026', ref:'Living room flooring', status:'Open', lines:[L.bon40], freight:50},
  {no:'QUO-10540', issued:'01 Oct 2026', valid:'03 Oct 2026', ref:'Kitchen & hallway', orderNo:'ORD-10540', status:'Accepted', lines:[L.bon40,L.gua20], freight:50},
  {no:'QUO-10570', issued:'01 Sep 2026', valid:'03 Sep 2026', ref:'Bedroom flooring', status:'Expired', lines:[L.gua10], freight:0},
];
const ORDERS = [
  // status: Preparing（备货中）/ Ready（可提货 / 可送货）/ Completed / Cancelled；method: Delivery / Pick up
  // readyBy = Expected date（HTT 预计备好货的日期，延误按它算）
  // expected = Pick up date（客户可改）或 Delivery date（HTT 订好物流后才有，booked=true，客户不能改）
  {no:'ORD-10560', issued:'09 Nov 2026', readyBy:'16 Nov 2026', expected:null, ref:'Living room flooring', status:'Preparing', method:'Delivery', lines:[L.bon20], freight:50},
  {no:'ORD-10551', issued:'05 Nov 2026', readyBy:'12 Nov 2026', expected:'14 Nov 2026', ref:'Warehouse collection', status:'Ready', method:'Pick up', lines:[L.gua12], freight:0},
  {no:'ORD-10540', issued:'02 Oct 2026', readyBy:'05 Oct 2026', expected:'06 Oct 2026', booked:true, ref:'Kitchen & hallway', quoteNo:'QUO-10540', invoiceNo:'INV-10540', status:'Completed', method:'Delivery', lines:[L.bon40,L.gua20], freight:50},
];
const INVOICES = [
  {no:'INV-10540', orderNo:'ORD-10540', issued:'02 Oct 2026', due:'16 Oct 2026', lines:[L.bon40,L.gua20], freight:50, paid:0},
  {no:'INV-10482', issued:'28 Sep 2026', due:'12 Oct 2026', lines:[L.bon40,L.gua20], freight:0, paid:0},
  {no:'INV-10398', issued:'01 Sep 2026', due:'15 Sep 2026', lines:[L.bon40,L.gua20], freight:0, paid:1661.00},
  {no:'INV-10381', issued:'20 Aug 2026', due:'03 Sep 2026', lines:[L.bon40,L.gua20], freight:0, paid:4120.00},
  {no:'INV-10355', issued:'18 Jul 2026', due:'01 Aug 2026', lines:[L.bon20], freight:50, paid:3342.99, paidOn:'30 Jul 2026'},
];
const CREDITS = [
  {no:'CN-1002', slug:'cn-ret-1002', issued:'02 Nov 2026', inv:'INV-10540', reason:'Unused stock returned', items:[{d:'Bonita Natural Oak',q:'4 boxes'},{d:'Bonita Oak Stair Nosing',q:'2 pcs'}], amt:328.80, applyTo:null, status:'Issued'},
  {no:'CN-1001', slug:'cn-ret-1001', issued:'02 Nov 2026', inv:'INV-10482', reason:'Damaged in transit', items:[{d:'Heritage Rustic Oak',q:'1 box'}], amt:52.25, applyTo:null, status:'Issued'},
  {no:'CN-F3F20370', slug:'cn-f3f20370-7a44-4ba3-bc17-521df979b92e', issued:'02 Nov 2026', inv:'INV-10540', reason:'Unused stock returned', items:[{d:'Bonita Natural Oak',q:'1 box'}], amt:52.25, applyTo:'INV-10540', status:'Applied'},
];
const REBATES = [
  {no:'REB-2026-1038', prod:'Bonita series', sku:'All colours', seriesId:'bonita', min:350, rate:1.00, cycle:'Monthly', period:'01 Oct 2026 – 31 Oct 2026', qty:486.72, settled:'05 Nov 2026'},
  {no:'REB-2026-0931', prod:'Heritage series', sku:'All colours', seriesId:'heritage', min:500, rate:1.20, cycle:'Quarterly', period:'01 July 2026 – 30 Sept 2026', qty:782.46, settled:'12 Oct 2026'},
  {no:'REB-2026-0924', prod:'Bonita series', sku:'All colours', seriesId:'bonita', min:350, rate:1.00, cycle:'Monthly', period:'01 Sept 2026 – 30 Sept 2026', qty:394.21, settled:'06 Oct 2026'},
  {no:'REB-2026-0817', prod:'Bonita series', sku:'All colours', seriesId:'bonita', min:350, rate:0.90, cycle:'Monthly', period:'01 Aug 2026 – 31 Aug 2026', qty:562.08, settled:'07 Sept 2026'},
  {no:'REB-2026-0612', prod:'Heritage series', sku:'All colours', seriesId:'heritage', min:500, rate:1.20, cycle:'Quarterly', period:'01 Apr 2026 – 30 June 2026', qty:648.35, settled:'10 July 2026'},
  {no:'REB-2026-0609', prod:'Bonita series', sku:'All colours', seriesId:'bonita', min:300, rate:0.90, cycle:'Monthly', period:'01 June 2026 – 30 June 2026', qty:428.87, settled:'06 July 2026'},
];
const SALES = {'bonita-natural-oak':{d30:{cur:[0,0],prev:[168.95,78],range:'20 Oct 2026 – 18 Nov 2026',vs:'vs 20 Sept 2026 – 19 Oct 2026'},
                                   d90:{cur:[655.40,303],prev:[892.10,412],range:'21 Aug 2026 – 18 Nov 2026',vs:'vs 23 May 2026 – 20 Aug 2026'}}};

/* ===================== 计算工具 ===================== */
const r2 = n => Math.round(n*100)/100;
/* 隐藏价格（门店屏幕用）：默认隐藏所有金额，员工手动打开；2 分半没操作自动隐藏。只影响这台电脑的显示，跟用户权限无关 */
let PRICE_ON = false, PZ_LEFT = 0, PZ_T = null; const PZ_SECS = 150, LOCK = '🔒';
const money = n => !PRICE_ON ? LOCK : (n<0?'−':'')+'$'+Math.abs(n).toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});
const pct = t => PRICE_ON ? t : LOCK;
function pzPaint(){ document.body.classList.toggle('pzoff',!PRICE_ON); const b=document.getElementById('pzbtn'), bar=document.getElementById('pzbar'); if(!b) return;
  const mm=Math.floor(PZ_LEFT/60), ss=String(PZ_LEFT%60).padStart(2,'0');
  b.className='pzbtn '+(PRICE_ON?'on':'')+(can('prices')?'':' noacc');
  b.title = PRICE_ON ? 'Prices are showing — click to hide' : 'Prices hidden — staff: click to show';
  if(!can('prices')){ b.innerHTML=`<span class="pzi">🔒</span><span><b>No price access</b></span>`; b.title='Your login does not include prices'; bar.style.display='none'; return; }
  b.innerHTML = PRICE_ON ? `<span class="pzi">👁</span><span><b>Prices on</b><small>Hides in ${mm}:${ss}</small></span>` : `<span class="pzi">🔒</span><span><b>Prices hidden</b><small>Tap to show</small></span>`;
  bar.innerHTML = PRICE_ON ? `<div class="wrap"><span>👁 Prices are showing on this screen — they hide automatically after ${Math.round(PZ_SECS/60*10)/10} minutes without activity.</span><b>${mm}:${ss}</b><button onclick="pzToggle()">Hide now</button></div>` : '';
  bar.style.display = PRICE_ON ? 'block' : 'none'; }
/* 打印 / 存 PDF：即使屏幕上价格是隐藏的，打印出来也显示真实金额，打印完恢复隐藏 */
async function printDoc(){ const was=PRICE_ON; if(!was){ PRICE_ON=true; await render(); }
  window.print(); if(!was){ PRICE_ON=false; render(); } }
function pzToggle(){ if(!can('prices')){ toast('Your login doesn\'t include prices — ask your admin'); return; } PRICE_ON=!PRICE_ON; PZ_LEFT=PZ_SECS; clearInterval(PZ_T);
  if(PRICE_ON) PZ_T=setInterval(()=>{ PZ_LEFT--; if(PZ_LEFT<=0){ PRICE_ON=false; clearInterval(PZ_T); render(); toast('Prices hidden'); } else pzPaint(); },1000);
  render(); }
['mousemove','keydown','click','scroll','touchstart'].forEach(ev=>window.addEventListener(ev,()=>{ if(PRICE_ON) PZ_LEFT=PZ_SECS; },{passive:true}));
const lineAmt = l => r2((l.box? l.box*l.qty : l.qty) * l.price);
function calc(doc){
  const subtotal = r2(doc.lines.reduce((s,l)=>s+lineAmt(l),0));
  const gst = r2((subtotal+doc.freight)*0.1);
  return {subtotal, gst, total:r2(subtotal+doc.freight+gst)};
}
const parseD = s => new Date(s.replace('Sept','Sep'));
const daysOver = d => Math.floor((TODAY - parseD(d))/86400000);
let outstanding, overdueList, overdueAmt, unapplied, unappliedAmt;
function recalcInvoices(){
  INVOICES.forEach(i=>{
    i.amount = calc(i).total;
    i.credits = CREDITS.filter(c=>c.applyTo===i.no);
    i.balance = r2(i.amount - i.paid - i.credits.reduce((s,c)=>s+c.amt,0));
    i.overdue = daysOver(i.due);
  });
  outstanding = r2(INVOICES.reduce((s,i)=>s+i.balance,0));
  overdueList = INVOICES.filter(i=>i.overdue>0 && i.balance>0);
  overdueAmt = r2(overdueList.reduce((s,i)=>s+i.balance,0));
  unapplied = CREDITS.filter(c=>!c.applyTo);
  unappliedAmt = r2(unapplied.reduce((s,c)=>s+c.amt,0));
}
recalcInvoices();
/* 多门店：Admin（或被授权「All stores view」的账号）可以看全部门店合计，也可以切换到某一家门店看它自己的资料。
   IT：每张 Quote / Order / Invoice / Credit Note 需带 storeId（主系统的门店 / 地址 ID）；接口加 ?store=ADR-02，后端按门店筛选。
   信用额度、Deal（返利）按整个账号算，不分门店。 */
let STORE = 'all';
const STORE_K = {'ADR-01':0.68, 'ADR-02':0.32};   // 原型：Insights 按门店的示例比例（正式版由主系统按门店统计）
const DOC_STORE = {'QUO-10605':'ADR-02','QUO-10601':'ADR-01','QUO-10540':'ADR-01','QUO-10570':'ADR-02','ORD-10560':'ADR-01','ORD-10551':'ADR-02','ORD-10540':'ADR-01',
  'INV-10540':'ADR-01','INV-10482':'ADR-02','INV-10398':'ADR-01','INV-10381':'ADR-02','INV-10355':'ADR-01'};
[QUOTES,ORDERS,INVOICES,CREDITS].forEach(A=>A.forEach((d,i)=>{ d.store = d.store || DOC_STORE[d.no] || DOC_STORE[d.inv] || 'ADR-01'; d._ix=i; }));
const _HID = new Map();
function applyStore(){ [QUOTES,ORDERS,INVOICES,CREDITS].forEach(A=>{ A.forEach((d,i)=>{ if(d._ix==null) d._ix=-1e6+i; d.store=d.store||'ADR-01'; });
    A.push(...(_HID.get(A)||[])); A.sort((a,b)=>a._ix-b._ix); const h=[];
    if(STORE!=='all') for(let i=A.length-1;i>=0;i--) if(A[i].store!==STORE) h.unshift(A.splice(i,1)[0]);
    _HID.set(A,h); });
  recalcInvoices(); }
function storeUsed(){ return r2(INVOICES.reduce((t,i)=>t+(i.balance||0),0) + ORDERS.filter(o=>o.status!=='Completed'&&o.status!=='Cancelled').reduce((t,o)=>t+calc(o).total,0)); }
function setStore(v){ STORE=v; applyStore(); const sg=location.hash.split('?')[0].split('/'); if(sg.length>2 && ['quotes','orders','invoices'].includes(sg[1])){ location.hash='#/'+sg[1]; return; } render(); }
const newDocStore = () => STORE!=='all' ? STORE : ((STORES().find(s=>s.type==='main')||{}).addressId||'ADR-01');
/* 每个员工账号由 Admin 绑定门店：'all' = 可以看全部门店并切换；某个门店 ID = 只能看那家店（没有切换下拉） */
const curUser = () => (MOCK_USERS.users||[]).find(u=>u.userId===MOCK_USERS.currentUserId);
/* 按登录账号的权限显示（后端同样要检查）。Manage users = 全部权限 */
const can = k => { const me=curUser(); return !me || !!me.permissions.users || !!me.permissions[k]; };
const ROUTE_PERM = {inventory:'stock', series:'stock', products:'stock', collections:'stock', boards:'boards', quotes:'quotes', orders:'orders', invoices:'invoices', rebates:'rebates', sales:['orders','invoices'], cart:'place', submitted:'place', drafts:'place'};
const routeOk = r => { const k=ROUTE_PERM[r]; return !k || (Array.isArray(k)?k.some(can):can(k)); };
const noAccess = () => `<div class="wrap" style="padding:70px 0"><h1 class="serif" style="font-weight:500">You don't have access to this page</h1><p class="muted">Ask the person who manages your company's HTT logins to turn it on for you.</p><a class="btn" href="#/dashboard" style="display:inline-block;margin-top:10px">Back to Dashboard</a></div>`;
const userStores = u => !u || (u.permissions&&u.permissions.users) || !u.stores || u.stores==='all' ? 'all' : u.stores;
function canAllStores(){ return userStores(curUser())==='all'; }
const allowedStores = () => { const s=userStores(curUser()); return s==='all' ? STORES().map(a=>a.addressId) : s; };
const stLabel = id => (STORES().find(a=>a.addressId===id)||{}).label||id;
/* 下拉里用短名称：去掉各门店共同的前缀（ABC Flooring Richmond → Richmond） */
function stShort(id){ const L=STORES().map(a=>a.label); let p=L[0]||''; L.forEach(x=>{ while(p && !x.startsWith(p)) p=p.slice(0,-1); }); p=p.replace(/\S*$/,''); const full=stLabel(id); return L.length>1&&p.trim()?full.slice(p.length)||full:full; }
function userStoreLbl(u){ const st=userStores(u); return st==='all'?'All stores':st.map(stLabel).join(' · '); }
/* 绑定多家门店的员工：登录时先选「今天在哪家门店上班」 */
const TODAY_STORE = (()=>{ try{ return JSON.parse(sessionStorage.getItem('htt.reference.today-store.v1')||'{}'); }catch(e){ return {}; } })();   // 本次登录记住选的门店（IT：存在登录 session）
const saveToday = () => { try{ sessionStorage.setItem('htt.reference.today-store.v1', JSON.stringify(TODAY_STORE)); }catch(e){} };
function pickTodayStore(){ const me=curUser(), L=allowedStores(), m=document.getElementById('modal');
  m.innerHTML=`<div class="mbox" style="max-width:460px"><h3 class="serif" style="font-weight:500;font-size:26px;margin:0 0 4px">Hi ${esc(me.name.split(' ')[0])}, where are you working today?</h3>
    <p class="muted" style="margin:0 0 16px;font-size:13px">You'll see this store's quotes, orders and invoices, and new quotes and orders are recorded under it. You can change store at the top any time.</p>
    <div class="todayst">${L.map(id=>{ const a=STORES().find(x=>x.addressId===id)||{}; return `<button onclick="TODAY_STORE['${me.userId}']='${id}';saveToday();closeModal();setStore('${id}')"><b>📍 ${esc(a.label||id)}</b><small>${esc([a.line1,a.suburb].filter(Boolean).join(', '))}</small></button>`; }).join('')}</div></div>`;
  m.style.display='flex'; }
function storeSwitch(){ const all=canAllStores(), L=allowedStores(); if(L.length<2) return L.length===1&&!all?`<span class="stsw one"><span>📍</span><b>${esc(stLabel(L[0]))}</b></span>`:'';
  return `<label class="stsw" title="Switch store"><span>📍</span><select onchange="${all?'':`TODAY_STORE['${(curUser()||{}).userId}']=this.value;saveToday();`}setStore(this.value)">${all?`<option value="all" ${STORE==='all'?'selected':''}>All stores</option>`:''}${L.map(id=>`<option value="${id}" ${STORE===id?'selected':''} title="${esc(stLabel(id))}">${esc(stShort(id))}</option>`).join('')}</select></label>`; }
function storeBar(){ if(STORE==='all') return ''; const a=STORES().find(x=>x.addressId===STORE)||{};
  return `<div class="stbar"><div class="wrap"><b>📍 Viewing ${esc(a.label||STORE)}</b><span>Quotes, orders, invoices, insights and display boards for this store only · credit limit and deals are for the whole account</span></div></div>`; }
const byId = id => PRODUCTS.find(p=>p.id===id);
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ===================== 页面 ===================== */
const NAV = [['dashboard','Home'],['inventory','Product'],['boards','Display Boards'],['purchases','Purchases'],['sales','Insights'],['rebates','Deal'],['account','My Account']];
const ICON = {
  box:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4.5L8 1.5l6 3v7l-6 3-6-3z"/><path d="M2 4.5l6 3 6-3M8 7.5v7"/></svg>',
  doc:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 1.5h7l3 3v10H3z"/><path d="M5.5 7h5M5.5 9.5h5M5.5 12h3"/></svg>',
  truck:'<svg width="18" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 3h10v8H1zM11 6h4l2 3v2h-6"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="13.5" cy="12.5" r="1.5"/></svg>',
  wallet:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><path d="M10.5 8h4"/></svg>',
  pin:'<svg width="14" height="16" fill="none" stroke="#2e7d4f" stroke-width="1.5"><path d="M7 15s5-5 5-9A5 5 0 002 6c0 4 5 9 5 9z"/><circle cx="7" cy="6" r="1.8"/></svg>',
  back:'<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 6H1M5 2L1 6l4 4"/></svg>',
  arrow:'<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 8l6-6M3 2h5v5"/></svg>',
  search:'<svg width="14" height="14" fill="none" stroke="#555" stroke-width="1.5"><circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5L13 13"/></svg>',
  dl:'<svg width="14" height="14" fill="none" stroke="#fff" stroke-width="1.5"><path d="M7 1v8M3.5 6L7 9.5 10.5 6M1.5 12.5h11"/></svg>',
  alert:'<svg width="14" height="14" fill="none" stroke="#b4473c" stroke-width="1.5"><circle cx="7" cy="7" r="6"/><path d="M7 4v3.5M7 9.8v.2"/></svg>',
};

function dashActivity(R){
  const qs = QUOTES.filter(x=>inRange(x.issued,R)), os = ORDERS.filter(x=>inRange(x.issued,R));
  const sumT = l => money(r2(l.reduce((t,x)=>t+calc(x).total,0)));
  const S = buildSales(R), amt = r2(S.reduce((t,x)=>t+x.amount,0)), m2 = r2(S.filter(x=>x.unit==='m²').reduce((t,x)=>t+x.qty,0));
  const q = (()=>{ const p=new URLSearchParams(); if(R.key!=='m0'){ p.set('p',R.key); if(R.key==='custom'){p.set('from',ISO(R.from));p.set('to',ISO(R.to));} } return p.toString()?'?'+p:''; })();
  const card = (href,k,v,sub,cls) => `<a class="act ${cls||''}" href="${href}"><span>${k}</span><b>${v}</b><small>${sub}</small></a>`;
  const rp = REBATE_PROGRAMS.map(p=>({p, ...rebateInfo(p)})).filter(x=>x.next).sort((a,b)=>a.toGo-b.toGo)[0];
  dateBar(R,false);
  return `<div class="actwrap"><div class="acthead"><h2>Activity</h2><span class="muted" style="font-size:12.5px">${R.label} · ${dpShort(R.from,R.to)} — change the date at the top right</span></div>
    <div class="actgrid">
      ${card('#/quotes'+q,'Quotes issued',qs.length,sumT(qs))}
      ${card('#/orders'+q,'Orders placed',os.length,sumT(os))}
      ${card('#/sales'+q,'Purchases (incl. GST)',money(amt),`${fmtQty(m2,'m²')} flooring · view insights ›`)}
    </div></div>`;
}
/* 待办：需要客户处理的事情（主系统数据自动生成） */
function dashTodo(){
  const T=[];
  /* 只提示三类：逾期发票、可提货、返利。越简单越好 */
  ORDERS.filter(o=>o.method==='Pick up' && o.status==='Ready').forEach(o=>{ const late=notCollected(o);
    T.push({lvl:late?'warn':'good', ico:ICON.truck, t:`<b>${o.no}</b> is ready for pick up`, s:late?`Pick up date was ${o.expected} · ${late} day${late>1?'s':''} ago`:`Pick up date ${o.expected}`, href:'#/orders/'+o.no.toLowerCase(), cta:'View order'}); });
  if(overdueList.length){ const old=[...overdueList].sort((a,b)=>b.overdue-a.overdue)[0];
    T.push({lvl:'bad', ico:ICON.wallet, t:`<b>${overdueList.length} invoice${overdueList.length>1?'s':''} overdue</b> · ${money(overdueAmt)}`, s:`Oldest ${old.no} · ${old.overdue} days overdue`, href:'#/invoices', cta:'View invoices'}); }
  REBATE_PROGRAMS.forEach(p=>{ const I=rebateInfo(p); if(I.next && (I.near || I.daysLeft<=14))
    T.push({lvl:I.near?'warn':'good', ico:ICON.box, t:`<b>${esc(p.product)}</b> rebate: ${I.near?'almost there — ':''}${I.toGo} m² to ${I.next.min} m²`, s:`Then ${money(I.nextRate)}/m² above ${I.next.min} m² · ${I.daysLeft} days left · ~${I.perDay} m²/day`, href:'#/rebates', cta:'View rebate'}); });
  const order={bad:0,warn:1,good:2,info:3}; T.sort((a,b)=>order[a.lvl]-order[b.lvl]);
  return `<div class="dcard todo"><div class="dch"><h2>Needs your attention</h2><span class="cnt">${T.length}</span></div>
    ${T.length?T.map(x=>`<a class="todo-i l-${x.lvl}" href="${x.href}"><i class="ti">${x.ico}</i><div><div>${x.t}</div><small>${x.s}</small></div><span class="tcta">${x.cta} ›</span></a>`).join('')
      :'<div class="muted" style="padding:20px 0">Nothing needs your attention right now.</div>'}</div>`;
}
function dashUpcoming(){
  const U = ORDERS.filter(o=>o.status==='Preparing'||o.status==='Ready').map(o=>{
    const d = o.method==='Pick up' ? o.expected : (o.booked ? o.expected : null);
    return {o, date:d||o.readyBy, label: o.method==='Pick up' ? 'Pick up' : (o.booked?'Delivery booked':'Ready by'), sub: o.method==='Delivery'&&!o.booked ? 'HTT will book delivery' : ''}; })
    .sort((a,b)=>parseD(a.date)-parseD(b.date));
  return `<div class="dcard"><div class="dch"><h2>Deliveries &amp; pick ups</h2><a class="lnk sm2" href="#/orders">All orders ›</a></div>
    ${U.length?U.map(x=>{ const [dd,mm]=x.date.split(' '); return `<a class="up-i" href="#/orders/${x.o.no.toLowerCase()}"><div class="cal"><small>${mm}</small><b>${+dd}</b></div>
      <div><b>${x.o.no}</b> · ${x.label}<small>${esc(x.o.lines[0].d)}${x.sub?' · '+x.sub:''}</small></div></a>`; }).join('')
      :'<div class="muted" style="padding:14px 0">No deliveries or pick ups coming up.</div>'}</div>`;
}
function dashManager(){
  const m = MOCK_ACCOUNT_MANAGER.accountManager, br = MOCK_ACCOUNT_MANAGER.branch; if(!m) return '';
  const ini = m.name.split(' ').map(w=>w[0]).join('');
  return `<div class="dcard am"><div class="amrow"><span class="av">${ini}</span><div><small>Your account manager</small><b>${esc(m.name)}</b></div></div>
    <div class="amlinks2"><a href="tel:${m.mobile.replace(/\s/g,'')}">📞 ${m.mobile}</a><a href="mailto:${m.email}">✉ Email</a></div></div>`;
}
function dashBoards(){
  const need = BOARDS.filter(b=>boardFlags(b).some(f=>f[0]!=='muted')).length, upd = BOARD_REQS.filter(r=>r.unseen).length, open = BOARD_REQS.filter(r=>r.status!=='Completed').length;
  return `<a class="dcard dbx" href="#/boards"><div class="dch"><h2>Display boards</h2><span class="lnk sm2">View ›</span></div>
    <div class="dbrow"><div><b>${panelCount(BOARDS)}</b><small>colour panels</small></div><div><b>${swatchCount(BOARDS)}</b><small>swatch sets</small></div><div><b>${STAND_HIST.reduce((t,h)=>t+h.qty,0)}</b><small>stands</small></div></div>
    ${need||upd||open?`<div class="dbnote">${[need?`⚠ ${need} worth updating`:'', open?`◷ ${open} request${open>1?'s':''} in progress${upd?' · updated':''}`:''].filter(Boolean).join(' · ')}</div>`:''}</a>`;
}
async function dashboard(params){
  const R = pageRange(params||new URLSearchParams());
  let sm = null; try { sm = await portalApi.getAccountSummary(); } catch(e){}
  const banner = sm && sm.status!=='active' ? `<div class="statusbar" style="background:${sm.status==='on_hold'?'var(--red-bg)':'var(--amber-bg)'};color:${sm.status==='on_hold'?'#8a2f27':'#7a4a12'}">
      ${ICON.alert}<div><b>Account ${STATUS_INFO[sm.status].label.toLowerCase()}.</b> ${esc(sm.statusReason)} <a class="lnk" href="#/account">Account details</a></div></div>` : '';
  const unpaid = INVOICES.filter(i=>i.balance>0), old = [...overdueList].sort((a,b)=>b.overdue-a.overdue)[0];
  const limit = (sm&&sm.credit&&sm.credit.limit)||30000, used = (sm&&sm.credit&&sm.credit.used!=null)?sm.credit.used:outstanding, pct = Math.min(100, used/limit*100);
  const hr = new Date().getHours(), greet = hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  const first = (MOCK_USERS.users.find(u=>u.userId===MOCK_USERS.currentUserId)||{name:CUSTOMER.contact.name}).name.split(' ')[0];
  const pdl = Math.max(0, daysTo(PROMO.to)); const collMeta = {new:'Latest additions', promotion: pdl<=14?`Ends in ${pdl} day${pdl!==1?'s':''}`:`Ends ${PROMO.to}`, clearance:'While stock lasts'};
  return `<div class="dash"><div class="wrap">
    ${banner}
    <div class="dhead"><div><h1>${greet}, ${esc(first)}</h1>
      <div class="dsub">${esc(CUSTOMER.name)} <span>·</span> ${ICON.pin} Stock location <b>${CUSTOMER.location}</b></div></div></div>
    <form class="dsearch top" onsubmit="event.preventDefault();go('#/inventory?q='+encodeURIComponent(this.q.value))">
      <input name="q" placeholder="Search product, colour, SKU or keyword..." aria-label="Search inventory">
      <button class="btn">Search stock</button>
    </form>
    <div class="dmoney">
      <a class="mcard ${overdueList.length?'bad':''}" href="#/invoices"><span>Balance due</span><b>${money(outstanding)}</b>
        <small>${overdueList.length?(overdueList.length===unpaid.length?`all ${unpaid.length} invoices overdue`:`${overdueList.length} of ${unpaid.length} invoices overdue · ${money(overdueAmt)}`)+` · oldest <u>${old.no}</u> ${old.overdue} days`:`${unpaid.length} invoices · nothing overdue`}</small></a>
      ${isCOD()?`<a class="mcard" href="#/orders"><span>Payment terms</span><b>COD</b><small>Payment before goods are released${(()=>{const n=ORDERS.filter(o=>PAY_ST.includes(orderStage(o))).length;return n?` · <u>${n} order${n>1?'s':''} waiting for payment</u>`:'';})()}</small></a>`:`<a class="mcard" href="#/account"><span>Credit limit</span><b>${money(used)} <em>of ${money(limit)}</em></b>
        <i class="lim ${pct>=90?'hi':pct>=75?'mid':''}"><i style="width:${pct}%"></i></i><small>${pct.toFixed(0)}% used · ${money(r2(Math.max(0,limit-used)))} available · incl. open orders</small>${STORE!=='all'?`<small class="stuse">📍 ${esc((STORES().find(a=>a.addressId===STORE)||{}).label||'')} uses ${money(storeUsed())} of the account limit</small>`:''}</a>`}
      <a class="mcard good" href="#/invoices?tab=credits"><span>Credit notes available</span><b>${money(unappliedAmt)}</b><small>${unapplied.length} credit note${unapplied.length!==1?'s':''} · HTT applies them to your invoices</small></a>
    </div>
    <div class="dgrid">${dashTodo()}<div class="dside">${dashManager()}${dashBoards()}</div></div>
    ${dashActivity(R)}
    <div class="colls">${Object.entries(COLLECTIONS).map(([k,c])=>`
      <a class="coll ph ${c.img}" href="#/collections/${k}"><em class="ctag">${c.items.length} product${c.items.length!==1?'s':''} · ${collMeta[k]||''}</em><h3>${c.title}</h3><p>${c.sub}</p><span>View products &nbsp;${ICON.arrow}</span></a>`).join('')}
    </div>
    <div class="browse2"><h2>Browse products</h2><div class="bcats">${Object.keys(CAT_TREE).map(c=>`<div class="bcat2"><a class="bc" href="#/inventory?cat=${encodeURIComponent(c)}">${c} <span>→</span></a><div>${CAT_TREE[c].map(t=>`<a href="#/inventory?cat=${encodeURIComponent(c)}&type=${encodeURIComponent(t)}">${t}</a>`).join('')}</div></div>`).join('')}</div></div></div>
  </div></div>`;
}

function inventory(params){
  const cat = params.get('cat')||'All', typ = cat!=='All' ? (params.get('type')||'All') : 'All', q=(params.get('q')||'').toLowerCase(), sort=params.get('sort')||'rel';
  const instock = params.get('stock')==='1', promo = params.get('promo')==='1';
  const items = sid => PRODUCTS.filter(p=>p.series===sid);
  const minPrice = s => Math.min(...items(s.id).map(p=>p.promo||p.yours), 9999);
  const stockOf = s => r2(items(s.id).reduce((t,p)=>t+(p.stock||0),0));
  const inStockN = s => items(s.id).filter(p=>p.stock!=null).length;
  const hasPromo = s => items(s.id).some(p=>p.promo);
  const base = SERIES.filter(s=>!q || (s.name+' '+s.cat+' '+(s.type||'')+' '+items(s.id).map(p=>p.colour+' '+p.code+' '+(p.sku||'')).join(' ')).toLowerCase().includes(q))
    .filter(s=>(!instock||inStockN(s)) && (!promo||hasPromo(s)));
  let list = base.filter(s=>(cat==='All'||s.cat===cat) && (typ==='All'||s.type===typ));
  if(sort==='asc') list=[...list].sort((a,b)=>minPrice(a)-minPrice(b));
  if(sort==='desc') list=[...list].sort((a,b)=>minPrice(b)-minPrice(a));
  if(sort==='stock') list=[...list].sort((a,b)=>stockOf(b)-stockOf(a));
  const set = (k,v)=>{const p=new URLSearchParams(params);v?p.set(k,v):p.delete(k);if(k==='cat')p.delete('type');return '#/inventory?'+p};
  const set2 = (c,t)=>{const p=new URLSearchParams(params);p.set('cat',c);t&&t!=='All'?p.set('type',t):p.delete('type');return '#/inventory?'+p};
  const segCat = `<div class="seg">${['All',...Object.keys(CAT_TREE)].map(c=>`<a class="${c===cat?'on':''}" href="${set('cat',c==='All'?'':c)}">${c}<span>${c==='All'?base.length:base.filter(x=>x.cat===c).length}</span></a>`).join('')}</div>`;
  const segType = cat==='All' ? '' : `<div class="subseg"><span class="muted">${cat} ›</span>${['All',...CAT_TREE[cat]].map(t=>{const n=base.filter(x=>x.cat===cat&&(t==='All'||x.type===t)).length; return `<a class="${t===typ?'on':''} ${n?'':'zero'}" href="${set2(cat,t)}">${t}<span>${n}</span></a>`;}).join('')}</div>`;
  const toggle = (k,on,l) => `<a class="tgl ${on?'on':''}" href="${set(k,on?'':'1')}"><i></i>${l}</a>`;
  const card = s => { const its=items(s.id), mp=minPrice(s), st=stockOf(s), n=inStockN(s);
    const sw = its.filter(p=>p.sw&&p.sw.startsWith('#')).slice(0,7);
    return `<a class="scard2" href="#/series/${s.id}">
      <div class="ph ${s.img}">${hasPromo(s)?'<span class="promo-tag">Promotion</span>':''}</div>
      <div class="b"><div class="c">${s.cat}${s.type&&s.type!==s.name?' · '+s.type:''}</div><h3>${s.name}</h3>
        <div class="csize">${s.size||''}${s.box&&s.box!=='per length'?` <span>· ${s.box.split(' · ')[0]}</span>`:''}</div>
        ${sw.length?`<div class="swrow">${sw.map(p=>`<i style="background:${p.sw}" title="${esc(p.colour)}"></i>`).join('')}${its.length>sw.length?`<em>+${s.colours-sw.length}</em>`:''}</div>`:'<div class="swrow"></div>'}
        ${(()=>{ const B={high:0,med:0,low:0,mto:0,out:0}; its.forEach(p=>B[stockBand(p).k]++);
          const seg=['high','med','low','mto','out'].flatMap(k=>Array(B[k]).fill(k));
          const lbl=[B.high&&B.high+' High',B.med&&B.med+' Medium',B.low&&B.low+' Low',B.mto&&B.mto+' Made to order'].filter(Boolean).join(' · ');
          const up=Math.max(0,...its.filter(p=>p.promo||p.clr).map(p=>(saveStd(p)||{pct:0}).pct));
          const inc=its.filter(p=>p.incoming&&p.incoming.length), next=inc.length?inc.flatMap(p=>p.incoming).map(x=>x.eta).sort()[0]:null;
          return `<div class="meta2">
            ${PRICE_ON?`<div class="mpr"><span>From</span><b>${mp<9999?money(mp):'—'}<small> / ${unitLbl(its[0].unit)} ex GST</small></b>${up?`<em>Save up to ${up}%</em>`:''}</div>`:''}
            <div class="mst"><div class="msth"><span>Stock in ${CUSTOMER.location}</span><b class="${n?'ok':'na'}">${n?`${n} of ${its.length} colour${its.length>1?'s':''}`:its.some(p=>p.madeToOrder)?'Made to order':'Out of stock'}</b></div>
              <div class="sbar">${seg.map(k=>`<i class="${k}"></i>`).join('')}</div><small>${lbl||'No colours in stock'}</small>${inc.length?`<div class="incf">⛴ ${inc.length} colour${inc.length>1?'s':''} incoming · next ${fmtDay(next).slice(0,6)}</div>`:''}</div></div>
          <div class="f"><span>${s.colours} colour${s.colours>1?'s':''}</span><span>View colours ${ICON.arrow}</span></div></div></a>`; })()}`; };
  return `<div class="inv-head"><div class="wrap">
      <h1>Products</h1><p class="muted" style="margin:0">Check current stock${PRICE_ON?' and your trade prices':''} in ${CUSTOMER.location}.</p>
      <form class="searchbar" onsubmit="event.preventDefault();go('${set('q','').replace(/'/g,"\\'")}'+'&q='+encodeURIComponent(this.q.value))">${ICON.search}<input name="q" value="${esc(params.get('q')||'')}" placeholder="Search series, colour, SKU or keyword...">${q?`<a class="sclear" href="${set('q','')}">Clear</a>`:''}<button class="btn sm" style="margin-right:6px">Search</button></form>
    </div></div>
    <div class="wrap">
      <div class="sfilter" style="margin-top:22px">${segCat}
        <div class="r2">${PRICE_ON?toggle('promo',promo,'On promotion'):''}
          <select class="sel" onchange="go(this.value)">${[['rel','Sort: Relevance'],['stock','Sort: Most stock'],['asc','Sort: Price low to high'],['desc','Sort: Price high to low']].map(([v,t])=>`<option value="${set('sort',v==='rel'?'':v)}" ${sort===v?'selected':''}>${t}</option>`).join('')}</select></div></div>
      ${segType}
      <div class="rescount">${list.length} series${q?` for “${esc(params.get('q'))}”`:''}</div>
      ${list.length?`<div class="series2">${list.map(card).join('')}</div>`:`<div class="empty2"><b>No series found</b><span>Try another keyword or clear the filters.</span><a class="btn-o sm" href="#/inventory">Clear all</a></div>`}
      <div class="note">ⓘ Product prices exclude GST (quotes, orders and invoices show amounts incl. GST). Stock is live from HTT's system for ${CUSTOMER.location}.</div>
    </div>`;
}

const unitLbl = u => u==='length'?'length':u;
const stockTxt = p => stockTxt0(p) + incTxt(p);
const stockTxt0 = p => bandTag(p);
/* 一共省多少：都跟 Standard（正常价）比 */
const saveStd = p => { const pr=unitPrice(p), sd=p.std||0; return sd>pr ? {amt:r2(sd-pr), pct:Math.round((1-pr/sd)*100)} : null; };
const offTxt = p => { const v=saveStd(p); return v ? pct(v.pct+'% OFF') : ''; };
const saveLine = p => { const v=saveStd(p); return v&&PRICE_ON ? `<span class="psv" title="Compared with the standard price">Save ${money(v.amt)} · ${v.pct}%</span>` : ''; };
function priceCell(p){
  const u = `<span class="muted" style="font-size:10px">/ ${unitLbl(p.unit)} ex GST</span>`;
  if(p.clr) return `<span class="yp clr">${money(p.clr)}</span> <span class="plbl clr">clearance</span><br><span class="strike">${money(p.yours)}</span> <span class="plbl">your trade price</span><br>${saveLine(p)}`;
  if(p.promo) return `<span class="yp promo">${money(p.promo)}</span> <span class="plbl promo">promo</span><br><span class="strike">${money(p.yours)}</span> <span class="plbl">your trade price</span><br>${saveLine(p)}`;
  return `<span class="yp">${money(p.yours)}</span> ${u}<br>${saveLine(p)}`;
}
function colourTable(items, tableId, forceAcc){
  const acc = forceAcc ?? items.some(p=>p.scotia||p.trims||p.nose);
  const P = PRICE_ON, W = acc ? (P?['18%','7%','14%','9%','12%','12%','7%','8%','7%','6%']:['22%','9%','18%','16%','10%','10%','9%','6%']) : (P?['22%','9%','18%','12%','15%','16%','8%']:['32%','12%','24%','22%','10%']);
  return `<div class="ctable-wrap"><table class="ctable" id="${tableId}"><colgroup>${W.map(w=>`<col style="width:${w}">`).join('')}</colgroup><thead><tr>
    <th>Colour</th><th>Code</th><th>Size / Per Box</th>${P?'<th>Standard Price</th><th>Trade Price</th>':''}<th>Available Stock</th>${acc?'<th>Scotia</th><th>Stair Nose</th><th>Trims</th>':''}<th></th></tr></thead><tbody>
    ${items.map(p=>{ const S=SERIES.find(x=>x.id===p.series)||{}; const stop='onclick="event.stopPropagation()"'; return `<tr class="click ${!P?'':p.clr?'clr':p.promo?'promo':''}" data-s="${esc((p.colour+' '+p.code).toLowerCase())}" onclick="go('#/products/${p.id}')">
      <td><a class="cname" href="#/products/${p.id}" ${stop}><span class="sw2" style="background:${p.sw&&p.sw.startsWith('#')?p.sw:'#bbb'}"></span><span>${esc(p.colour)}${p.clr?`<em class="clrtag">CLEARANCE · ${clrOff(p)} · final sale</em>`:''}${!p.clr&&p.promo?`<em class="promotag" title="Promotion until ${promoEnd(p)}">PROMO · ${offTxt(p)}${p.promoTo&&p.promoTo!==PROMO.to?` · to ${p.promoTo.slice(0,6)}`:''}</em>`:''}${p.isNew?`<em class="newtag">NEW · Added ${fmtDay(p.addedOn)}</em>`:''}</span></a></td>
      <td><span class="code">${p.code}</span></td>
      <td>${S.size||'-'}<br><span class="muted" style="font-size:10px">${S.box||''}</span></td>
      ${P?`<td>${money(p.std)}<br><span class="muted" style="font-size:10px">/ ${unitLbl(p.unit)} ex GST</span></td>
      <td>${priceCell(p)}</td>`:''}
      <td>${stockTxt(p)}</td>
      ${acc?`<td>${p.scotia?`<a class="lnk" href="${accLink('scotia',p.scotia)}" ${stop}>${p.scotia}</a>`:'-'}</td>
      <td>${p.nose?`<a class="lnk" href="${accLink('stair-nose',null,p.colour)}" ${stop}>${p.nose}</a>`:'-'}</td>
      <td>${p.trims?`<a class="lnk" href="${accLink('trims',p.trims)}" ${stop}>${p.trims}</a>`:'-'}</td>`:''}<td><button class="addbtn" title="Add 1 ${boxOf(p)?'box':unitLbl(p.unit)}" onclick="event.stopPropagation();addFromCatalog('${p.id}',1)">+ Add</button></td></tr>`}).join('')}
    </tbody></table></div>`;
}
const promoBanner = items => { const pr=items.filter(p=>p.promo); if(!pr.length||!PRICE_ON) return ''; const end=pr.map(promoEnd).sort((a,b)=>parseD(a)-parseD(b))[0];
  return `<div class="pbanner"><b>Promotion</b> <span class="pbt">${pr.length} of ${items.length} colours on promotion</span> <span>· ends ${end} · ${Math.max(0,daysTo(end))} days left · marked <em class="promotag" style="display:inline">PROMO</em></span>
    <label class="pbonly"><input type="checkbox" onchange="document.querySelectorAll('.ctable tbody tr').forEach(tr=>tr.style.display=this.checked&&!tr.classList.contains('promo')?'none':'')"> Show promotion only</label></div>`; };
function filterRows(id,v){v=v.toLowerCase();document.querySelectorAll('#'+id+' tbody tr').forEach(tr=>tr.style.display=tr.dataset.s.includes(v)?'':'none')}

function series(id){
  const s = SERIES.find(x=>x.id===id); if(!s) return notFound();
  const items = PRODUCTS.filter(p=>p.series===id);
  const brand = s.id==='bonita' ? '<b>B</b>onita' : s.name;
  return `<div class="wrap">
    <a class="back" href="#/inventory?cat=${encodeURIComponent(s.cat)}">${ICON.back} Back to ${s.cat}</a>
    <div class="series-top"><div>
      <div class="eyebrow">${s.cat} · ${s.type} · Product Series</div>
      <div class="brand">${brand}</div>
      <div class="sub">${s.desc||s.cat}</div>
      <div class="muted" style="font-size:11px">${s.spec||''}</div></div>
      <div class="locbox">Stock location<b>${CUSTOMER.location}</b>${s.colours} colours in this series</div>
    </div>
    ${promoBanner(items)}
    <div class="tbl-head"><h2>Available Colours <span class="cnt">${items.length}</span></h2>
      <div class="mini-search">${ICON.search}<input placeholder="Search colour or code..." oninput="filterRows('ct',this.value)"></div></div>
    ${items.length?colourTable(items,'ct'):'<p class="muted">No colours available yet.</p>'}
    <p class="muted" style="font-size:12px;margin:18px 0 50px">Prices exclude GST. Quotes, orders and invoices show amounts incl. GST.</p>
  </div>`;
}

/* 门店视图下打开别家门店的单据（例如从链接、邮件进来）：有权限就自动切到那家店，没权限显示提示 */
function docLookup(A, pred){ let d=A.find(pred); if(d) return d; const h=(_HID.get(A)||[]).find(pred); if(!h) return null;
  if(allowedStores().includes(h.store)){ if(!canAllStores()){ TODAY_STORE[(curUser()||{}).userId]=h.store; saveToday(); } STORE = h.store; applyStore(); setTimeout(()=>{ toast('Switched to '+stLabel(STORE)+' to show this document'); { const e=document.getElementById('stsw'); if(e) e.innerHTML=storeSwitch(); } },50); return A.find(pred); }
  return {__deny:h.store}; }
function denyPage(st){ return `<div class="wrap" style="padding:60px 0"><h1 class="serif" style="font-weight:500">Not available for your store</h1><p class="muted">This document belongs to ${esc(stLabel(st))}. Ask your admin if you need access to that store.</p></div>`; }
function collection(id){
  if(id==='new') return newProducts();
  if(id==='promotion') return promoProducts();
  if(id==='clearance') return clearanceProducts();
  const c = COLLECTIONS[id]; if(!c) return notFound();
  const items = c.items.map(byId).filter(Boolean);
  let groups = SERIES.filter(s=>items.some(p=>p.series===s.id));
  if(id==='new'){ const newest=g=>items.filter(p=>p.series===g.id).map(p=>p.addedOn).sort().pop(); groups=groups.sort((a,b)=>newest(b).localeCompare(newest(a))); }   // 新品：最新上架的系列排前面
  return `<div class="wrap">
    <a class="back" href="#/dashboard">${ICON.back} Back to home</a>
    <div class="series-top"><div>
      <div class="eyebrow">Product Collection</div>
      <h1 class="serif" style="font-weight:500;font-size:44px;margin:8px 0 6px">${c.title}</h1>
      <div class="sub">${c.sub}</div></div>
      <div class="locbox">Stock location<b>${CUSTOMER.location}</b>${items.length} colours · ${groups.length} series</div>
    </div>
    ${id==='promotion'?promoBanner(items):''}
    <div class="tbl-head"><div class="seriesnav">${groups.map(g=>`<a href="javascript:void 0" onclick="document.getElementById('g-${g.id}').scrollIntoView({behavior:'smooth'})">${g.name} <span>${items.filter(p=>p.series===g.id).length}</span></a>`).join('')}</div>
      <div class="mini-search">${ICON.search}<input placeholder="Search colour or code..." oninput="document.querySelectorAll('.ctable').forEach(t=>filterRows(t.id,this.value))"></div></div>
    ${groups.map(g=>{ const its=items.filter(p=>p.series===g.id); return `<div class="cgroup" id="g-${g.id}">
      <div class="cghead"><div><a href="#/series/${g.id}">${g.name}</a><span>${g.cat} · ${g.type} · ${esc(g.desc||'')}</span></div><a class="lnk sm2" href="#/series/${g.id}">All ${g.colours} colours ›</a></div>
      ${colourTable(its,'ct-'+g.id, items.some(p=>p.scotia||p.trims||p.nose)).replace(/#\/products\/([a-z0-9-]+)/g,'#/products/$1?from='+id)}</div>`; }).join('')}
    <p class="muted" style="font-size:12px;margin:18px 0 50px">Prices exclude GST. Quotes, orders and invoices show amounts incl. GST.</p>
  </div>`;
}

/* New Product：展示型页面（卡片），内容由主系统「New」标记决定 */
function newProducts(){
  const items = COLLECTIONS.new.items.map(byId).filter(Boolean);
  const newest = g => items.filter(p=>p.series===g.id).map(p=>p.addedOn).sort().pop();
  const groups = SERIES.filter(s=>items.some(p=>p.series===s.id)).sort((a,b)=>newest(b).localeCompare(newest(a)));
  const latest = items.map(p=>p.addedOn).sort().pop();
  const daysAgo = d => Math.round((dIso(SYSTEM_INFO.systemDate)-dIso(d))/864e5);
  const card = p => { const S=SERIES.find(x=>x.id===p.series);
    const stock = bandTag(p) + incTxt(p);
    return `<a class="ncard" href="#/products/${p.id}?from=new">
      <div class="nsw" style="background:linear-gradient(135deg,${p.sw} 0%,${p.sw}dd 45%,${p.sw} 70%,${p.sw}bb 100%)">
        <span class="nbadge">NEW</span>${p.promo?`<span class="npromo">${offTxt(p)}</span>`:''}
        <span class="nadded">${daysAgo(p.addedOn)<=14?'Just added · ':''}${fmtDay(p.addedOn)}</span></div>
      <div class="nb"><div class="nser">${S.name} · ${S.type}</div><h3>${esc(p.colour)}</h3>
        <div class="ncode"><span class="code">${p.code}</span> ${S.size}</div>
        <div class="nprice"><b>${money(p.promo||p.yours)}</b><span>/ ${unitLbl(p.unit)} ex GST</span>${p.promo?`<s>${money(p.yours)}</s>`:''}</div>
        ${stock}</div></a>`; };
  return `<div class="nhero"><div class="wrap">
      <a class="back" href="#/dashboard">${ICON.back} Back to home</a>
      <div class="eyebrow">Product Collection</div>
      <h1>New Product</h1>
      <p>The latest additions to the HTT range — ${items.length} new colours across ${groups.length} series. Latest added ${fmtDay(latest)}.</p>
      <div class="seriesnav">${groups.map(g=>`<a href="javascript:void 0" onclick="const d=document.getElementById('g-${g.id}');d.open=true;d.scrollIntoView({behavior:'smooth'})">${g.name} <span>${items.filter(p=>p.series===g.id).length}</span></a>`).join('')}</div>
    </div></div>
    <div class="wrap">
      <div class="ngtools"><a href="javascript:void 0" onclick="document.querySelectorAll('details.ngroup').forEach(d=>d.open=true)">Expand all</a> · <a href="javascript:void 0" onclick="document.querySelectorAll('details.ngroup').forEach(d=>d.open=false)">Collapse all</a></div>
      ${groups.map((g,gi)=>{ const its=items.filter(p=>p.series===g.id); return `<details class="ngroup" id="g-${g.id}" ${gi===0?'open':''}>
        <summary class="nghead"><span class="ngchev">›</span><div class="ngt"><div class="ngcat">${g.cat} · ${g.type}</div><div class="ngrow"><h2>${g.name}</h2><span class="ngn">${its.length} new colour${its.length>1?'s':''}</span></div><p>${esc(g.desc||'')} · ${esc(g.spec||'')}</p></div>
          <div class="ngsw">${its.map(p=>`<i style="background:${p.sw}" title="${esc(p.colour)}"></i>`).join('')}</div>
          <a class="btn-o sm" href="#/series/${g.id}" onclick="event.stopPropagation()">View all ${g.colours} colours</a></summary>
        <div class="ngrid">${its.map(card).join('')}</div></details>`; }).join('')}
      <p class="muted" style="font-size:12px;margin:8px 0 50px">Prices exclude GST. Quotes, orders and invoices show amounts incl. GST. Click a colour for full details and stock.</p>
    </div>`;
}
/* Promotion：卡片版。三个价格：Standard（标准价）→ Trade price（客户的拿货价）→ Promo（活动价，比拿货价更低） */
function promoProducts(){
  const items = COLLECTIONS.promotion.items.map(byId).filter(Boolean);
  const rank = p => p.stock!=null ? 0 : p.eta ? 1 : 2;     // 有货排前，其次有到货日期，最后缺货
  const groups = SERIES.filter(s=>items.some(p=>p.series===s.id));
  const ends = [...new Set(items.map(promoEnd))].sort((a,b)=>parseD(a)-parseD(b));
  const soonest = ends[0], dl = Math.max(0, daysTo(soonest));
  const card = p => { const S=SERIES.find(x=>x.id===p.series), d=Math.max(0,daysTo(promoEnd(p)));
    const stock = bandTag(p) + incTxt(p);
    const acc = [p.scotia?`Scotia <a class="lnk" href="${accLink('scotia',p.scotia)}" onclick="event.stopPropagation()">${p.scotia}</a>`:'', p.nose?`Stair Nose <a class="lnk" href="${accLink('stair-nose',null,p.colour)}" onclick="event.stopPropagation()">${p.nose}</a>`:'', p.trims?`Trims <a class="lnk" href="${accLink('trims',p.trims)}" onclick="event.stopPropagation()">${p.trims}</a>`:''].filter(Boolean);
    return `<div class="ncard pcard ${rank(p)?'dim':''}" onclick="go('#/products/${p.id}?from=promotion')">
      <div class="nsw" style="background:linear-gradient(135deg,${p.sw} 0%,${p.sw}dd 45%,${p.sw} 70%,${p.sw}bb 100%)">
        <span class="npromo" style="left:12px;right:auto">${offTxt(p)}</span><span class="nadded ${d<=3?'urgent':''}">Ends ${promoEnd(p)}${d<=7?` · ${d} day${d!==1?'s':''} left`:''}</span></div>
      <div class="nb"><div class="nser">${S.name} · ${S.type} · <span class="code">${p.code}</span></div><h3>${esc(p.colour)}</h3>
        ${PRICE_ON?`<div class="prices">
          <div class="pr promo"><span>Promo price</span><b>${money(p.promo)}</b><small>/ ${unitLbl(p.unit)} ex GST</small></div>
          <div class="pr"><span>Trade price</span><s>${money(p.yours)}</s></div>
          <div class="pr"><span>Standard price</span><s>${money(p.std)}</s></div>
          <div class="psave" ${PRICE_ON?'':'style="display:none"'}>You save ${money(saveStd(p).amt)} / ${unitLbl(p.unit)} (${saveStd(p).pct}%) off the standard price</div>
        </div>`:`<div class="prices pzh">🔒 Prices hidden</div>`}
        ${stock}
        ${acc.length?`<div class="pacc"><span>Matching</span>${acc.join(' · ')}</div>`:''}</div></div>`; };
  return `<div class="nhero phero"><div class="wrap">
      <a class="back" href="#/dashboard">${ICON.back} Back to home</a>
      <div class="eyebrow">Product Collection</div>
      <h1>Promotion</h1>
      <p>Limited-time prices, even lower than your trade price — ${items.length} colours across ${groups.length} series.</p>
      <div class="pcount ${dl<=3?'urgent':''}"><b>${dl===0?'Ends today':`${dl} day${dl!==1?'s':''} left`}</b><span>${ends.length>1?`first promotion ends ${soonest} · others run to ${ends[ends.length-1]}`:`ends ${soonest}`}</span></div>
      <div class="seriesnav">${groups.map(g=>`<a href="javascript:void 0" onclick="const d=document.getElementById('g-${g.id}');d.open=true;d.scrollIntoView({behavior:'smooth'})">${g.name} <span>${items.filter(p=>p.series===g.id).length}</span></a>`).join('')}</div>
    </div></div>
    <div class="wrap">
      <div class="ngtools"><span class="plegend"><b>Promo price</b> = this promotion · <b>Trade price</b> = your normal account price · <b>Standard price</b> = list price</span>
        <a href="javascript:void 0" onclick="document.querySelectorAll('details.ngroup').forEach(d=>d.open=true)">Expand all</a> · <a href="javascript:void 0" onclick="document.querySelectorAll('details.ngroup').forEach(d=>d.open=false)">Collapse all</a></div>
      ${groups.map((g,gi)=>{ const its=items.filter(p=>p.series===g.id).sort((a,b)=>rank(a)-rank(b)); const inS=its.filter(p=>p.stock!=null).length; return `<details class="ngroup" id="g-${g.id}" ${gi===0?'open':''}>
        <summary class="nghead"><span class="ngchev">›</span><div class="ngt"><div class="ngcat">${g.cat} · ${g.type}</div><div class="ngrow"><h2>${g.name}</h2><span class="ngn pr">${its.length} on promotion · ${inS} in stock</span></div>
          <p><b>Size</b> ${g.size} · <b>Per box</b> ${g.box} · ${esc(g.desc||'')}</p></div>
          <div class="ngsw">${its.map(p=>`<i style="background:${p.sw}" title="${esc(p.colour)}"></i>`).join('')}</div>
          <a class="btn-o sm" href="#/series/${g.id}" onclick="event.stopPropagation()">View all ${g.colours} colours</a></summary>
        <div class="ngrid">${its.map(card).join('')}</div></details>`; }).join('')}
      <p class="muted" style="font-size:12px;margin:8px 0 50px">Prices exclude GST. Quotes, orders and invoices show amounts incl. GST. Click a colour for full details and stock.</p>
    </div>`;
}
/* Clearance：卖完为止、不能退货。缺货的不显示，剩得最少的排前面 */
function clearanceProducts(){
  const items = COLLECTIONS.clearance.items.map(byId).filter(p=>p && p.clr && p.stock!=null && p.stock>0).sort((a,b)=>a.stock-b.stock);
  const groups = SERIES.filter(s=>items.some(p=>p.series===s.id));
  const card = p => { const S=SERIES.find(x=>x.id===p.series);
    const acc = [p.scotia?`Scotia <a class="lnk" href="${accLink('scotia',p.scotia)}" onclick="event.stopPropagation()">${p.scotia}</a>`:'', p.nose?`Stair Nose <a class="lnk" href="${accLink('stair-nose',null,p.colour)}" onclick="event.stopPropagation()">${p.nose}</a>`:'', p.trims?`Trims <a class="lnk" href="${accLink('trims',p.trims)}" onclick="event.stopPropagation()">${p.trims}</a>`:''].filter(Boolean);
    const low = p.boxes!=null && p.boxes<=15;
    return `<div class="ncard pcard clcard" onclick="go('#/products/${p.id}?from=clearance')">
      <div class="nsw" style="background:linear-gradient(135deg,${p.sw} 0%,${p.sw}dd 45%,${p.sw} 70%,${p.sw}bb 100%)">
        <span class="nclr">CLEARANCE · ${clrOff(p)}</span><span class="nadded ${low?'urgent':''}">${(b=>b.k==='low'?'Almost gone':b.t)(stockBand(p))}</span></div>
      <div class="nb"><div class="nser">${S.name} · ${S.type} · <span class="code">${p.code}</span></div><h3>${esc(p.colour)}</h3>
        ${PRICE_ON?`<div class="prices">
          <div class="pr promo clr"><span>Clearance price</span><b>${money(p.clr)}</b><small>/ ${unitLbl(p.unit)} ex GST</small></div>
          <div class="pr"><span>Trade price</span><s>${money(p.yours)}</s></div>
          <div class="pr"><span>Standard price</span><s>${money(p.std)}</s></div>
          <div class="psave" ${PRICE_ON?'':'style="display:none"'}>You save ${money(saveStd(p).amt)} / ${unitLbl(p.unit)} (${saveStd(p).pct}%) off the standard price</div>
        </div>`:`<div class="prices pzh">🔒 Prices hidden</div>`}
        <div class="finalsale">Final sale · no returns</div>
        ${acc.length?`<div class="pacc"><span>Matching</span>${acc.join(' · ')}</div>`:''}</div></div>`; };
  return `<div class="nhero chero"><div class="wrap">
      <a class="back" href="#/dashboard">${ICON.back} Back to home</a>
      <div class="eyebrow">Product Collection</div>
      <h1>Clearance</h1>
      <p>Remaining stock at clearance prices — ${items.length} colour${items.length!==1?'s':''} across ${groups.length} series, while stock lasts.</p>
      <div class="pcount fs"><b>Final sale</b><span>Clearance items can't be returned or exchanged. Please check colour, quantity and batch before ordering.</span></div>
      <div class="seriesnav">${groups.map(g=>`<a href="javascript:void 0" onclick="const d=document.getElementById('g-${g.id}');d.open=true;d.scrollIntoView({behavior:'smooth'})">${g.name} <span>${items.filter(p=>p.series===g.id).length}</span></a>`).join('')}</div>
    </div></div>
    <div class="wrap">
      <div class="ngtools"><span class="plegend"><b>Clearance price</b> = while stock lasts · <b>Trade price</b> = your normal account price · <b>Standard price</b> = list price</span>
        <a href="javascript:void 0" onclick="document.querySelectorAll('details.ngroup').forEach(d=>d.open=true)">Expand all</a> · <a href="javascript:void 0" onclick="document.querySelectorAll('details.ngroup').forEach(d=>d.open=false)">Collapse all</a></div>
      ${items.length?groups.map((g,gi)=>{ const its=items.filter(p=>p.series===g.id); return `<details class="ngroup" id="g-${g.id}" ${gi===0?'open':''}>
        <summary class="nghead"><span class="ngchev">›</span><div class="ngt"><div class="ngcat">${g.cat} · ${g.type}</div><div class="ngrow"><h2>${g.name}</h2><span class="ngn cl">${its.length} on clearance</span></div>
          <p><b>Size</b> ${g.size} · <b>Per box</b> ${g.box} · ${esc(g.desc||'')}</p></div>
          <div class="ngsw">${its.map(p=>`<i style="background:${p.sw}" title="${esc(p.colour)}"></i>`).join('')}</div>
          <a class="btn-o sm" href="#/series/${g.id}" onclick="event.stopPropagation()">View all ${g.colours} colours</a></summary>
        <div class="ngrid">${its.map(card).join('')}</div></details>`; }).join(''):'<div class="empty2"><b>Nothing on clearance right now</b><span>Check back later.</span></div>'}
      <p class="muted" style="font-size:12px;margin:8px 0 50px">Prices exclude GST. Quotes, orders and invoices show amounts incl. GST. Sold-out clearance items are removed automatically.</p>
    </div>`;
}
function product(id, params){
  const p = byId(id); if(!p) return notFound();
  const s = SERIES.find(x=>x.id===p.series);
  const rel = PRODUCTS.filter(x=>x.series===p.series && x.id!==p.id).slice(0,3);
  const range = params.get('r')==='90'?'d90':'d30';
  const sales = SALES[p.id]?.[range];
  const img = p.series==='bonita'?'ph1':(p.sw.startsWith('ph')?p.sw:'ph1');
  /* 这个颜色的采购情况：和 Sales 页同一份数据（已开票 − 退货，含 GST），点了去 Sales 看走势 */
  let salesHtml='';
  const ss = SALES_SERIES.find(x=>x.id===p.series), sc = ss && ss.colours.find(c=>c.colour===p.colour);
  if(sc){
    const m0 = salesRange(new URLSearchParams()), B = buildSales(m0).find(x=>x.id===ss.id), C = B && B.cols.find(c=>c.colour===p.colour);
    const T = salesTrend(m0, ['c:'+ss.id+'~'+p.colour]), yr = r2(T.reduce((a,x)=>a+x.amt,0)), max = Math.max(...T.map(x=>x.amt))||1;
    salesHtml = `<div class="psales"><div><h3>Your purchases of this colour</h3><span class="muted sm2">Invoiced minus returns, incl. GST · same figures as the Insights page</span></div>
      <div class="psk"><span>This month</span><b>${C?fmtQty(C.qty,ss.unit):'0'}</b><small>${C?money(C.amount):'$0.00'}</small></div>
      <div class="psk"><span>Last 12 months</span><b>${money(yr)}</b><small>${T.filter(x=>x.amt>0).length} months with orders</small></div>
      <div class="pspark">${T.map(x=>`<i style="height:${Math.max(3,x.amt/max*40)}px" title="${MON3s(x.f)}: ${money(x.amt)}"></i>`).join('')}</div>
      <a class="btn-o sm" href="#/sales?cp=${encodeURIComponent('c:'+ss.id+'~'+p.colour)}">View trend in Insights ›</a></div>`;
  }
  const from = params.get('from'), FROM = {promotion:['Promotion','#/collections/promotion'], new:['New Product','#/collections/new'], clearance:['Clearance','#/collections/clearance']}[from];
  const sw = p.sw&&p.sw.startsWith('#') ? p.sw : '#a9a49b';
  const swBg = c => `background:linear-gradient(135deg,${c} 0%,${c}dd 45%,${c} 70%,${c}bb 100%)`;
  const allRel = PRODUCTS.filter(x=>x.series===p.series && x.id!==p.id);
  const stockState = (b=>[b.k==='out'?'b-expired':b.k==='mto'?'b-open':b.k==='low'?'b-pending':'b-instock', (b.k==='mto'?'':'● ')+b.t])(stockBand(p));
  const acc = [p.scotia?['Scotia',p.scotia,accLink('scotia',p.scotia)]:null, p.nose?['Stair Nose',p.nose,accLink('stair-nose',null,p.colour)]:null, p.trims?['Trims',p.trims,accLink('trims',p.trims)]:null].filter(Boolean);
  return `<div class="wrap">
    <div class="pnav">
      ${FROM?`<a class="back" href="${FROM[1]}">${ICON.back} Back to ${FROM[0]}</a>`:`<a class="back" href="#/series/${p.series}">${ICON.back} Back to ${s.name} colours</a>`}
      <div class="crumbs"><a href="#/inventory">Products</a><span>›</span><a href="#/inventory?cat=${encodeURIComponent(s.cat)}">${s.cat}</a><span>›</span><a href="#/inventory?cat=${encodeURIComponent(s.cat)}&type=${encodeURIComponent(s.type)}">${s.type}</a><span>›</span><a href="#/series/${s.id}">${s.name}</a><span>›</span><b>${esc(p.colour)}</b></div>
    </div>
    <div class="prod2">
      <div><div class="pimg" style="${swBg(sw)}">${p.isNew?'<span class="nbadge">NEW</span>':''}${!PRICE_ON?'':p.clr?`<span class="npromo" style="background:#b23a2c">CLEARANCE · ${clrOff(p)}</span>`:p.promo?`<span class="npromo">${offTxt(p)}</span>`:''}</div>
        <div class="thumbs">${[0,1,2].map(i=>`<div style="${swBg(sw)};filter:brightness(${[1,.92,1.06][i]})"></div>`).join('')}</div></div>
      <div>
        <div class="eyebrow">${s.cat} · ${s.type} · ${s.name} series</div>
        <div class="ptitle"><h1>${s.name} ${p.colour}</h1><span class="badge ${stockState[0]}">${stockState[1]}</span></div>
        <div class="pcode"><span class="code">${p.code}</span>${p.isNew?` <span class="newtag" style="display:inline">NEW · Added ${fmtDay(p.addedOn)}</span>`:''}</div>
        ${!PRICE_ON?`<div class="pzhid">🔒 <b>Prices hidden</b><span>Staff: show prices at the top of the page</span></div>`
        :p.clr?`<div class="prices big">
            <div class="pr promo clr"><span>Clearance price · while stock lasts</span><b>${money(p.clr)}</b><small>/ ${unitLbl(p.unit)} ex GST</small></div>
            <div class="pr"><span>Trade price</span><s>${money(p.yours)}</s></div>
            <div class="pr"><span>Standard price</span><s>${money(p.std)}</s></div>
            <div class="psave">You save ${money(saveStd(p).amt)} / ${unitLbl(p.unit)} (${saveStd(p).pct}%) off the standard price · <span style="color:#b23a2c">Final sale · no returns</span></div></div>`
        :p.promo?`<div class="prices big">
            <div class="pr promo"><span>Promo price · until ${promoEnd(p)}</span><b>${money(p.promo)}</b><small>/ ${unitLbl(p.unit)} ex GST</small></div>
            <div class="pr"><span>Trade price</span><s>${money(p.yours)}</s></div>
            <div class="pr"><span>Standard price</span><s>${money(p.std)}</s></div>
            <div class="psave">You save ${money(saveStd(p).amt)} / ${unitLbl(p.unit)} (${saveStd(p).pct}%) off the standard price</div></div>`
          :`<div class="prices big"><div class="pr promo vip"><span>Trade price</span><b>${money(p.yours)}</b><small>/ ${unitLbl(p.unit)} ex GST</small></div>
            <div class="pr"><span>Standard price</span><s>${money(p.std)}</s></div></div>`}
        ${addCartBox(p)}
        <p class="pdesc">${esc(s.desc||s.cat)} — ${esc(p.colour)}.${s.cat==='Accessories'?' Colour-matched to suit HTT flooring.':' Suitable for residential and commercial projects.'}</p>
        <div class="spec">
          <span>Category</span><span>${s.cat} · ${s.type}</span><span>Colour</span><span>${p.colour}</span><span>Code</span><span>${p.code}</span>
          <span>Size</span><span>${s.size||'-'}</span><span>Per Box</span><span>${s.box||'-'}</span>
          ${s.spec?`<span>Spec</span><span>${esc(s.spec)}</span>`:''}
        </div>
        ${acc.length?`<div class="pmatch"><h3>Matching accessories</h3><div>${acc.map(([k,v,h])=>`<a href="${h}"><span>${k}</span><b>${v}</b></a>`).join('')}</div></div>`:''}
      </div>
      <div class="side2">
        <h2>Stock</h2>
        <div class="stkcard ${p.stock!=null?'ok':'no'}">
          <span>${CUSTOMER.location}</span>
          <b>${stockBand(p).t}</b>
          <small>${p.madeToOrder?'allow extra lead time':p.stock!=null?{high:'plenty for most orders',med:'order soon for larger jobs',low:'limited — order soon'}[stockBand(p).k]:p.incoming&&p.incoming.length?`next incoming ${fmtDay(p.incoming[0].eta)}`:'contact your account manager'}</small>
        </div>
        ${p.incoming&&p.incoming.length?`<div class="incbox"><h4>⛴ Incoming shipments</h4>${p.incoming.map(x=>`<div><span>${fmtDay(x.eta)}</span><b>Expected</b><small></small></div>`).join('')}<p>Arrival dates are estimates and may change.</p></div>`:''}
        <div class="info2">Stock is live from HTT's system. For large orders or pricing questions, contact your account manager.</div>
        ${allRel.length?`<div class="relh"><h3>Other ${s.name} colours</h3><a class="lnk sm2" href="#/series/${s.id}">View all ${s.colours}</a></div>
        <div class="rel2">${allRel.slice(0,6).map(r=>`<a href="#/products/${r.id}${from?'?from='+from:''}"><div style="${swBg(r.sw&&r.sw.startsWith('#')?r.sw:'#a9a49b')}">${r.promo&&PRICE_ON?'<em>PROMO</em>':''}</div><span>${esc(r.colour)}</span></a>`).join('')}</div>`:''}
      </div>
    </div>
    ${salesHtml}
  </div>`;
}

function listPage({title,sub,tabs,stats,rows,cols,filterOpts,placeholder,status,datebar='',tableCls='',statsCls='',colw=null}){
  return `<div class="page-head"><div class="wrap"><h1>${title}</h1><p>${sub}</p></div></div>
  <div class="wrap">
    ${tabs?`<div class="tabs">${tabs}</div>`:""}
    ${datebar}
    <div class="stats ${statsCls}">${stats}</div>
    <div class="searchbar">${ICON.search}<input placeholder="${placeholder}" oninput="filterList(this.value)"><select id="flt" onchange="filterList()" style="${filterOpts.length<2?'display:none':''}">${filterOpts.map(o=>`<option>${o}</option>`).join('')}</select></div>
    <table class="list ${tableCls}" id="lst">${colw?`<colgroup>${colw.map(w=>`<col${w?` style="width:${w}"`:''}>`).join('')}</colgroup>`:''}<thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${rows||`<tr><td colspan="${cols.length}" class="muted" style="text-align:center;padding:28px;font-weight:400">Nothing in this date range.</td></tr>`}</tbody></table>
  </div>`;
}
function filterList(v){
  const q=(v ?? document.querySelector('.searchbar input').value).toLowerCase(), f=document.getElementById('flt').value;
  document.querySelectorAll('#lst tbody tr').forEach(tr=>{const okQ=tr.textContent.toLowerCase().includes(q);const okF=f==='All'||f==='All Cycles'||(tr.dataset.st||'').split('|').includes(f);tr.dataset.f=okQ&&okF?'1':'0'});
  pager('lst',1);
}
const stat = (k,v,s,cls='')=>`<div class="stat ${cls}"><div class="k">${k}</div><div class="v">${v}</div><div class="s">${s}</div></div>`;
const bcls = s => 'b-'+s.toLowerCase().split(' ')[0];

function quoteSummary(q){
  const fmt = l => `${esc(l.d)} · ${l.box?(l.box*l.qty).toFixed(2)+' m²':l.qty+' '+(l.unit||'units')}`;
  return fmt(q.lines[0]) + (q.lines.length>1?` <span class="muted">+${q.lines.length-1} more</span>`:'');
}
const daysTo = s => Math.round((parseD(s) - new Date(SYSTEM_INFO.systemDate+'T00:00:00'))/864e5);
function qSearch(v){
  v=v.toLowerCase(); document.querySelectorAll('#lst tbody tr').forEach(tr=>tr.dataset.f = tr.textContent.toLowerCase().includes(v)?'1':'0'); pager('lst',1);
}
/* 过了有效期还没处理的报价，自动变成 Expired（按系统日期）。正式版由主系统更新状态 */
function autoExpireQuotes(){ QUOTES.forEach(q=>{ if(q.status==='Open' && daysTo(q.valid)<0){ q.status='Expired'; q.autoExpired=true; } }); }
function quotes(params){
  autoExpireQuotes();
  const R=pageRange(params); dateBar(R,false);
  // 已接受的报价已转成订单，不在 Quotes 列表显示（详情页仍可从订单链接进入）
  const inPeriod=QUOTES.filter(x=>inRange(x.issued,R)), moved=inPeriod.filter(q=>q.status==='Accepted');
  const all=inPeriod.filter(q=>q.status!=='Accepted'), ST=['Open','Cancelled','Expired'];
  const tab=ST.includes(params.get('st'))?params.get('st'):'All', cnt=st=>all.filter(q=>q.status===st).length;
  const list = tab==='All'?all:all.filter(q=>q.status===tab);
  const tot = l => r2(l.reduce((t,q)=>t+calc(q).total,0));
  const open=all.filter(q=>q.status==='Open');
  const soonL=open.filter(q=>daysTo(q.valid)<=1), soon=soonL.length;
  const link = st => { const p=new URLSearchParams(params); st==='All'?p.delete('st'):p.set('st',st); const qs=p.toString(); return '#/quotes'+(qs?'?'+qs:''); };
  const qline = l => l.box?(l.box*l.qty).toFixed(2)+' m²':l.qty+' '+(l.unit||'units');
  const rows = list.map(q=>{
    const d=daysTo(q.valid), isOpen=q.status==='Open', l0=q.lines[0], more=q.lines.length-1;
    const when = isOpen ? `<small class="qv ${d<=1?'soon':''}">${d<=0?'Expires today':d===1?'Expires tomorrow':`${d} days left`}</small>`
      : q.autoExpired ? `<small class="qv">Passed</small>` : '';
    const edt = isOpen && quoteInDraft(q.no) ? `<span class="qdr" title="You have unsaved changes in a draft">✎ Draft</span>` : '';
    const sub = q.orderNo?`→ <a class="lnk" href="#/orders/${q.orderNo.toLowerCase()}" onclick="event.stopPropagation()">${q.orderNo}</a>`:q.actionAt?`${q.actionAt} · HTT notified`:'';
    return `<tr class="click" onclick="go('#/quotes/${q.no.toLowerCase()}')">
      <td><b class="qno">${q.no}</b><div class="qref" title="Issued ${q.issued}">${q.issued}</div></td>
      <td><div class="oref2" title="${esc(q.ref)}">${esc(q.ref)||'—'}</div></td>
      <td><div class="qpn" title="${esc(l0.d)}">${esc(l0.d)}</div><div class="qps">${qline(l0)}${more?` · +${more} more`:''}</div></td>
      <td><div class="qvd">${q.valid}</div>${when}</td>
      <td class="qamt">${money(calc(q).total)}</td>
      <td><div class="qst"><span class="badge ${bcls(q.status)}">${q.status}</span>${edt}</div>${sub?`<div class="qps">${sub}</div>`:''}</td>
      <td class="qact">${isOpen?`<button class="btn sm" onclick="event.stopPropagation();quoteAction('${q.no}','accept')">Accept</button>${canEditQuote(q)?`<button class="btn-o sm qed" onclick="event.stopPropagation();editQuote('${q.no}')">${quoteInDraft(q.no)?'Continue':'Edit'}</button>`:''}<button class="qcx cxbtn" onclick="event.stopPropagation();quoteAction('${q.no}','cancel')">Cancel</button>`:`<span class="chev2">›</span>`}</td></tr>`;
  }).join('');
  return `<div class="page-head"><div class="wrap"><h1>Quotes</h1><p>Accept or cancel your quotes here. Accepted quotes become orders and move to Orders.</p></div></div>
  <div class="wrap" style="padding-top:24px">
    <div class="qstats">
      <a class="qstat main" href="${link('Open')}"><span>Open quotes</span><b>${open.length}</b><small>${money(tot(open))} in total</small></a>
      <div class="qstat"><span>Expiring by tomorrow</span><b class="${soon?'amber':''}">${soon}</b><small>${soon?money(tot(soonL))+' · accept before they expire':'nothing about to expire'}</small></div>
      <a class="qstat" href="#/orders"><span>Accepted → moved to Orders</span><b>${moved.length}</b><small>${moved.length?money(tot(moved))+' · view in Orders ›':'in this period'}</small></a>
    </div>
    <div class="qbar">
      <div class="qtabs">${['All',...ST].map(st=>`<a class="${st===tab?'on':''}" href="${link(st)}">${st}<span>${st==='All'?all.length:cnt(st)}</span></a>`).join('')}</div>
      <div class="mini-search" style="width:300px">${ICON.search}<input placeholder="Search quote, reference or product..." oninput="qSearch(this.value)"></div>
    </div>
    <div class="qcard">
      <table class="qtable qt2" id="lst"><colgroup><col style="width:11%"><col style="width:13%"><col><col style="width:12%"><col style="width:10%"><col style="width:12%"><col style="width:262px"></colgroup><thead><tr><th>Quote</th><th>Reference</th><th>Products</th><th>Valid until</th><th class="r">Inc GST</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows||`<tr><td colspan="7" class="muted" style="text-align:center;padding:36px">No ${tab==='All'?'':tab.toLowerCase()+' '}quotes in this date range.</td></tr>`}</tbody></table>
    </div>
    <div style="height:40px"></div>
  </div>`;
}
/* 订单 —— 给 IT：
   状态只用两步：Preparing（备货中）→ Ready（可提货 / 可送货），之后 Completed；客户取消则 Cancelled。
   方式只显示 Delivery 或 Pick up。
   客户可以 Edit：改日期（延到某天）或取消订单 → 主系统收到通知：
     POST /api/portal/me/orders/{orderNo}/reschedule {newDate, note?}
     POST /api/portal/me/orders/{orderNo}/cancel     {reason?, note?} */
/* 客户看到的订单状态：On hold / Preparing / Ready for pick up（自提）；Delivery 只有 To be booked / Booked + 日期 */
/* COD 账号：先收款再放货。主系统 account-summary.paymentTerms.code === 'COD'；订单的 paid 由财务在主系统确认收款后回传 */
let DEMO_COD = false;
const isCOD = () => DEMO_COD;
const BANK = {name:'HTT Flooring Pty Ltd', bank:'Commonwealth Bank', bsb:'063-XXX', acc:'XXXX XXXX'};   // 示例：正式版取主系统单据模板上的银行资料
const payDue = o => isCOD() && !o.paid && o.status!=='Completed' && o.status!=='Cancelled';
const PAY_ST = ['Payment required','Ready · payment due'];
const orderStage = o => o.status==='Completed'||o.status==='Cancelled' ? o.status
  : o.hold&&o.status==='Pending' ? 'On hold'
  : o.status==='Pending' ? 'Waiting for HTT'
  : o.method==='Pick up' ? (o.status==='Ready' ? (payDue(o)?'Ready · payment due':'Ready for pick up') : 'Preparing')
  : (o.booked ? 'Booked' : payDue(o) ? 'Payment required' : 'To be booked');
const orderLabel = o => { const st=orderStage(o); return st==='Booked' ? `Booked · ${o.expected}` : st; };
const orderBadge = o => ({'On hold':'b-overdue', 'Waiting for HTT':'b-pending', Preparing:'b-open', 'Ready for pick up':'b-ready', 'To be booked':'b-open', Booked:'b-ready', 'Payment required':'b-pay', 'Ready · payment due':'b-pay', Completed:'b-completed', Cancelled:'b-cancelled'})[orderStage(o)];
const lateDays = o => o.status==='Preparing' ? Math.max(0, -daysTo(o.readyBy||o.expected)) : 0;
const canEditOrder = o => (o.status==='Pending' || o.status==='Preparing' || o.status==='Ready') && o.method==='Pick up';
const canChangeDate = o => canEditOrder(o) && o.method==='Pick up';   // 只有提货日期客户能改
const notCollected = o => (o.method==='Pick up' && o.status==='Ready' && o.expected) ? Math.max(0, -daysTo(o.expected)) : 0;
const dateLabel = o => o.method==='Pick up' ? 'Pick up date' : 'Delivery date';
function dateCell(o){
  if(o.method==='Pick up'){
    const nc = notCollected(o);
    return `${o.expected||'-'}${nc?`<br><span class="dleft late" style="margin-top:3px">Not collected · ${nc} day${nc>1?'s':''}</span>`:''}${canChangeDate(o)?`<br><span class="chg">You can change this</span>`:''}`;
  }
  return o.booked ? `<span class="bookd">Booked</span> ${o.expected}` : `<span class="tbb">To be booked</span>${o.wanted?`<br><span class="chg">Requested ${fmtDay(o.wanted)}</span>`:''}`;
}
function orderSteps(o){
  if(o.status==='Cancelled') return '';
  const pu = o.method==='Pick up', st=orderStage(o);
  const cod = isCOD() && o.status!=='Completed';
  const L = pu ? ['Waiting for HTT','Preparing',cod&&!o.paid?'Ready · pay before pick up':'Ready for pick up','Picked up'] : ['Waiting for HTT',cod?(o.paid?'Paid':'Payment required'):'To be booked','Booked'+(o.booked&&o.expected?' · '+o.expected:''),'Delivered'];
  const i = o.status==='Completed' ? 3 : st==='Waiting for HTT' ? 0 : pu ? (st==='Ready for pick up'||st==='Ready · payment due'?2:1) : (st==='Booked'?2:1);
  if(st==='On hold') return `<div class="osteps"><div class="ostep on hold"><i>!</i><span>On hold · account</span></div><div class="oline"></div>${L.map((t,j)=>`${j?'<div class="oline"></div>':''}<div class="ostep"><i>${j+1}</i><span>${t}</span></div>`).join('')}</div>`;
  return `<div class="osteps">${L.map((t,j)=>`${j?`<div class="oline ${i>=j?'on':''}"></div>`:''}<div class="ostep ${i>=j?'on':''}"><i>${j+1}</i><span>${t}</span></div>`).join('')}</div>`;
}
function orders(params){
  const R=pageRange(params);
  // 已完成的订单已开发票，不在 Orders 列表显示（详情页仍可从发票链接进入）
  const inPeriod=ORDERS.filter(x=>inRange(x.issued,R)), all=inPeriod.filter(o=>o.status!=='Completed');
  const sum = st => {const l=inPeriod.filter(o=>o.status===st);return [money(r2(l.reduce((s,o)=>s+calc(o).total,0))), l.length+' order'+(l.length!==1?'s':'')]};
  const late = all.filter(o=>lateDays(o)>0).length;
  const [rAmt, rCnt] = sum('Ready'), [cAmt, cCnt] = sum('Completed'), [pAmt, pCnt] = sum('Preparing');
  return listPage({title:'Orders',sub:'Track orders, delivery / pick up dates and order status.',tabs:'',
    datebar:dateBar(R,false),
    stats:(()=>{ const act=all.filter(o=>o.status!=='Cancelled'), by=k=>act.filter(o=>orderStage(o)===k), amt=l=>money(r2(l.reduce((s,o)=>s+calc(o).total,0)));
        const ip=[...by('Waiting for HTT'),...by('On hold'),...by('Preparing'),...by('To be booked'),...by('Payment required')], wt=by('Waiting for HTT').length, rd=[...by('Ready for pick up'),...by('Ready · payment due'),...by('Booked')], pn=act.filter(o=>PAY_ST.includes(orderStage(o))).length, hn=by('On hold').length, tb=by('To be booked').length, nc=act.filter(o=>notCollected(o)>0).length;
        return stat('In progress',ip.length,`${amt(ip)}${pn?` · <span style="color:var(--red)">${pn} waiting for payment</span>`:''}${wt?` · <span style="color:#6b4fa0">${wt} waiting for HTT</span>`:''}${hn?` · <span style="color:var(--red)">${hn} on hold</span>`:''}${tb?` · ${tb} delivery to be booked`:''}${late?` · <span style="color:var(--red)">${late} delayed</span>`:''}`)
          +stat('Ready / booked',rd.length,`${amt(rd)} · ${[by('Ready for pick up').length?by('Ready for pick up').length+' ready for pick up':'',by('Ready · payment due').length?by('Ready · payment due').length+' ready · payment due':'',by('Booked').length?by('Booked').length+' delivery booked':''].filter(Boolean).join(' · ')||'nothing ready yet'}${nc?` · <span style="color:var(--red)">${nc} not collected</span>`:''}`); })()
      +`<a class="stat" href="#/invoices" style="display:block"><div class="k">Completed</div><div class="v">${parseInt(cCnt)}</div><div class="s">${cAmt} · moved to Invoices ›</div></a>`,
    placeholder:'Search order, product or reference...',filterOpts:['All','Waiting for HTT','On hold','Preparing',...(isCOD()?['Payment required','Ready · payment due']:[]),'Ready for pick up','To be booked','Booked','Cancelled'], statsCls:'ostats',
    cols:['Order','Reference','Product','Expected date','Delivery / pick up','Inc GST','Status',''], colw:['11%','12%','','11%','15%','10%','14%','124px'], tableCls:'compact otbl ot2',
    rows:all.map(o=>{ const ld=lateDays(o), pu=o.method==='Pick up', nc=notCollected(o), l0=o.lines[0];
      const dt = pu ? `${o.expected||'—'}${canChangeDate(o)?' <span class="chg">· can change</span>':''}`
        : o.booked ? `Booked · ${o.expected}` : `To be booked${o.wanted?` <span class="chg">· wanted ${fmtDay(o.wanted)}</span>`:''}`;
      const pst = PAY_ST.includes(orderStage(o));
      const warn = nc ? `Not collected · ${nc} day${nc>1?'s':''}` : pst ? (pu?'Pay by transfer or at counter':'Pay before booking') : '';
      return `<tr class="click" data-st="${orderStage(o)}" onclick="go('#/orders/${o.no.toLowerCase()}')">
        <td><b class="qno">${o.no}</b><div class="qref" title="Issued ${o.issued}">${o.issued}</div></td>
        <td><div class="oref2" title="${esc(o.ref)}">${esc(o.ref)||'—'}</div></td>
        <td><div class="qpn" title="${esc(l0.d)}">${esc(l0.d)}</div><div class="qps">${l0.box?(l0.box*l0.qty).toFixed(2)+' m²':l0.qty+' '+(l0.unit||'units')}${o.lines.length>1?` · +${o.lines.length-1} more`:''}</div></td>
        <td><div class="qvd">${o.readyBy||'—'}</div>${ld?`<div class="owarn">Delayed ${ld} day${ld>1?'s':''}</div>`:''}</td>
        <td><span class="mpill ${pu?'pu':'dl'}">${pu?ICON.box:ICON.truck}${o.method}</span><div class="qps odt">${dt}</div></td>
        <td class="oamt">${money(calc(o).total)}</td>
        <td><span class="badge ${orderBadge(o)}">${orderStage(o)}</span>${warn?`<div class="owarn">${warn}</div>`:''}${o.cancelledAt?`<div class="qps">${o.cancelledAt} · HTT notified</div>`:''}</td>
        <td style="text-align:right">${canEditOrder(o)?`<button class="btn-o sm" onclick="event.stopPropagation();editOrder('${o.no}')">Change date</button>`:'<span class="chev2">›</span>'}</td></tr>`; }).join('')});
}

function codBox(){ if(!isCOD()) return '';
  return `<div class="holdbox cod"><b>COD account · payment before release</b><span>HTT releases your goods once payment is received — by bank transfer (details on your order), or for pick up, at the counter on the day. Delivery is booked after payment; HTT adds the delivery fee first.</span></div>`; }
/* 订单 Edit：改日期 或 取消 */
/* 订单只能改「提货日期」（Pick up 订单）。Delivery 日期由 HTT 订物流，客户不能改；取消订单要联系 HTT 前台 */
function cancelHint(){ const br=(MOCK_ACCOUNT_MANAGER||{}).branch||{}; return `To cancel an order, please contact HTT${br.phone?' on <b>'+esc(br.phone)+'</b>':''}${br.email?' or '+esc(br.email):''}.`; }
function editOrder(no){
  const o = ORDERS.find(x=>x.no===no); if(!canChangeDate(o)) return;
  const minD = SYSTEM_INFO.systemDate, cur = (()=>{ const d=parseD(o.expected||fmtDay(SYSTEM_INFO.systemDate)); return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; })();
  const m = document.getElementById('modal');
  m.innerHTML = `<form class="mbox" onsubmit="event.preventDefault();submitOrderEdit(this,'${no}')">
    <h3 class="serif" style="font-weight:500;font-size:26px;margin:0 0 6px">Change pick up date</h3>
    <div class="qsum"><div><span>Order</span><b>${no}</b></div><div><span>Status</span><b>${orderLabel(o)}</b></div><div><span>Current pick up date</span><b>${o.expected||'-'}</b></div></div>
    <label style="margin-top:6px">New pick up date<input type="date" name="newDate" min="${earliestDate('Pick up')}" value="${fixDate(cur,'Pick up')}" onchange="dateIn(this,'Pick up')" style="max-width:200px"><small>${dateHint('Pick up')}</small></label>
    <label style="margin-top:12px">Note for HTT (optional)<input name="note" maxlength="300"></label>
    <p class="muted" style="font-size:12px;margin:2px 0 0">HTT will be notified straight away.</p>
    <div class="cxhint">${cancelHint()}</div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><button type="button" class="btn-o" onclick="closeModal()">Back</button><button class="btn">Save date</button></div>
  </form>`;
  m.style.display='flex';
}
async function submitOrderEdit(f, no){
  const o = ORDERS.find(x=>x.no===no), fd = new FormData(f), act = fd.get('act'), today = fmtDay(SYSTEM_INFO.systemDate);
  { if(!canChangeDate(o)){ toast('Delivery date is booked and cannot be changed'); return; }
    const nd=fd.get('newDate'); if(!nd){ toast('Choose a date'); return; } if(!dateOk(nd,'Pick up')){ toast('Please choose a business day from '+fmtDay(earliestDate('Pick up'))); return; } o.expected=fmtDay(nd); o.changedAt=today; toast(`${dateLabel(o)} changed to ${o.expected} — HTT has been notified`); }
  o.custNote = fd.get('note')||o.custNote||null;
  closeModal(); render();
}

function docPage({kind,no,status,statusCls,metaA,metaB,party,ref,lines,freight,extra,backHref,backText,actions='',note='',top='',tbq=false}){
  const c = calc({lines,freight});
  return `<div class="wrap"><a class="back" href="${backHref}">${ICON.back} ${backText}</a>
  <div class="doc">
    <div class="top"><div><div class="lbl">${kind}</div><h1>${no}</h1></div><div><span class="badge ${statusCls}">${status}</span></div></div>
    <div class="meta"><div class="lbl">${metaA[0]}<b style="color:var(--ink);font-size:13px">${metaA[1]}</b></div>
      <div class="lbl">${metaB[0]}<b style="color:var(--ink);font-size:13px">${metaB[1]}</b></div>
      <div class="lbl">${party}<b style="color:var(--ink);font-size:13px">${CUSTOMER.name}</b><div style="color:var(--ink);font-size:13px;margin-top:6px">${CUSTOMER.address}</div></div></div>
    ${ref?`<div class="lbl" style="font-size:11px">Reference &nbsp;<b style="display:inline;color:var(--ink);font-size:13px">${ref}</b></div>`:''}
    ${top}
    <table><thead><tr><th>Description</th><th>Size Per Box</th><th>Qty</th><th>Total Size</th><th>Unit Price</th><th>Amount</th></tr></thead>
    <tbody>${lines.map(l=>`<tr><td>${l.d}</td><td>${l.box?l.box+' m²':'-'}</td><td>${l.qty}${l.box?' <span class="muted">box'+(l.qty>1?'es':'')+'</span>':''}</td><td>${l.box?(l.box*l.qty).toFixed(3)+' m²':l.unit?l.qty+' '+l.unit:'-'}</td><td>${money(l.price)}</td><td>${money(lineAmt(l))}</td></tr>`).join('')}</tbody></table>
    <div class="totals">
      <div><span>Subtotal</span><b>${money(c.subtotal)}</b></div><div><span>${tbq?'Delivery fee':'Freight'}</span>${tbq?'<span class="dfee">To be quoted</span>':`<b>${money(freight)}</b>`}</div>
      <div><span>GST</span><b>${money(c.gst)}</b></div><div class="${extra?'':'t'}"><span>Total (incl. GST)</span><b>${money(c.total)}</b></div>
      ${extra||''}
    </div>
    ${note}
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:26px">${actions}<button class="${actions?'btn-o':'btn'}" onclick="printDoc()">${ICON.dl.replace('#fff', actions?'currentColor':'#fff')} Print / Save PDF</button></div>
  </div></div>`;
}
/* 客户可以修改 Open 的报价（同一个单号，保存后有效期重新算 7 天，通知 HTT）。Order 不能修改产品。
   IT：PUT /api/portal/me/quotes/{quoteNo}  {lines, ref, note, method, shipTo}；主系统更新原报价（保留单号，记录修改历史） */
function lineToProduct(l){ return l.productId ? byId(l.productId) : PRODUCTS.find(p=>{ const S=SERIES.find(x=>x.id===p.series)||{}; return `${S.name} ${p.colour}`.toLowerCase()===(l.d||'').toLowerCase(); }); }
const quoteInDraft = no => DRAFT.editing===no || DRAFTS.some(d=>d.draft.editing===no);
function canEditQuote(q){ return q.status==='Open' && q.lines.every(l=>lineToProduct(l)); }
function editQuote(no){ const q=QUOTES.find(x=>x.no===no); if(!q) return;
  if(DRAFT.editing===no){ go('#/cart'); return; }
  const ex=DRAFTS.find(d=>d.draft.editing===no); if(ex){ openDraft(ex.id); return; }
  startFresh('quote');
  CART = q.lines.map(l=>({id:lineToProduct(l).id, qty:l.qty}));
  DRAFT = {...DRAFT, type:'quote', editing:q.no, store:q.store, ref:/^Online /.test(q.ref||'')?'':(q.ref||''), note:q.note||'', method:q.method||'Delivery', ship:q.shipTo||DRAFT.ship, step:1, editShip:false};
  go('#/cart'); }
function stopEdit(){ const no=DRAFT.editing; CART=[]; DRAFT=blankDraft('quote'); DRAFT_SAVED=null; go('#/quotes/'+no.toLowerCase()); }
function quoteDetail(no){
  autoExpireQuotes();
  const q = docLookup(QUOTES, x=>x.no.toLowerCase()===no); if(!q) return notFound(); if(q.__deny) return denyPage(q.__deny);
  const actions = q.status==='Open' ? `<button class="btn-o" onclick="quoteAction('${q.no}','cancel')">Cancel quote</button>${canEditQuote(q)?`<button class="btn-o" onclick="editQuote('${q.no}')">Edit quote</button>`:''}<button class="btn" onclick="quoteAction('${q.no}','accept')">Accept quote</button>` : '';
  const note = q.actionAt ? `<div class="qnote ${q.status==='Accepted'?'ok':''}">${q.status==='Accepted'?'Accepted':'Cancelled'} on ${q.actionAt} by ${esc(q.actionBy)} · HTT has been notified${q.po?` · PO ${esc(q.po)}`:''}${q.reason?` · Reason: ${esc(q.reason)}`:''}</div>` : '';
  const upd = q.updated?`<div class="qnote">Updated online on ${q.updated} · HTT has been notified</div>`:'';
  return docPage({tbq:q.method==='Delivery'&&!q.freight&&q.status==='Open', top:docLinks(q)+upd, kind:'QUOTE',no:q.no,status:q.status,statusCls:bcls(q.status),metaA:['Issued',q.issued],metaB:['Valid Until',q.valid],party:'Customer',ref:q.ref,lines:q.lines,freight:q.freight,backHref:'#/quotes',backText:'Back to quotes',actions,note});
}
/* 报价 Accept / Cancel —— 给 IT：
   POST /api/portal/me/quotes/{quoteNo}/accept  {poNumber?, note?}
   POST /api/portal/me/quotes/{quoteNo}/cancel  {reason?, note?}
   后端：只允许 Open 且未过有效期的报价；更新主系统报价状态，并通知主系统 / 客户经理。 */
/* Accept 报价时选地址：Delivery = 主系统里的送货地址（默认选报价上的 / 默认送货地址）；Pick up = HTT 门店 */
function accAddr(q){ const L=((MOCK_SUMMARY.addresses||{}).delivery)||[], br=(MOCK_ACCOUNT_MANAGER||{}).branch||{};
  const opts = q.shipTo&&!L.some(a=>a.line1===q.shipTo.line1) ? [{addressId:'QUOTE', label:'Address on this quote', ...q.shipTo}, ...L] : L;
  const sel = (opts.find(a=>q.shipTo&&a.line1===q.shipTo.line1)||opts.find(a=>a.isDefault)||opts[0]||{}).addressId;
  const ln = a => `${a.line1}, ${a.suburb} ${a.state} ${a.postcode}`;
  return `<div class="accaddr dl"><span>Ship to</span><select name="shipTo" onchange="this.nextElementSibling.textContent=this.selectedOptions[0].dataset.n||'';this.form.classList.toggle('nw',this.value==='NEW')">${opts.map(a=>`<option value="${a.addressId}" data-n="${esc([a.contact,a.phone,a.notes].filter(Boolean).join(' · '))}" ${a.addressId===sel?'selected':''}>${esc(a.label)} — ${esc(ln(a))}</option>`).join('')}<option value="NEW">+ New address for this order…</option></select><small>${esc((()=>{const a=opts.find(x=>x.addressId===sel)||{};return [a.contact,a.phone,a.notes].filter(Boolean).join(' · ');})())}</small><div class="accnew">
      <label class="w2">Street<input name="n_line1" placeholder="e.g. 8 Site Road"></label>
      <label>Suburb<input name="n_suburb"></label><label>State<select name="n_state">${['VIC','NSW','QLD','SA','WA','TAS','ACT','NT'].map(x=>`<option>${x}</option>`).join('')}</select></label><label>Postcode<input name="n_postcode" maxlength="4" inputmode="numeric"></label>
      <label>Contact on site<input name="n_contact"></label><label style="grid-column:span 2">Phone<input name="n_phone"></label>
      <label class="w2">Delivery notes<input name="n_notes" placeholder="e.g. rear lane access, forklift on site"></label>
      <small class="w2">Used for this order only. To save it to your account, add it in My Account → Stores &amp; Addresses.</small></div>
      <em>HTT checks the delivery fee with the carrier and adds it to the order.</em><em class="xfee">Extra carrier charges (e.g. waiting time on site, a failed or re-delivery) may be added after delivery — HTT will update your order and let you know.</em></div>
    <div class="accaddr pk"><span>Pick up from</span><b>${esc(br.name||'HTT Flooring')}</b><small>${esc([br.phone,br.hours].filter(Boolean).join(' · '))}</small><em>No delivery fee. HTT lets you know when it's ready.</em></div>`; }
function quoteAction(no, act){
  if(act==='accept' && !PRICE_ON){ toast('Show prices first (top right) to check the amounts'); return; }
  const q = QUOTES.find(x=>x.no===no), total = money(calc(q).total), acc = act==='accept';
  const m = document.getElementById('modal');
  m.innerHTML = `<form class="mbox ${acc&&q.method==='Pick up'?'pu':''}" onsubmit="event.preventDefault();submitQuoteAction(this,'${no}','${act}')">
    <h3 class="serif" style="font-weight:500;font-size:26px;margin:0 0 6px">${acc?'Accept':'Cancel'} quote ${no}?</h3>
    <div class="qsum"><div><span>Total (incl. GST)</span><b>${total}</b></div><div><span>Valid until</span><b>${q.valid}</b></div><div><span>Reference</span><b>${esc(q.ref)}</b></div></div>
    ${acc&&acctHold()?holdBox('order'):''}${acc?codBox():''}
    ${acc ? `<div class="mrow"><span>Delivery or pick up?</span><label class="pill"><input type="radio" name="method" value="Delivery" ${q.method!=='Pick up'?'checked':''} onchange="this.form.classList.remove('pu');dateIn(this.form.wanted,'Delivery')"> Delivery</label><label class="pill"><input type="radio" name="method" value="Pick up" ${q.method==='Pick up'?'checked':''} onchange="this.form.classList.add('pu')"> Pick up</label></div>
             ${accAddr(q)}
             <label class="accdate"><span class="dl">Delivery date wanted</span><span class="pk">Pick up date</span><input type="date" name="wanted" min="${earliestDate('Pick up')}" value="${defDate('Delivery')}" onchange="dateIn(this)" required><small><span class="dl">${dateHint('Delivery')} HTT books the carrier and confirms the date.</span><span class="pk">${dateHint('Pick up')} You can change it later.</span></small></label>
             <label>Your PO number (optional)<input name="po" maxlength="40"></label>`
          : `<label>Reason (optional)<select name="reason"><option value="">Choose a reason</option><option>Price too high</option><option>Project delayed or cancelled</option><option>Bought elsewhere</option><option>Need different products</option><option>Other</option></select></label>`}
    <label>Note for HTT (optional)<input name="note" maxlength="300"></label>
    <p class="muted" style="font-size:12px;margin:4px 0 0">${acc?'An order is created straight away and HTT is notified.':'HTT will be notified. You can ask your account manager for a new quote any time.'}</p>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><button type="button" class="btn-o" onclick="closeModal()">Back</button>
      <button class="btn ${acc?'':'danger-btn'}">${acc?'Accept quote':'Cancel quote'}</button></div>
  </form>`;
  m.style.display='flex';
}
/* 单号规则：Quote → Order → Invoice 用同一个号码，只换前缀（QUO-10540 → ORD-10540 → INV-10540） */
const sameNo = (no, pre) => pre+'-'+no.split('-')[1];
const nextNo = (list, pre) => pre+'-'+(Math.max(...list.map(x=>+x.no.split('-')[1]))+1);
// 单据之间的链接：报价 → 订单 → 发票
function docLinks(d){
  const L=[];
  if(d.quoteNo) L.push(`From quote <a class="lnk" href="#/quotes/${d.quoteNo.toLowerCase()}">${d.quoteNo}</a>`);
  if(d.orderNo && d.no.startsWith('QUO')) L.push(`Order <a class="lnk" href="#/orders/${d.orderNo.toLowerCase()}">${d.orderNo}</a>`);
  if(d.orderNo && d.no.startsWith('INV')) L.push(`From order <a class="lnk" href="#/orders/${d.orderNo.toLowerCase()}">${d.orderNo}</a>`);
  if(d.invoiceNo) L.push(`Invoice <a class="lnk" href="#/invoices/${d.invoiceNo.toLowerCase()}">${d.invoiceNo}</a>`);
  return L.length ? `<div class="doclinks">${L.join('<span>→</span>')}</div>` : '';
}
/* 原型演示：模拟主系统推进订单（正式版由主系统更新状态，门户只显示）
   订单 Completed → 主系统开发票，发票号写回订单 */
function demoBook(no){ const o=ORDERS.find(x=>x.no===no); o.booked=true; o.expected=fmtDay(ISO(addDays(SYS,3))); toast(`Delivery booked for ${o.expected}`); render(); }
function demoAdvance(no){
  const o = ORDERS.find(x=>x.no===no), today = fmtDay(SYSTEM_INFO.systemDate);
  if(o.status==='Pending'){ o.status='Preparing'; o.readyBy = o.wanted?fmtDay(o.wanted):fmtDay(ISO(addDays(SYS,5))); toast(`${no} confirmed by HTT`); }
  else if(o.status==='Preparing'){ o.status='Ready'; toast(`${no} is ready`); }
  else if(o.status==='Ready'){
    o.status='Completed';
    const invNo = sameNo(o.no,'INV');
    INVOICES.unshift({no:invNo, orderNo:o.no, issued:today, due:fmtDay(ISO(addDays(SYS,14))), lines:o.lines, freight:o.freight, paid:0});
    o.invoiceNo = invNo; recalcInvoices();
    toast(`${no} completed — invoice ${invNo} created`);
  }
  render();
}
async function submitQuoteAction(f, no, act){
  const q = QUOTES.find(x=>x.no===no), fd = new FormData(f);
  q.status = act==='accept' ? 'Accepted' : 'Cancelled';
  q.actionAt = fmtDay(SYSTEM_INFO.systemDate); q.actionBy = 'John Smith';
  q.po = fd.get('po')||null; q.reason = fd.get('reason')||null; q.note = fd.get('note')||null;
  if(act==='accept'){   // 报价接受 → 生成订单（IT：由主系统生成订单号并返回）
    const ordNo = sameNo(q.no,'ORD');
    const wanted = fd.get('wanted');
    const mth0 = fd.get('method')||'Delivery';
    if(!dateOk(wanted, mth0)){ q.status='Open'; q.actionAt=null; toast('Please choose a business day from '+fmtDay(earliestDate(mth0))); return; }
    const meth = fd.get('method')||'Delivery', aid = fd.get('shipTo'), AL=((MOCK_SUMMARY.addresses||{}).delivery)||[];
    let shipTo = meth==='Delivery' ? (aid==='QUOTE' ? q.shipTo : AL.find(a=>a.addressId===aid)||null) : null;
    if(meth==='Delivery' && aid==='NEW'){ const g=k=>(fd.get(k)||'').trim();
      if(!g('n_line1')||!g('n_suburb')||!/^\d{4}$/.test(g('n_postcode'))){ q.status='Open'; q.actionAt=null; toast('Please enter street, suburb and a 4-digit postcode'); return; }
      shipTo={label:'New address', line1:g('n_line1'), suburb:g('n_suburb'), state:g('n_state'), postcode:g('n_postcode'), contact:g('n_contact'), phone:g('n_phone'), notes:g('n_notes'), isNew:true}; }
    ORDERS.unshift({store:q.store, no:ordNo, issued:q.actionAt, readyBy:null, wanted, expected: meth==='Pick up'?fmtDay(wanted):null, ref:q.ref, quoteNo:q.no, po:q.po, status:'Pending', hold:(acctHold()||{}).k||null, method:meth, shipTo, lines:q.lines, freight:meth==='Pick up'?0:q.freight});
    q.orderNo = ordNo;
    closeModal(); toast(acctHold()?`${no} accepted — order ${ordNo} is on hold until your account is cleared`:`${no} accepted — order ${ordNo} created, HTT notified`); render(); return;
  }
  closeModal(); toast(`${no} cancelled — HTT has been notified`); render();
}
function orderDetail(no){
  const q = docLookup(ORDERS, x=>x.no.toLowerCase()===no); if(!q) return notFound(); if(q.__deny) return denyPage(q.__deny);
  const ld = lateDays(q);
  const actions = canEditOrder(q) ? `<button class="btn-o" onclick="editOrder('${q.no}')">Change pick up date</button>` : '';
  const note = q.status==='Cancelled' ? `<div class="qnote">Cancelled on ${q.cancelledAt||'-'} by you · HTT has been notified${q.custNote?` · Note: ${esc(q.custNote)}`:''}</div>`
    : q.changedAt ? `<div class="qnote ok">${dateLabel(q)} changed to ${q.expected} on ${q.changedAt} · HTT has been notified${q.custNote?` · Note: ${esc(q.custNote)}`:''}</div>` : '';
  return docPage({tbq:q.method==='Delivery'&&!q.freight&&q.status!=='Completed'&&q.status!=='Cancelled', kind:'ORDER',no:q.no,status:orderLabel(q),statusCls:orderBadge(q),metaA:['Ordered',q.issued+`<div class="muted sm2" style="font-weight:400;margin-top:8px">${q.status==='Pending'?'Date wanted':'Expected date'}</div>${q.status==='Pending'&&q.wanted?fmtDay(q.wanted)+' <span class="muted sm2" style="font-weight:400">· HTT will confirm</span>':q.readyBy||'-'}${ld?` <span class="dleft late">Delayed ${ld} day${ld>1?'s':''}</span>`:''}`],
    metaB:[dateLabel(q), dateCell(q)],party:'Customer',ref:q.ref,lines:q.lines,freight:q.freight,
    backHref:'#/orders',backText:'Back to orders',actions,
    note: note + (q.status==='Pending'||q.status==='Preparing'||q.status==='Ready' ? `<div class="cxhint" style="margin-bottom:12px">${q.method==='Delivery'?`${q.booked?`Delivery booked for <b>${q.expected}</b>. `:q.wanted?`You asked for delivery on <b>${fmtDay(q.wanted)}</b>. `:''}The delivery date can't be changed here — to change it or cancel the order, contact HTT${(b=>b.phone?' on <b>'+esc(b.phone)+'</b>':'')((MOCK_ACCOUNT_MANAGER||{}).branch||{})}.<span class="xfee">Extra carrier charges (e.g. waiting time on site, a failed or re-delivery) may be added after delivery — HTT will update this order and let you know.</span>`:cancelHint()}</div>` : '') + (q.status==='Pending'||q.status==='Preparing'||q.status==='Ready' ? `<div class="demo" style="margin-top:16px;gap:8px">原型演示（正式版删除，由主系统更新）：${q.method==='Delivery'&&!q.booked?`<button type="button" class="btn-o sm" onclick="demoBook('${q.no}')">模拟：HTT 订好物流</button>`:''}<button type="button" class="btn-o sm" onclick="demoAdvance('${q.no}')">${q.status==='Pending'?'模拟：HTT 确认订单':q.status==='Preparing'?'模拟：备好货':'模拟：订单完成 → 生成发票'}</button></div>` : ''),
    top:(PAY_ST.includes(orderStage(q))?`<div class="holdbox cod pay"><b>Payment needed · ${money(calc(q).total)}</b><span>${q.method==='Pick up'?'Your order is ready. Pay by bank transfer, or at the counter when you pick up.':'HTT books your delivery once payment is received.'} Bank details are on your order and invoice.</span></div>`:'')+`<div class="otop"><span class="mtag">${q.method}</span>${orderSteps(q)}</div>${docLinks(q)}${q.po?`<div class="muted sm2" style="margin-top:4px">Your PO ${esc(q.po)}</div>`:''}`});
}
function invStatus(i){ return i.balance<=0?['Paid','b-completed']:i.overdue>0?[i.overdue+' days overdue','b-overdue']:['Outstanding','b-open']; }
function invoiceDetail(no){
  const i = docLookup(INVOICES, x=>x.no.toLowerCase()===no); if(!i) return notFound(); if(i.__deny) return denyPage(i.__deny);
  const [st,cls]=invStatus(i);
  const extra = `<div><span>Paid</span><b>${money(i.paid)}</b></div>
    ${i.credits.length?`<div><span>Credits Applied</span><b>${money(-i.credits.reduce((s,c)=>s+c.amt,0))}</b></div>`+i.credits.map(c=>`<div style="padding-top:0;font-size:11px"><a class="lnk" href="#/invoices/credits/${c.slug}">${c.no}</a><span class="muted">${money(-c.amt)}</span></div>`).join(''):''}
    <div class="t"><span>Balance Due</span><b>${money(i.balance)}</b></div>`;
  return docPage({top:docLinks(i), kind:'INVOICE',no:i.no,status:st.toUpperCase(),statusCls:cls,metaA:['Issued',i.issued],metaB:['Due',i.due],party:'Bill To',ref:null,lines:i.lines,freight:i.freight,extra,backHref:'#/invoices',backText:'Back to invoices'});
}
function creditDetail(slug){
  const c = docLookup(CREDITS, x=>x.slug===slug); if(!c) return notFound(); if(c.__deny) return denyPage(c.__deny);
  // 原站 Credit Note 详情页未截取，以下为按同款单据样式补的版面
  return `<div class="wrap"><a class="back" href="#/invoices?tab=credits">${ICON.back} Back to invoices</a>
  <div class="doc"><div class="top"><div><div class="lbl">CREDIT NOTE</div><h1>${c.no}</h1></div><div>${c.applyTo?'<span class="badge b-completed">Applied</span>':'<span class="badge b-open">Not yet applied</span>'}</div></div>
  <div class="meta"><div class="lbl">Issued<b style="color:var(--ink);font-size:13px">${c.issued}</b></div>
  <div class="lbl">Reason<b style="color:var(--ink);font-size:13px">${esc(c.reason||'-')}</b></div>
  <div class="lbl">Customer<b style="color:var(--ink);font-size:13px">${CUSTOMER.name}</b></div></div>
  <table class="lines" style="margin-top:18px"><thead><tr><th>Returned item</th><th style="text-align:right">Qty</th></tr></thead><tbody>${c.items.map(x=>`<tr><td>${esc(x.d)}</td><td style="text-align:right">${esc(x.q)}</td></tr>`).join('')}</tbody></table>
  <div class="totals"><div class="t"><span>Credit Amount (incl. GST)</span><b>${money(c.amt)}</b></div>
  <div><span>Applied to</span><b>${c.applyTo||'-'}</b></div></div></div></div>`;
}

function invoices(params){
  const T = params.get('tab')||'open';
  const tabs = `<a class="${T==='open'?'on':''}" href="#/invoices">Invoices</a><a class="${T==='credits'?'on':''}" href="#/invoices?tab=credits">Credit Notes</a><a class="${T==='closed'?'on':''}" href="#/invoices?tab=closed">Closed</a>
    <a href="#/invoices/statement" style="margin-left:auto;color:var(--green-700);font-weight:500;display:flex;gap:6px;align-items:center">${ICON.doc} Statement</a>`;
  const head = `<div class="page-head"><div class="wrap"><h1>Invoices</h1><p>View invoices, outstanding balances and return notes.</p></div></div>`;
  const R = pageRange(params);
  const ord = no => ORDERS.find(o=>o.no===no);
  const prodCell = i => { const o=i.orderNo?ord(i.orderNo):null;
    return `<td class="oprod">${esc(i.lines[0].d)}<div class="oqty">${[o&&o.po?`PO ${esc(o.po)}`:'', i.lines.length>1?`+${i.lines.length-1} more`:''].filter(Boolean).join(' · ')}</div></td>`; };
  /* 退货不一定有发票号，所以 Credit Note 显示退回的产品 + 原因，不显示来源发票 */
  const retCell = c => `<td class="oprod">${esc(c.items[0].d)} <span class="rq">× ${esc(c.items[0].q)}</span><div class="oqty">${[c.items.length>1?`+${c.items.length-1} more item${c.items.length>2?'s':''}`:'', esc(c.reason||'')].filter(Boolean).join(' · ')}</div></td>`;
  if(T==='credits'){
    /* Credit Notes 页签：只放还没抵扣的（客户还可以用的钱）；抵扣完的移到 Closed */
    const CR = CREDITS.filter(c=>!c.applyTo).sort((x,y)=>parseD(y.issued)-parseD(x.issued));
    const total = r2(CR.reduce((t,c)=>t+c.amt,0));
    return listPage({title:'Invoices',sub:'Credit notes not yet applied. HTT\'s system applies them to your invoices; applied ones move to Closed.',tabs,
      statsCls:'ostats cstats', tableCls:'compact otbl crtbl ctbl2',
      stats:stat('Credit available',money(total),'incl. GST · to be applied by HTT')+stat('Waiting to apply',CR.length,`credit note${CR.length!==1?'s':''} · HTT applies to your next invoice`)
        +`<a class="stat" href="#/invoices?tab=closed" style="display:block"><div class="k">Applied credit notes</div><div class="v">${CREDITS.filter(c=>c.applyTo).length}</div><div class="s">see them in Closed ›</div></a>`,
      placeholder:'Search credit note, product or reason...',filterOpts:['All'],
      cols:['Credit Note','Returned items','Issued','Credit amount (incl. GST)','Status',''],
      rows:CR.map(c=>`<tr class="click" onclick="go('#/invoices/credits/${c.slug}')">
        <td><div class="cid"><i class="cico cn"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 4L2.5 7.5 6 11"/><path d="M3 7.5h7a3.5 3.5 0 010 7H8"/></svg></i><div><b>${c.no}</b><span>Credit note</span></div></div></td>
        ${retCell(c)}<td>${c.issued}</td><td class="oamt cnamt">${money(c.amt)}</td>
        <td><span class="badge b-open">Not yet applied</span></td><td class="chev2">›</td></tr>`).join('')});
  }
  /* Invoices 页签：只放未付清的，不受日期筛选影响 */
  if(T==='closed'){
    /* Closed 页签：付清的发票 + 抵扣完的 Credit Note，同一个列表，按月份分组，按日期筛选 */
    dateBar(R,false);
    const ci = INVOICES.filter(i=>i.balance<=0 && inRange(i.issued,R));
    const cc = CREDITS.filter(c=>c.applyTo && inRange(c.issued,R));
    const items = [...ci.map(i=>({t:'Invoice', d:i.issued, i})), ...cc.map(c=>({t:'Credit note', d:c.issued, c}))].sort((x,y)=>parseD(y.d)-parseD(x.d));
    const totI = r2(ci.reduce((t,i)=>t+i.amount,0)), totC = r2(cc.reduce((t,c)=>t+c.amt,0));
    const MONF = d => { const x=parseD(d); return x.toLocaleDateString('en-AU',{month:'long',year:'numeric'}); };
    const icoDoc = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 1.5h6l3 3v10H4z"/><path d="M6.5 8h4M6.5 10.5h4"/></svg>';
    const icoRet = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 4L2.5 7.5 6 11"/><path d="M3 7.5h7a3.5 3.5 0 010 7H8"/></svg>';
    let rows='', curM='';
    items.forEach(x=>{
      const m = MONF(x.d);
      if(m!==curM){ curM=m; const mi=items.filter(y=>MONF(y.d)===m);
        const ma=r2(mi.filter(y=>y.t==='Invoice').reduce((t,y)=>t+y.i.amount,0)), mc=r2(mi.filter(y=>y.t!=='Invoice').reduce((t,y)=>t+y.c.amt,0));
        rows += `<tr class="monrow"><td colspan="6"><span>${m}</span><em>${(()=>{const ni=mi.filter(y=>y.t==='Invoice').length, nc=mi.length-ni; return [ni?`${ni} invoice${ni>1?'s':''} ${money(ma)}`:'', nc?`${nc} credit note${nc>1?'s':''} −${money(mc)}`:''].filter(Boolean).join(' · ');})()}</em></td></tr>`; }
      if(x.t==='Invoice'){ const i=x.i, cr=i.credits;
        rows += `<tr class="click" data-st="Invoices" onclick="go('#/invoices/${i.no.toLowerCase()}')">
          <td><div class="cid"><i class="cico inv">${icoDoc}</i><div><b>${i.no}</b><span>Invoice · ${i.issued}</span></div></div></td>
          ${prodCell(i)}
          <td class="oamt">${money(i.amount)}</td>
          <td><div class="settle">✓ Paid ${i.paidOn||''}</div>${cr.length?`<div class="oqty">incl. credit ${cr.map(c=>c.no).join(', ')}</div>`:''}</td>
          <td><span class="badge b-completed">Paid</span></td><td class="chev2">›</td></tr>`; }
      else { const c=x.c;
        rows += `<tr class="click" data-st="Credit notes" onclick="go('#/invoices/credits/${c.slug}')">
          <td><div class="cid"><i class="cico cn">${icoRet}</i><div><b>${c.no}</b><span>Credit note · ${c.issued}</span></div></div></td>
          ${retCell(c)}
          <td class="oamt cnamt">−${money(c.amt)}</td>
          <td><div class="settle">✓ Applied to <a class="lnk" href="#/invoices/${c.applyTo.toLowerCase()}" onclick="event.stopPropagation()">${c.applyTo}</a></div></td>
          <td><span class="badge b-completed">Applied</span></td><td class="chev2">›</td></tr>`; }
    });
    const seg = `<div class="seg" id="cseg">${[['All',items.length],['Invoices',ci.length],['Credit notes',cc.length]].map(([k,n],j)=>`<button class="${j?'':'on'}" onclick="segFilter(this,'${k}')">${k}<span>${n}</span></button>`).join('')}</div>`;
    return listPage({title:'Invoices',sub:'Fully paid invoices and applied credit notes, by month. Use the date at the top right to look back.',tabs,
      statsCls:'ostats cstats', tableCls:'compact otbl ctbl2',
      stats:stat('Closed invoices',money(totI),`${ci.length} invoice${ci.length!==1?'s':''} fully paid`)
        +stat('Credit notes applied',money(totC),`${cc.length} credit note${cc.length!==1?'s':''}`)
        +stat('Net paid',money(r2(totI-totC)),'invoices minus credit notes'),
      placeholder:'Search invoice, credit note, order or product...',filterOpts:['All','Invoices','Credit notes'],
      cols:['Document','Product / order','Amount (incl. GST)','Settled','Status',''],
      rows:rows})
      .replace('<select id="flt" onchange="filterList()" style="">', seg+'<select id="flt" onchange="filterList()" style="display:none">');
  }
  const unpaid = INVOICES.filter(i=>i.balance>0).sort((x,y)=>parseD(x.due)-parseD(y.due));
  const over = unpaid.filter(i=>i.overdue>0);
  const bucketOf = i => i.overdue<=0?'b0':i.overdue<=30?'b1':i.overdue<=60?'b2':i.overdue<=90?'b3':'b4';
  const B = [['b0','Current'],['b1','1–30 days'],['b2','31–60 days'],['b3','61–90 days'],['b4','90+ days']].map(([k,l])=>({k,l,amt:r2(unpaid.filter(i=>bucketOf(i)===k).reduce((t,i)=>t+i.balance,0))}));
  const totU = r2(unpaid.reduce((t,i)=>t+i.balance,0));
  const oldest = over.length ? Math.max(...over.map(i=>i.overdue)) : 0;
  const icoDoc = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 1.5h6l3 3v10H4z"/><path d="M6.5 8h4M6.5 10.5h4"/></svg>';
  const soon = unpaid.filter(i=>i.overdue<=0 && -i.overdue<=7);
  const overAmt = r2(over.reduce((t,i)=>t+i.balance,0));
  const rows = unpaid.map(i=>{
    const paidAmt = r2(i.amount-i.balance), due = -i.overdue, pct = Math.round(paidAmt/i.amount*100);
    const lvl = i.overdue>60?'o3':i.overdue>30?'o2':i.overdue>0?'o1':due<=7?'s1':'s0';
    const st = i.overdue>0 ? `<span class="badge b-overdue">${i.overdue} days overdue</span>`
      : `<span class="badge ${due<=7?'b-open':'b-cancelled'}">${due===0?'Due today':'Due in '+due+' day'+(due>1?'s':'')}</span>`;
    const dueNote = '';
    const tags = [i.overdue>0?'Overdue':'', i.overdue<=0&&due<=7?'Due soon':'', bucketOf(i)].filter(Boolean).join('|');
    return `<tr class="click ${lvl}" data-st="${tags}" onclick="go('#/invoices/${i.no.toLowerCase()}')">
      <td><div class="cid"><i class="cico inv">${icoDoc}</i><div><b>${i.no}</b><span>Issued ${i.issued}</span></div></div></td>
      ${prodCell(i)}
      <td class="dcol"><div>${i.due}</div><div class="idue ${i.overdue>0?'over':due<=7?'soon':''}">${i.overdue>0?`${i.overdue} days overdue`:due===0?'Due today':`Due in ${due} day${due>1?'s':''}`}</div></td>
      <td class="oamt" style="font-weight:500">${money(i.amount)}</td>
      <td class="pcol">${paidAmt?`<div class="pamt">${money(paidAmt)}<span>${pct}%</span></div><div class="pbar"><i style="width:${pct}%"></i></div><div class="oqty">${(()=>{const cn=i.credits.map(c=>`<a class="lnk" href="#/invoices/credits/${c.slug}" onclick="event.stopPropagation()">${c.no}</a>`).join(', ');
        return i.paid>0?(cn?'Part paid + '+cn:'Part paid'):'Credit '+cn;})()}</div>`:'<span class="nil">Not paid</span>'}</td>
      <td class="oamt bal">${money(i.balance)}</td><td class="chev2">›</td></tr>`;
  }).join('');
  const seg = `<div class="seg" id="iseg">${[['All',unpaid.length],['Overdue',over.length],['Due soon',soon.length]].map(([k,n],j)=>`<button class="${j?'':'on'}" onclick="segFilter(this,'${k}');document.querySelectorAll('.agep .ab').forEach(b=>b.classList.remove('on'))">${k}<span>${n}</span></button>`).join('')}</div>`;
  const aging = `<div class="agep"><div class="agehd"><b>Ageing</b><span>How long your balance has been overdue · click a period to filter</span></div>
    <div class="abar">${B.filter(x=>x.amt>0).map(x=>`<i class="${x.k}" style="flex:${x.amt}" title="${x.l} ${money(x.amt)}"></i>`).join('')||'<i class="b0" style="flex:1"></i>'}</div>
    <div class="acols">${B.map(x=>{const n=unpaid.filter(i=>bucketOf(i)===x.k).length; return `<button class="ab ${x.k} ${x.amt?'':'zero'}" ${x.amt?`onclick="ageFilter('${x.k}',this)"`:'disabled'}><span><i></i>${x.l}</span><b>${money(x.amt)}</b><em>${n?`${n} invoice${n>1?'s':''} · ${Math.round(x.amt/totU*100)}%`:'—'}</em></button>`;}).join('')}</div></div>`;
  return listPage({title:'Invoices',sub:'Your unpaid invoices, oldest due first. Fully paid invoices move to Closed.',tabs,
    statsCls:'ostats istats', tableCls:'compact otbl itbl ctbl2 it2',
    stats:stat('Balance due',money(totU),`${unpaid.length} unpaid invoice${unpaid.length!==1?'s':''}${unappliedAmt?` · ${money(r2(totU-unappliedAmt))} after credit`:''}`)
      +stat('Overdue',money(overAmt),over.length?(over.length===unpaid.length?`all ${over.length} invoices · oldest ${oldest} days`:`${over.length} of ${unpaid.length} invoices · oldest ${oldest} days`):'nothing overdue',over.length?'alert':'')
      +`<a class="stat" href="#/invoices?tab=credits" style="display:block"><div class="k">Credit available</div><div class="v">${money(unappliedAmt)}</div><div class="s">${unapplied.length} credit note${unapplied.length!==1?'s':''} · HTT applies to your invoices ›</div></a>`,
    placeholder:'Search invoice, order, PO or product...',filterOpts:['All','Overdue','Due soon'],
    cols:['Invoice','Product','Due date','Inc GST','Paid','Balance',''], colw:['20%','','15%','13%','16%','13%','44px'],
    rows})
    .replace('<div class="searchbar">', aging+'<div class="searchbar">')
    .replace('<select id="flt" onchange="filterList()" style="">', seg+'<select id="flt" onchange="filterList()" style="display:none">');
}
/* 账龄条：点一段只看那一段的发票 */
function ageFilter(k, btn){
  const on = !btn.classList.contains('on');
  document.querySelectorAll('.agep .ab').forEach(b=>b.classList.remove('on'));
  if(on) btn.classList.add('on');
  document.getElementById('flt').value = 'All';
  document.querySelectorAll('#iseg button').forEach((b,j)=>b.classList.toggle('on', j===0));
  document.querySelectorAll('#lst tbody tr').forEach(tr=>{ tr.dataset.f = (!on || (tr.dataset.st||'').split('|').includes(k)) ? '1':'0'; });
  pager('lst',1);
}

/* 对账单（Statement）—— 未结清明细：未付发票 + 未使用的 Credit Note
   IT: GET /api/portal/me/statement?asAt=YYYY-MM-DD （或按月：?month=2026-10），可另提供后端生成的 PDF：/statement.pdf */
async function statement(params){
  const sm = await portalApi.getAccountSummary();
  const rows = [
    ...INVOICES.filter(i=>i.balance>0).map(i=>({date:i.issued, type:'Invoice', ref:i.no, link:'#/invoices/'+i.no.toLowerCase(), due:i.due, amt:i.amount, bal:i.balance, over:i.overdue})),
    ...unapplied.map(c=>({date:c.issued, type:'Credit note', ref:c.no, link:'#/invoices/credits/'+c.slug, due:'-', amt:-c.amt, bal:-c.amt, over:0})),
  ].sort((a,b)=>parseD(a.date)-parseD(b.date));
  const bucket = (lo,hi)=>r2(INVOICES.filter(i=>i.balance>0&&i.overdue>=lo&&i.overdue<=hi).reduce((s,i)=>s+i.balance,0));
  const net = r2(outstanding - unappliedAmt);
  const months = ['2026-11','2026-10','2026-09','2026-08'];
  return `<div class="wrap"><a class="back" href="#/invoices">${ICON.back} Back to invoices</a>
  <div class="doc">
    <div class="top"><div><div class="lbl">STATEMENT</div><h1>Account Statement</h1></div>
      <div style="text-align:right"><select class="sel" onchange="toast('原型：历史月份对账单待接系统')"><option>As at 18 Nov 2026</option>${months.slice(1).map(m=>`<option>Month end ${m}</option>`).join('')}</select></div></div>
    <div class="meta"><div class="lbl">Customer ID<b style="color:var(--ink);font-size:13px">${esc(sm.customerId)}</b></div>
      <div class="lbl">Payment terms<b style="color:var(--ink);font-size:13px">${esc(sm.paymentTerms.code.replace('NET','Net '))}</b></div>
      <div class="lbl">Customer<b style="color:var(--ink);font-size:13px">${CUSTOMER.name}</b><div style="color:var(--ink);font-size:13px;margin-top:6px">${fmtAddr(sm.addresses.billing)}</div></div></div>
    <table><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th>Due</th><th>Amount</th><th>Balance</th><th></th></tr></thead>
    <tbody>${rows.map(r=>`<tr><td>${r.date}</td><td>${r.type}</td><td><a class="lnk" href="${r.link}">${r.ref}</a></td><td>${r.due}</td><td>${money(r.amt)}</td><td>${money(r.bal)}</td><td>${r.over>0?`<span class="badge b-overdue">${r.over} days overdue</span>`:''}</td></tr>`).join('')}</tbody></table>
    <div class="aging" style="margin:22px 0 0"><div>Current<b>${money(bucket(-99999,0))}</b></div><div>1–30 days<b>${money(bucket(1,30))}</b></div><div>31–60 days<b>${money(bucket(31,60))}</b></div><div>61–90 days<b>${money(bucket(61,90))}</b></div><div>90+ days<b>${money(bucket(91,99999))}</b></div></div>
    <div class="totals">
      <div><span>Invoices outstanding</span><b>${money(outstanding)}</b></div>
      <div><span>Unapplied credits</span><b>${money(-unappliedAmt)}</b></div>
      <div class="t"><span>Net balance</span><b>${money(net)}</b></div></div>
    <p class="muted" style="font-size:11px;margin-top:22px">Amounts in AUD including GST. Unapplied credits will reduce your balance once applied to an invoice.</p>
    <div style="text-align:right;margin-top:18px"><button class="btn" onclick="printDoc()">${ICON.dl} Print / Save PDF</button></div>
  </div></div>`;
}

/* =====================================================================
   产品销售（客户从 HTT 买了多少）：类别 → 系列 → 颜色
   IT: GET /api/portal/me/product-sales?period=d30|d90|fytd
       → [{seriesId, name, category, unit, colours:[{productId, colour, code, qty, boxes, amount, prevQty, prevAmount}]}]
   口径：已开票数量，扣除已确认退货；金额不含 GST；期间按系统日期计算。
   以下数字为示例数据（Quercus 系列为示例，现有产品资料中没有）。
   ===================================================================== */
// 时间段：按系统日期计算。比较期 = 前一段同样长度；财年类 = 去年同期
const ISO = d => d.toISOString().slice(0,10);
const addDays = (d,n) => { const x=new Date(d); x.setUTCDate(x.getUTCDate()+n); return x; };
const SYS = new Date(SYSTEM_INFO.systemDate+'T00:00:00Z');
/* 送货 / 提货日期规则（主系统提供）：不能选当天、周末、公众假期；过了当天截单时间（14:00），下一个工作日也不能选。
   IT：假期表和截单时间请从主系统读取（GET /api/portal/delivery-calendar），以下为 VIC 示例 */
const CUTOFF = '14:00', NOW_HM = (SYSTEM_INFO.syncedAt||'').slice(11,16) || '11:40';
const HOLIDAYS = {'2026-12-25':'Christmas Day','2026-12-28':'Boxing Day (observed)','2027-01-01':"New Year's Day",'2027-01-26':'Australia Day','2027-03-08':'Labour Day','2027-03-26':'Good Friday','2027-03-27':'Easter Saturday','2027-03-28':'Easter Sunday','2027-03-29':'Easter Monday','2027-06-14':"King's Birthday"};
const isoAdd = (iso,n) => ISO(addDays(new Date(iso+'T00:00:00Z'),n));
const bizDay = iso => { const d=new Date(iso+'T00:00:00Z').getUTCDay(); return d!==0 && d!==6 && !HOLIDAYS[iso]; };
const nextBiz = iso => { let x=iso; while(!bizDay(x)) x=isoAdd(x,1); return x; };
function earliestDate(m){ return m==='Pick up' ? nextBiz(SYSTEM_INFO.systemDate) : nextBiz(isoAdd(SYSTEM_INFO.systemDate,1)); }   // 自提可以当天；送货最早下一个工作日。截单时间只提醒，不挡日期
const dateOk = (iso,m) => !!iso && iso>=earliestDate(m) && bizDay(iso);
const fixDate = (iso,m) => nextBiz(!iso||iso<earliestDate(m) ? earliestDate(m) : iso);
const defDate = m => m==='Pick up' ? earliestDate(m) : nextBiz(isoAdd(earliestDate(m),2));
function whyMoved(iso,m){ const d=new Date(iso+'T00:00:00Z').getUTCDay(); return HOLIDAYS[iso]?HOLIDAYS[iso]+' is a public holiday':(d===0||d===6)?'weekends aren\'t available':iso<earliestDate(m)?`the earliest date is ${fmtDay(earliestDate(m))}`:''; }
function dateIn(el,m){ if(!m){ const f=el.form; m = f&&f.classList.contains('pu') ? 'Pick up' : (f&&f.querySelector('[name=method]')?'Delivery':DRAFT.method); }
  const v=el.value, f=fixDate(v,m); if(v!==f){ el.value=f; toast(`${whyMoved(v,m)||'That date isn\'t available'} — moved to ${fmtDay(f)}`); } return f; }
const cutTxt = () => { const h=+CUTOFF.slice(0,2); return `${h>12?h-12:h}${h>=12?'pm':'am'}`; };
const dateHint = m => m==='Pick up'
  ? `<span class="dhint">Pick up Mon–Fri ${((MOCK_ACCOUNT_MANAGER||{}).branch||{}).hours?.replace(/^Mon–Fri\s*/,'')||''}.</span>`
  : `<span class="dhint">Delivery: no same day, weekends or public holidays. Orders after ${cutTxt()} are processed the next business day.</span>`;
const FY_START = y => new Date(Date.UTC(y,6,1));
const curFY = SYS.getUTCMonth()>=6 ? SYS.getUTCFullYear() : SYS.getUTCFullYear()-1;
const DEFAULT_PRESET = 'm0';
// 每个页面的默认时段（Inventory 不用日期）
const PAGE_DEFAULT = {sales:'m0', dashboard:'m0', quotes:'fytd', orders:'fytd', invoices:'fytd', rebates:'fytd'};
const curPage = () => (location.hash.replace(/^#\/?/,'').split('?')[0].split('/')[0]) || 'dashboard';
const defPreset = () => PAGE_DEFAULT[curPage()] || DEFAULT_PRESET;
// 单据日期（'09 Nov 2026'）是否在所选时段内
const pad2 = n => String(n).padStart(2,'0');
function inRange(str, R){ const d=parseD(str), iso=`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; return iso>=ISO(R.from) && iso<=ISO(R.to); }
const SALES_PRESETS = {
  today:{label:'Today',              from:SYS, to:SYS},
  yday: {label:'Yesterday',          from:addDays(SYS,-1), to:addDays(SYS,-1)},
  m0:  {label:'This month',          from:new Date(Date.UTC(SYS.getUTCFullYear(),SYS.getUTCMonth(),1)), to:SYS},
  m1:  {label:'Last month',          from:new Date(Date.UTC(SYS.getUTCFullYear(),SYS.getUTCMonth()-1,1)), to:new Date(Date.UTC(SYS.getUTCFullYear(),SYS.getUTCMonth(),0))},
  fytd:{label:'This financial year', from:FY_START(curFY), to:SYS, yoy:true},
  lfy: {label:'Last financial year', from:FY_START(curFY-1), to:addDays(FY_START(curFY),-1), yoy:true},
};
function salesRange(params){
  const key = params.get('p') || defPreset();
  if(key==='custom'){
    let f=new Date((params.get('from')||'')+'T00:00:00Z'), t=new Date((params.get('to')||'')+'T00:00:00Z');
    if(isNaN(f)||isNaN(t)) return salesRange(new URLSearchParams());
    if(t>SYS) t=SYS; if(f>t) [f,t]=[t,f];
    return withPrev({key, label:'Custom', from:f, to:t, yoy:params.get('cmp')==='ly'});
  }
  const p = SALES_PRESETS[key] || SALES_PRESETS[defPreset()];
  return withPrev({key:SALES_PRESETS[key]?key:defPreset(), ...p, ...(params.get('cmp')==='ly'?{yoy:true}:{})});
}
function withPrev(r){
  r.days = Math.round((r.to-r.from)/864e5)+1;
  if(r.yoy){ r.pFrom=new Date(r.from); r.pFrom.setUTCFullYear(r.from.getUTCFullYear()-1); r.pTo=new Date(r.to); r.pTo.setUTCFullYear(r.to.getUTCFullYear()-1); }
  else if(r.key==='m0'){   // 本月至今 → 跟上个月同一段比（1–18 Nov vs 1–18 Oct）
    r.pFrom=new Date(Date.UTC(r.from.getUTCFullYear(), r.from.getUTCMonth()-1, 1));
    const last=new Date(Date.UTC(r.from.getUTCFullYear(), r.from.getUTCMonth(), 0)).getUTCDate();
    r.pTo=new Date(Date.UTC(r.pFrom.getUTCFullYear(), r.pFrom.getUTCMonth(), Math.min(r.to.getUTCDate(), last))); }
  else if(r.key==='m1'){   // 上个月 → 跟再上一个月整月比
    r.pFrom=new Date(Date.UTC(r.from.getUTCFullYear(), r.from.getUTCMonth()-1, 1)); r.pTo=addDays(r.from,-1); }
  else { r.pTo=addDays(r.from,-1); r.pFrom=addDays(r.pTo,-(r.days-1)); }
  return r;
}
const fmtD = d => d.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const SALES_SERIES = [
  /* type = 二级目录（地板：Plank / Herringbone / Chevron；辅料：按产品类型） */
  {id:'bonita', type:'Plank', name:'Bonita', cat:'Engineered Timber', unit:'m²', box:2.166, price:72,
   colours:PRODUCTS.filter(p=>p.series==='bonita').map(p=>({id:p.id, colour:p.colour, code:p.code}))},
  {id:'quercus', type:'Herringbone', name:'Quercus', cat:'Engineered Timber', unit:'m²', box:1.86, price:89,
   colours:['Natural','Coastal','Sandstone','Driftwood','Honey','Smoke','Chalk','Walnut','Grey Mist','Espresso'].map((c,i)=>({colour:c, code:'Q-'+(i+1)}))},
  {id:'heritage', type:'Chevron', name:'Heritage', cat:'Engineered Timber', unit:'m²', box:2.0, price:95, colours:[{colour:'Rustic Oak', code:'HER-008'}]},
  {id:'guardian', type:'Plank', name:'Guardian', cat:'Hybrid', unit:'m²', box:2.503, price:47.5, colours:[]},
  {id:'terra', type:'Herringbone', name:'Terra', cat:'Hybrid', unit:'m²', box:1.51, price:56, colours:[]},
  {id:'aquaglow', type:'Plank', name:'AquaGlow', cat:'Laminate', unit:'m²', box:1.93, price:44, colours:[]},
  {id:'nordic', type:'Chevron', name:'Nordic', cat:'Laminate', unit:'m²', box:1.44, price:48, colours:[]},
  {id:'scotia', type:'Scotia', name:'Scotia', cat:'Accessories', unit:'pcs', price:9.5, colours:['WF807','D3005','WF806','A108','A113','WF08','WF801','A115'].map(c=>({colour:c, code:c}))},
  {id:'stair-nose', type:'Stair Nose', name:'Stair Nose', cat:'Accessories', unit:'pcs', price:38, colours:['Natural Oak','Latte Oak','Lime Wash','Grey Wash','Brescia','White Oak','Cuban','Cotton Oak','Smoked Brown'].map(c=>({colour:c, code:'SN-'+c.split(' ').map(w=>w[0]).join('')}))},
  {id:'trims', type:'Trims', name:'Trims', cat:'Accessories', unit:'pcs', price:14, colours:['Blackbutt','HBY-W019','Cream','HBY-W024','Black','D3015','HBY-004'].map(c=>({colour:c, code:c}))},
];
SALES_SERIES.forEach(x=>{ if(!x.colours.length) x.colours = PRODUCTS.filter(p=>p.series===x.id).map(p=>({id:p.id, colour:p.colour, code:p.code})); });
// 示例数字：用固定种子生成，每次打开都一样
function seeded(str){ let h=2166136261; for(const ch of str){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return ((h>>>0)%10000)/10000; }
function salesQty(ser, col, R, which){
  const sk = STORE==='all' ? 1 : (STORE_K[STORE]||0.5);
  if(col.id==='bonita-natural-oak'){ const fixed={d30:[0,168.95], d90:[655.40,892.10]}; if(fixed[R.key]) return r2(fixed[R.key][which==='cur'?0:1]*sk); }
  const tag = ISO(R.from)+ISO(R.to);
  const r = seeded(ser.id+col.colour+tag), z = seeded(ser.id+col.colour+'z');
  if(z<0.12) return 0;                                  // 有些颜色这期没买
  const base = ser.unit==='m²' ? 25+r*140 : ser.unit==='pcs' ? 6+r*60 : 4+r*30;
  const v = sk*base*(R.days/30)*(which==='prev' ? 0.7+seeded(ser.id+col.colour+tag+'p')*0.6 : 1);
  return ser.unit==='m²' ? r2(v) : Math.round(v);
}
/* 两页数字对得上：返利产品在返利期间内的数量，用同一份数据（已开票 − 退货）。正式版两页都读主系统同一个来源 */
function rebateQtyOverride(ser, per){
  const f=ISO(per.from), t=ISO(per.to);
  for(const p of REBATE_PROGRAMS){ if(p.seriesId!==ser.id) continue;
    const ct = p.cur.to < SYSTEM_INFO.systemDate ? p.cur.to : SYSTEM_INFO.systemDate;
    if(f===p.cur.from && t===ct) return {inv:p.cur.invoiced, ret:p.cur.returned}; }
  for(const r of (typeof rebateRows==='function'?rebateRows():[])){ if(r.seriesId===ser.id && r.from===f && r.to===t) return {inv:r.qty, ret:0}; }
  return null;
}
function buildSales(per){
  return SALES_SERIES.map(ser=>{
    const cols = ser.colours.map(c=>{
      /* 口径：按已开票数量，减掉退货（Credit Note）；金额含 GST。示例：price 为不含 GST 单价 ×1.1 */
      const inv=salesQty(ser,c,per,'cur'), prevInv=salesQty(ser,c,per,'prev');
      const rr=seeded(ser.id+c.colour+ISO(per.from)+'r'), retQ = inv && rr<0.25 ? (ser.unit==='m²'?r2(inv*(0.04+rr*0.3)):Math.max(1,Math.round(inv*0.1))) : 0;
      const qty=r2(inv-retQ), prev=prevInv;
      const lastD = inv ? addDays(per.to, -Math.floor(seeded(ser.id+c.colour+ISO(per.to)+'l')*Math.min(per.days,20))) : null;
      return {...c, qty, prev, ret:retQ, retAmount:r2(retQ*ser.price*1.1), amount:r2(qty*ser.price*1.1), prevAmount:r2(prev*ser.price*1.1),
        boxes: ser.box?Math.round(qty/ser.box):null, last:lastD};
    });
    /* 有返利的系列：系列合计用返利同一份数字（各颜色按比例分配），两页对得上 */
    const ov0 = rebateQtyOverride(ser, per), sk2 = STORE==='all' ? 1 : (STORE_K[STORE]||0.5), ov = ov0 ? {inv:r2(ov0.inv*sk2), ret:r2(ov0.ret*sk2)} : null;   // 门店视图：同一份数字按门店比例，跟 Deal 页「这家店贡献」对得上
    if(ov){ const tot=cols.reduce((t,c)=>t+c.qty+c.ret,0)||1, fi=ov.inv/tot;
      cols.forEach(c=>{ const inv=(c.qty+c.ret); c.ret=r2(ov.ret*inv/tot); c.qty=r2(inv*fi-c.ret); c.prev=r2(c.prev*fi);
        c.amount=r2(c.qty*ser.price*1.1); c.prevAmount=r2(c.prev*ser.price*1.1); c.retAmount=r2(c.ret*ser.price*1.1); c.boxes=ser.box?Math.round(c.qty/ser.box):null; });
      const big=cols.reduce((m,c)=>c.qty>m.qty?c:m,cols[0]), diff=r2((ov.inv-ov.ret)-cols.reduce((t,c)=>t+c.qty,0));   // 补齐四舍五入差
      big.qty=r2(big.qty+diff); big.amount=r2(big.qty*ser.price*1.1); }
    cols.sort((a,b)=>b.amount-a.amount);
    const sum=k=>r2(cols.reduce((t,c)=>t+c[k],0));
    return {...ser, cols, qty:sum('qty'), prev:sum('prev'), amount:sum('amount'), prevAmount:sum('prevAmount'), retAmount:sum('retAmount'), boxes: ser.box?cols.reduce((t,c)=>t+c.boxes,0):null};
  });
}
const fmtQty = (v,u) => u==='m²' ? `${v.toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2})} m²` : `${v.toLocaleString('en-AU')} ${u}`;
function trendCell(cur, prev, min){
  if(!cur && !prev) return '<span class="muted">–</span>';
  if(min && Math.max(cur,prev)<min) return '<span class="muted" title="Too small to compare">–</span>';
  if(!prev) return '<span class="trend up">New</span>';
  const p = (cur-prev)/prev*100;
  return `<span class="trend ${p>=0?'up':'down'}">${p>=0?'▲':'▼'} ${Math.abs(p).toFixed(1)}%</span>`;
}
function setRange(params, kv){ const p=new URLSearchParams(params); ['p','from','to'].forEach(k=>p.delete(k)); Object.entries(kv).forEach(([k,v])=>{ if(v && !(k==='p'&&v===defPreset())) p.set(k,v); }); return '#/'+curPage()+'?'+p; }
const pageRange = salesRange;
// 日期选择：统一放在页头右上角。页面调用 dateBar() 只是登记本页的时段，由 addSysDate() 画在页头
let PAGE_RANGE = null;
function dateBar(R, compare){ PAGE_RANGE = {R, compare}; return ''; }
function applyRange(f){
  const from=f.from.value, to=f.to.value; if(!from||!to) return;
  const params = new URLSearchParams(location.hash.split('?')[1]||'');
  go(setRange(params,{p:'custom', from, to}));
}
/* 日期范围选择器：左边常用时段，右边两个月日历；系统日期之后不可选 */
const DP_MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dpShort = (f,t) => { const a=`${f.getUTCDate()} ${MON3s(f)}`, b=`${t.getUTCDate()} ${MON3s(t)} ${t.getUTCFullYear()}`;
  return ISO(f)===ISO(t) ? b : (f.getUTCFullYear()===t.getUTCFullYear() ? `${a} – ${b}` : `${a} ${f.getUTCFullYear()} – ${b}`); };
function MON3s(d){ return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]; }
let DP = null;
function openDP(key, from, to){
  const f=new Date(from+'T00:00:00Z'), t=new Date(to+'T00:00:00Z');
  let left = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth()-1, 1));
  DP = {key, start:f, end:t, left};
  renderDP(); document.getElementById('dp').classList.add('open');
  setTimeout(()=>document.addEventListener('click', closeDP, {once:true}), 0);
}
function closeDP(){ const el=document.getElementById('dp'); if(el) el.classList.remove('open'); DP=null; }
function dpMonth(m){
  const y=m.getUTCFullYear(), mo=m.getUTCMonth(), first=new Date(Date.UTC(y,mo,1)), days=new Date(Date.UTC(y,mo+1,0)).getUTCDate();
  const lead=(first.getUTCDay()+6)%7, cells=[];
  for(let i=0;i<lead;i++) cells.push('<span></span>');
  for(let d=1; d<=days; d++){
    const dt=new Date(Date.UTC(y,mo,d)), iso=ISO(dt), fut=dt>SYS;
    const s=DP.start, e=DP.end||DP.start;
    const inR = s && dt>=s && dt<=e, isS = s && iso===ISO(s), isE = DP.end && iso===ISO(DP.end);
    const cls = [fut?'fut':'', inR?'in':'', isS?'s':'', isE?'e':'', iso===SYSTEM_INFO.systemDate?'today':''].join(' ');
    cells.push(fut ? `<span class="d ${cls}">${d}</span>` : `<button class="d ${cls}" onclick="dpPick('${iso}')">${d}</button>`);
  }
  const years=[]; for(let yy=SYS.getUTCFullYear()-4; yy<=SYS.getUTCFullYear(); yy++) years.push(yy);
  return {y, mo, years, grid:cells.join('')};
}
function renderDP(){
  const el=document.getElementById('dp'); if(!el||!DP) return;
  const L=DP.left, R=new Date(Date.UTC(L.getUTCFullYear(), L.getUTCMonth()+1, 1));
  const canNext = R < new Date(Date.UTC(SYS.getUTCFullYear(), SYS.getUTCMonth(), 1));
  const cal = (m, side) => { const c=dpMonth(m); return `<div class="dpcal">
      <div class="dphead">${side==='L'?`<button class="dpnav" onclick="dpShift(-1)" aria-label="Previous month">‹</button>`:''}
        <select onchange="dpSet('${side}',this.value,null)">${DP_MON.map((n,i)=>`<option value="${i}" ${i===c.mo?'selected':''}>${n}</option>`).join('')}</select>
        <select onchange="dpSet('${side}',null,this.value)">${c.years.map(yy=>`<option ${yy===c.y?'selected':''}>${yy}</option>`).join('')}</select>
        ${side==='R'?`<button class="dpnav" ${canNext?'':'disabled'} onclick="dpShift(1)" aria-label="Next month">›</button>`:''}</div>
      <div class="dpdow">${['Mo','Tu','We','Th','Fr','Sa','Su'].map(x=>`<span>${x}</span>`).join('')}</div>
      <div class="dpgrid">${c.grid}</div></div>`; };
  const label = DP.key==='custom' ? 'Custom' : SALES_PRESETS[DP.key].label;
  const sum = DP.end ? dpShort(DP.start, DP.end) : `${dpShort(DP.start,DP.start)} – pick an end date`;
  el.innerHTML = `<div class="dpbody">
      <div class="dpside">${Object.entries(SALES_PRESETS).map(([k,v])=>`<button class="${k===DP.key?'on':''}" onclick="dpPreset('${k}')">${v.label}</button>`).join('')}
        <hr><button class="${DP.key==='custom'?'on':''}" onclick="DP.key='custom';renderDP()">Custom</button></div>
      <div class="dpcals">${cal(L,'L')}${cal(R,'R')}</div></div>
    <div class="dpfoot"><div><b>${label}</b> <span class="muted">· ${sum}</span></div>
      <div style="display:flex;gap:10px"><button class="btn-o sm" onclick="closeDP()">Cancel</button><button class="btn sm" ${DP.end?'':'disabled'} onclick="dpApply()">Apply</button></div></div>`;
}
function dpShift(n){ DP.left = new Date(Date.UTC(DP.left.getUTCFullYear(), DP.left.getUTCMonth()+n, 1)); renderDP(); }
function dpSet(side, mo, yr){
  const base = side==='L' ? DP.left : new Date(Date.UTC(DP.left.getUTCFullYear(), DP.left.getUTCMonth()+1, 1));
  const y = yr!=null ? +yr : base.getUTCFullYear(), m = mo!=null ? +mo : base.getUTCMonth();
  let L = new Date(Date.UTC(y, m - (side==='R'?1:0), 1));
  const maxL = new Date(Date.UTC(SYS.getUTCFullYear(), SYS.getUTCMonth()-1, 1)); if(L>maxL) L=maxL;
  DP.left = L; renderDP();
}
function dpPreset(k){ const p=SALES_PRESETS[k]; DP.key=k; DP.start=p.from; DP.end=p.to; DP.left=new Date(Date.UTC(p.to.getUTCFullYear(), p.to.getUTCMonth()-1, 1)); renderDP(); }
function dpPick(iso){
  const d=new Date(iso+'T00:00:00Z'); DP.key='custom';
  if(!DP.start || DP.end){ DP.start=d; DP.end=null; }
  else if(d<DP.start){ DP.end=DP.start; DP.start=d; }
  else DP.end=d;
  renderDP();
}
function dpApply(){
  if(!DP || !DP.end) return;
  const params = new URLSearchParams(location.hash.split('?')[1]||'');
  const h = DP.key!=='custom' ? setRange(params,{p:DP.key}) : setRange(params,{p:'custom', from:ISO(DP.start), to:ISO(DP.end)});
  closeDP(); go(h);
}
function toggleSeries(id){
  const row=document.querySelector(`tr.srow[data-id="${id}"]`), open=!row.classList.contains('open');
  row.classList.toggle('open',open);
  document.querySelectorAll(`tr.crow[data-p="${id}"]`).forEach(r=>r.style.display=open?'':'none');
}
/* 12 个月采购走势：每个月按同样口径（已开票 − 退货，含 GST）；ly = 去年同月 */
/* 对比产品：key = 's:系列id' 或 'c:系列id~颜色' */
function cpLookup(B, key){
  const [t, rest] = [key.slice(0,1), key.slice(2)];
  if(t==='s'){ const s=B.find(x=>x.id===rest); return s?{amt:s.amount, qty:s.qty}:{amt:0,qty:0}; }
  const [sid, col] = rest.split('~'), s=B.find(x=>x.id===sid), c=s&&s.cols.find(x=>x.colour===col);
  return c?{amt:c.amount, qty:c.qty}:{amt:0,qty:0};
}
function cpName(key){
  const rest=key.slice(2);
  if(key[0]==='s'){ const s=SALES_SERIES.find(x=>x.id===rest); return s?s.name+' series':key; }
  const [sid,col]=rest.split('~'), s=SALES_SERIES.find(x=>x.id===sid); return s?`${s.name} ${col}`:key;
}
function salesTrend(R, cps, keep){
  cps = cps||[]; keep = keep||(()=>true);
  const out=[], per=(f,t,k)=>({key:k, from:f, to:t, days:Math.round((t-f)/864e5)+1}), monAmt=(f,t,k)=>r2(buildSales(per(f,t,k)).filter(keep).reduce((x,y)=>x+y.amount,0));
  for(let i=11;i>=0;i--){
    const f=new Date(Date.UTC(SYS.getUTCFullYear(), SYS.getUTCMonth()-i, 1));
    let t=new Date(Date.UTC(f.getUTCFullYear(), f.getUTCMonth()+1, 0)); const part = t>SYS; if(part) t=SYS;
    const lf=new Date(Date.UTC(f.getUTCFullYear()-1, f.getUTCMonth(), 1)), lt=new Date(Date.UTC(t.getUTCFullYear()-1, t.getUTCMonth(), t.getUTCDate()));
    const B = buildSales(per(f,t,'mon'+i));
    const amt = cps.length ? cpLookup(B,cps[0]).amt : r2(B.filter(keep).reduce((x,y)=>x+y.amount,0));
    const ly = cps.length ? cpLookup(buildSales(per(lf,lt,'ly'+i)),cps[0]).amt : monAmt(lf,lt,'ly'+i);
    out.push({f, t, part, amt, ly, sel: f<=R.to && t>=R.from});
  }
  return out;
}
const ICON_TREND = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M1.5 10l3.5-3.5 2.5 2.5 4.5-5"/><path d="M9 4h3v3"/></svg>';
const CP_COL = ['#1a6e4a','#2d6fb8','#d08a1e'];
function productChart(T, params, cps){
  const W=1160, H=190, L=52, top=26, bw=(W-L)/12;
  const raw=Math.max(1,...T.flatMap(x=>x.cp));
  const step=[1000,2000,5000,10000,20000,25000,50000,100000].find(st=>raw/st<=4.2)||100000, max=Math.ceil(raw/step)*step;
  const y=v=>top+(H-top)*(1-v/max), X=i=>L+i*bw+bw/2;
  const k=v=>!PRICE_ON?LOCK:v>=1000?'$'+(v/1000).toFixed(v>=10000?0:1)+'k':'$'+Math.round(v);
  const ticks=[]; for(let v=0; v<=max; v+=step) ticks.push(v);
  const ix=T.map((x,i)=>x.sel?i:-1).filter(i=>i>=0);
  return `<svg viewBox="0 0 ${W} ${H+44}" class="tchart">
    ${ix.length?`<rect x="${L+ix[0]*bw+2}" y="4" width="${(ix[ix.length-1]-ix[0]+1)*bw-4}" height="${H+36}" rx="6" class="selband"/>`:''}
    ${ticks.map(v=>`<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="tg ${v?'':'base'}"/><text x="${L-10}" y="${y(v)+4}" class="tgl" text-anchor="end">${k(v)}</text>`).join('')}
    ${cps.map((key,j)=>{ const pts=T.map((x,i)=>`${X(i)},${y(x.cp[j])}`).join(' ');
      return `<polyline points="${pts}" fill="none" stroke="${CP_COL[j]}" stroke-width="2.4" stroke-linejoin="round"/>
        ${T.map((x,i)=>`<circle cx="${X(i)}" cy="${y(x.cp[j])}" r="${x.part?3.5:4}" fill="${x.part?'#fff':CP_COL[j]}" stroke="${CP_COL[j]}" stroke-width="2"/>`).join('')}`; }).join('')}
    ${T.map((x,i)=>{ const href=setRange(params,{p:'custom', from:ISO(x.f), to:ISO(x.t)});
      const mon=x.f.toLocaleDateString('en-AU',{month:'long',year:'numeric',timeZone:'UTC'});
      return `<a href="${href}"><g class="tb"><title>${mon}${x.part?' (1–'+x.t.getUTCDate()+')':''}
${cps.map((c,j)=>`${cpName(c)}: ${money(x.cp[j])}`).join('\n')}</title>
        <rect x="${L+i*bw}" y="0" width="${bw}" height="${H+44}" class="hit"/>
        <text x="${X(i)}" y="${H+18}" class="tx ${x.sel?'on':''}">${MON3s(x.f)}${x.f.getUTCMonth()===0||i===0?' '+String(x.f.getUTCFullYear()).slice(2):''}</text>
        ${x.part?`<text x="${X(i)}" y="${H+32}" class="tx2">to ${x.t.getUTCDate()} ${MON3s(x.t)}</text>`:''}</g></a>`; }).join('')}
  </svg>`;
}
function cpPickCat(c){ const s=SALES_SERIES.find(x=>x.cat===c); if(s) cpOnly('s:'+s.id); }
function cpOnly(key){ cpSet([key]); setTimeout(()=>{ const el=document.querySelector('.trendcard'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); },60); }
function cpSet(list){ const p=new URLSearchParams(location.hash.split('?')[1]||''); list.length?p.set('cp',list.join(',')):p.delete('cp'); go('#/sales?'+p); }
function cpAdd(sel){ const v=sel.value; if(!v) return; const p=new URLSearchParams(location.hash.split('?')[1]||''); const cur=(p.get('cp')||'').split(',').filter(Boolean); if(!cur.includes(v) && cur.length<3) cur.push(v); cpSet(cur); }
function cpDel(v){ const p=new URLSearchParams(location.hash.split('?')[1]||''); cpSet((p.get('cp')||'').split(',').filter(x=>x&&x!==v)); }
function smoothPath(P){ // 平滑曲线（Catmull-Rom → Bezier）
  if(P.length<2) return '';
  let d=`M${P[0][0]},${P[0][1]}`;
  for(let i=0;i<P.length-1;i++){ const p0=P[i-1]||P[i], p1=P[i], p2=P[i+1], p3=P[i+2]||p2;
    d+=` C${p1[0]+(p2[0]-p0[0])/6},${p1[1]+(p2[1]-p0[1])/6} ${p2[0]-(p3[0]-p1[0])/6},${p2[1]-(p3[1]-p1[1])/6} ${p2[0]},${p2[1]}`; }
  return d;
}
function trendChart(T, params, showLy){
  const W=1160, H=200, L=56, R0=24, top=30, bw=(W-L-R0)/12;
  const raw=Math.max(...T.map(x=>Math.max(x.amt, showLy?x.ly:0)))||1;
  const step=[1000,2000,2500,5000,10000,20000,25000,50000,100000].find(st=>raw/st<=4.2)||Math.ceil(raw/4/100000)*100000, max=Math.ceil(raw/step)*step;
  const y=v=>top+(H-top)*(1-v/max), X=i=>L+i*bw+bw/2;
  const k=v=>!PRICE_ON?LOCK:v>=1000?'$'+(v/1000).toFixed(v>=10000?0:1)+'k':'$'+Math.round(v);
  const full=T.filter(x=>!x.part), avg=full.length?full.reduce((a,x)=>a+x.amt,0)/full.length:0;
  const ticks=[]; for(let v=0; v<=max; v+=step) ticks.push(v);
  const P=T.map((x,i)=>[X(i),y(x.amt)]), lastFull=T.findIndex(x=>x.part)<0?11:T.findIndex(x=>x.part)-1;
  const solid=P.slice(0,lastFull+1), dash=P.slice(lastFull);
  const area=smoothPath(solid)+` L${solid[solid.length-1][0]},${H} L${solid[0][0]},${H} Z`;
  const ix=T.map((x,i)=>x.sel?i:-1).filter(i=>i>=0);
  const hi=T.reduce((m,x,i)=>!x.part&&x.amt>T[m].amt?i:m,0);
  return `<svg viewBox="0 0 ${W} ${H+44}" class="tchart">
    <defs><linearGradient id="tgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a6e4a" stop-opacity=".22"/><stop offset="1" stop-color="#1a6e4a" stop-opacity="0"/></linearGradient></defs>
    ${ix.length?`<rect x="${L+ix[0]*bw+2}" y="6" width="${(ix[ix.length-1]-ix[0]+1)*bw-4}" height="${H+34}" rx="8" class="selband"/>`:''}
    ${ticks.map(v=>`<line x1="${L}" x2="${W-R0}" y1="${y(v)}" y2="${y(v)}" class="tg ${v?'':'base'}"/><text x="${L-12}" y="${y(v)+4}" class="tgl" text-anchor="end">${k(v)}</text>`).join('')}
    ${!showLy&&avg?`<line x1="${L}" x2="${W-R0}" y1="${y(avg)}" y2="${y(avg)}" class="avgl"/><text x="${W-R0}" y="${y(avg)+14}" class="avgt" text-anchor="end">Avg ${k(avg)}/month</text>`:''}
    ${showLy?`<path d="${smoothPath(T.map((x,i)=>[X(i),y(x.ly)]))}" class="lyline"/>${T.map((x,i)=>`<circle cx="${X(i)}" cy="${y(x.ly)}" r="3" class="lydot"/>`).join('')}`:''}
    <path d="${area}" fill="url(#tgrad)"/>
    <path d="${smoothPath(solid)}" class="mainline"/>
    ${dash.length>1?`<path d="${smoothPath(dash)}" class="mainline part"/>`:''}
    ${T.map((x,i)=>{ const href=setRange(params,{p:'custom', from:ISO(x.f), to:ISO(x.t)});
      const mon=x.f.toLocaleDateString('en-AU',{month:'long',year:'numeric',timeZone:'UTC'});
      const ch=x.ly?Math.round((x.amt-x.ly)/x.ly*100):null;
      return `<a href="${href}"><g class="tb ${x.sel?'sel':''}"><title>${mon}${x.part?' (1–'+x.t.getUTCDate()+')':''}: ${money(x.amt)}${showLy?`\nLast year: ${money(x.ly)}${ch!=null?` (${ch>=0?'+':''}${ch}%)`:''}`:''}</title>
        <rect x="${L+i*bw}" y="0" width="${bw}" height="${H+44}" class="hit"/>
        <line x1="${X(i)}" x2="${X(i)}" y1="${top-6}" y2="${H}" class="hov"/>
        <circle cx="${X(i)}" cy="${y(x.amt)}" r="${i===hi||x.sel?5:4}" class="dot ${x.part?'part':''}"/>
        <text x="${X(i)}" y="${y(x.amt)-12}" class="val ${i===hi?'hi':''}">${k(x.amt)}</text>
        <text x="${X(i)}" y="${H+20}" class="tx ${x.sel?'on':''}">${MON3s(x.f)}${x.f.getUTCMonth()===0||i===0?' '+String(x.f.getUTCFullYear()).slice(2):''}</text>
        ${x.part?`<text x="${X(i)}" y="${H+34}" class="tx2">to ${x.t.getUTCDate()} ${MON3s(x.t)}</text>`:showLy&&ch!=null?`<text x="${X(i)}" y="${H+34}" class="tx2 ${ch>=0?'up':'down'}">${ch>=0?'▲':'▼'} ${Math.abs(ch)}%</text>`:''}</g></a>`; }).join('')}
  </svg>`;
}
function salesCsv(){
  const params=new URLSearchParams(location.hash.split('?')[1]||''), R=salesRange(params);
  const rows=[['Category','Type','Series','Colour','Code','Net qty (invoiced - returns)','Unit','Returned qty','Amount incl. GST','Previous amount incl. GST','Change %','Last ordered']];
  buildSales(R).forEach(s=>s.cols.forEach(c=>rows.push([s.cat,s.type,s.name,c.colour,c.code,c.qty,s.unit,c.ret,c.amount,c.prevAmount,c.prevAmount?r2((c.amount-c.prevAmount)/c.prevAmount*100):'',c.last?fmtD(c.last):''])));
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  try{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=`product-sales_${ISO(R.from)}_${ISO(R.to)}.csv`; a.click(); }
  catch(e){ toast('Download is not available here'); }
}
/* 返利进度：有返利方案的颜色，显示离下一档还差多少 */
function rebateHint(ser){
  const p = REBATE_PROGRAMS.find(x=>x.seriesId===ser.id); if(!p) return '';
  const I = rebateInfo(p);
  return `<a class="rbhint ${I.near?'warn':''}" href="#/rebates" onclick="event.stopPropagation()">${I.next?`Rebate: ${I.toGo} m² to ${I.next.min} m²${I.near?' · almost there':''}`:`Rebate: top tier`} ›</a>`;
}
const CAT_TREE = {'Engineered Timber':['Plank','Herringbone','Chevron'], 'Hybrid':['Plank','Herringbone','Chevron'], 'Laminate':['Plank','Herringbone','Chevron'], 'Accessories':['Scotia','Stair Nose','Trims']};
function salesPage(params){
  const R = salesRange(params), per = R;
  const cat = params.get('cat')||'All', typ = cat!=='All' ? (params.get('type')||'All') : 'All', q=(params.get('q')||'').toLowerCase(), sort=params.get('sort')||'amount';
  const cps = (params.get('cp')||'').split(',').filter(Boolean).slice(0,1);
  const all = buildSales(per);
  const set = (k,v)=>{const p=new URLSearchParams(params);v?p.set(k,v):p.delete(k);if(k==='cat')p.delete('type');return '#/sales?'+p};
  const set2 = (c,t)=>{const p=new URLSearchParams(params);p.set('cat',c);t&&t!=='All'?p.set('type',t):p.delete('type');return '#/sales?'+p};
  const matchSer = ser => !q || ser.name.toLowerCase().includes(q);
  const matchCol = c => !q || (c.colour+' '+c.code).toLowerCase().includes(q);
  const list = all.filter(ser=>(cat==='All'||ser.cat===cat) && (typ==='All'||ser.type===typ) && (matchSer(ser) || ser.cols.some(matchCol)));
  const totAmt = r2(all.reduce((t,x)=>t+x.amount,0)), prevAmt = r2(all.reduce((t,x)=>t+x.prevAmount,0)), totRet = r2(all.reduce((t,x)=>t+x.retAmount,0));
  const floor = all.filter(x=>x.unit==='m²'), totM2 = r2(floor.reduce((t,x)=>t+x.qty,0)), prevM2 = r2(floor.reduce((t,x)=>t+x.prev,0));
  const best = [...all].sort((a,b)=>b.amount-a.amount)[0];
  const CATS = Object.keys(CAT_TREE);
  const cats = CATS.filter(c=>list.some(x=>x.cat===c));
  const sorter = {amount:(a,b)=>b.amount-a.amount, qty:(a,b)=>b.qty-a.qty, name:(a,b)=>a.name.localeCompare(b.name),
    change:(a,b)=>((b.prevAmount?(b.amount-b.prevAmount)/b.prevAmount:9)-(a.prevAmount?(a.amount-a.prevAmount)/a.prevAmount:9))}[sort]||((a,b)=>b.amount-a.amount);
  const csorter = sort==='name' ? (a,b)=>a.colour.localeCompare(b.colour) : sorter;
  const rows = cats.map(c=>{
    const sers = list.filter(x=>x.cat===c).sort(sorter);
    const catAmt = r2(sers.reduce((t,x)=>t+x.amount,0)), catPrev = r2(sers.reduce((t,x)=>t+x.prevAmount,0));
    const oneUnit = sers.every(x=>x.unit===sers[0].unit), catQty = r2(sers.reduce((t,x)=>t+x.qty,0));
    return `<tr class="catrow"><td colspan="2">${c}</td><td class="r">${oneUnit?fmtQty(catQty,sers[0].unit):''}</td><td class="r">${money(catAmt)}</td><td></td><td class="r">${trendCell(catAmt,catPrev,500)}</td></tr>`
      + CAT_TREE[c].filter(t=>sers.some(x=>x.type===t)).map(t=>{
        const ts = sers.filter(x=>x.type===t), tAmt=r2(ts.reduce((a,x)=>a+x.amount,0)), tPrev=r2(ts.reduce((a,x)=>a+x.prevAmount,0));
        const tQty = ts.every(x=>x.unit===ts[0].unit) ? fmtQty(r2(ts.reduce((a,x)=>a+x.qty,0)),ts[0].unit) : '';
        return (ts.length===1 && ts[0].name===t ? '' : `<tr class="typerow"><td colspan="2"><a href="${set2(c,t)}">${t}</a> <span class="muted">· ${ts.length} series</span></td><td class="r">${tQty}</td><td class="r">${money(tAmt)}</td><td></td><td class="r">${trendCell(tAmt,tPrev,500)}</td></tr>`)
      + ts.map(ser=>{
        const share = catAmt ? ser.amount/catAmt*100 : 0;
        const autoOpen = q && !matchSer(ser);
        const cols = (q && !matchSer(ser) ? ser.cols.filter(matchCol) : ser.cols).slice().sort(csorter);
        const hints = [rebateHint(ser)].filter(Boolean);
        return `<tr class="srow ${autoOpen?'open':''}" data-id="${ser.id}" onclick="toggleSeries('${ser.id}')">
            <td><span class="chev">›</span><b>${ser.name}</b> <span class="muted">series</span><button class="tbtn ${cps.includes('s:'+ser.id)?'on':''}" title="Show trend" onclick="event.stopPropagation();cpOnly('s:${ser.id}')">${ICON_TREND} Trend</button>${hints.length?`<div class="sm2" style="margin:3px 0 0 18px">${hints[0]}</div>`:''}</td>
            <td><span class="ccount">${ser.colours.length} colour${ser.colours.length>1?'s':''}</span></td>
            <td><b>${fmtQty(ser.qty,ser.unit)}</b>${ser.boxes!=null?`<br><span class="muted sm2">${ser.boxes.toLocaleString('en-AU')} boxes</span>`:''}</td>
            <td><b>${money(ser.amount)}</b></td>
            <td><div class="sharebar"><i style="width:${share}%"></i></div><span class="muted sm2">${share.toFixed(0)}%</span></td>
            <td>${trendCell(ser.amount, ser.prevAmount, 500)}</td></tr>`
          + cols.map(col=>{
            const cshare = ser.amount ? col.amount/ser.amount*100 : 0;
            const name = col.id ? `<a class="lnk" href="#/products/${col.id}" onclick="event.stopPropagation()">${esc(col.colour)}</a>` : esc(col.colour);
            const ck = `c:${ser.id}~${col.colour}`;
            return `<tr class="crow click ${cps.includes(ck)?'cpon':''}" data-p="${ser.id}" style="display:${autoOpen?'':'none'}" title="Click to see this colour's trend" onclick="cpOnly('${ck.replace(/'/g,"\\'")}')">
              <td><span class="cdot"></span>${name} <span class="code">${esc(col.code)}</span><span class="tbtn sm">${ICON_TREND}</span>
                <div class="lastord">${col.last?`Last ordered ${fmtD(col.last)}`:'Not ordered this period'}</div></td><td></td>
              <td>${col.qty?fmtQty(col.qty,ser.unit):'<span class="muted">0</span>'}${col.boxes?`<br><span class="muted sm2">${col.boxes} boxes</span>`:''}</td>
              <td>${col.amount?money(col.amount):'<span class="muted">$0.00</span>'}</td>
              <td><div class="sharebar light"><i style="width:${cshare}%"></i></div><span class="muted sm2">${cshare.toFixed(0)}%</span></td>
              <td>${trendCell(col.amount, col.prevAmount, 500)}</td></tr>`}).join('');
      }).join(''); }).join('');
  }).join('');
  const T = salesTrend(R, cps, ser=>(cat==='All'||ser.cat===cat)&&(typ==='All'||ser.type===typ)), cmpLy = params.get('cmp')==='ly';
  const cpOpts = Object.keys(CAT_TREE).map(c=>{ const ss=SALES_SERIES.filter(x=>x.cat===c); if(!ss.length) return '';
    return `<optgroup label="${c}">${ss.map(x=>`<option value="s:${x.id}" ${cps.includes('s:'+x.id)?'selected':''}>${x.name} series (all colours)</option>`+x.colours.map(col=>`<option value="c:${x.id}~${esc(col.colour)}" ${cps.includes(`c:${x.id}~${col.colour}`)?'selected':''}>&nbsp;&nbsp;&nbsp;${x.name} · ${esc(col.colour)}</option>`).join('')).join('')}</optgroup>`; }).join('');
  const cpSer = cps.length ? SALES_SERIES.find(x=>x.id===cps[0].slice(2).split('~')[0]) : null;
  const cpCol = cps.length && cps[0][0]==='c' ? cps[0].split('~')[1] : '';
  const cpCat = cpSer ? cpSer.cat : '';
  const cpBar = `<div class="cpbar"><span class="seglbl">Show trend for</span>
    <select class="cpsel ${cpCat?'on':''}" onchange="this.value?cpPickCat(this.value):cpSet([])"><option value="">All products</option>${Object.keys(CAT_TREE).filter(c=>SALES_SERIES.some(x=>x.cat===c)).map(c=>`<option ${c===cpCat?'selected':''}>${c}</option>`).join('')}</select>
    ${cpCat?`<span class="cparr">›</span><select class="cpsel on" onchange="cpOnly('s:'+this.value)">${SALES_SERIES.filter(x=>x.cat===cpCat).map(x=>`<option value="${x.id}" ${x.id===cpSer.id?'selected':''}>${x.name}</option>`).join('')}</select>
      <span class="cparr">›</span><select class="cpsel ${cpCol?'on':''}" onchange="cpOnly(this.value?'c:${cpSer.id}~'+this.value:'s:${cpSer.id}')"><option value="">All colours</option>${cpSer.colours.map(c=>`<option value="${esc(c.colour)}" ${c.colour===cpCol?'selected':''}>${esc(c.colour)}</option>`).join('')}</select>
      <span class="cpinfo">${money(cpLookup(all,cps[0]).amt)} this period · ${money(r2(T.reduce((a,x)=>a+x.amt,0)))} in 12 months</span><a class="cpclear" href="javascript:void 0" onclick="cpSet([])">× Clear</a>`:''}</div>`;
  const th = (k,l) => `<th><a class="sorth ${sort===k?'on':''}" href="${set('sort',k==='amount'?'':k)}">${l}${sort===k?' ↓':''}</a></th>`;
  const segCat = `<div class="seg">${['All',...CATS].map(c=>`<a class="${c===cat?'on':''}" href="${set('cat',c==='All'?'':c)}">${c}<span>${c==='All'?all.length:all.filter(x=>x.cat===c).length}</span></a>`).join('')}</div>`;
  const segType = cat==='All' ? '' : `<div class="subseg"><span class="muted">${cat} ›</span>${['All',...CAT_TREE[cat]].map(t=>{const n=all.filter(x=>x.cat===cat&&(t==='All'||x.type===t)).length; return `<a class="${t===typ?'on':''} ${n?'':'zero'}" href="${set2(cat,t)}">${t}<span>${n}</span></a>`;}).join('')}</div>`;
  return `<div class="page-head"><div class="wrap"><h1>Product Insights</h1><p>What you've bought from HTT, by series and colour. Invoiced amounts incl. GST, returns deducted.</p></div></div>
  <div class="wrap" style="padding-top:22px">
    ${dateBar(R,true)}
    <div class="stats">
      ${stat('Total purchases (incl. GST)', money(totAmt), `${trendCell(totAmt,prevAmt)} vs ${cmpLy?'last year':'previous period'}`)}
      ${stat('Flooring volume', fmtQty(totM2,'m²'), `${trendCell(totM2,prevM2)} vs ${cmpLy?'last year':'previous period'}`)}
      ${stat('Top series', best?best.name:'-', best?`${money(best.amount)} · ${totAmt?Math.round(best.amount/totAmt*100):0}% of your purchases`:'')}
    </div>
    <div class="trendcard">
      <div class="trhead"><div><b>Last 12 months</b><span>Monthly purchases incl. GST, returns deducted · click a month to view it</span>
          ${`<div class="tlegend"><i class="lg ln"></i>${cmpLy?'This year':'Purchases'}${cmpLy?'<i class="lg lyln"></i>Last year':'<i class="lg avg"></i>Monthly average'}<i class="lg lgsel"></i>Selected period</div>`}</div>
        ${`<div class="seg cmpseg"><span class="seglbl">Compare with</span><a class="${cmpLy?'':'on'}" href="${set('cmp','')}">Previous period</a><a class="${cmpLy?'on':''}" href="${set('cmp','ly')}">Same period last year</a></div>`}</div>
      ${cpBar}
      ${trendChart(T, params, cmpLy)}
    </div>
    <div class="sfilter">
      ${segCat}
      <form class="mini-search" style="margin-left:auto" onsubmit="event.preventDefault();go('${set('q','').replace(/'/g,"\\'")}'+'&q='+encodeURIComponent(this.q.value))">${ICON.search}<input name="q" value="${esc(params.get('q')||'')}" placeholder="Search series, colour or code..."></form>
      <button class="btn-o sm" onclick="salesCsv()">Export CSV</button>
    </div>
    ${segType}
    <table class="stable"><thead><tr>${th('name','Series / colour')}<th>Colours</th>${th('qty','Quantity')}${th('amount','Amount (incl. GST)')}<th>% of category</th>${th('change',cmpLy?'vs last year':'vs previous')}</tr></thead>
      <tbody>${rows || `<tr><td colspan="6" class="muted" style="padding:30px;text-align:center">${q?'No sales match your search.':`No ${typ!=='All'?typ+' ':''}${cat!=='All'?cat+' ':''}purchases in this period.`}</td></tr>`}</tbody></table>
    <p class="muted" style="font-size:11px;margin:14px 0 50px">Click a series to see each colour. Quantities and amounts are invoiced minus returns (credit notes). Amounts include GST. ${PRICE_ON?"Changes under $500 aren't compared":''}.</p>
  </div>`;
}

/* =====================================================================
   展示板 Display Boards（给 IT）
   · 客户每个门店现有的 HTT 展示板 / 样板；可以申请新的、更换或退回旧的。提交后主系统收到通知，由 HTT 安排。
   IT: GET  /api/portal/me/display-boards                 现有展示板（按门店）
       GET  /api/portal/me/display-board-requests         申请记录与进度
       POST /api/portal/me/display-board-requests  {type:'new'|'replace'|'return', storeId, seriesId?, boardType?, colours?[], qty?, boardIds?[], reason?, note?}
   以下为示例数据。
   ===================================================================== */
const BOARD_TYPES = {stand:'Stand', panel:'Colour Panel', swatch:'Swatches', offcut:'Offcut'};   // Offcut 只用于申请，不在总览表和 Stands 区块显示
/* Colour Panel 每个颜色一块，算一个 panel */
/* Swatches：统计一共拿了多少套（qty = 从开始到现在收到的套数） */
const swatchCount = list => list.filter(b=>b.type==='swatch').reduce((t,b)=>t+(b.qty||1),0);
const cQty = (b,c) => (b.cq&&b.cq[c])||1;   // 每个颜色从开始到现在一共拿了几块（主系统发货记录）
const panelQty = b => b.colours.reduce((t,c)=>t+cQty(b,c),0);
const panelCount = list => list.filter(b=>b.type==='panel').reduce((t,b)=>t+panelQty(b),0);
const FULL_SET = t => t==='stand' || t==='swatch';   // Stand、Swatches 是整套（系列全部颜色），不用选颜色
const BOARDS = [
  {id:'DB-1080', store:'ADR-01', series:'bonita',   type:'swatch', qty:4, colours:['Natural Oak','Latte Oak','Lime Wash','Grey Wash','Brescia','White Oak','Cuban','Cotton Oak','Smoked Brown'], since:'2025-03-12'},
  {id:'DB-1085', store:'ADR-02', series:'bonita',   type:'swatch', qty:2, colours:['Natural Oak','Latte Oak','Lime Wash','Grey Wash','Brescia','White Oak','Cuban','Cotton Oak','Smoked Brown'], since:'2026-04-05'},
  {id:'DB-1044', store:'ADR-01', series:'quercus',  type:'panel',  colours:['Natural','Sandstone','Honey','Chalk','Espresso'], cq:{'Natural':3,'Sandstone':2,'Honey':2,'Chalk':1,'Espresso':1}, since:'2025-09-02'},
  {id:'DB-1052', store:'ADR-01', series:'guardian', type:'panel',  colours:['Natural Grey','Coastal Ash'], cq:{'Natural Grey':2,'Coastal Ash':1}, since:'2026-02-18'},
  {id:'DB-0987', store:'ADR-01', series:'aquaglow', type:'panel',  colours:['Silver','Natural Oak'], cq:{'Silver':4,'Natural Oak':2}, since:'2024-08-20', flag:'clearance'},
  {id:'DB-1063', store:'ADR-02', series:'bonita',   type:'panel',  colours:['Natural Oak','White Oak','Cuban','Smoked Brown'], cq:{'Natural Oak':3,'White Oak':2,'Cuban':1,'Smoked Brown':2}, since:'2026-04-05', flag:'missing'},
  {id:'DB-1071', store:'ADR-02', series:'heritage', type:'swatch', qty:1, colours:['Rustic Oak'], since:'2026-06-30'},
];
/* Stand：不按颜色，只记每个门店每个系列从开始到现在一共拿了多少个（主系统发货记录） */
const STAND_HIST = [
  {store:'ADR-01', series:'bonita',   qty:2, date:'2025-03-12'}, {store:'ADR-01', series:'bonita', qty:1, date:'2026-02-10'},
  {store:'ADR-01', series:'quercus',  qty:2, date:'2025-10-01'},
  {store:'ADR-01', series:'guardian', qty:1, date:'2026-03-02'},
  {store:'ADR-02', series:'bonita',   qty:1, date:'2026-04-05'}, {store:'ADR-02', series:'heritage', qty:1, date:'2026-06-30'},
];
const BOARD_REQS = [
  {no:'DBR-0412', type:'new', store:'ADR-02', series:'terra', boardType:'panel', colours:['Sand','Clay','Charcoal'], qty:1, submitted:'2026-11-10', status:'Scheduled', eta:'2026-11-24', note:'Delivered with next order', updated:'2026-11-17', unseen:true},
  {no:'DBR-0398', type:'replace', store:'ADR-01', boards:['DB-0961'], series:'heritage', boardType:'panel', colours:['Rustic Oak'], cq:{'Rustic Oak':2}, reason:'Damaged', submitted:'2026-10-21', status:'Completed', done:'2026-11-02'},
];
const storeName = id => (MOCK_SUMMARY.addresses.delivery.find(a=>a.addressId===id)||{label:id}).label;
const STORES = () => MOCK_SUMMARY.addresses.delivery.filter(a=>a.type!=='delivery');
const REQ_STEPS = ['Requested','Completed'];   // 只显示两步：已申请 → 已完成
const reqSt = r => r.status==='Completed' ? 'Completed' : 'Requested';
function boardFlags(b){
  const all = PRODUCTS.filter(p=>p.series===b.series).map(p=>p.colour);
  const missing = all.filter(c=>!b.colours.includes(c));
  const newOnes = PRODUCTS.filter(p=>p.series===b.series && p.isNew && !b.colours.includes(p.colour)).map(p=>p.colour);
  const out=[];
  if(newOnes.length) out.push(['info',`${newOnes.length} new colour${newOnes.length>1?'s':''} not on this board: ${newOnes.join(', ')}`]);
  else if(b.type!=='stand' && missing.length) out.push(['muted',`${missing.length} more colour${missing.length>1?'s':''} available in this series`]);
  if(b.flag==='clearance') out.push(['warn','Some colours are on clearance — consider replacing this board']);
  const age = Math.round((dIso(SYSTEM_INFO.systemDate)-dIso(b.since))/864e5/365*10)/10;
  if(age>=2) out.push(['warn',`On display ${age} years — may need refreshing`]);
  return out;
}
function boardsPage(params){
  const tab = params.get('tab')||'boards', st = params.get('store')||'All', only = params.get('need')==='1';
  const set = (k,v)=>{const p=new URLSearchParams(params);v?p.set(k,v):p.delete(k);return '#/boards?'+p};
  const openReqs = BOARD_REQS.filter(r=>r.status!=='Completed'&&r.status!=='Declined');
  const flagged = b => boardFlags(b).some(f=>f[0]!=='muted');
  const needs = BOARDS.filter(flagged).length;
  const stores = STORE==='all' ? STORES() : STORES().filter(a=>a.addressId===STORE);
  const shown = BOARDS.filter(b=>(st==='All'||b.store===st) && (!only||flagged(b)));
  const swOf = (sid,c) => { const p=PRODUCTS.find(x=>x.series===sid&&x.colour===c); return p&&p.sw&&p.sw.startsWith('#')?p.sw:'#bbb'; };
  /* 伸缩：每块板一行，点开看颜色、提示和操作 */
  const card = b => { const S=SERIES.find(x=>x.id===b.series)||{name:b.series}; const fl=boardFlags(b), need=flagged(b);
    const pend = openReqs.find(r=>(r.boards||[]).includes(b.id));
    const months = Math.round((dIso(SYSTEM_INFO.systemDate)-dIso(b.since))/864e5/30.4);
    return `<details class="brow ${need?'need':''} ${pend?'pend':''}">
      <summary><span class="ngchev">›</span>
        <span class="bstrip">${b.colours.map(c=>`<i style="background:${swOf(b.series,c)}"></i>`).join('')}</span>
        <span class="bname"><b>${S.name}</b><small>${BOARD_TYPES[b.type]} · ${b.id}</small></span>
        <span class="bcnt">${b.colours.length} of ${S.colours} colours</span>
        <span class="bst">${pend?`<span class="badge b-open">${pend.type==='return'?'Return':'Update'} ${reqSt(pend).toLowerCase()}</span>`:need?'<span class="badge b-warn">Worth updating</span>':'<span class="bok">✓ Up to date</span>'}</span>
      </summary>
      <div class="bdet">
        <div class="bchips">${b.colours.map(c=>`<span><i style="background:${swOf(b.series,c)}"></i>${esc(c)}</span>`).join('')}
          ${PRODUCTS.filter(p=>p.series===b.series&&!b.colours.includes(p.colour)).map(p=>`<span class="miss" title="Not on this board"><i style="background:${p.sw}"></i>${esc(p.colour)}${p.isNew?' <em>NEW</em>':''}</span>`).join('')}</div>
        ${fl.length?`<ul class="bflags">${fl.map(f=>`<li class="${f[0]}">${f[1]}</li>`).join('')}</ul>`:''}
        <div class="bact"><span class="muted sm2">On display since ${fmtDay(b.since)}${b.colours.length<S.colours?' · dashed = not on this board':''}</span>
          ${pend?`<a class="lnk sm2" style="margin-left:auto" href="${set('tab','requests')}">View request ${pend.no} ›</a>`
          :`<span style="margin-left:auto"></span>${need?`<button class="btn sm" onclick="boardReq('replace','${b.id}')">Update board</button>`:`<button class="btn-o sm" onclick="boardReq('replace','${b.id}')">Replace / update</button>`}<button class="txtbtn" onclick="boardReq('return','${b.id}')">Return</button>`}</div>
      </div></details>`; };
  /* 这个门店还没有展示板的系列 */
  const missingSeries = sid => SERIES.filter(x=>x.cat!=='Accessories' && !BOARDS.some(b=>b.store===sid && b.series===x.id));
  /* 每个门店：按类别 → 系列列出全部系列，有展示板的显示展示板，没有的显示 "Not on display" */
  const missRow = (x, sid) => { const ps=PRODUCTS.filter(p=>p.series===x.id); const r=openReqs.find(r=>r.type==='new'&&r.store===sid&&r.series===x.id);
    return `<div class="brow miss"><div class="bmsum"><span></span>
      <span class="bempty2"><span>No board</span>${ps.slice(0,5).map(p=>`<i style="background:${p.sw}"></i>`).join('')}</span>
      <span class="bname"><b>${x.name}</b><small>${x.type} · ${ps.length} colours${ps.some(p=>p.isNew)?' · <em class="newtag" style="display:inline">NEW</em>':''}${ps.some(p=>p.promo)?' · <em class="promotag" style="display:inline">PROMO</em>':''}</small></span>
      <span class="bcnt"><span class="nodpill">Not on display</span></span>
      <span class="bst">${r?`<span class="badge b-open">${r.no} ${reqSt(r).toLowerCase()}</span>`:`<button class="btn sm" onclick="boardReq('new',null,'${sid}','${x.id}')">+ Request board</button>`}</span></div></div>`; };
  const storeBlock = (a, ai) => { const its = shown.filter(b=>b.store===a.addressId); if(!its.length && only) return '';
    const cats = Object.keys(CAT_TREE).filter(c=>c!=='Accessories');
    const body = cats.map(c=>{ const sers = SERIES.filter(x=>x.cat===c); 
      const rows = sers.map(x=>{ const bs = its.filter(b=>b.series===x.id); return bs.length ? bs.map(card).join('') : (only ? '' : missRow(x, a.addressId)); }).join('');
      if(!rows) return '';
      const onN = sers.filter(x=>its.some(b=>b.series===x.id)).length;
      return `<div class="bcat"><div class="bcath">${c}<span>${onN} of ${sers.length} series on display</span></div><div class="blist">${rows}</div></div>`; }).join('');
    const missN = SERIES.filter(x=>x.cat!=='Accessories' && !BOARDS.some(b=>b.store===a.addressId&&b.series===x.id)).length;
    return `<details class="bstore2" ${ai===0||st!=='All'||only?'open':''}>
      <summary class="bsh"><span class="ngchev">›</span><div>${ICON.pin}<b>${esc(a.label)}</b><span>${esc(a.suburb||'')}</span></div>
        <em>${its.length} board${its.length!==1?'s':''}</em>${missN&&!only?`<em class="m">${missN} series not on display</em>`:''}
        <button class="txtbtn" onclick="event.preventDefault();boardReq('new',null,'${a.addressId}')">+ Add a board here</button></summary>
      <div class="bsbody">${body||'<div class="bempty">Nothing to show.</div>'}</div></details>`; };
  /* 申请记录：清楚写出要了什么 */
  const reqWhat = r => { const S=SERIES.find(x=>x.id===r.series)||{name:'-'}; return `<div class="rqw"><div class="rqbrand">${S.name}<small>${S.cat||''}</small></div><div class="rqd">${reqWhat0(r).replace(' · '+S.name,'')}</div></div>`; };
  const reqWhat0 = r => { const S=SERIES.find(x=>x.id===r.series)||{name:'-'}, t=r.boardType || (BOARDS.find(b=>(r.boards||[]).includes(b.id))||{}).type;
    if(r.type==='return') return `<b>Return ${BOARD_TYPES[t]||'board'}</b> · ${S.name}${r.boards?` <span class="muted">(${r.boards.join(', ')})</span>`:''}`;
    if(t==='panel'){ const cq=r.cq || Object.fromEntries((r.colours||[]).map(c=>[c,1])), n=Object.values(cq).reduce((a,b)=>a+b,0);
      return `<b>${n} Colour Panel${n!==1?'s':''}</b> · ${S.name}<div class="rqitems">${Object.entries(cq).map(([c,q])=>`<span><i style="background:${swOf(r.series,c)}"></i>${esc(c)} <b>× ${q}</b></span>`).join('')}</div>`; }
    if(t==='swatch') return `<b>${r.qty||1} Swatch set${(r.qty||1)!==1?'s':''}</b> · ${S.name} <span class="muted">— full string</span>`;
    if(t==='stand') return `<b>${r.qty||1} Stand${(r.qty||1)!==1?'s':''}</b> · ${S.name} <span class="muted">— HTT chooses colours</span>`;
    if(t==='offcut') return `<b>Offcuts</b> · ${S.name}<div class="rqitems">${(r.colours||[]).map(c=>`<span><i style="background:${swOf(r.series,c)}"></i>${esc(c)}</span>`).join('')}</div>`;
    return `<b>${S.name}</b>`; };
  const reqRow = r => { const i=REQ_STEPS.indexOf(reqSt(r));
    return `<tr class="${r.status==='Completed'?'done':''} ${r.unseen?'upd':''}"><td><b>${r.no}</b>${r.unseen?`<div><span class="updtag">Updated ${fmtDay(r.updated).slice(0,6)}</span></div>`:''}<div class="muted sm2">${fmtDay(r.submitted)}</div><span class="rtype ${r.type}">${{new:'New',replace:'Add more',return:'Return'}[r.type]}</span></td>
      <td class="rqwhat">${reqWhat(r)}${r.reason?`<div class="rqwhy">Reason: ${esc(r.reason)}</div>`:''}</td>
      <td class="rqnote">${r.note?esc(r.note):'<span class="muted">—</span>'}</td>
      <td>${esc(storeName(r.store))}</td>
      <td><div class="rsteps">${REQ_STEPS.map((x,j)=>`<span class="${j<i||r.status==='Completed'?'on':j===i?'cur':''}">${x}</span>`).join('<b></b>')}</div>
        <div class="muted sm2" style="margin-top:4px">${r.status==='Completed'&&r.done?`Completed ${fmtDay(r.done)}`:r.eta?`${r.type==='return'?'Pick up':'Delivery'} <b>${fmtDay(r.eta)}</b>`:'HTT has been notified'}</div></td></tr>`; };
  const rf = params.get('rf')||'open', reqs = BOARD_REQS.filter(r=>rf==='all'||(rf==='open'?r.status!=='Completed':r.status==='Completed'));
  return `<div class="page-head"><div class="wrap"><h1>Display Boards</h1><p>HTT display boards in your stores. Request new boards, or update and return old ones — HTT is notified and arranges delivery or pick up.</p></div></div>
  <div class="wrap" style="padding-top:22px">
    <div class="stats">
      ${(()=>{ const pn=panelCount(BOARDS), stn=STAND_HIST.reduce((t,h)=>t+h.qty,0), swn=swatchCount(BOARDS);
        return stat('On display', `${pn} <span style="font-size:15px;color:#6b726e">colour panels</span>`, `${stn} stand${stn!==1?'s':''} · ${swn} swatch set${swn!==1?'s':''} · ${stores.length} stores`); })()}
      <a class="stat" href="${set('tab','requests')}" style="display:block"><div class="k">Requests in progress</div><div class="v">${openReqs.length}</div><div class="s">${openReqs.length?openReqs.map(r=>`${r.no} · ${reqSt(r).toLowerCase()}${r.unseen?' <b style="color:#2d5486">· updated</b>':''}`).join(' · ')+' ›':'nothing in progress'}</div></a>
      <a class="stat ${needs?'alert':''}" href="${set('need',only?'':'1').replace('tab=requests','')}" style="display:block"><div class="k">Worth updating</div><div class="v">${needs}</div><div class="s">${needs?(only?'showing these only · show all ›':'new colours, clearance or old boards · show ›'):'all boards up to date'}</div></a>
    </div>
    <div class="bbar">
      <div class="seg">${[['boards','My boards',BOARDS.length],['requests','Requests',BOARD_REQS.length]].map(([k,l,n])=>`<a class="${tab===k?'on':''}" href="${set('tab',k==='boards'?'':k)}">${l}<span>${n}</span>${k==='requests'&&BOARD_REQS.some(r=>r.unseen)?'<i class="dotu"></i>':''}</a>`).join('')}</div>
      ${tab==='boards'?`<div class="subseg" style="margin:0">${only?`<a class="on" href="${set('need','')}">Worth updating only ×</a>`:''}</div>`
        :`<div class="subseg" style="margin:0">${[['open','In progress'],['done','Completed'],['all','All']].map(([k,l])=>`<a class="${rf===k?'on':''}" href="${set('rf',k==='open'?'':k)}">${l}</a>`).join('')}</div>`}
      <button class="btn" style="margin-left:auto" onclick="boardReq('new')">+ Request a new board</button>
    </div>
    ${tab==='boards' ? boardMatrix(stores, openReqs, only, flagged, swOf) || '<div class="empty2"><b>Nothing to show</b></div>'
      : (reqs.length?`<table class="stable btbl"><thead><tr><th style="width:150px">Request</th><th>What was requested</th><th style="width:170px">Note</th><th style="width:170px">Store</th><th style="width:330px">Progress</th></tr></thead><tbody>${reqs.map(reqRow).join('')}</tbody></table>`:'<div class="empty2"><b>No requests here</b></div>')}
    <p class="muted" style="font-size:11px;margin:16px 0 50px">Display boards remain HTT property. Ask your account manager about board charges or availability.</p>
  </div>`;
}
/* 总览表：每行一个系列（按类别），每栏一个门店 */
function boardMatrix(stores, openReqs, only, flagged, swOf){
  const cats = Object.keys(CAT_TREE).filter(c=>c!=='Accessories');
  /* 格子：Colour Panel 放左边，Swatches 作为小标签放右边；Stand 不在总览表里，另外列在下面 */
  const cell = (x, a) => {
    const bs = BOARDS.filter(b=>b.store===a.addressId && b.series===x.id);
    const mains = bs.filter(b=>b.type==='panel'), sws = bs.filter(b=>b.type==='swatch');
    const swReq = openReqs.find(r=>r.type==='new'&&r.store===a.addressId&&r.series===x.id&&r.boardType==='swatch');
    const swChip = sws.length ? sws.map(b=>`<button class="mxsw ${flagged(b)?'need':''}" onclick="boardInfo('${b.id}')" title="${b.id} · ${b.qty||1} set${(b.qty||1)>1?'s':''} received">✓ Swatches <em>× ${b.qty||1}</em></button>`).join('')
      : swReq ? `<a class="mxsw p" href="#/boards?tab=requests">◷ Swatches</a>`
      : `<button class="mxsw add" onclick="reqSwatches('${a.addressId}','${x.id}')">+ Swatches</button>`;
    const r = openReqs.find(r=>r.type==='new'&&r.store===a.addressId&&r.series===x.id&&r.boardType!=='swatch');
    const main = mains.length ? mains.map(b=>{ const pend=openReqs.find(r=>(r.boards||[]).includes(b.id)), need=flagged(b);
      return `<button class="mxb ${need?'need':''}" onclick="boardInfo('${b.id}')" title="${b.id}">
        <span class="mxs">${b.colours.map(c=>`<i style="background:${swOf(b.series,c)}"></i>`).join('')}</span>
        <span class="mxt">${b.type==='panel'?`<b>✓ ${b.colours.length} of ${x.colours} colours</b>`:`<b>✓ Stand</b> <span class="muted">${b.colours.length}/${x.colours}</span>`}</span>
        ${pend?`<span class="mxf p" title="${pend.no}">◷</span>`:need?'<span class="mxf w" title="Worth updating">⚠</span>':''}</button>`; }).join('')
      : r ? `<a class="mxr" href="#/boards?tab=requests">◷ ${r.no} · ${reqSt(r).toLowerCase()}</a>`
      : `<button class="mxadd" onclick="reqPanels('${a.addressId}','${x.id}')">+ Colour Panels</button>`;
    return `<div class="mxcell">${main}${swChip}</div>`;
  };
  const rows = cats.map(c=>{ const sers = SERIES.filter(x=>x.cat===c && (!only || BOARDS.some(b=>b.series===x.id && flagged(b))));
    if(!sers.length) return '';
    return `<tr class="mxcat"><td colspan="${stores.length+1}">${c}</td></tr>` + sers.map(x=>{ const ps=PRODUCTS.filter(p=>p.series===x.id); const n=stores.filter(a=>BOARDS.some(b=>b.store===a.addressId&&b.series===x.id&&b.type==='panel')).length;
      return `<tr><th><a href="#/series/${x.id}">${x.name}</a>
        <small>${x.type}${x.size?' · '+x.size:''}</small><small>${ps.length} colour${ps.length!==1?'s':''} · in ${n} of ${stores.length} stores</small></th>${stores.map(a=>`<td>${cell(x,a)}</td>`).join('')}</tr>`; }).join(''); }).join('');
  return `<div class="mxwrap"><table class="mx"><thead><tr><th></th>${stores.map(a=>{ const k=BOARDS.filter(b=>b.store===a.addressId).length, tot=SERIES.filter(x=>x.cat!=='Accessories').length, on=new Set(BOARDS.filter(b=>b.store===a.addressId&&b.type==='panel').map(b=>b.series)).size;
      const sb=BOARDS.filter(b=>b.store===a.addressId), pn=panelCount(sb), sn=swatchCount(sb); return `<th>${ICON.pin}<b>${esc(a.label)}</b><small>${pn} colour panel${pn!==1?'s':''} · ${sn} swatch set${sn!==1?'s':''}</small></th>`; }).join('')}</tr></thead>
    <tbody>${rows||`<tr><td colspan="${stores.length+1}" class="muted" style="padding:24px;text-align:center">Nothing to show.</td></tr>`}</tbody></table></div>
    ${(()=>{ /* Stands：每个门店一行，只写系列和一共拿了多少个 */
      const tot=STAND_HIST.reduce((t,h)=>t+h.qty,0);
      return `<div class="sotbl"><div class="soh"><b>Stands</b><span>${tot} stands received in total</span></div>
        ${stores.map(a=>{ const hs=STAND_HIST.filter(h=>h.store===a.addressId), sers=[...new Set(hs.map(h=>h.series))].sort((x,y)=>SERIES.findIndex(s=>s.id===x)-SERIES.findIndex(s=>s.id===y));
          const n=hs.reduce((t,h)=>t+h.qty,0), reqs=openReqs.filter(r=>r.type==='new'&&r.boardType==='stand'&&r.store===a.addressId);
          return `<div class="sorow"><div class="sost">${ICON.pin}<b>${esc(a.label)}</b><span class="muted sm2">${n} stand${n!==1?'s':''}</span></div>
          <div class="soit">${sers.map(sid=>{ const S=SERIES.find(x=>x.id===sid), list=hs.filter(h=>h.series===sid), q=list.reduce((t,h)=>t+h.qty,0);
            return `<span class="stchip" title="${list.map(h=>`${fmtDay(h.date)}: ${h.qty}`).join('\n')}"><b>${S.name}</b><em>× ${q}</em></span>`; }).join('')}
            ${reqs.map(r=>`<a class="stchip req" href="#/boards?tab=requests">◷ ${(SERIES.find(x=>x.id===r.series)||{}).name} × ${r.qty||1} · ${reqSt(r).toLowerCase()}</a>`).join('')}
            ${!sers.length&&!reqs.length?'<span class="muted sm2">No stands yet</span>':''}</div>
          <button class="txtbtn" onclick="boardReq('new',null,'${a.addressId}',null,'stand')">+ Request stand</button></div>`; }).join('')}</div>`; })()}
    <div class="mxleg"><span><b class="lg1">✓</b> On display — click to see the board</span><span><b class="lg2">⚠</b> Worth updating</span><span><b class="lg3">◷</b> Request in progress</span><span><b class="lg4">+ Colour Panels</b> <b class="lg4">+ Swatches</b> Not on display — click to request</span></div>`;
}
/* 点总览表里的展示板：显示详情和操作 */
/* 申请 Colour Panels：每个颜色填数量，显示已经拿过多少 */
function reqPanels(storeId, seriesId){
  const S=SERIES.find(x=>x.id===seriesId), m=document.getElementById('modal');
  const have = BOARDS.find(b=>b.type==='panel'&&b.store===storeId&&b.series===seriesId);
  const ps = PRODUCTS.filter(p=>p.series===seriesId);
  m.innerHTML = `<form class="mbox" style="width:560px" onsubmit="event.preventDefault();submitPanels(this,'${storeId}','${seriesId}','${have?have.id:''}')">
    <span class="dlgk">Colour Panels</span>
    <h3 class="serif" style="font-weight:500;font-size:26px;margin:2px 0 2px">${S.name}</h3>
    <div class="muted sm2" style="margin-bottom:12px">${esc(storeName(storeId))} · ${have?`has ${have.colours.length} of ${ps.length} colours`:`no colour panels yet · ${ps.length} colours in this series`}</div>
    <div class="lbl2">How many panels of each colour?<span class="qpick">${have&&have.colours.length<ps.length?`<button type="button" onclick="pqAll(this,'miss')">1 of each new to this store</button>`:''}<button type="button" onclick="pqAll(this,'all')">1 of each</button><button type="button" onclick="pqAll(this,'none')">Clear</button></span></div>
    <div class="pqlist">${ps.map(p=>{ const h=have&&have.colours.includes(p.colour)?cQty(have,p.colour):0; return `<div class="pqrow ${h?'':'miss'}">
      <i style="background:${p.sw}"></i><span class="pqn">${esc(p.colour)}${p.isNew?' <em>NEW</em>':''}</span>
      <span class="pqh">${h?`have ${h}`:''}</span>
      <span class="pqs"><button type="button" onclick="pqStep(this,-1)">−</button><input name="q_${esc(p.colour)}" data-c="${esc(p.colour)}" data-have="${h}" type="number" min="0" max="20" value="0" oninput="pqTot(this.form)" onfocus="this.select()"><button type="button" onclick="pqStep(this,1)">+</button></span></div>`; }).join('')}</div>
    <div class="pqtot"><b id="pqt">0</b> panels · <span id="pqc">0</span> colours</div>
    <div class="pqwhy" id="pqwhy" style="display:none">
      <div class="pqwh">You already have <b id="pqhave"></b> — why do you need more?</div>
      <div class="pqr">${['Damaged','Lost or stolen','Faded / worn','For another display area','Other'].map(r=>`<label class="pill"><input type="radio" name="why" value="${r}"> ${r}</label>`).join('')}</div>
      <input name="whyText" maxlength="200" placeholder="More details (optional)">
    </div>
    <label>Note for HTT (optional)<input name="note" maxlength="300" placeholder="e.g. best time to deliver"></label>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px"><button type="button" class="btn-o" onclick="closeModal()">Back</button><button class="btn pqsend" disabled>Send request</button></div>
  </form>`;
  m.style.display='flex';
}
function pqStep(btn,d){ const i=btn.parentNode.querySelector('input'); i.value=Math.max(0,Math.min(20,(+i.value||0)+d)); pqTot(btn.closest('form')); }
function pqAll(btn,k){ const f=btn.closest('form'); f.querySelectorAll('.pqrow').forEach(r=>{ const i=r.querySelector('input'); i.value = k==='all'?1 : k==='miss'?(r.classList.contains('miss')?1:0) : 0; }); pqTot(f); }
function pqTot(f){ let t=0, c=0; const again=[]; f.querySelectorAll('.pqrow').forEach(r=>{ const i=r.querySelector('input'), v=+i.value||0; t+=v; if(v) c++; r.classList.toggle('on', v>0); if(v && +i.dataset.have) again.push(i.dataset.c); });
  const w=f.querySelector('#pqwhy'); if(w){ w.style.display=again.length?'':'none'; f.querySelector('#pqhave').textContent=again.join(', '); } f.querySelector('#pqt').textContent=t; f.querySelector('#pqc').textContent=c; f.querySelector('.pqsend').disabled=!t; }
function submitPanels(f, storeId, seriesId, boardId){
  const cq={}; f.querySelectorAll('.pqrow input').forEach(i=>{ if(+i.value>0) cq[i.dataset.c]=+i.value; });
  if(!Object.keys(cq).length){ toast('Choose at least one colour'); return; }
  const again = [...f.querySelectorAll('.pqrow input')].filter(i=>+i.value>0 && +i.dataset.have).map(i=>i.dataset.c);
  const why = f.querySelector('input[name=why]:checked');
  if(again.length && !why){ toast('Please tell HTT why you need more of '+again.join(', ')); f.querySelector('#pqwhy').classList.add('err'); return; }
  const reasonTxt = again.length ? `${why.value}${f.whyText.value?' — '+f.whyText.value:''} (${again.join(', ')})` : null;
  const no = 'DBR-'+String(Math.max(...BOARD_REQS.map(r=>+r.no.split('-')[1]))+1).padStart(4,'0');
  BOARD_REQS.unshift({no, type: boardId?'replace':'new', store:storeId, series:seriesId, boardType:'panel', boards: boardId?[boardId]:null, colours:Object.keys(cq), cq, qty:Object.values(cq).reduce((a,b)=>a+b,0), note:f.note.value||null, submitted:SYSTEM_INFO.systemDate, status:'Requested', reason: reasonTxt});
  closeModal(); toast(`${no} sent — HTT has been notified`); go('#/boards?tab=requests');
}
/* 申请 Swatches：整套，只填套数 */
function reqSwatches(storeId, seriesId){
  const S=SERIES.find(x=>x.id===seriesId), m=document.getElementById('modal'), ps=PRODUCTS.filter(p=>p.series===seriesId);
  const have = BOARDS.find(b=>b.type==='swatch'&&b.store===storeId&&b.series===seriesId);
  m.innerHTML = `<form class="mbox" style="width:520px" onsubmit="event.preventDefault();submitSwatches(this,'${storeId}','${seriesId}')">
    <span class="dlgk sw">Swatches</span>
    <h3 class="serif" style="font-weight:500;font-size:26px;margin:2px 0 2px">${S.name}</h3>
    <div class="muted sm2" style="margin-bottom:12px">${esc(storeName(storeId))} · ${have?`${have.qty||1} set${(have.qty||1)>1?'s':''} received so far`:'no swatches yet'}</div>
    <div class="swstring">${ps.map(p=>`<i style="background:${p.sw}"></i>`).join('')}</div>
    <div class="muted sm2" style="margin:6px 0 12px">Each set is one full string of the whole series.</div>
    <div class="mrow" style="align-items:center"><span>Number of sets</span><span class="pqs"><button type="button" onclick="pqStep2(this,-1)">−</button><input name="qty" type="number" min="1" max="20" value="1"><button type="button" onclick="pqStep2(this,1)">+</button></span></div>
    <label>Note for HTT (optional)<input name="note" maxlength="300" placeholder="e.g. best time to deliver"></label>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px"><button type="button" class="btn-o" onclick="closeModal()">Back</button><button class="btn">Send request</button></div>
  </form>`;
  m.style.display='flex';
}
function pqStep2(btn,d){ const i=btn.parentNode.querySelector('input'); i.value=Math.max(1,Math.min(20,(+i.value||1)+d)); }
function submitSwatches(f, storeId, seriesId){
  const no = 'DBR-'+String(Math.max(...BOARD_REQS.map(r=>+r.no.split('-')[1]))+1).padStart(4,'0');
  BOARD_REQS.unshift({no, type:'new', store:storeId, series:seriesId, boardType:'swatch', colours:PRODUCTS.filter(p=>p.series===seriesId).map(p=>p.colour), qty:+f.qty.value||1, note:f.note.value||null, submitted:SYSTEM_INFO.systemDate, status:'Requested'});
  closeModal(); toast(`${no} sent — HTT has been notified`); go('#/boards?tab=requests');
}
function boardInfo(id){
  { const bb=BOARDS.find(x=>x.id===id); if(bb&&bb.type==='swatch') return swatchInfo(bb); }
  const b=BOARDS.find(x=>x.id===id), S=SERIES.find(x=>x.id===b.series), m=document.getElementById('modal');
  const fl=boardFlags(b), pend=BOARD_REQS.find(r=>r.status!=='Completed'&&(r.boards||[]).includes(b.id));
  const sw=c=>{const p=PRODUCTS.find(x=>x.series===b.series&&x.colour===c);return p&&p.sw?p.sw:'#bbb';};
  const months = Math.round((dIso(SYSTEM_INFO.systemDate)-dIso(b.since))/864e5/30.4);
  m.innerHTML = `<div class="mbox" style="width:560px">
    <div class="bvis t-${b.type}" style="border-radius:8px;margin:-4px 0 14px">${b.colours.map(c=>`<i style="background:${sw(c)}"><span>${esc(c)}</span></i>`).join('')}</div>
    <h3 class="serif" style="font-weight:500;font-size:26px;margin:0">${S.name} <span class="muted" style="font-size:14px;font-family:inherit">${b.id}</span></h3>
    <div class="muted sm2" style="margin:2px 0 12px">${BOARD_TYPES[b.type]} · ${esc(storeName(b.store))} · on display ${months<12?months+' months':(months/12).toFixed(1)+' years'} (since ${fmtDay(b.since)})</div>
    ${b.type==='panel'?`<div class="muted sm2" style="margin:-6px 0 8px">${panelQty(b)} panels received in total — quantity per colour:</div>`:b.type==='swatch'?`<div class="muted sm2" style="margin:-6px 0 8px">${b.qty||1} swatch set${(b.qty||1)>1?'s':''} received in total</div>`:''}
    <div class="bchips">${b.colours.map(c=>`<span><i style="background:${sw(c)}"></i>${esc(c)}${b.type==='panel'?` <b class="cq">× ${cQty(b,c)}</b>`:''}</span>`).join('')}${PRODUCTS.filter(p=>p.series===b.series&&!b.colours.includes(p.colour)).map(p=>`<span class="miss"><i style="background:${p.sw}"></i>${esc(p.colour)}${p.isNew?' <em>NEW</em>':''}</span>`).join('')}</div>
    ${b.colours.length<S.colours?'<div class="muted sm2" style="margin:-2px 0 8px">Dashed = colours not on this board</div>':''}
    ${fl.length?`<ul class="bflags">${fl.map(f=>`<li class="${f[0]}">${f[1]}</li>`).join('')}</ul>`:'<div class="bok">✓ Up to date</div>'}
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px;align-items:center">
      ${pend?`<span class="muted sm2" style="margin-right:auto">${pend.no} ${reqSt(pend).toLowerCase()}</span><button class="btn-o" onclick="closeModal()">Close</button><a class="btn" href="#/boards?tab=requests" onclick="closeModal()">View request</a>`
        :`<button class="txtbtn" style="margin-right:auto" onclick="boardReq('return','${b.id}')">Return this board</button><button class="btn-o" onclick="closeModal()">Close</button>${b.type==='panel'?`<button class="btn" onclick="reqPanels('${b.store}','${b.series}')">Request more panels</button>`:`<button class="btn" onclick="boardReq('replace','${b.id}')">Update board</button>`}`}
    </div></div>`;
  m.style.display='flex';
}
/* 已有的 Swatches：显示拿了几套，可以再要几套或退回 */
function swatchInfo(b){
  const S=SERIES.find(x=>x.id===b.series), m=document.getElementById('modal'), ps=PRODUCTS.filter(p=>p.series===b.series);
  const newOnes = ps.filter(p=>!b.colours.includes(p.colour));
  m.innerHTML = `<div class="mbox" style="width:520px">
    <span class="dlgk sw">Swatches</span>
    <h3 class="serif" style="font-weight:500;font-size:26px;margin:2px 0 2px">${S.name}</h3>
    <div class="muted sm2" style="margin-bottom:14px">${esc(storeName(b.store))}</div>
    <div class="swbig"><b>${b.qty||1}</b><span>swatch set${(b.qty||1)>1?'s':''} received<br><small>first on ${fmtDay(b.since)}</small></span></div>
    <div class="swstring">${ps.map(p=>`<i style="background:${p.sw}"></i>`).join('')}</div>
    <div class="muted sm2" style="margin-top:6px">One full string · whole series</div>
    ${newOnes.length?`<div class="bflag info" style="margin-top:8px">The series has new colours since your last set — a new set will include them.</div>`:''}
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px;align-items:center">
      <button class="txtbtn" style="margin-right:auto" onclick="boardReq('return','${b.id}')">Return swatches</button><button class="btn-o" onclick="closeModal()">Close</button><button class="btn" onclick="reqSwatches('${b.store}','${b.series}')">Request more sets</button></div>
  </div>`;
  m.style.display='flex';
}
function boardReq(type, boardId, storeId, seriesId, preType){
  const b = boardId ? BOARDS.find(x=>x.id===boardId) : null, m=document.getElementById('modal');
  const flo = SERIES.filter(s=>s.cat!=='Accessories');
  const colourBoxes = sid => PRODUCTS.filter(p=>p.series===sid).map(p=>`<label class="cpick"><input type="checkbox" name="colours" value="${esc(p.colour)}" data-new="${p.isNew?1:''}" data-promo="${p.promo?1:''}" ${b&&!b.colours.includes(p.colour)&&p.isNew?'checked':''}><i style="background:${p.sw}"></i>${esc(p.colour)}${p.isNew?' <em>NEW</em>':''}</label>`).join('');
  const title = type==='new'?'Request a new display board':type==='replace'?`Replace / update ${b.id}`:`Return ${b.id}`;
  m.innerHTML = `<form class="mbox" style="width:560px" onsubmit="event.preventDefault();submitBoardReq(this,'${type}','${boardId||''}')">
    <h3 class="serif" style="font-weight:500;font-size:26px;margin:0 0 6px">${title}</h3>
    ${b?`<div class="qsum"><div><span>Board</span><b>${(SERIES.find(x=>x.id===b.series)||{}).name} · ${BOARD_TYPES[b.type]}</b></div><div><span>Store</span><b>${esc(storeName(b.store))}</b></div><div><span>Colours</span><b>${b.colours.length}</b></div></div>`:''}
    ${type==='new'?`<label>Store<select name="store">${STORES().map(a=>`<option value="${a.addressId}" ${a.addressId===storeId?'selected':''}>${esc(a.label)}</option>`).join('')}</select></label>
      <label>Series<select name="series" onchange="document.getElementById('cpk').innerHTML=boardColourBoxes(this.value)">${[...new Set(flo.map(x=>x.cat))].map(c=>`<optgroup label="${c}">${flo.filter(x=>x.cat===c).map(x=>`<option value="${x.id}" ${x.id===seriesId?'selected':''}>${x.name}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <label>Board type<select name="boardType" onchange="const w=FULL_SET(this.value);document.getElementById('cpkwrap').style.display=w?'none':'';document.getElementById('swnote').style.display=w?'':'none'">${Object.entries(BOARD_TYPES).map(([k,v])=>`<option value="${k}" ${k===(preType||'stand')?'selected':''}>${v}</option>`).join('')}</select></label>
      <p id="swnote" class="muted" style="font-size:12px;margin:0 0 8px;${FULL_SET(preType||'stand')?'':'display:none'}">No need to choose colours — swatches come as a full set, and HTT picks the colours for stands.</p>
      <div id="cpkwrap" style="${FULL_SET(preType||'stand')?'display:none':''}"><div class="lbl2">Colours <span class="muted">(leave empty for all colours)</span>${quickPick(false)}</div><div class="cpk" id="cpk">${colourBoxes(seriesId||flo[0].id)}</div></div>
      <label>Quantity<input name="qty" type="number" min="1" max="5" value="1"></label>`
    :type==='replace'?`<label>Reason<select name="reason"><option>Add new colours</option><option>Damaged</option><option>Outdated / discontinued colours</option><option>Change to a different board type</option><option>Other</option></select></label>
      ${FULL_SET(b.type)?`<p class="muted" style="font-size:12px;margin:0 0 8px">${b.type==='swatch'?'Swatches are replaced as a full set with every current colour in the series.':'HTT will choose the colours for the new stand. Add a note below if you want specific colours.'}</p>`:`<div class="lbl2">Colours on the new board${quickPick(true)}</div><div class="cpk">${PRODUCTS.filter(p=>p.series===b.series).map(p=>`<label class="cpick"><input type="checkbox" name="colours" value="${esc(p.colour)}" data-cur="${b.colours.includes(p.colour)?1:''}" data-new="${p.isNew?1:''}" data-promo="${p.promo?1:''}" ${b.colours.includes(p.colour)||p.isNew?'checked':''}><i style="background:${p.sw}"></i>${esc(p.colour)}${p.isNew?' <em>NEW</em>':''}</label>`).join('')}</div>`}`
    :`<label>Reason<select name="reason"><option>No longer selling this series</option><option>Damaged</option><option>Store closing or renovating</option><option>Other</option></select></label>
      <p class="muted" style="font-size:12px">HTT will contact you to arrange pick up.</p>`}
    <label>Note for HTT (optional)<input name="note" maxlength="300" placeholder="e.g. best time to deliver"></label>
    <p class="muted" style="font-size:12px;margin:4px 0 0">HTT is notified straight away and will confirm a ${type==='return'?'pick up':'delivery'} date.</p>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><button type="button" class="btn-o" onclick="closeModal()">Back</button><button class="btn">Send request</button></div>
  </form>`;
  m.style.display='flex';
}
/* 颜色快捷选择 */
function quickPick(hasCur){ return `<span class="qpick">${[['all','All'],['none','Clear']].map(([k,l])=>`<button type="button" onclick="qpick(this,'${k}')">${l}</button>`).join('')}<em></em></span>`; }
function qpick(btn, k){
  const box = btn.closest('form').querySelectorAll('input[name=colours]');
  box.forEach(x=>{ const d=x.dataset; x.checked = k==='all' ? true : k==='none' ? false : k==='cur' ? !!d.cur : k==='curnew' ? !!(d.cur||d.new) : k==='new' ? !!d.new : !!d.promo; });
  btn.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on', b===btn));
  btn.parentNode.querySelector('em').textContent = [...box].filter(x=>x.checked).length+' selected';
}
function boardColourBoxes(sid){ return PRODUCTS.filter(p=>p.series===sid).map(p=>`<label class="cpick"><input type="checkbox" name="colours" value="${esc(p.colour)}" data-new="${p.isNew?1:''}" data-promo="${p.promo?1:''}"><i style="background:${p.sw}"></i>${esc(p.colour)}${p.isNew?' <em>NEW</em>':''}</label>`).join(''); }
function submitBoardReq(f, type, boardId){
  const b = boardId ? BOARDS.find(x=>x.id===boardId) : null;
  const colours = [...f.querySelectorAll('input[name=colours]:checked')].map(x=>x.value);
  const no = 'DBR-'+String(Math.max(...BOARD_REQS.map(r=>+r.no.split('-')[1]))+1).padStart(4,'0');
  // IT: POST /api/portal/me/display-board-requests
  BOARD_REQS.unshift({no, type, store: b?b.store:f.store.value, series: b?b.series:f.series.value, boardType: f.boardType?f.boardType.value:(b&&b.type), boards: b?[b.id]:null,
    colours: type==='return'?null:((f.boardType&&f.boardType.value==='swatch')||(!f.boardType&&b&&b.type==='swatch')||!colours.length)?PRODUCTS.filter(p=>p.series===(b?b.series:f.series.value)).map(p=>p.colour):(colours.length?colours:PRODUCTS.filter(p=>p.series===(b?b.series:f.series.value)).map(p=>p.colour)), qty: f.qty?+f.qty.value:1,
    reason: f.reason?f.reason.value:null, note: f.note.value||null, submitted: SYSTEM_INFO.systemDate, status:'Requested'});
  closeModal(); toast(`${no} sent — HTT has been notified`); go('#/boards?tab=requests');
}

/* =====================================================================
   返利（给 IT）
   · 只按「已开票」数量计算（已下单未开票的不算），再减去已确认的退货（Return）。
   · 期间结束后结算：开 Credit Note 抵发票，或银行转账。都在开票之后。
   IT: GET /api/portal/me/rebates/programs      当前生效的返利方案
       GET /api/portal/me/rebates/progress      本期进度（已开票数量）
       GET /api/portal/me/rebates/history?from&to  历史结算（含未达标期间）
   以下本期进度、结算方式为示例数据。
   ===================================================================== */
// 阶梯返利：按「系列」计算（系列下所有颜色合计），不按单个颜色。每档 = 门槛 + 每 m² 返多少。
// 计算方式以系统为准；原型按「达到哪一档，全部净数量都按那一档单价」示意。阶梯数字为示例。
const REBATE_PROGRAMS = [
  {product:'Bonita series', seriesId:'bonita', sku:'All 9 colours', cycle:'Monthly',
   tiers:[{min:350, rate:1.00},{min:500, rate:1.20},{min:800, rate:1.50}],
   cur:{from:'2026-11-01', to:'2026-11-30', invoiced:225.48, returned:15.00, settleBy:'2026-12-05'}},
  {product:'Heritage series', seriesId:'heritage', sku:'All colours', cycle:'Quarterly',
   tiers:[{min:500, rate:1.20},{min:800, rate:1.40}],
   cur:{from:'2026-10-01', to:'2026-12-31', invoiced:382.60, returned:0, settleBy:'2027-01-12'}},
];
REBATE_PROGRAMS.forEach(p=>{ p.min=p.tiers[0].min; p.rate=p.tiers[0].rate; });
function tierOf(p, net){ let t=null; p.tiers.forEach((x,i)=>{ if(net>=x.min) t={...x, idx:i}; }); return t; }
/* 计算方式（HTT 规则）：分段累进。门槛以下没有返利；超过第 1 档门槛的部分按第 1 档单价，超过第 2 档门槛的部分按第 2 档单价……
   例：阶梯 350 m² → $1.00、500 m² → $1.20，净数量 600 m² ⇒ (500−350)×1.00 + (600−500)×1.20 = $270（不含 GST）。IT：以系统计算结果为准 */
function rebateFor(p, net){ let a=0; p.tiers.forEach((t,i)=>{ const hi=p.tiers[i+1]?p.tiers[i+1].min:Infinity; if(net>t.min) a+=(Math.min(net,hi)-t.min)*t.rate; }); return r2(a); }
/* 本期状态：进度、预测、提醒（退货从原来开票的那一期扣） */
function rebateInfo(p){
  const c=p.cur, net=r2(c.invoiced-c.returned), cur=tierOf(p,net), next=p.tiers.find(t=>net<t.min);
  const sys=dIso(SYSTEM_INFO.systemDate), f=dIso(c.from), t=dIso(c.to);
  const total=Math.round((t-f)/864e5)+1, elapsed=Math.min(total, Math.round((sys-f)/864e5)+1), daysLeft=Math.max(0,total-elapsed);
  const pace=net/Math.max(1,elapsed), projected=r2(net+pace*daysLeft);
  const toGo = next ? r2(next.min-net) : 0, perDay = daysLeft ? r2(toGo/daysLeft) : toGo;
  const near = !!next && (toGo <= next.min*0.15 || Math.abs(projected-next.min) <= next.min*0.1);   // 差一点：差 15% 以内，或预测落在门槛 ±10%
  const onTrack = !!next && projected>=next.min;
  return {c, net, cur, next, earned:gst(rebateFor(p,net)), daysLeft, elapsed, total, projected, toGo, perDay, near, onTrack,
    projEarn: gst(rebateFor(p, projected)), nextRate: next?gst(next.rate):0};
}
// 结算方式：credit = Credit Note 抵发票；transfer = 银行转账
const REBATE_SETTLE = {
  'REB-2026-1038':{method:'transfer', date:'2026-11-07'},
  'REB-2026-0931':{method:'credit', cn:'CN-R0931', inv:'INV-10355'},
  'REB-2026-0924':{method:'credit', cn:'CN-R0924', inv:'INV-10340'},
  'REB-2026-0817':{method:'transfer', date:'2026-09-09'},
  'REB-2026-0612':{method:'credit', cn:'CN-R0612', inv:'INV-10288'},
  'REB-2026-0609':{method:'transfer', date:'2026-07-08'},
};
// 未达标期间（没有返利，但要让客户看到差多少）
const REBATE_MISSED = [
  {prod:'Bonita series', sku:'All colours', seriesId:'bonita', min:350, rate:1.00, cycle:'Monthly', from:'2026-07-01', to:'2026-07-31', qty:287.40},
];
const dIso = iso => new Date(iso+'T00:00:00Z');
const MON3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDay = iso => { const d=dIso(iso); return `${String(d.getUTCDate()).padStart(2,'0')} ${MON3[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const fmtPeriod = (f,t) => `${fmtDay(f)} – ${fmtDay(t)}`;
const legacyIso = s => { const d=new Date(s.replace('Sept','Sep')+' UTC'); return d.toISOString().slice(0,10); };
let DEMO_MANY = false;   // 原型演示：模拟 300 条返利记录（正式版删除）
function demoRebateRows(){
  const out=[], prods=SALES_SERIES.filter(x=>x.unit==='m²').map(x=>({prod:x.name+' series', sku:'All colours', seriesId:'demo-'+x.id}));
  const months=['2026-07','2026-08','2026-09','2026-10'];
  let n=2000;
  for(let i=0;out.length<300;i++){ const p=prods[i%prods.length], m=months[Math.floor(i/prods.length)%4], to=`${m}-${m.endsWith('09')||m.endsWith('11')?'30':'31'}`;
    const qty=r2(200+seeded(p.sku+m+i)*400), met=qty>=350;
    out.push({no:met?`REB-2026-${n++}`:null, prod:p.prod, sku:p.sku, seriesId:p.seriesId, cycle:'Monthly', min:350, rate:1.00, from:`${m}-01`, to, qty, amount:met?r2(qty-350):0, settledOn:null, met,
      st: met?(i%2?{method:'transfer', date:to}:{method:'credit', cn:'CN-R'+n, inv:'INV-1'+(n%900+100)}):null}); }
  return out;
}
function rebateRows(){
  const settled = REBATES.map(r=>{ const [f,t]=r.period.split(' – ').map(legacyIso);
    return {no:r.no, seriesId:r.seriesId, prod:r.prod, sku:r.sku, cycle:r.cycle, min:r.min, rate:r.rate, from:f, to:t, qty:r.qty, amount:r2(Math.max(0,r.qty-r.min)*r.rate), settledOn:legacyIso(r.settled), met:true, st:REBATE_SETTLE[r.no]}; });
  const missed = REBATE_MISSED.map(m=>({no:null, ...m, amount:0, met:false}));
  return [...settled, ...missed, ...(DEMO_MANY?demoRebateRows():[])].sort((a,b)=>b.to.localeCompare(a.to));
}
const gst = v => r2(v*1.1);   // 返利金额统一显示含 GST（与 Sales、Invoices 一致）。系统按不含 GST 计算，开 Credit Note / 转账时加 GST
function progressCard(p){
  const I=rebateInfo(p), c=I.c, net=I.net;
  const top=p.tiers.at(-1).min*1.12, pos=v=>Math.min(100, v/top*100);
  const link = '#/series/'+p.seriesId;
  const ser = SALES_SERIES.find(x=>x.id===p.seriesId);
  const per = {key:'rb', from:dIso(c.from), to:dIso(c.to<SYSTEM_INFO.systemDate?c.to:SYSTEM_INFO.systemDate)}; per.days=Math.round((per.to-per.from)/864e5)+1;
  const S = ser ? buildSales(per).find(x=>x.id===ser.id) : null;
  const cols = S ? S.cols.filter(x=>x.qty>0) : [];
  const badge = I.cur && !I.next ? ['b-completed','Top tier reached'] : I.near ? ['b-warn','Almost there'] : I.cur ? ['b-completed',`Tier ${I.cur.idx+1} · earning`] : ['b-open',I.daysLeft+' days left'];
  const msg = !I.next ? `Top tier reached — earning <b class="green">${money(gst(p.tiers.at(-1).rate))}/m²</b> on every m² above ${p.tiers.at(-1).min} m²`
    : I.cur ? `Earning <b class="green">${money(gst(I.cur.rate))}/m²</b> above ${I.cur.min} m² · <b>${I.toGo.toFixed(2)} m²</b> more and every m² above ${I.next.min} m² earns <b class="green">${money(I.nextRate)}</b>`
    : `<b>${I.toGo.toFixed(2)} m²</b> more to reach ${I.next.min} m² — then every m² above it earns <b class="green">${money(I.nextRate)}</b>`;
  return `<div class="rprog ${I.near?'near':''}">
    <div class="rp-top"><div><a class="rp-name" href="${link}">${esc(p.product)}</a><div class="muted" style="font-size:11px">${p.sku} combined · ${p.cycle} · ${fmtPeriod(c.from,c.to)}</div></div>
      <span class="badge ${badge[0]}">${badge[1]}</span></div>
    <div class="rp-num"><b>${net.toFixed(2)}</b> m² <span>net · ${c.invoiced.toFixed(2)} invoiced − ${c.returned.toFixed(2)} returned${STORE!=='all'?' · whole account':''}</span></div>
    ${STORE!=='all'?(k=>`<div class="stuse">📍 ${esc((STORES().find(a=>a.addressId===STORE)||{}).label||'')} contributed <b>${r2(net*k).toFixed(2)} m²</b> (${Math.round(k*100)}%) · about ${money(r2(I.earned*k))} of this deal</div>`)(STORE_K[STORE]||0.5):''}
    <div class="ladder">
      <div class="lbar"><div class="lfill" style="width:${pos(net)}%"></div><div class="lproj" style="left:${pos(net)}%;width:${Math.max(0,pos(I.projected)-pos(net))}%"></div></div>
      <div class="lnow" style="left:${pos(net)}%"><span>You · ${net.toFixed(0)} m²</span></div>
      ${p.tiers.map((t,i)=>`<div class="ltick ${net>=t.min?'hit':''}" style="left:${pos(t.min)}%"><i></i><span><b>${t.min} m²+</b>${money(gst(t.rate))}/m²</span></div>`).join('')}
    </div>
    <div class="rp-cta ${I.near?'warn':''}"><div>${msg}
      <span>Rebate so far <b>${money(I.earned)}</b> · ${I.daysLeft} days left${I.next?` · need ~${I.perDay} m²/day`:''}</span></div></div>
    ${I.next?`<div class="rp-proj ${I.onTrack&&!I.near?'ok':''}">${I.onTrack?'✓':'↗'} At your current pace: about <b>${I.projected.toFixed(0)} m²</b> by ${fmtDay(c.to)}${I.onTrack?(I.near?` — only just over ${I.next.min} m², keep ordering to be safe`:` — on track for ${I.next.min} m²+ (est. ${money(I.projEarn)})`):` — ${r2(I.next.min-I.projected).toFixed(0)} m² short of ${I.next.min} m²`}</div>`:''}
    ${cols.length?`<details class="rp-cols"><summary>See colours (${cols.length})</summary>${cols.map(x=>`<div class="rc"><span>${esc(x.colour)}</span><i><i style="width:${x.qty/Math.max(...cols.map(y=>y.qty))*100}%"></i></i><b>${x.qty.toFixed(2)} m²</b><em>${Math.round(x.qty/net*100)}%</em></div>`).join('')}</details>`:''}
    <div class="rp-foot muted">Paid by ${fmtDay(c.settleBy)} · incl. GST · returns are deducted from the period they were invoiced in</div>
  </div>`;
}
function settleCell(r){
  if(!r.met) return `<span class="badge b-expired">Not reached</span><div class="muted sm2" style="margin-top:3px">${r2(r.min-r.qty).toFixed(2)} m² short</div>`;
  const st=r.st; if(!st) return '<span class="badge b-open">Pending</span>';
  return st.method==='credit'
    ? `<span class="badge b-completed">Credit note</span><div class="sm2" style="margin-top:3px">${st.cn} → applied to <a class="lnk" href="#/invoices/${st.inv.toLowerCase()}">${st.inv}</a></div>`
    : `<span class="badge b-completed">Bank transfer</span><div class="sm2" style="margin-top:3px">Paid ${fmtDay(st.date)}</div>`;
}
function rebateCsv(){
  const rows=[['Rebate','Series','Colours','Cycle','From','To','Minimum m2','Rate per m2','Net m2 (invoiced - returns)','Rebate (incl. GST)','Status','Settlement']].concat(
    rebateRows().map(r=>[r.no||'',r.prod,r.sku,r.cycle,r.from,r.to,r.min,r.rate,r.qty,gst(r.amount),r.met?'Settled':'Not reached',
      !r.met?'':r.st?.method==='credit'?`${r.st.cn} applied to ${r.st.inv}`:r.st?`Bank transfer ${r.st.date}`:'Pending']));
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  try{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='rebates.csv'; a.click(); }
  catch(e){ toast('Download is not available here'); }
}
function filterRebates(){
  const q=document.getElementById('rq').value.toLowerCase(), prod=document.getElementById('rp').value, cyc=document.getElementById('rc').value, stv=(document.getElementById('rs')||{}).value||'All';
  document.querySelectorAll('#rtbl tbody tr').forEach(tr=>{ const d=tr.dataset;
    d.f = tr.textContent.toLowerCase().includes(q) && (prod==='All products'||d.prod===prod) && (cyc==='All cycles'||d.cyc===cyc) && (stv==='All'||d.st===stv) ? '1' : '0'; });
  pager('rtbl',1);
}
const fyOf = iso => { const d=dIso(iso), y=d.getUTCMonth()>=6?d.getUTCFullYear():d.getUTCFullYear()-1; return `FY ${y}–${String(y+1).slice(2)}`; };
function rebates(params){
  const R = pageRange(params);
  const rows = rebateRows().filter(r=>r.to>=ISO(R.from) && r.to<=ISO(R.to));
  const met = rows.filter(r=>r.met);
  const earned = gst(met.reduce((t,r)=>t+r.amount,0));
  const byCN = gst(met.filter(r=>r.st&&r.st.method==='credit').reduce((t,r)=>t+r.amount,0)), byBank = gst(met.filter(r=>r.st&&r.st.method==='transfer').reduce((t,r)=>t+r.amount,0));
  const pend = gst(met.filter(r=>!r.st).reduce((t,r)=>t+r.amount,0));
  const missedN = rows.length-met.length;
  const progs = REBATE_PROGRAMS.map(p=>({p, ...rebateInfo(p)})).map(x=>({...x, now:x.earned}));
  const nowTot = r2(progs.reduce((t,x)=>t+x.now,0)), projTot = r2(progs.reduce((t,x)=>t+x.projEarn,0)), nearN = progs.filter(x=>x.near).length;
  const nx = [...progs].sort((a,b)=>a.p.cur.settleBy.localeCompare(b.p.cur.settleBy))[0];
  const prods = [...new Set(rows.map(r=>r.prod))];
  return `<div class="page-head"><div class="wrap"><h1>Rebate</h1><p>Your rebate programs, progress this period and past settlements. All amounts incl. GST.</p></div></div>
  <div class="wrap" style="padding-top:22px">
    ${dateBar(R,false)}
    <div class="stats">
      ${stat(`Rebates earned · ${R.label}`, money(earned), `${dpShort(R.from,R.to)} · ${met.length} period${met.length!==1?'s':''} reached`)}
      ${stat('Rebate so far this period', money(nowTot), `at current pace about ${money(projTot)} by period end${nearN?` · ${nearN} almost there`:''}`)}
      ${stat('Next settlement', nx?fmtDay(nx.p.cur.settleBy):'-', nx?`${esc(nx.p.product)} · est. ${money(nx.projEarn)} at current pace`:'')}
    </div>

    <div class="rsec"><h2>This period</h2><span class="muted">Current period, not affected by the date filter. Counts invoiced quantities minus returns.</span></div>
    <div class="rgrid2">${REBATE_PROGRAMS.map(progressCard).join('')}</div>
    <div class="rpay"><b>How rebates are calculated</b> — tiers work in steps. Nothing is earned below the first tier. Each m² above a tier's minimum earns that tier's rate.
      <div class="rex" ${PRICE_ON?'':'style="display:none"'}>Example (Bonita): 600 m² net ⇒ 0–350 m²: $0 · 350–500 m²: 150 × $1.10 = $165.00 · 500–600 m²: 100 × $1.32 = $132.00 · <b>total $297.00</b></div>
      Quantities are invoiced minus returns; a return is deducted from the period the goods were invoiced in. Rebates are paid after the period ends — as a credit note on one of your invoices, or by bank transfer. All amounts incl. GST.</div>

    <div class="rsec" style="justify-content:space-between"><h2>History</h2><button class="btn-o sm" onclick="rebateCsv()">Export CSV</button></div>
    <div class="rsum">
      <div><span>Earned</span><b class="green">${money(earned)}</b></div>
      <div><span>By credit note</span><b>${money(byCN)}</b></div>
      <div><span>By bank transfer</span><b>${money(byBank)}</b></div>
      ${pend?`<div><span>Pending</span><b>${money(pend)}</b></div>`:''}
      <div><span>Not reached</span><b>${missedN} period${missedN!==1?'s':''}</b></div>
    </div>
    <div class="rfilters">
      <div class="mini-search" style="flex:1;width:auto">${ICON.search}<input id="rq" placeholder="Search product, SKU, rebate, credit note or invoice number..." oninput="filterRebates()"></div>
      <select class="sel" id="rs" onchange="filterRebates()"><option value="All">All results</option><option value="Settled">Settled</option><option value="Not reached">Not reached</option></select>
      <select class="sel" id="rp" onchange="filterRebates()"><option value="All products">All series</option>${prods.map(p=>`<option>${p}</option>`).join('')}</select>
      <select class="sel" id="rc" onchange="filterRebates()"><option>All cycles</option><option>Monthly</option><option>Quarterly</option></select>
    </div>
    ${rows.length?'':'<p class="muted" style="padding:20px;text-align:center;background:#fff;border:1px solid var(--line);border-radius:8px">No rebate periods ended in this date range.</p>'}
    <table class="stable" id="rtbl" style="${rows.length?'':'display:none'}"><thead><tr><th>Rebate / series</th><th>Period</th><th>Net quantity vs minimum</th><th>Rate</th><th>Rebate</th><th>Settlement</th></tr></thead><tbody>
      ${rows.map(r=>`<tr data-prod="${esc(r.prod)}" data-cyc="${r.cycle}" data-st="${r.met?'Settled':'Not reached'}" data-fy="${fyOf(r.to)}" class="${r.met?'':'missed'}">
        <td>${r.no?`<b>${r.no}</b><br>`:''}<span class="green">${esc(r.prod)}</span> <span class="muted sm2">· ${r.sku}</span></td>
        <td>${r.cycle}<br><span class="muted sm2">${fmtPeriod(r.from,r.to)}</span></td>
        <td>${r.qty.toFixed(2)} / ${r.min.toFixed(0)} m²<div class="minibar"><i style="width:${Math.min(100,r.qty/r.min*100)}%;background:${r.met?'var(--green-700)':'var(--red)'}"></i></div></td>
        <td>${money(gst(r.rate))}<span class="muted sm2">/m²</span><div class="muted sm2">above ${r.min} m²</div></td>
        <td><b class="${r.met?'green':'muted'}">${money(gst(r.amount))}</b></td>
        <td style="text-align:left">${settleCell(r)}${r.met&&r.settledOn?`<div class="muted sm2">Calculated ${fmtDay(r.settledOn)}</div>`:''}</td></tr>`).join('')}
    </tbody></table>
    <p class="muted" style="font-size:11px;margin:14px 0 18px">Amounts in AUD, incl. GST. Rebates are calculated on invoiced quantities after returns — the same figures as the Insights page — and paid after the period ends.</p>
    <div class="demo" style="margin:0 0 50px">原型演示（正式版删除）：<label><input type="checkbox" ${DEMO_MANY?'checked':''} onchange="DEMO_MANY=this.checked;render()"> 模拟 300 条记录，看分页效果</label></div>
  </div>`;
}

/* =====================================================================
   联系人对接（给 IT）
   接口格式见文档《客户门户 · 联系人信息对接说明（给 IT）》。
   正式接入时，把下面 portalApi 里的三个函数换成真正的 fetch 调用：
     GET  /api/portal/me/account-manager
     GET  /api/portal/me/contacts
     POST /api/portal/me/contact-change-requests
   customer ID 由后端从登录 session 取，前端不传。
   以下 MOCK_* 为示例数据（姓名、电话、邮箱均为虚构）。
   ===================================================================== */
const MOCK_ACCOUNT_MANAGER = {
  accountManager:{employeeId:'EMP-0142', name:'Daniel Chen', title:'Account Manager · Melbourne', phone:'03 9000 1234', mobile:'0400 111 222',
    email:'daniel@httflooring.com.au', photoUrl:null, onLeave:false, leaveUntil:null},
  backup:{employeeId:'EMP-0087', name:'Sarah Lee', title:'Sales Support · Melbourne', phone:'03 9000 1200', email:'sarah@httflooring.com.au'},
  branch:{name:'HTT Flooring Melbourne', phone:'03 9000 1000', email:'melbourne@httflooring.com.au', hours:'Mon–Fri 7:30am–4:30pm'},
  syncedAt:'2026-11-18T11:40:00+11:00'
};
const MOCK_CONTACTS = {
  contacts:[
    {contactId:'CON-5521', name:'John Smith', role:'Primary', position:'Director', email:'john@abcflooring.com.au', mobile:'0412 345 678', phone:null, receivesInvoices:false, receivesOrderUpdates:true},
    {contactId:'CON-5522', name:'Mary Wong', role:'Accounts', position:'Accounts Payable', email:'accounts@abcflooring.com.au', mobile:null, phone:'03 9555 0101', receivesInvoices:true, receivesOrderUpdates:false},
  ],
  pendingRequests:[],
  syncedAt:'2026-11-18T11:40:00+11:00'
};
// 原型演示用：模拟三种情况（正常 / 休假 / 未指定客户经理）
let DEMO_AM_STATE = 'normal';
const portalApi = {
  async getAccountManager(){            // IT: return (await fetch('/api/portal/me/account-manager',{credentials:'include'})).json();
    const d = structuredClone(MOCK_ACCOUNT_MANAGER);
    if(DEMO_AM_STATE==='leave'){ d.accountManager.onLeave=true; d.accountManager.leaveUntil='2026-11-28'; }
    if(DEMO_AM_STATE==='none'){ d.accountManager=null; d.backup=null; }
    return d;
  },
  async getContacts(){                  // IT: return (await fetch('/api/portal/me/contacts',{credentials:'include'})).json();
    return structuredClone(MOCK_CONTACTS);
  },
  async submitChangeRequest(req){       // IT: POST /api/portal/me/contact-change-requests，返回 {requestId, status:'pending'}
    const r = {requestId:'CR-'+String(31+MOCK_CONTACTS.pendingRequests.length).padStart(4,'0'), type:req.type, contactId:req.contactId||null,
      changes:req.changes, submittedAt:new Date().toISOString(), status:'pending'};
    MOCK_CONTACTS.pendingRequests.push(r); return r;
  }
};

/* =====================================================================
   账户、信用、付款条款、地址、多用户 —— 对接（给 IT）
     GET   /api/portal/me/account-summary   客户编号、账户状态、信用额度、付款条款、地址（读主系统）
     GET   /api/portal/me/users             本公司的门户登录账号（门户自己的用户表）
     POST  /api/portal/me/users             邀请员工（发邮件让对方自己设密码）
     PATCH /api/portal/me/users/{userId}    改角色 / 停用
     GET   /api/portal/me/statement         对账单（Invoices 页）
   以下 MOCK 为示例：客户编号、额度、地址均为虚构。
   ===================================================================== */
let DEMO_STATUS = 'active';   // 原型演示：active / on_hold / over_limit
const MOCK_SUMMARY = {
  customerId:'C-10235',
  status:'active', statusReason:null, statusSince:null,
  credit:{limit:30000.00, currency:'AUD'},          // used / available 由系统计算后返回；这里用门户数据模拟
  paymentTerms:{code:'NET14', description:'14 days from invoice date'},
  addresses:{
    billing:{line1:'12 Example Street', suburb:'Richmond', state:'VIC', postcode:'3121', country:'Australia'},
    // 门店与送货地址。同一个 Customer ID 下的所有门店，账单统一开给上面的 billing（主门店）。
    // type: main = 主门店（账单走这里）· store = 同账号下的其它门店 · delivery = 只是送货地址（仓库、工地）
    // 账单要分开走的门店 → 不放这里，由 HTT 另开一个 Customer ID 和门户账号。
    delivery:[
      {addressId:'ADR-01', type:'main', label:'ABC Flooring Richmond', line1:'12 Example Street', suburb:'Richmond', state:'VIC', postcode:'3121', phone:'03 9555 0100', contact:'John Smith', isDefault:false, notes:null},
      {addressId:'ADR-02', type:'store', label:'ABC Flooring Geelong', line1:'210 Example Parade', suburb:'Geelong West', state:'VIC', postcode:'3218', phone:'03 5200 0130', contact:'Lisa Nguyen', isDefault:false, notes:'Rear lane access'},
      {addressId:'ADR-03', type:'delivery', label:'Warehouse', line1:'45 Sample Road', suburb:'Dandenong South', state:'VIC', postcode:'3175', phone:null, contact:null, isDefault:true, notes:'Forklift on site · 7am–3pm'},
    ]},
  syncedAt:'2026-11-18T11:40:00+11:00'
};
const MOCK_USERS = {
  currentUserId:'U-001',
  users:[
    {userId:'U-001', name:'John Smith', email:'john@abcflooring.com.au', status:'Active', lastLogin:'2026-11-18',
     permissions:{stock:true, prices:true, quotes:true, orders:true, invoices:true, rebates:true, account:true, users:true}},
    {userId:'U-002', name:'Mary Wong', email:'accounts@abcflooring.com.au', stores:'all', status:'Active', lastLogin:'2026-11-14',
     permissions:{stock:false, prices:false, quotes:false, orders:true, invoices:true, rebates:true, account:true, users:false}},
    {userId:'U-003', name:'Lisa Nguyen', email:'geelong@abcflooring.com.au', stores:['ADR-01','ADR-02'], status:'Active', lastLogin:'2026-11-17',
     permissions:{stock:true, prices:true, place:true, boards:true, quotes:true, orders:true, invoices:false, rebates:false, account:false, users:false}},
  ]
};
// 每个账号的权限由客户公司的 Admin 逐项打勾决定（后端必须同样检查，前端隐藏只是体验）
const PERMS = [
  {key:'stock',    group:'Products', label:'Check stock',           desc:'Inventory and stock levels'},
  {key:'prices',   group:'Products', label:'See prices',            desc:'Their price and promotions'},
  {key:'place',    group:'Products', label:'Place orders & quotes', desc:'Use the cart and quick order'},
  {key:'boards',   group:'Products', label:'Display boards',        desc:'See and request display boards for their store'},
  {key:'quotes',   group:'Sales',    label:'Quotes',                desc:'View quotes'},
  {key:'orders',   group:'Sales',    label:'Orders',                desc:'View and track orders'},
  {key:'invoices', group:'Finance',  label:'Invoices & statements', desc:'Invoices, credit notes, statement'},
  {key:'rebates',  group:'Finance',  label:'Rebates',               desc:'Rebate history'},
  {key:'account',  group:'Finance',  label:'Account & credit',      desc:'Credit limit, terms, status'},
  {key:'users',    group:'Admin',    label:'Manage users',          desc:'Invite staff, set access and reset passwords. Includes everything above.'},
];
const PERM_GROUPS = ['Products','Sales','Finance','Admin'];
// 快速填入：只是帮老板一键勾好，勾完还能逐项调整
const PRESETS = {
  'Purchasing':  ['stock','prices','quotes','orders'],
  'Accounts':    ['orders','invoices','rebates','account'],
  'Full access': PERMS.map(p=>p.key),
};
function openOrdersTotal(){ return r2(ORDERS.filter(o=>o.status!=='Completed'&&o.status!=='Cancelled').reduce((s,o)=>s+calc(o).total,0)); }
Object.assign(portalApi, {
  async getAccountSummary(){           // IT: return (await fetch('/api/portal/me/account-summary',{credentials:'include'})).json();
    const d = structuredClone(MOCK_SUMMARY);
    if(DEMO_STATUS==='over_limit') d.credit.limit = 25000;
    if(DEMO_COD) d.paymentTerms = {code:'COD', description:'Payment before goods are released'};
    // 信用额度按整个账号算（全部门店），切换门店时也一样
    const AI=[...INVOICES,...((typeof _HID!=='undefined'&&_HID.get(INVOICES))||[])], AO=[...ORDERS,...((typeof _HID!=='undefined'&&_HID.get(ORDERS))||[])];
    d.credit.used = r2(AI.reduce((t,i)=>t+(i.balance||0),0) + r2(AO.filter(o=>o.status!=='Completed'&&o.status!=='Cancelled').reduce((t,o)=>t+calc(o).total,0)));          // 未付发票 + 未开票订单
    d.credit.available = r2(d.credit.limit - d.credit.used);
    if(DEMO_STATUS==='on_hold'){ d.status='on_hold'; d.statusSince='2026-11-02';
      d.statusReason='Ordering is paused because some invoices are more than 60 days overdue (INV-10381, INV-10398). Please arrange payment or contact your account manager.'; }
    if(DEMO_STATUS==='over_limit'){ d.status='over_limit'; d.statusSince='2026-11-09';
      d.statusReason='Your balance and open orders are over your credit limit. New orders need a payment first or approval from your account manager.'; }
    return d;
  },
  async getUsers(){ return structuredClone(MOCK_USERS); },        // IT: GET /api/portal/me/users
  async inviteUser(u){                                             // IT: POST /api/portal/me/users → 发邀请邮件
    const n = {userId:'U-'+String(MOCK_USERS.users.length+1).padStart(3,'0'), ...u, status:'Invited', lastLogin:null};
    MOCK_USERS.users.push(n); return n;
  },
  async updateUser(id, patch){ Object.assign(MOCK_USERS.users.find(x=>x.userId===id), patch); },  // IT: PATCH /api/portal/me/users/{id}
});
const STATUS_INFO = {
  active:{label:'Active', cls:'b-completed'},
  on_hold:{label:'On hold', cls:'b-overdue'},
  over_limit:{label:'Over credit limit', cls:'b-open'},
};
const fmtAddr = a => `${esc(a.line1)}, ${esc(a.suburb)} ${esc(a.state)} ${esc(a.postcode)}`;

const initials = n => n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const fmtDate = iso => { const d=new Date(iso); return d.toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'}); };
const fmtSynced = iso => { const d=new Date(iso); return d.toLocaleString('en-AU',{day:'2-digit',month:'short',hour:'numeric',minute:'2-digit'}); };
function personLine(icon, label, value, href){
  if(!value) return '';
  return `<div class="pl"><span class="muted">${label}</span><a href="${href}">${esc(value)}</a></div>`;
}
function amCard(data){
  const am = data.accountManager, bk = data.backup, br = data.branch;
  // 规则：在岗 → 客户经理；休假 → 提示 + 备用联系人（无则门店）；未指定 → 门店
  if(!am){
    return `<div class="amcard"><div class="amtop"><div class="avatar" style="background:#ece9e2;color:var(--green-900)">HTT</div>
      <div><div class="amname">${esc(br.name)}</div><div class="muted" style="font-size:12px">${esc(br.hours)}</div></div></div>
      ${personLine('','Phone',br.phone,'tel:'+br.phone.replace(/\s/g,''))}${personLine('','Email',br.email,'mailto:'+br.email)}
      <div class="ambtns"><a class="btn" href="tel:${br.phone.replace(/\s/g,'')}">Call</a><a class="btn-o" href="mailto:${br.email}">Email</a></div></div>`;
  }
  const alt = am.onLeave ? (bk || {name:br.name, phone:br.phone, email:br.email, title:br.hours}) : null;
  const callTo = alt || am;
  const phone = callTo.mobile || callTo.phone;
  return `<div class="amcard">
    ${am.onLeave?`<div class="leave">${esc(am.name.split(' ')[0])} is on leave until ${fmtDate(am.leaveUntil)}. Please contact <b>${esc(alt.name)}</b> in the meantime.</div>`:''}
    <div class="amtop">${am.photoUrl?`<img class="avatar" src="${esc(am.photoUrl)}" alt="">`:`<div class="avatar">${initials(am.name)}</div>`}
      <div><div class="amname">${esc(am.name)}${am.onLeave?' <span class="badge b-open">On leave</span>':''}</div><div class="muted" style="font-size:12px">${esc(am.title||'Account Manager')}</div></div></div>
    ${am.onLeave?`<div style="font-size:12px;margin:4px 0 8px"><b>${esc(alt.name)}</b> <span class="muted">· ${esc(alt.title||'')}</span></div>`:''}
    ${personLine('','Phone',callTo.phone,'tel:'+(callTo.phone||'').replace(/\s/g,''))}
    ${personLine('','Mobile',callTo.mobile,'tel:'+(callTo.mobile||'').replace(/\s/g,''))}
    ${personLine('','Email',callTo.email,'mailto:'+callTo.email)}
    <div class="ambtns">${phone?`<a class="btn" href="tel:${phone.replace(/\s/g,'')}">Call</a>`:''}<a class="btn-o" href="mailto:${esc(callTo.email)}">Email</a></div>
    ${!am.onLeave && bk?`<div class="muted" style="font-size:11px;margin-top:14px;border-top:1px solid var(--line);padding-top:10px">When ${esc(am.name.split(' ')[0])} is away: ${esc(bk.name)} · ${esc(bk.phone)}</div>`:''}
  </div>`;
}
function contactCard(c, pending){
  const p = pending.find(r=>r.contactId===c.contactId && r.status==='pending');
  return `<div class="ccard">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div><b>${esc(c.name)}</b> <span class="role">${esc(c.role)}</span>${p?' <span class="badge b-open">Change pending review</span>':''}
      <div class="muted" style="font-size:12px;margin-top:3px">${esc(c.position||'')}</div></div>
      <button class="linkbtn" onclick="openContactForm('${c.contactId}')">Edit</button></div>
    <div class="kv" style="margin-top:10px"><span>Email</span><span>${esc(c.email||'-')}</span><span>Mobile</span><span>${esc(c.mobile||'-')}</span></div>
  </div>`;
}
let ACCT_CACHE = null;
function creditCard(s){
  const cr = s.credit, pct = Math.max(0, Math.min(100, cr.used / cr.limit * 100));
  const over = cr.available < 0, warn = !over && pct >= 85;
  const barColor = over ? 'var(--red)' : warn ? 'var(--amber)' : 'var(--green-700)';
  return `<div class="amcard">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <span class="muted" style="font-size:12px">Account status</span>
      <span class="badge ${STATUS_INFO[s.status].cls}">${STATUS_INFO[s.status].label}</span></div>
    ${s.status!=='active'?`<div class="leave" style="background:${s.status==='on_hold'?'var(--red-bg)':'var(--amber-bg)'};color:${s.status==='on_hold'?'#8a2f27':'#7a4a12'}">
      ${esc(s.statusReason)}${s.statusSince?`<div style="font-size:11px;margin-top:4px;opacity:.8">Since ${fmtDate(s.statusSince)}</div>`:''}
      <div style="margin-top:8px"><a class="lnk" href="#/invoices">View invoices</a></div></div>`:''}
    ${s.paymentTerms.code==='COD'?`<div class="leave" style="background:#fff6e6;color:#7a4a12;margin-top:8px"><b>COD account</b> — no credit limit. HTT releases goods once payment is received.</div>`:`    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:6px">
      <span style="font-size:12px" class="muted">Credit limit</span><b style="font-size:16px">${money(cr.limit)}</b></div>
    <div class="bar"><div style="width:${pct}%;background:${barColor}"></div></div>
    <div class="credit3">
      <div><span>Used</span><b>${money(cr.used)}</b></div>
      <div><span>Available</span><b style="color:${over?'var(--red)':'var(--green-700)'}">${money(cr.available)}</b></div>
      <div><span>Used %</span><b>${(cr.used/cr.limit*100).toFixed(0)}%</b></div></div>
    <div class="muted" style="font-size:11px;margin-top:8px">Used = unpaid invoices + open orders not yet invoiced.</div>`}
    <div class="pl" style="margin-top:12px;border-top:1px solid var(--line);padding-top:10px;grid-template-columns:110px 1fr"><span class="muted">Payment terms</span><span><b>${esc(s.paymentTerms.code.replace('NET','Net '))}</b> · ${esc(s.paymentTerms.description)}</span></div>
    <div class="pl" style="grid-template-columns:110px 1fr"><span class="muted">Outstanding</span><span>${money(outstanding)}</span></div>
    <div class="pl" style="grid-template-columns:110px 1fr"><span class="muted">Overdue</span><span style="color:var(--red)">${money(overdueAmt)}</span></div>
  </div>`;
}
const ADDR_TYPE = {main:{label:'Main store', cls:'t-main'}, store:{label:'Store', cls:'t-store'}, delivery:{label:'Delivery address', cls:'t-del'}};
function addrCard(d){
  const act = d.type==='store' ? `<button class="linkbtn" onclick="confirmMainStore('${d.addressId}')">Set as main store</button>` : '';
  return `<div class="scard2" data-s="${esc((d.label+' '+d.suburb+' '+d.postcode).toLowerCase())}">
    <div class="sc-top"><b>${esc(d.label)}</b>${d.type!=='delivery'?`<span class="ttag ${ADDR_TYPE[d.type].cls}">${ADDR_TYPE[d.type].label}</span>`:''}${d.isDefault?'<span class="role">Default delivery</span>':''}
      ${act?`<span class="sc-act">${act}</span>`:''}</div>
    <div class="sc-grid"><span>${fmtAddr(d)}</span>
      <span>${d.phone?esc(d.phone):''}${d.contact?`${d.phone?' · ':''}${esc(d.contact)}`:''}</span></div>
    ${d.notes?`<div class="muted" style="font-size:11px;margin-top:3px">${esc(d.notes)}</div>`:''}</div>`;
}
function addressBlock(s){
  const a = s.addresses;
  const stores = a.delivery.filter(d=>d.type!=='delivery').sort((x,y)=>(x.type==='main'?0:1)-(y.type==='main'?0:1));
  const dels = a.delivery.filter(d=>d.type==='delivery').sort((x,y)=>(y.isDefault?1:0)-(x.isDefault?1:0));
  const search = n => n>4?`<div class="mini-search" style="width:100%;margin:0 0 10px">${ICON.search}<input placeholder="Search..." oninput="filterStores(this,this.value)"></div>`:'';
  return `<div class="billnote">${ICON.doc}<div>All invoices are billed to <b>${esc(CUSTOMER.name)}</b>, ${fmtAddr(a.billing)}${stores.length>1?` — including orders for your ${stores.length} stores below`:''}.</div></div>
    <div class="addrcols"><div>
    <div class="subh">Stores <span class="cnt">${stores.length}</span></div>
    <div class="addrgroup">${search(stores.length)}${stores.map(d=>addrCard(d)).join('')}
      <button class="linkbtn" onclick="openAddressForm('store')">+ Add a store</button>
      <p class="muted" style="font-size:11px;margin:6px 0 0">A store that needs its own invoices? Ask your account manager to open a separate account for it.</p></div>
    </div><div>
    <div class="subh">Delivery addresses <span class="cnt">${dels.length}</span></div>
    <div class="addrgroup">${search(dels.length)}${dels.length?dels.map(d=>addrCard(d)).join(''):'<p class="muted" style="font-size:12px">No delivery addresses yet. Orders are delivered to your main store.</p>'}
      <button class="linkbtn" onclick="openAddressForm('delivery')">+ Add a delivery address</button></div>
    </div></div>`;
}
function confirmMainStore(id){
  const cur = MOCK_SUMMARY.addresses.delivery.find(x=>x.type==='main'), nxt = MOCK_SUMMARY.addresses.delivery.find(x=>x.addressId===id);
  const m = document.getElementById('modal');
  m.innerHTML = `<div class="mbox">
    <h3 class="serif" style="font-weight:500;font-size:26px;margin:0 0 6px">Change your main store?</h3>
    <p class="muted" style="font-size:12.5px;margin:0 0 16px">Your main store is where all invoices for this account are billed.</p>
    <div class="swap"><div><span>Now</span><b>${esc(cur.label)}</b><small>${fmtAddr(cur)}</small></div><div class="arrow">→</div>
      <div class="new"><span>New main store</span><b>${esc(nxt.label)}</b><small>${fmtAddr(nxt)}</small></div></div>
    <ul class="muted" style="font-size:12px;line-height:1.7;padding-left:18px;margin:16px 0 0">
      <li>New invoices will be billed to ${esc(nxt.label)} straight away.</li>
      <li>Invoices already issued stay as they are.</li>
      <li>${esc(cur.label)} stays on your account as a store.</li></ul>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px"><button class="btn-o" onclick="closeModal()">Cancel</button><button class="btn" onclick="submitMainStore('${id}')">Change main store</button></div>
  </div>`;
  m.style.display='flex';
}
async function submitMainStore(id){            // IT: PUT /api/portal/me/main-store {addressId} → 直接更新主系统的账单地址，立即生效
  const list = MOCK_SUMMARY.addresses.delivery, cur = list.find(x=>x.type==='main'), nxt = list.find(x=>x.addressId===id);
  cur.type='store'; nxt.type='main';
  MOCK_SUMMARY.addresses.billing = {line1:nxt.line1, suburb:nxt.suburb, state:nxt.state, postcode:nxt.postcode, country:'Australia'};
  closeModal(); toast(nxt.label+' is now your main store'); render(); }
function filterStores(el, v){ v=v.toLowerCase(); el.closest('.addrgroup').querySelectorAll('.scard2').forEach(c=>c.style.display=c.dataset.s.includes(v)?'':'none'); }
function permTags(p){
  if(p.users) return '<span class="ptag full">Full access</span>';
  const on = PERMS.filter(x=>p[x.key]);
  return on.length ? on.map(x=>`<span class="ptag">${x.label}</span>`).join('') : '<span class="muted">No access</span>';
}
function usersBlock(u){
  const me = u.users.find(x=>x.userId===u.currentUserId), isAdmin = me && me.permissions.users;
  return `<table class="utable"><thead><tr><th>User</th><th>Access</th><th>Status</th><th>Last login</th><th></th></tr></thead><tbody>
    ${u.users.map(x=>`<tr><td><b>${esc(x.name)}</b>${x.userId===u.currentUserId?' <span class="muted">(you)</span>':''}<br><span class="muted" style="font-size:11px">${esc(x.email)}</span></td>
      <td style="max-width:230px"><span class="ptag st">📍 ${esc(userStoreLbl(x))}</span>${permTags(x.permissions)}</td>
      <td><span class="badge ${x.status==='Active'?'b-completed':x.status==='Invited'?'b-open':'b-expired'}">${x.status}</span></td>
      <td style="font-size:12px;white-space:nowrap">${x.lastLogin?fmtDate(x.lastLogin):'-'}</td>
      <td style="text-align:right;white-space:nowrap">${isAdmin && x.userId!==u.currentUserId ? `<button class="btn-o" style="padding:6px 14px;font-size:12px" onclick="openAccessForm('${x.userId}')">Manage</button>` : ''}</td></tr>`).join('')}
    </tbody></table>
    ${isAdmin?`<button class="btn-o" style="margin-top:14px;padding:9px 18px;font-size:13px" onclick="openAccessForm(null)">+ Invite a staff member</button>`:''}`;
}
const ACCT_SECTIONS = [['sec-overview','Overview'],['sec-business','Business details'],['sec-stores','Stores & addresses'],['sec-contacts','Contacts'],['sec-users','Users & access'],['sec-security','Login & security']];
function goSec(id){ const el=document.getElementById(id); if(el) window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-86, behavior:'smooth'}); }
function syncAcctNav(){
  const nav=document.querySelector('.anav'); if(!nav) return;
  let cur=ACCT_SECTIONS[0][0];
  ACCT_SECTIONS.forEach(([id])=>{ const el=document.getElementById(id); if(el && el.getBoundingClientRect().top<140) cur=id; });
  if(window.innerHeight+window.scrollY>=document.body.scrollHeight-4) cur=ACCT_SECTIONS.at(-1)[0];
  nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on', b.dataset.sec===cur));
}
window.addEventListener('scroll', syncAcctNav, {passive:true});
const secHead = (title, sub, action='') => `<div class="ahead"><div><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div>${action}</div>`;
async function account(){
  const c=CUSTOMER;
  let am, ct, sm, us, failed=false;
  try { [am, ct, sm, us] = await Promise.all([portalApi.getAccountManager(), portalApi.getContacts(), portalApi.getAccountSummary(), portalApi.getUsers()]); ACCT_CACHE={am,ct,sm,us}; }
  catch(e){ failed=true; if(ACCT_CACHE){({am,ct,sm,us}=ACCT_CACHE);} }   // 规则：系统连不上 → 用缓存；没缓存 → 门店总机
  const newReqs = ct ? ct.pendingRequests.filter(r=>r.type==='create' && r.status==='pending') : [];
  const st = sm ? STATUS_INFO[sm.status] : null;
  setTimeout(syncAcctNav, 0);
  return `<div class="ahero"><div class="wrap">
      <div class="eyebrow">My Account</div>
      <h1>${esc(c.name)}</h1>
      <div class="achips">
        ${sm?`<span class="achip">Customer ID <b>${esc(sm.customerId)}</b></span>`:''}
        <span class="achip">${ICON.pin} ${esc(c.location)} <span title="Region is locked after registration">🔒</span></span>
        ${sm?`<span class="achip">Terms <b>${esc(sm.paymentTerms.code.replace('NET','Net '))}</b></span>`:''}
        ${st?`<span class="badge ${st.cls}" style="font-size:12px;padding:5px 10px">${st.label}</span>`:''}
      </div></div></div>
  <div class="wrap agrid">
    <aside><nav class="anav">${ACCT_SECTIONS.map(([id,t])=>`<button data-sec="${id}" onclick="goSec('${id}')">${t}</button>`).join('')}</nav></aside>
    <div class="amain">
      <section id="sec-overview" class="aover">
        <div>${sm?creditCard(sm):'<div class="amcard muted">Account details are unavailable right now.</div>'}</div>
        <div>${(am ? amCard(am) : amCard({accountManager:null, branch:MOCK_ACCOUNT_MANAGER.branch})).replace('<div class="amcard">','<div class="amcard"><div class="olabel">Your account manager</div>')}</div>
      </section>

      <section id="sec-business" class="acard">
        ${secHead('Business details','Details held on your HTT account.')}
        <div class="kv2">
          <span>Business name</span><b>${esc(c.name)}</b>
          <span>Customer ID</span><b>${sm?esc(sm.customerId):'-'}</b>
          <span>ABN</span><b>${esc(c.abn)}</b>
          <span>Business type</span><b>${esc(c.type)}</b>
          <span>Account manager</span><b>${am&&am.accountManager?esc(am.accountManager.name):'-'}</b>
          <span>Stock location</span><b class="green">${esc(c.location)} 🔒</b>
        </div>
        <div class="lockbox" style="margin-top:16px">Your region is locked after registration. Inventory, pricing and promotions are based on this region.</div>
      </section>

      <section id="sec-stores" class="acard">
        ${secHead('Stores &amp; addresses','Your stores and the places we deliver to.')}
        ${sm?addressBlock(sm):'<p class="muted">Addresses are unavailable right now.</p>'}
      </section>

      <section id="sec-contacts" class="acard">
        ${secHead('Contacts','People at your business we can contact.',`<button class="btn-o sm" onclick="openContactForm(null)">+ Add contact</button>`)}
        <div class="cgrid">
          ${ct ? ct.contacts.map(x=>contactCard(x, ct.pendingRequests)).join('') : '<p class="muted">Contacts are unavailable right now.</p>'}
          ${newReqs.map(r=>`<div class="ccard" style="border-style:dashed"><b>${esc(r.changes.name||'New contact')}</b> <span class="badge b-open">New contact pending review</span></div>`).join('')}
        </div>
        <p class="muted" style="font-size:11px;margin:4px 0 0">Changes are reviewed by HTT before they update your account.${ct?' Updated '+fmtSynced(ct.syncedAt)+'.':''}</p>
      </section>

      <section id="sec-users" class="acard">
        ${secHead('Users &amp; access','Give your staff their own login and choose what each person can see.')}
        ${us?usersBlock(us):''}
      </section>

      <section id="sec-security" class="acard">
        ${secHead('Login &amp; security','Your own login.')}
        <div class="secrow">
          <div class="kv2" style="flex:1"><span>Login email</span><b>${esc(c.contact.email)}</b><span>Password</span><b>••••••••</b></div>
          <button class="btn-o sm" onclick="toast('原型：修改密码未接系统')">Change password</button>
        </div>
      </section>

      <div class="demo" style="gap:18px;flex-wrap:wrap;margin:0 0 50px">原型演示（正式版删除）
        <label>客户经理：<select onchange="DEMO_AM_STATE=this.value;render()">
          <option value="normal" ${DEMO_AM_STATE==='normal'?'selected':''}>在岗</option>
          <option value="leave" ${DEMO_AM_STATE==='leave'?'selected':''}>休假</option>
          <option value="none" ${DEMO_AM_STATE==='none'?'selected':''}>未指定</option></select></label>
        <label>登录身份：<select onchange="MOCK_USERS.currentUserId=this.value;STORE='all';applyStore();render()">${MOCK_USERS.users.map(u=>`<option value="${u.userId}" ${u.userId===MOCK_USERS.currentUserId?'selected':''}>${esc(u.name)} · ${esc(userStoreLbl(u))}</option>`).join('')}</select></label>
        <label>账户状态：<select onchange="DEMO_STATUS=this.value;render()">
          <option value="active" ${DEMO_STATUS==='active'?'selected':''}>正常</option>
          <option value="on_hold" ${DEMO_STATUS==='on_hold'?'selected':''}>暂停（逾期）</option>
          <option value="over_limit" ${DEMO_STATUS==='over_limit'?'selected':''}>超额</option></select></label>
        <label>付款条件：<select onchange="DEMO_COD=this.value==='cod';ACCT_CACHE=null;render()"><option value="net" ${DEMO_COD?'':'selected'}>账期 Net 14</option><option value="cod" ${DEMO_COD?'selected':''}>COD 先付款</option></select></label>
      </div>
    </div>
  </div>`;
}

/* 员工账号：邀请 / 改角色 / 停用 */
function permChecklist(p){
  return `<div class="presets"><span>Quick fill</span>${Object.keys(PRESETS).map(k=>`<button type="button" class="chipbtn" data-preset="${k}" onclick="applyPreset(this.form,'${k}')">${k}</button>`).join('')}</div>
    <div class="pgrid">${PERM_GROUPS.map(g=>`<div class="pgroup ${g==='Admin'?'admin':''}"><div class="pgh">${g}</div>
      ${PERMS.filter(x=>x.group===g).map(x=>`<label class="tog"><span class="tt"><b>${x.label}</b><span>${x.desc}</span></span>
        <input type="checkbox" name="perm_${x.key}" ${p[x.key]?'checked':''} onchange="permChanged(this.form)"><i></i></label>`).join('')}</div>`).join('')}</div>
    <div class="pcount" id="pcount"></div>`;
}
function applyPreset(f, name){ PERMS.forEach(x=>{ f['perm_'+x.key].checked = PRESETS[name].includes(x.key); }); permChanged(f); }
function permChanged(f){
  // 勾了「Manage users」= 全部权限，其它项锁定为勾选
  const full = f.perm_users.checked;
  PERMS.forEach(x=>{ if(x.key!=='users'){ const el=f['perm_'+x.key]; if(full) el.checked=true; el.disabled=full; el.closest('.tog').classList.toggle('locked',full); } });
  const on = PERMS.filter(x=>f['perm_'+x.key].checked).map(x=>x.key);
  f.querySelectorAll('[data-preset]').forEach(b=>{ const p=PRESETS[b.dataset.preset]; b.classList.toggle('on', p.length===on.length && p.every(k=>on.includes(k))); });
  const c = f.querySelector('#pcount'); if(c) c.textContent = full ? 'Full access' : `${on.length} of ${PERMS.length} turned on`;
}
function readPerms(f){ const p={}; PERMS.forEach(x=>p[x.key]=f['perm_'+x.key].checked); return p; }
function openAccessForm(userId){
  const u = userId ? MOCK_USERS.users.find(x=>x.userId===userId) : null;
  const p = u ? u.permissions : Object.fromEntries(PERMS.map(x=>[x.key,false]));
  const m = document.getElementById('modal');
  m.innerHTML = `<form class="mbox wide" onsubmit="event.preventDefault();submitAccess(this,${u?`'${u.userId}'`:'null'})">
    <div class="mhead">${u?`<div class="avatar" style="width:44px;height:44px;font-size:14px">${initials(u.name)}</div>
      <div style="flex:1"><div class="serif" style="font-size:24px;line-height:1.1">${esc(u.name)}</div><div class="muted" style="font-size:12px">${esc(u.email)} · <span class="badge ${u.status==='Active'?'b-completed':u.status==='Invited'?'b-open':'b-expired'}">${u.status}</span></div></div>`
      :`<div style="flex:1"><div class="serif" style="font-size:26px;line-height:1.1">Invite a staff member</div><div class="muted" style="font-size:12px;margin-top:4px">They'll get an email to set their own password. The link expires in 7 days.</div></div>`}
      <button type="button" class="xbtn" onclick="closeModal()" aria-label="Close">×</button></div>
    ${u?'':`<div class="two"><label>Name<input name="name" required></label><label>Work email<input name="email" type="email" required></label></div>`}
    <div class="sect">Store</div>
    ${(()=>{ const cur=userStores(u); return `<div class="stpick ${cur==='all'?'isall':''}">Which stores can they work at?
      <label class="stall"><input type="checkbox" name="st_all" ${cur==='all'?'checked':''} onchange="this.closest('.stpick').classList.toggle('isall',this.checked)"> <b>All stores</b> <span>— sees every store combined and can switch</span></label>
      <div class="stlist">${STORES().map(a=>`<label><input type="checkbox" name="st_${a.addressId}" ${cur!=='all'&&cur.includes(a.addressId)?'checked':''}> 📍 ${esc(a.label)}</label>`).join('')}</div>
      <small>Linked to one store: they only see that store. Linked to several: they choose where they're working when they log in, and can switch between those stores only. New quotes and orders are recorded under the store they're working at.</small></div>`; })()}
    <div class="sect">Access</div>
    ${permChecklist(p)}
    ${u?`<div class="sect">Login &amp; password</div>
    <div class="loginbox">
      <div class="lrow"><div><b>Send password reset email</b><span>They choose a new password themselves. Recommended.</span></div>
        <button type="button" class="btn-o sm" onclick="sendReset('${u.userId}')">Send email</button></div>
      <div class="lrow"><div><b>Set a temporary password</b><span>For staff without their own email. They must change it at next login.</span></div>
        <button type="button" class="btn-o sm" onclick="showTempPw(this)">Set password</button></div>
      <div class="temppw" id="temppw" style="display:none">
        <div style="display:flex;gap:8px"><input id="tpw" readonly><button type="button" class="btn-o sm" onclick="genPw()">New</button><button type="button" class="btn-o sm" onclick="copyPw()">Copy</button></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><span class="muted" style="font-size:11px">Valid for 24 hours. We'll also email them that their password was changed.</span>
          <button type="button" class="btn sm" onclick="saveTempPw('${u.userId}')">Save temporary password</button></div></div>
      <div class="lrow"><div><b>${u.status==='Disabled'?'Enable account':'Disable account'}</b><span>${u.status==='Disabled'?'Let them log in again.':'They are logged out straight away and can no longer log in.'}</span></div>
        <button type="button" class="btn-o sm ${u.status==='Disabled'?'':'danger'}" onclick="setUserStatus('${u.userId}','${u.status==='Disabled'?'Active':'Disabled'}')">${u.status==='Disabled'?'Enable':'Disable'}</button></div>
    </div>`:''}
    <div class="mfoot"><button type="button" class="btn-o" onclick="closeModal()">Cancel</button><button class="btn">${u?'Save access':'Send invite'}</button></div>
  </form>`;
  m.style.display='flex';
  permChanged(m.querySelector('form'));
}
// 临时密码：可读的随机密码（去掉易混字符）
function genPw(){ const c='ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789', a=new Uint32Array(12); crypto.getRandomValues(a);
  document.getElementById('tpw').value = Array.from(a,(n,i)=>c[n%c.length]+(i===3||i===7?'-':'')).join(''); }
function showTempPw(){ const b=document.getElementById('temppw'); b.style.display='block'; genPw(); }
async function copyPw(){ try{ await navigator.clipboard.writeText(document.getElementById('tpw').value); toast('Copied'); }catch(e){ toast('Select and copy the password'); } }
async function sendReset(id){ const u=MOCK_USERS.users.find(x=>x.userId===id); toast('Password reset email sent to '+u.email); }   // IT: POST /api/portal/me/users/{id}/password-reset
async function saveTempPw(id){ toast('Temporary password saved — they must change it at next login'); document.getElementById('temppw').style.display='none'; } // IT: POST /api/portal/me/users/{id}/temporary-password
async function submitAccess(f, userId){
  const perms = readPerms(f);
  if(!Object.values(perms).some(Boolean)){ toast('Turn on at least one item'); return; }
  const stAll = f.st_all && f.st_all.checked, stPick = STORES().map(a=>a.addressId).filter(id=>f['st_'+id] && f['st_'+id].checked);
  if(!stAll && !stPick.length){ toast('Choose at least one store'); return; }
  const stv = stAll ? 'all' : stPick;
  if(userId){ await portalApi.updateUser(userId,{permissions:perms}); const uu=MOCK_USERS.users.find(x=>x.userId===userId); if(uu) uu.stores=stv; closeModal(); toast('Access updated'); render(); return; }
  const fd = new FormData(f), email = fd.get('email').trim().toLowerCase();
  if(MOCK_USERS.users.some(u=>u.email.toLowerCase()===email)){ toast('This email already has a login'); return; }
  await portalApi.inviteUser({name:fd.get('name').trim(), email, permissions:perms, stores:stv}); { const nu=MOCK_USERS.users.find(x=>x.email.toLowerCase()===email); if(nu) nu.stores=stv; }
  closeModal(); toast('Invite sent to '+email); render();
}
async function setUserStatus(id, status){ await portalApi.updateUser(id,{status}); closeModal(); toast(status==='Disabled'?'User disabled — they can no longer log in':'User enabled'); render(); }

/* 新送货地址：提交申请，由 HTT 在系统里建好后同步回来 */
function openAddressForm(type){
  const isStore = type==='store';
  const m = document.getElementById('modal');
  m.innerHTML = `<form class="mbox" onsubmit="event.preventDefault();closeModal();toast('${isStore?'Store':'Address'} request submitted for review')">
    <h3 class="serif" style="font-weight:500;font-size:26px;margin:0 0 4px">${isStore?'Add a store':'Add a delivery address'}</h3>
    <p class="muted" style="font-size:12px;margin:0 0 16px">${isStore?'Another store you run that is billed to this account. HTT will add it after review.':'A warehouse or job site we deliver to. HTT will add it after review.'}</p>
    <input type="hidden" name="type" value="${type}">
    <label>${isStore?'Store name (e.g. ABC Flooring Geelong)':'Name (e.g. Warehouse, Site – Box Hill)'}<input name="label" required></label>
    <label>Street<input name="line1" required></label>
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px"><label>Suburb<input name="suburb" required></label><label>State<select name="state"><option>VIC</option><option>NSW</option><option>QLD</option><option>SA</option><option>WA</option><option>TAS</option><option>ACT</option><option>NT</option></select></label><label>Postcode<input name="postcode" pattern="[0-9]{4}" required></label></div>
    <div class="two"><label>Phone<input name="phone"></label><label>Contact person<input name="contact"></label></div>
    <label>Delivery notes<input name="notes" placeholder="Access times, forklift, loading dock..."></label>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><button type="button" class="btn-o" onclick="closeModal()">Cancel</button><button class="btn">Submit for review</button></div>
  </form>`;
  m.style.display='flex';
}

/* 联系人新增 / 修改表单 → 提交为「修改申请」，不直接改系统数据 */
const ROLES = ['Primary','Accounts','Purchasing','Site / Delivery','Other'];
function openContactForm(contactId){
  const c = contactId ? MOCK_CONTACTS.contacts.find(x=>x.contactId===contactId) : {name:'',role:'Other',position:'',email:'',mobile:'',phone:'',receivesInvoices:false,receivesOrderUpdates:false};
  const m = document.getElementById('modal');
  m.innerHTML = `<form class="mbox" onsubmit="event.preventDefault();submitContactForm(this,${contactId?`'${contactId}'`:'null'})">
    <h3 class="serif" style="font-weight:500;font-size:26px;margin:0 0 4px">${contactId?'Edit contact':'Add contact'}</h3>
    <p class="muted" style="font-size:12px;margin:0 0 16px">Your request will be reviewed by HTT before it updates your account.</p>
    <label>Name<input name="name" required value="${esc(c.name)}"></label>
    <label>Role<select name="role">${ROLES.map(r=>`<option ${r===c.role?'selected':''}>${r}</option>`).join('')}</select></label>
    <label>Position<input name="position" value="${esc(c.position||'')}"></label>
    <label>Email<input name="email" type="email" value="${esc(c.email||'')}"></label>
    <label>Mobile<input name="mobile" pattern="[0-9 +()]{8,16}" value="${esc(c.mobile||'')}"></label>
    <label>Note for HTT (optional)<input name="note"></label>
    <div style="display:flex;justify-content:space-between;margin-top:18px">
      ${contactId && c.role!=='Primary'?`<button type="button" class="linkbtn" style="color:var(--red)" onclick="submitDelete('${contactId}')">Remove contact</button>`:'<span></span>'}
      <div style="display:flex;gap:10px"><button type="button" class="btn-o" onclick="closeModal()">Cancel</button><button class="btn">Submit for review</button></div></div>
  </form>`;
  m.style.display='flex';
}
function closeModal(){ document.getElementById('modal').style.display='none'; }
async function submitContactForm(f, contactId){
  const fd = new FormData(f), orig = contactId ? MOCK_CONTACTS.contacts.find(x=>x.contactId===contactId) : {};
  const changes = {};
  ['name','role','position','email','mobile'].forEach(k=>{ const v=fd.get(k).trim(); if(v!==(orig[k]||'')) changes[k]=v; });
  if(!Object.keys(changes).length){ closeModal(); toast('No changes to submit'); return; }
  await portalApi.submitChangeRequest({type:contactId?'update':'create', contactId, changes, note:fd.get('note')});
  closeModal(); toast('Submitted — HTT will review your change'); render();
}
async function submitDelete(contactId){
  await portalApi.submitChangeRequest({type:'delete', contactId, changes:{}});
  closeModal(); toast('Removal request submitted for review'); render();
}

function notFound(){
  return `<div class="nf ph ph1"><div class="box" style="position:relative"><h1>Page not found</h1><p style="font-size:13px">The page may have moved.</p><a href="#/dashboard" style="font-size:13px">Back to HTT Flooring</a></div></div>`;
}

/* ===================== 路由 ===================== */
function go(h){ location.hash = h.replace(/^#/,''); }
function toast(m){ const t=document.getElementById('toast'); t.textContent=m; t.style.display='block'; clearTimeout(t._h); t._h=setTimeout(()=>t.style.display='none',2200); }
function sysDateChip(){
  const d = new Date(SYSTEM_INFO.systemDate+'T00:00:00');
  const day = d.toLocaleDateString('en-AU',{weekday:'long', day:'numeric', month:'long', year:'numeric'});
  const t = new Date(SYSTEM_INFO.syncedAt).toLocaleTimeString('en-AU',{hour:'numeric', minute:'2-digit', timeZone:SYSTEM_INFO.timezone});
  return `<div class="sysdate" title="Date and data from the HTT system"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="2.5" width="12" height="11" rx="1.5"/><path d="M1.5 6h12M5 1v3M10 1v3"/></svg>
    <div><b>${day}</b><span>Data updated ${t}</span></div></div>`;
}
// 页头右上角：日期选择器（有日期筛选的页面）+ 系统日期（所有主页面；详情页不放）
function addSysDate(){
  const head = document.querySelector('#app .dash > .wrap, #app .page-head > .wrap, #app .inv-head > .wrap, #app .ahero > .wrap');
  if(!head || head.querySelector('.hdrtools')) return;
  const d = new Date(SYSTEM_INFO.systemDate+'T00:00:00');
  const day = d.toLocaleDateString('en-AU',{weekday:'short', day:'numeric', month:'short', year:'numeric'});
  const t = new Date(SYSTEM_INFO.syncedAt).toLocaleTimeString('en-AU',{hour:'numeric', minute:'2-digit', timeZone:SYSTEM_INFO.timezone});
  const P = PAGE_RANGE, R = P && P.R;
  head.style.position='relative';
  head.insertAdjacentHTML('afterbegin', `<div class="hdrtools">
    ${R?`<div class="dpwrap">
        <button class="dptrigger" onclick="event.stopPropagation();openDP('${R.key}','${ISO(R.from)}','${ISO(R.to)}')">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="2.5" width="12" height="11" rx="1.5"/><path d="M1.5 6h12M5 1v3M10 1v3"/></svg>
          <b>${R.label}</b><span>${dpShort(R.from,R.to)}</span><i>▾</i></button>
        <div id="dp" class="dp" onclick="event.stopPropagation()"></div></div>
      ${P.compare?`<div class="cmpline">vs ${fmtD(R.pFrom)} – ${fmtD(R.pTo)}${R.yoy?' (last year)':''}</div>`:''}`:''}
    <div class="sysline" title="Date and data from the HTT system"><span class="dot"></span>System date <b>${day}</b> · updated ${t}</div>
  </div>`);
}
/* 分页：每页 25 条（给 IT：正式版由后端分页，接口带 page / pageSize，返回 total） */
const PAGE_SIZE = 25;
function pager(id, page){
  const tbl=document.getElementById(id); if(!tbl) return;
  const rows=[...tbl.tBodies[0].rows].filter(r=>!r.querySelector('td[colspan]'));
  const vis=rows.filter(r=>r.dataset.f!=='0'), total=vis.length, pages=Math.max(1,Math.ceil(total/PAGE_SIZE));
  page=Math.min(Math.max(1,page),pages);
  rows.forEach(r=>r.style.display='none');
  vis.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE).forEach(r=>r.style.display='');
  let el=document.getElementById(id+'-pager');
  if(!el){ el=document.createElement('div'); el.id=id+'-pager'; el.className='pager'; (tbl.closest('.qcard')||tbl).after(el); }
  fixMonthRows(id);
  if(total<=PAGE_SIZE){ el.innerHTML = total?`<span class="muted">${total} record${total>1?'s':''}</span>`:'<span class="muted">No matching records</span>'; return; }
  const nums=[]; for(let i=1;i<=pages;i++){ if(i===1||i===pages||Math.abs(i-page)<=1) nums.push(i); else if(nums.at(-1)!=='…') nums.push('…'); }
  el.innerHTML = `<span class="muted">Showing <b>${(page-1)*PAGE_SIZE+1}–${Math.min(page*PAGE_SIZE,total)}</b> of <b>${total}</b></span>
    <div class="pnums"><button ${page===1?'disabled':''} onclick="pager('${id}',${page-1});pagerTop('${id}')" aria-label="Previous page">‹</button>
    ${nums.map(n=>n==='…'?'<span>…</span>':`<button class="${n===page?'on':''}" onclick="pager('${id}',${n});pagerTop('${id}')">${n}</button>`).join('')}
    <button ${page===pages?'disabled':''} onclick="pager('${id}',${page+1});pagerTop('${id}')" aria-label="Next page">›</button></div>`;
}
function segFilter(btn, k){
  btn.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on', b===btn));
  document.getElementById('flt').value=k; filterList();
}
function fixMonthRows(id){
  const rows=[...document.querySelectorAll('#'+id+' tbody tr')];
  rows.forEach((r,ix)=>{ if(!r.classList.contains('monrow')) return;
    let any=false; for(let j=ix+1;j<rows.length && !rows[j].classList.contains('monrow');j++) if(rows[j].style.display!=='none'){ any=true; break; }
    r.style.display = any ? '' : 'none'; });
}
function pagerTop(id){ const t=document.getElementById(id); if(t) window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-120, behavior:'smooth'}); }
let RENDER_SEQ = 0;
async function render(){
  { const me=curUser(); if(me && !canAllStores()){ const L=allowedStores(), want = TODAY_STORE[me.userId] || (L.length===1?L[0]:null);
      if(!L.includes(STORE)){ STORE = want || L[0]; applyStore(); }
      if(!want && L.length>1 && !document.querySelector('#modal .todayst')) setTimeout(pickTodayStore,0); } }
  draftSave(); document.body.classList.toggle('noplace', !can('place')); pzPaint(); { const e=document.getElementById('stsw'); if(e){ e.innerHTML=storeSwitch(); document.body.classList.toggle('hasst',!!e.innerHTML); } }
  const seq = ++RENDER_SEQ;
  PAGE_RANGE = null;
  const raw = location.hash.replace(/^#\/?/,'') || 'dashboard';
  const [path,qs] = raw.split('?'); const params = new URLSearchParams(qs||'');
  const seg = path.split('/');
  let html, active = seg[0];
  if(!can('prices') && PRICE_ON){ PRICE_ON=false; }
  if(!routeOk(seg[0]==='purchases'?'orders':seg[0])) { html = noAccess(); seg[0]='__deny'; }
  switch(seg[0]){
    case '__deny': break;
    case 'dashboard': case '': html=dashboard(params); active='dashboard'; break;
    case 'inventory': html=inventory(params); break;
    case 'series': html=series(seg[1]); active='inventory'; break;
    case 'products': html=product(seg[1],params); active='inventory'; break;
    case 'collections': html=collection(seg[1]); active='inventory'; break;
    case 'quotes': html=seg[1]?quoteDetail(seg[1]):quotes(params); break;
    case 'orders': html=seg[1]?orderDetail(seg[1]):orders(params); break;
    case 'invoices': html=seg[1]==='credits'?creditDetail(seg[2]):seg[1]==='statement'?statement(params):seg[1]?invoiceDetail(seg[1]):invoices(params); break;
    case 'rebates': html=rebates(params); break;
    case 'sales': html=salesPage(params); break;
    case 'boards': html=boardsPage(params); break;
    case 'account': html=account(); break;
    case 'login': html=dashboard(); active='dashboard'; break; // 原站：已登录时 /login 跳回 Dashboard
    case 'purchases': html=orders(params); active='orders'; break;
    case 'cart': html=cartPage(); break;
    case 'drafts': html=draftsPage(); break;
    case 'submitted': html=submittedPage(seg[1]); break;
    default: html=notFound(); active='';
  }
  /* 展示板申请有新进度（HTT 批准 / 订好日期 / 完成）时，导航上显示提醒数字，看过 Requests 后消失 */
  const bUpd = (typeof BOARD_REQS!=='undefined') ? BOARD_REQS.filter(r=>r.unseen).length : 0;
  /* Purchases = Quotes + Orders + Invoices 合并成一个导航，鼠标移上去有下拉，页面顶部有三个分页 */
  const PUR = ['quotes','orders','invoices'], inPur = PUR.includes(active) || active==='cart' || active==='drafts';
  const purCnt = {quotes: QUOTES.filter(q=>q.status==='Open').length, orders: ORDERS.filter(o=>['Pending','Preparing','Ready'].includes(o.status)).length, invoices: INVOICES.filter(i=>i.balance>0).length};
  const purLbl = {quotes:'Reserve', orders:'Orders', invoices:'Invoices'};
  /* 需要注意的数量：Reserve = 7 天内到期的报价；Orders = 延误 + 过了提货日没来提；Invoices = 逾期发票 */
  const purAl = {quotes: QUOTES.filter(q=>q.status==='Open' && daysTo(q.valid)>=0 && daysTo(q.valid)<=1).length,
                 orders: ORDERS.filter(o=>o.status!=='Completed'&&o.status!=='Cancelled'&&(lateDays(o)>0||notCollected(o)>0)).length,
                 invoices: INVOICES.filter(i=>i.overdue>0 && i.balance>0).length};
  const purTip = {quotes:n=>`${n} expiring by tomorrow`, orders:n=>`${n} delayed or not collected`, invoices:n=>`${n} overdue`};
  const alTag = p => purAl[p] ? `<i class="paltag ${p==='quotes'?'amb':''}" title="${purTip[p](purAl[p])}">${purAl[p]} ${p==='quotes'?'expiring':p==='orders'?'late':'overdue'}</i>` : '';
  const purAlTot = purAl.orders + purAl.invoices + purAl.quotes;
  const PURv = PUR.filter(p=>can(p));
  document.getElementById('nav').innerHTML = NAV.filter(([k])=> k==='purchases' ? PURv.length : routeOk(k)).map(([k,t])=> k==='purchases'
    ? `<div class="navdd ${inPur?'active':''}"><a href="#/${PUR.includes(active)?active:PURv[0]}" class="${inPur?'active':''}">Purchases${(t=>t?`<span class="navbadge red" title="${PURv.map(p=>purTip[p](purAl[p])).join(' · ')}">${t}</span>`:'')(PURv.reduce((n,p)=>n+purAl[p],0))} <span class="ddc">▾</span></a>
        <div class="ddm">${PURv.map(p=>`<a href="#/${p}" class="${p===active?'on':''}">${purLbl[p]}<em>${purCnt[p]}</em>${alTag(p)}</a>`).join('')}</div></div>`
    : `<a href="#/${k}" class="${k===active?'active':''}">${t}${k==='boards'&&bUpd?`<span class="navbadge" title="${bUpd} request update${bUpd>1?'s':''}">${bUpd}</span>`:''}</a>`).join('');
  if(inPur && typeof html==='string') html = `<div class="purbar"><div class="wrap">${PURv.map(p=>`<a href="#/${p}" class="${p===active?'on':''}">${purLbl[p]}<em>${purCnt[p]}</em>${alTag(p)}</a>`).join('')}<span class="purflow">Quote → Order → Invoice</span>${can('place')?(n=>`<div class="drw"><button class="drbtn ${active==='drafts'?'on':''}" onclick="toggleDrafts(event)">Drafts${n?`<em>${n}</em>`:''} <span class="ddc">▾</span></button><div class="drdd"></div></div>`)(draftList().length):''}<a class="purnew cart" href="javascript:void 0" onclick="newDoc('quote')">+ New quote</a><a class="purnew cart" href="javascript:void 0" onclick="newDoc('order')">+ New order</a></div></div>` + html;
  updateCartBadge();
  if(html instanceof Promise){ html = await html; if(seq!==RENDER_SEQ) return; }
  const keepScroll = render.lastPath === path; render.lastPath = path;
  document.getElementById('app').innerHTML = storeBar() + html;
  addSysDate();
  ['lst','rtbl'].forEach(id=>pager(id,1));
  const flt=document.getElementById('flt'); if(flt && !['All','All Cycles'].includes(flt.value)) filterList('');
  if(!keepScroll) window.scrollTo(0,0);
}
document.getElementById('who-name').textContent = CUSTOMER.name;
document.getElementById('who-loc').textContent = CUSTOMER.location;
window.addEventListener('hashchange', render);
draftLoad(); if(typeof updateCartBadge==='function') updateCartBadge();
render();
