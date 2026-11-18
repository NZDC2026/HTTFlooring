export type Tier={minimum:number;rate:number};
export function tierRebate(quantity:number,tiers:Tier[]){return Math.round(tiers.reduce((sum,tier,index)=>sum+Math.max(0,Math.min(quantity,tiers[index+1]?.minimum??Infinity)-tier.minimum)*tier.rate,0)*100)/100;}
export const rebatePrograms=[{name:'Bonita',count:9,cycle:'Monthly',start:'2026-11-01',end:'2026-11-30',invoiced:225.48,returned:15,paid:'05 Dec 2026',tiers:[{minimum:350,rate:1.1},{minimum:500,rate:1.32},{minimum:800,rate:1.65}]},{name:'Heritage',count:1,cycle:'Quarterly',start:'2026-10-01',end:'2026-12-31',invoiced:382.6,returned:0,paid:'12 Jan 2027',tiers:[{minimum:500,rate:1.32},{minimum:800,rate:1.54}]}];
export const rebateSettlements=[
{id:'REB-2026-1038',series:'Bonita',cycle:'Monthly',start:'2026-10-01',end:'2026-10-31',quantity:486.72,minimum:350,rate:1.1,method:'Bank transfer',paid:'07 Nov 2026',calculated:'05 Nov 2026',credit:'',invoice:''},
{id:'REB-2026-0931',series:'Heritage',cycle:'Quarterly',start:'2026-07-01',end:'2026-09-30',quantity:782.46,minimum:500,rate:1.32,method:'Credit note',paid:'',calculated:'12 Oct 2026',credit:'CN-R0931',invoice:'INV-10355'},
{id:'REB-2026-0924',series:'Bonita',cycle:'Monthly',start:'2026-09-01',end:'2026-09-30',quantity:394.21,minimum:350,rate:1.1,method:'Credit note',paid:'',calculated:'06 Oct 2026',credit:'CN-R0924',invoice:'INV-10340'},
{id:'REB-2026-0817',series:'Bonita',cycle:'Monthly',start:'2026-08-01',end:'2026-08-31',quantity:562.08,minimum:350,rate:.99,method:'Bank transfer',paid:'09 Sep 2026',calculated:'07 Sep 2026',credit:'',invoice:''},
{id:'',series:'Bonita',cycle:'Monthly',start:'2026-07-01',end:'2026-07-31',quantity:287.4,minimum:350,rate:1.1,method:'Not reached',paid:'',calculated:'',credit:'',invoice:''}
].map(row=>({...row,amount:Math.round(Math.max(0,row.quantity-row.minimum)*row.rate*100)/100}));
