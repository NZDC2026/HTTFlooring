import { $ as e, A as t, B as n, C as r, E as i, F as a, G as o, H as s, I as c, J as l, K as u, N as d, O as f, Q as p, R as m, S as h, T as g, V as _, W as v, X as y, Y as b, Z as x, _ as S, a as ee, at as te, b as C, c as ne, ct as re, d as ie, et as ae, f as oe, g as w, h as se, it as ce, j as le, l as ue, m as T, nt as de, o as fe, ot as pe, p as me, q as he, rt as ge, s as _e, st as ve, tt as ye, u as be, v as xe, w as Se, x as Ce, y as we, z as Te } from "./businessSnapshot-D9R8jr-6.js";
import { createHash as Ee } from "node:crypto";
//#region \0rolldown/runtime.js
var De = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/iso.js
function Oe(e) {
	return de(v, e);
}
//#endregion
//#region src/features/security/trustedAuthorization.ts
var ke = null, E = {
	connect(e) {
		return ke = e, () => {
			ke === e && (ke = null);
		};
	},
	disconnect() {
		ke = null;
	},
	current() {
		return ke?.() ?? null;
	},
	require(e) {
		return s(this.current(), e);
	}
};
//#endregion
//#region src/lib/persistence/mockRepositoryStorage.ts
function Ae() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function je(e, t) {
	let n = Ae();
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
function D(e, t) {
	let n = Ae();
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
	let t = Ae();
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
var Ne = "htt:financial-operations:v1", Pe = [
	"SOURCE_METADATA_REPAIR",
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
function Fe() {
	let e = je(Ne, _e);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function Ie(e) {
	if (!Me(Ne) || !D(Ne, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var O = {
	list() {
		return Fe().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !Pe.includes(t)) throw Error("Invalid operation identity.");
		let r = Fe(), i = r.find((t) => t.operationId === e);
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
		return Ie([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = Fe(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ie(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = Fe(), r = n.find((t) => t.operationId === e);
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
		return Ie(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = Fe(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ie(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = Fe(), a = i.find((t) => t.operationId === e);
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
		return Ie(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = Fe(), a = i.find((t) => t.operationId === e);
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
		return Ie(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	attachRepairProposal(e, t) {
		let n = Fe(), r = n.find((t) => t.operationId === e);
		if (!r || r.state !== "MANUAL_REVIEW" || !ne(t) || t.status !== "PROPOSED" || !r.reviewHistory?.some((e) => e.reference === t.reference && e.operator === t.reviewer)) throw Error("Repair proposal has no trusted review evidence.");
		let i = {
			...r,
			repairProposalHistory: r.repairProposal ? [...r.repairProposalHistory ?? [], r.repairProposal] : r.repairProposalHistory,
			repairProposal: structuredClone(t)
		};
		return Ie(n.map((t) => t.operationId === e ? i : t)), structuredClone(i);
	},
	finishRepair(e, t, n, r, i, a) {
		let o = Fe(), s = o.find((t) => t.operationId === e), c = s?.repairProposal;
		if (!s || s.state !== "MANUAL_REVIEW" || !s.resultId || !c || c.id !== t || c.status !== "PROPOSED") throw Error("Current proposed repair is required.");
		if (!n.trim() || r.trim().length < 3 || r.length > 500 || !/^[a-f0-9]{64}$/.test(i)) throw Error("Valid repair approval and post-repair digest are required.");
		if (c.reviewer.toLowerCase() === n.toLowerCase() || s.reviewHistory?.some((e) => e.operator.toLowerCase() === n.toLowerCase())) throw Error("Repair approval requires a different operator.");
		if (s.reviewHistory?.some((e) => e.reference === r.trim())) throw Error("Approval reference must differ from review evidence.");
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = c.action === "REPAIR_SOURCE_METADATA" ? "SOURCE_METADATA_REPAIRED" : c.action === "CANCEL_NO_EFFECT" ? "CANCELLED_NO_EFFECT" : c.action === "RESTORE_BANK_RECORD" ? "BANK_RECORD_RESTORED" : c.action === "REVERSE_BANK_DUPLICATE" ? "BANK_DUPLICATE_REVERSED" : c.action === "RESTORE_BANK_JOURNAL_LINK" ? "BANK_JOURNAL_LINK_RESTORED" : "BANK_JOURNAL_RESTORED", d = {
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
		return Ie(o.map((t) => t.operationId === e ? d : t)), structuredClone(d);
	},
	withdrawSourceRepair(e, t, n, r) {
		let i = Fe(), a = i.find((t) => t.operationId === e);
		if (a?.kind === "SOURCE_METADATA_REPAIR" && a.state === "COMPLETED" && !a.repairProposal && a.repairProposalHistory?.at(-1)?.id === t && a.note === "Source repair proposal withdrawn without changing business records: " + r && a.reviewHistory?.at(-1)?.operator === n) return a;
		if (!a || a.kind !== "SOURCE_METADATA_REPAIR" || a.state === "COMPLETED" || a.repairProposal?.id !== t || a.repairProposal.status !== "PROPOSED") throw Error("Unexecuted source repair proposal required.");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			...a,
			state: "COMPLETED",
			updatedAt: o,
			repairProposal: void 0,
			repairProposalHistory: [...a.repairProposalHistory ?? [], a.repairProposal],
			note: "Source repair proposal withdrawn without changing business records: " + r,
			reviewHistory: [...a.reviewHistory ?? [], {
				reference: "WITHDRAW-" + crypto.randomUUID(),
				operator: n,
				recordedAt: o,
				summary: r
			}]
		};
		return Ie(i.map((t) => t.operationId === e ? s : t)), s;
	},
	adoptReviewedResult(e, t) {
		let n = Fe(), r = n.find((t) => t.operationId === e);
		if (!r || r.state === "COMPLETED" || !t.trim() || r.resultId && r.resultId !== t) throw Error("Cannot replace a bound or completed result.");
		Ie(n.map((n) => n.operationId === e ? {
			...n,
			resultId: t
		} : n));
	},
	getUnresolved() {
		return Fe().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
i("financialOperations", {
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
		finishRepair: null,
		adoptReviewedResult: null,
		withdrawSourceRepair: null
	},
	snapshot: () => [],
	restore: () => {},
	publish: () => {}
});
//#endregion
//#region src/features/purchases/data/purchasePostingOperationRepository.ts
var Le = /* @__PURE__ */ new Map(), Re = "htt.purchasePosting.operations.v1";
function ze() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function Be() {
	let e = ze();
	if (e) try {
		e.setItem(Re, JSON.stringify([...Le.values()]));
	} catch {}
}
function Ve() {
	let e = ze();
	if (e) try {
		let t = JSON.parse(e.getItem(Re) ?? "[]");
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
			Le.set(t.key, {
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
Ve();
var He = /* @__PURE__ */ new Set(), Ue = /* @__PURE__ */ new Map(), We = /* @__PURE__ */ new Map(), Ge;
function Ke() {
	Be(), He.forEach((e) => e());
}
var k = {
	injectFailureBeforeStep(e, t, n = 1) {
		We.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		We.clear();
	},
	registerRecovery(e, t) {
		if (!Le.has(e)) throw Error(`Unknown posting operation: ${e}`);
		Ue.set(e, t);
	},
	runStep(e, t, n) {
		let r = Le.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = We.get(i) ?? 0;
		if (a > 0) throw We.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return Ue.has(e);
	},
	recover(e) {
		let t = Le.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = Ue.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Ge === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Ge = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Ge = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = Le.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...Le.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return He.add(e), () => {
			He.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (Le.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Le.set(n, r), Ke(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = Le.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		Le.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Ke();
	},
	completeStep(e, t) {
		let n = Le.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (Le.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Ke());
	}
};
i("purchaseOperations", {
	repository: k,
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
	snapshot: () => k.getAll(),
	restore: (e) => {
		Le.clear(), Ue.clear();
		for (let t of e) Le.set(t.key, t);
	},
	publish: () => He.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var qe = [{
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
}], Je = [{
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
}], Ye = "htt:financial-snapshot:v1", Xe = (e) => !!e && typeof e == "object" && !Array.isArray(e), Ze = (e) => new Set(e.map((e) => e.id)).size === e.length, Qe = (e) => {
	if (!Xe(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => Xe(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => Xe(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => Xe(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => Xe(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => Xe(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && Xe(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && Xe(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && Xe(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && Ze(t) && Ze(n) && Ze(r) && Ze(i);
}, $e = () => ({
	purchaseOrders: structuredClone(qe),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(Je),
	transactions: [],
	transfers: [],
	journals: []
}), et, tt = !1;
function nt() {
	return typeof window < "u" && !!window.localStorage;
}
function rt() {
	if (et) return et;
	if (!nt()) return $e();
	let e = je(Ye, Qe);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return tt = e.status === "ok", et = e.status === "ok" ? {
		...$e(),
		...e.data
	} : $e(), et;
}
var it = /* @__PURE__ */ new Set(), at = 0, ot = /* @__PURE__ */ new Set();
function st(e) {
	if (nt() && !D(Ye, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var A = {
	wasRestoredOnLoad() {
		return rt(), tt;
	},
	onRollback(e) {
		it.add(e);
	},
	notify(e) {
		at ? ot.add(e) : e();
	},
	transaction(e) {
		if (at) return e();
		let t = structuredClone(rt());
		et = structuredClone(t), at++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			st(rt());
		} catch (e) {
			throw et = t, it.forEach((e) => e()), ot.clear(), e;
		} finally {
			at--;
		}
		let r = [...ot];
		return ot.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(rt());
	},
	update(e, t) {
		let n = {
			...rt(),
			[e]: structuredClone(t)
		};
		if (!Qe(n)) throw Error("Invalid financial snapshot; write blocked.");
		at || st(n), et = n;
	},
	resetCacheForTests() {
		et = void 0, tt = !1;
	}
};
i("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => A.read(),
	restore: (e) => {
		et = e;
	},
	publish: () => {}
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function ct(e) {
	let t = [], n = new Map(e.journals.map((e) => [e.id, e])), r = ue(e.journals);
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
//#region src/features/sales/data/salesConsistencyAudit.ts
var lt = (e) => Math.round(e * 100);
function ut(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + lt(t.amount), 0), s = a.reduce((e, t) => e + lt(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (lt(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), lt(t.amountDue) !== Math.max(0, lt(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > lt(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + lt(t.amount), 0);
		lt(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || lt(t.amountAvailable) !== 0 : lt(t.amountAvailable) !== lt(t.totals.total) - a - lt(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
//#region src/features/banking/data/statementCorrectionEvidence.ts
var dt = (e) => Math.round((e + 2 ** -52) * 100) / 100, ft = (e) => e.lines.length >= 2 && new Set(e.lines.map((e) => e.id)).size === e.lines.length && e.totalDebit > 0 && e.totalDebit === e.totalCredit && e.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0 && dt(e.debit) === e.debit && dt(e.credit) === e.credit && !(e.debit && e.credit)) && dt(e.lines.reduce((e, t) => e + t.debit, 0)) === e.totalDebit && dt(e.lines.reduce((e, t) => e + t.credit, 0)) === e.totalCredit, pt = (e, t = !1) => JSON.stringify(e.lines.map((e) => [
	e.accountId,
	e.description ?? null,
	t ? e.credit : e.debit,
	t ? e.debit : e.credit
]).sort((e, t) => JSON.stringify(e).localeCompare(JSON.stringify(t))));
function mt(e) {
	let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = [], i = e.filter((e) => e.sourceType === "BANK_STATEMENT" && !e.reversedJournalEntryId && (e.status === "REVERSED" || e.reversalJournalEntryId || e.reversedAt)), a = (e, t, i) => {
		n.add(e.id), t.forEach((e) => n.add(e)), r.push({
			journalId: e.id,
			message: i
		});
	};
	for (let n of i) {
		let r = e.filter((e) => e.id === n.reversalJournalEntryId), i = r[0];
		if (e.filter((e) => e.id === n.id).length !== 1 || r.length !== 1 || n.status !== "REVERSED" || !n.sourceId || !/^.+:\d+$/.test(n.sourceId) || !n.reversalReason?.trim() || !Number.isFinite(Date.parse(n.reversedAt ?? "")) || n.reversedAt !== i.postedAt || i.status !== "POSTED" || i.sourceType !== "BANK_STATEMENT" || i.sourceId !== void 0 || i.reversedJournalEntryId !== n.id || e.filter((e) => e.reversalJournalEntryId === i.id).length !== 1 || i.reversalJournalEntryId || i.reversedAt || n.reference !== i.reference || e.filter((e) => e.reversedJournalEntryId === n.id).length !== 1 || !ft(n) || !ft(i) || n.totalDebit !== i.totalCredit || n.totalCredit !== i.totalDebit || pt(n, !0) !== pt(i)) {
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
function ht(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function gt(e, t) {
	T(e, t);
}
function _t(e, t, n) {
	gt(e.openingBalanceDate, "Opening balance date"), gt(n, "As-at date");
	let r = ue(t), i = ie(t), a = mt(t), o = new Set([
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
	}), c = ht(e.openingBalance), l = 0, u = 0, d = s.map(({ entry: t, line: n }) => {
		let r = ht(n.debit), s = ht(n.credit);
		return l = ht(l + r), u = ht(u + s), c = ht(c + r - s), {
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
		openingBalance: ht(e.openingBalance),
		moneyIn: l,
		moneyOut: u,
		closingBalance: c,
		transactionCount: d.length,
		transactions: d
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function vt(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function yt(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) if (!t.correctionOnly) {
		if (r.has(t.id)) {
			i = vt(i + t.moneyIn), a = vt(a + t.moneyOut);
			continue;
		}
		o = vt(o + t.moneyIn), s = vt(s + t.moneyOut);
	}
	let c = vt(vt(t) + o - s), l = vt(e.closingBalance), u = vt(c - l);
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
var bt = (e) => new Set(e).size === e.length, xt = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function St(e, t, n, r) {
	return e.some((e) => e.bankAccountId === t && e.status === "COMPLETED" && e.statementDate < r && e.clearedTransactionIds.includes(n));
}
function Ct(e) {
	let { bank: t, journals: n, reconciliations: r, throughDate: i } = e, a = [];
	if (T(i, "Reconciliation proof date"), T(t.openingBalanceDate, "Bank opening date"), !bt(r.map((e) => e.id)) || !bt(n.map((e) => e.id)) || !bt(n.flatMap((e) => e.lines.map((t) => e.id + ":" + t.id)))) return ["Duplicate reconciliation or ledger row identity."];
	for (let e of r.filter((e) => e.bankAccountId === t.id)) try {
		T(e.statementDate);
	} catch {
		return ["Reconciliation statement date is invalid."];
	}
	let o = ie(n);
	n.some((e) => o.has(e.id) && e.journalDate >= t.openingBalanceDate && e.journalDate <= i && e.lines.some((e) => e.accountId === t.glAccountId)) && a.push("Bank journal reversal has incomplete or inconsistent owner, lifecycle or amount evidence.");
	let s = mt(n);
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
		if (e.status !== "COMPLETED" || e.statementDate <= d || e.statementDate < t.openingBalanceDate || !Number.isFinite(e.statementBalance) || xt(e.statementBalance) !== e.statementBalance || !bt(e.clearedTransactionIds)) return ["Reconciliation sequence, status, balance or cleared identities are invalid."];
		let r = _t(t, n, e.statementDate), i = new Map(r.transactions.map((e) => [e.id, e])), o = /* @__PURE__ */ new Set(), c = new Set(e.clearedTransactionIds);
		for (let e of n.filter((e) => s.verifiedIds.has(e.id) && e.reversalJournalEntryId)) {
			let t = r.transactions.filter((t) => t.journalEntryId === e.id || t.journalEntryId === e.reversalJournalEntryId);
			t.length && t.every((e) => c.has(e.id)) && t.forEach((e) => o.add(e.id));
		}
		if (e.clearedTransactionIds.some((t) => {
			let r = i.get(t);
			return l.has(t) || !r || r.correctionIssue || !o.has(t) && (r.correctionOnly || !oe(u.get(r.journalEntryId), n, e.statementDate));
		})) return ["Cleared rows are missing, reversed, internal offsets or duplicated across statements."];
		e.clearedTransactionIds.forEach((e) => l.add(e));
		let f = yt(r, e.statementBalance, [...l]), p = (t) => t.reconciled && [
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
		!p(f) && !p(yt(m, e.statementBalance, [...l])) && a.push("Saved reconciliation totals do not match the current dated bank ledger: " + e.reconciliationNumber), d = e.statementDate;
	}
	if (!c.length) return a;
	let f = c.at(-1).statementDate, p = _t(t, n, f), m = new Map(p.transactions.map((e) => [e.id, e])), h = /* @__PURE__ */ new Set();
	for (let i of (e.statements ?? []).filter((e) => e.bankAccountId === t.id && e.date <= f)) i.status === "UNMATCHED" && a.push("Imported statement contains an unresolved line."), (i.status === "MATCHED" || i.status === "POSTED") && (i.ledgerIds.some((e) => St(r, t.id, e, i.date)) && a.push("Imported statement match reuses a ledger row already cleared in an earlier statement."), (!i.ledgerIds.length || !bt(i.ledgerIds) || i.ledgerIds.some((e) => {
		let t = m.get(e);
		return !l.has(e) || !t || t.correctionOnly || t.correctionIssue || !oe(u.get(t.journalEntryId), n, i.date) || h.has(e);
	}) || xt(i.ledgerIds.reduce((e, t) => e + (m.get(t)?.moneyIn ?? 0) - (m.get(t)?.moneyOut ?? 0), 0)) !== i.amount) && a.push("Imported statement match, amount or clearing is inconsistent."), i.ledgerIds.forEach((e) => h.add(e)));
	return a;
}
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var wt = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Tt(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${wt.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function j() {
	Tt(O.list(), k.getAll());
}
//#endregion
//#region src/features/banking/data/reconciliationLock.ts
function Et(e, n) {
	let r = t(), i = r.journals?.journalEntries ?? [], a = r.bankReconciliations?.reconciliations ?? [], o = i.filter((t) => t.sourceType === e && t.sourceId === n).map((e) => e.id);
	if (a.some((e) => e.clearedTransactionIds.some((e) => o.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Dt(e, n) {
	let r = t(), i = r.bankAccounts?.bankAccounts ?? [], a = r.bankReconciliations?.reconciliations ?? [];
	for (let t of i.filter((e) => n.includes(e.glAccountId))) {
		let n = a.filter((e) => e.bankAccountId === t.id).map((e) => e.statementDate).sort().at(-1);
		if (n && e <= n) throw Error(`Bank account is reconciled through ${n}. Use a posting date after that statement.`);
	}
}
function Ot(e) {
	if (t().bankStatements?.lines.some((t) => t.status === "MATCHED" && t.ledgerIds.some((t) => t.startsWith(e + ":")))) throw Error("Unmatch the bank statement line before reversing its ledger source.");
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var kt = [], At, jt, Mt = /* @__PURE__ */ new Set();
function Nt(e, t) {
	At = e, jt = t;
}
function Pt() {
	let e = jt?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function Ft(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function It(e) {
	let t = kt.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function Lt() {
	Mt.forEach((e) => e());
}
function Rt(e) {
	if (T(e, "Posting date"), !kt.length) return;
	let t = kt.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!kt.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
i("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => kt,
		subscribe(e) {
			return Mt.add(e), () => {
				Mt.delete(e);
			};
		},
		create(e) {
			let t = Pt(), n = Ft(e.reason);
			if (T(e.startDate), T(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (kt.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (kt.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return kt = [...kt, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), Lt(), r;
		},
		preflight(e) {
			let t = It(e);
			if (!At) throw Error("Trusted close checks unavailable.");
			return At(t);
		},
		close(e) {
			let t = Pt(), n = Ft(e.reason), r = It(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (kt.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return kt = kt.map((e) => e.id === r.id ? {
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
			} : e), Lt(), It(e.id);
		},
		reopen(e) {
			let t = Pt(), n = Ft(e.reason), r = It(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (kt.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return kt = kt.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), Lt(), It(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: kt }),
	restore: (e) => {
		fe(e.periods), kt = e.periods;
	},
	publish: Lt
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var zt = /* @__PURE__ */ new Set(), M = "2026-10-08T00:00:00.000Z", Bt = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
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
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
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
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	}
];
function Vt() {
	zt.forEach((e) => e());
}
function Ht(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Ut(e) {
	return e?.trim() || void 0;
}
function Wt(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function Gt(e, t) {
	if (Bt.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function Kt(e, t) {
	if (!e) return;
	let n = Bt.find((n) => n.id !== t && (Ce(e) ? n.id === Ce(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function qt() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var N = {
	subscribe(e) {
		return zt.add(e), () => {
			zt.delete(e);
		};
	},
	getSnapshot() {
		return Bt;
	},
	getAll() {
		return Bt;
	},
	getById(e) {
		return Bt.find((t) => t.id === e);
	},
	getByCode(e) {
		return Bt.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return Bt.find((t) => Ce(e) ? t.id === Ce(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = Bt.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = Bt.find((t) => Ce(e) ? t.id === Ce(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = Ht(e.code, "Account code"), n = Ht(e.name, "Account name");
		Wt(t), Gt(t), Kt(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: qt(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: Ut(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return Bt = [...Bt, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Vt(), i;
	},
	update(e, t) {
		let n = Bt.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = Ht(t.code, "Account code"), i = Ht(t.name, "Account name");
		if (Wt(r), Gt(r, e), (n.systemRole || C(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: Ut(t.description),
			active: n.systemRole || C(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || C(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Bt = Bt.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Vt(), a;
	},
	setActive(e, t) {
		let n = Bt.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || C(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Bt = Bt.map((t) => t.id === e ? r : t), Vt(), r;
	}
};
i("accounts", {
	repository: N,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: Bt }),
	restore: (e) => {
		Bt = e.accounts;
	},
	publish: () => zt.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var Jt = /* @__PURE__ */ new Set(), Yt = A.read().journals;
A.onRollback(() => {
	Yt = A.read().journals;
});
function Xt() {
	Jt.forEach((e) => A.notify(e));
}
function Zt(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Qt(e) {
	return e?.trim() || void 0;
}
function $t(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function en(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = Yt.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function tn(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function nn(e) {
	if ($t(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = N.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = Zt(r.debit), o = Zt(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = Zt(t + a), n = Zt(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function rn(e) {
	return e.lines.map((e, t) => {
		let n = N.requireById(e.accountId);
		return {
			id: tn(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: Qt(e.description),
			debit: Zt(e.debit),
			credit: Zt(e.credit)
		};
	});
}
function an(e, t) {
	let n = ue(Yt).originals;
	return Yt.find((r) => r.sourceType === e && r.sourceId === t && !r.reversedJournalEntryId && !n.has(r.id));
}
var P = {
	subscribe(e) {
		return Jt.add(e), () => {
			Jt.delete(e);
		};
	},
	getSnapshot() {
		return Yt;
	},
	getAll() {
		return Yt;
	},
	getById(e) {
		return Yt.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return Yt.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: an,
	post(e) {
		Rt(e.journalDate), Dt(e.journalDate, e.lines.map((e) => e.accountId));
		let t = nn(e), n = Qt(e.sourceId);
		if (n) {
			let t = an(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: tn("je"),
			journalNumber: en(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: Qt(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: rn(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...Yt];
		return A.update("journals", a), Yt = a, Xt(), i;
	},
	reverse(e) {
		Rt(e.reversalDate);
		let t = Yt.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (Ot(t.id), t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if ($t(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		Dt(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = nn(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: tn("je"),
			journalNumber: en(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: rn(r),
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
		}, c = [o, ...Yt.map((e) => e.id === t.id ? s : e)];
		return A.update("journals", c), Yt = c, Xt(), o;
	}
};
function on(e, t, n, r) {
	let i = Yt.find((t) => t.id === e);
	if (!i) throw Error("Duplicate journal no longer exists.");
	let a = P.reverse({
		journalEntryId: e,
		reversalDate: i.journalDate,
		reason: r
	}), o = Yt.map((r) => r.id === e ? {
		...r,
		bankDuplicateCorrection: {
			canonicalJournalId: t,
			operationId: n
		}
	} : r), s = ue(o);
	if (s.invalid.length || !s.originals.has(e)) throw Error("Duplicate correction failed exact-pair verification.");
	return A.update("journals", o), Yt = o, Xt(), a;
}
i("journals", {
	repository: P,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: Yt }),
	restore: (e) => {
		Yt = e.journalEntries;
	},
	publish: () => Jt.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var sn = "htt.mock.banking.accounts.v1";
function cn(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var ln = /* @__PURE__ */ new Set(), un = "2026-10-08T00:00:00.000Z", dn = [{
	id: "bank_001",
	name: "Operating Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1000",
	accountType: "TRANSACTION",
	currency: w().currency,
	glAccountId: "acc_1000",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: un,
	updatedAt: un
}, {
	id: "bank_002",
	name: "Savings Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1010",
	accountType: "SAVINGS",
	currency: w().currency,
	glAccountId: "acc_1010",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: un,
	updatedAt: un
}], fn = je(sn, cn);
fn.status === "ok" && fn.data.every((e) => {
	let t = N.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (dn = fn.data);
function pn() {
	ln.forEach((e) => e());
}
function mn(e) {
	let t = N.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of dn) mn(e);
var F = {
	subscribe(e) {
		return ln.add(e), () => {
			ln.delete(e);
		};
	},
	getSnapshot() {
		return dn;
	},
	getAll() {
		return dn;
	},
	getById(e) {
		return dn.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return dn.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = dn.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(t, n) {
		let r = x({
			id: e().optional(),
			name: e().trim().min(1).max(180),
			bankName: e().trim().min(1).max(180),
			accountNumber: e().trim().min(1).max(100),
			accountType: o([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: o(["AUD", "NZD"]),
			glAccountId: e().min(1),
			openingBalanceDate: e(),
			active: he()
		}).strict().parse(t);
		if (T(r.openingBalanceDate, "Opening date"), dn[0] && r.currency !== dn[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let i = dn.find((e) => e.id === r.id);
		if (i && i.updatedAt !== n) throw Error("Bank account changed; reload before editing.");
		if (!i && r.id) throw Error("Bank account was not found.");
		if (dn.some((e) => e.id !== i?.id && e.glAccountId === r.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let a = N.requireById(r.glAccountId);
		if (!a.active || a.type !== "ASSET" || a.systemRole && a.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (i && P.getAll().some((e) => e.lines.some((e) => e.accountId === i.glAccountId)) && (i.glAccountId !== r.glAccountId || i.openingBalanceDate !== r.openingBalanceDate || i.currency !== r.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let s = new Date(Math.max(Date.now(), i ? Date.parse(i.updatedAt) + 1 : 0)).toISOString(), c = {
			...r,
			id: i?.id ?? crypto.randomUUID(),
			openingBalance: i?.openingBalance ?? 0,
			createdAt: i?.createdAt ?? s,
			updatedAt: s
		};
		return mn(c), dn = [...dn.filter((e) => e.id !== c.id), c], pn(), c;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return dn = dn.map((t) => t.id === e ? r : t), Me(sn) && D(sn, dn), pn(), r;
	}
};
i("bankAccounts", {
	repository: F,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: dn }),
	restore: (e) => {
		dn = e.bankAccounts;
	},
	publish: () => ln.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankReconciliationRepository.ts
var hn = /* @__PURE__ */ new Set(), gn = A.read().reconciliations;
A.onRollback(() => {
	gn = A.read().reconciliations;
});
function _n() {
	A.update("reconciliations", gn), hn.forEach((e) => A.notify(e));
}
function vn(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function yn(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function bn() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function xn(e) {
	return `BREC-${e.slice(0, 4)}-${String(gn.length + 1).padStart(4, "0")}`;
}
function Sn(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of gn) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var Cn = {
	subscribe(e) {
		return hn.add(e), () => {
			hn.delete(e);
		};
	},
	getSnapshot() {
		return gn;
	},
	getAll() {
		return gn;
	},
	getByBankAccount(e) {
		return gn.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return Sn(e);
	},
	complete(e, n) {
		if (yn(e.statementDate), T(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let r = F.requireById(e.bankAccountId);
		if (!r.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < r.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let i = P.getAll(), a = new Map(i.map((e) => [e.id, e])), o = Ct({
			bank: r,
			journals: i,
			reconciliations: gn,
			throughDate: e.statementDate
		});
		if (o.length) throw Error("Existing bank reconciliation evidence is invalid: " + o.join(" "));
		let s = this.getLatestByBankAccount(r.id);
		if (s && e.statementDate <= s.statementDate) throw Error(`Statement date must be after the last reconciled date ${s.statementDate}.`);
		let c = _t(r, P.getAll(), e.statementDate), l = new Set(c.transactions.filter((t) => !t.correctionOnly && !t.correctionIssue && oe(a.get(t.journalEntryId), i, e.statementDate)).map((e) => e.id)), u = Sn(r.id), d = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !u.has(e));
		for (let e of d) if (!l.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let f = /* @__PURE__ */ new Set([...u, ...d]), p = t().bankStatements?.lines.filter((t) => t.bankAccountId === r.id && t.date <= e.statementDate) ?? [];
		if (p.some((e) => e.status === "UNMATCHED")) throw Error("Process every imported statement line before completing reconciliation.");
		let m = new Map(c.transactions.map((e) => [e.id, e]));
		for (let e of p.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (e.ledgerIds.some((t) => St(gn, r.id, t, e.date))) throw Error("Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.");
			if (e.ledgerIds.some((t) => !m.has(t) || m.get(t)?.correctionOnly || m.get(t)?.correctionIssue || !oe(a.get(m.get(t).journalEntryId), i, e.date))) throw Error("Repair stale imported statement matches before completing reconciliation.");
			if (e.ledgerIds.some((e) => !f.has(e))) throw Error("Include every processed imported statement entry in reconciliation.");
		}
		let h = yt(c, vn(e.statementBalance), Array.from(f));
		if (!h.reconciled) throw Error(`Bank reconciliation is out by ${h.difference.toFixed(2)}.`);
		let g = bn();
		if (n) {
			if (O.begin(n, "BANK_RECONCILIATION", JSON.stringify(e)).status !== "started") throw Error("Bank reconciliation requires manual review before retry.");
			O.bindResult(n, g);
		}
		let _ = {
			id: g,
			reconciliationNumber: xn(e.statementDate),
			bankAccountId: r.id,
			statementDate: e.statementDate,
			statementBalance: vn(e.statementBalance),
			bookBalance: h.bookBalance,
			outstandingDeposits: h.outstandingDeposits,
			outstandingPayments: h.outstandingPayments,
			adjustedStatementBalance: h.adjustedStatementBalance,
			difference: h.difference,
			clearedTransactionIds: d,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return gn = [_, ...gn], _n(), _;
	}
}, wn = Cn.complete;
Cn.complete = function(e, t) {
	let n = t?.trim() ?? `bankrec-operation-${bn()}`;
	if (t !== void 0 && !n) throw Error("Operation ID cannot be empty.");
	if (n) {
		let t = O.list().find((e) => e.operationId === n);
		if (t) {
			if (t.kind !== "BANK_RECONCILIATION" || t.fingerprint !== JSON.stringify(e)) throw Error("Operation ID reused with different business data.");
			let n = gn.find((e) => e.id === t.resultId);
			if (t.state === "COMPLETED" && n && gn.filter((e) => e.id === n.id).length === 1 && n.status === "COMPLETED" && n.bankAccountId === e.bankAccountId && n.statementDate === e.statementDate && n.statementBalance === vn(e.statementBalance)) return n;
			throw Error("Bank reconciliation requires manual review before retry.");
		}
	}
	j();
	try {
		let t = A.transaction(() => wn.call(Cn, e, n));
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
}, i("bankReconciliations", {
	repository: Cn,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: gn }),
	restore: (e) => {
		gn = e.reconciliations;
	},
	publish: () => hn.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/reconciliationRecoveryEvidence.ts
function Tn(e) {
	let n = O.list(), r = n.find((t) => t.operationId === e), i = [];
	if (!r || r.kind !== "BANK_RECONCILIATION" || r.state !== "MANUAL_REVIEW") return ["Operation is not an unresolved bank reconciliation review."];
	if (!r.resultId) return ["Operation has no durable bound result; cannot infer clearing."];
	r.reviewHistory?.length || i.push("Operator reconciliation evidence is missing.");
	let a = Cn.getAll(), o = a.filter((e) => e.id === r.resultId);
	if (o.length !== 1) return [...i, "Completed reconciliation result is missing or duplicated."];
	let s = o[0], c = F.getById(s.bankAccountId), l = P.getAll();
	if (!c) return [...i, "Reconciliation bank account is missing."];
	let u = (e) => JSON.stringify([...e].sort()), d = (e) => Math.round((e + 2 ** -52) * 100) / 100, f = a.filter((e) => e.bankAccountId === c.id && e.statementDate <= s.statementDate), p = t().bankStatements?.lines ?? [];
	try {
		i.push(...Ct({
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
	return n.some((e) => e.operationId !== r.operationId && e.kind === r.kind && e.resultId === r.resultId) && i.push("Another operation claims this reconciliation result."), i;
}
//#endregion
//#region src/features/banking/data/bankTransactionRepository.ts
var En = /* @__PURE__ */ new Set(), Dn = A.read().transactions, On = A.read().transfers;
A.onRollback(() => {
	let e = A.read();
	Dn = e.transactions, On = e.transfers;
});
function kn() {
	En.forEach((e) => A.notify(e));
}
function An(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function jn(e) {
	return e?.trim() || void 0;
}
function Mn(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Nn(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Pn(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Fn(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var In = {
	subscribe(e) {
		return En.add(e), () => {
			En.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Dn;
	},
	getTransfersSnapshot() {
		return On;
	},
	getTransactions() {
		return Dn;
	},
	getTransfers() {
		return On;
	},
	createTransaction(e, t) {
		if (Mn(e.transactionDate), T(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Nn(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = An(e.description, "Description"), i = F.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = N.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = N.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (F.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = Pn("banktxn"), c = Fn("BTXN", e.transactionDate, Dn.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = O.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Dn.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && O.bindResult(l, s);
			let t = P.post({
				journalDate: e.transactionDate,
				description: r,
				reference: jn(e.reference),
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
				reference: jn(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Dn];
			if (A.update("transactions", d), Dn = d, kn(), l) {
				let e = P.getBySource("BANK_TRANSACTION", s);
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
		Mn(e.transferDate), T(e.transferDate, "Transfer date");
		let n = Nn(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = An(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = F.requireById(e.fromBankAccountId), a = F.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = N.requireById(i.glAccountId), s = N.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = Pn("banktrf"), l = Fn("BTRF", e.transferDate, On.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = O.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = On.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && O.bindResult(u, c);
			let t = P.post({
				journalDate: e.transferDate,
				description: r,
				reference: jn(e.reference),
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
				reference: jn(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...On];
			if (A.update("transfers", f), On = f, kn(), u) {
				let e = P.getBySource("BANK_TRANSFER", c);
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
}, Ln = In.createTransaction;
In.createTransaction = function(e, t) {
	j();
	let n;
	try {
		return n = A.transaction(() => Ln.call(In, e, t)), t && O.complete(t.trim(), n.id), n;
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
var Rn = In.createTransfer;
In.createTransfer = function(e, t) {
	j();
	let n;
	try {
		return n = A.transaction(() => Rn.call(In, e, t)), t && O.complete(t.trim(), n.id), n;
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
function zn(e) {
	if (Dn.some((t) => t.id === e.id) || On.some((t) => t.id === e.id)) throw Error("Bank result already exists; restoration cannot duplicate it.");
	"transactionNumber" in e ? (Dn = [structuredClone(e), ...Dn], A.update("transactions", Dn)) : (On = [structuredClone(e), ...On], A.update("transfers", On)), kn();
}
function Bn(e, t, n) {
	if ([...Dn, ...On].filter((n) => n.id === e && n.journalEntryId === t).length !== 1) throw Error("Bank result changed before journal repair.");
	Dn = Dn.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), On = On.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), A.update("transactions", Dn), A.update("transfers", On), kn();
}
i("bankTransactions", {
	repository: In,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Dn,
		bankTransfers: On
	}),
	restore: (e) => {
		Dn = e.bankTransactions, On = e.bankTransfers;
	},
	publish: () => En.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankRecoveryEvidence.ts
var Vn = (e) => e === "BANK_TRANSACTION" || e === "BANK_TRANSFER";
function Hn(e, t, n = !0) {
	let r = O.list(), i = r.filter((t) => t.operationId === e);
	if (i.length !== 1) return ["Bank operation identity is missing or duplicated."];
	let a = i[0], o = [];
	if ((!Vn(a.kind) || (n ? a.state !== "MANUAL_REVIEW" : a.state === "COMPLETED")) && o.push("Operation is not an unresolved bank review."), a.resultId || o.push("Operation has no durable bound result; cannot infer effects."), n && !a.reviewHistory?.length && o.push("Operator reconciliation evidence is missing."), o.length) return o;
	let s = t?.transactions ?? In.getTransactions(), c = t?.transfers ?? In.getTransfers(), l = t?.journals ?? P.getAll(), u = a.kind === "BANK_TRANSACTION" ? s : c;
	if (u.filter((e) => e.id === a.resultId).length !== 1) return ["Bank business result is missing or duplicated."];
	let d = s.find((e) => e.id === a.resultId), f = c.find((e) => e.id === a.resultId), p = u.find((e) => e.id === a.resultId), m = (e) => new Set(e).size === e.length;
	if (!m(l.map((e) => e.id)) || !m(u.map((e) => e.id))) return ["Duplicate bank or GL identity; evidence is ambiguous."];
	let h = ue(l);
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
	let y = (e) => Math.round((e + 2 ** -52) * 100), b = p.amount;
	(!Number.isFinite(b) || b <= 0 || Math.abs(b - y(b) / 100) > 1e-8) && o.push("Bank amount must be positive whole cents."), (_.journalDate !== v || _.description !== p.description || _.reference !== p.reference) && o.push("Journal date, description or reference differs from the bank result.");
	let x, S, ee = N.getAll();
	if (a.kind === "BANK_TRANSACTION") {
		let e = F.getById(d.bankAccountId), t = ee.find((e) => e.id === d.offsetAccountId);
		(!e || !t || !t.allowManualPosting || e.glAccountId === t.id || F.getByGlAccountId(t.id) || v < e.openingBalanceDate) && o.push("Bank or offset account mapping is invalid."), ["MONEY_IN", "MONEY_OUT"].includes(d.direction) || o.push("Bank direction is invalid."), x = d.direction === "MONEY_IN" ? e?.glAccountId : t?.id, S = d.direction === "MONEY_IN" ? t?.id : e?.glAccountId;
	} else {
		let e = F.getById(f.fromBankAccountId), t = F.getById(f.toBankAccountId);
		(!e || !t || e.id === t.id || e.glAccountId === t.glAccountId || e.currency !== t.currency || v < e.openingBalanceDate || v < t.openingBalanceDate) && o.push("Transfer bank mappings, currency or dates are invalid."), x = t?.glAccountId, S = e?.glAccountId;
	}
	(!x || !S || !ee.some((e) => e.id === x) || !ee.some((e) => e.id === S) || _.lines.length !== 2 || !_.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0) || !_.lines.some((e) => e.accountId === x && e.debit === b && e.credit === 0) || !_.lines.some((e) => e.accountId === S && e.credit === b && e.debit === 0) || _.totalDebit !== b || _.totalCredit !== b) && o.push("Bank journal accounts, direction or amounts do not exactly match the bound result.");
	try {
		let e = JSON.parse(a.fingerprint);
		(!e || typeof e != "object" || !Number.isFinite(e.amount) || y(e.amount) !== y(b) || typeof e.description != "string" || e.description.trim() !== p.description || ((e) => typeof e == "string" && e.trim() || void 0)(e.reference) !== p.reference || (a.kind === "BANK_TRANSACTION" ? e.bankAccountId !== d.bankAccountId || e.transactionDate !== v || e.direction !== d.direction || e.offsetAccountId !== d.offsetAccountId : e.fromBankAccountId !== f.fromBankAccountId || e.toBankAccountId !== f.toBankAccountId || e.transferDate !== v)) && o.push("Saved bank intent does not match the bound business result.");
	} catch {
		o.push("Saved bank intent is unreadable; cannot verify original request.");
	}
	return r.some((e) => e.operationId !== a.operationId && e.kind === a.kind && e.resultId === a.resultId) && o.push("Another operation claims this bank result."), o;
}
//#endregion
//#region src/features/contacts/schemas/customerSchemas.ts
var Un = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], Wn = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], Gn = e().trim().refine((t) => t === "" || e().email().safeParse(t).success, { message: "Enter a valid email address" }), Kn = e().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), qn = x({
	businessName: e().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: e().trim().max(120, "Trading name is too long"),
	abn: Kn,
	businessType: o(Un),
	status: o(Wn),
	email: Gn,
	phone: e().trim().max(40, "Phone number is too long"),
	website: e().trim().max(200, "Website is too long"),
	creditLimit: y({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: y({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), Jn = x({
	name: e().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: e().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: e().trim().max(160, "Address is too long"),
	suburb: e().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: e().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: e().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: e().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: e().trim().max(40, "Phone number is too long"),
	isPrimary: he()
}), Yn = x({
	isAccounting: he().optional(),
	firstName: e().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: e().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: e().trim().max(100, "Job title is too long"),
	email: e().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: e().trim().max(40, "Phone number is too long"),
	mobile: e().trim().max(40, "Mobile number is too long"),
	locationId: e(),
	isPrimary: he()
}), Xn = [
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
], Zn = "htt.mock.contacts.customers.v1";
function Qn(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var $n = je(Zn, Qn), er = $n.status !== "invalid" && Me(Zn), tr = /* @__PURE__ */ new Set(), nr = $n.status === "ok" ? $n.data : structuredClone(Xn);
function rr() {
	er && D(Zn, nr), tr.forEach((e) => {
		e();
	});
}
function ir(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function ar() {
	let e = nr.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function or(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function sr(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function cr(e, t) {
	let n = !1;
	if (nr = nr.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	rr();
}
var I = {
	subscribe(e) {
		return tr.add(e), () => {
			tr.delete(e);
		};
	},
	getSnapshot() {
		return nr;
	},
	getAll() {
		return nr;
	},
	getById(e) {
		return nr.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: ir("cus"),
			code: ar(),
			businessName: e.businessName.trim(),
			tradingName: or(e.tradingName),
			abn: sr(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: or(e.email),
			phone: or(e.phone),
			website: or(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return nr = [n, ...nr], rr(), n;
	},
	update(e, t) {
		let n;
		if (cr(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: or(t.tradingName),
			abn: sr(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: or(t.email),
			phone: or(t.phone),
			website: or(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = I.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: ir("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: or(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: or(t.phone),
			isPrimary: r
		};
		return cr(e, (e) => ({
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
		let r = I.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: or(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: or(n.phone),
			isPrimary: a
		};
		return cr(e, (e) => ({
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
		t = Yn.parse(t);
		let n = I.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: ir("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: or(t.jobTitle),
			email: t.email.trim(),
			phone: or(t.phone),
			mobile: or(t.mobile),
			locationId: or(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return cr(e, (e) => ({
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
		n = Yn.parse(n);
		let r = I.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: or(n.jobTitle),
			email: n.email.trim(),
			phone: or(n.phone),
			mobile: or(n.mobile),
			locationId: or(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return cr(e, (e) => ({
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
	repository: I,
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
	snapshot: () => ({ customers: nr }),
	restore: (e) => {
		nr = e.customers;
	},
	publish: () => tr.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function lr(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= fr(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: pr(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => ur(e, r)), a = pr(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && dr(t, r)), s = pr(o.reduce((e, t) => e + t.amount, 0)), c = pr(e.totals.total), l = pr(Math.max(0, c - a - s));
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
function ur(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < fr(e.reversedAt) : !1;
}
function dr(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < fr(e.reversedAt) : !1;
}
function fr(e) {
	return me(e);
}
function pr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function mr(e, t, n) {
	let r = _r(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= gr(e.voidedAt)) return hr(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && dr(t, n)), a = _r(i.reduce((e, t) => e + t.amount, 0)), o = _r(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function hr(e, t, n) {
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
function gr(e) {
	return me(e);
}
function _r(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function vr(e, t, n = [], r = [], i = [], a = xr()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = lr(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = yr(e.dueDate, a);
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
		current: Sr(s.current),
		days1To30: Sr(s.days1To30),
		days31To60: Sr(s.days31To60),
		days61To90: Sr(s.days61To90),
		days90Plus: Sr(s.days90Plus)
	}, p = Sr(c), m = Sr(l), h = Sr(i.reduce((t, n) => n.customerId === e.id ? t + mr(n, r, a).amountAvailable : t, 0)), g = Sr(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: g,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: Sr(Math.max(0, e.creditLimit - Math.max(0, g))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function yr(e, t = xr()) {
	let n = br(e), r = br(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function br(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function xr() {
	return me((/* @__PURE__ */ new Date()).toISOString());
}
function Sr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function Cr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function wr(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function Tr(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? Cr(t - n) : Cr(n - t);
}
function Er(e, t, n) {
	wr(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = Cr(t + r.debit), n = Cr(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: Tr(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = Cr(r.reduce((e, t) => e + t.totalDebit, 0)), o = Cr(r.reduce((e, t) => e + t.totalCredit, 0));
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
function Dr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Or({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = vr(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: Dr(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = Dr(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = Dr(Er(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = Dr(l - d);
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
//#region src/features/sales/data/pricingInstant.ts
function kr(e, t) {
	let n = new Intl.DateTimeFormat("en-CA", {
		timeZone: t,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(new Date(e)), r = (e) => n.find((t) => t.type === e).value;
	return `${r("year")}-${r("month")}-${r("day")}`;
}
function Ar(e) {
	let t = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(e);
	if (!t || Number(t[2]) > 23 || Number(t[3]) > 59 || Number(t[4]) > 59 || !Number.isFinite(Date.parse(e))) throw Error("Pricing time must be an ISO timestamp with seconds and an explicit UTC offset.");
	if (T(t[1], "Pricing date"), t[6] !== "Z" && (Number(t[6].slice(1, 3)) > 14 || Number(t[6].slice(4)) > 59 || Number(t[6].slice(1, 3)) === 14 && Number(t[6].slice(4)) !== 0)) throw Error("Invalid pricing UTC offset.");
	return new Date(e).toISOString();
}
function jr(e, t, n = w().timezone, r = (/* @__PURE__ */ new Date()).toISOString()) {
	if (T(e, "Document date"), kr(r, n), t === void 0) {
		if (kr(r, n) === e) t = r;
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
	let i = Ar(t);
	if (kr(i, n) !== e) throw Error("Pricing time must fall on the document date in the pricing timezone.");
	return {
		pricingAt: i,
		pricingTimezone: n
	};
}
function Mr(e, t) {
	if (e.pricingAt === void 0 && e.pricingTimezone === void 0) return;
	if (!e.pricingAt || !e.pricingTimezone) throw Error("Incomplete pricing time snapshot.");
	let n = kr(Ar(e.pricingAt), e.pricingTimezone);
	if (t && n !== t) throw Error("Pricing snapshot date does not match the document.");
}
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function Nr(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Pr(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Fr(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var Ir = [
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
function Lr(e) {
	return Ir.find((t) => t.id === e);
}
function Rr(e, t) {
	return Lr(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/sales/data/areaPacks.ts
function zr(e, t) {
	let n = Lr(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function Br(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = zr(e, t);
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
function Vr(e) {
	if (e.requestedArea !== void 0 || e.areaPerPack !== void 0 || e.coveredArea !== void 0) {
		if (!Number.isFinite(e.areaPerPack) || !e.areaPerPack || e.areaPerPack <= 0 || !Number.isFinite(e.coveredArea) || Math.abs(e.coveredArea - e.quantity * e.areaPerPack) > 1e-7) throw Error("Invalid saved pack coverage.");
		if (e.requestedArea !== void 0) {
			let t = e.requestedArea / e.areaPerPack, n = Math.round(t), r = n > 0 && Math.abs(t - n) <= 2 ** -52 * Math.max(1, Math.abs(t)) * 4 ? n : Math.ceil(t);
			if (!Number.isFinite(e.requestedArea) || e.requestedArea <= 0 || e.requestedArea > 1e9 || e.quantity !== r) throw Error("Invalid saved area quantity.");
		}
	}
}
//#endregion
//#region src/features/sales/data/salesRecipients.ts
function Hr(e, t) {
	let n = I.getById(e);
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
function Ur(e) {
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
//#region src/features/sales/data/quoteStorage.ts
var Wr = "htt.mock.sales.quotes.v1", Gr = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function Kr(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !Gr.has(String(t.status)) || ![
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
function qr() {
	return je(Wr, Kr);
}
function Jr(e) {
	if (qr().status === "invalid" || !Me("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!D("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Yr = "htt.mock.sales.quote-orders.v1";
function Xr(e) {
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
function Zr(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!Kr(t.quotes) || !Xr(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function Qr() {
	return je(Yr, Zr);
}
function $r(e) {
	if (!Zr(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = Qr(), n = qr();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !Me("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!D("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var ei = "htt.mock.sales.documents.v1";
function ti(e) {
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
function ni(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!Zr(t) || !ti(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function ri() {
	return je(ei, ni);
}
function ii(e) {
	if (!ni(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = ri();
	if (t.status === "invalid" || t.status === "unavailable" || !Me("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!D("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var ai = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function oi(e) {
	let t = e.filter((e) => ai.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function si() {
	oi(O.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var ci = [{
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
}], li = [{
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
}], ui = [{
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
}], di = "htt.mock.sales.credit-notes.v1", fi = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, pi = (e) => typeof e == "string" && e.length > 0;
function mi(e) {
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
		].every((e) => pi(t[e])) || ![
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
		].every((e) => fi(i[e])) || !fi(t.amountApplied) || !fi(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => pi(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !fi(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !pi(e.id) || !pi(e.date) || !fi(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !pi(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !fi(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function hi() {
	return je(di, mi);
}
function gi(e) {
	if (!mi(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = hi();
	if (t.status === "invalid" || t.status === "unavailable" || !Me("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!D("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var _i = /* @__PURE__ */ new Set(), vi = hi(), yi = vi.status === "ok" ? structuredClone(vi.data.creditNotes) : [], bi = vi.status === "ok" ? structuredClone(vi.data.allocations) : [], xi = [...yi], Si = [...bi];
function Ci() {
	xi = [...yi], Si = [...bi], _i.forEach((e) => e());
}
function wi(e, t) {
	gi({
		creditNotes: e,
		allocations: t
	}), yi = e, bi = t, Ci();
}
var L = {
	subscribe(e) {
		return _i.add(e), () => {
			_i.delete(e);
		};
	},
	getSnapshot() {
		return xi;
	},
	getAllocationSnapshot() {
		return Si;
	},
	getAll() {
		return xi;
	},
	getAllAllocations() {
		return Si;
	},
	getById(e) {
		return yi.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return yi.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return yi.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return bi.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return bi.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (yi.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return wi([e, ...yi], bi), e;
	},
	update(e) {
		if (!yi.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return wi(yi.map((t) => t.id === e.id ? e : t), bi), e;
	},
	createAllocation(e) {
		if (bi.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return wi(yi, [e, ...bi]), e;
	},
	updateAllocation(e) {
		if (!bi.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return wi(yi, bi.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!yi.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = bi.some((t) => t.id === e.id) ? bi.map((t) => t.id === e.id ? e : t) : [e, ...bi];
		wi(yi.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return bi.find((t) => t.id === e);
	}
};
i("customerCredits", {
	repository: L,
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
			Ur(n.recipient);
			for (let e of n.lines) Vr(e), Fr(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: yi,
		allocations: bi
	}),
	restore: (e) => {
		yi = e.creditNotes, bi = e.allocations, xi = [...yi], Si = [...bi];
	},
	publish: () => _i.forEach((e) => e())
});
function Ti(e, t) {
	wi(yi.map((n) => n.id === e ? {
		...n,
		...t
	} : n), bi);
}
//#endregion
//#region src/features/business-workspace/productRules.ts
function Ei(e, t, n, r) {
	let i = Lr(e), a = Rr(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !Nr(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
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
var Di = "htt.mock.contacts.customerPricing.v1";
function Oi(e) {
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
function ki() {
	return je(Di, Oi);
}
function Ai(e) {
	if (ki().status === "invalid" || !Me("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!D("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var ji = [
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
], Mi = /* @__PURE__ */ new Set(), Ni = ki(), Pi = Ni.status === "ok" ? Ni.data : structuredClone(ji);
function Fi() {
	Mi.forEach((e) => {
		e();
	});
}
function Ii(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Li(e) {
	return e.trim() || void 0;
}
function Ri(e, t) {
	let n = Lr(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function zi(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function Bi({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = Pi.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : zi(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = Gi(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function Vi(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function Hi(e) {
	let t = Rr(e.productId, e.unitId);
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
var Ui = {
	subscribe(e) {
		return Mi.add(e), () => {
			Mi.delete(e);
		};
	},
	getSnapshot() {
		return Pi;
	},
	getAll() {
		return Pi;
	},
	getById(e) {
		return Pi.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Pi.filter((t) => t.customerId === e);
	},
	create(e, t) {
		Ri(t.productId, t.unitId);
		let n = Li(t.effectiveTo);
		t.active && Bi({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = Vi(t), a = {
			id: Ii("cprice"),
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
		}, o = [a, ...Pi];
		return Ai(o), Pi = o, Fi(), a;
	},
	update(e, t) {
		let n = Ui.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		Ri(t.productId, t.unitId);
		let r = Li(t.effectiveTo);
		t.active && Bi({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = Vi(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = Pi.map((t) => t.id === e ? a : t);
		return Ai(o), Pi = o, Fi(), a;
	},
	resolve(e) {
		return Hi(e);
	},
	resolvePrice(e, t, n, r, i = r) {
		let a = Ui.resolveBasePrice(e, t, n, r.slice(0, 10)), o = h({
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
		let { unit: i } = Ri(t, n), a = Pi.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && Wi(r, i.effectiveFrom, i.effectiveTo));
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
		let o = Hi(a);
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
function Wi(e, t, n) {
	return !(e < t || n && e > n);
}
function Gi(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
i("customerPrices", {
	repository: Ui,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: Pi }),
	restore: (e) => {
		Pi = e.customerPrices;
	},
	publish: () => Mi.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function Ki(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function qi({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = se(), inclusiveLineTotal: i }) {
	let a = Ki(e * n), o = Ki(i === void 0 ? a * r : i - a), s = Ki(a + o), c = Ki(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? Ki(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function Ji(e) {
	let t = Ki(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Ki(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Ki(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Yi({ customerId: e, documentDate: t, draft: n, pricingAt: i, pricingContext: a }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let o = Lr(n.productId);
	if (!o) throw Error(`Product ${n.productId} was not found`);
	if (o.status !== "ACTIVE") throw Error(`${o.name} is inactive`);
	let s = Rr(n.productId, n.unitId);
	if (!s) throw Error(`Unit ${n.unitId} was not found for ${o.name}`);
	let c = a ?? jr(t, i), l = Ui.resolvePrice(e, n.productId, n.unitId, t, c.pricingAt), u = n.unitPrice !== void 0, d = u ? n.unitPrice : l.effectivePrice;
	if (!Number.isFinite(d) || d < 0) throw Error("Unit price cannot be negative");
	let f = Br(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (Ei(n.productId, n.unitId, f.quantity, "sell"), o.sellEnabled === !1) throw Error("Product is not available for selling.");
	let p = o.taxCode ?? w().gstCode, m = se(p), h = u ? we(d, m, n.priceBasis) : d, g = qi({
		taxRate: m,
		inclusiveLineTotal: u && (n.priceBasis ?? w().basis) === "Inclusive" ? Math.round(f.quantity * d * 100) / 100 : void 0,
		quantity: f.quantity,
		standardUnitPrice: l.basePrice,
		unitPrice: h
	});
	return {
		id: Xi("line"),
		...c,
		itemType: o.itemType ?? "STOCK",
		...f,
		...r(p),
		priceBasis: u ? n.priceBasis ?? w().basis : "Exclusive",
		grossUnitPrice: u && (n.priceBasis ?? w().basis) === "Inclusive" ? d : void 0,
		promotionId: u ? void 0 : l.promotionId,
		productId: o.id,
		unitId: s.id,
		sku: o.sku,
		description: o.name,
		unitSymbol: s.symbol,
		quantity: f.quantity,
		standardUnitPrice: l.basePrice,
		unitPrice: h,
		priceSource: u ? "MANUAL" : l.source,
		customerPriceId: u ? void 0 : l.customerPrice?.id,
		...g
	};
}
function Xi(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var Zi = /* @__PURE__ */ new Set(), Qi = A.read().payments;
function $i() {
	Zi.forEach((e) => e());
}
function ea() {
	return `payment_${crypto.randomUUID()}`;
}
function ta() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Qi.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var na = {
	subscribe(e) {
		return Zi.add(e), () => {
			Zi.delete(e);
		};
	},
	getSnapshot() {
		return Qi;
	},
	getAll() {
		return Qi;
	},
	getById(e) {
		return Qi.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Qi.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Qi.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = F.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (T(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (ia(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = O.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: ia(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: ra(e.reference),
				notes: ra(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Qi.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: ea(),
			paymentNumber: ta(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: ia(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: ra(e.reference),
			notes: ra(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && O.bindResult(n, i.id);
		let a = [i, ...Qi];
		if (A.update("payments", a), Qi = a, n && !e.deferOperationCompletion) try {
			O.complete(n, i.id);
		} catch (e) {
			try {
				O.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return $i(), i;
	},
	recordDepositSettlement(e) {
		if (T(e.paymentDate), !e.depositId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid deposit application payment.");
		if (Qi.some((t) => t.id === e.id || t.depositApplicationId === e.applicationId)) throw Error("Deposit application payment already exists.");
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: e.id,
			paymentNumber: ta(),
			depositId: e.depositId,
			depositApplicationId: e.applicationId,
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			bankAccountId: e.bankAccountId,
			amount: ia(e.amount),
			reference: e.reference,
			method: "OTHER",
			notes: "Deposit applied to invoice; no new bank receipt.",
			status: "RECEIVED",
			createdAt: t,
			updatedAt: t
		}, r = [n, ...Qi];
		return A.update("payments", r), Qi = r, $i(), n;
	},
	reverseDepositSettlement(e, t, n) {
		T(t);
		let r = Qi.find((t) => t.id === e);
		if (!r?.depositApplicationId || r.status !== "RECEIVED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid deposit settlement reversal.");
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, a = Qi.map((t) => t.id === e ? i : t);
		return A.update("payments", a), Qi = a, $i(), i;
	},
	reverse(e, t) {
		let n = Qi.find((t) => t.id === e);
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
		}, o = Qi.map((t) => t.id === e ? a : t);
		return A.update("payments", o), Qi = o, $i(), a;
	},
	getReceivedByInvoice(e) {
		return Qi.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function ra(e) {
	return e?.trim() || void 0;
}
function ia(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
i("customerPayments", {
	repository: na,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null,
		recordDepositSettlement: null,
		reverseDepositSettlement: null
	},
	snapshot: () => ({ payments: Qi }),
	restore: (e) => {
		Qi = e.payments;
	},
	publish: () => Zi.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function aa(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || N.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(N.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
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
function oa(e) {
	return N.requireBySystemRole(e).id;
}
function sa(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: w().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function ca(e, t) {
	return P.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function la(e, t) {
	let n = ca(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var ua = {
	postInvoice(e) {
		return ca("CUSTOMER_INVOICE", e.id) || P.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: oa("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: oa("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...aa(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = la("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: sa(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = ca("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = F.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return P.post({
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
				accountId: oa("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = la("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: sa(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return ca("CREDIT_NOTE", e.id) || P.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: oa("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...aa(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: oa("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = la("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: sa(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, da = /* @__PURE__ */ new Set(), fa = ri(), pa = Qr(), ma = qr(), ha = fa.status === "ok" ? structuredClone(fa.data.quotes) : pa.status === "ok" ? structuredClone(pa.data.quotes) : ma.status === "ok" ? structuredClone(ma.data) : structuredClone(ci);
function ga(e) {
	fa.status === "ok" || ri().status !== "empty" ? ii({
		quotes: e,
		salesOrders: _a,
		invoices: va
	}) : pa.status === "ok" || Qr().status !== "empty" ? $r({
		quotes: e,
		salesOrders: _a
	}) : Jr(e), ha = e, Sa();
}
var _a = fa.status === "ok" ? structuredClone(fa.data.salesOrders) : pa.status === "ok" ? structuredClone(pa.data.salesOrders) : structuredClone(li), va = fa.status === "ok" ? structuredClone(fa.data.invoices) : structuredClone(ui);
function ya(e) {
	ii({
		quotes: ha,
		salesOrders: _a,
		invoices: e
	}), va = e, Sa();
}
function ba(e, t = ha) {
	fa.status === "ok" || ri().status !== "empty" ? ii({
		quotes: t,
		salesOrders: e,
		invoices: va
	}) : $r({
		quotes: t,
		salesOrders: e
	}), _a = e, ha = t, Sa();
}
var xa = Ca();
function Sa() {
	xa = Ca(), da.forEach((e) => e());
}
function Ca() {
	return [
		...ha,
		..._a,
		...va
	];
}
var R = {
	createManagedOrder(e) {
		let t = _a.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Ea("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: Da("SO", _a.map((e) => e.documentNumber)),
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
		return ba([r, ..._a]), r;
	},
	createManagedInvoice(e) {
		let t = va.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = R.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Ea("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: Da("INV", va.map((e) => e.documentNumber)),
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
		}, a = _a.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return ii({
			quotes: ha,
			salesOrders: a,
			invoices: [i, ...va]
		}), _a = a, va = [i, ...va], Sa(), ua.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = _a.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => va.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ba(_a.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return da.add(e), () => {
			da.delete(e);
		};
	},
	getSnapshot() {
		return re(xa);
	},
	getAll() {
		return re(xa);
	},
	getById(e) {
		return re(xa).find((t) => t.id === e);
	},
	getByCustomer(e) {
		return re(xa).filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return re(ha).filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return _a.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return va.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (wa(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = jr(e.documentDate, e.pricingAt), n = e.lines.map((n) => Yi({
			customerId: e.customerId,
			documentDate: e.documentDate,
			pricingContext: t,
			draft: n
		})), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Ea("quote"),
			type: "QUOTE",
			documentNumber: Da("QU", ha.map((e) => e.documentNumber)),
			recipient: Hr(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: Ta(e.customerReference),
			notes: Ta(e.notes),
			lines: n,
			totals: Ji(n),
			createdAt: r,
			updatedAt: r
		};
		return ga([i, ...ha]), i;
	},
	updateDraftQuote(e, t) {
		let n = ha.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = n.lines.find((e) => e.pricingAt), i = jr(t.documentDate, t.pricingAt ?? (t.documentDate === n.documentDate ? r?.pricingAt : void 0), t.documentDate === n.documentDate && (!t.pricingAt || t.pricingAt === r?.pricingAt) ? r?.pricingTimezone : void 0), a = t.lines.map((e) => {
			let r = Yi({
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
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : Hr(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: Ta(t.customerReference),
			notes: Ta(t.notes),
			lines: a,
			totals: Ji(a),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ga(ha.map((t) => t.id === e ? o : t)), o;
	},
	sendQuote(e) {
		let t = ha.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return ga(ha.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = ha.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return ga(ha.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = ha.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return ga(ha.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = ha.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Ea("order"),
			type: "SALES_ORDER",
			documentNumber: Da("SO", _a.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: Oa(),
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
		return ba([r, ..._a], ha.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = _a.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ba(_a.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = _a.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = Oa(), i = {
			id: Ea("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: Da("INV", va.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: ka(r, Number(w().terms)),
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
		}, a = [i, ...va], o = _a.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return ii({
			quotes: ha,
			salesOrders: o,
			invoices: a
		}), va = a, _a = o, Sa(), ua.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = va.find((t) => t.id === e.invoiceId);
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
			let i = L.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = L.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = Aa(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = Aa(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: Aa(c + l)
			};
		}), a = Ji(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (Aa(Aa(L.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > Aa(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: Ea("credit-note"),
			creditNoteNumber: Da("CN", L.getAll().map((e) => e.creditNoteNumber)),
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
		return L.create(s), ua.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		j(), si();
		let t = L.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = va.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = Aa(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = L.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Ea("credit-allocation"),
			allocationNumber: Da("CA", L.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = Aa(i.amountApplied + r), c = Aa(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (O.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			O.bindResult(l, o.id), L.commitAllocationAndCredit(o, {
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
		j(), si();
		let t = L.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = L.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = va.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = Aa(L.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = Aa(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (O.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			O.bindResult(l, t.id), L.commitAllocationAndCredit(o, {
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
		if (t().physicalCustomerReturns?.returns.some((t) => t.creditNoteId === e.creditNoteId && t.status === "POSTED")) throw Error("Reverse the linked physical customer return before voiding this credit.");
		e.voidDate && T(e.voidDate, "Credit reversal date");
		let n = L.getById(e.creditNoteId);
		if (!n) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (n.status === "VOID") throw Error("This credit note has already been voided");
		if (n.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if (e.voidDate && ((n.refundEvents ?? []).some((t) => (t.reversalDate ?? t.date) > e.voidDate) || L.getAllocationsByCreditNote(n.id).some((t) => (t.reversedAt ? me(t.reversedAt) : t.allocationDate) > e.voidDate))) throw Error("Credit reversal precedes later settlement activity.");
		if (e.voidDate && e.voidDate < n.creditDate) throw Error("Credit reversal date precedes credit date.");
		if ((n.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (L.getAllocationsByCreditNote(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: e.voidDate ?? i,
			voidReason: r,
			updatedAt: i
		};
		return L.update(a), ua.reverseCreditNote(a), a;
	},
	recordInvoicePayment(e) {
		if (j(), si(), e.operationId) {
			let t = O.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = va.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = Aa(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (T(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = na.create({
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
			ua.postPayment(a);
			let e = P.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
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
		j(), si();
		let n = va.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (na.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (L.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && L.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
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
			let t = P.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			O.bindResult(o, e), ua.reverseInvoice(a);
			let n = P.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			ya(va.map((t) => t.id === e ? a : t)), O.complete(o, e);
		} catch (e) {
			try {
				O.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		if (Et("CUSTOMER_PAYMENT", e), j(), si(), na.getById(e)?.depositApplicationId) throw Error("Reverse this settlement through customer deposits.");
		let n = na.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = va.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (O.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			O.bindResult(i, e);
			let n = na.reverse(e, t);
			ua.reversePayment(n);
			let a = P.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
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
		let t = va.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = na.getReceivedByInvoice(e), r = L.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = Aa(n.reduce((e, t) => e + t.amount, 0)), a = Aa(r.reduce((e, t) => e + t.amount, 0)), o = Aa(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : ja(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ya(va.map((t) => t.id === e ? c : t)), c;
	}
};
function wa(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function Ta(e) {
	return e?.trim() || void 0;
}
function Ea(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Da(e, t) {
	return xe(e, t, me((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function Oa() {
	return me((/* @__PURE__ */ new Date()).toISOString());
}
function ka(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function Aa(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ja(e) {
	return e < Ma(/* @__PURE__ */ new Date());
}
function Ma(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
i("sales", {
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
			Ur(e.recipient);
			for (let n of e.lines) Vr(n), Mr(n), Fr(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: ha,
		salesOrders: _a,
		invoices: va
	}),
	restore: (e) => {
		ha = e.quotes, _a = e.salesOrders, va = e.invoices, xa = Ca();
	},
	publish: () => da.forEach((e) => e())
});
function Na(e, t) {
	ya(va.map((n) => n.id === e ? {
		...n,
		...t
	} : n));
}
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var Pa = [
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
		currency: w().currency,
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
		currency: w().currency,
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
		currency: w().currency,
		taxRegistered: !0,
		createdAt: "2026-03-05T01:00:00.000Z",
		updatedAt: "2026-03-05T01:00:00.000Z"
	}
], Fa = "htt.mock.contacts.suppliers.v1";
function Ia(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var La = je(Fa, Ia), Ra = La.status !== "invalid" && Me(Fa), za = /* @__PURE__ */ new Set(), Ba = La.status === "ok" ? La.data : structuredClone(Pa);
function Va() {
	Ra && D(Fa, Ba), za.forEach((e) => {
		e();
	});
}
function Ha(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Ua() {
	let e = Ba.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function Wa(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Ga(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Ka(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: Wa(e.tradingName),
		abn: Ga(e.abn),
		status: e.status,
		email: Wa(e.email),
		phone: Wa(e.phone),
		website: Wa(e.website),
		contactName: Wa(e.contactName),
		addressLine1: Wa(e.addressLine1),
		addressLine2: Wa(e.addressLine2),
		suburb: Wa(e.suburb),
		state: Wa(e.state),
		postcode: Wa(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: Wa(e.notes)
	};
}
var qa = {
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
	getById(e) {
		return Ba.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Ha("sup"),
			code: Ua(),
			...Ka(e),
			currency: w().currency,
			createdAt: t,
			updatedAt: t
		};
		return Ba = [n, ...Ba], Va(), n;
	},
	update(e, t) {
		let n = qa.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...Ka(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ba = Ba.map((t) => t.id === e ? r : t), Va(), r;
	}
};
i("suppliers", {
	repository: qa,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: Ba }),
	restore: (e) => {
		Ba = e.suppliers;
	},
	publish: () => za.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function Ja(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ya({ orderedQuantity: e, unitCost: t, taxRate: n = se(), inclusiveLineTotal: r }) {
	let i = Ja(e * t), a = Ja(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Ja(i + a)
	};
}
function Xa(e) {
	let t = Ja(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Ja(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Ja(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var Za = /* @__PURE__ */ new Set(), Qa = A.read().purchaseOrders;
A.onRollback(() => {
	Qa = A.read().purchaseOrders;
});
function $a() {
	try {
		A.update("purchaseOrders", Qa);
	} catch (e) {
		throw Qa = A.read().purchaseOrders, e;
	}
	Za.forEach((e) => A.notify(e));
}
function eo(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function to(e) {
	return xe("PO", Qa.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function no(e) {
	return e?.trim() || void 0;
}
function ro(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = Ir.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (Ei(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let i = t.taxCode ?? w().gstCode, a = se(i), o = Ya({
			taxRate: a,
			inclusiveLineTotal: (e.priceBasis ?? w().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: we(e.unitCost, a, e.priceBasis)
		});
		return {
			id: eo("pol"),
			...r(i),
			grossUnitCost: (e.priceBasis ?? w().basis) === "Inclusive" ? e.unitCost : void 0,
			productId: t.id,
			unitId: n.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: n.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: we(e.unitCost, a, e.priceBasis),
			...o
		};
	});
}
function io(e) {
	let t = qa.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function ao(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var oo = {
	subscribe(e) {
		return Za.add(e), () => {
			Za.delete(e);
		};
	},
	getSnapshot() {
		return re(Qa);
	},
	getAll() {
		return re(Qa);
	},
	getById(e) {
		return re(Qa).find((t) => t.id === e);
	},
	getBySupplier(e) {
		return re(Qa).filter((t) => t.supplierId === e);
	},
	create(e) {
		ao(e);
		let t = io(e.supplierId), n = ro(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: eo("po"),
			purchaseOrderNumber: to(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: no(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: no(e.supplierReference),
			notes: no(e.notes),
			lines: n,
			totals: Xa(n),
			createdAt: r,
			updatedAt: r
		};
		return Qa = [i, ...Qa], $a(), i;
	},
	updateDraft(e, t) {
		let n = oo.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		ao(t);
		let r = io(t.supplierId), i = ro(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: no(t.expectedDeliveryDate),
			supplierReference: no(t.supplierReference),
			notes: no(t.notes),
			lines: i,
			totals: Xa(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Qa = Qa.map((e) => e.id === n.id ? a : e), $a(), a;
	},
	approve(e) {
		let t = oo.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return so(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = oo.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return so(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = oo.getById(e);
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
		return Qa = Qa.map((e) => e.id === n.id ? o : e), $a(), o;
	},
	recordSupplierBill(e, t) {
		let n = oo.getById(e);
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
			let n = co(e.billedQuantity + t);
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
		return Qa = Qa.map((e) => e.id === n.id ? c : e), $a(), c;
	},
	reverseSupplierBill(e, t) {
		let n = oo.getById(e);
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
				billedQuantity: co(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Qa = Qa.map((e) => e.id === n.id ? c : e), $a(), c;
	},
	cancel(e, t) {
		let n = oo.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return so(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function so(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return Qa = Qa.map((t) => t.id === e.id ? n : t), $a(), n;
}
function co(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
i("purchaseOrders", {
	repository: oo,
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
	snapshot: () => ({ purchaseOrders: Qa }),
	restore: (e) => {
		Qa = e.purchaseOrders;
	},
	publish: () => Za.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function z(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function lo(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function uo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function fo({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return lo(e / t);
}
function po({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return uo(e * t);
}
function mo({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = z(e + n), a = uo(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : lo(a / i)
	};
}
function ho({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return uo(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function go(e) {
	return uo(e.lines.reduce((e, t) => {
		let n = fo({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + po({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function _o(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function vo(e) {
	return N.requireBySystemRole(e).id;
}
function yo(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: w().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function bo(e, t) {
	return P.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function xo(e, t) {
	let n = bo(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var So = {
	validateGoodsReceiptPosting(e) {
		let t = N.requireBySystemRole("INVENTORY"), n = N.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = go(e);
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
		let t = P.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return P.post({
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
		let n = N.requireBySystemRole("GRNI"), r = N.requireBySystemRole("GST_RECEIVABLE"), i = N.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = _o(e.totals.subtotal - t);
		if (a !== 0) {
			let e = N.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = _o(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = bo("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return P.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: vo("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...aa(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: vo("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: vo("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = xo("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: yo(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = bo("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = F.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return P.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: vo("ACCOUNTS_PAYABLE"),
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
		let t = xo("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: yo(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return bo("SUPPLIER_CREDIT", e.id) || P.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: vo("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? vo("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...aa(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of P.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) P.reverse({
			journalEntryId: t.id,
			reversalDate: yo(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = xo("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: yo(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, Co = structuredClone([{
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
}]), wo = {
	getAll() {
		return Co;
	},
	getById(e) {
		return Co.find((t) => t.id === e);
	},
	getActive() {
		return Co.filter((e) => e.status === "ACTIVE");
	}
}, To = /* @__PURE__ */ new Set(), Eo = [];
function Do() {
	To.forEach((e) => e());
}
function Oo() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Eo.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var ko = {
	subscribe(e) {
		return To.add(e), () => {
			To.delete(e);
		};
	},
	getSnapshot() {
		return Eo;
	},
	getAll() {
		return Eo;
	},
	getByReference(e, t) {
		return Eo.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return Eo.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return Eo.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: Oo(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Eo = [t, ...Eo], Do(), t;
	}
};
i("inventoryMovements", {
	repository: ko,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: Eo }),
	restore: (e) => {
		Eo = e.movements;
	},
	publish: () => To.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var Ao = /* @__PURE__ */ new Set(), jo = [];
function Mo() {
	Ao.forEach((e) => e());
}
var No = {
	subscribe(e) {
		return Ao.add(e), () => {
			Ao.delete(e);
		};
	},
	getSnapshot() {
		return jo;
	},
	getAll() {
		return jo;
	},
	getBalance(e, t) {
		return jo.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = No.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return jo = jo.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? jo.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...jo], Mo(), e;
	},
	replaceAll(e) {
		jo = e, Mo();
	},
	clear() {
		jo = [], Mo();
	}
};
i("costBalances", {
	repository: No,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: jo }),
	restore: (e) => {
		jo = e.balances;
	},
	publish: () => Ao.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Po = /* @__PURE__ */ new Set(), Fo = [];
function Io() {
	Po.forEach((e) => e());
}
function Lo() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Fo.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Ro(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var zo = {
	subscribe(e) {
		return Po.add(e), () => {
			Po.delete(e);
		};
	},
	getSnapshot() {
		return Fo;
	},
	getAll() {
		return Fo;
	},
	getByReference(e, t) {
		return Fo.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return Fo.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return Fo.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return Fo.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return Ro(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: Lo(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = zo.build(e);
		return Fo = [t, ...Fo], Io(), t;
	},
	replaceAll(e) {
		Fo = e, Io();
	},
	clear() {
		Fo = [], Io();
	}
};
i("costMovements", {
	repository: zo,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: Fo }),
	restore: (e) => {
		Fo = e.movements;
	},
	publish: () => Po.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var Bo = /* @__PURE__ */ new Set(), Vo = "2026-01-01T00:00:00.000Z", Ho = Ir.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: Vo,
	updatedAt: Vo
}));
function Uo() {
	Bo.forEach((e) => e());
}
var Wo = {
	ensureProductPolicy(e, t, n) {
		let r = Ho.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return Ho = [...Ho.filter((t) => t.productId !== e), a], Uo(), a;
	},
	subscribe(e) {
		return Bo.add(e), () => {
			Bo.delete(e);
		};
	},
	getSnapshot() {
		return Ho;
	},
	getAll() {
		return Ho;
	},
	getByProductId(e) {
		return Ho.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = Wo.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !Nr(Lr(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...Wo.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ho = Ho.map((t) => t.productId === e ? n : t), Uo(), n;
	}
};
i("costingPolicies", {
	repository: Wo,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: Ho }),
	restore: (e) => {
		Ho = e.policies;
	},
	publish: () => Bo.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function Go(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function Ko(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function qo(e, t) {
	let n = Lr(e);
	if (!n) throw Error("Product was not found.");
	if (!Nr(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = Wo.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Rr(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function Jo(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = uo(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(uo(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function Yo(e) {
	if (e && zo.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function Xo({ movement: e, balance: t }) {
	let n = zo.getAll(), r = No.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	zo.replaceAll(i), No.replaceAll(a);
}
function Zo(e) {
	if (Go(e.quantity), Ko(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	Yo(e.inventoryMovementId);
	let { policy: t, unit: n } = qo(e.productId, e.unitId), r = z(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = fo({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = po({
		quantityBase: r,
		unitCostBase: i
	}), o = No.getBalance(e.siteId, e.productId);
	o && Jo(o, t.baseUnitId);
	let s = mo({
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
	Jo(l, t.baseUnitId);
	let u = zo.build({
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
	return Xo({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function Qo(e) {
	Go(e.quantity), Ko(e.occurredAt), Yo(e.inventoryMovementId);
	let { policy: t, unit: n } = qo(e.productId, e.unitId), r = z(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = No.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (Jo(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = lo(i.averageCostPerBaseUnit), o = ho({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = z(i.quantityOnHand - r), c = s === 0, l = uo(c ? -i.inventoryValue : -o), u = c ? 0 : uo(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : lo(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	Jo(p, t.baseUnitId);
	let m = zo.build({
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
	return Xo({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function $o(e) {
	if (Go(e.quantityBase), Ko(e.occurredAt), Yo(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = Lr(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!Nr(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = Wo.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = z(e.quantityBase), i = lo(e.unitCostBase), a = uo(e.inventoryValue), o = No.getBalance(e.siteId, e.productId);
	o && Jo(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = z(s + r), u = uo(c + a), d = l === 0 ? 0 : lo(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	Jo(p, n.baseUnitId);
	let m = zo.build({
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
	return Xo({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var es = /* @__PURE__ */ new Set(), ts = [];
function ns() {
	es.forEach((e) => e());
}
function rs(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var is = {
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
	getBalance(e, t) {
		return ts.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = is.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: rs(i.quantityOnHand + r),
				updatedAt: a
			};
			return ts = ts.map((r) => r.siteId === e && r.productId === t ? n : r), ns(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: rs(r),
			updatedAt: a
		};
		return ts = [o, ...ts], ns(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = is.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = rs(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ts = ts.map((n) => n.siteId === e && n.productId === t ? o : n), ns(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of ko.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: rs((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		ts = Array.from(e.values()), ns();
	}
};
i("stock", {
	repository: is,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: ts }),
	restore: (e) => {
		ts = e.balances;
	},
	publish: () => es.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var as = /* @__PURE__ */ new Set(), os = A.read().goodsReceipts;
A.onRollback(() => {
	os = A.read().goodsReceipts;
});
function ss() {
	try {
		A.update("goodsReceipts", os);
	} catch (e) {
		throw os = A.read().goodsReceipts, e;
	}
	as.forEach((e) => A.notify(e));
}
function cs(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function ls(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = os.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function us(e) {
	return e?.trim() || void 0;
}
var ds = {
	subscribe(e) {
		return as.add(e), () => {
			as.delete(e);
		};
	},
	getSnapshot() {
		return os;
	},
	getAll() {
		return os;
	},
	getById(e) {
		return os.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return os.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = oo.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = wo.getById(e.siteId);
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
			let r = cs(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!Lr(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Rr(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = cs(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: ls(e.receiptDate),
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
			supplierDeliveryReference: us(e.supplierDeliveryReference),
			notes: us(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		So.validateGoodsReceiptPosting(s), j();
		let c = k.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return k.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = Lr(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				k.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = ko.create({
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
				}), k.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					Zo({
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
				}), k.runStep(c, `STOCK:${r.id}`, () => {
					is.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			k.runStep(c, "JOURNAL", () => {
				So.postGoodsReceipt(s);
			}), k.runStep(c, "PURCHASE_ORDER", () => {
				oo.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), k.runStep(c, "RECEIPT", () => {
				os = [s, ...os], ss();
			});
		}), k.recover(c), s;
	}
};
i("goodsReceipts", {
	repository: ds,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: os }),
	restore: (e) => {
		os = e.goodsReceipts;
	},
	publish: () => as.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var fs = 1e-4;
function ps(e) {
	return uo(e);
}
function ms(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - z(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function hs(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function gs(e, t, n) {
	let r = fo({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return po({
		quantityBase: z(e * n),
		unitCostBase: r
	});
}
function _s(e, t, n) {
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
function vs(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = _s(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), ms(e.quantity), hs(e.billUnitCost);
		let r = z(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > fs);
		if (z(d.reduce((e, t) => e + t.availableQuantity, 0)) + fs < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= fs) break;
			let s = z(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = z(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = po({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: fo({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = ps(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= fs ? ps(p - m) : gs(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let g = ps(s * e.billUnitCost), _ = ps(g - h);
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
		if (r > fs) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = ps(ps(e.quantity * e.billUnitCost) - ps(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = ps(p.matchedBillValue + f), p.priceVariance = ps(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = z(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = z(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = ps(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = ps(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: ps(p - f)
	};
}
var ys = {
	calculate: vs,
	getAvailableReceiptLines(e, t, n) {
		return _s(e, t, n);
	}
}, bs = A.read().receiptMatches;
A.onRollback(() => {
	bs = A.read().receiptMatches;
});
var xs = /* @__PURE__ */ new Set(), Ss = () => {
	try {
		A.update("receiptMatches", bs);
	} catch (e) {
		throw bs = A.read().receiptMatches, e;
	}
	xs.forEach((e) => A.notify(e));
}, Cs = {
	getAll() {
		return [...bs];
	},
	subscribe(e) {
		return xs.add(e), () => {
			xs.delete(e);
		};
	},
	getSnapshot() {
		return bs;
	},
	getByBill(e) {
		return bs.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (bs.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		bs = [...bs, ...t], Ss();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		bs = bs.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), Ss();
	}
};
i("receiptMatches", {
	repository: Cs,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: bs }),
	restore: (e) => {
		bs = e.matches;
	},
	publish: () => xs.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function ws(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ts({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = ws(e * t), a = ws(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: ws(i + a)
	};
}
function Es(e) {
	let t = ws(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = ws(e.reduce((e, t) => e + t.taxAmount, 0)), r = ws(t + n);
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
var Ds = /* @__PURE__ */ new Set(), B = A.read().supplierBills;
A.onRollback(() => {
	B = A.read().supplierBills;
});
function Os() {
	try {
		A.update("supplierBills", B);
	} catch (e) {
		throw B = A.read().supplierBills, e;
	}
	Ds.forEach((e) => A.notify(e));
}
function ks(e) {
	return e?.trim() || void 0;
}
function As(e) {
	return xe("BILL", B.map((e) => e.billNumber), e.slice(0, 4));
}
var js = {
	insertExpenseBill(e) {
		let t = B.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (B.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return B = [e, ...B], Os(), e;
	},
	subscribe(e) {
		return Ds.add(e), () => {
			Ds.delete(e);
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
		let r = Ns(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = Ns(n.totals.amountPaid + r), a = Ns(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return B = B.map((t) => t.id === e ? o : t), Os(), o;
	},
	reversePayment(e, t) {
		let n = B.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = Ns(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = Ns(Math.max(0, n.totals.amountPaid - r)), a = Ns(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return B = B.map((t) => t.id === e ? o : t), Os(), o;
	},
	applyCredit(e, t) {
		let n = B.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = Ns(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = Ns(n.totals.amountCredited + r), a = Ns(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return B = B.map((t) => t.id === e ? o : t), Os(), o;
	},
	reverseCredit(e, t) {
		let n = B.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = Ns(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = Ns(Math.max(0, n.totals.amountCredited - r)), a = Ns(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return B = B.map((t) => t.id === e ? o : t), Os(), o;
	},
	markVoid(e, n) {
		let r = B.find((t) => t.id === e);
		if (!r) throw Error("Supplier bill was not found.");
		if (r.status === "VOID") throw Error("This supplier bill has already been voided.");
		let i = n.trim();
		if (i.length < 3) throw Error("A void reason is required.");
		if (r.status !== "OPEN" || r.totals.amountPaid > 0 || r.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((t().supplierCredits?.supplierCredits ?? A.read().supplierCredits).some((e) => e.sourceSupplierBillId === r.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (r.kind === "EXPENSE") {
			j();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...r,
				status: "VOID",
				voidedAt: e,
				voidReason: i,
				updatedAt: e
			};
			return So.reverseSupplierBill(t), B = B.map((e) => e.id === r.id ? t : e), Os(), t;
		}
		if (Cs.getByBill(r.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...r,
			status: "VOID",
			voidedAt: a,
			voidReason: i,
			updatedAt: a
		};
		j();
		let s = k.begin("SUPPLIER_BILL_VOID", r.id).key;
		return k.registerRecovery(s, () => {
			k.runStep(s, "REVERSAL_JOURNAL", () => {
				So.reverseSupplierBill(o);
			}), k.runStep(s, "PURCHASE_ORDER", () => {
				oo.reverseSupplierBill(r.purchaseOrderId, r.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), k.runStep(s, "MATCHES", () => {
				Cs.reverseForBill(r.id, i, me(a));
			}), k.runStep(s, "BILL", () => {
				B = B.map((e) => e.id === r.id ? o : e), Os();
			});
		}), k.recover(s), o;
	},
	getByPurchaseOrder(e) {
		return B.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = oo.getById(e.purchaseOrderId);
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
			let r = Ms(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = Ts({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = Ns(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = Ns(o.lineSubtotal + o.taxAmount)), {
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
		}), o = Es(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: As(e.billDate),
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
			notes: ks(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = ys.calculate({
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
			receipts: ds.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: Cs.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		So.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), j();
		let u = k.begin("SUPPLIER_BILL", c.id).key;
		return k.registerRecovery(u, () => {
			k.runStep(u, "JOURNAL", () => {
				So.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), k.runStep(u, "PURCHASE_ORDER", () => {
				oo.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), k.runStep(u, "MATCHES", () => {
				Cs.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), k.runStep(u, "BILL", () => {
				B = [c, ...B], Os();
			});
		}), k.recover(u), c;
	}
};
function Ms(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Ns(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
i("supplierBills", {
	repository: js,
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
	publish: () => Ds.forEach((e) => e())
});
function Ps(e, t) {
	let { status: n, ...r } = t;
	B = B.map((t) => t.id === e ? {
		...t,
		status: n,
		totals: {
			...t.totals,
			...r
		}
	} : t), Os();
}
//#endregion
//#region src/features/purchases/data/supplierPaymentRepository.ts
var Fs = /* @__PURE__ */ new Set(), Is = A.read().supplierPayments;
A.onRollback(() => {
	Is = A.read().supplierPayments;
});
function Ls() {
	A.update("supplierPayments", Is), Fs.forEach((e) => A.notify(e));
}
var Rs = {
	subscribe(e) {
		return Fs.add(e), () => {
			Fs.delete(e);
		};
	},
	getSnapshot() {
		return Is;
	},
	getAll() {
		return Is;
	},
	getById(e) {
		return Is.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Is.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return Is.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: Bs(e.reference),
			notes: Bs(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: Vs(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = Is.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (T(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = qa.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = F.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = js.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = Vs(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${Hs(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = Vs(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) js.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: zs(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: Bs(e.reference),
			notes: Bs(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return Is = [u, ...Is], Ls(), So.postSupplierPayment(u), u;
	},
	recordPrepaymentSettlement(e) {
		T(e.paymentDate);
		let t = qa.getById(e.supplierId), n = js.getById(e.supplierBillId);
		if (!t || !n || n.supplierId !== t.id || e.paymentDate < n.billDate || !e.prepaymentId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid supplier prepayment application.");
		if (Is.some((t) => t.id === e.id || t.prepaymentApplicationId === e.applicationId)) throw Error("Prepayment application already exists.");
		js.applyPayment(n.id, e.amount);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: e.id,
			prepaymentId: e.prepaymentId,
			prepaymentApplicationId: e.applicationId,
			paymentNumber: zs(e.paymentDate),
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
		return Is = [i, ...Is], Ls(), i;
	},
	reversePrepaymentSettlement(e, t, n) {
		T(t);
		let r = Is.find((t) => t.id === e);
		if (!r?.prepaymentApplicationId || r.status !== "POSTED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid supplier prepayment reversal.");
		for (let e of r.allocations) js.reversePayment(e.supplierBillId, e.amount);
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Is = Is.map((t) => t.id === e ? i : t), Ls(), i;
	},
	reverse(e, t) {
		if (Et("SUPPLIER_PAYMENT", e), Is.find((t) => t.id === e)?.prepaymentApplicationId) throw Error("Reverse this settlement through supplier prepayments.");
		let n = Is.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = js.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) js.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return Is = Is.map((t) => t.id === e ? a : t), Ls(), So.reverseSupplierPayment(a), a;
	}
};
function zs(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = Is.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Bs(e) {
	return e?.trim() || void 0;
}
function Vs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Hs(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: w().currency
	}).format(e);
}
var Us = Rs.create;
Rs.create = function(...e) {
	return j(), A.transaction(() => Us.apply(Rs, e));
};
var Ws = Rs.reverse;
Rs.reverse = function(...e) {
	return j(), A.transaction(() => Ws.apply(Rs, e));
}, i("supplierPayments", {
	repository: Rs,
	read: "purchases.read",
	commands: {
		recordPrepaymentSettlement: null,
		reversePrepaymentSettlement: null,
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: Is }),
	restore: (e) => {
		Is = e.supplierPayments;
	},
	publish: () => Fs.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var Gs = /* @__PURE__ */ new Set(), V = A.read().supplierCredits, Ks = A.read().supplierCreditAllocations, qs = A.read().supplierCredits, Js = A.read().supplierCreditAllocations;
A.onRollback(() => {
	V = A.read().supplierCredits, Ks = A.read().supplierCreditAllocations, qs = V, Js = Ks;
});
function Ys() {
	A.update("supplierCredits", V), A.update("supplierCreditAllocations", Ks), qs = [...V], Js = [...Ks], Gs.forEach((e) => A.notify(e));
}
var Xs = !1, H = {
	subscribe(e) {
		return Gs.add(e), () => {
			Gs.delete(e);
		};
	},
	getSnapshot() {
		return qs;
	},
	getAllocationSnapshot() {
		return Js;
	},
	getAll() {
		return qs;
	},
	getAllAllocations() {
		return Js;
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
		return Ks.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return Ks.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return Ks.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...H.create(e),
			physicalReturnId: t
		};
		return H.update(n), n;
	},
	voidReturnCredit(e) {
		Xs = !0;
		try {
			return H.voidCredit(e);
		} finally {
			Xs = !1;
		}
	},
	create(e) {
		let t = js.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (V.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!ec(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = nc(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = V.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = tc(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = tc(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || tc(m + f) > r.lineSubtotal || tc(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let g = tc(m + h);
			return {
				id: $s(`supplier-credit-line-${n + 1}`),
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
		}), s = tc(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = tc(o.reduce((e, t) => e + t.taxAmount, 0)), l = tc(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (tc(tc(V.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > tc(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: $s("supplier-credit"),
			creditNumber: Qs(e.creditDate),
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
		return V = [d, ...V], Ys(), So.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = V.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = js.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!ec(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = tc(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: $s("supplier-credit-allocation"),
			allocationNumber: Zs(e.allocationDate),
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
		js.applyCredit(n.id, r);
		let o = tc(t.amountApplied + r), s = tc(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return Ks = [a, ...Ks], V = V.map((e) => e.id === t.id ? c : e), Ys(), a;
	},
	reverseAllocation(e) {
		let t = Ks.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = V.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = js.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		js.reverseCredit(i.id, t.amount);
		let o = tc(Math.max(0, r.amountApplied - t.amount)), s = tc(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return V = V.map((e) => e.id === r.id ? c : e), Ks = Ks.map((e) => e.id === t.id ? l : e), Ys(), l;
	},
	voidCredit(e) {
		let t = V.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !Xs) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (Ks.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: Xs && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return V = V.map((e) => e.id === t.id ? i : e), Ys(), So.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!Ks.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return Ks = Ks.map((t) => t.id === e.id ? e : t), Ys(), e;
	},
	update(e) {
		if (!V.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return V = V.map((t) => t.id === e.id ? e : t), Ys(), e;
	}
};
function Zs(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = Ks.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Qs(e) {
	return xe("SC", V.map((e) => e.creditNumber), e.slice(0, 4));
}
function $s(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function ec(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function tc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function nc(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var rc = H.create;
H.create = function(...e) {
	return j(), A.transaction(() => rc.apply(H, e));
};
var ic = H.applyToBill;
H.applyToBill = function(...e) {
	return j(), A.transaction(() => ic.apply(H, e));
};
var ac = H.reverseAllocation;
H.reverseAllocation = function(...e) {
	return j(), A.transaction(() => ac.apply(H, e));
};
var oc = H.voidCredit;
H.voidCredit = function(...e) {
	return j(), A.transaction(() => oc.apply(H, e));
};
var sc = H.update;
H.update = function(...e) {
	return j(), A.transaction(() => sc.apply(H, e));
};
var cc = H.updateAllocation;
H.updateAllocation = function(...e) {
	return j(), A.transaction(() => cc.apply(H, e));
}, i("supplierCredits", {
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
		allocations: Ks
	}),
	restore: (e) => {
		V = e.supplierCredits, Ks = e.allocations, qs = [...V], Js = [...Ks];
	},
	publish: () => Gs.forEach((e) => e())
});
function lc(e, t) {
	V = V.map((n) => n.id === e ? {
		...n,
		...t
	} : n), Ys();
}
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function uc(e) {
	return ct({
		transactions: e?.transactions ?? In.getTransactions(),
		transfers: e?.transfers ?? In.getTransfers(),
		payments: na.getAll(),
		journals: e?.journals ?? P.getAll(),
		invoices: R.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: L.getAll(),
		supplierBills: js.getAll(),
		supplierPayments: Rs.getAll(),
		supplierCredits: H.getAll()
	});
}
//#endregion
//#region src/features/sales/data/salesRecoveryInspection.ts
var dc = {
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
function fc(e) {
	return ut(e).map((e) => ({
		...e,
		action: dc[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var pc = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function mc(e, t) {
	let n = fc(e).map((e) => ({ ...e })), r = t.filter((e) => pc.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => pc.has(e.kind))) s.has(e.operationId) && n.push({
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
function hc() {
	let e = R.getAll();
	return mc({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: na.getAll(),
		creditNotes: L.getAll(),
		allocations: L.getAllAllocations(),
		journals: P.getAll()
	}, O.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
function gc(e) {
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
var _c = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function vc(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!_c.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = mc(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function yc() {
	let e = R.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: na.getAll(),
		creditNotes: L.getAll(),
		allocations: L.getAllAllocations(),
		journals: P.getAll()
	};
}
function bc(e) {
	let n = [], r = yc(), i = O.list().find((t) => t.operationId === e), a = r.payments.find((e) => e.id === i?.resultId), o = (e) => Math.round(e * 100), s = (e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e) t.set(n.accountId, (t.get(n.accountId) ?? 0) + o(n.debit) - o(n.credit));
		return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
	};
	if (a && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(i.kind)) {
		let e = r.journals.find((e) => e.sourceType === "CUSTOMER_PAYMENT" && e.sourceId === a.id && !e.reversedJournalEntryId), i = N.getAll().find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE"), s = F.getById(a.bankAccountId)?.glAccountId;
		if (a.depositApplicationId) {
			let e = t().customerDeposits, n = e.applications.find((e) => e.id === a.depositApplicationId && e.paymentId === a.id);
			s = n ? e.deposits.find((e) => e.id === n.depositId)?.liabilityAccountId : void 0;
		}
		(!e || !i || !s || e.lines.length !== 2 || !e.lines.some((e) => e.accountId === s && o(e.debit) === o(a.amount) && o(e.credit) === 0) || !e.lines.some((e) => e.accountId === i.id && o(e.credit) === o(a.amount) && o(e.debit) === 0)) && n.push("Payment journal bank/deposit and receivables accounts do not match the bound payment.");
	}
	let c = r.journals.filter((e) => !e.reversedJournalEntryId && e.sourceId === i?.resultId && (i?.kind === "SALES_INVOICE_VOID" && e.sourceType === "CUSTOMER_INVOICE" || i?.kind === "SALES_PAYMENT_REVERSAL" && e.sourceType === "CUSTOMER_PAYMENT"));
	for (let e of c) {
		let t = r.journals.find((t) => t.id === e.reversalJournalEntryId);
		(!t || s(t.lines) !== s(e.lines.map((e) => ({
			...e,
			debit: e.credit,
			credit: e.debit
		})))) && n.push("Reversal journal accounts do not exactly reverse the original.");
	}
	try {
		let e = [
			...r.journals.map((e) => e.journalDate),
			...r.invoices.map((e) => e.documentDate),
			...r.creditNotes.map((e) => e.creditDate),
			...r.payments.map((e) => e.paymentDate)
		].sort().at(-1) ?? "1970-01-01", t = Or({
			accounts: N.getAll(),
			journalEntries: [...r.journals],
			asOfDate: e,
			customers: I.getAll(),
			documents: [
				...r.quotes,
				...r.salesOrders,
				...r.invoices
			],
			payments: [...r.payments],
			creditNotes: [...r.creditNotes],
			creditAllocations: [...r.allocations]
		});
		(!t.reconciled || !Number.isFinite(t.difference)) && n.push("Current receivables subledger and GL do not reconcile.");
	} catch (e) {
		n.push("Receivables reconciliation failed: " + e.message);
	}
	return n;
}
function xc(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = g("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return Se(t.view), t.result;
	}
	if (typeof e.approvalReference != "string" || e.approvalReference.length > 500) throw Error("Provide an approval reference of 3–500 characters.");
	let t = O.list(), n = t.find((t) => t.operationId === e.operationId);
	if (!n || !e.expectedRevision || gc(n) !== e.expectedRevision) throw Error("Recovery evidence changed. Refresh and review before approval.");
	let r = n.kind === "BANK_RECONCILIATION" ? Tn(e.operationId) : Vn(n.kind) ? Hn(e.operationId) : vc(yc(), t, e.operationId);
	n.kind !== "BANK_RECONCILIATION" && !Vn(n.kind) && r.push(...bc(e.operationId));
	let i = uc();
	if (i.length && r.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), r.length) throw Error(`Financial recovery remains blocked: ${r.join(" ")}`);
	let a = t.find((t) => t.operationId === e.operationId);
	return {
		closed: O.closeReviewed(e.operationId, a.resultId, e.approvalReference, e.approver),
		remaining: hc()
	};
}
//#endregion
//#region src/features/purchases/data/supplierBillBalanceAsAtService.ts
function Sc(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && Cc(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = wc(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && Cc(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = wc(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && Cc(n.reversedAt) <= r ? t : t + n.amount, 0)), o = wc(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: wc(Math.max(0, o - i - a))
	};
}
function Cc(e) {
	return me(e);
}
function wc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function Tc(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && Ec(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = Dc(e.totals.total), i = Dc(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && Ec(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: Dc(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function Ec(e) {
	return me(e);
}
function Dc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function Oc(e, t, n = [], r = [], i = [], a = Fc()) {
	let o = jc(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = Sc(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = Ac(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = Pc(r.reduce((t, n) => n.supplierId === e.id ? t + Tc(n, i, a).amountAvailable : t, 0)), p = Pc(s), m = Pc(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: Pc(c),
		aging: Mc(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function kc(e, t, n = [], r = [], i = [], a = Fc()) {
	let o = jc(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = Oc(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: Pc(s),
		unallocatedCredit: Pc(c),
		totalOutstanding: Pc(l),
		overdueAmount: Pc(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: Mc(o)
	};
}
function Ac(e, t = Fc()) {
	let n = Nc(e), r = Nc(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function jc() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function Mc(e) {
	return {
		current: Pc(e.current),
		days1To30: Pc(e.days1To30),
		days31To60: Pc(e.days31To60),
		days61To90: Pc(e.days61To90),
		days90Plus: Pc(e.days90Plus)
	};
}
function Nc(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function Pc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Fc() {
	return me((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function Ic(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Lc({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = kc(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = Ic(Er(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = Ic(c.totalOutstanding), f = Ic(d - u);
	return {
		asOfDate: s,
		grossOutstanding: Ic(c.grossOutstanding),
		unallocatedCredit: Ic(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function Rc(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function zc(e) {
	return e.slice(0, 10);
}
function Bc(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function Vc(e, t) {
	Rc(t);
	let n = e.filter((e) => zc(e.occurredAt) <= t).slice().sort(Bc), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = z(n.quantityOnHand + e.quantityBase), a = uo(n.inventoryValue + e.valueChange);
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
		let t = wo.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = Lr(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : lo(e.inventoryValue / e.quantityOnHand);
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
		totalInventoryValue: uo(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Hc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Uc(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Wc({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	Uc(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = Vc(n, r), o = Hc(Er(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Hc(a.totalInventoryValue), c = Hc(s - o);
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
//#region src/features/purchases/data/grniOutstandingReportService.ts
var Gc = uo, Kc = (e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !Number.isNaN(Date.parse(`${e}T00:00:00Z`)) && (/* @__PURE__ */ new Date(`${e}T00:00:00Z`)).toISOString().slice(0, 10) === e, qc = (e) => Date.parse(`${e}T00:00:00Z`), Jc = (e) => e <= 30 ? "CURRENT" : e <= 60 ? "31_60" : e <= 90 ? "61_90" : "OVER_90";
function Yc(e) {
	let { filters: t, receipts: n, matches: r, journals: i, grniAccountId: a } = e;
	if (!Kc(t.asOfDate)) throw Error("Invalid GRNI as-of date.");
	if (t.receiptDateFrom && !Kc(t.receiptDateFrom)) throw Error("Invalid receipt start date.");
	if (t.receiptDateTo && !Kc(t.receiptDateTo)) throw Error("Invalid receipt end date.");
	let o = [];
	for (let e of n) if (!(e.status !== "POSTED" || e.receiptDate > t.asOfDate) && !(t.supplierId && e.supplierId !== t.supplierId) && !(t.purchaseOrderId && e.purchaseOrderId !== t.purchaseOrderId) && !(t.goodsReceiptId && e.id !== t.goodsReceiptId) && !(t.siteId && e.siteId !== t.siteId) && !(t.receiptDateFrom && e.receiptDate < t.receiptDateFrom) && !(t.receiptDateTo && e.receiptDate > t.receiptDateTo)) for (let n of e.lines) {
		let i = r.filter((r) => r.goodsReceiptId === e.id && r.goodsReceiptLineId === n.id && (r.accountingDate ?? r.createdAt.slice(0, 10)) <= t.asOfDate && (!(r.reversalAccountingDate ?? r.reversedAt?.slice(0, 10)) || (r.reversalAccountingDate ?? r.reversedAt.slice(0, 10)) > t.asOfDate) && (r.status === "ACTIVE" || !!r.reversedAt)), a = z(i.reduce((e, t) => e + t.matchedQuantity, 0)), s = Gc(i.reduce((e, t) => e + t.matchedReceiptValue, 0)), c = po({
			quantityBase: n.receivedBaseQuantity,
			unitCostBase: fo({
				transactionUnitCost: n.unitCost,
				conversionToBase: n.conversionToBase
			})
		}), l = z(n.receivedQuantity - a), u = Gc(c - s);
		if (l < -1e-4 || u < -.01) throw Error(`Overmatched receipt line: ${e.receiptNumber}/${n.id}`);
		if (t.outstandingOnly && l <= 0 && Math.abs(u) < .005) continue;
		let d = Math.max(0, Math.floor((qc(t.asOfDate) - qc(e.receiptDate)) / 864e5));
		o.push({
			goodsReceiptId: e.id,
			goodsReceiptLineId: n.id,
			receiptNumber: e.receiptNumber,
			receiptDate: e.receiptDate,
			supplierId: e.supplierId,
			supplierName: e.supplierName,
			purchaseOrderId: e.purchaseOrderId,
			purchaseOrderNumber: e.purchaseOrderNumber,
			siteId: e.siteId,
			siteName: e.siteName,
			productId: n.productId,
			sku: n.sku,
			description: n.description,
			unitSymbol: n.unitSymbol,
			receivedQuantity: n.receivedQuantity,
			matchedQuantity: a,
			outstandingQuantity: l,
			receivedValue: c,
			matchedValue: s,
			outstandingValue: u,
			agingDays: d,
			agingBucket: Jc(d)
		});
	}
	let s = {
		receivedValue: Gc(o.reduce((e, t) => e + t.receivedValue, 0)),
		matchedValue: Gc(o.reduce((e, t) => e + t.matchedValue, 0)),
		outstandingValue: Gc(o.reduce((e, t) => e + t.outstandingValue, 0))
	}, c = {
		CURRENT: 0,
		"31_60": 0,
		"61_90": 0,
		OVER_90: 0
	};
	for (let e of o) c[e.agingBucket] = Gc(c[e.agingBucket] + e.outstandingValue);
	let l = !!(t.supplierId || t.purchaseOrderId || t.goodsReceiptId || t.siteId || t.receiptDateFrom || t.receiptDateTo), u = 0;
	for (let e of i) if (!(e.journalDate > t.asOfDate)) for (let t of e.lines) t.accountId === a && (u += t.credit - t.debit);
	return u = Gc(u), {
		asOfDate: t.asOfDate,
		rows: o,
		totals: s,
		aging: c,
		glCreditBalance: u,
		difference: l ? NaN : Gc(s.outstandingValue - u)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseAccountingReconciliationService.ts
var Xc = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Zc(e) {
	let { asOfDate: t, accounts: n, journalEntries: r, costMovements: i, receipts: a, matches: o } = e, s = (e) => {
		let t = n.find((t) => t.systemRole === e);
		if (!t) throw Error(`Missing accounting control account: ${e}`);
		return t;
	}, c = s("INVENTORY"), l = s("GRNI"), u = s("PURCHASE_PRICE_VARIANCE");
	if (c.type !== "ASSET" || l.type !== "LIABILITY" || u.type !== "EXPENSE") throw Error("Purchase reconciliation control account types are invalid.");
	let d = Wc({
		accounts: n,
		journalEntries: r,
		costMovements: i,
		asOfDate: t
	}), f = Yc({
		filters: { asOfDate: t },
		receipts: a,
		matches: o,
		journals: r,
		grniAccountId: l.id
	}), p = Xc(o.filter((e) => (e.accountingDate ?? e.createdAt.slice(0, 10)) <= t && (!(e.reversalAccountingDate ?? e.reversedAt?.slice(0, 10)) || (e.reversalAccountingDate ?? e.reversedAt.slice(0, 10)) > t) && (e.status === "ACTIVE" || !!e.reversedAt)).reduce((e, t) => e + t.priceVariance, 0)), m = Xc(r.filter((e) => e.journalDate <= t).flatMap((e) => e.lines).filter((e) => e.accountId === u.id).reduce((e, t) => e + t.debit - t.credit, 0)), h = (e, t, n) => {
		let r = Xc(t - n);
		return {
			accountId: e.id,
			accountCode: e.code,
			accountName: e.name,
			subledger: Xc(t),
			generalLedger: Xc(n),
			difference: r,
			status: r === 0 ? "MATCHED" : "DIFFERENCE"
		};
	}, g = h(c, d.subledgerInventoryValue, d.glInventoryBalance), _ = h(l, f.totals.outstandingValue, f.glCreditBalance), v = h(u, p, m);
	return {
		asOfDate: t,
		inventory: g,
		grni: _,
		ppv: v,
		reconciled: [
			g,
			_,
			v
		].every((e) => e.status === "MATCHED"),
		historicalMatchingWarning: "Legacy FIFO matches without accounting dates use createdAt/reversedAt; historical reports may differ from GL for those records."
	};
}
//#endregion
//#region src/features/customer-deposits/depositReconciliation.ts
function Qc(e) {
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
//#region src/features/supplier-prepayments/prepaymentReconciliation.ts
function $c(e) {
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
//#region electron/security/sourceMetadataRepair.ts
var el = e().trim().min(1).max(200), tl = e().regex(/^[a-f0-9]{64}$/), nl = e().trim().min(3).max(200), rl = x({
	operationId: el,
	expectedDigest: tl,
	reference: nl,
	summary: e().trim().min(10).max(4e3),
	businessChecked: b(!0),
	glChecked: b(!0),
	externalEvidenceChecked: b(!0)
}).strict(), il = x({
	operationId: el,
	proposalId: el,
	expectedDigest: tl,
	approvalReference: nl,
	confirm: b(!0)
}).strict(), al = (e) => Math.round(e * 100), ol = (e) => e / 100;
function sl(e) {
	return Array.isArray(e) ? e.map(sl) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, sl(t)])) : e;
}
var cl = (e) => Ee("sha256").update(JSON.stringify(sl(e))).digest("hex"), ll = [
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_PAYMENT_REVERSAL",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL"
];
function ul(e) {
	return {
		...e.sales,
		payments: e.customerPayments.payments,
		creditNotes: e.customerCredits.creditNotes,
		allocations: e.customerCredits.allocations,
		journals: e.journals.journalEntries
	};
}
function dl(e, t) {
	return cl(e) === cl(t);
}
function fl(t, n) {
	let r = ul(n), i = [];
	if (t.kind === "CUSTOMER_PAYMENT") {
		let n = x({
			customerId: el,
			invoiceId: el,
			paymentDate: el,
			amount: y().finite().positive(),
			method: el,
			bankAccountId: el,
			reference: e().optional(),
			notes: e().optional()
		}).strict().parse(JSON.parse(t.fingerprint));
		i = r.payments.filter((e) => e.status === "RECEIVED" && !e.depositApplicationId && dl(n, {
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: e.amount,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: e.reference,
			notes: e.notes
		}));
	} else if (t.kind === "SALES_CREDIT_APPLY") {
		let e = x({
			creditNoteId: el,
			invoiceId: el,
			allocationDate: el,
			amount: y().finite().positive()
		}).strict().parse(JSON.parse(t.fingerprint));
		i = r.allocations.filter((t) => t.status === "APPLIED" && dl(e, {
			creditNoteId: t.creditNoteId,
			invoiceId: t.invoiceId,
			allocationDate: t.allocationDate,
			amount: t.amount
		}));
	} else t.kind === "SALES_INVOICE_VOID" ? i = r.invoices.filter((e) => e.id === t.fingerprint && e.status === "VOID") : t.kind === "SALES_PAYMENT_REVERSAL" ? i = r.payments.filter((e) => e.id === t.fingerprint && e.status === "REVERSED") : t.kind === "SALES_CREDIT_REVERSAL" && (i = r.allocations.filter((e) => e.id === t.fingerprint && e.status === "REVERSED"));
	if (!(i.length !== 1 || t.resultId && t.resultId !== i[0].id)) return i[0].id;
}
function pl() {
	let e = t(), n = structuredClone(e), r = O.list(), i = [], a = [], o = cl({
		business: e,
		operations: r.filter((e) => e.kind !== "SOURCE_METADATA_REPAIR")
	}), s = (e, t, n, r, i, o) => {
		dl(r, i) || a.push({
			kind: e,
			id: t.id,
			path: n,
			before: r,
			after: i,
			evidence: o
		});
	}, c = (e) => Number.isFinite(e) && e >= 0 && Number.isSafeInteger(al(e)) && e === ol(al(e));
	for (let [e, t] of [
		["transactions", n.bankTransactions.bankTransactions],
		["transfers", n.bankTransactions.bankTransfers],
		["payments", n.customerPayments.payments],
		["supplierBills", n.supplierBills.supplierBills],
		["supplierPayments", n.supplierPayments.supplierPayments],
		["supplierCredits", n.supplierCredits.supplierCredits],
		["supplierCreditAllocations", n.supplierCredits.allocations],
		["journals", n.journals.journalEntries]
	]) dl(n.financialCache[e], t) || i.push("Financial cache/source copies disagree: " + e + ". Restore a consistent snapshot first.");
	for (let e of n.sales.invoices) {
		if (["VOID", "DRAFT"].includes(e.status)) continue;
		let t = n.customerPayments.payments.filter((t) => t.invoiceId === e.id && t.status === "RECEIVED"), r = n.customerCredits.allocations.filter((t) => t.invoiceId === e.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + al(t.amount), 0), o = r.reduce((e, t) => e + al(t.amount), 0), l = al(e.totals.total);
		if (!c(e.totals.total) || [...t, ...r].some((e) => !c(e.amount) || e.amount <= 0) || a + o > l) {
			i.push("Invalid or excessive invoice settlement: " + e.id);
			continue;
		}
		let u = {
			amountPaid: ol(a),
			amountDue: ol(l - a - o),
			status: l === a + o ? "PAID" : a + o > 0 ? "PARTIALLY_PAID" : e.status === "OVERDUE" ? "OVERDUE" : "ISSUED"
		};
		s("INVOICE", e, "/sales/invoices/" + encodeURIComponent(e.id), {
			amountPaid: e.amountPaid,
			amountDue: e.amountDue,
			status: e.status
		}, u, [
			...t.map((e) => "payment:" + e.id),
			...r.map((e) => "allocation:" + e.id),
			"CUSTOMER_INVOICE:" + e.id
		]), Object.assign(e, u);
	}
	for (let e of n.supplierBills.supplierBills) {
		if (e.status === "VOID") continue;
		let t = n.supplierPayments.supplierPayments.filter((e) => e.status === "POSTED").flatMap((t) => t.allocations.filter((t) => t.supplierBillId === e.id).map((e) => ({
			...e,
			supplierId: t.supplierId,
			paymentId: t.id
		}))), r = n.supplierCredits.allocations.filter((t) => t.supplierBillId === e.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + al(t.amount), 0), o = r.reduce((e, t) => e + al(t.amount), 0), l = al(e.totals.total);
		if (!c(e.totals.total) || [...t, ...r].some((t) => !c(t.amount) || t.amount <= 0 || t.supplierId !== e.supplierId) || a + o > l) {
			i.push("Invalid or excessive bill settlement: " + e.id);
			continue;
		}
		let u = {
			amountPaid: ol(a),
			amountCredited: ol(o),
			amountDue: ol(l - a - o),
			status: l === a + o ? "PAID" : a + o > 0 ? "PARTIALLY_PAID" : "OPEN"
		};
		s("BILL", e, "/purchases/bills/" + encodeURIComponent(e.id), {
			amountPaid: e.totals.amountPaid,
			amountCredited: e.totals.amountCredited,
			amountDue: e.totals.amountDue,
			status: e.status
		}, u, [
			...t.map((e) => "supplier-payment:" + e.paymentId),
			...r.map((e) => "supplier-allocation:" + e.id),
			"SUPPLIER_BILL:" + e.id
		]);
		let { status: d, ...f } = u;
		e.status = d, Object.assign(e.totals, f);
	}
	for (let e of [!0, !1]) {
		let t = e ? n.customerCredits.creditNotes : n.supplierCredits.supplierCredits, r = e ? n.customerCredits.allocations : n.supplierCredits.allocations;
		for (let n of t) {
			if (["VOID", "DRAFT"].includes(n.status)) continue;
			let t = r.filter((t) => t[e ? "creditNoteId" : "supplierCreditId"] === n.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + al(t.amount), 0), o = al(n.amountRefunded ?? 0), l = al(n.totals.total);
			if (!c(n.totals.total) || !c(n.amountRefunded ?? 0) || t.some((e) => !c(e.amount) || e.amount <= 0) || a + o > l) {
				i.push("Invalid or excessive credit settlement: " + n.id);
				continue;
			}
			let u = {
				amountApplied: ol(a),
				amountAvailable: ol(l - a - o),
				status: l === a + o ? "FULLY_APPLIED" : "ISSUED"
			};
			s(e ? "CUSTOMER_CREDIT" : "SUPPLIER_CREDIT", n, e ? "/sales/credit-notes/" + encodeURIComponent(n.id) : "/purchases/credits/" + encodeURIComponent(n.id), {
				amountApplied: n.amountApplied,
				amountAvailable: n.amountAvailable,
				status: n.status
			}, u, [...t.map((e) => "allocation:" + e.id), "Refund history and original GL retained"]), Object.assign(n, u);
		}
	}
	let l = r.filter((e) => e.state !== "COMPLETED" && e.kind !== "SOURCE_METADATA_REPAIR"), u = /* @__PURE__ */ new Map();
	for (let e of l) {
		if (!ll.includes(e.kind)) {
			i.push("Separate recovery required for " + e.kind + ": " + e.operationId);
			continue;
		}
		let t;
		try {
			t = fl(e, n);
		} catch {}
		if (!t) {
			i.push("Saved request has no unique exact existing result: " + e.operationId);
			continue;
		}
		if (r.some((n) => n.operationId !== e.operationId && n.kind === e.kind && n.resultId === t) || [...u.entries()].some(([n, i]) => i === t && r.find((e) => e.operationId === n)?.kind === e.kind)) {
			i.push("Another same-kind operation claims result " + t);
			continue;
		}
		u.set(e.operationId, t), s("OPERATION", { id: e.operationId }, "/accounting/recovery", {
			state: e.state,
			resultId: e.resultId ?? null
		}, {
			state: "COMPLETED",
			resultId: t
		}, ["Exact saved request matches one existing result", "All original/reversal GL, settlement and subledger checks required"]);
	}
	for (let e of n.purchaseOperations.filter((e) => e.status !== "POSTED" || e.error?.startsWith("Restored after restart:"))) {
		let t = n.supplierBills.supplierBills.find((t) => t.id === e.sourceId), r = n.journals.journalEntries.filter((t) => t.sourceType === "SUPPLIER_BILL" && t.sourceId === e.sourceId && !t.reversedJournalEntryId);
		if (e.kind !== "SUPPLIER_BILL" || e.key !== "SUPPLIER_BILL:" + e.sourceId || !t || t.status === "VOID" || ![
			"JOURNAL",
			"PURCHASE_ORDER",
			"MATCHES",
			"BILL"
		].every((t) => e.completedSteps.includes(t)) || r.length !== 1 || r[0].status !== "POSTED" || r[0].journalDate !== t.billDate) {
			i.push("Purchase posting requires separate source recovery: " + e.key);
			continue;
		}
		let a = n.purchaseOrders.purchaseOrders.find((e) => e.id === t.purchaseOrderId);
		if (!a || a.supplierId !== t.supplierId || t.lines.some((e) => {
			let r = a.lines.find((t) => t.id === e.purchaseOrderLineId), i = n.receiptMatches.matches.filter((n) => n.supplierBillId === t.id && n.supplierBillLineId === e.id && n.status === "ACTIVE"), o = n.supplierBills.supplierBills.filter((e) => e.purchaseOrderId === a.id && e.status !== "VOID").flatMap((e) => e.lines).filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId).reduce((e, t) => e + t.quantity, 0);
			return !r || Math.abs(r.billedQuantity - o) > 1e-8 || Math.abs(i.reduce((e, t) => e + t.matchedQuantity, 0) - e.quantity) > 1e-8 || i.some((t) => !n.goodsReceipts.goodsReceipts.some((n) => n.id === t.goodsReceiptId && n.lines.some((n) => n.id === t.goodsReceiptLineId && n.productId === e.productId)));
		})) {
			i.push("Purchase order/receipt matching evidence is incomplete: " + e.key);
			continue;
		}
		s("PURCHASE_OPERATION", { id: e.key }, "/purchases/bills/" + encodeURIComponent(t.id), {
			status: e.status,
			error: e.error ?? null
		}, {
			status: "POSTED",
			error: null
		}, [
			"All four source-owned steps recorded",
			r[0].id,
			"PO quantities, FIFO receipt matches and purchase controls verified"
		]);
	}
	let d = n.accounts.accounts.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE")?.id, f = n.accounts.accounts.find((e) => e.systemRole === "ACCOUNTS_PAYABLE")?.id;
	for (let e of [!1, !0]) for (let t of e ? n.supplierPayments.supplierPayments : n.customerPayments.payments) {
		let r = n.journals.journalEntries.filter((n) => n.sourceType === (e ? "SUPPLIER_PAYMENT" : "CUSTOMER_PAYMENT") && n.sourceId === t.id && !n.reversedJournalEntryId), a = n.bankAccounts.bankAccounts.find((e) => e.id === t.bankAccountId)?.glAccountId;
		if (t.depositApplicationId) {
			let e = n.customerDeposits.applications.find((e) => e.id === t.depositApplicationId && e.paymentId === t.id);
			a = n.customerDeposits.deposits.find((t) => t.id === e?.depositId)?.liabilityAccountId;
		}
		if (t.prepaymentApplicationId) {
			let e = n.supplierPrepayments.applications.find((e) => e.id === t.prepaymentApplicationId && e.paymentId === t.id);
			a = n.supplierPrepayments.prepayments.find((t) => t.id === e?.prepaymentId)?.assetAccountId;
		}
		let o = e ? f : a, s = e ? a : d;
		(!c(t.amount) || t.amount <= 0 || r.length !== 1 || r[0].status !== (t.status === "REVERSED" ? "REVERSED" : "POSTED") || r[0].journalDate !== t.paymentDate || !o || !s || r[0].lines.length !== 2 || !r[0].lines.some((e) => e.accountId === o && al(e.debit) === al(t.amount) && e.credit === 0) || !r[0].lines.some((e) => e.accountId === s && al(e.credit) === al(t.amount) && e.debit === 0)) && i.push("Payment original date, bank/control accounts or amount do not match: " + t.id), e && t.allocations.some((e) => {
			let r = n.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId);
			return !r || r.supplierId !== t.supplierId || !c(e.amount) || e.amount <= 0 || t.status === "POSTED" && r.status === "VOID";
		}) && i.push("Supplier payment allocation references are invalid: " + t.id);
	}
	for (let e of n.supplierCredits.allocations) {
		let t = n.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId), r = n.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId);
		(!t || !r || t.supplierId !== e.supplierId || r.supplierId !== e.supplierId || !c(e.amount) || e.amount <= 0 || e.status === "APPLIED" && (t.status === "VOID" || r.status === "VOID")) && i.push("Supplier credit allocation references are invalid: " + e.id);
	}
	for (let e of n.journals.journalEntries) (!["POSTED", "REVERSED"].includes(e.status) || new Set(e.lines.map((e) => e.id)).size !== e.lines.length || e.lines.some((e) => !c(e.debit) || !c(e.credit) || e.debit > 0 && e.credit > 0 || !n.accounts.accounts.some((t) => t.id === e.accountId))) && i.push("Invalid GL identity, lifecycle, account or line amounts: " + e.id);
	for (let e of n.journals.journalEntries.filter((e) => e.status === "REVERSED")) {
		let t = n.journals.journalEntries.filter((t) => t.id === e.reversalJournalEntryId && t.reversedJournalEntryId === e.id && t.status === "POSTED"), r = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, (t.get(n.accountId) ?? 0) + al(n.debit) - al(n.credit));
			return [...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t));
		};
		(t.length !== 1 || t[0].journalDate < e.journalDate || !dl(r(t[0].lines), r(e.lines.map((e) => ({
			...e,
			debit: e.credit,
			credit: e.debit
		}))))) && i.push("Original/reversal account proof failed: " + e.id);
	}
	let p = ul(n), m = r.map((e) => u.has(e.operationId) ? {
		...e,
		resultId: u.get(e.operationId),
		state: "COMPLETED"
	} : e);
	for (let [e, t] of u) {
		let n = r.find((t) => t.operationId === e), a = {
			...n,
			resultId: t,
			state: "MANUAL_REVIEW",
			reviewHistory: n.reviewHistory?.length ? n.reviewHistory : [{
				reference: "prospective-proof",
				operator: "prospective-reviewer",
				recordedAt: n.updatedAt,
				summary: "Prospective proof only; no review is persisted."
			}]
		};
		i.push(...vc(p, m.map((t) => t.operationId === e ? a : t), e).map((t) => e + ": " + t));
	}
	i.push(...ct({
		transactions: n.bankTransactions.bankTransactions,
		transfers: n.bankTransactions.bankTransfers,
		payments: p.payments,
		journals: p.journals,
		invoices: p.invoices,
		creditNotes: p.creditNotes,
		supplierBills: n.supplierBills.supplierBills,
		supplierPayments: n.supplierPayments.supplierPayments,
		supplierCredits: n.supplierCredits.supplierCredits
	}).map((e) => e.code + ": " + e.entityId)), i.push(...ut(p).map((e) => e.code + ": " + e.entityId)), n.financialCache.supplierBills = structuredClone(n.supplierBills.supplierBills), n.financialCache.supplierCredits = structuredClone(n.supplierCredits.supplierCredits);
	try {
		ee(n, e), le(n);
	} catch (e) {
		i.push("Source snapshot validation: " + e.message);
	}
	let h = [
		...p.journals.map((e) => e.journalDate),
		...p.invoices.map((e) => e.documentDate),
		...n.supplierBills.supplierBills.map((e) => e.billDate)
	].sort().at(-1) ?? "1970-01-01", g = {
		accounts: n.accounts.accounts,
		journalEntries: p.journals,
		asOfDate: h
	};
	for (let [e, t] of [
		["AR", () => Or({
			...g,
			customers: n.customers.customers,
			documents: [
				...p.quotes,
				...p.salesOrders,
				...p.invoices
			],
			payments: p.payments,
			creditNotes: p.creditNotes,
			creditAllocations: p.allocations
		})],
		["AP", () => Lc({
			...g,
			suppliers: n.suppliers.suppliers,
			bills: n.supplierBills.supplierBills,
			payments: n.supplierPayments.supplierPayments,
			credits: n.supplierCredits.supplierCredits,
			creditAllocations: n.supplierCredits.allocations
		})],
		["Inventory/GRNI/PPV", () => Zc({
			...g,
			costMovements: n.costMovements.movements,
			receipts: n.goodsReceipts.goodsReceipts,
			matches: n.receiptMatches.matches
		})],
		["Deposits", () => Qc({
			deposits: n.customerDeposits,
			accounts: n.accounts.accounts,
			journals: [...p.journals],
			banks: n.bankAccounts.bankAccounts,
			customers: n.customers.customers,
			asOfDate: h
		})],
		["Prepayments", () => $c({
			prepayments: n.supplierPrepayments,
			accounts: n.accounts.accounts,
			journals: [...p.journals],
			banks: n.bankAccounts.bankAccounts,
			suppliers: n.suppliers.suppliers,
			asOfDate: h
		})]
	]) try {
		t().reconciled || i.push(e + " does not reconcile after projection.");
	} catch (t) {
		i.push(e + " check failed: " + t.message);
	}
	return a.length || i.push("No supported source metadata defects found."), {
		evidenceDigest: o,
		eligible: !i.length,
		blockers: [...new Set(i)],
		changes: a
	};
}
function ml(e) {
	return E.require("audit.read"), x({}).strict().parse(e), pl();
}
function hl(e) {
	let t = E.require("accounting.recover"), n = rl.parse(e), r = O.list().find((e) => e.operationId === n.operationId), i = JSON.stringify(n);
	if (r) {
		if (r.kind !== "SOURCE_METADATA_REPAIR" || r.state === "COMPLETED" && r.fingerprint !== i) throw Error("Operation ID was used for different recovery data.");
		if (r.fingerprint === i || r.repairProposal?.reference === n.reference && r.repairProposal.evidenceDigest === n.expectedDigest && r.repairProposal.summary === n.summary) return r;
	}
	if (O.getUnresolved().some((e) => e.kind === "SOURCE_METADATA_REPAIR" && e.operationId !== n.operationId)) throw Error("An existing source repair proposal must be reviewed or replaced first.");
	let a = pl();
	if (!a.eligible || a.evidenceDigest !== n.expectedDigest) throw Error("Source repair blocked or evidence changed: " + a.blockers.join(" "));
	return r || (O.begin(n.operationId, "SOURCE_METADATA_REPAIR", i), O.bindResult(n.operationId, n.operationId)), O.recordManualReview(n.operationId, n.reference, t.userId, n.summary), O.attachRepairProposal(n.operationId, {
		id: crypto.randomUUID(),
		action: "REPAIR_SOURCE_METADATA",
		evidenceDigest: a.evidenceDigest,
		planJson: JSON.stringify({
			...a,
			operationId: n.operationId,
			resultId: n.operationId,
			action: "REPAIR_SOURCE_METADATA"
		}),
		reviewer: t.userId,
		reference: n.reference,
		summary: n.summary,
		proposedAt: (/* @__PURE__ */ new Date()).toISOString(),
		status: "PROPOSED"
	});
}
function gl(e) {
	let t = E.require("accounting.recover"), n = il.parse(e), r = O.list().find((e) => e.operationId === n.operationId), i = r?.repairProposal;
	if (r?.kind !== "SOURCE_METADATA_REPAIR" || !i || i.id !== n.proposalId || i.evidenceDigest !== n.expectedDigest) throw Error("Source repair proposal changed.");
	if (i.status === "EXECUTED") {
		if (i.approver !== t.userId || i.approvalReference !== n.approvalReference) throw Error("Already executed under another approval.");
		return r;
	}
	if (i.reviewer === t.userId || r.reviewHistory?.some((e) => e.operator === t.userId)) throw Error("A different authorized operator must approve.");
	let a = pl(), o = JSON.parse(i.planJson);
	if (!a.eligible || a.evidenceDigest !== i.evidenceDigest || !dl(a.changes, o.changes)) throw Error("Source repair evidence changed. Refresh and replace the proposal.");
	let s = O.list();
	for (let e of a.changes.filter((e) => e.kind === "OPERATION")) if (s.find((t) => t.operationId === e.id)?.reviewHistory?.some((e) => e.operator === t.userId)) throw Error("Approver recorded review evidence on a source operation. Use another authorized operator.");
	return A.transaction(() => {
		for (let e of a.changes) e.kind === "INVOICE" ? Na(e.id, e.after) : e.kind === "BILL" ? Ps(e.id, e.after) : e.kind === "CUSTOMER_CREDIT" ? Ti(e.id, e.after) : e.kind === "SUPPLIER_CREDIT" && lc(e.id, e.after);
		let e = pl();
		if (e.blockers.some((e) => e !== "No supported source metadata defects found.") || e.changes.some((e) => e.kind !== "OPERATION" && e.kind !== "PURCHASE_OPERATION")) throw Error("Post-repair source verification failed: " + e.blockers.join(" "));
		for (let [e, r] of a.changes.filter((e) => e.kind === "OPERATION").entries()) O.adoptReviewedResult(r.id, String(r.after.resultId)), O.recordManualReview(r.id, i.reference + " / " + e, i.reviewer, "Source repair " + i.id + ": exact request, original GL and settlement verified."), O.closeReviewed(r.id, String(r.after.resultId), n.approvalReference + " / " + e, t.userId);
		for (let e of a.changes.filter((e) => e.kind === "PURCHASE_OPERATION")) k.setStatus(e.id, "POSTED");
		let r = pl();
		if (r.changes.length || r.blockers.some((e) => e !== "No supported source metadata defects found.")) throw Error("Final source verification failed.");
		return O.finishRepair(n.operationId, i.id, t.userId, n.approvalReference, r.evidenceDigest);
	});
}
function _l(t) {
	let n = E.require("accounting.recover"), r = x({
		operationId: el,
		proposalId: el,
		reason: e().trim().min(10).max(500)
	}).strict().parse(t), i = pl();
	if (i.changes.length || i.blockers.some((e) => e !== "No supported source metadata defects found.")) throw Error("Source defects remain. Replace the reviewed proposal or use validated backup recovery; withdrawal cannot release unresolved source blockers.");
	return O.withdrawSourceRepair(r.operationId, r.proposalId, n.userId, r.reason);
}
//#endregion
//#region electron/security/targetedFinancialRepair.ts
var vl = e().trim().min(1).max(200), yl = e().trim().min(3).max(500), bl = e().trim().min(10).max(4e3), xl = e().regex(/^[a-f0-9]{64}$/), Sl = x({ operationId: vl }).strict(), Cl = Sl.extend({
	expectedDigest: xl,
	reference: yl,
	summary: bl,
	businessChecked: b(!0),
	glChecked: b(!0),
	externalEvidenceChecked: b(!0)
}).strict(), wl = Sl.extend({
	proposalId: vl,
	expectedDigest: xl,
	approvalReference: yl,
	confirm: b(!0)
}).strict(), Tl = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function El(e) {
	return Array.isArray(e) ? e.map(El) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, El(t)])) : e;
}
var Dl = (e) => Ee("sha256").update(JSON.stringify(El(e))).digest("hex");
function Ol() {
	return Dl({
		business: t(),
		operations: O.list().map(({ repairProposal: e, ...t }) => t)
	});
}
function kl(e, t) {
	return typeof e == "string" ? e === t || e.startsWith(t + ":") : Array.isArray(e) ? e.some((e) => kl(e, t)) : !!e && typeof e == "object" && Object.values(e).some((e) => kl(e, t));
}
function Al(t) {
	let n = {
		amount: y().finite().positive(),
		description: e().trim().min(1).max(2e3),
		reference: e().max(2e3).optional()
	}, r = (t.kind === "BANK_TRANSACTION" ? x({
		...n,
		bankAccountId: vl,
		transactionDate: vl,
		direction: o(["MONEY_IN", "MONEY_OUT"]),
		offsetAccountId: vl
	}).strict() : x({
		...n,
		fromBankAccountId: vl,
		toBankAccountId: vl,
		transferDate: vl
	}).strict()).parse(JSON.parse(t.fingerprint));
	return {
		...r,
		amount: Tl(r.amount),
		description: r.description.trim(),
		reference: r.reference?.trim() || void 0
	};
}
function jl(e) {
	let n = O.list(), r = n.find((t) => t.operationId === e), i = {
		operationId: e,
		resultId: r?.resultId,
		evidenceDigest: Ol(),
		eligible: !1,
		blockers: [],
		changes: []
	}, a = (e) => (i.blockers.push(e), { public: i });
	if (!r || r.state === "COMPLETED") return a("An unresolved operation is required.");
	if (!r.resultId?.trim()) return a("No durable bound result identity. Absence of effects cannot be proved; use validated backup recovery.");
	if (!["BANK_TRANSACTION", "BANK_TRANSFER"].includes(r.kind)) return a("This operation kind has no targeted repair procedure. Existing verified closure or validated backup recovery remains available.");
	if (n.some((e) => e.operationId !== r.operationId && e.resultId === r.resultId)) return a("Another operation claims this result.");
	let o;
	try {
		o = Al(r);
	} catch {
		return a("Saved bank intent is invalid or unreadable.");
	}
	if (o.amount <= 0) return a("Saved bank amount does not round to positive cents.");
	let s = In.getTransactions(), c = In.getTransfers(), l = P.getAll(), u = [...s, ...c].filter((e) => e.id === r.resultId), d = l.filter((e) => e.sourceType === r.kind && e.sourceId === r.resultId), f = t();
	if (l.some((e) => e.sourceId === r.resultId && e.sourceType !== r.kind)) return a("A journal with another source kind claims this bound result.");
	let p = A.read();
	if (JSON.stringify(p.transactions) !== JSON.stringify(s) || JSON.stringify(p.transfers) !== JSON.stringify(c) || JSON.stringify(p.journals) !== JSON.stringify(l)) return a("Financial cache and source repositories disagree; restore a consistent snapshot first.");
	if (new Set(l.map((e) => e.id)).size !== l.length || u.length > 1) return a("Duplicate bank or journal identities are ambiguous.");
	if (u.length === 1 && d.length === 2) {
		let t = u[0], s = d.find((e) => e.id === t.journalEntryId), c = d.find((e) => e.id !== t.journalEntryId);
		if (!s || !c || s.status !== "POSTED" || c.status !== "POSTED" || [s, c].some((e) => e.bankDuplicateCorrection || e.reversedJournalEntryId || e.reversalJournalEntryId || e.reversedAt) || !be(s, c)) return a("Duplicate journals must be exact original postings with an unambiguous existing bank-record link.");
		let p = { ...f };
		if (delete p.journals, delete p.financialCache, Object.values(p).some((e) => kl(e, c.id)) || n.some((e) => kl(e, c.id)) || l.some((e) => e.id !== c.id && kl(e, c.id))) return a("The duplicate journal is referenced by matching, clearing or another source.");
		let m = s.journalDate;
		try {
			T(m, "Duplicate financial date"), Rt(m), Dt(m, c.lines.map((e) => e.accountId));
		} catch (e) {
			return a(e.message);
		}
		if (c.lines.some((e) => !N.getAll().find((t) => t.id === e.accountId)?.active) || F.getAll().some((e) => c.lines.some((t) => t.accountId === e.glAccountId) && !e.active)) return a("Duplicate correction requires active bank and GL accounts.");
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
		}, y = { journals: [_, ...l.map((e) => e.id === c.id ? v : e)] }, b = Hn(e, y, !1), x = uc(y);
		return ue(y.journals).invalid.length || b.length || x.length ? a("Exact duplicate correction cannot prove an isolated repair: " + [...b, ...x.map((e) => e.code)].join(" ")) : (i.action = "REVERSE_BANK_DUPLICATE", i.journalDate = m, i.amount = o.amount, i.existingJournalId = s.id, i.duplicateJournalId = c.id, i.eligible = !0, i.changes = [
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
		if (Object.entries(f).some(([e, t]) => e !== "financialCache" && kl(t, r.resultId))) return a("Other business records still reference the bound result.");
		let e = uc();
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
		if (delete t.journals, delete t.financialCache, Object.values(t).some((e) => kl(e, r.resultId))) return a("Another repository references the missing bank result.");
		if ([...s.map((e) => e.transactionNumber), ...c.map((e) => e.transferNumber)].includes(h)) return a("Recovered business number is already in use.");
		let n = "transactionNumber" in g ? { transactions: [g, ...s] } : { transfers: [g, ...c] }, o = Hn(e, n, !1), l = uc(n);
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
			if (delete e.bankTransactions, delete e.financialCache, Object.values(e).some((e) => kl(e, t.journalEntryId))) return a("The stale missing journal is still referenced by another repository.");
		}
		let o = {
			...t,
			journalEntryId: n.id
		}, p = "transactionNumber" in o ? { transactions: s.map((e) => e.id === o.id ? o : e) } : { transfers: c.map((e) => e.id === o.id ? o : e) }, m = Hn(e, p, !1), h = uc(p);
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
		if (delete n.bankTransactions, delete n.financialCache, Object.values(n).some((e) => kl(e, t.journalEntryId))) return a("Missing journal is referenced by clearing, matching or another repository.");
		let d = "bankAccountId" in g ? F.getById(g.bankAccountId) : void 0, p = "fromBankAccountId" in g ? F.getById(g.fromBankAccountId) : void 0, h = "toBankAccountId" in g ? F.getById(g.toBankAccountId) : void 0, _ = "direction" in g ? g.direction === "MONEY_IN" ? d?.glAccountId : g.offsetAccountId : h?.glAccountId, v = "direction" in g ? g.direction === "MONEY_IN" ? g.offsetAccountId : d?.glAccountId : p?.glAccountId;
		if (!_ || !v) return a("Bank GL mapping is missing.");
		try {
			Rt(m), Dt(m, [_, v]);
		} catch (e) {
			return a(e.message);
		}
		if ([
			d,
			p,
			h
		].filter(Boolean).some((e) => !e.active) || [_, v].some((e) => !N.getAll().find((t) => t.id === e)?.active)) return a("Missing-journal repair requires currently active bank and GL accounts.");
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
		}, b = "repair-preview:" + r.operationId;
		if (l.some((e) => e.id === b)) return a("Preview journal identity collision.");
		let x = {
			id: b,
			journalNumber: "Pending repair approval",
			journalDate: m,
			description: o.description,
			reference: o.reference,
			sourceType: y.sourceType,
			sourceId: r.resultId,
			status: "POSTED",
			lines: y.lines.map((e, t) => {
				let n = N.requireById(e.accountId);
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
		}, S = {
			...t,
			journalEntryId: b
		}, ee = "transactionNumber" in S ? {
			transactions: s.map((e) => e.id === S.id ? S : e),
			journals: [x, ...l]
		} : {
			transfers: c.map((e) => e.id === S.id ? S : e),
			journals: [x, ...l]
		}, te = Hn(e, ee, !1), C = uc(ee);
		return te.length || C.length ? a("Business record and saved intent cannot prove an isolated missing-journal repair: " + [...te, ...C.map((e) => e.code)].join(" ")) : (i.action = "RESTORE_BANK_JOURNAL", i.previousJournalId = t.journalEntryId, i.debitAccountId = _, i.creditAccountId = v, i.eligible = !0, i.changes = [
			"Post one source-owned GL journal on the original financial date and relink this bank record to the new journal.",
			"Debit " + _ + " " + o.amount.toFixed(2) + "; credit " + v + " " + o.amount.toFixed(2) + ".",
			"No payment is sent and no other journal is altered. The missing previous journal identity stays in the saved repair plan."
		], {
			public: i,
			draft: y,
			projectedJournal: x
		});
	}
	return a("Existing business and GL effects must use verified closure, or remain blocked if their evidence conflicts.");
}
function Ml(e) {
	return E.require("audit.read"), jl(Sl.parse(e).operationId).public;
}
function Nl(e) {
	let t = E.require("accounting.recover"), n = Cl.parse(e), r = jl(n.operationId).public;
	if (!r.eligible || !r.action) throw Error("Targeted repair blocked: " + r.blockers.join(" "));
	if (r.evidenceDigest !== n.expectedDigest) throw Error("Repair evidence changed. Refresh the preview.");
	let i = crypto.randomUUID();
	O.recordManualReview(n.operationId, n.reference, t.userId, n.summary + " · Proposed " + r.action + " · " + i);
	let a = jl(n.operationId).public;
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
function Pl(e) {
	let n = E.require("accounting.recover"), r = wl.parse(e), i = O.list().find((e) => e.operationId === r.operationId), a = i?.repairProposal;
	if (!i || !a || a.id !== r.proposalId || a.evidenceDigest !== r.expectedDigest) throw Error("Repair proposal changed. Refresh the preview.");
	if (a.status === "EXECUTED") {
		if (a.approver !== n.userId || a.approvalReference !== r.approvalReference) throw Error("Repair was already executed with a different approval.");
		return structuredClone(i);
	}
	if (i.state !== "MANUAL_REVIEW" || a.reviewer === n.userId || i.reviewHistory?.some((e) => e.operator === n.userId)) throw Error("Repair approval requires a different authorized operator.");
	if (i.reviewHistory?.some((e) => e.reference === r.approvalReference)) throw Error("Approval reference must differ from review evidence.");
	let o = jl(r.operationId), s = o.public;
	if (!s.eligible || s.action !== a.action || s.evidenceDigest !== a.evidenceDigest) throw Error("Repair evidence changed or is no longer eligible. Refresh and propose again.");
	let c = () => {
		let e = s.existingJournalId;
		if (s.action === "RESTORE_BANK_RECORD") zn(o.record);
		else if (s.action === "RESTORE_BANK_JOURNAL_LINK") Bn(i.resultId, s.previousJournalId, s.existingJournalId);
		else if (s.action === "REVERSE_BANK_DUPLICATE") E.require("banking.write"), E.require("accounting.post"), e = on(s.duplicateJournalId, s.existingJournalId, i.operationId, "Approved duplicate correction " + a.id + "; " + r.approvalReference).id;
		else if (s.action === "RESTORE_BANK_JOURNAL") {
			E.require("banking.write"), E.require("accounting.post");
			let t = P.post(o.draft);
			e = t.id, Bn(i.resultId, s.previousJournalId, t.id);
		}
		let c = uc();
		if (c.length) throw Error("Post-repair consistency checks failed: " + c.map((e) => e.code).join(", "));
		if (s.action !== "CANCEL_NO_EFFECT") {
			let e = Hn(r.operationId);
			if (e.length) throw Error("Post-repair source proof failed: " + e.join(" "));
		} else if (jl(r.operationId).public.action !== "CANCEL_NO_EFFECT") throw Error("No-effect evidence changed before cancellation.");
		return O.finishRepair(r.operationId, a.id, n.userId, r.approvalReference, Dl(t()), e);
	};
	return s.action === "CANCEL_NO_EFFECT" ? c() : A.transaction(c);
}
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var Fl = /* @__PURE__ */ De(((e) => {
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
	function b() {}
	b.prototype = y.prototype;
	function x(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var S = x.prototype = new b();
	S.constructor = x, _(S, y.prototype), S.isPureReactComponent = !0;
	var ee = Array.isArray;
	function te() {}
	var C = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ne = Object.prototype.hasOwnProperty;
	function re(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function ie(e, t) {
		return re(e.type, t, e.props);
	}
	function ae(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function oe(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var w = /\/+/g;
	function se(e, t) {
		return typeof e == "object" && e && e.key != null ? oe("" + e.key) : t.toString(36);
	}
	function ce(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(te, te) : (e.status = "pending", e.then(function(t) {
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
	function le(e, r, i, a, o) {
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
				case d: return c = e._init, le(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + se(e, 0) : a, ee(o) ? (i = "", c != null && (i = c.replace(w, "$&/") + "/"), le(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ae(o) && (o = ie(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(w, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (ee(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + se(a, u), c += le(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + se(a, u++), c += le(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return le(ce(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ue(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return le(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function T(e) {
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
	var de = typeof reportError == "function" ? reportError : function(e) {
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
	function fe(e) {
		var t = C.T, n = {};
		n.types = t === null ? null : t.types, C.T = n;
		try {
			var r = e(), i = C.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(te, de);
		} catch (e) {
			de(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), C.T = t;
		}
	}
	function pe(e) {
		var t = C.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else fe(pe.bind(null, e));
	}
	var me = {
		map: ue,
		forEach: function(e, t, n) {
			ue(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ue(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ue(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ae(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = me, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = C, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return C.H.useMemoCache(e);
		}
	}, e.addTransitionType = pe, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ne.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return re(e.type, i, r);
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
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ne.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return re(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = ae, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: T
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = fe, e.unstable_useCacheRefresh = function() {
		return C.H.useCacheRefresh();
	}, e.use = function(e) {
		return C.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return C.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return C.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return C.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return C.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return C.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return C.H.useEffectEvent(e);
	}, e.useId = function() {
		return C.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return C.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return C.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return C.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return C.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return C.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return C.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return C.H.useRef(e);
	}, e.useState = function(e) {
		return C.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return C.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return C.H.useTransition();
	}, e.version = "19.3.0";
})), Il = /* @__PURE__ */ De(((e, t) => {
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
			if (typeof e == "function") return e.$$typeof === je ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case pe: return "Fragment";
				case he: return "Profiler";
				case me: return "StrictMode";
				case ye: return "Suspense";
				case be: return "SuspenseList";
				case Ce: return "Activity";
				case we: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case fe: return "Portal";
				case _e: return e.displayName || "Context";
				case ge: return (e._context.displayName || "Context") + ".Consumer";
				case ve:
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
			if (e === pe) return "<>";
			if (typeof e == "object" && e && e.$$typeof === Se) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = D.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (Me.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function g(e, t) {
			function n() {
				Pe || (Pe = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function _() {
			var e = d(this.type);
			return Ie[e] || (Ie[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function v(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: de,
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
		function b(e) {
			x(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === Se && (e._payload.status === "fulfilled" ? x(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function x(e) {
			return typeof e == "object" && !!e && e.$$typeof === de;
		}
		function S(e) {
			var t = {
				"=": "=0",
				":": "=2"
			};
			return "$" + e.replace(/[=:]/g, function(e) {
				return t[e];
			});
		}
		function ee(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), S("" + e.key)) : t.toString(36);
		}
		function te(e) {
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
		function C(e, t, n, i, a) {
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
					case de:
					case fe:
						s = !0;
						break;
					case Se: return s = e._init, C(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + ee(s, 0) : i;
				return Ae(a) ? (n = "", c != null && (n = c.replace(ze, "$&/") + "/"), C(a, t, n, "", function(e) {
					return e;
				})) : a != null && (x(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = y(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(ze, "$&/") + "/") + c), i !== "" && s != null && x(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", Ae(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + ee(i, l), s += C(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (Re || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Re = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + ee(i, l++), s += C(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return C(te(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function ne(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return C(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function re(e) {
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
		function ie() {
			var e = D.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function ae() {
			D.asyncTransitions--;
		}
		function oe(e) {
			var t = D.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), D.T = n;
			try {
				var r = e(), i = D.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (D.asyncTransitions++, r.then(ae, ae), r.then(c, Be));
			} catch (e) {
				Be(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), D.T = t;
			}
		}
		function w(e) {
			var t = D.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else D.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), oe(w.bind(null, e));
		}
		function se(e) {
			if (He === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				He = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				He = function(e) {
					!1 === Ve && (Ve = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return He(e);
		}
		function ce(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function le(e, t) {
			t !== Ue - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Ue = t;
		}
		function ue(e, t, n) {
			var r = D.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					T(r), se(function() {
						return ue(e, t, n);
					});
					return;
				} catch (e) {
					D.thrownErrors.push(e);
				}
				else D.actQueue = null;
			}
			0 < D.thrownErrors.length ? (r = ce(D.thrownErrors), D.thrownErrors.length = 0, n(r)) : t(e);
		}
		function T(e) {
			if (!Ge) {
				Ge = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							D.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (D.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), D.thrownErrors.push(n);
				} finally {
					Ge = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var de = Symbol.for("react.transitional.element"), fe = Symbol.for("react.portal"), pe = Symbol.for("react.fragment"), me = Symbol.for("react.strict_mode"), he = Symbol.for("react.profiler"), ge = Symbol.for("react.consumer"), _e = Symbol.for("react.context"), ve = Symbol.for("react.forward_ref"), ye = Symbol.for("react.suspense"), be = Symbol.for("react.suspense_list"), xe = Symbol.for("react.memo"), Se = Symbol.for("react.lazy"), Ce = Symbol.for("react.activity"), we = Symbol.for("react.view_transition"), Te = Symbol.iterator, Ee = {}, De = {
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
		var E = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (k in E) E.hasOwnProperty(k) && n(k, E[k]);
		o.prototype = a.prototype, E = s.prototype = new o(), E.constructor = s, Oe(E, a.prototype), E.isPureReactComponent = !0;
		var Ae = Array.isArray, je = Symbol.for("react.client.reference"), D = {
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
		}, Me = Object.prototype.hasOwnProperty, Ne = console.createTask ? console.createTask : function() {
			return null;
		};
		E = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Pe, Fe, Ie = {}, O = E.react_stack_bottom_frame.bind(E, m)(), Le = Ne(f(m)), Re = !1, ze = /\/+/g, Be = typeof reportError == "function" ? reportError : function(e) {
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
		}, Ve = !1, He = null, Ue = 0, We = !1, Ge = !1, Ke = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : se;
		E = Object.freeze({
			__proto__: null,
			c: function(e) {
				return ie().useMemoCache(e);
			}
		});
		var k = {
			map: ne,
			forEach: function(e, t, n) {
				ne(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return ne(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return ne(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!x(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = Ce, e.Children = k, e.Component = a, e.Fragment = pe, e.Profiler = he, e.PureComponent = s, e.StrictMode = me, e.Suspense = ye, e.ViewTransition = we, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = D, e.__COMPILER_RUNTIME = E, e.act = function(e) {
			var t = D.actQueue, n = Ue;
			Ue++;
			var r = D.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				D.thrownErrors.push(e);
			}
			if (0 < D.thrownErrors.length) throw le(t, n), e = ce(D.thrownErrors), D.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return Ke(function() {
					i || We || (We = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (le(t, n), n === 0) {
							try {
								T(r), se(function() {
									return ue(i, e, a);
								});
							} catch (e) {
								D.thrownErrors.push(e);
							}
							if (0 < D.thrownErrors.length) {
								var o = ce(D.thrownErrors);
								D.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						le(t, n), 0 < D.thrownErrors.length ? (e = ce(D.thrownErrors), D.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (le(t, n), n === 0 && (T(r), r.length !== 0 && Ke(function() {
				i || We || (We = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), D.actQueue = null), 0 < D.thrownErrors.length) throw e = ce(D.thrownErrors), D.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (D.actQueue = r, se(function() {
					return ue(s, e, t);
				})) : e(s);
			} };
		}, e.addTransitionType = w, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = D.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = Oe({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (Me.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !Me.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = v(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) b(arguments[i]);
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
			for (var r = 2; r < arguments.length; r++) b(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in Fe || !("__self" in t) || "key" in t || (Fe = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) Me.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && g(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > D.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = O, v(e, a, r, p(), o, i ? Ne(f(e)) : Le);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === xe ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
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
		}, e.isValidElement = x, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: Se,
				_payload: e,
				_init: re
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
		}, e.startTransition = oe, e.unstable_useCacheRefresh = function() {
			return ie().useCacheRefresh();
		}, e.use = function(e) {
			return ie().use(e);
		}, e.useActionState = function(e, t, n) {
			return ie().useActionState(e, t, n);
		}, e.useCallback = function(e, t) {
			return ie().useCallback(e, t);
		}, e.useContext = function(e) {
			var t = ie();
			return e.$$typeof === ge && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
		}, e.useDebugValue = function(e, t) {
			return ie().useDebugValue(e, t);
		}, e.useDeferredValue = function(e, t) {
			return ie().useDeferredValue(e, t);
		}, e.useEffect = function(e, t) {
			return e ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"), ie().useEffect(e, t);
		}, e.useEffectEvent = function(e) {
			return ie().useEffectEvent(e);
		}, e.useId = function() {
			return ie().useId();
		}, e.useImperativeHandle = function(e, t, n) {
			return ie().useImperativeHandle(e, t, n);
		}, e.useInsertionEffect = function(e, t) {
			return e ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"), ie().useInsertionEffect(e, t);
		}, e.useLayoutEffect = function(e, t) {
			return e ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"), ie().useLayoutEffect(e, t);
		}, e.useMemo = function(e, t) {
			return ie().useMemo(e, t);
		}, e.useOptimistic = function(e, t) {
			return ie().useOptimistic(e, t);
		}, e.useReducer = function(e, t, n) {
			return ie().useReducer(e, t, n);
		}, e.useRef = function(e) {
			return ie().useRef(e);
		}, e.useState = function(e) {
			return ie().useState(e);
		}, e.useSyncExternalStore = function(e, t, n) {
			return ie().useSyncExternalStore(e, t, n);
		}, e.useTransition = function() {
			return ie().useTransition();
		}, e.version = "19.3.0", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
}));
(/* @__PURE__ */ De(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? Fl() : Il();
})))();
var Ll = e().min(1).max(200), Rl = e().max(2e4), zl = y().finite().nonnegative(), Bl = ["PURCHASE_ORDER", "REMITTANCE"], Vl = x({
	operationId: Ll,
	kind: o(Bl),
	sourceId: Ll,
	expectedRevision: e().min(1).max(5e5),
	templateId: Ll.optional()
}).strict(), Hl = x({
	id: Ll,
	description: Rl,
	reference: Rl,
	quantity: y().finite().positive(),
	unit: Rl,
	unitPrice: zl,
	net: zl,
	tax: zl,
	total: zl,
	taxCode: Rl.optional(),
	taxRate: y().finite().min(0).max(1).optional()
}).strict(), Ul = x({
	id: Ll,
	revision: Ll,
	name: Rl,
	subject: Rl,
	body: Rl,
	footer: Rl,
	paper: o(["A4", "Letter"])
}).strict(), Wl = x({
	id: Ll,
	operationId: Ll,
	requestFingerprint: e().max(1e6),
	kind: o(Bl),
	sourceId: Ll,
	sourceRevision: e().min(1).max(5e5),
	preparedAt: Ll,
	preparedBy: Ll,
	documentNumber: Ll,
	status: Ll,
	date: Ll,
	expectedDeliveryDate: Rl.optional(),
	reference: Rl.optional(),
	notes: Rl.optional(),
	supplierId: Ll,
	supplierName: Rl,
	supplierCode: Rl,
	supplierEmail: Rl.optional(),
	supplierContact: Rl.optional(),
	supplierAddress: Rl,
	supplierMetadataAt: Ll,
	issuer: x({
		name: Rl,
		identifier: Rl,
		address: Rl,
		email: Rl,
		currency: Ll
	}).strict(),
	method: Rl.optional(),
	noncash: he(),
	lines: u(Hl).min(1),
	subtotal: zl,
	tax: zl,
	total: zl,
	template: Ul,
	subject: Rl,
	body: Rl
}).strict(), Gl = (e) => e === "PURCHASE_ORDER" ? "Purchase order" : "Remittance";
function Kl(e, t) {
	let n = e === "PURCHASE_ORDER" ? oo.getById(t) : Rs.getById(t);
	if (!n) throw Error("Purchase output source was not found.");
	return n;
}
function ql(e, t) {
	let n = Kl(e, t), r = qa.getById(n.supplierId);
	if (!r) throw Error("Source supplier was not found.");
	return JSON.stringify([n, r]);
}
var Jl = (e, t) => _(e, "accounting.read") || t === "PURCHASE_ORDER" && _(e, "purchases.write"), Yl = [], Xl = 0, Zl = /* @__PURE__ */ new Set(), Ql = () => {
	Xl++, Zl.forEach((e) => e());
};
function $l() {
	return (S.templates ?? []).filter((e) => e.status === "Active" && ["Purchase order", "Remittance"].includes(e.kind));
}
function eu(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Object.hasOwn(t, n)) throw Error("Unsupported purchase template token: " + n);
		return t[n];
	});
}
function tu(e) {
	let t = Wl.parse(e), n = Vl.parse(JSON.parse(t.requestFingerprint));
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
i("preparedPurchaseOutputs", {
	repository: { prepare(e) {
		let t = Vl.parse(e), n = E.require("purchases.read");
		if (!Jl(n, t.kind) || t.kind === "REMITTANCE" && !_(n, "accounting.post") || t.kind === "PURCHASE_ORDER" && !_(n, "accounting.post") && !_(n, "purchases.write")) throw Error("Permission denied: purchase document preparation.");
		let r = JSON.stringify(t), i = Yl.find((e) => e.operationId === t.operationId);
		if (i) {
			if (i.requestFingerprint !== r) throw Error("Operation ID was used for different output data.");
			return i;
		}
		let a = Kl(t.kind, t.sourceId), o = qa.getById(a.supplierId);
		if (ql(t.kind, t.sourceId) !== t.expectedRevision) throw Error("Source or supplier changed. Refresh before preparing output.");
		let s = w(), c = t.templateId ? $l().find((e) => e.id === t.templateId && e.kind === Gl(t.kind)) : void 0;
		if (t.templateId && !c) throw Error("Select an active matching purchase template.");
		let l = t.kind === "PURCHASE_ORDER" ? oo.getById(t.sourceId) : void 0, u = t.kind === "REMITTANCE" ? Rs.getById(t.sourceId) : void 0, d = l ? l.lines.map((e) => ({
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
		})) : u.allocations.map((e) => ({
			id: e.id,
			description: e.billNumber,
			reference: e.supplierInvoiceNumber,
			quantity: 1,
			unit: "allocation",
			unitPrice: e.amount,
			net: e.amount,
			tax: 0,
			total: e.amount
		})), f = l?.totals.total ?? u.amount, p = {
			documentNumber: l?.purchaseOrderNumber ?? u.paymentNumber,
			supplierName: a.supplierName,
			companyName: s.companyName,
			currency: s.currency,
			total: f.toFixed(2),
			documentDate: l?.orderDate ?? u.paymentDate,
			expectedDeliveryDate: l?.expectedDeliveryDate ?? "",
			reference: l?.supplierReference ?? u?.reference ?? ""
		}, m = {
			id: c?.id ?? "built-in",
			revision: c?.revision ?? "1",
			name: c?.name ?? "Standard " + Gl(t.kind),
			subject: c?.subject ?? "{{documentNumber}} · {{companyName}}",
			body: c?.body ?? "Dear {{supplierName}},\nPlease review {{documentNumber}} for {{currency}} {{total}}.",
			footer: c?.footer ?? "",
			paper: c?.paper === "Letter" ? "Letter" : "A4"
		}, h = {
			id: crypto.randomUUID(),
			operationId: t.operationId,
			requestFingerprint: r,
			kind: t.kind,
			sourceId: t.sourceId,
			sourceRevision: t.expectedRevision,
			preparedAt: (/* @__PURE__ */ new Date()).toISOString(),
			preparedBy: n.userId,
			documentNumber: p.documentNumber,
			status: a.status,
			date: p.documentDate,
			expectedDeliveryDate: l?.expectedDeliveryDate,
			reference: p.reference,
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
			method: u?.method,
			noncash: !!u?.prepaymentApplicationId,
			lines: d,
			subtotal: l?.totals.subtotal ?? f,
			tax: l?.totals.taxAmount ?? 0,
			total: f,
			template: {
				...m,
				footer: eu(m.footer, p)
			},
			subject: eu(m.subject, p),
			body: eu(m.body, p)
		};
		return tu(h), Yl = [h, ...Yl], Ql(), h;
	} },
	read: "purchases.read",
	commands: { prepare: "purchases.read" },
	snapshot: () => ({
		artifacts: Yl,
		templates: $l().map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	restore: (e) => {
		Yl = e.artifacts, e.templates;
	},
	publish: Ql,
	view: (e) => ({
		artifacts: Yl.filter((t) => Jl(e, t.kind)),
		templates: $l().filter((t) => Jl(e, t.kind === "Purchase order" ? "PURCHASE_ORDER" : "REMITTANCE")).map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	validate: (e, t) => {
		let n = x({
			artifacts: u(Wl),
			templates: u(x({
				id: Ll,
				name: Rl,
				kind: Ll
			}).strict())
		}).strict().parse(e).artifacts, r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = t;
		for (let e of n) {
			if (tu(e), i.has(e.id) || r.has(e.operationId)) throw Error("Duplicate purchase output.");
			i.add(e.id), r.add(e.operationId);
			let t = (e.kind === "PURCHASE_ORDER" ? a.purchaseOrders.purchaseOrders : a.supplierPayments.supplierPayments).find((t) => t.id === e.sourceId);
			if (!t || t.supplierId !== e.supplierId) throw Error("Invalid purchase output source reference.");
		}
	}
});
//#endregion
//#region src/features/sales/data/recoveryWorkbench.ts
var nu = [
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
];
function ru() {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let e = g("business.command", {
			repository: "salesRecovery",
			method: "inspectRecovery",
			args: []
		});
		return Se(e.view), e.result;
	}
	let e = E.require("audit.read"), t = O.list(), n = R.getAll(), r = {
		quotes: n.filter((e) => e.type === "QUOTE"),
		salesOrders: n.filter((e) => e.type === "SALES_ORDER"),
		invoices: n.filter((e) => e.type === "INVOICE"),
		payments: na.getAll(),
		creditNotes: L.getAll(),
		allocations: L.getAllAllocations(),
		journals: P.getAll()
	}, i = uc(), a = t.filter((e) => e.state !== "COMPLETED" || e.reviewHistory?.length).map((n) => {
		let a = nu.includes(n.kind) || Vn(n.kind) || n.kind === "BANK_RECONCILIATION", o = [], s = (e, t) => {
			o.some((e) => e.path === t) || o.push({
				label: e,
				path: t
			});
		};
		if (n.kind === "BANK_RECONCILIATION") {
			let e = Cn.getAll().find((e) => e.id === n.resultId);
			s("Bank reconciliation records", e ? "/banking/accounts/" + encodeURIComponent(e.bankAccountId) : "/banking");
		}
		if (Vn(n.kind)) {
			let e = (n.kind === "BANK_TRANSACTION" ? In.getTransactions() : In.getTransfers()).find((e) => e.id === n.resultId);
			e && (s("Bank business records", "/banking"), s("Bank journal", "/accounting/journals/" + encodeURIComponent(e.journalEntryId)));
		}
		let c = r.payments.find((e) => e.id === n.resultId), l = r.allocations.find((e) => e.id === n.resultId);
		n.kind === "SALES_INVOICE_VOID" && n.resultId && r.invoices.some((e) => e.id === n.resultId) && s("Invoice", "/sales/invoices/" + encodeURIComponent(n.resultId)), c && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(n.kind) && (s("Invoice and payment", "/sales/invoices/" + encodeURIComponent(c.invoiceId)), c.depositId && s("Deposit owner", "/sales/customer-deposits/" + encodeURIComponent(c.depositId))), l && ["SALES_CREDIT_APPLY", "SALES_CREDIT_REVERSAL"].includes(n.kind) && (s("Invoice", "/sales/invoices/" + encodeURIComponent(l.invoiceId)), s("Credit note", "/sales/credit-notes/" + encodeURIComponent(l.creditNoteId)));
		let u = n.kind === "SALES_INVOICE_VOID" ? [{
			type: "CUSTOMER_INVOICE",
			id: n.resultId
		}] : c && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(n.kind) ? [{
			type: "CUSTOMER_PAYMENT",
			id: c.id
		}, {
			type: "CUSTOMER_INVOICE",
			id: c.invoiceId
		}] : l && ["SALES_CREDIT_APPLY", "SALES_CREDIT_REVERSAL"].includes(n.kind) ? [{
			type: "CUSTOMER_INVOICE",
			id: l.invoiceId
		}, {
			type: "CREDIT_NOTE",
			id: l.creditNoteId
		}] : [];
		for (let e of r.journals.filter((e) => u.some((t) => t.type === e.sourceType && t.id === e.sourceId) && !e.reversedJournalEntryId)) s("Original journal " + e.journalNumber, "/accounting/journals/" + encodeURIComponent(e.id)), e.reversalJournalEntryId && r.journals.some((t) => t.id === e.reversalJournalEntryId) && s("Reversal journal", "/accounting/journals/" + encodeURIComponent(e.reversalJournalEntryId));
		let d = n.state === "COMPLETED" ? [] : a ? n.kind === "BANK_RECONCILIATION" ? Tn(n.operationId) : Vn(n.kind) ? Hn(n.operationId) : vc(r, t, n.operationId) : ["This operation kind has no verified closure procedure. It remains blocked; do not replay it."];
		return n.state !== "COMPLETED" && a && (n.kind !== "BANK_RECONCILIATION" && !Vn(n.kind) && d.push(...bc(n.operationId)), i.length && d.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), n.reviewHistory?.some((t) => t.operator.trim().toLowerCase() === e.userId.toLowerCase()) && d.push("A different authorized operator must approve; this account recorded review evidence."), _(e, "accounting.recover") || d.push("Your role can inspect but cannot approve recovery.")), {
			...structuredClone(n),
			supported: a,
			revision: gc(n),
			closureReasons: d,
			canApprove: a && n.state === "MANUAL_REVIEW" && d.length === 0,
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
var iu = (e) => Math.round((e + 2 ** -52) * 100) / 100, au = e().trim().min(1).max(200), ou = y().finite().positive().refine((e) => iu(e) === e, "Use cents precision"), su = x({
	operationId: au,
	customerId: au,
	paymentDate: au,
	bankAccountId: au,
	reference: e().max(500).optional(),
	allocations: u(x({
		invoiceId: au,
		amount: ou
	}).strict()).min(1).max(500)
}).strict(), cu = x({
	operationId: au,
	creditId: au,
	paymentDate: au,
	bankAccountId: au,
	amount: ou,
	reference: e().max(500).optional()
}).strict(), lu = [], uu = [], du = [], fu = 0, pu = /* @__PURE__ */ new Set(), mu = () => {
	fu++, pu.forEach((e) => e());
};
function hu(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function gu(e, t) {
	T(t, "Payment date");
	let n = F.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = N.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function _u(e) {
	if (Cn.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function vu(e, t) {
	let n = e === "customer" ? L.getById(t) : H.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function yu(e, t, n) {
	let r = vu(e, t), i = iu(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = iu(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? L.update(o) : H.update(o);
}
function bu(e, t) {
	j();
	let n = cu.parse(t), { old: r, fingerprint: i } = hu(e === "customer" ? uu : du, n.operationId, n);
	if (r) return r;
	let a = vu(e, n.creditId), o = gu(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = N.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = P.post({
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
	return yu(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? uu = [...uu, u] : du = [...du, u], mu(), u;
}
function xu(e, t) {
	if (j(), T(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? uu : du, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	_u(r.journalEntryId), P.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = vu(e, r.creditId);
	yu(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? uu = n.map((e) => e.id === r.id ? a : e) : du = n.map((e) => e.id === r.id ? a : e), mu(), a;
}
var Su = {
	recordReceipt(e) {
		let t = su.parse(e), { old: n, fingerprint: r } = hu(lu, t.operationId, t);
		if (n) return n;
		if (gu(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
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
			amount: iu(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return lu = [...lu, a], mu(), a;
	},
	reverseReceipt(e) {
		let t = lu.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = na.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of P.getBySource("CUSTOMER_PAYMENT", e)) _u(t.id);
		}
		for (let n of t.paymentIds) R.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return lu = lu.map((e) => e.id === t.id ? n : e), mu(), n;
	},
	createRefund: (e) => bu("customer", e),
	reverseRefund: (e) => xu("customer", e)
}, Cu = {
	create: (e) => bu("supplier", e),
	reverse: (e) => xu("supplier", e),
	repairLegacyCredits(e) {
		if (j(), T(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of H.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || P.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = P.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = N.requireBySystemRole("INVENTORY"), a = N.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = iu(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(P.post({
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
}, wu = x({
	id: au,
	operationId: au,
	fingerprint: au,
	creditId: au,
	contactId: au,
	paymentDate: au,
	bankAccountId: au,
	amount: ou,
	journalEntryId: au,
	status: o(["POSTED", "REVERSED"]),
	reference: e().optional(),
	reversalDate: e().optional()
}).strict();
i("customerSettlements", {
	repository: Su,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: lu,
		refunds: uu
	}),
	restore: (e) => {
		lu = e.receipts, uu = e.refunds;
	},
	validate: (t, n) => {
		Tu(t, n, !1);
		let r = t;
		u(wu.extend({ fingerprint: e() })).parse(r.refunds), u(x({
			id: au,
			operationId: au,
			paymentIds: u(au),
			amount: ou,
			status: o(["POSTED", "REVERSED"])
		}).passthrough()).parse(r.receipts);
	},
	publish: mu
}), i("supplierRefunds", {
	repository: Cu,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: du }),
	restore: (e) => {
		du = e.refunds;
	},
	validate: (t, n) => {
		Tu(t, n, !0), u(wu.extend({ fingerprint: e() })).parse(t.refunds);
	},
	publish: mu
});
function Tu(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = iu(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || iu(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/supplier-prepayments/supplierPrepaymentRepository.ts
var Eu = (e) => Math.round((e + 2 ** -52) * 100) / 100, Du = e().trim().min(1).max(200), Ou = Du.refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}), ku = y().finite().positive().refine((e) => Eu(e) === e), Au = e().trim().min(3).max(2e3), ju = e().trim().max(500).default(""), Mu = x({
	operationId: Du,
	supplierId: Du,
	date: Ou,
	bankAccountId: Du,
	amount: ku,
	reference: ju,
	reason: Au
}).strict(), Nu = x({
	operationId: Du,
	prepaymentId: Du,
	supplierBillId: Du,
	date: Ou,
	amount: ku,
	reference: ju,
	reason: Au
}).strict(), Pu = x({
	operationId: Du,
	prepaymentId: Du,
	bankAccountId: Du,
	date: Ou,
	amount: ku,
	reference: ju,
	reason: Au
}).strict(), Fu = {
	id: Du,
	fingerprint: e(),
	journalId: Du,
	status: o(["POSTED", "REVERSED"]),
	createdBy: Du,
	createdAt: Du,
	reversalDate: Ou.optional(),
	reversalReason: Au.optional(),
	reversedBy: Du.optional()
}, Iu = Mu.extend({
	...Fu,
	assetAccountId: Du
}).strict(), Lu = Nu.extend({
	...Fu,
	paymentId: Du
}).strict(), Ru = Pu.extend(Fu).strict(), zu = x({
	prepayments: u(Iu),
	applications: u(Lu),
	refunds: u(Ru),
	settings: u(x({
		id: Du,
		assetAccountId: Du
	}).strict()).max(1)
}).strict(), Bu = {
	prepayments: [],
	applications: [],
	refunds: [],
	settings: []
}, Vu = 0, Hu = /* @__PURE__ */ new Set(), Uu = () => {
	Vu++, Hu.forEach((e) => e());
};
function Wu(e) {
	let t = Bu.prepayments.find((t) => t.id === e);
	if (!t) throw Error("Supplier prepayment not found.");
	return t;
}
function Gu(e) {
	let t = Wu(e);
	return t.status === "REVERSED" ? 0 : Eu(t.amount - Bu.applications.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - Bu.refunds.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function Ku(e, t) {
	let n = e.prepayments.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, Eu((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.prepaymentId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Prepayment event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = Eu(a + e), a < 0) throw Error("Prepayment would be overdrawn on a historical date.");
}
function qu(e) {
	let t = JSON.stringify(e), n = [
		...Bu.prepayments,
		...Bu.applications,
		...Bu.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different prepayment data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function Ju(e) {
	let t = N.requireById(e);
	if (!t.active || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active prepayment asset account.");
	return t;
}
function Yu(e, t) {
	let n = F.requireById(e), r = N.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function Xu(e) {
	T(e), Rt(e), j();
}
function Zu(e, t, n = crypto.randomUUID()) {
	return {
		id: n,
		fingerprint: e,
		journalId: t,
		status: "POSTED",
		createdBy: E.require("purchases.payment").userId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
i("supplierPrepayments", {
	repository: {
		setupDefaults() {
			if (E.require("accounting.post"), Bu.settings[0]) return Bu.settings[0];
			let e = 1390;
			for (; N.getAll().some((t) => t.code === String(e));) e++;
			let t = N.create({
				code: String(e),
				name: "Supplier prepayments paid",
				type: "ASSET",
				active: !0,
				allowManualPosting: !1
			}), n = {
				id: crypto.randomUUID(),
				assetAccountId: t.id
			};
			return Bu.settings = [n], Uu(), n;
		},
		balance(e) {
			return E.require("purchases.read"), Gu(e);
		},
		pay(e) {
			E.require("purchases.payment");
			let t = Mu.parse(e), { prior: n, fingerprint: r } = qu(t);
			if (n) return n;
			Xu(t.date);
			let i = qa.getById(t.supplierId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active supplier.");
			let a = Bu.settings[0];
			if (!a) throw Error("Configure the prepayment asset account first.");
			Ju(a.assetAccountId);
			let o = Yu(t.bankAccountId, t.date), s = crypto.randomUUID(), c = P.post({
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
				...Zu(r, c.id, s),
				assetAccountId: a.assetAccountId
			};
			return Bu.prepayments = [...Bu.prepayments, l], Uu(), l;
		},
		apply(e) {
			E.require("purchases.payment");
			let t = Nu.parse(e), { prior: n, fingerprint: r } = qu(t);
			if (n) return n;
			Xu(t.date);
			let i = Wu(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Gu(i.id)) throw Error("Prepayment date or available balance is insufficient.");
			Ju(i.assetAccountId);
			let a = js.getById(t.supplierBillId);
			if (!a || a.supplierId !== i.supplierId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.billDate) throw Error("Choose an issued bill for the same supplier.");
			if (t.amount > a.totals.amountDue) throw Error("Prepayment application exceeds bill amount due.");
			let o = crypto.randomUUID(), s = "prepayment-payment:" + o;
			Rs.recordPrepaymentSettlement({
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
			let c = P.post({
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
					accountId: N.requireBySystemRole("ACCOUNTS_PAYABLE").id,
					debit: t.amount,
					credit: 0
				}]
			}), l = {
				...t,
				...Zu(r, c.id, o),
				paymentId: s
			};
			return Bu.applications = [...Bu.applications, l], Ku(Bu, i.id), Uu(), l;
		},
		refund(e) {
			E.require("purchases.payment");
			let t = Pu.parse(e), { prior: n, fingerprint: r } = qu(t);
			if (n) return n;
			Xu(t.date);
			let i = Wu(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Gu(i.id)) throw Error("Refund exceeds the available prepayment.");
			Ju(i.assetAccountId);
			let a = Yu(t.bankAccountId, t.date), o = crypto.randomUUID(), s = P.post({
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
				...Zu(r, s.id, o)
			};
			return Bu.refunds = [...Bu.refunds, c], Ku(Bu, i.id), Uu(), c;
		},
		reverse(e) {
			let t = E.require("purchases.payment"), n = x({
				entity: o([
					"prepayments",
					"applications",
					"refunds"
				]),
				id: Du,
				reversalDate: Ou,
				reason: Au
			}).strict().parse(e), r = Bu[n.entity].find((e) => e.id === n.id);
			if (!r) throw Error("Prepayment record not found.");
			if (r.status === "REVERSED") return r;
			if (Xu(n.reversalDate), n.reversalDate < r.date) throw Error("Prepayment reversal cannot precede its original date.");
			let i = n.entity === "prepayments" ? r.id : r.prepaymentId;
			if (n.entity === "prepayments" && [...Bu.applications, ...Bu.refunds].some((e) => e.prepaymentId === r.id && e.status === "POSTED")) throw Error("Reverse prepayment applications and refunds before reversing its receipt.");
			_u(r.journalId), P.reverse({
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
			if (Bu[n.entity] = Bu[n.entity].map((e) => e.id === n.id ? a : e), n.entity === "applications") {
				let e = r;
				Rs.reversePrepaymentSettlement(e.paymentId, n.reversalDate, n.reason);
			}
			return Ku(Bu, i), Uu(), a;
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
	snapshot: () => Bu,
	restore: (e) => {
		Bu = e;
	},
	publish: Uu,
	validate: (e, t) => {
		let n = zu.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.assetAccountId);
			if (!t || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Invalid prepayment asset mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, Eu((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"prepayments",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "prepayments" ? Mu : e === "applications" ? Nu : Pu).parse(JSON.parse(t.fingerprint));
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
		for (let e of n.prepayments) if (Ku(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.prepaymentId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed prepayment has later consumption.");
		for (let e of r.supplierPayments.supplierPayments) if (e.prepaymentApplicationId && !n.applications.some((t) => t.id === e.prepaymentApplicationId && t.paymentId === e.id && t.prepaymentId === e.prepaymentId)) throw Error("Orphan prepayment settlement payment.");
	}
});
//#endregion
//#region src/features/customer-deposits/customerDepositRepository.ts
var Qu = (e) => Math.round((e + 2 ** -52) * 100) / 100, $u = e().trim().min(1).max(200), ed = $u.refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}), td = y().finite().positive().refine((e) => Qu(e) === e), nd = e().trim().min(3).max(2e3), rd = e().trim().max(500).default(""), id = x({
	operationId: $u,
	customerId: $u,
	date: ed,
	bankAccountId: $u,
	amount: td,
	reference: rd,
	reason: nd
}).strict(), ad = x({
	operationId: $u,
	depositId: $u,
	invoiceId: $u,
	date: ed,
	amount: td,
	reference: rd,
	reason: nd
}).strict(), od = x({
	operationId: $u,
	depositId: $u,
	bankAccountId: $u,
	date: ed,
	amount: td,
	reference: rd,
	reason: nd
}).strict(), sd = {
	id: $u,
	fingerprint: e(),
	journalId: $u,
	status: o(["POSTED", "REVERSED"]),
	createdBy: $u,
	createdAt: $u,
	reversalDate: ed.optional(),
	reversalReason: nd.optional(),
	reversedBy: $u.optional()
}, cd = id.extend({
	...sd,
	liabilityAccountId: $u
}).strict(), ld = ad.extend({
	...sd,
	paymentId: $u
}).strict(), ud = od.extend(sd).strict(), dd = x({
	deposits: u(cd),
	applications: u(ld),
	refunds: u(ud),
	settings: u(x({
		id: $u,
		liabilityAccountId: $u
	}).strict()).max(1)
}).strict(), fd = {
	deposits: [],
	applications: [],
	refunds: [],
	settings: []
}, pd = 0, md = /* @__PURE__ */ new Set(), hd = () => {
	pd++, md.forEach((e) => e());
};
function gd(e) {
	let t = fd.deposits.find((t) => t.id === e);
	if (!t) throw Error("Customer deposit not found.");
	return t;
}
function _d(e) {
	let t = gd(e);
	return t.status === "REVERSED" ? 0 : Qu(t.amount - fd.applications.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - fd.refunds.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function vd(e, t) {
	let n = e.deposits.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, Qu((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.depositId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Deposit event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = Qu(a + e), a < 0) throw Error("Deposit would be overdrawn on a historical date.");
}
function yd(e) {
	let t = JSON.stringify(e), n = [
		...fd.deposits,
		...fd.applications,
		...fd.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different deposit data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function bd(e) {
	let t = N.requireById(e);
	if (!t.active || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active deposit liability account.");
	return t;
}
function xd(e, t) {
	let n = F.requireById(e), r = N.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function Sd(e) {
	T(e), Rt(e), j();
}
function Cd(e, t, n = crypto.randomUUID()) {
	return {
		id: n,
		fingerprint: e,
		journalId: t,
		status: "POSTED",
		createdBy: E.require("sales.payment").userId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
i("customerDeposits", {
	repository: {
		setupDefaults() {
			if (E.require("accounting.post"), fd.settings[0]) return fd.settings[0];
			let e = 2290;
			for (; N.getAll().some((t) => t.code === String(e));) e++;
			let t = N.create({
				code: String(e),
				name: "Customer deposits held",
				type: "LIABILITY",
				active: !0,
				allowManualPosting: !1
			}), n = {
				id: crypto.randomUUID(),
				liabilityAccountId: t.id
			};
			return fd.settings = [n], hd(), n;
		},
		balance(e) {
			return E.require("sales.read"), _d(e);
		},
		receive(e) {
			E.require("sales.payment");
			let t = id.parse(e), { prior: n, fingerprint: r } = yd(t);
			if (n) return n;
			Sd(t.date);
			let i = I.getById(t.customerId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active customer.");
			let a = fd.settings[0];
			if (!a) throw Error("Configure the deposit liability account first.");
			bd(a.liabilityAccountId);
			let o = xd(t.bankAccountId, t.date), s = crypto.randomUUID(), c = P.post({
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
				...Cd(r, c.id, s),
				liabilityAccountId: a.liabilityAccountId
			};
			return fd.deposits = [...fd.deposits, l], hd(), l;
		},
		apply(e) {
			E.require("sales.payment");
			let t = ad.parse(e), { prior: n, fingerprint: r } = yd(t);
			if (n) return n;
			Sd(t.date);
			let i = gd(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > _d(i.id)) throw Error("Deposit date or available balance is insufficient.");
			bd(i.liabilityAccountId);
			let a = R.getAll().find((e) => e.id === t.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || a.customerId !== i.customerId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.documentDate) throw Error("Choose an issued invoice for the same customer.");
			let o = R.recalculateInvoiceBalance(a.id);
			if (t.amount > o.amountDue) throw Error("Deposit application exceeds invoice amount due.");
			let s = crypto.randomUUID(), c = "deposit-payment:" + s;
			na.recordDepositSettlement({
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
			let l = P.post({
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
					accountId: N.requireBySystemRole("ACCOUNTS_RECEIVABLE").id,
					debit: 0,
					credit: t.amount
				}]
			}), u = {
				...t,
				...Cd(r, l.id, s),
				paymentId: c
			};
			return fd.applications = [...fd.applications, u], vd(fd, i.id), R.recalculateInvoiceBalance(a.id), hd(), u;
		},
		refund(e) {
			E.require("sales.payment");
			let t = od.parse(e), { prior: n, fingerprint: r } = yd(t);
			if (n) return n;
			Sd(t.date);
			let i = gd(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > _d(i.id)) throw Error("Refund exceeds the available deposit.");
			bd(i.liabilityAccountId);
			let a = xd(t.bankAccountId, t.date), o = crypto.randomUUID(), s = P.post({
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
				...Cd(r, s.id, o)
			};
			return fd.refunds = [...fd.refunds, c], vd(fd, i.id), hd(), c;
		},
		reverse(e) {
			let t = E.require("sales.payment"), n = x({
				entity: o([
					"deposits",
					"applications",
					"refunds"
				]),
				id: $u,
				reversalDate: ed,
				reason: nd
			}).strict().parse(e), r = fd[n.entity].find((e) => e.id === n.id);
			if (!r) throw Error("Deposit record not found.");
			if (r.status === "REVERSED") return r;
			if (Sd(n.reversalDate), n.reversalDate < r.date) throw Error("Deposit reversal cannot precede its original date.");
			let i = n.entity === "deposits" ? r.id : r.depositId;
			if (n.entity === "deposits" && [...fd.applications, ...fd.refunds].some((e) => e.depositId === r.id && e.status === "POSTED")) throw Error("Reverse deposit applications and refunds before reversing its receipt.");
			_u(r.journalId), P.reverse({
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
			if (fd[n.entity] = fd[n.entity].map((e) => e.id === n.id ? a : e), n.entity === "applications") {
				let e = r;
				na.reverseDepositSettlement(e.paymentId, n.reversalDate, n.reason), R.recalculateInvoiceBalance(e.invoiceId);
			}
			return vd(fd, i), hd(), a;
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
	snapshot: () => fd,
	restore: (e) => {
		fd = e;
	},
	publish: hd,
	validate: (e, t) => {
		let n = dd.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.liabilityAccountId);
			if (!t || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Invalid deposit liability mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, Qu((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"deposits",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "deposits" ? id : e === "applications" ? ad : od).parse(JSON.parse(t.fingerprint));
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
		for (let e of n.deposits) if (vd(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.depositId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed deposit has later consumption.");
		for (let e of r.customerPayments.payments) if (e.depositApplicationId && !n.applications.some((t) => t.id === e.depositApplicationId && t.paymentId === e.id && t.depositId === e.depositId)) throw Error("Orphan deposit settlement payment.");
	}
});
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function wd(e) {
	return N.requireBySystemRole(e).id;
}
function Td(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ed(e) {
	return P.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function Dd(e) {
	let t = zo.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Od = {
	postSalesFulfilment(e) {
		let t = Ed(e.id);
		if (t) return t;
		let n = Td(Dd(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return P.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: wd("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: wd("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = Ed(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? P.getById(r.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, kd = /* @__PURE__ */ new Set(), Ad = [], jd = Ad;
function Md() {
	jd = Ad, kd.forEach((e) => e());
}
function Nd() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Ad.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Pd(e, t) {
	return z(Ad.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function Fd(e) {
	let t = R.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(Pr).map((e) => Pd(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(Pr).every((e, t) => n[t] >= z(e.quantity));
	R.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function Id(e) {
	let t = zo.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Ld = {
	subscribe(e) {
		return kd.add(e), () => {
			kd.delete(e);
		};
	},
	getSnapshot() {
		return jd;
	},
	getAll() {
		return jd;
	},
	getById(e) {
		return Ad.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return Ad.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: Pd,
	getRemainingQuantity(e, t) {
		let n = R.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return Pr(r) ? z(r.quantity - Pd(e, t)) : 0;
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
		let r = wo.getById(e.siteId);
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
			if (!Pr(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = Lr(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = Rr(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = z(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = Pd(n.id, t.id);
			if (s > z(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = z(s * o.conversionToBase), u = is.getBalance(r.id, t.productId);
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
			let n = is.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = Lr(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = Nd(), d = o.map((e) => ({
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
			let i = Lr(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = ko.create({
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
			Qo({
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
			}), is.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return Od.postSalesFulfilment(f), Ad = [f, ...Ad], Md(), Fd(n.id), f;
	},
	void(e) {
		if (t().physicalCustomerReturns?.returns.some((t) => t.status === "POSTED" && t.lines.some((t) => t.fulfilmentId === e.fulfilmentId))) throw Error("Reverse physical customer returns before voiding this dispatch.");
		let n = Ad.find((t) => t.id === e.fulfilmentId);
		if (!n) throw Error("Sales fulfilment was not found.");
		if (n.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < n.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let i = R.getById(n.salesOrderId);
		if (!i || i.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (i.status === "INVOICED" && i.invoiceIds.some((e) => {
			let t = R.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (i.status !== "CONFIRMED" && i.status !== "PARTIALLY_FULFILLED" && i.status !== "FULFILLED" && i.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${i.status}.`);
		let a = Id(n), o = /* @__PURE__ */ new Set(), s = n.lines.map((e) => {
			let t = Lr(e.productId);
			if (!t) throw Error(`Product ${e.sku} was not found.`);
			let r = a.find((t) => !o.has(t.id) && t.siteId === n.siteId && t.productId === e.productId && Math.abs(t.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return o.add(r.id), {
				line: e,
				product: t,
				originalIssue: r
			};
		});
		Od.reverseSalesFulfilment({
			fulfilment: n,
			reversalDate: e.voidDate,
			reason: r
		});
		for (let t of s) {
			let { line: i, product: a, originalIssue: o } = t, s = ko.create({
				movementType: "RETURN_IN",
				siteId: n.siteId,
				productId: i.productId,
				baseUnitId: a.baseUnitId,
				quantityBase: i.fulfilledBaseQuantity,
				transactionUnitId: i.unitId,
				transactionUnitSymbol: i.unitSymbol,
				transactionQuantity: i.fulfilledQuantity,
				conversionToBase: i.conversionToBase,
				referenceType: "SALES_FULFILMENT_VOID",
				referenceId: n.id,
				referenceNumber: n.fulfilmentNumber,
				salesOrderId: n.salesOrderId,
				salesOrderNumber: n.salesOrderNumber,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${n.fulfilmentNumber}: ${r}`
			});
			$o({
				siteId: n.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: uo(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: n.id,
				referenceNumber: n.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${n.fulfilmentNumber}: ${r}`
			}), is.receive({
				siteId: n.siteId,
				productId: i.productId,
				baseUnitId: a.baseUnitId,
				quantityBase: i.fulfilledBaseQuantity
			});
		}
		let c = {
			...n,
			status: "VOIDED",
			voidedAt: (/* @__PURE__ */ new Date()).toISOString(),
			voidDate: e.voidDate,
			voidReason: r
		};
		return Ad = Ad.map((e) => e.id === c.id ? c : e), Md(), Fd(n.salesOrderId), c;
	}
};
i("fulfilments", {
	repository: Ld,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: Ad }),
	restore: (e) => {
		Ad = e.fulfilments, jd = Ad;
	},
	publish: () => kd.forEach((e) => e())
});
//#endregion
//#region src/features/customer-returns/customerReturnRepository.ts
var U = e().trim().min(1).max(200), Rd = y().finite().positive().refine((e) => Math.round(e * 1e4) / 1e4 === e), zd = y().finite().nonnegative(), Bd = x({
	operationId: U,
	invoiceId: U,
	creditNoteId: U.optional(),
	returnDate: U,
	reason: e().trim().min(3).max(2e3),
	lines: u(x({
		costMovementId: U,
		invoiceLineId: U,
		quantity: Rd
	}).strict()).min(1).max(500)
}).strict(), Vd = x({
	costMovementId: U,
	invoiceLineId: U,
	fulfilmentId: U,
	productId: U,
	unitId: U,
	baseUnitId: U,
	siteId: U,
	description: e(),
	quantity: Rd,
	conversionToBase: Rd,
	quantityBase: Rd,
	inventoryValue: zd,
	unitCostBase: zd,
	movementId: U,
	restoredCostId: U,
	reversalMovementId: U.optional(),
	reversalCostId: U.optional()
}).strict(), Hd = x({
	id: U,
	number: U,
	operationId: U,
	fingerprint: e(),
	invoiceId: U,
	invoiceNumber: U,
	customerId: U,
	creditNoteId: U,
	ownsCredit: he(),
	returnDate: U,
	reason: U.max(2e3),
	status: o(["POSTED", "REVERSED"]),
	lines: u(Vd).min(1),
	inventoryValue: zd,
	journalId: U.optional(),
	createdBy: U,
	createdAt: U,
	reversalDate: U.optional(),
	reversalReason: U.optional(),
	reversedBy: U.optional()
}).strict(), Ud = [], Wd = 0, Gd = /* @__PURE__ */ new Set(), Kd = () => {
	Wd++, Gd.forEach((e) => e());
}, qd = (e) => Math.round(e * 1e4) / 1e4, Jd = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Yd(e, t, n) {
	if (zo.getAll().some((r) => r.siteId === e && r.productId === t && me(r.occurredAt) > n)) throw Error("Return date precedes later inventory activity at this site.");
}
function Xd(e) {
	let t = R.getAll().find((t) => t.id === e && t.type === "INVOICE");
	if (!t || t.type !== "INVOICE" || ["VOID", "DRAFT"].includes(t.status) || t.openingBalanceImportId) return [];
	let n = [];
	for (let e of Ld.getAll().filter((e) => e.salesOrderId === t.sourceSalesOrderId && e.status === "ACTIVE")) {
		let r = /* @__PURE__ */ new Set();
		for (let i of e.lines) {
			let a = t.lines.find((e) => e.id === i.salesOrderLineId && e.productId === i.productId && e.unitId === i.unitId), o = zo.getAll().find((t) => t.referenceType === "SALE" && t.referenceId === e.id && t.movementType === "ISSUE" && t.productId === i.productId && ko.getAll().some((e) => e.id === t.inventoryMovementId && e.transactionUnitId === i.unitId) && t.siteId === e.siteId && qd(-t.quantityBase) === qd(i.fulfilledBaseQuantity) && !r.has(t.id));
			if (!a || !o) continue;
			r.add(o.id);
			let s = Ud.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === o.id).reduce((e, t) => e + t.quantityBase, 0);
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
i("physicalCustomerReturns", {
	repository: {
		create(e) {
			let t = E.require("sales.payment"), n = Bd.parse(e), r = JSON.stringify(n), i = Ud.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already used with different customer return data.");
				return i;
			}
			T(n.returnDate), Rt(n.returnDate), j();
			let a = R.getAll().find((e) => e.id === n.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || n.returnDate < a.documentDate) throw Error("Select an issued invoice and a return date on or after it.");
			let o = Xd(a.id), s = /* @__PURE__ */ new Set(), c = n.lines.map((e) => {
				if (s.has(e.costMovementId)) throw Error("Select each original dispatch cost only once.");
				s.add(e.costMovementId);
				let t = o.find((t) => t.costMovementId === e.costMovementId && t.invoiceLineId === e.invoiceLineId);
				if (!t || e.quantity > t.availableQuantity + 1e-8 || n.returnDate < t.dispatchDate) throw Error("Return exceeds dispatched quantities or precedes dispatch.");
				let r = Lr(t.productId), i = wo.getById(t.siteId), c = a.lines.find((t) => t.id === e.invoiceLineId);
				if (!r || !i || i.status !== "ACTIVE") throw Error("An active original receiving site and product are required.");
				if ((c.areaPerPack || r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(r.units.find((e) => e.id === t.unitId)?.code ?? "")) && !Number.isInteger(e.quantity)) throw Error("Return whole packs in whole quantities.");
				Yd(t.siteId, t.productId, n.returnDate);
				let l = qd(e.quantity * t.conversionToBase);
				if (l <= 0) throw Error("Return quantity rounds to zero.");
				let u = Ud.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === t.costMovementId), d = Jd(l + u.reduce((e, t) => e + t.quantityBase, 0) >= t.originalQuantityBase - 1e-8 ? t.originalValue - u.reduce((e, t) => e + t.inventoryValue, 0) : t.originalValue * l / t.originalQuantityBase);
				return {
					...t,
					quantity: e.quantity,
					quantityBase: l,
					inventoryValue: d
				};
			}), l = /* @__PURE__ */ new Map();
			for (let e of c) l.set(e.invoiceLineId, qd((l.get(e.invoiceLineId) ?? 0) + e.quantity));
			let u = n.creditNoteId ? L.getById(n.creditNoteId) : void 0;
			if (n.creditNoteId) {
				if (!u || u.sourceInvoiceId !== a.id || ["VOID", "DRAFT"].includes(u.status) || u.creditDate > n.returnDate) throw Error("Select an issued credit for this invoice dated before receipt.");
				for (let [e, t] of l) {
					let n = u.lines.find((t) => t.id === e)?.quantity ?? 0;
					if (t + Ud.filter((e) => e.status === "POSTED" && e.creditNoteId === u.id).flatMap((e) => e.lines).filter((t) => t.invoiceLineId === e).reduce((e, t) => e + t.quantity, 0) > n + 1e-8) throw Error("Physical return exceeds the linked credit quantities.");
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
			let d = crypto.randomUUID(), f = "CRTN-" + String(Ud.length + 1).padStart(6, "0"), p = c.map((e) => {
				is.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = ko.create({
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
				}), r = $o({
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
			}), m = Jd(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? P.post({
				journalDate: n.returnDate,
				description: "Customer goods returned " + f,
				sourceType: "CUSTOMER_RETURN",
				sourceId: d,
				lines: [{
					accountId: N.requireBySystemRole("INVENTORY").id,
					debit: m,
					credit: 0
				}, {
					accountId: N.requireBySystemRole("COST_OF_GOODS_SOLD").id,
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
			return Ud = [g, ...Ud], Kd(), g;
		},
		reverse(t) {
			let n = E.require("sales.payment"), r = x({
				id: U,
				reversalDate: U,
				reason: e().trim().min(3).max(2e3)
			}).strict().parse(t), i = Ud.find((e) => e.id === r.id);
			if (!i) throw Error("Customer return not found.");
			if (i.status === "REVERSED") return i;
			if (T(r.reversalDate), Rt(r.reversalDate), j(), r.reversalDate < i.returnDate) throw Error("Reversal precedes the return.");
			let a = /* @__PURE__ */ new Map();
			for (let e of i.lines) {
				Yd(e.siteId, e.productId, r.reversalDate);
				let t = e.siteId + "|" + e.productId, n = a.get(t) ?? {
					quantity: 0,
					value: 0
				};
				a.set(t, {
					quantity: qd(n.quantity + e.quantityBase),
					value: Jd(n.value + e.inventoryValue)
				});
			}
			for (let [e, t] of a) {
				let [n, r] = e.split("|"), i = No.getBalance(n, r);
				if ((is.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t.quantity || (i?.inventoryValue ?? 0) + .001 < t.value || Math.abs((i?.quantityOnHand ?? 0) - t.quantity) < 1e-8 && Math.abs((i?.inventoryValue ?? 0) - t.value) > .001) throw Error("Returned stock/value has been used; restore stock availability before reversal.");
			}
			let o = L.getById(i.creditNoteId);
			if (i.ownsCredit && ((o.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > r.reversalDate) || L.getAllocationsByCreditNote(o.id).some((e) => (e.reversedAt ? me(e.reversedAt) : e.allocationDate) > r.reversalDate))) throw Error("Return reversal precedes later credit settlement activity.");
			Ud = Ud.map((e) => e.id === i.id ? {
				...e,
				status: "REVERSED"
			} : e), i.ownsCredit && R.voidCreditNote({
				creditNoteId: i.creditNoteId,
				reason: r.reason,
				voidDate: r.reversalDate
			});
			let s = i.lines.map((e) => {
				is.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = ko.create({
					movementType: "RETURN_OUT",
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: -e.quantityBase,
					transactionUnitId: e.unitId,
					transactionUnitSymbol: ko.getAll().find((t) => t.id === e.movementId)?.transactionUnitSymbol ?? "",
					transactionQuantity: -e.quantity,
					conversionToBase: e.conversionToBase,
					referenceType: "CUSTOMER_RETURN_VOID",
					referenceId: i.id,
					referenceNumber: i.number,
					occurredAt: r.reversalDate,
					notes: r.reason
				}), n = No.requireBalance(e.siteId, e.productId), a = qd(n.quantityOnHand - e.quantityBase), o = Jd(n.inventoryValue - e.inventoryValue), s = a ? lo(o / a) : 0;
				No.save({
					...n,
					quantityOnHand: a,
					inventoryValue: o,
					averageCostPerBaseUnit: s,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				});
				let c = zo.create({
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
					referenceId: i.id,
					referenceNumber: i.number,
					inventoryMovementId: t.id,
					occurredAt: r.reversalDate,
					notes: r.reason
				});
				return {
					...e,
					reversalMovementId: t.id,
					reversalCostId: c.id
				};
			});
			i.journalId && P.reverse({
				journalEntryId: i.journalId,
				reversalDate: r.reversalDate,
				reason: r.reason
			});
			let c = {
				...i,
				lines: s,
				status: "REVERSED",
				reversalDate: r.reversalDate,
				reversalReason: r.reason,
				reversedBy: n.userId
			};
			return Ud = Ud.map((e) => e.id === i.id ? c : e), Kd(), c;
		}
	},
	read: "inventory.cost.read",
	commands: {
		create: "sales.payment",
		reverse: "sales.payment"
	},
	snapshot: () => ({ returns: Ud }),
	restore: (e) => {
		Ud = e.returns;
	},
	publish: Kd,
	validate: (e, t) => {
		let n = x({ returns: u(Hd) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
		for (let e of n.returns) {
			let t = Bd.parse(JSON.parse(e.fingerprint));
			if (T(e.returnDate), i.has(e.operationId) || t.operationId !== e.operationId || t.invoiceId !== e.invoiceId || t.returnDate !== e.returnDate || t.reason !== e.reason || t.lines.length !== e.lines.length || e.ownsCredit !== !t.creditNoteId || t.creditNoteId && t.creditNoteId !== e.creditNoteId) throw Error("Customer return request mismatch.");
			i.add(e.operationId);
			let n = r.sales.invoices.find((t) => t.id === e.invoiceId && t.customerId === e.customerId), s = r.customerCredits.creditNotes.find((t) => t.id === e.creditNoteId && t.sourceInvoiceId === e.invoiceId);
			if (!n || !s || e.status === "POSTED" && s.status === "VOID" || e.status === "REVERSED" && e.ownsCredit && s.status !== "VOID" || Jd(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue || new Set(e.lines.map((e) => e.costMovementId)).size !== e.lines.length) throw Error("Customer return source or totals mismatch.");
			for (let i of e.lines) {
				let o = t.lines.find((e) => e.costMovementId === i.costMovementId && e.invoiceLineId === i.invoiceLineId), s = r.costMovements.movements.find((e) => e.id === i.costMovementId), c = r.costMovements.movements.find((e) => e.id === i.restoredCostId), l = r.inventoryMovements.movements.find((e) => e.id === i.movementId), u = r.fulfilments.fulfilments.find((e) => e.id === i.fulfilmentId);
				if (!o || o.quantity !== i.quantity || !u || u.salesOrderId !== n.sourceSalesOrderId || !s || s.referenceType !== "SALE" || s.referenceId !== u.id || s.productId !== i.productId || s.siteId !== i.siteId || qd(i.quantity * i.conversionToBase) !== i.quantityBase || !c || c.referenceType !== "CUSTOMER_RETURN" || c.referenceId !== e.id || c.inventoryMovementId !== i.movementId || c.quantityBase !== i.quantityBase || c.valueChange !== i.inventoryValue || !l || l.referenceId !== e.id || l.quantityBase !== i.quantityBase || me(c.occurredAt) !== e.returnDate) throw Error("Customer return inventory/cost references mismatch.");
				if (e.status === "POSTED") {
					if (u.status !== "ACTIVE") throw Error("Active customer return has a void dispatch.");
					let e = a.get(s.id) ?? {
						quantity: 0,
						value: 0
					}, t = {
						quantity: qd(e.quantity + i.quantityBase),
						value: Jd(e.value + i.inventoryValue)
					};
					if (a.set(s.id, t), t.quantity > -s.quantityBase + 1e-8 || t.value > -s.valueChange + .001) throw Error("Customer returns exceed original dispatched stock/cost.");
				}
				if (e.status === "REVERSED") {
					let t = r.costMovements.movements.find((e) => e.id === i.reversalCostId);
					if (!t || t.referenceType !== "CUSTOMER_RETURN_VOID" || t.referenceId !== e.id || t.inventoryMovementId !== i.reversalMovementId || t.quantityBase !== -i.quantityBase || t.valueChange !== -i.inventoryValue || me(t.occurredAt) !== e.reversalDate) throw Error("Customer return reversal references mismatch.");
				}
			}
			if (e.status === "POSTED") for (let t of e.lines) {
				let n = e.creditNoteId + "|" + t.invoiceLineId, r = qd((o.get(n) ?? 0) + t.quantity);
				if (o.set(n, r), !s.lines.some((e) => e.id === t.invoiceLineId && e.quantity + 1e-8 >= r)) throw Error("Customer returns exceed linked credit quantity.");
			}
			for (let t of new Set(e.lines.map((e) => e.invoiceLineId))) {
				let n = qd(e.lines.filter((e) => e.invoiceLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!s.lines.some((e) => e.id === t && e.quantity + 1e-8 >= n)) throw Error("Customer return credit quantity mismatch.");
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
var Zd = [
	"Manual",
	"1",
	"2",
	"3",
	"4-resident",
	"4-foreign",
	"5",
	"6"
], Qd = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
], $d = {
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
function ef(e, t, n, r) {
	if (!Number.isFinite(e) || e < 0 || e > 1e9) throw Error("Invalid taxable earnings.");
	if (r < "2026-07-01" || r > "2027-06-30") throw Error("Automatic PAYG is available only for pay dates in 2026–27. Use a reviewed manual amount for another year.");
	if (t === "Manual") throw Error("Manual withholding must be entered explicitly.");
	if (t.startsWith("4-")) return Math.floor(Math.floor(e) * (t === "4-resident" ? .47 : .45) + 1e-9);
	let i = Math.round(e * 100);
	n === "Monthly" && i % 100 == 33 && i++;
	let a = n === "Weekly" ? i / 100 : n === "Fortnightly" ? i / 200 : n === "Monthly" ? i * 3 / 1300 : i / 1300, o = Math.floor(a + 1e-9) + .99, s = $d[t]?.find(([e]) => o < e);
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
}), G = (e, t, n) => W(e, t, "select", n), tf = (e, t, n = "0") => ({
	...W(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), nf = (e, t) => W(e, t, "date", void 0, "2026-10-16"), rf = (e, t) => ({
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
}), af = [];
function of(e, t, n, r, i, a, o, s, c) {
	af.push({
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
of("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
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
	tf("price", "Standard selling price", "49.50"),
	tf("cost", "Buying cost (sample)", "25"),
	tf("coverage", "m² per pack", "2.2"),
	G("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	tf("reorder", "Reorder point", "10"),
	tf("target", "Target stock", "50"),
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
]), of("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	W("product", "Product / SKU"),
	W("customer", "Customer scope"),
	W("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	W("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	tf("price", "Promotional unit price", "45"),
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
]), of("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	W("code", "Tax code"),
	tf("rate", "Tax rate (%)", "15"),
	G("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	rf("collected", "GST collected account"),
	rf("paid", "GST paid account"),
	W("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), of("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	G("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	rf("receivable", "Receivables / payables control"),
	rf("income", "Income / expense account"),
	rf("inventory", "Inventory account"),
	rf("cogs", "Cost of goods sold"),
	rf("gst", "GST control account"),
	rf("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), of("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	W("code", "Job code"),
	W("customer", "Customer"),
	W("owner", "Project owner"),
	nf("starts", "Start date"),
	nf("ends", "End date"),
	tf("budget", "Revenue budget", "10000"),
	tf("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), of("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	W("number", "Account number (sample only)"),
	W("bank", "Bank name"),
	G("currency", "Currency", ["NZD", "AUD"]),
	rf("ledger", "Linked bank GL account"),
	G("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	nf("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), of("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
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
	rf("account", "Categorise to account"),
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
]), of("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	G("kind", "Batch type", ["Supplier payments", "Wages"]),
	nf("payDate", "Payment date"),
	W("bank", "Paying account"),
	W("reference", "Bank reference"),
	G("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	tf("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), of("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "payroll.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
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
	tf("rate", "Rate / amount", "30"),
	G("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	rf("expense", "Expense account"),
	rf("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), of("filing", "Payroll filing", "Payroll", "/payroll/filing", "payroll.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	W("payrun", "Pay run reference"),
	nf("payDate", "Pay date"),
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
]), of("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
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
	nf("next", "Next generation date"),
	nf("ends", "Schedule end date"),
	tf("total", "Template amount", "220"),
	G("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), of("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	W("customer", "Customer / branch"),
	W("owner", "Assigned to"),
	nf("due", "Due date"),
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
]), of("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
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
]), of("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
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
]), of("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
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
]), of("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
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
}, ["Overview", "Report preview"]), of("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
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
var sf = af;
[...new Set(af.map((e) => e.group))], G("gst", "GST registration", ["Registered", "Not registered"]), G("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), tf("quoteNext", "Next quote number", "1001"), tf("orderNext", "Next order number", "1001"), tf("invoiceNext", "Next invoice number", "1001"), tf("creditNext", "Next credit number", "1001"), G("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), G("template", "Default template", ["Standard invoice", "Trade invoice"]), G("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), G("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), tf("next", "Next PO number", "1001"), G("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), rf("expense", "Default expense account"), G("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), G("remittance", "Remittance preference", ["Preview before sending", "Manual"]), G("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), G("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), rf("wages", "Wages expense account"), rf("clearing", "Payroll clearing account"), G("bank", "Paying bank", ["Sample operating account"]), G("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), G("basis", "Default basis", ["Accrual", "Cash"]), G("currency", "Display currency", ["NZD", "AUD"]), G("precision", "Decimal places", ["2", "0"]), G("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), G("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function cf(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(sf.map((e) => [e.id, [{
	...cf(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function lf(e) {
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
var uf = [
	"Customer",
	"Branch",
	"Contact"
], df = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], ff = {
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
}, pf = p(e(), ae([
	e().max(2e3),
	y().finite(),
	he()
]));
function mf(e, t) {
	let n = pf.parse(t), r = ff[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var hf = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), gf = (e) => String(e ?? "").trim().toLowerCase(), _f = (e) => String(e ?? "").replace(/\D/g, ""), vf = (e, t, n = hf) => !!n(e) && n(e) === n(t);
function yf(e, t) {
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
		(vf(r.businessName, e.businessName) || vf(r.businessName, e.tradingName) || vf(r.tradingName, e.businessName) || vf(r.tradingName, e.tradingName)) && t.push("Business/trading name"), vf(r.email, e.email, gf) && t.push("Email"), vf(r.phone, e.phone, _f) && t.push("Phone"), vf(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			vf(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && vf([
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
			].join(" ")) && t.push("Address"), vf(r.phone, e.phone, _f) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			vf([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), vf(r.email, e.email, gf) && t.push("Email"), (vf(r.phone, e.phone, _f) || vf(r.phone, e.mobile, _f) || vf(r.mobile, e.phone, _f) || vf(r.mobile, e.mobile, _f)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function bf(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/data-transfer/transferModel.ts
var xf = [
	"Customers",
	"Suppliers",
	"Customer branches",
	"Customer contacts",
	"Products"
], Sf = ["Create", "Update by ID"], Cf = "HTT-CSV-1", wf = {
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
}, Tf = {
	Customers: ff.Customer,
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
		...ff.Branch
	},
	"Customer contacts": {
		customerId: "",
		...ff.Contact
	},
	Products: wf
}, Ef = (e) => [
	"_format",
	"id",
	"recordToken",
	"externalId",
	...Object.keys(Tf[e])
], Df = {
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
}, Of = x({
	dataset: o(xf),
	mode: o(Sf),
	fileName: e().trim().min(1).max(200),
	text: e().max(1e6),
	mapping: p(e(), y().int().nonnegative()).optional()
}).strict();
function kf(e) {
	if (e.text.includes("\0")) throw Error("CSV source must be text without NUL characters.");
	let t = lf(e.text.replace(/^\uFEFF/, ""));
	if (t.length < 2 || t.length > 501) throw Error("Choose a CSV header and 1–500 data records.");
	let n = t[0].map((e) => e.trim());
	if (n.length > 64 || n.some((e) => !e || e.length > 120) || new Set(n.map((e) => e.toLowerCase())).size !== n.length) throw Error("CSV requires 1–64 distinct, nonempty column names of at most 120 characters.");
	if (t.slice(1).some((e) => e.length !== n.length || e.some((e) => e.length > 1e5))) throw Error("Each CSV record must match the header width; cells may not exceed 100,000 characters.");
	let r = Ef(e.dataset), i = e.mapping ?? Object.fromEntries(r.flatMap((e) => {
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
function Af(e) {
	return e.map((e) => e.map((e) => "\"" + (/^[=+@\-'\t\r]/.test(e) ? "'" + e : e).replaceAll("\"", "\"\"") + "\"").join(",")).join("\r\n");
}
//#endregion
//#region src/features/payroll/data/payrollModel.ts
var K = e().trim().min(1).max(200), jf = e().refine((e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !isNaN(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, "Use a valid date."), Mf = e().trim().min(3).max(2e3), Nf = y().finite().min(0).max(1e9).refine((e) => Math.abs(e * 100 - Math.round(e * 100)) < 1e-5, "Use whole cents."), Pf = y().finite().min(0).max(1e5).refine((e) => Math.abs(e * 1e4 - Math.round(e * 1e4)) < 1e-6, "Use at most four decimal places."), Ff = x({
	actorId: K,
	at: Oe(),
	action: K,
	reason: Mf,
	revision: y().int().positive()
}).strict(), If = {
	id: K,
	revision: y().int().positive(),
	history: u(Ff).min(1)
}, Lf = x({
	code: e().trim().min(1).max(40),
	name: K,
	position: e().trim().max(200),
	email: l().or(b("")),
	startDate: jf,
	endDate: jf.or(b("")),
	status: o(["Active", "Inactive"]),
	basis: o(["Hourly", "Salary"]),
	rate: Nf,
	earningItemId: K,
	taxScale: o(Zd).default("Manual"),
	standardTaxConfirmed: he().default(!1),
	superFund: e().trim().max(200).default(""),
	superMemberId: e().trim().max(100).default(""),
	bankAccount: e().trim().max(100),
	taxIdentifier: e().trim().max(100),
	annualOpening: Pf,
	personalOpening: Pf
}).strict(), Rf = Lf.extend(If).strict(), zf = x({
	code: e().trim().min(1).max(40),
	name: K,
	category: o([
		"Earnings",
		"Allowance",
		"Deduction",
		"Tax",
		"Employer contribution"
	]),
	method: o([
		"Hourly",
		"Fixed",
		"Percentage"
	]),
	rate: Nf,
	taxable: he(),
	accountId: K,
	liabilityAccountId: e().trim().max(200),
	active: he()
}).strict(), Bf = zf.extend(If).strict(), Vf = x({
	netAccountId: K,
	taxItemId: K,
	currency: e().regex(/^[A-Z]{3}$/),
	region: b("Australia"),
	frequency: o(Qd).default("Fortnightly"),
	superItemId: K,
	employerName: K,
	employerIdentifier: e().trim().max(100)
}).strict(), Hf = Vf.extend(If).strict(), Uf = x({
	employeeId: K,
	itemId: K,
	date: jf,
	hours: Pf.refine((e) => e > 0),
	notes: e().trim().max(1e3)
}).strict(), Wf = Uf.extend({
	...If,
	status: o([
		"Draft",
		"Submitted",
		"Approved"
	])
}).strict(), Gf = x({
	employeeId: K,
	type: o([
		"Annual",
		"Personal",
		"Unpaid"
	]),
	start: jf,
	end: jf,
	hours: Pf.refine((e) => e > 0),
	notes: e().trim().max(1e3)
}).strict(), Kf = Gf.extend({
	...If,
	status: o([
		"Pending",
		"Approved",
		"Declined",
		"Cancelled"
	])
}).strict(), qf = x({
	employeeId: K,
	itemId: K,
	quantity: Pf.refine((e) => e > 0),
	rate: Nf
}).strict(), Jf = x({
	name: K,
	start: jf,
	end: jf,
	payDate: jf,
	employeeInputs: u(x({
		employeeId: K,
		withholding: Nf,
		additionalWithholding: Nf.default(0),
		superMethod: o(["Reviewed amount", "12% reviewed QE"]).default("Reviewed amount"),
		superBase: Nf.default(0),
		superAmount: Nf.default(0),
		salaryOverride: Nf.optional(),
		annualAccrual: Pf,
		personalAccrual: Pf
	}).strict()).min(1).max(500),
	adjustments: u(qf).max(2e3),
	taxReviewed: he(),
	reviewReference: e().trim().max(500)
}).strict(), Yf = x({
	item: Bf,
	quantity: Pf,
	rate: Nf,
	amount: Nf,
	source: e().max(200)
}).strict(), Xf = x({
	gross: Nf,
	taxable: Nf,
	deductions: Nf,
	net: Nf,
	employerCost: Nf,
	withholding: Nf
}).strict(), Zf = x({
	employee: Rf,
	lines: u(Yf).min(1),
	timeIds: u(K),
	leaveIds: u(K),
	annualAccrual: Pf,
	personalAccrual: Pf,
	totals: Xf
}).strict(), Qf = Jf.extend({
	...If,
	status: o([
		"Draft",
		"Approved",
		"Posted",
		"Reversed",
		"Cancelled"
	]),
	slips: u(Zf).min(1),
	totals: Xf,
	settings: Hf,
	sourceToken: K,
	journalId: K.optional(),
	reversalJournalId: K.optional(),
	reversalDate: jf.optional()
}).strict(), $f = x({
	...If,
	operationId: K,
	runId: K,
	accountId: K,
	bankAccountId: K,
	date: jf,
	amount: Nf.refine((e) => e > 0),
	reference: e().trim().max(200),
	status: o(["Posted", "Reversed"]),
	journalId: K,
	reversalJournalId: K.optional(),
	reversalDate: jf.optional()
}).strict(), ep = x({
	...If,
	runId: K,
	status: o([
		"Prepared",
		"External reference recorded",
		"Correction needed"
	]),
	reference: e().trim().max(200),
	notes: e().trim().max(1e3),
	runRevision: y().int().positive()
}).strict(), tp = x({
	employees: u(Rf),
	items: u(Bf),
	timesheets: u(Wf),
	leave: u(Kf),
	runs: u(Qf),
	payments: u($f),
	filings: u(ep),
	settings: u(Hf).max(1),
	receipts: u(x({
		operationId: K,
		fingerprint: e().regex(/^[a-f0-9]{64}$/),
		input: p(e(), ye()),
		actorId: K,
		entity: o([
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
		revision: y().int().positive()
	}).strict())
}).strict(), np = () => ({
	employees: [],
	items: [],
	timesheets: [],
	leave: [],
	runs: [],
	payments: [],
	filings: [],
	settings: [],
	receipts: []
}), rp = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function ip(e) {
	let t = (t) => rp(e.filter(t).reduce((e, t) => e + t.amount, 0)), n = (e) => ["Earnings", "Allowance"].includes(e.item.category), r = t(n), i = t((e) => ["Deduction", "Tax"].includes(e.item.category));
	return Xf.parse({
		gross: r,
		taxable: t((e) => n(e) && e.item.taxable),
		deductions: i,
		net: rp(r - i),
		employerCost: t((e) => e.item.category === "Employer contribution"),
		withholding: t((e) => e.item.category === "Tax")
	});
}
function ap(e) {
	return Xf.parse(Object.fromEntries(Object.keys(Xf.shape).map((t) => [t, rp(e.reduce((e, n) => e + n.totals[t], 0))])));
}
//#endregion
//#region electron/security/payrollRepository.ts
var q = np(), op = (e) => Array.isArray(e) ? e.map(op) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, op(e[t])])) : e, sp = (e) => Ee("sha256").update(JSON.stringify(op(e))).digest("hex"), cp = {
	operationId: K,
	reason: Mf
}, lp = {
	id: K.optional(),
	expectedRevision: y().int().nonnegative()
};
function up(e = "payroll.manage") {
	return E.require(e);
}
function J(e, t) {
	let n = q[e].find((e) => e.id === t);
	if (!n) throw Error("Payroll record was not found.");
	return n;
}
var dp = (e) => !["Cancelled", "Reversed"].includes(e.status);
function fp(e, t, n) {
	return q.runs.some((r) => r.id !== n && dp(r) && r.slips.some((n) => (e === "timesheets" ? n.timeIds : n.leaveIds).includes(t)));
}
function pp(e, t) {
	return q[e] = [...q[e].filter((e) => e.id !== t.id), t], structuredClone(t);
}
function mp(e, t, n) {
	let r = (e?.revision ?? 0) + 1;
	return {
		id: e?.id ?? crypto.randomUUID(),
		revision: r,
		history: [...e?.history ?? [], {
			actorId: up("payroll.read").userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			action: t,
			reason: n,
			revision: r
		}]
	};
}
function hp(e, t) {
	if ((e?.revision ?? 0) !== t) throw Error("Payroll record changed. Reload before editing.");
}
function gp(e, t, n) {
	let r = sp({
		input: e,
		actorId: up("payroll.read").userId
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
		actorId: up("payroll.read").userId,
		entity: t,
		recordId: a.id,
		revision: a.revision
	}), tp.parse(q), a;
}
function _p(e, t, n = !0) {
	let r = N.requireById(e);
	if (r.type !== t || n && !r.active || r.systemRole && (t !== "EXPENSE" || r.systemRole !== "OPERATING_EXPENSE")) throw Error(`Use a dedicated ${t.toLowerCase()} payroll account, not a bank, tax, AR/AP or stock control account.`);
	return r;
}
function vp(e, t = !0) {
	if (_p(e.accountId, [
		"Earnings",
		"Allowance",
		"Employer contribution"
	].includes(e.category) ? "EXPENSE" : "LIABILITY", t), e.category === "Employer contribution") _p(e.liabilityAccountId, "LIABILITY", t);
	else if (e.liabilityAccountId) throw Error("Only employer contributions use a second liability account.");
	if (["Earnings", "Allowance"].includes(e.category) && e.method === "Percentage" || e.category === "Tax" && e.method !== "Fixed") throw Error("Earnings use hourly/fixed values; withholding tax is an explicitly reviewed fixed amount.");
	if (e.method === "Percentage" && e.rate > 100) throw Error("Percentage rates cannot exceed 100.");
}
function yp(e) {
	let t = J("employees", e);
	if (t.status !== "Active") throw Error("Select an active employee.");
	return t;
}
function bp(e, t, n = t) {
	if (t < e.startDate || e.endDate && n > e.endDate) throw Error("Dates must be within the employment period.");
}
function xp(e) {
	let t = yp(e.employeeId);
	bp(t, e.date);
	let n = J("items", e.itemId);
	if (!n.active || n.category !== "Earnings" || t.basis === "Hourly" && n.method !== "Hourly" || t.basis === "Salary" && n.id !== t.earningItemId) throw Error("Select an appropriate employee earnings item.");
	vp(n);
}
function Sp(e, t) {
	if (bp(yp(e.employeeId), e.start, e.end), e.start > e.end || e.hours > ((Date.parse(e.end) - Date.parse(e.start)) / 864e5 + 1) * 24) throw Error("Leave dates or hours are invalid.");
	if (q.leave.some((n) => n.id !== t && n.employeeId === e.employeeId && ["Pending", "Approved"].includes(n.status) && n.start <= e.end && n.end >= e.start)) throw Error("Leave request dates overlap.");
}
function Cp() {
	let e = q.settings[0];
	if (!e) throw Error("Configure payroll settings first.");
	_p(e.netAccountId, "LIABILITY");
	let t = J("items", e.taxItemId);
	if (t.category !== "Tax" || !t.active) throw Error("Select an active fixed withholding item.");
	if (vp(t), e.netAccountId === t.accountId) throw Error("Net wages and withholding require separate liability accounts.");
	let n = J("items", e.superItemId);
	if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Use an active fixed super contribution item.");
	if (vp(n), e.currency !== "AUD" || e.currency !== w().currency) throw Error("Payroll currency must match the business currency.");
	return e;
}
function wp(e, t) {
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
function Tp(e, t) {
	let n = wp(e, t);
	if (n.annual - n.reservedAnnual < -1e-5 || n.personal - n.reservedPersonal < -1e-5) throw Error("Approved leave exceeds the available recorded hours.");
}
var Ep = () => sp({
	employees: q.employees,
	items: q.items,
	timesheets: q.timesheets,
	leave: q.leave,
	settings: q.settings
});
function Dp(e, t) {
	if (e.start > e.end || e.payDate < e.end) throw Error("Pay date must follow a valid pay period.");
	let n = Cp(), r = /* @__PURE__ */ new Set(), i = [];
	for (let a of e.employeeInputs) {
		if (r.has(a.employeeId)) throw Error("Include each employee only once.");
		r.add(a.employeeId);
		let o = yp(a.employeeId);
		if (o.startDate > e.end || o.endDate && o.endDate < e.start) throw Error("Employment does not overlap this pay period.");
		if (o.basis === "Salary" && (o.startDate > e.start || o.endDate && o.endDate < e.end) && a.salaryOverride === void 0) throw Error("Partial-period salary requires a reviewed salary override.");
		if (q.runs.some((n) => n.id !== t && dp(n) && n.start <= e.end && n.end >= e.start && n.slips.some((e) => e.employee.id === o.id))) throw Error("Employee already has an overlapping pay run. Cancel or reverse it before replacing it.");
		let s = J("items", o.earningItemId);
		if (!s.active || s.category !== "Earnings" || s.method !== (o.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Employee earning item does not match the pay basis.");
		vp(s);
		let c = q.timesheets.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.date >= e.start && t.date <= e.end), l = q.leave.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.start <= e.end && t.end >= e.start);
		if (l.some((t) => t.start < e.start || t.end > e.end)) throw Error("Split leave spanning pay periods before including it in payroll.");
		for (let e of c) xp(e);
		for (let e of l) Sp(e, e.id);
		if (c.some((e) => fp("timesheets", e.id, t)) || l.some((e) => fp("leave", e.id, t))) throw Error("Hours or leave are already reserved by another pay run.");
		if (c.some((e) => l.some((t) => e.date >= t.start && e.date <= t.end))) throw Error("Approved timesheet and leave dates overlap; correct them before payroll.");
		if (o.basis === "Salary" && l.some((e) => e.type === "Unpaid") && a.salaryOverride === void 0) throw Error("Salary with unpaid leave requires an explicitly reviewed salary override.");
		if (o.basis === "Hourly" && a.salaryOverride !== void 0) throw Error("Hourly employees cannot use a salary override.");
		let u = [], d = (e, t, n, r) => {
			if (vp(e), !e.active) throw Error("Inactive pay item.");
			let i = rp(t * n);
			Nf.parse(i), u.push({
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
		let m = rp(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
		if (m <= 0) throw Error("Each employee needs positive gross earnings.");
		for (let e of f.filter((e) => J("items", e.itemId).method === "Percentage")) {
			if (e.quantity !== 1 || e.rate > 100) throw Error("Percentage items require quantity 1 and rate 0–100.");
			d(J("items", e.itemId), 1, rp(m * e.rate / 100), "Adjustment"), u[u.length - 1].quantity = 1, u[u.length - 1].rate = e.rate;
		}
		let h = rp(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category) && e.item.taxable).reduce((e, t) => e + t.amount, 0)), g = a.withholding;
		if (o.taxScale !== "Manual") {
			if (!o.standardTaxConfirmed) throw Error("Confirm the standard PAYG case or use reviewed manual withholding.");
			if (!o.taxScale.startsWith("4-") && !/^\d{8,9}$/.test(o.taxIdentifier.replace(/\s/g, ""))) throw Error("Record a provided eight- or nine-digit TFN for the selected scale.");
			if (a.withholding !== 0) throw Error("Clear manual withholding for an automatic PAYG employee.");
			g = ef(h, o.taxScale, n.frequency, e.payDate);
		}
		if (g = rp(g + a.additionalWithholding), d(J("items", n.taxItemId), 1, g, o.taxScale === "Manual" ? "Reviewed PAYG" : "ATO 2026–27 scale " + o.taxScale), a.superMethod === "12% reviewed QE" && (e.payDate < "2026-07-01" || e.payDate > "2027-06-30" || a.superBase > m)) throw Error("Reviewed qualifying earnings must not exceed gross and the 12% helper is limited to 2026–27. Use a reviewed super amount for exceptions.");
		let _ = a.superMethod === "12% reviewed QE" ? rp(a.superBase * .12) : a.superAmount;
		d(J("items", n.superItemId), 1, _, a.superMethod === "12% reviewed QE" ? "SG 12% reviewed QE" : "Reviewed SG amount");
		let v = ip(u);
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
		totals: ap(i),
		settings: structuredClone(n),
		sourceToken: Ep()
	};
}
function Op(e) {
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
function kp(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of Op(e).filter((e) => e.credit)) t.set(n.accountId, rp((t.get(n.accountId) ?? 0) + n.credit));
	return [...t].map(([t, n]) => ({
		accountId: t,
		amount: n,
		paid: rp(q.payments.filter((n) => n.runId === e.id && n.accountId === t && n.status === "Posted").reduce((e, t) => e + t.amount, 0))
	}));
}
i("payroll", {
	repository: {
		balances(e) {
			return up("payroll.read"), wp(K.parse(e));
		},
		obligations(e) {
			return up("payroll.read"), kp(J("runs", K.parse(e)));
		},
		setupDefaults(e) {
			up(), E.require("accounting.post");
			let t = x(cp).strict().parse(e);
			return gp(t, "settings", () => {
				if (q.settings.length) throw Error("Payroll is already configured.");
				let e = (e, t, n) => {
					for (; N.getAll().some((t) => t.code === String(e));) e++;
					return N.create({
						code: String(e),
						name: t,
						type: n,
						active: !0,
						allowManualPosting: n === "EXPENSE"
					}).id;
				}, n = e(6e3, "Payroll wages", "EXPENSE"), r = e(6010, "Payroll employer contributions", "EXPENSE"), i = e(2200, "Net wages payable", "LIABILITY"), a = e(2210, "Payroll withholding payable", "LIABILITY"), o = e(2220, "Payroll deductions payable", "LIABILITY"), s = e(2230, "Employer contributions payable", "LIABILITY"), c = (e, n, r, i, a, o = "") => {
					let s = {
						...mp(void 0, "Created", t.reason),
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
				return pp("settings", {
					...mp(void 0, "Configured", t.reason),
					netAccountId: i,
					taxItemId: l.id,
					currency: w().currency,
					region: "Australia",
					frequency: "Fortnightly",
					superItemId: u.id,
					employerName: w().companyName,
					employerIdentifier: ""
				});
			});
		},
		saveEmployee(e) {
			up();
			let t = x({
				...cp,
				...lp,
				values: Lf
			}).strict().parse(e);
			return gp(t, "employees", () => {
				let e = t.id ? J("employees", t.id) : void 0;
				if (hp(e, t.expectedRevision), q.employees.some((n) => n.id !== e?.id && n.code.toLowerCase() === t.values.code.toLowerCase())) throw Error("Employee code already exists.");
				if (t.values.endDate && t.values.endDate < t.values.startDate) throw Error("Employment end date is before the start date.");
				let n = J("items", t.values.earningItemId);
				if (!n.active || n.category !== "Earnings" || n.method !== (t.values.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Select an active earning item matching the pay basis.");
				if (e && q.runs.some((t) => ["Posted", "Reversed"].includes(t.status) && t.slips.some((t) => t.employee.id === e.id)) && (e.annualOpening !== t.values.annualOpening || e.personalOpening !== t.values.personalOpening)) throw Error("Opening leave hours are locked after payroll posting.");
				return pp("employees", {
					...t.values,
					...mp(e, e ? "Edited" : "Created", t.reason)
				});
			});
		},
		saveItem(e) {
			up();
			let t = x({
				...cp,
				...lp,
				values: zf
			}).strict().parse(e);
			return gp(t, "items", () => {
				let e = t.id ? J("items", t.id) : void 0;
				if (hp(e, t.expectedRevision), q.items.some((n) => n.id !== e?.id && n.code.toLowerCase() === t.values.code.toLowerCase())) throw Error("Pay item code already exists.");
				let n = {
					...t.values,
					...mp(e, e ? "Edited" : "Created", t.reason)
				};
				return vp(n), pp("items", n);
			});
		},
		saveSettings(e) {
			up();
			let t = x({
				...cp,
				expectedRevision: y().int().nonnegative(),
				values: Vf
			}).strict().parse(e);
			return gp(t, "settings", () => {
				let e = q.settings[0];
				hp(e, t.expectedRevision), _p(t.values.netAccountId, "LIABILITY");
				let n = J("items", t.values.superItemId);
				if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Select an active fixed super guarantee item.");
				let r = J("items", t.values.taxItemId);
				if (r.category !== "Tax" || !r.active || r.accountId === t.values.netAccountId) throw Error("Use a valid withholding item and a separate net wages account.");
				if (t.values.currency !== "AUD" || t.values.currency !== w().currency) throw Error("Payroll currency must match the business.");
				return pp("settings", {
					...t.values,
					...mp(e, "Settings changed", t.reason)
				});
			});
		},
		saveTime(e) {
			up();
			let t = x({
				...cp,
				...lp,
				values: Uf
			}).strict().parse(e);
			return gp(t, "timesheets", () => {
				let e = t.id ? J("timesheets", t.id) : void 0;
				if (hp(e, t.expectedRevision), e && (e.status !== "Draft" || fp("timesheets", e.id))) throw Error("Only an unreserved draft timesheet can be edited.");
				xp(t.values);
				let n = yp(t.values.employeeId), r = J("items", t.values.itemId);
				if (q.timesheets.filter((r) => r.id !== e?.id && r.employeeId === n.id && r.date === t.values.date).reduce((e, t) => e + t.hours, 0) + t.values.hours > 24) throw Error("Total timesheet hours cannot exceed 24 for one employee/day.");
				if (q.timesheets.some((i) => i.id !== e?.id && i.employeeId === n.id && i.itemId === r.id && i.date === t.values.date)) throw Error("A timesheet already exists for this employee, day and item.");
				return pp("timesheets", {
					...t.values,
					...mp(e, e ? "Edited" : "Created", t.reason),
					status: "Draft"
				});
			});
		},
		changeTime(e) {
			let t = x({
				...cp,
				id: K,
				expectedRevision: y().int().positive(),
				action: o([
					"Submit",
					"Approve",
					"Reopen"
				])
			}).strict().parse(e);
			return up(t.action === "Approve" ? "payroll.approve" : "payroll.manage"), gp(t, "timesheets", () => {
				let e = J("timesheets", t.id);
				if (hp(e, t.expectedRevision), fp("timesheets", e.id)) throw Error("Timesheet is reserved by a pay run.");
				if (t.action === "Submit" && e.status !== "Draft" || t.action === "Approve" && e.status !== "Submitted" || t.action === "Reopen" && e.status === "Draft") throw Error("Invalid timesheet transition.");
				return t.action !== "Reopen" && xp(e), pp("timesheets", {
					...e,
					...mp(e, t.action, t.reason),
					status: t.action === "Submit" ? "Submitted" : t.action === "Approve" ? "Approved" : "Draft"
				});
			});
		},
		saveLeave(e) {
			up();
			let t = x({
				...cp,
				...lp,
				values: Gf
			}).strict().parse(e);
			return gp(t, "leave", () => {
				let e = t.id ? J("leave", t.id) : void 0;
				if (hp(e, t.expectedRevision), e && (e.status !== "Pending" || fp("leave", e.id))) throw Error("Only an unreserved pending leave request can be edited.");
				return Sp(t.values, e?.id), pp("leave", {
					...t.values,
					...mp(e, e ? "Edited" : "Created", t.reason),
					status: "Pending"
				});
			});
		},
		changeLeave(e) {
			let t = x({
				...cp,
				id: K,
				expectedRevision: y().int().positive(),
				action: o([
					"Approve",
					"Decline",
					"Cancel",
					"Reopen"
				])
			}).strict().parse(e);
			return up(t.action === "Approve" || t.action === "Decline" ? "payroll.approve" : "payroll.manage"), gp(t, "leave", () => {
				let e = J("leave", t.id);
				if (hp(e, t.expectedRevision), fp("leave", e.id)) throw Error("Leave is reserved by a pay run.");
				if (["Approve", "Decline"].includes(t.action) && e.status !== "Pending" || t.action === "Cancel" && ["Cancelled", "Declined"].includes(e.status) || t.action === "Reopen" && !["Cancelled", "Declined"].includes(e.status)) throw Error("Invalid leave transition.");
				(t.action === "Approve" || t.action === "Reopen") && Sp(e, e.id);
				let n = pp("leave", {
					...e,
					...mp(e, t.action, t.reason),
					status: t.action === "Approve" ? "Approved" : t.action === "Decline" ? "Declined" : t.action === "Cancel" ? "Cancelled" : "Pending"
				});
				return n.status === "Approved" && Tp(e.employeeId), n;
			});
		},
		saveRun(e) {
			up();
			let t = x({
				...cp,
				...lp,
				values: Jf
			}).strict().parse(e);
			return gp(t, "runs", () => {
				let e = t.id ? J("runs", t.id) : void 0;
				if (hp(e, t.expectedRevision), e && e.status !== "Draft") throw Error("Only a draft pay run can be recalculated.");
				let n = Dp(t.values, e?.id);
				return pp("runs", {
					...t.values,
					...mp(e, e ? "Recalculated" : "Created", t.reason),
					...n,
					status: "Draft"
				});
			});
		},
		changeRun(e) {
			let t = x({
				...cp,
				id: K,
				expectedRevision: y().int().positive(),
				action: o([
					"Approve",
					"Reopen",
					"Cancel",
					"Post",
					"Reverse"
				]),
				date: jf.optional()
			}).strict().parse(e);
			return up(t.action === "Approve" ? "payroll.approve" : ["Post", "Reverse"].includes(t.action) ? "payroll.post" : "payroll.manage"), gp(t, "runs", () => {
				let e = J("runs", t.id);
				if (hp(e, t.expectedRevision), t.action === "Approve" || t.action === "Post") {
					if (e.status !== (t.action === "Approve" ? "Draft" : "Approved")) throw Error("Invalid pay-run transition.");
					if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Confirm reviewed withholding and provide its reference.");
					if (e.sourceToken !== Ep()) throw Error("Payroll sources changed. Reopen and recalculate the run.");
					if (sp(Dp(Jf.parse(Object.fromEntries(Object.keys(Jf.shape).map((t) => [t, e[t]]))), e.id).slips) !== sp(e.slips)) throw Error("Payroll calculation changed. Recalculate the run.");
				}
				if (t.action === "Approve") return pp("runs", {
					...e,
					...mp(e, "Approved", t.reason),
					status: "Approved"
				});
				if (t.action === "Reopen") {
					if (e.status !== "Approved") throw Error("Only an approved run can be reopened.");
					return pp("runs", {
						...e,
						...mp(e, "Reopened", t.reason),
						status: "Draft",
						taxReviewed: !1
					});
				}
				if (t.action === "Cancel") {
					if (!["Draft", "Approved"].includes(e.status)) throw Error("Only an unposted run can be cancelled.");
					return pp("runs", {
						...e,
						...mp(e, "Cancelled", t.reason),
						status: "Cancelled"
					});
				}
				if (j(), t.action === "Post") {
					let n = P.post({
						journalDate: e.payDate,
						description: "Payroll " + e.name,
						reference: e.id,
						sourceType: "PAYROLL",
						sourceId: e.id,
						lines: Op(e)
					}), r = pp("runs", {
						...e,
						...mp(e, "Posted", t.reason),
						status: "Posted",
						journalId: n.id
					});
					return e.slips.forEach((e) => Tp(e.employee.id)), r;
				}
				if (e.status !== "Posted" || !t.date || t.date < e.payDate) throw Error("Reverse a posted run on or after its pay date.");
				if (q.payments.some((t) => t.runId === e.id && t.status === "Posted")) throw Error("Reverse recorded payroll payments before reversing the run.");
				let n = P.reverse({
					journalEntryId: e.journalId,
					reversalDate: t.date,
					reason: t.reason
				}), r = pp("runs", {
					...e,
					...mp(e, "Reversed", t.reason),
					status: "Reversed",
					reversalJournalId: n.id,
					reversalDate: t.date
				});
				e.slips.forEach((e) => Tp(e.employee.id));
				for (let n of q.filings.filter((t) => t.runId === e.id)) pp("filings", {
					...n,
					...mp(n, "Correction needed", t.reason),
					status: "Correction needed"
				});
				return r;
			});
		},
		recordPayment(t) {
			up("payroll.post"), E.require("banking.write");
			let n = x({
				...cp,
				runId: K,
				accountId: K,
				bankAccountId: K,
				date: jf,
				amount: Nf.refine((e) => e > 0),
				reference: e().trim().max(200)
			}).strict().parse(t);
			return gp(n, "payments", () => {
				j();
				let e = J("runs", n.runId);
				if (e.status !== "Posted" || n.date < e.payDate) throw Error("Record payment against a posted run on or after pay date.");
				let t = kp(e).find((e) => e.accountId === n.accountId);
				if (!t || n.amount > rp(t.amount - t.paid)) throw Error("Payment exceeds the outstanding payroll liability.");
				_p(n.accountId, "LIABILITY");
				let r = F.requireById(n.bankAccountId), i = N.requireById(r.glAccountId);
				if (!r.active || !i.active || i.type !== "ASSET" || r.currency !== e.settings.currency || n.date < r.openingBalanceDate) throw Error("Use an active bank in the payroll currency with a valid posting date.");
				let a = mp(void 0, "Payment recorded", n.reason), o = P.post({
					journalDate: n.date,
					description: "Payroll payment " + e.name,
					reference: n.reference,
					sourceType: "PAYROLL_PAYMENT",
					sourceId: a.id,
					lines: [{
						accountId: n.accountId,
						debit: n.amount,
						credit: 0
					}, {
						accountId: r.glAccountId,
						debit: 0,
						credit: n.amount
					}]
				}), { reason: s, ...c } = n;
				return pp("payments", {
					...c,
					...a,
					status: "Posted",
					journalId: o.id
				});
			});
		},
		reversePayment(e) {
			up("payroll.post"), E.require("banking.write");
			let t = x({
				...cp,
				id: K,
				expectedRevision: y().int().positive(),
				date: jf
			}).strict().parse(e);
			return gp(t, "payments", () => {
				j();
				let e = J("payments", t.id);
				if (hp(e, t.expectedRevision), e.status !== "Posted" || t.date < e.date) throw Error("Reverse a posted payment on or after its date.");
				Et("PAYROLL_PAYMENT", e.id);
				let n = P.reverse({
					journalEntryId: e.journalId,
					reversalDate: t.date,
					reason: t.reason
				});
				return pp("payments", {
					...e,
					...mp(e, "Payment reversed", t.reason),
					status: "Reversed",
					reversalJournalId: n.id,
					reversalDate: t.date
				});
			});
		},
		recordFiling(t) {
			up();
			let n = x({
				...cp,
				runId: K,
				expectedRevision: y().int().nonnegative(),
				reference: e().trim().max(200),
				notes: e().trim().max(1e3)
			}).strict().parse(t);
			return gp(n, "filings", () => {
				let e = J("runs", n.runId);
				if (e.status !== "Posted") throw Error("Prepare filing review only for a posted run.");
				let t = q.filings.find((t) => t.runId === e.id);
				return hp(t, n.expectedRevision), pp("filings", {
					...mp(t, "Filing review recorded", n.reason),
					runId: e.id,
					runRevision: e.revision,
					reference: n.reference,
					notes: n.notes,
					status: n.reference ? "External reference recorded" : "Prepared"
				});
			});
		},
		exportSlip(e) {
			up("payroll.read");
			let t = x({
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
			up("payroll.read");
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
				String(rp(e.totals.deductions - e.totals.withholding)),
				String(e.totals.net),
				String(e.totals.employerCost),
				t.reviewReference
			])];
			return {
				name: "Payroll-review-" + t.id + ".csv",
				csv: Af(n)
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
		let n = tp.parse(e), r = t, i = r.accounts.accounts, a = r.journals.journalEntries, o = r.bankAccounts.bankAccounts, s = (e, t) => {
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
				t.set(n.accountId, [rp(e[0] + n.debit), rp(e[1] + n.credit)]);
			}
			return [...t].filter(([, e]) => e[0] || e[1]).sort(([e], [t]) => e.localeCompare(t));
		};
		function d(e, t, n, r, i, o, s, c) {
			let l = a.find((t) => t.id === e);
			if (!l || l.sourceType !== t || l.sourceId !== n || l.journalDate !== r || sp(u(l.lines)) !== sp(u(i)) || l.status !== (o ? "REVERSED" : "POSTED")) throw Error("Payroll source journal mismatch.");
			if (o) {
				let e = a.find((e) => e.id === s);
				if (!e || e.reversedJournalEntryId !== l.id || l.reversalJournalEntryId !== e.id || e.journalDate !== c || sp(u(e.lines)) !== sp(u(i.map((e) => ({
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
				let i = rp(t.lines.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
				for (let e of t.lines) {
					s("items", e.item.id), c(e.item.accountId, [
						"Earnings",
						"Allowance",
						"Employer contribution"
					].includes(e.item.category) ? "EXPENSE" : "LIABILITY"), e.item.category === "Employer contribution" && c(e.item.liabilityAccountId, "LIABILITY");
					let t = e.item.method === "Percentage" ? rp(i * e.rate / 100) : rp(e.quantity * e.rate);
					if (e.amount !== t) throw Error("Payroll line calculation mismatch.");
				}
				if (t.employee.taxScale !== "Manual" && (!t.employee.standardTaxConfirmed || r.withholding !== 0)) throw Error("Automatic PAYG declaration mismatch.");
				let a = t.lines.filter((t) => t.item.id === e.settings.superItemId), o = t.lines.filter((e) => e.item.category === "Tax");
				if (a.length !== 1 || a[0].amount !== (r.superMethod === "12% reviewed QE" ? rp(r.superBase * .12) : r.superAmount) || o.length !== 1 || o[0].item.id !== e.settings.taxItemId || new Set(t.timeIds).size !== t.timeIds.length || new Set(t.leaveIds).size !== t.leaveIds.length) throw Error("Payroll tax, super or source snapshot mismatch.");
				let l = rp((t.employee.taxScale === "Manual" ? r.withholding : ef(t.totals.taxable, t.employee.taxScale, e.settings.frequency, e.payDate)) + r.additionalWithholding);
				if (sp(ip(t.lines)) !== sp(t.totals) || t.totals.withholding !== l) throw Error("Payroll payslip totals mismatch.");
				for (let [n, r] of [["timesheets", t.timeIds], ["leave", t.leaveIds]]) for (let i of r) {
					let r = s(n, i);
					if (r.employeeId !== t.employee.id) throw Error("Payroll hours belong to another employee.");
					if (dp(e)) {
						if (f.has(i) || r.status !== "Approved") throw Error("Payroll source is reused or unapproved.");
						let a = n === "timesheets" ? r.date : r.start, o = n === "timesheets" ? r.date : r.end;
						if (bp(t.employee, a, o), a < e.start || o > e.end) throw Error("Payroll source dates are outside the pay period.");
						let s = n === "timesheets" ? "Time:" : "Leave:", c = t.employee.basis === "Hourly" && (n === "timesheets" || r.type !== "Unpaid"), l = t.lines.filter((e) => e.source === s + i);
						if (c ? l.length !== 1 || l[0].quantity !== r.hours || l[0].item.id !== (n === "timesheets" ? r.itemId : t.employee.earningItemId) : l.length !== 0) throw Error("Payroll source hours do not match the frozen payslip.");
						f.add(i);
					}
				}
			}
			if (sp(ap(e.slips)) !== sp(e.totals)) throw Error("Payroll run totals mismatch.");
			if (["Posted", "Reversed"].includes(e.status)) {
				if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Posted payroll has no withholding review.");
				d(e.journalId, "PAYROLL", e.id, e.payDate, Op(e), e.status === "Reversed", e.reversalJournalId, e.reversalDate);
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
			for (let n of Op(e).filter((e) => e.credit)) t.set(n.accountId, rp((t.get(n.accountId) ?? 0) + n.credit));
			for (let [r, i] of t) if (rp(n.payments.filter((t) => t.runId === e.id && t.accountId === r && t.status === "Posted").reduce((e, t) => e + t.amount, 0)) > i) throw Error("Payroll liabilities are overpaid.");
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
			if (p.add(e.operationId), e.input.operationId !== e.operationId || sp({
				input: e.input,
				actorId: e.actorId
			}) !== e.fingerprint) throw Error("Invalid payroll operation fingerprint.");
			if (s(e.entity, e.recordId).revision < e.revision) throw Error("Invalid payroll operation revision.");
		}
	}
});
//#endregion
//#region electron/security/documentRecycleRepository.ts
var Ap = e().trim().min(1).max(200), jp = e().regex(/^[a-f0-9]{64}$/), Mp = (e) => Array.isArray(e) ? e.map(Mp) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, Mp(e[t])])) : e, Np = (e) => Ee("sha256").update(JSON.stringify(Mp(e))).digest("hex"), Pp = (e) => e === "Purchase order" || e === "Expense bill draft" ? "purchases.read" : "sales.read", Fp = (e) => e === "Quote" ? "sales.write" : e === "Purchase order" ? "purchases.write" : e === "Expense bill draft" ? "purchases.bill" : "sales.manage";
function Ip(e, t) {
	let [n, r] = ve[e];
	return (t[n]?.[r] ?? []).filter((t) => e === "Sales order draft" ? t.kind === "ORDER" : e !== "Invoice draft" || t.kind === "INVOICE");
}
function Lp(e, t, n) {
	let r = Ip(e, n).find((e) => e.id === t);
	if (!r) throw Error("Document was not found in the selected dataset.");
	return r;
}
function Rp(e, t, n) {
	let r = [];
	(t.status !== "DRAFT" || t.documentId) && r.push("Only unapproved, unposted drafts can be recycled.");
	let i = (e) => e === t.id || (Array.isArray(e) ? e.some(i) : !!e && typeof e == "object" && Object.values(e).some(i)), [a, o] = ve[e];
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
function zp(e, n = t()) {
	return ce.filter((t) => _(e, Pp(t))).flatMap((t) => Ip(t, n).map((r) => {
		let i = te().findLast((e) => e.recordId === r.id), a = t === "Purchase order" || t === "Expense bill draft", o = a ? r.supplierId ?? r.payload?.supplierId : r.customerId ?? r.payload?.customerId;
		return {
			kind: t,
			party: (a ? n.suppliers?.suppliers : n.customers?.customers)?.find((e) => e.id === o)?.businessName ?? o ?? "",
			reference: r.customerReference ?? r.payload?.customerReference ?? r.payload?.supplierInvoiceNumber ?? r.supplierReference ?? "",
			recordId: r.id,
			label: r.documentNumber ?? r.purchaseOrderNumber ?? `${r.kind} · ${r.id}`,
			date: r.documentDate ?? r.orderDate ?? r.payload?.documentDate ?? "",
			status: r.status,
			total: r.totals.total,
			token: Np({
				record: r,
				lifecycle: i?.id ?? ""
			}),
			deleted: i?.action === "Trashed",
			last: i,
			canWrite: _(e, Fp(t)),
			issues: Rp(t, r, n)
		};
	}));
}
var Bp = x({
	operationId: Ap,
	action: o(["Trashed", "Recovered"]),
	reason: e().trim().min(3).max(2e3),
	records: u(x({
		kind: o(ce),
		recordId: Ap,
		token: jp
	}).strict()).min(1).max(100)
}).strict(), Vp = x({
	id: Ap,
	operationId: Ap,
	fingerprint: jp,
	kind: o(ce),
	recordId: Ap,
	action: o(["Trashed", "Recovered"]),
	actorId: Ap,
	at: Oe(),
	reason: e().trim().min(3).max(2e3),
	recordToken: jp,
	contentToken: jp
}).strict();
i("documentRecycle", {
	repository: {
		list() {
			return zp(E.require("inventory.read"));
		},
		detail(e, n) {
			return e = o(ce).parse(e), E.require("inventory.read"), E.require(Pp(e)), structuredClone(Lp(e, Ap.parse(n), t()));
		},
		change(e) {
			let n = Bp.parse(e), r = E.require("inventory.read");
			n.records.forEach((e) => {
				E.require(Pp(e.kind)), E.require(Fp(e.kind));
			});
			let i = Np({
				input: n,
				actorId: r.userId
			}), a = te().filter((e) => e.operationId === n.operationId);
			if (a.length) {
				if (a[0].fingerprint !== i) throw Error("Operation ID has different recycle data.");
				return structuredClone(a);
			}
			let o = t(), s = /* @__PURE__ */ new Set();
			for (let e of n.records) {
				if (s.has(e.recordId)) throw Error("Select each document only once.");
				s.add(e.recordId);
				let t = Lp(e.kind, e.recordId, o);
				if (Np({
					record: t,
					lifecycle: te().findLast((t) => t.recordId === e.recordId)?.id ?? ""
				}) !== e.token) throw Error("Document changed. Refresh and review the selection again.");
				if (ge(e.recordId) !== (n.action === "Recovered")) throw Error("Document recycle state changed. Refresh the selection.");
				let r = Rp(e.kind, t, o);
				if (r.length) throw Error(r.join(" "));
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
				contentToken: Np(Lp(e.kind, e.recordId, o))
			}));
			return pe([...te(), ...l]), structuredClone(l);
		}
	},
	read: "inventory.read",
	commands: {
		list: "inventory.read",
		detail: "inventory.read",
		change: "inventory.read"
	},
	snapshot: () => ({ history: te() }),
	restore: (e) => pe(e.history),
	publish: () => {},
	view: (e) => ({ history: te().filter((t) => _(e, Pp(t.kind))) }),
	validate: (e, t) => {
		let { history: n } = x({ history: u(Vp) }).strict().parse(e), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
		for (let e of n) {
			if (r.has(e.id)) throw Error("Duplicate recycle event.");
			r.add(e.id);
			let o = Lp(e.kind, e.recordId, t);
			if ((i.get(e.recordId) ?? "Recovered") === e.action) throw Error("Invalid recycle lifecycle sequence.");
			if (!n.slice(n.indexOf(e) + 1).some((t) => t.recordId === e.recordId) && e.action === "Trashed" && (Rp(e.kind, o, t).length || Np(o) !== e.contentToken)) throw Error("Recycled document content or references changed.");
			i.set(e.recordId, e.action), a.set(e.operationId, [...a.get(e.operationId) ?? [], e]);
		}
		for (let e of a.values()) {
			let t = e[0], n = e.map((e) => ({
				kind: e.kind,
				recordId: e.recordId,
				token: e.recordToken
			}));
			if (new Set(n.map((e) => e.recordId)).size !== n.length || e.some((e) => e.fingerprint !== t.fingerprint || e.action !== t.action || e.actorId !== t.actorId || e.at !== t.at || e.reason !== t.reason) || Np({
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
var Hp = ["ACTIVE", "INACTIVE"], Up = e().trim().refine((t) => t === "" || e().email().safeParse(t).success, { message: "Enter a valid email address" }), Wp = e().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Gp = x({
	businessName: e().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: e().trim().max(120, "Trading name is too long"),
	abn: Wp,
	status: o(Hp),
	email: Up,
	phone: e().trim().max(40, "Phone number is too long"),
	website: e().trim().max(200, "Website is too long"),
	contactName: e().trim().max(120, "Contact name is too long"),
	addressLine1: e().trim().max(160, "Address is too long"),
	addressLine2: e().trim().max(160, "Address is too long"),
	suburb: e().trim().max(100, "Suburb is too long"),
	state: e().trim().max(50, "State is too long"),
	postcode: e().trim().max(20, "Postcode is too long"),
	country: e().trim().min(1, "Country is required").max(100, "Country is too long"),
	paymentTermsDays: y({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days"),
	taxRegistered: he(),
	notes: e().trim().max(2e3, "Notes are too long")
}), Kp = x({
	id: e().min(1),
	code: o([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET",
		"HOUR",
		"JOB"
	]),
	name: e().trim().min(1),
	symbol: e().min(1),
	conversionToBase: y().finite().positive(),
	basePrice: y().finite().nonnegative(),
	isBaseUnit: he(),
	active: he()
}).strict(), qp = x({
	id: e().min(1),
	sku: e().trim().min(1).max(80),
	name: e().trim().min(1).max(180),
	category: o([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: e().optional(),
	collection: e().optional(),
	description: e().optional(),
	status: o(["ACTIVE", "INACTIVE"]),
	baseUnitId: e().min(1),
	units: u(Kp).min(1),
	createdAt: e(),
	updatedAt: e(),
	revision: y().int().nonnegative().optional(),
	itemType: o([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: he().optional(),
	sellEnabled: he().optional(),
	reorderPoint: y().finite().nonnegative().optional(),
	targetStock: y().finite().nonnegative().optional(),
	wholePacks: he().optional(),
	taxCode: e().min(1).optional()
}).strict(), Jp = /* @__PURE__ */ new Set(), Yp = [...Ir];
function Xp() {
	Yp = [...Ir], Jp.forEach((e) => e());
}
function Zp(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => Zp(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => Zp(e, t, n));
}
function Qp(e) {
	let t = u(qp).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), !Nr(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!Nr(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (Nr(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
var $p = {
	subscribe(e) {
		return Jp.add(e), () => {
			Jp.delete(e);
		};
	},
	getSnapshot: () => Yp,
	getAll: () => Ir,
	getById: (e) => Ir.find((t) => t.id === e),
	save(e, n) {
		let r = qp.parse(e), i = Ir.find((e) => e.id === r.id);
		if (i && n !== (i.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
		if (!i && n !== void 0) throw Error("Product no longer exists.");
		if (se(r.taxCode ?? "GST"), !Nr(r) && r.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
		let a = t();
		if (delete a.products, i) {
			let e = { ...a };
			if (delete e.costingPolicies, (i.itemType ?? "STOCK") !== (r.itemType ?? "STOCK") && Zp(e, r.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
			if (i.baseUnitId !== r.baseUnitId && Zp(a, r.id)) throw Error("A referenced product cannot change base unit.");
			for (let e of i.units) {
				let t = r.units.find((t) => t.id === e.id);
				if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && Zp(a, r.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
			}
		}
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			...r,
			createdAt: i?.createdAt ?? o,
			updatedAt: o,
			revision: (i?.revision ?? 0) + 1
		};
		return Qp([...Ir.filter((e) => e.id !== r.id), s]), i ? Ir.splice(Ir.indexOf(i), 1, s) : Ir.push(s), Wo.ensureProductPolicy(s.id, s.baseUnitId, Nr(s)), i && Nr(i) !== Nr(s) && Wo.setActive(s.id, Nr(s)), Xp(), s;
	}
};
i("products", {
	validate: (e, t) => {
		let n = Qp(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !Nr(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: $p,
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(Ir) }),
	restore: (e) => {
		let t = Qp(e.products);
		Ir.splice(0, Ir.length, ...t), Yp = [...Ir];
	},
	publish: Xp
});
//#endregion
//#region electron/security/transferRepository.ts
var em = e().trim().min(1).max(200), tm = e().trim().min(1).max(2e3), nm = (e) => Array.isArray(e) ? e.map(nm) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e < t ? -1 : +(e > t)).map(([e, t]) => [e, nm(t)])) : e, rm = (e) => Ee("sha256").update(JSON.stringify(nm(e))).digest("hex"), im = [], am = (e, t = !1) => {
	E.require("inventory.read");
	let n = E.require(Df[e].read);
	return t && E.require(Df[e].write), n.userId;
};
function om(e) {
	return e === "Customers" ? I.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Suppliers" ? qa.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Products" ? $p.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : I.getAll().flatMap((t) => (e === "Customer branches" ? t.locations : t.contacts).map((e) => ({
		id: e.id,
		parentId: t.id,
		raw: e
	})));
}
function sm(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(Tf[e])) n[r] = String(t.raw[r] ?? i);
	if ((e === "Customer branches" || e === "Customer contacts") && (n.customerId = t.parentId), e === "Products") {
		let e = t.raw;
		n.taxCode = e.taxCode ?? "", n.itemType = e.itemType ?? "STOCK", n.buyEnabled = String(e.buyEnabled ?? (e.itemType === void 0 || e.itemType === "STOCK")), n.baseUnitCode = e.units.find((t) => t.id === e.baseUnitId).code, n.unitsJson = JSON.stringify(e.units);
	}
	return n;
}
function cm(e, t) {
	return {
		_format: Cf,
		id: t.id,
		recordToken: rm({
			parentId: t.parentId,
			record: t.raw
		}),
		externalId: im.filter((t) => t.dataset === e).flatMap((e) => e.results).find((e) => e.action === "Created" && e.recordId === t.id)?.externalId ?? "",
		...sm(e, t)
	};
}
function lm(e, t) {
	if (!/^-?\d+(?:\.\d+)?$/.test(e) || !Number.isFinite(Number(e)) || Math.abs(Number(e)) > 2 ** 53 - 1) throw Error(`${t} must contain a safe plain number.`);
	return Number(e);
}
function um(e, t, n) {
	let r = n ? sm(e, n) : { ...Tf[e] };
	for (let n of Object.keys(Tf[e])) if (Object.hasOwn(t, n)) {
		let i = t[n].trim();
		if (typeof Tf[e][n] == "number") r[n] = lm(i, n);
		else if (typeof Tf[e][n] == "boolean") {
			if (!["true", "false"].includes(i)) throw Error(`${n} must be true or false.`);
			r[n] = i === "true";
		} else r[n] = i.trim();
	}
	if (n) for (let [n, i] of Object.entries(Tf[e])) Object.hasOwn(t, n) || (typeof i == "number" && (r[n] = Number(r[n])), typeof i == "boolean" && (r[n] = r[n] === "true"));
	return r;
}
var dm = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), fm = (e, t) => e.some((e) => e.reasons.some((n) => !t.some((t) => t.id === e.id && t.reasons.includes(n))));
function pm(e, t) {
	return t.map((t) => ({
		id: t.id,
		reasons: [
			...dm(t.businessName) === dm(e.businessName) ? ["Name"] : [],
			...e.email && t.email?.toLowerCase() === e.email.toLowerCase() ? ["Email"] : [],
			...e.abn && dm(t.abn) === dm(e.abn) ? ["Identifier"] : []
		]
	})).filter((e) => e.reasons.length);
}
function mm(t, n, r, i = !1) {
	let a = r.id ? om(t).find((e) => e.id === r.id) : void 0;
	if (n === "Update by ID") {
		if (!a) throw Error("Existing record ID was not found.");
		if (!i && (!r.recordToken || r.recordToken !== cm(t, a).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
	} else if (r.id || r.recordToken) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
	if (n === "Update by ID" && r.externalId && r.externalId !== cm(t, a).externalId) throw Error("External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.");
	let s = n === "Update by ID" ? a : void 0, c = s ? cm(t, s) : null, l = um(t, r, s), d;
	if (t === "Customers") {
		let e = qn.strict().parse(l), t = I.getAll().filter((e) => e.id !== s?.id);
		if (fm(yf({
			kind: "Customer",
			customerId: "",
			values: e
		}, t), s ? yf({
			kind: "Customer",
			customerId: "",
			values: s.raw
		}, t) : [])) throw Error("Possible existing customer duplicate. Use the customer review workflow or explicit ID update.");
		d = s ? I.update(s.id, e) : I.create(e);
	} else if (t === "Suppliers") {
		let e = Gp.strict().parse(l), t = qa.getAll().filter((e) => e.id !== s?.id);
		if (fm(pm(e, t), s ? pm(s.raw, t) : [])) throw Error("Possible existing supplier duplicate. Resolve it before import.");
		d = s ? qa.update(s.id, e) : qa.create(e);
	} else if (t === "Products") {
		let t = u(x({
			id: e().max(200).optional(),
			code: o([
				"M2",
				"LM",
				"BOX",
				"PIECE",
				"ROLL",
				"BUCKET",
				"HOUR",
				"JOB"
			]),
			name: e().trim().min(1).max(120),
			symbol: e().min(1).max(40),
			conversionToBase: y().finite().positive(),
			basePrice: y().finite().nonnegative(),
			isBaseUnit: he(),
			active: he()
		}).strict()).min(1).max(100).parse(JSON.parse(String(l.unitsJson))), n = s?.raw, i = t.map((e) => {
			let t = crypto.randomUUID();
			if (n) {
				if (e.id) {
					if (!n.units.some((t) => t.id === e.id)) throw Error("Unit ID does not belong to this product. Keep exported IDs; use an empty ID for a new unit.");
					t = e.id;
				} else if (!Object.hasOwn(e, "id")) {
					let r = n.units.filter((t) => t.code === e.code);
					if (r.length > 1) throw Error("Ambiguous unit code. Keep the unit IDs from the current export.");
					t = r[0]?.id ?? t;
				}
			}
			return {
				...e,
				id: t
			};
		}), a = i.find((e) => e.code === l.baseUnitCode && e.isBaseUnit);
		if (!a) throw Error("baseUnitCode must identify the primary product unit.");
		let { unitsJson: c, baseUnitCode: f, ...p } = l, m = (/* @__PURE__ */ new Date()).toISOString();
		if (p.taxCode === "" && delete p.taxCode, n) for (let e of [
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
		]) !Object.hasOwn(r, e) && n[e] === void 0 && delete p[e];
		let h = qp.parse({
			...p,
			id: s?.id ?? crypto.randomUUID(),
			baseUnitId: a.id,
			units: i,
			createdAt: n?.createdAt ?? m,
			updatedAt: m
		});
		d = $p.save(h, n?.revision ?? (s ? 0 : void 0));
	} else {
		let e = String(l.customerId), n = I.getById(e);
		if (!n || n.status === "INACTIVE") throw Error("Select an existing, non-inactive parent customer.");
		if (s && s.parentId !== e) throw Error("Existing branch/contact cannot move to a different customer.");
		let { customerId: r, ...i } = l, a = t === "Customer branches" ? "Branch" : "Contact", o = a === "Branch" ? Jn.strict().parse(i) : Yn.strict().parse(i);
		if (fm(yf({
			kind: a,
			customerId: e,
			values: o
		}, [n]).filter((e) => e.id !== s?.id), s ? yf({
			kind: a,
			customerId: e,
			values: s.raw
		}, [n]).filter((e) => e.id !== s.id) : [])) throw Error("Possible existing branch/contact duplicate. Use customer review or explicit ID update.");
		d = a === "Branch" ? s ? I.updateLocation(e, s.id, o) : I.addLocation(e, o) : s ? I.updateContact(e, s.id, o) : I.addContact(e, o);
	}
	let f = om(t).find((e) => e.id === d.id);
	return {
		recordId: d.id,
		before: c,
		after: cm(t, f)
	};
}
function hm(e) {
	if (am(e.dataset, !0), Buffer.byteLength(e.text, "utf8") > 1e6) throw Error("CSV source exceeds 1 MB of UTF-8 text.");
	let n = kf(e), r = new Map(om(e.dataset).map((t) => [t.id, cm(e.dataset, t)])), i = t(), a = rm({
		input: e,
		master: i
	}), o = /* @__PURE__ */ new Set(), s = [], c = [];
	try {
		for (let t of n.rows) {
			let n = t.values, i = (n.externalId ?? "").trim(), a = rm({
				dataset: e.dataset,
				values: Object.fromEntries(Object.keys(Tf[e.dataset]).filter((e) => Object.hasOwn(n, e)).map((e) => [e, n[e]]))
			}), l = e.mode === "Create" ? i : n.id, u = "", d;
			try {
				if (!l) throw Error(e.mode === "Create" ? "externalId is required for safe create retries." : "id is required for explicit updates.");
				if (l.length > 200 || i.length > 200) throw Error("Import identity exceeds 200 characters.");
				if (o.has(l)) throw Error("Repeated identity in this CSV file.");
				if (o.add(l), e.mode === "Create" && (n.id || n.recordToken)) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
				if (e.mode === "Update by ID" && (!r.has(n.id) || n.recordToken !== r.get(n.id).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
				let c = e.mode === "Create" ? im.filter((t) => t.dataset === e.dataset).flatMap((e) => e.results).find((e) => e.action === "Created" && e.externalId === i) : void 0;
				if (c) {
					if (c.identityFingerprint !== a) throw Error("Source externalId already contains different creation data. Use an explicit ID update.");
					let n = om(e.dataset).find((e) => e.id === c.recordId);
					if (!n) throw Error("Prior imported record is missing.");
					d = {
						row: t.row,
						externalId: i,
						recordId: n.id,
						action: "Skipped",
						identityFingerprint: a,
						before: null,
						after: cm(e.dataset, n)
					};
				} else {
					let o = mm(e.dataset, e.mode, n, !0);
					e.mode === "Update by ID" && (o.before = r.get(n.id)), d = {
						row: t.row,
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
				row: t.row,
				externalId: i,
				recordId: d?.recordId ?? n.id ?? "",
				name: n.businessName || n.name || [n.firstName, n.lastName].filter(Boolean).join(" ") || n.sku || n.id || i,
				action: d?.action ?? "Error",
				values: { ...n },
				errors: u ? [u] : []
			});
		}
		for (let t of c) {
			let n = s.find((e) => e.row === t.row);
			if (n) {
				let r = om(e.dataset).find((e) => e.id === n.recordId), a = cm(e.dataset, r);
				if (t.values = Object.fromEntries(Object.keys(Tf[e.dataset]).filter((e) => Object.hasOwn(a, e)).map((e) => [e, a[e]])), e.dataset === "Products") {
					let e = (i.products.products.find((e) => e.id === n.recordId)?.units ?? []).map((e) => e.id);
					t.values.unitsJson = JSON.stringify(JSON.parse(t.values.unitsJson).map((t) => ({
						...t,
						id: e.includes(t.id) ? t.id : "Assigned at commit"
					})));
				}
			}
		}
	} finally {
		f(i);
	}
	return {
		preview: {
			fingerprint: a,
			headers: n.headers,
			mapping: n.mapping,
			unmappedColumns: n.unmappedColumns,
			rows: c,
			valid: c.every((e) => !e.errors.length)
		},
		results: s
	};
}
var gm = {
	review(e) {
		return hm(Of.parse(e)).preview;
	},
	commit(t) {
		let n = Of.extend({
			operationId: em,
			expectedPreview: e().regex(/^[a-f0-9]{64}$/),
			reason: tm
		}).strict().parse(t), r = am(n.dataset, !0), { operationId: i, expectedPreview: a, reason: o, ...s } = n, c = rm({
			source: s,
			reason: o
		}), l = im.find((e) => e.operationId === i);
		if (l) {
			if (l.fingerprint !== c) throw Error("Operation ID already has different import data.");
			return structuredClone(l);
		}
		let u = hm(s);
		if (u.preview.fingerprint !== a) throw Error("Business records or import fields changed. Validate the file again.");
		if (!u.preview.valid) throw Error("Resolve every validation error before committing the batch.");
		let d = kf(s), f = new Set(d.rows.map((e) => e.values.customerId || om(s.dataset).find((t) => t.id === e.values.id)?.parentId || "")), p = (e) => JSON.stringify({
			primaryLocationId: e.primaryLocationId,
			primaryContactId: e.primaryContactId,
			locations: e.locations,
			contacts: e.contacts
		}), m = ["Customer branches", "Customer contacts"].includes(s.dataset) ? I.getAll().filter((e) => f.has(e.id)).map((e) => ({
			customerId: e.id,
			before: p(e)
		})) : [], h = [];
		for (let [e, t] of d.rows.entries()) {
			let n = u.results[e];
			n.action === "Skipped" ? h.push(n) : h.push({
				...n,
				...mm(s.dataset, s.mode, t.values, !0),
				before: n.before
			});
		}
		for (let e of h) {
			let t = om(s.dataset).find((t) => t.id === e.recordId);
			e.after = cm(s.dataset, t), e.action === "Created" && (e.after.externalId = e.externalId);
		}
		let g = {
			id: crypto.randomUUID(),
			operationId: i,
			fingerprint: c,
			dataset: s.dataset,
			mode: s.mode,
			fileName: s.fileName,
			sourceHash: Ee("sha256").update(s.text).digest("hex"),
			actorId: r,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			reason: o,
			results: h,
			parentChanges: m.map((e) => ({
				...e,
				after: p(I.getById(e.customerId))
			})).filter((e) => e.before !== e.after)
		};
		return ym.parse(g), im = [...im, g], structuredClone(g);
	},
	export(e) {
		e = o(xf).parse(e), am(e);
		let t = Ef(e), n = om(e).map((t) => cm(e, t));
		return {
			dataset: e,
			count: n.length,
			csv: Af([t, ...n.map((e) => t.map((t) => e[t] ?? ""))])
		};
	},
	template(e) {
		e = o(xf).parse(e), am(e);
		let t = Ef(e).filter((e) => !["id", "recordToken"].includes(e)), n = {
			_format: Cf,
			externalId: "replace-with-stable-source-id",
			...Object.fromEntries(Object.entries(Tf[e]).map(([e, t]) => [e, String(t)]))
		};
		return (e === "Customers" || e === "Suppliers") && (n.businessName = "Replace company name"), e === "Suppliers" && (n.country = "Replace country"), e === "Customer branches" && (n.name = "Replace branch name", n.addressLine1 = "Replace address", n.suburb = "Replace city", n.state = "Replace region", n.postcode = "Replace postcode", n.country = "Replace country"), e === "Customer contacts" && (n.firstName = "Replace", n.lastName = "Name", n.email = "replace@example.test"), e === "Products" && (n.sku = "REPLACE-SKU", n.name = "Replace product name"), Af([t, t.map((e) => n[e] ?? "")]);
	}
}, _m = p(e(), e()), vm = x({
	row: y().int().min(2).max(501),
	externalId: e().max(200),
	recordId: em,
	action: o([
		"Created",
		"Updated",
		"Skipped"
	]),
	identityFingerprint: e().regex(/^[a-f0-9]{64}$/),
	before: _m.nullable(),
	after: _m
}).strict(), ym = x({
	id: em,
	operationId: em,
	fingerprint: e().regex(/^[a-f0-9]{64}$/),
	dataset: o(xf),
	mode: o(Sf),
	fileName: em,
	sourceHash: e().regex(/^[a-f0-9]{64}$/),
	actorId: em,
	at: e().refine((e) => new Date(e).toISOString() === e),
	reason: tm,
	results: u(vm).min(1).max(500),
	parentChanges: u(x({
		customerId: em,
		before: e().max(5e6),
		after: e().max(5e6)
	}).strict()).max(500)
}).strict();
i("dataTransfers", {
	repository: gm,
	read: "inventory.read",
	commands: {
		review: "inventory.read",
		commit: "inventory.read",
		export: "inventory.read",
		template: "inventory.read"
	},
	snapshot: () => ({ runs: im }),
	restore: (e) => {
		im = e.runs;
	},
	publish: () => {},
	view: (e) => ({ runs: im.filter((t) => _(e, Df[t.dataset].read)) }),
	validate: (t, n) => {
		let r = x({ runs: u(ym) }).strict().parse(t), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
		for (let t of r.runs) {
			if (i.has(t.operationId)) throw Error("Duplicate import operation.");
			i.add(t.operationId);
			let r = t.dataset === "Products" ? n.products.products : t.dataset === "Suppliers" ? n.suppliers.suppliers : n.customers.customers, s = 1;
			for (let e of t.results) {
				if (e.row <= s) throw Error("Import result rows must be ordered.");
				if (s = e.row, !(t.dataset === "Customer branches" ? r.some((t) => t.locations.some((t) => t.id === e.recordId)) : t.dataset === "Customer contacts" ? r.some((t) => t.contacts.some((t) => t.id === e.recordId)) : r.some((t) => t.id === e.recordId)) || e.after.id !== e.recordId || e.before && e.before.id !== e.recordId || e.action === "Updated" && !e.before || e.action !== "Updated" && e.before) throw Error("Invalid imported record reference or before/after audit.");
				if (e.action === "Created") {
					if (t.mode !== "Create" || !e.externalId || a.has(t.dataset + ":" + e.externalId) || o.has(t.dataset + ":" + e.recordId)) throw Error("Invalid import source identity.");
					a.set(t.dataset + ":" + e.externalId, e), o.add(t.dataset + ":" + e.recordId);
				}
				if (e.action === "Skipped") {
					let n = a.get(t.dataset + ":" + e.externalId);
					if (t.mode !== "Create" || !n || n.recordId !== e.recordId || n.identityFingerprint !== e.identityFingerprint) throw Error("Invalid skipped import identity.");
				}
				if (e.action === "Updated" && t.mode !== "Update by ID") throw Error("Invalid import update mode.");
				if (e.before && (Object.keys(e.before).some((e) => !Ef(t.dataset).includes(e)) || e.before._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(e.before.recordToken))) throw Error("Invalid import before-state audit.");
				if (Object.keys(e.after).some((e) => !Ef(t.dataset).includes(e)) || e.after._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(e.after.recordToken)) throw Error("Invalid import audit fields.");
			}
			if (new Set(t.parentChanges.map((e) => e.customerId)).size !== t.parentChanges.length || t.parentChanges.length && !["Customer branches", "Customer contacts"].includes(t.dataset)) throw Error("Invalid import parent audit.");
			for (let n of t.parentChanges) {
				if (!r.some((e) => e.id === n.customerId)) throw Error("Invalid import parent reference.");
				for (let t of [n.before, n.after]) {
					let n = x({
						primaryLocationId: e().optional(),
						primaryContactId: e().optional(),
						locations: u(x({ id: em }).passthrough()),
						contacts: u(x({ id: em }).passthrough())
					}).strict().parse(JSON.parse(t));
					if (n.primaryLocationId && !n.locations.some((e) => e.id === n.primaryLocationId) || n.primaryContactId && !n.contacts.some((e) => e.id === n.primaryContactId)) throw Error("Invalid import primary-record audit.");
				}
			}
		}
	}
});
//#endregion
//#region electron/security/attachmentRepository.ts
var Y = e().trim().min(1).max(200), bm = e().trim().min(1).max(2e3), xm = e().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Sm = x({
	id: Y,
	number: y().int().positive(),
	name: Y,
	mime: Y,
	size: y().int().positive().max(c),
	sha256: e().regex(/^[a-f0-9]{64}$/),
	content: e().max(14e6),
	createdAt: xm,
	createdBy: Y,
	restoredFrom: Y.optional()
}).strict(), Cm = x({
	id: Y,
	title: e().trim().min(1).max(200),
	target: Te,
	revision: y().int().positive(),
	currentVersionId: Y,
	versions: u(Sm).min(1).max(100),
	createdAt: xm,
	createdBy: Y,
	updatedAt: xm,
	updatedBy: Y,
	deletedAt: xm.optional(),
	deletedBy: Y.optional()
}).strict(), wm = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), Tm = x({
	id: Y,
	documentId: Y,
	operationId: Y,
	action: o([
		"Uploaded",
		"Added version",
		"Restored version",
		"Renamed",
		"Trashed",
		"Recovered"
	]),
	actorId: Y,
	at: xm,
	revision: y().int().positive(),
	reason: bm,
	versionId: Y.optional(),
	fingerprint: e().regex(/^[a-f0-9]{64}$/),
	after: x({
		title: Y,
		deleted: he(),
		currentVersionId: Y,
		versionsCount: y().int().positive()
	}).strict()
}).strict(), Em = [], Dm = [];
function Om() {
	return E.require("inventory.read");
}
var km = () => t([...new Set(Object.values(n).map((e) => e.repository))]);
function Am(e, t, n = km()) {
	return m(n, t).find((t) => t.kind === e.kind && t.id === e.id);
}
function jm(e, t = !1) {
	let n = Om(), r = Am(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function Mm(e, t = !1) {
	let n = Em.find((t) => t.id === Y.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return jm(n.target, t), n;
}
var Nm = (e) => Ee("sha256").update(JSON.stringify(e)).digest("hex"), Pm = (e, t) => {
	let n = Am(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function Fm(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function Im(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function Lm(e) {
	if (Em.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function Rm(e, t) {
	let n = Dm.find((t) => t.operationId === e);
	if (!n) return;
	let r = Mm(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return Pm(r, E.current());
}
function zm(e, t, n, r, i, a) {
	return Em = [...Em.filter((t) => t.id !== e.id), e], Dm = [...Dm, {
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
		after: wm(e)
	}], Pm(e, E.current());
}
i("attachments", {
	repository: {
		targets() {
			return m(km(), Om());
		},
		checkTarget(e) {
			return jm(Te.parse(e), !0), !0;
		},
		upload(t) {
			let n = x({
				operationId: Y,
				id: Y.optional(),
				expectedRevision: y().int().nonnegative(),
				target: Te,
				title: Y,
				reason: bm,
				file: x({
					name: Y,
					content: e().max(14e6)
				}).strict()
			}).strict().parse(t), r = jm(n.target, !0), i = a(n.file.name, n.file.content), o = Nm({
				...n,
				file: {
					name: i.name,
					sha256: i.sha256
				}
			}), s = Rm(n.operationId, o);
			if (s) return s;
			let c = n.id ? Mm(n.id, !0) : void 0;
			if (c) {
				if (Fm(c, n.expectedRevision), JSON.stringify(c.target) !== JSON.stringify(n.target)) throw Error("An attachment retains its original business link.");
				if (c.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (c.versions.some((e) => e.sha256 === i.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (c.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (n.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!c && Em.some((e) => !e.deletedAt && e.target.kind === n.target.kind && e.target.id === n.target.id && e.versions.some((e) => e.sha256 === i.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			Lm(i.size);
			let l = (/* @__PURE__ */ new Date()).toISOString();
			c && Im(c, l);
			let u = {
				...i,
				id: crypto.randomUUID(),
				number: (c?.versions.length ?? 0) + 1,
				createdAt: l,
				createdBy: r
			};
			return zm({
				...c ?? {
					id: crypto.randomUUID(),
					target: n.target,
					createdAt: l,
					createdBy: r
				},
				title: c?.title ?? n.title,
				currentVersionId: u.id,
				versions: [...c?.versions ?? [], u],
				revision: (c?.revision ?? 0) + 1,
				updatedAt: l,
				updatedBy: r
			}, c ? "Added version" : "Uploaded", n.operationId, o, n.reason, u.id);
		},
		change(e) {
			let t = x({
				operationId: Y,
				id: Y,
				expectedRevision: y().int().positive(),
				action: o([
					"Renamed",
					"Trashed",
					"Recovered",
					"Restored version"
				]),
				reason: bm,
				title: Y.optional(),
				versionId: Y.optional()
			}).strict().parse(e), n = Mm(t.id, !0), r = Nm(t), i = Rm(t.operationId, r);
			if (i) return i;
			Fm(n, t.expectedRevision);
			let a = jm(n.target, !0), s = (/* @__PURE__ */ new Date()).toISOString();
			Im(n, s);
			let c = {
				...n,
				versions: [...n.versions],
				revision: n.revision + 1,
				updatedBy: a,
				updatedAt: s
			}, l;
			if (t.action === "Trashed") {
				if (n.deletedAt) throw Error("Attachment is already in the recycle bin.");
				c.deletedAt = s, c.deletedBy = a;
			} else if (t.action === "Recovered") {
				if (!n.deletedAt) throw Error("Attachment is not in the recycle bin.");
				delete c.deletedAt, delete c.deletedBy;
			} else {
				if (n.deletedAt) throw Error("Recover the attachment before editing.");
				if (t.action === "Renamed") {
					if (!t.title) throw Error("Enter a document title.");
					c.title = t.title;
				} else {
					let e = n.versions.find((e) => e.id === t.versionId);
					if (!e) throw Error("Version not found.");
					if (e.id === n.currentVersionId) throw Error("That version is already current.");
					if (n.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
					Lm(e.size), d(e);
					let r = {
						...e,
						id: crypto.randomUUID(),
						number: n.versions.length + 1,
						createdAt: s,
						createdBy: a,
						restoredFrom: e.id
					};
					c.versions.push(r), c.currentVersionId = r.id, l = r.id;
				}
			}
			return zm(c, t.action, t.operationId, r, t.reason, l);
		},
		read(e) {
			let t = x({
				id: Y,
				versionId: Y
			}).strict().parse(e), n = Mm(t.id).versions.find((e) => e.id === t.versionId);
			if (!n) throw Error("Version not found.");
			return d(n), { ...n };
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
		documents: Em,
		history: Dm
	}),
	restore: (e) => {
		Em = e.documents, Dm = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = Em.filter((t) => Am(t.target, e));
		return {
			documents: t.map((t) => Pm(t, e)),
			history: Dm.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (e, t) => {
		let r = x({
			documents: u(Cm),
			history: u(Tm)
		}).strict().parse(e), i = /* @__PURE__ */ new Set(), a = 0;
		for (let e of r.documents) {
			let i = n[e.target.kind];
			if (!t[i.repository]?.[i.collection]?.some((t) => t.id === e.target.id)) throw Error("Invalid attachment business reference.");
			if (!!e.deletedAt != !!e.deletedBy) throw Error("Invalid attachment recycle metadata.");
			let o = /* @__PURE__ */ new Set();
			for (let [t, n] of e.versions.entries()) {
				if (d(n), a += n.size, o.has(n.id) || n.number !== t + 1 || n.createdAt < e.createdAt || n.createdAt > e.updatedAt) throw Error("Invalid attachment version history.");
				if (n.restoredFrom && (!o.has(n.restoredFrom) || e.versions.find((e) => e.id === n.restoredFrom)?.sha256 !== n.sha256 || e.versions.find((e) => e.id === n.restoredFrom)?.name !== n.name)) throw Error("Invalid restored attachment version.");
				o.add(n.id);
			}
			if (!o.has(e.currentVersionId)) throw Error("Invalid current attachment version.");
			let s = r.history.filter((t) => t.documentId === e.id);
			if (s.length !== e.revision || s[0].action !== "Uploaded" || s[0].actorId !== e.createdBy || s[0].at !== e.createdAt) throw Error("Invalid attachment audit history.");
			let c = e.createdAt, l = 0, u = !1, f = "", p = "";
			for (let [t, n] of s.entries()) {
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
					f = r.id;
				} else if (n.action === "Trashed") {
					if (u) throw Error("Repeated attachment trash event.");
					u = !0;
				} else if (n.action === "Recovered") {
					if (!u) throw Error("Invalid attachment recovery event.");
					u = !1;
				} else if (u) throw Error("Deleted attachment cannot be renamed.");
				if (n.after.versionsCount !== l || n.after.currentVersionId !== f || n.after.deleted !== u) throw Error("Attachment audit outcome is inconsistent.");
			}
			let m = s.at(-1);
			if (l !== e.versions.length || m.actorId !== e.updatedBy || m.at !== e.updatedAt || JSON.stringify(m.after) !== JSON.stringify(wm(e))) throw Error("Attachment metadata differs from audit.");
			if (e.deletedAt && (e.deletedAt !== m.at || e.deletedBy !== m.actorId)) throw Error("Attachment deletion differs from audit.");
		}
		for (let e of r.history) {
			if (i.has(e.operationId) || !r.documents.some((t) => t.id === e.documentId)) throw Error("Invalid attachment operation identity.");
			i.add(e.operationId);
		}
		if (a > 5e7) throw Error("Attachment library exceeds 50 MB.");
	}
});
//#endregion
//#region src/features/job-costing/jobCostingService.ts
function Bm(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function Vm(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || Bm(a.debit) !== Bm(r.credit) || Bm(a.credit) !== Bm(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = Bm(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function Hm(e, t, n, r, i, a) {
	if (T(i, "From date"), T(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = Vm(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = Bm(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = Bm(t.amount);
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += Bm(r.allocated) : n += Bm(r.allocated);
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
			let t = c(e.id), n = Bm(Math.round(Number(e.budget) * 100) / 100), r = Bm(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (Bm(t.revenue) - n) / 100,
				costVariance: (r - Bm(t.cost)) / 100,
				profitVariance: (Bm(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + Bm(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + Bm(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var Um = e().trim().min(1).max(200), Wm = e().trim().min(1).max(2e3), Gm = e().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Km = x({
	jobId: Um,
	amount: y().finite().positive().refine((e) => {
		try {
			return Bm(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), qm = x({
	id: Um,
	journalId: Um,
	lineId: Um,
	revision: y().int().positive(),
	splits: u(Km).max(100),
	updatedAt: Gm,
	updatedBy: Um
}).strict(), Jm = x({
	id: Um,
	operationId: Um,
	recordId: Um,
	revision: y().int().positive(),
	at: Gm,
	actorId: Um,
	reason: Wm,
	fingerprint: e().max(3e6),
	before: u(Km),
	after: u(Km)
}).strict(), Ym = x({
	operationId: Um,
	journalId: Um,
	lineId: Um,
	expectedRevision: y().int().nonnegative(),
	expectedSource: e().max(2e6),
	splits: u(Km).max(100),
	reason: Wm
}).strict(), Xm = [], Zm = [], Qm = /* @__PURE__ */ new Set(), $m = () => Qm.forEach((e) => e());
function eh(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + Bm(t.amount), 0) > Bm(t)) throw Error("Project splits exceed the source amount.");
}
i("jobCosting", {
	repository: {
		subscribe(e) {
			return Qm.add(e), () => {
				Qm.delete(e);
			};
		},
		getSnapshot: () => Xm,
		review() {
			return E.require("accounting.read"), {
				lines: Vm(P.getAll(), N.getAll()),
				allocations: structuredClone(Xm),
				history: structuredClone(Zm)
			};
		},
		report(t) {
			E.require("accounting.read");
			let n = x({
				from: e(),
				to: e()
			}).strict().parse(t);
			return Hm(P.getAll(), N.getAll(), S.jobs, Xm, n.from, n.to);
		},
		save(e) {
			let t = E.require("accounting.post"), n = Ym.parse(e), r = JSON.stringify(n), i = Zm.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return Xm.find((e) => e.id === i.recordId);
			}
			let a = Vm(P.getAll(), N.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			let o = Xm.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			eh(n.splits, a.capacity, S.jobs);
			for (let e of n.splits) if (S.jobs.find((t) => t.id === e.jobId).status !== "Active" && o?.splits.find((t) => t.jobId === e.jobId)?.amount !== e.amount) throw Error("Only active projects can receive new or changed allocations.");
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
			return Xm = [...Xm.filter((e) => e.id !== c.id), c], Zm = [...Zm, {
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
			}], $m(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: Xm,
		history: Zm
	}),
	restore: (e) => {
		Xm = e.allocations, Zm = e.history;
	},
	publish: $m,
	validate: (e, t) => {
		let n = x({
			allocations: u(qm),
			history: u(Jm)
		}).strict().parse(e), r = t.workspace_jobs.records, i = Vm(t.journals.journalEntries, t.accounts.accounts), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let e of n.allocations) {
			let t = i.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), o = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || a.has(o)) throw Error("Invalid project source reference.");
			a.add(o), eh(e.splits, t.capacity, r);
			let s = n.history.filter((t) => t.recordId === e.id);
			if (s.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], l = "";
			for (let [n, i] of s.entries()) {
				let a = Ym.parse(JSON.parse(i.fingerprint));
				if (i.revision !== n + 1 || i.at < l || JSON.stringify(i.before) !== JSON.stringify(c) || a.journalId !== e.journalId || a.lineId !== e.lineId || a.operationId !== i.operationId || a.expectedRevision !== n || a.reason !== i.reason || JSON.stringify(a.splits) !== JSON.stringify(i.after)) throw Error("Invalid allocation history chain.");
				eh(i.after, t.capacity, r), c = i.after, l = i.at;
			}
			let u = s.at(-1);
			if (JSON.stringify(c) !== JSON.stringify(e.splits) || u.at !== e.updatedAt || u.actorId !== e.updatedBy) throw Error("Allocation outcome differs from audit history.");
		}
		for (let e of n.history) {
			if (o.has(e.operationId) || !n.allocations.some((t) => t.id === e.recordId)) throw Error("Invalid allocation operation reference.");
			o.add(e.operationId);
		}
	}
});
//#endregion
//#region src/features/contact-review/reviewRepository.ts
var th = e().trim().min(1).max(200), nh = e().trim().max(2e3), rh = e().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), ih = x({
	operationId: th,
	kind: o(uf),
	customerId: e().max(200).default(""),
	values: pf,
	source: o(df).default("Manual"),
	externalId: e().trim().max(200).default(""),
	sourceReference: e().trim().max(500).default("")
}).strict(), ah = x({
	id: th,
	action: th,
	actorId: th,
	at: rh,
	reason: nh,
	data: e().max(2e6)
}).strict(), oh = x({
	action: o([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: th,
	at: rh,
	reason: nh,
	fingerprint: e().max(1e4),
	customerId: e(),
	targetId: e(),
	snapshot: ye()
}).strict(), sh = ih.extend({
	id: th,
	state: o([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: y().int().positive(),
	createdBy: th,
	createdAt: rh,
	updatedAt: rh,
	creationFingerprint: e().max(1e5),
	history: u(ah).min(1),
	decision: oh.optional()
}).strict(), ch = [], lh = /* @__PURE__ */ new Set(), uh = () => lh.forEach((e) => e());
function dh() {
	let e = E.require("contacts.write");
	return E.require("sales.read"), e.userId;
}
var fh = () => (/* @__PURE__ */ new Date()).toISOString();
function ph(e) {
	let t = fh();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var mh = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function hh(e) {
	let t = ch.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function gh(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function _h(e) {
	return ch = [...ch.filter((t) => t.id !== e.id), e], uh(), e;
}
function vh(e) {
	let t = ih.parse(e);
	if (t.values = mf(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !I.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function yh(e, t) {
	return e === "Customer" ? qn.strict().parse(t) : e === "Branch" ? Jn.strict().parse(t) : Yn.strict().parse(t);
}
function bh(e, t, n) {
	let r = I.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var xh = {
	subscribe(e) {
		return lh.add(e), () => {
			lh.delete(e);
		};
	},
	getSnapshot: () => ch,
	create(e) {
		let t = dh(), n = vh(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = ch.find((e) => e.operationId === r) || n.externalId && ch.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = fh();
		return _h({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [mh("Received", t, s, "", i)]
		});
	},
	importBatch(e) {
		dh();
		let t = x({
			operationId: th.max(150),
			drafts: u(ih.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(e);
		if (t.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return t.drafts.map((e, n) => xh.create({
			...e,
			operationId: t.operationId + ":" + n
		}));
	},
	update(t) {
		let n = dh(), r = x({
			id: th,
			expectedRevision: y().int().positive(),
			customerId: e().max(200),
			values: pf
		}).strict().parse(t), i = hh(r.id);
		if (gh(i, r.expectedRevision), i.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let a = vh({
			operationId: i.operationId,
			kind: i.kind,
			customerId: r.customerId,
			values: r.values,
			source: i.source,
			externalId: i.externalId,
			sourceReference: i.sourceReference
		}), o = ph(i);
		return _h({
			...i,
			customerId: a.customerId,
			values: a.values,
			revision: i.revision + 1,
			updatedAt: o,
			history: [...i.history, mh("Updated", n, o, "", {
				customerId: a.customerId,
				values: a.values
			})]
		});
	},
	review(e) {
		E.require("sales.read");
		let t = hh(th.parse(e)), n = I.getAll(), r = "";
		try {
			if (yh(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: yf(t, n),
			masterSignature: bf(n),
			validationError: r
		};
	},
	decide(t) {
		let n = dh(), r = x({
			id: th,
			expectedRevision: y().int().positive(),
			action: o([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: nh,
			allowDuplicate: he().default(!1),
			targetId: e().max(200).default(""),
			expectedMaster: e().max(25e6).optional()
		}).strict().parse(t), i = hh(r.id), a = JSON.stringify({
			action: r.action,
			reason: r.reason,
			allowDuplicate: r.allowDuplicate,
			targetId: r.targetId
		});
		if (i.state !== "Pending") {
			if (i.decision?.fingerprint === a) return i;
			throw Error("This draft already has a different decision.");
		}
		gh(i, r.expectedRevision);
		let s = ph(i), c = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (r.action === "Reject") {
			if (!r.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = I.getAll();
			if (r.expectedMaster !== bf(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (r.action === "Link existing") {
				if (!r.reason) throw Error("Explain why this existing record is the correct match.");
				c = bh(i.kind, i.customerId, r.targetId);
			} else {
				if (yf(i, e).length && (!r.allowDuplicate || !r.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = yh(i.kind, i.values);
				if (i.kind === "Customer") {
					let e = I.create(t);
					c = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = I.getById(i.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = i.kind === "Branch" ? I.addLocation(e.id, t) : I.addContact(e.id, t);
					c = {
						customerId: e.id,
						targetId: n.id,
						snapshot: structuredClone(n)
					};
				}
			}
		}
		let l = {
			action: r.action,
			actorId: n,
			at: s,
			reason: r.reason,
			fingerprint: a,
			...c
		};
		return _h({
			...i,
			state: r.action === "Reject" ? "Rejected" : r.action === "Link existing" ? "Linked" : "Approved",
			revision: i.revision + 1,
			updatedAt: s,
			decision: l,
			history: [...i.history, mh(r.action, n, s, r.reason, l)]
		});
	},
	reopen(e) {
		let t = dh(), n = x({
			id: th,
			expectedRevision: y().int().positive(),
			reason: nh.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(e), r = hh(n.id);
		if (gh(r, n.expectedRevision), r.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let i = ph(r), a = {
			...r,
			state: "Pending",
			revision: r.revision + 1,
			updatedAt: i,
			history: [...r.history, mh("Reopened", t, i, n.reason)]
		};
		return delete a.decision, _h(a);
	}
};
i("contactReviews", {
	repository: xh,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: ch }),
	restore: (e) => {
		ch = e.drafts;
	},
	publish: uh,
	validate: (t, n) => {
		let r = x({ drafts: u(sh) }).strict().parse(t), i = n.customers.customers, a = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
		for (let t of r.drafts) {
			let n = mf(t.kind, t.values);
			if (Object.keys(n).length !== Object.keys(t.values).length) throw Error("Missing review draft fields.");
			if (a.has(t.operationId) || t.externalId && s.has(t.source + ":" + t.externalId)) throw Error("Duplicate review intake identity.");
			a.add(t.operationId), t.externalId && s.add(t.source + ":" + t.externalId);
			let r = JSON.parse(t.creationFingerprint);
			if (t.history[0].data !== t.creationFingerprint) throw Error("Review source history is inconsistent.");
			if (r.kind !== t.kind || r.source !== t.source || r.externalId !== t.externalId || r.sourceReference !== t.sourceReference) throw Error("Review intake provenance is inconsistent.");
			if (t.history.length !== t.revision || new Set(t.history.map((e) => e.id)).size !== t.history.length || t.history[0].action !== "Received" || t.history[0].actorId !== t.createdBy || t.history[0].at !== t.createdAt || t.updatedAt < t.createdAt) throw Error("Invalid review history.");
			let c = "Pending", l = t.createdAt;
			for (let [e, n] of t.history.entries()) {
				if (n.at < l || n.at > t.updatedAt) throw Error("Invalid review event time.");
				l = n.at;
				let r = JSON.parse(n.data);
				if (!r || typeof r != "object" || Array.isArray(r)) throw Error("Invalid review event payload.");
				if (e !== 0) {
					if (n.action === "Updated") {
						if (c !== "Pending") throw Error("Invalid review edit history.");
					} else if (n.action === "Reopened") {
						if (c !== "Rejected" || !n.reason) throw Error("Invalid review reopen history.");
						c = "Pending";
					} else if ([
						"Approve new",
						"Link existing",
						"Reject"
					].includes(n.action)) {
						if (c !== "Pending") throw Error("Invalid repeated review decision.");
						c = n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved";
					} else throw Error("Unknown review history action.");
				}
			}
			if (c !== t.state || t.history.at(-1).at !== t.updatedAt) throw Error("Review history does not match current state.");
			if (t.kind === "Customer" && t.customerId || t.customerId && !i.some((e) => e.id === t.customerId)) throw Error("Review parent customer is invalid.");
			if (t.state === "Pending" != !t.decision) throw Error("Review state and decision are inconsistent.");
			if (t.decision) {
				let n = t.state === "Rejected" ? "Reject" : t.state === "Linked" ? "Link existing" : "Approve new", r = x({
					action: o([
						"Approve new",
						"Link existing",
						"Reject"
					]),
					reason: nh,
					allowDuplicate: he(),
					targetId: e()
				}).strict().parse(JSON.parse(t.decision.fingerprint)), a = t.history.at(-1);
				if (r.action !== n || r.reason !== t.decision.reason || r.targetId !== (n === "Link existing" ? t.decision.targetId : "") || a.actorId !== t.decision.actorId || a.at !== t.decision.at || a.reason !== t.decision.reason || JSON.stringify(JSON.parse(a.data)) !== JSON.stringify(t.decision)) throw Error("Review decision audit is inconsistent.");
				if (t.decision.action !== n) throw Error("Invalid review decision.");
				if (n !== "Reject") {
					let e = i.find((e) => e.id === t.decision.customerId), r = t.kind === "Customer" ? e : t.kind === "Branch" ? e?.locations.find((e) => e.id === t.decision.targetId) : e?.contacts.find((e) => e.id === t.decision.targetId);
					if (!r || r.id !== t.decision.targetId || t.kind !== "Customer" && e.id !== t.customerId || t.decision.snapshot?.id !== r.id) throw Error("Invalid resolved review reference.");
					n === "Approve new" && yh(t.kind, t.values);
				} else if (!t.decision.reason || t.decision.customerId || t.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function Sh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ch(e, t) {
	T(e, t);
}
function wh(e, t, n, r) {
	if (Ch(n, "From date"), Ch(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = Th(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = Th(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = Sh(a.reduce((e, t) => e + t.amount, 0)), c = Sh(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = Sh(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = Sh(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = Sh(d - f);
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
		operatingExpenses: Sh(c - f),
		totalExpenses: c,
		netProfit: Sh(s - c)
	};
}
function Th(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = Sh(r + t.debit), i = Sh(i + t.credit));
		let a = Sh(n === "REVENUE" ? i - r : r - i);
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
function Eh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Dh(e) {
	T(e);
}
function Oh(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = Eh(n + t.debit), r = Eh(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? Eh(n - r) : Eh(r - n);
}
function kh(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: Oh(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function Ah(e) {
	return Eh(e.reduce((e, t) => e + t.amount, 0));
}
function jh(e, t, n) {
	Dh(n);
	let r = t.filter((e) => e.journalDate <= n), i = kh(e, r, "ASSET"), a = kh(e, r, "LIABILITY"), o = kh(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = Eh(s.reduce((e, t) => e + Oh(t, r), 0)), u = Eh(c.reduce((e, t) => e + Oh(t, r), 0)), d = Ah(i), f = Ah(a), p = Ah(o), m = Eh(l - u), h = Eh(p + m), g = Eh(f + h), _ = Eh(d - g);
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
function Mh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Nh(e, t) {
	T(e, t);
}
function Ph(e, t) {
	let n = Mh(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: Mh(Math.abs(n))
	};
}
function Fh(e, t, n, r) {
	if (Nh(n, "From date"), Nh(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = Mh(i + t.debit), a = Mh(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = Mh(o + t.debit), s = Mh(s + t.credit));
		}
		let c = Ph(i, a), l = Ph(Mh(i + o), Mh(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = Mh(i.reduce((e, t) => e + t.openingDebit, 0)), o = Mh(i.reduce((e, t) => e + t.openingCredit, 0)), s = Mh(i.reduce((e, t) => e + t.periodDebit, 0)), c = Mh(i.reduce((e, t) => e + t.periodCredit, 0)), l = Mh(i.reduce((e, t) => e + t.closingDebit, 0)), u = Mh(i.reduce((e, t) => e + t.closingCredit, 0)), d = Mh(l - u);
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
var Ih = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], Lh = (e) => Math.round(e * 100), Rh = (e) => e / 100;
function zh(e) {
	switch (e.sourceType) {
		case "CUSTOMER_DEPOSIT":
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return Ih[0];
		case "CUSTOMER_DEPOSIT_REFUND":
		case "CUSTOMER_REFUND": return Ih[1];
		case "SUPPLIER_PREPAYMENT":
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return Ih[2];
		case "SUPPLIER_PREPAYMENT_REFUND":
		case "SUPPLIER_REFUND": return Ih[3];
		case "OPENING_BALANCE": return Ih[4];
		case "BANK_TRANSFER": return Ih[5];
		default: return Ih[6];
	}
}
function Bh(e) {
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
		let n = _t(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? Lh(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = Lh(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: Ih[4],
				moneyIn: Rh(Math.max(e, 0)),
				moneyOut: Rh(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		let l = n.transactions.filter((t) => t.correctionOnly && t.transactionDate >= e.from).length;
		l && i.push(`${t.name}: ${l} internal correction lines remain visible in the bank register and are excluded from cash movement totals.`), n.transactions.some((e) => e.correctionIssue) && i.push(`${t.name}: bank journal or categorisation correction evidence requires review. Its ledger movements remain included; no historical amount or date is silently changed.`);
		for (let i of n.transactions) {
			if (i.correctionOnly) continue;
			if (i.transactionDate < e.from) {
				o += Lh(i.moneyIn) - Lh(i.moneyOut);
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
				category: zh(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += Lh(i.moneyIn), c += Lh(i.moneyOut);
		}
		let u = Lh(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: Rh(o),
			moneyIn: Rh(s),
			moneyOut: Rh(c),
			closing: Rh(u),
			difference: Rh(o + s - c - u)
		};
	}), s = new Map(Ih.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === Ih[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + Lh(e.moneyIn) - Lh(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += Lh(e.moneyIn), t.moneyOut += Lh(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(Ih[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: Rh(e.moneyIn),
		moneyOut: Rh(e.moneyOut),
		net: Rh(e.moneyIn - e.moneyOut)
	})), u = (e) => Rh(o.reduce((t, n) => t + Lh(n[e]), 0)), d = u("opening"), f = u("closing"), p = Rh(l.reduce((e, t) => e + Lh(t.net), 0)), m = a.filter((e) => e.category === Ih[6]).length;
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
		difference: Rh(Lh(d) + Lh(p) - Lh(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var Vh = (e) => Math.round(e * 100);
function Hh(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - Vh(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (Vh(e.subtotal) + Vh(e.tax) !== Vh(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function Uh(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), T(r.date, `Document date (${r.number})`), Hh(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: Vh(r.subtotal) * n / 100,
			tax: Vh(r.tax) * n / 100,
			total: Vh(r.total) * n / 100
		});
		if (n.push(l(r.date, a, i ? "CREDIT" : "DOCUMENT")), r.status === "VOID") {
			if (!r.voidedAt) throw Error(`${r.number}: void date is missing. Review the source record before reporting.`);
			let e = me(r.voidedAt);
			if (T(e, `Void date (${r.number})`), e < r.date) throw Error(`${r.number}: void date precedes the original document.`);
			n.push(l(e, -a, "VOID"));
		}
	}
	return n.sort((e, t) => e.date.localeCompare(t.date) || e.number.localeCompare(t.number) || e.eventId.localeCompare(t.eventId));
}
function Wh(e, t) {
	if (T(t.from, "From date"), T(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = Uh(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + Vh(n[t]), 0) / 100, a = {
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
function Gh(e, t, n) {
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
function Kh(e, t) {
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
var qh = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function Jh(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > qh.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => qh.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${qh.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var Yh = (e) => JSON.stringify(e);
function Xh(e, t, n) {
	if (T(e.periodStart, "From date"), T(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = Jh(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = wh(t.accounts, t.journals, i, a);
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
			let n = jh(t.accounts, t.journals, a);
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
			let n = Fh(t.accounts, t.journals, i, a);
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
			let n = Bh({
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
		let n = e === "Net purchases", r = Wh(n ? Kh(t.bills, t.supplierCredits) : Gh(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: Yh(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function Zh() {
	let e = w();
	return {
		accounts: N.getAll(),
		journals: P.getAll(),
		banks: F.getAll(),
		documents: R.getAll(),
		customerCredits: L.getAll(),
		customers: I.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: js.getAll(),
		supplierCredits: H.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone
		}
	};
}
function Qh(t) {
	let n = E.require("accounting.read"), r = x({
		id: e().trim().min(1).max(200),
		expectedRevision: e().regex(/^\d+$/)
	}).strict().parse(t), i = S["report-packs"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Report pack configuration was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (i.status !== "Active") throw Error("Activate this report pack before generating.");
	return Xh({
		id: i.id,
		revision: i.revision,
		name: i.name,
		cover: i.cover,
		introduction: i.introduction,
		periodStart: i.periodStart,
		periodEnd: i.periodEnd,
		reports: i.reports
	}, Zh(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/saved-reports/savedReportService.ts
var $h = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], X = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), eg = [
	X("date", "Date"),
	X("number", "Document"),
	X("contact", "Contact"),
	X("partyId", "Contact ID"),
	X("activity", "Activity"),
	X("status", "Current status"),
	X("net", "Net", !0),
	X("tax", "Tax", !0),
	X("gross", "Gross", !0)
], tg = {
	Sales: eg,
	Purchases: eg,
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
}, ng = (e) => e === "Banking" ? "Cash" : "Accrual", rg = x({
	from: e(),
	to: e(),
	query: e().max(500).default(""),
	partyId: e().max(200).optional(),
	bankId: e().max(200).optional(),
	accountId: e().max(200).optional(),
	currency: e().min(1).max(10).optional()
}).strict();
function ig(e) {
	let t = o($h).parse(e.dataset);
	if (e.basis !== ng(t)) throw Error(`${t} uses ${ng(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = rg.parse(n);
	if (T(r.from, "From date"), T(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, s = i.map((e) => tg[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > tg[t].length || s.some((e) => !e) || new Set(s.map((e) => e?.key)).size !== s.length) throw Error(`Select distinct supported columns for ${t}: ${tg[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: s
	};
}
var ag = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function og(e, t, n) {
	let { dataset: r, filters: i, columns: a } = ig(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? Gh(t.documents, t.customerCredits, t.customers) : Kh(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = Uh(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = Bh({
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
		value: ag(s, t)
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
		sourceSignature: Yh(t),
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
function sg(t) {
	let n = E.require("accounting.read"), r = x({
		id: e().trim().min(1).max(200),
		expectedRevision: e().regex(/^\d+$/)
	}).strict().parse(t), i = S["custom-reports"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Saved report was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (i.status !== "Active") throw Error("Activate this saved report before running.");
	return og({
		id: i.id,
		revision: i.revision,
		name: i.name,
		dataset: i.dataset,
		columns: i.columns,
		basis: i.basis,
		filter: i.filter,
		favourite: i.favourite
	}, Zh(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var cg = p(e(), e().max(2e4)), lg = [
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
], ug = () => (/* @__PURE__ */ new Date()).toISOString(), dg = {
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
}, fg = /* @__PURE__ */ new Set(), pg = 0, mg = () => {
	pg++, fg.forEach((e) => e());
}, hg = Object.fromEntries(Object.keys(dg).map((e) => [e, []]));
for (let e of Object.keys(dg)) S[e] = [];
var gg = () => ({
	collected: N.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: N.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
S["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: ug(),
	updatedAt: ug(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...gg()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: ug(),
	updatedAt: ug(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...gg()
}];
function _g(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function vg(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function yg(e, t) {
	let n = N.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function bg(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function xg(e, n, r, i = !0) {
	let a = dg[e];
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
	if (Object.keys(n).some((e) => !o.has(e))) throw Error("Unsupported business field.");
	_g(n.name, "Name");
	for (let e of a.required) _g(n[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(n.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (vg(n.rate, "Tax rate"), n.basis && !["Exclusive", "Inclusive"].includes(n.basis)) throw Error("Invalid entry basis.");
		if (i) {
			let e = r.find((e) => e.id === n.id), i = t(), a = S.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (n.status === "Inactive" && n.code === a) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== n.code && (e.code === a || i.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (S["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(n.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (i) {
			let e = yg(n.collected, "LIABILITY"), r = yg(n.paid, "ASSET"), i = (t().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || r.systemRole && r.systemRole !== "GST_RECEIVABLE" || i.includes(r.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (r.some((e) => e.id !== n.id && e.code.toLowerCase() === n.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(n.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && i) {
		let e = N.requireBySystemRole(n.role), r = n.status === "Inactive" ? N.getAll().find((e) => e.systemRole === n.role)?.id : n.accountId, i = t().journals?.journalEntries ?? [];
		if (r !== e.id && i.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === r))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!lg.includes(n.role)) throw Error("Unknown account role.");
		let e = [
			"BANK",
			"ACCOUNTS_RECEIVABLE",
			"INVENTORY",
			"GST_RECEIVABLE"
		].includes(n.role) ? "ASSET" : [
			"GRNI",
			"ACCOUNTS_PAYABLE",
			"GST_PAYABLE"
		].includes(n.role) ? "LIABILITY" : n.role === "SALES_REVENUE" ? "REVENUE" : ["RETAINED_EARNINGS", "OWNERS_EQUITY"].includes(n.role) ? "EQUITY" : "EXPENSE";
		if (i && yg(n.accountId, e), r.some((e) => e.id !== n.id && e.role === n.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = Lr(n.productId);
		if (i && (!e || !Rr(e.id, n.unitId))) throw Error("Product/unit not found.");
		if (vg(n.price, "Price"), !Number.isInteger(Number(n.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(n.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(n.starts) || !Number.isFinite(Date.parse(n.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(n.ends) || !Number.isFinite(Date.parse(n.ends)) || Date.parse(n.ends) <= Date.parse(n.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (i && n.customerId && !I.getById(n.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (vg(n.budget, "Revenue budget"), vg(n.costBudget, "Cost budget"), i) for (let e of ["budget", "costBudget"]) {
			let t = Number(n[e]);
			if (!Number.isSafeInteger(Math.round(t * 100)) || Math.abs(Math.round(t * 100) / 100 - t) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!bg(n.starts) || !bg(n.ends) || n.ends < n.starts) throw Error("Invalid project dates.");
		if (r.some((e) => e.id !== n.id && e.code.toLowerCase() === n.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (i && n.id && (t().salesVisits?.visits ?? []).some((e) => e.followupTaskId === n.id && e.customerId !== n.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (i && ![
			"Open",
			"In progress",
			"Completed"
		].includes(n.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!bg(n.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(n.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (i && yg(n.accountId), ![
			"Description",
			"Payee",
			"Reference"
		].includes(n.field) || ![
			"Contains",
			"Equals",
			"Starts with"
		].includes(n.operator)) throw Error("Invalid bank condition.");
		if (i && !S["tax-codes"].some((e) => e.status === "Active" && e.code === n.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "custom-reports" && i && ig({
		dataset: n.dataset,
		columns: n.columns,
		basis: n.basis,
		filter: n.filter,
		favourite: n.favourite
	}), e === "report-packs" && i && Jh(n.reports), e === "report-packs" && (!bg(n.periodStart) || !bg(n.periodEnd) || n.periodEnd < n.periodStart)) throw Error("Invalid report period.");
	if (e === "settings") {
		if (r.some((e) => e.id !== n.id && e.section === n.section)) throw Error("One record per settings section is allowed.");
		if (n.section === "business") {
			for (let e of [
				"companyName",
				"currency",
				"timezone",
				"yearEnd",
				"gstCode",
				"basis",
				"terms"
			]) _g(n[e], e);
			if (n.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(n.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(n.terms) || Number(n.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(n.yearEnd) || !bg("2001-" + n.yearEnd)) throw Error("Year end must be MM-DD.");
			for (let e of [
				"quotePrefix",
				"orderPrefix",
				"invoicePrefix",
				"creditPrefix",
				"purchasePrefix",
				"billPrefix",
				"supplierCreditPrefix"
			]) if (n[e] && !/^[A-Z0-9]{1,12}$/.test(n[e])) throw Error("Number prefixes require 1–12 uppercase letters/numbers.");
			if (i) {
				if (!S["tax-codes"].some((e) => e.code === n.gstCode && e.status === "Active")) throw Error("Default tax code must be active.");
				let e = t().journals.journalEntries, i = r.find((e) => e.id === n.id), a = t().bankAccounts.bankAccounts, o = i?.currency ?? a[0]?.currency ?? "AUD";
				if (n.currency !== o && (e.length || a.length)) throw Error("Base currency is locked after bank accounts or financial postings exist. Create a separately initialized currency profile.");
			}
		}
		if (![
			"business",
			"sales",
			"purchases",
			"payroll",
			"reports"
		].includes(n.section)) throw Error("Unknown settings section.");
		if (n.currency && !["NZD", "AUD"].includes(n.currency)) throw Error("Unsupported currency.");
		if (n.timezone) try {
			new Intl.DateTimeFormat("en", { timeZone: n.timezone });
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
		]) if (n[e] && (!/^\d+$/.test(n[e]) || Number(n[e]) < 1 || !Number.isSafeInteger(Number(n[e])) || Number(n[e]) > 999999999)) throw Error("Next document numbers must be positive integers.");
	}
}
function Sg(e, t, n) {
	hg[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: ug(),
		updatedAt: ug(),
		recordId: t.id,
		actorId: E.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var Cg = Object.fromEntries(Object.keys(dg).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return sg(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return Qh(t);
		},
		getAll: () => S[e],
		getById: (t) => S[e].find((e) => e.id === t),
		save(t, n) {
			let r = cg.parse(t), i = S[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = ug(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || E.current()?.userId || "local-test" : E.current()?.userId ?? "local-test")), xg(e, o, S[e]), S[e] = [...S[e].filter((e) => e.id !== o.id), o], Sg(e, o, i ? "Updated" : "Created"), mg(), o;
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
			Sg(e, {
				...i,
				note: r.trim()
			}, "Note added"), mg();
		}
	};
	return i("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			wg(e, t), Tg(e, t, n);
		},
		repository: t,
		read: dg[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: dg[e].write,
			setStatus: dg[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: S[e],
			history: hg[e]
		}),
		restore: (t) => {
			wg(e, t), S[e] = t.records, hg[e] = t.history;
		},
		publish: mg
	}), [e, t];
}));
function wg(e, t) {
	let n = x({
		records: u(cg),
		history: u(cg)
	}).strict().parse(t), r = /* @__PURE__ */ new Set();
	for (let t of n.records) {
		if (!t.id || r.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		r.add(t.id), xg(e, t, n.records, !1);
	}
	return n;
}
function Tg(e, t, n) {
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
var Eg = e().trim().min(1).max(200), Dg = e().trim().min(1).max(4e3), Og = e().refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), kg = e().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), Ag = x({
	operationId: Eg,
	name: Eg,
	customerId: Eg,
	locationId: Eg.optional(),
	plannedDate: Og,
	locationNote: e().trim().max(500).default("")
}).strict(), jg = x({
	name: Eg,
	due: Og,
	priority: o([
		"Low",
		"Normal",
		"High"
	]),
	notes: Dg
}).strict(), Mg = x({
	id: Eg,
	expectedRevision: y().int().positive(),
	outcome: Dg,
	followup: jg.optional()
}).strict(), Ng = x({
	id: Eg,
	action: Eg,
	actorId: Eg,
	at: kg,
	note: e().optional()
}).strict(), Pg = x({
	id: Eg,
	operationId: Eg,
	creationFingerprint: e().min(1).max(3e3),
	name: Eg,
	customerId: Eg,
	customerName: Eg,
	locationId: Eg.optional(),
	locationName: e().max(200).optional(),
	locationNote: e().max(500),
	plannedDate: Og,
	status: o([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: y().int().positive(),
	ownerId: Eg,
	createdAt: kg,
	updatedAt: kg,
	checkInAt: kg.optional(),
	checkInBy: Eg.optional(),
	checkOutAt: kg.optional(),
	checkOutBy: Eg.optional(),
	outcome: Dg.optional(),
	completionFingerprint: e().optional(),
	followupTaskId: Eg.optional(),
	history: u(Ng).min(1)
}).strict(), Fg = [], Ig = 0, Lg = /* @__PURE__ */ new Set(), Rg = () => {
	Ig++, Lg.forEach((e) => e());
}, zg = () => E.require("sales.write").userId, Bg = () => (/* @__PURE__ */ new Date()).toISOString(), Vg = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function Hg(e) {
	let t = Fg.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function Ug(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function Wg(e) {
	let t = Bg();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function Gg(e) {
	return Fg = [...Fg.filter((t) => t.id !== e.id), e], Rg(), e;
}
function Kg(e, t) {
	let n = I.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
i("salesVisits", {
	repository: {
		subscribe(e) {
			return Lg.add(e), () => {
				Lg.delete(e);
			};
		},
		getSnapshot: () => Fg,
		getAll: () => Fg,
		create(e) {
			let t = zg(), n = Ag.parse(e), r = JSON.stringify(n), i = Fg.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = Kg(n.customerId, n.locationId), o = Bg();
			return Gg({
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
				history: [Vg("Planned", t, o)]
			});
		},
		update(e) {
			let t = zg(), n = Ag.omit({ operationId: !0 }).extend({
				id: Eg,
				expectedRevision: y().int().positive()
			}).strict().parse(e), r = Hg(n.id);
			if (Ug(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = Kg(n.customerId, n.locationId), a = Wg(r), o = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, Vg("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete o.locationId, delete o.locationName, n.locationId && (o.locationId = n.locationId, o.locationName = i.locations.find((e) => e.id === n.locationId).name), Gg(o);
		},
		checkIn(e) {
			let t = zg(), n = x({
				id: Eg,
				expectedRevision: y().int().positive()
			}).strict().parse(e), r = Hg(n.id);
			if (r.status === "Checked in" && r.revision === n.expectedRevision + 1) return r;
			if (Ug(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			Kg(r.customerId, r.locationId);
			let i = Wg(r);
			return Gg({
				...r,
				status: "Checked in",
				revision: r.revision + 1,
				checkInAt: i,
				checkInBy: t,
				updatedAt: i,
				history: [...r.history, Vg("Checked in", t, i)]
			});
		},
		finish(e) {
			let t = zg(), n = Mg.parse(e), r = Hg(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (Ug(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = Wg(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = Cg.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), Gg({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, Vg("Completed", t, a, n.outcome)]
			});
		},
		cancel(e) {
			let t = zg(), n = x({
				id: Eg,
				expectedRevision: y().int().positive(),
				reason: Dg
			}).strict().parse(e), r = Hg(n.id);
			if (Ug(r, n.expectedRevision), !["Planned", "Checked in"].includes(r.status)) throw Error("Only an unfinished visit can be cancelled.");
			let i = Wg(r);
			return Gg({
				...r,
				status: "Cancelled",
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, Vg("Cancelled", t, i, n.reason)]
			});
		},
		addNote(e) {
			let t = zg(), n = x({
				id: Eg,
				expectedRevision: y().int().positive(),
				note: Dg
			}).strict().parse(e), r = Hg(n.id);
			Ug(r, n.expectedRevision);
			let i = Wg(r);
			return Gg({
				...r,
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, Vg("Note added", t, i, n.note)]
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
	snapshot: () => ({ visits: Fg }),
	restore: (e) => {
		Fg = e.visits;
	},
	publish: Rg,
	validate: (e, t) => {
		let n = x({ visits: u(Pg) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.visits) {
			if (i.has(e.operationId)) throw Error("Duplicate visit operation ID.");
			if (i.add(e.operationId), !r.customers.customers.find((t) => t.id === e.customerId) || e.locationId && !e.locationName) throw Error("Invalid visit customer/location reference.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.updatedAt < e.createdAt) throw Error("Invalid visit history.");
			if (Ag.parse(JSON.parse(e.creationFingerprint)).operationId !== e.operationId || e.history[0].action !== "Planned" || e.history[0].actorId !== e.ownerId || e.history[0].at !== e.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!e.checkInAt != !!e.checkInBy || !!e.checkOutAt != !!e.checkOutBy || e.checkInAt && e.checkInAt < e.createdAt || e.checkOutAt && (!e.checkInAt || e.checkOutAt < e.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (e.status === "Planned" && (e.checkInAt || e.checkOutAt) || e.status === "Checked in" && (!e.checkInAt || e.checkOutAt) || e.status === "Completed" && (!e.checkInAt || !e.checkOutAt || !e.outcome || !e.completionFingerprint) || e.status !== "Completed" && (e.checkOutAt || e.outcome || e.followupTaskId || e.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (e.status === "Completed") {
				let t = x({
					outcome: Dg,
					followup: jg.optional()
				}).strict().parse(JSON.parse(e.completionFingerprint));
				if (t.outcome !== e.outcome || !!t.followup != !!e.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (e.followupTaskId && !r.workspace_tasks.records.some((t) => t.id === e.followupTaskId && t.customerId === e.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Z = e().trim().min(1).max(200), qg = e().trim().max(2e3).optional(), Jg = x({
	requestedArea: y().finite().positive().max(1e9).optional(),
	productId: Z,
	unitId: Z,
	quantity: y().positive().finite(),
	unitPrice: y().nonnegative().finite().optional(),
	priceBasis: o(["Inclusive", "Exclusive"]).optional()
}).strict(), Yg = x({
	description: e().trim().min(1).max(500),
	accountId: Z,
	quantity: y().positive().finite(),
	unitCost: y().nonnegative().finite(),
	taxCode: Z,
	priceBasis: o(["Inclusive", "Exclusive"]).optional()
}).strict(), Xg = x({
	kind: o(["ORDER", "INVOICE"]),
	customerId: Z,
	pricingAt: Z.optional(),
	pricingTimezone: Z.optional(),
	locationId: Z.or(b("")).optional(),
	accountingContactId: Z.or(b("")).optional(),
	documentDate: Z,
	dueDate: Z.optional(),
	customerReference: qg,
	notes: qg,
	lines: u(Jg).min(1).max(500)
}).strict(), Zg = x({
	kind: b("EXPENSE"),
	supplierId: Z,
	supplierInvoiceNumber: Z,
	documentDate: Z,
	dueDate: Z,
	notes: qg,
	lines: u(Yg).min(1).max(500)
}).strict(), Qg = (e) => ae([Xg, Zg]).parse(e), $g = y().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), e_ = x({
	operationId: Z,
	sourceName: e().trim().max(200),
	reviewed: he(),
	declared: x({
		subtotal: $g,
		taxAmount: $g,
		total: $g
	}).strict(),
	payload: Zg.extend({ notes: e().trim().max(1e3).optional() })
}).strict();
function t_(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function n_(e) {
	let t = qa.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = m_(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = js.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...a_.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var r_ = () => N.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
r_();
var i_ = [], a_ = [], o_ = 0, s_ = /* @__PURE__ */ new Set(), c_ = () => {
	o_++, s_.forEach((e) => e());
}, l_ = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function u_(e, t) {
	return {
		action: e,
		actorId: E.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function d_(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = N.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function f_(e) {
	let t = N.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function p_(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = qa.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) f_(t.expenseAccountId);
	} else {
		let n = I.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) Ei(t.productId, t.unitId, t.quantity, "sell");
	}
	d_(e.lines);
}
function m_(e) {
	if (T(e.documentDate, "Document date"), e.dueDate && (T(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? void 0 : jr(e.documentDate, e.pricingAt, e.pricingTimezone), n = e.kind === "EXPENSE" ? e.lines.map((e) => {
		f_(e.accountId);
		let t = r(e.taxCode), n = we(e.unitCost, t.taxRate, e.priceBasis), i = l_(e.quantity * n), a = (e.priceBasis ?? w().basis) === "Inclusive" ? l_(e.quantity * e.unitCost - i) : l_(i * t.taxRate);
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
			lineSubtotal: i,
			taxAmount: a,
			lineTotal: l_(i + a)
		};
	}) : e.lines.map((n) => Yi({
		customerId: e.customerId,
		documentDate: e.documentDate,
		pricingContext: t,
		draft: n
	})), i = Ji(n);
	if (i.total <= 0 || !Number.isFinite(i.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: n,
		totals: i
	};
}
function h_(e) {
	let t = () => e === "sales" ? i_ : a_;
	function n(t) {
		return e === "sales" ? i_ = [...i_.filter((e) => e.id !== t.id), t] : a_ = [...a_.filter((e) => e.id !== t.id), t], c_(), t;
	}
	let r = (e) => {
		let n = t().find((t) => t.id === e);
		if (!n || ge(n.id)) throw Error("Draft not found or is in the recycle bin.");
		return n;
	};
	function i(e, t) {
		if (e.revision !== t) throw Error("Draft changed. Reload before editing or approving.");
	}
	function a(e, t, r = {}, i) {
		return n({
			...e,
			...r,
			revision: e.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			history: [...e.history, u_(t, i)]
		});
	}
	let o = (e, t) => __.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: () => re(t()),
		reviewCapture(t) {
			if (E.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			return n_(e_.parse(t));
		},
		capture(n) {
			if (E.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			let r = e_.parse(n);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = t_(r);
			if (t().find((e) => e.operationId === r.operationId)) return o(r.operationId, i);
			let a = n_(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return o(r.operationId, i);
		},
		save(a) {
			let o = x({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: y().int().positive().optional(),
				payload: e === "sales" ? Xg : Zg
			}).strict().parse(a), s = JSON.stringify(o.payload);
			if (!o.id) {
				let e = t().find((e) => e.operationId === o.operationId);
				if (e) {
					if (ge(e.id)) throw Error("Recover the existing draft from the recycle bin.");
					if (e.creationFingerprint !== s) throw Error("Operation ID was used for different draft data.");
					return e;
				}
			}
			let c = o.id ? r(o.id) : void 0;
			if (c && (i(c, o.expectedRevision ?? -1), c.status !== "DRAFT")) throw Error("Only unapproved drafts can be edited. Reopen an approved draft before editing.");
			if (o.payload.kind !== "EXPENSE") {
				let e = c?.payload.kind === "EXPENSE" ? void 0 : c?.payload, t = e && e.documentDate === o.payload.documentDate && (!o.payload.pricingAt || o.payload.pricingAt === e.pricingAt), n = jr(o.payload.documentDate, o.payload.pricingAt ?? (t ? e.pricingAt : void 0), t ? e.pricingTimezone : w().timezone);
				o.payload = {
					...o.payload,
					...n
				};
			}
			let l = m_(o.payload), u = (/* @__PURE__ */ new Date()).toISOString(), d = {
				id: c?.id ?? crypto.randomUUID(),
				operationId: c?.operationId ?? o.operationId,
				creationFingerprint: c?.creationFingerprint ?? s,
				revision: (c?.revision ?? 0) + 1,
				kind: o.payload.kind,
				status: "DRAFT",
				payload: o.payload.kind === "EXPENSE" ? o.payload : {
					...o.payload,
					lines: o.payload.lines.map((e, t) => ({
						...e,
						quantity: l.lines[t].quantity
					}))
				},
				recipient: o.payload.kind === "EXPENSE" ? void 0 : Hr(o.payload.customerId, o.payload),
				...l,
				createdAt: c?.createdAt ?? u,
				updatedAt: u,
				history: [...c?.history ?? [], u_(c ? "Edited" : "Created")]
			};
			if (c && c.kind !== d.kind) throw Error("Document kind cannot change.");
			return p_(d), n(d);
		},
		approve(e, t) {
			let n = r(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (i(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return p_(n), a(n, "Approved", { status: "APPROVED" });
		},
		reopen(e, t, n) {
			let o = r(e);
			if (i(o, t), o.status !== "APPROVED" || n.trim().length < 3) throw Error("Only approved drafts can be reopened with a reason.");
			return a(o, "Reopened", { status: "DRAFT" }, n);
		},
		cancel(e, t, n) {
			let o = r(e);
			if (i(o, t), o.status === "POSTED" || o.status === "CANCELLED" || n.trim().length < 3) throw Error("Only unposted drafts can be cancelled with a reason.");
			return a(o, "Cancelled", { status: "CANCELLED" }, n);
		},
		post(e, t) {
			let n = r(e);
			if (n.status === "POSTED") return n;
			if (i(n, t), n.status !== "APPROVED") throw Error("Approve the draft before posting.");
			j(), Rt(n.payload.documentDate), p_(n);
			let o, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = qa.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), r = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: xe("BILL", js.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				js.insertExpenseBill(r);
				let i = r.lines.filter((e) => e.lineSubtotal !== 0).map((e) => ({
					accountId: e.expenseAccountId,
					description: e.description,
					debit: e.lineSubtotal,
					credit: 0
				}));
				P.post({
					journalDate: r.billDate,
					description: "Expense bill " + r.billNumber,
					reference: r.supplierInvoiceNumber,
					sourceType: "SUPPLIER_BILL",
					sourceId: r.id,
					lines: [
						...i,
						...aa(r.lines, "paid", !0, r.totals.taxAmount),
						{
							accountId: N.requireBySystemRole("ACCOUNTS_PAYABLE").id,
							debit: 0,
							credit: r.totals.total
						}
					]
				}), o = r.id;
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
				o = s.kind === "ORDER" ? R.createManagedOrder(e).id : R.createManagedInvoice({
					...e,
					dueDate: s.dueDate
				}).id;
			}
			return a(n, "Posted", {
				status: "POSTED",
				documentId: o
			});
		},
		cancelOrder(e, t) {
			let n = r(e);
			if (n.kind !== "ORDER" || n.status !== "POSTED") throw Error("A confirmed managed order is required.");
			return R.cancelManagedOrder(n.documentId, t), a(n, "Order cancelled", {}, t);
		}
	};
}
var g_ = h_("sales"), __ = h_("expense"), v_ = x({
	recipient: x({
		locationId: e().optional(),
		locationName: e().optional(),
		deliveryAddress: e().optional(),
		accountingContactId: e().optional(),
		accountingContactName: e().optional(),
		accountingEmail: e().email().optional()
	}).strict().optional(),
	id: Z,
	operationId: Z,
	creationFingerprint: e().max(1e6),
	revision: y().int().positive(),
	kind: o([
		"ORDER",
		"INVOICE",
		"EXPENSE"
	]),
	status: o([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	payload: ae([Xg, Zg]),
	lines: u(x({
		id: Z,
		description: e().min(1),
		quantity: y().finite().positive(),
		unitSymbol: e().min(1),
		unitPrice: y().finite().nonnegative().optional(),
		unitCost: y().finite().nonnegative().optional(),
		taxRate: y().finite().min(0).max(1),
		taxCode: Z,
		taxPaidAccountId: Z.optional(),
		taxCollectedAccountId: Z.optional(),
		lineSubtotal: y().finite().nonnegative(),
		taxAmount: y().finite().nonnegative(),
		lineTotal: y().finite().nonnegative()
	}).passthrough()).min(1),
	totals: x({
		subtotal: y().finite(),
		taxAmount: y().finite(),
		total: y().finite()
	}),
	documentId: Z.optional(),
	createdAt: Z,
	updatedAt: Z,
	history: u(x({
		action: Z,
		actorId: Z,
		at: Z,
		reason: e().optional()
	}).strict()).min(1)
}).strict();
for (let e of ["sales", "expense"]) i(e === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: e === "sales" ? g_ : __,
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
	snapshot: () => e === "sales" ? { drafts: i_ } : {
		drafts: a_,
		options: r_()
	},
	restore: (t) => {
		e === "sales" ? i_ = t.drafts : (a_ = t.drafts, t.options);
	},
	publish: c_,
	validate: (t, n) => {
		let { drafts: r } = x({
			drafts: u(v_),
			...e === "expense" ? { options: u(x({
				id: Z,
				code: Z,
				name: Z
			}).strict()) } : {}
		}).strict().parse(t);
		for (let t of r) {
			if (Ur(t.recipient), t.kind !== t.payload.kind || e === "expense" != (t.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (T(t.payload.documentDate), t.payload.dueDate && (T(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate)) throw Error("Draft due date is invalid.");
			let r = n, i = t.payload.kind === "EXPENSE" ? t.payload.supplierId : t.payload.customerId;
			if (!(t.payload.kind === "EXPENSE" ? r.suppliers.suppliers : r.customers.customers).some((e) => e.id === i) || t.lines.length !== t.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [e, n] of t.lines.entries()) {
				let i = t.payload.lines[e], a = n;
				if (t.kind !== "EXPENSE") {
					if (Vr(a), Mr(a, t.payload.documentDate), t.payload.kind !== "EXPENSE" && (t.payload.pricingAt !== a.pricingAt || t.payload.pricingTimezone !== a.pricingTimezone)) throw Error("Draft pricing context mismatch.");
					if (Fr(a, r.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea) throw Error("Draft area requirement mismatch.");
				}
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || l_(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
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
				if (l_(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Draft totals do not match lines.");
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
var y_ = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function b_(e, t, n) {
	if (T(e), !Number.isSafeInteger(n) || n < 0 || !y_.includes(t)) throw Error("Invalid schedule occurrence.");
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
function x_(e, t) {
	T(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return T(r), r;
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var S_ = e().trim().min(1).max(200), C_ = e().refine((e) => {
	try {
		return T(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), w_ = x({
	operationId: S_,
	name: S_,
	sourceDraftId: S_,
	frequency: o(y_),
	firstDate: C_,
	endDate: C_
}).strict(), T_ = x({
	id: S_,
	expectedRevision: y().int().positive(),
	name: S_,
	endDate: C_
}).strict(), E_ = e().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), D_ = x({
	id: S_,
	name: S_,
	kind: o(["INVOICE", "EXPENSE"]),
	status: o([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: y().int().positive(),
	operationId: S_,
	creationFingerprint: e().min(1).max(2e3),
	sourceDraftId: S_,
	payload: ye(),
	frequency: o(y_),
	firstDate: C_,
	nextDate: C_,
	endDate: C_,
	occurrence: y().int().nonnegative(),
	termsDays: y().int().nonnegative(),
	createdAt: E_,
	updatedAt: E_
}).strict(), O_ = x({
	id: S_,
	scheduleId: S_,
	date: C_,
	draftId: S_,
	actorId: S_,
	createdAt: E_
}).strict(), k_ = 0, A_ = /* @__PURE__ */ new Set(), j_ = () => {
	k_++, A_.forEach((e) => e());
}, M_ = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, N_ = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", P_ = (e) => e === "INVOICE" ? g_ : __, F_ = () => (/* @__PURE__ */ new Date()).toISOString();
function I_(e) {
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
function L_(e) {
	let t = () => M_[e], n = (e) => {
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
			E.require(N_(e));
			let r = w_.parse(n), i = JSON.stringify(r), a = t().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = P_(e).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== e || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = I_(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = F_(), u = {
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
			return t().schedules = [...t().schedules, u], j_(), u;
		},
		update(i) {
			E.require(N_(e));
			let a = T_.parse(i), o = n(a.id);
			if (r(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < t().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: F_()
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? s : e), j_(), s;
		},
		setStatus(i) {
			E.require(N_(e));
			let a = x({
				id: S_,
				expectedRevision: y().int().positive(),
				status: o(["Active", "Paused"])
			}).strict().parse(i), s = n(a.id);
			if (r(s, a.expectedRevision), s.nextDate > s.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let c = {
				...s,
				status: a.status,
				revision: s.revision + 1,
				updatedAt: F_()
			};
			return t().schedules = t().schedules.map((e) => e.id === s.id ? c : e), j_(), c;
		},
		generate(i) {
			E.require(N_(e));
			let a = x({
				id: S_,
				expectedRevision: y().int().positive(),
				date: C_
			}).strict().parse(i), o = n(a.id), s = t().runs.find((e) => e.scheduleId === o.id && e.date === a.date);
			if (s) return {
				schedule: o,
				run: s,
				draft: P_(e).getAll().find((e) => e.id === s.draftId)
			};
			if (r(o, a.expectedRevision), o.status !== "Active") throw Error("Activate the schedule before generating.");
			if (a.date !== o.nextDate) throw Error("Generate the next occurrence in order.");
			if (a.date > me(F_())) throw Error("This occurrence is not due yet.");
			if (a.date > o.endDate) throw Error("The schedule has ended.");
			let c = b_(o.firstDate, o.frequency, o.occurrence + 1), l = structuredClone(o.payload);
			l.documentDate = a.date, l.kind !== "EXPENSE" && (delete l.pricingAt, delete l.pricingTimezone), l.dueDate = x_(a.date, o.termsDays), l.kind === "EXPENSE" && (l.supplierInvoiceNumber = l.supplierInvoiceNumber.slice(0, 170) + " [" + a.date + "]");
			let u = P_(e).save({
				operationId: "recurring:" + o.id + ":" + a.date,
				payload: l
			}), d = F_(), f = {
				id: crypto.randomUUID(),
				scheduleId: o.id,
				date: a.date,
				draftId: u.id,
				actorId: E.current().userId,
				createdAt: d
			}, p = {
				...o,
				nextDate: c,
				occurrence: o.occurrence + 1,
				status: c > o.endDate ? "Ended" : "Active",
				revision: o.revision + 1,
				updatedAt: d
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? p : e), t().runs = [...t().runs, f], j_(), {
				schedule: p,
				run: f,
				draft: u
			};
		}
	};
}
var R_ = L_("INVOICE"), z_ = L_("EXPENSE");
for (let e of ["INVOICE", "EXPENSE"]) i(e === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: e === "INVOICE" ? R_ : z_,
	read: e === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: N_(e),
		update: N_(e),
		setStatus: N_(e),
		generate: N_(e)
	},
	snapshot: () => structuredClone(M_[e]),
	restore: (t) => {
		M_[e] = t;
	},
	publish: j_,
	validate: (t, n) => {
		x({
			schedules: u(D_),
			runs: u(O_)
		}).strict().parse(t);
		let r = t, i = n;
		for (let t of r.schedules) {
			if (t.kind !== e || ![
				"Active",
				"Paused",
				"Ended"
			].includes(t.status) || !Number.isSafeInteger(t.revision) || t.revision < 1 || !Number.isSafeInteger(t.occurrence) || t.occurrence < 0 || !Number.isInteger(t.termsDays) || t.termsDays < 0 || t.payload.kind !== e) throw Error("Invalid recurring schedule.");
			if (w_.parse({
				operationId: t.operationId,
				name: t.name,
				sourceDraftId: t.sourceDraftId,
				frequency: t.frequency,
				firstDate: t.firstDate,
				endDate: t.endDate
			}), Qg(t.payload), !t.id || !t.creationFingerprint || !Number.isFinite(Date.parse(t.createdAt)) || !Number.isFinite(Date.parse(t.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (T(t.payload.documentDate), T(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate || t.termsDays !== Math.round((Date.parse(t.payload.dueDate + "T00:00:00Z") - Date.parse(t.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (t.payload.kind === "EXPENSE") {
				if (!i.suppliers.suppliers.some((e) => e.id === t.payload.supplierId) || t.payload.lines.some((e) => !i.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!i.customers.customers.some((e) => e.id === t.payload.customerId) || t.payload.lines.some((e) => !i.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (t.status === "Ended" != t.nextDate > t.endDate) throw Error("Recurring end status is inconsistent.");
			if (t.nextDate !== b_(t.firstDate, t.frequency, t.occurrence) || t.endDate < t.firstDate) throw Error("Invalid recurring dates.");
			let n = (e === "INVOICE" ? i.managedSalesDocuments : i.expenseBillDrafts).drafts.find((e) => e.id === t.sourceDraftId);
			if (!n || n.kind !== e) throw Error("Recurring template source is missing.");
			let a = r.runs.filter((e) => e.scheduleId === t.id);
			if (a.length !== t.occurrence || new Set(a.map((e) => e.date)).size !== a.length) throw Error("Recurring run history does not match schedule.");
			for (let e = 0; e < a.length; e++) if (!a.some((n) => n.date === b_(t.firstDate, t.frequency, e))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let t of r.runs) {
			let n = r.schedules.find((e) => e.id === t.scheduleId), a = (e === "INVOICE" ? i.managedSalesDocuments : i.expenseBillDrafts).drafts.find((e) => e.id === t.draftId);
			if (!n || !a || a.kind !== e || a.operationId !== "recurring:" + n.id + ":" + t.date || !t.actorId || !Number.isFinite(Date.parse(t.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = e().trim().min(1).max(200), B_ = y().finite().positive(), V_ = y().finite().nonnegative(), H_ = x({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: e().trim().min(3).max(2e3),
	lines: u(x({
		matchId: Q,
		quantity: B_
	}).strict()).min(1).max(500)
}).strict(), U_ = x({
	id: Q,
	matchId: Q,
	supplierBillLineId: Q,
	goodsReceiptId: Q,
	goodsReceiptLineId: Q,
	productId: Q,
	unitId: Q,
	baseUnitId: Q,
	sku: Q,
	description: e(),
	unitSymbol: Q,
	quantity: B_,
	conversionToBase: B_,
	quantityBase: B_,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: V_,
	inventoryValue: V_,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), W_ = x({
	id: Q,
	returnNumber: Q,
	operationId: Q,
	requestFingerprint: e().max(1e6),
	supplierBillId: Q,
	supplierBillNumber: Q,
	supplierId: Q,
	supplierName: Q,
	supplierCreditId: Q,
	returnDate: Q,
	reason: e().min(3).max(2e3),
	status: o(["POSTED", "VOID"]),
	lines: u(U_).min(1),
	inventoryValue: V_,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: e().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), G_ = [], K_ = 0, q_ = /* @__PURE__ */ new Set(), J_ = () => {
	K_++, q_.forEach((e) => e());
}, Y_ = (e) => Math.round(e * 1e4) / 1e4, X_ = (e) => Math.round(e * 100) / 100;
function Z_(e, t, n) {
	if (zo.getAll().some((r) => r.siteId === t && r.productId === n && me(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function Q_(e) {
	let t = js.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : Cs.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = ds.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? Rr(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = G_.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
i("physicalSupplierReturns", {
	repository: {
		create(e) {
			let t = H_.parse(e), n = JSON.stringify(t), r = G_.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			j(), T(t.returnDate, "Return date"), Rt(t.returnDate);
			let i = js.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = Q_(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (Y_(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = Lr(n.productId), i = Rr(n.productId, n.unitId), s = wo.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				Z_(t.returnDate, s.id, r.id);
				let c = Y_(e.quantity * n.conversionToBase);
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
				c.set(t, Y_((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((is.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: Y_((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(G_.length + 1).padStart(5, "0"), f = H.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				is.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = ko.create({
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
				}), r = Qo({
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
			}), m = X_(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? P.post({
				journalDate: t.returnDate,
				description: `Physical supplier return ${d}`,
				reference: f.creditNumber,
				sourceType: "SUPPLIER_RETURN",
				sourceId: u,
				lines: [{
					accountId: N.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id,
					debit: m,
					credit: 0
				}, {
					accountId: N.requireBySystemRole("INVENTORY").id,
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
				createdBy: E.current()?.userId ?? "local-test"
			};
			return G_ = [g, ...G_], J_(), g;
		},
		reverse(t) {
			let n = x({
				returnId: Q,
				voidDate: Q,
				reason: e().trim().min(3).max(2e3)
			}).strict().parse(t), r = G_.find((e) => e.id === n.returnId);
			if (!r) throw Error("Supplier return not found.");
			if (r.status === "VOID") return r;
			if (j(), T(n.voidDate, "Reversal date"), Rt(n.voidDate), n.voidDate < r.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of r.lines) Z_(n.voidDate, e.siteId, e.productId);
			let i = H.getById(r.supplierCreditId);
			if ((i.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > n.voidDate) || H.getAllocationsByCredit(i.id).some((e) => e.reversedAt && me(e.reversedAt) > n.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			H.voidReturnCredit({
				supplierCreditId: r.supplierCreditId,
				reason: n.reason,
				voidDate: n.voidDate
			});
			let a = r.lines.map((e) => {
				is.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = ko.create({
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
					referenceId: r.id,
					referenceNumber: r.returnNumber,
					occurredAt: n.voidDate,
					notes: n.reason
				}), i = $o({
					siteId: e.siteId,
					productId: e.productId,
					quantityBase: e.quantityBase,
					unitCostBase: e.unitCostBase,
					inventoryValue: e.inventoryValue,
					referenceType: "SUPPLIER_RETURN_VOID",
					referenceId: r.id,
					referenceNumber: r.returnNumber,
					inventoryMovementId: t.id,
					occurredAt: n.voidDate,
					notes: n.reason
				}).movement;
				return {
					...e,
					voidInventoryMovementId: t.id,
					voidCostMovementId: i.id
				};
			});
			r.journalId && P.reverse({
				journalEntryId: r.journalId,
				reversalDate: n.voidDate,
				reason: n.reason
			});
			let o = {
				...r,
				status: "VOID",
				lines: a,
				voidDate: n.voidDate,
				voidReason: n.reason,
				voidedAt: (/* @__PURE__ */ new Date()).toISOString(),
				voidedBy: E.current()?.userId ?? "local-test"
			};
			return G_ = G_.map((e) => e.id === r.id ? o : e), J_(), o;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: G_ }),
	restore: (e) => {
		G_ = e.returns;
	},
	publish: J_,
	validate: (e, t) => {
		let n = x({ returns: u(W_) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.returns) {
			T(e.returnDate), e.voidDate && T(e.voidDate);
			let t = H_.parse(JSON.parse(e.requestFingerprint));
			if (i.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			i.add(e.operationId);
			let n = r.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), a = r.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !a || e.status === "VOID" != (a.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (X_(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let i = r.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), a = r.costMovements.movements.find((e) => e.id === t.costMovementId), o = r.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = r.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!i || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || i.productId !== t.productId || !a || !o || a.referenceType !== "SUPPLIER_RETURN" || a.referenceId !== e.id || a.inventoryMovementId !== o.id || a.siteId !== t.siteId || a.productId !== t.productId || a.unitCostBase !== t.unitCostBase || a.quantityBase !== -t.quantityBase || X_(-a.valueChange) !== X_(t.inventoryValue) || Y_(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || me(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = r.costMovements.movements.find((e) => e.id === t.voidCostMovementId), i = r.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !i || n.inventoryMovementId !== i.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || X_(n.valueChange) !== X_(t.inventoryValue) || i.referenceType !== "SUPPLIER_RETURN_VOID" || i.quantityBase !== t.quantityBase || i.referenceId !== e.id || me(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
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
				let n = Y_(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!a.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !r.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of r.supplierCredits.supplierCredits) if (e.physicalReturnId && !n.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of r.receiptMatches.matches) if (Y_(n.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var $_ = e().min(1).max(200), ev = e().max(2e4), tv = ev.optional(), nv = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], rv = x({
	operationId: $_,
	sourceId: $_,
	kind: o(nv),
	expectedUpdatedAt: $_,
	templateId: $_.optional()
}).strict(), iv = y().finite().nonnegative(), av = x({
	itemType: o([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: $_,
	sku: ev,
	description: ev,
	unitSymbol: ev,
	quantity: y().positive().finite(),
	unitPrice: iv,
	lineSubtotal: iv,
	taxAmount: iv,
	lineTotal: iv,
	taxCode: tv,
	taxRate: y().finite().min(0).max(1).optional(),
	requestedArea: y().positive().finite().optional(),
	areaPerPack: y().positive().finite().optional(),
	coveredArea: y().positive().finite().optional()
}).strict(), ov = x({
	locationId: tv,
	locationName: tv,
	deliveryAddress: tv,
	accountingContactId: tv,
	accountingContactName: tv,
	accountingEmail: tv
}).strict(), sv = x({
	id: $_,
	revision: $_,
	name: ev,
	subject: ev,
	body: ev,
	footer: ev,
	paper: o(["A4", "Letter"])
}).strict(), cv = x({
	id: $_,
	operationId: $_,
	requestFingerprint: ev,
	preparedAt: $_,
	preparedBy: $_,
	sourceId: $_,
	kind: o(nv),
	sourceUpdatedAt: $_,
	documentNumber: $_,
	status: $_,
	documentDate: $_,
	dueDate: tv,
	expiryDate: tv,
	reference: tv,
	notes: tv,
	customerId: $_,
	customerName: ev,
	customerCode: ev,
	customerIdentifier: tv,
	recipient: ov.optional(),
	issuer: x({
		name: ev,
		tradingName: tv,
		identifier: tv,
		address: tv,
		email: tv,
		phone: tv,
		currency: $_
	}).strict(),
	lines: u(av).min(1),
	totals: x({
		subtotal: iv,
		taxAmount: iv,
		total: iv
	}).strict(),
	amountPaid: iv.optional(),
	amountDue: iv.optional(),
	template: sv,
	subject: ev,
	body: ev
}).strict();
function lv(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = L.getById(t);
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
var uv = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function dv() {
	return (S.templates ?? []).filter((e) => e.status === "Active" && [
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
var fv = [];
dv();
var pv = 0, mv = /* @__PURE__ */ new Set(), hv = () => {
	pv++, mv.forEach((e) => e());
};
function gv(e, t) {
	let n = t ? S.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === uv(e)) : void 0;
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
var _v = [
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
function vv(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!_v.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function yv(e) {
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
var bv = { prepare(e) {
	let t = rv.parse(e), n = JSON.stringify(t), r = fv.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = lv(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = I.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = w(), s = gv(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
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
		preparedBy: E.current()?.userId ?? "local-test",
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
		lines: i.lines.map(yv),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: vv(s.footer, l)
		},
		subject: vv(s.subject, l),
		body: vv(s.body, l)
	};
	return xv(u), fv = [u, ...fv], hv(), u;
} };
function xv(e) {
	let t = cv.parse(e);
	if (Ur(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = rv.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (Vr(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
i("preparedSalesOutputs", {
	repository: bv,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: fv,
		templates: dv()
	}),
	restore: (e) => {
		fv = e.artifacts, e.templates;
	},
	publish: hv,
	validate: (e, t) => {
		let n = x({
			artifacts: u(cv),
			templates: u(x({
				id: $_,
				name: ev,
				kind: $_
			}).strict())
		}).strict().parse(e), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
		for (let e of n.artifacts) {
			if (xv(e), r.has(e.id) || i.has(e.operationId)) throw Error("Duplicate prepared output.");
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
var Sv = e().trim().min(1).max(200), Cv = x({
	operationId: Sv,
	salesOrderId: Sv,
	siteId: Sv,
	fulfilmentDate: Sv,
	lines: u(x({
		salesOrderLineId: Sv,
		fulfilledQuantity: y().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function wv() {
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
		lines: e.lines.filter(Pr).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: Ld.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
wv();
var Tv = [], Ev = 0, Dv = /* @__PURE__ */ new Set(), Ov = () => {
	Ev++, Dv.forEach((e) => e());
};
i("salesDispatch", {
	repository: {
		record(e) {
			let t = Cv.parse(e), n = JSON.stringify(t), r = Tv.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return Ld.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (j(), T(t.fulfilmentDate), Rt(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = Ld.create(t);
			return Tv = [...Tv, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], Ov(), i;
		},
		reverse(t) {
			let n = x({
				fulfilmentId: Sv,
				voidDate: Sv,
				reason: e().trim().min(3).max(1e3)
			}).strict().parse(t);
			j(), T(n.voidDate), Rt(n.voidDate);
			let r = Ld.getAll().find((e) => e.id === n.fulfilmentId);
			return r?.status === "VOIDED" ? r : Ld.void(n);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: wv(),
		requests: Tv
	}),
	restore: (e) => {
		e.orders, Tv = e.requests;
	},
	publish: Ov,
	validate: (t, n) => {
		let r = x({
			orders: u(x({
				id: Sv,
				number: Sv,
				date: Sv,
				delivery: e().optional(),
				store: e().optional(),
				lines: u(x({
					id: Sv,
					sku: e(),
					description: e(),
					unit: e(),
					quantity: y().finite().positive(),
					fulfilled: y().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: u(x({
				id: Sv,
				fingerprint: e().max(1e6),
				fulfilmentId: Sv
			}).strict())
		}).strict().parse(t), i = n.fulfilments.fulfilments;
		if (r.requests.some((e) => !i.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/finance-foundation/openingBalanceRepository.ts
var kv = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = e().trim().min(1).max(200), Av = y().finite().refine((e) => kv(e) === e, "Amounts must use cents precision"), jv = x({
	accountId: $,
	debit: Av.nonnegative(),
	credit: Av.nonnegative()
}).strict(), Mv = x({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: Av
}).strict(), Nv = x({
	operationId: $,
	date: $,
	reason: e().trim().min(3).max(1e3),
	gl: u(jv).min(2).max(5e3),
	ar: u(Mv).max(1e4),
	ap: u(Mv).max(1e4),
	banks: u(x({
		bankAccountId: $,
		amount: Av
	}).strict()).max(500),
	stock: u(x({
		siteId: $,
		productId: $,
		quantity: y().positive().finite(),
		unitCost: y().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), Pv = [], Fv = 0, Iv = /* @__PURE__ */ new Set(), Lv = () => {
	Fv++, Iv.forEach((e) => e());
};
function Rv() {
	return t();
}
function zv(e) {
	f(e), ii(e.sales), gi(e.customerCredits), A.update("supplierBills", e.supplierBills.supplierBills), A.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function Bv(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function Vv(e) {
	let t = Nv.parse(e);
	if (T(t.date, "Cutover date"), Rt(t.date), j(), Pv.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = Rv();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	Bv(t.gl.map((e) => e.accountId), "GL account"), Bv(t.banks.map((e) => e.bankAccountId), "bank"), Bv(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = Or({
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
	}), i = Lc({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Wc({
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
	let o = N.getAll(), s = (e) => N.requireBySystemRole(e).id, c = (e) => kv(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = N.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = kv(t.gl.reduce((e, t) => e + t.debit, 0)), u = kv(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = kv(t.ar.reduce((e, t) => e + t.amount, 0)), f = kv(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		Bv(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (T(i.date), T(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = Lr(e.productId), n = wo.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = kv(p + kv(e.quantity * e.unitCost));
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
i("openingBalances", {
	repository: {
		preview(e) {
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = Vv(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: kv(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = Nv.parse(e), n = JSON.stringify(t), r = Pv.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = Vv(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: E.current()?.userId ?? "",
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
			}, l = (e) => N.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
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
				let g = e === "ar" == t.amount > 0, _ = P.post({
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
			a.journals = Rv().journals, zv(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: kv(d),
				credit: kv(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, kv((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = P.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = Lr(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = ko.create({
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
				is.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = Zo({
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
			return Pv = [...Pv, c], Lv(), c;
		},
		reverse(e) {
			if (T(e.date), Rt(e.date), j(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = Pv.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = Rv();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) _u(e);
			for (let n of t.journalIds) P.reverse({
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = Rv().journals, zv(n), Pv = Pv.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), Lv(), Pv.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: Pv }),
	restore: (e) => {
		Pv = e.batches;
	},
	publish: Lv,
	validate: (t, n) => {
		let r = x({ batches: u(x({
			id: $,
			operationId: $,
			date: $,
			status: o(["POSTED", "REVERSED"]),
			journalIds: u($),
			invoiceIds: u($),
			billIds: u($),
			customerCreditIds: u($),
			supplierCreditIds: u($),
			fingerprint: e().min(1).max(5e7),
			reason: e().min(3),
			actor: $,
			createdAt: $,
			movementIds: u($),
			costMovementIds: u($),
			priorJournalIds: u($),
			priorMovementIds: u($),
			priorStock: u(x({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: y().finite().nonnegative(),
				updatedAt: $
			}).strict()),
			priorCost: u(x({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: y().finite().nonnegative(),
				averageCostPerBaseUnit: y().finite().nonnegative(),
				inventoryValue: y().finite().nonnegative(),
				costingMethod: b("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: $
			}).strict()),
			reversalDate: $.optional(),
			reversalReason: e().optional()
		}).strict()) }).strict().parse(t);
		for (let e of r.batches) {
			let t = Nv.parse(JSON.parse(e.fingerprint));
			if (t.operationId !== e.operationId || t.date !== e.date) throw Error("Opening import identity is invalid.");
			if (e.status === "REVERSED" && !e.reversalDate) throw Error("Opening reversal date is missing.");
			e.reversalDate && T(e.reversalDate), T(e.date);
			let r = n;
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
var Hv = (e) => Math.round((e + 2 ** -52) * 100) / 100, Uv = e().trim().min(1).max(200), Wv = x({
	operationId: Uv,
	paymentDate: Uv,
	bankAccountId: Uv,
	reference: e().max(500),
	allocations: u(x({
		supplierBillId: Uv,
		amount: y().finite().positive().refine((e) => Hv(e) === e)
	}).strict()).min(1).max(500)
}).strict(), Gv = [], Kv = 0, qv = /* @__PURE__ */ new Set(), Jv = () => {
	Kv++, qv.forEach((e) => e());
}, Yv = () => {
	let e = E.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function Xv(e, t) {
	return {
		action: e,
		reason: t,
		actor: Yv(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function Zv(e) {
	let t = Gv.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function Qv(e) {
	return Gv = Gv.map((t) => t.id === e.id ? e : t), Jv(), e;
}
function $v(e) {
	T(e.paymentDate, "Payment date");
	let t = F.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = js.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
i("paymentBatches", {
	repository: {
		create(e) {
			let t = Wv.parse(e), n = JSON.stringify(t), r = Gv.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			$v(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: Yv(),
				paymentIds: [],
				history: [Xv("Created")]
			};
			return Gv = [...Gv, i], Jv(), i;
		},
		approve(e) {
			let t = Zv(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return $v(t), Qv({
				...t,
				status: "APPROVED",
				approvedBy: Yv(),
				history: [...t.history, Xv("Approved")]
			});
		},
		post(e) {
			let t = Zv(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			j(), $v(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = js.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => Rs.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			if (r.some((e) => e.status !== "POSTED")) throw Error("Batch payment is not posted. Inspect the prior operation before retrying.");
			return Qv({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, Xv("Payments recorded")]
			});
		},
		cancel(e) {
			let t = Zv(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return Qv({
				...t,
				status: "CANCELLED",
				history: [...t.history, Xv("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = Zv(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			j();
			for (let e of t.paymentIds) {
				let t = Rs.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				Et("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) Rs.reverse(n, e.reason);
			return Qv({
				...t,
				status: "REVERSED",
				history: [...t.history, Xv("Reversed", e.reason)]
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
	snapshot: () => ({ batches: Gv }),
	restore: (e) => {
		Gv = e.batches;
	},
	validate: (t, n) => {
		let r = Wv.extend({
			id: Uv,
			fingerprint: e(),
			status: o([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: Uv,
			approvedBy: Uv.optional(),
			paymentIds: u(Uv),
			history: u(x({
				action: Uv,
				actor: Uv,
				at: Uv,
				reason: e().optional()
			}).strict())
		}).strict(), i = x({ batches: u(r) }).strict().parse(t), a = n, s = a.supplierPayments.supplierPayments, c = a.bankAccounts.bankAccounts, l = a.supplierBills.supplierBills, d = /* @__PURE__ */ new Set();
		if (new Set(i.batches.map((e) => e.id)).size !== i.batches.length || new Set(i.batches.map((e) => e.operationId)).size !== i.batches.length) throw Error("Duplicate payment batch identity or operation.");
		let f = (e) => JSON.stringify(e.map((e) => ({
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
			let o = /* @__PURE__ */ new Set();
			for (let t of e.paymentIds) {
				let n = s.find((e) => e.id === t), r = n && i.get(n.supplierId);
				if (d.has(t) || !n || !r || o.has(n.supplierId) || n.operationId !== "batch:" + e.id + ":" + n.supplierId || n.bankAccountId !== e.bankAccountId || n.paymentDate !== e.paymentDate || n.method !== "BANK_TRANSFER" || (n.reference ?? "") !== e.reference.trim() || n.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED") || f(n.allocations) !== f(r) || n.amount !== Hv(r.reduce((e, t) => e + t.amount, 0))) throw Error("Payment batch payment relationships are invalid.");
				if (d.add(t), o.add(n.supplierId), !a.journals.journalEntries.some((e) => e.sourceType === "SUPPLIER_PAYMENT" && e.sourceId === t)) throw Error("A batch payment journal is missing.");
			}
		}
	},
	publish: Jv
});
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var ey = (e) => Math.round((e + 2 ** -52) * 100) / 100, ty = e().min(1).max(200), ny = [], ry = 0, iy = /* @__PURE__ */ new Set(), ay = () => {
	ry++, iy.forEach((e) => e());
};
function oy(e) {
	let t = F.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function sy(e) {
	let t = ny.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function cy(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = Cn.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function ly(e) {
	return ny = ny.map((t) => t.id === e.id ? e : t), ay(), e;
}
var uy = (e, t) => _t(oy(e), P.getAll(), t).transactions;
function dy(e) {
	if (e.date < oy(e.bankAccountId).openingBalanceDate) throw Error("Statement predates the current bank opening date.");
}
function fy(e) {
	let t = P.getAll(), n = mt(t);
	if (t.some((t) => t.sourceType === "BANK_STATEMENT" && t.sourceId?.startsWith(e + ":") && n.reviewIds.has(t.id))) throw Error("Earlier categorisation correction requires reviewed recovery before changing this line again.");
}
var py = x({
	date: ty,
	description: e().trim().min(1).max(1e3),
	amount: y().finite().refine((e) => e !== 0 && ey(e) === e, "Enter a non-zero amount in cents"),
	reference: e().max(500).default(""),
	externalId: e().max(200).default("")
}).strict(), my = {
	importRows(e) {
		let t = x({
			bankAccountId: ty,
			rows: u(py).min(1).max(1e4)
		}).strict().parse(e), n = oy(t.bankAccountId), r = 0, i = [...ny], a = [];
		for (let e of t.rows) {
			if (T(e.date, "Statement date"), e.date < n.openingBalanceDate) throw Error("Statement predates the bank opening date.");
			let t = JSON.stringify([n.id, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase()
			]]), o = i.find((e) => e.key === t);
			if (o) {
				if (e.externalId && (o.amount !== e.amount || o.date !== e.date || o.description !== e.description || o.reference !== e.reference)) throw Error("Bank transaction ID conflicts with an existing row.");
				r++;
				continue;
			}
			let s = Cn.getLatestByBankAccount(n.id);
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
			i.push(c), a.push(c);
		}
		return ny = i, ay(), {
			created: a.length,
			duplicates: r
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = lf(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return my.importRows({
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
					l = ey(t - e);
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
		let t = Cn.getClearedTransactionIds(e.bankAccountId), n = P.getAll(), r = new Map(n.map((e) => [e.id, e]));
		return uy(e.bankAccountId, e.asOfDate).filter((i) => oe(r.get(i.journalEntryId), n, e.asOfDate) && !i.correctionOnly && !i.correctionIssue && !t.has(i.id) && !ny.some((e) => e.ledgerIds.includes(i.id)));
	},
	match(e) {
		let t = sy(e.id);
		if (cy(t), dy(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = Cn.getClearedTransactionIds(t.bankAccountId);
		if (e.ledgerIds.some((e) => n.has(e))) throw Error("Selected bank entries were already cleared by a completed reconciliation. Use the genuine source of this new statement line.");
		let r = my.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), i = e.ledgerIds.map((e) => r.find((t) => t.id === e));
		if (i.some((e) => !e) || ey(i.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return ly({
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
		let t = sy(e.id);
		return (S["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		j();
		let t = sy(e.id), n = JSON.stringify(e.splits);
		if (t.status === "POSTED") {
			if (t.fingerprint !== n) throw Error("Line was already posted with different categorisation.");
			return t;
		}
		cy(t), dy(t), fy(t.id);
		let i = u(x({
			accountId: ty,
			amount: y().finite().positive().refine((e) => ey(e) === e),
			taxCode: ty
		}).strict()).min(1).max(100).parse(e.splits);
		if (ey(i.reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Split amounts must equal the statement total.");
		let a = oy(t.bankAccountId), o = t.amount < 0, s = i.flatMap((e) => {
			let t = N.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = se(e.taxCode), i = ey(e.amount / (1 + n)), a = ey(e.amount - i);
			return [{
				accountId: t.id,
				debit: o ? i : 0,
				credit: o ? 0 : i
			}, ...a ? [{
				accountId: (o ? r(e.taxCode).taxPaidAccountId : r(e.taxCode).taxCollectedAccountId) || N.requireBySystemRole(o ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: o ? a : 0,
				credit: o ? 0 : a
			}] : []];
		}), c = P.post({
			journalDate: t.date,
			description: t.description,
			reference: t.reference,
			sourceType: "BANK_STATEMENT",
			sourceId: t.id + ":" + t.history.filter((e) => e.action === "Posted").length,
			lines: [{
				accountId: a.glAccountId,
				debit: o ? 0 : t.amount,
				credit: o ? -t.amount : 0
			}, ...s]
		}), l = c.lines.filter((e) => e.accountId === a.glAccountId).map((e) => c.id + ":" + e.id);
		return ly({
			...t,
			status: "POSTED",
			journalEntryId: c.id,
			ledgerIds: l,
			fingerprint: n,
			history: [...t.history, {
				action: "Posted",
				date: (/* @__PURE__ */ new Date()).toISOString()
			}]
		});
	},
	ignore(e) {
		let t = sy(e.id);
		if (cy(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return ly({
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
		j();
		let t = sy(e.id);
		if (T(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		let n = Cn.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		if (t.status === "POSTED" && fy(t.id), t.status === "POSTED" && e.reversalDate !== t.date) throw Error("Categorisation correction must reverse on the original statement date in an open period. It does not reverse an external payment.");
		if (t.status === "POSTED") for (let e of t.ledgerIds) _u(e.split(":")[0]);
		return t.status === "POSTED" && t.journalEntryId && P.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), ly({
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
		if (Rt(e.statementDate), j(), T(e.statementDate, "Statement date"), !ny.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (ny.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = ny.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate), n = uy(e.bankAccountId, e.statementDate), r = P.getAll(), i = new Map(r.map((e) => [e.id, e]));
		for (let a of t.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (a.ledgerIds.some((t) => St(Cn.getAll(), e.bankAccountId, t, a.date))) throw Error("Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.");
			let t = a.ledgerIds.map((e) => n.find((t) => t.id === e));
			if (!t.length || t.some((e) => !e || !oe(i.get(e.journalEntryId), r, a.date) || e.correctionOnly || e.correctionIssue) || ey(t.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== a.amount) throw Error("Statement match is stale. Revert the statement line and review its ledger sources before reconciling.");
		}
		let a = t.flatMap((e) => e.ledgerIds);
		return Cn.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...Cn.getClearedTransactionIds(e.bankAccountId), ...a])]
		});
	}
}, hy = x({
	id: ty,
	key: e(),
	bankAccountId: ty,
	date: ty,
	description: e(),
	reference: e(),
	amount: y().finite(),
	externalId: e(),
	status: o([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: u(ty),
	journalEntryId: e().optional(),
	fingerprint: e().optional(),
	history: u(x({
		action: e(),
		date: e(),
		reason: e().optional()
	}))
}).strict();
i("bankStatements", {
	repository: my,
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
	snapshot: () => ({ lines: ny }),
	restore: (e) => {
		ny = e.lines;
	},
	validate: (e, t) => {
		let n = x({ lines: u(hy) }).strict().parse(e), r = t, i = r.bankAccounts.bankAccounts, a = r.journals.journalEntries, o = /* @__PURE__ */ new Set(), s = new Map(a.map((e) => [e.id, e])), c = new Map(a.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, {
			journal: e,
			entry: t
		}])));
		if (new Set(n.lines.map((e) => e.key)).size !== n.lines.length) throw Error("Duplicate bank statement import key.");
		for (let e of n.lines) {
			let t = i.find((t) => t.id === e.bankAccountId);
			if (!t) throw Error("Bank statement account is missing.");
			try {
				T(e.date), py.parse({
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
			let a = 0;
			for (let n of e.ledgerIds) {
				let r = c.get(n), i = r?.journal, s = r?.entry;
				if (o.has(n) || !i || !s || s.accountId !== t.glAccountId || i.journalDate > e.date) throw Error("Bank statement ledger source is invalid or reused.");
				o.add(n), a = ey(a + s.debit - s.credit);
			}
			if (a !== e.amount) throw Error("Bank statement amount does not match its ledger links.");
			if (e.status === "MATCHED") {
				if (e.journalEntryId || e.fingerprint) throw Error("Matched bank statements cannot claim categorisation journals.");
			} else {
				let n = s.get(e.journalEntryId ?? ""), r = e.history.filter((e) => e.action === "Posted").length - 1, i = n?.lines.filter((e) => e.accountId === t.glAccountId).map((e) => n.id + ":" + e.id).sort();
				if (!n || n.status !== "POSTED" || n.sourceType !== "BANK_STATEMENT" || n.sourceId !== e.id + ":" + r || n.journalDate !== e.date || JSON.stringify(i) !== JSON.stringify([...e.ledgerIds].sort())) throw Error("Bank statement categorisation journal does not match its source.");
				try {
					if (ey(u(x({
						accountId: ty,
						amount: y().finite().positive().refine((e) => ey(e) === e),
						taxCode: ty
					}).strict()).min(1).max(100).parse(JSON.parse(e.fingerprint ?? "")).reduce((e, t) => e + t.amount, 0)) !== Math.abs(e.amount)) throw Error("Wrong split total.");
				} catch {
					throw Error("Bank statement categorisation fingerprint is invalid.");
				}
			}
		}
	},
	publish: ay
});
//#endregion
//#region electron/security/periodCloseChecks.ts
function gy(e) {
	let n = t(), r = [], i = (e, t, n) => r.push({
		code: e,
		message: t,
		...n ? { path: n } : {}
	});
	e.endDate >= me((/* @__PURE__ */ new Date()).toISOString()) && i("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of O.getUnresolved()) i("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of n.purchaseOperations) e.status !== "POSTED" && i("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of uc()) i(e.code, `${e.entityId}: ${e.message}`);
	let a = _(E.current(), "payroll.read");
	for (let t of n.payroll?.runs ?? []) t.status === "Approved" && t.payDate <= e.endDate && i("PAYROLL_NOT_POSTED", a ? `Post, reopen or cancel approved payroll ${t.name} dated ${t.payDate}.` : "An approved payroll run must be resolved by an authorized payroll user before closing.", a ? "/payroll/pay-runs/" + encodeURIComponent(t.id) : void 0);
	for (let t of n.paymentBatches?.batches ?? []) t.status === "APPROVED" && t.paymentDate <= e.endDate && i("PAYMENT_BATCH_NOT_POSTED", `Post or cancel approved payment batch ${t.reference || t.id} dated ${t.paymentDate}.`, "/banking/payment-batches/" + encodeURIComponent(t.id));
	for (let [t, r, a, o] of [[
		"managedSalesDocuments",
		"INVOICE",
		"INVOICE_DRAFT_NOT_POSTED",
		"/sales/drafts/invoices/"
	], [
		"expenseBillDrafts",
		"EXPENSE",
		"EXPENSE_DRAFT_NOT_POSTED",
		"/purchases/expense-bills/"
	]]) for (let s of n[t]?.drafts ?? []) s.kind === r && s.status === "APPROVED" && s.payload.documentDate <= e.endDate && i(a, `Post, reopen or cancel approved ${r === "INVOICE" ? "invoice" : "expense bill"} dated ${s.payload.documentDate} (${s.id}).`, o + encodeURIComponent(s.id));
	for (let e of n.bankReconciliations.reconciliations) n.bankAccounts.bankAccounts.some((t) => t.id === e.bankAccountId) || i("BANK_RECONCILIATION_INVALID", "A saved reconciliation references a missing bank account.", "/banking/workbench");
	for (let t of n.bankAccounts.bankAccounts) try {
		let r = n.bankReconciliations.reconciliations.filter((e) => e.bankAccountId === t.id).filter((t) => t.statementDate >= e.endDate).sort((e, t) => e.statementDate.localeCompare(t.statementDate))[0];
		for (let a of Ct({
			bank: t,
			journals: n.journals.journalEntries,
			reconciliations: n.bankReconciliations.reconciliations,
			throughDate: r?.statementDate ?? e.endDate,
			statements: n.bankStatements?.lines ?? []
		})) i("BANK_RECONCILIATION_INVALID", `${t.name ?? t.id}: ${a}`, "/banking/workbench");
	} catch {
		i("BANK_RECONCILIATION_INVALID", `${t.name ?? t.id}: saved bank reconciliation evidence could not be verified.`, "/banking/workbench");
	}
	let o = n.bankReconciliations.reconciliations.filter((e) => e.status === "COMPLETED"), s = new Set(o.flatMap((e) => e.clearedTransactionIds)), c = n.journals.journalEntries, l = ue(c), u = /* @__PURE__ */ new Set([...l.originals, ...l.offsets]), d = new Map(c.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, e])));
	for (let t of n.bankAccounts.bankAccounts) {
		let r = (n.bankStatements?.lines ?? []).filter((n) => n.bankAccountId === t.id && n.date <= e.endDate), a = r.filter((e) => e.status === "UNMATCHED").length, o = r.filter((e) => e.status === "MATCHED" || e.status === "POSTED"), l = o.filter((e) => e.ledgerIds.some((t) => !d.has(t) || u.has(d.get(t).id) || !oe(d.get(t), c, e.date))).length, f = o.filter((e) => e.ledgerIds.some((e) => !s.has(e))).length;
		a && i("BANK_STATEMENT_UNPROCESSED", `Process or exclude with a reason ${a} imported statement lines for ${t.name ?? t.id} through ${e.endDate}.`, "/banking/workbench"), l && i("BANK_STATEMENT_STALE", `Repair ${l} stale statement matches for ${t.name ?? t.id} before closing.`, "/banking/workbench"), f && i("BANK_STATEMENT_NOT_CLEARED", `Reconcile ${f} processed statement lines for ${t.name ?? t.id} before closing.`, "/banking/workbench");
	}
	let f = {
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: e.endDate
	}, p = [
		["AR", () => Or({
			...f,
			customers: n.customers.customers,
			documents: [
				...n.sales.quotes,
				...n.sales.salesOrders,
				...n.sales.invoices
			],
			payments: n.customerPayments.payments,
			creditNotes: n.customerCredits.creditNotes,
			creditAllocations: n.customerCredits.allocations
		})],
		["AP", () => Lc({
			...f,
			suppliers: n.suppliers.suppliers,
			bills: n.supplierBills.supplierBills,
			payments: n.supplierPayments.supplierPayments,
			credits: n.supplierCredits.supplierCredits,
			creditAllocations: n.supplierCredits.allocations
		})],
		["INVENTORY", () => Wc({
			...f,
			costMovements: n.costMovements.movements
		})]
	];
	try {
		let t = Qc({
			deposits: n.customerDeposits,
			accounts: n.accounts.accounts,
			journals: n.journals.journalEntries,
			banks: n.bankAccounts.bankAccounts,
			customers: n.customers.customers,
			asOfDate: e.endDate
		});
		t.reconciled || i("CUSTOMER_DEPOSIT_DIFFERENCE", `Customer deposits require review at ${e.endDate}: difference ${t.difference}; ${t.issues.length} integrity issue(s).`, "/accounting/reconciliation/deposits?asOf=" + encodeURIComponent(e.endDate));
	} catch (t) {
		i("CUSTOMER_DEPOSIT_CHECK_FAILED", t instanceof Error ? t.message : String(t), "/accounting/reconciliation/deposits?asOf=" + encodeURIComponent(e.endDate));
	}
	try {
		let t = $c({
			prepayments: n.supplierPrepayments,
			accounts: n.accounts.accounts,
			journals: n.journals.journalEntries,
			banks: n.bankAccounts.bankAccounts,
			suppliers: n.suppliers.suppliers,
			asOfDate: e.endDate
		});
		t.reconciled || i("SUPPLIER_PREPAYMENT_DIFFERENCE", `Supplier prepayments require review at ${e.endDate}: difference ${t.difference}; ${t.issues.length} integrity issue(s).`, "/accounting/reconciliation/prepayments?asOf=" + encodeURIComponent(e.endDate));
	} catch (t) {
		i("SUPPLIER_PREPAYMENT_CHECK_FAILED", t instanceof Error ? t.message : String(t), "/accounting/reconciliation/prepayments?asOf=" + encodeURIComponent(e.endDate));
	}
	for (let [t, n] of p) try {
		let r = n();
		(!r.reconciled || !Number.isFinite(r.difference)) && i(`${t}_DIFFERENCE`, `${t} to GL difference at ${e.endDate}: ${r.difference}.`);
	} catch (e) {
		i(`${t}_CHECK_FAILED`, e instanceof Error ? e.message : String(e));
	}
	for (let t of n.bankAccounts.bankAccounts) (n.journals.journalEntries.some((n) => n.journalDate <= e.endDate && n.lines.some((e) => e.accountId === t.glAccountId)) || t.openingBalance !== 0 && t.openingBalanceDate <= e.endDate) && !n.bankReconciliations.reconciliations.some((n) => n.bankAccountId === t.id && n.statementDate >= e.endDate && n.status === "COMPLETED" && n.difference === 0) && i("BANK_NOT_RECONCILED", `Reconcile ${t.name ?? t.id} through ${e.endDate}.`);
	let m = n.journals.journalEntries.filter((t) => t.journalDate >= e.startDate && t.journalDate <= e.endDate), h = (e) => Math.round((e + 2 ** -52) * 100) / 100, g = h(m.reduce((e, t) => e + t.totalDebit, 0)), v = h(m.reduce((e, t) => e + t.totalCredit, 0));
	return (!Number.isFinite(g) || !Number.isFinite(v) || g !== v) && i("TRIAL_BALANCE", "Period journal debits and credits do not balance."), {
		blockers: r,
		journalCount: m.length,
		debit: g,
		credit: v
	};
}
//#endregion
//#region src/features/purchases/data/purchasePostingRecoveryAuthorization.ts
var _y = null, vy = {
	configureTrustedSession(e) {
		_y = e;
	},
	clear() {
		_y = null;
	},
	current() {
		return _y?.() ?? null;
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
}, yy = "htt.purchasePosting.manualRecoveryAudit.v1";
function by() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(yy) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var xy = by();
function Sy(e) {
	xy.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(yy, JSON.stringify(xy));
	} catch {}
}
i("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return xy.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = k.get(e);
			return vy.canRecover() && t?.status === "RECOVERY_REQUIRED" && k.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = vy.requireRecoveryPermission(), n = k.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!k.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				k.recover(e), Sy({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw Sy({
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
	snapshot: () => xy,
	restore: (e) => {
		xy.splice(0, xy.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var Cy = !1;
function wy() {
	if (Cy || (Cy = !0, A.wasRestoredOnLoad())) return;
	let e = R.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) ua.postInvoice(t), t.status === "VOID" && ua.reverseInvoice(t);
	let t = na.getAll();
	for (let e of t) ua.postPayment(e), e.status === "REVERSED" && ua.reversePayment(e);
	let n = L.getAll();
	for (let e of n) e.status !== "DRAFT" && (ua.postCreditNote(e), e.status === "VOID" && ua.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function Ty() {
	let e = uc().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var Ey = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION"
]);
function Dy(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = g("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return Se(t.view), t.result;
	}
	if (e.businessRecordChecked !== !0 || e.originalGlChecked !== !0 || e.reversalGlChecked !== !0 || e.balancesChecked !== !0) throw Error("Business, original/reversal GL and balances must all be inspected.");
	if (typeof e.reference != "string" || e.reference.length > 500 || typeof e.summary != "string" || e.summary.length > 4e3) throw Error("Recovery evidence reference or summary exceeds the allowed length.");
	let t = O.list().find((t) => t.operationId === e.operationId);
	if (!t || !Ey.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return O.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region electron/security/businessEngine.ts
i("salesRecovery", {
	repository: {
		previewSourceRepair: ml,
		proposeSourceRepair: hl,
		executeSourceRepair: gl,
		withdrawSourceRepair: _l,
		inspectRecovery: ru,
		recordSalesManualReview: Dy,
		closeVerifiedSalesReview: xc,
		previewTargetedRepair: Ml,
		proposeTargetedRepair: Nl,
		executeTargetedRepair: Pl
	},
	read: "audit.read",
	commands: {
		withdrawSourceRepair: "accounting.recover",
		previewSourceRepair: "audit.read",
		proposeSourceRepair: "accounting.recover",
		executeSourceRepair: "accounting.recover",
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
var Oy = t();
function ky(e) {
	Nt(gy, () => e()?.userId ?? ""), E.connect(e), vy.configureTrustedSession(e), wy(), Ty();
}
//#endregion
export { Rt as assertPostingPeriod, ky as initialize, Oy as workspaceDefaults };
