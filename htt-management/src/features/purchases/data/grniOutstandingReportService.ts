import type { GoodsReceipt } from "../types/goodsReceipt";
import type { SupplierBillReceiptMatch } from "../types/supplierBillReceiptMatch";
import type { JournalEntry } from "../../accounting/types/journalEntry";
import type { GrniAgingBucket, GrniOutstandingFilters, GrniOutstandingReport, GrniOutstandingRow } from "../types/grniOutstandingReport";
import { calculateBaseUnitCost, calculateIncomingInventoryValue, roundInventoryQuantity, roundInventoryValue } from "../../inventory/data/inventoryCostCalculations";
import { goodsReceiptRepository } from "./goodsReceiptRepository";
import { supplierBillReceiptMatchRepository } from "./supplierBillReceiptMatchRepository";
import { journalEntryRepository } from "../../accounting/data/journalEntryRepository";
import { accountRepository } from "../../accounting/data/accountRepository";

const money = roundInventoryValue;
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
const dateMs = (value: string) => Date.parse(`${value}T00:00:00Z`);
const bucket = (days: number): GrniAgingBucket => days <= 30 ? "CURRENT" : days <= 60 ? "31_60" : days <= 90 ? "61_90" : "OVER_90";

export interface GrniReportInput {
  filters: GrniOutstandingFilters;
  receipts: GoodsReceipt[];
  matches: SupplierBillReceiptMatch[];
  journals: JournalEntry[];
  grniAccountId: string;
}

export function calculateGrniOutstandingReport(input: GrniReportInput): GrniOutstandingReport {
  const { filters, receipts, matches, journals, grniAccountId } = input;
  if (!validDate(filters.asOfDate)) throw new Error("Invalid GRNI as-of date.");
  if (filters.receiptDateFrom && !validDate(filters.receiptDateFrom)) throw new Error("Invalid receipt start date.");
  if (filters.receiptDateTo && !validDate(filters.receiptDateTo)) throw new Error("Invalid receipt end date.");
  const rows: GrniOutstandingRow[] = [];
  for (const receipt of receipts) {
    if (receipt.status !== "POSTED" || receipt.receiptDate > filters.asOfDate) continue;
    if (filters.supplierId && receipt.supplierId !== filters.supplierId) continue;
    if (filters.purchaseOrderId && receipt.purchaseOrderId !== filters.purchaseOrderId) continue;
    if (filters.goodsReceiptId && receipt.id !== filters.goodsReceiptId) continue;
    if (filters.siteId && receipt.siteId !== filters.siteId) continue;
    if (filters.receiptDateFrom && receipt.receiptDate < filters.receiptDateFrom) continue;
    if (filters.receiptDateTo && receipt.receiptDate > filters.receiptDateTo) continue;
    for (const line of receipt.lines) {
      const active = matches.filter(m => m.goodsReceiptId === receipt.id && m.goodsReceiptLineId === line.id && m.createdAt.slice(0, 10) <= filters.asOfDate && (!m.reversedAt || m.reversedAt.slice(0, 10) > filters.asOfDate) && (m.status === "ACTIVE" || Boolean(m.reversedAt)));
      const matchedQuantity = roundInventoryQuantity(active.reduce((sum, m) => sum + m.matchedQuantity, 0));
      const matchedValue = money(active.reduce((sum, m) => sum + m.matchedReceiptValue, 0));
      const receivedValue = calculateIncomingInventoryValue({ quantityBase: line.receivedBaseQuantity, unitCostBase: calculateBaseUnitCost({ transactionUnitCost: line.unitCost, conversionToBase: line.conversionToBase }) });
      const outstandingQuantity = roundInventoryQuantity(line.receivedQuantity - matchedQuantity);
      const outstandingValue = money(receivedValue - matchedValue);
      if (outstandingQuantity < -0.0001 || outstandingValue < -0.01) throw new Error(`Overmatched receipt line: ${receipt.receiptNumber}/${line.id}`);
      if (filters.outstandingOnly && outstandingQuantity <= 0 && Math.abs(outstandingValue) < 0.005) continue;
      const agingDays = Math.max(0, Math.floor((dateMs(filters.asOfDate) - dateMs(receipt.receiptDate)) / 86400000));
      rows.push({ goodsReceiptId: receipt.id, goodsReceiptLineId: line.id, receiptNumber: receipt.receiptNumber, receiptDate: receipt.receiptDate, supplierId: receipt.supplierId, supplierName: receipt.supplierName, purchaseOrderId: receipt.purchaseOrderId, purchaseOrderNumber: receipt.purchaseOrderNumber, siteId: receipt.siteId, siteName: receipt.siteName, productId: line.productId, sku: line.sku, description: line.description, unitSymbol: line.unitSymbol, receivedQuantity: line.receivedQuantity, matchedQuantity, outstandingQuantity, receivedValue, matchedValue, outstandingValue, agingDays, agingBucket: bucket(agingDays) });
    }
  }
  const totals = { receivedValue: money(rows.reduce((s,r) => s+r.receivedValue,0)), matchedValue: money(rows.reduce((s,r) => s+r.matchedValue,0)), outstandingValue: money(rows.reduce((s,r) => s+r.outstandingValue,0)) };
  const aging: Record<GrniAgingBucket,number> = { CURRENT:0, "31_60":0, "61_90":0, OVER_90:0 };
  for (const row of rows) aging[row.agingBucket] = money(aging[row.agingBucket] + row.outstandingValue);
  // GL comparison is meaningful only for an unfiltered, full-scope report.
  const isFiltered = Boolean(filters.supplierId || filters.purchaseOrderId || filters.goodsReceiptId || filters.siteId || filters.receiptDateFrom || filters.receiptDateTo);
  let glCreditBalance = 0;
  for (const journal of journals) {
    if (journal.journalDate > filters.asOfDate) continue;
    // Original reversed journals must remain included for periods preceding their reversal.
    for (const line of journal.lines) if (line.accountId === grniAccountId) glCreditBalance += line.credit - line.debit;
  }
  glCreditBalance = money(glCreditBalance);
  return { asOfDate: filters.asOfDate, rows, totals, aging, glCreditBalance, difference: isFiltered ? Number.NaN : money(totals.outstandingValue - glCreditBalance) };
}

export const grniOutstandingReportService = {
  generate(filters: GrniOutstandingFilters): GrniOutstandingReport {
    return calculateGrniOutstandingReport({ filters, receipts: goodsReceiptRepository.getAll(), matches: supplierBillReceiptMatchRepository.getAll(), journals: journalEntryRepository.getAll(), grniAccountId: accountRepository.requireBySystemRole("GRNI").id });
  },
};
