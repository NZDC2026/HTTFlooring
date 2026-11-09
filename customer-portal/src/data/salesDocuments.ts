import { calculateItems, calculateTotals, type InvoiceItem } from "./invoices";

export type DocumentKind = "quotes" | "orders";
const records: {kind: DocumentKind; id: string; number: string; issued: string; date: string; status: string; reference: string; freight: number; items: InvoiceItem[]}[] = [
 {kind:"quotes",id:"quo-10601",number:"QUO-10601",issued:"09 Nov 2026",date:"30 Nov 2026",status:"Open",reference:"Living room flooring",freight:50,items:[{productId:"bonita-natural-oak",quantity:40,unitPrice:69}]},
 {kind:"quotes",id:"quo-10588",number:"QUO-10588",issued:"01 Oct 2026",date:"31 Oct 2026",status:"Accepted",reference:"ORD-10540",freight:50,items:[{productId:"bonita-natural-oak",quantity:40,unitPrice:69},{productId:"guardian-d3016",quantity:20,unitPrice:47.5}]},
 {kind:"quotes",id:"quo-10570",number:"QUO-10570",issued:"01 Sep 2026",date:"30 Sep 2026",status:"Expired",reference:"Bedroom flooring",freight:0,items:[{productId:"guardian-d3016",quantity:10,unitPrice:47.5}]},
 {kind:"orders",id:"ord-10560",number:"ORD-10560",issued:"09 Nov 2026",date:"16 Nov 2026",status:"Processing",reference:"Living room flooring",freight:50,items:[{productId:"bonita-natural-oak",quantity:20,unitPrice:69}]},
 {kind:"orders",id:"ord-10551",number:"ORD-10551",issued:"05 Nov 2026",date:"12 Nov 2026",status:"Ready for Collection",reference:"Warehouse collection",freight:0,items:[{productId:"guardian-d3016",quantity:12,unitPrice:47.5}]},
 {kind:"orders",id:"ord-10540",number:"ORD-10540",issued:"02 Oct 2026",date:"06 Oct 2026",status:"Completed",reference:"INV-10521",freight:50,items:[{productId:"bonita-natural-oak",quantity:40,unitPrice:69},{productId:"guardian-d3016",quantity:20,unitPrice:47.5}]},
];
export const salesDocuments = records.map(record=>{
 const items=calculateItems(record.items);
 return {...record,items,...calculateTotals(items,0,record.freight)};
});
