import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
export function validateRelease({pkg, node, pnpm, platform, env, tag, dirty}) {
 const errors=[];
 if(node!==pkg.engines.node)errors.push('Node version differs from pinned runtime');
 if(pnpm!==pkg.engines.pnpm)errors.push('pnpm version differs from pinned runtime');
 for(const group of ['dependencies','devDependencies'])for(const version of Object.values(pkg[group]))if(!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version))errors.push('Dependency versions must be exact');
 if(tag!==`v${pkg.version}`)errors.push('Release tag must match package version');
 if(dirty)errors.push('Formal releases require a clean committed source tree');
 if(!['darwin','win32'].includes(platform))errors.push('Use a native macOS or Windows signing runner');
 const required=platform==='darwin'?['CSC_LINK','CSC_KEY_PASSWORD','CSC_NAME','APPLE_ID','APPLE_APP_SPECIFIC_PASSWORD','APPLE_TEAM_ID']:['CSC_LINK','CSC_KEY_PASSWORD'];
 for(const key of required)if(!env[key]?.trim())errors.push(`Missing signing credential: ${key}`);
 if(platform==='darwin'&&!env.CSC_NAME?.startsWith('Developer ID Application:'))errors.push('Developer ID Application identity is required');
 if(env.CSC_IDENTITY_AUTO_DISCOVERY==='false')errors.push('Signing discovery cannot be disabled for formal release');
 return errors;
}
export function runPnpm(args, options={}) {
 if(process.env.npm_execpath)return execFileSync(process.execPath,[process.env.npm_execpath,...args],options);
 if(process.platform==='win32')throw new Error('On Windows invoke through pnpm release:signed or pnpm release:check');
 return execFileSync('pnpm',args,options);
}
export function preflight() {
 const pkg=JSON.parse(readFileSync('package.json','utf8'));
 const pnpm=runPnpm(['--version'],{encoding:'utf8'}).trim();
 const dirty=!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim();
 const tag=process.env.HTT_RELEASE_TAG;
 if(!tag||!/^v[0-9]+\.[0-9]+\.[0-9]+(?:-[\w.-]+)?$/.test(tag))throw new Error('Specify an existing vX.Y.Z release tag');
 const tagged=execFileSync('git',['rev-parse',`refs/tags/${tag}^{commit}`],{encoding:'utf8'}).trim();
 const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 if(tagged!==head)throw new Error('Checkout must match the immutable release tag');
 const errors=validateRelease({pkg,node:process.versions.node,pnpm,platform:process.platform,env:process.env,tag:process.env.HTT_RELEASE_TAG,dirty});
 if(errors.length)throw new Error(errors.join('\n'));
 return pkg;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{preflight();console.log('Formal release preflight passed');}catch(error){console.error(error.message);process.exitCode=1;}}
