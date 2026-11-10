import { beforeEach, expect, it, vi } from "vitest";
const pnl = vi.hoisted(() => vi.fn((_accounts: unknown, _journals: unknown, _from: string, _to: string) => ({ totalRevenue: 125, totalExpenses: 40, netProfit: 85 })));
vi.mock("../../accounting/data/profitAndLossService", () => ({ calculateProfitAndLoss: pnl }));
import { buildLiveDashboard } from "./liveDashboard";
beforeEach(() => pnl.mockClear());
it("compares the current month through the same day last year and crosses year boundaries", () => {
    const result = buildLiveDashboard([], [], "2026-01-12");
    expect(pnl).toHaveBeenCalledWith([], [], "2026-01-01", "2026-01-12");
    expect(pnl).toHaveBeenCalledWith([], [], "2025-01-01", "2025-01-12");
    expect(pnl).toHaveBeenCalledWith([], [], "2024-12-01", "2024-12-31");
    expect(result.chart.at(-1)).toMatchObject({ month: "Jan", revenue: 125, expenses: 40, lastYearRevenue: 125, lastYearExpenses: 40 });
});
it("clamps the prior February comparison to its final valid day", () => {
    buildLiveDashboard([], [], "2024-02-29");
    expect(pnl).toHaveBeenCalledWith([], [], "2023-02-01", "2023-02-28");
});

it('formats every metric in the requested business currency',()=>{
 for(const currency of ['AUD','USD','CNY']) {
  const result=buildLiveDashboard([],[],"2026-11-10",[],currency);
  expect(result.metrics.map(m=>m.value)).toEqual([125,40,85,0].map(value=>new Intl.NumberFormat('en-NZ',{style:'currency',currency}).format(value)));
 }
});
it('rejects impossible calendar dates before calculating reports',()=>{
 expect(()=>buildLiveDashboard([],[],"2026-02-30")).toThrow(/valid YYYY-MM-DD/);
 expect(pnl).not.toHaveBeenCalled();
});
