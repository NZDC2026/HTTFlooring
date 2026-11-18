import {requireDateKey} from '../../../lib/businessDate';
export type StaffAvailability={id:string;name:string;start:string;end:string};
/** Public operational projection: never include leave reason, type, hours or employee/payroll details. */
export function dashboardAvailability(employees:{id:string;name:string;status:string}[],leave:{id:string;employeeId:string;status:string;start:string;end:string}[],today:string):StaffAvailability[]{
 requireDateKey(today);const end=new Date(Date.parse(today)+7*86400000).toISOString().slice(0,10);
 return leave.filter(l=>l.status==='Approved'&&l.end>=today&&l.start<=end&&employees.some(e=>e.id===l.employeeId&&e.status==='Active')).sort((a,b)=>a.start.localeCompare(b.start)||a.employeeId.localeCompare(b.employeeId)).map(l=>({id:l.id,name:employees.find(e=>e.id===l.employeeId)!.name,start:l.start,end:l.end}));
}
