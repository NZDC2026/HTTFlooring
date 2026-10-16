import { a as e, f as t, i as n, n as r, o as i, r as a, t as o, u as s } from "./accountingPeriodValidation-BVAaxZv4.js";
//#region src/features/accounting/data/accountingPeriodRepository.ts
var c = [], l, u, d = /* @__PURE__ */ new Set();
function f(e, t) {
	l = e, u = t;
}
function p() {
	let e = u?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function m(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function ee(e) {
	let t = c.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function te() {
	d.forEach((e) => e());
}
function ne(e) {
	if (a(e, "Posting date"), !c.length) return;
	let t = c.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!c.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
i("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => c,
		subscribe(e) {
			return d.add(e), () => {
				d.delete(e);
			};
		},
		create(e) {
			let t = p(), n = m(e.reason);
			if (a(e.startDate), a(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (c.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (c.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
			let r = {
				id: crypto.randomUUID(),
				name: e.name.trim(),
				startDate: e.startDate,
				endDate: e.endDate,
				status: "OPEN",
				history: [{
					action: "CREATE",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			};
			return c = [...c, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), te(), r;
		},
		preflight(e) {
			let t = ee(e);
			if (!l) throw Error("Trusted close checks unavailable.");
			return l(t);
		},
		close(e) {
			let t = p(), n = m(e.reason), r = ee(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (c.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return c = c.map((e) => e.id === r.id ? {
				...e,
				status: "CLOSED",
				history: [...e.history, {
					action: "CLOSE",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString(),
					checks: {
						journalCount: a,
						debit: o,
						credit: s
					}
				}]
			} : e), te(), ee(e.id);
		},
		reopen(e) {
			let t = p(), n = m(e.reason), r = ee(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (c.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return c = c.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), te(), ee(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: c }),
	restore: (e) => {
		o(e.periods), c = e.periods;
	},
	publish: te
});
//#endregion
//#region src/lib/persistence/mockRepositoryStorage.ts
function re() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function ie(e, t) {
	let n = re();
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
function ae(e, t) {
	let n = re();
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
function oe(e) {
	let t = re();
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
var se = "htt:financial-operations:v1", ce = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], le = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], ue = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && ce.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && le.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function de() {
	let e = ie(se, ue);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function fe(e) {
	if (!oe(se) || !ae(se, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var h = {
	list() {
		return de().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !ce.includes(t)) throw Error("Invalid operation identity.");
		let r = de(), i = r.find((t) => t.operationId === e);
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
		return fe([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = de(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return fe(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = de(), r = n.find((t) => t.operationId === e);
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
		return fe(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = de(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return fe(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = de(), a = i.find((t) => t.operationId === e);
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
		return fe(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = de(), a = i.find((t) => t.operationId === e);
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
		return fe(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return de().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
i("financialOperations", {
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
var g = /* @__PURE__ */ new Map(), pe = "htt.purchasePosting.operations.v1";
function me() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function he() {
	let e = me();
	if (e) try {
		e.setItem(pe, JSON.stringify([...g.values()]));
	} catch {}
}
function ge() {
	let e = me();
	if (e) try {
		let t = JSON.parse(e.getItem(pe) ?? "[]");
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
ge();
var _e = /* @__PURE__ */ new Set(), ve = /* @__PURE__ */ new Map(), ye = /* @__PURE__ */ new Map(), be;
function xe() {
	he(), _e.forEach((e) => e());
}
var _ = {
	injectFailureBeforeStep(e, t, n = 1) {
		ye.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		ye.clear();
	},
	registerRecovery(e, t) {
		if (!g.has(e)) throw Error(`Unknown posting operation: ${e}`);
		ve.set(e, t);
	},
	runStep(e, t, n) {
		let r = g.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = ye.get(i) ?? 0;
		if (a > 0) throw ye.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return ve.has(e);
	},
	recover(e) {
		let t = g.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = ve.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (be === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		be = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			be = void 0;
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
		return _e.add(e), () => {
			_e.delete(e);
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
		return g.set(n, r), xe(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = g.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		g.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), xe();
	},
	completeStep(e, t) {
		let n = g.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (g.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), xe());
	}
};
i("purchaseOperations", {
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
		g.clear(), ve.clear();
		for (let t of e) g.set(t.key, t);
	},
	publish: () => _e.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Se = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Ce(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Se.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function v() {
	Ce(h.list(), _.getAll());
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var we = "htt.mock.sales.quotes.v1", Te = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function Ee(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !Te.has(String(t.status)) || ![
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
function De() {
	return ie(we, Ee);
}
function Oe(e) {
	if (De().status === "invalid" || !oe("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!ae("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var ke = "htt.mock.sales.quote-orders.v1";
function Ae(e) {
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
function je(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!Ee(t.quotes) || !Ae(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function Me() {
	return ie(ke, je);
}
function Ne(e) {
	if (!je(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = Me(), n = De();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !oe("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!ae("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Pe = "htt.mock.sales.documents.v1";
function Fe(e) {
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
function Ie(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!je(t) || !Fe(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Le() {
	return ie(Pe, Ie);
}
function Re(e) {
	if (!Ie(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Le();
	if (t.status === "invalid" || t.status === "unavailable" || !oe("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!ae("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var ze = [{
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
}], Be = [{
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
}], Ve = "htt:financial-snapshot:v1", He = (e) => !!e && typeof e == "object" && !Array.isArray(e), Ue = (e) => new Set(e.map((e) => e.id)).size === e.length, We = (e) => {
	if (!He(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => He(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => He(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => He(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => He(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => He(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && He(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && He(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && He(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && Ue(t) && Ue(n) && Ue(r) && Ue(i);
}, Ge = () => ({
	purchaseOrders: structuredClone(ze),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(Be),
	transactions: [],
	transfers: [],
	journals: []
}), Ke, qe = !1;
function Je() {
	return typeof window < "u" && !!window.localStorage;
}
function Ye() {
	if (Ke) return Ke;
	if (!Je()) return Ge();
	let e = ie(Ve, We);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return qe = e.status === "ok", Ke = e.status === "ok" ? {
		...Ge(),
		...e.data
	} : Ge(), Ke;
}
var Xe = /* @__PURE__ */ new Set(), Ze = 0, Qe = /* @__PURE__ */ new Set();
function $e(e) {
	if (Je() && !ae(Ve, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var y = {
	wasRestoredOnLoad() {
		return Ye(), qe;
	},
	onRollback(e) {
		Xe.add(e);
	},
	notify(e) {
		Ze ? Qe.add(e) : e();
	},
	transaction(e) {
		if (Ze) return e();
		let t = structuredClone(Ye());
		Ke = structuredClone(t), Ze++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			$e(Ye());
		} catch (e) {
			throw Ke = t, Xe.forEach((e) => e()), Qe.clear(), e;
		} finally {
			Ze--;
		}
		let r = [...Qe];
		return Qe.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(Ye());
	},
	update(e, t) {
		let n = {
			...Ye(),
			[e]: structuredClone(t)
		};
		if (!We(n)) throw Error("Invalid financial snapshot; write blocked.");
		Ze || $e(n), Ke = n;
	},
	resetCacheForTests() {
		Ke = void 0, qe = !1;
	}
};
i("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => y.read(),
	restore: (e) => {
		Ke = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var et = /* @__PURE__ */ new Set(), b = "2026-10-08T00:00:00.000Z", x = [
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
function tt() {
	et.forEach((e) => e());
}
function nt(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function rt(e) {
	return e?.trim() || void 0;
}
function it(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function at(e, t) {
	if (x.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function ot(e, t) {
	if (!e) return;
	let n = x.find((n) => n.id !== t && n.systemRole === e);
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function st() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var S = {
	subscribe(e) {
		return et.add(e), () => {
			et.delete(e);
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
		let t = nt(e.code, "Account code"), n = nt(e.name, "Account name");
		it(t), at(t), ot(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: st(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: rt(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return x = [...x, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), tt(), i;
	},
	update(e, t) {
		let n = x.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = nt(t.code, "Account code"), i = nt(t.name, "Account name");
		if (it(r), at(r, e), n.systemRole && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: rt(t.description),
			active: n.systemRole ? !0 : t.active,
			allowManualPosting: n.systemRole ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return x = x.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), tt(), a;
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
		return x = x.map((t) => t.id === e ? r : t), tt(), r;
	}
};
i("accounts", {
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
	publish: () => et.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var ct = /* @__PURE__ */ new Set(), C = y.read().journals;
y.onRollback(() => {
	C = y.read().journals;
});
function lt() {
	ct.forEach((e) => y.notify(e));
}
function ut(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function dt(e) {
	return e?.trim() || void 0;
}
function ft(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function pt(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = C.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function mt(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function ht(e) {
	if (ft(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = S.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = ut(r.debit), o = ut(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = ut(t + a), n = ut(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function gt(e) {
	return e.lines.map((e, t) => {
		let n = S.requireById(e.accountId);
		return {
			id: mt(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: dt(e.description),
			debit: ut(e.debit),
			credit: ut(e.credit)
		};
	});
}
function _t(e, t) {
	return C.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var w = {
	subscribe(e) {
		return ct.add(e), () => {
			ct.delete(e);
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
	findSourceJournal: _t,
	post(e) {
		ne(e.journalDate);
		let t = ht(e), n = dt(e.sourceId);
		if (n) {
			let t = _t(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: mt("je"),
			journalNumber: pt(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: dt(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: gt(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...C];
		return y.update("journals", a), C = a, lt(), i;
	},
	reverse(e) {
		ne(e.reversalDate);
		let t = C.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (ft(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
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
		}, i = ht(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: mt("je"),
			journalNumber: pt(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: gt(r),
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
		return y.update("journals", c), C = c, lt(), o;
	}
};
i("journals", {
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
	publish: () => ct.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var vt = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function yt(e) {
	let t = e.filter((e) => vt.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function bt() {
	yt(h.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var xt = [{
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
}], St = [{
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
}], Ct = [{
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
}], wt = "htt.mock.sales.credit-notes.v1", Tt = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, Et = (e) => typeof e == "string" && e.length > 0;
function Dt(e) {
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
		].every((e) => Et(t[e])) || ![
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
		].every((e) => Tt(i[e])) || !Tt(t.amountApplied) || !Tt(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => Et(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !Tt(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
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
function Ot() {
	return ie(wt, Dt);
}
function kt(e) {
	if (!Dt(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = Ot();
	if (t.status === "invalid" || t.status === "unavailable" || !oe("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!ae("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var At = /* @__PURE__ */ new Set(), jt = Ot(), T = jt.status === "ok" ? structuredClone(jt.data.creditNotes) : [], E = jt.status === "ok" ? structuredClone(jt.data.allocations) : [], Mt = [...T], Nt = [...E];
function Pt() {
	Mt = [...T], Nt = [...E], At.forEach((e) => e());
}
function Ft(e, t) {
	kt({
		creditNotes: e,
		allocations: t
	}), T = e, E = t, Pt();
}
var D = {
	subscribe(e) {
		return At.add(e), () => {
			At.delete(e);
		};
	},
	getSnapshot() {
		return Mt;
	},
	getAllocationSnapshot() {
		return Nt;
	},
	getAll() {
		return Mt;
	},
	getAllAllocations() {
		return Nt;
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
		return Ft([e, ...T], E), e;
	},
	update(e) {
		if (!T.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Ft(T.map((t) => t.id === e.id ? e : t), E), e;
	},
	createAllocation(e) {
		if (E.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Ft(T, [e, ...E]), e;
	},
	updateAllocation(e) {
		if (!E.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Ft(T, E.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!T.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = E.some((t) => t.id === e.id) ? E.map((t) => t.id === e.id ? e : t) : [e, ...E];
		Ft(T.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return E.find((t) => t.id === e);
	}
};
i("customerCredits", {
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
		T = e.creditNotes, E = e.allocations, Mt = [...T], Nt = [...E];
	},
	publish: () => At.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var It = [
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
	return It.find((t) => t.id === e);
}
function Lt(e, t) {
	return O(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var Rt = "htt.mock.contacts.customerPricing.v1";
function zt(e) {
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
function Bt() {
	return ie(Rt, zt);
}
function Vt(e) {
	if (Bt().status === "invalid" || !oe("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!ae("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var Ht = [
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
], Ut = /* @__PURE__ */ new Set(), Wt = Bt(), k = Wt.status === "ok" ? Wt.data : structuredClone(Ht);
function Gt() {
	Ut.forEach((e) => {
		e();
	});
}
function Kt(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function qt(e) {
	return e.trim() || void 0;
}
function Jt(e, t) {
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
function Yt(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function Xt({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = k.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : Yt(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = tn(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function Zt(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function Qt(e) {
	let t = Lt(e.productId, e.unitId);
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
var $t = {
	subscribe(e) {
		return Ut.add(e), () => {
			Ut.delete(e);
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
		Jt(t.productId, t.unitId);
		let n = qt(t.effectiveTo);
		t.active && Xt({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = Zt(t), a = {
			id: Kt("cprice"),
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
		return Vt(o), k = o, Gt(), a;
	},
	update(e, t) {
		let n = $t.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		Jt(t.productId, t.unitId);
		let r = qt(t.effectiveTo);
		t.active && Xt({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = Zt(t), a = {
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
		return Vt(o), k = o, Gt(), a;
	},
	resolve(e) {
		return Qt(e);
	},
	resolvePrice(e, t, n, r) {
		let { unit: i } = Jt(t, n), a = k.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && en(r, i.effectiveFrom, i.effectiveTo));
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
		let o = Qt(a);
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
function en(e, t, n) {
	return !(e < t || n && e > n);
}
function tn(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
i("customerPrices", {
	repository: $t,
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
	publish: () => Ut.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
var nn = .1;
function rn(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function an({ quantity: e, standardUnitPrice: t, unitPrice: n }) {
	let r = rn(e * n), i = rn(r * nn), a = rn(r + i), o = rn(t - n);
	return {
		discountAmount: o,
		discountPercent: t > 0 ? rn(o / t * 100) : 0,
		lineSubtotal: r,
		taxAmount: i,
		lineTotal: a
	};
}
function on(e) {
	let t = rn(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = rn(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: rn(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function sn({ customerId: e, documentDate: t, draft: n }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let r = O(n.productId);
	if (!r) throw Error(`Product ${n.productId} was not found`);
	if (r.status !== "ACTIVE") throw Error(`${r.name} is inactive`);
	let i = Lt(n.productId, n.unitId);
	if (!i) throw Error(`Unit ${n.unitId} was not found for ${r.name}`);
	let a = $t.resolvePrice(e, n.productId, n.unitId, t), o = n.unitPrice !== void 0, s = o ? n.unitPrice : a.effectivePrice;
	if (s < 0) throw Error("Unit price cannot be negative");
	let c = an({
		quantity: n.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: s
	});
	return {
		id: cn("line"),
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
function cn(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var ln = "htt.mock.banking.accounts.v1";
function un(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var dn = /* @__PURE__ */ new Set(), fn = "2026-10-08T00:00:00.000Z", A = [{
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
	createdAt: fn,
	updatedAt: fn
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
	createdAt: fn,
	updatedAt: fn
}], pn = ie(ln, un);
pn.status === "ok" && pn.data.every((e) => {
	let t = S.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (A = pn.data);
function mn() {
	dn.forEach((e) => e());
}
function hn(e) {
	let t = S.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of A) hn(e);
var gn = {
	subscribe(e) {
		return dn.add(e), () => {
			dn.delete(e);
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
		return A = A.map((t) => t.id === e ? r : t), oe(ln) && ae(ln, A), mn(), r;
	}
};
i("bankAccounts", {
	repository: gn,
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
	publish: () => dn.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var _n = /* @__PURE__ */ new Set(), j = y.read().payments;
function vn() {
	_n.forEach((e) => e());
}
function yn() {
	return `payment_${crypto.randomUUID()}`;
}
function bn() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = j.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var xn = {
	subscribe(e) {
		return _n.add(e), () => {
			_n.delete(e);
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
		let t = gn.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (a(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (Cn(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = h.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: Cn(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Sn(e.reference),
				notes: Sn(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = j.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: yn(),
			paymentNumber: bn(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: Cn(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Sn(e.reference),
			notes: Sn(e.notes),
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
		return vn(), i;
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
		return y.update("payments", o), j = o, vn(), a;
	},
	getReceivedByInvoice(e) {
		return j.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Sn(e) {
	return e?.trim() || void 0;
}
function Cn(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
i("customerPayments", {
	repository: xn,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: j }),
	restore: (e) => {
		j = e.payments;
	},
	publish: () => _n.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/salesAccountingPostingService.ts
function wn(e) {
	return S.requireBySystemRole(e).id;
}
function Tn(e) {
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
function En(e, t) {
	return w.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Dn(e, t) {
	let n = En(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var M = {
	postInvoice(e) {
		return En("CUSTOMER_INVOICE", e.id) || w.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: wn("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: wn("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				{
					accountId: wn("GST_PAYABLE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.taxAmount
				}
			]
		});
	},
	reverseInvoice(e) {
		let t = Dn("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: Tn(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = En("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = gn.requireById(e.bankAccountId);
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
				accountId: wn("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Dn("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: Tn(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return En("CREDIT_NOTE", e.id) || w.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: wn("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				{
					accountId: wn("GST_PAYABLE"),
					description: e.creditNoteNumber,
					debit: e.totals.taxAmount,
					credit: 0
				},
				{
					accountId: wn("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Dn("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: Tn(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, On = /* @__PURE__ */ new Set(), kn = Le(), An = Me(), jn = De(), N = kn.status === "ok" ? structuredClone(kn.data.quotes) : An.status === "ok" ? structuredClone(An.data.quotes) : jn.status === "ok" ? structuredClone(jn.data) : structuredClone(xt);
function Mn(e) {
	kn.status === "ok" || Le().status !== "empty" ? Re({
		quotes: e,
		salesOrders: P,
		invoices: F
	}) : An.status === "ok" || Me().status !== "empty" ? Ne({
		quotes: e,
		salesOrders: P
	}) : Oe(e), N = e, In();
}
var P = kn.status === "ok" ? structuredClone(kn.data.salesOrders) : An.status === "ok" ? structuredClone(An.data.salesOrders) : structuredClone(St), F = kn.status === "ok" ? structuredClone(kn.data.invoices) : structuredClone(Ct);
function Nn(e) {
	Re({
		quotes: N,
		salesOrders: P,
		invoices: e
	}), F = e, In();
}
function Pn(e, t = N) {
	kn.status === "ok" || Le().status !== "empty" ? Re({
		quotes: t,
		salesOrders: e,
		invoices: F
	}) : Ne({
		quotes: t,
		salesOrders: e
	}), P = e, N = t, In();
}
var Fn = Ln();
function In() {
	Fn = Ln(), On.forEach((e) => e());
}
function Ln() {
	return [
		...N,
		...P,
		...F
	];
}
var Rn = {
	subscribe(e) {
		return On.add(e), () => {
			On.delete(e);
		};
	},
	getSnapshot() {
		return Fn;
	},
	getAll() {
		return Fn;
	},
	getById(e) {
		return Fn.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Fn.filter((t) => t.customerId === e);
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
		if (zn(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => sn({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Vn("quote"),
			type: "QUOTE",
			documentNumber: Hn("QU", N.map((e) => e.documentNumber)),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: Bn(e.customerReference),
			notes: Bn(e.notes),
			lines: t,
			totals: on(t),
			createdAt: n,
			updatedAt: n
		};
		return Mn([r, ...N]), r;
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
			let t = an({
				quantity: e.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			});
			return {
				id: n.lines.find((t) => t.id === e.lineId)?.id ?? Vn("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: Gn(e.productId, e.unitId).sku,
				description: Gn(e.productId, e.unitId).description,
				unitSymbol: Gn(e.productId, e.unitId).unitSymbol,
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
			customerReference: Bn(t.customerReference),
			notes: Bn(t.notes),
			lines: r,
			totals: on(r),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Mn(N.map((t) => t.id === e ? i : t)), i;
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
		return Mn(N.map((t) => t.id === e ? r : t)), r;
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
		return Mn(N.map((t) => t.id === e ? r : t)), r;
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
		return Mn(N.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = N.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Vn("order"),
			type: "SALES_ORDER",
			documentNumber: Hn("SO", P.map((e) => e.documentNumber)),
			customerId: t.customerId,
			documentDate: Un(),
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
		return Pn([r, ...P], N.map((e) => e.id === t.id ? {
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
		return Pn(P.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = P.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = Un(), i = {
			id: Vn("invoice"),
			type: "INVOICE",
			documentNumber: Hn("INV", F.map((e) => e.documentNumber)),
			customerId: t.customerId,
			documentDate: r,
			dueDate: Wn(r, 30),
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
		return Re({
			quotes: N,
			salesOrders: o,
			invoices: a
		}), F = a, P = o, In(), M.postInvoice(i), i;
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
		let r = structuredClone(e.lines), i = on(r);
		if (i.total <= 0) throw Error("Credit note total must be greater than zero");
		if (I(I(D.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + i.total) > I(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Vn("credit-note"),
			creditNoteNumber: Hn("CN", D.getAll().map((e) => e.creditNoteNumber)),
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
		v(), bt();
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
			id: Vn("credit-allocation"),
			allocationNumber: Hn("CA", D.getAllAllocations().map((e) => e.allocationNumber)),
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
		v(), bt();
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
		if (v(), bt(), e.operationId) {
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
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, o = xn.create({
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
		v(), bt();
		let n = F.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (xn.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
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
			Nn(F.map((t) => t.id === e ? a : t)), h.complete(o, e);
		} catch (e) {
			try {
				h.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		v(), bt();
		let n = xn.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = F.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (h.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			h.bindResult(i, e);
			let n = xn.reverse(e, t);
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
		let n = xn.getReceivedByInvoice(e), r = D.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = I(n.reduce((e, t) => e + t.amount, 0)), a = I(r.reduce((e, t) => e + t.amount, 0)), o = I(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : Kn(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Nn(F.map((t) => t.id === e ? c : t)), c;
	}
};
function zn(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function Bn(e) {
	return e?.trim() || void 0;
}
function Vn(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Hn(e, t) {
	let n = (/* @__PURE__ */ new Date()).getFullYear(), r = t.reduce((e, t) => {
		let n = t.match(/-(\d+)$/);
		if (!n) return e;
		let r = Number(n[1]);
		return Math.max(e, r);
	}, 0) + 1;
	return `${e}-${n}-${String(r).padStart(4, "0")}`;
}
function Un() {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function Wn(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function Gn(e, t) {
	let n = O(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = Lt(e, t);
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
function Kn(e) {
	return e < qn(/* @__PURE__ */ new Date());
}
function qn(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
i("sales", {
	repository: Rn,
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
		N = e.quotes, P = e.salesOrders, F = e.invoices, Fn = Ln();
	},
	publish: () => On.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var Jn = [
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
], Yn = "htt.mock.contacts.suppliers.v1";
function Xn(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Zn = ie(Yn, Xn), Qn = Zn.status !== "invalid" && oe(Yn), $n = /* @__PURE__ */ new Set(), er = Zn.status === "ok" ? Zn.data : structuredClone(Jn);
function tr() {
	Qn && ae(Yn, er), $n.forEach((e) => {
		e();
	});
}
function nr(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function rr() {
	let e = er.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function ir(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function ar(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function or(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: ir(e.tradingName),
		abn: ar(e.abn),
		status: e.status,
		email: ir(e.email),
		phone: ir(e.phone),
		website: ir(e.website),
		contactName: ir(e.contactName),
		addressLine1: ir(e.addressLine1),
		addressLine2: ir(e.addressLine2),
		suburb: ir(e.suburb),
		state: ir(e.state),
		postcode: ir(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: ir(e.notes)
	};
}
var sr = {
	subscribe(e) {
		return $n.add(e), () => {
			$n.delete(e);
		};
	},
	getSnapshot() {
		return er;
	},
	getAll() {
		return er;
	},
	getById(e) {
		return er.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: nr("sup"),
			code: rr(),
			...or(e),
			currency: "AUD",
			createdAt: t,
			updatedAt: t
		};
		return er = [n, ...er], tr(), n;
	},
	update(e, t) {
		let n = sr.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...or(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return er = er.map((t) => t.id === e ? r : t), tr(), r;
	}
};
i("suppliers", {
	repository: sr,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: er }),
	restore: (e) => {
		er = e.suppliers;
	},
	publish: () => $n.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
var cr = .1;
function lr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ur({ orderedQuantity: e, unitCost: t }) {
	let n = lr(e * t), r = lr(n * cr);
	return {
		lineSubtotal: n,
		taxAmount: r,
		lineTotal: lr(n + r)
	};
}
function dr(e) {
	let t = lr(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = lr(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: lr(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var fr = /* @__PURE__ */ new Set(), L = y.read().purchaseOrders;
y.onRollback(() => {
	L = y.read().purchaseOrders;
});
function pr() {
	try {
		y.update("purchaseOrders", L);
	} catch (e) {
		throw L = y.read().purchaseOrders, e;
	}
	fr.forEach((e) => y.notify(e));
}
function mr(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function hr(e) {
	return e.slice(0, 4);
}
function gr(e) {
	let t = hr(e), n = RegExp(`^PO-${t}-(\\d+)$`), r = L.map((e) => {
		let t = e.purchaseOrderNumber.match(n);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `PO-${t}-${(Math.max(0, ...r) + 1).toString().padStart(4, "0")}`;
}
function _r(e) {
	return e?.trim() || void 0;
}
function vr(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = It.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		let r = ur({
			orderedQuantity: e.orderedQuantity,
			unitCost: e.unitCost
		});
		return {
			id: mr("pol"),
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
function yr(e) {
	let t = sr.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function br(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var R = {
	subscribe(e) {
		return fr.add(e), () => {
			fr.delete(e);
		};
	},
	getSnapshot() {
		return L;
	},
	getAll() {
		return L;
	},
	getById(e) {
		return L.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return L.filter((t) => t.supplierId === e);
	},
	create(e) {
		br(e);
		let t = yr(e.supplierId), n = vr(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: mr("po"),
			purchaseOrderNumber: gr(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: _r(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: _r(e.supplierReference),
			notes: _r(e.notes),
			lines: n,
			totals: dr(n),
			createdAt: r,
			updatedAt: r
		};
		return L = [i, ...L], pr(), i;
	},
	updateDraft(e, t) {
		let n = R.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		br(t);
		let r = yr(t.supplierId), i = vr(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: _r(t.expectedDeliveryDate),
			supplierReference: _r(t.supplierReference),
			notes: _r(t.notes),
			lines: i,
			totals: dr(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return L = L.map((e) => e.id === n.id ? a : e), pr(), a;
	},
	approve(e) {
		let t = R.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return xr(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = R.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return xr(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = R.getById(e);
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
		return L = L.map((e) => e.id === n.id ? o : e), pr(), o;
	},
	recordSupplierBill(e, t) {
		let n = R.getById(e);
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
			let n = Sr(e.billedQuantity + t);
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
		return L = L.map((e) => e.id === n.id ? c : e), pr(), c;
	},
	reverseSupplierBill(e, t) {
		let n = R.getById(e);
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
				billedQuantity: Sr(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return L = L.map((e) => e.id === n.id ? c : e), pr(), c;
	},
	cancel(e, t) {
		let n = R.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return xr(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function xr(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return L = L.map((t) => t.id === e.id ? n : t), pr(), n;
}
function Sr(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
i("purchaseOrders", {
	repository: R,
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
	snapshot: () => ({ purchaseOrders: L }),
	restore: (e) => {
		L = e.purchaseOrders;
	},
	publish: () => fr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function z(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Cr(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function B(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function wr({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return Cr(e / t);
}
function Tr({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return B(e * t);
}
function Er({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = z(e + n), a = B(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : Cr(a / i)
	};
}
function Dr({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return B(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Or(e) {
	return B(e.lines.reduce((e, t) => {
		let n = wr({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Tr({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function kr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ar(e) {
	return S.requireBySystemRole(e).id;
}
function jr(e) {
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
function Mr(e, t) {
	return w.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Nr(e, t) {
	let n = Mr(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Pr = {
	validateGoodsReceiptPosting(e) {
		let t = S.requireBySystemRole("INVENTORY"), n = S.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Or(e);
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
		let a = kr(e.totals.subtotal - t);
		if (a !== 0) {
			let e = S.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = kr(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = Mr("SUPPLIER_BILL", e.id);
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
					accountId: Ar("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				{
					accountId: Ar("GST_RECEIVABLE"),
					description: `GST - ${e.billNumber}`,
					debit: e.totals.taxAmount,
					credit: 0
				},
				...i === 0 ? [] : [{
					accountId: Ar("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: Ar("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = Nr("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: jr(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = Mr("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = gn.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return w.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: Ar("ACCOUNTS_PAYABLE"),
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
		let t = Nr("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: jr(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return Mr("SUPPLIER_CREDIT", e.id) || w.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: Ar("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Ar("INVENTORY"),
					description: e.creditNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				{
					accountId: Ar("GST_RECEIVABLE"),
					description: e.creditNumber,
					debit: 0,
					credit: e.totals.taxAmount
				}
			]
		});
	},
	reverseSupplierCredit(e) {
		let t = Nr("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? w.getById(t.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: t.id,
			reversalDate: jr(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, Fr = structuredClone([{
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
}]), Ir = {
	getAll() {
		return Fr;
	},
	getById(e) {
		return Fr.find((t) => t.id === e);
	},
	getActive() {
		return Fr.filter((e) => e.status === "ACTIVE");
	}
}, Lr = /* @__PURE__ */ new Set(), Rr = [];
function zr() {
	Lr.forEach((e) => e());
}
function Br() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Rr.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var Vr = {
	subscribe(e) {
		return Lr.add(e), () => {
			Lr.delete(e);
		};
	},
	getSnapshot() {
		return Rr;
	},
	getAll() {
		return Rr;
	},
	getByReference(e, t) {
		return Rr.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return Rr.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return Rr.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: Br(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Rr = [t, ...Rr], zr(), t;
	}
};
i("inventoryMovements", {
	repository: Vr,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: Rr }),
	restore: (e) => {
		Rr = e.movements;
	},
	publish: () => Lr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var Hr = /* @__PURE__ */ new Set(), Ur = [];
function Wr() {
	Hr.forEach((e) => e());
}
var Gr = {
	subscribe(e) {
		return Hr.add(e), () => {
			Hr.delete(e);
		};
	},
	getSnapshot() {
		return Ur;
	},
	getAll() {
		return Ur;
	},
	getBalance(e, t) {
		return Ur.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = Gr.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return Ur = Ur.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? Ur.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...Ur], Wr(), e;
	},
	replaceAll(e) {
		Ur = e, Wr();
	},
	clear() {
		Ur = [], Wr();
	}
};
i("costBalances", {
	repository: Gr,
	read: "inventory.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: Ur }),
	restore: (e) => {
		Ur = e.balances;
	},
	publish: () => Hr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Kr = /* @__PURE__ */ new Set(), V = [];
function qr() {
	Kr.forEach((e) => e());
}
function Jr() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = V.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Yr(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var Xr = {
	subscribe(e) {
		return Kr.add(e), () => {
			Kr.delete(e);
		};
	},
	getSnapshot() {
		return V;
	},
	getAll() {
		return V;
	},
	getByReference(e, t) {
		return V.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return V.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return V.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return V.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return Yr(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: Jr(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = Xr.build(e);
		return V = [t, ...V], qr(), t;
	},
	replaceAll(e) {
		V = e, qr();
	},
	clear() {
		V = [], qr();
	}
};
i("costMovements", {
	repository: Xr,
	read: "inventory.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: V }),
	restore: (e) => {
		V = e.movements;
	},
	publish: () => Kr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var Zr = /* @__PURE__ */ new Set(), Qr = "2026-01-01T00:00:00.000Z", $r = It.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: Qr,
	updatedAt: Qr
}));
function ei() {
	Zr.forEach((e) => e());
}
var ti = {
	subscribe(e) {
		return Zr.add(e), () => {
			Zr.delete(e);
		};
	},
	getSnapshot() {
		return $r;
	},
	getAll() {
		return $r;
	},
	getByProductId(e) {
		return $r.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = ti.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		let n = {
			...ti.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return $r = $r.map((t) => t.productId === e ? n : t), ei(), n;
	}
};
i("costingPolicies", {
	repository: ti,
	read: "inventory.read",
	commands: { setActive: "inventory.adjust" },
	snapshot: () => ({ policies: $r }),
	restore: (e) => {
		$r = e.policies;
	},
	publish: () => Zr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function ni(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function ri(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function ii(e, t) {
	let n = O(e);
	if (!n) throw Error("Product was not found.");
	let r = ti.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Lt(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function ai(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = B(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(B(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function oi(e) {
	if (e && Xr.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function si({ movement: e, balance: t }) {
	let n = Xr.getAll(), r = Gr.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	Xr.replaceAll(i), Gr.replaceAll(a);
}
function ci(e) {
	if (ni(e.quantity), ri(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	oi(e.inventoryMovementId);
	let { policy: t, unit: n } = ii(e.productId, e.unitId), r = z(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = wr({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Tr({
		quantityBase: r,
		unitCostBase: i
	}), o = Gr.getBalance(e.siteId, e.productId);
	o && ai(o, t.baseUnitId);
	let s = Er({
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
	ai(l, t.baseUnitId);
	let u = Xr.build({
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
	return si({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function li(e) {
	ni(e.quantity), ri(e.occurredAt), oi(e.inventoryMovementId);
	let { policy: t, unit: n } = ii(e.productId, e.unitId), r = z(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Gr.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (ai(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = Cr(i.averageCostPerBaseUnit), o = Dr({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = z(i.quantityOnHand - r), c = s === 0, l = B(c ? -i.inventoryValue : -o), u = c ? 0 : B(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : Cr(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	ai(p, t.baseUnitId);
	let m = Xr.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: z(-r),
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
	return si({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function ui(e) {
	if (ni(e.quantityBase), ri(e.occurredAt), oi(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = O(e.productId);
	if (!t) throw Error("Product was not found.");
	let n = ti.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = z(e.quantityBase), i = Cr(e.unitCostBase), a = B(e.inventoryValue), o = Gr.getBalance(e.siteId, e.productId);
	o && ai(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = z(s + r), u = B(c + a), d = l === 0 ? 0 : Cr(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	ai(p, n.baseUnitId);
	let m = Xr.build({
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
	return si({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var di = /* @__PURE__ */ new Set(), H = [];
function fi() {
	di.forEach((e) => e());
}
function pi(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var mi = {
	subscribe(e) {
		return di.add(e), () => {
			di.delete(e);
		};
	},
	getSnapshot() {
		return H;
	},
	getAll() {
		return H;
	},
	getBalance(e, t) {
		return H.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = mi.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: pi(i.quantityOnHand + r),
				updatedAt: a
			};
			return H = H.map((r) => r.siteId === e && r.productId === t ? n : r), fi(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: pi(r),
			updatedAt: a
		};
		return H = [o, ...H], fi(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = mi.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = pi(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return H = H.map((n) => n.siteId === e && n.productId === t ? o : n), fi(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of Vr.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: pi((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		H = Array.from(e.values()), fi();
	}
};
i("stock", {
	repository: mi,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: H }),
	restore: (e) => {
		H = e.balances;
	},
	publish: () => di.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var hi = /* @__PURE__ */ new Set(), U = y.read().goodsReceipts;
y.onRollback(() => {
	U = y.read().goodsReceipts;
});
function gi() {
	try {
		y.update("goodsReceipts", U);
	} catch (e) {
		throw U = y.read().goodsReceipts, e;
	}
	hi.forEach((e) => y.notify(e));
}
function _i(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function vi(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = U.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function yi(e) {
	return e?.trim() || void 0;
}
var bi = {
	subscribe(e) {
		return hi.add(e), () => {
			hi.delete(e);
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
		let t = R.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = Ir.getById(e.siteId);
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
			let r = _i(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!O(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Lt(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = _i(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: vi(e.receiptDate),
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
			supplierDeliveryReference: yi(e.supplierDeliveryReference),
			notes: yi(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		Pr.validateGoodsReceiptPosting(s), v();
		let c = _.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return _.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = O(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				_.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = Vr.create({
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
					ci({
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
					mi.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			_.runStep(c, "JOURNAL", () => {
				Pr.postGoodsReceipt(s);
			}), _.runStep(c, "PURCHASE_ORDER", () => {
				R.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), _.runStep(c, "RECEIPT", () => {
				U = [s, ...U], gi();
			});
		}), _.recover(c), s;
	}
};
i("goodsReceipts", {
	repository: bi,
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
	publish: () => hi.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var xi = 1e-4;
function Si(e) {
	return B(e);
}
function Ci(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - z(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function wi(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Ti(e, t, n) {
	let r = wr({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Tr({
		quantityBase: z(e * n),
		unitCostBase: r
	});
}
function Ei(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = z(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = z(e.receivedQuantity - t);
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
		let r = z(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > xi);
		if (z(d.reduce((e, t) => e + t.availableQuantity, 0)) + xi < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= xi) break;
			let s = z(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = z(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Tr({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: wr({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Si(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), ee = Math.abs(o.availableQuantity - s) <= xi ? Si(p - m) : Ti(s, o.receiptUnitCost, o.conversionToBase);
			if (ee < 0) throw Error("Receipt cost has been overallocated.");
			let te = Si(s * e.billUnitCost), ne = Si(te - ee);
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
				matchedBillValue: te,
				priceVariance: ne,
				status: "ACTIVE",
				createdAt: l
			}), o.availableQuantity = z(o.availableQuantity - s), r = z(r - s);
		}
		if (r > xi) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Si(Si(e.quantity * e.billUnitCost) - Si(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Si(p.matchedBillValue + f), p.priceVariance = Si(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = z(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = z(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Si(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Si(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Si(p - f)
	};
}
var Oi = {
	calculate: Di,
	getAvailableReceiptLines(e, t, n) {
		return Ei(e, t, n);
	}
}, W = y.read().receiptMatches;
y.onRollback(() => {
	W = y.read().receiptMatches;
});
var ki = /* @__PURE__ */ new Set(), Ai = () => {
	try {
		y.update("receiptMatches", W);
	} catch (e) {
		throw W = y.read().receiptMatches, e;
	}
	ki.forEach((e) => y.notify(e));
}, ji = {
	getAll() {
		return [...W];
	},
	subscribe(e) {
		return ki.add(e), () => {
			ki.delete(e);
		};
	},
	getSnapshot() {
		return W;
	},
	getByBill(e) {
		return W.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (W.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		W = [...W, ...t], Ai();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		W = W.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), Ai();
	}
};
i("receiptMatches", {
	repository: ji,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: W }),
	restore: (e) => {
		W = e.matches;
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
var Ii = /* @__PURE__ */ new Set(), G = y.read().supplierBills;
y.onRollback(() => {
	G = y.read().supplierBills;
});
function Li() {
	try {
		y.update("supplierBills", G);
	} catch (e) {
		throw G = y.read().supplierBills, e;
	}
	Ii.forEach((e) => y.notify(e));
}
function Ri(e) {
	return e?.trim() || void 0;
}
function zi(e) {
	let t = `BILL-${e.slice(0, 4)}-`, n = G.filter((e) => e.billNumber.startsWith(t)).map((e) => Number.parseInt(e.billNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
var Bi = {
	subscribe(e) {
		return Ii.add(e), () => {
			Ii.delete(e);
		};
	},
	getSnapshot() {
		return G;
	},
	getAll() {
		return G;
	},
	getById(e) {
		return G.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return G.filter((t) => t.supplierId === e);
	},
	applyPayment(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = Hi(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = Hi(n.totals.amountPaid + r), a = Hi(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), Li(), o;
	},
	reversePayment(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = Hi(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = Hi(Math.max(0, n.totals.amountPaid - r)), a = Hi(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), Li(), o;
	},
	applyCredit(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = Hi(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = Hi(n.totals.amountCredited + r), a = Hi(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), Li(), o;
	},
	reverseCredit(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = Hi(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = Hi(Math.max(0, n.totals.amountCredited - r)), a = Hi(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), Li(), o;
	},
	markVoid(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let i = t.trim();
		if (i.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if (ji.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...n,
			status: "VOID",
			voidedAt: a,
			voidReason: i,
			updatedAt: a
		};
		v();
		let s = _.begin("SUPPLIER_BILL_VOID", n.id).key;
		return _.registerRecovery(s, () => {
			_.runStep(s, "REVERSAL_JOURNAL", () => {
				Pr.reverseSupplierBill(o);
			}), _.runStep(s, "PURCHASE_ORDER", () => {
				R.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), _.runStep(s, "MATCHES", () => {
				ji.reverseForBill(n.id, i, r(a));
			}), _.runStep(s, "BILL", () => {
				G = G.map((e) => e.id === n.id ? o : e), Li();
			});
		}), _.recover(s), o;
	},
	getByPurchaseOrder(e) {
		return G.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = R.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (G.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
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
			receipts: bi.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: ji.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		Pr.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), v();
		let u = _.begin("SUPPLIER_BILL", c.id).key;
		return _.registerRecovery(u, () => {
			_.runStep(u, "JOURNAL", () => {
				Pr.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), _.runStep(u, "PURCHASE_ORDER", () => {
				R.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), _.runStep(u, "MATCHES", () => {
				ji.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), _.runStep(u, "BILL", () => {
				G = [c, ...G], Li();
			});
		}), _.recover(u), c;
	}
};
function Vi(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Hi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
i("supplierBills", {
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
	snapshot: () => ({ supplierBills: G }),
	restore: (e) => {
		G = e.supplierBills;
	},
	publish: () => Ii.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierPaymentRepository.ts
var Ui = /* @__PURE__ */ new Set(), K = y.read().supplierPayments;
y.onRollback(() => {
	K = y.read().supplierPayments;
});
function Wi() {
	y.update("supplierPayments", K), Ui.forEach((e) => y.notify(e));
}
var Gi = {
	subscribe(e) {
		return Ui.add(e), () => {
			Ui.delete(e);
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
	getByBill(e) {
		return K.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: qi(e.reference),
			notes: qi(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: Ji(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = K.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (a(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = sr.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = gn.getById(e.bankAccountId);
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
			let a = Ji(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${Yi(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), l = Ji(c.reduce((e, t) => e + t.amount, 0));
		if (l <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of c) Bi.applyPayment(e.supplierBillId, e.amount);
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: Ki(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: l,
			method: e.method,
			bankAccountId: i.id,
			reference: qi(e.reference),
			notes: qi(e.notes),
			allocations: c,
			status: "POSTED",
			createdAt: u,
			updatedAt: u
		};
		return K = [d, ...K], Wi(), Pr.postSupplierPayment(d), d;
	},
	reverse(e, t) {
		let n = K.find((t) => t.id === e);
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
		return K = K.map((t) => t.id === e ? a : t), Wi(), Pr.reverseSupplierPayment(a), a;
	}
};
function Ki(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = K.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function qi(e) {
	return e?.trim() || void 0;
}
function Ji(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Yi(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD"
	}).format(e);
}
var Xi = Gi.create;
Gi.create = function(...e) {
	return v(), y.transaction(() => Xi.apply(Gi, e));
};
var Zi = Gi.reverse;
Gi.reverse = function(...e) {
	return v(), y.transaction(() => Zi.apply(Gi, e));
}, i("supplierPayments", {
	repository: Gi,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: K }),
	restore: (e) => {
		K = e.supplierPayments;
	},
	publish: () => Ui.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var Qi = /* @__PURE__ */ new Set(), q = y.read().supplierCredits, J = y.read().supplierCreditAllocations, $i = y.read().supplierCredits, ea = y.read().supplierCreditAllocations;
y.onRollback(() => {
	q = y.read().supplierCredits, J = y.read().supplierCreditAllocations, $i = q, ea = J;
});
function ta() {
	y.update("supplierCredits", q), y.update("supplierCreditAllocations", J), $i = [...q], ea = [...J], Qi.forEach((e) => y.notify(e));
}
var Y = {
	subscribe(e) {
		return Qi.add(e), () => {
			Qi.delete(e);
		};
	},
	getSnapshot() {
		return $i;
	},
	getAllocationSnapshot() {
		return ea;
	},
	getAll() {
		return $i;
	},
	getAllAllocations() {
		return ea;
	},
	getById(e) {
		return q.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return q.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return q.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return J.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return J.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return J.filter((t) => t.supplierBillId === e);
	},
	create(e) {
		let t = Bi.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (q.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!aa(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, t) => {
			let n = i.get(e.supplierBillLineId);
			if (!n) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(n.id)) throw Error(`${n.description} appears more than once in the supplier credit.`);
			a.add(n.id);
			let r = oa(e.quantity);
			if (!Number.isFinite(r) || r <= 0) throw Error(`${n.description} credit quantity must be greater than zero.`);
			if (r > n.quantity) throw Error(`${n.description} credit quantity cannot exceed the source bill quantity.`);
			let o = X(e.unitCost);
			if (!Number.isFinite(o) || o < 0) throw Error(`${n.description} unit cost cannot be negative.`);
			if (o > n.unitCost) throw Error(`${n.description} credit unit cost cannot exceed the source bill unit cost.`);
			let s = X(r * o), c = X(s * .1), l = X(s + c);
			return {
				id: ia(`supplier-credit-line-${t + 1}`),
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
		}), s = X(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = X(o.reduce((e, t) => e + t.taxAmount, 0)), l = X(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (X(X(q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > X(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: ia("supplier-credit"),
			creditNumber: ra(e.creditDate),
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
		return q = [d, ...q], ta(), Pr.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = Bi.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!aa(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = X(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: ia("supplier-credit-allocation"),
			allocationNumber: na(e.allocationDate),
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
		let o = X(t.amountApplied + r), s = X(Math.max(0, t.totals.total - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return J = [a, ...J], q = q.map((e) => e.id === t.id ? c : e), ta(), a;
	},
	reverseAllocation(e) {
		let t = J.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = q.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = Bi.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		Bi.reverseCredit(i.id, t.amount);
		let o = X(Math.max(0, r.amountApplied - t.amount)), s = X(Math.max(0, r.totals.total - o)), c = {
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
		return q = q.map((e) => e.id === r.id ? c : e), J = J.map((e) => e.id === t.id ? l : e), ta(), l;
	},
	voidCredit(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (J.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return q = q.map((e) => e.id === t.id ? i : e), ta(), Pr.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!J.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return J = J.map((t) => t.id === e.id ? e : t), ta(), e;
	},
	update(e) {
		if (!q.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return q = q.map((t) => t.id === e.id ? e : t), ta(), e;
	}
};
function na(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = J.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function ra(e) {
	let t = `SC-${e.slice(0, 4)}-`, n = q.filter((e) => e.creditNumber.startsWith(t)).map((e) => Number.parseInt(e.creditNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function ia(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function aa(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function X(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function oa(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var sa = Y.create;
Y.create = function(...e) {
	return v(), y.transaction(() => sa.apply(Y, e));
};
var ca = Y.applyToBill;
Y.applyToBill = function(...e) {
	return v(), y.transaction(() => ca.apply(Y, e));
};
var la = Y.reverseAllocation;
Y.reverseAllocation = function(...e) {
	return v(), y.transaction(() => la.apply(Y, e));
};
var ua = Y.voidCredit;
Y.voidCredit = function(...e) {
	return v(), y.transaction(() => ua.apply(Y, e));
};
var da = Y.update;
Y.update = function(...e) {
	return v(), y.transaction(() => da.apply(Y, e));
};
var fa = Y.updateAllocation;
Y.updateAllocation = function(...e) {
	return v(), y.transaction(() => fa.apply(Y, e));
}, i("supplierCredits", {
	repository: Y,
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
		supplierCredits: q,
		allocations: J
	}),
	restore: (e) => {
		q = e.supplierCredits, J = e.allocations, $i = [...q], ea = [...J];
	},
	publish: () => Qi.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function pa(e) {
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
//#region src/features/banking/data/bankTransactionRepository.ts
var ma = /* @__PURE__ */ new Set(), ha = y.read().transactions, ga = y.read().transfers;
y.onRollback(() => {
	let e = y.read();
	ha = e.transactions, ga = e.transfers;
});
function _a() {
	ma.forEach((e) => y.notify(e));
}
function va(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function ya(e) {
	return e?.trim() || void 0;
}
function ba(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function xa(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Sa(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Ca(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var wa = {
	subscribe(e) {
		return ma.add(e), () => {
			ma.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return ha;
	},
	getTransfersSnapshot() {
		return ga;
	},
	getTransactions() {
		return ha;
	},
	getTransfers() {
		return ga;
	},
	createTransaction(e, t) {
		if (ba(e.transactionDate), a(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = xa(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = va(e.description, "Description"), i = gn.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let o = S.requireById(i.glAccountId);
		if (!o.active) throw Error("The selected bank GL account is inactive.");
		let s = S.requireById(e.offsetAccountId);
		if (!s.active) throw Error("The offset account is inactive.");
		if (!s.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (s.id === o.id) throw Error("Bank and offset accounts must be different.");
		if (gn.getByGlAccountId(s.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let c = Sa("banktxn"), l = Ca("BTXN", e.transactionDate, ha.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = h.begin(u, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = ha.find((e) => e.id === t.operation.resultId);
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
				reference: ya(e.reference),
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
				reference: ya(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [a, ...ha];
			if (y.update("transactions", d), ha = d, _a(), u) {
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
		ba(e.transferDate), a(e.transferDate, "Transfer date");
		let n = xa(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = va(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = gn.requireById(e.fromBankAccountId), o = gn.requireById(e.toBankAccountId);
		if (!i.active || !o.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== o.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < o.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let s = S.requireById(i.glAccountId), c = S.requireById(o.glAccountId);
		if (!s.active || !c.active) throw Error("Both bank GL accounts must be active.");
		if (s.id === c.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let l = Sa("banktrf"), u = Ca("BTRF", e.transferDate, ga.length + 1), d = t?.trim();
		if (t !== void 0 && !d) throw Error("Operation ID cannot be empty");
		if (d) {
			let t = h.begin(d, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = ga.find((e) => e.id === t.operation.resultId);
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
				reference: ya(e.reference),
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
				reference: ya(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [a, ...ga];
			if (y.update("transfers", f), ga = f, _a(), d) {
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
}, Ta = wa.createTransaction;
wa.createTransaction = function(e, t) {
	v();
	let n;
	try {
		return n = y.transaction(() => Ta.call(wa, e, t)), t && h.complete(t.trim(), n.id), n;
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
var Ea = wa.createTransfer;
wa.createTransfer = function(e, t) {
	v();
	let n;
	try {
		return n = y.transaction(() => Ea.call(wa, e, t)), t && h.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = h.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				h.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, i("bankTransactions", {
	repository: wa,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: ha,
		bankTransfers: ga
	}),
	restore: (e) => {
		ha = e.bankTransactions, ga = e.bankTransfers;
	},
	publish: () => ma.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function Da() {
	return pa({
		transactions: wa.getTransactions(),
		transfers: wa.getTransfers(),
		payments: xn.getAll(),
		journals: w.getAll(),
		invoices: Rn.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: D.getAll(),
		supplierBills: Bi.getAll(),
		supplierPayments: Gi.getAll(),
		supplierCredits: Y.getAll()
	});
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function Oa(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= ja(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: Ma(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => ka(e, r)), a = Ma(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && Aa(t, r)), s = Ma(o.reduce((e, t) => e + t.amount, 0)), c = Ma(e.totals.total), l = Ma(Math.max(0, c - a - s));
	return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: c,
		amountPaid: a,
		amountCredited: s,
		amountDue: l,
		appliedPaymentCount: i.length,
		appliedCreditCount: o.length
	};
}
function ka(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < ja(e.reversedAt) : !1;
}
function Aa(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < ja(e.reversedAt) : !1;
}
function ja(e) {
	return r(e);
}
function Ma(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function Na(e, t, n) {
	let r = Ia(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= Fa(e.voidedAt)) return Pa(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && Aa(t, n)), a = Ia(i.reduce((e, t) => e + t.amount, 0)), o = Ia(Math.max(0, r - a));
	return {
		creditNoteId: e.id,
		asOfDate: n,
		creditTotal: r,
		amountApplied: a,
		amountAvailable: o,
		activeAllocationCount: i.length,
		isEffective: !0
	};
}
function Pa(e, t, n) {
	return {
		creditNoteId: e,
		asOfDate: t,
		creditTotal: n,
		amountApplied: 0,
		amountAvailable: 0,
		activeAllocationCount: 0,
		isEffective: !1
	};
}
function Fa(e) {
	return r(e);
}
function Ia(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function La(e, t, n = [], r = [], i = [], a = Ba()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = Oa(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = Ra(e.dueDate, a);
		if (i <= 0) {
			s.current += t;
			continue;
		}
		if (l += t, d += 1, i <= 30) {
			s.days1To30 += t;
			continue;
		}
		if (i <= 60) {
			s.days31To60 += t;
			continue;
		}
		if (i <= 90) {
			s.days61To90 += t;
			continue;
		}
		s.days90Plus += t;
	}
	let f = {
		current: Va(s.current),
		days1To30: Va(s.days1To30),
		days31To60: Va(s.days31To60),
		days61To90: Va(s.days61To90),
		days90Plus: Va(s.days90Plus)
	}, p = Va(c), m = Va(l), ee = Va(i.reduce((t, n) => n.customerId === e.id ? t + Na(n, r, a).amountAvailable : t, 0)), te = Va(p - ee);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: ee,
		netAccountBalance: te,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: Va(Math.max(0, e.creditLimit - Math.max(0, te))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function Ra(e, t = Ba()) {
	let n = za(e), r = za(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function za(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function Ba() {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function Va(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function Ha(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ua(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function Wa(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? Ha(t - n) : Ha(n - t);
}
function Ga(e, t, n) {
	Ua(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = Ha(t + r.debit), n = Ha(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: Wa(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = Ha(r.reduce((e, t) => e + t.totalDebit, 0)), o = Ha(r.reduce((e, t) => e + t.totalCredit, 0));
	return {
		asOfDate: n,
		totalDebit: a,
		totalCredit: o,
		balanced: a === o,
		accountBalances: i
	};
}
//#endregion
//#region src/features/accounting/data/accountsReceivableGlReconciliationService.ts
function Ka(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function qa({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = La(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: Ka(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = Ka(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = Ka(Ga(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = Ka(l - d);
	return {
		asOfDate: s,
		customerBalances: c,
		arSubledgerBalance: l,
		glAccountsReceivableBalance: d,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/purchases/data/supplierBillBalanceAsAtService.ts
function Ja(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && Ya(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = Xa(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && Ya(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = Xa(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && Ya(n.reversedAt) <= r ? t : t + n.amount, 0)), o = Xa(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: Xa(Math.max(0, o - i - a))
	};
}
function Ya(e) {
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) return e.slice(0, 10);
	let n = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Pacific/Auckland",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(t), r = n.find((e) => e.type === "year")?.value, i = n.find((e) => e.type === "month")?.value, a = n.find((e) => e.type === "day")?.value;
	return !r || !i || !a ? e.slice(0, 10) : `${r}-${i}-${a}`;
}
function Xa(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function Za(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && Qa(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = $a(e.totals.total), i = $a(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && Qa(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: $a(Math.max(0, r - i))
	};
}
function Qa(e) {
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) return e.slice(0, 10);
	let n = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Pacific/Auckland",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(t), r = n.find((e) => e.type === "year")?.value, i = n.find((e) => e.type === "month")?.value, a = n.find((e) => e.type === "day")?.value;
	return !r || !i || !a ? e.slice(0, 10) : `${r}-${i}-${a}`;
}
function $a(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function eo(e, t, n = [], r = [], i = [], a = oo()) {
	let o = ro(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = Ja(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = no(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = Z(r.reduce((t, n) => n.supplierId === e.id ? t + Za(n, i, a).amountAvailable : t, 0)), p = Z(s), m = Z(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: Z(c),
		aging: io(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function to(e, t, n = [], r = [], i = [], a = oo()) {
	let o = ro(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let ee of e) {
		let e = eo(ee, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: Z(s),
		unallocatedCredit: Z(c),
		totalOutstanding: Z(l),
		overdueAmount: Z(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: io(o)
	};
}
function no(e, t = oo()) {
	let n = ao(e), r = ao(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function ro() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function io(e) {
	return {
		current: Z(e.current),
		days1To30: Z(e.days1To30),
		days31To60: Z(e.days31To60),
		days61To90: Z(e.days61To90),
		days90Plus: Z(e.days90Plus)
	};
}
function ao(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function Z(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function oo() {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function so(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function co({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = to(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = so(Ga(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = so(c.totalOutstanding), f = so(d - u);
	return {
		asOfDate: s,
		grossOutstanding: so(c.grossOutstanding),
		unallocatedCredit: so(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function lo(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function uo(e) {
	return e.slice(0, 10);
}
function fo(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function po(e, t) {
	lo(t);
	let n = e.filter((e) => uo(e.occurredAt) <= t).slice().sort(fo), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = z(n.quantityOnHand + e.quantityBase), a = B(n.inventoryValue + e.valueChange);
		if (i < 0) throw Error(`Inventory valuation produced negative quantity for product ${e.productId}.`);
		if (a < 0) throw Error(`Inventory valuation produced negative value for product ${e.productId}.`);
		r.set(t, {
			...n,
			quantityOnHand: i,
			inventoryValue: a,
			lastMovementAt: e.occurredAt
		});
	}
	let i = Array.from(r.values()).filter((e) => e.quantityOnHand !== 0 || e.inventoryValue !== 0).map((e) => {
		let t = Ir.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = O(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : Cr(e.inventoryValue / e.quantityOnHand);
		return {
			siteId: t.id,
			siteCode: t.code,
			siteName: t.name,
			productId: n.id,
			sku: n.sku,
			productName: n.name,
			baseUnitId: r.id,
			baseUnitSymbol: r.symbol,
			quantityOnHand: e.quantityOnHand,
			averageCostPerBaseUnit: i,
			inventoryValue: e.inventoryValue,
			lastMovementAt: e.lastMovementAt
		};
	}).sort((e, t) => e.siteCode.localeCompare(t.siteCode) || e.sku.localeCompare(t.sku));
	return {
		asOfDate: t,
		rows: i,
		totalQuantity: z(i.reduce((e, t) => e + t.quantityOnHand, 0)),
		totalInventoryValue: B(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function mo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ho(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function go({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	ho(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = po(n, r), o = mo(Ga(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = mo(a.totalInventoryValue), c = mo(s - o);
	return {
		asOfDate: r,
		inventoryAccountId: i.id,
		inventoryAccountCode: i.code,
		inventoryAccountName: i.name,
		subledgerInventoryValue: s,
		glInventoryBalance: o,
		difference: c,
		reconciled: c === 0,
		valuationLineCount: a.rows.length,
		siteCount: a.siteCount,
		productCount: a.productCount
	};
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function _o(e) {
	let t = s(), n = [], i = (e, t) => n.push({
		code: e,
		message: t
	});
	e.endDate >= r((/* @__PURE__ */ new Date()).toISOString()) && i("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of h.getUnresolved()) i("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && i("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of Da()) i(e.code, `${e.entityId}: ${e.message}`);
	let a = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, o = [
		["AR", () => qa({
			...a,
			customers: t.customers.customers,
			documents: [
				...t.sales.quotes,
				...t.sales.salesOrders,
				...t.sales.invoices
			],
			payments: t.customerPayments.payments,
			creditNotes: t.customerCredits.creditNotes,
			creditAllocations: t.customerCredits.allocations
		})],
		["AP", () => co({
			...a,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => go({
			...a,
			costMovements: t.costMovements.movements
		})]
	];
	for (let [t, n] of o) try {
		let r = n();
		(!r.reconciled || !Number.isFinite(r.difference)) && i(`${t}_DIFFERENCE`, `${t} to GL difference at ${e.endDate}: ${r.difference}.`);
	} catch (e) {
		i(`${t}_CHECK_FAILED`, e instanceof Error ? e.message : String(e));
	}
	for (let n of t.bankAccounts.bankAccounts) (t.journals.journalEntries.some((t) => t.journalDate <= e.endDate && t.lines.some((e) => e.accountId === n.glAccountId)) || n.openingBalance !== 0 && n.openingBalanceDate <= e.endDate) && !t.bankReconciliations.reconciliations.some((t) => t.bankAccountId === n.id && t.statementDate >= e.endDate && t.status === "COMPLETED" && t.difference === 0) && i("BANK_NOT_RECONCILED", `Reconcile ${n.name ?? n.id} through ${e.endDate}.`);
	let c = t.journals.journalEntries.filter((t) => t.journalDate >= e.startDate && t.journalDate <= e.endDate), l = (e) => Math.round((e + 2 ** -52) * 100) / 100, u = l(c.reduce((e, t) => e + t.totalDebit, 0)), d = l(c.reduce((e, t) => e + t.totalCredit, 0));
	return (!Number.isFinite(u) || !Number.isFinite(d) || u !== d) && i("TRIAL_BALANCE", "Period journal debits and credits do not balance."), {
		blockers: n,
		journalCount: c.length,
		debit: u,
		credit: d
	};
}
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function vo(e) {
	return S.requireBySystemRole(e).id;
}
function yo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function bo(e) {
	return w.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function xo(e) {
	let t = Xr.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var So = {
	postSalesFulfilment(e) {
		let t = bo(e.id);
		if (t) return t;
		let n = yo(xo(e).reduce((e, t) => {
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
				accountId: vo("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: vo("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = bo(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? w.getById(r.reversalJournalEntryId) : void 0 : w.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, Co = /* @__PURE__ */ new Set(), Q = [], wo = Q;
function To() {
	wo = Q, Co.forEach((e) => e());
}
function Eo() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Q.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Do(e, t) {
	return z(Q.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function Oo(e) {
	let t = Rn.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.map((e) => Do(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.every((e, t) => n[t] >= z(e.quantity));
	Rn.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function ko(e) {
	let t = Xr.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
i("fulfilments", {
	repository: {
		subscribe(e) {
			return Co.add(e), () => {
				Co.delete(e);
			};
		},
		getSnapshot() {
			return wo;
		},
		getAll() {
			return wo;
		},
		getById(e) {
			return Q.find((t) => t.id === e);
		},
		getBySalesOrder(e) {
			return Q.filter((t) => t.salesOrderId === e);
		},
		getFulfilledQuantity: Do,
		getRemainingQuantity(e, t) {
			let n = Rn.getById(e);
			if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			let r = n.lines.find((e) => e.id === t);
			if (!r) throw Error("Sales order line was not found.");
			return z(r.quantity - Do(e, t));
		},
		create(e) {
			let t = Rn.getById(e.salesOrderId);
			if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			let n = t;
			if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
			let r = Ir.getById(e.siteId);
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
				let o = Lt(t.productId, t.unitId);
				if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
				if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
				let s = z(e.fulfilledQuantity), c = Do(n.id, t.id);
				if (s > z(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
				let l = z(s * o.conversionToBase), u = mi.getBalance(r.id, t.productId);
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
				s.set(e.orderLine.productId, z(t + e.fulfilledBaseQuantity));
			}
			for (let [e, t] of s) {
				let n = mi.getBalance(r.id, e);
				if (!n || n.quantityOnHand < t) {
					let t = O(e);
					throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
				}
			}
			let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = Eo(), d = o.map((e) => ({
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
				let a = Vr.create({
					movementType: "SALE",
					siteId: r.id,
					productId: t.productId,
					baseUnitId: i.baseUnitId,
					quantityBase: z(-t.fulfilledBaseQuantity),
					transactionUnitId: t.unitId,
					transactionUnitSymbol: t.unitSymbol,
					transactionQuantity: z(-t.fulfilledQuantity),
					conversionToBase: t.conversionToBase,
					referenceType: "SALES_FULFILMENT",
					referenceId: f.id,
					referenceNumber: f.fulfilmentNumber,
					salesOrderId: n.id,
					salesOrderNumber: n.documentNumber,
					occurredAt: e.fulfilmentDate,
					notes: `Sales fulfilment ${f.fulfilmentNumber}`
				});
				li({
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
				}), mi.issue({
					siteId: r.id,
					productId: t.productId,
					baseUnitId: i.baseUnitId,
					quantityBase: t.fulfilledBaseQuantity
				});
			}
			return So.postSalesFulfilment(f), Q = [f, ...Q], To(), Oo(n.id), f;
		},
		void(e) {
			let t = Q.find((t) => t.id === e.fulfilmentId);
			if (!t) throw Error("Sales fulfilment was not found.");
			if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
			if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
			if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
			let n = e.reason.trim();
			if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
			let r = Rn.getById(t.salesOrderId);
			if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			if (r.status === "INVOICED") throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
			if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
			let i = ko(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
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
			So.reverseSalesFulfilment({
				fulfilment: t,
				reversalDate: e.voidDate,
				reason: n
			});
			for (let r of o) {
				let { line: i, product: a, originalIssue: o } = r, s = Vr.create({
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
				ui({
					siteId: t.siteId,
					productId: i.productId,
					quantityBase: i.fulfilledBaseQuantity,
					unitCostBase: o.unitCostBase,
					inventoryValue: B(Math.abs(o.valueChange)),
					referenceType: "SALE",
					referenceId: t.id,
					referenceNumber: t.fulfilmentNumber,
					inventoryMovementId: s.id,
					occurredAt: e.voidDate,
					notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
				}), mi.receive({
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
			return Q = Q.map((e) => e.id === s.id ? s : e), To(), Oo(t.salesOrderId), s;
		}
	},
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: Q }),
	restore: (e) => {
		Q = e.fulfilments, wo = Q;
	},
	publish: () => Co.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchasePostingRecoveryAuthorization.ts
var Ao = null, jo = {
	configureTrustedSession(e) {
		Ao = e;
	},
	clear() {
		Ao = null;
	},
	current() {
		return Ao?.() ?? null;
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
}, Mo = "htt.purchasePosting.manualRecoveryAudit.v1";
function No() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(Mo) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var Po = No();
function Fo(e) {
	Po.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(Mo, JSON.stringify(Po));
	} catch {}
}
i("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return Po.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = _.get(e);
			return jo.canRecover() && t?.status === "RECOVERY_REQUIRED" && _.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = jo.requireRecoveryPermission(), n = _.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!_.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				_.recover(e), Fo({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw Fo({
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
	snapshot: () => Po,
	restore: (e) => {
		Po.splice(0, Po.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/contacts/data/mockCustomers.ts
var Io = [
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
], Lo = "htt.mock.contacts.customers.v1";
function Ro(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var zo = ie(Lo, Ro), Bo = zo.status !== "invalid" && oe(Lo), Vo = /* @__PURE__ */ new Set(), Ho = zo.status === "ok" ? zo.data : structuredClone(Io);
function Uo() {
	Bo && ae(Lo, Ho), Vo.forEach((e) => {
		e();
	});
}
function Wo(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Go() {
	let e = Ho.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function $(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Ko(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function qo(e, t) {
	let n = !1;
	if (Ho = Ho.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	Uo();
}
var Jo = {
	subscribe(e) {
		return Vo.add(e), () => {
			Vo.delete(e);
		};
	},
	getSnapshot() {
		return Ho;
	},
	getAll() {
		return Ho;
	},
	getById(e) {
		return Ho.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Wo("cus"),
			code: Go(),
			businessName: e.businessName.trim(),
			tradingName: $(e.tradingName),
			abn: Ko(e.abn),
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
		return Ho = [n, ...Ho], Uo(), n;
	},
	update(e, t) {
		let n;
		if (qo(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: $(t.tradingName),
			abn: Ko(t.abn),
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
		let n = Jo.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: Wo("loc"),
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
		return qo(e, (e) => ({
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
		let r = Jo.getById(e);
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
		return qo(e, (e) => ({
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
		let n = Jo.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: Wo("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: $(t.jobTitle),
			email: t.email.trim(),
			phone: $(t.phone),
			mobile: $(t.mobile),
			locationId: $(t.locationId),
			isPrimary: r
		};
		return qo(e, (e) => ({
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
		let r = Jo.getById(e);
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
		return qo(e, (e) => ({
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
i("customers", {
	repository: Jo,
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
	snapshot: () => ({ customers: Ho }),
	restore: (e) => {
		Ho = e.customers;
	},
	publish: () => Vo.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankRegisterService.ts
function Yo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Xo(e, t) {
	a(e, t);
}
function Zo(e, t, n) {
	Xo(e.openingBalanceDate, "Opening balance date"), Xo(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = Yo(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = Yo(n.debit), s = Yo(n.credit);
		return a = Yo(a + r), o = Yo(o + s), i = Yo(i + r - s), {
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
		openingBalance: Yo(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function Qo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function $o(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = Qo(i + t.moneyIn), a = Qo(a + t.moneyOut);
			continue;
		}
		o = Qo(o + t.moneyIn), s = Qo(s + t.moneyOut);
	}
	let c = Qo(Qo(t) + o - s), l = Qo(e.closingBalance), u = Qo(c - l);
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
var es = /* @__PURE__ */ new Set(), ts = y.read().reconciliations;
y.onRollback(() => {
	ts = y.read().reconciliations;
});
function ns() {
	y.update("reconciliations", ts), es.forEach((e) => y.notify(e));
}
function rs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function is(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function as() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function os(e) {
	return `BREC-${e.slice(0, 4)}-${String(ts.length + 1).padStart(4, "0")}`;
}
function ss(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of ts) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var cs = {
	subscribe(e) {
		return es.add(e), () => {
			es.delete(e);
		};
	},
	getSnapshot() {
		return ts;
	},
	getAll() {
		return ts;
	},
	getByBankAccount(e) {
		return ts.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return ss(e);
	},
	complete(e) {
		if (is(e.statementDate), a(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = gn.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = Zo(t, w.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), o = ss(t.id), s = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !o.has(e));
		for (let e of s) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let c = /* @__PURE__ */ new Set([...o, ...s]), l = $o(r, rs(e.statementBalance), Array.from(c));
		if (!l.reconciled) throw Error(`Bank reconciliation is out by ${l.difference.toFixed(2)}.`);
		let u = {
			id: as(),
			reconciliationNumber: os(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: rs(e.statementBalance),
			bookBalance: l.bookBalance,
			outstandingDeposits: l.outstandingDeposits,
			outstandingPayments: l.outstandingPayments,
			adjustedStatementBalance: l.adjustedStatementBalance,
			difference: l.difference,
			clearedTransactionIds: s,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ts = [u, ...ts], ns(), u;
	}
}, ls = cs.complete;
cs.complete = function(e) {
	return v(), y.transaction(() => ls.call(cs, e));
}, i("bankReconciliations", {
	repository: cs,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: ts }),
	restore: (e) => {
		ts = e.reconciliations;
	},
	publish: () => es.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var us = !1;
function ds() {
	if (us || (us = !0, y.wasRestoredOnLoad())) return;
	let e = Rn.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) M.postInvoice(t), t.status === "VOID" && M.reverseInvoice(t);
	let t = xn.getAll();
	for (let e of t) M.postPayment(e), e.status === "REVERSED" && M.reversePayment(e);
	let n = D.getAll();
	for (let e of n) e.status !== "DRAFT" && (M.postCreditNote(e), e.status === "VOID" && M.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function fs() {
	let e = Da().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/security/trustedAuthorization.ts
var ps = null, ms = {
	connect(e) {
		return ps = e, () => {
			ps === e && (ps = null);
		};
	},
	disconnect() {
		ps = null;
	},
	current() {
		return ps?.() ?? null;
	},
	require(e) {
		return t(this.current(), e);
	}
}, hs = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function gs(t) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let r = e("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [t]
		});
		return n(r.view), r.result;
	}
	if (!t.businessRecordChecked || !t.originalGlChecked || !t.reversalGlChecked || !t.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let r = h.list().find((e) => e.operationId === t.operationId);
	if (!r || !hs.has(r.kind)) throw Error("Sales operation not found.");
	if (r.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return h.recordManualReview(t.operationId, t.reference, t.operator, t.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var _s = (e) => Math.round(e * 100);
function vs(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + _s(t.amount), 0), s = a.reduce((e, t) => e + _s(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (_s(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), _s(t.amountDue) !== Math.max(0, _s(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > _s(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + _s(t.amount), 0);
		_s(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || _s(t.amountAvailable) !== 0 : _s(t.amountAvailable) !== _s(t.totals.total) - a) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var ys = {
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
function bs(e) {
	return vs(e).map((e) => ({
		...e,
		action: ys[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var xs = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Ss(e, t) {
	let n = bs(e).map((e) => ({ ...e })), r = t.filter((e) => xs.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => xs.has(e.kind))) s.has(e.operationId) && n.push({
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
function Cs() {
	let e = Rn.getAll();
	return Ss({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: xn.getAll(),
		creditNotes: D.getAll(),
		allocations: D.getAllAllocations(),
		journals: w.getAll()
	}, h.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var ws = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Ts(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!ws.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = Ss(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function Es() {
	let e = Rn.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: xn.getAll(),
		creditNotes: D.getAll(),
		allocations: D.getAllAllocations(),
		journals: w.getAll()
	};
}
function Ds(t) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let r = e("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [t]
		});
		return n(r.view), r.result;
	}
	let r = h.list(), i = Ts(Es(), r, t.operationId);
	if (i.length) throw Error(`Sales recovery remains blocked: ${i.join(" ")}`);
	let a = r.find((e) => e.operationId === t.operationId);
	return {
		closed: h.closeReviewed(t.operationId, a.resultId, t.approvalReference, t.approver),
		remaining: Cs()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
i("salesRecovery", {
	repository: {
		recordSalesManualReview: gs,
		closeVerifiedSalesReview: Ds
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
function Os(e) {
	f(_o, () => e()?.userId ?? ""), ms.connect(e), jo.configureTrustedSession(e), ds(), fs();
}
//#endregion
export { ne as assertPostingPeriod, Os as initialize };
