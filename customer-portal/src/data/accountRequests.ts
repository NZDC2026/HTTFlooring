export type AccountRequest={id:string;kind:string;values:Record<string,string>;createdAt:string;status:'Pending review'};
const key='htt.portal.account-requests.v1';
export function getAccountRequests():AccountRequest[]{try{const rows=JSON.parse(localStorage.getItem(key)??'[]');return Array.isArray(rows)?rows.filter(row=>row&&row.status==='Pending review'&&row.values):[];}catch{return [];}}
export function submitAccountRequest(kind:string,values:Record<string,string>):AccountRequest {
 if(!values.name?.trim())throw new Error('Enter a name.');
 if(values.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))throw new Error('Enter a valid email address.');
 if(values.mobile&&!/^[+\d ()-]{8,20}$/.test(values.mobile))throw new Error('Enter a valid phone number.');
 if(kind==='Invite a staff member'&&!values.email)throw new Error('Enter an email address.');
 const request:AccountRequest={id:crypto.randomUUID(),kind,values:Object.fromEntries(Object.entries(values).map(([key,value])=>[key,value.trim()])),createdAt:new Date().toISOString(),status:'Pending review'};
 localStorage.setItem(key,JSON.stringify([...getAccountRequests(),request]));return request;
}
