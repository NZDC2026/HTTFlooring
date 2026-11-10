/** Read-only inventory of the three current clients; no frontend adapters are installed. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),root=path.dirname(project);
const require=createRequire(path.join(root,'htt-management/package.json'));const ts=require('typescript');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const repositories=[],nativeActions=[],portalRequests=[],inputs={};
function literal(node){return node&&ts.isStringLiteralLike(node)?node.text:undefined;}
for(const app of ['htt-management','customer-portal'])for(const file of walk(path.join(root,app,'src')).filter(f=>/\.(ts|tsx)$/.test(f)&&!f.includes('.test.'))){
 const text=fs.readFileSync(file,'utf8'),name=path.relative(root,file);inputs[name]=sha(text);const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
 function visit(n){
  if(ts.isCallExpression(n)){
   const fn=n.expression.getText(source),args=n.arguments;
   if(fn==='registerRepository'&&literal(args[0])&&args[1]&&ts.isObjectLiteralExpression(args[1])){
    const props=args[1].properties,commands=props.find(p=>p.name?.getText(source)==='commands'),read=props.find(p=>p.name?.getText(source)==='read');
    const methods=commands&&ts.isPropertyAssignment(commands)&&ts.isObjectLiteralExpression(commands.initializer)?commands.initializer.properties.filter(ts.isPropertyAssignment).map(p=>({method:p.name.getText(source).replace(/^['"]|['"]$/g,''),permission:literal(p.initializer)??p.initializer.getText(source),internal:p.initializer.kind===ts.SyntaxKind.NullKeyword})):[];
    repositories.push({repository:literal(args[0]),readPermission:read&&ts.isPropertyAssignment(read)?literal(read.initializer)??read.initializer.getText(source):null,commands:methods,source:name,line:source.getLineAndCharacterOfPosition(n.getStart()).line+1});
   }
   if(fn==='nativeRequest'&&literal(args[0]))nativeActions.push({action:literal(args[0]),source:name});
   if(app==='customer-portal'&&fn==='request'&&literal(args[0]))portalRequests.push({action:literal(args[0]),source:name});
  }ts.forEachChild(n,visit);
 }visit(source);
}
const flutter=[];
for(const file of walk(path.join(root,'htt_flooring_app/lib')).filter(f=>f.endsWith('.dart'))){const text=fs.readFileSync(file,'utf8');inputs[path.relative(root,file)]=sha(text);for(const m of text.matchAll(/(?:\.request|\brequest)\(\s*'(GET|POST|PUT|PATCH|DELETE)'\s*,\s*'([^']+)'/g))flutter.push({method:m[1],path:m[2],source:path.relative(root,file)});}
const routes=[];for(const file of walk(path.join(project,'src/main/java')).filter(f=>f.endsWith('.java'))){const text=fs.readFileSync(file,'utf8');const prefix=[...text.matchAll(/@RequestMapping\("([^"]+)"\)/g)][0]?.[1]??'';for(const m of text.matchAll(/@(Get|Post|Put|Patch|Delete)Mapping\(([\s\S]*?)\)\s*/g))for(const v of m[2].matchAll(/"([^"\n]+)"/g))if(v[1].startsWith('/'))routes.push({method:m[1].toUpperCase(),path:prefix+v[1],source:path.relative(project,file)});}
const result={scope:'Source inventory, not behavioral compatibility or frontend cutover acceptance',clients:{'htt-management':{transport:'Electron securityBridge / Node POST /api/security business.command',repositories,nativeActions},htt_flooring_app:{transport:'VisitBackend REST; remaining services currently local',restCalls:flutter},'customer-portal':{transport:'Most pages use local preview data; follow-up uses Node POST /api/dispatch-portal',requests:portalRequests}},javaRoutes:routes,sourceSha256:inputs};
const target=process.argv[2]??path.join(project,'target/frontend-contract-inventory.json');fs.mkdirSync(path.dirname(path.resolve(target)),{recursive:true});fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({output:target,repositories:repositories.length,commands:repositories.reduce((n,r)=>n+r.commands.length,0),flutterRestCalls:flutter.length,javaRoutes:routes.length}));
