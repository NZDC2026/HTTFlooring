import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let root: string, security: InstanceType<typeof import('../../../../electron/security/localSecurity').LocalSecurity>, host: InstanceType<typeof import('../../../../electron/security/businessHost').BusinessHost>;
const admin = { username: 'payroll.admin', displayName: 'Payroll acceptance', password: 'Payroll-test-password-4821' };
beforeEach(async () => { vi.resetModules(); vi.stubGlobal('__HTT_MAIN_HOST__', true); vi.stubGlobal('window', undefined); vi.stubGlobal('localStorage', undefined); root = mkdtempSync(join(tmpdir(), 'htt-payroll-')); const { LocalSecurity } = await import('../../../../electron/security/localSecurity'), { BusinessHost } = await import('../../../../electron/security/businessHost'); security = new LocalSecurity(join(root, 'security.json')); security.setup(admin); host = new BusinessHost(join(root, 'business.json'), security); await host.initialize(); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); rmSync(root, { recursive: true, force: true }); });
const cmd = (repository: string, method: string, ...args: unknown[]) => host.command({ repository, method, args }).result as any;
const raw = () => host.exportBackup().repositories as any;

const customer=()=>raw().customers.customers[0];
const note=(patch:any={})=>({customerId:customer().id,operationId:crypto.randomUUID(),text:'A durable customer note',source:'Desktop',...patch});
it('saves append-only customer notes with trusted actor and survives a native business-host restart',async()=>{const request=note(),saved=cmd('customers','addNote',request);expect(saved.actorId).toBe(security.principal()?.userId);expect(cmd('customers','addNote',request).id).toBe(saved.id);const {BusinessHost}=await import('../../../../electron/security/businessHost');host=new BusinessHost(join(root,'business.json'),security);await host.initialize();expect(customer().notes[0]).toMatchObject({id:saved.id,text:request.text,source:'Desktop'});expect(customer().notes).toHaveLength(1);});
it('deduplicates imported note identity and rejects conflicting provenance',()=>{const request=note({source:'Sales import',externalId:'sales-device-1:note-23'});const saved=cmd('customers','addNote',request);expect(cmd('customers','addNote',{...request,operationId:crypto.randomUUID()}).id).toBe(saved.id);expect(()=>cmd('customers','addNote',{...request,text:'Conflicting content'})).toThrow(/different content/);expect(()=>cmd('customers','addNote',note({source:'Sales import'}))).toThrow(/external source/);expect(()=>cmd('customers','addNote',note({externalId:'forged'}))).toThrow(/cannot claim/);});
it('denies auditor mutations and preserves the note through unrelated customer edits',()=>{const n=cmd('customers','addNote',note()),c=customer();const u=security.createUser({username:'notes.audit',displayName:'Notes audit',password:admin.password,roles:['AUDITOR']});security.login({username:u.username,password:admin.password});expect(()=>cmd('customers','addNote',note())).toThrow(/Permission denied/);expect((host.view().repositories.customers as any).customers.find((x:any)=>x.id===c.id).notes[0].id).toBe(n.id);});
it.each(['','   '])('rejects empty note %s',text=>{expect(()=>cmd('customers','addNote',note({text}))).toThrow();expect(customer().notes).toBeUndefined();});
