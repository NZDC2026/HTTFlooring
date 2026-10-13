export type GrniAgingBucket = "CURRENT" | "31_60" | "61_90" | "OVER_90";
export interface GrniOutstandingRow {
  goodsReceiptId: string; goodsReceiptLineId: string; receiptNumber: string; receiptDate: string;
  supplierId: string; supplierName: string; purchaseOrderId: string; purchaseOrderNumber: string;
  siteId: string; siteName: string; productId: string; sku: string; description: string; unitSymbol: string;
  receivedQuantity: number; matchedQuantity: number; outstandingQuantity: number;
  receivedValue: number; matchedValue: number; outstandingValue: number;
  agingDays: number; agingBucket: GrniAgingBucket;
}
export interface GrniOutstandingFilters {
  asOfDate: string; supplierId?: string; purchaseOrderId?: string; goodsReceiptId?: string;
  siteId?: string; receiptDateFrom?: string; receiptDateTo?: string; outstandingOnly?: boolean;
}
export interface GrniOutstandingReport {
  asOfDate: string; rows: GrniOutstandingRow[];
  totals: { receivedValue: number; matchedValue: number; outstandingValue: number };
  aging: Record<GrniAgingBucket, number>;
  glCreditBalance: number; difference: number;
}
