import { beforeEach,afterEach,it,expect,vi } from 'vitest';
const fixture=vi.hoisted(()=>({on:vi.fn(),scan:vi.fn(),initialize:vi.fn(),view:vi.fn(()=>({repositories:{},storage:{}})),require:vi.fn(),principal:vi.fn()}));
vi.mock('electron',()=>({app:{isPackaged:false,getAppPath:()=>'/synthetic-app'},ipcMain:{on:fixture.on},dialog:{}}));
vi.mock('../../../electron/security/localSecurity',()=>({LocalSecurity:class{require=fixture.require;principal=fixture.principal;logout=vi.fn();},atomicJson:vi.fn()}));
vi.mock('../../../electron/security/businessHost',()=>({BusinessHost:class{initialize=fixture.initialize;scanRecurringDue=fixture.scan;view=fixture.view;}}));
import {registerSecurityIpc} from '../../../electron/security/registerSecurityIpc';
let owner:{webContents:{mainFrame:object}},handle:ReturnType<typeof registerSecurityIpc>;
beforeEach(()=>{vi.useFakeTimers();vi.clearAllMocks();fixture.scan.mockReset().mockReturnValue({generated:1,failed:0,remaining:0});fixture.initialize.mockReset().mockResolvedValue(undefined);owner={webContents:{mainFrame:{}}};handle=registerSecurityIpc('/private/tmp/unused-g05-timer',()=>owner as any);});
afterEach(()=>{handle.dispose();vi.useRealTimers();vi.restoreAllMocks();});
async function request(action:string,input={}){const e={sender:owner.webContents,senderFrame:owner.webContents.mainFrame,returnValue:undefined as any};await fixture.on.mock.calls[0][1](e,action,input);return e.returnValue;}
it('scans after successful desktop bootstrap and every minute, and stops on disposal',async()=>{
 await request('business.bootstrap');expect(fixture.scan).toHaveBeenCalledTimes(1);expect(fixture.initialize.mock.invocationCallOrder[0]).toBeLessThan(fixture.scan.mock.invocationCallOrder[0]);
 vi.advanceTimersByTime(59_999);expect(fixture.scan).toHaveBeenCalledTimes(1);vi.advanceTimersByTime(1);expect(fixture.scan).toHaveBeenCalledTimes(2);handle.dispose();vi.advanceTimersByTime(120_000);expect(fixture.scan).toHaveBeenCalledTimes(2);
});
it('does not overlap a busy bootstrap and returns the authoritative view after a manual scan',async()=>{
 let complete!:()=>void;fixture.initialize.mockReturnValue(new Promise<void>(resolve=>{complete=resolve;}));const pending=request('business.bootstrap');vi.advanceTimersByTime(60_000);expect(fixture.scan).not.toHaveBeenCalled();complete();await pending;
 expect(await request('business.recurring.scan')).toEqual({ok:true,value:{result:{generated:1,failed:0,remaining:0},view:{repositories:{},storage:{}}}});expect(fixture.require).toHaveBeenCalledWith('inventory.read');
});
it('rejects caller-controlled dates, limits and actors and untrusted senders',async()=>{
 for(const input of [{date:'2099-01-01'},{limit:999999},{actorId:'forged'}])expect((await request('business.recurring.scan',input)).ok).toBe(false);
 const e={sender:{},senderFrame:owner.webContents.mainFrame,returnValue:undefined as any};await fixture.on.mock.calls[0][1](e,'business.recurring.scan',{});expect(e.returnValue.error).toContain('Untrusted');expect(fixture.scan).not.toHaveBeenCalled();
});
it('stops the periodic loop after a recovery failure instead of repeatedly attempting writes',()=>{
 vi.spyOn(console,'error').mockImplementation(()=>{});fixture.scan.mockImplementation(()=>{throw new Error('Restart required');});vi.advanceTimersByTime(180_000);expect(fixture.scan).toHaveBeenCalledTimes(1);
});
