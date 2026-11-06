import { afterEach, beforeEach, expect, it } from "vitest";
import { mkdtempSync,rmSync,readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LocalSecurity } from "../../../electron/security/localSecurity";
import type { Role } from "./rbac";
let root:string,security:LocalSecurity;
const admin={username:"staff.admin",displayName:"Staff Administrator",password:"Staff-test-password-4821"};
const profile={employeeCode:"EMP-0001",department:"Warehouse" as const,position:"Warehouse Supervisor",phone:"0400 000 123",email:"warehouse@example.invalid",startDate:"2026-08-01"};
beforeEach(()=>{root=mkdtempSync(join(tmpdir(),"htt-staff-"));security=new LocalSecurity(join(root,"security.json"));security.setup(admin);});
afterEach(()=>rmSync(root,{recursive:true,force:true}));
it("persists work profile and roles across restart without exposing credential material",()=>{
 const u=security.createUser({username:"warehouse.staff",displayName:"Jamie Lee",password:admin.password,roles:["WAREHOUSE"],staffProfile:profile});
 expect(u.staffProfile).toEqual(profile);expect(JSON.stringify(u)).not.toMatch(/passwordHash|salt|Staff-test-password/);
 security=new LocalSecurity(join(root,"security.json"));security.login(admin);const saved=security.listUsers().find(r=>r.id===u.id)!;
 expect(saved.staffProfile).toEqual(profile);security.updateUser({id:u.id,displayName:"Jamie Taylor",roles:["WAREHOUSE","PURCHASING"],active:true,staffProfile:{...profile,position:"Operations Supervisor"}});
 const updated=security.listUsers().find(r=>r.id===u.id)!;expect(updated.displayName).toBe("Jamie Taylor");expect(updated.roles).toEqual(["WAREHOUSE","PURCHASING"]);
 // Older users & roles screen omits profile; it must preserve the employee data.
 security.updateUser({id:u.id,roles:updated.roles,active:true});expect(security.listUsers().find(r=>r.id===u.id)?.staffProfile?.position).toBe("Operations Supervisor");
});
it("rejects duplicate employee codes and malformed profiles without adding accounts",()=>{
 security.createUser({username:"employee.one",displayName:"Employee One",password:admin.password,roles:["SALES"],staffProfile:profile});
 expect(()=>security.createUser({username:"employee.two",displayName:"Employee Two",password:admin.password,roles:["SALES"],staffProfile:{...profile,employeeCode:"emp-0001"}})).toThrow(/code already exists/);
 expect(()=>security.createUser({username:"employee.bad",displayName:"Bad",password:admin.password,roles:["SALES"],staffProfile:{...profile,employeeCode:"EMP-0002",email:"not-an-email"}})).toThrow();
 expect(security.listUsers()).toHaveLength(2);
});
it.each(["SALES","WAREHOUSE","ACCOUNTANT","FINANCE_ADMIN"] as Role[])("denies %s employee administration",role=>{
 const u=security.createUser({username:"employee."+role.toLowerCase(),displayName:role,password:admin.password,roles:[role]});security.login({username:u.username,password:admin.password});
 expect(()=>security.listUsers()).toThrow(/Permission denied/);expect(()=>security.updateUser({id:u.id,roles:["ADMIN"],active:true,staffProfile:profile})).toThrow(/Permission denied/);
 expect(()=>security.createUser({username:"forbidden.user",displayName:"Forbidden",password:admin.password,roles:["ADMIN"]})).toThrow(/Permission denied/);
});
it("disabled staff cannot log in and the last active administrator remains protected",()=>{
 const u=security.createUser({username:"sales.staff",displayName:"Alex",password:admin.password,roles:["SALES"],staffProfile:{...profile,department:"Sales"}});
 security.updateUser({id:u.id,roles:u.roles,active:false});expect(()=>security.login({username:u.username,password:admin.password})).toThrow();
 security.login(admin);const a=security.listUsers().find(r=>r.username===admin.username)!;expect(()=>security.updateUser({id:a.id,roles:a.roles,active:false})).toThrow(/last active/);
 expect(readFileSync(join(root,"security.json"),"utf8")).toContain("user.updated");
});
