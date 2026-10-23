import {it,expect,afterEach,vi} from 'vitest';
import child from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {configureCaptureHelper,recognizeCaptureFile} from '../../../electron/security/captureRecognizer';
const roots:string[]=[];afterEach(()=>{vi.restoreAllMocks();syncBuiltinESMExports();vi.unstubAllGlobals();roots.splice(0).forEach(p=>rmSync(p,{recursive:true,force:true}));});
function setup(translated:string|Error){
 vi.stubGlobal('process',Object.create(process,{arch:{value:'x64'},platform:{value:'darwin'}}));
 const p=mkdtempSync(join(tmpdir(),'htt-ocr-arch-'));roots.push(p);const helper=join(p,'htt-ocr');writeFileSync(helper,'synthetic');configureCaptureHelper(helper);
 const spy=vi.spyOn(child,'execFileSync').mockImplementation(((command:string)=>{if(command==='/usr/sbin/sysctl'){if(translated instanceof Error)throw translated;return translated;}return JSON.stringify({engine:'Synthetic',pages:1,lines:[{page:1,text:'INVOICE',confidence:1}]});}) as any);
 syncBuiltinESMExports();return {spy,helper};
}
it('uses native arm64 OCR when x64 desktop is translated on Apple Silicon',()=>{const {spy,helper}=setup('1\n');recognizeCaptureFile('invoice.jpg',Buffer.from('synthetic'));expect(spy.mock.calls[1][0]).toBe('/usr/bin/arch');expect(spy.mock.calls[1][1]).toEqual(['-arm64',helper,expect.stringContaining('source.jpg')]);});
it.each(['0\n',new Error('unknown sysctl')])('retains direct helper execution on native Intel (%s)',flag=>{const {spy,helper}=setup(flag);recognizeCaptureFile('invoice.jpg',Buffer.from('synthetic'));expect(spy.mock.calls[1][0]).toBe(helper);expect(spy.mock.calls[1][1]).toEqual([expect.stringContaining('source.jpg')]);});
