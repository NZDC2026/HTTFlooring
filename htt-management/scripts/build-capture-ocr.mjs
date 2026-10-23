import {execFileSync} from 'node:child_process';
import {mkdirSync,rmSync} from 'node:fs';
mkdirSync('dist-ocr',{recursive:true});
if(process.platform==='darwin') {
 for(const arch of ['arm64','x86_64']) execFileSync('/usr/bin/xcrun',['swiftc','native/CaptureOCR.swift','-O','-target',`${arch}-apple-macosx12.0`,'-o',`dist-ocr/htt-ocr-${arch}`],{stdio:'inherit'});
 execFileSync('/usr/bin/lipo',['-create','dist-ocr/htt-ocr-arm64','dist-ocr/htt-ocr-x86_64','-output','dist-ocr/htt-ocr'],{stdio:'inherit'});
 for(const arch of ['arm64','x86_64']) rmSync(`dist-ocr/htt-ocr-${arch}`);
}
