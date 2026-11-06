import { expect, it, vi } from "vitest";
import type { SupplierBill } from "../../purchases/types/supplierBill";
import type { SupplierPayment } from "../../purchases/types/supplierPayment";
vi.mock("../../business-workspace/configurationState",()=>({businessSettings:()=>({yearEnd:"06-30"})}));
import { supplierYearToDate } from "./supplierYearToDate";

const bill = (patch: Partial<SupplierBill> = {}) => ({
    id:"b1",supplierId:"s1",billDate:"2026-07-01",status:"OPEN",totals:{total:100},...patch,
}) as SupplierBill;
const payment = (patch: Partial<SupplierPayment> = {}) => ({
    id:"p1",supplierId:"s1",paymentDate:"2026-07-01",status:"POSTED",amount:98,
    allocations:[{supplierBillId:"b1",amount:100}],...patch,
}) as SupplierPayment;

it("uses the configured financial year and excludes void, opening, future and other-supplier bills",()=>{
    const result = supplierYearToDate("s1",[
        bill(),bill({id:"b2",status:"PAID"}),bill({billDate:"2026-06-30"}),
        bill({status:"VOID"}),bill({openingBalanceImportId:"opening"}),
        bill({billDate:"2026-11-07"}),bill({supplierId:"s2"}),
    ],[],"2026-11-06");
    expect(result).toMatchObject({from:"2026-07-01",to:"2026-11-06",purchaseAmount:200,purchaseCount:2,paidAmount:0,paidBillCount:0});
});
it("totals actual cash with FX differences and deduplicates bills across partial payments",()=>{
    const result = supplierYearToDate("s1",[],[
        payment(),
        payment({id:"p2",amount:25}),
        payment({id:"p3",amount:50,allocations:[{id:"a",supplierBillId:"b2",billNumber:"B2",supplierInvoiceNumber:"I2",amount:50}]}),
        payment({status:"REVERSED"}),payment({paymentDate:"2026-06-30"}),
        payment({paymentDate:"2026-11-07"}),payment({supplierId:"s2"}),
        payment({prepaymentApplicationId:"noncash"}),
    ],"2026-11-06");
    expect(result).toMatchObject({paidAmount:173,paidBillCount:2});
});
