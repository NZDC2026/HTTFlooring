import {it,expect,afterEach} from 'vitest';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
// @ts-expect-error Native ESM release tool is exercised directly.
import {architectures,inspectPackage} from '../../../scripts/verify-desktop-package.mjs';
const req=createRequire(createRequire(import.meta.url).resolve('electron-builder')),asar=createRequire(req.resolve('app-builder-lib'))('@electron/asar');
const roots:string[]=[];afterEach(()=>roots.splice(0).forEach(p=>rmSync(p,{recursive:true,force:true})));
function pe(machine=0x8664){const b=Buffer.alloc(160);b.write('MZ');b.writeUInt32LE(64,60);b.write('PE\0\0',64);b.writeUInt16LE(machine,68);return b;}
async function fixture(omit?:string){
 const root=mkdtempSync(join(tmpdir(),'htt-package-'));roots.push(root);const source=join(root,'source'),directory=join(root,'package'),resources=join(directory,'resources');mkdirSync(resources,{recursive:true});
 for(const name of ['package.json','dist/index.html','dist-electron/index.js','dist-electron/index.mjs']){if(name===omit)continue;const p=join(source,name);mkdirSync(join(p,'..'),{recursive:true});writeFileSync(p,name==='package.json'?JSON.stringify({version:'0.1.0',main:'dist-electron/index.js'}):'synthetic');}
 await asar.createPackage(source,join(resources,'app.asar'));writeFileSync(join(resources,'icon.png'),'synthetic');writeFileSync(join(directory,'HTT Flooring Management System.exe'),pe());return {directory,resources,platform:'win32',arch:'x64',expectedVersion:'0.1.0'};
}
it('accepts a complete Windows package without claiming runtime or signature validation',async()=>expect(inspectPackage(await fixture()).scope).toBe('structural-package-check-only'));
it('rejects the observed cross-build macOS helper leak',async()=>{const f=await fixture();mkdirSync(join(f.resources,'ocr'));writeFileSync(join(f.resources,'ocr/htt-ocr'),'Mach-O');expect(()=>inspectPackage(f)).toThrow(/must not ship/);});
it('rejects missing preload resources',async()=>{const f=await fixture('dist-electron/index.mjs');expect(()=>inspectPackage(f)).toThrow(/entry point/);});
it('rejects a wrong-architecture application',async()=>{const f=await fixture();expect(()=>inspectPackage({...f,arch:'arm64'})).toThrow(/architecture/);});
it('rejects stale packaged versions',async()=>{const f=await fixture();expect(()=>inspectPackage({...f,expectedVersion:'0.2.0'})).toThrow(/version/);});
it('rejects malformed/truncated executables',()=>{expect(()=>architectures(Buffer.alloc(3))).toThrow(/Truncated/);expect(()=>architectures(Buffer.alloc(100))).toThrow(/Unsupported/);const invalid=pe();invalid.writeUInt32LE(999,60);expect(()=>architectures(invalid)).toThrow(/Invalid PE/);});
