import { afterEach, expect, it, vi } from "vitest";
import { currencyLabel, referenceRate, validateFx, fxAmount } from "./currency";

afterEach(()=>vi.unstubAllGlobals());
it("uses CNY for RMB and validates a stored conversion",()=>{
    const fx=validateFx({currency:"CNY",baseCurrency:"AUD",rate:0.2,rateDate:"2026-11-05",source:"Manual"},"AUD");
    expect(currencyLabel(fx.currency)).toBe("RMB");
    expect(fxAmount(1400,fx)).toBe(7000);
    expect(()=>validateFx({...fx,rate:0},"AUD")).toThrow();
    expect(()=>validateFx({...fx,baseCurrency:"USD"},"AUD")).toThrow();
});
it("retrieves a dated reference quote and maps RMB to CNY",async()=>{
    const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({date:"2026-11-05",base:"CNY",quote:"AUD",rate:0.2})});
    vi.stubGlobal("fetch",fetcher);
    expect(await referenceRate("RMB","AUD")).toEqual({rate:0.2,rateDate:"2026-11-05"});
    expect(fetcher.mock.calls[0][0]).toBe("https://api.frankfurter.dev/v2/rate/cny/aud");
});
it("rejects unavailable or mismatched reference quotes",async()=>{
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:false}));
    await expect(referenceRate("USD","AUD")).rejects.toThrow(/manually/);
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:true,json:async()=>({base:"AUD",quote:"USD",rate:0.7,date:"2026-11-05"})}));
    await expect(referenceRate("USD","AUD")).rejects.toThrow(/invalid/);
});

it("clears the last original-currency cent exactly after a partial payment",async()=>{
    const {foreignAllocationAmount}=await import("./settlement");
    const bill={id:"b",fx:{currency:"USD",baseCurrency:"AUD",rate:1.4,rateDate:"2026-11-05",source:"Manual",originalAmount:0.03,baseAmount:0.04},totals:{total:0.04,amountPaid:0.02,amountCredited:0,amountDue:0.02}} as import("../purchases/types/supplierBill").SupplierBill;
    const payments=[{status:"POSTED",allocations:[{supplierBillId:"b",amount:0.02,originalAmount:0.02}]}] as import("../purchases/types/supplierPayment").SupplierPayment[];
    expect(foreignAllocationAmount(bill,0.02,payments)).toBe(0.01);
});
