import {readFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const builderRequire=createRequire(createRequire(import.meta.url).resolve('electron-builder'));
const asar=createRequire(builderRequire.resolve('app-builder-lib'))('@electron/asar');
export function architectures(bytes){
 if(bytes.length<32)throw new Error('Truncated executable');
 if(bytes[0]===0x4d&&bytes[1]===0x5a){
  if(bytes.length<64)throw new Error('Truncated PE header');
  const offset=bytes.readUInt32LE(60);if(offset+26>bytes.length||bytes.toString('ascii',offset,offset+4)!=='PE\0\0')throw new Error('Invalid PE header');
  const machine=bytes.readUInt16LE(offset+4);return machine===0x8664?['x64']:machine===0xaa64?['arm64']:machine===0x14c?['ia32']:[];
 }
 const magic=bytes.readUInt32BE(0);
 const cpu=value=>value===0x01000007?'x64':value===0x0100000c?'arm64':'unknown';
 if(magic===0xcffaedfe)return [cpu(bytes.readUInt32LE(4))];
 if(magic===0xcafebabe){const count=bytes.readUInt32BE(4);if(count>16||8+count*20>bytes.length)throw new Error('Invalid universal header');return Array.from({length:count},(_,i)=>cpu(bytes.readUInt32BE(8+i*20)));}
 throw new Error('Unsupported executable format');
}
export function inspectPackage({directory,platform,arch,expectedVersion}){
 if(!['darwin','win32'].includes(platform)||!['arm64','x64'].includes(arch))throw new Error('Unsupported desktop target');
 const resources=platform==='darwin'?join(directory,'Contents','Resources'):join(directory,'resources');
 const binary=platform==='darwin'?join(directory,'Contents','MacOS','HTT Flooring Management System'):join(directory,'HTT Flooring Management System.exe');
 const actual=architectures(readFileSync(binary));if(!actual.includes(arch))throw new Error('Application architecture differs from target');
 const archive=join(resources,'app.asar'),files=asar.listPackage(archive).map(p=>p.replaceAll('\\','/').replace(/^\//,''));
 const pkg=JSON.parse(asar.extractFile(archive,'package.json').toString());
 if(pkg.version!==expectedVersion)throw new Error('Packaged version differs from source');
 for(const file of [pkg.main,'dist/index.html','dist-electron/index.mjs'])if(typeof file!=='string'||!files.includes(file))throw new Error('Missing packaged entry point');
 if(files.some(p=>/\.(test|spec)\.[cm]?[jt]sx?$/.test(p)))throw new Error('Test source leaked into package');
 if(!existsSync(join(resources,'icon.png')))throw new Error('Missing shared application icon');
 const helper=join(resources,'ocr','htt-ocr');
 if(platform==='darwin'){
  if(!existsSync(helper))throw new Error('Missing macOS OCR helper');
  if(!architectures(readFileSync(helper)).includes(arch))throw new Error('OCR helper architecture differs from target');
 }else if(existsSync(helper))throw new Error('macOS OCR helper must not ship in Windows package');
 return {version:pkg.version,platform,arch,entry:pkg.main,archiveFiles:files.length,ocr:platform==='darwin'?'bundled':'manual-csv-only',scope:'structural-package-check-only'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const platform=process.argv[2]||process.platform,arch=process.argv[3]||process.arch;
 const directory=resolve(process.argv[4]||(platform==='darwin'?`release/${arch==='arm64'?'mac-arm64':'mac'}/HTT Flooring Management System.app`:'release/win-unpacked'));
 const expectedVersion=JSON.parse(readFileSync('package.json','utf8')).version;
 console.log(JSON.stringify(inspectPackage({directory,platform,arch,expectedVersion}),null,2));
}
