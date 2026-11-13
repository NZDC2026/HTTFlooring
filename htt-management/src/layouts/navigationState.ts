/** Resolve one top-level owner; nested workflows can have their own sidebar entry. */
export const navigationOwners = [
 '/workspace','/dashboard','/demo','/sales','/sales/credit-returns',
 '/promotions','/procurement','/purchases','/purchases/incoming-shipments',
 '/inventory','/banking','/accounting','/payroll','/reports','/contacts',
 '/contacts/supplier-dashboard','/contacts/suppliers','/tasks','/tools/import-export',
 '/settings','/settings/employees','/settings/trash','/settings/preferences',
] as const;
export function pathWithin(path:string,root:string){return path===root||path.startsWith(root+'/');}
export function sidebarOwner(path:string):string|undefined {
 const pathname=path.split(/[?#]/)[0].replace(/\/+$/,'')||'/';
 if(pathWithin(pathname,'/purchases/incoming-shipments'))return '/procurement';
 if(pathWithin(pathname,'/sales/customer-returns')||pathWithin(pathname,'/sales/credit-notes'))return '/sales/credit-returns';
 const owner=[...navigationOwners].sort((a,b)=>b.length-a.length).find(root=>pathWithin(pathname,root));
 return owner==='/contacts/suppliers'?'/contacts/supplier-dashboard':owner;
}
export function longestPageTitle(path:string,titles:Record<string,string>){
 return Object.keys(titles).sort((a,b)=>b.length-a.length).find(root=>pathWithin(path,root));
}

export function accountingSubmenuActive(pathname:string,search:string,target:string){
 const [path,query]=target.split('?');
 if(query){const expected=new URLSearchParams(query),actual=new URLSearchParams(search);return pathname===path&&[...expected].every(([key,value])=>actual.get(key)===value);}
 if(path==='/accounting')return pathname===path&&!new URLSearchParams(search).get('view');
 return pathWithin(pathname,path);
}
