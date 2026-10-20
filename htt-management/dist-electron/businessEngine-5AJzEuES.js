import { $ as e, A as t, B as n, D as r, F as i, G as a, H as o, I as s, J as c, K as l, M as u, N as d, P as f, Q as p, R as m, S as h, U as g, V as _, W as v, X as ee, Y as te, Z as ne, _ as re, a as y, b, c as x, d as ie, et as ae, f as S, g as oe, i as se, k as ce, l as le, m as ue, n as C, nt as de, o as fe, p as pe, q as w, r as T, s as me, t as he, tt as ge, u as _e, v as ve, w as E, y as ye, z as D } from "./accountingPeriodValidation-DFhCVmq4.js";
import { createHash as be } from "node:crypto";
//#region \0rolldown/runtime.js
var xe = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/iso.js
function Se(e) {
	return ee(m, e);
}
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var Ce = [{
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
}], we = [{
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
function Te() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Ee(e, t) {
	let n = Te();
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
function De(e, t) {
	let n = Te();
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
function Oe(e) {
	let t = Te();
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
var ke = "htt:financial-snapshot:v1", Ae = (e) => !!e && typeof e == "object" && !Array.isArray(e), O = (e) => new Set(e.map((e) => e.id)).size === e.length, je = (e) => {
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
	}) && O(t) && O(n) && O(r) && O(i);
}, Me = () => ({
	purchaseOrders: structuredClone(Ce),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(we),
	transactions: [],
	transfers: [],
	journals: []
}), Ne, Pe = !1;
function Fe() {
	return typeof window < "u" && !!window.localStorage;
}
function Ie() {
	if (Ne) return Ne;
	if (!Fe()) return Me();
	let e = Ee(ke, je);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return Pe = e.status === "ok", Ne = e.status === "ok" ? {
		...Me(),
		...e.data
	} : Me(), Ne;
}
var Le = /* @__PURE__ */ new Set(), Re = 0, ze = /* @__PURE__ */ new Set();
function Be(e) {
	if (Fe() && !De(ke, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var k = {
	wasRestoredOnLoad() {
		return Ie(), Pe;
	},
	onRollback(e) {
		Le.add(e);
	},
	notify(e) {
		Re ? ze.add(e) : e();
	},
	transaction(e) {
		if (Re) return e();
		let t = structuredClone(Ie());
		Ne = structuredClone(t), Re++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			Be(Ie());
		} catch (e) {
			throw Ne = t, Le.forEach((e) => e()), ze.clear(), e;
		} finally {
			Re--;
		}
		let r = [...ze];
		return ze.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(Ie());
	},
	update(e, t) {
		let n = {
			...Ie(),
			[e]: structuredClone(t)
		};
		if (!je(n)) throw Error("Invalid financial snapshot; write blocked.");
		Re || Be(n), Ne = n;
	},
	resetCacheForTests() {
		Ne = void 0, Pe = !1;
	}
};
b("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => k.read(),
	restore: (e) => {
		Ne = e;
	},
	publish: () => {}
});
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var Ve = "htt:financial-operations:v1", He = [
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
function Ue() {
	let e = Ee(Ve, pe);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function We(e) {
	if (!Oe(Ve) || !De(Ve, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var A = {
	list() {
		return Ue().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !He.includes(t)) throw Error("Invalid operation identity.");
		let r = Ue(), i = r.find((t) => t.operationId === e);
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
		return We([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = Ue(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return We(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = Ue(), r = n.find((t) => t.operationId === e);
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
		return We(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = Ue(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return We(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = Ue(), a = i.find((t) => t.operationId === e);
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
		return We(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = Ue(), a = i.find((t) => t.operationId === e);
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
		return We(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	attachRepairProposal(e, t) {
		let n = Ue(), r = n.find((t) => t.operationId === e);
		if (!r || r.state !== "MANUAL_REVIEW" || !ue(t) || t.status !== "PROPOSED" || !r.reviewHistory?.some((e) => e.reference === t.reference && e.operator === t.reviewer)) throw Error("Repair proposal has no trusted review evidence.");
		let i = {
			...r,
			repairProposal: structuredClone(t)
		};
		return We(n.map((t) => t.operationId === e ? i : t)), structuredClone(i);
	},
	finishRepair(e, t, n, r, i, a) {
		let o = Ue(), s = o.find((t) => t.operationId === e), c = s?.repairProposal;
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
		return We(o.map((t) => t.operationId === e ? d : t)), structuredClone(d);
	},
	getUnresolved() {
		return Ue().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
b("financialOperations", {
	repository: A,
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
var Ge = null, j = {
	connect(e) {
		return Ge = e, () => {
			Ge === e && (Ge = null);
		};
	},
	disconnect() {
		Ge = null;
	},
	current() {
		return Ge?.() ?? null;
	},
	require(e) {
		return s(this.current(), e);
	}
};
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function Ke(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function qe(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Je(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var Ye = [
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
function Xe(e) {
	return Ye.find((t) => t.id === e);
}
function Ze(e, t) {
	return Xe(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/sales/data/areaPacks.ts
function Qe(e, t) {
	let n = Xe(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function $e(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = Qe(e, t);
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
function et(e) {
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
var tt = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], nt = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], rt = w().trim().refine((e) => e === "" || w().email().safeParse(e).success, { message: "Enter a valid email address" }), it = w().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), at = a({
	businessName: w().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: w().trim().max(120, "Trading name is too long"),
	abn: it,
	businessType: D(tt),
	status: D(nt),
	email: rt,
	phone: w().trim().max(40, "Phone number is too long"),
	website: w().trim().max(200, "Website is too long"),
	creditLimit: v({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: v({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), ot = a({
	name: w().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: w().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: w().trim().max(160, "Address is too long"),
	suburb: w().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: w().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: w().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: w().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: w().trim().max(40, "Phone number is too long"),
	isPrimary: _()
}), st = a({
	isAccounting: _().optional(),
	firstName: w().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: w().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: w().trim().max(100, "Job title is too long"),
	email: w().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: w().trim().max(40, "Phone number is too long"),
	mobile: w().trim().max(40, "Mobile number is too long"),
	locationId: w(),
	isPrimary: _()
}), ct = [
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
], lt = "htt.mock.contacts.customers.v1";
function ut(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var dt = Ee(lt, ut), ft = dt.status !== "invalid" && Oe(lt), pt = /* @__PURE__ */ new Set(), mt = dt.status === "ok" ? dt.data : structuredClone(ct);
function ht() {
	ft && De(lt, mt), pt.forEach((e) => {
		e();
	});
}
function gt(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function _t() {
	let e = mt.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function vt(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function yt(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function bt(e, t) {
	let n = !1;
	if (mt = mt.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	ht();
}
var M = {
	subscribe(e) {
		return pt.add(e), () => {
			pt.delete(e);
		};
	},
	getSnapshot() {
		return mt;
	},
	getAll() {
		return mt;
	},
	getById(e) {
		return mt.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: gt("cus"),
			code: _t(),
			businessName: e.businessName.trim(),
			tradingName: vt(e.tradingName),
			abn: yt(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: vt(e.email),
			phone: vt(e.phone),
			website: vt(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return mt = [n, ...mt], ht(), n;
	},
	update(e, t) {
		let n;
		if (bt(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: vt(t.tradingName),
			abn: yt(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: vt(t.email),
			phone: vt(t.phone),
			website: vt(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = M.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: gt("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: vt(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: vt(t.phone),
			isPrimary: r
		};
		return bt(e, (e) => ({
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
		let r = M.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: vt(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: vt(n.phone),
			isPrimary: a
		};
		return bt(e, (e) => ({
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
		t = st.parse(t);
		let n = M.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: gt("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: vt(t.jobTitle),
			email: t.email.trim(),
			phone: vt(t.phone),
			mobile: vt(t.mobile),
			locationId: vt(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return bt(e, (e) => ({
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
		n = st.parse(n);
		let r = M.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: vt(n.jobTitle),
			email: n.email.trim(),
			phone: vt(n.phone),
			mobile: vt(n.mobile),
			locationId: vt(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return bt(e, (e) => ({
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
b("customers", {
	repository: M,
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
	snapshot: () => ({ customers: mt }),
	restore: (e) => {
		mt = e.customers;
	},
	publish: () => pt.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesRecipients.ts
function xt(e, t) {
	let n = M.getById(e);
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
function St(e) {
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
function Ct(e, t) {
	let n = E(), r = n.journals?.journalEntries ?? [], i = n.bankReconciliations?.reconciliations ?? [], a = r.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (i.some((e) => e.clearedTransactionIds.some((e) => a.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function wt(e, t) {
	let n = E(), r = n.bankAccounts?.bankAccounts ?? [], i = n.bankReconciliations?.reconciliations ?? [];
	for (let n of r.filter((e) => t.includes(e.glAccountId))) {
		let t = i.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
function Tt(e) {
	if (E().bankStatements?.lines.some((t) => t.status === "MATCHED" && t.ledgerIds.some((t) => t.startsWith(e + ":")))) throw Error("Unmatch the bank statement line before reversing its ledger source.");
}
//#endregion
//#region src/features/business-workspace/productRules.ts
function Et(e, t, n, r) {
	let i = Xe(e), a = Ze(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !Ke(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
	if (r === "buy" && i.buyEnabled === !1 || r === "sell" && i.sellEnabled === !1) throw Error(`Product is not available to ${r}.`);
	if (!Number.isFinite(n) || n <= 0) throw Error("Quantity must be finite and greater than zero.");
	if (i.wholePacks && [
		"BOX",
		"ROLL",
		"BUCKET"
	].includes(a.code) && !Number.isInteger(n)) throw Error("This product must be ordered in whole packs.");
}
//#endregion
//#region src/features/purchases/data/purchasePostingOperationRepository.ts
var Dt = /* @__PURE__ */ new Map(), Ot = "htt.purchasePosting.operations.v1";
function kt() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function At() {
	let e = kt();
	if (e) try {
		e.setItem(Ot, JSON.stringify([...Dt.values()]));
	} catch {}
}
function jt() {
	let e = kt();
	if (e) try {
		let t = JSON.parse(e.getItem(Ot) ?? "[]");
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
			Dt.set(t.key, {
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
jt();
var Mt = /* @__PURE__ */ new Set(), Nt = /* @__PURE__ */ new Map(), Pt = /* @__PURE__ */ new Map(), Ft;
function It() {
	At(), Mt.forEach((e) => e());
}
var N = {
	injectFailureBeforeStep(e, t, n = 1) {
		Pt.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Pt.clear();
	},
	registerRecovery(e, t) {
		if (!Dt.has(e)) throw Error(`Unknown posting operation: ${e}`);
		Nt.set(e, t);
	},
	runStep(e, t, n) {
		let r = Dt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Pt.get(i) ?? 0;
		if (a > 0) throw Pt.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return Nt.has(e);
	},
	recover(e) {
		let t = Dt.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = Nt.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Ft === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Ft = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Ft = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = Dt.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...Dt.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return Mt.add(e), () => {
			Mt.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (Dt.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Dt.set(n, r), It(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = Dt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		Dt.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), It();
	},
	completeStep(e, t) {
		let n = Dt.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (Dt.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), It());
	}
};
b("purchaseOperations", {
	repository: N,
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
	snapshot: () => N.getAll(),
	restore: (e) => {
		Dt.clear(), Nt.clear();
		for (let t of e) Dt.set(t.key, t);
	},
	publish: () => Mt.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Lt = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Rt(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Lt.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function P() {
	Rt(A.list(), N.getAll());
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var zt = "htt.mock.sales.quotes.v1", Bt = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function Vt(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !Bt.has(String(t.status)) || ![
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
function Ht() {
	return Ee(zt, Vt);
}
function Ut(e) {
	if (Ht().status === "invalid" || !Oe("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!De("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Wt = "htt.mock.sales.quote-orders.v1";
function Gt(e) {
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
function Kt(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!Vt(t.quotes) || !Gt(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function qt() {
	return Ee(Wt, Kt);
}
function Jt(e) {
	if (!Kt(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = qt(), n = Ht();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !Oe("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!De("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Yt = "htt.mock.sales.documents.v1";
function Xt(e) {
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
function Zt(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!Kt(t) || !Xt(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Qt() {
	return Ee(Yt, Zt);
}
function $t(e) {
	if (!Zt(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Qt();
	if (t.status === "invalid" || t.status === "unavailable" || !Oe("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!De("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var en = [], tn, nn, rn = /* @__PURE__ */ new Set();
function an(e, t) {
	tn = e, nn = t;
}
function on() {
	let e = nn?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function sn(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function cn(e) {
	let t = en.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function ln() {
	rn.forEach((e) => e());
}
function un(e) {
	if (T(e, "Posting date"), !en.length) return;
	let t = en.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!en.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
b("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => en,
		subscribe(e) {
			return rn.add(e), () => {
				rn.delete(e);
			};
		},
		create(e) {
			let t = on(), n = sn(e.reason);
			if (T(e.startDate), T(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (en.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (en.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return en = [...en, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), ln(), r;
		},
		preflight(e) {
			let t = cn(e);
			if (!tn) throw Error("Trusted close checks unavailable.");
			return tn(t);
		},
		close(e) {
			let t = on(), n = sn(e.reason), r = cn(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (en.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return en = en.map((e) => e.id === r.id ? {
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
			} : e), ln(), cn(e.id);
		},
		reopen(e) {
			let t = on(), n = sn(e.reason), r = cn(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (en.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return en = en.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), ln(), cn(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: en }),
	restore: (e) => {
		he(e.periods), en = e.periods;
	},
	publish: ln
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var dn = /* @__PURE__ */ new Set(), F = "2026-10-08T00:00:00.000Z", fn = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: F,
		updatedAt: F
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
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: F,
		updatedAt: F
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
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: F,
		updatedAt: F
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: F,
		updatedAt: F
	}
];
function pn() {
	dn.forEach((e) => e());
}
function mn(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function hn(e) {
	return e?.trim() || void 0;
}
function gn(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function _n(e, t) {
	if (fn.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function vn(e, t) {
	if (!e) return;
	let n = fn.find((n) => n.id !== t && (_e(e) ? n.id === _e(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function yn() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var I = {
	subscribe(e) {
		return dn.add(e), () => {
			dn.delete(e);
		};
	},
	getSnapshot() {
		return fn;
	},
	getAll() {
		return fn;
	},
	getById(e) {
		return fn.find((t) => t.id === e);
	},
	getByCode(e) {
		return fn.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return fn.find((t) => _e(e) ? t.id === _e(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = fn.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = fn.find((t) => _e(e) ? t.id === _e(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = mn(e.code, "Account code"), n = mn(e.name, "Account name");
		gn(t), _n(t), vn(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: yn(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: hn(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return fn = [...fn, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), pn(), i;
	},
	update(e, t) {
		let n = fn.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = mn(t.code, "Account code"), i = mn(t.name, "Account name");
		if (gn(r), _n(r, e), (n.systemRole || le(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: hn(t.description),
			active: n.systemRole || le(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || le(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return fn = fn.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), pn(), a;
	},
	setActive(e, t) {
		let n = fn.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || le(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return fn = fn.map((t) => t.id === e ? r : t), pn(), r;
	}
};
b("accounts", {
	repository: I,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: fn }),
	restore: (e) => {
		fn = e.accounts;
	},
	publish: () => dn.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var bn = /* @__PURE__ */ new Set(), xn = k.read().journals;
k.onRollback(() => {
	xn = k.read().journals;
});
function Sn() {
	bn.forEach((e) => k.notify(e));
}
function Cn(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function wn(e) {
	return e?.trim() || void 0;
}
function Tn(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function En(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = xn.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Dn(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function On(e) {
	if (Tn(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = I.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = Cn(r.debit), o = Cn(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = Cn(t + a), n = Cn(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function kn(e) {
	return e.lines.map((e, t) => {
		let n = I.requireById(e.accountId);
		return {
			id: Dn(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: wn(e.description),
			debit: Cn(e.debit),
			credit: Cn(e.credit)
		};
	});
}
function An(e, t) {
	let n = oe(xn).originals;
	return xn.find((r) => r.sourceType === e && r.sourceId === t && !r.reversedJournalEntryId && !n.has(r.id));
}
var L = {
	subscribe(e) {
		return bn.add(e), () => {
			bn.delete(e);
		};
	},
	getSnapshot() {
		return xn;
	},
	getAll() {
		return xn;
	},
	getById(e) {
		return xn.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return xn.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: An,
	post(e) {
		un(e.journalDate), wt(e.journalDate, e.lines.map((e) => e.accountId));
		let t = On(e), n = wn(e.sourceId);
		if (n) {
			let t = An(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Dn("je"),
			journalNumber: En(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: wn(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: kn(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...xn];
		return k.update("journals", a), xn = a, Sn(), i;
	},
	reverse(e) {
		un(e.reversalDate);
		let t = xn.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (Tt(t.id), t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (Tn(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		wt(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = On(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Dn("je"),
			journalNumber: En(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: kn(r),
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
		}, c = [o, ...xn.map((e) => e.id === t.id ? s : e)];
		return k.update("journals", c), xn = c, Sn(), o;
	}
};
function jn(e, t, n, r) {
	let i = xn.find((t) => t.id === e);
	if (!i) throw Error("Duplicate journal no longer exists.");
	let a = L.reverse({
		journalEntryId: e,
		reversalDate: i.journalDate,
		reason: r
	}), o = xn.map((r) => r.id === e ? {
		...r,
		bankDuplicateCorrection: {
			canonicalJournalId: t,
			operationId: n
		}
	} : r), s = oe(o);
	if (s.invalid.length || !s.originals.has(e)) throw Error("Duplicate correction failed exact-pair verification.");
	return k.update("journals", o), xn = o, Sn(), a;
}
b("journals", {
	repository: L,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: xn }),
	restore: (e) => {
		xn = e.journalEntries;
	},
	publish: () => bn.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var Mn = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Nn(e) {
	let t = e.filter((e) => Mn.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Pn() {
	Nn(A.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Fn = [{
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
}], In = [{
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
}], Ln = [{
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
}], Rn = "htt.mock.sales.credit-notes.v1", zn = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, Bn = (e) => typeof e == "string" && e.length > 0;
function Vn(e) {
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
		].every((e) => Bn(t[e])) || ![
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
		].every((e) => zn(i[e])) || !zn(t.amountApplied) || !zn(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => Bn(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !zn(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !Bn(e.id) || !Bn(e.date) || !zn(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !Bn(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !zn(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function Hn() {
	return Ee(Rn, Vn);
}
function Un(e) {
	if (!Vn(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = Hn();
	if (t.status === "invalid" || t.status === "unavailable" || !Oe("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!De("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var Wn = /* @__PURE__ */ new Set(), Gn = Hn(), Kn = Gn.status === "ok" ? structuredClone(Gn.data.creditNotes) : [], qn = Gn.status === "ok" ? structuredClone(Gn.data.allocations) : [], Jn = [...Kn], Yn = [...qn];
function Xn() {
	Jn = [...Kn], Yn = [...qn], Wn.forEach((e) => e());
}
function Zn(e, t) {
	Un({
		creditNotes: e,
		allocations: t
	}), Kn = e, qn = t, Xn();
}
var R = {
	subscribe(e) {
		return Wn.add(e), () => {
			Wn.delete(e);
		};
	},
	getSnapshot() {
		return Jn;
	},
	getAllocationSnapshot() {
		return Yn;
	},
	getAll() {
		return Jn;
	},
	getAllAllocations() {
		return Yn;
	},
	getById(e) {
		return Kn.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Kn.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Kn.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return qn.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return qn.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (Kn.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return Zn([e, ...Kn], qn), e;
	},
	update(e) {
		if (!Kn.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Zn(Kn.map((t) => t.id === e.id ? e : t), qn), e;
	},
	createAllocation(e) {
		if (qn.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Zn(Kn, [e, ...qn]), e;
	},
	updateAllocation(e) {
		if (!qn.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Zn(Kn, qn.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!Kn.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = qn.some((t) => t.id === e.id) ? qn.map((t) => t.id === e.id ? e : t) : [e, ...qn];
		Zn(Kn.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return qn.find((t) => t.id === e);
	}
};
b("customerCredits", {
	repository: R,
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
			St(n.recipient);
			for (let e of n.lines) et(e), Je(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: Kn,
		allocations: qn
	}),
	restore: (e) => {
		Kn = e.creditNotes, qn = e.allocations, Jn = [...Kn], Yn = [...qn];
	},
	publish: () => Wn.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var Qn = "htt.mock.contacts.customerPricing.v1";
function $n(e) {
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
function er() {
	return Ee(Qn, $n);
}
function tr(e) {
	if (er().status === "invalid" || !Oe("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!De("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var nr = [
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
], rr = /* @__PURE__ */ new Set(), ir = er(), ar = ir.status === "ok" ? ir.data : structuredClone(nr);
function or() {
	rr.forEach((e) => {
		e();
	});
}
function sr(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function cr(e) {
	return e.trim() || void 0;
}
function lr(e, t) {
	let n = Xe(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function ur(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function dr({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = ar.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : ur(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = gr(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function fr(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function pr(e) {
	let t = Ze(e.productId, e.unitId);
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
var mr = {
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
	getById(e) {
		return ar.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ar.filter((t) => t.customerId === e);
	},
	create(e, t) {
		lr(t.productId, t.unitId);
		let n = cr(t.effectiveTo);
		t.active && dr({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = fr(t), a = {
			id: sr("cprice"),
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
		}, o = [a, ...ar];
		return tr(o), ar = o, or(), a;
	},
	update(e, t) {
		let n = mr.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		lr(t.productId, t.unitId);
		let r = cr(t.effectiveTo);
		t.active && dr({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = fr(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = ar.map((t) => t.id === e ? a : t);
		return tr(o), ar = o, or(), a;
	},
	resolve(e) {
		return pr(e);
	},
	resolvePrice(e, t, n, r) {
		let i = mr.resolveBasePrice(e, t, n, r.slice(0, 10)), a = ie({
			customerId: e,
			productId: t,
			unitId: n,
			at: r,
			customerPrice: i.effectivePrice,
			basePrice: i.basePrice,
			hasCustomerPrice: i.source === "CUSTOMER_PRICE"
		});
		if (!a.promotionId) return i;
		let o = Number((i.basePrice - a.price).toFixed(2));
		return {
			...i,
			date: r,
			effectivePrice: a.price,
			source: "PROMOTIONAL_PRICE",
			promotionId: a.promotionId,
			discountAmount: o,
			discountPercent: i.basePrice ? Number((o / i.basePrice * 100).toFixed(2)) : 0
		};
	},
	resolveBasePrice(e, t, n, r) {
		let { unit: i } = lr(t, n), a = ar.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && hr(r, i.effectiveFrom, i.effectiveTo));
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
		let o = pr(a);
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
function hr(e, t, n) {
	return !(e < t || n && e > n);
}
function gr(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
b("customerPrices", {
	repository: mr,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: ar }),
	restore: (e) => {
		ar = e.customerPrices;
	},
	publish: () => rr.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function _r(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function vr({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = se(), inclusiveLineTotal: i }) {
	let a = _r(e * n), o = _r(i === void 0 ? a * r : i - a), s = _r(a + o), c = _r(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? _r(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function yr(e) {
	let t = _r(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = _r(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: _r(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function br({ customerId: e, documentDate: t, draft: n }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let r = Xe(n.productId);
	if (!r) throw Error(`Product ${n.productId} was not found`);
	if (r.status !== "ACTIVE") throw Error(`${r.name} is inactive`);
	let i = Ze(n.productId, n.unitId);
	if (!i) throw Error(`Unit ${n.unitId} was not found for ${r.name}`);
	let a = mr.resolvePrice(e, n.productId, n.unitId, t), o = n.unitPrice !== void 0, s = o ? n.unitPrice : a.effectivePrice;
	if (!Number.isFinite(s) || s < 0) throw Error("Unit price cannot be negative");
	let c = $e(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (Et(n.productId, n.unitId, c.quantity, "sell"), r.sellEnabled === !1) throw Error("Product is not available for selling.");
	let l = r.taxCode ?? y().gstCode, u = se(l), d = o ? x(s, u, n.priceBasis) : s, f = vr({
		taxRate: u,
		inclusiveLineTotal: o && (n.priceBasis ?? y().basis) === "Inclusive" ? Math.round(c.quantity * s * 100) / 100 : void 0,
		quantity: c.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: d
	});
	return {
		id: xr("line"),
		itemType: r.itemType ?? "STOCK",
		...c,
		...S(l),
		priceBasis: o ? n.priceBasis ?? y().basis : "Exclusive",
		grossUnitPrice: o && (n.priceBasis ?? y().basis) === "Inclusive" ? s : void 0,
		promotionId: o ? void 0 : a.promotionId,
		productId: r.id,
		unitId: i.id,
		sku: r.sku,
		description: r.name,
		unitSymbol: i.symbol,
		quantity: c.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: d,
		priceSource: o ? "MANUAL" : a.source,
		customerPriceId: o ? void 0 : a.customerPrice?.id,
		...f
	};
}
function xr(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var Sr = "htt.mock.banking.accounts.v1";
function Cr(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var wr = /* @__PURE__ */ new Set(), Tr = "2026-10-08T00:00:00.000Z", Er = [{
	id: "bank_001",
	name: "Operating Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1000",
	accountType: "TRANSACTION",
	currency: y().currency,
	glAccountId: "acc_1000",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: Tr,
	updatedAt: Tr
}, {
	id: "bank_002",
	name: "Savings Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1010",
	accountType: "SAVINGS",
	currency: y().currency,
	glAccountId: "acc_1010",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: Tr,
	updatedAt: Tr
}], Dr = Ee(Sr, Cr);
Dr.status === "ok" && Dr.data.every((e) => {
	let t = I.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (Er = Dr.data);
function Or() {
	wr.forEach((e) => e());
}
function kr(e) {
	let t = I.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of Er) kr(e);
var Ar = {
	subscribe(e) {
		return wr.add(e), () => {
			wr.delete(e);
		};
	},
	getSnapshot() {
		return Er;
	},
	getAll() {
		return Er;
	},
	getById(e) {
		return Er.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return Er.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = Er.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(e, t) {
		let n = a({
			id: w().optional(),
			name: w().trim().min(1).max(180),
			bankName: w().trim().min(1).max(180),
			accountNumber: w().trim().min(1).max(100),
			accountType: D([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: D(["AUD", "NZD"]),
			glAccountId: w().min(1),
			openingBalanceDate: w(),
			active: _()
		}).strict().parse(e);
		if (T(n.openingBalanceDate, "Opening date"), Er[0] && n.currency !== Er[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let r = Er.find((e) => e.id === n.id);
		if (r && r.updatedAt !== t) throw Error("Bank account changed; reload before editing.");
		if (!r && n.id) throw Error("Bank account was not found.");
		if (Er.some((e) => e.id !== r?.id && e.glAccountId === n.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let i = I.requireById(n.glAccountId);
		if (!i.active || i.type !== "ASSET" || i.systemRole && i.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (r && L.getAll().some((e) => e.lines.some((e) => e.accountId === r.glAccountId)) && (r.glAccountId !== n.glAccountId || r.openingBalanceDate !== n.openingBalanceDate || r.currency !== n.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let o = new Date(Math.max(Date.now(), r ? Date.parse(r.updatedAt) + 1 : 0)).toISOString(), s = {
			...n,
			id: r?.id ?? crypto.randomUUID(),
			openingBalance: r?.openingBalance ?? 0,
			createdAt: r?.createdAt ?? o,
			updatedAt: o
		};
		return kr(s), Er = [...Er.filter((e) => e.id !== s.id), s], Or(), s;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Er = Er.map((t) => t.id === e ? r : t), Oe(Sr) && De(Sr, Er), Or(), r;
	}
};
b("bankAccounts", {
	repository: Ar,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: Er }),
	restore: (e) => {
		Er = e.bankAccounts;
	},
	publish: () => wr.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var jr = /* @__PURE__ */ new Set(), Mr = k.read().payments;
function Nr() {
	jr.forEach((e) => e());
}
function Pr() {
	return `payment_${crypto.randomUUID()}`;
}
function Fr() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Mr.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var Ir = {
	subscribe(e) {
		return jr.add(e), () => {
			jr.delete(e);
		};
	},
	getSnapshot() {
		return Mr;
	},
	getAll() {
		return Mr;
	},
	getById(e) {
		return Mr.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Mr.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Mr.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = Ar.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (T(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (Rr(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = A.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: Rr(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Lr(e.reference),
				notes: Lr(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Mr.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Pr(),
			paymentNumber: Fr(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: Rr(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Lr(e.reference),
			notes: Lr(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && A.bindResult(n, i.id);
		let a = [i, ...Mr];
		if (k.update("payments", a), Mr = a, n && !e.deferOperationCompletion) try {
			A.complete(n, i.id);
		} catch (e) {
			try {
				A.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return Nr(), i;
	},
	recordDepositSettlement(e) {
		if (T(e.paymentDate), !e.depositId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid deposit application payment.");
		if (Mr.some((t) => t.id === e.id || t.depositApplicationId === e.applicationId)) throw Error("Deposit application payment already exists.");
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: e.id,
			paymentNumber: Fr(),
			depositId: e.depositId,
			depositApplicationId: e.applicationId,
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			bankAccountId: e.bankAccountId,
			amount: Rr(e.amount),
			reference: e.reference,
			method: "OTHER",
			notes: "Deposit applied to invoice; no new bank receipt.",
			status: "RECEIVED",
			createdAt: t,
			updatedAt: t
		}, r = [n, ...Mr];
		return k.update("payments", r), Mr = r, Nr(), n;
	},
	reverseDepositSettlement(e, t, n) {
		T(t);
		let r = Mr.find((t) => t.id === e);
		if (!r?.depositApplicationId || r.status !== "RECEIVED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid deposit settlement reversal.");
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, a = Mr.map((t) => t.id === e ? i : t);
		return k.update("payments", a), Mr = a, Nr(), i;
	},
	reverse(e, t) {
		let n = Mr.find((t) => t.id === e);
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
		}, o = Mr.map((t) => t.id === e ? a : t);
		return k.update("payments", o), Mr = o, Nr(), a;
	},
	getReceivedByInvoice(e) {
		return Mr.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Lr(e) {
	return e?.trim() || void 0;
}
function Rr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
b("customerPayments", {
	repository: Ir,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null,
		recordDepositSettlement: null,
		reverseDepositSettlement: null
	},
	snapshot: () => ({ payments: Mr }),
	restore: (e) => {
		Mr = e.payments;
	},
	publish: () => jr.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function zr(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || I.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(I.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
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
function Br(e) {
	return I.requireBySystemRole(e).id;
}
function Vr(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: y().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function Hr(e, t) {
	return L.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Ur(e, t) {
	let n = Hr(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Wr = {
	postInvoice(e) {
		return Hr("CUSTOMER_INVOICE", e.id) || L.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: Br("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Br("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...zr(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = Ur("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: Vr(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = Hr("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = Ar.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return L.post({
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
				accountId: Br("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Ur("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: Vr(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return Hr("CREDIT_NOTE", e.id) || L.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: Br("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...zr(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: Br("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Ur("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: Vr(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, Gr = /* @__PURE__ */ new Set(), Kr = Qt(), qr = qt(), Jr = Ht(), Yr = Kr.status === "ok" ? structuredClone(Kr.data.quotes) : qr.status === "ok" ? structuredClone(qr.data.quotes) : Jr.status === "ok" ? structuredClone(Jr.data) : structuredClone(Fn);
function Xr(e) {
	Kr.status === "ok" || Qt().status !== "empty" ? $t({
		quotes: e,
		salesOrders: Zr,
		invoices: Qr
	}) : qr.status === "ok" || qt().status !== "empty" ? Jt({
		quotes: e,
		salesOrders: Zr
	}) : Ut(e), Yr = e, ni();
}
var Zr = Kr.status === "ok" ? structuredClone(Kr.data.salesOrders) : qr.status === "ok" ? structuredClone(qr.data.salesOrders) : structuredClone(In), Qr = Kr.status === "ok" ? structuredClone(Kr.data.invoices) : structuredClone(Ln);
function $r(e) {
	$t({
		quotes: Yr,
		salesOrders: Zr,
		invoices: e
	}), Qr = e, ni();
}
function ei(e, t = Yr) {
	Kr.status === "ok" || Qt().status !== "empty" ? $t({
		quotes: t,
		salesOrders: e,
		invoices: Qr
	}) : Jt({
		quotes: t,
		salesOrders: e
	}), Zr = e, Yr = t, ni();
}
var ti = ri();
function ni() {
	ti = ri(), Gr.forEach((e) => e());
}
function ri() {
	return [
		...Yr,
		...Zr,
		...Qr
	];
}
var z = {
	createManagedOrder(e) {
		let t = Zr.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: oi("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: si("SO", Zr.map((e) => e.documentNumber)),
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
		return ei([r, ...Zr]), r;
	},
	createManagedInvoice(e) {
		let t = Qr.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = z.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: oi("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: si("INV", Qr.map((e) => e.documentNumber)),
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
		}, a = Zr.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return $t({
			quotes: Yr,
			salesOrders: a,
			invoices: [i, ...Qr]
		}), Zr = a, Qr = [i, ...Qr], ni(), Wr.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = Zr.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => Qr.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ei(Zr.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return Gr.add(e), () => {
			Gr.delete(e);
		};
	},
	getSnapshot() {
		return de(ti);
	},
	getAll() {
		return de(ti);
	},
	getById(e) {
		return de(ti).find((t) => t.id === e);
	},
	getByCustomer(e) {
		return de(ti).filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return de(Yr).filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return Zr.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return Qr.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (ii(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => br({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: oi("quote"),
			type: "QUOTE",
			documentNumber: si("QU", Yr.map((e) => e.documentNumber)),
			recipient: xt(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: ai(e.customerReference),
			notes: ai(e.notes),
			lines: t,
			totals: yr(t),
			createdAt: n,
			updatedAt: n
		};
		return Xr([r, ...Yr]), r;
	},
	updateDraftQuote(e, t) {
		let n = Yr.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			let t = $e(e.productId, e.unitId, e.quantity, e.requestedArea);
			Et(e.productId, e.unitId, t.quantity, "sell");
			let r = Xe(e.productId)?.taxCode ?? y().gstCode, i = vr({
				taxRate: se(r),
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			}), a = n.lines.find((t) => t.id === e.lineId);
			return {
				itemType: Xe(e.productId)?.itemType ?? "STOCK",
				...t,
				id: a?.id ?? oi("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: ui(e.productId, e.unitId).sku,
				description: ui(e.productId, e.unitId).description,
				unitSymbol: ui(e.productId, e.unitId).unitSymbol,
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice,
				priceSource: e.priceSource,
				customerPriceId: e.customerPriceId,
				...S(r),
				...i
			};
		}), i = {
			...n,
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : xt(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: ai(t.customerReference),
			notes: ai(t.notes),
			lines: r,
			totals: yr(r),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Xr(Yr.map((t) => t.id === e ? i : t)), i;
	},
	sendQuote(e) {
		let t = Yr.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return Xr(Yr.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = Yr.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return Xr(Yr.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = Yr.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return Xr(Yr.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = Yr.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: oi("order"),
			type: "SALES_ORDER",
			documentNumber: si("SO", Zr.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: ci(),
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
		return ei([r, ...Zr], Yr.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = Zr.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ei(Zr.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = Zr.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = ci(), i = {
			id: oi("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: si("INV", Qr.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: li(r, Number(y().terms)),
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
		}, a = [i, ...Qr], o = Zr.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return $t({
			quotes: Yr,
			salesOrders: o,
			invoices: a
		}), Qr = a, Zr = o, ni(), Wr.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = Qr.find((t) => t.id === e.invoiceId);
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
			let i = R.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = R.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = di(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = di(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: di(c + l)
			};
		}), a = yr(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (di(di(R.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > di(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: oi("credit-note"),
			creditNoteNumber: si("CN", R.getAll().map((e) => e.creditNoteNumber)),
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
		return R.create(s), Wr.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		P(), Pn();
		let t = R.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = Qr.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = di(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = R.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: oi("credit-allocation"),
			allocationNumber: si("CA", R.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = di(i.amountApplied + r), c = di(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (A.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			A.bindResult(l, o.id), R.commitAllocationAndCredit(o, {
				...i,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(n.id), A.complete(l, o.id);
		} catch (e) {
			try {
				A.flagForReview(l, "Credit allocation/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	reverseCreditAllocation(e) {
		P(), Pn();
		let t = R.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = R.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = Qr.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = di(R.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = di(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (A.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			A.bindResult(l, t.id), R.commitAllocationAndCredit(o, {
				...r,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(i.id), A.complete(l, t.id);
		} catch (e) {
			try {
				A.flagForReview(l, "Credit reversal/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidCreditNote(e) {
		if (E().physicalCustomerReturns?.returns.some((t) => t.creditNoteId === e.creditNoteId && t.status === "POSTED")) throw Error("Reverse the linked physical customer return before voiding this credit.");
		e.voidDate && T(e.voidDate, "Credit reversal date");
		let t = R.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if (e.voidDate && ((t.refundEvents ?? []).some((t) => (t.reversalDate ?? t.date) > e.voidDate) || R.getAllocationsByCreditNote(t.id).some((t) => C(t.reversedAt ?? t.createdAt) > e.voidDate))) throw Error("Credit reversal precedes later settlement activity.");
		if (e.voidDate && e.voidDate < t.creditDate) throw Error("Credit reversal date precedes credit date.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (R.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: e.voidDate ?? r,
			voidReason: n,
			updatedAt: r
		};
		return R.update(i), Wr.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (P(), Pn(), e.operationId) {
			let t = A.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = Qr.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = di(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (T(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = Ir.create({
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
			Wr.postPayment(a);
			let e = L.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			A.complete(i, a.id);
		} catch (e) {
			try {
				A.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	voidInvoice(e, t) {
		P(), Pn();
		let n = Qr.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (Ir.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (R.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && R.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountPaid: 0,
			amountDue: 0,
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		}, o = `sales-invoice-void:${e}`;
		if (A.begin(o, "SALES_INVOICE_VOID", e).status !== "started") throw Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
		try {
			let t = L.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			A.bindResult(o, e), Wr.reverseInvoice(a);
			let n = L.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			$r(Qr.map((t) => t.id === e ? a : t)), A.complete(o, e);
		} catch (e) {
			try {
				A.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		if (Ct("CUSTOMER_PAYMENT", e), P(), Pn(), Ir.getById(e)?.depositApplicationId) throw Error("Reverse this settlement through customer deposits.");
		let n = Ir.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = Qr.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (A.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			A.bindResult(i, e);
			let n = Ir.reverse(e, t);
			Wr.reversePayment(n);
			let a = L.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
			if (a.length !== 1 || a[0].status !== "REVERSED") throw Error("Payment GL reversal could not be verified.");
			return this.recalculateInvoiceBalance(r.id), A.complete(i, e), n;
		} catch (e) {
			try {
				A.flagForReview(i, "Payment reversal/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
	},
	recalculateInvoiceBalance(e) {
		let t = Qr.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = Ir.getReceivedByInvoice(e), r = R.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = di(n.reduce((e, t) => e + t.amount, 0)), a = di(r.reduce((e, t) => e + t.amount, 0)), o = di(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : fi(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return $r(Qr.map((t) => t.id === e ? c : t)), c;
	}
};
function ii(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function ai(e) {
	return e?.trim() || void 0;
}
function oi(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function si(e, t) {
	return me(e, t, C((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function ci() {
	return C((/* @__PURE__ */ new Date()).toISOString());
}
function li(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function ui(e, t) {
	let n = Xe(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = Ze(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function di(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function fi(e) {
	return e < pi(/* @__PURE__ */ new Date());
}
function pi(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
b("sales", {
	repository: z,
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
			St(e.recipient);
			for (let n of e.lines) et(n), Je(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: Yr,
		salesOrders: Zr,
		invoices: Qr
	}),
	restore: (e) => {
		Yr = e.quotes, Zr = e.salesOrders, Qr = e.invoices, ti = ri();
	},
	publish: () => Gr.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var mi = [
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
		currency: y().currency,
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
		currency: y().currency,
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
		currency: y().currency,
		taxRegistered: !0,
		createdAt: "2026-03-05T01:00:00.000Z",
		updatedAt: "2026-03-05T01:00:00.000Z"
	}
], hi = "htt.mock.contacts.suppliers.v1";
function gi(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var _i = Ee(hi, gi), vi = _i.status !== "invalid" && Oe(hi), yi = /* @__PURE__ */ new Set(), bi = _i.status === "ok" ? _i.data : structuredClone(mi);
function xi() {
	vi && De(hi, bi), yi.forEach((e) => {
		e();
	});
}
function Si(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Ci() {
	let e = bi.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function wi(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Ti(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Ei(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: wi(e.tradingName),
		abn: Ti(e.abn),
		status: e.status,
		email: wi(e.email),
		phone: wi(e.phone),
		website: wi(e.website),
		contactName: wi(e.contactName),
		addressLine1: wi(e.addressLine1),
		addressLine2: wi(e.addressLine2),
		suburb: wi(e.suburb),
		state: wi(e.state),
		postcode: wi(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: wi(e.notes)
	};
}
var Di = {
	subscribe(e) {
		return yi.add(e), () => {
			yi.delete(e);
		};
	},
	getSnapshot() {
		return bi;
	},
	getAll() {
		return bi;
	},
	getById(e) {
		return bi.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Si("sup"),
			code: Ci(),
			...Ei(e),
			currency: y().currency,
			createdAt: t,
			updatedAt: t
		};
		return bi = [n, ...bi], xi(), n;
	},
	update(e, t) {
		let n = Di.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...Ei(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return bi = bi.map((t) => t.id === e ? r : t), xi(), r;
	}
};
b("suppliers", {
	repository: Di,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: bi }),
	restore: (e) => {
		bi = e.suppliers;
	},
	publish: () => yi.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function Oi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ki({ orderedQuantity: e, unitCost: t, taxRate: n = se(), inclusiveLineTotal: r }) {
	let i = Oi(e * t), a = Oi(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Oi(i + a)
	};
}
function Ai(e) {
	let t = Oi(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Oi(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Oi(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var ji = /* @__PURE__ */ new Set(), Mi = k.read().purchaseOrders;
k.onRollback(() => {
	Mi = k.read().purchaseOrders;
});
function Ni() {
	try {
		k.update("purchaseOrders", Mi);
	} catch (e) {
		throw Mi = k.read().purchaseOrders, e;
	}
	ji.forEach((e) => k.notify(e));
}
function Pi(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Fi(e) {
	return me("PO", Mi.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function Ii(e) {
	return e?.trim() || void 0;
}
function Li(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = Ye.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (Et(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let r = t.taxCode ?? y().gstCode, i = se(r), a = ki({
			taxRate: i,
			inclusiveLineTotal: (e.priceBasis ?? y().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: x(e.unitCost, i, e.priceBasis)
		});
		return {
			id: Pi("pol"),
			...S(r),
			grossUnitCost: (e.priceBasis ?? y().basis) === "Inclusive" ? e.unitCost : void 0,
			productId: t.id,
			unitId: n.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: n.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: x(e.unitCost, i, e.priceBasis),
			...a
		};
	});
}
function Ri(e) {
	let t = Di.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function zi(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var Bi = {
	subscribe(e) {
		return ji.add(e), () => {
			ji.delete(e);
		};
	},
	getSnapshot() {
		return de(Mi);
	},
	getAll() {
		return de(Mi);
	},
	getById(e) {
		return de(Mi).find((t) => t.id === e);
	},
	getBySupplier(e) {
		return de(Mi).filter((t) => t.supplierId === e);
	},
	create(e) {
		zi(e);
		let t = Ri(e.supplierId), n = Li(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Pi("po"),
			purchaseOrderNumber: Fi(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: Ii(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: Ii(e.supplierReference),
			notes: Ii(e.notes),
			lines: n,
			totals: Ai(n),
			createdAt: r,
			updatedAt: r
		};
		return Mi = [i, ...Mi], Ni(), i;
	},
	updateDraft(e, t) {
		let n = Bi.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		zi(t);
		let r = Ri(t.supplierId), i = Li(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: Ii(t.expectedDeliveryDate),
			supplierReference: Ii(t.supplierReference),
			notes: Ii(t.notes),
			lines: i,
			totals: Ai(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Mi = Mi.map((e) => e.id === n.id ? a : e), Ni(), a;
	},
	approve(e) {
		let t = Bi.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return Vi(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = Bi.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return Vi(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = Bi.getById(e);
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
		return Mi = Mi.map((e) => e.id === n.id ? o : e), Ni(), o;
	},
	recordSupplierBill(e, t) {
		let n = Bi.getById(e);
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
			let n = Hi(e.billedQuantity + t);
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
		return Mi = Mi.map((e) => e.id === n.id ? c : e), Ni(), c;
	},
	reverseSupplierBill(e, t) {
		let n = Bi.getById(e);
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
				billedQuantity: Hi(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Mi = Mi.map((e) => e.id === n.id ? c : e), Ni(), c;
	},
	cancel(e, t) {
		let n = Bi.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return Vi(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function Vi(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return Mi = Mi.map((t) => t.id === e.id ? n : t), Ni(), n;
}
function Hi(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
b("purchaseOrders", {
	repository: Bi,
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
	snapshot: () => ({ purchaseOrders: Mi }),
	restore: (e) => {
		Mi = e.purchaseOrders;
	},
	publish: () => ji.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function B(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Ui(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function Wi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Gi({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return Ui(e / t);
}
function Ki({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return Wi(e * t);
}
function qi({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = B(e + n), a = Wi(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : Ui(a / i)
	};
}
function Ji({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return Wi(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Yi(e) {
	return Wi(e.lines.reduce((e, t) => {
		let n = Gi({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Ki({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function Xi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Zi(e) {
	return I.requireBySystemRole(e).id;
}
function Qi(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: y().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function $i(e, t) {
	return L.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function ea(e, t) {
	let n = $i(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var ta = {
	validateGoodsReceiptPosting(e) {
		let t = I.requireBySystemRole("INVENTORY"), n = I.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Yi(e);
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
		let t = L.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return L.post({
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
		let n = I.requireBySystemRole("GRNI"), r = I.requireBySystemRole("GST_RECEIVABLE"), i = I.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = Xi(e.totals.subtotal - t);
		if (a !== 0) {
			let e = I.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = Xi(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = $i("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return L.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: Zi("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...zr(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: Zi("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: Zi("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = ea("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: Qi(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = $i("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = Ar.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return L.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: Zi("ACCOUNTS_PAYABLE"),
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
		let t = ea("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: Qi(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return $i("SUPPLIER_CREDIT", e.id) || L.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: Zi("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? Zi("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...zr(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of L.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) L.reverse({
			journalEntryId: t.id,
			reversalDate: Qi(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = ea("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: Qi(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, na = structuredClone([{
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
}]), ra = {
	getAll() {
		return na;
	},
	getById(e) {
		return na.find((t) => t.id === e);
	},
	getActive() {
		return na.filter((e) => e.status === "ACTIVE");
	}
}, ia = /* @__PURE__ */ new Set(), aa = [];
function oa() {
	ia.forEach((e) => e());
}
function sa() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = aa.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var ca = {
	subscribe(e) {
		return ia.add(e), () => {
			ia.delete(e);
		};
	},
	getSnapshot() {
		return aa;
	},
	getAll() {
		return aa;
	},
	getByReference(e, t) {
		return aa.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return aa.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return aa.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: sa(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return aa = [t, ...aa], oa(), t;
	}
};
b("inventoryMovements", {
	repository: ca,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: aa }),
	restore: (e) => {
		aa = e.movements;
	},
	publish: () => ia.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var la = /* @__PURE__ */ new Set(), ua = [];
function da() {
	la.forEach((e) => e());
}
var fa = {
	subscribe(e) {
		return la.add(e), () => {
			la.delete(e);
		};
	},
	getSnapshot() {
		return ua;
	},
	getAll() {
		return ua;
	},
	getBalance(e, t) {
		return ua.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = fa.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return ua = ua.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? ua.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...ua], da(), e;
	},
	replaceAll(e) {
		ua = e, da();
	},
	clear() {
		ua = [], da();
	}
};
b("costBalances", {
	repository: fa,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: ua }),
	restore: (e) => {
		ua = e.balances;
	},
	publish: () => la.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var pa = /* @__PURE__ */ new Set(), ma = [];
function ha() {
	pa.forEach((e) => e());
}
function ga() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = ma.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function _a(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var va = {
	subscribe(e) {
		return pa.add(e), () => {
			pa.delete(e);
		};
	},
	getSnapshot() {
		return ma;
	},
	getAll() {
		return ma;
	},
	getByReference(e, t) {
		return ma.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return ma.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return ma.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return ma.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return _a(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: ga(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = va.build(e);
		return ma = [t, ...ma], ha(), t;
	},
	replaceAll(e) {
		ma = e, ha();
	},
	clear() {
		ma = [], ha();
	}
};
b("costMovements", {
	repository: va,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: ma }),
	restore: (e) => {
		ma = e.movements;
	},
	publish: () => pa.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var ya = /* @__PURE__ */ new Set(), ba = "2026-01-01T00:00:00.000Z", xa = Ye.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: ba,
	updatedAt: ba
}));
function Sa() {
	ya.forEach((e) => e());
}
var Ca = {
	ensureProductPolicy(e, t, n) {
		let r = xa.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return xa = [...xa.filter((t) => t.productId !== e), a], Sa(), a;
	},
	subscribe(e) {
		return ya.add(e), () => {
			ya.delete(e);
		};
	},
	getSnapshot() {
		return xa;
	},
	getAll() {
		return xa;
	},
	getByProductId(e) {
		return xa.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = Ca.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !Ke(Xe(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...Ca.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return xa = xa.map((t) => t.productId === e ? n : t), Sa(), n;
	}
};
b("costingPolicies", {
	repository: Ca,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: xa }),
	restore: (e) => {
		xa = e.policies;
	},
	publish: () => ya.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function wa(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function Ta(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function Ea(e, t) {
	let n = Xe(e);
	if (!n) throw Error("Product was not found.");
	if (!Ke(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = Ca.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Ze(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function Da(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = Wi(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(Wi(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function Oa(e) {
	if (e && va.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function ka({ movement: e, balance: t }) {
	let n = va.getAll(), r = fa.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	va.replaceAll(i), fa.replaceAll(a);
}
function Aa(e) {
	if (wa(e.quantity), Ta(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	Oa(e.inventoryMovementId);
	let { policy: t, unit: n } = Ea(e.productId, e.unitId), r = B(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Gi({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Ki({
		quantityBase: r,
		unitCostBase: i
	}), o = fa.getBalance(e.siteId, e.productId);
	o && Da(o, t.baseUnitId);
	let s = qi({
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
	Da(l, t.baseUnitId);
	let u = va.build({
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
	return ka({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function ja(e) {
	wa(e.quantity), Ta(e.occurredAt), Oa(e.inventoryMovementId);
	let { policy: t, unit: n } = Ea(e.productId, e.unitId), r = B(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = fa.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (Da(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = Ui(i.averageCostPerBaseUnit), o = Ji({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = B(i.quantityOnHand - r), c = s === 0, l = Wi(c ? -i.inventoryValue : -o), u = c ? 0 : Wi(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : Ui(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	Da(p, t.baseUnitId);
	let m = va.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: B(-r),
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
	return ka({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function Ma(e) {
	if (wa(e.quantityBase), Ta(e.occurredAt), Oa(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = Xe(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!Ke(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = Ca.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = B(e.quantityBase), i = Ui(e.unitCostBase), a = Wi(e.inventoryValue), o = fa.getBalance(e.siteId, e.productId);
	o && Da(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = B(s + r), u = Wi(c + a), d = l === 0 ? 0 : Ui(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	Da(p, n.baseUnitId);
	let m = va.build({
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
	return ka({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var Na = /* @__PURE__ */ new Set(), Pa = [];
function Fa() {
	Na.forEach((e) => e());
}
function Ia(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var La = {
	subscribe(e) {
		return Na.add(e), () => {
			Na.delete(e);
		};
	},
	getSnapshot() {
		return Pa;
	},
	getAll() {
		return Pa;
	},
	getBalance(e, t) {
		return Pa.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = La.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: Ia(i.quantityOnHand + r),
				updatedAt: a
			};
			return Pa = Pa.map((r) => r.siteId === e && r.productId === t ? n : r), Fa(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: Ia(r),
			updatedAt: a
		};
		return Pa = [o, ...Pa], Fa(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = La.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = Ia(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Pa = Pa.map((n) => n.siteId === e && n.productId === t ? o : n), Fa(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of ca.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: Ia((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		Pa = Array.from(e.values()), Fa();
	}
};
b("stock", {
	repository: La,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: Pa }),
	restore: (e) => {
		Pa = e.balances;
	},
	publish: () => Na.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var Ra = /* @__PURE__ */ new Set(), za = k.read().goodsReceipts;
k.onRollback(() => {
	za = k.read().goodsReceipts;
});
function Ba() {
	try {
		k.update("goodsReceipts", za);
	} catch (e) {
		throw za = k.read().goodsReceipts, e;
	}
	Ra.forEach((e) => k.notify(e));
}
function Va(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Ha(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = za.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Ua(e) {
	return e?.trim() || void 0;
}
var Wa = {
	subscribe(e) {
		return Ra.add(e), () => {
			Ra.delete(e);
		};
	},
	getSnapshot() {
		return za;
	},
	getAll() {
		return za;
	},
	getById(e) {
		return za.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return za.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Bi.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = ra.getById(e.siteId);
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
			let r = Va(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!Xe(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Ze(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = Va(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: Ha(e.receiptDate),
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
			supplierDeliveryReference: Ua(e.supplierDeliveryReference),
			notes: Ua(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		ta.validateGoodsReceiptPosting(s), P();
		let c = N.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return N.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = Xe(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				N.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = ca.create({
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
				}), N.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					Aa({
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
				}), N.runStep(c, `STOCK:${r.id}`, () => {
					La.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			N.runStep(c, "JOURNAL", () => {
				ta.postGoodsReceipt(s);
			}), N.runStep(c, "PURCHASE_ORDER", () => {
				Bi.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), N.runStep(c, "RECEIPT", () => {
				za = [s, ...za], Ba();
			});
		}), N.recover(c), s;
	}
};
b("goodsReceipts", {
	repository: Wa,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: za }),
	restore: (e) => {
		za = e.goodsReceipts;
	},
	publish: () => Ra.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var Ga = 1e-4;
function Ka(e) {
	return Wi(e);
}
function qa(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - B(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function Ja(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Ya(e, t, n) {
	let r = Gi({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Ki({
		quantityBase: B(e * n),
		unitCostBase: r
	});
}
function Xa(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = B(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = B(e.receivedQuantity - t);
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
function Za(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = Xa(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), qa(e.quantity), Ja(e.billUnitCost);
		let r = B(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > Ga);
		if (B(d.reduce((e, t) => e + t.availableQuantity, 0)) + Ga < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= Ga) break;
			let s = B(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = B(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Ki({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: Gi({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Ka(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= Ga ? Ka(p - m) : Ya(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let g = Ka(s * e.billUnitCost), _ = Ka(g - h);
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
			}), o.availableQuantity = B(o.availableQuantity - s), r = B(r - s);
		}
		if (r > Ga) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Ka(Ka(e.quantity * e.billUnitCost) - Ka(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Ka(p.matchedBillValue + f), p.priceVariance = Ka(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = B(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = B(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Ka(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Ka(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Ka(p - f)
	};
}
var Qa = {
	calculate: Za,
	getAvailableReceiptLines(e, t, n) {
		return Xa(e, t, n);
	}
}, $a = k.read().receiptMatches;
k.onRollback(() => {
	$a = k.read().receiptMatches;
});
var eo = /* @__PURE__ */ new Set(), to = () => {
	try {
		k.update("receiptMatches", $a);
	} catch (e) {
		throw $a = k.read().receiptMatches, e;
	}
	eo.forEach((e) => k.notify(e));
}, no = {
	getAll() {
		return [...$a];
	},
	subscribe(e) {
		return eo.add(e), () => {
			eo.delete(e);
		};
	},
	getSnapshot() {
		return $a;
	},
	getByBill(e) {
		return $a.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if ($a.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		$a = [...$a, ...t], to();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		$a = $a.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), to();
	}
};
b("receiptMatches", {
	repository: no,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: $a }),
	restore: (e) => {
		$a = e.matches;
	},
	publish: () => eo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function ro(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function io({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = ro(e * t), a = ro(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: ro(i + a)
	};
}
function ao(e) {
	let t = ro(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = ro(e.reduce((e, t) => e + t.taxAmount, 0)), r = ro(t + n);
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
var oo = /* @__PURE__ */ new Set(), V = k.read().supplierBills;
k.onRollback(() => {
	V = k.read().supplierBills;
});
function so() {
	try {
		k.update("supplierBills", V);
	} catch (e) {
		throw V = k.read().supplierBills, e;
	}
	oo.forEach((e) => k.notify(e));
}
function co(e) {
	return e?.trim() || void 0;
}
function lo(e) {
	return me("BILL", V.map((e) => e.billNumber), e.slice(0, 4));
}
var uo = {
	insertExpenseBill(e) {
		let t = V.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (V.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return V = [e, ...V], so(), e;
	},
	subscribe(e) {
		return oo.add(e), () => {
			oo.delete(e);
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
	applyPayment(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = po(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = po(n.totals.amountPaid + r), a = po(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), so(), o;
	},
	reversePayment(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = po(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = po(Math.max(0, n.totals.amountPaid - r)), a = po(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), so(), o;
	},
	applyCredit(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = po(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = po(n.totals.amountCredited + r), a = po(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), so(), o;
	},
	reverseCredit(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = po(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = po(Math.max(0, n.totals.amountCredited - r)), a = po(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), so(), o;
	},
	markVoid(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((E().supplierCredits?.supplierCredits ?? k.read().supplierCredits).some((e) => e.sourceSupplierBillId === n.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (n.kind === "EXPENSE") {
			P();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...n,
				status: "VOID",
				voidedAt: e,
				voidReason: r,
				updatedAt: e
			};
			return ta.reverseSupplierBill(t), V = V.map((e) => e.id === n.id ? t : e), so(), t;
		}
		if (no.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		};
		P();
		let o = N.begin("SUPPLIER_BILL_VOID", n.id).key;
		return N.registerRecovery(o, () => {
			N.runStep(o, "REVERSAL_JOURNAL", () => {
				ta.reverseSupplierBill(a);
			}), N.runStep(o, "PURCHASE_ORDER", () => {
				Bi.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), N.runStep(o, "MATCHES", () => {
				no.reverseForBill(n.id, r, C(i));
			}), N.runStep(o, "BILL", () => {
				V = V.map((e) => e.id === n.id ? a : e), so();
			});
		}), N.recover(o), a;
	},
	getByPurchaseOrder(e) {
		return V.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Bi.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (V.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
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
			let r = fo(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = io({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = po(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = po(o.lineSubtotal + o.taxAmount)), {
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
		}), o = ao(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: lo(e.billDate),
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
			notes: co(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Qa.calculate({
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
			receipts: Wa.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: no.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		ta.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), P();
		let u = N.begin("SUPPLIER_BILL", c.id).key;
		return N.registerRecovery(u, () => {
			N.runStep(u, "JOURNAL", () => {
				ta.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), N.runStep(u, "PURCHASE_ORDER", () => {
				Bi.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), N.runStep(u, "MATCHES", () => {
				no.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), N.runStep(u, "BILL", () => {
				V = [c, ...V], so();
			});
		}), N.recover(u), c;
	}
};
function fo(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function po(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
b("supplierBills", {
	repository: uo,
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
	snapshot: () => ({ supplierBills: V }),
	restore: (e) => {
		V = e.supplierBills;
	},
	publish: () => oo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierPaymentRepository.ts
var mo = /* @__PURE__ */ new Set(), ho = k.read().supplierPayments;
k.onRollback(() => {
	ho = k.read().supplierPayments;
});
function go() {
	k.update("supplierPayments", ho), mo.forEach((e) => k.notify(e));
}
var _o = {
	subscribe(e) {
		return mo.add(e), () => {
			mo.delete(e);
		};
	},
	getSnapshot() {
		return ho;
	},
	getAll() {
		return ho;
	},
	getById(e) {
		return ho.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return ho.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return ho.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: yo(e.reference),
			notes: yo(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: bo(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = ho.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (T(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = Di.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = Ar.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = uo.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = bo(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${xo(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = bo(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) uo.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: vo(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: yo(e.reference),
			notes: yo(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return ho = [u, ...ho], go(), ta.postSupplierPayment(u), u;
	},
	recordPrepaymentSettlement(e) {
		T(e.paymentDate);
		let t = Di.getById(e.supplierId), n = uo.getById(e.supplierBillId);
		if (!t || !n || n.supplierId !== t.id || e.paymentDate < n.billDate || !e.prepaymentId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid supplier prepayment application.");
		if (ho.some((t) => t.id === e.id || t.prepaymentApplicationId === e.applicationId)) throw Error("Prepayment application already exists.");
		uo.applyPayment(n.id, e.amount);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: e.id,
			prepaymentId: e.prepaymentId,
			prepaymentApplicationId: e.applicationId,
			paymentNumber: vo(e.paymentDate),
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
		return ho = [i, ...ho], go(), i;
	},
	reversePrepaymentSettlement(e, t, n) {
		T(t);
		let r = ho.find((t) => t.id === e);
		if (!r?.prepaymentApplicationId || r.status !== "POSTED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid supplier prepayment reversal.");
		for (let e of r.allocations) uo.reversePayment(e.supplierBillId, e.amount);
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ho = ho.map((t) => t.id === e ? i : t), go(), i;
	},
	reverse(e, t) {
		if (Ct("SUPPLIER_PAYMENT", e), ho.find((t) => t.id === e)?.prepaymentApplicationId) throw Error("Reverse this settlement through supplier prepayments.");
		let n = ho.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = uo.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) uo.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return ho = ho.map((t) => t.id === e ? a : t), go(), ta.reverseSupplierPayment(a), a;
	}
};
function vo(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = ho.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function yo(e) {
	return e?.trim() || void 0;
}
function bo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xo(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: y().currency
	}).format(e);
}
var So = _o.create;
_o.create = function(...e) {
	return P(), k.transaction(() => So.apply(_o, e));
};
var Co = _o.reverse;
_o.reverse = function(...e) {
	return P(), k.transaction(() => Co.apply(_o, e));
}, b("supplierPayments", {
	repository: _o,
	read: "purchases.read",
	commands: {
		recordPrepaymentSettlement: null,
		reversePrepaymentSettlement: null,
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: ho }),
	restore: (e) => {
		ho = e.supplierPayments;
	},
	publish: () => mo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var wo = /* @__PURE__ */ new Set(), H = k.read().supplierCredits, To = k.read().supplierCreditAllocations, Eo = k.read().supplierCredits, Do = k.read().supplierCreditAllocations;
k.onRollback(() => {
	H = k.read().supplierCredits, To = k.read().supplierCreditAllocations, Eo = H, Do = To;
});
function Oo() {
	k.update("supplierCredits", H), k.update("supplierCreditAllocations", To), Eo = [...H], Do = [...To], wo.forEach((e) => k.notify(e));
}
var ko = !1, U = {
	subscribe(e) {
		return wo.add(e), () => {
			wo.delete(e);
		};
	},
	getSnapshot() {
		return Eo;
	},
	getAllocationSnapshot() {
		return Do;
	},
	getAll() {
		return Eo;
	},
	getAllAllocations() {
		return Do;
	},
	getById(e) {
		return H.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return H.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return H.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return To.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return To.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return To.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...U.create(e),
			physicalReturnId: t
		};
		return U.update(n), n;
	},
	voidReturnCredit(e) {
		ko = !0;
		try {
			return U.voidCredit(e);
		} finally {
			ko = !1;
		}
	},
	create(e) {
		let t = uo.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (H.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!No(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = Fo(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = H.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = Po(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = Po(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || Po(m + f) > r.lineSubtotal || Po(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let g = Po(m + h);
			return {
				id: Mo(`supplier-credit-line-${n + 1}`),
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
		}), s = Po(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = Po(o.reduce((e, t) => e + t.taxAmount, 0)), l = Po(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (Po(Po(H.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > Po(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: Mo("supplier-credit"),
			creditNumber: jo(e.creditDate),
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
		return H = [d, ...H], Oo(), ta.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = H.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = uo.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!No(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = Po(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: Mo("supplier-credit-allocation"),
			allocationNumber: Ao(e.allocationDate),
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
		uo.applyCredit(n.id, r);
		let o = Po(t.amountApplied + r), s = Po(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return To = [a, ...To], H = H.map((e) => e.id === t.id ? c : e), Oo(), a;
	},
	reverseAllocation(e) {
		let t = To.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = H.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = uo.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		uo.reverseCredit(i.id, t.amount);
		let o = Po(Math.max(0, r.amountApplied - t.amount)), s = Po(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return H = H.map((e) => e.id === r.id ? c : e), To = To.map((e) => e.id === t.id ? l : e), Oo(), l;
	},
	voidCredit(e) {
		let t = H.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !ko) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (To.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: ko && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return H = H.map((e) => e.id === t.id ? i : e), Oo(), ta.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!To.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return To = To.map((t) => t.id === e.id ? e : t), Oo(), e;
	},
	update(e) {
		if (!H.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return H = H.map((t) => t.id === e.id ? e : t), Oo(), e;
	}
};
function Ao(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = To.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function jo(e) {
	return me("SC", H.map((e) => e.creditNumber), e.slice(0, 4));
}
function Mo(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function No(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function Po(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Fo(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Io = U.create;
U.create = function(...e) {
	return P(), k.transaction(() => Io.apply(U, e));
};
var Lo = U.applyToBill;
U.applyToBill = function(...e) {
	return P(), k.transaction(() => Lo.apply(U, e));
};
var Ro = U.reverseAllocation;
U.reverseAllocation = function(...e) {
	return P(), k.transaction(() => Ro.apply(U, e));
};
var zo = U.voidCredit;
U.voidCredit = function(...e) {
	return P(), k.transaction(() => zo.apply(U, e));
};
var Bo = U.update;
U.update = function(...e) {
	return P(), k.transaction(() => Bo.apply(U, e));
};
var Vo = U.updateAllocation;
U.updateAllocation = function(...e) {
	return P(), k.transaction(() => Vo.apply(U, e));
}, b("supplierCredits", {
	repository: U,
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
		supplierCredits: H,
		allocations: To
	}),
	restore: (e) => {
		H = e.supplierCredits, To = e.allocations, Eo = [...H], Do = [...To];
	},
	publish: () => wo.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function Ho(e) {
	let t = [], n = new Map(e.journals.map((e) => [e.id, e])), r = oe(e.journals);
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
var Uo = /* @__PURE__ */ new Set(), Wo = k.read().transactions, Go = k.read().transfers;
k.onRollback(() => {
	let e = k.read();
	Wo = e.transactions, Go = e.transfers;
});
function Ko() {
	Uo.forEach((e) => k.notify(e));
}
function qo(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Jo(e) {
	return e?.trim() || void 0;
}
function Yo(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Xo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Zo(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Qo(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var $o = {
	subscribe(e) {
		return Uo.add(e), () => {
			Uo.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Wo;
	},
	getTransfersSnapshot() {
		return Go;
	},
	getTransactions() {
		return Wo;
	},
	getTransfers() {
		return Go;
	},
	createTransaction(e, t) {
		if (Yo(e.transactionDate), T(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Xo(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = qo(e.description, "Description"), i = Ar.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = I.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = I.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (Ar.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = Zo("banktxn"), c = Qo("BTXN", e.transactionDate, Wo.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = A.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Wo.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && A.bindResult(l, s);
			let t = L.post({
				journalDate: e.transactionDate,
				description: r,
				reference: Jo(e.reference),
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
				reference: Jo(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Wo];
			if (k.update("transactions", d), Wo = d, Ko(), l) {
				let e = L.getBySource("BANK_TRANSACTION", s);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return u;
		} catch (e) {
			if (l) try {
				A.flagForReview(l, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		Yo(e.transferDate), T(e.transferDate, "Transfer date");
		let n = Xo(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = qo(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = Ar.requireById(e.fromBankAccountId), a = Ar.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = I.requireById(i.glAccountId), s = I.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = Zo("banktrf"), l = Qo("BTRF", e.transferDate, Go.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = A.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Go.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && A.bindResult(u, c);
			let t = L.post({
				journalDate: e.transferDate,
				description: r,
				reference: Jo(e.reference),
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
				reference: Jo(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...Go];
			if (k.update("transfers", f), Go = f, Ko(), u) {
				let e = L.getBySource("BANK_TRANSFER", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return d;
		} catch (e) {
			if (u) try {
				A.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, es = $o.createTransaction;
$o.createTransaction = function(e, t) {
	P();
	let n;
	try {
		return n = k.transaction(() => es.call($o, e, t)), t && A.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = A.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				A.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
var ts = $o.createTransfer;
$o.createTransfer = function(e, t) {
	P();
	let n;
	try {
		return n = k.transaction(() => ts.call($o, e, t)), t && A.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = A.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				A.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
function ns(e) {
	if (Wo.some((t) => t.id === e.id) || Go.some((t) => t.id === e.id)) throw Error("Bank result already exists; restoration cannot duplicate it.");
	"transactionNumber" in e ? (Wo = [structuredClone(e), ...Wo], k.update("transactions", Wo)) : (Go = [structuredClone(e), ...Go], k.update("transfers", Go)), Ko();
}
function rs(e, t, n) {
	if ([...Wo, ...Go].filter((n) => n.id === e && n.journalEntryId === t).length !== 1) throw Error("Bank result changed before journal repair.");
	Wo = Wo.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), Go = Go.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), k.update("transactions", Wo), k.update("transfers", Go), Ko();
}
b("bankTransactions", {
	repository: $o,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Wo,
		bankTransfers: Go
	}),
	restore: (e) => {
		Wo = e.bankTransactions, Go = e.bankTransfers;
	},
	publish: () => Uo.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function is(e) {
	return Ho({
		transactions: e?.transactions ?? $o.getTransactions(),
		transfers: e?.transfers ?? $o.getTransfers(),
		payments: Ir.getAll(),
		journals: e?.journals ?? L.getAll(),
		invoices: z.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: R.getAll(),
		supplierBills: uo.getAll(),
		supplierPayments: _o.getAll(),
		supplierCredits: U.getAll()
	});
}
//#endregion
//#region src/features/banking/data/bankRecoveryEvidence.ts
var as = (e) => e === "BANK_TRANSACTION" || e === "BANK_TRANSFER";
function os(e, t, n = !0) {
	let r = A.list(), i = r.filter((t) => t.operationId === e);
	if (i.length !== 1) return ["Bank operation identity is missing or duplicated."];
	let a = i[0], o = [];
	if ((!as(a.kind) || (n ? a.state !== "MANUAL_REVIEW" : a.state === "COMPLETED")) && o.push("Operation is not an unresolved bank review."), a.resultId || o.push("Operation has no durable bound result; cannot infer effects."), n && !a.reviewHistory?.length && o.push("Operator reconciliation evidence is missing."), o.length) return o;
	let s = t?.transactions ?? $o.getTransactions(), c = t?.transfers ?? $o.getTransfers(), l = t?.journals ?? L.getAll(), u = a.kind === "BANK_TRANSACTION" ? s : c;
	if (u.filter((e) => e.id === a.resultId).length !== 1) return ["Bank business result is missing or duplicated."];
	let d = s.find((e) => e.id === a.resultId), f = c.find((e) => e.id === a.resultId), p = u.find((e) => e.id === a.resultId), m = (e) => new Set(e).size === e.length;
	if (!m(l.map((e) => e.id)) || !m(u.map((e) => e.id))) return ["Duplicate bank or GL identity; evidence is ambiguous."];
	let h = oe(l);
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
	let ee = (e) => Math.round((e + 2 ** -52) * 100), te = p.amount;
	(!Number.isFinite(te) || te <= 0 || Math.abs(te - ee(te) / 100) > 1e-8) && o.push("Bank amount must be positive whole cents."), (_.journalDate !== v || _.description !== p.description || _.reference !== p.reference) && o.push("Journal date, description or reference differs from the bank result.");
	let ne, re, y = I.getAll();
	if (a.kind === "BANK_TRANSACTION") {
		let e = Ar.getById(d.bankAccountId), t = y.find((e) => e.id === d.offsetAccountId);
		(!e || !t || !t.allowManualPosting || e.glAccountId === t.id || Ar.getByGlAccountId(t.id) || v < e.openingBalanceDate) && o.push("Bank or offset account mapping is invalid."), ["MONEY_IN", "MONEY_OUT"].includes(d.direction) || o.push("Bank direction is invalid."), ne = d.direction === "MONEY_IN" ? e?.glAccountId : t?.id, re = d.direction === "MONEY_IN" ? t?.id : e?.glAccountId;
	} else {
		let e = Ar.getById(f.fromBankAccountId), t = Ar.getById(f.toBankAccountId);
		(!e || !t || e.id === t.id || e.glAccountId === t.glAccountId || e.currency !== t.currency || v < e.openingBalanceDate || v < t.openingBalanceDate) && o.push("Transfer bank mappings, currency or dates are invalid."), ne = t?.glAccountId, re = e?.glAccountId;
	}
	(!ne || !re || !y.some((e) => e.id === ne) || !y.some((e) => e.id === re) || _.lines.length !== 2 || !_.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0) || !_.lines.some((e) => e.accountId === ne && e.debit === te && e.credit === 0) || !_.lines.some((e) => e.accountId === re && e.credit === te && e.debit === 0) || _.totalDebit !== te || _.totalCredit !== te) && o.push("Bank journal accounts, direction or amounts do not exactly match the bound result.");
	try {
		let e = JSON.parse(a.fingerprint);
		(!e || typeof e != "object" || !Number.isFinite(e.amount) || ee(e.amount) !== ee(te) || typeof e.description != "string" || e.description.trim() !== p.description || ((e) => typeof e == "string" && e.trim() || void 0)(e.reference) !== p.reference || (a.kind === "BANK_TRANSACTION" ? e.bankAccountId !== d.bankAccountId || e.transactionDate !== v || e.direction !== d.direction || e.offsetAccountId !== d.offsetAccountId : e.fromBankAccountId !== f.fromBankAccountId || e.toBankAccountId !== f.toBankAccountId || e.transferDate !== v)) && o.push("Saved bank intent does not match the bound business result.");
	} catch {
		o.push("Saved bank intent is unreadable; cannot verify original request.");
	}
	return r.some((e) => e.operationId !== a.operationId && e.kind === a.kind && e.resultId === a.resultId) && o.push("Another operation claims this bank result."), o;
}
//#endregion
//#region electron/security/targetedFinancialRepair.ts
var ss = w().trim().min(1).max(200), cs = w().trim().min(3).max(500), ls = w().trim().min(10).max(4e3), us = w().regex(/^[a-f0-9]{64}$/), ds = a({ operationId: ss }).strict(), fs = ds.extend({
	expectedDigest: us,
	reference: cs,
	summary: ls,
	businessChecked: g(!0),
	glChecked: g(!0),
	externalEvidenceChecked: g(!0)
}).strict(), ps = ds.extend({
	proposalId: ss,
	expectedDigest: us,
	approvalReference: cs,
	confirm: g(!0)
}).strict(), ms = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function hs(e) {
	return Array.isArray(e) ? e.map(hs) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, hs(t)])) : e;
}
var gs = (e) => be("sha256").update(JSON.stringify(hs(e))).digest("hex");
function _s() {
	return gs({
		business: E(),
		operations: A.list().map(({ repairProposal: e, ...t }) => t)
	});
}
function vs(e, t) {
	return typeof e == "string" ? e === t || e.startsWith(t + ":") : Array.isArray(e) ? e.some((e) => vs(e, t)) : !!e && typeof e == "object" && Object.values(e).some((e) => vs(e, t));
}
function ys(e) {
	let t = {
		amount: v().finite().positive(),
		description: w().trim().min(1).max(2e3),
		reference: w().max(2e3).optional()
	}, n = (e.kind === "BANK_TRANSACTION" ? a({
		...t,
		bankAccountId: ss,
		transactionDate: ss,
		direction: D(["MONEY_IN", "MONEY_OUT"]),
		offsetAccountId: ss
	}).strict() : a({
		...t,
		fromBankAccountId: ss,
		toBankAccountId: ss,
		transferDate: ss
	}).strict()).parse(JSON.parse(e.fingerprint));
	return {
		...n,
		amount: ms(n.amount),
		description: n.description.trim(),
		reference: n.reference?.trim() || void 0
	};
}
function bs(e) {
	let t = A.list(), n = t.find((t) => t.operationId === e), r = {
		operationId: e,
		resultId: n?.resultId,
		evidenceDigest: _s(),
		eligible: !1,
		blockers: [],
		changes: []
	}, i = (e) => (r.blockers.push(e), { public: r });
	if (!n || n.state === "COMPLETED") return i("An unresolved operation is required.");
	if (!n.resultId?.trim()) return i("No durable bound result identity. Absence of effects cannot be proved; use validated backup recovery.");
	if (!["BANK_TRANSACTION", "BANK_TRANSFER"].includes(n.kind)) return i("This operation kind has no targeted repair procedure. Existing verified closure or validated backup recovery remains available.");
	if (t.some((e) => e.operationId !== n.operationId && e.resultId === n.resultId)) return i("Another operation claims this result.");
	let a;
	try {
		a = ys(n);
	} catch {
		return i("Saved bank intent is invalid or unreadable.");
	}
	if (a.amount <= 0) return i("Saved bank amount does not round to positive cents.");
	let o = $o.getTransactions(), s = $o.getTransfers(), c = L.getAll(), l = [...o, ...s].filter((e) => e.id === n.resultId), u = c.filter((e) => e.sourceType === n.kind && e.sourceId === n.resultId), d = E();
	if (c.some((e) => e.sourceId === n.resultId && e.sourceType !== n.kind)) return i("A journal with another source kind claims this bound result.");
	let f = k.read();
	if (JSON.stringify(f.transactions) !== JSON.stringify(o) || JSON.stringify(f.transfers) !== JSON.stringify(s) || JSON.stringify(f.journals) !== JSON.stringify(c)) return i("Financial cache and source repositories disagree; restore a consistent snapshot first.");
	if (new Set(c.map((e) => e.id)).size !== c.length || l.length > 1) return i("Duplicate bank or journal identities are ambiguous.");
	if (l.length === 1 && u.length === 2) {
		let o = l[0], s = u.find((e) => e.id === o.journalEntryId), f = u.find((e) => e.id !== o.journalEntryId);
		if (!s || !f || s.status !== "POSTED" || f.status !== "POSTED" || [s, f].some((e) => e.bankDuplicateCorrection || e.reversedJournalEntryId || e.reversalJournalEntryId || e.reversedAt) || !re(s, f)) return i("Duplicate journals must be exact original postings with an unambiguous existing bank-record link.");
		let p = { ...d };
		if (delete p.journals, delete p.financialCache, Object.values(p).some((e) => vs(e, f.id)) || t.some((e) => vs(e, f.id)) || c.some((e) => e.id !== f.id && vs(e, f.id))) return i("The duplicate journal is referenced by matching, clearing or another source.");
		let m = s.journalDate;
		try {
			T(m, "Duplicate financial date"), un(m), wt(m, f.lines.map((e) => e.accountId));
		} catch (e) {
			return i(e.message);
		}
		if (f.lines.some((e) => !I.getAll().find((t) => t.id === e.accountId)?.active) || Ar.getAll().some((e) => f.lines.some((t) => t.accountId === e.glAccountId) && !e.active)) return i("Duplicate correction requires active bank and GL accounts.");
		let h = "duplicate-preview:" + n.operationId, g = (/* @__PURE__ */ new Date()).toISOString();
		if (c.some((e) => e.id === h)) return i("Preview journal identity collision.");
		let _ = {
			id: h,
			journalNumber: "Pending duplicate correction",
			journalDate: m,
			description: "Reversal of " + f.journalNumber + ": " + f.description,
			reference: f.reference,
			sourceType: f.sourceType,
			status: "POSTED",
			lines: f.lines.map((e, t) => ({
				...e,
				id: "duplicate-offset-" + t,
				debit: e.credit,
				credit: e.debit
			})),
			totalDebit: f.totalCredit,
			totalCredit: f.totalDebit,
			createdAt: g,
			updatedAt: g,
			postedAt: g,
			reversedJournalEntryId: f.id
		}, v = {
			...f,
			status: "REVERSED",
			reversalJournalEntryId: h,
			reversedAt: g,
			updatedAt: g,
			reversalReason: "Proposed duplicate correction",
			bankDuplicateCorrection: {
				canonicalJournalId: s.id,
				operationId: n.operationId
			}
		}, ee = { journals: [_, ...c.map((e) => e.id === f.id ? v : e)] }, te = os(e, ee, !1), ne = is(ee);
		return oe(ee.journals).invalid.length || te.length || ne.length ? i("Exact duplicate correction cannot prove an isolated repair: " + [...te, ...ne.map((e) => e.code)].join(" ")) : (r.action = "REVERSE_BANK_DUPLICATE", r.journalDate = m, r.amount = a.amount, r.existingJournalId = s.id, r.duplicateJournalId = f.id, r.eligible = !0, r.changes = [
			"Independent bank evidence must confirm one intended transaction; a second real external payment is not a local duplicate repair.",
			"Preserve bank-record link to " + s.id + " and all original journal lines.",
			"Mark only duplicate " + f.id + " as REVERSED and post its exact opposite on " + m + ".",
			"Retain both sides visibly in GL and bank registers; their net cash effect is zero. They cannot be matched or cleared as external cash.",
			"Keep the independently approved plan, duplicate/canonical identities and verification digests in the operation audit."
		], { public: r });
	}
	if (new Set(c.map((e) => e.id)).size !== c.length || l.length > 1 || u.length > 1) return i("Duplicate bank or journal evidence requires separate reviewed recovery. No duplicate is deleted or silently selected.");
	let p = "transactionDate" in a ? a.transactionDate : a.transferDate;
	try {
		T(p, "Bank intent date");
	} catch {
		return i("Saved bank intent date is invalid.");
	}
	if (r.journalDate = p, r.amount = a.amount, !l.length && !u.length) {
		if (Object.entries(d).some(([e, t]) => e !== "financialCache" && vs(t, n.resultId))) return i("Other business records still reference the bound result.");
		let e = is();
		return e.length ? i("Other financial inconsistencies remain: " + e.map((e) => e.code).join(", ")) : (r.action = "CANCEL_NO_EFFECT", r.eligible = !0, r.changes = [
			"Retire this operation as CANCELLED_NO_EFFECT while preserving its original bound identity and full audit history.",
			"No business record, stock movement or GL entry is created, changed or reversed.",
			"The original operation ID can never be replayed. A genuinely new transaction requires a new ID after all write blockers are resolved."
		], { public: r });
	}
	let m = "REC-" + n.resultId, h, g = {
		id: n.resultId,
		amount: a.amount,
		description: a.description,
		reference: a.reference,
		journalEntryId: u[0]?.id ?? l[0]?.journalEntryId ?? "",
		createdAt: u[0]?.createdAt ?? l[0]?.createdAt ?? n.createdAt
	};
	if (h = "transactionDate" in a ? {
		...g,
		transactionNumber: m,
		bankAccountId: a.bankAccountId,
		transactionDate: a.transactionDate,
		direction: a.direction,
		offsetAccountId: a.offsetAccountId
	} : {
		...g,
		transferNumber: m,
		fromBankAccountId: a.fromBankAccountId,
		toBankAccountId: a.toBankAccountId,
		transferDate: a.transferDate
	}, !l.length && u.length === 1) {
		let t = { ...d };
		if (delete t.journals, delete t.financialCache, Object.values(t).some((e) => vs(e, n.resultId))) return i("Another repository references the missing bank result.");
		if ([...o.map((e) => e.transactionNumber), ...s.map((e) => e.transferNumber)].includes(m)) return i("Recovered business number is already in use.");
		let a = "transactionNumber" in h ? { transactions: [h, ...o] } : { transfers: [h, ...s] }, c = os(e, a, !1), l = is(a);
		return c.length || l.length ? i("Existing GL cannot prove the exact intended bank result: " + [...c, ...l.map((e) => e.code)].join(" ")) : (r.action = "RESTORE_BANK_RECORD", r.existingJournalId = u[0].id, r.businessNumber = m, r.eligible = !0, r.changes = ["Restore only the missing bank register record from the saved intent and the uniquely verified existing source journal.", "Keep the existing GL journal, financial date, amounts, accounts and reconciliation/match records unchanged."], {
			public: r,
			record: h
		});
	}
	if (l.length === 1 && u.length === 1 && l[0].journalEntryId !== u[0].id) {
		let t = l[0], a = u[0];
		if (n.kind === "BANK_TRANSACTION" != "transactionNumber" in t) return i("Bound result belongs to a different bank operation kind.");
		if (!t.journalEntryId?.trim()) return i("Previous journal identity is missing; validated backup recovery is required.");
		if (!c.some((e) => e.id === t.journalEntryId)) {
			let e = { ...d };
			if (delete e.bankTransactions, delete e.financialCache, Object.values(e).some((e) => vs(e, t.journalEntryId))) return i("The stale missing journal is still referenced by another repository.");
		}
		let f = {
			...t,
			journalEntryId: a.id
		}, p = "transactionNumber" in f ? { transactions: o.map((e) => e.id === f.id ? f : e) } : { transfers: s.map((e) => e.id === f.id ? f : e) }, m = os(e, p, !1), h = is(p);
		return m.length || h.length ? i("A unique existing journal cannot prove an isolated link repair: " + [...m, ...h.map((e) => e.code)].join(" ")) : (r.action = "RESTORE_BANK_JOURNAL_LINK", r.previousJournalId = t.journalEntryId, r.existingJournalId = a.id, r.eligible = !0, r.changes = [
			"Change only this bank record journal link from " + t.journalEntryId + " to " + a.id + ".",
			"Preserve every GL journal, original financial date, account, amount, bank balance and reconciliation/match record.",
			"Retain the previous link, the independently approved plan and verification digests in the operation audit."
		], { public: r });
	}
	if (l.length === 1 && !u.length) {
		let t = l[0];
		if (n.kind === "BANK_TRANSACTION" != "transactionNumber" in t) return i("Bound result belongs to a different bank operation kind.");
		if (!t.journalEntryId || c.some((e) => e.id === t.journalEntryId)) return i("Linked journal exists with a conflicting source.");
		let u = { ...d };
		if (delete u.bankTransactions, delete u.financialCache, Object.values(u).some((e) => vs(e, t.journalEntryId))) return i("Missing journal is referenced by clearing, matching or another repository.");
		let f = "bankAccountId" in h ? Ar.getById(h.bankAccountId) : void 0, m = "fromBankAccountId" in h ? Ar.getById(h.fromBankAccountId) : void 0, g = "toBankAccountId" in h ? Ar.getById(h.toBankAccountId) : void 0, _ = "direction" in h ? h.direction === "MONEY_IN" ? f?.glAccountId : h.offsetAccountId : g?.glAccountId, v = "direction" in h ? h.direction === "MONEY_IN" ? h.offsetAccountId : f?.glAccountId : m?.glAccountId;
		if (!_ || !v) return i("Bank GL mapping is missing.");
		try {
			un(p), wt(p, [_, v]);
		} catch (e) {
			return i(e.message);
		}
		if ([
			f,
			m,
			g
		].filter(Boolean).some((e) => !e.active) || [_, v].some((e) => !I.getAll().find((t) => t.id === e)?.active)) return i("Missing-journal repair requires currently active bank and GL accounts.");
		let ee = {
			journalDate: p,
			description: a.description,
			reference: a.reference,
			sourceType: n.kind,
			sourceId: n.resultId,
			lines: [{
				accountId: _,
				debit: a.amount,
				credit: 0
			}, {
				accountId: v,
				debit: 0,
				credit: a.amount
			}]
		}, te = "repair-preview:" + n.operationId;
		if (c.some((e) => e.id === te)) return i("Preview journal identity collision.");
		let ne = {
			id: te,
			journalNumber: "Pending repair approval",
			journalDate: p,
			description: a.description,
			reference: a.reference,
			sourceType: ee.sourceType,
			sourceId: n.resultId,
			status: "POSTED",
			lines: ee.lines.map((e, t) => {
				let n = I.requireById(e.accountId);
				return {
					...e,
					id: "preview-" + t,
					accountCode: n.code,
					accountName: n.name
				};
			}),
			totalDebit: a.amount,
			totalCredit: a.amount,
			createdAt: n.createdAt,
			updatedAt: n.createdAt,
			postedAt: n.createdAt
		}, re = {
			...t,
			journalEntryId: te
		}, y = "transactionNumber" in re ? {
			transactions: o.map((e) => e.id === re.id ? re : e),
			journals: [ne, ...c]
		} : {
			transfers: s.map((e) => e.id === re.id ? re : e),
			journals: [ne, ...c]
		}, b = os(e, y, !1), x = is(y);
		return b.length || x.length ? i("Business record and saved intent cannot prove an isolated missing-journal repair: " + [...b, ...x.map((e) => e.code)].join(" ")) : (r.action = "RESTORE_BANK_JOURNAL", r.previousJournalId = t.journalEntryId, r.debitAccountId = _, r.creditAccountId = v, r.eligible = !0, r.changes = [
			"Post one source-owned GL journal on the original financial date and relink this bank record to the new journal.",
			"Debit " + _ + " " + a.amount.toFixed(2) + "; credit " + v + " " + a.amount.toFixed(2) + ".",
			"No payment is sent and no other journal is altered. The missing previous journal identity stays in the saved repair plan."
		], {
			public: r,
			draft: ee,
			projectedJournal: ne
		});
	}
	return i("Existing business and GL effects must use verified closure, or remain blocked if their evidence conflicts.");
}
function xs(e) {
	return j.require("audit.read"), bs(ds.parse(e).operationId).public;
}
function Ss(e) {
	let t = j.require("accounting.recover"), n = fs.parse(e), r = bs(n.operationId).public;
	if (!r.eligible || !r.action) throw Error("Targeted repair blocked: " + r.blockers.join(" "));
	if (r.evidenceDigest !== n.expectedDigest) throw Error("Repair evidence changed. Refresh the preview.");
	let i = crypto.randomUUID();
	A.recordManualReview(n.operationId, n.reference, t.userId, n.summary + " · Proposed " + r.action + " · " + i);
	let a = bs(n.operationId).public;
	if (!a.eligible || a.action !== r.action) throw Error("Repair conditions changed during proposal.");
	return A.attachRepairProposal(n.operationId, {
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
function Cs(e) {
	let t = j.require("accounting.recover"), n = ps.parse(e), r = A.list().find((e) => e.operationId === n.operationId), i = r?.repairProposal;
	if (!r || !i || i.id !== n.proposalId || i.evidenceDigest !== n.expectedDigest) throw Error("Repair proposal changed. Refresh the preview.");
	if (i.status === "EXECUTED") {
		if (i.approver !== t.userId || i.approvalReference !== n.approvalReference) throw Error("Repair was already executed with a different approval.");
		return structuredClone(r);
	}
	if (r.state !== "MANUAL_REVIEW" || i.reviewer === t.userId || r.reviewHistory?.some((e) => e.operator === t.userId)) throw Error("Repair approval requires a different authorized operator.");
	if (r.reviewHistory?.some((e) => e.reference === n.approvalReference)) throw Error("Approval reference must differ from review evidence.");
	let a = bs(n.operationId), o = a.public;
	if (!o.eligible || o.action !== i.action || o.evidenceDigest !== i.evidenceDigest) throw Error("Repair evidence changed or is no longer eligible. Refresh and propose again.");
	let s = () => {
		let e = o.existingJournalId;
		if (o.action === "RESTORE_BANK_RECORD") ns(a.record);
		else if (o.action === "RESTORE_BANK_JOURNAL_LINK") rs(r.resultId, o.previousJournalId, o.existingJournalId);
		else if (o.action === "REVERSE_BANK_DUPLICATE") j.require("banking.write"), j.require("accounting.post"), e = jn(o.duplicateJournalId, o.existingJournalId, r.operationId, "Approved duplicate correction " + i.id + "; " + n.approvalReference).id;
		else if (o.action === "RESTORE_BANK_JOURNAL") {
			j.require("banking.write"), j.require("accounting.post");
			let t = L.post(a.draft);
			e = t.id, rs(r.resultId, o.previousJournalId, t.id);
		}
		let s = is();
		if (s.length) throw Error("Post-repair consistency checks failed: " + s.map((e) => e.code).join(", "));
		if (o.action !== "CANCEL_NO_EFFECT") {
			let e = os(n.operationId);
			if (e.length) throw Error("Post-repair source proof failed: " + e.join(" "));
		} else if (bs(n.operationId).public.action !== "CANCEL_NO_EFFECT") throw Error("No-effect evidence changed before cancellation.");
		return A.finishRepair(n.operationId, i.id, t.userId, n.approvalReference, gs(E()), e);
	};
	return o.action === "CANCEL_NO_EFFECT" ? s() : k.transaction(s);
}
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var ws = /* @__PURE__ */ xe(((e) => {
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
	function ee(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	ee.prototype.isReactComponent = {}, ee.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, ee.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function te() {}
	te.prototype = ee.prototype;
	function ne(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var re = ne.prototype = new te();
	re.constructor = ne, _(re, ee.prototype), re.isPureReactComponent = !0;
	var y = Array.isArray;
	function b() {}
	var x = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ie = Object.prototype.hasOwnProperty;
	function ae(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function S(e, t) {
		return ae(e.type, t, e.props);
	}
	function oe(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function se(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var ce = /\/+/g;
	function le(e, t) {
		return typeof e == "object" && e && e.key != null ? se("" + e.key) : t.toString(36);
	}
	function ue(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(b, b) : (e.status = "pending", e.then(function(t) {
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
	function C(e, r, i, a, o) {
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
				case d: return c = e._init, C(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + le(e, 0) : a, y(o) ? (i = "", c != null && (i = c.replace(ce, "$&/") + "/"), C(o, r, i, "", function(e) {
			return e;
		})) : o != null && (oe(o) && (o = S(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ce, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (y(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + le(a, u), c += C(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + le(a, u++), c += C(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return C(ue(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function de(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return C(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function fe(e) {
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
	var pe = typeof reportError == "function" ? reportError : function(e) {
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
	function w(e) {
		var t = x.T, n = {};
		n.types = t === null ? null : t.types, x.T = n;
		try {
			var r = e(), i = x.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(b, pe);
		} catch (e) {
			pe(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), x.T = t;
		}
	}
	function T(e) {
		var t = x.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else w(T.bind(null, e));
	}
	var me = {
		map: de,
		forEach: function(e, t, n) {
			de(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return de(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return de(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!oe(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = me, e.Component = ee, e.Fragment = r, e.Profiler = a, e.PureComponent = ne, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = x, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return x.H.useMemoCache(e);
		}
	}, e.addTransitionType = T, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ie.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return ae(e.type, i, r);
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
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ie.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return ae(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = oe, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: fe
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = w, e.unstable_useCacheRefresh = function() {
		return x.H.useCacheRefresh();
	}, e.use = function(e) {
		return x.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return x.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return x.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return x.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return x.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return x.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return x.H.useEffectEvent(e);
	}, e.useId = function() {
		return x.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return x.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return x.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return x.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return x.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return x.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return x.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return x.H.useRef(e);
	}, e.useState = function(e) {
		return x.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return x.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return x.H.useTransition();
	}, e.version = "19.3.0";
})), Ts = /* @__PURE__ */ xe(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = Ce && e[Ce] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			we[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), we[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = De, this.updater = n || Te;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = De, this.updater = n || Te;
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
			if (typeof e == "function") return e.$$typeof === Ae ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case T: return "Fragment";
				case he: return "Profiler";
				case me: return "StrictMode";
				case E: return "Suspense";
				case ye: return "SuspenseList";
				case xe: return "Activity";
				case Se: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case w: return "Portal";
				case _e: return e.displayName || "Context";
				case ge: return (e._context.displayName || "Context") + ".Consumer";
				case ve:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case D: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case be:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === T) return "<>";
			if (typeof e == "object" && e && e.$$typeof === be) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = O.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (je.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function g(e, t) {
			function n() {
				Ne || (Ne = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function _() {
			var e = d(this.type);
			return Fe[e] || (Fe[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function v(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: pe,
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
		function ee(e, t) {
			return t = v(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function te(e) {
			ne(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === be && (e._payload.status === "fulfilled" ? ne(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function ne(e) {
			return typeof e == "object" && !!e && e.$$typeof === pe;
		}
		function re(e) {
			var t = {
				"=": "=0",
				":": "=2"
			};
			return "$" + e.replace(/[=:]/g, function(e) {
				return t[e];
			});
		}
		function y(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), re("" + e.key)) : t.toString(36);
		}
		function b(e) {
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
		function x(e, t, n, i, a) {
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
					case pe:
					case w:
						s = !0;
						break;
					case be: return s = e._init, x(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + y(s, 0) : i;
				return ke(a) ? (n = "", c != null && (n = c.replace(ze, "$&/") + "/"), x(a, t, n, "", function(e) {
					return e;
				})) : a != null && (ne(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = ee(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(ze, "$&/") + "/") + c), i !== "" && s != null && ne(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", ke(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + y(i, l), s += x(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (Re || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Re = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + y(i, l++), s += x(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return x(b(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function ie(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return x(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function ae(e) {
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
		function S() {
			var e = O.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function oe() {
			O.asyncTransitions--;
		}
		function se(e) {
			var t = O.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), O.T = n;
			try {
				var r = e(), i = O.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (O.asyncTransitions++, r.then(oe, oe), r.then(c, Be));
			} catch (e) {
				Be(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), O.T = t;
			}
		}
		function ce(e) {
			var t = O.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else O.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), se(ce.bind(null, e));
		}
		function le(e) {
			if (Ve === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				Ve = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				Ve = function(e) {
					!1 === k && (k = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return Ve(e);
		}
		function ue(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function C(e, t) {
			t !== He - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), He = t;
		}
		function de(e, t, n) {
			var r = O.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					fe(r), le(function() {
						return de(e, t, n);
					});
					return;
				} catch (e) {
					O.thrownErrors.push(e);
				}
				else O.actQueue = null;
			}
			0 < O.thrownErrors.length ? (r = ue(O.thrownErrors), O.thrownErrors.length = 0, n(r)) : t(e);
		}
		function fe(e) {
			if (!We) {
				We = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							O.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (O.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), O.thrownErrors.push(n);
				} finally {
					We = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var pe = Symbol.for("react.transitional.element"), w = Symbol.for("react.portal"), T = Symbol.for("react.fragment"), me = Symbol.for("react.strict_mode"), he = Symbol.for("react.profiler"), ge = Symbol.for("react.consumer"), _e = Symbol.for("react.context"), ve = Symbol.for("react.forward_ref"), E = Symbol.for("react.suspense"), ye = Symbol.for("react.suspense_list"), D = Symbol.for("react.memo"), be = Symbol.for("react.lazy"), xe = Symbol.for("react.activity"), Se = Symbol.for("react.view_transition"), Ce = Symbol.iterator, we = {}, Te = {
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
		}, Ee = Object.assign, De = {};
		Object.freeze(De), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var Oe = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (Ge in Oe) Oe.hasOwnProperty(Ge) && n(Ge, Oe[Ge]);
		o.prototype = a.prototype, Oe = s.prototype = new o(), Oe.constructor = s, Ee(Oe, a.prototype), Oe.isPureReactComponent = !0;
		var ke = Array.isArray, Ae = Symbol.for("react.client.reference"), O = {
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
		}, je = Object.prototype.hasOwnProperty, Me = console.createTask ? console.createTask : function() {
			return null;
		};
		Oe = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Ne, Pe, Fe = {}, Ie = Oe.react_stack_bottom_frame.bind(Oe, m)(), Le = Me(f(m)), Re = !1, ze = /\/+/g, Be = typeof reportError == "function" ? reportError : function(e) {
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
		}, k = !1, Ve = null, He = 0, Ue = !1, We = !1, A = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : le;
		Oe = Object.freeze({
			__proto__: null,
			c: function(e) {
				return S().useMemoCache(e);
			}
		});
		var Ge = {
			map: ie,
			forEach: function(e, t, n) {
				ie(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return ie(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return ie(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!ne(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = xe, e.Children = Ge, e.Component = a, e.Fragment = T, e.Profiler = he, e.PureComponent = s, e.StrictMode = me, e.Suspense = E, e.ViewTransition = Se, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = O, e.__COMPILER_RUNTIME = Oe, e.act = function(e) {
			var t = O.actQueue, n = He;
			He++;
			var r = O.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				O.thrownErrors.push(e);
			}
			if (0 < O.thrownErrors.length) throw C(t, n), e = ue(O.thrownErrors), O.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return A(function() {
					i || Ue || (Ue = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (C(t, n), n === 0) {
							try {
								fe(r), le(function() {
									return de(i, e, a);
								});
							} catch (e) {
								O.thrownErrors.push(e);
							}
							if (0 < O.thrownErrors.length) {
								var o = ue(O.thrownErrors);
								O.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						C(t, n), 0 < O.thrownErrors.length ? (e = ue(O.thrownErrors), O.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (C(t, n), n === 0 && (fe(r), r.length !== 0 && A(function() {
				i || Ue || (Ue = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), O.actQueue = null), 0 < O.thrownErrors.length) throw e = ue(O.thrownErrors), O.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (O.actQueue = r, le(function() {
					return de(s, e, t);
				})) : e(s);
			} };
		}, e.addTransitionType = ce, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = O.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = Ee({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (je.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !je.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = v(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) te(arguments[i]);
			return r;
		}, e.createContext = function(e) {
			return e = {
				$$typeof: _e,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: ge,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) te(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in Pe || !("__self" in t) || "key" in t || (Pe = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) je.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && g(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > O.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Ie, v(e, a, r, p(), o, i ? Me(f(e)) : Le);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === D ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: ve,
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
		}, e.isValidElement = ne, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: be,
				_payload: e,
				_init: ae
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
				$$typeof: D,
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
		}, e.startTransition = se, e.unstable_useCacheRefresh = function() {
			return S().useCacheRefresh();
		}, e.use = function(e) {
			return S().use(e);
		}, e.useActionState = function(e, t, n) {
			return S().useActionState(e, t, n);
		}, e.useCallback = function(e, t) {
			return S().useCallback(e, t);
		}, e.useContext = function(e) {
			var t = S();
			return e.$$typeof === ge && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
		}, e.useDebugValue = function(e, t) {
			return S().useDebugValue(e, t);
		}, e.useDeferredValue = function(e, t) {
			return S().useDeferredValue(e, t);
		}, e.useEffect = function(e, t) {
			return e ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"), S().useEffect(e, t);
		}, e.useEffectEvent = function(e) {
			return S().useEffectEvent(e);
		}, e.useId = function() {
			return S().useId();
		}, e.useImperativeHandle = function(e, t, n) {
			return S().useImperativeHandle(e, t, n);
		}, e.useInsertionEffect = function(e, t) {
			return e ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"), S().useInsertionEffect(e, t);
		}, e.useLayoutEffect = function(e, t) {
			return e ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"), S().useLayoutEffect(e, t);
		}, e.useMemo = function(e, t) {
			return S().useMemo(e, t);
		}, e.useOptimistic = function(e, t) {
			return S().useOptimistic(e, t);
		}, e.useReducer = function(e, t, n) {
			return S().useReducer(e, t, n);
		}, e.useRef = function(e) {
			return S().useRef(e);
		}, e.useState = function(e) {
			return S().useState(e);
		}, e.useSyncExternalStore = function(e, t, n) {
			return S().useSyncExternalStore(e, t, n);
		}, e.useTransition = function() {
			return S().useTransition();
		}, e.version = "19.3.0", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
}));
(/* @__PURE__ */ xe(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? ws() : Ts();
})))();
var Es = w().min(1).max(200), Ds = w().max(2e4), Os = v().finite().nonnegative(), ks = ["PURCHASE_ORDER", "REMITTANCE"], As = a({
	operationId: Es,
	kind: D(ks),
	sourceId: Es,
	expectedRevision: w().min(1).max(5e5),
	templateId: Es.optional()
}).strict(), js = a({
	id: Es,
	description: Ds,
	reference: Ds,
	quantity: v().finite().positive(),
	unit: Ds,
	unitPrice: Os,
	net: Os,
	tax: Os,
	total: Os,
	taxCode: Ds.optional(),
	taxRate: v().finite().min(0).max(1).optional()
}).strict(), Ms = a({
	id: Es,
	revision: Es,
	name: Ds,
	subject: Ds,
	body: Ds,
	footer: Ds,
	paper: D(["A4", "Letter"])
}).strict(), Ns = a({
	id: Es,
	operationId: Es,
	requestFingerprint: w().max(1e6),
	kind: D(ks),
	sourceId: Es,
	sourceRevision: w().min(1).max(5e5),
	preparedAt: Es,
	preparedBy: Es,
	documentNumber: Es,
	status: Es,
	date: Es,
	expectedDeliveryDate: Ds.optional(),
	reference: Ds.optional(),
	notes: Ds.optional(),
	supplierId: Es,
	supplierName: Ds,
	supplierCode: Ds,
	supplierEmail: Ds.optional(),
	supplierContact: Ds.optional(),
	supplierAddress: Ds,
	supplierMetadataAt: Es,
	issuer: a({
		name: Ds,
		identifier: Ds,
		address: Ds,
		email: Ds,
		currency: Es
	}).strict(),
	method: Ds.optional(),
	noncash: _(),
	lines: n(js).min(1),
	subtotal: Os,
	tax: Os,
	total: Os,
	template: Ms,
	subject: Ds,
	body: Ds
}).strict(), Ps = (e) => e === "PURCHASE_ORDER" ? "Purchase order" : "Remittance";
function Fs(e, t) {
	let n = e === "PURCHASE_ORDER" ? Bi.getById(t) : _o.getById(t);
	if (!n) throw Error("Purchase output source was not found.");
	return n;
}
function Is(e, t) {
	let n = Fs(e, t), r = Di.getById(n.supplierId);
	if (!r) throw Error("Source supplier was not found.");
	return JSON.stringify([n, r]);
}
var Ls = (e, t) => i(e, "accounting.read") || t === "PURCHASE_ORDER" && i(e, "purchases.write"), Rs = [], zs = 0, Bs = /* @__PURE__ */ new Set(), Vs = () => {
	zs++, Bs.forEach((e) => e());
};
function Hs() {
	return (fe.templates ?? []).filter((e) => e.status === "Active" && ["Purchase order", "Remittance"].includes(e.kind));
}
function Us(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Object.hasOwn(t, n)) throw Error("Unsupported purchase template token: " + n);
		return t[n];
	});
}
function Ws(e) {
	let t = Ns.parse(e), n = As.parse(JSON.parse(t.requestFingerprint));
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
b("preparedPurchaseOutputs", {
	repository: { prepare(e) {
		let t = As.parse(e), n = j.require("purchases.read");
		if (!Ls(n, t.kind) || t.kind === "REMITTANCE" && !i(n, "accounting.post") || t.kind === "PURCHASE_ORDER" && !i(n, "accounting.post") && !i(n, "purchases.write")) throw Error("Permission denied: purchase document preparation.");
		let r = JSON.stringify(t), a = Rs.find((e) => e.operationId === t.operationId);
		if (a) {
			if (a.requestFingerprint !== r) throw Error("Operation ID was used for different output data.");
			return a;
		}
		let o = Fs(t.kind, t.sourceId), s = Di.getById(o.supplierId);
		if (Is(t.kind, t.sourceId) !== t.expectedRevision) throw Error("Source or supplier changed. Refresh before preparing output.");
		let c = y(), l = t.templateId ? Hs().find((e) => e.id === t.templateId && e.kind === Ps(t.kind)) : void 0;
		if (t.templateId && !l) throw Error("Select an active matching purchase template.");
		let u = t.kind === "PURCHASE_ORDER" ? Bi.getById(t.sourceId) : void 0, d = t.kind === "REMITTANCE" ? _o.getById(t.sourceId) : void 0, f = u ? u.lines.map((e) => ({
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
			supplierName: o.supplierName,
			companyName: c.companyName,
			currency: c.currency,
			total: p.toFixed(2),
			documentDate: u?.orderDate ?? d.paymentDate,
			expectedDeliveryDate: u?.expectedDeliveryDate ?? "",
			reference: u?.supplierReference ?? d?.reference ?? ""
		}, h = {
			id: l?.id ?? "built-in",
			revision: l?.revision ?? "1",
			name: l?.name ?? "Standard " + Ps(t.kind),
			subject: l?.subject ?? "{{documentNumber}} · {{companyName}}",
			body: l?.body ?? "Dear {{supplierName}},\nPlease review {{documentNumber}} for {{currency}} {{total}}.",
			footer: l?.footer ?? "",
			paper: l?.paper === "Letter" ? "Letter" : "A4"
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
			status: o.status,
			date: m.documentDate,
			expectedDeliveryDate: u?.expectedDeliveryDate,
			reference: m.reference,
			notes: o.notes,
			supplierId: s.id,
			supplierName: o.supplierName,
			supplierCode: o.supplierCode,
			supplierEmail: s.email,
			supplierContact: s.contactName,
			supplierAddress: [
				s.addressLine1,
				s.addressLine2,
				s.suburb,
				s.state,
				s.postcode,
				s.country
			].filter(Boolean).join(", "),
			supplierMetadataAt: s.updatedAt,
			issuer: {
				name: c.companyName,
				identifier: c.identifier ?? "",
				address: c.address ?? "",
				email: c.email ?? "",
				currency: c.currency
			},
			method: d?.method,
			noncash: !!d?.prepaymentApplicationId,
			lines: f,
			subtotal: u?.totals.subtotal ?? p,
			tax: u?.totals.taxAmount ?? 0,
			total: p,
			template: {
				...h,
				footer: Us(h.footer, m)
			},
			subject: Us(h.subject, m),
			body: Us(h.body, m)
		};
		return Ws(g), Rs = [g, ...Rs], Vs(), g;
	} },
	read: "purchases.read",
	commands: { prepare: "purchases.read" },
	snapshot: () => ({
		artifacts: Rs,
		templates: Hs().map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	restore: (e) => {
		Rs = e.artifacts, e.templates;
	},
	publish: Vs,
	view: (e) => ({
		artifacts: Rs.filter((t) => Ls(e, t.kind)),
		templates: Hs().filter((t) => Ls(e, t.kind === "Purchase order" ? "PURCHASE_ORDER" : "REMITTANCE")).map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	validate: (e, t) => {
		let r = a({
			artifacts: n(Ns),
			templates: n(a({
				id: Es,
				name: Ds,
				kind: Es
			}).strict())
		}).strict().parse(e).artifacts, i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), s = t;
		for (let e of r) {
			if (Ws(e), o.has(e.id) || i.has(e.operationId)) throw Error("Duplicate purchase output.");
			o.add(e.id), i.add(e.operationId);
			let t = (e.kind === "PURCHASE_ORDER" ? s.purchaseOrders.purchaseOrders : s.supplierPayments.supplierPayments).find((t) => t.id === e.sourceId);
			if (!t || t.supplierId !== e.supplierId) throw Error("Invalid purchase output source reference.");
		}
	}
});
//#endregion
//#region src/features/banking/data/bankRegisterService.ts
function Gs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ks(e, t) {
	T(e, t);
}
function qs(e, t, n) {
	Ks(e.openingBalanceDate, "Opening balance date"), Ks(n, "As-at date");
	let r = oe(t), i = /* @__PURE__ */ new Set([...r.originals, ...r.offsets]), a = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), o = Gs(e.openingBalance), s = 0, c = 0, l = a.map(({ entry: t, line: n }) => {
		let r = Gs(n.debit), a = Gs(n.credit);
		return s = Gs(s + r), c = Gs(c + a), o = Gs(o + r - a), {
			id: `${t.id}:${n.id}`,
			bankAccountId: e.id,
			correctionOnly: i.has(t.id) || void 0,
			journalEntryId: t.id,
			journalNumber: t.journalNumber,
			transactionDate: t.journalDate,
			description: t.description,
			reference: t.reference,
			sourceType: t.sourceType,
			sourceId: t.sourceId,
			journalStatus: t.status,
			moneyIn: r,
			moneyOut: a,
			runningBalance: o
		};
	});
	return {
		bankAccountId: e.id,
		asOfDate: n,
		openingBalance: Gs(e.openingBalance),
		moneyIn: s,
		moneyOut: c,
		closingBalance: o,
		transactionCount: l.length,
		transactions: l
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function Js(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ys(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) if (!t.correctionOnly) {
		if (r.has(t.id)) {
			i = Js(i + t.moneyIn), a = Js(a + t.moneyOut);
			continue;
		}
		o = Js(o + t.moneyIn), s = Js(s + t.moneyOut);
	}
	let c = Js(Js(t) + o - s), l = Js(e.closingBalance), u = Js(c - l);
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
var Xs = (e) => new Set(e).size === e.length, Zs = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Qs(e, t, n) {
	try {
		T(e.journalDate), T(n);
	} catch {
		return !1;
	}
	if (e.journalDate > n) return !1;
	if (e.status === "POSTED") return !e.reversalJournalEntryId && !e.reversedAt;
	let r = t.filter((t) => t.id === e.reversalJournalEntryId), i = r[0];
	if (e.status !== "REVERSED" || !e.reversedAt || !e.reversalReason?.trim() || e.reversedJournalEntryId || r.length !== 1 || i.status !== "POSTED" || i.reversedJournalEntryId !== e.id || i.reversalJournalEntryId || i.reversedAt || i.journalDate <= n || i.journalDate < e.journalDate || i.totalDebit !== e.totalCredit || i.totalCredit !== e.totalDebit) return !1;
	try {
		T(i.journalDate);
	} catch {
		return !1;
	}
	let a = (e, t = !1) => JSON.stringify(e.lines.map((e) => [
		e.accountId,
		t ? e.credit : e.debit,
		t ? e.debit : e.credit
	]).sort((e, t) => JSON.stringify(e).localeCompare(JSON.stringify(t))));
	return a(e, !0) === a(i) && t.filter((t) => t.reversedJournalEntryId === e.id).length === 1;
}
function $s(e) {
	let { bank: t, journals: n, reconciliations: r, throughDate: i } = e, a = [];
	if (T(i, "Reconciliation proof date"), T(t.openingBalanceDate, "Bank opening date"), !Xs(r.map((e) => e.id)) || !Xs(n.map((e) => e.id)) || !Xs(n.flatMap((e) => e.lines.map((t) => e.id + ":" + t.id)))) return ["Duplicate reconciliation or ledger row identity."];
	for (let e of r.filter((e) => e.bankAccountId === t.id)) try {
		T(e.statementDate);
	} catch {
		return ["Reconciliation statement date is invalid."];
	}
	let o = r.filter((e) => e.bankAccountId === t.id && e.statementDate <= i).sort((e, t) => e.statementDate.localeCompare(t.statementDate)), s = /* @__PURE__ */ new Set(), c = new Map(n.map((e) => [e.id, e])), l = "";
	for (let e of o) {
		try {
			T(e.statementDate, "Statement date");
		} catch {
			return ["Reconciliation statement date is invalid."];
		}
		if (e.status !== "COMPLETED" || e.statementDate <= l || e.statementDate < t.openingBalanceDate || !Number.isFinite(e.statementBalance) || Zs(e.statementBalance) !== e.statementBalance || !Xs(e.clearedTransactionIds)) return ["Reconciliation sequence, status, balance or cleared identities are invalid."];
		let r = qs(t, n, e.statementDate), i = new Map(r.transactions.map((e) => [e.id, e]));
		if (e.clearedTransactionIds.some((t) => {
			let r = i.get(t);
			return s.has(t) || !r || r.correctionOnly || !Qs(c.get(r.journalEntryId), n, e.statementDate);
		})) return ["Cleared rows are missing, reversed, internal offsets or duplicated across statements."];
		e.clearedTransactionIds.forEach((e) => s.add(e));
		let o = Ys(r, e.statementBalance, [...s]);
		(!o.reconciled || [
			"bookBalance",
			"outstandingDeposits",
			"outstandingPayments",
			"adjustedStatementBalance",
			"difference"
		].some((t) => !Number.isFinite(e[t]) || e[t] !== o[t])) && a.push("Saved reconciliation totals do not match the current dated bank ledger: " + e.reconciliationNumber), l = e.statementDate;
	}
	if (!o.length) return a;
	let u = o.at(-1).statementDate, d = qs(t, n, u), f = new Map(d.transactions.map((e) => [e.id, e])), p = /* @__PURE__ */ new Set();
	for (let r of (e.statements ?? []).filter((e) => e.bankAccountId === t.id && e.date <= u)) r.status === "UNMATCHED" && a.push("Imported statement contains an unresolved line."), (r.status === "MATCHED" || r.status === "POSTED") && ((!r.ledgerIds.length || !Xs(r.ledgerIds) || r.ledgerIds.some((e) => {
		let t = f.get(e);
		return !s.has(e) || !t || t.correctionOnly || !Qs(c.get(t.journalEntryId), n, r.date) || p.has(e);
	}) || Zs(r.ledgerIds.reduce((e, t) => e + (f.get(t)?.moneyIn ?? 0) - (f.get(t)?.moneyOut ?? 0), 0)) !== r.amount) && a.push("Imported statement match, amount or clearing is inconsistent."), r.ledgerIds.forEach((e) => p.add(e)));
	return a;
}
//#endregion
//#region src/features/banking/data/bankReconciliationRepository.ts
var ec = /* @__PURE__ */ new Set(), tc = k.read().reconciliations;
k.onRollback(() => {
	tc = k.read().reconciliations;
});
function nc() {
	k.update("reconciliations", tc), ec.forEach((e) => k.notify(e));
}
function rc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ic(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function ac() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function oc(e) {
	return `BREC-${e.slice(0, 4)}-${String(tc.length + 1).padStart(4, "0")}`;
}
function sc(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of tc) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var cc = {
	subscribe(e) {
		return ec.add(e), () => {
			ec.delete(e);
		};
	},
	getSnapshot() {
		return tc;
	},
	getAll() {
		return tc;
	},
	getByBankAccount(e) {
		return tc.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return sc(e);
	},
	complete(e, t) {
		if (ic(e.statementDate), T(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let n = Ar.requireById(e.bankAccountId);
		if (!n.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < n.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let r = L.getAll(), i = new Map(r.map((e) => [e.id, e])), a = $s({
			bank: n,
			journals: r,
			reconciliations: tc,
			throughDate: e.statementDate
		});
		if (a.length) throw Error("Existing bank reconciliation evidence is invalid: " + a.join(" "));
		let o = this.getLatestByBankAccount(n.id);
		if (o && e.statementDate <= o.statementDate) throw Error(`Statement date must be after the last reconciled date ${o.statementDate}.`);
		let s = qs(n, L.getAll(), e.statementDate), c = new Set(s.transactions.filter((t) => !t.correctionOnly && Qs(i.get(t.journalEntryId), r, e.statementDate)).map((e) => e.id)), l = sc(n.id), u = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !l.has(e));
		for (let e of u) if (!c.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let d = /* @__PURE__ */ new Set([...l, ...u]), f = E().bankStatements?.lines.filter((t) => t.bankAccountId === n.id && t.date <= e.statementDate) ?? [];
		if (f.some((e) => e.status === "UNMATCHED")) throw Error("Process every imported statement line before completing reconciliation.");
		let p = new Map(s.transactions.map((e) => [e.id, e]));
		for (let e of f.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (e.ledgerIds.some((t) => !p.has(t) || p.get(t)?.correctionOnly || !Qs(i.get(p.get(t).journalEntryId), r, e.date))) throw Error("Repair stale imported statement matches before completing reconciliation.");
			if (e.ledgerIds.some((e) => !d.has(e))) throw Error("Include every processed imported statement entry in reconciliation.");
		}
		let m = Ys(s, rc(e.statementBalance), Array.from(d));
		if (!m.reconciled) throw Error(`Bank reconciliation is out by ${m.difference.toFixed(2)}.`);
		let h = ac();
		if (t) {
			if (A.begin(t, "BANK_RECONCILIATION", JSON.stringify(e)).status !== "started") throw Error("Bank reconciliation requires manual review before retry.");
			A.bindResult(t, h);
		}
		let g = {
			id: h,
			reconciliationNumber: oc(e.statementDate),
			bankAccountId: n.id,
			statementDate: e.statementDate,
			statementBalance: rc(e.statementBalance),
			bookBalance: m.bookBalance,
			outstandingDeposits: m.outstandingDeposits,
			outstandingPayments: m.outstandingPayments,
			adjustedStatementBalance: m.adjustedStatementBalance,
			difference: m.difference,
			clearedTransactionIds: u,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return tc = [g, ...tc], nc(), g;
	}
}, lc = cc.complete;
cc.complete = function(e, t) {
	let n = t?.trim() ?? `bankrec-operation-${ac()}`;
	if (t !== void 0 && !n) throw Error("Operation ID cannot be empty.");
	if (n) {
		let t = A.list().find((e) => e.operationId === n);
		if (t) {
			if (t.kind !== "BANK_RECONCILIATION" || t.fingerprint !== JSON.stringify(e)) throw Error("Operation ID reused with different business data.");
			let n = tc.find((e) => e.id === t.resultId);
			if (t.state === "COMPLETED" && n && tc.filter((e) => e.id === n.id).length === 1 && n.status === "COMPLETED" && n.bankAccountId === e.bankAccountId && n.statementDate === e.statementDate && n.statementBalance === rc(e.statementBalance)) return n;
			throw Error("Bank reconciliation requires manual review before retry.");
		}
	}
	P();
	try {
		let t = k.transaction(() => lc.call(cc, e, n));
		return n && A.complete(n, t.id), t;
	} catch (e) {
		if (n) {
			let e = A.list().find((e) => e.operationId === n);
			if (e && e.state !== "COMPLETED") try {
				A.flagForReview(n, "Reconciliation outcome uncertain; inspect the saved statement and cleared ledger rows before retry.");
			} catch {}
		}
		throw e;
	}
}, b("bankReconciliations", {
	repository: cc,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: tc }),
	restore: (e) => {
		tc = e.reconciliations;
	},
	publish: () => ec.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/reconciliationRecoveryEvidence.ts
function uc(e) {
	let t = A.list(), n = t.find((t) => t.operationId === e), r = [];
	if (!n || n.kind !== "BANK_RECONCILIATION" || n.state !== "MANUAL_REVIEW") return ["Operation is not an unresolved bank reconciliation review."];
	if (!n.resultId) return ["Operation has no durable bound result; cannot infer clearing."];
	n.reviewHistory?.length || r.push("Operator reconciliation evidence is missing.");
	let i = cc.getAll(), a = i.filter((e) => e.id === n.resultId);
	if (a.length !== 1) return [...r, "Completed reconciliation result is missing or duplicated."];
	let o = a[0], s = Ar.getById(o.bankAccountId), c = L.getAll();
	if (!s) return [...r, "Reconciliation bank account is missing."];
	let l = (e) => JSON.stringify([...e].sort()), u = (e) => Math.round((e + 2 ** -52) * 100) / 100, d = i.filter((e) => e.bankAccountId === s.id && e.statementDate <= o.statementDate), f = E().bankStatements?.lines ?? [];
	try {
		r.push(...$s({
			bank: s,
			journals: c,
			reconciliations: i,
			throughDate: o.statementDate,
			statements: f
		}));
	} catch {
		r.push("Reconciliation chain evidence is invalid.");
	}
	try {
		let e = JSON.parse(n.fingerprint), t = new Set(d.filter((e) => e.id !== o.id).flatMap((e) => e.clearedTransactionIds));
		(!e || e.bankAccountId !== o.bankAccountId || e.statementDate !== o.statementDate || !Number.isFinite(e.statementBalance) || u(e.statementBalance) !== o.statementBalance || !Array.isArray(e.clearedTransactionIds) || e.clearedTransactionIds.some((e) => typeof e != "string") || l([...new Set(e.clearedTransactionIds)].filter((e) => !t.has(e))) !== l(o.clearedTransactionIds)) && r.push("Saved reconciliation intent does not match the bound clearing result.");
	} catch {
		r.push("Saved reconciliation intent is unreadable.");
	}
	return t.some((e) => e.operationId !== n.operationId && e.kind === n.kind && e.resultId === n.resultId) && r.push("Another operation claims this reconciliation result."), r;
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function dc(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= mc(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: hc(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => fc(e, r)), a = hc(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && pc(t, r)), s = hc(o.reduce((e, t) => e + t.amount, 0)), c = hc(e.totals.total), l = hc(Math.max(0, c - a - s));
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
function fc(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < mc(e.reversedAt) : !1;
}
function pc(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < mc(e.reversedAt) : !1;
}
function mc(e) {
	return C(e);
}
function hc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function gc(e, t, n) {
	let r = yc(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= vc(e.voidedAt)) return _c(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && pc(t, n)), a = yc(i.reduce((e, t) => e + t.amount, 0)), o = yc(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function _c(e, t, n) {
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
function vc(e) {
	return C(e);
}
function yc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function bc(e, t, n = [], r = [], i = [], a = Cc()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = dc(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = xc(e.dueDate, a);
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
		current: wc(s.current),
		days1To30: wc(s.days1To30),
		days31To60: wc(s.days31To60),
		days61To90: wc(s.days61To90),
		days90Plus: wc(s.days90Plus)
	}, p = wc(c), m = wc(l), h = wc(i.reduce((t, n) => n.customerId === e.id ? t + gc(n, r, a).amountAvailable : t, 0)), g = wc(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: g,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: wc(Math.max(0, e.creditLimit - Math.max(0, g))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function xc(e, t = Cc()) {
	let n = Sc(e), r = Sc(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Sc(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function Cc() {
	return C((/* @__PURE__ */ new Date()).toISOString());
}
function wc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function Tc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ec(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function Dc(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? Tc(t - n) : Tc(n - t);
}
function Oc(e, t, n) {
	Ec(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = Tc(t + r.debit), n = Tc(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: Dc(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = Tc(r.reduce((e, t) => e + t.totalDebit, 0)), o = Tc(r.reduce((e, t) => e + t.totalCredit, 0));
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
function kc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ac({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = bc(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: kc(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = kc(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = kc(Oc(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = kc(l - d);
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
var jc = (e) => Math.round(e * 100);
function Mc(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + jc(t.amount), 0), s = a.reduce((e, t) => e + jc(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (jc(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), jc(t.amountDue) !== Math.max(0, jc(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > jc(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + jc(t.amount), 0);
		jc(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || jc(t.amountAvailable) !== 0 : jc(t.amountAvailable) !== jc(t.totals.total) - a - jc(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var Nc = {
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
function Pc(e) {
	return Mc(e).map((e) => ({
		...e,
		action: Nc[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var Fc = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Ic(e, t) {
	let n = Pc(e).map((e) => ({ ...e })), r = t.filter((e) => Fc.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => Fc.has(e.kind))) s.has(e.operationId) && n.push({
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
function Lc() {
	let e = z.getAll();
	return Ic({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ir.getAll(),
		creditNotes: R.getAll(),
		allocations: R.getAllAllocations(),
		journals: L.getAll()
	}, A.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
function Rc(e) {
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
var zc = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Bc(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!zc.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = Ic(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function Vc() {
	let e = z.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ir.getAll(),
		creditNotes: R.getAll(),
		allocations: R.getAllAllocations(),
		journals: L.getAll()
	};
}
function Hc(e) {
	let t = [], n = Vc(), r = A.list().find((t) => t.operationId === e), i = n.payments.find((e) => e.id === r?.resultId), a = (e) => Math.round(e * 100), o = (e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e) t.set(n.accountId, (t.get(n.accountId) ?? 0) + a(n.debit) - a(n.credit));
		return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
	};
	if (i && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(r.kind)) {
		let e = n.journals.find((e) => e.sourceType === "CUSTOMER_PAYMENT" && e.sourceId === i.id && !e.reversedJournalEntryId), r = I.getAll().find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE"), o = Ar.getById(i.bankAccountId)?.glAccountId;
		if (i.depositApplicationId) {
			let e = E().customerDeposits, t = e.applications.find((e) => e.id === i.depositApplicationId && e.paymentId === i.id);
			o = t ? e.deposits.find((e) => e.id === t.depositId)?.liabilityAccountId : void 0;
		}
		(!e || !r || !o || e.lines.length !== 2 || !e.lines.some((e) => e.accountId === o && a(e.debit) === a(i.amount) && a(e.credit) === 0) || !e.lines.some((e) => e.accountId === r.id && a(e.credit) === a(i.amount) && a(e.debit) === 0)) && t.push("Payment journal bank/deposit and receivables accounts do not match the bound payment.");
	}
	let s = n.journals.filter((e) => !e.reversedJournalEntryId && e.sourceId === r?.resultId && (r?.kind === "SALES_INVOICE_VOID" && e.sourceType === "CUSTOMER_INVOICE" || r?.kind === "SALES_PAYMENT_REVERSAL" && e.sourceType === "CUSTOMER_PAYMENT"));
	for (let e of s) {
		let r = n.journals.find((t) => t.id === e.reversalJournalEntryId);
		(!r || o(r.lines) !== o(e.lines.map((e) => ({
			...e,
			debit: e.credit,
			credit: e.debit
		})))) && t.push("Reversal journal accounts do not exactly reverse the original.");
	}
	try {
		let e = [
			...n.journals.map((e) => e.journalDate),
			...n.invoices.map((e) => e.documentDate),
			...n.creditNotes.map((e) => e.creditDate),
			...n.payments.map((e) => e.paymentDate)
		].sort().at(-1) ?? "1970-01-01", r = Ac({
			accounts: I.getAll(),
			journalEntries: [...n.journals],
			asOfDate: e,
			customers: M.getAll(),
			documents: [
				...n.quotes,
				...n.salesOrders,
				...n.invoices
			],
			payments: [...n.payments],
			creditNotes: [...n.creditNotes],
			creditAllocations: [...n.allocations]
		});
		(!r.reconciled || !Number.isFinite(r.difference)) && t.push("Current receivables subledger and GL do not reconcile.");
	} catch (e) {
		t.push("Receivables reconciliation failed: " + e.message);
	}
	return t;
}
function Uc(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = ye("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return ve(t.view), t.result;
	}
	if (typeof e.approvalReference != "string" || e.approvalReference.length > 500) throw Error("Provide an approval reference of 3–500 characters.");
	let t = A.list(), n = t.find((t) => t.operationId === e.operationId);
	if (!n || !e.expectedRevision || Rc(n) !== e.expectedRevision) throw Error("Recovery evidence changed. Refresh and review before approval.");
	let r = n.kind === "BANK_RECONCILIATION" ? uc(e.operationId) : as(n.kind) ? os(e.operationId) : Bc(Vc(), t, e.operationId);
	n.kind !== "BANK_RECONCILIATION" && !as(n.kind) && r.push(...Hc(e.operationId));
	let i = is();
	if (i.length && r.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), r.length) throw Error(`Financial recovery remains blocked: ${r.join(" ")}`);
	let a = t.find((t) => t.operationId === e.operationId);
	return {
		closed: A.closeReviewed(e.operationId, a.resultId, e.approvalReference, e.approver),
		remaining: Lc()
	};
}
//#endregion
//#region src/features/sales/data/recoveryWorkbench.ts
var Wc = [
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
];
function Gc() {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let e = ye("business.command", {
			repository: "salesRecovery",
			method: "inspectRecovery",
			args: []
		});
		return ve(e.view), e.result;
	}
	let e = j.require("audit.read"), t = A.list(), n = z.getAll(), r = {
		quotes: n.filter((e) => e.type === "QUOTE"),
		salesOrders: n.filter((e) => e.type === "SALES_ORDER"),
		invoices: n.filter((e) => e.type === "INVOICE"),
		payments: Ir.getAll(),
		creditNotes: R.getAll(),
		allocations: R.getAllAllocations(),
		journals: L.getAll()
	}, a = is(), o = t.filter((e) => e.state !== "COMPLETED" || e.reviewHistory?.length).map((n) => {
		let o = Wc.includes(n.kind) || as(n.kind) || n.kind === "BANK_RECONCILIATION", s = [], c = (e, t) => {
			s.some((e) => e.path === t) || s.push({
				label: e,
				path: t
			});
		};
		if (n.kind === "BANK_RECONCILIATION") {
			let e = cc.getAll().find((e) => e.id === n.resultId);
			c("Bank reconciliation records", e ? "/banking/accounts/" + encodeURIComponent(e.bankAccountId) : "/banking");
		}
		if (as(n.kind)) {
			let e = (n.kind === "BANK_TRANSACTION" ? $o.getTransactions() : $o.getTransfers()).find((e) => e.id === n.resultId);
			e && (c("Bank business records", "/banking"), c("Bank journal", "/accounting/journals/" + encodeURIComponent(e.journalEntryId)));
		}
		let l = r.payments.find((e) => e.id === n.resultId), u = r.allocations.find((e) => e.id === n.resultId);
		n.kind === "SALES_INVOICE_VOID" && n.resultId && r.invoices.some((e) => e.id === n.resultId) && c("Invoice", "/sales/invoices/" + encodeURIComponent(n.resultId)), l && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(n.kind) && (c("Invoice and payment", "/sales/invoices/" + encodeURIComponent(l.invoiceId)), l.depositId && c("Deposit owner", "/sales/customer-deposits/" + encodeURIComponent(l.depositId))), u && ["SALES_CREDIT_APPLY", "SALES_CREDIT_REVERSAL"].includes(n.kind) && (c("Invoice", "/sales/invoices/" + encodeURIComponent(u.invoiceId)), c("Credit note", "/sales/credit-notes/" + encodeURIComponent(u.creditNoteId)));
		let d = n.kind === "SALES_INVOICE_VOID" ? [{
			type: "CUSTOMER_INVOICE",
			id: n.resultId
		}] : l && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(n.kind) ? [{
			type: "CUSTOMER_PAYMENT",
			id: l.id
		}, {
			type: "CUSTOMER_INVOICE",
			id: l.invoiceId
		}] : u && ["SALES_CREDIT_APPLY", "SALES_CREDIT_REVERSAL"].includes(n.kind) ? [{
			type: "CUSTOMER_INVOICE",
			id: u.invoiceId
		}, {
			type: "CREDIT_NOTE",
			id: u.creditNoteId
		}] : [];
		for (let e of r.journals.filter((e) => d.some((t) => t.type === e.sourceType && t.id === e.sourceId) && !e.reversedJournalEntryId)) c("Original journal " + e.journalNumber, "/accounting/journals/" + encodeURIComponent(e.id)), e.reversalJournalEntryId && r.journals.some((t) => t.id === e.reversalJournalEntryId) && c("Reversal journal", "/accounting/journals/" + encodeURIComponent(e.reversalJournalEntryId));
		let f = n.state === "COMPLETED" ? [] : o ? n.kind === "BANK_RECONCILIATION" ? uc(n.operationId) : as(n.kind) ? os(n.operationId) : Bc(r, t, n.operationId) : ["This operation kind has no verified closure procedure. It remains blocked; do not replay it."];
		return n.state !== "COMPLETED" && o && (n.kind !== "BANK_RECONCILIATION" && !as(n.kind) && f.push(...Hc(n.operationId)), a.length && f.push("Financial consistency checks failed: " + a.map((e) => e.code).join(", ")), n.reviewHistory?.some((t) => t.operator.trim().toLowerCase() === e.userId.toLowerCase()) && f.push("A different authorized operator must approve; this account recorded review evidence."), i(e, "accounting.recover") || f.push("Your role can inspect but cannot approve recovery.")), {
			...structuredClone(n),
			supported: o,
			revision: Rc(n),
			closureReasons: f,
			canApprove: o && n.state === "MANUAL_REVIEW" && f.length === 0,
			links: s
		};
	});
	return {
		queue: o.filter((e) => e.state !== "COMPLETED").sort((e, t) => e.createdAt.localeCompare(t.createdAt)),
		history: o.filter((e) => e.state === "COMPLETED").sort((e, t) => t.updatedAt.localeCompare(e.updatedAt)),
		unresolvedCount: t.filter((e) => e.state !== "COMPLETED").length,
		inspectedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var Kc = (e) => Math.round((e + 2 ** -52) * 100) / 100, qc = w().trim().min(1).max(200), Jc = v().finite().positive().refine((e) => Kc(e) === e, "Use cents precision"), Yc = a({
	operationId: qc,
	customerId: qc,
	paymentDate: qc,
	bankAccountId: qc,
	reference: w().max(500).optional(),
	allocations: n(a({
		invoiceId: qc,
		amount: Jc
	}).strict()).min(1).max(500)
}).strict(), Xc = a({
	operationId: qc,
	creditId: qc,
	paymentDate: qc,
	bankAccountId: qc,
	amount: Jc,
	reference: w().max(500).optional()
}).strict(), Zc = [], Qc = [], $c = [], el = 0, tl = /* @__PURE__ */ new Set(), nl = () => {
	el++, tl.forEach((e) => e());
};
function rl(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function il(e, t) {
	T(t, "Payment date");
	let n = Ar.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = I.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function al(e) {
	if (cc.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function ol(e, t) {
	let n = e === "customer" ? R.getById(t) : U.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function sl(e, t, n) {
	let r = ol(e, t), i = Kc(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = Kc(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? R.update(o) : U.update(o);
}
function cl(e, t) {
	P();
	let n = Xc.parse(t), { old: r, fingerprint: i } = rl(e === "customer" ? Qc : $c, n.operationId, n);
	if (r) return r;
	let a = ol(e, n.creditId), o = il(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = I.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = L.post({
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
	return sl(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? Qc = [...Qc, u] : $c = [...$c, u], nl(), u;
}
function ll(e, t) {
	if (P(), T(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? Qc : $c, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	al(r.journalEntryId), L.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = ol(e, r.creditId);
	sl(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? Qc = n.map((e) => e.id === r.id ? a : e) : $c = n.map((e) => e.id === r.id ? a : e), nl(), a;
}
var ul = {
	recordReceipt(e) {
		let t = Yc.parse(e), { old: n, fingerprint: r } = rl(Zc, t.operationId, t);
		if (n) return n;
		if (il(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = z.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => z.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: Kc(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return Zc = [...Zc, a], nl(), a;
	},
	reverseReceipt(e) {
		let t = Zc.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = Ir.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of L.getBySource("CUSTOMER_PAYMENT", e)) al(t.id);
		}
		for (let n of t.paymentIds) z.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return Zc = Zc.map((e) => e.id === t.id ? n : e), nl(), n;
	},
	createRefund: (e) => cl("customer", e),
	reverseRefund: (e) => ll("customer", e)
}, dl = {
	create: (e) => cl("supplier", e),
	reverse: (e) => ll("supplier", e),
	repairLegacyCredits(e) {
		if (P(), T(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of U.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || L.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = L.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = I.requireBySystemRole("INVENTORY"), a = I.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = Kc(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(L.post({
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
}, fl = a({
	id: qc,
	operationId: qc,
	fingerprint: qc,
	creditId: qc,
	contactId: qc,
	paymentDate: qc,
	bankAccountId: qc,
	amount: Jc,
	journalEntryId: qc,
	status: D(["POSTED", "REVERSED"]),
	reference: w().optional(),
	reversalDate: w().optional()
}).strict();
b("customerSettlements", {
	repository: ul,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: Zc,
		refunds: Qc
	}),
	restore: (e) => {
		Zc = e.receipts, Qc = e.refunds;
	},
	validate: (e, t) => {
		pl(e, t, !1);
		let r = e;
		n(fl.extend({ fingerprint: w() })).parse(r.refunds), n(a({
			id: qc,
			operationId: qc,
			paymentIds: n(qc),
			amount: Jc,
			status: D(["POSTED", "REVERSED"])
		}).passthrough()).parse(r.receipts);
	},
	publish: nl
}), b("supplierRefunds", {
	repository: dl,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: $c }),
	restore: (e) => {
		$c = e.refunds;
	},
	validate: (e, t) => {
		pl(e, t, !0), n(fl.extend({ fingerprint: w() })).parse(e.refunds);
	},
	publish: nl
});
function pl(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = Kc(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || Kc(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/supplier-prepayments/supplierPrepaymentRepository.ts
var ml = (e) => Math.round((e + 2 ** -52) * 100) / 100, hl = w().trim().min(1).max(200), gl = hl.refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}), _l = v().finite().positive().refine((e) => ml(e) === e), vl = w().trim().min(3).max(2e3), yl = w().trim().max(500).default(""), bl = a({
	operationId: hl,
	supplierId: hl,
	date: gl,
	bankAccountId: hl,
	amount: _l,
	reference: yl,
	reason: vl
}).strict(), xl = a({
	operationId: hl,
	prepaymentId: hl,
	supplierBillId: hl,
	date: gl,
	amount: _l,
	reference: yl,
	reason: vl
}).strict(), Sl = a({
	operationId: hl,
	prepaymentId: hl,
	bankAccountId: hl,
	date: gl,
	amount: _l,
	reference: yl,
	reason: vl
}).strict(), Cl = {
	id: hl,
	fingerprint: w(),
	journalId: hl,
	status: D(["POSTED", "REVERSED"]),
	createdBy: hl,
	createdAt: hl,
	reversalDate: gl.optional(),
	reversalReason: vl.optional(),
	reversedBy: hl.optional()
}, wl = bl.extend({
	...Cl,
	assetAccountId: hl
}).strict(), Tl = xl.extend({
	...Cl,
	paymentId: hl
}).strict(), El = Sl.extend(Cl).strict(), Dl = a({
	prepayments: n(wl),
	applications: n(Tl),
	refunds: n(El),
	settings: n(a({
		id: hl,
		assetAccountId: hl
	}).strict()).max(1)
}).strict(), Ol = {
	prepayments: [],
	applications: [],
	refunds: [],
	settings: []
}, kl = 0, Al = /* @__PURE__ */ new Set(), jl = () => {
	kl++, Al.forEach((e) => e());
};
function Ml(e) {
	let t = Ol.prepayments.find((t) => t.id === e);
	if (!t) throw Error("Supplier prepayment not found.");
	return t;
}
function Nl(e) {
	let t = Ml(e);
	return t.status === "REVERSED" ? 0 : ml(t.amount - Ol.applications.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - Ol.refunds.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function Pl(e, t) {
	let n = e.prepayments.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, ml((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.prepaymentId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Prepayment event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = ml(a + e), a < 0) throw Error("Prepayment would be overdrawn on a historical date.");
}
function Fl(e) {
	let t = JSON.stringify(e), n = [
		...Ol.prepayments,
		...Ol.applications,
		...Ol.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different prepayment data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function Il(e) {
	let t = I.requireById(e);
	if (!t.active || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active prepayment asset account.");
	return t;
}
function Ll(e, t) {
	let n = Ar.requireById(e), r = I.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function Rl(e) {
	T(e), un(e), P();
}
function zl(e, t, n = crypto.randomUUID()) {
	return {
		id: n,
		fingerprint: e,
		journalId: t,
		status: "POSTED",
		createdBy: j.require("purchases.payment").userId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
b("supplierPrepayments", {
	repository: {
		setupDefaults() {
			if (j.require("accounting.post"), Ol.settings[0]) return Ol.settings[0];
			let e = 1390;
			for (; I.getAll().some((t) => t.code === String(e));) e++;
			let t = I.create({
				code: String(e),
				name: "Supplier prepayments paid",
				type: "ASSET",
				active: !0,
				allowManualPosting: !1
			}), n = {
				id: crypto.randomUUID(),
				assetAccountId: t.id
			};
			return Ol.settings = [n], jl(), n;
		},
		balance(e) {
			return j.require("purchases.read"), Nl(e);
		},
		pay(e) {
			j.require("purchases.payment");
			let t = bl.parse(e), { prior: n, fingerprint: r } = Fl(t);
			if (n) return n;
			Rl(t.date);
			let i = Di.getById(t.supplierId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active supplier.");
			let a = Ol.settings[0];
			if (!a) throw Error("Configure the prepayment asset account first.");
			Il(a.assetAccountId);
			let o = Ll(t.bankAccountId, t.date), s = crypto.randomUUID(), c = L.post({
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
				...zl(r, c.id, s),
				assetAccountId: a.assetAccountId
			};
			return Ol.prepayments = [...Ol.prepayments, l], jl(), l;
		},
		apply(e) {
			j.require("purchases.payment");
			let t = xl.parse(e), { prior: n, fingerprint: r } = Fl(t);
			if (n) return n;
			Rl(t.date);
			let i = Ml(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Nl(i.id)) throw Error("Prepayment date or available balance is insufficient.");
			Il(i.assetAccountId);
			let a = uo.getById(t.supplierBillId);
			if (!a || a.supplierId !== i.supplierId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.billDate) throw Error("Choose an issued bill for the same supplier.");
			if (t.amount > a.totals.amountDue) throw Error("Prepayment application exceeds bill amount due.");
			let o = crypto.randomUUID(), s = "prepayment-payment:" + o;
			_o.recordPrepaymentSettlement({
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
			let c = L.post({
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
					accountId: I.requireBySystemRole("ACCOUNTS_PAYABLE").id,
					debit: t.amount,
					credit: 0
				}]
			}), l = {
				...t,
				...zl(r, c.id, o),
				paymentId: s
			};
			return Ol.applications = [...Ol.applications, l], Pl(Ol, i.id), jl(), l;
		},
		refund(e) {
			j.require("purchases.payment");
			let t = Sl.parse(e), { prior: n, fingerprint: r } = Fl(t);
			if (n) return n;
			Rl(t.date);
			let i = Ml(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Nl(i.id)) throw Error("Refund exceeds the available prepayment.");
			Il(i.assetAccountId);
			let a = Ll(t.bankAccountId, t.date), o = crypto.randomUUID(), s = L.post({
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
				...zl(r, s.id, o)
			};
			return Ol.refunds = [...Ol.refunds, c], Pl(Ol, i.id), jl(), c;
		},
		reverse(e) {
			let t = j.require("purchases.payment"), n = a({
				entity: D([
					"prepayments",
					"applications",
					"refunds"
				]),
				id: hl,
				reversalDate: gl,
				reason: vl
			}).strict().parse(e), r = Ol[n.entity].find((e) => e.id === n.id);
			if (!r) throw Error("Prepayment record not found.");
			if (r.status === "REVERSED") return r;
			if (Rl(n.reversalDate), n.reversalDate < r.date) throw Error("Prepayment reversal cannot precede its original date.");
			let i = n.entity === "prepayments" ? r.id : r.prepaymentId;
			if (n.entity === "prepayments" && [...Ol.applications, ...Ol.refunds].some((e) => e.prepaymentId === r.id && e.status === "POSTED")) throw Error("Reverse prepayment applications and refunds before reversing its receipt.");
			al(r.journalId), L.reverse({
				journalEntryId: r.journalId,
				reversalDate: n.reversalDate,
				reason: n.reason
			});
			let o = {
				...r,
				status: "REVERSED",
				reversalDate: n.reversalDate,
				reversalReason: n.reason,
				reversedBy: t.userId
			};
			if (Ol[n.entity] = Ol[n.entity].map((e) => e.id === n.id ? o : e), n.entity === "applications") {
				let e = r;
				_o.reversePrepaymentSettlement(e.paymentId, n.reversalDate, n.reason);
			}
			return Pl(Ol, i), jl(), o;
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
	snapshot: () => Ol,
	restore: (e) => {
		Ol = e;
	},
	publish: jl,
	validate: (e, t) => {
		let n = Dl.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.assetAccountId);
			if (!t || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Invalid prepayment asset mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, ml((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"prepayments",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "prepayments" ? bl : e === "applications" ? xl : Sl).parse(JSON.parse(t.fingerprint));
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
		for (let e of n.prepayments) if (Pl(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.prepaymentId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed prepayment has later consumption.");
		for (let e of r.supplierPayments.supplierPayments) if (e.prepaymentApplicationId && !n.applications.some((t) => t.id === e.prepaymentApplicationId && t.paymentId === e.id && t.prepaymentId === e.prepaymentId)) throw Error("Orphan prepayment settlement payment.");
	}
});
//#endregion
//#region src/features/customer-deposits/customerDepositRepository.ts
var Bl = (e) => Math.round((e + 2 ** -52) * 100) / 100, Vl = w().trim().min(1).max(200), Hl = Vl.refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}), Ul = v().finite().positive().refine((e) => Bl(e) === e), Wl = w().trim().min(3).max(2e3), Gl = w().trim().max(500).default(""), Kl = a({
	operationId: Vl,
	customerId: Vl,
	date: Hl,
	bankAccountId: Vl,
	amount: Ul,
	reference: Gl,
	reason: Wl
}).strict(), ql = a({
	operationId: Vl,
	depositId: Vl,
	invoiceId: Vl,
	date: Hl,
	amount: Ul,
	reference: Gl,
	reason: Wl
}).strict(), Jl = a({
	operationId: Vl,
	depositId: Vl,
	bankAccountId: Vl,
	date: Hl,
	amount: Ul,
	reference: Gl,
	reason: Wl
}).strict(), Yl = {
	id: Vl,
	fingerprint: w(),
	journalId: Vl,
	status: D(["POSTED", "REVERSED"]),
	createdBy: Vl,
	createdAt: Vl,
	reversalDate: Hl.optional(),
	reversalReason: Wl.optional(),
	reversedBy: Vl.optional()
}, Xl = Kl.extend({
	...Yl,
	liabilityAccountId: Vl
}).strict(), Zl = ql.extend({
	...Yl,
	paymentId: Vl
}).strict(), Ql = Jl.extend(Yl).strict(), $l = a({
	deposits: n(Xl),
	applications: n(Zl),
	refunds: n(Ql),
	settings: n(a({
		id: Vl,
		liabilityAccountId: Vl
	}).strict()).max(1)
}).strict(), eu = {
	deposits: [],
	applications: [],
	refunds: [],
	settings: []
}, tu = 0, nu = /* @__PURE__ */ new Set(), ru = () => {
	tu++, nu.forEach((e) => e());
};
function iu(e) {
	let t = eu.deposits.find((t) => t.id === e);
	if (!t) throw Error("Customer deposit not found.");
	return t;
}
function au(e) {
	let t = iu(e);
	return t.status === "REVERSED" ? 0 : Bl(t.amount - eu.applications.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - eu.refunds.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function ou(e, t) {
	let n = e.deposits.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, Bl((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.depositId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Deposit event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = Bl(a + e), a < 0) throw Error("Deposit would be overdrawn on a historical date.");
}
function su(e) {
	let t = JSON.stringify(e), n = [
		...eu.deposits,
		...eu.applications,
		...eu.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different deposit data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function cu(e) {
	let t = I.requireById(e);
	if (!t.active || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active deposit liability account.");
	return t;
}
function lu(e, t) {
	let n = Ar.requireById(e), r = I.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function uu(e) {
	T(e), un(e), P();
}
function du(e, t, n = crypto.randomUUID()) {
	return {
		id: n,
		fingerprint: e,
		journalId: t,
		status: "POSTED",
		createdBy: j.require("sales.payment").userId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
b("customerDeposits", {
	repository: {
		setupDefaults() {
			if (j.require("accounting.post"), eu.settings[0]) return eu.settings[0];
			let e = 2290;
			for (; I.getAll().some((t) => t.code === String(e));) e++;
			let t = I.create({
				code: String(e),
				name: "Customer deposits held",
				type: "LIABILITY",
				active: !0,
				allowManualPosting: !1
			}), n = {
				id: crypto.randomUUID(),
				liabilityAccountId: t.id
			};
			return eu.settings = [n], ru(), n;
		},
		balance(e) {
			return j.require("sales.read"), au(e);
		},
		receive(e) {
			j.require("sales.payment");
			let t = Kl.parse(e), { prior: n, fingerprint: r } = su(t);
			if (n) return n;
			uu(t.date);
			let i = M.getById(t.customerId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active customer.");
			let a = eu.settings[0];
			if (!a) throw Error("Configure the deposit liability account first.");
			cu(a.liabilityAccountId);
			let o = lu(t.bankAccountId, t.date), s = crypto.randomUUID(), c = L.post({
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
				...du(r, c.id, s),
				liabilityAccountId: a.liabilityAccountId
			};
			return eu.deposits = [...eu.deposits, l], ru(), l;
		},
		apply(e) {
			j.require("sales.payment");
			let t = ql.parse(e), { prior: n, fingerprint: r } = su(t);
			if (n) return n;
			uu(t.date);
			let i = iu(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > au(i.id)) throw Error("Deposit date or available balance is insufficient.");
			cu(i.liabilityAccountId);
			let a = z.getAll().find((e) => e.id === t.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || a.customerId !== i.customerId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.documentDate) throw Error("Choose an issued invoice for the same customer.");
			let o = z.recalculateInvoiceBalance(a.id);
			if (t.amount > o.amountDue) throw Error("Deposit application exceeds invoice amount due.");
			let s = crypto.randomUUID(), c = "deposit-payment:" + s;
			Ir.recordDepositSettlement({
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
			let l = L.post({
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
					accountId: I.requireBySystemRole("ACCOUNTS_RECEIVABLE").id,
					debit: 0,
					credit: t.amount
				}]
			}), u = {
				...t,
				...du(r, l.id, s),
				paymentId: c
			};
			return eu.applications = [...eu.applications, u], ou(eu, i.id), z.recalculateInvoiceBalance(a.id), ru(), u;
		},
		refund(e) {
			j.require("sales.payment");
			let t = Jl.parse(e), { prior: n, fingerprint: r } = su(t);
			if (n) return n;
			uu(t.date);
			let i = iu(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > au(i.id)) throw Error("Refund exceeds the available deposit.");
			cu(i.liabilityAccountId);
			let a = lu(t.bankAccountId, t.date), o = crypto.randomUUID(), s = L.post({
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
				...du(r, s.id, o)
			};
			return eu.refunds = [...eu.refunds, c], ou(eu, i.id), ru(), c;
		},
		reverse(e) {
			let t = j.require("sales.payment"), n = a({
				entity: D([
					"deposits",
					"applications",
					"refunds"
				]),
				id: Vl,
				reversalDate: Hl,
				reason: Wl
			}).strict().parse(e), r = eu[n.entity].find((e) => e.id === n.id);
			if (!r) throw Error("Deposit record not found.");
			if (r.status === "REVERSED") return r;
			if (uu(n.reversalDate), n.reversalDate < r.date) throw Error("Deposit reversal cannot precede its original date.");
			let i = n.entity === "deposits" ? r.id : r.depositId;
			if (n.entity === "deposits" && [...eu.applications, ...eu.refunds].some((e) => e.depositId === r.id && e.status === "POSTED")) throw Error("Reverse deposit applications and refunds before reversing its receipt.");
			al(r.journalId), L.reverse({
				journalEntryId: r.journalId,
				reversalDate: n.reversalDate,
				reason: n.reason
			});
			let o = {
				...r,
				status: "REVERSED",
				reversalDate: n.reversalDate,
				reversalReason: n.reason,
				reversedBy: t.userId
			};
			if (eu[n.entity] = eu[n.entity].map((e) => e.id === n.id ? o : e), n.entity === "applications") {
				let e = r;
				Ir.reverseDepositSettlement(e.paymentId, n.reversalDate, n.reason), z.recalculateInvoiceBalance(e.invoiceId);
			}
			return ou(eu, i), ru(), o;
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
	snapshot: () => eu,
	restore: (e) => {
		eu = e;
	},
	publish: ru,
	validate: (e, t) => {
		let n = $l.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.liabilityAccountId);
			if (!t || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Invalid deposit liability mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, Bl((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"deposits",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "deposits" ? Kl : e === "applications" ? ql : Jl).parse(JSON.parse(t.fingerprint));
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
		for (let e of n.deposits) if (ou(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.depositId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed deposit has later consumption.");
		for (let e of r.customerPayments.payments) if (e.depositApplicationId && !n.applications.some((t) => t.id === e.depositApplicationId && t.paymentId === e.id && t.depositId === e.depositId)) throw Error("Orphan deposit settlement payment.");
	}
});
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function fu(e) {
	return I.requireBySystemRole(e).id;
}
function pu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function mu(e) {
	return L.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function hu(e) {
	let t = va.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var gu = {
	postSalesFulfilment(e) {
		let t = mu(e.id);
		if (t) return t;
		let n = pu(hu(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return L.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: fu("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: fu("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = mu(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? L.getById(r.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, _u = /* @__PURE__ */ new Set(), vu = [], yu = vu;
function bu() {
	yu = vu, _u.forEach((e) => e());
}
function xu() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = vu.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Su(e, t) {
	return B(vu.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function Cu(e) {
	let t = z.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(qe).map((e) => Su(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(qe).every((e, t) => n[t] >= B(e.quantity));
	z.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function wu(e) {
	let t = va.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Tu = {
	subscribe(e) {
		return _u.add(e), () => {
			_u.delete(e);
		};
	},
	getSnapshot() {
		return yu;
	},
	getAll() {
		return yu;
	},
	getById(e) {
		return vu.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return vu.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: Su,
	getRemainingQuantity(e, t) {
		let n = z.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return qe(r) ? B(r.quantity - Su(e, t)) : 0;
	},
	create(e) {
		let t = z.getById(e.salesOrderId);
		if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let n = t;
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "INVOICED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
		if (n.status === "INVOICED" && !n.invoiceIds.some((e) => {
			let t = z.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("This order has no active invoice; do not fulfil a void invoice.");
		let r = ra.getById(e.siteId);
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
			if (!qe(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = Xe(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = Ze(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = B(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = Su(n.id, t.id);
			if (s > B(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = B(s * o.conversionToBase), u = La.getBalance(r.id, t.productId);
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
			s.set(e.orderLine.productId, B(t + e.fulfilledBaseQuantity));
		}
		for (let [e, t] of s) {
			let n = La.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = Xe(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = xu(), d = o.map((e) => ({
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
			let i = Xe(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = ca.create({
				movementType: "SALE",
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: B(-t.fulfilledBaseQuantity),
				transactionUnitId: t.unitId,
				transactionUnitSymbol: t.unitSymbol,
				transactionQuantity: B(-t.fulfilledQuantity),
				conversionToBase: t.conversionToBase,
				referenceType: "SALES_FULFILMENT",
				referenceId: f.id,
				referenceNumber: f.fulfilmentNumber,
				salesOrderId: n.id,
				salesOrderNumber: n.documentNumber,
				occurredAt: e.fulfilmentDate,
				notes: `Sales fulfilment ${f.fulfilmentNumber}`
			});
			ja({
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
			}), La.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return gu.postSalesFulfilment(f), vu = [f, ...vu], bu(), Cu(n.id), f;
	},
	void(e) {
		if (E().physicalCustomerReturns?.returns.some((t) => t.status === "POSTED" && t.lines.some((t) => t.fulfilmentId === e.fulfilmentId))) throw Error("Reverse physical customer returns before voiding this dispatch.");
		let t = vu.find((t) => t.id === e.fulfilmentId);
		if (!t) throw Error("Sales fulfilment was not found.");
		if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let r = z.getById(t.salesOrderId);
		if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (r.status === "INVOICED" && r.invoiceIds.some((e) => {
			let t = z.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED" && r.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
		let i = wu(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
			let n = Xe(e.productId);
			if (!n) throw Error(`Product ${e.sku} was not found.`);
			let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return a.add(r.id), {
				line: e,
				product: n,
				originalIssue: r
			};
		});
		gu.reverseSalesFulfilment({
			fulfilment: t,
			reversalDate: e.voidDate,
			reason: n
		});
		for (let r of o) {
			let { line: i, product: a, originalIssue: o } = r, s = ca.create({
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
			Ma({
				siteId: t.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: Wi(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: t.id,
				referenceNumber: t.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
			}), La.receive({
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
		return vu = vu.map((e) => e.id === s.id ? s : e), bu(), Cu(t.salesOrderId), s;
	}
};
b("fulfilments", {
	repository: Tu,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: vu }),
	restore: (e) => {
		vu = e.fulfilments, yu = vu;
	},
	publish: () => _u.forEach((e) => e())
});
//#endregion
//#region src/features/customer-returns/customerReturnRepository.ts
var W = w().trim().min(1).max(200), Eu = v().finite().positive().refine((e) => Math.round(e * 1e4) / 1e4 === e), Du = v().finite().nonnegative(), Ou = a({
	operationId: W,
	invoiceId: W,
	creditNoteId: W.optional(),
	returnDate: W,
	reason: w().trim().min(3).max(2e3),
	lines: n(a({
		costMovementId: W,
		invoiceLineId: W,
		quantity: Eu
	}).strict()).min(1).max(500)
}).strict(), ku = a({
	costMovementId: W,
	invoiceLineId: W,
	fulfilmentId: W,
	productId: W,
	unitId: W,
	baseUnitId: W,
	siteId: W,
	description: w(),
	quantity: Eu,
	conversionToBase: Eu,
	quantityBase: Eu,
	inventoryValue: Du,
	unitCostBase: Du,
	movementId: W,
	restoredCostId: W,
	reversalMovementId: W.optional(),
	reversalCostId: W.optional()
}).strict(), Au = a({
	id: W,
	number: W,
	operationId: W,
	fingerprint: w(),
	invoiceId: W,
	invoiceNumber: W,
	customerId: W,
	creditNoteId: W,
	ownsCredit: _(),
	returnDate: W,
	reason: W.max(2e3),
	status: D(["POSTED", "REVERSED"]),
	lines: n(ku).min(1),
	inventoryValue: Du,
	journalId: W.optional(),
	createdBy: W,
	createdAt: W,
	reversalDate: W.optional(),
	reversalReason: W.optional(),
	reversedBy: W.optional()
}).strict(), ju = [], Mu = 0, Nu = /* @__PURE__ */ new Set(), Pu = () => {
	Mu++, Nu.forEach((e) => e());
}, Fu = (e) => Math.round(e * 1e4) / 1e4, Iu = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Lu(e, t, n) {
	if (va.getAll().some((r) => r.siteId === e && r.productId === t && C(r.occurredAt) > n)) throw Error("Return date precedes later inventory activity at this site.");
}
function Ru(e) {
	let t = z.getAll().find((t) => t.id === e && t.type === "INVOICE");
	if (!t || t.type !== "INVOICE" || ["VOID", "DRAFT"].includes(t.status) || t.openingBalanceImportId) return [];
	let n = [];
	for (let e of Tu.getAll().filter((e) => e.salesOrderId === t.sourceSalesOrderId && e.status === "ACTIVE")) {
		let r = /* @__PURE__ */ new Set();
		for (let i of e.lines) {
			let a = t.lines.find((e) => e.id === i.salesOrderLineId && e.productId === i.productId && e.unitId === i.unitId), o = va.getAll().find((t) => t.referenceType === "SALE" && t.referenceId === e.id && t.movementType === "ISSUE" && t.productId === i.productId && ca.getAll().some((e) => e.id === t.inventoryMovementId && e.transactionUnitId === i.unitId) && t.siteId === e.siteId && Fu(-t.quantityBase) === Fu(i.fulfilledBaseQuantity) && !r.has(t.id));
			if (!a || !o) continue;
			r.add(o.id);
			let s = ju.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === o.id).reduce((e, t) => e + t.quantityBase, 0);
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
b("physicalCustomerReturns", {
	repository: {
		create(e) {
			let t = j.require("sales.payment"), n = Ou.parse(e), r = JSON.stringify(n), i = ju.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already used with different customer return data.");
				return i;
			}
			T(n.returnDate), un(n.returnDate), P();
			let a = z.getAll().find((e) => e.id === n.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || n.returnDate < a.documentDate) throw Error("Select an issued invoice and a return date on or after it.");
			let o = Ru(a.id), s = /* @__PURE__ */ new Set(), c = n.lines.map((e) => {
				if (s.has(e.costMovementId)) throw Error("Select each original dispatch cost only once.");
				s.add(e.costMovementId);
				let t = o.find((t) => t.costMovementId === e.costMovementId && t.invoiceLineId === e.invoiceLineId);
				if (!t || e.quantity > t.availableQuantity + 1e-8 || n.returnDate < t.dispatchDate) throw Error("Return exceeds dispatched quantities or precedes dispatch.");
				let r = Xe(t.productId), i = ra.getById(t.siteId), c = a.lines.find((t) => t.id === e.invoiceLineId);
				if (!r || !i || i.status !== "ACTIVE") throw Error("An active original receiving site and product are required.");
				if ((c.areaPerPack || r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(r.units.find((e) => e.id === t.unitId)?.code ?? "")) && !Number.isInteger(e.quantity)) throw Error("Return whole packs in whole quantities.");
				Lu(t.siteId, t.productId, n.returnDate);
				let l = Fu(e.quantity * t.conversionToBase);
				if (l <= 0) throw Error("Return quantity rounds to zero.");
				let u = ju.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === t.costMovementId), d = Iu(l + u.reduce((e, t) => e + t.quantityBase, 0) >= t.originalQuantityBase - 1e-8 ? t.originalValue - u.reduce((e, t) => e + t.inventoryValue, 0) : t.originalValue * l / t.originalQuantityBase);
				return {
					...t,
					quantity: e.quantity,
					quantityBase: l,
					inventoryValue: d
				};
			}), l = /* @__PURE__ */ new Map();
			for (let e of c) l.set(e.invoiceLineId, Fu((l.get(e.invoiceLineId) ?? 0) + e.quantity));
			let u = n.creditNoteId ? R.getById(n.creditNoteId) : void 0;
			if (n.creditNoteId) {
				if (!u || u.sourceInvoiceId !== a.id || ["VOID", "DRAFT"].includes(u.status) || u.creditDate > n.returnDate) throw Error("Select an issued credit for this invoice dated before receipt.");
				for (let [e, t] of l) {
					let n = u.lines.find((t) => t.id === e)?.quantity ?? 0;
					if (t + ju.filter((e) => e.status === "POSTED" && e.creditNoteId === u.id).flatMap((e) => e.lines).filter((t) => t.invoiceLineId === e).reduce((e, t) => e + t.quantity, 0) > n + 1e-8) throw Error("Physical return exceeds the linked credit quantities.");
				}
			} else u = z.createCreditNoteFromInvoice({
				invoiceId: a.id,
				creditDate: n.returnDate,
				reason: n.reason,
				lines: [...l].map(([e, t]) => ({
					...a.lines.find((t) => t.id === e),
					quantity: t
				}))
			});
			let d = crypto.randomUUID(), f = "CRTN-" + String(ju.length + 1).padStart(6, "0"), p = c.map((e) => {
				La.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = ca.create({
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
				}), r = Ma({
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
			}), m = Iu(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? L.post({
				journalDate: n.returnDate,
				description: "Customer goods returned " + f,
				sourceType: "CUSTOMER_RETURN",
				sourceId: d,
				lines: [{
					accountId: I.requireBySystemRole("INVENTORY").id,
					debit: m,
					credit: 0
				}, {
					accountId: I.requireBySystemRole("COST_OF_GOODS_SOLD").id,
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
			return ju = [g, ...ju], Pu(), g;
		},
		reverse(e) {
			let t = j.require("sales.payment"), n = a({
				id: W,
				reversalDate: W,
				reason: w().trim().min(3).max(2e3)
			}).strict().parse(e), r = ju.find((e) => e.id === n.id);
			if (!r) throw Error("Customer return not found.");
			if (r.status === "REVERSED") return r;
			if (T(n.reversalDate), un(n.reversalDate), P(), n.reversalDate < r.returnDate) throw Error("Reversal precedes the return.");
			let i = /* @__PURE__ */ new Map();
			for (let e of r.lines) {
				Lu(e.siteId, e.productId, n.reversalDate);
				let t = e.siteId + "|" + e.productId, r = i.get(t) ?? {
					quantity: 0,
					value: 0
				};
				i.set(t, {
					quantity: Fu(r.quantity + e.quantityBase),
					value: Iu(r.value + e.inventoryValue)
				});
			}
			for (let [e, t] of i) {
				let [n, r] = e.split("|"), i = fa.getBalance(n, r);
				if ((La.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t.quantity || (i?.inventoryValue ?? 0) + .001 < t.value || Math.abs((i?.quantityOnHand ?? 0) - t.quantity) < 1e-8 && Math.abs((i?.inventoryValue ?? 0) - t.value) > .001) throw Error("Returned stock/value has been used; restore stock availability before reversal.");
			}
			let o = R.getById(r.creditNoteId);
			if (r.ownsCredit && ((o.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > n.reversalDate) || R.getAllocationsByCreditNote(o.id).some((e) => C(e.reversedAt ?? e.createdAt) > n.reversalDate))) throw Error("Return reversal precedes later credit settlement activity.");
			ju = ju.map((e) => e.id === r.id ? {
				...e,
				status: "REVERSED"
			} : e), r.ownsCredit && z.voidCreditNote({
				creditNoteId: r.creditNoteId,
				reason: n.reason,
				voidDate: n.reversalDate
			});
			let s = r.lines.map((e) => {
				La.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = ca.create({
					movementType: "RETURN_OUT",
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: -e.quantityBase,
					transactionUnitId: e.unitId,
					transactionUnitSymbol: ca.getAll().find((t) => t.id === e.movementId)?.transactionUnitSymbol ?? "",
					transactionQuantity: -e.quantity,
					conversionToBase: e.conversionToBase,
					referenceType: "CUSTOMER_RETURN_VOID",
					referenceId: r.id,
					referenceNumber: r.number,
					occurredAt: n.reversalDate,
					notes: n.reason
				}), i = fa.requireBalance(e.siteId, e.productId), a = Fu(i.quantityOnHand - e.quantityBase), o = Iu(i.inventoryValue - e.inventoryValue), s = a ? Ui(o / a) : 0;
				fa.save({
					...i,
					quantityOnHand: a,
					inventoryValue: o,
					averageCostPerBaseUnit: s,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				});
				let c = va.create({
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
			r.journalId && L.reverse({
				journalEntryId: r.journalId,
				reversalDate: n.reversalDate,
				reason: n.reason
			});
			let c = {
				...r,
				lines: s,
				status: "REVERSED",
				reversalDate: n.reversalDate,
				reversalReason: n.reason,
				reversedBy: t.userId
			};
			return ju = ju.map((e) => e.id === r.id ? c : e), Pu(), c;
		}
	},
	read: "inventory.cost.read",
	commands: {
		create: "sales.payment",
		reverse: "sales.payment"
	},
	snapshot: () => ({ returns: ju }),
	restore: (e) => {
		ju = e.returns;
	},
	publish: Pu,
	validate: (e, t) => {
		let r = a({ returns: n(Au) }).strict().parse(e), i = t, o = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
		for (let e of r.returns) {
			let t = Ou.parse(JSON.parse(e.fingerprint));
			if (T(e.returnDate), o.has(e.operationId) || t.operationId !== e.operationId || t.invoiceId !== e.invoiceId || t.returnDate !== e.returnDate || t.reason !== e.reason || t.lines.length !== e.lines.length || e.ownsCredit !== !t.creditNoteId || t.creditNoteId && t.creditNoteId !== e.creditNoteId) throw Error("Customer return request mismatch.");
			o.add(e.operationId);
			let n = i.sales.invoices.find((t) => t.id === e.invoiceId && t.customerId === e.customerId), r = i.customerCredits.creditNotes.find((t) => t.id === e.creditNoteId && t.sourceInvoiceId === e.invoiceId);
			if (!n || !r || e.status === "POSTED" && r.status === "VOID" || e.status === "REVERSED" && e.ownsCredit && r.status !== "VOID" || Iu(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue || new Set(e.lines.map((e) => e.costMovementId)).size !== e.lines.length) throw Error("Customer return source or totals mismatch.");
			for (let r of e.lines) {
				let a = t.lines.find((e) => e.costMovementId === r.costMovementId && e.invoiceLineId === r.invoiceLineId), o = i.costMovements.movements.find((e) => e.id === r.costMovementId), c = i.costMovements.movements.find((e) => e.id === r.restoredCostId), l = i.inventoryMovements.movements.find((e) => e.id === r.movementId), u = i.fulfilments.fulfilments.find((e) => e.id === r.fulfilmentId);
				if (!a || a.quantity !== r.quantity || !u || u.salesOrderId !== n.sourceSalesOrderId || !o || o.referenceType !== "SALE" || o.referenceId !== u.id || o.productId !== r.productId || o.siteId !== r.siteId || Fu(r.quantity * r.conversionToBase) !== r.quantityBase || !c || c.referenceType !== "CUSTOMER_RETURN" || c.referenceId !== e.id || c.inventoryMovementId !== r.movementId || c.quantityBase !== r.quantityBase || c.valueChange !== r.inventoryValue || !l || l.referenceId !== e.id || l.quantityBase !== r.quantityBase || C(c.occurredAt) !== e.returnDate) throw Error("Customer return inventory/cost references mismatch.");
				if (e.status === "POSTED") {
					if (u.status !== "ACTIVE") throw Error("Active customer return has a void dispatch.");
					let e = s.get(o.id) ?? {
						quantity: 0,
						value: 0
					}, t = {
						quantity: Fu(e.quantity + r.quantityBase),
						value: Iu(e.value + r.inventoryValue)
					};
					if (s.set(o.id, t), t.quantity > -o.quantityBase + 1e-8 || t.value > -o.valueChange + .001) throw Error("Customer returns exceed original dispatched stock/cost.");
				}
				if (e.status === "REVERSED") {
					let t = i.costMovements.movements.find((e) => e.id === r.reversalCostId);
					if (!t || t.referenceType !== "CUSTOMER_RETURN_VOID" || t.referenceId !== e.id || t.inventoryMovementId !== r.reversalMovementId || t.quantityBase !== -r.quantityBase || t.valueChange !== -r.inventoryValue || C(t.occurredAt) !== e.reversalDate) throw Error("Customer return reversal references mismatch.");
				}
			}
			if (e.status === "POSTED") for (let t of e.lines) {
				let n = e.creditNoteId + "|" + t.invoiceLineId, i = Fu((c.get(n) ?? 0) + t.quantity);
				if (c.set(n, i), !r.lines.some((e) => e.id === t.invoiceLineId && e.quantity + 1e-8 >= i)) throw Error("Customer returns exceed linked credit quantity.");
			}
			for (let t of new Set(e.lines.map((e) => e.invoiceLineId))) {
				let n = Fu(e.lines.filter((e) => e.invoiceLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!r.lines.some((e) => e.id === t && e.quantity + 1e-8 >= n)) throw Error("Customer return credit quantity mismatch.");
			}
			if (e.returnDate < n.documentDate || e.status === "POSTED" && e.reversalDate) throw Error("Customer return date/status mismatch.");
			if (e.reversalDate && T(e.reversalDate), e.status === "REVERSED" && (!e.reversalDate || e.reversalDate < e.returnDate || !e.reversalReason || !e.reversedBy)) throw Error("Customer return reversal metadata mismatch.");
			if (e.inventoryValue) {
				let t = i.journals.journalEntries.find((t) => t.id === e.journalId), n = i.accounts.accounts.find((e) => e.systemRole === "INVENTORY"), r = i.accounts.accounts.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
				if (!t || t.journalDate !== e.returnDate || t.lines.length !== 2 || !t.lines.some((t) => t.accountId === n.id && t.debit === e.inventoryValue && t.credit === 0) || !t.lines.some((t) => t.accountId === r.id && t.credit === e.inventoryValue && t.debit === 0)) throw Error("Customer return inventory journal accounts mismatch.");
				if (e.status === "REVERSED") {
					let a = i.journals.journalEntries.find((e) => e.id === t.reversalJournalEntryId);
					if (!a || a.reversedJournalEntryId !== t.id || a.journalDate !== e.reversalDate || a.lines.length !== 2 || !a.lines.some((t) => t.accountId === n.id && t.credit === e.inventoryValue && t.debit === 0) || !a.lines.some((t) => t.accountId === r.id && t.debit === e.inventoryValue && t.credit === 0)) throw Error("Customer return reversal journal mismatch.");
				}
			}
			if (e.inventoryValue && !i.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceType === "CUSTOMER_RETURN" && t.sourceId === e.id && t.totalDebit === e.inventoryValue && t.status === (e.status === "POSTED" ? "POSTED" : "REVERSED"))) throw Error("Customer return inventory journal mismatch.");
		}
		if (new Set(r.returns.map((e) => e.id)).size !== r.returns.length) throw Error("Duplicate customer return ID.");
		for (let e of i.journals.journalEntries) if (e.sourceType === "CUSTOMER_RETURN" && !e.reversedJournalEntryId && !r.returns.some((t) => t.id === e.sourceId && t.journalId === e.id)) throw Error("Orphan customer return journal.");
	}
});
//#endregion
//#region src/features/payroll/data/australianTax.ts
var zu = [
	"Manual",
	"1",
	"2",
	"3",
	"4-resident",
	"4-foreign",
	"5",
	"6"
], Bu = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
], Vu = {
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
function Hu(e, t, n, r) {
	if (!Number.isFinite(e) || e < 0 || e > 1e9) throw Error("Invalid taxable earnings.");
	if (r < "2026-07-01" || r > "2027-06-30") throw Error("Automatic PAYG is available only for pay dates in 2026–27. Use a reviewed manual amount for another year.");
	if (t === "Manual") throw Error("Manual withholding must be entered explicitly.");
	if (t.startsWith("4-")) return Math.floor(Math.floor(e) * (t === "4-resident" ? .47 : .45) + 1e-9);
	let i = Math.round(e * 100);
	n === "Monthly" && i % 100 == 33 && i++;
	let a = n === "Weekly" ? i / 100 : n === "Fortnightly" ? i / 200 : n === "Monthly" ? i * 3 / 1300 : i / 1300, o = Math.floor(a + 1e-9) + .99, s = Vu[t]?.find(([e]) => o < e);
	if (!s) throw Error("Unsupported PAYG scale.");
	let c = Math.max(0, Math.round(s[1] * o - s[2]));
	return n === "Weekly" ? c : n === "Fortnightly" ? c * 2 : n === "Monthly" ? Math.round(c * 13 / 3) : c * 13;
}
//#endregion
//#region src/features/page-previews/catalog.ts
var G = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), K = (e, t, n) => G(e, t, "select", n), Uu = (e, t, n = "0") => ({
	...G(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), Wu = (e, t) => G(e, t, "date", void 0, "2026-10-16"), Gu = (e, t) => ({
	...K(e, t, [
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
}), Ku = [];
function qu(e, t, n, r, i, a, o, s, c) {
	Ku.push({
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
qu("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	G("sku", "SKU"),
	K("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	K("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	Uu("price", "Standard selling price", "49.50"),
	Uu("cost", "Buying cost (sample)", "25"),
	Uu("coverage", "m² per pack", "2.2"),
	K("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	Uu("reorder", "Reorder point", "10"),
	Uu("target", "Target stock", "50"),
	K("buy", "Available for purchasing", ["Yes", "No"]),
	K("sell", "Available for selling", ["Yes", "No"]),
	K("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	G("brand", "Brand"),
	G("category", "Category"),
	G("image", "Image URL (preview only)")
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
]), qu("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	G("product", "Product / SKU"),
	G("customer", "Customer scope"),
	G("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	G("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	Uu("price", "Promotional unit price", "45"),
	K("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	G("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), qu("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	G("code", "Tax code"),
	Uu("rate", "Tax rate (%)", "15"),
	K("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	Gu("collected", "GST collected account"),
	Gu("paid", "GST paid account"),
	G("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), qu("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	K("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	Gu("receivable", "Receivables / payables control"),
	Gu("income", "Income / expense account"),
	Gu("inventory", "Inventory account"),
	Gu("cogs", "Cost of goods sold"),
	Gu("gst", "GST control account"),
	Gu("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), qu("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	G("code", "Job code"),
	G("customer", "Customer"),
	G("owner", "Project owner"),
	Wu("starts", "Start date"),
	Wu("ends", "End date"),
	Uu("budget", "Revenue budget", "10000"),
	Uu("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), qu("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	G("number", "Account number (sample only)"),
	G("bank", "Bank name"),
	K("currency", "Currency", ["NZD", "AUD"]),
	Gu("ledger", "Linked bank GL account"),
	K("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	Wu("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), qu("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	K("match", "Match mode", ["All conditions", "Any condition"]),
	K("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	K("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	G("value", "Match text"),
	Gu("account", "Categorise to account"),
	K("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	K("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), qu("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	K("kind", "Batch type", ["Supplier payments", "Wages"]),
	Wu("payDate", "Payment date"),
	G("bank", "Paying account"),
	G("reference", "Bank reference"),
	K("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	Uu("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), qu("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "payroll.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	G("code", "Pay item code"),
	K("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	K("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	Uu("rate", "Rate / amount", "30"),
	K("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	Gu("expense", "Expense account"),
	Gu("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), qu("filing", "Payroll filing", "Payroll", "/payroll/filing", "payroll.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	G("payrun", "Pay run reference"),
	Wu("payDate", "Pay date"),
	G("employer", "Employer IRD identifier (sample)"),
	K("type", "Submission type", ["Employment information", "Amendment"]),
	G("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), qu("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
	K("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	G("contact", "Customer / supplier"),
	K("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	Wu("next", "Next generation date"),
	Wu("ends", "Schedule end date"),
	Uu("total", "Template amount", "220"),
	K("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), qu("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	G("customer", "Customer / branch"),
	G("owner", "Assigned to"),
	Wu("due", "Due date"),
	K("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	G("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), qu("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
	G("salesperson", "Salesperson"),
	G("customer", "Customer / branch"),
	G("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	G("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	G("outcome", "Visit outcome", "textarea"),
	G("location", "Recorded location")
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
]), qu("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
	K("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	G("company", "Customer / company"),
	G("branch", "Branch"),
	G("email", "Email", "email"),
	G("phone", "Phone"),
	K("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	K("decision", "Review decision", [
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
]), qu("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	K("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	G("subject", "Email subject"),
	G("body", "Email body", "textarea"),
	G("footer", "PDF footer", "textarea"),
	K("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	K("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), qu("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
	K("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	G("columns", "Columns (comma separated)"),
	G("filter", "Filter expression (preview)"),
	K("basis", "Basis", ["Accrual", "Cash"]),
	K("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), qu("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
	G("company", "Company"),
	G("period", "Reporting period"),
	G("reports", "Included reports (comma separated)"),
	G("cover", "Cover heading"),
	G("introduction", "Cover note", "textarea")
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
var Ju = Ku;
[...new Set(Ku.map((e) => e.group))], K("gst", "GST registration", ["Registered", "Not registered"]), K("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), Uu("quoteNext", "Next quote number", "1001"), Uu("orderNext", "Next order number", "1001"), Uu("invoiceNext", "Next invoice number", "1001"), Uu("creditNext", "Next credit number", "1001"), K("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), K("template", "Default template", ["Standard invoice", "Trade invoice"]), K("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), K("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), Uu("next", "Next PO number", "1001"), K("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), Gu("expense", "Default expense account"), K("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), K("remittance", "Remittance preference", ["Preview before sending", "Manual"]), K("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), K("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), Gu("wages", "Wages expense account"), Gu("clearing", "Payroll clearing account"), K("bank", "Paying bank", ["Sample operating account"]), K("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), K("basis", "Default basis", ["Accrual", "Cash"]), K("currency", "Display currency", ["NZD", "AUD"]), K("precision", "Decimal places", ["2", "0"]), K("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), K("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function Yu(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(Ju.map((e) => [e.id, [{
	...Yu(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function Xu(e) {
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
var Zu = [
	"Customer",
	"Branch",
	"Contact"
], Qu = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], $u = {
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
}, ed = l(w(), c([
	w().max(2e3),
	v().finite(),
	_()
]));
function td(e, t) {
	let n = ed.parse(t), r = $u[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var nd = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), rd = (e) => String(e ?? "").trim().toLowerCase(), id = (e) => String(e ?? "").replace(/\D/g, ""), ad = (e, t, n = nd) => !!n(e) && n(e) === n(t);
function od(e, t) {
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
		(ad(r.businessName, e.businessName) || ad(r.businessName, e.tradingName) || ad(r.tradingName, e.businessName) || ad(r.tradingName, e.tradingName)) && t.push("Business/trading name"), ad(r.email, e.email, rd) && t.push("Email"), ad(r.phone, e.phone, id) && t.push("Phone"), ad(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			ad(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && ad([
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
			].join(" ")) && t.push("Address"), ad(r.phone, e.phone, id) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			ad([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), ad(r.email, e.email, rd) && t.push("Email"), (ad(r.phone, e.phone, id) || ad(r.phone, e.mobile, id) || ad(r.mobile, e.phone, id) || ad(r.mobile, e.mobile, id)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function sd(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/data-transfer/transferModel.ts
var cd = [
	"Customers",
	"Suppliers",
	"Customer branches",
	"Customer contacts",
	"Products"
], ld = ["Create", "Update by ID"], ud = "HTT-CSV-1", dd = {
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
}, fd = {
	Customers: $u.Customer,
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
		...$u.Branch
	},
	"Customer contacts": {
		customerId: "",
		...$u.Contact
	},
	Products: dd
}, pd = (e) => [
	"_format",
	"id",
	"recordToken",
	"externalId",
	...Object.keys(fd[e])
], md = {
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
}, hd = a({
	dataset: D(cd),
	mode: D(ld),
	fileName: w().trim().min(1).max(200),
	text: w().max(1e6),
	mapping: l(w(), v().int().nonnegative()).optional()
}).strict();
function gd(e) {
	if (e.text.includes("\0")) throw Error("CSV source must be text without NUL characters.");
	let t = Xu(e.text.replace(/^\uFEFF/, ""));
	if (t.length < 2 || t.length > 501) throw Error("Choose a CSV header and 1–500 data records.");
	let n = t[0].map((e) => e.trim());
	if (n.length > 64 || n.some((e) => !e || e.length > 120) || new Set(n.map((e) => e.toLowerCase())).size !== n.length) throw Error("CSV requires 1–64 distinct, nonempty column names of at most 120 characters.");
	if (t.slice(1).some((e) => e.length !== n.length || e.some((e) => e.length > 1e5))) throw Error("Each CSV record must match the header width; cells may not exceed 100,000 characters.");
	let r = pd(e.dataset), i = e.mapping ?? Object.fromEntries(r.flatMap((e) => {
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
function _d(e) {
	return e.map((e) => e.map((e) => "\"" + (/^[=+@\-'\t\r]/.test(e) ? "'" + e : e).replaceAll("\"", "\"\"") + "\"").join(",")).join("\r\n");
}
//#endregion
//#region src/features/payroll/data/payrollModel.ts
var q = w().trim().min(1).max(200), vd = w().refine((e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !isNaN(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, "Use a valid date."), yd = w().trim().min(3).max(2e3), bd = v().finite().min(0).max(1e9).refine((e) => Math.abs(e * 100 - Math.round(e * 100)) < 1e-5, "Use whole cents."), xd = v().finite().min(0).max(1e5).refine((e) => Math.abs(e * 1e4 - Math.round(e * 1e4)) < 1e-6, "Use at most four decimal places."), Sd = a({
	actorId: q,
	at: Se(),
	action: q,
	reason: yd,
	revision: v().int().positive()
}).strict(), Cd = {
	id: q,
	revision: v().int().positive(),
	history: n(Sd).min(1)
}, wd = a({
	code: w().trim().min(1).max(40),
	name: q,
	position: w().trim().max(200),
	email: o().or(g("")),
	startDate: vd,
	endDate: vd.or(g("")),
	status: D(["Active", "Inactive"]),
	basis: D(["Hourly", "Salary"]),
	rate: bd,
	earningItemId: q,
	taxScale: D(zu).default("Manual"),
	standardTaxConfirmed: _().default(!1),
	superFund: w().trim().max(200).default(""),
	superMemberId: w().trim().max(100).default(""),
	bankAccount: w().trim().max(100),
	taxIdentifier: w().trim().max(100),
	annualOpening: xd,
	personalOpening: xd
}).strict(), Td = wd.extend(Cd).strict(), Ed = a({
	code: w().trim().min(1).max(40),
	name: q,
	category: D([
		"Earnings",
		"Allowance",
		"Deduction",
		"Tax",
		"Employer contribution"
	]),
	method: D([
		"Hourly",
		"Fixed",
		"Percentage"
	]),
	rate: bd,
	taxable: _(),
	accountId: q,
	liabilityAccountId: w().trim().max(200),
	active: _()
}).strict(), Dd = Ed.extend(Cd).strict(), Od = a({
	netAccountId: q,
	taxItemId: q,
	currency: w().regex(/^[A-Z]{3}$/),
	region: g("Australia"),
	frequency: D(Bu).default("Fortnightly"),
	superItemId: q,
	employerName: q,
	employerIdentifier: w().trim().max(100)
}).strict(), kd = Od.extend(Cd).strict(), Ad = a({
	employeeId: q,
	itemId: q,
	date: vd,
	hours: xd.refine((e) => e > 0),
	notes: w().trim().max(1e3)
}).strict(), jd = Ad.extend({
	...Cd,
	status: D([
		"Draft",
		"Submitted",
		"Approved"
	])
}).strict(), Md = a({
	employeeId: q,
	type: D([
		"Annual",
		"Personal",
		"Unpaid"
	]),
	start: vd,
	end: vd,
	hours: xd.refine((e) => e > 0),
	notes: w().trim().max(1e3)
}).strict(), Nd = Md.extend({
	...Cd,
	status: D([
		"Pending",
		"Approved",
		"Declined",
		"Cancelled"
	])
}).strict(), Pd = a({
	employeeId: q,
	itemId: q,
	quantity: xd.refine((e) => e > 0),
	rate: bd
}).strict(), Fd = a({
	name: q,
	start: vd,
	end: vd,
	payDate: vd,
	employeeInputs: n(a({
		employeeId: q,
		withholding: bd,
		additionalWithholding: bd.default(0),
		superMethod: D(["Reviewed amount", "12% reviewed QE"]).default("Reviewed amount"),
		superBase: bd.default(0),
		superAmount: bd.default(0),
		salaryOverride: bd.optional(),
		annualAccrual: xd,
		personalAccrual: xd
	}).strict()).min(1).max(500),
	adjustments: n(Pd).max(2e3),
	taxReviewed: _(),
	reviewReference: w().trim().max(500)
}).strict(), Id = a({
	item: Dd,
	quantity: xd,
	rate: bd,
	amount: bd,
	source: w().max(200)
}).strict(), Ld = a({
	gross: bd,
	taxable: bd,
	deductions: bd,
	net: bd,
	employerCost: bd,
	withholding: bd
}).strict(), Rd = a({
	employee: Td,
	lines: n(Id).min(1),
	timeIds: n(q),
	leaveIds: n(q),
	annualAccrual: xd,
	personalAccrual: xd,
	totals: Ld
}).strict(), zd = Fd.extend({
	...Cd,
	status: D([
		"Draft",
		"Approved",
		"Posted",
		"Reversed",
		"Cancelled"
	]),
	slips: n(Rd).min(1),
	totals: Ld,
	settings: kd,
	sourceToken: q,
	journalId: q.optional(),
	reversalJournalId: q.optional(),
	reversalDate: vd.optional()
}).strict(), Bd = a({
	...Cd,
	operationId: q,
	runId: q,
	accountId: q,
	bankAccountId: q,
	date: vd,
	amount: bd.refine((e) => e > 0),
	reference: w().trim().max(200),
	status: D(["Posted", "Reversed"]),
	journalId: q,
	reversalJournalId: q.optional(),
	reversalDate: vd.optional()
}).strict(), Vd = a({
	...Cd,
	runId: q,
	status: D([
		"Prepared",
		"External reference recorded",
		"Correction needed"
	]),
	reference: w().trim().max(200),
	notes: w().trim().max(1e3),
	runRevision: v().int().positive()
}).strict(), Hd = a({
	employees: n(Td),
	items: n(Dd),
	timesheets: n(jd),
	leave: n(Nd),
	runs: n(zd),
	payments: n(Bd),
	filings: n(Vd),
	settings: n(kd).max(1),
	receipts: n(a({
		operationId: q,
		fingerprint: w().regex(/^[a-f0-9]{64}$/),
		input: l(w(), te()),
		actorId: q,
		entity: D([
			"employees",
			"items",
			"timesheets",
			"leave",
			"runs",
			"payments",
			"filings",
			"settings"
		]),
		recordId: q,
		revision: v().int().positive()
	}).strict())
}).strict(), Ud = () => ({
	employees: [],
	items: [],
	timesheets: [],
	leave: [],
	runs: [],
	payments: [],
	filings: [],
	settings: [],
	receipts: []
}), Wd = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Gd(e) {
	let t = (t) => Wd(e.filter(t).reduce((e, t) => e + t.amount, 0)), n = (e) => ["Earnings", "Allowance"].includes(e.item.category), r = t(n), i = t((e) => ["Deduction", "Tax"].includes(e.item.category));
	return Ld.parse({
		gross: r,
		taxable: t((e) => n(e) && e.item.taxable),
		deductions: i,
		net: Wd(r - i),
		employerCost: t((e) => e.item.category === "Employer contribution"),
		withholding: t((e) => e.item.category === "Tax")
	});
}
function Kd(e) {
	return Ld.parse(Object.fromEntries(Object.keys(Ld.shape).map((t) => [t, Wd(e.reduce((e, n) => e + n.totals[t], 0))])));
}
//#endregion
//#region electron/security/payrollRepository.ts
var J = Ud(), qd = (e) => Array.isArray(e) ? e.map(qd) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, qd(e[t])])) : e, Jd = (e) => be("sha256").update(JSON.stringify(qd(e))).digest("hex"), Yd = {
	operationId: q,
	reason: yd
}, Xd = {
	id: q.optional(),
	expectedRevision: v().int().nonnegative()
};
function Zd(e = "payroll.manage") {
	return j.require(e);
}
function Y(e, t) {
	let n = J[e].find((e) => e.id === t);
	if (!n) throw Error("Payroll record was not found.");
	return n;
}
var Qd = (e) => !["Cancelled", "Reversed"].includes(e.status);
function $d(e, t, n) {
	return J.runs.some((r) => r.id !== n && Qd(r) && r.slips.some((n) => (e === "timesheets" ? n.timeIds : n.leaveIds).includes(t)));
}
function ef(e, t) {
	return J[e] = [...J[e].filter((e) => e.id !== t.id), t], structuredClone(t);
}
function tf(e, t, n) {
	let r = (e?.revision ?? 0) + 1;
	return {
		id: e?.id ?? crypto.randomUUID(),
		revision: r,
		history: [...e?.history ?? [], {
			actorId: Zd("payroll.read").userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			action: t,
			reason: n,
			revision: r
		}]
	};
}
function nf(e, t) {
	if ((e?.revision ?? 0) !== t) throw Error("Payroll record changed. Reload before editing.");
}
function rf(e, t, n) {
	let r = Jd({
		input: e,
		actorId: Zd("payroll.read").userId
	}), i = J.receipts.find((t) => t.operationId === e.operationId);
	if (i) {
		if (i.fingerprint !== r || i.entity !== t) throw Error("Operation ID already has different payroll data.");
		return structuredClone(Y(t, i.recordId));
	}
	let a = n();
	return J.receipts.push({
		operationId: e.operationId,
		fingerprint: r,
		input: structuredClone(e),
		actorId: Zd("payroll.read").userId,
		entity: t,
		recordId: a.id,
		revision: a.revision
	}), Hd.parse(J), a;
}
function af(e, t, n = !0) {
	let r = I.requireById(e);
	if (r.type !== t || n && !r.active || r.systemRole && (t !== "EXPENSE" || r.systemRole !== "OPERATING_EXPENSE")) throw Error(`Use a dedicated ${t.toLowerCase()} payroll account, not a bank, tax, AR/AP or stock control account.`);
	return r;
}
function of(e, t = !0) {
	if (af(e.accountId, [
		"Earnings",
		"Allowance",
		"Employer contribution"
	].includes(e.category) ? "EXPENSE" : "LIABILITY", t), e.category === "Employer contribution") af(e.liabilityAccountId, "LIABILITY", t);
	else if (e.liabilityAccountId) throw Error("Only employer contributions use a second liability account.");
	if (["Earnings", "Allowance"].includes(e.category) && e.method === "Percentage" || e.category === "Tax" && e.method !== "Fixed") throw Error("Earnings use hourly/fixed values; withholding tax is an explicitly reviewed fixed amount.");
	if (e.method === "Percentage" && e.rate > 100) throw Error("Percentage rates cannot exceed 100.");
}
function sf(e) {
	let t = Y("employees", e);
	if (t.status !== "Active") throw Error("Select an active employee.");
	return t;
}
function cf(e, t, n = t) {
	if (t < e.startDate || e.endDate && n > e.endDate) throw Error("Dates must be within the employment period.");
}
function lf(e) {
	let t = sf(e.employeeId);
	cf(t, e.date);
	let n = Y("items", e.itemId);
	if (!n.active || n.category !== "Earnings" || t.basis === "Hourly" && n.method !== "Hourly" || t.basis === "Salary" && n.id !== t.earningItemId) throw Error("Select an appropriate employee earnings item.");
	of(n);
}
function uf(e, t) {
	if (cf(sf(e.employeeId), e.start, e.end), e.start > e.end || e.hours > ((Date.parse(e.end) - Date.parse(e.start)) / 864e5 + 1) * 24) throw Error("Leave dates or hours are invalid.");
	if (J.leave.some((n) => n.id !== t && n.employeeId === e.employeeId && ["Pending", "Approved"].includes(n.status) && n.start <= e.end && n.end >= e.start)) throw Error("Leave request dates overlap.");
}
function df() {
	let e = J.settings[0];
	if (!e) throw Error("Configure payroll settings first.");
	af(e.netAccountId, "LIABILITY");
	let t = Y("items", e.taxItemId);
	if (t.category !== "Tax" || !t.active) throw Error("Select an active fixed withholding item.");
	if (of(t), e.netAccountId === t.accountId) throw Error("Net wages and withholding require separate liability accounts.");
	let n = Y("items", e.superItemId);
	if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Use an active fixed super contribution item.");
	if (of(n), e.currency !== "AUD" || e.currency !== y().currency) throw Error("Payroll currency must match the business currency.");
	return e;
}
function ff(e, t) {
	let n = Y("employees", e), r = n.annualOpening, i = n.personalOpening, a = /* @__PURE__ */ new Set();
	for (let n of J.runs.filter((e) => e.status === "Posted" && e.id !== t)) for (let t of n.slips.filter((t) => t.employee.id === e)) {
		r += t.annualAccrual, i += t.personalAccrual;
		for (let e of t.leaveIds) {
			let t = Y("leave", e);
			a.add(e), t.type === "Annual" && (r -= t.hours), t.type === "Personal" && (i -= t.hours);
		}
	}
	let o = J.leave.filter((t) => t.employeeId === e && t.status === "Approved" && !a.has(t.id));
	return {
		annual: Math.round(r * 1e4) / 1e4,
		personal: Math.round(i * 1e4) / 1e4,
		reservedAnnual: o.filter((e) => e.type === "Annual").reduce((e, t) => e + t.hours, 0),
		reservedPersonal: o.filter((e) => e.type === "Personal").reduce((e, t) => e + t.hours, 0)
	};
}
function pf(e, t) {
	let n = ff(e, t);
	if (n.annual - n.reservedAnnual < -1e-5 || n.personal - n.reservedPersonal < -1e-5) throw Error("Approved leave exceeds the available recorded hours.");
}
var mf = () => Jd({
	employees: J.employees,
	items: J.items,
	timesheets: J.timesheets,
	leave: J.leave,
	settings: J.settings
});
function hf(e, t) {
	if (e.start > e.end || e.payDate < e.end) throw Error("Pay date must follow a valid pay period.");
	let n = df(), r = /* @__PURE__ */ new Set(), i = [];
	for (let a of e.employeeInputs) {
		if (r.has(a.employeeId)) throw Error("Include each employee only once.");
		r.add(a.employeeId);
		let o = sf(a.employeeId);
		if (o.startDate > e.end || o.endDate && o.endDate < e.start) throw Error("Employment does not overlap this pay period.");
		if (o.basis === "Salary" && (o.startDate > e.start || o.endDate && o.endDate < e.end) && a.salaryOverride === void 0) throw Error("Partial-period salary requires a reviewed salary override.");
		if (J.runs.some((n) => n.id !== t && Qd(n) && n.start <= e.end && n.end >= e.start && n.slips.some((e) => e.employee.id === o.id))) throw Error("Employee already has an overlapping pay run. Cancel or reverse it before replacing it.");
		let s = Y("items", o.earningItemId);
		if (!s.active || s.category !== "Earnings" || s.method !== (o.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Employee earning item does not match the pay basis.");
		of(s);
		let c = J.timesheets.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.date >= e.start && t.date <= e.end), l = J.leave.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.start <= e.end && t.end >= e.start);
		if (l.some((t) => t.start < e.start || t.end > e.end)) throw Error("Split leave spanning pay periods before including it in payroll.");
		for (let e of c) lf(e);
		for (let e of l) uf(e, e.id);
		if (c.some((e) => $d("timesheets", e.id, t)) || l.some((e) => $d("leave", e.id, t))) throw Error("Hours or leave are already reserved by another pay run.");
		if (c.some((e) => l.some((t) => e.date >= t.start && e.date <= t.end))) throw Error("Approved timesheet and leave dates overlap; correct them before payroll.");
		if (o.basis === "Salary" && l.some((e) => e.type === "Unpaid") && a.salaryOverride === void 0) throw Error("Salary with unpaid leave requires an explicitly reviewed salary override.");
		if (o.basis === "Hourly" && a.salaryOverride !== void 0) throw Error("Hourly employees cannot use a salary override.");
		let u = [], d = (e, t, n, r) => {
			if (of(e), !e.active) throw Error("Inactive pay item.");
			let i = Wd(t * n);
			bd.parse(i), u.push({
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
			let t = Y("items", e.itemId);
			if (t.category !== "Earnings" || t.method !== "Hourly") throw Error("Timesheet must use hourly earnings.");
			d(t, e.hours, t.id === s.id ? o.rate : t.rate, "Time:" + e.id);
		}
		if (o.basis === "Hourly") for (let e of l.filter((e) => e.type !== "Unpaid")) d(s, e.hours, o.rate, "Leave:" + e.id);
		let f = e.adjustments.filter((e) => e.employeeId === o.id), p = f.filter((e) => Y("items", e.itemId).method !== "Percentage");
		for (let e of p) {
			let t = Y("items", e.itemId);
			if (t.id === n.superItemId) throw Error("Use the employee super guarantee fields for the standard contribution.");
			if (t.category === "Tax") throw Error("Use the explicit employee withholding field for tax.");
			if (t.method === "Fixed" && e.quantity !== 1) throw Error("Fixed pay items require quantity 1.");
			d(t, e.quantity, e.rate, "Adjustment");
		}
		let m = Wd(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
		if (m <= 0) throw Error("Each employee needs positive gross earnings.");
		for (let e of f.filter((e) => Y("items", e.itemId).method === "Percentage")) {
			if (e.quantity !== 1 || e.rate > 100) throw Error("Percentage items require quantity 1 and rate 0–100.");
			d(Y("items", e.itemId), 1, Wd(m * e.rate / 100), "Adjustment"), u[u.length - 1].quantity = 1, u[u.length - 1].rate = e.rate;
		}
		let h = Wd(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category) && e.item.taxable).reduce((e, t) => e + t.amount, 0)), g = a.withholding;
		if (o.taxScale !== "Manual") {
			if (!o.standardTaxConfirmed) throw Error("Confirm the standard PAYG case or use reviewed manual withholding.");
			if (!o.taxScale.startsWith("4-") && !/^\d{8,9}$/.test(o.taxIdentifier.replace(/\s/g, ""))) throw Error("Record a provided eight- or nine-digit TFN for the selected scale.");
			if (a.withholding !== 0) throw Error("Clear manual withholding for an automatic PAYG employee.");
			g = Hu(h, o.taxScale, n.frequency, e.payDate);
		}
		if (g = Wd(g + a.additionalWithholding), d(Y("items", n.taxItemId), 1, g, o.taxScale === "Manual" ? "Reviewed PAYG" : "ATO 2026–27 scale " + o.taxScale), a.superMethod === "12% reviewed QE" && (e.payDate < "2026-07-01" || e.payDate > "2027-06-30" || a.superBase > m)) throw Error("Reviewed qualifying earnings must not exceed gross and the 12% helper is limited to 2026–27. Use a reviewed super amount for exceptions.");
		let _ = a.superMethod === "12% reviewed QE" ? Wd(a.superBase * .12) : a.superAmount;
		d(Y("items", n.superItemId), 1, _, a.superMethod === "12% reviewed QE" ? "SG 12% reviewed QE" : "Reviewed SG amount");
		let v = Gd(u);
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
		totals: Kd(i),
		settings: structuredClone(n),
		sourceToken: mf()
	};
}
function gf(e) {
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
function _f(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of gf(e).filter((e) => e.credit)) t.set(n.accountId, Wd((t.get(n.accountId) ?? 0) + n.credit));
	return [...t].map(([t, n]) => ({
		accountId: t,
		amount: n,
		paid: Wd(J.payments.filter((n) => n.runId === e.id && n.accountId === t && n.status === "Posted").reduce((e, t) => e + t.amount, 0))
	}));
}
b("payroll", {
	repository: {
		balances(e) {
			return Zd("payroll.read"), ff(q.parse(e));
		},
		obligations(e) {
			return Zd("payroll.read"), _f(Y("runs", q.parse(e)));
		},
		setupDefaults(e) {
			Zd(), j.require("accounting.post");
			let t = a(Yd).strict().parse(e);
			return rf(t, "settings", () => {
				if (J.settings.length) throw Error("Payroll is already configured.");
				let e = (e, t, n) => {
					for (; I.getAll().some((t) => t.code === String(e));) e++;
					return I.create({
						code: String(e),
						name: t,
						type: n,
						active: !0,
						allowManualPosting: n === "EXPENSE"
					}).id;
				}, n = e(6e3, "Payroll wages", "EXPENSE"), r = e(6010, "Payroll employer contributions", "EXPENSE"), i = e(2200, "Net wages payable", "LIABILITY"), a = e(2210, "Payroll withholding payable", "LIABILITY"), o = e(2220, "Payroll deductions payable", "LIABILITY"), s = e(2230, "Employer contributions payable", "LIABILITY"), c = (e, n, r, i, a, o = "") => {
					let s = {
						...tf(void 0, "Created", t.reason),
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
					return J.items.push(s), s;
				};
				c("ORD", "Ordinary hours", "Earnings", "Hourly", n), c("SAL", "Salary per run", "Earnings", "Fixed", n);
				let l = c("TAX", "Reviewed withholding", "Tax", "Fixed", a);
				c("ALLOW", "Allowance", "Allowance", "Fixed", n), c("DEDUCT", "Employee deduction", "Deduction", "Fixed", o);
				let u = c("SG", "Super guarantee", "Employer contribution", "Fixed", r, s);
				return ef("settings", {
					...tf(void 0, "Configured", t.reason),
					netAccountId: i,
					taxItemId: l.id,
					currency: y().currency,
					region: "Australia",
					frequency: "Fortnightly",
					superItemId: u.id,
					employerName: y().companyName,
					employerIdentifier: ""
				});
			});
		},
		saveEmployee(e) {
			Zd();
			let t = a({
				...Yd,
				...Xd,
				values: wd
			}).strict().parse(e);
			return rf(t, "employees", () => {
				let e = t.id ? Y("employees", t.id) : void 0;
				if (nf(e, t.expectedRevision), J.employees.some((n) => n.id !== e?.id && n.code.toLowerCase() === t.values.code.toLowerCase())) throw Error("Employee code already exists.");
				if (t.values.endDate && t.values.endDate < t.values.startDate) throw Error("Employment end date is before the start date.");
				let n = Y("items", t.values.earningItemId);
				if (!n.active || n.category !== "Earnings" || n.method !== (t.values.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Select an active earning item matching the pay basis.");
				if (e && J.runs.some((t) => ["Posted", "Reversed"].includes(t.status) && t.slips.some((t) => t.employee.id === e.id)) && (e.annualOpening !== t.values.annualOpening || e.personalOpening !== t.values.personalOpening)) throw Error("Opening leave hours are locked after payroll posting.");
				return ef("employees", {
					...t.values,
					...tf(e, e ? "Edited" : "Created", t.reason)
				});
			});
		},
		saveItem(e) {
			Zd();
			let t = a({
				...Yd,
				...Xd,
				values: Ed
			}).strict().parse(e);
			return rf(t, "items", () => {
				let e = t.id ? Y("items", t.id) : void 0;
				if (nf(e, t.expectedRevision), J.items.some((n) => n.id !== e?.id && n.code.toLowerCase() === t.values.code.toLowerCase())) throw Error("Pay item code already exists.");
				let n = {
					...t.values,
					...tf(e, e ? "Edited" : "Created", t.reason)
				};
				return of(n), ef("items", n);
			});
		},
		saveSettings(e) {
			Zd();
			let t = a({
				...Yd,
				expectedRevision: v().int().nonnegative(),
				values: Od
			}).strict().parse(e);
			return rf(t, "settings", () => {
				let e = J.settings[0];
				nf(e, t.expectedRevision), af(t.values.netAccountId, "LIABILITY");
				let n = Y("items", t.values.superItemId);
				if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Select an active fixed super guarantee item.");
				let r = Y("items", t.values.taxItemId);
				if (r.category !== "Tax" || !r.active || r.accountId === t.values.netAccountId) throw Error("Use a valid withholding item and a separate net wages account.");
				if (t.values.currency !== "AUD" || t.values.currency !== y().currency) throw Error("Payroll currency must match the business.");
				return ef("settings", {
					...t.values,
					...tf(e, "Settings changed", t.reason)
				});
			});
		},
		saveTime(e) {
			Zd();
			let t = a({
				...Yd,
				...Xd,
				values: Ad
			}).strict().parse(e);
			return rf(t, "timesheets", () => {
				let e = t.id ? Y("timesheets", t.id) : void 0;
				if (nf(e, t.expectedRevision), e && (e.status !== "Draft" || $d("timesheets", e.id))) throw Error("Only an unreserved draft timesheet can be edited.");
				lf(t.values);
				let n = sf(t.values.employeeId), r = Y("items", t.values.itemId);
				if (J.timesheets.filter((r) => r.id !== e?.id && r.employeeId === n.id && r.date === t.values.date).reduce((e, t) => e + t.hours, 0) + t.values.hours > 24) throw Error("Total timesheet hours cannot exceed 24 for one employee/day.");
				if (J.timesheets.some((i) => i.id !== e?.id && i.employeeId === n.id && i.itemId === r.id && i.date === t.values.date)) throw Error("A timesheet already exists for this employee, day and item.");
				return ef("timesheets", {
					...t.values,
					...tf(e, e ? "Edited" : "Created", t.reason),
					status: "Draft"
				});
			});
		},
		changeTime(e) {
			let t = a({
				...Yd,
				id: q,
				expectedRevision: v().int().positive(),
				action: D([
					"Submit",
					"Approve",
					"Reopen"
				])
			}).strict().parse(e);
			return Zd(t.action === "Approve" ? "payroll.approve" : "payroll.manage"), rf(t, "timesheets", () => {
				let e = Y("timesheets", t.id);
				if (nf(e, t.expectedRevision), $d("timesheets", e.id)) throw Error("Timesheet is reserved by a pay run.");
				if (t.action === "Submit" && e.status !== "Draft" || t.action === "Approve" && e.status !== "Submitted" || t.action === "Reopen" && e.status === "Draft") throw Error("Invalid timesheet transition.");
				return t.action !== "Reopen" && lf(e), ef("timesheets", {
					...e,
					...tf(e, t.action, t.reason),
					status: t.action === "Submit" ? "Submitted" : t.action === "Approve" ? "Approved" : "Draft"
				});
			});
		},
		saveLeave(e) {
			Zd();
			let t = a({
				...Yd,
				...Xd,
				values: Md
			}).strict().parse(e);
			return rf(t, "leave", () => {
				let e = t.id ? Y("leave", t.id) : void 0;
				if (nf(e, t.expectedRevision), e && (e.status !== "Pending" || $d("leave", e.id))) throw Error("Only an unreserved pending leave request can be edited.");
				return uf(t.values, e?.id), ef("leave", {
					...t.values,
					...tf(e, e ? "Edited" : "Created", t.reason),
					status: "Pending"
				});
			});
		},
		changeLeave(e) {
			let t = a({
				...Yd,
				id: q,
				expectedRevision: v().int().positive(),
				action: D([
					"Approve",
					"Decline",
					"Cancel",
					"Reopen"
				])
			}).strict().parse(e);
			return Zd(t.action === "Approve" || t.action === "Decline" ? "payroll.approve" : "payroll.manage"), rf(t, "leave", () => {
				let e = Y("leave", t.id);
				if (nf(e, t.expectedRevision), $d("leave", e.id)) throw Error("Leave is reserved by a pay run.");
				if (["Approve", "Decline"].includes(t.action) && e.status !== "Pending" || t.action === "Cancel" && ["Cancelled", "Declined"].includes(e.status) || t.action === "Reopen" && !["Cancelled", "Declined"].includes(e.status)) throw Error("Invalid leave transition.");
				(t.action === "Approve" || t.action === "Reopen") && uf(e, e.id);
				let n = ef("leave", {
					...e,
					...tf(e, t.action, t.reason),
					status: t.action === "Approve" ? "Approved" : t.action === "Decline" ? "Declined" : t.action === "Cancel" ? "Cancelled" : "Pending"
				});
				return n.status === "Approved" && pf(e.employeeId), n;
			});
		},
		saveRun(e) {
			Zd();
			let t = a({
				...Yd,
				...Xd,
				values: Fd
			}).strict().parse(e);
			return rf(t, "runs", () => {
				let e = t.id ? Y("runs", t.id) : void 0;
				if (nf(e, t.expectedRevision), e && e.status !== "Draft") throw Error("Only a draft pay run can be recalculated.");
				let n = hf(t.values, e?.id);
				return ef("runs", {
					...t.values,
					...tf(e, e ? "Recalculated" : "Created", t.reason),
					...n,
					status: "Draft"
				});
			});
		},
		changeRun(e) {
			let t = a({
				...Yd,
				id: q,
				expectedRevision: v().int().positive(),
				action: D([
					"Approve",
					"Reopen",
					"Cancel",
					"Post",
					"Reverse"
				]),
				date: vd.optional()
			}).strict().parse(e);
			return Zd(t.action === "Approve" ? "payroll.approve" : ["Post", "Reverse"].includes(t.action) ? "payroll.post" : "payroll.manage"), rf(t, "runs", () => {
				let e = Y("runs", t.id);
				if (nf(e, t.expectedRevision), t.action === "Approve" || t.action === "Post") {
					if (e.status !== (t.action === "Approve" ? "Draft" : "Approved")) throw Error("Invalid pay-run transition.");
					if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Confirm reviewed withholding and provide its reference.");
					if (e.sourceToken !== mf()) throw Error("Payroll sources changed. Reopen and recalculate the run.");
					if (Jd(hf(Fd.parse(Object.fromEntries(Object.keys(Fd.shape).map((t) => [t, e[t]]))), e.id).slips) !== Jd(e.slips)) throw Error("Payroll calculation changed. Recalculate the run.");
				}
				if (t.action === "Approve") return ef("runs", {
					...e,
					...tf(e, "Approved", t.reason),
					status: "Approved"
				});
				if (t.action === "Reopen") {
					if (e.status !== "Approved") throw Error("Only an approved run can be reopened.");
					return ef("runs", {
						...e,
						...tf(e, "Reopened", t.reason),
						status: "Draft",
						taxReviewed: !1
					});
				}
				if (t.action === "Cancel") {
					if (!["Draft", "Approved"].includes(e.status)) throw Error("Only an unposted run can be cancelled.");
					return ef("runs", {
						...e,
						...tf(e, "Cancelled", t.reason),
						status: "Cancelled"
					});
				}
				if (P(), t.action === "Post") {
					let n = L.post({
						journalDate: e.payDate,
						description: "Payroll " + e.name,
						reference: e.id,
						sourceType: "PAYROLL",
						sourceId: e.id,
						lines: gf(e)
					}), r = ef("runs", {
						...e,
						...tf(e, "Posted", t.reason),
						status: "Posted",
						journalId: n.id
					});
					return e.slips.forEach((e) => pf(e.employee.id)), r;
				}
				if (e.status !== "Posted" || !t.date || t.date < e.payDate) throw Error("Reverse a posted run on or after its pay date.");
				if (J.payments.some((t) => t.runId === e.id && t.status === "Posted")) throw Error("Reverse recorded payroll payments before reversing the run.");
				let n = L.reverse({
					journalEntryId: e.journalId,
					reversalDate: t.date,
					reason: t.reason
				}), r = ef("runs", {
					...e,
					...tf(e, "Reversed", t.reason),
					status: "Reversed",
					reversalJournalId: n.id,
					reversalDate: t.date
				});
				e.slips.forEach((e) => pf(e.employee.id));
				for (let n of J.filings.filter((t) => t.runId === e.id)) ef("filings", {
					...n,
					...tf(n, "Correction needed", t.reason),
					status: "Correction needed"
				});
				return r;
			});
		},
		recordPayment(e) {
			Zd("payroll.post"), j.require("banking.write");
			let t = a({
				...Yd,
				runId: q,
				accountId: q,
				bankAccountId: q,
				date: vd,
				amount: bd.refine((e) => e > 0),
				reference: w().trim().max(200)
			}).strict().parse(e);
			return rf(t, "payments", () => {
				P();
				let e = Y("runs", t.runId);
				if (e.status !== "Posted" || t.date < e.payDate) throw Error("Record payment against a posted run on or after pay date.");
				let n = _f(e).find((e) => e.accountId === t.accountId);
				if (!n || t.amount > Wd(n.amount - n.paid)) throw Error("Payment exceeds the outstanding payroll liability.");
				af(t.accountId, "LIABILITY");
				let r = Ar.requireById(t.bankAccountId), i = I.requireById(r.glAccountId);
				if (!r.active || !i.active || i.type !== "ASSET" || r.currency !== e.settings.currency || t.date < r.openingBalanceDate) throw Error("Use an active bank in the payroll currency with a valid posting date.");
				let a = tf(void 0, "Payment recorded", t.reason), o = L.post({
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
				return ef("payments", {
					...c,
					...a,
					status: "Posted",
					journalId: o.id
				});
			});
		},
		reversePayment(e) {
			Zd("payroll.post"), j.require("banking.write");
			let t = a({
				...Yd,
				id: q,
				expectedRevision: v().int().positive(),
				date: vd
			}).strict().parse(e);
			return rf(t, "payments", () => {
				P();
				let e = Y("payments", t.id);
				if (nf(e, t.expectedRevision), e.status !== "Posted" || t.date < e.date) throw Error("Reverse a posted payment on or after its date.");
				Ct("PAYROLL_PAYMENT", e.id);
				let n = L.reverse({
					journalEntryId: e.journalId,
					reversalDate: t.date,
					reason: t.reason
				});
				return ef("payments", {
					...e,
					...tf(e, "Payment reversed", t.reason),
					status: "Reversed",
					reversalJournalId: n.id,
					reversalDate: t.date
				});
			});
		},
		recordFiling(e) {
			Zd();
			let t = a({
				...Yd,
				runId: q,
				expectedRevision: v().int().nonnegative(),
				reference: w().trim().max(200),
				notes: w().trim().max(1e3)
			}).strict().parse(e);
			return rf(t, "filings", () => {
				let e = Y("runs", t.runId);
				if (e.status !== "Posted") throw Error("Prepare filing review only for a posted run.");
				let n = J.filings.find((t) => t.runId === e.id);
				return nf(n, t.expectedRevision), ef("filings", {
					...tf(n, "Filing review recorded", t.reason),
					runId: e.id,
					runRevision: e.revision,
					reference: t.reference,
					notes: t.notes,
					status: t.reference ? "External reference recorded" : "Prepared"
				});
			});
		},
		exportSlip(e) {
			Zd("payroll.read");
			let t = a({
				runId: q,
				employeeId: q
			}).strict().parse(e), n = Y("runs", t.runId), r = n.slips.find((e) => e.employee.id === t.employeeId);
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
			Zd("payroll.read");
			let t = Y("runs", q.parse(e)), n = [[
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
				String(Wd(e.totals.deductions - e.totals.withholding)),
				String(e.totals.net),
				String(e.totals.employerCost),
				t.reviewReference
			])];
			return {
				name: "Payroll-review-" + t.id + ".csv",
				csv: _d(n)
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
	snapshot: () => J,
	restore: (e) => {
		J = e;
	},
	publish: () => {},
	validate: (e, t) => {
		let n = Hd.parse(e), r = t, i = r.accounts.accounts, a = r.journals.journalEntries, o = r.bankAccounts.bankAccounts, s = (e, t) => {
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
				t.set(n.accountId, [Wd(e[0] + n.debit), Wd(e[1] + n.credit)]);
			}
			return [...t].filter(([, e]) => e[0] || e[1]).sort(([e], [t]) => e.localeCompare(t));
		};
		function d(e, t, n, r, i, o, s, c) {
			let l = a.find((t) => t.id === e);
			if (!l || l.sourceType !== t || l.sourceId !== n || l.journalDate !== r || Jd(u(l.lines)) !== Jd(u(i)) || l.status !== (o ? "REVERSED" : "POSTED")) throw Error("Payroll source journal mismatch.");
			if (o) {
				let e = a.find((e) => e.id === s);
				if (!e || e.reversedJournalEntryId !== l.id || l.reversalJournalEntryId !== e.id || e.journalDate !== c || Jd(u(e.lines)) !== Jd(u(i.map((e) => ({
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
				let i = Wd(t.lines.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
				for (let e of t.lines) {
					s("items", e.item.id), c(e.item.accountId, [
						"Earnings",
						"Allowance",
						"Employer contribution"
					].includes(e.item.category) ? "EXPENSE" : "LIABILITY"), e.item.category === "Employer contribution" && c(e.item.liabilityAccountId, "LIABILITY");
					let t = e.item.method === "Percentage" ? Wd(i * e.rate / 100) : Wd(e.quantity * e.rate);
					if (e.amount !== t) throw Error("Payroll line calculation mismatch.");
				}
				if (t.employee.taxScale !== "Manual" && (!t.employee.standardTaxConfirmed || r.withholding !== 0)) throw Error("Automatic PAYG declaration mismatch.");
				let a = t.lines.filter((t) => t.item.id === e.settings.superItemId), o = t.lines.filter((e) => e.item.category === "Tax");
				if (a.length !== 1 || a[0].amount !== (r.superMethod === "12% reviewed QE" ? Wd(r.superBase * .12) : r.superAmount) || o.length !== 1 || o[0].item.id !== e.settings.taxItemId || new Set(t.timeIds).size !== t.timeIds.length || new Set(t.leaveIds).size !== t.leaveIds.length) throw Error("Payroll tax, super or source snapshot mismatch.");
				let l = Wd((t.employee.taxScale === "Manual" ? r.withholding : Hu(t.totals.taxable, t.employee.taxScale, e.settings.frequency, e.payDate)) + r.additionalWithholding);
				if (Jd(Gd(t.lines)) !== Jd(t.totals) || t.totals.withholding !== l) throw Error("Payroll payslip totals mismatch.");
				for (let [n, r] of [["timesheets", t.timeIds], ["leave", t.leaveIds]]) for (let i of r) {
					let r = s(n, i);
					if (r.employeeId !== t.employee.id) throw Error("Payroll hours belong to another employee.");
					if (Qd(e)) {
						if (f.has(i) || r.status !== "Approved") throw Error("Payroll source is reused or unapproved.");
						let a = n === "timesheets" ? r.date : r.start, o = n === "timesheets" ? r.date : r.end;
						if (cf(t.employee, a, o), a < e.start || o > e.end) throw Error("Payroll source dates are outside the pay period.");
						let s = n === "timesheets" ? "Time:" : "Leave:", c = t.employee.basis === "Hourly" && (n === "timesheets" || r.type !== "Unpaid"), l = t.lines.filter((e) => e.source === s + i);
						if (c ? l.length !== 1 || l[0].quantity !== r.hours || l[0].item.id !== (n === "timesheets" ? r.itemId : t.employee.earningItemId) : l.length !== 0) throw Error("Payroll source hours do not match the frozen payslip.");
						f.add(i);
					}
				}
			}
			if (Jd(Kd(e.slips)) !== Jd(e.totals)) throw Error("Payroll run totals mismatch.");
			if (["Posted", "Reversed"].includes(e.status)) {
				if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Posted payroll has no withholding review.");
				d(e.journalId, "PAYROLL", e.id, e.payDate, gf(e), e.status === "Reversed", e.reversalJournalId, e.reversalDate);
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
			for (let n of gf(e).filter((e) => e.credit)) t.set(n.accountId, Wd((t.get(n.accountId) ?? 0) + n.credit));
			for (let [r, i] of t) if (Wd(n.payments.filter((t) => t.runId === e.id && t.accountId === r && t.status === "Posted").reduce((e, t) => e + t.amount, 0)) > i) throw Error("Payroll liabilities are overpaid.");
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
			if (p.add(e.operationId), e.input.operationId !== e.operationId || Jd({
				input: e.input,
				actorId: e.actorId
			}) !== e.fingerprint) throw Error("Invalid payroll operation fingerprint.");
			if (s(e.entity, e.recordId).revision < e.revision) throw Error("Invalid payroll operation revision.");
		}
	}
});
//#endregion
//#region electron/security/documentRecycleRepository.ts
var vf = w().trim().min(1).max(200), yf = w().regex(/^[a-f0-9]{64}$/), bf = (e) => Array.isArray(e) ? e.map(bf) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, bf(e[t])])) : e, xf = (e) => be("sha256").update(JSON.stringify(bf(e))).digest("hex"), Sf = (e) => e === "Purchase order" || e === "Expense bill draft" ? "purchases.read" : "sales.read", Cf = (e) => e === "Quote" ? "sales.write" : e === "Purchase order" ? "purchases.write" : e === "Expense bill draft" ? "purchases.bill" : "sales.manage";
function wf(e, t) {
	let [n, r] = ge[e];
	return (t[n]?.[r] ?? []).filter((t) => e === "Sales order draft" ? t.kind === "ORDER" : e !== "Invoice draft" || t.kind === "INVOICE");
}
function Tf(e, t, n) {
	let r = wf(e, n).find((e) => e.id === t);
	if (!r) throw Error("Document was not found in the selected dataset.");
	return r;
}
function Ef(e, t, n) {
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
function Df(t, n = E()) {
	return p.filter((e) => i(t, Sf(e))).flatMap((r) => wf(r, n).map((a) => {
		let o = e().findLast((e) => e.recordId === a.id), s = r === "Purchase order" || r === "Expense bill draft", c = s ? a.supplierId ?? a.payload?.supplierId : a.customerId ?? a.payload?.customerId;
		return {
			kind: r,
			party: (s ? n.suppliers?.suppliers : n.customers?.customers)?.find((e) => e.id === c)?.businessName ?? c ?? "",
			reference: a.customerReference ?? a.payload?.customerReference ?? a.payload?.supplierInvoiceNumber ?? a.supplierReference ?? "",
			recordId: a.id,
			label: a.documentNumber ?? a.purchaseOrderNumber ?? `${a.kind} · ${a.id}`,
			date: a.documentDate ?? a.orderDate ?? a.payload?.documentDate ?? "",
			status: a.status,
			total: a.totals.total,
			token: xf({
				record: a,
				lifecycle: o?.id ?? ""
			}),
			deleted: o?.action === "Trashed",
			last: o,
			canWrite: i(t, Cf(r)),
			issues: Ef(r, a, n)
		};
	}));
}
var Of = a({
	operationId: vf,
	action: D(["Trashed", "Recovered"]),
	reason: w().trim().min(3).max(2e3),
	records: n(a({
		kind: D(p),
		recordId: vf,
		token: yf
	}).strict()).min(1).max(100)
}).strict(), kf = a({
	id: vf,
	operationId: vf,
	fingerprint: yf,
	kind: D(p),
	recordId: vf,
	action: D(["Trashed", "Recovered"]),
	actorId: vf,
	at: Se(),
	reason: w().trim().min(3).max(2e3),
	recordToken: yf,
	contentToken: yf
}).strict();
b("documentRecycle", {
	repository: {
		list() {
			return Df(j.require("inventory.read"));
		},
		detail(e, t) {
			return e = D(p).parse(e), j.require("inventory.read"), j.require(Sf(e)), structuredClone(Tf(e, vf.parse(t), E()));
		},
		change(t) {
			let n = Of.parse(t), r = j.require("inventory.read");
			n.records.forEach((e) => {
				j.require(Sf(e.kind)), j.require(Cf(e.kind));
			});
			let i = xf({
				input: n,
				actorId: r.userId
			}), a = e().filter((e) => e.operationId === n.operationId);
			if (a.length) {
				if (a[0].fingerprint !== i) throw Error("Operation ID has different recycle data.");
				return structuredClone(a);
			}
			let o = E(), s = /* @__PURE__ */ new Set();
			for (let t of n.records) {
				if (s.has(t.recordId)) throw Error("Select each document only once.");
				s.add(t.recordId);
				let r = Tf(t.kind, t.recordId, o);
				if (xf({
					record: r,
					lifecycle: e().findLast((e) => e.recordId === t.recordId)?.id ?? ""
				}) !== t.token) throw Error("Document changed. Refresh and review the selection again.");
				if (ne(t.recordId) !== (n.action === "Recovered")) throw Error("Document recycle state changed. Refresh the selection.");
				let i = Ef(t.kind, r, o);
				if (i.length) throw Error(i.join(" "));
			}
			let c = (/* @__PURE__ */ new Date()).toISOString(), l = n.records.map((e) => ({
				id: crypto.randomUUID(),
				operationId: n.operationId,
				fingerprint: i,
				kind: e.kind,
				recordId: e.recordId,
				action: n.action,
				actorId: r.userId,
				at: c,
				reason: n.reason,
				recordToken: e.token,
				contentToken: xf(Tf(e.kind, e.recordId, o))
			}));
			return ae([...e(), ...l]), structuredClone(l);
		}
	},
	read: "inventory.read",
	commands: {
		list: "inventory.read",
		detail: "inventory.read",
		change: "inventory.read"
	},
	snapshot: () => ({ history: e() }),
	restore: (e) => ae(e.history),
	publish: () => {},
	view: (t) => ({ history: e().filter((e) => i(t, Sf(e.kind))) }),
	validate: (e, t) => {
		let { history: r } = a({ history: n(kf) }).strict().parse(e), i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
		for (let e of r) {
			if (i.has(e.id)) throw Error("Duplicate recycle event.");
			i.add(e.id);
			let n = Tf(e.kind, e.recordId, t);
			if ((o.get(e.recordId) ?? "Recovered") === e.action) throw Error("Invalid recycle lifecycle sequence.");
			if (!r.slice(r.indexOf(e) + 1).some((t) => t.recordId === e.recordId) && e.action === "Trashed" && (Ef(e.kind, n, t).length || xf(n) !== e.contentToken)) throw Error("Recycled document content or references changed.");
			o.set(e.recordId, e.action), s.set(e.operationId, [...s.get(e.operationId) ?? [], e]);
		}
		for (let e of s.values()) {
			let t = e[0], n = e.map((e) => ({
				kind: e.kind,
				recordId: e.recordId,
				token: e.recordToken
			}));
			if (new Set(n.map((e) => e.recordId)).size !== n.length || e.some((e) => e.fingerprint !== t.fingerprint || e.action !== t.action || e.actorId !== t.actorId || e.at !== t.at || e.reason !== t.reason) || xf({
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
var Af = ["ACTIVE", "INACTIVE"], jf = w().trim().refine((e) => e === "" || w().email().safeParse(e).success, { message: "Enter a valid email address" }), Mf = w().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Nf = a({
	businessName: w().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: w().trim().max(120, "Trading name is too long"),
	abn: Mf,
	status: D(Af),
	email: jf,
	phone: w().trim().max(40, "Phone number is too long"),
	website: w().trim().max(200, "Website is too long"),
	contactName: w().trim().max(120, "Contact name is too long"),
	addressLine1: w().trim().max(160, "Address is too long"),
	addressLine2: w().trim().max(160, "Address is too long"),
	suburb: w().trim().max(100, "Suburb is too long"),
	state: w().trim().max(50, "State is too long"),
	postcode: w().trim().max(20, "Postcode is too long"),
	country: w().trim().min(1, "Country is required").max(100, "Country is too long"),
	paymentTermsDays: v({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days"),
	taxRegistered: _(),
	notes: w().trim().max(2e3, "Notes are too long")
}), Pf = a({
	id: w().min(1),
	code: D([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET",
		"HOUR",
		"JOB"
	]),
	name: w().trim().min(1),
	symbol: w().min(1),
	conversionToBase: v().finite().positive(),
	basePrice: v().finite().nonnegative(),
	isBaseUnit: _(),
	active: _()
}).strict(), Ff = a({
	id: w().min(1),
	sku: w().trim().min(1).max(80),
	name: w().trim().min(1).max(180),
	category: D([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: w().optional(),
	collection: w().optional(),
	description: w().optional(),
	status: D(["ACTIVE", "INACTIVE"]),
	baseUnitId: w().min(1),
	units: n(Pf).min(1),
	createdAt: w(),
	updatedAt: w(),
	revision: v().int().nonnegative().optional(),
	itemType: D([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: _().optional(),
	sellEnabled: _().optional(),
	reorderPoint: v().finite().nonnegative().optional(),
	targetStock: v().finite().nonnegative().optional(),
	wholePacks: _().optional(),
	taxCode: w().min(1).optional()
}).strict(), If = /* @__PURE__ */ new Set(), Lf = [...Ye];
function Rf() {
	Lf = [...Ye], If.forEach((e) => e());
}
function zf(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => zf(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => zf(e, t, n));
}
function Bf(e) {
	let t = n(Ff).parse(e), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (r.has(e.id) || i.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (r.add(e.id), i.add(e.sku.toLowerCase()), !Ke(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!Ke(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (Ke(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
var Vf = {
	subscribe(e) {
		return If.add(e), () => {
			If.delete(e);
		};
	},
	getSnapshot: () => Lf,
	getAll: () => Ye,
	getById: (e) => Ye.find((t) => t.id === e),
	save(e, t) {
		let n = Ff.parse(e), r = Ye.find((e) => e.id === n.id);
		if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
		if (!r && t !== void 0) throw Error("Product no longer exists.");
		if (se(n.taxCode ?? "GST"), !Ke(n) && n.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
		let i = E();
		if (delete i.products, r) {
			let e = { ...i };
			if (delete e.costingPolicies, (r.itemType ?? "STOCK") !== (n.itemType ?? "STOCK") && zf(e, n.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
			if (r.baseUnitId !== n.baseUnitId && zf(i, n.id)) throw Error("A referenced product cannot change base unit.");
			for (let e of r.units) {
				let t = n.units.find((t) => t.id === e.id);
				if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && zf(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
			}
		}
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...n,
			createdAt: r?.createdAt ?? a,
			updatedAt: a,
			revision: (r?.revision ?? 0) + 1
		};
		return Bf([...Ye.filter((e) => e.id !== n.id), o]), r ? Ye.splice(Ye.indexOf(r), 1, o) : Ye.push(o), Ca.ensureProductPolicy(o.id, o.baseUnitId, Ke(o)), r && Ke(r) !== Ke(o) && Ca.setActive(o.id, Ke(o)), Rf(), o;
	}
};
b("products", {
	validate: (e, t) => {
		let n = Bf(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !Ke(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: Vf,
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(Ye) }),
	restore: (e) => {
		let t = Bf(e.products);
		Ye.splice(0, Ye.length, ...t), Lf = [...Ye];
	},
	publish: Rf
});
//#endregion
//#region electron/security/transferRepository.ts
var Hf = w().trim().min(1).max(200), Uf = w().trim().min(1).max(2e3), Wf = (e) => Array.isArray(e) ? e.map(Wf) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e < t ? -1 : +(e > t)).map(([e, t]) => [e, Wf(t)])) : e, Gf = (e) => be("sha256").update(JSON.stringify(Wf(e))).digest("hex"), Kf = [], qf = (e, t = !1) => {
	j.require("inventory.read");
	let n = j.require(md[e].read);
	return t && j.require(md[e].write), n.userId;
};
function Jf(e) {
	return e === "Customers" ? M.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Suppliers" ? Di.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Products" ? Vf.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : M.getAll().flatMap((t) => (e === "Customer branches" ? t.locations : t.contacts).map((e) => ({
		id: e.id,
		parentId: t.id,
		raw: e
	})));
}
function Yf(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(fd[e])) n[r] = String(t.raw[r] ?? i);
	if ((e === "Customer branches" || e === "Customer contacts") && (n.customerId = t.parentId), e === "Products") {
		let e = t.raw;
		n.taxCode = e.taxCode ?? "", n.itemType = e.itemType ?? "STOCK", n.buyEnabled = String(e.buyEnabled ?? (e.itemType === void 0 || e.itemType === "STOCK")), n.baseUnitCode = e.units.find((t) => t.id === e.baseUnitId).code, n.unitsJson = JSON.stringify(e.units);
	}
	return n;
}
function Xf(e, t) {
	return {
		_format: ud,
		id: t.id,
		recordToken: Gf({
			parentId: t.parentId,
			record: t.raw
		}),
		externalId: Kf.filter((t) => t.dataset === e).flatMap((e) => e.results).find((e) => e.action === "Created" && e.recordId === t.id)?.externalId ?? "",
		...Yf(e, t)
	};
}
function Zf(e, t) {
	if (!/^-?\d+(?:\.\d+)?$/.test(e) || !Number.isFinite(Number(e)) || Math.abs(Number(e)) > 2 ** 53 - 1) throw Error(`${t} must contain a safe plain number.`);
	return Number(e);
}
function Qf(e, t, n) {
	let r = n ? Yf(e, n) : { ...fd[e] };
	for (let n of Object.keys(fd[e])) if (Object.hasOwn(t, n)) {
		let i = t[n].trim();
		if (typeof fd[e][n] == "number") r[n] = Zf(i, n);
		else if (typeof fd[e][n] == "boolean") {
			if (!["true", "false"].includes(i)) throw Error(`${n} must be true or false.`);
			r[n] = i === "true";
		} else r[n] = i.trim();
	}
	if (n) for (let [n, i] of Object.entries(fd[e])) Object.hasOwn(t, n) || (typeof i == "number" && (r[n] = Number(r[n])), typeof i == "boolean" && (r[n] = r[n] === "true"));
	return r;
}
var $f = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), ep = (e, t) => e.some((e) => e.reasons.some((n) => !t.some((t) => t.id === e.id && t.reasons.includes(n))));
function tp(e, t) {
	return t.map((t) => ({
		id: t.id,
		reasons: [
			...$f(t.businessName) === $f(e.businessName) ? ["Name"] : [],
			...e.email && t.email?.toLowerCase() === e.email.toLowerCase() ? ["Email"] : [],
			...e.abn && $f(t.abn) === $f(e.abn) ? ["Identifier"] : []
		]
	})).filter((e) => e.reasons.length);
}
function np(e, t, r, i = !1) {
	let o = r.id ? Jf(e).find((e) => e.id === r.id) : void 0;
	if (t === "Update by ID") {
		if (!o) throw Error("Existing record ID was not found.");
		if (!i && (!r.recordToken || r.recordToken !== Xf(e, o).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
	} else if (r.id || r.recordToken) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
	if (t === "Update by ID" && r.externalId && r.externalId !== Xf(e, o).externalId) throw Error("External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.");
	let s = t === "Update by ID" ? o : void 0, c = s ? Xf(e, s) : null, l = Qf(e, r, s), u;
	if (e === "Customers") {
		let e = at.strict().parse(l), t = M.getAll().filter((e) => e.id !== s?.id);
		if (ep(od({
			kind: "Customer",
			customerId: "",
			values: e
		}, t), s ? od({
			kind: "Customer",
			customerId: "",
			values: s.raw
		}, t) : [])) throw Error("Possible existing customer duplicate. Use the customer review workflow or explicit ID update.");
		u = s ? M.update(s.id, e) : M.create(e);
	} else if (e === "Suppliers") {
		let e = Nf.strict().parse(l), t = Di.getAll().filter((e) => e.id !== s?.id);
		if (ep(tp(e, t), s ? tp(s.raw, t) : [])) throw Error("Possible existing supplier duplicate. Resolve it before import.");
		u = s ? Di.update(s.id, e) : Di.create(e);
	} else if (e === "Products") {
		let e = n(a({
			id: w().max(200).optional(),
			code: D([
				"M2",
				"LM",
				"BOX",
				"PIECE",
				"ROLL",
				"BUCKET",
				"HOUR",
				"JOB"
			]),
			name: w().trim().min(1).max(120),
			symbol: w().min(1).max(40),
			conversionToBase: v().finite().positive(),
			basePrice: v().finite().nonnegative(),
			isBaseUnit: _(),
			active: _()
		}).strict()).min(1).max(100).parse(JSON.parse(String(l.unitsJson))), t = s?.raw, i = e.map((e) => {
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
		}), o = i.find((e) => e.code === l.baseUnitCode && e.isBaseUnit);
		if (!o) throw Error("baseUnitCode must identify the primary product unit.");
		let { unitsJson: c, baseUnitCode: d, ...f } = l, p = (/* @__PURE__ */ new Date()).toISOString();
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
		]) !Object.hasOwn(r, e) && t[e] === void 0 && delete f[e];
		let m = Ff.parse({
			...f,
			id: s?.id ?? crypto.randomUUID(),
			baseUnitId: o.id,
			units: i,
			createdAt: t?.createdAt ?? p,
			updatedAt: p
		});
		u = Vf.save(m, t?.revision ?? (s ? 0 : void 0));
	} else {
		let t = String(l.customerId), n = M.getById(t);
		if (!n || n.status === "INACTIVE") throw Error("Select an existing, non-inactive parent customer.");
		if (s && s.parentId !== t) throw Error("Existing branch/contact cannot move to a different customer.");
		let { customerId: r, ...i } = l, a = e === "Customer branches" ? "Branch" : "Contact", o = a === "Branch" ? ot.strict().parse(i) : st.strict().parse(i);
		if (ep(od({
			kind: a,
			customerId: t,
			values: o
		}, [n]).filter((e) => e.id !== s?.id), s ? od({
			kind: a,
			customerId: t,
			values: s.raw
		}, [n]).filter((e) => e.id !== s.id) : [])) throw Error("Possible existing branch/contact duplicate. Use customer review or explicit ID update.");
		u = a === "Branch" ? s ? M.updateLocation(t, s.id, o) : M.addLocation(t, o) : s ? M.updateContact(t, s.id, o) : M.addContact(t, o);
	}
	let d = Jf(e).find((e) => e.id === u.id);
	return {
		recordId: u.id,
		before: c,
		after: Xf(e, d)
	};
}
function rp(e) {
	if (qf(e.dataset, !0), Buffer.byteLength(e.text, "utf8") > 1e6) throw Error("CSV source exceeds 1 MB of UTF-8 text.");
	let t = gd(e), n = new Map(Jf(e.dataset).map((t) => [t.id, Xf(e.dataset, t)])), r = E(), i = Gf({
		input: e,
		master: r
	}), a = /* @__PURE__ */ new Set(), o = [], s = [];
	try {
		for (let r of t.rows) {
			let t = r.values, i = (t.externalId ?? "").trim(), c = Gf({
				dataset: e.dataset,
				values: Object.fromEntries(Object.keys(fd[e.dataset]).filter((e) => Object.hasOwn(t, e)).map((e) => [e, t[e]]))
			}), l = e.mode === "Create" ? i : t.id, u = "", d;
			try {
				if (!l) throw Error(e.mode === "Create" ? "externalId is required for safe create retries." : "id is required for explicit updates.");
				if (l.length > 200 || i.length > 200) throw Error("Import identity exceeds 200 characters.");
				if (a.has(l)) throw Error("Repeated identity in this CSV file.");
				if (a.add(l), e.mode === "Create" && (t.id || t.recordToken)) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
				if (e.mode === "Update by ID" && (!n.has(t.id) || t.recordToken !== n.get(t.id).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
				let s = e.mode === "Create" ? Kf.filter((t) => t.dataset === e.dataset).flatMap((e) => e.results).find((e) => e.action === "Created" && e.externalId === i) : void 0;
				if (s) {
					if (s.identityFingerprint !== c) throw Error("Source externalId already contains different creation data. Use an explicit ID update.");
					let t = Jf(e.dataset).find((e) => e.id === s.recordId);
					if (!t) throw Error("Prior imported record is missing.");
					d = {
						row: r.row,
						externalId: i,
						recordId: t.id,
						action: "Skipped",
						identityFingerprint: c,
						before: null,
						after: Xf(e.dataset, t)
					};
				} else {
					let a = np(e.dataset, e.mode, t, !0);
					e.mode === "Update by ID" && (a.before = n.get(t.id)), d = {
						row: r.row,
						externalId: i,
						action: e.mode === "Create" ? "Created" : "Updated",
						identityFingerprint: c,
						...a
					};
				}
				o.push(d);
			} catch (e) {
				u = e instanceof Error ? e.message : "Validation failed.";
			}
			s.push({
				row: r.row,
				externalId: i,
				recordId: d?.recordId ?? t.id ?? "",
				name: t.businessName || t.name || [t.firstName, t.lastName].filter(Boolean).join(" ") || t.sku || t.id || i,
				action: d?.action ?? "Error",
				values: { ...t },
				errors: u ? [u] : []
			});
		}
		for (let t of s) {
			let n = o.find((e) => e.row === t.row);
			if (n) {
				let i = Jf(e.dataset).find((e) => e.id === n.recordId), a = Xf(e.dataset, i);
				if (t.values = Object.fromEntries(Object.keys(fd[e.dataset]).filter((e) => Object.hasOwn(a, e)).map((e) => [e, a[e]])), e.dataset === "Products") {
					let e = (r.products.products.find((e) => e.id === n.recordId)?.units ?? []).map((e) => e.id);
					t.values.unitsJson = JSON.stringify(JSON.parse(t.values.unitsJson).map((t) => ({
						...t,
						id: e.includes(t.id) ? t.id : "Assigned at commit"
					})));
				}
			}
		}
	} finally {
		h(r);
	}
	return {
		preview: {
			fingerprint: i,
			headers: t.headers,
			mapping: t.mapping,
			unmappedColumns: t.unmappedColumns,
			rows: s,
			valid: s.every((e) => !e.errors.length)
		},
		results: o
	};
}
var ip = {
	review(e) {
		return rp(hd.parse(e)).preview;
	},
	commit(e) {
		let t = hd.extend({
			operationId: Hf,
			expectedPreview: w().regex(/^[a-f0-9]{64}$/),
			reason: Uf
		}).strict().parse(e), n = qf(t.dataset, !0), { operationId: r, expectedPreview: i, reason: a, ...o } = t, s = Gf({
			source: o,
			reason: a
		}), c = Kf.find((e) => e.operationId === r);
		if (c) {
			if (c.fingerprint !== s) throw Error("Operation ID already has different import data.");
			return structuredClone(c);
		}
		let l = rp(o);
		if (l.preview.fingerprint !== i) throw Error("Business records or import fields changed. Validate the file again.");
		if (!l.preview.valid) throw Error("Resolve every validation error before committing the batch.");
		let u = gd(o), d = new Set(u.rows.map((e) => e.values.customerId || Jf(o.dataset).find((t) => t.id === e.values.id)?.parentId || "")), f = (e) => JSON.stringify({
			primaryLocationId: e.primaryLocationId,
			primaryContactId: e.primaryContactId,
			locations: e.locations,
			contacts: e.contacts
		}), p = ["Customer branches", "Customer contacts"].includes(o.dataset) ? M.getAll().filter((e) => d.has(e.id)).map((e) => ({
			customerId: e.id,
			before: f(e)
		})) : [], m = [];
		for (let [e, t] of u.rows.entries()) {
			let n = l.results[e];
			n.action === "Skipped" ? m.push(n) : m.push({
				...n,
				...np(o.dataset, o.mode, t.values, !0),
				before: n.before
			});
		}
		for (let e of m) {
			let t = Jf(o.dataset).find((t) => t.id === e.recordId);
			e.after = Xf(o.dataset, t), e.action === "Created" && (e.after.externalId = e.externalId);
		}
		let h = {
			id: crypto.randomUUID(),
			operationId: r,
			fingerprint: s,
			dataset: o.dataset,
			mode: o.mode,
			fileName: o.fileName,
			sourceHash: be("sha256").update(o.text).digest("hex"),
			actorId: n,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			reason: a,
			results: m,
			parentChanges: p.map((e) => ({
				...e,
				after: f(M.getById(e.customerId))
			})).filter((e) => e.before !== e.after)
		};
		return sp.parse(h), Kf = [...Kf, h], structuredClone(h);
	},
	export(e) {
		e = D(cd).parse(e), qf(e);
		let t = pd(e), n = Jf(e).map((t) => Xf(e, t));
		return {
			dataset: e,
			count: n.length,
			csv: _d([t, ...n.map((e) => t.map((t) => e[t] ?? ""))])
		};
	},
	template(e) {
		e = D(cd).parse(e), qf(e);
		let t = pd(e).filter((e) => !["id", "recordToken"].includes(e)), n = {
			_format: ud,
			externalId: "replace-with-stable-source-id",
			...Object.fromEntries(Object.entries(fd[e]).map(([e, t]) => [e, String(t)]))
		};
		return (e === "Customers" || e === "Suppliers") && (n.businessName = "Replace company name"), e === "Suppliers" && (n.country = "Replace country"), e === "Customer branches" && (n.name = "Replace branch name", n.addressLine1 = "Replace address", n.suburb = "Replace city", n.state = "Replace region", n.postcode = "Replace postcode", n.country = "Replace country"), e === "Customer contacts" && (n.firstName = "Replace", n.lastName = "Name", n.email = "replace@example.test"), e === "Products" && (n.sku = "REPLACE-SKU", n.name = "Replace product name"), _d([t, t.map((e) => n[e] ?? "")]);
	}
}, ap = l(w(), w()), op = a({
	row: v().int().min(2).max(501),
	externalId: w().max(200),
	recordId: Hf,
	action: D([
		"Created",
		"Updated",
		"Skipped"
	]),
	identityFingerprint: w().regex(/^[a-f0-9]{64}$/),
	before: ap.nullable(),
	after: ap
}).strict(), sp = a({
	id: Hf,
	operationId: Hf,
	fingerprint: w().regex(/^[a-f0-9]{64}$/),
	dataset: D(cd),
	mode: D(ld),
	fileName: Hf,
	sourceHash: w().regex(/^[a-f0-9]{64}$/),
	actorId: Hf,
	at: w().refine((e) => new Date(e).toISOString() === e),
	reason: Uf,
	results: n(op).min(1).max(500),
	parentChanges: n(a({
		customerId: Hf,
		before: w().max(5e6),
		after: w().max(5e6)
	}).strict()).max(500)
}).strict();
b("dataTransfers", {
	repository: ip,
	read: "inventory.read",
	commands: {
		review: "inventory.read",
		commit: "inventory.read",
		export: "inventory.read",
		template: "inventory.read"
	},
	snapshot: () => ({ runs: Kf }),
	restore: (e) => {
		Kf = e.runs;
	},
	publish: () => {},
	view: (e) => ({ runs: Kf.filter((t) => i(e, md[t.dataset].read)) }),
	validate: (e, t) => {
		let r = a({ runs: n(sp) }).strict().parse(e), i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
		for (let e of r.runs) {
			if (i.has(e.operationId)) throw Error("Duplicate import operation.");
			i.add(e.operationId);
			let r = e.dataset === "Products" ? t.products.products : e.dataset === "Suppliers" ? t.suppliers.suppliers : t.customers.customers, c = 1;
			for (let t of e.results) {
				if (t.row <= c) throw Error("Import result rows must be ordered.");
				if (c = t.row, !(e.dataset === "Customer branches" ? r.some((e) => e.locations.some((e) => e.id === t.recordId)) : e.dataset === "Customer contacts" ? r.some((e) => e.contacts.some((e) => e.id === t.recordId)) : r.some((e) => e.id === t.recordId)) || t.after.id !== t.recordId || t.before && t.before.id !== t.recordId || t.action === "Updated" && !t.before || t.action !== "Updated" && t.before) throw Error("Invalid imported record reference or before/after audit.");
				if (t.action === "Created") {
					if (e.mode !== "Create" || !t.externalId || o.has(e.dataset + ":" + t.externalId) || s.has(e.dataset + ":" + t.recordId)) throw Error("Invalid import source identity.");
					o.set(e.dataset + ":" + t.externalId, t), s.add(e.dataset + ":" + t.recordId);
				}
				if (t.action === "Skipped") {
					let n = o.get(e.dataset + ":" + t.externalId);
					if (e.mode !== "Create" || !n || n.recordId !== t.recordId || n.identityFingerprint !== t.identityFingerprint) throw Error("Invalid skipped import identity.");
				}
				if (t.action === "Updated" && e.mode !== "Update by ID") throw Error("Invalid import update mode.");
				if (t.before && (Object.keys(t.before).some((t) => !pd(e.dataset).includes(t)) || t.before._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.before.recordToken))) throw Error("Invalid import before-state audit.");
				if (Object.keys(t.after).some((t) => !pd(e.dataset).includes(t)) || t.after._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.after.recordToken)) throw Error("Invalid import audit fields.");
			}
			if (new Set(e.parentChanges.map((e) => e.customerId)).size !== e.parentChanges.length || e.parentChanges.length && !["Customer branches", "Customer contacts"].includes(e.dataset)) throw Error("Invalid import parent audit.");
			for (let t of e.parentChanges) {
				if (!r.some((e) => e.id === t.customerId)) throw Error("Invalid import parent reference.");
				for (let e of [t.before, t.after]) {
					let t = a({
						primaryLocationId: w().optional(),
						primaryContactId: w().optional(),
						locations: n(a({ id: Hf }).passthrough()),
						contacts: n(a({ id: Hf }).passthrough())
					}).strict().parse(JSON.parse(e));
					if (t.primaryLocationId && !t.locations.some((e) => e.id === t.primaryLocationId) || t.primaryContactId && !t.contacts.some((e) => e.id === t.primaryContactId)) throw Error("Invalid import primary-record audit.");
				}
			}
		}
	}
});
//#endregion
//#region electron/security/attachmentRepository.ts
var X = w().trim().min(1).max(200), cp = w().trim().min(1).max(2e3), lp = w().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), up = a({
	id: X,
	number: v().int().positive(),
	name: X,
	mime: X,
	size: v().int().positive().max(t),
	sha256: w().regex(/^[a-f0-9]{64}$/),
	content: w().max(14e6),
	createdAt: lp,
	createdBy: X,
	restoredFrom: X.optional()
}).strict(), dp = a({
	id: X,
	title: w().trim().min(1).max(200),
	target: d,
	revision: v().int().positive(),
	currentVersionId: X,
	versions: n(up).min(1).max(100),
	createdAt: lp,
	createdBy: X,
	updatedAt: lp,
	updatedBy: X,
	deletedAt: lp.optional(),
	deletedBy: X.optional()
}).strict(), fp = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), pp = a({
	id: X,
	documentId: X,
	operationId: X,
	action: D([
		"Uploaded",
		"Added version",
		"Restored version",
		"Renamed",
		"Trashed",
		"Recovered"
	]),
	actorId: X,
	at: lp,
	revision: v().int().positive(),
	reason: cp,
	versionId: X.optional(),
	fingerprint: w().regex(/^[a-f0-9]{64}$/),
	after: a({
		title: X,
		deleted: _(),
		currentVersionId: X,
		versionsCount: v().int().positive()
	}).strict()
}).strict(), mp = [], hp = [];
function gp() {
	return j.require("inventory.read");
}
var _p = () => E([...new Set(Object.values(f).map((e) => e.repository))]);
function vp(e, t, n = _p()) {
	return u(n, t).find((t) => t.kind === e.kind && t.id === e.id);
}
function yp(e, t = !1) {
	let n = gp(), r = vp(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function bp(e, t = !1) {
	let n = mp.find((t) => t.id === X.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return yp(n.target, t), n;
}
var xp = (e) => be("sha256").update(JSON.stringify(e)).digest("hex"), Sp = (e, t) => {
	let n = vp(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function Cp(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function wp(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function Tp(e) {
	if (mp.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function Ep(e, t) {
	let n = hp.find((t) => t.operationId === e);
	if (!n) return;
	let r = bp(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return Sp(r, j.current());
}
function Dp(e, t, n, r, i, a) {
	return mp = [...mp.filter((t) => t.id !== e.id), e], hp = [...hp, {
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
		after: fp(e)
	}], Sp(e, j.current());
}
b("attachments", {
	repository: {
		targets() {
			return u(_p(), gp());
		},
		checkTarget(e) {
			return yp(d.parse(e), !0), !0;
		},
		upload(e) {
			let t = a({
				operationId: X,
				id: X.optional(),
				expectedRevision: v().int().nonnegative(),
				target: d,
				title: X,
				reason: cp,
				file: a({
					name: X,
					content: w().max(14e6)
				}).strict()
			}).strict().parse(e), n = yp(t.target, !0), r = ce(t.file.name, t.file.content), i = xp({
				...t,
				file: {
					name: r.name,
					sha256: r.sha256
				}
			}), o = Ep(t.operationId, i);
			if (o) return o;
			let s = t.id ? bp(t.id, !0) : void 0;
			if (s) {
				if (Cp(s, t.expectedRevision), JSON.stringify(s.target) !== JSON.stringify(t.target)) throw Error("An attachment retains its original business link.");
				if (s.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (s.versions.some((e) => e.sha256 === r.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (s.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (t.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!s && mp.some((e) => !e.deletedAt && e.target.kind === t.target.kind && e.target.id === t.target.id && e.versions.some((e) => e.sha256 === r.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			Tp(r.size);
			let c = (/* @__PURE__ */ new Date()).toISOString();
			s && wp(s, c);
			let l = {
				...r,
				id: crypto.randomUUID(),
				number: (s?.versions.length ?? 0) + 1,
				createdAt: c,
				createdBy: n
			};
			return Dp({
				...s ?? {
					id: crypto.randomUUID(),
					target: t.target,
					createdAt: c,
					createdBy: n
				},
				title: s?.title ?? t.title,
				currentVersionId: l.id,
				versions: [...s?.versions ?? [], l],
				revision: (s?.revision ?? 0) + 1,
				updatedAt: c,
				updatedBy: n
			}, s ? "Added version" : "Uploaded", t.operationId, i, t.reason, l.id);
		},
		change(e) {
			let t = a({
				operationId: X,
				id: X,
				expectedRevision: v().int().positive(),
				action: D([
					"Renamed",
					"Trashed",
					"Recovered",
					"Restored version"
				]),
				reason: cp,
				title: X.optional(),
				versionId: X.optional()
			}).strict().parse(e), n = bp(t.id, !0), i = xp(t), o = Ep(t.operationId, i);
			if (o) return o;
			Cp(n, t.expectedRevision);
			let s = yp(n.target, !0), c = (/* @__PURE__ */ new Date()).toISOString();
			wp(n, c);
			let l = {
				...n,
				versions: [...n.versions],
				revision: n.revision + 1,
				updatedBy: s,
				updatedAt: c
			}, u;
			if (t.action === "Trashed") {
				if (n.deletedAt) throw Error("Attachment is already in the recycle bin.");
				l.deletedAt = c, l.deletedBy = s;
			} else if (t.action === "Recovered") {
				if (!n.deletedAt) throw Error("Attachment is not in the recycle bin.");
				delete l.deletedAt, delete l.deletedBy;
			} else {
				if (n.deletedAt) throw Error("Recover the attachment before editing.");
				if (t.action === "Renamed") {
					if (!t.title) throw Error("Enter a document title.");
					l.title = t.title;
				} else {
					let e = n.versions.find((e) => e.id === t.versionId);
					if (!e) throw Error("Version not found.");
					if (e.id === n.currentVersionId) throw Error("That version is already current.");
					if (n.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
					Tp(e.size), r(e);
					let i = {
						...e,
						id: crypto.randomUUID(),
						number: n.versions.length + 1,
						createdAt: c,
						createdBy: s,
						restoredFrom: e.id
					};
					l.versions.push(i), l.currentVersionId = i.id, u = i.id;
				}
			}
			return Dp(l, t.action, t.operationId, i, t.reason, u);
		},
		read(e) {
			let t = a({
				id: X,
				versionId: X
			}).strict().parse(e), n = bp(t.id).versions.find((e) => e.id === t.versionId);
			if (!n) throw Error("Version not found.");
			return r(n), { ...n };
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
		documents: mp,
		history: hp
	}),
	restore: (e) => {
		mp = e.documents, hp = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = mp.filter((t) => vp(t.target, e));
		return {
			documents: t.map((t) => Sp(t, e)),
			history: hp.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (e, t) => {
		let i = a({
			documents: n(dp),
			history: n(pp)
		}).strict().parse(e), o = /* @__PURE__ */ new Set(), s = 0;
		for (let e of i.documents) {
			let n = f[e.target.kind];
			if (!t[n.repository]?.[n.collection]?.some((t) => t.id === e.target.id)) throw Error("Invalid attachment business reference.");
			if (!!e.deletedAt != !!e.deletedBy) throw Error("Invalid attachment recycle metadata.");
			let a = /* @__PURE__ */ new Set();
			for (let [t, n] of e.versions.entries()) {
				if (r(n), s += n.size, a.has(n.id) || n.number !== t + 1 || n.createdAt < e.createdAt || n.createdAt > e.updatedAt) throw Error("Invalid attachment version history.");
				if (n.restoredFrom && (!a.has(n.restoredFrom) || e.versions.find((e) => e.id === n.restoredFrom)?.sha256 !== n.sha256 || e.versions.find((e) => e.id === n.restoredFrom)?.name !== n.name)) throw Error("Invalid restored attachment version.");
				a.add(n.id);
			}
			if (!a.has(e.currentVersionId)) throw Error("Invalid current attachment version.");
			let o = i.history.filter((t) => t.documentId === e.id);
			if (o.length !== e.revision || o[0].action !== "Uploaded" || o[0].actorId !== e.createdBy || o[0].at !== e.createdAt) throw Error("Invalid attachment audit history.");
			let c = e.createdAt, l = 0, u = !1, d = "", p = "";
			for (let [t, n] of o.entries()) {
				if (n.revision !== t + 1 || n.at < c || n.at > e.updatedAt) throw Error("Invalid attachment audit ordering.");
				if (c = n.at, t > 0 && n.action !== "Renamed" && n.after.title !== p) throw Error("Attachment title changed without a rename event.");
				if (p = n.after.title, ![
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
			let m = o.at(-1);
			if (l !== e.versions.length || m.actorId !== e.updatedBy || m.at !== e.updatedAt || JSON.stringify(m.after) !== JSON.stringify(fp(e))) throw Error("Attachment metadata differs from audit.");
			if (e.deletedAt && (e.deletedAt !== m.at || e.deletedBy !== m.actorId)) throw Error("Attachment deletion differs from audit.");
		}
		for (let e of i.history) {
			if (o.has(e.operationId) || !i.documents.some((t) => t.id === e.documentId)) throw Error("Invalid attachment operation identity.");
			o.add(e.operationId);
		}
		if (s > 5e7) throw Error("Attachment library exceeds 50 MB.");
	}
});
//#endregion
//#region src/features/job-costing/jobCostingService.ts
function Op(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function kp(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || Op(a.debit) !== Op(r.credit) || Op(a.credit) !== Op(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = Op(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function Ap(e, t, n, r, i, a) {
	if (T(i, "From date"), T(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = kp(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = Op(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = Op(t.amount);
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += Op(r.allocated) : n += Op(r.allocated);
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
			let t = c(e.id), n = Op(Math.round(Number(e.budget) * 100) / 100), r = Op(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (Op(t.revenue) - n) / 100,
				costVariance: (r - Op(t.cost)) / 100,
				profitVariance: (Op(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + Op(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + Op(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var jp = w().trim().min(1).max(200), Mp = w().trim().min(1).max(2e3), Np = w().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Pp = a({
	jobId: jp,
	amount: v().finite().positive().refine((e) => {
		try {
			return Op(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), Fp = a({
	id: jp,
	journalId: jp,
	lineId: jp,
	revision: v().int().positive(),
	splits: n(Pp).max(100),
	updatedAt: Np,
	updatedBy: jp
}).strict(), Ip = a({
	id: jp,
	operationId: jp,
	recordId: jp,
	revision: v().int().positive(),
	at: Np,
	actorId: jp,
	reason: Mp,
	fingerprint: w().max(3e6),
	before: n(Pp),
	after: n(Pp)
}).strict(), Lp = a({
	operationId: jp,
	journalId: jp,
	lineId: jp,
	expectedRevision: v().int().nonnegative(),
	expectedSource: w().max(2e6),
	splits: n(Pp).max(100),
	reason: Mp
}).strict(), Rp = [], zp = [], Bp = /* @__PURE__ */ new Set(), Vp = () => Bp.forEach((e) => e());
function Hp(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + Op(t.amount), 0) > Op(t)) throw Error("Project splits exceed the source amount.");
}
b("jobCosting", {
	repository: {
		subscribe(e) {
			return Bp.add(e), () => {
				Bp.delete(e);
			};
		},
		getSnapshot: () => Rp,
		review() {
			return j.require("accounting.read"), {
				lines: kp(L.getAll(), I.getAll()),
				allocations: structuredClone(Rp),
				history: structuredClone(zp)
			};
		},
		report(e) {
			j.require("accounting.read");
			let t = a({
				from: w(),
				to: w()
			}).strict().parse(e);
			return Ap(L.getAll(), I.getAll(), fe.jobs, Rp, t.from, t.to);
		},
		save(e) {
			let t = j.require("accounting.post"), n = Lp.parse(e), r = JSON.stringify(n), i = zp.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return Rp.find((e) => e.id === i.recordId);
			}
			let a = kp(L.getAll(), I.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			let o = Rp.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			Hp(n.splits, a.capacity, fe.jobs);
			for (let e of n.splits) if (fe.jobs.find((t) => t.id === e.jobId).status !== "Active" && o?.splits.find((t) => t.jobId === e.jobId)?.amount !== e.amount) throw Error("Only active projects can receive new or changed allocations.");
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
			return Rp = [...Rp.filter((e) => e.id !== c.id), c], zp = [...zp, {
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
			}], Vp(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: Rp,
		history: zp
	}),
	restore: (e) => {
		Rp = e.allocations, zp = e.history;
	},
	publish: Vp,
	validate: (e, t) => {
		let r = a({
			allocations: n(Fp),
			history: n(Ip)
		}).strict().parse(e), i = t.workspace_jobs.records, o = kp(t.journals.journalEntries, t.accounts.accounts), s = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
		for (let e of r.allocations) {
			let t = o.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), n = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || s.has(n)) throw Error("Invalid project source reference.");
			s.add(n), Hp(e.splits, t.capacity, i);
			let a = r.history.filter((t) => t.recordId === e.id);
			if (a.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], l = "";
			for (let [n, r] of a.entries()) {
				let a = Lp.parse(JSON.parse(r.fingerprint));
				if (r.revision !== n + 1 || r.at < l || JSON.stringify(r.before) !== JSON.stringify(c) || a.journalId !== e.journalId || a.lineId !== e.lineId || a.operationId !== r.operationId || a.expectedRevision !== n || a.reason !== r.reason || JSON.stringify(a.splits) !== JSON.stringify(r.after)) throw Error("Invalid allocation history chain.");
				Hp(r.after, t.capacity, i), c = r.after, l = r.at;
			}
			let u = a.at(-1);
			if (JSON.stringify(c) !== JSON.stringify(e.splits) || u.at !== e.updatedAt || u.actorId !== e.updatedBy) throw Error("Allocation outcome differs from audit history.");
		}
		for (let e of r.history) {
			if (c.has(e.operationId) || !r.allocations.some((t) => t.id === e.recordId)) throw Error("Invalid allocation operation reference.");
			c.add(e.operationId);
		}
	}
});
//#endregion
//#region src/features/contact-review/reviewRepository.ts
var Up = w().trim().min(1).max(200), Wp = w().trim().max(2e3), Gp = w().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Kp = a({
	operationId: Up,
	kind: D(Zu),
	customerId: w().max(200).default(""),
	values: ed,
	source: D(Qu).default("Manual"),
	externalId: w().trim().max(200).default(""),
	sourceReference: w().trim().max(500).default("")
}).strict(), qp = a({
	id: Up,
	action: Up,
	actorId: Up,
	at: Gp,
	reason: Wp,
	data: w().max(2e6)
}).strict(), Jp = a({
	action: D([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: Up,
	at: Gp,
	reason: Wp,
	fingerprint: w().max(1e4),
	customerId: w(),
	targetId: w(),
	snapshot: te()
}).strict(), Yp = Kp.extend({
	id: Up,
	state: D([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: v().int().positive(),
	createdBy: Up,
	createdAt: Gp,
	updatedAt: Gp,
	creationFingerprint: w().max(1e5),
	history: n(qp).min(1),
	decision: Jp.optional()
}).strict(), Xp = [], Zp = /* @__PURE__ */ new Set(), Qp = () => Zp.forEach((e) => e());
function $p() {
	let e = j.require("contacts.write");
	return j.require("sales.read"), e.userId;
}
var em = () => (/* @__PURE__ */ new Date()).toISOString();
function tm(e) {
	let t = em();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var nm = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function rm(e) {
	let t = Xp.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function im(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function am(e) {
	return Xp = [...Xp.filter((t) => t.id !== e.id), e], Qp(), e;
}
function om(e) {
	let t = Kp.parse(e);
	if (t.values = td(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !M.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function sm(e, t) {
	return e === "Customer" ? at.strict().parse(t) : e === "Branch" ? ot.strict().parse(t) : st.strict().parse(t);
}
function cm(e, t, n) {
	let r = M.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var lm = {
	subscribe(e) {
		return Zp.add(e), () => {
			Zp.delete(e);
		};
	},
	getSnapshot: () => Xp,
	create(e) {
		let t = $p(), n = om(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = Xp.find((e) => e.operationId === r) || n.externalId && Xp.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = em();
		return am({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [nm("Received", t, s, "", i)]
		});
	},
	importBatch(e) {
		$p();
		let t = a({
			operationId: Up.max(150),
			drafts: n(Kp.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(e);
		if (t.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return t.drafts.map((e, n) => lm.create({
			...e,
			operationId: t.operationId + ":" + n
		}));
	},
	update(e) {
		let t = $p(), n = a({
			id: Up,
			expectedRevision: v().int().positive(),
			customerId: w().max(200),
			values: ed
		}).strict().parse(e), r = rm(n.id);
		if (im(r, n.expectedRevision), r.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let i = om({
			operationId: r.operationId,
			kind: r.kind,
			customerId: n.customerId,
			values: n.values,
			source: r.source,
			externalId: r.externalId,
			sourceReference: r.sourceReference
		}), o = tm(r);
		return am({
			...r,
			customerId: i.customerId,
			values: i.values,
			revision: r.revision + 1,
			updatedAt: o,
			history: [...r.history, nm("Updated", t, o, "", {
				customerId: i.customerId,
				values: i.values
			})]
		});
	},
	review(e) {
		j.require("sales.read");
		let t = rm(Up.parse(e)), n = M.getAll(), r = "";
		try {
			if (sm(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: od(t, n),
			masterSignature: sd(n),
			validationError: r
		};
	},
	decide(e) {
		let t = $p(), n = a({
			id: Up,
			expectedRevision: v().int().positive(),
			action: D([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: Wp,
			allowDuplicate: _().default(!1),
			targetId: w().max(200).default(""),
			expectedMaster: w().max(25e6).optional()
		}).strict().parse(e), r = rm(n.id), i = JSON.stringify({
			action: n.action,
			reason: n.reason,
			allowDuplicate: n.allowDuplicate,
			targetId: n.targetId
		});
		if (r.state !== "Pending") {
			if (r.decision?.fingerprint === i) return r;
			throw Error("This draft already has a different decision.");
		}
		im(r, n.expectedRevision);
		let o = tm(r), s = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (n.action === "Reject") {
			if (!n.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = M.getAll();
			if (n.expectedMaster !== sd(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (n.action === "Link existing") {
				if (!n.reason) throw Error("Explain why this existing record is the correct match.");
				s = cm(r.kind, r.customerId, n.targetId);
			} else {
				if (od(r, e).length && (!n.allowDuplicate || !n.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = sm(r.kind, r.values);
				if (r.kind === "Customer") {
					let e = M.create(t);
					s = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = M.getById(r.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = r.kind === "Branch" ? M.addLocation(e.id, t) : M.addContact(e.id, t);
					s = {
						customerId: e.id,
						targetId: n.id,
						snapshot: structuredClone(n)
					};
				}
			}
		}
		let c = {
			action: n.action,
			actorId: t,
			at: o,
			reason: n.reason,
			fingerprint: i,
			...s
		};
		return am({
			...r,
			state: n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved",
			revision: r.revision + 1,
			updatedAt: o,
			decision: c,
			history: [...r.history, nm(n.action, t, o, n.reason, c)]
		});
	},
	reopen(e) {
		let t = $p(), n = a({
			id: Up,
			expectedRevision: v().int().positive(),
			reason: Wp.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(e), r = rm(n.id);
		if (im(r, n.expectedRevision), r.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let i = tm(r), o = {
			...r,
			state: "Pending",
			revision: r.revision + 1,
			updatedAt: i,
			history: [...r.history, nm("Reopened", t, i, n.reason)]
		};
		return delete o.decision, am(o);
	}
};
b("contactReviews", {
	repository: lm,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: Xp }),
	restore: (e) => {
		Xp = e.drafts;
	},
	publish: Qp,
	validate: (e, t) => {
		let r = a({ drafts: n(Yp) }).strict().parse(e), i = t.customers.customers, o = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
		for (let e of r.drafts) {
			let t = td(e.kind, e.values);
			if (Object.keys(t).length !== Object.keys(e.values).length) throw Error("Missing review draft fields.");
			if (o.has(e.operationId) || e.externalId && s.has(e.source + ":" + e.externalId)) throw Error("Duplicate review intake identity.");
			o.add(e.operationId), e.externalId && s.add(e.source + ":" + e.externalId);
			let n = JSON.parse(e.creationFingerprint);
			if (e.history[0].data !== e.creationFingerprint) throw Error("Review source history is inconsistent.");
			if (n.kind !== e.kind || n.source !== e.source || n.externalId !== e.externalId || n.sourceReference !== e.sourceReference) throw Error("Review intake provenance is inconsistent.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.history[0].action !== "Received" || e.history[0].actorId !== e.createdBy || e.history[0].at !== e.createdAt || e.updatedAt < e.createdAt) throw Error("Invalid review history.");
			let r = "Pending", c = e.createdAt;
			for (let [t, n] of e.history.entries()) {
				if (n.at < c || n.at > e.updatedAt) throw Error("Invalid review event time.");
				c = n.at;
				let i = JSON.parse(n.data);
				if (!i || typeof i != "object" || Array.isArray(i)) throw Error("Invalid review event payload.");
				if (t !== 0) {
					if (n.action === "Updated") {
						if (r !== "Pending") throw Error("Invalid review edit history.");
					} else if (n.action === "Reopened") {
						if (r !== "Rejected" || !n.reason) throw Error("Invalid review reopen history.");
						r = "Pending";
					} else if ([
						"Approve new",
						"Link existing",
						"Reject"
					].includes(n.action)) {
						if (r !== "Pending") throw Error("Invalid repeated review decision.");
						r = n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved";
					} else throw Error("Unknown review history action.");
				}
			}
			if (r !== e.state || e.history.at(-1).at !== e.updatedAt) throw Error("Review history does not match current state.");
			if (e.kind === "Customer" && e.customerId || e.customerId && !i.some((t) => t.id === e.customerId)) throw Error("Review parent customer is invalid.");
			if (e.state === "Pending" != !e.decision) throw Error("Review state and decision are inconsistent.");
			if (e.decision) {
				let t = e.state === "Rejected" ? "Reject" : e.state === "Linked" ? "Link existing" : "Approve new", n = a({
					action: D([
						"Approve new",
						"Link existing",
						"Reject"
					]),
					reason: Wp,
					allowDuplicate: _(),
					targetId: w()
				}).strict().parse(JSON.parse(e.decision.fingerprint)), r = e.history.at(-1);
				if (n.action !== t || n.reason !== e.decision.reason || n.targetId !== (t === "Link existing" ? e.decision.targetId : "") || r.actorId !== e.decision.actorId || r.at !== e.decision.at || r.reason !== e.decision.reason || JSON.stringify(JSON.parse(r.data)) !== JSON.stringify(e.decision)) throw Error("Review decision audit is inconsistent.");
				if (e.decision.action !== t) throw Error("Invalid review decision.");
				if (t !== "Reject") {
					let n = i.find((t) => t.id === e.decision.customerId), r = e.kind === "Customer" ? n : e.kind === "Branch" ? n?.locations.find((t) => t.id === e.decision.targetId) : n?.contacts.find((t) => t.id === e.decision.targetId);
					if (!r || r.id !== e.decision.targetId || e.kind !== "Customer" && n.id !== e.customerId || e.decision.snapshot?.id !== r.id) throw Error("Invalid resolved review reference.");
					t === "Approve new" && sm(e.kind, e.values);
				} else if (!e.decision.reason || e.decision.customerId || e.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function um(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function dm(e, t) {
	T(e, t);
}
function fm(e, t, n, r) {
	if (dm(n, "From date"), dm(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = pm(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = pm(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = um(a.reduce((e, t) => e + t.amount, 0)), c = um(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = um(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = um(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = um(d - f);
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
		operatingExpenses: um(c - f),
		totalExpenses: c,
		netProfit: um(s - c)
	};
}
function pm(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = um(r + t.debit), i = um(i + t.credit));
		let a = um(n === "REVENUE" ? i - r : r - i);
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
function mm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function hm(e) {
	T(e);
}
function gm(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = mm(n + t.debit), r = mm(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? mm(n - r) : mm(r - n);
}
function _m(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: gm(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function vm(e) {
	return mm(e.reduce((e, t) => e + t.amount, 0));
}
function ym(e, t, n) {
	hm(n);
	let r = t.filter((e) => e.journalDate <= n), i = _m(e, r, "ASSET"), a = _m(e, r, "LIABILITY"), o = _m(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = mm(s.reduce((e, t) => e + gm(t, r), 0)), u = mm(c.reduce((e, t) => e + gm(t, r), 0)), d = vm(i), f = vm(a), p = vm(o), m = mm(l - u), h = mm(p + m), g = mm(f + h), _ = mm(d - g);
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
function bm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xm(e, t) {
	T(e, t);
}
function Sm(e, t) {
	let n = bm(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: bm(Math.abs(n))
	};
}
function Cm(e, t, n, r) {
	if (xm(n, "From date"), xm(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = bm(i + t.debit), a = bm(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = bm(o + t.debit), s = bm(s + t.credit));
		}
		let c = Sm(i, a), l = Sm(bm(i + o), bm(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = bm(i.reduce((e, t) => e + t.openingDebit, 0)), o = bm(i.reduce((e, t) => e + t.openingCredit, 0)), s = bm(i.reduce((e, t) => e + t.periodDebit, 0)), c = bm(i.reduce((e, t) => e + t.periodCredit, 0)), l = bm(i.reduce((e, t) => e + t.closingDebit, 0)), u = bm(i.reduce((e, t) => e + t.closingCredit, 0)), d = bm(l - u);
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
var wm = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], Tm = (e) => Math.round(e * 100), Em = (e) => e / 100;
function Dm(e) {
	switch (e.sourceType) {
		case "CUSTOMER_DEPOSIT":
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return wm[0];
		case "CUSTOMER_DEPOSIT_REFUND":
		case "CUSTOMER_REFUND": return wm[1];
		case "SUPPLIER_PREPAYMENT":
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return wm[2];
		case "SUPPLIER_PREPAYMENT_REFUND":
		case "SUPPLIER_REFUND": return wm[3];
		case "OPENING_BALANCE": return wm[4];
		case "BANK_TRANSFER": return wm[5];
		default: return wm[6];
	}
}
function Om(e) {
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
		let n = qs(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? Tm(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = Tm(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: wm[4],
				moneyIn: Em(Math.max(e, 0)),
				moneyOut: Em(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		let l = n.transactions.filter((t) => t.correctionOnly && t.transactionDate >= e.from).length;
		l && i.push(`${t.name}: ${l} internal duplicate correction lines remain visible in the bank register and are excluded from cash movement totals.`);
		for (let i of n.transactions) {
			if (i.correctionOnly) continue;
			if (i.transactionDate < e.from) {
				o += Tm(i.moneyIn) - Tm(i.moneyOut);
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
				category: Dm(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += Tm(i.moneyIn), c += Tm(i.moneyOut);
		}
		let u = Tm(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: Em(o),
			moneyIn: Em(s),
			moneyOut: Em(c),
			closing: Em(u),
			difference: Em(o + s - c - u)
		};
	}), s = new Map(wm.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === wm[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + Tm(e.moneyIn) - Tm(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += Tm(e.moneyIn), t.moneyOut += Tm(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(wm[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: Em(e.moneyIn),
		moneyOut: Em(e.moneyOut),
		net: Em(e.moneyIn - e.moneyOut)
	})), u = (e) => Em(o.reduce((t, n) => t + Tm(n[e]), 0)), d = u("opening"), f = u("closing"), p = Em(l.reduce((e, t) => e + Tm(t.net), 0)), m = a.filter((e) => e.category === wm[6]).length;
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
		difference: Em(Tm(d) + Tm(p) - Tm(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var km = (e) => Math.round(e * 100);
function Am(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - km(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (km(e.subtotal) + km(e.tax) !== km(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function jm(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), T(r.date, `Document date (${r.number})`), Am(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: km(r.subtotal) * n / 100,
			tax: km(r.tax) * n / 100,
			total: km(r.total) * n / 100
		});
		if (n.push(l(r.date, a, i ? "CREDIT" : "DOCUMENT")), r.status === "VOID") {
			if (!r.voidedAt) throw Error(`${r.number}: void date is missing. Review the source record before reporting.`);
			let e = C(r.voidedAt);
			if (T(e, `Void date (${r.number})`), e < r.date) throw Error(`${r.number}: void date precedes the original document.`);
			n.push(l(e, -a, "VOID"));
		}
	}
	return n.sort((e, t) => e.date.localeCompare(t.date) || e.number.localeCompare(t.number) || e.eventId.localeCompare(t.eventId));
}
function Mm(e, t) {
	if (T(t.from, "From date"), T(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = jm(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + km(n[t]), 0) / 100, a = {
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
function Nm(e, t, n) {
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
function Pm(e, t) {
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
var Fm = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function Im(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > Fm.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => Fm.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${Fm.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var Lm = (e) => JSON.stringify(e);
function Rm(e, t, n) {
	if (T(e.periodStart, "From date"), T(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = Im(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = fm(t.accounts, t.journals, i, a);
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
			let n = ym(t.accounts, t.journals, a);
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
			let n = Cm(t.accounts, t.journals, i, a);
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
			let n = Om({
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
		let n = e === "Net purchases", r = Mm(n ? Pm(t.bills, t.supplierCredits) : Nm(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: Lm(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function zm() {
	let e = y();
	return {
		accounts: I.getAll(),
		journals: L.getAll(),
		banks: Ar.getAll(),
		documents: z.getAll(),
		customerCredits: R.getAll(),
		customers: M.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: uo.getAll(),
		supplierCredits: U.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone
		}
	};
}
function Bm(e) {
	let t = j.require("accounting.read"), n = a({
		id: w().trim().min(1).max(200),
		expectedRevision: w().regex(/^\d+$/)
	}).strict().parse(e), r = fe["report-packs"]?.find((e) => e.id === n.id);
	if (!r) throw Error("Report pack configuration was not found.");
	if (r.revision !== n.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (r.status !== "Active") throw Error("Activate this report pack before generating.");
	return Rm({
		id: r.id,
		revision: r.revision,
		name: r.name,
		cover: r.cover,
		introduction: r.introduction,
		periodStart: r.periodStart,
		periodEnd: r.periodEnd,
		reports: r.reports
	}, zm(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: t.userId
	});
}
//#endregion
//#region src/features/saved-reports/savedReportService.ts
var Vm = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], Hm = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), Um = [
	Hm("date", "Date"),
	Hm("number", "Document"),
	Hm("contact", "Contact"),
	Hm("partyId", "Contact ID"),
	Hm("activity", "Activity"),
	Hm("status", "Current status"),
	Hm("net", "Net", !0),
	Hm("tax", "Tax", !0),
	Hm("gross", "Gross", !0)
], Wm = {
	Sales: Um,
	Purchases: Um,
	Banking: [
		Hm("date", "Date"),
		Hm("bank", "Bank"),
		Hm("journal", "Journal"),
		Hm("description", "Description"),
		Hm("source", "Source"),
		Hm("category", "Activity"),
		Hm("moneyIn", "Money in", !0),
		Hm("moneyOut", "Money out", !0),
		Hm("net", "Net", !0)
	],
	"General ledger": [
		Hm("date", "Date"),
		Hm("journal", "Journal"),
		Hm("accountCode", "Account code"),
		Hm("account", "Account"),
		Hm("description", "Description"),
		Hm("source", "Source"),
		Hm("status", "Current status"),
		Hm("debit", "Debit", !0),
		Hm("credit", "Credit", !0)
	]
}, Gm = (e) => e === "Banking" ? "Cash" : "Accrual", Km = a({
	from: w(),
	to: w(),
	query: w().max(500).default(""),
	partyId: w().max(200).optional(),
	bankId: w().max(200).optional(),
	accountId: w().max(200).optional(),
	currency: w().min(1).max(10).optional()
}).strict();
function qm(e) {
	let t = D(Vm).parse(e.dataset);
	if (e.basis !== Gm(t)) throw Error(`${t} uses ${Gm(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = Km.parse(n);
	if (T(r.from, "From date"), T(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, o = i.map((e) => Wm[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > Wm[t].length || o.some((e) => !e) || new Set(o.map((e) => e?.key)).size !== o.length) throw Error(`Select distinct supported columns for ${t}: ${Wm[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: o
	};
}
var Jm = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function Ym(e, t, n) {
	let { dataset: r, filters: i, columns: a } = qm(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? Nm(t.documents, t.customerCredits, t.customers) : Pm(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = jm(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = Om({
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
		value: Jm(s, t)
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
		sourceSignature: Lm(t),
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
function Xm(e) {
	let t = j.require("accounting.read"), n = a({
		id: w().trim().min(1).max(200),
		expectedRevision: w().regex(/^\d+$/)
	}).strict().parse(e), r = fe["custom-reports"]?.find((e) => e.id === n.id);
	if (!r) throw Error("Saved report was not found.");
	if (r.revision !== n.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (r.status !== "Active") throw Error("Activate this saved report before running.");
	return Ym({
		id: r.id,
		revision: r.revision,
		name: r.name,
		dataset: r.dataset,
		columns: r.columns,
		basis: r.basis,
		filter: r.filter,
		favourite: r.favourite
	}, zm(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: t.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var Zm = l(w(), w().max(2e4)), Qm = [
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
], $m = () => (/* @__PURE__ */ new Date()).toISOString(), eh = {
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
}, th = /* @__PURE__ */ new Set(), nh = 0, rh = () => {
	nh++, th.forEach((e) => e());
}, ih = Object.fromEntries(Object.keys(eh).map((e) => [e, []]));
for (let e of Object.keys(eh)) fe[e] = [];
var ah = () => ({
	collected: I.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: I.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
fe["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: $m(),
	updatedAt: $m(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...ah()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: $m(),
	updatedAt: $m(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...ah()
}];
function oh(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function sh(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function ch(e, t) {
	let n = I.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function lh(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function uh(e, t, n, r = !0) {
	let i = eh[e];
	if (!i) throw Error("Unknown workspace domain.");
	let a = /* @__PURE__ */ new Set([
		"id",
		"name",
		"status",
		"revision",
		"createdAt",
		"updatedAt",
		...i.fields
	]);
	if (Object.keys(t).some((e) => !a.has(e))) throw Error("Unsupported business field.");
	oh(t.name, "Name");
	for (let e of i.required) oh(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (sh(t.rate, "Tax rate"), t.basis && !["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid entry basis.");
		if (r) {
			let e = n.find((e) => e.id === t.id), r = E(), i = fe.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (t.status === "Inactive" && t.code === i) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== t.code && (e.code === i || r.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (fe["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r) {
			let e = ch(t.collected, "LIABILITY"), n = ch(t.paid, "ASSET"), r = (E().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || n.systemRole && n.systemRole !== "GST_RECEIVABLE" || r.includes(n.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = I.requireBySystemRole(t.role), n = t.status === "Inactive" ? I.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = E().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!Qm.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && ch(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = Xe(t.productId);
		if (r && (!e || !Ze(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (sh(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !M.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (sh(t.budget, "Revenue budget"), sh(t.costBudget, "Cost budget"), r) for (let e of ["budget", "costBudget"]) {
			let n = Number(t[e]);
			if (!Number.isSafeInteger(Math.round(n * 100)) || Math.abs(Math.round(n * 100) / 100 - n) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!lh(t.starts) || !lh(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (r && t.id && (E().salesVisits?.visits ?? []).some((e) => e.followupTaskId === t.id && e.customerId !== t.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (r && ![
			"Open",
			"In progress",
			"Completed"
		].includes(t.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!lh(t.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(t.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (r && ch(t.accountId), ![
			"Description",
			"Payee",
			"Reference"
		].includes(t.field) || ![
			"Contains",
			"Equals",
			"Starts with"
		].includes(t.operator)) throw Error("Invalid bank condition.");
		if (r && !fe["tax-codes"].some((e) => e.status === "Active" && e.code === t.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "custom-reports" && r && qm({
		dataset: t.dataset,
		columns: t.columns,
		basis: t.basis,
		filter: t.filter,
		favourite: t.favourite
	}), e === "report-packs" && r && Im(t.reports), e === "report-packs" && (!lh(t.periodStart) || !lh(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
	if (e === "settings") {
		if (n.some((e) => e.id !== t.id && e.section === t.section)) throw Error("One record per settings section is allowed.");
		if (t.section === "business") {
			for (let e of [
				"companyName",
				"currency",
				"timezone",
				"yearEnd",
				"gstCode",
				"basis",
				"terms"
			]) oh(t[e], e);
			if (t.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(t.terms) || Number(t.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(t.yearEnd) || !lh("2001-" + t.yearEnd)) throw Error("Year end must be MM-DD.");
			for (let e of [
				"quotePrefix",
				"orderPrefix",
				"invoicePrefix",
				"creditPrefix",
				"purchasePrefix",
				"billPrefix",
				"supplierCreditPrefix"
			]) if (t[e] && !/^[A-Z0-9]{1,12}$/.test(t[e])) throw Error("Number prefixes require 1–12 uppercase letters/numbers.");
			if (r) {
				if (!fe["tax-codes"].some((e) => e.code === t.gstCode && e.status === "Active")) throw Error("Default tax code must be active.");
				let e = E().journals.journalEntries, r = n.find((e) => e.id === t.id), i = E().bankAccounts.bankAccounts, a = r?.currency ?? i[0]?.currency ?? "AUD";
				if (t.currency !== a && (e.length || i.length)) throw Error("Base currency is locked after bank accounts or financial postings exist. Create a separately initialized currency profile.");
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
function dh(e, t, n) {
	ih[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: $m(),
		updatedAt: $m(),
		recordId: t.id,
		actorId: j.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var fh = Object.fromEntries(Object.keys(eh).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return Xm(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return Bm(t);
		},
		getAll: () => fe[e],
		getById: (t) => fe[e].find((e) => e.id === t),
		save(t, n) {
			let r = Zm.parse(t), i = fe[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = $m(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || j.current()?.userId || "local-test" : j.current()?.userId ?? "local-test")), uh(e, o, fe[e]), fe[e] = [...fe[e].filter((e) => e.id !== o.id), o], dh(e, o, i ? "Updated" : "Created"), rh(), o;
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
			dh(e, {
				...i,
				note: r.trim()
			}, "Note added"), rh();
		}
	};
	return b("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			ph(e, t), mh(e, t, n);
		},
		repository: t,
		read: eh[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: eh[e].write,
			setStatus: eh[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: fe[e],
			history: ih[e]
		}),
		restore: (t) => {
			ph(e, t), fe[e] = t.records, ih[e] = t.history;
		},
		publish: rh
	}), [e, t];
}));
function ph(e, t) {
	let r = a({
		records: n(Zm),
		history: n(Zm)
	}).strict().parse(t), i = /* @__PURE__ */ new Set();
	for (let t of r.records) {
		if (!t.id || i.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		i.add(t.id), uh(e, t, r.records, !1);
	}
	return r;
}
function mh(e, t, n) {
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
var hh = w().trim().min(1).max(200), gh = w().trim().min(1).max(4e3), _h = w().refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), vh = w().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), yh = a({
	operationId: hh,
	name: hh,
	customerId: hh,
	locationId: hh.optional(),
	plannedDate: _h,
	locationNote: w().trim().max(500).default("")
}).strict(), bh = a({
	name: hh,
	due: _h,
	priority: D([
		"Low",
		"Normal",
		"High"
	]),
	notes: gh
}).strict(), xh = a({
	id: hh,
	expectedRevision: v().int().positive(),
	outcome: gh,
	followup: bh.optional()
}).strict(), Sh = a({
	id: hh,
	action: hh,
	actorId: hh,
	at: vh,
	note: w().optional()
}).strict(), Ch = a({
	id: hh,
	operationId: hh,
	creationFingerprint: w().min(1).max(3e3),
	name: hh,
	customerId: hh,
	customerName: hh,
	locationId: hh.optional(),
	locationName: w().max(200).optional(),
	locationNote: w().max(500),
	plannedDate: _h,
	status: D([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: v().int().positive(),
	ownerId: hh,
	createdAt: vh,
	updatedAt: vh,
	checkInAt: vh.optional(),
	checkInBy: hh.optional(),
	checkOutAt: vh.optional(),
	checkOutBy: hh.optional(),
	outcome: gh.optional(),
	completionFingerprint: w().optional(),
	followupTaskId: hh.optional(),
	history: n(Sh).min(1)
}).strict(), wh = [], Th = 0, Eh = /* @__PURE__ */ new Set(), Dh = () => {
	Th++, Eh.forEach((e) => e());
}, Oh = () => j.require("sales.write").userId, kh = () => (/* @__PURE__ */ new Date()).toISOString(), Ah = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function jh(e) {
	let t = wh.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function Mh(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function Nh(e) {
	let t = kh();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function Ph(e) {
	return wh = [...wh.filter((t) => t.id !== e.id), e], Dh(), e;
}
function Fh(e, t) {
	let n = M.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
b("salesVisits", {
	repository: {
		subscribe(e) {
			return Eh.add(e), () => {
				Eh.delete(e);
			};
		},
		getSnapshot: () => wh,
		getAll: () => wh,
		create(e) {
			let t = Oh(), n = yh.parse(e), r = JSON.stringify(n), i = wh.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = Fh(n.customerId, n.locationId), o = kh();
			return Ph({
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
				history: [Ah("Planned", t, o)]
			});
		},
		update(e) {
			let t = Oh(), n = yh.omit({ operationId: !0 }).extend({
				id: hh,
				expectedRevision: v().int().positive()
			}).strict().parse(e), r = jh(n.id);
			if (Mh(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = Fh(n.customerId, n.locationId), a = Nh(r), o = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, Ah("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete o.locationId, delete o.locationName, n.locationId && (o.locationId = n.locationId, o.locationName = i.locations.find((e) => e.id === n.locationId).name), Ph(o);
		},
		checkIn(e) {
			let t = Oh(), n = a({
				id: hh,
				expectedRevision: v().int().positive()
			}).strict().parse(e), r = jh(n.id);
			if (r.status === "Checked in" && r.revision === n.expectedRevision + 1) return r;
			if (Mh(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			Fh(r.customerId, r.locationId);
			let i = Nh(r);
			return Ph({
				...r,
				status: "Checked in",
				revision: r.revision + 1,
				checkInAt: i,
				checkInBy: t,
				updatedAt: i,
				history: [...r.history, Ah("Checked in", t, i)]
			});
		},
		finish(e) {
			let t = Oh(), n = xh.parse(e), r = jh(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (Mh(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = Nh(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = fh.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), Ph({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, Ah("Completed", t, a, n.outcome)]
			});
		},
		cancel(e) {
			let t = Oh(), n = a({
				id: hh,
				expectedRevision: v().int().positive(),
				reason: gh
			}).strict().parse(e), r = jh(n.id);
			if (Mh(r, n.expectedRevision), !["Planned", "Checked in"].includes(r.status)) throw Error("Only an unfinished visit can be cancelled.");
			let i = Nh(r);
			return Ph({
				...r,
				status: "Cancelled",
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, Ah("Cancelled", t, i, n.reason)]
			});
		},
		addNote(e) {
			let t = Oh(), n = a({
				id: hh,
				expectedRevision: v().int().positive(),
				note: gh
			}).strict().parse(e), r = jh(n.id);
			Mh(r, n.expectedRevision);
			let i = Nh(r);
			return Ph({
				...r,
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, Ah("Note added", t, i, n.note)]
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
	snapshot: () => ({ visits: wh }),
	restore: (e) => {
		wh = e.visits;
	},
	publish: Dh,
	validate: (e, t) => {
		let r = a({ visits: n(Ch) }).strict().parse(e), i = t, o = /* @__PURE__ */ new Set();
		for (let e of r.visits) {
			if (o.has(e.operationId)) throw Error("Duplicate visit operation ID.");
			if (o.add(e.operationId), !i.customers.customers.find((t) => t.id === e.customerId) || e.locationId && !e.locationName) throw Error("Invalid visit customer/location reference.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.updatedAt < e.createdAt) throw Error("Invalid visit history.");
			if (yh.parse(JSON.parse(e.creationFingerprint)).operationId !== e.operationId || e.history[0].action !== "Planned" || e.history[0].actorId !== e.ownerId || e.history[0].at !== e.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!e.checkInAt != !!e.checkInBy || !!e.checkOutAt != !!e.checkOutBy || e.checkInAt && e.checkInAt < e.createdAt || e.checkOutAt && (!e.checkInAt || e.checkOutAt < e.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (e.status === "Planned" && (e.checkInAt || e.checkOutAt) || e.status === "Checked in" && (!e.checkInAt || e.checkOutAt) || e.status === "Completed" && (!e.checkInAt || !e.checkOutAt || !e.outcome || !e.completionFingerprint) || e.status !== "Completed" && (e.checkOutAt || e.outcome || e.followupTaskId || e.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (e.status === "Completed") {
				let t = a({
					outcome: gh,
					followup: bh.optional()
				}).strict().parse(JSON.parse(e.completionFingerprint));
				if (t.outcome !== e.outcome || !!t.followup != !!e.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (e.followupTaskId && !i.workspace_tasks.records.some((t) => t.id === e.followupTaskId && t.customerId === e.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Z = w().trim().min(1).max(200), Ih = w().trim().max(2e3).optional(), Lh = a({
	requestedArea: v().finite().positive().max(1e9).optional(),
	productId: Z,
	unitId: Z,
	quantity: v().positive().finite(),
	unitPrice: v().nonnegative().finite().optional(),
	priceBasis: D(["Inclusive", "Exclusive"]).optional()
}).strict(), Rh = a({
	description: w().trim().min(1).max(500),
	accountId: Z,
	quantity: v().positive().finite(),
	unitCost: v().nonnegative().finite(),
	taxCode: Z,
	priceBasis: D(["Inclusive", "Exclusive"]).optional()
}).strict(), zh = a({
	kind: D(["ORDER", "INVOICE"]),
	customerId: Z,
	locationId: Z.or(g("")).optional(),
	accountingContactId: Z.or(g("")).optional(),
	documentDate: Z,
	dueDate: Z.optional(),
	customerReference: Ih,
	notes: Ih,
	lines: n(Lh).min(1).max(500)
}).strict(), Bh = a({
	kind: g("EXPENSE"),
	supplierId: Z,
	supplierInvoiceNumber: Z,
	documentDate: Z,
	dueDate: Z,
	notes: Ih,
	lines: n(Rh).min(1).max(500)
}).strict(), Vh = (e) => c([zh, Bh]).parse(e), Hh = v().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), Uh = a({
	operationId: Z,
	sourceName: w().trim().max(200),
	reviewed: _(),
	declared: a({
		subtotal: Hh,
		taxAmount: Hh,
		total: Hh
	}).strict(),
	payload: Bh.extend({ notes: w().trim().max(1e3).optional() })
}).strict();
function Wh(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function Gh(e) {
	let t = Di.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = rg(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = uo.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...Jh.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var Kh = () => I.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
Kh();
var qh = [], Jh = [], Yh = 0, Xh = /* @__PURE__ */ new Set(), Zh = () => {
	Yh++, Xh.forEach((e) => e());
}, Qh = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function $h(e, t) {
	return {
		action: e,
		actorId: j.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function eg(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = I.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function tg(e) {
	let t = I.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function ng(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = Di.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) tg(t.expenseAccountId);
	} else {
		let n = M.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) Et(t.productId, t.unitId, t.quantity, "sell");
	}
	eg(e.lines);
}
function rg(e) {
	if (T(e.documentDate, "Document date"), e.dueDate && (T(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? e.lines.map((e) => {
		tg(e.accountId);
		let t = S(e.taxCode), n = x(e.unitCost, t.taxRate, e.priceBasis), r = Qh(e.quantity * n), i = (e.priceBasis ?? y().basis) === "Inclusive" ? Qh(e.quantity * e.unitCost - r) : Qh(r * t.taxRate);
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
			lineTotal: Qh(r + i)
		};
	}) : e.lines.map((t) => br({
		customerId: e.customerId,
		documentDate: e.documentDate,
		draft: t
	})), n = yr(t);
	if (n.total <= 0 || !Number.isFinite(n.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: t,
		totals: n
	};
}
function ig(e) {
	let t = () => e === "sales" ? qh : Jh;
	function n(t) {
		return e === "sales" ? qh = [...qh.filter((e) => e.id !== t.id), t] : Jh = [...Jh.filter((e) => e.id !== t.id), t], Zh(), t;
	}
	let r = (e) => {
		let n = t().find((t) => t.id === e);
		if (!n || ne(n.id)) throw Error("Draft not found or is in the recycle bin.");
		return n;
	};
	function i(e, t) {
		if (e.revision !== t) throw Error("Draft changed. Reload before editing or approving.");
	}
	function o(e, t, r = {}, i) {
		return n({
			...e,
			...r,
			revision: e.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			history: [...e.history, $h(t, i)]
		});
	}
	let s = (e, t) => og.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: () => de(t()),
		reviewCapture(t) {
			if (j.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			return Gh(Uh.parse(t));
		},
		capture(n) {
			if (j.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			let r = Uh.parse(n);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = Wh(r);
			if (t().find((e) => e.operationId === r.operationId)) return s(r.operationId, i);
			let a = Gh(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return s(r.operationId, i);
		},
		save(o) {
			let s = a({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: v().int().positive().optional(),
				payload: e === "sales" ? zh : Bh
			}).strict().parse(o), c = JSON.stringify(s.payload);
			if (!s.id) {
				let e = t().find((e) => e.operationId === s.operationId);
				if (e) {
					if (ne(e.id)) throw Error("Recover the existing draft from the recycle bin.");
					if (e.creationFingerprint !== c) throw Error("Operation ID was used for different draft data.");
					return e;
				}
			}
			let l = s.id ? r(s.id) : void 0;
			if (l && (i(l, s.expectedRevision ?? -1), l.status !== "DRAFT")) throw Error("Only unapproved drafts can be edited. Reopen an approved draft before editing.");
			let u = rg(s.payload), d = (/* @__PURE__ */ new Date()).toISOString(), f = {
				id: l?.id ?? crypto.randomUUID(),
				operationId: l?.operationId ?? s.operationId,
				creationFingerprint: l?.creationFingerprint ?? c,
				revision: (l?.revision ?? 0) + 1,
				kind: s.payload.kind,
				status: "DRAFT",
				payload: s.payload.kind === "EXPENSE" ? s.payload : {
					...s.payload,
					lines: s.payload.lines.map((e, t) => ({
						...e,
						quantity: u.lines[t].quantity
					}))
				},
				recipient: s.payload.kind === "EXPENSE" ? void 0 : xt(s.payload.customerId, s.payload),
				...u,
				createdAt: l?.createdAt ?? d,
				updatedAt: d,
				history: [...l?.history ?? [], $h(l ? "Edited" : "Created")]
			};
			if (l && l.kind !== f.kind) throw Error("Document kind cannot change.");
			return ng(f), n(f);
		},
		approve(e, t) {
			let n = r(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (i(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return ng(n), o(n, "Approved", { status: "APPROVED" });
		},
		reopen(e, t, n) {
			let a = r(e);
			if (i(a, t), a.status !== "APPROVED" || n.trim().length < 3) throw Error("Only approved drafts can be reopened with a reason.");
			return o(a, "Reopened", { status: "DRAFT" }, n);
		},
		cancel(e, t, n) {
			let a = r(e);
			if (i(a, t), a.status === "POSTED" || a.status === "CANCELLED" || n.trim().length < 3) throw Error("Only unposted drafts can be cancelled with a reason.");
			return o(a, "Cancelled", { status: "CANCELLED" }, n);
		},
		post(e, t) {
			let n = r(e);
			if (n.status === "POSTED") return n;
			if (i(n, t), n.status !== "APPROVED") throw Error("Approve the draft before posting.");
			P(), un(n.payload.documentDate), ng(n);
			let a, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = Di.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), r = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: me("BILL", uo.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				uo.insertExpenseBill(r);
				let i = r.lines.filter((e) => e.lineSubtotal !== 0).map((e) => ({
					accountId: e.expenseAccountId,
					description: e.description,
					debit: e.lineSubtotal,
					credit: 0
				}));
				L.post({
					journalDate: r.billDate,
					description: "Expense bill " + r.billNumber,
					reference: r.supplierInvoiceNumber,
					sourceType: "SUPPLIER_BILL",
					sourceId: r.id,
					lines: [
						...i,
						...zr(r.lines, "paid", !0, r.totals.taxAmount),
						{
							accountId: I.requireBySystemRole("ACCOUNTS_PAYABLE").id,
							debit: 0,
							credit: r.totals.total
						}
					]
				}), a = r.id;
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
				a = s.kind === "ORDER" ? z.createManagedOrder(e).id : z.createManagedInvoice({
					...e,
					dueDate: s.dueDate
				}).id;
			}
			return o(n, "Posted", {
				status: "POSTED",
				documentId: a
			});
		},
		cancelOrder(e, t) {
			let n = r(e);
			if (n.kind !== "ORDER" || n.status !== "POSTED") throw Error("A confirmed managed order is required.");
			return z.cancelManagedOrder(n.documentId, t), o(n, "Order cancelled", {}, t);
		}
	};
}
var ag = ig("sales"), og = ig("expense"), sg = a({
	recipient: a({
		locationId: w().optional(),
		locationName: w().optional(),
		deliveryAddress: w().optional(),
		accountingContactId: w().optional(),
		accountingContactName: w().optional(),
		accountingEmail: w().email().optional()
	}).strict().optional(),
	id: Z,
	operationId: Z,
	creationFingerprint: w().max(1e6),
	revision: v().int().positive(),
	kind: D([
		"ORDER",
		"INVOICE",
		"EXPENSE"
	]),
	status: D([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	payload: c([zh, Bh]),
	lines: n(a({
		id: Z,
		description: w().min(1),
		quantity: v().finite().positive(),
		unitSymbol: w().min(1),
		unitPrice: v().finite().nonnegative().optional(),
		unitCost: v().finite().nonnegative().optional(),
		taxRate: v().finite().min(0).max(1),
		taxCode: Z,
		taxPaidAccountId: Z.optional(),
		taxCollectedAccountId: Z.optional(),
		lineSubtotal: v().finite().nonnegative(),
		taxAmount: v().finite().nonnegative(),
		lineTotal: v().finite().nonnegative()
	}).passthrough()).min(1),
	totals: a({
		subtotal: v().finite(),
		taxAmount: v().finite(),
		total: v().finite()
	}),
	documentId: Z.optional(),
	createdAt: Z,
	updatedAt: Z,
	history: n(a({
		action: Z,
		actorId: Z,
		at: Z,
		reason: w().optional()
	}).strict()).min(1)
}).strict();
for (let e of ["sales", "expense"]) b(e === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: e === "sales" ? ag : og,
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
	snapshot: () => e === "sales" ? { drafts: qh } : {
		drafts: Jh,
		options: Kh()
	},
	restore: (t) => {
		e === "sales" ? qh = t.drafts : (Jh = t.drafts, t.options);
	},
	publish: Zh,
	validate: (t, r) => {
		let { drafts: i } = a({
			drafts: n(sg),
			...e === "expense" ? { options: n(a({
				id: Z,
				code: Z,
				name: Z
			}).strict()) } : {}
		}).strict().parse(t);
		for (let t of i) {
			if (St(t.recipient), t.kind !== t.payload.kind || e === "expense" != (t.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (T(t.payload.documentDate), t.payload.dueDate && (T(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate)) throw Error("Draft due date is invalid.");
			let n = r, i = t.payload.kind === "EXPENSE" ? t.payload.supplierId : t.payload.customerId;
			if (!(t.payload.kind === "EXPENSE" ? n.suppliers.suppliers : n.customers.customers).some((e) => e.id === i) || t.lines.length !== t.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [e, r] of t.lines.entries()) {
				let i = t.payload.lines[e], a = r;
				if (t.kind !== "EXPENSE" && (et(a), Je(a, n.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea)) throw Error("Draft area requirement mismatch.");
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || Qh(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
				if (t.kind === "EXPENSE") {
					if (typeof a.unitCost != "number") throw Error("Expense line unit cost is invalid.");
					if (a.expenseAccountId !== i.accountId || !n.accounts.accounts.some((e) => e.id === a.expenseAccountId && e.type === "EXPENSE")) throw Error("Draft expense account reference is invalid.");
				} else if (typeof a.unitPrice != "number" || a.productId !== i.productId || a.unitId !== i.unitId || !n.products.products.some((e) => e.id === a.productId && e.units.some((e) => e.id === a.unitId))) throw Error("Draft product/unit reference is invalid.");
				for (let [e, t] of [["taxPaidAccountId", "ASSET"], ["taxCollectedAccountId", "LIABILITY"]]) if (a[e] && !n.accounts.accounts.some((n) => n.id === a[e] && n.type === t)) throw Error("Draft tax account reference is invalid.");
			}
			for (let e of [
				"subtotal",
				"taxAmount",
				"total"
			]) {
				let n = e === "subtotal" ? "lineSubtotal" : e === "total" ? "lineTotal" : "taxAmount";
				if (Qh(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Draft totals do not match lines.");
			}
			if (t.status === "POSTED") {
				let e = r;
				if (!(t.kind === "EXPENSE" ? e.supplierBills.supplierBills : t.kind === "ORDER" ? e.sales.salesOrders : e.sales.invoices).some((e) => e.id === t.documentId && e.managedDraftId === t.id && e.totals.total === t.totals.total)) throw Error("Posted draft source reference is invalid.");
			}
		}
	}
});
//#endregion
//#region src/features/recurring/recurringDates.ts
var cg = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function lg(e, t, n) {
	if (T(e), !Number.isSafeInteger(n) || n < 0 || !cg.includes(t)) throw Error("Invalid schedule occurrence.");
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
function ug(e, t) {
	T(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return T(r), r;
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var dg = w().trim().min(1).max(200), fg = w().refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), pg = a({
	operationId: dg,
	name: dg,
	sourceDraftId: dg,
	frequency: D(cg),
	firstDate: fg,
	endDate: fg
}).strict(), mg = a({
	id: dg,
	expectedRevision: v().int().positive(),
	name: dg,
	endDate: fg
}).strict(), hg = w().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), gg = a({
	id: dg,
	name: dg,
	kind: D(["INVOICE", "EXPENSE"]),
	status: D([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: v().int().positive(),
	operationId: dg,
	creationFingerprint: w().min(1).max(2e3),
	sourceDraftId: dg,
	payload: te(),
	frequency: D(cg),
	firstDate: fg,
	nextDate: fg,
	endDate: fg,
	occurrence: v().int().nonnegative(),
	termsDays: v().int().nonnegative(),
	createdAt: hg,
	updatedAt: hg
}).strict(), _g = a({
	id: dg,
	scheduleId: dg,
	date: fg,
	draftId: dg,
	actorId: dg,
	createdAt: hg
}).strict(), vg = 0, yg = /* @__PURE__ */ new Set(), bg = () => {
	vg++, yg.forEach((e) => e());
}, xg = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, Sg = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", Cg = (e) => e === "INVOICE" ? ag : og, wg = () => (/* @__PURE__ */ new Date()).toISOString();
function Tg(e) {
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
function Eg(e) {
	let t = () => xg[e], n = (e) => {
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
			j.require(Sg(e));
			let r = pg.parse(n), i = JSON.stringify(r), a = t().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = Cg(e).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== e || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = Tg(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = wg(), u = {
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
			return t().schedules = [...t().schedules, u], bg(), u;
		},
		update(i) {
			j.require(Sg(e));
			let a = mg.parse(i), o = n(a.id);
			if (r(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < t().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: wg()
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? s : e), bg(), s;
		},
		setStatus(i) {
			j.require(Sg(e));
			let o = a({
				id: dg,
				expectedRevision: v().int().positive(),
				status: D(["Active", "Paused"])
			}).strict().parse(i), s = n(o.id);
			if (r(s, o.expectedRevision), s.nextDate > s.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let c = {
				...s,
				status: o.status,
				revision: s.revision + 1,
				updatedAt: wg()
			};
			return t().schedules = t().schedules.map((e) => e.id === s.id ? c : e), bg(), c;
		},
		generate(i) {
			j.require(Sg(e));
			let o = a({
				id: dg,
				expectedRevision: v().int().positive(),
				date: fg
			}).strict().parse(i), s = n(o.id), c = t().runs.find((e) => e.scheduleId === s.id && e.date === o.date);
			if (c) return {
				schedule: s,
				run: c,
				draft: Cg(e).getAll().find((e) => e.id === c.draftId)
			};
			if (r(s, o.expectedRevision), s.status !== "Active") throw Error("Activate the schedule before generating.");
			if (o.date !== s.nextDate) throw Error("Generate the next occurrence in order.");
			if (o.date > C(wg())) throw Error("This occurrence is not due yet.");
			if (o.date > s.endDate) throw Error("The schedule has ended.");
			let l = lg(s.firstDate, s.frequency, s.occurrence + 1), u = structuredClone(s.payload);
			u.documentDate = o.date, u.dueDate = ug(o.date, s.termsDays), u.kind === "EXPENSE" && (u.supplierInvoiceNumber = u.supplierInvoiceNumber.slice(0, 170) + " [" + o.date + "]");
			let d = Cg(e).save({
				operationId: "recurring:" + s.id + ":" + o.date,
				payload: u
			}), f = wg(), p = {
				id: crypto.randomUUID(),
				scheduleId: s.id,
				date: o.date,
				draftId: d.id,
				actorId: j.current().userId,
				createdAt: f
			}, m = {
				...s,
				nextDate: l,
				occurrence: s.occurrence + 1,
				status: l > s.endDate ? "Ended" : "Active",
				revision: s.revision + 1,
				updatedAt: f
			};
			return t().schedules = t().schedules.map((e) => e.id === s.id ? m : e), t().runs = [...t().runs, p], bg(), {
				schedule: m,
				run: p,
				draft: d
			};
		}
	};
}
var Dg = Eg("INVOICE"), Og = Eg("EXPENSE");
for (let e of ["INVOICE", "EXPENSE"]) b(e === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: e === "INVOICE" ? Dg : Og,
	read: e === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: Sg(e),
		update: Sg(e),
		setStatus: Sg(e),
		generate: Sg(e)
	},
	snapshot: () => structuredClone(xg[e]),
	restore: (t) => {
		xg[e] = t;
	},
	publish: bg,
	validate: (t, r) => {
		a({
			schedules: n(gg),
			runs: n(_g)
		}).strict().parse(t);
		let i = t, o = r;
		for (let t of i.schedules) {
			if (t.kind !== e || ![
				"Active",
				"Paused",
				"Ended"
			].includes(t.status) || !Number.isSafeInteger(t.revision) || t.revision < 1 || !Number.isSafeInteger(t.occurrence) || t.occurrence < 0 || !Number.isInteger(t.termsDays) || t.termsDays < 0 || t.payload.kind !== e) throw Error("Invalid recurring schedule.");
			if (pg.parse({
				operationId: t.operationId,
				name: t.name,
				sourceDraftId: t.sourceDraftId,
				frequency: t.frequency,
				firstDate: t.firstDate,
				endDate: t.endDate
			}), Vh(t.payload), !t.id || !t.creationFingerprint || !Number.isFinite(Date.parse(t.createdAt)) || !Number.isFinite(Date.parse(t.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (T(t.payload.documentDate), T(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate || t.termsDays !== Math.round((Date.parse(t.payload.dueDate + "T00:00:00Z") - Date.parse(t.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (t.payload.kind === "EXPENSE") {
				if (!o.suppliers.suppliers.some((e) => e.id === t.payload.supplierId) || t.payload.lines.some((e) => !o.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!o.customers.customers.some((e) => e.id === t.payload.customerId) || t.payload.lines.some((e) => !o.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (t.status === "Ended" != t.nextDate > t.endDate) throw Error("Recurring end status is inconsistent.");
			if (t.nextDate !== lg(t.firstDate, t.frequency, t.occurrence) || t.endDate < t.firstDate) throw Error("Invalid recurring dates.");
			let n = (e === "INVOICE" ? o.managedSalesDocuments : o.expenseBillDrafts).drafts.find((e) => e.id === t.sourceDraftId);
			if (!n || n.kind !== e) throw Error("Recurring template source is missing.");
			let r = i.runs.filter((e) => e.scheduleId === t.id);
			if (r.length !== t.occurrence || new Set(r.map((e) => e.date)).size !== r.length) throw Error("Recurring run history does not match schedule.");
			for (let e = 0; e < r.length; e++) if (!r.some((n) => n.date === lg(t.firstDate, t.frequency, e))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let t of i.runs) {
			let n = i.schedules.find((e) => e.id === t.scheduleId), r = (e === "INVOICE" ? o.managedSalesDocuments : o.expenseBillDrafts).drafts.find((e) => e.id === t.draftId);
			if (!n || !r || r.kind !== e || r.operationId !== "recurring:" + n.id + ":" + t.date || !t.actorId || !Number.isFinite(Date.parse(t.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = w().trim().min(1).max(200), kg = v().finite().positive(), Ag = v().finite().nonnegative(), jg = a({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: w().trim().min(3).max(2e3),
	lines: n(a({
		matchId: Q,
		quantity: kg
	}).strict()).min(1).max(500)
}).strict(), Mg = a({
	id: Q,
	matchId: Q,
	supplierBillLineId: Q,
	goodsReceiptId: Q,
	goodsReceiptLineId: Q,
	productId: Q,
	unitId: Q,
	baseUnitId: Q,
	sku: Q,
	description: w(),
	unitSymbol: Q,
	quantity: kg,
	conversionToBase: kg,
	quantityBase: kg,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: Ag,
	inventoryValue: Ag,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), Ng = a({
	id: Q,
	returnNumber: Q,
	operationId: Q,
	requestFingerprint: w().max(1e6),
	supplierBillId: Q,
	supplierBillNumber: Q,
	supplierId: Q,
	supplierName: Q,
	supplierCreditId: Q,
	returnDate: Q,
	reason: w().min(3).max(2e3),
	status: D(["POSTED", "VOID"]),
	lines: n(Mg).min(1),
	inventoryValue: Ag,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: w().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), Pg = [], Fg = 0, Ig = /* @__PURE__ */ new Set(), Lg = () => {
	Fg++, Ig.forEach((e) => e());
}, Rg = (e) => Math.round(e * 1e4) / 1e4, zg = (e) => Math.round(e * 100) / 100;
function Bg(e, t, n) {
	if (va.getAll().some((r) => r.siteId === t && r.productId === n && C(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function Vg(e) {
	let t = uo.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : no.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = Wa.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? Ze(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = Pg.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
b("physicalSupplierReturns", {
	repository: {
		create(e) {
			let t = jg.parse(e), n = JSON.stringify(t), r = Pg.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			P(), T(t.returnDate, "Return date"), un(t.returnDate);
			let i = uo.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = Vg(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (Rg(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = Xe(n.productId), i = Ze(n.productId, n.unitId), s = ra.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				Bg(t.returnDate, s.id, r.id);
				let c = Rg(e.quantity * n.conversionToBase);
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
				c.set(t, Rg((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((La.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: Rg((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(Pg.length + 1).padStart(5, "0"), f = U.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				La.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = ca.create({
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
				}), r = ja({
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
			}), m = zg(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? L.post({
				journalDate: t.returnDate,
				description: `Physical supplier return ${d}`,
				reference: f.creditNumber,
				sourceType: "SUPPLIER_RETURN",
				sourceId: u,
				lines: [{
					accountId: I.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id,
					debit: m,
					credit: 0
				}, {
					accountId: I.requireBySystemRole("INVENTORY").id,
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
				createdBy: j.current()?.userId ?? "local-test"
			};
			return Pg = [g, ...Pg], Lg(), g;
		},
		reverse(e) {
			let t = a({
				returnId: Q,
				voidDate: Q,
				reason: w().trim().min(3).max(2e3)
			}).strict().parse(e), n = Pg.find((e) => e.id === t.returnId);
			if (!n) throw Error("Supplier return not found.");
			if (n.status === "VOID") return n;
			if (P(), T(t.voidDate, "Reversal date"), un(t.voidDate), t.voidDate < n.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of n.lines) Bg(t.voidDate, e.siteId, e.productId);
			let r = U.getById(n.supplierCreditId);
			if ((r.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > t.voidDate) || U.getAllocationsByCredit(r.id).some((e) => e.reversedAt && C(e.reversedAt) > t.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			U.voidReturnCredit({
				supplierCreditId: n.supplierCreditId,
				reason: t.reason,
				voidDate: t.voidDate
			});
			let i = n.lines.map((e) => {
				La.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let r = ca.create({
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
				}), i = Ma({
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
			n.journalId && L.reverse({
				journalEntryId: n.journalId,
				reversalDate: t.voidDate,
				reason: t.reason
			});
			let o = {
				...n,
				status: "VOID",
				lines: i,
				voidDate: t.voidDate,
				voidReason: t.reason,
				voidedAt: (/* @__PURE__ */ new Date()).toISOString(),
				voidedBy: j.current()?.userId ?? "local-test"
			};
			return Pg = Pg.map((e) => e.id === n.id ? o : e), Lg(), o;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: Pg }),
	restore: (e) => {
		Pg = e.returns;
	},
	publish: Lg,
	validate: (e, t) => {
		let r = a({ returns: n(Ng) }).strict().parse(e), i = t, o = /* @__PURE__ */ new Set();
		for (let e of r.returns) {
			T(e.returnDate), e.voidDate && T(e.voidDate);
			let t = jg.parse(JSON.parse(e.requestFingerprint));
			if (o.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			o.add(e.operationId);
			let n = i.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), r = i.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !r || e.status === "VOID" != (r.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (zg(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let r = i.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), a = i.costMovements.movements.find((e) => e.id === t.costMovementId), o = i.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = i.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!r || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || r.productId !== t.productId || !a || !o || a.referenceType !== "SUPPLIER_RETURN" || a.referenceId !== e.id || a.inventoryMovementId !== o.id || a.siteId !== t.siteId || a.productId !== t.productId || a.unitCostBase !== t.unitCostBase || a.quantityBase !== -t.quantityBase || zg(-a.valueChange) !== zg(t.inventoryValue) || Rg(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || C(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = i.costMovements.movements.find((e) => e.id === t.voidCostMovementId), r = i.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !r || n.inventoryMovementId !== r.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || zg(n.valueChange) !== zg(t.inventoryValue) || r.referenceType !== "SUPPLIER_RETURN_VOID" || r.quantityBase !== t.quantityBase || r.referenceId !== e.id || C(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
				}
			}
			let a = /* @__PURE__ */ new Set();
			for (let n of e.lines) {
				if (a.has(n.matchId)) throw Error("Duplicate return receipt match.");
				a.add(n.matchId);
				let e = t.lines.find((e) => e.matchId === n.matchId);
				if (!e || e.quantity !== n.quantity) throw Error("Supplier return request quantities mismatch.");
			}
			if (t.lines.length !== e.lines.length) throw Error("Supplier return request line count mismatch.");
			for (let t of new Set(e.lines.map((e) => e.supplierBillLineId))) {
				let n = Rg(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!r.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !i.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of i.supplierCredits.supplierCredits) if (e.physicalReturnId && !r.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of i.receiptMatches.matches) if (Rg(r.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var Hg = w().min(1).max(200), Ug = w().max(2e4), Wg = Ug.optional(), Gg = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], Kg = a({
	operationId: Hg,
	sourceId: Hg,
	kind: D(Gg),
	expectedUpdatedAt: Hg,
	templateId: Hg.optional()
}).strict(), qg = v().finite().nonnegative(), Jg = a({
	itemType: D([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: Hg,
	sku: Ug,
	description: Ug,
	unitSymbol: Ug,
	quantity: v().positive().finite(),
	unitPrice: qg,
	lineSubtotal: qg,
	taxAmount: qg,
	lineTotal: qg,
	taxCode: Wg,
	taxRate: v().finite().min(0).max(1).optional(),
	requestedArea: v().positive().finite().optional(),
	areaPerPack: v().positive().finite().optional(),
	coveredArea: v().positive().finite().optional()
}).strict(), Yg = a({
	locationId: Wg,
	locationName: Wg,
	deliveryAddress: Wg,
	accountingContactId: Wg,
	accountingContactName: Wg,
	accountingEmail: Wg
}).strict(), Xg = a({
	id: Hg,
	revision: Hg,
	name: Ug,
	subject: Ug,
	body: Ug,
	footer: Ug,
	paper: D(["A4", "Letter"])
}).strict(), Zg = a({
	id: Hg,
	operationId: Hg,
	requestFingerprint: Ug,
	preparedAt: Hg,
	preparedBy: Hg,
	sourceId: Hg,
	kind: D(Gg),
	sourceUpdatedAt: Hg,
	documentNumber: Hg,
	status: Hg,
	documentDate: Hg,
	dueDate: Wg,
	expiryDate: Wg,
	reference: Wg,
	notes: Wg,
	customerId: Hg,
	customerName: Ug,
	customerCode: Ug,
	customerIdentifier: Wg,
	recipient: Yg.optional(),
	issuer: a({
		name: Ug,
		tradingName: Wg,
		identifier: Wg,
		address: Wg,
		email: Wg,
		phone: Wg,
		currency: Hg
	}).strict(),
	lines: n(Jg).min(1),
	totals: a({
		subtotal: qg,
		taxAmount: qg,
		total: qg
	}).strict(),
	amountPaid: qg.optional(),
	amountDue: qg.optional(),
	template: Xg,
	subject: Ug,
	body: Ug
}).strict();
function Qg(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = R.getById(t);
		if (!e) throw Error("Credit note was not found.");
		return {
			...e,
			type: "CREDIT_NOTE",
			documentNumber: e.creditNoteNumber,
			documentDate: e.creditDate
		};
	}
	let n = z.getById(t);
	if (!n || n.type !== e) throw Error("Sales document was not found.");
	return n;
}
var $g = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function e_() {
	return (fe.templates ?? []).filter((e) => e.status === "Active" && [
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
var t_ = [];
e_();
var n_ = 0, r_ = /* @__PURE__ */ new Set(), i_ = () => {
	n_++, r_.forEach((e) => e());
};
function a_(e, t) {
	let n = t ? fe.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === $g(e)) : void 0;
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
var o_ = [
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
function s_(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!o_.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function c_(e) {
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
var l_ = { prepare(e) {
	let t = Kg.parse(e), n = JSON.stringify(t), r = t_.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = Qg(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = M.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = y(), s = a_(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
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
		preparedBy: j.current()?.userId ?? "local-test",
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
		lines: i.lines.map(c_),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: s_(s.footer, l)
		},
		subject: s_(s.subject, l),
		body: s_(s.body, l)
	};
	return u_(u), t_ = [u, ...t_], i_(), u;
} };
function u_(e) {
	let t = Zg.parse(e);
	if (St(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = Kg.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (et(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
b("preparedSalesOutputs", {
	repository: l_,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: t_,
		templates: e_()
	}),
	restore: (e) => {
		t_ = e.artifacts, e.templates;
	},
	publish: i_,
	validate: (e, t) => {
		let r = a({
			artifacts: n(Zg),
			templates: n(a({
				id: Hg,
				name: Ug,
				kind: Hg
			}).strict())
		}).strict().parse(e), i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let e of r.artifacts) {
			if (u_(e), i.has(e.id) || o.has(e.operationId)) throw Error("Duplicate prepared output.");
			i.add(e.id), o.add(e.operationId);
			let n = t, r = e.kind === "CREDIT_NOTE" ? n.customerCredits.creditNotes.find((t) => t.id === e.sourceId) : [
				...n.sales.quotes,
				...n.sales.salesOrders,
				...n.sales.invoices
			].find((t) => t.id === e.sourceId && t.type === e.kind);
			if (!r || r.customerId !== e.customerId) throw Error("Prepared output source reference is invalid.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/dispatchRepository.ts
var d_ = w().trim().min(1).max(200), f_ = a({
	operationId: d_,
	salesOrderId: d_,
	siteId: d_,
	fulfilmentDate: d_,
	lines: n(a({
		salesOrderLineId: d_,
		fulfilledQuantity: v().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function p_() {
	return z.getAll().filter((e) => e.type === "SALES_ORDER" && [
		"CONFIRMED",
		"PARTIALLY_FULFILLED",
		"INVOICED"
	].includes(e.status)).filter((e) => e.type === "SALES_ORDER" && (e.status !== "INVOICED" || e.invoiceIds.some((e) => {
		let t = z.getById(e);
		return t?.type === "INVOICE" && t.status !== "VOID";
	}))).map((e) => ({
		id: e.id,
		number: e.documentNumber,
		date: e.documentDate,
		delivery: e.recipient?.deliveryAddress,
		store: e.recipient?.locationName,
		lines: e.lines.filter(qe).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: Tu.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
p_();
var m_ = [], h_ = 0, g_ = /* @__PURE__ */ new Set(), __ = () => {
	h_++, g_.forEach((e) => e());
};
b("salesDispatch", {
	repository: {
		record(e) {
			let t = f_.parse(e), n = JSON.stringify(t), r = m_.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return Tu.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (P(), T(t.fulfilmentDate), un(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = Tu.create(t);
			return m_ = [...m_, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], __(), i;
		},
		reverse(e) {
			let t = a({
				fulfilmentId: d_,
				voidDate: d_,
				reason: w().trim().min(3).max(1e3)
			}).strict().parse(e);
			P(), T(t.voidDate), un(t.voidDate);
			let n = Tu.getAll().find((e) => e.id === t.fulfilmentId);
			return n?.status === "VOIDED" ? n : Tu.void(t);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: p_(),
		requests: m_
	}),
	restore: (e) => {
		e.orders, m_ = e.requests;
	},
	publish: __,
	validate: (e, t) => {
		let r = a({
			orders: n(a({
				id: d_,
				number: d_,
				date: d_,
				delivery: w().optional(),
				store: w().optional(),
				lines: n(a({
					id: d_,
					sku: w(),
					description: w(),
					unit: w(),
					quantity: v().finite().positive(),
					fulfilled: v().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: n(a({
				id: d_,
				fingerprint: w().max(1e6),
				fulfilmentId: d_
			}).strict())
		}).strict().parse(e), i = t.fulfilments.fulfilments;
		if (r.requests.some((e) => !i.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/purchases/data/supplierBillBalanceAsAtService.ts
function v_(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && y_(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = b_(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && y_(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = b_(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && y_(n.reversedAt) <= r ? t : t + n.amount, 0)), o = b_(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: b_(Math.max(0, o - i - a))
	};
}
function y_(e) {
	return C(e);
}
function b_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function x_(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && S_(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = C_(e.totals.total), i = C_(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && S_(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: C_(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function S_(e) {
	return C(e);
}
function C_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function w_(e, t, n = [], r = [], i = [], a = j_()) {
	let o = D_(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = v_(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = E_(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = A_(r.reduce((t, n) => n.supplierId === e.id ? t + x_(n, i, a).amountAvailable : t, 0)), p = A_(s), m = A_(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: A_(c),
		aging: O_(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function T_(e, t, n = [], r = [], i = [], a = j_()) {
	let o = D_(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = w_(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: A_(s),
		unallocatedCredit: A_(c),
		totalOutstanding: A_(l),
		overdueAmount: A_(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: O_(o)
	};
}
function E_(e, t = j_()) {
	let n = k_(e), r = k_(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function D_() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function O_(e) {
	return {
		current: A_(e.current),
		days1To30: A_(e.days1To30),
		days31To60: A_(e.days31To60),
		days61To90: A_(e.days61To90),
		days90Plus: A_(e.days90Plus)
	};
}
function k_(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function A_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function j_() {
	return C((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function M_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function N_({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = T_(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = M_(Oc(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = M_(c.totalOutstanding), f = M_(d - u);
	return {
		asOfDate: s,
		grossOutstanding: M_(c.grossOutstanding),
		unallocatedCredit: M_(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function P_(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function F_(e) {
	return e.slice(0, 10);
}
function I_(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function L_(e, t) {
	P_(t);
	let n = e.filter((e) => F_(e.occurredAt) <= t).slice().sort(I_), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = B(n.quantityOnHand + e.quantityBase), a = Wi(n.inventoryValue + e.valueChange);
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
		let t = ra.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = Xe(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : Ui(e.inventoryValue / e.quantityOnHand);
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
		totalQuantity: B(i.reduce((e, t) => e + t.quantityOnHand, 0)),
		totalInventoryValue: Wi(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function R_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function z_(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function B_({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	z_(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = L_(n, r), o = R_(Oc(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = R_(a.totalInventoryValue), c = R_(s - o);
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
var V_ = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = w().trim().min(1).max(200), H_ = v().finite().refine((e) => V_(e) === e, "Amounts must use cents precision"), U_ = a({
	accountId: $,
	debit: H_.nonnegative(),
	credit: H_.nonnegative()
}).strict(), W_ = a({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: H_
}).strict(), G_ = a({
	operationId: $,
	date: $,
	reason: w().trim().min(3).max(1e3),
	gl: n(U_).min(2).max(5e3),
	ar: n(W_).max(1e4),
	ap: n(W_).max(1e4),
	banks: n(a({
		bankAccountId: $,
		amount: H_
	}).strict()).max(500),
	stock: n(a({
		siteId: $,
		productId: $,
		quantity: v().positive().finite(),
		unitCost: v().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), K_ = [], q_ = 0, J_ = /* @__PURE__ */ new Set(), Y_ = () => {
	q_++, J_.forEach((e) => e());
};
function X_() {
	return E();
}
function Z_(e) {
	h(e), $t(e.sales), Un(e.customerCredits), k.update("supplierBills", e.supplierBills.supplierBills), k.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function Q_(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function $_(e) {
	let t = G_.parse(e);
	if (T(t.date, "Cutover date"), un(t.date), P(), K_.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = X_();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	Q_(t.gl.map((e) => e.accountId), "GL account"), Q_(t.banks.map((e) => e.bankAccountId), "bank"), Q_(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = Ac({
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
	}), i = N_({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = B_({
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
	let o = I.getAll(), s = (e) => I.requireBySystemRole(e).id, c = (e) => V_(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = I.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = V_(t.gl.reduce((e, t) => e + t.debit, 0)), u = V_(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = V_(t.ar.reduce((e, t) => e + t.amount, 0)), f = V_(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		Q_(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (T(i.date), T(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = Xe(e.productId), n = ra.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = V_(p + V_(e.quantity * e.unitCost));
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
b("openingBalances", {
	repository: {
		preview(e) {
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = $_(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: V_(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = G_.parse(e), n = JSON.stringify(t), r = K_.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = $_(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: j.current()?.userId ?? "",
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
			}, l = (e) => I.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
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
				let g = e === "ar" == t.amount > 0, _ = L.post({
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
			a.journals = X_().journals, Z_(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: V_(d),
				credit: V_(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, V_((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = L.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = Xe(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = ca.create({
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
				La.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = Aa({
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
			return K_ = [...K_, c], Y_(), c;
		},
		reverse(e) {
			if (T(e.date), un(e.date), P(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = K_.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = X_();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) al(e);
			for (let n of t.journalIds) L.reverse({
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = X_().journals, Z_(n), K_ = K_.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), Y_(), K_.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: K_ }),
	restore: (e) => {
		K_ = e.batches;
	},
	publish: Y_,
	validate: (e, t) => {
		let r = a({ batches: n(a({
			id: $,
			operationId: $,
			date: $,
			status: D(["POSTED", "REVERSED"]),
			journalIds: n($),
			invoiceIds: n($),
			billIds: n($),
			customerCreditIds: n($),
			supplierCreditIds: n($),
			fingerprint: w().min(1).max(5e7),
			reason: w().min(3),
			actor: $,
			createdAt: $,
			movementIds: n($),
			costMovementIds: n($),
			priorJournalIds: n($),
			priorMovementIds: n($),
			priorStock: n(a({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: v().finite().nonnegative(),
				updatedAt: $
			}).strict()),
			priorCost: n(a({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: v().finite().nonnegative(),
				averageCostPerBaseUnit: v().finite().nonnegative(),
				inventoryValue: v().finite().nonnegative(),
				costingMethod: g("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: $
			}).strict()),
			reversalDate: $.optional(),
			reversalReason: w().optional()
		}).strict()) }).strict().parse(e);
		for (let e of r.batches) {
			let n = G_.parse(JSON.parse(e.fingerprint));
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
var ev = (e) => Math.round((e + 2 ** -52) * 100) / 100, tv = w().trim().min(1).max(200), nv = a({
	operationId: tv,
	paymentDate: tv,
	bankAccountId: tv,
	reference: w().max(500),
	allocations: n(a({
		supplierBillId: tv,
		amount: v().finite().positive().refine((e) => ev(e) === e)
	}).strict()).min(1).max(500)
}).strict(), rv = [], iv = 0, av = /* @__PURE__ */ new Set(), ov = () => {
	iv++, av.forEach((e) => e());
}, sv = () => {
	let e = j.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function cv(e, t) {
	return {
		action: e,
		reason: t,
		actor: sv(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function lv(e) {
	let t = rv.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function uv(e) {
	return rv = rv.map((t) => t.id === e.id ? e : t), ov(), e;
}
function dv(e) {
	T(e.paymentDate, "Payment date");
	let t = Ar.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = uo.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
b("paymentBatches", {
	repository: {
		create(e) {
			let t = nv.parse(e), n = JSON.stringify(t), r = rv.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			dv(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: sv(),
				paymentIds: [],
				history: [cv("Created")]
			};
			return rv = [...rv, i], ov(), i;
		},
		approve(e) {
			let t = lv(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return dv(t), uv({
				...t,
				status: "APPROVED",
				approvedBy: sv(),
				history: [...t.history, cv("Approved")]
			});
		},
		post(e) {
			let t = lv(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			P(), dv(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = uo.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => _o.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			if (r.some((e) => e.status !== "POSTED")) throw Error("Batch payment is not posted. Inspect the prior operation before retrying.");
			return uv({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, cv("Payments recorded")]
			});
		},
		cancel(e) {
			let t = lv(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return uv({
				...t,
				status: "CANCELLED",
				history: [...t.history, cv("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = lv(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			P();
			for (let e of t.paymentIds) {
				let t = _o.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				Ct("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) _o.reverse(n, e.reason);
			return uv({
				...t,
				status: "REVERSED",
				history: [...t.history, cv("Reversed", e.reason)]
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
	snapshot: () => ({ batches: rv }),
	restore: (e) => {
		rv = e.batches;
	},
	validate: (e, t) => {
		let r = nv.extend({
			id: tv,
			fingerprint: w(),
			status: D([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: tv,
			approvedBy: tv.optional(),
			paymentIds: n(tv),
			history: n(a({
				action: tv,
				actor: tv,
				at: tv,
				reason: w().optional()
			}).strict())
		}).strict(), i = a({ batches: n(r) }).strict().parse(e), o = t, s = o.supplierPayments.supplierPayments, c = o.bankAccounts.bankAccounts, l = o.supplierBills.supplierBills, u = /* @__PURE__ */ new Set();
		if (new Set(i.batches.map((e) => e.id)).size !== i.batches.length || new Set(i.batches.map((e) => e.operationId)).size !== i.batches.length) throw Error("Duplicate payment batch identity or operation.");
		let d = (e) => JSON.stringify(e.map((e) => ({
			supplierBillId: e.supplierBillId,
			amount: e.amount
		})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId)));
		for (let e of i.batches) {
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
			if (e.fingerprint !== JSON.stringify(t) || !c.some((t) => t.id === e.bankAccountId) || new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length || e.allocations.some((e) => !l.some((t) => t.id === e.supplierBillId))) throw Error("Payment batch creation data or references are invalid.");
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
			let i = /* @__PURE__ */ new Map();
			for (let t of e.allocations) {
				let e = l.find((e) => e.id === t.supplierBillId).supplierId;
				i.set(e, [...i.get(e) ?? [], t]);
			}
			if (e.paymentIds.length !== i.size || new Set(e.paymentIds).size !== e.paymentIds.length) throw Error("Payment batch supplier groups are incomplete or duplicated.");
			let a = /* @__PURE__ */ new Set();
			for (let t of e.paymentIds) {
				let n = s.find((e) => e.id === t), r = n && i.get(n.supplierId);
				if (u.has(t) || !n || !r || a.has(n.supplierId) || n.operationId !== "batch:" + e.id + ":" + n.supplierId || n.bankAccountId !== e.bankAccountId || n.paymentDate !== e.paymentDate || n.method !== "BANK_TRANSFER" || (n.reference ?? "") !== e.reference.trim() || n.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED") || d(n.allocations) !== d(r) || n.amount !== ev(r.reduce((e, t) => e + t.amount, 0))) throw Error("Payment batch payment relationships are invalid.");
				if (u.add(t), a.add(n.supplierId), !o.journals.journalEntries.some((e) => e.sourceType === "SUPPLIER_PAYMENT" && e.sourceId === t)) throw Error("A batch payment journal is missing.");
			}
		}
	},
	publish: ov
});
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var fv = (e) => Math.round((e + 2 ** -52) * 100) / 100, pv = w().min(1).max(200), mv = [], hv = 0, gv = /* @__PURE__ */ new Set(), _v = () => {
	hv++, gv.forEach((e) => e());
};
function vv(e) {
	let t = Ar.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function yv(e) {
	let t = mv.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function bv(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = cc.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function xv(e) {
	return mv = mv.map((t) => t.id === e.id ? e : t), _v(), e;
}
var Sv = (e, t) => qs(vv(e), L.getAll(), t).transactions;
function Cv(e) {
	if (e.date < vv(e.bankAccountId).openingBalanceDate) throw Error("Statement predates the current bank opening date.");
}
var wv = a({
	date: pv,
	description: w().trim().min(1).max(1e3),
	amount: v().finite().refine((e) => e !== 0 && fv(e) === e, "Enter a non-zero amount in cents"),
	reference: w().max(500).default(""),
	externalId: w().max(200).default("")
}).strict(), Tv = {
	importRows(e) {
		let t = a({
			bankAccountId: pv,
			rows: n(wv).min(1).max(1e4)
		}).strict().parse(e), r = vv(t.bankAccountId), i = 0, o = [...mv], s = [];
		for (let e of t.rows) {
			if (T(e.date, "Statement date"), e.date < r.openingBalanceDate) throw Error("Statement predates the bank opening date.");
			let t = JSON.stringify([r.id, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase()
			]]), n = o.find((e) => e.key === t);
			if (n) {
				if (e.externalId && (n.amount !== e.amount || n.date !== e.date || n.description !== e.description || n.reference !== e.reference)) throw Error("Bank transaction ID conflicts with an existing row.");
				i++;
				continue;
			}
			let a = cc.getLatestByBankAccount(r.id);
			if (a && e.date <= a.statementDate) throw Error("Cannot import new rows into a reconciled statement period.");
			let c = {
				...e,
				id: crypto.randomUUID(),
				key: t,
				bankAccountId: r.id,
				status: "UNMATCHED",
				ledgerIds: [],
				history: [{
					action: "Imported",
					date: (/* @__PURE__ */ new Date()).toISOString()
				}]
			};
			o.push(c), s.push(c);
		}
		return mv = o, _v(), {
			created: s.length,
			duplicates: i
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = Xu(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return Tv.importRows({
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
					l = fv(t - e);
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
		return T(e.asOfDate, "As-of date"), Sv(e.bankAccountId, e.asOfDate).filter((e) => e.journalStatus === "POSTED" && !e.correctionOnly && !mv.some((t) => t.ledgerIds.includes(e.id)));
	},
	match(e) {
		let t = yv(e.id);
		if (bv(t), Cv(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = Tv.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), r = e.ledgerIds.map((e) => n.find((t) => t.id === e));
		if (r.some((e) => !e) || fv(r.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return xv({
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
		let t = yv(e.id);
		return (fe["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		P();
		let t = yv(e.id), r = JSON.stringify(e.splits);
		if (t.status === "POSTED") {
			if (t.fingerprint !== r) throw Error("Line was already posted with different categorisation.");
			return t;
		}
		bv(t), Cv(t);
		let i = n(a({
			accountId: pv,
			amount: v().finite().positive().refine((e) => fv(e) === e),
			taxCode: pv
		}).strict()).min(1).max(100).parse(e.splits);
		if (fv(i.reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Split amounts must equal the statement total.");
		let o = vv(t.bankAccountId), s = t.amount < 0, c = i.flatMap((e) => {
			let t = I.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = se(e.taxCode), r = fv(e.amount / (1 + n)), i = fv(e.amount - r);
			return [{
				accountId: t.id,
				debit: s ? r : 0,
				credit: s ? 0 : r
			}, ...i ? [{
				accountId: (s ? S(e.taxCode).taxPaidAccountId : S(e.taxCode).taxCollectedAccountId) || I.requireBySystemRole(s ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: s ? i : 0,
				credit: s ? 0 : i
			}] : []];
		}), l = L.post({
			journalDate: t.date,
			description: t.description,
			reference: t.reference,
			sourceType: "BANK_STATEMENT",
			sourceId: t.id + ":" + t.history.filter((e) => e.action === "Posted").length,
			lines: [{
				accountId: o.glAccountId,
				debit: s ? 0 : t.amount,
				credit: s ? -t.amount : 0
			}, ...c]
		}), u = l.lines.filter((e) => e.accountId === o.glAccountId).map((e) => l.id + ":" + e.id);
		return xv({
			...t,
			status: "POSTED",
			journalEntryId: l.id,
			ledgerIds: u,
			fingerprint: r,
			history: [...t.history, {
				action: "Posted",
				date: (/* @__PURE__ */ new Date()).toISOString()
			}]
		});
	},
	ignore(e) {
		let t = yv(e.id);
		if (bv(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return xv({
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
		P();
		let t = yv(e.id);
		if (T(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		for (let e of t.ledgerIds) al(e.split(":")[0]);
		let n = cc.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		return t.status === "POSTED" && t.journalEntryId && L.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), xv({
			...t,
			status: "UNMATCHED",
			ledgerIds: [],
			journalEntryId: void 0,
			fingerprint: void 0,
			history: [...t.history, {
				action: "Reverted",
				date: e.reversalDate,
				reason: e.reason
			}]
		});
	},
	reconcile(e) {
		if (un(e.statementDate), P(), T(e.statementDate, "Statement date"), !mv.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (mv.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = mv.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate), n = Sv(e.bankAccountId, e.statementDate);
		for (let e of t.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			let t = e.ledgerIds.map((e) => n.find((t) => t.id === e));
			if (!t.length || t.some((e) => !e || e.journalStatus !== "POSTED") || fv(t.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== e.amount) throw Error("Statement match is stale. Revert the statement line and review its ledger sources before reconciling.");
		}
		let r = t.flatMap((e) => e.ledgerIds);
		return cc.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...cc.getClearedTransactionIds(e.bankAccountId), ...r])]
		});
	}
}, Ev = a({
	id: pv,
	key: w(),
	bankAccountId: pv,
	date: pv,
	description: w(),
	reference: w(),
	amount: v().finite(),
	externalId: w(),
	status: D([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: n(pv),
	journalEntryId: w().optional(),
	fingerprint: w().optional(),
	history: n(a({
		action: w(),
		date: w(),
		reason: w().optional()
	}))
}).strict();
b("bankStatements", {
	repository: Tv,
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
	snapshot: () => ({ lines: mv }),
	restore: (e) => {
		mv = e.lines;
	},
	validate: (e, t) => {
		let r = a({ lines: n(Ev) }).strict().parse(e), i = t, o = i.bankAccounts.bankAccounts, s = i.journals.journalEntries, c = /* @__PURE__ */ new Set(), l = new Map(s.map((e) => [e.id, e])), u = new Map(s.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, {
			journal: e,
			entry: t
		}])));
		if (new Set(r.lines.map((e) => e.key)).size !== r.lines.length) throw Error("Duplicate bank statement import key.");
		for (let e of r.lines) {
			let t = o.find((t) => t.id === e.bankAccountId);
			if (!t) throw Error("Bank statement account is missing.");
			try {
				T(e.date), wv.parse({
					date: e.date,
					description: e.description,
					amount: e.amount,
					reference: e.reference,
					externalId: e.externalId
				});
			} catch {
				throw Error("Invalid bank statement date, amount or metadata.");
			}
			let r = JSON.stringify([e.bankAccountId, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase()
			]]);
			if (e.key !== r) throw Error("Bank statement import identity does not match its data.");
			let i;
			for (let t of e.history) {
				if (!Number.isFinite(Date.parse(t.date))) throw Error("Invalid bank statement history date.");
				if (!i && t.action === "Imported") i = "UNMATCHED";
				else if (i === "UNMATCHED" && [
					"Matched",
					"Posted",
					"Excluded"
				].includes(t.action)) {
					if (t.action === "Excluded" && (t.reason?.trim().length ?? 0) < 3) throw Error("Bank statement exclusion has no reason.");
					i = t.action === "Matched" ? "MATCHED" : t.action === "Posted" ? "POSTED" : "IGNORED";
				} else if (i && i !== "UNMATCHED" && t.action === "Reverted" && (t.reason?.trim().length ?? 0) >= 3) i = "UNMATCHED";
				else throw Error("Invalid bank statement lifecycle history.");
			}
			if (i !== e.status) throw Error("Bank statement status does not match its history.");
			if (e.status === "UNMATCHED" || e.status === "IGNORED") {
				if (e.ledgerIds.length || e.journalEntryId || e.fingerprint) throw Error("An unposted bank statement line cannot retain ledger links.");
				continue;
			}
			if (!e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Bank statement ledger links are missing or duplicated.");
			let s = 0;
			for (let n of e.ledgerIds) {
				let r = u.get(n), i = r?.journal, a = r?.entry;
				if (c.has(n) || !i || !a || a.accountId !== t.glAccountId || i.journalDate > e.date) throw Error("Bank statement ledger source is invalid or reused.");
				c.add(n), s = fv(s + a.debit - a.credit);
			}
			if (s !== e.amount) throw Error("Bank statement amount does not match its ledger links.");
			if (e.status === "MATCHED") {
				if (e.journalEntryId || e.fingerprint) throw Error("Matched bank statements cannot claim categorisation journals.");
			} else {
				let r = l.get(e.journalEntryId ?? ""), i = e.history.filter((e) => e.action === "Posted").length - 1, o = r?.lines.filter((e) => e.accountId === t.glAccountId).map((e) => r.id + ":" + e.id).sort();
				if (!r || r.status !== "POSTED" || r.sourceType !== "BANK_STATEMENT" || r.sourceId !== e.id + ":" + i || r.journalDate !== e.date || JSON.stringify(o) !== JSON.stringify([...e.ledgerIds].sort())) throw Error("Bank statement categorisation journal does not match its source.");
				try {
					if (fv(n(a({
						accountId: pv,
						amount: v().finite().positive().refine((e) => fv(e) === e),
						taxCode: pv
					}).strict()).min(1).max(100).parse(JSON.parse(e.fingerprint ?? "")).reduce((e, t) => e + t.amount, 0)) !== Math.abs(e.amount)) throw Error("Wrong split total.");
				} catch {
					throw Error("Bank statement categorisation fingerprint is invalid.");
				}
			}
		}
	},
	publish: _v
});
//#endregion
//#region src/features/supplier-prepayments/prepaymentReconciliation.ts
function Dv(e) {
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
	let v = _.reduce((e, t) => e + s(t.subledger), 0) / 100, ee = _.reduce((e, t) => e + s(t.gl), 0) / 100;
	return {
		asOfDate: o,
		subledger: v,
		gl: ee,
		difference: (s(v) - s(ee)) / 100,
		controls: _,
		rows: g,
		issues: c,
		reconciled: c.length === 0 && _.every((e) => e.difference === 0)
	};
}
//#endregion
//#region src/features/customer-deposits/depositReconciliation.ts
function Ov(e) {
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
	let v = _.reduce((e, t) => e + s(t.subledger), 0) / 100, ee = _.reduce((e, t) => e + s(t.gl), 0) / 100;
	return {
		asOfDate: o,
		subledger: v,
		gl: ee,
		difference: (s(v) - s(ee)) / 100,
		controls: _,
		rows: g,
		issues: c,
		reconciled: c.length === 0 && _.every((e) => e.difference === 0)
	};
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function kv(e) {
	let t = E(), n = [], r = (e, t, r) => n.push({
		code: e,
		message: t,
		...r ? { path: r } : {}
	});
	e.endDate >= C((/* @__PURE__ */ new Date()).toISOString()) && r("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of A.getUnresolved()) r("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && r("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of is()) r(e.code, `${e.entityId}: ${e.message}`);
	let a = i(j.current(), "payroll.read");
	for (let n of t.payroll?.runs ?? []) n.status === "Approved" && n.payDate <= e.endDate && r("PAYROLL_NOT_POSTED", a ? `Post, reopen or cancel approved payroll ${n.name} dated ${n.payDate}.` : "An approved payroll run must be resolved by an authorized payroll user before closing.", a ? "/payroll/pay-runs/" + encodeURIComponent(n.id) : void 0);
	for (let n of t.paymentBatches?.batches ?? []) n.status === "APPROVED" && n.paymentDate <= e.endDate && r("PAYMENT_BATCH_NOT_POSTED", `Post or cancel approved payment batch ${n.reference || n.id} dated ${n.paymentDate}.`, "/banking/payment-batches/" + encodeURIComponent(n.id));
	for (let [n, i, a, o] of [[
		"managedSalesDocuments",
		"INVOICE",
		"INVOICE_DRAFT_NOT_POSTED",
		"/sales/drafts/invoices/"
	], [
		"expenseBillDrafts",
		"EXPENSE",
		"EXPENSE_DRAFT_NOT_POSTED",
		"/purchases/expense-bills/"
	]]) for (let s of t[n]?.drafts ?? []) s.kind === i && s.status === "APPROVED" && s.payload.documentDate <= e.endDate && r(a, `Post, reopen or cancel approved ${i === "INVOICE" ? "invoice" : "expense bill"} dated ${s.payload.documentDate} (${s.id}).`, o + encodeURIComponent(s.id));
	for (let e of t.bankReconciliations.reconciliations) t.bankAccounts.bankAccounts.some((t) => t.id === e.bankAccountId) || r("BANK_RECONCILIATION_INVALID", "A saved reconciliation references a missing bank account.", "/banking/workbench");
	for (let n of t.bankAccounts.bankAccounts) try {
		let i = t.bankReconciliations.reconciliations.filter((e) => e.bankAccountId === n.id).filter((t) => t.statementDate >= e.endDate).sort((e, t) => e.statementDate.localeCompare(t.statementDate))[0];
		for (let a of $s({
			bank: n,
			journals: t.journals.journalEntries,
			reconciliations: t.bankReconciliations.reconciliations,
			throughDate: i?.statementDate ?? e.endDate,
			statements: t.bankStatements?.lines ?? []
		})) r("BANK_RECONCILIATION_INVALID", `${n.name ?? n.id}: ${a}`, "/banking/workbench");
	} catch {
		r("BANK_RECONCILIATION_INVALID", `${n.name ?? n.id}: saved bank reconciliation evidence could not be verified.`, "/banking/workbench");
	}
	let o = t.bankReconciliations.reconciliations.filter((e) => e.status === "COMPLETED"), s = new Set(o.flatMap((e) => e.clearedTransactionIds)), c = t.journals.journalEntries, l = oe(c), u = /* @__PURE__ */ new Set([...l.originals, ...l.offsets]), d = new Map(c.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, e])));
	for (let n of t.bankAccounts.bankAccounts) {
		let i = (t.bankStatements?.lines ?? []).filter((t) => t.bankAccountId === n.id && t.date <= e.endDate), a = i.filter((e) => e.status === "UNMATCHED").length, o = i.filter((e) => e.status === "MATCHED" || e.status === "POSTED"), l = o.filter((e) => e.ledgerIds.some((t) => !d.has(t) || u.has(d.get(t).id) || !Qs(d.get(t), c, e.date))).length, f = o.filter((e) => e.ledgerIds.some((e) => !s.has(e))).length;
		a && r("BANK_STATEMENT_UNPROCESSED", `Process or exclude with a reason ${a} imported statement lines for ${n.name ?? n.id} through ${e.endDate}.`, "/banking/workbench"), l && r("BANK_STATEMENT_STALE", `Repair ${l} stale statement matches for ${n.name ?? n.id} before closing.`, "/banking/workbench"), f && r("BANK_STATEMENT_NOT_CLEARED", `Reconcile ${f} processed statement lines for ${n.name ?? n.id} before closing.`, "/banking/workbench");
	}
	let f = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, p = [
		["AR", () => Ac({
			...f,
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
		["AP", () => N_({
			...f,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => B_({
			...f,
			costMovements: t.costMovements.movements
		})]
	];
	try {
		let n = Ov({
			deposits: t.customerDeposits,
			accounts: t.accounts.accounts,
			journals: t.journals.journalEntries,
			banks: t.bankAccounts.bankAccounts,
			customers: t.customers.customers,
			asOfDate: e.endDate
		});
		n.reconciled || r("CUSTOMER_DEPOSIT_DIFFERENCE", `Customer deposits require review at ${e.endDate}: difference ${n.difference}; ${n.issues.length} integrity issue(s).`, "/accounting/reconciliation/deposits?asOf=" + encodeURIComponent(e.endDate));
	} catch (t) {
		r("CUSTOMER_DEPOSIT_CHECK_FAILED", t instanceof Error ? t.message : String(t), "/accounting/reconciliation/deposits?asOf=" + encodeURIComponent(e.endDate));
	}
	try {
		let n = Dv({
			prepayments: t.supplierPrepayments,
			accounts: t.accounts.accounts,
			journals: t.journals.journalEntries,
			banks: t.bankAccounts.bankAccounts,
			suppliers: t.suppliers.suppliers,
			asOfDate: e.endDate
		});
		n.reconciled || r("SUPPLIER_PREPAYMENT_DIFFERENCE", `Supplier prepayments require review at ${e.endDate}: difference ${n.difference}; ${n.issues.length} integrity issue(s).`, "/accounting/reconciliation/prepayments?asOf=" + encodeURIComponent(e.endDate));
	} catch (t) {
		r("SUPPLIER_PREPAYMENT_CHECK_FAILED", t instanceof Error ? t.message : String(t), "/accounting/reconciliation/prepayments?asOf=" + encodeURIComponent(e.endDate));
	}
	for (let [t, n] of p) try {
		let i = n();
		(!i.reconciled || !Number.isFinite(i.difference)) && r(`${t}_DIFFERENCE`, `${t} to GL difference at ${e.endDate}: ${i.difference}.`);
	} catch (e) {
		r(`${t}_CHECK_FAILED`, e instanceof Error ? e.message : String(e));
	}
	for (let n of t.bankAccounts.bankAccounts) (t.journals.journalEntries.some((t) => t.journalDate <= e.endDate && t.lines.some((e) => e.accountId === n.glAccountId)) || n.openingBalance !== 0 && n.openingBalanceDate <= e.endDate) && !t.bankReconciliations.reconciliations.some((t) => t.bankAccountId === n.id && t.statementDate >= e.endDate && t.status === "COMPLETED" && t.difference === 0) && r("BANK_NOT_RECONCILED", `Reconcile ${n.name ?? n.id} through ${e.endDate}.`);
	let m = t.journals.journalEntries.filter((t) => t.journalDate >= e.startDate && t.journalDate <= e.endDate), h = (e) => Math.round((e + 2 ** -52) * 100) / 100, g = h(m.reduce((e, t) => e + t.totalDebit, 0)), _ = h(m.reduce((e, t) => e + t.totalCredit, 0));
	return (!Number.isFinite(g) || !Number.isFinite(_) || g !== _) && r("TRIAL_BALANCE", "Period journal debits and credits do not balance."), {
		blockers: n,
		journalCount: m.length,
		debit: g,
		credit: _
	};
}
//#endregion
//#region src/features/purchases/data/purchasePostingRecoveryAuthorization.ts
var Av = null, jv = {
	configureTrustedSession(e) {
		Av = e;
	},
	clear() {
		Av = null;
	},
	current() {
		return Av?.() ?? null;
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
}, Mv = "htt.purchasePosting.manualRecoveryAudit.v1";
function Nv() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(Mv) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var Pv = Nv();
function Fv(e) {
	Pv.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(Mv, JSON.stringify(Pv));
	} catch {}
}
b("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return Pv.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = N.get(e);
			return jv.canRecover() && t?.status === "RECOVERY_REQUIRED" && N.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = jv.requireRecoveryPermission(), n = N.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!N.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				N.recover(e), Fv({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw Fv({
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
	snapshot: () => Pv,
	restore: (e) => {
		Pv.splice(0, Pv.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var Iv = !1;
function Lv() {
	if (Iv || (Iv = !0, k.wasRestoredOnLoad())) return;
	let e = z.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Wr.postInvoice(t), t.status === "VOID" && Wr.reverseInvoice(t);
	let t = Ir.getAll();
	for (let e of t) Wr.postPayment(e), e.status === "REVERSED" && Wr.reversePayment(e);
	let n = R.getAll();
	for (let e of n) e.status !== "DRAFT" && (Wr.postCreditNote(e), e.status === "VOID" && Wr.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function Rv() {
	let e = is().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var zv = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION"
]);
function Bv(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = ye("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return ve(t.view), t.result;
	}
	if (e.businessRecordChecked !== !0 || e.originalGlChecked !== !0 || e.reversalGlChecked !== !0 || e.balancesChecked !== !0) throw Error("Business, original/reversal GL and balances must all be inspected.");
	if (typeof e.reference != "string" || e.reference.length > 500 || typeof e.summary != "string" || e.summary.length > 4e3) throw Error("Recovery evidence reference or summary exceeds the allowed length.");
	let t = A.list().find((t) => t.operationId === e.operationId);
	if (!t || !zv.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return A.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region electron/security/businessEngine.ts
b("salesRecovery", {
	repository: {
		inspectRecovery: Gc,
		recordSalesManualReview: Bv,
		closeVerifiedSalesReview: Uc,
		previewTargetedRepair: xs,
		proposeTargetedRepair: Ss,
		executeTargetedRepair: Cs
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
var Vv = E();
function Hv(e) {
	an(kv, () => e()?.userId ?? ""), j.connect(e), jv.configureTrustedSession(e), Lv(), Rv();
}
//#endregion
export { un as assertPostingPeriod, Hv as initialize, Vv as workspaceDefaults };
