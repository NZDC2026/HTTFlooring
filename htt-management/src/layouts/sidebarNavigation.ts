import {BarChart3, CalendarDays, Home, Landmark, Layers, ListTodo, Megaphone, ReceiptText, ShoppingCart, Trophy, Truck, UserRound, UsersRound} from 'lucide-react';
import {hasPermission, type Permission, type VerifiedPrincipal} from '../features/security/rbac';
import {presentationPathEnabled} from '../features/security/optionalWorkflows';
import type {WorkspacePreviewRole} from './workspacePreview';

// Preview visibility follows the reference workspaces; live links also require verified authority.
export const sidebarGroups = [
  {label:'',items:[{label:'Dashboard',path:'/dashboard',icon:Home,permission:'inventory.read'}]},
  {label:'Sell',items:[
    {label:'Sales',path:'/sales',icon:ShoppingCart,permission:'sales.read'},
    {label:'Customers',path:'/contacts',icon:UserRound,permission:'sales.read'},
    {label:'Marketing',path:'/promotions',icon:Megaphone,permission:'sales.read'},
  ]},
  {label:'Buy',items:[
    {label:'Purchases',path:'/purchases',icon:ReceiptText,permission:'purchases.read'},
    {label:'Suppliers',path:'/contacts/supplier-dashboard',icon:Truck,permission:'purchases.read'},
  ]},
  {label:'Warehouse',items:[
    {label:'Inventory',path:'/inventory',icon:Layers,permission:'inventory.read'},
    {label:'Dispatch',path:'/inventory/sales-dispatch',icon:Truck,permission:'inventory.read'},
  ]},
  {label:'Team',items:[
    {label:'Work',path:'/payroll/timesheets',icon:CalendarDays,permission:'payroll.read'},
    {label:'Sales performance',path:'/reports/sales-analysis',icon:Trophy,permission:'sales.read'},
    {label:'Tasks',path:'/tasks',icon:ListTodo,permission:'inventory.read'},
    {label:'Employees',path:'/payroll/employees',icon:UsersRound,permission:'payroll.read'},
  ]},
  {label:'Money',items:[
    {label:'Finance',path:'/accounting',icon:Landmark,permission:'accounting.read'},
    {label:'Reports',path:'/reports',icon:BarChart3,permission:'sales.read'},
  ]},
] satisfies {label:string;items:{label:string;path:string;icon:typeof Home;permission:Permission}[]}[];
const hidden: Record<WorkspacePreviewRole, readonly string[]> = {
  Admin: [], Account: [],
  'Front desk': ['Employees'],
  Sales: ['Marketing','Dispatch','Employees','Finance'],
  Warehouse: ['Customers','Marketing','Employees','Finance'],
};
export function sidebarWorkspaceRole(roles: readonly string[]): WorkspacePreviewRole {
  return roles.includes('ADMIN') ? 'Admin' : roles.some(r=>r==='ACCOUNTANT'||r==='FINANCE_ADMIN') ? 'Account' : roles.includes('WAREHOUSE') ? 'Warehouse' : roles.includes('SALES') ? 'Sales' : 'Front desk';
}
export function sidebarNavigation(role: WorkspacePreviewRole, sample: boolean, principal: VerifiedPrincipal|null) {
  return sidebarGroups.map(group=>({...group,items:group.items.filter(item=>
    !hidden[role].includes(item.label) && presentationPathEnabled(item.path) && (sample || hasPermission(principal,item.permission)),
  )})).filter(group=>group.items.length);
}
export function sidebarActivePath(pathname: string): string|undefined {
  const paths = sidebarGroups.flatMap(group=>group.items.map(item=>item.path));
  if (pathname.startsWith('/contacts/suppliers')) return '/contacts/supplier-dashboard';
  if (pathname.startsWith('/procurement')) return '/purchases';
  return paths.sort((a,b)=>b.length-a.length).find(path=>pathname===path||pathname.startsWith(path+'/'));
}
