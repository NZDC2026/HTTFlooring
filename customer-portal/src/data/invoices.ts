export type InvoiceStatus = "Outstanding" | "Overdue" | "Paid";
export type Invoice = {
  id: string; invoiceNumber: string; issueDate: string; dueDate: string;
  total: number; balance: number; status: InvoiceStatus; overdueDays: number;
};

export const invoices: Invoice[] = [
  { id: "inv-10521", invoiceNumber: "INV-10521", issueDate: "02 Oct 2026", dueDate: "16 Oct 2026", total: 6512, balance: 6512, status: "Outstanding", overdueDays: 0 },
  { id: "inv-10482", invoiceNumber: "INV-10482", issueDate: "28 Sep 2026", dueDate: "12 Oct 2026", total: 3820, balance: 3820, status: "Outstanding", overdueDays: 0 },
  { id: "inv-10398", invoiceNumber: "INV-10398", issueDate: "01 Sep 2026", dueDate: "15 Sep 2026", total: 4081, balance: 2420, status: "Overdue", overdueDays: 17 },
  { id: "inv-10381", invoiceNumber: "INV-10381", issueDate: "20 Aug 2026", dueDate: "03 Sep 2026", total: 4120, balance: 0, status: "Paid", overdueDays: 0 },
];
