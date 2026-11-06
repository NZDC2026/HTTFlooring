import { it, expect } from "vitest";
import { filterSupplierRows, parseSupplierListFilter } from "./supplierListFilter";
const rows=[
 {id:"a",status:"ACTIVE",currentBalance:100,overdueBalance:0},
 {id:"b",status:"INACTIVE",currentBalance:50,overdueBalance:50},
 {id:"c",status:"ACTIVE",currentBalance:0,overdueBalance:0},
 {id:"d",status:"ACTIVE",currentBalance:-20,overdueBalance:0},
];
it("keeps active status independent from payable balances",()=>{
 expect(filterSupplierRows(rows,"active").map(r=>r.id)).toEqual(["a","c","d"]);
 expect(filterSupplierRows(rows,"outstanding").map(r=>r.id)).toEqual(["a","b"]);
 expect(filterSupplierRows(rows,"overdue").map(r=>r.id)).toEqual(["b"]);
 expect(filterSupplierRows(rows,"all")).toHaveLength(4);
});
it("treats unknown URL filters as all and handles empty results",()=>{
 expect(parseSupplierListFilter("bogus")).toBe("all");
 expect(parseSupplierListFilter(null)).toBe("all");
 expect(parseSupplierListFilter("overdue")).toBe("overdue");
 expect(filterSupplierRows([],"outstanding")).toEqual([]);
});
