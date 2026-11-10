const locations=new Map<string,string>();
function key(user:string,path:string){return `htt:list-return:v1:${JSON.stringify([user,path])}`;}
export function rememberListLocation(user:string,path:string,search:string){if(!user)return;const k=key(user,path);locations.set(k,path+search);try{sessionStorage.setItem(k,path+search);}catch{/* Optional tab-scoped storage. */}}
export function listReturnLocation(user:string,target:string){const path=target.split('?')[0],k=key(user,path);if(!user||target.includes('?'))return target;let saved=locations.get(k);try{saved??=sessionStorage.getItem(k)??undefined;}catch{/* In-memory fallback. */}return saved?.split('?')[0]===path?saved:target;}
