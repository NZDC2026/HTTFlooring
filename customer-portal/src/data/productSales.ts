import { invoices } from "./invoices";
import type { ReturnNote } from "./returnNotes";
import { products } from "./products";

export type SalesInvoice = {
  id?: string;
  customerId: string;
  status: "invoice" | "order" | "quotation";
  date: Date;
  items: { productId: string; name: string; sku: string; sqm: number; boxes: number }[];
};
export type ProductSalesTrend = {
  productId: string; name: string; sku: string;
  currentSqm: number; previousSqm: number; currentBoxes: number; previousBoxes: number;
};
const shift = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export function productSalesReport(invoices: SalesInvoice[], customerId: string, now: Date, days: number) {
  if (!Number.isInteger(days) || days <= 0) throw new Error("Invalid sales period");
  const end = shift(now, 1);
  const start = shift(end, -days);
  const previousStart = shift(start, -days);
  const grouped = new Map<string, ProductSalesTrend>();
  for (const invoice of [...invoices].sort((a, b) => b.date.getTime() - a.date.getTime())) {
    if (invoice.customerId !== customerId || invoice.status !== "invoice" || invoice.date < previousStart || invoice.date >= end || invoice.date > now) continue;
    for (const item of invoice.items) {
      const row = grouped.get(item.productId) ?? { productId: item.productId, name: item.name, sku: item.sku, currentSqm: 0, previousSqm: 0, currentBoxes: 0, previousBoxes: 0 };
      if (invoice.date >= start) { row.currentSqm += item.sqm; row.currentBoxes += item.boxes; }
      else { row.previousSqm += item.sqm; row.previousBoxes += item.boxes; }
      grouped.set(item.productId, row);
    }
  }
  return { start, end, previousStart, products: [...grouped.values()].sort((a, b) => b.currentSqm - a.currentSqm || b.previousSqm - a.previousSqm || a.name.localeCompare(b.name)) };
}

// Preview fixtures only; never added to the invoice list or stored as real sales.
export function demoProductSales(customerId: string, now: Date): SalesInvoice[] {
  const quantities = [[30, 20, 20, 10, 10, 10], [12, 24, 24, 30, 30, 30], [16, 16, 16, 16, 16, 16], [8, 0, 0, 0, 0, 0]];
  return products.flatMap((product, index) => quantities[index % quantities.length].flatMap((boxes, period) => {
    if (!boxes) return [];
    return [{ customerId, status: "invoice" as const, date: shift(now, -7 - period * 30), items: [{ productId: product.id, name: product.name, sku: product.sku, sqm: boxes * (Number.parseFloat(product.packSize??"") || 0), boxes }] }];
  }));
}

export const salesInvoices: SalesInvoice[] = invoices.map(invoice => ({
 id: invoice.id, customerId: "abc-flooring", status: "invoice", date: new Date(invoice.issueDate),
 items: invoice.items.map(item => ({productId:item.productId,name:item.description,sku:products.find(product=>product.id===item.productId)?.sku??item.productId,sqm:item.totalSize??0,boxes:item.quantity})),
}));

// Restate the original sale period as net volume; applying financial credit is independent.
export function netSalesInvoices(notes: ReturnNote[]): SalesInvoice[] {
 return salesInvoices.map(invoice=>{
  const returnedItems=notes.filter(note=>note.status==="Confirmed"&&note.invoiceId===invoice.id).flatMap(note=>note.creditNote?.items??[]);
  return {...invoice,items:invoice.items.map(item=>{
   const returned=returnedItems.filter(returned=>returned.productId===item.productId);
   const boxes=returned.reduce((sum,line)=>sum+line.quantity,0);
   const sqm=returned.reduce((sum,line)=>sum+(line.totalSize??0),0);
   return {...item,boxes:Math.max(0,item.boxes-boxes),sqm:Math.max(0,Number((item.sqm-sqm).toFixed(6)))};
  })};
 });
}
