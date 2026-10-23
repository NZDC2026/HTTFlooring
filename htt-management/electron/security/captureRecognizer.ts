import {existsSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join,extname} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {recognitionSchema} from '../../src/features/bill-capture/recognitionModel';
let helper='';
export function configureCaptureHelper(path:string){helper=path;}
export function recognizeCaptureFile(name:string,bytes:Buffer){
 if(process.platform!=='darwin'||!helper||!existsSync(helper))throw new Error('Local OCR requires the macOS desktop build with the bundled recognition helper. Use manual/CSV capture on this platform.');
 const directory=mkdtempSync(join(tmpdir(),'htt-local-ocr-'));
 try{const file=join(directory,'source'+extname(name).toLowerCase());writeFileSync(file,bytes,{mode:0o600});let text:string;
  // Apple Vision can fail in a translated x86 process. Use the universal helper's
  // native arm64 slice only when Apple's translation flag confirms Apple Silicon.
  let translated=false;
  if(process.arch==='x64')try{translated=execFileSync('/usr/sbin/sysctl',['-in','sysctl.proc_translated'],{encoding:'utf8',timeout:2000,stdio:['ignore','pipe','ignore']}).trim()==='1';}catch{/* Native Intel has no translation flag. */}
  try{text=execFileSync(translated?'/usr/bin/arch':helper,translated?['-arm64',helper,file]:[file],{encoding:'utf8',timeout:45000,maxBuffer:2000000,stdio:['ignore','pipe','pipe']});}catch{throw new Error('Local recognition failed or timed out. Use an unlocked PDF (1–10 pages) or a single PNG/JPEG up to 40 megapixels, then retry.');}
  return recognitionSchema.parse(JSON.parse(text));
 }finally{rmSync(directory,{recursive:true,force:true});}
}
