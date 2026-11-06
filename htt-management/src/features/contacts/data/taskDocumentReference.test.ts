import { it, expect } from "vitest";
import { validateTaskDocument } from "./taskDocumentReference";
it("accepts own order and invoice; permits an unlinked task",()=>{
 const orders=[{id:"so1",customerId:"c1"}],invoices=[{id:"inv1",customerId:"c1"}];
 expect(()=>validateTaskDocument("Order","so1","c1",orders,invoices,"customerId")).not.toThrow();
 expect(()=>validateTaskDocument("Invoice","inv1","c1",orders,invoices,"customerId")).not.toThrow();
 expect(()=>validateTaskDocument("","","c1",orders,invoices,"customerId")).not.toThrow();
});
it("rejects mismatched party, document type, missing number and unknown references",()=>{
 const orders=[{id:"po1",supplierId:"s1"}],invoices=[{id:"bill1",supplierId:"s1"}];
 expect(()=>validateTaskDocument("Order","po1","s2",orders,invoices,"supplierId")).toThrow(/belong/);
 expect(()=>validateTaskDocument("Invoice","po1","s1",orders,invoices,"supplierId")).toThrow(/belong/);
 expect(()=>validateTaskDocument("Order","","s1",orders,invoices,"supplierId")).toThrow(/number/);
 expect(()=>validateTaskDocument(undefined,"bill1","s1",orders,invoices,"supplierId")).toThrow();
 expect(()=>validateTaskDocument("Invoice","bill1","s1",orders,invoices,"supplierId")).not.toThrow();
});
