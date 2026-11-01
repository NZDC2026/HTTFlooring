import { products } from "./products";

export type InvoiceItem = {
 productId: string;
 quantity: number;
 unitPrice: number;
};
const demoItems: InvoiceItem[] = [
 { productId: "bonita-natural-oak", quantity: 40, unitPrice: 69 },
 { productId: "guardian-d3016", quantity: 20, unitPrice: 47.5 },
];
export const getSizePerBox = (packSize?: string) => {
 const match = packSize?.match(/^\s*(\d+(?:\.\d+)?)\s*m(?:²|2|\^2)\s*$/i);
 const value = match ? Number(match[1]) : undefined;
 return value != null && Number.isFinite(value) && value > 0 ? value : undefined;
};
export const calculateItems = (items: InvoiceItem[]) => items.map(item => {
 if (!Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0) throw new Error("Invalid invoice quantity or price.");
 const product = products.find(product => product.id === item.productId);
 if (!product) throw new Error(`Unknown invoice product: ${item.productId}`);
 if (product.priceKnown === false) throw new Error(`Price not available for product: ${item.productId}`);
 const sizePerBox = getSizePerBox(product?.packSize);
 const totalSize = sizePerBox == null ? undefined : sizePerBox * item.quantity;
 const amountCents = Math.round(item.unitPrice * (totalSize ?? item.quantity) * 100);
 return { ...item, description: product?.name ?? item.productId, sizePerBox, totalSize, amountCents };
});
export const calculateTotals = (items: { amountCents: number }[], paid: number, freight = 0) => {
 if (!Number.isFinite(paid) || paid < 0 || !Number.isFinite(freight) || freight < 0) throw new Error("Invalid payment or freight.");
 const subtotalCents = items.reduce((sum, item) => sum + item.amountCents, 0);
 const freightCents = Math.round(freight * 100);
 const gstCents = Math.round((subtotalCents + freightCents) * 0.1);
 const totalCents = subtotalCents + freightCents + gstCents;
 const paidCents = Math.round(paid * 100);
 return { subtotal: subtotalCents / 100, freight: freightCents / 100, gst: gstCents / 100, total: totalCents / 100, paid: paidCents / 100, balance: (totalCents - paidCents) / 100 };
};

export type InvoiceStatus = "Outstanding" | "Overdue" | "Paid";
type InvoiceRecord = {
 id: string; invoiceNumber: string; issueDate: string; dueDate: string;
 paid: number; freight?: number; items: InvoiceItem[];
};
export const calculateInvoice = (record: InvoiceRecord, now = new Date()) => {
 const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
 const [day,month,year] = record.dueDate.split(" ");
 const due = Date.UTC(Number(year), months.indexOf(month), Number(day));
 if (!Number.isFinite(due) || months.indexOf(month) < 0) throw new Error("Invalid invoice due date.");
 const today = Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
 const overdueDays = Math.max(0, Math.floor((today-due)/86400000));
 const items = calculateItems(record.items);
 const totals = calculateTotals(items, record.paid, record.freight);
 const status: InvoiceStatus = totals.balance <= 0 ? "Paid" : overdueDays > 0 ? "Overdue" : "Outstanding";
 return { ...record, ...totals, overdueDays: totals.balance > 0 ? overdueDays : 0, items, status };
};
export type Invoice = ReturnType<typeof calculateInvoice>;

// Existing preview invoices share the same sample lines; payments are independent of totals.
const invoiceRecords: InvoiceRecord[] = [
 { id: "inv-10521", invoiceNumber: "INV-10521", issueDate: "02 Oct 2026", dueDate: "16 Oct 2026", paid: 0, freight: 50, items: demoItems },
 { id: "inv-10482", invoiceNumber: "INV-10482", issueDate: "28 Sep 2026", dueDate: "12 Oct 2026", paid: 0, items: demoItems },
 { id: "inv-10398", invoiceNumber: "INV-10398", issueDate: "01 Sep 2026", dueDate: "15 Sep 2026", paid: 1661, items: demoItems },
 { id: "inv-10381", invoiceNumber: "INV-10381", issueDate: "20 Aug 2026", dueDate: "03 Sep 2026", paid: 4120, items: demoItems },
];
export const invoices = invoiceRecords.map(record => calculateInvoice(record));

export const summarizeInvoices = (records: Invoice[]) => {
 const unpaid = records.filter(invoice => invoice.balance > 0);
 const overdue = unpaid.filter(invoice => invoice.status === "Overdue");
 const sumBalance = (items: Invoice[]) => items.reduce((sum, invoice) => sum + Math.round(invoice.balance * 100), 0) / 100;
 const aging = [
  { label: "Current", balance: sumBalance(unpaid.filter(i => i.overdueDays <= 0)) },
  { label: "1–30 days", balance: sumBalance(unpaid.filter(i => i.overdueDays > 0 && i.overdueDays <= 30)) },
  { label: "31–60 days", balance: sumBalance(unpaid.filter(i => i.overdueDays > 30 && i.overdueDays <= 60)) },
  { label: "61–90 days", balance: sumBalance(unpaid.filter(i => i.overdueDays > 60 && i.overdueDays <= 90)) },
  { label: "90+ days", balance: sumBalance(unpaid.filter(i => i.overdueDays > 90)) },
 ];
 return { outstanding: sumBalance(unpaid), outstandingCount: unpaid.length, overdue: sumBalance(overdue), overdueCount: overdue.length, paidCount: records.filter(i => i.status === "Paid").length, attentionInvoice: overdue[0], aging };
};
export const invoiceSummary = summarizeInvoices(invoices);
