export function dashboardLink(path:string,from:string,to:string,sample:boolean,site:string,filters:Record<string,string>={}){
 const [base,query]=path.split('?');const params=new URLSearchParams(query);
 Object.entries({dashboard:'1',from,to,sample:sample?'1':'0',...filters}).forEach(([key,value])=>params.set(key,value));
 if(site!=='ALL')params.set('site',site);
 return base+'?'+params;
}
