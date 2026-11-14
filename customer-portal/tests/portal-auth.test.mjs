import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
const nativeRequire = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
const ctx = { companyId:'company-a', companyName:'Synthetic Company', customerId:'customer-a', customerCode:'SYN-A', customerName:'Synthetic Customer', grantId:'grant-a', grantVersion:1 };
const branch = { id:'branch-a', code:'SYN-B', name:'Synthetic Branch' };
const json = (body,status=200) => new Response(JSON.stringify(body), {status,headers:{'Content-Type':'application/json'}});
const deferred = () => { let resolve; const promise = new Promise(r=>{resolve=r;}); return {promise,resolve}; };
const tick = () => new Promise(resolve=>setImmediate(resolve));
function harness(bus = new Set(), authMode = 'api') {
  let now=10000;
  const calls=[], writes=[], events=new Map(), values=new Map();
  const makeStorage=entries=>({getItem:k=>entries.get(k)??null,setItem:(k,v)=>{entries.set(k,v);writes.push([k,v]);},removeItem:k=>entries.delete(k)});
  const storage=makeStorage(values), sessionStorage=makeStorage(new Map());
  let handler=(url)=> url.endsWith('/auth/login') ? json({accessToken:'synthetic-access',tokenType:'Bearer',expiresIn:900})
    : url.endsWith('/auth/logout') ? new Response(null,{status:204})
    : url.endsWith('/me') ? json({contexts:[ctx],dataAsOf:'2026-11-14T00:00:00Z'})
    : url.endsWith('/branches') ? json({customerId:ctx.customerId,grantId:ctx.grantId,items:[branch]}) : assert.fail(`Unexpected endpoint ${url}`);
  class Channel {
    constructor(name){this.name=name;bus.add(this);}
    postMessage(data){for(const target of bus)if(target!==this&&target.name===this.name)target.onmessage?.({data});}
    close(){bus.delete(this);}
  }
  const sandbox=vm.createContext({ Headers, Response, AbortSignal, TextEncoder, crypto:webcrypto, localStorage:storage, sessionStorage,
    Date:class extends Date {static now(){return now;}}, BroadcastChannel:Channel,
    fetch:async(url,options)=>{calls.push({url,options});return handler(url,options);},
    window:{addEventListener:(name,fn)=>{if(!events.has(name))events.set(name,new Set());events.get(name).add(fn);},removeEventListener:(name,fn)=>events.get(name)?.delete(fn),setInterval:()=>1,clearInterval:()=>{}},
  });
  const cache=new Map();
  function load(file){
    const target=path.resolve(root,file); if(cache.has(target))return cache.get(target);
    const exports={}; cache.set(target,exports);
    const code=ts.transpile(fs.readFileSync(target,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023});
    vm.runInContext(`(function(exports,require){${code}\n})`,sandbox)(exports,name=>name === '../config/auth' ? {authMode} : name === 'react' ? {useSyncExternalStore:(_subscribe,getSnapshot)=>getSnapshot()} : name === 'zustand/vanilla' ? nativeRequire(name) : load(path.resolve(path.dirname(target),name+'.ts')));
    return exports;
  }
  const auth=load('src/services/auth.ts'),store=load('src/state/authStore.ts').authStore;
  return {auth,store,calls,writes,storage,sessionStorage,load,events,advance:(milliseconds=1000)=>{now+=milliseconds;},setHandler:fn=>{handler=fn;},getHandler:()=>handler};
}
const signIn = h => h.auth.login('synthetic@example.invalid','synthetic-password');

test('existing mock login entry uses backend response to unlock existing account hook without credential storage',async()=>{
 const h=harness(),legacy=h.load('src/services/account.ts');
 h.storage.setItem('htt.local.session.v1',JSON.stringify({email:'synthetic@example.invalid',expires:999999999}));
 assert.equal(legacy.useLocalAccount().authenticated,false);
 await legacy.login('synthetic@example.invalid','server-password',true);
 assert.equal(legacy.useLocalAccount().authenticated,true);
 assert.equal(h.calls.length,1);assert.equal(h.calls[0].url,'/api/portal/v1/auth/login');
 assert.equal(JSON.parse(h.calls[0].options.body).password,'server-password');
 assert.ok(h.writes.every(([key])=>key==='htt.local.session.v1'));
 legacy.logout();assert.equal(legacy.useLocalAccount().authenticated,false);
});
test('existing login entry never falls back to demo password or cached session after backend rejection',async()=>{
 const h=harness(),legacy=h.load('src/services/account.ts');
 h.setHandler(()=>json({code:'AUTHENTICATION_REQUIRED'},401));
 await assert.rejects(legacy.login(legacy.defaultProfile.email,legacy.DEMO_PASSWORD,false));
 assert.equal(legacy.useLocalAccount().authenticated,false);assert.equal(h.writes.length,0);
});
test('existing login entry merges duplicate submissions and ignores late success after local logout',async()=>{
 const h=harness(),legacy=h.load('src/services/account.ts'),gate=deferred(),fallback=h.getHandler();
 h.setHandler(async(url,options)=>{await gate.promise;return fallback(url,options);});
 const first=legacy.login('synthetic@example.invalid','server-password',false),second=legacy.login('synthetic@example.invalid','server-password',false);
 assert.equal(first,second);await tick();legacy.logout();gate.resolve();await assert.rejects(first,/superseded/);
 assert.equal(legacy.useLocalAccount().authenticated,false);assert.equal(h.calls.length,1);
});
test('backend login leaves original mock profile and stored mock business data unchanged',async()=>{
 const h=harness(),legacy=h.load('src/services/account.ts');
 const original=JSON.stringify(legacy.defaultProfile);
 const saved=JSON.stringify({profile:{...legacy.defaultProfile,firstName:'Saved mock contact'},salt:'mock-salt',passwordHash:'mock-hash',recoveryHash:'mock-recovery'});
 const invoices=JSON.stringify({items:[{id:'synthetic-invoice',total:125}]});
 h.storage.setItem('htt.local.account.v1',saved);h.storage.setItem('htt.local.invoices.v1',invoices);
 const writesBefore=h.writes.length;
 await legacy.login('real-login@example.invalid','server-password',false);
 assert.equal(legacy.useLocalAccount().authenticated,true);
 assert.equal(legacy.useLocalAccount().profile.firstName,'Saved mock contact');
 assert.equal(h.storage.getItem('htt.local.account.v1'),saved);
 assert.equal(h.storage.getItem('htt.local.invoices.v1'),invoices);
 assert.equal(JSON.stringify(legacy.defaultProfile),original);assert.equal(h.writes.length,writesBefore);
});
test('existing route hook observes server expiration for either remember setting',async()=>{
 for(const remember of [true,false]){
  const h=harness(),legacy=h.load('src/services/account.ts');
  await legacy.login('real-login@example.invalid','server-password',remember);
  assert.equal(legacy.useLocalAccount().authenticated,true);
  h.advance(900000);assert.equal(legacy.useLocalAccount().authenticated,false);
 }
});
test('explicit mock mode retains original demo credentials/profile and never calls backend login',async()=>{
 const h=harness(new Set(),'mock'),legacy=h.load('src/services/account.ts');
 await assert.rejects(legacy.login(legacy.defaultProfile.email,'wrong',false),/incorrect/);
 h.advance();await legacy.login(legacy.defaultProfile.email,legacy.DEMO_PASSWORD,false);
 assert.equal(legacy.useLocalAccount().authenticated,true);assert.equal(h.calls.length,0);
 assert.equal(JSON.stringify(legacy.useLocalAccount().profile),JSON.stringify(legacy.defaultProfile));
 assert.equal(h.storage.getItem('htt.local.session.v1'),null);assert.ok(h.sessionStorage.getItem('htt.local.session.v1'));
 assert.ok(!h.storage.getItem('htt.local.account.v1').includes(legacy.DEMO_PASSWORD));
 legacy.logout();assert.equal(legacy.useLocalAccount().authenticated,false);
});
test('mock remember keeps original 30-day/session 1-day behavior separately from real server lifetime',async()=>{
 for(const remember of [true,false]){
  const h=harness(new Set(),'mock'),legacy=h.load('src/services/account.ts');
  await legacy.login(legacy.defaultProfile.email,legacy.DEMO_PASSWORD,remember);
  assert.equal(h.calls.length,0);
  h.advance(86400000);assert.equal(legacy.useLocalAccount().authenticated,remember);
  h.advance(29*86400000);assert.equal(legacy.useLocalAccount().authenticated,false);
 }
});
test('a remembered mock session cannot authenticate real API mode or bypass a backend rejection',async()=>{
 const h=harness(),legacy=h.load('src/services/account.ts');
 const originalMock=h.load('src/data/localAccount.ts');
 await originalMock.login(originalMock.defaultProfile.email,originalMock.DEMO_PASSWORD,true);
 assert.equal(originalMock.useLocalAccount().authenticated,true);
 assert.equal(legacy.useLocalAccount().authenticated,false);
 h.setHandler(()=>json({code:'AUTHENTICATION_REQUIRED'},401));
 await assert.rejects(legacy.login(legacy.defaultProfile.email,legacy.DEMO_PASSWORD,true));
 assert.equal(legacy.useLocalAccount().authenticated,false);assert.equal(h.calls.length,1);
});
test('original mock contact editing and password change still work in explicit mock mode',async()=>{
 const h=harness(new Set(),'mock'),legacy=h.load('src/services/account.ts');
 await legacy.login(legacy.defaultProfile.email,legacy.DEMO_PASSWORD,false);
 legacy.updateProfile({...legacy.defaultProfile,firstName:'Updated mock contact'});
 assert.equal(legacy.useLocalAccount().profile.firstName,'Updated mock contact');
 await legacy.changePassword(legacy.DEMO_PASSWORD,'SyntheticNewPassword123!');
 assert.equal(legacy.useLocalAccount().authenticated,false);
 h.advance();await legacy.login(legacy.defaultProfile.email,'SyntheticNewPassword123!',false);
 assert.equal(legacy.useLocalAccount().authenticated,true);assert.equal(h.calls.length,0);
 await legacy.resetPassword(legacy.defaultProfile.email,legacy.DEMO_RECOVERY,'SyntheticResetPassword123!');
 assert.equal(legacy.useLocalAccount().authenticated,false);
 h.advance();await legacy.login(legacy.defaultProfile.email,'SyntheticResetPassword123!',false);
 assert.equal(legacy.useLocalAccount().authenticated,true);assert.equal(h.calls.length,0);
});
test('API mode never claims a local mock password action changed backend credentials',async()=>{
 const h=harness(),legacy=h.load('src/services/account.ts');
 await assert.rejects(legacy.changePassword('synthetic-current','synthetic-next'),/only available in Mock mode/);
 await assert.rejects(legacy.resetPassword(legacy.defaultProfile.email,legacy.DEMO_RECOVERY,'synthetic-next'),/only available in Mock mode/);
 assert.equal(h.calls.length,0);assert.equal(h.writes.length,0);
});

test('verified endpoints; private in-memory token, Bearer and grant headers, no credential persistence',async()=>{
 const h=harness();await signIn(h);
 assert.equal(h.store.getSnapshot().status,'authenticated');assert.equal(h.store.getSnapshot().context.companyId,ctx.companyId);
 assert.equal(h.store.getSnapshot().branches[0].id,branch.id);
 assert.ok(!JSON.stringify(h.store.getSnapshot()).includes('synthetic-access'));
 assert.equal(h.writes.length,0);
 for(const {url,options} of h.calls){assert.ok(url.startsWith('/api/portal/v1/'));assert.equal(options.credentials,'omit');assert.equal(options.cache,'no-store');}
 const read=h.calls.find(c=>c.url.endsWith('/branches'));assert.equal(read.options.headers.get('Authorization'),'Bearer synthetic-access');assert.equal(read.options.headers.get('X-Company-Id'),ctx.companyId);assert.equal(read.options.headers.get('X-Portal-Grant-Id'),ctx.grantId);
});
test('startup recovery explicitly blocked; no guessed refresh, fake 7-day session or demo fallback',async()=>{
 const h=harness();h.storage.setItem('htt.local.session.v1','untrusted');h.storage.setItem('htt.local.account.v1','untrusted');
 const stop=h.auth.startSessionLifecycle();await tick();
 assert.equal(h.store.getSnapshot().status,'service-error');assert.match(h.store.getSnapshot().error,/no session recovery/);assert.equal(h.calls.length,0);assert.equal(h.storage.getItem('htt.local.account.v1'),null);assert.equal(h.storage.getItem('htt.local.session.v1'),null);stop();
});
test('leading debounce shares login and read verification; cooldown prevents click bursts',async()=>{
 const h=harness(),gate=deferred(),fallback=h.getHandler();
 h.setHandler(async(url,options)=>{if(url.endsWith('/auth/login'))await gate.promise;return fallback(url,options);});
 const a=signIn(h),b=signIn(h);assert.equal(a,b);gate.resolve();await Promise.all([a,b]);assert.equal(h.calls.filter(c=>c.url.endsWith('/auth/login')).length,1);
 await assert.rejects(signIn(h),/Please wait/);h.advance();
 const c=h.auth.refreshAccount(),d=h.auth.refreshAccount();assert.equal(c,d);await c;
 assert.equal(h.calls.filter(c=>c.url.endsWith('/me')).length,2);
});
test('simultaneous 401 is terminal under actual undifferentiated error contract; no refresh storm',async()=>{
 const h=harness();await signIn(h);h.setHandler(()=>json({code:'AUTHENTICATION_REQUIRED'},401));
 const transport=h.load('src/lib/request.ts'),api=h.load('src/api/portal.ts').portalApi;
 await Promise.all([assert.rejects(transport.request(api.me,{token:'synthetic-access'})),assert.rejects(transport.request(api.branches,{token:'synthetic-access',context:ctx}))]);
 await assert.rejects(h.auth.refreshAccount());assert.equal(h.store.getSnapshot().status,'unauthenticated');assert.equal(h.store.getSnapshot().context,null);assert.ok(!h.calls.some(c=>c.url.includes('refresh')));
});
test('disabled account or revoked authorization clears authorized identity on 401',async()=>{
 for(const reason of ['disabled','revoked']){
  const h=harness();await signIn(h);h.setHandler(()=>json({code:'AUTHENTICATION_REQUIRED',message:reason},401));await assert.rejects(h.auth.refreshAccount());assert.equal(h.store.getSnapshot().context,null);assert.equal(h.store.getSnapshot().branches.length,0);
 }
});
test('403 denies access without refresh, replay or falsely claiming logout',async()=>{
 const h=harness();await signIn(h);h.setHandler(()=>json({code:'ACCESS_DENIED'},403));await assert.rejects(h.auth.refreshAccount(),/Access denied/);
 assert.equal(h.store.getSnapshot().status,'service-error');assert.equal(h.store.getSnapshot().context,null);assert.equal(h.calls.length,4);assert.ok(!h.calls.some(c=>c.url.includes('refresh')));
});
test('503/network failure hides protected identity and allows retry with same memory session',async()=>{
 for(const network of [false,true]){
  const h=harness();await signIn(h);const fallback=h.getHandler();h.setHandler(()=>{if(network)throw Error('network');return json({code:'SERVICE_UNAVAILABLE'},503);});
  await assert.rejects(h.auth.refreshAccount());assert.equal(h.store.getSnapshot().status,'service-error');assert.equal(h.store.getSnapshot().context,null);assert.doesNotMatch(h.store.getSnapshot().error,/logged out/i);
  h.advance();h.setHandler(fallback);await h.auth.restoreSession();assert.equal(h.store.getSnapshot().status,'authenticated');assert.equal(h.store.getSnapshot().email,'synthetic@example.invalid');
 }
});
test('503 during initial account loading retains retryable memory session',async()=>{
 const h=harness(),fallback=h.getHandler();h.setHandler((url,options)=>url.endsWith('/me')?json({code:'SERVICE_UNAVAILABLE'},503):fallback(url,options));
 await assert.rejects(signIn(h));assert.equal(h.store.getSnapshot().status,'service-error');assert.ok(!h.calls.some(c=>c.url.endsWith('/logout')));
 h.advance();h.setHandler(fallback);await h.auth.restoreSession();assert.equal(h.store.getSnapshot().status,'authenticated');
});
test('logout clears all account state before server response; late verification cannot restore it',async()=>{
 const h=harness();await signIn(h);const gate=deferred(),fallback=h.getHandler();
 h.setHandler(async(url,options)=>{if(url.endsWith('/me'))await gate.promise;return fallback(url,options);});
 const pending=h.auth.refreshAccount();await tick();await h.auth.logout();gate.resolve();await pending;
 assert.equal(h.store.getSnapshot().status,'unauthenticated');assert.equal(h.store.getSnapshot().context,null);assert.equal(h.store.getSnapshot().email,'');assert.equal(h.store.getSnapshot().branches.length,0);
});
test('logout failure explicitly reports local logout and unconfirmed server revocation',async()=>{
 const h=harness();await signIn(h);h.setHandler(()=>json({code:'SERVICE_UNAVAILABLE'},503));await assert.rejects(h.auth.logout(),/本地已退出，服务器撤销未确认/);
 assert.equal(h.store.getSnapshot().status,'unauthenticated');assert.match(h.store.getSnapshot().error,/本地已退出，服务器撤销未确认/);
});
test('recovery and logout in the same turn settle without recursive recovery or stale identity',async()=>{
 const h=harness();await signIn(h);
 const recovery=h.auth.restoreSession(),exit=h.auth.logout();
 await Promise.all([recovery,exit]);
 assert.equal(h.store.getSnapshot().status,'unauthenticated');assert.equal(h.store.getSnapshot().context,null);
});
test('late login is superseded by logout and issued orphan session is revoked',async()=>{
 const h=harness(),gate=deferred(),fallback=h.getHandler();h.setHandler(async(url,options)=>{if(url.endsWith('/auth/login'))await gate.promise;return fallback(url,options);});
 const pending=signIn(h);await tick();await assert.rejects(h.auth.logout());gate.resolve();await assert.rejects(pending,/superseded/);
 assert.equal(h.store.getSnapshot().status,'unauthenticated');assert.ok(h.calls.some(c=>c.url.endsWith('/auth/logout')));
});
test('account switch has no prior company/branch cache; old response cannot restore former account',async()=>{
 const h=harness();await signIn(h);const gate=deferred(),fallback=h.getHandler();
 h.setHandler(async(url,options)=>{if(url.endsWith('/me'))await gate.promise;return fallback(url,options);});
 const pending=h.auth.refreshAccount();await tick();await h.auth.logout();h.advance();
 const other={...ctx,companyId:'company-b',customerId:'customer-b',grantId:'grant-b'};
 h.setHandler((url,options)=>url.endsWith('/me')?json({contexts:[other]}):url.endsWith('/branches')?json({customerId:other.customerId,grantId:other.grantId,items:[{...branch,id:'branch-b'}]}):fallback(url,options));
 await h.auth.login('other@example.invalid','other-synthetic-password');gate.resolve();await pending;
 assert.equal(h.store.getSnapshot().context.companyId,'company-b');assert.equal(h.store.getSnapshot().branches[0].id,'branch-b');assert.equal(h.store.getSnapshot().email,'other@example.invalid');
});
test('multiple tabs synchronize only logout events, never tokens; storage fallback also works',async()=>{
 const bus=new Set(),a=harness(bus),b=harness(bus),stopA=a.auth.startSessionLifecycle(),stopB=b.auth.startSessionLifecycle();await tick();a.advance();b.advance();await signIn(a);await signIn(b);
 await a.auth.logout();assert.equal(b.store.getSnapshot().status,'unauthenticated');
 assert.ok(a.writes.every(([key,value])=>key==='htt.portal.logout.v1'&&!value.includes('synthetic')));
 b.advance();await signIn(b);for(const fn of b.events.get('storage'))fn({key:'htt.portal.logout.v1',newValue:'non-secret-event'});assert.equal(b.store.getSnapshot().status,'unauthenticated');stopA();stopB();
});
test('invalid company/customer ownership or unauthorized/mismatched branches never authenticates',async()=>{
 for(const mode of ['companies','customers','empty','mismatch']){
  const h=harness(),fallback=h.getHandler();h.setHandler((url,options)=>url.endsWith('/me')?json({contexts:mode==='companies'?[ctx,{...ctx,companyId:'other'}]:mode==='customers'?[ctx,{...ctx,customerId:'other'}]:[ctx]}):url.endsWith('/branches')?json({customerId:mode==='mismatch'?'other':ctx.customerId,grantId:ctx.grantId,items:mode==='empty'?[]:[branch]}):fallback(url,options));
  await assert.rejects(signIn(h));assert.equal(h.store.getSnapshot().context,null);
 }
});
test('POST failures are never automatically replayed and arbitrary origins are rejected',async()=>{
 const h=harness(),transport=h.load('src/lib/request.ts'),api=h.load('src/api/portal.ts').portalApi;
 h.setHandler(()=>json({code:'AUTHENTICATION_REQUIRED'},401));await assert.rejects(transport.request(api.logout,{token:'synthetic-access'}));assert.equal(h.calls.length,1);
 await assert.rejects(transport.request({path:'https://untrusted.invalid/api/portal/v1/me',method:'GET'},{token:'synthetic-access'}));assert.equal(h.calls.length,1);
});
