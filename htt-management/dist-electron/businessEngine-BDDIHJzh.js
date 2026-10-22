import { $ as e, B as t, E as n, F as r, G as i, H as a, I as o, J as s, K as c, L as l, M as u, P as d, Q as f, R as p, S as m, U as h, V as g, W as _, X as v, Y as y, Z as ee, _ as te, a as ne, b as re, c as ie, d as b, et as ae, f as x, g as oe, h as se, it as ce, j as le, k as ue, l as S, m as de, n as fe, nt as pe, o as me, p as C, q as w, r as he, rt as ge, s as _e, t as ve, tt as ye, u as T, v as be, w as xe, x as Se, y as Ce } from "./accountingPeriodValidation-BanyVM6p.js";
import { createHash as we } from "node:crypto";
//#region \0rolldown/runtime.js
var Te = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/iso.js
function Ee(e) {
	return f(t, e);
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
}];
//#endregion
//#region src/lib/persistence/mockRepositoryStorage.ts
function ke() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Ae(e, t) {
	let n = ke();
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
function je(e, t) {
	let n = ke();
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
function Me(e) {
	let t = ke();
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
//#region src/lib/persistence/financialStateStorage.ts
var E = "htt:financial-snapshot:v1", Ne = (e) => !!e && typeof e == "object" && !Array.isArray(e), Pe = (e) => new Set(e.map((e) => e.id)).size === e.length, Fe = (e) => {
	if (!Ne(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => Ne(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => Ne(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => Ne(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => Ne(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => Ne(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && Ne(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && Ne(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && Ne(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && Pe(t) && Pe(n) && Pe(r) && Pe(i);
}, Ie = () => ({
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
}), Le, Re = !1;
function ze() {
	return typeof window < "u" && !!window.localStorage;
}
function Be() {
	if (Le) return Le;
	if (!ze()) return Ie();
	let e = Ae(E, Fe);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return Re = e.status === "ok", Le = e.status === "ok" ? {
		...Ie(),
		...e.data
	} : Ie(), Le;
}
var Ve = /* @__PURE__ */ new Set(), He = 0, Ue = /* @__PURE__ */ new Set();
function We(e) {
	if (ze() && !je(E, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var D = {
	wasRestoredOnLoad() {
		return Be(), Re;
	},
	onRollback(e) {
		Ve.add(e);
	},
	notify(e) {
		He ? Ue.add(e) : e();
	},
	transaction(e) {
		if (He) return e();
		let t = structuredClone(Be());
		Le = structuredClone(t), He++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			We(Be());
		} catch (e) {
			throw Le = t, Ve.forEach((e) => e()), Ue.clear(), e;
		} finally {
			He--;
		}
		let r = [...Ue];
		return Ue.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(Be());
	},
	update(e, t) {
		let n = {
			...Be(),
			[e]: structuredClone(t)
		};
		if (!Fe(n)) throw Error("Invalid financial snapshot; write blocked.");
		He || We(n), Le = n;
	},
	resetCacheForTests() {
		Le = void 0, Re = !1;
	}
};
m("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => D.read(),
	restore: (e) => {
		Le = e;
	},
	publish: () => {}
});
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var Ge = "htt:financial-operations:v1", Ke = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
];
function qe() {
	let e = Ae(Ge, fe);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function Je(e) {
	if (!Me(Ge) || !je(Ge, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var O = {
	list() {
		return qe().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !Ke.includes(t)) throw Error("Invalid operation identity.");
		let r = qe(), i = r.find((t) => t.operationId === e);
		if (i) {
			if (i.resolution === "CANCELLED_NO_EFFECT") throw Error("Operation ID was retired after verified no-effect cancellation. Use a new operation ID for a new transaction.");
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
		return Je([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = qe(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Je(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = qe(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.resolution === "CANCELLED_NO_EFFECT") throw Error("Cancelled operation ID cannot complete or replay.");
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
		return Je(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = qe(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Je(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = qe(), a = i.find((t) => t.operationId === e);
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
		return Je(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = qe(), a = i.find((t) => t.operationId === e);
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
		return Je(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	attachRepairProposal(e, t) {
		let n = qe(), r = n.find((t) => t.operationId === e);
		if (!r || r.state !== "MANUAL_REVIEW" || !he(t) || t.status !== "PROPOSED" || !r.reviewHistory?.some((e) => e.reference === t.reference && e.operator === t.reviewer)) throw Error("Repair proposal has no trusted review evidence.");
		let i = {
			...r,
			repairProposal: structuredClone(t)
		};
		return Je(n.map((t) => t.operationId === e ? i : t)), structuredClone(i);
	},
	finishRepair(e, t, n, r, i, a) {
		let o = qe(), s = o.find((t) => t.operationId === e), c = s?.repairProposal;
		if (!s || s.state !== "MANUAL_REVIEW" || !s.resultId || !c || c.id !== t || c.status !== "PROPOSED") throw Error("Current proposed repair is required.");
		if (!n.trim() || r.trim().length < 3 || r.length > 500 || !/^[a-f0-9]{64}$/.test(i)) throw Error("Valid repair approval and post-repair digest are required.");
		if (c.reviewer.toLowerCase() === n.toLowerCase() || s.reviewHistory?.some((e) => e.operator.toLowerCase() === n.toLowerCase())) throw Error("Repair approval requires a different operator.");
		if (s.reviewHistory?.some((e) => e.reference === r.trim())) throw Error("Approval reference must differ from review evidence.");
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = c.action === "CANCEL_NO_EFFECT" ? "CANCELLED_NO_EFFECT" : c.action === "RESTORE_BANK_RECORD" ? "BANK_RECORD_RESTORED" : c.action === "REVERSE_BANK_DUPLICATE" ? "BANK_DUPLICATE_REVERSED" : c.action === "RESTORE_BANK_JOURNAL_LINK" ? "BANK_JOURNAL_LINK_RESTORED" : "BANK_JOURNAL_RESTORED", d = {
			...s,
			state: "COMPLETED",
			resolution: u,
			updatedAt: l,
			note: `Targeted repair ${u} approved by ${n} (${r.trim()}). Original operation ID retained.`,
			repairProposal: {
				...c,
				status: "EXECUTED",
				approver: n,
				approvalReference: r.trim(),
				executedAt: l,
				afterDigest: i,
				resultJournalId: a
			},
			reviewHistory: [...s.reviewHistory ?? [], {
				reference: r.trim(),
				operator: n,
				recordedAt: l,
				summary: `Independent approval and execution: ${u}; proposal ${c.id}; post-repair digest ${i}`
			}]
		};
		return Je(o.map((t) => t.operationId === e ? d : t)), structuredClone(d);
	},
	getUnresolved() {
		return qe().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
m("financialOperations", {
	repository: O,
	read: "audit.read",
	commands: {
		begin: null,
		bindResult: null,
		complete: null,
		flagForReview: "accounting.recover",
		recordManualReview: null,
		closeReviewed: null,
		attachRepairProposal: null,
		finishRepair: null
	},
	snapshot: () => [],
	restore: () => {},
	publish: () => {}
});
//#endregion
//#region src/features/security/trustedAuthorization.ts
var Ye = null, k = {
	connect(e) {
		return Ye = e, () => {
			Ye === e && (Ye = null);
		};
	},
	disconnect() {
		Ye = null;
	},
	current() {
		return Ye?.() ?? null;
	},
	require(e) {
		return p(this.current(), e);
	}
};
//#endregion
//#region src/features/sales/data/pricingInstant.ts
function Xe(e, t) {
	let n = new Intl.DateTimeFormat("en-CA", {
		timeZone: t,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(new Date(e)), r = (e) => n.find((t) => t.type === e).value;
	return `${r("year")}-${r("month")}-${r("day")}`;
}
function Ze(e) {
	let t = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(e);
	if (!t || Number(t[2]) > 23 || Number(t[3]) > 59 || Number(t[4]) > 59 || !Number.isFinite(Date.parse(e))) throw Error("Pricing time must be an ISO timestamp with seconds and an explicit UTC offset.");
	if (T(t[1], "Pricing date"), t[6] !== "Z" && (Number(t[6].slice(1, 3)) > 14 || Number(t[6].slice(4)) > 59 || Number(t[6].slice(1, 3)) === 14 && Number(t[6].slice(4)) !== 0)) throw Error("Invalid pricing UTC offset.");
	return new Date(e).toISOString();
}
function Qe(e, t, n = x().timezone, r = (/* @__PURE__ */ new Date()).toISOString()) {
	if (T(e, "Document date"), Xe(r, n), t === void 0) {
		if (Xe(r, n) === e) t = r;
		else {
			let r = Date.parse(`${e}T00:00:00Z`), i = r;
			for (let e = 0; e < 6; e++) {
				let e = new Intl.DateTimeFormat("en-GB", {
					timeZone: n,
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hourCycle: "h23"
				}).formatToParts(new Date(i)), a = (t) => e.find((e) => e.type === t).value, o = Date.parse(`${a("year")}-${a("month")}-${a("day")}T${a("hour")}:${a("minute")}:${a("second")}Z`);
				if (o === r) {
					t = new Date(i).toISOString();
					break;
				}
				i += r - o;
			}
			if (!t) throw Error("This date has no local midnight. Enter an explicit pricing time.");
		}
	}
	let i = Ze(t);
	if (Xe(i, n) !== e) throw Error("Pricing time must fall on the document date in the pricing timezone.");
	return {
		pricingAt: i,
		pricingTimezone: n
	};
}
function $e(e, t) {
	if (e.pricingAt === void 0 && e.pricingTimezone === void 0) return;
	if (!e.pricingAt || !e.pricingTimezone) throw Error("Incomplete pricing time snapshot.");
	let n = Xe(Ze(e.pricingAt), e.pricingTimezone);
	if (t && n !== t) throw Error("Pricing snapshot date does not match the document.");
}
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function et(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function tt(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function nt(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var rt = [
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
function it(e) {
	return rt.find((t) => t.id === e);
}
function at(e, t) {
	return it(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/sales/data/areaPacks.ts
function ot(e, t) {
	let n = it(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function st(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = ot(e, t);
	if (!i) throw Error("Area entry requires an active box or roll with an m² base unit.");
	if (!Number.isFinite(r) || r <= 0 || r > 1e9) throw Error("Requested area must be finite, positive and no greater than 1,000,000,000 m².");
	let a = r / i, o = Math.round(a), s = o > 0 && Math.abs(a - o) <= 2 ** -52 * Math.max(1, Math.abs(a)) * 4 ? o : Math.ceil(a);
	if (!Number.isSafeInteger(s) || s <= 0) throw Error("Invalid pack quantity.");
	return {
		quantity: s,
		requestedArea: r,
		areaPerPack: i,
		coveredArea: Math.round(s * i * 1e8) / 1e8
	};
}
function ct(e) {
	if (e.requestedArea !== void 0 || e.areaPerPack !== void 0 || e.coveredArea !== void 0) {
		if (!Number.isFinite(e.areaPerPack) || !e.areaPerPack || e.areaPerPack <= 0 || !Number.isFinite(e.coveredArea) || Math.abs(e.coveredArea - e.quantity * e.areaPerPack) > 1e-7) throw Error("Invalid saved pack coverage.");
		if (e.requestedArea !== void 0) {
			let t = e.requestedArea / e.areaPerPack, n = Math.round(t), r = n > 0 && Math.abs(t - n) <= 2 ** -52 * Math.max(1, Math.abs(t)) * 4 ? n : Math.ceil(t);
			if (!Number.isFinite(e.requestedArea) || e.requestedArea <= 0 || e.requestedArea > 1e9 || e.quantity !== r) throw Error("Invalid saved area quantity.");
		}
	}
}
//#endregion
//#region src/features/contacts/schemas/customerSchemas.ts
var lt = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], ut = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], dt = y().trim().refine((e) => e === "" || y().email().safeParse(e).success, { message: "Enter a valid email address" }), ft = y().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), pt = w({
	businessName: y().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: y().trim().max(120, "Trading name is too long"),
	abn: ft,
	businessType: g(lt),
	status: g(ut),
	email: dt,
	phone: y().trim().max(40, "Phone number is too long"),
	website: y().trim().max(200, "Website is too long"),
	creditLimit: c({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: c({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), mt = w({
	name: y().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: y().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: y().trim().max(160, "Address is too long"),
	suburb: y().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: y().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: y().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: y().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: y().trim().max(40, "Phone number is too long"),
	isPrimary: h()
}), ht = w({
	isAccounting: h().optional(),
	firstName: y().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: y().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: y().trim().max(100, "Job title is too long"),
	email: y().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: y().trim().max(40, "Phone number is too long"),
	mobile: y().trim().max(40, "Mobile number is too long"),
	locationId: y(),
	isPrimary: h()
}), gt = [
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
], _t = "htt.mock.contacts.customers.v1";
function vt(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var yt = Ae(_t, vt), bt = yt.status !== "invalid" && Me(_t), xt = /* @__PURE__ */ new Set(), St = yt.status === "ok" ? yt.data : structuredClone(gt);
function Ct() {
	bt && je(_t, St), xt.forEach((e) => {
		e();
	});
}
function wt(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Tt() {
	let e = St.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function Et(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Dt(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Ot(e, t) {
	let n = !1;
	if (St = St.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	Ct();
}
var A = {
	subscribe(e) {
		return xt.add(e), () => {
			xt.delete(e);
		};
	},
	getSnapshot() {
		return St;
	},
	getAll() {
		return St;
	},
	getById(e) {
		return St.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: wt("cus"),
			code: Tt(),
			businessName: e.businessName.trim(),
			tradingName: Et(e.tradingName),
			abn: Dt(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: Et(e.email),
			phone: Et(e.phone),
			website: Et(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return St = [n, ...St], Ct(), n;
	},
	update(e, t) {
		let n;
		if (Ot(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: Et(t.tradingName),
			abn: Dt(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: Et(t.email),
			phone: Et(t.phone),
			website: Et(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = A.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: wt("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: Et(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: Et(t.phone),
			isPrimary: r
		};
		return Ot(e, (e) => ({
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
		let r = A.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: Et(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: Et(n.phone),
			isPrimary: a
		};
		return Ot(e, (e) => ({
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
		t = ht.parse(t);
		let n = A.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: wt("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: Et(t.jobTitle),
			email: t.email.trim(),
			phone: Et(t.phone),
			mobile: Et(t.mobile),
			locationId: Et(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return Ot(e, (e) => ({
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
		n = ht.parse(n);
		let r = A.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: Et(n.jobTitle),
			email: n.email.trim(),
			phone: Et(n.phone),
			mobile: Et(n.mobile),
			locationId: Et(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return Ot(e, (e) => ({
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
m("customers", {
	repository: A,
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
	snapshot: () => ({ customers: St }),
	restore: (e) => {
		St = e.customers;
	},
	publish: () => xt.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesRecipients.ts
function kt(e, t) {
	let n = A.getById(e);
	if (!n) throw Error("Customer was not found.");
	let r = t.locationId === "" ? void 0 : t.locationId ?? n.primaryLocationId, i = n.locations.find((e) => e.id === r);
	if (r && !i) throw Error("Selected store does not belong to this customer.");
	let a = n.contacts.filter((e) => e.isAccounting && (!e.locationId || e.locationId === r)), o = t.accountingContactId === "" ? void 0 : t.accountingContactId ?? a.find((e) => e.isPrimary)?.id ?? a[0]?.id, s = n.contacts.find((e) => e.id === o);
	if (o && (!s || !s.isAccounting || s.locationId && s.locationId !== r)) throw Error("Select an accounting contact for this customer and store.");
	return {
		locationId: r,
		locationName: i?.name,
		deliveryAddress: i ? [
			i.addressLine1,
			i.addressLine2,
			i.suburb,
			i.state,
			i.postcode,
			i.country
		].filter(Boolean).join(", ") : void 0,
		accountingContactId: s?.id,
		accountingContactName: s ? `${s.firstName} ${s.lastName}` : void 0,
		accountingEmail: s?.email
	};
}
function At(e) {
	if (e === void 0) return;
	if (!e || typeof e != "object" || Array.isArray(e)) throw Error("Invalid recipient snapshot.");
	let t = [
		"locationId",
		"locationName",
		"deliveryAddress",
		"accountingContactId",
		"accountingContactName",
		"accountingEmail"
	];
	if (Object.entries(e).some(([e, n]) => !t.includes(e) || n !== void 0 && (typeof n != "string" || n.length > 2e3))) throw Error("Invalid recipient snapshot.");
}
//#endregion
//#region src/features/banking/data/reconciliationLock.ts
function jt(e, t) {
	let r = n(), i = r.journals?.journalEntries ?? [], a = r.bankReconciliations?.reconciliations ?? [], o = i.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (a.some((e) => e.clearedTransactionIds.some((e) => o.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Mt(e, t) {
	let r = n(), i = r.bankAccounts?.bankAccounts ?? [], a = r.bankReconciliations?.reconciliations ?? [];
	for (let n of i.filter((e) => t.includes(e.glAccountId))) {
		let t = a.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
function Nt(e) {
	if (n().bankStatements?.lines.some((t) => t.status === "MATCHED" && t.ledgerIds.some((t) => t.startsWith(e + ":")))) throw Error("Unmatch the bank statement line before reversing its ledger source.");
}
//#endregion
//#region src/features/purchases/data/purchasePostingOperationRepository.ts
var Pt = /* @__PURE__ */ new Map(), Ft = "htt.purchasePosting.operations.v1";
function It() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function Lt() {
	let e = It();
	if (e) try {
		e.setItem(Ft, JSON.stringify([...Pt.values()]));
	} catch {}
}
function Rt() {
	let e = It();
	if (e) try {
		let t = JSON.parse(e.getItem(Ft) ?? "[]");
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
			Pt.set(t.key, {
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
Rt();
var zt = /* @__PURE__ */ new Set(), Bt = /* @__PURE__ */ new Map(), Vt = /* @__PURE__ */ new Map(), Ht;
function Ut() {
	Lt(), zt.forEach((e) => e());
}
var j = {
	injectFailureBeforeStep(e, t, n = 1) {
		Vt.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Vt.clear();
	},
	registerRecovery(e, t) {
		if (!Pt.has(e)) throw Error(`Unknown posting operation: ${e}`);
		Bt.set(e, t);
	},
	runStep(e, t, n) {
		let r = Pt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Vt.get(i) ?? 0;
		if (a > 0) throw Vt.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return Bt.has(e);
	},
	recover(e) {
		let t = Pt.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = Bt.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Ht === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Ht = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Ht = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = Pt.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...Pt.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return zt.add(e), () => {
			zt.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (Pt.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Pt.set(n, r), Ut(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = Pt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		Pt.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Ut();
	},
	completeStep(e, t) {
		let n = Pt.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (Pt.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Ut());
	}
};
m("purchaseOperations", {
	repository: j,
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
	snapshot: () => j.getAll(),
	restore: (e) => {
		Pt.clear(), Bt.clear();
		for (let t of e) Pt.set(t.key, t);
	},
	publish: () => zt.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Wt = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Gt(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Wt.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function M() {
	Gt(O.list(), j.getAll());
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var Kt = "htt.mock.sales.quotes.v1", qt = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function Jt(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !qt.has(String(t.status)) || ![
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
function Yt() {
	return Ae(Kt, Jt);
}
function Xt(e) {
	if (Yt().status === "invalid" || !Me("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!je("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Zt = "htt.mock.sales.quote-orders.v1";
function Qt(e) {
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
function $t(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!Jt(t.quotes) || !Qt(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function en() {
	return Ae(Zt, $t);
}
function tn(e) {
	if (!$t(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = en(), n = Yt();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !Me("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!je("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var nn = "htt.mock.sales.documents.v1";
function rn(e) {
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
function an(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!$t(t) || !rn(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function on() {
	return Ae(nn, an);
}
function sn(e) {
	if (!an(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = on();
	if (t.status === "invalid" || t.status === "unavailable" || !Me("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!je("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var cn = [], ln, un, dn = /* @__PURE__ */ new Set();
function fn(e, t) {
	ln = e, un = t;
}
function pn() {
	let e = un?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function mn(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function hn(e) {
	let t = cn.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function gn() {
	dn.forEach((e) => e());
}
function _n(e) {
	if (T(e, "Posting date"), !cn.length) return;
	let t = cn.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!cn.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
m("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => cn,
		subscribe(e) {
			return dn.add(e), () => {
				dn.delete(e);
			};
		},
		create(e) {
			let t = pn(), n = mn(e.reason);
			if (T(e.startDate), T(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (cn.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (cn.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return cn = [...cn, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), gn(), r;
		},
		preflight(e) {
			let t = hn(e);
			if (!ln) throw Error("Trusted close checks unavailable.");
			return ln(t);
		},
		close(e) {
			let t = pn(), n = mn(e.reason), r = hn(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (cn.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return cn = cn.map((e) => e.id === r.id ? {
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
			} : e), gn(), hn(e.id);
		},
		reopen(e) {
			let t = pn(), n = mn(e.reason), r = hn(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (cn.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return cn = cn.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), gn(), hn(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: cn }),
	restore: (e) => {
		ve(e.periods), cn = e.periods;
	},
	publish: gn
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var vn = /* @__PURE__ */ new Set(), N = "2026-10-08T00:00:00.000Z", yn = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
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
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
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
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	}
];
function bn() {
	vn.forEach((e) => e());
}
function xn(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Sn(e) {
	return e?.trim() || void 0;
}
function Cn(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function wn(e, t) {
	if (yn.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function Tn(e, t) {
	if (!e) return;
	let n = yn.find((n) => n.id !== t && (te(e) ? n.id === te(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function En() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var P = {
	subscribe(e) {
		return vn.add(e), () => {
			vn.delete(e);
		};
	},
	getSnapshot() {
		return yn;
	},
	getAll() {
		return yn;
	},
	getById(e) {
		return yn.find((t) => t.id === e);
	},
	getByCode(e) {
		return yn.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return yn.find((t) => te(e) ? t.id === te(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = yn.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = yn.find((t) => te(e) ? t.id === te(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = xn(e.code, "Account code"), n = xn(e.name, "Account name");
		Cn(t), wn(t), Tn(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: En(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: Sn(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return yn = [...yn, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), bn(), i;
	},
	update(e, t) {
		let n = yn.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = xn(t.code, "Account code"), i = xn(t.name, "Account name");
		if (Cn(r), wn(r, e), (n.systemRole || oe(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: Sn(t.description),
			active: n.systemRole || oe(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || oe(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return yn = yn.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), bn(), a;
	},
	setActive(e, t) {
		let n = yn.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || oe(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return yn = yn.map((t) => t.id === e ? r : t), bn(), r;
	}
};
m("accounts", {
	repository: P,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: yn }),
	restore: (e) => {
		yn = e.accounts;
	},
	publish: () => vn.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var Dn = /* @__PURE__ */ new Set(), On = D.read().journals;
D.onRollback(() => {
	On = D.read().journals;
});
function kn() {
	Dn.forEach((e) => D.notify(e));
}
function An(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function jn(e) {
	return e?.trim() || void 0;
}
function Mn(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function Nn(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = On.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Pn(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function Fn(e) {
	if (Mn(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = P.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = An(r.debit), o = An(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = An(t + a), n = An(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function In(e) {
	return e.lines.map((e, t) => {
		let n = P.requireById(e.accountId);
		return {
			id: Pn(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: jn(e.description),
			debit: An(e.debit),
			credit: An(e.credit)
		};
	});
}
function Ln(e, t) {
	let n = ne(On).originals;
	return On.find((r) => r.sourceType === e && r.sourceId === t && !r.reversedJournalEntryId && !n.has(r.id));
}
var F = {
	subscribe(e) {
		return Dn.add(e), () => {
			Dn.delete(e);
		};
	},
	getSnapshot() {
		return On;
	},
	getAll() {
		return On;
	},
	getById(e) {
		return On.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return On.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: Ln,
	post(e) {
		_n(e.journalDate), Mt(e.journalDate, e.lines.map((e) => e.accountId));
		let t = Fn(e), n = jn(e.sourceId);
		if (n) {
			let t = Ln(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Pn("je"),
			journalNumber: Nn(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: jn(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: In(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...On];
		return D.update("journals", a), On = a, kn(), i;
	},
	reverse(e) {
		_n(e.reversalDate);
		let t = On.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (Nt(t.id), t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (Mn(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		Mt(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = Fn(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Pn("je"),
			journalNumber: Nn(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: In(r),
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
		}, c = [o, ...On.map((e) => e.id === t.id ? s : e)];
		return D.update("journals", c), On = c, kn(), o;
	}
};
function Rn(e, t, n, r) {
	let i = On.find((t) => t.id === e);
	if (!i) throw Error("Duplicate journal no longer exists.");
	let a = F.reverse({
		journalEntryId: e,
		reversalDate: i.journalDate,
		reason: r
	}), o = On.map((r) => r.id === e ? {
		...r,
		bankDuplicateCorrection: {
			canonicalJournalId: t,
			operationId: n
		}
	} : r), s = ne(o);
	if (s.invalid.length || !s.originals.has(e)) throw Error("Duplicate correction failed exact-pair verification.");
	return D.update("journals", o), On = o, kn(), a;
}
m("journals", {
	repository: F,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: On }),
	restore: (e) => {
		On = e.journalEntries;
	},
	publish: () => Dn.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var zn = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Bn(e) {
	let t = e.filter((e) => zn.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Vn() {
	Bn(O.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Hn = [{
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
}], Un = [{
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
}], Wn = [{
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
}], Gn = "htt.mock.sales.credit-notes.v1", Kn = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, qn = (e) => typeof e == "string" && e.length > 0;
function Jn(e) {
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
		].every((e) => qn(t[e])) || ![
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
		].every((e) => Kn(i[e])) || !Kn(t.amountApplied) || !Kn(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => qn(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !Kn(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !qn(e.id) || !qn(e.date) || !Kn(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !qn(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !Kn(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function Yn() {
	return Ae(Gn, Jn);
}
function Xn(e) {
	if (!Jn(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = Yn();
	if (t.status === "invalid" || t.status === "unavailable" || !Me("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!je("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var Zn = /* @__PURE__ */ new Set(), Qn = Yn(), $n = Qn.status === "ok" ? structuredClone(Qn.data.creditNotes) : [], er = Qn.status === "ok" ? structuredClone(Qn.data.allocations) : [], tr = [...$n], nr = [...er];
function rr() {
	tr = [...$n], nr = [...er], Zn.forEach((e) => e());
}
function ir(e, t) {
	Xn({
		creditNotes: e,
		allocations: t
	}), $n = e, er = t, rr();
}
var I = {
	subscribe(e) {
		return Zn.add(e), () => {
			Zn.delete(e);
		};
	},
	getSnapshot() {
		return tr;
	},
	getAllocationSnapshot() {
		return nr;
	},
	getAll() {
		return tr;
	},
	getAllAllocations() {
		return nr;
	},
	getById(e) {
		return $n.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return $n.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return $n.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return er.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return er.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if ($n.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return ir([e, ...$n], er), e;
	},
	update(e) {
		if (!$n.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return ir($n.map((t) => t.id === e.id ? e : t), er), e;
	},
	createAllocation(e) {
		if (er.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return ir($n, [e, ...er]), e;
	},
	updateAllocation(e) {
		if (!er.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return ir($n, er.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!$n.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = er.some((t) => t.id === e.id) ? er.map((t) => t.id === e.id ? e : t) : [e, ...er];
		ir($n.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return er.find((t) => t.id === e);
	}
};
m("customerCredits", {
	repository: I,
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
	validate: (e, t) => {
		for (let n of e.creditNotes) {
			At(n.recipient);
			for (let e of n.lines) ct(e), nt(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: $n,
		allocations: er
	}),
	restore: (e) => {
		$n = e.creditNotes, er = e.allocations, tr = [...$n], nr = [...er];
	},
	publish: () => Zn.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/productRules.ts
function ar(e, t, n, r) {
	let i = it(e), a = at(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !et(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
	if (r === "buy" && i.buyEnabled === !1 || r === "sell" && i.sellEnabled === !1) throw Error(`Product is not available to ${r}.`);
	if (!Number.isFinite(n) || n <= 0) throw Error("Quantity must be finite and greater than zero.");
	if (i.wholePacks && [
		"BOX",
		"ROLL",
		"BUCKET"
	].includes(a.code) && !Number.isInteger(n)) throw Error("This product must be ordered in whole packs.");
}
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var or = "htt.mock.contacts.customerPricing.v1";
function sr(e) {
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
function cr() {
	return Ae(or, sr);
}
function lr(e) {
	if (cr().status === "invalid" || !Me("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!je("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var ur = [
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
], dr = /* @__PURE__ */ new Set(), fr = cr(), pr = fr.status === "ok" ? fr.data : structuredClone(ur);
function mr() {
	dr.forEach((e) => {
		e();
	});
}
function hr(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function gr(e) {
	return e.trim() || void 0;
}
function _r(e, t) {
	let n = it(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function vr(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function yr({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = pr.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : vr(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = wr(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function br(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function xr(e) {
	let t = at(e.productId, e.unitId);
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
var Sr = {
	subscribe(e) {
		return dr.add(e), () => {
			dr.delete(e);
		};
	},
	getSnapshot() {
		return pr;
	},
	getAll() {
		return pr;
	},
	getById(e) {
		return pr.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return pr.filter((t) => t.customerId === e);
	},
	create(e, t) {
		_r(t.productId, t.unitId);
		let n = gr(t.effectiveTo);
		t.active && yr({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = br(t), a = {
			id: hr("cprice"),
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
		}, o = [a, ...pr];
		return lr(o), pr = o, mr(), a;
	},
	update(e, t) {
		let n = Sr.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		_r(t.productId, t.unitId);
		let r = gr(t.effectiveTo);
		t.active && yr({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = br(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = pr.map((t) => t.id === e ? a : t);
		return lr(o), pr = o, mr(), a;
	},
	resolve(e) {
		return xr(e);
	},
	resolvePrice(e, t, n, r, i = r) {
		let a = Sr.resolveBasePrice(e, t, n, r.slice(0, 10)), o = be({
			customerId: e,
			productId: t,
			unitId: n,
			at: i,
			customerPrice: a.effectivePrice,
			basePrice: a.basePrice,
			hasCustomerPrice: a.source === "CUSTOMER_PRICE"
		});
		if (!o.promotionId) return a;
		let s = Number((a.basePrice - o.price).toFixed(2));
		return {
			...a,
			date: r,
			effectivePrice: o.price,
			source: "PROMOTIONAL_PRICE",
			promotionId: o.promotionId,
			discountAmount: s,
			discountPercent: a.basePrice ? Number((s / a.basePrice * 100).toFixed(2)) : 0
		};
	},
	resolveBasePrice(e, t, n, r) {
		let { unit: i } = _r(t, n), a = pr.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && Cr(r, i.effectiveFrom, i.effectiveTo));
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
		let o = xr(a);
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
function Cr(e, t, n) {
	return !(e < t || n && e > n);
}
function wr(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
m("customerPrices", {
	repository: Sr,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: pr }),
	restore: (e) => {
		pr = e.customerPrices;
	},
	publish: () => dr.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function Tr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Er({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = b(), inclusiveLineTotal: i }) {
	let a = Tr(e * n), o = Tr(i === void 0 ? a * r : i - a), s = Tr(a + o), c = Tr(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? Tr(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function Dr(e) {
	let t = Tr(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Tr(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Tr(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Or({ customerId: e, documentDate: t, draft: n, pricingAt: r, pricingContext: i }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let a = it(n.productId);
	if (!a) throw Error(`Product ${n.productId} was not found`);
	if (a.status !== "ACTIVE") throw Error(`${a.name} is inactive`);
	let o = at(n.productId, n.unitId);
	if (!o) throw Error(`Unit ${n.unitId} was not found for ${a.name}`);
	let s = i ?? Qe(t, r), c = Sr.resolvePrice(e, n.productId, n.unitId, t, s.pricingAt), l = n.unitPrice !== void 0, u = l ? n.unitPrice : c.effectivePrice;
	if (!Number.isFinite(u) || u < 0) throw Error("Unit price cannot be negative");
	let d = st(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (ar(n.productId, n.unitId, d.quantity, "sell"), a.sellEnabled === !1) throw Error("Product is not available for selling.");
	let f = a.taxCode ?? x().gstCode, p = b(f), m = l ? se(u, p, n.priceBasis) : u, h = Er({
		taxRate: p,
		inclusiveLineTotal: l && (n.priceBasis ?? x().basis) === "Inclusive" ? Math.round(d.quantity * u * 100) / 100 : void 0,
		quantity: d.quantity,
		standardUnitPrice: c.basePrice,
		unitPrice: m
	});
	return {
		id: kr("line"),
		...s,
		itemType: a.itemType ?? "STOCK",
		...d,
		...Ce(f),
		priceBasis: l ? n.priceBasis ?? x().basis : "Exclusive",
		grossUnitPrice: l && (n.priceBasis ?? x().basis) === "Inclusive" ? u : void 0,
		promotionId: l ? void 0 : c.promotionId,
		productId: a.id,
		unitId: o.id,
		sku: a.sku,
		description: a.name,
		unitSymbol: o.symbol,
		quantity: d.quantity,
		standardUnitPrice: c.basePrice,
		unitPrice: m,
		priceSource: l ? "MANUAL" : c.source,
		customerPriceId: l ? void 0 : c.customerPrice?.id,
		...h
	};
}
function kr(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var Ar = "htt.mock.banking.accounts.v1";
function jr(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var Mr = /* @__PURE__ */ new Set(), Nr = "2026-10-08T00:00:00.000Z", Pr = [{
	id: "bank_001",
	name: "Operating Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1000",
	accountType: "TRANSACTION",
	currency: x().currency,
	glAccountId: "acc_1000",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: Nr,
	updatedAt: Nr
}, {
	id: "bank_002",
	name: "Savings Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1010",
	accountType: "SAVINGS",
	currency: x().currency,
	glAccountId: "acc_1010",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: Nr,
	updatedAt: Nr
}], Fr = Ae(Ar, jr);
Fr.status === "ok" && Fr.data.every((e) => {
	let t = P.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (Pr = Fr.data);
function Ir() {
	Mr.forEach((e) => e());
}
function Lr(e) {
	let t = P.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of Pr) Lr(e);
var L = {
	subscribe(e) {
		return Mr.add(e), () => {
			Mr.delete(e);
		};
	},
	getSnapshot() {
		return Pr;
	},
	getAll() {
		return Pr;
	},
	getById(e) {
		return Pr.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return Pr.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = Pr.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(e, t) {
		let n = w({
			id: y().optional(),
			name: y().trim().min(1).max(180),
			bankName: y().trim().min(1).max(180),
			accountNumber: y().trim().min(1).max(100),
			accountType: g([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: g(["AUD", "NZD"]),
			glAccountId: y().min(1),
			openingBalanceDate: y(),
			active: h()
		}).strict().parse(e);
		if (T(n.openingBalanceDate, "Opening date"), Pr[0] && n.currency !== Pr[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let r = Pr.find((e) => e.id === n.id);
		if (r && r.updatedAt !== t) throw Error("Bank account changed; reload before editing.");
		if (!r && n.id) throw Error("Bank account was not found.");
		if (Pr.some((e) => e.id !== r?.id && e.glAccountId === n.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let i = P.requireById(n.glAccountId);
		if (!i.active || i.type !== "ASSET" || i.systemRole && i.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (r && F.getAll().some((e) => e.lines.some((e) => e.accountId === r.glAccountId)) && (r.glAccountId !== n.glAccountId || r.openingBalanceDate !== n.openingBalanceDate || r.currency !== n.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let a = new Date(Math.max(Date.now(), r ? Date.parse(r.updatedAt) + 1 : 0)).toISOString(), o = {
			...n,
			id: r?.id ?? crypto.randomUUID(),
			openingBalance: r?.openingBalance ?? 0,
			createdAt: r?.createdAt ?? a,
			updatedAt: a
		};
		return Lr(o), Pr = [...Pr.filter((e) => e.id !== o.id), o], Ir(), o;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Pr = Pr.map((t) => t.id === e ? r : t), Me(Ar) && je(Ar, Pr), Ir(), r;
	}
};
m("bankAccounts", {
	repository: L,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: Pr }),
	restore: (e) => {
		Pr = e.bankAccounts;
	},
	publish: () => Mr.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var Rr = /* @__PURE__ */ new Set(), zr = D.read().payments;
function Br() {
	Rr.forEach((e) => e());
}
function Vr() {
	return `payment_${crypto.randomUUID()}`;
}
function Hr() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = zr.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var Ur = {
	subscribe(e) {
		return Rr.add(e), () => {
			Rr.delete(e);
		};
	},
	getSnapshot() {
		return zr;
	},
	getAll() {
		return zr;
	},
	getById(e) {
		return zr.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return zr.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return zr.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = L.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (T(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (Gr(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = O.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: Gr(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Wr(e.reference),
				notes: Wr(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = zr.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Vr(),
			paymentNumber: Hr(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: Gr(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Wr(e.reference),
			notes: Wr(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && O.bindResult(n, i.id);
		let a = [i, ...zr];
		if (D.update("payments", a), zr = a, n && !e.deferOperationCompletion) try {
			O.complete(n, i.id);
		} catch (e) {
			try {
				O.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return Br(), i;
	},
	recordDepositSettlement(e) {
		if (T(e.paymentDate), !e.depositId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid deposit application payment.");
		if (zr.some((t) => t.id === e.id || t.depositApplicationId === e.applicationId)) throw Error("Deposit application payment already exists.");
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: e.id,
			paymentNumber: Hr(),
			depositId: e.depositId,
			depositApplicationId: e.applicationId,
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			bankAccountId: e.bankAccountId,
			amount: Gr(e.amount),
			reference: e.reference,
			method: "OTHER",
			notes: "Deposit applied to invoice; no new bank receipt.",
			status: "RECEIVED",
			createdAt: t,
			updatedAt: t
		}, r = [n, ...zr];
		return D.update("payments", r), zr = r, Br(), n;
	},
	reverseDepositSettlement(e, t, n) {
		T(t);
		let r = zr.find((t) => t.id === e);
		if (!r?.depositApplicationId || r.status !== "RECEIVED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid deposit settlement reversal.");
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, a = zr.map((t) => t.id === e ? i : t);
		return D.update("payments", a), zr = a, Br(), i;
	},
	reverse(e, t) {
		let n = zr.find((t) => t.id === e);
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
		}, o = zr.map((t) => t.id === e ? a : t);
		return D.update("payments", o), zr = o, Br(), a;
	},
	getReceivedByInvoice(e) {
		return zr.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Wr(e) {
	return e?.trim() || void 0;
}
function Gr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
m("customerPayments", {
	repository: Ur,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null,
		recordDepositSettlement: null,
		reverseDepositSettlement: null
	},
	snapshot: () => ({ payments: zr }),
	restore: (e) => {
		zr = e.payments;
	},
	publish: () => Rr.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function Kr(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || P.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(P.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
		let r = Math.round((t + 2 ** -52) * 100) / 100;
		return {
			accountId: e,
			debit: n ? r : 0,
			credit: n ? 0 : r
		};
	});
}
//#endregion
//#region src/features/accounting/data/salesAccountingPostingService.ts
function qr(e) {
	return P.requireBySystemRole(e).id;
}
function Jr(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: x().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function Yr(e, t) {
	return F.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Xr(e, t) {
	let n = Yr(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Zr = {
	postInvoice(e) {
		return Yr("CUSTOMER_INVOICE", e.id) || F.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: qr("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: qr("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...Kr(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = Xr("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Jr(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = Yr("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = L.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return F.post({
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
				accountId: qr("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Xr("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Jr(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return Yr("CREDIT_NOTE", e.id) || F.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: qr("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...Kr(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: qr("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Xr("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Jr(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, Qr = /* @__PURE__ */ new Set(), $r = on(), ei = en(), ti = Yt(), ni = $r.status === "ok" ? structuredClone($r.data.quotes) : ei.status === "ok" ? structuredClone(ei.data.quotes) : ti.status === "ok" ? structuredClone(ti.data) : structuredClone(Hn);
function ri(e) {
	$r.status === "ok" || on().status !== "empty" ? sn({
		quotes: e,
		salesOrders: ii,
		invoices: ai
	}) : ei.status === "ok" || en().status !== "empty" ? tn({
		quotes: e,
		salesOrders: ii
	}) : Xt(e), ni = e, li();
}
var ii = $r.status === "ok" ? structuredClone($r.data.salesOrders) : ei.status === "ok" ? structuredClone(ei.data.salesOrders) : structuredClone(Un), ai = $r.status === "ok" ? structuredClone($r.data.invoices) : structuredClone(Wn);
function oi(e) {
	sn({
		quotes: ni,
		salesOrders: ii,
		invoices: e
	}), ai = e, li();
}
function si(e, t = ni) {
	$r.status === "ok" || on().status !== "empty" ? sn({
		quotes: t,
		salesOrders: e,
		invoices: ai
	}) : tn({
		quotes: t,
		salesOrders: e
	}), ii = e, ni = t, li();
}
var ci = ui();
function li() {
	ci = ui(), Qr.forEach((e) => e());
}
function ui() {
	return [
		...ni,
		...ii,
		...ai
	];
}
var R = {
	createManagedOrder(e) {
		let t = ii.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: pi("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: mi("SO", ii.map((e) => e.documentNumber)),
			customerId: e.customerId,
			recipient: structuredClone(e.recipient),
			documentDate: e.documentDate,
			customerReference: e.customerReference,
			notes: e.notes,
			lines: structuredClone(e.lines),
			totals: structuredClone(e.totals),
			invoiceIds: [],
			createdAt: n,
			updatedAt: n
		};
		return si([r, ...ii]), r;
	},
	createManagedInvoice(e) {
		let t = ai.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = R.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: pi("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: mi("INV", ai.map((e) => e.documentNumber)),
			customerId: e.customerId,
			recipient: structuredClone(e.recipient),
			documentDate: e.documentDate,
			dueDate: e.dueDate,
			sourceSalesOrderId: n.id,
			customerReference: e.customerReference,
			notes: e.notes,
			lines: structuredClone(e.lines),
			totals: structuredClone(e.totals),
			amountPaid: 0,
			amountDue: e.totals.total,
			createdAt: r,
			updatedAt: r
		}, a = ii.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return sn({
			quotes: ni,
			salesOrders: a,
			invoices: [i, ...ai]
		}), ii = a, ai = [i, ...ai], li(), Zr.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = ii.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => ai.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return si(ii.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return Qr.add(e), () => {
			Qr.delete(e);
		};
	},
	getSnapshot() {
		return ce(ci);
	},
	getAll() {
		return ce(ci);
	},
	getById(e) {
		return ce(ci).find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ce(ci).filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return ce(ni).filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return ii.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return ai.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (di(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = Qe(e.documentDate, e.pricingAt), n = e.lines.map((n) => Or({
			customerId: e.customerId,
			documentDate: e.documentDate,
			pricingContext: t,
			draft: n
		})), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: pi("quote"),
			type: "QUOTE",
			documentNumber: mi("QU", ni.map((e) => e.documentNumber)),
			recipient: kt(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: fi(e.customerReference),
			notes: fi(e.notes),
			lines: n,
			totals: Dr(n),
			createdAt: r,
			updatedAt: r
		};
		return ri([i, ...ni]), i;
	},
	updateDraftQuote(e, t) {
		let n = ni.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = n.lines.find((e) => e.pricingAt), i = Qe(t.documentDate, t.pricingAt ?? (t.documentDate === n.documentDate ? r?.pricingAt : void 0), t.documentDate === n.documentDate && (!t.pricingAt || t.pricingAt === r?.pricingAt) ? r?.pricingTimezone : void 0), a = t.lines.map((e) => {
			let r = Or({
				customerId: n.customerId,
				documentDate: t.documentDate,
				pricingContext: i,
				draft: {
					productId: e.productId,
					unitId: e.unitId,
					quantity: e.quantity,
					requestedArea: e.requestedArea,
					unitPrice: e.priceSource === "MANUAL" ? e.unitPrice : void 0,
					priceBasis: "Exclusive"
				}
			});
			return {
				...r,
				id: n.lines.find((t) => t.id === e.lineId)?.id ?? r.id
			};
		}), o = {
			...n,
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : kt(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: fi(t.customerReference),
			notes: fi(t.notes),
			lines: a,
			totals: Dr(a),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ri(ni.map((t) => t.id === e ? o : t)), o;
	},
	sendQuote(e) {
		let t = ni.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return ri(ni.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = ni.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return ri(ni.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = ni.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return ri(ni.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = ni.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: pi("order"),
			type: "SALES_ORDER",
			documentNumber: mi("SO", ii.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: hi(),
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
		return si([r, ...ii], ni.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = ii.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return si(ii.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = ii.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = hi(), i = {
			id: pi("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: mi("INV", ai.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: gi(r, Number(x().terms)),
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
		}, a = [i, ...ai], o = ii.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return sn({
			quotes: ni,
			salesOrders: o,
			invoices: a
		}), ai = a, ii = o, li(), Zr.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = ai.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A credit note cannot be created from a void invoice");
		if (t.status === "DRAFT") throw Error("A credit note cannot be created from a draft invoice");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A credit reason is required");
		if (e.lines.length === 0) throw Error("A credit note must contain at least one line");
		if (e.creditDate < t.documentDate) throw Error("Credit date cannot be earlier than the invoice date");
		let r = /* @__PURE__ */ new Set(), i = e.lines.map((e) => {
			let n = t.lines.find((t) => t.id === e.id);
			if (!n || r.has(n.id)) throw Error("Select each original invoice line only once.");
			if (r.add(n.id), !Number.isFinite(e.quantity) || e.quantity <= 0) throw Error("Credit quantity must be finite and greater than zero.");
			if (n.areaPerPack && !Number.isInteger(e.quantity)) throw Error("Area-based lines must be credited in whole packs.");
			let i = I.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = I.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = _i(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = _i(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: _i(c + l)
			};
		}), a = Dr(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (_i(_i(I.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > _i(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: pi("credit-note"),
			creditNoteNumber: mi("CN", I.getAll().map((e) => e.creditNoteNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			sourceInvoiceId: t.id,
			creditDate: e.creditDate,
			status: "ISSUED",
			reason: n,
			lines: i,
			totals: a,
			amountApplied: 0,
			amountAvailable: a.total,
			issuedAt: o,
			createdAt: o,
			updatedAt: o
		};
		return I.create(s), Zr.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		M(), Vn();
		let t = I.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = ai.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = _i(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = I.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: pi("credit-allocation"),
			allocationNumber: mi("CA", I.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = _i(i.amountApplied + r), c = _i(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (O.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			O.bindResult(l, o.id), I.commitAllocationAndCredit(o, {
				...i,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(n.id), O.complete(l, o.id);
		} catch (e) {
			try {
				O.flagForReview(l, "Credit allocation/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	reverseCreditAllocation(e) {
		M(), Vn();
		let t = I.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = I.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = ai.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = _i(I.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = _i(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (O.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			O.bindResult(l, t.id), I.commitAllocationAndCredit(o, {
				...r,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(i.id), O.complete(l, t.id);
		} catch (e) {
			try {
				O.flagForReview(l, "Credit reversal/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidCreditNote(e) {
		if (n().physicalCustomerReturns?.returns.some((t) => t.creditNoteId === e.creditNoteId && t.status === "POSTED")) throw Error("Reverse the linked physical customer return before voiding this credit.");
		e.voidDate && T(e.voidDate, "Credit reversal date");
		let t = I.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if (e.voidDate && ((t.refundEvents ?? []).some((t) => (t.reversalDate ?? t.date) > e.voidDate) || I.getAllocationsByCreditNote(t.id).some((t) => (t.reversedAt ? S(t.reversedAt) : t.allocationDate) > e.voidDate))) throw Error("Credit reversal precedes later settlement activity.");
		if (e.voidDate && e.voidDate < t.creditDate) throw Error("Credit reversal date precedes credit date.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (I.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: e.voidDate ?? i,
			voidReason: r,
			updatedAt: i
		};
		return I.update(a), Zr.reverseCreditNote(a), a;
	},
	recordInvoicePayment(e) {
		if (M(), Vn(), e.operationId) {
			let t = O.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = ai.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = _i(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (T(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = Ur.create({
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
			Zr.postPayment(a);
			let e = F.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			O.complete(i, a.id);
		} catch (e) {
			try {
				O.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	voidInvoice(e, t) {
		M(), Vn();
		let n = ai.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (Ur.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (I.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && I.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountPaid: 0,
			amountDue: 0,
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		}, o = `sales-invoice-void:${e}`;
		if (O.begin(o, "SALES_INVOICE_VOID", e).status !== "started") throw Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
		try {
			let t = F.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			O.bindResult(o, e), Zr.reverseInvoice(a);
			let n = F.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			oi(ai.map((t) => t.id === e ? a : t)), O.complete(o, e);
		} catch (e) {
			try {
				O.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		if (jt("CUSTOMER_PAYMENT", e), M(), Vn(), Ur.getById(e)?.depositApplicationId) throw Error("Reverse this settlement through customer deposits.");
		let n = Ur.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = ai.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (O.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			O.bindResult(i, e);
			let n = Ur.reverse(e, t);
			Zr.reversePayment(n);
			let a = F.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
			if (a.length !== 1 || a[0].status !== "REVERSED") throw Error("Payment GL reversal could not be verified.");
			return this.recalculateInvoiceBalance(r.id), O.complete(i, e), n;
		} catch (e) {
			try {
				O.flagForReview(i, "Payment reversal/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
	},
	recalculateInvoiceBalance(e) {
		let t = ai.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = Ur.getReceivedByInvoice(e), r = I.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = _i(n.reduce((e, t) => e + t.amount, 0)), a = _i(r.reduce((e, t) => e + t.amount, 0)), o = _i(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : vi(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return oi(ai.map((t) => t.id === e ? c : t)), c;
	}
};
function di(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function fi(e) {
	return e?.trim() || void 0;
}
function pi(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function mi(e, t) {
	return de(e, t, S((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function hi() {
	return S((/* @__PURE__ */ new Date()).toISOString());
}
function gi(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function _i(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function vi(e) {
	return e < yi(/* @__PURE__ */ new Date());
}
function yi(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
m("sales", {
	repository: R,
	read: "sales.read",
	commands: {
		createManagedOrder: null,
		createManagedInvoice: null,
		cancelManagedOrder: null,
		if: null,
		emitChange: null,
		persistSalesDocuments: null,
		createQuote: "sales.write",
		updateDraftQuote: "sales.write",
		sendQuote: "sales.write",
		acceptQuote: "sales.manage",
		declineQuote: "sales.manage",
		convertQuoteToOrder: "sales.manage",
		setFulfilmentStatus: null,
		createInvoiceFromOrder: "sales.manage",
		createCreditNoteFromInvoice: "sales.payment",
		applyCreditToInvoice: "sales.payment",
		reverseCreditAllocation: "sales.payment",
		voidCreditNote: "sales.payment",
		recordInvoicePayment: "sales.payment",
		voidInvoice: "sales.payment",
		reverseInvoicePayment: "sales.payment",
		recalculateInvoiceBalance: null
	},
	validate: (e, t) => {
		let n = e;
		for (let e of [
			...n.quotes,
			...n.salesOrders,
			...n.invoices
		]) {
			At(e.recipient);
			for (let n of e.lines) ct(n), $e(n), nt(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: ni,
		salesOrders: ii,
		invoices: ai
	}),
	restore: (e) => {
		ni = e.quotes, ii = e.salesOrders, ai = e.invoices, ci = ui();
	},
	publish: () => Qr.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var bi = [
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
		currency: x().currency,
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
		currency: x().currency,
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
		currency: x().currency,
		taxRegistered: !0,
		createdAt: "2026-03-05T01:00:00.000Z",
		updatedAt: "2026-03-05T01:00:00.000Z"
	}
], xi = "htt.mock.contacts.suppliers.v1";
function Si(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Ci = Ae(xi, Si), wi = Ci.status !== "invalid" && Me(xi), Ti = /* @__PURE__ */ new Set(), Ei = Ci.status === "ok" ? Ci.data : structuredClone(bi);
function Di() {
	wi && je(xi, Ei), Ti.forEach((e) => {
		e();
	});
}
function Oi(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function ki() {
	let e = Ei.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function Ai(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function ji(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Mi(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: Ai(e.tradingName),
		abn: ji(e.abn),
		status: e.status,
		email: Ai(e.email),
		phone: Ai(e.phone),
		website: Ai(e.website),
		contactName: Ai(e.contactName),
		addressLine1: Ai(e.addressLine1),
		addressLine2: Ai(e.addressLine2),
		suburb: Ai(e.suburb),
		state: Ai(e.state),
		postcode: Ai(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: Ai(e.notes)
	};
}
var Ni = {
	subscribe(e) {
		return Ti.add(e), () => {
			Ti.delete(e);
		};
	},
	getSnapshot() {
		return Ei;
	},
	getAll() {
		return Ei;
	},
	getById(e) {
		return Ei.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Oi("sup"),
			code: ki(),
			...Mi(e),
			currency: x().currency,
			createdAt: t,
			updatedAt: t
		};
		return Ei = [n, ...Ei], Di(), n;
	},
	update(e, t) {
		let n = Ni.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...Mi(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ei = Ei.map((t) => t.id === e ? r : t), Di(), r;
	}
};
m("suppliers", {
	repository: Ni,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: Ei }),
	restore: (e) => {
		Ei = e.suppliers;
	},
	publish: () => Ti.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function Pi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Fi({ orderedQuantity: e, unitCost: t, taxRate: n = b(), inclusiveLineTotal: r }) {
	let i = Pi(e * t), a = Pi(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Pi(i + a)
	};
}
function Ii(e) {
	let t = Pi(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Pi(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Pi(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var Li = /* @__PURE__ */ new Set(), Ri = D.read().purchaseOrders;
D.onRollback(() => {
	Ri = D.read().purchaseOrders;
});
function zi() {
	try {
		D.update("purchaseOrders", Ri);
	} catch (e) {
		throw Ri = D.read().purchaseOrders, e;
	}
	Li.forEach((e) => D.notify(e));
}
function Bi(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Vi(e) {
	return de("PO", Ri.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function Hi(e) {
	return e?.trim() || void 0;
}
function Ui(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = rt.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (ar(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let r = t.taxCode ?? x().gstCode, i = b(r), a = Fi({
			taxRate: i,
			inclusiveLineTotal: (e.priceBasis ?? x().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: se(e.unitCost, i, e.priceBasis)
		});
		return {
			id: Bi("pol"),
			...Ce(r),
			grossUnitCost: (e.priceBasis ?? x().basis) === "Inclusive" ? e.unitCost : void 0,
			productId: t.id,
			unitId: n.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: n.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: se(e.unitCost, i, e.priceBasis),
			...a
		};
	});
}
function Wi(e) {
	let t = Ni.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function Gi(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var Ki = {
	subscribe(e) {
		return Li.add(e), () => {
			Li.delete(e);
		};
	},
	getSnapshot() {
		return ce(Ri);
	},
	getAll() {
		return ce(Ri);
	},
	getById(e) {
		return ce(Ri).find((t) => t.id === e);
	},
	getBySupplier(e) {
		return ce(Ri).filter((t) => t.supplierId === e);
	},
	create(e) {
		Gi(e);
		let t = Wi(e.supplierId), n = Ui(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Bi("po"),
			purchaseOrderNumber: Vi(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: Hi(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: Hi(e.supplierReference),
			notes: Hi(e.notes),
			lines: n,
			totals: Ii(n),
			createdAt: r,
			updatedAt: r
		};
		return Ri = [i, ...Ri], zi(), i;
	},
	updateDraft(e, t) {
		let n = Ki.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		Gi(t);
		let r = Wi(t.supplierId), i = Ui(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: Hi(t.expectedDeliveryDate),
			supplierReference: Hi(t.supplierReference),
			notes: Hi(t.notes),
			lines: i,
			totals: Ii(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ri = Ri.map((e) => e.id === n.id ? a : e), zi(), a;
	},
	approve(e) {
		let t = Ki.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return qi(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = Ki.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return qi(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = Ki.getById(e);
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
		return Ri = Ri.map((e) => e.id === n.id ? o : e), zi(), o;
	},
	recordSupplierBill(e, t) {
		let n = Ki.getById(e);
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
			let n = Ji(e.billedQuantity + t);
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
		return Ri = Ri.map((e) => e.id === n.id ? c : e), zi(), c;
	},
	reverseSupplierBill(e, t) {
		let n = Ki.getById(e);
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
				billedQuantity: Ji(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ri = Ri.map((e) => e.id === n.id ? c : e), zi(), c;
	},
	cancel(e, t) {
		let n = Ki.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return qi(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function qi(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return Ri = Ri.map((t) => t.id === e.id ? n : t), zi(), n;
}
function Ji(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
m("purchaseOrders", {
	repository: Ki,
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
	snapshot: () => ({ purchaseOrders: Ri }),
	restore: (e) => {
		Ri = e.purchaseOrders;
	},
	publish: () => Li.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function z(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Yi(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function Xi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Zi({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return Yi(e / t);
}
function Qi({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return Xi(e * t);
}
function $i({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = z(e + n), a = Xi(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : Yi(a / i)
	};
}
function ea({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return Xi(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function ta(e) {
	return Xi(e.lines.reduce((e, t) => {
		let n = Zi({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Qi({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function na(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ra(e) {
	return P.requireBySystemRole(e).id;
}
function ia(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: x().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function aa(e, t) {
	return F.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function oa(e, t) {
	let n = aa(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var sa = {
	validateGoodsReceiptPosting(e) {
		let t = P.requireBySystemRole("INVENTORY"), n = P.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = ta(e);
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
		let t = F.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return F.post({
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
		let n = P.requireBySystemRole("GRNI"), r = P.requireBySystemRole("GST_RECEIVABLE"), i = P.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = na(e.totals.subtotal - t);
		if (a !== 0) {
			let e = P.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = na(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = aa("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return F.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: ra("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...Kr(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: ra("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: ra("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = oa("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: ia(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = aa("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = L.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return F.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: ra("ACCOUNTS_PAYABLE"),
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
		let t = oa("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: ia(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return aa("SUPPLIER_CREDIT", e.id) || F.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: ra("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? ra("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...Kr(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of F.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) F.reverse({
			journalEntryId: t.id,
			reversalDate: ia(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = oa("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: ia(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, ca = structuredClone([{
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
}]), la = {
	getAll() {
		return ca;
	},
	getById(e) {
		return ca.find((t) => t.id === e);
	},
	getActive() {
		return ca.filter((e) => e.status === "ACTIVE");
	}
}, ua = /* @__PURE__ */ new Set(), da = [];
function fa() {
	ua.forEach((e) => e());
}
function pa() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = da.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var ma = {
	subscribe(e) {
		return ua.add(e), () => {
			ua.delete(e);
		};
	},
	getSnapshot() {
		return da;
	},
	getAll() {
		return da;
	},
	getByReference(e, t) {
		return da.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return da.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return da.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: pa(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return da = [t, ...da], fa(), t;
	}
};
m("inventoryMovements", {
	repository: ma,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: da }),
	restore: (e) => {
		da = e.movements;
	},
	publish: () => ua.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var ha = /* @__PURE__ */ new Set(), ga = [];
function _a() {
	ha.forEach((e) => e());
}
var va = {
	subscribe(e) {
		return ha.add(e), () => {
			ha.delete(e);
		};
	},
	getSnapshot() {
		return ga;
	},
	getAll() {
		return ga;
	},
	getBalance(e, t) {
		return ga.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = va.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return ga = ga.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? ga.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...ga], _a(), e;
	},
	replaceAll(e) {
		ga = e, _a();
	},
	clear() {
		ga = [], _a();
	}
};
m("costBalances", {
	repository: va,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: ga }),
	restore: (e) => {
		ga = e.balances;
	},
	publish: () => ha.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var ya = /* @__PURE__ */ new Set(), ba = [];
function xa() {
	ya.forEach((e) => e());
}
function Sa() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = ba.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Ca(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var wa = {
	subscribe(e) {
		return ya.add(e), () => {
			ya.delete(e);
		};
	},
	getSnapshot() {
		return ba;
	},
	getAll() {
		return ba;
	},
	getByReference(e, t) {
		return ba.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return ba.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return ba.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return ba.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return Ca(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: Sa(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = wa.build(e);
		return ba = [t, ...ba], xa(), t;
	},
	replaceAll(e) {
		ba = e, xa();
	},
	clear() {
		ba = [], xa();
	}
};
m("costMovements", {
	repository: wa,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: ba }),
	restore: (e) => {
		ba = e.movements;
	},
	publish: () => ya.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var Ta = /* @__PURE__ */ new Set(), Ea = "2026-01-01T00:00:00.000Z", Da = rt.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: Ea,
	updatedAt: Ea
}));
function Oa() {
	Ta.forEach((e) => e());
}
var ka = {
	ensureProductPolicy(e, t, n) {
		let r = Da.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return Da = [...Da.filter((t) => t.productId !== e), a], Oa(), a;
	},
	subscribe(e) {
		return Ta.add(e), () => {
			Ta.delete(e);
		};
	},
	getSnapshot() {
		return Da;
	},
	getAll() {
		return Da;
	},
	getByProductId(e) {
		return Da.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = ka.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !et(it(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...ka.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Da = Da.map((t) => t.productId === e ? n : t), Oa(), n;
	}
};
m("costingPolicies", {
	repository: ka,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: Da }),
	restore: (e) => {
		Da = e.policies;
	},
	publish: () => Ta.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function Aa(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function ja(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function Ma(e, t) {
	let n = it(e);
	if (!n) throw Error("Product was not found.");
	if (!et(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = ka.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = at(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function Na(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = Xi(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(Xi(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function Pa(e) {
	if (e && wa.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function Fa({ movement: e, balance: t }) {
	let n = wa.getAll(), r = va.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	wa.replaceAll(i), va.replaceAll(a);
}
function Ia(e) {
	if (Aa(e.quantity), ja(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	Pa(e.inventoryMovementId);
	let { policy: t, unit: n } = Ma(e.productId, e.unitId), r = z(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Zi({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Qi({
		quantityBase: r,
		unitCostBase: i
	}), o = va.getBalance(e.siteId, e.productId);
	o && Na(o, t.baseUnitId);
	let s = $i({
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
	Na(l, t.baseUnitId);
	let u = wa.build({
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
	return Fa({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function La(e) {
	Aa(e.quantity), ja(e.occurredAt), Pa(e.inventoryMovementId);
	let { policy: t, unit: n } = Ma(e.productId, e.unitId), r = z(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = va.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (Na(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = Yi(i.averageCostPerBaseUnit), o = ea({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = z(i.quantityOnHand - r), c = s === 0, l = Xi(c ? -i.inventoryValue : -o), u = c ? 0 : Xi(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : Yi(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	Na(p, t.baseUnitId);
	let m = wa.build({
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
	return Fa({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function Ra(e) {
	if (Aa(e.quantityBase), ja(e.occurredAt), Pa(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = it(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!et(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = ka.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = z(e.quantityBase), i = Yi(e.unitCostBase), a = Xi(e.inventoryValue), o = va.getBalance(e.siteId, e.productId);
	o && Na(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = z(s + r), u = Xi(c + a), d = l === 0 ? 0 : Yi(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	Na(p, n.baseUnitId);
	let m = wa.build({
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
	return Fa({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var za = /* @__PURE__ */ new Set(), Ba = [];
function Va() {
	za.forEach((e) => e());
}
function Ha(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Ua = {
	subscribe(e) {
		return za.add(e), () => {
			za.delete(e);
		};
	},
	getSnapshot() {
		return Ba;
	},
	getAll() {
		return Ba;
	},
	getBalance(e, t) {
		return Ba.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = Ua.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: Ha(i.quantityOnHand + r),
				updatedAt: a
			};
			return Ba = Ba.map((r) => r.siteId === e && r.productId === t ? n : r), Va(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: Ha(r),
			updatedAt: a
		};
		return Ba = [o, ...Ba], Va(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = Ua.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = Ha(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ba = Ba.map((n) => n.siteId === e && n.productId === t ? o : n), Va(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of ma.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: Ha((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		Ba = Array.from(e.values()), Va();
	}
};
m("stock", {
	repository: Ua,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: Ba }),
	restore: (e) => {
		Ba = e.balances;
	},
	publish: () => za.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var Wa = /* @__PURE__ */ new Set(), Ga = D.read().goodsReceipts;
D.onRollback(() => {
	Ga = D.read().goodsReceipts;
});
function Ka() {
	try {
		D.update("goodsReceipts", Ga);
	} catch (e) {
		throw Ga = D.read().goodsReceipts, e;
	}
	Wa.forEach((e) => D.notify(e));
}
function qa(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Ja(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = Ga.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Ya(e) {
	return e?.trim() || void 0;
}
var Xa = {
	subscribe(e) {
		return Wa.add(e), () => {
			Wa.delete(e);
		};
	},
	getSnapshot() {
		return Ga;
	},
	getAll() {
		return Ga;
	},
	getById(e) {
		return Ga.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return Ga.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Ki.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = la.getById(e.siteId);
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
			let r = qa(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!it(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = at(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = qa(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: Ja(e.receiptDate),
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
			supplierDeliveryReference: Ya(e.supplierDeliveryReference),
			notes: Ya(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		sa.validateGoodsReceiptPosting(s), M();
		let c = j.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return j.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = it(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				j.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = ma.create({
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
				}), j.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					Ia({
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
				}), j.runStep(c, `STOCK:${r.id}`, () => {
					Ua.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			j.runStep(c, "JOURNAL", () => {
				sa.postGoodsReceipt(s);
			}), j.runStep(c, "PURCHASE_ORDER", () => {
				Ki.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), j.runStep(c, "RECEIPT", () => {
				Ga = [s, ...Ga], Ka();
			});
		}), j.recover(c), s;
	}
};
m("goodsReceipts", {
	repository: Xa,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: Ga }),
	restore: (e) => {
		Ga = e.goodsReceipts;
	},
	publish: () => Wa.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var Za = 1e-4;
function Qa(e) {
	return Xi(e);
}
function $a(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - z(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function eo(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function to(e, t, n) {
	let r = Zi({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Qi({
		quantityBase: z(e * n),
		unitCostBase: r
	});
}
function no(e, t, n) {
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
function ro(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = no(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), $a(e.quantity), eo(e.billUnitCost);
		let r = z(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > Za);
		if (z(d.reduce((e, t) => e + t.availableQuantity, 0)) + Za < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= Za) break;
			let s = z(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = z(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Qi({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: Zi({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Qa(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= Za ? Qa(p - m) : to(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let g = Qa(s * e.billUnitCost), _ = Qa(g - h);
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
				matchedReceiptValue: h,
				billUnitCost: e.billUnitCost,
				matchedBillValue: g,
				priceVariance: _,
				status: "ACTIVE",
				createdAt: l
			}), o.availableQuantity = z(o.availableQuantity - s), r = z(r - s);
		}
		if (r > Za) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Qa(Qa(e.quantity * e.billUnitCost) - Qa(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Qa(p.matchedBillValue + f), p.priceVariance = Qa(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = z(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = z(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Qa(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Qa(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Qa(p - f)
	};
}
var io = {
	calculate: ro,
	getAvailableReceiptLines(e, t, n) {
		return no(e, t, n);
	}
}, ao = D.read().receiptMatches;
D.onRollback(() => {
	ao = D.read().receiptMatches;
});
var oo = /* @__PURE__ */ new Set(), so = () => {
	try {
		D.update("receiptMatches", ao);
	} catch (e) {
		throw ao = D.read().receiptMatches, e;
	}
	oo.forEach((e) => D.notify(e));
}, co = {
	getAll() {
		return [...ao];
	},
	subscribe(e) {
		return oo.add(e), () => {
			oo.delete(e);
		};
	},
	getSnapshot() {
		return ao;
	},
	getByBill(e) {
		return ao.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (ao.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		ao = [...ao, ...t], so();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		ao = ao.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), so();
	}
};
m("receiptMatches", {
	repository: co,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: ao }),
	restore: (e) => {
		ao = e.matches;
	},
	publish: () => oo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function lo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function uo({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = lo(e * t), a = lo(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: lo(i + a)
	};
}
function fo(e) {
	let t = lo(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = lo(e.reduce((e, t) => e + t.taxAmount, 0)), r = lo(t + n);
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
var po = /* @__PURE__ */ new Set(), B = D.read().supplierBills;
D.onRollback(() => {
	B = D.read().supplierBills;
});
function mo() {
	try {
		D.update("supplierBills", B);
	} catch (e) {
		throw B = D.read().supplierBills, e;
	}
	po.forEach((e) => D.notify(e));
}
function ho(e) {
	return e?.trim() || void 0;
}
function go(e) {
	return de("BILL", B.map((e) => e.billNumber), e.slice(0, 4));
}
var _o = {
	insertExpenseBill(e) {
		let t = B.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (B.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return B = [e, ...B], mo(), e;
	},
	subscribe(e) {
		return po.add(e), () => {
			po.delete(e);
		};
	},
	getSnapshot() {
		return B;
	},
	getAll() {
		return B;
	},
	getById(e) {
		return B.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return B.filter((t) => t.supplierId === e);
	},
	applyPayment(e, t) {
		let n = B.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = yo(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = yo(n.totals.amountPaid + r), a = yo(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return B = B.map((t) => t.id === e ? o : t), mo(), o;
	},
	reversePayment(e, t) {
		let n = B.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = yo(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = yo(Math.max(0, n.totals.amountPaid - r)), a = yo(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return B = B.map((t) => t.id === e ? o : t), mo(), o;
	},
	applyCredit(e, t) {
		let n = B.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = yo(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = yo(n.totals.amountCredited + r), a = yo(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return B = B.map((t) => t.id === e ? o : t), mo(), o;
	},
	reverseCredit(e, t) {
		let n = B.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = yo(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = yo(Math.max(0, n.totals.amountCredited - r)), a = yo(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return B = B.map((t) => t.id === e ? o : t), mo(), o;
	},
	markVoid(e, t) {
		let r = B.find((t) => t.id === e);
		if (!r) throw Error("Supplier bill was not found.");
		if (r.status === "VOID") throw Error("This supplier bill has already been voided.");
		let i = t.trim();
		if (i.length < 3) throw Error("A void reason is required.");
		if (r.status !== "OPEN" || r.totals.amountPaid > 0 || r.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((n().supplierCredits?.supplierCredits ?? D.read().supplierCredits).some((e) => e.sourceSupplierBillId === r.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (r.kind === "EXPENSE") {
			M();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...r,
				status: "VOID",
				voidedAt: e,
				voidReason: i,
				updatedAt: e
			};
			return sa.reverseSupplierBill(t), B = B.map((e) => e.id === r.id ? t : e), mo(), t;
		}
		if (co.getByBill(r.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...r,
			status: "VOID",
			voidedAt: a,
			voidReason: i,
			updatedAt: a
		};
		M();
		let s = j.begin("SUPPLIER_BILL_VOID", r.id).key;
		return j.registerRecovery(s, () => {
			j.runStep(s, "REVERSAL_JOURNAL", () => {
				sa.reverseSupplierBill(o);
			}), j.runStep(s, "PURCHASE_ORDER", () => {
				Ki.reverseSupplierBill(r.purchaseOrderId, r.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), j.runStep(s, "MATCHES", () => {
				co.reverseForBill(r.id, i, S(a));
			}), j.runStep(s, "BILL", () => {
				B = B.map((e) => e.id === r.id ? o : e), mo();
			});
		}), j.recover(s), o;
	},
	getByPurchaseOrder(e) {
		return B.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Ki.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (B.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
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
			let r = vo(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = uo({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = yo(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = yo(o.lineSubtotal + o.taxAmount)), {
				id: `bill_line_${crypto.randomUUID()}`,
				grossUnitCost: e.unitCost === n.unitCost ? n.grossUnitCost : void 0,
				taxRate: a,
				taxCode: n.taxCode,
				taxCollectedAccountId: n.taxCollectedAccountId,
				taxPaidAccountId: n.taxPaidAccountId,
				taxReport: n.taxReport,
				purchaseOrderLineId: n.id,
				productId: n.productId,
				unitId: n.unitId,
				sku: n.sku,
				description: n.description,
				unitSymbol: n.unitSymbol,
				quantity: e.quantity,
				unitCost: e.unitCost,
				...o
			};
		}), o = fo(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: go(e.billDate),
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
			notes: ho(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = io.calculate({
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
			receipts: Xa.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: co.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		sa.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), M();
		let u = j.begin("SUPPLIER_BILL", c.id).key;
		return j.registerRecovery(u, () => {
			j.runStep(u, "JOURNAL", () => {
				sa.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), j.runStep(u, "PURCHASE_ORDER", () => {
				Ki.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), j.runStep(u, "MATCHES", () => {
				co.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), j.runStep(u, "BILL", () => {
				B = [c, ...B], mo();
			});
		}), j.recover(u), c;
	}
};
function vo(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function yo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
m("supplierBills", {
	repository: _o,
	read: "purchases.read",
	commands: {
		insertExpenseBill: null,
		catch: null,
		applyPayment: null,
		reversePayment: null,
		applyCredit: null,
		reverseCredit: null,
		markVoid: "purchases.void",
		create: "purchases.bill",
		return: null
	},
	snapshot: () => ({ supplierBills: B }),
	restore: (e) => {
		B = e.supplierBills;
	},
	publish: () => po.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierPaymentRepository.ts
var bo = /* @__PURE__ */ new Set(), xo = D.read().supplierPayments;
D.onRollback(() => {
	xo = D.read().supplierPayments;
});
function So() {
	D.update("supplierPayments", xo), bo.forEach((e) => D.notify(e));
}
var Co = {
	subscribe(e) {
		return bo.add(e), () => {
			bo.delete(e);
		};
	},
	getSnapshot() {
		return xo;
	},
	getAll() {
		return xo;
	},
	getById(e) {
		return xo.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return xo.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return xo.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: To(e.reference),
			notes: To(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: Eo(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = xo.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (T(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = Ni.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = L.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = _o.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = Eo(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${Do(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = Eo(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) _o.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: wo(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: To(e.reference),
			notes: To(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return xo = [u, ...xo], So(), sa.postSupplierPayment(u), u;
	},
	recordPrepaymentSettlement(e) {
		T(e.paymentDate);
		let t = Ni.getById(e.supplierId), n = _o.getById(e.supplierBillId);
		if (!t || !n || n.supplierId !== t.id || e.paymentDate < n.billDate || !e.prepaymentId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid supplier prepayment application.");
		if (xo.some((t) => t.id === e.id || t.prepaymentApplicationId === e.applicationId)) throw Error("Prepayment application already exists.");
		_o.applyPayment(n.id, e.amount);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: e.id,
			prepaymentId: e.prepaymentId,
			prepaymentApplicationId: e.applicationId,
			paymentNumber: wo(e.paymentDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			paymentDate: e.paymentDate,
			amount: e.amount,
			method: "OTHER",
			bankAccountId: e.bankAccountId,
			reference: e.reference,
			notes: "Prepayment applied; no new bank payment.",
			allocations: [{
				id: crypto.randomUUID(),
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: e.amount
			}],
			status: "POSTED",
			createdAt: r,
			updatedAt: r
		};
		return xo = [i, ...xo], So(), i;
	},
	reversePrepaymentSettlement(e, t, n) {
		T(t);
		let r = xo.find((t) => t.id === e);
		if (!r?.prepaymentApplicationId || r.status !== "POSTED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid supplier prepayment reversal.");
		for (let e of r.allocations) _o.reversePayment(e.supplierBillId, e.amount);
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return xo = xo.map((t) => t.id === e ? i : t), So(), i;
	},
	reverse(e, t) {
		if (jt("SUPPLIER_PAYMENT", e), xo.find((t) => t.id === e)?.prepaymentApplicationId) throw Error("Reverse this settlement through supplier prepayments.");
		let n = xo.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = _o.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) _o.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return xo = xo.map((t) => t.id === e ? a : t), So(), sa.reverseSupplierPayment(a), a;
	}
};
function wo(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = xo.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function To(e) {
	return e?.trim() || void 0;
}
function Eo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Do(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: x().currency
	}).format(e);
}
var Oo = Co.create;
Co.create = function(...e) {
	return M(), D.transaction(() => Oo.apply(Co, e));
};
var ko = Co.reverse;
Co.reverse = function(...e) {
	return M(), D.transaction(() => ko.apply(Co, e));
}, m("supplierPayments", {
	repository: Co,
	read: "purchases.read",
	commands: {
		recordPrepaymentSettlement: null,
		reversePrepaymentSettlement: null,
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: xo }),
	restore: (e) => {
		xo = e.supplierPayments;
	},
	publish: () => bo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var Ao = /* @__PURE__ */ new Set(), V = D.read().supplierCredits, jo = D.read().supplierCreditAllocations, Mo = D.read().supplierCredits, No = D.read().supplierCreditAllocations;
D.onRollback(() => {
	V = D.read().supplierCredits, jo = D.read().supplierCreditAllocations, Mo = V, No = jo;
});
function Po() {
	D.update("supplierCredits", V), D.update("supplierCreditAllocations", jo), Mo = [...V], No = [...jo], Ao.forEach((e) => D.notify(e));
}
var Fo = !1, H = {
	subscribe(e) {
		return Ao.add(e), () => {
			Ao.delete(e);
		};
	},
	getSnapshot() {
		return Mo;
	},
	getAllocationSnapshot() {
		return No;
	},
	getAll() {
		return Mo;
	},
	getAllAllocations() {
		return No;
	},
	getById(e) {
		return V.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return V.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return V.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return jo.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return jo.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return jo.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...H.create(e),
			physicalReturnId: t
		};
		return H.update(n), n;
	},
	voidReturnCredit(e) {
		Fo = !0;
		try {
			return H.voidCredit(e);
		} finally {
			Fo = !1;
		}
	},
	create(e) {
		let t = _o.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (V.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!zo(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = Vo(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = V.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = Bo(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = Bo(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || Bo(m + f) > r.lineSubtotal || Bo(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let g = Bo(m + h);
			return {
				id: Ro(`supplier-credit-line-${n + 1}`),
				expenseAccountId: r.expenseAccountId,
				taxCode: r.taxCode,
				taxRate: r.taxRate,
				taxCollectedAccountId: r.taxCollectedAccountId,
				taxPaidAccountId: r.taxPaidAccountId,
				taxReport: r.taxReport,
				purchaseOrderLineId: r.purchaseOrderLineId,
				supplierBillLineId: r.id,
				productId: r.productId,
				unitId: r.unitId,
				sku: r.sku,
				description: r.description,
				unitSymbol: r.unitSymbol,
				quantity: o,
				unitCost: s,
				lineSubtotal: m,
				taxAmount: h,
				lineTotal: g
			};
		}), s = Bo(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = Bo(o.reduce((e, t) => e + t.taxAmount, 0)), l = Bo(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (Bo(Bo(V.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > Bo(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: Ro("supplier-credit"),
			creditNumber: Lo(e.creditDate),
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
		return V = [d, ...V], Po(), sa.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = V.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = _o.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!zo(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = Bo(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: Ro("supplier-credit-allocation"),
			allocationNumber: Io(e.allocationDate),
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
		_o.applyCredit(n.id, r);
		let o = Bo(t.amountApplied + r), s = Bo(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return jo = [a, ...jo], V = V.map((e) => e.id === t.id ? c : e), Po(), a;
	},
	reverseAllocation(e) {
		let t = jo.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = V.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = _o.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		_o.reverseCredit(i.id, t.amount);
		let o = Bo(Math.max(0, r.amountApplied - t.amount)), s = Bo(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return V = V.map((e) => e.id === r.id ? c : e), jo = jo.map((e) => e.id === t.id ? l : e), Po(), l;
	},
	voidCredit(e) {
		let t = V.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !Fo) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (jo.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: Fo && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return V = V.map((e) => e.id === t.id ? i : e), Po(), sa.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!jo.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return jo = jo.map((t) => t.id === e.id ? e : t), Po(), e;
	},
	update(e) {
		if (!V.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return V = V.map((t) => t.id === e.id ? e : t), Po(), e;
	}
};
function Io(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = jo.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Lo(e) {
	return de("SC", V.map((e) => e.creditNumber), e.slice(0, 4));
}
function Ro(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function zo(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function Bo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Vo(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Ho = H.create;
H.create = function(...e) {
	return M(), D.transaction(() => Ho.apply(H, e));
};
var Uo = H.applyToBill;
H.applyToBill = function(...e) {
	return M(), D.transaction(() => Uo.apply(H, e));
};
var Wo = H.reverseAllocation;
H.reverseAllocation = function(...e) {
	return M(), D.transaction(() => Wo.apply(H, e));
};
var Go = H.voidCredit;
H.voidCredit = function(...e) {
	return M(), D.transaction(() => Go.apply(H, e));
};
var Ko = H.update;
H.update = function(...e) {
	return M(), D.transaction(() => Ko.apply(H, e));
};
var qo = H.updateAllocation;
H.updateAllocation = function(...e) {
	return M(), D.transaction(() => qo.apply(H, e));
}, m("supplierCredits", {
	repository: H,
	read: "purchases.read",
	commands: {
		createReturnCredit: null,
		voidReturnCredit: null,
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
		supplierCredits: V,
		allocations: jo
	}),
	restore: (e) => {
		V = e.supplierCredits, jo = e.allocations, Mo = [...V], No = [...jo];
	},
	publish: () => Ao.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function Jo(e) {
	let t = [], n = new Map(e.journals.map((e) => [e.id, e])), r = ne(e.journals);
	for (let e of r.invalid) t.push({
		code: "REVERSAL_MISMATCH",
		entityId: e,
		message: "Invalid bank duplicate correction pair."
	});
	let i = /* @__PURE__ */ new Map();
	for (let n of e.journals) {
		if (!n.sourceId || r.originals.has(n.id)) continue;
		let e = `${n.sourceType}:${n.sourceId}`, a = i.get(e);
		a ? t.push({
			code: "DUPLICATE_SOURCE",
			entityId: n.id,
			message: `Journal source ${e} also used by ${a}`
		}) : i.set(e, n.id);
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
	let a = (e) => Math.round((e + 2 ** -52) * 100) / 100, o = (n, i, o, s) => {
		let c = e.journals.filter((e) => e.sourceType === i && e.sourceId === n && !e.reversedJournalEntryId && !r.originals.has(e.id));
		if (!c.length) {
			t.push({
				code: "MISSING_JOURNAL",
				entityId: n,
				message: `${i} has no original GL journal`
			});
			return;
		}
		let l = c[0];
		(a(l.totalDebit) !== a(o) || a(l.totalCredit) !== a(o)) && t.push({
			code: "AMOUNT_MISMATCH",
			entityId: n,
			message: `${i} total differs from GL`
		});
		let u = e.journals.find((e) => e.id === l.reversalJournalEntryId && e.reversedJournalEntryId === l.id);
		(s !== (l.status === "REVERSED") || s && !u) && t.push({
			code: "REVERSAL_MISMATCH",
			entityId: n,
			message: `${i} reversal differs from GL lifecycle`
		});
	};
	for (let n of e.journals) {
		if (Array.isArray(n.lines)) {
			let e = a(n.lines.reduce((e, t) => e + t.debit, 0)), r = a(n.lines.reduce((e, t) => e + t.credit, 0));
			(!Number.isFinite(e) || !Number.isFinite(r) || e !== r || e !== a(n.totalDebit) || r !== a(n.totalCredit)) && t.push({
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
	for (let t of e.invoices ?? []) t.status !== "DRAFT" && o(t.id, "CUSTOMER_INVOICE", t.totals.total, t.status === "VOID");
	for (let t of e.creditNotes ?? []) t.status !== "DRAFT" && o(t.id, "CREDIT_NOTE", t.totals.total, t.status === "VOID");
	for (let t of e.payments) Number.isFinite(t.amount) && o(t.id, "CUSTOMER_PAYMENT", t.amount, t.status === "REVERSED");
	for (let t of e.transactions) Number.isFinite(t.amount) && o(t.id, "BANK_TRANSACTION", t.amount, !1);
	for (let t of e.transfers) Number.isFinite(t.amount) && o(t.id, "BANK_TRANSFER", t.amount, !1);
	for (let t of e.supplierBills ?? []) o(t.id, "SUPPLIER_BILL", t.totals.total, t.status === "VOID");
	for (let n of e.supplierPayments ?? []) o(n.id, "SUPPLIER_PAYMENT", n.amount, n.status === "REVERSED"), a(n.allocations.reduce((e, t) => e + t.amount, 0)) !== a(n.amount) && t.push({
		code: "AMOUNT_MISMATCH",
		entityId: n.id,
		message: "Supplier payment allocations do not equal payment total"
	});
	for (let t of e.supplierCredits ?? []) o(t.id, "SUPPLIER_CREDIT", t.totals.total, t.status === "VOID");
	return t;
}
//#endregion
//#region src/features/banking/data/bankTransactionRepository.ts
var Yo = /* @__PURE__ */ new Set(), Xo = D.read().transactions, Zo = D.read().transfers;
D.onRollback(() => {
	let e = D.read();
	Xo = e.transactions, Zo = e.transfers;
});
function Qo() {
	Yo.forEach((e) => D.notify(e));
}
function $o(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function es(e) {
	return e?.trim() || void 0;
}
function ts(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function ns(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function rs(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function is(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var as = {
	subscribe(e) {
		return Yo.add(e), () => {
			Yo.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Xo;
	},
	getTransfersSnapshot() {
		return Zo;
	},
	getTransactions() {
		return Xo;
	},
	getTransfers() {
		return Zo;
	},
	createTransaction(e, t) {
		if (ts(e.transactionDate), T(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = ns(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = $o(e.description, "Description"), i = L.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = P.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = P.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (L.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = rs("banktxn"), c = is("BTXN", e.transactionDate, Xo.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = O.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Xo.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && O.bindResult(l, s);
			let t = F.post({
				journalDate: e.transactionDate,
				description: r,
				reference: es(e.reference),
				sourceType: "BANK_TRANSACTION",
				sourceId: s,
				lines: e.direction === "MONEY_IN" ? [{
					accountId: a.id,
					description: r,
					debit: n,
					credit: 0
				}, {
					accountId: o.id,
					description: r,
					debit: 0,
					credit: n
				}] : [{
					accountId: o.id,
					description: r,
					debit: n,
					credit: 0
				}, {
					accountId: a.id,
					description: r,
					debit: 0,
					credit: n
				}]
			}), u = {
				id: s,
				transactionNumber: c,
				bankAccountId: i.id,
				transactionDate: e.transactionDate,
				direction: e.direction,
				amount: n,
				offsetAccountId: o.id,
				description: r,
				reference: es(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Xo];
			if (D.update("transactions", d), Xo = d, Qo(), l) {
				let e = F.getBySource("BANK_TRANSACTION", s);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return u;
		} catch (e) {
			if (l) try {
				O.flagForReview(l, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		ts(e.transferDate), T(e.transferDate, "Transfer date");
		let n = ns(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = $o(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = L.requireById(e.fromBankAccountId), a = L.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = P.requireById(i.glAccountId), s = P.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = rs("banktrf"), l = is("BTRF", e.transferDate, Zo.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = O.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Zo.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && O.bindResult(u, c);
			let t = F.post({
				journalDate: e.transferDate,
				description: r,
				reference: es(e.reference),
				sourceType: "BANK_TRANSFER",
				sourceId: c,
				lines: [{
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
			}), d = {
				id: c,
				transferNumber: l,
				fromBankAccountId: i.id,
				toBankAccountId: a.id,
				transferDate: e.transferDate,
				amount: n,
				description: r,
				reference: es(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...Zo];
			if (D.update("transfers", f), Zo = f, Qo(), u) {
				let e = F.getBySource("BANK_TRANSFER", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return d;
		} catch (e) {
			if (u) try {
				O.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, os = as.createTransaction;
as.createTransaction = function(e, t) {
	M();
	let n;
	try {
		return n = D.transaction(() => os.call(as, e, t)), t && O.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = O.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				O.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
var ss = as.createTransfer;
as.createTransfer = function(e, t) {
	M();
	let n;
	try {
		return n = D.transaction(() => ss.call(as, e, t)), t && O.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = O.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				O.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
function cs(e) {
	if (Xo.some((t) => t.id === e.id) || Zo.some((t) => t.id === e.id)) throw Error("Bank result already exists; restoration cannot duplicate it.");
	"transactionNumber" in e ? (Xo = [structuredClone(e), ...Xo], D.update("transactions", Xo)) : (Zo = [structuredClone(e), ...Zo], D.update("transfers", Zo)), Qo();
}
function ls(e, t, n) {
	if ([...Xo, ...Zo].filter((n) => n.id === e && n.journalEntryId === t).length !== 1) throw Error("Bank result changed before journal repair.");
	Xo = Xo.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), Zo = Zo.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), D.update("transactions", Xo), D.update("transfers", Zo), Qo();
}
m("bankTransactions", {
	repository: as,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Xo,
		bankTransfers: Zo
	}),
	restore: (e) => {
		Xo = e.bankTransactions, Zo = e.bankTransfers;
	},
	publish: () => Yo.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function us(e) {
	return Jo({
		transactions: e?.transactions ?? as.getTransactions(),
		transfers: e?.transfers ?? as.getTransfers(),
		payments: Ur.getAll(),
		journals: e?.journals ?? F.getAll(),
		invoices: R.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: I.getAll(),
		supplierBills: _o.getAll(),
		supplierPayments: Co.getAll(),
		supplierCredits: H.getAll()
	});
}
//#endregion
//#region src/features/banking/data/bankRecoveryEvidence.ts
var ds = (e) => e === "BANK_TRANSACTION" || e === "BANK_TRANSFER";
function fs(e, t, n = !0) {
	let r = O.list(), i = r.filter((t) => t.operationId === e);
	if (i.length !== 1) return ["Bank operation identity is missing or duplicated."];
	let a = i[0], o = [];
	if ((!ds(a.kind) || (n ? a.state !== "MANUAL_REVIEW" : a.state === "COMPLETED")) && o.push("Operation is not an unresolved bank review."), a.resultId || o.push("Operation has no durable bound result; cannot infer effects."), n && !a.reviewHistory?.length && o.push("Operator reconciliation evidence is missing."), o.length) return o;
	let s = t?.transactions ?? as.getTransactions(), c = t?.transfers ?? as.getTransfers(), l = t?.journals ?? F.getAll(), u = a.kind === "BANK_TRANSACTION" ? s : c;
	if (u.filter((e) => e.id === a.resultId).length !== 1) return ["Bank business result is missing or duplicated."];
	let d = s.find((e) => e.id === a.resultId), f = c.find((e) => e.id === a.resultId), p = u.find((e) => e.id === a.resultId), m = (e) => new Set(e).size === e.length;
	if (!m(l.map((e) => e.id)) || !m(u.map((e) => e.id))) return ["Duplicate bank or GL identity; evidence is ambiguous."];
	let h = ne(l);
	if (h.invalid.length) return ["Invalid duplicate-correction evidence."];
	let g = l.filter((e) => e.sourceType === a.kind && e.sourceId === a.resultId && !h.originals.has(e.id));
	if (g.length !== 1) return ["Bank result must have exactly one source journal."];
	let _ = g[0];
	(_.id !== p.journalEntryId || _.status !== "POSTED" || _.reversedJournalEntryId || _.reversalJournalEntryId || _.reversedAt || l.some((e) => e.reversedJournalEntryId === _.id)) && o.push("Bank journal link or posted lifecycle is not verified; reversed effects require separate repair.");
	let v = a.kind === "BANK_TRANSACTION" ? d.transactionDate : f.transferDate;
	try {
		T(v, "Bank result date");
	} catch {
		o.push("Bank result date is invalid.");
	}
	let y = (e) => Math.round((e + 2 ** -52) * 100), ee = p.amount;
	(!Number.isFinite(ee) || ee <= 0 || Math.abs(ee - y(ee) / 100) > 1e-8) && o.push("Bank amount must be positive whole cents."), (_.journalDate !== v || _.description !== p.description || _.reference !== p.reference) && o.push("Journal date, description or reference differs from the bank result.");
	let te, re, ie = P.getAll();
	if (a.kind === "BANK_TRANSACTION") {
		let e = L.getById(d.bankAccountId), t = ie.find((e) => e.id === d.offsetAccountId);
		(!e || !t || !t.allowManualPosting || e.glAccountId === t.id || L.getByGlAccountId(t.id) || v < e.openingBalanceDate) && o.push("Bank or offset account mapping is invalid."), ["MONEY_IN", "MONEY_OUT"].includes(d.direction) || o.push("Bank direction is invalid."), te = d.direction === "MONEY_IN" ? e?.glAccountId : t?.id, re = d.direction === "MONEY_IN" ? t?.id : e?.glAccountId;
	} else {
		let e = L.getById(f.fromBankAccountId), t = L.getById(f.toBankAccountId);
		(!e || !t || e.id === t.id || e.glAccountId === t.glAccountId || e.currency !== t.currency || v < e.openingBalanceDate || v < t.openingBalanceDate) && o.push("Transfer bank mappings, currency or dates are invalid."), te = t?.glAccountId, re = e?.glAccountId;
	}
	(!te || !re || !ie.some((e) => e.id === te) || !ie.some((e) => e.id === re) || _.lines.length !== 2 || !_.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0) || !_.lines.some((e) => e.accountId === te && e.debit === ee && e.credit === 0) || !_.lines.some((e) => e.accountId === re && e.credit === ee && e.debit === 0) || _.totalDebit !== ee || _.totalCredit !== ee) && o.push("Bank journal accounts, direction or amounts do not exactly match the bound result.");
	try {
		let e = JSON.parse(a.fingerprint);
		(!e || typeof e != "object" || !Number.isFinite(e.amount) || y(e.amount) !== y(ee) || typeof e.description != "string" || e.description.trim() !== p.description || ((e) => typeof e == "string" && e.trim() || void 0)(e.reference) !== p.reference || (a.kind === "BANK_TRANSACTION" ? e.bankAccountId !== d.bankAccountId || e.transactionDate !== v || e.direction !== d.direction || e.offsetAccountId !== d.offsetAccountId : e.fromBankAccountId !== f.fromBankAccountId || e.toBankAccountId !== f.toBankAccountId || e.transferDate !== v)) && o.push("Saved bank intent does not match the bound business result.");
	} catch {
		o.push("Saved bank intent is unreadable; cannot verify original request.");
	}
	return r.some((e) => e.operationId !== a.operationId && e.kind === a.kind && e.resultId === a.resultId) && o.push("Another operation claims this bank result."), o;
}
//#endregion
//#region electron/security/targetedFinancialRepair.ts
var ps = y().trim().min(1).max(200), ms = y().trim().min(3).max(500), hs = y().trim().min(10).max(4e3), gs = y().regex(/^[a-f0-9]{64}$/), _s = w({ operationId: ps }).strict(), vs = _s.extend({
	expectedDigest: gs,
	reference: ms,
	summary: hs,
	businessChecked: i(!0),
	glChecked: i(!0),
	externalEvidenceChecked: i(!0)
}).strict(), ys = _s.extend({
	proposalId: ps,
	expectedDigest: gs,
	approvalReference: ms,
	confirm: i(!0)
}).strict(), bs = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function xs(e) {
	return Array.isArray(e) ? e.map(xs) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, xs(t)])) : e;
}
var Ss = (e) => we("sha256").update(JSON.stringify(xs(e))).digest("hex");
function Cs() {
	return Ss({
		business: n(),
		operations: O.list().map(({ repairProposal: e, ...t }) => t)
	});
}
function ws(e, t) {
	return typeof e == "string" ? e === t || e.startsWith(t + ":") : Array.isArray(e) ? e.some((e) => ws(e, t)) : !!e && typeof e == "object" && Object.values(e).some((e) => ws(e, t));
}
function Ts(e) {
	let t = {
		amount: c().finite().positive(),
		description: y().trim().min(1).max(2e3),
		reference: y().max(2e3).optional()
	}, n = (e.kind === "BANK_TRANSACTION" ? w({
		...t,
		bankAccountId: ps,
		transactionDate: ps,
		direction: g(["MONEY_IN", "MONEY_OUT"]),
		offsetAccountId: ps
	}).strict() : w({
		...t,
		fromBankAccountId: ps,
		toBankAccountId: ps,
		transferDate: ps
	}).strict()).parse(JSON.parse(e.fingerprint));
	return {
		...n,
		amount: bs(n.amount),
		description: n.description.trim(),
		reference: n.reference?.trim() || void 0
	};
}
function Es(e) {
	let t = O.list(), r = t.find((t) => t.operationId === e), i = {
		operationId: e,
		resultId: r?.resultId,
		evidenceDigest: Cs(),
		eligible: !1,
		blockers: [],
		changes: []
	}, a = (e) => (i.blockers.push(e), { public: i });
	if (!r || r.state === "COMPLETED") return a("An unresolved operation is required.");
	if (!r.resultId?.trim()) return a("No durable bound result identity. Absence of effects cannot be proved; use validated backup recovery.");
	if (!["BANK_TRANSACTION", "BANK_TRANSFER"].includes(r.kind)) return a("This operation kind has no targeted repair procedure. Existing verified closure or validated backup recovery remains available.");
	if (t.some((e) => e.operationId !== r.operationId && e.resultId === r.resultId)) return a("Another operation claims this result.");
	let o;
	try {
		o = Ts(r);
	} catch {
		return a("Saved bank intent is invalid or unreadable.");
	}
	if (o.amount <= 0) return a("Saved bank amount does not round to positive cents.");
	let s = as.getTransactions(), c = as.getTransfers(), l = F.getAll(), u = [...s, ...c].filter((e) => e.id === r.resultId), d = l.filter((e) => e.sourceType === r.kind && e.sourceId === r.resultId), f = n();
	if (l.some((e) => e.sourceId === r.resultId && e.sourceType !== r.kind)) return a("A journal with another source kind claims this bound result.");
	let p = D.read();
	if (JSON.stringify(p.transactions) !== JSON.stringify(s) || JSON.stringify(p.transfers) !== JSON.stringify(c) || JSON.stringify(p.journals) !== JSON.stringify(l)) return a("Financial cache and source repositories disagree; restore a consistent snapshot first.");
	if (new Set(l.map((e) => e.id)).size !== l.length || u.length > 1) return a("Duplicate bank or journal identities are ambiguous.");
	if (u.length === 1 && d.length === 2) {
		let n = u[0], s = d.find((e) => e.id === n.journalEntryId), c = d.find((e) => e.id !== n.journalEntryId);
		if (!s || !c || s.status !== "POSTED" || c.status !== "POSTED" || [s, c].some((e) => e.bankDuplicateCorrection || e.reversedJournalEntryId || e.reversalJournalEntryId || e.reversedAt) || !me(s, c)) return a("Duplicate journals must be exact original postings with an unambiguous existing bank-record link.");
		let p = { ...f };
		if (delete p.journals, delete p.financialCache, Object.values(p).some((e) => ws(e, c.id)) || t.some((e) => ws(e, c.id)) || l.some((e) => e.id !== c.id && ws(e, c.id))) return a("The duplicate journal is referenced by matching, clearing or another source.");
		let m = s.journalDate;
		try {
			T(m, "Duplicate financial date"), _n(m), Mt(m, c.lines.map((e) => e.accountId));
		} catch (e) {
			return a(e.message);
		}
		if (c.lines.some((e) => !P.getAll().find((t) => t.id === e.accountId)?.active) || L.getAll().some((e) => c.lines.some((t) => t.accountId === e.glAccountId) && !e.active)) return a("Duplicate correction requires active bank and GL accounts.");
		let h = "duplicate-preview:" + r.operationId, g = (/* @__PURE__ */ new Date()).toISOString();
		if (l.some((e) => e.id === h)) return a("Preview journal identity collision.");
		let _ = {
			id: h,
			journalNumber: "Pending duplicate correction",
			journalDate: m,
			description: "Reversal of " + c.journalNumber + ": " + c.description,
			reference: c.reference,
			sourceType: c.sourceType,
			status: "POSTED",
			lines: c.lines.map((e, t) => ({
				...e,
				id: "duplicate-offset-" + t,
				debit: e.credit,
				credit: e.debit
			})),
			totalDebit: c.totalCredit,
			totalCredit: c.totalDebit,
			createdAt: g,
			updatedAt: g,
			postedAt: g,
			reversedJournalEntryId: c.id
		}, v = {
			...c,
			status: "REVERSED",
			reversalJournalEntryId: h,
			reversedAt: g,
			updatedAt: g,
			reversalReason: "Proposed duplicate correction",
			bankDuplicateCorrection: {
				canonicalJournalId: s.id,
				operationId: r.operationId
			}
		}, y = { journals: [_, ...l.map((e) => e.id === c.id ? v : e)] }, ee = fs(e, y, !1), te = us(y);
		return ne(y.journals).invalid.length || ee.length || te.length ? a("Exact duplicate correction cannot prove an isolated repair: " + [...ee, ...te.map((e) => e.code)].join(" ")) : (i.action = "REVERSE_BANK_DUPLICATE", i.journalDate = m, i.amount = o.amount, i.existingJournalId = s.id, i.duplicateJournalId = c.id, i.eligible = !0, i.changes = [
			"Independent bank evidence must confirm one intended transaction; a second real external payment is not a local duplicate repair.",
			"Preserve bank-record link to " + s.id + " and all original journal lines.",
			"Mark only duplicate " + c.id + " as REVERSED and post its exact opposite on " + m + ".",
			"Retain both sides visibly in GL and bank registers; their net cash effect is zero. They cannot be matched or cleared as external cash.",
			"Keep the independently approved plan, duplicate/canonical identities and verification digests in the operation audit."
		], { public: i });
	}
	if (new Set(l.map((e) => e.id)).size !== l.length || u.length > 1 || d.length > 1) return a("Duplicate bank or journal evidence requires separate reviewed recovery. No duplicate is deleted or silently selected.");
	let m = "transactionDate" in o ? o.transactionDate : o.transferDate;
	try {
		T(m, "Bank intent date");
	} catch {
		return a("Saved bank intent date is invalid.");
	}
	if (i.journalDate = m, i.amount = o.amount, !u.length && !d.length) {
		if (Object.entries(f).some(([e, t]) => e !== "financialCache" && ws(t, r.resultId))) return a("Other business records still reference the bound result.");
		let e = us();
		return e.length ? a("Other financial inconsistencies remain: " + e.map((e) => e.code).join(", ")) : (i.action = "CANCEL_NO_EFFECT", i.eligible = !0, i.changes = [
			"Retire this operation as CANCELLED_NO_EFFECT while preserving its original bound identity and full audit history.",
			"No business record, stock movement or GL entry is created, changed or reversed.",
			"The original operation ID can never be replayed. A genuinely new transaction requires a new ID after all write blockers are resolved."
		], { public: i });
	}
	let h = "REC-" + r.resultId, g, _ = {
		id: r.resultId,
		amount: o.amount,
		description: o.description,
		reference: o.reference,
		journalEntryId: d[0]?.id ?? u[0]?.journalEntryId ?? "",
		createdAt: d[0]?.createdAt ?? u[0]?.createdAt ?? r.createdAt
	};
	if (g = "transactionDate" in o ? {
		..._,
		transactionNumber: h,
		bankAccountId: o.bankAccountId,
		transactionDate: o.transactionDate,
		direction: o.direction,
		offsetAccountId: o.offsetAccountId
	} : {
		..._,
		transferNumber: h,
		fromBankAccountId: o.fromBankAccountId,
		toBankAccountId: o.toBankAccountId,
		transferDate: o.transferDate
	}, !u.length && d.length === 1) {
		let t = { ...f };
		if (delete t.journals, delete t.financialCache, Object.values(t).some((e) => ws(e, r.resultId))) return a("Another repository references the missing bank result.");
		if ([...s.map((e) => e.transactionNumber), ...c.map((e) => e.transferNumber)].includes(h)) return a("Recovered business number is already in use.");
		let n = "transactionNumber" in g ? { transactions: [g, ...s] } : { transfers: [g, ...c] }, o = fs(e, n, !1), l = us(n);
		return o.length || l.length ? a("Existing GL cannot prove the exact intended bank result: " + [...o, ...l.map((e) => e.code)].join(" ")) : (i.action = "RESTORE_BANK_RECORD", i.existingJournalId = d[0].id, i.businessNumber = h, i.eligible = !0, i.changes = ["Restore only the missing bank register record from the saved intent and the uniquely verified existing source journal.", "Keep the existing GL journal, financial date, amounts, accounts and reconciliation/match records unchanged."], {
			public: i,
			record: g
		});
	}
	if (u.length === 1 && d.length === 1 && u[0].journalEntryId !== d[0].id) {
		let t = u[0], n = d[0];
		if (r.kind === "BANK_TRANSACTION" != "transactionNumber" in t) return a("Bound result belongs to a different bank operation kind.");
		if (!t.journalEntryId?.trim()) return a("Previous journal identity is missing; validated backup recovery is required.");
		if (!l.some((e) => e.id === t.journalEntryId)) {
			let e = { ...f };
			if (delete e.bankTransactions, delete e.financialCache, Object.values(e).some((e) => ws(e, t.journalEntryId))) return a("The stale missing journal is still referenced by another repository.");
		}
		let o = {
			...t,
			journalEntryId: n.id
		}, p = "transactionNumber" in o ? { transactions: s.map((e) => e.id === o.id ? o : e) } : { transfers: c.map((e) => e.id === o.id ? o : e) }, m = fs(e, p, !1), h = us(p);
		return m.length || h.length ? a("A unique existing journal cannot prove an isolated link repair: " + [...m, ...h.map((e) => e.code)].join(" ")) : (i.action = "RESTORE_BANK_JOURNAL_LINK", i.previousJournalId = t.journalEntryId, i.existingJournalId = n.id, i.eligible = !0, i.changes = [
			"Change only this bank record journal link from " + t.journalEntryId + " to " + n.id + ".",
			"Preserve every GL journal, original financial date, account, amount, bank balance and reconciliation/match record.",
			"Retain the previous link, the independently approved plan and verification digests in the operation audit."
		], { public: i });
	}
	if (u.length === 1 && !d.length) {
		let t = u[0];
		if (r.kind === "BANK_TRANSACTION" != "transactionNumber" in t) return a("Bound result belongs to a different bank operation kind.");
		if (!t.journalEntryId || l.some((e) => e.id === t.journalEntryId)) return a("Linked journal exists with a conflicting source.");
		let n = { ...f };
		if (delete n.bankTransactions, delete n.financialCache, Object.values(n).some((e) => ws(e, t.journalEntryId))) return a("Missing journal is referenced by clearing, matching or another repository.");
		let d = "bankAccountId" in g ? L.getById(g.bankAccountId) : void 0, p = "fromBankAccountId" in g ? L.getById(g.fromBankAccountId) : void 0, h = "toBankAccountId" in g ? L.getById(g.toBankAccountId) : void 0, _ = "direction" in g ? g.direction === "MONEY_IN" ? d?.glAccountId : g.offsetAccountId : h?.glAccountId, v = "direction" in g ? g.direction === "MONEY_IN" ? g.offsetAccountId : d?.glAccountId : p?.glAccountId;
		if (!_ || !v) return a("Bank GL mapping is missing.");
		try {
			_n(m), Mt(m, [_, v]);
		} catch (e) {
			return a(e.message);
		}
		if ([
			d,
			p,
			h
		].filter(Boolean).some((e) => !e.active) || [_, v].some((e) => !P.getAll().find((t) => t.id === e)?.active)) return a("Missing-journal repair requires currently active bank and GL accounts.");
		let y = {
			journalDate: m,
			description: o.description,
			reference: o.reference,
			sourceType: r.kind,
			sourceId: r.resultId,
			lines: [{
				accountId: _,
				debit: o.amount,
				credit: 0
			}, {
				accountId: v,
				debit: 0,
				credit: o.amount
			}]
		}, ee = "repair-preview:" + r.operationId;
		if (l.some((e) => e.id === ee)) return a("Preview journal identity collision.");
		let te = {
			id: ee,
			journalNumber: "Pending repair approval",
			journalDate: m,
			description: o.description,
			reference: o.reference,
			sourceType: y.sourceType,
			sourceId: r.resultId,
			status: "POSTED",
			lines: y.lines.map((e, t) => {
				let n = P.requireById(e.accountId);
				return {
					...e,
					id: "preview-" + t,
					accountCode: n.code,
					accountName: n.name
				};
			}),
			totalDebit: o.amount,
			totalCredit: o.amount,
			createdAt: r.createdAt,
			updatedAt: r.createdAt,
			postedAt: r.createdAt
		}, ne = {
			...t,
			journalEntryId: ee
		}, re = "transactionNumber" in ne ? {
			transactions: s.map((e) => e.id === ne.id ? ne : e),
			journals: [te, ...l]
		} : {
			transfers: c.map((e) => e.id === ne.id ? ne : e),
			journals: [te, ...l]
		}, ie = fs(e, re, !1), b = us(re);
		return ie.length || b.length ? a("Business record and saved intent cannot prove an isolated missing-journal repair: " + [...ie, ...b.map((e) => e.code)].join(" ")) : (i.action = "RESTORE_BANK_JOURNAL", i.previousJournalId = t.journalEntryId, i.debitAccountId = _, i.creditAccountId = v, i.eligible = !0, i.changes = [
			"Post one source-owned GL journal on the original financial date and relink this bank record to the new journal.",
			"Debit " + _ + " " + o.amount.toFixed(2) + "; credit " + v + " " + o.amount.toFixed(2) + ".",
			"No payment is sent and no other journal is altered. The missing previous journal identity stays in the saved repair plan."
		], {
			public: i,
			draft: y,
			projectedJournal: te
		});
	}
	return a("Existing business and GL effects must use verified closure, or remain blocked if their evidence conflicts.");
}
function Ds(e) {
	return k.require("audit.read"), Es(_s.parse(e).operationId).public;
}
function Os(e) {
	let t = k.require("accounting.recover"), n = vs.parse(e), r = Es(n.operationId).public;
	if (!r.eligible || !r.action) throw Error("Targeted repair blocked: " + r.blockers.join(" "));
	if (r.evidenceDigest !== n.expectedDigest) throw Error("Repair evidence changed. Refresh the preview.");
	let i = crypto.randomUUID();
	O.recordManualReview(n.operationId, n.reference, t.userId, n.summary + " · Proposed " + r.action + " · " + i);
	let a = Es(n.operationId).public;
	if (!a.eligible || a.action !== r.action) throw Error("Repair conditions changed during proposal.");
	return O.attachRepairProposal(n.operationId, {
		id: i,
		action: r.action,
		evidenceDigest: a.evidenceDigest,
		planJson: JSON.stringify(a),
		reviewer: t.userId,
		reference: n.reference,
		summary: n.summary,
		proposedAt: (/* @__PURE__ */ new Date()).toISOString(),
		status: "PROPOSED"
	});
}
function ks(e) {
	let t = k.require("accounting.recover"), r = ys.parse(e), i = O.list().find((e) => e.operationId === r.operationId), a = i?.repairProposal;
	if (!i || !a || a.id !== r.proposalId || a.evidenceDigest !== r.expectedDigest) throw Error("Repair proposal changed. Refresh the preview.");
	if (a.status === "EXECUTED") {
		if (a.approver !== t.userId || a.approvalReference !== r.approvalReference) throw Error("Repair was already executed with a different approval.");
		return structuredClone(i);
	}
	if (i.state !== "MANUAL_REVIEW" || a.reviewer === t.userId || i.reviewHistory?.some((e) => e.operator === t.userId)) throw Error("Repair approval requires a different authorized operator.");
	if (i.reviewHistory?.some((e) => e.reference === r.approvalReference)) throw Error("Approval reference must differ from review evidence.");
	let o = Es(r.operationId), s = o.public;
	if (!s.eligible || s.action !== a.action || s.evidenceDigest !== a.evidenceDigest) throw Error("Repair evidence changed or is no longer eligible. Refresh and propose again.");
	let c = () => {
		let e = s.existingJournalId;
		if (s.action === "RESTORE_BANK_RECORD") cs(o.record);
		else if (s.action === "RESTORE_BANK_JOURNAL_LINK") ls(i.resultId, s.previousJournalId, s.existingJournalId);
		else if (s.action === "REVERSE_BANK_DUPLICATE") k.require("banking.write"), k.require("accounting.post"), e = Rn(s.duplicateJournalId, s.existingJournalId, i.operationId, "Approved duplicate correction " + a.id + "; " + r.approvalReference).id;
		else if (s.action === "RESTORE_BANK_JOURNAL") {
			k.require("banking.write"), k.require("accounting.post");
			let t = F.post(o.draft);
			e = t.id, ls(i.resultId, s.previousJournalId, t.id);
		}
		let c = us();
		if (c.length) throw Error("Post-repair consistency checks failed: " + c.map((e) => e.code).join(", "));
		if (s.action !== "CANCEL_NO_EFFECT") {
			let e = fs(r.operationId);
			if (e.length) throw Error("Post-repair source proof failed: " + e.join(" "));
		} else if (Es(r.operationId).public.action !== "CANCEL_NO_EFFECT") throw Error("No-effect evidence changed before cancellation.");
		return O.finishRepair(r.operationId, a.id, t.userId, r.approvalReference, Ss(n()), e);
	};
	return s.action === "CANCEL_NO_EFFECT" ? c() : D.transaction(c);
}
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var As = /* @__PURE__ */ Te(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, _ = Object.assign, v = {};
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, y.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function ee() {}
	ee.prototype = y.prototype;
	function te(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var ne = te.prototype = new ee();
	ne.constructor = te, _(ne, y.prototype), ne.isPureReactComponent = !0;
	var re = Array.isArray;
	function ie() {}
	var b = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ae = Object.prototype.hasOwnProperty;
	function x(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function oe(e, t) {
		return x(e.type, t, e.props);
	}
	function se(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function ce(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var le = /\/+/g;
	function ue(e, t) {
		return typeof e == "object" && e && e.key != null ? ce("" + e.key) : t.toString(36);
	}
	function S(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(ie, ie) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function de(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, de(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + ue(e, 0) : a, re(o) ? (i = "", c != null && (i = c.replace(le, "$&/") + "/"), de(o, r, i, "", function(e) {
			return e;
		})) : o != null && (se(o) && (o = oe(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(le, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (re(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + ue(a, u), c += de(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + ue(a, u++), c += de(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return de(S(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function fe(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return de(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function pe(e) {
		if (e._status === -1) {
			var t = e._result, n = t();
			n.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t, n.status === void 0 && (n.status = "fulfilled", n.value = t));
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t, n.status === void 0 && (n.status = "rejected", n.reason = t));
			}), e._status === -1 && (e._status = 0, e._result = n);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var me = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	};
	function C(e) {
		var t = b.T, n = {};
		n.types = t === null ? null : t.types, b.T = n;
		try {
			var r = e(), i = b.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(ie, me);
		} catch (e) {
			me(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), b.T = t;
		}
	}
	function w(e) {
		var t = b.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else C(w.bind(null, e));
	}
	var he = {
		map: fe,
		forEach: function(e, t, n) {
			fe(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return fe(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return fe(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!se(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = he, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = te, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = b, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return b.H.useMemoCache(e);
		}
	}, e.addTransitionType = w, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ae.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return x(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ae.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return x(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = se, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: pe
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = C, e.unstable_useCacheRefresh = function() {
		return b.H.useCacheRefresh();
	}, e.use = function(e) {
		return b.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return b.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return b.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return b.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return b.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return b.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return b.H.useEffectEvent(e);
	}, e.useId = function() {
		return b.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return b.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return b.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return b.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return b.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return b.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return b.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return b.H.useRef(e);
	}, e.useState = function(e) {
		return b.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return b.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return b.H.useTransition();
	}, e.version = "19.3.0";
})), js = /* @__PURE__ */ Te(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = Te && e[Te] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			Ee[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), Ee[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = ke, this.updater = n || De;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = ke, this.updater = n || De;
		}
		function c() {}
		function l(e) {
			return "" + e;
		}
		function u(e) {
			try {
				l(e);
				var t = !1;
			} catch {
				t = !0;
			}
			if (t) {
				t = console;
				var n = t.error, r = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
				return n.call(t, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", r), l(e);
			}
		}
		function d(e) {
			if (e == null) return null;
			if (typeof e == "function") return e.$$typeof === Me ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case w: return "Fragment";
				case ge: return "Profiler";
				case he: return "StrictMode";
				case T: return "Suspense";
				case be: return "SuspenseList";
				case Ce: return "Activity";
				case we: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case C: return "Portal";
				case ve: return e.displayName || "Context";
				case _e: return (e._context.displayName || "Context") + ".Consumer";
				case ye:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case xe: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case Se:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === w) return "<>";
			if (typeof e == "object" && e && e.$$typeof === Se) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = E.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (Ne.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function g(e, t) {
			function n() {
				Fe || (Fe = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function _() {
			var e = d(this.type);
			return Le[e] || (Le[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function v(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: me,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: _
			}), e._store = {}, Object.defineProperty(e._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			}), Object.defineProperty(e, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			}), Object.defineProperty(e, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: i
			}), Object.defineProperty(e, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: a
			}), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
		}
		function y(e, t) {
			return t = v(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function ee(e) {
			te(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === Se && (e._payload.status === "fulfilled" ? te(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function te(e) {
			return typeof e == "object" && !!e && e.$$typeof === me;
		}
		function ne(e) {
			var t = {
				"=": "=0",
				":": "=2"
			};
			return "$" + e.replace(/[=:]/g, function(e) {
				return t[e];
			});
		}
		function re(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), ne("" + e.key)) : t.toString(36);
		}
		function ie(e) {
			switch (e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
				default: switch (typeof e.status == "string" ? e.then(c, c) : (e.status = "pending", e.then(function(t) {
					e.status === "pending" && (e.status = "fulfilled", e.value = t);
				}, function(t) {
					e.status === "pending" && (e.status = "rejected", e.reason = t);
				})), e.status) {
					case "fulfilled": return e.value;
					case "rejected": throw e.reason;
				}
			}
			throw e;
		}
		function b(e, t, n, i, a) {
			var o = typeof e;
			(o === "undefined" || o === "boolean") && (e = null);
			var s = !1;
			if (e === null) s = !0;
			else switch (o) {
				case "bigint":
				case "string":
				case "number":
					s = !0;
					break;
				case "object": switch (e.$$typeof) {
					case me:
					case C:
						s = !0;
						break;
					case Se: return s = e._init, b(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + re(s, 0) : i;
				return je(a) ? (n = "", c != null && (n = c.replace(Ve, "$&/") + "/"), b(a, t, n, "", function(e) {
					return e;
				})) : a != null && (te(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = y(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(Ve, "$&/") + "/") + c), i !== "" && s != null && te(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", je(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + re(i, l), s += b(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (Be || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Be = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + re(i, l++), s += b(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return b(ie(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function ae(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return b(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function x(e) {
			if (e._status === -1) {
				var t = null, n = null, r = e._ioInfo;
				r != null && (r.start = r.end = performance.now(), r.value = new Promise(function(e, r) {
					t = e, n = r;
				})), r = e._result;
				var i = r();
				if (i.then(function(n) {
					if (e._status === 0 || e._status === -1) {
						e._status = 1, e._result = n;
						var r = e._ioInfo;
						if (r != null) {
							r.end = performance.now();
							var a = n?.default;
							t(a), r.value.status = "fulfilled", r.value.value = a;
						}
						i.status === void 0 && (i.status = "fulfilled", i.value = n);
					}
				}, function(t) {
					if (e._status === 0 || e._status === -1) {
						e._status = 2, e._result = t;
						var r = e._ioInfo;
						r != null && (r.end = performance.now(), r.value.then(c, c), n(t), r.value.status = "rejected", r.value.reason = t), i.status === void 0 && (i.status = "rejected", i.reason = t);
					}
				}), r = e._ioInfo, r != null) {
					var a = i.displayName;
					typeof a == "string" && (r.name = a);
				}
				e._status === -1 && (e._status = 0, e._result = i);
			}
			if (e._status === 1) return r = e._result, r === void 0 && console.error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", r), "default" in r || console.error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", r), r.default;
			throw e._result;
		}
		function oe() {
			var e = E.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function se() {
			E.asyncTransitions--;
		}
		function ce(e) {
			var t = E.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), E.T = n;
			try {
				var r = e(), i = E.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (E.asyncTransitions++, r.then(se, se), r.then(c, He));
			} catch (e) {
				He(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), E.T = t;
			}
		}
		function le(e) {
			var t = E.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else E.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), ce(le.bind(null, e));
		}
		function ue(e) {
			if (We === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				We = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				We = function(e) {
					!1 === Ue && (Ue = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return We(e);
		}
		function S(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function de(e, t) {
			t !== D - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), D = t;
		}
		function fe(e, t, n) {
			var r = E.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					pe(r), ue(function() {
						return fe(e, t, n);
					});
					return;
				} catch (e) {
					E.thrownErrors.push(e);
				}
				else E.actQueue = null;
			}
			0 < E.thrownErrors.length ? (r = S(E.thrownErrors), E.thrownErrors.length = 0, n(r)) : t(e);
		}
		function pe(e) {
			if (!Ke) {
				Ke = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							E.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (E.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), E.thrownErrors.push(n);
				} finally {
					Ke = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var me = Symbol.for("react.transitional.element"), C = Symbol.for("react.portal"), w = Symbol.for("react.fragment"), he = Symbol.for("react.strict_mode"), ge = Symbol.for("react.profiler"), _e = Symbol.for("react.consumer"), ve = Symbol.for("react.context"), ye = Symbol.for("react.forward_ref"), T = Symbol.for("react.suspense"), be = Symbol.for("react.suspense_list"), xe = Symbol.for("react.memo"), Se = Symbol.for("react.lazy"), Ce = Symbol.for("react.activity"), we = Symbol.for("react.view_transition"), Te = Symbol.iterator, Ee = {}, De = {
			isMounted: function() {
				return !1;
			},
			enqueueForceUpdate: function(e) {
				i(e, "forceUpdate");
			},
			enqueueReplaceState: function(e) {
				i(e, "replaceState");
			},
			enqueueSetState: function(e) {
				i(e, "setState");
			}
		}, Oe = Object.assign, ke = {};
		Object.freeze(ke), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var Ae = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (Je in Ae) Ae.hasOwnProperty(Je) && n(Je, Ae[Je]);
		o.prototype = a.prototype, Ae = s.prototype = new o(), Ae.constructor = s, Oe(Ae, a.prototype), Ae.isPureReactComponent = !0;
		var je = Array.isArray, Me = Symbol.for("react.client.reference"), E = {
			H: null,
			A: null,
			T: null,
			S: null,
			actQueue: null,
			asyncTransitions: 0,
			isBatchingLegacy: !1,
			didScheduleLegacyUpdate: !1,
			didUsePromise: !1,
			thrownErrors: [],
			getCurrentStack: null,
			recentlyCreatedOwnerStacks: 0
		}, Ne = Object.prototype.hasOwnProperty, Pe = console.createTask ? console.createTask : function() {
			return null;
		};
		Ae = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Fe, Ie, Le = {}, Re = Ae.react_stack_bottom_frame.bind(Ae, m)(), ze = Pe(f(m)), Be = !1, Ve = /\/+/g, He = typeof reportError == "function" ? reportError : function(e) {
			if (typeof window == "object" && typeof window.ErrorEvent == "function") {
				var t = new window.ErrorEvent("error", {
					bubbles: !0,
					cancelable: !0,
					message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
					error: e
				});
				if (!window.dispatchEvent(t)) return;
			} else if (typeof process == "object" && typeof process.emit == "function") {
				process.emit("uncaughtException", e);
				return;
			}
			console.error(e);
		}, Ue = !1, We = null, D = 0, Ge = !1, Ke = !1, qe = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : ue;
		Ae = Object.freeze({
			__proto__: null,
			c: function(e) {
				return oe().useMemoCache(e);
			}
		});
		var Je = {
			map: ae,
			forEach: function(e, t, n) {
				ae(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return ae(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return ae(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!te(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = Ce, e.Children = Je, e.Component = a, e.Fragment = w, e.Profiler = ge, e.PureComponent = s, e.StrictMode = he, e.Suspense = T, e.ViewTransition = we, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = E, e.__COMPILER_RUNTIME = Ae, e.act = function(e) {
			var t = E.actQueue, n = D;
			D++;
			var r = E.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				E.thrownErrors.push(e);
			}
			if (0 < E.thrownErrors.length) throw de(t, n), e = S(E.thrownErrors), E.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return qe(function() {
					i || Ge || (Ge = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (de(t, n), n === 0) {
							try {
								pe(r), ue(function() {
									return fe(i, e, a);
								});
							} catch (e) {
								E.thrownErrors.push(e);
							}
							if (0 < E.thrownErrors.length) {
								var o = S(E.thrownErrors);
								E.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						de(t, n), 0 < E.thrownErrors.length ? (e = S(E.thrownErrors), E.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (de(t, n), n === 0 && (pe(r), r.length !== 0 && qe(function() {
				i || Ge || (Ge = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), E.actQueue = null), 0 < E.thrownErrors.length) throw e = S(E.thrownErrors), E.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (E.actQueue = r, ue(function() {
					return fe(s, e, t);
				})) : e(s);
			} };
		}, e.addTransitionType = le, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = E.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = Oe({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (Ne.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !Ne.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = v(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) ee(arguments[i]);
			return r;
		}, e.createContext = function(e) {
			return e = {
				$$typeof: ve,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: _e,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) ee(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in Ie || !("__self" in t) || "key" in t || (Ie = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) Ne.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && g(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > E.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Re, v(e, a, r, p(), o, i ? Pe(f(e)) : ze);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === xe ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: ye,
				render: e
			}, n;
			return Object.defineProperty(t, "displayName", {
				enumerable: !1,
				configurable: !0,
				get: function() {
					return n;
				},
				set: function(t) {
					n = t, e.name || e.displayName || (Object.defineProperty(e, "name", { value: t }), e.displayName = t);
				}
			}), t;
		}, e.isValidElement = te, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: Se,
				_payload: e,
				_init: x
			}, n = {
				name: "lazy",
				start: -1,
				end: -1,
				value: null,
				owner: null,
				debugStack: Error("react-stack-top-frame"),
				debugTask: console.createTask ? console.createTask("lazy()") : null
			};
			return e._ioInfo = n, t._debugInfo = [{ awaited: n }], t;
		}, e.memo = function(e, t) {
			e ?? console.error("memo: The first argument must be a component. Instead received: %s", e === null ? "null" : typeof e), t = {
				$$typeof: xe,
				type: e,
				compare: t === void 0 ? null : t
			};
			var n;
			return Object.defineProperty(t, "displayName", {
				enumerable: !1,
				configurable: !0,
				get: function() {
					return n;
				},
				set: function(t) {
					n = t, e.name || e.displayName || (Object.defineProperty(e, "name", { value: t }), e.displayName = t);
				}
			}), t;
		}, e.startTransition = ce, e.unstable_useCacheRefresh = function() {
			return oe().useCacheRefresh();
		}, e.use = function(e) {
			return oe().use(e);
		}, e.useActionState = function(e, t, n) {
			return oe().useActionState(e, t, n);
		}, e.useCallback = function(e, t) {
			return oe().useCallback(e, t);
		}, e.useContext = function(e) {
			var t = oe();
			return e.$$typeof === _e && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
		}, e.useDebugValue = function(e, t) {
			return oe().useDebugValue(e, t);
		}, e.useDeferredValue = function(e, t) {
			return oe().useDeferredValue(e, t);
		}, e.useEffect = function(e, t) {
			return e ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"), oe().useEffect(e, t);
		}, e.useEffectEvent = function(e) {
			return oe().useEffectEvent(e);
		}, e.useId = function() {
			return oe().useId();
		}, e.useImperativeHandle = function(e, t, n) {
			return oe().useImperativeHandle(e, t, n);
		}, e.useInsertionEffect = function(e, t) {
			return e ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"), oe().useInsertionEffect(e, t);
		}, e.useLayoutEffect = function(e, t) {
			return e ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"), oe().useLayoutEffect(e, t);
		}, e.useMemo = function(e, t) {
			return oe().useMemo(e, t);
		}, e.useOptimistic = function(e, t) {
			return oe().useOptimistic(e, t);
		}, e.useReducer = function(e, t, n) {
			return oe().useReducer(e, t, n);
		}, e.useRef = function(e) {
			return oe().useRef(e);
		}, e.useState = function(e) {
			return oe().useState(e);
		}, e.useSyncExternalStore = function(e, t, n) {
			return oe().useSyncExternalStore(e, t, n);
		}, e.useTransition = function() {
			return oe().useTransition();
		}, e.version = "19.3.0", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
}));
(/* @__PURE__ */ Te(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? As() : js();
})))();
var Ms = y().min(1).max(200), Ns = y().max(2e4), Ps = c().finite().nonnegative(), Fs = ["PURCHASE_ORDER", "REMITTANCE"], Is = w({
	operationId: Ms,
	kind: g(Fs),
	sourceId: Ms,
	expectedRevision: y().min(1).max(5e5),
	templateId: Ms.optional()
}).strict(), Ls = w({
	id: Ms,
	description: Ns,
	reference: Ns,
	quantity: c().finite().positive(),
	unit: Ns,
	unitPrice: Ps,
	net: Ps,
	tax: Ps,
	total: Ps,
	taxCode: Ns.optional(),
	taxRate: c().finite().min(0).max(1).optional()
}).strict(), Rs = w({
	id: Ms,
	revision: Ms,
	name: Ns,
	subject: Ns,
	body: Ns,
	footer: Ns,
	paper: g(["A4", "Letter"])
}).strict(), zs = w({
	id: Ms,
	operationId: Ms,
	requestFingerprint: y().max(1e6),
	kind: g(Fs),
	sourceId: Ms,
	sourceRevision: y().min(1).max(5e5),
	preparedAt: Ms,
	preparedBy: Ms,
	documentNumber: Ms,
	status: Ms,
	date: Ms,
	expectedDeliveryDate: Ns.optional(),
	reference: Ns.optional(),
	notes: Ns.optional(),
	supplierId: Ms,
	supplierName: Ns,
	supplierCode: Ns,
	supplierEmail: Ns.optional(),
	supplierContact: Ns.optional(),
	supplierAddress: Ns,
	supplierMetadataAt: Ms,
	issuer: w({
		name: Ns,
		identifier: Ns,
		address: Ns,
		email: Ns,
		currency: Ms
	}).strict(),
	method: Ns.optional(),
	noncash: h(),
	lines: a(Ls).min(1),
	subtotal: Ps,
	tax: Ps,
	total: Ps,
	template: Rs,
	subject: Ns,
	body: Ns
}).strict(), Bs = (e) => e === "PURCHASE_ORDER" ? "Purchase order" : "Remittance";
function Vs(e, t) {
	let n = e === "PURCHASE_ORDER" ? Ki.getById(t) : Co.getById(t);
	if (!n) throw Error("Purchase output source was not found.");
	return n;
}
function Hs(e, t) {
	let n = Vs(e, t), r = Ni.getById(n.supplierId);
	if (!r) throw Error("Source supplier was not found.");
	return JSON.stringify([n, r]);
}
var Us = (e, t) => l(e, "accounting.read") || t === "PURCHASE_ORDER" && l(e, "purchases.write"), Ws = [], Gs = 0, Ks = /* @__PURE__ */ new Set(), qs = () => {
	Gs++, Ks.forEach((e) => e());
};
function Js() {
	return (C.templates ?? []).filter((e) => e.status === "Active" && ["Purchase order", "Remittance"].includes(e.kind));
}
function Ys(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Object.hasOwn(t, n)) throw Error("Unsupported purchase template token: " + n);
		return t[n];
	});
}
function Xs(e) {
	let t = zs.parse(e), n = Is.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.kind !== t.kind || n.sourceId !== t.sourceId || n.expectedRevision !== t.sourceRevision || (n.templateId ?? "built-in") !== t.template.id || !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Purchase output source metadata mismatch.");
	let [r, i] = JSON.parse(t.sourceRevision);
	if (!r || !i || r.id !== t.sourceId || r.supplierId !== t.supplierId || i.id !== t.supplierId || r.status !== t.status || r.supplierName !== t.supplierName || i.email !== t.supplierEmail || i.updatedAt !== t.supplierMetadataAt) throw Error("Purchase output captured source mismatch.");
	if (t.kind === "PURCHASE_ORDER" ? r.purchaseOrderNumber !== t.documentNumber || r.orderDate !== t.date || r.totals.total !== t.total || JSON.stringify(r.lines.map((e) => [
		e.id,
		e.orderedQuantity,
		e.unitCost,
		e.lineSubtotal,
		e.taxAmount,
		e.lineTotal
	])) !== JSON.stringify(t.lines.map((e) => [
		e.id,
		e.quantity,
		e.unitPrice,
		e.net,
		e.tax,
		e.total
	])) : r.paymentNumber !== t.documentNumber || r.paymentDate !== t.date || r.amount !== t.total || !!r.prepaymentApplicationId !== t.noncash || JSON.stringify(r.allocations.map((e) => [
		e.id,
		e.billNumber,
		e.supplierInvoiceNumber,
		e.amount
	])) !== JSON.stringify(t.lines.map((e) => [
		e.id,
		e.description,
		e.reference,
		e.total
	]))) throw Error("Purchase output differs from its captured source.");
	T(t.date), t.expectedDeliveryDate && T(t.expectedDeliveryDate);
	let a = (e) => Math.round((e + 2 ** -52) * 100);
	for (let e of t.lines) {
		if (a(e.net + e.tax) !== a(e.total) || Math.abs(e.net + e.tax - e.total) > 1e-6) throw Error("Invalid purchase output line total.");
		if (t.kind === "REMITTANCE" && (e.quantity !== 1 || e.tax !== 0 || e.unitPrice !== e.total)) throw Error("Invalid remittance allocation.");
	}
	if (a(t.lines.reduce((e, t) => e + t.net, 0)) !== a(t.subtotal) || a(t.lines.reduce((e, t) => e + t.tax, 0)) !== a(t.tax) || a(t.lines.reduce((e, t) => e + t.total, 0)) !== a(t.total)) throw Error("Invalid purchase output totals.");
	if (t.kind === "PURCHASE_ORDER" && t.noncash) throw Error("Purchase order cannot be a noncash payment.");
	return t;
}
m("preparedPurchaseOutputs", {
	repository: { prepare(e) {
		let t = Is.parse(e), n = k.require("purchases.read");
		if (!Us(n, t.kind) || t.kind === "REMITTANCE" && !l(n, "accounting.post") || t.kind === "PURCHASE_ORDER" && !l(n, "accounting.post") && !l(n, "purchases.write")) throw Error("Permission denied: purchase document preparation.");
		let r = JSON.stringify(t), i = Ws.find((e) => e.operationId === t.operationId);
		if (i) {
			if (i.requestFingerprint !== r) throw Error("Operation ID was used for different output data.");
			return i;
		}
		let a = Vs(t.kind, t.sourceId), o = Ni.getById(a.supplierId);
		if (Hs(t.kind, t.sourceId) !== t.expectedRevision) throw Error("Source or supplier changed. Refresh before preparing output.");
		let s = x(), c = t.templateId ? Js().find((e) => e.id === t.templateId && e.kind === Bs(t.kind)) : void 0;
		if (t.templateId && !c) throw Error("Select an active matching purchase template.");
		let u = t.kind === "PURCHASE_ORDER" ? Ki.getById(t.sourceId) : void 0, d = t.kind === "REMITTANCE" ? Co.getById(t.sourceId) : void 0, f = u ? u.lines.map((e) => ({
			id: e.id,
			description: e.description,
			reference: e.sku,
			quantity: e.orderedQuantity,
			unit: e.unitSymbol,
			unitPrice: e.unitCost,
			net: e.lineSubtotal,
			tax: e.taxAmount,
			total: e.lineTotal,
			taxCode: e.taxCode,
			taxRate: e.taxRate
		})) : d.allocations.map((e) => ({
			id: e.id,
			description: e.billNumber,
			reference: e.supplierInvoiceNumber,
			quantity: 1,
			unit: "allocation",
			unitPrice: e.amount,
			net: e.amount,
			tax: 0,
			total: e.amount
		})), p = u?.totals.total ?? d.amount, m = {
			documentNumber: u?.purchaseOrderNumber ?? d.paymentNumber,
			supplierName: a.supplierName,
			companyName: s.companyName,
			currency: s.currency,
			total: p.toFixed(2),
			documentDate: u?.orderDate ?? d.paymentDate,
			expectedDeliveryDate: u?.expectedDeliveryDate ?? "",
			reference: u?.supplierReference ?? d?.reference ?? ""
		}, h = {
			id: c?.id ?? "built-in",
			revision: c?.revision ?? "1",
			name: c?.name ?? "Standard " + Bs(t.kind),
			subject: c?.subject ?? "{{documentNumber}} · {{companyName}}",
			body: c?.body ?? "Dear {{supplierName}},\nPlease review {{documentNumber}} for {{currency}} {{total}}.",
			footer: c?.footer ?? "",
			paper: c?.paper === "Letter" ? "Letter" : "A4"
		}, g = {
			id: crypto.randomUUID(),
			operationId: t.operationId,
			requestFingerprint: r,
			kind: t.kind,
			sourceId: t.sourceId,
			sourceRevision: t.expectedRevision,
			preparedAt: (/* @__PURE__ */ new Date()).toISOString(),
			preparedBy: n.userId,
			documentNumber: m.documentNumber,
			status: a.status,
			date: m.documentDate,
			expectedDeliveryDate: u?.expectedDeliveryDate,
			reference: m.reference,
			notes: a.notes,
			supplierId: o.id,
			supplierName: a.supplierName,
			supplierCode: a.supplierCode,
			supplierEmail: o.email,
			supplierContact: o.contactName,
			supplierAddress: [
				o.addressLine1,
				o.addressLine2,
				o.suburb,
				o.state,
				o.postcode,
				o.country
			].filter(Boolean).join(", "),
			supplierMetadataAt: o.updatedAt,
			issuer: {
				name: s.companyName,
				identifier: s.identifier ?? "",
				address: s.address ?? "",
				email: s.email ?? "",
				currency: s.currency
			},
			method: d?.method,
			noncash: !!d?.prepaymentApplicationId,
			lines: f,
			subtotal: u?.totals.subtotal ?? p,
			tax: u?.totals.taxAmount ?? 0,
			total: p,
			template: {
				...h,
				footer: Ys(h.footer, m)
			},
			subject: Ys(h.subject, m),
			body: Ys(h.body, m)
		};
		return Xs(g), Ws = [g, ...Ws], qs(), g;
	} },
	read: "purchases.read",
	commands: { prepare: "purchases.read" },
	snapshot: () => ({
		artifacts: Ws,
		templates: Js().map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	restore: (e) => {
		Ws = e.artifacts, e.templates;
	},
	publish: qs,
	view: (e) => ({
		artifacts: Ws.filter((t) => Us(e, t.kind)),
		templates: Js().filter((t) => Us(e, t.kind === "Purchase order" ? "PURCHASE_ORDER" : "REMITTANCE")).map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	validate: (e, t) => {
		let n = w({
			artifacts: a(zs),
			templates: a(w({
				id: Ms,
				name: Ns,
				kind: Ms
			}).strict())
		}).strict().parse(e).artifacts, r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), o = t;
		for (let e of n) {
			if (Xs(e), i.has(e.id) || r.has(e.operationId)) throw Error("Duplicate purchase output.");
			i.add(e.id), r.add(e.operationId);
			let t = (e.kind === "PURCHASE_ORDER" ? o.purchaseOrders.purchaseOrders : o.supplierPayments.supplierPayments).find((t) => t.id === e.sourceId);
			if (!t || t.supplierId !== e.supplierId) throw Error("Invalid purchase output source reference.");
		}
	}
});
//#endregion
//#region src/features/banking/data/statementCorrectionEvidence.ts
var Zs = (e) => Math.round((e + 2 ** -52) * 100) / 100, Qs = (e) => e.lines.length >= 2 && new Set(e.lines.map((e) => e.id)).size === e.lines.length && e.totalDebit > 0 && e.totalDebit === e.totalCredit && e.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0 && Zs(e.debit) === e.debit && Zs(e.credit) === e.credit && !(e.debit && e.credit)) && Zs(e.lines.reduce((e, t) => e + t.debit, 0)) === e.totalDebit && Zs(e.lines.reduce((e, t) => e + t.credit, 0)) === e.totalCredit, $s = (e, t = !1) => JSON.stringify(e.lines.map((e) => [
	e.accountId,
	e.description ?? null,
	t ? e.credit : e.debit,
	t ? e.debit : e.credit
]).sort((e, t) => JSON.stringify(e).localeCompare(JSON.stringify(t))));
function ec(e) {
	let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = [], i = e.filter((e) => e.sourceType === "BANK_STATEMENT" && !e.reversedJournalEntryId && (e.status === "REVERSED" || e.reversalJournalEntryId || e.reversedAt)), a = (e, t, i) => {
		n.add(e.id), t.forEach((e) => n.add(e)), r.push({
			journalId: e.id,
			message: i
		});
	};
	for (let n of i) {
		let r = e.filter((e) => e.id === n.reversalJournalEntryId), i = r[0];
		if (e.filter((e) => e.id === n.id).length !== 1 || r.length !== 1 || n.status !== "REVERSED" || !n.sourceId || !/^.+:\d+$/.test(n.sourceId) || !n.reversalReason?.trim() || !Number.isFinite(Date.parse(n.reversedAt ?? "")) || n.reversedAt !== i.postedAt || i.status !== "POSTED" || i.sourceType !== "BANK_STATEMENT" || i.sourceId !== void 0 || i.reversedJournalEntryId !== n.id || e.filter((e) => e.reversalJournalEntryId === i.id).length !== 1 || i.reversalJournalEntryId || i.reversedAt || n.reference !== i.reference || e.filter((e) => e.reversedJournalEntryId === n.id).length !== 1 || !Qs(n) || !Qs(i) || n.totalDebit !== i.totalCredit || n.totalCredit !== i.totalDebit || $s(n, !0) !== $s(i)) {
			a(n, [...n.reversalJournalEntryId ? [n.reversalJournalEntryId] : [], ...e.filter((e) => e.reversedJournalEntryId === n.id).map((e) => e.id)], "Bank categorisation reversal has incomplete or inconsistent owner, lifecycle or amount evidence.");
			continue;
		}
		try {
			T(n.journalDate), T(i.journalDate);
		} catch {
			a(n, [i.id], "Bank categorisation reversal has an invalid financial date.");
			continue;
		}
		if (n.journalDate !== i.journalDate) {
			a(n, [i.id], "Bank categorisation reversal crosses financial dates; review a validated backup or a separate approved accounting correction.");
			continue;
		}
		t.add(n.id), t.add(i.id);
	}
	for (let t of e.filter((e) => e.sourceType === "BANK_STATEMENT" && e.reversedJournalEntryId)) i.some((e) => e.id === t.reversedJournalEntryId) || a(t, [t.reversedJournalEntryId], "Bank categorisation offset has no verified original owner.");
	for (let e of n) t.delete(e);
	return {
		verifiedIds: t,
		reviewIds: n,
		issues: r
	};
}
//#endregion
//#region src/features/banking/data/bankRegisterService.ts
function tc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function nc(e, t) {
	T(e, t);
}
function rc(e, t, n) {
	nc(e.openingBalanceDate, "Opening balance date"), nc(n, "As-at date");
	let r = ne(t), i = _e(t), a = ec(t), o = new Set([
		...r.originals,
		...r.offsets,
		...a.verifiedIds
	].filter((e) => !i.has(e))), s = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), c = tc(e.openingBalance), l = 0, u = 0, d = s.map(({ entry: t, line: n }) => {
		let r = tc(n.debit), s = tc(n.credit);
		return l = tc(l + r), u = tc(u + s), c = tc(c + r - s), {
			id: `${t.id}:${n.id}`,
			bankAccountId: e.id,
			correctionOnly: o.has(t.id) || void 0,
			correctionIssue: a.reviewIds.has(t.id) ? "Bank categorisation correction requires review" : i.has(t.id) ? "Bank journal reversal requires review" : void 0,
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
			runningBalance: c
		};
	});
	return {
		bankAccountId: e.id,
		asOfDate: n,
		openingBalance: tc(e.openingBalance),
		moneyIn: l,
		moneyOut: u,
		closingBalance: c,
		transactionCount: d.length,
		transactions: d
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function ic(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ac(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) if (!t.correctionOnly) {
		if (r.has(t.id)) {
			i = ic(i + t.moneyIn), a = ic(a + t.moneyOut);
			continue;
		}
		o = ic(o + t.moneyIn), s = ic(s + t.moneyOut);
	}
	let c = ic(ic(t) + o - s), l = ic(e.closingBalance), u = ic(c - l);
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
//#region src/features/banking/data/reconciliationChainEvidence.ts
var oc = (e) => new Set(e).size === e.length, sc = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function cc(e, t, n, r) {
	return e.some((e) => e.bankAccountId === t && e.status === "COMPLETED" && e.statementDate < r && e.clearedTransactionIds.includes(n));
}
function lc(e) {
	let { bank: t, journals: n, reconciliations: r, throughDate: i } = e, a = [];
	if (T(i, "Reconciliation proof date"), T(t.openingBalanceDate, "Bank opening date"), !oc(r.map((e) => e.id)) || !oc(n.map((e) => e.id)) || !oc(n.flatMap((e) => e.lines.map((t) => e.id + ":" + t.id)))) return ["Duplicate reconciliation or ledger row identity."];
	for (let e of r.filter((e) => e.bankAccountId === t.id)) try {
		T(e.statementDate);
	} catch {
		return ["Reconciliation statement date is invalid."];
	}
	let o = _e(n);
	n.some((e) => o.has(e.id) && e.journalDate >= t.openingBalanceDate && e.journalDate <= i && e.lines.some((e) => e.accountId === t.glAccountId)) && a.push("Bank journal reversal has incomplete or inconsistent owner, lifecycle or amount evidence.");
	let s = ec(n);
	for (let e of s.issues) {
		let r = n.find((t) => t.id === e.journalId);
		r && r.journalDate >= t.openingBalanceDate && r.journalDate <= i && r.lines.some((e) => e.accountId === t.glAccountId) && a.push(e.message);
	}
	let c = r.filter((e) => e.bankAccountId === t.id && e.statementDate <= i).sort((e, t) => e.statementDate.localeCompare(t.statementDate)), l = /* @__PURE__ */ new Set(), u = new Map(n.map((e) => [e.id, e])), d = "";
	for (let e of c) {
		try {
			T(e.statementDate, "Statement date");
		} catch {
			return ["Reconciliation statement date is invalid."];
		}
		if (e.status !== "COMPLETED" || e.statementDate <= d || e.statementDate < t.openingBalanceDate || !Number.isFinite(e.statementBalance) || sc(e.statementBalance) !== e.statementBalance || !oc(e.clearedTransactionIds)) return ["Reconciliation sequence, status, balance or cleared identities are invalid."];
		let r = rc(t, n, e.statementDate), i = new Map(r.transactions.map((e) => [e.id, e])), o = /* @__PURE__ */ new Set(), c = new Set(e.clearedTransactionIds);
		for (let e of n.filter((e) => s.verifiedIds.has(e.id) && e.reversalJournalEntryId)) {
			let t = r.transactions.filter((t) => t.journalEntryId === e.id || t.journalEntryId === e.reversalJournalEntryId);
			t.length && t.every((e) => c.has(e.id)) && t.forEach((e) => o.add(e.id));
		}
		if (e.clearedTransactionIds.some((t) => {
			let r = i.get(t);
			return l.has(t) || !r || r.correctionIssue || !o.has(t) && (r.correctionOnly || !ie(u.get(r.journalEntryId), n, e.statementDate));
		})) return ["Cleared rows are missing, reversed, internal offsets or duplicated across statements."];
		e.clearedTransactionIds.forEach((e) => l.add(e));
		let f = ac(r, e.statementBalance, [...l]), p = (t) => t.reconciled && [
			"bookBalance",
			"outstandingDeposits",
			"outstandingPayments",
			"adjustedStatementBalance",
			"difference"
		].every((n) => Number.isFinite(e[n]) && e[n] === t[n]), m = {
			...r,
			transactions: r.transactions.map((e) => s.verifiedIds.has(e.journalEntryId) ? {
				...e,
				correctionOnly: void 0
			} : e)
		};
		!p(f) && !p(ac(m, e.statementBalance, [...l])) && a.push("Saved reconciliation totals do not match the current dated bank ledger: " + e.reconciliationNumber), d = e.statementDate;
	}
	if (!c.length) return a;
	let f = c.at(-1).statementDate, p = rc(t, n, f), m = new Map(p.transactions.map((e) => [e.id, e])), h = /* @__PURE__ */ new Set();
	for (let i of (e.statements ?? []).filter((e) => e.bankAccountId === t.id && e.date <= f)) i.status === "UNMATCHED" && a.push("Imported statement contains an unresolved line."), (i.status === "MATCHED" || i.status === "POSTED") && (i.ledgerIds.some((e) => cc(r, t.id, e, i.date)) && a.push("Imported statement match reuses a ledger row already cleared in an earlier statement."), (!i.ledgerIds.length || !oc(i.ledgerIds) || i.ledgerIds.some((e) => {
		let t = m.get(e);
		return !l.has(e) || !t || t.correctionOnly || t.correctionIssue || !ie(u.get(t.journalEntryId), n, i.date) || h.has(e);
	}) || sc(i.ledgerIds.reduce((e, t) => e + (m.get(t)?.moneyIn ?? 0) - (m.get(t)?.moneyOut ?? 0), 0)) !== i.amount) && a.push("Imported statement match, amount or clearing is inconsistent."), i.ledgerIds.forEach((e) => h.add(e)));
	return a;
}
//#endregion
//#region src/features/banking/data/bankReconciliationRepository.ts
var uc = /* @__PURE__ */ new Set(), dc = D.read().reconciliations;
D.onRollback(() => {
	dc = D.read().reconciliations;
});
function fc() {
	D.update("reconciliations", dc), uc.forEach((e) => D.notify(e));
}
function pc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function mc(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function hc() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function gc(e) {
	return `BREC-${e.slice(0, 4)}-${String(dc.length + 1).padStart(4, "0")}`;
}
function _c(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of dc) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var vc = {
	subscribe(e) {
		return uc.add(e), () => {
			uc.delete(e);
		};
	},
	getSnapshot() {
		return dc;
	},
	getAll() {
		return dc;
	},
	getByBankAccount(e) {
		return dc.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return _c(e);
	},
	complete(e, t) {
		if (mc(e.statementDate), T(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let r = L.requireById(e.bankAccountId);
		if (!r.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < r.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let i = F.getAll(), a = new Map(i.map((e) => [e.id, e])), o = lc({
			bank: r,
			journals: i,
			reconciliations: dc,
			throughDate: e.statementDate
		});
		if (o.length) throw Error("Existing bank reconciliation evidence is invalid: " + o.join(" "));
		let s = this.getLatestByBankAccount(r.id);
		if (s && e.statementDate <= s.statementDate) throw Error(`Statement date must be after the last reconciled date ${s.statementDate}.`);
		let c = rc(r, F.getAll(), e.statementDate), l = new Set(c.transactions.filter((t) => !t.correctionOnly && !t.correctionIssue && ie(a.get(t.journalEntryId), i, e.statementDate)).map((e) => e.id)), u = _c(r.id), d = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !u.has(e));
		for (let e of d) if (!l.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let f = /* @__PURE__ */ new Set([...u, ...d]), p = n().bankStatements?.lines.filter((t) => t.bankAccountId === r.id && t.date <= e.statementDate) ?? [];
		if (p.some((e) => e.status === "UNMATCHED")) throw Error("Process every imported statement line before completing reconciliation.");
		let m = new Map(c.transactions.map((e) => [e.id, e]));
		for (let e of p.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (e.ledgerIds.some((t) => cc(dc, r.id, t, e.date))) throw Error("Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.");
			if (e.ledgerIds.some((t) => !m.has(t) || m.get(t)?.correctionOnly || m.get(t)?.correctionIssue || !ie(a.get(m.get(t).journalEntryId), i, e.date))) throw Error("Repair stale imported statement matches before completing reconciliation.");
			if (e.ledgerIds.some((e) => !f.has(e))) throw Error("Include every processed imported statement entry in reconciliation.");
		}
		let h = ac(c, pc(e.statementBalance), Array.from(f));
		if (!h.reconciled) throw Error(`Bank reconciliation is out by ${h.difference.toFixed(2)}.`);
		let g = hc();
		if (t) {
			if (O.begin(t, "BANK_RECONCILIATION", JSON.stringify(e)).status !== "started") throw Error("Bank reconciliation requires manual review before retry.");
			O.bindResult(t, g);
		}
		let _ = {
			id: g,
			reconciliationNumber: gc(e.statementDate),
			bankAccountId: r.id,
			statementDate: e.statementDate,
			statementBalance: pc(e.statementBalance),
			bookBalance: h.bookBalance,
			outstandingDeposits: h.outstandingDeposits,
			outstandingPayments: h.outstandingPayments,
			adjustedStatementBalance: h.adjustedStatementBalance,
			difference: h.difference,
			clearedTransactionIds: d,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return dc = [_, ...dc], fc(), _;
	}
}, yc = vc.complete;
vc.complete = function(e, t) {
	let n = t?.trim() ?? `bankrec-operation-${hc()}`;
	if (t !== void 0 && !n) throw Error("Operation ID cannot be empty.");
	if (n) {
		let t = O.list().find((e) => e.operationId === n);
		if (t) {
			if (t.kind !== "BANK_RECONCILIATION" || t.fingerprint !== JSON.stringify(e)) throw Error("Operation ID reused with different business data.");
			let n = dc.find((e) => e.id === t.resultId);
			if (t.state === "COMPLETED" && n && dc.filter((e) => e.id === n.id).length === 1 && n.status === "COMPLETED" && n.bankAccountId === e.bankAccountId && n.statementDate === e.statementDate && n.statementBalance === pc(e.statementBalance)) return n;
			throw Error("Bank reconciliation requires manual review before retry.");
		}
	}
	M();
	try {
		let t = D.transaction(() => yc.call(vc, e, n));
		return n && O.complete(n, t.id), t;
	} catch (e) {
		if (n) {
			let e = O.list().find((e) => e.operationId === n);
			if (e && e.state !== "COMPLETED") try {
				O.flagForReview(n, "Reconciliation outcome uncertain; inspect the saved statement and cleared ledger rows before retry.");
			} catch {}
		}
		throw e;
	}
}, m("bankReconciliations", {
	repository: vc,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: dc }),
	restore: (e) => {
		dc = e.reconciliations;
	},
	publish: () => uc.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/reconciliationRecoveryEvidence.ts
function bc(e) {
	let t = O.list(), r = t.find((t) => t.operationId === e), i = [];
	if (!r || r.kind !== "BANK_RECONCILIATION" || r.state !== "MANUAL_REVIEW") return ["Operation is not an unresolved bank reconciliation review."];
	if (!r.resultId) return ["Operation has no durable bound result; cannot infer clearing."];
	r.reviewHistory?.length || i.push("Operator reconciliation evidence is missing.");
	let a = vc.getAll(), o = a.filter((e) => e.id === r.resultId);
	if (o.length !== 1) return [...i, "Completed reconciliation result is missing or duplicated."];
	let s = o[0], c = L.getById(s.bankAccountId), l = F.getAll();
	if (!c) return [...i, "Reconciliation bank account is missing."];
	let u = (e) => JSON.stringify([...e].sort()), d = (e) => Math.round((e + 2 ** -52) * 100) / 100, f = a.filter((e) => e.bankAccountId === c.id && e.statementDate <= s.statementDate), p = n().bankStatements?.lines ?? [];
	try {
		i.push(...lc({
			bank: c,
			journals: l,
			reconciliations: a,
			throughDate: s.statementDate,
			statements: p
		}));
	} catch {
		i.push("Reconciliation chain evidence is invalid.");
	}
	try {
		let e = JSON.parse(r.fingerprint), t = new Set(f.filter((e) => e.id !== s.id).flatMap((e) => e.clearedTransactionIds));
		(!e || e.bankAccountId !== s.bankAccountId || e.statementDate !== s.statementDate || !Number.isFinite(e.statementBalance) || d(e.statementBalance) !== s.statementBalance || !Array.isArray(e.clearedTransactionIds) || e.clearedTransactionIds.some((e) => typeof e != "string") || u([...new Set(e.clearedTransactionIds)].filter((e) => !t.has(e))) !== u(s.clearedTransactionIds)) && i.push("Saved reconciliation intent does not match the bound clearing result.");
	} catch {
		i.push("Saved reconciliation intent is unreadable.");
	}
	return t.some((e) => e.operationId !== r.operationId && e.kind === r.kind && e.resultId === r.resultId) && i.push("Another operation claims this reconciliation result."), i;
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function xc(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= wc(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: Tc(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => Sc(e, r)), a = Tc(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && Cc(t, r)), s = Tc(o.reduce((e, t) => e + t.amount, 0)), c = Tc(e.totals.total), l = Tc(Math.max(0, c - a - s));
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
function Sc(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < wc(e.reversedAt) : !1;
}
function Cc(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < wc(e.reversedAt) : !1;
}
function wc(e) {
	return S(e);
}
function Tc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function Ec(e, t, n) {
	let r = kc(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= Oc(e.voidedAt)) return Dc(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && Cc(t, n)), a = kc(i.reduce((e, t) => e + t.amount, 0)), o = kc(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function Dc(e, t, n) {
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
function Oc(e) {
	return S(e);
}
function kc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function Ac(e, t, n = [], r = [], i = [], a = Nc()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = xc(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = jc(e.dueDate, a);
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
		current: Pc(s.current),
		days1To30: Pc(s.days1To30),
		days31To60: Pc(s.days31To60),
		days61To90: Pc(s.days61To90),
		days90Plus: Pc(s.days90Plus)
	}, p = Pc(c), m = Pc(l), h = Pc(i.reduce((t, n) => n.customerId === e.id ? t + Ec(n, r, a).amountAvailable : t, 0)), g = Pc(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: g,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: Pc(Math.max(0, e.creditLimit - Math.max(0, g))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function jc(e, t = Nc()) {
	let n = Mc(e), r = Mc(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Mc(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function Nc() {
	return S((/* @__PURE__ */ new Date()).toISOString());
}
function Pc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function Fc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ic(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function Lc(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? Fc(t - n) : Fc(n - t);
}
function Rc(e, t, n) {
	Ic(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = Fc(t + r.debit), n = Fc(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: Lc(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = Fc(r.reduce((e, t) => e + t.totalDebit, 0)), o = Fc(r.reduce((e, t) => e + t.totalCredit, 0));
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
function zc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Bc({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = Ac(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: zc(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = zc(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = zc(Rc(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = zc(l - d);
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
//#region src/features/sales/data/salesConsistencyAudit.ts
var Vc = (e) => Math.round(e * 100);
function Hc(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + Vc(t.amount), 0), s = a.reduce((e, t) => e + Vc(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (Vc(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), Vc(t.amountDue) !== Math.max(0, Vc(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > Vc(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		!t.openingBalanceImportId && (!r || r.customerId !== t.customerId) && n("CREDIT_SOURCE_LINK", t.id, "Credit note source invoice missing or customer mismatch");
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + Vc(t.amount), 0);
		Vc(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || Vc(t.amountAvailable) !== 0 : Vc(t.amountAvailable) !== Vc(t.totals.total) - a - Vc(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var Uc = {
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
function Wc(e) {
	return Hc(e).map((e) => ({
		...e,
		action: Uc[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var Gc = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Kc(e, t) {
	let n = Wc(e).map((e) => ({ ...e })), r = t.filter((e) => Gc.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => Gc.has(e.kind))) s.has(e.operationId) && n.push({
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
function qc() {
	let e = R.getAll();
	return Kc({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ur.getAll(),
		creditNotes: I.getAll(),
		allocations: I.getAllAllocations(),
		journals: F.getAll()
	}, O.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
function Jc(e) {
	return JSON.stringify([
		e.operationId,
		e.kind,
		e.state,
		e.resultId,
		e.updatedAt,
		e.reviewHistory ?? [],
		e.fingerprint,
		e.repairProposal,
		e.resolution
	]);
}
var Yc = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Xc(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!Yc.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = Kc(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function Zc() {
	let e = R.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ur.getAll(),
		creditNotes: I.getAll(),
		allocations: I.getAllAllocations(),
		journals: F.getAll()
	};
}
function Qc(e) {
	let t = [], r = Zc(), i = O.list().find((t) => t.operationId === e), a = r.payments.find((e) => e.id === i?.resultId), o = (e) => Math.round(e * 100), s = (e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e) t.set(n.accountId, (t.get(n.accountId) ?? 0) + o(n.debit) - o(n.credit));
		return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
	};
	if (a && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(i.kind)) {
		let e = r.journals.find((e) => e.sourceType === "CUSTOMER_PAYMENT" && e.sourceId === a.id && !e.reversedJournalEntryId), i = P.getAll().find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE"), s = L.getById(a.bankAccountId)?.glAccountId;
		if (a.depositApplicationId) {
			let e = n().customerDeposits, t = e.applications.find((e) => e.id === a.depositApplicationId && e.paymentId === a.id);
			s = t ? e.deposits.find((e) => e.id === t.depositId)?.liabilityAccountId : void 0;
		}
		(!e || !i || !s || e.lines.length !== 2 || !e.lines.some((e) => e.accountId === s && o(e.debit) === o(a.amount) && o(e.credit) === 0) || !e.lines.some((e) => e.accountId === i.id && o(e.credit) === o(a.amount) && o(e.debit) === 0)) && t.push("Payment journal bank/deposit and receivables accounts do not match the bound payment.");
	}
	let c = r.journals.filter((e) => !e.reversedJournalEntryId && e.sourceId === i?.resultId && (i?.kind === "SALES_INVOICE_VOID" && e.sourceType === "CUSTOMER_INVOICE" || i?.kind === "SALES_PAYMENT_REVERSAL" && e.sourceType === "CUSTOMER_PAYMENT"));
	for (let e of c) {
		let n = r.journals.find((t) => t.id === e.reversalJournalEntryId);
		(!n || s(n.lines) !== s(e.lines.map((e) => ({
			...e,
			debit: e.credit,
			credit: e.debit
		})))) && t.push("Reversal journal accounts do not exactly reverse the original.");
	}
	try {
		let e = [
			...r.journals.map((e) => e.journalDate),
			...r.invoices.map((e) => e.documentDate),
			...r.creditNotes.map((e) => e.creditDate),
			...r.payments.map((e) => e.paymentDate)
		].sort().at(-1) ?? "1970-01-01", n = Bc({
			accounts: P.getAll(),
			journalEntries: [...r.journals],
			asOfDate: e,
			customers: A.getAll(),
			documents: [
				...r.quotes,
				...r.salesOrders,
				...r.invoices
			],
			payments: [...r.payments],
			creditNotes: [...r.creditNotes],
			creditAllocations: [...r.allocations]
		});
		(!n.reconciled || !Number.isFinite(n.difference)) && t.push("Current receivables subledger and GL do not reconcile.");
	} catch (e) {
		t.push("Receivables reconciliation failed: " + e.message);
	}
	return t;
}
function $c(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = Se("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return re(t.view), t.result;
	}
	if (typeof e.approvalReference != "string" || e.approvalReference.length > 500) throw Error("Provide an approval reference of 3–500 characters.");
	let t = O.list(), n = t.find((t) => t.operationId === e.operationId);
	if (!n || !e.expectedRevision || Jc(n) !== e.expectedRevision) throw Error("Recovery evidence changed. Refresh and review before approval.");
	let r = n.kind === "BANK_RECONCILIATION" ? bc(e.operationId) : ds(n.kind) ? fs(e.operationId) : Xc(Zc(), t, e.operationId);
	n.kind !== "BANK_RECONCILIATION" && !ds(n.kind) && r.push(...Qc(e.operationId));
	let i = us();
	if (i.length && r.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), r.length) throw Error(`Financial recovery remains blocked: ${r.join(" ")}`);
	let a = t.find((t) => t.operationId === e.operationId);
	return {
		closed: O.closeReviewed(e.operationId, a.resultId, e.approvalReference, e.approver),
		remaining: qc()
	};
}
//#endregion
//#region src/features/sales/data/recoveryWorkbench.ts
var el = [
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
];
function tl() {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let e = Se("business.command", {
			repository: "salesRecovery",
			method: "inspectRecovery",
			args: []
		});
		return re(e.view), e.result;
	}
	let e = k.require("audit.read"), t = O.list(), n = R.getAll(), r = {
		quotes: n.filter((e) => e.type === "QUOTE"),
		salesOrders: n.filter((e) => e.type === "SALES_ORDER"),
		invoices: n.filter((e) => e.type === "INVOICE"),
		payments: Ur.getAll(),
		creditNotes: I.getAll(),
		allocations: I.getAllAllocations(),
		journals: F.getAll()
	}, i = us(), a = t.filter((e) => e.state !== "COMPLETED" || e.reviewHistory?.length).map((n) => {
		let a = el.includes(n.kind) || ds(n.kind) || n.kind === "BANK_RECONCILIATION", o = [], s = (e, t) => {
			o.some((e) => e.path === t) || o.push({
				label: e,
				path: t
			});
		};
		if (n.kind === "BANK_RECONCILIATION") {
			let e = vc.getAll().find((e) => e.id === n.resultId);
			s("Bank reconciliation records", e ? "/banking/accounts/" + encodeURIComponent(e.bankAccountId) : "/banking");
		}
		if (ds(n.kind)) {
			let e = (n.kind === "BANK_TRANSACTION" ? as.getTransactions() : as.getTransfers()).find((e) => e.id === n.resultId);
			e && (s("Bank business records", "/banking"), s("Bank journal", "/accounting/journals/" + encodeURIComponent(e.journalEntryId)));
		}
		let c = r.payments.find((e) => e.id === n.resultId), u = r.allocations.find((e) => e.id === n.resultId);
		n.kind === "SALES_INVOICE_VOID" && n.resultId && r.invoices.some((e) => e.id === n.resultId) && s("Invoice", "/sales/invoices/" + encodeURIComponent(n.resultId)), c && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(n.kind) && (s("Invoice and payment", "/sales/invoices/" + encodeURIComponent(c.invoiceId)), c.depositId && s("Deposit owner", "/sales/customer-deposits/" + encodeURIComponent(c.depositId))), u && ["SALES_CREDIT_APPLY", "SALES_CREDIT_REVERSAL"].includes(n.kind) && (s("Invoice", "/sales/invoices/" + encodeURIComponent(u.invoiceId)), s("Credit note", "/sales/credit-notes/" + encodeURIComponent(u.creditNoteId)));
		let d = n.kind === "SALES_INVOICE_VOID" ? [{
			type: "CUSTOMER_INVOICE",
			id: n.resultId
		}] : c && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(n.kind) ? [{
			type: "CUSTOMER_PAYMENT",
			id: c.id
		}, {
			type: "CUSTOMER_INVOICE",
			id: c.invoiceId
		}] : u && ["SALES_CREDIT_APPLY", "SALES_CREDIT_REVERSAL"].includes(n.kind) ? [{
			type: "CUSTOMER_INVOICE",
			id: u.invoiceId
		}, {
			type: "CREDIT_NOTE",
			id: u.creditNoteId
		}] : [];
		for (let e of r.journals.filter((e) => d.some((t) => t.type === e.sourceType && t.id === e.sourceId) && !e.reversedJournalEntryId)) s("Original journal " + e.journalNumber, "/accounting/journals/" + encodeURIComponent(e.id)), e.reversalJournalEntryId && r.journals.some((t) => t.id === e.reversalJournalEntryId) && s("Reversal journal", "/accounting/journals/" + encodeURIComponent(e.reversalJournalEntryId));
		let f = n.state === "COMPLETED" ? [] : a ? n.kind === "BANK_RECONCILIATION" ? bc(n.operationId) : ds(n.kind) ? fs(n.operationId) : Xc(r, t, n.operationId) : ["This operation kind has no verified closure procedure. It remains blocked; do not replay it."];
		return n.state !== "COMPLETED" && a && (n.kind !== "BANK_RECONCILIATION" && !ds(n.kind) && f.push(...Qc(n.operationId)), i.length && f.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), n.reviewHistory?.some((t) => t.operator.trim().toLowerCase() === e.userId.toLowerCase()) && f.push("A different authorized operator must approve; this account recorded review evidence."), l(e, "accounting.recover") || f.push("Your role can inspect but cannot approve recovery.")), {
			...structuredClone(n),
			supported: a,
			revision: Jc(n),
			closureReasons: f,
			canApprove: a && n.state === "MANUAL_REVIEW" && f.length === 0,
			links: o
		};
	});
	return {
		queue: a.filter((e) => e.state !== "COMPLETED").sort((e, t) => e.createdAt.localeCompare(t.createdAt)),
		history: a.filter((e) => e.state === "COMPLETED").sort((e, t) => t.updatedAt.localeCompare(e.updatedAt)),
		unresolvedCount: t.filter((e) => e.state !== "COMPLETED").length,
		inspectedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var nl = (e) => Math.round((e + 2 ** -52) * 100) / 100, rl = y().trim().min(1).max(200), il = c().finite().positive().refine((e) => nl(e) === e, "Use cents precision"), al = w({
	operationId: rl,
	customerId: rl,
	paymentDate: rl,
	bankAccountId: rl,
	reference: y().max(500).optional(),
	allocations: a(w({
		invoiceId: rl,
		amount: il
	}).strict()).min(1).max(500)
}).strict(), ol = w({
	operationId: rl,
	creditId: rl,
	paymentDate: rl,
	bankAccountId: rl,
	amount: il,
	reference: y().max(500).optional()
}).strict(), sl = [], cl = [], ll = [], ul = 0, dl = /* @__PURE__ */ new Set(), fl = () => {
	ul++, dl.forEach((e) => e());
};
function pl(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function ml(e, t) {
	T(t, "Payment date");
	let n = L.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = P.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function hl(e) {
	if (vc.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function gl(e, t) {
	let n = e === "customer" ? I.getById(t) : H.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function _l(e, t, n) {
	let r = gl(e, t), i = nl(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = nl(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? I.update(o) : H.update(o);
}
function vl(e, t) {
	M();
	let n = ol.parse(t), { old: r, fingerprint: i } = pl(e === "customer" ? cl : ll, n.operationId, n);
	if (r) return r;
	let a = gl(e, n.creditId), o = ml(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = P.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = F.post({
		journalDate: n.paymentDate,
		description: `${e} refund ${n.reference ?? c}`,
		sourceType: e === "customer" ? "CUSTOMER_REFUND" : "SUPPLIER_REFUND",
		sourceId: c,
		reference: n.reference,
		lines: [{
			accountId: s.id,
			debit: e === "customer" ? n.amount : 0,
			credit: e === "supplier" ? n.amount : 0
		}, {
			accountId: o.glAccountId,
			debit: e === "supplier" ? n.amount : 0,
			credit: e === "customer" ? n.amount : 0
		}]
	}), u = {
		...n,
		id: c,
		fingerprint: i,
		contactId: "customerId" in a ? a.customerId : a.supplierId,
		journalEntryId: l.id,
		status: "POSTED"
	};
	return _l(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? cl = [...cl, u] : ll = [...ll, u], fl(), u;
}
function yl(e, t) {
	if (M(), T(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? cl : ll, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	hl(r.journalEntryId), F.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = gl(e, r.creditId);
	_l(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? cl = n.map((e) => e.id === r.id ? a : e) : ll = n.map((e) => e.id === r.id ? a : e), fl(), a;
}
var bl = {
	recordReceipt(e) {
		let t = al.parse(e), { old: n, fingerprint: r } = pl(sl, t.operationId, t);
		if (n) return n;
		if (ml(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = R.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => R.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: nl(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return sl = [...sl, a], fl(), a;
	},
	reverseReceipt(e) {
		let t = sl.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = Ur.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of F.getBySource("CUSTOMER_PAYMENT", e)) hl(t.id);
		}
		for (let n of t.paymentIds) R.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return sl = sl.map((e) => e.id === t.id ? n : e), fl(), n;
	},
	createRefund: (e) => vl("customer", e),
	reverseRefund: (e) => yl("customer", e)
}, xl = {
	create: (e) => vl("supplier", e),
	reverse: (e) => yl("supplier", e),
	repairLegacyCredits(e) {
		if (M(), T(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of H.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || F.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = F.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = P.requireBySystemRole("INVENTORY"), a = P.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = nl(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(F.post({
				journalDate: e.date,
				description: `Supplier credit reclassification ${n.creditNumber}: ${e.reason}`,
				sourceType: "SUPPLIER_CREDIT_RECLASS",
				sourceId: n.id,
				lines: [{
					accountId: i.id,
					debit: o,
					credit: 0
				}, {
					accountId: a.id,
					debit: 0,
					credit: o
				}]
			}));
		}
		return t;
	}
}, Sl = w({
	id: rl,
	operationId: rl,
	fingerprint: rl,
	creditId: rl,
	contactId: rl,
	paymentDate: rl,
	bankAccountId: rl,
	amount: il,
	journalEntryId: rl,
	status: g(["POSTED", "REVERSED"]),
	reference: y().optional(),
	reversalDate: y().optional()
}).strict();
m("customerSettlements", {
	repository: bl,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: sl,
		refunds: cl
	}),
	restore: (e) => {
		sl = e.receipts, cl = e.refunds;
	},
	validate: (e, t) => {
		Cl(e, t, !1);
		let n = e;
		a(Sl.extend({ fingerprint: y() })).parse(n.refunds), a(w({
			id: rl,
			operationId: rl,
			paymentIds: a(rl),
			amount: il,
			status: g(["POSTED", "REVERSED"])
		}).passthrough()).parse(n.receipts);
	},
	publish: fl
}), m("supplierRefunds", {
	repository: xl,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: ll }),
	restore: (e) => {
		ll = e.refunds;
	},
	validate: (e, t) => {
		Cl(e, t, !0), a(Sl.extend({ fingerprint: y() })).parse(e.refunds);
	},
	publish: fl
});
function Cl(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = nl(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || nl(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/supplier-prepayments/supplierPrepaymentRepository.ts
var wl = (e) => Math.round((e + 2 ** -52) * 100) / 100, Tl = y().trim().min(1).max(200), El = Tl.refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}), Dl = c().finite().positive().refine((e) => wl(e) === e), Ol = y().trim().min(3).max(2e3), kl = y().trim().max(500).default(""), Al = w({
	operationId: Tl,
	supplierId: Tl,
	date: El,
	bankAccountId: Tl,
	amount: Dl,
	reference: kl,
	reason: Ol
}).strict(), jl = w({
	operationId: Tl,
	prepaymentId: Tl,
	supplierBillId: Tl,
	date: El,
	amount: Dl,
	reference: kl,
	reason: Ol
}).strict(), Ml = w({
	operationId: Tl,
	prepaymentId: Tl,
	bankAccountId: Tl,
	date: El,
	amount: Dl,
	reference: kl,
	reason: Ol
}).strict(), Nl = {
	id: Tl,
	fingerprint: y(),
	journalId: Tl,
	status: g(["POSTED", "REVERSED"]),
	createdBy: Tl,
	createdAt: Tl,
	reversalDate: El.optional(),
	reversalReason: Ol.optional(),
	reversedBy: Tl.optional()
}, Pl = Al.extend({
	...Nl,
	assetAccountId: Tl
}).strict(), Fl = jl.extend({
	...Nl,
	paymentId: Tl
}).strict(), Il = Ml.extend(Nl).strict(), Ll = w({
	prepayments: a(Pl),
	applications: a(Fl),
	refunds: a(Il),
	settings: a(w({
		id: Tl,
		assetAccountId: Tl
	}).strict()).max(1)
}).strict(), Rl = {
	prepayments: [],
	applications: [],
	refunds: [],
	settings: []
}, zl = 0, Bl = /* @__PURE__ */ new Set(), Vl = () => {
	zl++, Bl.forEach((e) => e());
};
function Hl(e) {
	let t = Rl.prepayments.find((t) => t.id === e);
	if (!t) throw Error("Supplier prepayment not found.");
	return t;
}
function Ul(e) {
	let t = Hl(e);
	return t.status === "REVERSED" ? 0 : wl(t.amount - Rl.applications.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - Rl.refunds.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function Wl(e, t) {
	let n = e.prepayments.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, wl((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.prepaymentId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Prepayment event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = wl(a + e), a < 0) throw Error("Prepayment would be overdrawn on a historical date.");
}
function Gl(e) {
	let t = JSON.stringify(e), n = [
		...Rl.prepayments,
		...Rl.applications,
		...Rl.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different prepayment data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function Kl(e) {
	let t = P.requireById(e);
	if (!t.active || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active prepayment asset account.");
	return t;
}
function ql(e, t) {
	let n = L.requireById(e), r = P.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function Jl(e) {
	T(e), _n(e), M();
}
function Yl(e, t, n = crypto.randomUUID()) {
	return {
		id: n,
		fingerprint: e,
		journalId: t,
		status: "POSTED",
		createdBy: k.require("purchases.payment").userId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
m("supplierPrepayments", {
	repository: {
		setupDefaults() {
			if (k.require("accounting.post"), Rl.settings[0]) return Rl.settings[0];
			let e = 1390;
			for (; P.getAll().some((t) => t.code === String(e));) e++;
			let t = P.create({
				code: String(e),
				name: "Supplier prepayments paid",
				type: "ASSET",
				active: !0,
				allowManualPosting: !1
			}), n = {
				id: crypto.randomUUID(),
				assetAccountId: t.id
			};
			return Rl.settings = [n], Vl(), n;
		},
		balance(e) {
			return k.require("purchases.read"), Ul(e);
		},
		pay(e) {
			k.require("purchases.payment");
			let t = Al.parse(e), { prior: n, fingerprint: r } = Gl(t);
			if (n) return n;
			Jl(t.date);
			let i = Ni.getById(t.supplierId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active supplier.");
			let a = Rl.settings[0];
			if (!a) throw Error("Configure the prepayment asset account first.");
			Kl(a.assetAccountId);
			let o = ql(t.bankAccountId, t.date), s = crypto.randomUUID(), c = F.post({
				journalDate: t.date,
				description: "Supplier prepayment paid: " + t.reference,
				reference: t.reference,
				sourceType: "SUPPLIER_PREPAYMENT",
				sourceId: s,
				lines: [{
					accountId: o.glAccountId,
					debit: 0,
					credit: t.amount
				}, {
					accountId: a.assetAccountId,
					debit: t.amount,
					credit: 0
				}]
			}), l = {
				...t,
				...Yl(r, c.id, s),
				assetAccountId: a.assetAccountId
			};
			return Rl.prepayments = [...Rl.prepayments, l], Vl(), l;
		},
		apply(e) {
			k.require("purchases.payment");
			let t = jl.parse(e), { prior: n, fingerprint: r } = Gl(t);
			if (n) return n;
			Jl(t.date);
			let i = Hl(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Ul(i.id)) throw Error("Prepayment date or available balance is insufficient.");
			Kl(i.assetAccountId);
			let a = _o.getById(t.supplierBillId);
			if (!a || a.supplierId !== i.supplierId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.billDate) throw Error("Choose an issued bill for the same supplier.");
			if (t.amount > a.totals.amountDue) throw Error("Prepayment application exceeds bill amount due.");
			let o = crypto.randomUUID(), s = "prepayment-payment:" + o;
			Co.recordPrepaymentSettlement({
				id: s,
				prepaymentId: i.id,
				applicationId: o,
				supplierId: i.supplierId,
				supplierBillId: a.id,
				paymentDate: t.date,
				bankAccountId: i.bankAccountId,
				amount: t.amount,
				reference: t.reference || "Prepayment applied " + i.reference
			});
			let c = F.post({
				journalDate: t.date,
				description: "Supplier prepayment applied to " + a.billNumber,
				reference: t.reference,
				sourceType: "SUPPLIER_PAYMENT",
				sourceId: s,
				lines: [{
					accountId: i.assetAccountId,
					debit: 0,
					credit: t.amount
				}, {
					accountId: P.requireBySystemRole("ACCOUNTS_PAYABLE").id,
					debit: t.amount,
					credit: 0
				}]
			}), l = {
				...t,
				...Yl(r, c.id, o),
				paymentId: s
			};
			return Rl.applications = [...Rl.applications, l], Wl(Rl, i.id), Vl(), l;
		},
		refund(e) {
			k.require("purchases.payment");
			let t = Ml.parse(e), { prior: n, fingerprint: r } = Gl(t);
			if (n) return n;
			Jl(t.date);
			let i = Hl(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Ul(i.id)) throw Error("Refund exceeds the available prepayment.");
			Kl(i.assetAccountId);
			let a = ql(t.bankAccountId, t.date), o = crypto.randomUUID(), s = F.post({
				journalDate: t.date,
				description: "Unused supplier prepayment returned",
				reference: t.reference,
				sourceType: "SUPPLIER_PREPAYMENT_REFUND",
				sourceId: o,
				lines: [{
					accountId: i.assetAccountId,
					debit: 0,
					credit: t.amount
				}, {
					accountId: a.glAccountId,
					debit: t.amount,
					credit: 0
				}]
			}), c = {
				...t,
				...Yl(r, s.id, o)
			};
			return Rl.refunds = [...Rl.refunds, c], Wl(Rl, i.id), Vl(), c;
		},
		reverse(e) {
			let t = k.require("purchases.payment"), n = w({
				entity: g([
					"prepayments",
					"applications",
					"refunds"
				]),
				id: Tl,
				reversalDate: El,
				reason: Ol
			}).strict().parse(e), r = Rl[n.entity].find((e) => e.id === n.id);
			if (!r) throw Error("Prepayment record not found.");
			if (r.status === "REVERSED") return r;
			if (Jl(n.reversalDate), n.reversalDate < r.date) throw Error("Prepayment reversal cannot precede its original date.");
			let i = n.entity === "prepayments" ? r.id : r.prepaymentId;
			if (n.entity === "prepayments" && [...Rl.applications, ...Rl.refunds].some((e) => e.prepaymentId === r.id && e.status === "POSTED")) throw Error("Reverse prepayment applications and refunds before reversing its receipt.");
			hl(r.journalId), F.reverse({
				journalEntryId: r.journalId,
				reversalDate: n.reversalDate,
				reason: n.reason
			});
			let a = {
				...r,
				status: "REVERSED",
				reversalDate: n.reversalDate,
				reversalReason: n.reason,
				reversedBy: t.userId
			};
			if (Rl[n.entity] = Rl[n.entity].map((e) => e.id === n.id ? a : e), n.entity === "applications") {
				let e = r;
				Co.reversePrepaymentSettlement(e.paymentId, n.reversalDate, n.reason);
			}
			return Wl(Rl, i), Vl(), a;
		}
	},
	read: "purchases.read",
	commands: {
		setupDefaults: "accounting.post",
		balance: "purchases.read",
		pay: "purchases.payment",
		apply: "purchases.payment",
		refund: "purchases.payment",
		reverse: "purchases.payment"
	},
	snapshot: () => Rl,
	restore: (e) => {
		Rl = e;
	},
	publish: Vl,
	validate: (e, t) => {
		let n = Ll.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.assetAccountId);
			if (!t || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Invalid prepayment asset mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, wl((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"prepayments",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "prepayments" ? Al : e === "applications" ? jl : Ml).parse(JSON.parse(t.fingerprint));
			if (i.has(t.operationId) || JSON.stringify(o) !== t.fingerprint || Object.keys(o).some((e) => o[e] !== t[e]) || t.status === "REVERSED" && (!t.reversalDate || !t.reversalReason || !t.reversedBy || t.reversalDate < t.date) || t.status === "POSTED" && t.reversalDate) throw Error("Prepayment request or reversal metadata mismatch.");
			i.add(t.operationId);
			let s = e === "prepayments" ? t : n.prepayments.find((e) => e.id === t.prepaymentId);
			if (!s || !r.suppliers.suppliers.some((e) => e.id === s.supplierId) || !n.settings.some((e) => e.assetAccountId === s.assetAccountId)) throw Error("Prepayment supplier or receipt reference is missing.");
			let c = "SUPPLIER_PREPAYMENT", l = t.id, u;
			if (e === "applications") {
				let e = t, n = r.supplierPayments.supplierPayments.find((t) => t.id === e.paymentId), i = r.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === s.supplierId);
				if (!i || e.date < i.billDate || ["DRAFT", "VOID"].includes(i.status) && e.status === "POSTED" || !n || n.prepaymentApplicationId !== e.id || n.prepaymentId !== s.id || n.allocations.length !== 1 || n.allocations[0].supplierBillId !== e.supplierBillId || n.allocations[0].amount !== e.amount || n.supplierId !== s.supplierId || n.amount !== e.amount || n.paymentDate !== e.date || n.bankAccountId !== s.bankAccountId || n.method !== "OTHER" || n.status !== (e.status === "POSTED" ? "POSTED" : "REVERSED") || e.status === "REVERSED" && n.reversedAt !== e.reversalDate) throw Error("Prepayment application payment does not match its bill.");
				c = "SUPPLIER_PAYMENT", l = e.paymentId;
				let a = r.accounts.accounts.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
				u = [{
					accountId: s.assetAccountId,
					debit: 0,
					credit: t.amount
				}, {
					accountId: a.id,
					debit: t.amount,
					credit: 0
				}];
			} else {
				let n = r.bankAccounts.bankAccounts.find((e) => e.id === t.bankAccountId);
				if (!n) throw Error("Prepayment bank account is missing.");
				c = e === "refunds" ? "SUPPLIER_PREPAYMENT_REFUND" : "SUPPLIER_PREPAYMENT", u = e === "refunds" ? [{
					accountId: s.assetAccountId,
					debit: 0,
					credit: t.amount
				}, {
					accountId: n.glAccountId,
					debit: t.amount,
					credit: 0
				}] : [{
					accountId: n.glAccountId,
					debit: 0,
					credit: t.amount
				}, {
					accountId: s.assetAccountId,
					debit: t.amount,
					credit: 0
				}];
			}
			let d = r.journals.journalEntries.find((e) => e.id === t.journalId);
			if (!d || d.lines.length !== 2 || d.sourceType !== c || d.sourceId !== l || d.journalDate !== t.date || a(d.lines) !== a(u) || d.status !== (t.status === "POSTED" ? "POSTED" : "REVERSED")) throw Error("Prepayment journal does not match its source.");
			if (t.status === "REVERSED") {
				let e = r.journals.journalEntries.find((e) => e.id === t.journalId && e.reversalJournalEntryId)?.reversalJournalEntryId, n = r.journals.journalEntries.find((t) => t.id === e);
				if (!n || n.lines.length !== 2 || n.sourceType !== c || n.reversedJournalEntryId !== d.id || n.journalDate !== t.reversalDate || a(n.lines) !== a(u.map((e) => ({
					...e,
					debit: e.credit,
					credit: e.debit
				})))) throw Error("Prepayment reversal journal mismatch.");
			}
		}
		let o = [
			...n.prepayments,
			...n.applications,
			...n.refunds
		].map((e) => e.id);
		if (new Set(o).size !== o.length) throw Error("Duplicate prepayment record ID.");
		for (let e of r.journals.journalEntries) if (!e.reversedJournalEntryId && ["SUPPLIER_PREPAYMENT", "SUPPLIER_PREPAYMENT_REFUND"].includes(e.sourceType) && ![...n.prepayments, ...n.refunds].some((t) => t.journalId === e.id)) throw Error("Orphan prepayment journal.");
		for (let e of n.prepayments) if (Wl(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.prepaymentId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed prepayment has later consumption.");
		for (let e of r.supplierPayments.supplierPayments) if (e.prepaymentApplicationId && !n.applications.some((t) => t.id === e.prepaymentApplicationId && t.paymentId === e.id && t.prepaymentId === e.prepaymentId)) throw Error("Orphan prepayment settlement payment.");
	}
});
//#endregion
//#region src/features/customer-deposits/customerDepositRepository.ts
var Xl = (e) => Math.round((e + 2 ** -52) * 100) / 100, Zl = y().trim().min(1).max(200), Ql = Zl.refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}), $l = c().finite().positive().refine((e) => Xl(e) === e), eu = y().trim().min(3).max(2e3), tu = y().trim().max(500).default(""), nu = w({
	operationId: Zl,
	customerId: Zl,
	date: Ql,
	bankAccountId: Zl,
	amount: $l,
	reference: tu,
	reason: eu
}).strict(), ru = w({
	operationId: Zl,
	depositId: Zl,
	invoiceId: Zl,
	date: Ql,
	amount: $l,
	reference: tu,
	reason: eu
}).strict(), iu = w({
	operationId: Zl,
	depositId: Zl,
	bankAccountId: Zl,
	date: Ql,
	amount: $l,
	reference: tu,
	reason: eu
}).strict(), au = {
	id: Zl,
	fingerprint: y(),
	journalId: Zl,
	status: g(["POSTED", "REVERSED"]),
	createdBy: Zl,
	createdAt: Zl,
	reversalDate: Ql.optional(),
	reversalReason: eu.optional(),
	reversedBy: Zl.optional()
}, ou = nu.extend({
	...au,
	liabilityAccountId: Zl
}).strict(), su = ru.extend({
	...au,
	paymentId: Zl
}).strict(), cu = iu.extend(au).strict(), lu = w({
	deposits: a(ou),
	applications: a(su),
	refunds: a(cu),
	settings: a(w({
		id: Zl,
		liabilityAccountId: Zl
	}).strict()).max(1)
}).strict(), uu = {
	deposits: [],
	applications: [],
	refunds: [],
	settings: []
}, du = 0, fu = /* @__PURE__ */ new Set(), pu = () => {
	du++, fu.forEach((e) => e());
};
function mu(e) {
	let t = uu.deposits.find((t) => t.id === e);
	if (!t) throw Error("Customer deposit not found.");
	return t;
}
function hu(e) {
	let t = mu(e);
	return t.status === "REVERSED" ? 0 : Xl(t.amount - uu.applications.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - uu.refunds.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function gu(e, t) {
	let n = e.deposits.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, Xl((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.depositId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Deposit event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = Xl(a + e), a < 0) throw Error("Deposit would be overdrawn on a historical date.");
}
function _u(e) {
	let t = JSON.stringify(e), n = [
		...uu.deposits,
		...uu.applications,
		...uu.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different deposit data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function vu(e) {
	let t = P.requireById(e);
	if (!t.active || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active deposit liability account.");
	return t;
}
function yu(e, t) {
	let n = L.requireById(e), r = P.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function bu(e) {
	T(e), _n(e), M();
}
function xu(e, t, n = crypto.randomUUID()) {
	return {
		id: n,
		fingerprint: e,
		journalId: t,
		status: "POSTED",
		createdBy: k.require("sales.payment").userId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
m("customerDeposits", {
	repository: {
		setupDefaults() {
			if (k.require("accounting.post"), uu.settings[0]) return uu.settings[0];
			let e = 2290;
			for (; P.getAll().some((t) => t.code === String(e));) e++;
			let t = P.create({
				code: String(e),
				name: "Customer deposits held",
				type: "LIABILITY",
				active: !0,
				allowManualPosting: !1
			}), n = {
				id: crypto.randomUUID(),
				liabilityAccountId: t.id
			};
			return uu.settings = [n], pu(), n;
		},
		balance(e) {
			return k.require("sales.read"), hu(e);
		},
		receive(e) {
			k.require("sales.payment");
			let t = nu.parse(e), { prior: n, fingerprint: r } = _u(t);
			if (n) return n;
			bu(t.date);
			let i = A.getById(t.customerId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active customer.");
			let a = uu.settings[0];
			if (!a) throw Error("Configure the deposit liability account first.");
			vu(a.liabilityAccountId);
			let o = yu(t.bankAccountId, t.date), s = crypto.randomUUID(), c = F.post({
				journalDate: t.date,
				description: "Customer deposit received: " + t.reference,
				reference: t.reference,
				sourceType: "CUSTOMER_DEPOSIT",
				sourceId: s,
				lines: [{
					accountId: o.glAccountId,
					debit: t.amount,
					credit: 0
				}, {
					accountId: a.liabilityAccountId,
					debit: 0,
					credit: t.amount
				}]
			}), l = {
				...t,
				...xu(r, c.id, s),
				liabilityAccountId: a.liabilityAccountId
			};
			return uu.deposits = [...uu.deposits, l], pu(), l;
		},
		apply(e) {
			k.require("sales.payment");
			let t = ru.parse(e), { prior: n, fingerprint: r } = _u(t);
			if (n) return n;
			bu(t.date);
			let i = mu(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > hu(i.id)) throw Error("Deposit date or available balance is insufficient.");
			vu(i.liabilityAccountId);
			let a = R.getAll().find((e) => e.id === t.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || a.customerId !== i.customerId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.documentDate) throw Error("Choose an issued invoice for the same customer.");
			let o = R.recalculateInvoiceBalance(a.id);
			if (t.amount > o.amountDue) throw Error("Deposit application exceeds invoice amount due.");
			let s = crypto.randomUUID(), c = "deposit-payment:" + s;
			Ur.recordDepositSettlement({
				id: c,
				depositId: i.id,
				applicationId: s,
				customerId: i.customerId,
				invoiceId: a.id,
				paymentDate: t.date,
				bankAccountId: i.bankAccountId,
				amount: t.amount,
				reference: t.reference || "Deposit applied " + i.reference
			});
			let l = F.post({
				journalDate: t.date,
				description: "Customer deposit applied to " + a.documentNumber,
				reference: t.reference,
				sourceType: "CUSTOMER_PAYMENT",
				sourceId: c,
				lines: [{
					accountId: i.liabilityAccountId,
					debit: t.amount,
					credit: 0
				}, {
					accountId: P.requireBySystemRole("ACCOUNTS_RECEIVABLE").id,
					debit: 0,
					credit: t.amount
				}]
			}), u = {
				...t,
				...xu(r, l.id, s),
				paymentId: c
			};
			return uu.applications = [...uu.applications, u], gu(uu, i.id), R.recalculateInvoiceBalance(a.id), pu(), u;
		},
		refund(e) {
			k.require("sales.payment");
			let t = iu.parse(e), { prior: n, fingerprint: r } = _u(t);
			if (n) return n;
			bu(t.date);
			let i = mu(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > hu(i.id)) throw Error("Refund exceeds the available deposit.");
			vu(i.liabilityAccountId);
			let a = yu(t.bankAccountId, t.date), o = crypto.randomUUID(), s = F.post({
				journalDate: t.date,
				description: "Unused customer deposit refunded",
				reference: t.reference,
				sourceType: "CUSTOMER_DEPOSIT_REFUND",
				sourceId: o,
				lines: [{
					accountId: i.liabilityAccountId,
					debit: t.amount,
					credit: 0
				}, {
					accountId: a.glAccountId,
					debit: 0,
					credit: t.amount
				}]
			}), c = {
				...t,
				...xu(r, s.id, o)
			};
			return uu.refunds = [...uu.refunds, c], gu(uu, i.id), pu(), c;
		},
		reverse(e) {
			let t = k.require("sales.payment"), n = w({
				entity: g([
					"deposits",
					"applications",
					"refunds"
				]),
				id: Zl,
				reversalDate: Ql,
				reason: eu
			}).strict().parse(e), r = uu[n.entity].find((e) => e.id === n.id);
			if (!r) throw Error("Deposit record not found.");
			if (r.status === "REVERSED") return r;
			if (bu(n.reversalDate), n.reversalDate < r.date) throw Error("Deposit reversal cannot precede its original date.");
			let i = n.entity === "deposits" ? r.id : r.depositId;
			if (n.entity === "deposits" && [...uu.applications, ...uu.refunds].some((e) => e.depositId === r.id && e.status === "POSTED")) throw Error("Reverse deposit applications and refunds before reversing its receipt.");
			hl(r.journalId), F.reverse({
				journalEntryId: r.journalId,
				reversalDate: n.reversalDate,
				reason: n.reason
			});
			let a = {
				...r,
				status: "REVERSED",
				reversalDate: n.reversalDate,
				reversalReason: n.reason,
				reversedBy: t.userId
			};
			if (uu[n.entity] = uu[n.entity].map((e) => e.id === n.id ? a : e), n.entity === "applications") {
				let e = r;
				Ur.reverseDepositSettlement(e.paymentId, n.reversalDate, n.reason), R.recalculateInvoiceBalance(e.invoiceId);
			}
			return gu(uu, i), pu(), a;
		}
	},
	read: "sales.read",
	commands: {
		setupDefaults: "accounting.post",
		balance: "sales.read",
		receive: "sales.payment",
		apply: "sales.payment",
		refund: "sales.payment",
		reverse: "sales.payment"
	},
	snapshot: () => uu,
	restore: (e) => {
		uu = e;
	},
	publish: pu,
	validate: (e, t) => {
		let n = lu.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.liabilityAccountId);
			if (!t || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Invalid deposit liability mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, Xl((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"deposits",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "deposits" ? nu : e === "applications" ? ru : iu).parse(JSON.parse(t.fingerprint));
			if (i.has(t.operationId) || JSON.stringify(o) !== t.fingerprint || Object.keys(o).some((e) => o[e] !== t[e]) || t.status === "REVERSED" && (!t.reversalDate || !t.reversalReason || !t.reversedBy || t.reversalDate < t.date) || t.status === "POSTED" && t.reversalDate) throw Error("Deposit request or reversal metadata mismatch.");
			i.add(t.operationId);
			let s = e === "deposits" ? t : n.deposits.find((e) => e.id === t.depositId);
			if (!s || !r.customers.customers.some((e) => e.id === s.customerId) || !n.settings.some((e) => e.liabilityAccountId === s.liabilityAccountId)) throw Error("Deposit customer or receipt reference is missing.");
			let c = "CUSTOMER_DEPOSIT", l = t.id, u;
			if (e === "applications") {
				let e = t, n = r.customerPayments.payments.find((t) => t.id === e.paymentId), i = r.sales.invoices.find((t) => t.id === e.invoiceId && t.customerId === s.customerId);
				if (!i || e.date < i.documentDate || ["DRAFT", "VOID"].includes(i.status) && e.status === "POSTED" || !n || n.depositApplicationId !== e.id || n.depositId !== s.id || n.invoiceId !== e.invoiceId || n.customerId !== s.customerId || n.amount !== e.amount || n.paymentDate !== e.date || n.bankAccountId !== s.bankAccountId || n.method !== "OTHER" || n.status !== (e.status === "POSTED" ? "RECEIVED" : "REVERSED") || e.status === "REVERSED" && n.reversedAt !== e.reversalDate) throw Error("Deposit application payment does not match its invoice.");
				c = "CUSTOMER_PAYMENT", l = e.paymentId;
				let a = r.accounts.accounts.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
				u = [{
					accountId: s.liabilityAccountId,
					debit: t.amount,
					credit: 0
				}, {
					accountId: a.id,
					debit: 0,
					credit: t.amount
				}];
			} else {
				let n = r.bankAccounts.bankAccounts.find((e) => e.id === t.bankAccountId);
				if (!n) throw Error("Deposit bank account is missing.");
				c = e === "refunds" ? "CUSTOMER_DEPOSIT_REFUND" : "CUSTOMER_DEPOSIT", u = e === "refunds" ? [{
					accountId: s.liabilityAccountId,
					debit: t.amount,
					credit: 0
				}, {
					accountId: n.glAccountId,
					debit: 0,
					credit: t.amount
				}] : [{
					accountId: n.glAccountId,
					debit: t.amount,
					credit: 0
				}, {
					accountId: s.liabilityAccountId,
					debit: 0,
					credit: t.amount
				}];
			}
			let d = r.journals.journalEntries.find((e) => e.id === t.journalId);
			if (!d || d.sourceType !== c || d.sourceId !== l || d.journalDate !== t.date || a(d.lines) !== a(u) || d.status !== (t.status === "POSTED" ? "POSTED" : "REVERSED")) throw Error("Deposit journal does not match its source.");
			if (t.status === "REVERSED") {
				let e = r.journals.journalEntries.find((e) => e.id === t.journalId && e.reversalJournalEntryId)?.reversalJournalEntryId, n = r.journals.journalEntries.find((t) => t.id === e);
				if (!n || n.reversedJournalEntryId !== d.id || n.journalDate !== t.reversalDate || a(n.lines) !== a(u.map((e) => ({
					...e,
					debit: e.credit,
					credit: e.debit
				})))) throw Error("Deposit reversal journal mismatch.");
			}
		}
		let o = [
			...n.deposits,
			...n.applications,
			...n.refunds
		].map((e) => e.id);
		if (new Set(o).size !== o.length) throw Error("Duplicate deposit record ID.");
		for (let e of r.journals.journalEntries) if (!e.reversedJournalEntryId && ["CUSTOMER_DEPOSIT", "CUSTOMER_DEPOSIT_REFUND"].includes(e.sourceType) && ![...n.deposits, ...n.refunds].some((t) => t.journalId === e.id)) throw Error("Orphan deposit journal.");
		for (let e of n.deposits) if (gu(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.depositId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed deposit has later consumption.");
		for (let e of r.customerPayments.payments) if (e.depositApplicationId && !n.applications.some((t) => t.id === e.depositApplicationId && t.paymentId === e.id && t.depositId === e.depositId)) throw Error("Orphan deposit settlement payment.");
	}
});
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function Su(e) {
	return P.requireBySystemRole(e).id;
}
function Cu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function wu(e) {
	return F.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function Tu(e) {
	let t = wa.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Eu = {
	postSalesFulfilment(e) {
		let t = wu(e.id);
		if (t) return t;
		let n = Cu(Tu(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return F.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: Su("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: Su("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = wu(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? F.getById(r.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, Du = /* @__PURE__ */ new Set(), Ou = [], ku = Ou;
function Au() {
	ku = Ou, Du.forEach((e) => e());
}
function ju() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Ou.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Mu(e, t) {
	return z(Ou.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function Nu(e) {
	let t = R.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(tt).map((e) => Mu(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(tt).every((e, t) => n[t] >= z(e.quantity));
	R.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function Pu(e) {
	let t = wa.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Fu = {
	subscribe(e) {
		return Du.add(e), () => {
			Du.delete(e);
		};
	},
	getSnapshot() {
		return ku;
	},
	getAll() {
		return ku;
	},
	getById(e) {
		return Ou.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return Ou.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: Mu,
	getRemainingQuantity(e, t) {
		let n = R.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return tt(r) ? z(r.quantity - Mu(e, t)) : 0;
	},
	create(e) {
		let t = R.getById(e.salesOrderId);
		if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let n = t;
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "INVOICED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
		if (n.status === "INVOICED" && !n.invoiceIds.some((e) => {
			let t = R.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("This order has no active invoice; do not fulfil a void invoice.");
		let r = la.getById(e.siteId);
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
			if (!tt(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = it(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = at(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = z(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = Mu(n.id, t.id);
			if (s > z(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = z(s * o.conversionToBase), u = Ua.getBalance(r.id, t.productId);
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
			let n = Ua.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = it(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = ju(), d = o.map((e) => ({
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
			let i = it(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = ma.create({
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
			La({
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
			}), Ua.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return Eu.postSalesFulfilment(f), Ou = [f, ...Ou], Au(), Nu(n.id), f;
	},
	void(e) {
		if (n().physicalCustomerReturns?.returns.some((t) => t.status === "POSTED" && t.lines.some((t) => t.fulfilmentId === e.fulfilmentId))) throw Error("Reverse physical customer returns before voiding this dispatch.");
		let t = Ou.find((t) => t.id === e.fulfilmentId);
		if (!t) throw Error("Sales fulfilment was not found.");
		if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let i = R.getById(t.salesOrderId);
		if (!i || i.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (i.status === "INVOICED" && i.invoiceIds.some((e) => {
			let t = R.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (i.status !== "CONFIRMED" && i.status !== "PARTIALLY_FULFILLED" && i.status !== "FULFILLED" && i.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${i.status}.`);
		let a = Pu(t), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
			let n = it(e.productId);
			if (!n) throw Error(`Product ${e.sku} was not found.`);
			let r = a.find((n) => !o.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return o.add(r.id), {
				line: e,
				product: n,
				originalIssue: r
			};
		});
		Eu.reverseSalesFulfilment({
			fulfilment: t,
			reversalDate: e.voidDate,
			reason: r
		});
		for (let n of s) {
			let { line: i, product: a, originalIssue: o } = n, s = ma.create({
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
				notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${r}`
			});
			Ra({
				siteId: t.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: Xi(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: t.id,
				referenceNumber: t.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${r}`
			}), Ua.receive({
				siteId: t.siteId,
				productId: i.productId,
				baseUnitId: a.baseUnitId,
				quantityBase: i.fulfilledBaseQuantity
			});
		}
		let c = {
			...t,
			status: "VOIDED",
			voidedAt: (/* @__PURE__ */ new Date()).toISOString(),
			voidDate: e.voidDate,
			voidReason: r
		};
		return Ou = Ou.map((e) => e.id === c.id ? c : e), Au(), Nu(t.salesOrderId), c;
	}
};
m("fulfilments", {
	repository: Fu,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: Ou }),
	restore: (e) => {
		Ou = e.fulfilments, ku = Ou;
	},
	publish: () => Du.forEach((e) => e())
});
//#endregion
//#region src/features/customer-returns/customerReturnRepository.ts
var U = y().trim().min(1).max(200), Iu = c().finite().positive().refine((e) => Math.round(e * 1e4) / 1e4 === e), Lu = c().finite().nonnegative(), Ru = w({
	operationId: U,
	invoiceId: U,
	creditNoteId: U.optional(),
	returnDate: U,
	reason: y().trim().min(3).max(2e3),
	lines: a(w({
		costMovementId: U,
		invoiceLineId: U,
		quantity: Iu
	}).strict()).min(1).max(500)
}).strict(), zu = w({
	costMovementId: U,
	invoiceLineId: U,
	fulfilmentId: U,
	productId: U,
	unitId: U,
	baseUnitId: U,
	siteId: U,
	description: y(),
	quantity: Iu,
	conversionToBase: Iu,
	quantityBase: Iu,
	inventoryValue: Lu,
	unitCostBase: Lu,
	movementId: U,
	restoredCostId: U,
	reversalMovementId: U.optional(),
	reversalCostId: U.optional()
}).strict(), Bu = w({
	id: U,
	number: U,
	operationId: U,
	fingerprint: y(),
	invoiceId: U,
	invoiceNumber: U,
	customerId: U,
	creditNoteId: U,
	ownsCredit: h(),
	returnDate: U,
	reason: U.max(2e3),
	status: g(["POSTED", "REVERSED"]),
	lines: a(zu).min(1),
	inventoryValue: Lu,
	journalId: U.optional(),
	createdBy: U,
	createdAt: U,
	reversalDate: U.optional(),
	reversalReason: U.optional(),
	reversedBy: U.optional()
}).strict(), Vu = [], Hu = 0, Uu = /* @__PURE__ */ new Set(), Wu = () => {
	Hu++, Uu.forEach((e) => e());
}, Gu = (e) => Math.round(e * 1e4) / 1e4, Ku = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function qu(e, t, n) {
	if (wa.getAll().some((r) => r.siteId === e && r.productId === t && S(r.occurredAt) > n)) throw Error("Return date precedes later inventory activity at this site.");
}
function Ju(e) {
	let t = R.getAll().find((t) => t.id === e && t.type === "INVOICE");
	if (!t || t.type !== "INVOICE" || ["VOID", "DRAFT"].includes(t.status) || t.openingBalanceImportId) return [];
	let n = [];
	for (let e of Fu.getAll().filter((e) => e.salesOrderId === t.sourceSalesOrderId && e.status === "ACTIVE")) {
		let r = /* @__PURE__ */ new Set();
		for (let i of e.lines) {
			let a = t.lines.find((e) => e.id === i.salesOrderLineId && e.productId === i.productId && e.unitId === i.unitId), o = wa.getAll().find((t) => t.referenceType === "SALE" && t.referenceId === e.id && t.movementType === "ISSUE" && t.productId === i.productId && ma.getAll().some((e) => e.id === t.inventoryMovementId && e.transactionUnitId === i.unitId) && t.siteId === e.siteId && Gu(-t.quantityBase) === Gu(i.fulfilledBaseQuantity) && !r.has(t.id));
			if (!a || !o) continue;
			r.add(o.id);
			let s = Vu.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === o.id).reduce((e, t) => e + t.quantityBase, 0);
			n.push({
				costMovementId: o.id,
				invoiceLineId: a.id,
				fulfilmentId: e.id,
				productId: i.productId,
				unitId: i.unitId,
				baseUnitId: o.baseUnitId,
				siteId: e.siteId,
				description: a.description,
				conversionToBase: i.conversionToBase,
				availableQuantity: Math.floor(Math.max(0, -o.quantityBase - s) / i.conversionToBase * 1e4 + 1e-8) / 1e4,
				originalQuantityBase: -o.quantityBase,
				originalValue: -o.valueChange,
				unitCostBase: o.unitCostBase,
				dispatchDate: e.fulfilmentDate
			});
		}
	}
	return n;
}
m("physicalCustomerReturns", {
	repository: {
		create(e) {
			let t = k.require("sales.payment"), n = Ru.parse(e), r = JSON.stringify(n), i = Vu.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already used with different customer return data.");
				return i;
			}
			T(n.returnDate), _n(n.returnDate), M();
			let a = R.getAll().find((e) => e.id === n.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || n.returnDate < a.documentDate) throw Error("Select an issued invoice and a return date on or after it.");
			let o = Ju(a.id), s = /* @__PURE__ */ new Set(), c = n.lines.map((e) => {
				if (s.has(e.costMovementId)) throw Error("Select each original dispatch cost only once.");
				s.add(e.costMovementId);
				let t = o.find((t) => t.costMovementId === e.costMovementId && t.invoiceLineId === e.invoiceLineId);
				if (!t || e.quantity > t.availableQuantity + 1e-8 || n.returnDate < t.dispatchDate) throw Error("Return exceeds dispatched quantities or precedes dispatch.");
				let r = it(t.productId), i = la.getById(t.siteId), c = a.lines.find((t) => t.id === e.invoiceLineId);
				if (!r || !i || i.status !== "ACTIVE") throw Error("An active original receiving site and product are required.");
				if ((c.areaPerPack || r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(r.units.find((e) => e.id === t.unitId)?.code ?? "")) && !Number.isInteger(e.quantity)) throw Error("Return whole packs in whole quantities.");
				qu(t.siteId, t.productId, n.returnDate);
				let l = Gu(e.quantity * t.conversionToBase);
				if (l <= 0) throw Error("Return quantity rounds to zero.");
				let u = Vu.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === t.costMovementId), d = Ku(l + u.reduce((e, t) => e + t.quantityBase, 0) >= t.originalQuantityBase - 1e-8 ? t.originalValue - u.reduce((e, t) => e + t.inventoryValue, 0) : t.originalValue * l / t.originalQuantityBase);
				return {
					...t,
					quantity: e.quantity,
					quantityBase: l,
					inventoryValue: d
				};
			}), l = /* @__PURE__ */ new Map();
			for (let e of c) l.set(e.invoiceLineId, Gu((l.get(e.invoiceLineId) ?? 0) + e.quantity));
			let u = n.creditNoteId ? I.getById(n.creditNoteId) : void 0;
			if (n.creditNoteId) {
				if (!u || u.sourceInvoiceId !== a.id || ["VOID", "DRAFT"].includes(u.status) || u.creditDate > n.returnDate) throw Error("Select an issued credit for this invoice dated before receipt.");
				for (let [e, t] of l) {
					let n = u.lines.find((t) => t.id === e)?.quantity ?? 0;
					if (t + Vu.filter((e) => e.status === "POSTED" && e.creditNoteId === u.id).flatMap((e) => e.lines).filter((t) => t.invoiceLineId === e).reduce((e, t) => e + t.quantity, 0) > n + 1e-8) throw Error("Physical return exceeds the linked credit quantities.");
				}
			} else u = R.createCreditNoteFromInvoice({
				invoiceId: a.id,
				creditDate: n.returnDate,
				reason: n.reason,
				lines: [...l].map(([e, t]) => ({
					...a.lines.find((t) => t.id === e),
					quantity: t
				}))
			});
			let d = crypto.randomUUID(), f = "CRTN-" + String(Vu.length + 1).padStart(6, "0"), p = c.map((e) => {
				Ua.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = ma.create({
					movementType: "RETURN_IN",
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase,
					transactionUnitId: e.unitId,
					transactionUnitSymbol: a.lines.find((t) => t.id === e.invoiceLineId).unitSymbol,
					transactionQuantity: e.quantity,
					conversionToBase: e.conversionToBase,
					referenceType: "CUSTOMER_RETURN",
					referenceId: d,
					referenceNumber: f,
					salesOrderId: a.sourceSalesOrderId,
					occurredAt: n.returnDate,
					notes: n.reason
				}), r = Ra({
					siteId: e.siteId,
					productId: e.productId,
					quantityBase: e.quantityBase,
					unitCostBase: e.unitCostBase,
					inventoryValue: e.inventoryValue,
					referenceType: "CUSTOMER_RETURN",
					referenceId: d,
					referenceNumber: f,
					inventoryMovementId: t.id,
					occurredAt: n.returnDate,
					notes: n.reason
				}).movement;
				return {
					costMovementId: e.costMovementId,
					invoiceLineId: e.invoiceLineId,
					fulfilmentId: e.fulfilmentId,
					productId: e.productId,
					unitId: e.unitId,
					baseUnitId: e.baseUnitId,
					siteId: e.siteId,
					description: e.description,
					quantity: e.quantity,
					conversionToBase: e.conversionToBase,
					quantityBase: e.quantityBase,
					inventoryValue: e.inventoryValue,
					unitCostBase: e.unitCostBase,
					movementId: t.id,
					restoredCostId: r.id
				};
			}), m = Ku(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? F.post({
				journalDate: n.returnDate,
				description: "Customer goods returned " + f,
				sourceType: "CUSTOMER_RETURN",
				sourceId: d,
				lines: [{
					accountId: P.requireBySystemRole("INVENTORY").id,
					debit: m,
					credit: 0
				}, {
					accountId: P.requireBySystemRole("COST_OF_GOODS_SOLD").id,
					debit: 0,
					credit: m
				}]
			}) : void 0, g = {
				id: d,
				number: f,
				operationId: n.operationId,
				fingerprint: r,
				invoiceId: a.id,
				invoiceNumber: a.documentNumber,
				customerId: a.customerId,
				creditNoteId: u.id,
				ownsCredit: !n.creditNoteId,
				returnDate: n.returnDate,
				reason: n.reason,
				status: "POSTED",
				lines: p,
				inventoryValue: m,
				journalId: h?.id,
				createdBy: t.userId,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			return Vu = [g, ...Vu], Wu(), g;
		},
		reverse(e) {
			let t = k.require("sales.payment"), n = w({
				id: U,
				reversalDate: U,
				reason: y().trim().min(3).max(2e3)
			}).strict().parse(e), r = Vu.find((e) => e.id === n.id);
			if (!r) throw Error("Customer return not found.");
			if (r.status === "REVERSED") return r;
			if (T(n.reversalDate), _n(n.reversalDate), M(), n.reversalDate < r.returnDate) throw Error("Reversal precedes the return.");
			let i = /* @__PURE__ */ new Map();
			for (let e of r.lines) {
				qu(e.siteId, e.productId, n.reversalDate);
				let t = e.siteId + "|" + e.productId, r = i.get(t) ?? {
					quantity: 0,
					value: 0
				};
				i.set(t, {
					quantity: Gu(r.quantity + e.quantityBase),
					value: Ku(r.value + e.inventoryValue)
				});
			}
			for (let [e, t] of i) {
				let [n, r] = e.split("|"), i = va.getBalance(n, r);
				if ((Ua.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t.quantity || (i?.inventoryValue ?? 0) + .001 < t.value || Math.abs((i?.quantityOnHand ?? 0) - t.quantity) < 1e-8 && Math.abs((i?.inventoryValue ?? 0) - t.value) > .001) throw Error("Returned stock/value has been used; restore stock availability before reversal.");
			}
			let a = I.getById(r.creditNoteId);
			if (r.ownsCredit && ((a.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > n.reversalDate) || I.getAllocationsByCreditNote(a.id).some((e) => (e.reversedAt ? S(e.reversedAt) : e.allocationDate) > n.reversalDate))) throw Error("Return reversal precedes later credit settlement activity.");
			Vu = Vu.map((e) => e.id === r.id ? {
				...e,
				status: "REVERSED"
			} : e), r.ownsCredit && R.voidCreditNote({
				creditNoteId: r.creditNoteId,
				reason: n.reason,
				voidDate: n.reversalDate
			});
			let o = r.lines.map((e) => {
				Ua.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = ma.create({
					movementType: "RETURN_OUT",
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: -e.quantityBase,
					transactionUnitId: e.unitId,
					transactionUnitSymbol: ma.getAll().find((t) => t.id === e.movementId)?.transactionUnitSymbol ?? "",
					transactionQuantity: -e.quantity,
					conversionToBase: e.conversionToBase,
					referenceType: "CUSTOMER_RETURN_VOID",
					referenceId: r.id,
					referenceNumber: r.number,
					occurredAt: n.reversalDate,
					notes: n.reason
				}), i = va.requireBalance(e.siteId, e.productId), a = Gu(i.quantityOnHand - e.quantityBase), o = Ku(i.inventoryValue - e.inventoryValue), s = a ? Yi(o / a) : 0;
				va.save({
					...i,
					quantityOnHand: a,
					inventoryValue: o,
					averageCostPerBaseUnit: s,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				});
				let c = wa.create({
					movementType: "RETURN_OUT",
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: -e.quantityBase,
					unitCostBase: e.unitCostBase,
					valueChange: -e.inventoryValue,
					quantityAfter: a,
					averageCostAfter: s,
					inventoryValueAfter: o,
					referenceType: "CUSTOMER_RETURN_VOID",
					referenceId: r.id,
					referenceNumber: r.number,
					inventoryMovementId: t.id,
					occurredAt: n.reversalDate,
					notes: n.reason
				});
				return {
					...e,
					reversalMovementId: t.id,
					reversalCostId: c.id
				};
			});
			r.journalId && F.reverse({
				journalEntryId: r.journalId,
				reversalDate: n.reversalDate,
				reason: n.reason
			});
			let s = {
				...r,
				lines: o,
				status: "REVERSED",
				reversalDate: n.reversalDate,
				reversalReason: n.reason,
				reversedBy: t.userId
			};
			return Vu = Vu.map((e) => e.id === r.id ? s : e), Wu(), s;
		}
	},
	read: "inventory.cost.read",
	commands: {
		create: "sales.payment",
		reverse: "sales.payment"
	},
	snapshot: () => ({ returns: Vu }),
	restore: (e) => {
		Vu = e.returns;
	},
	publish: Wu,
	validate: (e, t) => {
		let n = w({ returns: a(Bu) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
		for (let e of n.returns) {
			let t = Ru.parse(JSON.parse(e.fingerprint));
			if (T(e.returnDate), i.has(e.operationId) || t.operationId !== e.operationId || t.invoiceId !== e.invoiceId || t.returnDate !== e.returnDate || t.reason !== e.reason || t.lines.length !== e.lines.length || e.ownsCredit !== !t.creditNoteId || t.creditNoteId && t.creditNoteId !== e.creditNoteId) throw Error("Customer return request mismatch.");
			i.add(e.operationId);
			let n = r.sales.invoices.find((t) => t.id === e.invoiceId && t.customerId === e.customerId), a = r.customerCredits.creditNotes.find((t) => t.id === e.creditNoteId && t.sourceInvoiceId === e.invoiceId);
			if (!n || !a || e.status === "POSTED" && a.status === "VOID" || e.status === "REVERSED" && e.ownsCredit && a.status !== "VOID" || Ku(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue || new Set(e.lines.map((e) => e.costMovementId)).size !== e.lines.length) throw Error("Customer return source or totals mismatch.");
			for (let i of e.lines) {
				let a = t.lines.find((e) => e.costMovementId === i.costMovementId && e.invoiceLineId === i.invoiceLineId), s = r.costMovements.movements.find((e) => e.id === i.costMovementId), c = r.costMovements.movements.find((e) => e.id === i.restoredCostId), l = r.inventoryMovements.movements.find((e) => e.id === i.movementId), u = r.fulfilments.fulfilments.find((e) => e.id === i.fulfilmentId);
				if (!a || a.quantity !== i.quantity || !u || u.salesOrderId !== n.sourceSalesOrderId || !s || s.referenceType !== "SALE" || s.referenceId !== u.id || s.productId !== i.productId || s.siteId !== i.siteId || Gu(i.quantity * i.conversionToBase) !== i.quantityBase || !c || c.referenceType !== "CUSTOMER_RETURN" || c.referenceId !== e.id || c.inventoryMovementId !== i.movementId || c.quantityBase !== i.quantityBase || c.valueChange !== i.inventoryValue || !l || l.referenceId !== e.id || l.quantityBase !== i.quantityBase || S(c.occurredAt) !== e.returnDate) throw Error("Customer return inventory/cost references mismatch.");
				if (e.status === "POSTED") {
					if (u.status !== "ACTIVE") throw Error("Active customer return has a void dispatch.");
					let e = o.get(s.id) ?? {
						quantity: 0,
						value: 0
					}, t = {
						quantity: Gu(e.quantity + i.quantityBase),
						value: Ku(e.value + i.inventoryValue)
					};
					if (o.set(s.id, t), t.quantity > -s.quantityBase + 1e-8 || t.value > -s.valueChange + .001) throw Error("Customer returns exceed original dispatched stock/cost.");
				}
				if (e.status === "REVERSED") {
					let t = r.costMovements.movements.find((e) => e.id === i.reversalCostId);
					if (!t || t.referenceType !== "CUSTOMER_RETURN_VOID" || t.referenceId !== e.id || t.inventoryMovementId !== i.reversalMovementId || t.quantityBase !== -i.quantityBase || t.valueChange !== -i.inventoryValue || S(t.occurredAt) !== e.reversalDate) throw Error("Customer return reversal references mismatch.");
				}
			}
			if (e.status === "POSTED") for (let t of e.lines) {
				let n = e.creditNoteId + "|" + t.invoiceLineId, r = Gu((s.get(n) ?? 0) + t.quantity);
				if (s.set(n, r), !a.lines.some((e) => e.id === t.invoiceLineId && e.quantity + 1e-8 >= r)) throw Error("Customer returns exceed linked credit quantity.");
			}
			for (let t of new Set(e.lines.map((e) => e.invoiceLineId))) {
				let n = Gu(e.lines.filter((e) => e.invoiceLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!a.lines.some((e) => e.id === t && e.quantity + 1e-8 >= n)) throw Error("Customer return credit quantity mismatch.");
			}
			if (e.returnDate < n.documentDate || e.status === "POSTED" && e.reversalDate) throw Error("Customer return date/status mismatch.");
			if (e.reversalDate && T(e.reversalDate), e.status === "REVERSED" && (!e.reversalDate || e.reversalDate < e.returnDate || !e.reversalReason || !e.reversedBy)) throw Error("Customer return reversal metadata mismatch.");
			if (e.inventoryValue) {
				let t = r.journals.journalEntries.find((t) => t.id === e.journalId), n = r.accounts.accounts.find((e) => e.systemRole === "INVENTORY"), i = r.accounts.accounts.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
				if (!t || t.journalDate !== e.returnDate || t.lines.length !== 2 || !t.lines.some((t) => t.accountId === n.id && t.debit === e.inventoryValue && t.credit === 0) || !t.lines.some((t) => t.accountId === i.id && t.credit === e.inventoryValue && t.debit === 0)) throw Error("Customer return inventory journal accounts mismatch.");
				if (e.status === "REVERSED") {
					let a = r.journals.journalEntries.find((e) => e.id === t.reversalJournalEntryId);
					if (!a || a.reversedJournalEntryId !== t.id || a.journalDate !== e.reversalDate || a.lines.length !== 2 || !a.lines.some((t) => t.accountId === n.id && t.credit === e.inventoryValue && t.debit === 0) || !a.lines.some((t) => t.accountId === i.id && t.debit === e.inventoryValue && t.credit === 0)) throw Error("Customer return reversal journal mismatch.");
				}
			}
			if (e.inventoryValue && !r.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceType === "CUSTOMER_RETURN" && t.sourceId === e.id && t.totalDebit === e.inventoryValue && t.status === (e.status === "POSTED" ? "POSTED" : "REVERSED"))) throw Error("Customer return inventory journal mismatch.");
		}
		if (new Set(n.returns.map((e) => e.id)).size !== n.returns.length) throw Error("Duplicate customer return ID.");
		for (let e of r.journals.journalEntries) if (e.sourceType === "CUSTOMER_RETURN" && !e.reversedJournalEntryId && !n.returns.some((t) => t.id === e.sourceId && t.journalId === e.id)) throw Error("Orphan customer return journal.");
	}
});
//#endregion
//#region src/features/payroll/data/australianTax.ts
var Yu = [
	"Manual",
	"1",
	"2",
	"3",
	"4-resident",
	"4-foreign",
	"5",
	"6"
], Xu = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
], Zu = {
	1: [
		[
			188,
			.15,
			.15
		],
		[
			371,
			.2084,
			11.0185
		],
		[
			515,
			.179,
			.1066
		],
		[
			932,
			.3227,
			74.1674
		],
		[
			2246,
			.32,
			71.6508
		],
		[
			3303,
			.39,
			228.8816
		],
		[
			Infinity,
			.47,
			493.1893
		]
	],
	2: [
		[
			362,
			0,
			0
		],
		[
			538,
			.15,
			54.3462
		],
		[
			673,
			.25,
			108.2135
		],
		[
			721,
			.17,
			54.3473
		],
		[
			865,
			.179,
			60.8377
		],
		[
			1282,
			.3227,
			185.1935
		],
		[
			2596,
			.32,
			181.7319
		],
		[
			3653,
			.39,
			363.4627
		],
		[
			Infinity,
			.47,
			655.7704
		]
	],
	3: [
		[
			2596,
			.3,
			.3
		],
		[
			3653,
			.37,
			181.7308
		],
		[
			Infinity,
			.45,
			474.0385
		]
	],
	5: [
		[
			362,
			0,
			0
		],
		[
			721,
			.15,
			54.3462
		],
		[
			865,
			.159,
			60.8365
		],
		[
			1282,
			.3027,
			185.1923
		],
		[
			2596,
			.3,
			181.7308
		],
		[
			3653,
			.37,
			363.4615
		],
		[
			Infinity,
			.45,
			655.7692
		]
	],
	6: [
		[
			362,
			0,
			0
		],
		[
			721,
			.15,
			54.3462
		],
		[
			865,
			.159,
			60.8365
		],
		[
			908,
			.3027,
			185.1923
		],
		[
			1135,
			.3527,
			230.6135
		],
		[
			1282,
			.3127,
			185.1923
		],
		[
			2596,
			.31,
			181.7308
		],
		[
			3653,
			.38,
			363.4615
		],
		[
			Infinity,
			.46,
			655.7692
		]
	]
};
function Qu(e, t, n, r) {
	if (!Number.isFinite(e) || e < 0 || e > 1e9) throw Error("Invalid taxable earnings.");
	if (r < "2026-07-01" || r > "2027-06-30") throw Error("Automatic PAYG is available only for pay dates in 2026–27. Use a reviewed manual amount for another year.");
	if (t === "Manual") throw Error("Manual withholding must be entered explicitly.");
	if (t.startsWith("4-")) return Math.floor(Math.floor(e) * (t === "4-resident" ? .47 : .45) + 1e-9);
	let i = Math.round(e * 100);
	n === "Monthly" && i % 100 == 33 && i++;
	let a = n === "Weekly" ? i / 100 : n === "Fortnightly" ? i / 200 : n === "Monthly" ? i * 3 / 1300 : i / 1300, o = Math.floor(a + 1e-9) + .99, s = Zu[t]?.find(([e]) => o < e);
	if (!s) throw Error("Unsupported PAYG scale.");
	let c = Math.max(0, Math.round(s[1] * o - s[2]));
	return n === "Weekly" ? c : n === "Fortnightly" ? c * 2 : n === "Monthly" ? Math.round(c * 13 / 3) : c * 13;
}
//#endregion
//#region src/features/page-previews/catalog.ts
var W = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), G = (e, t, n) => W(e, t, "select", n), $u = (e, t, n = "0") => ({
	...W(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), ed = (e, t) => W(e, t, "date", void 0, "2026-10-16"), td = (e, t) => ({
	...G(e, t, [
		"1000 · Bank",
		"1100 · Receivables",
		"1200 · Inventory",
		"2000 · Payables",
		"2100 · GST",
		"2200 · Payroll clearing",
		"4000 · Sales",
		"5000 · Purchases",
		"5100 · Cost of goods sold",
		"6000 · Wages"
	]),
	value: {
		receivable: "1100 · Receivables",
		income: "4000 · Sales",
		inventory: "1200 · Inventory",
		cogs: "5100 · Cost of goods sold",
		gst: "2100 · GST",
		collected: "2100 · GST",
		paid: "2100 · GST",
		payroll: "2200 · Payroll clearing",
		clearing: "2200 · Payroll clearing",
		liability: "2200 · Payroll clearing",
		wages: "6000 · Wages",
		expense: "5000 · Purchases",
		account: "5000 · Purchases"
	}[e] ?? "1000 · Bank"
}), nd = [];
function rd(e, t, n, r, i, a, o, s, c) {
	nd.push({
		id: e,
		title: t,
		group: n,
		path: r,
		permission: i,
		description: a,
		fields: o,
		example: s,
		columns: o.slice(0, 4).map((e) => e.key),
		tabs: c
	});
}
rd("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	W("sku", "SKU"),
	G("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	G("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	$u("price", "Standard selling price", "49.50"),
	$u("cost", "Buying cost (sample)", "25"),
	$u("coverage", "m² per pack", "2.2"),
	G("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	$u("reorder", "Reorder point", "10"),
	$u("target", "Target stock", "50"),
	G("buy", "Available for purchasing", ["Yes", "No"]),
	G("sell", "Available for selling", ["Yes", "No"]),
	G("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	W("brand", "Brand"),
	W("category", "Category"),
	W("image", "Image URL (preview only)")
], {
	name: "Coastal Oak flooring",
	sku: "SAMPLE-OAK",
	brand: "HTT",
	category: "Flooring",
	image: "sample-oak.jpg"
}, [
	"Overview",
	"Units & conversion",
	"Buying & selling",
	"Reorder & stock"
]), rd("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	W("product", "Product / SKU"),
	W("customer", "Customer scope"),
	W("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	W("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	$u("price", "Promotional unit price", "45"),
	G("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	W("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), rd("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	W("code", "Tax code"),
	$u("rate", "Tax rate (%)", "15"),
	G("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	td("collected", "GST collected account"),
	td("paid", "GST paid account"),
	W("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), rd("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	G("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	td("receivable", "Receivables / payables control"),
	td("income", "Income / expense account"),
	td("inventory", "Inventory account"),
	td("cogs", "Cost of goods sold"),
	td("gst", "GST control account"),
	td("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), rd("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	W("code", "Job code"),
	W("customer", "Customer"),
	W("owner", "Project owner"),
	ed("starts", "Start date"),
	ed("ends", "End date"),
	$u("budget", "Revenue budget", "10000"),
	$u("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), rd("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	W("number", "Account number (sample only)"),
	W("bank", "Bank name"),
	G("currency", "Currency", ["NZD", "AUD"]),
	td("ledger", "Linked bank GL account"),
	G("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	ed("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), rd("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	G("match", "Match mode", ["All conditions", "Any condition"]),
	G("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	G("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	W("value", "Match text"),
	td("account", "Categorise to account"),
	G("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	G("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), rd("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	G("kind", "Batch type", ["Supplier payments", "Wages"]),
	ed("payDate", "Payment date"),
	W("bank", "Paying account"),
	W("reference", "Bank reference"),
	G("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	$u("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), rd("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "payroll.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	W("code", "Pay item code"),
	G("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	G("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	$u("rate", "Rate / amount", "30"),
	G("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	td("expense", "Expense account"),
	td("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), rd("filing", "Payroll filing", "Payroll", "/payroll/filing", "payroll.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	W("payrun", "Pay run reference"),
	ed("payDate", "Pay date"),
	W("employer", "Employer IRD identifier (sample)"),
	G("type", "Submission type", ["Employment information", "Amendment"]),
	W("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), rd("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
	G("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	W("contact", "Customer / supplier"),
	G("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	ed("next", "Next generation date"),
	ed("ends", "Schedule end date"),
	$u("total", "Template amount", "220"),
	G("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), rd("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	W("customer", "Customer / branch"),
	W("owner", "Assigned to"),
	ed("due", "Due date"),
	G("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	W("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), rd("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
	W("salesperson", "Salesperson"),
	W("customer", "Customer / branch"),
	W("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	W("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	W("outcome", "Visit outcome", "textarea"),
	W("location", "Recorded location")
], {
	name: "Sample showroom visit",
	salesperson: "Sample sales",
	customer: "Sample Flooring / North branch",
	outcome: "Discussed display refresh.",
	location: "Sample branch location"
}, [
	"Overview",
	"Notes & tasks",
	"Audit trail"
]), rd("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
	G("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	W("company", "Customer / company"),
	W("branch", "Branch"),
	W("email", "Email", "email"),
	W("phone", "Phone"),
	G("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	G("decision", "Review decision", [
		"Pending review",
		"Link existing",
		"Approve new",
		"Reject"
	])
], {
	name: "Sample imported contact",
	company: "Sample Flooring Ltd",
	branch: "North branch",
	email: "sample@example.invalid",
	phone: "000 000 000"
}, [
	"Overview",
	"Duplicate comparison",
	"Sync & review history"
]), rd("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	G("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	W("subject", "Email subject"),
	W("body", "Email body", "textarea"),
	W("footer", "PDF footer", "textarea"),
	G("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	G("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), rd("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
	G("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	W("columns", "Columns (comma separated)"),
	W("filter", "Filter expression (preview)"),
	G("basis", "Basis", ["Accrual", "Cash"]),
	G("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), rd("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
	W("company", "Company"),
	W("period", "Reporting period"),
	W("reports", "Included reports (comma separated)"),
	W("cover", "Cover heading"),
	W("introduction", "Cover note", "textarea")
], {
	name: "Monthly management pack",
	company: "Sample Flooring Ltd",
	period: "October 2026",
	reports: "Profit & loss, Balance sheet, Cash flow",
	cover: "Management report",
	introduction: "Illustrative management report pack."
}, [
	"Overview",
	"Cover & contents",
	"Combined preview"
]);
var id = nd;
[...new Set(nd.map((e) => e.group))], G("gst", "GST registration", ["Registered", "Not registered"]), G("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), $u("quoteNext", "Next quote number", "1001"), $u("orderNext", "Next order number", "1001"), $u("invoiceNext", "Next invoice number", "1001"), $u("creditNext", "Next credit number", "1001"), G("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), G("template", "Default template", ["Standard invoice", "Trade invoice"]), G("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), G("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), $u("next", "Next PO number", "1001"), G("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), td("expense", "Default expense account"), G("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), G("remittance", "Remittance preference", ["Preview before sending", "Manual"]), G("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), G("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), td("wages", "Wages expense account"), td("clearing", "Payroll clearing account"), G("bank", "Paying bank", ["Sample operating account"]), G("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), G("basis", "Default basis", ["Accrual", "Cash"]), G("currency", "Display currency", ["NZD", "AUD"]), G("precision", "Decimal places", ["2", "0"]), G("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), G("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function ad(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(id.map((e) => [e.id, [{
	...ad(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function od(e) {
	let t = [], n = [], r = "", i = !1, a = !1, o = () => {
		n.push(r), r = "", a = !1;
	}, s = () => {
		o(), n.some((e) => e.trim()) && t.push(n), n = [];
	};
	for (let t = 0; t < e.length; t++) {
		let n = e[t];
		if (i) n === "\"" ? e[t + 1] === "\"" ? (r += "\"", t++) : (i = !1, a = !0) : r += n;
		else if (n === "\"") {
			if (r || a) throw Error("Malformed CSV quote.");
			i = !0;
		} else if (n === ",") o();
		else if (n === "\n" || n === "\r") n === "\r" && e[t + 1] === "\n" && t++, s();
		else {
			if (a && n.trim()) throw Error("Unexpected text after a quoted field.");
			a || (r += n);
		}
	}
	if (i) throw Error("An opened CSV quote was not closed.");
	return (r || n.length || a) && s(), t;
}
//#endregion
//#region src/features/contact-review/reviewModel.ts
var sd = [
	"Customer",
	"Branch",
	"Contact"
], cd = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], ld = {
	Customer: {
		businessName: "",
		tradingName: "",
		abn: "",
		businessType: "Other",
		status: "ACTIVE",
		email: "",
		phone: "",
		website: "",
		creditLimit: 0,
		paymentTermsDays: 30
	},
	Branch: {
		name: "",
		addressLine1: "",
		addressLine2: "",
		suburb: "",
		state: "",
		postcode: "",
		country: "",
		phone: "",
		isPrimary: !1
	},
	Contact: {
		firstName: "",
		lastName: "",
		jobTitle: "",
		email: "",
		phone: "",
		mobile: "",
		locationId: "",
		isPrimary: !1,
		isAccounting: !1
	}
}, ud = s(y(), v([
	y().max(2e3),
	c().finite(),
	h()
]));
function dd(e, t) {
	let n = ud.parse(t), r = ld[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var fd = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), pd = (e) => String(e ?? "").trim().toLowerCase(), md = (e) => String(e ?? "").replace(/\D/g, ""), hd = (e, t, n = fd) => !!n(e) && n(e) === n(t);
function gd(e, t) {
	let n = [], r = e.values, i = (e, t, r, i, a) => {
		a.length && n.push({
			id: e,
			customerId: t,
			name: r,
			summary: i,
			reasons: a
		});
	};
	if (e.kind === "Customer") for (let e of t) {
		let t = [];
		(hd(r.businessName, e.businessName) || hd(r.businessName, e.tradingName) || hd(r.tradingName, e.businessName) || hd(r.tradingName, e.tradingName)) && t.push("Business/trading name"), hd(r.email, e.email, pd) && t.push("Email"), hd(r.phone, e.phone, md) && t.push("Phone"), hd(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
			e.code,
			e.status,
			e.email,
			e.phone
		].filter(Boolean).join(" · "), t);
	}
	else {
		let n = t.find((t) => t.id === e.customerId);
		if (!n) return [];
		if (e.kind === "Branch") for (let e of n.locations) {
			let t = [];
			hd(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && hd([
				r.addressLine1,
				r.addressLine2,
				r.suburb,
				r.state,
				r.postcode,
				r.country
			].join(" "), [
				e.addressLine1,
				e.addressLine2,
				e.suburb,
				e.state,
				e.postcode,
				e.country
			].join(" ")) && t.push("Address"), hd(r.phone, e.phone, md) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			hd([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), hd(r.email, e.email, pd) && t.push("Email"), (hd(r.phone, e.phone, md) || hd(r.phone, e.mobile, md) || hd(r.mobile, e.phone, md) || hd(r.mobile, e.mobile, md)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function _d(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/data-transfer/transferModel.ts
var vd = [
	"Customers",
	"Suppliers",
	"Customer branches",
	"Customer contacts",
	"Products"
], yd = ["Create", "Update by ID"], bd = "HTT-CSV-1", xd = {
	sku: "",
	name: "",
	category: "Other",
	brand: "",
	collection: "",
	description: "",
	status: "ACTIVE",
	itemType: "STOCK",
	buyEnabled: !0,
	sellEnabled: !0,
	reorderPoint: 0,
	targetStock: 0,
	wholePacks: !0,
	taxCode: "GST",
	baseUnitCode: "PIECE",
	unitsJson: JSON.stringify([{
		code: "PIECE",
		name: "Each",
		symbol: "each",
		conversionToBase: 1,
		basePrice: 0,
		isBaseUnit: !0,
		active: !0
	}])
}, Sd = {
	Customers: ld.Customer,
	Suppliers: {
		businessName: "",
		tradingName: "",
		abn: "",
		status: "ACTIVE",
		email: "",
		phone: "",
		website: "",
		contactName: "",
		addressLine1: "",
		addressLine2: "",
		suburb: "",
		state: "",
		postcode: "",
		country: "",
		paymentTermsDays: 30,
		taxRegistered: !1,
		notes: ""
	},
	"Customer branches": {
		customerId: "",
		...ld.Branch
	},
	"Customer contacts": {
		customerId: "",
		...ld.Contact
	},
	Products: xd
}, Cd = (e) => [
	"_format",
	"id",
	"recordToken",
	"externalId",
	...Object.keys(Sd[e])
], wd = {
	Customers: {
		read: "sales.read",
		write: "contacts.write"
	},
	Suppliers: {
		read: "purchases.read",
		write: "contacts.write"
	},
	"Customer branches": {
		read: "sales.read",
		write: "contacts.write"
	},
	"Customer contacts": {
		read: "sales.read",
		write: "contacts.write"
	},
	Products: {
		read: "inventory.read",
		write: "inventory.adjust"
	}
}, Td = w({
	dataset: g(vd),
	mode: g(yd),
	fileName: y().trim().min(1).max(200),
	text: y().max(1e6),
	mapping: s(y(), c().int().nonnegative()).optional()
}).strict();
function Ed(e) {
	if (e.text.includes("\0")) throw Error("CSV source must be text without NUL characters.");
	let t = od(e.text.replace(/^\uFEFF/, ""));
	if (t.length < 2 || t.length > 501) throw Error("Choose a CSV header and 1–500 data records.");
	let n = t[0].map((e) => e.trim());
	if (n.length > 64 || n.some((e) => !e || e.length > 120) || new Set(n.map((e) => e.toLowerCase())).size !== n.length) throw Error("CSV requires 1–64 distinct, nonempty column names of at most 120 characters.");
	if (t.slice(1).some((e) => e.length !== n.length || e.some((e) => e.length > 1e5))) throw Error("Each CSV record must match the header width; cells may not exceed 100,000 characters.");
	let r = Cd(e.dataset), i = e.mapping ?? Object.fromEntries(r.flatMap((e) => {
		let t = n.findIndex((t) => t.toLowerCase() === e.toLowerCase());
		return t < 0 ? [] : [[e, t]];
	}));
	if (Object.entries(i).some(([e, t]) => !r.includes(e) || t >= n.length)) throw Error("Column mapping contains an unsupported field or column index.");
	return {
		headers: n,
		mapping: i,
		rows: t.slice(1).map((e, t) => {
			let n = Object.fromEntries(Object.entries(i).map(([t, n]) => [t, e[n]]));
			if (n._format && n._format !== "HTT-CSV-1") throw Error("Unsupported HTT CSV export format.");
			if (n._format === "HTT-CSV-1") for (let e of Object.keys(n)) {
				let t = n[e];
				t.startsWith("'") && /^[=+@\-'\t\r]/.test(t.slice(1)) && (n[e] = t.slice(1));
			}
			for (let e of [
				"id",
				"recordToken",
				"externalId"
			]) n[e] && (n[e] = n[e].trim());
			return {
				row: t + 2,
				values: n
			};
		}),
		unmappedColumns: n.filter((e, t) => !Object.values(i).includes(t))
	};
}
function Dd(e) {
	return e.map((e) => e.map((e) => "\"" + (/^[=+@\-'\t\r]/.test(e) ? "'" + e : e).replaceAll("\"", "\"\"") + "\"").join(",")).join("\r\n");
}
//#endregion
//#region src/features/payroll/data/payrollModel.ts
var K = y().trim().min(1).max(200), Od = y().refine((e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !isNaN(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, "Use a valid date."), kd = y().trim().min(3).max(2e3), Ad = c().finite().min(0).max(1e9).refine((e) => Math.abs(e * 100 - Math.round(e * 100)) < 1e-5, "Use whole cents."), jd = c().finite().min(0).max(1e5).refine((e) => Math.abs(e * 1e4 - Math.round(e * 1e4)) < 1e-6, "Use at most four decimal places."), Md = w({
	actorId: K,
	at: Ee(),
	action: K,
	reason: kd,
	revision: c().int().positive()
}).strict(), Nd = {
	id: K,
	revision: c().int().positive(),
	history: a(Md).min(1)
}, Pd = w({
	code: y().trim().min(1).max(40),
	name: K,
	position: y().trim().max(200),
	email: _().or(i("")),
	startDate: Od,
	endDate: Od.or(i("")),
	status: g(["Active", "Inactive"]),
	basis: g(["Hourly", "Salary"]),
	rate: Ad,
	earningItemId: K,
	taxScale: g(Yu).default("Manual"),
	standardTaxConfirmed: h().default(!1),
	superFund: y().trim().max(200).default(""),
	superMemberId: y().trim().max(100).default(""),
	bankAccount: y().trim().max(100),
	taxIdentifier: y().trim().max(100),
	annualOpening: jd,
	personalOpening: jd
}).strict(), Fd = Pd.extend(Nd).strict(), Id = w({
	code: y().trim().min(1).max(40),
	name: K,
	category: g([
		"Earnings",
		"Allowance",
		"Deduction",
		"Tax",
		"Employer contribution"
	]),
	method: g([
		"Hourly",
		"Fixed",
		"Percentage"
	]),
	rate: Ad,
	taxable: h(),
	accountId: K,
	liabilityAccountId: y().trim().max(200),
	active: h()
}).strict(), Ld = Id.extend(Nd).strict(), Rd = w({
	netAccountId: K,
	taxItemId: K,
	currency: y().regex(/^[A-Z]{3}$/),
	region: i("Australia"),
	frequency: g(Xu).default("Fortnightly"),
	superItemId: K,
	employerName: K,
	employerIdentifier: y().trim().max(100)
}).strict(), zd = Rd.extend(Nd).strict(), Bd = w({
	employeeId: K,
	itemId: K,
	date: Od,
	hours: jd.refine((e) => e > 0),
	notes: y().trim().max(1e3)
}).strict(), Vd = Bd.extend({
	...Nd,
	status: g([
		"Draft",
		"Submitted",
		"Approved"
	])
}).strict(), Hd = w({
	employeeId: K,
	type: g([
		"Annual",
		"Personal",
		"Unpaid"
	]),
	start: Od,
	end: Od,
	hours: jd.refine((e) => e > 0),
	notes: y().trim().max(1e3)
}).strict(), Ud = Hd.extend({
	...Nd,
	status: g([
		"Pending",
		"Approved",
		"Declined",
		"Cancelled"
	])
}).strict(), Wd = w({
	employeeId: K,
	itemId: K,
	quantity: jd.refine((e) => e > 0),
	rate: Ad
}).strict(), Gd = w({
	name: K,
	start: Od,
	end: Od,
	payDate: Od,
	employeeInputs: a(w({
		employeeId: K,
		withholding: Ad,
		additionalWithholding: Ad.default(0),
		superMethod: g(["Reviewed amount", "12% reviewed QE"]).default("Reviewed amount"),
		superBase: Ad.default(0),
		superAmount: Ad.default(0),
		salaryOverride: Ad.optional(),
		annualAccrual: jd,
		personalAccrual: jd
	}).strict()).min(1).max(500),
	adjustments: a(Wd).max(2e3),
	taxReviewed: h(),
	reviewReference: y().trim().max(500)
}).strict(), Kd = w({
	item: Ld,
	quantity: jd,
	rate: Ad,
	amount: Ad,
	source: y().max(200)
}).strict(), qd = w({
	gross: Ad,
	taxable: Ad,
	deductions: Ad,
	net: Ad,
	employerCost: Ad,
	withholding: Ad
}).strict(), Jd = w({
	employee: Fd,
	lines: a(Kd).min(1),
	timeIds: a(K),
	leaveIds: a(K),
	annualAccrual: jd,
	personalAccrual: jd,
	totals: qd
}).strict(), Yd = Gd.extend({
	...Nd,
	status: g([
		"Draft",
		"Approved",
		"Posted",
		"Reversed",
		"Cancelled"
	]),
	slips: a(Jd).min(1),
	totals: qd,
	settings: zd,
	sourceToken: K,
	journalId: K.optional(),
	reversalJournalId: K.optional(),
	reversalDate: Od.optional()
}).strict(), Xd = w({
	...Nd,
	operationId: K,
	runId: K,
	accountId: K,
	bankAccountId: K,
	date: Od,
	amount: Ad.refine((e) => e > 0),
	reference: y().trim().max(200),
	status: g(["Posted", "Reversed"]),
	journalId: K,
	reversalJournalId: K.optional(),
	reversalDate: Od.optional()
}).strict(), Zd = w({
	...Nd,
	runId: K,
	status: g([
		"Prepared",
		"External reference recorded",
		"Correction needed"
	]),
	reference: y().trim().max(200),
	notes: y().trim().max(1e3),
	runRevision: c().int().positive()
}).strict(), Qd = w({
	employees: a(Fd),
	items: a(Ld),
	timesheets: a(Vd),
	leave: a(Ud),
	runs: a(Yd),
	payments: a(Xd),
	filings: a(Zd),
	settings: a(zd).max(1),
	receipts: a(w({
		operationId: K,
		fingerprint: y().regex(/^[a-f0-9]{64}$/),
		input: s(y(), ee()),
		actorId: K,
		entity: g([
			"employees",
			"items",
			"timesheets",
			"leave",
			"runs",
			"payments",
			"filings",
			"settings"
		]),
		recordId: K,
		revision: c().int().positive()
	}).strict())
}).strict(), $d = () => ({
	employees: [],
	items: [],
	timesheets: [],
	leave: [],
	runs: [],
	payments: [],
	filings: [],
	settings: [],
	receipts: []
}), ef = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function tf(e) {
	let t = (t) => ef(e.filter(t).reduce((e, t) => e + t.amount, 0)), n = (e) => ["Earnings", "Allowance"].includes(e.item.category), r = t(n), i = t((e) => ["Deduction", "Tax"].includes(e.item.category));
	return qd.parse({
		gross: r,
		taxable: t((e) => n(e) && e.item.taxable),
		deductions: i,
		net: ef(r - i),
		employerCost: t((e) => e.item.category === "Employer contribution"),
		withholding: t((e) => e.item.category === "Tax")
	});
}
function nf(e) {
	return qd.parse(Object.fromEntries(Object.keys(qd.shape).map((t) => [t, ef(e.reduce((e, n) => e + n.totals[t], 0))])));
}
//#endregion
//#region electron/security/payrollRepository.ts
var q = $d(), rf = (e) => Array.isArray(e) ? e.map(rf) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, rf(e[t])])) : e, af = (e) => we("sha256").update(JSON.stringify(rf(e))).digest("hex"), of = {
	operationId: K,
	reason: kd
}, sf = {
	id: K.optional(),
	expectedRevision: c().int().nonnegative()
};
function cf(e = "payroll.manage") {
	return k.require(e);
}
function J(e, t) {
	let n = q[e].find((e) => e.id === t);
	if (!n) throw Error("Payroll record was not found.");
	return n;
}
var lf = (e) => !["Cancelled", "Reversed"].includes(e.status);
function uf(e, t, n) {
	return q.runs.some((r) => r.id !== n && lf(r) && r.slips.some((n) => (e === "timesheets" ? n.timeIds : n.leaveIds).includes(t)));
}
function df(e, t) {
	return q[e] = [...q[e].filter((e) => e.id !== t.id), t], structuredClone(t);
}
function ff(e, t, n) {
	let r = (e?.revision ?? 0) + 1;
	return {
		id: e?.id ?? crypto.randomUUID(),
		revision: r,
		history: [...e?.history ?? [], {
			actorId: cf("payroll.read").userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			action: t,
			reason: n,
			revision: r
		}]
	};
}
function pf(e, t) {
	if ((e?.revision ?? 0) !== t) throw Error("Payroll record changed. Reload before editing.");
}
function mf(e, t, n) {
	let r = af({
		input: e,
		actorId: cf("payroll.read").userId
	}), i = q.receipts.find((t) => t.operationId === e.operationId);
	if (i) {
		if (i.fingerprint !== r || i.entity !== t) throw Error("Operation ID already has different payroll data.");
		return structuredClone(J(t, i.recordId));
	}
	let a = n();
	return q.receipts.push({
		operationId: e.operationId,
		fingerprint: r,
		input: structuredClone(e),
		actorId: cf("payroll.read").userId,
		entity: t,
		recordId: a.id,
		revision: a.revision
	}), Qd.parse(q), a;
}
function hf(e, t, n = !0) {
	let r = P.requireById(e);
	if (r.type !== t || n && !r.active || r.systemRole && (t !== "EXPENSE" || r.systemRole !== "OPERATING_EXPENSE")) throw Error(`Use a dedicated ${t.toLowerCase()} payroll account, not a bank, tax, AR/AP or stock control account.`);
	return r;
}
function gf(e, t = !0) {
	if (hf(e.accountId, [
		"Earnings",
		"Allowance",
		"Employer contribution"
	].includes(e.category) ? "EXPENSE" : "LIABILITY", t), e.category === "Employer contribution") hf(e.liabilityAccountId, "LIABILITY", t);
	else if (e.liabilityAccountId) throw Error("Only employer contributions use a second liability account.");
	if (["Earnings", "Allowance"].includes(e.category) && e.method === "Percentage" || e.category === "Tax" && e.method !== "Fixed") throw Error("Earnings use hourly/fixed values; withholding tax is an explicitly reviewed fixed amount.");
	if (e.method === "Percentage" && e.rate > 100) throw Error("Percentage rates cannot exceed 100.");
}
function _f(e) {
	let t = J("employees", e);
	if (t.status !== "Active") throw Error("Select an active employee.");
	return t;
}
function vf(e, t, n = t) {
	if (t < e.startDate || e.endDate && n > e.endDate) throw Error("Dates must be within the employment period.");
}
function yf(e) {
	let t = _f(e.employeeId);
	vf(t, e.date);
	let n = J("items", e.itemId);
	if (!n.active || n.category !== "Earnings" || t.basis === "Hourly" && n.method !== "Hourly" || t.basis === "Salary" && n.id !== t.earningItemId) throw Error("Select an appropriate employee earnings item.");
	gf(n);
}
function bf(e, t) {
	if (vf(_f(e.employeeId), e.start, e.end), e.start > e.end || e.hours > ((Date.parse(e.end) - Date.parse(e.start)) / 864e5 + 1) * 24) throw Error("Leave dates or hours are invalid.");
	if (q.leave.some((n) => n.id !== t && n.employeeId === e.employeeId && ["Pending", "Approved"].includes(n.status) && n.start <= e.end && n.end >= e.start)) throw Error("Leave request dates overlap.");
}
function xf() {
	let e = q.settings[0];
	if (!e) throw Error("Configure payroll settings first.");
	hf(e.netAccountId, "LIABILITY");
	let t = J("items", e.taxItemId);
	if (t.category !== "Tax" || !t.active) throw Error("Select an active fixed withholding item.");
	if (gf(t), e.netAccountId === t.accountId) throw Error("Net wages and withholding require separate liability accounts.");
	let n = J("items", e.superItemId);
	if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Use an active fixed super contribution item.");
	if (gf(n), e.currency !== "AUD" || e.currency !== x().currency) throw Error("Payroll currency must match the business currency.");
	return e;
}
function Sf(e, t) {
	let n = J("employees", e), r = n.annualOpening, i = n.personalOpening, a = /* @__PURE__ */ new Set();
	for (let n of q.runs.filter((e) => e.status === "Posted" && e.id !== t)) for (let t of n.slips.filter((t) => t.employee.id === e)) {
		r += t.annualAccrual, i += t.personalAccrual;
		for (let e of t.leaveIds) {
			let t = J("leave", e);
			a.add(e), t.type === "Annual" && (r -= t.hours), t.type === "Personal" && (i -= t.hours);
		}
	}
	let o = q.leave.filter((t) => t.employeeId === e && t.status === "Approved" && !a.has(t.id));
	return {
		annual: Math.round(r * 1e4) / 1e4,
		personal: Math.round(i * 1e4) / 1e4,
		reservedAnnual: o.filter((e) => e.type === "Annual").reduce((e, t) => e + t.hours, 0),
		reservedPersonal: o.filter((e) => e.type === "Personal").reduce((e, t) => e + t.hours, 0)
	};
}
function Cf(e, t) {
	let n = Sf(e, t);
	if (n.annual - n.reservedAnnual < -1e-5 || n.personal - n.reservedPersonal < -1e-5) throw Error("Approved leave exceeds the available recorded hours.");
}
var wf = () => af({
	employees: q.employees,
	items: q.items,
	timesheets: q.timesheets,
	leave: q.leave,
	settings: q.settings
});
function Tf(e, t) {
	if (e.start > e.end || e.payDate < e.end) throw Error("Pay date must follow a valid pay period.");
	let n = xf(), r = /* @__PURE__ */ new Set(), i = [];
	for (let a of e.employeeInputs) {
		if (r.has(a.employeeId)) throw Error("Include each employee only once.");
		r.add(a.employeeId);
		let o = _f(a.employeeId);
		if (o.startDate > e.end || o.endDate && o.endDate < e.start) throw Error("Employment does not overlap this pay period.");
		if (o.basis === "Salary" && (o.startDate > e.start || o.endDate && o.endDate < e.end) && a.salaryOverride === void 0) throw Error("Partial-period salary requires a reviewed salary override.");
		if (q.runs.some((n) => n.id !== t && lf(n) && n.start <= e.end && n.end >= e.start && n.slips.some((e) => e.employee.id === o.id))) throw Error("Employee already has an overlapping pay run. Cancel or reverse it before replacing it.");
		let s = J("items", o.earningItemId);
		if (!s.active || s.category !== "Earnings" || s.method !== (o.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Employee earning item does not match the pay basis.");
		gf(s);
		let c = q.timesheets.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.date >= e.start && t.date <= e.end), l = q.leave.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.start <= e.end && t.end >= e.start);
		if (l.some((t) => t.start < e.start || t.end > e.end)) throw Error("Split leave spanning pay periods before including it in payroll.");
		for (let e of c) yf(e);
		for (let e of l) bf(e, e.id);
		if (c.some((e) => uf("timesheets", e.id, t)) || l.some((e) => uf("leave", e.id, t))) throw Error("Hours or leave are already reserved by another pay run.");
		if (c.some((e) => l.some((t) => e.date >= t.start && e.date <= t.end))) throw Error("Approved timesheet and leave dates overlap; correct them before payroll.");
		if (o.basis === "Salary" && l.some((e) => e.type === "Unpaid") && a.salaryOverride === void 0) throw Error("Salary with unpaid leave requires an explicitly reviewed salary override.");
		if (o.basis === "Hourly" && a.salaryOverride !== void 0) throw Error("Hourly employees cannot use a salary override.");
		let u = [], d = (e, t, n, r) => {
			if (gf(e), !e.active) throw Error("Inactive pay item.");
			let i = ef(t * n);
			Ad.parse(i), u.push({
				item: structuredClone(e),
				quantity: t,
				rate: n,
				amount: i,
				source: r
			});
		};
		o.basis === "Salary" && d(s, 1, a.salaryOverride ?? o.rate, "Salary");
		for (let e of c) {
			if (o.basis === "Salary") {
				if (e.itemId !== s.id) throw Error("Salary timesheets record ordinary hours only; use an explicit adjustment for extra pay.");
				continue;
			}
			let t = J("items", e.itemId);
			if (t.category !== "Earnings" || t.method !== "Hourly") throw Error("Timesheet must use hourly earnings.");
			d(t, e.hours, t.id === s.id ? o.rate : t.rate, "Time:" + e.id);
		}
		if (o.basis === "Hourly") for (let e of l.filter((e) => e.type !== "Unpaid")) d(s, e.hours, o.rate, "Leave:" + e.id);
		let f = e.adjustments.filter((e) => e.employeeId === o.id), p = f.filter((e) => J("items", e.itemId).method !== "Percentage");
		for (let e of p) {
			let t = J("items", e.itemId);
			if (t.id === n.superItemId) throw Error("Use the employee super guarantee fields for the standard contribution.");
			if (t.category === "Tax") throw Error("Use the explicit employee withholding field for tax.");
			if (t.method === "Fixed" && e.quantity !== 1) throw Error("Fixed pay items require quantity 1.");
			d(t, e.quantity, e.rate, "Adjustment");
		}
		let m = ef(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
		if (m <= 0) throw Error("Each employee needs positive gross earnings.");
		for (let e of f.filter((e) => J("items", e.itemId).method === "Percentage")) {
			if (e.quantity !== 1 || e.rate > 100) throw Error("Percentage items require quantity 1 and rate 0–100.");
			d(J("items", e.itemId), 1, ef(m * e.rate / 100), "Adjustment"), u[u.length - 1].quantity = 1, u[u.length - 1].rate = e.rate;
		}
		let h = ef(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category) && e.item.taxable).reduce((e, t) => e + t.amount, 0)), g = a.withholding;
		if (o.taxScale !== "Manual") {
			if (!o.standardTaxConfirmed) throw Error("Confirm the standard PAYG case or use reviewed manual withholding.");
			if (!o.taxScale.startsWith("4-") && !/^\d{8,9}$/.test(o.taxIdentifier.replace(/\s/g, ""))) throw Error("Record a provided eight- or nine-digit TFN for the selected scale.");
			if (a.withholding !== 0) throw Error("Clear manual withholding for an automatic PAYG employee.");
			g = Qu(h, o.taxScale, n.frequency, e.payDate);
		}
		if (g = ef(g + a.additionalWithholding), d(J("items", n.taxItemId), 1, g, o.taxScale === "Manual" ? "Reviewed PAYG" : "ATO 2026–27 scale " + o.taxScale), a.superMethod === "12% reviewed QE" && (e.payDate < "2026-07-01" || e.payDate > "2027-06-30" || a.superBase > m)) throw Error("Reviewed qualifying earnings must not exceed gross and the 12% helper is limited to 2026–27. Use a reviewed super amount for exceptions.");
		let _ = a.superMethod === "12% reviewed QE" ? ef(a.superBase * .12) : a.superAmount;
		d(J("items", n.superItemId), 1, _, a.superMethod === "12% reviewed QE" ? "SG 12% reviewed QE" : "Reviewed SG amount");
		let v = tf(u);
		i.push({
			employee: structuredClone(o),
			lines: u,
			timeIds: c.map((e) => e.id),
			leaveIds: l.map((e) => e.id),
			annualAccrual: a.annualAccrual,
			personalAccrual: a.personalAccrual,
			totals: v
		});
	}
	if (e.adjustments.some((e) => !r.has(e.employeeId))) throw Error("Adjustment employee is not included in this run.");
	return {
		slips: i,
		totals: nf(i),
		settings: structuredClone(n),
		sourceToken: wf()
	};
}
function Ef(e) {
	let t = [];
	for (let n of e.slips) {
		for (let e of n.lines.filter((e) => e.amount > 0)) {
			let n = [
				"Earnings",
				"Allowance",
				"Employer contribution"
			].includes(e.item.category);
			t.push({
				accountId: e.item.accountId,
				debit: n ? e.amount : 0,
				credit: n ? 0 : e.amount
			}), e.item.category === "Employer contribution" && t.push({
				accountId: e.item.liabilityAccountId,
				debit: 0,
				credit: e.amount
			});
		}
		n.totals.net && t.push({
			accountId: e.settings.netAccountId,
			debit: 0,
			credit: n.totals.net
		});
	}
	return t;
}
function Df(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of Ef(e).filter((e) => e.credit)) t.set(n.accountId, ef((t.get(n.accountId) ?? 0) + n.credit));
	return [...t].map(([t, n]) => ({
		accountId: t,
		amount: n,
		paid: ef(q.payments.filter((n) => n.runId === e.id && n.accountId === t && n.status === "Posted").reduce((e, t) => e + t.amount, 0))
	}));
}
m("payroll", {
	repository: {
		balances(e) {
			return cf("payroll.read"), Sf(K.parse(e));
		},
		obligations(e) {
			return cf("payroll.read"), Df(J("runs", K.parse(e)));
		},
		setupDefaults(e) {
			cf(), k.require("accounting.post");
			let t = w(of).strict().parse(e);
			return mf(t, "settings", () => {
				if (q.settings.length) throw Error("Payroll is already configured.");
				let e = (e, t, n) => {
					for (; P.getAll().some((t) => t.code === String(e));) e++;
					return P.create({
						code: String(e),
						name: t,
						type: n,
						active: !0,
						allowManualPosting: n === "EXPENSE"
					}).id;
				}, n = e(6e3, "Payroll wages", "EXPENSE"), r = e(6010, "Payroll employer contributions", "EXPENSE"), i = e(2200, "Net wages payable", "LIABILITY"), a = e(2210, "Payroll withholding payable", "LIABILITY"), o = e(2220, "Payroll deductions payable", "LIABILITY"), s = e(2230, "Employer contributions payable", "LIABILITY"), c = (e, n, r, i, a, o = "") => {
					let s = {
						...ff(void 0, "Created", t.reason),
						code: e,
						name: n,
						category: r,
						method: i,
						rate: 0,
						taxable: ["Earnings", "Allowance"].includes(r),
						accountId: a,
						liabilityAccountId: o,
						active: !0
					};
					return q.items.push(s), s;
				};
				c("ORD", "Ordinary hours", "Earnings", "Hourly", n), c("SAL", "Salary per run", "Earnings", "Fixed", n);
				let l = c("TAX", "Reviewed withholding", "Tax", "Fixed", a);
				c("ALLOW", "Allowance", "Allowance", "Fixed", n), c("DEDUCT", "Employee deduction", "Deduction", "Fixed", o);
				let u = c("SG", "Super guarantee", "Employer contribution", "Fixed", r, s);
				return df("settings", {
					...ff(void 0, "Configured", t.reason),
					netAccountId: i,
					taxItemId: l.id,
					currency: x().currency,
					region: "Australia",
					frequency: "Fortnightly",
					superItemId: u.id,
					employerName: x().companyName,
					employerIdentifier: ""
				});
			});
		},
		saveEmployee(e) {
			cf();
			let t = w({
				...of,
				...sf,
				values: Pd
			}).strict().parse(e);
			return mf(t, "employees", () => {
				let e = t.id ? J("employees", t.id) : void 0;
				if (pf(e, t.expectedRevision), q.employees.some((n) => n.id !== e?.id && n.code.toLowerCase() === t.values.code.toLowerCase())) throw Error("Employee code already exists.");
				if (t.values.endDate && t.values.endDate < t.values.startDate) throw Error("Employment end date is before the start date.");
				let n = J("items", t.values.earningItemId);
				if (!n.active || n.category !== "Earnings" || n.method !== (t.values.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Select an active earning item matching the pay basis.");
				if (e && q.runs.some((t) => ["Posted", "Reversed"].includes(t.status) && t.slips.some((t) => t.employee.id === e.id)) && (e.annualOpening !== t.values.annualOpening || e.personalOpening !== t.values.personalOpening)) throw Error("Opening leave hours are locked after payroll posting.");
				return df("employees", {
					...t.values,
					...ff(e, e ? "Edited" : "Created", t.reason)
				});
			});
		},
		saveItem(e) {
			cf();
			let t = w({
				...of,
				...sf,
				values: Id
			}).strict().parse(e);
			return mf(t, "items", () => {
				let e = t.id ? J("items", t.id) : void 0;
				if (pf(e, t.expectedRevision), q.items.some((n) => n.id !== e?.id && n.code.toLowerCase() === t.values.code.toLowerCase())) throw Error("Pay item code already exists.");
				let n = {
					...t.values,
					...ff(e, e ? "Edited" : "Created", t.reason)
				};
				return gf(n), df("items", n);
			});
		},
		saveSettings(e) {
			cf();
			let t = w({
				...of,
				expectedRevision: c().int().nonnegative(),
				values: Rd
			}).strict().parse(e);
			return mf(t, "settings", () => {
				let e = q.settings[0];
				pf(e, t.expectedRevision), hf(t.values.netAccountId, "LIABILITY");
				let n = J("items", t.values.superItemId);
				if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Select an active fixed super guarantee item.");
				let r = J("items", t.values.taxItemId);
				if (r.category !== "Tax" || !r.active || r.accountId === t.values.netAccountId) throw Error("Use a valid withholding item and a separate net wages account.");
				if (t.values.currency !== "AUD" || t.values.currency !== x().currency) throw Error("Payroll currency must match the business.");
				return df("settings", {
					...t.values,
					...ff(e, "Settings changed", t.reason)
				});
			});
		},
		saveTime(e) {
			cf();
			let t = w({
				...of,
				...sf,
				values: Bd
			}).strict().parse(e);
			return mf(t, "timesheets", () => {
				let e = t.id ? J("timesheets", t.id) : void 0;
				if (pf(e, t.expectedRevision), e && (e.status !== "Draft" || uf("timesheets", e.id))) throw Error("Only an unreserved draft timesheet can be edited.");
				yf(t.values);
				let n = _f(t.values.employeeId), r = J("items", t.values.itemId);
				if (q.timesheets.filter((r) => r.id !== e?.id && r.employeeId === n.id && r.date === t.values.date).reduce((e, t) => e + t.hours, 0) + t.values.hours > 24) throw Error("Total timesheet hours cannot exceed 24 for one employee/day.");
				if (q.timesheets.some((i) => i.id !== e?.id && i.employeeId === n.id && i.itemId === r.id && i.date === t.values.date)) throw Error("A timesheet already exists for this employee, day and item.");
				return df("timesheets", {
					...t.values,
					...ff(e, e ? "Edited" : "Created", t.reason),
					status: "Draft"
				});
			});
		},
		changeTime(e) {
			let t = w({
				...of,
				id: K,
				expectedRevision: c().int().positive(),
				action: g([
					"Submit",
					"Approve",
					"Reopen"
				])
			}).strict().parse(e);
			return cf(t.action === "Approve" ? "payroll.approve" : "payroll.manage"), mf(t, "timesheets", () => {
				let e = J("timesheets", t.id);
				if (pf(e, t.expectedRevision), uf("timesheets", e.id)) throw Error("Timesheet is reserved by a pay run.");
				if (t.action === "Submit" && e.status !== "Draft" || t.action === "Approve" && e.status !== "Submitted" || t.action === "Reopen" && e.status === "Draft") throw Error("Invalid timesheet transition.");
				return t.action !== "Reopen" && yf(e), df("timesheets", {
					...e,
					...ff(e, t.action, t.reason),
					status: t.action === "Submit" ? "Submitted" : t.action === "Approve" ? "Approved" : "Draft"
				});
			});
		},
		saveLeave(e) {
			cf();
			let t = w({
				...of,
				...sf,
				values: Hd
			}).strict().parse(e);
			return mf(t, "leave", () => {
				let e = t.id ? J("leave", t.id) : void 0;
				if (pf(e, t.expectedRevision), e && (e.status !== "Pending" || uf("leave", e.id))) throw Error("Only an unreserved pending leave request can be edited.");
				return bf(t.values, e?.id), df("leave", {
					...t.values,
					...ff(e, e ? "Edited" : "Created", t.reason),
					status: "Pending"
				});
			});
		},
		changeLeave(e) {
			let t = w({
				...of,
				id: K,
				expectedRevision: c().int().positive(),
				action: g([
					"Approve",
					"Decline",
					"Cancel",
					"Reopen"
				])
			}).strict().parse(e);
			return cf(t.action === "Approve" || t.action === "Decline" ? "payroll.approve" : "payroll.manage"), mf(t, "leave", () => {
				let e = J("leave", t.id);
				if (pf(e, t.expectedRevision), uf("leave", e.id)) throw Error("Leave is reserved by a pay run.");
				if (["Approve", "Decline"].includes(t.action) && e.status !== "Pending" || t.action === "Cancel" && ["Cancelled", "Declined"].includes(e.status) || t.action === "Reopen" && !["Cancelled", "Declined"].includes(e.status)) throw Error("Invalid leave transition.");
				(t.action === "Approve" || t.action === "Reopen") && bf(e, e.id);
				let n = df("leave", {
					...e,
					...ff(e, t.action, t.reason),
					status: t.action === "Approve" ? "Approved" : t.action === "Decline" ? "Declined" : t.action === "Cancel" ? "Cancelled" : "Pending"
				});
				return n.status === "Approved" && Cf(e.employeeId), n;
			});
		},
		saveRun(e) {
			cf();
			let t = w({
				...of,
				...sf,
				values: Gd
			}).strict().parse(e);
			return mf(t, "runs", () => {
				let e = t.id ? J("runs", t.id) : void 0;
				if (pf(e, t.expectedRevision), e && e.status !== "Draft") throw Error("Only a draft pay run can be recalculated.");
				let n = Tf(t.values, e?.id);
				return df("runs", {
					...t.values,
					...ff(e, e ? "Recalculated" : "Created", t.reason),
					...n,
					status: "Draft"
				});
			});
		},
		changeRun(e) {
			let t = w({
				...of,
				id: K,
				expectedRevision: c().int().positive(),
				action: g([
					"Approve",
					"Reopen",
					"Cancel",
					"Post",
					"Reverse"
				]),
				date: Od.optional()
			}).strict().parse(e);
			return cf(t.action === "Approve" ? "payroll.approve" : ["Post", "Reverse"].includes(t.action) ? "payroll.post" : "payroll.manage"), mf(t, "runs", () => {
				let e = J("runs", t.id);
				if (pf(e, t.expectedRevision), t.action === "Approve" || t.action === "Post") {
					if (e.status !== (t.action === "Approve" ? "Draft" : "Approved")) throw Error("Invalid pay-run transition.");
					if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Confirm reviewed withholding and provide its reference.");
					if (e.sourceToken !== wf()) throw Error("Payroll sources changed. Reopen and recalculate the run.");
					if (af(Tf(Gd.parse(Object.fromEntries(Object.keys(Gd.shape).map((t) => [t, e[t]]))), e.id).slips) !== af(e.slips)) throw Error("Payroll calculation changed. Recalculate the run.");
				}
				if (t.action === "Approve") return df("runs", {
					...e,
					...ff(e, "Approved", t.reason),
					status: "Approved"
				});
				if (t.action === "Reopen") {
					if (e.status !== "Approved") throw Error("Only an approved run can be reopened.");
					return df("runs", {
						...e,
						...ff(e, "Reopened", t.reason),
						status: "Draft",
						taxReviewed: !1
					});
				}
				if (t.action === "Cancel") {
					if (!["Draft", "Approved"].includes(e.status)) throw Error("Only an unposted run can be cancelled.");
					return df("runs", {
						...e,
						...ff(e, "Cancelled", t.reason),
						status: "Cancelled"
					});
				}
				if (M(), t.action === "Post") {
					let n = F.post({
						journalDate: e.payDate,
						description: "Payroll " + e.name,
						reference: e.id,
						sourceType: "PAYROLL",
						sourceId: e.id,
						lines: Ef(e)
					}), r = df("runs", {
						...e,
						...ff(e, "Posted", t.reason),
						status: "Posted",
						journalId: n.id
					});
					return e.slips.forEach((e) => Cf(e.employee.id)), r;
				}
				if (e.status !== "Posted" || !t.date || t.date < e.payDate) throw Error("Reverse a posted run on or after its pay date.");
				if (q.payments.some((t) => t.runId === e.id && t.status === "Posted")) throw Error("Reverse recorded payroll payments before reversing the run.");
				let n = F.reverse({
					journalEntryId: e.journalId,
					reversalDate: t.date,
					reason: t.reason
				}), r = df("runs", {
					...e,
					...ff(e, "Reversed", t.reason),
					status: "Reversed",
					reversalJournalId: n.id,
					reversalDate: t.date
				});
				e.slips.forEach((e) => Cf(e.employee.id));
				for (let n of q.filings.filter((t) => t.runId === e.id)) df("filings", {
					...n,
					...ff(n, "Correction needed", t.reason),
					status: "Correction needed"
				});
				return r;
			});
		},
		recordPayment(e) {
			cf("payroll.post"), k.require("banking.write");
			let t = w({
				...of,
				runId: K,
				accountId: K,
				bankAccountId: K,
				date: Od,
				amount: Ad.refine((e) => e > 0),
				reference: y().trim().max(200)
			}).strict().parse(e);
			return mf(t, "payments", () => {
				M();
				let e = J("runs", t.runId);
				if (e.status !== "Posted" || t.date < e.payDate) throw Error("Record payment against a posted run on or after pay date.");
				let n = Df(e).find((e) => e.accountId === t.accountId);
				if (!n || t.amount > ef(n.amount - n.paid)) throw Error("Payment exceeds the outstanding payroll liability.");
				hf(t.accountId, "LIABILITY");
				let r = L.requireById(t.bankAccountId), i = P.requireById(r.glAccountId);
				if (!r.active || !i.active || i.type !== "ASSET" || r.currency !== e.settings.currency || t.date < r.openingBalanceDate) throw Error("Use an active bank in the payroll currency with a valid posting date.");
				let a = ff(void 0, "Payment recorded", t.reason), o = F.post({
					journalDate: t.date,
					description: "Payroll payment " + e.name,
					reference: t.reference,
					sourceType: "PAYROLL_PAYMENT",
					sourceId: a.id,
					lines: [{
						accountId: t.accountId,
						debit: t.amount,
						credit: 0
					}, {
						accountId: r.glAccountId,
						debit: 0,
						credit: t.amount
					}]
				}), { reason: s, ...c } = t;
				return df("payments", {
					...c,
					...a,
					status: "Posted",
					journalId: o.id
				});
			});
		},
		reversePayment(e) {
			cf("payroll.post"), k.require("banking.write");
			let t = w({
				...of,
				id: K,
				expectedRevision: c().int().positive(),
				date: Od
			}).strict().parse(e);
			return mf(t, "payments", () => {
				M();
				let e = J("payments", t.id);
				if (pf(e, t.expectedRevision), e.status !== "Posted" || t.date < e.date) throw Error("Reverse a posted payment on or after its date.");
				jt("PAYROLL_PAYMENT", e.id);
				let n = F.reverse({
					journalEntryId: e.journalId,
					reversalDate: t.date,
					reason: t.reason
				});
				return df("payments", {
					...e,
					...ff(e, "Payment reversed", t.reason),
					status: "Reversed",
					reversalJournalId: n.id,
					reversalDate: t.date
				});
			});
		},
		recordFiling(e) {
			cf();
			let t = w({
				...of,
				runId: K,
				expectedRevision: c().int().nonnegative(),
				reference: y().trim().max(200),
				notes: y().trim().max(1e3)
			}).strict().parse(e);
			return mf(t, "filings", () => {
				let e = J("runs", t.runId);
				if (e.status !== "Posted") throw Error("Prepare filing review only for a posted run.");
				let n = q.filings.find((t) => t.runId === e.id);
				return pf(n, t.expectedRevision), df("filings", {
					...ff(n, "Filing review recorded", t.reason),
					runId: e.id,
					runRevision: e.revision,
					reference: t.reference,
					notes: t.notes,
					status: t.reference ? "External reference recorded" : "Prepared"
				});
			});
		},
		exportSlip(e) {
			cf("payroll.read");
			let t = w({
				runId: K,
				employeeId: K
			}).strict().parse(e), n = J("runs", t.runId), r = n.slips.find((e) => e.employee.id === t.employeeId);
			if (!r) throw Error("Payslip was not found.");
			return {
				name: "Payslip-" + n.id + "-" + r.employee.code.replace(/[^A-Za-z0-9_-]/g, "_") + ".txt",
				text: [
					n.settings.employerName,
					"Employer ABN: " + (n.settings.employerIdentifier || "Not recorded"),
					"PAYSLIP · " + n.status,
					n.name,
					`${n.start} to ${n.end} · Pay date ${n.payDate} · ${n.settings.currency}`,
					r.employee.code + " · " + r.employee.name,
					"Super fund: " + (r.employee.superFund || "Not recorded") + " · Member: " + (r.employee.superMemberId || "Not recorded"),
					...r.lines.map((e) => `${e.item.name}: ${e.quantity} × ${e.rate} = ${e.amount.toFixed(2)}`),
					`Gross ${r.totals.gross.toFixed(2)} · Withholding ${r.totals.withholding.toFixed(2)} · Deductions ${r.totals.deductions.toFixed(2)} · Net ${r.totals.net.toFixed(2)} · Employer contributions ${r.totals.employerCost.toFixed(2)}`,
					"Withholding review: " + n.reviewReference,
					"Accrued payroll; payment completion is recorded separately."
				].join("\n")
			};
		},
		exportRun(e) {
			cf("payroll.read");
			let t = J("runs", K.parse(e)), n = [[
				"Employer",
				"ABN",
				"Frequency",
				"TFN",
				"Super fund",
				"Super member",
				"Run",
				"Status",
				"Period start",
				"Period end",
				"Pay date",
				"Currency",
				"Employee code",
				"Name",
				"Gross",
				"Taxable gross",
				"Withholding",
				"Other deductions",
				"Net",
				"Employer contributions",
				"Review reference"
			], ...t.slips.map((e) => [
				t.settings.employerName,
				t.settings.employerIdentifier,
				t.settings.frequency,
				e.employee.taxIdentifier,
				e.employee.superFund,
				e.employee.superMemberId,
				t.name,
				t.status,
				t.start,
				t.end,
				t.payDate,
				t.settings.currency,
				e.employee.code,
				e.employee.name,
				String(e.totals.gross),
				String(e.totals.taxable),
				String(e.totals.withholding),
				String(ef(e.totals.deductions - e.totals.withholding)),
				String(e.totals.net),
				String(e.totals.employerCost),
				t.reviewReference
			])];
			return {
				name: "Payroll-review-" + t.id + ".csv",
				csv: Dd(n)
			};
		}
	},
	read: "payroll.read",
	commands: {
		balances: "payroll.read",
		obligations: "payroll.read",
		setupDefaults: "payroll.manage",
		saveEmployee: "payroll.manage",
		saveItem: "payroll.manage",
		saveSettings: "payroll.manage",
		saveTime: "payroll.manage",
		changeTime: "payroll.manage",
		saveLeave: "payroll.manage",
		changeLeave: "payroll.manage",
		saveRun: "payroll.manage",
		changeRun: "payroll.manage",
		recordPayment: "payroll.post",
		reversePayment: "payroll.post",
		recordFiling: "payroll.manage",
		exportRun: "payroll.read",
		exportSlip: "payroll.read"
	},
	snapshot: () => q,
	restore: (e) => {
		q = e;
	},
	publish: () => {},
	validate: (e, t) => {
		let n = Qd.parse(e), r = t, i = r.accounts.accounts, a = r.journals.journalEntries, o = r.bankAccounts.bankAccounts, s = (e, t) => {
			let r = n[e].find((e) => e.id === t);
			if (!r) throw Error("Invalid payroll reference.");
			return r;
		}, c = (e, t) => {
			let n = i.find((t) => t.id === e);
			if (!n || n.type !== t || n.systemRole && (t !== "EXPENSE" || n.systemRole !== "OPERATING_EXPENSE")) throw Error("Invalid payroll account mapping.");
		};
		for (let e of [n.employees, n.items]) if (new Set(e.map((e) => e.code.toLowerCase())).size !== e.length) throw Error("Duplicate payroll code.");
		let l = /* @__PURE__ */ new Set();
		for (let e of [
			"employees",
			"items",
			"timesheets",
			"leave",
			"runs",
			"payments",
			"filings",
			"settings"
		]) for (let t of n[e]) {
			if (l.has(t.id)) throw Error("Duplicate payroll record ID.");
			if (l.add(t.id), t.history.length !== t.revision || t.history.some((e, t) => e.revision !== t + 1)) throw Error("Invalid payroll revision history.");
		}
		for (let e of n.items) if (c(e.accountId, [
			"Earnings",
			"Allowance",
			"Employer contribution"
		].includes(e.category) ? "EXPENSE" : "LIABILITY"), e.category === "Employer contribution" && c(e.liabilityAccountId, "LIABILITY"), e.method === "Percentage" && ([
			"Earnings",
			"Allowance",
			"Tax"
		].includes(e.category) || e.rate > 100) || e.category === "Tax" && e.method !== "Fixed") throw Error("Invalid payroll item method.");
		for (let e of n.settings) {
			if (e.currency !== "AUD" || s("items", e.superItemId).category !== "Employer contribution") throw Error("Invalid AU payroll settings.");
			if (c(e.netAccountId, "LIABILITY"), s("items", e.taxItemId).category !== "Tax" || e.netAccountId === s("items", e.taxItemId).accountId) throw Error("Invalid payroll settings.");
		}
		for (let e of n.employees) if (s("items", e.earningItemId), e.endDate && e.endDate < e.startDate) throw Error("Invalid employment dates.");
		for (let e of n.timesheets) s("employees", e.employeeId), s("items", e.itemId);
		for (let e of n.leave) if (s("employees", e.employeeId), e.start > e.end) throw Error("Invalid leave dates.");
		let u = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) {
				let e = t.get(n.accountId) ?? [0, 0];
				t.set(n.accountId, [ef(e[0] + n.debit), ef(e[1] + n.credit)]);
			}
			return [...t].filter(([, e]) => e[0] || e[1]).sort(([e], [t]) => e.localeCompare(t));
		};
		function d(e, t, n, r, i, o, s, c) {
			let l = a.find((t) => t.id === e);
			if (!l || l.sourceType !== t || l.sourceId !== n || l.journalDate !== r || af(u(l.lines)) !== af(u(i)) || l.status !== (o ? "REVERSED" : "POSTED")) throw Error("Payroll source journal mismatch.");
			if (o) {
				let e = a.find((e) => e.id === s);
				if (!e || e.reversedJournalEntryId !== l.id || l.reversalJournalEntryId !== e.id || e.journalDate !== c || af(u(e.lines)) !== af(u(i.map((e) => ({
					...e,
					debit: e.credit,
					credit: e.debit
				}))))) throw Error("Payroll reversal journal mismatch.");
			} else if (s || c) throw Error("Unexpected payroll reversal metadata.");
		}
		let f = /* @__PURE__ */ new Set();
		for (let e of n.runs) {
			if (e.start > e.end || e.payDate < e.end || new Set(e.employeeInputs.map((e) => e.employeeId)).size !== e.employeeInputs.length || e.slips.length !== e.employeeInputs.length || new Set(e.slips.map((e) => e.employee.id)).size !== e.slips.length) throw Error("Invalid payroll period or employees.");
			c(e.settings.netAccountId, "LIABILITY");
			for (let t of e.slips) {
				let n = s("employees", t.employee.id), r = e.employeeInputs.find((e) => e.employeeId === t.employee.id);
				if (!r || t.employee.revision > n.revision || r.annualAccrual !== t.annualAccrual || r.personalAccrual !== t.personalAccrual) throw Error("Invalid payroll employee snapshot.");
				let i = ef(t.lines.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
				for (let e of t.lines) {
					s("items", e.item.id), c(e.item.accountId, [
						"Earnings",
						"Allowance",
						"Employer contribution"
					].includes(e.item.category) ? "EXPENSE" : "LIABILITY"), e.item.category === "Employer contribution" && c(e.item.liabilityAccountId, "LIABILITY");
					let t = e.item.method === "Percentage" ? ef(i * e.rate / 100) : ef(e.quantity * e.rate);
					if (e.amount !== t) throw Error("Payroll line calculation mismatch.");
				}
				if (t.employee.taxScale !== "Manual" && (!t.employee.standardTaxConfirmed || r.withholding !== 0)) throw Error("Automatic PAYG declaration mismatch.");
				let a = t.lines.filter((t) => t.item.id === e.settings.superItemId), o = t.lines.filter((e) => e.item.category === "Tax");
				if (a.length !== 1 || a[0].amount !== (r.superMethod === "12% reviewed QE" ? ef(r.superBase * .12) : r.superAmount) || o.length !== 1 || o[0].item.id !== e.settings.taxItemId || new Set(t.timeIds).size !== t.timeIds.length || new Set(t.leaveIds).size !== t.leaveIds.length) throw Error("Payroll tax, super or source snapshot mismatch.");
				let l = ef((t.employee.taxScale === "Manual" ? r.withholding : Qu(t.totals.taxable, t.employee.taxScale, e.settings.frequency, e.payDate)) + r.additionalWithholding);
				if (af(tf(t.lines)) !== af(t.totals) || t.totals.withholding !== l) throw Error("Payroll payslip totals mismatch.");
				for (let [n, r] of [["timesheets", t.timeIds], ["leave", t.leaveIds]]) for (let i of r) {
					let r = s(n, i);
					if (r.employeeId !== t.employee.id) throw Error("Payroll hours belong to another employee.");
					if (lf(e)) {
						if (f.has(i) || r.status !== "Approved") throw Error("Payroll source is reused or unapproved.");
						let a = n === "timesheets" ? r.date : r.start, o = n === "timesheets" ? r.date : r.end;
						if (vf(t.employee, a, o), a < e.start || o > e.end) throw Error("Payroll source dates are outside the pay period.");
						let s = n === "timesheets" ? "Time:" : "Leave:", c = t.employee.basis === "Hourly" && (n === "timesheets" || r.type !== "Unpaid"), l = t.lines.filter((e) => e.source === s + i);
						if (c ? l.length !== 1 || l[0].quantity !== r.hours || l[0].item.id !== (n === "timesheets" ? r.itemId : t.employee.earningItemId) : l.length !== 0) throw Error("Payroll source hours do not match the frozen payslip.");
						f.add(i);
					}
				}
			}
			if (af(nf(e.slips)) !== af(e.totals)) throw Error("Payroll run totals mismatch.");
			if (["Posted", "Reversed"].includes(e.status)) {
				if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Posted payroll has no withholding review.");
				d(e.journalId, "PAYROLL", e.id, e.payDate, Ef(e), e.status === "Reversed", e.reversalJournalId, e.reversalDate);
			} else if (e.journalId || e.reversalJournalId) throw Error("Unposted payroll has journal metadata.");
		}
		for (let e of n.payments) {
			let t = s("runs", e.runId), n = o.find((t) => t.id === e.bankAccountId);
			if (!n || n.currency !== t.settings.currency || e.date < t.payDate || !["Posted", "Reversed"].includes(t.status) || e.status === "Posted" && t.status !== "Posted") throw Error("Invalid payroll payment source.");
			c(e.accountId, "LIABILITY"), d(e.journalId, "PAYROLL_PAYMENT", e.id, e.date, [{
				accountId: e.accountId,
				debit: e.amount,
				credit: 0
			}, {
				accountId: n.glAccountId,
				debit: 0,
				credit: e.amount
			}], e.status === "Reversed", e.reversalJournalId, e.reversalDate);
		}
		for (let e of n.runs) {
			let t = /* @__PURE__ */ new Map();
			for (let n of Ef(e).filter((e) => e.credit)) t.set(n.accountId, ef((t.get(n.accountId) ?? 0) + n.credit));
			for (let [r, i] of t) if (ef(n.payments.filter((t) => t.runId === e.id && t.accountId === r && t.status === "Posted").reduce((e, t) => e + t.amount, 0)) > i) throw Error("Payroll liabilities are overpaid.");
			if (n.payments.some((n) => n.runId === e.id && !t.has(n.accountId))) throw Error("Payment uses an unrelated payroll liability.");
		}
		for (let e of n.filings) {
			let t = s("runs", e.runId);
			if (!["Posted", "Reversed"].includes(t.status) || e.runRevision > t.revision || t.status === "Reversed" && e.status !== "Correction needed" || e.status === "External reference recorded" && !e.reference) throw Error("Invalid payroll filing review.");
		}
		for (let e of a.filter((e) => ["PAYROLL", "PAYROLL_PAYMENT"].includes(e.sourceType) && !e.reversedJournalEntryId)) if (!(e.sourceType === "PAYROLL" ? n.runs : n.payments).some((t) => t.id === e.sourceId && t.journalId === e.id)) throw Error("Orphan payroll journal.");
		for (let e of n.employees) {
			let t = e.annualOpening, r = e.personalOpening, i = /* @__PURE__ */ new Set();
			for (let a of n.runs.filter((e) => e.status === "Posted")) for (let n of a.slips.filter((t) => t.employee.id === e.id)) {
				t += n.annualAccrual, r += n.personalAccrual;
				for (let e of n.leaveIds) {
					let n = s("leave", e);
					i.add(e), n.type === "Annual" && (t -= n.hours), n.type === "Personal" && (r -= n.hours);
				}
			}
			for (let a of n.leave.filter((t) => t.employeeId === e.id && t.status === "Approved" && !i.has(t.id))) a.type === "Annual" && (t -= a.hours), a.type === "Personal" && (r -= a.hours);
			if (t < -1e-5 || r < -1e-5) throw Error("Payroll leave balances are negative.");
		}
		let p = /* @__PURE__ */ new Set();
		for (let e of n.receipts) {
			if (p.has(e.operationId)) throw Error("Duplicate payroll operation.");
			if (p.add(e.operationId), e.input.operationId !== e.operationId || af({
				input: e.input,
				actorId: e.actorId
			}) !== e.fingerprint) throw Error("Invalid payroll operation fingerprint.");
			if (s(e.entity, e.recordId).revision < e.revision) throw Error("Invalid payroll operation revision.");
		}
	}
});
//#endregion
//#region electron/security/documentRecycleRepository.ts
var Of = y().trim().min(1).max(200), kf = y().regex(/^[a-f0-9]{64}$/), Af = (e) => Array.isArray(e) ? e.map(Af) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, Af(e[t])])) : e, jf = (e) => we("sha256").update(JSON.stringify(Af(e))).digest("hex"), Mf = (e) => e === "Purchase order" || e === "Expense bill draft" ? "purchases.read" : "sales.read", Nf = (e) => e === "Quote" ? "sales.write" : e === "Purchase order" ? "purchases.write" : e === "Expense bill draft" ? "purchases.bill" : "sales.manage";
function Pf(e, t) {
	let [n, r] = ge[e];
	return (t[n]?.[r] ?? []).filter((t) => e === "Sales order draft" ? t.kind === "ORDER" : e !== "Invoice draft" || t.kind === "INVOICE");
}
function Ff(e, t, n) {
	let r = Pf(e, n).find((e) => e.id === t);
	if (!r) throw Error("Document was not found in the selected dataset.");
	return r;
}
function If(e, t, n) {
	let r = [];
	(t.status !== "DRAFT" || t.documentId) && r.push("Only unapproved, unposted drafts can be recycled.");
	let i = (e) => e === t.id || (Array.isArray(e) ? e.some(i) : !!e && typeof e == "object" && Object.values(e).some(i)), [a, o] = ge[e];
	for (let [e, s] of Object.entries(n)) [
		"documentRecycle",
		"attachments",
		"financialCache"
	].includes(e) || i(e === a ? {
		...s,
		[o]: s[o].filter((e) => e.id !== t.id)
	} : s) && r.push(`Referenced by ${e}; retain this draft for its linked workflow.`);
	return r;
}
function Lf(e, t = n()) {
	return ae.filter((t) => l(e, Mf(t))).flatMap((n) => Pf(n, t).map((r) => {
		let i = ye().findLast((e) => e.recordId === r.id), a = n === "Purchase order" || n === "Expense bill draft", o = a ? r.supplierId ?? r.payload?.supplierId : r.customerId ?? r.payload?.customerId;
		return {
			kind: n,
			party: (a ? t.suppliers?.suppliers : t.customers?.customers)?.find((e) => e.id === o)?.businessName ?? o ?? "",
			reference: r.customerReference ?? r.payload?.customerReference ?? r.payload?.supplierInvoiceNumber ?? r.supplierReference ?? "",
			recordId: r.id,
			label: r.documentNumber ?? r.purchaseOrderNumber ?? `${r.kind} · ${r.id}`,
			date: r.documentDate ?? r.orderDate ?? r.payload?.documentDate ?? "",
			status: r.status,
			total: r.totals.total,
			token: jf({
				record: r,
				lifecycle: i?.id ?? ""
			}),
			deleted: i?.action === "Trashed",
			last: i,
			canWrite: l(e, Nf(n)),
			issues: If(n, r, t)
		};
	}));
}
var Rf = w({
	operationId: Of,
	action: g(["Trashed", "Recovered"]),
	reason: y().trim().min(3).max(2e3),
	records: a(w({
		kind: g(ae),
		recordId: Of,
		token: kf
	}).strict()).min(1).max(100)
}).strict(), zf = w({
	id: Of,
	operationId: Of,
	fingerprint: kf,
	kind: g(ae),
	recordId: Of,
	action: g(["Trashed", "Recovered"]),
	actorId: Of,
	at: Ee(),
	reason: y().trim().min(3).max(2e3),
	recordToken: kf,
	contentToken: kf
}).strict();
m("documentRecycle", {
	repository: {
		list() {
			return Lf(k.require("inventory.read"));
		},
		detail(e, t) {
			return e = g(ae).parse(e), k.require("inventory.read"), k.require(Mf(e)), structuredClone(Ff(e, Of.parse(t), n()));
		},
		change(t) {
			let r = Rf.parse(t), i = k.require("inventory.read");
			r.records.forEach((e) => {
				k.require(Mf(e.kind)), k.require(Nf(e.kind));
			});
			let a = jf({
				input: r,
				actorId: i.userId
			}), o = ye().filter((e) => e.operationId === r.operationId);
			if (o.length) {
				if (o[0].fingerprint !== a) throw Error("Operation ID has different recycle data.");
				return structuredClone(o);
			}
			let s = n(), c = /* @__PURE__ */ new Set();
			for (let t of r.records) {
				if (c.has(t.recordId)) throw Error("Select each document only once.");
				c.add(t.recordId);
				let n = Ff(t.kind, t.recordId, s);
				if (jf({
					record: n,
					lifecycle: ye().findLast((e) => e.recordId === t.recordId)?.id ?? ""
				}) !== t.token) throw Error("Document changed. Refresh and review the selection again.");
				if (e(t.recordId) !== (r.action === "Recovered")) throw Error("Document recycle state changed. Refresh the selection.");
				let i = If(t.kind, n, s);
				if (i.length) throw Error(i.join(" "));
			}
			let l = (/* @__PURE__ */ new Date()).toISOString(), u = r.records.map((e) => ({
				id: crypto.randomUUID(),
				operationId: r.operationId,
				fingerprint: a,
				kind: e.kind,
				recordId: e.recordId,
				action: r.action,
				actorId: i.userId,
				at: l,
				reason: r.reason,
				recordToken: e.token,
				contentToken: jf(Ff(e.kind, e.recordId, s))
			}));
			return pe([...ye(), ...u]), structuredClone(u);
		}
	},
	read: "inventory.read",
	commands: {
		list: "inventory.read",
		detail: "inventory.read",
		change: "inventory.read"
	},
	snapshot: () => ({ history: ye() }),
	restore: (e) => pe(e.history),
	publish: () => {},
	view: (e) => ({ history: ye().filter((t) => l(e, Mf(t.kind))) }),
	validate: (e, t) => {
		let { history: n } = w({ history: a(zf) }).strict().parse(e), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
		for (let e of n) {
			if (r.has(e.id)) throw Error("Duplicate recycle event.");
			r.add(e.id);
			let a = Ff(e.kind, e.recordId, t);
			if ((i.get(e.recordId) ?? "Recovered") === e.action) throw Error("Invalid recycle lifecycle sequence.");
			if (!n.slice(n.indexOf(e) + 1).some((t) => t.recordId === e.recordId) && e.action === "Trashed" && (If(e.kind, a, t).length || jf(a) !== e.contentToken)) throw Error("Recycled document content or references changed.");
			i.set(e.recordId, e.action), o.set(e.operationId, [...o.get(e.operationId) ?? [], e]);
		}
		for (let e of o.values()) {
			let t = e[0], n = e.map((e) => ({
				kind: e.kind,
				recordId: e.recordId,
				token: e.recordToken
			}));
			if (new Set(n.map((e) => e.recordId)).size !== n.length || e.some((e) => e.fingerprint !== t.fingerprint || e.action !== t.action || e.actorId !== t.actorId || e.at !== t.at || e.reason !== t.reason) || jf({
				input: {
					operationId: t.operationId,
					action: t.action,
					reason: t.reason,
					records: n
				},
				actorId: t.actorId
			}) !== t.fingerprint) throw Error("Invalid recycle operation receipt.");
		}
	}
});
//#endregion
//#region src/features/contacts/schemas/supplierSchemas.ts
var Bf = ["ACTIVE", "INACTIVE"], Vf = y().trim().refine((e) => e === "" || y().email().safeParse(e).success, { message: "Enter a valid email address" }), Hf = y().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Uf = w({
	businessName: y().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: y().trim().max(120, "Trading name is too long"),
	abn: Hf,
	status: g(Bf),
	email: Vf,
	phone: y().trim().max(40, "Phone number is too long"),
	website: y().trim().max(200, "Website is too long"),
	contactName: y().trim().max(120, "Contact name is too long"),
	addressLine1: y().trim().max(160, "Address is too long"),
	addressLine2: y().trim().max(160, "Address is too long"),
	suburb: y().trim().max(100, "Suburb is too long"),
	state: y().trim().max(50, "State is too long"),
	postcode: y().trim().max(20, "Postcode is too long"),
	country: y().trim().min(1, "Country is required").max(100, "Country is too long"),
	paymentTermsDays: c({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days"),
	taxRegistered: h(),
	notes: y().trim().max(2e3, "Notes are too long")
}), Wf = w({
	id: y().min(1),
	code: g([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET",
		"HOUR",
		"JOB"
	]),
	name: y().trim().min(1),
	symbol: y().min(1),
	conversionToBase: c().finite().positive(),
	basePrice: c().finite().nonnegative(),
	isBaseUnit: h(),
	active: h()
}).strict(), Gf = w({
	id: y().min(1),
	sku: y().trim().min(1).max(80),
	name: y().trim().min(1).max(180),
	category: g([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: y().optional(),
	collection: y().optional(),
	description: y().optional(),
	status: g(["ACTIVE", "INACTIVE"]),
	baseUnitId: y().min(1),
	units: a(Wf).min(1),
	createdAt: y(),
	updatedAt: y(),
	revision: c().int().nonnegative().optional(),
	itemType: g([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: h().optional(),
	sellEnabled: h().optional(),
	reorderPoint: c().finite().nonnegative().optional(),
	targetStock: c().finite().nonnegative().optional(),
	wholePacks: h().optional(),
	taxCode: y().min(1).optional()
}).strict(), Kf = /* @__PURE__ */ new Set(), qf = [...rt];
function Jf() {
	qf = [...rt], Kf.forEach((e) => e());
}
function Yf(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => Yf(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => Yf(e, t, n));
}
function Xf(e) {
	let t = a(Gf).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), !et(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!et(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (et(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
var Zf = {
	subscribe(e) {
		return Kf.add(e), () => {
			Kf.delete(e);
		};
	},
	getSnapshot: () => qf,
	getAll: () => rt,
	getById: (e) => rt.find((t) => t.id === e),
	save(e, t) {
		let r = Gf.parse(e), i = rt.find((e) => e.id === r.id);
		if (i && t !== (i.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
		if (!i && t !== void 0) throw Error("Product no longer exists.");
		if (b(r.taxCode ?? "GST"), !et(r) && r.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
		let a = n();
		if (delete a.products, i) {
			let e = { ...a };
			if (delete e.costingPolicies, (i.itemType ?? "STOCK") !== (r.itemType ?? "STOCK") && Yf(e, r.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
			if (i.baseUnitId !== r.baseUnitId && Yf(a, r.id)) throw Error("A referenced product cannot change base unit.");
			for (let e of i.units) {
				let t = r.units.find((t) => t.id === e.id);
				if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && Yf(a, r.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
			}
		}
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			...r,
			createdAt: i?.createdAt ?? o,
			updatedAt: o,
			revision: (i?.revision ?? 0) + 1
		};
		return Xf([...rt.filter((e) => e.id !== r.id), s]), i ? rt.splice(rt.indexOf(i), 1, s) : rt.push(s), ka.ensureProductPolicy(s.id, s.baseUnitId, et(s)), i && et(i) !== et(s) && ka.setActive(s.id, et(s)), Jf(), s;
	}
};
m("products", {
	validate: (e, t) => {
		let n = Xf(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !et(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: Zf,
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(rt) }),
	restore: (e) => {
		let t = Xf(e.products);
		rt.splice(0, rt.length, ...t), qf = [...rt];
	},
	publish: Jf
});
//#endregion
//#region electron/security/transferRepository.ts
var Qf = y().trim().min(1).max(200), $f = y().trim().min(1).max(2e3), ep = (e) => Array.isArray(e) ? e.map(ep) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e < t ? -1 : +(e > t)).map(([e, t]) => [e, ep(t)])) : e, tp = (e) => we("sha256").update(JSON.stringify(ep(e))).digest("hex"), np = [], rp = (e, t = !1) => {
	k.require("inventory.read");
	let n = k.require(wd[e].read);
	return t && k.require(wd[e].write), n.userId;
};
function ip(e) {
	return e === "Customers" ? A.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Suppliers" ? Ni.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Products" ? Zf.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : A.getAll().flatMap((t) => (e === "Customer branches" ? t.locations : t.contacts).map((e) => ({
		id: e.id,
		parentId: t.id,
		raw: e
	})));
}
function ap(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(Sd[e])) n[r] = String(t.raw[r] ?? i);
	if ((e === "Customer branches" || e === "Customer contacts") && (n.customerId = t.parentId), e === "Products") {
		let e = t.raw;
		n.taxCode = e.taxCode ?? "", n.itemType = e.itemType ?? "STOCK", n.buyEnabled = String(e.buyEnabled ?? (e.itemType === void 0 || e.itemType === "STOCK")), n.baseUnitCode = e.units.find((t) => t.id === e.baseUnitId).code, n.unitsJson = JSON.stringify(e.units);
	}
	return n;
}
function op(e, t) {
	return {
		_format: bd,
		id: t.id,
		recordToken: tp({
			parentId: t.parentId,
			record: t.raw
		}),
		externalId: np.filter((t) => t.dataset === e).flatMap((e) => e.results).find((e) => e.action === "Created" && e.recordId === t.id)?.externalId ?? "",
		...ap(e, t)
	};
}
function sp(e, t) {
	if (!/^-?\d+(?:\.\d+)?$/.test(e) || !Number.isFinite(Number(e)) || Math.abs(Number(e)) > 2 ** 53 - 1) throw Error(`${t} must contain a safe plain number.`);
	return Number(e);
}
function cp(e, t, n) {
	let r = n ? ap(e, n) : { ...Sd[e] };
	for (let n of Object.keys(Sd[e])) if (Object.hasOwn(t, n)) {
		let i = t[n].trim();
		if (typeof Sd[e][n] == "number") r[n] = sp(i, n);
		else if (typeof Sd[e][n] == "boolean") {
			if (!["true", "false"].includes(i)) throw Error(`${n} must be true or false.`);
			r[n] = i === "true";
		} else r[n] = i.trim();
	}
	if (n) for (let [n, i] of Object.entries(Sd[e])) Object.hasOwn(t, n) || (typeof i == "number" && (r[n] = Number(r[n])), typeof i == "boolean" && (r[n] = r[n] === "true"));
	return r;
}
var lp = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), up = (e, t) => e.some((e) => e.reasons.some((n) => !t.some((t) => t.id === e.id && t.reasons.includes(n))));
function dp(e, t) {
	return t.map((t) => ({
		id: t.id,
		reasons: [
			...lp(t.businessName) === lp(e.businessName) ? ["Name"] : [],
			...e.email && t.email?.toLowerCase() === e.email.toLowerCase() ? ["Email"] : [],
			...e.abn && lp(t.abn) === lp(e.abn) ? ["Identifier"] : []
		]
	})).filter((e) => e.reasons.length);
}
function fp(e, t, n, r = !1) {
	let i = n.id ? ip(e).find((e) => e.id === n.id) : void 0;
	if (t === "Update by ID") {
		if (!i) throw Error("Existing record ID was not found.");
		if (!r && (!n.recordToken || n.recordToken !== op(e, i).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
	} else if (n.id || n.recordToken) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
	if (t === "Update by ID" && n.externalId && n.externalId !== op(e, i).externalId) throw Error("External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.");
	let o = t === "Update by ID" ? i : void 0, s = o ? op(e, o) : null, l = cp(e, n, o), u;
	if (e === "Customers") {
		let e = pt.strict().parse(l), t = A.getAll().filter((e) => e.id !== o?.id);
		if (up(gd({
			kind: "Customer",
			customerId: "",
			values: e
		}, t), o ? gd({
			kind: "Customer",
			customerId: "",
			values: o.raw
		}, t) : [])) throw Error("Possible existing customer duplicate. Use the customer review workflow or explicit ID update.");
		u = o ? A.update(o.id, e) : A.create(e);
	} else if (e === "Suppliers") {
		let e = Uf.strict().parse(l), t = Ni.getAll().filter((e) => e.id !== o?.id);
		if (up(dp(e, t), o ? dp(o.raw, t) : [])) throw Error("Possible existing supplier duplicate. Resolve it before import.");
		u = o ? Ni.update(o.id, e) : Ni.create(e);
	} else if (e === "Products") {
		let e = a(w({
			id: y().max(200).optional(),
			code: g([
				"M2",
				"LM",
				"BOX",
				"PIECE",
				"ROLL",
				"BUCKET",
				"HOUR",
				"JOB"
			]),
			name: y().trim().min(1).max(120),
			symbol: y().min(1).max(40),
			conversionToBase: c().finite().positive(),
			basePrice: c().finite().nonnegative(),
			isBaseUnit: h(),
			active: h()
		}).strict()).min(1).max(100).parse(JSON.parse(String(l.unitsJson))), t = o?.raw, r = e.map((e) => {
			let n = crypto.randomUUID();
			if (t) {
				if (e.id) {
					if (!t.units.some((t) => t.id === e.id)) throw Error("Unit ID does not belong to this product. Keep exported IDs; use an empty ID for a new unit.");
					n = e.id;
				} else if (!Object.hasOwn(e, "id")) {
					let r = t.units.filter((t) => t.code === e.code);
					if (r.length > 1) throw Error("Ambiguous unit code. Keep the unit IDs from the current export.");
					n = r[0]?.id ?? n;
				}
			}
			return {
				...e,
				id: n
			};
		}), i = r.find((e) => e.code === l.baseUnitCode && e.isBaseUnit);
		if (!i) throw Error("baseUnitCode must identify the primary product unit.");
		let { unitsJson: s, baseUnitCode: d, ...f } = l, p = (/* @__PURE__ */ new Date()).toISOString();
		if (f.taxCode === "" && delete f.taxCode, t) for (let e of [
			"brand",
			"collection",
			"description",
			"itemType",
			"buyEnabled",
			"sellEnabled",
			"reorderPoint",
			"targetStock",
			"wholePacks",
			"taxCode"
		]) !Object.hasOwn(n, e) && t[e] === void 0 && delete f[e];
		let m = Gf.parse({
			...f,
			id: o?.id ?? crypto.randomUUID(),
			baseUnitId: i.id,
			units: r,
			createdAt: t?.createdAt ?? p,
			updatedAt: p
		});
		u = Zf.save(m, t?.revision ?? (o ? 0 : void 0));
	} else {
		let t = String(l.customerId), n = A.getById(t);
		if (!n || n.status === "INACTIVE") throw Error("Select an existing, non-inactive parent customer.");
		if (o && o.parentId !== t) throw Error("Existing branch/contact cannot move to a different customer.");
		let { customerId: r, ...i } = l, a = e === "Customer branches" ? "Branch" : "Contact", s = a === "Branch" ? mt.strict().parse(i) : ht.strict().parse(i);
		if (up(gd({
			kind: a,
			customerId: t,
			values: s
		}, [n]).filter((e) => e.id !== o?.id), o ? gd({
			kind: a,
			customerId: t,
			values: o.raw
		}, [n]).filter((e) => e.id !== o.id) : [])) throw Error("Possible existing branch/contact duplicate. Use customer review or explicit ID update.");
		u = a === "Branch" ? o ? A.updateLocation(t, o.id, s) : A.addLocation(t, s) : o ? A.updateContact(t, o.id, s) : A.addContact(t, s);
	}
	let d = ip(e).find((e) => e.id === u.id);
	return {
		recordId: u.id,
		before: s,
		after: op(e, d)
	};
}
function pp(e) {
	if (rp(e.dataset, !0), Buffer.byteLength(e.text, "utf8") > 1e6) throw Error("CSV source exceeds 1 MB of UTF-8 text.");
	let t = Ed(e), r = new Map(ip(e.dataset).map((t) => [t.id, op(e.dataset, t)])), i = n(), a = tp({
		input: e,
		master: i
	}), o = /* @__PURE__ */ new Set(), s = [], c = [];
	try {
		for (let n of t.rows) {
			let t = n.values, i = (t.externalId ?? "").trim(), a = tp({
				dataset: e.dataset,
				values: Object.fromEntries(Object.keys(Sd[e.dataset]).filter((e) => Object.hasOwn(t, e)).map((e) => [e, t[e]]))
			}), l = e.mode === "Create" ? i : t.id, u = "", d;
			try {
				if (!l) throw Error(e.mode === "Create" ? "externalId is required for safe create retries." : "id is required for explicit updates.");
				if (l.length > 200 || i.length > 200) throw Error("Import identity exceeds 200 characters.");
				if (o.has(l)) throw Error("Repeated identity in this CSV file.");
				if (o.add(l), e.mode === "Create" && (t.id || t.recordToken)) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
				if (e.mode === "Update by ID" && (!r.has(t.id) || t.recordToken !== r.get(t.id).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
				let c = e.mode === "Create" ? np.filter((t) => t.dataset === e.dataset).flatMap((e) => e.results).find((e) => e.action === "Created" && e.externalId === i) : void 0;
				if (c) {
					if (c.identityFingerprint !== a) throw Error("Source externalId already contains different creation data. Use an explicit ID update.");
					let t = ip(e.dataset).find((e) => e.id === c.recordId);
					if (!t) throw Error("Prior imported record is missing.");
					d = {
						row: n.row,
						externalId: i,
						recordId: t.id,
						action: "Skipped",
						identityFingerprint: a,
						before: null,
						after: op(e.dataset, t)
					};
				} else {
					let o = fp(e.dataset, e.mode, t, !0);
					e.mode === "Update by ID" && (o.before = r.get(t.id)), d = {
						row: n.row,
						externalId: i,
						action: e.mode === "Create" ? "Created" : "Updated",
						identityFingerprint: a,
						...o
					};
				}
				s.push(d);
			} catch (e) {
				u = e instanceof Error ? e.message : "Validation failed.";
			}
			c.push({
				row: n.row,
				externalId: i,
				recordId: d?.recordId ?? t.id ?? "",
				name: t.businessName || t.name || [t.firstName, t.lastName].filter(Boolean).join(" ") || t.sku || t.id || i,
				action: d?.action ?? "Error",
				values: { ...t },
				errors: u ? [u] : []
			});
		}
		for (let t of c) {
			let n = s.find((e) => e.row === t.row);
			if (n) {
				let r = ip(e.dataset).find((e) => e.id === n.recordId), a = op(e.dataset, r);
				if (t.values = Object.fromEntries(Object.keys(Sd[e.dataset]).filter((e) => Object.hasOwn(a, e)).map((e) => [e, a[e]])), e.dataset === "Products") {
					let e = (i.products.products.find((e) => e.id === n.recordId)?.units ?? []).map((e) => e.id);
					t.values.unitsJson = JSON.stringify(JSON.parse(t.values.unitsJson).map((t) => ({
						...t,
						id: e.includes(t.id) ? t.id : "Assigned at commit"
					})));
				}
			}
		}
	} finally {
		xe(i);
	}
	return {
		preview: {
			fingerprint: a,
			headers: t.headers,
			mapping: t.mapping,
			unmappedColumns: t.unmappedColumns,
			rows: c,
			valid: c.every((e) => !e.errors.length)
		},
		results: s
	};
}
var mp = {
	review(e) {
		return pp(Td.parse(e)).preview;
	},
	commit(e) {
		let t = Td.extend({
			operationId: Qf,
			expectedPreview: y().regex(/^[a-f0-9]{64}$/),
			reason: $f
		}).strict().parse(e), n = rp(t.dataset, !0), { operationId: r, expectedPreview: i, reason: a, ...o } = t, s = tp({
			source: o,
			reason: a
		}), c = np.find((e) => e.operationId === r);
		if (c) {
			if (c.fingerprint !== s) throw Error("Operation ID already has different import data.");
			return structuredClone(c);
		}
		let l = pp(o);
		if (l.preview.fingerprint !== i) throw Error("Business records or import fields changed. Validate the file again.");
		if (!l.preview.valid) throw Error("Resolve every validation error before committing the batch.");
		let u = Ed(o), d = new Set(u.rows.map((e) => e.values.customerId || ip(o.dataset).find((t) => t.id === e.values.id)?.parentId || "")), f = (e) => JSON.stringify({
			primaryLocationId: e.primaryLocationId,
			primaryContactId: e.primaryContactId,
			locations: e.locations,
			contacts: e.contacts
		}), p = ["Customer branches", "Customer contacts"].includes(o.dataset) ? A.getAll().filter((e) => d.has(e.id)).map((e) => ({
			customerId: e.id,
			before: f(e)
		})) : [], m = [];
		for (let [e, t] of u.rows.entries()) {
			let n = l.results[e];
			n.action === "Skipped" ? m.push(n) : m.push({
				...n,
				...fp(o.dataset, o.mode, t.values, !0),
				before: n.before
			});
		}
		for (let e of m) {
			let t = ip(o.dataset).find((t) => t.id === e.recordId);
			e.after = op(o.dataset, t), e.action === "Created" && (e.after.externalId = e.externalId);
		}
		let h = {
			id: crypto.randomUUID(),
			operationId: r,
			fingerprint: s,
			dataset: o.dataset,
			mode: o.mode,
			fileName: o.fileName,
			sourceHash: we("sha256").update(o.text).digest("hex"),
			actorId: n,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			reason: a,
			results: m,
			parentChanges: p.map((e) => ({
				...e,
				after: f(A.getById(e.customerId))
			})).filter((e) => e.before !== e.after)
		};
		return _p.parse(h), np = [...np, h], structuredClone(h);
	},
	export(e) {
		e = g(vd).parse(e), rp(e);
		let t = Cd(e), n = ip(e).map((t) => op(e, t));
		return {
			dataset: e,
			count: n.length,
			csv: Dd([t, ...n.map((e) => t.map((t) => e[t] ?? ""))])
		};
	},
	template(e) {
		e = g(vd).parse(e), rp(e);
		let t = Cd(e).filter((e) => !["id", "recordToken"].includes(e)), n = {
			_format: bd,
			externalId: "replace-with-stable-source-id",
			...Object.fromEntries(Object.entries(Sd[e]).map(([e, t]) => [e, String(t)]))
		};
		return (e === "Customers" || e === "Suppliers") && (n.businessName = "Replace company name"), e === "Suppliers" && (n.country = "Replace country"), e === "Customer branches" && (n.name = "Replace branch name", n.addressLine1 = "Replace address", n.suburb = "Replace city", n.state = "Replace region", n.postcode = "Replace postcode", n.country = "Replace country"), e === "Customer contacts" && (n.firstName = "Replace", n.lastName = "Name", n.email = "replace@example.test"), e === "Products" && (n.sku = "REPLACE-SKU", n.name = "Replace product name"), Dd([t, t.map((e) => n[e] ?? "")]);
	}
}, hp = s(y(), y()), gp = w({
	row: c().int().min(2).max(501),
	externalId: y().max(200),
	recordId: Qf,
	action: g([
		"Created",
		"Updated",
		"Skipped"
	]),
	identityFingerprint: y().regex(/^[a-f0-9]{64}$/),
	before: hp.nullable(),
	after: hp
}).strict(), _p = w({
	id: Qf,
	operationId: Qf,
	fingerprint: y().regex(/^[a-f0-9]{64}$/),
	dataset: g(vd),
	mode: g(yd),
	fileName: Qf,
	sourceHash: y().regex(/^[a-f0-9]{64}$/),
	actorId: Qf,
	at: y().refine((e) => new Date(e).toISOString() === e),
	reason: $f,
	results: a(gp).min(1).max(500),
	parentChanges: a(w({
		customerId: Qf,
		before: y().max(5e6),
		after: y().max(5e6)
	}).strict()).max(500)
}).strict();
m("dataTransfers", {
	repository: mp,
	read: "inventory.read",
	commands: {
		review: "inventory.read",
		commit: "inventory.read",
		export: "inventory.read",
		template: "inventory.read"
	},
	snapshot: () => ({ runs: np }),
	restore: (e) => {
		np = e.runs;
	},
	publish: () => {},
	view: (e) => ({ runs: np.filter((t) => l(e, wd[t.dataset].read)) }),
	validate: (e, t) => {
		let n = w({ runs: a(_p) }).strict().parse(e), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
		for (let e of n.runs) {
			if (r.has(e.operationId)) throw Error("Duplicate import operation.");
			r.add(e.operationId);
			let n = e.dataset === "Products" ? t.products.products : e.dataset === "Suppliers" ? t.suppliers.suppliers : t.customers.customers, s = 1;
			for (let t of e.results) {
				if (t.row <= s) throw Error("Import result rows must be ordered.");
				if (s = t.row, !(e.dataset === "Customer branches" ? n.some((e) => e.locations.some((e) => e.id === t.recordId)) : e.dataset === "Customer contacts" ? n.some((e) => e.contacts.some((e) => e.id === t.recordId)) : n.some((e) => e.id === t.recordId)) || t.after.id !== t.recordId || t.before && t.before.id !== t.recordId || t.action === "Updated" && !t.before || t.action !== "Updated" && t.before) throw Error("Invalid imported record reference or before/after audit.");
				if (t.action === "Created") {
					if (e.mode !== "Create" || !t.externalId || i.has(e.dataset + ":" + t.externalId) || o.has(e.dataset + ":" + t.recordId)) throw Error("Invalid import source identity.");
					i.set(e.dataset + ":" + t.externalId, t), o.add(e.dataset + ":" + t.recordId);
				}
				if (t.action === "Skipped") {
					let n = i.get(e.dataset + ":" + t.externalId);
					if (e.mode !== "Create" || !n || n.recordId !== t.recordId || n.identityFingerprint !== t.identityFingerprint) throw Error("Invalid skipped import identity.");
				}
				if (t.action === "Updated" && e.mode !== "Update by ID") throw Error("Invalid import update mode.");
				if (t.before && (Object.keys(t.before).some((t) => !Cd(e.dataset).includes(t)) || t.before._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.before.recordToken))) throw Error("Invalid import before-state audit.");
				if (Object.keys(t.after).some((t) => !Cd(e.dataset).includes(t)) || t.after._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.after.recordToken)) throw Error("Invalid import audit fields.");
			}
			if (new Set(e.parentChanges.map((e) => e.customerId)).size !== e.parentChanges.length || e.parentChanges.length && !["Customer branches", "Customer contacts"].includes(e.dataset)) throw Error("Invalid import parent audit.");
			for (let t of e.parentChanges) {
				if (!n.some((e) => e.id === t.customerId)) throw Error("Invalid import parent reference.");
				for (let e of [t.before, t.after]) {
					let t = w({
						primaryLocationId: y().optional(),
						primaryContactId: y().optional(),
						locations: a(w({ id: Qf }).passthrough()),
						contacts: a(w({ id: Qf }).passthrough())
					}).strict().parse(JSON.parse(e));
					if (t.primaryLocationId && !t.locations.some((e) => e.id === t.primaryLocationId) || t.primaryContactId && !t.contacts.some((e) => e.id === t.primaryContactId)) throw Error("Invalid import primary-record audit.");
				}
			}
		}
	}
});
//#endregion
//#region electron/security/attachmentRepository.ts
var Y = y().trim().min(1).max(200), vp = y().trim().min(1).max(2e3), yp = y().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), bp = w({
	id: Y,
	number: c().int().positive(),
	name: Y,
	mime: Y,
	size: c().int().positive().max(u),
	sha256: y().regex(/^[a-f0-9]{64}$/),
	content: y().max(14e6),
	createdAt: yp,
	createdBy: Y,
	restoredFrom: Y.optional()
}).strict(), xp = w({
	id: Y,
	title: y().trim().min(1).max(200),
	target: r,
	revision: c().int().positive(),
	currentVersionId: Y,
	versions: a(bp).min(1).max(100),
	createdAt: yp,
	createdBy: Y,
	updatedAt: yp,
	updatedBy: Y,
	deletedAt: yp.optional(),
	deletedBy: Y.optional()
}).strict(), Sp = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), Cp = w({
	id: Y,
	documentId: Y,
	operationId: Y,
	action: g([
		"Uploaded",
		"Added version",
		"Restored version",
		"Renamed",
		"Trashed",
		"Recovered"
	]),
	actorId: Y,
	at: yp,
	revision: c().int().positive(),
	reason: vp,
	versionId: Y.optional(),
	fingerprint: y().regex(/^[a-f0-9]{64}$/),
	after: w({
		title: Y,
		deleted: h(),
		currentVersionId: Y,
		versionsCount: c().int().positive()
	}).strict()
}).strict(), wp = [], Tp = [];
function Ep() {
	return k.require("inventory.read");
}
var Dp = () => n([...new Set(Object.values(o).map((e) => e.repository))]);
function Op(e, t, n = Dp()) {
	return d(n, t).find((t) => t.kind === e.kind && t.id === e.id);
}
function kp(e, t = !1) {
	let n = Ep(), r = Op(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function Ap(e, t = !1) {
	let n = wp.find((t) => t.id === Y.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return kp(n.target, t), n;
}
var jp = (e) => we("sha256").update(JSON.stringify(e)).digest("hex"), Mp = (e, t) => {
	let n = Op(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function Np(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function Pp(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function Fp(e) {
	if (wp.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function Ip(e, t) {
	let n = Tp.find((t) => t.operationId === e);
	if (!n) return;
	let r = Ap(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return Mp(r, k.current());
}
function Lp(e, t, n, r, i, a) {
	return wp = [...wp.filter((t) => t.id !== e.id), e], Tp = [...Tp, {
		id: crypto.randomUUID(),
		documentId: e.id,
		operationId: n,
		fingerprint: r,
		action: t,
		actorId: e.updatedBy,
		at: e.updatedAt,
		revision: e.revision,
		reason: i,
		...a ? { versionId: a } : {},
		after: Sp(e)
	}], Mp(e, k.current());
}
m("attachments", {
	repository: {
		targets() {
			return d(Dp(), Ep());
		},
		checkTarget(e) {
			return kp(r.parse(e), !0), !0;
		},
		upload(e) {
			let t = w({
				operationId: Y,
				id: Y.optional(),
				expectedRevision: c().int().nonnegative(),
				target: r,
				title: Y,
				reason: vp,
				file: w({
					name: Y,
					content: y().max(14e6)
				}).strict()
			}).strict().parse(e), n = kp(t.target, !0), i = le(t.file.name, t.file.content), a = jp({
				...t,
				file: {
					name: i.name,
					sha256: i.sha256
				}
			}), o = Ip(t.operationId, a);
			if (o) return o;
			let s = t.id ? Ap(t.id, !0) : void 0;
			if (s) {
				if (Np(s, t.expectedRevision), JSON.stringify(s.target) !== JSON.stringify(t.target)) throw Error("An attachment retains its original business link.");
				if (s.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (s.versions.some((e) => e.sha256 === i.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (s.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (t.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!s && wp.some((e) => !e.deletedAt && e.target.kind === t.target.kind && e.target.id === t.target.id && e.versions.some((e) => e.sha256 === i.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			Fp(i.size);
			let l = (/* @__PURE__ */ new Date()).toISOString();
			s && Pp(s, l);
			let u = {
				...i,
				id: crypto.randomUUID(),
				number: (s?.versions.length ?? 0) + 1,
				createdAt: l,
				createdBy: n
			};
			return Lp({
				...s ?? {
					id: crypto.randomUUID(),
					target: t.target,
					createdAt: l,
					createdBy: n
				},
				title: s?.title ?? t.title,
				currentVersionId: u.id,
				versions: [...s?.versions ?? [], u],
				revision: (s?.revision ?? 0) + 1,
				updatedAt: l,
				updatedBy: n
			}, s ? "Added version" : "Uploaded", t.operationId, a, t.reason, u.id);
		},
		change(e) {
			let t = w({
				operationId: Y,
				id: Y,
				expectedRevision: c().int().positive(),
				action: g([
					"Renamed",
					"Trashed",
					"Recovered",
					"Restored version"
				]),
				reason: vp,
				title: Y.optional(),
				versionId: Y.optional()
			}).strict().parse(e), n = Ap(t.id, !0), r = jp(t), i = Ip(t.operationId, r);
			if (i) return i;
			Np(n, t.expectedRevision);
			let a = kp(n.target, !0), o = (/* @__PURE__ */ new Date()).toISOString();
			Pp(n, o);
			let s = {
				...n,
				versions: [...n.versions],
				revision: n.revision + 1,
				updatedBy: a,
				updatedAt: o
			}, l;
			if (t.action === "Trashed") {
				if (n.deletedAt) throw Error("Attachment is already in the recycle bin.");
				s.deletedAt = o, s.deletedBy = a;
			} else if (t.action === "Recovered") {
				if (!n.deletedAt) throw Error("Attachment is not in the recycle bin.");
				delete s.deletedAt, delete s.deletedBy;
			} else {
				if (n.deletedAt) throw Error("Recover the attachment before editing.");
				if (t.action === "Renamed") {
					if (!t.title) throw Error("Enter a document title.");
					s.title = t.title;
				} else {
					let e = n.versions.find((e) => e.id === t.versionId);
					if (!e) throw Error("Version not found.");
					if (e.id === n.currentVersionId) throw Error("That version is already current.");
					if (n.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
					Fp(e.size), ue(e);
					let r = {
						...e,
						id: crypto.randomUUID(),
						number: n.versions.length + 1,
						createdAt: o,
						createdBy: a,
						restoredFrom: e.id
					};
					s.versions.push(r), s.currentVersionId = r.id, l = r.id;
				}
			}
			return Lp(s, t.action, t.operationId, r, t.reason, l);
		},
		read(e) {
			let t = w({
				id: Y,
				versionId: Y
			}).strict().parse(e), n = Ap(t.id).versions.find((e) => e.id === t.versionId);
			if (!n) throw Error("Version not found.");
			return ue(n), { ...n };
		}
	},
	read: "inventory.read",
	commands: {
		targets: "inventory.read",
		checkTarget: "inventory.read",
		upload: "inventory.read",
		change: "inventory.read",
		read: "inventory.read"
	},
	snapshot: () => ({
		documents: wp,
		history: Tp
	}),
	restore: (e) => {
		wp = e.documents, Tp = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = wp.filter((t) => Op(t.target, e));
		return {
			documents: t.map((t) => Mp(t, e)),
			history: Tp.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (e, t) => {
		let n = w({
			documents: a(xp),
			history: a(Cp)
		}).strict().parse(e), r = /* @__PURE__ */ new Set(), i = 0;
		for (let e of n.documents) {
			let r = o[e.target.kind];
			if (!t[r.repository]?.[r.collection]?.some((t) => t.id === e.target.id)) throw Error("Invalid attachment business reference.");
			if (!!e.deletedAt != !!e.deletedBy) throw Error("Invalid attachment recycle metadata.");
			let a = /* @__PURE__ */ new Set();
			for (let [t, n] of e.versions.entries()) {
				if (ue(n), i += n.size, a.has(n.id) || n.number !== t + 1 || n.createdAt < e.createdAt || n.createdAt > e.updatedAt) throw Error("Invalid attachment version history.");
				if (n.restoredFrom && (!a.has(n.restoredFrom) || e.versions.find((e) => e.id === n.restoredFrom)?.sha256 !== n.sha256 || e.versions.find((e) => e.id === n.restoredFrom)?.name !== n.name)) throw Error("Invalid restored attachment version.");
				a.add(n.id);
			}
			if (!a.has(e.currentVersionId)) throw Error("Invalid current attachment version.");
			let s = n.history.filter((t) => t.documentId === e.id);
			if (s.length !== e.revision || s[0].action !== "Uploaded" || s[0].actorId !== e.createdBy || s[0].at !== e.createdAt) throw Error("Invalid attachment audit history.");
			let c = e.createdAt, l = 0, u = !1, d = "", f = "";
			for (let [t, n] of s.entries()) {
				if (n.revision !== t + 1 || n.at < c || n.at > e.updatedAt) throw Error("Invalid attachment audit ordering.");
				if (c = n.at, t > 0 && n.action !== "Renamed" && n.after.title !== f) throw Error("Attachment title changed without a rename event.");
				if (f = n.after.title, ![
					"Uploaded",
					"Added version",
					"Restored version"
				].includes(n.action) && n.versionId) throw Error("Unexpected attachment version reference.");
				if ([
					"Uploaded",
					"Added version",
					"Restored version"
				].includes(n.action)) {
					if (u || n.action === "Uploaded" && t !== 0) throw Error("Invalid attachment version event.");
					let r = e.versions[l++];
					if (!r || r.id !== n.versionId || r.createdBy !== n.actorId || r.createdAt !== n.at || !!r.restoredFrom != (n.action === "Restored version")) throw Error("Attachment version differs from its audit.");
					d = r.id;
				} else if (n.action === "Trashed") {
					if (u) throw Error("Repeated attachment trash event.");
					u = !0;
				} else if (n.action === "Recovered") {
					if (!u) throw Error("Invalid attachment recovery event.");
					u = !1;
				} else if (u) throw Error("Deleted attachment cannot be renamed.");
				if (n.after.versionsCount !== l || n.after.currentVersionId !== d || n.after.deleted !== u) throw Error("Attachment audit outcome is inconsistent.");
			}
			let p = s.at(-1);
			if (l !== e.versions.length || p.actorId !== e.updatedBy || p.at !== e.updatedAt || JSON.stringify(p.after) !== JSON.stringify(Sp(e))) throw Error("Attachment metadata differs from audit.");
			if (e.deletedAt && (e.deletedAt !== p.at || e.deletedBy !== p.actorId)) throw Error("Attachment deletion differs from audit.");
		}
		for (let e of n.history) {
			if (r.has(e.operationId) || !n.documents.some((t) => t.id === e.documentId)) throw Error("Invalid attachment operation identity.");
			r.add(e.operationId);
		}
		if (i > 5e7) throw Error("Attachment library exceeds 50 MB.");
	}
});
//#endregion
//#region src/features/job-costing/jobCostingService.ts
function Rp(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function zp(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || Rp(a.debit) !== Rp(r.credit) || Rp(a.credit) !== Rp(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = Rp(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
		return c ? [{
			journalId: n.id,
			lineId: r.id,
			rootJournalId: o.id,
			rootLineId: s.id,
			date: n.journalDate,
			number: n.journalNumber,
			description: r.description || n.description,
			reference: n.reference ?? "",
			sourceType: n.sourceType,
			sourceId: n.sourceId ?? "",
			accountId: a.id,
			accountCode: a.code,
			accountName: a.name,
			kind: a.type,
			amount: c / 100,
			capacity: Math.abs(c) / 100,
			reversal: !!n.reversedJournalEntryId,
			signature: JSON.stringify({
				journal: o,
				line: s,
				accountType: a.type
			})
		}] : [];
	}));
}
function Bp(e, t, n, r, i, a) {
	if (T(i, "From date"), T(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = zp(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = Rp(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = Rp(t.amount);
			return a -= r, {
				...e,
				jobId: t.jobId,
				jobName: n.find((e) => e.id === t.jobId)?.name ?? t.jobId,
				allocated: i * r / 100
			};
		});
		if (a < 0) throw Error("Project allocation exceeds source amount.");
		return [...o, ...a ? [{
			...e,
			jobId: "",
			jobName: "Unallocated",
			allocated: i * a / 100
		}] : []];
	}), c = (e) => {
		let t = 0, n = 0;
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += Rp(r.allocated) : n += Rp(r.allocated);
		return {
			revenue: t / 100,
			cost: n / 100,
			profit: (t - n) / 100,
			margin: t > 0 ? (t - n) / t * 100 : null
		};
	};
	return {
		from: i,
		to: a,
		rows: s,
		projects: n.map((e) => {
			let t = c(e.id), n = Rp(Math.round(Number(e.budget) * 100) / 100), r = Rp(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (Rp(t.revenue) - n) / 100,
				costVariance: (r - Rp(t.cost)) / 100,
				profitVariance: (Rp(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + Rp(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + Rp(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var Vp = y().trim().min(1).max(200), Hp = y().trim().min(1).max(2e3), Up = y().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Wp = w({
	jobId: Vp,
	amount: c().finite().positive().refine((e) => {
		try {
			return Rp(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), Gp = w({
	id: Vp,
	journalId: Vp,
	lineId: Vp,
	revision: c().int().positive(),
	splits: a(Wp).max(100),
	updatedAt: Up,
	updatedBy: Vp
}).strict(), Kp = w({
	id: Vp,
	operationId: Vp,
	recordId: Vp,
	revision: c().int().positive(),
	at: Up,
	actorId: Vp,
	reason: Hp,
	fingerprint: y().max(3e6),
	before: a(Wp),
	after: a(Wp)
}).strict(), qp = w({
	operationId: Vp,
	journalId: Vp,
	lineId: Vp,
	expectedRevision: c().int().nonnegative(),
	expectedSource: y().max(2e6),
	splits: a(Wp).max(100),
	reason: Hp
}).strict(), Jp = [], Yp = [], Xp = /* @__PURE__ */ new Set(), Zp = () => Xp.forEach((e) => e());
function Qp(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + Rp(t.amount), 0) > Rp(t)) throw Error("Project splits exceed the source amount.");
}
m("jobCosting", {
	repository: {
		subscribe(e) {
			return Xp.add(e), () => {
				Xp.delete(e);
			};
		},
		getSnapshot: () => Jp,
		review() {
			return k.require("accounting.read"), {
				lines: zp(F.getAll(), P.getAll()),
				allocations: structuredClone(Jp),
				history: structuredClone(Yp)
			};
		},
		report(e) {
			k.require("accounting.read");
			let t = w({
				from: y(),
				to: y()
			}).strict().parse(e);
			return Bp(F.getAll(), P.getAll(), C.jobs, Jp, t.from, t.to);
		},
		save(e) {
			let t = k.require("accounting.post"), n = qp.parse(e), r = JSON.stringify(n), i = Yp.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return Jp.find((e) => e.id === i.recordId);
			}
			let a = zp(F.getAll(), P.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			let o = Jp.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			Qp(n.splits, a.capacity, C.jobs);
			for (let e of n.splits) if (C.jobs.find((t) => t.id === e.jobId).status !== "Active" && o?.splits.find((t) => t.jobId === e.jobId)?.amount !== e.amount) throw Error("Only active projects can receive new or changed allocations.");
			let s = (/* @__PURE__ */ new Date()).toISOString();
			if (o && s < o.updatedAt) throw Error("System clock precedes the last allocation update.");
			let c = {
				id: o?.id ?? crypto.randomUUID(),
				journalId: a.journalId,
				lineId: a.lineId,
				revision: (o?.revision ?? 0) + 1,
				splits: n.splits,
				updatedBy: t.userId,
				updatedAt: s
			};
			return Jp = [...Jp.filter((e) => e.id !== c.id), c], Yp = [...Yp, {
				id: crypto.randomUUID(),
				operationId: n.operationId,
				recordId: c.id,
				revision: c.revision,
				at: s,
				actorId: t.userId,
				reason: n.reason,
				fingerprint: r,
				before: o?.splits ?? [],
				after: n.splits
			}], Zp(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: Jp,
		history: Yp
	}),
	restore: (e) => {
		Jp = e.allocations, Yp = e.history;
	},
	publish: Zp,
	validate: (e, t) => {
		let n = w({
			allocations: a(Gp),
			history: a(Kp)
		}).strict().parse(e), r = t.workspace_jobs.records, i = zp(t.journals.journalEntries, t.accounts.accounts), o = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
		for (let e of n.allocations) {
			let t = i.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), a = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || o.has(a)) throw Error("Invalid project source reference.");
			o.add(a), Qp(e.splits, t.capacity, r);
			let s = n.history.filter((t) => t.recordId === e.id);
			if (s.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], l = "";
			for (let [n, i] of s.entries()) {
				let a = qp.parse(JSON.parse(i.fingerprint));
				if (i.revision !== n + 1 || i.at < l || JSON.stringify(i.before) !== JSON.stringify(c) || a.journalId !== e.journalId || a.lineId !== e.lineId || a.operationId !== i.operationId || a.expectedRevision !== n || a.reason !== i.reason || JSON.stringify(a.splits) !== JSON.stringify(i.after)) throw Error("Invalid allocation history chain.");
				Qp(i.after, t.capacity, r), c = i.after, l = i.at;
			}
			let u = s.at(-1);
			if (JSON.stringify(c) !== JSON.stringify(e.splits) || u.at !== e.updatedAt || u.actorId !== e.updatedBy) throw Error("Allocation outcome differs from audit history.");
		}
		for (let e of n.history) {
			if (s.has(e.operationId) || !n.allocations.some((t) => t.id === e.recordId)) throw Error("Invalid allocation operation reference.");
			s.add(e.operationId);
		}
	}
});
//#endregion
//#region src/features/contact-review/reviewRepository.ts
var $p = y().trim().min(1).max(200), em = y().trim().max(2e3), tm = y().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), nm = w({
	operationId: $p,
	kind: g(sd),
	customerId: y().max(200).default(""),
	values: ud,
	source: g(cd).default("Manual"),
	externalId: y().trim().max(200).default(""),
	sourceReference: y().trim().max(500).default("")
}).strict(), rm = w({
	id: $p,
	action: $p,
	actorId: $p,
	at: tm,
	reason: em,
	data: y().max(2e6)
}).strict(), im = w({
	action: g([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: $p,
	at: tm,
	reason: em,
	fingerprint: y().max(1e4),
	customerId: y(),
	targetId: y(),
	snapshot: ee()
}).strict(), am = nm.extend({
	id: $p,
	state: g([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: c().int().positive(),
	createdBy: $p,
	createdAt: tm,
	updatedAt: tm,
	creationFingerprint: y().max(1e5),
	history: a(rm).min(1),
	decision: im.optional()
}).strict(), om = [], sm = /* @__PURE__ */ new Set(), cm = () => sm.forEach((e) => e());
function lm() {
	let e = k.require("contacts.write");
	return k.require("sales.read"), e.userId;
}
var um = () => (/* @__PURE__ */ new Date()).toISOString();
function dm(e) {
	let t = um();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var fm = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function pm(e) {
	let t = om.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function mm(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function hm(e) {
	return om = [...om.filter((t) => t.id !== e.id), e], cm(), e;
}
function gm(e) {
	let t = nm.parse(e);
	if (t.values = dd(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !A.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function _m(e, t) {
	return e === "Customer" ? pt.strict().parse(t) : e === "Branch" ? mt.strict().parse(t) : ht.strict().parse(t);
}
function vm(e, t, n) {
	let r = A.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var ym = {
	subscribe(e) {
		return sm.add(e), () => {
			sm.delete(e);
		};
	},
	getSnapshot: () => om,
	create(e) {
		let t = lm(), n = gm(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = om.find((e) => e.operationId === r) || n.externalId && om.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = um();
		return hm({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [fm("Received", t, s, "", i)]
		});
	},
	importBatch(e) {
		lm();
		let t = w({
			operationId: $p.max(150),
			drafts: a(nm.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(e);
		if (t.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return t.drafts.map((e, n) => ym.create({
			...e,
			operationId: t.operationId + ":" + n
		}));
	},
	update(e) {
		let t = lm(), n = w({
			id: $p,
			expectedRevision: c().int().positive(),
			customerId: y().max(200),
			values: ud
		}).strict().parse(e), r = pm(n.id);
		if (mm(r, n.expectedRevision), r.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let i = gm({
			operationId: r.operationId,
			kind: r.kind,
			customerId: n.customerId,
			values: n.values,
			source: r.source,
			externalId: r.externalId,
			sourceReference: r.sourceReference
		}), a = dm(r);
		return hm({
			...r,
			customerId: i.customerId,
			values: i.values,
			revision: r.revision + 1,
			updatedAt: a,
			history: [...r.history, fm("Updated", t, a, "", {
				customerId: i.customerId,
				values: i.values
			})]
		});
	},
	review(e) {
		k.require("sales.read");
		let t = pm($p.parse(e)), n = A.getAll(), r = "";
		try {
			if (_m(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: gd(t, n),
			masterSignature: _d(n),
			validationError: r
		};
	},
	decide(e) {
		let t = lm(), n = w({
			id: $p,
			expectedRevision: c().int().positive(),
			action: g([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: em,
			allowDuplicate: h().default(!1),
			targetId: y().max(200).default(""),
			expectedMaster: y().max(25e6).optional()
		}).strict().parse(e), r = pm(n.id), i = JSON.stringify({
			action: n.action,
			reason: n.reason,
			allowDuplicate: n.allowDuplicate,
			targetId: n.targetId
		});
		if (r.state !== "Pending") {
			if (r.decision?.fingerprint === i) return r;
			throw Error("This draft already has a different decision.");
		}
		mm(r, n.expectedRevision);
		let a = dm(r), o = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (n.action === "Reject") {
			if (!n.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = A.getAll();
			if (n.expectedMaster !== _d(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (n.action === "Link existing") {
				if (!n.reason) throw Error("Explain why this existing record is the correct match.");
				o = vm(r.kind, r.customerId, n.targetId);
			} else {
				if (gd(r, e).length && (!n.allowDuplicate || !n.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = _m(r.kind, r.values);
				if (r.kind === "Customer") {
					let e = A.create(t);
					o = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = A.getById(r.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = r.kind === "Branch" ? A.addLocation(e.id, t) : A.addContact(e.id, t);
					o = {
						customerId: e.id,
						targetId: n.id,
						snapshot: structuredClone(n)
					};
				}
			}
		}
		let s = {
			action: n.action,
			actorId: t,
			at: a,
			reason: n.reason,
			fingerprint: i,
			...o
		};
		return hm({
			...r,
			state: n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved",
			revision: r.revision + 1,
			updatedAt: a,
			decision: s,
			history: [...r.history, fm(n.action, t, a, n.reason, s)]
		});
	},
	reopen(e) {
		let t = lm(), n = w({
			id: $p,
			expectedRevision: c().int().positive(),
			reason: em.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(e), r = pm(n.id);
		if (mm(r, n.expectedRevision), r.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let i = dm(r), a = {
			...r,
			state: "Pending",
			revision: r.revision + 1,
			updatedAt: i,
			history: [...r.history, fm("Reopened", t, i, n.reason)]
		};
		return delete a.decision, hm(a);
	}
};
m("contactReviews", {
	repository: ym,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: om }),
	restore: (e) => {
		om = e.drafts;
	},
	publish: cm,
	validate: (e, t) => {
		let n = w({ drafts: a(am) }).strict().parse(e), r = t.customers.customers, i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let e of n.drafts) {
			let t = dd(e.kind, e.values);
			if (Object.keys(t).length !== Object.keys(e.values).length) throw Error("Missing review draft fields.");
			if (i.has(e.operationId) || e.externalId && o.has(e.source + ":" + e.externalId)) throw Error("Duplicate review intake identity.");
			i.add(e.operationId), e.externalId && o.add(e.source + ":" + e.externalId);
			let n = JSON.parse(e.creationFingerprint);
			if (e.history[0].data !== e.creationFingerprint) throw Error("Review source history is inconsistent.");
			if (n.kind !== e.kind || n.source !== e.source || n.externalId !== e.externalId || n.sourceReference !== e.sourceReference) throw Error("Review intake provenance is inconsistent.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.history[0].action !== "Received" || e.history[0].actorId !== e.createdBy || e.history[0].at !== e.createdAt || e.updatedAt < e.createdAt) throw Error("Invalid review history.");
			let a = "Pending", s = e.createdAt;
			for (let [t, n] of e.history.entries()) {
				if (n.at < s || n.at > e.updatedAt) throw Error("Invalid review event time.");
				s = n.at;
				let r = JSON.parse(n.data);
				if (!r || typeof r != "object" || Array.isArray(r)) throw Error("Invalid review event payload.");
				if (t !== 0) {
					if (n.action === "Updated") {
						if (a !== "Pending") throw Error("Invalid review edit history.");
					} else if (n.action === "Reopened") {
						if (a !== "Rejected" || !n.reason) throw Error("Invalid review reopen history.");
						a = "Pending";
					} else if ([
						"Approve new",
						"Link existing",
						"Reject"
					].includes(n.action)) {
						if (a !== "Pending") throw Error("Invalid repeated review decision.");
						a = n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved";
					} else throw Error("Unknown review history action.");
				}
			}
			if (a !== e.state || e.history.at(-1).at !== e.updatedAt) throw Error("Review history does not match current state.");
			if (e.kind === "Customer" && e.customerId || e.customerId && !r.some((t) => t.id === e.customerId)) throw Error("Review parent customer is invalid.");
			if (e.state === "Pending" != !e.decision) throw Error("Review state and decision are inconsistent.");
			if (e.decision) {
				let t = e.state === "Rejected" ? "Reject" : e.state === "Linked" ? "Link existing" : "Approve new", n = w({
					action: g([
						"Approve new",
						"Link existing",
						"Reject"
					]),
					reason: em,
					allowDuplicate: h(),
					targetId: y()
				}).strict().parse(JSON.parse(e.decision.fingerprint)), i = e.history.at(-1);
				if (n.action !== t || n.reason !== e.decision.reason || n.targetId !== (t === "Link existing" ? e.decision.targetId : "") || i.actorId !== e.decision.actorId || i.at !== e.decision.at || i.reason !== e.decision.reason || JSON.stringify(JSON.parse(i.data)) !== JSON.stringify(e.decision)) throw Error("Review decision audit is inconsistent.");
				if (e.decision.action !== t) throw Error("Invalid review decision.");
				if (t !== "Reject") {
					let n = r.find((t) => t.id === e.decision.customerId), i = e.kind === "Customer" ? n : e.kind === "Branch" ? n?.locations.find((t) => t.id === e.decision.targetId) : n?.contacts.find((t) => t.id === e.decision.targetId);
					if (!i || i.id !== e.decision.targetId || e.kind !== "Customer" && n.id !== e.customerId || e.decision.snapshot?.id !== i.id) throw Error("Invalid resolved review reference.");
					t === "Approve new" && _m(e.kind, e.values);
				} else if (!e.decision.reason || e.decision.customerId || e.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function bm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xm(e, t) {
	T(e, t);
}
function Sm(e, t, n, r) {
	if (xm(n, "From date"), xm(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = Cm(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = Cm(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = bm(a.reduce((e, t) => e + t.amount, 0)), c = bm(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = bm(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = bm(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = bm(d - f);
	return {
		fromDate: n,
		toDate: r,
		revenue: a,
		expenses: o,
		totalRevenue: s,
		salesRevenue: d,
		costOfGoodsSold: f,
		grossProfit: p,
		grossMarginPercent: d === 0 ? null : Math.round((p / d * 100 + 2 ** -52) * 100) / 100,
		operatingExpenses: bm(c - f),
		totalExpenses: c,
		netProfit: bm(s - c)
	};
}
function Cm(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = bm(r + t.debit), i = bm(i + t.credit));
		let a = bm(n === "REVENUE" ? i - r : r - i);
		return {
			accountId: e.id,
			accountCode: e.code,
			accountName: e.name,
			amount: a
		};
	}).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
//#endregion
//#region src/features/accounting/data/balanceSheetService.ts
function wm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Tm(e) {
	T(e);
}
function Em(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = wm(n + t.debit), r = wm(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? wm(n - r) : wm(r - n);
}
function Dm(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: Em(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function Om(e) {
	return wm(e.reduce((e, t) => e + t.amount, 0));
}
function km(e, t, n) {
	Tm(n);
	let r = t.filter((e) => e.journalDate <= n), i = Dm(e, r, "ASSET"), a = Dm(e, r, "LIABILITY"), o = Dm(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = wm(s.reduce((e, t) => e + Em(t, r), 0)), u = wm(c.reduce((e, t) => e + Em(t, r), 0)), d = Om(i), f = Om(a), p = Om(o), m = wm(l - u), h = wm(p + m), g = wm(f + h), _ = wm(d - g);
	return {
		asOfDate: n,
		assets: i,
		liabilities: a,
		equity: o,
		totalAssets: d,
		totalLiabilities: f,
		postedEquity: p,
		currentEarnings: m,
		totalEquity: h,
		totalLiabilitiesAndEquity: g,
		difference: _,
		balanced: _ === 0
	};
}
//#endregion
//#region src/features/accounting/data/trialBalanceService.ts
function Am(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function jm(e, t) {
	T(e, t);
}
function Mm(e, t) {
	let n = Am(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: Am(Math.abs(n))
	};
}
function Nm(e, t, n, r) {
	if (jm(n, "From date"), jm(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = Am(i + t.debit), a = Am(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = Am(o + t.debit), s = Am(s + t.credit));
		}
		let c = Mm(i, a), l = Mm(Am(i + o), Am(a + s));
		return {
			accountId: e.id,
			accountCode: e.code,
			accountName: e.name,
			accountType: e.type,
			openingDebit: c.debit,
			openingCredit: c.credit,
			periodDebit: o,
			periodCredit: s,
			closingDebit: l.debit,
			closingCredit: l.credit
		};
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = Am(i.reduce((e, t) => e + t.openingDebit, 0)), o = Am(i.reduce((e, t) => e + t.openingCredit, 0)), s = Am(i.reduce((e, t) => e + t.periodDebit, 0)), c = Am(i.reduce((e, t) => e + t.periodCredit, 0)), l = Am(i.reduce((e, t) => e + t.closingDebit, 0)), u = Am(i.reduce((e, t) => e + t.closingCredit, 0)), d = Am(l - u);
	return {
		fromDate: n,
		toDate: r,
		rows: i,
		totalOpeningDebit: a,
		totalOpeningCredit: o,
		totalPeriodDebit: s,
		totalPeriodCredit: c,
		totalClosingDebit: l,
		totalClosingCredit: u,
		difference: d,
		balanced: d === 0
	};
}
//#endregion
//#region src/features/cash-reports/cashReportService.ts
var Pm = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], Fm = (e) => Math.round(e * 100), Im = (e) => e / 100;
function Lm(e) {
	switch (e.sourceType) {
		case "CUSTOMER_DEPOSIT":
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return Pm[0];
		case "CUSTOMER_DEPOSIT_REFUND":
		case "CUSTOMER_REFUND": return Pm[1];
		case "SUPPLIER_PREPAYMENT":
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return Pm[2];
		case "SUPPLIER_PREPAYMENT_REFUND":
		case "SUPPLIER_REFUND": return Pm[3];
		case "OPENING_BALANCE": return Pm[4];
		case "BANK_TRANSFER": return Pm[5];
		default: return Pm[6];
	}
}
function Rm(e) {
	if (T(e.from, "From date"), T(e.to, "To date"), e.from > e.to) throw Error("From date must not exceed To date.");
	if (!e.currency.trim()) throw Error("Select a currency.");
	let t = new Map(e.bankAccounts.map((e) => [e.id, e]));
	if (t.size !== e.bankAccounts.length) throw Error("Duplicate bank account IDs require review.");
	if (e.bankIds && (new Set(e.bankIds).size !== e.bankIds.length || e.bankIds.some((e) => !t.has(e)))) throw Error("Invalid bank account selection.");
	let n = e.bankAccounts.filter((t) => (!e.bankIds || e.bankIds.includes(t.id)) && t.currency === e.currency);
	if (e.bankIds?.some((n) => t.get(n).currency !== e.currency)) throw Error("Selected banks must use the report currency.");
	for (let t of n) {
		if (e.bankAccounts.filter((e) => e.glAccountId === t.glAccountId).length !== 1) throw Error("Duplicate bank GL mappings require review before reporting.");
		T(t.openingBalanceDate, "Bank opening date");
	}
	let r = new Map(e.journalEntries.map((e) => [e.id, e]));
	if (r.size !== e.journalEntries.length) throw Error("Duplicate journal IDs require review.");
	let i = [], a = [], o = n.map((t) => {
		if (t.openingBalanceDate > e.to) return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: 0,
			moneyIn: 0,
			moneyOut: 0,
			closing: 0,
			difference: 0
		};
		e.journalEntries.some((n) => n.journalDate < t.openingBalanceDate && n.journalDate <= e.to && n.lines.some((e) => e.accountId === t.glAccountId && (e.debit || e.credit))) && i.push(`${t.name}: ledger activity precedes the bank opening date and is excluded, matching the bank register. Review its opening setup.`);
		let n = rc(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? Fm(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = Fm(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: Pm[4],
				moneyIn: Im(Math.max(e, 0)),
				moneyOut: Im(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		let l = n.transactions.filter((t) => t.correctionOnly && t.transactionDate >= e.from).length;
		l && i.push(`${t.name}: ${l} internal correction lines remain visible in the bank register and are excluded from cash movement totals.`), n.transactions.some((e) => e.correctionIssue) && i.push(`${t.name}: bank journal or categorisation correction evidence requires review. Its ledger movements remain included; no historical amount or date is silently changed.`);
		for (let i of n.transactions) {
			if (i.correctionOnly) continue;
			if (i.transactionDate < e.from) {
				o += Fm(i.moneyIn) - Fm(i.moneyOut);
				continue;
			}
			let n = r.get(i.journalEntryId);
			a.push({
				id: i.id,
				bankId: t.id,
				bankName: t.name,
				date: i.transactionDate,
				journalId: n.id,
				journalNumber: n.journalNumber,
				description: n.description,
				sourceType: n.sourceType,
				category: Lm(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += Fm(i.moneyIn), c += Fm(i.moneyOut);
		}
		let u = Fm(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: Im(o),
			moneyIn: Im(s),
			moneyOut: Im(c),
			closing: Im(u),
			difference: Im(o + s - c - u)
		};
	}), s = new Map(Pm.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === Pm[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + Fm(e.moneyIn) - Fm(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += Fm(e.moneyIn), t.moneyOut += Fm(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(Pm[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: Im(e.moneyIn),
		moneyOut: Im(e.moneyOut),
		net: Im(e.moneyIn - e.moneyOut)
	})), u = (e) => Im(o.reduce((t, n) => t + Fm(n[e]), 0)), d = u("opening"), f = u("closing"), p = Im(l.reduce((e, t) => e + Fm(t.net), 0)), m = a.filter((e) => e.category === Pm[6]).length;
	return m && i.push(`${m} bank ledger line(s) need activity classification review. They are included in totals.`), a.sort((e, t) => e.date.localeCompare(t.date) || (e.journalNumber ?? "").localeCompare(t.journalNumber ?? "") || e.id.localeCompare(t.id)), {
		from: e.from,
		to: e.to,
		currency: e.currency,
		accounts: o,
		groups: l,
		details: a,
		warnings: i,
		opening: d,
		closing: f,
		net: p,
		grossIn: u("moneyIn"),
		grossOut: u("moneyOut"),
		difference: Im(Fm(d) + Fm(p) - Fm(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var zm = (e) => Math.round(e * 100);
function Bm(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - zm(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (zm(e.subtotal) + zm(e.tax) !== zm(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function Vm(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), T(r.date, `Document date (${r.number})`), Bm(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: zm(r.subtotal) * n / 100,
			tax: zm(r.tax) * n / 100,
			total: zm(r.total) * n / 100
		});
		if (n.push(l(r.date, a, i ? "CREDIT" : "DOCUMENT")), r.status === "VOID") {
			if (!r.voidedAt) throw Error(`${r.number}: void date is missing. Review the source record before reporting.`);
			let e = S(r.voidedAt);
			if (T(e, `Void date (${r.number})`), e < r.date) throw Error(`${r.number}: void date precedes the original document.`);
			n.push(l(e, -a, "VOID"));
		}
	}
	return n.sort((e, t) => e.date.localeCompare(t.date) || e.number.localeCompare(t.number) || e.eventId.localeCompare(t.eventId));
}
function Hm(e, t) {
	if (T(t.from, "From date"), T(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = Vm(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + zm(n[t]), 0) / 100, a = {
		subtotal: i(r, "subtotal"),
		tax: i(r, "tax"),
		total: i(r, "total")
	}, o = /* @__PURE__ */ new Map();
	for (let e of r) o.set(e.partyId, [...o.get(e.partyId) ?? [], e]);
	let s = [...o].map(([e, t]) => ({
		id: e,
		name: t[t.length - 1].partyName,
		events: t.length,
		documents: new Set(t.map((e) => `${e.kind}:${e.id}`)).size,
		subtotal: i(t, "subtotal"),
		tax: i(t, "tax"),
		total: i(t, "total")
	})).sort((e, t) => e.name.localeCompare(t.name) || e.id.localeCompare(t.id)), c = [
		"DOCUMENT",
		"CREDIT",
		"VOID"
	].map((e) => ({
		type: e,
		count: r.filter((t) => t.event === e).length,
		subtotal: i(r.filter((t) => t.event === e), "subtotal"),
		tax: i(r.filter((t) => t.event === e), "tax"),
		total: i(r.filter((t) => t.event === e), "total")
	}));
	return {
		...t,
		events: r,
		parties: s,
		totals: a,
		movements: c
	};
}
//#endregion
//#region src/features/net-analysis/analysisSources.ts
function Um(e, t, n) {
	let r = (e) => n.find((t) => t.id === e)?.businessName ?? e;
	return [...e.filter((e) => e.type === "INVOICE").map((e) => ({
		id: e.id,
		number: e.documentNumber,
		partyId: e.customerId,
		partyName: r(e.customerId),
		kind: "INVOICE",
		date: e.documentDate,
		status: e.status,
		voidedAt: e.voidedAt,
		openingBalanceImportId: e.openingBalanceImportId,
		subtotal: e.totals.subtotal,
		tax: e.totals.taxAmount,
		total: e.totals.total,
		path: `/sales/invoices/${e.id}`
	})), ...t.map((e) => ({
		id: e.id,
		number: e.creditNoteNumber,
		partyId: e.customerId,
		partyName: r(e.customerId),
		kind: "CUSTOMER_CREDIT",
		date: e.creditDate,
		status: e.status,
		voidedAt: e.voidedAt,
		openingBalanceImportId: e.openingBalanceImportId,
		subtotal: e.totals.subtotal,
		tax: e.totals.taxAmount,
		total: e.totals.total,
		path: `/sales/credits/${e.id}`
	}))];
}
function Wm(e, t) {
	return [...e.map((e) => ({
		id: e.id,
		number: e.billNumber,
		partyId: e.supplierId,
		partyName: e.supplierName,
		kind: "BILL",
		date: e.billDate,
		status: e.status,
		voidedAt: e.voidedAt,
		openingBalanceImportId: e.openingBalanceImportId,
		subtotal: e.totals.subtotal,
		tax: e.totals.taxAmount,
		total: e.totals.total,
		path: `/purchases/bills/${e.id}`
	})), ...t.map((e) => ({
		id: e.id,
		number: e.creditNumber,
		partyId: e.supplierId,
		partyName: e.supplierName,
		kind: "SUPPLIER_CREDIT",
		date: e.creditDate,
		status: e.status,
		voidedAt: e.voidedAt,
		openingBalanceImportId: e.openingBalanceImportId,
		subtotal: e.totals.subtotal,
		tax: e.totals.taxAmount,
		total: e.totals.total,
		path: `/purchases/credits/${e.id}`
	}))];
}
//#endregion
//#region src/features/report-packs/reportPackService.ts
var Gm = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function Km(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > Gm.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => Gm.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${Gm.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var qm = (e) => JSON.stringify(e);
function Jm(e, t, n) {
	if (T(e.periodStart, "From date"), T(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = Km(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = Sm(t.accounts, t.journals, i, a);
			return {
				title: e,
				description: `Accrual general ledger activity from ${i} to ${a}.`,
				path: "/accounting/profit-and-loss",
				columns: [
					"Group",
					"Code",
					"Account",
					"Amount"
				],
				rows: [...n.revenue.map((e) => [
					"Revenue",
					e.accountCode,
					e.accountName,
					e.amount
				]), ...n.expenses.map((e) => [
					"Expense",
					e.accountCode,
					e.accountName,
					e.amount
				])],
				totals: [
					{
						label: "Revenue",
						value: n.totalRevenue
					},
					{
						label: "Expenses",
						value: n.totalExpenses
					},
					{
						label: "Net profit",
						value: n.netProfit
					}
				],
				warnings: []
			};
		}
		if (e === "Balance sheet") {
			let n = km(t.accounts, t.journals, a);
			return {
				title: e,
				description: `Accrual general ledger balances as at ${a}, including current earnings.`,
				path: "/accounting/balance-sheet",
				columns: [
					"Group",
					"Code",
					"Account",
					"Amount"
				],
				rows: [
					...n.assets.map((e) => [
						"Asset",
						e.accountCode,
						e.accountName,
						e.amount
					]),
					...n.liabilities.map((e) => [
						"Liability",
						e.accountCode,
						e.accountName,
						e.amount
					]),
					...n.equity.map((e) => [
						"Equity",
						e.accountCode,
						e.accountName,
						e.amount
					]),
					[
						"Equity",
						"",
						"Current earnings",
						n.currentEarnings
					]
				],
				totals: [
					{
						label: "Assets",
						value: n.totalAssets
					},
					{
						label: "Liabilities and equity",
						value: n.totalLiabilitiesAndEquity
					},
					{
						label: "Difference",
						value: n.difference
					}
				],
				warnings: n.balanced ? [] : ["Balance sheet is not balanced. Review the general ledger before using this pack."]
			};
		}
		if (e === "Trial balance") {
			let n = Nm(t.accounts, t.journals, i, a);
			return {
				title: e,
				description: `Opening balances and period movements from ${i} to ${a}.`,
				path: "/accounting/trial-balance",
				columns: [
					"Code",
					"Account",
					"Opening Dr",
					"Opening Cr",
					"Period Dr",
					"Period Cr",
					"Closing Dr",
					"Closing Cr"
				],
				rows: n.rows.map((e) => [
					e.accountCode,
					e.accountName,
					e.openingDebit,
					e.openingCredit,
					e.periodDebit,
					e.periodCredit,
					e.closingDebit,
					e.closingCredit
				]),
				totals: [
					{
						label: "Opening debit",
						value: n.totalOpeningDebit
					},
					{
						label: "Opening credit",
						value: n.totalOpeningCredit
					},
					{
						label: "Period debit",
						value: n.totalPeriodDebit
					},
					{
						label: "Period credit",
						value: n.totalPeriodCredit
					},
					{
						label: "Closing debit",
						value: n.totalClosingDebit
					},
					{
						label: "Closing credit",
						value: n.totalClosingCredit
					},
					{
						label: "Difference",
						value: n.difference
					}
				],
				warnings: n.balanced ? [] : ["Trial balance has a difference. Review the general ledger before using this pack."]
			};
		}
		if (e === "Cash flow") {
			let n = Rm({
				bankAccounts: t.banks,
				journalEntries: t.journals,
				from: i,
				to: a,
				currency: t.company.currency
			}), r = [...new Set(t.banks.filter((e) => e.currency !== t.company.currency).map((e) => e.currency))];
			return {
				title: e,
				description: `Bank ledger working paper in ${t.company.currency}. Selected-bank transfers are netted per journal. Opening adjustments are included separately. Operating/investing/financing classification requires accountant review.`,
				path: "/reports/cash-flow",
				columns: [
					"Activity",
					"Money in",
					"Money out",
					"Net"
				],
				rows: n.groups.map((e) => [
					e.category,
					e.moneyIn,
					e.moneyOut,
					e.net
				]),
				totals: [
					{
						label: "Opening",
						value: n.opening
					},
					{
						label: "Net movement",
						value: n.net
					},
					{
						label: "Closing",
						value: n.closing
					},
					{
						label: "Reconciliation difference",
						value: n.difference
					}
				],
				warnings: [
					...n.warnings,
					...r.length ? [`Other bank currencies excluded (no FX conversion): ${r.join(", ")}.`] : [],
					...n.difference === 0 ? [] : ["Bank cash movement does not reconcile."]
				]
			};
		}
		let n = e === "Net purchases", r = Hm(n ? Wm(t.bills, t.supplierCredits) : Um(t.documents, t.customerCredits, t.customers), {
			from: i,
			to: a
		});
		return {
			title: e,
			description: "Accrual document activity: original invoices/bills less credits and dated void corrections. Opening balances, settlements and manual GL adjustments are excluded. This is not profit, recognized inventory expense or outstanding AR/AP.",
			path: n ? "/reports/purchase-analysis" : "/reports/sales-analysis",
			columns: [
				"Contact ID",
				"Contact",
				"Before tax",
				"Tax",
				"Gross"
			],
			rows: r.parties.map((e) => [
				e.id,
				e.name,
				e.subtotal,
				e.tax,
				e.total
			]),
			totals: [
				{
					label: "Before tax",
					value: r.totals.subtotal
				},
				{
					label: "Tax",
					value: r.totals.tax
				},
				{
					label: "Gross",
					value: r.totals.total
				}
			],
			warnings: []
		};
	});
	return structuredClone({
		...n,
		configId: e.id,
		configRevision: e.revision,
		name: e.name,
		cover: e.cover || e.name,
		introduction: e.introduction ?? "",
		from: i,
		to: a,
		company: t.company,
		sourceSignature: qm(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function Ym() {
	let e = x();
	return {
		accounts: P.getAll(),
		journals: F.getAll(),
		banks: L.getAll(),
		documents: R.getAll(),
		customerCredits: I.getAll(),
		customers: A.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: _o.getAll(),
		supplierCredits: H.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone
		}
	};
}
function Xm(e) {
	let t = k.require("accounting.read"), n = w({
		id: y().trim().min(1).max(200),
		expectedRevision: y().regex(/^\d+$/)
	}).strict().parse(e), r = C["report-packs"]?.find((e) => e.id === n.id);
	if (!r) throw Error("Report pack configuration was not found.");
	if (r.revision !== n.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (r.status !== "Active") throw Error("Activate this report pack before generating.");
	return Jm({
		id: r.id,
		revision: r.revision,
		name: r.name,
		cover: r.cover,
		introduction: r.introduction,
		periodStart: r.periodStart,
		periodEnd: r.periodEnd,
		reports: r.reports
	}, Ym(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: t.userId
	});
}
//#endregion
//#region src/features/saved-reports/savedReportService.ts
var Zm = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], X = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), Qm = [
	X("date", "Date"),
	X("number", "Document"),
	X("contact", "Contact"),
	X("partyId", "Contact ID"),
	X("activity", "Activity"),
	X("status", "Current status"),
	X("net", "Net", !0),
	X("tax", "Tax", !0),
	X("gross", "Gross", !0)
], $m = {
	Sales: Qm,
	Purchases: Qm,
	Banking: [
		X("date", "Date"),
		X("bank", "Bank"),
		X("journal", "Journal"),
		X("description", "Description"),
		X("source", "Source"),
		X("category", "Activity"),
		X("moneyIn", "Money in", !0),
		X("moneyOut", "Money out", !0),
		X("net", "Net", !0)
	],
	"General ledger": [
		X("date", "Date"),
		X("journal", "Journal"),
		X("accountCode", "Account code"),
		X("account", "Account"),
		X("description", "Description"),
		X("source", "Source"),
		X("status", "Current status"),
		X("debit", "Debit", !0),
		X("credit", "Credit", !0)
	]
}, eh = (e) => e === "Banking" ? "Cash" : "Accrual", th = w({
	from: y(),
	to: y(),
	query: y().max(500).default(""),
	partyId: y().max(200).optional(),
	bankId: y().max(200).optional(),
	accountId: y().max(200).optional(),
	currency: y().min(1).max(10).optional()
}).strict();
function nh(e) {
	let t = g(Zm).parse(e.dataset);
	if (e.basis !== eh(t)) throw Error(`${t} uses ${eh(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = th.parse(n);
	if (T(r.from, "From date"), T(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, o = i.map((e) => $m[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > $m[t].length || o.some((e) => !e) || new Set(o.map((e) => e?.key)).size !== o.length) throw Error(`Select distinct supported columns for ${t}: ${$m[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: o
	};
}
var rh = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function ih(e, t, n) {
	let { dataset: r, filters: i, columns: a } = nh(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? Um(t.documents, t.customerCredits, t.customers) : Wm(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = Vm(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
			id: e.eventId,
			path: e.path,
			values: {
				date: e.date,
				number: e.number,
				contact: e.partyName,
				partyId: e.partyId,
				activity: n[e.event],
				status: e.status.replaceAll("_", " "),
				net: e.subtotal,
				tax: e.tax,
				gross: e.total
			}
		})), l = ["Accrual document activity using saved totals, credits and dated void reversals. Drafts, quotes/orders, opening documents, settlements and manual GL adjustments are excluded.", "Current status is shown for source context; it does not remove historical original or reversal events."];
	} else if (r === "Banking") {
		u = i.currency ?? t.company.currency;
		let e = Rm({
			bankAccounts: t.banks,
			journalEntries: t.journals,
			from: i.from,
			to: i.to,
			currency: u,
			bankIds: i.bankId ? [i.bankId] : void 0
		});
		s = e.details.map((e) => ({
			id: e.id,
			path: e.journalId ? `/accounting/journals/${e.journalId}` : `/banking/accounts/${e.bankId}`,
			values: {
				date: e.date,
				bank: e.bankName,
				journal: e.journalNumber ?? "Bank setup",
				description: e.description,
				source: e.sourceType,
				category: e.category,
				moneyIn: e.moneyIn,
				moneyOut: e.moneyOut,
				net: (Math.round(e.moneyIn * 100) - Math.round(e.moneyOut * 100)) / 100
			}
		})), l = [
			"Gross bank ledger lines, including dated reversals and opening adjustments. Internal transfer lines remain visible; their net cancels across selected accounts.",
			"Totals below describe filtered lines, not an opening-to-closing cash reconciliation. Use Cash flow or Banking summary for reconciled balances.",
			...e.warnings
		];
	} else {
		if (i.accountId && !t.accounts.some((e) => e.id === i.accountId)) throw Error("Selected GL account is not available.");
		s = t.journals.filter((e) => e.journalDate >= i.from && e.journalDate <= i.to).flatMap((e) => e.lines.filter((e) => !i.accountId || e.accountId === i.accountId).map((t) => ({
			id: `${e.id}:${t.id}`,
			path: `/accounting/journals/${e.id}`,
			values: {
				date: e.journalDate,
				journal: e.journalNumber,
				accountCode: t.accountCode,
				account: t.accountName,
				description: [
					e.description,
					t.description,
					e.reference
				].filter(Boolean).join(" · "),
				source: e.sourceType,
				status: e.status,
				debit: t.debit,
				credit: t.credit
			}
		}))), l = ["Accrual GL lines on their posting dates, including reversed originals and dated reversing entries.", "Filtered debit/credit totals may differ when an account or text filter selects only part of a journal."];
	}
	return s = s.filter((e) => Object.values(e.values).join(" ").toLowerCase().includes(o)).sort((e, t) => String(e.values.date).localeCompare(String(t.values.date)) || e.id.localeCompare(t.id)), c = (r === "Sales" || r === "Purchases" ? [
		["Net", "net"],
		["Tax", "tax"],
		["Gross", "gross"]
	] : r === "Banking" ? [
		["Money in", "moneyIn"],
		["Money out", "moneyOut"],
		["Net movement", "net"]
	] : [["Debit", "debit"], ["Credit", "credit"]]).map(([e, t]) => ({
		label: e,
		value: rh(s, t)
	})), structuredClone({
		...n,
		configId: e.id,
		configRevision: e.revision,
		name: e.name,
		dataset: r,
		basis: e.basis,
		filters: i,
		currency: u,
		company: t.company.name,
		sourceSignature: qm(t),
		columns: a,
		rows: s.map((e) => ({
			id: e.id,
			path: e.path,
			cells: a.map((t) => e.values[t.key])
		})),
		totals: c,
		notes: l
	});
}
//#endregion
//#region src/features/saved-reports/savedReportCommand.ts
function ah(e) {
	let t = k.require("accounting.read"), n = w({
		id: y().trim().min(1).max(200),
		expectedRevision: y().regex(/^\d+$/)
	}).strict().parse(e), r = C["custom-reports"]?.find((e) => e.id === n.id);
	if (!r) throw Error("Saved report was not found.");
	if (r.revision !== n.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (r.status !== "Active") throw Error("Activate this saved report before running.");
	return ih({
		id: r.id,
		revision: r.revision,
		name: r.name,
		dataset: r.dataset,
		columns: r.columns,
		basis: r.basis,
		filter: r.filter,
		favourite: r.favourite
	}, Ym(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: t.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var oh = s(y(), y().max(2e4)), sh = [
	"BANK",
	"ACCOUNTS_RECEIVABLE",
	"INVENTORY",
	"GRNI",
	"PURCHASE_PRICE_VARIANCE",
	"GST_RECEIVABLE",
	"ACCOUNTS_PAYABLE",
	"GST_PAYABLE",
	"SALES_REVENUE",
	"COST_OF_GOODS_SOLD",
	"PURCHASES",
	"FREIGHT",
	"OPERATING_EXPENSE",
	"RETAINED_EARNINGS",
	"OWNERS_EQUITY"
], ch = () => (/* @__PURE__ */ new Date()).toISOString(), lh = {
	"tax-codes": {
		read: "inventory.read",
		write: "accounting.post",
		required: [
			"code",
			"rate",
			"collected",
			"paid"
		],
		fields: [
			"code",
			"rate",
			"collected",
			"paid",
			"basis",
			"report"
		]
	},
	"linked-accounts": {
		read: "accounting.read",
		write: "accounting.post",
		required: ["role", "accountId"],
		fields: ["role", "accountId"]
	},
	promotions: {
		read: "sales.read",
		write: "sales.write",
		required: [
			"productId",
			"unitId",
			"starts",
			"ends",
			"price",
			"priority",
			"policy"
		],
		fields: [
			"productId",
			"unitId",
			"customerId",
			"starts",
			"ends",
			"price",
			"priority",
			"policy"
		]
	},
	jobs: {
		read: "accounting.read",
		write: "accounting.post",
		required: [
			"code",
			"customerId",
			"starts",
			"ends",
			"budget",
			"costBudget"
		],
		fields: [
			"code",
			"customerId",
			"owner",
			"starts",
			"ends",
			"budget",
			"costBudget"
		]
	},
	tasks: {
		read: "sales.read",
		write: "sales.write",
		required: [
			"customerId",
			"owner",
			"due",
			"priority",
			"notes"
		],
		fields: [
			"customerId",
			"owner",
			"due",
			"priority",
			"notes",
			"completedAt",
			"completedBy"
		]
	},
	"bank-rules": {
		read: "banking.read",
		write: "banking.write",
		required: [
			"field",
			"operator",
			"value",
			"accountId",
			"taxCode"
		],
		fields: [
			"field",
			"operator",
			"value",
			"accountId",
			"taxCode",
			"enabled"
		]
	},
	templates: {
		read: "accounting.read",
		write: "accounting.post",
		required: [
			"kind",
			"subject",
			"body"
		],
		fields: [
			"kind",
			"subject",
			"body",
			"footer",
			"logo",
			"paper"
		]
	},
	"custom-reports": {
		read: "accounting.read",
		write: "accounting.post",
		required: [
			"dataset",
			"columns",
			"basis"
		],
		fields: [
			"dataset",
			"columns",
			"filter",
			"basis",
			"favourite"
		]
	},
	"report-packs": {
		read: "accounting.read",
		write: "accounting.post",
		required: [
			"periodStart",
			"periodEnd",
			"reports"
		],
		fields: [
			"periodStart",
			"periodEnd",
			"reports",
			"cover",
			"introduction"
		]
	},
	settings: {
		read: "inventory.read",
		write: "accounting.post",
		required: ["section"],
		fields: /* @__PURE__ */ "section.companyName.currency.timezone.yearEnd.gstCode.quotePrefix.orderPrefix.invoicePrefix.creditPrefix.purchasePrefix.terms.sender.payCycle.payDay.filingRegion.basis.precision.header.logo.nextQuote.nextOrder.nextInvoice.nextCredit.nextPurchase.billPrefix.supplierCreditPrefix.nextBill.nextSupplierCredit.tradingName.identifier.email.phone.address".split(".")
	}
}, uh = /* @__PURE__ */ new Set(), dh = 0, fh = () => {
	dh++, uh.forEach((e) => e());
}, ph = Object.fromEntries(Object.keys(lh).map((e) => [e, []]));
for (let e of Object.keys(lh)) C[e] = [];
var mh = () => ({
	collected: P.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: P.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
C["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: ch(),
	updatedAt: ch(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...mh()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: ch(),
	updatedAt: ch(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...mh()
}];
function hh(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function gh(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function _h(e, t) {
	let n = P.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function vh(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function yh(e, t, r, i = !0) {
	let a = lh[e];
	if (!a) throw Error("Unknown workspace domain.");
	let o = /* @__PURE__ */ new Set([
		"id",
		"name",
		"status",
		"revision",
		"createdAt",
		"updatedAt",
		...a.fields
	]);
	if (Object.keys(t).some((e) => !o.has(e))) throw Error("Unsupported business field.");
	hh(t.name, "Name");
	for (let e of a.required) hh(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (gh(t.rate, "Tax rate"), t.basis && !["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid entry basis.");
		if (i) {
			let e = r.find((e) => e.id === t.id), i = n(), a = C.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (t.status === "Inactive" && t.code === a) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== t.code && (e.code === a || i.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (C["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (i) {
			let e = _h(t.collected, "LIABILITY"), r = _h(t.paid, "ASSET"), i = (n().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || r.systemRole && r.systemRole !== "GST_RECEIVABLE" || i.includes(r.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (r.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && i) {
		let e = P.requireBySystemRole(t.role), r = t.status === "Inactive" ? P.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, i = n().journals?.journalEntries ?? [];
		if (r !== e.id && i.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === r))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!sh.includes(t.role)) throw Error("Unknown account role.");
		let e = [
			"BANK",
			"ACCOUNTS_RECEIVABLE",
			"INVENTORY",
			"GST_RECEIVABLE"
		].includes(t.role) ? "ASSET" : [
			"GRNI",
			"ACCOUNTS_PAYABLE",
			"GST_PAYABLE"
		].includes(t.role) ? "LIABILITY" : t.role === "SALES_REVENUE" ? "REVENUE" : ["RETAINED_EARNINGS", "OWNERS_EQUITY"].includes(t.role) ? "EQUITY" : "EXPENSE";
		if (i && _h(t.accountId, e), r.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = it(t.productId);
		if (i && (!e || !at(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (gh(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (i && t.customerId && !A.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (gh(t.budget, "Revenue budget"), gh(t.costBudget, "Cost budget"), i) for (let e of ["budget", "costBudget"]) {
			let n = Number(t[e]);
			if (!Number.isSafeInteger(Math.round(n * 100)) || Math.abs(Math.round(n * 100) / 100 - n) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!vh(t.starts) || !vh(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (r.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (i && t.id && (n().salesVisits?.visits ?? []).some((e) => e.followupTaskId === t.id && e.customerId !== t.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (i && ![
			"Open",
			"In progress",
			"Completed"
		].includes(t.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!vh(t.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(t.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (i && _h(t.accountId), ![
			"Description",
			"Payee",
			"Reference"
		].includes(t.field) || ![
			"Contains",
			"Equals",
			"Starts with"
		].includes(t.operator)) throw Error("Invalid bank condition.");
		if (i && !C["tax-codes"].some((e) => e.status === "Active" && e.code === t.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "custom-reports" && i && nh({
		dataset: t.dataset,
		columns: t.columns,
		basis: t.basis,
		filter: t.filter,
		favourite: t.favourite
	}), e === "report-packs" && i && Km(t.reports), e === "report-packs" && (!vh(t.periodStart) || !vh(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
	if (e === "settings") {
		if (r.some((e) => e.id !== t.id && e.section === t.section)) throw Error("One record per settings section is allowed.");
		if (t.section === "business") {
			for (let e of [
				"companyName",
				"currency",
				"timezone",
				"yearEnd",
				"gstCode",
				"basis",
				"terms"
			]) hh(t[e], e);
			if (t.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(t.terms) || Number(t.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(t.yearEnd) || !vh("2001-" + t.yearEnd)) throw Error("Year end must be MM-DD.");
			for (let e of [
				"quotePrefix",
				"orderPrefix",
				"invoicePrefix",
				"creditPrefix",
				"purchasePrefix",
				"billPrefix",
				"supplierCreditPrefix"
			]) if (t[e] && !/^[A-Z0-9]{1,12}$/.test(t[e])) throw Error("Number prefixes require 1–12 uppercase letters/numbers.");
			if (i) {
				if (!C["tax-codes"].some((e) => e.code === t.gstCode && e.status === "Active")) throw Error("Default tax code must be active.");
				let e = n().journals.journalEntries, i = r.find((e) => e.id === t.id), a = n().bankAccounts.bankAccounts, o = i?.currency ?? a[0]?.currency ?? "AUD";
				if (t.currency !== o && (e.length || a.length)) throw Error("Base currency is locked after bank accounts or financial postings exist. Create a separately initialized currency profile.");
			}
		}
		if (![
			"business",
			"sales",
			"purchases",
			"payroll",
			"reports"
		].includes(t.section)) throw Error("Unknown settings section.");
		if (t.currency && !["NZD", "AUD"].includes(t.currency)) throw Error("Unsupported currency.");
		if (t.timezone) try {
			new Intl.DateTimeFormat("en", { timeZone: t.timezone });
		} catch {
			throw Error("Invalid time zone.");
		}
		for (let e of [
			"nextQuote",
			"nextOrder",
			"nextInvoice",
			"nextCredit",
			"nextPurchase",
			"nextBill",
			"nextSupplierCredit"
		]) if (t[e] && (!/^\d+$/.test(t[e]) || Number(t[e]) < 1 || !Number.isSafeInteger(Number(t[e])) || Number(t[e]) > 999999999)) throw Error("Next document numbers must be positive integers.");
	}
}
function bh(e, t, n) {
	ph[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: ch(),
		updatedAt: ch(),
		recordId: t.id,
		actorId: k.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var xh = Object.fromEntries(Object.keys(lh).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return ah(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return Xm(t);
		},
		getAll: () => C[e],
		getById: (t) => C[e].find((e) => e.id === t),
		save(t, n) {
			let r = oh.parse(t), i = C[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = ch(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || k.current()?.userId || "local-test" : k.current()?.userId ?? "local-test")), yh(e, o, C[e]), C[e] = [...C[e].filter((e) => e.id !== o.id), o], bh(e, o, i ? "Updated" : "Created"), fh(), o;
		},
		setStatus(e, n, r) {
			let i = t.getById(e);
			if (!i) throw Error("Record was not found.");
			return t.save({
				...i,
				status: n
			}, r);
		},
		addNote(n, r) {
			let i = t.getById(n);
			if (!i || e !== "tasks" || !r.trim() || r.length > 4e3) throw Error("A valid task note is required.");
			bh(e, {
				...i,
				note: r.trim()
			}, "Note added"), fh();
		}
	};
	return m("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			Sh(e, t), Ch(e, t, n);
		},
		repository: t,
		read: lh[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: lh[e].write,
			setStatus: lh[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: C[e],
			history: ph[e]
		}),
		restore: (t) => {
			Sh(e, t), C[e] = t.records, ph[e] = t.history;
		},
		publish: fh
	}), [e, t];
}));
function Sh(e, t) {
	let n = w({
		records: a(oh),
		history: a(oh)
	}).strict().parse(t), r = /* @__PURE__ */ new Set();
	for (let t of n.records) {
		if (!t.id || r.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		r.add(t.id), yh(e, t, n.records, !1);
	}
	return n;
}
function Ch(e, t, n) {
	let r = t.records, i = n.accounts.accounts, a = n.products.products, o = n.customers.customers, s = n.workspace_tax_codes.records;
	for (let t of r) {
		if (t.customerId && !o.some((e) => e.id === t.customerId)) throw Error("Backup workspace customer reference is invalid.");
		if (e === "promotions" && !a.some((e) => e.id === t.productId && e.units.some((e) => e.id === t.unitId))) throw Error("Backup promotion product/unit reference is invalid.");
		if (e === "tax-codes" && (!i.some((e) => e.id === t.collected && e.type === "LIABILITY") || !i.some((e) => e.id === t.paid && e.type === "ASSET"))) throw Error("Backup tax account reference is invalid.");
		if (["bank-rules", "linked-accounts"].includes(e) && !i.some((e) => e.id === t.accountId)) throw Error("Backup linked account reference is invalid.");
		if (e === "bank-rules" && !s.some((e) => e.code === t.taxCode)) throw Error("Backup bank-rule tax reference is invalid.");
	}
}
//#endregion
//#region src/features/sales-visits/visitRepository.ts
var wh = y().trim().min(1).max(200), Th = y().trim().min(1).max(4e3), Eh = y().refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), Dh = y().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), Oh = w({
	operationId: wh,
	name: wh,
	customerId: wh,
	locationId: wh.optional(),
	plannedDate: Eh,
	locationNote: y().trim().max(500).default("")
}).strict(), kh = w({
	name: wh,
	due: Eh,
	priority: g([
		"Low",
		"Normal",
		"High"
	]),
	notes: Th
}).strict(), Ah = w({
	id: wh,
	expectedRevision: c().int().positive(),
	outcome: Th,
	followup: kh.optional()
}).strict(), jh = w({
	id: wh,
	action: wh,
	actorId: wh,
	at: Dh,
	note: y().optional()
}).strict(), Mh = w({
	id: wh,
	operationId: wh,
	creationFingerprint: y().min(1).max(3e3),
	name: wh,
	customerId: wh,
	customerName: wh,
	locationId: wh.optional(),
	locationName: y().max(200).optional(),
	locationNote: y().max(500),
	plannedDate: Eh,
	status: g([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: c().int().positive(),
	ownerId: wh,
	createdAt: Dh,
	updatedAt: Dh,
	checkInAt: Dh.optional(),
	checkInBy: wh.optional(),
	checkOutAt: Dh.optional(),
	checkOutBy: wh.optional(),
	outcome: Th.optional(),
	completionFingerprint: y().optional(),
	followupTaskId: wh.optional(),
	history: a(jh).min(1)
}).strict(), Nh = [], Ph = 0, Fh = /* @__PURE__ */ new Set(), Ih = () => {
	Ph++, Fh.forEach((e) => e());
}, Lh = () => k.require("sales.write").userId, Rh = () => (/* @__PURE__ */ new Date()).toISOString(), zh = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function Bh(e) {
	let t = Nh.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function Vh(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function Hh(e) {
	let t = Rh();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function Uh(e) {
	return Nh = [...Nh.filter((t) => t.id !== e.id), e], Ih(), e;
}
function Wh(e, t) {
	let n = A.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
m("salesVisits", {
	repository: {
		subscribe(e) {
			return Fh.add(e), () => {
				Fh.delete(e);
			};
		},
		getSnapshot: () => Nh,
		getAll: () => Nh,
		create(e) {
			let t = Lh(), n = Oh.parse(e), r = JSON.stringify(n), i = Nh.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = Wh(n.customerId, n.locationId), o = Rh();
			return Uh({
				...n,
				id: crypto.randomUUID(),
				creationFingerprint: r,
				customerName: a.businessName,
				...n.locationId ? { locationName: a.locations.find((e) => e.id === n.locationId).name } : {},
				status: "Planned",
				revision: 1,
				ownerId: t,
				createdAt: o,
				updatedAt: o,
				history: [zh("Planned", t, o)]
			});
		},
		update(e) {
			let t = Lh(), n = Oh.omit({ operationId: !0 }).extend({
				id: wh,
				expectedRevision: c().int().positive()
			}).strict().parse(e), r = Bh(n.id);
			if (Vh(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = Wh(n.customerId, n.locationId), a = Hh(r), o = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, zh("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete o.locationId, delete o.locationName, n.locationId && (o.locationId = n.locationId, o.locationName = i.locations.find((e) => e.id === n.locationId).name), Uh(o);
		},
		checkIn(e) {
			let t = Lh(), n = w({
				id: wh,
				expectedRevision: c().int().positive()
			}).strict().parse(e), r = Bh(n.id);
			if (r.status === "Checked in" && r.revision === n.expectedRevision + 1) return r;
			if (Vh(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			Wh(r.customerId, r.locationId);
			let i = Hh(r);
			return Uh({
				...r,
				status: "Checked in",
				revision: r.revision + 1,
				checkInAt: i,
				checkInBy: t,
				updatedAt: i,
				history: [...r.history, zh("Checked in", t, i)]
			});
		},
		finish(e) {
			let t = Lh(), n = Ah.parse(e), r = Bh(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (Vh(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = Hh(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = xh.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), Uh({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, zh("Completed", t, a, n.outcome)]
			});
		},
		cancel(e) {
			let t = Lh(), n = w({
				id: wh,
				expectedRevision: c().int().positive(),
				reason: Th
			}).strict().parse(e), r = Bh(n.id);
			if (Vh(r, n.expectedRevision), !["Planned", "Checked in"].includes(r.status)) throw Error("Only an unfinished visit can be cancelled.");
			let i = Hh(r);
			return Uh({
				...r,
				status: "Cancelled",
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, zh("Cancelled", t, i, n.reason)]
			});
		},
		addNote(e) {
			let t = Lh(), n = w({
				id: wh,
				expectedRevision: c().int().positive(),
				note: Th
			}).strict().parse(e), r = Bh(n.id);
			Vh(r, n.expectedRevision);
			let i = Hh(r);
			return Uh({
				...r,
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, zh("Note added", t, i, n.note)]
			});
		}
	},
	read: "sales.read",
	commands: {
		create: "sales.write",
		update: "sales.write",
		checkIn: "sales.write",
		finish: "sales.write",
		cancel: "sales.write",
		addNote: "sales.write"
	},
	snapshot: () => ({ visits: Nh }),
	restore: (e) => {
		Nh = e.visits;
	},
	publish: Ih,
	validate: (e, t) => {
		let n = w({ visits: a(Mh) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.visits) {
			if (i.has(e.operationId)) throw Error("Duplicate visit operation ID.");
			if (i.add(e.operationId), !r.customers.customers.find((t) => t.id === e.customerId) || e.locationId && !e.locationName) throw Error("Invalid visit customer/location reference.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.updatedAt < e.createdAt) throw Error("Invalid visit history.");
			if (Oh.parse(JSON.parse(e.creationFingerprint)).operationId !== e.operationId || e.history[0].action !== "Planned" || e.history[0].actorId !== e.ownerId || e.history[0].at !== e.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!e.checkInAt != !!e.checkInBy || !!e.checkOutAt != !!e.checkOutBy || e.checkInAt && e.checkInAt < e.createdAt || e.checkOutAt && (!e.checkInAt || e.checkOutAt < e.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (e.status === "Planned" && (e.checkInAt || e.checkOutAt) || e.status === "Checked in" && (!e.checkInAt || e.checkOutAt) || e.status === "Completed" && (!e.checkInAt || !e.checkOutAt || !e.outcome || !e.completionFingerprint) || e.status !== "Completed" && (e.checkOutAt || e.outcome || e.followupTaskId || e.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (e.status === "Completed") {
				let t = w({
					outcome: Th,
					followup: kh.optional()
				}).strict().parse(JSON.parse(e.completionFingerprint));
				if (t.outcome !== e.outcome || !!t.followup != !!e.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (e.followupTaskId && !r.workspace_tasks.records.some((t) => t.id === e.followupTaskId && t.customerId === e.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Z = y().trim().min(1).max(200), Gh = y().trim().max(2e3).optional(), Kh = w({
	requestedArea: c().finite().positive().max(1e9).optional(),
	productId: Z,
	unitId: Z,
	quantity: c().positive().finite(),
	unitPrice: c().nonnegative().finite().optional(),
	priceBasis: g(["Inclusive", "Exclusive"]).optional()
}).strict(), qh = w({
	description: y().trim().min(1).max(500),
	accountId: Z,
	quantity: c().positive().finite(),
	unitCost: c().nonnegative().finite(),
	taxCode: Z,
	priceBasis: g(["Inclusive", "Exclusive"]).optional()
}).strict(), Jh = w({
	kind: g(["ORDER", "INVOICE"]),
	customerId: Z,
	pricingAt: Z.optional(),
	pricingTimezone: Z.optional(),
	locationId: Z.or(i("")).optional(),
	accountingContactId: Z.or(i("")).optional(),
	documentDate: Z,
	dueDate: Z.optional(),
	customerReference: Gh,
	notes: Gh,
	lines: a(Kh).min(1).max(500)
}).strict(), Yh = w({
	kind: i("EXPENSE"),
	supplierId: Z,
	supplierInvoiceNumber: Z,
	documentDate: Z,
	dueDate: Z,
	notes: Gh,
	lines: a(qh).min(1).max(500)
}).strict(), Xh = (e) => v([Jh, Yh]).parse(e), Zh = c().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), Qh = w({
	operationId: Z,
	sourceName: y().trim().max(200),
	reviewed: h(),
	declared: w({
		subtotal: Zh,
		taxAmount: Zh,
		total: Zh
	}).strict(),
	payload: Yh.extend({ notes: y().trim().max(1e3).optional() })
}).strict();
function $h(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function eg(e) {
	let t = Ni.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = fg(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = _o.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...rg.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
		kind: "Entry draft",
		id: e.id
	})), ...i.filter((t) => t.status !== "VOID" && t.supplierId === e.payload.supplierId && t.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
		kind: "Supplier bill",
		id: e.id
	}))], s = {
		subtotal: "net",
		taxAmount: "tax",
		total: "total"
	}, c = [];
	Math.round((e.declared.subtotal + e.declared.taxAmount) * 100) !== Math.round(e.declared.total * 100) && c.push("Declared net plus tax does not equal the declared total.");
	for (let t of [
		"subtotal",
		"taxAmount",
		"total"
	]) Math.round(n.totals[t] * 100) !== Math.round(e.declared[t] * 100) && c.push(`Calculated ${s[t]} does not match the source document.`);
	return o.length && c.push("This supplier invoice reference already exists in an entry draft or supplier bill."), {
		totals: n.totals,
		declared: e.declared,
		lines: n.lines,
		duplicates: o,
		issues: c,
		matches: c.length === 0
	};
}
var tg = () => P.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
tg();
var ng = [], rg = [], ig = 0, ag = /* @__PURE__ */ new Set(), og = () => {
	ig++, ag.forEach((e) => e());
}, sg = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function cg(e, t) {
	return {
		action: e,
		actorId: k.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function lg(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = P.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function ug(e) {
	let t = P.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function dg(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = Ni.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) ug(t.expenseAccountId);
	} else {
		let n = A.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) ar(t.productId, t.unitId, t.quantity, "sell");
	}
	lg(e.lines);
}
function fg(e) {
	if (T(e.documentDate, "Document date"), e.dueDate && (T(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? void 0 : Qe(e.documentDate, e.pricingAt, e.pricingTimezone), n = e.kind === "EXPENSE" ? e.lines.map((e) => {
		ug(e.accountId);
		let t = Ce(e.taxCode), n = se(e.unitCost, t.taxRate, e.priceBasis), r = sg(e.quantity * n), i = (e.priceBasis ?? x().basis) === "Inclusive" ? sg(e.quantity * e.unitCost - r) : sg(r * t.taxRate);
		return {
			id: crypto.randomUUID(),
			expenseAccountId: e.accountId,
			purchaseOrderLineId: "",
			productId: "",
			unitId: "",
			sku: "SERVICE",
			description: e.description,
			unitSymbol: "service",
			quantity: e.quantity,
			unitCost: n,
			...t,
			lineSubtotal: r,
			taxAmount: i,
			lineTotal: sg(r + i)
		};
	}) : e.lines.map((n) => Or({
		customerId: e.customerId,
		documentDate: e.documentDate,
		pricingContext: t,
		draft: n
	})), r = Dr(n);
	if (r.total <= 0 || !Number.isFinite(r.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: n,
		totals: r
	};
}
function pg(t) {
	let n = () => t === "sales" ? ng : rg;
	function r(e) {
		return t === "sales" ? ng = [...ng.filter((t) => t.id !== e.id), e] : rg = [...rg.filter((t) => t.id !== e.id), e], og(), e;
	}
	let i = (t) => {
		let r = n().find((e) => e.id === t);
		if (!r || e(r.id)) throw Error("Draft not found or is in the recycle bin.");
		return r;
	};
	function a(e, t) {
		if (e.revision !== t) throw Error("Draft changed. Reload before editing or approving.");
	}
	function o(e, t, n = {}, i) {
		return r({
			...e,
			...n,
			revision: e.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			history: [...e.history, cg(t, i)]
		});
	}
	let s = (e, t) => hg.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: () => ce(n()),
		reviewCapture(e) {
			if (k.require("purchases.bill"), t !== "expense") throw Error("Capture is only available for expense bills.");
			return eg(Qh.parse(e));
		},
		capture(e) {
			if (k.require("purchases.bill"), t !== "expense") throw Error("Capture is only available for expense bills.");
			let r = Qh.parse(e);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = $h(r);
			if (n().find((e) => e.operationId === r.operationId)) return s(r.operationId, i);
			let a = eg(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return s(r.operationId, i);
		},
		save(o) {
			let s = w({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: c().int().positive().optional(),
				payload: t === "sales" ? Jh : Yh
			}).strict().parse(o), l = JSON.stringify(s.payload);
			if (!s.id) {
				let t = n().find((e) => e.operationId === s.operationId);
				if (t) {
					if (e(t.id)) throw Error("Recover the existing draft from the recycle bin.");
					if (t.creationFingerprint !== l) throw Error("Operation ID was used for different draft data.");
					return t;
				}
			}
			let u = s.id ? i(s.id) : void 0;
			if (u && (a(u, s.expectedRevision ?? -1), u.status !== "DRAFT")) throw Error("Only unapproved drafts can be edited. Reopen an approved draft before editing.");
			if (s.payload.kind !== "EXPENSE") {
				let e = u?.payload.kind === "EXPENSE" ? void 0 : u?.payload, t = e && e.documentDate === s.payload.documentDate && (!s.payload.pricingAt || s.payload.pricingAt === e.pricingAt), n = Qe(s.payload.documentDate, s.payload.pricingAt ?? (t ? e.pricingAt : void 0), t ? e.pricingTimezone : x().timezone);
				s.payload = {
					...s.payload,
					...n
				};
			}
			let d = fg(s.payload), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
				id: u?.id ?? crypto.randomUUID(),
				operationId: u?.operationId ?? s.operationId,
				creationFingerprint: u?.creationFingerprint ?? l,
				revision: (u?.revision ?? 0) + 1,
				kind: s.payload.kind,
				status: "DRAFT",
				payload: s.payload.kind === "EXPENSE" ? s.payload : {
					...s.payload,
					lines: s.payload.lines.map((e, t) => ({
						...e,
						quantity: d.lines[t].quantity
					}))
				},
				recipient: s.payload.kind === "EXPENSE" ? void 0 : kt(s.payload.customerId, s.payload),
				...d,
				createdAt: u?.createdAt ?? f,
				updatedAt: f,
				history: [...u?.history ?? [], cg(u ? "Edited" : "Created")]
			};
			if (u && u.kind !== p.kind) throw Error("Document kind cannot change.");
			return dg(p), r(p);
		},
		approve(e, t) {
			let n = i(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (a(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return dg(n), o(n, "Approved", { status: "APPROVED" });
		},
		reopen(e, t, n) {
			let r = i(e);
			if (a(r, t), r.status !== "APPROVED" || n.trim().length < 3) throw Error("Only approved drafts can be reopened with a reason.");
			return o(r, "Reopened", { status: "DRAFT" }, n);
		},
		cancel(e, t, n) {
			let r = i(e);
			if (a(r, t), r.status === "POSTED" || r.status === "CANCELLED" || n.trim().length < 3) throw Error("Only unposted drafts can be cancelled with a reason.");
			return o(r, "Cancelled", { status: "CANCELLED" }, n);
		},
		post(e, t) {
			let n = i(e);
			if (n.status === "POSTED") return n;
			if (a(n, t), n.status !== "APPROVED") throw Error("Approve the draft before posting.");
			M(), _n(n.payload.documentDate), dg(n);
			let r, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = Ni.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), i = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: de("BILL", _o.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
					supplierInvoiceNumber: s.supplierInvoiceNumber,
					supplierId: e.id,
					supplierCode: e.code,
					supplierName: e.businessName,
					purchaseOrderId: "",
					purchaseOrderNumber: "Expense / service bill",
					billDate: s.documentDate,
					dueDate: s.dueDate,
					status: "OPEN",
					lines: structuredClone(n.lines),
					totals: {
						...n.totals,
						amountPaid: 0,
						amountCredited: 0,
						amountDue: n.totals.total
					},
					notes: s.notes,
					createdAt: t,
					updatedAt: t
				};
				_o.insertExpenseBill(i);
				let a = i.lines.filter((e) => e.lineSubtotal !== 0).map((e) => ({
					accountId: e.expenseAccountId,
					description: e.description,
					debit: e.lineSubtotal,
					credit: 0
				}));
				F.post({
					journalDate: i.billDate,
					description: "Expense bill " + i.billNumber,
					reference: i.supplierInvoiceNumber,
					sourceType: "SUPPLIER_BILL",
					sourceId: i.id,
					lines: [
						...a,
						...Kr(i.lines, "paid", !0, i.totals.taxAmount),
						{
							accountId: P.requireBySystemRole("ACCOUNTS_PAYABLE").id,
							debit: 0,
							credit: i.totals.total
						}
					]
				}), r = i.id;
			} else {
				let e = {
					recipient: structuredClone(n.recipient),
					draftId: n.id,
					customerId: s.customerId,
					documentDate: s.documentDate,
					customerReference: s.customerReference,
					notes: s.notes,
					lines: n.lines,
					totals: n.totals
				};
				r = s.kind === "ORDER" ? R.createManagedOrder(e).id : R.createManagedInvoice({
					...e,
					dueDate: s.dueDate
				}).id;
			}
			return o(n, "Posted", {
				status: "POSTED",
				documentId: r
			});
		},
		cancelOrder(e, t) {
			let n = i(e);
			if (n.kind !== "ORDER" || n.status !== "POSTED") throw Error("A confirmed managed order is required.");
			return R.cancelManagedOrder(n.documentId, t), o(n, "Order cancelled", {}, t);
		}
	};
}
var mg = pg("sales"), hg = pg("expense"), gg = w({
	recipient: w({
		locationId: y().optional(),
		locationName: y().optional(),
		deliveryAddress: y().optional(),
		accountingContactId: y().optional(),
		accountingContactName: y().optional(),
		accountingEmail: y().email().optional()
	}).strict().optional(),
	id: Z,
	operationId: Z,
	creationFingerprint: y().max(1e6),
	revision: c().int().positive(),
	kind: g([
		"ORDER",
		"INVOICE",
		"EXPENSE"
	]),
	status: g([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	payload: v([Jh, Yh]),
	lines: a(w({
		id: Z,
		description: y().min(1),
		quantity: c().finite().positive(),
		unitSymbol: y().min(1),
		unitPrice: c().finite().nonnegative().optional(),
		unitCost: c().finite().nonnegative().optional(),
		taxRate: c().finite().min(0).max(1),
		taxCode: Z,
		taxPaidAccountId: Z.optional(),
		taxCollectedAccountId: Z.optional(),
		lineSubtotal: c().finite().nonnegative(),
		taxAmount: c().finite().nonnegative(),
		lineTotal: c().finite().nonnegative()
	}).passthrough()).min(1),
	totals: w({
		subtotal: c().finite(),
		taxAmount: c().finite(),
		total: c().finite()
	}),
	documentId: Z.optional(),
	createdAt: Z,
	updatedAt: Z,
	history: a(w({
		action: Z,
		actorId: Z,
		at: Z,
		reason: y().optional()
	}).strict()).min(1)
}).strict();
for (let e of ["sales", "expense"]) m(e === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: e === "sales" ? mg : hg,
	read: e === "sales" ? "sales.read" : "purchases.read",
	commands: {
		reviewCapture: e === "expense" ? "purchases.bill" : null,
		capture: e === "expense" ? "purchases.bill" : null,
		save: e === "sales" ? "sales.manage" : "purchases.bill",
		approve: e === "sales" ? "sales.manage" : "accounting.post",
		reopen: e === "sales" ? "sales.manage" : "accounting.post",
		cancel: e === "sales" ? "sales.manage" : "purchases.bill",
		post: e === "sales" ? "sales.manage" : "purchases.bill",
		cancelOrder: e === "sales" ? "sales.manage" : null
	},
	snapshot: () => e === "sales" ? { drafts: ng } : {
		drafts: rg,
		options: tg()
	},
	restore: (t) => {
		e === "sales" ? ng = t.drafts : (rg = t.drafts, t.options);
	},
	publish: og,
	validate: (t, n) => {
		let { drafts: r } = w({
			drafts: a(gg),
			...e === "expense" ? { options: a(w({
				id: Z,
				code: Z,
				name: Z
			}).strict()) } : {}
		}).strict().parse(t);
		for (let t of r) {
			if (At(t.recipient), t.kind !== t.payload.kind || e === "expense" != (t.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (T(t.payload.documentDate), t.payload.dueDate && (T(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate)) throw Error("Draft due date is invalid.");
			let r = n, i = t.payload.kind === "EXPENSE" ? t.payload.supplierId : t.payload.customerId;
			if (!(t.payload.kind === "EXPENSE" ? r.suppliers.suppliers : r.customers.customers).some((e) => e.id === i) || t.lines.length !== t.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [e, n] of t.lines.entries()) {
				let i = t.payload.lines[e], a = n;
				if (t.kind !== "EXPENSE") {
					if (ct(a), $e(a, t.payload.documentDate), t.payload.kind !== "EXPENSE" && (t.payload.pricingAt !== a.pricingAt || t.payload.pricingTimezone !== a.pricingTimezone)) throw Error("Draft pricing context mismatch.");
					if (nt(a, r.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea) throw Error("Draft area requirement mismatch.");
				}
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || sg(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
				if (t.kind === "EXPENSE") {
					if (typeof a.unitCost != "number") throw Error("Expense line unit cost is invalid.");
					if (a.expenseAccountId !== i.accountId || !r.accounts.accounts.some((e) => e.id === a.expenseAccountId && e.type === "EXPENSE")) throw Error("Draft expense account reference is invalid.");
				} else if (typeof a.unitPrice != "number" || a.productId !== i.productId || a.unitId !== i.unitId || !r.products.products.some((e) => e.id === a.productId && e.units.some((e) => e.id === a.unitId))) throw Error("Draft product/unit reference is invalid.");
				for (let [e, t] of [["taxPaidAccountId", "ASSET"], ["taxCollectedAccountId", "LIABILITY"]]) if (a[e] && !r.accounts.accounts.some((n) => n.id === a[e] && n.type === t)) throw Error("Draft tax account reference is invalid.");
			}
			for (let e of [
				"subtotal",
				"taxAmount",
				"total"
			]) {
				let n = e === "subtotal" ? "lineSubtotal" : e === "total" ? "lineTotal" : "taxAmount";
				if (sg(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Draft totals do not match lines.");
			}
			if (t.status === "POSTED") {
				let e = n;
				if (!(t.kind === "EXPENSE" ? e.supplierBills.supplierBills : t.kind === "ORDER" ? e.sales.salesOrders : e.sales.invoices).some((e) => e.id === t.documentId && e.managedDraftId === t.id && e.totals.total === t.totals.total)) throw Error("Posted draft source reference is invalid.");
			}
		}
	}
});
//#endregion
//#region src/features/recurring/recurringDates.ts
var _g = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function vg(e, t, n) {
	if (T(e), !Number.isSafeInteger(n) || n < 0 || !_g.includes(t)) throw Error("Invalid schedule occurrence.");
	let r = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	if (t === "Weekly" || t === "Fortnightly") r.setUTCDate(r.getUTCDate() + n * (t === "Weekly" ? 7 : 14));
	else {
		let e = r.getUTCDate();
		r.setUTCDate(1), r.setUTCMonth(r.getUTCMonth() + n * (t === "Monthly" ? 1 : 3));
		let i = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
		r.setUTCDate(Math.min(e, i));
	}
	let i = r.toISOString().slice(0, 10);
	return T(i), i;
}
function yg(e, t) {
	T(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return T(r), r;
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var bg = y().trim().min(1).max(200), xg = y().refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), Sg = w({
	operationId: bg,
	name: bg,
	sourceDraftId: bg,
	frequency: g(_g),
	firstDate: xg,
	endDate: xg
}).strict(), Cg = w({
	id: bg,
	expectedRevision: c().int().positive(),
	name: bg,
	endDate: xg
}).strict(), wg = y().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), Tg = w({
	id: bg,
	name: bg,
	kind: g(["INVOICE", "EXPENSE"]),
	status: g([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: c().int().positive(),
	operationId: bg,
	creationFingerprint: y().min(1).max(2e3),
	sourceDraftId: bg,
	payload: ee(),
	frequency: g(_g),
	firstDate: xg,
	nextDate: xg,
	endDate: xg,
	occurrence: c().int().nonnegative(),
	termsDays: c().int().nonnegative(),
	createdAt: wg,
	updatedAt: wg
}).strict(), Eg = w({
	id: bg,
	scheduleId: bg,
	date: xg,
	draftId: bg,
	actorId: bg,
	createdAt: wg
}).strict(), Dg = 0, Og = /* @__PURE__ */ new Set(), kg = () => {
	Dg++, Og.forEach((e) => e());
}, Ag = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, jg = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", Mg = (e) => e === "INVOICE" ? mg : hg, Ng = () => (/* @__PURE__ */ new Date()).toISOString();
function Pg(e) {
	return e.payload.kind === "EXPENSE" ? {
		...structuredClone(e.payload),
		lines: e.payload.lines.map((t, n) => ({
			...t,
			unitCost: e.lines[n].unitCost,
			priceBasis: "Exclusive"
		}))
	} : {
		...structuredClone(e.payload),
		lines: e.payload.lines.map((t, n) => ({
			...t,
			unitPrice: e.lines[n].unitPrice,
			priceBasis: "Exclusive"
		}))
	};
}
function Fg(e) {
	let t = () => Ag[e], n = (e) => {
		let n = t().schedules.find((t) => t.id === e);
		if (!n) throw Error("Recurring schedule not found.");
		return n;
	}, r = (e, t) => {
		if (e.revision !== t) throw Error("Schedule changed. Reload before continuing.");
	};
	return {
		getAll: () => t().schedules,
		getRuns: () => t().runs,
		create(n) {
			k.require(jg(e));
			let r = Sg.parse(n), i = JSON.stringify(r), a = t().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = Mg(e).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== e || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = Pg(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = Ng(), u = {
				...r,
				id: crypto.randomUUID(),
				kind: e,
				status: "Active",
				revision: 1,
				creationFingerprint: i,
				payload: s,
				termsDays: c,
				occurrence: 0,
				nextDate: r.firstDate,
				createdAt: l,
				updatedAt: l
			};
			return t().schedules = [...t().schedules, u], kg(), u;
		},
		update(i) {
			k.require(jg(e));
			let a = Cg.parse(i), o = n(a.id);
			if (r(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < t().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: Ng()
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? s : e), kg(), s;
		},
		setStatus(i) {
			k.require(jg(e));
			let a = w({
				id: bg,
				expectedRevision: c().int().positive(),
				status: g(["Active", "Paused"])
			}).strict().parse(i), o = n(a.id);
			if (r(o, a.expectedRevision), o.nextDate > o.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let s = {
				...o,
				status: a.status,
				revision: o.revision + 1,
				updatedAt: Ng()
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? s : e), kg(), s;
		},
		generate(i) {
			k.require(jg(e));
			let a = w({
				id: bg,
				expectedRevision: c().int().positive(),
				date: xg
			}).strict().parse(i), o = n(a.id), s = t().runs.find((e) => e.scheduleId === o.id && e.date === a.date);
			if (s) return {
				schedule: o,
				run: s,
				draft: Mg(e).getAll().find((e) => e.id === s.draftId)
			};
			if (r(o, a.expectedRevision), o.status !== "Active") throw Error("Activate the schedule before generating.");
			if (a.date !== o.nextDate) throw Error("Generate the next occurrence in order.");
			if (a.date > S(Ng())) throw Error("This occurrence is not due yet.");
			if (a.date > o.endDate) throw Error("The schedule has ended.");
			let l = vg(o.firstDate, o.frequency, o.occurrence + 1), u = structuredClone(o.payload);
			u.documentDate = a.date, u.kind !== "EXPENSE" && (delete u.pricingAt, delete u.pricingTimezone), u.dueDate = yg(a.date, o.termsDays), u.kind === "EXPENSE" && (u.supplierInvoiceNumber = u.supplierInvoiceNumber.slice(0, 170) + " [" + a.date + "]");
			let d = Mg(e).save({
				operationId: "recurring:" + o.id + ":" + a.date,
				payload: u
			}), f = Ng(), p = {
				id: crypto.randomUUID(),
				scheduleId: o.id,
				date: a.date,
				draftId: d.id,
				actorId: k.current().userId,
				createdAt: f
			}, m = {
				...o,
				nextDate: l,
				occurrence: o.occurrence + 1,
				status: l > o.endDate ? "Ended" : "Active",
				revision: o.revision + 1,
				updatedAt: f
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? m : e), t().runs = [...t().runs, p], kg(), {
				schedule: m,
				run: p,
				draft: d
			};
		}
	};
}
var Ig = Fg("INVOICE"), Lg = Fg("EXPENSE");
for (let e of ["INVOICE", "EXPENSE"]) m(e === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: e === "INVOICE" ? Ig : Lg,
	read: e === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: jg(e),
		update: jg(e),
		setStatus: jg(e),
		generate: jg(e)
	},
	snapshot: () => structuredClone(Ag[e]),
	restore: (t) => {
		Ag[e] = t;
	},
	publish: kg,
	validate: (t, n) => {
		w({
			schedules: a(Tg),
			runs: a(Eg)
		}).strict().parse(t);
		let r = t, i = n;
		for (let t of r.schedules) {
			if (t.kind !== e || ![
				"Active",
				"Paused",
				"Ended"
			].includes(t.status) || !Number.isSafeInteger(t.revision) || t.revision < 1 || !Number.isSafeInteger(t.occurrence) || t.occurrence < 0 || !Number.isInteger(t.termsDays) || t.termsDays < 0 || t.payload.kind !== e) throw Error("Invalid recurring schedule.");
			if (Sg.parse({
				operationId: t.operationId,
				name: t.name,
				sourceDraftId: t.sourceDraftId,
				frequency: t.frequency,
				firstDate: t.firstDate,
				endDate: t.endDate
			}), Xh(t.payload), !t.id || !t.creationFingerprint || !Number.isFinite(Date.parse(t.createdAt)) || !Number.isFinite(Date.parse(t.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (T(t.payload.documentDate), T(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate || t.termsDays !== Math.round((Date.parse(t.payload.dueDate + "T00:00:00Z") - Date.parse(t.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (t.payload.kind === "EXPENSE") {
				if (!i.suppliers.suppliers.some((e) => e.id === t.payload.supplierId) || t.payload.lines.some((e) => !i.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!i.customers.customers.some((e) => e.id === t.payload.customerId) || t.payload.lines.some((e) => !i.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (t.status === "Ended" != t.nextDate > t.endDate) throw Error("Recurring end status is inconsistent.");
			if (t.nextDate !== vg(t.firstDate, t.frequency, t.occurrence) || t.endDate < t.firstDate) throw Error("Invalid recurring dates.");
			let n = (e === "INVOICE" ? i.managedSalesDocuments : i.expenseBillDrafts).drafts.find((e) => e.id === t.sourceDraftId);
			if (!n || n.kind !== e) throw Error("Recurring template source is missing.");
			let a = r.runs.filter((e) => e.scheduleId === t.id);
			if (a.length !== t.occurrence || new Set(a.map((e) => e.date)).size !== a.length) throw Error("Recurring run history does not match schedule.");
			for (let e = 0; e < a.length; e++) if (!a.some((n) => n.date === vg(t.firstDate, t.frequency, e))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let t of r.runs) {
			let n = r.schedules.find((e) => e.id === t.scheduleId), a = (e === "INVOICE" ? i.managedSalesDocuments : i.expenseBillDrafts).drafts.find((e) => e.id === t.draftId);
			if (!n || !a || a.kind !== e || a.operationId !== "recurring:" + n.id + ":" + t.date || !t.actorId || !Number.isFinite(Date.parse(t.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = y().trim().min(1).max(200), Rg = c().finite().positive(), zg = c().finite().nonnegative(), Bg = w({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: y().trim().min(3).max(2e3),
	lines: a(w({
		matchId: Q,
		quantity: Rg
	}).strict()).min(1).max(500)
}).strict(), Vg = w({
	id: Q,
	matchId: Q,
	supplierBillLineId: Q,
	goodsReceiptId: Q,
	goodsReceiptLineId: Q,
	productId: Q,
	unitId: Q,
	baseUnitId: Q,
	sku: Q,
	description: y(),
	unitSymbol: Q,
	quantity: Rg,
	conversionToBase: Rg,
	quantityBase: Rg,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: zg,
	inventoryValue: zg,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), Hg = w({
	id: Q,
	returnNumber: Q,
	operationId: Q,
	requestFingerprint: y().max(1e6),
	supplierBillId: Q,
	supplierBillNumber: Q,
	supplierId: Q,
	supplierName: Q,
	supplierCreditId: Q,
	returnDate: Q,
	reason: y().min(3).max(2e3),
	status: g(["POSTED", "VOID"]),
	lines: a(Vg).min(1),
	inventoryValue: zg,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: y().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), Ug = [], Wg = 0, Gg = /* @__PURE__ */ new Set(), Kg = () => {
	Wg++, Gg.forEach((e) => e());
}, qg = (e) => Math.round(e * 1e4) / 1e4, Jg = (e) => Math.round(e * 100) / 100;
function Yg(e, t, n) {
	if (wa.getAll().some((r) => r.siteId === t && r.productId === n && S(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function Xg(e) {
	let t = _o.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : co.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = Xa.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? at(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = Ug.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
		return [{
			matchId: e.id,
			supplierBillLineId: n.id,
			goodsReceiptId: r.id,
			goodsReceiptLineId: i.id,
			receiptNumber: r.receiptNumber,
			siteId: r.siteId,
			siteName: r.siteName,
			receiptDate: r.receiptDate,
			description: n.description,
			sku: n.sku,
			unitId: n.unitId,
			unitSymbol: n.unitSymbol,
			productId: n.productId,
			conversionToBase: a.conversionToBase,
			availableQuantity: Math.floor(Math.max(0, e.matchedBaseQuantity - o) / a.conversionToBase * 1e4 + 1e-8) / 1e4
		}];
	});
}
m("physicalSupplierReturns", {
	repository: {
		create(e) {
			let t = Bg.parse(e), n = JSON.stringify(t), r = Ug.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			M(), T(t.returnDate, "Return date"), _n(t.returnDate);
			let i = _o.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = Xg(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (qg(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = it(n.productId), i = at(n.productId, n.unitId), s = la.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				Yg(t.returnDate, s.id, r.id);
				let c = qg(e.quantity * n.conversionToBase);
				if (c <= 0) throw Error("Return base quantity rounds to zero.");
				return {
					...n,
					quantity: e.quantity,
					quantityBase: c,
					baseUnitId: r.baseUnitId
				};
			}), c = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = e.siteId + "|" + e.productId;
				c.set(t, qg((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((Ua.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: qg((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(Ug.length + 1).padStart(5, "0"), f = H.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				Ua.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = ma.create({
					movementType: "RETURN_OUT",
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: -e.quantityBase,
					transactionUnitId: e.unitId,
					transactionUnitSymbol: e.unitSymbol,
					transactionQuantity: -e.quantity,
					conversionToBase: e.conversionToBase,
					referenceType: "SUPPLIER_RETURN",
					referenceId: u,
					referenceNumber: d,
					purchaseOrderId: i.purchaseOrderId,
					purchaseOrderNumber: i.purchaseOrderNumber,
					occurredAt: t.returnDate,
					notes: t.reason
				}), r = La({
					siteId: e.siteId,
					productId: e.productId,
					unitId: e.unitId,
					quantity: e.quantity,
					movementType: "RETURN_OUT",
					referenceType: "SUPPLIER_RETURN",
					referenceId: u,
					referenceNumber: d,
					inventoryMovementId: n.id,
					occurredAt: t.returnDate,
					notes: t.reason
				}).movement;
				return {
					id: crypto.randomUUID(),
					matchId: e.matchId,
					supplierBillLineId: e.supplierBillLineId,
					goodsReceiptId: e.goodsReceiptId,
					goodsReceiptLineId: e.goodsReceiptLineId,
					productId: e.productId,
					unitId: e.unitId,
					baseUnitId: e.baseUnitId,
					sku: e.sku,
					description: e.description,
					unitSymbol: e.unitSymbol,
					quantity: e.quantity,
					conversionToBase: e.conversionToBase,
					quantityBase: e.quantityBase,
					siteId: e.siteId,
					siteName: e.siteName,
					inventoryMovementId: n.id,
					costMovementId: r.id,
					unitCostBase: r.unitCostBase,
					inventoryValue: -r.valueChange
				};
			}), m = Jg(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? F.post({
				journalDate: t.returnDate,
				description: `Physical supplier return ${d}`,
				reference: f.creditNumber,
				sourceType: "SUPPLIER_RETURN",
				sourceId: u,
				lines: [{
					accountId: P.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id,
					debit: m,
					credit: 0
				}, {
					accountId: P.requireBySystemRole("INVENTORY").id,
					debit: 0,
					credit: m
				}]
			}) : void 0, g = {
				id: u,
				returnNumber: d,
				operationId: t.operationId,
				requestFingerprint: n,
				supplierBillId: i.id,
				supplierBillNumber: i.billNumber,
				supplierId: i.supplierId,
				supplierName: i.supplierName,
				supplierCreditId: f.id,
				returnDate: t.returnDate,
				reason: t.reason,
				status: "POSTED",
				lines: p,
				inventoryValue: m,
				journalId: h?.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				createdBy: k.current()?.userId ?? "local-test"
			};
			return Ug = [g, ...Ug], Kg(), g;
		},
		reverse(e) {
			let t = w({
				returnId: Q,
				voidDate: Q,
				reason: y().trim().min(3).max(2e3)
			}).strict().parse(e), n = Ug.find((e) => e.id === t.returnId);
			if (!n) throw Error("Supplier return not found.");
			if (n.status === "VOID") return n;
			if (M(), T(t.voidDate, "Reversal date"), _n(t.voidDate), t.voidDate < n.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of n.lines) Yg(t.voidDate, e.siteId, e.productId);
			let r = H.getById(n.supplierCreditId);
			if ((r.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > t.voidDate) || H.getAllocationsByCredit(r.id).some((e) => e.reversedAt && S(e.reversedAt) > t.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			H.voidReturnCredit({
				supplierCreditId: n.supplierCreditId,
				reason: t.reason,
				voidDate: t.voidDate
			});
			let i = n.lines.map((e) => {
				Ua.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let r = ma.create({
					movementType: "RETURN_IN",
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase,
					transactionUnitId: e.unitId,
					transactionUnitSymbol: e.unitSymbol,
					transactionQuantity: e.quantity,
					conversionToBase: e.conversionToBase,
					referenceType: "SUPPLIER_RETURN_VOID",
					referenceId: n.id,
					referenceNumber: n.returnNumber,
					occurredAt: t.voidDate,
					notes: t.reason
				}), i = Ra({
					siteId: e.siteId,
					productId: e.productId,
					quantityBase: e.quantityBase,
					unitCostBase: e.unitCostBase,
					inventoryValue: e.inventoryValue,
					referenceType: "SUPPLIER_RETURN_VOID",
					referenceId: n.id,
					referenceNumber: n.returnNumber,
					inventoryMovementId: r.id,
					occurredAt: t.voidDate,
					notes: t.reason
				}).movement;
				return {
					...e,
					voidInventoryMovementId: r.id,
					voidCostMovementId: i.id
				};
			});
			n.journalId && F.reverse({
				journalEntryId: n.journalId,
				reversalDate: t.voidDate,
				reason: t.reason
			});
			let a = {
				...n,
				status: "VOID",
				lines: i,
				voidDate: t.voidDate,
				voidReason: t.reason,
				voidedAt: (/* @__PURE__ */ new Date()).toISOString(),
				voidedBy: k.current()?.userId ?? "local-test"
			};
			return Ug = Ug.map((e) => e.id === n.id ? a : e), Kg(), a;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: Ug }),
	restore: (e) => {
		Ug = e.returns;
	},
	publish: Kg,
	validate: (e, t) => {
		let n = w({ returns: a(Hg) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.returns) {
			T(e.returnDate), e.voidDate && T(e.voidDate);
			let t = Bg.parse(JSON.parse(e.requestFingerprint));
			if (i.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			i.add(e.operationId);
			let n = r.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), a = r.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !a || e.status === "VOID" != (a.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (Jg(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let i = r.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), a = r.costMovements.movements.find((e) => e.id === t.costMovementId), o = r.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = r.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!i || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || i.productId !== t.productId || !a || !o || a.referenceType !== "SUPPLIER_RETURN" || a.referenceId !== e.id || a.inventoryMovementId !== o.id || a.siteId !== t.siteId || a.productId !== t.productId || a.unitCostBase !== t.unitCostBase || a.quantityBase !== -t.quantityBase || Jg(-a.valueChange) !== Jg(t.inventoryValue) || qg(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || S(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = r.costMovements.movements.find((e) => e.id === t.voidCostMovementId), i = r.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !i || n.inventoryMovementId !== i.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || Jg(n.valueChange) !== Jg(t.inventoryValue) || i.referenceType !== "SUPPLIER_RETURN_VOID" || i.quantityBase !== t.quantityBase || i.referenceId !== e.id || S(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
				}
			}
			let o = /* @__PURE__ */ new Set();
			for (let n of e.lines) {
				if (o.has(n.matchId)) throw Error("Duplicate return receipt match.");
				o.add(n.matchId);
				let e = t.lines.find((e) => e.matchId === n.matchId);
				if (!e || e.quantity !== n.quantity) throw Error("Supplier return request quantities mismatch.");
			}
			if (t.lines.length !== e.lines.length) throw Error("Supplier return request line count mismatch.");
			for (let t of new Set(e.lines.map((e) => e.supplierBillLineId))) {
				let n = qg(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!a.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !r.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of r.supplierCredits.supplierCredits) if (e.physicalReturnId && !n.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of r.receiptMatches.matches) if (qg(n.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var Zg = y().min(1).max(200), Qg = y().max(2e4), $g = Qg.optional(), e_ = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], t_ = w({
	operationId: Zg,
	sourceId: Zg,
	kind: g(e_),
	expectedUpdatedAt: Zg,
	templateId: Zg.optional()
}).strict(), n_ = c().finite().nonnegative(), r_ = w({
	itemType: g([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: Zg,
	sku: Qg,
	description: Qg,
	unitSymbol: Qg,
	quantity: c().positive().finite(),
	unitPrice: n_,
	lineSubtotal: n_,
	taxAmount: n_,
	lineTotal: n_,
	taxCode: $g,
	taxRate: c().finite().min(0).max(1).optional(),
	requestedArea: c().positive().finite().optional(),
	areaPerPack: c().positive().finite().optional(),
	coveredArea: c().positive().finite().optional()
}).strict(), i_ = w({
	locationId: $g,
	locationName: $g,
	deliveryAddress: $g,
	accountingContactId: $g,
	accountingContactName: $g,
	accountingEmail: $g
}).strict(), a_ = w({
	id: Zg,
	revision: Zg,
	name: Qg,
	subject: Qg,
	body: Qg,
	footer: Qg,
	paper: g(["A4", "Letter"])
}).strict(), o_ = w({
	id: Zg,
	operationId: Zg,
	requestFingerprint: Qg,
	preparedAt: Zg,
	preparedBy: Zg,
	sourceId: Zg,
	kind: g(e_),
	sourceUpdatedAt: Zg,
	documentNumber: Zg,
	status: Zg,
	documentDate: Zg,
	dueDate: $g,
	expiryDate: $g,
	reference: $g,
	notes: $g,
	customerId: Zg,
	customerName: Qg,
	customerCode: Qg,
	customerIdentifier: $g,
	recipient: i_.optional(),
	issuer: w({
		name: Qg,
		tradingName: $g,
		identifier: $g,
		address: $g,
		email: $g,
		phone: $g,
		currency: Zg
	}).strict(),
	lines: a(r_).min(1),
	totals: w({
		subtotal: n_,
		taxAmount: n_,
		total: n_
	}).strict(),
	amountPaid: n_.optional(),
	amountDue: n_.optional(),
	template: a_,
	subject: Qg,
	body: Qg
}).strict();
function s_(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = I.getById(t);
		if (!e) throw Error("Credit note was not found.");
		return {
			...e,
			type: "CREDIT_NOTE",
			documentNumber: e.creditNoteNumber,
			documentDate: e.creditDate
		};
	}
	let n = R.getById(t);
	if (!n || n.type !== e) throw Error("Sales document was not found.");
	return n;
}
var c_ = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function l_() {
	return (C.templates ?? []).filter((e) => e.status === "Active" && [
		"Quotation",
		"Invoice",
		"Sales order",
		"Credit note"
	].includes(e.kind)).map((e) => ({
		id: e.id,
		name: e.name,
		kind: e.kind
	}));
}
var u_ = [];
l_();
var d_ = 0, f_ = /* @__PURE__ */ new Set(), p_ = () => {
	d_++, f_.forEach((e) => e());
};
function m_(e, t) {
	let n = t ? C.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === c_(e)) : void 0;
	if (t && !n) throw Error("Select an active template for this document type.");
	return {
		id: n?.id ?? "built-in",
		revision: n?.revision ?? "1",
		name: n?.name ?? "Standard sales document",
		subject: n?.subject ?? "{{documentNumber}} · {{companyName}}",
		body: n?.body ?? "Dear {{customerName}},\nPlease find {{documentNumber}} for {{currency}} {{total}}.\n{{companyName}}",
		footer: n?.footer ?? "",
		paper: n?.paper === "Letter" ? "Letter" : "A4"
	};
}
var h_ = [
	"documentNumber",
	"customerName",
	"companyName",
	"currency",
	"total",
	"documentDate",
	"dueDate",
	"store",
	"accountingContact"
];
function g_(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!h_.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function __(e) {
	return {
		itemType: e.itemType,
		id: e.id,
		sku: e.sku,
		description: e.description,
		unitSymbol: e.unitSymbol,
		quantity: e.quantity,
		unitPrice: e.unitPrice,
		lineSubtotal: e.lineSubtotal,
		taxAmount: e.taxAmount,
		lineTotal: e.lineTotal,
		taxCode: e.taxCode,
		taxRate: e.taxRate,
		requestedArea: e.requestedArea,
		areaPerPack: e.areaPerPack,
		coveredArea: e.coveredArea
	};
}
var v_ = { prepare(e) {
	let t = t_.parse(e), n = JSON.stringify(t), r = u_.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = s_(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = A.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = x(), s = m_(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
		documentNumber: i.documentNumber,
		customerName: a.businessName,
		companyName: o.companyName,
		currency: o.currency,
		total: i.totals.total.toFixed(2),
		documentDate: i.documentDate,
		dueDate: "dueDate" in i ? i.dueDate : "",
		store: c?.locationName ?? "",
		accountingContact: c?.accountingContactName ?? ""
	}, u = {
		id: crypto.randomUUID(),
		operationId: t.operationId,
		requestFingerprint: n,
		preparedAt: (/* @__PURE__ */ new Date()).toISOString(),
		preparedBy: k.current()?.userId ?? "local-test",
		sourceId: i.id,
		kind: t.kind,
		sourceUpdatedAt: i.updatedAt,
		documentNumber: i.documentNumber,
		status: i.status,
		documentDate: i.documentDate,
		dueDate: "dueDate" in i ? i.dueDate : void 0,
		expiryDate: "expiryDate" in i ? i.expiryDate : void 0,
		reference: "customerReference" in i ? i.customerReference : void 0,
		notes: "reason" in i ? i.reason : i.notes,
		customerId: a.id,
		customerName: a.businessName,
		customerCode: a.code,
		customerIdentifier: a.abn,
		recipient: c,
		issuer: {
			name: o.companyName,
			tradingName: o.tradingName,
			identifier: o.identifier,
			address: o.address,
			email: o.email,
			phone: o.phone,
			currency: o.currency
		},
		lines: i.lines.map(__),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: g_(s.footer, l)
		},
		subject: g_(s.subject, l),
		body: g_(s.body, l)
	};
	return y_(u), u_ = [u, ...u_], p_(), u;
} };
function y_(e) {
	let t = o_.parse(e);
	if (At(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = t_.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (ct(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
m("preparedSalesOutputs", {
	repository: v_,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: u_,
		templates: l_()
	}),
	restore: (e) => {
		u_ = e.artifacts, e.templates;
	},
	publish: p_,
	validate: (e, t) => {
		let n = w({
			artifacts: a(o_),
			templates: a(w({
				id: Zg,
				name: Qg,
				kind: Zg
			}).strict())
		}).strict().parse(e), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
		for (let e of n.artifacts) {
			if (y_(e), r.has(e.id) || i.has(e.operationId)) throw Error("Duplicate prepared output.");
			r.add(e.id), i.add(e.operationId);
			let n = t, a = e.kind === "CREDIT_NOTE" ? n.customerCredits.creditNotes.find((t) => t.id === e.sourceId) : [
				...n.sales.quotes,
				...n.sales.salesOrders,
				...n.sales.invoices
			].find((t) => t.id === e.sourceId && t.type === e.kind);
			if (!a || a.customerId !== e.customerId) throw Error("Prepared output source reference is invalid.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/dispatchRepository.ts
var b_ = y().trim().min(1).max(200), x_ = w({
	operationId: b_,
	salesOrderId: b_,
	siteId: b_,
	fulfilmentDate: b_,
	lines: a(w({
		salesOrderLineId: b_,
		fulfilledQuantity: c().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function S_() {
	return R.getAll().filter((e) => e.type === "SALES_ORDER" && [
		"CONFIRMED",
		"PARTIALLY_FULFILLED",
		"INVOICED"
	].includes(e.status)).filter((e) => e.type === "SALES_ORDER" && (e.status !== "INVOICED" || e.invoiceIds.some((e) => {
		let t = R.getById(e);
		return t?.type === "INVOICE" && t.status !== "VOID";
	}))).map((e) => ({
		id: e.id,
		number: e.documentNumber,
		date: e.documentDate,
		delivery: e.recipient?.deliveryAddress,
		store: e.recipient?.locationName,
		lines: e.lines.filter(tt).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: Fu.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
S_();
var C_ = [], w_ = 0, T_ = /* @__PURE__ */ new Set(), E_ = () => {
	w_++, T_.forEach((e) => e());
};
m("salesDispatch", {
	repository: {
		record(e) {
			let t = x_.parse(e), n = JSON.stringify(t), r = C_.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return Fu.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (M(), T(t.fulfilmentDate), _n(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = Fu.create(t);
			return C_ = [...C_, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], E_(), i;
		},
		reverse(e) {
			let t = w({
				fulfilmentId: b_,
				voidDate: b_,
				reason: y().trim().min(3).max(1e3)
			}).strict().parse(e);
			M(), T(t.voidDate), _n(t.voidDate);
			let n = Fu.getAll().find((e) => e.id === t.fulfilmentId);
			return n?.status === "VOIDED" ? n : Fu.void(t);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: S_(),
		requests: C_
	}),
	restore: (e) => {
		e.orders, C_ = e.requests;
	},
	publish: E_,
	validate: (e, t) => {
		let n = w({
			orders: a(w({
				id: b_,
				number: b_,
				date: b_,
				delivery: y().optional(),
				store: y().optional(),
				lines: a(w({
					id: b_,
					sku: y(),
					description: y(),
					unit: y(),
					quantity: c().finite().positive(),
					fulfilled: c().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: a(w({
				id: b_,
				fingerprint: y().max(1e6),
				fulfilmentId: b_
			}).strict())
		}).strict().parse(e), r = t.fulfilments.fulfilments;
		if (n.requests.some((e) => !r.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/purchases/data/supplierBillBalanceAsAtService.ts
function D_(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && O_(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = k_(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && O_(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = k_(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && O_(n.reversedAt) <= r ? t : t + n.amount, 0)), o = k_(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: k_(Math.max(0, o - i - a))
	};
}
function O_(e) {
	return S(e);
}
function k_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function A_(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && j_(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = M_(e.totals.total), i = M_(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && j_(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: M_(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function j_(e) {
	return S(e);
}
function M_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function N_(e, t, n = [], r = [], i = [], a = B_()) {
	let o = I_(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = D_(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = F_(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = z_(r.reduce((t, n) => n.supplierId === e.id ? t + A_(n, i, a).amountAvailable : t, 0)), p = z_(s), m = z_(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: z_(c),
		aging: L_(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function P_(e, t, n = [], r = [], i = [], a = B_()) {
	let o = I_(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = N_(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: z_(s),
		unallocatedCredit: z_(c),
		totalOutstanding: z_(l),
		overdueAmount: z_(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: L_(o)
	};
}
function F_(e, t = B_()) {
	let n = R_(e), r = R_(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function I_() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function L_(e) {
	return {
		current: z_(e.current),
		days1To30: z_(e.days1To30),
		days31To60: z_(e.days31To60),
		days61To90: z_(e.days61To90),
		days90Plus: z_(e.days90Plus)
	};
}
function R_(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function z_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function B_() {
	return S((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function V_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function H_({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = P_(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = V_(Rc(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = V_(c.totalOutstanding), f = V_(d - u);
	return {
		asOfDate: s,
		grossOutstanding: V_(c.grossOutstanding),
		unallocatedCredit: V_(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function U_(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function W_(e) {
	return e.slice(0, 10);
}
function G_(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function K_(e, t) {
	U_(t);
	let n = e.filter((e) => W_(e.occurredAt) <= t).slice().sort(G_), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = z(n.quantityOnHand + e.quantityBase), a = Xi(n.inventoryValue + e.valueChange);
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
		let t = la.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = it(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : Yi(e.inventoryValue / e.quantityOnHand);
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
		totalInventoryValue: Xi(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function q_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function J_(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Y_({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	J_(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = K_(n, r), o = q_(Rc(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = q_(a.totalInventoryValue), c = q_(s - o);
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
//#region src/features/finance-foundation/openingBalanceRepository.ts
var X_ = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = y().trim().min(1).max(200), Z_ = c().finite().refine((e) => X_(e) === e, "Amounts must use cents precision"), Q_ = w({
	accountId: $,
	debit: Z_.nonnegative(),
	credit: Z_.nonnegative()
}).strict(), $_ = w({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: Z_
}).strict(), ev = w({
	operationId: $,
	date: $,
	reason: y().trim().min(3).max(1e3),
	gl: a(Q_).min(2).max(5e3),
	ar: a($_).max(1e4),
	ap: a($_).max(1e4),
	banks: a(w({
		bankAccountId: $,
		amount: Z_
	}).strict()).max(500),
	stock: a(w({
		siteId: $,
		productId: $,
		quantity: c().positive().finite(),
		unitCost: c().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), tv = [], nv = 0, rv = /* @__PURE__ */ new Set(), iv = () => {
	nv++, rv.forEach((e) => e());
};
function av() {
	return n();
}
function ov(e) {
	xe(e), sn(e.sales), Xn(e.customerCredits), D.update("supplierBills", e.supplierBills.supplierBills), D.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function sv(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function cv(e) {
	let t = ev.parse(e);
	if (T(t.date, "Cutover date"), _n(t.date), M(), tv.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = av();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	sv(t.gl.map((e) => e.accountId), "GL account"), sv(t.banks.map((e) => e.bankAccountId), "bank"), sv(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = Bc({
		customers: n.customers.customers,
		documents: [
			...n.sales.quotes,
			...n.sales.salesOrders,
			...n.sales.invoices
		],
		payments: n.customerPayments.payments,
		creditNotes: n.customerCredits.creditNotes,
		creditAllocations: n.customerCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), i = H_({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Y_({
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		costMovements: n.costMovements.movements,
		asOfDate: t.date
	});
	if (!r.reconciled || !i.reconciled || !a.reconciled) throw Error(`Existing balances do not reconcile with GL: AR ${r.difference.toFixed(2)}, AP ${i.difference.toFixed(2)}, inventory ${a.difference.toFixed(2)}. Resolve existing differences before importing opening balances.`);
	for (let e of n.stock.balances) {
		let t = n.costBalances.balances.find((t) => t.siteId === e.siteId && t.productId === e.productId);
		if (e.quantityOnHand !== (t?.quantityOnHand ?? 0)) throw Error("Existing stock quantity and valuation quantity differ.");
	}
	let o = P.getAll(), s = (e) => P.requireBySystemRole(e).id, c = (e) => X_(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = P.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = X_(t.gl.reduce((e, t) => e + t.debit, 0)), u = X_(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = X_(t.ar.reduce((e, t) => e + t.amount, 0)), f = X_(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		sv(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (T(i.date), T(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = it(e.productId), n = la.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = X_(p + X_(e.quantity * e.unitCost));
	}
	if (c(s("INVENTORY")) !== p) throw Error("Stock valuation must equal imported inventory GL.");
	for (let e of n.bankAccounts.bankAccounts) {
		let n = t.banks.find((t) => t.bankAccountId === e.id);
		if (c(e.glAccountId) !== (n?.amount ?? 0)) throw Error("Bank detail must equal imported bank GL.");
		if (n && (!e.active || t.date < e.openingBalanceDate || e.openingBalance !== 0)) throw Error("Opening bank must be active with zero metadata balance and an opening date on/before cutover.");
	}
	for (let e of t.banks) if (!n.bankAccounts.bankAccounts.some((t) => t.id === e.bankAccountId)) throw Error("Unknown opening bank account.");
	let m = new Set(n.bankAccounts.bankAccounts.map((e) => e.glAccountId));
	if (o.some((e) => e.systemRole === "BANK" && !m.has(e.id) && c(e.id) !== 0)) throw Error("Bank GL requires a linked bank account.");
	return {
		input: t,
		s: n,
		debit: l,
		credit: u,
		ar: d,
		ap: f,
		inventory: p
	};
}
m("openingBalances", {
	repository: {
		preview(e) {
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = cv(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: X_(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = ev.parse(e), n = JSON.stringify(t), r = tv.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = cv(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: k.current()?.userId ?? "",
				createdAt: s,
				journalIds: [],
				invoiceIds: [],
				billIds: [],
				customerCreditIds: [],
				supplierCreditIds: [],
				movementIds: [],
				costMovementIds: [],
				priorStock: structuredClone(a.stock.balances),
				priorCost: structuredClone(a.costBalances.balances),
				priorJournalIds: a.journals.journalEntries.map((e) => e.id),
				priorMovementIds: a.inventoryMovements.movements.map((e) => e.id)
			}, l = (e) => P.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
			for (let e of ["ar", "ap"]) for (let t of i[e]) {
				let n = crypto.randomUUID(), r = Math.abs(t.amount), p = {
					subtotal: r,
					taxAmount: 0,
					total: r
				}, m = {
					id: n,
					openingBalanceImportId: o,
					originalDocumentDate: t.date,
					createdAt: s,
					updatedAt: s,
					lines: [],
					totals: p
				}, h;
				if (e === "ar" && t.amount > 0) a.sales.invoices.push({
					...m,
					type: "INVOICE",
					documentNumber: t.reference,
					customerId: t.contactId,
					documentDate: i.date,
					dueDate: t.dueDate,
					status: "ISSUED",
					amountPaid: 0,
					amountDue: r,
					notes: `Opening outstanding only; original date ${t.date}. ${i.reason}`
				}), c.invoiceIds.push(n), h = "CUSTOMER_INVOICE";
				else if (e === "ar") a.customerCredits.creditNotes.push({
					...m,
					creditNoteNumber: t.reference,
					customerId: t.contactId,
					sourceInvoiceId: "opening:" + o,
					creditDate: i.date,
					status: "ISSUED",
					reason: i.reason,
					issuedAt: s,
					amountApplied: 0,
					amountAvailable: r
				}), c.customerCreditIds.push(n), h = "CREDIT_NOTE";
				else {
					let e = a.suppliers.suppliers.find((e) => e.id === t.contactId), l = {
						supplierId: e.id,
						supplierCode: e.code,
						supplierName: e.businessName
					};
					t.amount > 0 ? (a.supplierBills.supplierBills.push({
						...m,
						...l,
						billNumber: t.reference,
						supplierInvoiceNumber: t.reference,
						purchaseOrderId: "",
						purchaseOrderNumber: "Opening balance",
						billDate: i.date,
						dueDate: t.dueDate,
						status: "OPEN",
						totals: {
							...p,
							amountPaid: 0,
							amountCredited: 0,
							amountDue: r
						},
						notes: `Opening outstanding only; original date ${t.date}. ${i.reason}`
					}), c.billIds.push(n), h = "SUPPLIER_BILL") : (a.supplierCredits.supplierCredits.push({
						...m,
						...l,
						creditNumber: t.reference,
						supplierCreditNumber: t.reference,
						sourceSupplierBillId: "opening:" + o,
						sourceSupplierBillNumber: t.reference,
						creditDate: i.date,
						status: "ISSUED",
						reason: i.reason,
						issuedAt: s,
						amountApplied: 0,
						amountAvailable: r
					}), c.supplierCreditIds.push(n), h = "SUPPLIER_CREDIT");
				}
				let g = e === "ar" == t.amount > 0, _ = F.post({
					journalDate: i.date,
					description: "Opening outstanding " + t.reference,
					reference: t.reference,
					sourceType: h,
					sourceId: n,
					lines: [{
						accountId: l(e === "ar" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"),
						debit: g ? r : 0,
						credit: g ? 0 : r
					}, {
						accountId: u,
						debit: g ? 0 : r,
						credit: g ? r : 0
					}]
				});
				c.journalIds.push(_.id), g ? d += r : f += r;
			}
			a.journals = av().journals, ov(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: X_(d),
				credit: X_(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, X_((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = F.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = it(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = ma.create({
					movementType: "ADJUSTMENT_IN",
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity,
					transactionUnitId: n.id,
					transactionUnitSymbol: n.symbol,
					transactionQuantity: e.quantity,
					conversionToBase: 1,
					referenceType: "MANUAL",
					referenceId: o,
					occurredAt: i.date,
					notes: "Opening stock"
				});
				Ua.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = Ia({
					siteId: e.siteId,
					productId: t.id,
					unitId: n.id,
					quantity: e.quantity,
					transactionUnitCost: e.unitCost,
					movementType: "ADJUSTMENT_IN",
					referenceType: "MANUAL",
					referenceId: o,
					inventoryMovementId: r.id,
					occurredAt: i.date
				});
				c.movementIds.push(r.id), c.costMovementIds.push(a.movement.id);
			}
			return tv = [...tv, c], iv(), c;
		},
		reverse(e) {
			if (T(e.date), _n(e.date), M(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = tv.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = av();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) hl(e);
			for (let n of t.journalIds) F.reverse({
				journalEntryId: n,
				reversalDate: e.date,
				reason: e.reason
			});
			let o = (/* @__PURE__ */ new Date()).toISOString();
			for (let [r, i, a] of [
				[
					"sales",
					"invoices",
					t.invoiceIds
				],
				[
					"supplierBills",
					"supplierBills",
					t.billIds
				],
				[
					"customerCredits",
					"creditNotes",
					t.customerCreditIds
				],
				[
					"supplierCredits",
					"supplierCredits",
					t.supplierCreditIds
				]
			]) n[r][i] = n[r][i].map((t) => a.includes(t.id) ? {
				...t,
				status: "VOID",
				voidedAt: e.date,
				voidReason: e.reason,
				updatedAt: o,
				..."amountAvailable" in t ? { amountAvailable: 0 } : {}
			} : t);
			for (let r of n.inventoryMovements.movements.filter((e) => t.movementIds.includes(e.id))) n.inventoryMovements.movements.push({
				...r,
				id: crypto.randomUUID(),
				movementNumber: r.movementNumber + "-REV",
				movementType: "ADJUSTMENT_OUT",
				quantityBase: -r.quantityBase,
				transactionQuantity: -r.transactionQuantity,
				occurredAt: e.date,
				createdAt: o,
				notes: e.reason
			});
			for (let r of n.costMovements.movements.filter((e) => t.costMovementIds.includes(e.id))) {
				let i = t.priorCost.find((e) => e.siteId === r.siteId && e.productId === r.productId);
				n.costMovements.movements.push({
					...r,
					id: crypto.randomUUID(),
					costMovementNumber: r.costMovementNumber + "-REV",
					movementType: "ADJUSTMENT_OUT",
					quantityBase: -r.quantityBase,
					valueChange: -r.valueChange,
					quantityAfter: i?.quantityOnHand ?? 0,
					averageCostAfter: i?.averageCostPerBaseUnit ?? 0,
					inventoryValueAfter: i?.inventoryValue ?? 0,
					occurredAt: e.date,
					createdAt: o,
					inventoryMovementId: void 0,
					notes: e.reason
				});
			}
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = av().journals, ov(n), tv = tv.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), iv(), tv.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: tv }),
	restore: (e) => {
		tv = e.batches;
	},
	publish: iv,
	validate: (e, t) => {
		let n = w({ batches: a(w({
			id: $,
			operationId: $,
			date: $,
			status: g(["POSTED", "REVERSED"]),
			journalIds: a($),
			invoiceIds: a($),
			billIds: a($),
			customerCreditIds: a($),
			supplierCreditIds: a($),
			fingerprint: y().min(1).max(5e7),
			reason: y().min(3),
			actor: $,
			createdAt: $,
			movementIds: a($),
			costMovementIds: a($),
			priorJournalIds: a($),
			priorMovementIds: a($),
			priorStock: a(w({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: c().finite().nonnegative(),
				updatedAt: $
			}).strict()),
			priorCost: a(w({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: c().finite().nonnegative(),
				averageCostPerBaseUnit: c().finite().nonnegative(),
				inventoryValue: c().finite().nonnegative(),
				costingMethod: i("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: $
			}).strict()),
			reversalDate: $.optional(),
			reversalReason: y().optional()
		}).strict()) }).strict().parse(e);
		for (let e of n.batches) {
			let n = ev.parse(JSON.parse(e.fingerprint));
			if (n.operationId !== e.operationId || n.date !== e.date) throw Error("Opening import identity is invalid.");
			if (e.status === "REVERSED" && !e.reversalDate) throw Error("Opening reversal date is missing.");
			e.reversalDate && T(e.reversalDate), T(e.date);
			let r = t;
			if (e.journalIds.some((e) => !r.journals.journalEntries.some((t) => t.id === e))) throw Error("Opening journal reference is invalid.");
			for (let [t, n] of [["inventoryMovements", e.movementIds], ["costMovements", e.costMovementIds]]) if (n.some((n) => !r[t].movements.some((t) => t.id === n && t.referenceId === e.id))) throw Error("Opening movement reference is invalid.");
			for (let [t, n, i] of [
				[
					"sales",
					"invoices",
					e.invoiceIds
				],
				[
					"supplierBills",
					"supplierBills",
					e.billIds
				],
				[
					"customerCredits",
					"creditNotes",
					e.customerCreditIds
				],
				[
					"supplierCredits",
					"supplierCredits",
					e.supplierCreditIds
				]
			]) if (i.some((i) => !r[t][n].some((t) => t.id === i && t.openingBalanceImportId === e.id))) throw Error("Opening document reference is invalid.");
		}
	}
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var lv = (e) => Math.round((e + 2 ** -52) * 100) / 100, uv = y().trim().min(1).max(200), dv = w({
	operationId: uv,
	paymentDate: uv,
	bankAccountId: uv,
	reference: y().max(500),
	allocations: a(w({
		supplierBillId: uv,
		amount: c().finite().positive().refine((e) => lv(e) === e)
	}).strict()).min(1).max(500)
}).strict(), fv = [], pv = 0, mv = /* @__PURE__ */ new Set(), hv = () => {
	pv++, mv.forEach((e) => e());
}, gv = () => {
	let e = k.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function _v(e, t) {
	return {
		action: e,
		reason: t,
		actor: gv(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function vv(e) {
	let t = fv.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function yv(e) {
	return fv = fv.map((t) => t.id === e.id ? e : t), hv(), e;
}
function bv(e) {
	T(e.paymentDate, "Payment date");
	let t = L.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = _o.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
m("paymentBatches", {
	repository: {
		create(e) {
			let t = dv.parse(e), n = JSON.stringify(t), r = fv.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			bv(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: gv(),
				paymentIds: [],
				history: [_v("Created")]
			};
			return fv = [...fv, i], hv(), i;
		},
		approve(e) {
			let t = vv(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return bv(t), yv({
				...t,
				status: "APPROVED",
				approvedBy: gv(),
				history: [...t.history, _v("Approved")]
			});
		},
		post(e) {
			let t = vv(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			M(), bv(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = _o.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => Co.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			if (r.some((e) => e.status !== "POSTED")) throw Error("Batch payment is not posted. Inspect the prior operation before retrying.");
			return yv({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, _v("Payments recorded")]
			});
		},
		cancel(e) {
			let t = vv(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return yv({
				...t,
				status: "CANCELLED",
				history: [...t.history, _v("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = vv(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			M();
			for (let e of t.paymentIds) {
				let t = Co.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				jt("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) Co.reverse(n, e.reason);
			return yv({
				...t,
				status: "REVERSED",
				history: [...t.history, _v("Reversed", e.reason)]
			});
		}
	},
	read: "banking.read",
	commands: {
		create: "purchases.payment",
		approve: "accounting.post",
		post: "purchases.payment",
		cancel: "purchases.payment",
		reverse: "purchases.payment"
	},
	snapshot: () => ({ batches: fv }),
	restore: (e) => {
		fv = e.batches;
	},
	validate: (e, t) => {
		let n = dv.extend({
			id: uv,
			fingerprint: y(),
			status: g([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: uv,
			approvedBy: uv.optional(),
			paymentIds: a(uv),
			history: a(w({
				action: uv,
				actor: uv,
				at: uv,
				reason: y().optional()
			}).strict())
		}).strict(), r = w({ batches: a(n) }).strict().parse(e), i = t, o = i.supplierPayments.supplierPayments, s = i.bankAccounts.bankAccounts, c = i.supplierBills.supplierBills, l = /* @__PURE__ */ new Set();
		if (new Set(r.batches.map((e) => e.id)).size !== r.batches.length || new Set(r.batches.map((e) => e.operationId)).size !== r.batches.length) throw Error("Duplicate payment batch identity or operation.");
		let u = (e) => JSON.stringify(e.map((e) => ({
			supplierBillId: e.supplierBillId,
			amount: e.amount
		})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId)));
		for (let e of r.batches) {
			try {
				T(e.paymentDate, "Batch payment date");
			} catch {
				throw Error("Invalid payment batch date.");
			}
			let t = {
				operationId: e.operationId,
				paymentDate: e.paymentDate,
				bankAccountId: e.bankAccountId,
				reference: e.reference,
				allocations: e.allocations
			};
			if (e.fingerprint !== JSON.stringify(t) || !s.some((t) => t.id === e.bankAccountId) || new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length || e.allocations.some((e) => !c.some((t) => t.id === e.supplierBillId))) throw Error("Payment batch creation data or references are invalid.");
			let n = e.history.map((e) => e.action).join("|"), r = e.history.find((e) => e.action === "Approved");
			if (!{
				DRAFT: ["Created"],
				APPROVED: ["Created|Approved"],
				POSTED: ["Created|Approved|Payments recorded"],
				REVERSED: ["Created|Approved|Payments recorded|Reversed"],
				CANCELLED: ["Created|Cancelled", "Created|Approved|Cancelled"]
			}[e.status].includes(n) || e.createdBy !== e.history[0]?.actor || e.approvedBy !== r?.actor || e.history.some((e) => !Number.isFinite(Date.parse(e.at)) || ["Cancelled", "Reversed"].includes(e.action) && (e.reason?.trim().length ?? 0) < 3)) throw Error("Payment batch lifecycle or approval history is invalid.");
			if (!["POSTED", "REVERSED"].includes(e.status)) {
				if (e.paymentIds.length) throw Error("An unposted batch cannot own supplier payments.");
				continue;
			}
			let a = /* @__PURE__ */ new Map();
			for (let t of e.allocations) {
				let e = c.find((e) => e.id === t.supplierBillId).supplierId;
				a.set(e, [...a.get(e) ?? [], t]);
			}
			if (e.paymentIds.length !== a.size || new Set(e.paymentIds).size !== e.paymentIds.length) throw Error("Payment batch supplier groups are incomplete or duplicated.");
			let d = /* @__PURE__ */ new Set();
			for (let t of e.paymentIds) {
				let n = o.find((e) => e.id === t), r = n && a.get(n.supplierId);
				if (l.has(t) || !n || !r || d.has(n.supplierId) || n.operationId !== "batch:" + e.id + ":" + n.supplierId || n.bankAccountId !== e.bankAccountId || n.paymentDate !== e.paymentDate || n.method !== "BANK_TRANSFER" || (n.reference ?? "") !== e.reference.trim() || n.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED") || u(n.allocations) !== u(r) || n.amount !== lv(r.reduce((e, t) => e + t.amount, 0))) throw Error("Payment batch payment relationships are invalid.");
				if (l.add(t), d.add(n.supplierId), !i.journals.journalEntries.some((e) => e.sourceType === "SUPPLIER_PAYMENT" && e.sourceId === t)) throw Error("A batch payment journal is missing.");
			}
		}
	},
	publish: hv
});
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var xv = (e) => Math.round((e + 2 ** -52) * 100) / 100, Sv = y().min(1).max(200), Cv = [], wv = 0, Tv = /* @__PURE__ */ new Set(), Ev = () => {
	wv++, Tv.forEach((e) => e());
};
function Dv(e) {
	let t = L.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function Ov(e) {
	let t = Cv.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function kv(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = vc.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function Av(e) {
	return Cv = Cv.map((t) => t.id === e.id ? e : t), Ev(), e;
}
var jv = (e, t) => rc(Dv(e), F.getAll(), t).transactions;
function Mv(e) {
	if (e.date < Dv(e.bankAccountId).openingBalanceDate) throw Error("Statement predates the current bank opening date.");
}
function Nv(e) {
	let t = F.getAll(), n = ec(t);
	if (t.some((t) => t.sourceType === "BANK_STATEMENT" && t.sourceId?.startsWith(e + ":") && n.reviewIds.has(t.id))) throw Error("Earlier categorisation correction requires reviewed recovery before changing this line again.");
}
var Pv = w({
	date: Sv,
	description: y().trim().min(1).max(1e3),
	amount: c().finite().refine((e) => e !== 0 && xv(e) === e, "Enter a non-zero amount in cents"),
	reference: y().max(500).default(""),
	externalId: y().max(200).default("")
}).strict(), Fv = {
	importRows(e) {
		let t = w({
			bankAccountId: Sv,
			rows: a(Pv).min(1).max(1e4)
		}).strict().parse(e), n = Dv(t.bankAccountId), r = 0, i = [...Cv], o = [];
		for (let e of t.rows) {
			if (T(e.date, "Statement date"), e.date < n.openingBalanceDate) throw Error("Statement predates the bank opening date.");
			let t = JSON.stringify([n.id, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase()
			]]), a = i.find((e) => e.key === t);
			if (a) {
				if (e.externalId && (a.amount !== e.amount || a.date !== e.date || a.description !== e.description || a.reference !== e.reference)) throw Error("Bank transaction ID conflicts with an existing row.");
				r++;
				continue;
			}
			let s = vc.getLatestByBankAccount(n.id);
			if (s && e.date <= s.statementDate) throw Error("Cannot import new rows into a reconciled statement period.");
			let c = {
				...e,
				id: crypto.randomUUID(),
				key: t,
				bankAccountId: n.id,
				status: "UNMATCHED",
				ledgerIds: [],
				history: [{
					action: "Imported",
					date: (/* @__PURE__ */ new Date()).toISOString()
				}]
			};
			i.push(c), o.push(c);
		}
		return Cv = i, Ev(), {
			created: o.length,
			duplicates: r
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = od(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
		if (t.length > 1e4) throw Error("Import at most 10,000 rows at a time.");
		if (new Set(n).size !== n.length) throw Error("CSV contains duplicate headers.");
		let r = {
			date: "date",
			description: "description",
			amount: "amount",
			reference: "reference",
			id: "id",
			debit: "",
			credit: "",
			...e.mapping
		};
		for (let e of ["date", "description"]) if (!n.includes(r[e].toLowerCase())) throw Error("Map the date and description columns.");
		let i = !!r.amount && n.includes(r.amount.toLowerCase());
		if (!i && (!r.debit || !r.credit || !n.includes(r.debit.toLowerCase()) || !n.includes(r.credit.toLowerCase()))) throw Error("Map either a signed amount or both debit and credit columns.");
		let a = (e, t, n = !1) => {
			let r = e.trim();
			if (!r && n) return 0;
			if (/^\(.*\)$/.test(r) && (r = "-" + r.slice(1, -1)), !/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(r)) throw Error(`CSV row ${t} has an invalid amount.`);
			return Number(r.replaceAll(",", ""));
		};
		return Fv.importRows({
			bankAccountId: e.bankAccountId,
			rows: t.filter((e) => e.some((e) => e.trim())).map((t, o) => {
				if (t.length !== n.length) throw Error(`CSV row ${o + 2} has the wrong number of columns.`);
				let s = (e) => t[n.indexOf(r[e].toLowerCase())]?.trim() ?? "", c = s("date");
				if (e.dateFormat && e.dateFormat !== "YYYY-MM-DD") {
					let t = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(c);
					if (!t) throw Error(`CSV row ${o + 2} has an invalid date.`);
					c = t[3] + "-" + (e.dateFormat === "DD/MM/YYYY" ? t[2] : t[1]).padStart(2, "0") + "-" + (e.dateFormat === "DD/MM/YYYY" ? t[1] : t[2]).padStart(2, "0");
				}
				let l;
				if (i) l = a(s("amount"), o + 2);
				else {
					let e = a(s("debit"), o + 2, !0), t = a(s("credit"), o + 2, !0);
					if (e < 0 || t < 0 || e && t) throw Error(`CSV row ${o + 2} must have one positive debit or credit.`);
					l = xv(t - e);
				}
				return {
					date: c,
					description: s("description"),
					amount: l,
					reference: s("reference"),
					externalId: s("id")
				};
			})
		});
	},
	candidates(e) {
		T(e.asOfDate, "As-of date");
		let t = vc.getClearedTransactionIds(e.bankAccountId), n = F.getAll(), r = new Map(n.map((e) => [e.id, e]));
		return jv(e.bankAccountId, e.asOfDate).filter((i) => ie(r.get(i.journalEntryId), n, e.asOfDate) && !i.correctionOnly && !i.correctionIssue && !t.has(i.id) && !Cv.some((e) => e.ledgerIds.includes(i.id)));
	},
	match(e) {
		let t = Ov(e.id);
		if (kv(t), Mv(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = vc.getClearedTransactionIds(t.bankAccountId);
		if (e.ledgerIds.some((e) => n.has(e))) throw Error("Selected bank entries were already cleared by a completed reconciliation. Use the genuine source of this new statement line.");
		let r = Fv.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), i = e.ledgerIds.map((e) => r.find((t) => t.id === e));
		if (i.some((e) => !e) || xv(i.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return Av({
			...t,
			status: "MATCHED",
			ledgerIds: [...e.ledgerIds],
			history: [...t.history, {
				action: "Matched",
				date: (/* @__PURE__ */ new Date()).toISOString()
			}]
		});
	},
	suggestions(e) {
		let t = Ov(e.id);
		return (C["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		M();
		let t = Ov(e.id), n = JSON.stringify(e.splits);
		if (t.status === "POSTED") {
			if (t.fingerprint !== n) throw Error("Line was already posted with different categorisation.");
			return t;
		}
		kv(t), Mv(t), Nv(t.id);
		let r = a(w({
			accountId: Sv,
			amount: c().finite().positive().refine((e) => xv(e) === e),
			taxCode: Sv
		}).strict()).min(1).max(100).parse(e.splits);
		if (xv(r.reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Split amounts must equal the statement total.");
		let i = Dv(t.bankAccountId), o = t.amount < 0, s = r.flatMap((e) => {
			let t = P.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = b(e.taxCode), r = xv(e.amount / (1 + n)), i = xv(e.amount - r);
			return [{
				accountId: t.id,
				debit: o ? r : 0,
				credit: o ? 0 : r
			}, ...i ? [{
				accountId: (o ? Ce(e.taxCode).taxPaidAccountId : Ce(e.taxCode).taxCollectedAccountId) || P.requireBySystemRole(o ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: o ? i : 0,
				credit: o ? 0 : i
			}] : []];
		}), l = F.post({
			journalDate: t.date,
			description: t.description,
			reference: t.reference,
			sourceType: "BANK_STATEMENT",
			sourceId: t.id + ":" + t.history.filter((e) => e.action === "Posted").length,
			lines: [{
				accountId: i.glAccountId,
				debit: o ? 0 : t.amount,
				credit: o ? -t.amount : 0
			}, ...s]
		}), u = l.lines.filter((e) => e.accountId === i.glAccountId).map((e) => l.id + ":" + e.id);
		return Av({
			...t,
			status: "POSTED",
			journalEntryId: l.id,
			ledgerIds: u,
			fingerprint: n,
			history: [...t.history, {
				action: "Posted",
				date: (/* @__PURE__ */ new Date()).toISOString()
			}]
		});
	},
	ignore(e) {
		let t = Ov(e.id);
		if (kv(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return Av({
			...t,
			status: "IGNORED",
			history: [...t.history, {
				action: "Excluded",
				date: (/* @__PURE__ */ new Date()).toISOString(),
				reason: e.reason
			}]
		});
	},
	revert(e) {
		M();
		let t = Ov(e.id);
		if (T(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		let n = vc.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		if (t.status === "POSTED" && Nv(t.id), t.status === "POSTED" && e.reversalDate !== t.date) throw Error("Categorisation correction must reverse on the original statement date in an open period. It does not reverse an external payment.");
		if (t.status === "POSTED") for (let e of t.ledgerIds) hl(e.split(":")[0]);
		return t.status === "POSTED" && t.journalEntryId && F.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), Av({
			...t,
			status: "UNMATCHED",
			ledgerIds: [],
			journalEntryId: void 0,
			fingerprint: void 0,
			history: [...t.history, {
				action: "Reverted",
				date: e.reversalDate,
				reason: t.status === "MATCHED" ? e.reason + " · Previous matched ledger rows: " + t.ledgerIds.join(", ") : e.reason
			}]
		});
	},
	reconcile(e) {
		if (_n(e.statementDate), M(), T(e.statementDate, "Statement date"), !Cv.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (Cv.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = Cv.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate), n = jv(e.bankAccountId, e.statementDate), r = F.getAll(), i = new Map(r.map((e) => [e.id, e]));
		for (let a of t.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (a.ledgerIds.some((t) => cc(vc.getAll(), e.bankAccountId, t, a.date))) throw Error("Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.");
			let t = a.ledgerIds.map((e) => n.find((t) => t.id === e));
			if (!t.length || t.some((e) => !e || !ie(i.get(e.journalEntryId), r, a.date) || e.correctionOnly || e.correctionIssue) || xv(t.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== a.amount) throw Error("Statement match is stale. Revert the statement line and review its ledger sources before reconciling.");
		}
		let a = t.flatMap((e) => e.ledgerIds);
		return vc.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...vc.getClearedTransactionIds(e.bankAccountId), ...a])]
		});
	}
}, Iv = w({
	id: Sv,
	key: y(),
	bankAccountId: Sv,
	date: Sv,
	description: y(),
	reference: y(),
	amount: c().finite(),
	externalId: y(),
	status: g([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: a(Sv),
	journalEntryId: y().optional(),
	fingerprint: y().optional(),
	history: a(w({
		action: y(),
		date: y(),
		reason: y().optional()
	}))
}).strict();
m("bankStatements", {
	repository: Fv,
	read: "banking.read",
	commands: {
		importRows: "banking.write",
		importCsv: "banking.write",
		candidates: "banking.read",
		suggestions: "banking.read",
		match: "banking.write",
		post: "banking.write",
		ignore: "banking.write",
		revert: "banking.write",
		reconcile: "banking.reconcile"
	},
	snapshot: () => ({ lines: Cv }),
	restore: (e) => {
		Cv = e.lines;
	},
	validate: (e, t) => {
		let n = w({ lines: a(Iv) }).strict().parse(e), r = t, i = r.bankAccounts.bankAccounts, o = r.journals.journalEntries, s = /* @__PURE__ */ new Set(), l = new Map(o.map((e) => [e.id, e])), u = new Map(o.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, {
			journal: e,
			entry: t
		}])));
		if (new Set(n.lines.map((e) => e.key)).size !== n.lines.length) throw Error("Duplicate bank statement import key.");
		for (let e of n.lines) {
			let t = i.find((t) => t.id === e.bankAccountId);
			if (!t) throw Error("Bank statement account is missing.");
			try {
				T(e.date), Pv.parse({
					date: e.date,
					description: e.description,
					amount: e.amount,
					reference: e.reference,
					externalId: e.externalId
				});
			} catch {
				throw Error("Invalid bank statement date, amount or metadata.");
			}
			let n = JSON.stringify([e.bankAccountId, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase()
			]]);
			if (e.key !== n) throw Error("Bank statement import identity does not match its data.");
			let r;
			for (let t of e.history) {
				if (!Number.isFinite(Date.parse(t.date))) throw Error("Invalid bank statement history date.");
				if (!r && t.action === "Imported") r = "UNMATCHED";
				else if (r === "UNMATCHED" && [
					"Matched",
					"Posted",
					"Excluded"
				].includes(t.action)) {
					if (t.action === "Excluded" && (t.reason?.trim().length ?? 0) < 3) throw Error("Bank statement exclusion has no reason.");
					r = t.action === "Matched" ? "MATCHED" : t.action === "Posted" ? "POSTED" : "IGNORED";
				} else if (r && r !== "UNMATCHED" && t.action === "Reverted" && (t.reason?.trim().length ?? 0) >= 3) r = "UNMATCHED";
				else throw Error("Invalid bank statement lifecycle history.");
			}
			if (r !== e.status) throw Error("Bank statement status does not match its history.");
			if (e.status === "UNMATCHED" || e.status === "IGNORED") {
				if (e.ledgerIds.length || e.journalEntryId || e.fingerprint) throw Error("An unposted bank statement line cannot retain ledger links.");
				continue;
			}
			if (!e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Bank statement ledger links are missing or duplicated.");
			let o = 0;
			for (let n of e.ledgerIds) {
				let r = u.get(n), i = r?.journal, a = r?.entry;
				if (s.has(n) || !i || !a || a.accountId !== t.glAccountId || i.journalDate > e.date) throw Error("Bank statement ledger source is invalid or reused.");
				s.add(n), o = xv(o + a.debit - a.credit);
			}
			if (o !== e.amount) throw Error("Bank statement amount does not match its ledger links.");
			if (e.status === "MATCHED") {
				if (e.journalEntryId || e.fingerprint) throw Error("Matched bank statements cannot claim categorisation journals.");
			} else {
				let n = l.get(e.journalEntryId ?? ""), r = e.history.filter((e) => e.action === "Posted").length - 1, i = n?.lines.filter((e) => e.accountId === t.glAccountId).map((e) => n.id + ":" + e.id).sort();
				if (!n || n.status !== "POSTED" || n.sourceType !== "BANK_STATEMENT" || n.sourceId !== e.id + ":" + r || n.journalDate !== e.date || JSON.stringify(i) !== JSON.stringify([...e.ledgerIds].sort())) throw Error("Bank statement categorisation journal does not match its source.");
				try {
					if (xv(a(w({
						accountId: Sv,
						amount: c().finite().positive().refine((e) => xv(e) === e),
						taxCode: Sv
					}).strict()).min(1).max(100).parse(JSON.parse(e.fingerprint ?? "")).reduce((e, t) => e + t.amount, 0)) !== Math.abs(e.amount)) throw Error("Wrong split total.");
				} catch {
					throw Error("Bank statement categorisation fingerprint is invalid.");
				}
			}
		}
	},
	publish: Ev
});
//#endregion
//#region src/features/supplier-prepayments/prepaymentReconciliation.ts
function Lv(e) {
	let { prepayments: t, accounts: n, journals: r, banks: i, suppliers: a, asOfDate: o } = e;
	T(o);
	let s = (e) => {
		if (!Number.isFinite(e)) throw Error("Prepayment reconciliation contains a non-finite amount.");
		return Math.round(e * 100);
	}, c = [], l = (e, t, n) => c.push({
		code: e,
		message: t,
		path: n ? "/purchases/prepayments/" + encodeURIComponent(n) : "/purchases/prepayments"
	}), u = /* @__PURE__ */ new Set([...t.settings.map((e) => e.assetAccountId), ...t.prepayments.filter((e) => e.date <= o).map((e) => e.assetAccountId)]), d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Set(), p = new Map(r.map((e) => [e.id, e]));
	if (p.size !== r.length) throw Error("Duplicate journal IDs require review.");
	for (let e of u) {
		let t = n.find((t) => t.id === e);
		(!t || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) && l("PREPAYMENT_ACCOUNT", "Prepayment asset mapping is missing or invalid: " + e);
	}
	let m = (e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e.lines) t.set(n.accountId, (t.get(n.accountId) ?? 0) + s(n.debit) - s(n.credit));
		return t;
	}, h = (e, t, n, r, i, a) => {
		if (e.date > o) return;
		let c = s(e.amount), u = p.get(e.journalId), d = (e, t, n) => {
			if (!t || !n || t === n || e.lines.length !== 2) return !1;
			let r = m(e);
			return r.size === 2 && r.get(t) === c && r.get(n) === -c;
		};
		if (f.has(e.journalId) && l("PREPAYMENT_JOURNAL_SHARED", "More than one prepayment event owns the same journal.", t), f.add(e.journalId), (!u || u.sourceType !== n || u.sourceId !== r || u.journalDate !== e.date || u.reversedJournalEntryId || !d(u, i, a)) && l("PREPAYMENT_SOURCE_JOURNAL", "Prepayment event does not match its original journal: " + e.id, t), u && (e.status === "POSTED" && u.status !== "POSTED" || e.status === "REVERSED" && u.status !== "REVERSED") && l("PREPAYMENT_SOURCE_STATUS", "Prepayment event and journal statuses disagree: " + e.id, t), e.status === "REVERSED" && !e.reversalDate && l("PREPAYMENT_REVERSAL_DATE", "Reversed prepayment event has no reversal date: " + e.id, t), e.reversalDate && e.reversalDate <= o) {
			let o = u?.reversalJournalEntryId ? p.get(u.reversalJournalEntryId) : void 0;
			o && f.add(o.id), (!o || o.reversedJournalEntryId !== u?.id || o.journalDate !== e.reversalDate || o.status !== "POSTED" || o.sourceType !== n || o.sourceId !== void 0 && o.sourceId !== r || !d(o, a, i)) && l("PREPAYMENT_REVERSAL_JOURNAL", "Prepayment reversal journal is missing or incorrect: " + e.id, t);
		}
	};
	for (let e of t.prepayments.filter((e) => e.date <= o)) t.settings.some((t) => t.assetAccountId === e.assetAccountId) || l("PREPAYMENT_ACCOUNT_CONFIGURATION", "Prepayment receipt has no matching asset configuration.", e.id);
	let g = t.prepayments.filter((e) => e.date <= o).map((e) => {
		let r = /* @__PURE__ */ new Map(), c = (e, t) => {
			T(e), e <= o && r.set(e, (r.get(e) ?? 0) + t);
		};
		c(e.date, s(e.amount)), e.reversalDate && c(e.reversalDate, -s(e.amount)), h(e, e.id, "SUPPLIER_PREPAYMENT", e.id, e.assetAccountId, i.find((t) => t.id === e.bankAccountId)?.glAccountId);
		let u = 0, f = 0;
		for (let r of ["applications", "refunds"]) for (let a of t[r].filter((t) => t.prepaymentId === e.id && t.date <= o)) {
			let t = s(a.amount);
			c(a.date, -t), a.reversalDate && c(a.reversalDate, t), (a.date < e.date || a.reversalDate && a.reversalDate < a.date) && l("PREPAYMENT_EVENT_DATE", "Prepayment consumption or reversal precedes its source: " + a.id, e.id);
			let d = !a.reversalDate || a.reversalDate > o;
			r === "applications" ? d && (u += t) : d && (f += t), h(a, e.id, r === "applications" ? "SUPPLIER_PAYMENT" : "SUPPLIER_PREPAYMENT_REFUND", "paymentId" in a ? a.paymentId : a.id, "supplierBillId" in a ? n.find((e) => e.systemRole === "ACCOUNTS_PAYABLE")?.id : i.find((e) => e.id === a.bankAccountId)?.glAccountId, e.assetAccountId);
		}
		let p = 0;
		for (let [, t] of [...r].sort(([e], [t]) => e.localeCompare(t))) p += t, p < 0 && l("PREPAYMENT_NEGATIVE_HISTORY", "Prepayment funds are overdrawn on a historical date.", e.id);
		return a.some((t) => t.id === e.supplierId) || l("PREPAYMENT_SUPPLIER", "Prepayment supplier is missing.", e.id), d.set(e.assetAccountId, (d.get(e.assetAccountId) ?? 0) + p), {
			id: e.id,
			supplierId: e.supplierId,
			supplierName: a.find((t) => t.id === e.supplierId)?.businessName ?? e.supplierId,
			reference: e.reference,
			date: e.date,
			paid: e.reversalDate && e.reversalDate <= o ? 0 : e.amount,
			applied: u / 100,
			refunded: f / 100,
			held: p / 100,
			assetAccountId: e.assetAccountId
		};
	});
	for (let e of ["applications", "refunds"]) for (let n of t[e]) n.date <= o && !t.prepayments.some((e) => e.id === n.prepaymentId && e.date <= o) && l("PREPAYMENT_ORPHAN_EVENT", "Prepayment consumption has no dated receipt: " + n.id, n.prepaymentId);
	let _ = [...u].map((e) => {
		let t = 0;
		for (let n of r.filter((e) => e.journalDate <= o)) for (let r of n.lines.filter((t) => t.accountId === e)) t += s(r.debit) - s(r.credit), f.has(n.id) || l("PREPAYMENT_UNOWNED_JOURNAL", "Unexplained prepayment asset journal: " + n.journalNumber);
		let i = d.get(e) ?? 0;
		return {
			accountId: e,
			accountName: n.find((t) => t.id === e)?.name ?? e,
			subledger: i / 100,
			gl: t / 100,
			difference: (i - t) / 100
		};
	});
	for (let e of r) e.journalDate <= o && ["SUPPLIER_PREPAYMENT", "SUPPLIER_PREPAYMENT_REFUND"].includes(e.sourceType) && !f.has(e.id) && l("PREPAYMENT_ORPHAN_JOURNAL", "Prepayment journal has no source event: " + e.journalNumber);
	let v = _.reduce((e, t) => e + s(t.subledger), 0) / 100, y = _.reduce((e, t) => e + s(t.gl), 0) / 100;
	return {
		asOfDate: o,
		subledger: v,
		gl: y,
		difference: (s(v) - s(y)) / 100,
		controls: _,
		rows: g,
		issues: c,
		reconciled: c.length === 0 && _.every((e) => e.difference === 0)
	};
}
//#endregion
//#region src/features/customer-deposits/depositReconciliation.ts
function Rv(e) {
	let { deposits: t, accounts: n, journals: r, banks: i, customers: a, asOfDate: o } = e;
	T(o);
	let s = (e) => {
		if (!Number.isFinite(e)) throw Error("Deposit reconciliation contains a non-finite amount.");
		return Math.round(e * 100);
	}, c = [], l = (e, t, n) => c.push({
		code: e,
		message: t,
		path: n ? "/sales/customer-deposits/" + encodeURIComponent(n) : "/sales/customer-deposits"
	}), u = /* @__PURE__ */ new Set([...t.settings.map((e) => e.liabilityAccountId), ...t.deposits.filter((e) => e.date <= o).map((e) => e.liabilityAccountId)]), d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Set(), p = new Map(r.map((e) => [e.id, e]));
	if (p.size !== r.length) throw Error("Duplicate journal IDs require review.");
	for (let e of u) {
		let t = n.find((t) => t.id === e);
		(!t || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) && l("DEPOSIT_ACCOUNT", "Deposit liability mapping is missing or invalid: " + e);
	}
	let m = (e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e.lines) t.set(n.accountId, (t.get(n.accountId) ?? 0) + s(n.debit) - s(n.credit));
		return t;
	}, h = (e, t, n, r, i, a) => {
		if (e.date > o) return;
		let c = s(e.amount), u = p.get(e.journalId), d = (e, t, n) => {
			if (!t || !n || t === n || e.lines.length !== 2) return !1;
			let r = m(e);
			return r.size === 2 && r.get(t) === c && r.get(n) === -c;
		};
		if (f.has(e.journalId) && l("DEPOSIT_JOURNAL_SHARED", "More than one deposit event owns the same journal.", t), f.add(e.journalId), (!u || u.sourceType !== n || u.sourceId !== r || u.journalDate !== e.date || u.reversedJournalEntryId || !d(u, i, a)) && l("DEPOSIT_SOURCE_JOURNAL", "Deposit event does not match its original journal: " + e.id, t), u && (e.status === "POSTED" && u.status !== "POSTED" || e.status === "REVERSED" && u.status !== "REVERSED") && l("DEPOSIT_SOURCE_STATUS", "Deposit event and journal statuses disagree: " + e.id, t), e.status === "REVERSED" && !e.reversalDate && l("DEPOSIT_REVERSAL_DATE", "Reversed deposit event has no reversal date: " + e.id, t), e.reversalDate && e.reversalDate <= o) {
			let o = u?.reversalJournalEntryId ? p.get(u.reversalJournalEntryId) : void 0;
			o && f.add(o.id), (!o || o.reversedJournalEntryId !== u?.id || o.journalDate !== e.reversalDate || o.status !== "POSTED" || o.sourceType !== n || o.sourceId !== void 0 && o.sourceId !== r || !d(o, a, i)) && l("DEPOSIT_REVERSAL_JOURNAL", "Deposit reversal journal is missing or incorrect: " + e.id, t);
		}
	};
	for (let e of t.deposits.filter((e) => e.date <= o)) t.settings.some((t) => t.liabilityAccountId === e.liabilityAccountId) || l("DEPOSIT_ACCOUNT_CONFIGURATION", "Deposit receipt has no matching liability configuration.", e.id);
	let g = t.deposits.filter((e) => e.date <= o).map((e) => {
		let r = /* @__PURE__ */ new Map(), c = (e, t) => {
			T(e), e <= o && r.set(e, (r.get(e) ?? 0) + t);
		};
		c(e.date, s(e.amount)), e.reversalDate && c(e.reversalDate, -s(e.amount)), h(e, e.id, "CUSTOMER_DEPOSIT", e.id, i.find((t) => t.id === e.bankAccountId)?.glAccountId, e.liabilityAccountId);
		let u = 0, f = 0;
		for (let r of ["applications", "refunds"]) for (let a of t[r].filter((t) => t.depositId === e.id && t.date <= o)) {
			let t = s(a.amount);
			c(a.date, -t), a.reversalDate && c(a.reversalDate, t), (a.date < e.date || a.reversalDate && a.reversalDate < a.date) && l("DEPOSIT_EVENT_DATE", "Deposit consumption or reversal precedes its source: " + a.id, e.id);
			let d = !a.reversalDate || a.reversalDate > o;
			r === "applications" ? d && (u += t) : d && (f += t), h(a, e.id, r === "applications" ? "CUSTOMER_PAYMENT" : "CUSTOMER_DEPOSIT_REFUND", "paymentId" in a ? a.paymentId : a.id, e.liabilityAccountId, "invoiceId" in a ? n.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE")?.id : i.find((e) => e.id === a.bankAccountId)?.glAccountId);
		}
		let p = 0;
		for (let [, t] of [...r].sort(([e], [t]) => e.localeCompare(t))) p += t, p < 0 && l("DEPOSIT_NEGATIVE_HISTORY", "Deposit funds are overdrawn on a historical date.", e.id);
		return a.some((t) => t.id === e.customerId) || l("DEPOSIT_CUSTOMER", "Deposit customer is missing.", e.id), d.set(e.liabilityAccountId, (d.get(e.liabilityAccountId) ?? 0) + p), {
			id: e.id,
			customerId: e.customerId,
			customerName: a.find((t) => t.id === e.customerId)?.businessName ?? e.customerId,
			reference: e.reference,
			date: e.date,
			received: e.reversalDate && e.reversalDate <= o ? 0 : e.amount,
			applied: u / 100,
			refunded: f / 100,
			held: p / 100,
			liabilityAccountId: e.liabilityAccountId
		};
	});
	for (let e of ["applications", "refunds"]) for (let n of t[e]) n.date <= o && !t.deposits.some((e) => e.id === n.depositId && e.date <= o) && l("DEPOSIT_ORPHAN_EVENT", "Deposit consumption has no dated receipt: " + n.id, n.depositId);
	let _ = [...u].map((e) => {
		let t = 0;
		for (let n of r.filter((e) => e.journalDate <= o)) for (let r of n.lines.filter((t) => t.accountId === e)) t += s(r.credit) - s(r.debit), f.has(n.id) || l("DEPOSIT_UNOWNED_JOURNAL", "Unexplained deposit liability journal: " + n.journalNumber);
		let i = d.get(e) ?? 0;
		return {
			accountId: e,
			accountName: n.find((t) => t.id === e)?.name ?? e,
			subledger: i / 100,
			gl: t / 100,
			difference: (i - t) / 100
		};
	});
	for (let e of r) e.journalDate <= o && ["CUSTOMER_DEPOSIT", "CUSTOMER_DEPOSIT_REFUND"].includes(e.sourceType) && !f.has(e.id) && l("DEPOSIT_ORPHAN_JOURNAL", "Deposit journal has no source event: " + e.journalNumber);
	let v = _.reduce((e, t) => e + s(t.subledger), 0) / 100, y = _.reduce((e, t) => e + s(t.gl), 0) / 100;
	return {
		asOfDate: o,
		subledger: v,
		gl: y,
		difference: (s(v) - s(y)) / 100,
		controls: _,
		rows: g,
		issues: c,
		reconciled: c.length === 0 && _.every((e) => e.difference === 0)
	};
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function zv(e) {
	let t = n(), r = [], i = (e, t, n) => r.push({
		code: e,
		message: t,
		...n ? { path: n } : {}
	});
	e.endDate >= S((/* @__PURE__ */ new Date()).toISOString()) && i("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of O.getUnresolved()) i("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && i("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of us()) i(e.code, `${e.entityId}: ${e.message}`);
	let a = l(k.current(), "payroll.read");
	for (let n of t.payroll?.runs ?? []) n.status === "Approved" && n.payDate <= e.endDate && i("PAYROLL_NOT_POSTED", a ? `Post, reopen or cancel approved payroll ${n.name} dated ${n.payDate}.` : "An approved payroll run must be resolved by an authorized payroll user before closing.", a ? "/payroll/pay-runs/" + encodeURIComponent(n.id) : void 0);
	for (let n of t.paymentBatches?.batches ?? []) n.status === "APPROVED" && n.paymentDate <= e.endDate && i("PAYMENT_BATCH_NOT_POSTED", `Post or cancel approved payment batch ${n.reference || n.id} dated ${n.paymentDate}.`, "/banking/payment-batches/" + encodeURIComponent(n.id));
	for (let [n, r, a, o] of [[
		"managedSalesDocuments",
		"INVOICE",
		"INVOICE_DRAFT_NOT_POSTED",
		"/sales/drafts/invoices/"
	], [
		"expenseBillDrafts",
		"EXPENSE",
		"EXPENSE_DRAFT_NOT_POSTED",
		"/purchases/expense-bills/"
	]]) for (let s of t[n]?.drafts ?? []) s.kind === r && s.status === "APPROVED" && s.payload.documentDate <= e.endDate && i(a, `Post, reopen or cancel approved ${r === "INVOICE" ? "invoice" : "expense bill"} dated ${s.payload.documentDate} (${s.id}).`, o + encodeURIComponent(s.id));
	for (let e of t.bankReconciliations.reconciliations) t.bankAccounts.bankAccounts.some((t) => t.id === e.bankAccountId) || i("BANK_RECONCILIATION_INVALID", "A saved reconciliation references a missing bank account.", "/banking/workbench");
	for (let n of t.bankAccounts.bankAccounts) try {
		let r = t.bankReconciliations.reconciliations.filter((e) => e.bankAccountId === n.id).filter((t) => t.statementDate >= e.endDate).sort((e, t) => e.statementDate.localeCompare(t.statementDate))[0];
		for (let a of lc({
			bank: n,
			journals: t.journals.journalEntries,
			reconciliations: t.bankReconciliations.reconciliations,
			throughDate: r?.statementDate ?? e.endDate,
			statements: t.bankStatements?.lines ?? []
		})) i("BANK_RECONCILIATION_INVALID", `${n.name ?? n.id}: ${a}`, "/banking/workbench");
	} catch {
		i("BANK_RECONCILIATION_INVALID", `${n.name ?? n.id}: saved bank reconciliation evidence could not be verified.`, "/banking/workbench");
	}
	let o = t.bankReconciliations.reconciliations.filter((e) => e.status === "COMPLETED"), s = new Set(o.flatMap((e) => e.clearedTransactionIds)), c = t.journals.journalEntries, u = ne(c), d = /* @__PURE__ */ new Set([...u.originals, ...u.offsets]), f = new Map(c.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, e])));
	for (let n of t.bankAccounts.bankAccounts) {
		let r = (t.bankStatements?.lines ?? []).filter((t) => t.bankAccountId === n.id && t.date <= e.endDate), a = r.filter((e) => e.status === "UNMATCHED").length, o = r.filter((e) => e.status === "MATCHED" || e.status === "POSTED"), l = o.filter((e) => e.ledgerIds.some((t) => !f.has(t) || d.has(f.get(t).id) || !ie(f.get(t), c, e.date))).length, u = o.filter((e) => e.ledgerIds.some((e) => !s.has(e))).length;
		a && i("BANK_STATEMENT_UNPROCESSED", `Process or exclude with a reason ${a} imported statement lines for ${n.name ?? n.id} through ${e.endDate}.`, "/banking/workbench"), l && i("BANK_STATEMENT_STALE", `Repair ${l} stale statement matches for ${n.name ?? n.id} before closing.`, "/banking/workbench"), u && i("BANK_STATEMENT_NOT_CLEARED", `Reconcile ${u} processed statement lines for ${n.name ?? n.id} before closing.`, "/banking/workbench");
	}
	let p = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, m = [
		["AR", () => Bc({
			...p,
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
		["AP", () => H_({
			...p,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => Y_({
			...p,
			costMovements: t.costMovements.movements
		})]
	];
	try {
		let n = Rv({
			deposits: t.customerDeposits,
			accounts: t.accounts.accounts,
			journals: t.journals.journalEntries,
			banks: t.bankAccounts.bankAccounts,
			customers: t.customers.customers,
			asOfDate: e.endDate
		});
		n.reconciled || i("CUSTOMER_DEPOSIT_DIFFERENCE", `Customer deposits require review at ${e.endDate}: difference ${n.difference}; ${n.issues.length} integrity issue(s).`, "/accounting/reconciliation/deposits?asOf=" + encodeURIComponent(e.endDate));
	} catch (t) {
		i("CUSTOMER_DEPOSIT_CHECK_FAILED", t instanceof Error ? t.message : String(t), "/accounting/reconciliation/deposits?asOf=" + encodeURIComponent(e.endDate));
	}
	try {
		let n = Lv({
			prepayments: t.supplierPrepayments,
			accounts: t.accounts.accounts,
			journals: t.journals.journalEntries,
			banks: t.bankAccounts.bankAccounts,
			suppliers: t.suppliers.suppliers,
			asOfDate: e.endDate
		});
		n.reconciled || i("SUPPLIER_PREPAYMENT_DIFFERENCE", `Supplier prepayments require review at ${e.endDate}: difference ${n.difference}; ${n.issues.length} integrity issue(s).`, "/accounting/reconciliation/prepayments?asOf=" + encodeURIComponent(e.endDate));
	} catch (t) {
		i("SUPPLIER_PREPAYMENT_CHECK_FAILED", t instanceof Error ? t.message : String(t), "/accounting/reconciliation/prepayments?asOf=" + encodeURIComponent(e.endDate));
	}
	for (let [t, n] of m) try {
		let r = n();
		(!r.reconciled || !Number.isFinite(r.difference)) && i(`${t}_DIFFERENCE`, `${t} to GL difference at ${e.endDate}: ${r.difference}.`);
	} catch (e) {
		i(`${t}_CHECK_FAILED`, e instanceof Error ? e.message : String(e));
	}
	for (let n of t.bankAccounts.bankAccounts) (t.journals.journalEntries.some((t) => t.journalDate <= e.endDate && t.lines.some((e) => e.accountId === n.glAccountId)) || n.openingBalance !== 0 && n.openingBalanceDate <= e.endDate) && !t.bankReconciliations.reconciliations.some((t) => t.bankAccountId === n.id && t.statementDate >= e.endDate && t.status === "COMPLETED" && t.difference === 0) && i("BANK_NOT_RECONCILED", `Reconcile ${n.name ?? n.id} through ${e.endDate}.`);
	let h = t.journals.journalEntries.filter((t) => t.journalDate >= e.startDate && t.journalDate <= e.endDate), g = (e) => Math.round((e + 2 ** -52) * 100) / 100, _ = g(h.reduce((e, t) => e + t.totalDebit, 0)), v = g(h.reduce((e, t) => e + t.totalCredit, 0));
	return (!Number.isFinite(_) || !Number.isFinite(v) || _ !== v) && i("TRIAL_BALANCE", "Period journal debits and credits do not balance."), {
		blockers: r,
		journalCount: h.length,
		debit: _,
		credit: v
	};
}
//#endregion
//#region src/features/purchases/data/purchasePostingRecoveryAuthorization.ts
var Bv = null, Vv = {
	configureTrustedSession(e) {
		Bv = e;
	},
	clear() {
		Bv = null;
	},
	current() {
		return Bv?.() ?? null;
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
}, Hv = "htt.purchasePosting.manualRecoveryAudit.v1";
function Uv() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(Hv) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var Wv = Uv();
function Gv(e) {
	Wv.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(Hv, JSON.stringify(Wv));
	} catch {}
}
m("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return Wv.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = j.get(e);
			return Vv.canRecover() && t?.status === "RECOVERY_REQUIRED" && j.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = Vv.requireRecoveryPermission(), n = j.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!j.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				j.recover(e), Gv({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw Gv({
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
	snapshot: () => Wv,
	restore: (e) => {
		Wv.splice(0, Wv.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var Kv = !1;
function qv() {
	if (Kv || (Kv = !0, D.wasRestoredOnLoad())) return;
	let e = R.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Zr.postInvoice(t), t.status === "VOID" && Zr.reverseInvoice(t);
	let t = Ur.getAll();
	for (let e of t) Zr.postPayment(e), e.status === "REVERSED" && Zr.reversePayment(e);
	let n = I.getAll();
	for (let e of n) e.status !== "DRAFT" && (Zr.postCreditNote(e), e.status === "VOID" && Zr.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function Jv() {
	let e = us().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var Yv = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION"
]);
function Xv(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = Se("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return re(t.view), t.result;
	}
	if (e.businessRecordChecked !== !0 || e.originalGlChecked !== !0 || e.reversalGlChecked !== !0 || e.balancesChecked !== !0) throw Error("Business, original/reversal GL and balances must all be inspected.");
	if (typeof e.reference != "string" || e.reference.length > 500 || typeof e.summary != "string" || e.summary.length > 4e3) throw Error("Recovery evidence reference or summary exceeds the allowed length.");
	let t = O.list().find((t) => t.operationId === e.operationId);
	if (!t || !Yv.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return O.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region electron/security/businessEngine.ts
m("salesRecovery", {
	repository: {
		inspectRecovery: tl,
		recordSalesManualReview: Xv,
		closeVerifiedSalesReview: $c,
		previewTargetedRepair: Ds,
		proposeTargetedRepair: Os,
		executeTargetedRepair: ks
	},
	read: "audit.read",
	commands: {
		previewTargetedRepair: "audit.read",
		proposeTargetedRepair: "accounting.recover",
		executeTargetedRepair: "accounting.recover",
		inspectRecovery: "audit.read",
		recordSalesManualReview: "accounting.recover",
		closeVerifiedSalesReview: "accounting.recover"
	},
	snapshot: () => [],
	restore: () => {},
	publish: () => {}
});
var Zv = n();
function Qv(e) {
	fn(zv, () => e()?.userId ?? ""), k.connect(e), Vv.configureTrustedSession(e), qv(), Jv();
}
//#endregion
export { _n as assertPostingPeriod, Qv as initialize, Zv as workspaceDefaults };
