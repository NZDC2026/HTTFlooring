import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,dirname,join,relative} from 'node:path';
import ts from 'typescript';
const root=process.cwd(),manifest=JSON.parse(readFileSync('docs/documentation-index.json','utf8'));
const actual=readdirSync('docs').filter(n=>n.endsWith('.md')).map(n=>'docs/'+n).sort();
if(JSON.stringify(actual)!==JSON.stringify(manifest.map(r=>r.path).sort()))throw Error('Documentation classification is stale. Classify every Markdown file.');
for(const row of manifest){
 const text=readFileSync(row.path,'utf8');
 if(!['current','dated-record'].includes(row.status))throw Error('Unknown documentation status: '+row.path);
 if(row.status==='dated-record'&&!text.startsWith('> G14 reference status'))throw Error('Missing dated scope banner: '+row.path);
 for(const target of row.followUps)if(!existsSync(target))throw Error('Missing follow-up: '+target);
 for(const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  const href=match[1].replace(/^<|>$/g,'').split('#')[0];
  if(!href||/^(?:[a-z]+:|\/)/i.test(href))continue;
  const target=resolve(dirname(row.path),decodeURIComponent(href));
  if(!existsSync(target))throw Error(`Broken relative documentation link: ${row.path} -> ${href}`);
 }
}
const visited=new Set(),legacy=new Set(['src/features/page-previews/legacyCatalog.ts','src/features/page-previews/previewModel.ts','src/features/page-previews/PreviewFlows.tsx']);
function walk(file){
 const name=relative(root,file).replaceAll('\\','/');if(visited.has(name))return;visited.add(name);
 if(legacy.has(name))throw Error('Legacy sample module reachable from app: '+name);
 const source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
 function inspect(node){
  let spec;
  if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&!node.isTypeOnly&&!node.importClause?.isTypeOnly)spec=node.moduleSpecifier.text;
  if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))spec=node.arguments[0].text;
  if(spec?.startsWith('.')){
   const base=resolve(dirname(file),spec),found=[base,base+'.ts',base+'.tsx',join(base,'index.ts'),join(base,'index.tsx')].find(p=>existsSync(p)&&/\.(?:ts|tsx)$/.test(p));if(found)walk(found);
  }
  ts.forEachChild(node,inspect);
 }
 inspect(source);
}
for(const entry of ['src/main.tsx','electron/main/index.ts'])walk(resolve(entry));
const routes=readFileSync('src/features/page-previews/previewRoutes.tsx','utf8');
for(const old of ['ReceiptRefund','ImportWizard','ConnectedBankWorkbench','SettingsPreview','ModuleList','ModuleForm','ModuleDetail','OperationalReport'])if(new RegExp('\\b'+old+'\\b').test(routes))throw Error('Retired sample dispatcher still present: '+old);
console.log(`Current guidance verified: ${manifest.length} documents, links valid, ${visited.size} reachable source modules isolated from retired samples.`);
