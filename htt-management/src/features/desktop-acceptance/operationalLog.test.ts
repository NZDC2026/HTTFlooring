import {describe,it,expect,afterEach} from 'vitest';
import {mkdtempSync,readdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {OperationalLog} from '../../../electron/main/operationalLog';
const roots:string[]=[];
const root=()=>{const p=mkdtempSync(join(tmpdir(),'htt-diagnostics-'));roots.push(p);return p;};
afterEach(()=>roots.splice(0).forEach(p=>rmSync(p,{recursive:true,force:true})));
describe('local operational diagnostics',()=>{
 it('detects unclean shutdown and clears it only after a clean session',()=>{
  const p=root();new OperationalLog(p,'0.1.0');const second=new OperationalLog(p,'0.1.0');expect(second.status().alerts).toContain('previous-unclean-exit');second.finish();expect(new OperationalLog(p,'0.1.0').status().alerts).not.toContain('previous-unclean-exit');
 });
 it('bounds retained logs to current plus two generations',()=>{
  const log=new OperationalLog(root(),'0.1.0',1024);for(let n=0;n<100;n++)log.event('renderer-gone');
  const files=readdirSync(log.directory).filter(n=>n.startsWith('operations'));expect(files.sort()).toEqual(['operations.jsonl','operations.jsonl.1','operations.jsonl.2']);for(const f of files)expect(readFileSync(join(log.directory,f)).length).toBeLessThan(1500);
 });
 it('never serializes arbitrary payloads, invalid event names or invalid versions',()=>{
  const log=new OperationalLog(root(),'password=secret');log.event('customer@example.test' as any);log.event('pdf-export-failed');
  const content=readFileSync(join(log.directory,'operations.jsonl'),'utf8');expect(content).not.toMatch(/secret|customer@/);for(const row of content.trim().split('\n').map(n=>JSON.parse(n)))expect(Object.keys(row).sort()).toEqual(['arch','at','event','platform','session','version']);
 });
 it('degrades visibly without blocking business when the filesystem is unavailable',()=>{
  const p=root();writeFileSync(join(p,'diagnostics'),'blocked');const log=new OperationalLog(p,'0.1.0');expect(()=>{log.event('load-failed');log.finish();}).not.toThrow();expect(log.status()).toEqual({available:false,alerts:['load-failed']});
 });
 it('records health alerts and recovers the responsive state',()=>{
  const log=new OperationalLog(root(),'0.1.0');log.event('renderer-unresponsive');expect(log.status().alerts).toContain('renderer-unresponsive');log.event('renderer-responsive');expect(log.status().alerts).not.toContain('renderer-unresponsive');log.event('recurring-stopped');expect(log.status().alerts).toContain('recurring-stopped');
 });
});
