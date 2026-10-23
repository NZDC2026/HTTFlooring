import {inspectPackage} from './verify-desktop-package.mjs';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=resolve(process.argv[2]||'release'),signed=process.argv.includes('--signed');
const files=readdirSync(root).filter(n=>/\.(dmg|exe)$/.test(n)).sort();
if(!files.length)throw new Error('No installer artifacts found');
const platform=process.platform;
const sourceVersion=JSON.parse(readFileSync('package.json','utf8')).version;
if(signed){
 if(platform==='darwin'){
  const apps=[];for(const dir of readdirSync(root,{withFileTypes:true}))if(dir.isDirectory()&&dir.name.startsWith('mac'))for(const n of readdirSync(join(root,dir.name)))if(n.endsWith('.app'))apps.push(join(root,dir.name,n));
  if(!apps.length)throw new Error('No macOS application to verify');
  for(const app of apps){const arch=app.includes('mac-arm64')?'arm64':'x64';inspectPackage({directory:app,platform,arch,expectedVersion:sourceVersion});execFileSync('codesign',['--verify','--deep','--strict',app]);execFileSync('spctl',['--assess','--type','execute',app]);execFileSync('xcrun',['stapler','validate',app]);}
  for(const file of files){if(!file.endsWith('.dmg'))throw new Error('Unexpected artifact on macOS');execFileSync('hdiutil',['verify',join(root,file)]);}
 }else if(platform==='win32'){
  inspectPackage({directory:join(root,'win-unpacked'),platform,arch:'x64',expectedVersion:sourceVersion});
  for(const file of files){if(!file.endsWith('.exe'))throw new Error('Unexpected artifact on Windows');execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',"$s=Get-AuthenticodeSignature -LiteralPath $env:HTT_VERIFY_ARTIFACT; if($s.Status -ne 'Valid'){exit 1}"],{env:{...process.env,HTT_VERIFY_ARTIFACT:join(root,file)}});}
 }else throw new Error('Native signature verification required');
}
const porcelain=execFileSync('git',['status','--porcelain','--untracked-files=all'],{encoding:'utf8'}).trimEnd();
const prefix=execFileSync('git',['rev-parse','--show-prefix'],{encoding:'utf8'}).trim();
// Historical generated bundles are tracked; a fresh build may change only those.
const sourceDirty=porcelain.split('\n').filter(Boolean).some(line=>!line.slice(3).startsWith(`${prefix}dist-electron/`));
if(signed&&sourceDirty)throw new Error('Source changed during formal build; discard this candidate');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const pkg=JSON.parse(readFileSync('package.json','utf8'));
const manifest={version:pkg.version,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:!!porcelain,sourceDirty,node:process.versions.node,platform,architecture:process.arch,lockfileSha256:sha('pnpm-lock.yaml'),verification:signed?'native-signature-and-mac-notarization-verified':'UNSIGNED-INTERNAL-ONLY',createdAt:new Date().toISOString(),artifacts:files.map(name=>({name,sha256:sha(join(root,name))}))};
writeFileSync(join(root,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
writeFileSync(join(root,'SHA256SUMS.txt'),manifest.artifacts.map(a=>`${a.sha256}  ${a.name}`).join('\n')+'\n');
console.log('Installer hashes and release manifest written');
