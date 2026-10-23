import {appendFileSync,existsSync,mkdirSync,readFileSync,renameSync,statSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
export type OperationalEvent='start'|'ready'|'clean-exit'|'previous-unclean-exit'|'renderer-gone'|'renderer-unresponsive'|'renderer-responsive'|'load-failed'|'startup-failed'|'main-exception'|'main-rejection'|'pdf-export-failed'|'recurring-stopped';
const allowed=new Set<OperationalEvent>(['start','ready','clean-exit','previous-unclean-exit','renderer-gone','renderer-unresponsive','renderer-responsive','load-failed','startup-failed','main-exception','main-rejection','pdf-export-failed','recurring-stopped']);
// Intentionally accepts no error objects, messages, URLs, user identifiers or business payloads.
// Operational diagnostics are separate from the access-controlled business audit.
export class OperationalLog {
 readonly directory:string;
 private readonly session=randomUUID();
 private available=true;
 private alerts=new Set<string>();
 private version:string;
 private maxBytes:number;
 constructor(root:string,version:string,maxBytes=256*1024){
  this.version=version;this.maxBytes=maxBytes;
  this.directory=join(root,'diagnostics');
  try{
   mkdirSync(this.directory,{recursive:true,mode:0o700});
   const marker=join(this.directory,'session.json');
   if(existsSync(marker)){
    try{if(JSON.parse(readFileSync(marker,'utf8')).clean!==true)this.event('previous-unclean-exit');}
    catch{this.event('previous-unclean-exit');}
   }
   writeFileSync(marker,JSON.stringify({session:this.session,clean:false}),{mode:0o600});
   this.event('start');
  }catch{this.available=false;}
 }
 event(event:OperationalEvent){
  if(!allowed.has(event))return;
  if(['previous-unclean-exit','renderer-gone','renderer-unresponsive','load-failed','startup-failed','main-exception','main-rejection','recurring-stopped','pdf-export-failed'].includes(event))this.alerts.add(event);
  if(event==='renderer-responsive')this.alerts.delete('renderer-unresponsive');
  if(!this.available)return;
  try{
   const file=join(this.directory,'operations.jsonl');
   if(existsSync(file)&&statSync(file).size>=this.maxBytes){
    for(let i=2;i>=1;i--){const from=i===1?file:`${file}.${i-1}`;if(existsSync(from))renameSync(from,`${file}.${i}`);}
   }
   appendFileSync(file,JSON.stringify({at:new Date().toISOString(),session:this.session,version:/^[0-9]+\.[0-9]+\.[0-9]+(?:-[\w.-]+)?$/.test(this.version)?this.version:'unknown',platform:process.platform,arch:process.arch,event})+'\n',{mode:0o600});
  }catch{this.available=false;}
 }
 finish(){
  this.event('clean-exit');
  try{writeFileSync(join(this.directory,'session.json'),JSON.stringify({session:this.session,clean:true}),{mode:0o600});}catch{this.available=false;}
 }
 status(){return {available:this.available,alerts:[...this.alerts]};}
}
