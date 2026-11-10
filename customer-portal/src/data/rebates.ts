export type RebateHistory = {
 id: string;
 productId: string;
 minimumQuantity: number;
 settledQuantity: number;
 rate: number;
 cycle: "Monthly" | "Quarterly";
 startDate: string;
 endDate: string;
 settledDate: string;
};
// Local historical rebate examples, independent of invoice credits and balances.
export const rebateHistory: RebateHistory[] = [
 {id:"REB-2026-1038",productId:"bonita-natural-oak",minimumQuantity:350,settledQuantity:486.72,rate:1,cycle:"Monthly",startDate:"2026-10-01",endDate:"2026-10-31",settledDate:"2026-11-05"},
 {id:"REB-2026-0931",productId:"heritage-rustic-oak",minimumQuantity:500,settledQuantity:782.46,rate:1.2,cycle:"Quarterly",startDate:"2026-07-01",endDate:"2026-09-30",settledDate:"2026-10-12"},
 {id:"REB-2026-0924",productId:"bonita-natural-oak",minimumQuantity:350,settledQuantity:394.21,rate:1,cycle:"Monthly",startDate:"2026-09-01",endDate:"2026-09-30",settledDate:"2026-10-06"},
 {id:"REB-2026-0817",productId:"bonita-natural-oak",minimumQuantity:350,settledQuantity:562.08,rate:0.9,cycle:"Monthly",startDate:"2026-08-01",endDate:"2026-08-31",settledDate:"2026-09-07"},
 {id:"REB-2026-0612",productId:"heritage-rustic-oak",minimumQuantity:500,settledQuantity:648.35,rate:1.2,cycle:"Quarterly",startDate:"2026-04-01",endDate:"2026-06-30",settledDate:"2026-07-10"},
 {id:"REB-2026-0609",productId:"bonita-natural-oak",minimumQuantity:300,settledQuantity:428.87,rate:0.9,cycle:"Monthly",startDate:"2026-06-01",endDate:"2026-06-30",settledDate:"2026-07-06"},
];
export const rebateAmount=(record:RebateHistory)=>Math.round(record.settledQuantity*record.rate*100)/100;
