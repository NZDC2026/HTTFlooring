import { l as e, n as t, r as n, t as r } from "./repositoryHost-CMrgEnmW.js";
//#region src/lib/businessDate.ts
function i(e) {
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (!Number.isFinite(t.getTime())) throw Error("Invalid accounting timestamp.");
	let n = new Intl.DateTimeFormat("en-NZ", {
		timeZone: "Pacific/Auckland",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(t), r = (e) => n.find((t) => t.type === e)?.value;
	return `${r("year")}-${r("month")}-${r("day")}`;
}
function a(e, t = "Date") {
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e) || !Number.isFinite(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} must be a valid YYYY-MM-DD date.`);
}
//#endregion
//#region src/lib/persistence/mockRepositoryStorage.ts
function o() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function s(e, t) {
	let n = o();
	if (!n) return { status: "unavailable" };
	let r;
	try {
		r = n.getItem(e);
	} catch {
		return { status: "unavailable" };
	}
	if (r === null) return { status: "empty" };
	try {
		let e = JSON.parse(r);
		if (!e || typeof e != "object") return {
			status: "invalid",
			reason: "Invalid envelope"
		};
		let n = e;
		return n.schemaVersion === 1 ? typeof n.savedAt != "string" || !t(n.data) ? {
			status: "invalid",
			reason: "Invalid saved data"
		} : {
			status: "ok",
			data: n.data
		} : {
			status: "invalid",
			reason: "Unsupported schema version"
		};
	} catch {
		return {
			status: "invalid",
			reason: "Malformed JSON"
		};
	}
}
function c(e, t) {
	let n = o();
	if (!n) return !1;
	let r = {
		schemaVersion: 1,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		data: t
	};
	try {
		return n.setItem(e, JSON.stringify(r)), !0;
	} catch {
		return !1;
	}
}
function l(e) {
	let t = o();
	if (!t) return !1;
	try {
		let n = t.getItem(e);
		if (n === null) return !0;
		let r = JSON.parse(n);
		return !!r && typeof r == "object" && r.schemaVersion === 1;
	} catch {
		return !1;
	}
}
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var u = "htt:financial-operations:v1", d = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], f = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], p = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && d.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && f.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function m() {
	let e = s(u, p);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function ee(e) {
	if (!l(u) || !c(u, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var h = {
	list() {
		return m().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !d.includes(t)) throw Error("Invalid operation identity.");
		let r = m(), i = r.find((t) => t.operationId === e);
		if (i) {
			if (i.kind !== t || i.fingerprint !== n) throw Error("Operation ID reused with different business data.");
			return {
				status: i.state === "COMPLETED" ? "already_completed" : "needs_review",
				operation: { ...i }
			};
		}
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			operationId: e,
			kind: t,
			fingerprint: n,
			state: "PENDING",
			createdAt: a,
			updatedAt: a
		};
		return ee([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = m(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ee(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = m(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state === "COMPLETED") {
			if (r.resultId !== t) throw Error("Operation already completed with a different result.");
			return { ...r };
		}
		if (r.state === "MANUAL_REVIEW") throw Error("Manual review is required before completion.");
		let i = {
			...r,
			state: "COMPLETED",
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ee(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = m(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ee(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = m(), a = i.find((t) => t.operationId === e);
		if (!a) throw Error("Operation not found.");
		if (a.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
		if (a.reviewHistory?.some((e) => e.reference === t.trim())) throw Error("Recovery reference already recorded; use a new reference.");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			...a,
			state: "MANUAL_REVIEW",
			updatedAt: o,
			reviewHistory: [...a.reviewHistory ?? [], {
				reference: t.trim(),
				operator: n.trim(),
				recordedAt: o,
				summary: r.trim()
			}]
		};
		return ee(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = m(), a = i.find((t) => t.operationId === e);
		if (!a || a.state !== "MANUAL_REVIEW") throw Error("Only manually reviewed operations can be closed.");
		if (!a.reviewHistory?.length) throw Error("Recorded reconciliation evidence is required.");
		if (a.resultId !== t) throw Error("Verified result differs from the bound operation result.");
		if (a.reviewHistory.some((e) => e.operator.trim().toLowerCase() === r.trim().toLowerCase())) throw Error("Approval must be performed by a different operator.");
		if (a.reviewHistory.some((e) => e.reference === n.trim())) throw Error("Approval reference must differ from review evidence.");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			...a,
			state: "COMPLETED",
			updatedAt: o,
			note: `Verified closure approved by ${r.trim()} (${n.trim()}); no financial write performed.`,
			reviewHistory: [...a.reviewHistory, {
				reference: n.trim(),
				operator: r.trim(),
				recordedAt: o,
				summary: "Independent approval: verified existing business and GL result; no replay or repair."
			}]
		};
		return ee(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return m().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
n("financialOperations", {
	repository: h,
	read: "audit.read",
	commands: {
		begin: null,
		bindResult: null,
		complete: null,
		flagForReview: "accounting.recover",
		recordManualReview: null,
		closeReviewed: null
	},
	snapshot: () => [],
	restore: () => {},
	publish: () => {}
});
//#endregion
//#region src/features/purchases/data/purchasePostingOperationRepository.ts
var g = /* @__PURE__ */ new Map(), te = "htt.purchasePosting.operations.v1";
function ne() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function re() {
	let e = ne();
	if (e) try {
		e.setItem(te, JSON.stringify([...g.values()]));
	} catch {}
}
function ie() {
	let e = ne();
	if (e) try {
		let t = JSON.parse(e.getItem(te) ?? "[]");
		if (!Array.isArray(t)) return;
		for (let e of t) {
			if (!e || typeof e != "object") continue;
			let t = e;
			if (typeof t.key != "string" || typeof t.sourceId != "string" || ![
				"GOODS_RECEIPT",
				"SUPPLIER_BILL",
				"SUPPLIER_BILL_VOID"
			].includes(t.kind ?? "") || ![
				"PENDING",
				"POSTING",
				"POSTED",
				"FAILED",
				"RECOVERY_REQUIRED"
			].includes(t.status ?? "") || !Array.isArray(t.completedSteps) || !t.completedSteps.every((e) => typeof e == "string")) continue;
			let n = t.status === "POSTING" || t.status === "PENDING" || t.status === "RECOVERY_REQUIRED";
			g.set(t.key, {
				key: t.key,
				kind: t.kind,
				sourceId: t.sourceId,
				status: n ? "FAILED" : t.status,
				completedSteps: [...t.completedSteps],
				error: n ? "Restored after restart: business repositories and recovery handler must be reconciled before retry." : t.error,
				updatedAt: typeof t.updatedAt == "string" ? t.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
			});
		}
	} catch {}
}
ie();
var ae = /* @__PURE__ */ new Set(), oe = /* @__PURE__ */ new Map(), se = /* @__PURE__ */ new Map(), ce;
function le() {
	re(), ae.forEach((e) => e());
}
var _ = {
	injectFailureBeforeStep(e, t, n = 1) {
		se.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		se.clear();
	},
	registerRecovery(e, t) {
		if (!g.has(e)) throw Error(`Unknown posting operation: ${e}`);
		oe.set(e, t);
	},
	runStep(e, t, n) {
		let r = g.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = se.get(i) ?? 0;
		if (a > 0) throw se.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return oe.has(e);
	},
	recover(e) {
		let t = g.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = oe.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (ce === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		ce = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			ce = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = g.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...g.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return ae.add(e), () => {
			ae.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (g.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return g.set(n, r), le(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = g.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		g.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), le();
	},
	completeStep(e, t) {
		let n = g.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (g.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), le());
	}
};
n("purchaseOperations", {
	repository: _,
	read: "purchases.read",
	commands: {
		injectFailureBeforeStep: null,
		clearInjectedFailures: null,
		registerRecovery: null,
		runStep: null,
		recover: null,
		begin: null,
		setStatus: null,
		completeStep: null
	},
	snapshot: () => _.getAll(),
	restore: (e) => {
		g.clear(), oe.clear();
		for (let t of e) g.set(t.key, t);
	},
	publish: () => ae.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var ue = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function de(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${ue.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function v() {
	de(h.list(), _.getAll());
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var fe = "htt.mock.sales.quotes.v1", pe = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function me(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !pe.has(String(t.status)) || ![
			"id",
			"documentNumber",
			"customerId",
			"documentDate",
			"createdAt",
			"updatedAt"
		].every((e) => typeof t[e] == "string" && t[e].length > 0) || !Array.isArray(t.lines) || !t.totals || typeof t.totals != "object") return !1;
		let n = t.totals;
		return [
			"subtotal",
			"taxAmount",
			"total"
		].every((e) => typeof n[e] == "number" && Number.isFinite(n[e])) ? t.lines.every((e) => {
			if (!e || typeof e != "object") return !1;
			let t = e;
			return [
				"id",
				"productId",
				"unitId",
				"sku",
				"description",
				"unitSymbol"
			].every((e) => typeof t[e] == "string") && [
				"quantity",
				"unitPrice",
				"standardUnitPrice",
				"lineSubtotal",
				"taxAmount",
				"lineTotal",
				"discountAmount",
				"discountPercent"
			].every((e) => typeof t[e] == "number" && Number.isFinite(t[e]));
		}) : !1;
	});
}
function he() {
	return s(fe, me);
}
function ge(e) {
	if (he().status === "invalid" || !l("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!c("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var _e = "htt.mock.sales.quote-orders.v1";
function ve(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "SALES_ORDER" || ![
			"CONFIRMED",
			"PARTIALLY_FULFILLED",
			"FULFILLED",
			"INVOICED",
			"CANCELLED"
		].includes(String(t.status)) || ![
			"id",
			"documentNumber",
			"customerId",
			"documentDate",
			"createdAt",
			"updatedAt"
		].every((e) => typeof t[e] == "string" && t[e].length > 0) || !Array.isArray(t.invoiceIds) || !t.invoiceIds.every((e) => typeof e == "string") || !Array.isArray(t.lines) || !t.totals || typeof t.totals != "object") return !1;
		let n = t.totals;
		return [
			"subtotal",
			"taxAmount",
			"total"
		].every((e) => typeof n[e] == "number" && Number.isFinite(n[e]));
	});
}
function ye(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!me(t.quotes) || !ve(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function be() {
	return s(_e, ye);
}
function xe(e) {
	if (!ye(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = be(), n = he();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !l("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!c("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Se = "htt.mock.sales.documents.v1";
function Ce(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "INVOICE" || ![
			"DRAFT",
			"ISSUED",
			"PARTIALLY_PAID",
			"PAID",
			"OVERDUE",
			"VOID"
		].includes(String(t.status)) || ![
			"id",
			"documentNumber",
			"customerId",
			"documentDate",
			"dueDate",
			"createdAt",
			"updatedAt"
		].every((e) => typeof t[e] == "string" && t[e].length > 0) || !Array.isArray(t.lines) || !t.totals || typeof t.totals != "object") return !1;
		let n = t.totals;
		return [
			"subtotal",
			"taxAmount",
			"total"
		].every((e) => typeof n[e] == "number" && Number.isFinite(n[e])) && ["amountPaid", "amountDue"].every((e) => typeof t[e] == "number" && Number.isFinite(t[e]) && t[e] >= 0);
	});
}
function we(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!ye(t) || !Ce(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Te() {
	return s(Se, we);
}
function Ee(e) {
	if (!we(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Te();
	if (t.status === "invalid" || t.status === "unavailable" || !l("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!c("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var De = [{
	id: "po_001",
	purchaseOrderNumber: "PO-2026-0001",
	supplierId: "sup_001",
	supplierCode: "SUP-0001",
	supplierName: "Melbourne Flooring Wholesale Pty Ltd",
	orderDate: "2026-10-01",
	expectedDeliveryDate: "2026-10-10",
	status: "SENT",
	supplierReference: "OCT-STOCK-01",
	notes: "October timber stock replenishment.",
	lines: [{
		id: "pol_001",
		productId: "prod_001",
		unitId: "unit_001_box",
		sku: "TIM-OAK-190-NAT",
		description: "European Oak 190mm Natural",
		unitSymbol: "box",
		orderedQuantity: 20,
		receivedQuantity: 0,
		billedQuantity: 0,
		unitCost: 105,
		lineSubtotal: 2100,
		taxAmount: 210,
		lineTotal: 2310
	}, {
		id: "pol_002",
		productId: "prod_003",
		unitId: "unit_003_box",
		sku: "LAM-12MM-NOR-OAK",
		description: "12mm Nordic Oak Laminate",
		unitSymbol: "box",
		orderedQuantity: 30,
		receivedQuantity: 0,
		billedQuantity: 0,
		unitCost: 42,
		lineSubtotal: 1260,
		taxAmount: 126,
		lineTotal: 1386
	}],
	totals: {
		subtotal: 3360,
		taxAmount: 336,
		total: 3696
	},
	approvedAt: "2026-10-01T02:30:00.000Z",
	sentAt: "2026-10-01T03:00:00.000Z",
	createdAt: "2026-10-01T02:00:00.000Z",
	updatedAt: "2026-10-01T03:00:00.000Z"
}, {
	id: "po_002",
	purchaseOrderNumber: "PO-2026-0002",
	supplierId: "sup_002",
	supplierCode: "SUP-0002",
	supplierName: "Australian Timber Supply Pty Ltd",
	orderDate: "2026-10-06",
	expectedDeliveryDate: "2026-10-16",
	status: "DRAFT",
	notes: "Draft order awaiting final quantity confirmation.",
	lines: [{
		id: "pol_003",
		productId: "prod_002",
		unitId: "unit_002_box",
		sku: "HYB-SPC-180-SMK",
		description: "SPC Hybrid 180mm Smoked Oak",
		unitSymbol: "box",
		orderedQuantity: 15,
		receivedQuantity: 0,
		billedQuantity: 0,
		unitCost: 66,
		lineSubtotal: 990,
		taxAmount: 99,
		lineTotal: 1089
	}],
	totals: {
		subtotal: 990,
		taxAmount: 99,
		total: 1089
	},
	createdAt: "2026-10-06T01:00:00.000Z",
	updatedAt: "2026-10-06T01:00:00.000Z"
}], Oe = [{
	id: "payment_001",
	paymentNumber: "PAY-2026-0001",
	customerId: "cus_001",
	invoiceId: "invoice_001",
	paymentDate: "2026-10-05",
	amount: 3e3,
	method: "BANK_TRANSFER",
	bankAccountId: "bank_001",
	reference: "BANK-051026-ABC",
	notes: "Part payment received.",
	status: "RECEIVED",
	createdAt: "2026-10-05T03:00:00.000Z",
	updatedAt: "2026-10-05T03:00:00.000Z"
}], ke = "htt:financial-snapshot:v1", Ae = (e) => !!e && typeof e == "object" && !Array.isArray(e), je = (e) => new Set(e.map((e) => e.id)).size === e.length, Me = (e) => {
	if (!Ae(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => Ae(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => Ae(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => Ae(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => Ae(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
		"purchaseOrders",
		"goodsReceipts",
		"receiptMatches",
		"reconciliations",
		"supplierBills",
		"supplierPayments",
		"supplierCredits",
		"supplierCreditAllocations"
	].every((t) => {
		let n = e[t];
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => Ae(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && Ae(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && Ae(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && Ae(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && je(t) && je(n) && je(r) && je(i);
}, Ne = () => ({
	purchaseOrders: structuredClone(De),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(Oe),
	transactions: [],
	transfers: [],
	journals: []
}), Pe, Fe = !1;
function Ie() {
	return typeof window < "u" && !!window.localStorage;
}
function Le() {
	if (Pe) return Pe;
	if (!Ie()) return Ne();
	let e = s(ke, Me);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return Fe = e.status === "ok", Pe = e.status === "ok" ? {
		...Ne(),
		...e.data
	} : Ne(), Pe;
}
var Re = /* @__PURE__ */ new Set(), ze = 0, Be = /* @__PURE__ */ new Set();
function Ve(e) {
	if (Ie() && !c(ke, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var y = {
	wasRestoredOnLoad() {
		return Le(), Fe;
	},
	onRollback(e) {
		Re.add(e);
	},
	notify(e) {
		ze ? Be.add(e) : e();
	},
	transaction(e) {
		if (ze) return e();
		let t = structuredClone(Le());
		Pe = structuredClone(t), ze++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			Ve(Le());
		} catch (e) {
			throw Pe = t, Re.forEach((e) => e()), Be.clear(), e;
		} finally {
			ze--;
		}
		let r = [...Be];
		return Be.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(Le());
	},
	update(e, t) {
		let n = {
			...Le(),
			[e]: structuredClone(t)
		};
		if (!Me(n)) throw Error("Invalid financial snapshot; write blocked.");
		ze || Ve(n), Pe = n;
	},
	resetCacheForTests() {
		Pe = void 0, Fe = !1;
	}
};
n("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => y.read(),
	restore: (e) => {
		Pe = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var He = /* @__PURE__ */ new Set(), b = "2026-10-08T00:00:00.000Z", x = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_2050",
		code: "2050",
		name: "Goods Received Not Invoiced",
		type: "LIABILITY",
		systemRole: "GRNI",
		description: "Accrued liability for inventory received but not yet invoiced by suppliers.",
		active: !0,
		allowManualPosting: !1,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_5150",
		code: "5150",
		name: "Purchase Price Variance",
		type: "EXPENSE",
		systemRole: "PURCHASE_PRICE_VARIANCE",
		description: "Difference between supplier invoice cost and goods receipt inventory cost.",
		active: !0,
		allowManualPosting: !1,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: b,
		updatedAt: b
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: b,
		updatedAt: b
	}
];
function Ue() {
	He.forEach((e) => e());
}
function We(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Ge(e) {
	return e?.trim() || void 0;
}
function Ke(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function qe(e, t) {
	if (x.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function Je(e, t) {
	if (!e) return;
	let n = x.find((n) => n.id !== t && n.systemRole === e);
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function Ye() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var S = {
	subscribe(e) {
		return He.add(e), () => {
			He.delete(e);
		};
	},
	getSnapshot() {
		return x;
	},
	getAll() {
		return x;
	},
	getById(e) {
		return x.find((t) => t.id === e);
	},
	getByCode(e) {
		return x.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return x.find((t) => t.systemRole === e);
	},
	requireById(e) {
		let t = x.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = x.find((t) => t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = We(e.code, "Account code"), n = We(e.name, "Account name");
		Ke(t), qe(t), Je(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Ye(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: Ge(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return x = [...x, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Ue(), i;
	},
	update(e, t) {
		let n = x.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = We(t.code, "Account code"), i = We(t.name, "Account name");
		if (Ke(r), qe(r, e), n.systemRole && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: Ge(t.description),
			active: n.systemRole ? !0 : t.active,
			allowManualPosting: n.systemRole ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return x = x.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Ue(), a;
	},
	setActive(e, t) {
		let n = x.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if (n.systemRole && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return x = x.map((t) => t.id === e ? r : t), Ue(), r;
	}
};
n("accounts", {
	repository: S,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: x }),
	restore: (e) => {
		x = e.accounts;
	},
	publish: () => He.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var Xe = /* @__PURE__ */ new Set(), C = y.read().journals;
y.onRollback(() => {
	C = y.read().journals;
});
function Ze() {
	Xe.forEach((e) => y.notify(e));
}
function Qe(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function $e(e) {
	return e?.trim() || void 0;
}
function et(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function tt(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = C.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function nt(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function rt(e) {
	if (et(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = S.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = Qe(r.debit), o = Qe(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = Qe(t + a), n = Qe(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function it(e) {
	return e.lines.map((e, t) => {
		let n = S.requireById(e.accountId);
		return {
			id: nt(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: $e(e.description),
			debit: Qe(e.debit),
			credit: Qe(e.credit)
		};
	});
}
function at(e, t) {
	return C.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var w = {
	subscribe(e) {
		return Xe.add(e), () => {
			Xe.delete(e);
		};
	},
	getSnapshot() {
		return C;
	},
	getAll() {
		return C;
	},
	getById(e) {
		return C.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return C.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: at,
	post(e) {
		let t = rt(e), n = $e(e.sourceId);
		if (n) {
			let t = at(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: nt("je"),
			journalNumber: tt(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: $e(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: it(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...C];
		return y.update("journals", a), C = a, Ze(), i;
	},
	reverse(e) {
		let t = C.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (et(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		let r = {
			journalDate: e.reversalDate,
			description: `Reversal of ${t.journalNumber}: ${t.description}`,
			reference: t.reference,
			sourceType: t.sourceType,
			lines: t.lines.map((e) => ({
				accountId: e.accountId,
				description: e.description,
				debit: e.credit,
				credit: e.debit
			}))
		}, i = rt(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: nt("je"),
			journalNumber: tt(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: it(r),
			totalDebit: i.totalDebit,
			totalCredit: i.totalCredit,
			createdAt: a,
			updatedAt: a,
			postedAt: a,
			reversedJournalEntryId: t.id
		}, s = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			reversalJournalEntryId: o.id,
			updatedAt: a
		}, c = [o, ...C.map((e) => e.id === t.id ? s : e)];
		return y.update("journals", c), C = c, Ze(), o;
	}
};
n("journals", {
	repository: w,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: C }),
	restore: (e) => {
		C = e.journalEntries;
	},
	publish: () => Xe.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var ot = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function st(e) {
	let t = e.filter((e) => ot.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function ct() {
	st(h.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var lt = [{
	id: "quote_001",
	type: "QUOTE",
	documentNumber: "QU-2026-0001",
	customerId: "cus_001",
	documentDate: "2026-09-18",
	expiryDate: "2026-10-18",
	status: "CONVERTED",
	convertedSalesOrderId: "order_001",
	customerReference: "Richmond showroom",
	notes: "Supply European Oak flooring.",
	lines: [{
		id: "line_quote_001_01",
		productId: "prod_001",
		unitId: "unit_001_m2",
		sku: "TIM-OAK-190-NAT",
		description: "European Oak 190mm Natural",
		unitSymbol: "m²",
		quantity: 85,
		standardUnitPrice: 68.5,
		unitPrice: 62.5,
		priceSource: "CUSTOMER_PRICE",
		customerPriceId: "cprice_001",
		discountAmount: 6,
		discountPercent: 8.76,
		lineSubtotal: 5312.5,
		taxAmount: 531.25,
		lineTotal: 5843.75
	}],
	totals: {
		subtotal: 5312.5,
		taxAmount: 531.25,
		total: 5843.75
	},
	createdAt: "2026-09-18T01:00:00.000Z",
	updatedAt: "2026-09-18T01:00:00.000Z"
}], ut = [{
	id: "order_001",
	type: "SALES_ORDER",
	documentNumber: "SO-2026-0001",
	customerId: "cus_001",
	documentDate: "2026-09-20",
	requestedDeliveryDate: "2026-10-02",
	status: "INVOICED",
	sourceQuoteId: "quote_001",
	invoiceIds: ["invoice_001"],
	customerReference: "Richmond showroom",
	notes: "Deliver to Richmond location.",
	lines: [{
		id: "line_order_001_01",
		productId: "prod_001",
		unitId: "unit_001_m2",
		sku: "TIM-OAK-190-NAT",
		description: "European Oak 190mm Natural",
		unitSymbol: "m²",
		quantity: 85,
		standardUnitPrice: 68.5,
		unitPrice: 62.5,
		priceSource: "CUSTOMER_PRICE",
		customerPriceId: "cprice_001",
		discountAmount: 6,
		discountPercent: 8.76,
		lineSubtotal: 5312.5,
		taxAmount: 531.25,
		lineTotal: 5843.75
	}],
	totals: {
		subtotal: 5312.5,
		taxAmount: 531.25,
		total: 5843.75
	},
	createdAt: "2026-09-20T01:00:00.000Z",
	updatedAt: "2026-09-20T01:00:00.000Z"
}], dt = [{
	id: "invoice_001",
	type: "INVOICE",
	documentNumber: "INV-2026-0001",
	customerId: "cus_001",
	documentDate: "2026-10-02",
	dueDate: "2026-11-01",
	status: "PARTIALLY_PAID",
	sourceSalesOrderId: "order_001",
	customerReference: "Richmond showroom",
	notes: "Flooring supplied and delivered.",
	lines: [{
		id: "line_invoice_001_01",
		productId: "prod_001",
		unitId: "unit_001_m2",
		sku: "TIM-OAK-190-NAT",
		description: "European Oak 190mm Natural",
		unitSymbol: "m²",
		quantity: 85,
		standardUnitPrice: 68.5,
		unitPrice: 62.5,
		priceSource: "CUSTOMER_PRICE",
		customerPriceId: "cprice_001",
		discountAmount: 6,
		discountPercent: 8.76,
		lineSubtotal: 5312.5,
		taxAmount: 531.25,
		lineTotal: 5843.75
	}],
	totals: {
		subtotal: 5312.5,
		taxAmount: 531.25,
		total: 5843.75
	},
	amountPaid: 3e3,
	amountDue: 2843.75,
	createdAt: "2026-10-02T01:00:00.000Z",
	updatedAt: "2026-10-05T01:00:00.000Z"
}], ft = "htt.mock.sales.credit-notes.v1", pt = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, mt = (e) => typeof e == "string" && e.length > 0;
function ht(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!Array.isArray(t.creditNotes) || !Array.isArray(t.allocations)) return !1;
	let n = [], r = /* @__PURE__ */ new Set();
	for (let e of t.creditNotes) {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (![
			"id",
			"creditNoteNumber",
			"customerId",
			"sourceInvoiceId",
			"creditDate",
			"reason",
			"createdAt",
			"updatedAt"
		].every((e) => mt(t[e])) || ![
			"DRAFT",
			"ISSUED",
			"FULLY_APPLIED",
			"VOID"
		].includes(String(t.status)) || !Array.isArray(t.lines) || !t.totals || typeof t.totals != "object") return !1;
		let i = t.totals;
		if (![
			"subtotal",
			"taxAmount",
			"total"
		].every((e) => pt(i[e])) || !pt(t.amountApplied) || !pt(t.amountAvailable) || r.has(t.id)) return !1;
		r.add(t.id), n.push(t);
	}
	let i = /* @__PURE__ */ new Set(), a = [];
	for (let e of t.allocations) {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (![
			"id",
			"allocationNumber",
			"customerId",
			"creditNoteId",
			"invoiceId",
			"allocationDate",
			"createdAt",
			"updatedAt"
		].every((e) => mt(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !pt(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		return Math.abs(t - e.amountApplied) > .011 ? !1 : e.status === "VOID" ? t === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function gt() {
	return s(ft, ht);
}
function _t(e) {
	if (!ht(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = gt();
	if (t.status === "invalid" || t.status === "unavailable" || !l("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!c("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var vt = /* @__PURE__ */ new Set(), yt = gt(), T = yt.status === "ok" ? structuredClone(yt.data.creditNotes) : [], E = yt.status === "ok" ? structuredClone(yt.data.allocations) : [], bt = [...T], xt = [...E];
function St() {
	bt = [...T], xt = [...E], vt.forEach((e) => e());
}
function Ct(e, t) {
	_t({
		creditNotes: e,
		allocations: t
	}), T = e, E = t, St();
}
var D = {
	subscribe(e) {
		return vt.add(e), () => {
			vt.delete(e);
		};
	},
	getSnapshot() {
		return bt;
	},
	getAllocationSnapshot() {
		return xt;
	},
	getAll() {
		return bt;
	},
	getAllAllocations() {
		return xt;
	},
	getById(e) {
		return T.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return T.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return T.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return E.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return E.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (T.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return Ct([e, ...T], E), e;
	},
	update(e) {
		if (!T.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Ct(T.map((t) => t.id === e.id ? e : t), E), e;
	},
	createAllocation(e) {
		if (E.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Ct(T, [e, ...E]), e;
	},
	updateAllocation(e) {
		if (!E.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Ct(T, E.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!T.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = E.some((t) => t.id === e.id) ? E.map((t) => t.id === e.id ? e : t) : [e, ...E];
		Ct(T.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return E.find((t) => t.id === e);
	}
};
n("customerCredits", {
	repository: D,
	read: "sales.read",
	commands: {
		persistCreditNoteState: null,
		emitChange: null,
		create: null,
		update: null,
		createAllocation: null,
		updateAllocation: null,
		commitAllocationAndCredit: null
	},
	snapshot: () => ({
		creditNotes: T,
		allocations: E
	}),
	restore: (e) => {
		T = e.creditNotes, E = e.allocations, bt = [...T], xt = [...E];
	},
	publish: () => vt.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var wt = [
	{
		id: "prod_001",
		sku: "TIM-OAK-190-NAT",
		name: "European Oak 190mm Natural",
		category: "Timber",
		brand: "HTT Flooring",
		collection: "European Oak",
		description: "190mm engineered European oak flooring in Natural finish.",
		status: "ACTIVE",
		baseUnitId: "unit_001_m2",
		units: [{
			id: "unit_001_m2",
			code: "M2",
			name: "Square Metre",
			symbol: "m²",
			conversionToBase: 1,
			basePrice: 68.5,
			isBaseUnit: !0,
			active: !0
		}, {
			id: "unit_001_box",
			code: "BOX",
			name: "Box",
			symbol: "box",
			conversionToBase: 2.166,
			basePrice: 148.37,
			isBaseUnit: !1,
			active: !0
		}],
		createdAt: "2026-09-01T00:00:00.000Z",
		updatedAt: "2026-09-01T00:00:00.000Z"
	},
	{
		id: "prod_002",
		sku: "HYB-SPC-180-SMK",
		name: "SPC Hybrid 180mm Smoked Oak",
		category: "Hybrid",
		brand: "HTT Flooring",
		collection: "Urban Hybrid",
		description: "Water resistant SPC hybrid flooring in Smoked Oak finish.",
		status: "ACTIVE",
		baseUnitId: "unit_002_m2",
		units: [{
			id: "unit_002_m2",
			code: "M2",
			name: "Square Metre",
			symbol: "m²",
			conversionToBase: 1,
			basePrice: 42.9,
			isBaseUnit: !0,
			active: !0
		}, {
			id: "unit_002_box",
			code: "BOX",
			name: "Box",
			symbol: "box",
			conversionToBase: 2.22,
			basePrice: 95.24,
			isBaseUnit: !1,
			active: !0
		}],
		createdAt: "2026-09-01T00:00:00.000Z",
		updatedAt: "2026-09-01T00:00:00.000Z"
	},
	{
		id: "prod_003",
		sku: "LAM-12MM-NOR-OAK",
		name: "12mm Nordic Oak Laminate",
		category: "Laminate",
		brand: "HTT Flooring",
		collection: "Nordic",
		status: "ACTIVE",
		baseUnitId: "unit_003_m2",
		units: [{
			id: "unit_003_m2",
			code: "M2",
			name: "Square Metre",
			symbol: "m²",
			conversionToBase: 1,
			basePrice: 31.5,
			isBaseUnit: !0,
			active: !0
		}, {
			id: "unit_003_box",
			code: "BOX",
			name: "Box",
			symbol: "box",
			conversionToBase: 1.92,
			basePrice: 60.48,
			isBaseUnit: !1,
			active: !0
		}],
		createdAt: "2026-09-01T00:00:00.000Z",
		updatedAt: "2026-09-01T00:00:00.000Z"
	},
	{
		id: "prod_004",
		sku: "VIN-PLANK-STONE",
		name: "Luxury Vinyl Plank Stone Grey",
		category: "Vinyl",
		brand: "HTT Flooring",
		collection: "Commercial Vinyl",
		status: "ACTIVE",
		baseUnitId: "unit_004_m2",
		units: [{
			id: "unit_004_m2",
			code: "M2",
			name: "Square Metre",
			symbol: "m²",
			conversionToBase: 1,
			basePrice: 36.8,
			isBaseUnit: !0,
			active: !0
		}, {
			id: "unit_004_box",
			code: "BOX",
			name: "Box",
			symbol: "box",
			conversionToBase: 2.5,
			basePrice: 92,
			isBaseUnit: !1,
			active: !0
		}],
		createdAt: "2026-09-01T00:00:00.000Z",
		updatedAt: "2026-09-01T00:00:00.000Z"
	},
	{
		id: "prod_005",
		sku: "ACC-SCOTIA-OAK",
		name: "Oak Scotia Trim",
		category: "Accessories",
		brand: "HTT Flooring",
		status: "ACTIVE",
		baseUnitId: "unit_005_piece",
		units: [{
			id: "unit_005_piece",
			code: "PIECE",
			name: "Piece",
			symbol: "pc",
			conversionToBase: 1,
			basePrice: 14.9,
			isBaseUnit: !0,
			active: !0
		}],
		createdAt: "2026-09-01T00:00:00.000Z",
		updatedAt: "2026-09-01T00:00:00.000Z"
	},
	{
		id: "prod_006",
		sku: "CAR-COM-CHAR",
		name: "Commercial Carpet Charcoal",
		category: "Carpet",
		brand: "HTT Flooring",
		collection: "Commercial",
		status: "ACTIVE",
		baseUnitId: "unit_006_lm",
		units: [{
			id: "unit_006_lm",
			code: "LM",
			name: "Linear Metre",
			symbol: "LM",
			conversionToBase: 1,
			basePrice: 52,
			isBaseUnit: !0,
			active: !0
		}, {
			id: "unit_006_roll",
			code: "ROLL",
			name: "Roll",
			symbol: "roll",
			conversionToBase: 25,
			basePrice: 1300,
			isBaseUnit: !1,
			active: !0
		}],
		createdAt: "2026-09-01T00:00:00.000Z",
		updatedAt: "2026-09-01T00:00:00.000Z"
	}
];
function O(e) {
	return wt.find((t) => t.id === e);
}
function Tt(e, t) {
	return O(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var Et = "htt.mock.contacts.customerPricing.v1";
function Dt(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return ![
			"id",
			"customerId",
			"productId",
			"unitId",
			"effectiveFrom",
			"createdAt",
			"updatedAt"
		].every((e) => typeof t[e] == "string" && t[e].length > 0) || t.pricingMethod !== "FIXED_PRICE" && t.pricingMethod !== "DISCOUNT_PERCENT" || typeof t.active != "boolean" || t.effectiveTo !== void 0 && typeof t.effectiveTo != "string" || t.fixedPrice !== void 0 && (typeof t.fixedPrice != "number" || !Number.isFinite(t.fixedPrice) || t.fixedPrice < 0) || t.discountPercent !== void 0 && (typeof t.discountPercent != "number" || !Number.isFinite(t.discountPercent) || t.discountPercent < 0 || t.discountPercent > 100) ? !1 : t.pricingMethod === "FIXED_PRICE" ? typeof t.fixedPrice == "number" : typeof t.discountPercent == "number";
	});
}
function Ot() {
	return s(Et, Dt);
}
function kt(e) {
	if (Ot().status === "invalid" || !l("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!c("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var At = [
	{
		id: "cprice_001",
		customerId: "cus_001",
		productId: "prod_001",
		unitId: "unit_001_m2",
		pricingMethod: "FIXED_PRICE",
		fixedPrice: 62.5,
		effectiveFrom: "2026-01-01",
		active: !0,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z"
	},
	{
		id: "cprice_002",
		customerId: "cus_001",
		productId: "prod_002",
		unitId: "unit_002_box",
		pricingMethod: "DISCOUNT_PERCENT",
		discountPercent: 8,
		effectiveFrom: "2026-01-01",
		active: !0,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z"
	},
	{
		id: "cprice_003",
		customerId: "cus_002",
		productId: "prod_003",
		unitId: "unit_003_m2",
		pricingMethod: "DISCOUNT_PERCENT",
		discountPercent: 12.5,
		effectiveFrom: "2026-03-01",
		active: !0,
		createdAt: "2026-03-01T00:00:00.000Z",
		updatedAt: "2026-03-01T00:00:00.000Z"
	}
], jt = /* @__PURE__ */ new Set(), Mt = Ot(), k = Mt.status === "ok" ? Mt.data : structuredClone(At);
function Nt() {
	jt.forEach((e) => {
		e();
	});
}
function Pt(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Ft(e) {
	return e.trim() || void 0;
}
function It(e, t) {
	let n = O(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function Lt(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function Rt({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = k.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : Lt(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = Ut(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function zt(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function Bt(e) {
	let t = Tt(e.productId, e.unitId);
	if (!t) return;
	let n = t.basePrice, r = n;
	e.pricingMethod === "FIXED_PRICE" && e.fixedPrice !== void 0 && (r = e.fixedPrice), e.pricingMethod === "DISCOUNT_PERCENT" && e.discountPercent !== void 0 && (r = n * (1 - e.discountPercent / 100));
	let i = n - r, a = n > 0 ? i / n * 100 : 0;
	return {
		customerPrice: e,
		basePrice: n,
		effectivePrice: r,
		discountAmount: i,
		discountPercent: a
	};
}
var Vt = {
	subscribe(e) {
		return jt.add(e), () => {
			jt.delete(e);
		};
	},
	getSnapshot() {
		return k;
	},
	getAll() {
		return k;
	},
	getById(e) {
		return k.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return k.filter((t) => t.customerId === e);
	},
	create(e, t) {
		It(t.productId, t.unitId);
		let n = Ft(t.effectiveTo);
		t.active && Rt({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = zt(t), a = {
			id: Pt("cprice"),
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n,
			active: t.active,
			createdAt: r,
			updatedAt: r
		}, o = [a, ...k];
		return kt(o), k = o, Nt(), a;
	},
	update(e, t) {
		let n = Vt.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		It(t.productId, t.unitId);
		let r = Ft(t.effectiveTo);
		t.active && Rt({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = zt(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = k.map((t) => t.id === e ? a : t);
		return kt(o), k = o, Nt(), a;
	},
	resolve(e) {
		return Bt(e);
	},
	resolvePrice(e, t, n, r) {
		let { unit: i } = It(t, n), a = k.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && Ht(r, i.effectiveFrom, i.effectiveTo));
		if (!a) return {
			customerId: e,
			productId: t,
			unitId: n,
			date: r,
			source: "STANDARD_PRICE",
			basePrice: i.basePrice,
			effectivePrice: i.basePrice,
			discountAmount: 0,
			discountPercent: 0
		};
		let o = Bt(a);
		if (!o) throw Error("Unable to resolve customer pricing rule");
		return {
			customerId: e,
			productId: t,
			unitId: n,
			date: r,
			source: "CUSTOMER_PRICE",
			basePrice: o.basePrice,
			effectivePrice: o.effectivePrice,
			discountAmount: o.discountAmount,
			discountPercent: o.discountPercent,
			customerPrice: a
		};
	}
};
function Ht(e, t, n) {
	return !(e < t || n && e > n);
}
function Ut(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
n("customerPrices", {
	repository: Vt,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: k }),
	restore: (e) => {
		k = e.customerPrices;
	},
	publish: () => jt.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
var Wt = .1;
function Gt(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Kt({ quantity: e, standardUnitPrice: t, unitPrice: n }) {
	let r = Gt(e * n), i = Gt(r * Wt), a = Gt(r + i), o = Gt(t - n);
	return {
		discountAmount: o,
		discountPercent: t > 0 ? Gt(o / t * 100) : 0,
		lineSubtotal: r,
		taxAmount: i,
		lineTotal: a
	};
}
function qt(e) {
	let t = Gt(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Gt(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Gt(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Jt({ customerId: e, documentDate: t, draft: n }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let r = O(n.productId);
	if (!r) throw Error(`Product ${n.productId} was not found`);
	if (r.status !== "ACTIVE") throw Error(`${r.name} is inactive`);
	let i = Tt(n.productId, n.unitId);
	if (!i) throw Error(`Unit ${n.unitId} was not found for ${r.name}`);
	let a = Vt.resolvePrice(e, n.productId, n.unitId, t), o = n.unitPrice !== void 0, s = o ? n.unitPrice : a.effectivePrice;
	if (s < 0) throw Error("Unit price cannot be negative");
	let c = Kt({
		quantity: n.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: s
	});
	return {
		id: Yt("line"),
		productId: r.id,
		unitId: i.id,
		sku: r.sku,
		description: r.name,
		unitSymbol: i.symbol,
		quantity: n.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: s,
		priceSource: o ? "MANUAL" : a.source,
		customerPriceId: o ? void 0 : a.customerPrice?.id,
		...c
	};
}
function Yt(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var Xt = "htt.mock.banking.accounts.v1";
function Zt(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var Qt = /* @__PURE__ */ new Set(), $t = "2026-10-08T00:00:00.000Z", A = [{
	id: "bank_001",
	name: "Operating Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1000",
	accountType: "TRANSACTION",
	currency: "AUD",
	glAccountId: "acc_1000",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: $t,
	updatedAt: $t
}, {
	id: "bank_002",
	name: "Savings Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1010",
	accountType: "SAVINGS",
	currency: "AUD",
	glAccountId: "acc_1010",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: $t,
	updatedAt: $t
}], en = s(Xt, Zt);
en.status === "ok" && en.data.every((e) => {
	let t = S.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (A = en.data);
function tn() {
	Qt.forEach((e) => e());
}
function nn(e) {
	let t = S.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of A) nn(e);
var rn = {
	subscribe(e) {
		return Qt.add(e), () => {
			Qt.delete(e);
		};
	},
	getSnapshot() {
		return A;
	},
	getAll() {
		return A;
	},
	getById(e) {
		return A.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return A.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = A.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return A = A.map((t) => t.id === e ? r : t), l(Xt) && c(Xt, A), tn(), r;
	}
};
n("bankAccounts", {
	repository: rn,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write"
	},
	snapshot: () => ({ bankAccounts: A }),
	restore: (e) => {
		A = e.bankAccounts;
	},
	publish: () => Qt.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var an = /* @__PURE__ */ new Set(), j = y.read().payments;
function on() {
	an.forEach((e) => e());
}
function sn() {
	return `payment_${crypto.randomUUID()}`;
}
function cn() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = j.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var ln = {
	subscribe(e) {
		return an.add(e), () => {
			an.delete(e);
		};
	},
	getSnapshot() {
		return j;
	},
	getAll() {
		return j;
	},
	getById(e) {
		return j.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return j.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return j.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = rn.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (a(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (dn(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = h.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: dn(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: un(e.reference),
				notes: un(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = j.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: sn(),
			paymentNumber: cn(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: dn(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: un(e.reference),
			notes: un(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && h.bindResult(n, i.id);
		let o = [i, ...j];
		if (y.update("payments", o), j = o, n && !e.deferOperationCompletion) try {
			h.complete(n, i.id);
		} catch (e) {
			try {
				h.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return on(), i;
	},
	reverse(e, t) {
		let n = j.find((t) => t.id === e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason is required");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		}, o = j.map((t) => t.id === e ? a : t);
		return y.update("payments", o), j = o, on(), a;
	},
	getReceivedByInvoice(e) {
		return j.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function un(e) {
	return e?.trim() || void 0;
}
function dn(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
n("customerPayments", {
	repository: ln,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: j }),
	restore: (e) => {
		j = e.payments;
	},
	publish: () => an.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/salesAccountingPostingService.ts
function fn(e) {
	return S.requireBySystemRole(e).id;
}
function pn(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: "Pacific/Auckland",
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function mn(e, t) {
	return w.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function hn(e, t) {
	let n = mn(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var M = {
	postInvoice(e) {
		return mn("CUSTOMER_INVOICE", e.id) || w.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: fn("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: fn("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				{
					accountId: fn("GST_PAYABLE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.taxAmount
				}
			]
		});
	},
	reverseInvoice(e) {
		let t = hn("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: pn(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = mn("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = rn.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return w.post({
			journalDate: e.paymentDate,
			description: `Customer payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "CUSTOMER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: n.glAccountId,
				description: e.paymentNumber,
				debit: e.amount,
				credit: 0
			}, {
				accountId: fn("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = hn("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: pn(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return mn("CREDIT_NOTE", e.id) || w.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: fn("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				{
					accountId: fn("GST_PAYABLE"),
					description: e.creditNoteNumber,
					debit: e.totals.taxAmount,
					credit: 0
				},
				{
					accountId: fn("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = hn("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: pn(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, gn = /* @__PURE__ */ new Set(), _n = Te(), vn = be(), yn = he(), N = _n.status === "ok" ? structuredClone(_n.data.quotes) : vn.status === "ok" ? structuredClone(vn.data.quotes) : yn.status === "ok" ? structuredClone(yn.data) : structuredClone(lt);
function bn(e) {
	_n.status === "ok" || Te().status !== "empty" ? Ee({
		quotes: e,
		salesOrders: P,
		invoices: F
	}) : vn.status === "ok" || be().status !== "empty" ? xe({
		quotes: e,
		salesOrders: P
	}) : ge(e), N = e, wn();
}
var P = _n.status === "ok" ? structuredClone(_n.data.salesOrders) : vn.status === "ok" ? structuredClone(vn.data.salesOrders) : structuredClone(ut), F = _n.status === "ok" ? structuredClone(_n.data.invoices) : structuredClone(dt);
function xn(e) {
	Ee({
		quotes: N,
		salesOrders: P,
		invoices: e
	}), F = e, wn();
}
function Sn(e, t = N) {
	_n.status === "ok" || Te().status !== "empty" ? Ee({
		quotes: t,
		salesOrders: e,
		invoices: F
	}) : xe({
		quotes: t,
		salesOrders: e
	}), P = e, N = t, wn();
}
var Cn = Tn();
function wn() {
	Cn = Tn(), gn.forEach((e) => e());
}
function Tn() {
	return [
		...N,
		...P,
		...F
	];
}
var En = {
	subscribe(e) {
		return gn.add(e), () => {
			gn.delete(e);
		};
	},
	getSnapshot() {
		return Cn;
	},
	getAll() {
		return Cn;
	},
	getById(e) {
		return Cn.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Cn.filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return N.filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return P.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return F.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (Dn(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => Jt({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: kn("quote"),
			type: "QUOTE",
			documentNumber: An("QU", N.map((e) => e.documentNumber)),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: On(e.customerReference),
			notes: On(e.notes),
			lines: t,
			totals: qt(t),
			createdAt: n,
			updatedAt: n
		};
		return bn([r, ...N]), r;
	},
	updateDraftQuote(e, t) {
		let n = N.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			let t = Kt({
				quantity: e.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			});
			return {
				id: n.lines.find((t) => t.id === e.lineId)?.id ?? kn("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: Nn(e.productId, e.unitId).sku,
				description: Nn(e.productId, e.unitId).description,
				unitSymbol: Nn(e.productId, e.unitId).unitSymbol,
				quantity: e.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice,
				priceSource: e.priceSource,
				customerPriceId: e.customerPriceId,
				...t
			};
		}), i = {
			...n,
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: On(t.customerReference),
			notes: On(t.notes),
			lines: r,
			totals: qt(r),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return bn(N.map((t) => t.id === e ? i : t)), i;
	},
	sendQuote(e) {
		let t = N.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return bn(N.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = N.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return bn(N.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = N.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return bn(N.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = N.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: kn("order"),
			type: "SALES_ORDER",
			documentNumber: An("SO", P.map((e) => e.documentNumber)),
			customerId: t.customerId,
			documentDate: jn(),
			status: "CONFIRMED",
			sourceQuoteId: t.id,
			invoiceIds: [],
			customerReference: t.customerReference,
			notes: t.notes,
			lines: structuredClone(t.lines),
			totals: structuredClone(t.totals),
			createdAt: n,
			updatedAt: n
		};
		return Sn([r, ...P], N.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = P.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Sn(P.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = P.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = jn(), i = {
			id: kn("invoice"),
			type: "INVOICE",
			documentNumber: An("INV", F.map((e) => e.documentNumber)),
			customerId: t.customerId,
			documentDate: r,
			dueDate: Mn(r, 30),
			status: "ISSUED",
			sourceSalesOrderId: t.id,
			customerReference: t.customerReference,
			notes: t.notes,
			lines: structuredClone(t.lines),
			totals: structuredClone(t.totals),
			amountPaid: 0,
			amountDue: t.totals.total,
			createdAt: n,
			updatedAt: n
		}, a = [i, ...F], o = P.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return Ee({
			quotes: N,
			salesOrders: o,
			invoices: a
		}), F = a, P = o, wn(), M.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = F.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A credit note cannot be created from a void invoice");
		if (t.status === "DRAFT") throw Error("A credit note cannot be created from a draft invoice");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A credit reason is required");
		if (e.lines.length === 0) throw Error("A credit note must contain at least one line");
		if (e.creditDate < t.documentDate) throw Error("Credit date cannot be earlier than the invoice date");
		let r = structuredClone(e.lines), i = qt(r);
		if (i.total <= 0) throw Error("Credit note total must be greater than zero");
		if (I(I(D.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + i.total) > I(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: kn("credit-note"),
			creditNoteNumber: An("CN", D.getAll().map((e) => e.creditNoteNumber)),
			customerId: t.customerId,
			sourceInvoiceId: t.id,
			creditDate: e.creditDate,
			status: "ISSUED",
			reason: n,
			lines: r,
			totals: i,
			amountApplied: 0,
			amountAvailable: i.total,
			issuedAt: a,
			createdAt: a,
			updatedAt: a
		};
		return D.create(o), M.postCreditNote(o), o;
	},
	applyCreditToInvoice(e) {
		v(), ct();
		let t = D.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = F.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = I(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = D.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: kn("credit-allocation"),
			allocationNumber: An("CA", D.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = I(i.amountApplied + r), c = I(Math.max(0, i.totals.total - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (h.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			h.bindResult(l, o.id), D.commitAllocationAndCredit(o, {
				...i,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(n.id), h.complete(l, o.id);
		} catch (e) {
			try {
				h.flagForReview(l, "Credit allocation/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	reverseCreditAllocation(e) {
		v(), ct();
		let t = D.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = D.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = F.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = I(D.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = I(Math.max(0, r.totals.total - s)), l = `sales-credit-reversal:${t.id}`;
		if (h.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			h.bindResult(l, t.id), D.commitAllocationAndCredit(o, {
				...r,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(i.id), h.complete(l, t.id);
		} catch (e) {
			try {
				h.flagForReview(l, "Credit reversal/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidCreditNote(e) {
		let t = D.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (D.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return D.update(i), M.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (v(), ct(), e.operationId) {
			let t = h.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = F.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = I(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (a(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, o = ln.create({
			operationId: i,
			deferOperationCompletion: !0,
			customerId: r.customerId,
			invoiceId: r.id,
			paymentDate: e.paymentDate,
			amount: n,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: e.reference,
			notes: e.notes
		});
		this.recalculateInvoiceBalance(r.id);
		try {
			M.postPayment(o);
			let e = w.getBySource("CUSTOMER_PAYMENT", o.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			h.complete(i, o.id);
		} catch (e) {
			try {
				h.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidInvoice(e, t) {
		v(), ct();
		let n = F.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (ln.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (D.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountPaid: 0,
			amountDue: 0,
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		}, o = `sales-invoice-void:${e}`;
		if (h.begin(o, "SALES_INVOICE_VOID", e).status !== "started") throw Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
		try {
			let t = w.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			h.bindResult(o, e), M.reverseInvoice(a);
			let n = w.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			xn(F.map((t) => t.id === e ? a : t)), h.complete(o, e);
		} catch (e) {
			try {
				h.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		v(), ct();
		let n = ln.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = F.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (h.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			h.bindResult(i, e);
			let n = ln.reverse(e, t);
			M.reversePayment(n);
			let a = w.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
			if (a.length !== 1 || a[0].status !== "REVERSED") throw Error("Payment GL reversal could not be verified.");
			return this.recalculateInvoiceBalance(r.id), h.complete(i, e), n;
		} catch (e) {
			try {
				h.flagForReview(i, "Payment reversal/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
	},
	recalculateInvoiceBalance(e) {
		let t = F.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = ln.getReceivedByInvoice(e), r = D.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = I(n.reduce((e, t) => e + t.amount, 0)), a = I(r.reduce((e, t) => e + t.amount, 0)), o = I(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : Pn(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return xn(F.map((t) => t.id === e ? c : t)), c;
	}
};
function Dn(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function On(e) {
	return e?.trim() || void 0;
}
function kn(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function An(e, t) {
	let n = (/* @__PURE__ */ new Date()).getFullYear(), r = t.reduce((e, t) => {
		let n = t.match(/-(\d+)$/);
		if (!n) return e;
		let r = Number(n[1]);
		return Math.max(e, r);
	}, 0) + 1;
	return `${e}-${n}-${String(r).padStart(4, "0")}`;
}
function jn() {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function Mn(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function Nn(e, t) {
	let n = O(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = Tt(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function I(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Pn(e) {
	return e < Fn(/* @__PURE__ */ new Date());
}
function Fn(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
n("sales", {
	repository: En,
	read: "sales.read",
	commands: {
		if: null,
		emitChange: null,
		persistSalesDocuments: null,
		createQuote: "sales.write",
		updateDraftQuote: "sales.write",
		sendQuote: "sales.write",
		acceptQuote: "sales.write",
		declineQuote: "sales.write",
		convertQuoteToOrder: "sales.write",
		setFulfilmentStatus: null,
		createInvoiceFromOrder: "sales.write",
		createCreditNoteFromInvoice: "sales.payment",
		applyCreditToInvoice: "sales.payment",
		reverseCreditAllocation: "sales.payment",
		voidCreditNote: "sales.payment",
		recordInvoicePayment: "sales.payment",
		voidInvoice: "sales.payment",
		reverseInvoicePayment: "sales.payment",
		recalculateInvoiceBalance: null
	},
	snapshot: () => ({
		quotes: N,
		salesOrders: P,
		invoices: F
	}),
	restore: (e) => {
		N = e.quotes, P = e.salesOrders, F = e.invoices, Cn = Tn();
	},
	publish: () => gn.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventorySiteRepository.ts
var In = structuredClone([{
	id: "site_001",
	code: "MEL-WH",
	name: "Melbourne Warehouse",
	status: "ACTIVE",
	addressLine1: "18 Industrial Drive",
	suburb: "Dandenong South",
	state: "VIC",
	postcode: "3175",
	country: "Australia",
	createdAt: "2026-09-01T00:00:00.000Z",
	updatedAt: "2026-09-01T00:00:00.000Z"
}, {
	id: "site_002",
	code: "RICH-SH",
	name: "Richmond Showroom",
	status: "ACTIVE",
	addressLine1: "82 Bridge Road",
	suburb: "Richmond",
	state: "VIC",
	postcode: "3121",
	country: "Australia",
	createdAt: "2026-09-01T00:00:00.000Z",
	updatedAt: "2026-09-01T00:00:00.000Z"
}]), Ln = {
	getAll() {
		return In;
	},
	getById(e) {
		return In.find((t) => t.id === e);
	},
	getActive() {
		return In.filter((e) => e.status === "ACTIVE");
	}
}, Rn = /* @__PURE__ */ new Set(), zn = [];
function Bn() {
	Rn.forEach((e) => e());
}
function Vn() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = zn.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var Hn = {
	subscribe(e) {
		return Rn.add(e), () => {
			Rn.delete(e);
		};
	},
	getSnapshot() {
		return zn;
	},
	getAll() {
		return zn;
	},
	getByReference(e, t) {
		return zn.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return zn.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return zn.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: Vn(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return zn = [t, ...zn], Bn(), t;
	}
};
n("inventoryMovements", {
	repository: Hn,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: zn }),
	restore: (e) => {
		zn = e.movements;
	},
	publish: () => Rn.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var Un = /* @__PURE__ */ new Set(), Wn = [];
function Gn() {
	Un.forEach((e) => e());
}
function Kn(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var qn = {
	subscribe(e) {
		return Un.add(e), () => {
			Un.delete(e);
		};
	},
	getSnapshot() {
		return Wn;
	},
	getAll() {
		return Wn;
	},
	getBalance(e, t) {
		return Wn.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = qn.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: Kn(i.quantityOnHand + r),
				updatedAt: a
			};
			return Wn = Wn.map((r) => r.siteId === e && r.productId === t ? n : r), Gn(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: Kn(r),
			updatedAt: a
		};
		return Wn = [o, ...Wn], Gn(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = qn.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = Kn(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Wn = Wn.map((n) => n.siteId === e && n.productId === t ? o : n), Gn(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of Hn.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: Kn((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		Wn = Array.from(e.values()), Gn();
	}
};
n("stock", {
	repository: qn,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: Wn }),
	restore: (e) => {
		Wn = e.balances;
	},
	publish: () => Un.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var Jn = /* @__PURE__ */ new Set(), Yn = [];
function Xn() {
	Jn.forEach((e) => e());
}
var Zn = {
	subscribe(e) {
		return Jn.add(e), () => {
			Jn.delete(e);
		};
	},
	getSnapshot() {
		return Yn;
	},
	getAll() {
		return Yn;
	},
	getBalance(e, t) {
		return Yn.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = Zn.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return Yn = Yn.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? Yn.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...Yn], Xn(), e;
	},
	replaceAll(e) {
		Yn = e, Xn();
	},
	clear() {
		Yn = [], Xn();
	}
};
n("costBalances", {
	repository: Zn,
	read: "inventory.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: Yn }),
	restore: (e) => {
		Yn = e.balances;
	},
	publish: () => Jn.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Qn = /* @__PURE__ */ new Set(), L = [];
function $n() {
	Qn.forEach((e) => e());
}
function er() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = L.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function tr(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var nr = {
	subscribe(e) {
		return Qn.add(e), () => {
			Qn.delete(e);
		};
	},
	getSnapshot() {
		return L;
	},
	getAll() {
		return L;
	},
	getByReference(e, t) {
		return L.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return L.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return L.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return L.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return tr(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: er(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = nr.build(e);
		return L = [t, ...L], $n(), t;
	},
	replaceAll(e) {
		L = e, $n();
	},
	clear() {
		L = [], $n();
	}
};
n("costMovements", {
	repository: nr,
	read: "inventory.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: L }),
	restore: (e) => {
		L = e.movements;
	},
	publish: () => Qn.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var rr = /* @__PURE__ */ new Set(), ir = "2026-01-01T00:00:00.000Z", ar = wt.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: ir,
	updatedAt: ir
}));
function or() {
	rr.forEach((e) => e());
}
var sr = {
	subscribe(e) {
		return rr.add(e), () => {
			rr.delete(e);
		};
	},
	getSnapshot() {
		return ar;
	},
	getAll() {
		return ar;
	},
	getByProductId(e) {
		return ar.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = sr.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		let n = {
			...sr.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ar = ar.map((t) => t.productId === e ? n : t), or(), n;
	}
};
n("costingPolicies", {
	repository: sr,
	read: "inventory.read",
	commands: { setActive: "inventory.adjust" },
	snapshot: () => ({ policies: ar }),
	restore: (e) => {
		ar = e.policies;
	},
	publish: () => rr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function R(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function cr(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function z(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function lr({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return cr(e / t);
}
function ur({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return z(e * t);
}
function dr({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = R(e + n), a = z(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : cr(a / i)
	};
}
function fr({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return z(e * t);
}
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function pr(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function mr(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function hr(e, t) {
	let n = O(e);
	if (!n) throw Error("Product was not found.");
	let r = sr.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Tt(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function gr(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = z(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(z(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function _r(e) {
	if (e && nr.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function vr({ movement: e, balance: t }) {
	let n = nr.getAll(), r = Zn.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	nr.replaceAll(i), Zn.replaceAll(a);
}
function yr(e) {
	if (pr(e.quantity), mr(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	_r(e.inventoryMovementId);
	let { policy: t, unit: n } = hr(e.productId, e.unitId), r = R(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = lr({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = ur({
		quantityBase: r,
		unitCostBase: i
	}), o = Zn.getBalance(e.siteId, e.productId);
	o && gr(o, t.baseUnitId);
	let s = dr({
		currentQuantity: o?.quantityOnHand ?? 0,
		currentInventoryValue: o?.inventoryValue ?? 0,
		incomingQuantity: r,
		incomingInventoryValue: a
	}), c = (/* @__PURE__ */ new Date()).toISOString(), l = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityOnHand: s.quantityAfter,
		averageCostPerBaseUnit: s.averageCostAfter,
		inventoryValue: s.inventoryValueAfter,
		costingMethod: t.costingMethod,
		updatedAt: c
	};
	gr(l, t.baseUnitId);
	let u = nr.build({
		movementType: e.movementType ?? "RECEIPT",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: r,
		unitCostBase: i,
		valueChange: a,
		quantityAfter: l.quantityOnHand,
		averageCostAfter: l.averageCostPerBaseUnit,
		inventoryValueAfter: l.inventoryValue,
		referenceType: e.referenceType,
		referenceId: e.referenceId,
		referenceNumber: e.referenceNumber,
		inventoryMovementId: e.inventoryMovementId,
		occurredAt: e.occurredAt,
		notes: e.notes
	});
	return vr({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function br(e) {
	pr(e.quantity), mr(e.occurredAt), _r(e.inventoryMovementId);
	let { policy: t, unit: n } = hr(e.productId, e.unitId), r = R(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Zn.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (gr(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = cr(i.averageCostPerBaseUnit), o = fr({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = R(i.quantityOnHand - r), c = s === 0, l = z(c ? -i.inventoryValue : -o), u = c ? 0 : z(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : cr(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	gr(p, t.baseUnitId);
	let m = nr.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: R(-r),
		unitCostBase: a,
		valueChange: l,
		quantityAfter: p.quantityOnHand,
		averageCostAfter: p.averageCostPerBaseUnit,
		inventoryValueAfter: p.inventoryValue,
		referenceType: e.referenceType,
		referenceId: e.referenceId,
		referenceNumber: e.referenceNumber,
		inventoryMovementId: e.inventoryMovementId,
		occurredAt: e.occurredAt,
		notes: e.notes
	});
	return vr({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function xr(e) {
	if (pr(e.quantityBase), mr(e.occurredAt), _r(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = O(e.productId);
	if (!t) throw Error("Product was not found.");
	let n = sr.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = R(e.quantityBase), i = cr(e.unitCostBase), a = z(e.inventoryValue), o = Zn.getBalance(e.siteId, e.productId);
	o && gr(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = R(s + r), u = z(c + a), d = l === 0 ? 0 : cr(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	gr(p, n.baseUnitId);
	let m = nr.build({
		movementType: "RETURN_IN",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityBase: r,
		unitCostBase: i,
		valueChange: a,
		quantityAfter: p.quantityOnHand,
		averageCostAfter: p.averageCostPerBaseUnit,
		inventoryValueAfter: p.inventoryValue,
		referenceType: e.referenceType,
		referenceId: e.referenceId,
		referenceNumber: e.referenceNumber,
		inventoryMovementId: e.inventoryMovementId,
		occurredAt: e.occurredAt,
		notes: e.notes
	});
	return vr({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function Sr(e) {
	return S.requireBySystemRole(e).id;
}
function Cr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function wr(e) {
	return w.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function Tr(e) {
	let t = nr.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Er = {
	postSalesFulfilment(e) {
		let t = wr(e.id);
		if (t) return t;
		let n = Cr(Tr(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return w.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: Sr("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: Sr("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = wr(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? w.getById(r.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, Dr = /* @__PURE__ */ new Set(), B = [], Or = B;
function kr() {
	Or = B, Dr.forEach((e) => e());
}
function Ar() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = B.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function jr(e, t) {
	return R(B.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function Mr(e) {
	let t = En.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.map((e) => jr(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.every((e, t) => n[t] >= R(e.quantity));
	En.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function Nr(e) {
	let t = nr.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
n("fulfilments", {
	repository: {
		subscribe(e) {
			return Dr.add(e), () => {
				Dr.delete(e);
			};
		},
		getSnapshot() {
			return Or;
		},
		getAll() {
			return Or;
		},
		getById(e) {
			return B.find((t) => t.id === e);
		},
		getBySalesOrder(e) {
			return B.filter((t) => t.salesOrderId === e);
		},
		getFulfilledQuantity: jr,
		getRemainingQuantity(e, t) {
			let n = En.getById(e);
			if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			let r = n.lines.find((e) => e.id === t);
			if (!r) throw Error("Sales order line was not found.");
			return R(r.quantity - jr(e, t));
		},
		create(e) {
			let t = En.getById(e.salesOrderId);
			if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			let n = t;
			if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
			let r = Ln.getById(e.siteId);
			if (!r) throw Error("Inventory site was not found.");
			if (r.status !== "ACTIVE") throw Error("Inventory site is inactive.");
			if (Number.isNaN(Date.parse(e.fulfilmentDate))) throw Error("Fulfilment date is invalid.");
			let i = e.lines.filter((e) => Number.isFinite(e.fulfilledQuantity) && e.fulfilledQuantity > 0);
			if (i.length === 0) throw Error("At least one fulfilment quantity must be greater than zero.");
			let a = /* @__PURE__ */ new Set(), o = i.map((e) => {
				if (a.has(e.salesOrderLineId)) throw Error("A sales order line cannot appear more than once in the same fulfilment.");
				a.add(e.salesOrderLineId);
				let t = n.lines.find((t) => t.id === e.salesOrderLineId);
				if (!t) throw Error("Sales order line was not found.");
				let i = O(t.productId);
				if (!i) throw Error(`Product ${t.sku} was not found.`);
				let o = Tt(t.productId, t.unitId);
				if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
				if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
				let s = R(e.fulfilledQuantity), c = jr(n.id, t.id);
				if (s > R(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
				let l = R(s * o.conversionToBase), u = qn.getBalance(r.id, t.productId);
				if (!u || u.quantityOnHand < l) throw Error(`Insufficient stock for ${t.sku} at ${r.name}.`);
				return {
					orderLine: t,
					product: i,
					unit: o,
					fulfilledQuantity: s,
					fulfilledBaseQuantity: l
				};
			}), s = /* @__PURE__ */ new Map();
			for (let e of o) {
				let t = s.get(e.orderLine.productId) ?? 0;
				s.set(e.orderLine.productId, R(t + e.fulfilledBaseQuantity));
			}
			for (let [e, t] of s) {
				let n = qn.getBalance(r.id, e);
				if (!n || n.quantityOnHand < t) {
					let t = O(e);
					throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
				}
			}
			let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = Ar(), d = o.map((e) => ({
				id: `sfl_${crypto.randomUUID()}`,
				salesOrderLineId: e.orderLine.id,
				productId: e.orderLine.productId,
				unitId: e.orderLine.unitId,
				sku: e.orderLine.sku,
				description: e.orderLine.description,
				unitSymbol: e.orderLine.unitSymbol,
				fulfilledQuantity: e.fulfilledQuantity,
				conversionToBase: e.unit.conversionToBase,
				fulfilledBaseQuantity: e.fulfilledBaseQuantity
			})), f = {
				id: l,
				fulfilmentNumber: u,
				salesOrderId: n.id,
				salesOrderNumber: n.documentNumber,
				customerId: n.customerId,
				siteId: r.id,
				fulfilmentDate: e.fulfilmentDate,
				status: "ACTIVE",
				lines: d,
				notes: e.notes,
				createdAt: c
			};
			for (let t of f.lines) {
				let i = O(t.productId);
				if (!i) throw Error(`Product ${t.sku} was not found.`);
				let a = Hn.create({
					movementType: "SALE",
					siteId: r.id,
					productId: t.productId,
					baseUnitId: i.baseUnitId,
					quantityBase: R(-t.fulfilledBaseQuantity),
					transactionUnitId: t.unitId,
					transactionUnitSymbol: t.unitSymbol,
					transactionQuantity: R(-t.fulfilledQuantity),
					conversionToBase: t.conversionToBase,
					referenceType: "SALES_FULFILMENT",
					referenceId: f.id,
					referenceNumber: f.fulfilmentNumber,
					salesOrderId: n.id,
					salesOrderNumber: n.documentNumber,
					occurredAt: e.fulfilmentDate,
					notes: `Sales fulfilment ${f.fulfilmentNumber}`
				});
				br({
					siteId: r.id,
					productId: t.productId,
					unitId: t.unitId,
					quantity: t.fulfilledQuantity,
					movementType: "ISSUE",
					referenceType: "SALE",
					referenceId: f.id,
					referenceNumber: f.fulfilmentNumber,
					inventoryMovementId: a.id,
					occurredAt: e.fulfilmentDate,
					notes: `Sales fulfilment ${f.fulfilmentNumber}`
				}), qn.issue({
					siteId: r.id,
					productId: t.productId,
					baseUnitId: i.baseUnitId,
					quantityBase: t.fulfilledBaseQuantity
				});
			}
			return Er.postSalesFulfilment(f), B = [f, ...B], kr(), Mr(n.id), f;
		},
		void(e) {
			let t = B.find((t) => t.id === e.fulfilmentId);
			if (!t) throw Error("Sales fulfilment was not found.");
			if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
			if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
			if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
			let n = e.reason.trim();
			if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
			let r = En.getById(t.salesOrderId);
			if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			if (r.status === "INVOICED") throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
			if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
			let i = Nr(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
				let n = O(e.productId);
				if (!n) throw Error(`Product ${e.sku} was not found.`);
				let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
				if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
				return a.add(r.id), {
					line: e,
					product: n,
					originalIssue: r
				};
			});
			Er.reverseSalesFulfilment({
				fulfilment: t,
				reversalDate: e.voidDate,
				reason: n
			});
			for (let r of o) {
				let { line: i, product: a, originalIssue: o } = r, s = Hn.create({
					movementType: "RETURN_IN",
					siteId: t.siteId,
					productId: i.productId,
					baseUnitId: a.baseUnitId,
					quantityBase: i.fulfilledBaseQuantity,
					transactionUnitId: i.unitId,
					transactionUnitSymbol: i.unitSymbol,
					transactionQuantity: i.fulfilledQuantity,
					conversionToBase: i.conversionToBase,
					referenceType: "SALES_FULFILMENT_VOID",
					referenceId: t.id,
					referenceNumber: t.fulfilmentNumber,
					salesOrderId: t.salesOrderId,
					salesOrderNumber: t.salesOrderNumber,
					occurredAt: e.voidDate,
					notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
				});
				xr({
					siteId: t.siteId,
					productId: i.productId,
					quantityBase: i.fulfilledBaseQuantity,
					unitCostBase: o.unitCostBase,
					inventoryValue: z(Math.abs(o.valueChange)),
					referenceType: "SALE",
					referenceId: t.id,
					referenceNumber: t.fulfilmentNumber,
					inventoryMovementId: s.id,
					occurredAt: e.voidDate,
					notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
				}), qn.receive({
					siteId: t.siteId,
					productId: i.productId,
					baseUnitId: a.baseUnitId,
					quantityBase: i.fulfilledBaseQuantity
				});
			}
			let s = {
				...t,
				status: "VOIDED",
				voidedAt: (/* @__PURE__ */ new Date()).toISOString(),
				voidDate: e.voidDate,
				voidReason: n
			};
			return B = B.map((e) => e.id === s.id ? s : e), kr(), Mr(t.salesOrderId), s;
		}
	},
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: B }),
	restore: (e) => {
		B = e.fulfilments, Or = B;
	},
	publish: () => Dr.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var Pr = [
	{
		id: "sup_001",
		code: "SUP-0001",
		businessName: "Melbourne Flooring Wholesale Pty Ltd",
		tradingName: "Melbourne Flooring Wholesale",
		abn: "51 234 567 890",
		status: "ACTIVE",
		email: "accounts@melbourneflooring.com.au",
		phone: "03 9000 2100",
		website: "https://melbourneflooring.com.au",
		contactName: "Michael Chen",
		addressLine1: "18 Trade Park Drive",
		suburb: "Dandenong South",
		state: "VIC",
		postcode: "3175",
		country: "Australia",
		paymentTermsDays: 30,
		currency: "AUD",
		taxRegistered: !0,
		notes: "Primary flooring materials supplier.",
		createdAt: "2026-01-15T01:00:00.000Z",
		updatedAt: "2026-01-15T01:00:00.000Z"
	},
	{
		id: "sup_002",
		code: "SUP-0002",
		businessName: "Australian Timber Supply Pty Ltd",
		tradingName: "Australian Timber Supply",
		abn: "72 345 678 901",
		status: "ACTIVE",
		email: "sales@australiantimber.com.au",
		phone: "03 9000 3200",
		contactName: "Sarah Wilson",
		addressLine1: "42 Industrial Avenue",
		suburb: "Campbellfield",
		state: "VIC",
		postcode: "3061",
		country: "Australia",
		paymentTermsDays: 30,
		currency: "AUD",
		taxRegistered: !0,
		createdAt: "2026-02-10T01:00:00.000Z",
		updatedAt: "2026-02-10T01:00:00.000Z"
	},
	{
		id: "sup_003",
		code: "SUP-0003",
		businessName: "Flooring Accessories Direct",
		status: "INACTIVE",
		email: "orders@flooringaccessories.com.au",
		country: "Australia",
		paymentTermsDays: 14,
		currency: "AUD",
		taxRegistered: !0,
		createdAt: "2026-03-05T01:00:00.000Z",
		updatedAt: "2026-03-05T01:00:00.000Z"
	}
], Fr = "htt.mock.contacts.suppliers.v1";
function Ir(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Lr = s(Fr, Ir), Rr = Lr.status !== "invalid" && l(Fr), zr = /* @__PURE__ */ new Set(), Br = Lr.status === "ok" ? Lr.data : structuredClone(Pr);
function Vr() {
	Rr && c(Fr, Br), zr.forEach((e) => {
		e();
	});
}
function Hr(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Ur() {
	let e = Br.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function Wr(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Gr(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Kr(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: Wr(e.tradingName),
		abn: Gr(e.abn),
		status: e.status,
		email: Wr(e.email),
		phone: Wr(e.phone),
		website: Wr(e.website),
		contactName: Wr(e.contactName),
		addressLine1: Wr(e.addressLine1),
		addressLine2: Wr(e.addressLine2),
		suburb: Wr(e.suburb),
		state: Wr(e.state),
		postcode: Wr(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: Wr(e.notes)
	};
}
var qr = {
	subscribe(e) {
		return zr.add(e), () => {
			zr.delete(e);
		};
	},
	getSnapshot() {
		return Br;
	},
	getAll() {
		return Br;
	},
	getById(e) {
		return Br.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Hr("sup"),
			code: Ur(),
			...Kr(e),
			currency: "AUD",
			createdAt: t,
			updatedAt: t
		};
		return Br = [n, ...Br], Vr(), n;
	},
	update(e, t) {
		let n = qr.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...Kr(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Br = Br.map((t) => t.id === e ? r : t), Vr(), r;
	}
};
n("suppliers", {
	repository: qr,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: Br }),
	restore: (e) => {
		Br = e.suppliers;
	},
	publish: () => zr.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
var Jr = .1;
function Yr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Xr({ orderedQuantity: e, unitCost: t }) {
	let n = Yr(e * t), r = Yr(n * Jr);
	return {
		lineSubtotal: n,
		taxAmount: r,
		lineTotal: Yr(n + r)
	};
}
function Zr(e) {
	let t = Yr(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Yr(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Yr(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var Qr = /* @__PURE__ */ new Set(), V = y.read().purchaseOrders;
y.onRollback(() => {
	V = y.read().purchaseOrders;
});
function $r() {
	try {
		y.update("purchaseOrders", V);
	} catch (e) {
		throw V = y.read().purchaseOrders, e;
	}
	Qr.forEach((e) => y.notify(e));
}
function ei(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function ti(e) {
	return e.slice(0, 4);
}
function ni(e) {
	let t = ti(e), n = RegExp(`^PO-${t}-(\\d+)$`), r = V.map((e) => {
		let t = e.purchaseOrderNumber.match(n);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `PO-${t}-${(Math.max(0, ...r) + 1).toString().padStart(4, "0")}`;
}
function ri(e) {
	return e?.trim() || void 0;
}
function ii(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = wt.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		let r = Xr({
			orderedQuantity: e.orderedQuantity,
			unitCost: e.unitCost
		});
		return {
			id: ei("pol"),
			productId: t.id,
			unitId: n.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: n.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: e.unitCost,
			...r
		};
	});
}
function ai(e) {
	let t = qr.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function oi(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var H = {
	subscribe(e) {
		return Qr.add(e), () => {
			Qr.delete(e);
		};
	},
	getSnapshot() {
		return V;
	},
	getAll() {
		return V;
	},
	getById(e) {
		return V.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return V.filter((t) => t.supplierId === e);
	},
	create(e) {
		oi(e);
		let t = ai(e.supplierId), n = ii(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: ei("po"),
			purchaseOrderNumber: ni(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: ri(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: ri(e.supplierReference),
			notes: ri(e.notes),
			lines: n,
			totals: Zr(n),
			createdAt: r,
			updatedAt: r
		};
		return V = [i, ...V], $r(), i;
	},
	updateDraft(e, t) {
		let n = H.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		oi(t);
		let r = ai(t.supplierId), i = ii(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: ri(t.expectedDeliveryDate),
			supplierReference: ri(t.supplierReference),
			notes: ri(t.notes),
			lines: i,
			totals: Zr(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((e) => e.id === n.id ? a : e), $r(), a;
	},
	approve(e) {
		let t = H.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return si(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = H.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return si(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = H.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(n.status)) throw Error("This purchase order cannot receive goods.");
		if (t.length === 0) throw Error("At least one received line is required.");
		let r = /* @__PURE__ */ new Map();
		for (let e of t) {
			if (!Number.isFinite(e.receivedQuantity) || e.receivedQuantity <= 0) throw Error("Received quantity must be greater than zero.");
			if (r.has(e.purchaseOrderLineId)) throw Error("Duplicate purchase order receipt line.");
			r.set(e.purchaseOrderLineId, e.receivedQuantity);
		}
		let i = n.lines.map((e) => {
			let t = r.get(e.id);
			if (t === void 0) return e;
			let n = Math.round((e.receivedQuantity + t + 2 ** -52) * 1e4) / 1e4;
			if (n > e.orderedQuantity) throw Error(`${e.description} cannot be received above the ordered quantity.`);
			return {
				...e,
				receivedQuantity: n
			};
		});
		for (let e of t) if (!n.lines.some((t) => t.id === e.purchaseOrderLineId)) throw Error("Purchase order receipt line was not found.");
		let a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = {
			...n,
			lines: i,
			status: a ? "RECEIVED" : "PARTIALLY_RECEIVED",
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((e) => e.id === n.id ? o : e), $r(), o;
	},
	recordSupplierBill(e, t) {
		let n = H.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(n.status)) throw Error("This purchase order cannot be billed.");
		if (t.length === 0) throw Error("At least one billed line is required.");
		let r = /* @__PURE__ */ new Map();
		for (let e of t) {
			if (!Number.isFinite(e.billedQuantity) || e.billedQuantity <= 0) throw Error("Billed quantity must be greater than zero.");
			if (r.has(e.purchaseOrderLineId)) throw Error("Duplicate purchase order bill line.");
			r.set(e.purchaseOrderLineId, e.billedQuantity);
		}
		let i = n.lines.map((e) => {
			let t = r.get(e.id);
			if (t === void 0) return e;
			let n = ci(e.billedQuantity + t);
			if (n > e.receivedQuantity) throw Error(`${e.description} cannot be billed above the received quantity.`);
			return {
				...e,
				billedQuantity: n
			};
		});
		for (let e of t) if (!n.lines.some((t) => t.id === e.purchaseOrderLineId)) throw Error("Purchase order bill line was not found.");
		let a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((e) => e.id === n.id ? c : e), $r(), c;
	},
	reverseSupplierBill(e, t) {
		let n = H.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (t.length === 0) throw Error("At least one supplier bill line is required.");
		let r = /* @__PURE__ */ new Map();
		for (let e of t) {
			if (!Number.isFinite(e.billedQuantity) || e.billedQuantity <= 0) throw Error("Billed quantity must be greater than zero.");
			if (r.has(e.purchaseOrderLineId)) throw Error("Duplicate purchase order bill line.");
			r.set(e.purchaseOrderLineId, e.billedQuantity);
		}
		for (let e of t) {
			let t = n.lines.find((t) => t.id === e.purchaseOrderLineId);
			if (!t) throw Error("Purchase order bill line was not found.");
			if (e.billedQuantity > t.billedQuantity) throw Error(`${t.description} does not contain enough billed quantity to reverse this supplier bill.`);
		}
		let i = n.lines.map((e) => {
			let t = r.get(e.id);
			return t === void 0 ? e : {
				...e,
				billedQuantity: ci(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((e) => e.id === n.id ? c : e), $r(), c;
	},
	cancel(e, t) {
		let n = H.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return si(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function si(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return V = V.map((t) => t.id === e.id ? n : t), $r(), n;
}
function ci(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
n("purchaseOrders", {
	repository: H,
	read: "purchases.read",
	commands: {
		catch: null,
		if: null,
		create: "purchases.write",
		updateDraft: "purchases.write",
		approve: "purchases.write",
		send: "purchases.write",
		recordGoodsReceipt: null,
		recordSupplierBill: null,
		reverseSupplierBill: null,
		emitChange: null,
		return: null,
		cancel: "purchases.write"
	},
	snapshot: () => ({ purchaseOrders: V }),
	restore: (e) => {
		V = e.purchaseOrders;
	},
	publish: () => Qr.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function li(e) {
	return z(e.lines.reduce((e, t) => {
		let n = lr({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + ur({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function ui(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function di(e) {
	return S.requireBySystemRole(e).id;
}
function fi(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: "Pacific/Auckland",
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function pi(e, t) {
	return w.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function mi(e, t) {
	let n = pi(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var hi = {
	validateGoodsReceiptPosting(e) {
		let t = S.requireBySystemRole("INVENTORY"), n = S.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = li(e);
		if (!Number.isFinite(r) || r <= 0) throw Error("Goods receipt accounting value must be greater than zero.");
		let i = /* @__PURE__ */ new Date(`${e.receiptDate}T00:00:00Z`);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(e.receiptDate) || Number.isNaN(i.getTime()) || i.toISOString().slice(0, 10) !== e.receiptDate) throw Error("Goods receipt accounting date is invalid.");
		return {
			inventoryAccountId: t.id,
			grniAccountId: n.id,
			receiptValue: r
		};
	},
	postGoodsReceipt(e) {
		let t = w.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return w.post({
			journalDate: e.receiptDate,
			description: `Goods receipt ${e.receiptNumber}`,
			reference: e.receiptNumber,
			sourceType: "GOODS_RECEIPT",
			sourceId: e.id,
			lines: [{
				accountId: n,
				description: `Inventory received - ${e.receiptNumber}`,
				debit: i,
				credit: 0
			}, {
				accountId: r,
				description: `Goods received not invoiced - ${e.receiptNumber}`,
				debit: 0,
				credit: i
			}]
		});
	},
	validateSupplierBillPosting(e, t = e.totals.subtotal) {
		let n = S.requireBySystemRole("GRNI"), r = S.requireBySystemRole("GST_RECEIVABLE"), i = S.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = ui(e.totals.subtotal - t);
		if (a !== 0) {
			let e = S.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = ui(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = pi("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return w.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: di("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				{
					accountId: di("GST_RECEIVABLE"),
					description: `GST - ${e.billNumber}`,
					debit: e.totals.taxAmount,
					credit: 0
				},
				...i === 0 ? [] : [{
					accountId: di("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: di("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = mi("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: fi(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = pi("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = rn.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return w.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: di("ACCOUNTS_PAYABLE"),
				description: e.paymentNumber,
				debit: e.amount,
				credit: 0
			}, {
				accountId: n.glAccountId,
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reverseSupplierPayment(e) {
		let t = mi("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: fi(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return pi("SUPPLIER_CREDIT", e.id) || w.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: di("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: di("INVENTORY"),
					description: e.creditNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				{
					accountId: di("GST_RECEIVABLE"),
					description: e.creditNumber,
					debit: 0,
					credit: e.totals.taxAmount
				}
			]
		});
	},
	reverseSupplierCredit(e) {
		let t = mi("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: fi(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, gi = /* @__PURE__ */ new Set(), U = y.read().goodsReceipts;
y.onRollback(() => {
	U = y.read().goodsReceipts;
});
function _i() {
	try {
		y.update("goodsReceipts", U);
	} catch (e) {
		throw U = y.read().goodsReceipts, e;
	}
	gi.forEach((e) => y.notify(e));
}
function vi(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function yi(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = U.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function bi(e) {
	return e?.trim() || void 0;
}
var xi = {
	subscribe(e) {
		return gi.add(e), () => {
			gi.delete(e);
		};
	},
	getSnapshot() {
		return U;
	},
	getAll() {
		return U;
	},
	getById(e) {
		return U.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return U.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = H.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = Ln.getById(e.siteId);
		if (!n) throw Error("Inventory site was not found.");
		if (n.status !== "ACTIVE") throw Error("Goods cannot be received into an inactive site.");
		if (!e.receiptDate) throw Error("Receipt date is required.");
		let r = e.lines.filter((e) => Number.isFinite(e.receivedQuantity) && e.receivedQuantity > 0);
		if (r.length === 0) throw Error("Enter a received quantity for at least one purchase order line.");
		let i = /* @__PURE__ */ new Set(), a = r.map((e) => {
			if (i.has(e.purchaseOrderLineId)) throw Error("A purchase order line cannot appear more than once in the same receipt.");
			i.add(e.purchaseOrderLineId);
			let n = t.lines.find((t) => t.id === e.purchaseOrderLineId);
			if (!n) throw Error("Purchase order line was not found.");
			let r = vi(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!O(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Tt(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = vi(e.receivedQuantity * a.conversionToBase);
			return {
				id: `grl_${crypto.randomUUID()}`,
				purchaseOrderLineId: n.id,
				productId: n.productId,
				unitId: n.unitId,
				sku: n.sku,
				description: n.description,
				unitSymbol: n.unitSymbol,
				receivedQuantity: e.receivedQuantity,
				conversionToBase: a.conversionToBase,
				receivedBaseQuantity: o,
				unitCost: n.unitCost
			};
		}), o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: `gr_${crypto.randomUUID()}`,
			receiptNumber: yi(e.receiptDate),
			purchaseOrderId: t.id,
			purchaseOrderNumber: t.purchaseOrderNumber,
			supplierId: t.supplierId,
			supplierCode: t.supplierCode,
			supplierName: t.supplierName,
			siteId: n.id,
			siteCode: n.code,
			siteName: n.name,
			receiptDate: e.receiptDate,
			status: "POSTED",
			supplierDeliveryReference: bi(e.supplierDeliveryReference),
			notes: bi(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		hi.validateGoodsReceiptPosting(s), v();
		let c = _.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return _.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = O(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				_.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = Hn.create({
						movementType: "GOODS_RECEIPT",
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity,
						transactionUnitId: r.unitId,
						transactionUnitSymbol: r.unitSymbol,
						transactionQuantity: r.receivedQuantity,
						conversionToBase: r.conversionToBase,
						referenceType: "GOODS_RECEIPT",
						referenceId: s.id,
						referenceNumber: s.receiptNumber,
						purchaseOrderId: t.id,
						purchaseOrderNumber: t.purchaseOrderNumber,
						occurredAt: e.receiptDate,
						notes: `Goods receipt ${s.receiptNumber}`
					});
					l.set(r.id, a.id);
				}), _.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					yr({
						siteId: n.id,
						productId: r.productId,
						unitId: r.unitId,
						quantity: r.receivedQuantity,
						transactionUnitCost: r.unitCost,
						movementType: "RECEIPT",
						referenceType: "GOODS_RECEIPT",
						referenceId: s.id,
						referenceNumber: s.receiptNumber,
						inventoryMovementId: t,
						occurredAt: e.receiptDate,
						notes: `Goods receipt ${s.receiptNumber}`
					});
				}), _.runStep(c, `STOCK:${r.id}`, () => {
					qn.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			_.runStep(c, "JOURNAL", () => {
				hi.postGoodsReceipt(s);
			}), _.runStep(c, "PURCHASE_ORDER", () => {
				H.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), _.runStep(c, "RECEIPT", () => {
				U = [s, ...U], _i();
			});
		}), _.recover(c), s;
	}
};
n("goodsReceipts", {
	repository: xi,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: U }),
	restore: (e) => {
		U = e.goodsReceipts;
	},
	publish: () => gi.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var Si = 1e-4;
function W(e) {
	return z(e);
}
function Ci(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - R(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function wi(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Ti(e, t, n) {
	let r = lr({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return ur({
		quantityBase: R(e * n),
		unitCostBase: r
	});
}
function Ei(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = R(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = R(e.receivedQuantity - t);
		if (a < -1e-4) throw Error(`Goods Receipt ${n.receiptNumber} has been overmatched.`);
		r.push({
			goodsReceiptId: n.id,
			goodsReceiptLineId: e.id,
			purchaseOrderId: n.purchaseOrderId,
			purchaseOrderLineId: e.purchaseOrderLineId,
			productId: e.productId,
			receiptDate: n.receiptDate,
			receivedQuantity: e.receivedQuantity,
			conversionToBase: e.conversionToBase,
			receiptUnitCost: e.unitCost,
			matchedQuantity: t,
			availableQuantity: Math.max(0, a)
		});
	}
	let a = new Map(t.map((e) => [e.id, e.receiptNumber]));
	return r.sort((e, t) => {
		let n = e.receiptDate.localeCompare(t.receiptDate);
		if (n !== 0) return n;
		let r = (a.get(e.goodsReceiptId) ?? "").localeCompare(a.get(t.goodsReceiptId) ?? "");
		if (r !== 0) return r;
		let i = e.goodsReceiptId.localeCompare(t.goodsReceiptId);
		return i === 0 ? e.goodsReceiptLineId.localeCompare(t.goodsReceiptLineId) : i;
	});
}
function Di(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = Ei(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), Ci(e.quantity), wi(e.billUnitCost);
		let r = R(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > Si);
		if (R(d.reduce((e, t) => e + t.availableQuantity, 0)) + Si < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= Si) break;
			let s = R(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = R(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = ur({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: lr({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = W(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), ee = Math.abs(o.availableQuantity - s) <= Si ? W(p - m) : Ti(s, o.receiptUnitCost, o.conversionToBase);
			if (ee < 0) throw Error("Receipt cost has been overallocated.");
			let h = W(s * e.billUnitCost), g = W(h - ee);
			u.push({
				id: crypto.randomUUID(),
				supplierBillId: t,
				supplierBillLineId: e.supplierBillLineId,
				goodsReceiptId: o.goodsReceiptId,
				goodsReceiptLineId: o.goodsReceiptLineId,
				purchaseOrderId: n,
				purchaseOrderLineId: e.purchaseOrderLineId,
				productId: e.productId,
				matchedQuantity: s,
				matchedBaseQuantity: d,
				receiptUnitCost: o.receiptUnitCost,
				matchedReceiptValue: ee,
				billUnitCost: e.billUnitCost,
				matchedBillValue: h,
				priceVariance: g,
				status: "ACTIVE",
				createdAt: l
			}), o.availableQuantity = R(o.availableQuantity - s), r = R(r - s);
		}
		if (r > Si) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = W(W(e.quantity * e.billUnitCost) - W(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = W(p.matchedBillValue + f), p.priceVariance = W(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = R(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = R(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = W(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = W(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: W(p - f)
	};
}
var Oi = {
	calculate: Di,
	getAvailableReceiptLines(e, t, n) {
		return Ei(e, t, n);
	}
}, G = y.read().receiptMatches;
y.onRollback(() => {
	G = y.read().receiptMatches;
});
var ki = /* @__PURE__ */ new Set(), Ai = () => {
	try {
		y.update("receiptMatches", G);
	} catch (e) {
		throw G = y.read().receiptMatches, e;
	}
	ki.forEach((e) => y.notify(e));
}, ji = {
	getAll() {
		return [...G];
	},
	subscribe(e) {
		return ki.add(e), () => {
			ki.delete(e);
		};
	},
	getSnapshot() {
		return G;
	},
	getByBill(e) {
		return G.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (G.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		G = [...G, ...t], Ai();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		G = G.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), Ai();
	}
};
n("receiptMatches", {
	repository: ji,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: G }),
	restore: (e) => {
		G = e.matches;
	},
	publish: () => ki.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
var Mi = .1;
function Ni(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Pi({ quantity: e, unitCost: t }) {
	let n = Ni(e * t), r = Ni(n * Mi);
	return {
		lineSubtotal: n,
		taxAmount: r,
		lineTotal: Ni(n + r)
	};
}
function Fi(e) {
	let t = Ni(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Ni(e.reduce((e, t) => e + t.taxAmount, 0)), r = Ni(t + n);
	return {
		subtotal: t,
		taxAmount: n,
		total: r,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: r
	};
}
//#endregion
//#region src/features/purchases/data/supplierBillRepository.ts
var Ii = /* @__PURE__ */ new Set(), K = y.read().supplierBills;
y.onRollback(() => {
	K = y.read().supplierBills;
});
function Li() {
	try {
		y.update("supplierBills", K);
	} catch (e) {
		throw K = y.read().supplierBills, e;
	}
	Ii.forEach((e) => y.notify(e));
}
function Ri(e) {
	return e?.trim() || void 0;
}
function zi(e) {
	let t = `BILL-${e.slice(0, 4)}-`, n = K.filter((e) => e.billNumber.startsWith(t)).map((e) => Number.parseInt(e.billNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
var Bi = {
	subscribe(e) {
		return Ii.add(e), () => {
			Ii.delete(e);
		};
	},
	getSnapshot() {
		return K;
	},
	getAll() {
		return K;
	},
	getById(e) {
		return K.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return K.filter((t) => t.supplierId === e);
	},
	applyPayment(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = q(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = q(n.totals.amountPaid + r), a = q(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), Li(), o;
	},
	reversePayment(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = q(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = q(Math.max(0, n.totals.amountPaid - r)), a = q(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), Li(), o;
	},
	applyCredit(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = q(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = q(n.totals.amountCredited + r), a = q(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), Li(), o;
	},
	reverseCredit(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = q(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = q(Math.max(0, n.totals.amountCredited - r)), a = q(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), Li(), o;
	},
	markVoid(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if (ji.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...n,
			status: "VOID",
			voidedAt: a,
			voidReason: r,
			updatedAt: a
		};
		v();
		let s = _.begin("SUPPLIER_BILL_VOID", n.id).key;
		return _.registerRecovery(s, () => {
			_.runStep(s, "REVERSAL_JOURNAL", () => {
				hi.reverseSupplierBill(o);
			}), _.runStep(s, "PURCHASE_ORDER", () => {
				H.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), _.runStep(s, "MATCHES", () => {
				ji.reverseForBill(n.id, r, i(a));
			}), _.runStep(s, "BILL", () => {
				K = K.map((e) => e.id === n.id ? o : e), Li();
			});
		}), _.recover(s), o;
	},
	getByPurchaseOrder(e) {
		return K.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = H.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (K.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
		if (!e.billDate) throw Error("Bill date is required.");
		if (!e.dueDate) throw Error("Due date is required.");
		if (e.dueDate < e.billDate) throw Error("Due date cannot be before bill date.");
		let r = e.lines.filter((e) => Number.isFinite(e.quantity) && e.quantity > 0);
		if (r.length === 0) throw Error("Enter a bill quantity for at least one line.");
		let i = /* @__PURE__ */ new Set(), a = r.map((e) => {
			if (i.has(e.purchaseOrderLineId)) throw Error("A purchase order line cannot appear more than once on the same bill.");
			i.add(e.purchaseOrderLineId);
			let n = t.lines.find((t) => t.id === e.purchaseOrderLineId);
			if (!n) throw Error("Purchase order line was not found.");
			if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error(`${n.description}: unit cost is invalid.`);
			let r = Vi(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = Pi({
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return {
				id: `bill_line_${crypto.randomUUID()}`,
				purchaseOrderLineId: n.id,
				productId: n.productId,
				unitId: n.unitId,
				sku: n.sku,
				description: n.description,
				unitSymbol: n.unitSymbol,
				quantity: e.quantity,
				unitCost: e.unitCost,
				...a
			};
		}), o = Fi(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: zi(e.billDate),
			supplierInvoiceNumber: n,
			supplierId: t.supplierId,
			supplierCode: t.supplierCode,
			supplierName: t.supplierName,
			purchaseOrderId: t.id,
			purchaseOrderNumber: t.purchaseOrderNumber,
			billDate: e.billDate,
			dueDate: e.dueDate,
			status: "OPEN",
			lines: a,
			totals: o,
			notes: Ri(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Oi.calculate({
			supplierBillId: c.id,
			purchaseOrderId: c.purchaseOrderId,
			requests: c.lines.map((e) => ({
				supplierBillId: c.id,
				supplierBillLineId: e.id,
				purchaseOrderId: c.purchaseOrderId,
				purchaseOrderLineId: e.purchaseOrderLineId,
				productId: e.productId,
				quantity: e.quantity,
				billUnitCost: e.unitCost
			})),
			receipts: xi.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: ji.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		hi.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), v();
		let u = _.begin("SUPPLIER_BILL", c.id).key;
		return _.registerRecovery(u, () => {
			_.runStep(u, "JOURNAL", () => {
				hi.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), _.runStep(u, "PURCHASE_ORDER", () => {
				H.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), _.runStep(u, "MATCHES", () => {
				ji.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), _.runStep(u, "BILL", () => {
				K = [c, ...K], Li();
			});
		}), _.recover(u), c;
	}
};
function Vi(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function q(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
n("supplierBills", {
	repository: Bi,
	read: "purchases.read",
	commands: {
		catch: null,
		applyPayment: null,
		reversePayment: null,
		applyCredit: null,
		reverseCredit: null,
		markVoid: "purchases.void",
		create: "purchases.bill",
		return: null
	},
	snapshot: () => ({ supplierBills: K }),
	restore: (e) => {
		K = e.supplierBills;
	},
	publish: () => Ii.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierPaymentRepository.ts
var Hi = /* @__PURE__ */ new Set(), J = y.read().supplierPayments;
y.onRollback(() => {
	J = y.read().supplierPayments;
});
function Ui() {
	y.update("supplierPayments", J), Hi.forEach((e) => y.notify(e));
}
var Wi = {
	subscribe(e) {
		return Hi.add(e), () => {
			Hi.delete(e);
		};
	},
	getSnapshot() {
		return J;
	},
	getAll() {
		return J;
	},
	getById(e) {
		return J.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return J.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return J.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: Ki(e.reference),
			notes: Ki(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: qi(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = J.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (a(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = qr.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = rn.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let o = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (o.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let s = /* @__PURE__ */ new Set(), c = o.map((t) => {
			if (s.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			s.add(t.supplierBillId);
			let n = Bi.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = qi(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${Ji(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), l = qi(c.reduce((e, t) => e + t.amount, 0));
		if (l <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of c) Bi.applyPayment(e.supplierBillId, e.amount);
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: Gi(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: l,
			method: e.method,
			bankAccountId: i.id,
			reference: Ki(e.reference),
			notes: Ki(e.notes),
			allocations: c,
			status: "POSTED",
			createdAt: u,
			updatedAt: u
		};
		return J = [d, ...J], Ui(), hi.postSupplierPayment(d), d;
	},
	reverse(e, t) {
		let n = J.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = Bi.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) Bi.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return J = J.map((t) => t.id === e ? a : t), Ui(), hi.reverseSupplierPayment(a), a;
	}
};
function Gi(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = J.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Ki(e) {
	return e?.trim() || void 0;
}
function qi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ji(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD"
	}).format(e);
}
var Yi = Wi.create;
Wi.create = function(...e) {
	return v(), y.transaction(() => Yi.apply(Wi, e));
};
var Xi = Wi.reverse;
Wi.reverse = function(...e) {
	return v(), y.transaction(() => Xi.apply(Wi, e));
}, n("supplierPayments", {
	repository: Wi,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: J }),
	restore: (e) => {
		J = e.supplierPayments;
	},
	publish: () => Hi.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var Zi = /* @__PURE__ */ new Set(), Y = y.read().supplierCredits, X = y.read().supplierCreditAllocations, Qi = y.read().supplierCredits, $i = y.read().supplierCreditAllocations;
y.onRollback(() => {
	Y = y.read().supplierCredits, X = y.read().supplierCreditAllocations, Qi = Y, $i = X;
});
function ea() {
	y.update("supplierCredits", Y), y.update("supplierCreditAllocations", X), Qi = [...Y], $i = [...X], Zi.forEach((e) => y.notify(e));
}
var Z = {
	subscribe(e) {
		return Zi.add(e), () => {
			Zi.delete(e);
		};
	},
	getSnapshot() {
		return Qi;
	},
	getAllocationSnapshot() {
		return $i;
	},
	getAll() {
		return Qi;
	},
	getAllAllocations() {
		return $i;
	},
	getById(e) {
		return Y.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Y.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return Y.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return X.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return X.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return X.filter((t) => t.supplierBillId === e);
	},
	create(e) {
		let t = Bi.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (Y.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!ia(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, t) => {
			let n = i.get(e.supplierBillLineId);
			if (!n) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(n.id)) throw Error(`${n.description} appears more than once in the supplier credit.`);
			a.add(n.id);
			let r = aa(e.quantity);
			if (!Number.isFinite(r) || r <= 0) throw Error(`${n.description} credit quantity must be greater than zero.`);
			if (r > n.quantity) throw Error(`${n.description} credit quantity cannot exceed the source bill quantity.`);
			let o = Q(e.unitCost);
			if (!Number.isFinite(o) || o < 0) throw Error(`${n.description} unit cost cannot be negative.`);
			if (o > n.unitCost) throw Error(`${n.description} credit unit cost cannot exceed the source bill unit cost.`);
			let s = Q(r * o), c = Q(s * .1), l = Q(s + c);
			return {
				id: ra(`supplier-credit-line-${t + 1}`),
				purchaseOrderLineId: n.purchaseOrderLineId,
				supplierBillLineId: n.id,
				productId: n.productId,
				unitId: n.unitId,
				sku: n.sku,
				description: n.description,
				unitSymbol: n.unitSymbol,
				quantity: r,
				unitCost: o,
				lineSubtotal: s,
				taxAmount: c,
				lineTotal: l
			};
		}), s = Q(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = Q(o.reduce((e, t) => e + t.taxAmount, 0)), l = Q(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (Q(Q(Y.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > Q(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: ra("supplier-credit"),
			creditNumber: na(e.creditDate),
			supplierCreditNumber: n,
			supplierId: t.supplierId,
			supplierCode: t.supplierCode,
			supplierName: t.supplierName,
			sourceSupplierBillId: t.id,
			sourceSupplierBillNumber: t.billNumber,
			creditDate: e.creditDate,
			status: "ISSUED",
			reason: r,
			lines: o,
			totals: {
				subtotal: s,
				taxAmount: c,
				total: l
			},
			amountApplied: 0,
			amountAvailable: l,
			issuedAt: u,
			createdAt: u,
			updatedAt: u
		};
		return Y = [d, ...Y], ea(), hi.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = Y.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = Bi.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!ia(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = Q(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: ra("supplier-credit-allocation"),
			allocationNumber: ta(e.allocationDate),
			supplierId: t.supplierId,
			supplierCreditId: t.id,
			supplierBillId: n.id,
			supplierBillNumber: n.billNumber,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: i,
			updatedAt: i
		};
		Bi.applyCredit(n.id, r);
		let o = Q(t.amountApplied + r), s = Q(Math.max(0, t.totals.total - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return X = [a, ...X], Y = Y.map((e) => e.id === t.id ? c : e), ea(), a;
	},
	reverseAllocation(e) {
		let t = X.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = Y.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = Bi.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		Bi.reverseCredit(i.id, t.amount);
		let o = Q(Math.max(0, r.amountApplied - t.amount)), s = Q(Math.max(0, r.totals.total - o)), c = {
			...r,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: a
		}, l = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		};
		return Y = Y.map((e) => e.id === r.id ? c : e), X = X.map((e) => e.id === t.id ? l : e), ea(), l;
	},
	voidCredit(e) {
		let t = Y.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (X.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return Y = Y.map((e) => e.id === t.id ? i : e), ea(), hi.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!X.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return X = X.map((t) => t.id === e.id ? e : t), ea(), e;
	},
	update(e) {
		if (!Y.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return Y = Y.map((t) => t.id === e.id ? e : t), ea(), e;
	}
};
function ta(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = X.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function na(e) {
	let t = `SC-${e.slice(0, 4)}-`, n = Y.filter((e) => e.creditNumber.startsWith(t)).map((e) => Number.parseInt(e.creditNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function ra(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function ia(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function Q(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function aa(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var oa = Z.create;
Z.create = function(...e) {
	return v(), y.transaction(() => oa.apply(Z, e));
};
var sa = Z.applyToBill;
Z.applyToBill = function(...e) {
	return v(), y.transaction(() => sa.apply(Z, e));
};
var ca = Z.reverseAllocation;
Z.reverseAllocation = function(...e) {
	return v(), y.transaction(() => ca.apply(Z, e));
};
var la = Z.voidCredit;
Z.voidCredit = function(...e) {
	return v(), y.transaction(() => la.apply(Z, e));
};
var ua = Z.update;
Z.update = function(...e) {
	return v(), y.transaction(() => ua.apply(Z, e));
};
var da = Z.updateAllocation;
Z.updateAllocation = function(...e) {
	return v(), y.transaction(() => da.apply(Z, e));
}, n("supplierCredits", {
	repository: Z,
	read: "purchases.read",
	commands: {
		create: "purchases.bill",
		applyToBill: "purchases.bill",
		reverseAllocation: "purchases.void",
		voidCredit: "purchases.void",
		updateAllocation: null,
		update: null,
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		supplierCredits: Y,
		allocations: X
	}),
	restore: (e) => {
		Y = e.supplierCredits, X = e.allocations, Qi = [...Y], $i = [...X];
	},
	publish: () => Zi.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchasePostingRecoveryAuthorization.ts
var fa = null, pa = {
	configureTrustedSession(e) {
		fa = e;
	},
	clear() {
		fa = null;
	},
	current() {
		return fa?.() ?? null;
	},
	canRecover() {
		let e = this.current();
		return !!(e?.authenticated && e.userId.trim() && e.roles.some((e) => e === "FINANCE_ADMIN" || e === "ADMIN"));
	},
	requireRecoveryPermission() {
		let e = this.current();
		if (!e?.authenticated || !e.userId.trim() || !e.roles.some((e) => e === "FINANCE_ADMIN" || e === "ADMIN")) throw Error("Recovery requires an authenticated finance administrator or administrator.");
		return e;
	}
}, ma = "htt.purchasePosting.manualRecoveryAudit.v1";
function ha() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(ma) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var ga = ha();
function _a(e) {
	ga.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(ma, JSON.stringify(ga));
	} catch {}
}
n("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return ga.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = _.get(e);
			return pa.canRecover() && t?.status === "RECOVERY_REQUIRED" && _.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = pa.requireRecoveryPermission(), n = _.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!_.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				_.recover(e), _a({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw _a({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "ERROR",
					message: String(n)
				}), n;
			}
		}
	},
	read: "audit.read",
	commands: { recover: "accounting.recover" },
	snapshot: () => ga,
	restore: (e) => {
		ga.splice(0, ga.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/contacts/data/mockCustomers.ts
var va = [
	{
		id: "cus_001",
		code: "CUST-0001",
		businessName: "ABC Flooring Pty Ltd",
		tradingName: "ABC Flooring",
		abn: "12 345 678 901",
		businessType: "Flooring Retailer",
		status: "ACTIVE",
		email: "accounts@abcflooring.com.au",
		phone: "03 9123 4567",
		website: "www.abcflooring.com.au",
		primaryLocationId: "loc_001",
		primaryContactId: "con_001",
		creditLimit: 5e4,
		currentBalance: 18420,
		overdueBalance: 0,
		paymentTermsDays: 30,
		locations: [{
			id: "loc_001",
			name: "Melbourne",
			addressLine1: "128 Trade Street",
			suburb: "Melbourne",
			state: "VIC",
			postcode: "3000",
			country: "Australia",
			phone: "03 9123 4567",
			isPrimary: !0
		}, {
			id: "loc_002",
			name: "Richmond",
			addressLine1: "42 Bridge Road",
			suburb: "Richmond",
			state: "VIC",
			postcode: "3121",
			country: "Australia",
			isPrimary: !1
		}],
		contacts: [
			{
				id: "con_001",
				firstName: "John",
				lastName: "Smith",
				jobTitle: "Director",
				email: "john@abcflooring.com.au",
				mobile: "0412 345 678",
				locationId: "loc_001",
				isPrimary: !0
			},
			{
				id: "con_002",
				firstName: "Sarah",
				lastName: "Lee",
				jobTitle: "Accounts Manager",
				email: "sarah@abcflooring.com.au",
				mobile: "0418 234 567",
				locationId: "loc_001",
				isPrimary: !1
			},
			{
				id: "con_003",
				firstName: "Michael",
				lastName: "Chen",
				jobTitle: "Store Manager",
				email: "michael@abcflooring.com.au",
				mobile: "0402 111 222",
				locationId: "loc_002",
				isPrimary: !1
			}
		],
		createdAt: "2026-02-10T10:00:00",
		updatedAt: "2026-10-04T14:30:00"
	},
	{
		id: "cus_002",
		code: "CUST-0002",
		businessName: "Oak Living Pty Ltd",
		abn: "23 456 789 012",
		businessType: "Builder",
		status: "ACTIVE",
		email: "accounts@oakliving.com.au",
		phone: "03 9345 2211",
		primaryLocationId: "loc_003",
		primaryContactId: "con_004",
		creditLimit: 75e3,
		currentBalance: 28400,
		overdueBalance: 4200,
		paymentTermsDays: 30,
		locations: [{
			id: "loc_003",
			name: "Head Office",
			addressLine1: "84 Construction Avenue",
			suburb: "South Melbourne",
			state: "VIC",
			postcode: "3205",
			country: "Australia",
			isPrimary: !0
		}],
		contacts: [{
			id: "con_004",
			firstName: "Emma",
			lastName: "Brown",
			jobTitle: "Accounts Manager",
			email: "emma@oakliving.com.au",
			mobile: "0411 882 920",
			locationId: "loc_003",
			isPrimary: !0
		}],
		createdAt: "2026-03-02T09:00:00",
		updatedAt: "2026-10-03T12:00:00"
	},
	{
		id: "cus_003",
		code: "CUST-0003",
		businessName: "Floor Plus",
		businessType: "Flooring Retailer",
		status: "ACTIVE",
		email: "sales@floorplus.com.au",
		phone: "03 9002 8812",
		primaryLocationId: "loc_004",
		primaryContactId: "con_005",
		creditLimit: 3e4,
		currentBalance: 6120,
		overdueBalance: 0,
		paymentTermsDays: 14,
		locations: [{
			id: "loc_004",
			name: "Geelong",
			addressLine1: "18 Moorabool Street",
			suburb: "Geelong",
			state: "VIC",
			postcode: "3220",
			country: "Australia",
			isPrimary: !0
		}],
		contacts: [{
			id: "con_005",
			firstName: "Daniel",
			lastName: "Wilson",
			email: "daniel@floorplus.com.au",
			mobile: "0433 120 450",
			locationId: "loc_004",
			isPrimary: !0
		}],
		createdAt: "2026-04-11T09:30:00",
		updatedAt: "2026-10-01T16:00:00"
	},
	{
		id: "cus_004",
		code: "CUST-0004",
		businessName: "Urban Floors",
		businessType: "Designer",
		status: "ON_HOLD",
		email: "hello@urbanfloors.com.au",
		primaryLocationId: "loc_005",
		primaryContactId: "con_006",
		creditLimit: 15e3,
		currentBalance: 6520,
		overdueBalance: 6520,
		paymentTermsDays: 14,
		locations: [{
			id: "loc_005",
			name: "Studio",
			addressLine1: "52 Smith Street",
			suburb: "Collingwood",
			state: "VIC",
			postcode: "3066",
			country: "Australia",
			isPrimary: !0
		}],
		contacts: [{
			id: "con_006",
			firstName: "Olivia",
			lastName: "Martin",
			jobTitle: "Principal Designer",
			email: "olivia@urbanfloors.com.au",
			mobile: "0414 909 828",
			locationId: "loc_005",
			isPrimary: !0
		}],
		createdAt: "2026-05-18T11:00:00",
		updatedAt: "2026-09-29T13:00:00"
	},
	{
		id: "cus_005",
		code: "CUST-0005",
		businessName: "Melbourne Interiors",
		businessType: "Designer",
		status: "ACTIVE",
		email: "accounts@melbourneinteriors.com.au",
		primaryLocationId: "loc_006",
		primaryContactId: "con_007",
		creditLimit: 4e4,
		currentBalance: 9340,
		overdueBalance: 0,
		paymentTermsDays: 30,
		locations: [{
			id: "loc_006",
			name: "Melbourne",
			addressLine1: "21 Design Lane",
			suburb: "Prahran",
			state: "VIC",
			postcode: "3181",
			country: "Australia",
			isPrimary: !0
		}],
		contacts: [{
			id: "con_007",
			firstName: "James",
			lastName: "Taylor",
			email: "james@melbourneinteriors.com.au",
			locationId: "loc_006",
			isPrimary: !0
		}],
		createdAt: "2026-06-12T08:30:00",
		updatedAt: "2026-10-05T10:00:00"
	}
], ya = "htt.mock.contacts.customers.v1";
function ba(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var xa = s(ya, ba), Sa = xa.status !== "invalid" && l(ya), Ca = /* @__PURE__ */ new Set(), wa = xa.status === "ok" ? xa.data : structuredClone(va);
function Ta() {
	Sa && c(ya, wa), Ca.forEach((e) => {
		e();
	});
}
function Ea(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Da() {
	let e = wa.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function $(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Oa(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function ka(e, t) {
	let n = !1;
	if (wa = wa.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	Ta();
}
var Aa = {
	subscribe(e) {
		return Ca.add(e), () => {
			Ca.delete(e);
		};
	},
	getSnapshot() {
		return wa;
	},
	getAll() {
		return wa;
	},
	getById(e) {
		return wa.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Ea("cus"),
			code: Da(),
			businessName: e.businessName.trim(),
			tradingName: $(e.tradingName),
			abn: Oa(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: $(e.email),
			phone: $(e.phone),
			website: $(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return wa = [n, ...wa], Ta(), n;
	},
	update(e, t) {
		let n;
		if (ka(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: $(t.tradingName),
			abn: Oa(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: $(t.email),
			phone: $(t.phone),
			website: $(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = Aa.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: Ea("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: $(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: $(t.phone),
			isPrimary: r
		};
		return ka(e, (e) => ({
			...e,
			primaryLocationId: r ? i.id : e.primaryLocationId,
			locations: [...e.locations.map((e) => ({
				...e,
				isPrimary: !r && e.isPrimary
			})), i],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		})), i;
	},
	updateLocation(e, t, n) {
		let r = Aa.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: $(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: $(n.phone),
			isPrimary: a
		};
		return ka(e, (e) => ({
			...e,
			primaryLocationId: a ? t : e.primaryLocationId,
			locations: e.locations.map((e) => e.id === t ? o : a ? {
				...e,
				isPrimary: !1
			} : e),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		})), o;
	},
	addContact(e, t) {
		let n = Aa.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: Ea("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: $(t.jobTitle),
			email: t.email.trim(),
			phone: $(t.phone),
			mobile: $(t.mobile),
			locationId: $(t.locationId),
			isPrimary: r
		};
		return ka(e, (e) => ({
			...e,
			primaryContactId: r ? i.id : e.primaryContactId,
			contacts: [...e.contacts.map((e) => ({
				...e,
				isPrimary: !r && e.isPrimary
			})), i],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		})), i;
	},
	updateContact(e, t, n) {
		let r = Aa.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: $(n.jobTitle),
			email: n.email.trim(),
			phone: $(n.phone),
			mobile: $(n.mobile),
			locationId: $(n.locationId),
			isPrimary: a
		};
		return ka(e, (e) => ({
			...e,
			primaryContactId: a ? t : e.primaryContactId,
			contacts: e.contacts.map((e) => e.id === t ? o : a ? {
				...e,
				isPrimary: !1
			} : e),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		})), o;
	}
};
n("customers", {
	repository: Aa,
	read: "sales.read",
	commands: {
		if: null,
		emitChange: null,
		create: "contacts.write",
		update: "contacts.write",
		addLocation: "contacts.write",
		updateLocation: "contacts.write",
		addContact: "contacts.write",
		updateContact: "contacts.write"
	},
	snapshot: () => ({ customers: wa }),
	restore: (e) => {
		wa = e.customers;
	},
	publish: () => Ca.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankTransactionRepository.ts
var ja = /* @__PURE__ */ new Set(), Ma = y.read().transactions, Na = y.read().transfers;
y.onRollback(() => {
	let e = y.read();
	Ma = e.transactions, Na = e.transfers;
});
function Pa() {
	ja.forEach((e) => y.notify(e));
}
function Fa(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Ia(e) {
	return e?.trim() || void 0;
}
function La(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Ra(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function za(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Ba(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var Va = {
	subscribe(e) {
		return ja.add(e), () => {
			ja.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Ma;
	},
	getTransfersSnapshot() {
		return Na;
	},
	getTransactions() {
		return Ma;
	},
	getTransfers() {
		return Na;
	},
	createTransaction(e, t) {
		if (La(e.transactionDate), a(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Ra(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Fa(e.description, "Description"), i = rn.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let o = S.requireById(i.glAccountId);
		if (!o.active) throw Error("The selected bank GL account is inactive.");
		let s = S.requireById(e.offsetAccountId);
		if (!s.active) throw Error("The offset account is inactive.");
		if (!s.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (s.id === o.id) throw Error("Bank and offset accounts must be different.");
		if (rn.getByGlAccountId(s.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let c = za("banktxn"), l = Ba("BTXN", e.transactionDate, Ma.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = h.begin(u, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Ma.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && h.bindResult(u, c);
			let t = w.post({
				journalDate: e.transactionDate,
				description: r,
				reference: Ia(e.reference),
				sourceType: "BANK_TRANSACTION",
				sourceId: c,
				lines: e.direction === "MONEY_IN" ? [{
					accountId: o.id,
					description: r,
					debit: n,
					credit: 0
				}, {
					accountId: s.id,
					description: r,
					debit: 0,
					credit: n
				}] : [{
					accountId: s.id,
					description: r,
					debit: n,
					credit: 0
				}, {
					accountId: o.id,
					description: r,
					debit: 0,
					credit: n
				}]
			}), a = {
				id: c,
				transactionNumber: l,
				bankAccountId: i.id,
				transactionDate: e.transactionDate,
				direction: e.direction,
				amount: n,
				offsetAccountId: s.id,
				description: r,
				reference: Ia(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [a, ...Ma];
			if (y.update("transactions", d), Ma = d, Pa(), u) {
				let e = w.getBySource("BANK_TRANSACTION", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return a;
		} catch (e) {
			if (u) try {
				h.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		La(e.transferDate), a(e.transferDate, "Transfer date");
		let n = Ra(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Fa(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = rn.requireById(e.fromBankAccountId), o = rn.requireById(e.toBankAccountId);
		if (!i.active || !o.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== o.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < o.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let s = S.requireById(i.glAccountId), c = S.requireById(o.glAccountId);
		if (!s.active || !c.active) throw Error("Both bank GL accounts must be active.");
		if (s.id === c.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let l = za("banktrf"), u = Ba("BTRF", e.transferDate, Na.length + 1), d = t?.trim();
		if (t !== void 0 && !d) throw Error("Operation ID cannot be empty");
		if (d) {
			let t = h.begin(d, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Na.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			d && h.bindResult(d, l);
			let t = w.post({
				journalDate: e.transferDate,
				description: r,
				reference: Ia(e.reference),
				sourceType: "BANK_TRANSFER",
				sourceId: l,
				lines: [{
					accountId: c.id,
					description: r,
					debit: n,
					credit: 0
				}, {
					accountId: s.id,
					description: r,
					debit: 0,
					credit: n
				}]
			}), a = {
				id: l,
				transferNumber: u,
				fromBankAccountId: i.id,
				toBankAccountId: o.id,
				transferDate: e.transferDate,
				amount: n,
				description: r,
				reference: Ia(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [a, ...Na];
			if (y.update("transfers", f), Na = f, Pa(), d) {
				let e = w.getBySource("BANK_TRANSFER", l);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return a;
		} catch (e) {
			if (d) try {
				h.flagForReview(d, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, Ha = Va.createTransaction;
Va.createTransaction = function(e, t) {
	v();
	let n;
	try {
		return n = y.transaction(() => Ha.call(Va, e, t)), t && h.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = h.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				h.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
var Ua = Va.createTransfer;
Va.createTransfer = function(e, t) {
	v();
	let n;
	try {
		return n = y.transaction(() => Ua.call(Va, e, t)), t && h.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = h.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				h.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, n("bankTransactions", {
	repository: Va,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Ma,
		bankTransfers: Na
	}),
	restore: (e) => {
		Ma = e.bankTransactions, Na = e.bankTransfers;
	},
	publish: () => ja.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankRegisterService.ts
function Wa(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ga(e, t) {
	a(e, t);
}
function Ka(e, t, n) {
	Ga(e.openingBalanceDate, "Opening balance date"), Ga(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = Wa(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = Wa(n.debit), s = Wa(n.credit);
		return a = Wa(a + r), o = Wa(o + s), i = Wa(i + r - s), {
			id: `${t.id}:${n.id}`,
			bankAccountId: e.id,
			journalEntryId: t.id,
			journalNumber: t.journalNumber,
			transactionDate: t.journalDate,
			description: t.description,
			reference: t.reference,
			sourceType: t.sourceType,
			sourceId: t.sourceId,
			journalStatus: t.status,
			moneyIn: r,
			moneyOut: s,
			runningBalance: i
		};
	});
	return {
		bankAccountId: e.id,
		asOfDate: n,
		openingBalance: Wa(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function qa(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ja(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = qa(i + t.moneyIn), a = qa(a + t.moneyOut);
			continue;
		}
		o = qa(o + t.moneyIn), s = qa(s + t.moneyOut);
	}
	let c = qa(qa(t) + o - s), l = qa(e.closingBalance), u = qa(c - l);
	return {
		bookBalance: l,
		clearedMoneyIn: i,
		clearedMoneyOut: a,
		outstandingDeposits: o,
		outstandingPayments: s,
		adjustedStatementBalance: c,
		difference: u,
		reconciled: u === 0
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationRepository.ts
var Ya = /* @__PURE__ */ new Set(), Xa = y.read().reconciliations;
y.onRollback(() => {
	Xa = y.read().reconciliations;
});
function Za() {
	y.update("reconciliations", Xa), Ya.forEach((e) => y.notify(e));
}
function Qa(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function $a(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function eo() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function to(e) {
	return `BREC-${e.slice(0, 4)}-${String(Xa.length + 1).padStart(4, "0")}`;
}
function no(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of Xa) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var ro = {
	subscribe(e) {
		return Ya.add(e), () => {
			Ya.delete(e);
		};
	},
	getSnapshot() {
		return Xa;
	},
	getAll() {
		return Xa;
	},
	getByBankAccount(e) {
		return Xa.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return no(e);
	},
	complete(e) {
		if ($a(e.statementDate), a(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = rn.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = Ka(t, w.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), o = no(t.id), s = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !o.has(e));
		for (let e of s) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let c = /* @__PURE__ */ new Set([...o, ...s]), l = Ja(r, Qa(e.statementBalance), Array.from(c));
		if (!l.reconciled) throw Error(`Bank reconciliation is out by ${l.difference.toFixed(2)}.`);
		let u = {
			id: eo(),
			reconciliationNumber: to(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: Qa(e.statementBalance),
			bookBalance: l.bookBalance,
			outstandingDeposits: l.outstandingDeposits,
			outstandingPayments: l.outstandingPayments,
			adjustedStatementBalance: l.adjustedStatementBalance,
			difference: l.difference,
			clearedTransactionIds: s,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Xa = [u, ...Xa], Za(), u;
	}
}, io = ro.complete;
ro.complete = function(e) {
	return v(), y.transaction(() => io.call(ro, e));
}, n("bankReconciliations", {
	repository: ro,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: Xa }),
	restore: (e) => {
		Xa = e.reconciliations;
	},
	publish: () => Ya.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var ao = !1;
function oo() {
	if (ao || (ao = !0, y.wasRestoredOnLoad())) return;
	let e = En.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) M.postInvoice(t), t.status === "VOID" && M.reverseInvoice(t);
	let t = ln.getAll();
	for (let e of t) M.postPayment(e), e.status === "REVERSED" && M.reversePayment(e);
	let n = D.getAll();
	for (let e of n) e.status !== "DRAFT" && (M.postCreditNote(e), e.status === "VOID" && M.reverseCreditNote(e));
}
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function so(e) {
	let t = [], n = new Map(e.journals.map((e) => [e.id, e])), r = /* @__PURE__ */ new Map();
	for (let n of e.journals) {
		if (!n.sourceId) continue;
		let e = `${n.sourceType}:${n.sourceId}`, i = r.get(e);
		i ? t.push({
			code: "DUPLICATE_SOURCE",
			entityId: n.id,
			message: `Journal source ${e} also used by ${i}`
		}) : r.set(e, n.id);
	}
	for (let [r, i] of [[e.transactions, "BANK_TRANSACTION"], [e.transfers, "BANK_TRANSFER"]]) for (let e of r) {
		let r = n.get(e.journalEntryId);
		r ? (r.sourceType !== i || r.sourceId !== e.id) && t.push({
			code: "SOURCE_MISMATCH",
			entityId: e.id,
			message: `Journal ${r.id} has a different source`
		}) : t.push({
			code: "MISSING_JOURNAL",
			entityId: e.id,
			message: `Missing journal ${e.journalEntryId}`
		});
	}
	for (let n of e.payments) n.status === "RECEIVED" && (e.journals.some((e) => e.sourceType === "CUSTOMER_PAYMENT" && e.sourceId === n.id) || t.push({
		code: "MISSING_PAYMENT_JOURNAL",
		entityId: n.id,
		message: `Received payment ${n.id} has no matching journal`
	}));
	let i = (e) => Math.round((e + 2 ** -52) * 100) / 100, a = (n, r, a, o) => {
		let s = e.journals.filter((e) => e.sourceType === r && e.sourceId === n && !e.reversedJournalEntryId);
		if (!s.length) {
			t.push({
				code: "MISSING_JOURNAL",
				entityId: n,
				message: `${r} has no original GL journal`
			});
			return;
		}
		let c = s[0];
		(i(c.totalDebit) !== i(a) || i(c.totalCredit) !== i(a)) && t.push({
			code: "AMOUNT_MISMATCH",
			entityId: n,
			message: `${r} total differs from GL`
		});
		let l = e.journals.find((e) => e.id === c.reversalJournalEntryId && e.reversedJournalEntryId === c.id);
		(o !== (c.status === "REVERSED") || o && !l) && t.push({
			code: "REVERSAL_MISMATCH",
			entityId: n,
			message: `${r} reversal differs from GL lifecycle`
		});
	};
	for (let n of e.journals) {
		if (Array.isArray(n.lines)) {
			let e = i(n.lines.reduce((e, t) => e + t.debit, 0)), r = i(n.lines.reduce((e, t) => e + t.credit, 0));
			(!Number.isFinite(e) || !Number.isFinite(r) || e !== r || e !== i(n.totalDebit) || r !== i(n.totalCredit)) && t.push({
				code: "UNBALANCED_JOURNAL",
				entityId: n.id,
				message: "Journal lines and debit/credit totals do not balance"
			});
		}
		let r = n.sourceType === "CUSTOMER_INVOICE" ? e.invoices : n.sourceType === "CREDIT_NOTE" ? e.creditNotes : n.sourceType === "BANK_TRANSACTION" ? e.transactions : n.sourceType === "BANK_TRANSFER" ? e.transfers : n.sourceType === "CUSTOMER_PAYMENT" ? e.payments : n.sourceType === "SUPPLIER_BILL" ? e.supplierBills : n.sourceType === "SUPPLIER_PAYMENT" ? e.supplierPayments : n.sourceType === "SUPPLIER_CREDIT" ? e.supplierCredits : void 0;
		r && n.sourceId && !r.some((e) => e.id === n.sourceId) && t.push({
			code: "ORPHAN_JOURNAL",
			entityId: n.id,
			message: `GL source ${n.sourceType}:${n.sourceId} has no business record`
		});
	}
	for (let t of e.invoices ?? []) t.status !== "DRAFT" && a(t.id, "CUSTOMER_INVOICE", t.totals.total, t.status === "VOID");
	for (let t of e.creditNotes ?? []) t.status !== "DRAFT" && a(t.id, "CREDIT_NOTE", t.totals.total, t.status === "VOID");
	for (let t of e.payments) Number.isFinite(t.amount) && a(t.id, "CUSTOMER_PAYMENT", t.amount, t.status === "REVERSED");
	for (let t of e.transactions) Number.isFinite(t.amount) && a(t.id, "BANK_TRANSACTION", t.amount, !1);
	for (let t of e.transfers) Number.isFinite(t.amount) && a(t.id, "BANK_TRANSFER", t.amount, !1);
	for (let t of e.supplierBills ?? []) a(t.id, "SUPPLIER_BILL", t.totals.total, t.status === "VOID");
	for (let n of e.supplierPayments ?? []) a(n.id, "SUPPLIER_PAYMENT", n.amount, n.status === "REVERSED"), i(n.allocations.reduce((e, t) => e + t.amount, 0)) !== i(n.amount) && t.push({
		code: "AMOUNT_MISMATCH",
		entityId: n.id,
		message: "Supplier payment allocations do not equal payment total"
	});
	for (let t of e.supplierCredits ?? []) a(t.id, "SUPPLIER_CREDIT", t.totals.total, t.status === "VOID");
	return t;
}
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function co() {
	return so({
		transactions: Va.getTransactions(),
		transfers: Va.getTransfers(),
		payments: ln.getAll(),
		journals: w.getAll(),
		invoices: En.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: D.getAll(),
		supplierBills: Bi.getAll(),
		supplierPayments: Wi.getAll(),
		supplierCredits: Z.getAll()
	});
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function lo() {
	let e = co().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/security/trustedAuthorization.ts
var uo = null, fo = {
	connect(e) {
		return uo = e, () => {
			uo === e && (uo = null);
		};
	},
	disconnect() {
		uo = null;
	},
	current() {
		return uo?.() ?? null;
	},
	require(t) {
		return e(this.current(), t);
	}
}, po = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function mo(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let n = t("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return r(n.view), n.result;
	}
	if (!e.businessRecordChecked || !e.originalGlChecked || !e.reversalGlChecked || !e.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let n = h.list().find((t) => t.operationId === e.operationId);
	if (!n || !po.has(n.kind)) throw Error("Sales operation not found.");
	if (n.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return h.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var ho = (e) => Math.round(e * 100);
function go(e) {
	let t = [], n = (e, n, r, i = "BLOCK") => t.push({
		code: e,
		entityId: n,
		message: r,
		severity: i
	}), r = new Map(e.salesOrders.map((e) => [e.id, e])), i = new Map(e.invoices.map((e) => [e.id, e])), a = new Map(e.creditNotes.map((e) => [e.id, e])), o = (e, t) => {
		let r = /* @__PURE__ */ new Set();
		for (let i of e) r.has(i.id) && n("DUPLICATE_ID", i.id, `Duplicate ${t} identifier`), r.add(i.id);
	};
	o(e.quotes, "Quote"), o(e.salesOrders, "Sales Order"), o(e.invoices, "Invoice"), o(e.payments, "Payment"), o(e.creditNotes, "Credit Note"), o(e.allocations, "Credit Allocation");
	for (let t of e.quotes) t.status === "CONVERTED" && (!t.convertedSalesOrderId || r.get(t.convertedSalesOrderId)?.sourceQuoteId !== t.id) && n("QUOTE_ORDER_LINK", t.id, "Converted quote is missing its linked order");
	for (let t of e.salesOrders) {
		t.sourceQuoteId && !e.quotes.some((e) => e.id === t.sourceQuoteId && e.convertedSalesOrderId === t.id) && n("ORDER_QUOTE_LINK", t.id, "Sales order has no matching converted quote");
		for (let e of t.invoiceIds) i.get(e)?.sourceSalesOrderId !== t.id && n("ORDER_INVOICE_LINK", t.id, `Order invoice ${e} is missing or has a different source order`);
	}
	for (let t of e.invoices) {
		t.sourceSalesOrderId && !r.get(t.sourceSalesOrderId)?.invoiceIds.includes(t.id) && n("INVOICE_ORDER_LINK", t.id, "Invoice is not referenced by its source order");
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + ho(t.amount), 0), s = a.reduce((e, t) => e + ho(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (ho(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), ho(t.amountDue) !== Math.max(0, ho(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > ho(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
	}
	for (let t of e.invoices) {
		let r = e.journals.filter((e) => e.sourceType === "CUSTOMER_INVOICE" && e.sourceId === t.id && !e.reversedJournalEntryId);
		r.some((e) => e.status === "REVERSED") && t.status !== "VOID" && n("ACTIVE_INVOICE_GL_REVERSED", t.id, "Active invoice has a reversed original GL journal"), t.status === "VOID" && r.some((e) => e.status === "POSTED") && n("VOID_INVOICE_GL_ACTIVE", t.id, "Voided invoice still has an active original GL journal"), r.length > 1 && n("DUPLICATE_INVOICE_ORIGINAL_GL", t.id, "More than one original invoice journal exists");
	}
	for (let t of e.payments) {
		let r = e.journals.filter((e) => e.sourceType === "CUSTOMER_PAYMENT" && e.sourceId === t.id && !e.reversedJournalEntryId);
		t.status === "RECEIVED" && r.some((e) => e.status === "REVERSED") && n("RECEIVED_PAYMENT_GL_REVERSED", t.id, "Received payment has a reversed GL journal"), t.status === "REVERSED" && r.some((e) => e.status === "POSTED") && n("REVERSED_PAYMENT_GL_ACTIVE", t.id, "Reversed payment still has an active original GL journal"), r.length > 1 && n("DUPLICATE_PAYMENT_ORIGINAL_GL", t.id, "More than one original payment journal exists");
	}
	for (let t of e.creditNotes) {
		let r = e.journals.filter((e) => e.sourceType === "CREDIT_NOTE" && e.sourceId === t.id && !e.reversedJournalEntryId);
		t.status === "VOID" && r.some((e) => e.status === "POSTED") && n("VOID_CREDIT_GL_ACTIVE", t.id, "Voided credit note still has an active original GL journal"), t.status !== "VOID" && r.some((e) => e.status === "REVERSED") && n("ACTIVE_CREDIT_GL_REVERSED", t.id, "Active credit note has a reversed original GL journal"), r.length > 1 && n("DUPLICATE_CREDIT_ORIGINAL_GL", t.id, "More than one original credit journal exists");
	}
	for (let t of e.journals) t.status === "POSTED" && t.sourceId && !t.reversedJournalEntryId && (t.sourceType === "CUSTOMER_INVOICE" && !i.has(t.sourceId) && n("ORPHAN_INVOICE_GL", t.id, "Invoice GL journal has no matching business invoice"), t.sourceType === "CUSTOMER_PAYMENT" && !e.payments.some((e) => e.id === t.sourceId) && n("ORPHAN_PAYMENT_GL", t.id, "Payment GL journal has no matching payment"), t.sourceType === "CREDIT_NOTE" && !a.has(t.sourceId) && n("ORPHAN_CREDIT_GL", t.id, "Credit GL journal has no matching credit note"));
	for (let t of e.payments) {
		let e = i.get(t.invoiceId);
		(!e || e.customerId !== t.customerId) && n("PAYMENT_INVOICE_LINK", t.id, "Payment invoice missing or customer mismatch");
	}
	for (let t of e.creditNotes) {
		let r = i.get(t.sourceInvoiceId);
		(!r || r.customerId !== t.customerId) && n("CREDIT_SOURCE_LINK", t.id, "Credit note source invoice missing or customer mismatch");
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + ho(t.amount), 0);
		ho(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || ho(t.amountAvailable) !== 0 : ho(t.amountAvailable) !== ho(t.totals.total) - a) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
	}
	for (let t of e.allocations) {
		let e = a.get(t.creditNoteId), r = i.get(t.invoiceId);
		(!e || !r || e.customerId !== t.customerId || r.customerId !== t.customerId) && n("ALLOCATION_LINK", t.id, "Credit allocation references missing or different-customer documents"), t.status === "APPLIED" && e?.status === "VOID" && n("VOID_CREDIT_ALLOCATED", t.id, "Allocation remains active on a void credit note");
	}
	let s = /* @__PURE__ */ new Map();
	for (let t of e.journals) {
		if (t.status !== "POSTED" || !t.sourceId || ![
			"CUSTOMER_INVOICE",
			"CUSTOMER_PAYMENT",
			"CREDIT_NOTE"
		].includes(t.sourceType)) continue;
		let e = `${t.sourceType}:${t.sourceId}`;
		s.has(e) ? n("DUPLICATE_GL_SOURCE", t.id, `Multiple active GL journals for ${e}`) : s.set(e, t.id);
	}
	return t;
}
//#endregion
//#region src/features/sales/data/salesRecoveryInspection.ts
var _o = {
	VOID_INVOICE_GL_ACTIVE: "Stop processing this invoice. Verify the original journal and any reversal, then reconcile the invoice void with GL manually.",
	ACTIVE_INVOICE_GL_REVERSED: "Stop processing this invoice. Inspect the reversal journal and invoice lifecycle before making any adjustment.",
	REVERSED_PAYMENT_GL_ACTIVE: "Block further payment changes. Verify the receipt, bank transaction and original GL journal before manual reversal.",
	RECEIVED_PAYMENT_GL_REVERSED: "Block further payment changes. Investigate the reversal and payment status before manual reconciliation.",
	VOID_CREDIT_GL_ACTIVE: "Inspect credit note void and original GL posting before manually correcting the ledger.",
	ACTIVE_CREDIT_GL_REVERSED: "Inspect the credit note and reversal journal before further allocations.",
	INVOICE_DUE_MISMATCH: "Compare received payments and active credit allocations with the invoice balance; do not silently recalculate historical records.",
	INVOICE_PAID_MISMATCH: "Compare received payments with the invoice paid amount and investigate incomplete operations.",
	DUPLICATE_GL_SOURCE: "Do not post again. Inspect every original and reversal journal for this source."
};
function vo(e) {
	return go(e).map((e) => ({
		...e,
		action: _o[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var yo = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function bo(e, t) {
	let n = vo(e).map((e) => ({ ...e })), r = t.filter((e) => yo.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
	for (let e of r) {
		let t = e.resultId ?? e.operationId, r = e.kind === "SALES_INVOICE_VOID" ? i.has(t) : e.kind === "SALES_PAYMENT_REVERSAL" || e.kind === "CUSTOMER_PAYMENT" ? a.has(t) : o.has(t);
		n.push({
			code: r ? "SALES_OPERATION_UNRESOLVED" : "SALES_OPERATION_RESULT_UNVERIFIED",
			entityId: t,
			operationId: e.operationId,
			severity: "BLOCK",
			message: `${e.kind} is ${e.state}; ${r ? "linked business record exists" : "linked result is missing or not yet bound"}.`,
			action: "Block retries and new financial writes for the affected document. Compare persisted business state, original/reversal GL journals and operation intent; resolve manually. Never replay automatically.",
			automaticRepairAllowed: !1
		});
	}
	let s = /* @__PURE__ */ new Set();
	for (let e of t.filter((e) => yo.has(e.kind))) s.has(e.operationId) && n.push({
		code: "SALES_OPERATION_DUPLICATE_ID",
		entityId: e.operationId,
		operationId: e.operationId,
		severity: "BLOCK",
		message: "Duplicate operation intent ID detected.",
		action: "Do not retry. Inspect operation journal integrity and manually reconcile all affected records.",
		automaticRepairAllowed: !1
	}), s.add(e.operationId);
	return {
		safeToResumeFinancialWrites: n.every((e) => e.severity !== "BLOCK"),
		unresolvedOperations: r.length,
		findings: n
	};
}
function xo() {
	let e = En.getAll();
	return bo({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: ln.getAll(),
		creditNotes: D.getAll(),
		allocations: D.getAllAllocations(),
		journals: w.getAll()
	}, h.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var So = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Co(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!So.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
	let o = a.resultId, s = /* @__PURE__ */ new Set();
	for (let t of e.journals) s.has(t.id) && r.push("Duplicate GL journal identity; reconciliation is not trustworthy."), s.add(t.id);
	if (r.length) return r;
	let c = (t) => e.journals.filter((e) => e.sourceType === t && e.sourceId === o && !e.reversedJournalEntryId);
	if (a.kind === "SALES_INVOICE_VOID") {
		let t = e.invoices.find((e) => e.id === o);
		(!t || t.status !== "VOID") && r.push("Invoice has not reached VOID state.");
		let n = c("CUSTOMER_INVOICE");
		(n.length !== 1 || n[0].status !== "REVERSED" || !n[0].reversalJournalEntryId || e.journals.filter((e) => e.id === n[0]?.reversalJournalEntryId && e.reversedJournalEntryId === n[0]?.id && e.status === "POSTED").length !== 1) && r.push("Unique original and linked posted reversal GL are not verified.");
	} else if (a.kind === "CUSTOMER_PAYMENT" || a.kind === "SALES_PAYMENT_REVERSAL") {
		let t = e.payments.find((e) => e.id === o), n = a.kind === "CUSTOMER_PAYMENT" ? "RECEIVED" : "REVERSED";
		(!t || t.status !== n) && r.push(`Payment has not reached ${n} state.`);
		let i = c("CUSTOMER_PAYMENT");
		(i.length !== 1 || i[0].status !== (n === "RECEIVED" ? "POSTED" : "REVERSED")) && r.push("Payment original GL status is not uniquely verified."), n === "REVERSED" && (i.length !== 1 || !i[0].reversalJournalEntryId || e.journals.filter((e) => e.id === i[0]?.reversalJournalEntryId && e.reversedJournalEntryId === i[0]?.id && e.status === "POSTED").length !== 1) && r.push("Payment linked posted reversal GL is not verified.");
	} else {
		let t = e.allocations.find((e) => e.id === o), n = a.kind === "SALES_CREDIT_APPLY" ? "APPLIED" : "REVERSED";
		(!t || t.status !== n) && r.push(`Credit allocation has not reached ${n} state.`), t && (!e.invoices.some((e) => e.id === t.invoiceId) || !e.creditNotes.some((e) => e.id === t.creditNoteId)) && r.push("Credit allocation is missing its invoice or credit note."), t && (!Number.isFinite(t.amount) || t.amount <= 0) && r.push("Credit allocation amount is invalid.");
	}
	let l = bo(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function wo() {
	let e = En.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: ln.getAll(),
		creditNotes: D.getAll(),
		allocations: D.getAllAllocations(),
		journals: w.getAll()
	};
}
function To(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let n = t("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return r(n.view), n.result;
	}
	let n = h.list(), i = Co(wo(), n, e.operationId);
	if (i.length) throw Error(`Sales recovery remains blocked: ${i.join(" ")}`);
	let a = n.find((t) => t.operationId === e.operationId);
	return {
		closed: h.closeReviewed(e.operationId, a.resultId, e.approvalReference, e.approver),
		remaining: xo()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
n("salesRecovery", {
	repository: {
		recordSalesManualReview: mo,
		closeVerifiedSalesReview: To
	},
	read: "audit.read",
	commands: {
		recordSalesManualReview: "accounting.recover",
		closeVerifiedSalesReview: "accounting.recover"
	},
	snapshot: () => [],
	restore: () => {},
	publish: () => {}
});
function Eo(e) {
	fo.connect(e), pa.configureTrustedSession(e), oo(), lo();
}
//#endregion
export { Eo as initialize };
