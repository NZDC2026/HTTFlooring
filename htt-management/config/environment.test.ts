import {afterEach,it,expect} from 'vitest';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import env from './environment.cjs';
const folders:string[]=[];
afterEach(()=>{for(const p of folders.splice(0))rmSync(p,{recursive:true,force:true});});
function run(files:Record<string,string>,overrides:Record<string,string>={},script="JSON.stringify({port:env.API_PORT,host:env.HOST,origin:env.PUBLIC_ORIGIN,key:env.RESEND_API_KEY,tag:env.HTT_RELEASE_TAG,profile:env.HTT_ACCEPTANCE_PROFILE})"){
 const root=mkdtempSync(join(tmpdir(),'htt-env-'));folders.push(root);for(const [name,text] of Object.entries(files))writeFileSync(join(root,name),text);
 const child=env.childEnvironment();for(const key of Object.keys(env))delete child[key];Object.assign(child,overrides);
 const source=`const env=require(${JSON.stringify(resolve('config/environment.cjs'))});process.stdout.write(${script});`;
 return execFileSync(process.execPath,['-e',source],{cwd:root,env:child,encoding:'utf8'});
}
it('loads .env at startup and preserves quoted secrets without exposing them through client code',()=>{
 const result=JSON.parse(run({'.env':'API_PORT=9001\nHOST=127.0.0.1\nRESEND_API_KEY="sample-key#with-comment-character"\nPUBLIC_ORIGIN=https://sample.example.invalid\n'}));
 expect(result.port).toBe('9001');expect(result.key).toBe('sample-key#with-comment-character');expect(result.origin).toBe('https://sample.example.invalid');
});
it('lets shell and isolated acceptance overrides win over .env',()=>{
 const result=JSON.parse(run({'.env':'API_PORT=9001\nHTT_ACCEPTANCE_PROFILE=unused\n'},{API_PORT:'9002',HTT_ACCEPTANCE_PROFILE:'/private/tmp/htt-env-sample'}));expect(result.port).toBe('9002');expect(result.profile).toBe('/private/tmp/htt-env-sample');
});
it('uses safe example defaults but not a made-up key, profile or signing tag',()=>{
 const result=JSON.parse(run({'.env.example':readFileSync('.env.example','utf8')}));expect(result.port).toBe('8787');expect(result.host).toBe('127.0.0.1');expect(result.key).toBeUndefined();expect(result.profile).toBeUndefined();expect(result.tag).toBeUndefined();
});
it('treats explicitly blank secrets as absent and reports missing required settings by name only',()=>{
 expect(JSON.parse(run({'.env.example':'RESEND_API_KEY=sample-default\n','.env':'RESEND_API_KEY=\n'})).key).toBeUndefined();
 expect(run({}, {}, "(()=>{try{env.required('HOST')}catch(e){return e.message}})()")).toBe('Configure HOST in .env or the process environment.');
});
