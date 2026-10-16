import { Badge } from "./Badge";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<string, StatusTone> = {
  PAID: "success", FULFILLED: "success", ACCEPTED: "success", APPROVED: "success",
  PUBLISHED: "success", READY: "success", POSTED: "success", COMPLETED: "success",
  RECEIVED: "success", CLOSED: "success", ACTIVE: "success",
  PARTIALLY_PAID: "warning", PARTIALLY_FULFILLED: "warning", INVOICED: "success", CONVERTED: "success",
  PENDING: "warning", REVIEW: "warning", DRAFT: "warning", PARTIAL: "warning",
  PARTIALLY_RECEIVED: "warning", PARTIALLY_BILLED: "warning", OPEN: "info",
  SENT: "info", ISSUED: "info", POSTING: "info",
  VOID: "danger", VOIDED: "danger", CANCELLED: "danger", DECLINED: "danger",
  OVERDUE: "danger", FAILED: "danger", RECOVERY_REQUIRED: "danger",
};

export function getStatusTone(status: string): StatusTone {
  return tones[status.trim().toUpperCase().replace(/[\s-]+/g, "_")] ?? "neutral";
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={getStatusTone(status)}>{status.replaceAll("_", " ")}</Badge>;
}
